// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — /api/rapport-mensuel
// Génère et envoie le rapport RH mensuel PDF par email
// Déclenché par cron le 1er du mois ou manuellement
// ═══════════════════════════════════════════════════════════════
import { sbFromRequest, sbAdmin } from '@/app/lib/supabase-server';
export const dynamic = 'force-dynamic';

const RESEND_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const FROM = 'Aureus Social Pro <noreply@aureussocial.be>';

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function genRapportHTML(data, periode) {
  const { emps, fiches, co } = data;
  const actifs = emps.filter(e => e.status === 'active' || !e.status);
  const masseBrut = actifs.reduce((a,e) => a + (e.monthlySalary||e.gross||0), 0);
  const nbCDI = actifs.filter(e => (e.contractType||'CDI') === 'CDI').length;
  const nbCDD = actifs.filter(e => e.contractType === 'CDD').length;
  const nbEtu = actifs.filter(e => e.contractType === 'ETU').length;
  const avecNiss = actifs.filter(e => e.niss).length;
  const sansNiss = actifs.filter(e => !e.niss).length;
  const sousRMMMG = actifs.filter(e => (e.monthlySalary||e.gross||0) > 0 && (e.monthlySalary||e.gross||0) < 2070.48).length;

  const rows = actifs.slice(0,10).map(e => `
    <tr>
      <td style="padding:7px 10px">${e.first||e.fn||''} ${e.last||e.ln||''}</td>
      <td style="padding:7px 10px">${e.contractType||'CDI'}</td>
      <td style="padding:7px 10px">${e.cp||'200'}</td>
      <td style="padding:7px 10px;text-align:right;font-weight:bold;color:${(e.monthlySalary||e.gross||0)<2070.48&&(e.monthlySalary||e.gross||0)>0?'#dc2626':'#111'}">${(e.monthlySalary||e.gross||0).toFixed(2)} €</td>
      <td style="padding:7px 10px;text-align:center">${e.niss?'✅':'❌'}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Rapport mensuel ${periode}</title></head>
<body style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;background:#f9f9f9">
  <div style="background:#0d1117;padding:20px 28px;display:flex;justify-content:space-between;align-items:center">
    <div>
      <span style="font-size:18px;font-weight:800;color:#c6a34e">AUREUS</span>
      <span style="font-size:18px;color:#fff"> SOCIAL PRO</span>
    </div>
    <span style="font-size:11px;color:#888">Rapport mensuel — ${periode}</span>
  </div>

  <div style="padding:24px">
    <h2 style="color:#0d1117;margin:0 0 4px">Rapport RH — ${periode}</h2>
    <p style="color:#666;margin:0 0 20px;font-size:12px">${co?.name||'Votre entreprise'} · Généré automatiquement par Aureus Social Pro</p>

    <!-- KPIs -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
      <tr>
        ${[
          ['Travailleurs actifs', actifs.length, '#2563eb'],
          ['Masse salariale/mois', masseBrut.toFixed(2)+' €', '#16a34a'],
          ['CDI / CDD / Étudiant', `${nbCDI} / ${nbCDD} / ${nbEtu}`, '#c6a34e'],
          ['Alertes NISS', sansNiss > 0 ? sansNiss+' manquant(s)' : '✅ OK', sansNiss>0?'#dc2626':'#16a34a'],
        ].map(([l,v,c]) => `
        <td style="padding:12px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;text-align:center;width:25%">
          <div style="font-size:18px;font-weight:bold;color:${c}">${v}</div>
          <div style="font-size:10px;color:#666;margin-top:4px">${l}</div>
        </td>`).join('')}
      </tr>
    </table>

    ${sousRMMMG > 0 ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;margin-bottom:16px;color:#dc2626;font-size:12px">
      ⚠️ <b>${sousRMMMG} travailleur(s)</b> avec un salaire inférieur au RMMMG (2.070,48 €). Action requise.
    </div>` : ''}

    <!-- Table travailleurs -->
    <h3 style="color:#0d1117;font-size:13px;margin:0 0 8px">Aperçu des travailleurs actifs${actifs.length>10?` (10/${actifs.length})`:''}</h3>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <tr style="background:#f3f4f6">
        <th style="padding:8px 10px;text-align:left;font-size:11px">Nom</th>
        <th style="padding:8px 10px;text-align:left;font-size:11px">Contrat</th>
        <th style="padding:8px 10px;text-align:left;font-size:11px">CP</th>
        <th style="padding:8px 10px;text-align:right;font-size:11px">Brut/mois</th>
        <th style="padding:8px 10px;text-align:center;font-size:11px">NISS</th>
      </tr>
      ${rows}
      ${actifs.length>10?`<tr><td colspan="5" style="padding:8px 10px;text-align:center;font-size:10px;color:#666">... et ${actifs.length-10} autres travailleurs</td></tr>`:''}
    </table>

    <p style="color:#888;font-size:10px;margin-top:20px;border-top:1px solid #e5e7eb;padding-top:12px">
      Ce rapport est généré automatiquement le 1er de chaque mois par Aureus Social Pro.<br>
      AUREUS IA SPRL · BCE BE 1028.230.781 · app.aureussocial.be · info@aureus-ia.com
    </p>
  </div>
</body></html>`;
}

async function sendRapport(to, html, periode) {
  if (!RESEND_KEY || !to) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{'Authorization':`Bearer ${RESEND_KEY}`,'Content-Type':'application/json'},
      body: JSON.stringify({ from: FROM, to: [to], subject: `📊 Rapport RH ${periode} — Aureus Social Pro`, html }),
    });
    return r.ok;
  } catch { return false; }
}

export async function GET(req) {
  const authHeader = req.headers.get('authorization') || '';
  const isCron = authHeader === `Bearer ${CRON_SECRET}`;
  let db, userEmail;

  if (isCron) {
    db = sbAdmin();
    userEmail = process.env.SECURITY_ALERT_EMAIL || 'info@aureus-ia.com';
  } else {
    const res = await sbFromRequest(req);
    if (!res.user) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    db = res.db; userEmail = res.user.email;
  }
  if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });

  const now = new Date();
  const periode = `${MOIS[now.getMonth()]} ${now.getFullYear()}`;

  // Charger les données
  const { data: emps } = await db.from('employees').select('*').limit(500);
  const { data: fiches } = await db.from('fiches_paie').select('*').gte('created_at', new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString()).limit(200);
  const { data: clientData } = await db.from('clients').select('name,company_name').limit(1).single().catch(()=>({data:null}));
  const co = clientData || {};

  const html = genRapportHTML({ emps: emps||[], fiches: fiches||[], co }, periode);

  const { searchParams } = new URL(req.url);
  const sendNow = searchParams.get('send') === '1';

  if (sendNow && userEmail) {
    const sent = await sendRapport(userEmail, html, periode);
    await sbAdmin()?.from('audit_log').insert([{ user_id: 'system', user_email: userEmail, action: 'RAPPORT_MENSUEL_SENT', table_name: 'system', created_at: new Date().toISOString(), details: { periode, sent } }]);
    return Response.json({ ok: true, sent, periode, to: userEmail });
  }

  return Response.json({ ok: true, periode, emps: emps?.length||0, html_preview: html.slice(0, 200) });
}
