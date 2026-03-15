import { sbFromRequest, checkRole } from '@/app/lib/supabase-server';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'admin_only'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const { data, error } = await db.from('clients').select('*').order('created_at', { ascending: false });
  if (error) return Response.json({ error: process.env.NODE_ENV === "production" ? "Erreur interne" : (e || error).message }, { status: 500 });
  return Response.json({ ok: true, data: data || [] });
}

export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'admin_only'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const body = await req.json();
  const { data, error } = await db.from('clients').insert([{
    user_id: u.id,
    nom: body.nom,
    bce: body.bce,
    adresse: body.adresse,
    code_postal: body.code_postal,
    ville: body.ville,
    cp_paritaire: body.cp_paritaire,
    contact_nom: body.contact_nom,
    contact_email: body.contact_email,
    contact_tel: body.contact_tel,
    onss_numero: body.onss_numero,
    secteur: body.secteur,
    logiciel_compta: body.logiciel_compta,
    format_export: body.format_export,
    plan: body.plan || 'trial',
    status: 'active',
    created_at: new Date().toISOString(),
  }]).select().single();
  if (error) return Response.json({ error: process.env.NODE_ENV === "production" ? "Erreur interne" : error.message }, { status: 400 });
  return Response.json({ ok: true, data }, { status: 201 });
}

export async function DELETE(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'admin_only'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
  const { error } = await db.from('clients').update({ status: 'cancelled' }).eq('id', id);
  if (error) return Response.json({ error: process.env.NODE_ENV === "production" ? "Erreur interne" : error.message }, { status: 400 });
  return Response.json({ ok: true });
}
