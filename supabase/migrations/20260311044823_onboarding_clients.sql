-- Migration: Onboarding clients schema
-- Ajout colonnes nécessaires au flow onboarding multi-tenant
-- Sprint 3 — Aureus Social Pro

-- Table clients : colonnes onboarding
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS plan text DEFAULT 'trial' CHECK (plan IN ('trial', 'starter', 'pro', 'fiduciaire'));
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT (now() + interval '14 days');
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'trial'));

-- Index pour performance RLS
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_plan ON public.clients(plan);

-- RLS policy pour que chaque tenant ne voie que ses propres clients
-- (si pas encore de policy user_id)
DO $$
BEGIN
  -- Ajouter policy user_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'clients' 
    AND policyname = 'clients_own_tenant'
  ) THEN
    CREATE POLICY clients_own_tenant ON public.clients
      USING (user_id = auth.uid() OR auth.role() = 'service_role');
  END IF;
END $$;

-- Commentaires
COMMENT ON COLUMN public.clients.user_id IS 'Propriétaire du tenant (auth.users)';
COMMENT ON COLUMN public.clients.plan IS 'Plan tarifaire: trial, starter, pro, fiduciaire';
COMMENT ON COLUMN public.clients.trial_ends_at IS 'Fin de la période trial (14 jours par défaut)';
COMMENT ON COLUMN public.clients.onboarded_at IS 'Date de complétion de l onboarding';
COMMENT ON COLUMN public.clients.status IS 'Statut du compte: active, suspended, cancelled, trial';

