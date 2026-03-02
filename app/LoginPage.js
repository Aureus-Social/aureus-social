'use client';
import { useState, useRef, useCallback } from 'react';
import { supabase } from './lib/supabase';

// ═══ BRUTE FORCE PROTECTION ═══
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const PROGRESSIVE_DELAYS = [0, 1000, 2000, 4000, 8000]; // Délai progressif en ms

// ═══ POLITIQUE MOT DE PASSE FORTE (alignée avec lib/security/auth.js) ═══
const PASSWORD_MIN_LENGTH = 12;
const COMMON_PASSWORDS = [
  'password1234', 'motdepasse12', 'azerty123456', 'qwerty123456',
  'admin1234567', '123456789012', 'changeme1234', 'welcome12345',
];

function validatePasswordStrength(pwd) {
  const errors = [];
  if (pwd.length < PASSWORD_MIN_LENGTH) errors.push(`Au moins ${PASSWORD_MIN_LENGTH} caractères`);
  if (!/[A-Z]/.test(pwd)) errors.push('Au moins une majuscule');
  if (!/[a-z]/.test(pwd)) errors.push('Au moins une minuscule');
  if (!/[0-9]/.test(pwd)) errors.push('Au moins un chiffre');
  if (!/[^A-Za-z0-9]/.test(pwd)) errors.push('Au moins un caractère spécial (!@#$%...)');
  if (COMMON_PASSWORDS.includes(pwd.toLowerCase())) errors.push('Ce mot de passe est trop courant');
  return errors;
}

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState('login'); // login, reset, signup, mfa
  const [mfaCode, setMfaCode] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState(null);
  const [mfaChallengeId, setMfaChallengeId] = useState(null);
  const [passwordErrors, setPasswordErrors] = useState([]);

  // Brute force protection state
  const loginAttemptsRef = useRef(0);
  const lockoutUntilRef = useRef(0);
  const resetAttemptsRef = useRef(0);
  const resetLockoutRef = useRef(0);

  const checkBruteForce = useCallback(() => {
    const now = Date.now();
    if (now < lockoutUntilRef.current) {
      const remaining = Math.ceil((lockoutUntilRef.current - now) / 1000);
      setError(`Trop de tentatives. Réessayez dans ${remaining} secondes.`);
      return false;
    }
    if (loginAttemptsRef.current >= MAX_LOGIN_ATTEMPTS) {
      lockoutUntilRef.current = now + LOCKOUT_DURATION_MS;
      loginAttemptsRef.current = 0;
      setError('Compte temporairement verrouillé (5 min). Trop de tentatives échouées.');
      return false;
    }
    return true;
  }, []);

  if (!supabase) return <div style={{minHeight:"100vh",background:"#060810",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444",fontFamily:"Inter,sans-serif",padding:40,textAlign:"center"}}><div><div style={{fontSize:48,marginBottom:16}}>⚠️</div><div style={{fontSize:18,fontWeight:600,color:"#e5e5e5",marginBottom:8}}>Configuration requise</div><div style={{fontSize:13,color:"#999",lineHeight:1.6}}>Les variables d'environnement Supabase ne sont pas configurées.<br/>En local : créez un fichier <code style={{background:"#1a1d24",padding:"2px 6px",borderRadius:4}}>.env.local</code> à la racine du projet avec NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY (voir <code style={{background:"#1a1d24",padding:"2px 6px",borderRadius:4}}>.env.example</code>).<br/>En production : ajoutez ces variables dans les paramètres du projet Vercel.</div></div></div>;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!checkBruteForce()) return;
    setLoading(true);
    setError('');

    // Délai progressif selon le nombre de tentatives
    const delay = PROGRESSIVE_DELAYS[Math.min(loginAttemptsRef.current, PROGRESSIVE_DELAYS.length - 1)];
    if (delay > 0) await new Promise(r => setTimeout(r, delay));

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      loginAttemptsRef.current++;
      const attemptsLeft = MAX_LOGIN_ATTEMPTS - loginAttemptsRef.current;
      const msg = authError.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect'
        : authError.message;
      setError(attemptsLeft > 0 && attemptsLeft <= 3
        ? `${msg} (${attemptsLeft} tentative${attemptsLeft > 1 ? 's' : ''} restante${attemptsLeft > 1 ? 's' : ''})`
        : msg);
      setLoading(false);
      return;
    }

    // Réinitialiser le compteur en cas de succès
    loginAttemptsRef.current = 0;

    // Check if MFA is required
    if (data?.session && !data.session.access_token && data.user?.factors?.length > 0) {
      // MFA enrolled but challenge needed — handled by Supabase MFA flow
      await startMfaChallenge(data.user);
      setLoading(false);
      return;
    }

    // Check for MFA via AAL (Authenticator Assurance Level)
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalData && aalData.currentLevel === 'aal1' && aalData.nextLevel === 'aal2') {
      // User has MFA enrolled, needs to verify
      await startMfaChallenge();
      setLoading(false);
      return;
    }

    if (data?.user) {
      // GeoIP check (non-blocking)
      checkGeoIP(data.user.id, email);
      onLogin(data.user);
    }
    setLoading(false);
  };

  const checkGeoIP = async (userId, userEmail) => {
    try {
      const res = await fetch('/api/geocheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email: userEmail }),
      });
      const data = await res.json();
      if (data?.alert) {
        setTimeout(() => alert(data.alert.message), 500);
      }
    } catch { /* GeoIP is best-effort */ }
  };

  const startMfaChallenge = async () => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.[0];
      if (!totpFactor) {
        setError('Aucun facteur TOTP configuré');
        return;
      }
      const { data: challenge, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (chErr) { setError(chErr.message); return; }
      setMfaFactorId(totpFactor.id);
      setMfaChallengeId(challenge.id);
      setMode('mfa');
    } catch (err) {
      setError('Erreur MFA: ' + err.message);
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: verifyErr } = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: mfaChallengeId,
      code: mfaCode,
    });

    if (verifyErr) {
      setError(verifyErr.message === 'Invalid TOTP code'
        ? 'Code incorrect. Réessayez.'
        : verifyErr.message);
      setLoading(false);
      return;
    }

    // MFA verified — get current user
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      onLogin(userData.user);
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

    // Politique de mot de passe forte
    const pwdErrors = validatePasswordStrength(password);
    if (pwdErrors.length > 0) {
      setError('Mot de passe trop faible : ' + pwdErrors.join(', '));
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      // Message générique pour éviter l'énumération d'emails
      setError(signUpError.message === 'User already registered'
        ? 'Si ce compte existe, un email de confirmation a été envoyé.'
        : signUpError.message);
      setLoading(false);
      return;
    }

    if (data?.user) {
      // Message générique pour ne pas révéler si l'email existe déjà
      if (data.user.identities && data.user.identities.length === 0) {
        // L'email existe déjà — message identique au succès pour éviter l'énumération
        setSuccess('Si ce compte n\'existe pas encore, un email de confirmation a été envoyé. Vérifiez votre boîte mail.');
        setMode('login');
        setPassword('');
        setPassword2('');
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

    // Rate limiting sur la réinitialisation (max 3 demandes par période de 5 min)
    const now = Date.now();
    if (now < resetLockoutRef.current) {
      const remaining = Math.ceil((resetLockoutRef.current - now) / 1000);
      setError(`Veuillez patienter ${remaining} secondes avant de réessayer.`);
      return;
    }
    resetAttemptsRef.current++;
    if (resetAttemptsRef.current >= 3) {
      resetLockoutRef.current = now + LOCKOUT_DURATION_MS;
      resetAttemptsRef.current = 0;
    }

    setLoading(true);
    setError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    // Message générique pour ne pas révéler si l'email existe
    if (resetError && !resetError.message.includes('rate')) {
      setError('');
      setSuccess('Si un compte est associé à cette adresse, un email de réinitialisation a été envoyé.');
    } else {
      setError('');
      setSuccess('Si un compte est associé à cette adresse, un email de réinitialisation a été envoyé.');
    }
    setMode('login');
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
              <label style={{ display: 'block', fontSize: 12, color: '#9e9b93', marginBottom: 6 }}>Mot de passe (min. {PASSWORD_MIN_LENGTH} car., majuscule, chiffre, spécial)</label>
              <input type="password" value={password} onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value.length > 0) setPasswordErrors(validatePasswordStrength(e.target.value));
                else setPasswordErrors([]);
              }} required style={inputStyle} placeholder="••••••••" />
              {passwordErrors.length > 0 && password.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 11, color: '#fb923c', lineHeight: 1.5 }}>
                  {passwordErrors.map((err, i) => <div key={i}>• {err}</div>)}
                </div>
              )}
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

        {/* ═══ MFA TOTP ═══ */}
        {mode === 'mfa' && (
          <form onSubmit={handleMfaVerify}>
            <div style={{
              padding: '12px 14px', marginBottom: 16, borderRadius: 8,
              background: 'rgba(198,163,78,0.04)', border: '1px solid rgba(198,163,78,0.15)',
              fontSize: 12, color: '#c6a34e', lineHeight: 1.5, textAlign: 'center',
            }}>
              Vérification en deux étapes activée. Entrez le code à 6 chiffres de votre application d'authentification.
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9e9b93', marginBottom: 6 }}>Code TOTP</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                style={{ ...inputStyle, textAlign: 'center', fontSize: 24, letterSpacing: 12, fontWeight: 700 }}
                placeholder="000000"
                autoFocus
              />
            </div>

            <button type="submit" disabled={loading || mfaCode.length !== 6} style={btnStyle(true)}>
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button type="button" onClick={() => { setMode('login'); setError(''); setMfaCode(''); }} style={{
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
