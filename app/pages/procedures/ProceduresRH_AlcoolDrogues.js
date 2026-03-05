'use client';
import { useState, useMemo } from 'react';
const PROC_AD={id:'alcool_drogues',icon:'🚫',categorie:'bienetre',titre:"Politique alcool & drogues (CCT 100)",resume:"CCT 100 impose à chaque entreprise une politique préventive en matière d'alcool et de drogues au travail. 4 phases : déclaration de politique, règles, procédure en cas de dysfonctionnement, aide. Tests d'alcoolémie encadrés. Intégrée au règlement de travail.",
baseLegale:[{ref:"CCT n°100",desc:"Politique préventive en matière d'alcool et de drogues — cadre interprofessionnel"},{ref:"Loi 04/08/1996",desc:"Bien-être au travail — lien avec la prévention des risques"},{ref:"Loi 28/01/2003",desc:"Examens médicaux dans le cadre des relations de travail (tests)"}],
etapes:[
  {n:1,phase:'politique',titre:"Les 4 phases de la politique alcool/drogues",detail:`═══ OBLIGATION ═══
TOUTE entreprise doit avoir une politique préventive alcool et drogues.
La CCT 100 est supplétive : elle s'applique à défaut de CCT d'entreprise.

═══ PHASE 1 : DÉCLARATION DE POLITIQUE ═══
Minimum OBLIGATOIRE pour toutes les entreprises :
• Les points de départ et objectifs de la politique
• Le cadre de prévention (pas uniquement répressif)
• L'approche constructive (aide, pas punition)
• Intégration dans la politique de bien-être global

═══ PHASE 2 : RÈGLES ═══
Optionnel mais recommandé :
• Disponibilité d'alcool sur le lieu de travail (interdiction totale ou règles)
• Consommation pendant le travail et événements (Nouvel An, teambuilding)
• Apport d'alcool/drogues sur le lieu de travail
• Taux d'alcoolémie acceptable (si tests prévus)

═══ PHASE 3 : PROCÉDURE DYSFONCTIONNEMENT ═══
Optionnel mais recommandé :
• Que faire si un travailleur est visiblement sous influence ?
• Écarter temporairement le travailleur (sécurité)
• Entretien avec le supérieur hiérarchique
• Enregistrement des faits
• Mesures progressives (avertissement → aide → sanction)

═══ PHASE 4 : AIDE ET ASSISTANCE ═══
Optionnel mais recommandé :
• Orientation vers le médecin du travail
• Contact avec le conseiller en prévention psychosocial
• Structures d'aide externes (CAD, groupes d'entraide)
• Confidentialité garantie`,delai:"Politique minimum (phase 1) obligatoire — phases 2-4 recommandées",formulaire:"Politique alcool et drogues + intégration règlement de travail",ou:null,obligatoire:true,duree_estimee:'2-4h'},

  {n:2,phase:'tests',titre:"Tests d'alcoolémie — Cadre strict",detail:`═══ TESTS AUTORISÉS ═══
Les tests d'alcoolémie (éthylotest) sont possibles MAIS très encadrés :

CONDITIONS CUMULATIVES :
1. Prévu dans le règlement de travail
2. But : vérifier si le travailleur est apte à travailler
3. PAS pour déterminer un taux d'alcoolémie précis
4. Uniquement par des personnes habilitées
5. Respect de la vie privée

═══ TESTS INTERDITS ═══
• Tests sanguins (acte médical = médecin uniquement)
• Tests de drogues (urine, salive) SAUF si poste de sécurité et prévu au règlement
• Tests systématiques sans motif (uniquement si signes de dysfonctionnement)
• Tests punitifs (le but est préventif)

═══ CONSÉQUENCES D'UN TEST POSITIF ═══
• Écartement temporaire du poste (sécurité)
• PAS de licenciement automatique
• Entretien avec le travailleur (cadre de la politique)
• Mesures progressives (aide, avertissement, puis sanctions si récidive)
• Le motif grave reste possible si : récidive + poste de sécurité + danger avéré

═══ RGPD ═══
• Les résultats de tests sont des données de santé sensibles
• Pas de conservation des résultats au-delà de leur utilité
• Pas de communication à des tiers (sauf médecin du travail)
• Le travailleur a un droit d'accès et de rectification`,delai:"Si tests prévus : mention au règlement de travail (publicité 15j)",formulaire:"Procédure de test + registre (confidentiel)",ou:null,obligatoire:false,duree_estimee:'1h mise en place'},
],
alertes:[
  {niveau:'critique',texte:"Phase 1 (déclaration de politique) OBLIGATOIRE pour toutes les entreprises. Minimum absolu de la CCT 100."},
  {niveau:'important',texte:"Tests d'alcoolémie : uniquement si prévus au règlement de travail. Pas de test sanguin. But préventif, pas punitif."},
  {niveau:'important',texte:"L'approche doit être CONSTRUCTIVE : aide et prévention d'abord, sanctions en dernier recours. Pas de tolérance zéro sans accompagnement."},
  {niveau:'attention',texte:"Les données de tests sont des données de santé (RGPD). Conservation minimale, pas de communication aux tiers."},
],
simulation:{titre:"Politique alcool/drogues — Coûts",lignes:[
  {label:'Rédaction politique + formation',montant:'±500-1.500€',type:'neutre'},
  {label:'Éthylotests (si prévus)',montant:'±5-15€/test',type:'neutre'},
  {label:'Accompagnement externe',montant:'Variable',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Coût accident lié à l\'alcool',montant:'10.000-500.000€+',type:'vert_bold'},
  {label:'Absentéisme lié aux addictions',montant:'±3× plus élevé',type:'vert'},
]},
faq:[
  {q:"Puis-je interdire totalement l'alcool dans l'entreprise ?",r:"Oui. L'interdiction totale est possible et de plus en plus courante. Elle doit être prévue dans le règlement de travail. L'exception pour les événements (Nouvel An) peut être maintenue."},
  {q:"Un travailleur ivre peut-il être licencié pour motif grave ?",r:"Possible mais risqué. Un seul incident d'ivresse n'est généralement pas suffisant. Il faut : récidive, avertissements préalables, poste de sécurité, et/ou danger avéré. Toujours consulter un avocat."},
],
formulaires:[{nom:"SPF Emploi — Politique alcool et drogues",url:"https://emploi.belgique.be/fr/themes/bien-etre-au-travail/facteurs-de-risques/alcool-et-drogues",type:'en_ligne'}]};
export default function ProcedureAlcoolDrogues(){const P=PROC_AD;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_AD};
