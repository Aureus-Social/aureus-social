'use client';
import { useState } from 'react';
import { supabase } from './lib/supabase';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [societe, setSociete] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState('login');

  const inputStyle = {
    width: '100%', padding: '12px 14px', fontSize: 14,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(198,163,78,0.15)',
    borderRadius: 8, color: '#e8e6e0', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
  };

  const btnStyle = (isLoading) => ({
    width: '100%', padding: '14px 20px',
    background: isLoading ? 'rgba(198,163,78,0.1)' : 'linear-gradient(135deg, #c6a34e, #a68a3c)',
    color: isLoading ? '#c6a34e' : '#060810',
    fontWeight: 700, fontSize: 14, border: 'none', borderRadius: 10,
    cursor: isLoading ? 'wait' : 'pointer', fontFamily: 'inherit',
    transition: 'all 0.2s',
  });

  const linkStyle = {
    background: 'none', border: 'none', color: '#c6a34e',
    fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
    textDecoration: 'underline',
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : authError.message);
      setLoading(false); return;
    }
    if (data?.user) onLogin(data.user);
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caracteres'); setLoading(false); return; }
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); setLoading(false); return; }
    if (!nom.trim()) { setError('Le nom est obligatoire'); setLoading(false); return; }
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email, password,
        options: { data: { nom, prenom, societe, telephone } },
      });
      if (signupError) {
        setError(signupError.message.includes('already registered') ? 'Cet email est deja inscrit. Connectez-vous.' : signupError.message);
        setLoading(false); return;
      }
      if (data?.user) {
        await supabase.from('users').upsert({
          id: data.user.id, email, password_hash: '***', nom, prenom, role: 'admin', lang: 'fr', active: true,
        }, { onConflict: 'id' });
      }
      if (data?.user && !data.session) {
        setSuccess('Compte cree ! Verifiez votre email pour confirmer, puis connectez-vous.');
        setMode('login');
      } else if (data?.user && data.session) {
        onLogin(data.user);
      }
    } catch (e) { setError('Erreur lors de la creation du compte.'); }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (resetError) { setError(resetError.message); }
    else { setSuccess('Email de reinitialisation envoye a ' + email); setTimeout(() => setMode('login'), 3000); }
    setLoading(false);
  };

  const switchMode = (m) => { setMode(m); setError(''); setSuccess(''); };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #060810 0%, #0c1020 50%, #060810 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{
        width: mode === 'signup' ? 440 : 400, padding: 40, borderRadius: 16,
        background: 'rgba(198,163,78,0.03)', border: '1px solid rgba(198,163,78,0.15)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #c6a34e, #a68a3c)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 800, color: '#060810', marginBottom: 12,
          }}>A</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#c6a34e', letterSpacing: 1 }}>AUREUS SOCIAL PRO</div>
          <div style={{ fontSize: 11, color: '#5e5c56', letterSpacing: 2, marginTop: 4 }}>GESTION DE PAIE BELGE</div>
        </div>

        {/* â•â•â• LOGIN â•â•â• */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9e9b93', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} placeholder="votre@email.com" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9e9b93', marginBottom: 6 }}>Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
            </div>
            {error && <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', color: '#fb923c', fontSize: 13 }}>{error}</div>}
            {success && <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', fontSize: 13 }}>{success}</div>}
            <button type="submit" disabled={loading} style={btnStyle(loading)}>{loading ? 'â³ Connexion...' : 'Se connecter'}</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <button type="button" onClick={() => switchMode('reset')} style={linkStyle}>Mot de passe oublie ?</button>
              <button type="button" onClick={() => switchMode('signup')} style={{...linkStyle, fontWeight: 600}}>Creer un compte</button>
            </div>
          </form>
        )}

        {/* â•â•â• SIGN UP â•â•â• */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#c6a34e', marginBottom: 16, textAlign: 'center' }}>Creer votre compte</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9e9b93', marginBottom: 4 }}>Nom *</label>
                <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required style={inputStyle} placeholder="Dupont" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9e9b93', marginBottom: 4 }}>Prenom</label>
                <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} style={inputStyle} placeholder="Jean" />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#9e9b93', marginBottom: 4 }}>Societe / Fiduciaire</label>
              <input type="text" value={societe} onChange={(e) => setSociete(e.target.value)} style={inputStyle} placeholder="Ma societe SRL" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#9e9b93', marginBottom: 4 }}>Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} placeholder="votre@email.com" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#9e9b93', marginBottom: 4 }}>Telephone</label>
              <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} style={inputStyle} placeholder="+32 4XX XX XX XX" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9e9b93', marginBottom: 4 }}>Mot de passe * (min 6)</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#9e9b93', marginBottom: 4 }}>Confirmer *</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
              </div>
            </div>
            {error && <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', color: '#fb923c', fontSize: 13 }}>{error}</div>}
            {success && <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', fontSize: 13 }}>{success}</div>}
            <button type="submit" disabled={loading} style={btnStyle(loading)}>{loading ? 'â³ Creation...' : 'Creer mon compte gratuitement'}</button>
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 10, color: '#5e5c56', lineHeight: 1.5 }}>
              En creant un compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialite.
            </div>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button type="button" onClick={() => switchMode('login')} style={linkStyle}>Deja inscrit ? Se connecter</button>
            </div>
          </form>
        )}

        {/* â•â•â• RESET â•â•â• */}
        {mode === 'reset' && (
          <form onSubmit={handleReset}>
            <div style={{ fontSize: 13, color: '#9e9b93', marginBottom: 16 }}>Entrez votre email pour recevoir un lien de reinitialisation.</div>
            <div style={{ marginBottom: 16 }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} placeholder="votre@email.com" />
            </div>
            {error && <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', color: '#fb923c', fontSize: 13 }}>{error}</div>}
            {success && <div style={{ marginBottom: 16, padding: 12, borderRadius: 8, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', fontSize: 13 }}>{success}</div>}
            <button type="submit" disabled={loading} style={btnStyle(loading)}>{loading ? 'â³ Envoi...' : 'Envoyer le lien'}</button>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button type="button" onClick={() => switchMode('login')} style={linkStyle}>Retour a la connexion</button>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 10, color: '#3a3832' }}>
          Aureus IA SPRL Â· Saint-Gilles, Bruxelles
        </div>
      </div>
    </div>
  );
}
