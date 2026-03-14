import { sbFromRequest, sbAdmin } from '@/app/lib/supabase-server';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  let q = db.from('factures').select('*').order('created_at', { ascending: false }).limit(200);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return Response.json({ error: process.env.NODE_ENV==='production'?'Erreur interne':error.message }, { status: 500 });
  return Response.json({ ok: true, data: data || [], count: data?.length || 0 });
}

export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json();
  const { client_name, client_email, montant, description, echeance, items } = body;
  if (!client_name || !montant) return Response.json({ error: 'client_name et montant requis' }, { status: 400 });
  if (isNaN(parseFloat(montant)) || parseFloat(montant) <= 0) return Response.json({ error: 'Montant invalide' }, { status: 400 });
  const year = new Date().getFullYear();
  const { count } = await db.from('factures').select('*', { count: 'exact', head: true });
  const num = `FAC-${year}-${String((count || 0) + 1).padStart(4, '0')}`;
  const { data, error } = await db.from('factures').insert([{
    numero: num, client_name, client_email: client_email || null,
    montant: parseFloat(montant), description: description || null,
    items: items || null, echeance: echeance || null,
    status: 'brouillon', relances: 0,
    created_by: u.id, created_at: new Date().toISOString(),
  }]).select().single();
  if (error) return Response.json({ error: process.env.NODE_ENV==='production'?'Erreur interne':error.message }, { status: 400 });
  await sbAdmin()?.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'CREATE_FACTURE', table_name: 'factures', record_id: data.id, created_at: new Date().toISOString() }]);
  return Response.json({ ok: true, data }, { status: 201 });
}

export async function PUT(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: 'ID invalide' }, { status: 400 });
  if (updates.montant) updates.montant = parseFloat(updates.montant);
  const { data, error } = await db.from('factures').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) return Response.json({ error: process.env.NODE_ENV==='production'?'Erreur interne':error.message }, { status: 400 });
  return Response.json({ ok: true, data });
}

export async function DELETE(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: 'ID invalide' }, { status: 400 });
  const { error } = await db.from('factures').delete().eq('id', id);
  if (error) return Response.json({ error: process.env.NODE_ENV==='production'?'Erreur interne':error.message }, { status: 400 });
  return Response.json({ ok: true });
}
