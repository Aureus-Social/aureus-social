// AUREUS — RAPPORT MENSUEL PAR CLIENT
// Cron : 1er du mois à 08h00 CET
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
  const moisPrec = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const moisPrecFin = new Date(now.getFullYear(), now.getMonth(), 1);
  const moisLabel = moisPrec.toLocaleDateString('fr-BE', { month:'long', year:'numeric' });

  // Fiches du mois précédent
  const { data: fiches } = await sb.from('payroll_history')
    .select('client_id, statut_paiement, created_at')
    .gte('created_at', moisPrec.toISOString())
    .lt('created_at', moisPrecFin.toISOString());

  // Employés actifs
  const { data: employees } = await sb.from('employees')
    .select('id, client_id, statut')
    .eq('statut', 'actif');

  // Clients
  const { data: clients } = await sb.from('clients').select('id, nom, email');

  if (!clients?.length) return NextResponse.json({ ok:true, clients:0 });

  // Stats par client
  const statsParClient = {};
  for (const c of clients) {
    const fichesClient = (fiches || []).filter(f => f.client_id === c.id);
    const empsClient = (employees || []).filter(e => e.client_id === c.id);
    statsParClient[c.id] = {
      nom: c.nom || c.id,
      email: c.email,
      fiches: fichesClient.length,
      fichesPayees: fichesClient.filter(f => f.statut_paiement === 'paye').length,
      fichesImpayees: fichesClient.filter(f => f.statut_paiement !== 'paye').length,
      employes: empsClient.length,
      revenus: fichesClient.filter(f => f.statut_paiement === 'paye').length * 2,
      revenusAttendus: fichesClient.filter(f => f.statut_paiement !== 'paye').length * 2,
    };
  }

  const totalFiches = (fiches||[]).length;
  const totalRevenus = (fiches||[]).filter(f => f.statut_paiement==='paye').length * 2;
  const totalAttendus = (fiches||[]).filter(f => f.statut_paiement!=='paye').length * 2;

  if (RESEND_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Aureus Rapport <noreply@aureus-ia.com>',
        to: [ALERT_EMAIL],
        subject: `📊 Rapport mensuel ${moisLabel} — ${totalFiches} fiches — ${totalRevenus}€ encaissés`,
        html: `<div style="font-family:Arial,sans-serif;max-width:650px;">
          <div style="background:#0d1117;padding:18px 22px;border-radius:8px 8px 0 0;">
            <div style="color:#c6a34e;font-weight:800;font-size:16px;">AUREUS SOCIAL PRO</div>
            <div style="color:#6b7280;font-size:11px;">RAPPORT MENSUEL — ${moisLabel.toUpperCase()}</div>
          </div>
          <!-- Totaux -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;background:#fff;border:1px solid #e5e7eb;border-top:none;">
            <div style="padding:14px;text-align:center;border-right:1px solid #e5e7eb;">
              <div style="font-size:22px;font-weight:800;color:#3b82f6;">${totalFiches}</div>
              <div style="font-size:11px;color:#6b7280;">Fiches générées</div>
            </div>
            <div style="padding:14px;text-align:center;border-right:1px solid #e5e7eb;">
              <div style="font-size:22px;font-weight:800;color:#10b981;">${totalRevenus}€</div>
              <div style="font-size:11px;color:#6b7280;">Encaissés</div>
            </div>
            <div style="padding:14px;text-align:center;">
              <div style="font-size:22px;font-weight:800;color:#f97316;">${totalAttendus}€</div>
              <div style="font-size:11px;color:#6b7280;">À encaisser</div>
            </div>
          </div>
          <!-- Par client -->
          <div style="background:#fff;padding:16px 22px;border:1px solid #e5e7eb;border-top:none;">
            <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:10px;">DÉTAIL PAR CLIENT</div>
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <thead><tr style="background:#f9fafb;">
                <th style="padding:7px 10px;text-align:left;color:#6b7280;">Client</th>
                <th style="padding:7px 10px;text-align:center;color:#6b7280;">Employés</th>
                <th style="padding:7px 10px;text-align:center;color:#6b7280;">Fiches</th>
                <th style="padding:7px 10px;text-align:right;color:#6b7280;">Encaissé</th>
                <th style="padding:7px 10px;text-align:right;color:#6b7280;">À encaisser</th>
              </tr></thead>
              <tbody>
                ${Object.values(statsParClient).filter(c => c.fiches > 0 || c.employes > 0).map(c => `
                <tr style="border-bottom:1px solid #f3f4f6;">
                  <td style="padding:7px 10px;font-weight:600;">${c.nom}</td>
                  <td style="padding:7px 10px;text-align:center;">${c.employes}</td>
                  <td style="padding:7px 10px;text-align:center;">${c.fiches}</td>
                  <td style="padding:7px 10px;text-align:right;color:#10b981;font-weight:700;">${c.revenus}€</td>
                  <td style="padding:7px 10px;text-align:right;color:${c.revenusAttendus>0?'#f97316':'#10b981'};font-weight:700;">${c.revenusAttendus}€</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div style="background:#f9fafb;padding:10px 22px;border-radius:0 0 8px 8px;font-size:10px;color:#9ca3af;">
            <a href="https://app.aureussocial.be" style="color:#c6a34e;">Voir dans l'app →</a> · Aureus IA SPRL · BE 1028.230.781
          </div>
        </div>`
      })
    }).catch(() => {});
  }

  return NextResponse.json({ ok:true, clients: clients.length, fiches: totalFiches, revenus: totalRevenus });
}
