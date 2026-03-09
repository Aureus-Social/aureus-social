'use client';
import { useState, useEffect, useRef } from 'react';

const G   = '#c6a34e';
const G2  = '#e8c97a';
const G3  = '#8a6f2e';
const BG  = '#07060a';
const W   = '#f0ede8';
const W2  = '#9a9690';

const SERVICES = [
  { num:'01', title:'Secrétariat Social Digital', sub:'Gestion complète de votre paie belge', desc:"Dimona, DmfA, Belcotax, fiches de paie — chaque obligation sociale traitée avec précision pour vos travailleurs.", tags:['Dimona IN/OUT','Belcotax 281.10','DmfA trimestriel','228 CP'] },
  { num:'02', title:'Consultance RH & Sociale', sub:'Expertise en droit social belge', desc:"Contrats CDD/CDI, procédures de licenciement, calcul des préavis, optimisation de la rémunération nette — je vous accompagne à chaque étape.", tags:['CP 200','Préavis Claeys','CCT sectorielles','RGPD social'] },
  { num:'03', title:'Optimisation Fiscale Salariale', sub:'Maximiser le net sans augmenter le coût', desc:"Chèques-repas, éco-chèques, voiture de société, plan cafétéria — j'identifie les leviers qui maximisent le pouvoir d'achat de vos équipes.", tags:['Plan cafétéria','ATN voiture','Bonus CCT 90','Flexijobs'] },
  { num:'04', title:'Support Fiduciaires', sub:'Partenaire technique pour experts-comptables', desc:"Reprise de portefeuilles sociaux, migration depuis SD Worx / Partena / Securex, intégration export comptable WinBooks, BOB, Octopus.", tags:['WinBooks','Exact Online','Peppol e-invoicing','Multi-dossiers'] },
];

const STATS = [
  { v:'228', l:'Commissions paritaires' },
  { v:'64',  l:'Procédures RH documentées' },
  { v:'< 8s',l:'Déclaration Dimona' },
  { v:'100%',l:'Droit belge natif' },
];

const EXPERTISE = [
  'Droit social belge (CP 100–375)',
  'ONSS / Mahis / Dimona',
  'Belcotax & SPF Finances',
  'Calcul préavis & C4',
  'Régularisation précompte',
  'Plans cafétéria & ATN',
  'Activa.brussels & primes emploi',
  'RGPD & sécurité des données',
];

const Tag = ({ children }) => (
  <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:3, border:`1px solid ${G}30`, background:`${G}08`, fontSize:10, color:G2, letterSpacing:'.5px', fontFamily:'monospace' }}>{children}</span>
);

function useInView() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Hero({ onLogin }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(p => (p+1)%4), 3500); return () => clearInterval(t); }, []);
  const words = ['précision','conformité','efficacité','confiance'];

  return (
    <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', textAlign:'center', padding:'80px 24px 60px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:`radial-gradient(ellipse 80% 60% at 50% 40%, ${G}12 0%, transparent 70%)` }} />

      <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:40, padding:'6px 18px', borderRadius:999, border:`1px solid ${G}30`, background:`${G}08`, fontSize:11, color:G2, letterSpacing:'1.5px', textTransform:'uppercase' }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block', animation:'pulse 2s infinite' }} />
        Disponible · Bruxelles & Remote
      </div>

      <div style={{ fontSize:12, color:W2, letterSpacing:'4px', textTransform:'uppercase', marginBottom:16 }}>Nourdin Moussati · Aureus IA SPRL</div>

      <h1 style={{ fontSize:'clamp(36px,7vw,76px)', fontWeight:900, lineHeight:1.05, margin:'0 0 12px', letterSpacing:'-2px', maxWidth:900, background:`linear-gradient(135deg, ${W} 30%, ${G} 60%, ${W} 90%)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
        La paie belge.<br />Gérée avec
      </h1>
      <div style={{ fontSize:'clamp(36px,7vw,76px)', fontWeight:900, color:G, letterSpacing:'-2px', height:'1.1em', marginBottom:32, position:'relative' }}>
        {words.map((w,i) => (
          <span key={w} style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', opacity:i===tick?1:0, transition:'opacity .7s ease' }}>{w}.</span>
        ))}
      </div>

      <p style={{ fontSize:17, color:W2, maxWidth:560, lineHeight:1.75, margin:'0 0 48px' }}>
        Consultant indépendant en gestion sociale & paie belge. Je pilote votre secrétariat social avec une plateforme propriétaire construite sur 10 ans d'expertise terrain.
      </p>

      <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
        <button onClick={onLogin} style={{ padding:'16px 40px', borderRadius:4, border:'none', cursor:'pointer', background:`linear-gradient(135deg,${G3},${G},${G2})`, color:'#07060a', fontSize:13, fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', boxShadow:`0 0 40px ${G}40`, transition:'all .3s' }}
          onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
          Accéder à la plateforme →
        </button>
        <a href="mailto:nourdin@aureus-ia.be" style={{ padding:'16px 40px', borderRadius:4, border:`1px solid ${G}40`, background:'transparent', color:G, fontSize:13, fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', textDecoration:'none', transition:'all .3s' }}
          onMouseEnter={e=>{e.currentTarget.style.background=`${G}10`;e.currentTarget.style.borderColor=G;}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor=`${G}40`;}}>
          Me contacter
        </a>
      </div>

      <div style={{ position:'absolute', bottom:40, left:'50%', transform:'translateX(-50%)', animation:'bounce 2s infinite' }}>
        <div style={{ width:24, height:38, border:`2px solid ${G}25`, borderRadius:12, display:'flex', justifyContent:'center', paddingTop:7 }}>
          <div style={{ width:4, height:8, borderRadius:2, background:G, animation:'scrolldown 2s infinite' }} />
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} style={{ padding:'60px 24px' }}>
      <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', border:`1px solid ${G}15`, overflow:'hidden' }}>
        {STATS.map((s,i) => (
          <div key={i} style={{ padding:'40px 24px', textAlign:'center', borderRight:i<3?`1px solid ${G}15`:'none', opacity:visible?1:0, transform:visible?'none':'translateY(20px)', transition:`all .6s ease ${i*.1}s` }}>
            <div style={{ fontSize:'clamp(28px,4vw,44px)', fontWeight:900, color:G, letterSpacing:'-1px', lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:10, color:W2, marginTop:8, letterSpacing:'1px', textTransform:'uppercase' }}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Services() {
  const [ref, visible] = useInView();
  return (
    <section id="services" ref={ref} style={{ padding:'80px 24px 120px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ marginBottom:64, opacity:visible?1:0, transform:visible?'none':'translateY(24px)', transition:'all .7s ease' }}>
          <div style={{ fontSize:11, color:G, letterSpacing:'3px', textTransform:'uppercase', marginBottom:14 }}>— Services</div>
          <h2 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:W, margin:0, letterSpacing:'-1px', lineHeight:1.1 }}>
            Ce que je fais <span style={{ color:G }}>pour vous.</span>
          </h2>
        </div>
        <div>
          {SERVICES.map((s,i) => (
            <div key={i} style={{ borderTop:`1px solid ${G}15`, padding:'48px 0', display:'grid', gridTemplateColumns:'70px 1fr 1fr', gap:32, alignItems:'start', opacity:visible?1:0, transform:visible?'none':'translateX(-20px)', transition:`all .7s ease ${.1+i*.1}s`, cursor:'default' }}
              onMouseEnter={e=>e.currentTarget.style.background=`${G}04`}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{ fontSize:11, color:G3, fontFamily:'monospace', paddingTop:4 }}>{s.num}</div>
              <div>
                <div style={{ fontSize:10, color:W2, letterSpacing:'2px', textTransform:'uppercase', marginBottom:8 }}>{s.sub}</div>
                <h3 style={{ fontSize:'clamp(18px,2.5vw,26px)', fontWeight:700, color:W, margin:0, letterSpacing:'-0.5px' }}>{s.title}</h3>
              </div>
              <div>
                <p style={{ fontSize:14, color:W2, lineHeight:1.75, margin:'0 0 18px' }}>{s.desc}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>{s.tags.map(t=><Tag key={t}>{t}</Tag>)}</div>
              </div>
            </div>
          ))}
          <div style={{ borderTop:`1px solid ${G}15` }} />
        </div>
      </div>
    </section>
  );
}

function About() {
  const [ref, visible] = useInView();
  return (
    <section id="propos" ref={ref} style={{ padding:'80px 24px 120px', background:`${G}04` }}>
      <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center', opacity:visible?1:0, transition:'all .8s ease' }}>
        <div>
          <div style={{ fontSize:11, color:G, letterSpacing:'3px', textTransform:'uppercase', marginBottom:16 }}>— À propos</div>
          <h2 style={{ fontSize:'clamp(26px,3.5vw,42px)', fontWeight:800, color:W, margin:'0 0 24px', letterSpacing:'-1px', lineHeight:1.1 }}>
            Une expertise de terrain,<br /><span style={{ color:G }}>une plateforme sur mesure.</span>
          </h2>
          <p style={{ fontSize:15, color:W2, lineHeight:1.8, margin:'0 0 16px' }}>
            J'ai fondé <strong style={{ color:W }}>Aureus IA SPRL</strong> pour proposer une alternative sérieuse aux grands secrétariats sociaux belges. Moins de frais généraux, plus de réactivité, maîtrise totale du droit social belge.
          </p>
          <p style={{ fontSize:15, color:W2, lineHeight:1.8, margin:'0 0 36px' }}>
            La plateforme <strong style={{ color:W }}>Aureus Social Pro</strong> intègre nativement les 228 commissions paritaires, les dernières CCT et se connecte directement à l'ONSS via Mahis. C'est l'outil que j'utilise pour gérer vos dossiers en temps réel.
          </p>
          <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            {[{ v:'BCE', l:'BE 1028.230.781' },{ v:'Agréé', l:'Prestataire Mahis ONSS' },{ v:'1060', l:'Saint-Gilles, Bruxelles' }].map((item,i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', gap:2 }}>
                <div style={{ fontSize:20, fontWeight:900, color:G }}>{item.v}</div>
                <div style={{ fontSize:10, color:W2, letterSpacing:'1px' }}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize:10, color:W2, letterSpacing:'2px', textTransform:'uppercase', marginBottom:16 }}>Domaines d'expertise</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {EXPERTISE.map((e,i) => (
              <div key={i} style={{ padding:'13px 16px', border:`1px solid ${G}12`, borderRadius:2, background:`${G}05`, fontSize:12, color:W2, display:'flex', alignItems:'center', gap:8, opacity:visible?1:0, transform:visible?'none':'translateY(10px)', transition:`all .5s ease ${.3+i*.05}s` }}>
                <span style={{ color:G, fontSize:9 }}>◆</span>{e}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Platform({ onLogin }) {
  const [ref, visible] = useInView();
  const feats = [
    { icon:'⚡', t:'Dimona < 8s', d:'Connexion directe ONSS/Mahis' },
    { icon:'🧮', t:'228 CP intégrées', d:'Barèmes sectoriels à jour' },
    { icon:'📊', t:'Belcotax XML', d:'Fiches 281.10/20/30 conformes' },
    { icon:'📁', t:'6 formats export', d:'WinBooks, BOB, Octopus…' },
    { icon:'🔐', t:'AES-256 RGPD', d:'Chiffrement bancaire' },
    { icon:'📋', t:'64 procédures RH', d:'Documentées & actionnables' },
  ];
  return (
    <section ref={ref} style={{ padding:'100px 24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:`radial-gradient(ellipse 60% 80% at 50% 50%, ${G}08 0%, transparent 70%)` }} />
      <div style={{ maxWidth:800, margin:'0 auto', textAlign:'center', opacity:visible?1:0, transform:visible?'none':'translateY(32px)', transition:'all .8s ease' }}>
        <div style={{ fontSize:11, color:G, letterSpacing:'3px', textTransform:'uppercase', marginBottom:20 }}>— Plateforme</div>
        <h2 style={{ fontSize:'clamp(28px,5vw,54px)', fontWeight:900, color:W, margin:'0 0 20px', letterSpacing:'-2px', lineHeight:1.05 }}>Aureus Social Pro</h2>
        <p style={{ fontSize:16, color:W2, lineHeight:1.8, margin:'0 0 48px' }}>
          La plateforme de gestion sociale belge que j'ai construite. Dimona, DmfA, Belcotax, 64 procédures RH, 41 simulateurs, exports comptables multi-formats.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:48, textAlign:'left' }}>
          {feats.map((f,i) => (
            <div key={i} style={{ padding:'20px', border:`1px solid ${G}12`, borderRadius:4, background:`${G}04`, opacity:visible?1:0, transition:`all .5s ease ${.2+i*.07}s` }}>
              <div style={{ fontSize:22, marginBottom:8 }}>{f.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:W, marginBottom:4 }}>{f.t}</div>
              <div style={{ fontSize:11, color:W2 }}>{f.d}</div>
            </div>
          ))}
        </div>
        <button onClick={onLogin} style={{ padding:'18px 56px', borderRadius:4, border:'none', cursor:'pointer', background:`linear-gradient(135deg,${G3},${G},${G2})`, color:'#07060a', fontSize:14, fontWeight:800, letterSpacing:'1.5px', textTransform:'uppercase', boxShadow:`0 0 60px ${G}30`, transition:'all .3s' }}
          onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 8px 60px ${G}50`;}}
          onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=`0 0 60px ${G}30`;}}>
          Accéder à la plateforme →
        </button>
      </div>
    </section>
  );
}

function Contact() {
  const [ref, visible] = useInView();
  return (
    <section id="contact" ref={ref} style={{ padding:'80px 24px 120px' }}>
      <div style={{ width:'100%', height:1, background:`linear-gradient(90deg,transparent,${G}30,transparent)`, marginBottom:80 }} />
      <div style={{ maxWidth:680, margin:'0 auto', textAlign:'center', opacity:visible?1:0, transform:visible?'none':'translateY(24px)', transition:'all .7s ease' }}>
        <h2 style={{ fontSize:'clamp(24px,4vw,40px)', fontWeight:800, color:W, margin:'0 0 14px', letterSpacing:'-1px' }}>Parlons de vos besoins.</h2>
        <p style={{ fontSize:15, color:W2, margin:'0 0 40px', lineHeight:1.75 }}>Audit gratuit de votre situation sociale. Réponse sous 24h.</p>
        <div style={{ display:'flex', flexDirection:'column', gap:12, alignItems:'center' }}>
          <a href="mailto:nourdin@aureus-ia.be" style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 32px', border:`1px solid ${G}30`, borderRadius:4, color:W, textDecoration:'none', fontSize:14, background:`${G}06`, transition:'all .3s' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=G;e.currentTarget.style.background=`${G}12`;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=`${G}30`;e.currentTarget.style.background=`${G}06`;}}>
            <span style={{ color:G }}>✉</span> nourdin@aureus-ia.be
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer({ onLogin }) {
  return (
    <footer style={{ padding:'36px 24px', borderTop:`1px solid ${G}12` }}>
      <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:900, color:G, letterSpacing:'2px' }}>AUREUS</div>
          <div style={{ fontSize:9, color:W2, letterSpacing:'3px', marginTop:2 }}>SOCIAL PRO · IA SPRL</div>
        </div>
        <div style={{ fontSize:11, color:W2, textAlign:'center' }}>BCE BE 1028.230.781 · Saint-Gilles, Bruxelles</div>
        <button onClick={onLogin} style={{ padding:'10px 22px', borderRadius:3, border:`1px solid ${G}30`, background:'transparent', color:G, fontSize:11, cursor:'pointer', letterSpacing:'1px', textTransform:'uppercase', fontFamily:'inherit', transition:'all .2s' }}
          onMouseEnter={e=>e.currentTarget.style.background=`${G}10`}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          Connexion →
        </button>
      </div>
    </footer>
  );
}

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
          [style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important;}
          [style*="grid-template-columns: repeat(4"]{grid-template-columns:repeat(2,1fr)!important;}
          [style*="grid-template-columns: repeat(3"]{grid-template-columns:repeat(2,1fr)!important;}
          [style*="grid-template-columns: 70px 1fr 1fr"]{grid-template-columns:1fr!important;}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'14px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', background:`${BG}e0`, backdropFilter:'blur(16px)', borderBottom:`1px solid ${G}10` }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:10 }}>
          <span style={{ fontSize:15, fontWeight:900, color:G, letterSpacing:'2px' }}>AUREUS</span>
          <span style={{ fontSize:9, color:W2, letterSpacing:'3px', textTransform:'uppercase' }}>Social Pro</span>
        </div>
        <div style={{ display:'flex', gap:28, alignItems:'center' }}>
          {[['Services','#services'],['À propos','#propos'],['Contact','#contact']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize:11, color:W2, textDecoration:'none', letterSpacing:'1px', textTransform:'uppercase', transition:'color .2s' }}
              onMouseEnter={e=>e.currentTarget.style.color=G} onMouseLeave={e=>e.currentTarget.style.color=W2}>{l}</a>
          ))}
          <button onClick={handleLogin} style={{ padding:'9px 22px', borderRadius:3, border:`1px solid ${G}40`, background:`${G}10`, color:G, fontSize:11, cursor:'pointer', letterSpacing:'1px', textTransform:'uppercase', fontFamily:'inherit', transition:'all .2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background=G;e.currentTarget.style.color=BG;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${G}10`;e.currentTarget.style.color=G;}}>
            Connexion
          </button>
        </div>
      </nav>

      <div style={{ paddingTop:64 }}>
        <Hero onLogin={handleLogin} />
        <Stats />
        <Services />
        <About />
        <Platform onLogin={handleLogin} />
        <Contact />
        <Footer onLogin={handleLogin} />
      </div>
    </>
  );
}
