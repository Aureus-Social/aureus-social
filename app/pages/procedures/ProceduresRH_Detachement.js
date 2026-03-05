'use client';
import { useState, useMemo } from 'react';
const PROC_DET={id:'detachement',icon:'🌍',categorie:'special',titre:"Détachement international",resume:"Envoi d'un travailleur à l'étranger ou accueil d'un travailleur étranger en Belgique. Formulaire A1 (sécurité sociale), LIMOSA (déclaration préalable), conditions de travail du pays d'accueil. Max 24 mois de détachement (règlement UE 883/2004).",
baseLegale:[{ref:"Directive UE 96/71/CE (révisée 2018)",desc:"Détachement de travailleurs — conditions de travail minimales"},{ref:"Règlement UE 883/2004",desc:"Coordination sécurité sociale — formulaire A1"},{ref:"Loi 05/03/2002 (LIMOSA)",desc:"Déclaration préalable de détachement en Belgique"}],
etapes:[
  {n:1,phase:'sortant',titre:"Détachement DEPUIS la Belgique (sortant)",detail:`═══ FORMULAIRE A1 ═══
Demande à l'ONSS AVANT le détachement :
• Prouve que le travailleur reste affilié à la sécurité sociale belge
• Durée max : 24 MOIS (prolongation possible via accord Art. 16)
• Conditions : lien organique avec l'employeur belge, activité substantielle en Belgique (25%+)
• Si >24 mois → affiliation à la sécurité sociale du pays d'accueil

═══ CONDITIONS DE TRAVAIL ═══
Le travailleur détaché bénéficie des conditions MINIMALES du pays d'accueil :
• Salaire minimum local
• Durée du travail maximale
• Congés payés minimum
• Sécurité et santé au travail
• Non-discrimination
• Depuis 2020 : MÊME rémunération que les travailleurs locaux (pas seulement le minimum)

═══ FISCALITÉ ═══
• Règle des 183 jours : si <183 jours dans le pays d'accueil → imposé en Belgique
• Si >183 jours → convention fiscale bilatérale s'applique
• Risque de double imposition → crédit d'impôt ou exonération
• Ruling fiscal possible pour les packages d'expatriation

═══ AVENANT AU CONTRAT ═══
Obligatoire mentionnant : pays, durée, fonction, rémunération, avantages (logement, école, rapatriement).`,delai:"Formulaire A1 AVANT le début du détachement",formulaire:"Formulaire A1 (ONSS) + avenant au contrat",ou:"ONSS — www.socialsecurity.be",obligatoire:true,duree_estimee:'2-4h'},

  {n:2,phase:'entrant',titre:"Détachement VERS la Belgique (entrant) — LIMOSA",detail:`═══ DÉCLARATION LIMOSA ═══
Tout employeur étranger envoyant un travailleur en Belgique DOIT :
• Faire une déclaration LIMOSA AVANT le début des prestations
• Via www.limosa.be
• Contenu : identité, employeur, lieu de travail, durée, secteur
• Document LIMOSA-1 remis au travailleur (à présenter sur demande)

═══ SANCTIONS ═══
• Pas de LIMOSA = amende 600-6.000€ par travailleur
• L'utilisateur belge est CO-RESPONSABLE (vérifier le LIMOSA-1 !)

═══ CONDITIONS DE TRAVAIL BELGES ═══
Le travailleur détaché en Belgique bénéficie des conditions belges :
• Salaires minimums sectoriels (barèmes belges !)
• Durée du travail (38h/sem ou selon CCT)
• Jours fériés (10 jours)
• Sécurité au travail (loi bien-être)
• Non-discrimination

═══ STATUT IMPATRIE (fiscal) ═══
Régime fiscal avantageux pour les cadres étrangers :
• Exonération partielle des indemnités de dépaysement (QFIE)
• Nouveau régime depuis 2022 : max 30% de la rémunération exonéré (plafonné 90.000€/an)
• Durée max : 5 ans + 3 ans de prolongation
• Conditions : salaire min 75.000€ brut/an, recrutement à l'étranger`,delai:"LIMOSA AVANT le 1er jour de prestation en Belgique",formulaire:"Déclaration LIMOSA + document LIMOSA-1",ou:"www.limosa.be",obligatoire:true,duree_estimee:'1h'},
],
alertes:[
  {niveau:'critique',texte:"Formulaire A1 AVANT le détachement sortant. Sans A1 = double affiliation sécurité sociale possible."},
  {niveau:'critique',texte:"LIMOSA obligatoire pour tout travailleur étranger détaché en Belgique. L'utilisateur belge est CO-RESPONSABLE."},
  {niveau:'important',texte:"Max 24 mois de détachement (A1). Au-delà = affiliation obligatoire à la sécurité sociale du pays d'accueil."},
  {niveau:'attention',texte:"Depuis 2020 : même rémunération que les travailleurs locaux (pas seulement le salaire minimum du pays d'accueil)."},
],
simulation:{titre:"Détachement — Coût additionnel",lignes:[
  {label:'Formulaire A1 + admin',montant:'±500€',type:'neutre'},
  {label:'Avenant contrat + conseil juridique',montant:'±1.000-2.000€',type:'neutre'},
  {label:'Indemnités expatriation',montant:'±500-2.000€/mois',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Amende LIMOSA manquante',montant:'600-6.000€/travailleur',type:'vert_bold'},
]},
faq:[
  {q:"Un indépendant étranger doit-il faire une LIMOSA ?",r:"Oui. La LIMOSA s'applique aussi aux indépendants étrangers qui viennent prester en Belgique. L'obligation est sur l'indépendant lui-même."},
  {q:"Le télétravail depuis l'étranger est-il un détachement ?",r:"Potentiellement. Si un travailleur belge télétravaille depuis l'étranger >25% du temps, les règles de coordination UE s'appliquent. Accord-cadre UE : max 49% de télétravail dans l'État de résidence."},
],
formulaires:[{nom:"ONSS — Formulaire A1",url:"https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/special_contributions/a1.html",type:'en_ligne'},{nom:"LIMOSA",url:"https://www.limosa.be",type:'en_ligne'}]};
export default function ProcedureDetachement(){const P=PROC_DET;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_DET};
