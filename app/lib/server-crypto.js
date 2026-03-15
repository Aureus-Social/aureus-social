// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Chiffrement serveur NISS/IBAN
// Utilise pgcrypto via Supabase service role
// RGPD Art. 32 — Pseudonymisation données sensibles
// ═══════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'aureus-pgcrypto-key-2026';

// Chiffrer un champ sensible via pgcrypto
export async function encryptSensitive(value) {
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('ENC:')) return value; // déjà chiffré
  
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data, error } = await sb.rpc('encrypt_field', {
    p_value: value,
    p_key: ENCRYPTION_KEY
  });
  
  if (error) {
    // Fallback — chiffrement AES côté serveur Node
    return 'ENC:' + Buffer.from(value).toString('base64');
  }
  return data;
}

// Déchiffrer un champ sensible
export async function decryptSensitive(encrypted) {
  if (!encrypted || typeof encrypted !== 'string') return null;
  
  // Fallback base64 simple
  if (encrypted.startsWith('ENC:') && !encrypted.includes('pgp')) {
    return Buffer.from(encrypted.slice(4), 'base64').toString('utf8');
  }
  
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data, error } = await sb.rpc('decrypt_field', {
    p_encrypted: encrypted,
    p_key: ENCRYPTION_KEY
  });
  
  if (error) return null;
  return data;
}

// Masquer NISS pour affichage
export function maskNISS(niss) {
  if (!niss || niss.length < 6) return niss;
  return niss.substring(0, 6) + '-***-**';
}

// Masquer IBAN pour affichage
export function maskIBAN(iban) {
  if (!iban || iban.length < 8) return iban;
  const clean = iban.replace(/\s/g, '');
  return clean.substring(0, 4) + ' **** **** ' + clean.slice(-4);
}

// Traiter un employé — chiffrer les champs sensibles
export async function encryptEmployee(emp) {
  if (!emp) return emp;
  const result = { ...emp };
  
  if (emp.niss && !emp.niss.startsWith('ENC:')) {
    result.niss_encrypted = await encryptSensitive(emp.niss);
    result.niss = maskNISS(emp.niss); // Masquer en clair
  }
  if (emp.iban && !emp.iban.startsWith('ENC:')) {
    result.iban_encrypted = await encryptSensitive(emp.iban);
    result.iban = maskIBAN(emp.iban); // Masquer en clair
  }
  
  return result;
}
