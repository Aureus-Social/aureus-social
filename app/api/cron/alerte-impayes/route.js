// AUREUS — ALERTE FICHES IMPAYÉES > 30 JOURS
// Cron : chaque lundi 08h00 CET
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const CRON_SECRET = process.env.CRON_SECRET;
const RESEND_KEY  = process.env.RESEND_API_KEY;
const ALERT_EMAIL = 'info@aureus-ia.com';
const SEUIL_JOURS = 30;
const PRIX_FICHE  = 2;

export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const cutoff = new Date(Date.now() - SEUIL_JOURS * 24 * 3600000).toISOString();

  const { data: impayes } = await sb.from('payroll_history')
    .select('id, nom, prenom, periode, created_at, client_id')
    .neq('statut_paiement', 'paye')
    .lt('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(200);

  if (!impayes?.length) return NextResponse.json({ ok:true, impayes:0 });

  const total = impayes.length * PRIX_FICHE;
  const byClient = {};
  for (const f of impayes) {
    const k = f.client_id || 'inconnu';
    if (!byClient[k]) byClient[k] = [];
    byClient[k].push(f);
  }

  if (RESEND_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Aureus Facturation <noreply@aureus-ia.com>',
        to: [ALERT_EMAIL],
        subject: `💸 ${impayes.length} fiche(s) impayée(s) > ${SEUIL_JOURS}j — ${total}€ à encaisser`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;">
          <div style="background:#0d1117;padding:18px 22px;border-radius:8px 8px 0 0;">
            <div style="color:#c6a34e;font-weight:800;font-size:16px;">AUREUS — Fiches Impayées</div>
            <div style="color:#6b7280;font-size:11px;">${new Date().toLocaleDateString('fr-BE')}</div>
          </div>
          <div style="background:#fef2f2;border-left:4px solid #ef4444;padding:14px 22px;">
            <div style="font-weight:700;font-size:15px;color:#dc2626;">💸 ${impayes.length} fiche(s) non payée(s) depuis plus de ${SEUIL_JOURS} jours</div>
            <div style="font-size:13px;color:#7f1d1d;margin-top:4px;">Montant total à encaisser : <strong>${total}€</strong></div>
          </div>
          <div style="background:#fff;padding:16px 22px;border:1px solid #e5e7eb;border-top:none;">
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead><tr style="background:#f9fafb;">
                <th style="padding:7px 10px;text-align:left;color:#6b7280;">Employé</th>
                <th style="padding:7px 10px;text-align:left;color:#6b7280;">Période</th>
                <th style="padding:7px 10px;text-align:left;color:#6b7280;">Généré le</th>
                <th style="padding:7px 10px;text-align:right;color:#6b7280;">Montant</th>
              </tr></thead>
              <tbody>
                ${impayes.slice(0,20).map(f => `<tr style="border-bottom:1px solid #f3f4f6;">
                  <td style="padding:6px 10px;">${f.prenom||''} ${f.nom||f.client_id||'—'}</td>
                  <td style="padding:6px 10px;color:#6b7280;">${f.periode||'—'}</td>
                  <td style="padding:6px 10px;color:#6b7280;">${new Date(f.created_at).toLocaleDateString('fr-BE')}</td>
                  <td style="padding:6px 10px;text-align:right;color:#dc2626;font-weight:700;">2€</td>
                </tr>`).join('')}
                ${impayes.length > 20 ? `<tr><td colspan="4" style="padding:6px 10px;color:#6b7280;font-style:italic;">... et ${impayes.length-20} autres</td></tr>` : ''}
              </tbody>
              <tfoot><tr style="background:#fef2f2;">
                <td colspan="3" style="padding:8px 10px;font-weight:700;">TOTAL</td>
                <td style="padding:8px 10px;text-align:right;font-weight:800;color:#dc2626;font-size:14px;">${total}€</td>
              </tfoot>
            </table>
          </div>
          <div style="background:#f9fafb;padding:10px 22px;border-radius:0 0 8px 8px;font-size:10px;color:#9ca3af;">
            <a href="https://app.aureussocial.be" style="color:#c6a34e;">Marquer comme payé →</a> · Aureus IA SPRL · BE 1028.230.781
          </div>
        </div>`
      })
    }).catch(() => {});
  }

  return NextResponse.json({ ok:true, impayes: impayes.length, total_eur: total });
}
