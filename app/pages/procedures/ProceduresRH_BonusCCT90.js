'use client';
import { useState, useMemo } from 'react';
const PROC_CCT90={id:'bonus_cct90',icon:'🎯',categorie:'remuneration',titre:"Bonus non récurrent (CCT 90)",resume:"Prime liée à des objectifs collectifs. Max 4.020€ brut/an (2026). Cotisation ONSS spéciale 33% employeur + 13,07% travailleur. Exonéré de précompte professionnel. Plan bonus à déposer au SPF Emploi. Objectifs COLLECTIFS uniquement.",
baseLegale:[{ref:"CCT n°90bis",desc:"Bonus non récurrent lié aux résultats — conditions et plafond"},{ref:"Loi 21/12/2007",desc:"Cadre légal des avantages non récurrents liés aux résultats"},{ref:"AR 25/08/2012",desc:"Procédure d'établissement du plan bonus — acte d'adhésion"}],
etapes:[
  {n:1,phase:'planification',titre:"Conditions et plan bonus",detail:`═══ CONDITIONS DU BONUS CCT 90 ═══

1. OBJECTIFS COLLECTIFS
   • Les objectifs doivent concerner TOUS les travailleurs (ou une catégorie objective)
   • PAS d'objectifs individuels (sinon = salaire ordinaire)
   • Exemples : chiffre d'affaires, taux d'absentéisme, qualité, sécurité, certification

2. OBJECTIFS TRANSPARENTS ET MESURABLES
   • Critères clairs et vérifiables
   • Pas de critères subjectifs ou discrétionnaires
   • La réalisation ne peut pas être certaine au moment du plan

3. PÉRIODE DE RÉFÉRENCE
   • Minimum 3 mois
   • Maximum : pas de maximum légal, mais généralement 1 an

4. PLAFOND 2026
   • Maximum 4.020€ brut par travailleur par année civile
   • Si dépassement → l'excédent est traité comme salaire ordinaire

═══ ÉTABLISSEMENT DU PLAN BONUS ═══

OPTION A : CCT d'entreprise (si délégation syndicale)
• Négociation avec la DS
• Dépôt au greffe du SPF Emploi

OPTION B : Acte d'adhésion (si PAS de DS)
1. Rédiger l'acte d'adhésion (formulaire type SPF Emploi)
2. Affichage dans l'entreprise pendant 15 JOURS
3. Registre de remarques à disposition
4. Envoi au SPF Emploi (greffe de la DGRC)
5. Si pas d'opposition dans les 6 mois → acte validé

═══ CONTENU DU PLAN ═══
• Catégorie(s) de travailleurs concernés
• Objectifs à atteindre (mesurables)
• Période de référence
• Montant du bonus (ou mode de calcul)
• Procédure de suivi et de vérification`,delai:"Plan à déposer AVANT la période de référence",formulaire:"Acte d'adhésion SPF Emploi (formulaire obligatoire)",ou:"SPF Emploi — Greffe DGRC",obligatoire:true,duree_estimee:'2-4h'},

  {n:2,phase:'fiscal',titre:"Traitement social et fiscal — L'avantage",detail:`═══ TRAITEMENT ONSS ═══
• Cotisation spéciale employeur : 33% du montant brut
• Cotisation travailleur : 13,07% (cotisation ONSS ordinaire)
• PAS de cotisation patronale ordinaire (±25%)

═══ TRAITEMENT FISCAL ═══
• Exonéré de précompte professionnel pour le travailleur !
• Le travailleur ne paie PAS d'impôt sur le bonus CCT 90
• L'employeur peut déduire le bonus comme charge professionnelle

═══ SIMULATION : BONUS 3.000€ ═══

VIA SALAIRE ORDINAIRE :
• Coût employeur : 3.000 + 750 ONSS patron = 3.750€
• Travailleur net : 3.000 - 392 ONSS - 1.042 PP = ±1.566€
• Ratio net/coût : 42%

VIA CCT 90 :
• Coût employeur : 3.000 + 990 cotisation 33% = 3.990€
• Travailleur net : 3.000 - 392 ONSS - 0 PP = 2.608€
• Ratio net/coût : 65%

═══ AVANTAGE ═══
• Travailleur : +1.042€ net de plus qu'en salaire (+67%)
• Coût employeur comparable (3.990€ vs 3.750€)
• Le bonus CCT 90 est la manière la plus efficace de récompenser des résultats collectifs`,delai:null,formulaire:null,ou:null,obligatoire:false,duree_estimee:'Simulation'},
],
alertes:[
  {niveau:'critique',texte:"Objectifs COLLECTIFS uniquement. Des objectifs individuels = requalification en salaire ordinaire (ONSS + PP à payer)."},
  {niveau:'critique',texte:"Plan bonus à déposer au SPF AVANT la période de référence. Un plan déposé après = NUL."},
  {niveau:'important',texte:"Plafond 2026 : 4.020€ brut/travailleur/an. Au-delà = salaire ordinaire pour l'excédent."},
  {niveau:'attention',texte:"La réalisation des objectifs ne peut PAS être certaine au moment de l'établissement du plan. Objectif déjà atteint = requalification."},
],
simulation:{titre:"Bonus CCT 90 — 3.000€ (5 employés)",lignes:[
  {label:'Bonus brut × 5',montant:'15.000€',type:'neutre'},
  {label:'Cotisation 33% employeur',montant:'4.950€',type:'neutre'},
  {label:'Coût total employeur',montant:'19.950€',type:'vert_bold'},
  {label:'',montant:'',type:'separateur'},
  {label:'Net travailleur (par personne)',montant:'2.608€ (vs 1.566€ salaire)',type:'vert'},
  {label:'Gain net vs salaire',montant:'+1.042€/personne',type:'vert_bold'},
]},
faq:[
  {q:"Peut-on donner un bonus différent par catégorie ?",r:"Oui, si les catégories sont objectives (ex: ancienneté, département). Mais les objectifs doivent rester collectifs au sein de chaque catégorie."},
  {q:"Que se passe-t-il si les objectifs ne sont pas atteints ?",r:"Rien. Le bonus n'est pas dû. C'est le principe même du plan bonus — le paiement est conditionnel."},
],
formulaires:[{nom:"SPF Emploi — Plan bonus CCT 90",url:"https://emploi.belgique.be/fr/themes/remuneration/avantages-non-recurrents-lies-aux-resultats",type:'en_ligne'}]};
export default function ProcedureBonusCCT90(){const P=PROC_CCT90;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Impact',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_CCT90};
