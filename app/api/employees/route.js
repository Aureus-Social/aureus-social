import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';
import { auditLog } from '@/app/lib/audit';

// ── RGPD Art.32 — Chiffrement données sensibles ──
async function encryptField(val) {
  if (!val) return val;
  try {
    const key = process.env.ENCRYPTION_KEY || 'AureusSocialPro2026moussatinourdin';
    const salt = 'AureusSocialPro2026';
    const enc = (s) => new TextEncoder().encode(s);
    const keyMat = await crypto.subtle.importKey('raw', enc(key), {name:'PBKDF2'}, false, ['deriveKey']);
    const aesKey = await crypto.subtle.deriveKey(
      {name:'PBKDF2', salt:enc(salt), iterations:100000, hash:'SHA-256'},
      keyMat, {name:'AES-GCM', length:256}, false, ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({name:'AES-GCM', iv}, aesKey, enc(String(val)));
    const b64 = (buf) => Buffer.from(buf).toString('base64');
    return `enc:${b64(iv)}:${b64(ct)}`;
  } catch { return val; }
}
export const dynamic = 'force-dynamic';
const sb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;

export async function GET(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const db = sb(); if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  let q = db.from('employees').select('*').order('last', { ascending: true });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, data, count: data?.length || 0 });
}

export async function POST(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const db = sb(); if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });
  const body = await req.json();
  // Validation input server-side
  if (!body.first && !body.fn) return Response.json({ error: 'Prénom requis' }, { status: 400 });
  if (!body.last && !body.ln) return Response.json({ error: 'Nom requis' }, { status: 400 });
  if (body.niss) {
    const digits = String(body.niss).replace(/[.\-\s]/g, '');
    if (!/^\d{11}$/.test(digits)) return Response.json({ error: 'NISS invalide (11 chiffres)' }, { status: 400 });
  }
  if (body.iban) {
    const iban = String(body.iban).replace(/\s/g,'').toUpperCase();
    if (!/^BE\d{14}$/.test(iban)) return Response.json({ error: 'IBAN belge invalide (BE + 14 chiffres)' }, { status: 400 });
  }
  if (body.email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.email)) return Response.json({ error: 'Email invalide' }, { status: 400 });
  }
  // Chiffrer NISS et IBAN avant stockage (RGPD Art.32)
  const secureBody = { ...body };
  if (secureBody.niss) secureBody.niss = await encryptField(secureBody.niss);
  if (secureBody.iban) secureBody.iban = await encryptField(secureBody.iban);
  if (secureBody.NISS) secureBody.NISS = await encryptField(secureBody.NISS);
  const { data, error } = await db.from('employees').insert([{ ...secureBody, created_by: u.id, created_at: new Date().toISOString() }]).select().single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  await db.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'CREATE_EMPLOYEE', table_name: 'employees', record_id: data.id, created_at: new Date().toISOString() }]);
  return Response.json({ ok: true, data }, { status: 201 });
}

export async function PUT(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const db = sb(); if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
  // Chiffrer NISS et IBAN avant mise à jour (RGPD Art.32)
  if (updates.niss) updates.niss = await encryptField(updates.niss);
  if (updates.iban) updates.iban = await encryptField(updates.iban);
  if (updates.NISS) updates.NISS = await encryptField(updates.NISS);
  const { data, error } = await db.from('employees').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  await db.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'UPDATE_EMPLOYEE', table_name: 'employees', record_id: id, created_at: new Date().toISOString() }]);
  return Response.json({ ok: true, data });
}

export async function DELETE(req) {
  const u = await getAuthUser(req); if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const db = sb(); if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
  const { error } = await db.from('employees').update({ status: 'sorti', deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  await db.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: 'DELETE_EMPLOYEE', table_name: 'employees', record_id: id, created_at: new Date().toISOString() }]);
  return Response.json({ ok: true });
}
