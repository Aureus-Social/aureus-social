-- ═══════════════════════════════════════════════════════════════════════════
-- AUREUS SOCIAL PRO — Table declarations
-- Dimona IN/OUT · DmfA · Belcotax · PP · ONSS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS declarations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT NOT NULL CHECK (type IN ('dimona','dmfa','belcotax','pp','onss','other')),
  reference    TEXT,
  period       TEXT,
  status       TEXT DEFAULT 'generated' CHECK (status IN ('generated','submitted','accepted','rejected','error')),
  data         JSONB DEFAULT '{}'::jsonb,
  xml          TEXT,
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE declarations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "declarations_select" ON declarations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "declarations_insert" ON declarations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "declarations_update" ON declarations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_declarations_type    ON declarations(type);
CREATE INDEX IF NOT EXISTS idx_declarations_period  ON declarations(period);
CREATE INDEX IF NOT EXISTS idx_declarations_created ON declarations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_declarations_user    ON declarations(created_by);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_declarations_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_declarations_updated ON declarations;
CREATE TRIGGER trg_declarations_updated
  BEFORE UPDATE ON declarations
  FOR EACH ROW EXECUTE FUNCTION update_declarations_updated_at();
