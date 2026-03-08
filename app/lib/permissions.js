// ═══ AUREUS SOCIAL PRO — Matrice Permissions par Rôle (Chapitre 5) ═══
// Implémentée côté serveur (API routes) ET côté client (composant RolesPermissions)

export const ROLES = ['admin', 'comptable', 'rh', 'commercial', 'readonly'];

// Matrice complète des permissions
export const PERMISSIONS = {
  voir_fiches_paie:        { admin: true,  comptable: true,  rh: true,  commercial: true,  readonly: true  },
  calculer_paie:           { admin: true,  comptable: true,  rh: true,  commercial: false, readonly: false },
  exporter_comptabilite:   { admin: true,  comptable: true,  rh: false, commercial: false, readonly: false },
  soumettre_dimona:        { admin: true,  comptable: false, rh: true,  commercial: false, readonly: false },
  modifier_travailleurs:   { admin: true,  comptable: false, rh: true,  commercial: false, readonly: false },
  voir_travailleurs:       { admin: true,  comptable: true,  rh: true,  commercial: true,  readonly: true  },
  gerer_contrats:          { admin: true,  comptable: false, rh: true,  commercial: false, readonly: false },
  voir_clients_entreprises:{ admin: true,  comptable: true,  rh: true,  commercial: true,  readonly: true  },
  gerer_facturation:       { admin: true,  comptable: true,  rh: false, commercial: true,  readonly: false },
  acces_audit_trail:       { admin: true,  comptable: true,  rh: true,  commercial: false, readonly: false },
  gerer_utilisateurs:      { admin: true,  comptable: false, rh: false, commercial: false, readonly: false },
  configuration_app:       { admin: true,  comptable: false, rh: false, commercial: false, readonly: false },
  exporter_donnees:        { admin: true,  comptable: true,  rh: true,  commercial: false, readonly: false },
  voir_dashboard_kpis:     { admin: true,  comptable: true,  rh: true,  commercial: true,  readonly: true  },
};

// KPIs visibles par rôle (accès limité au périmètre)
export const KPI_SCOPE = {
  admin:      ['all'],
  comptable:  ['masse_salariale', 'cotisations', 'pp', 'fiches_paie', 'sepa'],
  rh:         ['travailleurs', 'contrats', 'absences', 'dimona'],
  commercial: ['clients', 'facturation', 'revenue'],
  readonly:   ['travailleurs', 'fiches_paie'],
};

/**
 * Vérifier si un rôle a une permission
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const perm = PERMISSIONS[permission];
  if (!perm) return false;
  return perm[role] === true;
}

/**
 * Détecter le rôle depuis l'objet user Supabase
 */
export function getRoleFromUser(user) {
  if (!user) return 'readonly';
  const meta = user.user_metadata || {};
  const role = (meta.role || meta.rôle || '').toLowerCase();
  if (ROLES.includes(role)) return role;
  const email = (user.email || '').toLowerCase();
  if (email.includes('admin') || email.includes('nourdin') || email.includes('aureus-ia')) return 'admin';
  if (email.includes('comptable') || email.includes('fiduciaire')) return 'comptable';
  if (email.includes('rh') || email.includes('hr')) return 'rh';
  if (email.includes('commercial') || email.includes('sales')) return 'commercial';
  return 'readonly';
}

/**
 * Middleware API — vérifier permission dans une route serveur
 * Usage: const { allowed, role } = checkApiPermission(request, 'modifier_travailleurs');
 */
export function checkApiPermission(userEmail, userRole, permission) {
  const role = userRole || 'readonly';
  const allowed = hasPermission(role, permission);
  return { allowed, role };
}

/**
 * Hook client — liste des permissions pour un rôle
 */
export function getPermissionsForRole(role) {
  return Object.entries(PERMISSIONS)
    .filter(([, perms]) => perms[role] === true)
    .map(([perm]) => perm);
}
