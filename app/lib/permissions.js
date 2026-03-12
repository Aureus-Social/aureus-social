// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Matrice Permissions par Rôle v2
// 4 profils : admin | secretariat | commercial | rh_entreprise
// Mis à jour : 12/03/2026 — aligné sur les 116 routes réelles
// ═══════════════════════════════════════════════════════════════

export const ROLES = ['admin', 'secretariat', 'commercial', 'rh_entreprise'];

export const ROLE_LABELS = {
  admin:         'Administrateur',
  secretariat:   'Secrétariat Social',
  commercial:    'Commercial',
  rh_entreprise: 'RH Entreprise',
};

export const ROLE_COLORS = {
  admin:         '#c6a34e',
  secretariat:   '#3b82f6',
  commercial:    '#a78bfa',
  rh_entreprise: '#22c55e',
};

export const ROLE_DESCRIPTIONS = {
  admin:         'Nourdin — accès total, configuration, facturation, audit, tous les modules',
  secretariat:   'Secrétariat social partenaire — paie, déclarations, ONSS, Dimona, exports compta',
  commercial:    'Équipe commerciale — prospects, diagnostics, devis, checklist client, comparatifs',
  rh_entreprise: 'RH d\'une société cliente — gestion employés, absences, contrats, portail, documents',
};

// ── Permissions fonctionnelles ─────────────────────────────────
export const PERMISSIONS = {
  // Paie & Calculs
  voir_fiches_paie:        { admin: true,  secretariat: true,  commercial: false, rh_entreprise: true  },
  calculer_paie:           { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false },
  simuler_salaires:        { admin: true,  secretariat: true,  commercial: true,  rh_entreprise: false },
  gestion_primes:          { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false },
  cloture_mensuelle:       { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false },
  // Déclarations & Compta
  soumettre_dimona:        { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false },
  declarations_onss:       { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false },
  exporter_comptabilite:   { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false },
  sepa_virements:          { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false },
  // RH & Employés
  voir_travailleurs:       { admin: true,  secretariat: true,  commercial: false, rh_entreprise: true  },
  modifier_travailleurs:   { admin: true,  secretariat: true,  commercial: false, rh_entreprise: true  },
  onboarding:              { admin: true,  secretariat: true,  commercial: false, rh_entreprise: true  },
  gerer_contrats:          { admin: true,  secretariat: true,  commercial: false, rh_entreprise: true  },
  gestion_absences:        { admin: true,  secretariat: true,  commercial: false, rh_entreprise: true  },
  portail_employe:         { admin: true,  secretariat: false, commercial: false, rh_entreprise: true  },
  procedures_rh:           { admin: true,  secretariat: true,  commercial: false, rh_entreprise: true  },
  // Commercial
  voir_prospects:          { admin: true,  secretariat: false, commercial: true,  rh_entreprise: false },
  diagnostic_commercial:   { admin: true,  secretariat: false, commercial: true,  rh_entreprise: false },
  guide_commercial:        { admin: true,  secretariat: false, commercial: true,  rh_entreprise: false },
  checklist_client:        { admin: true,  secretariat: false, commercial: true,  rh_entreprise: false },
  gerer_facturation:       { admin: true,  secretariat: false, commercial: true,  rh_entreprise: false },
  // Admin & Sécurité
  acces_audit_trail:       { admin: true,  secretariat: false, commercial: false, rh_entreprise: false },
  gerer_utilisateurs:      { admin: true,  secretariat: false, commercial: false, rh_entreprise: false },
  configuration_app:       { admin: true,  secretariat: false, commercial: false, rh_entreprise: false },
  voir_dashboard_kpis:     { admin: true,  secretariat: true,  commercial: true,  rh_entreprise: true  },
  mandats_primes:          { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false },
};

// ══════════════════════════════════════════════════════════════
// MENU PAR RÔLE — IDs autorisés (whitelist)
// admin = null → tout visible sans filtre
// ══════════════════════════════════════════════════════════════
export const MENU_BY_ROLE = {

  // ── ADMIN — tout ──────────────────────────────────────────
  admin: null,

  // ── SECRÉTARIAT SOCIAL ────────────────────────────────────
  secretariat: new Set([
    // Tableau de bord & navigation
    'dashboard', 'commandcenter', 'embaucheaz', 'journal', 'notifications', 'smartalerts',
    'actionsrapides', 'autopilot', 'piloteauto',
    // RH & Employés
    'employees', 'dashrh', 'rh', 'team',
    'onboarding', 'onboardwizard',
    'contratgen', 'contratsmenu', 'formC4', 'formC131',
    'gestionabs', 'dashabsent', 'planifconges', 'workflowAbs',
    'accidentTravail', 'joursPrestes', 'interimaires',
    'registrepersonnel', 'proceduresrh',
    'timeline', 'calendrier',
    // Paie
    'payslip', 'salaires', 'calcinstant', 'baremescp', 'baremespp',
    'gestionprimes', 'avantages', 'cloture', 'validation',
    'simembauche', 'simutp', 'comparateur', 'optifiscale', 'couttotal',
    'calcmaladie', 'soldetoutcompte', 'vehiculesatn', 'flexijobs',
    'compteIndividuel', 'coutsannuel', 'regulPP', 'autoindex',
    'budget', 'echeancier', 'massengine', 'queue',
    // Déclarations & Compta
    'declarations', 'onss', 'batchdecl', 'belcotax281',
    'exportWinbooks', 'exportcompta', 'exportcomptapro', 'exportcoda', 'exportbatch',
    'importcsv', 'sepa', 'chargessociales', 'chomagetemporaire',
    'rapports', 'reporting', 'auditfiscale', 'fiscal',
    'echeancier', 'compteindividuelannuel',
    // Concertation sociale
    'ccts', 'seuilssociaux', 'bilansocial', 'compteindividuelannuel',
    'egalitehf', 'electionsociales', 'formationsec', 'social',
    'delegations', 'delegationsyndicale', 'plandiversite', 'lanceursalerte',
    'rapportce',
    // Mandats & primes patronales
    'mandatonss', 'belcotaxmandat', 'domiciliation', 'premieremploi',
    'activabruxelles', 'art60cpas', 'impulsion55', 'monbee', 'connexionshub',
    // Portails clients & documents
    'portailclient', 'portalmanager', 'ged', 'archives',
    'annexeReglement', 'contratgen', 'legal', 'gendocsjur', 'cgvsaas',
    // Simulateurs
    'simulateurspro', 'simupension', 'simulicenciement',
    // Support
    'support',
  ]),

  // ── COMMERCIAL ────────────────────────────────────────────
  commercial: new Set([
    // Tableau de bord
    'dashboard', 'notifications', 'smartalerts',
    // Commercial — cœur métier
    'diagnostic', 'diagnosticv',
    'checklistclient', 'comparatif',
    'guidecommercial', 'guidefiduciaire', 'fiduciaire',
    'landing', 'parserConcurrent', 'repriseclient',
    'gendocsjur',
    // Facturation & reporting commercial
    'facturation', 'rapportsrole', 'reportingpro',
    // Outils lecture (calculs avant-vente)
    'baremescp', 'seuilssociaux', 'calcinstant',
    'simembauche', 'simulateurspro', 'comparateur',
    'couttotal', 'optifiscale',
    // Portail clients (vue lite)
    'portailclient',
    // Support
    'support',
  ]),

  // ── RH ENTREPRISE ─────────────────────────────────────────
  rh_entreprise: new Set([
    // Tableau de bord
    'dashboard', 'dashrh', 'notifications',
    // Employés & RH — cœur métier
    'employees', 'rh', 'team',
    'onboarding', 'onboardwizard',
    'contratgen', 'contratsmenu', 'formC4', 'formC131',
    'gestionabs', 'dashabsent', 'planifconges', 'workflowAbs',
    'accidentTravail', 'joursPrestes', 'registrepersonnel',
    'proceduresrh', 'timeline', 'calendrier',
    // Portail employé
    'portail',
    // Lecture fiches de paie uniquement
    'payslip', 'salaires',
    // Documents
    'annexeReglement', 'legal', 'gendocsjur',
    // Concertation sociale (lecture)
    'ccts', 'seuilssociaux', 'egalitehf', 'electionsociales',
    'formationsec', 'delegations', 'delegationsyndicale',
    'plandiversite', 'lanceursalerte', 'rapportce', 'bilansocial',
    // Avantages (lecture)
    'gestionprimes', 'avantages', 'calcmaladie',
    // Support
    'support',
  ]),
};

// KPIs visibles par rôle
export const KPI_SCOPE = {
  admin:         ['all'],
  secretariat:   ['masse_salariale', 'cotisations', 'pp', 'fiches_paie', 'sepa', 'travailleurs', 'dimona', 'contrats'],
  commercial:    ['clients', 'facturation', 'revenue', 'prospects'],
  rh_entreprise: ['travailleurs', 'contrats', 'absences', 'dimona', 'fiches_paie'],
};

// ── Helpers ────────────────────────────────────────────────────
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const perm = PERMISSIONS[permission];
  if (!perm) return false;
  return perm[role] === true;
}

export function canAccessPage(role, pageId) {
  if (role === 'admin') return true;
  const allowed = MENU_BY_ROLE[role];
  if (!allowed) return true;
  return allowed.has(pageId);
}

export function getMenuForRole(menuItems, role) {
  if (role === 'admin') return menuItems;
  const allowed = MENU_BY_ROLE[role];
  if (!allowed) return menuItems;
  return menuItems.filter(item => item.group || allowed.has(item.id));
}

export function getRoleFromUser(user) {
  if (!user) return 'rh_entreprise';
  const meta = user.user_metadata || {};
  const role = (meta.role || meta.role || '').toLowerCase();
  if (ROLES.includes(role)) return role;
  const email = (user.email || '').toLowerCase();
  if (email.includes('admin') || email.includes('nourdin') || email.includes('aureus-ia')) return 'admin';
  if (email.includes('secretariat') || email.includes('paie') || email.includes('comptable')) return 'secretariat';
  if (email.includes('commercial') || email.includes('sales') || email.includes('prospect')) return 'commercial';
  return 'rh_entreprise';
}

export function checkApiPermission(userEmail, userRole, permission) {
  const role = userRole || 'rh_entreprise';
  const allowed = hasPermission(role, permission);
  return { allowed, role };
}

export function getPermissionsForRole(role) {
  return Object.entries(PERMISSIONS)
    .filter(([, perms]) => perms[role] === true)
    .map(([perm]) => perm);
}
