'use client';
import { useState, useMemo } from 'react';
const PROC_TT={id:'teletravail',icon:'🏠',categorie:'bienetre',titre:"Télétravail — Cadre légal",resume:"Télétravail structurel (CCT 85) ou occasionnel (Loi 2017). Avenant au contrat obligatoire. Indemnité bureau (max 154,74€/mois). Équipement fourni par l'employeur. Assurance AT couvre le domicile. Droit à la déconnexion s'applique.",
baseLegale:[{ref:"CCT n°85ter",desc:"Télétravail structurel — cadre et obligations"},{ref:"Loi 05/03/2017",desc:"Télétravail occasionnel — travail faisable et maniable"},{ref:"AR 22/11/2006",desc:"Télétravail dans la fonction publique fédérale"}],
etapes:[
  {n:1,phase:'mise_en_place',titre:"Structurel vs occasionnel — Cadre juridique",detail:`═══ TÉLÉTRAVAIL STRUCTUREL (CCT 85ter) ═══
Travail régulier au domicile ou un autre lieu choisi par le travailleur.

AVENANT AU CONTRAT OBLIGATOIRE mentionnant :
• Fréquence du télétravail (ex : 2j/semaine)
• Horaires de disponibilité
• Lieu(x) de télétravail
• Équipement fourni par l'employeur
• Frais pris en charge (indemnité bureau, internet, etc.)
• Retour au bureau (modalités)
• Période de probation éventuelle

DROITS DU TÉLÉTRAVAILLEUR :
• Mêmes droits que les collègues au bureau
• Accès aux informations et formations
• Mêmes perspectives de carrière
• Contact régulier avec l'entreprise

═══ TÉLÉTRAVAIL OCCASIONNEL (Loi 2017) ═══
En cas de force majeure ou raison personnelle (enfant malade, panne de voiture, etc.).
• Pas d'avenant obligatoire
• Accord préalable de l'employeur (oral ou email OK)
• Le règlement de travail peut prévoir les modalités
• L'employeur peut refuser (motif objectif)

═══ POST-COVID ═══
Le télétravail n'est plus obligatoire mais reste fortement ancré.
• ±50% des employés belges télétravaillent au moins 1j/semaine
• Tendance : 2-3 jours/semaine = modèle hybride dominant`,delai:"Avenant AVANT le début du télétravail structurel",formulaire:"Avenant au contrat de travail",ou:null,obligatoire:true,duree_estimee:'1h par avenant'},

  {n:2,phase:'gestion',titre:"Indemnités, équipement et assurances",detail:`═══ INDEMNITÉ DE BUREAU ═══
• Max 154,74€/mois (2026, indexé)
• Exonéré ONSS + PP
• Couvre : chauffage, électricité, eau, mobilier, petit matériel
• Condition : télétravail structurel (min 1j/semaine en moyenne)

═══ FORFAITS CUMULABLES ═══
• Internet domicile : +20€/mois (si pas pris en charge autrement)
• PC/tablette usage pro : +20€/mois (si matériel propre du travailleur)
• Total possible : 194,74€/mois exonéré

═══ ÉQUIPEMENT ═══
L'employeur DOIT fournir ou financer :
• Ordinateur portable / fixe
• Écran supplémentaire (recommandé)
• Clavier, souris ergonomiques
• Connexion internet (ou indemnité)
• Logiciels et accès VPN
• Siège ergonomique (recommandé, analyse SEPP)

═══ ASSURANCE ACCIDENT DU TRAVAIL ═══
Depuis la loi du 27/11/2022 :
• L'AT couvre le domicile PENDANT les heures de télétravail
• Le trajet domicile-école (déposer/chercher enfant) = chemin du travail
• L'avenant doit mentionner le lieu et les heures de télétravail
• En cas de doute → présomption en faveur du travailleur

═══ ERGONOMIE ═══
• Le SEPP peut effectuer une analyse ergonomique du poste à domicile
• Recommandations : bureau réglable, écran à hauteur des yeux, chaise adaptée
• L'employeur peut contribuer aux frais d'aménagement`,delai:"Mensuel (indemnités) — ponctuel (équipement)",formulaire:"Notes de frais / politique télétravail",ou:null,obligatoire:true,duree_estimee:'15 min/mois'},
],
alertes:[
  {niveau:'critique',texte:"Télétravail STRUCTUREL = avenant au contrat OBLIGATOIRE. Sans avenant = pas de cadre juridique clair en cas de litige."},
  {niveau:'important',texte:"L'assurance AT couvre le domicile pendant les heures de télétravail. L'avenant doit mentionner le lieu et les heures."},
  {niveau:'important',texte:"Indemnité bureau max 154,74€/mois : uniquement pour télétravail structurel (min 1j/semaine). Pas pour le télétravail occasionnel."},
  {niveau:'attention',texte:"Ergonomie à domicile : le SEPP peut intervenir. L'employeur reste responsable du bien-être du télétravailleur."},
],
simulation:{titre:"Télétravail — Coût et économie (1 travailleur, 2j/sem)",lignes:[
  {label:'Indemnité bureau',montant:'154,74€/mois',type:'neutre'},
  {label:'Internet + PC forfait',montant:'40€/mois',type:'neutre'},
  {label:'Équipement (amorti/an)',montant:'±50€/mois',type:'neutre'},
  {label:'Coût total employeur',montant:'±244,74€/mois',type:'vert'},
  {label:'',montant:'',type:'separateur'},
  {label:'Économie bureau (loyer, énergie)',montant:'-200 à -400€/mois',type:'vert_bold'},
  {label:'Net travailleur (exonéré)',montant:'194,74€/mois',type:'vert'},
]},
faq:[
  {q:"Le travailleur peut-il exiger le télétravail ?",r:"Non. Le télétravail structurel est volontaire et bilatéral. L'employeur peut refuser (sauf si le contrat ou la CCT le prévoit). Le travailleur ne peut pas non plus être forcé."},
  {q:"Le télétravail à l'étranger est-il possible ?",r:"Juridiquement complexe : impact sur la sécurité sociale (règlement UE 883/2004), la fiscalité et le droit du travail applicable. Accord-cadre UE pour max 49% du temps dans l'État de résidence. À analyser au cas par cas."},
],
formulaires:[{nom:"SPF Emploi — Télétravail",url:"https://emploi.belgique.be/fr/themes/contrats-de-travail/teletravail",type:'en_ligne'}]};
export default function ProcedureTeletravail(){const P=PROC_TT;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div>{P.etapes.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_TT};
