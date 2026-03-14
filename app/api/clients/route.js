import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';
export const dynamic = 'force-dynamic';
const sb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;

export async function GET(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const db = sb(); if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });
  // ISOLATION : chaque user ne voit QUE ses propres clients
  const { data, error } = await db.from('clients').select('*').eq('created_by', u.id).order('name', { ascending: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, data, count: data?.length || 0 });
}

export async function POST(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const db = sb(); if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });
  const body = await req.json();
  const { data, error } = await db.from('clients').insert([{ ...body, created_by: u.id, created_at: new Date().toISOString() }]).select().single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  await db.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'CREATE_CLIENT', table_name: 'clients', record_id: data.id, created_at: new Date().toISOString() }]);
  return Response.json({ ok: true, data }, { status: 201 });
}

export async function PUT(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const db = sb(); if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
  // ISOLATION : on ne peut modifier que ses propres clients
  const { data, error } = await db.from('clients').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).eq('created_by', u.id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true, data });
}

export async function DELETE(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const db = sb(); if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
  // ISOLATION : on ne peut supprimer que ses propres clients
  const { error } = await db.from('clients').delete().eq('id', id).eq('created_by', u.id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
