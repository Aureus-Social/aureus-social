// AUREUS — ALERTE EMPLOYÉ SANS DIMONA IN
// Cron : chaque jour 08h00 CET
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
  const cutoff24h = new Date(Date.now() - 24 * 3600000).toISOString();
  const cutoff48h = new Date(Date.now() - 48 * 3600000).toISOString();

  // Employés créés dans les dernières 48h (fenêtre de détection)
  const { data: newEmps } = await sb.from('employees')
    .select('id, first_name, last_name, niss, date_entree, created_at, client_id')
    .gte('created_at', cutoff48h)
    .order('created_at', { ascending: false });

  if (!newEmps?.length) return NextResponse.json({ ok:true, checked:0, alerts:0 });

  // Vérifier lesquels ont une Dimona IN
  const { data: dimonas } = await sb.from('dimona_history')
    .select('employee_id, type, created_at')
    .in('employee_id', newEmps.map(e => e.id))
    .eq('type', 'IN');

  const dimonaIds = new Set((dimonas || []).map(d => d.employee_id));
  const sansDimona = newEmps.filter(e => !dimonaIds.has(e.id));

  if (!sansDimona.length) return NextResponse.json({ ok:true, checked: newEmps.length, alerts:0 });

  if (RESEND_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Aureus Alertes RH <noreply@aureus-ia.com>',
        to: [ALERT_EMAIL],
        subject: `🚨 ${sansDimona.length} employé(s) sans Dimona IN — Action requise`,
        html: `<div style="font-family:Arial,sans-serif;max-width:580px;">
          <div style="background:#0d1117;padding:18px 22px;border-radius:8px 8px 0 0;">
            <div style="color:#c6a34e;font-weight:800;font-size:16px;">AUREUS — Alerte Dimona</div>
            <div style="color:#6b7280;font-size:11px;">${new Date().toLocaleDateString('fr-BE')}</div>
          </div>
          <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:14px 22px;">
            <div style="font-weight:700;font-size:15px;color:#dc2626;">🚨 ${sansDimona.length} employé(s) créé(s) sans Dimona IN</div>
            <div style="font-size:12px;color:#7f1d1d;margin-top:4px;">
              La Dimona IN doit être soumise AVANT le premier jour de travail.<br>
              <strong>Amende ONSS : jusqu'à 1.800€ par travailleur non déclaré.</strong>
            </div>
          </div>
          <div style="background:#fff;padding:16px 22px;border:1px solid #e5e7eb;border-top:none;">
            ${sansDimona.map(e => `<div style="padding:10px;border:1px solid #fca5a5;border-radius:6px;margin-bottom:8px;background:#fff5f5;">
              <div style="font-weight:700;">${e.first_name||''} ${e.last_name||'Nom inconnu'}</div>
              <div style="font-size:11px;color:#6b7280;">
                NISS: ${e.niss||'—'} · Créé le: ${new Date(e.created_at).toLocaleDateString('fr-BE')}
                ${e.date_entree ? ` · Entrée: ${e.date_entree}` : ''}
              </div>
            </div>`).join('')}
            <div style="margin-top:12px;padding:10px;background:#dbeafe;border-radius:6px;font-size:12px;color:#1e40af;">
              📋 Aller dans <strong>Déclarations → ONSS & Dimona → Nouvelle Dimona IN</strong>
            </div>
          </div>
          <div style="background:#f9fafb;padding:10px 22px;border-radius:0 0 8px 8px;font-size:10px;color:#9ca3af;">
            <a href="https://app.aureussocial.be" style="color:#c6a34e;">Soumettre Dimona →</a> · Aureus IA SPRL
          </div>
        </div>`
      })
    }).catch(() => {});
  }

  return NextResponse.json({ ok:true, checked: newEmps.length, alerts: sansDimona.length });
}
