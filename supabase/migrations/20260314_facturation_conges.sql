-- ═══════════════════════════════════════════════════════════════
-- AUREUS SOCIAL PRO — Migration: Facturation + Congés + Invitations
-- À exécuter dans Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Table factures ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS factures (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero        TEXT NOT NULL,
  client_name   TEXT NOT NULL,
  client_email  TEXT,
  montant       NUMERIC(10,2) NOT NULL DEFAULT 0,
  description   TEXT,
  items         JSONB,
  echeance      DATE,
  status        TEXT NOT NULL DEFAULT 'brouillon'
                  CHECK (status IN ('brouillon','envoyee','payee','retard','annulee')),
  relances      INTEGER DEFAULT 0,
  created_by    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE factures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "factures_isolation" ON factures;
CREATE POLICY "factures_isolation" ON factures
  FOR ALL USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_factures_user ON factures(created_by);
CREATE INDEX IF NOT EXISTS idx_factures_status ON factures(status);

-- ── 2. Table conges ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conges (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  emp_id          UUID NOT NULL,
  emp_name        TEXT,
  emp_email       TEXT,
  type            TEXT NOT NULL,
  date_debut      DATE NOT NULL,
  date_fin        DATE NOT NULL,
  nb_jours        INTEGER,
  motif           TEXT,
  manager_email   TEXT,
  status          TEXT NOT NULL DEFAULT 'en_attente'
                    CHECK (status IN ('en_attente','approuve','refuse','annule')),
  commentaire     TEXT,
  validated_by    UUID,
  validated_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "conges_isolation" ON conges;
CREATE POLICY "conges_isolation" ON conges
  FOR ALL USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_conges_user ON conges(created_by);
CREATE INDEX IF NOT EXISTS idx_conges_emp ON conges(emp_id);
CREATE INDEX IF NOT EXISTS idx_conges_status ON conges(status);

-- ── 3. Colonne invited_at sur employees ────────────────────────
ALTER TABLE employees ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;

-- ── 4. RLS tables restantes (payroll_history, app_state, audit_log) ──
ALTER TABLE payroll_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payroll_history_isolation" ON payroll_history;
CREATE POLICY "payroll_history_isolation" ON payroll_history
  FOR ALL USING (created_by::uuid = auth.uid())
  WITH CHECK (created_by::uuid = auth.uid());

-- app_state : isolation par clé préfixée user_id
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_state_isolation" ON app_state;
CREATE POLICY "app_state_isolation" ON app_state
  FOR ALL USING (key LIKE auth.uid()::text || ':%')
  WITH CHECK (key LIKE auth.uid()::text || ':%');

-- audit_log : lecture uniquement ses propres logs
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_log_read_own" ON audit_log;
CREATE POLICY "audit_log_read_own" ON audit_log
  FOR SELECT USING (user_id = auth.uid()::text);
DROP POLICY IF EXISTS "audit_log_insert_all" ON audit_log;
CREATE POLICY "audit_log_insert_all" ON audit_log
  FOR INSERT WITH CHECK (true);

-- ── 5. Vérification ────────────────────────────────────────────
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('factures','conges','employees','payroll_history','app_state','audit_log')
ORDER BY tablename;
