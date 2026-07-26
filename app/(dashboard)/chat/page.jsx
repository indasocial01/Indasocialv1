"use client";
import MatchChat from '@/src/views/MatchChat';
import { useAuth } from '@/src/context/AuthContext';

export default function ChatRoute() {
  const { currentUser } = useAuth();
  return <MatchChat userType={currentUser?.type} />;
}
