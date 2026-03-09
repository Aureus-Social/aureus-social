'use client';
import { useState, useEffect, useRef } from 'react';

const G='#c6a34e', G2='#e8c97a', G3='#8a6f2e', BG='#07060a', W='#f0ede8', W2='#9a9690';

/* ── DONNÉES ─────────────────────────────────────────────────── */
const STATS = [
  { v:'229',   l:'Commissions paritaires' },
  { v:'106',   l:'Modules déployés' },
  { v:'99.97%',l:'Uptime plateforme' },
  { v:'1 274', l:'Fiches de paie calculées' },
];

const SERVICES = [
  { num:'01', title:'Secrétariat Social Digital', sub:'Gestion complète de votre paie belge',
    desc:"Dimona, DmfA, Belcotax, fiches de paie — chaque obligation sociale traitée avec précision pour vos travailleurs.", tags:['Dimona IN/OUT','Belcotax 281.10','DmfA trimestriel','229 CP'] },
  { num:'02', title:'Consultance RH & Sociale', sub:'Expertise en droit social belge',
    desc:"Contrats CDD/CDI, procédures de licenciement, calcul des préavis, optimisation de la rémunération nette.", tags:['CP 200','Préavis Claeys','CCT sectorielles','RGPD social'] },
  { num:'03', title:'Optimisation Fiscale Salariale', sub:'Maximiser le net sans augmenter le coût',
    desc:"Chèques-repas, éco-chèques, voiture de société, plan cafétéria — je maximise le pouvoir d'achat de vos équipes.", tags:['Plan cafétéria','ATN voiture','Bonus CCT 90','Flexijobs'] },
  { num:'04', title:'Support Fiduciaires', sub:'Partenaire technique pour experts-comptables',
    desc:"Migration depuis SD Worx / Partena / Securex, intégration export WinBooks, BOB, Octopus.", tags:['WinBooks','Exact Online','Peppol e-invoicing','Multi-dossiers'] },
];

const MODULES = [
  { icon:'🧮', t:'Calcul de Paie Complet', d:'Brut→Net, ONSS 13.07%, PP 16 params, barèmes 2024-2026' },
  { icon:'📡', t:'DIMONA Électronique', d:'IN/OUT/UPDATE XML, validation, suivi statut ONSS' },
  { icon:'📋', t:'DmfA XML ONSS', d:'Trimestres Q1-Q4, réduction structurelle, bonus emploi' },
  { icon:'📊', t:'Belcotax XML', d:'Fiches 281.10/20/30 conformes SPF Finances' },
  { icon:'🏦', t:'SEPA pain.001', d:'Virements batch ISO 20022, validation IBAN' },
  { icon:'✍️', t:'Signature Électronique', d:'Yousign + DocuSign : contrats, avenants, webhook' },
  { icon:'🌍', t:'Multi-devise & Expats', d:'11 devises, détachements A1, indemnités' },
  { icon:'📱', t:'PWA Mobile', d:'Installable, push notifs, mode offline' },
  { icon:'🔗', t:'API REST & Webhooks', d:'4 endpoints v1, HMAC-SHA256, BOB/Winbooks/Horus' },
  { icon:'📧', t:'5 Emails Auto', d:'Fiche, recap, alerte, rappel, facture' },
  { icon:'📁', t:'GED Documents', d:'8 catégories, rétention légale, Storage' },
  { icon:'⚖️', t:'63 Procédures RH', d:'12 sections : embauche, licenciement, absences, pension' },
  { icon:'🧾', t:'Facturation Cabinet', d:'Factures auto par ETP ou forfait, MRR tracking' },
  { icon:'📉', t:'Précompte Professionnel', d:'Annexe III AR, 16 paramètres, taxe communale' },
  { icon:'🏖️', t:'Pécule de Vacances', d:'Employé + ouvrier, prorata, provisions, C4-Vac' },
  { icon:'⚖️', t:'Solde Tout Compte', d:'Préavis, indemnités, vacances sortie, C4' },
  { icon:'🔔', t:'Alertes Intelligentes', d:'Échéances, calendrier social, règles légales' },
  { icon:'⚙️', t:'Admin Barèmes', d:'Constantes légales modifiables sans code' },
  { icon:'📈', t:'Reporting Avancé', d:'Bilan social BNB, analytics RH, export' },
  { icon:'📥', t:'Import Concurrent', d:'Parsers CSV multi-format, import automatique' },
];

const COMPARE = [
  { label:'Tarif mensuel (10 ETP)', aureus:'À consulter', grand:'€ 800-1 200', regional:'€ 600-900' },
  { label:'Interface moderne (React/Next.js)', aureus:'✓', grand:'✗', regional:'✗' },
  { label:'API REST publique', aureus:'✓', grand:'✗', regional:'✗' },
  { label:'Portail employé inclus', aureus:'✓', grand:'Option payante', regional:'Option payante' },
  { label:'Signature électronique', aureus:'✓', grand:'✗', regional:'✗' },
  { label:'PWA Mobile', aureus:'✓', grand:'✗', regional:'✗' },
  { label:'Multi-devise & expats', aureus:'✓', grand:'✓', regional:'✓' },
  { label:'Import concurrent (migration)', aureus:'✓', grand:'✗', regional:'✗' },
  { label:'Webhooks temps réel', aureus:'✓', grand:'✗', regional:'✗' },
  { label:'Déploiement continu', aureus:'✓', grand:'Trimestriel', regional:'Trimestriel' },
];

const SECURITY = [
  { icon:'🔑', t:'Chiffrement AES-256-GCM', d:'NISS et IBAN chiffrés au repos et en transit. Clés rotatives.' },
  { icon:'🛡️', t:'HSTS + CSP Headers', d:'Strict Transport Security max-age 2 ans, CSP restrictive.' },
  { icon:'🔒', t:'Row Level Security', d:'Isolation multi-tenant Supabase. Chaque client voit uniquement ses données.' },
  { icon:'🚫', t:'Anti Brute Force', d:'Rate limit 60 req/min, blocage 30 min après 5 échecs, timeout 15 min.' },
  { icon:'🌐', t:'Détection Géo-Intrusion', d:'Alerte DPO si connexion pays inhabituel. Journal complet des tentatives.' },
  { icon:'📋', t:'IP Whitelist + CIDR', d:'Restriction par adresse IP et plage CIDR. Interface admin.' },
  { icon:'🔍', t:'OWASP ZAP CI/CD', d:'Scan auto à chaque deploy + scan hebdo complet. GitHub Actions.' },
];

const EXPERTISE = [
  'Droit social belge (CP 100–375)','ONSS / Mahis / Dimona',
  'Belcotax & SPF Finances','Calcul préavis & C4',
  'Régularisation précompte','Plans cafétéria & ATN',
  'Activa.brussels & primes emploi','RGPD & sécurité des données',
];

/* ── MICRO COMPOSANTS ────────────────────────────────────────── */
const Tag = ({ c }) => (
  <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:3, border:`1px solid ${G}30`, background:`${G}08`, fontSize:10, color:G2, letterSpacing:'.5px', fontFamily:'monospace' }}>{c}</span>
);

function useInView(t=0.1) {
  const ref = useRef(null); const [v,setV] = useState(false);
  useEffect(()=>{
    const o = new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true);},{threshold:t});
    if(ref.current)o.observe(ref.current); return()=>o.disconnect();
  },[]);
  return [ref,v];
}

/* ── HERO ────────────────────────────────────────────────────── */
function Hero({onLogin}) {
  const [tick,setTick]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setTick(p=>(p+1)%4),3500);return()=>clearInterval(t);},[]);
  const words=['précision','conformité','efficacité','confiance'];
  return (
    <section style={{minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',textAlign:'center',padding:'80px 24px 60px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:`radial-gradient(ellipse 80% 60% at 50% 40%,${G}12 0%,transparent 70%)`}}/>
      <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:40,padding:'6px 18px',borderRadius:999,border:`1px solid ${G}30`,background:`${G}08`,fontSize:11,color:G2,letterSpacing:'1.5px',textTransform:'uppercase'}}>
        <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block',animation:'pulse 2s infinite'}}/>
        VERSION 18 — LIVE EN PRODUCTION
      </div>
      <div style={{fontSize:12,color:W2,letterSpacing:'4px',textTransform:'uppercase',marginBottom:16}}>Nourdin Moussati · Aureus IA SPRL</div>
      <h1 style={{fontSize:'clamp(36px,7vw,76px)',fontWeight:900,lineHeight:1.05,margin:'0 0 12px',letterSpacing:'-2px',maxWidth:900,background:`linear-gradient(135deg,${W} 30%,${G} 60%,${W} 90%)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
        L'administration sociale,<br/>gérée avec
      </h1>
      <div style={{fontSize:'clamp(36px,7vw,76px)',fontWeight:900,color:G,letterSpacing:'-2px',height:'1.15em',marginBottom:32,position:'relative',width:'100%',maxWidth:900}}>
        {words.map((w,i)=>(
          <span key={w} style={{position:'absolute',left:'50%',transform:'translateX(-50%)',whiteSpace:'nowrap',opacity:i===tick?1:0,transition:'opacity .7s ease'}}>{w}.</span>
        ))}
      </div>
      <p style={{fontSize:17,color:W2,maxWidth:600,lineHeight:1.75,margin:'0 0 48px'}}>
        Consultant indépendant en gestion sociale &amp; paie belge. Moteur de paie conforme SPF, déclarations ONSS automatiques, portails multi-tenant, sécurité de niveau bancaire.
      </p>
      <div style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center'}}>
        <button onClick={onLogin} style={{padding:'16px 40px',borderRadius:4,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${G3},${G},${G2})`,color:'#07060a',fontSize:13,fontWeight:800,letterSpacing:'1px',textTransform:'uppercase',boxShadow:`0 0 40px ${G}40`,transition:'all .3s'}}
          onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
          Accéder à la plateforme →
        </button>
        <a href="mailto:info@aureus-ia.com" style={{padding:'16px 40px',borderRadius:4,border:`1px solid ${G}40`,background:'transparent',color:G,fontSize:13,fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',textDecoration:'none',transition:'all .3s'}}
          onMouseEnter={e=>{e.currentTarget.style.background=`${G}10`;e.currentTarget.style.borderColor=G;}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor=`${G}40`;}}>
          Me contacter
        </a>
      </div>
      <div style={{position:'absolute',bottom:40,left:'50%',transform:'translateX(-50%)',animation:'bounce 2s infinite'}}>
        <div style={{width:24,height:38,border:`2px solid ${G}25`,borderRadius:12,display:'flex',justifyContent:'center',paddingTop:7}}>
          <div style={{width:4,height:8,borderRadius:2,background:G,animation:'scrolldown 2s infinite'}}/>
        </div>
      </div>
    </section>
  );
}

/* ── STATS ───────────────────────────────────────────────────── */
function Stats() {
  const [ref,v]=useInView();
  return (
    <section ref={ref} style={{padding:'60px 24px'}}>
      <div style={{maxWidth:900,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',border:`1px solid ${G}15`,overflow:'hidden'}}>
        {STATS.map((s,i)=>(
          <div key={i} style={{padding:'36px 20px',textAlign:'center',borderRight:i<3?`1px solid ${G}15`:'none',opacity:v?1:0,transform:v?'none':'translateY(20px)',transition:`all .6s ease ${i*.1}s`}}>
            <div style={{fontSize:'clamp(26px,4vw,42px)',fontWeight:900,color:G,letterSpacing:'-1px',lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:10,color:W2,marginTop:8,letterSpacing:'1px',textTransform:'uppercase'}}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── LIVE STATS ──────────────────────────────────────────────── */
function LiveStats() {
  const [ref,v]=useInView();
  const items=[
    {val:'1 274',label:'FICHES DE PAIE CALCULÉES'},
    {val:'42',label:'ENTREPRISES GÉRÉES'},
    {val:'99.97%',label:'UPTIME PLATEFORME'},
    {val:'392',label:'DÉCLARATIONS ONSS SOUMISES'},
  ];
  return (
    <section ref={ref} style={{padding:'60px 24px',background:`${G}04`}}>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:32,justifyContent:'center'}}>
          <span style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',animation:'pulse 2s infinite',display:'inline-block'}}/>
          <span style={{fontSize:11,color:'#22c55e',letterSpacing:'3px',textTransform:'uppercase'}}>LIVE — Plateforme opérationnelle</span>
        </div>
        {items.map((item,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 0',borderBottom:`1px solid ${G}10`,opacity:v?1:0,transform:v?'none':'translateX(-20px)',transition:`all .5s ease ${i*.1}s`}}>
            <span style={{fontSize:11,color:W2,letterSpacing:'2px',textTransform:'uppercase'}}>{item.label}</span>
            <span style={{fontSize:'clamp(28px,4vw,44px)',fontWeight:900,color:G,letterSpacing:'-1px'}}>{item.val}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── SERVICES ────────────────────────────────────────────────── */
function Services() {
  const [ref,v]=useInView();
  return (
    <section id="services" ref={ref} style={{padding:'80px 24px 100px'}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <div style={{marginBottom:64,opacity:v?1:0,transform:v?'none':'translateY(24px)',transition:'all .7s ease'}}>
          <div style={{fontSize:11,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:14}}>— Services</div>
          <h2 style={{fontSize:'clamp(28px,4vw,48px)',fontWeight:800,color:W,margin:0,letterSpacing:'-1px',lineHeight:1.1}}>Ce que je fais <span style={{color:G}}>pour vous.</span></h2>
        </div>
        <div>
          {SERVICES.map((s,i)=>(
            <div key={i} style={{borderTop:`1px solid ${G}15`,padding:'44px 0',display:'grid',gridTemplateColumns:'70px 1fr 1fr',gap:32,alignItems:'start',opacity:v?1:0,transform:v?'none':'translateX(-20px)',transition:`all .7s ease ${.1+i*.1}s`}}
              onMouseEnter={e=>e.currentTarget.style.background=`${G}04`}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{fontSize:11,color:G3,fontFamily:'monospace',paddingTop:4}}>{s.num}</div>
              <div>
                <div style={{fontSize:10,color:W2,letterSpacing:'2px',textTransform:'uppercase',marginBottom:8}}>{s.sub}</div>
                <h3 style={{fontSize:'clamp(18px,2.5vw,26px)',fontWeight:700,color:W,margin:0,letterSpacing:'-0.5px'}}>{s.title}</h3>
              </div>
              <div>
                <p style={{fontSize:14,color:W2,lineHeight:1.75,margin:'0 0 16px'}}>{s.desc}</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>{s.tags.map(t=><Tag key={t} c={t}/>)}</div>
              </div>
            </div>
          ))}
          <div style={{borderTop:`1px solid ${G}15`}}/>
        </div>
      </div>
    </section>
  );
}

/* ── MODULES ─────────────────────────────────────────────────── */
function Modules() {
  const [ref,v]=useInView();
  return (
    <section ref={ref} style={{padding:'80px 24px 100px',background:`${BG}`}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <div style={{marginBottom:16,opacity:v?1:0,transition:'all .7s ease'}}>
          <div style={{fontSize:11,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:14}}>— Fonctionnalités</div>
          <h2 style={{fontSize:'clamp(28px,5vw,56px)',fontWeight:900,color:W,margin:'0 0 8px',letterSpacing:'-2px',lineHeight:1.05}}>
            106 modules, <span style={{color:G,fontStyle:'italic'}}>zéro compromis</span>
          </h2>
          <p style={{fontSize:15,color:W2,margin:'0 0 48px'}}>106 modules déployés en production, couvrant l'intégralité du cycle de paie belge.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
          {MODULES.map((m,i)=>(
            <div key={i} style={{padding:'20px',border:`1px solid ${G}12`,borderRadius:4,background:`${G}04`,display:'flex',gap:14,alignItems:'flex-start',opacity:v?1:0,transform:v?'none':'translateY(12px)',transition:`all .4s ease ${.05+i*.03}s`}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=`${G}30`}
              onMouseLeave={e=>e.currentTarget.style.borderColor=`${G}12`}>
              <span style={{fontSize:20,flexShrink:0}}>{m.icon}</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:W,marginBottom:4}}>{m.t}</div>
                <div style={{fontSize:11,color:W2,lineHeight:1.5}}>{m.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── APERÇU DASHBOARD ────────────────────────────────────────── */
function DashboardPreview() {
  const [ref,v]=useInView();
  return (
    <section ref={ref} style={{padding:'80px 24px 100px',background:`${G}04`}}>
      <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
        <div style={{fontSize:11,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:16,opacity:v?1:0,transition:'all .6s'}}>— Aperçu</div>
        <h2 style={{fontSize:'clamp(28px,4vw,48px)',fontWeight:800,color:W,margin:'0 0 12px',letterSpacing:'-1px',opacity:v?1:0,transition:'all .7s .1s'}}>
          Découvrez l'<span style={{color:G,fontStyle:'italic'}}>interface</span>
        </h2>
        <p style={{fontSize:15,color:W2,margin:'0 0 40px',opacity:v?1:0,transition:'all .7s .2s'}}>Un aperçu de la plateforme en temps réel.</p>
        {/* Fausse fenêtre browser */}
        <div style={{border:`1px solid ${G}20`,borderRadius:8,overflow:'hidden',opacity:v?1:0,transform:v?'none':'translateY(24px)',transition:'all .8s .3s'}}>
          {/* Barre navigateur */}
          <div style={{background:'#1a1914',padding:'10px 16px',display:'flex',alignItems:'center',gap:8,borderBottom:`1px solid ${G}15`}}>
            <span style={{width:10,height:10,borderRadius:'50%',background:'#ff5f57',display:'inline-block'}}/>
            <span style={{width:10,height:10,borderRadius:'50%',background:'#febc2e',display:'inline-block'}}/>
            <span style={{width:10,height:10,borderRadius:'50%',background:'#28c840',display:'inline-block'}}/>
            <div style={{marginLeft:8,background:'#0d0c10',borderRadius:4,padding:'4px 12px',display:'flex',alignItems:'center',gap:6,flex:1,maxWidth:240}}>
              <span style={{fontSize:10}}>🔒</span>
              <span style={{fontSize:10,color:W2}}>app.aureussocial.be</span>
            </div>
          </div>
          {/* Contenu dashboard */}
          <div style={{background:'#0d0c10',padding:'24px',textAlign:'left'}}>
            <div style={{fontSize:14,fontWeight:700,color:G,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
              📊 Dashboard — Février 2026
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
              {[
                {v:'€ 127 450',l:'MASSE SALARIALE'},
                {v:'42',l:'TRAVAILLEURS ACTIFS'},
                {v:'€ 16 629',l:'ONSS PATRONAL'},
              ].map((c,i)=>(
                <div key={i} style={{background:'#1a1914',padding:'16px',borderRadius:6,border:`1px solid ${G}15`}}>
                  <div style={{fontSize:'clamp(16px,3vw,22px)',fontWeight:900,color:G,lineHeight:1.1}}>{c.v}</div>
                  <div style={{fontSize:9,color:W2,marginTop:4,letterSpacing:'1px'}}>{c.l}</div>
                </div>
              ))}
            </div>
            {/* Table employés */}
            <div style={{background:'#1a1914',borderRadius:6,overflow:'hidden',border:`1px solid ${G}15`}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'8px 16px',borderBottom:`1px solid ${G}10`}}>
                {['EMPLOYÉ','CP','BRUT','NET','STATUS'].map(h=>(
                  <span key={h} style={{fontSize:9,color:W2,letterSpacing:'1px'}}>{h}</span>
                ))}
              </div>
              {[
                {n:'Martin P.',cp:'200',b:'€ 3 250',net:'€ 2 147',s:'Calculé',sc:'#22c55e'},
                {n:'Duval J.',cp:'124',b:'€ 2 890',net:'€ 1 924',s:'Calculé',sc:'#22c55e'},
                {n:'Peeters A.',cp:'302',b:'€ 3 100',net:'€ 2 058',s:'En attente',sc:`${G}`},
                {n:'Lambert S.',cp:'200',b:'€ 4 200',net:'€ 2 689',s:'Calculé',sc:'#22c55e'},
              ].map((r,i)=>(
                <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'10px 16px',borderBottom:i<3?`1px solid ${G}08`:'none',alignItems:'center'}}>
                  <span style={{fontSize:12,color:W}}>{r.n}</span>
                  <span style={{fontSize:12,color:W2}}>{r.cp}</span>
                  <span style={{fontSize:12,color:W2}}>{r.b}</span>
                  <span style={{fontSize:12,color:W2}}>{r.net}</span>
                  <span style={{fontSize:10,color:r.sc,background:`${r.sc}15`,padding:'3px 8px',borderRadius:99,whiteSpace:'nowrap'}}>{r.s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── COMPARAISON ─────────────────────────────────────────────── */
function Compare() {
  const [ref,v]=useInView();
  return (
    <section ref={ref} style={{padding:'80px 24px 100px'}}>
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:48,opacity:v?1:0,transition:'all .7s'}}>
          <div style={{fontSize:11,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:16}}>— Comparaison</div>
          <h2 style={{fontSize:'clamp(28px,4vw,48px)',fontWeight:800,color:W,margin:'0 0 12px',letterSpacing:'-1px'}}>
            Pourquoi pas les <span style={{color:G,fontStyle:'italic'}}>autres</span> ?
          </h2>
          <p style={{fontSize:15,color:W2}}>Comparaison objective avec les solutions traditionnelles du marché belge.</p>
        </div>
        <div style={{overflowX:'auto',opacity:v?1:0,transform:v?'none':'translateY(20px)',transition:'all .8s .2s'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:500}}>
            <thead>
              <tr>
                <th style={{padding:'16px',textAlign:'left',fontSize:11,color:W2,letterSpacing:'1px',fontWeight:400,borderBottom:`1px solid ${G}20`}}></th>
                <th style={{padding:'16px',textAlign:'center',fontSize:13,color:G,fontWeight:800,letterSpacing:'1px',background:`${G}10`,borderBottom:`2px solid ${G}`}}>Aureus Social Pro</th>
                <th style={{padding:'16px',textAlign:'center',fontSize:12,color:W2,fontWeight:600,borderBottom:`1px solid ${G}20`}}>Grand SS traditionnel</th>
                <th style={{padding:'16px',textAlign:'center',fontSize:12,color:W2,fontWeight:600,borderBottom:`1px solid ${G}20`}}>SS régional</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row,i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${G}08`}}>
                  <td style={{padding:'14px 16px',fontSize:13,color:W2}}>{row.label}</td>
                  <td style={{padding:'14px 16px',textAlign:'center',background:`${G}06`,fontSize:13,
                    color: row.aureus==='✓'?'#22c55e': row.aureus==='✗'?'#ef4444':G,
                    fontWeight:row.aureus==='À consulter'?800:500}}>
                    {row.aureus}
                  </td>
                  <td style={{padding:'14px 16px',textAlign:'center',fontSize:13,
                    color: row.grand==='✓'?'#22c55e': row.grand==='✗'?'#ef4444':W2}}>
                    {row.grand}
                  </td>
                  <td style={{padding:'14px 16px',textAlign:'center',fontSize:13,
                    color: row.regional==='✓'?'#22c55e': row.regional==='✗'?'#ef4444':W2}}>
                    {row.regional}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ── SÉCURITÉ ────────────────────────────────────────────────── */
function Security() {
  const [ref,v]=useInView();
  return (
    <section ref={ref} style={{padding:'80px 24px 100px',background:`${G}04`}}>
      <div style={{maxWidth:1000,margin:'0 auto'}}>
        <div style={{marginBottom:48,opacity:v?1:0,transition:'all .7s'}}>
          <div style={{fontSize:11,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:14}}>— Sécurité</div>
          <h2 style={{fontSize:'clamp(28px,4vw,48px)',fontWeight:800,color:W,margin:'0 0 8px',letterSpacing:'-1px',lineHeight:1.1}}>
            Sécurité de <span style={{color:G,fontStyle:'italic'}}>niveau bancaire</span>
          </h2>
          <p style={{fontSize:15,color:W2}}>4 couches de protection. RGPD Art. 32 natif.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
          {SECURITY.map((s,i)=>(
            <div key={i} style={{padding:'20px',border:`1px solid ${G}12`,borderRadius:4,background:`${G}05`,display:'flex',gap:14,alignItems:'flex-start',opacity:v?1:0,transform:v?'none':'translateY(12px)',transition:`all .5s ease ${i*.07}s`}}>
              <span style={{fontSize:22,flexShrink:0}}>{s.icon}</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:W,marginBottom:4}}>{s.t}</div>
                <div style={{fontSize:11,color:W2,lineHeight:1.5}}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── À PROPOS ────────────────────────────────────────────────── */
function About() {
  const [ref,v]=useInView();
  return (
    <section id="propos" ref={ref} style={{padding:'80px 24px 100px'}}>
      <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center',opacity:v?1:0,transition:'all .8s ease'}}>
        <div>
          <div style={{fontSize:11,color:G,letterSpacing:'3px',textTransform:'uppercase',marginBottom:16}}>— À propos</div>
          <h2 style={{fontSize:'clamp(26px,3.5vw,42px)',fontWeight:800,color:W,margin:'0 0 24px',letterSpacing:'-1px',lineHeight:1.1}}>
            Une expertise de terrain,<br/><span style={{color:G}}>une plateforme sur mesure.</span>
          </h2>
          <p style={{fontSize:15,color:W2,lineHeight:1.8,margin:'0 0 16px'}}>
            J'ai fondé <strong style={{color:W}}>Aureus IA SPRL</strong> pour proposer une alternative sérieuse aux grands secrétariats sociaux belges. Moins de frais généraux, plus de réactivité, maîtrise totale du droit social belge.
          </p>
          <p style={{fontSize:15,color:W2,lineHeight:1.8,margin:'0 0 36px'}}>
            La plateforme <strong style={{color:W}}>Aureus Social Pro</strong> intègre nativement les 229 commissions paritaires, les dernières CCT et se connecte directement à l'ONSS via Mahis.
          </p>
          <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
            {[{v:'42',l:'Entreprises gérées'},{v:'392',l:'Déclarations ONSS'},{v:'99.97%',l:'Uptime production'}].map((item,i)=>(
              <div key={i}>
                <div style={{fontSize:20,fontWeight:900,color:G}}>{item.v}</div>
                <div style={{fontSize:10,color:W2,letterSpacing:'1px'}}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:10,color:W2,letterSpacing:'2px',textTransform:'uppercase',marginBottom:16}}>Domaines d'expertise</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {EXPERTISE.map((e,i)=>(
              <div key={i} style={{padding:'13px 16px',border:`1px solid ${G}12`,borderRadius:2,background:`${G}05`,fontSize:12,color:W2,display:'flex',alignItems:'center',gap:8,opacity:v?1:0,transform:v?'none':'translateY(10px)',transition:`all .5s ease ${.3+i*.05}s`}}>
                <span style={{color:G,fontSize:9}}>◆</span>{e}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── CTA FINAL ───────────────────────────────────────────────── */
function CTA({onLogin}) {
  const [ref,v]=useInView();
  return (
    <section ref={ref} style={{padding:'100px 24px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',background:`radial-gradient(ellipse 60% 80% at 50% 50%,${G}08 0%,transparent 70%)`}}/>
      <div style={{maxWidth:700,margin:'0 auto',textAlign:'center',opacity:v?1:0,transform:v?'none':'translateY(32px)',transition:'all .8s ease'}}>
        <h2 style={{fontSize:'clamp(28px,5vw,52px)',fontWeight:900,color:W,margin:'0 0 16px',letterSpacing:'-2px',lineHeight:1.05}}>
          Parlons de <span style={{color:G}}>vos besoins.</span>
        </h2>
        <p style={{fontSize:16,color:W2,margin:'0 0 48px',lineHeight:1.8}}>
          Audit gratuit de votre situation sociale. Réponse sous 24h.
        </p>
        <div style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center',marginBottom:24}}>
          <button onClick={onLogin} style={{padding:'18px 56px',borderRadius:4,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${G3},${G},${G2})`,color:'#07060a',fontSize:14,fontWeight:800,letterSpacing:'1.5px',textTransform:'uppercase',boxShadow:`0 0 60px ${G}30`,transition:'all .3s'}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 8px 60px ${G}50`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=`0 0 60px ${G}30`;}}>
            Accéder à la plateforme →
          </button>
          <a href="mailto:info@aureus-ia.com" style={{padding:'18px 40px',borderRadius:4,border:`1px solid ${G}40`,background:'transparent',color:G,fontSize:14,fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',textDecoration:'none',transition:'all .3s',display:'flex',alignItems:'center',gap:8}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${G}10`;e.currentTarget.style.borderColor=G;}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor=`${G}40`;}}>
            ✉ info@aureus-ia.com
          </a>
        </div>
        <div style={{fontSize:11,color:W2,letterSpacing:'1px'}}>BCE BE 1028.230.781 · Place Marcel Broodthaers 8, 1060 Saint-Gilles</div>
      </div>
    </section>
  );
}

/* ── FOOTER ──────────────────────────────────────────────────── */
function Footer({onLogin}) {
  return (
    <footer style={{padding:'32px 24px',borderTop:`1px solid ${G}12`}}>
      <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
        <div>
          <div style={{fontSize:14,fontWeight:900,color:G,letterSpacing:'2px'}}>AUREUS</div>
          <div style={{fontSize:9,color:W2,letterSpacing:'3px',marginTop:2}}>SOCIAL PRO · IA SPRL</div>
        </div>
        <div style={{fontSize:11,color:W2,textAlign:'center'}}>BCE BE 1028.230.781 · Saint-Gilles, Bruxelles</div>
        <button onClick={onLogin} style={{padding:'10px 22px',borderRadius:3,border:`1px solid ${G}30`,background:'transparent',color:G,fontSize:11,cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase',fontFamily:'inherit',transition:'all .2s'}}
          onMouseEnter={e=>e.currentTarget.style.background=`${G}10`}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          Connexion →
        </button>
      </div>
    </footer>
  );
}

/* ── PAGE PRINCIPALE ─────────────────────────────────────────── */
export default function LandingPage() {
  const handleLogin = () => { window.location.href = '/'; };
  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:${BG};color:${W};font-family:Georgia,'Times New Roman',serif;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(1.4);}}
        @keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(8px);}}
        @keyframes scrolldown{0%{opacity:1;transform:translateY(0);}100%{opacity:0;transform:translateY(10px);}}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:${BG};}
        ::-webkit-scrollbar-thumb{background:${G}40;border-radius:2px;}
        @media(max-width:768px){
          [data-grid="2"]{grid-template-columns:1fr!important;}
          [data-grid="4"]{grid-template-columns:repeat(2,1fr)!important;}
          [data-grid="service"]{grid-template-columns:1fr!important;}
        }
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'14px 32px',display:'flex',justifyContent:'space-between',alignItems:'center',background:`${BG}e0`,backdropFilter:'blur(16px)',borderBottom:`1px solid ${G}10`}}>
        <div style={{display:'flex',alignItems:'baseline',gap:10}}>
          <span style={{fontSize:15,fontWeight:900,color:G,letterSpacing:'2px'}}>AUREUS</span>
          <span style={{fontSize:9,color:W2,letterSpacing:'3px',textTransform:'uppercase'}}>Social Pro</span>
        </div>
        <div style={{display:'flex',gap:24,alignItems:'center'}}>
          {[['Services','#services'],['Fonctionnalités','#fonctionnalites'],['À propos','#propos']].map(([l,h])=>(
            <a key={l} href={h} style={{fontSize:11,color:W2,textDecoration:'none',letterSpacing:'1px',textTransform:'uppercase',transition:'color .2s'}}
              onMouseEnter={e=>e.currentTarget.style.color=G} onMouseLeave={e=>e.currentTarget.style.color=W2}>{l}</a>
          ))}
          <button onClick={handleLogin} style={{padding:'9px 22px',borderRadius:3,border:`1px solid ${G}40`,background:`${G}10`,color:G,fontSize:11,cursor:'pointer',letterSpacing:'1px',textTransform:'uppercase',fontFamily:'inherit',transition:'all .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=G;e.currentTarget.style.color=BG;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${G}10`;e.currentTarget.style.color=G;}}>
            Connexion
          </button>
        </div>
      </nav>

      <div style={{paddingTop:64}} id="fonctionnalites">
        <Hero onLogin={handleLogin}/>
        <Stats/>
        <LiveStats/>
        <Services/>
        <Modules/>
        <DashboardPreview/>
        <Compare/>
        <Security/>
        <About/>
        <CTA onLogin={handleLogin}/>
        <Footer onLogin={handleLogin}/>
      </div>
    </>
  );
}
