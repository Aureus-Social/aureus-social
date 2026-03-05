'use client';
import { useState, useMemo } from 'react';
const PROC_DS={id:'delegation_syndicale',icon:'✊',categorie:'formation',titre:"Délégation syndicale",resume:"Représentation syndicale dans l'entreprise. Instaurée par CCT sectorielle (pas par la loi). Protection contre le licenciement (CCT n°5). Compétences : négociation, information, contrôle du règlement de travail. Crédit d'heures pour activités syndicales.",
baseLegale:[{ref:"CCT n°5 (15/05/1971)",desc:"Statut de la délégation syndicale — protection, compétences, fonctionnement"},{ref:"CCT sectorielles",desc:"Conditions d'instauration de la délégation syndicale par commission paritaire"},{ref:"Loi 19/03/1991",desc:"Protection des délégués du personnel — licenciement"}],
etapes:[
  {n:1,phase:'instauration',titre:"Conditions et instauration",detail:`═══ QUI PEUT INSTAURER UNE DS ? ═══
• La délégation syndicale est instaurée par CCT SECTORIELLE
• Chaque CP fixe les conditions (seuil de travailleurs, procédure)
• CP 200 : DS possible dès 50 travailleurs si 1 syndicat représentatif le demande
• Certaines CP : seuil plus bas (25 travailleurs)

═══ COMPOSITION ═══
• Nombre de délégués fixé par la CCT sectorielle (selon la taille)
• Délégués désignés par les organisations syndicales représentatives (FGTB, CSC, CGSLB)
• Délégués effectifs + suppléants

═══ COMPÉTENCES ═══
1. Négociation de CCT d'entreprise
2. Information et consultation sur la vie de l'entreprise
3. Veille au respect de la législation sociale et des CCT
4. Contrôle du règlement de travail
5. Intervention en cas de conflit individuel ou collectif
6. Préparation des élections sociales (si CE/CPPT)

═══ FONCTIONNEMENT ═══
• Réunions avec l'employeur (sur demande ou périodiques)
• Crédit d'heures syndicales (rémunéré, fixé par CCT)
• Accès aux informations nécessaires
• Local mis à disposition (si prévu par CCT)`,delai:"À la demande d'un syndicat représentatif",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Variable'},

  {n:2,phase:'protection',titre:"Protection des délégués syndicaux",detail:`═══ PROTECTION (CCT n°5 + Loi 19/03/1991) ═══
Les délégués syndicaux bénéficient d'une protection SIMILAIRE aux candidats élections sociales.

LICENCIEMENT INTERDIT sauf :
1. Motif grave préalablement reconnu par le tribunal du travail
2. Raisons économiques/techniques reconnues par la commission paritaire

═══ INDEMNITÉ DE PROTECTION ═══
Si licenciement illicite :
• Indemnité forfaitaire = rémunération d'1 AN
• + indemnité de préavis normale
• + réintégration possible (si demandée dans les 30 jours)
• Si réintégration refusée par l'employeur : indemnité complémentaire

═══ DURÉE DE LA PROTECTION ═══
• Pendant tout le mandat
• Les conditions exactes dépendent de la CCT sectorielle
• Certaines CCT prévoient une protection étendue après la fin du mandat

═══ OBLIGATIONS DE L'EMPLOYEUR ═══
• Ne pas entraver l'exercice du mandat
• Accorder le crédit d'heures syndicales (rémunéré)
• Fournir les informations demandées
• Ne pas discriminer les délégués (carrière, salaire, formation)
• Ne pas exercer de pression pour empêcher l'activité syndicale`,delai:"Pendant toute la durée du mandat",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Permanent'},
],
alertes:[
  {niveau:'critique',texte:"Délégués syndicaux protégés contre le licenciement. Indemnité = 1 an de salaire + préavis en cas de licenciement illicite."},
  {niveau:'important',texte:"L'instauration dépend de la CCT sectorielle. Vérifier les conditions de votre CP (seuil, nombre de délégués)."},
  {niveau:'attention',texte:"Crédit d'heures syndicales RÉMUNÉRÉ. L'employeur ne peut pas refuser ni sanctionner l'utilisation du crédit."},
  {niveau:'info',texte:"En l'absence de CE/CPPT, la délégation syndicale reprend certaines compétences de ces organes."},
],
simulation:{titre:"Délégation syndicale — Impact",lignes:[
  {label:'Crédit heures syndicales',montant:'Variable selon CCT',type:'neutre'},
  {label:'Réunions avec employeur',montant:'±2-4h/mois',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Licenciement illicite délégué',montant:'±1 an salaire + préavis',type:'vert_bold'},
]},
faq:[
  {q:"Puis-je refuser l'instauration d'une délégation syndicale ?",r:"Non, si les conditions de la CCT sectorielle sont remplies. L'employeur ne peut pas s'opposer à l'instauration."},
  {q:"La DS remplace-t-elle le CE/CPPT ?",r:"Non, ce sont des organes différents. Mais en l'absence de CE/CPPT (entreprises <50 ou <100), la DS reprend certaines compétences."},
],
formulaires:[{nom:"SPF Emploi — Concertation sociale",url:"https://emploi.belgique.be/fr/themes/concertation-sociale",type:'en_ligne'}]};
export default function ProcedureDelegationSyndicale(){const P=PROC_DS;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Impact',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_DS};
