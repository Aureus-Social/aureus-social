import { checkRole } from '@/app/lib/supabase-server';
// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — /api/app-state
// Stockage clé-valeur persistant dans Supabase (table app_state)
// Utilisé par : ChecklistClient, préférences UI, brouillons
// GET  /api/app-state?key=xxx  → lire une valeur
// POST /api/app-state          → { key, value } → écrire
// DELETE /api/app-state?key=xx → supprimer
// ═══════════════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

const sb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function GET(req) {
  const u = await getAuthUser(req);
  if (!u) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'authenticated'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const db = sb();
  if (!db) return NextResponse.json({ error: 'DB indisponible' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'key requis' }, { status: 400 });

  // Préfixer par user_id pour isolation
  const scopedKey = `${u.id}:${key}`;
  const { data, error } = await db.from('app_state').select('val, updated_at').eq('key', scopedKey).single();
  if (error || !data) return NextResponse.json({ ok: true, value: null });

  let parsed = data.val;
  try { parsed = typeof data.val === 'string' ? JSON.parse(data.val) : data.val; } catch {}
  return NextResponse.json({ ok: true, value: parsed, updated_at: data.updated_at });
}

export async function POST(req) {
  const u = await getAuthUser(req);
  if (!u) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'authenticated'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const db = sb();
  if (!db) return NextResponse.json({ error: 'DB indisponible' }, { status: 503 });

  const body = await req.json();
  const { key, value } = body;
  if (!key) return NextResponse.json({ error: 'key requis' }, { status: 400 });

  const scopedKey = `${u.id}:${key}`;
  const val = typeof value === 'string' ? value : JSON.stringify(value);

  const { error } = await db.from('app_state').upsert(
    { key: scopedKey, val, updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  );
  if (error) return NextResponse.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 500 });

  // Audit léger
  await db.from('audit_log').insert({
    user_id: u.id, user_email: u.email,
    action: 'APP_STATE_WRITE', table_name: 'app_state',
    details: { key: key.substring(0, 50) },
    created_at: new Date().toISOString()
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const u = await getAuthUser(req);
  if (!u) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'authenticated'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const db = sb();
  if (!db) return NextResponse.json({ error: 'DB indisponible' }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'key requis' }, { status: 400 });

  const scopedKey = `${u.id}:${key}`;
  const { error } = await db.from('app_state').delete().eq('key', scopedKey);
  if (error) return NextResponse.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 500 });
  return NextResponse.json({ ok: true });
}
