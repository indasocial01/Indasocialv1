"use client";
import React, { useState, useEffect } from 'react';
import { X, Heart, Star, MapPin } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const SwipeMatch = ({ userType, onMatch }) => {
  const supabase = createClient();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchPotentials = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setLoading(false);
          return;
        }
        
        setCurrentUserId(user.id);

        // Si soy Creador, busco Marcas ('brand'). Si soy Marca, busco Creadores ('creator').
        const targetRole = userType === 'creator' ? 'brand' : 'creator';

        // 1. Obtener todas las interacciones previas del usuario de forma segura
        const { data: myInteractions, error: matchesErr } = await supabase
          .from('user_matches')
          .select('requester_id, target_id, status')
          .or(`requester_id.eq.${user.id},target_id.eq.${user.id}`);

        if (matchesErr) {
          console.error("[SwipeMatch] Error al consultar interacciones:", matchesErr);
        }

        // Usamos Set para evitar duplicados y nos aseguramos de que myInteractions sea array
        const interactedIds = new Set();
        interactedIds.add(user.id); // Excluirse a sí mismo

        const safeInteractions = Array.isArray(myInteractions) ? myInteractions : [];

        safeInteractions.forEach(interaction => {
          if (interaction.requester_id === user.id) {
            interactedIds.add(interaction.target_id);
          } else if (interaction.target_id === user.id) {
            if (interaction.status !== 'pending') {
              interactedIds.add(interaction.requester_id);
            }
          }
        });

        const excludeArray = Array.from(interactedIds);

        // 2. Buscar perfiles excluyendo a los que ya fueron procesados
        let query = supabase
          .from('profiles')
          .select('*')
          .eq('user_role', targetRole);

        if (excludeArray.length > 0) {
          query = query.not('id', 'in', `(${excludeArray.join(',')})`);
        }

        const { data: profilesData, error: profilesErr } = await query.limit(10);
        
        if (profilesErr) {
          console.error("[SwipeMatch] Error al consultar perfiles:", profilesErr);
          setProfiles([]);
        } else {
          // Garantizamos que profilesData sea siempre un arreglo
          setProfiles(Array.isArray(profilesData) ? profilesData : []);
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error("[SwipeMatch] Error crítico en fetchPotentials:", error);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPotentials();
  }, [userType]);

  const handleSwipe = async (direction) => {
    if (!Array.isArray(profiles) || currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    try {
      if (direction === 'right') {
        // Revisar si la otra persona ya nos dio like
        const { data: existingMatch } = await supabase
          .from('user_matches')
          .select('id')
          .eq('requester_id', currentProfile.id)
          .eq('target_id', currentUserId)
          .eq('status', 'pending')
          .maybeSingle();

        if (existingMatch) {
          // Match mutuo
          const { data: updatedMatch, error: updateError } = await supabase
            .from('user_matches')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', existingMatch.id)
            .select()
            .single();

          if (!updateError && updatedMatch && onMatch) {
            onMatch({
              matchId: updatedMatch.id,
              profile: currentProfile
            });
          }
        } else {
          // Primer like
          await supabase.from('user_matches').insert({
            requester_id: currentUserId,
            target_id: currentProfile.id,
            status: 'pending'
          });
        }
      } else {
        // Descarte
        await supabase.from('user_matches').insert({
          requester_id: currentUserId,
          target_id: currentProfile.id,
          status: 'rejected'
        });
      }
    } catch (error) {
      console.error("[SwipeMatch] Error al procesar swipe:", error);
    }

    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!Array.isArray(profiles) || profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center bg-gray-900 border border-cyan-500/20 rounded-3xl p-8 text-center max-w-md mx-auto">
        <div className="text-6xl mb-4 animate-bounce">🌍</div>
        <h2 className="text-2xl font-bold text-white mb-2">¡No hay más perfiles!</h2>
        <p className="text-gray-400 text-sm">Has explorado a todos en tu radar. Vuelve más tarde cuando se unan nuevos usuarios.</p>
      </div>
    );
  }

  const profile = profiles[currentIndex];
  const cardColor = profile?.user_role === 'creator' ? 'from-purple-600 to-pink-600' : 'from-blue-600 to-cyan-600';
  const category = profile?.industry || profile?.niche || 'General';

  return (
    <div className="max-w-md mx-auto">
      <div className="relative h-[520px] bg-gray-900 rounded-3xl overflow-hidden border border-gray-700 shadow-2xl shadow-cyan-500/10">
        {profile?.avatar_url && profile.avatar_url.includes('http') ? (
          <img src={profile.avatar_url} alt="Profile" className="w-full h-[65%] object-cover" />
        ) : (
          <div className={`w-full h-[65%] bg-gradient-to-br ${cardColor} flex items-center justify-center`}>
            <span className="text-8xl text-white font-bold">{profile?.full_name?.charAt(0) || '👤'}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{profile?.full_name || profile?.username || 'Usuario'}</h2>
              <div className="flex items-center gap-2 text-cyan-400">
                <MapPin size={16} />
                <span className="text-sm font-semibold">{profile?.location || 'Ubicación global'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs text-white border border-white/20">
              {category}
            </span>
            {profile?.avg_rating > 0 && (
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs text-white border border-white/20 flex items-center gap-1">
                <Star size={12} className="text-yellow-400" />
                {profile.avg_rating}
              </span>
            )}
            {profile?.verification_score >= 90 && (
              <span className="px-3 py-1 bg-green-500/20 backdrop-blur-md rounded-full text-xs text-green-400 border border-green-500/20">
                ✓ Verificado
              </span>
            )}
          </div>

          <p className="text-gray-300 text-xs line-clamp-2">
            {profile?.bio || `Interesado en conectar e iniciar proyectos.`}
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-6">
        <button 
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 bg-gray-900 border-2 border-red-500/50 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500/10 hover:scale-110 transition-all shadow-lg shadow-red-500/20"
        >
          <X size={32} />
        </button>
        <button 
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 bg-gray-900 border-2 border-green-500/50 rounded-full flex items-center justify-center text-green-500 hover:bg-green-500/10 hover:scale-110 transition-all shadow-lg shadow-green-500/20"
        >
          <Heart size={32} />
        </button>
      </div>
    </div>
  );
};
export default SwipeMatch;