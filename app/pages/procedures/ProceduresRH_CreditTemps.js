'use client';
import { useState, useMemo } from 'react';

const PROC_CREDIT_TEMPS = {
  id:'credit_temps', icon:'🕐', categorie:'regime',
  titre:"Crédit-temps — Toutes formes (avec et sans motif)",
  resume:"Droit du travailleur de réduire ou suspendre ses prestations pendant une période déterminée. Avec motif (soins enfant <8 ans, soins membre malade, formation) : droit à une allocation ONEM. Sans motif : possible si CCT sectorielle, mais plus d'allocation ONEM depuis 2017.",
  baseLegale:[
    {ref:"CCT n° 103 (27/06/2012)",desc:"Crédit-temps, diminution de carrière et emplois de fin de carrière — cadre général au CNT"},
    {ref:"CCT n° 103/6 (27/03/2023)",desc:"Modification de la CCT 103 — conditions actualisées"},
    {ref:"AR 12/12/2001",desc:"Allocation d'interruption dans le cadre du crédit-temps — montants et conditions ONEM"},
    {ref:"Loi 22/01/1985, art. 105",desc:"Interruption de carrière — base légale historique"},
    {ref:"AR 02/01/1991",desc:"Allocations d'interruption — règlement général ONEM"},
    {ref:"Loi-programme 28/06/2013",desc:"Suppression allocation crédit-temps sans motif (entrée en vigueur 01/01/2015, impact définitif 01/04/2017)"},
  ],
  formes:[
    {type:'Crédit-temps AVEC MOTIF — suspension complète',fraction:'0%',duree:'Max 51 mois (soins enfant) / 51 mois (soins malade) / 36 mois (formation)',allocation:'Oui — ONEM (±928€/mois cohabitant, ±1.548€ isolé, 2026)'},
    {type:'Crédit-temps AVEC MOTIF — 1/2 temps',fraction:'50%',duree:'Max 51 mois (soins enfant) / 51 mois (soins malade) / 36 mois (formation)',allocation:'Oui — ONEM (±464€/mois cohabitant, ±548€ isolé)'},
    {type:'Crédit-temps AVEC MOTIF — 1/5 temps',fraction:'80%',duree:'Max 51 mois (soins enfant) / 51 mois (soins malade) / 36 mois (formation)',allocation:'Oui — ONEM (±220€/mois, tous statuts)'},
    {type:'Crédit-temps SANS MOTIF — suspension',fraction:'0%',duree:'Max 12 mois (si CCT sectorielle le prévoit)',allocation:'Non — plus d\'allocation depuis 2017'},
    {type:'Crédit-temps SANS MOTIF — 1/2 temps',fraction:'50%',duree:'Max 12 mois (si CCT sectorielle)',allocation:'Non'},
    {type:'Crédit-temps SANS MOTIF — 1/5 temps',fraction:'80%',duree:'Max 12 mois (si CCT sectorielle)',allocation:'Non'},
  ],
  motifs:[
    {motif:"Soins enfant < 8 ans",duree_max:"51 mois cumulés",condition:"Enfant de moins de 8 ans au début du crédit-temps"},
    {motif:"Soins membre ménage/famille gravement malade",duree_max:"51 mois cumulés",condition:"Certificat médical attestant la maladie grave + lien familial"},
    {motif:"Formation reconnue",duree_max:"36 mois cumulés",condition:"Formation d'au moins 360h/an ou 120h/trimestre — liste régionale"},
    {motif:"Soins enfant handicapé < 21 ans",duree_max:"51 mois",condition:"Reconnaissance handicap ≥66% ou allocation familiale majorée"},
    {motif:"Soins palliatifs",duree_max:"51 mois",condition:"Attestation de soins palliatifs par le médecin traitant"},
  ],
  etapes:[
    {n:1,phase:'préparation',titre:"Vérifier les conditions d'accès au crédit-temps",
     detail:`Le crédit-temps est un DROIT mais soumis à des CONDITIONS.

═══ CONDITIONS D'ANCIENNETÉ ═══
• Suspension complète : 24 mois d'ancienneté chez l'employeur
• 1/2 temps : 24 mois d'ancienneté
• 1/5 temps : 24 mois d'ancienneté + temps plein

═══ CONDITIONS DE TAILLE (seuil 5%) ═══
L'employeur peut reporter le crédit-temps si >5% de l'effectif est déjà en crédit-temps/congé thématique simultanément. Mécanisme de planification.

═══ AVEC MOTIF (droit + allocation ONEM) ═══
Motifs ouvrant droit à l'allocation :
1. Soins enfant < 8 ans : max 51 mois
2. Soins enfant handicapé < 21 ans : max 51 mois
3. Soins membre malade : max 51 mois
4. Formation reconnue : max 36 mois
5. Soins palliatifs : max 51 mois
→ Tous ces motifs = allocation ONEM + protection contre le licenciement

═══ SANS MOTIF ═══
Possible UNIQUEMENT si une CCT sectorielle ou d'entreprise le prévoit.
• Pas d'allocation ONEM (supprimée depuis 2017)
• Durée max : 12 mois (renouvelable selon CCT)
• Moins fréquent aujourd'hui`,
     delai:"Minimum 3 mois avant le début souhaité (6 mois si >20 travailleurs)",formulaire:null,ou:null,obligatoire:true,duree_estimee:'1-2h'},

    {n:2,phase:'préparation',titre:"Le travailleur avertit l'employeur par écrit",
     detail:`Le travailleur doit avertir l'employeur PAR ÉCRIT dans les délais.

═══ DÉLAI DE NOTIFICATION ═══
• Entreprises ≤10 travailleurs : 3 mois à l'avance
• Entreprises >10 travailleurs : 3 mois à l'avance (6 mois si >20 et >5% seuil atteint)

═══ CONTENU DE LA NOTIFICATION ═══
1. Type de crédit-temps : suspension, 1/2 temps ou 1/5 temps
2. Motif invoqué (si avec motif) + preuve :
   - Enfant : attestation de composition de ménage + extrait de naissance
   - Maladie : certificat médical attestant la maladie grave
   - Formation : attestation d'inscription dans la formation
3. Date de début et de fin souhaitée
4. Fraction souhaitée si réduction
5. Horaire souhaité si temps partiel

═══ RÉPONSE DE L'EMPLOYEUR ═══
L'employeur peut :
✅ Accepter → la date est confirmée
⏸️ Reporter de maximum 6 mois pour raisons organisationnelles (si >5% seuil ou motif légitime)
❌ Refuser UNIQUEMENT si les conditions ne sont pas remplies (ancienneté, motif non valable)

L'employeur NE peut PAS refuser un crédit-temps avec motif si toutes les conditions sont remplies. C'est un DROIT.`,
     delai:"3 mois avant le début (écrit recommandé/lettre recommandée)",formulaire:"Lettre de demande de crédit-temps (modèle ONEM)",ou:"À l'employeur (lettre recommandée ou remise en main propre)",obligatoire:true,duree_estimee:'30 min'},

    {n:3,phase:'préparation',titre:"Accord entre employeur et travailleur — Organisation",
     detail:`═══ DISCUSSION ET ACCORD ═══
L'employeur et le travailleur conviennent :
1. Date de début effective
2. Durée (dans les limites légales)
3. Si réduction : horaire adapté (quels jours/heures)
4. Organisation du travail pendant l'absence/réduction
5. Remplacement éventuel du travailleur

═══ AVENANT AU CONTRAT ═══
Rédiger un avenant temporaire :
• Type de crédit-temps (suspension / 1/2 / 1/5)
• Motif (si avec motif)
• Date de début et de fin
• Horaire adapté (si réduction)
• Caractère temporaire (retour automatique au régime initial)

═══ REMPLACEMENT ═══
L'employeur peut engager un remplaçant :
• CDD de remplacement (art. 11ter Loi 03/07/1978)
• Intérimaire (motif remplacement)
• Réorganisation interne
• Pas d'obligation de remplacement

═══ SEUIL 5% — MÉCANISME DE PLANIFICATION ═══
Si >5% de l'effectif est simultanément en crédit-temps :
• Système de priorité basé sur l'ancienneté de la demande
• Certains motifs ont priorité (soins palliatifs > soins enfant > formation)
• Report maximum de 6 mois`,
     delai:"1 à 2 mois avant le début",formulaire:"Avenant au contrat de travail",ou:"En interne",obligatoire:true,duree_estimee:'1h'},

    {n:4,phase:'engagement',titre:"Demande d'allocation ONEM (si avec motif)",
     detail:`Si le crédit-temps est AVEC MOTIF, le travailleur introduit sa demande d'allocation auprès de l'ONEM.

═══ FORMULAIRE C61 — CRÉDIT-TEMPS ═══
Le travailleur complète le formulaire C61 :
• Section A : données personnelles
• Section B : type de crédit-temps et motif
• Section C : à compléter par l'EMPLOYEUR (attestation d'occupation)
• Pièces justificatives selon le motif

═══ L'EMPLOYEUR COMPLÈTE ═══
L'employeur remplit la SECTION C du formulaire C61 :
• Confirmation du régime de travail avant le crédit-temps
• Date de début du crédit-temps
• Type de réduction (suspension / 1/2 / 1/5)
• Signature et cachet de l'employeur

═══ PIÈCES JUSTIFICATIVES ═══
Soins enfant < 8 ans : composition de ménage + extrait naissance
Soins malade : certificat médical spécifique
Formation : attestation d'inscription + programme
Enfant handicapé : attestation reconnaissance handicap

═══ ENVOI ═══
Le dossier complet est envoyé au bureau ONEM compétent :
• Via le syndicat du travailleur (FGTB, CSC, CGSLB)
• Ou via la CAPAC (Caisse Auxiliaire de Paiement)

═══ MONTANTS ALLOCATIONS ONEM (2026 — indicatif) ═══
Suspension complète :
• Cohabitant : ±928€/mois
• Isolé : ±1.548€/mois
• Isolé avec charge : ±1.548€/mois

Réduction 1/2 temps :
• Cohabitant : ±464€/mois
• Isolé : ±548€/mois

Réduction 1/5 :
• Tous : ±220€/mois`,
     delai:"2 mois avant le début (le traitement ONEM prend 4-6 semaines)",formulaire:"Formulaire C61 — crédit-temps (ONEM)",ou:"Syndicat (FGTB/CSC/CGSLB) ou CAPAC → ONEM",obligatoire:true,duree_estimee:'1h'},

    {n:5,phase:'engagement',titre:"DmfA et gestion administrative pendant le crédit-temps",
     detail:`═══ EN CAS DE SUSPENSION COMPLÈTE ═══
• Le contrat est SUSPENDU (pas rompu)
• Pas de salaire versé
• DmfA : code d'absence "crédit-temps"
• Le travailleur reste dans l'effectif
• L'ancienneté continue à courir
• Pas de DIMONA OUT (le contrat est toujours actif)

═══ EN CAS DE RÉDUCTION (1/2 ou 1/5) ═══
• Salaire proportionnel à la fraction prestée
• DmfA : facteur Q adapté (ex: 19h pour mi-temps, 30,4h pour 4/5)
• Heures de crédit-temps = code absence spécifique
• Pécule de vacances : proportionnel aux heures prestées
• 13e mois : proportionnel

═══ PROTECTION CONTRE LE LICENCIEMENT ═══
Le travailleur en crédit-temps bénéficie d'une PROTECTION :
• Début : 3 mois avant le début du crédit-temps
• Fin : 3 mois après la fin du crédit-temps
• L'employeur ne peut PAS licencier SAUF pour motif grave ou raison économique suffisante
• Licenciement abusif pendant la protection = indemnité de 6 mois de salaire brut

═══ IMPACT SUR LES DROITS SOCIAUX ═══
Pension : les périodes de crédit-temps avec motif sont ASSIMILÉES pour la pension (pas de perte)
Chômage : les périodes de crédit-temps sont assimilées
Maladie : maintien des droits AMI (indemnités calculées sur le dernier salaire avant réduction)`,
     delai:"Dès le début du crédit-temps — en continu",formulaire:"DmfA adaptée + fiche de paie (si réduction)",ou:"Portail sécurité sociale",obligatoire:true,duree_estimee:'15 min/mois'},

    {n:6,phase:'gestion',titre:"Fin du crédit-temps — Retour au régime initial",
     detail:`═══ FIN NORMALE ═══
Le crédit-temps prend fin à la date prévue :
• Retour automatique au régime de travail initial
• Pas de nouvelle DIMONA nécessaire
• DmfA : retour au facteur Q normal
• Le travailleur reprend son poste ou un poste équivalent

═══ FIN ANTICIPÉE ═══
Le travailleur peut demander à mettre fin au crédit-temps avant la date prévue :
• Accord mutuel avec l'employeur recommandé
• Préavis de 3 mois au syndicat/CAPAC pour arrêter les allocations

═══ PROLONGATION ═══
Le travailleur peut demander une prolongation :
• Dans les limites légales (51 mois max avec motif)
• Même procédure : notification + formulaire C61
• L'employeur peut reporter si seuil 5% atteint

═══ PROTECTION POST CRÉDIT-TEMPS ═══
La protection contre le licenciement court encore 3 MOIS après la fin.
Pendant ces 3 mois : licenciement = indemnité de 6 mois.`,
     delai:"Le dernier jour du crédit-temps",formulaire:null,ou:null,obligatoire:true,duree_estimee:'30 min'},
  ],
  alertes:[
    {niveau:'critique',texte:"Le crédit-temps avec motif est un DROIT — l'employeur ne peut pas le refuser si les conditions sont remplies. Il peut uniquement reporter de max 6 mois."},
    {niveau:'critique',texte:"Protection contre le licenciement : de 3 mois AVANT à 3 mois APRÈS le crédit-temps. Licenciement abusif = 6 mois d'indemnité."},
    {niveau:'important',texte:"L'employeur DOIT compléter la section C du formulaire C61. Défaut = retard de l'allocation du travailleur (responsabilité de l'employeur)."},
    {niveau:'important',texte:"Le crédit-temps SANS MOTIF ne donne PLUS droit à l'allocation ONEM depuis 2017. Vérifier si une CCT sectorielle le permet encore."},
    {niveau:'attention',texte:"Seuil 5% : si >5% de l'effectif est en crédit-temps/congé thématique, l'employeur peut reporter les nouvelles demandes (mécanisme de planification)."},
    {niveau:'info',texte:"Les périodes de crédit-temps avec motif sont ASSIMILÉES pour la pension. Pas de perte de droits sociaux."},
  ],
  simulation:{titre:"Impact financier crédit-temps (travailleur 3.200€ brut TP)",lignes:[
    {label:'TRAVAIL NORMAL :',montant:'',type:'neutre'},
    {label:'  Net mensuel (temps plein)',montant:'±2.150€',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'CRÉDIT-TEMPS 1/5 (motif enfant) :',montant:'',type:'neutre'},
    {label:'  Salaire 80%',montant:'±1.720€ net',type:'neutre'},
    {label:'  Allocation ONEM 1/5',montant:'±220€',type:'vert'},
    {label:'  TOTAL travailleur',montant:'±1.940€/mois',type:'vert_bold'},
    {label:'  Perte nette',montant:'-210€/mois (-9,8%)',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'CRÉDIT-TEMPS 1/2 (motif enfant, isolé) :',montant:'',type:'neutre'},
    {label:'  Salaire 50%',montant:'±1.085€ net',type:'neutre'},
    {label:'  Allocation ONEM 1/2 (isolé)',montant:'±548€',type:'vert'},
    {label:'  TOTAL',montant:'±1.633€/mois',type:'vert_bold'},
    {label:'',montant:'',type:'separateur'},
    {label:'SUSPENSION COMPLÈTE (isolé) :',montant:'',type:'neutre'},
    {label:'  Allocation ONEM',montant:'±1.548€/mois',type:'vert_bold'},
  ]},
  faq:[
    {q:"L'employeur peut-il refuser un crédit-temps avec motif ?",r:"NON, si toutes les conditions sont remplies (ancienneté, motif valable, preuves). Il peut uniquement REPORTER de maximum 6 mois pour raisons organisationnelles ou si le seuil de 5% est atteint."},
    {q:"Le crédit-temps est-il cumulable avec un autre emploi ?",r:"En principe non pendant la suspension complète (pas de nouvel emploi salarié). En réduction 1/2 ou 1/5, le travailleur peut exercer une activité complémentaire limitée (vérifier avec l'ONEM)."},
    {q:"Le crédit-temps impacte-t-il la pension ?",r:"Les crédits-temps AVEC MOTIF sont assimilés pour la pension (pas de perte). Les crédits-temps sans motif ne sont plus assimilés depuis 2012 (perte de droits de pension)."},
    {q:"Que se passe-t-il si le motif disparaît (enfant a 8 ans pendant le crédit-temps) ?",r:"Le crédit-temps se poursuit jusqu'à la date prévue si l'enfant avait moins de 8 ans au DÉBUT du crédit-temps."},
    {q:"Le travailleur peut-il être licencié pendant le crédit-temps ?",r:"Uniquement pour motif grave ou raison suffisante. Licenciement abusif = indemnité de 6 mois de salaire brut. La protection court de 3 mois avant à 3 mois après."},
  ],
  formulaires:[
    {nom:"ONEM — Crédit-temps formulaire C61",url:"https://www.onem.be/fr/formulaires",type:'en_ligne'},
    {nom:"ONEM — Montants allocations crédit-temps",url:"https://www.onem.be/fr/documentation/feuille-info/t160",type:'en_ligne'},
    {nom:"CNT — CCT n° 103",url:"https://www.cnt-nar.be",type:'en_ligne'},
  ],
};

export default function ProcedureCreditTemps(){const P=PROC_CREDIT_TEMPS;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);
const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'préparation',l:'Préparation',i:'🔍'},{id:'engagement',l:'Engagement',i:'✍️'},{id:'gestion',l:'Gestion',i:'📆'}];
const og=[{id:'etapes',l:'Étapes A→Z',i:'📋'},{id:'avantages',l:'Formes & motifs',i:'📊'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];
const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='avantages'&&<div><h2 style={s.st2}>📊 Formes de crédit-temps</h2>{P.formes.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:700,color:'#f8fafc',marginBottom:4}}>{f.type}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>Fraction : {f.fraction} | Durée : {f.duree}<br/>Allocation : {f.allocation}</div></div>)}<h2 style={{...s.st2,marginTop:24}}>🎯 Motifs ouvrant droit à l'allocation</h2>{P.motifs.map((m,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#60a5fa',marginBottom:4}}>{m.motif}</div><div style={{fontSize:13,color:'#94a3b8'}}>Durée max : {m.duree_max} — {m.condition}</div></div>)}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_CREDIT_TEMPS};
