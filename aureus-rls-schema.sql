-- ═══════════════════════════════════════════════════════════════════
-- AUREUS SOCIAL PRO — RLS SCHEMA v2.0
-- À exécuter dans Supabase SQL Editor (jwjtlpewwdjxdboxtbdf)
-- Durée estimée: 2 minutes — Aucun redéploiement nécessaire
-- ═══════════════════════════════════════════════════════════════════

-- ── ÉTAPE 1: Activer RLS sur toutes les tables existantes ──────────
ALTER TABLE employees            ENABLE ROW LEVEL SECURITY;
ALTER TABLE travailleurs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients              ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiches_paie          ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_history       ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_pcmn_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_backups      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log            ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_state            ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;

-- ── ÉTAPE 2: Créer les tables manquantes ──────────────────────────
CREATE TABLE IF NOT EXISTS absences (
  id            TEXT PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id   TEXT,
  employee_name TEXT,
  type          TEXT DEFAULT 'CONGE',
  start_date    DATE,
  end_date      DATE,
  reason        TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS relances (
  id            TEXT PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client        TEXT,
  montant       NUMERIC(12,2) DEFAULT 0,
  date_facture  DATE,
  statut        TEXT DEFAULT 'pending',
  email         TEXT,
  ref           TEXT,
  niveau_actuel INTEGER DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT now(),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── ÉTAPE 3: Activer RLS sur nouvelles tables ──────────────────────
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE relances ENABLE ROW LEVEL SECURITY;

-- ── ÉTAPE 4: Policies d'isolation par user_id ─────────────────────
DO $$ BEGIN
  DROP POLICY IF EXISTS "employees_own"       ON employees;
  CREATE POLICY "employees_own"       ON employees            FOR ALL USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "travailleurs_own"    ON travailleurs;
  CREATE POLICY "travailleurs_own"    ON travailleurs         FOR ALL USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "clients_own"         ON clients;
  CREATE POLICY "clients_own"         ON clients              FOR ALL USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "fiches_paie_own"     ON fiches_paie;
  CREATE POLICY "fiches_paie_own"     ON fiches_paie          FOR ALL USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "export_history_own"  ON export_history;
  CREATE POLICY "export_history_own"  ON export_history       FOR ALL USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "export_pcmn_own"     ON export_pcmn_mappings;
  CREATE POLICY "export_pcmn_own"     ON export_pcmn_mappings FOR ALL USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "session_backups_own" ON session_backups;
  CREATE POLICY "session_backups_own" ON session_backups      FOR ALL USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "audit_log_own"       ON audit_log;
  CREATE POLICY "audit_log_own"       ON audit_log            FOR ALL USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "app_state_own"       ON app_state;
  CREATE POLICY "app_state_own"       ON app_state            FOR ALL USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "absences_own"        ON absences;
  CREATE POLICY "absences_own"        ON absences             FOR ALL USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "relances_own"        ON relances;
  CREATE POLICY "relances_own"        ON relances             FOR ALL USING (auth.uid() = user_id);
  DROP POLICY IF EXISTS "users_own"           ON users;
  CREATE POLICY "users_own"           ON users                FOR ALL USING (auth.uid() = id);
END $$;

-- ── ÉTAPE 5: Extension pgcrypto ────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── ÉTAPE 6: Index de performance ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_absences_user ON absences(user_id);
CREATE INDEX IF NOT EXISTS idx_absences_emp  ON absences(employee_id);
CREATE INDEX IF NOT EXISTS idx_relances_user ON relances(user_id);
CREATE INDEX IF NOT EXISTS idx_relances_stat ON relances(statut);

-- ── VALIDATION ─────────────────────────────────────────────────────
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public' ORDER BY tablename;
-- Résultat attendu: rowsecurity = true sur toutes les lignes
