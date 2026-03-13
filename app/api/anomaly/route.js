import { getAuthUser } from '@/app/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Seuils d'anomalie
const THRESHOLDS = {
  MAX_ACTIONS_PER_HOUR: 200,    // Plus de 200 actions/heure = suspect
  MAX_EXPORTS_PER_HOUR: 10,     // Plus de 10 exports/heure = suspect
  MAX_DELETES_PER_HOUR: 20,     // Plus de 20 suppressions/heure = suspect
};

export async function GET(req) {
  const u = await getAuthUser(req);
  if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });

  if (!supabase) return Response.json({ error: 'Supabase non configuré' }, { status: 500 });

  try {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const alerts = [];

    // 1. Volume d'actions par user dernière heure
    const { data: actions } = await supabase
      .from('audit_log')
      .select('user_id, user_email, action')
      .gte('created_at', oneHourAgo);

    if (actions) {
      // Grouper par user
      const byUser = {};
      actions.forEach(a => {
        const key = a.user_id || 'anonymous';
        if (!byUser[key]) byUser[key] = { email: a.user_email, total: 0, exports: 0, deletes: 0 };
        byUser[key].total++;
        if (a.action?.includes('EXPORT')) byUser[key].exports++;
        if (a.action?.includes('DELETE')) byUser[key].deletes++;
      });

      for (const [userId, stats] of Object.entries(byUser)) {
        if (stats.total > THRESHOLDS.MAX_ACTIONS_PER_HOUR) {
          alerts.push({ type: 'HIGH_VOLUME', severity: 'high', user: stats.email, count: stats.total, threshold: THRESHOLDS.MAX_ACTIONS_PER_HOUR });
        }
        if (stats.exports > THRESHOLDS.MAX_EXPORTS_PER_HOUR) {
          alerts.push({ type: 'MASS_EXPORT', severity: 'critical', user: stats.email, count: stats.exports, threshold: THRESHOLDS.MAX_EXPORTS_PER_HOUR });
        }
        if (stats.deletes > THRESHOLDS.MAX_DELETES_PER_HOUR) {
          alerts.push({ type: 'MASS_DELETE', severity: 'critical', user: stats.email, count: stats.deletes, threshold: THRESHOLDS.MAX_DELETES_PER_HOUR });
        }
      }
    }

    // 2. Enregistrer les incidents détectés
    for (const alert of alerts) {
      await supabase.from('security_incidents').insert({
        type: alert.type,
        severity: alert.severity,
        description: `Anomalie détectée: ${alert.count} ${alert.type} en 1h (seuil: ${alert.threshold})`,
        details: alert,
        resolved: false,
      }).catch(() => {});
    }

    return Response.json({ alerts, checked_at: new Date().toISOString(), actions_last_hour: actions?.length || 0 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
