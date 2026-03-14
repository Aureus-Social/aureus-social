import { sbFromRequest, sbAdmin } from '@/app/lib/supabase-server';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const type = searchParams.get('type');
  const mode = searchParams.get('mode') || 'fiches';

  if (mode === 'history') {
    let q = db.from('payroll_history').select('*').order('year',{ascending:false}).order('month',{ascending:false}).limit(24);
    if (year) q = q.eq('year', parseInt(year));
    const { data, error } = await q;
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true, data, count: data?.length || 0 });
  }

  let q = db.from('fiches_paie').select('*').order('year',{ascending:false}).order('month',{ascending:false}).limit(500);
  if (year) q = q.eq('year', parseInt(year));
  if (month) q = q.eq('month', parseInt(month));
  if (type) q = q.eq('employe_type', type);
  const { data, error } = await q;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, data, count: data?.length || 0 });
}

export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json();
  const fiches = Array.isArray(body) ? body : [body];

  const toInsert = fiches.map(f => ({
    created_by: u.id,
    user_id: u.id,
    employe_id: f.employe_id || null,
    employe_nom: f.employe_nom || f.last || f.nom || '',
    employe_prenom: f.employe_prenom || f.first || f.prenom || '',
    employe_niss: f.niss || '',
    employe_type: f.employe_type || f.type || 'employe',
    period: f.period || `${f.year||new Date().getFullYear()}-${String(f.month||new Date().getMonth()+1).padStart(2,'0')}`,
    month: f.month || new Date().getMonth()+1,
    year: f.year || new Date().getFullYear(),
    gross: parseFloat(f.gross||0),
    regime: parseInt(f.regime||100),
    cp: f.cp||'200',
    onss_w: parseFloat(f.onss_w||f.onssW||0),
    onss_e: parseFloat(f.onss_e||f.onssE||0),
    pp: parseFloat(f.pp||0),
    css: parseFloat(f.css||0),
    net: parseFloat(f.net||0),
    cout_empl: parseFloat(f.cout_empl||f.coutEmpl||0),
    onva: parseFloat(f.onva||0),
    cotis_dirigeant: parseFloat(f.cotis_dirigeant||0),
    cheques_repas: parseFloat(f.cheques_repas||0),
    eco_cheques: parseFloat(f.eco_cheques||0),
    autres_primes: parseFloat(f.autres_primes||0),
    statut: f.statut||'calcule',
    notes: f.notes||null,
    at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }));

  const { data, error } = await db.from('fiches_paie').insert(toInsert).select();
  if (error) return Response.json({ error: error.message }, { status: 400 });

  // Mise à jour agrégat mensuel
  const yr = toInsert[0].year; const mo = toInsert[0].month;
  const period = `${yr}-${String(mo).padStart(2,'0')}`;
  const { data: allFiches } = await db.from('fiches_paie').select('*').eq('created_by',u.id).eq('year',yr).eq('month',mo);
  if (allFiches) {
    await db.from('payroll_history').upsert([{
      created_by: u.id, user_id: u.id, period, month: mo, year: yr,
      nb_employes: allFiches.filter(f=>f.employe_type==='employe').length,
      nb_ouvriers: allFiches.filter(f=>f.employe_type==='ouvrier').length,
      nb_dirigeants: allFiches.filter(f=>f.employe_type==='dirigeant').length,
      nb_societes: allFiches.filter(f=>f.employe_type==='societe').length,
      total_brut: allFiches.reduce((s,f)=>s+parseFloat(f.gross||0),0),
      total_net: allFiches.reduce((s,f)=>s+parseFloat(f.net||0),0),
      total_onss_w: allFiches.reduce((s,f)=>s+parseFloat(f.onss_w||0),0),
      total_onss_e: allFiches.reduce((s,f)=>s+parseFloat(f.onss_e||0),0),
      total_pp: allFiches.reduce((s,f)=>s+parseFloat(f.pp||0),0),
      total_cout_empl: allFiches.reduce((s,f)=>s+parseFloat(f.cout_empl||0),0),
    }], { onConflict: 'created_by,period' });
  }

  await sbAdmin()?.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'SAVE_PAYROLL_HISTORY', table_name: 'fiches_paie', created_at: new Date().toISOString() }]);
  return Response.json({ ok: true, data, count: data?.length }, { status: 201 });
}
