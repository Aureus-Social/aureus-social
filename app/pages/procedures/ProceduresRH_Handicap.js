'use client';
import { useState, useMemo } from 'react';

const PROC_HANDICAP = {
  id:'handicap', icon:'♿', categorie:'embauche',
  titre:"Travailleur handicapé (AVIQ / VDAB / Actiris / Phare)",
  resume:"Engagement d'une personne en situation de handicap reconnue. Primes de compensation salariale de 25% à 75% du coût salarial versées à l'employeur + aides à l'aménagement du poste + accompagnement spécialisé. Dispositifs régionalisés : AVIQ (Wallonie), VDAB-VOP (Flandre), Phare/Actiris (Bruxelles).",
  baseLegale:[
    {ref:"Décret wallon 03/02/2005",desc:"Intégration des personnes handicapées — missions de l'AVIQ (Agence pour une Vie de Qualité)"},
    {ref:"AGW 21/12/2006",desc:"Prime de compensation pour l'emploi de travailleurs handicapés en Wallonie"},
    {ref:"Décret flamand 07/05/2004",desc:"Vlaamse Ondersteuningspremie (VOP) — prime de soutien flamande"},
    {ref:"BVR 18/07/2008",desc:"Modalités d'octroi de la VOP en Flandre via le VDAB"},
    {ref:"Ordonnance bruxelloise 18/01/2001",desc:"Intégration des personnes handicapées — Service PHARE à Bruxelles"},
    {ref:"CCT n° 26 (15/10/1975)",desc:"Obligation d'emploi de personnes handicapées dans le secteur privé (CNT)"},
    {ref:"Loi 10/05/2007",desc:"Lutte contre les discriminations — aménagements raisonnables obligatoires"},
    {ref:"Convention ONU 13/12/2006",desc:"Convention relative aux droits des personnes handicapées (ratifiée par la Belgique en 2009)"},
  ],
  eligibilite:{
    travailleurs:[
      "Personne reconnue comme handicapée par l'organisme régional compétent :",
      "🟡 Wallonie : reconnaissance AVIQ (ex-AWIPH) — minimum 30% de handicap ou difficulté substantielle de participation",
      "🟠 Flandre : reconnaissance VAPH (Vlaams Agentschap voor Personen met een Handicap) — inscrit au VDAB",
      "🔵 Bruxelles : reconnaissance Service PHARE (Personne Handicapée Autonomie Recherchée) — ou reconnaissance fédérale SPF Sécurité Sociale",
      "Reconnaissance fédérale SPF Sécurité Sociale (66% d'incapacité) acceptée dans toutes les Régions",
      "Pas de limite d'âge (mais conditions spécifiques pour les jeunes <26 ans et les 55+)",
    ],
    employeurs:[
      "Tout employeur du secteur privé",
      "Secteur public (obligations spécifiques de quota)",
      "ASBL et économie sociale (conditions avantageuses)",
      "Entreprises de travail adapté (ETA) — régime spécifique",
      "Professions libérales engageant du personnel",
    ],
    types_handicap:[
      "Handicap physique (moteur, sensoriel)",
      "Handicap mental ou intellectuel",
      "Handicap psychique (troubles psychiatriques stabilisés)",
      "Maladie chronique impactant la capacité de travail",
      "Trouble du spectre autistique",
      "Déficience auditive ou visuelle",
      "Handicap suite à un accident (travail, vie privée)",
    ],
  },
  duree:"Variable selon l'aide : prime de compensation = 1 à 5 ans (renouvelable). VOP = illimitée tant que le handicap persiste. Aménagement poste = ponctuel.",
  avantages:[
    {rang:"Prime de compensation salariale (AVIQ — Wallonie)",detail:"Compensation de 25% à 50% du coût salarial pendant 1 à 5 ans (renouvelable). Le pourcentage dépend de l'impact du handicap sur la productivité. Demande auprès de l'AVIQ."},
    {rang:"VOP — Vlaamse Ondersteuningspremie (Flandre)",detail:"Prime de 20% à 60% du coût salarial pendant 5 ans (renouvelable indéfiniment). Pour les handicaps sévères : jusqu'à 75%. Versée par le VDAB trimestriellement."},
    {rang:"Prime Bruxelles (Phare/Actiris)",detail:"Prime d'insertion : 30% du coût salarial pendant 1 an. Renouvelable sous conditions. Contrat d'adaptation professionnelle (CAP) : formation en entreprise avec indemnité."},
    {rang:"Aide à l'aménagement du poste de travail",detail:"Financement régional de 50% à 100% des coûts d'aménagement : mobilier adapté, logiciel spécialisé, rampe d'accès, signalétique, interprète langue des signes. Plafond : 5.000€ à 25.000€ selon la Région."},
    {rang:"Réduction groupe-cible ONSS",detail:"Réduction des cotisations patronales ONSS pour les travailleurs handicapés : -1.000€ à -1.500€/trimestre selon l'âge et la durée d'inoccupation. Cumulable avec les primes régionales."},
    {rang:"Accompagnement spécialisé gratuit",detail:"Jobcoach spécialisé (AVIQ/VDAB/Phare) pour accompagner l'intégration : adaptation du poste, communication avec l'équipe, suivi post-engagement. Service gratuit pendant 6-12 mois."},
  ],
  etapes:[
    {n:1,phase:'préparation',titre:"Identifier la Région et l'organisme compétent",
     detail:`Le dispositif dépend du DOMICILE du travailleur handicapé.

═══ PAR RÉGION ═══

🟡 WALLONIE — AVIQ
• Agence pour une Vie de Qualité
• www.aviq.be — tél. 071 33 77 11
• Bureaux régionaux dans chaque province wallonne
• Compétence : reconnaissance handicap + aides à l'emploi + aménagements

🟠 FLANDRE — VDAB + VAPH
• VAPH : reconnaissance du handicap (www.vaph.be)
• VDAB : aides à l'emploi et VOP (www.vdab.be)
• Tél. VDAB : 0800 30 700
• Syntra et GTB (Gespecialiseerde Teams Bemiddeling) pour l'accompagnement

🔵 BRUXELLES — PHARE + ACTIRIS
• Service PHARE : reconnaissance handicap + aides individuelles
  www.phare.irisnet.be — tél. 02 800 82 03
• Actiris : aides à l'emploi (prime d'insertion, CAP)
  www.actiris.brussels

═══ RECONNAISSANCE DU HANDICAP ═══
Le travailleur DOIT avoir une reconnaissance officielle :
• Soit régionale (AVIQ/VAPH/PHARE)
• Soit fédérale (SPF Sécurité Sociale — 66% d'incapacité)
• Soit par la mutuelle (invalidité reconnue)
• La reconnaissance doit être ANTÉRIEURE ou concomitante à l'engagement

⚠️ Sans reconnaissance officielle → pas d'accès aux aides financières.`,
     delai:"Dès la phase de recrutement",formulaire:null,ou:"AVIQ (WAL) / VAPH-VDAB (VL) / PHARE-Actiris (BXL)",obligatoire:true,duree_estimee:'1-2 semaines'},

    {n:2,phase:'préparation',titre:"Évaluer les besoins d'aménagement du poste de travail",
     detail:`Avant l'engagement, évaluer les aménagements nécessaires avec le candidat et l'organisme régional.

═══ TYPES D'AMÉNAGEMENTS ═══

MATÉRIEL :
• Mobilier adapté (bureau réglable, chaise ergonomique, repose-pieds)
• Écran adapté (taille, logiciel d'agrandissement)
• Logiciel spécialisé (synthèse vocale, reconnaissance vocale, loupe)
• Prothèses ou aides techniques spécifiques au poste
• Rampe d'accès, ascenseur, élargissement de portes

ORGANISATIONNEL :
• Horaire aménagé (temps partiel thérapeutique, pauses adaptées)
• Télétravail partiel
• Tâches adaptées (suppression de certaines tâches incompatibles)
• Binôme ou parrainage avec un collègue

HUMAIN :
• Interprète en langue des signes (réunions, formations)
• Jobcoach spécialisé (accompagnement en entreprise)
• Formation de l'équipe à la communication avec le collègue handicapé

═══ FINANCEMENT ═══
🟡 AVIQ : intervention de 50% à 100% des coûts (plafond ±15.000€)
🟠 VDAB : intervention variable selon le type d'aménagement
🔵 PHARE : intervention jusqu'à 100% (plafond ±25.000€)

═══ OBLIGATION LÉGALE ═══
La loi anti-discrimination (10/05/2007) impose des "aménagements raisonnables" :
• L'employeur DOIT mettre en place des aménagements raisonnables
• Le refus d'aménagement raisonnable = discrimination
• Le caractère "raisonnable" dépend du coût, de la taille de l'entreprise, de l'aide publique disponible`,
     delai:"Avant engagement — visite du poste avec le candidat",formulaire:"Demande d'aide à l'aménagement (AVIQ/VDAB/PHARE)",ou:"Organisme régional + ergonome / SEPP",obligatoire:true,duree_estimee:'2-4 semaines'},

    {n:3,phase:'préparation',titre:"Demander les aides financières (prime de compensation / VOP)",
     detail:`Introduire la demande d'aide financière AVANT ou AU MOMENT de l'engagement.

═══ WALLONIE — PRIME DE COMPENSATION (AVIQ) ═══
Procédure :
1. Télécharger le formulaire sur www.aviq.be → Emploi → Aides aux employeurs
2. Compléter : profil du travailleur, handicap, poste, impact sur la productivité
3. Joindre : copie reconnaissance handicap, description du poste, contrat (projet)
4. Envoyer au bureau AVIQ provincial
5. L'AVIQ désigne un évaluateur qui visite l'entreprise
6. Décision dans les 2-3 mois
7. Prime versée trimestriellement

Montants : 25% à 50% du coût salarial (salaire brut + ONSS patronal)
Durée : 1 à 5 ans, renouvelable

═══ FLANDRE — VOP (VDAB) ═══
Procédure :
1. Le travailleur doit être inscrit au VDAB avec reconnaissance VAPH
2. L'employeur introduit la demande VOP via www.vdab.be → Werkgevers → VOP
3. Le VDAB évalue l'impact du handicap sur la capacité de travail
4. Décision dans les 1-2 mois
5. VOP versée trimestriellement par le VDAB

Montants : 20% à 75% du coût salarial (selon gravité)
Durée : 5 ans, renouvelable indéfiniment

═══ BRUXELLES — PRIME D'INSERTION (ACTIRIS/PHARE) ═══
Procédure :
1. Contacter Actiris + Service PHARE
2. Introduire demande de prime d'insertion
3. Joindre : reconnaissance PHARE, contrat, description du poste
4. Décision dans les 2 mois

Montants : 30% du coût salarial pendant 1 an (renouvelable)
Alternative : CAP (Contrat d'Adaptation Professionnelle) = formation en entreprise de 3-12 mois`,
     delai:"Introduire AVANT ou AU MOMENT de l'engagement",formulaire:"Demande de prime (AVIQ/VDAB/PHARE — formulaire spécifique par Région)",ou:"Bureau régional AVIQ / VDAB en ligne / Service PHARE",obligatoire:true,duree_estimee:'2-3 mois pour la décision'},

    {n:4,phase:'engagement',titre:"Contrat de travail + DIMONA — procédure standard",
     detail:`Le contrat de travail est un contrat ORDINAIRE — pas de contrat spécifique "handicapé".

═══ CONTRAT ═══
• CDI recommandé (stabilité + durée des aides)
• CDD possible mais la durée des aides peut être écourtée
• Mêmes mentions obligatoires que tout contrat
• Le handicap n'a PAS à être mentionné dans le contrat
• La rémunération doit être AU MOINS le barème de la CP (pas de salaire réduit autorisé !)

═══ DIMONA ═══
• DIMONA standard (pas de type spécifique pour les travailleurs handicapés)
• Procédure identique à tout engagement

═══ TEMPS PARTIEL ═══
Le temps partiel est fréquent et parfaitement adapté :
• Mi-temps thérapeutique (après une période d'incapacité)
• Temps partiel adapté au handicap (fatigue, soins, kiné)
• Les aides sont proportionnelles au temps de travail

═══ RÉDUCTION ONSS ═══
Appliquer le code réduction groupe-cible dans la DmfA :
• Si le travailleur était inscrit comme DE : réduction Activa cumulable
• Réduction groupe-cible handicapé : -1.000€ à -1.500€/trimestre
• Cumulable avec la prime de compensation régionale`,
     delai:"Au plus tard le 1er jour de travail",formulaire:"Contrat de travail CDI + DIMONA IN",ou:"Standard",obligatoire:true,duree_estimee:'1-2 jours'},

    {n:5,phase:'engagement',titre:"Accueil adapté + sensibilisation de l'équipe",
     detail:`L'accueil d'un travailleur handicapé nécessite une PRÉPARATION de l'équipe et de l'environnement.

═══ AVANT LE JOUR J ═══
• Aménagements du poste installés et testés
• Équipe informée de l'arrivée du collègue (avec son accord)
• Formation de sensibilisation si nécessaire (langue des signes basique, autisme, etc.)
• Parcours d'accès vérifié (accessibilité PMR)
• Tuteur/parrain désigné

═══ JOUR J — ACCUEIL ═══
• Accueil personnalisé et bienveillant
• Visite des locaux avec attention aux accès
• Présentation de l'équipe
• Explication des tâches, horaires, pauses
• Test des aménagements avec le travailleur
• Échange sur les besoins spécifiques (le travailleur est le meilleur expert de son handicap)

═══ JOBCOACH (si disponible) ═══
L'organisme régional peut proposer un jobcoach spécialisé :
• Présent pendant les premières semaines
• Aide à l'adaptation du poste
• Médie entre le travailleur et l'équipe
• Forme les collègues si nécessaire
• Service GRATUIT (pris en charge par l'organisme régional)`,
     delai:"Le 1er jour de travail (préparation en amont)",formulaire:null,ou:"En interne + jobcoach régional si disponible",obligatoire:true,duree_estimee:'1 journée + suivi'},

    {n:6,phase:'gestion',titre:"Suivi + évaluations + renouvellement des aides",
     detail:`═══ SUIVI RÉGULIER ═══
• Entretiens réguliers avec le travailleur (mensuel recommandé au début)
• Évaluation de l'adéquation des aménagements
• Ajustement si nécessaire (l'état de santé peut évoluer)
• Communication ouverte avec l'équipe

═══ VISITES DE L'ORGANISME RÉGIONAL ═══
L'évaluateur AVIQ/VDAB/PHARE effectue des visites de suivi :
• Vérification de la bonne utilisation des aides
• Évaluation de l'intégration
• Rapport de suivi pour le renouvellement

═══ RENOUVELLEMENT DES AIDES ═══

AVIQ (Wallonie) : prime renouvelable tous les 1-5 ans
• Introduire la demande de renouvellement 3 mois avant l'échéance
• Nouvelle évaluation de l'impact du handicap
• Le taux peut être révisé (hausse ou baisse)

VDAB (Flandre) : VOP renouvelable automatiquement tous les 5 ans
• Évaluation de contrôle
• Poursuite automatique sauf changement significatif

PHARE/Actiris (Bruxelles) : prime renouvelable annuellement
• Demande de renouvellement à introduire 2 mois avant échéance

═══ EN CAS D'AGGRAVATION DU HANDICAP ═══
• Informer l'organisme régional
• Demander une réévaluation du taux de compensation
• Adapter les aménagements (nouvelle demande d'aide possible)
• Envisager un mi-temps thérapeutique si nécessaire`,
     delai:"Continu + renouvellement 3 mois avant échéance des aides",formulaire:"Demande de renouvellement (AVIQ/VDAB/PHARE)",ou:"Organisme régional compétent",obligatoire:true,duree_estimee:'2h/mois + renouvellement annuel'},

    {n:7,phase:'gestion',titre:"Obligations légales — Anti-discrimination et aménagements raisonnables",
     detail:`L'employeur a des OBLIGATIONS LÉGALES envers les travailleurs handicapés.

═══ LOI ANTI-DISCRIMINATION (10/05/2007) ═══
• Interdiction de discrimination directe ou indirecte fondée sur le handicap
• Obligation d'aménagements raisonnables (refus = discrimination)
• S'applique à TOUTES les étapes : recrutement, conditions de travail, promotion, licenciement

═══ AMÉNAGEMENTS RAISONNABLES ═══
L'employeur DOIT mettre en place des aménagements "raisonnables" :
Le caractère raisonnable s'évalue selon :
• Le coût de l'aménagement vs la taille et les ressources de l'entreprise
• L'existence d'aides publiques (primes AVIQ/VDAB/PHARE)
• L'impact sur l'organisation du travail
• La fréquence d'utilisation

Exemples d'aménagements raisonnables :
✅ Horaire flexible / télétravail
✅ Bureau au rez-de-chaussée (éviter les escaliers)
✅ Logiciel de synthèse vocale
✅ Pauses supplémentaires
✅ Adaptation des tâches
✅ Interprète pour les réunions importantes

❌ N'est PAS raisonnable (exemples) :
❌ Construction d'un ascenseur dans un bâtiment classé
❌ Création d'un poste entièrement nouveau

═══ PROTECTION CONTRE LE LICENCIEMENT ═══
Le travailleur handicapé n'a PAS de protection spéciale contre le licenciement.
MAIS : un licenciement motivé par le handicap = discrimination = nul.
Le licenciement doit être justifié par des raisons objectives (CCT 109).

═══ RGPD — DONNÉES DE SANTÉ ═══
Les informations sur le handicap sont des DONNÉES SENSIBLES (art. 9 RGPD).
• Accès limité au strict nécessaire (RH + responsable direct)
• Pas de communication aux collègues sans accord du travailleur
• Conservation sécurisée`,
     delai:"Pendant toute la durée du contrat",formulaire:null,ou:"Interne — avec conseil juridique si nécessaire",obligatoire:true,duree_estimee:'Formation continue'},

    {n:8,phase:'gestion',titre:"Calcul du coût réel après toutes les aides",
     detail:`Avec les aides cumulées, le coût réel d'un travailleur handicapé peut être TRÈS réduit.

═══ SIMULATION — Travailleur handicapé en Wallonie — 2.800€ brut ═══

Coût SANS aides :
  Brut : 2.800€ + ONSS patronal 25% = 3.500€
  + Assurance, SEPP, admin = ±3.800€/mois
  Coût annuel : ±45.600€

Coût AVEC aides (taux 40% AVIQ + réduction ONSS) :
  Prime AVIQ 40% : -1.520€/mois
  Réduction ONSS groupe-cible : -417€/mois (1.250€/trim)
  ─────────────────────────────────
  Coût NET employeur : ±1.863€/mois
  Coût annuel NET : ±22.356€

ÉCONOMIE : 23.244€/an (-51%)

═══ EN FLANDRE (VOP 60%) ═══
  VOP 60% du coût salarial : -2.280€/mois
  Coût NET : ±1.520€/mois → 18.240€/an
  ÉCONOMIE : 27.360€/an (-60%)

═══ CUMUL POSSIBLE ═══
• Prime régionale (AVIQ/VOP/PHARE) + réduction ONSS groupe-cible
• + Réduction structurelle ONSS (si bas salaire)
• + Aide à l'aménagement du poste (ponctuel)
• + Jobcoach gratuit (6-12 mois)
• Le cumul peut réduire le coût de 50% à 75% !`,
     delai:"Calcul lors de l'engagement + mise à jour annuelle",formulaire:null,ou:null,obligatoire:true,duree_estimee:'1-2 heures'},
  ],
  alertes:[
    {niveau:'critique',texte:"La reconnaissance officielle du handicap (AVIQ/VAPH/PHARE/SPF) est INDISPENSABLE pour accéder aux aides financières. Sans reconnaissance = pas de prime."},
    {niveau:'critique',texte:"Refuser un aménagement raisonnable = DISCRIMINATION au sens de la loi 10/05/2007. Sanctions pénales et civiles possibles."},
    {niveau:'important',texte:"Les demandes de prime doivent être introduites AVANT ou AU MOMENT de l'engagement. Une demande tardive peut entraîner une perte de rétroactivité."},
    {niveau:'important',texte:"Le salaire doit être AU MOINS le barème de la CP. Il est INTERDIT de verser un salaire réduit au motif du handicap. La prime compense l'employeur, pas le travailleur."},
    {niveau:'attention',texte:"Les données de santé/handicap sont des données SENSIBLES au sens du RGPD. Accès limité, pas de communication sans accord du travailleur."},
    {niveau:'attention',texte:"Renouvellement des primes : introduire la demande 3 mois AVANT l'échéance. Un retard = interruption du versement."},
    {niveau:'info',texte:"Le cumul prime régionale + réduction ONSS + aide aménagement peut réduire le coût salarial de 50% à 75%. Toujours calculer le coût réel avant de décider."},
  ],
  simulation:{titre:"Coût réel après aides — Travailleur handicapé 2.800€ brut",lignes:[
    {label:'Coût total employeur SANS aides',montant:'±3.800€/mois',type:'neutre'},
    {label:'',montant:'',type:'separateur'},
    {label:'WALLONIE (AVIQ 40%) :',montant:'',type:'neutre'},
    {label:'  Prime AVIQ 40%',montant:'-1.520€/mois',type:'vert'},
    {label:'  Réduction ONSS groupe-cible',montant:'-417€/mois',type:'vert'},
    {label:'  Coût NET employeur',montant:'1.863€/mois',type:'vert_bold'},
    {label:'  Économie annuelle',montant:'23.244€ (-51%)',type:'vert_bold'},
    {label:'',montant:'',type:'separateur'},
    {label:'FLANDRE (VOP 60%) :',montant:'',type:'neutre'},
    {label:'  VOP 60%',montant:'-2.280€/mois',type:'vert'},
    {label:'  Coût NET employeur',montant:'±1.520€/mois',type:'vert_bold'},
    {label:'  Économie annuelle',montant:'27.360€ (-60%)',type:'vert_bold'},
    {label:'',montant:'',type:'separateur'},
    {label:'+ Aide aménagement poste (ponctuel)',montant:'5.000€-25.000€',type:'vert'},
    {label:'+ Jobcoach gratuit (6-12 mois)',montant:'Inclus',type:'vert'},
  ]},
  faq:[
    {q:"Le travailleur doit-il me dire qu'il est handicapé ?",r:"Non. Le travailleur n'est pas obligé de révéler son handicap. Mais sans reconnaissance officielle, vous ne pouvez pas accéder aux aides financières. Le travailleur a intérêt à partager l'information pour bénéficier des aménagements et des aides."},
    {q:"Puis-je licencier un travailleur handicapé ?",r:"Oui, aux mêmes conditions que tout travailleur (CCT 109, préavis). MAIS : un licenciement motivé par le handicap = discrimination = nul + dommages et intérêts. Le motif doit être objectif et non lié au handicap."},
    {q:"L'aide couvre-t-elle le pécule de vacances et le 13e mois ?",r:"Oui. La prime de compensation (AVIQ) et la VOP (VDAB) sont calculées sur le coût salarial TOTAL, incluant les provisions pour pécule, 13e mois et ONSS patronal."},
    {q:"Le handicap s'aggrave en cours de contrat — que faire ?",r:"Informer l'organisme régional. Demander une réévaluation du taux de compensation (hausse possible). Adapter les aménagements. Envisager un mi-temps thérapeutique si nécessaire."},
    {q:"Puis-je cumuler la prime handicap avec Activa ?",r:"Oui, sous conditions. La prime régionale (AVIQ/VOP) est cumulable avec la réduction ONSS groupe-cible. Le cumul avec Activa dépend du cas : vérifier avec l'ONSS et l'organisme régional."},
    {q:"Le travailleur handicapé compte-t-il dans mon effectif pour le premier engagement ?",r:"Oui, comme tout travailleur sous contrat. Il compte dans le calcul du nombre maximum de travailleurs occupés simultanément."},
  ],
  formulaires:[
    {nom:"AVIQ — Aides aux employeurs (Wallonie)",url:"https://www.aviq.be/handicap/aides/emploi/employeurs.html",type:'en_ligne'},
    {nom:"VDAB — VOP (Flandre)",url:"https://www.vdab.be/werkgevers/vop",type:'en_ligne'},
    {nom:"Service PHARE (Bruxelles)",url:"https://phare.irisnet.be",type:'en_ligne'},
    {nom:"Actiris — Aides personnes handicapées",url:"https://www.actiris.brussels/fr/employeurs/",type:'en_ligne'},
    {nom:"SPF Emploi — Personnes handicapées",url:"https://emploi.belgique.be/fr/themes/egalite-et-non-discrimination/handicap",type:'en_ligne'},
    {nom:"Unia — Aménagements raisonnables",url:"https://www.unia.be",type:'en_ligne'},
  ],
};

export default function ProcedureHandicap(){const P=PROC_HANDICAP;const[eo,sEo]=useState(null);const[ev,sEv]=useState({});const[ong,sO]=useState('etapes');const[fi,sF]=useState('toutes');const tg=n=>sEo(eo===n?null:n);const tV=n=>sEv(p=>({...p,[n]:!p[n]}));const pr=useMemo(()=>{const t=P.etapes.filter(e=>e.obligatoire).length,f=P.etapes.filter(e=>e.obligatoire&&ev[e.n]).length;return{t,f,p:t?Math.round(f/t*100):0}},[ev]);const ef=useMemo(()=>fi==='toutes'?P.etapes:P.etapes.filter(e=>e.phase===fi),[fi]);
const ph=[{id:'toutes',l:'Toutes',i:'📋'},{id:'préparation',l:'Préparation',i:'🔍'},{id:'engagement',l:'Engagement',i:'✍️'},{id:'gestion',l:'Gestion',i:'📆'}];
const og=[{id:'etapes',l:'Étapes A→Z',i:'📋'},{id:'avantages',l:'Avantages',i:'💰'},{id:'simulation',l:'Simulation',i:'🧮'},{id:'alertes',l:'Alertes',i:'⚠️'},{id:'faq',l:'FAQ',i:'❓'},{id:'legal',l:'Base légale',i:'⚖️'}];
const s={pg:{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',maxWidth:960,margin:'0 auto',padding:24,background:'#0a0e1a',color:'#e2e8f0',minHeight:'100vh'},ti:{fontSize:28,fontWeight:800,color:'#f8fafc',margin:0},rs:{fontSize:15,color:'#94a3b8',marginTop:12,lineHeight:1.6},pb:{background:'#1e293b',borderRadius:12,padding:16,marginBottom:24},pt:{height:8,background:'#334155',borderRadius:4,overflow:'hidden'},pf:p=>({height:'100%',width:`${p}%`,background:p===100?'#22c55e':'#3b82f6',borderRadius:4,transition:'width .5s'}),ts:{display:'flex',gap:4,marginBottom:20,flexWrap:'wrap'},tb:a=>({padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:a?700:500,background:a?'#3b82f6':'#1e293b',color:a?'#fff':'#94a3b8'}),fs:{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'},fl:a=>({padding:'6px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:12,fontWeight:a?700:500,background:a?'#6366f120':'#1e293b',color:a?'#818cf8':'#64748b'}),ec:(o,v)=>({background:v?'#22c55e08':'#111827',border:`1px solid ${v?'#22c55e30':o?'#3b82f650':'#1e293b'}`,borderRadius:12,marginBottom:8,borderLeft:`4px solid ${v?'#22c55e':'#3b82f6'}`}),eh:{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer',userSelect:'none'},en:v=>({width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:v?'#22c55e':'#3b82f620',color:v?'#fff':'#3b82f6',flexShrink:0}),et:{flex:1,fontSize:14,fontWeight:600,color:'#f1f5f9'},eb:o=>({fontSize:11,padding:'2px 8px',borderRadius:10,background:o?'#ef444420':'#64748b20',color:o?'#f87171':'#64748b',fontWeight:600}),ed:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,whiteSpace:'pre-line'},em:{display:'flex',flexWrap:'wrap',gap:8,marginTop:12},mi:c=>({fontSize:12,padding:'4px 10px',borderRadius:6,background:`${c}15`,color:c}),cb:ch=>({width:20,height:20,borderRadius:4,border:`2px solid ${ch?'#22c55e':'#475569'}`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:ch?'#22c55e':'transparent'}),st2:{fontSize:18,fontWeight:700,color:'#f8fafc',marginBottom:16},cd:{background:'#111827',border:'1px solid #1e293b',borderRadius:12,padding:16,marginBottom:8},ac:n=>({background:n==='critique'?'#dc262610':n==='important'?'#f9731620':n==='attention'?'#eab30815':'#3b82f610',border:`1px solid ${n==='critique'?'#dc262640':n==='important'?'#f9731640':n==='attention'?'#eab30830':'#3b82f630'}`,borderRadius:12,padding:16,marginBottom:8}),an:n=>({fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:n==='critique'?'#ef4444':n==='important'?'#f97316':n==='attention'?'#eab308':'#3b82f6',marginBottom:6}),sr:t=>({display:'flex',justifyContent:'space-between',padding:t==='separateur'?0:'10px 0',borderBottom:t==='separateur'?'1px solid #1e293b':'none',marginBottom:t==='separateur'?8:0}),sl:t=>({fontSize:14,color:t?.includes('vert')?'#4ade80':'#cbd5e1',fontWeight:t==='vert_bold'?700:400}),sm:t=>({fontSize:t==='vert_bold'?18:14,fontWeight:t?.includes('vert')?700:400,color:t?.includes('vert')?'#4ade80':'#f1f5f9',fontFamily:'monospace'})};
return(<div style={s.pg}><div style={{marginBottom:32}}><h1 style={s.ti}>{P.icon} {P.titre}</h1><p style={s.rs}>{P.resume}</p></div><div style={s.pb}><div style={{fontSize:13,color:'#94a3b8',marginBottom:8,display:'flex',justifyContent:'space-between'}}><span>Progression : {pr.f}/{pr.t}</span><span style={{fontWeight:700,color:pr.p===100?'#22c55e':'#3b82f6'}}>{pr.p}%</span></div><div style={s.pt}><div style={s.pf(pr.p)}/></div></div><div style={s.ts}>{og.map(o=><button key={o.id} style={s.tb(ong===o.id)} onClick={()=>sO(o.id)}>{o.i} {o.l}</button>)}</div>
{ong==='etapes'&&<div><div style={s.fs}>{ph.map(p=><button key={p.id} style={s.fl(fi===p.id)} onClick={()=>sF(p.id)}>{p.i} {p.l}</button>)}</div>{ef.map(e=>{const o=eo===e.n,v=ev[e.n];return<div key={e.n} style={s.ec(o,v)}><div style={s.eh} onClick={()=>tg(e.n)}><div style={s.cb(v)} onClick={x=>{x.stopPropagation();tV(e.n)}}>{v&&<span style={{color:'#fff',fontSize:14}}>✓</span>}</div><div style={s.en(v)}>{e.n}</div><span style={s.et}>{e.titre}</span><span style={s.eb(e.obligatoire)}>{e.obligatoire?'Obligatoire':'Recommandé'}</span><span style={{color:'#64748b',fontSize:18,transform:o?'rotate(180deg)':'',transition:'transform .2s'}}>▾</span></div>{o&&<div style={{padding:'0 16px 16px 60px'}}><div style={s.ed}>{e.detail}</div><div style={s.em}>{e.delai&&<span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}{e.duree_estimee&&<span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}{e.formulaire&&<span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}{e.ou&&<span style={s.mi('#64748b')}>📍 {e.ou}</span>}</div></div>}</div>})}</div>}
{ong==='avantages'&&<div><h2 style={s.st2}>💰 Avantages</h2>{P.avantages.map((a,i)=><div key={i} style={s.cd}><div style={{fontSize:15,fontWeight:700,color:'#f8fafc',marginBottom:4}}>{a.rang}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>{a.detail}</div></div>)}</div>}
{ong==='simulation'&&<div><h2 style={s.st2}>🧮 {P.simulation.titre}</h2><div style={s.cd}>{P.simulation.lignes.map((r,i)=>r.type==='separateur'?<div key={i} style={s.sr('separateur')}/>:<div key={i} style={s.sr(r.type)}><span style={s.sl(r.type)}>{r.label}</span><span style={s.sm(r.type)}>{r.montant}</span></div>)}</div></div>}
{ong==='alertes'&&<div><h2 style={s.st2}>⚠️ Alertes</h2>{P.alertes.map((a,i)=><div key={i} style={s.ac(a.niveau)}><div style={s.an(a.niveau)}>{a.niveau}</div><div style={{fontSize:13,color:'#e2e8f0',lineHeight:1.6}}>{a.texte}</div></div>)}</div>}
{ong==='faq'&&<div><h2 style={s.st2}>❓ FAQ</h2>{P.faq.map((f,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:8}}>Q : {f.q}</div><div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>R : {f.r}</div></div>)}</div>}
{ong==='legal'&&<div><h2 style={s.st2}>⚖️ Base légale</h2>{P.baseLegale.map((l,i)=><div key={i} style={s.cd}><div style={{fontSize:14,fontWeight:600,color:'#818cf8',marginBottom:4}}>{l.ref}</div><div style={{fontSize:13,color:'#94a3b8'}}>{l.desc}</div></div>)}</div>}
</div>)}
export {PROC_HANDICAP};
