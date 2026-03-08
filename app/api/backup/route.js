import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Tables accessibles par rôle
const ROLE_TABLES = {
  admin:      ['employees','travailleurs','fiches_paie','documents','audit_log','activity_log','app_state','payroll_history','dimona','dmfa','baremes_cp'],
  comptable:  ['payroll_history','fiches_paie','documents','baremes_cp'],
  rh:         ['employees','travailleurs','documents','activity_log'],
  commercial: ['documents','app_state'],
  readonly:   [] // pas de backup
};

function detectRole(user) {
  if (!user) return 'readonly';
  const email = (user.email || '').toLowerCase();
  const meta = user.user_metadata || {};
  const role = (meta.role || meta.rôle || '').toLowerCase();
  if (role === 'admin' || email.includes('admin') || email.includes('nourdin') || email.includes('aureus-ia')) return 'admin';
  if (role === 'comptable' || email.includes('comptable') || email.includes('fiduciaire')) return 'comptable';
  if (role === 'rh' || email.includes('rh') || email.includes('hr')) return 'rh';
  if (role === 'commercial' || email.includes('commercial') || email.includes('sales')) return 'commercial';
  return 'readonly';
}

export async function POST(request) {
  try {
    const { action, email, userEmail, userRole } = await request.json();

    // Déterminer le rôle
    const role = userRole || detectRole({ email: userEmail });
    const tables = ROLE_TABLES[role] || [];

    if (tables.length === 0) {
      return Response.json({ error: 'Accès refusé — votre rôle ne permet pas le backup' }, { status: 403 });
    }

    // Récupérer les données selon le rôle
    const backupData = {};
    const errors = [];

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*');
        if (error) errors.push(`${table}: ${error.message}`);
        else backupData[table] = data || [];
      } catch (e) {
        errors.push(`${table}: ${e.message}`);
      }
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g,'h').substring(0,5);
    const filename = `aureus-backup-${role}-${dateStr}-${timeStr}.json`;

    const backupPayload = {
      metadata: {
        generated_at: now.toISOString(),
        project: 'Aureus Social Pro',
        version: '2.0',
        role,
        tables_backed_up: Object.keys(backupData).length,
        total_records: Object.values(backupData).reduce((sum, arr) => sum + arr.length, 0),
        errors
      },
      data: backupData
    };

    const jsonContent = JSON.stringify(backupPayload, null, 2);
    const totalRecords = backupPayload.metadata.total_records;

    // Backup silencieux — persister dans Supabase sans email ni download
    if (action === 'silent') {
      await supabase.from('app_state').upsert({
        key: 'last_backup_' + (role),
        value: JSON.stringify({ timestamp: now.toISOString(), records: totalRecords, tables: Object.keys(backupData).length }),
        updated_at: now.toISOString()
      }, { onConflict: 'key' }).catch(() => {});
      return new Response(jsonContent, {
        headers: {
          'Content-Type': 'application/json',
          'X-Backup-Role': role,
          'X-Backup-Records': String(totalRecords),
        },
      });
    }

    // Envoyer email
    if (action === 'email' || action === 'both') {
      const roleLabel = { admin:'Administrateur', comptable:'Comptable', rh:'Ressources Humaines', commercial:'Commercial', readonly:'Lecture seule' }[role] || role;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Aureus Social Pro <noreply@aureussocial.be>',
          to: [email || 'info@aureus-ia.com'],
          subject: `🔒 Backup Aureus [${roleLabel}] — ${dateStr}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;">
              <div style="background:#1a1a2e;color:white;padding:24px;border-radius:8px 8px 0 0;">
                <h2 style="margin:0;">🔒 Backup Aureus Social Pro</h2>
                <p style="margin:8px 0 0;opacity:.8;">Rôle: <strong>${roleLabel}</strong> — ${dateStr} à ${timeStr}</p>
              </div>
              <div style="background:#f8f9fa;padding:24px;border-radius:0 0 8px 8px;">
                <p>📊 <strong>${Object.keys(backupData).length}</strong> tables — <strong>${totalRecords}</strong> enregistrements</p>
                <ul>${Object.entries(backupData).map(([t,rows])=>`<li>${t}: ${rows.length} enregistrements</li>`).join('')}</ul>
                ${errors.length>0?`<p style="color:#dc2626;">⚠️ Erreurs: ${errors.join(', ')}</p>`:''}
                <p style="color:#6b7280;font-size:12px;">Fichier: <strong>${filename}</strong></p>
              </div>
            </div>
          `,
          attachments: [{ filename, content: Buffer.from(jsonContent).toString('base64') }]
        })
      });
    }

    return new Response(jsonContent, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Backup-Role': role,
        'X-Backup-Email-Sent': (action==='email'||action==='both') ? 'true' : 'false',
        'X-Backup-Records': String(totalRecords),
        'X-Backup-Tables': String(Object.keys(backupData).length),
      },
    });

  } catch (error) {
    console.error('Backup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
