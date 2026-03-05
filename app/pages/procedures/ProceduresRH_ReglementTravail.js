'use client';
import { useState, useMemo } from 'react';
const PROC_RT={id:'reglement_travail',icon:'📖',categorie:'legal',titre:"Règlement de travail",resume:"Document OBLIGATOIRE dès le 1er travailleur. Contient les horaires, modes de rémunération, préavis, sanctions, droits et obligations. Doit être remis à chaque travailleur. Modification via procédure de publicité (15 jours d'affichage). Amende si absent.",
baseLegale:[{ref:"Loi 08/04/1965",desc:"Règlement de travail — contenu obligatoire, procédure d'établissement et de modification"},{ref:"AR 23/03/2007",desc:"Mentions obligatoires du règlement de travail — liste actualisée"},{ref:"Code pénal social, art. 101-109",desc:"Sanctions en cas d'absence ou non-conformité du règlement de travail"}],
etapes:[
  {n:1,phase:'rédaction',titre:"Contenu obligatoire du règlement de travail",detail:`Le règlement de travail DOIT contenir au minimum :

═══ MENTIONS OBLIGATOIRES (Loi 08/04/1965) ═══
1. Horaires de travail (début, fin, pauses, régimes temps partiel)
2. Modes de mesurage et contrôle du travail (pointage, etc.)
3. Mode de rémunération, calcul, périodicité de paiement
4. Délais de préavis (ou référence à la loi)
5. Droits et obligations du personnel de surveillance
6. Sanctions disciplinaires, montant des amendes, manquements visés
7. Recours du travailleur contre les sanctions
8. Endroit où se trouve la boîte de secours
9. Noms des membres du CE et du CPPT (si existants)
10. Noms des délégués syndicaux (si existants)
11. Adresses de l'inspection sociale compétente
12. Conventions collectives applicables
13. Dates des vacances annuelles collectives
14. Mesures de protection contre le harcèlement (personne de confiance, conseiller en prévention)
15. Caméras de surveillance (si applicable)
16. Politique d'utilisation des données électroniques (email, internet)
17. Droit à la déconnexion (depuis 2023, >20 travailleurs)

═══ MENTIONS RECOMMANDÉES ═══
• Politique d'absence et certificat médical
• Procédure disciplinaire détaillée
• Politique voiture de société / GSM
• Politique télétravail
• Politique alcool et drogues (CCT 100)
• RGPD — traitement des données personnelles`,delai:"AVANT l'engagement du 1er travailleur",formulaire:"Règlement de travail (modèle Aureus Social Pro)",ou:null,obligatoire:true,duree_estimee:'4-8h de rédaction'},

  {n:2,phase:'rédaction',titre:"Procédure d'établissement — Publicité 15 jours",detail:`═══ ENTREPRISE SANS CE (Conseil d'Entreprise) ═══
La majorité des PME n'ont pas de CE. Procédure :

1. L'employeur rédige le projet de règlement
2. AFFICHAGE pendant 15 JOURS dans l'entreprise
   • Endroit apparent et accessible à tous les travailleurs
   • Avec un registre de remarques à disposition
3. Les travailleurs peuvent formuler des remarques dans le registre
4. Après 15 jours : envoi du règlement + registre de remarques à l'inspection sociale (SPF Emploi)
5. Si pas de remarques → le règlement entre en vigueur
6. Si remarques → tentative de conciliation par l'inspection sociale

═══ ENTREPRISE AVEC CE ═══
• Le règlement est négocié au sein du CE
• Accord unanime nécessaire
• Si pas d'accord → commission paritaire → puis inspection sociale

═══ ENTRÉE EN VIGUEUR ═══
• Le règlement entre en vigueur 15 jours après l'affichage (si pas de remarques)
• Ou à la date fixée par l'inspection après conciliation
• Le règlement doit être REMIS à chaque travailleur (copie ou accès électronique)
• Un exemplaire est conservé à l'endroit indiqué dans le règlement`,delai:"15 jours d'affichage obligatoire",formulaire:"Registre de remarques + envoi inspection sociale",ou:"SPF Emploi — Direction régionale",obligatoire:true,duree_estimee:'15 jours minimum'},

  {n:3,phase:'gestion',titre:"Modification du règlement — Même procédure",detail:`Toute modification du règlement suit la MÊME procédure de publicité.

═══ MODIFICATIONS FRÉQUENTES ═══
• Changement d'horaire de travail
• Ajout de nouveaux régimes (télétravail, temps partiel)
• Mise à jour des sanctions disciplinaires
• Politique caméras ou données électroniques
• Changement de personne de confiance
• Mise à jour du droit à la déconnexion
• Nouvelles conventions collectives applicables

═══ PROCÉDURE ═══
1. Rédiger l'avenant / la modification
2. Affichage 15 jours (ou négociation au CE)
3. Registre de remarques
4. Envoi inspection sociale
5. Entrée en vigueur
6. Remettre la version modifiée aux travailleurs

═══ SANCTIONS SI NON-RESPECT ═══
• Absence de règlement : amende de 200€ à 2.000€ × nombre de travailleurs
• Règlement non conforme : mise en demeure par l'inspection puis amende
• Pas de remise au travailleur : le travailleur peut choisir les conditions les plus favorables
• Sanctions disciplinaires non prévues au règlement → nulles`,delai:"15 jours d'affichage pour chaque modification",formulaire:"Avenant au règlement de travail",ou:null,obligatoire:true,duree_estimee:'1-2 semaines'},
],
alertes:[
  {niveau:'critique',texte:"Le règlement de travail est OBLIGATOIRE dès le 1er travailleur. Absence = amende 200-2.000€ × nombre de travailleurs."},
  {niveau:'critique',texte:"Chaque modification suit la procédure de publicité (15 jours d'affichage + registre + inspection). Pas de modification unilatérale."},
  {niveau:'important',texte:"Le règlement DOIT être REMIS à chaque travailleur. Preuve de remise recommandée (signature ou accusé de réception)."},
  {niveau:'important',texte:"Depuis 2023 : le droit à la déconnexion doit être inclus (entreprises >20 travailleurs)."},
  {niveau:'attention',texte:"Les sanctions disciplinaires ne peuvent être appliquées que si elles sont PRÉVUES au règlement. Sanction non prévue = nulle."},
],
simulation:{titre:"Obligations liées au règlement de travail",lignes:[
  {label:'Rédaction initiale',montant:'4-8h (ou juriste ±500-1.500€)',type:'neutre'},
  {label:'Affichage + publicité',montant:'15 jours',type:'neutre'},
  {label:'Remise aux travailleurs',montant:'Obligatoire',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'Amende si absent',montant:'200-2.000€ × nbre travailleurs',type:'vert_bold'},
]},
faq:[
  {q:"Puis-je utiliser un modèle standard ?",r:"Oui. Le SPF Emploi fournit un modèle de base. Aureus Social Pro génère un règlement personnalisé. Mais il doit être adapté à VOTRE entreprise."},
  {q:"Le télétravail doit-il figurer au règlement ?",r:"Recommandé mais pas strictement obligatoire (le télétravail est souvent régi par un avenant individuel ou une CCT). Bonne pratique de l'inclure."},
  {q:"Faut-il un nouveau règlement pour chaque nouveau travailleur ?",r:"Non. Le même règlement s'applique à tous. Il suffit de remettre une copie au nouveau travailleur."},
],
formulaires:[{nom:"SPF Emploi — Règlement de travail",url:"https://emploi.belgique.be/fr/themes/reglementation-du-travail/reglement-de-travail",type:'en_ligne'}]};
export default function ProcedureReglementTravail(){const P=PROC_RT;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'rédaction',l:'Rédaction',i:'✍️'},{id:'gestion',l:'Gestion',i:'📆'}];const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Coûts',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_RT};
