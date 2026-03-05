'use client';
import { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// PROCÉDURE 5/8 : FLEXI-JOB
// ═══════════════════════════════════════════════════════════════════════════════

const PROC_FLEXIJOB = {
  id:'flexijob', icon:'⚡', categorie:'embauche',
  titre:"Flexi-job — Travail flexible (horeca, commerce, etc.)",
  resume:"Système de travail flexible avec cotisation patronale unique de 28% et salaire NET = BRUT pour le travailleur (pas d'ONSS travailleur, pas de PP). Élargi en 2024 à de nombreux secteurs. Le flexi-travailleur doit avoir un emploi principal (4/5e minimum) ou être pensionné.",
  baseLegale:[
    {ref:"Loi-programme 16/11/2015, art. 2-13",desc:"Introduction du régime flexi-job dans le secteur horeca"},
    {ref:"Loi 17/03/2019",desc:"Extension des flexi-jobs au commerce de détail"},
    {ref:"Loi-programme 26/12/2022",desc:"Extension massive des flexi-jobs à de nouveaux secteurs (entrée en vigueur 01/01/2024)"},
    {ref:"AR 15/01/2024",desc:"Liste des commissions paritaires autorisées pour les flexi-jobs"},
    {ref:"Loi 28/12/2023 (portant dispositions diverses)",desc:"Plafond fiscal de 12.000€/an pour les flexi-revenus (hors pensionnés)"},
    {ref:"AR 07/06/2015",desc:"Conditions d'exécution du contrat-cadre flexi-job et de la DIMONA FLX"},
    {ref:"Instructions ONSS 2024/2",desc:"Instructions administratives flexi-jobs — modalités DmfA et codes"},
  ],
  eligibilite:{
    travailleurs:[
      "Travailleur salarié à au moins 4/5e temps (80%) chez un AUTRE employeur au trimestre T-3 ou T-2",
      "Pensionné (pension de retraite légale effective) — pas de condition d'emploi principal",
      "Travailleur indépendant à titre principal (depuis 2024) — sous conditions",
      "Étudiant jobiste : NON (exclu du régime flexi-job)",
      "Demandeur d'emploi : NON (pas d'emploi principal 4/5e)",
    ],
    secteurs_autorises:[
      "CP 118 — Industrie alimentaire",
      "CP 119 — Commerce alimentaire",
      "CP 201 — Commerce de détail indépendant",
      "CP 202 — Commerce de détail alimentation",
      "CP 302 — Industrie hôtelière (horeca) ★ secteur historique",
      "CP 303 — Industrie cinématographique",
      "CP 304 — Spectacle",
      "CP 311 — Grandes entreprises de vente au détail",
      "CP 312 — Grands magasins",
      "CP 314 — Coiffure et soins de beauté",
      "CP 322 — Travail intérimaire (pour mise à disposition dans secteurs autorisés)",
      "CP 330 — Établissements et services de santé",
      "CP 118.03 — Boulangeries",
      "Secteur public : certaines institutions de soins (depuis 2024)",
      "Sport : clubs sportifs (CP 223 — depuis 2024)",
      "Culture : institutions culturelles (depuis 2024)",
      "Enseignement : certains établissements (depuis 2024)",
    ],
    exclusions:[
      "Le flexi-travailleur ne peut PAS faire un flexi-job chez son propre employeur principal",
      "Pas de flexi-job si en incapacité de travail (maladie/accident)",
      "Pas de flexi-job pendant un crédit-temps à temps plein",
      "Pas de flexi-job dans un secteur non autorisé (vérifier la CP)",
      "Pas de flexi-job pour les étudiants jobistes",
    ],
  },
  duree:"Pas de limite de durée — tant que la condition d'emploi principal (4/5e) est remplie ou que le pensionné conserve sa pension.",
  avantages:[
    {rang:"NET = BRUT pour le travailleur",detail:"Le flexi-salaire est EXONÉRÉ d'ONSS travailleur et de précompte professionnel. Le travailleur reçoit 100% du salaire brut en net. Exonéré d'impôt jusqu'à 12.000€/an (hors pensionnés = illimité)."},
    {rang:"Cotisation patronale unique de 28%",detail:"L'employeur paie une cotisation spéciale de 28% sur le flexi-salaire (au lieu de ±25% ONSS + PP + CSSS). C'est un forfait all-in simplifié."},
    {rang:"Flexibilité horaire totale",detail:"Pas d'horaire fixe obligatoire — système de 'contrat-cadre' + prestations à la demande. Idéal pour les pics d'activité."},
    {rang:"Pas de prime de fin d'année obligatoire",detail:"Le flexi-travailleur n'a PAS droit aux avantages extra-légaux du secteur (sauf si la CP le prévoit explicitement pour les flexi-jobs)."},
    {rang:"Flexi-pécule de vacances inclus",detail:"Le flexi-salaire inclut un flexi-pécule de vacances de 7,67% calculé et payé par l'ONSS. Pas de calcul séparé."},
    {rang:"Simplicité administrative",detail:"DIMONA FLX simplifiée (par jour ou par période) — DmfA avec code flexi-job — pas de fiche de paie classique obligatoire."},
  ],
  etapes:[
    {n:1,phase:'préparation',titre:"Vérifier que votre secteur autorise les flexi-jobs",
     detail:`Les flexi-jobs ne sont autorisés que dans certaines commissions paritaires (CP).

═══ SECTEURS AUTORISÉS (liste 2024-2026) ═══

★ HISTORIQUES (depuis 2015-2019) :
• CP 302 — Horeca (restaurants, cafés, hôtels, traiteurs)
• CP 118 — Industrie alimentaire
• CP 119 — Commerce alimentaire
• CP 201 — Commerce de détail indépendant
• CP 202 — Commerce de détail alimentation
• CP 311 — Grandes entreprises de vente au détail
• CP 312 — Grands magasins

★ EXTENSION 2024 :
• CP 314 — Coiffure et soins de beauté
• CP 330 — Établissements et services de santé
• CP 303/304 — Cinéma et spectacle
• CP 223 — Sport
• Culture et enseignement (certains établissements)
• Secteur public : institutions de soins

═══ COMMENT VÉRIFIER VOTRE CP ═══
1. Consultez votre numéro ONSS → la CP est renseignée
2. Ou vérifiez sur le portail de la sécurité sociale
3. En cas de doute : contacter l'ONSS ou votre secrétariat social

⚠️ Si votre CP n'est PAS dans la liste → les flexi-jobs sont INTERDITS dans votre secteur.`,
     delai:"Avant toute démarche",formulaire:null,ou:"Portail sécurité sociale → répertoire employeur → CP",obligatoire:true,duree_estimee:'15 min'},

    {n:2,phase:'préparation',titre:"Vérifier l'éligibilité du flexi-travailleur",
     detail:`Le flexi-travailleur doit remplir des conditions STRICTES.

═══ CONDITION PRINCIPALE : EMPLOI 4/5e AU TRIMESTRE T-3 OU T-2 ═══

Le travailleur doit avoir été occupé à au moins 80% (4/5e temps) chez un AUTRE employeur pendant le trimestre T-3 (ou T-2 si T-3 pas encore vérifié).

Exemple : pour un flexi-job en T2 2026 (avril-juin) :
→ Vérification au T4 2025 (octobre-décembre) ou T1 2026 (janvier-mars)
→ Le travailleur devait être à 4/5e chez un autre employeur

═══ EXCEPTIONS ═══
• Pensionnés : PAS besoin d'emploi principal. La pension effective suffit.
• Indépendants à titre principal (depuis 2024) : sous conditions

═══ VÉRIFICATION ═══
• L'ONSS vérifie automatiquement via la DmfA du trimestre de référence
• L'employeur flexi-job n'a pas accès direct à cette vérification
• En cas de doute : demander au travailleur une attestation de son employeur principal

═══ INTERDICTIONS ═══
❌ Le travailleur ne peut PAS faire un flexi-job chez son propre employeur principal
❌ Pas pendant une incapacité de travail ou un crédit-temps à temps plein
❌ Pas pour les étudiants jobistes (régime étudiant = distinct)
❌ Pas pour les demandeurs d'emploi sans emploi principal`,
     delai:"Avant engagement",formulaire:null,ou:"Vérification auprès du travailleur + ONSS automatique",obligatoire:true,duree_estimee:'30 min'},

    {n:3,phase:'engagement',titre:"Signer le contrat-cadre flexi-job",
     detail:`Le flexi-job fonctionne avec un système en 2 niveaux : le CONTRAT-CADRE + les prestations ponctuelles.

═══ CONTRAT-CADRE ═══
Document ÉCRIT et OBLIGATOIRE — signé AVANT la 1ère prestation.

Contenu obligatoire :
• Identité des parties (employeur + flexi-travailleur)
• Description générale de la fonction
• Flexi-salaire horaire convenu (≥ minimum légal)
• Modalités de contact pour les prestations (appel, SMS, app, etc.)
• Durée du contrat-cadre (CDI ou CDD)
• Conditions de rupture du contrat-cadre

═══ FLEXI-SALAIRE MINIMUM ═══
• Minimum légal horaire (2026) : ±12,05€/h brut
  (indexé annuellement — vérifier le montant actualisé)
• Le flexi-salaire peut être PLUS élevé que le minimum
• Le flexi-pécule de vacances (7,67%) est payé en plus par l'ONSS

═══ PRESTATIONS PONCTUELLES ═══
Pour chaque prestation effective :
• Le travailleur confirme sa disponibilité (oral, SMS, app)
• L'employeur enregistre la prestation via DIMONA FLX
• Pas besoin d'un nouveau contrat écrit à chaque prestation

═══ ATTENTION ═══
• Le contrat-cadre doit être signé AVANT la 1ère prestation
• Conserver le contrat-cadre pendant 5 ans après la fin
• En l'absence de contrat-cadre → requalification en contrat ordinaire`,
     delai:"Signé AVANT la 1ère prestation flexi-job",formulaire:"Contrat-cadre flexi-job (écrit obligatoire)",ou:"Modèle Aureus Social Pro → Contrats Légaux / Secrétariat social",obligatoire:true,duree_estimee:'1 heure'},

    {n:4,phase:'engagement',titre:"DIMONA FLX — Déclaration par jour ou par période",
     detail:`La DIMONA flexi-job a un type spécifique : FLX.

═══ DEUX MODES DE DÉCLARATION ═══

MODE 1 — DIMONA JOURNALIÈRE (recommandé pour prestations irrégulières) :
• Déclaration IN et OUT chaque jour de prestation
• Heures de début et de fin
• Idéal pour : horeca, événements, extras ponctuels

MODE 2 — DIMONA PAR PÉRIODE (pour prestations régulières) :
• Déclaration IN au début de la période
• DIMONA OUT à la fin de la période
• Idéal pour : contrats de plusieurs semaines/mois

═══ CONTENU DE LA DIMONA FLX ═══
• Type : FLX
• NISS du flexi-travailleur
• Date de début (et de fin si connue)
• Heures de début et de fin (mode journalier)
• Numéro ONSS employeur

═══ DÉLAI ═══
La DIMONA FLX doit être effectuée AVANT le début de chaque prestation.

═══ SANCTIONS ═══
• Non-déclaration : amende 2.400€ à 24.000€
• Prestation non déclarée = travail au noir
• Requalification possible en contrat ordinaire`,
     delai:"AVANT chaque prestation (jour même au plus tard)",formulaire:"DIMONA type FLX",ou:"www.socialsecurity.be → DIMONA → type FLX",obligatoire:true,duree_estimee:'5 min/prestation'},

    {n:5,phase:'engagement',titre:"Calcul de paie — Cotisation patronale 28% + salaire net = brut",
     detail:`Le calcul flexi-job est TRÈS SIMPLIFIÉ.

═══ CALCUL ═══

Flexi-salaire horaire : 14€/h (exemple)
Heures prestées dans le mois : 60h

  Flexi-salaire brut : 60h × 14€ = 840,00€
  ONSS travailleur : 0,00€ (exonéré)
  Précompte professionnel : 0,00€ (exonéré)
  ─────────────────────────────────────
  NET versé au travailleur : 840,00€ (= 100% du brut)

  Cotisation patronale (28%) : 840 × 28% = 235,20€
  ─────────────────────────────────────
  Coût total employeur : 1.075,20€

En plus : le flexi-pécule de vacances (7,67%) est calculé et payé par l'ONSS directement au travailleur.

═══ COMPARAISON AVEC UN CONTRAT ORDINAIRE ═══

Même exemple (60h × 14€ = 840€ brut) en contrat ordinaire :
  ONSS travailleur (13,07%) : -109,79€
  PP (±18%) : -131,44€
  NET : ±598,77€
  ONSS patronal (25%) : 210€
  Coût employeur : ±1.050€

FLEXI : travailleur reçoit 840€ net / employeur paie 1.075€
NORMAL : travailleur reçoit 599€ net / employeur paie 1.050€

→ Le travailleur gagne +241€ NET (+40%)
→ Le coût employeur augmente légèrement (+25€)

═══ PLAFOND FISCAL (depuis 2024) ═══
• Non-pensionnés : 12.000€/an de flexi-revenus exonérés d'impôt
  Au-delà → les flexi-revenus sont imposables aux taux normaux
• Pensionnés : PAS de plafond → exonération totale illimitée`,
     delai:"À chaque période de paie (mensuel ou par prestation)",formulaire:"Décompte flexi-job (simplifié — pas de fiche de paie classique obligatoire)",ou:null,obligatoire:true,duree_estimee:'15 min/mois'},

    {n:6,phase:'gestion',titre:"DmfA trimestrielle — Code flexi-job",
     detail:`Les flexi-jobs sont déclarés dans la DmfA trimestrielle avec un code spécifique.

═══ DANS LA DMFA ═══
• Code travailleur : catégorie 050 (flexi-job horeca) ou selon secteur
• Bloc rémunération : flexi-salaire brut
• Bloc cotisation : 28% cotisation patronale spéciale
• Pas de code réduction (le taux 28% est déjà le régime flexi)

═══ DEADLINES ═══
Mêmes deadlines que la DmfA normale :
• T1 → 30 avril
• T2 → 31 juillet
• T3 → 31 octobre
• T4 → 31 janvier N+1

═══ FLEXI-PÉCULE DE VACANCES ═══
• L'ONSS calcule automatiquement le flexi-pécule (7,67%)
• Versé directement au flexi-travailleur par l'ONSS
• Pas de calcul ni de versement par l'employeur`,
     delai:"Chaque DmfA trimestrielle",formulaire:"DmfA — catégorie flexi-job",ou:"Portail sécurité sociale → DmfA / Secrétariat social",obligatoire:true,duree_estimee:'Intégré DmfA'},

    {n:7,phase:'gestion',titre:"Registre de présence + conservation des documents",
     detail:`═══ REGISTRE DE PRÉSENCE ═══
L'employeur doit tenir un registre des prestations flexi-job :
• Date de chaque prestation
• Heures de début et de fin
• Nombre d'heures prestées
• Flexi-salaire horaire
• NISS du flexi-travailleur

Ce registre peut être : électronique (Aureus Social Pro), fichier Excel, ou registre papier.

═══ DOCUMENTS À CONSERVER (5 ANS) ═══
1. Contrat-cadre flexi-job signé
2. Registre des prestations
3. Confirmations DIMONA FLX
4. Décomptes de paiement
5. DmfA trimestrielles
6. Preuve de vérification de la condition 4/5e (si possible)

═══ CONTRÔLE INSPECTION SOCIALE ═══
En cas de contrôle, les inspecteurs vérifient :
• Le contrat-cadre existe et est signé AVANT la 1ère prestation
• Les DIMONA FLX correspondent aux prestations réelles
• Le flexi-salaire ≥ minimum légal
• Le flexi-travailleur remplit la condition 4/5e
• Pas de flexi-job chez l'employeur principal`,
     delai:"En continu — conservation 5 ans",formulaire:"Registre de présence flexi-job",ou:"En interne (Aureus Social Pro / Excel / papier)",obligatoire:true,duree_estimee:'10 min/semaine'},

    {n:8,phase:'gestion',titre:"Fin du flexi-job — Rupture du contrat-cadre",
     detail:`═══ FIN DU CONTRAT-CADRE ═══

Si CDI (contrat-cadre à durée indéterminée) :
• Préavis selon les règles ordinaires (basé sur l'ancienneté dans le contrat-cadre)
• Ou rupture de commun accord

Si CDD (contrat-cadre à durée déterminée) :
• Fin automatique à la date prévue
• Pas de préavis nécessaire

═══ DIMONA OUT ═══
• Déclaration DIMONA OUT type FLX
• Si DIMONA journalière : le OUT est déjà fait chaque jour
• Si DIMONA par période : déclarer le OUT à la fin de la période

═══ DOCUMENTS ═══
• Dernier décompte de paiement
• Formulaire fiscal 281.10 (si flexi-revenus > seuil)
• Attestation des prestations effectuées (si demandée)

═══ PAS DE C4 ═══
Le flexi-travailleur n'a PAS droit au C4 classique (il a un emploi principal ailleurs).
Exception : si le flexi-travailleur est pensionné → pas de C4 non plus.`,
     delai:"Selon durée contrat-cadre",formulaire:"DIMONA OUT FLX + décompte final",ou:null,obligatoire:true,duree_estimee:'30 min'},
  ],
  alertes:[
    {niveau:'critique',texte:"Le contrat-cadre ÉCRIT est OBLIGATOIRE avant la 1ère prestation. Sans contrat-cadre → requalification en contrat ordinaire avec cotisations ONSS normales (±38%)."},
    {niveau:'critique',texte:"Le flexi-travailleur ne peut PAS travailler en flexi-job chez son propre employeur principal. Vérifier systématiquement."},
    {niveau:'important',texte:"Condition 4/5e : le travailleur doit avoir un emploi à 80%+ chez un AUTRE employeur au T-3 ou T-2. L'ONSS vérifie automatiquement et peut réclamer les cotisations normales rétroactivement."},
    {niveau:'important',texte:"Plafond fiscal 12.000€/an (hors pensionnés) : au-delà les flexi-revenus deviennent imposables. Le travailleur doit gérer son plafond entre tous ses flexi-jobs."},
    {niveau:'attention',texte:"DIMONA FLX obligatoire AVANT chaque prestation. Prestation non déclarée = travail au noir."},
    {niveau:'attention',texte:"Le flexi-salaire minimum est indexé annuellement. Vérifier le montant en vigueur à chaque début d'année."},
    {niveau:'info',texte:"Les pensionnés n'ont PAS de plafond fiscal ni de condition d'emploi principal. Le flexi-job est particulièrement avantageux pour les pensionnés."},
  ],
  simulation:{titre:"Flexi-job vs contrat ordinaire — 60h à 14€/h",lignes:[
    {label:'Brut mensuel (60h × 14€)',montant:'840,00€',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'FLEXI-JOB :',montant:'',type:'neutre'},
    {label:'  ONSS travailleur',montant:'0,00€',type:'vert'},
    {label:'  Précompte professionnel',montant:'0,00€',type:'vert'},
    {label:'  NET travailleur',montant:'840,00€ (=brut)',type:'vert_bold'},
    {label:'  Cotisation patronale (28%)',montant:'235,20€',type:'neutre'},
    {label:'  Coût total employeur',montant:'1.075,20€',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'CONTRAT ORDINAIRE :',montant:'',type:'neutre'},
    {label:'  ONSS + PP travailleur',montant:'-241,23€',type:'neutre'},
    {label:'  NET travailleur',montant:'±598,77€',type:'neutre'},
    {label:'  ONSS patronal (25%)',montant:'210,00€',type:'neutre'},
    {label:'  Coût total employeur',montant:'±1.050,00€',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'Gain NET travailleur (flexi vs normal)',montant:'+241,23€ (+40%)',type:'vert_bold'},
    {label:'Surcoût employeur',montant:'+25,20€ (+2,4%)',type:'neutre'},
    {label:'+ Flexi-pécule vacances (ONSS)',montant:'+64,43€ bonus',type:'vert'},
  ]},
  faq:[
    {q:"Un pensionné peut-il faire un flexi-job sans limite ?",r:"OUI. Les pensionnés n'ont ni condition d'emploi principal, ni plafond fiscal sur les flexi-revenus. C'est le public le plus avantagé par le système."},
    {q:"Mon employé à temps plein veut faire un flexi-job chez moi le week-end. Possible ?",r:"NON. Le flexi-travailleur ne peut PAS faire un flexi-job chez son propre employeur principal. C'est interdit."},
    {q:"Le flexi-travailleur dépasse 12.000€/an — que se passe-t-il ?",r:"Au-delà de 12.000€/an (hors pensionnés), les flexi-revenus deviennent imposables via la déclaration fiscale annuelle. Le taux d'imposition dépend de l'ensemble des revenus du travailleur."},
    {q:"Puis-je utiliser un flexi-job pour un poste permanent ?",r:"Techniquement oui (contrat-cadre CDI), mais le flexi-job est conçu pour du travail FLEXIBLE. Un usage abusif (remplacement permanent de travailleurs ordinaires) peut être contesté par l'Inspection."},
    {q:"Comment l'ONSS vérifie-t-il la condition 4/5e ?",r:"Automatiquement via la DmfA de l'employeur principal au trimestre T-3 ou T-2. Si la condition n'est pas remplie, l'ONSS réclame les cotisations normales rétroactivement à l'employeur flexi."},
    {q:"Le flexi-travailleur a-t-il droit aux chèques-repas ?",r:"Non, sauf si la CP le prévoit explicitement pour les flexi-jobs. En pratique, la plupart des CCT sectorielles excluent les flexi-travailleurs des avantages extra-légaux."},
  ],
  formulaires:[
    {nom:"DIMONA FLX — déclaration flexi-job",url:"https://www.socialsecurity.be/site_fr/employer/applics/dimona/index.htm",type:'en_ligne'},
    {nom:"ONSS — Instructions flexi-jobs",url:"https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions.html",type:'en_ligne'},
    {nom:"SPF Emploi — Flexi-jobs",url:"https://emploi.belgique.be/fr/themes/contrats-de-travail/flexi-jobs",type:'en_ligne'},
    {nom:"Liste des CP autorisées",url:"https://www.socialsecurity.be",type:'en_ligne'},
  ],
};

// ═══ COMPOSANT UI ═══
export default function ProcedureFlexiJob(){const P=PROC_FLEXIJOB;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);
const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'préparation',l:'Préparation',i:'🔍'},{id:'engagement',l:'Engagement',i:'✍️'},{id:'gestion',l:'Gestion',i:'📆'}];
const og=[{id:'etapes',l:'Étapes A→Z',i:'📋'},{id:'avantages',l:'Avantages',i:'💰'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];
const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}>
<div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p><div style={{marginTop:12,display:'flex',gap:8,flexWrap:'wrap'}}><span style={{fontSize:12,color:'#64748b',background:'#1e293b',padding:'4px 10px',borderRadius:6}}>⏱️ Sans limite de durée</span><span style={{fontSize:12,color:'#64748b',background:'#1e293b',padding:'4px 10px',borderRadius:6}}>💰 NET = BRUT pour le travailleur</span></div></div>
<div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t} étapes</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div>
<div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='avantages'&&<div><h2 style={s.st2}>💰 Avantages</h2>{P.avantages.map((a,i)=><div key={i} style={s.cd}><div style={{fontSize:15,fontWeight:700,color:'#f8fafc',marginBottom:4}}>{a.rang}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>{a.detail}</div></div>)}<div style={{...s.cd,marginTop:16}}><div style={{fontSize:14,fontWeight:600,color:'#60a5fa',marginBottom:8}}>🏢 Secteurs autorisés ({P.eligibilite.secteurs_autorises.length})</div>{P.eligibilite.secteurs_autorises.map((e,i)=><div key={i} style={{fontSize:13,color:'#94a3b8',paddingLeft:16,marginBottom:3}}>• {e}</div>)}</div></div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}<h3 style={{fontSize:16,fontWeight:700,color:'#f8fafc',marginTop:24,marginBottom:12}}>🔗 Liens</h3>{P.formulaires.map((f,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 0',borderBottom:'1px solid #1e293b'}}><span style={{fontSize:13,color:'#e2e8f0',flex:1}}>{f.nom}</span>{f.url&&<span style={{fontSize:12,color:'#3b82f6',fontFamily:'monospace'}}>{f.url}</span>}</div>)}</div>}
</div>)}
export {PROC_FLEXIJOB};
