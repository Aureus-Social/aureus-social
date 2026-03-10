'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const STATS = [
  { v: '132', l: 'Modules actifs' },
  { v: '166', l: 'CP belges' },
  { v: '8s', l: 'Dimona' },
  { v: 'RGPD', l: 'Conforme UE' },
];

const FEATURES = [
  { ico: '🏛', t: 'Droit social belge 2026', d: 'ONSS, DmfA, Belcotax, Dimona — mis à jour automatiquement.' },
  { ico: '⚡', t: 'Automatisation complète', d: 'Fiches de paie, virements SEPA, déclarations en quelques clics.' },
  { ico: '🔐', t: 'Sécurité maximale', d: 'Chiffrement AES-256-GCM · Hébergement UE · RGPD Art. 28.' },
  { ico: '🏢', t: 'Multi-mandants', d: 'Gérez plusieurs employeurs depuis un seul tableau de bord.' },
];

const TESTIMONIALS = [
  { name: 'M. Janssen', role: 'Expert-comptable · 23 dossiers', text: 'Le portail multi-clients est exactement ce qu\'il manquait. Mandats Mahis générés automatiquement.' },
  { name: 'S. Mbeki', role: 'DRH · secteur associatif', text: 'Migration depuis SD Worx en 3 jours. Toutes les données reprises, 0 interruption.' },
];

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('password');
  const [dark, setDark] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    try { const s = localStorage.getItem('aureus_theme'); if (s) setDark(s !== 'light'); } catch(e) {}
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem('aureus_theme', next ? 'dark' : 'light'); } catch(e) {}
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!supabase) {
      onLogin({ email: email || 'demo@aureus-ia.com', role: 'admin' });
      setLoading(false);
      return;
    }
    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        setError('✅ Lien de connexion envoyé à ' + email);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data?.user) onLogin(data.user);
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    }
    setLoading(false);
  };

  // Couleurs selon thème
  const bg     = dark ? '#0c0b09' : '#f5f3ef';
  const bgL    = dark ? 'linear-gradient(135deg,#0c0b09 0%,#181613 60%,#1f1c17 100%)' : 'linear-gradient(135deg,#f5f3ef 0%,#ede9e1 100%)';
  const bgR    = dark ? '#111009' : '#ffffff';
  const ink    = dark ? '#e8e6e0' : '#0e0d0a';
  const mist   = dark ? '#7a7770' : '#9a968e';
  const stone  = dark ? '#5e5c56' : '#56524a';
  const gold   = '#c6a34e';
  const border = dark ? 'rgba(198,163,78,.15)' : 'rgba(198,163,78,.25)';
  const inputBg = dark ? 'rgba(0,0,0,.35)' : '#ffffff';
  const cardBg  = dark ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.03)';

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:bg, fontFamily:"'Inter',sans-serif", position:'relative' }}>

      {/* Theme toggle */}
      <button onClick={toggleTheme} title={dark ? 'Mode jour' : 'Mode nuit'}
        style={{ position:'fixed', top:20, right:20, zIndex:999, background:cardBg, border:`1px solid ${border}`, borderRadius:10, width:40, height:40, cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}>
        {dark ? '☀️' : '🌙'}
      </button>

      {/* LEFT — Institutionnel */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'60px 72px', background:bgL, minWidth:0 }}>

        {/* Logo */}
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:48 }}>
            <div style={{ width:40, height:40, background:'rgba(198,163,78,.12)', border:`1px solid ${border}`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>▲</div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:gold, letterSpacing:'3px' }}>AUREUS</div>
              <div style={{ fontSize:10, color:mist, letterSpacing:'3px' }}>SOCIAL PRO</div>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize:38, fontWeight:800, color:ink, lineHeight:1.2, marginBottom:16, maxWidth:480 }}>
            Le secrétariat social<br/><span style={{ color:gold }}>belge nouvelle génération.</span>
          </h1>
          <p style={{ fontSize:16, color:mist, lineHeight:1.7, maxWidth:420, marginBottom:40 }}>
            De la Dimona aux fiches de paie, Aureus Social Pro automatise l'intégralité de vos obligations sociales belges.
          </p>

          {/* Stats */}
          <div style={{ display:'flex', gap:28, flexWrap:'wrap', marginBottom:48 }}>
            {STATS.map(k => (
              <div key={k.l} style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:10, padding:'14px 20px', minWidth:80, textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:800, color:gold }}>{k.v}</div>
                <div style={{ fontSize:10, color:stone, marginTop:3, letterSpacing:.5 }}>{k.l}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, maxWidth:480, marginBottom:48 }}>
            {FEATURES.map(f => (
              <div key={f.t} style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:10, padding:'16px 18px' }}>
                <div style={{ fontSize:20, marginBottom:8 }}>{f.ico}</div>
                <div style={{ fontSize:13, fontWeight:700, color:ink, marginBottom:4 }}>{f.t}</div>
                <div style={{ fontSize:11, color:mist, lineHeight:1.6 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Témoignage rotatif */}
        <div style={{ borderTop:`1px solid ${border}`, paddingTop:24 }}>
          <div style={{ fontSize:22, color:gold, marginBottom:8 }}>★★★★★</div>
          <p style={{ fontSize:14, color:mist, fontStyle:'italic', lineHeight:1.7, marginBottom:10, minHeight:44 }}>
            "{TESTIMONIALS[slide].text}"
          </p>
          <div style={{ fontSize:13, fontWeight:700, color:ink }}>{TESTIMONIALS[slide].name}</div>
          <div style={{ fontSize:11, color:stone }}>{TESTIMONIALS[slide].role}</div>
          <div style={{ display:'flex', gap:6, marginTop:12 }}>
            {TESTIMONIALS.map((_, i) => (
              <div key={i} onClick={() => setSlide(i)} style={{ width:i===slide?20:6, height:6, borderRadius:3, background:i===slide?gold:border, cursor:'pointer', transition:'all .3s' }}/>
            ))}
          </div>
        </div>

        {/* Footer légal */}
        <div style={{ marginTop:24, fontSize:10, color:stone }}>
          Aureus IA SPRL · BCE BE 1028.230.781 · Place Marcel Broodthaers 8, 1060 Saint-Gilles<br/>
          Hébergement UE · Chiffrement AES-256-GCM · Certifié RGPD Art. 28
        </div>
      </div>

      {/* RIGHT — Formulaire */}
      <div style={{ width:460, display:'flex', alignItems:'center', justifyContent:'center', background:bgR, borderLeft:`1px solid ${border}`, padding:'40px 0' }}>
        <div style={{ width:340 }}>

          {/* Header form */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:24, fontWeight:800, color:ink, marginBottom:6 }}>Connexion</div>
            <div style={{ fontSize:13, color:mist }}>Accédez à votre espace de gestion</div>
          </div>

          {/* Badge sécurité */}
          <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
            {['🔒 SSL','🇧🇪 Serveurs UE','🛡 RGPD'].map(b => (
              <span key={b} style={{ fontSize:10, background:cardBg, border:`1px solid ${border}`, borderRadius:20, padding:'4px 10px', color:mist }}>{b}</span>
            ))}
          </div>

          {error && (
            <div style={{ padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:12,
              background: error.startsWith('✅') ? 'rgba(34,197,94,.08)' : 'rgba(239,68,68,.08)',
              color: error.startsWith('✅') ? '#22c55e' : '#ef4444',
              border:`1px solid ${error.startsWith('✅') ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}` }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:mist, marginBottom:6, letterSpacing:.5 }}>EMAIL PROFESSIONNEL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="nom@entreprise.be"
                style={{ width:'100%', padding:'13px 16px', borderRadius:10, border:`1px solid ${border}`, background:inputBg, color:ink, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'border .2s' }}
                onFocus={e => e.target.style.borderColor=gold}
                onBlur={e => e.target.style.borderColor=border} />
            </div>

            {mode === 'password' && (
              <div style={{ marginBottom:24 }}>
                <label style={{ display:'block', fontSize:11, fontWeight:600, color:mist, marginBottom:6, letterSpacing:.5 }}>MOT DE PASSE</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width:'100%', padding:'13px 16px', borderRadius:10, border:`1px solid ${border}`, background:inputBg, color:ink, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'border .2s' }}
                  onFocus={e => e.target.style.borderColor=gold}
                  onBlur={e => e.target.style.borderColor=border} />
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'14px', borderRadius:10, border:'none', background: loading ? '#5e5c56' : 'linear-gradient(135deg,#c6a34e,#a68a3c)', color:'#0c0b09', fontSize:14, fontWeight:800, cursor: loading ? 'wait' : 'pointer', fontFamily:'inherit', letterSpacing:'.5px', transition:'opacity .2s' }}>
              {loading ? 'Connexion...' : mode === 'magic' ? 'Envoyer le lien →' : 'Se connecter →'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:16 }}>
            <button type="button" onClick={() => setMode(mode === 'password' ? 'magic' : 'password')}
              style={{ background:'none', border:'none', color:gold, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
              {mode === 'password' ? '✨ Connexion par lien magique' : '← Connexion par mot de passe'}
            </button>
          </div>

          {/* Séparateur */}
          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'28px 0' }}>
            <div style={{ flex:1, height:1, background:border }}/>
            <span style={{ fontSize:10, color:stone }}>SÉCURITÉ</span>
            <div style={{ flex:1, height:1, background:border }}/>
          </div>

          {/* Garanties */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[
              { ico:'🏛', t:'Droit belge', d:'ONSS · DmfA · Dimona' },
              { ico:'💾', t:'Backup UE', d:'Frankfurt · 99.99% SLA' },
              { ico:'🔑', t:'2FA disponible', d:'Sécurité renforcée' },
              { ico:'📞', t:'Support dédié', d:'Réponse < 24h' },
            ].map(g => (
              <div key={g.t} style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:8, padding:'12px 14px' }}>
                <div style={{ fontSize:16, marginBottom:4 }}>{g.ico}</div>
                <div style={{ fontSize:11, fontWeight:700, color:ink }}>{g.t}</div>
                <div style={{ fontSize:10, color:stone }}>{g.d}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:32, fontSize:10, color:stone, lineHeight:1.8 }}>
            Aureus IA SPRL · BCE BE 1028.230.781<br/>
            Données hébergées en UE · Chiffrement AES-256
          </div>
        </div>
      </div>
    </div>
  );
}
