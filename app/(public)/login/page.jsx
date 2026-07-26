"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Login from '@/src/views/Login';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/src/context/AuthContext';

export default function LoginRoute() {
  const router = useRouter();
  const { loginDirectly } = useAuth();
  const supabase = createClient();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setGoogleError('');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey || supabaseUrl.includes('your-project') || anonKey.includes('your-anon-key')) {
      setGoogleError('Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local antes de usar Google Login.');
      setIsGoogleLoading(false);
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error('Error al autenticar con Google:', error.message);
      setGoogleError(error.message);
    }

    setIsGoogleLoading(false);
  };

  const handleLoginDirectly = (userId) => {
    const ok = loginDirectly(userId);
    if (ok) {
      router.push('/dashboard');
    }
  };

  return (
    <Login
      onGoogleLogin={handleGoogleLogin}
      onLoginDirectly={handleLoginDirectly}
      isGoogleLoading={isGoogleLoading}
      googleError={googleError}
    />
  );
}