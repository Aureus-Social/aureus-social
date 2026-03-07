'use client';
import { useState, useMemo } from 'react';
import { TX_ONSS_E, TX_ONSS_W, RMMMG } from '@/app/lib/helpers';

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE PROCÉDURES RH — EMBAUCHE & MISE À L'EMPLOI
// Procédure 1/8 : PREMIER ENGAGEMENT (1er au 6e travailleur)
// Aureus Social Pro — v18 — Février 2026
// ═══════════════════════════════════════════════════════════════════════════════

// ─── DATA PROCÉDURE ─────────────────────────────────────────────────────────

const PROC_PREMIER_ENGAGEMENT = {
  id: 'premier_engagement',
  icon: '🥇',
  categorie: 'embauche',
  titre: 'Premier engagement (1er au 6e travailleur)',
  resume: "Exonération ONSS patronale massive pour les 6 premiers travailleurs engagés. Le 1er travailleur bénéficie d'une exonération quasi-totale ILLIMITÉE dans le temps — aucune date de fin.",
  
  // ─── BASE LÉGALE ────────────────────────────────────────────────────────
  baseLegale: [
    { ref: 'Loi-programme 10/02/1998, art. 15-20', desc: 'Cadre légal de la réduction premiers engagements' },
    { ref: 'AR 16/05/2003', desc: 'Modification du régime de réduction des cotisations patronales premiers engagements' },
    { ref: 'Loi 26/12/2013, art. 2-8', desc: 'Réforme majeure : exonération totale illimitée pour le 1er travailleur' },
    { ref: 'AR 28/06/2016', desc: 'Adaptation des montants de réduction (2e au 6e travailleur)' },
    { ref: 'Loi 20/12/2020 (loi-programme)', desc: 'Confirmation du maintien de l\'exonération illimitée 1er travailleur' },
    { ref: 'Instructions ONSS 2024/1', desc: 'Instructions administratives à jour — modalités de calcul et codes DmfA' },
  ],

  // ─── QUI PEUT EN BÉNÉFICIER ─────────────────────────────────────────────
  eligibilite: {
    employeurs: [
      "Tout employeur du secteur privé assujetti à la loi ONSS du 27/06/1969",
      "Personnes physiques ou morales (SPRL/SRL, SA, ASBL, SNC, SComm…)",
      "Professions libérales engageant pour la première fois (médecins, avocats, architectes…)",
      "ASBL (y compris secteur non-marchand)",
    ],
    conditions: [
      "N'avoir JAMAIS occupé simultanément plus de N-1 travailleurs (N = rang du nouvel engagement)",
      "Le calcul porte sur TOUTE l'histoire de l'employeur — pas de remise à zéro",
      "L'employeur ne peut pas être une entreprise qui résulte d'une scission artificielle pour recréer un droit",
    ],
    comptent_dans_calcul: [
      "Travailleurs sous contrat de travail (CDI, CDD, remplacement, travail nettement défini)",
      "Intérimaires mis à disposition dans l'entreprise utilisatrice",
      "Flexi-jobs (depuis 01/01/2018)",
      "Travailleurs occasionnels (horeca 50 jours, agriculture)",
      "Étudiants HORS contingent 600h (étudiants en solidarité = comptent)",
    ],
    ne_comptent_pas: [
      "Dirigeants d'entreprise sous statut indépendant (gérant, administrateur mandataire)",
      "Stagiaires non rémunérés (stages scolaires, stages d'observation)",
      "Bénévoles",
      "Apprentis en formation en alternance (selon les cas — vérifier avec l'ONSS)",
    ],
  },

  // ─── DURÉE & MONTANTS ──────────────────────────────────────────────────
  duree: 'Illimitée pour le 1er travailleur / 13 trimestres consécutifs pour le 2e au 6e',
  avantages: [
    {
      rang: '1er travailleur',
      code_dmfa: '0100',
      reduction_trim: 'Exonération TOTALE',
      duree_trim: 'ILLIMITÉE',
      economie_annuelle: '±10.529€',
      economie_totale: 'Illimitée (±52.647€ sur 5 ans, ±105.294€ sur 10 ans)',
      detail: "Exonération TOTALE des cotisations patronales de base (±25,07% du brut). Durée ILLIMITÉE — pas de date de fin tant que l'employeur ne dépasse pas le seuil. L'avantage se TRANSFÈRE au remplaçant si le 1er travailleur quitte l'entreprise.",
    },
    {
      rang: '2e travailleur',
      code_dmfa: '0101',
      reduction_trim: '-1.550,00€ / trimestre',
      duree_trim: '13 trimestres',
      economie_annuelle: '±6.200€',
      economie_totale: '20.150€ sur 3 ans et 3 mois',
      detail: "Réduction forfaitaire de 1.550€ par trimestre pendant 13 trimestres consécutifs à partir du trimestre de l'engagement.",
    },
    {
      rang: '3e travailleur',
      code_dmfa: '0102',
      reduction_trim: '-1.050,00€ / trimestre',
      duree_trim: '13 trimestres',
      economie_annuelle: '±4.200€',
      economie_totale: '13.650€ sur 3 ans et 3 mois',
      detail: "Réduction forfaitaire de 1.050€ par trimestre pendant 13 trimestres consécutifs.",
    },
    {
      rang: '4e travailleur',
      code_dmfa: '0103',
      reduction_trim: '-1.050,00€ / trimestre',
      duree_trim: '13 trimestres',
      economie_annuelle: '±4.200€',
      economie_totale: '13.650€ sur 3 ans et 3 mois',
      detail: "Réduction forfaitaire de 1.050€ par trimestre pendant 13 trimestres consécutifs.",
    },
    {
      rang: '5e travailleur',
      code_dmfa: '0104',
      reduction_trim: '-1.000,00€ / trimestre',
      duree_trim: '13 trimestres',
      economie_annuelle: '±4.000€',
      economie_totale: '13.000€ sur 3 ans et 3 mois',
      detail: "Réduction forfaitaire de 1.000€ par trimestre pendant 13 trimestres consécutifs.",
    },
    {
      rang: '6e travailleur',
      code_dmfa: '0105',
      reduction_trim: '-1.000,00€ / trimestre',
      duree_trim: '13 trimestres',
      economie_annuelle: '±4.000€',
      economie_totale: '13.000€ sur 3 ans et 3 mois',
      detail: "Réduction forfaitaire de 1.000€ par trimestre pendant 13 trimestres consécutifs.",
    },
  ],

  // ─── ÉTAPES A→Z (12 étapes détaillées) ─────────────────────────────────
  etapes: [
    // ── ÉTAPE 1 ──
    {
      n: 1,
      phase: 'préparation',
      titre: "Vérifier l'éligibilité de l'employeur",
      detail: `Contrôler via le répertoire ONSS que l'employeur n'a JAMAIS dépassé N-1 travailleurs occupés SIMULTANÉMENT sur l'ensemble de son historique.

Comment vérifier :
1. Connectez-vous au portail de la sécurité sociale (www.socialsecurity.be)
2. Accédez au répertoire employeur avec votre eID ou itsme
3. Consultez l'historique d'occupation → nombre max de travailleurs par trimestre
4. Vérifiez que le maximum n'a JAMAIS atteint N travailleurs

Comptent dans le calcul :
• Tous les contrats de travail (CDI, CDD, remplacement)
• Intérimaires mis à disposition chez vous (même si l'agence est l'employeur juridique)
• Flexi-jobs (secteur horeca, commerce, etc.)
• Étudiants HORS contingent 600h
• Travailleurs occasionnels (horeca 50 jours, agriculture)

Ne comptent PAS :
• Dirigeants indépendants (gérant/administrateur sous mandat)
• Stagiaires non rémunérés
• Bénévoles
• Apprentis en alternance (à vérifier au cas par cas)

⚠️ En cas de doute : contacter l'ONSS au 02 511 51 51 pour une vérification formelle.`,
      delai: "Avant toute démarche d'engagement",
      formulaire: null,
      ou: "www.socialsecurity.be → Répertoire employeur → Historique d'occupation",
      obligatoire: true,
      duree_estimee: '1 jour',
    },

    // ── ÉTAPE 2 ──
    {
      n: 2,
      phase: 'préparation',
      titre: "Inscription ONSS (si nouvel employeur)",
      detail: `Si vous n'avez pas encore de numéro ONSS employeur, vous devez vous inscrire AVANT tout engagement.

Procédure d'inscription :
1. Connectez-vous sur www.socialsecurity.be avec votre eID ou itsme
2. Sélectionnez "Inscription employeur" → "Nouvelle inscription"
3. Complétez le formulaire d'identification :
   • Numéro d'entreprise BCE (format : 0XXX.XXX.XXX)
   • Forme juridique (SRL, SA, ASBL, personne physique…)
   • Adresse du siège social
   • Activité principale (code NACE)
   • Commission paritaire compétente (ex: CP 200 pour employés, CP 124 pour construction…)
   • Date prévue du 1er engagement
   • Nombre estimé de travailleurs
4. Validez et soumettez
5. Vous recevez un numéro ONSS (format : XXX-XXXXXXX-XX) sous 2-5 jours ouvrables

Ce numéro ONSS est indispensable pour :
• Toute déclaration DIMONA
• La DmfA trimestrielle
• La communication avec l'ONSS, le SPF Finances, les caisses sociales

💡 Si vous avez un secrétariat social, celui-ci peut effectuer l'inscription pour vous.`,
      delai: "2 à 5 jours ouvrables avant le 1er engagement",
      formulaire: "Formulaire d'identification employeur ONSS (en ligne)",
      ou: "www.socialsecurity.be → Services en ligne → Inscription employeur",
      obligatoire: true,
      duree_estimee: '2-5 jours ouvrables',
    },

    // ── ÉTAPE 3 ──
    {
      n: 3,
      phase: 'préparation',
      titre: "Choisir et affilier un secrétariat social agréé (recommandé)",
      detail: `Pas obligatoire légalement mais FORTEMENT recommandé, surtout pour un premier engagement.

Le secrétariat social agréé gère pour vous :
• Calcul des salaires et cotisations sociales
• Établissement des fiches de paie
• Déclarations DIMONA, DmfA, précompte professionnel
• Pécule de vacances, 13e mois, fin d'année
• Documents de sortie (C4, attestation vacances)
• Conseil juridique en droit social

Secrétariats sociaux agréés en Belgique :
• Secrétariat social agréé (liste officielle)
• Consultez socialsecurity.be
• Liantis — www.liantis.be (ex-Zenito + SBB)
• Acerta — www.acerta.be
• pour la liste complète
• Group S — www.groups.be (orienté PME bruxelloises)
• UCM — www.ucm.be (orienté indépendants wallons/bruxellois)

Coût indicatif : 25€ à 60€/mois par travailleur selon les services inclus.

Alternative : gérer en interne avec Aureus Social Pro → module Paie + Déclarations.

⚠️ Si vous choisissez Aureus Social Pro, vous restez responsable de la conformité des déclarations.`,
      delai: "Avant le 1er engagement",
      formulaire: "Convention d'affiliation au secrétariat social",
      ou: "Secrétariat social agréé (liste sur socialsecurity.be)",
      obligatoire: false,
      duree_estimee: '3-7 jours',
    },

    // ── ÉTAPE 4 ──
    {
      n: 4,
      phase: 'engagement',
      titre: "Rédiger le contrat de travail",
      detail: `Le contrat DOIT être écrit en 2 exemplaires originaux, signés par les deux parties AU PLUS TARD le 1er jour de travail.

═══ MENTIONS OBLIGATOIRES ═══
• Identité des parties : nom, prénom, adresse, numéro national (NISS)
• Date de début d'exécution du contrat
• Lieu(x) de travail
• Fonction / titre du poste / description des tâches
• Rémunération brute : montant mensuel (employés) ou horaire (ouvriers)
• Durée du travail : temps plein (38h/sem légal) ou temps partiel (fraction + horaire)
• Nature du contrat : CDI (pas de date de fin) ou CDD (date de fin obligatoire)

═══ MENTIONS RECOMMANDÉES ═══
• Commission paritaire applicable (ex: CP 200, CP 302, CP 330…)
• Avantages extra-légaux : chèques-repas, éco-chèques, assurance groupe, GSM, voiture
• Clause de non-concurrence (si applicable — doit respecter conditions strictes)
• Clause de confidentialité
• Modalités de remboursement de frais
• Période de préavis en cas de rupture (renvoi à la loi du 03/07/1978)
• Référence au règlement de travail

═══ TYPES DE CONTRATS ═══
• CDI : recommandé pour stabiliser la réduction ONSS premier engagement
• CDD : date de fin obligatoire, 4 CDD successifs max (ou durée totale ≤3 ans)
• Contrat de remplacement : pour remplacer un travailleur absent (maternité, maladie…)
• Contrat de travail nettement défini : pour une tâche précise et déterminée

💡 Pour le 1er engagement : le CDI est FORTEMENT recommandé car la réduction est illimitée.`,
      delai: "Signé au plus tard le 1er jour de travail",
      formulaire: "Contrat de travail (CDI recommandé)",
      ou: "Modèle Aureus Social Pro → module Contrats Légaux / Secrétariat social",
      obligatoire: true,
      duree_estimee: '1-2 jours',
    },

    // ── ÉTAPE 5 ──
    {
      n: 5,
      phase: 'engagement',
      titre: "DIMONA IN — Déclaration immédiate d'emploi",
      detail: `Déclaration électronique OBLIGATOIRE à effectuer AVANT le début effectif du travail.

═══ CONTENU DE LA DÉCLARATION ═══
• Type : IN (entrée en service)
• NISS du travailleur (numéro de registre national)
• Date de début d'exécution du contrat
• Date de fin (si CDD uniquement)
• Type de travailleur : ordinaire / étudiant / flexi-job / etc.
• Commission paritaire
• Numéro ONSS employeur

═══ COMMENT DÉCLARER ═══
• En ligne : www.socialsecurity.be → DIMONA → Nouvelle déclaration IN
• Via batch XML : pour les secrétariats sociaux (envoi groupé)
• Via web service : intégration API (pour Aureus Social Pro)
• Par téléphone : 02 511 51 51 (uniquement en cas de panne technique)

═══ CONFIRMATION ═══
Après déclaration, vous recevez :
• Un accusé de réception électronique avec numéro DIMONA
• Ce numéro est la PREUVE que vous avez déclaré le travailleur

═══ SANCTIONS ═══
En cas de non-déclaration ou déclaration TARDIVE :
• Amende administrative de niveau 4 : 2.400€ à 24.000€ par travailleur (Code pénal social art. 181)
• Poursuites pénales possibles
• Présomption de travail au noir jusqu'à preuve du contraire
• Responsabilité solidaire de l'employeur pour les cotisations non payées`,
      delai: "AVANT le début effectif du travail — même jour au plus tard",
      formulaire: "DIMONA type IN (déclaration électronique)",
      ou: "www.socialsecurity.be → DIMONA → Nouvelle déclaration",
      obligatoire: true,
      duree_estimee: '15 minutes',
    },

    // ── ÉTAPE 6 ──
    {
      n: 6,
      phase: 'engagement',
      titre: "Règlement de travail — Obligatoire dès le 1er travailleur",
      detail: `OBLIGATOIRE dès l'engagement du 1er travailleur (Loi 08/04/1965 instituant les règlements de travail).

═══ CONTENU MINIMUM OBLIGATOIRE ═══
1. Horaires de travail : début, fin, pauses, jours prestés
2. Modes de mesurage et contrôle du travail accompli
3. Mode et périodicité de paiement de la rémunération
4. Délais de préavis ou référence aux dispositions légales
5. Droits et obligations du personnel de surveillance
6. Sanctions disciplinaires : nature, montant des amendes, recours
7. Noms des membres du CE (conseil d'entreprise) et du CPPT
8. Adresse du service médical et de premiers secours
9. Dates de vacances annuelles collectives
10. Adresse de l'Inspection du Travail compétente
11. Clause harcèlement moral et sexuel au travail
12. Texte des CCT d'entreprise applicables
13. Information sur la caméra surveillance (si applicable)
14. Procédure en cas de plainte pour violence/harcèlement

═══ PROCÉDURE D'ADOPTION ═══
< 50 travailleurs (pas de CE ni CPPT) :
1. Rédiger le projet de règlement
2. L'afficher dans un endroit apparent pendant 15 jours
3. Les travailleurs notent leurs observations dans un registre
4. Si PAS d'observations → entre en vigueur le 15e jour
5. Si observations → les transmettre à l'Inspection du Travail
6. L'Inspection tente une conciliation
7. Sans accord : la commission paritaire tranche

≥ 50 travailleurs (CE constitué) :
1. Soumettre le projet au Conseil d'Entreprise
2. Le CE négocie les modifications
3. Accord unanime → adoption
4. Pas d'accord → médiation par l'Inspection

═══ DÉPÔT OBLIGATOIRE ═══
Déposer le règlement adopté au bureau régional du SPF Emploi (ETCS) — Contrôle des lois sociales — dans les 8 JOURS suivant l'entrée en vigueur.

Modes de dépôt :
• En ligne : www.reglementdetravail.belgique.be
• Par courrier recommandé au bureau régional

═══ MODIFICATION ULTÉRIEURE ═══
Toute modification suit la même procédure (affichage 15 jours + dépôt).`,
      delai: "Prêt pour le 1er jour de travail / Dépôt dans les 8 jours après adoption",
      formulaire: "Règlement de travail + registre des observations",
      ou: "SPF ETCS — Contrôle des lois sociales (bureau régional) — www.reglementdetravail.belgique.be",
      obligatoire: true,
      duree_estimee: '1-2 semaines',
    },

    // ── ÉTAPE 7 ──
    {
      n: 7,
      phase: 'engagement',
      titre: "Service Externe de Prévention et Protection (SEPP)",
      detail: `Affiliation OBLIGATOIRE dès le 1er travailleur engagé (Code du bien-être au travail, Livre II, Titre 3).

═══ RÔLE DU SEPP ═══
• Surveillance médicale des travailleurs (examens médicaux)
• Analyse des risques psychosociaux et physiques
• Conseils en matière de sécurité et bien-être
• Accompagnement pour le Document Unique d'Évaluation des Risques (DUER)

═══ VISITE MÉDICALE D'EMBAUCHE ═══
OBLIGATOIRE avant le début du travail si le poste est :
• Poste de sécurité : conduite d'engins, travail en hauteur, manipulation de machines dangereuses
• Poste de vigilance : surveillance d'écrans de contrôle, dispatching
• Activité à risque défini : exposition à des agents chimiques, biologiques, bruit >80dB, vibrations
• Contact avec denrées alimentaires : cuisine, boulangerie, distribution food

NON obligatoire mais recommandée pour tous les autres postes.

═══ SEPP AGRÉÉS EN BELGIQUE ═══
• Mensura — www.mensura.be — tél. 078 15 10 10
• Liantis — www.liantis.be — tél. 02 549 73 00
• Cohezio — www.cohezio.be — tél. 02 533 74 88
• Idewe — www.idewe.be — tél. 016 39 04 11
• CESI — www.cesi.be — tél. 071 20 56 20
• SPMT-ARISTA — www.spmt-arista.be — tél. 02 533 74 11

═══ TARIFS (indicatifs 2026) ═══
Groupe tarifaire A (risques élevés) : ±175€/travailleur/an
Groupe tarifaire B (risques moyens) : ±140€/travailleur/an
Groupe tarifaire C (risques faibles) : ±105€/travailleur/an
Groupe tarifaire D (très faibles risques) : ±80€/travailleur/an

═══ PROCÉDURE D'AFFILIATION ═══
1. Choisir un SEPP dans la liste ci-dessus
2. Prendre contact → demander un devis
3. Signer la convention d'affiliation
4. Fournir la liste des postes de travail et les risques associés
5. Planifier la visite médicale d'embauche (si poste à risque)
6. Recevoir les résultats → formulaire d'évaluation de santé`,
      delai: "Convention signée AVANT le 1er jour de travail",
      formulaire: "Convention d'affiliation SEPP + fiche de poste de travail",
      ou: "Mensura / Liantis / Cohezio / Idewe / CESI / SPMT-ARISTA",
      obligatoire: true,
      duree_estimee: '1-2 semaines',
    },

    // ── ÉTAPE 8 ──
    {
      n: 8,
      phase: 'engagement',
      titre: "Assurance accidents du travail — OBLIGATOIRE",
      detail: `Obligation légale de souscrire une police d'assurance accidents du travail AVANT le 1er jour de travail (Loi 10/04/1971).

═══ COUVERTURE OBLIGATOIRE ═══
La police couvre :
• Accidents pendant l'exécution du travail
• Accidents sur le chemin du travail (trajet domicile-lieu de travail)
• Incapacité temporaire : 90% de la rémunération plafonnée
• Incapacité permanente : rente viagère proportionnelle au degré d'invalidité
• Frais médicaux, pharmaceutiques, hospitaliers, prothèses
• Réadaptation professionnelle
• Décès : rente aux ayants droit (30% conjoint, 15-20% par enfant)

═══ ASSUREURS AGRÉÉS PAR FEDRIS ═══
• Ethias — www.ethias.be
• AG Insurance — www.aginsurance.be
• AXA Belgium — www.axa.be
• Baloise — www.baloise.be
• Allianz — www.allianz.be
• Generali — www.generali.be
• Zurich Insurance — www.zurich.be

═══ COÛT (PRIME ANNUELLE) ═══
La prime varie selon le secteur d'activité :
• Bureau / administratif : 0,5% à 1% de la masse salariale brute
• Commerce / services : 1% à 2%
• Industrie légère : 2% à 3%
• Construction / travail en hauteur : 3% à 5%
• Secteurs à haut risque : 5% à 8%

Exemple : 1 employé à 3.500€ brut = 42.000€/an → prime ±420€ à 840€/an

═══ SANCTIONS EN CAS D'ABSENCE D'ASSURANCE ═══
⚠️ TRÈS GRAVES :
1. Fedris (ex-FAT/Fonds des Accidents du Travail) indemnise la victime
2. Fedris se retourne contre l'employeur pour récupérer TOUTES les prestations versées
3. Majoration de prime : Fedris facture 3× la prime normale
4. Amende pénale (Code pénal social)
5. Responsabilité civile personnelle du dirigeant/gérant
6. Interdiction de participer aux marchés publics

═══ PROCÉDURE ═══
1. Demander des devis à 2-3 assureurs
2. Choisir l'offre (rapport couverture/prix)
3. Signer la police AVANT le 1er jour de travail
4. Conserver la police accessible (contrôle Inspection sociale)`,
      delai: "Police signée AVANT le 1er jour de travail — IMPÉRATIF",
      formulaire: "Police d'assurance accidents du travail + attestation de couverture",
      ou: "Assureur agréé Fedris : Ethias / AG / AXA / Baloise / Allianz / Generali / Zurich",
      obligatoire: true,
      duree_estimee: '3-7 jours',
    },

    // ── ÉTAPE 9 ──
    {
      n: 9,
      phase: 'post-engagement',
      titre: "Documents sociaux obligatoires — Registre du personnel",
      detail: `Dès l'engagement, l'employeur DOIT établir et tenir à jour plusieurs documents sociaux.

═══ REGISTRE GÉNÉRAL DU PERSONNEL ═══
Obligatoire (AR 08/08/1980). Inscriptions dans l'ordre chronologique des engagements.

Mentions obligatoires PAR travailleur :
• Numéro d'inscription (ordre chronologique)
• Nom, prénom, date de naissance
• Numéro national (NISS)
• Sexe
• Domicile
• Nationalité
• Type de contrat (CDI/CDD/remplacement)
• Date de début
• Date de fin (si CDD ou sortie)
• Catégorie de personnel (employé/ouvrier)
• Commission paritaire

Format : électronique ou papier. Si électronique → doit pouvoir être imprimé sur demande de l'Inspection.

═══ COMPTE INDIVIDUEL ═══
Obligatoire — un par travailleur par année civile (AR 08/08/1980).

Contenu : identité, rémunérations, retenues (ONSS, PP), avantages en nature, jours prestés/non prestés.
Délai : établi dans les 2 mois suivant la fin du trimestre.
Conservation : 5 ans après la fin du contrat.

═══ FICHE DE PAIE ═══
Remise au travailleur à chaque paiement de rémunération.
Contenu minimum : période, brut, ONSS, imposable, PP, net, avantages.

═══ DÉCOMPTE ANNUEL ═══
Fiche récapitulative annuelle → base pour la fiche fiscale 281.10.
Remise au travailleur au plus tard le 1er mars de l'année suivante.

═══ CONSERVATION ═══
• Documents sociaux : 5 ans après fin du contrat
• Documents fiscaux (281.10, PP) : 7 ans
• Registre du personnel : 5 ans après dernière inscription`,
      delai: "Registre du personnel : dans les 7 jours suivant l'engagement",
      formulaire: "Registre du personnel, compte individuel, fiche de paie",
      ou: "En interne (Aureus Social Pro) ou via secrétariat social",
      obligatoire: true,
      duree_estimee: '1-2 jours',
    },

    // ── ÉTAPE 10 ──
    {
      n: 10,
      phase: 'post-engagement',
      titre: "DmfA — Activer la réduction premier engagement",
      detail: `La réduction premier engagement se demande via la DmfA (Déclaration multiFonctionnelle / multifunctionele Aangifte) — déclaration trimestrielle ONSS.

═══ CODES RÉDUCTION DMFA ═══

┌──────────────┬───────────┬────────────────────┬──────────────┐
│ Rang         │ Code DmfA │ Réduction/trimestre│ Durée        │
├──────────────┼───────────┼────────────────────┼──────────────┤
│ 1er trav.    │ 0100      │ Exonération TOTALE │ ILLIMITÉE    │
│ 2e trav.     │ 0101      │ -1.550,00€         │ 13 trimestres│
│ 3e trav.     │ 0102      │ -1.050,00€         │ 13 trimestres│
│ 4e trav.     │ 0103      │ -1.050,00€         │ 13 trimestres│
│ 5e trav.     │ 0104      │ -1.000,00€         │ 13 trimestres│
│ 6e trav.     │ 0105      │ -1.000,00€         │ 13 trimestres│
└──────────────┴───────────┴────────────────────┴──────────────┘

═══ OÙ RENSEIGNER ═══
Dans la DmfA, bloc "Réduction de cotisations" (bloc 90015) :
• Catégorie de réduction : premiers engagements
• Code réduction : 0100 à 0105
• Date de début de la réduction
• Numéro d'ordre de l'engagement (1er, 2e, 3e…)

═══ PAS DE FORMULAIRE SÉPARÉ ═══
La réduction est déclarée directement dans la DmfA — aucun formulaire séparé à introduire auprès de l'ONSS. Le système calcule automatiquement.

═══ DEADLINES DMFA ═══
• T1 (janvier-mars) → DmfA au plus tard le 30 avril
• T2 (avril-juin) → DmfA au plus tard le 31 juillet
• T3 (juillet-septembre) → DmfA au plus tard le 31 octobre
• T4 (octobre-décembre) → DmfA au plus tard le 31 janvier N+1

═══ CUMUL ═══
• OUI avec la réduction structurelle (haute rémunération / bas salaire)
• NON avec les autres réductions groupe-cible pour le MÊME travailleur
• NON avec Activa, Maribel social, SINE pour le MÊME travailleur

═══ ATTENTION ═══
La réduction du 1er travailleur est PLAFONNÉE aux cotisations patronales de base dues. Si le travailleur est à temps partiel, la réduction est proportionnelle.`,
      delai: "1ère DmfA trimestrielle après l'engagement",
      formulaire: "DmfA électronique — codes réduction 0100 à 0105 (bloc 90015)",
      ou: "Portail sécurité sociale → DmfA → ou via secrétariat social / Aureus Social Pro",
      obligatoire: true,
      duree_estimee: "Intégré dans la DmfA trimestrielle",
    },

    // ── ÉTAPE 11 ──
    {
      n: 11,
      phase: 'post-engagement',
      titre: "Informations au travailleur — Allocations familiales & mutuelle",
      detail: `═══ ALLOCATIONS FAMILIALES ═══
Depuis la régionalisation (01/01/2019), l'employeur n'a PLUS de démarche à effectuer.

Le travailleur s'adresse directement à sa caisse régionale :

🟡 WALLONIE (Groeipakket wallon) :
Famiwal — Parentia — Infino — KidsLife
→ www.aviq.be

🟠 FLANDRE (Groeipakket) :
Fons — Infino — KidsLife — MyFamily
→ www.groeipakket.be

🔵 BRUXELLES (allocations familiales bruxelloises) :
Famiris — Parentia — Infino — KidsLife
→ www.iriscare.brussels

Obligation employeur : informer le travailleur de ses droits lors de l'accueil.

═══ MUTUELLE ═══
Vérifier que le travailleur est affilié à une mutualité :
• Mutualités chrétiennes (MC)
• Mutualités socialistes (Solidaris)
• Mutualités libérales (ML)
• Mutualités libres (selon la région)
• Mutualité neutre
• CAAMI (Caisse Auxiliaire — gratuite)

Le travailleur doit fournir une attestation de sa mutuelle pour le suivi maladie.

═══ INFORMATION GÉNÉRALE ═══
Lors de l'accueil, remettre au travailleur :
1. Copie signée du contrat de travail
2. Règlement de travail
3. Coordonnées du SEPP (médecin du travail)
4. Coordonnées de la personne de confiance (harcèlement/bien-être)
5. Information sur les avantages (chèques-repas, éco-chèques, etc.)
6. Plan d'évacuation et consignes de sécurité`,
      delai: "Le 1er jour de travail — lors de l'accueil",
      formulaire: null,
      ou: "Caisse allocations familiales régionale / Mutualité du travailleur",
      obligatoire: false,
      duree_estimee: '30 minutes',
    },

    // ── ÉTAPE 12 ──
    {
      n: 12,
      phase: 'suivi',
      titre: "Suivi trimestriel — Vérification réduction ONSS",
      detail: `À effectuer CHAQUE TRIMESTRE, aussi longtemps que la réduction est active.

═══ CHECKLIST TRIMESTRIELLE ═══

✅ 1. Vérifier que le code réduction (0100-0105) est bien renseigné dans la DmfA
✅ 2. Contrôler le montant de la réduction sur le décompte ONSS trimestriel
✅ 3. Comparer avec le montant théorique attendu
✅ 4. S'assurer que le nombre total de travailleurs n'a pas dépassé le seuil
✅ 5. Vérifier que la réduction n'a pas expiré (2e au 6e : 13 trimestres max)
✅ 6. Archiver le décompte ONSS (conservation 7 ans minimum)

═══ EN CAS D'ERREUR ═══
1. Introduire une DmfA rectificative (modification de la déclaration originale)
2. Contacter l'ONSS : 02 511 51 51 / contact@onss.fgov.be
3. Conserver la trace de toutes les corrections

═══ RAPPEL IMPORTANT ═══
La réduction du 1er travailleur est ILLIMITÉE dans le temps.
Même après 10, 15, 20 ans → continuer à la déclarer dans chaque DmfA.
Ne jamais oublier : c'est de l'argent gratuit !

═══ TRANSFERT DE LA RÉDUCTION ═══
Si le travailleur qui donne droit à la réduction quitte l'entreprise :
• La réduction se TRANSFÈRE automatiquement au travailleur suivant qui occupe ce "slot"
• Mettre à jour la DmfA : nouveau NISS mais même code réduction
• Le compteur de trimestres NE repart PAS à zéro (sauf pour le 1er = illimité)

═══ PASSAGE AU SUIVANT ═══
Quand vous êtes prêt à engager le 2e travailleur :
→ Reprendre cette procédure à l'étape 1 avec N=2
→ Vérifier que vous n'avez jamais eu 2 travailleurs simultanément
→ Le code DmfA sera 0101 au lieu de 0100`,
      delai: "Chaque trimestre — vérification systématique",
      formulaire: "Décompte trimestriel ONSS + vérification DmfA",
      ou: "Portail sécurité sociale → Décompte ONSS / Secrétariat social / Aureus Social Pro",
      obligatoire: true,
      duree_estimee: '30 minutes par trimestre',
    },
  ],

  // ─── ALERTES CRITIQUES ──────────────────────────────────────────────────
  alertes: [
    {
      niveau: 'critique',
      texte: "TRANSFERT AUTOMATIQUE : si le 1er travailleur quitte l'entreprise, la réduction se transfère au remplaçant. Mettre à jour la DmfA immédiatement avec le NISS du nouveau travailleur.",
    },
    {
      niveau: 'critique',
      texte: "REPRISE D'ENTREPRISE : en cas de cession, fusion ou scission, les travailleurs repris COMPTENT dans l'historique du repreneur. Pas de remise à zéro du compteur.",
    },
    {
      niveau: 'important',
      texte: "INTÉRIMAIRES : même si vous n'êtes pas leur employeur juridique, les intérimaires présents chez vous comptent pour le calcul du nombre maximum de travailleurs.",
    },
    {
      niveau: 'important',
      texte: "SCISSION ARTIFICIELLE : l'ONSS peut refuser la réduction si l'employeur a artificiellement créé une nouvelle entité juridique pour bénéficier à nouveau de la réduction.",
    },
    {
      niveau: 'attention',
      texte: "CUMUL : la réduction premier engagement est cumulable avec la réduction structurelle MAIS PAS avec Activa, Maribel, SINE pour le même travailleur.",
    },
    {
      niveau: 'attention',
      texte: "TEMPS PARTIEL : la réduction est proportionnelle au régime de travail. Un mi-temps = ±50% de la réduction.",
    },
    {
      niveau: 'info',
      texte: "CONTRÔLE ONSS : l'ONSS peut vérifier rétroactivement sur 7 ans. Conserver TOUS les documents justificatifs (contrats, DIMONA, décomptes, correspondances).",
    },
  ],

  // ─── SIMULATION DE COÛT ──────────────────────────────────────────────
  simulation: {
    titre: "Simulation d'économie — 1er travailleur employé à 3.500€ brut/mois",
    parametres: {
      brut_mensuel: 3500,
      statut: 'employé',
      regime: 'temps_plein',
      taux_onss_patronal: TX_ONSS_E,
    },
    calcul: [
      { label: 'Salaire brut mensuel', montant: '3.500,00€', type: 'neutre' },
      { label: 'ONSS patronal mensuel SANS réduction (25,07%)', montant: '877,45€', type: 'neutre' },
      { label: 'ONSS patronal mensuel AVEC réduction 1er eng.', montant: '≈ 0,00€', type: 'vert' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'Économie mensuelle', montant: '877,45€', type: 'vert' },
      { label: 'Économie annuelle (×12)', montant: '10.529,40€', type: 'vert' },
      { label: 'Économie sur 3 ans', montant: '31.588,20€', type: 'vert' },
      { label: 'Économie sur 5 ans', montant: '52.647,00€', type: 'vert_bold' },
      { label: 'Économie sur 10 ans', montant: '105.294,00€', type: 'vert_bold' },
    ],
    comparaison: [
      { label: '2e travailleur : 1.550€/trim × 13 trim', montant: '20.150,00€ sur 3,25 ans', type: 'vert' },
      { label: '3e travailleur : 1.050€/trim × 13 trim', montant: '13.650,00€ sur 3,25 ans', type: 'vert' },
      { label: '4e travailleur : 1.050€/trim × 13 trim', montant: '13.650,00€ sur 3,25 ans', type: 'vert' },
      { label: '5e travailleur : 1.000€/trim × 13 trim', montant: '13.000,00€ sur 3,25 ans', type: 'vert' },
      { label: '6e travailleur : 1.000€/trim × 13 trim', montant: '13.000,00€ sur 3,25 ans', type: 'vert' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'TOTAL des 6 premiers sur 5 ans', montant: '±126.147,00€', type: 'vert_bold' },
    ],
    note: "Ces montants sont indicatifs pour un employé à temps plein. Le 1er travailleur bénéficie d'une économie illimitée dans le temps. La réduction pour le 2e au 6e est limitée à 13 trimestres (3 ans et 3 mois)."
  },

  // ─── FORMULAIRES & LIENS UTILES ────────────────────────────────────────
  formulaires: [
    { nom: 'Inscription employeur ONSS', url: 'https://www.socialsecurity.be', type: 'en_ligne' },
    { nom: 'DIMONA — déclaration IN/OUT', url: 'https://www.socialsecurity.be/site_fr/employer/applics/dimona/index.htm', type: 'en_ligne' },
    { nom: 'DmfA — déclaration trimestrielle', url: 'https://www.socialsecurity.be/site_fr/employer/applics/dmfa/index.htm', type: 'en_ligne' },
    { nom: 'Règlement de travail — dépôt', url: 'https://www.reglementdetravail.belgique.be', type: 'en_ligne' },
    { nom: 'Modèle contrat CDI', url: null, type: 'aureus_social_pro' },
    { nom: 'Modèle contrat CDD', url: null, type: 'aureus_social_pro' },
    { nom: 'Modèle règlement de travail', url: null, type: 'aureus_social_pro' },
  ],

  // ─── FAQ ────────────────────────────────────────────────────────────────
  faq: [
    {
      q: "Si je licencie mon 1er travailleur et en engage un nouveau, est-ce que je garde la réduction ?",
      r: "OUI. La réduction du 1er travailleur se transfère automatiquement au remplaçant. Vous continuez à bénéficier de l'exonération totale illimitée, même si la personne change. Mettez simplement à jour le NISS dans la DmfA."
    },
    {
      q: "Je reprends une entreprise existante avec des travailleurs. Ai-je droit à la réduction ?",
      r: "NON pour les travailleurs repris — ils comptent dans votre historique. Mais SI la reprise vous laisse encore sous le seuil (ex: vous reprenez 2 travailleurs → vous pouvez avoir la réduction pour le 3e, 4e, 5e, 6e)."
    },
    {
      q: "Mon 1er travailleur est à mi-temps. La réduction est-elle réduite ?",
      r: "OUI. La réduction est proportionnelle au régime de travail. Un mi-temps = environ 50% de la réduction. Mais elle reste ILLIMITÉE dans le temps."
    },
    {
      q: "J'ai eu un travailleur il y a 5 ans pendant 2 mois, puis plus personne. J'ai droit au 1er engagement ?",
      r: "NON. Vous avez DÉJÀ eu un 1er travailleur. Vous devez utiliser le code 0101 (2e travailleur) pour votre prochain engagement. L'historique ne s'efface jamais."
    },
    {
      q: "Les étudiants comptent-ils dans le calcul ?",
      r: "C'est nuancé. Les étudiants dans le contingent de 600h (cotisations de solidarité) ne comptent généralement PAS. Les étudiants HORS contingent (cotisations normales) COMPTENT. Vérifier avec l'ONSS en cas de doute."
    },
    {
      q: "Puis-je cumuler premier engagement + Activa pour le même travailleur ?",
      r: "NON. Vous ne pouvez pas cumuler deux réductions groupe-cible pour le même travailleur sur le même trimestre. Choisissez la plus avantageuse. Vous pouvez cumuler avec la réduction structurelle."
    },
    {
      q: "J'ai oublié de déclarer la réduction dans ma DmfA des 3 derniers trimestres. Puis-je récupérer ?",
      r: "OUI. Vous pouvez introduire des DmfA rectificatives pour les trimestres passés. La prescription est de 3 ans pour les rectifications en faveur de l'employeur. Faites-le via le portail ou demandez à votre secrétariat social."
    },
  ],
};


// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT UI — AFFICHAGE PROCÉDURE PREMIER ENGAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function ProcedurePremierEngagement() {
  const proc = PROC_PREMIER_ENGAGEMENT;
  const [etapeOuverte, setEtapeOuverte] = useState(null);
  const [etapesValidees, setEtapesValidees] = useState({});
  const [onglet, setOnglet] = useState('etapes'); // etapes | avantages | simulation | faq
  const [filtre, setFiltre] = useState('toutes'); // toutes | preparation | engagement | post-engagement | suivi

  const toggleEtape = (n) => setEtapeOuverte(etapeOuverte === n ? null : n);
  const toggleValidation = (n) => {
    setEtapesValidees(prev => ({ ...prev, [n]: !prev[n] }));
  };

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
    { id: 'post-engagement', label: 'Post-engagement', icon: '📂' },
    { id: 'suivi', label: 'Suivi', icon: '🔄' },
  ];

  const onglets = [
    { id: 'etapes', label: 'Étapes A→Z', icon: '📋' },
    { id: 'avantages', label: 'Avantages & Montants', icon: '💰' },
    { id: 'simulation', label: 'Simulation', icon: '🧮' },
    { id: 'alertes', label: 'Alertes', icon: '⚠️' },
    { id: 'faq', label: 'FAQ', icon: '❓' },
    { id: 'legal', label: 'Base légale', icon: '⚖️' },
  ];

  // ─── STYLES ───
  const st = {
    page: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', maxWidth: 960, margin: '0 auto', padding: 24, background: '#0a0e1a', color: '#e2e8f0', minHeight: '100vh' },
    header: { marginBottom: 32 },
    titre: { fontSize: 28, fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: 12 },
    badge: { fontSize: 13, background: '#22c55e20', color: '#4ade80', padding: '4px 12px', borderRadius: 20, fontWeight: 600 },
    resume: { fontSize: 15, color: '#94a3b8', marginTop: 12, lineHeight: 1.6 },
    // Progression
    progBar: { background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 24 },
    progLabel: { fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'flex', justifyContent: 'space-between' },
    progTrack: { height: 8, background: '#334155', borderRadius: 4, overflow: 'hidden' },
    progFill: (pct) => ({ height: '100%', width: `${pct}%`, background: pct === 100 ? '#22c55e' : '#3b82f6', borderRadius: 4, transition: 'width 0.5s ease' }),
    // Onglets
    tabs: { display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' },
    tab: (actif) => ({ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: actif ? 700 : 500, background: actif ? '#3b82f6' : '#1e293b', color: actif ? '#fff' : '#94a3b8', transition: 'all 0.2s' }),
    // Filtres phases
    filtres: { display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' },
    filtre: (actif) => ({ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: actif ? 700 : 500, background: actif ? '#6366f120' : '#1e293b', color: actif ? '#818cf8' : '#64748b', transition: 'all 0.2s' }),
    // Étape card
    etapeCard: (ouverte, validee) => ({
      background: validee ? '#22c55e08' : '#111827',
      border: `1px solid ${validee ? '#22c55e30' : ouverte ? '#3b82f650' : '#1e293b'}`,
      borderRadius: 12, marginBottom: 8, overflow: 'hidden', transition: 'all 0.2s',
      borderLeft: `4px solid ${validee ? '#22c55e' : '#3b82f6'}`,
    }),
    etapeHeader: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', userSelect: 'none' },
    etapeNum: (validee) => ({ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: validee ? '#22c55e' : '#3b82f620', color: validee ? '#fff' : '#3b82f6', flexShrink: 0 }),
    etapeTitre: { flex: 1, fontSize: 14, fontWeight: 600, color: '#f1f5f9' },
    etapeBadge: (oblig) => ({ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: oblig ? '#ef444420' : '#64748b20', color: oblig ? '#f87171' : '#64748b', fontWeight: 600 }),
    etapeBody: { padding: '0 16px 16px 60px' },
    etapeDetail: { fontSize: 13, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-line' },
    etapeMeta: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    etapeMetaItem: (couleur) => ({ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: `${couleur}15`, color: couleur, display: 'flex', alignItems: 'center', gap: 4 }),
    // Checkbox
    checkbox: (checked) => ({ width: 20, height: 20, borderRadius: 4, border: `2px solid ${checked ? '#22c55e' : '#475569'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: checked ? '#22c55e' : 'transparent', transition: 'all 0.2s' }),
    // Avantages
    avCard: { background: '#111827', border: '1px solid #1e293b', borderRadius: 12, padding: 16, marginBottom: 8 },
    avRang: { fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 4 },
    avCode: { fontSize: 12, color: '#3b82f6', fontFamily: 'monospace', background: '#3b82f610', padding: '2px 8px', borderRadius: 4 },
    avDetail: { fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginTop: 8 },
    avMontant: { fontSize: 20, fontWeight: 800, color: '#4ade80', marginTop: 8 },
    // Simulation
    simCard: { background: '#111827', border: '1px solid #1e293b', borderRadius: 12, padding: 20 },
    simRow: (type) => ({
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: type === 'separateur' ? '0' : '10px 0',
      borderBottom: type === 'separateur' ? '1px solid #1e293b' : 'none',
      marginBottom: type === 'separateur' ? 8 : 0,
    }),
    simLabel: (type) => ({ fontSize: 14, color: type?.includes('vert') ? '#4ade80' : '#cbd5e1', fontWeight: type === 'vert_bold' ? 700 : 400 }),
    simMontant: (type) => ({ fontSize: type === 'vert_bold' ? 18 : 14, fontWeight: type?.includes('vert') ? 700 : 400, color: type?.includes('vert') ? '#4ade80' : '#f1f5f9', fontFamily: 'monospace' }),
    // Alertes
    alerteCard: (niveau) => ({
      background: niveau === 'critique' ? '#dc262610' : niveau === 'important' ? '#f9731620' : niveau === 'attention' ? '#eab30815' : '#3b82f610',
      border: `1px solid ${niveau === 'critique' ? '#dc262640' : niveau === 'important' ? '#f9731640' : niveau === 'attention' ? '#eab30830' : '#3b82f630'}`,
      borderRadius: 12, padding: 16, marginBottom: 8,
    }),
    alerteNiveau: (niveau) => ({
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
      color: niveau === 'critique' ? '#ef4444' : niveau === 'important' ? '#f97316' : niveau === 'attention' ? '#eab308' : '#3b82f6',
      marginBottom: 6,
    }),
    alerteTexte: { fontSize: 13, color: '#e2e8f0', lineHeight: 1.6 },
    // FAQ
    faqCard: { background: '#111827', border: '1px solid #1e293b', borderRadius: 12, padding: 16, marginBottom: 8, cursor: 'pointer' },
    faqQ: { fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 8 },
    faqR: { fontSize: 13, color: '#94a3b8', lineHeight: 1.6 },
    // Legal
    legalCard: { background: '#111827', border: '1px solid #1e293b', borderRadius: 12, padding: 16, marginBottom: 8 },
    legalRef: { fontSize: 14, fontWeight: 600, color: '#818cf8', marginBottom: 4 },
    legalDesc: { fontSize: 13, color: '#94a3b8' },
    // Section titre
    sectionTitre: { fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 16 },
  };

  return (
    <div style={st.page}>
      {/* ─── HEADER ─── */}
      <div style={st.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={st.titre}>{proc.icon} {proc.titre}</h1>
          <span style={st.badge}>12 étapes</span>
        </div>
        <p style={st.resume}>{proc.resume}</p>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#64748b', background: '#1e293b', padding: '4px 10px', borderRadius: 6 }}>
            ⏱️ Durée : {proc.duree}
          </span>
          <span style={{ fontSize: 12, color: '#64748b', background: '#1e293b', padding: '4px 10px', borderRadius: 6 }}>
            📊 Économie max : ±126.147€ pour les 6 premiers sur 5 ans
          </span>
        </div>
      </div>

      {/* ─── BARRE DE PROGRESSION ─── */}
      <div style={st.progBar}>
        <div style={st.progLabel}>
          <span>Progression : {progression.faites}/{progression.total} étapes obligatoires</span>
          <span style={{ fontWeight: 700, color: progression.pct === 100 ? '#22c55e' : '#3b82f6' }}>{progression.pct}%</span>
        </div>
        <div style={st.progTrack}>
          <div style={st.progFill(progression.pct)} />
        </div>
      </div>

      {/* ─── ONGLETS ─── */}
      <div style={st.tabs}>
        {onglets.map(o => (
          <button key={o.id} style={st.tab(onglet === o.id)} onClick={() => setOnglet(o.id)}>
            {o.icon} {o.label}
          </button>
        ))}
      </div>

      {/* ═══ ONGLET ÉTAPES ═══ */}
      {onglet === 'etapes' && (
        <div>
          {/* Filtres par phase */}
          <div style={st.filtres}>
            {phases.map(p => (
              <button key={p.id} style={st.filtre(filtre === p.id)} onClick={() => setFiltre(p.id)}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          {/* Liste des étapes */}
          {etapesFiltrees.map(etape => {
            const ouverte = etapeOuverte === etape.n;
            const validee = etapesValidees[etape.n];
            return (
              <div key={etape.n} style={st.etapeCard(ouverte, validee)}>
                {/* Header cliquable */}
                <div style={st.etapeHeader} onClick={() => toggleEtape(etape.n)}>
                  <div
                    style={st.checkbox(validee)}
                    onClick={(e) => { e.stopPropagation(); toggleValidation(etape.n); }}
                  >
                    {validee && <span style={{ color: '#fff', fontSize: 14 }}>✓</span>}
                  </div>
                  <div style={st.etapeNum(validee)}>{etape.n}</div>
                  <span style={st.etapeTitre}>{etape.titre}</span>
                  <span style={st.etapeBadge(etape.obligatoire)}>
                    {etape.obligatoire ? 'Obligatoire' : 'Recommandé'}
                  </span>
                  <span style={{ color: '#64748b', fontSize: 18, transition: 'transform 0.2s', transform: ouverte ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                </div>

                {/* Détail */}
                {ouverte && (
                  <div style={st.etapeBody}>
                    <div style={st.etapeDetail}>{etape.detail}</div>
                    <div style={st.etapeMeta}>
                      {etape.delai && (
                        <span style={st.etapeMetaItem('#f59e0b')}>⏰ {etape.delai}</span>
                      )}
                      {etape.duree_estimee && (
                        <span style={st.etapeMetaItem('#8b5cf6')}>⏱️ {etape.duree_estimee}</span>
                      )}
                      {etape.formulaire && (
                        <span style={st.etapeMetaItem('#3b82f6')}>📄 {etape.formulaire}</span>
                      )}
                      {etape.ou && (
                        <span style={st.etapeMetaItem('#64748b')}>📍 {etape.ou}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ ONGLET AVANTAGES ═══ */}
      {onglet === 'avantages' && (
        <div>
          <h2 style={st.sectionTitre}>💰 Réductions ONSS par rang de travailleur</h2>
          {proc.avantages.map((av, i) => (
            <div key={i} style={st.avCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={st.avRang}>{av.rang}</div>
                  <span style={st.avCode}>Code DmfA : {av.code_dmfa}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, color: '#4ade80', fontWeight: 600 }}>{av.reduction_trim}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>pendant {av.duree_trim}</div>
                </div>
              </div>
              <div style={st.avDetail}>{av.detail}</div>
              <div style={st.avMontant}>Économie totale : {av.economie_totale}</div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ ONGLET SIMULATION ═══ */}
      {onglet === 'simulation' && (
        <div>
          <h2 style={st.sectionTitre}>🧮 {proc.simulation.titre}</h2>
          <div style={st.simCard}>
            <h3 style={{ fontSize: 15, color: '#94a3b8', marginBottom: 16 }}>Économie 1er travailleur</h3>
            {proc.simulation.calcul.map((row, i) => (
              row.type === 'separateur'
                ? <div key={i} style={st.simRow('separateur')} />
                : (
                  <div key={i} style={st.simRow(row.type)}>
                    <span style={st.simLabel(row.type)}>{row.label}</span>
                    <span style={st.simMontant(row.type)}>{row.montant}</span>
                  </div>
                )
            ))}
          </div>
          <div style={{ ...st.simCard, marginTop: 16 }}>
            <h3 style={{ fontSize: 15, color: '#94a3b8', marginBottom: 16 }}>Comparaison : économie par rang (2e au 6e)</h3>
            {proc.simulation.comparaison.map((row, i) => (
              row.type === 'separateur'
                ? <div key={i} style={st.simRow('separateur')} />
                : (
                  <div key={i} style={st.simRow(row.type)}>
                    <span style={st.simLabel(row.type)}>{row.label}</span>
                    <span style={st.simMontant(row.type)}>{row.montant}</span>
                  </div>
                )
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 12, fontStyle: 'italic' }}>{proc.simulation.note}</p>
        </div>
      )}

      {/* ═══ ONGLET ALERTES ═══ */}
      {onglet === 'alertes' && (
        <div>
          <h2 style={st.sectionTitre}>⚠️ Alertes & points de vigilance</h2>
          {proc.alertes.map((a, i) => (
            <div key={i} style={st.alerteCard(a.niveau)}>
              <div style={st.alerteNiveau(a.niveau)}>{a.niveau}</div>
              <div style={st.alerteTexte}>{a.texte}</div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ ONGLET FAQ ═══ */}
      {onglet === 'faq' && (
        <div>
          <h2 style={st.sectionTitre}>❓ Questions fréquentes</h2>
          {proc.faq.map((f, i) => (
            <div key={i} style={st.faqCard}>
              <div style={st.faqQ}>Q : {f.q}</div>
              <div style={st.faqR}>R : {f.r}</div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ ONGLET BASE LÉGALE ═══ */}
      {onglet === 'legal' && (
        <div>
          <h2 style={st.sectionTitre}>⚖️ Base légale</h2>
          {proc.baseLegale.map((l, i) => (
            <div key={i} style={st.legalCard}>
              <div style={st.legalRef}>{l.ref}</div>
              <div style={st.legalDesc}>{l.desc}</div>
            </div>
          ))}
          <div style={{ ...st.legalCard, marginTop: 16 }}>
            <div style={st.legalRef}>Éligibilité — Qui compte dans le calcul ?</div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 13, color: '#4ade80', fontWeight: 600, marginBottom: 4 }}>Comptent :</div>
              {proc.eligibilite.comptent_dans_calcul.map((c, i) => (
                <div key={i} style={{ fontSize: 13, color: '#94a3b8', paddingLeft: 16, marginBottom: 2 }}>• {c}</div>
              ))}
              <div style={{ fontSize: 13, color: '#f87171', fontWeight: 600, marginTop: 8, marginBottom: 4 }}>Ne comptent PAS :</div>
              {proc.eligibilite.ne_comptent_pas.map((c, i) => (
                <div key={i} style={{ fontSize: 13, color: '#94a3b8', paddingLeft: 16, marginBottom: 2 }}>• {c}</div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 15, color: '#f8fafc', marginBottom: 12 }}>🔗 Formulaires & liens utiles</h3>
            {proc.formulaires.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
                <span style={{ fontSize: 13, color: '#e2e8f0', flex: 1 }}>{f.nom}</span>
                {f.url ? (
                  <span style={{ fontSize: 12, color: '#3b82f6', fontFamily: 'monospace' }}>{f.url}</span>
                ) : (
                  <span style={{ fontSize: 12, color: '#8b5cf6' }}>📦 {f.type}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EXPORT DATA POUR RÉUTILISATION ──────────────────────────────────────
export { PROC_PREMIER_ENGAGEMENT };
