"use client";
import React, { useState, useEffect } from 'react';
import { Target, Search, MessageCircle, Sparkles, Briefcase } from 'lucide-react';
import Header from '../components/Header';
import SwipeMatch from '../components/SwipeMatch';
import ProposalModal from '../components/ProposalModal';
import MatchChatModal from '../components/MatchChatModal';
import ActiveCampaigns from '../components/ActiveCampaigns';
import { createClient } from '@/utils/supabase/client';

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

  // Load matches from Supabase instead of localStorage
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
          // Identify the other person in the match
          const otherProfile = m.requester.id === user.id ? m.target : m.requester;

          return {
            id: m.id,
            profile: {
              id: otherProfile.id,
              name: otherProfile.full_name || 'User',
              avatar: otherProfile.avatar_url || '👤',
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

  // Recibimos el objeto desestructurado que manda SwipeMatch
  const handleNewMatch = (matchData) => {
    console.log("[ConnectBrands] Datos recibidos del Swipe:", matchData);

    // Verificamos que sí nos haya llegado el ID de la base de datos
    if (!matchData || !matchData.matchId) {
      console.error("[ConnectBrands] 🚨 ALERTA: No llegó el matchId real.");
      return;
    }

    const { matchId, profile } = matchData;

    setLatestMatch(profile);
    setShowMatchNotification(true);

    setTimeout(() => {
      setShowMatchNotification(false);
    }, 5000);

    setMatches(prevMatches => {
      // 🛡️ PROTECCIÓN ANTI-DUPLICADOS: Si el match ya existe, no lo volvemos a meter
      const yaExiste = prevMatches.find(m => m.id === matchId);
      if (yaExiste) {
        console.log("[ConnectBrands] El match ya estaba en la lista visual, ignorando duplicado.");
        return prevMatches;
      }

      console.log("[ConnectBrands] Agregando a Mis Matches con ID Oficial:", matchId);
      return [
        ...prevMatches,
        {
          id: matchId,
          profile: {
            id: profile.id,
            name: profile.full_name || profile.username || 'Usuario',
            avatar: profile.avatar_url || '👤',
            logo: profile.full_name ? profile.full_name.charAt(0).toUpperCase() : '👤',
            industry: profile.industry,
            niche: profile.niche,
            avgRating: profile.avg_rating || 0,
            verificationScore: profile.verification_score || 0,
            color: profile.user_role === 'creator' ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500'
          }
        }
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

  const handleAcceptProposal = async (proposal) => {
    // 💡 Logic to save the proposal in Supabase goes here
    // await supabase.from('proposals').update({ status: 'accepted' }).eq('id', proposal.id);

    setActiveCampaignsCount(prev => prev + 1);
    setShowProposal(false);
    alert('🎉 Proposal accepted! Campaign started. View in "Active Campaigns" tab.');
  };

  const handleRejectProposal = () => {
    setShowProposal(false);
    alert('Proposal declined.');
  };

  return (
    <div className="flex-1 bg-black text-white flex flex-col">
      <Header
        userType={userType}
        title={userType === 'creator' ? 'Conecta con Marcas' : 'Conecta con Creadores'}
        subtitle={userType === 'creator' ? 'Swipe to find your perfect brand match' : 'Discover talented creators'}
      />

      <div className="flex-1 overflow-y-auto p-8">
        {/* Match Notification */}
        {showMatchNotification && latestMatch && (
          <div className="mb-8 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-2xl p-6 relative animate-pulse">
            <button
              onClick={() => setShowMatchNotification(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-3xl">
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
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setViewMode('swipe')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${viewMode === 'swipe'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
          >
            <Sparkles size={18} />
            Discover
          </button>
          <button
            onClick={() => setViewMode('matches')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${viewMode === 'matches'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
          >
            <MessageCircle size={18} />
            My Matches ({matches.length})
          </button>
          <button
            onClick={() => setViewMode('campaigns')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${viewMode === 'campaigns'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
              : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
              }`}
          >
            <Briefcase size={18} />
            Active Campaigns ({activeCampaignsCount})
          </button>
        </div>

        {/* Content */}
        {viewMode === 'swipe' ? (
          <SwipeMatch userType={userType} onMatch={handleNewMatch} />
        ) : viewMode === 'matches' ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Matches</h2>
            {matches.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 rounded-2xl border border-cyan-500/20">
                <div className="text-6xl mb-4">💔</div>
                <p className="text-gray-400 text-lg mb-2">No matches yet</p>
                <p className="text-gray-500 text-sm">Start swiping to find your perfect match!</p>
                <button
                  onClick={() => setViewMode('swipe')}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600"
                >
                  Start Swiping
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-gray-900 border border-cyan-500/30 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all"
                  >
                    <div className={`h-32 bg-gradient-to-br ${match.profile.color} flex items-center justify-center`}>
                      <div className="text-6xl">{match.profile.logo || match.profile.avatar}</div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-white mb-1">{match.profile.name}</h3>
                      <p className="text-cyan-400 text-sm mb-3">
                        {match.profile.industry || match.profile.niche}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                        <span>⭐ {match.profile.avgRating}</span>
                        <span>•</span>
                        <span>
                          {match.profile.verificationScore >= 90 ? '✓ Trusted' : '⚠️ Review'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenChat(match)}
                        className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={16} />
                        Open Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">Active Campaigns</h2>
            <ActiveCampaigns userType={userType} />
          </div>
        )}
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