'use client'
import { useState } from 'react'

const ETAPES = [
  {
    id: 1,
    icon: '📋',
    titre: 'Vérifications préalables',
    delai: 'Avant tout',
    color: '#6366f1',
    obligatoire: true,
    taches: [
      { id: 'niss', label: 'Vérifier le NISS du travailleur', detail: 'Numéro de registre national — 11 chiffres. Format: XX.XX.XX-XXX.XX', lien: 'https://www.ksz-bcss.fgov.be', obligatoire: true },
      { id: 'permis', label: 'Vérifier permis de travail (si étranger)', detail: 'Ressortissant hors UE : permis de travail obligatoire. UE : libre circulation.', obligatoire: false },
      { id: 'visite', label: 'Planifier visite médicale d\'embauche', detail: 'Obligatoire pour postes à risque (code C ou D). À organiser via le service interne ou externe de prévention (SEPPT).', lien: 'https://www.beswic.be', obligatoire: false },
      { id: 'faux_independant', label: '⚠️ Faux indépendant — requalification automatique', detail: "La loi 27/12/2006 fixe 9 critères pour distinguer salarié vs indépendant. Si +3 critères de subordination → requalification en contrat de travail. Conséquences : ONSS arriérés + majorations (10%) + PP + amendes pénales. Contrôlé par inspection sociale et ONSS.", obligatoire: true },
      { id: 'contrat_zero_heure', label: 'Contrat zéro heure interdit en Belgique', detail: "Les contrats sans garantie minimale d'heures (zero-hours) sont interdits depuis la loi travail faisable 2017. Minimum 3h par prestation. Contrat variable (floating) possible mais avec règles strictes d'affichage 5 jours à l'avance.", obligatoire: true },
      { id: 'signature_elec', label: 'Contrat signé électroniquement — valeur légale', detail: "Signature électronique qualifiée (eID, itsme, DocuSign qualifié) = même valeur légale qu'une signature manuscrite (Règlement eIDAS + loi 20/09/2018). Signature par email simple suffit si les deux parties l'acceptent explicitement.", obligatoire: false },
      { id: 'statut_special', label: 'Identifier le statut juridique exact du travailleur', detail: "Étudiant (<600h/an), flexi-job (2e employeur), homeworker (AR 10/10/2012), travailleur domestique (ONSS ménage), dirigeant (mandat vs contrat travail = ONSS différent), artiste (statut ONEM spécial), apprenti CEFA (pas un contrat de travail classique). Chaque statut a un régime ONSS et fiscal distinct.", obligatoire: true },
      { id: 'affichage_oblig', label: 'Affichage obligatoire en entreprise', detail: "Doit être affiché de manière visible : règlement de travail, coordonnées inspection sociale (www.emploi.belgique.be/inspection), liste secouristes, plan évacuation, consignes incendie, numéros d'urgence. Amende si absent lors d'un contrôle.", lien: 'https://www.emploi.belgique.be', obligatoire: true },
      { id: 'vacance_emploi', label: 'Déclarer la vacance d\'emploi (Actiris/VDAB)', detail: "À Bruxelles : déclaration obligatoire à Actiris avant tout recrutement (ordonnance 14/07/2011). En Flandre : déclaration VDAB obligatoire. En Wallonie : déclaration Forem recommandée. Non-respect : amende administrative.", lien: 'https://www.actiris.brussels', obligatoire: false },
      { id: 'anti_discrim', label: 'Respecter les règles anti-discrimination (CCT n°38)', detail: "Critères interdits au recrutement : race, sexe, âge, religion, orientation sexuelle, handicap, conviction politique... Annonce, entretien et sélection doivent être neutres. Sanction : dommages et intérêts illimités.", lien: 'https://www.unia.be', obligatoire: true },
      { id: 'alcool_pre', label: 'Test alcool/drogues pré-emploi interdit', detail: "Un test de dépistage alcool/drogues AVANT l'embauche est illégal en Belgique sauf dérogation accordée par le CPPT (AR 20/07/2011). Seul le médecin du travail peut évaluer l'aptitude au poste.", obligatoire: true },
      { id: 'type_travailleur', label: 'Identifier le type de travailleur', detail: "CDI classique, CDD, étudiant (< 600h/an, cotisations réduits 2,71%+5,42%), flexi-job (2e employeur, cotisation 28,07%), intérimaire, indépendant complémentaire. Chaque statut a des règles ONSS différentes.", obligatoire: true },
      { id: 'langue_contrat', label: '⚠️ Langue du contrat — obligation légale', detail: "À Bruxelles et en Wallonie : contrat en FRANÇAIS obligatoire. En Flandre : contrat en NÉERLANDAIS obligatoire. Un contrat dans la mauvaise langue est NUL et non avenu (décret Vlaamse Gemeenschap + ordonnance bruxelloise).", obligatoire: true },
      { id: 'casier', label: 'Demander extrait de casier judiciaire si nécessaire', detail: 'Requis pour certains secteurs (soins de santé, enfants, sécurité). Pas obligatoire par défaut.', obligatoire: false },
      { id: 'contrat_redige', label: 'Rédiger le contrat de travail', detail: 'CDI, CDD, temps partiel... Doit mentionner : identité, fonction, rémunération, durée du travail, lieu.', lien: 'https://employment.belgium.be', obligatoire: true },
    ]
  },
  {
    id: 2,
    icon: '📡',
    titre: 'Dimona IN',
    delai: 'Avant le 1er jour',
    color: '#ef4444',
    obligatoire: true,
    urgent: true,
    taches: [
      { id: 'dimona_in', moduleAureus: 'declarations', label: '🚨 Soumettre Dimona IN à l\'ONSS', detail: 'OBLIGATOIRE avant le premier jour de travail. Amende : jusqu\'à 1.800€ par travailleur non déclaré. Via portail ONSS ou directement dans Aureus → Déclarations → ONSS & Dimona.', lien: 'https://www.socialsecurity.be', obligatoire: true },
      { id: 'type_contrat', label: 'Choisir le type Dimona correct', detail: 'DWR (ouvrier), EMP (employé), STU (étudiant), IVT (intérimaire), FLX (flexi-job), OTH (autres)', obligatoire: true },
      { id: 'flexi_contrat', label: 'Flexi-job : contrat-cadre + contrat journalier', detail: "Le flexi-job nécessite (1) un contrat-cadre signé en début de relation et (2) un contrat journalier envoyé le jour même via l'app Dimona Flexi ou SMS avant la prestation. Sans ces deux documents : pas de régime flexi, cotisations ordinaires applicables.", obligatoire: false },
      { id: 'mention_dimona', label: 'Mentionner l\'obligation Dimona dans le contrat', detail: "Obligation d'informer le travailleur que sa déclaration Dimona a été faite (numéro de référence ONSS). Bonne pratique légale recommandée par le SPF ETCS.", obligatoire: false },
      { id: 'dimona_out_prev', label: 'Encoder la Dimona OUT préventive pour CDD', detail: "Pour un CDD à durée déterminée, encoder la date de fin prévue dès la Dimona IN. Évite les oublis de Dimona OUT et prouve la durée convenue à l'ONSS.", obligatoire: false },
      { id: 'limosa', label: 'Déclaration LIMOSA si travailleur détaché', detail: "Obligatoire pour tout travailleur étranger détaché temporairement en Belgique. À faire AVANT la prise de service via le portail LIMOSA. Sans cette déclaration : amende jusqu'à 50.000€ par travailleur.", lien: 'https://www.limosa.be', obligatoire: false },
      { id: 'dimona_correctif', label: 'Possibilité de Dimona correctif (8 jours)', detail: "En cas d'erreur dans la Dimona IN (mauvais NISS, date incorrecte...), un correctif peut être soumis dans les 8 jours ouvrables sans pénalité. Au-delà : amende administrative.", obligatoire: false },
      { id: 'reduction_avant', moduleAureus: 'aidesembauche', label: '💶 Demander réduction groupes cibles AVANT la prise de service', detail: "Les réductions ONSS (bas salaires, jeunes -26 ans, travailleurs âgés +55 ans, Activa) doivent être activées AVANT ou le jour de l'entrée en service. Après, certaines sont perdues définitivement. Via portail ONSS ou Actiris.", obligatoire: false },
      { id: 'confirmation', label: 'Vérifier la confirmation ONSS reçue', detail: 'L\'ONSS renvoie un accusé de réception avec numéro de référence. À conserver.', obligatoire: true },
    ]
  },
  {
    id: 3,
    icon: '📝',
    titre: 'Contrat & Documents',
    delai: 'Jour J',
    color: '#f59e0b',
    obligatoire: true,
    taches: [
      { id: 'contrat_signe', label: 'Faire signer le contrat de travail', detail: 'Le travailleur doit recevoir un exemplaire signé avant ou le jour de l\'entrée en service.', obligatoire: true },
      { id: 'reglement', label: 'Remettre le règlement de travail', detail: 'Document légal obligatoire (loi 8/04/1965). Doit mentionner : horaires, rémunération, avantages, procédures disciplinaires.', obligatoire: true },
      { id: 'fiche_salariale', label: 'Informer sur la structure salariale', detail: 'Barème CP applicable, primes éventuelles, chèques-repas, voiture... À documenter.', obligatoire: true },
      { id: 'iban', label: 'Collecter l\'IBAN pour virement salaire', detail: 'Compte bancaire belge ou SEPA. Vérifier le format BE + 14 chiffres.', obligatoire: true },
      { id: 'rgpd_consent', label: 'Faire signer la déclaration RGPD', detail: 'Informer le travailleur du traitement de ses données personnelles (NISS, coordonnées, salaire). Obligatoire RGPD Art.13.', obligatoire: true },
      { id: 'casier_remis', label: 'Remettre fiche de poste & description de fonction', detail: "Recommandé pour cadrer les attentes et faciliter l'évaluation.", obligatoire: false },
      { id: 'non_concurrence', label: 'Clause de non-concurrence si applicable', detail: "Conditions strictes (CCT n°1/1968) : salaire > 43.609€/an, durée max 12 mois, compensation obligatoire (50% rémunération variable). Invalide si salaire < seuil.", obligatoire: false },
      { id: 'deconnexion', label: 'Droit à la déconnexion — entreprises +20 personnes', detail: "Depuis la loi 26/03/2018 : les entreprises de +20 travailleurs doivent formaliser le droit à la déconnexion dans une CCT d'entreprise ou règlement de travail. Aucune obligation de répondre aux emails/appels hors heures de travail. Absence de règlement = infraction inspectable.", obligatoire: true },
      { id: 'indexation_clause', label: 'Indexation automatique des salaires', detail: "En Belgique, les salaires sont indexés automatiquement sur base de l'indice-santé (100% obligatoire). Aucune clause de contrat ne peut y déroger. La date et le taux d'indexation varient par CP (certaines indexent annuellement, d'autres à chaque dépassement du pivot).", obligatoire: true },
      { id: 'bareme_anciennete', label: 'Augmentation barémique à l\'ancienneté', detail: "La plupart des CP prévoient des augmentations automatiques liées à l'ancienneté sectorielle (ex: CP 200 : augmentation tous les 2 ans selon catégorie). À calculer dès le 1er anniversaire si applicable.", obligatoire: true },
      { id: 'travail_feries', label: 'Jours fériés — 10 légaux + remplacement', detail: "10 jours fériés légaux en Belgique. Si férié tombe un dimanche : remplacement obligatoire (jour convenu avec CP ou CE). Travail un jour férié : sursalaire 100% + repos compensatoire. Refus de travailler un jour férié = droit absolu du travailleur.", obligatoire: true },
      { id: 'travail_dimanche', label: 'Travail le dimanche — conditions légales strictes', detail: "Interdit par principe (loi 16/03/1971). Exceptions : secteurs expressément autorisés (commerce, HORECA, soins...) ou dérogation syndicale. Sursalaire de 100% obligatoire + repos compensatoire dans les 6 jours suivants.", obligatoire: false },
      { id: 'saisie_salaire', label: 'Saisie sur salaire — montants insaisissables 2026', detail: "Tranches insaisissables 2026 : jusqu'à 1.342€ net = insaisissable intégral. 1.342€→1.437€ = 20% saisissable. 1.437€→1.609€ = 30%. 1.609€→1.769€ = 40%. Au-delà de 1.769€ = entièrement saisissable. Majoration 75€/enfant à charge.", obligatoire: true },
      { id: 'fiche_paie_consent', label: 'Consentement pour fiche de paie électronique', detail: "La fiche de paie papier reste le défaut légal. Passage au numérique : consentement EXPLICITE du travailleur requis (loi 26/03/2018). Sans consentement : fiche papier obligatoire. Le refus ne peut pas être sanctionné.", obligatoire: true },
      { id: 'duree_hebdo', label: 'Mentionner la durée hebdomadaire exacte', detail: "Obligatoire dans le contrat. Temps plein = 38h/semaine max (ou moins selon CP). Temps partiel : l'horaire EXACT doit figurer dans le contrat, sinon présumé temps plein avec toutes les cotisations.", obligatoire: true },
      { id: 'renouvellement_cdd', label: 'Règle des 4 renouvellements CDD max', detail: "Maximum 4 renouvellements de CDD avant requalification automatique en CDI, sauf si durée totale dépasse 2 ans ou si CDD unitaire dépasse 3 ans (règle générale). Certaines CP ont des règles différentes.", obligatoire: true },
      { id: 'clause_formation', label: 'Clause de formation/écolage si applicable', detail: "Si l'employeur finance une formation coûteuse (> 1/5 du salaire annuel), une clause de remboursement proportionnel est possible (max 2 ans, conditions AR 19/07/2013). Doit être signée SÉPARÉMENT, AVANT la formation.", obligatoire: false },
      { id: 'clause_confidentialite', label: 'Clause de confidentialité', detail: "Distincte de la clause de non-concurrence. Protège les informations commerciales, techniques et stratégiques. Pas de limite de durée légale. Sans compensation financière obligatoire. À inclure systématiquement.", obligatoire: false },
      { id: 'cp_mention', label: 'Mentionner la Commission Paritaire dans le contrat', detail: "La CP applicable doit figurer dans le contrat. Elle détermine les barèmes, primes, conditions de travail. Si CP incorrecte dans le contrat, le droit du travailleur le plus favorable s'applique.", obligatoire: true },
      { id: 'motif_cdd', label: '⚠️ Motif CDD obligatoire dans le contrat', detail: "Un CDD SANS motif valable est requalifié automatiquement en CDI (CCT n°108). Motifs valables : remplacement (nom du travailleur remplacé obligatoire), surcroît temporaire de travail (durée max 6 mois), travaux d'une nature spéciale.", obligatoire: true },
      { id: '276T', label: 'Faire remplir le formulaire 276 T (situation familiale)', detail: "Ce formulaire permet d'appliquer le bon taux de précompte professionnel selon la situation familiale (isolé, marié, enfants à charge). Sans ce formulaire, le taux le plus défavorable s'applique automatiquement.", lien: 'https://finances.belgium.be', obligatoire: true },
      { id: 'materiel_teletravail', label: 'Télétravail — matériel et frais à charge de l\'employeur', detail: "CCT n°149 (2024) : si télétravail structurel, l'employeur doit fournir ou rembourser le matériel nécessaire (PC, connexion internet, chaise ergonomique). Indemnité forfaitaire max 151,70€/mois exonérée ONSS et PP. À formaliser dans l'addendum télétravail.", obligatoire: false },
      { id: 'teletravail_etranger', label: 'Télétravail depuis l\'étranger — sécurité sociale (Règl. 883/2004)', detail: "Si un travailleur télétravaille depuis un autre pays UE >25% de son temps : risque de double affiliation ONSS. Règlement 883/2004 : pays d'affiliation = pays de résidence si >25% prestations. Accord-cadre multilatéral UE signé 2023 : 49 pays. Vérifier chaque situation individuelle.", lien: 'https://www.socialsecurity.be', obligatoire: false },
      { id: 'teletravail', label: 'Addendum télétravail si travail à distance', detail: "Si télétravail structurel (régulier) : addendum obligatoire au contrat (CCT n°149, 01/01/2023). Doit mentionner : fréquence, lieu, indemnité forfaitaire (max 151,70€/mois exonéré ONSS et PP).", obligatoire: false },
      { id: 'conges_annuels', label: 'Informer sur les droits aux congés annuels', detail: "En Belgique : 4 semaines (20 jours) pour un temps plein. Ouvriers : via la caisse de vacances (ONVA). Employés : payés par l'employeur. Pécule de vacances = double pécule en mai/juin.", obligatoire: true },
      { id: 'classification', label: 'Déterminer la classification de fonction', detail: "La fonction détermine le barème salarial dans la CP. Ex : CP 200 a des barèmes par catégorie (A, B, C...). Impacte le salaire minimum légal applicable.", obligatoire: true },
      { id: 'anciennete', label: 'Enregistrer la date d\'ancienneté', detail: "L'ancienneté sectorielle peut être reprise si le travailleur vient d'un autre employeur du même secteur. Impacte le barème et le préavis.", obligatoire: false },
      { id: 'periode_essai', label: '⚠️ Période d\'essai supprimée en droit belge', detail: "Depuis le 1/01/2014, la période d'essai est supprimée pour les CDI. Seuls les contrats étudiants, intérimaires et CDD spéciaux maintiennent des règles particulières. Ne pas insérer de clause d'essai dans un CDI.", obligatoire: true },
    ]
  },
  {
    id: 4,
    icon: '🏛',
    titre: 'ONSS & Cotisations',
    delai: 'Premier trimestre',
    color: '#3b82f6',
    obligatoire: true,
    taches: [
      { id: 'onss_matricule', moduleAureus: 'declarations', label: 'Vérifier le matricule employeur ONSS', detail: 'Matricule ONSS à 10 chiffres. Requis pour toutes les déclarations. Visible sur le portail ONSS.', obligatoire: true },
      { id: 'cp', label: 'Identifier la Commission Paritaire applicable', detail: 'Détermine le barème salarial minimum, les primes sectorielles, les congés supplémentaires. Basé sur l\'activité principale de l\'entreprise.', lien: 'https://www.emploi.belgique.be', obligatoire: true },
      { id: 'reduction_bas', label: 'Vérifier les réductions ONSS applicables', detail: 'Bas salaires (< 3.500€ brut), jeunes non qualifiés, travailleurs âgés (+55 ans). Peuvent réduire jusqu\'à 1.500€/trimestre.', obligatoire: false },
      { id: 'activa', moduleAureus: 'aidesembauche', label: 'Vérifier éligibilité Activa.brussels / MonBEE', detail: 'Primes à l\'embauche pour demandeurs d\'emploi inscrits chez Actiris. Jusqu\'à 15.900€ sur 3 ans.', lien: 'https://www.actiris.brussels', obligatoire: false },
      { id: 'reduction_premier_emp', label: 'Réduction premier emploi — conditions strictes', detail: "Pour les jeunes de moins de 26 ans n'ayant jamais travaillé (< 6 mois d'expérience). Réduction ONSS patronale de 1.000€/trimestre pendant max 2 ans. Demande via Dimona avec mention 'FIRST'. À activer AVANT la prise de service.", obligatoire: false },
      { id: 'sesam_bruxelles', label: 'SESAM Bruxelles — prime CDI premier emploi', detail: "Prime Actiris pour employeurs bruxellois qui engagent en CDI un chercheur d'emploi inscrit chez Actiris depuis + de 6 mois. Jusqu'à 11.250€ sur 3 ans. Demande dans les 3 mois de l'embauche.", lien: 'https://www.actiris.brussels', obligatoire: false },
      { id: 'maladie_pro', label: 'Maladie professionnelle — déclaration Fedris', detail: "Si le travailleur développe une maladie liée à son activité professionnelle (liste officielle Fedris ou extra-légale) : déclaration obligatoire à Fedris. Indemnisation distincte de l'accident du travail. Médecin conseil désigné.", lien: 'https://www.fedris.be', obligatoire: false },
      { id: 'assurance_groupe', label: 'Assurance groupe/EIP — déclaration FSMA obligatoire', detail: "Si pension complémentaire via assurance groupe ou EIP : déclaration obligatoire à la FSMA (Autorité des services financiers). Contributions patronales : ONSS 8,86% cotisation patronale spéciale. Contributions personnelles : déductibles PP à 30%. Fiche fiscale 281.11 annuelle.", lien: 'https://www.fsma.be', obligatoire: false },
      { id: 'salaire_garanti', moduleAureus: 'calcmaladie', label: 'Salaire garanti maladie — 30 jours à charge employeur', detail: "En cas de maladie : les 30 premiers jours d'incapacité sont payés par l'employeur (100% les 7 premiers jours ouvriers, puis 60% brut). À partir du 31e jour : INAMI prend le relais. Régime différent pour ouvriers (<2 ans) : délai de carence.", obligatoire: true },
      { id: 'heures_sup_compteur', label: 'Compteur d\'heures supplémentaires obligatoire', detail: "Toute heure prestée au-delà de la durée hebdomadaire normale doit être comptabilisée. Récupération (dans les 6 mois) ou sursalaire (50% ou 100% selon jour). Contingent général : 130h/an (temporairement 180h). Registre obligatoire conservé 5 ans.", obligatoire: true },
      { id: 'delai_paiement', label: 'Délai de paiement du salaire', detail: "Délai légal maximum : 7 jours après la fin de la période de rémunération (ou le lendemain si ce jour est chômé). Paiement exclusivement par virement bancaire (interdiction de paiement en cash au-delà de 3.000€). Retard = intérêts légaux automatiques.", obligatoire: true },
      { id: 'code_risque_at', label: 'Identifier le code risque Fedris (accidents du travail)', detail: "Chaque poste doit avoir un code risque AT Fedris (NACE). Détermine le taux de prime d'assurance accidents du travail. À communiquer à l'assureur AT lors de l'affiliation du travailleur.", obligatoire: true },
      { id: 'solidarisation', label: 'Vérification solidarisation ONSS (sous-traitance)', detail: "Si vous faites appel à un sous-traitant avec des dettes ONSS, vous êtes SOLIDAIREMENT responsable (art.40 loi 27/06/1969). Vérifier le statut ONSS du sous-traitant via le portail ONSS avant tout contrat.", lien: 'https://www.socialsecurity.be', obligatoire: false },
      { id: 'indemnite_velo', label: 'Indemnité vélo : 0,35€/km exonéré', detail: "Si le travailleur vient à vélo : indemnité de 0,35€/km est exonérée d'ONSS et de PP (CCT n°164). Obligation de transport en commun : remboursement 100% dans CP 200 (et beaucoup d'autres CP).", obligatoire: false },
      { id: 'fonds_exist', label: 'Vérifier fonds de sécurité d\'existence sectoriel', detail: "Certaines CP ont un FSE obligatoire (CP 124 Construction, CP 140 Transport, CP 302 Horeca...). Cotisation patronale supplémentaire. Finance les primes de fin d'année, les indemnités de licenciement supplémentaires.", obligatoire: false },
      { id: 'dmfa', moduleAureus: 'declarations', label: 'Prévoir DmfA trimestrielle', detail: 'Déclaration ONSS trimestrielle obligatoire. Délai : dernier jour du mois suivant la fin du trimestre.', obligatoire: true },
      { id: 'af', label: 'Déclarer les allocations familiales', detail: "L'employeur doit s'affilier à une caisse d'allocations familiales (Famiwal, Kidslife, etc.) ou à l'ONSS. Le travailleur reçoit les AF directement de la caisse.", lien: 'https://www.famiwal.be', obligatoire: true },
      { id: 'pension_compl', label: 'Vérifier pension complémentaire sectorielle', detail: 'Certaines CP imposent une assurance groupe ou EIP obligatoire. Ex: CP 200, CP 124. Vérifier la CCT sectorielle applicable.', obligatoire: false },
    ]
  },
  {
    id: 5,
    icon: '💶',
    titre: 'Paie & Fiscalité',
    delai: 'Avant fin du mois',
    color: '#10b981',
    obligatoire: true,
    taches: [
      { id: 'fiche_paie', moduleAureus: 'payslip', label: 'Générer la première fiche de paie', detail: 'Doit mentionner : brut, cotisations ONSS (13,07%), précompte professionnel, net à payer, période.', obligatoire: true },
      { id: 'precompte', moduleAureus: 'calcinstant', label: 'Calculer le précompte professionnel correct', detail: 'Basé sur les barèmes SPF Finances 2026. Tenir compte de la situation familiale et des enfants à charge.', obligatoire: true },
      { id: 'bonus_emploi', label: 'Appliquer le bonus à l\'emploi si applicable', detail: 'Pour salaires bruts < 2.997,59€/mois. Réduction PP de 33,14%. Maximum 194,03€/mois.', obligatoire: false },
      { id: 'rupture_cdd', label: 'Indemnité de rupture anticipée CDD (art.40)', detail: "Si l'employeur rompt un CDD avant terme sans motif grave : indemnité = rémunération restante jusqu'au terme, plafonnée à 2x la durée de préavis qui serait applicable en CDI. Attention : pas de préavis possible pour un CDD sauf clause expresse.", obligatoire: true },
      { id: 'preavis_variable', label: 'Préavis : inclure la rémunération variable', detail: "Depuis CCT n°109 (2014) : la rémunération variable des 12 derniers mois est incluse dans la base de calcul du préavis/indemnité compensatoire. Commissions, primes, avantages en nature... Souvent oublié, source de litiges.", obligatoire: true },
      { id: 'double_pecule', label: 'Double pécule de vacances — calcul correct', detail: "Le double pécule (pécule de vacances supplémentaire) = 92% du salaire mensuel brut pour un temps plein une année complète. Payé en mai-juin. Ouvriers : via ONVA. Employés : par l'employeur directement.", obligatoire: true },
      { id: 'voiture_co2', label: 'Voiture de société — politique CO2 et budget mobilité', detail: "Depuis 2026 : seules les voitures 0g CO2 (électriques) restent déductibles à 100%. Voitures thermiques : déductibilité réduite progressivement jusqu'à 0% en 2028. Budget mobilité alternatif possible (CCT sectorielle ou décision employeur) : 0€ ONSS/PP si conditions respectées (AR 24/03/2019).", lien: 'https://finances.belgium.be', obligatoire: false },
      { id: 'prime_fin_annee', label: 'Prime de fin d\'année / 13e mois', detail: "Si prévue par CCT sectorielle ou contrat : précompte PP spécial à taux réduit 16,5% si ≤ 1 mois de brut. Au-delà : taux ordinaire. À vérifier dans la CCT de votre CP.", obligatoire: false },
      { id: 'atn_avances', label: 'ATN logement, énergie, PC, prêt — forfaits 2026', detail: "Logement gratuit : ATN = valeur cadastrale × 100/60 × 2 (dirigeant) ou × 2 (salarié). Électricité gratuite : 960€/an (non-cadre) ou 2.130€/an (cadre). Chauffage : 2.130€ (cadre) ou 960€. GSM : 161€/an. PC : 161€/an. Prêt sans intérêt : taux fictif SPF Finances 2026.", obligatoire: false },
      { id: 'stock_options', label: 'Stock-options — imposition à l\'offre (loi 26/03/1999)', detail: "Les stock-options sont imposées au PP au moment de l'offre (pas de l'exercice). Taux forfaitaire : 18% × valeur × fractions réduction (7,5% ou 15% selon durée). Avantage : pas d'ONSS si conditions respectées. Plan d'options à faire valider fiscalement.", obligatoire: false },
      { id: 'eco_cheques_cond', label: 'Éco-chèques — conditions d\'octroi strictes', detail: "Max 250€/an exonéré d'ONSS et PP. Nécessite une CCT sectorielle OU une CCT d'entreprise OU un accord individuel écrit. Sans base conventionnelle = soumis à ONSS + PP. Validité 24 mois. Dépense uniquement produits écologiques (liste officielle).", obligatoire: false },
      { id: 'mobilite_durable', label: 'Allocation mobilité durable — exonération ONSS/PP', detail: "Budget mobilité : alternative à la voiture de société (AR 24/03/2019). Le travailleur peut convertir son budget voiture en transports doux (vélo, abonnement STIB/TEC/De Lijn, voiture partagée...). Entièrement exonéré d'ONSS et de PP dans les limites légales. Conditions strictes : employeur + travailleur doivent y avoir droit.", lien: 'https://www.mobilite.belgique.be', obligatoire: false },
      { id: 'plan_cafeteria', label: 'Plan cafétéria (flex income plan) — conditions strictes', detail: "Le plan cafétéria permet d'échanger une partie du salaire contre des avantages (vélo, PC, épargne-pension...). Conditions ONSS : seuls les éléments futurs non encore acquis peuvent être échangés. Échange de salaire brut existant = cotisations ONSS dues. Circulaire ONSS 2020/7 applicable.", obligatoire: false },
      { id: 'cla90', label: 'CLA90 — dépôt préalable obligatoire', detail: "Si bonus non-récurrent CLA90 : dépôt de la CCT ou plan d'avantages NON RÉCURRENTS au SPF ETCS AVANT versement. Sans dépôt : le bonus est traité comme salaire ordinaire (ONSS + PP plein).", lien: 'https://www.emploi.belgique.be', obligatoire: false },
      { id: 'attestation_a', label: 'Remettre attestation A pour la mutualité (délai 15j)', detail: "L'attestation de travail (formulaire 704 / attestation A) doit être remise au travailleur dans les 15 jours. Permet à la mutualité de calculer les droits aux indemnités maladie-invalidité INAMI.", obligatoire: true },
      { id: 'virement', moduleAureus: 'sepa', label: 'Effectuer le virement salaire (SEPA)', detail: 'Fichier SEPA pain.001.xml. Délai légal : pas de délai légal fixe mais généralement fin du mois.', obligatoire: true },
      { id: 'pp_declaration', label: 'Déclarer le précompte professionnel (FinProf)', detail: 'Mensuel si > 50.240€/an, trimestriel sinon. Via application FinProf du SPF Finances.', lien: 'https://finances.belgium.be', obligatoire: true },
    ]
  },
  {
    id: 6,
    icon: '🛡',
    titre: 'Bien-être & Prévention',
    delai: 'Dans les 30 jours',
    color: '#8b5cf6',
    obligatoire: false,
    taches: [
      { id: 'seppt', label: 'Affilier à un service de prévention (SEPPT)', detail: 'Service Externe de Prévention et de Protection au Travail. Obligatoire pour toutes les entreprises. Ex : Mensura, Idewe, Securex...', obligatoire: true },
      { id: 'accidents', label: 'Souscrire assurance accidents du travail', detail: 'Obligatoire légalement (loi 10/04/1971). Déclarer le nouveau travailleur à votre assureur AT.', obligatoire: true },
      { id: 'visite_reprise', label: 'Visite de reprise après 4 semaines d\'absence', detail: "Obligatoire après 4 semaines d'absence maladie ou AT (AR 25/04/2007). Le travailleur peut aussi la demander. But : évaluer l'aptitude au poste et organiser si nécessaire un travail adapté. À planifier via le SEPPT avant la reprise.", obligatoire: true },
      { id: 'readaptation', label: 'Plan de réintégration — incapacité longue durée', detail: "Depuis la loi 26/12/2016 : après 9 mois d'incapacité, le médecin-conseil INAMI peut déclencher un trajet de réintégration. L'employeur doit examiner les possibilités d'adaptation du poste ou d'un poste alternatif. Refus injustifié = amende.", obligatoire: true },
      { id: 'amenagement_handicap', label: 'Aménagement raisonnable pour travailleur handicapé', detail: "La loi 10/05/2007 anti-discrimination oblige l'employeur à faire des aménagements raisonnables pour les travailleurs handicapés. Refus = discrimination. L'aménagement n'est pas raisonnable si coût disproportionné. UNIA peut accompagner.", lien: 'https://www.unia.be', obligatoire: true },
      { id: 'alcool_test_service', label: 'Tests alcool/drogues EN SERVICE — conditions légales', detail: "Test en service UNIQUEMENT si la politique prévue dans le règlement de travail ou une CCT. Types autorisés : alcootest (pas prise de sang). Résultat positif ≠ licenciement automatique. Procédure disciplinaire obligatoire. Sans politique = test illégal.", obligatoire: false },
      { id: 'videosurveillance_cct', label: 'Vidéosurveillance et géolocalisation — CCT n°68/81', detail: "Caméras au travail : information préalable obligatoire (CCT n°68), finalité limitée (sécurité, production, protection bien). Géolocalisation véhicules/GSM : CCT n°68 + consentement. Emails/internet : CCT n°81 + règlement travail. RGPD applicable.", obligatoire: false },
      { id: 'nuit_enceinte', label: 'Travail de nuit interdit pour femmes enceintes', detail: "Dès déclaration de grossesse : droit d'être dispensée du travail de nuit (22h-6h) sans perte de salaire. L'employeur doit proposer un poste de jour équivalent. Si impossible : dispense de travail avec maintien du salaire (art.42 loi 16/03/1971). Violation = infraction pénale.", obligatoire: true },
      { id: 'risques_psycho', label: 'Analyse risques psychosociaux (AR 10/04/2014)', detail: "Obligatoire pour toutes les entreprises : identifier et évaluer les risques de stress, burn-out, harcèlement, violence au travail. Procédure interne de traitement des plaintes obligatoire. Personne de confiance ou service externe. Non-respect = infraction niveau 3 (800-8.000€).", obligatoire: true },
      { id: 'surveillance_periodique', label: 'Surveillance santé périodique selon code poste', detail: "Après la visite d'embauche : surveillance périodique obligatoire. Code A (sécurité) : visite annuelle. Code B (bien-être) : tous les 2 ans. Code C (exposition risque) : selon protocole médecin. Code D (risque grave) : selon médecin. À planifier avec le SEPPT.", obligatoire: true },
      { id: 'produits_dangereux', label: 'Registre produits dangereux (REACH) si applicable', detail: "Si produits chimiques dangereux utilisés : fiches de données sécurité (FDS) obligatoires, registre REACH tenu à jour, formation spécifique travailleur, EPI adaptés. Contrôlé par inspection sociale et SPF Emploi.", obligatoire: false },
      { id: 'cppt', label: 'CPPT obligatoire si +50 travailleurs', detail: "Le Comité pour la Prévention et la Protection au Travail (CPPT) est obligatoire dès 50 travailleurs. Il doit être consulté AVANT toute décision impactant la sécurité. Sans CPPT : le DS ou la délégation syndicale joue ce rôle.", obligatoire: false },
      { id: 'plan_prevention', label: 'Plan global de prévention 5 ans', detail: "Obligatoire pour toutes les entreprises (AR 27/03/1998, art.10). Doit identifier tous les risques et les mesures de prévention. Complété par un plan d'action annuel. Doit être soumis au CPPT ou DS.", obligatoire: true },
      { id: 'at_benins', label: 'Registre des accidents bénins', detail: "Les accidents sans incapacité de travail (blessures légères traitées sur place) doivent être inscrits dans un registre spécial. Conservé à disposition de Fedris et de l'inspection sociale. Obligatoire depuis AR 24/02/2005.", obligatoire: true },
      { id: 'analyse_risques', label: 'Réaliser l\'analyse de risques du poste', detail: "Obligatoire AVANT la prise de service (AR 27/03/1998, art.8). Identifier les risques physiques, chimiques, psychosociaux. Documenter dans le plan global de prévention. Peut déclencher l'obligation de visite médicale d'embauche.", obligatoire: true },
      { id: 'epi', label: 'Fournir les EPI gratuitement', detail: "Les équipements de protection individuelle (casque, gants, chaussures de sécurité, gilet...) sont à la charge EXCLUSIVE de l'employeur. Interdiction de facturer au travailleur. Obligation de formation à leur utilisation.", obligatoire: false },
      { id: 'checkin', label: 'CheckIn@Work si secteur construction/nettoyage', detail: "Obligatoire pour les chantiers de construction et le nettoyage industriel. Enregistrement électronique via l'application de l'ONSS avant le début des prestations. Amende : 200€ par travailleur non enregistré.", lien: 'https://www.checkinatwork.be', obligatoire: false },
      { id: 'formation', label: 'Prévoir formation à la sécurité', detail: 'Information sur les risques du poste. Obligatoire pour postes à risque. À documenter dans le registre de formation.', obligatoire: false },
      { id: 'mutualite', label: 'Informer sur l\'affiliation à la mutualité', detail: "Chaque travailleur doit être affilié à une mutualité (Solidaris, Mutualité Chrétienne, OZ...) pour bénéficier des remboursements INAMI. Rappeler au nouveau travailleur de mettre à jour son affiliation.", obligatoire: false },
      { id: 'registre_presence', label: 'Mettre en place le registre des présences', detail: "Obligatoire pour certains secteurs (construction, HORECA). Enregistrement électronique ou papier des heures prestées. Contrôlé par l'inspection sociale.", obligatoire: false },
      { id: 'cheques_repas_cct', label: 'Vérifier si chèques-repas obligatoires via CCT', detail: "Dans certaines CP, les chèques-repas sont obligatoires via CCT sectorielle (même si la loi ne les impose pas). Vérifier la CCT de votre CP. Max 8€/jour, part patronale max 6,91€.", obligatoire: false },
      { id: 'personne_conf', label: 'Informer sur la personne de confiance', detail: 'Obligatoire si > 50 travailleurs ou sur demande d\'un travailleur. Contact interne pour harcèlement/violence.', obligatoire: false },
    ]
  },
  {
    id: 7,
    icon: '📊',
    titre: 'Registre & Documents légaux',
    delai: 'Dans les 8 jours',
    color: '#f97316',
    obligatoire: true,
    taches: [
      { id: 'registre', label: 'Inscrire dans le registre du personnel', detail: 'Obligatoire pour tous les travailleurs. Doit contenir : nom, prénom, adresse, date entrée, fonction, CP, type contrat.', obligatoire: true },
      { id: 'dossier', label: 'Créer le dossier individuel du travailleur', detail: 'Contrat signé, Dimona, NISS, IBAN, fiche de poste, déclaration RGPD. À conserver pendant la durée du contrat + 5 ans.', obligatoire: true },
      { id: 'conservation_docs', label: 'Durée légale de conservation des documents', detail: "Contrats de travail : 5 ans après départ. Fiches de paie : 7 ans (prescription fiscale). Dossier médical : 30 ans (médecin travail). Registre personnel : 5 ans après départ. Dimona : 5 ans. Documents ONSS : 7 ans. Non-respect = infraction RGPD + droit social.", obligatoire: true },
      { id: 'bilan_social', label: 'Bilan social annuel si +100 travailleurs', detail: "Obligatoire pour entreprises +100 travailleurs : dépôt à la BNB (Banque Nationale) dans les 30 jours après l'AG. Contient : effectifs, mouvements, formations, coûts. Public et consultable en ligne.", lien: 'https://www.nbb.be', obligatoire: false },
      { id: 'registre_tps_partiel', label: 'Registre spécial temps partiel + affichage horaire', detail: "Pour chaque travailleur à temps partiel : affichage de l'horaire dans l'entreprise obligatoire (5 jours avant). Registre spécial consultable par l'inspection sociale. Sans ces documents : présomption de temps plein avec toutes les cotisations.", obligatoire: false },
      { id: 'depot_greffe', label: 'Déposer le règlement de travail au greffe', detail: "Le règlement de travail MODIFIÉ doit être déposé au greffe du tribunal du travail dans les 8 jours (loi 8/04/1965, art.21). Pour un premier règlement, délai de 3 mois. Pas obligatoire si aucune modification.", obligatoire: false },
      { id: 'donnees_supabase', moduleAureus: 'onboarding', label: 'Encoder dans Aureus Social Pro', detail: 'Employés → Nouvel employé. Toutes les données sont chiffrées AES-256 et stockées dans Supabase Frankfurt (RGPD UE).', obligatoire: true },
    ]
  },
  {
    id: 8,
    icon: '🎯',
    titre: 'Droits & Congés spéciaux',
    delai: 'À communiquer dès J1',
    color: '#06b6d4',
    obligatoire: false,
    taches: [
      { id: 'conges_circonstances', label: 'Congés de circonstances (jours légaux)', detail: "Mariage travailleur : 2j · Mariage enfant : 1j · Naissance/adoption : 10j (coparentalité) · Décès conjoint/enfant : 3j · Décès parent/beau-parent : 3j · Communion solennelle enfant : 1j · Déménagement : 1j (si CCT). Ces jours sont à la charge de l'employeur.", obligatoire: true },
      { id: 'maternite', label: 'Congé de maternité — notification INAMI 7 semaines avant', detail: "15 semaines minimum (19 si grossesse multiple). La travailleure doit notifier l'INAMI et l'employeur au moins 7 semaines avant le terme. Congé prénatal obligatoire (1 semaine avant terme). Indemnisé par INAMI à 82% puis 75%.", lien: 'https://www.inami.fgov.be', obligatoire: true },
      { id: 'paternite', label: 'Congé de paternité/coparentalité — 20 jours', detail: "20 jours dans les 4 mois suivant la naissance (loi 3/07/1978). Les 3 premiers jours à charge de l'employeur. Du 4e au 20e : indemnité INAMI (82% du salaire plafonné). Formulaire INAMI à remplir.", lien: 'https://www.inami.fgov.be', obligatoire: true },
      { id: 'conge_parental', moduleAureus: 'creditemps', label: 'Congé parental — formulaire ONEM C62', detail: "4 mois par parent (jusqu'aux 12 ans de l'enfant). Sous forme d'interruption complète, mi-temps ou 1/5. Allocation ONEM. Formulaire C62 à soumettre à l'ONEM 3 mois à l'avance. Protection contre licenciement pendant 6 mois.", lien: 'https://www.onem.be', obligatoire: false },
      { id: 'formation_deal', label: 'Droit à la formation — 5j/an (Deal emploi 2022)', detail: "Depuis 01/01/2023 : chaque travailleur a droit à 5 jours de formation par an (entreprises +20 personnes). L'employeur doit établir un plan de formation individuel. Non-respect : astreinte de 1.800€ par travailleur.", lien: 'https://employment.belgium.be', obligatoire: true },
      { id: 'credit_temps_info', label: 'Informer sur le crédit-temps (CCT n°103)', detail: "Tout travailleur peut demander un crédit-temps après 12 mois d'ancienneté. Réduction 1/5 (CDI), mi-temps ou interruption complète. Allocation ONEM si motif reconnu (soin enfant, formation, soins palliatifs). L'employeur ne peut pas refuser unilatéralement.", lien: 'https://www.onem.be', obligatoire: false },
      { id: 'outplacement', label: 'Outplacement obligatoire si licenciement futur (+45 ans)', detail: "Si le travailleur a +45 ans et est licencié avec préavis > 30 semaines : outplacement obligatoire (CCT n°82). Coût à charge de l'employeur. À mentionner dès le contrat pour les profils concernés.", obligatoire: false },
      { id: 'protection_maternite', label: 'Protection contre le licenciement — maternité/crédit-temps', detail: "Interdiction de licencier une travailleuse enceinte (de la grossesse à 1 mois après reprise). Protection aussi pendant crédit-temps (6 mois), congé parental (6 mois). Violation = indemnité forfaitaire 6 mois + dommages.", obligatoire: true },
    ]
  },
  {
    id: 13, icon: '🌍', titre: 'International & Expatriés', delai: 'Si applicable', color: '#0ea5e9', obligatoire: false,
    taches: [
      { id: 'formulaire_a1', label: 'Formulaire A1 — détachement intra-UE obligatoire', detail: "Tout travailleur détaché dans un pays UE doit avoir un formulaire A1 prouvant son affiliation ONSS belge. Délivré par l'ONSS. Sans A1 : risque de double cotisation dans le pays d'accueil. Demande minimum 2 semaines avant le départ.", lien: 'https://www.socialsecurity.be', obligatoire: false },
      { id: 'permis_mtcm', label: 'MTCM — permis de travail combiné hors UE', detail: "Depuis 2019 : le permis de travail et le titre de séjour sont fusionnés en un seul document (MTCM). Demande via le service régional de l'emploi. Délai : 90 jours. Travailleur en séjour illégal = amende + responsabilité solidaire employeur.", lien: 'https://employment.belgium.be', obligatoire: false },
      { id: 'expat_circulaire', label: 'Régime spécial expatriés — circulaire 2022', detail: "Nouveau régime fiscal expatriés depuis 2022. Conditions : nouveau en Belgique (ou absent +5 ans), rémunération brute ≥ 75.000€, compétences spécifiques. Avantage : 30% du salaire exonéré PP. Demande SPF Finances dans les 3 mois.", lien: 'https://finances.belgium.be', obligatoire: false },
      { id: 'convention_bilat', label: 'Conventions bilatérales sécurité sociale', detail: "La Belgique a signé des conventions avec +50 pays (Maroc, Turquie, Tunisie, USA, Canada, Japon...). Évitent la double cotisation ONSS. Vérifier la convention applicable avant embauche d'un ressortissant étranger.", lien: 'https://www.socialsecurity.be', obligatoire: false },
      { id: 'directive_detachement', label: 'Directive détachement 2018 — droits travailleur entrant', detail: "Un travailleur détaché en Belgique depuis un pays UE a droit aux conditions de travail belges dès le 1er jour (salaire minimum, durée travail...). Après 12 mois : toutes les conditions belges applicables. Déclaration Limosa obligatoire.", lien: 'https://www.limosa.be', obligatoire: false },
      { id: 'nis_etranger', label: 'Numéro NIS pour travailleurs étrangers non-UE', detail: "Tout étranger non-UE travaillant en Belgique doit avoir un numéro NIS. Délivré lors de l'inscription communale. Requis pour Dimona, ONSS, PP. Sans NIS : impossible de déclarer le travailleur légalement.", obligatoire: false },
      { id: 'apostille_diplome', label: 'Apostille et équivalence diplômes étrangers', detail: "Diplômes hors UE : apostille de La Haye requise + demande d'équivalence auprès de la communauté compétente (WBE, Vlaams Agentschap). Certaines professions réglementées nécessitent une reconnaissance spécifique.", obligatoire: false },
    ]
  },
  {
    id: 14, icon: '🤖', titre: 'Numérique & Pratique', delai: 'Dès l\'embauche', color: '#a855f7', obligatoire: false,
    taches: [
      { id: 'politique_ia', label: 'Politique IA générative au travail', detail: "L'utilisation de ChatGPT, Copilot, Gemini au travail crée des risques : confidentialité données clients, propriété intellectuelle des outputs, RGPD. Une politique écrite est fortement recommandée avant toute utilisation par les travailleurs.", obligatoire: false },
      { id: 'nis2_cyber', label: 'Cybersécurité NIS2 — formation obligatoire secteurs critiques', detail: "Directive NIS2 transposée en Belgique 2024 : secteurs critiques (santé, énergie, transport, finance) doivent former leurs travailleurs à la cybersécurité. Responsabilité des dirigeants engagée personnellement. Sanctions jusqu'à 10M€.", lien: 'https://ccn.belgium.be', obligatoire: false },
      { id: 'plateformes_salariat', label: 'Travail via plateformes — présomption salariat 2024', detail: "Directive UE 2024 : travailleurs de plateformes (Uber, Deliveroo...) bénéficient d'une présomption de salariat si +2 critères de contrôle. Conséquences : ONSS, préavis, congés. À vérifier pour tout recours à des freelances via plateforme.", obligatoire: false },
      { id: 'inventaire_materiel', label: 'Inventaire matériel signé à l\'embauche et au départ', detail: "Dresser un inventaire signé de tout le matériel confié (PC, téléphone, voiture, clés, badges...). À faire signer à l'embauche ET au départ. Permet le recours en responsabilité civile en cas de matériel non restitué.", obligatoire: true },
      { id: 'acces_it', label: 'Procédure création/suppression comptes IT', detail: "À l'embauche : créer comptes email, accès systèmes le jour J. Au départ : supprimer TOUS les accès le jour même (RGPD + sécurité). Checklist IT offboarding obligatoire pour chaque départ.", obligatoire: true },
      { id: 'reseaux_sociaux_pol', label: 'Politique réseaux sociaux', detail: "Une clause dans le contrat ou règlement de travail doit définir ce que le travailleur peut publier sur LinkedIn, Facebook... Critiques publiques de l'employeur = motif licenciement si clause claire. Sans clause = flou juridique.", obligatoire: false },
      { id: 'cloud_rh', label: 'Cloud RH — serveurs UE obligatoires (RGPD)', detail: "Données RH stockées dans le cloud : serveurs obligatoirement dans l'UE (RGPD art.44). Cloud américain : clauses contractuelles standard UE requises ou region EU. À vérifier avec votre fournisseur (AWS, Google, Microsoft).", obligatoire: true },
      { id: 'algo_transparence', label: 'Transparence algorithmique — droit d\'explication', detail: "Décisions RH par algorithme (sélection CV, évaluation...) : le travailleur a droit à une explication (art.22 RGPD). Décision 100% automatisée avec effet juridique = interdite sans droit de recours humain.", obligatoire: false },
    ]
  },
  {
    id: 15, icon: '⚖️', titre: 'Égalité & Infractions', delai: 'Obligatoire', color: '#ef4444', obligatoire: true,
    taches: [
      { id: 'egalite_salariale', label: 'Rapport écart salarial H/F — entreprises +50', detail: "Loi 22/04/2012 : rapport bisannuel obligatoire sur l'écart salarial H/F. Soumis au CE ou DS. Si écart injustifié > moyenne sectorielle : plan d'action obligatoire. Publié sur le site de l'IEFH.", lien: 'https://igvm-iefh.belgium.be', obligatoire: false },
      { id: 'allaitement_pauses', label: 'Pauses allaitement — 30 min × 2/j pendant 7 mois', detail: "La travailleuse allaitante a droit à des pauses allaitement rémunérées (30 min × 2/j) pendant les 7 mois suivant la naissance (loi 16/03/1971 art.39bis). Local adapté obligatoire (AR 15/02/2007). Refus = discrimination.", obligatoire: true },
      { id: 'amenagement_locaux', label: 'Accessibilité handicap des locaux', detail: "Loi 10/05/2007 : aménagement raisonnable inclut l'accessibilité physique (rampe, ascenseur...). Subventions disponibles : PHARE (Bruxelles), VAPH (Flandre), AVIQ (Wallonie).", lien: 'https://www.unia.be', obligatoire: false },
      { id: 'elections_2028', label: 'Élections sociales 2028 — 135 jours de procédure', detail: "Prochaines élections sociales : mai 2028. Procédure très stricte : 135 jours de X+15 à X+150. Annulation possible si une étape ratée. À anticiper 1 an à l'avance pour les entreprises +50 travailleurs.", obligatoire: false },
      { id: 'defibrillateur_dae', label: 'DAE (défibrillateur) — obligatoire +100 travailleurs', detail: "Loi 18/03/2019 : défibrillateur automatisé externe obligatoire dans toute entreprise de +100 travailleurs. Formation recommandée. Contrôle annuel obligatoire.", obligatoire: false },
      { id: 'infractions_penales', label: 'Infractions pénales — responsabilité personnelle dirigeant', detail: "Les infractions au droit social peuvent engager la responsabilité PERSONNELLE du dirigeant. Infractions niveau 4 : 4.800-48.000€ + possible peine de prison. La société et le dirigeant sont condamnés solidairement. RC dirigeant recommandée.", obligatoire: true },
      { id: 'ruling_social', label: 'Ruling préalable ONSS — sécurité juridique', detail: "L'ONSS offre un service de ruling préalable pour les situations complexes (plan cafétéria, avantages innovants...). Demande écrite, réponse sous 3 mois. La décision est opposable à l'ONSS.", lien: 'https://www.socialsecurity.be', obligatoire: false },
      { id: 'prescription_salaires', label: 'Prescription arriérés de salaires — 5 ans', detail: "Un travailleur peut réclamer des arriérés de salaires pendant 5 ans (art.15 loi 3/07/1978). Cotisations ONSS : 3 ans (7 ans en cas de fraude). À partir du moment où le salaire était dû. Interrompre par mise en demeure recommandée.", obligatoire: true },
    ]
  },
  {
    id: 16, icon: '🏗️', titre: 'Secteurs réglementés', delai: 'Avant activité', color: '#f97316', obligatoire: false,
    taches: [
      { id: 'construction_coord', label: 'Coordinateur sécurité chantier (AR 25/01/2001)', detail: "Chantier temporaire ou mobile avec +1 entrepreneur : coordinateur sécurité-santé obligatoire en phase projet ET réalisation. Dossier d'intervention ultérieure (DIU) à constituer. Sanctions pénales si absent lors d'un contrôle.", obligatoire: false },
      { id: 'afsca_agrement', label: 'Agrément AFSCA — secteur alimentaire', detail: "Toute entreprise manipulant des denrées alimentaires doit être agréée par l'AFSCA. Travailleurs : formation hygiène alimentaire HACCP obligatoire. Contrôles inopinés. Retrait d'agrément = fermeture immédiate.", lien: 'https://www.favv-afsca.be', obligatoire: false },
      { id: 'caisses_horeca', label: 'Caisse enregistreuse HORECA — SCE obligatoire', detail: "Restaurants avec CA > 25.000€/an de repas chauds : caisse enregistreuse certifiée SCE obligatoire (AR 30/12/2009). Travailleurs doivent être formés à son utilisation. Contrôle TVA possible à tout moment.", lien: 'https://finances.belgium.be', obligatoire: false },
      { id: 'securite_privee', label: 'Sécurité privée — badge SPF Intérieur obligatoire', detail: "Loi 2/10/2017 : tout agent de sécurité doit avoir un badge délivré par SPF Intérieur. Entreprise de gardiennage agréée. Casier judiciaire vierge. Formation initiale 110h + recyclage annuel.", lien: 'https://www.ibz.rrn.fgov.be', obligatoire: false },
      { id: 'transport_cqc', label: 'Transport routier — CQC et carte conducteur numérique', detail: "Conducteurs poids lourds et bus : CQC (Certificat de Qualification initiale) obligatoire + formation continue 35h/5 ans. Carte conducteur numérique pour tachygraphe. Sans CQC : amende + immobilisation du véhicule.", obligatoire: false },
      { id: 'inami_visa', label: 'Professions de santé — visa INAMI obligatoire', detail: "Médecin, infirmier, kinésithérapeute, pharmacien : visa INAMI délivré par SPF Santé publique avant toute prestation remboursée. Diplôme UE : reconnaissance automatique (directive 2005/36). Hors UE : procédure SPF Santé.", lien: 'https://www.inami.fgov.be', obligatoire: false },
      { id: 'enseignement_titre', label: 'Enseignement — titre requis par niveau', detail: "Enseignant : titre pédagogique requis selon niveau (AESI/AESS/Master agrégation). Titre étranger : équivalence auprès de la communauté compétente. Intérim possible avec titre provisoire.", obligatoire: false },
      { id: 'immobilier_ipi', label: 'Agent immobilier — agrément IPI', detail: "Toute personne exerçant des activités immobilières à titre professionnel doit être agréée par l'IPI (Institut Professionnel des agents Immobiliers). Stagiaire pendant 1 an sous tutelle. Formation continue 10h/an.", lien: 'https://www.ipi.be', obligatoire: false },
    ]
  },
  {
    id: 17, icon: '💼', titre: 'Fiscalité employeur avancée', delai: 'Planifier', color: '#10b981', obligatoire: false,
    taches: [
      { id: 'isoc_remun_min', label: 'Rémunération minimale dirigeant — taux ISOC réduit 20%', detail: "Pour bénéficier du taux ISOC réduit de 20% (au lieu de 25%) : la société doit verser au moins 45.000€/an à au moins un dirigeant (ou égal au bénéfice si inférieur). Condition à vérifier chaque exercice comptable.", obligatoire: false },
      { id: 'deduction_invest', label: 'Déduction pour investissement — économie d\'impôt ISOC', detail: "Investissement dans actifs professionnels : déduction pour investissement de 8% à 20% du coût d'acquisition. PME : taux majoré. Non cumulable avec déduction étalée. À planifier avec le comptable avant achat.", obligatoire: false },
      { id: 'cotisation_co2_calc', label: 'Cotisation CO2 véhicule — formule exacte 2026', detail: "Cotisation mensuelle ONSS sur ATN voiture = (CO2 × 9€ – X) / 12. Minimum 31,34€/mois. Formule modifiée en 2026. Voiture électrique : cotisation minimum uniquement. À recalculer pour chaque véhicule de société lors de l'embauche.", obligatoire: true },
      { id: 'tva_usage_mixte', label: 'TVA — déductibilité partielle biens à usage mixte', detail: "Voiture de société (usage pro + privé) : TVA déductible selon proportion d'usage professionnel (méthode carnet de bord ou forfait 35%). Mobilier bureau à domicile : idem. À justifier lors du contrôle TVA.", obligatoire: false },
      { id: 'ruling_fiscal', label: 'Ruling fiscal — décision anticipée SPF Finances', detail: "Pour toute opération complexe (plan de rémunération innovant, avantage en nature atypique...) : demander une décision anticipée au SPF Finances. Validité 5 ans. Garantit la non-requalification fiscale. Demande gratuite.", lien: 'https://finances.belgium.be', obligatoire: false },
      { id: 'deduction_formation_isoc', label: 'Déduction formation 120% — PME (Deal emploi 2022)', detail: "PME peuvent déduire 120% des frais de formation formelle depuis 2023. Formation reconnue + attestation délivrée obligatoires. Maximum 3M€/an. Excellent levier fiscal pour former les travailleurs.", obligatoire: false },
      { id: 'patent_box', label: 'Déduction revenus d\'innovation (Patent Box) — 85%', detail: "Brevets, logiciels protégés, certificats de protection complémentaire : déduction de 85% des revenus nets d'innovation. Taux effectif d'imposition réduit à ~3,75%. Demande de ruling préalable recommandée.", obligatoire: false },
      { id: 'tob_stock_options', label: 'TOB (Taxe Opérations Boursières) sur stock-options', detail: "La vente d'actions via plan d'options est soumise à la TOB (0,35% max 1.600€ par transaction). Retenue à la source par l'intermédiaire financier. À intégrer dans le calcul du gain net réel pour le travailleur.", obligatoire: false },
    ]
  },
  {
    id: 18, icon: '📚', titre: 'Statuts exceptionnels', delai: 'Si applicable', color: '#6366f1', obligatoire: false,
    taches: [
      { id: 'gens_de_mer', label: 'Gens de mer — loi 3/06/1970 (régime distinct)', detail: "Marins et personnel navigant : loi 3/06/1970 complètement distincte du droit du travail commun. ONSS gens de mer avec taux différents. Contrat d'engagement maritime obligatoire. Convention MLC 2006 de l'OIT applicable.", obligatoire: false },
      { id: 'travailleurs_portuaires', label: 'Travailleurs portuaires — loi 8/06/1972', detail: "Régime spécial : embauche obligatoire via les pools reconnus (Antwerp, Gent, Liège...). Pas de contrat classique. Cotisations ONSS spéciales. Fonds de sécurité d'existence portuaire. Reconnaissance syndicale spécifique.", obligatoire: false },
      { id: 'fonctionnaires_contrat', label: 'Contractuels fonction publique — droit du travail applicable', detail: "Les contractuels dans la fonction publique (communes, CPAS, provinces, fédéral...) relèvent du droit du travail ordinaire. ONSS et PP applicables. Les agents nommés (statutaires) relèvent d'un régime distinct (pas de préavis, pas d'ONSS ordinaire).", obligatoire: false },
      { id: 'artistes_loi2022', label: 'Statut artiste — loi 16/12/2022 (depuis 2023)', detail: "Depuis 2023 : tout travail artistique rémunéré relève du salariat ou de l'indépendance. Suppression de l'ancienne exception. Commission des artistes délivre des attestations de besoins artistiques. ONSS et PP applicables selon le cas.", lien: 'https://www.commissieartiesten.be', obligatoire: false },
      { id: 'volontaires_loi2005', label: 'Volontaires — loi 3/07/2005 et limites 2026', detail: "Défraiement max 35,89€/j et 1.437,55€/an (2026) exonéré d'ONSS et PP. Au-delà = présomption de travail rémunéré avec toutes les cotisations dues. Note d'organisation obligatoire. Assurance RC et accidents obligatoire.", obligatoire: false },
      { id: 'conjoint_aidant', label: 'Conjoint aidant — statut et cotisations obligatoires', detail: "Le conjoint ou cohabitant légal aidant régulièrement un indépendant doit s'affilier comme conjoint aidant. Maxistatut (cotisations complètes, droits complets) ou ministatut (cotisations réduites, droits limités). Obligation légale souvent ignorée = risque d'irrégularité.", obligatoire: false },
      { id: 'mandataires_cumul', label: 'Mandataires politiques — cumul et incompatibilités', detail: "Bourgmestre, échevin, parlementaire : règles strictes de cumul avec emploi privé. Plafonds de rémunération cumulée. Certains mandats sont incompatibles avec des fonctions dirigeantes privées. À vérifier selon le niveau de pouvoir (local, régional, fédéral).", obligatoire: false },
      { id: 'independant_associe', label: 'Indépendant associé d\'une société — statut mixte', detail: "Un indépendant associé dans une société (gérant, administrateur) peut combiner une rémunération de mandataire et un contrat de travail si les fonctions sont distinctes et subordonnées. Double cotisation possible : ONSS + cotisations sociales indépendant.", obligatoire: false },
    ]
  },
  {
    id: 19, icon: '🏦', titre: 'Rémunération structurée', delai: 'À planifier', color: '#c6a34e', obligatoire: false,
    taches: [
      { id: 'split_salary', label: 'Split salary — rémunération fractionnée internationale', detail: "Technique pour expatriés : fraction du salaire payée en Belgique (ONSS belge), fraction payée à l'étranger. Conditions strictes : présence physique dans les 2 pays, ruling fiscal préalable. Économie PP jusqu'à 30%.", obligatoire: false },
      { id: 'participation_benefices', label: 'Participation bénéficiaire (loi 22/05/2001)', detail: "Distribution de bénéfices aux travailleurs. Cotisation ONSS patronale spéciale 13,07%. PP réduit à 7%. Plan à déposer au greffe. Outil de motivation fiscalement avantageux.", obligatoire: false },
      { id: 'regime_chercheurs', label: 'Régime chercheurs — dispense PP 80%', detail: "Chercheurs avec master ou doctorat travaillant en R&D : l'employeur conserve 80% du PP retenu. Conditions : programme agréé, formulaire annuel SPF Finances. Économie massive pour secteurs tech et pharma.", obligatoire: false },
      { id: 'cout_employeur_total', label: 'Calcul coût employeur total', detail: "Brut x 1,2507 (ONSS patronal) + cotisation AT + assurance groupe + avantages extrasalariaux + formation + matériel = coût réel. Toujours présenter le package complet au candidat.", obligatoire: false },
      { id: 'avance_salaire', label: 'Avance sur salaire — règles légales', detail: "Remboursement par retenues : max 1/5 du salaire mensuel net par retenue. À documenter par écrit. Pas de taux d'intérêt légal imposé.", obligatoire: false },
      { id: 'prime_innovation_cct', label: 'Prime innovation — régime CCT n°90bis', detail: "Prime pour résultats collectifs liés à l'innovation. Pas d'ONSS si conditions respectées. Distinct de la CLA90. Montant non plafonné légalement.", obligatoire: false },
    ]
  },
  {
    id: 20, icon: '🔬', titre: 'R&D et Innovation fiscale', delai: 'À planifier', color: '#8b5cf6', obligatoire: false,
    taches: [
      { id: 'ip_box', label: 'IP Box belge — revenus innovation à 3,75% effectif', detail: "Brevets, logiciels, SPC : déduction 85% des revenus nets d'innovation. Taux ISOC effectif environ 3,75%. Nexus approach : dépenses R&D belges proportionnelles. Ruling préalable recommandé.", obligatoire: false },
      { id: 'cra_credit_recherche', label: 'CRA — crédit recherche 25% salaires chercheurs', detail: "Crédit d'impôt : 25% des salaires chercheurs qualifiés + 25% des investissements R&D. Remboursable si insuffisance ISOC. Cumulable avec dispense PP 80%.", obligatoire: false },
      { id: 'young_innovative', label: 'YIC — Young Innovative Company', detail: "PME moins de 10 ans, dépenses R&D supérieures à 15% des dépenses totales : exonération ISOC temporaire. Cumulable avec CRA et IP Box. Conditions à maintenir chaque exercice.", obligatoire: false },
      { id: 'startup_warrants', label: 'Plan warrants startups — imposition réduite', detail: "Startups de moins de 4 ans : warrants à taux très réduit (moins de 10%). Window period de 60 jours après publication résultats financiers. À déposer au SPF Finances avant offre.", obligatoire: false },
      { id: 'loi_taylor', label: 'Loi Taylor — économie collaborative 7.240€/an', detail: "Plateformes collaboratives agréées : revenus jusqu'à 7.240 euros par an (2026) exonérés ONSS et PP. Conditions : plateforme agréée SPF Finances, fiche fiscale 281.29. Liste mise à jour annuellement.", obligatoire: false },
    ]
  },
  {
    id: 21, icon: '🌱', titre: 'Durabilité et RSE', delai: 'Continu', color: '#22c55e', obligatoire: false,
    taches: [
      { id: 'csrd_rapport', label: 'Rapport CSRD — obligations durabilité RH', detail: "Directive CSRD : entreprises de plus de 250 personnes ou 40M euros CA doivent publier un rapport durabilité incluant données sociales RH. Indicateurs : diversité, formation, accidents, émissions scope 3. Contrôlé par réviseur.", obligatoire: false },
      { id: 'pde_bruxelles', label: 'Plan de déplacements entreprise (PDE) — Bruxelles', detail: "Plan de déplacements obligatoire pour plus de 100 travailleurs à Bruxelles (ordonnance 2018). Audit mobilité tous les 3 ans. Objectif : réduire voitures individuelles. Subventions vélos électriques disponibles.", obligatoire: false },
      { id: 'egalite_genres_plan', label: 'Rapport écart salarial H/F — entreprises 50+', detail: "Loi 22/04/2012 : rapport bisannuel sur écart salarial H/F obligatoire pour plus de 50 travailleurs. Plan d'action si écart injustifié. Publié sur site IEFH.", lien: 'https://igvm-iefh.belgium.be', obligatoire: false },
      { id: 'label_diversite', label: 'Label Diversité — subventions régionales', detail: "Plans diversité subventionnés : jusqu'à 10.000 euros pour diagnostic, plan d'action et formation. Label Diversité après audit. VDAB en Flandre, Actiris à Bruxelles, Forem en Wallonie.", obligatoire: false },
      { id: 'eap_programme', label: 'Programme EAP bien-être — ROI démontré', detail: "Employee Assistance Program : coaching, sport, espaces détente. Réduction absentéisme prouvée. Déductibles ISOC si liés à l'activité. Attractivité employeur augmentée de 40%.", obligatoire: false },
    ]
  },
  {
    id: 22, icon: '📋', titre: 'Gestion fins de contrat', delai: 'Préparer', color: '#f43f5e', obligatoire: false,
    taches: [
      { id: 'calcul_preavis_cct109', moduleAureus: 'simulicenciement', label: 'Calcul préavis exact — formule CCT n°109', detail: "Depuis 2014 : préavis basé sur ancienneté. Semaines = ancienneté x coefficient (2 à 8 semaines par année). Rémunération variable des 12 derniers mois incluse. Outil de calcul sur site SPF ETCS.", lien: 'https://www.emploi.belgique.be', obligatoire: false },
      { id: 'motif_grave_3j', label: 'Licenciement motif grave — délai 3 jours ouvrables', detail: "Notification dans les 3 jours ouvrables suivant la connaissance des faits. Lettre recommandée obligatoire. Si délai raté : requalification en licenciement ordinaire avec indemnité. Motif doit être précis et documenté.", obligatoire: true },
      { id: 'rupture_commun', label: "Rupture commun accord — points d'attention", detail: "Possible à tout moment par accord mutuel. Par écrit recommandé. Peut prévoir indemnités supplémentaires. Attention : risque perte chômage si non documentée comme involontaire.", obligatoire: false },
      { id: 'cct109_raison', label: 'CCT n°109 — licenciement manifestement déraisonnable', detail: "Tout licenciement sans motif valable peut être contesté. Indemnité : 3 à 17 semaines de salaire. Employeur peut devoir communiquer le motif si demandé dans les 2 mois. Documentation du dossier disciplinaire essentielle.", obligatoire: true },
      { id: 'c4_codes_onem', label: 'Formulaire C4 — codes ONEM obligatoires', detail: "Doit mentionner : durée et nature du contrat, motif de fin avec codes ONEM précis, heures travaillées, rémunération. À remettre IMMÉDIATEMENT. Erreur sur le motif = amende ONEM et chômage refusé.", obligatoire: true },
      { id: 'solde_compte', label: 'Solde de tout compte — éléments obligatoires', detail: "Inclure : salaire dernier mois, pécule de vacances restant, indemnité compensatoire de préavis, prime de fin d'année proratisée, remboursement frais en attente. Maximum 5 jours ouvrables après fin.", obligatoire: true },
    ]
  },
  {
    id: 23, icon: '🏆', titre: 'Employer Branding', delai: 'Stratégique', color: '#f59e0b', obligatoire: false,
    taches: [
      { id: 'transparence_salariale', label: 'Transparence salariale — directive UE 2023/970', detail: "En cours de transposition. Dès 2026 : fourchette salariale dans les annonces, interdiction de demander l'historique salarial. À anticiper dès maintenant dans les offres d'emploi.", obligatoire: false },
      { id: 'onboarding_structure', label: 'Onboarding structuré — rétention +50%', detail: "Onboarding structuré (jour 1, semaine 1, mois 1, trimestre 1) réduit le turnover de 50%. Check-list : accueil, présentations, formations obligatoires, objectifs clairs, buddy. ROI démontré.", obligatoire: false },
      { id: 'droit_teletravail_loi', label: 'Droit au télétravail — réponse écrite obligatoire', detail: "Depuis 2022 : tout travailleur peut demander le télétravail. Réponse écrite dans le mois obligatoire. Refus doit être motivé. Pas de droit absolu mais obligation de justification.", obligatoire: false },
      { id: 'travail_faisable_loi', label: 'Travail faisable — loi 5/03/2017', detail: "Annualisation du temps de travail, heures supplémentaires volontaires, travail occasionnel HORECA. Doit être encadré par CCT. Outil de flexibilité attractif pour les candidats.", obligatoire: false },
    ]
  },
  {
    id: 24, icon: '⚡', titre: 'Urgences et Crises RH', delai: 'Préparer', color: '#ef4444', obligatoire: false,
    taches: [
      { id: 'chomage_eco_proc', label: 'Chômage économique — procédure et délais', detail: "Employés : notification bureau ONEM et travailleurs 7 jours ouvrables avant. Formulaire C106A. Ouvriers : 3 jours. Durée max : 4 semaines consécutives renouvelables. Allocation ONEM : 70% du salaire brut plafonné.", obligatoire: false },
      { id: 'force_maj_med', label: 'Force majeure médicale — loi 26/12/2016', detail: "Si travailleur en incapacité définitive : trajet de réintégration obligatoire avant constat. Médecin conseil INAMI, médecin du travail, employeur impliqués. Si impossible : C4 force majeure sans indemnité de préavis.", obligatoire: false },
      { id: 'fonds_fermeture_ffe', label: 'Fonds de Fermeture — garantie rémunérations impayées', detail: "En cas de faillite ou cessation : FFE garantit les rémunérations impayées, maximum 3 mois. Déclaration de créance dans les 6 mois. Site officiel : fondsdefermeture.be", obligatoire: false },
      { id: 'accident_grave_proc', label: 'Accident grave — déclaration Fedris 10 jours', detail: "Accident avec hospitalisation plus de 24h ou lésion grave : déclaration assureur AT dans 8 jours ouvrables, rapport circonstancié Fedris dans 10 jours. Non-déclaration = amende et responsabilité pénale.", obligatoire: true },
      { id: 'harcelement_proc', label: 'Harcèlement — procédure formelle obligatoire', detail: "Plainte formelle via personne de confiance ou conseiller en prévention. Enquête obligatoire, délais stricts. Protection absolue du plaignant contre toute représaille. Documentation dès les premiers faits.", obligatoire: true },
      { id: 'greve_continuité_plan', label: 'Grève — obligations employeur', detail: "Impossibilité de remplacer les grévistes par des intérimaires (loi 24/07/1987). Services minimaux possibles si CCT. Plan de continuité à préparer à l'avance. Pas d'obligation de négocier mais dialogue recommandé.", obligatoire: false },
    ]
  },
]

export default function EmbaucheAZ() {
  const [etapeActive, setEtapeActive] = useState(1)
  const [travailleur, setTravailleur] = useState('')
  const [tachesCompletes, setTachesCompletes] = useState(() => {
    if (typeof window === 'undefined') return {}
    try { return JSON.parse(localStorage.getItem('embauche_az_progress_default') || '{}') } catch { return {} }
  })
  const [showDetails, setShowDetails] = useState({})

  const storageKey = `embauche_az_${travailleur.trim().toLowerCase().replace(/\s+/g,'_') || 'default'}`

  const toggleTache = (id) => setTachesCompletes(prev => {
    const next = { ...prev, [id]: !prev[id] }
    if (typeof window !== 'undefined') localStorage.setItem(storageKey, JSON.stringify(next))
    return next
  })

  const loadTravailleur = (nom) => {
    setTravailleur(nom)
    const key = `embauche_az_${nom.trim().toLowerCase().replace(/\s+/g,'_') || 'default'}`
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}')
      setTachesCompletes(saved)
      setEtapeActive(1)
    } catch { setTachesCompletes({}) }
  }

  const resetChecklist = () => {
    if (!confirm('Remettre à zéro toute la checklist pour ce travailleur ?')) return
    if (typeof window !== 'undefined') localStorage.removeItem(storageKey)
    setTachesCompletes({})
    setEtapeActive(1)
  }
  const toggleDetail = (id) => setShowDetails(prev => ({ ...prev, [id]: !prev[id] }))

  const totalTaches = ALL_ETAPES.flatMap(e => e.taches).length
  const totalCompletes = Object.values(tachesCompletes).filter(Boolean).length
  const pct = Math.round(totalCompletes / totalTaches * 100)

  const etapeCourante = ALL_ETAPES.find(e => e.id === etapeActive)
  const tachesEtape = etapeCourante?.taches || []
  const completesEtape = tachesEtape.filter(t => tachesCompletes[t.id]).length

  const s = {
    bg: { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 },
    card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 12 },
  }

  return (
    <div style={s.bg}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🚀</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Embauche A→Z</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Guide complet — Toutes les étapes légales belges pour engager un travailleur</p>
          </div>
        </div>

        {/* Nom du travailleur */}
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <input
            value={travailleur}
            onChange={e => loadTravailleur(e.target.value)}
            placeholder="👤 Nom du travailleur (ex: Jean Dupont) — une checklist par personne"
            style={{ flex:1, background:'#111', border:'1px solid #2a2a2a', borderRadius:8, padding:'9px 14px', color:'#f1f5f9', fontSize:13, fontFamily:'inherit' }}
          />
          {(travailleur || totalCompletes > 0) && (
            <button onClick={resetChecklist}
              style={{ padding:'9px 14px', borderRadius:8, border:'1px solid #2a2a2a', background:'transparent', color:'#6b7280', fontSize:12, cursor:'pointer' }}>
              🔄 Reset
            </button>
          )}
        </div>

        {/* Barre de progression globale */}
        <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Progression globale</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#c6a34e' }}>{totalCompletes}/{totalTaches} tâches</span>
            </div>
            <div style={{ height: 6, background: '#2a2a2a', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : '#c6a34e', transition: 'width .3s', borderRadius: 3 }} />
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: pct === 100 ? '#10b981' : '#c6a34e', minWidth: 48 }}>{pct}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'min(240px, 35%) 1fr', gap: 20 }}>
        {/* Sidebar étapes */}
        <div>
          {ALL_ETAPES.map(e => {
            const completesE = e.taches.filter(t => tachesCompletes[t.id]).length
            const totalE = e.taches.length
            const doneE = completesE === totalE
            const active = etapeActive === e.id
            return (
              <div key={e.id} onClick={() => setEtapeActive(e.id)}
                style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 6, cursor: 'pointer', border: `1px solid ${active ? e.color + '60' : '#1e1e1e'}`, background: active ? e.color + '12' : '#111', transition: 'all .15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{doneE ? '✅' : e.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: active ? e.color : '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.titre}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>{e.delai}</div>
                  </div>
                  <div style={{ fontSize: 10, color: doneE ? '#10b981' : '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{completesE}/{totalE}</div>
                </div>
                {active && (
                  <div style={{ height: 2, background: e.color, borderRadius: 1, marginTop: 8 }}>
                    <div style={{ height: '100%', width: `${completesE/totalE*100}%`, background: '#10b981', transition: 'width .3s' }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Contenu étape */}
        <div>
          {etapeCourante && (
            <>
              {/* Header étape */}
              <div style={{ ...s.card, borderColor: etapeCourante.color + '40', background: etapeCourante.color + '08', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{etapeCourante.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 18, fontWeight: 700 }}>Étape {etapeCourante.id} — {etapeCourante.titre}</span>
                      {etapeCourante.urgent && <span style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>🚨 URGENT</span>}
                      {etapeCourante.obligatoire && <span style={{ background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>OBLIGATOIRE</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>⏱ {etapeCourante.delai} · {completesEtape}/{tachesEtape.length} tâches complétées</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: completesEtape === tachesEtape.length ? '#10b981' : etapeCourante.color }}>
                    {Math.round(completesEtape/tachesEtape.length*100)}%
                  </div>
                </div>
              </div>

              {/* Tâches */}
              {tachesEtape.map(t => (
                <div key={t.id} style={{ ...s.card, borderColor: tachesCompletes[t.id] ? '#10b98130' : '#1e1e1e', background: tachesCompletes[t.id] ? '#0d1a0d' : '#111', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div onClick={() => toggleTache(t.id)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${tachesCompletes[t.id] ? '#10b981' : '#2a2a2a'}`, background: tachesCompletes[t.id] ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 1, transition: 'all .15s' }}>
                      {tachesCompletes[t.id] && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: tachesCompletes[t.id] ? '#6b7280' : '#f1f5f9', textDecoration: tachesCompletes[t.id] ? 'line-through' : 'none' }}>{t.label}</span>
                        {t.obligatoire && <span style={{ background: '#ef444415', color: '#ef4444', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>OBLIGATOIRE</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{t.detail}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                        {t.lien && (
                          <a href={t.lien} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#3b82f6', display: 'inline-block', textDecoration: 'none' }}>
                            🔗 Source officielle →
                          </a>
                        )}
                        {t.moduleAureus && (
                          <button onClick={() => {
                            if (typeof window !== 'undefined' && window.setPageFromEmbauche) {
                              window.setPageFromEmbauche(t.moduleAureus)
                            }
                          }} style={{ fontSize: 11, color: '#c6a34e', background: '#c6a34e15', border: '1px solid #c6a34e30', borderRadius: 4, padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                            ⚡ Ouvrir dans Aureus →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <button onClick={() => setEtapeActive(e => Math.max(1, e - 1))} disabled={etapeActive === 1}
                  style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #2a2a2a', background: 'transparent', color: etapeActive === 1 ? '#2a2a2a' : '#f1f5f9', cursor: etapeActive === 1 ? 'default' : 'pointer', fontSize: 13 }}>
                  ← Étape précédente
                </button>
                {completesEtape === tachesEtape.length && etapeActive < ETAPES.length && (
                  <button onClick={() => setEtapeActive(e => e + 1)}
                    style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: etapeCourante.color, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                    Étape suivante →
                  </button>
                )}
                {etapeActive === ETAPES.length && totalCompletes === totalTaches && (
                  <div style={{ padding: '8px 20px', borderRadius: 8, background: '#0d1a0d', color: '#10b981', fontSize: 13, fontWeight: 700, border: '1px solid #10b98140' }}>
                    ✅ Embauche complète !
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
