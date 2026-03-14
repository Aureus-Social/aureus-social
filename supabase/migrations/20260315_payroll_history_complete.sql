-- ═══════════════════════════════════════════════════════════════
-- AUREUS SOCIAL PRO — Migration payroll_history complète
-- Historique fiches de paie : employés, ouvriers, dirigeants, sociétés
-- ═══════════════════════════════════════════════════════════════

-- Table fiches_paie (si pas encore créée)
CREATE TABLE IF NOT EXISTS fiches_paie (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Identification
  employe_id UUID,
  employe_nom TEXT,
  employe_prenom TEXT,
  employe_niss TEXT,
  employe_type TEXT DEFAULT 'employe', -- 'employe' | 'ouvrier' | 'dirigeant' | 'societe'
  -- Période
  period TEXT NOT NULL,    -- ex: '2026-03'
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  -- Rémunération
  gross DECIMAL(10,2) DEFAULT 0,
  regime INTEGER DEFAULT 100,
  cp TEXT DEFAULT '200',
  -- Calculs paie
  onss_w DECIMAL(10,2) DEFAULT 0,   -- cotisation personnelle
  onss_e DECIMAL(10,2) DEFAULT 0,   -- cotisation patronale
  pp DECIMAL(10,2) DEFAULT 0,       -- précompte professionnel
  css DECIMAL(10,2) DEFAULT 0,      -- cotisation spéciale SS
  net DECIMAL(10,2) DEFAULT 0,      -- net à payer
  cout_empl DECIMAL(10,2) DEFAULT 0, -- coût total employeur
  -- Spécifique ouvriers
  onva DECIMAL(10,2) DEFAULT 0,     -- ONVA vacances annuelles ouvriers
  -- Spécifique dirigeants
  cotis_dirigeant DECIMAL(10,2) DEFAULT 0,
  -- Primes
  cheques_repas DECIMAL(10,2) DEFAULT 0,
  eco_cheques DECIMAL(10,2) DEFAULT 0,
  autres_primes DECIMAL(10,2) DEFAULT 0,
  -- Métadonnées
  statut TEXT DEFAULT 'calcule',  -- 'calcule' | 'valide' | 'paye' | 'annule'
  notes TEXT,
  at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table payroll_history (historique agrégé par période)
CREATE TABLE IF NOT EXISTS payroll_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Période
  period TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  -- Totaux
  nb_employes INTEGER DEFAULT 0,
  nb_ouvriers INTEGER DEFAULT 0,
  nb_dirigeants INTEGER DEFAULT 0,
  nb_societes INTEGER DEFAULT 0,
  total_brut DECIMAL(10,2) DEFAULT 0,
  total_net DECIMAL(10,2) DEFAULT 0,
  total_onss_w DECIMAL(10,2) DEFAULT 0,
  total_onss_e DECIMAL(10,2) DEFAULT 0,
  total_pp DECIMAL(10,2) DEFAULT 0,
  total_cout_empl DECIMAL(10,2) DEFAULT 0,
  -- Statut clôture
  cloture BOOLEAN DEFAULT FALSE,
  cloture_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(created_by, period)
);

-- Index performance
CREATE INDEX IF NOT EXISTS idx_fiches_paie_created_by ON fiches_paie(created_by);
CREATE INDEX IF NOT EXISTS idx_fiches_paie_period ON fiches_paie(year, month);
CREATE INDEX IF NOT EXISTS idx_fiches_paie_type ON fiches_paie(employe_type);
CREATE INDEX IF NOT EXISTS idx_payroll_history_created_by ON payroll_history(created_by);
CREATE INDEX IF NOT EXISTS idx_payroll_history_period ON payroll_history(year, month);

-- RLS
ALTER TABLE fiches_paie ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fiches_paie_all_own" ON fiches_paie;
CREATE POLICY "fiches_paie_all_own" ON fiches_paie
  FOR ALL USING (auth.uid() = created_by OR auth.uid()::text = user_id)
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "payroll_history_all_own" ON payroll_history;
CREATE POLICY "payroll_history_all_own" ON payroll_history
  FOR ALL USING (auth.uid() = created_by OR auth.uid()::text = user_id)
  WITH CHECK (auth.uid() = created_by);
