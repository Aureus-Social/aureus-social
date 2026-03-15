// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Client Supabase Server-Side avec JWT User
// Permet que RLS s'applique côté API (2ème couche sécurité)
// ═══════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Client avec JWT utilisateur — RLS actif
 * Utiliser pour toutes les opérations sur données clientes
 */
export function sbUser(token) {
  if (!URL || !ANON) return null;
  return createClient(URL, ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Client service role — bypass RLS
 * Utiliser UNIQUEMENT pour les crons, backups, opérations admin
 */
export function sbAdmin() {
  if (!URL || !SERVICE) return null;
  return createClient(URL, SERVICE);
}

/**
 * Extraire le JWT depuis la requête + créer client isolé
 * Usage : const { db, user } = await sbFromRequest(req)
 */
export async function sbFromRequest(req) {
  const authHeader = req?.headers?.get?.('authorization');
  if (!authHeader?.startsWith('Bearer ')) return { db: null, user: null };
  const token = authHeader.slice(7);

  // Vérifier le token avec le client anon
  const anonClient = createClient(URL, ANON, { auth: { persistSession: false } });
  const { data: { user }, error } = await anonClient.auth.getUser(token);
  if (error || !user) return { db: null, user: null };

  // Créer le client avec JWT — RLS actif
  const db = sbUser(token);
  return { db, user };
}

// ── Vérification rôle API ─────────────────────────────────────
// Détermine le rôle depuis les métadonnées Supabase
function getRoleFromUserServer(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  const role = (meta.role || '').toLowerCase();
  const VALID = ['admin', 'secretariat', 'commercial', 'rh_entreprise', 'employe', 'comptable'];
  if (VALID.includes(role)) return role;
  const email = (user.email || '').toLowerCase();
  if (email.includes('nourdin') || email.includes('aureus-ia') || email.includes('admin')) return 'admin';
  if (email.includes('secretariat') || email.includes('paie')) return 'secretariat';
  if (email.includes('commercial') || email.includes('sales')) return 'commercial';
  if (email.includes('comptable') || email.includes('fiduciaire')) return 'comptable';
  if (meta.employe_id || meta.is_employe) return 'employe';
  return 'rh_entreprise';
}

// Permissions par rôle pour les API routes
const API_ROLE_PERMISSIONS = {
  // Données employés/paie — bloqué pour comptable et employé
  employees_read:    ['admin', 'secretariat', 'rh_entreprise'],
  employees_write:   ['admin', 'secretariat', 'rh_entreprise'],
  payroll_read:      ['admin', 'secretariat', 'rh_entreprise'],
  payroll_write:     ['admin', 'secretariat'],
  payroll_self:      ['admin', 'secretariat', 'rh_entreprise', 'employe'], // employé voit les siennes
  // Déclarations — secrétariat uniquement
  declarations:      ['admin', 'secretariat'],
  dimona:            ['admin', 'secretariat'],
  // Exports comptables — secrétariat + comptable
  export_compta:     ['admin', 'secretariat', 'comptable'],
  sepa:              ['admin', 'secretariat', 'comptable'],
  belcotax:          ['admin', 'secretariat', 'comptable'],
  // Facturation — admin + commercial + comptable
  facturation:       ['admin', 'commercial', 'comptable'],
  // Admin — admin uniquement
  admin_only:        ['admin'],
  // Congés — tous sauf comptable
  conges:            ['admin', 'secretariat', 'rh_entreprise', 'employe'],
};

/**
 * Vérifier rôle API — retourne { ok, role, error }
 * Usage : const { ok, role } = checkRole(user, 'employees_read');
 *         if (!ok) return Response.json({ error }, { status: 403 });
 */
export function checkRole(user, permission) {
  const role = getRoleFromUserServer(user);
  if (!role) return { ok: false, role: null, error: 'Non authentifié' };
  const allowed = API_ROLE_PERMISSIONS[permission];
  if (!allowed) return { ok: true, role }; // permission inconnue = pas de restriction
  if (!allowed.includes(role)) {
    return { ok: false, role, error: `Accès refusé — rôle ${role} insuffisant` };
  }
  return { ok: true, role };
}

/**
 * Vérifier rôle depuis requête HTTP complète
 * Usage : const { ok, role, user, db } = await checkRoleFromRequest(req, 'employees_read');
 */
export async function checkRoleFromRequest(req, permission) {
  const { db, user } = await sbFromRequest(req);
  if (!user || !db) return { ok: false, role: null, user: null, db: null, error: 'Non authentifié' };
  const { ok, role, error } = checkRole(user, permission);
  return { ok, role, user, db, error };
}
