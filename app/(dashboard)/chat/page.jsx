"use client";
import MatchChat from '@/src/views/MatchChat';
import { useAuth } from '@/src/context/AuthContext';

export default function ChatRoute() {
  const { currentUser } = useAuth();
  return <MatchChat key={currentUser?.id} userId={currentUser?.id} userType={currentUser?.type} />;
}
