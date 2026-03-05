'use client';
import { useState, useMemo } from 'react';
const PROC_PEN={id:'pension',icon:'🏖️',categorie:'protection',titre:"Pension légale & mise à la retraite",resume:"Âge légal 66 ans (2025-2029), 67 ans dès 2030. Pension anticipée possible sous conditions (63 ans + 42 ans carrière). L'employeur ne peut PAS forcer la mise à la retraite. Notification écrite. Impact sur préavis et solde de tout compte.",
baseLegale:[{ref:"AR n°50 (24/10/1967)",desc:"Pension de retraite des travailleurs salariés"},{ref:"Loi 10/08/2015",desc:"Relèvement de l'âge légal de la pension (66 → 67 ans)"},{ref:"AR 23/12/1996",desc:"Pension anticipée — conditions de carrière et d'âge"}],
etapes:[
  {n:1,phase:'calcul',titre:"Âge légal, pension anticipée et calcul",detail:`═══ ÂGE LÉGAL DE LA PENSION ═══
• 2025-2029 : 66 ANS
• Dès 2030 : 67 ANS
• L'âge s'applique au 1er jour du mois suivant l'anniversaire

═══ PENSION ANTICIPÉE ═══
Conditions (2026) :
• 63 ans + 42 ans de carrière
• OU 61 ans + 44 ans de carrière
• OU 60 ans + 44 ans de carrière (longue carrière)
• Années assimilées comptent (maladie, chômage, crédit-temps)

═══ CALCUL DE LA PENSION ═══
Formule : Σ (salaire plafonné × taux) / 45

• Salaire plafonné 2026 : ±73.424€ brut/an
• Taux isolé : 60%
• Taux ménage : 75% (si conjoint sans revenus)
• Carrière complète = 45 ANS
• Minimum garanti (carrière complète) : ±1.740€/mois net (isolé)
• Maximum (carrière complète, plafond atteint) : ±2.900€/mois net

═══ PENSION COMPLÉMENTAIRE (2e PILIER) ═══
• Assurance groupe ou fonds de pension
• Capital ou rente à la pension
• Fiscalité avantageuse (taxe 10-16,5% sur le capital)
• L'employeur et/ou le travailleur cotisent

═══ DEMANDE DE PENSION ═══
• mypension.be : simulation et demande en ligne
• La demande peut être introduite 1 AN avant la date souhaitée
• Si pas de demande : pension octroyée d'office à l'âge légal`,delai:"Demande : 1 an avant la date souhaitée",formulaire:"mypension.be (demande en ligne)",ou:"SFP (Service Fédéral des Pensions)",obligatoire:true,duree_estimee:'1h'},

  {n:2,phase:'employeur',titre:"Obligations de l'employeur — Mise à la retraite",detail:`═══ L'EMPLOYEUR NE PEUT PAS FORCER LA RETRAITE ═══
Principe fondamental : le travailleur décide SEUL de partir à la pension.
• L'employeur ne peut pas licencier POUR LE MOTIF de l'âge (discrimination)
• Exception : clause de mise à la retraite automatique dans le contrat (si conforme)

═══ SI LE TRAVAILLEUR PART VOLONTAIREMENT ═══
• Le travailleur notifie sa démission (préavis réduit, max 13 semaines)
• Ou : rupture de commun accord
• Documents de sortie : C4 "pension", solde, pécule, 281.10, DIMONA OUT

═══ SI L'EMPLOYEUR SOUHAITE METTRE FIN AU CONTRAT ═══
• Licenciement ordinaire avec préavis (calculé sur l'ancienneté totale)
• Attention : le travailleur de 65+ a droit au même préavis que les autres
• CCT 109 : motivation obligatoire
• Pas d'outplacement obligatoire si le travailleur a atteint l'âge de la pension

═══ IMPACT SUR LE PRÉAVIS ═══
• Le préavis est calculé sur l'ancienneté TOTALE (pas de réduction pour l'âge)
• Depuis 2014 : statut unique, pas de distinction employé/ouvrier
• Travailleur qui part à la pension : préavis réduit (max 13 semaines)

═══ CUMUL PENSION + TRAVAIL ═══
Depuis 2015 : cumul illimité après 45 ans de carrière OU après l'âge légal.
• Sinon : plafond de revenus (±25.000€/an si pension anticipée)
• Le travailleur pensionné peut travailler comme salarié ou indépendant
• Flexi-job : très populaire pour les pensionnés (pas de plafond, cotisations réduites)`,delai:"C4 + documents dans les délais habituels",formulaire:"C4 'pension' + solde de tout compte",ou:null,obligatoire:true,duree_estimee:'1h'},
],
alertes:[
  {niveau:'critique',texte:"L'employeur ne peut PAS forcer la mise à la retraite pour motif d'âge. C'est de la discrimination. Le travailleur décide."},
  {niveau:'important',texte:"Âge légal : 66 ans (2025-2029), 67 ans dès 2030. Pension anticipée : 63 ans + 42 ans carrière minimum."},
  {niveau:'important',texte:"Cumul pension + travail illimité si 45 ans de carrière OU âge légal atteint. Sinon plafond ±25.000€/an."},
  {niveau:'attention',texte:"Pension complémentaire (2e pilier) : vérifier les conditions de liquidation. Capital soumis à une taxe de 10-16,5%."},
],
simulation:{titre:"Pension — Estimation mensuelle nette",lignes:[
  {label:'Carrière complète isolé (min garanti)',montant:'±1.740€/mois net',type:'neutre'},
  {label:'Carrière complète isolé (plafond)',montant:'±2.900€/mois net',type:'neutre'},
  {label:'Carrière complète ménage (plafond)',montant:'±3.600€/mois net',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'+ Pension complémentaire (capital moyen)',montant:'±50.000-150.000€',type:'vert'},
  {label:'Flexi-job pensionné (complément)',montant:'Illimité, cotis. réduites',type:'vert_bold'},
]},
faq:[
  {q:"Puis-je prendre ma pension et continuer à travailler ?",r:"Oui. Si 45 ans de carrière ou âge légal atteint : cumul illimité. Le flexi-job est très avantageux pour les pensionnés (pas de plafond, cotisations réduites)."},
  {q:"Comment connaître le montant de ma pension ?",r:"mypension.be permet de faire une simulation détaillée basée sur votre carrière réelle. Le SFP envoie aussi un aperçu périodique."},
],
formulaires:[{nom:"mypension.be",url:"https://www.mypension.be",type:'en_ligne'},{nom:"SFP — Service Fédéral des Pensions",url:"https://www.sfpd.fgov.be",type:'en_ligne'}]};
export default function ProcedurePension(){const P=PROC_PEN;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Montants',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}</div>)}
export {PROC_PEN};
