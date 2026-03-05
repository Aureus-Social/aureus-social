'use client';
import { useState, useMemo } from 'react';

const PROC_MITEMPS_THERAPEUTIQUE = {
  id:'mitemps_therapeutique', icon:'🏥', categorie:'regime',
  titre:"Mi-temps thérapeutique — Reprise progressive du travail",
  resume:"Reprise partielle du travail après une incapacité, avec maintien d'une indemnité de la mutuelle pour les heures non prestées. Le travailleur reprend progressivement (50%, 60%, 80%) tout en conservant une partie de ses indemnités AMI. Nécessite l'accord du médecin-conseil de la mutuelle.",
  baseLegale:[
    {ref:"AR 03/07/1996, art. 100 §2",desc:"Reprise partielle du travail autorisée avec maintien des indemnités AMI — conditions et procédure"},
    {ref:"Loi AMI 14/07/1994, art. 100",desc:"Assurance maladie-invalidité — travail autorisé pendant l'incapacité"},
    {ref:"AR 01/07/2006",desc:"Modalités de la reprise progressive — calcul des indemnités maintenues"},
    {ref:"Loi 05/03/2017 (travail faisable)",desc:"Trajet de réintégration des travailleurs en incapacité de longue durée"},
    {ref:"AR 28/10/2016",desc:"Trajet de réintégration — rôle du médecin du travail et du médecin-conseil"},
    {ref:"Code du bien-être au travail, Livre I Titre 4 Ch.VI",desc:"Réintégration des travailleurs en incapacité — obligations de l'employeur"},
  ],
  etapes:[
    {n:1,phase:'préparation',titre:"Le travailleur obtient l'accord du médecin traitant",
     detail:`Le travailleur en incapacité de travail souhaite reprendre partiellement.

═══ INITIATIVE ═══
La reprise peut être initiée par :
• Le travailleur lui-même (le plus fréquent)
• Le médecin traitant (recommandation)
• Le médecin du travail (dans le cadre du trajet de réintégration)
• Le médecin-conseil de la mutuelle (convocation)

═══ CERTIFICAT MÉDICAL ═══
Le médecin traitant établit un certificat médical qui :
• Confirme que le travailleur PEUT reprendre partiellement
• Précise la fraction de reprise recommandée (50%, 60%, 80%)
• Indique la durée estimée de la reprise progressive
• Mentionne les éventuelles restrictions (pas de port de charges, pas de nuit, etc.)
• Peut recommander un travail adapté

═══ DISTINCTION IMPORTANTE ═══
• Reprise progressive ART. 100 §2 : le travailleur est TOUJOURS en incapacité reconnue → indemnités mutuelle maintenues
• Reprise complète : le travailleur est GUÉRI → plus d'indemnités mutuelle
• Trajet de réintégration : procédure formelle initiée par l'employeur OU le travailleur → plan de réintégration obligatoire`,
     delai:"Pendant l'incapacité — dès que le travailleur se sent prêt",formulaire:"Certificat médical du médecin traitant",ou:"Médecin traitant",obligatoire:true,duree_estimee:'1 consultation'},

    {n:2,phase:'préparation',titre:"Demande d'autorisation au médecin-conseil de la mutuelle",
     detail:`Le travailleur DOIT obtenir l'autorisation PRÉALABLE du médecin-conseil de sa mutuelle.

═══ PROCÉDURE ═══
1. Le travailleur contacte sa mutuelle (sa mutuelle)
2. Il introduit une demande de "reprise partielle du travail" (art. 100 §2)
3. Il joint le certificat du médecin traitant
4. Le médecin-conseil convoque le travailleur pour un examen
5. Le médecin-conseil évalue :
   • L'état de santé réel
   • La capacité de reprise partielle
   • La fraction de reprise appropriée
   • La durée autorisée
6. Le médecin-conseil AUTORISE ou REFUSE la reprise partielle

═══ DÉCISION DU MÉDECIN-CONSEIL ═══
AUTORISATION :
• Précise la fraction autorisée (ex: mi-temps = 50%)
• Précise la durée (ex: 3 mois, renouvelable)
• Précise les éventuelles conditions (pas de travail de nuit, travail adapté)
• L'autorisation est INDISPENSABLE avant toute reprise

REFUS :
• Le travailleur reste en incapacité totale
• Il peut introduire un recours auprès du tribunal du travail

═══ CALCUL DES INDEMNITÉS MAINTENUES ═══
Pendant la reprise partielle, le travailleur reçoit :
• Un SALAIRE de l'employeur pour les heures prestées
• Une INDEMNITÉ de la mutuelle pour les heures non prestées (réduite mais maintenue)
• Le cumul est plafonné pour éviter que le total dépasse le revenu antérieur

═══ DÉLAI ═══
• Introduire la demande 2 à 4 semaines avant la date de reprise souhaitée
• Le médecin-conseil statue généralement dans les 2 semaines`,
     delai:"2 à 4 semaines avant la reprise souhaitée",formulaire:"Formulaire de demande de reprise partielle (mutuelle spécifique)",ou:"Mutuelle du travailleur — médecin-conseil",obligatoire:true,duree_estimee:'2-4 semaines'},

    {n:3,phase:'préparation',titre:"Accord de l'employeur + aménagement du poste",
     detail:`L'employeur doit ACCEPTER la reprise partielle et organiser le travail.

═══ L'EMPLOYEUR PEUT-IL REFUSER ? ═══
• En principe : OUI, l'employeur n'est pas légalement obligé d'accepter
• MAIS : un refus non motivé peut être considéré comme discriminatoire
• Dans le cadre d'un trajet de réintégration formel : l'employeur est tenu de fournir un travail adapté ou de motiver l'impossibilité
• En pratique : la grande majorité des employeurs acceptent

═══ ORGANISATION DU TRAVAIL ═══
Définir avec le travailleur :
1. Fraction de reprise : 50%, 60%, 80% (selon autorisation médecin-conseil)
2. Jours et horaires de travail (adaptation de l'horaire existant)
3. Tâches : identiques ou adaptées selon les restrictions médicales
4. Durée prévue de la reprise progressive
5. Conditions particulières (pas de port de charges, pas de nuit, etc.)

═══ AVENANT AU CONTRAT ═══
Rédiger un avenant temporaire au contrat de travail :
• Mention de la reprise progressive (art. 100 §2)
• Fraction de reprise
• Horaire adapté
• Durée (en lien avec l'autorisation du médecin-conseil)
• Caractère TEMPORAIRE (retour au temps plein ou réévaluation)

═══ VISITE DE PRÉ-REPRISE ═══
Avant la reprise, le travailleur peut demander une visite de pré-reprise auprès du médecin du travail (SEPP) :
• Évaluation de l'aptitude au poste
• Recommandations d'aménagement
• Cette visite est FACULTATIVE mais fortement recommandée`,
     delai:"1 à 2 semaines avant la date de reprise",formulaire:"Avenant temporaire au contrat de travail",ou:"En interne + médecin du travail (SEPP)",obligatoire:true,duree_estimee:'1-2 semaines'},

    {n:4,phase:'engagement',titre:"Formalités administratives — DIMONA, DmfA, mutuelle",
     detail:`═══ DIMONA ═══
• Pas de nouvelle DIMONA (le contrat de travail est toujours actif)
• Le travailleur était en incapacité, il reprend partiellement

═══ DMFA ═══
• Déclarer les heures EFFECTIVEMENT prestées
• Le facteur Q change temporairement (ex: de 38h à 19h pour un mi-temps)
• Code de prestation : heures prestées + heures maladie (les heures non prestées restent en "maladie")
• La mutuelle verse les indemnités pour les heures de maladie

═══ COMMUNICATION À LA MUTUELLE ═══
L'employeur DOIT informer la mutuelle du début de la reprise partielle :
• Formulaire spécifique (selon mutuelle)
• Ou attestation de l'employeur confirmant :
  - Date de début de la reprise
  - Fraction de reprise (heures/semaine)
  - Horaire adapté
  - Rémunération pour les heures prestées

═══ CALCUL DES INDEMNITÉS (mutuelle) ═══
La mutuelle calcule le montant des indemnités maintenues :
• Base = indemnité normale d'incapacité
• Moins un pourcentage lié aux revenus de la reprise
• Formule complexe : la mutuelle applique un plafond de cumul
• En général, le travailleur conserve ±30-50% de ses indemnités

═══ FORMULAIRE C3-TRAVAILLEUR ═══
Si le travailleur touchait aussi du chômage (cas rare) : formulaire C3 adapté.`,
     delai:"Le jour de la reprise effective",formulaire:"Attestation employeur + formulaire mutuelle",ou:"Mutuelle + DmfA",obligatoire:true,duree_estimee:'1h'},

    {n:5,phase:'gestion',titre:"Calcul de paie pendant la reprise progressive",
     detail:`Le calcul de paie combine salaire employeur + indemnité mutuelle.

═══ EXEMPLE — Reprise à 50% (mi-temps thérapeutique) ═══

Salaire brut temps plein : 3.200€
Période : incapacité → reprise à 50%

SALAIRE EMPLOYEUR (pour les heures prestées) :
  Brut 50% : 1.600,00€
  ONSS travailleur (13,07%) : -209,12€
  Imposable : 1.390,88€
  PP (±22%) : -305,99€
  NET employeur : ±1.084,89€

INDEMNITÉ MUTUELLE (pour les heures non prestées) :
  Indemnité maladie base (60% du salaire plafonné) : ±1.120€/mois
  Réduction pour reprise partielle : ±-450€
  Indemnité nette maintenue : ±670€/mois

TOTAL REÇU PAR LE TRAVAILLEUR :
  Salaire net : 1.084,89€
  + Indemnité mutuelle : ±670€
  = TOTAL : ±1.754,89€

vs En incapacité totale : ±1.120€/mois d'indemnité seule
→ Le travailleur gagne ±635€/mois de PLUS en reprenant à mi-temps

═══ COÛT EMPLOYEUR ═══
  Brut : 1.600€ + ONSS patronal 25% = 2.000€
  + Admin, SEPP, etc. = ±2.150€/mois
  → C'est 50% du coût normal, pas plus.

═══ PARTICULARITÉS PAIE ═══
• Les jours non prestés = maladie (pas de salaire garanti — mutuelle)
• Pécule de vacances : proportionnel aux heures prestées
• 13e mois : proportionnel
• Jours fériés tombant un jour presté : payés par l'employeur
• Jours fériés tombant un jour non presté : indemnité mutuelle`,
     delai:"Chaque mois",formulaire:"Fiche de paie adaptée",ou:null,obligatoire:true,duree_estimee:'20 min/mois'},

    {n:6,phase:'gestion',titre:"Suivi médical + renouvellement de l'autorisation",
     detail:`═══ SUIVI PAR LE MÉDECIN-CONSEIL ═══
Le médecin-conseil réévalue régulièrement :
• Tous les 1 à 3 mois (selon la durée autorisée)
• Le travailleur peut être convoqué pour un examen
• L'autorisation est renouvelée si l'état de santé le justifie
• La fraction peut être AUGMENTÉE progressivement (50% → 60% → 80% → 100%)

═══ ÉVOLUTION POSSIBLE ═══
1. AMÉLIORATION → augmentation progressive de la fraction
   50% → 60% → 80% → reprise à 100%
   Chaque changement nécessite une nouvelle autorisation du médecin-conseil

2. STABILISATION → maintien de la fraction
   Le mi-temps thérapeutique peut durer des MOIS voire des ANNÉES
   Renouvellement périodique par le médecin-conseil

3. RECHUTE → retour en incapacité totale
   Le travailleur retombe malade → certificat médical → retour en incapacité
   Les indemnités repassent à 100% de la base maladie

═══ RÔLE DE L'EMPLOYEUR ═══
• Suivre l'évolution et adapter l'horaire si la fraction change
• Maintenir un dialogue avec le travailleur
• Transmettre les informations à la mutuelle en cas de changement
• Modifier la DmfA si la fraction change

═══ TRAJET DE RÉINTÉGRATION FORMEL ═══
Si la reprise progressive ne suffit pas ou si l'incapacité se prolonge :
• L'employeur OU le travailleur peut demander un trajet de réintégration formel
• Le médecin du travail évalue et propose un plan
• 5 décisions possibles (retour au même poste, poste adapté, autre poste, incapacité définitive)`,
     delai:"Tous les 1 à 3 mois — renouvellement avant expiration",formulaire:"Renouvellement autorisation (mutuelle)",ou:"Médecin-conseil mutuelle + médecin du travail",obligatoire:true,duree_estimee:'1 consultation/renouvellement'},

    {n:7,phase:'gestion',titre:"Fin de la reprise progressive — 3 scénarios",
     detail:`═══ SCÉNARIO 1 : GUÉRISON — RETOUR À TEMPS PLEIN ═══
Le travailleur est déclaré apte à reprendre à temps plein :
• Le médecin-conseil met fin à l'incapacité
• L'avenant temporaire prend fin
• Retour au contrat initial (temps plein)
• Les indemnités mutuelle cessent
• DmfA : retour au facteur Q normal

═══ SCÉNARIO 2 : INCAPACITÉ DÉFINITIVE — MAINTIEN PARTIEL ═══
Le travailleur ne pourra plus reprendre à temps plein :
• Le médecin-conseil constate une incapacité permanente partielle
• Le mi-temps thérapeutique peut devenir PERMANENT
• Ou : passage en invalidité avec travail autorisé
• L'avenant peut devenir un avenant définitif (modification du contrat)
• Discussion avec le travailleur : souhaite-t-il un contrat à temps partiel ?

═══ SCÉNARIO 3 : RECHUTE — RETOUR EN INCAPACITÉ TOTALE ═══
Le travailleur retombe en incapacité :
• Certificat médical → incapacité totale
• Les indemnités repassent à 100% de la base
• Pas de salaire garanti pour cette rechute (déjà en incapacité)
• L'avenant est suspendu
• Possibilité d'une nouvelle reprise progressive ultérieurement

═══ LICENCIEMENT PENDANT MI-TEMPS THÉRAPEUTIQUE ═══
⚠️ Le travailleur en reprise progressive bénéficie de la PROTECTION contre le licenciement discriminatoire :
• Un licenciement motivé par l'état de santé = discrimination
• Le licenciement est possible pour d'autres motifs (économiques, faute grave)
• Préavis calculé sur base du contrat INITIAL (temps plein), pas sur le mi-temps thérapeutique`,
     delai:"Selon l'évolution médicale",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Variable'},

    {n:8,phase:'gestion',titre:"Points de vigilance RH — Droits et obligations",
     detail:`═══ DROITS DU TRAVAILLEUR EN REPRISE PROGRESSIVE ═══
• Droit aux mêmes conditions de travail (proportionnelles)
• Droit à la protection contre la discrimination liée au handicap/maladie
• Droit de demander des aménagements raisonnables
• Droit de refuser des tâches incompatibles avec les restrictions médicales
• Droit au préavis sur base du contrat INITIAL (pas du mi-temps)
• Droit à la formation (proportionnel)
• Droit aux élections sociales (ancienneté = contrat initial)

═══ OBLIGATIONS DE L'EMPLOYEUR ═══
• Fournir un travail adapté conformément à l'autorisation
• Respecter les restrictions médicales
• Transmettre les informations correctes à la mutuelle et à l'ONSS
• Ne pas discriminer (pas de mise à l'écart, pas de pression pour reprendre à temps plein)
• Calculer le préavis sur le contrat initial (pas sur le mi-temps)
• Maintenir l'accès aux avantages extra-légaux (proportionnels)

═══ PIÈGES À ÉVITER ═══
❌ Ne pas forcer le travailleur à reprendre plus que ce que le médecin-conseil autorise
❌ Ne pas calculer le préavis sur la base du mi-temps
❌ Ne pas supprimer les avantages (chèques-repas = par jour presté, OK)
❌ Ne pas oublier de déclarer correctement en DmfA (heures prestées + heures maladie)
❌ Ne pas négliger le renouvellement de l'autorisation (risque de perte d'indemnités)`,
     delai:"Pendant toute la durée de la reprise progressive",formulaire:null,ou:null,obligatoire:true,duree_estimee:'Vigilance permanente'},
  ],
  alertes:[
    {niveau:'critique',texte:"L'autorisation PRÉALABLE du médecin-conseil de la mutuelle est OBLIGATOIRE. Sans autorisation → le travailleur perd ses indemnités ET est considéré comme ayant repris à temps plein."},
    {niveau:'critique',texte:"Préavis = calculé sur le contrat INITIAL (temps plein), jamais sur le mi-temps thérapeutique. Erreur fréquente et coûteuse !"},
    {niveau:'important',texte:"L'employeur DOIT informer la mutuelle du début de la reprise et de tout changement de fraction. Défaut d'information → risque de remboursement des indemnités."},
    {niveau:'important',texte:"Le travailleur est toujours en INCAPACITÉ reconnue pendant la reprise progressive. Il n'est PAS guéri. Ne pas le traiter comme un travailleur à temps partiel ordinaire."},
    {niveau:'attention',texte:"Le mi-temps thérapeutique peut durer des MOIS ou des ANNÉES. Prévoir une gestion RH de longue durée et des renouvellements réguliers."},
    {niveau:'attention',texte:"En cas de rechute, pas de nouveau salaire garanti (le travailleur est déjà en incapacité). Les indemnités mutuelle repassent à 100%."},
    {niveau:'info',texte:"Le travailleur gagne financièrement à reprendre partiellement : salaire + indemnité réduite > indemnité seule. C'est un argument de motivation."},
  ],
  simulation:{titre:"Mi-temps thérapeutique — Finances travailleur (3.200€ brut TP)",lignes:[
    {label:'EN INCAPACITÉ TOTALE :',montant:'',type:'neutre'},
    {label:'  Indemnité mutuelle nette (60%)',montant:'±1.120€/mois',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'EN REPRISE 50% (mi-temps thérapeutique) :',montant:'',type:'neutre'},
    {label:'  Salaire net employeur (50%)',montant:'±1.085€/mois',type:'vert'},
    {label:'  Indemnité mutuelle maintenue',montant:'±670€/mois',type:'vert'},
    {label:'  TOTAL travailleur',montant:'±1.755€/mois',type:'vert_bold'},
    {label:'  Gain vs incapacité totale',montant:'+635€/mois',type:'vert_bold'},
    {label:'',montant:'',type:'separateur'},
    {label:'COÛT EMPLOYEUR :',montant:'',type:'neutre'},
    {label:'  Coût 50% du temps',montant:'±2.150€/mois',type:'neutre'},
    {label:'  vs coût temps plein',montant:'±4.300€/mois',type:'neutre'},
    {label:'  Économie employeur',montant:'2.150€/mois (-50%)',type:'vert_bold'},
  ]},
  faq:[
    {q:"L'employeur peut-il refuser la reprise progressive ?",r:"Oui en principe, mais un refus non motivé peut être discriminatoire. Dans le cadre d'un trajet de réintégration formel, l'employeur doit fournir un travail adapté ou justifier l'impossibilité."},
    {q:"Le travailleur peut-il reprendre chez un AUTRE employeur ?",r:"Oui ! L'art. 100 §2 permet la reprise partielle chez un autre employeur si le médecin-conseil l'autorise. Le contrat initial reste suspendu."},
    {q:"Comment calculer les vacances pendant le mi-temps thérapeutique ?",r:"Proportionnellement aux heures effectivement prestées. Les jours en incapacité sont assimilés partiellement pour le calcul du pécule de vacances (via les jours AMI)."},
    {q:"Le mi-temps thérapeutique peut-il durer indéfiniment ?",r:"En théorie oui, tant que le médecin-conseil renouvelle l'autorisation. En pratique, la mutuelle réévalue régulièrement et peut proposer un trajet de réintégration formel."},
    {q:"Le travailleur en mi-temps thérapeutique a-t-il droit aux chèques-repas ?",r:"Oui, pour les jours effectivement prestés. Les jours non prestés (maladie) ne donnent pas droit aux chèques-repas."},
    {q:"Que se passe-t-il si le travailleur reprend sans autorisation de la mutuelle ?",r:"Il perd ses indemnités AMI rétroactivement. Il est considéré comme ayant repris le travail à 100%. Risque de récupération des indemnités déjà versées par la mutuelle."},
  ],
  formulaires:[
    {nom:"INAMI — Reprise progressive du travail",url:"https://www.inami.fgov.be/fr/themes/incapacite-travail/reprendre-travail",type:'en_ligne'},
    {nom:"SPF Emploi — Trajet de réintégration",url:"https://emploi.belgique.be/fr/themes/bien-etre-au-travail/la-reintegration-des-travailleurs-en-incapacite-de-travail",type:'en_ligne'},
  ],
};

export default function ProcedureMiTempsTherapeutique(){const P=PROC_MITEMPS_THERAPEUTIQUE;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);
const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'préparation',l:'Préparation',i:'🔍'},{id:'engagement',l:'Engagement',i:'✍️'},{id:'gestion',l:'Gestion',i:'📆'}];
const og=[{id:'etapes',l:'Étapes A→Z',i:'📋'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];
const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_MITEMPS_THERAPEUTIQUE};
