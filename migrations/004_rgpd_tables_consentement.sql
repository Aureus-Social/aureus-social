-- ══════════════════════════════════════════════════════════════════
-- Migration 004: Tables consentement RGPD
-- newsletter_subscribers (Art. 6.1.a), contact_consents (Art. 6.1.a)
-- + Fonction rgpd_droit_oubli (Art. 17) — manquait dans migration 003
-- ══════════════════════════════════════════════════════════════════

-- 1. TABLE: newsletter_subscribers ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  lang TEXT DEFAULT 'fr',
  source TEXT DEFAULT 'vitrine',
  active BOOLEAN DEFAULT true,
  consent BOOLEAN NOT NULL DEFAULT false,
  consent_ip TEXT,
  consent_date TIMESTAMPTZ,
  consent_text TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON public.newsletter_subscribers(active, lang);

-- RLS: seul le service_role peut lire (pas d'accès utilisateur normal)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "newsletter_service_only" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_service_only"
  ON public.newsletter_subscribers FOR ALL
  USING (false); -- seul service_role bypasse RLS

-- 2. TABLE: contact_consents ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  prenom TEXT,
  nom TEXT,
  societe TEXT,
  role TEXT,
  lang TEXT DEFAULT 'fr',
  source TEXT DEFAULT 'vitrine_contact',
  consent BOOLEAN NOT NULL DEFAULT false,
  consent_ip TEXT,
  consent_date TIMESTAMPTZ,
  consent_text TEXT,
  message_excerpt TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_consents_email ON public.contact_consents(email);
CREATE INDEX IF NOT EXISTS idx_contact_consents_date ON public.contact_consents(consent_date DESC);

ALTER TABLE public.contact_consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contact_consents_service_only" ON public.contact_consents;
CREATE POLICY "contact_consents_service_only"
  ON public.contact_consents FOR ALL
  USING (false);

-- 3. FONCTION: rgpd_droit_oubli (Art. 17) ──────────────────────
-- (manquait dans migration 003 — PGRST202)
CREATE OR REPLACE FUNCTION public.rgpd_droit_oubli(
  p_employee_id uuid,
  p_user_id uuid
) RETURNS jsonb AS $$
DECLARE
  emp_record RECORD;
  fiche_count int;
  deleted_tables text[] := '{}';
  result jsonb;
BEGIN
  SELECT * INTO emp_record FROM public.employees
  WHERE id = p_employee_id AND user_id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Accès refusé ou employé introuvable');
  END IF;

  SELECT COUNT(*) INTO fiche_count FROM public.fiches_paie
  WHERE employee_id = p_employee_id;

  IF fiche_count = 0 THEN
    DELETE FROM public.absences WHERE employee_id = p_employee_id;
    DELETE FROM public.documents WHERE employee_id = p_employee_id;
    DELETE FROM public.employees WHERE id = p_employee_id AND user_id = p_user_id;
    deleted_tables := ARRAY['absences', 'documents', 'employees'];
    result := jsonb_build_object(
      'success', true, 'type', 'complet', 'legal_block', false,
      'deleted', to_json(deleted_tables)
    );
  ELSE
    UPDATE public.employees SET
      email = NULL,
      phone = NULL,
      iban = NULL,
      niss = '[ANONYMISE-' || to_char(now(), 'YYYY-MM-DD') || ']'
    WHERE id = p_employee_id AND user_id = p_user_id;
    deleted_tables := ARRAY['email', 'phone', 'iban', 'niss (anonymisé)'];
    result := jsonb_build_object(
      'success', true, 'type', 'partiel', 'legal_block', true,
      'reason', fiche_count || ' fiche(s) conservée(s) — obligation 10 ans Art. 2262bis C.civ.',
      'deleted', to_json(deleted_tables)
    );
  END IF;

  INSERT INTO public.gdpr_requests (user_id, employee_id, request_type, status, details, processed_at)
  VALUES (
    p_user_id, p_employee_id, 'oubli',
    CASE WHEN fiche_count = 0 THEN 'completed' ELSE 'partial' END,
    result::text, now()
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.rgpd_droit_oubli(uuid, uuid) TO authenticated;

-- 4. RLS sur gdpr_requests ──────────────────────────────────────
ALTER TABLE public.gdpr_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "gdpr_requests_isolation" ON public.gdpr_requests;
CREATE POLICY "gdpr_requests_isolation"
  ON public.gdpr_requests FOR ALL
  USING (user_id = auth.uid());

-- 5. Indexes performance gdpr_requests ──────────────────────────
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_user_type
  ON public.gdpr_requests(user_id, request_type, created_at DESC);

-- 6. Purge automatique newsletter (Art. 5.1.e) ─────────────────
-- Les désinscrits depuis >2 ans peuvent être supprimés
CREATE OR REPLACE FUNCTION public.rgpd_purge_newsletter_inactive() RETURNS jsonb AS $$
DECLARE rows_del int;
BEGIN
  DELETE FROM public.newsletter_subscribers
  WHERE active = false AND unsubscribed_at < now() - interval '2 years';
  GET DIAGNOSTICS rows_del = ROW_COUNT;
  RETURN jsonb_build_object('table', 'newsletter_subscribers (inactifs >2ans)', 'rows_deleted', rows_del);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.rgpd_purge_newsletter_inactive() TO service_role;

-- RÉSUMÉ
SELECT 'Migration 004 RGPD OK — newsletter_subscribers, contact_consents, rgpd_droit_oubli' AS status;
