"use client";
import Dashboard from '@/src/views/Dashboard';
import { useAuth } from '@/src/context/AuthContext';

export default function DashboardRoute() {
  const { currentUser } = useAuth();
  return <Dashboard userType={currentUser?.type} />;
}
