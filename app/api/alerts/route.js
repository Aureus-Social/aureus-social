// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — /api/alerts
// Notifications email automatiques sur événements critiques
// Déclenché par cron quotidien + appel manuel depuis SmartOps
// ═══════════════════════════════════════════════════════════════
import { sbFromRequest, sbAdmin } from '@/app/lib/supabase-server';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const RESEND_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const FROM = 'Aureus Social Pro <noreply@aureussocial.be>';

async function sendEmail(to, subject, html) {
  if (!RESEND_KEY || !to) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{'Authorization':`Bearer ${RESEND_KEY}`,'Content-Type':'application/json'},
      body: JSON.stringify({ from: FROM, to: Array.isArray(to)?to:[to], subject, html }),
    });
    return r.ok;
  } catch { return false; }
}

function alertsHtml(alerts, title='Alertes RH') {
  const rows = alerts.map(a=>`
    <tr>
      <td style="padding:8px;background:${a.severity==='critique'?'#fef2f2':a.severity==='warning'?'#fffbeb':'#eff6ff'};border-left:3px solid ${a.severity==='critique'?'#dc2626':a.severity==='warning'?'#d97706':'#2563eb'}">
        <b style="color:${a.severity==='critique'?'#dc2626':a.severity==='warning'?'#d97706':'#2563eb'}">${a.severity.toUpperCase()}</b>
      </td>
      <td style="padding:8px"><b>${a.emp||'—'}</b></td>
      <td style="padding:8px;color:#444">${a.message}</td>
      <td style="padding:8px;color:#888;font-size:11px">${a.action||''}</td>
    </tr>`).join('');

  return `<div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto">
    <div style="background:#0d1117;padding:16px 24px;display:flex;justify-content:space-between;align-items:center">
      <span style="color:#c6a34e;font-weight:800;font-size:16px">AUREUS SOCIAL PRO</span>
      <span style="color:#888;font-size:11px">${new Date().toLocaleDateString('fr-BE')}</span>
    </div>
    <div style="padding:20px;background:#f9f9f9">
      <h2 style="color:#0d1117;margin:0 0 16px">${title}</h2>
      <p style="color:#555;margin-bottom:16px">${alerts.length} alerte(s) détectée(s) sur votre compte.</p>
      <table style="width:100%;border-collapse:collapse;background:#fff">
        <tr style="background:#f3f4f6"><th style="padding:8px;text-align:left">Sévérité</th><th style="padding:8px;text-align:left">Travailleur</th><th style="padding:8px;text-align:left">Alerte</th><th style="padding:8px;text-align:left">Action</th></tr>
        ${rows}
      </table>
    </div>
    <div style="padding:12px 24px;background:#f0f0f0;text-align:center;font-size:10px;color:#999">
      AUREUS IA SPRL · BCE BE 1028.230.781 · Connectez-vous sur app.aureussocial.be pour agir
    </div>
  </div>`;
}

async function generateAlerts(db, userId) {
  const alerts = [];
  const today = new Date();
  const todayStr = today.toISOString().slice(0,10);

  // Charger les employés
  const { data: emps } = await db.from('employees').select('*').limit(500);
  if (!emps?.length) return alerts;

  for (const emp of emps) {
    const name = `${emp.first||emp.fn||''} ${emp.last||emp.ln||''}`.trim() || 'Travailleur';

    // 1. CDD expirant dans 30j
    const endDate = emp.endDate || emp.endD || emp.end_date;
    if (endDate && (emp.contractType==='CDD'||emp.contract==='CDD')) {
      const diffDays = Math.round((new Date(endDate)-today)/(1000*60*60*24));
      if (diffDays >= 0 && diffDays <= 30) {
        alerts.push({ emp: name, severity: diffDays<=7?'critique':'warning',
          message: `CDD expire dans ${diffDays} jour(s) (${endDate})`,
          action: 'Renouveler ou préparer le C4' });
      }
      if (diffDays < 0 && diffDays >= -7) {
        alerts.push({ emp: name, severity: 'critique',
          message: `CDD expiré depuis ${Math.abs(diffDays)} jour(s) !`,
          action: 'Régulariser immédiatement' });
      }
    }

    // 2. NISS manquant
    if (!emp.niss && !emp.NISS) {
      alerts.push({ emp: name, severity: 'critique',
        message: 'NISS manquant — Dimona impossible',
        action: 'Demander le registre national' });
    }

    // 3. Salaire sous RMMMG (2070.48€)
    const brut = emp.monthlySalary || emp.gross || 0;
    if (brut > 0 && brut < 2070.48) {
      alerts.push({ emp: name, severity: 'critique',
        message: `Salaire ${brut.toFixed(2)}€ < RMMMG 2070.48€`,
        action: 'Augmenter le salaire' });
    }

    // 4. Visite médicale à planifier (tous les 2 ans)
    const startDate = emp.startDate || emp.startD || emp.start_date;
    if (startDate) {
      const start = new Date(startDate);
      const monthsIn = (today-start)/(1000*60*60*24*30);
      if (monthsIn >= 23 && monthsIn <= 25) {
        alerts.push({ emp: name, severity: 'info',
          message: 'Visite médicale périodique à planifier (2 ans)',
          action: 'Contacter le SEPP' });
      }
    }

    // 5. IBAN manquant
    if (!emp.iban && !emp.IBAN) {
      alerts.push({ emp: name, severity: 'warning',
        message: 'IBAN manquant — virement salaire impossible',
        action: 'Demander les coordonnées bancaires' });
    }
  }

  return alerts;
}

// GET — déclenché par cron ou appel authentifié
export async function GET(req) {
  const authHeader = req.headers.get('authorization') || '';
  const isCron = authHeader === `Bearer ${CRON_SECRET}`;
  let userId = null;
  let db = null;

  if (isCron) {
    // Mode cron — utiliser service role pour tous les users
    db = sbAdmin();
  } else {
    const { db: userDb, user: u } = await sbFromRequest(req);
    if (!u || !userDb) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    db = userDb; userId = u.id;
  }

  if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const sendEmail = searchParams.get('send') === '1';

  const alerts = await generateAlerts(db, userId);

  if (sendEmail && alerts.length > 0) {
    const adminEmail = process.env.SECURITY_ALERT_EMAIL || 'info@aureus-ia.com';
    await sendEmail(adminEmail,
      `⚠️ ${alerts.filter(a=>a.severity==='critique').length} alertes critiques — Aureus Social Pro`,
      alertsHtml(alerts, `Alertes RH du ${new Date().toLocaleDateString('fr-BE')}`)
    );
  }

  return Response.json({ ok: true, count: alerts.length, alerts, critiques: alerts.filter(a=>a.severity==='critique').length });
}

// POST — envoi d'une alerte personnalisée depuis l'app
export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json();
  const { to, subject, message, type } = body;
  if (!to || !message) return Response.json({ error: 'to et message requis' }, { status: 400 });

  const html = `<div style="font-family:Arial,sans-serif;max-width:600px">
    <div style="background:#0d1117;padding:16px 24px"><span style="color:#c6a34e;font-weight:800">AUREUS SOCIAL PRO</span></div>
    <div style="padding:20px"><h3>${subject||'Notification Aureus'}</h3><p style="color:#444;line-height:1.6">${message}</p></div>
    <div style="padding:10px 24px;background:#f0f0f0;font-size:10px;color:#999;text-align:center">AUREUS IA SPRL · info@aureus-ia.com</div>
  </div>`;

  const sent = await sendEmail(to, subject||'Notification Aureus Social Pro', html);
  if (!sent) return Response.json({ error: 'Envoi email échoué' }, { status: 500 });
  await sbAdmin()?.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'SEND_ALERT', table_name: 'system', created_at: new Date().toISOString(), details: { to, type: type||'custom' } }]);
  return Response.json({ ok: true });
}
