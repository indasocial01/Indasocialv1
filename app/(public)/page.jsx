"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '@/src/views/LandingPage'; // Apunta a tu carpeta views

export default function LandingPageRoute() {
  const router = useRouter();

  const handleConnect = () => {
    // Al hacer clic en Connect, redirige a /login
    router.push('/login');
  };

  const handleBlogClick = () => {
    // Redirige al feed del Blog público
    router.push('/blog');
  };

  return (
    <LandingPage 
      onConnect={handleConnect} 
      onBlogClick={handleBlogClick} 
    />
  );
}