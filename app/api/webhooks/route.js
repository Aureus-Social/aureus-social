// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — /api/webhooks
// Webhooks sortants HMAC-SHA256 vers les ERP clients
// Events: payroll.generated, dimona.submitted, employee.created,
//         conge.approved, facture.sent
// ═══════════════════════════════════════════════════════════════
import { sbFromRequest, sbAdmin } from '@/app/lib/supabase-server';
import { createHmac } from 'crypto';
export const dynamic = 'force-dynamic';

function signPayload(payload, secret) {
  return createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
}

async function deliverWebhook(endpoint, secret, event, data) {
  const payload = {
    event,
    data,
    timestamp: new Date().toISOString(),
    api_version: 'v1',
  };
  const sig = signPayload(payload, secret);
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Aureus-Signature': `sha256=${sig}`,
        'X-Aureus-Event': event,
        'X-Aureus-Timestamp': payload.timestamp,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });
    return { ok: r.ok, status: r.status };
  } catch (e) {
    return { ok: false, error: process.env.NODE_ENV==='production'?'Erreur livraison':e.message };
  }
}

// GET — lister les webhooks configurés
export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const { data, error } = await db.from('webhooks').select('id,url,events,active,created_at,last_delivery,last_status').order('created_at', { ascending: false });
  if (error) return Response.json({ error: process.env.NODE_ENV==='production'?'Erreur interne':error.message }, { status: 500 });
  return Response.json({ ok: true, data: data || [] });
}

// POST — créer un webhook OU déclencher un event
export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json();

  // Mode trigger: déclencher un event vers tous les webhooks actifs
  if (body.trigger) {
    const { event, data } = body;
    if (!event) return Response.json({ error: 'event requis' }, { status: 400 });
    const { data: hooks } = await db.from('webhooks').select('*').eq('active', true);
    const results = [];
    for (const hook of hooks || []) {
      if (!hook.events.includes(event) && !hook.events.includes('*')) continue;
      const result = await deliverWebhook(hook.url, hook.secret, event, data || {});
      await db.from('webhooks').update({
        last_delivery: new Date().toISOString(),
        last_status: result.ok ? 'success' : 'failed',
        delivery_count: (hook.delivery_count||0) + 1,
      }).eq('id', hook.id);
      results.push({ id: hook.id, url: hook.url, ...result });
    }
    return Response.json({ ok: true, delivered: results.filter(r=>r.ok).length, results });
  }

  // Mode création: enregistrer un nouveau webhook
  const { url, events, secret } = body;
  if (!url || !events?.length) return Response.json({ error: 'url et events[] requis' }, { status: 400 });
  // Valider URL
  try { new URL(url); } catch { return Response.json({ error: 'URL invalide' }, { status: 400 }); }
  // Valider events
  const VALID_EVENTS = ['*','payroll.generated','dimona.submitted','dimona.out','employee.created','employee.updated','employee.deleted','conge.approved','conge.refused','facture.sent','facture.paid','backup.completed'];
  const invalidEvents = events.filter(e => !VALID_EVENTS.includes(e));
  if (invalidEvents.length) return Response.json({ error: `Events invalides: ${invalidEvents.join(', ')}` }, { status: 400 });

  const webhookSecret = secret || createHmac('sha256', 'aureus').update(`${u.id}:${Date.now()}`).digest('hex').slice(0,32);
  const { data, error } = await db.from('webhooks').insert([{
    url, events, secret: webhookSecret, active: true,
    created_by: u.id, created_at: new Date().toISOString(),
    delivery_count: 0,
  }]).select('id,url,events,active,created_at').single();
  if (error) return Response.json({ error: process.env.NODE_ENV==='production'?'Erreur interne':error.message }, { status: 400 });
  await sbAdmin()?.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'CREATE_WEBHOOK', table_name: 'webhooks', record_id: data.id, created_at: new Date().toISOString() }]);
  return Response.json({ ok: true, data: { ...data, secret: webhookSecret }, message: 'Conservez le secret — il ne sera plus affiché' }, { status: 201 });
}

// PUT — activer/désactiver un webhook
export async function PUT(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const { id, active, url, events } = await req.json();
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: 'ID invalide' }, { status: 400 });
  const updates = { updated_at: new Date().toISOString() };
  if (typeof active === 'boolean') updates.active = active;
  if (url) updates.url = url;
  if (events) updates.events = events;
  const { data, error } = await db.from('webhooks').update(updates).eq('id', id).select().single();
  if (error) return Response.json({ error: process.env.NODE_ENV==='production'?'Erreur interne':error.message }, { status: 400 });
  return Response.json({ ok: true, data });
}

// DELETE — supprimer un webhook
export async function DELETE(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: 'ID invalide' }, { status: 400 });
  await db.from('webhooks').delete().eq('id', id);
  return Response.json({ ok: true });
}
