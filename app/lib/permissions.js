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
  admin: null, // null = tout visible

  secretariat: new Set([
    'dashboard', 'embaucheaz', 'notifications', 'smartalerts',
    // Employés
    'employees', 'onboarding', 'aidesembauche', 'contratsmenu', 'gestionabs', 'conges',
    'offboarding', 'dashrh', 'portail', 'proceduresrh', 'accidentTravail', 'assuranceloi',
    'calcmaladie', 'chomagetemporaire', 'creditemps', 'simutp', 'simulicenciement', 'compteIndividuel',
    // Paie
    'payslip', 'calcinstant', 'gestionprimes', 'cloture', 'historiquepayroll', 'fichespaiepdf',
    'baremescp', 'netaubrut', 'caissevacances', 'chequesrepas', 'coutsannuel',
    'simupension', 'simembauche', 'simulateurspro',
    // Déclarations
    'declarations', 'exportcompta', 'connecteurscompta', 'sepa', 'belcotax281',
    'documentsociaux', 'decava', 'listingtva', 'rapports', 'echeancier', 'facturation',
    // Commercial
    'mandatonss', 'bilansocial',
  ]),

  commercial: new Set([
    'dashboard', 'notifications', 'embaucheaz',
    // Commercial
    'diagnostic', 'checklistclient', 'comparatif', 'guidecommercial', 'mandatonss',
    'facturation', 'rapports', 'subscriptions',
    // Outils utiles pour les prospects
    'calcinstant', 'baremescp', 'coutsannuel', 'simembauche',
    'aidesembauche', 'echeancier',
  ]),

  rh_entreprise: new Set([
    'dashboard', 'notifications', 'embaucheaz',
    // Employés
    'employees', 'onboarding', 'aidesembauche', 'contratsmenu', 'gestionabs', 'conges',
    'offboarding', 'dashrh', 'portail', 'proceduresrh', 'accidentTravail', 'assuranceloi',
    'calcmaladie', 'chomagetemporaire', 'creditemps', 'simutp', 'simulicenciement', 'compteIndividuel',
    // Paie (lecture)
    'payslip', 'gestionprimes', 'baremescp', 'fichespaiepdf', 'historiquepayroll',
    'chequesrepas', 'caissevacances', 'coutsannuel',
    // Documents
    'documentsociaux', 'echeancier',
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
