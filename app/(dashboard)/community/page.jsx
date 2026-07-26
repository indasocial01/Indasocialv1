"use client";
import Community from '@/src/views/Community';
import { useAuth } from '@/src/context/AuthContext';

export default function CommunityRoute() {
  const { currentUser } = useAuth();
  return <Community userType={currentUser?.type} />;
}
