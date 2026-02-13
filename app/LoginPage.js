'use client';
import { useState } from 'react';
import { supabase } from './lib/supabase';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login'); // login or reset

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message === 'Invalid login credentials' 
        ? 'Email ou mot de passe incorrect' 
        : authError.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      onLogin(data.user);
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setError('');
      alert('Un email de réinitialisation a été envoyé à ' + email);
      setMode('login');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #060810 0%, #0c1020 50%, #060810 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{
        width: 400,
        padding: 40,
        borderRadius: 16,
        background: 'rgba(198,163,78,0.03)',
        border: '1px solid rgba(198,163,78,0.15)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #c6a34e, #a68a3c)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#060810', marginBottom: 16,
          }}>A</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#c6a34e', letterSpacing: 1 }}>
            AUREUS SOCIAL PRO
          </div>
          <div style={{ fontSize: 11, color: '#5e5c56', letterSpacing: 2, marginTop: 4 }}>
            GESTION DE PAIE BELGE
          </div>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9e9b93', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '12px 14px', fontSize: 14,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(198,163,78,0.15)',
                  borderRadius: 8, color: '#e8e6e0', outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
                placeholder="votre@email.com"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9e9b93', marginBottom: 6 }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', padding: '12px 14px', fontSize: 14,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(198,163,78,0.15)',
                  borderRadius: 8, color: '#e8e6e0', outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div style={{
                marginBottom: 16, padding: 12, borderRadius: 8,
                background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
                color: '#fb923c', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px 20px',
                background: loading ? 'rgba(198,163,78,0.1)' : 'linear-gradient(135deg, #c6a34e, #a68a3c)',
                color: loading ? '#c6a34e' : '#060810',
                fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 10,
                cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              {loading ? '⏳ Connexion...' : 'Se connecter'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setMode('reset')}
                style={{
                  background: 'none', border: 'none', color: '#c6a34e',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                  textDecoration: 'underline',
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div style={{ fontSize: 13, color: '#9e9b93', marginBottom: 16 }}>
              Entrez votre email pour recevoir un lien de réinitialisation.
            </div>
            <div style={{ marginBottom: 16 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '12px 14px', fontSize: 14,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(198,163,78,0.15)',
                  borderRadius: 8, color: '#e8e6e0', outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
                placeholder="votre@email.com"
              />
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', color: '#fb923c', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px 20px',
              background: loading ? 'rgba(198,163,78,0.1)' : 'linear-gradient(135deg, #c6a34e, #a68a3c)',
              color: loading ? '#c6a34e' : '#060810',
              fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 10,
              cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
            }}>
              {loading ? '⏳ Envoi...' : 'Envoyer le lien'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button type="button" onClick={() => setMode('login')} style={{
                background: 'none', border: 'none', color: '#c6a34e',
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline',
              }}>
                Retour à la connexion
              </button>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 10, color: '#3a3832' }}>
          Aureus IA SPRL · Saint-Gilles, Bruxelles
        </div>
      </div>
    </div>
  );
}
