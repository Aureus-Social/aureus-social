'use client';
import { useState, useMemo } from 'react';
const PROC_FIN_CDD={id:'fin_cdd',icon:'📅',categorie:'fin',titre:"Fin de CDD / Contrat de remplacement",resume:"Le CDD prend fin automatiquement à l'échéance sans préavis ni indemnité. Règles strictes sur les renouvellements successifs. Rupture anticipée = indemnité. Maximum 4 CDD successifs pour 2 ans (sauf dérogation). Risque de requalification en CDI.",
baseLegale:[{ref:"Loi 03/07/1978, art. 40",desc:"Fin du CDD — cessation automatique au terme convenu"},{ref:"Loi 03/07/1978, art. 10",desc:"CDD — conditions de forme (écrit obligatoire avant le début)"},{ref:"Loi 03/07/1978, art. 10bis",desc:"CDD successifs — maximum 4 contrats pour une durée de 2 ans"},{ref:"Loi 03/07/1978, art. 40 §1-3",desc:"Rupture anticipée du CDD — indemnité égale au salaire restant (max double préavis CDI)"},{ref:"Loi 03/07/1978, art. 11ter",desc:"Contrat de remplacement — conditions et durée"},{ref:"Cass. 08/04/2002",desc:"CDD successifs sans justification = requalification en CDI"}],
etapes:[
  {n:1,phase:'anticipation',titre:"Vérifier la date d'échéance et les conditions du CDD",detail:`═══ LE CDD PREND FIN AUTOMATIQUEMENT ═══
• Le CDD prend fin de plein droit à la date prévue
• Pas besoin de notification, pas de préavis, pas d'indemnité
• Le contrat cesse le dernier jour du terme

═══ VÉRIFICATIONS PRÉALABLES ═══
☐ Date de fin prévue dans le contrat
☐ Le CDD a bien été rédigé PAR ÉCRIT avant le 1er jour
☐ Le contrat n'est pas un CDD successif illégal
☐ Pas de clause de renouvellement automatique
☐ Vérifier si le travailleur est en protection (grossesse, etc.)

═══ CDD SANS ÉCRIT ═══
Si le CDD n'a PAS été conclu par écrit avant le début des prestations :
→ Le contrat est REQUALIFIÉ en CDI
→ Toutes les règles du CDI s'appliquent (préavis, etc.)

═══ RENOUVELLEMENTS SUCCESSIFS ═══
Règle générale : max 4 CDD successifs pour max 2 ans de durée totale.
• CDD 1 : 6 mois ✅
• CDD 2 : 6 mois ✅ (total 12 mois)
• CDD 3 : 6 mois ✅ (total 18 mois)
• CDD 4 : 6 mois ✅ (total 24 mois = 2 ans max)
• CDD 5 : ❌ → requalification en CDI

Exceptions (autorisation royale) :
• Max 6 CDD de min 6 mois pour max 3 ans
• Nécessite une demande auprès du SPF Emploi

═══ CONTRAT DE REMPLACEMENT ═══
• Durée max : 2 ans
• Motif : remplacement d'un travailleur absent (maladie, maternité, crédit-temps)
• Le remplacé doit être identifié dans le contrat
• Prend fin au retour du travailleur remplacé (ou à la date prévue)`,delai:"2 à 4 semaines avant l'échéance",formulaire:null,ou:null,obligatoire:true,duree_estimee:'30 min'},

  {n:2,phase:'anticipation',titre:"Décision : ne pas renouveler, renouveler ou embaucher en CDI",detail:`═══ OPTION 1 : NE PAS RENOUVELER ═══
Le CDD prend fin à l'échéance. Rien à faire juridiquement.
• Informer le travailleur suffisamment à l'avance (courtoisie, pas obligation)
• Préparer les documents de sortie
• Organiser la passation

═══ OPTION 2 : RENOUVELER EN CDD ═══
Possible SI les limites ne sont pas atteintes (4 CDD / 2 ans) :
• Nouveau CDD ÉCRIT avant le 1er jour du nouveau contrat
• Nouvelle DIMONA
• Justification objective pour le nouveau CDD recommandée
• Si limites atteintes → CDI obligatoire

═══ OPTION 3 : TRANSFORMER EN CDI ═══
La meilleure option si le travailleur convient :
• Nouveau contrat CDI (ou avenant de transformation)
• Ancienneté : si CDD suivi immédiatement par CDI → l'ancienneté des CDD est reprise
• Avantages : stabilité, fidélisation, éligibilité aux aides (Activa, premier engagement si applicable)

═══ CONVERSION AUTOMATIQUE EN CDI ═══
Le CDD est AUTOMATIQUEMENT requalifié en CDI si :
• Pas d'écrit avant le début
• Dépassement de la durée max (2 ans)
• Plus de 4 CDD successifs
• Le travailleur continue à travailler après l'échéance sans nouveau contrat`,delai:"Décision 2-4 semaines avant l'échéance",formulaire:"Nouveau CDD ou contrat CDI (si renouvellement/transformation)",ou:null,obligatoire:true,duree_estimee:'1h'},

  {n:3,phase:'exécution',titre:"Rupture ANTICIPÉE du CDD — Règles strictes",detail:`La rupture anticipée du CDD est BEAUCOUP plus coûteuse que la fin du CDI.

═══ RUPTURE PAR L'EMPLOYEUR (avant le terme) ═══
L'employeur peut rompre le CDD avant le terme moyennant :
• Une indemnité = le salaire brut restant jusqu'au terme
• MAIS plafonné au DOUBLE du préavis CDI

Exemple : CDD de 12 mois, rupture après 4 mois, salaire 3.200€/mois
• Salaire restant : 8 mois × 3.200€ = 25.600€
• Double préavis CDI (pour 4 mois d'ancienneté) : 2 × 3 semaines = 6 semaines × 738€ = 4.430€
• L'employeur paie le PLUS FAIBLE : 4.430€ (le plafond s'applique)

═══ RUPTURE PAR LE TRAVAILLEUR ═══
Même règle en miroir :
• Indemnité = salaire restant, plafonné au simple préavis CDI

═══ PREMIÈRE MOITIÉ DU CDD ═══
Pendant la première moitié du CDD (max 6 mois) :
• Rupture possible avec préavis (comme un CDI)
• Pas d'indemnité si le préavis est correctement presté

═══ MOTIF GRAVE ═══
La rupture pour motif grave est toujours possible (même procédure que pour le CDI).

═══ ACCORD MUTUEL ═══
Les parties peuvent convenir de mettre fin au CDD de commun accord.
Même règles que la rupture de commun accord d'un CDI.`,delai:"À tout moment pendant le CDD",formulaire:"Notification de rupture anticipée (recommandé)",ou:null,obligatoire:true,duree_estimee:'1h'},

  {n:4,phase:'fin',titre:"Documents de fin de CDD + DIMONA OUT",detail:`═══ DOCUMENTS OBLIGATOIRES ═══
1. C4 avec mention "fin de CDD" (ou "fin de contrat de remplacement")
   → Le travailleur a droit au chômage si le CDD n'est pas renouvelé
   → Pas de sanction ONEM (ce n'est pas une démission)
2. Fiche de paie finale
3. Pécule de vacances de sortie (employés)
4. Attestation de vacances
5. 281.10
6. Attestation d'occupation
7. DIMONA OUT

═══ CHÔMAGE ═══
Le travailleur dont le CDD n'est pas renouvelé :
• A droit au chômage (si conditions d'admissibilité remplies)
• Pas de sanction ONEM — la fin du CDD n'est pas un choix du travailleur
• S'inscrit comme DE auprès d'Actiris/Forem/VDAB

═══ PÉCULE DE VACANCES ═══
Employés : pécule de sortie = 15,34% de la rémunération brute
Ouvriers : payé par la caisse de vacances (via ONVA ou caisse sectorielle)

═══ CONTINUITÉ APRÈS FIN CDD ═══
⚠️ Si le travailleur continue à travailler APRÈS la date de fin du CDD sans nouveau contrat :
→ Le CDD est automatiquement REQUALIFIÉ en CDI
→ L'ancienneté court depuis le début du premier CDD`,delai:"Le dernier jour du CDD",formulaire:"C4 'fin CDD' + docs de sortie + DIMONA OUT",ou:null,obligatoire:true,duree_estimee:'2h'},
],
alertes:[
  {niveau:'critique',texte:"Le CDD DOIT être ÉCRIT et signé AVANT le premier jour de travail. Sans écrit → requalification automatique en CDI."},
  {niveau:'critique',texte:"Max 4 CDD successifs pour max 2 ans. Au-delà → requalification en CDI. Pas de marge de manœuvre."},
  {niveau:'important',texte:"Si le travailleur continue à travailler APRÈS la fin du CDD sans nouveau contrat → CDI automatique avec reprise d'ancienneté."},
  {niveau:'important',texte:"Rupture anticipée par l'employeur = indemnité (salaire restant plafonné au double du préavis CDI). Très coûteux si CDD long."},
  {niveau:'attention',texte:"Le travailleur dont le CDD n'est pas renouvelé a droit au chômage sans sanction. Le C4 mentionne 'fin de CDD'."},
  {niveau:'info',texte:"Contrat de remplacement : max 2 ans. Le remplacé doit être identifié. La fin est liée au retour du remplacé."},
],
simulation:{titre:"Fin CDD vs Rupture anticipée (12 mois, 3.200€ brut)",lignes:[
  {label:'FIN NORMALE À L\'ÉCHÉANCE :',montant:'',type:'neutre'},
  {label:'  Préavis',montant:'0€',type:'vert'},
  {label:'  Indemnité',montant:'0€',type:'vert'},
  {label:'  Coût : solde + docs uniquement',montant:'±3.000€',type:'vert_bold'},
  {label:'',montant:'',type:'separateur'},
  {label:'RUPTURE ANTICIPÉE (après 4 mois) :',montant:'',type:'neutre'},
  {label:'  Salaire restant (8 mois)',montant:'25.600€',type:'neutre'},
  {label:'  Double préavis CDI (6 sem)',montant:'4.430€',type:'neutre'},
  {label:'  Indemnité due (le + faible)',montant:'4.430€',type:'vert_bold'},
  {label:'',montant:'',type:'separateur'},
  {label:'RUPTURE ANTICIPÉE (après 1 mois) :',montant:'',type:'neutre'},
  {label:'  Salaire restant (11 mois)',montant:'35.200€',type:'neutre'},
  {label:'  Double préavis CDI (2 sem)',montant:'1.477€',type:'neutre'},
  {label:'  Indemnité due',montant:'1.477€',type:'vert_bold'},
]},
faq:[
  {q:"Le CDD peut-il être prolongé tacitement ?",r:"NON. Si le travailleur continue après le terme → CDI automatique. Il n'y a pas de prolongation tacite en CDD."},
  {q:"Combien de CDD peut-on faire avec la même personne ?",r:"Max 4 CDD successifs pour max 2 ans au total. Exception : autorisation SPF pour 6 CDD de min 6 mois sur max 3 ans."},
  {q:"Le travailleur en CDD peut-il être licencié ?",r:"Oui, par rupture anticipée (indemnité) ou motif grave. Pendant la première moitié du CDD : préavis possible comme en CDI."},
  {q:"L'ancienneté des CDD compte-t-elle pour le CDI suivant ?",r:"Oui, si les CDD se suivent sans interruption significative. L'ancienneté est reprise pour le calcul du préavis CDI."},
],
formulaires:[{nom:"SPF Emploi — CDD",url:"https://emploi.belgique.be/fr/themes/contrats-de-travail/contrat-de-travail-duree-determinee",type:'en_ligne'}]};
export default function ProcedureFinCDD(){const P=PROC_FIN_CDD;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'anticipation',l:'Anticipation',i:'🔍'},{id:'exécution',l:'Rupture anticipée',i:'⚡'},{id:'fin',l:'Sortie',i:'📄'}];const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_FIN_CDD};
