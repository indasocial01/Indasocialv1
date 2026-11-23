"use client";
import React, { useState, useEffect, useId, useRef } from 'react';
import { X, Send, FileText, MessageCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { hasRestrictedChatContent } from './chatModeration';

const messageColumns = 'id, sender_id, body, created_at';

function mergeMessages(previous, incoming) {
  const byId = new Map(previous.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort((left, right) => left.created_at.localeCompare(right.created_at));
}

function MatchChat({ onClose, match, userType, onSendProposal }) {
  const [supabase] = useState(createClient);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [session, setSession] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const messagesEndRef = useRef(null);
  const chatInstanceId = useId();
  const matchId = match.id;
  const currentUserId = session?.userId;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let active = true;
    let channel;

    function reportLoadError(step, error) {
      if (!active) return;
      console.warn(`[Chat] Error al ${step}`, error);
      setLoadError({ step, code: error.code });
    }

    async function initialize() {
      let step = 'verificar la sesión';
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw authError || new Error('Missing user');
        if (!active) return;

        step = 'buscar la conversación';
        const findConversation = () => supabase
          .from('conversations').select('id').eq('match_id', matchId).maybeSingle();

        const { data: existing, error: lookupError } = await findConversation();
        if (lookupError) throw lookupError;
        if (!active) return;

        let conversation = existing;
        if (!conversation) {
          step = 'crear la conversación';
          const { data: created, error: createError } = await supabase
            .from('conversations').insert({ match_id: matchId }).select('id').single();

          if (createError?.code === '23505') {
            const { data: concurrent, error: retryError } = await findConversation();
            if (retryError || !concurrent) throw retryError || createError;
            conversation = concurrent;
          } else {
            if (createError) throw createError;
            conversation = created;
          }
        }
        if (!active) return;

        async function loadHistory() {
          const { data, error } = await supabase
            .from('messages')
            .select(messageColumns)
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .order('id', { ascending: false })
            .limit(100);

          if (!active) return;
          if (error) {
            reportLoadError('cargar los mensajes', error);
            return;
          }
          setMessages((previous) => mergeMessages(previous, data.slice().reverse()));
          setLoadError(null);
          setSession({ conversationId: conversation.id, userId: user.id });
        }

        try {
          channel = supabase.channel(`chat-${conversation.id}-${chatInstanceId}-${attempt}`);
          channel
            .on('postgres_changes', {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${conversation.id}`,
            }, ({ new: message }) => {
              if (active) setMessages((previous) => mergeMessages(previous, [message]));
            })
            .subscribe((status) => {
              if (active && status === 'SUBSCRIBED') {
                void loadHistory().catch((error) => reportLoadError('cargar los mensajes', error));
              }
            });
        } catch (error) {
          console.warn('[Chat] No se pudo iniciar el canal en tiempo real', error);
        }

        step = 'cargar los mensajes';
        await loadHistory();
      } catch (error) {
        reportLoadError(step, error);
      }
    }

    void initialize();
    return () => {
      active = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [supabase, matchId, chatInstanceId, attempt]);

  async function handleSendMessage(event) {
    event.preventDefault();
    const body = newMessage.trim();
    if (!body || !session || sending) return;

    if (hasRestrictedChatContent(body)) {
      setSendError('El mensaje incluye datos de contacto o un enlace restringido. Edítalo para enviarlo.');
      return;
    }

    setSending(true);
    setSendError('');
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({ conversation_id: session.conversationId, sender_id: currentUserId, body })
        .select(messageColumns)
        .single();

      if (error) {
        setSendError('No se pudo enviar el mensaje. Inténtalo de nuevo.');
        return;
      }

      setMessages((previous) => mergeMessages(previous, [data]));
      setNewMessage('');
    } catch {
      setSendError('No se pudo enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div role="dialog" aria-modal="true" aria-label={`Chat con ${match.profile.name}`} className="bg-gray-900 border border-cyan-500/30 rounded-3xl w-full max-w-2xl h-[600px] max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden shadow-2xl shadow-cyan-500/10">

        {/* Header del Chat */}
        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {match.profile.avatar?.startsWith('http') ? (
              <img src={match.profile.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-cyan-500/50" />
            ) : (
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${match.profile.color} flex items-center justify-center text-xl font-bold`}>
                {match.profile.logo || match.profile.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-white font-bold">{match.profile.name}</h3>
              <p className="text-cyan-400 text-xs">{match.profile.industry || match.profile.niche}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userType === 'brand' && (
              <button
                onClick={() => onSendProposal(match)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <FileText size={16} />
                <span className="hidden sm:inline">Enviar Propuesta</span>
              </button>
            )}
            <button type="button" aria-label="Cerrar chat" onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
          {loadError ? (
            <div role="alert" className="space-y-2 text-red-300">
              <p>Error al {loadError.step}{loadError.code ? ` (${loadError.code})` : ''}.</p>
              <button className="text-cyan-400" onClick={() => {
                setLoadError(null);
                setSession(null);
                setAttempt((previous) => previous + 1);
              }}>Reintentar</button>
            </div>
          ) : !session ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle size={48} className="mb-2 opacity-50" />
              <p>No hay mensajes aún.</p>
              <p className="text-sm">¡Escribe el primer mensaje para romper el hielo!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-5 py-3 ${isMine
                        ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-sm'
                      }`}
                  >
                    <p className="break-words">{msg.body}</p>
                    <span className={`text-[10px] mt-1 block ${isMine ? 'text-cyan-200 text-right' : 'text-gray-500'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Mensaje */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-gray-900">
          <p className="mb-2 text-xs text-gray-400">Se bloquean teléfonos, correos, usuarios con @ y enlaces de WhatsApp e Instagram.</p>
          {sendError && <p role="alert" className="mb-2 text-sm text-red-300">{sendError}</p>}
          <div className="relative flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              aria-label="Mensaje"
              maxLength={2000}
              readOnly={sending}
              className="w-full bg-gray-800 border border-gray-700 text-white px-6 py-4 rounded-full focus:outline-none focus:border-cyan-500 pr-14"
            />
            <button
              type="submit"
              aria-label="Enviar mensaje"
              disabled={!newMessage.trim() || !session || loadError || sending}
              className="absolute right-2 w-10 h-10 bg-cyan-500 text-white rounded-full flex items-center justify-center hover:bg-cyan-600 disabled:opacity-50 disabled:hover:bg-cyan-500 transition-all"
            >
              <Send size={18} className="ml-1" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default function MatchChatModal({ isOpen, match, ...props }) {
  if (!isOpen || !match) return null;
  return <MatchChat key={match.id} match={match} {...props} />;
}
