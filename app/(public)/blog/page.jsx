"use client";

import PublicBlog from '@/src/views/PublicBlog';
import { useRouter } from 'next/navigation';

export default function PublicBlogRoute() {
  const router = useRouter();

  return <PublicBlog onLoginClick={() => router.push('/login')} />;
}
