import { sbFromRequest, sbAdmin, checkRole } from '@/app/lib/supabase-server';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'declarations'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  let q = db.from('declarations').select('*').eq('created_by', u.id).order('created_at', { ascending: false }).limit(200);
  if (type) q = q.eq('type', type);
  const { data, error } = await q;
  if (error) return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 500 });
  return Response.json({ ok: true, data, count: data?.length || 0 });
}

export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'declarations'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const body = await req.json();
  const { type, data: declData, xml, reference } = body;
  if (!type) return Response.json({ error: 'Type requis (dimona|dmfa|belcotax|pp)' }, { status: 400 });
  const ref = reference || `${type.toUpperCase()}-${Date.now()}`;
  const { data, error } = await db.from('declarations').insert([{
    type, reference: ref, status: 'submitted', data: declData || {}, xml: xml || null,
    created_by: u.id, created_at: new Date().toISOString()
  }]).select().single();
  if (error) return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 400 });
  await db.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: `SUBMIT_${type.toUpperCase()}`, table_name: 'declarations', record_id: data.id, created_at: new Date().toISOString() }]);
  return Response.json({ ok: true, data, reference: ref }, { status: 201 });
}
