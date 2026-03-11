-- ══════════════════════════════════════════════════════════════
-- Migration 003: Fonctions RGPD opérationnelles
-- Art. 17 (droit oubli), Art. 15 (accès), Art. 33 (violations)
-- ══════════════════════════════════════════════════════════════

-- 1. Fonction: Droit à l'effacement Art. 17
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

  SELECT COUNT(*) INTO fiche_count FROM public.fiches_paie WHERE employee_id = p_employee_id;

  IF fiche_count = 0 THEN
    DELETE FROM public.absences WHERE employee_id = p_employee_id;
    DELETE FROM public.documents WHERE employee_id = p_employee_id;
    DELETE FROM public.employees WHERE id = p_employee_id AND user_id = p_user_id;
    deleted_tables := ARRAY['absences', 'documents', 'employees'];
    result := jsonb_build_object('success', true, 'type', 'complet', 'legal_block', false, 'deleted', to_json(deleted_tables));
  ELSE
    UPDATE public.employees SET
      email = NULL, phone = NULL, iban = NULL,
      niss = '[ANONYMISE-' || to_char(now(), 'YYYY-MM-DD') || ']'
    WHERE id = p_employee_id AND user_id = p_user_id;
    deleted_tables := ARRAY['email', 'phone', 'iban', 'niss (anonymisé)'];
    result := jsonb_build_object('success', true, 'type', 'partiel', 'legal_block', true,
      'reason', fiche_count || ' fiche(s) conservée(s) — obligation 10 ans Art. 2262bis C.civ.',
      'deleted', to_json(deleted_tables));
  END IF;

  INSERT INTO public.gdpr_requests (user_id, employee_id, request_type, status, details, processed_at)
  VALUES (p_user_id, p_employee_id, 'oubli',
    CASE WHEN fiche_count = 0 THEN 'completed' ELSE 'partial' END,
    result::text, now());

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Accorder les droits d'exécution
GRANT EXECUTE ON FUNCTION public.rgpd_droit_oubli(uuid, uuid) TO authenticated;

-- 3. Index sur gdpr_requests pour performance
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_user_type
  ON public.gdpr_requests(user_id, request_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gdpr_requests_status
  ON public.gdpr_requests(status, created_at DESC);

-- 4. RLS sur gdpr_requests (si pas encore activé)
ALTER TABLE public.gdpr_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gdpr_requests_isolation" ON public.gdpr_requests;
CREATE POLICY "gdpr_requests_isolation"
  ON public.gdpr_requests FOR ALL
  USING (user_id = auth.uid());

-- 5. Vue RGPD conformité
CREATE OR REPLACE VIEW public.rgpd_conformite_view AS
SELECT
  auth.uid() as user_id,
  (SELECT COUNT(*) FROM public.employees WHERE user_id = auth.uid()) as employes_proteges,
  (SELECT COUNT(*) FROM public.gdpr_requests WHERE user_id = auth.uid()) as demandes_total,
  (SELECT COUNT(*) FROM public.gdpr_requests WHERE user_id = auth.uid() AND status = 'pending') as demandes_en_attente,
  (SELECT COUNT(*) FROM public.audit_log WHERE user_id = auth.uid()) as entrees_audit,
  now() as calcule_le;
