-- ═══════════════════════════════════════════════════════════════
-- SUPABASE MIGRATION — Export Comptable Pro v2
-- Tables pour Feature 37 : Connecteurs BOB/Winbooks "Complet"
-- ═══════════════════════════════════════════════════════════════

-- 1. Table historique des exports
CREATE TABLE IF NOT EXISTS export_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  format TEXT NOT NULL,
  format_id TEXT NOT NULL,
  period TEXT NOT NULL,
  period_type TEXT NOT NULL,
  client TEXT DEFAULT 'all',
  lines_count INTEGER DEFAULT 0,
  total_brut NUMERIC(12,2) DEFAULT 0,
  total_net NUMERIC(12,2) DEFAULT 0,
  total_onss_e NUMERIC(12,2) DEFAULT 0,
  total_onss_w NUMERIC(12,2) DEFAULT 0,
  total_pp NUMERIC(12,2) DEFAULT 0,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_history_user ON export_history(user_id, created_at DESC);

ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'export_history' AND policyname = 'Users can view own exports') THEN
    CREATE POLICY "Users can view own exports" ON export_history FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'export_history' AND policyname = 'Users can insert own exports') THEN
    CREATE POLICY "Users can insert own exports" ON export_history FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'export_history' AND policyname = 'Users can delete own exports') THEN
    CREATE POLICY "Users can delete own exports" ON export_history FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 2. Table mapping comptes PCMN
CREATE TABLE IF NOT EXISTS export_pcmn_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  mappings JSONB NOT NULL DEFAULT '{"brut":"620000","onssE":"621000","onssW":"453000","pp":"453100","net":"455000","cheqRepas":"623000","fraisDeplacement":"625000","provisions":"460000","maladieGM":"453200","peculeVacances":"622000","primeFinAnnee":"623100","avantagesNature":"623200"}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE export_pcmn_mappings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'export_pcmn_mappings' AND policyname = 'Users can view own mappings') THEN
    CREATE POLICY "Users can view own mappings" ON export_pcmn_mappings FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'export_pcmn_mappings' AND policyname = 'Users can upsert own mappings') THEN
    CREATE POLICY "Users can upsert own mappings" ON export_pcmn_mappings FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'export_pcmn_mappings' AND policyname = 'Users can update own mappings') THEN
    CREATE POLICY "Users can update own mappings" ON export_pcmn_mappings FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Done!
SELECT 'Migration export_v2 applied successfully' AS status;
