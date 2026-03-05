'use client';
import { useState, useMemo } from 'react';
const PROC_FORM={id:'formation',icon:'🎓',categorie:'formation',titre:"Formation obligatoire (5 jours/an)",resume:"Depuis 2024 : droit individuel à la formation de 5 jours/an par travailleur temps plein (entreprises ≥20). Plan de formation annuel obligatoire. Crédit formation non utilisé reporté. Formation formelle et informelle comptabilisée. Sanctions si pas de plan.",
baseLegale:[{ref:"Loi 03/10/2022 (Deal pour l'emploi)",desc:"Droit individuel à la formation — 5 jours/an depuis 2024"},{ref:"CCT n°164",desc:"Droit à la formation — cadre interprofessionnel supplétif"},{ref:"Loi 05/03/2017",desc:"Formation — travail faisable et maniable"}],
etapes:[
  {n:1,phase:'planification',titre:"Droit individuel à la formation — Cadre légal",detail:`═══ NOMBRE DE JOURS ═══
• 2024 et au-delà : 5 JOURS/AN par travailleur temps plein
• 10-19 travailleurs : 1 jour/an (CCT sectorielle ou supplétive)
• <10 travailleurs : pas d'obligation légale (mais recommandé)
• Prorata pour temps partiel et entrées en cours d'année

═══ PROGRESSION (historique) ═══
• 2023 : 4 jours/an
• 2024+ : 5 jours/an (objectif définitif)

═══ TYPES DE FORMATION ═══
FORMELLE :
• Cours, séminaires, conférences
• E-learning structuré avec évaluation
• Formations certifiantes
• Formations obligatoires (sécurité, RGPD, etc.)

INFORMELLE :
• Coaching, mentoring
• Formation on-the-job (sous conditions)
• Autoformation dirigée
• Conférences et événements professionnels

═══ CRÉDIT FORMATION ═══
• Les jours non utilisés sont REPORTÉS à l'année suivante
• Accumulation sur une période de 5 ans
• En cas de licenciement : le solde peut être utilisé pendant le préavis
• Le crédit est individuel et nominatif

═══ SECTEURS ═══
Les CCT sectorielles peuvent prévoir :
• Un nombre de jours supérieur à 5
• Des formations spécifiques au secteur
• Un compte formation sectoriel
• Des mécanismes de financement (fonds de formation)`,delai:"Plan annuel — jours répartis sur l'année",formulaire:"Plan de formation + compte individuel",ou:null,obligatoire:true,duree_estimee:'2-4h planification'},

  {n:2,phase:'plan',titre:"Plan de formation annuel — Obligation",detail:`═══ OBLIGATION ═══
Entreprises ≥20 travailleurs : plan de formation ANNUEL obligatoire.
• À établir avant le 31 MARS de chaque année
• Avis préalable du CE (ou CPPT, ou délégation syndicale)
• Le plan est conservé dans l'entreprise (pas de dépôt externe)

═══ CONTENU DU PLAN ═══
1. Formations formelles et informelles prévues
2. Groupes cibles (catégories de travailleurs)
3. Objectifs de la formation
4. Calendrier prévisionnel
5. Budget alloué
6. Attention particulière aux groupes à risque :
   • Travailleurs ≥50 ans
   • Travailleurs handicapés
   • Travailleurs d'origine étrangère
   • Travailleurs peu qualifiés

═══ SUIVI ═══
• Enregistrement des formations suivies (compte formation)
• Bilan annuel au CE/CPPT
• Le Federal Learning Account (FLA) centralise les données
• L'employeur doit encoder les formations dans le FLA

═══ SANCTIONS ═══
• Pas d'amende directe pour absence de plan
• MAIS l'inspection sociale peut constater le manquement
• Le travailleur peut réclamer ses jours de formation
• Impact sur l'image employeur et la rétention

═══ FINANCEMENT ═══
• Fonds sectoriels de formation (selon la CP)
• Chèques-formation régionaux (Wallonie, Bruxelles, Flandre)
• Réductions d'impôts pour certaines formations
• KMO-portefeuille (Flandre)`,delai:"Plan avant le 31 mars — formations réparties sur l'année",formulaire:"Plan de formation annuel",ou:null,obligatoire:true,duree_estimee:'2h/an'},
],
alertes:[
  {niveau:'critique',texte:"5 jours/an par travailleur temps plein (≥20 travailleurs) depuis 2024. Jours non utilisés reportés sur 5 ans."},
  {niveau:'important',texte:"Plan de formation annuel OBLIGATOIRE avant le 31 mars (≥20 travailleurs). Avis du CE/CPPT requis."},
  {niveau:'important',texte:"Federal Learning Account (FLA) : l'employeur doit encoder les formations. Plateforme centralisée obligatoire."},
  {niveau:'attention',texte:"Groupes à risque : attention particulière aux 50+, handicapés, peu qualifiés. Le plan doit en tenir compte."},
],
simulation:{titre:"Formation — Budget annuel (5 employés)",lignes:[
  {label:'5 jours × 5 employés = 25 jours',montant:'25 jours/an',type:'neutre'},
  {label:'Coût salarial jours formation',montant:'±5.000€ (200€/j)',type:'neutre'},
  {label:'Formations externes',montant:'±2.500-5.000€',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Budget total formation',montant:'±7.500-10.000€/an',type:'vert_bold'},
  {label:'Aides régionales possibles',montant:'-30 à -50%',type:'vert'},
]},
faq:[
  {q:"Le travailleur peut-il choisir sa formation ?",r:"Le plan est établi par l'employeur (avec avis du CE). Le travailleur peut faire des suggestions mais c'est l'employeur qui décide, dans le respect du droit individuel."},
  {q:"Les formations obligatoires (sécurité, RGPD) comptent-elles ?",r:"Oui. Toute formation (formelle ou informelle) compte dans les 5 jours, y compris les formations obligatoires."},
],
formulaires:[{nom:"SPF Emploi — Droit à la formation",url:"https://emploi.belgique.be/fr/themes/formation",type:'en_ligne'},{nom:"Federal Learning Account",url:"https://www.federallearningaccount.be",type:'en_ligne'}]};
export default function ProcedureFormation(){const P=PROC_FORM;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Budget',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_FORM};
