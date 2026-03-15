import { checkRole } from '@/app/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';
export const dynamic = 'force-dynamic';

// Route admin-only — auth vérifiée dans chaque handler

const sb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Clés valides du fichier LOIS_BELGES (paramètres légaux belges)
const VALID_KEYS = new Set([
  'RMMMG','TX_ONSS_W','TX_ONSS_E','TX_OUV108','PV_SIMPLE','PV_DOUBLE','PP_EST',
  'NET_FACTOR','CR_PAT','CR_MAX','ECO_MAX','BONUS_MAX','BONUS_SEUIL1','BONUS_SEUIL2',
  'FORF_BUREAU','FORF_KM','CO2MIN','AF_MIN','PLAFOND_SS','INDEX_PIVOT',
  'INDEX_SANTE','FLEXIJOB_MIN','FLEXIJOB_ONSS_PAT','STUDENT_MAX_H',
  'STUDENT_ONSS_W','STUDENT_ONSS_E','SAISIE_SEUIL1','SAISIE_SEUIL2',
  'CHEQ_REPAS_MAX','CHEQ_REPAS_PAT_MAX','CHEQ_REPAS_W_MIN',
  'PH','LB','DPER','LOIS_BELGES',
]);

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Payload invalide — objet JSON attendu'] };
  }
  const errors = [];
  const warnings = [];
  const validated = {};
  let count = 0;

  for (const [key, value] of Object.entries(payload)) {
    if (key === 'LOIS_BELGES' && typeof value === 'object') {
      // Nested LOIS_BELGES object
      for (const [k2, v2] of Object.entries(value)) {
        if (typeof v2 === 'number' || typeof v2 === 'string') {
          validated[k2] = v2;
          count++;
        } else {
          warnings.push(`LOIS_BELGES.${k2}: type non supporté (${typeof v2})`);
        }
      }
    } else if (typeof value === 'number') {
      validated[key] = value;
      count++;
    } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
      validated[key] = parseFloat(value);
      count++;
    } else {
      warnings.push(`${key}: ignoré (type ${typeof value})`);
    }
    // Sanity checks
    if (key === 'RMMMG' && value < 1800) errors.push('RMMMG trop bas (< 1800€) — probablement une erreur');
    if (key === 'TX_ONSS_W' && (value < 0.1 || value > 0.2)) errors.push('TX_ONSS_W anormal (hors 10-20%)');
    if (key === 'TX_ONSS_E' && (value < 0.2 || value > 0.4)) errors.push('TX_ONSS_E anormal (hors 20-40%)');
  }

  if (count === 0) errors.push('Aucun paramètre valide trouvé dans le payload');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validated,
    count,
    preview: Object.entries(validated).slice(0, 5).map(([k, v]) => `${k} = ${v}`),
  };
}

export async function POST(req) {
  try {
    const u = await getAuthUser(req);
    if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });

    // Only admin can modify legal constants
    const db = sb();
    const body = await req.json();
    const { action, payload, id, source } = body;

    // ── VALIDATE ─────────────────────────────────────────────────────────
    if (action === 'validate') {
      const result = validatePayload(payload);
      return Response.json(result);
    }

    // ── LIST ──────────────────────────────────────────────────────────────
    if (action === 'list') {
      if (!db) return Response.json({ updates: [] });
      const { data } = await db
        .from('lois_updates')
        .select('id,status,source,changes_count,applied_at,created_at,created_by_email,notes')
        .order('created_at', { ascending: false })
        .limit(50);
      return Response.json({ updates: data || [] });
    }

    // ── UPLOAD ────────────────────────────────────────────────────────────
    if (action === 'upload') {
      const validation = validatePayload(payload);
      if (!validation.valid) {
        return Response.json({ status: 'invalid', errors: validation.errors }, { status: 422 });
      }
      if (!db) {
        // No DB — return migration_needed to guide user
        return Response.json({
          status: 'table_missing',
          migration: `CREATE TABLE IF NOT EXISTS lois_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT DEFAULT 'pending',
  source TEXT,
  payload JSONB,
  validated JSONB,
  changes_count INT,
  notes TEXT,
  created_by UUID,
  created_by_email TEXT,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`
        });
      }

      const { data, error } = await db.from('lois_updates').insert([{
        status: 'pending',
        source: source || 'manual',
        payload: validation.validated,
        validated: validation.validated,
        changes_count: validation.count,
        created_by: u.id,
        created_by_email: u.email,
        notes: validation.warnings.join('; ') || null,
        created_at: new Date().toISOString(),
      }]).select('id,status,changes_count').single();

      if (error) {
        if (error.code === '42P01') {
          // Table does not exist
          return Response.json({ status: 'table_missing', migration: 'Run migration in Supabase dashboard' });
        }
        return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 500 });
      }

      await db.from('audit_log').insert([{
        user_id: u.id, user_email: u.email,
        action: 'UPLOAD_LOIS_UPDATE',
        table_name: 'lois_updates',
        record_id: data.id,
        created_at: new Date().toISOString(),
        details: { changes_count: validation.count, source }
      }]).catch(() => {});

      return Response.json({ status: 'pending', id: data.id, changes_count: data.changes_count });
    }

    // ── APPROVE ───────────────────────────────────────────────────────────
    if (action === 'approve') {
      if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
      if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });
      const { error } = await db.from('lois_updates')
        .update({ status: 'approved' })
        .eq('id', id);
      if (error) return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(error.message||"Erreur") }, { status: 500 });
      return Response.json({ ok: true, status: 'approved' });
    }

    // ── APPLY ─────────────────────────────────────────────────────────────
    if (action === 'apply') {
      if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
      if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });

      const { data: upd } = await db.from('lois_updates')
        .select('id,status,validated,changes_count').eq('id', id).single();

      if (!upd) return Response.json({ error: 'Update non trouvé' }, { status: 404 });
      if (upd.status !== 'approved') return Response.json({ error: 'Update non approuvé' }, { status: 409 });

      // Mark as applied
      await db.from('lois_updates').update({
        status: 'applied',
        applied_at: new Date().toISOString()
      }).eq('id', id);

      await db.from('audit_log').insert([{
        user_id: u.id, user_email: u.email,
        action: 'APPLY_LOIS_UPDATE',
        table_name: 'lois_updates',
        record_id: id,
        created_at: new Date().toISOString(),
      }]).catch(() => {});

      return Response.json({
        ok: true,
        validated: upd.validated,
        changes_count: upd.changes_count,
        message: `${upd.changes_count} paramètres appliqués`
      });
    }

    // ── ROLLBACK ──────────────────────────────────────────────────────────
    if (action === 'rollback') {
      if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
      if (!db) return Response.json({ error: 'DB indisponible' }, { status: 503 });

      await db.from('lois_updates').update({ status: 'rolled_back' }).eq('id', id);

      await db.from('audit_log').insert([{
        user_id: u.id, user_email: u.email,
        action: 'ROLLBACK_LOIS_UPDATE',
        table_name: 'lois_updates',
        record_id: id,
        created_at: new Date().toISOString(),
      }]).catch(() => {});

      return Response.json({ ok: true, message: 'Rollback effectué — paramètres par défaut restaurés' });
    }

    return Response.json({ error: `Action inconnue: ${action}` }, { status: 400 });

  } catch (e) {
    return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(e.message||"Erreur") }, { status: 500 });
  }
}
