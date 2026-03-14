-- ═══════════════════════════════════════════════════════════════
-- AUREUS SOCIAL PRO — Contrôle d'accès & rôles utilisateurs
-- ═══════════════════════════════════════════════════════════════

-- Table des demandes d'accès
CREATE TABLE IF NOT EXISTS access_requests (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  company_name    TEXT,
  company_bce     TEXT,
  role_type       TEXT NOT NULL CHECK (role_type IN (
                    'fiduciaire',      -- Cabinet comptable / fiduciaire
                    'comptable',       -- Expert-comptable indépendant
                    'rh_societe',      -- Service RH d'une société
                    'rh_employeur',    -- RH interne pour un employeur
                    'employeur'        -- Employeur direct (patron PME)
                  )),
  phone           TEXT,
  message         TEXT,               -- Message libre du demandeur
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected','blocked')),
  approved_by     TEXT,               -- Email admin qui a approuvé
  approved_at     TIMESTAMPTZ,
  rejected_reason TEXT,
  nb_employees    INTEGER,            -- Nombre d'employés estimé
  nb_dossiers     INTEGER,            -- Pour fiduciaires : nb de dossiers clients
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS : chaque user voit sa propre demande, admin voit tout
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "access_requests_own" ON access_requests;
CREATE POLICY "access_requests_own" ON access_requests
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Index
CREATE INDEX IF NOT EXISTS idx_access_requests_user ON access_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email);

-- Vérification
SELECT 'access_requests créée' as result, count(*) as rows FROM access_requests;
