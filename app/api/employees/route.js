import { sbFromRequest } from '@/app/lib/supabase-server';

async function encryptField(val) {
  if (!val) return val;
  try {
    const key = process.env.ENCRYPTION_KEY || 'AureusSocialPro2026moussatinourdin';
    const enc = (s) => new TextEncoder().encode(s);
    const keyMat = await crypto.subtle.importKey('raw', enc(key), {name:'PBKDF2'}, false, ['deriveKey']);
    const aesKey = await crypto.subtle.deriveKey(
      {name:'PBKDF2', salt:enc('AureusSocialPro2026'), iterations:100000, hash:'SHA-256'},
      keyMat, {name:'AES-GCM', length:256}, false, ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({name:'AES-GCM', iv}, aesKey, enc(String(val)));
    const b64 = (buf) => Buffer.from(buf).toString('base64');
    return `enc:${b64(iv)}:${b64(ct)}`;
  } catch { return val; }
}

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  // RLS actif + filtre explicite — double protection
  let q = db.from('employees').select('*').order('last', { ascending: true });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, data, count: data?.length || 0 });
}

export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json();
  if (!body.first && !body.fn) return Response.json({ error: 'Prénom requis' }, { status: 400 });
  if (!body.last && !body.ln) return Response.json({ error: 'Nom requis' }, { status: 400 });
  if (body.niss) {
    const digits = String(body.niss).replace(/[.\-\s]/g, '');
    if (!/^\d{11}$/.test(digits)) return Response.json({ error: 'NISS invalide' }, { status: 400 });
  }
  if (body.iban) {
    const iban = String(body.iban).replace(/\s/g,'').toUpperCase();
    if (!/^BE\d{14}$/.test(iban)) return Response.json({ error: 'IBAN belge invalide' }, { status: 400 });
  }
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.email)) {
    return Response.json({ error: 'Email invalide' }, { status: 400 });
  }
  const sec = { ...body };
  if (sec.niss) sec.niss = await encryptField(sec.niss);
  if (sec.iban) sec.iban = await encryptField(sec.iban);
  if (sec.NISS) sec.NISS = await encryptField(sec.NISS);
  const { data, error } = await db.from('employees').insert([{ ...sec, created_by: u.id, created_at: new Date().toISOString() }]).select().single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  // Audit via service role (ne contient pas de données sensibles)
  try {
    const { sbAdmin } = await import('@/app/lib/supabase-server');
    await sbAdmin()?.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'CREATE_EMPLOYEE', table_name: 'employees', record_id: data.id, created_at: new Date().toISOString() }]);
  } catch {}
  return Response.json({ ok: true, data }, { status: 201 });
}

export async function PUT(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });

  // Valider format UUID pour éviter injections
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (id && !uuidRegex.test(id)) return Response.json({ error: 'ID invalide' }, { status: 400 });
  if (updates.niss) updates.niss = await encryptField(updates.niss);
  if (updates.iban) updates.iban = await encryptField(updates.iban);
  if (updates.NISS) updates.NISS = await encryptField(updates.NISS);
  // RLS garantit que l'user ne peut modifier que ses propres employés
  const { data, error } = await db.from('employees').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  try {
    const { sbAdmin } = await import('@/app/lib/supabase-server');
    await sbAdmin()?.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'UPDATE_EMPLOYEE', table_name: 'employees', record_id: id, created_at: new Date().toISOString() }]);
  } catch {}
  return Response.json({ ok: true, data });
}

export async function DELETE(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
  // RLS garantit que l'user ne peut supprimer que ses propres employés
  const { error } = await db.from('employees').update({ status: 'sorti', deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  try {
    const { sbAdmin } = await import('@/app/lib/supabase-server');
    await sbAdmin()?.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'DELETE_EMPLOYEE', table_name: 'employees', record_id: id, created_at: new Date().toISOString() }]);
  } catch {}
  return Response.json({ ok: true });
}
