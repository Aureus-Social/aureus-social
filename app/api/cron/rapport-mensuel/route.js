// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Cron rapport mensuel RH
// Génère et envoie un rapport mensuel récapitulatif à chaque client
// Déclenché le 1er de chaque mois à 8h00
// ═══════════════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';

const CRON_SECRET = process.env.CRON_SECRET;
const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = 'Aureus Social Pro <noreply@aureussocial.be>';

function auth(req) {
  const h = req.headers.get('authorization') || '';
  return h === `Bearer ${CRON_SECRET}`;
}

const sb = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

async function sendEmail(to, subject, html) {
  if (!RESEND_KEY || !to) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
    return r.ok;
  } catch { return false; }
}

function buildRapportHtml(client, emps, now) {
  const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const mois = moisNoms[now.getMonth()];
  const annee = now.getFullYear();
  const actifs = emps.filter(e => e.status === 'active' || !e.status);
  const masseBrut = actifs.reduce((a,e) => a + (e.monthlySalary || e.gross || 0), 0);
  const cdd = actifs.filter(e => e.contractType === 'CDD' || e.contrat === 'CDD').length;
  const cdi = actifs.filter(e => !e.contractType || e.contractType === 'CDI').length;
  const alertes = actifs.filter(e => !e.niss || !e.iban || !(e.monthlySalary || e.gross));

  // CDD expirant dans 60j
  const today = now.toISOString().slice(0,10);
  const in60 = new Date(now.getTime() + 60*24*60*60*1000).toISOString().slice(0,10);
  const cddExp = actifs.filter(e => {
    const end = e.endDate || e.endD;
    return end && end >= today && end <= in60;
  });

  const rows = actifs.slice(0,10).map(e => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6">${e.first||e.fn||''} ${e.last||e.ln||''}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6">${e.contractType||e.contrat||'CDI'}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;text-align:right">${(e.monthlySalary||e.gross||0).toFixed(2)} €</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f3f4f6;color:${e.niss?'#16a34a':'#dc2626'}">${e.niss?'✅':'❌ Manquant'}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
  <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto">
    <div style="background:#0d1117;padding:20px 28px;display:flex;justify-content:space-between;align-items:center">
      <div><span style="font-size:18px;font-weight:800;color:#c6a34e">AUREUS SOCIAL PRO</span><br/><span style="font-size:10px;color:#888">Rapport mensuel automatique</span></div>
      <span style="font-size:12px;color:#888">${mois} ${annee}</span>
    </div>
    <div style="padding:24px;background:#f9fafb">
      <h2 style="margin:0 0 4px;color:#111">Rapport RH — ${mois} ${annee}</h2>
      <p style="color:#666;font-size:12px;margin:0 0 20px">${client.name||client.email||'Votre compte'}</p>

      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
        ${[
          ['Effectif actif', actifs.length, '#2563eb'],
          ['Masse brut/mois', masseBrut.toFixed(0)+' €', '#16a34a'],
          ['CDI/CDD', `${cdi}/${cdd}`, '#7c3aed'],
          ['Alertes dossier', alertes.length, alertes.length>0?'#dc2626':'#16a34a'],
        ].map(([l,v,c]) => `<div style="background:#fff;border-radius:8px;padding:14px;text-align:center;border:1px solid #e5e7eb">
          <div style="font-size:20px;font-weight:800;color:${c}">${v}</div>
          <div style="font-size:10px;color:#9ca3af;margin-top:4px">${l}</div>
        </div>`).join('')}
      </div>

      ${actifs.length > 0 ? `
      <h3 style="font-size:13px;color:#374151;margin:0 0 8px">Travailleurs actifs (top 10)</h3>
      <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;font-size:12px;margin-bottom:16px">
        <thead><tr style="background:#f3f4f6">
          <th style="padding:8px;text-align:left">Nom</th>
          <th style="padding:8px;text-align:left">Contrat</th>
          <th style="padding:8px;text-align:right">Brut</th>
          <th style="padding:8px;text-align:left">NISS</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>` : ''}

      ${cddExp.length > 0 ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;margin-bottom:16px">
        <div style="font-weight:700;color:#dc2626;margin-bottom:6px">⚠️ ${cddExp.length} CDD expirant dans 60 jours</div>
        ${cddExp.map(e => `<div style="font-size:11px;color:#991b1b">${e.first||''} ${e.last||''} — ${e.endDate||e.endD}</div>`).join('')}
      </div>` : ''}

      ${alertes.length > 0 ? `
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px">
        <div style="font-weight:700;color:#d97706;margin-bottom:6px">📋 ${alertes.length} dossier(s) incomplet(s)</div>
        ${alertes.slice(0,5).map(e => `<div style="font-size:11px;color:#92400e">${e.first||''} ${e.last||''} — ${[!e.niss&&'NISS manquant',!e.iban&&'IBAN manquant',!(e.monthlySalary||e.gross)&&'Salaire non défini'].filter(Boolean).join(', ')}</div>`).join('')}
      </div>` : ''}
    </div>
    <div style="padding:12px 28px;background:#f0f0f0;text-align:center;font-size:10px;color:#9ca3af">
      AUREUS IA SPRL · BCE BE 1028.230.781 · app.aureussocial.be
    </div>
  </div></body></html>`;
}

export async function GET(req) {
  if (!auth(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (!sb) return NextResponse.json({ error: 'DB indisponible' }, { status: 503 });

  const now = new Date();
  const results = [];

  // Charger tous les clients
  const { data: clients } = await sb.from('clients').select('*').limit(500);
  if (!clients?.length) return NextResponse.json({ ok: true, sent: 0, message: 'Aucun client' });

  for (const client of clients) {
    try {
      // Charger les employés du client
      const { data: emps } = await sb.from('employees').select('*')
        .eq('created_by', client.user_id || client.id).limit(200);

      const to = client.email;
      if (!to) { results.push({ id: client.id, ok: false, reason: 'no_email' }); continue; }

      const html = buildRapportHtml(client, emps || [], now);
      const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
      const subject = `Rapport RH ${moisNoms[now.getMonth()]} ${now.getFullYear()} — ${client.name || 'Aureus Social Pro'}`;
      const sent = await sendEmail(to, subject, html);
      results.push({ id: client.id, name: client.name, ok: sent, email: to });
    } catch(e) {
      results.push({ id: client.id, ok: false, error: process.env.NODE_ENV==='production'?'Erreur':(e.message||'Erreur') });
    }
  }

  const sent = results.filter(r => r.ok).length;
  return NextResponse.json({ ok: true, sent, total: clients.length, results });
}
