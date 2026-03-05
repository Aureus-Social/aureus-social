'use client';
import { useState, useMemo } from 'react';
const PROC_FAIL={id:'faillite',icon:'💥',categorie:'special',titre:"Faillite & fermeture d'entreprise",resume:"En cas de faillite, les contrats de travail sont rompus par le curateur. Le Fonds de Fermeture (FFE) garantit le paiement des salaires et indemnités impayés. Indemnité de fermeture pour les travailleurs. Procédure de réorganisation judiciaire (PRJ) comme alternative.",
baseLegale:[{ref:"Loi 26/06/2002",desc:"Fonds de fermeture des entreprises — indemnités et garanties"},{ref:"Livre XX CDE (Code de droit économique)",desc:"Faillite et réorganisation judiciaire"},{ref:"Loi 03/07/1978, art. 26",desc:"Rupture du contrat en cas de faillite"}],
etapes:[
  {n:1,phase:'faillite',titre:"Faillite — Impact sur les contrats de travail",detail:`═══ DÉCLARATION DE FAILLITE ═══
• Prononcée par le tribunal de l'entreprise
• Désignation d'un curateur
• Les contrats de travail ne sont PAS automatiquement rompus

═══ RUPTURE PAR LE CURATEUR ═══
• Le curateur peut licencier avec effet immédiat
• Préavis réduit (max 18 MOIS pour les cadres, 3 mois pour les autres)
• Ou indemnité compensatoire de préavis

═══ CRÉANCES DES TRAVAILLEURS ═══
Les travailleurs sont des CRÉANCIERS PRIVILÉGIÉS :
1. Salaires impayés (super-privilège)
2. Pécule de vacances
3. Indemnité de préavis
4. 13e mois et primes
5. Indemnité de fermeture

═══ FONDS DE FERMETURE (FFE) ═══
Si l'employeur ne peut pas payer :
• Le FFE garantit le paiement des salaires impayés
• Plafond : rémunération brute (plafonné par l'ONSS)
• Indemnité de fermeture : forfait basé sur l'ancienneté
• Le FFE se subroge dans les droits des travailleurs

═══ INDEMNITÉ DE FERMETURE ═══
Conditions : entreprise de <20 travailleurs OU fermeture d'entreprise
• Partie forfaitaire : ±1.500€ (2026)
• Partie variable : ±200€ × année d'ancienneté (plafonné)
• Payée par le FFE
• Exemple : 10 ans d'ancienneté = ±3.500€`,delai:"Immédiat dès le jugement de faillite",formulaire:"Déclaration de créance au curateur",ou:"Tribunal de l'entreprise",obligatoire:true,duree_estimee:'Variable (mois à années)'},

  {n:2,phase:'prj',titre:"PRJ — Alternative à la faillite",detail:`═══ PROCÉDURE DE RÉORGANISATION JUDICIAIRE (PRJ) ═══
Alternative à la faillite pour sauver l'entreprise.

3 OPTIONS :
1. ACCORD AMIABLE : négociation directe avec les créanciers
2. ACCORD COLLECTIF : plan de réorganisation voté par les créanciers (majorité en nombre + en montant)
3. TRANSFERT SOUS AUTORITÉ DE JUSTICE : vente de l'entreprise (ou d'une partie) avec maintien de l'emploi

═══ IMPACT SUR LES TRAVAILLEURS ═══
• Pendant la PRJ : les contrats continuent normalement
• Sursis de paiement (moratoire) : les salaires restent prioritaires
• En cas de transfert : CCT 32bis s'applique (maintien des droits)
• Les travailleurs transférés gardent leur ancienneté et conditions

═══ CCT 32BIS (TRANSFERT D'ENTREPRISE) ═══
En cas de transfert (PRJ ou cession) :
• Tous les travailleurs sont transférés au repreneur
• Contrats maintenus aux mêmes conditions
• Le repreneur ne peut pas licencier POUR LE MOTIF du transfert
• Les dettes salariales antérieures restent à charge du cédant

═══ CHÔMAGE TEMPORAIRE ═══
En cas de difficultés préalables à la faillite :
• Chômage temporaire pour raisons économiques (employés et ouvriers)
• Chômage temporaire force majeure (si cessation d'activité)
• Allocation : 65% du salaire plafonné`,delai:"PRJ : demande au tribunal, durée max 18 mois (renouvelable)",formulaire:"Requête en réorganisation judiciaire",ou:"Tribunal de l'entreprise",obligatoire:false,duree_estimee:'6-18 mois'},
],
alertes:[
  {niveau:'critique',texte:"Les travailleurs sont CRÉANCIERS PRIVILÉGIÉS. Salaires impayés = super-privilège, payés avant les autres créanciers."},
  {niveau:'critique',texte:"Le FFE garantit les salaires et indemnités impayés si l'employeur ne peut pas payer. Déclaration de créance au curateur obligatoire."},
  {niveau:'important',texte:"La PRJ est une alternative à la faillite. Le transfert sous autorité de justice permet de sauver l'emploi (CCT 32bis)."},
  {niveau:'attention',texte:"En cas de transfert, le repreneur ne peut pas licencier POUR LE MOTIF du transfert. Les conditions sont maintenues."},
],
simulation:{titre:"Faillite — Créances travailleur (10 ans ancienneté, 3.500€ brut)",lignes:[
  {label:'Salaires impayés (2 mois)',montant:'7.000€',type:'neutre'},
  {label:'Pécule de vacances',montant:'±5.000€',type:'neutre'},
  {label:'Indemnité préavis (réduit)',montant:'±10.000€',type:'neutre'},
  {label:'Indemnité de fermeture',montant:'±3.500€',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Total créance travailleur',montant:'±25.500€',type:'vert_bold'},
  {label:'Garanti par le FFE',montant:'Plafonné',type:'vert'},
]},
faq:[
  {q:"Que dois-je faire si mon employeur fait faillite ?",r:"Déclarer votre créance auprès du curateur. Vous inscrire au chômage immédiatement. Le FFE interviendra pour les montants impayés (avec un délai de plusieurs mois)."},
  {q:"Le curateur peut-il me licencier immédiatement ?",r:"Oui. En cas de faillite, le curateur peut rompre le contrat avec un préavis réduit ou une indemnité compensatoire."},
],
formulaires:[{nom:"FFE — Fonds de fermeture",url:"https://www.fondsfermeture.be",type:'en_ligne'}]};
export default function ProcedureFaillite(){const P=PROC_FAIL;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Créances',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_FAIL};
