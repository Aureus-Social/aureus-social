-- ═══════════════════════════════════════════════════════════════
-- AUREUS SOCIAL PRO — Row Level Security (RLS) Supabase
-- RGPD Art.25 & Art.32 — Isolation multi-tenant
-- À exécuter dans Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Activer RLS sur toutes les tables ───────────────────
ALTER TABLE IF EXISTS employees      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fiches_paie    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS declarations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS export_pcmn_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dimona_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payroll_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS absences       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contrats       ENABLE ROW LEVEL SECURITY;

-- ─── 2. Politique SELECT — chaque user voit ses données ─────
DROP POLICY IF EXISTS "employees_select_own" ON employees;
CREATE POLICY "employees_select_own" ON employees
  FOR SELECT USING (auth.uid() = created_by OR auth.uid()::text = user_id);

DROP POLICY IF EXISTS "clients_select_own" ON clients;
CREATE POLICY "clients_select_own" ON clients
  FOR SELECT USING (auth.uid() = created_by OR auth.uid()::text = user_id);

DROP POLICY IF EXISTS "fiches_select_own" ON fiches_paie;
CREATE POLICY "fiches_select_own" ON fiches_paie
  FOR SELECT USING (auth.uid() = created_by OR auth.uid()::text = user_id);

DROP POLICY IF EXISTS "audit_select_own" ON audit_log;
CREATE POLICY "audit_select_own" ON audit_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "docs_select_own" ON documents;
CREATE POLICY "docs_select_own" ON documents
  FOR SELECT USING (auth.uid() = created_by OR auth.uid()::text = user_id);

DROP POLICY IF EXISTS "pcmn_select_own" ON export_pcmn_mappings;
CREATE POLICY "pcmn_select_own" ON export_pcmn_mappings
  FOR SELECT USING (auth.uid()::text = user_id);

-- ─── 3. Politique INSERT — user_id = auth.uid() ─────────────
DROP POLICY IF EXISTS "employees_insert_own" ON employees;
CREATE POLICY "employees_insert_own" ON employees
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "clients_insert_own" ON clients;
CREATE POLICY "clients_insert_own" ON clients
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "fiches_insert_own" ON fiches_paie;
CREATE POLICY "fiches_insert_own" ON fiches_paie
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- ─── 4. Politique UPDATE — uniquement ses propres enregistrements ─
DROP POLICY IF EXISTS "employees_update_own" ON employees;
CREATE POLICY "employees_update_own" ON employees
  FOR UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "clients_update_own" ON clients;
CREATE POLICY "clients_update_own" ON clients
  FOR UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

-- ─── 5. Politique DELETE — soft delete via status ───────────
DROP POLICY IF EXISTS "employees_delete_own" ON employees;
CREATE POLICY "employees_delete_own" ON employees
  FOR DELETE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "clients_delete_own" ON clients;
CREATE POLICY "clients_delete_own" ON clients
  FOR DELETE USING (auth.uid() = created_by);

-- ─── 6. Rôle service_role bypass (pour les crons GitHub Actions) ─
-- Le service_role bypasse automatiquement RLS — aucune politique nécessaire

-- ─── 7. Table audit_log — INSERT ouvert, SELECT restreint ───
DROP POLICY IF EXISTS "audit_insert_any_auth" ON audit_log;
CREATE POLICY "audit_insert_any_auth" ON audit_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ─── 8. Vérification ────────────────────────────────────────
-- SELECT schemaname, tablename, policyname, cmd, qual
-- FROM pg_policies WHERE schemaname = 'public';
