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
      { id: 'dimona_in', label: '🚨 Soumettre Dimona IN à l\'ONSS', detail: 'OBLIGATOIRE avant le premier jour de travail. Amende : jusqu\'à 1.800€ par travailleur non déclaré. Via portail ONSS ou directement dans Aureus.', lien: 'https://www.socialsecurity.be', obligatoire: true },
      { id: 'type_contrat', label: 'Choisir le type Dimona correct', detail: 'DWR (ouvrier), EMP (employé), STU (étudiant), IVT (intérimaire), FLX (flexi-job), OTH (autres)', obligatoire: true },
      { id: 'dimona_out_prev', label: 'Encoder la Dimona OUT préventive pour CDD', detail: "Pour un CDD à durée déterminée, encoder la date de fin prévue dès la Dimona IN. Évite les oublis de Dimona OUT et prouve la durée convenue à l'ONSS.", obligatoire: false },
      { id: 'limosa', label: 'Déclaration LIMOSA si travailleur détaché', detail: "Obligatoire pour tout travailleur étranger détaché temporairement en Belgique. À faire AVANT la prise de service via le portail LIMOSA. Sans cette déclaration : amende jusqu'à 50.000€ par travailleur.", lien: 'https://www.limosa.be', obligatoire: false },
      { id: 'dimona_correctif', label: 'Possibilité de Dimona correctif (8 jours)', detail: "En cas d'erreur dans la Dimona IN (mauvais NISS, date incorrecte...), un correctif peut être soumis dans les 8 jours ouvrables sans pénalité. Au-delà : amende administrative.", obligatoire: false },
      { id: 'reduction_avant', label: '💶 Demander réduction groupes cibles AVANT la prise de service', detail: "Les réductions ONSS (bas salaires, jeunes -26 ans, travailleurs âgés +55 ans, Activa) doivent être activées AVANT ou le jour de l'entrée en service. Après, certaines sont perdues définitivement. Via portail ONSS ou Actiris.", obligatoire: false },
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
      { id: 'duree_hebdo', label: 'Mentionner la durée hebdomadaire exacte', detail: "Obligatoire dans le contrat. Temps plein = 38h/semaine max (ou moins selon CP). Temps partiel : l'horaire EXACT doit figurer dans le contrat, sinon présumé temps plein avec toutes les cotisations.", obligatoire: true },
      { id: 'renouvellement_cdd', label: 'Règle des 4 renouvellements CDD max', detail: "Maximum 4 renouvellements de CDD avant requalification automatique en CDI, sauf si durée totale dépasse 2 ans ou si CDD unitaire dépasse 3 ans (règle générale). Certaines CP ont des règles différentes.", obligatoire: true },
      { id: 'clause_formation', label: 'Clause de formation/écolage si applicable', detail: "Si l'employeur finance une formation coûteuse (> 1/5 du salaire annuel), une clause de remboursement proportionnel est possible (max 2 ans, conditions AR 19/07/2013). Doit être signée SÉPARÉMENT, AVANT la formation.", obligatoire: false },
      { id: 'clause_confidentialite', label: 'Clause de confidentialité', detail: "Distincte de la clause de non-concurrence. Protège les informations commerciales, techniques et stratégiques. Pas de limite de durée légale. Sans compensation financière obligatoire. À inclure systématiquement.", obligatoire: false },
      { id: 'cp_mention', label: 'Mentionner la Commission Paritaire dans le contrat', detail: "La CP applicable doit figurer dans le contrat. Elle détermine les barèmes, primes, conditions de travail. Si CP incorrecte dans le contrat, le droit du travailleur le plus favorable s'applique.", obligatoire: true },
      { id: 'motif_cdd', label: '⚠️ Motif CDD obligatoire dans le contrat', detail: "Un CDD SANS motif valable est requalifié automatiquement en CDI (CCT n°108). Motifs valables : remplacement (nom du travailleur remplacé obligatoire), surcroît temporaire de travail (durée max 6 mois), travaux d'une nature spéciale.", obligatoire: true },
      { id: '276T', label: 'Faire remplir le formulaire 276 T (situation familiale)', detail: "Ce formulaire permet d'appliquer le bon taux de précompte professionnel selon la situation familiale (isolé, marié, enfants à charge). Sans ce formulaire, le taux le plus défavorable s'applique automatiquement.", lien: 'https://finances.belgium.be', obligatoire: true },
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
      { id: 'onss_matricule', label: 'Vérifier le matricule employeur ONSS', detail: 'Matricule ONSS à 10 chiffres. Requis pour toutes les déclarations. Visible sur le portail ONSS.', obligatoire: true },
      { id: 'cp', label: 'Identifier la Commission Paritaire applicable', detail: 'Détermine le barème salarial minimum, les primes sectorielles, les congés supplémentaires. Basé sur l\'activité principale de l\'entreprise.', lien: 'https://www.emploi.belgique.be', obligatoire: true },
      { id: 'reduction_bas', label: 'Vérifier les réductions ONSS applicables', detail: 'Bas salaires (< 3.500€ brut), jeunes non qualifiés, travailleurs âgés (+55 ans). Peuvent réduire jusqu\'à 1.500€/trimestre.', obligatoire: false },
      { id: 'activa', label: 'Vérifier éligibilité Activa.brussels / MonBEE', detail: 'Primes à l\'embauche pour demandeurs d\'emploi inscrits chez Actiris. Jusqu\'à 15.900€ sur 3 ans.', lien: 'https://www.actiris.brussels', obligatoire: false },
      { id: 'code_risque_at', label: 'Identifier le code risque Fedris (accidents du travail)', detail: "Chaque poste doit avoir un code risque AT Fedris (NACE). Détermine le taux de prime d'assurance accidents du travail. À communiquer à l'assureur AT lors de l'affiliation du travailleur.", obligatoire: true },
      { id: 'solidarisation', label: 'Vérification solidarisation ONSS (sous-traitance)', detail: "Si vous faites appel à un sous-traitant avec des dettes ONSS, vous êtes SOLIDAIREMENT responsable (art.40 loi 27/06/1969). Vérifier le statut ONSS du sous-traitant via le portail ONSS avant tout contrat.", lien: 'https://www.socialsecurity.be', obligatoire: false },
      { id: 'indemnite_velo', label: 'Indemnité vélo : 0,35€/km exonéré', detail: "Si le travailleur vient à vélo : indemnité de 0,35€/km est exonérée d'ONSS et de PP (CCT n°164). Obligation de transport en commun : remboursement 100% dans CP 200 (et beaucoup d'autres CP).", obligatoire: false },
      { id: 'fonds_exist', label: 'Vérifier fonds de sécurité d\'existence sectoriel', detail: "Certaines CP ont un FSE obligatoire (CP 124 Construction, CP 140 Transport, CP 302 Horeca...). Cotisation patronale supplémentaire. Finance les primes de fin d'année, les indemnités de licenciement supplémentaires.", obligatoire: false },
      { id: 'dmfa', label: 'Prévoir DmfA trimestrielle', detail: 'Déclaration ONSS trimestrielle obligatoire. Délai : dernier jour du mois suivant la fin du trimestre.', obligatoire: true },
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
      { id: 'fiche_paie', label: 'Générer la première fiche de paie', detail: 'Doit mentionner : brut, cotisations ONSS (13,07%), précompte professionnel, net à payer, période.', obligatoire: true },
      { id: 'precompte', label: 'Calculer le précompte professionnel correct', detail: 'Basé sur les barèmes SPF Finances 2026. Tenir compte de la situation familiale et des enfants à charge.', obligatoire: true },
      { id: 'bonus_emploi', label: 'Appliquer le bonus à l\'emploi si applicable', detail: 'Pour salaires bruts < 2.997,59€/mois. Réduction PP de 33,14%. Maximum 194,03€/mois.', obligatoire: false },
      { id: 'double_pecule', label: 'Double pécule de vacances — calcul correct', detail: "Le double pécule (pécule de vacances supplémentaire) = 92% du salaire mensuel brut pour un temps plein une année complète. Payé en mai-juin. Ouvriers : via ONVA. Employés : par l'employeur directement.", obligatoire: true },
      { id: 'prime_fin_annee', label: 'Prime de fin d\'année / 13e mois', detail: "Si prévue par CCT sectorielle ou contrat : précompte PP spécial à taux réduit 16,5% si ≤ 1 mois de brut. Au-delà : taux ordinaire. À vérifier dans la CCT de votre CP.", obligatoire: false },
      { id: 'cla90', label: 'CLA90 — dépôt préalable obligatoire', detail: "Si bonus non-récurrent CLA90 : dépôt de la CCT ou plan d'avantages NON RÉCURRENTS au SPF ETCS AVANT versement. Sans dépôt : le bonus est traité comme salaire ordinaire (ONSS + PP plein).", lien: 'https://www.emploi.belgique.be', obligatoire: false },
      { id: 'attestation_a', label: 'Remettre attestation A pour la mutualité (délai 15j)', detail: "L'attestation de travail (formulaire 704 / attestation A) doit être remise au travailleur dans les 15 jours. Permet à la mutualité de calculer les droits aux indemnités maladie-invalidité INAMI.", obligatoire: true },
      { id: 'virement', label: 'Effectuer le virement salaire (SEPA)', detail: 'Fichier SEPA pain.001.xml. Délai légal : pas de délai légal fixe mais généralement fin du mois.', obligatoire: true },
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
      { id: 'depot_greffe', label: 'Déposer le règlement de travail au greffe', detail: "Le règlement de travail MODIFIÉ doit être déposé au greffe du tribunal du travail dans les 8 jours (loi 8/04/1965, art.21). Pour un premier règlement, délai de 3 mois. Pas obligatoire si aucune modification.", obligatoire: false },
      { id: 'donnees_supabase', label: 'Encoder dans Aureus Social Pro', detail: 'Employés → Nouvel employé. Toutes les données sont chiffrées AES-256 et stockées dans Supabase Frankfurt (RGPD UE).', obligatoire: true },
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
      { id: 'conge_parental', label: 'Congé parental — formulaire ONEM C62', detail: "4 mois par parent (jusqu'aux 12 ans de l'enfant). Sous forme d'interruption complète, mi-temps ou 1/5. Allocation ONEM. Formulaire C62 à soumettre à l'ONEM 3 mois à l'avance. Protection contre licenciement pendant 6 mois.", lien: 'https://www.onem.be', obligatoire: false },
      { id: 'formation_deal', label: 'Droit à la formation — 5j/an (Deal emploi 2022)', detail: "Depuis 01/01/2023 : chaque travailleur a droit à 5 jours de formation par an (entreprises +20 personnes). L'employeur doit établir un plan de formation individuel. Non-respect : astreinte de 1.800€ par travailleur.", lien: 'https://employment.belgium.be', obligatoire: true },
      { id: 'credit_temps_info', label: 'Informer sur le crédit-temps (CCT n°103)', detail: "Tout travailleur peut demander un crédit-temps après 12 mois d'ancienneté. Réduction 1/5 (CDI), mi-temps ou interruption complète. Allocation ONEM si motif reconnu (soin enfant, formation, soins palliatifs). L'employeur ne peut pas refuser unilatéralement.", lien: 'https://www.onem.be', obligatoire: false },
      { id: 'outplacement', label: 'Outplacement obligatoire si licenciement futur (+45 ans)', detail: "Si le travailleur a +45 ans et est licencié avec préavis > 30 semaines : outplacement obligatoire (CCT n°82). Coût à charge de l'employeur. À mentionner dès le contrat pour les profils concernés.", obligatoire: false },
      { id: 'protection_maternite', label: 'Protection contre le licenciement — maternité/crédit-temps', detail: "Interdiction de licencier une travailleuse enceinte (de la grossesse à 1 mois après reprise). Protection aussi pendant crédit-temps (6 mois), congé parental (6 mois). Violation = indemnité forfaitaire 6 mois + dommages.", obligatoire: true },
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

  const totalTaches = ETAPES.flatMap(e => e.taches).length
  const totalCompletes = Object.values(tachesCompletes).filter(Boolean).length
  const pct = Math.round(totalCompletes / totalTaches * 100)

  const etapeCourante = ETAPES.find(e => e.id === etapeActive)
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
          {ETAPES.map(e => {
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
                      {t.lien && (
                        <a href={t.lien} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#3b82f6', marginTop: 4, display: 'inline-block' }}>
                          🔗 Source officielle →
                        </a>
                      )}
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
