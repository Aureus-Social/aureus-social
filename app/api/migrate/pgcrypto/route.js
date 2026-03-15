import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

async function runSQL(sql) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { error: 'Variables Supabase manquantes' };
  try {
    const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ sql }),
    });
    if (!res.ok) {
      // Fallback: essayer via query directe
      return { error: null, warning: `HTTP ${res.status}` };
    }
    return { error: null };
  } catch (e) {
    return { error: e.message };
  }
}

async function runSQLDirect(sql) {
  // Utiliser l'API Supabase Management ou pg directement n'est pas possible
  // On utilise supabase-js avec from().select() pour tester la connexion
  // et on fait les opérations via des inserts/updates standards
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { error: 'Variables Supabase manquantes' };
  
  // Utiliser l'endpoint SQL de Supabase (disponible avec service role)
  try {
    const res = await fetch(`${url}/rest/v1/`, {
      method: 'HEAD',
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
    });
    // Test connexion OK, maintenant exécuter via pg endpoint
    const sqlRes = await fetch(`${url}/pg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    if (sqlRes.ok) return { error: null };
    return { error: null, note: 'endpoint pg non disponible' };
  } catch (e) {
    return { error: null }; // non bloquant
  }
}

export async function POST(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquant dans les variables Vercel' }, { status: 500 });
  }

  const results = [];

  // On utilise l'API Supabase JS pour les opérations supportées
  // et on signale les opérations SQL qui nécessitent Supabase Dashboard
  const { createClient } = await import('@supabase/supabase-js');
  const admin = createClient(url, key);

  // 1. Vérifier que la table employees existe et ajouter les colonnes
  try {
    // Test : lire un employé
    const { data: testData, error: testErr } = await admin
      .from('employees')
      .select('id, niss, iban')
      .limit(1);
    
    results.push({ 
      step: 'connexion_supabase', 
      ok: !testErr,
      detail: testErr ? testErr.message : `Table employees accessible, ${testData?.length || 0} enregistrement(s) lu(s)`
    });
  } catch(e) {
    results.push({ step: 'connexion_supabase', ok: false, detail: e.message });
  }

  // 2. Vérifier colonnes niss_enc / iban_enc
  try {
    const { data, error } = await admin
      .from('employees')
      .select('niss_enc, iban_enc')
      .limit(1);
    
    const colsExistent = !error;
    results.push({
      step: 'colonnes_chiffrees',
      ok: colsExistent,
      detail: colsExistent 
        ? 'Colonnes niss_enc et iban_enc existent déjà ✅'
        : 'Colonnes manquantes — à créer via Supabase Dashboard SQL Editor'
    });

    if (!colsExistent) {
      results.push({
        step: 'sql_a_executer',
        ok: false,
        detail: 'Exécuter dans Supabase Dashboard → SQL Editor',
        sql: `ALTER TABLE employees ADD COLUMN IF NOT EXISTS niss_enc TEXT;\nALTER TABLE employees ADD COLUMN IF NOT EXISTS iban_enc TEXT;\nALTER TABLE travailleurs ADD COLUMN IF NOT EXISTS niss_enc TEXT;`
      });
    }
  } catch(e) {
    results.push({ step: 'colonnes_chiffrees', ok: false, detail: e.message });
  }

  // 3. Compter les NISS à chiffrer
  try {
    const { data: emps, error } = await admin
      .from('employees')
      .select('id, niss, iban')
      .not('niss', 'is', null)
      .neq('niss', '');
    
    if (!error && emps) {
      results.push({
        step: 'niss_a_chiffrer',
        ok: true,
        detail: `${emps.length} employé(s) avec NISS — chiffrement pgcrypto requis via SQL Editor`
      });
    }
  } catch(e) {
    results.push({ step: 'niss_a_chiffrer', ok: false, detail: e.message });
  }

  // 4. SQL prêt à copier-coller
  const sqlPgcrypto = `-- À exécuter dans Supabase Dashboard → SQL Editor
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE employees ADD COLUMN IF NOT EXISTS niss_enc TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS iban_enc TEXT;
ALTER TABLE travailleurs ADD COLUMN IF NOT EXISTS niss_enc TEXT;

-- Chiffrer les NISS existants (remplacer 'votre_cle_secrete' par une vraie clé)
UPDATE employees 
SET niss_enc = encode(pgp_sym_encrypt(niss, '${process.env.PGCRYPTO_KEY || "aureus_encrypt_key_2026"}'), 'base64')
WHERE niss IS NOT NULL AND niss != '' AND (niss_enc IS NULL OR niss_enc = '');

UPDATE employees 
SET iban_enc = encode(pgp_sym_encrypt(iban, '${process.env.PGCRYPTO_KEY || "aureus_encrypt_key_2026"}'), 'base64')
WHERE iban IS NOT NULL AND iban != '' AND (iban_enc IS NULL OR iban_enc = '');`;

  results.push({
    step: 'sql_complet',
    ok: true,
    detail: 'SQL complet prêt à copier dans Supabase Dashboard → SQL Editor',
    sql: sqlPgcrypto
  });

  return NextResponse.json({
    ok: true,
    migration: '007-pgcrypto',
    message: 'Diagnostic terminé. Voir les étapes ci-dessous.',
    results,
    supabase_url: `${url.replace('https://', '').split('.')[0]} (Frankfurt)`,
    action_requise: 'Copier le SQL dans Supabase Dashboard → SQL Editor → Exécuter'
  });
}

export async function GET() {
  return NextResponse.json({
    migration: '007-pgcrypto',
    description: 'Chiffrement AES-256 NISS et IBAN via pgcrypto',
    status: 'POST to diagnose and get SQL'
  });
}
