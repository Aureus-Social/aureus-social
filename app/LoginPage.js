'use client';
import { useState } from 'react';
import { supabase } from './lib/supabase';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState('login'); // login, reset, signup

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

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (password !== password2) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message === 'User already registered'
        ? 'Cet email est déjà enregistré. Connectez-vous.'
        : signUpError.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      // Check if email confirmation is required
      if (data.user.identities && data.user.identities.length === 0) {
        setError('Cet email est déjà enregistré.');
      } else if (data.session) {
        // Auto-confirmed (no email verification needed)
        onLogin(data.user);
      } else {
        setSuccess('✅ Compte créé ! Vérifiez votre email pour confirmer, puis connectez-vous.');
        setMode('login');
        setPassword('');
        setPassword2('');
      }
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
      setSuccess('📧 Email de réinitialisation envoyé à ' + email);
      setMode('login');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', fontSize: 14,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(198,163,78,0.15)',
    borderRadius: 8, color: '#e8e6e0', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
  };

  const btnStyle = (active) => ({
    width: '100%', padding: '14px 20px',
    background: loading ? 'rgba(198,163,78,0.1)' : active ? 'linear-gradient(135deg, #c6a34e, #a68a3c)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: loading ? '#c6a34e' : '#060810',
    fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 10,
    cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
    transition: 'all 0.2s',
  });

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
        width: 420,
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
            {mode === 'signup' ? 'CRÉER VOTRE ESPACE EMPLOYEUR' : 'GESTION DE PAIE BELGE'}
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div style={{
            marginBottom: 16, padding: 12, borderRadius: 8,
            background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
            color: '#22c55e', fontSize: 13,
          }}>
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{
            marginBottom: 16, padding: 12, borderRadius: 8,
            background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)',
            color: '#fb923c', fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* ═══ LOGIN ═══ */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9e9b93', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} placeholder="votre@email.com" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9e9b93', marginBottom: 6 }}>Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} style={btnStyle(true)}>
              {loading ? '⏳ Connexion...' : 'Se connecter'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', justifyContent: 'center', gap: 20 }}>
              <button type="button" onClick={() => { setMode('reset'); setError(''); setSuccess(''); }} style={{
                background: 'none', border: 'none', color: '#c6a34e',
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline',
              }}>
                Mot de passe oublié ?
              </button>
              <button type="button" onClick={() => { setMode('signup'); setError(''); setSuccess(''); }} style={{
                background: 'none', border: 'none', color: '#22c55e',
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', fontWeight: 600,
              }}>
                Créer un compte
              </button>
            </div>
          </form>
        )}

        {/* ═══ SIGN UP ═══ */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp}>
            <div style={{
              padding: '10px 14px', marginBottom: 16, borderRadius: 8,
              background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)',
              fontSize: 11, color: '#22c55e', lineHeight: 1.5,
            }}>
              🏢 <strong>Espace Employeur</strong> — Créez votre compte pour accéder au portail client : encoder vos prestations, consulter vos fiches de paie, et communiquer avec votre secrétariat social.
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9e9b93', marginBottom: 6 }}>Email professionnel</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} placeholder="contact@votre-entreprise.be" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9e9b93', marginBottom: 6 }}>Mot de passe (min. 6 caractères)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} placeholder="••••••••" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9e9b93', marginBottom: 6 }}>Confirmer le mot de passe</label>
              <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required style={inputStyle} placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px 20px',
              background: loading ? 'rgba(34,197,94,0.1)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: loading ? '#22c55e' : '#fff',
              fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 10,
              cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
            }}>
              {loading ? '⏳ Création...' : '🏢 Créer mon compte employeur'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{
                background: 'none', border: 'none', color: '#c6a34e',
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline',
              }}>
                Déjà un compte ? Se connecter
              </button>
            </div>
          </form>
        )}

        {/* ═══ RESET ═══ */}
        {mode === 'reset' && (
          <form onSubmit={handleReset}>
            <div style={{ fontSize: 13, color: '#9e9b93', marginBottom: 16 }}>
              Entrez votre email pour recevoir un lien de réinitialisation.
            </div>
            <div style={{ marginBottom: 16 }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} placeholder="votre@email.com" />
            </div>

            <button type="submit" disabled={loading} style={btnStyle(true)}>
              {loading ? '⏳ Envoi...' : 'Envoyer le lien'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} style={{
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
