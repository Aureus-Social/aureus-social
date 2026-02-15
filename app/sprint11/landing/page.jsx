'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const FEATURES = [
  {icon:'C',title:'Gestion Clients',desc:'Gerez vos dossiers clients, entreprises et contacts depuis une interface unique.'},
  {icon:'T',title:'Travailleurs',desc:'Fiches signaletiques completes: contrat, NISS, regime, salaire, enfants a charge.'},
  {icon:'P',title:'Moteur de Paie',desc:'Calcul automatique: ONSS, precompte professionnel, CSS, net. Baremes belges 2026.'},
  {icon:'F',title:'Fiches PDF',desc:'Generation et impression de fiches de paie professionnelles en un clic.'},
  {icon:'S',title:'Fichier SEPA',desc:'Export XML SEPA pour virements salaires directement vers votre banque.'},
  {icon:'D',title:'Dimona',desc:'Declarations d entree et sortie des travailleurs aupres de l ONSS.'},
  {icon:'O',title:'ONSS / DmfA',desc:'Declarations trimestrielles, provisions et echeances de paiement.'},
  {icon:'B',title:'Baremes & CP',desc:'Baremes salariaux par commission paritaire, indexation automatique.'},
  {icon:'V',title:'Vacances',desc:'Gestion des conges, pecule simple et double, solde par travailleur.'},
  {icon:'CR',title:'Cheques-repas',desc:'Configuration, commande et suivi des titres-repas par fournisseur.'},
  {icon:'A',title:'Attestations',desc:'Generation automatique: C4, fiches 281.10, attestations de travail.'},
  {icon:'N',title:'Notifications',desc:'Alertes echeances ONSS, CDD expirants, Dimona, provisions mensuelles.'},
];

const STATS = [
  {value:'155+',label:'Fonctionnalites'},
  {value:'17',label:'Modules specialises'},
  {value:'100%',label:'Droit belge 2026'},
  {value:'0',label:'Installation requise'},
];

const TESTIMONIALS = [
  {name:'Cabinet Verstraeten',role:'Fiduciaire - Bruxelles',text:'Aureus Social Pro a transforme notre gestion de paie. On gagne 3 heures par semaine minimum.'},
  {name:'Bureau Peeters & Co',role:'Secrétariat social - Anvers',text:'L interface est intuitive et les calculs sont toujours justes. Fini les erreurs de precompte.'},
  {name:'Fiduciaire Lambert',role:'Expert-comptable - Liege',text:'Le fichier SEPA et les fiches PDF nous font gagner un temps fou. Je recommande.'},
];

const FAQ = [
  {q:'Aureus Social Pro remplace-t-il un secretariat social agree?',a:'Non, Aureus Social Pro est un outil de gestion et de calcul de paie. Il facilite le travail des fiduciaires et bureaux sociaux mais ne remplace pas l agrement officiel.'},
  {q:'Les calculs sont-ils conformes a la legislation belge?',a:'Oui, tous les baremes (ONSS, precompte professionnel, CSS) sont mis a jour selon les taux 2026 officiels.'},
  {q:'Puis-je gerer plusieurs entreprises clientes?',a:'Oui, le systeme multi-tenant permet a chaque fiduciaire de gerer un portefeuille complet de clients, chacun avec ses propres travailleurs.'},
  {q:'Mes donnees sont-elles securisees?',a:'Absolument. Les donnees sont hebergees sur Supabase avec Row Level Security (RLS). Chaque fiduciaire ne voit que ses propres donnees.'},
  {q:'Y a-t-il une periode d essai?',a:'Oui, le plan Trial est gratuit pendant 30 jours avec acces a toutes les fonctionnalites.'},
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{minHeight:'100vh',background:'#0a0e1a',color:'#e2e8f0',fontFamily:"'Outfit',system-ui,sans-serif"}}>

      {/* NAVBAR */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'12px 40px',display:'flex',justifyContent:'space-between',alignItems:'center',background:scrolled?'rgba(10,14,26,0.95)':'transparent',backdropFilter:scrolled?'blur(12px)':'none',borderBottom:scrolled?'1px solid #1e293b':'none',transition:'all 0.3s'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:8,background:'#c9a227',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:'#0a0e1a'}}>A</div>
          <span style={{fontWeight:700,fontSize:17,color:'#f1f5f9'}}>Aureus Social Pro</span>
        </div>
        <div style={{display:'flex',gap:24,alignItems:'center'}}>
          <a href="#features" style={{color:'#94a3b8',textDecoration:'none',fontSize:14}}>Fonctionnalites</a>
          <a href="#pricing" style={{color:'#94a3b8',textDecoration:'none',fontSize:14}}>Tarifs</a>
          <a href="#faq" style={{color:'#94a3b8',textDecoration:'none',fontSize:14}}>FAQ</a>
          <Link href="/sprint10/auth"><button style={{background:'transparent',color:'#c9a227',border:'1px solid #c9a227',padding:'8px 20px',borderRadius:6,fontSize:13,fontWeight:600,cursor:'pointer'}}>Connexion</button></Link>
          <Link href="/sprint11/onboarding"><button style={{background:'#c9a227',color:'#0a0e1a',border:'none',padding:'8px 20px',borderRadius:6,fontSize:13,fontWeight:700,cursor:'pointer'}}>Essai gratuit</button></Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{padding:'140px 40px 80px',textAlign:'center',maxWidth:900,margin:'0 auto'}}>
        <div style={{display:'inline-block',background:'rgba(201,162,39,0.1)',border:'1px solid rgba(201,162,39,0.3)',borderRadius:20,padding:'6px 16px',fontSize:12,color:'#c9a227',fontWeight:600,marginBottom:20}}>Nouveau — Baremes 2026 disponibles</div>
        <h1 style={{fontSize:52,fontWeight:800,lineHeight:1.1,margin:'0 0 20px',color:'#f1f5f9'}}>La paie belge,<br/><span style={{color:'#c9a227'}}>simplifiee.</span></h1>
        <p style={{fontSize:18,color:'#94a3b8',lineHeight:1.6,maxWidth:650,margin:'0 auto 32px'}}>Le logiciel de paie cloud concu pour les fiduciaires et bureaux sociaux belges. Calculs automatiques, conformite legale, zero installation.</p>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <Link href="/sprint11/onboarding"><button style={{background:'#c9a227',color:'#0a0e1a',border:'none',padding:'14px 32px',borderRadius:8,fontSize:15,fontWeight:700,cursor:'pointer'}}>Commencer gratuitement</button></Link>
          <Link href="#features"><button style={{background:'transparent',color:'#e2e8f0',border:'1px solid #1e293b',padding:'14px 32px',borderRadius:8,fontSize:15,fontWeight:600,cursor:'pointer'}}>Decouvrir</button></Link>
        </div>
      </section>

      {/* STATS */}
      <section style={{padding:'40px',maxWidth:900,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
          {STATS.map((s,i)=>(
            <div key={i} style={{textAlign:'center',padding:20}}>
              <div style={{fontSize:36,fontWeight:800,color:'#c9a227',fontFamily:'monospace'}}>{s.value}</div>
              <div style={{fontSize:13,color:'#64748b',marginTop:4}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{padding:'80px 40px',maxWidth:1100,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <h2 style={{fontSize:32,fontWeight:700,color:'#f1f5f9',margin:'0 0 12px'}}>Tout ce qu il faut pour gerer la paie</h2>
          <p style={{color:'#64748b',fontSize:15}}>17 modules couvrant l integralite du cycle de paie belge</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {FEATURES.map((f,i)=>(
            <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:24,transition:'all 0.2s',cursor:'default'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#c9a227'} onMouseLeave={e=>e.currentTarget.style.borderColor='#1e293b'}>
              <div style={{width:40,height:40,borderRadius:8,background:'rgba(201,162,39,0.15)',color:'#c9a227',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,marginBottom:12}}>{f.icon}</div>
              <div style={{fontWeight:600,fontSize:15,color:'#f1f5f9',marginBottom:6}}>{f.title}</div>
              <div style={{fontSize:13,color:'#94a3b8',lineHeight:1.5}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:'80px 40px',maxWidth:1000,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <h2 style={{fontSize:32,fontWeight:700,color:'#f1f5f9',margin:'0 0 12px'}}>Tarifs simples et transparents</h2>
          <p style={{color:'#64748b',fontSize:15}}>Pas de frais caches. Pas d engagement.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
          {[
            {name:'Starter',price:'49',per:'/mois',desc:'Pour les petits cabinets',features:['5 clients max','50 travailleurs max','Calcul de paie','Fiches PDF','Support email'],cta:'Commencer',popular:false},
            {name:'Pro',price:'149',per:'/mois',desc:'Pour les fiduciaires actives',features:['25 clients max','500 travailleurs max','Tous les modules','SEPA + exports','Notifications','Support prioritaire'],cta:'Essai gratuit 30j',popular:true},
            {name:'Enterprise',price:'Sur mesure',per:'',desc:'Pour les grands bureaux sociaux',features:['Clients illimites','Travailleurs illimites','API personnalisee','Onboarding dedie','SLA garanti','Account manager'],cta:'Nous contacter',popular:false},
          ].map((p,i)=>(
            <div key={i} style={{background:'#131825',border:p.popular?'2px solid #c9a227':'1px solid #1e293b',borderRadius:12,padding:32,position:'relative'}}>
              {p.popular&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'#c9a227',color:'#0a0e1a',padding:'4px 16px',borderRadius:12,fontSize:11,fontWeight:700}}>POPULAIRE</div>}
              <div style={{fontSize:18,fontWeight:700,color:'#f1f5f9'}}>{p.name}</div>
              <div style={{fontSize:13,color:'#64748b',marginTop:4,marginBottom:16}}>{p.desc}</div>
              <div style={{marginBottom:20}}>
                <span style={{fontSize:42,fontWeight:800,color:p.popular?'#c9a227':'#f1f5f9'}}>{p.price}</span>
                {p.per&&<span style={{fontSize:14,color:'#64748b'}}> EUR{p.per}</span>}
              </div>
              <div style={{marginBottom:24}}>
                {p.features.map((f,j)=>(
                  <div key={j} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',fontSize:13,color:'#94a3b8'}}>
                    <span style={{color:'#22c55e',fontWeight:700}}>+</span>{f}
                  </div>
                ))}
              </div>
              <Link href="/sprint11/onboarding">
                <button style={{width:'100%',padding:'12px 0',background:p.popular?'#c9a227':'#1e293b',color:p.popular?'#0a0e1a':'#e2e8f0',border:'none',borderRadius:6,fontSize:14,fontWeight:700,cursor:'pointer'}}>{p.cta}</button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{padding:'80px 40px',maxWidth:1000,margin:'0 auto'}}>
        <h2 style={{fontSize:32,fontWeight:700,color:'#f1f5f9',textAlign:'center',margin:'0 0 40px'}}>Ils nous font confiance</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
          {TESTIMONIALS.map((t,i)=>(
            <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:24}}>
              <div style={{fontSize:14,color:'#94a3b8',lineHeight:1.6,marginBottom:16,fontStyle:'italic'}}>"{t.text}"</div>
              <div style={{fontWeight:600,color:'#f1f5f9',fontSize:13}}>{t.name}</div>
              <div style={{color:'#64748b',fontSize:12}}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{padding:'80px 40px',maxWidth:750,margin:'0 auto'}}>
        <h2 style={{fontSize:32,fontWeight:700,color:'#f1f5f9',textAlign:'center',margin:'0 0 40px'}}>Questions frequentes</h2>
        {FAQ.map((f,i)=>(
          <div key={i} style={{borderBottom:'1px solid #1e293b',padding:'16px 0',cursor:'pointer'}} onClick={()=>setOpenFaq(openFaq===i?null:i)}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:600,fontSize:15,color:'#f1f5f9'}}>{f.q}</div>
              <span style={{color:'#c9a227',fontSize:20,fontWeight:300}}>{openFaq===i?'-':'+'}</span>
            </div>
            {openFaq===i&&<div style={{color:'#94a3b8',fontSize:14,lineHeight:1.6,marginTop:12,paddingRight:40}}>{f.a}</div>}
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{padding:'80px 40px',textAlign:'center'}}>
        <div style={{background:'linear-gradient(135deg,#131825,#1a1f2e)',border:'1px solid #1e293b',borderRadius:16,padding:'60px 40px',maxWidth:700,margin:'0 auto'}}>
          <h2 style={{fontSize:28,fontWeight:700,color:'#f1f5f9',margin:'0 0 12px'}}>Pret a simplifier votre paie?</h2>
          <p style={{color:'#94a3b8',fontSize:15,margin:'0 0 28px'}}>Essai gratuit 30 jours. Aucune carte de credit requise.</p>
          <Link href="/sprint11/onboarding"><button style={{background:'#c9a227',color:'#0a0e1a',border:'none',padding:'14px 40px',borderRadius:8,fontSize:16,fontWeight:700,cursor:'pointer'}}>Demarrer maintenant</button></Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:'1px solid #1e293b',padding:'40px',maxWidth:1100,margin:'0 auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:40}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
              <div style={{width:28,height:28,borderRadius:6,background:'#c9a227',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#0a0e1a'}}>A</div>
              <span style={{fontWeight:700,color:'#f1f5f9'}}>Aureus Social Pro</span>
            </div>
            <p style={{color:'#64748b',fontSize:12,lineHeight:1.6}}>Logiciel de paie cloud pour fiduciaires et bureaux sociaux belges. Developpe par Aureus IA SPRL.</p>
            <p style={{color:'#475569',fontSize:11,marginTop:8}}>BCE: BE 1028.230.781 | Saint-Gilles, Bruxelles</p>
          </div>
          <div>
            <div style={{fontWeight:600,color:'#f1f5f9',fontSize:13,marginBottom:12}}>Produit</div>
            {['Fonctionnalites','Tarifs','FAQ','Changelog'].map(l=><div key={l} style={{color:'#64748b',fontSize:12,padding:'4px 0',cursor:'pointer'}}>{l}</div>)}
          </div>
          <div>
            <div style={{fontWeight:600,color:'#f1f5f9',fontSize:13,marginBottom:12}}>Legal</div>
            {['Conditions generales','Politique de confidentialite','RGPD','Mentions legales'].map(l=><div key={l} style={{color:'#64748b',fontSize:12,padding:'4px 0',cursor:'pointer'}}>{l}</div>)}
          </div>
          <div>
            <div style={{fontWeight:600,color:'#f1f5f9',fontSize:13,marginBottom:12}}>Contact</div>
            <div style={{color:'#64748b',fontSize:12,padding:'4px 0'}}>info@aureussocial.be</div>
            <div style={{color:'#64748b',fontSize:12,padding:'4px 0'}}>+32 2 XXX XX XX</div>
            <div style={{color:'#64748b',fontSize:12,padding:'4px 0'}}>Saint-Gilles, Bruxelles</div>
          </div>
        </div>
        <div style={{borderTop:'1px solid #1e293b',marginTop:32,paddingTop:20,textAlign:'center',color:'#475569',fontSize:11}}>
          2026 Aureus IA SPRL. Tous droits reserves.
        </div>
      </footer>
    </div>
  );
}