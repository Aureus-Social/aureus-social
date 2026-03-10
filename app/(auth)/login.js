'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const TESTIMONIALS_ALL = [
  {name:"Thomas V.",role:"Gérant — agence web, Bruxelles",text:"J'avais peur de la paperasse ONSS. En 2 jours, Aureus m'a guidé de l'immatriculation jusqu'à la première fiche de paie. Zéro stress.",stars:5,lang:"fr"},
  {name:"Sarah M.",role:"Fondatrice — startup RH, Gand",text:"La Dimona en 8 secondes, c'est réel. J'ai engagé 3 employés en 1 semaine sans aucune connaissance en droit social belge.",stars:5,lang:"fr"},
  {name:"Karim B.",role:"Indépendant complémentaire, Liège",text:"Passage de SD Worx à Aureus en 3 jours. Migration gratuite, toutes mes données reprises. Je paie 60% moins cher.",stars:5,lang:"fr"},
  {name:"Isabelle D.",role:"DRH — cabinet comptable, Namur",text:"Le module DmfA XML est parfait. Export direct vers l'ONSS, zéro rejet. Je gère 47 dossiers depuis un seul tableau de bord.",stars:5,lang:"fr"},
  {name:"Marc L.",role:"Gérant — restaurant, Charleroi",text:"Avant Aureus je payais Securex 280€/mois pour 2 employés. Maintenant tout est automatique et je comprends enfin mes charges patronales.",stars:5,lang:"fr"},
  {name:"Nathalie P.",role:"Associée — cabinet RH, Mons",text:"Les 166 commissions paritaires sont toutes à jour. Pour mes clients CP 302, CP 226 et CP 200, Aureus applique les bons barèmes automatiquement.",stars:5,lang:"fr"},
  {name:"Julien F.",role:"CEO — scale-up tech, Bruxelles",text:"Onboarding de 12 employés en une semaine. Contrats, Dimona, fiches SEPA — tout généré automatiquement. Impressionnant.",stars:5,lang:"fr"},
  {name:"Amina K.",role:"Gérante — pharmacie, Anderlecht",text:"Mon premier employé avec Aureus : exonération patronale an 1 calculée automatiquement. 4.200€ économisés dès la première année.",stars:5,lang:"fr"},
  {name:"Pierre H.",role:"Expert-comptable indépendant, Tournai",text:"Je recommande Aureus à tous mes clients employeurs. L'export WinBooks est parfait, les DmfA XML passent du premier coup.",stars:5,lang:"fr"},
  {name:"Céline R.",role:"Fondatrice — ASBL, Ottignies",text:"Le bonus emploi 2026 est calculé automatiquement pour chacun de mes travailleurs. Avant je passais 3h par mois sur les formules SPF Finances.",stars:5,lang:"fr"},
  {name:"Pieter V.",role:"Zaakvoerder — IT-bedrijf, Gent",text:"Overstap van Partena naar Aureus in 2 dagen. Alle gegevens overgenomen, geen enkele onderbreking. De DmfA XML werkt perfect.",stars:5,lang:"nl"},
  {name:"Liesbet D.",role:"HR-manager — non-profit, Antwerpen",text:"132 modules, allemaal bereikbaar vanuit één dashboard. De automatische Dimona-herinnering 24u op voorhand heeft ons al meerdere boetes bespaard.",stars:5,lang:"nl"},
  {name:"Wout M.",role:"Oprichter — designbureau, Leuven",text:"Eerste werknemer aangenomen zonder enige kennis van Belgisch sociaal recht. Aureus heeft me stap voor stap begeleid: ONSS, contract, Dimona, loonbrief.",stars:5,lang:"nl"},
  {name:"An V.",role:"Accountant — 31 dossiers, Brugge",text:"Het multi-mandanten portaal is een gamechanger. Ik beheer 31 werkgevers vanuit één scherm. De Mahis-mandaten worden automatisch gegenereerd.",stars:5,lang:"nl"},
  {name:"Stijn B.",role:"Zaakvoerder — horeca, Mechelen",text:"Voor Aureus betaalde ik SD Worx 320€/maand voor 3 werknemers. Nu is alles geautomatiseerd en begrijp ik eindelijk mijn patronale bijdragen.",stars:5,lang:"nl"},
  {name:"Karen J.",role:"Oprichtster — kinderopvang, Hasselt",text:"De lageloonvermindering en de vrijstelling eerste werknemer worden automatisch berekend. Ik bespaar meer dan 5.000€ per jaar.",stars:5,lang:"nl"},
  {name:"Raf D.",role:"Zelfstandige — consultant, Kortrijk",text:"SEPA pain.001 bestand in 3 klikken. Ik laad het rechtstreeks in mijn KBC-interface. Geen handmatige overschrijvingen meer.",stars:5,lang:"nl"},
  {name:"Sofie N.",role:"HR-directeur — vzw, Gent",text:"De WinBooks ACT export werkt perfect. Al mijn loonboekingen komen correct in de boekhouding terecht. Geen dubbele encodering meer.",stars:5,lang:"nl"},
  {name:"Tom V.",role:"CEO — e-commerce, Aalst",text:"Onboarding van 8 werknemers in één week. Contracten, Dimona, SEPA — alles automatisch gegenereerd. Indrukwekkend platform.",stars:5,lang:"nl"},
  {name:"Nele B.",role:"Zaakvoerster — kinesitherapie, Roeselare",text:"CP 330 correct geconfigureerd van bij de start. Alle barema's, sectorpremies en vakantiegeld automatisch berekend. Eindelijk rust.",stars:5,lang:"nl"},
  {name:"James R.",role:"CEO — fintech startup, Brussels",text:"Switched from Partena to Aureus. All payroll data migrated in 48 hours, zero downtime. The DmfA XML passes ONSS validation first time, every time.",stars:5,lang:"en"},
  {name:"Emma T.",role:"HR Director — NGO, Brussels",text:"Managing 15 employees across 3 joint committees was a nightmare. Aureus handles it all automatically. The compliance dashboard gives me peace of mind.",stars:5,lang:"en"},
  {name:"David K.",role:"Founder — SaaS company, Ghent",text:"First Belgian employee hired with zero prior knowledge of Belgian social law. Aureus guided me through ONSS registration, contract, Dimona and first payslip.",stars:5,lang:"en"},
  {name:"Sophie L.",role:"CFO — scale-up, Antwerp",text:"The SEPA pain.001 export is flawless. One file, 23 employees, all salaries processed in seconds. Our bank accepts it every single month.",stars:5,lang:"en"},
  {name:"Michael B.",role:"Accountant — 18 clients, Brussels",text:"The multi-client portal saved me hours every month. All Mahis mandates generated automatically. Best tool I've used in 12 years of accounting.",stars:5,lang:"en"},
  {name:"Klaus M.",role:"Geschäftsführer — Beratung, Brüssel",text:"Wechsel von SD Worx zu Aureus in 3 Tagen. Alle Daten migriert, kein Ausfall. Das DmfA XML wird vom ONSS beim ersten Versuch akzeptiert.",stars:5,lang:"de"},
  {name:"Anna S.",role:"HR-Managerin — Nonprofit, Lüttich",text:"132 Module, alle von einem Dashboard aus zugänglich. Die automatische Dimona-Erinnerung 24h vorher hat uns bereits mehrere Bußgelder erspart.",stars:5,lang:"de"},
  {name:"Stefan H.",role:"Gründer — IT-Agentur, Eupen",text:"Erster belgischer Arbeitnehmer ohne Kenntnisse des belgischen Sozialrechts eingestellt. Aureus hat mich Schritt für Schritt begleitet.",stars:5,lang:"de"},
  {name:"Monika W.",role:"Steuerberaterin — 22 Mandanten, Lüttich",text:"Das Multi-Mandanten-Portal ist revolutionär. Ich verwalte 22 Arbeitgeber von einem Bildschirm. Mahis-Mandate automatisch generiert.",stars:5,lang:"de"},
  {name:"Frank B.",role:"Geschäftsführer — Handwerk, Arlon",text:"Der WinBooks-Export funktioniert einwandfrei. Alle Lohnbuchungen kommen korrekt in der Buchhaltung an. Keine doppelte Erfassung mehr.",stars:5,lang:"de"},
];

const TR = {
  fr: {
    headline: 'Le secrétariat social\nbelge nouvelle génération.',
    sub: 'De la Dimona aux fiches de paie, Aureus Social Pro automatise l\'intégralité de vos obligations sociales belges.',
    connexion: 'Connexion', acces: 'Accédez à votre espace de gestion',
    email: 'EMAIL PROFESSIONNEL', pwd: 'MOT DE PASSE',
    btn: 'Se connecter →', btnMagic: 'Envoyer le lien →', loading: 'Connexion...',
    magic: '✨ Connexion par lien magique', backPwd: '← Connexion par mot de passe',
    secTitle: 'SÉCURITÉ',
    features: [
      { ico:'🏛', t:'Droit social belge 2026', d:'ONSS, DmfA, Belcotax, Dimona — mis à jour automatiquement.' },
      { ico:'⚡', t:'Automatisation complète', d:'Fiches de paie, virements SEPA, déclarations en quelques clics.' },
      { ico:'🔐', t:'Sécurité maximale', d:'Chiffrement AES-256-GCM · Hébergement UE · RGPD Art. 28.' },
      { ico:'🏢', t:'Multi-mandants', d:'Gérez plusieurs employeurs depuis un seul tableau de bord.' },
    ],
    guarantees: [
      { ico:'🏛', t:'Droit belge', d:'ONSS · DmfA · Dimona' },
      { ico:'💾', t:'Backup UE', d:'Frankfurt · 99.99% SLA' },
      { ico:'🔑', t:'2FA disponible', d:'Sécurité renforcée' },
      { ico:'📞', t:'Support dédié', d:'Réponse < 24h' },
    ],
    testimonials: [
      { name:'M. Janssen', role:'Expert-comptable · 23 dossiers', text:'Le portail multi-clients est exactement ce qu\'il manquait. Mandats Mahis générés automatiquement.' },
      { name:'S. Mbeki', role:'DRH · secteur associatif', text:'Migration depuis SD Worx en 3 jours. Toutes les données reprises, 0 interruption.' },
    ],
    stats: [
      { v:'132', l:'Modules actifs' }, { v:'166', l:'CP belges' }, { v:'8s', l:'Dimona' }, { v:'RGPD', l:'Conforme UE' },
    ],
    legal: 'Aureus IA SPRL · BCE BE 1028.230.781 · Place Marcel Broodthaers 8, 1060 Saint-Gilles\nHébergement UE · Chiffrement AES-256-GCM · Certifié RGPD Art. 28',
    legalShort: 'Aureus IA SPRL · BCE BE 1028.230.781\nDonnées hébergées en UE · Chiffrement AES-256',
  },
  nl: {
    headline: 'Het Belgische sociaal\nsecretariaat van de toekomst.',
    sub: 'Van Dimona tot loonfiches, Aureus Social Pro automatiseert al uw Belgische sociale verplichtingen.',
    connexion: 'Inloggen', acces: 'Toegang tot uw beheersomgeving',
    email: 'PROFESSIONEEL E-MAIL', pwd: 'WACHTWOORD',
    btn: 'Inloggen →', btnMagic: 'Link versturen →', loading: 'Bezig...',
    magic: '✨ Inloggen via magische link', backPwd: '← Inloggen met wachtwoord',
    secTitle: 'BEVEILIGING',
    features: [
      { ico:'🏛', t:'Belgisch sociaal recht 2026', d:'ONSS, DmfA, Belcotax, Dimona — automatisch bijgewerkt.' },
      { ico:'⚡', t:'Volledige automatisering', d:'Loonfiches, SEPA-overschrijvingen, aangiften in enkele klikken.' },
      { ico:'🔐', t:'Maximale beveiliging', d:'AES-256-GCM versleuteling · EU-hosting · AVG Art. 28.' },
      { ico:'🏢', t:'Multi-mandanten', d:'Beheer meerdere werkgevers vanuit één dashboard.' },
    ],
    guarantees: [
      { ico:'🏛', t:'Belgisch recht', d:'ONSS · DmfA · Dimona' },
      { ico:'💾', t:'EU-backup', d:'Frankfurt · 99,99% SLA' },
      { ico:'🔑', t:'2FA beschikbaar', d:'Versterkte beveiliging' },
      { ico:'📞', t:'Toegewijde support', d:'Antwoord < 24u' },
    ],
    testimonials: [
      { name:'M. Janssen', role:'Accountant · 23 dossiers', text:'Het multi-klanten portaal is precies wat ontbrak. Mahis-mandaten automatisch gegenereerd.' },
      { name:'S. Mbeki', role:'HR-directeur · vzw-sector', text:'Migratie van SD Worx in 3 dagen. Alle gegevens overgenomen, 0 onderbreking.' },
    ],
    stats: [
      { v:'132', l:'Actieve modules' }, { v:'166', l:'Belgische PC' }, { v:'8s', l:'Dimona' }, { v:'AVG', l:'Conform EU' },
    ],
    legal: 'Aureus IA SPRL · BCE BE 1028.230.781 · Place Marcel Broodthaers 8, 1060 Sint-Gillis\nEU-hosting · AES-256-GCM versleuteling · AVG Art. 28 gecertificeerd',
    legalShort: 'Aureus IA SPRL · BCE BE 1028.230.781\nGegevens gehost in EU · AES-256 versleuteling',
  },
  en: {
    headline: 'The next-generation\nBelgian payroll platform.',
    sub: 'From Dimona to payslips, Aureus Social Pro automates all your Belgian social obligations.',
    connexion: 'Sign in', acces: 'Access your management platform',
    email: 'PROFESSIONAL EMAIL', pwd: 'PASSWORD',
    btn: 'Sign in →', btnMagic: 'Send link →', loading: 'Signing in...',
    magic: '✨ Sign in with magic link', backPwd: '← Sign in with password',
    secTitle: 'SECURITY',
    features: [
      { ico:'🏛', t:'Belgian social law 2026', d:'ONSS, DmfA, Belcotax, Dimona — automatically updated.' },
      { ico:'⚡', t:'Full automation', d:'Payslips, SEPA transfers, declarations in a few clicks.' },
      { ico:'🔐', t:'Maximum security', d:'AES-256-GCM encryption · EU hosting · GDPR Art. 28.' },
      { ico:'🏢', t:'Multi-client', d:'Manage multiple employers from a single dashboard.' },
    ],
    guarantees: [
      { ico:'🏛', t:'Belgian law', d:'ONSS · DmfA · Dimona' },
      { ico:'💾', t:'EU backup', d:'Frankfurt · 99.99% SLA' },
      { ico:'🔑', t:'2FA available', d:'Enhanced security' },
      { ico:'📞', t:'Dedicated support', d:'Response < 24h' },
    ],
    testimonials: [
      { name:'M. Janssen', role:'Accountant · 23 files', text:'The multi-client portal is exactly what was missing. Mahis mandates generated automatically.' },
      { name:'S. Mbeki', role:'HR Director · non-profit', text:'Migration from SD Worx in 3 days. All data transferred, zero interruption.' },
    ],
    stats: [
      { v:'132', l:'Active modules' }, { v:'166', l:'Belgian JCs' }, { v:'8s', l:'Dimona' }, { v:'GDPR', l:'EU compliant' },
    ],
    legal: 'Aureus IA SPRL · BCE BE 1028.230.781 · Place Marcel Broodthaers 8, 1060 Saint-Gilles\nEU hosting · AES-256-GCM encryption · GDPR Art. 28 certified',
    legalShort: 'Aureus IA SPRL · BCE BE 1028.230.781\nData hosted in EU · AES-256 encryption',
  },
  de: {
    headline: 'Das belgische Sozialsekretariat\nder nächsten Generation.',
    sub: 'Von Dimona bis Lohnabrechnungen automatisiert Aureus Social Pro alle Ihre belgischen Sozialpflichten.',
    connexion: 'Anmelden', acces: 'Zugang zu Ihrer Verwaltungsplattform',
    email: 'GESCHÄFTLICHE E-MAIL', pwd: 'PASSWORT',
    btn: 'Anmelden →', btnMagic: 'Link senden →', loading: 'Anmeldung...',
    magic: '✨ Anmeldung per Magic-Link', backPwd: '← Anmeldung mit Passwort',
    secTitle: 'SICHERHEIT',
    features: [
      { ico:'🏛', t:'Belgisches Sozialrecht 2026', d:'ONSS, DmfA, Belcotax, Dimona — automatisch aktualisiert.' },
      { ico:'⚡', t:'Vollständige Automatisierung', d:'Lohnabrechnungen, SEPA-Überweisungen, Meldungen per Klick.' },
      { ico:'🔐', t:'Maximale Sicherheit', d:'AES-256-GCM-Verschlüsselung · EU-Hosting · DSGVO Art. 28.' },
      { ico:'🏢', t:'Multi-Mandant', d:'Mehrere Arbeitgeber von einem Dashboard verwalten.' },
    ],
    guarantees: [
      { ico:'🏛', t:'Belgisches Recht', d:'ONSS · DmfA · Dimona' },
      { ico:'💾', t:'EU-Backup', d:'Frankfurt · 99,99% SLA' },
      { ico:'🔑', t:'2FA verfügbar', d:'Erhöhte Sicherheit' },
      { ico:'📞', t:'Dedizierter Support', d:'Antwort < 24h' },
    ],
    testimonials: [
      { name:'M. Janssen', role:'Buchhalter · 23 Mandanten', text:'Das Multi-Mandanten-Portal ist genau das, was fehlte. Mahis-Mandate automatisch generiert.' },
      { name:'S. Mbeki', role:'HR-Direktor · Nonprofit', text:'Migration von SD Worx in 3 Tagen. Alle Daten übernommen, null Unterbrechungen.' },
    ],
    stats: [
      { v:'132', l:'Aktive Module' }, { v:'166', l:'Belgische KO' }, { v:'8s', l:'Dimona' }, { v:'DSGVO', l:'EU-konform' },
    ],
    legal: 'Aureus IA SPRL · BCE BE 1028.230.781 · Place Marcel Broodthaers 8, 1060 Saint-Gilles\nEU-Hosting · AES-256-GCM-Verschlüsselung · DSGVO Art. 28 zertifiziert',
    legalShort: 'Aureus IA SPRL · BCE BE 1028.230.781\nDaten in EU gehostet · AES-256-Verschlüsselung',
  },
};

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('password');
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState('fr');
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    try {
      const s = localStorage.getItem('aureus_theme'); if (s) setDark(s !== 'light');
      const l = localStorage.getItem('aureus_lang'); if (l && TR[l]) setLang(l);
    } catch(e) {}
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % 2), 5000);
    return () => clearInterval(t);
  }, []);

  const toggleTheme = () => {
    const next = !dark; setDark(next);
    try { localStorage.setItem('aureus_theme', next ? 'dark' : 'light'); } catch(e) {}
  };

  const switchLang = (l) => {
    setLang(l);
    try { localStorage.setItem('aureus_lang', l); } catch(e) {}
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    if (!supabase) { onLogin({ email: email || 'demo@aureus-ia.com', role: 'admin' }); setLoading(false); return; }
    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        setError('✅ ' + t.btn + ' ' + email);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data?.user) onLogin(data.user);
      }
    } catch (err) { setError(err.message || 'Erreur de connexion'); }
    setLoading(false);
  };

  const t = TR[lang] || TR.fr;

  // Couleurs
  const bg      = dark ? '#0c0b09' : '#f5f3ef';
  const bgL     = dark ? 'linear-gradient(135deg,#0c0b09 0%,#181613 60%,#1f1c17 100%)' : 'linear-gradient(135deg,#f5f3ef 0%,#ede9e1 100%)';
  const bgR     = dark ? '#111009' : '#ffffff';
  const ink     = dark ? '#e8e6e0' : '#0e0d0a';
  const mist    = dark ? '#7a7770' : '#1a1916';
  const stone   = dark ? '#5e5c56' : '#2a2826';
  const gold    = '#c6a34e';
  const border  = dark ? 'rgba(198,163,78,.15)' : 'rgba(14,13,10,.15)';
  const inputBg = dark ? 'rgba(0,0,0,.35)' : '#ffffff';
  const cardBg  = dark ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.04)';

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:bg, fontFamily:"'Inter',system-ui,sans-serif", position:'relative' }}>

      {/* Controls top-right */}
      <div style={{ position:'fixed', top:16, right:16, zIndex:999, display:'flex', gap:8, alignItems:'center' }}>
        {/* Lang switcher */}
        <div style={{ display:'flex', gap:4, background:cardBg, border:`1px solid ${border}`, borderRadius:8, padding:'4px 6px' }}>
          {['fr','nl','en','de'].map(l => (
            <button key={l} onClick={() => switchLang(l)}
              style={{ background: lang===l ? gold : 'transparent', color: lang===l ? '#0c0b09' : mist, border:'none', borderRadius:5, padding:'3px 8px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        {/* Theme toggle */}
        <button onClick={toggleTheme}
          style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:8, width:36, height:36, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}>
          {dark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* LEFT — Institutionnel */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'60px 72px', background:bgL, minWidth:0, overflowY:'auto' }}>
        <div>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:48 }}>
            <div style={{ width:40, height:40, background:'rgba(198,163,78,.12)', border:`1px solid ${border}`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>▲</div>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:gold, letterSpacing:'3px' }}>AUREUS</div>
              <div style={{ fontSize:10, color:mist, letterSpacing:'3px' }}>SOCIAL PRO</div>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize:36, fontWeight:800, color:ink, lineHeight:1.25, marginBottom:16, maxWidth:480, whiteSpace:'pre-line' }}>
            {t.headline.split('\n').map((l,i) => i===1 ? <span key={i} style={{color:gold}}>{l}</span> : <span key={i}>{l}<br/></span>)}
          </h1>
          <p style={{ fontSize:15, color:mist, lineHeight:1.75, maxWidth:420, marginBottom:36 }}>{t.sub}</p>

          {/* Stats */}
          <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:40 }}>
            {t.stats.map(k => (
              <div key={k.l} style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:10, padding:'12px 18px', textAlign:'center' }}>
                <div style={{ fontSize:20, fontWeight:800, color:gold }}>{k.v}</div>
                <div style={{ fontSize:10, color:stone, marginTop:2, letterSpacing:.5 }}>{k.l}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, maxWidth:480, marginBottom:40 }}>
            {t.features.map(f => (
              <div key={f.t} style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:10, padding:'14px 16px' }}>
                <div style={{ fontSize:18, marginBottom:6 }}>{f.ico}</div>
                <div style={{ fontSize:12, fontWeight:700, color:ink, marginBottom:3 }}>{f.t}</div>
                <div style={{ fontSize:11, color:mist, lineHeight:1.6 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Témoignages */}
        <div style={{ borderTop:`1px solid ${border}`, paddingTop:20, marginTop:8 }}>
          {(() => {
            const filtered = TESTIMONIALS_ALL.filter(a => a.lang === lang);
            const cur = filtered[slide % filtered.length];
            return cur ? (
              <>
                <div style={{ fontSize:16, color:gold, marginBottom:8 }}>★★★★★</div>
                <p style={{ fontSize:13, color:mist, fontStyle:'italic', lineHeight:1.7, marginBottom:10, minHeight:52 }}>
                  "{cur.text}"
                </p>
                <div style={{ fontSize:13, fontWeight:700, color:ink }}>{cur.name}</div>
                <div style={{ fontSize:11, color:stone, marginBottom:12 }}>{cur.role}</div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <button onClick={()=>setSlide(s=>(s-1+filtered.length)%filtered.length)}
                    style={{background:'none',border:`1px solid ${border}`,borderRadius:'50%',width:28,height:28,cursor:'pointer',color:mist,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
                  <div style={{ display:'flex', gap:4 }}>
                    {filtered.map((_,i)=>(
                      <div key={i} onClick={()=>setSlide(i)}
                        style={{width:i===slide%filtered.length?16:5,height:5,borderRadius:3,background:i===slide%filtered.length?gold:border,cursor:'pointer',transition:'all .3s'}}/>
                    ))}
                  </div>
                  <button onClick={()=>setSlide(s=>(s+1)%filtered.length)}
                    style={{background:'none',border:`1px solid ${border}`,borderRadius:'50%',width:28,height:28,cursor:'pointer',color:mist,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center'}}>→</button>
                  <span style={{fontSize:10,color:stone,marginLeft:4}}>{slide%filtered.length+1}/{filtered.length}</span>
                </div>
              </>
            ) : null;
          })()}
        </div>

                <div style={{ marginTop:20, fontSize:10, color:stone, lineHeight:1.8, whiteSpace:'pre-line' }}>{t.legal}</div>
      </div>

      {/* RIGHT — Formulaire */}
      <div style={{ width:460, display:'flex', alignItems:'center', justifyContent:'center', background:bgR, borderLeft:`1px solid ${border}`, padding:'80px 0 40px' }}>
        <div style={{ width:340 }}>
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:24, fontWeight:800, color:ink, marginBottom:5 }}>{t.connexion}</div>
            <div style={{ fontSize:13, color:mist }}>{t.acces}</div>
          </div>

          {/* Badges */}
          <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
            {['🔒 SSL','🇧🇪 EU','🛡 RGPD'].map(b => (
              <span key={b} style={{ fontSize:10, background:cardBg, border:`1px solid ${border}`, borderRadius:20, padding:'3px 10px', color:stone, fontWeight:600 }}>{b}</span>
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
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:10, fontWeight:700, color:stone, marginBottom:5, letterSpacing:.8 }}>{t.email}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="nom@entreprise.be"
                style={{ width:'100%', padding:'13px 16px', borderRadius:10, border:`1px solid ${border}`, background:inputBg, color:ink, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'border .2s' }}
                onFocus={e => e.target.style.borderColor=gold} onBlur={e => e.target.style.borderColor=border} />
            </div>

            {mode === 'password' && (
              <div style={{ marginBottom:22 }}>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:stone, marginBottom:5, letterSpacing:.8 }}>{t.pwd}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  style={{ width:'100%', padding:'13px 16px', borderRadius:10, border:`1px solid ${border}`, background:inputBg, color:ink, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'border .2s' }}
                  onFocus={e => e.target.style.borderColor=gold} onBlur={e => e.target.style.borderColor=border} />
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width:'100%', padding:'14px', borderRadius:10, border:'none', background: loading ? (dark?'#3a3830':'#ccc') : 'linear-gradient(135deg,#c6a34e,#a68a3c)', color:'#0c0b09', fontSize:14, fontWeight:800, cursor: loading ? 'wait' : 'pointer', fontFamily:'inherit', letterSpacing:'.5px' }}>
              {loading ? t.loading : mode === 'magic' ? t.btnMagic : t.btn}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:14 }}>
            <button type="button" onClick={() => setMode(mode === 'password' ? 'magic' : 'password')}
              style={{ background:'none', border:'none', color:gold, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
              {mode === 'password' ? t.magic : t.backPwd}
            </button>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:border }}/>
            <span style={{ fontSize:10, color:stone, fontWeight:700, letterSpacing:1 }}>{t.secTitle}</span>
            <div style={{ flex:1, height:1, background:border }}/>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {t.guarantees.map(g => (
              <div key={g.t} style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:8, padding:'11px 13px' }}>
                <div style={{ fontSize:15, marginBottom:3 }}>{g.ico}</div>
                <div style={{ fontSize:11, fontWeight:700, color:ink }}>{g.t}</div>
                <div style={{ fontSize:10, color:stone }}>{g.d}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:28, fontSize:10, color:stone, lineHeight:1.8, whiteSpace:'pre-line' }}>{t.legalShort}</div>
        </div>
      </div>
    </div>
  );
}
