import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
import { hasPermission } from '@/app/lib/permissions';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Tables autorisées par rôle pour la restauration
const ROLE_RESTORE = {
  admin:     ['employees','travailleurs','fiches_paie','documents','audit_log','activity_log','app_state','payroll_history','dimona','dmfa','baremes_cp'],
  comptable: ['payroll_history','fiches_paie','documents'],
  rh:        ['employees','travailleurs','documents'],
  commercial:[],
  readonly:  []
};

export async function POST(request) {
  try {
    const { backupData, userRole, dryRun } = await request.json();

    // Vérifier permission
    if (!hasPermission(userRole || 'readonly', 'exporter_donnees')) {
      return Response.json({ error: 'Permission refusée — exporter_donnees requis' }, { status: 403 });
    }

    if (!backupData || !backupData.metadata || !backupData.data) {
      return Response.json({ error: 'Fichier backup invalide — format incorrect' }, { status: 400 });
    }

    const role = userRole || 'readonly';
    const allowedTables = ROLE_RESTORE[role] || [];

    if (allowedTables.length === 0) {
      return Response.json({ error: 'Accès refusé — votre rôle ne permet pas la restauration' }, { status: 403 });
    }

    // Vérification compatibilité de version
    const backupVersion = backupData.metadata.version || '1.0';
    const backupRole = backupData.metadata.role || 'admin';

    // Un RH ne peut pas restaurer un backup Admin
    if (backupRole === 'admin' && role !== 'admin') {
      return Response.json({ error: `Incompatibilité de rôle — backup créé par ${backupRole}, restauration par ${role} impossible` }, { status: 403 });
    }

    const results = [];
    const errors = [];
    let totalRestored = 0;

    // Mode dry-run : vérifier sans restaurer
    if (dryRun) {
      const tables = Object.keys(backupData.data).filter(t => allowedTables.includes(t));
      const totalRecords = tables.reduce((sum, t) => sum + (backupData.data[t]?.length || 0), 0);
      return Response.json({
        ok: true,
        dryRun: true,
        preview: {
          tables: tables.length,
          records: totalRecords,
          tables_detail: tables.map(t => ({ table: t, records: backupData.data[t]?.length || 0 })),
          backup_date: backupData.metadata.generated_at,
          backup_role: backupRole,
          restore_role: role
        }
      });
    }

    // Logger la restauration dans audit_log avant d'exécuter
    await supabase.from('audit_log').insert({
      action: 'RESTORE_INITIATED',
      table_name: 'system',
      details: {
        backup_date: backupData.metadata.generated_at,
        backup_role: backupRole,
        restore_role: role,
        tables: Object.keys(backupData.data).filter(t => allowedTables.includes(t))
      },
      created_at: new Date().toISOString()
    });

    // Restauration atomique table par table
    for (const [table, rows] of Object.entries(backupData.data)) {
      if (!allowedTables.includes(table)) {
        results.push({ table, skipped: true, reason: 'Non autorisé pour ce rôle' });
        continue;
      }
      if (!Array.isArray(rows) || rows.length === 0) {
        results.push({ table, skipped: true, reason: 'Table vide dans le backup' });
        continue;
      }

      try {
        // Upsert par batch de 100 pour éviter les timeouts
        const batchSize = 100;
        let restored = 0;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
          if (error) { errors.push(`${table} batch ${i}: ${error.message}`); break; }
          restored += batch.length;
        }
        results.push({ table, restored, total: rows.length, ok: restored === rows.length });
        totalRestored += restored;
      } catch (e) {
        errors.push(`${table}: ${e.message}`);
        results.push({ table, restored: 0, total: rows.length, ok: false, error: e.message });
      }
    }

    // Logger le résultat
    await supabase.from('audit_log').insert({
      action: errors.length > 0 ? 'RESTORE_PARTIAL' : 'RESTORE_COMPLETE',
      table_name: 'system',
      details: { total_restored: totalRestored, errors, results },
      created_at: new Date().toISOString()
    });

    return Response.json({
      ok: errors.length === 0,
      summary: {
        tables_restored: results.filter(r => r.ok).length,
        records_restored: totalRestored,
        errors: errors.length,
        skipped: results.filter(r => r.skipped).length
      },
      results,
      errors
    });

  } catch (e) {
    console.error('[Restore] Erreur:', e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
