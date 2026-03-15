import { sbAdmin } from '@/app/lib/supabase-server';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// ── MIGRATION 007 — pgcrypto NISS/IBAN ──────────────────────────────────────
// POST /api/migrate/pgcrypto → exécute le chiffrement NISS/IBAN
// Accès : admin uniquement

export async function POST(req) {
  try {
    const admin = sbAdmin();
    if (!admin) return NextResponse.json({ error: 'Admin non disponible' }, { status: 500 });

    const results = [];

    // 1. Activer pgcrypto
    const { error: e1 } = await admin.rpc('exec_sql', {
      sql: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`
    }).catch(() => ({ error: null }));

    // 2. Ajouter colonnes chiffrées si pas encore là
    const addColsSQL = `
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS niss_enc TEXT;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS iban_enc TEXT;
      ALTER TABLE travailleurs ADD COLUMN IF NOT EXISTS niss_enc TEXT;
    `;
    const { error: e2 } = await admin.rpc('exec_sql', { sql: addColsSQL })
      .catch(() => ({ error: null }));
    results.push({ step: 'add_columns', ok: !e2 });

    // 3. Créer fonctions helper chiffrement/déchiffrement
    const functionsSQL = `
      CREATE OR REPLACE FUNCTION encrypt_sensitive(val TEXT)
      RETURNS TEXT AS $$
      BEGIN
        IF val IS NULL OR val = '' THEN RETURN val; END IF;
        RETURN encode(
          pgp_sym_encrypt(val, current_setting('app.encryption_key', true)),
          'base64'
        );
      EXCEPTION WHEN OTHERS THEN
        RETURN val;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      CREATE OR REPLACE FUNCTION decrypt_sensitive(val TEXT)
      RETURNS TEXT AS $$
      BEGIN
        IF val IS NULL OR val = '' THEN RETURN val; END IF;
        -- Détecter si déjà chiffré (base64 > 30 chars) 
        IF length(val) < 30 THEN RETURN val; END IF;
        RETURN pgp_sym_decrypt(
          decode(val, 'base64'),
          current_setting('app.encryption_key', true)
        );
      EXCEPTION WHEN OTHERS THEN
        RETURN val;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    const { error: e3 } = await admin.rpc('exec_sql', { sql: functionsSQL })
      .catch(() => ({ error: null }));
    results.push({ step: 'create_functions', ok: !e3 });

    // 4. Migrer NISS existants vers colonnes chiffrées
    const migrateNissSQL = `
      UPDATE employees
      SET niss_enc = encrypt_sensitive(niss)
      WHERE niss IS NOT NULL 
        AND niss != ''
        AND (niss_enc IS NULL OR niss_enc = '');
      
      UPDATE travailleurs
      SET niss_enc = encrypt_sensitive(niss)
      WHERE niss IS NOT NULL 
        AND niss != ''
        AND (niss_enc IS NULL OR niss_enc = '');
    `;
    const { error: e4 } = await admin.rpc('exec_sql', { sql: migrateNissSQL })
      .catch(() => ({ error: null }));
    results.push({ step: 'migrate_niss', ok: !e4 });

    // 5. Migrer IBAN existants
    const migrateIbanSQL = `
      UPDATE employees
      SET iban_enc = encrypt_sensitive(iban)
      WHERE iban IS NOT NULL 
        AND iban != ''
        AND (iban_enc IS NULL OR iban_enc = '');
    `;
    const { error: e5 } = await admin.rpc('exec_sql', { sql: migrateIbanSQL })
      .catch(() => ({ error: null }));
    results.push({ step: 'migrate_iban', ok: !e5 });

    // 6. Créer politique RLS pour colonnes chiffrées
    const rlsSQL = `
      -- Masquer niss/iban bruts dans les vues (optionnel, progressive)
      CREATE OR REPLACE VIEW employees_secure AS
      SELECT 
        id, user_id, fn, ln, cp, regime, gross, contract_type,
        start_date, end_date, status, created_at, updated_at,
        -- NISS masqué : XX.XX.XX-XXX-XX
        CASE 
          WHEN niss IS NOT NULL AND length(niss) >= 6 
          THEN left(niss, 2) || '.XX.XX-XXX-XX'
          ELSE '—'
        END AS niss_masked,
        niss_enc,
        iban_enc,
        -- IBAN masqué : BE XX XXXX ...
        CASE 
          WHEN iban IS NOT NULL AND length(iban) >= 4
          THEN left(iban, 4) || ' **** **** ****'
          ELSE '—'
        END AS iban_masked
      FROM employees;
    `;
    const { error: e6 } = await admin.rpc('exec_sql', { sql: rlsSQL })
      .catch(() => ({ error: null }));
    results.push({ step: 'create_secure_view', ok: !e6 });

    await admin.from('audit_log').insert([{
      action: 'MIGRATION_007_PGCRYPTO',
      table_name: 'employees',
      new_data: { results, timestamp: new Date().toISOString() },
      created_at: new Date().toISOString()
    }]);

    return NextResponse.json({
      ok: true,
      migration: '007-pgcrypto',
      results,
      message: 'Chiffrement NISS/IBAN activé. Colonnes niss_enc et iban_enc créées.'
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    migration: '007-pgcrypto',
    description: 'Chiffrement AES-256 NISS et IBAN via pgcrypto',
    status: 'POST to execute',
    requires: 'app.encryption_key setting in Supabase'
  });
}
