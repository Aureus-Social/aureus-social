'use client';
import { useState, useMemo } from 'react';
const PROC_DEMISSION={id:'demission',icon:'🚪',categorie:'fin',titre:"Démission du travailleur",resume:"Le travailleur met fin au contrat CDI en prestant un préavis réduit. Délais plus courts que pour le licenciement. L'employeur doit gérer la période de préavis, les documents de sortie et la passation.",
baseLegale:[{ref:"Loi 03/07/1978, art. 37 §2-4",desc:"Délais de préavis en cas de démission — tableau réduit"},{ref:"Loi 26/12/2013 (statut unique)",desc:"Harmonisation des délais de préavis démission ouvriers/employés"},{ref:"AR 09/03/2006",desc:"Modalités de notification du préavis par le travailleur"},{ref:"CCT n° 109",desc:"Motivation : ne s'applique PAS à la démission (uniquement au licenciement)"}],
etapes:[
  {n:1,phase:'réception',titre:"Réception de la démission — Vérifier la validité",detail:`Le travailleur notifie sa démission. L'employeur vérifie les conditions.

═══ FORMES DE NOTIFICATION VALABLES ═══
1. Lettre recommandée (prend effet le 3e jour ouvrable)
2. Exploit d'huissier (effet immédiat)
3. Remise en main propre avec accusé de réception signé par l'employeur

═══ VÉRIFIER ═══
☐ La notification est bien ÉCRITE (une démission orale n'est PAS valable)
☐ La date de début du préavis est mentionnée
☐ La durée du préavis est correcte (voir étape 2)
☐ Le préavis commence bien un LUNDI

═══ DÉMISSION ORALE ═══
Si le travailleur annonce sa démission oralement :
• Ce n'est PAS une démission valable
• Ne PAS agir comme si c'en était une
• Demander une confirmation ÉCRITE
• Si le travailleur ne revient plus sans écrit → abandon de poste (autre procédure)

═══ PEUT-ON REFUSER UNE DÉMISSION ? ═══
NON. La démission est un droit unilatéral du travailleur.
L'employeur ne peut ni la refuser ni la contester (sauf si le préavis est trop court).
Si le préavis notifié est trop court → le travailleur devra payer une indemnité compensatoire pour la différence.`,delai:"Dès réception de la notification",formulaire:null,ou:null,obligatoire:true,duree_estimee:'30 min'},

  {n:2,phase:'réception',titre:"Vérifier le délai de préavis du travailleur",detail:`Les délais de préavis pour la DÉMISSION sont PLUS COURTS que pour le licenciement.

═══ TABLEAU DES PRÉAVIS — DÉMISSION (statut unique 2014) ═══

Ancienneté → Préavis
0-3 mois → 1 semaine
3-6 mois → 2 semaines
6-12 mois → 3 semaines
12-18 mois → 4 semaines
18-24 mois → 5 semaines
2-4 ans → 6 semaines
4-5 ans → 7 semaines
5-6 ans → 9 semaines
6-7 ans → 10 semaines
7-8 ans → 12 semaines
8+ ans → 13 semaines (MAXIMUM)

⚠️ Le préavis de démission est PLAFONNÉ à 13 semaines.
Même avec 20 ans d'ancienneté → max 13 semaines.
(vs licenciement : 62 semaines pour 20 ans)

═══ COMPARAISON ═══
5 ans d'ancienneté :
• Démission : 7 semaines
• Licenciement : 15 semaines (2× plus long)

10 ans d'ancienneté :
• Démission : 13 semaines (max)
• Licenciement : 30 semaines

═══ PRÉAVIS INCORRECT ═══
Si le travailleur notifie un préavis trop court :
• L'employeur peut réclamer une indemnité compensatoire pour la différence
• En pratique : rarement réclamé (mauvaise publicité, coût judiciaire)
• Mieux : négocier une date de fin acceptable pour les deux parties`,delai:"Vérification immédiate à la réception",formulaire:null,ou:null,obligatoire:true,duree_estimee:'15 min'},

  {n:3,phase:'gestion',titre:"Organiser la période de préavis + passation",detail:`═══ PENDANT LE PRÉAVIS ═══
Le contrat continue normalement :
• Le travailleur doit continuer à travailler
• L'employeur verse le salaire normal
• Pas de congé de sollicitation (c'est le travailleur qui part)

═══ PASSATION ═══
Organiser la transmission des responsabilités :
1. Documentation des tâches en cours
2. Transfert des contacts clients/fournisseurs
3. Formation du remplaçant (si recruté à temps)
4. Archivage des dossiers
5. Mise à jour des procédures internes

═══ CLAUSE DE NON-CONCURRENCE ═══
Si le contrat contient une clause de non-concurrence :
• L'employeur a 15 jours après la fin du préavis pour l'ACTIVER ou y RENONCER
• Si activée : l'employeur paie l'indemnité (min 50% du salaire brut × durée)
• Si renoncée : pas d'indemnité, le travailleur est libre

═══ L'EMPLOYEUR PEUT-IL LIBÉRER LE TRAVAILLEUR DU PRÉAVIS ? ═══
Oui : l'employeur peut dispenser le travailleur de prester le préavis.
• Si dispense avec maintien du salaire → le préavis court normalement
• Si dispense SANS salaire → c'est un licenciement par l'employeur → indemnité !`,delai:"Pendant toute la durée du préavis",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Durée du préavis'},

  {n:4,phase:'fin',titre:"Documents de sortie — C4 + solde de tout compte",detail:`═══ DOCUMENTS OBLIGATOIRES ═══
1. C4 avec mention "démission du travailleur"
   ⚠️ Le C4 mentionne bien que c'est le TRAVAILLEUR qui a donné son préavis
   → Impact chômage : le travailleur qui démissionne n'a PAS droit au chômage immédiatement

2. Fiche de paie finale
3. Pécule de vacances de sortie (employés)
4. Attestation de vacances
5. Formulaire 281.10
6. Attestation d'occupation
7. DIMONA OUT

═══ SOLDE DE TOUT COMPTE ═══
• Salaire du mois en cours (prorata)
• Pécule de vacances de sortie
• Prorata 13e mois
• Récupération d'avances ou matériel

═══ CHÔMAGE APRÈS DÉMISSION ═══
Le travailleur qui DÉMISSIONNE :
• N'a PAS droit au chômage immédiatement
• Sanction ONEM : 4 à 52 semaines d'exclusion (souvent 4-8 semaines)
• Exception : si la démission est "légitime" (harcèlement prouvé, déménagement conjoint, etc.)
• Le travailleur peut s'inscrire comme DE et attendre la fin de la sanction

═══ RÉCUPÉRATION MATÉRIEL ═══
Voiture, GSM, laptop, badge, clés → restitution le dernier jour.
Documenter la restitution (inventaire signé).`,delai:"Le dernier jour du préavis",formulaire:"C4 'démission' + docs de sortie + DIMONA OUT",ou:null,obligatoire:true,duree_estimee:'2h'},
],
alertes:[
  {niveau:'critique',texte:"La démission DOIT être ÉCRITE (recommandé, huissier ou remise en main propre). Une démission orale n'est PAS valable — ne pas l'accepter sans écrit."},
  {niveau:'critique',texte:"Le préavis de démission est plafonné à 13 SEMAINES maximum, quelle que soit l'ancienneté."},
  {niveau:'important',texte:"Le C4 doit mentionner 'démission du travailleur'. Le travailleur n'a pas droit au chômage immédiatement (sanction ONEM 4-52 semaines)."},
  {niveau:'important',texte:"Clause de non-concurrence : l'employeur a 15 jours après la fin du contrat pour l'activer ou y renoncer. Passé ce délai → renonciation implicite."},
  {niveau:'attention',texte:"L'employeur NE peut PAS refuser une démission. C'est un droit unilatéral du travailleur."},
  {niveau:'info',texte:"Si l'employeur dispense le travailleur de prester SANS maintien de salaire, c'est un licenciement → indemnité compensatoire de préavis due par l'employeur !"},
],
simulation:{titre:"Démission — Délais de préavis comparés",lignes:[
  {label:'ANCIENNETÉ',montant:'DÉMISSION / LICENCIEMENT',type:'neutre'},
  {label:'',montant:'',type:'separateur'},
  {label:'1 an',montant:'4 sem / 5 sem',type:'neutre'},
  {label:'3 ans',montant:'6 sem / 12 sem',type:'neutre'},
  {label:'5 ans',montant:'7 sem / 15 sem',type:'neutre'},
  {label:'8 ans',montant:'13 sem / 24 sem',type:'neutre'},
  {label:'10 ans',montant:'13 sem / 30 sem',type:'vert_bold'},
  {label:'15 ans',montant:'13 sem / 39 sem',type:'vert_bold'},
  {label:'20 ans',montant:'13 sem / 62 sem',type:'vert_bold'},
  {label:'',montant:'',type:'separateur'},
  {label:'Maximum démission',montant:'13 semaines',type:'vert_bold'},
]},
faq:[
  {q:"Le travailleur peut-il rétracter sa démission ?",r:"Pas de droit légal de rétractation. MAIS : si l'employeur accepte, la rétractation est possible par accord mutuel. Recommandé : confirmer par écrit."},
  {q:"Le travailleur tombe malade pendant le préavis de démission ?",r:"Le préavis est SUSPENDU pendant la maladie, exactement comme pour le licenciement. La durée du préavis s'allonge."},
  {q:"Le travailleur ne vient plus après avoir démissionné oralement ?",r:"C'est un abandon de poste, pas une démission valable. Envoyer une mise en demeure recommandée. Si pas de retour → possibilité de licenciement pour motif grave."},
  {q:"Puis-je négocier un préavis plus court ?",r:"Oui, par accord mutuel. L'employeur et le travailleur peuvent convenir d'une durée de préavis plus courte (ou plus longue). À confirmer par écrit."},
],
formulaires:[{nom:"SPF Emploi — Démission",url:"https://emploi.belgique.be/fr/themes/contrats-de-travail/fin-du-contrat-de-travail/preavis",type:'en_ligne'}]};
export default function ProcedureDemission(){const P=PROC_DEMISSION;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'réception',l:'Réception',i:'📨'},{id:'gestion',l:'Gestion',i:'📆'},{id:'fin',l:'Sortie',i:'📄'}];const og=[{id:'etapes',l:'Étapes',i:'📋'},{id:'simulation',l:'Comparatif',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_DEMISSION};
