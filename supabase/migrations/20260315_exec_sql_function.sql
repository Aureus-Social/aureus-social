-- Fonction pour exécuter du SQL dynamique depuis l'API
-- Accessible uniquement via service_role (jamais via anon/user)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Révoquer l'accès public — service_role seulement
REVOKE ALL ON FUNCTION exec_sql FROM PUBLIC;
REVOKE ALL ON FUNCTION exec_sql FROM anon;
REVOKE ALL ON FUNCTION exec_sql FROM authenticated;
GRANT EXECUTE ON FUNCTION exec_sql TO service_role;
