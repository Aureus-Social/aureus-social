'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './lib/supabase';
import DashboardLayout from './(dashboard)/layout-client';

export default function Home() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      if (!supabase) {
        setLoading(false);
        setUser({ email: 'demo@aureus-ia.com', role: 'admin' });
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace('/vitrine');
        return;
      }
      setUser(session.user);
      setLoading(false);
      supabase.auth.onAuthStateChange((_event, session) => {
        if (!session?.user) router.replace('/vitrine');
        else setUser(session.user);
      });
    }
    checkAuth();
  }, [router]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0c0b09' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:28, fontWeight:800, color:'#c6a34e', letterSpacing:'2px' }}>AUREUS</div>
        <div style={{ fontSize:11, color:'#5e5c56', marginTop:4 }}>Chargement...</div>
      </div>
    </div>
  );

  if (!user) return null;
  return <DashboardLayout user={user} />;
}
