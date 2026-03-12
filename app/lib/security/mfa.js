// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — 2FA / MFA via Supabase
// Supabase MFA TOTP (compatible Google Authenticator, Authy)
// ═══════════════════════════════════════════════════════════════
'use client';

/**
 * Enrôler le MFA TOTP pour l'utilisateur connecté
 * Retourne { qrCode, secret, factorId } pour affichage du QR
 */
export async function enrollMFA(supabase) {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'Aureus Social Pro',
  });
  if (error) throw new Error(error.message);
  return {
    qrCode: data.totp.qr_code,     // data URL du QR code SVG
    secret: data.totp.secret,       // Clé secrète pour saisie manuelle
    factorId: data.id,              // ID du facteur MFA
    uri: data.totp.uri,             // otpauth://totp/...
  };
}

/**
 * Vérifier le code TOTP et activer le MFA
 * @param {string} factorId - ID retourné par enrollMFA
 * @param {string} code - Code 6 chiffres de l'app TOTP
 */
export async function verifyAndActivateMFA(supabase, factorId, code) {
  // Créer un challenge
  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) throw new Error(challengeError.message);

  // Vérifier le code
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code: code.replace(/\s/g, ''),
  });
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Vérifier un challenge MFA lors de la connexion
 * Appelé après supabase.auth.signInWithPassword si AAL1 → besoin AAL2
 */
export async function challengeMFA(supabase, code) {
  // Récupérer les facteurs MFA de l'utilisateur
  const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
  if (factorsError) throw new Error(factorsError.message);

  const totpFactor = factors?.totp?.[0];
  if (!totpFactor) throw new Error('Aucun facteur TOTP configuré');

  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId: totpFactor.id,
  });
  if (challengeError) throw new Error(challengeError.message);

  const { data, error } = await supabase.auth.mfa.verify({
    factorId: totpFactor.id,
    challengeId: challengeData.id,
    code: code.replace(/\s/g, ''),
  });
  if (error) throw new Error('Code MFA invalide');
  return data;
}

/**
 * Vérifier le niveau d'assurance (AAL) de la session
 * Retourne 'aal1' (sans MFA) ou 'aal2' (MFA validé)
 */
export async function getAAL(supabase) {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return data;
}

/**
 * Lister les facteurs MFA configurés
 */
export async function listMFAFactors(supabase) {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) return [];
  return data?.totp || [];
}

/**
 * Supprimer un facteur MFA (désactiver le 2FA)
 */
export async function unenrollMFA(supabase, factorId) {
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw new Error(error.message);
  return true;
}

/**
 * Hook React pour vérifier si MFA est requis après login
 * Utiliser dans layout-client.js
 */
export function checkMFARequired(session) {
  if (!session) return false;
  const aal = session?.user?.factors?.length > 0;
  const current = session?.currentLevel;
  return aal && current === 'aal1'; // MFA configuré mais pas encore validé
}
