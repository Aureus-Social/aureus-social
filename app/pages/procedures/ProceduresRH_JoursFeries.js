'use client';
import { useState, useMemo } from 'react';
const PROC_JF={id:'jours_feries',icon:'🎉',categorie:'legal',titre:"Jours fériés légaux (10 jours)",resume:"10 jours fériés légaux par an. Payés par l'employeur. Si le jour férié tombe un dimanche ou un jour d'inactivité → jour de remplacement obligatoire. Sursalaire si travail un jour férié (100%). Calendrier à afficher avant le 15 décembre.",
baseLegale:[{ref:"Loi 04/01/1974",desc:"Jours fériés — liste des 10 jours, remplacement, sursalaire"},{ref:"AR 18/04/1974",desc:"Modalités de fixation des jours de remplacement"},{ref:"AR 25/06/1990",desc:"Rémunération des jours fériés"}],
etapes:[
  {n:1,phase:'planification',titre:"Les 10 jours fériés légaux + jours de remplacement",detail:`═══ LES 10 JOURS FÉRIÉS LÉGAUX ═══
1. 1er janvier — Nouvel An
2. Lundi de Pâques (mobile)
3. 1er mai — Fête du Travail
4. Ascension (mobile — jeudi)
5. Lundi de Pentecôte (mobile)
6. 21 juillet — Fête nationale
7. 15 août — Assomption
8. 1er novembre — Toussaint
9. 11 novembre — Armistice
10. 25 décembre — Noël

═══ JOUR DE REMPLACEMENT ═══
Si un jour férié tombe un DIMANCHE ou un jour d'inactivité habituel :
• L'employeur doit fixer un JOUR DE REMPLACEMENT
• Le jour de remplacement est un jour de congé payé supplémentaire
• Fixé au CE, ou par le règlement de travail, ou individuellement

═══ AFFICHAGE OBLIGATOIRE ═══
L'employeur doit afficher le calendrier des jours fériés et de remplacement :
• AVANT le 15 DÉCEMBRE de l'année précédente
• Dans un endroit apparent et accessible
• Si pas d'affichage → le travailleur choisit son jour de remplacement

═══ TRAVAIL UN JOUR FÉRIÉ ═══
Si le travailleur doit travailler un jour férié :
• Salaire normal + sursalaire de 100% (= double salaire)
• OU un jour de repos compensatoire dans les 6 semaines
• Secteurs autorisés : horeca, commerce, santé, sécurité, etc.`,delai:"Affichage du calendrier avant le 15 décembre",formulaire:"Calendrier des jours fériés + remplacements",ou:"Affichage dans l'entreprise",obligatoire:true,duree_estimee:'30 min/an'},

  {n:2,phase:'paie',titre:"Rémunération des jours fériés",detail:`═══ PRINCIPE ═══
Le jour férié est PAYÉ par l'employeur au salaire normal.
Le travailleur reçoit la rémunération qu'il aurait gagnée s'il avait travaillé.

═══ TEMPS PARTIEL ═══
Le travailleur à temps partiel a droit au jour férié SI le jour férié tombe un jour habituellement presté.
• Mi-temps lu-ma-me → le 1er mai (jeudi) ne donne PAS droit au paiement
• 4/5 lu-ma-me-je → le 1er mai (jeudi) = payé

═══ PÉRIODE DE 30 JOURS APRÈS LA FIN DU CONTRAT ═══
Les jours fériés tombant dans les 30 JOURS suivant la fin du contrat :
• Sont payés par le DERNIER employeur
• Si le contrat a duré ≥15 jours avant le jour férié
• À inclure dans le solde de tout compte

═══ CAS PARTICULIERS ═══
• Maladie un jour férié : le jour férié est payé (pas compté comme maladie)
• Vacances et jour férié : le jour férié ne "consomme" pas un jour de vacances
• Jour férié pendant le préavis : le préavis est suspendu ce jour-là`,delai:"Chaque mois (intégré à la paie)",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Automatique si logiciel'},
],
alertes:[
  {niveau:'critique',texte:"Affichage du calendrier des jours fériés AVANT le 15 DÉCEMBRE. Sans affichage → le travailleur choisit son jour de remplacement."},
  {niveau:'important',texte:"Un jour férié tombant un dimanche ou jour d'inactivité → jour de REMPLACEMENT obligatoire. Le travailleur ne perd JAMAIS un jour férié."},
  {niveau:'important',texte:"Jours fériés dans les 30 jours après la fin du contrat : payés par le dernier employeur (si contrat ≥15 jours)."},
  {niveau:'attention',texte:"Travail un jour férié = double salaire OU repos compensatoire dans les 6 semaines. Vérifier la CCT sectorielle."},
],
simulation:{titre:"Jours fériés — Coût annuel (3.200€ brut, 10 jours)",lignes:[
  {label:'10 jours fériés payés',montant:'10 × 160€ = 1.600€ brut',type:'neutre'},
  {label:'+ ONSS patronal',montant:'±400€',type:'neutre'},
  {label:'Coût employeur / an',montant:'±2.000€/travailleur',type:'vert_bold'},
  {label:'',montant:'',type:'separateur'},
  {label:'Si travail un jour férié (sursalaire)',montant:'160€ × 2 = 320€ brut/jour',type:'vert'},
]},
faq:[
  {q:"Le 2 novembre est-il un jour férié ?",r:"NON. Seul le 1er novembre (Toussaint) est un jour férié légal. Le 2 novembre n'est pas légalement férié (même si certaines entreprises l'accordent)."},
  {q:"Le jour de Noël tombe un dimanche — que faire ?",r:"Fixer un jour de remplacement (ex: le 26 décembre ou un autre jour convenu) et l'afficher avant le 15 décembre."},
  {q:"Un intérimaire a-t-il droit aux jours fériés ?",r:"Oui. Les intérimaires ont les mêmes droits que les travailleurs fixes. Les jours fériés sont payés par l'agence d'intérim."},
],
formulaires:[{nom:"SPF Emploi — Jours fériés",url:"https://emploi.belgique.be/fr/themes/jours-feries-et-conges/jours-feries",type:'en_ligne'}]};
export default function ProcedureJoursFeries(){const P=PROC_JF;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coût',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_JF};
