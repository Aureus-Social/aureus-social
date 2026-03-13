// ═══ AUREUS SOCIAL PRO — /api/onss/status ═══
// Statut connexion ONSS (requis par dimona.js)
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const u = await getAuthUser(req);
  if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const test = searchParams.get('test');

  const hasOAuthClient = !!process.env.NEXT_PUBLIC_ONSS_OAUTH_CLIENT_ID;
  const hasOAuthSecret = !!process.env.ONSS_OAUTH_SECRET;
  const oauthReady = hasOAuthClient && hasOAuthSecret;

  const status = {
    ok: true,
    mode: oauthReady ? 'oauth_direct' : 'simulation',
    readiness: {
      oauthToken: oauthReady,
      supabaseStorage: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      xmlGeneration: true
    },
    configuration: {
      oauthClientId: hasOAuthClient ? 'configuré' : 'manquant',
      oauthSecret: hasOAuthSecret ? 'configuré' : 'manquant',
      oauthError: oauthReady ? null : 'Credentials ONSS OAuth non configurés — mode simulation actif',
      endpoint: oauthReady ? 'https://api.socialsecurity.be/REST/dimona/v1' : 'simulation locale'
    },
    message: oauthReady
      ? '✅ Connexion ONSS directe active'
      : '⚠️ Mode simulation — XML généré et sauvegardé localement. Configurer NEXT_PUBLIC_ONSS_OAUTH_CLIENT_ID + ONSS_OAUTH_SECRET pour soumission directe.'
  };

  return Response.json(status);
}
