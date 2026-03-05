'use client';
import { useState, useMemo } from 'react';
const PROC_PATERNITE={id:'paternite',icon:'👨‍👧',categorie:'absence',titre:"Congé de paternité / naissance (20 jours)",resume:"20 jours de congé de naissance pour le coparent (père, coparente). 3 premiers jours payés par l'employeur (100%), 17 jours suivants par la mutuelle (82%). Obligatoire de prendre les 3 premiers jours dans les 4 mois. Protection contre le licenciement.",
baseLegale:[{ref:"Loi 16/03/1971, art. 30 §2",desc:"Congé de paternité — 20 jours depuis 01/01/2023"},{ref:"AR 17/10/1994",desc:"Indemnités de paternité — conditions et montants mutuelle"},{ref:"Loi 22/12/2022",desc:"Extension à 20 jours et transposition directive européenne 2019/1158"}],
etapes:[
  {n:1,phase:'notification',titre:"Le coparent informe l'employeur",detail:`═══ QUI A DROIT ? ═══
• Le père de l'enfant
• La coparente (partenaire de même sexe de la mère)
• La personne qui a reconnu l'enfant
• Le coparent dans un couple de fait (qui cohabite avec la mère)

═══ DURÉE : 20 JOURS ═══
• 3 premiers jours : payés par l'EMPLOYEUR (100% du salaire)
• 17 jours suivants : payés par la MUTUELLE (82% du salaire brut plafonné)
• Total : 20 jours ouvrables (pas calendrier)

═══ DÉLAI ═══
• Les 20 jours doivent être pris dans les 4 MOIS suivant la naissance
• Les 3 premiers jours sont souvent pris directement après la naissance
• Les 17 jours suivants peuvent être fractionnés librement dans les 4 mois

═══ NOTIFICATION ═══
• Le travailleur informe l'employeur dans un délai raisonnable
• Il fournit l'extrait d'acte de naissance (dès que disponible)
• L'employeur NE PEUT PAS refuser

═══ PROTECTION ═══
Protection contre le licenciement :
• Début : dès l'information de l'employeur
• Fin : 5 mois après la naissance
• Licenciement abusif = indemnité de 6 mois de salaire`,delai:"Dès la naissance — dans les 4 mois",formulaire:"Extrait d'acte de naissance",ou:null,obligatoire:true,duree_estimee:'Immédiat'},
  {n:2,phase:'gestion',titre:"Calcul et paiement — Employeur 3 jours + Mutuelle 17 jours",detail:`═══ 3 PREMIERS JOURS ═══
• Payés par l'EMPLOYEUR à 100% du salaire normal
• = Petit chômage / congé de circonstance (assimilé)
• Inclus dans la fiche de paie normale

═══ 17 JOURS SUIVANTS ═══
• Payés par la MUTUELLE à 82% du salaire brut plafonné
• Le travailleur doit informer sa mutuelle
• L'employeur complète l'attestation de salaire

═══ FRACTIONNEMENT ═══
Les 17 jours mutuelle peuvent être pris :
• En bloc continu (17 jours d'affilée)
• Par jours isolés (très flexible)
• Par semaines
• En demi-jours (accord employeur nécessaire)
Le tout dans les 4 mois suivant la naissance.

═══ EXEMPLE (3.200€ brut) ═══
3 jours employeur : 3/20 × 3.200€ = 480€ brut
17 jours mutuelle : 82% × 3.200€ / 20 × 17 = ±2.234€ brut
Total reçu : ±2.714€ brut pour 20 jours`,delai:"3 jours immédiats + 17 jours dans les 4 mois",formulaire:"Fiche paie + attestation mutuelle",ou:null,obligatoire:true,duree_estimee:'20 jours'},
  {n:3,phase:'gestion',titre:"DmfA + retour au travail",detail:`═══ DMFA ═══
• 3 premiers jours : code absence "petit chômage / naissance"
• 17 jours : code absence "congé de paternité / mutuelle"

═══ RETOUR ═══
• Le travailleur reprend normalement après les 20 jours
• Pas de visite de reprise obligatoire (sauf si >4 semaines d'absence combinée)
• Il peut enchaîner avec le congé parental (4 mois/enfant)

═══ CUMUL ═══
Le congé de naissance est DISTINCT du congé parental :
• 20 jours naissance + 4 mois congé parental = droits cumulatifs
• Les deux parents peuvent prendre leur congé parental en même temps`,delai:"Après les 20 jours",formulaire:"DmfA adaptée",ou:null,obligatoire:true,duree_estimee:'15 min'},
],
alertes:[
  {niveau:'critique',texte:"L'employeur NE PEUT PAS refuser le congé de naissance. C'est un droit absolu du coparent. 20 jours dans les 4 mois."},
  {niveau:'critique',texte:"Les 3 premiers jours sont à charge de l'EMPLOYEUR (100%). Les 17 suivants sont à charge de la MUTUELLE (82%)."},
  {niveau:'important',texte:"Protection contre le licenciement : de l'information → 5 mois après la naissance. Sanction : 6 mois de salaire."},
  {niveau:'info',texte:"Les 17 jours mutuelle peuvent être fractionnés librement. Le travailleur peut les répartir dans les 4 mois comme il le souhaite."},
],
simulation:{titre:"Congé paternité/naissance — 20 jours (3.200€ brut)",lignes:[
  {label:'3 jours employeur (100%)',montant:'480€ brut',type:'neutre'},
  {label:'17 jours mutuelle (82%)',montant:'±2.234€ brut',type:'vert'},
  {label:'',montant:'',type:'separateur'},
  {label:'Coût employeur total',montant:'±645€ (brut + charges)',type:'vert_bold'},
]},
faq:[
  {q:"Le père non marié y a-t-il droit ?",r:"Oui, s'il a reconnu l'enfant ou s'il cohabite légalement/de fait avec la mère au moment de la naissance."},
  {q:"Le congé est-il fractionnable ?",r:"Les 3 premiers jours : en principe consécutifs. Les 17 jours : totalement fractionnables dans les 4 mois (jours isolés, semaines, etc.)."},
  {q:"En cas d'adoption ?",r:"Le congé d'adoption existe séparément (6 semaines). Le congé de naissance ne s'applique pas à l'adoption."},
],
formulaires:[{nom:"INAMI — Congé de naissance",url:"https://www.inami.fgov.be/fr/themes/grossesse-naissance/conge-naissance",type:'en_ligne'}]};
export default function ProcedurePaternite(){const P=PROC_PATERNITE;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'notification',l:'Notification',i:'📞'},{id:'gestion',l:'Gestion',i:'📆'}];const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_PATERNITE};
