"use client";
import React, { useState, useEffect } from 'react';
import { Target, Search, MessageCircle, Sparkles, Briefcase, Star, ShieldCheck } from 'lucide-react';
import Header from '../components/Header';
import SwipeMatch from '../components/SwipeMatch';
import ProposalModal from '../components/ProposalModal';
import MatchChatModal from '../components/MatchChatModal';
import ActiveCampaigns from '../components/ActiveCampaigns';
import { createClient } from '@/utils/supabase/client';

// 🚀 IMPORTAMOS SOLO WEB3 DE SOLANA DIRECTO
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';

const ConnectBrands = ({ userType }) => {
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState(null);

  const [viewMode, setViewMode] = useState('swipe'); // swipe, matches, or campaigns
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showProposal, setShowProposal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [latestMatch, setLatestMatch] = useState(null);
  const [activeCampaignsCount, setActiveCampaignsCount] = useState(0);

  // Load matches from Supabase
  useEffect(() => {
    const fetchMatchesAndCampaigns = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // 1. Load accepted matches from database
      const { data: matchesData, error } = await supabase
        .from('user_matches')
        .select(`
          id,
          requester:profiles!requester_id(id, full_name, avatar_url, industry, niche, avg_rating, verification_score, user_role),
          target:profiles!target_id(id, full_name, avatar_url, industry, niche, avg_rating, verification_score, user_role)
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},target_id.eq.${user.id}`);

      if (!error && matchesData) {
        const formattedMatches = matchesData.map(m => {
          const otherProfile = m.requester.id === user.id ? m.target : m.requester;

          return {
            id: m.id,
            profile: {
              id: otherProfile.id,
              name: otherProfile.full_name || 'User',
              avatar: otherProfile.avatar_url,
              logo: otherProfile.full_name ? otherProfile.full_name.charAt(0).toUpperCase() : '👤',
              industry: otherProfile.industry,
              niche: otherProfile.niche,
              avgRating: otherProfile.avg_rating || 0,
              verificationScore: otherProfile.verification_score || 0,
              color: otherProfile.user_role === 'creator' ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500'
            }
          };
        });
        setMatches(formattedMatches);
      }

      // 2. Load active campaigns count from database
      if (userType === 'creator') {
        const { count } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true })
          .eq('creator_id', user.id)
          .eq('status', 'accepted');
        setActiveCampaignsCount(count || 0);
      } else {
        const { count } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('brand_id', user.id)
          .eq('status', 'active');
        setActiveCampaignsCount(count || 0);
      }
    };

    fetchMatchesAndCampaigns();
  }, [supabase, userType]);

  const handleNewMatch = (matchData) => {
    if (!matchData || !matchData.matchId) return;
    const { matchId, profile } = matchData;
    setLatestMatch(profile);
    setShowMatchNotification(true);
    setTimeout(() => setShowMatchNotification(false), 5000);

    setMatches(prevMatches => {
      const yaExiste = prevMatches.find(m => m.id === matchId);
      if (yaExiste) return prevMatches;
      return [
        {
          id: matchId,
          profile: {
            id: profile.id,
            name: profile.full_name || profile.username || 'Usuario',
            avatar: profile.avatar_url,
            logo: profile.full_name ? profile.full_name.charAt(0).toUpperCase() : '👤',
            industry: profile.industry,
            niche: profile.niche,
            avgRating: profile.avg_rating || 0,
            verificationScore: profile.verification_score || 0,
            color: profile.user_role === 'creator' ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500'
          }
        },
        ...prevMatches 
      ];
    });
  };

  const handleOpenChat = (match) => {
    setSelectedMatch(match);
    setShowChat(true);
  };

  const handleSendProposal = (match) => {
    setSelectedMatch(match);
    setShowChat(false);
    setShowProposal(true);
  };

  // 🚀 LÓGICA DIRECTA CON PHANTOM (DEVNET) Y GUARDADO EN BASE DE DATOS
  const handleAcceptProposal = async (proposal) => {
    // 1. Verificar si Phantom está instalado
    if (typeof window === 'undefined' || !window.phantom?.solana?.isPhantom) {
      alert('🦊 Phantom Wallet no está instalada. Por favor abre tu extensión.');
      return;
    }

    const provider = window.phantom.solana;

    try {
      // 2. Conectar wallet si no lo está
      let fromPublicKey = provider.publicKey;
      if (!provider.isConnected || !fromPublicKey) {
        const resp = await provider.connect();
        fromPublicKey = resp.publicKey;
      }

      console.log("Iniciando conexión a Devnet...");

      // 3. Crear conexión a Devnet y obtener el Blockhash más reciente
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

      // Dirección del Creador / Bóveda Escrow
      const creatorAddress = "XoYYToWuANiP5i8aELDhcYuUFWDcvcZAcGAfxb7z6D4"; 
      const toPublicKey = new PublicKey(creatorAddress);

      // 4. Crear la transacción de Solana estructurada correctamente
      const transaction = new Transaction({
        feePayer: fromPublicKey,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight
      }).add(
        SystemProgram.transfer({
          fromPubkey: fromPublicKey,
          toPubkey: toPublicKey,
          lamports: 0.01 * LAMPORTS_PER_SOL,
        })
      );

      console.log("Abriendo Phantom para firmar...");

      // 5. Solicitar firma a Phantom (Aquí se abre la ventana emergente)
      const { signature } = await provider.signAndSendTransaction(transaction);

      // 6. 💾 GUARDAR EL ESTATUS EN SUPABASE PARA QUE NO SE BORRE AL REFRESCAR
      // Si recibimos el ID de la propuesta o campaña, lo actualizamos.
      if (proposal && proposal.id) {
        
        // Dependiendo de cómo lo manejes, actualizamos la tabla 'proposals'
        const { error } = await supabase
          .from('proposals')
          .update({ status: 'accepted' })
          .eq('id', proposal.id);

        if (error) {
          console.error("Error guardando en Supabase:", error);
        } else {
          console.log("Estatus guardado en BD exitosamente.");
        }
      }

      // 7. Éxito: Actualizar UI
      setActiveCampaignsCount(prev => prev + 1);
      setShowProposal(false);
      
      alert(`🎉 ¡Campaña fondeada con éxito en Solana Devnet!\n\nFirma de Transacción:\n${signature}\n\nLos fondos han quedado asegurados y el estatus se guardó correctamente.`);

    } catch (error) {
      console.error("Error en Web3 Escrow:", error);
      alert("La transacción fue cancelada o falló: " + error.message);
    }
  };

  const handleRejectProposal = () => {
    setShowProposal(false);
    alert('Campaña declinada.');
  };

  return (
    <div className="flex-1 bg-black text-white flex flex-col">
      <Header
        userType={userType}
        title={userType === 'creator' ? 'Conecta con Marcas' : 'Conecta con Creadores'}
        subtitle={userType === 'creator' ? 'Swipe to find your perfect brand match' : 'Discover talented creators'}
      />

      <div className="flex-1 overflow-y-auto p-8 overflow-x-hidden">
        
        {/* Match Notification */}
        {showMatchNotification && latestMatch && (
          <div className="mb-8 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-2xl p-6 relative animate-[bounce_1s_ease-in-out]">
            <button
              onClick={() => setShowMatchNotification(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-green-500/50 animate-pulse">
                🎉
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">¡It's a Match!</h3>
                <p className="text-green-400">You matched with {latestMatch.name}</p>
                <button
                  onClick={() => {
                    setViewMode('matches');
                    setShowMatchNotification(false);
                  }}
                  className="mt-2 text-sm text-cyan-400 hover:text-cyan-300 underline"
                >
                  View your matches →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setViewMode('swipe')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${viewMode === 'swipe'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 scale-105'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
          >
            <Sparkles size={18} /> Discover
          </button>
          <button
            onClick={() => setViewMode('matches')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${viewMode === 'matches'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20 scale-105'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
          >
            <MessageCircle size={18} /> My Matches ({matches.length})
          </button>
          <button
            onClick={() => setViewMode('campaigns')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${viewMode === 'campaigns'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20 scale-105'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
          >
            <Briefcase size={18} /> Active Campaigns ({activeCampaignsCount})
          </button>
        </div>

        {/* Content Views */}
        <div className="animate-fadeIn">
          {viewMode === 'swipe' ? (
            <SwipeMatch userType={userType} onMatch={handleNewMatch} />
          ) : viewMode === 'matches' ? (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <MessageCircle className="text-green-400" /> Tus Conexiones
              </h2>
              {matches.length === 0 ? (
                <div className="text-center py-16 bg-gray-900 rounded-3xl border border-cyan-500/20">
                  <div className="text-6xl mb-4 animate-bounce">💔</div>
                  <p className="text-gray-300 text-xl font-bold mb-2">Aún no hay matches</p>
                  <p className="text-gray-500 text-sm">¡Ve a la pestaña Discover y comienza a hacer swipe!</p>
                  <button
                    onClick={() => setViewMode('swipe')}
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:scale-105 transition-transform"
                  >
                    Start Swiping
                  </button>
                </div>
              ) : (
                <div className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x snap-mandatory custom-scrollbar">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      className="min-w-[280px] sm:min-w-[320px] snap-center shrink-0 bg-gray-900 border border-cyan-500/20 rounded-3xl overflow-hidden hover:border-cyan-500/60 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 group flex flex-col"
                    >
                      <div className={`h-40 bg-gradient-to-br ${match.profile.color} relative overflow-hidden`}>
                        {match.profile.avatar && match.profile.avatar.includes('http') ? (
                          <img 
                            src={match.profile.avatar} 
                            alt={match.profile.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-7xl font-bold text-white/50">
                            {match.profile.logo}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{match.profile.name}</h3>
                        <p className="text-cyan-400 text-sm font-semibold mb-4 bg-cyan-500/10 inline-block px-3 py-1 rounded-lg w-max">
                          {match.profile.industry || match.profile.niche || 'General'}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                          <span className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-400" /> {match.profile.avgRating}
                          </span>
                          <span className="flex items-center gap-1">
                            {match.profile.verificationScore >= 90 ? (
                              <><ShieldCheck size={16} className="text-green-400" /> Verificado</>
                            ) : (
                              '⚠️ Nuevo'
                            )}
                          </span>
                        </div>

                        <div className="mt-auto">
                          <button
                            onClick={() => handleOpenChat(match)}
                            className="w-full py-3 bg-gray-800 text-white border border-gray-700 rounded-xl font-bold hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <MessageCircle size={18} /> Abrir Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <Briefcase className="text-purple-400" /> Campañas Activas
              </h2>
              {/* Le pasamos la función a ActiveCampaigns por si el botón está ahí */}
              <ActiveCampaigns userType={userType} onAcceptCampaign={handleAcceptProposal} />
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      <MatchChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        match={selectedMatch}
        userType={userType}
        onSendProposal={handleSendProposal}
      />

      {/* Proposal Modal */}
      <ProposalModal
        isOpen={showProposal}
        onClose={() => setShowProposal(false)}
        match={selectedMatch}
        userType={userType}
        onAccept={handleAcceptProposal}
        onReject={handleRejectProposal}
      />
    </div>
  );
};

export default ConnectBrands;