// ═══════════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — API EMPLOYÉS CRUD
// GET    /api/employe/crud          → liste employés (filtrable)
// POST   /api/employe/crud          → créer employé
// PUT    /api/employe/crud          → modifier employé
// DELETE /api/employe/crud?id=...   → archiver employé
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const ALLOWED_ROLES = ['admin', 'secretariat', 'rh_entreprise'];

// Colonnes autorisées à être retournées (éviter exposition données sensibles)
const PUBLIC_FIELDS = [
  'id', 'first', 'last', 'fn', 'ln', 'email', 'phone',
  'niss', 'nationalRegisterNumber', 'birthDate', 'nationality',
  'address', 'postalCode', 'city', 'country',
  'cp', 'cpId', 'statut', 'status', 'status_type',
  'contractType', 'contract', 'startDate', 'endDate',
  'gross', 'brut', 'monthlySalary', 'regime', 'weeklyHours',
  'fonction', 'jobTitle', 'classification', 'anciennete',
  'chequesRepas', 'ecocheques', 'voiture', 'co2', 'valCatalogue', 'ageVehicule',
  'mealVoucherE', 'mealVoucherW', 'fraisBureau', 'fraisKm', 'kmDistance',
  'iban', 'bic', 'bankName',
  'mutuality', 'hasHandicap', 'familySituation', 'dependants',
  'dimonaRef', 'dimonaStatus',
  'companyId', 'clientId',
  'created_at', 'updated_at'
];

function sanitizeEmp(emp) {
  const out = {};
  for (const key of PUBLIC_FIELDS) {
    if (emp[key] !== undefined) out[key] = emp[key];
  }
  return out;
}

// ── GET — Liste des employés ──
export async function GET(request) {
  try {
    const caller = await getAuthUser(request);
    if (!caller) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    if (!ALLOWED_ROLES.includes(caller.role)) return Response.json({ error: 'Rôle insuffisant' }, { status: 403 });
    if (!supabase) return Response.json({ employees: [], total: 0 });

    const { searchParams } = new URL(request.url);
    const status  = searchParams.get('status') || 'active';
    const clientId= searchParams.get('clientId');
    const searchRaw = searchParams.get('search') || '';
    // Sanitize search — enlever caractères spéciaux SQL
    const search = searchRaw.replace(/[%_\\;'"]/g, '').slice(0, 100);
    const page    = parseInt(searchParams.get('page') || '1', 10);
    const limit   = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);

    let query = supabase
      .from('employees')
      .select(PUBLIC_FIELDS.join(', '), { count: 'exact' })
      .eq('created_by', caller.id); // ISOLATION: chaque user voit ses propres employés

    if (status !== 'all') query = query.eq('status', status);
    if (clientId)         query = query.eq('clientId', clientId);
    if (search) {
      query = query.or(
        `first.ilike.%${search}%,last.ilike.%${search}%,fn.ilike.%${search}%,ln.ilike.%${search}%,email.ilike.%${search}%,niss.ilike.%${search}%`
      );
    }

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1).order('last', { ascending: true });

    const { data, error, count } = await query;
    if (error) return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 500 });

    return Response.json({ employees: (data || []).map(sanitizeEmp), total: count || 0, page, limit });
  } catch (e) {
    return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(e.message||"Erreur") }, { status: 500 });
  }
}

// ── POST — Créer un employé ──
export async function POST(request) {
  try {
    const caller = await getAuthUser(request);
    if (!caller) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    if (!ALLOWED_ROLES.includes(caller.role)) return Response.json({ error: 'Rôle insuffisant' }, { status: 403 });
    if (!supabase) return Response.json({ error: 'DB indisponible' }, { status: 503 });

    const body = await request.json();

    // Validation minimale
    if (!body.first && !body.fn) return Response.json({ error: 'Prénom requis' }, { status: 400 });
    if (!body.last && !body.ln)  return Response.json({ error: 'Nom requis' }, { status: 400 });
    if (!body.gross && !body.monthlySalary && !body.brut)
      return Response.json({ error: 'Salaire brut requis' }, { status: 400 });

    const now = new Date().toISOString();
    const emp = {
      ...sanitizeEmp(body),
      status: body.status || 'active',
      created_at: now,
      updated_at: now,
      created_by: caller.id
    };

    // Unicité NISS
    if (emp.niss) {
      const { data: existing } = await supabase
        .from('employees')
        .select('id')
        .eq('niss', emp.niss)
        .neq('status', 'archived')
        .maybeSingle();
      if (existing) return Response.json({ error: `NISS ${emp.niss} déjà enregistré (id: ${existing.id})` }, { status: 409 });
    }

    const { data, error } = await supabase.from('employees').insert(emp).select().single();
    if (error) return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 500 });

    // Audit log
    try {
      await supabase.from('audit_log').insert({
        user_id: caller.id,
        action: 'EMPLOYEE_CREATE',
        details: { empId: data.id, name: `${data.first || data.fn} ${data.last || data.ln}` },
        created_at: now
      });
    } catch (_) {}

    return Response.json({ ok: true, employee: sanitizeEmp(data) }, { status: 201 });
  } catch (e) {
    return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(e.message||"Erreur") }, { status: 500 });
  }
}

// ── PUT — Modifier un employé ──
export async function PUT(request) {
  try {
    const caller = await getAuthUser(request);
    if (!caller) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    if (!ALLOWED_ROLES.includes(caller.role)) return Response.json({ error: 'Rôle insuffisant' }, { status: 403 });
    if (!supabase) return Response.json({ error: 'DB indisponible' }, { status: 503 });

    const body = await request.json();
    if (!body.id) return Response.json({ error: 'ID employé requis' }, { status: 400 });

    const { id, ...updates } = body;
    const cleaned = sanitizeEmp(updates);
    cleaned.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('employees')
      .update(cleaned)
      .eq('id', id)
      .select()
      .single();

    if (error) return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 500 });
    if (!data)  return Response.json({ error: 'Employé non trouvé' }, { status: 404 });

    try {
      await supabase.from('audit_log').insert({
        user_id: caller.id,
        action: 'EMPLOYEE_UPDATE',
        details: { empId: id, fields: Object.keys(cleaned) },
        created_at: new Date().toISOString()
      });
    } catch (_) {}

    return Response.json({ ok: true, employee: sanitizeEmp(data) });
  } catch (e) {
    return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(e.message||"Erreur") }, { status: 500 });
  }
}

// ── DELETE — Archiver un employé (soft delete) ──
export async function DELETE(request) {
  try {
    const caller = await getAuthUser(request);
    if (!caller) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    if (!['admin', 'secretariat'].includes(caller.role))
      return Response.json({ error: 'Seul admin/secretariat peut archiver' }, { status: 403 });
    if (!supabase) return Response.json({ error: 'DB indisponible' }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('employees')
      .update({ status: 'archived', archived_at: now, updated_at: now })
      .eq('id', id)
      .select('id, first, last, fn, ln')
      .single();

    if (error) return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 500 });
    if (!data)  return Response.json({ error: 'Employé non trouvé' }, { status: 404 });

    try {
      await supabase.from('audit_log').insert({
        user_id: caller.id,
        action: 'EMPLOYEE_ARCHIVE',
        details: { empId: id, name: `${data.first || data.fn} ${data.last || data.ln}` },
        created_at: now
      });
    } catch (_) {}

    return Response.json({ ok: true, archived: id });
  } catch (e) {
    return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(e.message||"Erreur") }, { status: 500 });
  }
}
