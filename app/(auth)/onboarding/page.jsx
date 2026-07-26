"use client";

import Onboarding from '@/src/views/Onboarding';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useEffect } from 'react';

export default function OnboardingRoute() {
  const router = useRouter();
  const { completeOnboarding, isAuthenticated, hasCompletedOnboarding, isAuthReady } = useAuth();

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
    } else if (hasCompletedOnboarding) {
      router.push('/dashboard');
    }
  }, [isAuthReady, isAuthenticated, hasCompletedOnboarding, router]);

  const handleOnboardingComplete = (userType) => {
    completeOnboarding(userType);
    // The context update will trigger the useEffect to redirect
  };

  return <Onboarding onComplete={handleOnboardingComplete} />;
}
