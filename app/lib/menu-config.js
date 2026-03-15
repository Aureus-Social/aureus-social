// ═══ MENU CONFIGURATION — AUREUS SOCIAL PRO — v39 (nettoyé) ═══
// Doublons supprimés · Groupes rationalisés · 8 groupes logiques

export const MENU = [

  // ── ACCUEIL ──────────────────────────────────────────────────
  { id: '_g1', label: 'ACCUEIL', icon: '◫', group: true },
  { id: 'dashboard',      label: 'Dashboard',        icon: '◫',  g: 1, keywords: ['accueil','tableau de bord','kpi','indicateurs','resume'] },
  { id: 'embaucheaz',     label: 'Embauche A→Z',     icon: '🚀', g: 1, keywords: ['embauche','guide','etapes','checklist','onboarding','nouveau travailleur'] },
  { id: 'smartalerts',    label: 'Alertes',           icon: '🔔', g: 1, keywords: ['alerte','notification','avertissement','rappel','deadline','echeance'] },

  // ── EMPLOYÉS ─────────────────────────────────────────────────
  { id: '_g2', label: 'EMPLOYÉS', icon: '👥', group: true },
  { id: 'employees',      label: 'Liste & Fiches',      icon: '👤', g: 2, keywords: ['employe','travailleur','liste','fiche','personnel','ouvrier','niss','contrat','salarie'] },
  { id: 'onboarding',     label: 'Nouvel employé',      icon: '🆕', g: 2, keywords: ['nouvel employe','nouveau travailleur','onboarding','engagement','entree service','embauche','dimona in'] },
  { id: 'aidesembauche',  label: "Aides à l'embauche",  icon: '💶', g: 2, keywords: ['c78','c103','activa','winwin','actiris','sine','ptp','jeunes','seniors','reduction onss','aide embauche','impulsion','monbee'] },
  { id: 'contratsmenu',   label: 'Contrats & Docs',     icon: '📝', g: 2, keywords: ['contrat','cdi','cdd','document','avenant','clause','periode essai','modele','template'] },
  { id: 'gestionabs',     label: 'Absences & Congés',   icon: '🗓', g: 2, keywords: ['absence','conge','vacances','maladie','repos','calendrier absence','planning'] },
  { id: 'conges',         label: 'Demandes Congés',     icon: '✅', g: 2, keywords: ['conge','demande','vacances','approbation','calendrier'] },
  { id: 'offboarding',    label: 'Offboarding',         icon: '👋', g: 2, keywords: ['offboarding','depart','sortie','fin contrat','licenciement','demission','c4','dimona out'] },
  { id: 'dashrh',         label: 'Dashboard RH',        icon: '📊', g: 2, keywords: ['tableau bord rh','statistiques rh','effectifs','turnover','absenteisme','kpi rh'] },
  { id: 'portail',        label: 'Portail Employé',     icon: '🌐', g: 2, keywords: ['portail employe','self service','espace employe','fiches paie employe'] },
  { id: 'proceduresrh',   label: 'Procédures RH',       icon: '📋', g: 2, keywords: ['procedure','rh','ressources humaines','cct','convention','reglement','harcelement','bien etre'] },
  { id: 'accidentTravail', label: 'Accident du Travail', icon: '🚑', g: 2, keywords: ['accident travail','at','sinistre','fedris','declaration accident','blessure'] },
  { id: 'assuranceloi',   label: 'Assurance-Loi AT',    icon: '🛡️', g: 2, keywords: ['assurance loi','accident travail','fedris','sinistre','prime at','police at'] },

  // ── GESTION CONTRAT ──────────────────────────────────────────
  { id: '_g8', label: 'GESTION CONTRAT', icon: '⚖️', group: true },
  { id: 'calcmaladie',    label: 'Calcul Maladie',      icon: '🏥', g: 8, keywords: ['maladie','incapacite','salaire garanti','inami','mutualite','arret maladie','30 jours','certificat medical'] },
  { id: 'simulicenciement', label: 'Licenciement',      icon: '⚖️', g: 8, keywords: ['licenciement','preavis','indemnite','rupture','statut unique','fin contrat','calcul preavis','cct109','motif grave'] },
  { id: 'simutp',         label: 'Temps Partiel',       icon: '⏱', g: 8, keywords: ['temps partiel','mi temps','plancher fictif','onss temps partiel','pro rata','regime partiel'] },
  { id: 'creditemps',     label: 'Crédit-Temps',        icon: '🔄', g: 8, keywords: ['credit temps','cct103','suspension carriere','1/5 temps','onem credit','allocation credit temps','fin carriere'] },
  { id: 'chomagetemporaire', label: 'Chômage Temporaire', icon: '⏸', g: 8, keywords: ['chomage temporaire','chomage economique','suspension contrat','c106','onem chomage','allocation chomage','manque travail'] },
  { id: 'compteIndividuel', label: 'Compte Individuel', icon: '📄', g: 8, keywords: ['compte individuel','recap annuel','bilan travailleur','cotisations annuelles','recapitulatif annuel'] },

  // ── PAIE ─────────────────────────────────────────────────────
  { id: '_g3', label: 'PAIE', icon: '💰', group: true },
  { id: 'payslip',        label: 'Fiches de Paie',      icon: '◈',  g: 3, keywords: ['fiche paie','bulletin paie','salaire','brut','net','onss','precompte','calcul paie','mensuel','pdf','historique','telecharger'] },
  { id: 'calcinstant',    label: 'Calcul & Simulation',  icon: '🧮', g: 3, keywords: ['calcul','simulation','simulateur','brut net','net brut','cout employeur','package','optimisation','simulateur embauche'] },
  { id: 'gestionprimes',  label: 'Primes & Avantages',  icon: '🎁', g: 3, keywords: ['prime','avantage','bonus','13e mois','double pecule','cheques repas','eco cheques','atn','voiture','gsm','cla90','warrant'] },
  { id: 'cloture',        label: 'Clôture Mensuelle',   icon: '🔄', g: 3, keywords: ['cloture','mensuel','fermeture','validation paie','fin mois','comptabilisation'] },
  { id: 'baremescp',      label: 'Barèmes & Seuils',    icon: '📐', g: 3, keywords: ['bareme','seuil','rmmmg','salaire minimum','cp','commission paritaire','index','indexation','plafond','pp','precompte baremes'] },
  { id: 'netaubrut',      label: 'Net → Brut',          icon: '⚖️', g: 3, keywords: ['net au brut','brut au net','calcul salaire','salaire net','salaire brut','inverser','target'] },
  { id: 'caissevacances', label: 'Caisse de Vacances',  icon: '🏖️', g: 3, keywords: ['caisse vacances','pecule vacances','onva','ouvriers vacances','pecule simple','pecule double'] },
  { id: 'chequesrepas',   label: 'Chèques-Repas',       icon: '🍽️', g: 3, keywords: ['cheques repas','sodexo','edenred','monizze','titre repas','commande cheques'] },

  // ── DÉCLARATIONS ─────────────────────────────────────────────
  { id: '_g4', label: 'DÉCLARATIONS', icon: '📡', group: true },
  { id: 'declarations',   label: 'ONSS & Dimona',       icon: '📡', g: 4, keywords: ['onss','dimona','declaration','cotisation','dmfa','trimestrielle','matricule','social security'] },
  { id: 'exportcompta',   label: 'Exports Comptables',  icon: '📤', g: 4, keywords: ['export','comptabilite','winbooks','bob','exact online','octopus','od salaires','ecriture comptable'] },
  { id: 'connecteurscompta', label: 'BOB / WinBooks',   icon: '📒', g: 4, keywords: ['bob','winbooks','kluwer','soda','connecteur','liaison comptable'] },
  { id: 'sepa',           label: 'SEPA Virements',      icon: '💳', g: 4, keywords: ['sepa','virement','paiement salaire','pain001','xml virement','banque','iban'] },
  { id: 'belcotax281',    label: 'Belcotax 281.xx',     icon: '📊', g: 4, keywords: ['belcotax','281','fiche fiscale','finprof','281.10','xml fiscal','spf finances'] },
  { id: 'documentsociaux', label: 'Documents Sociaux',  icon: '📑', g: 4, keywords: ['drs','c4','c78','c103','inami','chomage','attestation','document social','formulaire'] },
  { id: 'decava',         label: 'DECAVA — Véhicules',  icon: '🚗', g: 4, keywords: ['decava','vehicule','voiture','tva voiture','atn vehicule','co2','usage mixte'] },
  { id: 'listingtva',     label: 'Listing TVA',         icon: '📋', g: 4, keywords: ['listing tva','intervat','tva annuel','xml tva','declaration tva','spf finances tva'] },
  { id: 'echeancier',     label: 'Échéancier',          icon: '📅', g: 4, keywords: ['echeancier','calendrier','deadline','date limite','onss date','tva date','agenda social','j moins'] },
  { id: 'rapports',       label: 'Rapports',            icon: '📈', g: 4, keywords: ['rapport','reporting','bilan','synthese','analytique','export rapport'] },

  // ── COMMERCIAL ───────────────────────────────────────────────
  { id: '_g5', label: 'COMMERCIAL', icon: '🎯', group: true },
  { id: 'diagnostic',     label: 'Diagnostic Client',   icon: '🔍', g: 5, keywords: ['diagnostic','client','prospect','audit','analyse','sd worx','partena','securex','concurrent','migration'] },
  { id: 'checklistclient', label: 'Checklist Reprise',  icon: '✅', g: 5, keywords: ['checklist','reprise','client','nouveau client','onboarding client','migration','transfert dossier'] },
  { id: 'comparatif',     label: 'Comparatif Marché',   icon: '⚔️', g: 5, keywords: ['comparatif','marche','concurrent','sd worx','partena','securex','prix','benchmark'] },
  { id: 'guidecommercial', label: 'Guide Commercial',   icon: '📖', g: 5, keywords: ['guide commercial','vente','pitch','argument','prospect','fiduciaire','script','objection'] },
  { id: 'mandatonss',     label: 'Mandats & Primes',    icon: '🏛', g: 5, keywords: ['mandat','onss','mahis','activa','monbee','impulsion','art60','cpas','premier emploi','aide emploi','activa bruxelles'] },
  { id: 'coutsannuel',    label: 'Coûts Annuels',       icon: '📊', g: 5, keywords: ['cout annuel','masse salariale','budget paie','projection','12 mois','cout total','charge patronale'] },
  { id: 'facturationfiches', label: 'Facturation Fiches', icon: '💰', g: 5, keywords: ['facturation fiches','2 euro','fiche paie facturation','paiement fiche','encaisser','impaye','paye','revenus fiches'] },
  { id: 'subscriptions',  label: 'Plans & Abonnements', icon: '💳', g: 5, keywords: ['abonnement','plan','pricing','mrr','arr','starter','pro','fiduciaire','revenue','client payant'] },
  { id: 'bilansocial',    label: 'Bilan Social',        icon: '📋', g: 5, keywords: ['bilan social','effectif','mouvement','formation','rapport annuel'] },
  { id: 'facturation',    label: 'Facturation',         icon: '🧾', g: 5, keywords: ['facture','facturation','invoice','peppol','client','ttc','htva','tva','devis','avoir'] },

  // ── ADMINISTRATION ───────────────────────────────────────────
  { id: '_g6', label: 'ADMINISTRATION', icon: '⚙️', group: true },
  { id: 'gestionutilisateurs', label: 'Utilisateurs',  icon: '👥', g: 6, keywords: ['utilisateur','inviter','compte','email','role','acces','creer compte','invitation','desactiver','gestion utilisateur'] },
  { id: 'permissions',    label: 'Rôles & Accès',       icon: '🔐', g: 6, keywords: ['role','acces','permission','droit','securite acces','profil','matrice permissions'] },
  { id: 'securite',       label: 'Sécurité',            icon: '🛡', g: 6, keywords: ['securite','2fa','totp','double authentification','audit','rgpd','backup','sauvegarde','restore','webhooks','api'] },
  { id: 'admin',          label: 'Paramètres',          icon: '⚙️', g: 6, keywords: ['parametre','configuration','reglage','compte','societe','bce','tva','adresse','settings'] },
  { id: 'migrations',     label: 'Migrations DB',       icon: '⚙️', g: 6, keywords: ['migration','pgcrypto','rls','niss','iban','chiffrement','base de donnees','db','supabase'] },
];

export const GROUPS = MENU.filter(m => m.group);
export const getGroupItems = (gNum) => MENU.filter(m => m.g === gNum && !m.group);

// ═══ REDIRECTIONS — ancien id → nouveau id ═══
export const MENU_REDIRECTS = {
  // Accueil
  commandcenter: 'dashboard', tbdirection: 'dashboard', journal: 'smartalerts',
  notifications: 'smartalerts', actionsrapides: 'dashboard',
  // Employés
  dashabsent: 'gestionabs', planifconges: 'gestionabs', workflowAbs: 'gestionabs',
  joursPrestes: 'gestionabs', demandesconges: 'conges', interimaires: 'employees',
  registrepersonnel: 'employees', rh: 'dashrh', onboardwizard: 'onboarding',
  contratgen: 'contratsmenu', formC4: 'contratsmenu', formC131: 'contratsmenu',
  portailclient: 'portail', portalmanager: 'portail',
  // Gestion contrat → g:8
  calcmaladie: 'calcmaladie', chomagetemporaire: 'chomagetemporaire',
  creditemps: 'creditemps', simutp: 'simutp', simulicenciement: 'simulicenciement',
  compteIndividuel: 'compteIndividuel', compteindividuelannuel: 'compteIndividuel',
  // Paie
  salaires: 'payslip', validation: 'cloture', timeline: 'cloture', budget: 'cloture',
  fichespaiepdf: 'payslip', historiquepayroll: 'payslip', payrollhistory: 'payslip',
  comparateur: 'calcinstant', simulateurspro: 'calcinstant', optifiscale: 'calcinstant',
  couttotal: 'calcinstant', simembauche: 'calcinstant', simupension: 'calcinstant',
  avantages: 'gestionprimes', vehiculesatn: 'gestionprimes', flexijobs: 'gestionprimes',
  baremespp: 'baremescp', seuilssociaux: 'baremescp', calendrier: 'baremescp',
  soldetoutcompte: 'payslip', regulPP: 'payslip', autoindex: 'payslip',
  annexeReglement: 'contratsmenu',
  // Déclarations
  onss: 'declarations', batchdecl: 'declarations', chargessociales: 'declarations',
  exportWinbooks: 'exportcompta', bob50: 'connecteurscompta', bob360: 'connecteurscompta',
  winbooks: 'connecteurscompta', exportcomptapro: 'exportcompta', exportcoda: 'exportcompta',
  exportbatch: 'exportcompta', importcsv: 'exportcompta',
  reporting: 'rapports', reportingpro: 'rapports', rapportsrole: 'rapports',
  rapportce: 'rapports', fiscal: 'rapports', analytics: 'rapports',
  belcotaxmandat: 'mandatonss',
  // Commercial
  diagnosticv: 'diagnostic', fiduciaire: 'guidecommercial', guidefiduciaire: 'guidecommercial',
  parserConcurrent: 'comparatif', repriseclient: 'checklistclient',
  domiciliation: 'mandatonss', premieremploi: 'mandatonss', activabruxelles: 'mandatonss',
  art60cpas: 'mandatonss', impulsion55: 'mandatonss', monbee: 'mandatonss',
  gendocsjur: 'contratsmenu', legal: 'contratsmenu',
  // Admin (fusionnés)
  authroles: 'permissions', demandes_acces: 'gestionutilisateurs',
  access_manager: 'gestionutilisateurs',
  webhooks: 'securite', backup: 'securite', auditsecuritecode: 'securite',
  audittrail: 'securite', '2fa': 'securite', totp: 'securite', mfa: 'securite',
  securitedata: 'securite', rgpd: 'securite',
  adminbaremes: 'admin', archives: 'admin', aureussuite: 'admin',
  autopilot: 'admin', piloteauto: 'admin', cgvsaas: 'admin', changelog: 'admin',
  compliance: 'securite', demodonnees: 'admin', ged: 'admin', massengine: 'admin',
  mentionslegales: 'admin', queue: 'admin', roadmapinfra: 'admin',
  support: 'admin', testsuite: 'securite', team: 'admin',
  connexionshub: 'admin', integrations: 'admin', monitoring: 'admin',
};

// ═══ INDEX SOUS-SECTIONS — RECHERCHE CONTEXTUELLE ═══
export const SEARCH_SUBSECTIONS = [
  { id: 'payslip', anchor: 'section-onss-cotisations', icon: '⚡', label: 'ONSS & Cotisations',
    sub: 'Fiches de Paie', keywords: ['onss','cotisation','13,07','25,07','securite sociale','patronal'] },
  { id: 'payslip', anchor: 'section-precompte', icon: '🧾', label: 'Précompte professionnel',
    sub: 'Fiches de Paie', keywords: ['precompte','pp','impot','tranches','taux','bonus emploi'] },
  { id: 'gestionprimes', anchor: 'section-avantages', icon: '🎁', label: 'Avantages & Frais propres',
    sub: 'Primes & Avantages', keywords: ['avantages','frais propres','cheques repas','eco cheques','teletravail','km'] },
  { id: 'baremescp', anchor: 'section-cp', icon: '📋', label: 'Barème sectoriel CP',
    sub: 'Barèmes & Seuils', keywords: ['bareme','cp','commission paritaire','sectoriel','minimum','cp 200'] },
  { id: 'securite', anchor: 'section-2fa', icon: '🔐', label: '2FA / TOTP',
    sub: 'Sécurité', keywords: ['2fa','totp','double authentification','authenticator','mfa'] },
  { id: 'securite', anchor: 'section-backup', icon: '💾', label: 'Backup & Restore',
    sub: 'Sécurité', keywords: ['backup','sauvegarde','restauration','restore','backblaze'] },
  { id: 'securite', anchor: 'section-audit', icon: '🔍', label: 'Audit Trail',
    sub: 'Sécurité', keywords: ['audit trail','log','historique','trace','activite'] },
];
