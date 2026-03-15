import { sbFromRequest, sbAdmin } from '@/app/lib/supabase-server';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const annee = searchParams.get('annee') || searchParams.get('year');
  const mois = searchParams.get('mois') || searchParams.get('month');
  const type = searchParams.get('type');
  const mode = searchParams.get('mode') || 'fiches';

  if (mode === 'history') {
    let q = db.from('payroll_history').select('*').eq('client_id', u.id).order('annee',{ascending:false}).order('mois',{ascending:false}).limit(24);
    if (annee) q = q.eq('annee', parseInt(annee));
    const { data, error } = await q;
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true, data, count: data?.length || 0 });
  }

  let q = db.from('fiches_paie').select('*').order('annee',{ascending:false}).order('mois',{ascending:false}).limit(500);
  if (annee) q = q.eq('annee', parseInt(annee));
  if (mois) q = q.eq('mois', parseInt(mois));
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
  const now = new Date();

  const toInsert = fiches.map(f => ({
    client_id: u.id,
    travailleur_id: f.travailleur_id || null,
    employe_nom: f.employe_nom || f.last || f.nom || '',
    employe_prenom: f.employe_prenom || f.first || f.prenom || '',
    employe_niss: f.niss || f.employe_niss || '',
    employe_type: f.employe_type || f.type || 'employe',
    mois: f.mois || f.month || now.getMonth() + 1,
    annee: f.annee || f.year || now.getFullYear(),
    brut: parseFloat(f.brut || f.gross || 0),
    brut_onss: parseFloat(f.brut_onss || f.brut || f.gross || 0),
    onss_travailleur: parseFloat(f.onss_travailleur || f.onss_w || f.onssW || 0),
    onss_patronale: parseFloat(f.onss_patronale || f.onss_e || f.onssE || 0),
    precompte_pro: parseFloat(f.precompte_pro || f.pp || 0),
    onva: parseFloat(f.onva || 0),
    cotis_dirigeant: parseFloat(f.cotis_dirigeant || 0),
    statut: f.statut || 'calcule',
    notes: f.notes || null,
  }));

  const { data, error } = await db.from('fiches_paie').insert(toInsert).select();
  if (error) return Response.json({ error: error.message }, { status: 400 });

  // Mise à jour agrégat
  const an = toInsert[0].annee;
  const mo = toInsert[0].mois;
  const { data: allFiches } = await db.from('fiches_paie').select('*').eq('client_id', u.id).eq('annee', an).eq('mois', mo);
  if (allFiches) {
    await db.from('payroll_history').upsert([{
      client_id: u.id, mois: mo, annee: an,
      nb_employes: allFiches.filter(f=>f.employe_type==='employe').length,
      nb_ouvriers: allFiches.filter(f=>f.employe_type==='ouvrier').length,
      nb_dirigeants: allFiches.filter(f=>f.employe_type==='dirigeant').length,
      nb_societes: allFiches.filter(f=>f.employe_type==='societe').length,
      total_brut: allFiches.reduce((s,f)=>s+parseFloat(f.brut||0),0),
      total_onss_travailleur: allFiches.reduce((s,f)=>s+parseFloat(f.onss_travailleur||0),0),
      total_onss_patronale: allFiches.reduce((s,f)=>s+parseFloat(f.onss_patronale||0),0),
      total_precompte: allFiches.reduce((s,f)=>s+parseFloat(f.precompte_pro||0),0),
    }], { onConflict: 'client_id,annee,mois' });
  }

  await sbAdmin()?.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'SAVE_PAYROLL_HISTORY', table_name: 'fiches_paie', created_at: new Date().toISOString() }]);
  return Response.json({ ok: true, data, count: data?.length }, { status: 201 });
}
