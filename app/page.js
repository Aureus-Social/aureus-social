'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './lib/supabase';
import DashboardLayout from './(dashboard)/layout-client';

export default function Home() {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const router = useRouter();

  async function triggerOnboarding(u) {
    try {
      // Vérifier si nouveau client + déclencher le flow
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:      u.id,
          email:        u.email,
          company_name: u.user_metadata?.company_name || null,
          action:       'onboard',
        }),
      });
      const data = await res.json();
      // Si nouveau client → afficher le wizard d'onboarding
      if (data.is_new) setOnboarding(true);
    } catch (e) {
      console.warn('[Onboarding] Erreur silencieuse:', e.message);
    }
  }

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

      // Déclencher onboarding en arrière-plan (non bloquant)
      triggerOnboarding(session.user);

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

  // Nouveau client → afficher le wizard onboarding en overlay
  if (onboarding) {
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(12,11,9,0.95)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ background:'#13120f', border:'1px solid rgba(198,163,78,.15)', borderRadius:16, padding:40, maxWidth:520, width:'90%', textAlign:'center' }}>
          <div style={{ fontSize:24, fontWeight:800, color:'#c6a34e', letterSpacing:2, marginBottom:8 }}>AUREUS</div>
          <div style={{ fontSize:20, fontWeight:700, color:'#e5e5e5', marginBottom:8 }}>Bienvenue ! 👋</div>
          <div style={{ fontSize:13, color:'#888', marginBottom:32, lineHeight:1.6 }}>
            Votre compte est prêt. Complétez la configuration de votre entreprise en 5 minutes pour commencer.
          </div>
          <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
            <button
              onClick={() => setOnboarding(false)}
              style={{ padding:'10px 20px', background:'rgba(198,163,78,.08)', border:'1px solid rgba(198,163,78,.2)', borderRadius:8, color:'#888', fontSize:13, cursor:'pointer' }}
            >
              Ignorer pour l'instant
            </button>
            <button
              onClick={() => { setOnboarding(false); /* Le DashboardLayout navigue vers OnboardingHub */ }}
              style={{ padding:'10px 24px', background:'#c6a34e', border:'none', borderRadius:8, color:'#0c0b09', fontSize:13, fontWeight:700, cursor:'pointer' }}
            >
              Configurer mon entreprise →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <DashboardLayout user={user} />;
}
