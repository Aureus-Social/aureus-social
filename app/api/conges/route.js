// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — /api/conges
// Workflow demandes de congé : création, lecture, approbation/refus
// ═══════════════════════════════════════════════════════════════
import { sbFromRequest, sbAdmin } from '@/app/lib/supabase-server';
import { triggerWebhook } from '@/app/lib/trigger-webhook';
export const dynamic = 'force-dynamic';

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = 'Aureus Social Pro <noreply@aureussocial.be>';

async function sendNotif(to, subject, html) {
  if (!RESEND_KEY || !to) return;
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
  } catch {}
}

export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const empId = searchParams.get('empId');
  const status = searchParams.get('status');
  let q = db.from('conges').select('*').order('created_at', { ascending: false }).limit(300);
  if (empId) q = q.eq('emp_id', empId);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return Response.json({ error: process.env.NODE_ENV==='production'?'Erreur interne':error.message }, { status: 500 });
  return Response.json({ ok: true, data: data || [] });
}

export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json();
  const { emp_id, emp_name, emp_email, type, date_debut, date_fin, nb_jours, motif, manager_email } = body;
  if (!emp_id || !type || !date_debut || !date_fin) return Response.json({ error: 'emp_id, type, date_debut, date_fin requis' }, { status: 400 });
  const { data, error } = await db.from('conges').insert([{
    emp_id, emp_name: emp_name||'', emp_email: emp_email||null,
    type, date_debut, date_fin, nb_jours: nb_jours||null,
    motif: motif||null, manager_email: manager_email||null,
    status: 'en_attente', created_by: u.id, created_at: new Date().toISOString(),
  }]).select().single();
  if (error) return Response.json({ error: process.env.NODE_ENV==='production'?'Erreur interne':error.message }, { status: 400 });

  // Notifier le manager si email renseigné
  if (manager_email) {
    await sendNotif(manager_email,
      `Demande de congé — ${emp_name||'Travailleur'}`,
      `<div style="font-family:Arial,sans-serif;max-width:600px">
        <div style="background:#0d1117;color:#c6a34e;padding:16px 24px"><b>AUREUS SOCIAL PRO</b></div>
        <div style="padding:20px">
          <h3>Nouvelle demande de congé</h3>
          <p><b>${emp_name||'Un travailleur'}</b> a demandé un congé.</p>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:6px;background:#f9f9f9;font-weight:bold">Type</td><td style="padding:6px">${type}</td></tr>
            <tr><td style="padding:6px;font-weight:bold">Période</td><td style="padding:6px">${date_debut} → ${date_fin}</td></tr>
            ${nb_jours?`<tr><td style="padding:6px;background:#f9f9f9;font-weight:bold">Jours</td><td style="padding:6px;background:#f9f9f9">${nb_jours} jours</td></tr>`:''}
            ${motif?`<tr><td style="padding:6px;font-weight:bold">Motif</td><td style="padding:6px">${motif}</td></tr>`:''}
          </table>
          <p style="color:#666;font-size:11px;margin-top:16px">Connectez-vous à Aureus Social Pro pour approuver ou refuser cette demande.</p>
        </div>
      </div>`
    );
  }
  await sbAdmin()?.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'REQUEST_CONGE', table_name: 'conges', record_id: data.id, created_at: new Date().toISOString() }]);
  return Response.json({ ok: true, data }, { status: 201 });
}

export async function PUT(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json();
  const { id, status, commentaire } = body;
  if (!id || !status) return Response.json({ error: 'id et status requis' }, { status: 400 });
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: 'ID invalide' }, { status: 400 });
  if (!['approuve','refuse','annule'].includes(status)) return Response.json({ error: 'Status invalide' }, { status: 400 });

  const { data: conge } = await db.from('conges').select('*').eq('id', id).single();
  if (!conge) return Response.json({ error: 'Demande introuvable' }, { status: 404 });

  const { data, error } = await db.from('conges').update({
    status, commentaire: commentaire||null,
    validated_by: u.id, validated_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq('id', id).select().single();
  if (error) return Response.json({ error: process.env.NODE_ENV==='production'?'Erreur interne':error.message }, { status: 400 });

  // Notifier le travailleur
  if (conge.emp_email) {
    const approved = status === 'approuve';
    await sendNotif(conge.emp_email,
      `Votre demande de congé a été ${approved?'approuvée':'refusée'}`,
      `<div style="font-family:Arial,sans-serif;max-width:600px">
        <div style="background:#0d1117;color:#c6a34e;padding:16px 24px"><b>AUREUS SOCIAL PRO</b></div>
        <div style="padding:20px">
          <h3 style="color:${approved?'#16a34a':'#dc2626'}">Demande ${approved?'✅ approuvée':'❌ refusée'}</h3>
          <p>Votre demande de congé <b>${conge.type}</b> du <b>${conge.date_debut}</b> au <b>${conge.date_fin}</b> a été ${approved?'approuvée':'refusée'}.</p>
          ${commentaire?`<p><b>Commentaire :</b> ${commentaire}</p>`:''}
        </div>
      </div>`
    );
  }
  await sbAdmin()?.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: `CONGE_${status.toUpperCase()}`, table_name: 'conges', record_id: id, created_at: new Date().toISOString() }]);
  if (status === 'approuve') triggerWebhook(u.id, 'conge.approved', { id, emp: conge.emp_name, type: conge.type, debut: conge.date_debut, fin: conge.date_fin }).catch(()=>{});
  return Response.json({ ok: true, data });
}

export async function DELETE(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: 'ID invalide' }, { status: 400 });
  const { error } = await db.from('conges').delete().eq('id', id);
  if (error) return Response.json({ error: process.env.NODE_ENV==='production'?'Erreur interne':error.message }, { status: 400 });
  return Response.json({ ok: true });
}
