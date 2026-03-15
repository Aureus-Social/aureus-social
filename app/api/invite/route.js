// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — /api/invite
// Invitation automatique des travailleurs au portail employé
// ═══════════════════════════════════════════════════════════════
import { sbFromRequest, sbAdmin, checkRole } from '@/app/lib/supabase-server';
import { createHmac, randomBytes } from 'crypto';
export const dynamic = 'force-dynamic';

const RESEND_KEY = process.env.RESEND_API_KEY;
const APP_URL = 'https://app.aureussocial.be';
const FROM = 'Aureus Social Pro <noreply@aureussocial.be>';
const SECRET = process.env.ENCRYPTION_KEY || 'aureus-invite-secret-2026';

function genToken(empId, email) {
  const payload = `${empId}:${email}:${Date.now()}`;
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex').slice(0,16);
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

async function sendInvite(to, empName, token, coName) {
  if (!RESEND_KEY || !to) return { ok: false, error: 'Config manquante' };
  const inviteUrl = `${APP_URL}?token=${token}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
    <div style="background:#0d1117;padding:20px 28px;display:flex;align-items:center;justify-content:space-between">
      <div><span style="font-size:18px;font-weight:800;color:#c6a34e">AUREUS</span><br/><span style="font-size:10px;color:#888">SOCIAL PRO</span></div>
      <span style="font-size:11px;color:#555">Portail Employé</span>
    </div>
    <div style="padding:28px;background:#f9f9f9">
      <h2 style="color:#0d1117;margin:0 0 8px">Bienvenue sur votre portail, ${empName} 👋</h2>
      <p style="color:#444;font-size:13px;line-height:1.6">${coName||'Votre employeur'} vous invite à accéder à votre espace personnel <b>Aureus Social Pro</b>.</p>
      <p style="color:#444;font-size:13px;line-height:1.6">Vous pouvez y consulter :</p>
      <ul style="color:#444;font-size:13px;line-height:2">
        <li>📄 Vos <b>fiches de paie</b> (téléchargement PDF)</li>
        <li>📝 Vos <b>contrats et documents RH</b></li>
        <li>📊 Vos <b>informations personnelles</b></li>
        <li>🗓️ Vos <b>absences et congés</b></li>
      </ul>
      <div style="text-align:center;margin:28px 0">
        <a href="${inviteUrl}" style="background:#c6a34e;color:#0d1117;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block">
          Accéder à mon portail →
        </a>
      </div>
      <p style="color:#888;font-size:11px;text-align:center">Ce lien est valable 7 jours. Si vous n'avez pas de compte, vous serez guidé pour en créer un.</p>
    </div>
    <div style="padding:12px 28px;background:#f0f0f0;text-align:center;font-size:10px;color:#999">
      AUREUS IA SPRL · BCE BE 1028.230.781 · info@aureus-ia.com
    </div>
  </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{'Authorization':`Bearer ${RESEND_KEY}`,'Content-Type':'application/json'},
      body: JSON.stringify({ from: FROM, to: [to], subject: `Votre accès au portail employé — ${coName||'Aureus Social Pro'}`, html }),
    });
    const data = await r.json();
    return r.ok ? { ok: true, id: data.id } : { ok: false, error: data.message };
  } catch (e) {
    return { ok: false, error: process.env.NODE_ENV==='production'?'Erreur':e.message };
  }
}

export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'admin_only'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const body = await req.json();
  const { emp_id, emp_ids } = body; // Un ou plusieurs employés

  const ids = emp_ids || (emp_id ? [emp_id] : []);
  if (!ids.length) return Response.json({ error: 'emp_id ou emp_ids requis' }, { status: 400 });

  const { data: company } = await db.from('clients').select('name').eq('created_by', u.id).single().catch(()=>({data:null}));
  const coName = company?.name || u.email?.split('@')[0] || 'Votre employeur';

  const results = [];
  for (const id of ids) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) { results.push({id, ok:false, error:'ID invalide'}); continue; }
    const { data: emp } = await db.from('employees').select('id,first,last,fn,ln,email').eq('id', id).single().catch(()=>({data:null}));
    if (!emp) { results.push({id, ok:false, error:'Employé introuvable'}); continue; }
    if (!emp.email) { results.push({id, ok:false, error:'Email manquant'}); continue; }
    const empName = `${emp.first||emp.fn||''} ${emp.last||emp.ln||''}`.trim() || 'Travailleur';
    const token = genToken(emp.id, emp.email);
    const sent = await sendInvite(emp.email, empName, token, coName);
    if (sent.ok) {
      // Enregistrer la date d'invitation
      await db.from('employees').update({ invited_at: new Date().toISOString() }).eq('id', id).catch(()=>{});
      await sbAdmin()?.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'INVITE_EMPLOYEE', table_name: 'employees', record_id: id, created_at: new Date().toISOString() }]);
    }
    results.push({ id, ok: sent.ok, email: emp.email, name: empName, error: sent.error });
  }

  const sent = results.filter(r=>r.ok).length;
  const failed = results.filter(r=>!r.ok).length;
  return Response.json({ ok: true, sent, failed, results }, { status: 200 });
}
