'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import LoginPage from '../(auth)/login';

export default function Login() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      if (!supabase) { setChecking(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) router.replace('/');
      else setChecking(false);
    }
    check();
  }, [router]);

  if (checking) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0c0b09' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:28, fontWeight:800, color:'#c6a34e', letterSpacing:'2px' }}>AUREUS</div>
        <div style={{ fontSize:11, color:'#5e5c56', marginTop:4 }}>Chargement...</div>
      </div>
    </div>
  );

  return <LoginPage onLogin={() => router.replace('/')} />;
}
