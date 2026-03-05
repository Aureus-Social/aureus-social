'use client';
import { useState, useMemo } from 'react';
const PROC_INDEX={id:'indexation',icon:'📈',categorie:'legal',titre:"Indexation salariale",resume:"Mécanisme d'adaptation automatique des salaires à l'indice des prix à la consommation. Système belge unique : indexation automatique obligatoire. Timing et % dépendent de la commission paritaire. L'employeur ne peut PAS refuser l'indexation.",
baseLegale:[{ref:"Loi 02/08/1971",desc:"Organisation de la liaison des rémunérations à l'indice des prix à la consommation"},{ref:"AR 24/12/1993 (indice santé)",desc:"Indice santé lissé — base de calcul de l'indexation"},{ref:"CCT sectorielles",desc:"Chaque commission paritaire fixe le mécanisme d'indexation (moment et méthode)"}],
etapes:[
  {n:1,phase:'calcul',titre:"Comprendre le mécanisme d'indexation",detail:`═══ PRINCIPE ═══
Les salaires en Belgique sont AUTOMATIQUEMENT adaptés à l'évolution de l'indice des prix à la consommation (indice santé lissé). L'employeur ne peut PAS s'y soustraire.

═══ DEUX GRANDS SYSTÈMES ═══

1. INDEXATION AU DÉPASSEMENT DE L'INDICE-PIVOT
• Secteur public + CP 200 (employés CPNAE) et d'autres
• Quand l'indice santé lissé dépasse l'indice-pivot → augmentation de 2%
• Le moment est imprévisible (dépend de l'inflation)
• CP 200 : indexation en JANVIER de chaque année (mécanisme annuel spécifique)

2. INDEXATION ANNUELLE FIXE
• Certaines CP : indexation à date fixe chaque année
• Pourcentage basé sur l'évolution de l'indice entre deux périodes de référence
• Ex : CP 111 (métal) = indexation en juillet
• Ex : CP 302 (horeca) = indexation en janvier

═══ INDICE SANTÉ LISSÉ ═══
• L'indice santé exclut : tabac, alcool, carburants, diesel
• L'indice lissé = moyenne des 4 derniers mois d'indices santé
• Publié par le SPF Économie chaque mois

═══ CP 200 (la plus courante) ═══
• Indexation en JANVIER de chaque année
• Coefficient = indice santé lissé de décembre N-1 / indice santé lissé de décembre N-2
• Exemple 2026 : si coefficient = 1,0340 → tous les salaires CP 200 augmentent de 3,40%`,delai:"Selon la CP — vérifier le timing",formulaire:null,ou:null,obligatoire:true,duree_estimee:'1h de calcul'},

  {n:2,phase:'application',titre:"Appliquer l'indexation — Paie",detail:`═══ APPLICATION AUTOMATIQUE ═══
L'employeur DOIT appliquer l'indexation :
• Sur le salaire barémique
• Sur les barèmes sectoriels (minima)
• Sur le salaire réel si le contrat/CCT le prévoit
• Rétroactivement si l'indexation est connue après la date de paie

═══ CALCUL ═══
Salaire indexé = Salaire actuel × coefficient d'indexation

Exemple : CP 200, coefficient janvier 2026 = 1,0340
• Salaire brut actuel : 3.200,00€
• Salaire indexé : 3.200,00 × 1,0340 = 3.308,80€
• Augmentation : +108,80€/mois

═══ CE QUI EST INDEXÉ ═══
✅ Salaire brut (barémique et réel)
✅ Prime de fin d'année / 13e mois (si basé sur le salaire)
✅ Indemnités forfaitaires (si liées au salaire)
✅ Barèmes sectoriels

═══ CE QUI N'EST PAS (toujours) INDEXÉ ═══
❌ Chèques-repas (montant fixe — pas automatiquement indexé)
❌ Avantages en nature (voiture de société)
❌ Bonus non récurrents (CCT 90)
❌ Commissions (si basées sur le chiffre d'affaires)

═══ IMPACT SUR LES CHARGES ═══
Indexation de 3% sur masse salariale de 200.000€ :
• Augmentation brute : +6.000€/an
• + ONSS patronal (25%) : +1.500€/an
• Coût total : +7.500€/an → à budgéter !`,delai:"Dès que le coefficient est connu — rétroactif si nécessaire",formulaire:"Fiche de paie avec nouveau montant indexé",ou:null,obligatoire:true,duree_estimee:'15 min/travailleur'},
],
alertes:[
  {niveau:'critique',texte:"L'indexation est OBLIGATOIRE et AUTOMATIQUE. L'employeur ne peut PAS refuser, reporter ou négocier l'indexation."},
  {niveau:'critique',texte:"Chaque CP a son propre mécanisme. VÉRIFIER la CP du travailleur pour connaître le timing et le coefficient."},
  {niveau:'important',texte:"CP 200 : indexation en JANVIER. Coefficient publié fin décembre. Appliquer dès la paie de janvier."},
  {niveau:'attention',texte:"Budgéter l'impact : indexation de 3% sur masse salariale = +3,75% du coût total employeur (avec charges)."},
],
simulation:{titre:"Impact indexation (5 employés, 3.200€ brut moyen, +3,4%)",lignes:[
  {label:'Salaire avant indexation',montant:'3.200€/mois',type:'neutre'},
  {label:'Coefficient 2026 (ex: 1,034)',montant:'+3,40%',type:'neutre'},
  {label:'Salaire après indexation',montant:'3.308,80€/mois',type:'vert'},
  {label:'',montant:'',type:'separateur'},
  {label:'Surcoût par travailleur',montant:'+108,80€/mois brut',type:'neutre'},
  {label:'+ ONSS patronal (25%)',montant:'+27,20€/mois',type:'neutre'},
  {label:'Surcoût total 5 employés/an',montant:'±8.160€/an',type:'vert_bold'},
]},
faq:[
  {q:"L'employeur peut-il absorber l'indexation dans le salaire ?",r:"Non en principe. L'indexation s'applique au salaire réel. Exception : si le salaire réel est significativement au-dessus du barème, certaines CCT permettent l'absorption (vérifier la CP)."},
  {q:"Les chèques-repas sont-ils indexés ?",r:"Non automatiquement. Le montant des chèques-repas est fixé par la CCT ou le contrat. Il peut être revu périodiquement mais ce n'est pas une indexation automatique."},
],
formulaires:[{nom:"SPF Économie — Indice des prix",url:"https://economie.fgov.be/fr/themes/prix/indice-des-prix-la-consommation",type:'en_ligne'},{nom:"SPF Emploi — Indexation",url:"https://emploi.belgique.be/fr/themes/remuneration/indexation-des-salaires",type:'en_ligne'}]};
export default function ProcedureIndexation(){const P=PROC_INDEX;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Impact',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_INDEX};
