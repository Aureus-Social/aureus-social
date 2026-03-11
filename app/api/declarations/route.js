import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';
export const dynamic = 'force-dynamic';
const sb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;

export async function GET(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const db = sb(); if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  let q = db.from('declarations').select('*').order('created_at', { ascending: false }).limit(200);
  if (type) q = q.eq('type', type);
  const { data, error } = await q;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, data, count: data?.length || 0 });
}

export async function POST(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const db = sb(); if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });
  const body = await req.json();
  const { type, data: declData, xml, reference } = body;
  if (!type) return Response.json({ error: 'Type requis (dimona|dmfa|belcotax|pp)' }, { status: 400 });
  const ref = reference || `${type.toUpperCase()}-${Date.now()}`;
  const { data, error } = await db.from('declarations').insert([{
    type, reference: ref, status: 'submitted', data: declData || {}, xml: xml || null,
    created_by: u.id, created_at: new Date().toISOString()
  }]).select().single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  await db.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: `SUBMIT_${type.toUpperCase()}`, table_name: 'declarations', record_id: data.id, created_at: new Date().toISOString() }]);
  return Response.json({ ok: true, data, reference: ref }, { status: 201 });
}
