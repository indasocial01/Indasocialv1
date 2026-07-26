"use client";
import Blog from '@/src/views/Blog';
import { useAuth } from '@/src/context/AuthContext';

export default function InternalBlogRoute() {
  const { currentUser } = useAuth();
  return <Blog userType={currentUser?.type} />;
}
