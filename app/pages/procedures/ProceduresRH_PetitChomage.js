'use client';
import { useState, useMemo } from 'react';
const PROC_PETIT_CHOMAGE={id:'petit_chomage',icon:'📝',categorie:'absence',titre:"Petit chômage — Congés de circonstance",resume:"Absences rémunérées par l'employeur pour événements familiaux ou obligations civiques. AR 28/08/1963. Mariage : 2 jours, décès conjoint : 3 jours, décès parent 1er degré : 3 jours, communion : 1 jour, etc. Salaire normal maintenu.",
baseLegale:[{ref:"AR 28/08/1963",desc:"Petit chômage — liste des événements et durées d'absence autorisées"},{ref:"Loi 03/07/1978, art. 30",desc:"Maintien du salaire pendant le petit chômage"},{ref:"CCT sectorielles",desc:"Certaines commissions paritaires accordent des jours supplémentaires"}],
etapes:[
  {n:1,phase:'événement',titre:"Liste complète des congés de circonstance",detail:`═══ ÉVÉNEMENTS FAMILIAUX ═══

MARIAGE :
• Du travailleur : 2 jours (à choisir dans la semaine de l'événement ou la semaine suivante)
• D'un enfant : 1 jour (le jour de la cérémonie)
• D'un frère/sœur, beau-frère/belle-sœur : 1 jour (le jour)
• D'un parent/beau-parent : 1 jour (le jour)

DÉCÈS :
• Conjoint/cohabitant légal : 3 jours (à choisir entre le décès et les funérailles + 1 jour)
• Enfant du travailleur ou du conjoint : 3 jours
• Père, mère, beau-père, belle-mère : 3 jours
• Frère, sœur, beau-frère, belle-sœur : 2 jours
• Grand-parent du travailleur ou du conjoint : 2 jours
• Petit-enfant : 2 jours
• Gendre, belle-fille : 2 jours
• Arrière-grand-parent, arrière-petit-enfant : 1 jour (le jour des funérailles)
• Personne vivant sous le toit du travailleur : 2 jours (décès et funérailles)

NAISSANCE :
• D'un enfant : voir congé de paternité/naissance (20 jours)

═══ ÉVÉNEMENTS CIVIQUES ═══
• Communion solennelle d'un enfant : 1 jour
• Fête laïque de la jeunesse d'un enfant : 1 jour
• Obligation de comparaître en justice (témoin, juré) : le temps nécessaire
• Participation au bureau de vote (assesseur) : le temps nécessaire
• Conseil de famille (convoqué par le juge de paix) : le temps nécessaire

═══ AUTRES ═══
• Ordination d'un enfant : 1 jour
• Déménagement (si prévu par la CCT sectorielle) : 1 jour (pas dans l'AR !)`,delai:"Le jour de l'événement ou la période légale",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Variable'},

  {n:2,phase:'gestion',titre:"Justification + paiement — Salaire normal maintenu",detail:`═══ JUSTIFICATION ═══
Le travailleur doit :
• Avertir l'employeur à l'avance (si l'événement est prévisible)
• Fournir un justificatif si l'employeur le demande :
  - Mariage : acte de mariage ou invitation
  - Décès : extrait d'acte de décès ou faire-part
  - Communion : attestation de la paroisse ou de l'école
  - Tribunal : convocation

═══ PAIEMENT ═══
• Salaire NORMAL maintenu (100%)
• Payé par l'EMPLOYEUR
• Inclus dans la fiche de paie normale
• Soumis à l'ONSS et au PP (comme un jour de travail normal)

═══ JOURS CONCERNÉS ═══
• Les jours d'absence doivent coïncider avec des jours de travail effectifs
• Si l'événement tombe un dimanche ou un jour non presté → pas de petit chômage
• Exception : le travailleur peut choisir les jours dans la "période légale" (semaine de l'événement ou semaine suivante pour le mariage)

═══ CCT SECTORIELLES ═══
Certaines CCT accordent des jours SUPPLÉMENTAIRES :
• CP 200 (employés) : vérifier les conventions spécifiques
• Secteur public : souvent plus généreux
• Toujours vérifier la CCT applicable !`,delai:"Le jour de l'événement",formulaire:"Justificatif (acte, attestation, convocation)",ou:null,obligatoire:true,duree_estimee:'5 min/événement'},
],
alertes:[
  {niveau:'critique',texte:"Le petit chômage est un DROIT. L'employeur ne peut PAS le refuser si l'événement est dans la liste légale et le justificatif est fourni."},
  {niveau:'important',texte:"Le salaire est maintenu à 100% par l'EMPLOYEUR. C'est un congé PAYÉ, pas une absence non rémunérée."},
  {niveau:'attention',texte:"Le déménagement n'est PAS dans la liste légale (AR 28/08/1963). Vérifier si la CCT sectorielle l'accorde."},
  {niveau:'info',texte:"Les CCT sectorielles peuvent accorder des jours SUPPLÉMENTAIRES. Toujours vérifier la CP du travailleur."},
],
simulation:{titre:"Petit chômage — Principaux événements",lignes:[
  {label:'Mariage du travailleur',montant:'2 jours payés',type:'vert'},
  {label:'Décès conjoint/enfant/parent',montant:'3 jours payés',type:'vert'},
  {label:'Décès frère/sœur/grand-parent',montant:'2 jours payés',type:'vert'},
  {label:'Mariage enfant/frère/sœur',montant:'1 jour payé',type:'vert'},
  {label:'Communion/fête laïque enfant',montant:'1 jour payé',type:'vert'},
  {label:'',montant:'',type:'separateur'},
  {label:'Coût employeur (1 jour, 3.200€ brut)',montant:'±215€ tout compris',type:'vert_bold'},
]},
faq:[
  {q:"Le petit chômage s'applique-t-il au cohabitant de fait ?",r:"L'AR vise le conjoint et le cohabitant légal. Pour le cohabitant de fait, vérifier si la CCT sectorielle ou d'entreprise l'inclut."},
  {q:"Si le décès tombe pendant mes vacances ?",r:"Le petit chômage prime sur les vacances. Les jours de vacances sont 'récupérés' et le petit chômage s'applique."},
  {q:"Mon employeur peut-il exiger un justificatif ?",r:"Oui, l'employeur peut demander un justificatif (acte, attestation). Le travailleur doit le fournir. Mais l'employeur ne peut pas refuser le congé si le justificatif est valable."},
],
formulaires:[{nom:"SPF Emploi — Petit chômage",url:"https://emploi.belgique.be/fr/themes/jours-feries-et-conges/petit-chomage",type:'en_ligne'}]};
export default function ProcedurePetitChomage(){const P=PROC_PETIT_CHOMAGE;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Tableau',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_PETIT_CHOMAGE};
