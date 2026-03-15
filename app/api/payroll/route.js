import { sbFromRequest, sbAdmin, checkRole } from '@/app/lib/supabase-server';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'payroll_read'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const empId = searchParams.get('empId');
  const period = searchParams.get('period');
  const limit = parseInt(searchParams.get('limit') || '100');
  let q = db.from('fiches_paie').select('*').order('created_at', { ascending: false }).limit(limit);
  if (empId) q = q.eq('empId', empId);
  if (period) q = q.eq('period', period);
  const { data, error } = await q;
  if (error) return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 500 });
  return Response.json({ ok: true, data, count: data?.length || 0 });
}

export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'payroll_read'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const body = await req.json();
  const records = Array.isArray(body) ? body : [body];
  const toInsert = records.map(r => ({ ...r, created_by: u.id, at: r.at || new Date().toISOString(), created_at: new Date().toISOString() }));
  const { data, error } = await db.from('fiches_paie').insert(toInsert).select();
  if (error) return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 400 });

  // ── Mise à jour agrégat payroll_history ────────────────────────────────
  try {
    const now = new Date();
    const _r0 = toInsert[0] || {};
    const an = _r0.year || _r0.annee || now.getFullYear();
    const mo = _r0.month || _r0.mois || (now.getMonth() + 1);
    const { data: allFiches } = await db.from('fiches_paie')
      .select('*')
      .eq('created_by', u.id)
      .eq('year', an)
      .eq('month', mo);
    if (allFiches?.length) {
      await db.from('payroll_history').upsert([{
        user_id: u.id,
        period: `${an}-${String(mo).padStart(2,'0')}`,
        month: mo, year: an,
        gross: allFiches.reduce((s,f)=>s+parseFloat(f.gross||0),0),
        net: allFiches.reduce((s,f)=>s+parseFloat(f.net||0),0),
        onss_w: allFiches.reduce((s,f)=>s+parseFloat(f.onss_w||0),0),
        onss_e: allFiches.reduce((s,f)=>s+parseFloat(f.onss_e||0),0),
        pp: allFiches.reduce((s,f)=>s+parseFloat(f.pp||0),0),
        cout_empl: allFiches.reduce((s,f)=>s+parseFloat(f.cout_empl||0),0),
      }], { onConflict: 'user_id,year,month' });
    }
  } catch(_e) { /* non bloquant */ }
  await sbAdmin()?.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'GENERATE_PAYSLIP', table_name: 'fiches_paie', created_at: new Date().toISOString() }]);
  return Response.json({ ok: true, data, count: data?.length }, { status: 201 });
}

export async function DELETE(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'payroll_read'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });

  // Valider format UUID pour éviter injections
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (id && !uuidRegex.test(id)) return Response.json({ error: 'ID invalide' }, { status: 400 });
  const { error } = await db.from('fiches_paie').delete().eq('id', id);
  if (error) return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 400 });
  await sbAdmin()?.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'DELETE_PAYSLIP', table_name: 'fiches_paie', record_id: id, created_at: new Date().toISOString() }]);
  return Response.json({ ok: true });
}
