'use client';
import { useState, useMemo } from 'react';
const PROC_ES={id:'elections_sociales',icon:'🗳️',categorie:'formation',titre:"Élections sociales (CE/CPPT)",resume:"Tous les 4 ans. CPPT obligatoire dès 50 travailleurs. CE obligatoire dès 100 travailleurs. Procédure de 150 jours (X-60 à Y+15). Protection des candidats contre le licenciement. Prochaines élections en 2028.",
baseLegale:[{ref:"Loi 04/12/2007",desc:"Élections sociales — procédure et calendrier"},{ref:"Loi 20/09/1948",desc:"Conseil d'entreprise — organisation et compétences"},{ref:"Loi 04/08/1996, art. 48-72",desc:"CPPT — comité pour la prévention et la protection au travail"}],
etapes:[
  {n:1,phase:'seuils',titre:"Seuils et organes — Qui est concerné ?",detail:`═══ CPPT (Comité PPT) ═══
• Obligatoire dès 50 TRAVAILLEURS (moyenne sur 4 trimestres)
• Compétences : bien-être, sécurité, santé, ergonomie, environnement
• Composition : employeur (ou délégué) + représentants élus des travailleurs
• Se réunit au minimum 1×/mois

═══ CE (Conseil d'Entreprise) ═══
• Obligatoire dès 100 TRAVAILLEURS
• Compétences : information économique et financière, règlement de travail, formation, licenciement collectif
• Composition : chef d'entreprise + délégués patronaux + représentants élus
• Se réunit au minimum 1×/mois

═══ CALCUL DES SEUILS ═══
• Moyenne des travailleurs sur les 4 trimestres de l'année de référence
• Intérimaires comptés chez l'utilisateur (2e trimestre uniquement)
• Temps partiel : prorata (mi-temps = 0,5)
• Attention : les seuils sont évalués par UNITÉ TECHNIQUE D'EXPLOITATION (pas par entité juridique)

═══ CALENDRIER ═══
• Élections tous les 4 ANS (prochaines : 2028)
• Période électorale : mai (dates exactes fixées par AR)
• Procédure de 150 jours avant le jour Y (jour des élections)`,delai:"Tous les 4 ans — prochaines en 2028",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Variable'},

  {n:2,phase:'procédure',titre:"Procédure électorale — 150 jours",detail:`═══ LES GRANDES ÉTAPES ═══

JOUR X-60 : ANNONCE
• L'employeur annonce la date des élections
• Communication de l'UTE, du nombre de travailleurs, des fonctions de direction
• Affichage obligatoire

X-60 à X-35 : DÉTERMINATION DE L'UTE
• Négociation sur les unités techniques d'exploitation
• Contestation possible devant le tribunal du travail

X-35 : LISTES ÉLECTORALES PROVISOIRES
• L'employeur affiche les listes d'électeurs
• Réclamations possibles pendant 7 jours

X : DÉPÔT DES CANDIDATURES
• Les organisations syndicales déposent leurs listes
• Début de la PROTECTION des candidats (rétroactif à X-30 !)
• Candidats protégés jusqu'à la fin du mandat suivant

X+35 à X+76 : CANDIDATURES DÉFINITIVES
• Contestations, remplacements, listes définitives

JOUR Y : ÉLECTIONS
• Vote secret (bureau de vote dans l'entreprise)
• Système de vote papier ou électronique
• Dépouillement immédiat

Y+1 à Y+15 : RÉSULTATS
• Proclamation des élus
• Installation des organes (CE/CPPT)
• Première réunion dans les 45 jours`,delai:"150 jours de procédure — jour Y en mai 2028",formulaire:"Formulaires électoraux officiels (SPF Emploi)",ou:"SPF Emploi — Application web élections",obligatoire:true,duree_estimee:'6 mois de procédure'},

  {n:3,phase:'protection',titre:"Protection des candidats et élus",detail:`═══ PROTECTION CONTRE LE LICENCIEMENT ═══
La protection est l'aspect le plus CRITIQUE des élections sociales.

QUI EST PROTÉGÉ ?
• Tous les candidats (élus ou non)
• Les délégués effectifs et suppléants
• Protection dès X-30 (RÉTROACTIVE)

DURÉE :
• Candidat non élu : jusqu'aux élections SUIVANTES (= 4 ans)
• Élu : pendant tout le mandat + protection jusqu'aux élections suivantes
• Durée totale possible : jusqu'à 8 ANS de protection

INDEMNITÉ EN CAS DE LICENCIEMENT ILLICITE :
• 2 ANS de rémunération (si ancienneté <10 ans)
• 3 ANS de rémunération (si ancienneté 10-20 ans)
• 4 ANS de rémunération (si ancienneté >20 ans)
• + préavis ou indemnité compensatoire normale
• + réintégration demandée par le travailleur (l'employeur peut refuser mais paie)

═══ EXCEPTIONS ═══
• Licenciement pour motif grave (procédure spéciale tribunal du travail)
• Licenciement pour raisons économiques/techniques (accord CE ou commission paritaire)

═══ COÛT D'UN LICENCIEMENT PROTÉGÉ ═══
Exemple : candidat, 15 ans ancienneté, 4.000€ brut/mois
• Indemnité protection : 3 ans × 12 × 4.000€ = 144.000€
• + préavis 15 ans : ±45 semaines × 923€ = 41.535€
• Total : ±185.535€ BRUT`,delai:"Protection rétroactive dès X-30",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Permanent'},
],
alertes:[
  {niveau:'critique',texte:"Protection des candidats : indemnité 2 à 4 ANS de salaire en cas de licenciement illicite. Protection rétroactive dès X-30."},
  {niveau:'critique',texte:"CPPT obligatoire dès 50 travailleurs. CE obligatoire dès 100. Le non-respect est une infraction pénale."},
  {niveau:'important',texte:"Procédure de 150 jours stricte. Chaque étape a un délai impératif. Erreur de procédure = annulation possible des élections."},
  {niveau:'attention',texte:"Prochaines élections en 2028. Commencer la préparation 1 an avant (recensement, UTE, fonctions de direction)."},
],
simulation:{titre:"Élections sociales — Coût indicatif",lignes:[
  {label:'Procédure administrative',montant:'±2.000-5.000€',type:'neutre'},
  {label:'Heures de réunion CE/CPPT (12×/an)',montant:'±temps de travail',type:'neutre'},
  {label:'Formation des délégués',montant:'Pris en charge par les syndicats',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Licenciement candidat protégé (15 ans)',montant:'±185.000€ !!',type:'vert_bold'},
]},
faq:[
  {q:"Peut-on éviter les élections sociales ?",r:"Non. Dès que le seuil est atteint, les élections sont obligatoires. Certaines entreprises tentent de rester sous le seuil, mais c'est risqué (la notion d'UTE peut regrouper plusieurs entités)."},
  {q:"Les intérimaires votent-ils ?",r:"Les intérimaires présents depuis au moins 3 mois votent chez l'utilisateur (pas chez l'agence d'intérim). Ils comptent aussi dans le calcul du seuil."},
],
formulaires:[{nom:"SPF Emploi — Élections sociales",url:"https://emploi.belgique.be/fr/themes/concertation-sociale/elections-sociales",type:'en_ligne'}]};
export default function ProcedureElectionsSociales(){const P=PROC_ES;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_ES};
