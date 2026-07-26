"use client";
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, FileText, MessageCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const MatchChatModal = ({ isOpen, onClose, match, userType, onSendProposal }) => {
  const supabase = createClient();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let subscription;

    const initializeChat = async () => {
      if (!isOpen || !match) return;
      setLoading(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);

        console.log("[Chat] Inicializando chat para el match:", match.id);

        // 1. Buscar si ya existe una conversación (USAMOS maybeSingle para evitar el error de Supabase)
        let currentConvId = null;
        const { data: existingConv, error: fetchError } = await supabase
          .from('conversations')
          .select('id')
          .eq('match_id', match.id)
          .maybeSingle();

        if (existingConv) {
          console.log("[Chat] Conversación existente encontrada:", existingConv.id);
          currentConvId = existingConv.id;
        } else {
          console.log("[Chat] No existe conversación. Creando una nueva...");
          const { data: newConv, error: convError } = await supabase
            .from('conversations')
            .insert({ match_id: match.id })
            .select('id')
            .single();

          if (convError) {
            console.error("[Chat] Error crítico al crear conversación:", convError);
          } else if (newConv) {
            console.log("[Chat] Conversación creada con éxito:", newConv.id);
            currentConvId = newConv.id;
          }
        }

        setConversationId(currentConvId);

        // 2. Cargar historial y suscribir a tiempo real
        if (currentConvId) {
          const { data: history } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', currentConvId)
            .order('created_at', { ascending: true });

          if (history) setMessages(history);

          subscription = supabase
            .channel(`chat-${currentConvId}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${currentConvId}`
              },
              (payload) => {
                setMessages((prev) => {
                  const exists = prev.find(m => m.id === payload.new.id);
                  if (exists) return prev;
                  return [...prev, payload.new];
                });
              }
            )
            .subscribe();
        }
      } catch (error) {
        console.error("Error al inicializar el chat:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [isOpen, match]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    if (!conversationId) {
      alert("Error: El chat no está conectado a la base de datos.");
      console.error("[Chat] Faltó el conversationId");
      return;
    }

    if (!currentUserId) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Limpiamos el input

    console.log("[Chat] Guardando mensaje en BD:", messageText);

    // Guardamos en la base de datos
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        body: messageText
      })
      .select()
      .single();

    if (error) {
      console.error("[Chat] ERROR al enviar mensaje:", error);
    } else if (data) {
      // Lo dibujamos en pantalla
      setMessages(prev => {
        const exists = prev.find(m => m.id === data.id);
        if (exists) return prev;
        return [...prev, data];
      });
    }
  };

  if (!isOpen || !match) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-3xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden shadow-2xl shadow-cyan-500/10">

        {/* Header del Chat */}
        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {match.profile.avatar.includes('http') ? (
              <img src={match.profile.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-cyan-500/50" />
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
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
          {loading ? (
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
          <div className="relative flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full bg-gray-800 border border-gray-700 text-white px-6 py-4 rounded-full focus:outline-none focus:border-cyan-500 pr-14"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !conversationId}
              className="absolute right-2 w-10 h-10 bg-cyan-500 text-white rounded-full flex items-center justify-center hover:bg-cyan-600 disabled:opacity-50 disabled:hover:bg-cyan-500 transition-all"
            >
              <Send size={18} className="ml-1" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default MatchChatModal;