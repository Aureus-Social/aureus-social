'use client';
import { useState, useMemo } from 'react';
const PROC_RUPTURE_CA={id:'rupture_ca',icon:'🤝',categorie:'fin',titre:"Rupture de commun accord",resume:"Fin du contrat par accord mutuel entre employeur et travailleur. Pas de préavis, pas de formalisme légal strict. Convention écrite fortement recommandée. Le travailleur n'a PAS automatiquement droit au chômage.",
baseLegale:[{ref:"Code civil, art. 1134",desc:"Les conventions légalement formées tiennent lieu de loi — résiliation par consentement mutuel"},{ref:"Loi 03/07/1978",desc:"Contrat de travail — la rupture de commun accord n'est pas réglementée spécifiquement"},{ref:"Cass. 21/01/2008",desc:"Jurisprudence : le consentement doit être libre et éclairé — pas de pression ou contrainte"},{ref:"AR 25/11/1991, art. 51",desc:"Chômage : pas de droit automatique si rupture de commun accord (ONEM peut sanctionner)"}],
etapes:[
  {n:1,phase:'préparation',titre:"Discussion et accord entre les parties",detail:`La rupture de commun accord est une NÉGOCIATION.

═══ INITIATIVE ═══
Peut venir de l'employeur OU du travailleur. Souvent : l'employeur propose une "sortie amiable" pour éviter un préavis long.

═══ POINTS À NÉGOCIER ═══
1. Date de fin du contrat
2. Indemnité de départ (pas obligatoire mais fréquente)
3. Sort des avantages : voiture, GSM, laptop (usage prolongé ?)
4. Clause de non-concurrence (activation ou renonciation)
5. Outplacement volontaire (geste de bonne volonté)
6. Attestation de travail positive
7. Clause de confidentialité
8. Renonciation réciproque à toute action en justice

═══ CONSENTEMENT LIBRE ═══
Le consentement DOIT être :
✅ Libre (pas de pression, menace, chantage)
✅ Éclairé (le travailleur comprend les conséquences)
✅ Non vicié (pas d'erreur, de dol ou de violence)
Si le consentement est vicié → la convention peut être annulée par le tribunal.

═══ CONSEIL AU TRAVAILLEUR ═══
Recommander au travailleur de prendre quelques jours de réflexion et de consulter un avocat ou son syndicat. Cela sécurise la validité de l'accord.`,delai:"Variable — négociation libre",formulaire:null,ou:null,obligatoire:true,duree_estimee:'1-2 semaines'},
  {n:2,phase:'exécution',titre:"Rédiger et signer la convention de rupture",detail:`Aucune forme légale n'est imposée mais un ÉCRIT est INDISPENSABLE.

═══ CONTENU DE LA CONVENTION ═══
1. Identité des parties
2. Référence au contrat de travail (date, fonction)
3. Volonté MUTUELLE de mettre fin au contrat
4. Date de fin effective
5. Indemnité de départ (montant, modalités de paiement)
6. Sort des avantages en nature
7. Clause de non-concurrence
8. Clause de confidentialité
9. Renonciation réciproque à toute réclamation
10. Signatures des 2 parties (en 2 exemplaires)

═══ INDEMNITÉ DE DÉPART ═══
L'indemnité n'est PAS obligatoire mais très fréquente :
• Montant négocié (souvent calqué sur le préavis)
• Traitement fiscal : soumise à l'ONSS et au PP
• Si l'indemnité couvre une "période de préavis théorique" → elle bloque le droit au chômage pendant cette période

═══ IMPACT CHÔMAGE ═══
⚠️ Le travailleur n'a PAS automatiquement droit au chômage :
• L'ONEM peut considérer la rupture comme "abandon volontaire"
• Sanction possible : 4 à 52 semaines d'exclusion du chômage
• Le travailleur doit prouver que l'initiative venait de l'employeur
• Conseil : mentionner dans la convention que l'initiative vient de l'employeur`,delai:"Le jour convenu",formulaire:"Convention de rupture de commun accord (modèle Aureus Social Pro)",ou:"En interne — signature en 2 exemplaires",obligatoire:true,duree_estimee:'1-2h'},
  {n:3,phase:'fin',titre:"Documents de sortie + DIMONA OUT",detail:`═══ DOCUMENTS ═══
1. Convention de rupture signée (copie pour le travailleur)
2. C4 avec mention "rupture de commun accord"
3. Fiche de paie finale (salaire + indemnité si applicable)
4. Pécule de vacances de sortie
5. Attestation de vacances
6. 281.10 (fiche fiscale)
7. Attestation d'occupation
8. DIMONA OUT

═══ CHÔMAGE ═══
Le C4 mentionne "rupture de commun accord". L'ONEM évaluera le dossier.
Si l'initiative vient clairement de l'employeur → meilleure chance pour le travailleur.
Si doute → sanction possible.`,delai:"Le dernier jour convenu",formulaire:"C4 + convention + docs de sortie",ou:null,obligatoire:true,duree_estimee:'2h'},
],
alertes:[
  {niveau:'critique',texte:"Le consentement DOIT être libre et éclairé. Toute pression, menace ou contrainte rend la convention annulable par le tribunal."},
  {niveau:'critique',texte:"Le travailleur n'a PAS automatiquement droit au chômage. L'ONEM peut sanctionner jusqu'à 52 semaines. Informer le travailleur de ce risque."},
  {niveau:'important',texte:"TOUJOURS un ÉCRIT signé en 2 exemplaires. Sans convention écrite → problème de preuve en cas de contestation."},
  {niveau:'attention',texte:"Si l'indemnité couvre une 'période théorique', le droit au chômage est bloqué pendant cette période."},
  {niveau:'info',texte:"Mentionner dans la convention que l'initiative vient de l'employeur. Cela aide le travailleur pour le chômage."},
],
simulation:{titre:"Rupture commun accord — Coût typique (8 ans, 3.200€ brut)",lignes:[
  {label:'Indemnité négociée (équiv. préavis)',montant:'±17.000-25.000€ brut',type:'neutre'},
  {label:'+ Pécule vacances sortie',montant:'±2.946€',type:'neutre'},
  {label:'+ Prorata 13e mois',montant:'Variable',type:'neutre'},
  {label:'Coût total',montant:'±22.000-30.000€',type:'vert_bold'},
  {label:'',montant:'',type:'separateur'},
  {label:'vs Licenciement ordinaire (24 sem)',montant:'±29.717€',type:'neutre'},
  {label:'Économie potentielle',montant:'0 à 8.000€',type:'vert'},
]},
faq:[
  {q:"Le travailleur peut-il rétracter son accord ?",r:"En principe non, une fois signé. Sauf s'il prouve un vice de consentement (pression, erreur, dol). Un délai de réflexion de quelques jours sécurise la validité."},
  {q:"Faut-il payer une indemnité ?",r:"Pas obligatoire légalement. Mais en pratique, c'est quasi systématique. Le montant est libre et négocié."},
  {q:"Le travailleur a-t-il droit au chômage ?",r:"Pas automatiquement. L'ONEM peut sanctionner (4-52 semaines). Le C4 mentionne 'commun accord'. Si l'initiative vient de l'employeur, le risque est moindre."},
],
formulaires:[{nom:"SPF Emploi — Fin du contrat",url:"https://emploi.belgique.be/fr/themes/contrats-de-travail/fin-du-contrat-de-travail",type:'en_ligne'}]};
export default function ProcedureRuptureCA(){const P=PROC_RUPTURE_CA;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'préparation',l:'Négociation',i:'🤝'},{id:'exécution',l:'Convention',i:'✍️'},{id:'fin',l:'Sortie',i:'📄'}];const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_RUPTURE_CA};
