import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';
export const dynamic = 'force-dynamic';
const sb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;

export async function GET(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const db = sb(); if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });
  const { searchParams } = new URL(req.url);
  const empId = searchParams.get('empId');
  const period = searchParams.get('period');
  const limit = parseInt(searchParams.get('limit') || '100');
  let q = db.from('fiches_paie').select('*').order('created_at', { ascending: false }).limit(limit);
  if (empId) q = q.eq('empId', empId);
  if (period) q = q.eq('period', period);
  const { data, error } = await q;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, data, count: data?.length || 0 });
}

export async function POST(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const db = sb(); if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });
  const body = await req.json();
  const records = Array.isArray(body) ? body : [body];
  const toInsert = records.map(r => ({ ...r, created_by: u.id, at: r.at || new Date().toISOString(), created_at: new Date().toISOString() }));
  const { data, error } = await db.from('fiches_paie').insert(toInsert).select();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  await db.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'GENERATE_PAYSLIP', table_name: 'fiches_paie', created_at: new Date().toISOString() }]);
  return Response.json({ ok: true, data, count: data?.length }, { status: 201 });
}

export async function DELETE(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const db = sb(); if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
  const { error } = await db.from('fiches_paie').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  await db.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'DELETE_PAYSLIP', table_name: 'fiches_paie', record_id: id, created_at: new Date().toISOString() }]);
  return Response.json({ ok: true });
}
