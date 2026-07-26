"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [supabase] = useState(() => createClient());

  const normalizeUser = (authUser, profile = null) => {
    if (!authUser) return null;

    const fullName = profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
    const username = profile?.username || authUser.user_metadata?.username || fullName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const userType = profile?.user_role || authUser.user_metadata?.user_role || 'creator';

    return {
      id: authUser.id,
      uid: authUser.id,
      email: authUser.email,
      name: fullName,
      username,
      avatar: profile?.avatar_url || authUser.user_metadata?.avatar_url || authUser.user_metadata?.avatar || '👤',
      type: userType,
      category: profile?.industry || profile?.niche || (userType === 'brand' ? 'Brand' : 'Creator'),
      reach: profile?.reach ?? 0,
      indaBalance: profile?.token_balance ?? 0,
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
      raw: authUser,
      profile,
    };
  };

  const clearSession = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    localStorage.removeItem('indasocial_user');
    localStorage.removeItem('indasocial_onboarding');
  };

  const syncSessionFromSupabase = async (session) => {
    try {
      if (!session?.user) {
        clearSession();
        setIsAuthReady(true);
        return;
      }

      let profileData = null;
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.warn('No se pudo cargar el perfil:', profileError.message);
      }

      if (existingProfile) {
        profileData = existingProfile;
      } else {
        const baseUsername = (session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const { data: createdProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            username: baseUsername,
            avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.avatar || null,
            user_role: session.user.user_metadata?.user_role || 'creator',
            onboarding_complete: false,
            token_balance: 0,
          })
          .select('*')
          .single();

        if (insertError) {
          console.warn('No se pudo crear el perfil:', insertError.message);
        } else {
          profileData = createdProfile;
        }
      }

      const user = normalizeUser(session.user, profileData);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setHasCompletedOnboarding(Boolean(profileData?.onboarding_complete));
      localStorage.setItem('indasocial_user', JSON.stringify(user));
      localStorage.setItem('indasocial_onboarding', profileData?.onboarding_complete ? 'true' : 'false');
      setAuthError('');
    } catch (error) {
      console.warn('No se pudo restaurar la sesión de Supabase:', error);
      clearSession();
    } finally {
      setIsAuthReady(true);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        await syncSessionFromSupabase(session);
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        syncSessionFromSupabase(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const login = () => {
    setAuthError('Please sign in with Google to continue.');
    return false;
  };

  const completeOnboarding = async (userType) => {
    if (!currentUser?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_role: userType,
          onboarding_complete: true,
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      const updatedUser = { ...currentUser, type: userType, profile: { ...currentUser.profile, user_role: userType, onboarding_complete: true } };
      setCurrentUser(updatedUser);
      setHasCompletedOnboarding(true);
      localStorage.setItem('indasocial_user', JSON.stringify(updatedUser));
      localStorage.setItem('indasocial_onboarding', 'true');
    } catch (error) {
      console.warn('No se pudo guardar la configuración de onboarding:', error);
    }
  };

  const loginDirectly = () => {
    setAuthError('Please sign in with Google to continue.');
    return false;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('No se pudo cerrar la sesión de Supabase:', error);
    } finally {
      clearSession();
    }
  };

  const updateUser = async (updates) => {
    if (!currentUser?.id) return false;

    const profileUpdates = {};
    if (updates.name) profileUpdates.full_name = updates.name;
    if (updates.username) profileUpdates.username = updates.username;
    if (updates.avatar) profileUpdates.avatar_url = updates.avatar;
    if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
    if (updates.location !== undefined) profileUpdates.location = updates.location;
    if (updates.website !== undefined) profileUpdates.website = updates.website;
    if (updates.category !== undefined) profileUpdates.industry = updates.category;
    if (updates.type) profileUpdates.user_role = updates.type;
    if (updates.indaBalance !== undefined) profileUpdates.token_balance = updates.indaBalance;

    try {
      const { error } = await supabase.from('profiles').update(profileUpdates).eq('id', currentUser.id);
      if (error) throw error;

      const updatedUser = { ...currentUser, ...updates, profile: { ...currentUser.profile, ...profileUpdates } };
      setCurrentUser(updatedUser);
      localStorage.setItem('indasocial_user', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.warn('No se pudo actualizar el perfil:', error);
      return false;
    }
  };

  const unlockPost = async (postId, cost) => {
    if (!currentUser?.id) return false;

    try {
      const { data, error } = await supabase.rpc('unlock_post_for_user', {
        p_user_id: currentUser.id,
        p_post_id: postId,
      });

      if (error) throw error;

      const updatedUser = {
        ...currentUser,
        indaBalance: data?.balance ?? currentUser.indaBalance,
        profile: {
          ...currentUser.profile,
          token_balance: data?.balance ?? currentUser.indaBalance,
        },
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('indasocial_user', JSON.stringify(updatedUser));
      return Boolean(data?.status === 'unlocked' || data?.status === 'already_unlocked');
    } catch (error) {
      console.warn('No se pudo desbloquear el post:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        hasCompletedOnboarding,
        isAuthReady,
        authError,
        login,
        loginDirectly,
        logout,
        completeOnboarding,
        updateUser,
        unlockPost,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
