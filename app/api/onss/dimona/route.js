// ═══ AUREUS SOCIAL PRO — /api/onss/dimona ═══
// Soumission Dimona via portail ONSS (simulation + XML ready)
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function POST(request) {
  try {
    // ✅ Auth JWT obligatoire
    const caller = await getAuthUser(request);
    if (!caller) return Response.json({ error: 'Non autorisé — JWT requis' }, { status: 401 });

    const body = await request.json();
    const { xml, action, worker, employer, period } = body;

    if (!xml || !action) {
      return Response.json({ error: 'xml et action requis' }, { status: 400 });
    }

    // Validation des champs obligatoires
    const workerNiss = worker?.niss || body.niss;
    const employerOnss = employer?.onss || body.onss;

    if (!workerNiss) return Response.json({ error: 'NISS travailleur manquant' }, { status: 400 });
    if (!employerOnss) return Response.json({ error: 'N° ONSS employeur manquant' }, { status: 400 });

    // Générer un numéro de déclaration simulé (format ONSS réel)
    const declarationId = `DIM-${Date.now()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`;
    const submittedAt = new Date().toISOString();

    // Sauvegarder dans Supabase
    const dimonaRecord = {
      declaration_id: declarationId,
      action: action,
      worker_niss: workerNiss,
      employer_onss: employerOnss,
      period_start: period?.start || body.start || null,
      period_end: period?.end || body.end || null,
      xml_content: xml,
      status: 'submitted',
      submitted_at: submittedAt,
      submitted_by: caller.id,
      submitted_by_email: caller.email,
      created_at: submittedAt
    };

    if (supabase) {
      const { error: dbErr } = await supabase.from('declarations').insert({
        type: 'dimona',
        reference: declarationId,
        status: 'submitted',
        data: dimonaRecord,
        user_id: caller.id,
        created_at: submittedAt
      });
      if (dbErr) console.error('[Dimona] DB error:', dbErr.message);

      // Audit trail
      await supabase.from('audit_log').insert({
        action: 'DIMONA_SUBMITTED',
        table_name: 'declarations',
        record_id: declarationId,
        user_id: caller.id,
        user_email: caller.email,
        details: { action, worker_niss: workerNiss, employer_onss: employerOnss, declaration_id: declarationId },
        created_at: submittedAt
      });
    }

    // Réponse simulant le retour ONSS
    return Response.json({
      ok: true,
      declarationId,
      status: 'submitted',
      submittedAt,
      message: `Dimona ${action} enregistrée — ID: ${declarationId}`,
      onss: {
        // En prod : retour réel de l'API ONSS via Smals OAuth
        // Pour l'instant : simulation locale avec stockage Supabase
        mode: 'simulation',
        note: 'Fichier XML généré et sauvegardé. Pour soumission directe ONSS, configurer les credentials OAuth Smals (NEXT_PUBLIC_ONSS_OAUTH_CLIENT_ID + ONSS_OAUTH_SECRET).'
      }
    });

  } catch (e) {
    console.error('[Dimona] Erreur:', e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const caller = await getAuthUser(request);
    if (!caller) return Response.json({ error: 'Non autorisé' }, { status: 401 });

    if (!supabase) return Response.json({ declarations: [], count: 0 });

    const { data, error } = await supabase
      .from('declarations')
      .select('*')
      .eq('type', 'dimona')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ declarations: data, count: data.length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
