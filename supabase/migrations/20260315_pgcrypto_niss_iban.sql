-- ═══════════════════════════════════════════════════════════════
-- AUREUS SOCIAL PRO — pgcrypto NISS/IBAN
-- Chiffrement côté base de données (RGPD Art. 32)
-- ═══════════════════════════════════════════════════════════════

-- Activer pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Colonnes chiffrées dans employees
ALTER TABLE employees ADD COLUMN IF NOT EXISTS niss_encrypted TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS iban_encrypted TEXT;

-- Colonnes chiffrées dans travailleurs  
ALTER TABLE travailleurs ADD COLUMN IF NOT EXISTS niss_encrypted TEXT;
ALTER TABLE travailleurs ADD COLUMN IF NOT EXISTS iban_encrypted TEXT;

-- Colonnes chiffrées dans fiches_paie
ALTER TABLE fiches_paie ADD COLUMN IF NOT EXISTS employe_niss_encrypted TEXT;

-- Fonction de masquage NISS pour affichage
CREATE OR REPLACE FUNCTION mask_niss(niss TEXT)
RETURNS TEXT AS $$
BEGIN
  IF niss IS NULL OR length(niss) < 6 THEN RETURN niss; END IF;
  RETURN substring(niss, 1, 6) || '-***-**';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction de masquage IBAN pour affichage
CREATE OR REPLACE FUNCTION mask_iban(iban TEXT)
RETURNS TEXT AS $$
BEGIN
  IF iban IS NULL OR length(iban) < 8 THEN RETURN iban; END IF;
  RETURN substring(iban, 1, 4) || ' **** **** ' || substring(iban, length(iban)-3, 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Vue sécurisée avec masquage automatique
CREATE OR REPLACE VIEW employees_masked AS
SELECT
  id, user_id,
  first, last, fn, ln,
  mask_niss(niss) as niss_display,
  niss_encrypted,
  mask_iban(iban) as iban_display,
  iban_encrypted,
  email, phone,
  cp, regime, gross, contract_type,
  start_date, end_date, status,
  created_at, updated_at
FROM employees;

-- Index sur niss_encrypted pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_employees_niss_enc ON employees(niss_encrypted);
CREATE INDEX IF NOT EXISTS idx_travailleurs_niss_enc ON travailleurs(niss_encrypted);

COMMENT ON COLUMN employees.niss_encrypted IS 'NISS chiffré pgcrypto — RGPD Art.32';
COMMENT ON COLUMN employees.iban_encrypted IS 'IBAN chiffré pgcrypto — RGPD Art.32';
