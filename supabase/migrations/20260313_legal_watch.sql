-- ═══════════════════════════════════════════════════════════════════════════
-- AUREUS SOCIAL PRO — Migration: table legal_watch
-- Exécuter dans Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- Table de suivi des hashes de sources légales (veille légale cron)
CREATE TABLE IF NOT EXISTS legal_watch (
  id          BIGSERIAL PRIMARY KEY,
  source_id   TEXT        NOT NULL,
  hash        TEXT        NOT NULL,
  checked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legal_watch_source_id   ON legal_watch (source_id);
CREATE INDEX IF NOT EXISTS idx_legal_watch_checked_at  ON legal_watch (checked_at DESC);

-- RLS
ALTER TABLE legal_watch ENABLE ROW LEVEL SECURITY;

-- Seul le service_role peut lire/écrire (cron)
CREATE POLICY "legal_watch_service_only"
  ON legal_watch
  FOR ALL
  USING (auth.role() = 'service_role');

-- Purge auto après 90 jours (garder seulement les 2 derniers hashes par source)
-- À exécuter manuellement ou via un autre cron si besoin :
-- DELETE FROM legal_watch WHERE checked_at < NOW() - INTERVAL '90 days';

COMMENT ON TABLE legal_watch IS 'Hashes des sources légales belges — veille quotidienne 6h00 CET';
