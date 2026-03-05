'use client';
import { useState, useMemo } from 'react';

const PROC_CT_FIN_CARRIERE = {
  id:'ct_fin_carriere', icon:'🧓', categorie:'regime',
  titre:"Crédit-temps fin de carrière (55+)",
  resume:"Réduction des prestations (1/2 temps ou 1/5 temps) pour les travailleurs de 55 ans et plus (exceptionnellement 50+). Allocation ONEM majorée jusqu'à la pension. Droit du travailleur si conditions remplies. Protection renforcée contre le licenciement.",
  baseLegale:[
    {ref:"CCT n° 103 (27/06/2012), section III",desc:"Emplois de fin de carrière — conditions d'accès au crédit-temps fin de carrière"},
    {ref:"CCT n° 103/6 (27/03/2023)",desc:"Conditions actualisées — âge, ancienneté, carrière professionnelle"},
    {ref:"AR 12/12/2001, art. 6",desc:"Allocations d'interruption pour emploi fin de carrière — montants majorés"},
    {ref:"AR 30/12/2014",desc:"Conditions d'âge et de carrière pour le régime général (55 ans + 25 ans de carrière)"},
    {ref:"CCT sectorielles",desc:"Certaines CP prévoient un accès à 50 ou 55 ans avec conditions adaptées"},
  ],
  conditions:[
    {type:'Régime général — 1/5 temps',age:'55 ans',carriere:'25 ans de carrière salariée',anciennete:'24 mois chez l\'employeur + temps plein',allocation:'±293€/mois (>55 ans)'},
    {type:'Régime général — 1/2 temps',age:'55 ans',carriere:'25 ans de carrière salariée',anciennete:'24 mois chez l\'employeur',allocation:'±598€/mois isolé / ±510€ cohabitant'},
    {type:'Régime dérogatoire — 1/5 temps (métiers lourds)',age:'50 ans',carriere:'28 ans carrière + métier lourd OU 35 ans carrière',anciennete:'24 mois + temps plein',allocation:'±293€/mois'},
    {type:'Régime dérogatoire — 1/2 temps (métiers lourds)',age:'50 ans',carriere:'28 ans carrière + métier lourd',anciennete:'24 mois',allocation:'±598€/mois isolé'},
  ],
  etapes:[
    {n:1,phase:'préparation',titre:"Vérifier les conditions d'âge, d'ancienneté et de carrière",
     detail:`═══ RÉGIME GÉNÉRAL (le plus courant) ═══

1/5 TEMPS (4 jours/semaine) :
• Âge : 55 ans au début du crédit-temps
• Carrière : 25 ans de carrière salariée
• Ancienneté : 24 mois chez l'employeur actuel
• Condition : travailler à temps plein AVANT la réduction
• Allocation ONEM : OUI (majorée pour les 55+)

1/2 TEMPS :
• Âge : 55 ans
• Carrière : 25 ans
• Ancienneté : 24 mois
• Pas de condition de temps plein préalable
• Allocation ONEM : OUI

═══ RÉGIMES DÉROGATOIRES (50 ans — CCT sectorielle) ═══
Certaines CCT sectorielles ou d'entreprise permettent un accès à 50 ans :
• Métier lourd (travail de nuit, équipes, travail en service continu)
• 28 ans de carrière + 5 ans de métier lourd dans les 10 dernières années
• OU 35 ans de carrière (sans condition de métier lourd)

═══ CALCUL DE LA CARRIÈRE ═══
La carrière de 25/28/35 ans se calcule en jours :
• 25 ans = 9.125 jours (25 × 365)
• Comptent : périodes de travail salarié + assimilées (maladie, chômage, maternité, crédit-temps avec motif)
• Vérification : via MyCareer.be ou Sigedis (service en ligne)

═══ DURÉE ═══
• Le crédit-temps fin de carrière court jusqu'à la PENSION
• Pas de limite de durée (peut durer 10-12 ans si début à 55 ans)
• Allocation ONEM versée pendant toute la durée`,
     delai:"Dès que le travailleur atteint 55 ans (ou 50 si dérogatoire)",formulaire:null,ou:"MyCareer.be (vérification carrière) + ONEM",obligatoire:true,duree_estimee:'1-2h'},

    {n:2,phase:'préparation',titre:"Notification à l'employeur + organisation",
     detail:`═══ NOTIFICATION ═══
Le travailleur avertit l'employeur par écrit :
• Délai : 3 mois avant le début (6 mois si >20 travailleurs + seuil 5%)
• Contenu : type de réduction (1/2 ou 1/5), date de début, preuve de carrière
• Lettre recommandée ou remise en main propre avec accusé de réception

═══ DROIT DU TRAVAILLEUR ═══
Le crédit-temps fin de carrière est un DROIT si les conditions sont remplies.
L'employeur peut UNIQUEMENT reporter de max 6 mois si seuil 5% atteint.
Il NE peut PAS refuser.

═══ ORGANISATION ═══
Convenir avec le travailleur :
• 1/5 temps : quel jour libre ? (un jour fixe par semaine)
• 1/2 temps : quels jours/heures ? (2,5 jours ou demi-journées)
• Réorganisation du travail
• Remplacement éventuel (CDD de remplacement, intérim)

═══ AVENANT AU CONTRAT ═══
• Type de réduction (1/5 ou 1/2)
• Date de début (jusqu'à la pension)
• Horaire adapté
• Mention du caractère de crédit-temps fin de carrière`,
     delai:"3 mois avant le début (lettre recommandée)",formulaire:"Notification écrite à l'employeur",ou:"À l'employeur",obligatoire:true,duree_estimee:'30 min'},

    {n:3,phase:'engagement',titre:"Demande d'allocation ONEM — Formulaire C61",
     detail:`═══ FORMULAIRE C61 — FIN DE CARRIÈRE ═══
Le travailleur complète le formulaire C61 spécifique "fin de carrière" :
• Section A : données personnelles
• Section B : type de réduction + motif "fin de carrière"
• Section C : à compléter par l'EMPLOYEUR
• Preuves de carrière (extrait MyCareer.be / Sigedis)

═══ L'EMPLOYEUR COMPLÈTE ═══
Section C du C61 :
• Régime de travail avant la réduction
• Date de début du crédit-temps fin de carrière
• Ancienneté du travailleur dans l'entreprise
• Signature + cachet

═══ ALLOCATIONS MAJORÉES (55+ — montants 2026 indicatifs) ═══

1/5 TEMPS :
• Tous statuts familiaux : ±293€/mois (montant majoré 55+)

1/2 TEMPS :
• Isolé : ±598€/mois
• Cohabitant : ±510€/mois

Ces montants sont MAJORÉS par rapport au crédit-temps classique.
Versés par l'ONEM via le syndicat (FGTB/CSC/CGSLB) ou la CAPAC.
Versés jusqu'à la PENSION légale.

═══ IMPACT FISCAL ═══
Les allocations de crédit-temps fin de carrière sont IMPOSABLES.
Elles sont soumises au précompte professionnel (±10-15%).
Le travailleur les déclare dans sa déclaration fiscale annuelle.`,
     delai:"2 mois avant le début",formulaire:"Formulaire C61 fin de carrière (ONEM)",ou:"Syndicat (FGTB/CSC/CGSLB) ou CAPAC → ONEM",obligatoire:true,duree_estimee:'1h'},

    {n:4,phase:'engagement',titre:"Protection renforcée contre le licenciement",
     detail:`Le travailleur en crédit-temps fin de carrière bénéficie d'une PROTECTION RENFORCÉE.

═══ DURÉE DE LA PROTECTION ═══
• Début : dès la demande écrite (3 mois avant le début)
• Fin : 3 mois après la fin du crédit-temps (= pension)
• En pratique : protection quasi permanente jusqu'à la pension

═══ LICENCIEMENT INTERDIT SAUF ═══
• Motif grave (faute grave du travailleur)
• Raison économique SUFFISANTE (restructuration, faillite)
• Raison étrangère au crédit-temps

═══ SANCTION EN CAS DE LICENCIEMENT ABUSIF ═══
Indemnité forfaitaire de 6 MOIS de salaire brut.
En plus du préavis normal.
Le préavis est calculé sur la base du contrat INITIAL (temps plein), pas sur la fraction réduite.

═══ INDEMNITÉ DE PRÉAVIS ═══
⚠️ Point crucial : le préavis (ou l'indemnité) est calculé sur le salaire TEMPS PLEIN.
Même si le travailleur est en 1/5 ou 1/2 depuis des années.
Base de calcul = le dernier salaire temps plein (indexé).`,
     delai:"Pendant toute la durée — jusqu'à la pension",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Vigilance permanente'},

    {n:5,phase:'gestion',titre:"Gestion administrative + paie + DmfA",
     detail:`═══ PAIE ═══
Salaire proportionnel à la fraction :
• 1/5 → 80% du salaire brut + allocation ONEM
• 1/2 → 50% du salaire brut + allocation ONEM

═══ DMFA ═══
• Facteur Q adapté (30,4h pour 4/5 ou 19h pour mi-temps)
• Code spécifique crédit-temps fin de carrière
• Heures de crédit-temps = absence assimilée

═══ PENSION ═══
Les périodes de crédit-temps fin de carrière sont ASSIMILÉES pour la pension.
• Pas de perte de droits de pension
• Le travailleur cotise comme s'il travaillait à temps plein (assimilation)
• Très avantageux pour le calcul de la pension

═══ DURÉE JUSQU'À LA PENSION ═══
Le crédit-temps fin de carrière n'a pas de date de fin fixe :
• Il court jusqu'à la pension légale (65 ans, ou 66/67 selon les réformes)
• Ou jusqu'à la pension anticipée si conditions remplies
• Le travailleur doit informer l'employeur de la date de mise à la pension

═══ CUMUL ═══
Le crédit-temps fin de carrière est NON cumulable avec :
• Un autre crédit-temps simultané
• Un congé parental simultané
• Un congé pour soins palliatifs simultané
Il EST cumulable avec un emploi complémentaire limité (vérifier avec ONEM).`,
     delai:"Mensuel (paie) + trimestriel (DmfA)",formulaire:"Fiche de paie adaptée + DmfA",ou:null,obligatoire:true,duree_estimee:'15 min/mois'},

    {n:6,phase:'gestion',titre:"Fin du crédit-temps fin de carrière — Pension",
     detail:`═══ MISE À LA PENSION ═══
Le crédit-temps fin de carrière prend fin à la date de la pension :
• Pension légale : 65 ans (66 ans à partir de 2025, 67 ans à partir de 2030)
• Pension anticipée : si conditions remplies (âge + carrière)
• Le travailleur informe l'employeur de la date de pension
• L'ONEM cesse le versement des allocations

═══ PROCÉDURE ═══
1. Le travailleur introduit sa demande de pension auprès du SFP (Service Fédéral des Pensions) — 1 an avant
2. Il informe l'employeur de la date effective
3. L'employeur prépare la sortie (C4, solde de tout compte)
4. DIMONA OUT le dernier jour

═══ PRÉAVIS ═══
Si l'employeur veut mettre fin au contrat pour mise à la pension :
• Préavis normal (selon ancienneté) calculé sur le salaire TEMPS PLEIN
• Ou indemnité compensatoire de préavis (sur base temps plein)`,
     delai:"1 an avant la pension (demande SFP) + 3 mois (préavis employeur)",formulaire:"Demande de pension (SFP) + DIMONA OUT + C4",ou:"Service Fédéral des Pensions (SFP) — MyPension.be",obligatoire:true,duree_estimee:'2-3 mois de procédure'},
  ],
  alertes:[
    {niveau:'critique',texte:"Le crédit-temps fin de carrière est un DROIT absolu si les conditions (55 ans + 25 ans carrière + 24 mois ancienneté) sont remplies. L'employeur NE PEUT PAS refuser."},
    {niveau:'critique',texte:"Préavis = toujours calculé sur le salaire TEMPS PLEIN, même si le travailleur est en 1/5 ou 1/2 depuis des années. Erreur fréquente et très coûteuse."},
    {niveau:'important',texte:"Protection contre le licenciement : de la demande écrite jusqu'à 3 mois après la fin. Indemnité de 6 mois de salaire brut si licenciement abusif."},
    {niveau:'important',texte:"Les allocations sont versées jusqu'à la PENSION. Le travailleur peut rester en crédit-temps fin de carrière pendant 10-12 ans."},
    {niveau:'attention',texte:"Régime dérogatoire 50 ans : uniquement si CCT sectorielle le prévoit + conditions de métier lourd ou 35 ans de carrière."},
    {niveau:'info',texte:"Les périodes de crédit-temps fin de carrière sont intégralement ASSIMILÉES pour la pension. Aucune perte de droits."},
  ],
  simulation:{titre:"Crédit-temps fin de carrière — Impact financier (3.200€ brut TP, 55 ans)",lignes:[
    {label:'TRAVAIL TEMPS PLEIN :',montant:'',type:'neutre'},
    {label:'  Net mensuel',montant:'±2.150€',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'CRÉDIT-TEMPS 1/5 FIN DE CARRIÈRE :',montant:'',type:'neutre'},
    {label:'  Salaire 80%',montant:'±1.720€ net',type:'neutre'},
    {label:'  Allocation ONEM majorée',montant:'±293€',type:'vert'},
    {label:'  TOTAL',montant:'±2.013€/mois',type:'vert_bold'},
    {label:'  Perte nette vs TP',montant:'-137€/mois (-6,4%)',type:'neutre'},
    {label:'  Jours libres gagnés',montant:'52 jours/an',type:'vert'},
    {label:'',montant:'',type:'separateur'},
    {label:'CRÉDIT-TEMPS 1/2 FIN DE CARRIÈRE (isolé) :',montant:'',type:'neutre'},
    {label:'  Salaire 50%',montant:'±1.085€ net',type:'neutre'},
    {label:'  Allocation ONEM majorée',montant:'±598€',type:'vert'},
    {label:'  TOTAL',montant:'±1.683€/mois',type:'vert_bold'},
    {label:'',montant:'',type:'separateur'},
    {label:'Sur 10 ans (55→65) en 1/5 :',montant:'',type:'neutre'},
    {label:'  Allocations ONEM cumulées',montant:'±35.160€',type:'vert_bold'},
    {label:'  Pension : AUCUNE perte (assimilation)',montant:'✓',type:'vert'},
  ]},
  faq:[
    {q:"Je dois travailler à temps plein pour prendre un 1/5 fin de carrière ?",r:"OUI. La condition de temps plein préalable s'applique au 1/5 (pas au 1/2). Si vous travaillez déjà à 4/5, vous devez d'abord repasser à temps plein."},
    {q:"L'allocation fin de carrière est-elle imposable ?",r:"Oui. Les allocations sont soumises au précompte professionnel (±10-15%) et doivent être déclarées dans la déclaration fiscale annuelle."},
    {q:"Mon employeur peut-il me proposer un autre poste pendant le crédit-temps ?",r:"Non, vous avez droit à votre poste ou un poste équivalent. L'employeur ne peut pas profiter du crédit-temps pour vous déplacer sur un poste inférieur."},
    {q:"Je peux revenir à temps plein volontairement ?",r:"Oui, avec l'accord de l'employeur. Vous perdez alors l'allocation ONEM. Le retour n'est pas automatique."},
    {q:"Que se passe-t-il si j'atteins 65 ans pendant le crédit-temps ?",r:"Le crédit-temps prend fin à la mise à la pension. L'allocation ONEM cesse. Vous partez en pension (légale ou anticipée si conditions remplies)."},
  ],
  formulaires:[
    {nom:"ONEM — Crédit-temps fin de carrière C61",url:"https://www.onem.be/fr/formulaires",type:'en_ligne'},
    {nom:"MyCareer.be — Vérification carrière",url:"https://www.mycareer.be",type:'en_ligne'},
    {nom:"MyPension.be — Simulation pension",url:"https://www.mypension.be",type:'en_ligne'},
  ],
};

export default function ProcedureCTFinCarriere(){const P=PROC_CT_FIN_CARRIERE;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);
const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'préparation',l:'Préparation',i:'🔍'},{id:'engagement',l:'Engagement',i:'✍️'},{id:'gestion',l:'Gestion',i:'📆'}];
const og=[{id:'etapes',l:'Étapes A→Z',i:'📋'},{id:'avantages',l:'Conditions',i:'📊'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];
const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='avantages'&&<div><h2 style={s.st2}>📊 Conditions d'accès</h2>{P.conditions.map((c,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:700,color:'#f8fafc',marginBottom:4}}>{c.type}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>Âge : {c.age} | Carrière : {c.carriere}<br/>Ancienneté : {c.anciennete}<br/>Allocation : {c.allocation}</div></div>)}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_CT_FIN_CARRIERE};
