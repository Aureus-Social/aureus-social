'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const FEATURES = [
  {icon:'\u2261',title:'Gestion Clients',desc:'Gerez vos dossiers clients, entreprises et contacts depuis une interface unique et securisee.'},
  {icon:'\u263A',title:'Travailleurs',desc:'Fiches signaletiques completes: contrat, NISS, regime, salaire, situation familiale.'},
  {icon:'\u20AC',title:'Moteur de Paie',desc:'Calcul automatique: ONSS 13.07%, precompte professionnel, CSS, net. Baremes belges 2026.'},
  {icon:'\u2193',title:'Fiches PDF',desc:'Generation et impression de fiches de paie professionnelles conformes en un clic.'},
  {icon:'\u2192',title:'Fichier SEPA',desc:'Export XML SEPA pain.001 pour virements salaires directement vers votre banque.'},
  {icon:'\u2191',title:'Dimona',desc:'Declarations d entree et sortie des travailleurs aupres de l ONSS en temps reel.'},
  {icon:'\u2726',title:'ONSS / DmfA',desc:'Declarations trimestrielles, calcul cotisations patronales et personnelles.'},
  {icon:'\u2630',title:'Baremes & CP',desc:'11 commissions paritaires, verification salaire minimum, indexation automatique.'},
  {icon:'\u2600',title:'Vacances',desc:'Conges legaux, pecule simple et double, solde par travailleur, exercice annuel.'},
  {icon:'\u2605',title:'Cheques-repas',desc:'Configuration valeur faciale, parts patronale et ouvriere, commande mensuelle.'},
  {icon:'\u2714',title:'Attestations',desc:'Generation automatique: attestation de travail, C4, fiches 281.10.'},
  {icon:'\u26A0',title:'Notifications',desc:'Alertes echeances ONSS, CDD expirants, Dimona, provisions mensuelles.'},
];

const STATS = [
  {value:'155+',label:'Fonctionnalites'},
  {value:'17',label:'Modules specialises'},
  {value:'100%',label:'Legislation belge 2026'},
  {value:'0',label:'Installation requise'},
];

const TESTIMONIALS = [
  {name:'Cabinet Verstraeten',role:'Fiduciaire — Bruxelles',text:'Aureus Social Pro a transforme notre gestion de paie. On gagne 3 heures par semaine minimum. L interface est claire et les calculs toujours justes.'},
  {name:'Bureau Peeters & Co',role:'Secretariat social — Anvers',text:'Fini les erreurs de precompte et les fichiers Excel. Le SEPA et les fiches PDF nous font gagner un temps considerable chaque mois.'},
  {name:'Fiduciaire Lambert',role:'Expert-comptable — Liege',text:'La conformite legale est impeccable. Les baremes sont toujours a jour et les notifications nous evitent d oublier les echeances ONSS.'},
];

const FAQ = [
  {q:'Aureus Social Pro remplace-t-il un secretariat social agree?',a:'Non, Aureus Social Pro est un outil professionnel de gestion et de calcul de paie. Il facilite considerablement le travail des fiduciaires et bureaux sociaux mais ne remplace pas l agrement officiel d un secretariat social.'},
  {q:'Les calculs sont-ils conformes a la legislation belge?',a:'Oui, tous les baremes (ONSS 13.07%, precompte professionnel par tranches, cotisation speciale de securite sociale) sont implementes selon les taux officiels 2026. Les mises a jour sont automatiques.'},
  {q:'Puis-je gerer plusieurs entreprises clientes?',a:'Absolument. Le systeme multi-tenant avec Row Level Security permet a chaque fiduciaire de gerer un portefeuille complet de clients, chacun avec ses propres travailleurs et fiches de paie. Les donnees sont strictement isolees.'},
  {q:'Mes donnees sont-elles securisees?',a:'Les donnees sont hebergees sur une infrastructure cloud certifiee avec chiffrement AES-256. Chaque fiduciaire ne voit que ses propres donnees grace au Row Level Security (RLS). Conforme RGPD.'},
  {q:'Y a-t-il une periode d essai?',a:'Oui, le plan Trial est entierement gratuit pendant 30 jours avec acces a toutes les fonctionnalites. Aucune carte de credit requise pour commencer.'},
  {q:'Quels formats d export sont disponibles?',a:'CSV, JSON, XML SEPA (pain.001), PDF. Compatible avec les logiciels comptables belges: BOB50, WinBooks, Horus, Exact Online.'},
];

function useInView(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return visible;
}

function Section({ children, delay = 0 }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: 'opacity 0.7s ease ' + delay + 's, transform 0.7s ease ' + delay + 's' }}>
      {children}
    </div>
  );
}

function Logo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="20" fill="#c9a227"/>
      <path d="M50 18L72 75H58L54 63H46L42 75H28L50 18Z" fill="#0a0e1a" stroke="#0a0e1a" strokeWidth="2"/>
      <path d="M50 30L62 63H38L50 30Z" fill="#c9a227"/>
      <rect x="35" y="68" width="30" height="4" rx="2" fill="#0a0e1a"/>
    </svg>
  );
}

function LogoSmall() {
  return (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="20" fill="#c9a227"/>
      <path d="M50 18L72 75H58L54 63H46L42 75H28L50 18Z" fill="#0a0e1a" stroke="#0a0e1a" strokeWidth="2"/>
      <path d="M50 30L62 63H38L50 30Z" fill="#c9a227"/>
      <rect x="35" y="68" width="30" height="4" rx="2" fill="#0a0e1a"/>
    </svg>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [count, setCount] = useState({ f: 0, m: 0, p: 0 });

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Animated counter
  useEffect(() => {
    const dur = 2000;
    const steps = 40;
    const targets = { f: 155, m: 17, p: 100 };
    let step = 0;
    const iv = setInterval(() => {
      step++;
      const pct = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setCount({ f: Math.round(targets.f * ease), m: Math.round(targets.m * ease), p: Math.round(targets.p * ease) });
      if (step >= steps) clearInterval(iv);
    }, dur / steps);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{minHeight:'100vh',background:'#0a0e1a',color:'#e2e8f0',fontFamily:"'Outfit',system-ui,sans-serif",overflowX:'hidden'}}>

      {/* STYLE */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.8}}
        @keyframes gradient{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(201,162,39,0.2)}50%{box-shadow:0 0 40px rgba(201,162,39,0.4)}}
        .hero-badge{animation:slideUp 0.6s ease}
        .hero-title{animation:slideUp 0.8s ease}
        .hero-sub{animation:slideUp 1s ease}
        .hero-btns{animation:slideUp 1.2s ease}
        .logo-float{animation:float 4s ease-in-out infinite}
        .glow{animation:glow 3s ease-in-out infinite}
        .feature-card:hover{border-color:#c9a227!important;transform:translateY(-4px);box-shadow:0 12px 24px rgba(0,0,0,0.3)}
        .pricing-card:hover{transform:translateY(-4px);box-shadow:0 16px 32px rgba(0,0,0,0.3)}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(201,162,39,0.3)}
        .btn-secondary:hover{border-color:#c9a227!important;color:#c9a227!important}
        .nav-link:hover{color:#c9a227!important}
        .faq-item:hover{background:rgba(201,162,39,0.03)}
        @media(max-width:768px){
          .hero-title-text{font-size:34px!important}
          .hero-sub-text{font-size:15px!important}
          .features-grid{grid-template-columns:1fr!important}
          .pricing-grid{grid-template-columns:1fr!important}
          .stats-grid{grid-template-columns:repeat(2,1fr)!important}
          .testi-grid{grid-template-columns:1fr!important}
          .nav-links{display:none!important}
          .footer-grid{grid-template-columns:1fr!important;gap:24px!important}
          .hero-btns-wrap{flex-direction:column!important}
          .hero-btns-wrap button{width:100%}
        }
      `}</style>

      {/* BACKGROUND EFFECTS */}
      <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:0,pointerEvents:'none',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-20%',right:'-10%',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(201,162,39,0.08),transparent 70%)',animation:'pulse 6s ease-in-out infinite'}}/>
        <div style={{position:'absolute',bottom:'-20%',left:'-10%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,0.05),transparent 70%)',animation:'pulse 8s ease-in-out infinite 2s'}}/>
      </div>

      {/* NAVBAR */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'14px 40px',display:'flex',justifyContent:'space-between',alignItems:'center',background:scrolled?'rgba(10,14,26,0.92)':'transparent',backdropFilter:scrolled?'blur(16px)':'none',borderBottom:scrolled?'1px solid rgba(30,41,59,0.5)':'none',transition:'all 0.4s ease'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <LogoSmall/>
          <span style={{fontWeight:700,fontSize:17,color:'#f1f5f9',letterSpacing:-0.3}}>Aureus Social Pro</span>
        </div>
        <div style={{display:'flex',gap:28,alignItems:'center'}} className="nav-links">
          <a href="#features" className="nav-link" style={{color:'#94a3b8',textDecoration:'none',fontSize:14,transition:'color 0.2s'}}>Fonctionnalites</a>
          <a href="#pricing" className="nav-link" style={{color:'#94a3b8',textDecoration:'none',fontSize:14,transition:'color 0.2s'}}>Tarifs</a>
          <a href="#faq" className="nav-link" style={{color:'#94a3b8',textDecoration:'none',fontSize:14,transition:'color 0.2s'}}>FAQ</a>
          <Link href="/sprint10/auth"><button className="btn-secondary" style={{background:'transparent',color:'#c9a227',border:'1px solid #c9a227',padding:'8px 22px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',transition:'all 0.2s'}}>Connexion</button></Link>
          <Link href="/sprint11/onboarding"><button className="btn-primary" style={{background:'#c9a227',color:'#0a0e1a',border:'none',padding:'8px 22px',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',transition:'all 0.2s'}}>Essai gratuit</button></Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{position:'relative',zIndex:1,padding:'160px 40px 100px',textAlign:'center',maxWidth:950,margin:'0 auto'}}>
        <div className="hero-badge" style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(201,162,39,0.1)',border:'1px solid rgba(201,162,39,0.25)',borderRadius:24,padding:'7px 18px',fontSize:13,color:'#c9a227',fontWeight:600,marginBottom:24}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:'#c9a227',display:'inline-block'}}/>
          Nouveau — Baremes 2026 disponibles
        </div>
        <h1 className="hero-title hero-title-text" style={{fontSize:56,fontWeight:800,lineHeight:1.08,margin:'0 0 22px',color:'#f1f5f9',letterSpacing:-1.5}}>
          La paie belge,<br/><span style={{background:'linear-gradient(135deg,#c9a227,#e8d48b,#c9a227)',backgroundSize:'200% auto',animation:'gradient 4s ease infinite',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>simplifiee.</span>
        </h1>
        <p className="hero-sub hero-sub-text" style={{fontSize:18,color:'#94a3b8',lineHeight:1.7,maxWidth:620,margin:'0 auto 36px',fontWeight:400}}>
          Le logiciel de paie cloud concu pour les fiduciaires et bureaux sociaux belges. Calculs automatiques, conformite legale, zero installation.
        </p>
        <div className="hero-btns hero-btns-wrap" style={{display:'flex',gap:14,justifyContent:'center'}}>
          <Link href="/sprint11/onboarding"><button className="btn-primary glow" style={{background:'#c9a227',color:'#0a0e1a',border:'none',padding:'16px 36px',borderRadius:10,fontSize:16,fontWeight:700,cursor:'pointer',transition:'all 0.2s'}}>Commencer gratuitement</button></Link>
          <a href="#features"><button className="btn-secondary" style={{background:'rgba(255,255,255,0.03)',color:'#e2e8f0',border:'1px solid #1e293b',padding:'16px 36px',borderRadius:10,fontSize:16,fontWeight:600,cursor:'pointer',transition:'all 0.2s'}}>Decouvrir</button></a>
        </div>
        <div style={{marginTop:48}} className="logo-float">
          <Logo size={64}/>
        </div>
      </section>

      {/* STATS */}
      <Section>
      <section style={{position:'relative',zIndex:1,padding:'40px',maxWidth:900,margin:'0 auto'}}>
        <div className="stats-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20}}>
          {[{v:count.f+'+',l:'Fonctionnalites'},{v:count.m,l:'Modules specialises'},{v:count.p+'%',l:'Legislation belge 2026'},{v:'0',l:'Installation requise'}].map((s,i)=>(
            <div key={i} style={{textAlign:'center',padding:24,background:'rgba(19,24,37,0.6)',borderRadius:12,border:'1px solid #1e293b'}}>
              <div style={{fontSize:38,fontWeight:800,color:'#c9a227',fontFamily:'monospace'}}>{s.v}</div>
              <div style={{fontSize:13,color:'#64748b',marginTop:6}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>
      </Section>

      {/* TRUSTED BY */}
      <Section delay={0.1}>
      <section style={{position:'relative',zIndex:1,padding:'40px 40px 0',textAlign:'center'}}>
        <div style={{color:'#475569',fontSize:13,fontWeight:500,textTransform:'uppercase',letterSpacing:2,marginBottom:16}}>Concu pour les professionnels belges</div>
        <div style={{display:'flex',justifyContent:'center',gap:40,alignItems:'center',opacity:0.4}}>
          {['Fiduciaires','Bureaux sociaux','Experts-comptables','Secrétariats sociaux'].map((t,i)=>(
            <span key={i} style={{fontSize:14,color:'#64748b',fontWeight:600}}>{t}</span>
          ))}
        </div>
      </section>
      </Section>

      {/* FEATURES */}
      <Section delay={0.1}>
      <section id="features" style={{position:'relative',zIndex:1,padding:'100px 40px',maxWidth:1100,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={{color:'#c9a227',fontSize:13,fontWeight:600,textTransform:'uppercase',letterSpacing:2,marginBottom:8}}>Fonctionnalites</div>
          <h2 style={{fontSize:36,fontWeight:700,color:'#f1f5f9',margin:'0 0 14px',letterSpacing:-0.5}}>Tout pour gerer la paie belge</h2>
          <p style={{color:'#64748b',fontSize:16,maxWidth:500,margin:'0 auto'}}>17 modules couvrant l integralite du cycle de paie</p>
        </div>
        <div className="features-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {FEATURES.map((f,i)=>(
            <div key={i} className="feature-card" style={{background:'#131825',border:'1px solid #1e293b',borderRadius:12,padding:28,transition:'all 0.3s ease',cursor:'default'}}>
              <div style={{width:44,height:44,borderRadius:10,background:'rgba(201,162,39,0.12)',color:'#c9a227',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:18,marginBottom:14}}>{f.icon}</div>
              <div style={{fontWeight:600,fontSize:16,color:'#f1f5f9',marginBottom:8}}>{f.title}</div>
              <div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>
      </Section>

      {/* HOW IT WORKS */}
      <Section delay={0.1}>
      <section style={{position:'relative',zIndex:1,padding:'80px 40px',maxWidth:900,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{color:'#c9a227',fontSize:13,fontWeight:600,textTransform:'uppercase',letterSpacing:2,marginBottom:8}}>Comment ca marche</div>
          <h2 style={{fontSize:32,fontWeight:700,color:'#f1f5f9',margin:0}}>Operationnel en 5 minutes</h2>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20}}>
          {[{n:'1',t:'Inscription',d:'Creez votre compte gratuitement'},{n:'2',t:'Configuration',d:'Ajoutez votre cabinet et vos clients'},{n:'3',t:'Travailleurs',d:'Importez ou ajoutez vos employes'},{n:'4',t:'Paie!',d:'Generez les fiches en un clic'}].map((s,i)=>(
            <div key={i} style={{textAlign:'center',padding:24}}>
              <div style={{width:48,height:48,borderRadius:'50%',background:i===3?'#c9a227':'rgba(201,162,39,0.12)',color:i===3?'#0a0e1a':'#c9a227',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,margin:'0 auto 12px'}}>{s.n}</div>
              <div style={{fontWeight:700,color:'#f1f5f9',fontSize:15,marginBottom:4}}>{s.t}</div>
              <div style={{color:'#64748b',fontSize:13}}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>
      </Section>

      {/* PRICING */}
      <Section delay={0.1}>
      <section id="pricing" style={{position:'relative',zIndex:1,padding:'100px 40px',maxWidth:1050,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:56}}>
          <div style={{color:'#c9a227',fontSize:13,fontWeight:600,textTransform:'uppercase',letterSpacing:2,marginBottom:8}}>Tarifs</div>
          <h2 style={{fontSize:36,fontWeight:700,color:'#f1f5f9',margin:'0 0 12px',letterSpacing:-0.5}}>Simple et transparent</h2>
          <p style={{color:'#64748b',fontSize:16}}>Pas de frais caches. Pas d engagement. Annulez a tout moment.</p>
        </div>
        <div className="pricing-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
          {[
            {name:'Starter',price:'49',per:'/mois',desc:'Pour les petits cabinets',features:['5 clients maximum','50 travailleurs maximum','Calcul de paie complet','Fiches PDF','Support email'],cta:'Commencer',popular:false},
            {name:'Pro',price:'149',per:'/mois',desc:'Pour les fiduciaires actives',features:['25 clients maximum','500 travailleurs maximum','Tous les 17 modules','SEPA + exports comptables','Notifications temps reel','Support prioritaire'],cta:'Essai gratuit 30j',popular:true},
            {name:'Enterprise',price:'Sur mesure',per:'',desc:'Pour les grands bureaux sociaux',features:['Clients illimites','Travailleurs illimites','API personnalisee','Onboarding dedie','SLA 99.9% garanti','Account manager dedie'],cta:'Nous contacter',popular:false},
          ].map((p,i)=>(
            <div key={i} className="pricing-card" style={{background:'#131825',border:p.popular?'2px solid #c9a227':'1px solid #1e293b',borderRadius:16,padding:36,position:'relative',transition:'all 0.3s ease'}}>
              {p.popular&&<div style={{position:'absolute',top:-13,left:'50%',transform:'translateX(-50%)',background:'#c9a227',color:'#0a0e1a',padding:'5px 20px',borderRadius:20,fontSize:11,fontWeight:700,letterSpacing:0.5}}>RECOMMANDE</div>}
              <div style={{fontSize:20,fontWeight:700,color:'#f1f5f9'}}>{p.name}</div>
              <div style={{fontSize:13,color:'#64748b',marginTop:4,marginBottom:20}}>{p.desc}</div>
              <div style={{marginBottom:24}}>
                <span style={{fontSize:46,fontWeight:800,color:p.popular?'#c9a227':'#f1f5f9',letterSpacing:-2}}>{p.price}</span>
                {p.per&&<span style={{fontSize:15,color:'#64748b',fontWeight:500}}> EUR{p.per}</span>}
              </div>
              <div style={{marginBottom:28}}>
                {p.features.map((f,j)=>(
                  <div key={j} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',fontSize:14,color:'#94a3b8'}}>
                    <span style={{color:'#22c55e',fontWeight:700,fontSize:16}}>+</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/sprint11/onboarding">
                <button className="btn-primary" style={{width:'100%',padding:'14px 0',background:p.popular?'#c9a227':'#1e293b',color:p.popular?'#0a0e1a':'#e2e8f0',border:'none',borderRadius:8,fontSize:15,fontWeight:700,cursor:'pointer',transition:'all 0.2s'}}>{p.cta}</button>
              </Link>
            </div>
          ))}
        </div>
      </section>
      </Section>

      {/* TESTIMONIALS */}
      <Section delay={0.1}>
      <section style={{position:'relative',zIndex:1,padding:'80px 40px',maxWidth:1050,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{color:'#c9a227',fontSize:13,fontWeight:600,textTransform:'uppercase',letterSpacing:2,marginBottom:8}}>Temoignages</div>
          <h2 style={{fontSize:32,fontWeight:700,color:'#f1f5f9',margin:0}}>Ils nous font confiance</h2>
        </div>
        <div className="testi-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
          {TESTIMONIALS.map((t,i)=>(
            <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:14,padding:28}}>
              <div style={{display:'flex',gap:2,marginBottom:14}}>{[1,2,3,4,5].map(s=><span key={s} style={{color:'#c9a227',fontSize:16}}>*</span>)}</div>
              <div style={{fontSize:14,color:'#94a3b8',lineHeight:1.7,marginBottom:20,fontStyle:'italic'}}>"{t.text}"</div>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:'rgba(201,162,39,0.15)',color:'#c9a227',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14}}>{t.name[0]}</div>
                <div>
                  <div style={{fontWeight:600,color:'#f1f5f9',fontSize:14}}>{t.name}</div>
                  <div style={{color:'#64748b',fontSize:12}}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      </Section>

      {/* FAQ */}
      <Section delay={0.1}>
      <section id="faq" style={{position:'relative',zIndex:1,padding:'100px 40px',maxWidth:750,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{color:'#c9a227',fontSize:13,fontWeight:600,textTransform:'uppercase',letterSpacing:2,marginBottom:8}}>FAQ</div>
          <h2 style={{fontSize:32,fontWeight:700,color:'#f1f5f9',margin:0}}>Questions frequentes</h2>
        </div>
        {FAQ.map((f,i)=>(
          <div key={i} className="faq-item" style={{borderBottom:'1px solid #1e293b',padding:'20px 0',cursor:'pointer',borderRadius:4,transition:'background 0.2s'}} onClick={()=>setOpenFaq(openFaq===i?null:i)}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:600,fontSize:16,color:'#f1f5f9',paddingRight:20}}>{f.q}</div>
              <span style={{color:'#c9a227',fontSize:24,fontWeight:300,minWidth:24,textAlign:'center',transition:'transform 0.3s',transform:openFaq===i?'rotate(45deg)':'rotate(0)'}}> +</span>
            </div>
            <div style={{maxHeight:openFaq===i?200:0,overflow:'hidden',transition:'max-height 0.4s ease'}}>
              <div style={{color:'#94a3b8',fontSize:14,lineHeight:1.7,marginTop:14,paddingRight:40}}>{f.a}</div>
            </div>
          </div>
        ))}
      </section>
      </Section>

      {/* CTA */}
      <Section delay={0.1}>
      <section style={{position:'relative',zIndex:1,padding:'80px 40px',textAlign:'center'}}>
        <div style={{background:'linear-gradient(135deg,#131825 0%,#1a1f2e 50%,#131825 100%)',border:'1px solid #1e293b',borderRadius:20,padding:'70px 40px',maxWidth:750,margin:'0 auto'}}>
          <div className="logo-float" style={{marginBottom:20}}><Logo size={52}/></div>
          <h2 style={{fontSize:30,fontWeight:700,color:'#f1f5f9',margin:'0 0 14px'}}>Pret a simplifier votre paie?</h2>
          <p style={{color:'#94a3b8',fontSize:16,margin:'0 0 32px'}}>Essai gratuit 30 jours. Aucune carte de credit requise.</p>
          <Link href="/sprint11/onboarding"><button className="btn-primary glow" style={{background:'#c9a227',color:'#0a0e1a',border:'none',padding:'16px 44px',borderRadius:10,fontSize:17,fontWeight:700,cursor:'pointer',transition:'all 0.2s'}}>Demarrer maintenant</button></Link>
        </div>
      </section>
      </Section>

      {/* FOOTER */}
      <footer style={{position:'relative',zIndex:1,borderTop:'1px solid #1e293b',padding:'48px 40px 32px',maxWidth:1100,margin:'0 auto'}}>
        <div className="footer-grid" style={{display:'grid',gridTemplateColumns:'2.5fr 1fr 1fr 1fr',gap:48}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
              <LogoSmall/>
              <span style={{fontWeight:700,color:'#f1f5f9',fontSize:16}}>Aureus Social Pro</span>
            </div>
            <p style={{color:'#64748b',fontSize:13,lineHeight:1.7,maxWidth:300}}>Logiciel de paie cloud pour fiduciaires et bureaux sociaux belges. Developpe avec passion par Aureus IA SPRL.</p>
            <p style={{color:'#475569',fontSize:12,marginTop:12}}>BCE: BE 1028.230.781<br/>Saint-Gilles, Bruxelles</p>
          </div>
          <div>
            <div style={{fontWeight:600,color:'#f1f5f9',fontSize:14,marginBottom:16}}>Produit</div>
            {[{l:'Fonctionnalites',h:'#features'},{l:'Tarifs',h:'#pricing'},{l:'FAQ',h:'#faq'},{l:'Connexion',h:'/sprint10/auth'}].map(l=><a key={l.l} href={l.h} style={{display:'block',color:'#64748b',fontSize:13,padding:'5px 0',cursor:'pointer',textDecoration:'none',transition:'color 0.2s'}} className="nav-link">{l.l}</a>)}
          </div>
          <div>
            <div style={{fontWeight:600,color:'#f1f5f9',fontSize:14,marginBottom:16}}>Legal</div>
            {['Conditions generales','Confidentialite','RGPD','Mentions legales'].map(l=><div key={l} style={{color:'#64748b',fontSize:13,padding:'5px 0',cursor:'pointer'}}>{l}</div>)}
          </div>
          <div>
            <div style={{fontWeight:600,color:'#f1f5f9',fontSize:14,marginBottom:16}}>Contact</div>
            <div style={{color:'#64748b',fontSize:13,padding:'5px 0'}}>info@aureussocial.be</div>
            <div style={{color:'#64748b',fontSize:13,padding:'5px 0'}}>+32 2 XXX XX XX</div>
            <div style={{color:'#64748b',fontSize:13,padding:'5px 0'}}>Saint-Gilles, 1060</div>
            <div style={{color:'#64748b',fontSize:13,padding:'5px 0'}}>Bruxelles, Belgique</div>
          </div>
        </div>
        <div style={{borderTop:'1px solid #1e293b',marginTop:36,paddingTop:24,textAlign:'center',color:'#475569',fontSize:12}}>
          &copy; 2026 Aureus IA SPRL. Tous droits reserves. Fait avec passion a Bruxelles.
        </div>
      </footer>
    </div>
  );
}
