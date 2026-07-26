"use client";
import SalesDashboard from '@/src/views/SalesDashboard';
import { useAuth } from '@/src/context/AuthContext';

export default function SalesRoute() {
  const { currentUser } = useAuth();
  return <SalesDashboard userType={currentUser?.type} />;
}
