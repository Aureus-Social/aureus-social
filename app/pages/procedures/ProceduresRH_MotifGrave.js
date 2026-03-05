'use client';
import { useState, useMemo } from 'react';

const PROC_MOTIF_GRAVE={id:'motif_grave',icon:'🔴',categorie:'fin',titre:"Licenciement pour motif grave (faute grave)",resume:"Rupture immédiate du contrat SANS préavis ni indemnité en cas de faute grave rendant toute collaboration professionnelle définitivement impossible. Délai strict de 3 jours ouvrables. Procédure très encadrée — risque élevé de contestation.",
baseLegale:[
  {ref:"Loi 03/07/1978, art. 35",desc:"Licenciement pour motif grave — définition et procédure"},
  {ref:"Loi 03/07/1978, art. 36",desc:"Délai de 3 jours ouvrables pour notifier le motif grave"},
  {ref:"Cass. 23/10/1989",desc:"Jurisprudence : le motif grave doit rendre IMMÉDIATEMENT et DÉFINITIVEMENT impossible la collaboration"},
  {ref:"Loi 22/01/1985, art. 105",desc:"Charge de la preuve sur l'employeur — obligation de prouver la faute grave"},
],
etapes:[
  {n:1,phase:'préparation',titre:"Identifier et documenter le motif grave",detail:`Le motif grave = faute qui rend IMMÉDIATEMENT et DÉFINITIVEMENT impossible toute collaboration.

═══ EXEMPLES DE MOTIFS GRAVES RECONNUS ═══
✅ Vol, détournement de fonds, fraude
✅ Violence physique envers collègue/supérieur
✅ Harcèlement sexuel ou moral grave et prouvé
✅ Ivresse au travail (récidive après avertissement)
✅ Refus répété d'exécuter des ordres légitimes (insubordination grave)
✅ Concurrence déloyale active pendant le contrat
✅ Falsification de documents (certificats médicaux, notes de frais)
✅ Abandon de poste sans justification pendant plusieurs jours

═══ EXEMPLES DE MOTIFS NON ACCEPTÉS ═══
❌ Retard isolé (même de plusieurs heures)
❌ Erreur professionnelle (même coûteuse, sauf négligence grave répétée)
❌ Maladie fréquente (discrimination !)
❌ Conflit ponctuel avec un collègue
❌ Performance insuffisante sans avertissements préalables

═══ DOCUMENTER IMMÉDIATEMENT ═══
• Témoignages écrits (collègues, clients)
• Photos, vidéos, captures d'écran
• Rapports d'enquête interne
• Preuves matérielles (relevés bancaires, logs informatiques)
• Avertissements antérieurs (si faute culminante)

⚠️ La charge de la preuve est sur l'EMPLOYEUR. Sans preuves solides → tribunal → requalification en licenciement ordinaire = indemnité de préavis complète.`,delai:"IMMÉDIATEMENT après la découverte du fait",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Immédiat'},

  {n:2,phase:'exécution',titre:"Notification dans les 3 JOURS OUVRABLES",detail:`Le délai de 3 jours ouvrables est ABSOLU. Après → le motif grave est caduc.

═══ CALCUL DU DÉLAI ═══
• Jour 0 : le jour où la personne compétente pour licencier PREND CONNAISSANCE du fait
• Jours 1-2-3 : 3 jours ouvrables suivants (samedi = ouvrable, dimanche et jours fériés = non)
• La notification doit être ENVOYÉE avant la fin du 3e jour ouvrable

═══ 2 ÉTAPES OBLIGATOIRES ═══

ÉTAPE 1 — NOTIFICATION DU LICENCIEMENT (dans les 3 jours)
Lettre recommandée ou exploit d'huissier :
"Nous vous notifions votre licenciement pour motif grave avec effet immédiat."
→ Pas besoin de détailler les motifs à ce stade

ÉTAPE 2 — NOTIFICATION DES MOTIFS (dans les 3 jours suivants)
Lettre recommandée séparée :
"Les motifs graves justifiant votre licenciement sont : [description détaillée et précise]"
→ Obligatoire : décrire les FAITS de manière PRÉCISE (dates, lieux, circonstances)
→ Seuls les motifs mentionnés dans cette lettre pourront être invoqués devant le tribunal

═══ EN PRATIQUE ═══
Beaucoup d'employeurs envoient les 2 lettres EN MÊME TEMPS (dans les 3 jours).
C'est la solution la plus sûre.

═══ ERREURS FATALES ═══
❌ Dépasser le délai de 3 jours → licenciement requalifié en ordinaire
❌ Motifs trop vagues ("comportement inacceptable") → rejet par le tribunal
❌ Motifs non mentionnés dans la lettre → ne peuvent plus être invoqués
❌ Pas de recommandé → problème de preuve`,delai:"3 JOURS OUVRABLES maximum après connaissance du fait",formulaire:"Lettre de licenciement pour motif grave + lettre des motifs",ou:"Envoi par recommandé ou huissier",obligatoire:true,duree_estimee:'Immédiat'},

  {n:3,phase:'exécution',titre:"Effet immédiat — Pas de préavis, pas d'indemnité",detail:`Le contrat prend fin IMMÉDIATEMENT. Le travailleur quitte l'entreprise le jour même.

═══ CONSÉQUENCES IMMÉDIATES ═══
• Pas de préavis
• Pas d'indemnité compensatoire de préavis
• Pas de congé de sollicitation
• Pas d'outplacement
• Effet immédiat = le jour de la notification

═══ DOCUMENTS À REMETTRE ═══
1. C4 avec mention "motif grave"
2. Fiche de paie finale (salaire jusqu'au jour de la rupture)
3. Pécule de vacances de sortie
4. Attestation de vacances
5. Formulaire 281.10
6. DIMONA OUT

═══ CE QUI RESTE DÛ ═══
• Salaire jusqu'au jour du licenciement (inclus)
• Pécule de vacances de sortie
• Prorata 13e mois
• Jours fériés dans les 30 jours suivants (si contrat > 15 jours avant)

═══ CHÔMAGE ═══
Le travailleur licencié pour motif grave risque une EXCLUSION du chômage :
• L'ONEM peut sanctionner (4 à 52 semaines de suspension)
• Le travailleur peut contester la décision de l'ONEM
• L'ONEM n'est pas lié par la qualification de "motif grave" de l'employeur`,delai:"Le jour même de la notification",formulaire:"C4 mention 'motif grave' + docs de sortie",ou:null,obligatoire:true,duree_estimee:'1-2h'},

  {n:4,phase:'fin',titre:"Contestation — Risques et tribunal du travail",detail:`Le licenciement pour motif grave est TRÈS souvent contesté devant le tribunal.

═══ CONTESTATION PAR LE TRAVAILLEUR ═══
Le travailleur peut saisir le tribunal du travail pour contester :
• Le caractère "grave" du motif
• Le respect du délai de 3 jours
• La suffisance des preuves

═══ SI LE TRIBUNAL REQUALIFIE ═══
Le tribunal peut juger que le motif n'est PAS grave :
→ Le licenciement est requalifié en licenciement ORDINAIRE
→ L'employeur doit payer l'INTÉGRALITÉ de l'indemnité de préavis
→ + Éventuellement une indemnité CCT 109 (3-17 semaines)
→ + Éventuellement des dommages et intérêts

═══ COÛT D'UNE REQUALIFICATION ═══
Exemple : 8 ans d'ancienneté, 3.200€ brut
• Indemnité de préavis : ±17.737€ brut
• + Indemnité CCT 109 : ±5.000€ à 14.000€
• + Frais d'avocat : ±5.000€ à 10.000€
• TOTAL potentiel : 27.000€ à 42.000€

═══ CONSEIL ═══
• Consulter un avocat AVANT de notifier le motif grave
• Constituer un dossier de preuves SOLIDE
• Évaluer le risque : si doute → licenciement ordinaire avec préavis est plus sûr
• Peser le coût du préavis vs le risque de requalification`,delai:"Le travailleur a 1 an pour saisir le tribunal",formulaire:null,ou:"Tribunal du travail (si contestation)",obligatoire:true,duree_estimee:'Variable (6-18 mois de procédure)'},
],
alertes:[
  {niveau:'critique',texte:"DÉLAI DE 3 JOURS OUVRABLES : absolu et non extensible. Après 3 jours → le motif grave est caduc → licenciement requalifié en ordinaire."},
  {niveau:'critique',texte:"La CHARGE DE LA PREUVE est sur l'employeur. Sans preuves SOLIDES et DOCUMENTÉES → le tribunal requalifiera en licenciement ordinaire."},
  {niveau:'important',texte:"Les motifs doivent être PRÉCIS dans la lettre. Seuls les motifs mentionnés pourront être invoqués au tribunal. Motifs vagues = rejet."},
  {niveau:'important',texte:"TOUJOURS consulter un avocat AVANT de notifier un motif grave. Le risque financier d'une requalification est élevé."},
  {niveau:'attention',texte:"Le C4 mentionne 'motif grave'. Le travailleur risque une exclusion du chômage. Il peut contester auprès de l'ONEM."},
  {niveau:'info',texte:"En cas de doute sur la gravité du motif → le licenciement ordinaire avec préavis est TOUJOURS plus sûr juridiquement."},
],
simulation:{titre:"Risque financier — Motif grave accepté vs requalifié (8 ans, 3.200€)",lignes:[
  {label:'MOTIF GRAVE ACCEPTÉ :',montant:'',type:'neutre'},
  {label:'  Préavis',montant:'0€',type:'vert'},
  {label:'  Indemnité',montant:'0€',type:'vert'},
  {label:'  Coût total',montant:'±2.000€ (solde + admin)',type:'vert_bold'},
  {label:'',montant:'',type:'separateur'},
  {label:'MOTIF GRAVE REQUALIFIÉ (tribunal) :',montant:'',type:'neutre'},
  {label:'  Indemnité préavis 24 sem',montant:'±17.737€',type:'neutre'},
  {label:'  + CCT 109 (3-17 sem)',montant:'±5.000-14.000€',type:'neutre'},
  {label:'  + Frais avocat',montant:'±5.000-10.000€',type:'neutre'},
  {label:'  COÛT TOTAL potentiel',montant:'27.000€ à 42.000€',type:'vert_bold'},
]},
faq:[
  {q:"Un seul fait suffit-il pour un motif grave ?",r:"Oui, si le fait est suffisamment grave en soi (vol, violence). Pour des faits moins graves, il faut une accumulation avec des avertissements préalables (faute culminante)."},
  {q:"Le délai de 3 jours court à partir de quand ?",r:"À partir du moment où la personne compétente pour licencier (patron, DRH) prend connaissance du fait. Pas le jour du fait lui-même si découvert plus tard."},
  {q:"Le travailleur peut-il contester devant le tribunal ?",r:"Oui, dans un délai d'1 an. Le tribunal évalue si le motif est réellement grave et si la procédure a été respectée."},
  {q:"Puis-je suspendre le travailleur en attendant l'enquête ?",r:"Oui, une mise à pied conservatoire (avec maintien du salaire) est possible le temps d'enquêter. Le délai de 3 jours court à partir de la fin de l'enquête / connaissance des résultats."},
],
formulaires:[
  {nom:"SPF Emploi — Motif grave",url:"https://emploi.belgique.be/fr/themes/contrats-de-travail/fin-du-contrat-de-travail/motif-grave",type:'en_ligne'},
]};

export default function ProcedureMotifGrave(){const P=PROC_MOTIF_GRAVE;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);
const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'préparation',l:'Préparation',i:'🔍'},{id:'exécution',l:'Exécution',i:'⚡'},{id:'fin',l:'Contestation',i:'⚖️'}];
const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];
const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_MOTIF_GRAVE};
