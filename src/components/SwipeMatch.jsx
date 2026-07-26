import React, { useState, useEffect } from 'react';
import { X, Heart, Info, Star, MapPin, Users, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const SwipeMatch = ({ userType, onMatch }) => {
  const supabase = createClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPotentials = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setCurrentUserId(user.id);

        // Si soy Creador, busco Marcas ('brand'). Si soy Marca, busco Creadores ('creator').
        const targetRole = userType === 'creator' ? 'brand' : 'creator';

        // 1. Traer TODAS las interacciones donde el usuario esté involucrado (enviadas o recibidas)
        const { data: myInteractions } = await supabase
          .from('user_matches')
          .select('requester_id, target_id, status')
          .or(`requester_id.eq.${user.id},target_id.eq.${user.id}`);

        // Usamos un Set para no tener IDs duplicados
        const interactedIds = new Set();
        interactedIds.add(user.id); // Agregarnos a nosotros mismos para no salir en la lista

        myInteractions?.forEach(interaction => {
          if (interaction.requester_id === user.id) {
            // Si YO envié la solicitud (Like o X), excluyo a esa persona
            interactedIds.add(interaction.target_id);
          } else if (interaction.target_id === user.id) {
            // Si YO recibí la solicitud, reviso si ya le di respuesta
            // Si el status NO es 'pending', significa que ya hice match o la rechacé. La excluyo.
            if (interaction.status !== 'pending') {
              interactedIds.add(interaction.requester_id);
            }
          }
        });

        const excludeArray = Array.from(interactedIds);

        // 2. Buscar perfiles del rol objetivo que NO estén en la lista de interacciones
        let query = supabase
          .from('profiles')
          .select('*')
          .eq('user_role', targetRole);

        // Si hay personas que excluir, las sacamos de la consulta
        if (excludeArray.length > 0) {
          query = query.not('id', 'in', `(${excludeArray.join(',')})`);
        }

        const { data, error } = await query.limit(10); // Traemos de 10 en 10

        if (data) {
          setProfiles(data);
          setCurrentIndex(0); // Reiniciamos el índice visual
        }
      } catch (error) {
        console.error("Error al cargar perfiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPotentials();
  }, [userType]); // Quitamos 'supabase' de las dependencias para evitar recargas innecesarias

  const currentProfile = profiles[currentIndex];

  const handleSwipe = async (direction) => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    console.log(`[Swipe] Dando ${direction === 'right' ? 'Like' : 'X'} a:`, currentProfile.full_name || currentProfile.username);

    try {
      if (direction === 'right') {
        // 1. REVISAMOS SI LA OTRA PERSONA YA NOS HABÍA DADO LIKE
        const { data: existingMatch, error: fetchError } = await supabase
          .from('user_matches')
          .select('id')
          .eq('requester_id', currentProfile.id)
          .eq('target_id', currentUserId)
          .eq('status', 'pending')
          .maybeSingle();

        if (existingMatch) {
          console.log("[Swipe] ¡MATCH MUTUO ENCONTRADO! 🎉");

          // 2A. Como es mutuo, actualizamos la base de datos a 'accepted'
          const { data: updatedMatch, error: updateError } = await supabase
            .from('user_matches')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', existingMatch.id)
            .select()
            .single();

          if (!updateError && updatedMatch) {
            // Disparamos la celebración SÓLO porque ya es mutuo
            onMatch({
              matchId: updatedMatch.id,
              profile: currentProfile
            });
          }
        } else {
          console.log("[Swipe] Primer Like. Guardando como pendiente ⏳...");

          // 2B. Como es el primer like, sólo lo guardamos como 'pending'
          // NO llamamos a onMatch, así que NO aparece en la pestaña de chat todavía
          await supabase.from('user_matches').insert({
            requester_id: currentUserId,
            target_id: currentProfile.id,
            status: 'pending'
          });
        }
      } else {
        console.log("[Swipe] Guardando descarte (X) ❌...");
        // Si desliza a la izquierda (Descarte)
        await supabase.from('user_matches').insert({
          requester_id: currentUserId,
          target_id: currentProfile.id,
          status: 'rejected'
        });
      }
    } catch (error) {
      console.error("[Swipe] Error crítico en la función:", error);
    }

    // 3. SIN IMPORTAR QUÉ PASE, AVANZAMOS LA TARJETA
    // Esto hace que desaparezca de la pantalla Discover inmediatamente
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return <div className="text-center text-gray-400">Cargando perfiles...</div>;
  }

  if (!currentProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">You've seen everyone!</h2>
          <p className="text-gray-400">Check back later for new profiles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Card */}
      <div
        className={`relative bg-gray-900 border-2 border-cyan-500/30 rounded-3xl overflow-hidden transition-transform duration-300 ${swipeDirection === 'left' ? '-translate-x-[200%] rotate-[-30deg]' :
          swipeDirection === 'right' ? 'translate-x-[200%] rotate-[30deg]' : ''
          }`}
        style={{ height: '600px' }}
      >
        {/* Header Image */}
        <div className={`h-64 bg-gradient-to-br ${currentProfile.color} flex items-center justify-center relative`}>
          <div className="text-8xl">{currentProfile.logo || currentProfile.avatar}</div>

          {/* Verification Score */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
            <Shield className={`${currentProfile.verificationScore >= 90 ? 'text-green-400' :
              currentProfile.verificationScore >= 75 ? 'text-yellow-400' :
                'text-red-400'
              }`} size={16} />
            <span className="text-white font-bold text-sm">{currentProfile.verificationScore}% Trust</span>
          </div>

          {/* Red Flags Alert */}
          {currentProfile.redFlags && currentProfile.redFlags.length > 0 && (
            <div className="absolute top-4 left-4 bg-red-500/80 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
              <AlertTriangle size={16} className="text-white" />
              <span className="text-white font-bold text-xs">⚠️ Review Flags</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{currentProfile.name}</h2>
              <p className="text-cyan-400 text-lg mb-2">
                {currentProfile.industry || currentProfile.niche}
              </p>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-cyan-400 hover:text-cyan-300"
            >
              <Info size={24} />
            </button>
          </div>

          {!showInfo ? (
            <>
              <p className="text-gray-300 mb-4">{currentProfile.description}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-800 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Users size={14} />
                    {userType === 'creator' ? 'Budget' : 'Reach'}
                  </div>
                  <div className="text-white font-bold">
                    {userType === 'creator' ? currentProfile.budget : currentProfile.reach}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <MapPin size={14} />
                    Location
                  </div>
                  <div className="text-white font-bold text-sm">{currentProfile.location}</div>
                </div>

                {userType === 'brand' && (
                  <div className="bg-gray-800 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                      <TrendingUp size={14} />
                      Engagement
                    </div>
                    <div className="text-white font-bold">{currentProfile.engagement}</div>
                  </div>
                )}

                <div className="bg-gray-800 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Star size={14} />
                    Rating
                  </div>
                  <div className="text-white font-bold">{currentProfile.avgRating} ⭐</div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-2">
                {currentProfile.trustBadges.map((badge, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-xs font-semibold"
                  >
                    ✓ {badge}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* Detailed Info */}
              <div className="bg-gray-800 rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">Experience</h3>
                <p className="text-gray-400 text-sm">
                  {userType === 'creator'
                    ? `${currentProfile.pastCollabs} past collaborations`
                    : `${currentProfile.completedProjects} projects completed`
                  }
                </p>
              </div>

              {/* Red Flags */}
              {currentProfile.redFlags && currentProfile.redFlags.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Red Flags Detected
                  </h3>
                  <ul className="space-y-1">
                    {currentProfile.redFlags.map((flag, index) => (
                      <li key={index} className="text-red-300 text-sm">• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Safety Score */}
              <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-xl p-4">
                <h3 className="text-cyan-400 font-bold mb-2">🤖 AI Safety Analysis</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Profile Completeness</span>
                    <span className="text-white font-bold">
                      {currentProfile.verificationScore >= 90 ? '100%' : '85%'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Fraud Risk</span>
                    <span className={`font-bold ${currentProfile.verificationScore >= 90 ? 'text-green-400' :
                      currentProfile.verificationScore >= 75 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                      {currentProfile.verificationScore >= 90 ? 'Low' :
                        currentProfile.verificationScore >= 75 ? 'Medium' : 'High'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Recommendation</span>
                    <span className={`font-bold ${currentProfile.verificationScore >= 90 ? 'text-green-400' :
                      currentProfile.verificationScore >= 75 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                      {currentProfile.verificationScore >= 90 ? '✓ Trusted' :
                        currentProfile.verificationScore >= 75 ? '⚠️ Caution' : '❌ High Risk'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-8 mt-8">
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center hover:bg-red-500/30 hover:scale-110 transition-all"
        >
          <X size={32} className="text-red-500" />
        </button>

        <button
          onClick={() => handleSwipe('right')}
          className="w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center hover:bg-green-500/30 hover:scale-110 transition-all"
        >
          <Heart size={40} className="text-green-500" />
        </button>
      </div>

      {/* Counter */}
      <div className="text-center mt-6">
        <p className="text-gray-400 text-sm">
          {currentIndex + 1} / {profiles.length}
        </p>
      </div>
    </div>
  );
};

export default SwipeMatch;
