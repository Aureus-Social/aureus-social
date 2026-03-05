'use client';
import { useState, useMemo } from 'react';
const PROC_LC={id:'licenciement_collectif',icon:'📉',categorie:'special',titre:"Licenciement collectif (Loi Renault)",resume:"Procédure stricte dès certains seuils (10+ licenciements sur 60 jours). Information et consultation du CE obligatoires AVANT toute décision. Plan social négocié. Outplacement collectif. Prépension (RCC). Sanctions lourdes si procédure non respectée.",
baseLegale:[{ref:"CCT n°24 (02/10/1975)",desc:"Licenciement collectif — information, consultation, critères"},{ref:"Loi 13/02/1998 (Loi Renault)",desc:"Information et consultation des travailleurs en cas de licenciement collectif"},{ref:"AR 24/05/1976",desc:"Cellule pour l'emploi — outplacement collectif"}],
etapes:[
  {n:1,phase:'seuils',titre:"Seuils et définition du licenciement collectif",detail:`═══ DÉFINITION (CCT n°24) ═══
Licenciement collectif = licenciement pour raisons économiques ou techniques touchant, sur une période de 60 JOURS :

• Entreprises 20-99 travailleurs : ≥10 licenciements
• Entreprises 100-299 : ≥10% de l'effectif
• Entreprises ≥300 : ≥30 licenciements

═══ NE COMPTENT PAS ═══
• Fins de CDD arrivés à terme
• Démissions
• Licenciements pour motif grave
• Prépensions (sauf si elles font partie du plan)

═══ PROCÉDURE LOI RENAULT (3 PHASES) ═══

PHASE 1 : ANNONCE DE L'INTENTION
• L'employeur informe le CE de son INTENTION de procéder à un licenciement collectif
• PAS de décision définitive à ce stade
• Contenu : raisons, nombre de travailleurs, catégories, période envisagée, critères de sélection, méthode de calcul des indemnités

PHASE 2 : CONSULTATION
• Le CE émet un avis
• Négociation d'un plan social (durée non fixée par la loi, en pratique 30-60 jours)
• Possibilité de propositions alternatives (réduction du nombre, reclassement interne)
• L'employeur doit répondre aux observations du CE

PHASE 3 : NOTIFICATION
• Notification au SPF Emploi (DIRES)
• Notification à l'ONEM
• Délai de 30 JOURS avant l'exécution des licenciements
• Les licenciements ne peuvent commencer qu'APRÈS ce délai`,delai:"Phase 1 à 3 : minimum 60-90 jours",formulaire:"Formulaire DIRES (SPF Emploi) + notification ONEM",ou:"CE + SPF Emploi + ONEM",obligatoire:true,duree_estimee:'3-6 mois'},

  {n:2,phase:'plan_social',titre:"Plan social + Cellule pour l'emploi",detail:`═══ PLAN SOCIAL ═══
Négocié avec le CE et/ou les syndicats. Contenu typique :
• Indemnités supérieures au minimum légal
• Critères de sélection (ancienneté, situation familiale, âge)
• Mesures d'accompagnement (formation, reclassement)
• Outplacement collectif
• RCC (Régime de Chômage avec Complément d'entreprise = ex-prépension)
• Maintien d'avantages (assurance groupe, hospitalisation) pendant une période
• Priorité de réembauche

═══ CELLULE POUR L'EMPLOI ═══
OBLIGATOIRE si licenciement collectif.
• Mise en place par l'employeur avec le Forem/VDAB/Actiris
• Durée : minimum 6 MOIS
• Inscription obligatoire des travailleurs licenciés
• Services : coaching, formation, aide à la recherche d'emploi
• Coût : à charge de l'employeur (ou fonds sectoriel)

═══ OUTPLACEMENT ═══
• Obligatoire pour les travailleurs licenciés dans le cadre collectif
• 60 heures d'accompagnement minimum
• Bureau d'outplacement agréé
• Coût : ±2.500-5.000€/travailleur

═══ RCC (ex-prépension) ═══
• Possible si CCT sectorielle le prévoit
• Conditions d'âge et d'ancienneté (variables selon la CCT)
• Complément d'entreprise + allocation de chômage
• Coût employeur : complément mensuel jusqu'à la pension légale`,delai:"Plan social : négociation 30-60 jours — Cellule : 6 mois minimum",formulaire:"Plan social + convention cellule pour l'emploi",ou:null,obligatoire:true,duree_estimee:'3-6 mois'},
],
alertes:[
  {niveau:'critique',texte:"Loi Renault : AUCUN licenciement avant la fin de la procédure de consultation. Licenciements prématurés = NULLITÉ + indemnité."},
  {niveau:'critique',texte:"Information du CE AVANT toute décision. L'intention doit être communiquée AVANT que la décision soit prise."},
  {niveau:'important',texte:"Cellule pour l'emploi OBLIGATOIRE (6 mois minimum). Outplacement obligatoire pour tous les travailleurs licenciés."},
  {niveau:'important',texte:"Notification au SPF Emploi + délai de 30 jours avant exécution. Sans notification = licenciements suspendus."},
  {niveau:'attention',texte:"Le plan social est NÉGOCIÉ, pas imposé. Un bon plan social réduit le risque de contestation et améliore l'image."},
],
simulation:{titre:"Licenciement collectif — Coût indicatif (20 travailleurs, 3.500€ brut moyen)",lignes:[
  {label:'Préavis moyen (30 sem)',montant:'20 × 23.077€ = 461.540€',type:'neutre'},
  {label:'Complément plan social (±3 mois)',montant:'20 × 10.500€ = 210.000€',type:'neutre'},
  {label:'Outplacement (60h)',montant:'20 × 3.500€ = 70.000€',type:'neutre'},
  {label:'Cellule pour l\'emploi',montant:'±30.000-50.000€',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Coût total estimé',montant:'±770.000-800.000€',type:'vert_bold'},
]},
faq:[
  {q:"Peut-on contourner les seuils en étalant les licenciements ?",r:"Non. L'inspection et les tribunaux regardent la période de 60 jours ET l'intention globale. Étaler artificiellement = fraude à la loi = requalification en licenciement collectif."},
  {q:"Le CE peut-il bloquer le licenciement collectif ?",r:"Non. Le CE doit être consulté mais son avis n'est pas contraignant. Toutefois, le non-respect de la procédure de consultation peut entraîner la nullité des licenciements."},
],
formulaires:[{nom:"SPF Emploi — Licenciement collectif",url:"https://emploi.belgique.be/fr/themes/contrats-de-travail/fin-du-contrat-de-travail/licenciement-collectif",type:'en_ligne'}]};
export default function ProcedureLicenciementCollectif(){const P=PROC_LC;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_LC};
