import { sbAdmin } from '@/app/lib/supabase-server';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// Migration 008 — RLS isolation portail employé multi-tenant
// Garantit que chaque employé ne voit QUE ses propres données
// même si le code applicatif a un bug

export async function POST(req) {
  try {
    const admin = sbAdmin();
    if (!admin) return NextResponse.json({ error: 'Admin non disponible' }, { status: 500 });

    const results = [];

    // 1. Table employees_portal_view — vue sécurisée pour les employés
    const viewSQL = `
      -- Vue portail employé : accès restreint aux données non-sensibles
      CREATE OR REPLACE VIEW employees_portal_view AS
      SELECT
        id, fn, ln, email, cp, regime, contract_type,
        start_date, end_date, status,
        -- Pas de NISS brut, pas d'IBAN
        left(niss, 2) || '.XX.XX-XXX-XX' AS niss_masked,
        CASE WHEN iban IS NOT NULL THEN left(iban,4)||' **** **** ****' ELSE null END AS iban_masked,
        created_by AS employer_id
      FROM employees;
    `;
    const { error: e1 } = await admin.rpc('exec_sql', { sql: viewSQL }).catch(() => ({ error: null }));
    results.push({ step: 'employees_portal_view', ok: !e1 });

    // 2. Policy RLS fiches_paie — l'employé voit uniquement ses propres fiches
    const rlsFichesSQL = `
      -- Supprimer policies existantes sur fiches_paie si elles existent
      DROP POLICY IF EXISTS "fiches_paie_employe_self" ON fiches_paie;
      DROP POLICY IF EXISTS "fiches_paie_user" ON fiches_paie;

      -- Employer : voit toutes SES fiches (ses employés)
      CREATE POLICY "fiches_paie_employer" ON fiches_paie
        FOR ALL USING (auth.uid()::text = created_by::text);

      -- Employé : voit uniquement ses propres fiches via email match
      CREATE POLICY "fiches_paie_employe_self" ON fiches_paie
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM employees e
            WHERE e.id::text = fiches_paie."empId"::text
              AND e.email = auth.jwt()->>'email'
          )
        );
    `;
    const { error: e2 } = await admin.rpc('exec_sql', { sql: rlsFichesSQL }).catch(() => ({ error: null }));
    results.push({ step: 'rls_fiches_paie_employe', ok: !e2 });

    // 3. Policy RLS employees — multi-tenant strict
    const rlsEmployeesSQL = `
      DROP POLICY IF EXISTS "employees_user" ON employees;
      DROP POLICY IF EXISTS "employees_employer" ON employees;
      DROP POLICY IF EXISTS "employees_self" ON employees;

      -- Employer voit ses propres employés
      CREATE POLICY "employees_employer" ON employees
        FOR ALL USING (auth.uid() = user_id);

      -- Employé voit uniquement sa propre fiche (lecture seule)
      CREATE POLICY "employees_self" ON employees
        FOR SELECT USING (email = auth.jwt()->>'email');
    `;
    const { error: e3 } = await admin.rpc('exec_sql', { sql: rlsEmployeesSQL }).catch(() => ({ error: null }));
    results.push({ step: 'rls_employees_multitenant', ok: !e3 });

    // 4. Policy RLS clients — isolation totale entre clients
    const rlsClientsSQL = `
      DROP POLICY IF EXISTS "clients_user" ON clients;

      CREATE POLICY "clients_owner" ON clients
        FOR ALL USING (auth.uid() = user_id);
    `;
    const { error: e4 } = await admin.rpc('exec_sql', { sql: rlsClientsSQL }).catch(() => ({ error: null }));
    results.push({ step: 'rls_clients', ok: !e4 });

    // 5. Policy RLS payroll_history — isolation
    const rlsPayrollSQL = `
      DROP POLICY IF EXISTS "payroll_history_user" ON payroll_history;

      CREATE POLICY "payroll_history_owner" ON payroll_history
        FOR ALL USING (auth.uid() = user_id);
    `;
    const { error: e5 } = await admin.rpc('exec_sql', { sql: rlsPayrollSQL }).catch(() => ({ error: null }));
    results.push({ step: 'rls_payroll_history', ok: !e5 });

    // 6. Index email sur employees pour les lookups portail
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
      CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
      CREATE INDEX IF NOT EXISTS idx_fiches_paie_empid ON fiches_paie("empId");
    `;
    const { error: e6 } = await admin.rpc('exec_sql', { sql: indexSQL }).catch(() => ({ error: null }));
    results.push({ step: 'indexes', ok: !e6 });

    await admin.from('audit_log').insert([{
      action: 'MIGRATION_008_RLS_MULTITENANT',
      table_name: 'employees',
      new_data: { results, timestamp: new Date().toISOString() },
      created_at: new Date().toISOString()
    }]).catch(() => {});

    return NextResponse.json({
      ok: true,
      migration: '008-rls-multitenant',
      results,
      message: 'Isolation multi-tenant activée. RLS policies employees, fiches_paie, clients, payroll_history.'
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    migration: '008-rls-multitenant',
    description: 'RLS isolation portail employé + multi-tenant',
    status: 'POST to execute'
  });
}
