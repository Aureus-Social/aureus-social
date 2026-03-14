// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Cron Purge Logs RGPD
// Supprime automatiquement les logs > 90 jours (Art. 5 RGPD)
// Appelé par Vercel Cron toutes les nuits à 3h00 CET
// ═══════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const CRON_SECRET = process.env.CRON_SECRET;

// Rétention par type de log (jours) — conformité RGPD Art. 5
const RETENTION = {
  audit_log: 90,           // Logs d'audit : 90 jours
  error_logs: 30,          // Logs d'erreur : 30 jours
  security_incidents: 365, // Incidents sécurité : 1 an (preuve légale)
};

export async function GET(request) {
  try {
    const auth = (request.headers.get('authorization') || '').replace('Bearer ', '');
    if (auth !== CRON_SECRET) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    if (!supabase) return Response.json({ error: 'Supabase non configuré' }, { status: 500 });

    const results = {};

    // ── 1. Purge audit_log > 90 jours ──
    const auditCutoff = new Date(Date.now() - RETENTION.audit_log * 24 * 3600000).toISOString();
    const { data: auditDel, error: auditErr } = await supabase
      .from('audit_log')
      .delete()
      .lt('created_at', auditCutoff)
      .not('action', 'in', '("SECURITY_INCIDENT","BRUTE_FORCE_DETECTED","BACKUP_B2_SUCCESS")')
      .select('id');

    results.audit_log = { deleted: auditDel?.length || 0, cutoff: auditCutoff, error: auditErr?.message };

    // ── 2. Purge error_logs > 30 jours ──
    const errorCutoff = new Date(Date.now() - RETENTION.error_logs * 24 * 3600000).toISOString();
    const { data: errorDel, error: errorErr } = await supabase
      .from('error_logs')
      .delete()
      .lt('created_at', errorCutoff)
      .select('id');

    results.error_logs = { deleted: errorDel?.length || 0, cutoff: errorCutoff, error: errorErr?.message };

    // ── 3. Archiver incidents résolus > 1 an ──
    const incidentCutoff = new Date(Date.now() - RETENTION.security_incidents * 24 * 3600000).toISOString();
    const { data: incDel, error: incErr } = await supabase
      .from('security_incidents')
      .delete()
      .lt('created_at', incidentCutoff)
      .eq('resolved', true)
      .select('id');

    results.security_incidents = { deleted: incDel?.length || 0, cutoff: incidentCutoff, error: incErr?.message };

    // ── 4. Logger la purge elle-même ──
    const totalDeleted = (results.audit_log.deleted || 0) + (results.error_logs.deleted || 0) + (results.security_incidents.deleted || 0);
    await supabase.from('audit_log').insert({
      action: 'RGPD_LOG_PURGE',
      details: { ...results, total_deleted: totalDeleted, retention_policy: RETENTION },
    }).catch(() => {});

    return Response.json({
      success: true,
      total_deleted: totalDeleted,
      results,
      timestamp: new Date().toISOString(),
      next_run: 'Demain 3h00 CET',
    });
  } catch (e) {
    return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(e.message||"Erreur") }, { status: 500 });
  }
}
