'use client';
import { useState, useMemo } from 'react';

const PROC_CONGE_PARENTAL = {
  id:'conge_parental', icon:'👶', categorie:'regime',
  titre:"Congé parental",
  resume:"Droit du travailleur (homme ou femme) de suspendre ou réduire ses prestations pour s'occuper de son enfant de moins de 12 ans (21 ans si handicapé). 4 mois à temps plein, 8 mois à mi-temps ou 20 mois à 1/5. Allocation ONEM + protection contre le licenciement.",
  baseLegale:[
    {ref:"AR 29/10/1997",desc:"Introduction du congé parental dans le secteur privé — conditions et modalités"},
    {ref:"Loi 22/01/1985, art. 105 §1er 2°",desc:"Base légale de l'interruption de carrière pour congé parental"},
    {ref:"AR 02/01/1991",desc:"Allocations d'interruption — montants congé parental (ONEM)"},
    {ref:"Directive européenne 2019/1158",desc:"Directive concernant l'équilibre entre vie professionnelle et vie privée — transposée en droit belge"},
    {ref:"Loi 10/08/2001",desc:"Mesures de conciliation emploi-qualité de vie — congé parental élargi"},
    {ref:"AR 12/12/2001",desc:"Allocations d'interruption dans le cadre du congé parental — montants actualisés"},
  ],
  formes:[
    {type:'Suspension complète',fraction:'0%',duree:'4 mois (par enfant)',allocation:'±928€/mois isolé (2026)',condition:'12 mois d\'ancienneté chez l\'employeur'},
    {type:'Réduction 1/2 temps',fraction:'50%',duree:'8 mois (par enfant)',allocation:'±464€/mois',condition:'12 mois d\'ancienneté + temps plein ou temps partiel'},
    {type:'Réduction 1/5 temps',fraction:'80%',duree:'20 mois (par enfant)',allocation:'±157€/mois',condition:'12 mois d\'ancienneté + temps plein'},
    {type:'Réduction 1/10 temps',fraction:'90%',duree:'40 mois (par enfant)',allocation:'±78€/mois',condition:'12 mois d\'ancienneté + temps plein + accord employeur'},
  ],
  etapes:[
    {n:1,phase:'préparation',titre:"Vérifier les conditions + droits disponibles",
     detail:`═══ CONDITIONS ═══
• Ancienneté : 12 mois chez l'employeur actuel
• Enfant de moins de 12 ans (21 ans si handicapé)
• Être le parent ou parent adoptif de l'enfant
• Chaque parent a son propre droit (non transférable)

═══ DURÉE PAR ENFANT ═══
Pour chaque enfant, chaque parent a droit à :
• 4 mois de suspension complète, OU
• 8 mois de réduction 1/2 temps, OU
• 20 mois de réduction 1/5 temps, OU
• 40 mois de réduction 1/10 temps (accord employeur requis), OU
• Un MIX de ces formes (converties en mois équivalents)

═══ CONVERSION ═══
1 mois de suspension = 2 mois de 1/2 temps = 5 mois de 1/5 = 10 mois de 1/10
Le travailleur peut alterner les formes.

═══ MULTIPLE ENFANTS ═══
Le droit est PAR ENFANT. Si 2 enfants < 12 ans → 2 × 4 mois = 8 mois de suspension possible.
Pas de cumul simultané pour plusieurs enfants (un congé à la fois).

═══ DROIT INDIVIDUEL ═══
• Chaque parent a son propre droit (père ET mère)
• Non transférable entre parents
• Les deux parents peuvent prendre leur congé simultanément`,
     delai:"Dès la naissance/adoption de l'enfant",formulaire:null,ou:null,obligatoire:true,duree_estimee:'30 min'},

    {n:2,phase:'préparation',titre:"Notification à l'employeur — 2 mois à l'avance",
     detail:`═══ DÉLAI ═══
Le travailleur avertit l'employeur PAR ÉCRIT au moins 2 MOIS avant le début.
(3 mois si l'employeur occupe >20 travailleurs et demande le report)

═══ CONTENU DE LA NOTIFICATION ═══
1. Forme choisie : suspension, 1/2, 1/5 ou 1/10
2. Date de début et de fin
3. Preuve de parentalité : extrait d'acte de naissance de l'enfant
4. Si enfant handicapé : attestation de reconnaissance du handicap

═══ RÉPONSE DE L'EMPLOYEUR ═══
Le congé parental est un DROIT.
L'employeur peut :
✅ Accepter → date confirmée
⏸️ Reporter de max 6 mois (raisons organisationnelles)
   Le report doit être motivé par écrit dans le mois suivant la demande
❌ Il NE peut PAS refuser définitivement

Exception : la réduction 1/10 nécessite l'ACCORD de l'employeur (pas un droit).

═══ FLEXIBILITÉ ═══
Le congé peut être pris :
• En une seule période continue
• En périodes de minimum :
  - Suspension : 1 mois minimum par période
  - 1/2 temps : 2 mois minimum
  - 1/5 temps : 5 mois minimum
  - 1/10 temps : 10 mois minimum`,
     delai:"2 mois avant le début (lettre recommandée ou remise en main propre)",formulaire:"Notification écrite + extrait de naissance",ou:"À l'employeur",obligatoire:true,duree_estimee:'30 min'},

    {n:3,phase:'engagement',titre:"Demande d'allocation ONEM — Formulaire C61",
     detail:`═══ FORMULAIRE C61 — CONGÉ PARENTAL ═══
Le travailleur complète le C61 :
• Section A : données personnelles
• Section B : type de congé parental + dates
• Section C : à compléter par l'EMPLOYEUR
• Pièce : extrait de naissance de l'enfant

═══ L'EMPLOYEUR COMPLÈTE ═══
Section C :
• Régime de travail actuel
• Date de début et de fin du congé
• Type de réduction (suspension/1/2/1/5/1/10)
• Ancienneté
• Signature + cachet

═══ ALLOCATIONS ONEM (2026 — indicatif) ═══

Suspension complète :
• ±928€/mois (montant unique)
• Majoré si isolé avec enfant à charge : ±1.159€

Réduction 1/2 temps :
• ±464€/mois

Réduction 1/5 :
• ±157€/mois

Réduction 1/10 :
• ±78€/mois

═══ PRIME RÉGIONALE COMPLÉMENTAIRE ═══
🔵 Bruxelles : prime d'encouragement ±152€/mois (suspension) en complément ONEM
🟠 Flandre : aanmoedigingspremie variable selon la situation familiale
🟡 Wallonie : pas de prime complémentaire spécifique

═══ ENVOI ═══
Via syndicat (FGTB/CSC/CGSLB) ou CAPAC → bureau ONEM compétent.`,
     delai:"2 mois avant le début du congé",formulaire:"Formulaire C61 — congé parental (ONEM)",ou:"Syndicat ou CAPAC → ONEM",obligatoire:true,duree_estimee:'1h'},

    {n:4,phase:'engagement',titre:"Protection contre le licenciement — très stricte",
     detail:`═══ PROTECTION RENFORCÉE ═══
Le congé parental bénéficie de la protection la PLUS STRICTE.

PÉRIODE DE PROTECTION :
• Début : dès la demande écrite (2 mois avant)
• Fin : 2 mois après la fin du congé parental
• Si demande envoyée trop tôt : protection commence 2 mois avant le début effectif

LICENCIEMENT INTERDIT sauf :
• Motif grave
• Raison SUFFISANTE étrangère au congé parental
• L'employeur DOIT prouver que le licenciement n'est pas lié au congé

SANCTIONS :
• Licenciement abusif = indemnité forfaitaire de 6 MOIS de salaire brut
• En plus du préavis normal
• Préavis calculé sur le salaire TEMPS PLEIN (pas la fraction réduite)

═══ RETOUR AU POSTE ═══
À la fin du congé, le travailleur a le droit de RETROUVER :
• Son poste antérieur
• Ou un poste ÉQUIVALENT (même salaire, même fonction)
• L'employeur ne peut pas profiter du congé pour rétrograder`,
     delai:"De la demande jusqu'à 2 mois après la fin",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Vigilance permanente'},

    {n:5,phase:'gestion',titre:"Administration — DmfA, paie, congés pendant le congé parental",
     detail:`═══ DMFA ═══
• Suspension complète : code absence "congé parental" — pas de salaire
• Réduction : facteur Q adapté — salaire proportionnel
• Le travailleur reste dans l'effectif

═══ PAIE ═══
Suspension : pas de salaire (allocation ONEM uniquement)
Réduction : salaire proportionnel à la fraction prestée
Pécule de vacances : proportionnel (+ assimilation partielle)
13e mois : proportionnel
Chèques-repas : par jour effectivement presté

═══ DROITS SOCIAUX ═══
Pension : ASSIMILÉE intégralement (pas de perte)
Chômage : périodes assimilées
Maladie : maintien des droits AMI
Vacances : jours proportionnels mais assimilation partielle

═══ CUMUL AVEC AUTRE EMPLOI ═══
• Suspension complète : PAS de nouvel emploi salarié pendant le congé
• Réduction : le travailleur peut exercer une activité limitée (vérifier ONEM)
• Activité indépendante : possible en 1/5 si déjà exercée avant (vérifier)

═══ MALADIE PENDANT LE CONGÉ PARENTAL ═══
Si le travailleur tombe malade pendant le congé parental :
• Le congé parental continue à courir (pas de suspension du congé)
• Pas de salaire garanti (le contrat est suspendu ou réduit)
• Les indemnités mutuelle sont calculées sur la situation de congé parental`,
     delai:"Pendant toute la durée du congé",formulaire:"DmfA + fiche de paie adaptée",ou:null,obligatoire:true,duree_estimee:'15 min/mois'},

    {n:6,phase:'gestion',titre:"Fin du congé parental — Retour + droits résiduels",
     detail:`═══ RETOUR AU POSTE ═══
Le travailleur reprend son poste ou un poste équivalent.
• L'employeur organise le retour (accueil, mise à jour des dossiers)
• DmfA : retour au facteur Q normal
• Le salaire revient au niveau initial (indexé)

═══ PROTECTION POST-CONGÉ ═══
La protection court encore 2 MOIS après la fin.
Licenciement abusif pendant cette période = 6 mois d'indemnité.

═══ SOLDE DE CONGÉ PARENTAL ═══
Si le travailleur n'a pas utilisé tous ses mois :
• Le solde reste disponible jusqu'aux 12 ans de l'enfant (21 si handicapé)
• Il peut reprendre un congé ultérieurement
• Chaque nouvelle période = nouvelle notification + nouveau C61

═══ COMBINAISON AVEC CRÉDIT-TEMPS ═══
Le congé parental et le crédit-temps sont des droits DISTINCTS :
• Le congé parental ne "mange" PAS le crédit-temps
• Le travailleur peut prendre d'abord le congé parental, puis un crédit-temps
• Mais pas simultanément pour le même enfant

═══ NAISSANCE D'UN AUTRE ENFANT ═══
Chaque enfant ouvre un NOUVEAU droit à 4 mois.
3 enfants < 12 ans = 3 × 4 mois = 12 mois de congé parental possible.`,
     delai:"Le dernier jour du congé parental",formulaire:null,ou:null,obligatoire:true,duree_estimee:'1h'},
  ],
  alertes:[
    {niveau:'critique',texte:"Le congé parental est un DROIT absolu (sauf 1/10 = accord employeur). L'employeur ne peut PAS refuser, uniquement reporter de 6 mois maximum avec motivation écrite."},
    {niveau:'critique',texte:"Protection contre le licenciement : de la demande jusqu'à 2 mois après la fin. Sanction = 6 mois de salaire brut. Préavis sur base du temps plein."},
    {niveau:'important',texte:"Le droit est PAR ENFANT et PAR PARENT. Chaque parent a son propre droit de 4 mois (non transférable). Les deux parents peuvent le prendre simultanément."},
    {niveau:'important',texte:"Chaque enfant ouvre un nouveau droit. Délai : avant les 12 ans de l'enfant (21 ans si handicapé). Le solde non utilisé est perdu après cette date."},
    {niveau:'attention',texte:"L'employeur DOIT compléter la section C du formulaire C61 dans les délais. Retard = retard de l'allocation du travailleur (responsabilité employeur)."},
    {niveau:'info',texte:"Bruxelles et Flandre offrent des primes régionales complémentaires à l'allocation ONEM. Informer le travailleur de cette possibilité."},
  ],
  simulation:{titre:"Congé parental — Impact financier (3.200€ brut TP)",lignes:[
    {label:'SUSPENSION COMPLÈTE (4 mois) :',montant:'',type:'neutre'},
    {label:'  Allocation ONEM',montant:'±928€/mois',type:'vert'},
    {label:'  vs Salaire net TP',montant:'±2.150€/mois',type:'neutre'},
    {label:'  Perte nette / mois',montant:'-1.222€',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'RÉDUCTION 1/5 (20 mois) :',montant:'',type:'neutre'},
    {label:'  Salaire 80%',montant:'±1.720€ net',type:'neutre'},
    {label:'  Allocation ONEM 1/5',montant:'±157€',type:'vert'},
    {label:'  TOTAL',montant:'±1.877€/mois',type:'vert_bold'},
    {label:'  Perte nette / mois vs TP',montant:'-273€ (-12,7%)',type:'neutre'},
    {label:'  Jours libres sur 20 mois',montant:'87 jours',type:'vert'},
    {label:'',montant:'',type:'separateur'},
    {label:'DROITS PAR ENFANT (2 enfants) :',montant:'',type:'neutre'},
    {label:'  Total suspension possible',montant:'8 mois',type:'vert'},
    {label:'  Total 1/5 possible',montant:'40 mois',type:'vert'},
    {label:'  Pension : AUCUNE perte',montant:'✓',type:'vert'},
  ]},
  faq:[
    {q:"Le père a-t-il le même droit que la mère ?",r:"OUI. Le congé parental est un droit individuel de chaque parent. Le père et la mère ont chacun 4 mois par enfant. Non transférable entre eux."},
    {q:"Je peux prendre le congé parental en morceaux ?",r:"Oui ! Minimum par période : 1 mois (suspension), 2 mois (1/2), 5 mois (1/5), 10 mois (1/10). Vous pouvez alterner les formes."},
    {q:"Mon enfant a 11 ans — c'est encore possible ?",r:"Oui, tant que l'enfant n'a pas atteint 12 ans au DÉBUT de la période de congé parental demandée."},
    {q:"Le congé parental 'mange-t-il' mon crédit-temps ?",r:"NON. Ce sont des droits DISTINCTS. Vous pouvez utiliser les deux successivement."},
    {q:"Mon employeur peut-il me changer de poste à mon retour ?",r:"Non. Vous avez le droit de retrouver votre poste ou un poste équivalent (même salaire, même fonction). Un changement défavorable est interdit."},
    {q:"Je suis parent adoptif — même droit ?",r:"Oui, exactement les mêmes droits. L'enfant adoptif doit avoir moins de 12 ans (21 si handicapé) au début du congé."},
  ],
  formulaires:[
    {nom:"ONEM — Congé parental formulaire C61",url:"https://www.onem.be/fr/formulaires",type:'en_ligne'},
    {nom:"ONEM — Feuille info congé parental",url:"https://www.onem.be/fr/documentation/feuille-info/t19",type:'en_ligne'},
    {nom:"Bruxelles — Prime d'encouragement",url:"https://www.actiris.brussels",type:'en_ligne'},
  ],
};

export default function ProcedureCongeParental(){const P=PROC_CONGE_PARENTAL;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);
const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'préparation',l:'Préparation',i:'🔍'},{id:'engagement',l:'Engagement',i:'✍️'},{id:'gestion',l:'Gestion',i:'📆'}];
const og=[{id:'etapes',l:'Étapes A→Z',i:'📋'},{id:'avantages',l:'Formes',i:'📊'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];
const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='avantages'&&<div><h2 style={s.st2}>📊 Formes de congé parental</h2>{P.formes.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:700,color:'#f8fafc',marginBottom:4}}>{f.type}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>Fraction : {f.fraction} | Durée : {f.duree}<br/>Allocation : {f.allocation}<br/>Condition : {f.condition}</div></div>)}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_CONGE_PARENTAL};
