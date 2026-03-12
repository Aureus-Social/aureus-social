/**
 * AUREUS SOCIAL PRO — Secure Storage
 * Remplace tous les usages localStorage bruts (52 identifiés)
 * Chiffrement AES-GCM 256-bit via Web Crypto API (natif navigateur)
 * 
 * USAGE:
 *   import { sGet, sSet, sRemove, sClear } from '@/lib/security/secureStorage'
 *   
 *   sSet('user_prefs', { lang: 'fr', theme: 'dark' })
 *   const prefs = sGet('user_prefs')
 *   sRemove('user_prefs')
 */

// ─── Clé dérivée de l'env var (NEXT_PUBLIC_STORAGE_KEY) ou fallback device-fingerprint
const getKey = async () => {
  const raw = process.env.NEXT_PUBLIC_STORAGE_KEY || navigator.userAgent + location.hostname;
  const enc = new TextEncoder().encode(raw);
  const hash = await crypto.subtle.digest('SHA-256', enc);
  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
};

// ─── Chiffrement
const encrypt = async (data) => {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  // Stocker iv + ciphertext ensemble en base64
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
};

// ─── Déchiffrement
const decrypt = async (b64) => {
  try {
    const key = await getKey();
    const combined = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch {
    return null; // Données corrompues ou clé changée
  }
};

// ─── API publique (même interface que localStorage)

/**
 * Stocker une valeur chiffrée
 * @param {string} key - Clé de stockage
 * @param {any} value - Valeur (sera JSON.stringify)
 */
export const sSet = async (key, value) => {
  try {
    const encrypted = await encrypt(value);
    localStorage.setItem(`as_${key}`, encrypted);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('[SecureStorage] sSet error:', key, err);
  }
};

/**
 * Lire une valeur déchiffrée
 * @param {string} key - Clé de stockage
 * @param {any} fallback - Valeur par défaut si absent/erreur
 */
export const sGet = async (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(`as_${key}`);
    if (!raw) return fallback;
    const decrypted = await decrypt(raw);
    return decrypted ?? fallback;
  } catch {
    return fallback;
  }
};

/**
 * Supprimer une clé
 */
export const sRemove = (key) => {
  localStorage.removeItem(`as_${key}`);
};

/**
 * Vider tout le storage Aureus Social (préfixe as_)
 */
export const sClear = () => {
  const toRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith('as_')) toRemove.push(k);
  }
  toRemove.forEach(k => localStorage.removeItem(k));
};

/**
 * Migration : chiffrer les valeurs existantes en clair
 * À appeler UNE FOIS au démarrage de l'app
 */
export const migrateUnencrypted = async (knownKeys) => {
  for (const key of knownKeys) {
    const raw = localStorage.getItem(key);
    if (raw && !localStorage.getItem(`as_${key}`)) {
      try {
        const parsed = JSON.parse(raw);
        await sSet(key, parsed);
        localStorage.removeItem(key); // Supprimer l'ancienne version
        if (process.env.NODE_ENV !== 'production') console.info('[SecureStorage] Migrated:', key);
      } catch {
        // Valeur déjà string simple
        await sSet(key, raw);
        localStorage.removeItem(key);
      }
    }
  }
};

// ─── Liste des 52 clés identifiées dans Aureus Social Pro
// À passer à migrateUnencrypted() au démarrage
export const AUREUS_STORAGE_KEYS = [
  'aureus_user', 'aureus_company', 'aureus_employees', 'aureus_payslips',
  'aureus_lang', 'aureus_theme', 'aureus_sidebar', 'aureus_session',
  'aureus_notifications', 'aureus_filters', 'aureus_lastpage', 'aureus_drafts',
  'aureus_primes', 'aureus_absences', 'aureus_contrats', 'aureus_clients',
  'aureus_mandats', 'aureus_documents', 'aureus_exports', 'aureus_imports',
  'aureus_declarations', 'aureus_dimona', 'aureus_onss', 'aureus_fiscal',
  'aureus_relances', 'aureus_sepa', 'aureus_budget', 'aureus_analytics',
  'aureus_calendar', 'aureus_automations', 'aureus_queue', 'aureus_logs',
  'aureus_audit', 'aureus_rgpd', 'aureus_security', 'aureus_backup',
  'aureus_integrations', 'aureus_api_keys', 'aureus_webhooks', 'aureus_modules',
  'aureus_roles', 'aureus_team', 'aureus_fiduciaire', 'aureus_admin',
  'aureus_saas', 'aureus_billing', 'aureus_onboarding', 'aureus_setup',
  'aureus_demo', 'aureus_cache', 'aureus_pref_columns', 'aureus_pref_view',
];
