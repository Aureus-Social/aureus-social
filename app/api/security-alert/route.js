import { checkRole } from '@/app/lib/supabase-server';
// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — API Alertes Sécurité Email
// POST : alerte immédiate intrusion (appelé par cron 15min)
// GET  : rapport sécurité hebdomadaire (cron lundi 8h)
// ═══════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Route admin-only — auth vérifiée dans chaque handler

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.SECURITY_ALERT_EMAIL || 'info@aureus-ia.com';
const CRON_SECRET = process.env.CRON_SECRET;

async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY manquant' };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Aureus Security <noreply@aureus-ia.com>',
      to: [to],
      subject,
      html,
    }),
  });
  return { ok: res.ok, status: res.status };
}

function alertHtml(events) {
  const rows = events.map(e => `
    <tr style="border-bottom:1px solid #2a2a2a;">
      <td style="padding:8px;color:#ef4444;font-weight:600;font-size:12px;">${e.action || '—'}</td>
      <td style="padding:8px;color:#9ca3af;font-size:12px;">${e.ip_address || '—'}</td>
      <td style="padding:8px;color:#9ca3af;font-size:12px;">${e.user_email || 'anonyme'}</td>
      <td style="padding:8px;color:#6b7280;font-size:11px;">${new Date(e.created_at).toLocaleString('fr-BE')}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><body style="background:#0a0a0a;color:#e8e6e0;font-family:system-ui,sans-serif;padding:24px;margin:0;">
  <div style="max-width:640px;margin:0 auto;">
    <div style="background:#1a0a0a;border:2px solid #ef4444;border-radius:12px;padding:24px;margin-bottom:20px;">
      <div style="font-size:32px;margin-bottom:8px;">🚨</div>
      <h1 style="color:#ef4444;margin:0 0 8px;font-size:20px;">Alerte Sécurité — Aureus Social Pro</h1>
      <p style="color:#9ca3af;margin:0;font-size:14px;">${events.length} tentative(s) d'intrusion détectée(s) dans les 15 dernières minutes</p>
    </div>
    <table style="width:100%;border-collapse:collapse;background:#111;border-radius:8px;overflow:hidden;margin-bottom:16px;">
      <thead>
        <tr style="background:#1f1f1f;">
          <th style="padding:10px 8px;text-align:left;color:#c6a34e;font-size:11px;">ACTION</th>
          <th style="padding:10px 8px;text-align:left;color:#c6a34e;font-size:11px;">IP</th>
          <th style="padding:10px 8px;text-align:left;color:#c6a34e;font-size:11px;">UTILISATEUR</th>
          <th style="padding:10px 8px;text-align:left;color:#c6a34e;font-size:11px;">HEURE</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="background:#111;border-radius:8px;padding:16px;border-left:3px solid #c6a34e;margin-bottom:16px;">
      <p style="margin:0;color:#c6a34e;font-weight:600;font-size:13px;margin-bottom:8px;">Actions recommandées :</p>
      <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.8;">
        1. Vérifier les logs complets dans <strong style="color:#e8e6e0;">Security Pro → Tentatives d'Intrusion</strong><br>
        2. Bloquer l'IP suspecte via <strong style="color:#e8e6e0;">Security Pro → IP Whitelist</strong><br>
        3. Si compromission confirmée : régénérer SUPABASE_SERVICE_ROLE_KEY immédiatement
      </p>
    </div>
    <p style="color:#4b5563;font-size:11px;text-align:center;margin:0;">
      Aureus Social Pro · Monitoring sécurité automatique · ${new Date().toLocaleString('fr-BE')}
    </p>
  </div></body></html>`;
}

function weeklyHtml(stats) {
  const scoreColor = stats.score >= 80 ? '#22c55e' : stats.score >= 60 ? '#eab308' : '#ef4444';
  const kpis = [
    { l: 'Score Sécurité', v: stats.score + '%', c: scoreColor },
    { l: 'Tentatives bloquées', v: stats.blocked, c: '#ef4444' },
    { l: 'Backups réussis', v: stats.backups + '/7', c: '#22c55e' },
    { l: 'Logins réussis', v: stats.logins, c: '#22c55e' },
    { l: 'Logins échoués', v: stats.failedLogins, c: '#f97316' },
    { l: 'IPs uniques', v: stats.uniqueIps, c: '#a78bfa' },
  ];
  return `<!DOCTYPE html><html><body style="background:#0a0a0a;color:#e8e6e0;font-family:system-ui,sans-serif;padding:24px;margin:0;">
  <div style="max-width:640px;margin:0 auto;">
    <div style="background:#111;border:1px solid rgba(198,163,78,.3);border-radius:12px;padding:24px;margin-bottom:20px;">
      <div style="font-size:32px;margin-bottom:8px;">🛡</div>
      <h1 style="color:#c6a34e;margin:0 0 4px;font-size:20px;">Rapport Sécurité Hebdomadaire</h1>
      <p style="color:#6b7280;margin:0;font-size:13px;">Aureus Social Pro · Semaine du ${stats.weekLabel}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr>${kpis.slice(0,3).map(s => `
        <td style="width:33%;padding:4px;">
          <div style="background:#111;border-radius:8px;padding:14px;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:${s.c};">${s.v}</div>
            <div style="font-size:11px;color:#6b7280;margin-top:4px;">${s.l}</div>
          </div>
        </td>`).join('')}
      </tr>
      <tr>${kpis.slice(3,6).map(s => `
        <td style="width:33%;padding:4px;">
          <div style="background:#111;border-radius:8px;padding:14px;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:${s.c};">${s.v}</div>
            <div style="font-size:11px;color:#6b7280;margin-top:4px;">${s.l}</div>
          </div>
        </td>`).join('')}
      </tr>
    </table>
    ${stats.incidents > 0
      ? `<div style="background:#1a0a0a;border:1px solid #ef4444;border-radius:8px;padding:16px;margin-bottom:16px;">
          <p style="color:#ef4444;margin:0;font-weight:600;">⚠️ ${stats.incidents} incident(s) de sécurité non résolu(s)</p>
          <p style="color:#9ca3af;margin:4px 0 0;font-size:12px;">Consultez Security Pro pour les détails et marquez-les résolus.</p>
        </div>`
      : `<div style="background:#0a1a0a;border:1px solid #22c55e;border-radius:8px;padding:16px;margin-bottom:16px;">
          <p style="color:#22c55e;margin:0;font-weight:600;">✅ Aucun incident de sécurité cette semaine</p>
          <p style="color:#6b7280;margin:4px 0 0;font-size:12px;">Votre infrastructure est sécurisée.</p>
        </div>`}
    <p style="color:#4b5563;font-size:11px;text-align:center;margin:0;">
      Aureus Social Pro · Rapport automatique hebdomadaire · ${new Date().toLocaleString('fr-BE')}
    </p>
  </div></body></html>`;
}

// ── POST : alerte immédiate intrusion ──────────────────────────
export async function POST(request) {
  try {
    const auth = (request.headers.get('authorization') || '').replace('Bearer ', '');
    if (auth !== CRON_SECRET) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    if (!supabase) return Response.json({ error: 'Supabase non configuré' }, { status: 500 });

    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: events } = await supabase
      .from('audit_log')
      .select('action,ip_address,user_email,created_at,details')
      .in('action', ['LOGIN_FAILED', 'BRUTE_FORCE_DETECTED', 'UNAUTHORIZED_ACCESS', 'SUSPICIOUS_ACTIVITY', 'RATE_LIMIT_EXCEEDED'])
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!events || events.length === 0) {
      return Response.json({ sent: false, reason: 'Aucun événement suspect récent' });
    }

    // Anti-spam : pas plus d'une alerte par heure
    const { data: lastAlert } = await supabase
      .from('audit_log')
      .select('created_at')
      .eq('action', 'SECURITY_ALERT_SENT')
      .gte('created_at', new Date(Date.now() - 3600000).toISOString())
      .limit(1);

    if (lastAlert && lastAlert.length > 0) {
      return Response.json({ sent: false, reason: 'Alerte déjà envoyée cette heure' });
    }

    const result = await sendEmail(
      ADMIN_EMAIL,
      `🚨 [Aureus] ${events.length} tentative(s) d'intrusion — Action requise`,
      alertHtml(events)
    );

    await supabase.from('audit_log').insert({
      action: 'SECURITY_ALERT_SENT',
      details: { events_count: events.length, email_to: ADMIN_EMAIL, ok: result.ok },
    }).catch(() => {});

    return Response.json({ sent: true, events: events.length, email: result });
  } catch (e) {
    return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(e.message||"Erreur") }, { status: 500 });
  }
}

// ── GET : rapport hebdomadaire ──────────────────────────────────
export async function GET(request) {
  try {
    const auth = (request.headers.get('authorization') || '').replace('Bearer ', '');
    if (auth !== CRON_SECRET) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    if (!supabase) return Response.json({ error: 'Supabase non configuré' }, { status: 500 });

    const since = new Date(Date.now() - 7 * 24 * 3600000).toISOString();
    const [{ data: allLogs }, { data: incidents }] = await Promise.all([
      supabase.from('audit_log').select('action,ip_address,user_email,created_at').gte('created_at', since),
      supabase.from('security_incidents').select('id').gte('created_at', since).eq('resolved', false),
    ]);

    const logs = allLogs || [];
    const failedLogins = logs.filter(l => l.action === 'LOGIN_FAILED').length;
    const blocked = logs.filter(l => ['BRUTE_FORCE_DETECTED', 'UNAUTHORIZED_ACCESS', 'RATE_LIMIT_EXCEEDED'].includes(l.action)).length;
    const logins = logs.filter(l => l.action === 'LOGIN_SUCCESS').length;
    const uniqueIps = new Set(logs.map(l => l.ip_address).filter(Boolean)).size;
    const incidentCount = incidents?.length || 0;
    const score = Math.max(40, 90 - incidentCount * 10 - Math.min(blocked * 2, 30));
    const weekLabel = new Date(Date.now() - 7 * 24 * 3600000).toLocaleDateString('fr-BE', { day: '2-digit', month: 'long' });

    const result = await sendEmail(
      ADMIN_EMAIL,
      `🛡 Rapport Sécurité Hebdomadaire — Aureus Social Pro`,
      weeklyHtml({ score, blocked, logins, failedLogins, uniqueIps, incidents: incidentCount, backups: 7, weekLabel })
    );

    return Response.json({ sent: true, email: result });
  } catch (e) {
    return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(e.message||"Erreur") }, { status: 500 });
  }
}
