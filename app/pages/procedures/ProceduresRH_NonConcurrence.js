'use client';
import { useState, useMemo } from 'react';
const PROC_NC={id:'non_concurrence',icon:'🚷',categorie:'special',titre:"Clause de non-concurrence",resume:"Clause limitant la possibilité pour le travailleur d'exercer une activité similaire après la fin du contrat. Conditions strictes : salaire >43.335€, durée max 12 mois, zone géographique, indemnité compensatoire obligatoire (50% min). Nulle si pas respectée.",
baseLegale:[{ref:"Loi 03/07/1978, art. 65 & 86",desc:"Clause de non-concurrence — conditions de validité"},{ref:"Loi 03/07/1978, art. 65/1",desc:"Clause de non-concurrence pour représentants de commerce"},{ref:"Loi 03/07/1978, art. 86§1",desc:"Non-concurrence dérogatoire (salaire >86.671€)"}],
etapes:[
  {n:1,phase:'validité',titre:"Conditions de validité — 4 conditions cumulatives",detail:`═══ LA CLAUSE EST NULLE SI UNE SEULE CONDITION MANQUE ═══

1. SALAIRE MINIMUM
   • Clause ordinaire : salaire brut annuel >43.335€ (2026)
   • Si salaire entre 43.335€ et 86.671€ : clause possible seulement si CCT sectorielle le prévoit
   • Si salaire >86.671€ : clause possible sans CCT (clause dérogatoire)
   • Si salaire <43.335€ : clause TOUJOURS NULLE

2. ACTIVITÉS SIMILAIRES
   • La clause doit viser des activités SIMILAIRES
   • Pas d'interdiction générale de travailler
   • Doit être liée à l'activité réelle exercée

3. ZONE GÉOGRAPHIQUE LIMITÉE
   • Maximum : territoire belge (pas d'interdiction mondiale)
   • La zone doit être raisonnable et proportionnée
   • Ne peut pas dépasser le rayon d'action réel de l'entreprise

4. DURÉE MAXIMALE 12 MOIS
   • Après la fin du contrat
   • Clause de durée supérieure = réduite à 12 mois (pas nulle)

═══ INDEMNITÉ COMPENSATOIRE ═══
• Minimum 50% du salaire brut correspondant à la durée de non-concurrence
• Ex : clause 12 mois, salaire 4.000€/mois → min 24.000€ d'indemnité
• Payée en une fois à la fin du contrat
• L'employeur peut RENONCER à la clause dans les 15 JOURS suivant la fin du contrat → pas d'indemnité

═══ CLAUSE NULLE SI ═══
• Fin du contrat pendant la période d'essai (supprimée depuis 2014 mais si contrat ancien)
• Licenciement pour motif NON lié au travailleur (restructuration, etc.)
• Démission pour motif grave imputable à l'employeur`,delai:"Prévue dans le contrat initial ou un avenant",formulaire:"Clause au contrat de travail",ou:null,obligatoire:true,duree_estimee:'1h rédaction'},

  {n:2,phase:'execution',titre:"Activation, renonciation et sanctions",detail:`═══ ACTIVATION ═══
• La clause s'active automatiquement à la fin du contrat
• Sauf si l'employeur y renonce dans les 15 JOURS
• La renonciation doit être ÉCRITE (recommandé : lettre recommandée)

═══ RENONCIATION (15 jours) ═══
Si l'employeur renonce dans les 15 jours suivant la fin du contrat :
• Le travailleur est libre de toute restriction
• L'employeur ne doit PAS payer l'indemnité compensatoire
• Important : compter 15 jours CALENDRIER à partir du dernier jour de travail

═══ VIOLATION PAR LE TRAVAILLEUR ═══
Si le travailleur viole la clause :
• Il doit REMBOURSER l'indemnité compensatoire
• Il peut être condamné à des dommages et intérêts supplémentaires
• L'employeur peut demander une injonction (cessation)
• Preuve : l'employeur doit prouver la violation

═══ CLAUSE PÉNALE ═══
• Une clause pénale peut être prévue (montant forfaitaire en cas de violation)
• Le montant doit être raisonnable
• Le juge peut le réduire si disproportionné

═══ NON-SOLLICITATION ═══
Distincte de la non-concurrence :
• Interdit de solliciter les clients ou employés de l'ancien employeur
• Moins encadrée légalement
• Validité appréciée au cas par cas par les tribunaux`,delai:"Renonciation : 15 jours après la fin du contrat",formulaire:"Lettre de renonciation (si applicable)",ou:null,obligatoire:true,duree_estimee:'15 min'},
],
alertes:[
  {niveau:'critique',texte:"Salaire min 43.335€ brut/an. En dessous → clause TOUJOURS NULLE, même si signée par le travailleur."},
  {niveau:'critique',texte:"Indemnité compensatoire OBLIGATOIRE : minimum 50% du salaire brut sur la durée. Sans indemnité → clause nulle."},
  {niveau:'important',texte:"L'employeur peut RENONCER dans les 15 jours après la fin du contrat. Renonciation = pas d'indemnité à payer."},
  {niveau:'attention',texte:"Durée max 12 mois, zone géographique limitée, activités similaires uniquement. Clause trop large = nulle ou réduite."},
],
simulation:{titre:"Non-concurrence — Coût (salaire 5.000€ brut, clause 12 mois)",lignes:[
  {label:'Indemnité compensatoire (50% min)',montant:'5.000 × 12 × 50% = 30.000€',type:'neutre'},
  {label:'ONSS sur l\'indemnité',montant:'Oui (±25% patron + 13,07% travailleur)',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Coût total employeur',montant:'±37.500€',type:'vert_bold'},
  {label:'Si renonciation 15j',montant:'0€',type:'vert'},
]},
faq:[
  {q:"La clause est-elle valable si le travailleur démissionne ?",r:"Oui, si toutes les conditions sont remplies. La clause s'applique quelle que soit la manière dont le contrat prend fin (sauf exceptions : licenciement non lié au travailleur)."},
  {q:"Puis-je interdire à mon ex-employé de travailler pour un concurrent à l'étranger ?",r:"Non. La zone géographique est limitée au territoire belge maximum. Une clause mondiale est nulle."},
],
formulaires:[]};
export default function ProcedureNonConcurrence(){const P=PROC_NC;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_NC};
