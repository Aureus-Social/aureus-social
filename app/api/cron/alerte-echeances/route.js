// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — ALERTES ÉCHÉANCES LÉGALES
// Vercel Cron : chaque jour à 07h30 CET (06h30 UTC)
// → DmfA, TVA, MonBEE, Belcotax, Dimona
// → Alerte à J-30, J-14, J-7, J-3, J-1
// ═══════════════════════════════════════════════════════════════
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CRON_SECRET = process.env.CRON_SECRET;
const RESEND_KEY  = process.env.RESEND_API_KEY;
const ALERT_EMAIL = 'info@aureus-ia.com';

// Toutes les échéances légales belges 2026
const ECHEANCES_2026 = [
  { date:'2026-01-31', label:'DmfA T4 2025', cat:'ONSS', urgent:true },
  { date:'2026-02-28', label:'TVA déclaration T4 2025', cat:'TVA' },
  { date:'2026-03-01', label:'Fiches fiscales 281.10 — Belcotax', cat:'FISCAL' },
  { date:'2026-03-31', label:'Listing annuel clients TVA — Intervat', cat:'TVA', urgent:true },
  { date:'2026-04-30', label:'DmfA T1 2026 + TVA T1', cat:'ONSS' },
  { date:'2026-06-01', label:'MonBEE — Deadline prime recrutement', cat:'AIDES', urgent:true },
  { date:'2026-07-31', label:'DmfA T2 2026', cat:'ONSS' },
  { date:'2026-08-26', label:'Mandat Mahis — Dimona/DmfA', cat:'ONSS' },
  { date:'2026-10-31', label:'DmfA T3 2026 + TVA T3', cat:'ONSS' },
  { date:'2026-12-15', label:'Précompte professionnel — déclaration mensuelle', cat:'PP' },
  { date:'2026-12-31', label:'DmfA T4 2026 + bilan annuel', cat:'ONSS' },
  { date:'2027-01-31', label:'DmfA T4 2026', cat:'ONSS' },
  { date:'2027-03-01', label:'Fiches fiscales 281.10 2026 — Belcotax', cat:'FISCAL' },
];

const CAT_COLORS = {
  ONSS:  '#3b82f6',
  TVA:   '#8b5cf6',
  FISCAL:'#f59e0b',
  AIDES: '#10b981',
  PP:    '#ef4444',
};

const ALERT_DAYS = [30, 14, 7, 3, 1];

export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const now = new Date();
  const alerts = [];

  for (const e of ECHEANCES_2026) {
    const d = new Date(e.date);
    const diffDays = Math.ceil((d - now) / (1000 * 3600 * 24));
    if (ALERT_DAYS.includes(diffDays)) {
      alerts.push({ ...e, daysLeft: diffDays });
    }
  }

  if (!alerts.length) return NextResponse.json({ ok:true, alerts:0 });
  if (!RESEND_KEY)    return NextResponse.json({ ok:true, alerts:alerts.length, sent:false });

  const urgents = alerts.filter(a => a.daysLeft <= 7);
  const subject = urgents.length
    ? `🚨 URGENT — ${urgents.length} échéance(s) dans ≤7 jours — Aureus Social Pro`
    : `⏰ Rappel — ${alerts.length} échéance(s) à venir — Aureus Social Pro`;

  await fetch('https://api.resend.com/emails', {
    method:'POST',
    headers:{ 'Authorization':`Bearer ${RESEND_KEY}`, 'Content-Type':'application/json' },
    body: JSON.stringify({
      from: 'Aureus Alertes <noreply@aureus-ia.com>',
      to: [ALERT_EMAIL],
      subject,
      html: `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0d1117;padding:20px 24px;border-radius:8px 8px 0 0;">
          <div style="color:#c6a34e;font-weight:800;font-size:18px;">AUREUS SOCIAL PRO</div>
          <div style="color:#6b7280;font-size:11px;letter-spacing:2px;">ALERTES ECHEANCES LEGALES</div>
        </div>
        <div style="background:#fff;padding:20px 24px;border:1px solid #e5e7eb;border-top:none;">
          ${alerts.map(a => `
          <div style="margin-bottom:12px;padding:14px;border-radius:8px;border:1px solid ${a.daysLeft<=7?'#fca5a5':'#e5e7eb'};background:${a.daysLeft<=7?'#fef2f2':a.daysLeft<=14?'#fffbeb':'#f9fafb'};">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <span style="background:${CAT_COLORS[a.cat]||'#6b7280'};color:#fff;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700;">${a.cat}</span>
                <span style="font-weight:700;font-size:14px;margin-left:8px;">${a.label}</span>
              </div>
              <span style="background:${a.daysLeft<=3?'#dc2626':a.daysLeft<=7?'#f97316':a.daysLeft<=14?'#f59e0b':'#6b7280'};color:#fff;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:700;white-space:nowrap;">
                ${a.daysLeft === 1 ? '🚨 DEMAIN' : `J-${a.daysLeft}`}
              </span>
            </div>
            <div style="font-size:12px;color:#6b7280;margin-top:6px;">
              📅 Échéance : <strong>${new Date(a.date).toLocaleDateString('fr-BE', {weekday:'long',day:'numeric',month:'long',year:'numeric'})}</strong>
            </div>
          </div>`).join('')}
        </div>
        <div style="background:#f9fafb;padding:12px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <a href="https://app.aureussocial.be" style="color:#c6a34e;font-size:12px;font-weight:700;">Accéder à app.aureussocial.be →</a>
          <span style="color:#9ca3af;font-size:10px;margin-left:16px;">Aureus IA SPRL · BE 1028.230.781 · Alerte auto 07h30</span>
        </div>
      </div>`
    })
  }).catch(() => {});

  return NextResponse.json({ ok:true, alerts:alerts.length, urgent:urgents.length });
}
