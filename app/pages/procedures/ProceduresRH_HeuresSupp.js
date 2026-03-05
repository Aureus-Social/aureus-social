'use client';
import { useState, useMemo } from 'react';
const PROC_HS={id:'heures_supp',icon:'🏋️',categorie:'complements',titre:"Heures supplémentaires & sursalaire",resume:"Durée légale 38h/sem (ou conventionnelle). Au-delà = heures supplémentaires soumises à autorisation. Sursalaire obligatoire : +50% en semaine, +100% dimanche/férié. Repos compensatoire obligatoire. Limite interne et crédit volontaire (120h/an).",
baseLegale:[{ref:"Loi 16/03/1971, art. 25-29",desc:"Durée du travail — heures supplémentaires et sursalaire"},{ref:"AR 25/06/1990",desc:"Assimilation heures supplémentaires"},{ref:"Loi 05/03/2017 (Travail faisable)",desc:"Heures supplémentaires volontaires (crédit 120h)"}],
etapes:[
  {n:1,phase:'regles',titre:"Règles de base et sursalaire",detail:`═══ DURÉE LÉGALE DU TRAVAIL ═══
• Maximum légal : 8h/jour, 38h/semaine (ou 40h avec jours compensatoires)
• Limite journalière absolue : 11h
• Limite hebdomadaire absolue : 50h
• Repos minimum : 11h consécutives entre 2 prestations

═══ QUAND LES HEURES SUPP SONT-ELLES AUTORISÉES ? ═══
1. Surcroît extraordinaire de travail (autorisation délégation syndicale + inspection)
2. Nécessité imprévue (accident, réparation urgente)
3. Travaux préparatoires/complémentaires (machines)
4. Inventaire/bilan (max 7 jours/an)
5. Heures supplémentaires VOLONTAIRES (accord écrit, max 120h/an)

═══ SURSALAIRE OBLIGATOIRE ═══
• Heures au-delà de 9h/jour ou 38h/sem (ou limite conventionnelle) :
  → Jours ouvrables : +50% du salaire horaire
  → Dimanches et jours fériés : +100% du salaire horaire

• Exemple : salaire horaire 25€
  → Heure supp semaine = 25 + 12,50 = 37,50€
  → Heure supp dimanche = 25 + 25 = 50€

═══ REPOS COMPENSATOIRE ═══
• OBLIGATOIRE : 1h de repos par heure supplémentaire prestée
• À prendre dans le trimestre (ou la période de référence)
• Ne supprime PAS le droit au sursalaire (les 2 se cumulent)
• Exception : les 120h volontaires = pas de repos compensatoire obligatoire`,delai:"Sursalaire payé avec le salaire du mois",formulaire:"Registre des heures supplémentaires",ou:null,obligatoire:true,duree_estimee:'Permanent'},

  {n:2,phase:'limites',titre:"Limites, crédit volontaire et exonération fiscale",detail:`═══ LIMITE INTERNE ═══
• Maximum d'heures supp accumulées sans repos compensatoire : 143h
• Au-delà → repos compensatoire OBLIGATOIRE avant de pouvoir en prester d'autres
• Possibilité de relever à 250h par CCT sectorielle

═══ HEURES SUPP VOLONTAIRES (depuis 2017) ═══
• Crédit de 120h/an (relocalisation possible à 360h par CCT)
• Accord ÉCRIT du travailleur (renouvelable tous les 6 mois)
• PAS de repos compensatoire obligatoire
• Sursalaire reste DÛ
• Pas d'autorisation syndicale/inspection requise

═══ EXONÉRATION FISCALE (ART. 154BIS CIR) ═══
Pour les heures supp au-delà de 38h/sem :
• Travailleur : réduction d'impôt de ±57% du sursalaire
• Employeur : dispense de versement de PP = 32,19% (construction) ou 41,25% (autres)
• Applicable aux 130 premières heures (180h construction, 360h horeca)
• Économie significative pour les deux parties

═══ REGISTRE OBLIGATOIRE ═══
• L'employeur doit enregistrer TOUTES les heures prestées
• Système de pointage recommandé (obligatoire ≥50 travailleurs depuis 2023)
• L'inspection sociale peut contrôler à tout moment
• Pas de registre = présomption en faveur du travailleur`,delai:"Repos compensatoire : dans le trimestre",formulaire:"Registre heures + accord écrit (volontaires)",ou:null,obligatoire:true,duree_estimee:'Permanent'},
],
alertes:[
  {niveau:'critique',texte:"Sursalaire OBLIGATOIRE : +50% semaine, +100% dimanche/férié. Pas de renonciation possible par le travailleur."},
  {niveau:'critique',texte:"Repos compensatoire OBLIGATOIRE (sauf 120h volontaires). Limite interne 143h sans repos."},
  {niveau:'important',texte:"Exonération fiscale art. 154bis : réduction PP employeur 32-41%. Avantage significatif à activer."},
  {niveau:'attention',texte:"Heures supp volontaires : accord ÉCRIT renouvelable tous les 6 mois. Max 120h/an (360h par CCT)."},
],
simulation:{titre:"Heures supplémentaires — Coût et exonération",lignes:[
  {label:'10h supp semaine (25€/h)',montant:'10 × 37,50€ = 375€',type:'neutre'},
  {label:'Repos compensatoire (10h)',montant:'10 × 25€ = 250€ (coût indirect)',type:'neutre'},
  {label:'Exonération PP employeur (41,25%)',montant:'-154,69€',type:'vert'},
  {label:'',montant:'',type:'separateur'},
  {label:'Coût net employeur',montant:'±470€ pour 10h supp',type:'vert_bold'},
]},
faq:[
  {q:"Le travailleur peut-il refuser les heures supplémentaires ?",r:"En principe oui, sauf les cas de nécessité imprévue. Les heures volontaires nécessitent un accord écrit. Le refus ne peut pas être sanctionné."},
  {q:"Les heures supp sont-elles plafonnées sur l'année ?",r:"Oui. Maximum 143h accumulées sans repos (250h par CCT). Les heures volontaires : max 120h/an (360h par CCT). Au total, rarement plus de 360h/an."},
],
formulaires:[]};
export default function ProcedureHeuresSupp(){const P=PROC_HS;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}</div>)}
export {PROC_HS};
