// AUREUS — ALERTE EXPIRATION CONTRATS CDD
// Cron : chaque jour 08h15 CET
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const CRON_SECRET = process.env.CRON_SECRET;
const RESEND_KEY  = process.env.RESEND_API_KEY;
const ALERT_EMAIL = 'info@aureus-ia.com';

export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();

  // Fenêtres d'alerte : J-7, J-3, J-1
  const alerts = [];
  for (const days of [7, 3, 1]) {
    const target = new Date(now.getTime() + days * 24 * 3600000);
    const dateStr = target.toISOString().split('T')[0];

    const { data: cdds } = await sb.from('employees')
      .select('id, first_name, last_name, type_contrat, date_fin_contrat, client_id')
      .eq('type_contrat', 'CDD')
      .eq('date_fin_contrat', dateStr)
      .eq('statut', 'actif');

    for (const emp of cdds || []) {
      alerts.push({ ...emp, daysLeft: days });
    }
  }

  if (!alerts.length) return NextResponse.json({ ok:true, alerts:0 });

  if (RESEND_KEY) {
    const urgent = alerts.filter(a => a.daysLeft <= 1);
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Aureus Alertes RH <noreply@aureus-ia.com>',
        to: [ALERT_EMAIL],
        subject: `${urgent.length ? '🚨' : '⏰'} ${alerts.length} contrat(s) CDD expirant bientôt`,
        html: `<div style="font-family:Arial,sans-serif;max-width:580px;">
          <div style="background:#0d1117;padding:18px 22px;border-radius:8px 8px 0 0;">
            <div style="color:#c6a34e;font-weight:800;font-size:16px;">AUREUS — Expiration Contrats CDD</div>
            <div style="color:#6b7280;font-size:11px;">${now.toLocaleDateString('fr-BE')}</div>
          </div>
          <div style="background:${urgent.length?'#fef2f2':'#fffbeb'};border-left:4px solid ${urgent.length?'#ef4444':'#f59e0b'};padding:14px 22px;">
            <div style="font-weight:700;font-size:15px;color:${urgent.length?'#dc2626':'#92400e'};">
              ${urgent.length ? '🚨' : '⏰'} ${alerts.length} contrat(s) CDD à traiter
            </div>
            <div style="font-size:12px;margin-top:4px;color:#374151;">
              Renouveler, transformer en CDI ou préparer le C4 + Dimona OUT
            </div>
          </div>
          <div style="background:#fff;padding:16px 22px;border:1px solid #e5e7eb;border-top:none;">
            ${alerts.map(e => `<div style="padding:10px 14px;border:1px solid ${e.daysLeft<=1?'#fca5a5':e.daysLeft<=3?'#fde68a':'#e5e7eb'};border-radius:6px;margin-bottom:8px;background:${e.daysLeft<=1?'#fff5f5':e.daysLeft<=3?'#fffbeb':'#f9fafb'};">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                  <div style="font-weight:700;">${e.first_name||''} ${e.last_name||''}</div>
                  <div style="font-size:11px;color:#6b7280;">CDD — Fin : ${e.date_fin_contrat}</div>
                </div>
                <span style="background:${e.daysLeft<=1?'#dc2626':e.daysLeft<=3?'#f97316':'#f59e0b'};color:#fff;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">
                  ${e.daysLeft === 1 ? 'DEMAIN' : `J-${e.daysLeft}`}
                </span>
              </div>
            </div>`).join('')}
            <div style="margin-top:12px;padding:10px;background:#dbeafe;border-radius:6px;font-size:12px;color:#1e40af;">
              📋 Actions : <strong>Employés → Offboarding</strong> (C4 + Dimona OUT) ou <strong>Contrats → Renouvellement CDD</strong>
            </div>
          </div>
          <div style="background:#f9fafb;padding:10px 22px;border-radius:0 0 8px 8px;font-size:10px;color:#9ca3af;">
            <a href="https://app.aureussocial.be" style="color:#c6a34e;">Gérer les contrats →</a> · Aureus IA SPRL
          </div>
        </div>`
      })
    }).catch(() => {});
  }

  return NextResponse.json({ ok:true, alerts: alerts.length });
}
