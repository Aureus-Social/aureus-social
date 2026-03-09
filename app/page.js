'use client';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import LoginPage from './(auth)/login';
import DashboardLayout from './(dashboard)/layout-client';

export default function Home() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (!supabase) {
        setLoading(false);
        setUser({ email: 'demo@aureus-ia.com', role: 'admin' });
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
      supabase.auth.onAuthStateChange((_event, session) =>
        setUser(session?.user || null)
      );
    }
    checkAuth();
  }, []);

  // Chargement
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0c0b09' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:28, fontWeight:800, color:'#c6a34e', letterSpacing:'2px' }}>AUREUS</div>
        <div style={{ fontSize:11, color:'#5e5c56', marginTop:4 }}>Chargement...</div>
      </div>
    </div>
  );

  // Non connecté → site vitrine intégré
  if (!user) return (
    <iframe
      src="/vitrine.html"
      style={{ width:'100%', height:'100vh', border:'none', display:'block' }}
      title="Aureus Social Pro"
    />
  );

  // Connecté → dashboard
  return <DashboardLayout user={user} />;
}
