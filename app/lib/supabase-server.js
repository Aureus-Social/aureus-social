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
