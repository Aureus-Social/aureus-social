'use client';
import { useState, useMemo } from 'react';
const PROC_IS={id:'inspection_sociale',icon:'🔎',categorie:'formation',titre:"Inspection sociale — Contrôle",resume:"4 services d'inspection peuvent contrôler l'entreprise à tout moment. Pouvoirs étendus : accès aux locaux, documents, interrogatoire. Avertissement, PV, amendes, régularisation. Droits de l'employeur : assistance avocat, contestation. Collaboration = meilleure issue.",
baseLegale:[{ref:"Code pénal social, Livre 1",desc:"Pouvoirs des inspecteurs sociaux — accès, documents, PV"},{ref:"Loi 16/11/1972",desc:"Inspection du travail — organisation et compétences"},{ref:"Code pénal social, Livre 2",desc:"Infractions et sanctions — niveaux 1 à 4"}],
etapes:[
  {n:1,phase:'contrôle',titre:"Les 4 services d'inspection + Pouvoirs",detail:`═══ LES 4 SERVICES D'INSPECTION ═══

1. CONTRÔLE DES LOIS SOCIALES (SPF Emploi)
   • Durée du travail, temps partiel, règlement de travail
   • Contrats de travail, préavis, discrimination
   • Travail des étudiants, intérimaires

2. INSPECTION DE L'ONSS
   • Cotisations sociales, DIMONA, DmfA
   • Travail au noir, faux indépendants
   • Fraude sociale

3. INSPECTION DE L'ONEM
   • Chômage temporaire, crédit-temps
   • Disponibilité des chômeurs
   • Cumul travail/allocations

4. INSPECTION DU BIEN-ÊTRE (SPF Emploi)
   • Sécurité, santé, hygiène au travail
   • CPPT, plan de prévention
   • Accidents du travail

═══ POUVOIRS DES INSPECTEURS ═══
• Accès LIBRE à tout lieu de travail (même sans mandat)
• Consultation de tous les documents sociaux
• Interrogatoire des travailleurs et de l'employeur
• Saisie de documents
• Prélèvements et mesures (bruit, produits chimiques)
• Identification des personnes présentes
• Assistance de la police si nécessaire

═══ DÉCLENCHEMENT ═══
• Contrôle de routine (aléatoire)
• Plainte d'un travailleur (anonyme)
• Signalement d'un syndicat
• Campagne sectorielle ciblée
• Suite à un accident du travail
• Demande d'un autre service d'inspection`,delai:"Contrôle possible à tout moment — sans préavis",formulaire:null,ou:"Lieu de travail",obligatoire:true,duree_estimee:'2-8h (contrôle)'},

  {n:2,phase:'suites',titre:"Suites du contrôle — Avertissement à amende pénale",detail:`═══ NIVEAUX DE SANCTION (Code pénal social) ═══

NIVEAU 1 : Amende administrative 10-100€
• Infractions légères (formalités, déclarations mineures)

NIVEAU 2 : Amende pénale 50-500€ OU amende administrative 25-250€
• Infractions moyennes (documents sociaux incomplets, heures sup non payées)

NIVEAU 3 : Amende pénale 100-1.000€ OU amende administrative 50-500€
• Infractions graves (pas de règlement de travail, contrats non conformes)

NIVEAU 4 : Amende pénale 600-6.000€ ET/OU emprisonnement 6 mois-3 ans
• Infractions très graves (travail au noir, traite des êtres humains, discrimination)

⚠️ TOUS les montants sont × DÉCIMES (×8 en 2026) et × NOMBRE DE TRAVAILLEURS

═══ SUITES POSSIBLES DU CONTRÔLE ═══
1. RIEN : conformité constatée → pas de suite
2. AVERTISSEMENT : régularisation demandée (délai accordé)
3. RÉGULARISATION : mise en ordre dans un délai fixé
4. PV (procès-verbal) : envoyé à l'auditorat du travail
5. L'auditorat décide : classement sans suite, transaction, poursuite pénale

═══ DROITS DE L'EMPLOYEUR ═══
• Droit d'être informé de l'objet du contrôle
• Droit de se faire assister (avocat, comptable)
• Droit de contester le PV
• Droit de rectifier les observations
• Droit de demander un délai de régularisation
• Le refus de collaborer est une infraction (niveau 4 !)`,delai:"Régularisation : délai fixé par l'inspecteur",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Variable'},
],
alertes:[
  {niveau:'critique',texte:"Les inspecteurs ont accès LIBRE aux locaux SANS mandat ni préavis. Refuser l'accès = infraction de niveau 4."},
  {niveau:'critique',texte:"Amendes × décimes (×8) × nombre de travailleurs. Ex : amende niv.3 de 500€ = 500 × 8 × 10 travailleurs = 40.000€."},
  {niveau:'important',texte:"COLLABORER avec l'inspection. L'attitude coopérative mène souvent à un avertissement plutôt qu'un PV."},
  {niveau:'important',texte:"Tenir tous les documents à jour et accessibles : DIMONA, DmfA, contrats, règlement de travail, fiches de paie."},
  {niveau:'attention',texte:"Les travailleurs peuvent déposer une plainte ANONYME. L'inspecteur ne révélera jamais l'identité du plaignant."},
],
simulation:{titre:"Amendes — Exemples concrets (×8 décimes, 10 travailleurs)",lignes:[
  {label:'Niv.1 : formalité (100€)',montant:'100 × 8 × 10 = 8.000€',type:'neutre'},
  {label:'Niv.2 : docs incomplets (500€)',montant:'500 × 8 × 10 = 40.000€',type:'neutre'},
  {label:'Niv.3 : pas de règlement (1.000€)',montant:'1.000 × 8 × 10 = 80.000€',type:'neutre'},
  {label:'Niv.4 : travail au noir (6.000€)',montant:'6.000 × 8 × 10 = 480.000€',type:'vert_bold'},
]},
faq:[
  {q:"L'inspecteur peut-il venir sans prévenir ?",r:"Oui. Les inspecteurs sociaux ont le droit d'accès libre sans préavis ni mandat. Ils peuvent se présenter à tout moment pendant les heures de travail (et même en dehors si travail de nuit)."},
  {q:"Puis-je refuser de répondre aux questions ?",r:"Le refus de collaborer est lui-même une infraction (niveau 4). Vous avez le droit de vous faire assister par un avocat, mais vous devez répondre."},
],
formulaires:[{nom:"SPF Emploi — Inspection",url:"https://emploi.belgique.be/fr/propos-du-spf/structure/inspection",type:'en_ligne'}]};
export default function ProcedureInspectionSociale(){const P=PROC_IS;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Amendes',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_IS};
