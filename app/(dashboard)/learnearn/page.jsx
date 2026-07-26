"use client";
import LearnEarn from '@/src/views/LearnEarn';
import { useAuth } from '@/src/context/AuthContext';

export default function LearnEarnRoute() {
  const { currentUser } = useAuth();
  return <LearnEarn userType={currentUser?.type} />;
}
