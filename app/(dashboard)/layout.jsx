"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import Sidebar from '@/src/components/Sidebar';
import FeedbackWidget from '@/src/components/FeedbackWidget';

export default function DashboardLayout({ children }) {
  const { isAuthenticated, hasCompletedOnboarding, currentUser, logout, isAuthReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
    } else if (!hasCompletedOnboarding) {
      router.push('/onboarding');
    } else {
      setIsReady(true);
    }
  }, [isAuthReady, isAuthenticated, hasCompletedOnboarding, router]);

  if (!isReady || !isAuthReady) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>;
  }

  // Extract page ID from pathname (e.g., "/sales" -> "sales")
  const currentPage = pathname.split('/').filter(Boolean).pop() || 'dashboard';

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar 
        currentPage={currentPage}
        userType={currentUser?.type}
        onLogout={() => {
          logout();
          router.push('/login');
        }}
      />
      {children}
      <FeedbackWidget />
    </div>
  );
}
