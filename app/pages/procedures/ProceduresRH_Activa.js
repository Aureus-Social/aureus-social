'use client';
import { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE PROCÉDURES RH — EMBAUCHE & MISE À L'EMPLOI
// Procédure 2/8 : ACTIVA — Demandeur d'emploi longue durée
// Aureus Social Pro — v18 — Février 2026
// ═══════════════════════════════════════════════════════════════════════════════

const PROC_ACTIVA = {
  id: 'activa',
  icon: '💼',
  categorie: 'embauche',
  titre: "Plan Activa — Demandeur d'emploi longue durée",
  resume: "Réduction ONSS patronale + allocation de travail (déduite du salaire net) pour l'engagement d'un demandeur d'emploi inscrit depuis ≥12 mois. Régionalisé depuis 2017 : Activa.brussels (BXL), Impulsions (Wallonie), activering (Flandre). Économie totale possible : jusqu'à 32.000€ sur 24 mois.",

  // ─── BASE LÉGALE ────────────────────────────────────────────────────────
  baseLegale: [
    { ref: "AR 19/12/2001", desc: "Promotion de la mise à l'emploi des demandeurs d'emploi de longue durée — régime fédéral Activa (base)" },
    { ref: "Loi 22/12/1995, art. 7§1", desc: "Mesures en faveur de l'emploi — cadre légal des plans d'activation" },
    { ref: "6e Réforme de l'État (2014)", desc: "Transfert de compétences emploi aux Régions — régionalisation progressive des aides à l'emploi" },
    { ref: "Ordonnance bruxelloise 23/06/2017", desc: "Activa.brussels — nouveau dispositif régional bruxellois remplaçant l'Activa fédéral à Bruxelles" },
    { ref: "AGRBC 14/09/2017", desc: "Arrêté d'exécution Activa.brussels — modalités, montants et conditions détaillées" },
    { ref: "Décret wallon 02/02/2017", desc: "Aides à l'emploi — dispositif Impulsions remplaçant Activa en Wallonie" },
    { ref: "AGW 08/06/2017", desc: "Arrêté d'exécution Impulsions — barèmes et conditions pour la Wallonie" },
    { ref: "Décret flamand 04/03/2016", desc: "Réforme des mesures d'activation en Flandre — remplacement progressif par VOP et parcours VDAB" },
    { ref: "Instructions ONSS 2024/1", desc: "Instructions administratives ONSS — codes réduction DmfA et modalités de calcul" },
  ],

  // ─── QUI PEUT EN BÉNÉFICIER ─────────────────────────────────────────────
  eligibilite: {
    employeurs: [
      "Tout employeur du secteur privé assujetti à la loi ONSS",
      "ASBL et secteur non-marchand",
      "Entreprises d'insertion et d'économie sociale",
      "Professions libérales engageant du personnel salarié",
      "Pouvoirs locaux (communes, CPAS) pour certaines catégories",
    ],
    travailleurs: {
      bruxelles: [
        "Domicilié en Région de Bruxelles-Capitale",
        "Inscrit comme demandeur d'emploi inoccupé chez Actiris",
        "< 30 ans : inscrit depuis ≥6 mois",
        "30-56 ans : inscrit depuis ≥12 mois",
        "≥ 57 ans : inscrit depuis ≥12 mois (conditions assouplies)",
        "Ne pas avoir travaillé pendant la période d'inscription (sauf exceptions : intérim ≤45 jours, formation, ALE)",
      ],
      wallonie: [
        "Domicilié en Région wallonne",
        "Inscrit comme demandeur d'emploi inoccupé au Forem",
        "< 25 ans : inscrit depuis ≥6 mois → Impulsion -25 ans",
        "25-57 ans : inscrit depuis ≥12 mois → Impulsion 25+",
        "≥ 58 ans : inscrit depuis ≥12 mois → Impulsion 58+",
        "Pas d'activité salariée pendant la période d'inscription (sauf intérim courte durée)",
      ],
      flandre: [
        "Domicilié en Région flamande",
        "Le régime Activa classique a été remplacé par :",
        "→ VOP (Vlaamse Ondersteuningspremie) pour travailleurs avec handicap",
        "→ Parcours d'activation VDAB + jobcoaching",
        "→ Mesures transitoires pour les cartes Activa délivrées avant 01/01/2017",
        "Contacter le VDAB pour les mesures actuellement en vigueur",
      ],
    },
    exclusions: [
      "Travailleurs déjà occupés chez le même employeur dans les 12 mois précédents (sauf exceptions)",
      "Engagements dans le cadre d'une mise à disposition (intérim) — l'agence d'intérim ne peut pas bénéficier de l'Activa",
      "Employeurs publics fédéraux (sauf dérogations spécifiques)",
      "Travailleurs qui ne sont plus inscrits comme DE au moment de l'engagement",
    ],
  },

  // ─── DURÉE & MONTANTS PAR RÉGION ──────────────────────────────────────
  duree: "6 à 30 mois selon la Région, la durée d'inoccupation et l'âge du travailleur",
  avantages: [
    // ── BRUXELLES ──
    {
      region: 'Bruxelles',
      flag: '🟡',
      dispositif: 'Activa.brussels',
      organisme: 'Actiris',
      mesures: [
        {
          profil: "DE < 30 ans — inscrit ≥6 mois",
          reduction_onss: "-1.000€/trimestre pendant 8 trimestres",
          allocation_travail: "350€/mois pendant 6 mois",
          prime_actiris: "5.000€ sur 12 mois",
          economie_totale: "±15.100€",
          duree_mois: 24,
        },
        {
          profil: "DE 30-56 ans — inscrit ≥12 mois",
          reduction_onss: "-1.500€/trimestre pendant 8 trimestres",
          allocation_travail: "500€/mois pendant 12 mois",
          prime_actiris: "10.000€ sur 24 mois",
          economie_totale: "±28.000€",
          duree_mois: 24,
        },
        {
          profil: "DE ≥57 ans — inscrit ≥12 mois",
          reduction_onss: "-1.500€/trimestre pendant 12 trimestres",
          allocation_travail: "500€/mois pendant 18 mois",
          prime_actiris: "15.750€ sur 30 mois",
          economie_totale: "±42.750€",
          duree_mois: 30,
        },
      ],
    },
    // ── WALLONIE ──
    {
      region: 'Wallonie',
      flag: '🔴',
      dispositif: 'Impulsions',
      organisme: 'Forem',
      mesures: [
        {
          profil: "DE < 25 ans — inscrit ≥6 mois au Forem",
          reduction_onss: "-1.000€/trimestre pendant 8 trimestres",
          allocation_travail: "500€/mois pendant 24 mois (Impulsion -25)",
          prime_actiris: "N/A (pas de prime Forem complémentaire)",
          economie_totale: "±20.000€",
          duree_mois: 36,
        },
        {
          profil: "DE 25-57 ans — inscrit ≥12 mois au Forem",
          reduction_onss: "-1.250€/trimestre pendant 8 trimestres",
          allocation_travail: "500€/mois pendant 24 mois (Impulsion 25+)",
          prime_actiris: "N/A",
          economie_totale: "±22.000€",
          duree_mois: 24,
        },
        {
          profil: "DE ≥58 ans — inscrit ≥12 mois au Forem",
          reduction_onss: "-1.500€/trimestre pendant 12 trimestres",
          allocation_travail: "500€/mois pendant 30 mois (Impulsion 58+)",
          prime_actiris: "N/A",
          economie_totale: "±33.000€",
          duree_mois: 30,
        },
      ],
    },
    // ── FLANDRE ──
    {
      region: 'Flandre',
      flag: '🟠',
      dispositif: 'Régime transitoire / VOP / VDAB',
      organisme: 'VDAB',
      mesures: [
        {
          profil: "Régime transitoire (cartes Activa délivrées avant 2017)",
          reduction_onss: "Selon carte Activa existante",
          allocation_travail: "Selon carte — conditions maintenues jusqu'à expiration",
          prime_actiris: "N/A",
          economie_totale: "Variable",
          duree_mois: 0,
        },
        {
          profil: "VOP — Travailleur avec handicap reconnu",
          reduction_onss: "Prime salariale de 20% à 75% du coût salarial",
          allocation_travail: "N/A — versée directement à l'employeur par VDAB",
          prime_actiris: "N/A",
          economie_totale: "Très variable — jusqu'à 75% du coût salarial",
          duree_mois: 60,
        },
      ],
    },
  ],

  // ─── ÉTAPES A→Z (14 étapes détaillées) ─────────────────────────────────
  etapes: [
    // ── ÉTAPE 1 ──
    {
      n: 1,
      phase: 'préparation',
      titre: "Identifier la Région compétente et le dispositif applicable",
      detail: `PREMIÈRE CHOSE À FAIRE : déterminer de quelle Région relève le travailleur, car les dispositifs sont RÉGIONALISÉS depuis 2017.

═══ CRITÈRE : DOMICILE DU TRAVAILLEUR ═══
La Région compétente est celle du DOMICILE du travailleur (pas du siège de l'employeur).

📍 Domicile en Région de Bruxelles-Capitale → Activa.brussels (Actiris)
   19 communes : Bruxelles, Anderlecht, Auderghem, Berchem-Ste-Agathe, Etterbeek,
   Evere, Forest, Ganshoren, Ixelles, Jette, Koekelberg, Molenbeek,
   Saint-Gilles, Saint-Josse, Schaerbeek, Uccle, Watermael-Boitsfort,
   Woluwe-St-Lambert, Woluwe-St-Pierre

📍 Domicile en Région wallonne → Impulsions (Forem)
   Wallonie : provinces de Hainaut, Liège, Luxembourg, Namur, Brabant wallon
   + Communauté germanophone (régime spécifique ADG)

📍 Domicile en Région flamande → VDAB / régime transitoire
   Flandre : provinces de Anvers, Brabant flamand, Flandre occidentale,
   Flandre orientale, Limbourg

⚠️ IMPORTANT : si le travailleur déménage en cours de contrat, la Région initiale reste compétente pour la durée de l'avantage accordé.`,
      delai: "Dès la phase de recrutement",
      formulaire: null,
      ou: "Vérifier la carte d'identité / domicile légal du candidat",
      obligatoire: true,
      duree_estimee: '15 minutes',
    },

    // ── ÉTAPE 2 ──
    {
      n: 2,
      phase: 'préparation',
      titre: "Vérifier l'éligibilité du candidat auprès de l'organisme régional",
      detail: `Avant toute démarche, vérifier formellement que le candidat remplit les conditions d'inscription comme demandeur d'emploi.

═══ BRUXELLES — ACTIRIS ═══
Contacter Actiris Employeurs :
• Tél : 02 505 79 15 (ligne employeurs)
• www.actiris.brussels → Espace employeurs → Aides à l'emploi
• Demander l'attestation d'inscription du candidat
• Vérifier : date d'inscription, durée d'inoccupation, statut actuel

═══ WALLONIE — FOREM ═══
Contacter le Forem :
• Tél : 071 20 61 11 (service employeurs)
• www.leforem.be → Employeurs → Aides à l'emploi
• Demander l'historique d'inscription du candidat
• Vérifier : date inscription, périodes d'inoccupation, formations suivies

═══ FLANDRE — VDAB ═══
Contacter le VDAB :
• Tél : 0800 30 700
• www.vdab.be → Werkgevers → Financiële voordelen
• Vérifier les mesures transitoires ou VOP disponibles

═══ DOCUMENTS À DEMANDER AU CANDIDAT ═══
1. Carte d'identité (vérifier domicile)
2. Attestation d'inscription comme DE (date d'inscription)
3. Historique d'occupation (vérifier absence d'emploi pendant la période)
4. Carte Activa si déjà obtenue (vérifier validité)

⚠️ L'inscription doit être CONTINUE : toute interruption (travail >45 jours, radiation) peut remettre le compteur à zéro.`,
      delai: "Avant engagement — prévoir 1-2 semaines",
      formulaire: "Attestation d'inscription DE (délivrée par Actiris/Forem/VDAB)",
      ou: "Actiris (BXL) / Forem (WAL) / VDAB (VL)",
      obligatoire: true,
      duree_estimee: '1-2 semaines',
    },

    // ── ÉTAPE 3 ──
    {
      n: 3,
      phase: 'préparation',
      titre: "Le travailleur demande sa carte Activa / attestation à l'ONEM",
      detail: `C'est le TRAVAILLEUR LUI-MÊME qui doit demander la carte Activa. L'employeur ne peut PAS la demander à sa place.

═══ PROCÉDURE POUR LE TRAVAILLEUR ═══

1. Se rendre chez son organisme de paiement des allocations :
   • FGTB (ABVV) — syndicat socialiste
   • CSC (ACV) — syndicat chrétien
   • CGSLB (ACLVB) — syndicat libéral
   • CAPAC — Caisse Auxiliaire de Paiement (organisme public)

2. Demander le formulaire C63 (demande de carte Activa)

3. L'organisme de paiement transmet la demande au bureau de chômage de l'ONEM

4. L'ONEM vérifie les conditions :
   • Durée d'inscription comme DE
   • Absence d'emploi pendant la période
   • Conditions d'âge
   • Région de domicile

5. L'ONEM délivre la CARTE ACTIVA contenant :
   • Identité du travailleur (nom, NISS)
   • Durée de l'avantage accordé (nombre de mois)
   • Montant de l'allocation de travail (ex: 500€/mois)
   • Date de validité (l'engagement doit avoir lieu AVANT cette date)
   • Code réduction ONSS applicable

═══ DÉLAI DE TRAITEMENT ═══
⏱️ Compter 2 à 4 semaines entre la demande et la réception de la carte.
Dans certains cas complexes : jusqu'à 6 semaines.

💡 CONSEIL : demander au candidat d'entamer cette démarche DÈS que la sélection est confirmée, pour ne pas retarder l'engagement.

═══ SI LE CANDIDAT N'A PAS D'ORGANISME DE PAIEMENT ═══
→ Il peut s'adresser directement à la CAPAC (Caisse Auxiliaire de Paiement des Allocations de Chômage)
• www.hvkw-capac.fgov.be
• Bureaux dans chaque ville principale
• Service gratuit (pas de cotisation syndicale)`,
      delai: "AVANT l'engagement — prévoir 2 à 4 semaines de traitement",
      formulaire: "Formulaire C63 — Demande de carte Activa",
      ou: "ONEM via organisme de paiement : FGTB / CSC / CGSLB / CAPAC",
      obligatoire: true,
      duree_estimee: '2-4 semaines',
    },

    // ── ÉTAPE 4 ──
    {
      n: 4,
      phase: 'préparation',
      titre: "Réceptionner et vérifier la carte Activa",
      detail: `À la réception de la carte Activa par le travailleur, l'employeur doit la vérifier MINUTIEUSEMENT avant de procéder à l'engagement.

═══ VÉRIFICATIONS OBLIGATOIRES ═══

✅ 1. IDENTITÉ — Le nom et le NISS correspondent au candidat sélectionné
✅ 2. DATE DE VALIDITÉ — L'engagement doit avoir lieu AVANT la date d'expiration
✅ 3. DURÉE DE L'AVANTAGE — Nombre de mois (6, 12, 18, 24, 30 mois)
✅ 4. MONTANT ALLOCATION — Montant mensuel de l'allocation de travail (ex: 500€)
✅ 5. CODE RÉDUCTION ONSS — Le code applicable pour la DmfA (3400, 3401)
✅ 6. RÉGION — Correspond bien au dispositif identifié (étape 1)

═══ ACTIONS ═══
• PHOTOCOPIER recto et verso de la carte
• ARCHIVER la copie dans le dossier du travailleur
• NOTER les dates clés dans le calendrier (début, fin, renouvellement éventuel)

═══ SI LA CARTE EST EXPIRÉE ═══
→ Le travailleur doit redemander une NOUVELLE carte (nouveau C63)
→ L'ONEM réévalue les conditions à la date de la nouvelle demande
→ Délai : à nouveau 2-4 semaines

═══ SI LA CARTE EST REFUSÉE ═══
Motifs possibles de refus :
• Durée d'inscription insuffisante
• Période de travail pendant l'inscription (>45 jours)
• Conditions d'âge non remplies
• Radiation de l'inscription comme DE

Recours possible : dans les 3 mois auprès du Tribunal du travail.`,
      delai: "Dès réception — AVANT signature du contrat",
      formulaire: "Carte Activa (délivrée par l'ONEM) — vérification + copie",
      ou: null,
      obligatoire: true,
      duree_estimee: '30 minutes',
    },

    // ── ÉTAPE 5 ──
    {
      n: 5,
      phase: 'engagement',
      titre: "Rédiger le contrat de travail — CDI obligatoire ou CDD ≥ durée Activa",
      detail: `Le contrat de travail doit respecter des CONDITIONS SPÉCIFIQUES pour maintenir le droit à l'avantage Activa.

═══ TYPE DE CONTRAT ═══

✅ CDI (durée indéterminée) → FORTEMENT RECOMMANDÉ
   • Sécurise l'avantage pour toute sa durée
   • Pas de risque de perte en cas de renouvellement raté

✅ CDD (durée déterminée) → ACCEPTÉ sous conditions
   • La durée du CDD doit être AU MOINS ÉGALE à la durée de la carte Activa
   • Ex: carte = 24 mois → CDD minimum 24 mois
   • ❌ CDD < durée carte = PERTE TOTALE DE L'AVANTAGE

✅ Temps plein → Avantage maximal
✅ Temps partiel → ACCEPTÉ mais :
   • L'allocation de travail est réduite PROPORTIONNELLEMENT au régime
   • Ex: mi-temps = allocation ÷ 2
   • La réduction ONSS est aussi proportionnelle
   • Minimum requis : 1/3 temps (12h40/semaine)

═══ MENTIONS OBLIGATOIRES DU CONTRAT ═══
• Identité des parties (nom, NISS, adresse)
• Date de début d'exécution
• Fonction / description de poste
• Rémunération brute (au moins le minimum barémique de la CP)
• Durée du travail (temps plein ou temps partiel + fraction + horaire)
• Lieu de travail
• Commission paritaire applicable
• Référence à la carte Activa (recommandé mais pas légalement obligatoire)

═══ RÉMUNÉRATION MINIMUM ═══
Le travailleur Activa doit recevoir au MINIMUM le salaire barémique de la CP applicable.
L'allocation de travail ne peut PAS justifier un salaire inférieur au barème.

Le travailleur perçoit au total : salaire net employeur + allocation ONEM = salaire net normal.`,
      delai: "Signé au plus tard le 1er jour de travail",
      formulaire: "Contrat de travail CDI (recommandé) ou CDD ≥ durée carte Activa",
      ou: "Modèle Aureus Social Pro → Contrats Légaux / Secrétariat social",
      obligatoire: true,
      duree_estimee: '1-2 jours',
    },

    // ── ÉTAPE 6 ──
    {
      n: 6,
      phase: 'engagement',
      titre: "DIMONA IN — Déclaration immédiate d'emploi",
      detail: `Déclaration DIMONA standard — OBLIGATOIRE avant le début du travail.

═══ PROCÉDURE ═══
Identique à tout engagement (voir procédure Premier Engagement → étape 5).

Points de vigilance spécifiques Activa :
• Le type de travailleur = "ordinaire" (pas de code spécial Activa dans DIMONA)
• La DIMONA ne mentionne PAS la carte Activa — c'est dans la DmfA que la réduction est demandée
• Vérifier que le NISS est correct (correspond à la carte Activa)

═══ RAPPEL SANCTIONS ═══
Non-déclaration ou déclaration tardive :
• Amende : 2.400€ à 24.000€ par travailleur
• Présomption de travail au noir
• Risque de perte de l'avantage Activa en cas de contrôle`,
      delai: "AVANT le 1er jour de travail",
      formulaire: "DIMONA type IN (déclaration électronique)",
      ou: "www.socialsecurity.be → DIMONA",
      obligatoire: true,
      duree_estimee: '15 minutes',
    },

    // ── ÉTAPE 7 ──
    {
      n: 7,
      phase: 'engagement',
      titre: "Formulaire C63 — Compléter la partie employeur et renvoyer",
      detail: `Le formulaire C63 a DEUX PARTIES : la partie travailleur (déjà complétée lors de la demande de carte) et la PARTIE EMPLOYEUR à compléter par vous.

═══ INFORMATIONS À COMPLÉTER ═══

Section "Employeur" :
• Numéro ONSS employeur (format : XXX-XXXXXXX-XX)
• Numéro d'entreprise BCE (format : 0XXX.XXX.XXX)
• Dénomination sociale
• Adresse du siège social
• Commission paritaire (numéro + dénomination)

Section "Engagement" :
• Date effective d'entrée en service
• Type de contrat : CDI / CDD (+ date de fin si CDD)
• Régime de travail : temps plein (38h/sem) / temps partiel (fraction ex: 19h/38h)
• Horaire de travail (si temps partiel : horaire fixe ou variable)
• Rémunération brute mensuelle
• Fonction du travailleur
• Lieu de travail

═══ OÙ ENVOYER ═══
→ Bureau de chômage de l'ONEM du DOMICILE du travailleur

Bureaux de chômage principaux :
• Bruxelles : rue de Brabant 62, 1210 Bruxelles
• Liège : quai du Roi Albert 7, 4020 Liège
• Charleroi : rue de l'Écluse 16, 6000 Charleroi
• Namur : rue Château des Balances 14, 5000 Namur
• Mons : Digue des Peupliers 71, 7000 Mons
• Anvers : Brusselstraat 26, 2000 Antwerpen
• Gand : Administratief Centrum, 9000 Gent

Ou en ligne via l'application sécurisée de l'ONEM (si disponible).

═══ DÉLAI ═══
Dans les 4 JOURS OUVRABLES suivant l'engagement.
⚠️ Le dépassement du délai peut entraîner un report du début de l'allocation de travail.`,
      delai: "Dans les 4 jours ouvrables suivant l'engagement",
      formulaire: "Formulaire C63 — partie employeur",
      ou: "Bureau de chômage ONEM du domicile du travailleur",
      obligatoire: true,
      duree_estimee: '1 heure',
    },

    // ── ÉTAPE 8 ──
    {
      n: 8,
      phase: 'engagement',
      titre: "Bruxelles UNIQUEMENT — Demander la prime Activa.brussels à Actiris",
      detail: `EN RÉGION BRUXELLOISE UNIQUEMENT, l'employeur peut bénéficier d'une PRIME COMPLÉMENTAIRE versée par Actiris, en plus de la réduction ONSS et de l'allocation de travail.

═══ MONTANTS DE LA PRIME ACTIVA.BRUSSELS ═══

┌──────────────────────────────────┬───────────────┬───────────────┐
│ Profil du travailleur            │ Prime totale  │ Durée         │
├──────────────────────────────────┼───────────────┼───────────────┤
│ DE < 30 ans, inscrit ≥6 mois    │ 5.000€        │ sur 12 mois   │
│ DE 30-56 ans, inscrit ≥12 mois  │ 10.000€       │ sur 24 mois   │
│ DE ≥57 ans, inscrit ≥12 mois    │ 15.750€       │ sur 30 mois   │
└──────────────────────────────────┴───────────────┴───────────────┘

La prime est versée TRIMESTRIELLEMENT par Actiris sur le compte bancaire de l'employeur.

═══ PROCÉDURE DE DEMANDE ═══

1. Se connecter sur www.actiris.brussels → Espace Employeurs → Aides à l'emploi
2. Introduire la demande de prime dans les 3 MOIS suivant l'engagement
3. Joindre les documents :
   • Copie du contrat de travail signé
   • Copie de la carte Activa (recto/verso)
   • Attestation Actiris du travailleur
   • Numéro de compte bancaire de l'employeur (IBAN)
4. Actiris vérifie les conditions et confirme l'octroi
5. Versement trimestriel sur le compte de l'employeur

═══ CONDITIONS ═══
• Le travailleur doit être domicilié en Région bruxelloise AU MOMENT de l'engagement
• L'employeur doit être en ordre de cotisations ONSS
• Le contrat doit être en cours d'exécution à chaque échéance trimestrielle
• Si le travailleur quitte l'entreprise, la prime est interrompue

⚠️ DEADLINE : la demande DOIT être introduite dans les 3 mois. Passé ce délai, la prime est PERDUE.

POUR LA WALLONIE ET LA FLANDRE : pas de prime régionale complémentaire de ce type. L'avantage se limite à la réduction ONSS + allocation de travail.`,
      delai: "Dans les 3 mois suivant l'engagement (Bruxelles uniquement)",
      formulaire: "Demande de prime Activa.brussels (en ligne sur actiris.brussels)",
      ou: "Actiris — www.actiris.brussels → Employeurs → Aides → Activa.brussels",
      obligatoire: false, // Pas obligatoire car uniquement BXL
      duree_estimee: '1-2 heures',
    },

    // ── ÉTAPE 9 ──
    {
      n: 9,
      phase: 'gestion_mensuelle',
      titre: "DmfA — Activer la réduction ONSS Activa dans la déclaration trimestrielle",
      detail: `La réduction ONSS Activa est demandée via la DmfA (déclaration trimestrielle ONSS).

═══ CODES RÉDUCTION DMFA ═══

┌─────────────────────────────────────────────────┬──────────────┐
│ Situation                                       │ Code DmfA    │
├─────────────────────────────────────────────────┼──────────────┤
│ Allocation de travail + réduction ONSS          │ 3400         │
│ Réduction ONSS uniquement (pas d'allocation)    │ 3401         │
│ Activa.brussels (complément bruxellois)         │ 6300         │
│ Impulsions Wallonie -25 ans                     │ 6320         │
│ Impulsions Wallonie 25+                         │ 6321         │
│ Impulsions Wallonie 58+                         │ 6322         │
└─────────────────────────────────────────────────┴──────────────┘

═══ INFORMATIONS À RENSEIGNER DANS LA DMFA ═══
Bloc "Réduction de cotisations" (bloc 90015) :
• Catégorie de réduction : Activa / Impulsions
• Code réduction applicable (voir tableau)
• Numéro de la carte Activa
• Date de début de la période couverte
• Date de fin prévue
• Forfait de réduction applicable (trimestre)

═══ CALCUL DE LA RÉDUCTION ═══
La réduction est calculée par l'ONSS sur base des données DmfA.
Elle est plafonnée aux cotisations patronales de base dues pour le trimestre.

En cas de temps partiel : la réduction est proportionnelle à la fraction de prestations.
Ex: mi-temps (50%) → réduction = 50% du forfait.

═══ DEADLINES DMFA ═══
• T1 (jan-mars) → au plus tard 30 avril
• T2 (avr-juin) → au plus tard 31 juillet
• T3 (juil-sept) → au plus tard 31 octobre
• T4 (oct-déc) → au plus tard 31 janvier N+1`,
      delai: "Chaque DmfA trimestrielle",
      formulaire: "DmfA — codes réduction 3400/3401/6300/6320/6321/6322",
      ou: "Portail sécurité sociale → DmfA / Secrétariat social / Aureus Social Pro",
      obligatoire: true,
      duree_estimee: "Intégré dans la DmfA trimestrielle",
    },

    // ── ÉTAPE 10 ──
    {
      n: 10,
      phase: 'gestion_mensuelle',
      titre: "Calcul mensuel de la paie — Déduction de l'allocation de travail",
      detail: `Chaque mois, l'allocation de travail est DÉDUITE du salaire net que l'employeur verse au travailleur.

═══ MÉCANISME DE CALCUL ═══

Exemple concret — Employé à 2.800€ brut, allocation Activa 500€/mois :

1. Salaire brut mensuel                        2.800,00€
2. ONSS travailleur (13,07%)                    -365,96€
3. Imposable                                    2.434,04€
4. Précompte professionnel (±22%)               -535,49€
5. CSSS (cotisation spéciale)                    -18,60€
6. Bonus emploi social                           +0,00€
   ─────────────────────────────────────────────────────
7. Salaire NET calculé                         1.879,95€
8. Déduction allocation travail ONEM            -500,00€
   ─────────────────────────────────────────────────────
9. NET versé par l'employeur                   1.379,95€
10. Allocation versée par ONEM au travailleur    +500,00€
    ─────────────────────────────────────────────────────
11. TOTAL perçu par le travailleur             1.879,95€

═══ RÉSULTAT ═══
• Le travailleur reçoit le MÊME montant total que sans Activa
• L'employeur économise 500€/mois sur son versement
• L'ONEM verse directement l'allocation au travailleur via son organisme de paiement

═══ SUR LA FICHE DE PAIE ═══
La fiche de paie doit mentionner :
• La ligne "Allocation de travail Activa" en déduction du net à payer
• Le montant de l'allocation
• Le net effectivement versé par l'employeur

═══ CAS PARTICULIERS ═══
• Maladie : l'allocation est suspendue pendant l'incapacité (la mutuelle prend le relais)
• Congé sans solde : pas d'allocation pour les jours non prestés
• Temps partiel : allocation proportionnelle (ex: mi-temps = 250€)
• Heures supplémentaires : pas d'impact sur l'allocation (montant fixe)`,
      delai: "Chaque mois — intégré dans le calcul de paie",
      formulaire: "Fiche de paie avec mention allocation Activa",
      ou: null,
      obligatoire: true,
      duree_estimee: '15 minutes par mois',
    },

    // ── ÉTAPE 11 ──
    {
      n: 11,
      phase: 'gestion_mensuelle',
      titre: "Formulaire C78 — Attestation mensuelle employeur (CRITIQUE)",
      detail: `Chaque mois, l'employeur DOIT compléter et envoyer le formulaire C78. C'est l'attestation qui permet à l'ONEM de verser l'allocation de travail au travailleur.

⚠️ SANS LE C78, LE TRAVAILLEUR NE REÇOIT PAS SON ALLOCATION ⚠️

═══ CONTENU DU FORMULAIRE C78 ═══

Informations à renseigner :
• Mois concerné (ex: "Janvier 2026")
• Identité du travailleur (nom, NISS)
• Numéro ONSS employeur
• Nombre de jours effectivement prestés dans le mois
• Nombre de jours d'absence avec motif :
  - Maladie (M)
  - Congé annuel (C)
  - Jour férié (F)
  - Absence injustifiée (AI)
  - Formation (FO)
  - Crédit-temps (CT)
• Rémunération brute du mois
• Régime de travail (temps plein / partiel + fraction)
• Confirmation que le contrat est toujours en cours

═══ OÙ ENVOYER ═══
→ Organisme de paiement du TRAVAILLEUR :
  • FGTB (ABVV) — bureau local
  • CSC (ACV) — bureau local
  • CGSLB (ACLVB) — bureau local
  • CAPAC — bureau local

L'organisme de paiement transmet à l'ONEM qui verse l'allocation.

═══ DÉLAI ═══
Avant le 5 du mois SUIVANT le mois concerné.
Ex: C78 de janvier → envoyé avant le 5 février.

═══ CONSÉQUENCE DU NON-ENVOI ═══
• Le travailleur NE REÇOIT PAS son allocation de travail
• Le travailleur vient se plaindre car il manque ±500€ de sa rémunération totale
• Retard de plus de 2 mois : risque de suspension de l'avantage par l'ONEM
• Répétition des retards : risque de perte définitive de l'avantage

═══ AUTOMATISATION ═══
💡 Intégrer l'envoi du C78 dans le processus de clôture mensuelle de la paie.
Aureus Social Pro peut générer automatiquement le C78 à partir des données de paie et de pointage.`,
      delai: "Chaque mois — AVANT le 5 du mois suivant",
      formulaire: "Formulaire C78 — Attestation mensuelle Activa employeur",
      ou: "Organisme de paiement du travailleur (FGTB / CSC / CGSLB / CAPAC)",
      obligatoire: true,
      duree_estimee: '30 minutes par mois',
    },

    // ── ÉTAPE 12 ──
    {
      n: 12,
      phase: 'suivi',
      titre: "Suivi trimestriel — Vérification réduction ONSS + prime Actiris",
      detail: `Chaque trimestre, effectuer un contrôle complet de tous les avantages Activa en cours.

═══ CHECKLIST TRIMESTRIELLE ═══

✅ 1. RÉDUCTION ONSS — Vérifier sur le décompte ONSS :
   • Le code réduction est-il bien appliqué ? (3400/3401/6300/6320-6322)
   • Le montant de la réduction correspond-il au forfait attendu ?
   • La réduction est-elle proportionnelle au temps de travail effectif ?

✅ 2. ALLOCATION DE TRAVAIL — Vérifier :
   • Les C78 ont-ils été envoyés chaque mois du trimestre ?
   • Le travailleur a-t-il bien reçu ses allocations ? (lui demander)
   • Y a-t-il eu des périodes de suspension (maladie, absence) ?

✅ 3. PRIME ACTIRIS (Bruxelles uniquement) — Vérifier :
   • Le versement trimestriel a-t-il été reçu sur le compte ?
   • Le montant correspond-il à l'échéancier prévu ?
   • Si non reçu : contacter Actiris employeurs

✅ 4. COMPTEUR DE DURÉE — Contrôler :
   • Nombre de mois/trimestres déjà écoulés
   • Nombre de mois/trimestres restants
   • Date de fin prévue de l'avantage

✅ 5. ARCHIVAGE — Conserver :
   • Copies des décomptes ONSS
   • Copies des C78 envoyés
   • Confirmations de versement Actiris
   • Tout courrier ONEM/Actiris/Forem reçu`,
      delai: "Chaque trimestre — dans les 15 jours suivant la réception du décompte ONSS",
      formulaire: "Décompte trimestriel ONSS + relevé des versements Actiris",
      ou: "Portail sécurité sociale / Actiris / comptabilité interne",
      obligatoire: true,
      duree_estimee: '1 heure par trimestre',
    },

    // ── ÉTAPE 13 ──
    {
      n: 13,
      phase: 'suivi',
      titre: "Anticipation de la fin de période — Transition budgétaire",
      detail: `3 MOIS avant la fin de la période Activa, préparer la transition pour absorber l'augmentation du coût salarial.

═══ CE QUI CHANGE À LA FIN DE L'ACTIVA ═══

AVANT (pendant Activa) :
• Réduction ONSS : -1.250€/trimestre → 0€
• Allocation de travail : 500€/mois déduit du net → 0€
• Prime Actiris (BXL) : versement trimestriel → 0€

APRÈS (fin Activa) :
• L'employeur paie l'intégralité des cotisations ONSS patronales
• L'employeur verse l'intégralité du salaire net
• Plus de prime régionale

═══ IMPACT BUDGÉTAIRE ═══
Augmentation du coût salarial mensuel :
• Allocation de travail perdue : +500€/mois
• Réduction ONSS perdue : ±417€/mois (1.250€/trimestre ÷ 3)
• Prime Actiris perdue : variable
• TOTAL : +917€ à +1.400€/mois d'augmentation

═══ ACTIONS À ENTREPRENDRE ═══

📅 3 mois avant la fin :
1. Informer la direction de l'augmentation budgétaire
2. Adapter le budget prévisionnel
3. Vérifier si d'autres aides sont disponibles pour ce travailleur :
   • Réduction structurelle ONSS (automatique si bas salaire)
   • Réduction groupe-cible "travailleurs âgés" (si ≥55 ans)
   • Bonus emploi (si bas salaire — automatique dans le calcul ONSS travailleur)

📅 1 mois avant la fin :
4. Confirmer la dernière DmfA avec le code réduction Activa
5. Envoyer le dernier C78
6. Clôturer le suivi Activa dans le dossier du travailleur

📅 Après la fin :
7. Le travailleur RESTE en poste (CDI oblige)
8. Retirer le code réduction Activa de la DmfA suivante
9. Ajuster la fiche de paie (plus de déduction allocation)
10. Le travailleur reçoit son salaire net complet de l'employeur

═══ POSSIBILITÉ DE RÉ-ACTIVATION ═══
Si le travailleur est ensuite licencié et se réinscrit comme DE :
→ Il pourra éventuellement bénéficier d'un nouvel Activa chez un AUTRE employeur
→ Mais PAS chez le même employeur (sauf si >12 mois entre les deux engagements)`,
      delai: "3 mois avant la fin de la période Activa",
      formulaire: null,
      ou: "Gestion interne — budget prévisionnel / comptabilité",
      obligatoire: true,
      duree_estimee: '2-3 heures',
    },

    // ── ÉTAPE 14 ──
    {
      n: 14,
      phase: 'suivi',
      titre: "Contrôle ONEM / Inspection sociale — Préparation",
      detail: `L'ONEM et l'Inspection sociale peuvent effectuer des contrôles sur l'utilisation correcte des avantages Activa. Être PRÊT en permanence.

═══ DOCUMENTS À CONSERVER (7 ANS MINIMUM) ═══

📁 Dossier Activa par travailleur :
1. Copie de la carte Activa (recto/verso)
2. Formulaire C63 complété (partie employeur)
3. Contrat de travail signé
4. Confirmation DIMONA IN
5. Tous les C78 mensuels (copies signées)
6. Fiches de paie mensuelles avec mention allocation
7. Décomptes ONSS trimestriels
8. Confirmation demande prime Actiris (si BXL)
9. Relevés de versement Actiris (si BXL)
10. Toute correspondance ONEM/Actiris/Forem

═══ POINTS DE CONTRÔLE HABITUELS ═══
Les contrôleurs vérifient typiquement :
• La carte Activa était-elle valide AU MOMENT de l'engagement ?
• Le contrat respecte-t-il les conditions (CDI ou CDD ≥ durée) ?
• Les C78 ont-ils été envoyés régulièrement ?
• La réduction ONSS correspond-elle au code autorisé ?
• L'allocation de travail a-t-elle été correctement déduite ?
• Le travailleur n'a-t-il pas été occupé chez le même employeur dans les 12 mois précédents ?

═══ EN CAS DE CONTRÔLE ═══
1. Rester calme et coopératif
2. Fournir les documents demandés
3. Si un document manque : demander un délai raisonnable pour le retrouver
4. En cas de contestation : consulter un avocat en droit social
5. Délai de contestation : 3 mois pour introduire un recours au Tribunal du travail

═══ SANCTIONS POSSIBLES EN CAS D'IRRÉGULARITÉ ═══
• Récupération des réductions ONSS indûment perçues (+ intérêts de retard)
• Récupération des allocations de travail (l'employeur peut être tenu solidairement responsable)
• Récupération de la prime Actiris
• Amendes administratives
• Dans les cas graves : poursuites pénales (Code pénal social)`,
      delai: "En permanence — conservation des documents pendant 7 ans",
      formulaire: "Dossier Activa complet (voir liste des 10 documents ci-dessus)",
      ou: "Archives internes — accessibles sur demande de l'Inspection",
      obligatoire: true,
      duree_estimee: 'Organisation permanente',
    },
  ],

  // ─── ALERTES CRITIQUES ──────────────────────────────────────────────────
  alertes: [
    {
      niveau: 'critique',
      texte: "La carte Activa DOIT être obtenue AVANT l'engagement. Pas de carte = pas d'avantage, même si le travailleur remplit toutes les conditions. AUCUNE rétroactivité possible.",
    },
    {
      niveau: 'critique',
      texte: "Le formulaire C78 mensuel est VITAL. Sans lui, le travailleur ne reçoit pas son allocation de travail de l'ONEM. Intégrer l'envoi du C78 dans la clôture de paie mensuelle.",
    },
    {
      niveau: 'critique',
      texte: "CDD inférieur à la durée de la carte Activa = PERTE TOTALE de l'avantage. Toujours privilégier le CDI pour sécuriser l'aide.",
    },
    {
      niveau: 'important',
      texte: "BRUXELLES : la prime Activa.brussels (jusqu'à 15.750€) doit être demandée à Actiris dans les 3 MOIS suivant l'engagement. Passé ce délai, la prime est définitivement perdue.",
    },
    {
      niveau: 'important',
      texte: "Le licenciement pendant la période Activa peut entraîner le remboursement proportionnel des aides reçues. Vérifier les conditions avant tout licenciement.",
    },
    {
      niveau: 'important',
      texte: "Le temps partiel RÉDUIT proportionnellement tous les avantages : allocation, réduction ONSS et prime Actiris. Minimum requis : 1/3 temps.",
    },
    {
      niveau: 'attention',
      texte: "L'inscription comme DE doit être CONTINUE. Toute interruption de plus de 45 jours (travail, radiation) peut réinitialiser le compteur d'inoccupation.",
    },
    {
      niveau: 'attention',
      texte: "Le travailleur ne peut PAS avoir été occupé chez le MÊME employeur dans les 12 mois précédant l'engagement Activa (sauf exceptions très limitées).",
    },
    {
      niveau: 'info',
      texte: "L'Activa est CUMULABLE avec la réduction structurelle ONSS, mais PAS avec la réduction premier engagement, SINE ou Maribel social pour le même travailleur.",
    },
  ],

  // ─── SIMULATION COMPLÈTE ────────────────────────────────────────────────
  simulations: [
    {
      titre: "Scénario 1 — Bruxelles — DE 35 ans inscrit 18 mois chez Actiris — 2.800€ brut",
      region: 'Bruxelles',
      lignes: [
        { label: 'Salaire brut mensuel', montant: '2.800,00€', type: 'neutre' },
        { label: 'Coût patronal normal (brut + ONSS 25,07%)', montant: '3.501,96€/mois', type: 'neutre' },
        { label: '', montant: '', type: 'separateur' },
        { label: 'Réduction ONSS : 1.500€/trim × 8 trimestres', montant: '12.000,00€', type: 'vert' },
        { label: 'Allocation travail ONEM : 500€/mois × 24 mois', montant: '12.000,00€', type: 'vert' },
        { label: 'Prime Activa.brussels (30-56 ans)', montant: '10.000,00€', type: 'vert' },
        { label: '', montant: '', type: 'separateur' },
        { label: 'ÉCONOMIE TOTALE sur 24 mois', montant: '34.000,00€', type: 'vert_bold' },
        { label: 'Économie mensuelle moyenne', montant: '1.417€/mois', type: 'vert' },
        { label: 'Coût patronal effectif moyen', montant: '2.085€/mois', type: 'vert' },
        { label: 'Réduction du coût salarial', montant: '-40,5%', type: 'vert_bold' },
      ],
    },
    {
      titre: "Scénario 2 — Wallonie — DE 23 ans inscrit 8 mois au Forem — 2.500€ brut",
      region: 'Wallonie',
      lignes: [
        { label: 'Salaire brut mensuel', montant: '2.500,00€', type: 'neutre' },
        { label: 'Coût patronal normal (brut + ONSS 25,07%)', montant: '3.126,75€/mois', type: 'neutre' },
        { label: '', montant: '', type: 'separateur' },
        { label: 'Réduction ONSS : 1.000€/trim × 8 trimestres', montant: '8.000,00€', type: 'vert' },
        { label: 'Impulsion -25 ans : 500€/mois × 24 mois', montant: '12.000,00€', type: 'vert' },
        { label: '', montant: '', type: 'separateur' },
        { label: 'ÉCONOMIE TOTALE sur 24 mois', montant: '20.000,00€', type: 'vert_bold' },
        { label: 'Économie mensuelle moyenne', montant: '833€/mois', type: 'vert' },
        { label: 'Réduction du coût salarial', montant: '-26,6%', type: 'vert_bold' },
      ],
    },
    {
      titre: "Scénario 3 — Bruxelles — DE 59 ans inscrit 24 mois — 3.200€ brut",
      region: 'Bruxelles',
      lignes: [
        { label: 'Salaire brut mensuel', montant: '3.200,00€', type: 'neutre' },
        { label: 'Coût patronal normal (brut + ONSS 25,07%)', montant: '4.002,24€/mois', type: 'neutre' },
        { label: '', montant: '', type: 'separateur' },
        { label: 'Réduction ONSS : 1.500€/trim × 12 trimestres', montant: '18.000,00€', type: 'vert' },
        { label: 'Allocation travail ONEM : 500€/mois × 18 mois', montant: '9.000,00€', type: 'vert' },
        { label: 'Prime Activa.brussels (≥57 ans)', montant: '15.750,00€', type: 'vert' },
        { label: '', montant: '', type: 'separateur' },
        { label: 'ÉCONOMIE TOTALE sur 30 mois', montant: '42.750,00€', type: 'vert_bold' },
        { label: 'Économie mensuelle moyenne', montant: '1.425€/mois', type: 'vert' },
        { label: 'Réduction du coût salarial', montant: '-35,6%', type: 'vert_bold' },
      ],
    },
  ],

  // ─── FAQ ────────────────────────────────────────────────────────────────
  faq: [
    {
      q: "Puis-je cumuler Activa + premier engagement pour le même travailleur ?",
      r: "NON. Vous ne pouvez pas cumuler deux réductions groupe-cible pour le même travailleur sur le même trimestre. Choisissez la plus avantageuse. En général, pour un 1er travailleur → premier engagement (illimité) est plus avantageux que Activa (limité dans le temps)."
    },
    {
      q: "Le candidat a travaillé 3 semaines en intérim il y a 4 mois. Perd-il son statut de DE longue durée ?",
      r: "Non, les périodes d'intérim de courte durée (≤45 jours) ne brisent généralement pas la continuité de l'inscription comme DE. Vérifier avec l'ONEM pour confirmation."
    },
    {
      q: "Mon entreprise est à Bruxelles mais le travailleur habite en Wallonie. Quel dispositif ?",
      r: "C'est le DOMICILE du travailleur qui détermine la Région compétente. Si le travailleur habite en Wallonie → c'est le dispositif Impulsions (Forem) qui s'applique, pas Activa.brussels."
    },
    {
      q: "La carte Activa expire dans 5 jours et je n'ai pas encore finalisé le recrutement. Que faire ?",
      r: "L'engagement DOIT avoir lieu AVANT l'expiration. Si c'est impossible, le travailleur doit redemander une nouvelle carte (C63). Le délai sera de 2-4 semaines. Il n'y a AUCUNE possibilité de prolongation d'une carte expirée."
    },
    {
      q: "Le travailleur tombe malade pendant la période Activa. L'avantage continue ?",
      r: "Pendant la maladie : l'allocation de travail est SUSPENDUE (la mutuelle prend le relais). La réduction ONSS continue sur les jours de salaire garanti. La durée de l'Activa n'est PAS prolongée pour compenser la maladie."
    },
    {
      q: "J'ai oublié d'envoyer les C78 des 3 derniers mois. Puis-je régulariser ?",
      r: "OUI, envoyez immédiatement les C78 manquants. L'ONEM peut effectuer un paiement rétroactif de l'allocation. Mais au-delà de 6 mois de retard, la régularisation devient très difficile. Contactez l'organisme de paiement du travailleur."
    },
    {
      q: "Puis-je licencier un travailleur Activa sans conséquence sur les aides reçues ?",
      r: "Le licenciement est légalement possible (pas de protection spéciale Activa), mais : 1) la prime Actiris est immédiatement interrompue, 2) un licenciement précoce peut déclencher un contrôle ONEM, 3) l'employeur ne devra pas rembourser les aides déjà consommées SAUF en cas de fraude avérée."
    },
    {
      q: "Le travailleur Activa passe de temps plein à mi-temps en cours de contrat. Impact ?",
      r: "Tous les avantages sont recalculés proportionnellement : allocation de travail ÷ 2, réduction ONSS ÷ 2, prime Actiris ÷ 2. La durée de l'avantage reste la même (pas de prolongation). Mettre à jour la DmfA et informer l'organisme de paiement."
    },
    {
      q: "Mon secrétariat social gère-t-il automatiquement les démarches Activa ?",
      r: "Le secrétariat social gère la DmfA (code réduction ONSS) et la déduction de l'allocation sur la fiche de paie. Par contre, il NE gère PAS : la demande de carte Activa (c'est le travailleur), la demande de prime Actiris (c'est l'employeur), le C78 mensuel (souvent à charge de l'employeur). Vérifier avec votre SS."
    },
  ],

  // ─── FORMULAIRES & LIENS UTILES ────────────────────────────────────────
  formulaires: [
    { nom: 'Formulaire C63 — Demande carte Activa', url: 'https://www.onem.be/fr/formulaires/c63', type: 'onem' },
    { nom: 'Formulaire C78 — Attestation mensuelle', url: 'https://www.onem.be/fr/formulaires/c78', type: 'onem' },
    { nom: 'Actiris — Prime Activa.brussels', url: 'https://www.actiris.brussels/fr/employeurs/aides-a-lemploi/', type: 'en_ligne' },
    { nom: 'Forem — Impulsions', url: 'https://www.leforem.be/entreprises/aides-financieres-engager.html', type: 'en_ligne' },
    { nom: 'VDAB — Mesures activation', url: 'https://www.vdab.be/werkgevers', type: 'en_ligne' },
    { nom: 'DmfA — Codes réduction Activa', url: 'https://www.socialsecurity.be/site_fr/employer/applics/dmfa/index.htm', type: 'en_ligne' },
    { nom: 'ONSS — Instructions administratives', url: 'https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions.html', type: 'en_ligne' },
  ],
};


// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT UI — AFFICHAGE PROCÉDURE ACTIVA
// ═══════════════════════════════════════════════════════════════════════════════

export default function ProcedureActiva() {
  const proc = PROC_ACTIVA;
  const [etapeOuverte, setEtapeOuverte] = useState(null);
  const [etapesValidees, setEtapesValidees] = useState({});
  const [onglet, setOnglet] = useState('etapes');
  const [filtre, setFiltre] = useState('toutes');
  const [simIdx, setSimIdx] = useState(0);

  const toggleEtape = (n) => setEtapeOuverte(etapeOuverte === n ? null : n);
  const toggleValidation = (n) => setEtapesValidees(prev => ({ ...prev, [n]: !prev[n] }));

  const progression = useMemo(() => {
    const total = proc.etapes.filter(e => e.obligatoire).length;
    const faites = proc.etapes.filter(e => e.obligatoire && etapesValidees[e.n]).length;
    return { total, faites, pct: total > 0 ? Math.round((faites / total) * 100) : 0 };
  }, [etapesValidees]);

  const etapesFiltrees = useMemo(() => {
    if (filtre === 'toutes') return proc.etapes;
    return proc.etapes.filter(e => e.phase === filtre);
  }, [filtre]);

  const phases = [
    { id: 'toutes', label: 'Toutes', icon: '📋' },
    { id: 'préparation', label: 'Préparation', icon: '🔍' },
    { id: 'engagement', label: 'Engagement', icon: '✍️' },
    { id: 'gestion_mensuelle', label: 'Gestion mensuelle', icon: '📆' },
    { id: 'suivi', label: 'Suivi & fin', icon: '🔄' },
  ];

  const onglets = [
    { id: 'etapes', label: 'Étapes A→Z', icon: '📋' },
    { id: 'avantages', label: 'Avantages par Région', icon: '💰' },
    { id: 'simulation', label: 'Simulations', icon: '🧮' },
    { id: 'alertes', label: 'Alertes', icon: '⚠️' },
    { id: 'faq', label: 'FAQ', icon: '❓' },
    { id: 'legal', label: 'Base légale', icon: '⚖️' },
  ];

  // ─── STYLES (same dark theme as Premier Engagement) ───
  const st = {
    page: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', maxWidth: 960, margin: '0 auto', padding: 24, background: '#0a0e1a', color: '#e2e8f0', minHeight: '100vh' },
    header: { marginBottom: 32 },
    titre: { fontSize: 28, fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: 12 },
    badge: { fontSize: 13, background: '#3b82f620', color: '#60a5fa', padding: '4px 12px', borderRadius: 20, fontWeight: 600 },
    resume: { fontSize: 15, color: '#94a3b8', marginTop: 12, lineHeight: 1.6 },
    progBar: { background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 24 },
    progLabel: { fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'flex', justifyContent: 'space-between' },
    progTrack: { height: 8, background: '#334155', borderRadius: 4, overflow: 'hidden' },
    progFill: (pct) => ({ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22c55e' : '#3b82f6', borderRadius: 4, transition: 'width 0.5s ease' }),
    tabs: { display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' },
    tab: (a) => ({ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: a ? 700 : 500, background: a ? '#3b82f6' : '#1e293b', color: a ? '#fff' : '#94a3b8', transition: 'all 0.2s' }),
    filtres: { display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' },
    filtre: (a) => ({ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: a ? 700 : 500, background: a ? '#6366f120' : '#1e293b', color: a ? '#818cf8' : '#64748b', transition: 'all 0.2s' }),
    etapeCard: (o, v) => ({ background: v ? '#22c55e08' : '#111827', border: `1px solid ${v ? '#22c55e30' : o ? '#3b82f650' : '#1e293b'}`, borderRadius: 12, marginBottom: 8, overflow: 'hidden', transition: 'all 0.2s', borderLeft: `4px solid ${v ? '#22c55e' : '#3b82f6'}` }),
    etapeHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', userSelect: 'none' },
    etapeNum: (v) => ({ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: v ? '#22c55e' : '#3b82f620', color: v ? '#fff' : '#3b82f6', flexShrink: 0 }),
    etapeTitre: { flex: 1, fontSize: 14, fontWeight: 600, color: '#f1f5f9' },
    etapeBadge: (o) => ({ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: o ? '#ef444420' : '#64748b20', color: o ? '#f87171' : '#64748b', fontWeight: 600 }),
    etapeBody: { padding: '0 16px 16px 60px' },
    etapeDetail: { fontSize: 13, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-line' },
    etapeMeta: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    metaItem: (c) => ({ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: `${c}15`, color: c, display: 'flex', alignItems: 'center', gap: 4 }),
    checkbox: (ch) => ({ width: 20, height: 20, borderRadius: 4, border: `2px solid ${ch ? '#22c55e' : '#475569'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: ch ? '#22c55e' : 'transparent', transition: 'all 0.2s' }),
    sectionTitre: { fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 16 },
    card: { background: '#111827', border: '1px solid #1e293b', borderRadius: 12, padding: 16, marginBottom: 8 },
    alerteCard: (n) => ({ background: n === 'critique' ? '#dc262610' : n === 'important' ? '#f9731620' : n === 'attention' ? '#eab30815' : '#3b82f610', border: `1px solid ${n === 'critique' ? '#dc262640' : n === 'important' ? '#f9731640' : n === 'attention' ? '#eab30830' : '#3b82f630'}`, borderRadius: 12, padding: 16, marginBottom: 8 }),
    alerteNiveau: (n) => ({ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: n === 'critique' ? '#ef4444' : n === 'important' ? '#f97316' : n === 'attention' ? '#eab308' : '#3b82f6', marginBottom: 6 }),
    simRow: (t) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: t === 'separateur' ? '0' : '10px 0', borderBottom: t === 'separateur' ? '1px solid #1e293b' : 'none', marginBottom: t === 'separateur' ? 8 : 0 }),
    simLabel: (t) => ({ fontSize: 14, color: t?.includes('vert') ? '#4ade80' : '#cbd5e1', fontWeight: t === 'vert_bold' ? 700 : 400 }),
    simMontant: (t) => ({ fontSize: t === 'vert_bold' ? 18 : 14, fontWeight: t?.includes('vert') ? 700 : 400, color: t?.includes('vert') ? '#4ade80' : '#f1f5f9', fontFamily: 'monospace' }),
    regionCard: (flag) => ({ background: '#111827', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 16 }),
    regionFlag: { fontSize: 24, marginRight: 8 },
    mesureRow: { background: '#0a0e1a', borderRadius: 8, padding: 14, marginBottom: 8, border: '1px solid #1e293b40' },
  };

  return (
    <div style={st.page}>
      {/* ─── HEADER ─── */}
      <div style={st.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={st.titre}>{proc.icon} {proc.titre}</h1>
          <span style={st.badge}>14 étapes</span>
          <span style={{ ...st.badge, background: '#22c55e20', color: '#4ade80' }}>3 Régions</span>
        </div>
        <p style={st.resume}>{proc.resume}</p>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#64748b', background: '#1e293b', padding: '4px 10px', borderRadius: 6 }}>⏱️ Durée : {proc.duree}</span>
          <span style={{ fontSize: 12, color: '#64748b', background: '#1e293b', padding: '4px 10px', borderRadius: 6 }}>💰 Économie max : ±42.750€ (BXL, 57+ ans, 30 mois)</span>
        </div>
      </div>

      {/* ─── BARRE DE PROGRESSION ─── */}
      <div style={st.progBar}>
        <div style={st.progLabel}>
          <span>Progression : {progression.faites}/{progression.total} étapes obligatoires</span>
          <span style={{ fontWeight: 700, color: progression.pct === 100 ? '#22c55e' : '#3b82f6' }}>{progression.pct}%</span>
        </div>
        <div style={st.progTrack}><div style={st.progFill(progression.pct)} /></div>
      </div>

      {/* ─── ONGLETS ─── */}
      <div style={st.tabs}>
        {onglets.map(o => (
          <button key={o.id} style={st.tab(onglet === o.id)} onClick={() => setOnglet(o.id)}>{o.icon} {o.label}</button>
        ))}
      </div>

      {/* ═══ ONGLET ÉTAPES ═══ */}
      {onglet === 'etapes' && (
        <div>
          <div style={st.filtres}>
            {phases.map(p => (
              <button key={p.id} style={st.filtre(filtre === p.id)} onClick={() => setFiltre(p.id)}>{p.icon} {p.label}</button>
            ))}
          </div>
          {etapesFiltrees.map(etape => {
            const o = etapeOuverte === etape.n, v = etapesValidees[etape.n];
            return (
              <div key={etape.n} style={st.etapeCard(o, v)}>
                <div style={st.etapeHeader} onClick={() => toggleEtape(etape.n)}>
                  <div style={st.checkbox(v)} onClick={(e) => { e.stopPropagation(); toggleValidation(etape.n); }}>
                    {v && <span style={{ color: '#fff', fontSize: 14 }}>✓</span>}
                  </div>
                  <div style={st.etapeNum(v)}>{etape.n}</div>
                  <span style={st.etapeTitre}>{etape.titre}</span>
                  <span style={st.etapeBadge(etape.obligatoire)}>{etape.obligatoire ? 'Obligatoire' : 'Conditionnel'}</span>
                  <span style={{ color: '#64748b', fontSize: 18, transition: 'transform 0.2s', transform: o ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                </div>
                {o && (
                  <div style={st.etapeBody}>
                    <div style={st.etapeDetail}>{etape.detail}</div>
                    <div style={st.etapeMeta}>
                      {etape.delai && <span style={st.metaItem('#f59e0b')}>⏰ {etape.delai}</span>}
                      {etape.duree_estimee && <span style={st.metaItem('#8b5cf6')}>⏱️ {etape.duree_estimee}</span>}
                      {etape.formulaire && <span style={st.metaItem('#3b82f6')}>📄 {etape.formulaire}</span>}
                      {etape.ou && <span style={st.metaItem('#64748b')}>📍 {etape.ou}</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ ONGLET AVANTAGES PAR RÉGION ═══ */}
      {onglet === 'avantages' && (
        <div>
          <h2 style={st.sectionTitre}>💰 Avantages détaillés par Région</h2>
          {proc.avantages.map((reg, ri) => (
            <div key={ri} style={st.regionCard(reg.flag)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={st.regionFlag}>{reg.flag}</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>{reg.region}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>{reg.dispositif} — via {reg.organisme}</div>
                </div>
              </div>
              {reg.mesures.map((m, mi) => (
                <div key={mi} style={st.mesureRow}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>{m.profil}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div><span style={{ fontSize: 11, color: '#64748b' }}>Réduction ONSS</span><div style={{ fontSize: 13, color: '#4ade80' }}>{m.reduction_onss}</div></div>
                    <div><span style={{ fontSize: 11, color: '#64748b' }}>Allocation travail</span><div style={{ fontSize: 13, color: '#60a5fa' }}>{m.allocation_travail}</div></div>
                    <div><span style={{ fontSize: 11, color: '#64748b' }}>Prime régionale</span><div style={{ fontSize: 13, color: '#f59e0b' }}>{m.prime_actiris}</div></div>
                    <div><span style={{ fontSize: 11, color: '#64748b' }}>Économie totale</span><div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80' }}>{m.economie_totale}</div></div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ═══ ONGLET SIMULATIONS ═══ */}
      {onglet === 'simulation' && (
        <div>
          <h2 style={st.sectionTitre}>🧮 Simulations d'économie</h2>
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
            {proc.simulations.map((s, i) => (
              <button key={i} style={st.tab(simIdx === i)} onClick={() => setSimIdx(i)}>
                {['🟡 BXL 35 ans', '🔴 WAL 23 ans', '🟡 BXL 59 ans'][i]}
              </button>
            ))}
          </div>
          <div style={st.card}>
            <h3 style={{ fontSize: 15, color: '#94a3b8', marginBottom: 16 }}>{proc.simulations[simIdx].titre}</h3>
            {proc.simulations[simIdx].lignes.map((row, i) => (
              row.type === 'separateur'
                ? <div key={i} style={st.simRow('separateur')} />
                : <div key={i} style={st.simRow(row.type)}>
                    <span style={st.simLabel(row.type)}>{row.label}</span>
                    <span style={st.simMontant(row.type)}>{row.montant}</span>
                  </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ ONGLET ALERTES ═══ */}
      {onglet === 'alertes' && (
        <div>
          <h2 style={st.sectionTitre}>⚠️ Alertes & points de vigilance</h2>
          {proc.alertes.map((a, i) => (
            <div key={i} style={st.alerteCard(a.niveau)}>
              <div style={st.alerteNiveau(a.niveau)}>{a.niveau}</div>
              <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6 }}>{a.texte}</div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ ONGLET FAQ ═══ */}
      {onglet === 'faq' && (
        <div>
          <h2 style={st.sectionTitre}>❓ Questions fréquentes ({proc.faq.length})</h2>
          {proc.faq.map((f, i) => (
            <div key={i} style={st.card}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>Q : {f.q}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>R : {f.r}</div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ ONGLET BASE LÉGALE ═══ */}
      {onglet === 'legal' && (
        <div>
          <h2 style={st.sectionTitre}>⚖️ Base légale ({proc.baseLegale.length} textes)</h2>
          {proc.baseLegale.map((l, i) => (
            <div key={i} style={st.card}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#818cf8', marginBottom: 4 }}>{l.ref}</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>{l.desc}</div>
            </div>
          ))}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginTop: 24, marginBottom: 12 }}>🔗 Formulaires & liens utiles</h3>
          {proc.formulaires.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
              <span style={{ fontSize: 13, color: '#e2e8f0', flex: 1 }}>{f.nom}</span>
              {f.url && <span style={{ fontSize: 12, color: '#3b82f6', fontFamily: 'monospace', wordBreak: 'break-all' }}>{f.url}</span>}
            </div>
          ))}

          {/* Éligibilité détaillée */}
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginTop: 24, marginBottom: 12 }}>👤 Éligibilité — Conditions par Région</h3>
          {Object.entries(proc.eligibilite.travailleurs).map(([region, conditions]) => (
            <div key={region} style={{ ...st.card, marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#818cf8', marginBottom: 8, textTransform: 'capitalize' }}>
                {region === 'bruxelles' ? '🟡' : region === 'wallonie' ? '🔴' : '🟠'} {region}
              </div>
              {conditions.map((c, i) => (
                <div key={i} style={{ fontSize: 13, color: '#94a3b8', paddingLeft: 16, marginBottom: 3 }}>• {c}</div>
              ))}
            </div>
          ))}

          <div style={{ ...st.card, marginTop: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f87171', marginBottom: 8 }}>❌ Exclusions</div>
            {proc.eligibilite.exclusions.map((e, i) => (
              <div key={i} style={{ fontSize: 13, color: '#94a3b8', paddingLeft: 16, marginBottom: 3 }}>• {e}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { PROC_ACTIVA };
