'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import MatchChatModal from '../components/MatchChatModal';
import ProposalModal from '../components/ProposalModal';
import { loadAcceptedMatches } from '../components/loadAcceptedMatches';

export default function MatchChat({ userId, userType }) {
  const [supabase] = useState(createClient);
  const [result, setResult] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [proposalMatch, setProposalMatch] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    loadAcceptedMatches(supabase, userId)
      .then((matches) => {
        if (active) setResult({ matches });
      })
      .catch(() => {
        if (active) setResult({ error: true });
      });

    return () => { active = false; };
  }, [supabase, userId, attempt]);

  return (
    <main className="min-w-0 flex-1 p-4 text-white md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Chat</h1>
      {!result && <p role="status" className="text-gray-400">Cargando conversaciones…</p>}
      {result?.error && (
        <div role="alert" className="space-y-2">
          <p className="text-red-300">No se pudieron cargar las conversaciones.</p>
          <button className="text-cyan-400" onClick={() => {
            setResult(null);
            setAttempt((previous) => previous + 1);
          }}>Reintentar</button>
        </div>
      )}
      {result?.matches?.length === 0 && (
        <p className="text-gray-400">Tus matches aceptados aparecerán aquí.</p>
      )}
      <ul className="max-w-2xl space-y-3">
        {result?.matches?.map((match) => (
          <li key={match.id}>
            <button
              type="button"
              onClick={() => setSelectedMatch(match)}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 text-left hover:border-cyan-500"
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold ${match.profile.color}`}>
                {match.profile.logo}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold">{match.profile.name}</span>
              <MessageCircle size={20} className="shrink-0 text-cyan-400" />
            </button>
          </li>
        ))}
      </ul>
      <MatchChatModal
        isOpen={Boolean(selectedMatch)}
        match={selectedMatch}
        userType={userType}
        onClose={() => setSelectedMatch(null)}
        onSendProposal={(match) => {
          setSelectedMatch(null);
          setProposalMatch(match);
        }}
      />
      <ProposalModal
        isOpen={Boolean(proposalMatch)}
        match={proposalMatch}
        userType={userType}
        onClose={() => setProposalMatch(null)}
      />
    </main>
  );
}
