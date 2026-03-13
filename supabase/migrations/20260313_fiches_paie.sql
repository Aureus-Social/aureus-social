-- ═══════════════════════════════════════════════════════════════════════════
-- AUREUS SOCIAL PRO — Table fiches_paie
-- Historique des fiches de paie générées
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS fiches_paie (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  eid         TEXT,
  ename       TEXT,
  period      TEXT,
  month       INT,
  year        INT,
  gross       NUMERIC(12,2) DEFAULT 0,
  net         NUMERIC(12,2) DEFAULT 0,
  onss_w      NUMERIC(12,2) DEFAULT 0,
  onss_e      NUMERIC(12,2) DEFAULT 0,
  pp          NUMERIC(12,2) DEFAULT 0,
  css         NUMERIC(12,2) DEFAULT 0,
  cout_empl   NUMERIC(12,2) DEFAULT 0,
  batch       BOOLEAN DEFAULT FALSE,
  at          TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fiches_paie ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fp_select" ON fiches_paie
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "fp_insert" ON fiches_paie
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "fp_delete" ON fiches_paie
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_fiches_paie_user   ON fiches_paie(user_id);
CREATE INDEX IF NOT EXISTS idx_fiches_paie_period ON fiches_paie(period);
CREATE INDEX IF NOT EXISTS idx_fiches_paie_eid    ON fiches_paie(eid);
CREATE INDEX IF NOT EXISTS idx_fiches_paie_at     ON fiches_paie(at DESC);
