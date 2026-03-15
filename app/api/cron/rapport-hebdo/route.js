// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — RAPPORT HEBDOMADAIRE
// Vercel Cron : chaque lundi à 07h00 CET (06h00 UTC)
// → Fiches générées, revenus à encaisser, alertes RH, échéances
// ═══════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const CRON_SECRET = process.env.CRON_SECRET;
const RESEND_KEY  = process.env.RESEND_API_KEY;
const ALERT_EMAIL = 'info@aureus-ia.com';

export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const lundi = new Date(now); lundi.setDate(now.getDate() - 7);
  const lundiStr = lundi.toISOString();
  const dateStr = now.toLocaleDateString('fr-BE', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  // ── Stats semaine ──
  const stats = { fiches:0, fichesPayees:0, fichesImpayees:0, revenus:0, revenusAttendus:0, employees:0, absences:0, conges:0, clients:0 };

  try {
    // Fiches de paie générées cette semaine
    const { data: fiches } = await sb.from('payroll_history').select('statut_paiement').gte('created_at', lundiStr);
    stats.fiches = fiches?.length || 0;
    stats.fichesPayees = fiches?.filter(f => f.statut_paiement === 'paye').length || 0;
    stats.fichesImpayees = stats.fiches - stats.fichesPayees;
    stats.revenus = stats.fichesPayees * 2;
    stats.revenusAttendus = stats.fichesImpayees * 2;

    // Total fiches impayées (toutes périodes)
    const { data: allImpaye } = await sb.from('payroll_history').select('id', { count:'exact' }).neq('statut_paiement','paye');
    stats.totalImpaye = (allImpaye?.length || 0) * 2;

    // Employés actifs
    const { data: emps } = await sb.from('employees').select('id', { count:'exact' }).eq('statut','actif');
    stats.employees = emps?.length || 0;

    // Absences cette semaine
    const { data: abs } = await sb.from('absences').select('id').gte('created_at', lundiStr);
    stats.absences = abs?.length || 0;

    // Demandes congés en attente
    const { data: cng } = await sb.from('conges').select('id').eq('statut','pending');
    stats.conges = cng?.length || 0;

    // Clients actifs
    const { data: cli } = await sb.from('clients').select('id', { count:'exact' });
    stats.clients = cli?.length || 0;
  } catch(_) {}

  // ── Prochaines échéances (30 prochains jours) ──
  const echeances = getEcheances(now);

  if (!RESEND_KEY) return NextResponse.json({ ok:true, stats, echeances });

  await fetch('https://api.resend.com/emails', {
    method:'POST',
    headers:{ 'Authorization':`Bearer ${RESEND_KEY}`, 'Content-Type':'application/json' },
    body: JSON.stringify({
      from: 'Aureus Social Pro <noreply@aureus-ia.com>',
      to: [ALERT_EMAIL],
      subject: `📊 Rapport hebdo Aureus — Semaine du ${lundi.toLocaleDateString('fr-BE')}`,
      html: `<div style="font-family:Inter,Arial,sans-serif;max-width:620px;margin:0 auto;">
        <div style="background:#0d1117;padding:20px 24px;border-radius:8px 8px 0 0;">
          <div style="color:#c6a34e;font-weight:800;font-size:18px;letter-spacing:1px;">AUREUS SOCIAL PRO</div>
          <div style="color:#6b7280;font-size:11px;letter-spacing:2px;">RAPPORT HEBDOMADAIRE — ${dateStr.toUpperCase()}</div>
        </div>

        <!-- KPIs -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;background:#fff;border:1px solid #e5e7eb;border-top:none;">
          ${[
            { icon:'📄', label:'Fiches semaine', value:stats.fiches, color:'#3b82f6' },
            { icon:'✅', label:'Revenus encaissés', value:`${stats.revenus}€`, color:'#10b981' },
            { icon:'🟠', label:'À encaisser (total)', value:`${stats.totalImpaye}€`, color:'#f97316' },
          ].map(k => `<div style="padding:16px;text-align:center;border-right:1px solid #e5e7eb;">
            <div style="font-size:22px;">${k.icon}</div>
            <div style="font-size:20px;font-weight:800;color:${k.color};margin:4px 0;">${k.value}</div>
            <div style="font-size:11px;color:#6b7280;">${k.label}</div>
          </div>`).join('')}
        </div>

        <!-- Stats RH -->
        <div style="background:#f9fafb;padding:16px 24px;border:1px solid #e5e7eb;border-top:none;">
          <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:10px;">RESSOURCES HUMAINES</div>
          <div style="display:flex;gap:24px;flex-wrap:wrap;">
            ${[
              { label:'Employés actifs', value:stats.employees, icon:'👥' },
              { label:'Absences cette semaine', value:stats.absences, icon:'🏥' },
              { label:'Congés en attente', value:stats.conges, icon:'✅', alert: stats.conges > 0 },
              { label:'Clients actifs', value:stats.clients, icon:'🏢' },
            ].map(s => `<div style="background:#fff;border:1px solid ${s.alert?'#f97316':'#e5e7eb'};border-radius:6px;padding:10px 14px;min-width:120px;">
              <div style="font-size:16px;">${s.icon}</div>
              <div style="font-size:18px;font-weight:700;color:${s.alert?'#f97316':'#111'};">${s.value}</div>
              <div style="font-size:11px;color:#6b7280;">${s.label}</div>
            </div>`).join('')}
          </div>
        </div>

        <!-- Échéances -->
        ${echeances.length ? `<div style="background:#fff;padding:16px 24px;border:1px solid #e5e7eb;border-top:none;">
          <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:10px;">PROCHAINES ECHEANCES (30 JOURS)</div>
          ${echeances.map(e => `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #f3f4f6;">
            <span style="background:${e.urgent?'#fef2f2':'#fffbeb'};color:${e.urgent?'#dc2626':'#92400e'};border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;white-space:nowrap;">${e.date}</span>
            <span style="font-size:13px;">${e.label}</span>
            ${e.urgent?'<span style="color:#dc2626;font-size:11px;font-weight:700;">⚠️ URGENT</span>':''}
          </div>`).join('')}
        </div>` : ''}

        <div style="background:#0d1117;padding:12px 24px;border-radius:0 0 8px 8px;font-size:10px;color:#4b5563;">
          Aureus IA SPRL · BCE BE 1028.230.781 · Rapport automatique chaque lundi 07h00
          · <a href="https://app.aureussocial.be" style="color:#c6a34e;">app.aureussocial.be</a>
        </div>
      </div>`
    })
  }).catch(() => {});

  return NextResponse.json({ ok:true, stats, echeances: echeances.length });
}

function getEcheances(now) {
  const result = [];
  const in30 = new Date(now.getTime() + 30 * 24 * 3600000);

  const fixed = [
    { month:1,  day:31, label:'DmfA T4 — déclaration trimestrielle ONSS' },
    { month:2,  day:28, label:'TVA T4 — déclaration TVA trimestrielle' },
    { month:3,  day:1,  label:'Fiches fiscales 281.10 — Belcotax' },
    { month:3,  day:31, label:'Listing annuel clients TVA — Intervat' },
    { month:4,  day:30, label:'DmfA T1 + TVA T1' },
    { month:6,  day:1,  label:'MonBEE — deadline prime recrutement ⚠️' },
    { month:7,  day:31, label:'DmfA T2' },
    { month:10, day:31, label:'DmfA T3 + TVA T3' },
    { month:12, day:31, label:'DmfA T4 + bilan annuel' },
  ];

  for (const e of fixed) {
    const d = new Date(now.getFullYear(), e.month - 1, e.day);
    if (d < now) d.setFullYear(now.getFullYear() + 1);
    if (d <= in30) {
      const diffDays = Math.ceil((d - now) / (1000 * 3600 * 24));
      result.push({
        date: d.toLocaleDateString('fr-BE', { day:'2-digit', month:'short' }),
        label: e.label,
        urgent: diffDays <= 7,
        days: diffDays
      });
    }
  }

  return result.sort((a, b) => a.days - b.days);
}
