'use client';
import { useState, useMemo } from 'react';

const PROC_ART60 = {
  id:'art60', icon:'🏛️', categorie:'embauche',
  titre:"Article 60 §7 CPAS — Mise à l'emploi",
  resume:"Le CPAS met un bénéficiaire du RIS à disposition d'un employeur-utilisateur. Le CPAS reste l'employeur juridique et supporte l'essentiel du coût salarial. Coût pour l'entreprise : quasi-nul à très réduit.",
  baseLegale:[
    {ref:"Loi organique CPAS 08/07/1976, art. 60 §7",desc:"Base légale — le CPAS peut employer des bénéficiaires en vue d'ouvrir leurs droits aux prestations sociales"},
    {ref:"Loi 26/05/2002",desc:"Droit à l'intégration sociale — conditions d'octroi du RIS et activation"},
    {ref:"AR 11/07/2002",desc:"Règlement général droit à l'intégration sociale — modalités"},
    {ref:"Circulaire ministérielle 06/09/2002",desc:"Instructions aux CPAS pour les mises à disposition Art. 60§7"},
    {ref:"AR 14/11/2002",desc:"Subside fédéral SPP Intégration Sociale aux CPAS dans le cadre Art. 60§7"},
    {ref:"Code pénal social, art. 181-183",desc:"Sanctions en cas de fraude à la mise à disposition ou substitution de travailleurs"},
  ],
  eligibilite:{
    beneficiaires:["Bénéficiaires du Revenu d'Intégration Sociale (RIS)","Bénéficiaires de l'aide sociale équivalente (étrangers registre des étrangers)","Personnes en médiation de dettes accompagnées par le CPAS","Personnes en parcours de réinsertion socioprofessionnelle CPAS"],
    utilisateurs:["Communes et administrations communales","ASBL et secteur non-marchand","Entreprises privées (PME, grandes entreprises) sous convention","Établissements publics (hôpitaux, écoles, bibliothèques)","Économie sociale et entreprises d'insertion","Autres CPAS (mise à disposition inter-CPAS)"],
    exclusions:["L'utilisateur ne choisit PAS le candidat — c'est le CPAS qui décide","L'utilisateur ne peut PAS licencier — seul le CPAS le peut","Interdiction de substitution : pas de remplacement de travailleurs réguliers licenciés"],
  },
  duree:"Minimum : durée pour ouvrir le droit au chômage (312 à 624 jours selon âge). Renouvelable sans limite.",
  avantages:[
    {rang:"Coût quasi-nul",detail:"Le CPAS prend en charge salaire brut + cotisations. L'utilisateur rembourse 0€ à 500€/mois selon convention et type d'employeur."},
    {rang:"Zéro administration",detail:"Le CPAS gère tout : DIMONA, ONSS, DmfA, fiches de paie, assurance AT, SEPP. Aucune obligation administrative pour l'utilisateur."},
    {rang:"Aucun risque juridique",detail:"En cas de problème, le CPAS gère la rupture. L'utilisateur n'a aucune responsabilité juridique directe."},
    {rang:"Subside fédéral",detail:"Le SPP Intégration Sociale subventionne le CPAS (montant RIS + cotisations) → le CPAS est aussi gagnant."},
    {rang:"Main-d'œuvre motivée",detail:"Les travailleurs Art. 60 sont en parcours d'insertion — souvent très motivés car c'est leur passerelle vers l'emploi."},
    {rang:"Tremplin Activa",detail:"Après Art. 60, le travailleur a des droits au chômage → engagement direct possible avec plan Activa ou premier engagement."},
  ],
  etapes:[
    {n:1,phase:'préparation',titre:"Contacter le service Insertion du CPAS",
     detail:`Prendre contact avec le service "Mise à l'emploi" / "Insertion socioprofessionnelle" / "Article 60" du CPAS de votre commune ou d'une commune voisine.

═══ COMMENT TROUVER LE CPAS ═══
• Chaque commune a son CPAS — site : www.mi-is.be → liste par commune
• Tél : disponible sur le site de la commune
• Bruxelles : 19 CPAS (un par commune)

═══ INFORMATIONS À COMMUNIQUER ═══
1. Description du profil recherché (compétences, formation)
2. Description du poste (tâches, responsabilités)
3. Horaire souhaité (temps plein 38h / temps partiel)
4. Durée souhaitée de la mise à disposition
5. Lieu de travail
6. Personne de contact dans votre entreprise

═══ SÉLECTION DU CANDIDAT ═══
Le CPAS sélectionne et propose un candidat parmi ses bénéficiaires.
✅ Vous pouvez accepter, demander un entretien, ou refuser (avec motivation)
❌ Vous ne pouvez PAS imposer un candidat spécifique

💡 Certains CPAS ont des "cellules emploi" spécialisées : profils administratifs, techniques, logistiques, entretien, accueil, cuisine, informatique, jardinage.`,
     delai:"2 à 6 semaines avant le début souhaité",formulaire:null,ou:"CPAS de la commune — service Insertion / Art. 60",obligatoire:true,duree_estimee:'2-6 semaines'},

    {n:2,phase:'préparation',titre:"Négocier et signer la convention de mise à disposition",
     detail:`Le CPAS et l'utilisateur signent une CONVENTION régissant les conditions de la collaboration.

═══ CONTENU DE LA CONVENTION ═══
1. PARTIES : CPAS (employeur juridique) + utilisateur
2. OBJET : mise à disposition travailleur Art. 60§7
3. DURÉE : date début, durée minimale, conditions renouvellement
4. PROFIL DU POSTE : fonction, tâches, compétences requises
5. HORAIRE : temps plein (38h) ou temps partiel (fraction)
6. LIEU DE TRAVAIL
7. PARTICIPATION FINANCIÈRE de l'utilisateur :
   • ASBL / social : 0€ à 150€/mois
   • PME : 200€ à 500€/mois
   • Grande entreprise : 400€ à 800€/mois
8. ENCADREMENT : personne de contact, tuteur désigné
9. ASSURANCES : AT à charge du CPAS
10. RUPTURE : conditions de fin anticipée
11. ÉVALUATION : entretiens trimestriels CPAS + utilisateur + travailleur

═══ POINTS DE NÉGOCIATION ═══
La participation est NÉGOCIABLE. Les CPAS sont flexibles pour les ASBL.
Certains CPAS offrent un "mois d'essai" gratuit.

⚠️ NE PAS SIGNER avant d'avoir validé le profil du candidat.`,
     delai:"1 à 3 semaines de négociation",formulaire:"Convention de mise à disposition Art. 60§7 (rédigée par CPAS)",ou:"Service juridique du CPAS",obligatoire:true,duree_estimee:'1-3 semaines'},

    {n:3,phase:'préparation',titre:"Rencontrer le candidat proposé par le CPAS",
     detail:`Organiser un entretien pour évaluer l'adéquation candidat/poste.

Vous POUVEZ évaluer :
✅ Compétences techniques, motivation, disponibilité, langues, expérience

Vous NE POUVEZ PAS :
❌ Discriminer (origine, handicap, âge, religion, orientation sexuelle)
❌ Exiger des conditions disproportionnées par rapport au poste

Si le candidat convient → confirmer au CPAS → convention finalisée
Si non → en informer le CPAS avec motivation objective → autre candidat proposé

Le CPAS maintient un accompagnement social permanent : assistant social référent, suivi mensuel, aide aux problèmes personnels, médiation si difficulté au travail.`,
     delai:"1 à 2 semaines",formulaire:null,ou:"Dans vos locaux ou au CPAS",obligatoire:true,duree_estimee:'1-2 semaines'},

    {n:4,phase:'engagement',titre:"Le CPAS établit le contrat (pas l'utilisateur !)",
     detail:`C'est le CPAS — et NON l'utilisateur — qui gère TOUTE l'administration.

═══ CE QUE FAIT LE CPAS ═══
• Rédige le contrat de travail (CDD = durée convention)
• DIMONA IN
• Inscription registre du personnel
• Assurance accidents du travail
• Affiliation SEPP
• Calcul et versement du salaire
• DmfA, PP, fiches de paie
• Pécule de vacances, 13e mois

═══ CE QUE FAIT L'UTILISATEUR ═══
• Accueil sur le lieu de travail
• Instructions de travail et encadrement quotidien
• Outils, équipements, EPI
• Respect sécurité et bien-être
• Communication avec le CPAS en cas de problème

═══ RÉMUNÉRATION (versée par le CPAS) ═══
• Minimum SMMG : ±2.029,88€ brut (2026) ou barème CP si supérieur
• + Chèques-repas (si prévu dans convention)
• + Pécule de vacances
• + 13e mois (si prévu)
• Le travailleur a les MÊMES droits qu'un salarié ordinaire`,
     delai:"Géré par le CPAS — 1 à 2 semaines",formulaire:"Contrat établi par le CPAS (pas par l'utilisateur)",ou:"CPAS — service administratif",obligatoire:true,duree_estimee:'1-2 sem. (CPAS)'},

    {n:5,phase:'engagement',titre:"Accueillir le travailleur — obligations utilisateur",
     detail:`Jour 1 — Checklist d'accueil :

✅ Présentation aux collègues et à l'équipe
✅ Visite des locaux et du poste de travail
✅ Remise équipements (uniforme, EPI, badge, clés)
✅ Explication des tâches et responsabilités
✅ Consignes de sécurité + plan d'évacuation
✅ Présentation du tuteur/parrain désigné
✅ Explication horaires, pauses, réfectoire

═══ TUTEUR / PARRAIN ═══
Fortement recommandé de désigner un tuteur :
• Accompagne le travailleur au quotidien
• Signale les difficultés au responsable et au CPAS
• Participe aux évaluations trimestrielles

═══ BIEN-ÊTRE AU TRAVAIL ═══
Même si le CPAS est employeur juridique, l'utilisateur a des obligations :
• Analyse des risques du poste
• Mise à disposition EPI
• Normes de sécurité
• Signalement immédiat de tout accident au CPAS`,
     delai:"Le 1er jour de travail",formulaire:null,ou:"Dans vos locaux",obligatoire:true,duree_estimee:'1/2 journée'},

    {n:6,phase:'gestion',titre:"Suivi mensuel + évaluations trimestrielles",
     detail:`═══ SUIVI MENSUEL ═══
• Confirmer les jours effectivement prestés
• Signaler toute absence (maladie, absence injustifiée)
• Communiquer tout changement d'horaire ou de poste
• Signaler tout incident ou difficulté

═══ ÉVALUATIONS TRIMESTRIELLES ═══
Le CPAS organise des entretiens : assistant social + tuteur/responsable + travailleur
Objectif : progression, besoins de formation, ajustements

═══ EN CAS DE PROBLÈME ═══
1. En parler avec le travailleur
2. Si persiste → contacter l'assistant social CPAS
3. Le CPAS intervient comme médiateur
4. En dernier recours → le CPAS met fin à la mise à disposition
⚠️ JAMAIS "renvoyer" le travailleur directement — c'est le rôle du CPAS

═══ ACCIDENT DU TRAVAIL ═══
1. Premiers secours immédiats
2. Appeler le CPAS IMMÉDIATEMENT
3. Le CPAS déclare l'AT via son assurance
4. Établir un rapport circonstancié`,
     delai:"Mensuel + trimestriel",formulaire:"Rapport de suivi mensuel (format CPAS)",ou:"En interne + avec le CPAS",obligatoire:true,duree_estimee:'2h/mois'},

    {n:7,phase:'gestion',titre:"Paiement de la participation financière au CPAS",
     detail:`Si la convention prévoit une participation financière, effectuer les paiements selon l'échéancier.

═══ MONTANTS TYPIQUES ═══
• ASBL / social : 0€ à 150€/mois
• PME : 200€ à 500€/mois
• Grande entreprise : 400€ à 800€/mois

═══ COMPARAISON AVEC ENGAGEMENT DIRECT (brut 2.800€) ═══
Engagement direct : 2.800€ + ONSS 25% + AT + SEPP = ±3.800€/mois
Article 60 ASBL : 0€ à 150€/mois → Économie : 3.650€ à 3.800€/mois
Article 60 PME : 200€ à 500€/mois → Économie : 3.300€ à 3.600€/mois

Économie annuelle ASBL : 43.800€ à 45.600€/an
Économie annuelle PME : 39.600€ à 43.200€/an`,
     delai:"Selon échéancier convention",formulaire:"Facture CPAS",ou:"Service comptabilité → virement au CPAS",obligatoire:true,duree_estimee:'15 min/mois'},

    {n:8,phase:'fin',titre:"Fin de mise à disposition — Options de continuation",
     detail:`3 options à la fin de la convention :

═══ OPTION 1 : RENOUVELLEMENT ═══
Demander prolongation au CPAS. Le CPAS évalue si le travailleur a encore besoin de la mesure.
Pas de limite légale au nombre de renouvellements.

═══ OPTION 2 : ENGAGEMENT DIRECT ═══
Engager le travailleur directement :
→ Il a maintenant ses droits au chômage ouverts
→ Peut bénéficier du plan Activa (réduction ONSS + allocation travail)
→ Ou premier engagement si c'est votre 1er travailleur
Avantage : vous le connaissez déjà (période de "test" gratuite)

═══ OPTION 3 : FIN SANS SUITE ═══
La convention prend fin. Le travailleur retourne au CPAS.
Aucune obligation pour l'utilisateur.

═══ DÉLAIS ═══
• Prévenir le CPAS 1 mois avant la fin
• Si engagement direct : prévoir contrat, DIMONA, etc.
• Certificat de travail délivré par le CPAS`,
     delai:"1 mois avant la fin de la convention",formulaire:null,ou:"Contact CPAS — service Insertion",obligatoire:true,duree_estimee:'1-2 semaines'},
  ],
  alertes:[
    {niveau:'critique',texte:"L'utilisateur N'EST PAS l'employeur juridique. Ne JAMAIS signer un contrat de travail avec le travailleur Art. 60 — c'est le rôle exclusif du CPAS."},
    {niveau:'critique',texte:"Ne JAMAIS utiliser un Art. 60 pour remplacer un travailleur régulier licencié — fraude sociale sanctionnée pénalement."},
    {niveau:'important',texte:"Accident du travail → contacter IMMÉDIATEMENT le CPAS. C'est lui qui déclare l'AT via son assurance."},
    {niveau:'important',texte:"Le travailleur Art. 60 a les MÊMES droits qu'un salarié ordinaire : congés, jours fériés, bien-être, protection harcèlement."},
    {niveau:'attention',texte:"Ne jamais 'renvoyer' le travailleur directement. Contacter le CPAS qui gère comme employeur juridique."},
    {niveau:'info',texte:"Après Art. 60 → engagement avec Activa = double avantage. Le travailleur a ses droits au chômage + vous le connaissez déjà."},
  ],
  simulation:{titre:"Comparaison coût — Art. 60 vs engagement direct (2.800€ brut)",lignes:[
    {label:'Coût engagement direct (brut + ONSS + AT + admin)',montant:'±3.800€/mois',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'Coût Art. 60 — ASBL',montant:'0€ à 150€/mois',type:'vert'},
    {label:'Coût Art. 60 — PME',montant:'200€ à 500€/mois',type:'vert'},
    {label:'',montant:'',type:'separateur'},
    {label:'Économie ASBL / an',montant:'43.800€ à 45.600€',type:'vert_bold'},
    {label:'Économie PME / an',montant:'39.600€ à 43.200€',type:'vert_bold'},
    {label:'Économie sur 2 ans (PME)',montant:'79.200€ à 86.400€',type:'vert_bold'},
  ]},
  faq:[
    {q:"Le travailleur Art. 60 compte dans mon effectif pour le premier engagement ?",r:"NON. Le CPAS est l'employeur juridique. Le travailleur n'apparaît pas dans votre DIMONA ni DmfA. Il ne compte PAS dans votre effectif."},
    {q:"Je peux choisir moi-même le candidat ?",r:"Non. Le CPAS sélectionne et propose. Vous pouvez refuser avec motivation et en demander un autre, mais pas imposer votre candidat."},
    {q:"Le travailleur tombe malade — que faire ?",r:"Informer le CPAS. Le salaire garanti est à charge du CPAS. La mutuelle prend le relais ensuite."},
    {q:"Puis-je mettre fin avant la date ?",r:"Oui, selon les conditions de la convention (généralement 1 mois de préavis au CPAS). Le CPAS réaffectera le travailleur."},
    {q:"Après Art. 60, je veux l'engager — quelles aides ?",r:"Le travailleur a maintenant ses droits au chômage. Il peut demander une carte Activa (réduction ONSS + allocation). Ou premier engagement si c'est votre 1er travailleur."},
    {q:"Heures supplémentaires possibles ?",r:"Oui, mêmes conditions que tout travailleur. Les heures sup sont gérées et payées par le CPAS. Prévenir le CPAS à l'avance."},
  ],
  formulaires:[
    {nom:"Liste des CPAS par commune",url:"https://www.mi-is.be",type:'en_ligne'},
    {nom:"SPP Intégration Sociale — Art. 60§7",url:"https://www.mi-is.be/fr/themes/emploi/article-60-7",type:'en_ligne'},
  ],
};

// ═══ COMPOSANT UI (pattern identique aux autres procédures) ═══
export default function ProcedureArt60(){const P=PROC_ART60;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);
const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'préparation',l:'Préparation',i:'🔍'},{id:'engagement',l:'Engagement',i:'✍️'},{id:'gestion',l:'Gestion',i:'📆'},{id:'fin',l:'Fin & suite',i:'🔄'}];
const og=[{id:'etapes',l:'Étapes A→Z',i:'📋'},{id:'avantages',l:'Avantages',i:'💰'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];
const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}>
<div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p><div style={{marginTop:12,display:'flex',gap:8,flexWrap:'wrap'}}><span style={{fontSize:12,color:'#64748b',background:'#1e293b',padding:'4px 10px',borderRadius:6}}>⏱️ {P.duree}</span><span style={{fontSize:12,color:'#64748b',background:'#1e293b',padding:'4px 10px',borderRadius:6}}>💰 Économie : 39.600€ à 45.600€/an</span></div></div>
<div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t} étapes</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div>
<div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='avantages'&&<div><h2 style={s.st2}>💰 Avantages</h2>{P.avantages.map((a,i)=><div key={i} style={s.cd}><div style={{fontSize:15,fontWeight:700,color:'#f8fafc',marginBottom:4}}>{a.rang}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>{a.detail}</div></div>)}<div style={{...s.cd,marginTop:16,background:'#22c55e08',border:'1px solid #22c55e20'}}><div style={{fontSize:14,fontWeight:600,color:'#4ade80',marginBottom:8}}>👤 Bénéficiaires</div>{P.eligibilite.beneficiaires.map((b,i)=><div key={i} style={{fontSize:13,color:'#94a3b8',paddingLeft:16,marginBottom:3}}>• {b}</div>)}<div style={{fontSize:14,fontWeight:600,color:'#60a5fa',marginTop:12,marginBottom:8}}>🏢 Utilisateurs possibles</div>{P.eligibilite.utilisateurs.map((e,i)=><div key={i} style={{fontSize:13,color:'#94a3b8',paddingLeft:16,marginBottom:3}}>• {e}</div>)}</div></div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_ART60};
