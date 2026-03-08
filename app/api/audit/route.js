import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function POST(request) {
  try {
    const { action, table_name, record_id, details, user_id, user_email } = await request.json();
    if (!action) return Response.json({ error: 'action required' }, { status: 400 });

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';

    const { error } = await supabase.from('audit_log').insert({
      action,
      table_name: table_name || null,
      record_id: record_id ? String(record_id) : null,
      details: details || null,
      user_id: user_id || null,
      user_email: user_email || null,
      ip_address: ip,
      user_agent: userAgent.substring(0, 200),
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('[Audit] Erreur insertion:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
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
    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ logs: data, count: data.length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
