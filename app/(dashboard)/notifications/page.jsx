"use client";
import Notifications from '@/src/views/Notifications';
import { useAuth } from '@/src/context/AuthContext';

export default function NotificationsRoute() {
  const { currentUser } = useAuth();
  return <Notifications userType={currentUser?.type} />;
}
