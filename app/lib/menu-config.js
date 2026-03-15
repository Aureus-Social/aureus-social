// ═══ MENU CONFIGURATION — AUREUS SOCIAL PRO ═══
// Chaque item a des keywords pour être trouvable dans la barre de recherche

export const MENU = [

  // ── ACCUEIL ──────────────────────────────────────────────────
  { id: '_g1', label: 'ACCUEIL', icon: '◫', group: true },
  { id: 'dashboard',      label: 'Dashboard',        icon: '◫', g: 1, keywords: ['accueil','tableau de bord','kpi','indicateurs','resume'] },
  { id: 'embaucheaz',     label: 'Embauche A→Z',     icon: '🚀', g: 1, keywords: ['embauche','guide','etapes','checklist','onboarding','nouveau travailleur','premier employe','engagement'] },
  { id: 'smartalerts',    label: 'Smart Alertes',    icon: '🔔', g: 1, keywords: ['alerte','notification','avertissement','rappel','deadline','echeance'] },
  { id: 'notifications',  label: 'Notifications',    icon: '🔔', g: 1, keywords: ['notification','message','alerte','rappel'] },

  // ── EMPLOYÉS ─────────────────────────────────────────────────
  { id: '_g2', label: 'EMPLOYÉS', icon: '👥', group: true },
  { id: 'employees',      label: 'Liste & Fiches',      icon: '👤', g: 2, keywords: ['employe','travailleur','liste','fiche','personnel','ouvrier','dirigeant','niss','contrat','salarie'] },
  { id: 'onboarding',     label: 'Nouvel employé',      icon: '🆕', g: 2, keywords: ['nouvel employe','nouveau travailleur','onboarding','engagement','entree service','embauche','wizard','dimona in'] },
  { id: 'aidesembauche',  label: "Aides à l'embauche",  icon: '💶', g: 2, keywords: ['c78','c103','activa','winwin','actiris','sine','ptp','jeunes','seniors','reduction onss','aide embauche','impulsion','monbee','premier employe'] },
  { id: 'contratsmenu',   label: 'Contrats & Docs',     icon: '📝', g: 2, keywords: ['contrat','cdi','cdd','contrat travail','document','avenant','clause','periode essai','modele','template'] },
  { id: 'gestionabs',     label: 'Absences & Congés',   icon: '🗓', g: 2, keywords: ['absence','conge','vacances','maladie','repos','recuperation','arret','calendrier absence'] },
  { id: 'conges',         label: 'Demandes Congés',     icon: '✅', g: 2, keywords: ['conge','demande','vacances','absence','approbation','calendrier','planning'] },
  { id: 'offboarding',    label: 'Offboarding',         icon: '👋', g: 2, keywords: ['offboarding','depart','sortie','fin contrat','licenciement','demission','checklist sortie','c4','dimona out'] },
  { id: 'dashrh',         label: 'Tableau de bord RH',  icon: '📊', g: 2, keywords: ['tableau bord rh','statistiques rh','effectifs','turnover','absenteisme','kpi rh'] },
  { id: 'portail',        label: 'Portail Employé',     icon: '🌐', g: 2, keywords: ['portail employe','self service','espace employe','fiches paie employe','documents employe'] },
  { id: 'proceduresrh',   label: 'Procédures RH',       icon: '📋', g: 2, keywords: ['procedure','rh','ressources humaines','cct','convention','reglement','politique','harcelement','bien etre'] },
  { id: 'accidentTravail', label: 'Accident du Travail', icon: '🚑', g: 2, keywords: ['accident travail','at','sinistre','fedris','declaration accident','blessure','incapacite'] },
  { id: 'assuranceloi',   label: 'Assurance-Loi AT',    icon: '🛡️', g: 2, keywords: ['assurance loi','accident travail','at','fedris','sinistre','prime at','declaration accident','police at','loi 1971'] },

  // ── PAIE ─────────────────────────────────────────────────────
  { id: '_g3', label: 'PAIE', icon: '💰', group: true },
  { id: 'payslip',        label: 'Fiches de Paie',      icon: '◈', g: 3, keywords: ['fiche paie','bulletin paie','salaire','brut','net','onss','precompte','calcul paie','mensuel'] },
  { id: 'calcinstant',    label: 'Calcul & Simulation',  icon: '🧮', g: 3, keywords: ['calcul','simulation','simulateur','brut net','net brut','cout employeur','package','optimisation'] },
  { id: 'gestionprimes',  label: 'Primes & Avantages',  icon: '🎁', g: 3, keywords: ['prime','avantage','bonus','13e mois','double pecule','cheques repas','eco cheques','atn','voiture','gsm','cla90','warrant'] },
  { id: 'cloture',        label: 'Clôture Mensuelle',   icon: '🔄', g: 3, keywords: ['cloture','mensuel','fermeture','validation paie','centralisation','fin mois','comptabilisation'] },
  { id: 'historiquepayroll', label: 'Historique Paie',  icon: '📊', g: 3, keywords: ['historique','paie','archives','ancienne fiche','recap','bilan paie','annee precedente'] },
  { id: 'fichespaiepdf',  label: 'Fiches PDF',          icon: '📑', g: 3, keywords: ['pdf','fiche paie pdf','telecharger','imprimer','generer pdf','email fiche','envoi fiche'] },
  { id: 'baremescp',      label: 'Barèmes & Seuils',    icon: '📐', g: 3, keywords: ['bareme','seuil','rmmmg','salaire minimum','cp','commission paritaire','index','indexation','plafond'] },
  { id: 'netaubrut',      label: 'Net au Brut',         icon: '⚖️', g: 3, keywords: ['net au brut','brut au net','calcul salaire','salaire net','salaire brut','inverser','target'] },
  { id: 'caissevacances', label: 'Caisse de Vacances',  icon: '🏖️', g: 3, keywords: ['caisse vacances','pecule vacances','onva','ouvriers vacances','pecule simple','pecule double','vacances annuelles'] },
  { id: 'chequesrepas',   label: 'Chèques-Repas',       icon: '🍽️', g: 3, keywords: ['cheques repas','sodexo','edenred','monizze','titre repas','maaltijdcheque','repas','commande cheques'] },
  { id: 'calcmaladie',    label: 'Calcul Maladie',      icon: '🏥', g: 2, keywords: ['maladie','incapacite','salaire garanti','inami','mutualite','arret maladie','conge maladie','30 jours','ouvrier maladie','employe maladie','certificat medical'] },
  { id: 'coutsannuel',    label: 'Coûts Annuels',       icon: '📊', g: 3, keywords: ['cout annuel','masse salariale','budget paie','projection','12 mois','cout total','charge patronale','planification salariale'] },
  { id: 'simulicenciement', label: 'Simulateur Licenciement', icon: '⚖️', g: 2, keywords: ['licenciement','preavis','indemnite','rupture','statut unique','fin contrat','calcul preavis','cct109','motif grave','depart'] },
  { id: 'simupension',    label: 'Simulateur Pension',  icon: '🏖', g: 3, keywords: ['pension','retraite','simulateur pension','carriere','age pension','bonus pension','epargne pension','pilier'] },
  { id: 'simutp',         label: 'Temps Partiel',       icon: '⏱', g: 2, keywords: ['temps partiel','mi temps','4/5 temps','plancher fictif','onss temps partiel','pro rata','regime partiel','droits partiels'] },
  { id: 'creditemps',     label: 'Crédit-Temps',        icon: '🔄', g: 2, keywords: ['credit temps','cct103','suspension carriere','1/5 temps','mi temps credit','onem credit','allocation credit temps','fin carriere','55 ans'] },
  { id: 'compteIndividuel', label: 'Compte Individuel', icon: '📄', g: 2, keywords: ['compte individuel','recap annuel','bilan travailleur','cotisations annuelles','historique salaire','recapitulatif annuel'] },
  { id: 'chomagetemporaire', label: 'Chômage Temporaire', icon: '⏸', g: 2, keywords: ['chomage temporaire','chomage economique','suspension contrat','c106','onem chomage','allocation chomage','manque travail','intemperie','force majeure'] },
  { id: 'simembauche',    label: 'Simulateur Embauche', icon: '🧮', g: 3, keywords: ['simulateur embauche','cout embauche','charge patronale','simulation salaire','calculer cout employe'] },

  // ── DÉCLARATIONS ─────────────────────────────────────────────
  { id: '_g4', label: 'DÉCLARATIONS', icon: '📡', group: true },
  { id: 'declarations',   label: 'ONSS & Dimona',       icon: '📡', g: 4, keywords: ['onss','dimona','declaration','cotisation','dmfa','trimestrielle','matricule','social security'] },
  { id: 'exportcompta',   label: 'Exports Comptables',  icon: '📤', g: 4, keywords: ['export','comptabilite','winbooks','bob','exact online','octopus','od salaires','journal','ecriture comptable'] },
  { id: 'connecteurscompta', label: 'BOB / WinBooks',   icon: '📒', g: 4, keywords: ['bob','winbooks','kluwer','soda','popsy','connecteur','liaison comptable','interface compta'] },
  { id: 'sepa',           label: 'SEPA Virements',      icon: '💳', g: 4, keywords: ['sepa','virement','paiement salaire','pain001','xml virement','banque','iban','virement salaire'] },
  { id: 'belcotax281',    label: 'Belcotax 281.xx',     icon: '📊', g: 4, keywords: ['belcotax','281','fiche fiscale','finprof','281.10','281.11','281.17','281.20','xml fiscal','spf finances','fiches fiscales'] },
  { id: 'documentsociaux', label: 'Documents Sociaux DRS', icon: '📑', g: 4, keywords: ['drs','c4','c78','c103','inami','chomage','attestation','document social','formulaire','onem formulaire','sociale documenten'] },
  { id: 'decava',         label: 'DECAVA — Véhicules',  icon: '🚗', g: 4, keywords: ['decava','vehicule','voiture','tva voiture','atn vehicule','avantage nature','co2','usage mixte','vehicule societe'] },
  { id: 'listingtva',     label: 'Listing Annuel TVA',  icon: '📋', g: 4, keywords: ['listing tva','intervat','tva annuel','clients assujettis','xml tva','declaration tva','spf finances tva'] },
  { id: 'rapports',       label: 'Rapports',            icon: '📈', g: 4, keywords: ['rapport','reporting','bilan','synthese','analytique','export rapport','pdf rapport'] },
  { id: 'facturation',    label: 'Facturation',         icon: '🧾', g: 4, keywords: ['facture','facturation','invoice','peppol','client','ttc','htva','tva','devis','avoir','paiement'] },
  { id: 'echeancier',     label: 'Échéancier',          icon: '📅', g: 4, keywords: ['echeancier','calendrier','deadline','date limite','onss date','tva date','fiscal date','rappel echeance','j moins','agenda social','calendrier social'] },

  // ── COMMERCIAL ───────────────────────────────────────────────
  { id: '_g5', label: 'COMMERCIAL', icon: '🎯', group: true },
  { id: 'diagnostic',     label: 'Diagnostic Client',   icon: '🔍', g: 5, keywords: ['diagnostic','client','prospect','audit','analyse','sd worx','partena','securex','concurrent','migration'] },
  { id: 'checklistclient', label: 'Checklist Reprise',  icon: '✅', g: 5, keywords: ['checklist','reprise','client','nouveau client','onboarding client','migration','transfert dossier'] },
  { id: 'comparatif',     label: 'Comparatif Marché',   icon: '⚔️', g: 5, keywords: ['comparatif','marche','concurrent','sd worx','partena','securex','prix','comparaison','benchmark'] },
  { id: 'guidecommercial', label: 'Guide Commercial',   icon: '📖', g: 5, keywords: ['guide commercial','vente','pitch','argument','prospect','fiduciaire','script','objection'] },
  { id: 'mandatonss',     label: 'Mandats & Primes',    icon: '🏛', g: 5, keywords: ['mandat','onss','mahis','activa','monbee','impulsion','art60','cpas','premier emploi','aide emploi','reduction patronale','activa bruxelles'] },
  { id: 'bilansocial',    label: 'Bilan Social',        icon: '📋', g: 5, keywords: ['bilan social','effectif','mouvement','formation','cout formation','egalite','rapport annuel','employe annuel'] },
  { id: 'subscriptions',  label: 'Plans & Abonnements', icon: '💳', g: 5, keywords: ['abonnement','plan','pricing','mrr','arr','starter','pro','fiduciaire','revenue','chiffre affaires','client payant'] },

  // ── ADMINISTRATION ───────────────────────────────────────────
  { id: '_g6', label: 'ADMINISTRATION', icon: '⚙️', group: true },
  { id: 'permissions',    label: 'Rôles & Accès',       icon: '🔐', g: 6, keywords: ['role','acces','permission','utilisateur','droit','securite acces','gestion utilisateur','profil'] },
  { id: 'webhooks',       label: 'Webhooks API',        icon: '🔗', g: 6, keywords: ['webhook','api','integration','notification api','automatisation','trigger','endpoint'] },
  { id: 'backup',         label: 'Backup & Restore',    icon: '💾', g: 6, keywords: ['backup','sauvegarde','restauration','restore','backblaze','donnees','securite donnees'] },
  { id: 'demandes_acces', label: "Demandes d'accès",    icon: '🔑', g: 6, keywords: ['demande acces','invitation','nouvel utilisateur','inscription','acces nouveau'] },
  { id: '2fa',            label: '2FA / TOTP',          icon: '🔐', g: 6, keywords: ['2fa','totp','double authentification','authenticator','securite connexion','mfa'] },
  { id: 'auditsecuritecode', label: 'Audit Sécurité',   icon: '🛡', g: 6, keywords: ['audit securite','code','vulnerabilite','rgpd','compliance','securite app','test securite'] },
  { id: 'audittrail',     label: 'Audit Trail',         icon: '🔍', g: 6, keywords: ['audit trail','log','historique','trace','activite','qui a fait quoi','journal audit'] },
  { id: 'admin',          label: 'Paramètres',          icon: '⚙️', g: 6, keywords: ['parametre','configuration','reglage','compte','societe','bce','tva','adresse','settings'] },
  { id: 'migrations',     label: 'Migrations DB',       icon: '⚙️', g: 6, keywords: ['migration','pgcrypto','rls','niss','iban','chiffrement','base de donnees','db','supabase','securite donnees','migration 007','migration 008'] },

  // ── MODULES SUPPLÉMENTAIRES ───────────────────────────────────
  { id: '_g7', label: 'AUTRES MODULES', icon: '🔧', group: true },
  { id: 'gestionsocietes', label: 'Gestion Sociétés',   icon: '🏢', g: 7, keywords: ['societe','client societe','multi client','fiduciaire client','gestion portefeuille','mrr','rev'] },
  { id: 'analytics',      label: 'Analytics & KPIs',    icon: '📈', g: 7, keywords: ['analytics','kpi','statistique','graphique','indicateur','performance','mesure'] },
  { id: 'connexionshub',  label: 'Hub Connexions',      icon: '🔗', g: 7, keywords: ['connexion','portail','lien','onss portail','dimona portail','belcotax portail','spf','mahis','csam','ehealth'] },
  { id: 'monitoring',     label: 'Monitoring',          icon: '🖥', g: 7, keywords: ['monitoring','uptime','disponibilite','surveillance','etat serveur','sante app'] },
  { id: 'adminbaremes',   label: 'Admin Barèmes',       icon: '⚙️', g: 7, keywords: ['bareme admin','gestion bareme','mise a jour bareme','constantes','taux legaux'] },
  { id: 'roadmapinfra',   label: 'Roadmap',             icon: '🗺', g: 7, keywords: ['roadmap','plan','a venir','futur','prochaine version','planning dev'] },
  { id: 'integrations',   label: 'Intégrations',        icon: '🔌', g: 7, keywords: ['integration','api','connecteur','externe','plugin','crm','erp'] },
];

export const GROUPS = MENU.filter(m => m.group);
export const getGroupItems = (gNum) => MENU.filter(m => m.g === gNum && !m.group);

// ═══ REDIRECTIONS — ancien id → nouveau id ═══
export const MENU_REDIRECTS = {
  commandcenter: 'dashboard', tbdirection: 'dashboard', journal: 'notifications',
  actionsrapides: 'dashboard', dashabsent: 'gestionabs', planifconges: 'gestionabs',
  workflowAbs: 'gestionabs', joursPrestes: 'gestionabs', interimaires: 'employees',
  registrepersonnel: 'employees', rh: 'dashrh', onboardwizard: 'onboarding',
  contratgen: 'contratsmenu', formC4: 'contratsmenu', formC131: 'contratsmenu',
  portailclient: 'portail', portalmanager: 'portail',
  salaires: 'payslip', validation: 'cloture', timeline: 'cloture', budget: 'cloture',
  comparateur: 'calcinstant', simulateurspro: 'calcinstant', optifiscale: 'calcinstant',
  couttotal: 'calcinstant', avantages: 'gestionprimes', vehiculesatn: 'gestionprimes',
  flexijobs: 'gestionprimes', baremespp: 'baremescp', seuilssociaux: 'baremescp',
  calendrier: 'baremescp', soldetoutcompte: 'payslip',
  compteindividuelannuel: 'compteIndividuel', regulPP: 'payslip',
  payrollhistory: 'historiquepayroll', fichespaie: 'fichespaiepdf',
  exportWinbooks: 'exportcompta', bob50: 'connecteurscompta', bob360: 'connecteurscompta',
  winbooks: 'connecteurscompta', exportcomptapro: 'exportcompta', exportcoda: 'exportcompta',
  exportbatch: 'exportcompta', importcsv: 'exportcompta', reporting: 'rapports',
  reportingpro: 'rapports', rapportsrole: 'rapports', rapportce: 'rapports',
  fiscal: 'rapports', diagnosticv: 'diagnostic', fiduciaire: 'guidecommercial',
  guidefiduciaire: 'guidecommercial', parserConcurrent: 'comparatif',
  repriseclient: 'checklistclient', gendocsjur: 'contratsmenu', legal: 'contratsmenu',
  domiciliation: 'mandatonss', premieremploi: 'mandatonss', activabruxelles: 'mandatonss',
  art60cpas: 'mandatonss', impulsion55: 'mandatonss', monbee: 'mandatonss',
  authroles: 'permissions', adminbaremes: 'admin', archives: 'admin',
  aureussuite: 'admin', autopilot: 'admin', piloteauto: 'admin',
  cgvsaas: 'admin', changelog: 'admin', compliance: 'auditsecuritecode',
  demodonnees: 'admin', ged: 'admin', massengine: 'admin', mentionslegales: 'admin',
  queue: 'admin', rgpd: 'auditsecuritecode', roadmapinfra: 'admin',
  securitedata: 'auditsecuritecode', support: 'admin', testsuite: 'auditsecuritecode',
  team: 'admin', autoindex: 'payslip', onss: 'declarations', batchdecl: 'declarations',
  chargessociales: 'declarations', ccts: 'baremescp', delegations: 'proceduresrh',
  egalitehf: 'proceduresrh', electionsociales: 'proceduresrh',
  formationsec: 'proceduresrh', lanceursalerte: 'proceduresrh',
  plandiversite: 'proceduresrh', social: 'proceduresrh',
  delegationsyndicale: 'proceduresrh', portailsbelges: 'connexionshub',
  liensutiles: 'connexionshub', apiwebhooks: 'webhooks', access_manager: 'demandes_acces',
  mfa: '2fa', totp: '2fa', belcotaxmandat: 'mandatonss',
};

// ═══ INDEX SOUS-SECTIONS — RECHERCHE CONTEXTUELLE ═══
export const SEARCH_SUBSECTIONS = [
  { id: 'payslip', anchor: 'section-onss-cotisations', icon: '⚡', label: 'ONSS & Cotisations',
    sub: 'Fiche de paie', keywords: ['onss','cotisation','13,07','25,07','securite sociale','patronal','ouvrier'] },
  { id: 'payslip', anchor: 'section-precompte', icon: '🧾', label: 'Précompte professionnel',
    sub: 'Fiche de paie', keywords: ['precompte','pp','impot','tranches','taux','bonus emploi','fiscal'] },
  { id: 'payslip', anchor: 'section-csss', icon: '📊', label: 'CSSS',
    sub: 'Fiche de paie', keywords: ['csss','cotisation speciale','revenu imposable'] },
  { id: 'gestionprimes', anchor: 'section-avantages', icon: '🎁', label: 'Avantages & Frais propres',
    sub: 'Primes & Avantages', keywords: ['avantages','frais propres','cheques repas','eco cheques','teletravail','km','kilometrique'] },
  { id: 'baremescp', anchor: 'section-cp', icon: '📋', label: 'Barème sectoriel CP',
    sub: 'Barèmes & Seuils', keywords: ['bareme','cp','commission paritaire','sectoriel','minimum','cp 200','cp 111','cp 118'] },
];
