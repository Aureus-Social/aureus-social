// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Chiffrement AES-256-GCM
// RGPD Art.32 — Données sensibles : NISS, IBAN, salaires
// ═══════════════════════════════════════════════════════════════
'use client';

const ALG = 'AES-GCM';
const KEY_LEN = 256;
const IV_LEN = 12; // 96 bits recommandé pour GCM
const SALT_LEN = 16;

// Dériver une clé AES depuis le secret env
async function deriveKey(secret) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  const salt = enc.encode('AureusSocialPro2026'); // sel fixe pour cohérence
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: ALG, length: KEY_LEN },
    false,
    ['encrypt', 'decrypt']
  );
}

function getSecret() {
  // Côté client : utilise le salt public, côté serveur : clé complète
  return (typeof process !== 'undefined' && process.env?.ENCRYPTION_KEY)
    || (typeof window !== 'undefined' && window.__AUREUS_EK__)
    || 'AureusSocialPro2026moussatinourdin';
}

// ── Chiffrer une valeur ──────────────────────────────────────
export async function encrypt(plaintext) {
  if (!plaintext) return '';
  try {
    const key = await deriveKey(getSecret());
    const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
      { name: ALG, iv },
      key,
      enc.encode(String(plaintext))
    );
    // Format : iv(base64):ciphertext(base64)
    const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
    return `enc:${b64(iv)}:${b64(ciphertext)}`;
  } catch (e) {
    console.error('[AUREUS] encrypt error:', e);
    return plaintext; // fallback : retourne en clair plutôt que perdre la donnée
  }
}

// ── Déchiffrer une valeur ────────────────────────────────────
export async function decrypt(ciphertext) {
  if (!ciphertext || !String(ciphertext).startsWith('enc:')) return ciphertext;
  try {
    const key = await deriveKey(getSecret());
    const [, ivB64, ctB64] = String(ciphertext).split(':');
    const b64ToArr = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
    const iv = b64ToArr(ivB64);
    const ct = b64ToArr(ctB64);
    const plain = await crypto.subtle.decrypt({ name: ALG, iv }, key, ct);
    return new TextDecoder().decode(plain);
  } catch (e) {
    console.error('[AUREUS] decrypt error:', e);
    return ciphertext; // fallback
  }
}

// ── Masquage RGPD (affichage uniquement) ───────────────────
export const mask = {
  // BE76 **** **** 3456
  iban: (v) => {
    if (!v) return '—';
    const s = String(v).replace(/\s/g, '');
    if (s.length < 6) return s;
    return s.slice(0, 4) + ' **** **** ' + s.slice(-4);
  },
  // 85.07.15-xxx.xx
  niss: (v) => {
    if (!v) return '—';
    const s = String(v).replace(/[.\-\s]/g, '');
    if (s.length < 9) return '**.**.**-***.**';
    return s.slice(0, 6) + '-***.**';
  },
  // 2.8** €
  salary: (v) => {
    if (!v) return '—';
    const n = parseFloat(v);
    if (isNaN(n)) return '—';
    const str = Math.round(n).toString();
    return str.slice(0, 2) + '**' + (str.length > 3 ? '' : '') + ' €';
  },
  // j**n.d*e@example.com
  email: (v) => {
    if (!v || !v.includes('@')) return '—';
    const [local, domain] = v.split('@');
    return local[0] + '**' + (local[local.length-1]||'') + '@' + domain;
  },
};

// ── Vérifier si une valeur est chiffrée ──────────────────────
export const isEncrypted = (v) => typeof v === 'string' && v.startsWith('enc:');

// ── Chiffrement synchrone rapide (pour données non-critiques) ─
// XOR simple avec clé dérivée — NE PAS utiliser pour NISS/IBAN
export function obfuscate(str) {
  if (!str) return '';
  const key = 'AureusSocialPro2026';
  return btoa([...String(str)].map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join(''));
}
export function deobfuscate(str) {
  if (!str) return '';
  try {
    const key = 'AureusSocialPro2026';
    return [...atob(str)].map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('');
  } catch { return str; }
}
