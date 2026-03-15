// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — CLEANUP BACKUPS AUTOMATIQUE
// Vercel Cron : chaque dimanche à 04h00 CET (03h00 UTC)
// → Supprime les backups > 30 jours dans session_backups
// → Garde toujours les 7 derniers backups minimum
// ═══════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CRON_SECRET    = process.env.CRON_SECRET;
const RESEND_KEY     = process.env.RESEND_API_KEY;
const ALERT_EMAIL    = 'info@aureus-ia.com';
const RETENTION_DAYS = 30;
const MIN_KEEP       = 7; // toujours garder au moins 7 backups

export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * 24 * 3600000).toISOString();

  let deleted = 0, kept = 0, errors = [];

  try {
    // Compter le total des backups
    const { data: allBackups } = await sb.from('session_backups')
      .select('id, created_at')
      .order('created_at', { ascending: false });

    const total = allBackups?.length || 0;

    // Ne supprimer que si on garde au moins MIN_KEEP
    if (total > MIN_KEEP) {
      const toDelete = allBackups
        .filter(b => b.created_at < cutoff)
        .slice(0, total - MIN_KEEP); // garder au moins MIN_KEEP

      if (toDelete.length > 0) {
        const ids = toDelete.map(b => b.id);
        const { error } = await sb.from('session_backups').delete().in('id', ids);
        if (error) errors.push(error.message);
        else deleted = ids.length;
      }

      kept = total - deleted;
    } else {
      kept = total;
    }

    // Aussi nettoyer legal_watch_hashes anciens (garder 1 par source = upsert)
    // Rien à faire — la table utilise UNIQUE sur source_id

    // Nettoyer audit_log > 90 jours (doublon avec cron/security mais en sécurité)
    const auditCutoff = new Date(now.getTime() - 90 * 24 * 3600000).toISOString();
    const { error: auditErr } = await sb.from('audit_log').delete().lt('created_at', auditCutoff);
    if (auditErr) errors.push(`audit_log: ${auditErr.message}`);

  } catch(e) { errors.push(e.message); }

  // Email résumé si quelque chose a été supprimé
  if (RESEND_KEY && (deleted > 0 || errors.length > 0)) {
    await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{ 'Authorization':`Bearer ${RESEND_KEY}`, 'Content-Type':'application/json' },
      body: JSON.stringify({
        from: 'Aureus Maintenance <noreply@aureus-ia.com>',
        to: [ALERT_EMAIL],
        subject: `🧹 Cleanup hebdo — ${deleted} backup(s) purgé(s) — Aureus Social Pro`,
        html: `<div style="font-family:Arial,sans-serif;max-width:500px;">
          <div style="background:#0d1117;padding:16px 20px;border-radius:8px 8px 0 0;">
            <div style="color:#c6a34e;font-weight:800;">AUREUS — Nettoyage Automatique</div>
            <div style="color:#6b7280;font-size:11px;">${now.toLocaleDateString('fr-BE')}</div>
          </div>
          <div style="background:#fff;padding:16px 20px;border:1px solid #e5e7eb;border-top:none;">
            <p style="font-size:13px;color:#374151;">
              🗑️ <strong>${deleted}</strong> backup(s) supprimé(s) (> ${RETENTION_DAYS} jours)<br>
              💾 <strong>${kept}</strong> backup(s) conservé(s)<br>
              ${errors.length ? `⚠️ ${errors.length} erreur(s) : ${errors.join(', ')}` : '✅ Aucune erreur'}
            </p>
          </div>
          <div style="background:#f9fafb;padding:8px 20px;border-radius:0 0 8px 8px;font-size:10px;color:#9ca3af;">
            Rétention : ${RETENTION_DAYS} jours · Minimum conservé : ${MIN_KEEP} backups · Aureus IA SPRL
          </div>
        </div>`
      })
    }).catch(() => {});
  }

  return NextResponse.json({ ok:true, deleted, kept, errors: errors.length });
}
