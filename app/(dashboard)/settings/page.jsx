"use client";
import Settings from '@/src/views/Settings';
import { useAuth } from '@/src/context/AuthContext';

export default function SettingsRoute() {
  const { currentUser } = useAuth();
  return <Settings userType={currentUser?.type} />;
}
