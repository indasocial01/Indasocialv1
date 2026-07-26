"use client";
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const Header = ({ title, subtitle }) => {
  const supabase = createClient();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos en tiempo real desde la tabla profiles de Supabase
  useEffect(() => {
    const getProfileData = async () => {
      try {
        // 1. Obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // 2. Traer su información desde la base de datos coincidiendo las llaves
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, user_role, niche, industry, reach, avatar_url')
            .eq('id', user.id)
            .single();

          if (data) {
            setProfile(data);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos en el Header:', error);
      } finally {
        setLoading(false);
      }
    };

    getProfileData();

    // Opcional: Escuchar si cambian los datos en tiempo real (Realtime)
    const profileSubscription = supabase
      .channel('header-profile-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', scheme: 'public', table: 'profiles' },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, [supabase]);

  // Manejar el cierre de sesión real con Supabase Auth
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  // Si está cargando o no hay perfil, mostramos un esqueleto básico o null
  if (loading || !profile) {
    return (
      <div className="border-b border-cyan-500/20 px-8 py-4 bg-gradient-to-r from-black to-gray-900 h-20 animate-pulse" />
    );
  }

  // Mapeamos los datos reales a la UI basados en tu esquema SQL en español/inglés
  const userData = {
    name: profile.full_name || 'Usuario',
    role: profile.user_role === 'creator' ? 'Creator' : 'Brand',
    // Si es creador muestra su nicho, si es marca muestra su industria
    category: profile.user_role === 'creator' ? profile.niche : profile.industry,
    avatarUrl: profile.avatar_url,
    reach: Number(profile.reach).toLocaleString(), // Formatea números grandes como "1,500,000"
    color: profile.user_role === 'creator' ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500'
  };

  return (
    <div className="border-b border-cyan-500/20 px-8 py-4 bg-gradient-to-r from-black to-gray-900">
      <div className="flex items-center justify-between">
        <div>
          {title && <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>}
          {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-cyan-500/10 rounded-lg transition-colors">
            <Search size={24} className="text-cyan-400" />
          </button>
          
          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all border-2 border-cyan-500 glow-cyan"
            >
              {userData.avatarUrl ? (
                <img 
                  src={userData.avatarUrl} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className={`w-10 h-10 bg-gradient-to-br ${userData.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left hidden md:block">
                <div className="text-white font-semibold text-sm">{userData.name}</div>
                <div className="text-cyan-400 text-xs">{userData.role}</div>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-cyan-500/30 rounded-xl shadow-xl overflow-hidden z-50 animate-fadeIn">
                <div className="p-4 border-b border-cyan-500/20 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="flex items-center gap-3 mb-3">
                    {userData.avatarUrl ? (
                      <img 
                        src={userData.avatarUrl} 
                        alt="Avatar Menu" 
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-14 h-14 bg-gradient-to-br ${userData.color} rounded-full flex items-center justify-center text-white text-xl font-bold`}>
                        {userData.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-white font-bold truncate max-w-[150px]">{userData.name}</div>
                      <div className="text-cyan-400 text-sm truncate max-w-[150px]">{userData.category || 'General'}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20">
                    <span className="text-gray-400 text-xs">Reach</span>
                    <span className="text-white font-bold">{userData.reach}</span>
                  </div>
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => { router.push(`/${profile.user_role}/profile`); setShowUserMenu(false); }}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-lg transition-all"
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => { router.push('/settings'); setShowUserMenu(false); }}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 rounded-lg transition-all"
                  >
                    Account Settings
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;