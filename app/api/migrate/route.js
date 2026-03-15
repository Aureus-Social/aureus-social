import { checkRole } from '@/app/lib/supabase-server';
// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Auto-Migration Supabase
// Exécute toutes les migrations SQL automatiquement
// Sécurisé par CRON_SECRET — jamais accessible publiquement
// ═══════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

// Route admin-only — auth vérifiée dans chaque handler

const CRON_SECRET = process.env.CRON_SECRET;

// ─── TOUTES LES MIGRATIONS ───────────────────────────────────
// Ordre strict — ne jamais modifier l'ordre existant
const MIGRATIONS = [

  // Migration 001 — pgcrypto + colonnes chiffrées
  {
    id: '20260315_pgcrypto',
    name: 'pgcrypto NISS/IBAN chiffrement',
    sql: `
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS niss_encrypted TEXT;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS iban_encrypted TEXT;
      ALTER TABLE travailleurs ADD COLUMN IF NOT EXISTS niss_encrypted TEXT;
      ALTER TABLE travailleurs ADD COLUMN IF NOT EXISTS iban_encrypted TEXT;
      ALTER TABLE fiches_paie ADD COLUMN IF NOT EXISTS employe_niss_encrypted TEXT;

      CREATE OR REPLACE FUNCTION mask_niss(niss TEXT)
      RETURNS TEXT AS $$
      BEGIN
        IF niss IS NULL OR length(niss) < 6 THEN RETURN niss; END IF;
        RETURN substring(niss, 1, 6) || '-***-**';
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE OR REPLACE FUNCTION mask_iban(iban TEXT)
      RETURNS TEXT AS $$
      BEGIN
        IF iban IS NULL OR length(iban) < 8 THEN RETURN iban; END IF;
        RETURN substring(iban, 1, 4) || ' **** **** ' || substring(iban, length(iban)-3, 4);
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;

      CREATE INDEX IF NOT EXISTS idx_employees_niss_enc ON employees(niss_encrypted);
      CREATE INDEX IF NOT EXISTS idx_travailleurs_niss_enc ON travailleurs(niss_encrypted);
    `
  },

  // Migration 002 — payroll_history ajout colonnes
  {
    id: '20260315_payroll_cols',
    name: 'Colonnes payroll history',
    sql: `
      ALTER TABLE fiches_paie ADD COLUMN IF NOT EXISTS employe_type TEXT DEFAULT 'employe';
      ALTER TABLE fiches_paie ADD COLUMN IF NOT EXISTS employe_nom TEXT;
      ALTER TABLE fiches_paie ADD COLUMN IF NOT EXISTS employe_prenom TEXT;
      ALTER TABLE fiches_paie ADD COLUMN IF NOT EXISTS employe_niss TEXT;
      ALTER TABLE fiches_paie ADD COLUMN IF NOT EXISTS onva DECIMAL(10,2) DEFAULT 0;
      ALTER TABLE fiches_paie ADD COLUMN IF NOT EXISTS cotis_dirigeant DECIMAL(10,2) DEFAULT 0;
      ALTER TABLE fiches_paie ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'calcule';
      ALTER TABLE fiches_paie ADD COLUMN IF NOT EXISTS notes TEXT;
      CREATE INDEX IF NOT EXISTS idx_fiches_paie_type ON fiches_paie(employe_type);
      CREATE INDEX IF NOT EXISTS idx_fiches_paie_annee_mois ON fiches_paie(annee, mois);
    `
  },

  // Migration 003 — clients societes colonnes
  {
    id: '20260315_clients_cols',
    name: 'Colonnes clients sociétés',
    sql: `
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS nom TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS bce TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS adresse TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS code_postal TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS ville TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS cp_paritaire TEXT DEFAULT '200';
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_nom TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_email TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_tel TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS onss_numero TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS secteur TEXT;
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS logiciel_compta TEXT DEFAULT 'winbooks';
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS format_export TEXT DEFAULT 'winbooks';
    `
  },

  // Migration 004 — table migrations tracker
  {
    id: '20260315_migrations_table',
    name: 'Table migrations tracker',
    sql: `
      CREATE TABLE IF NOT EXISTS _migrations (
        id TEXT PRIMARY KEY,
        name TEXT,
        executed_at TIMESTAMPTZ DEFAULT NOW(),
        success BOOLEAN DEFAULT TRUE,
        error_message TEXT
      );
    `
  },

];

async function runMigrations(sb) {
  const results = [];

  // Créer la table migrations si elle n'existe pas
  await sb.rpc('exec_sql', {
    sql: `CREATE TABLE IF NOT EXISTS _migrations (
      id TEXT PRIMARY KEY,
      name TEXT,
      executed_at TIMESTAMPTZ DEFAULT NOW(),
      success BOOLEAN DEFAULT TRUE,
      error_message TEXT
    );`
  }).catch(() => {});

  // Vérifier quelles migrations ont déjà été exécutées
  const { data: done } = await sb.from('_migrations').select('id').eq('success', true);
  const doneIds = new Set((done || []).map(r => r.id));

  for (const migration of MIGRATIONS) {
    if (doneIds.has(migration.id)) {
      results.push({ id: migration.id, name: migration.name, status: 'skipped' });
      continue;
    }

    try {
      // Exécuter chaque statement séparément
      const statements = migration.sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 10);

      for (const stmt of statements) {
        const { error } = await sb.rpc('exec_sql', { sql: stmt + ';' });
        if (error && !error.message.includes('already exists') && !error.message.includes('duplicate')) {
          throw new Error(error.message);
        }
      }

      // Enregistrer la migration comme exécutée
      await sb.from('_migrations').upsert([{
        id: migration.id,
        name: migration.name,
        success: true,
        executed_at: new Date().toISOString()
      }]);

      results.push({ id: migration.id, name: migration.name, status: 'success' });
    } catch (err) {
      // Enregistrer l'erreur
      await sb.from('_migrations').upsert([{
        id: migration.id,
        name: migration.name,
        success: false,
        error_message: err.message,
        executed_at: new Date().toISOString()
      }]).catch(() => {});

      results.push({ id: migration.id, name: migration.name, status: 'error', error: err.message });
    }
  }

  return results;
}

export async function GET(req) {
  // Vérification sécurité
  const auth = req.headers.get('authorization');
  const secret = auth?.replace('Bearer ', '');

  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const results = await runMigrations(sb);
  const success = results.filter(r => r.status === 'success').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const errors = results.filter(r => r.status === 'error').length;

  return Response.json({
    ok: errors === 0,
    summary: `${success} exécutées, ${skipped} déjà faites, ${errors} erreurs`,
    results,
    timestamp: new Date().toISOString()
  });
}

// POST — exécuter depuis l'app (admin seulement)
export async function POST(req) {
  const auth = req.headers.get('authorization');
  const secret = auth?.replace('Bearer ', '');

  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const results = await runMigrations(sb);
  return Response.json({ ok: true, results });
}
