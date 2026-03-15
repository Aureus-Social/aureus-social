// AUREUS — CLEANUP EMAIL LOGS + CHECK SSL
// Cron : chaque dimanche 04h30 CET
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const CRON_SECRET   = process.env.CRON_SECRET;
const RESEND_KEY    = process.env.RESEND_API_KEY;
const ALERT_EMAIL   = 'info@aureus-ia.com';
const RETENTION_DAYS = 60;

const DOMAINS_TO_CHECK = [
  'app.aureussocial.be',
  'aureussocial.be',
  'aureus-ia.com',
];

export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const results = { cleanup: {}, ssl: [] };

  // ── 1. CLEANUP EMAIL LOGS ──
  try {
    const cutoff = new Date(now.getTime() - RETENTION_DAYS * 24 * 3600000).toISOString();
    const { data: deleted, error } = await sb.from('email_logs').delete().lt('created_at', cutoff).select('id');
    results.cleanup.email_logs = { deleted: deleted?.length || 0, error: error?.message };
  } catch(e) { results.cleanup.email_logs = { error: e.message }; }

  // ── 2. CLEANUP ERROR LOGS > 30 JOURS ──
  try {
    const cutoff = new Date(now.getTime() - 30 * 24 * 3600000).toISOString();
    const { data: deleted } = await sb.from('error_logs').delete().lt('created_at', cutoff).select('id');
    results.cleanup.error_logs = { deleted: deleted?.length || 0 };
  } catch(e) { results.cleanup.error_logs = { error: e.message }; }

  // ── 3. CHECK SSL — vérifier expiration certificats ──
  const sslAlerts = [];
  for (const domain of DOMAINS_TO_CHECK) {
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 5000);
      const res = await fetch(`https://${domain}`, { signal: ctrl.signal, method: 'HEAD' });
      // Si on arrive ici, le SSL est valide
      results.ssl.push({ domain, ok: true, status: res.status });
    } catch(e) {
      const isSSLError = e.message?.includes('certificate') || e.message?.includes('SSL') || e.message?.includes('CERT');
      results.ssl.push({ domain, ok: !isSSLError, error: isSSLError ? 'Certificat SSL invalide' : null });
      if (isSSLError) sslAlerts.push(domain);
    }
  }

  // ── 4. EMAIL si problème SSL ou gros cleanup ──
  const totalDeleted = (results.cleanup.email_logs?.deleted || 0) + (results.cleanup.error_logs?.deleted || 0);

  if (RESEND_KEY && (sslAlerts.length > 0 || totalDeleted > 0)) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Aureus Maintenance <noreply@aureus-ia.com>',
        to: [ALERT_EMAIL],
        subject: `${sslAlerts.length ? '🚨 ALERTE SSL' : '🧹 Maintenance'} — ${sslAlerts.length ? sslAlerts.join(', ') : `${totalDeleted} logs purgés`}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;">
          <div style="background:#0d1117;padding:16px 20px;border-radius:8px 8px 0 0;">
            <div style="color:#c6a34e;font-weight:800;">AUREUS — Maintenance Dimanche</div>
            <div style="color:#6b7280;font-size:11px;">${now.toLocaleDateString('fr-BE')}</div>
          </div>
          ${sslAlerts.length ? `<div style="background:#fef2f2;border-left:4px solid #ef4444;padding:14px 20px;">
            <div style="font-weight:700;color:#dc2626;">🚨 Problème SSL détecté sur : ${sslAlerts.join(', ')}</div>
            <div style="font-size:12px;color:#7f1d1d;margin-top:4px;">Renouveler immédiatement le certificat SSL sur OVH/Vercel.</div>
          </div>` : ''}
          <div style="background:#fff;padding:14px 20px;border:1px solid #e5e7eb;border-top:none;">
            <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:8px;">🧹 NETTOYAGE</div>
            <div style="font-size:12px;color:#6b7280;">Email logs supprimés (>${RETENTION_DAYS}j) : <strong>${results.cleanup.email_logs?.deleted || 0}</strong></div>
            <div style="font-size:12px;color:#6b7280;">Error logs supprimés (>30j) : <strong>${results.cleanup.error_logs?.deleted || 0}</strong></div>
            <div style="font-size:12px;font-weight:700;color:#374151;margin-top:12px;margin-bottom:8px;">🔒 STATUT SSL</div>
            ${results.ssl.map(s => `<div style="font-size:12px;color:#6b7280;">
              ${s.ok ? '✅' : '❌'} ${s.domain} ${s.error ? `— ${s.error}` : ''}
            </div>`).join('')}
          </div>
          <div style="background:#f9fafb;padding:8px 20px;border-radius:0 0 8px 8px;font-size:10px;color:#9ca3af;">
            Aureus IA SPRL · BE 1028.230.781 · Maintenance auto chaque dimanche
          </div>
        </div>`
      })
    }).catch(() => {});
  }

  return NextResponse.json({ ok:true, ...results, total_deleted: totalDeleted, ssl_alerts: sslAlerts.length });
}
