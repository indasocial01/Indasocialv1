"use client";
import React, { useEffect, useState } from 'react';
import ConnectBrands from '@/src/views/ConnectBrands';
import { createClient } from '@/utils/supabase/client';

export default function ConnectRoute() {
  const supabase = createClient();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('user_role')
          .eq('id', user.id)
          .single();
        if (data) setUserRole(data.user_role);
      }
    };
    fetchUserRole();
  }, [supabase]);

  if (!userRole) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400">Cargando...</div>;
  }

  return <ConnectBrands userType={userRole} />;
}
