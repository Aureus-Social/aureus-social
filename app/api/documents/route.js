import { sbFromRequest, sbAdmin } from '@/app/lib/supabase-server';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const empId = searchParams.get('empId');
  const type = searchParams.get('type');
  let q = db.from('documents').select('*').eq('created_by', u.id).order('created_at', { ascending: false }).limit(500);
  if (empId) q = q.eq('employee_id', empId);
  if (type) q = q.eq('type', type);
  const { data, error } = await q;
  if (error) return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 500 });
  return Response.json({ ok: true, data: data || [], count: data?.length || 0 });
}

export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json();
  const { data, error } = await db.from('documents').insert([{ ...body, created_by: u.id, created_at: new Date().toISOString() }]).select().single();
  if (error) return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 400 });
  await db.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'CREATE_DOCUMENT', table_name: 'documents', record_id: data.id, created_at: new Date().toISOString() }]);
  return Response.json({ ok: true, data }, { status: 201 });
}

export async function DELETE(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });

  // Valider format UUID pour éviter injections
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (id && !uuidRegex.test(id)) return Response.json({ error: 'ID invalide' }, { status: 400 });
  const { error } = await db.from('documents').delete().eq('id', id).eq('created_by', u.id);
  if (error) return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 400 });
  return Response.json({ ok: true });
}
