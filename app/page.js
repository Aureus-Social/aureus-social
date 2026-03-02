'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from './lib/supabase';
import LoginPage from './LoginPage';

// Chargement différé pour ne pas bloquer la page (bundle ~27k lignes)
const AureusSocialPro = dynamic(() => import('./AureusSocialPro'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      background: '#060810',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#c6a34e',
      fontSize: 16,
      fontFamily: "'Inter', sans-serif",
    }}>
      Ouverture de l'application...
    </div>
  ),
});

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    const timeoutId = setTimeout(() => setLoading(false), 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    }).catch(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => { clearTimeout(timeoutId); subscription?.unsubscribe?.(); };
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#060810',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#c6a34e',
        fontSize: 16,
        fontFamily: "'Inter', sans-serif",
      }}>
        Chargement...
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return <AureusSocialPro supabase={supabase} user={user} onLogout={async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }} />;
}
