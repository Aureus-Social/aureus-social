import { sbFromRequest, sbAdmin, checkRole } from '@/app/lib/supabase-server';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'employees_read'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const { data, error } = await db.from('clients').select('*').order('created_at', { ascending: false });
  if (error) return Response.json({ error: error.message||"Erreur interne" }, { status: 500 });
  return Response.json({ ok: true, data, count: data?.length || 0 });
}

export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'employees_read'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const body = await req.json();
  const { data, error } = await db.from('clients').insert([{ ...body, created_by: u.id, created_at: new Date().toISOString() }]).select().single();
  if (error) return Response.json({ error: error.message||"Erreur interne" }, { status: 400 });
  await sbAdmin()?.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'CREATE_CLIENT', table_name: 'clients', record_id: data.id, created_at: new Date().toISOString() }]);
  return Response.json({ ok: true, data }, { status: 201 });
}

export async function PUT(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'employees_read'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });

  // Valider format UUID pour éviter injections
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (id && !uuidRegex.test(id)) return Response.json({ error: 'ID invalide' }, { status: 400 });
  const { data, error } = await db.from('clients').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) return Response.json({ error: error.message||"Erreur interne" }, { status: 400 });
  return Response.json({ ok: true, data });
}

export async function DELETE(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'employees_read'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
  const { error } = await db.from('clients').delete().eq('id', id);
  if (error) return Response.json({ error: error.message||"Erreur interne" }, { status: 400 });
  return Response.json({ ok: true });
}
