import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Helper: vérifier JWT depuis Authorization header
async function requireAuth(request) {
  const user = await getAuthUser(request);
  if (!user) return null;
  return user;
}

export async function POST(request) {
  try {
    // Auth JWT — si absent, on logue quand même en mode anonyme (pas de 401 qui crée des boucles)
    const user = await requireAuth(request);
    const userId = user?.id || null;

    const { action, table_name, record_id, details } = await request.json();
    if (!action) return Response.json({ error: 'action required' }, { status: 400 });

    // Si pas de supabase ou pas de user, on ignore silencieusement
    if (!supabase || !userId) return Response.json({ success: true, skipped: true });

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    const { error } = await supabase.from('audit_log').insert({
      action,
      table_name: table_name || null,
      record_id: record_id ? String(record_id) : null,
      details: details || null,
      user_id: userId,
      user_email: user?.email || null,
      ip_address: ip,
      user_agent: userAgent.substring(0, 200),
      created_at: new Date().toISOString()
    });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // ✅ Auth JWT obligatoire
    const user = await requireAuth(request);
    if (!user) return Response.json({ error: 'Non autorisé — JWT requis' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const table = searchParams.get('table');
    const userId = searchParams.get('user_id');

    let query = supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 200));

    if (table) query = query.eq('table_name', table);
    // SÉCURITÉ : toujours filtrer par l'utilisateur connecté
    const isAdmin = user.email?.includes('aureus-ia.com') || user.user_metadata?.role === 'admin';
    if (userId && userId !== user.id && isAdmin) {
      query = query.eq('user_id', userId); // admin peut voir logs d'un autre user
    } else {
      query = query.eq('user_id', user.id); // user ne voit que ses propres logs
    }

    const { data, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ logs: data, count: data.length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
