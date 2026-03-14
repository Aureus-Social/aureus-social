import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';
import { hasPermission, getRoleFromUser } from '@/app/lib/permissions';

export const dynamic = 'force-dynamic';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const ROLE_RESTORE = {
  admin:     ['employees','travailleurs','fiches_paie','documents','audit_log','activity_log','app_state','payroll_history','dimona','dmfa','baremes_cp'],
  comptable: ['payroll_history','fiches_paie','documents'],
  rh:        ['employees','travailleurs','documents'],
  commercial:[],
  readonly:  []
};

export async function POST(request) {
  try {
    // ✅ Auth JWT obligatoire — le rôle vient du JWT serveur, pas du client
    const caller = await getAuthUser(request);
    if (!caller) return Response.json({ error: 'Non autorisé — JWT requis' }, { status: 401 });

    // Rôle déterminé côté SERVEUR uniquement
    const role = getRoleFromUser(caller) || caller?.user_metadata?.role || 'readonly';

    if (!hasPermission(role, 'exporter_donnees')) {
      return Response.json({ error: 'Permission refusée — exporter_donnees requis' }, { status: 403 });
    }

    const { backupData, dryRun } = await request.json();

    if (!backupData || !backupData.metadata || !backupData.data) {
      return Response.json({ error: 'Fichier backup invalide — format incorrect' }, { status: 400 });
    }

    const allowedTables = ROLE_RESTORE[role] || [];
    if (allowedTables.length === 0) {
      return Response.json({ error: 'Accès refusé — votre rôle ne permet pas la restauration' }, { status: 403 });
    }

    const backupRole = backupData.metadata.role || 'admin';
    if (backupRole === 'admin' && role !== 'admin') {
      return Response.json({ error: `Incompatibilité de rôle — backup admin, restauration par ${role} impossible` }, { status: 403 });
    }

    if (dryRun) {
      const tables = Object.keys(backupData.data).filter(t => allowedTables.includes(t));
      const totalRecords = tables.reduce((sum, t) => sum + (backupData.data[t]?.length || 0), 0);
      return Response.json({
        ok: true, dryRun: true,
        preview: {
          tables: tables.length, records: totalRecords,
          tables_detail: tables.map(t => ({ table: t, records: backupData.data[t]?.length || 0 })),
          backup_date: backupData.metadata.generated_at,
          restore_role: role
        }
      });
    }

    // Logger avant restauration
    await supabase.from('audit_log').insert({
      action: 'RESTORE_INITIATED',
      table_name: 'system',
      user_id: caller.id,
      user_email: caller.email,
      details: {
        backup_date: backupData.metadata.generated_at,
        restore_role: role,
        tables: Object.keys(backupData.data).filter(t => allowedTables.includes(t))
      },
      created_at: new Date().toISOString()
    });

    const results = [];
    const errors = [];
    let totalRestored = 0;

    for (const [table, rows] of Object.entries(backupData.data)) {
      if (!allowedTables.includes(table)) {
        results.push({ table, skipped: true, reason: 'Non autorisé pour ce rôle' });
        continue;
      }
      if (!Array.isArray(rows) || rows.length === 0) {
        results.push({ table, skipped: true, reason: 'Table vide' });
        continue;
      }
      try {
        let restored = 0;
        // SÉCURITÉ : forcer created_by/user_id sur chaque row pour éviter d'écraser des données d'autres users
        const safeRows = rows.map(r => ({ ...r, created_by: caller.id, user_id: caller.id }));
        for (let i = 0; i < safeRows.length; i += 100) {
          const batch = safeRows.slice(i, i + 100);
          const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
          if (error) { errors.push(`${table}: ${error.message}`); break; }
          restored += batch.length;
        }
        results.push({ table, restored, total: rows.length, ok: restored === rows.length });
        totalRestored += restored;
      } catch (e) {
        errors.push(`${table}: ${e.message}`);
        results.push({ table, restored: 0, total: rows.length, ok: false, error: process.env.NODE_ENV==="production"?"Erreur interne":(e.message||"Erreur") });
      }
    }

    await supabase.from('audit_log').insert({
      action: errors.length > 0 ? 'RESTORE_PARTIAL' : 'RESTORE_COMPLETE',
      table_name: 'system',
      user_id: caller.id,
      user_email: caller.email,
      details: { total_restored: totalRestored, errors, results },
      created_at: new Date().toISOString()
    });

    return Response.json({
      ok: errors.length === 0,
      summary: {
        tables_restored: results.filter(r => r.ok).length,
        records_restored: totalRestored,
        errors: errors.length
      },
      results, errors
    });

  } catch (e) {
    return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(e.message||"Erreur") }, { status: 500 });
  }
}
