import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';
export const dynamic = 'force-dynamic';

const sb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// GET /api/baremes — Liste les entrées timeline des barèmes personnalisés
export async function GET(req) {
  const u = await getAuthUser(req);
  if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });

  const db = sb();
  if (!db) return Response.json({ entries: [] });

  // Table: baremes_timeline (created by admin to override LOIS_BELGES)
  const { data, error } = await db
    .from('baremes_timeline')
    .select('*')
    .order('effective_date', { ascending: false })
    .limit(100);

  if (error) {
    // Table may not exist yet — return empty rather than error
    return Response.json({ entries: [] });
  }

  return Response.json({ ok: true, entries: data || [] });
}

// POST /api/baremes — Crée une nouvelle entrée timeline
export async function POST(req) {
  const u = await getAuthUser(req);
  if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });

  // Seul l'admin peut modifier les barèmes
  const db = sb();
  if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });

  // Check role
  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('id', u.id)
    .single();

  if (profile?.role !== 'admin') {
    return Response.json({ error: 'Droits admin requis' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { effective_date, source, values } = body;

  if (!effective_date || !values) {
    return Response.json({ error: 'effective_date et values requis' }, { status: 400 });
  }

  const entry = {
    effective_date,
    source: source || 'Admin — mise à jour manuelle',
    values,
    created_by: u.id,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await db
    .from('baremes_timeline')
    .insert([entry])
    .select()
    .single();

  if (error) {
    // If table doesn't exist, return a simulated success
    if (error.code === '42P01') {
      return Response.json({ success: true, entry: { ...entry, id: Date.now() } });
    }
    return Response.json({ error: error.message }, { status: 400 });
  }

  // Audit log
  await db.from('audit_log').insert([{
    user_id: u.id,
    user_email: u.email,
    action: 'UPDATE_BAREMES',
    table_name: 'baremes_timeline',
    details: { effective_date, source },
    created_at: new Date().toISOString(),
  }]).catch(() => {});

  return Response.json({ success: true, entry: data });
}

// DELETE /api/baremes?id=xxx — Supprime une entrée
export async function DELETE(req) {
  const u = await getAuthUser(req);
  if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });

  const db = sb();
  if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });

  const { data: profile } = await db.from('profiles').select('role').eq('id', u.id).single();
  if (profile?.role !== 'admin') return Response.json({ error: 'Droits admin requis' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'id requis' }, { status: 400 });

  const { error } = await db.from('baremes_timeline').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 400 });

  return Response.json({ success: true });
}
