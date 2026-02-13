'use client';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LoginPage from './LoginPage';
import AureusSocialPro from './AureusSocialPro';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
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
    await supabase.auth.signOut();
    setUser(null);
  }} />;
}
