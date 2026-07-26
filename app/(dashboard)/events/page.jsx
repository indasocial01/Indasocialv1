"use client";
import Events from '@/src/views/Events';
import { useAuth } from '@/src/context/AuthContext';

export default function EventsRoute() {
  const { currentUser } = useAuth();
  return <Events userType={currentUser?.type} />;
}
