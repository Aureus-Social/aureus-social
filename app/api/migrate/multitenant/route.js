import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY manquant' }, { status: 500 });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const admin = createClient(url, key);
  const results = [];

  // 1. Vérifier l'accès aux tables
  for (const table of ['employees', 'fiches_paie', 'clients', 'payroll_history']) {
    try {
      const { data, error } = await admin.from(table).select('id').limit(1);
      results.push({
        step: `table_${table}`,
        ok: !error,
        detail: error ? `Erreur : ${error.message}` : `Table ${table} accessible ✅`
      });
    } catch(e) {
      results.push({ step: `table_${table}`, ok: false, detail: e.message });
    }
  }

  // 2. Vérifier index email sur employees
  try {
    const { data, error } = await admin
      .from('employees')
      .select('email')
      .not('email', 'is', null)
      .limit(5);
    results.push({
      step: 'index_email',
      ok: !error,
      detail: error ? error.message : `Colonne email OK — ${data?.length || 0} enregistrement(s)`
    });
  } catch(e) {
    results.push({ step: 'index_email', ok: false, detail: e.message });
  }

  // 3. SQL RLS à exécuter
  const sqlRLS = `-- À exécuter dans Supabase Dashboard → SQL Editor → Exécuter

-- INDEX EMAIL (améliore les performances du portail employé)
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_fiches_paie_empid ON fiches_paie("empId");

-- RLS EMPLOYEES : employer voit ses employés, employé voit sa fiche
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "employees_employer" ON employees;
DROP POLICY IF EXISTS "employees_self" ON employees;
CREATE POLICY "employees_employer" ON employees FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "employees_self" ON employees FOR SELECT USING (email = auth.jwt()->>'email');

-- RLS FICHES_PAIE : employer voit ses fiches, employé voit les siennes
ALTER TABLE fiches_paie ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fiches_paie_employer" ON fiches_paie;
DROP POLICY IF EXISTS "fiches_paie_employe_self" ON fiches_paie;
CREATE POLICY "fiches_paie_employer" ON fiches_paie FOR ALL USING (auth.uid()::text = created_by::text);
CREATE POLICY "fiches_paie_employe_self" ON fiches_paie FOR SELECT USING (
  EXISTS (SELECT 1 FROM employees e WHERE e.id::text = "empId"::text AND e.email = auth.jwt()->>'email')
);

-- RLS CLIENTS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clients_owner" ON clients;
CREATE POLICY "clients_owner" ON clients FOR ALL USING (auth.uid() = user_id);

-- RLS PAYROLL_HISTORY
ALTER TABLE payroll_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payroll_history_owner" ON payroll_history;
CREATE POLICY "payroll_history_owner" ON payroll_history FOR ALL USING (auth.uid() = user_id);`;

  results.push({
    step: 'sql_rls_complet',
    ok: true,
    detail: 'SQL RLS prêt — copier dans Supabase Dashboard → SQL Editor',
    sql: sqlRLS
  });

  return NextResponse.json({
    ok: true,
    migration: '008-rls-multitenant',
    message: 'Diagnostic terminé. Copier le SQL dans Supabase Dashboard pour appliquer les policies RLS.',
    results,
    action_requise: 'Supabase Dashboard → SQL Editor → coller le SQL → Exécuter'
  });
}

export async function GET() {
  return NextResponse.json({
    migration: '008-rls-multitenant',
    description: 'RLS isolation multi-tenant',
    status: 'POST to get SQL'
  });
}
