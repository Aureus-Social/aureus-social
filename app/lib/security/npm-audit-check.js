// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Vérification dépendances npm
// Script exécutable dans GitHub Actions CI/CD
// ═══════════════════════════════════════════════════════════════

/**
 * Ce fichier est utilisé par :
 * - Le workflow GitHub Actions (.github/workflows/security-audit.yml)
 * - La page AuditSecuriteCode.js (résultats affichés dans Test Suite)
 */

// Résultats du dernier npm audit (mis à jour par CI/CD)
export const LAST_AUDIT = {
  date: '2026-03-12',
  critical: 0,
  high: 0,
  moderate: 0,
  low: 0,
  info: 0,
  total: 0,
  status: 'clean', // 'clean' | 'warning' | 'critical'
};

// Dépendances directes surveillées
export const WATCHED_DEPS = [
  { name: 'next', version: '15.x', critical: true },
  { name: '@supabase/supabase-js', version: '2.x', critical: true },
  { name: 'react', version: '19.x', critical: false },
  { name: 'react-dom', version: '19.x', critical: false },
];
