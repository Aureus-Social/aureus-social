-- ═══════════════════════════════════════════════════════════════════════════
-- AUREUS SOCIAL PRO — Mapping PCMN pour Connecteurs BOB / WinBooks
-- Table: compta_mapping
-- Stocke les comptes PCMN personnalisés par défaut + par client
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS compta_mapping (
  id             TEXT PRIMARY KEY DEFAULT 'default',
  active         BOOLEAN DEFAULT TRUE,
  mapping        JSONB NOT NULL DEFAULT '{
    "brut":        "620000",
    "onssE":       "621000",
    "onssW":       "453000",
    "pp":          "453100",
    "net":         "455000",
    "cheqRepas":   "740000",
    "fraisDep":    "612500",
    "provision":   "460000",
    "maladieGM":   "620500",
    "peculeVac":   "622000",
    "primeFin":    "623000",
    "avantNature": "741000"
  }'::jsonb,
  client_mappings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Ligne par défaut
INSERT INTO compta_mapping (id, active, mapping, client_mappings)
VALUES ('default', TRUE, '{
  "brut":        "620000",
  "onssE":       "621000",
  "onssW":       "453000",
  "pp":          "453100",
  "net":         "455000",
  "cheqRepas":   "740000",
  "fraisDep":    "612500",
  "provision":   "460000",
  "maladieGM":   "620500",
  "peculeVac":   "622000",
  "primeFin":    "623000",
  "avantNature": "741000"
}'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE compta_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "compta_mapping_select" ON compta_mapping
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "compta_mapping_upsert" ON compta_mapping
  FOR ALL USING (auth.role() = 'authenticated');

-- Historique des exports comptables
CREATE TABLE IF NOT EXISTS export_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  format     TEXT NOT NULL,
  period     TEXT,
  count      INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "export_history_select" ON export_history
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "export_history_insert" ON export_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Index
CREATE INDEX IF NOT EXISTS idx_export_history_user ON export_history(user_id);
CREATE INDEX IF NOT EXISTS idx_export_history_created ON export_history(created_at DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_compta_mapping_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_compta_mapping_updated ON compta_mapping;
CREATE TRIGGER trg_compta_mapping_updated
  BEFORE UPDATE ON compta_mapping
  FOR EACH ROW EXECUTE FUNCTION update_compta_mapping_updated_at();
