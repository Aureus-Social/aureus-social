// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Matrice Permissions par Rôle v3
// 6 profils : admin | secretariat | commercial | rh_entreprise | employe | comptable
// Mis à jour : 15/03/2026
// ═══════════════════════════════════════════════════════════════

export const ROLES = ['admin', 'secretariat', 'commercial', 'rh_entreprise', 'employe', 'comptable'];

export const ROLE_LABELS = {
  admin:         'Administrateur',
  secretariat:   'Secrétariat Social',
  commercial:    'Commercial',
  rh_entreprise: 'RH Entreprise',
  employe:       'Employé',
  comptable:     'Comptable Externe',
};

export const ROLE_COLORS = {
  admin:         '#c6a34e',
  secretariat:   '#3b82f6',
  commercial:    '#a78bfa',
  rh_entreprise: '#22c55e',
  employe:       '#06b6d4',
  comptable:     '#f97316',
};

export const ROLE_DESCRIPTIONS = {
  admin:         'Accès total — configuration, facturation, audit, tous les modules',
  secretariat:   'Secrétariat social partenaire — paie, déclarations, ONSS, Dimona, exports compta',
  commercial:    'Équipe commerciale — prospects, diagnostics, devis, checklist client, comparatifs',
  rh_entreprise: 'RH d\'une société cliente — gestion employés, absences, contrats, portail, documents',
  employe:       'Travailleur — accès à ses propres fiches de paie, documents, congés',
  comptable:     'Comptable ou fiduciaire externe — exports comptables, SEPA, Belcotax uniquement',
};

// ── Permissions fonctionnelles ─────────────────────────────────
export const PERMISSIONS = {
  // Paie & Calculs
  voir_fiches_paie:        { admin: true,  secretariat: true,  commercial: false, rh_entreprise: true,  employe: true,  comptable: false },
  calculer_paie:           { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false, employe: false, comptable: false },
  simuler_salaires:        { admin: true,  secretariat: true,  commercial: true,  rh_entreprise: false, employe: false, comptable: false },
  gestion_primes:          { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false, employe: false, comptable: false },
  cloture_mensuelle:       { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false, employe: false, comptable: false },
  // Déclarations & Compta
  soumettre_dimona:        { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false, employe: false, comptable: false },
  declarations_onss:       { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false, employe: false, comptable: false },
  exporter_comptabilite:   { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false, employe: false, comptable: true  },
  sepa_virements:          { admin: true,  secretariat: true,  commercial: false, rh_entreprise: false, employe: false, comptable: true  },
  // RH & Employés
  voir_travailleurs:       { admin: true,  secretariat: true,  commercial: false, rh_entreprise: true,  employe: false, comptable: false },
  modifier_travailleurs:   { admin: true,  secretariat: true,  commercial: false, rh_entreprise: true,  employe: false, comptable: false },
  onboarding:              { admin: true,  secretariat: true,  commercial: false, rh_entreprise: true,  employe: false, comptable: false },
  gerer_contrats:          { admin: true,  secretariat: true,  commercial: false, rh_entreprise: true,  employe: false, comptable: false },
  gestion_absences:        { admin: true,  secretariat: true,  commercial: false, rh_entreprise: true,  employe: true,  comptable: false },
  portail_employe:         { admin: true,  secretariat: false, commercial: false, rh_entreprise: true,  employe: true,  comptable: false },
  procedures_rh:           { admin: true,  secretariat: true,  commercial: false, rh_entreprise: true,  employe: false, comptable: false },
  // Commercial
  voir_prospects:          { admin: true,  secretariat: false, commercial: true,  rh_entreprise: false, employe: false, comptable: false },
  diagnostic_commercial:   { admin: true,  secretariat: false, commercial: true,  rh_entreprise: false, employe: false, comptable: false },
  guide_commercial:        { admin: true,  secretariat: false, commercial: true,  rh_entreprise: false, employe: false, comptable: false },
  checklist_client:        { admin: true,  secretariat: false, commercial: true,  rh_entreprise: false, employe: false, comptable: false },
  gerer_facturation:       { admin: true,  secretariat: false, commercial: true,  rh_entreprise: false, employe: false, comptable: false },
  // Admin & Sécurité
  acces_audit_trail:       { admin: true,  secretariat: false, commercial: false, rh_entreprise: false, employe: false, comptable: false },
  gerer_utilisateurs:      { admin: true,  secretariat: false, commercial: false, rh_entreprise: false, employe: false, comptable: false },
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
    'facturation', 'rapports', 'subscriptions', 'facturationfiches',
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

  // ── EMPLOYÉ — accès à ses propres données uniquement ──────────
  employe: new Set([
    'dashboard',
    'portail',        // Portail employé = page principale
    'conges',         // Demander ses congés
    'gestionabs',     // Voir ses absences
    'fichespaiepdf',  // Télécharger ses fiches de paie
    'compteIndividuel', // Son récap annuel
    'echeancier',     // Calendrier social (info)
  ]),

  // ── COMPTABLE EXTERNE — exports uniquement ────────────────────
  comptable: new Set([
    'dashboard',
    'exportcompta',      // Exports WinBooks, BOB, Exact
    'connecteurscompta', // Connecteurs comptables
    'sepa',              // Fichiers SEPA virements
    'belcotax281',       // Fiches fiscales 281.xx
    'listingtva',        // Listing TVA Intervat
    'rapports',          // Rapports
    'echeancier',        // Deadlines fiscales
    'facturation',       // Factures clients
  ]),
};

// KPIs visibles par rôle
export const KPI_SCOPE = {
  admin:         ['all'],
  secretariat:   ['masse_salariale', 'cotisations', 'pp', 'fiches_paie', 'sepa', 'travailleurs', 'dimona', 'contrats'],
  commercial:    ['clients', 'facturation', 'revenue', 'prospects'],
  rh_entreprise: ['travailleurs', 'contrats', 'absences', 'dimona', 'fiches_paie'],
  employe:       ['mes_fiches_paie', 'mes_conges', 'mon_contrat'],
  comptable:     ['exports_comptables', 'sepa', 'facturation', 'echeances_fiscales'],
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
  const role = (meta.role || '').toLowerCase();
  if (ROLES.includes(role)) return role;
  const email = (user.email || '').toLowerCase();
  if (email.includes('admin') || email.includes('nourdin') || email.includes('aureus-ia')) return 'admin';
  if (email.includes('secretariat') || email.includes('paie')) return 'secretariat';
  if (email.includes('commercial') || email.includes('sales') || email.includes('prospect')) return 'commercial';
  if (email.includes('comptable') || email.includes('fiduciaire') || email.includes('expert-compt')) return 'comptable';
  // Si l'utilisateur a un profil employé (email matchant un employé)
  if (meta.employe_id || meta.is_employe) return 'employe';
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
