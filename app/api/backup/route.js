import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TABLES = [
  'employees', 'travailleurs', 'fiches_paie', 'documents',
  'audit_log', 'activity_log', 'app_state', 'payroll_history',
  'dimona', 'dmfa', 'baremes_cp'
];

export async function POST(request) {
  try {
    const { action, email } = await request.json();

    const backupData = {};
    const errors = [];

    for (const table of TABLES) {
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
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, 'h').substring(0, 5);
    const filename = `aureus-backup-${dateStr}-${timeStr}.json`;

    const backupPayload = {
      metadata: {
        generated_at: now.toISOString(),
        project: 'Aureus Social Pro',
        version: '2.0',
        tables_backed_up: Object.keys(backupData).length,
        total_records: Object.values(backupData).reduce((sum, arr) => sum + arr.length, 0),
        errors
      },
      data: backupData
    };

    const jsonContent = JSON.stringify(backupPayload, null, 2);
    const totalRecords = backupPayload.metadata.total_records;

    // Envoyer email via API Resend directement
    if (action === 'email' || action === 'both') {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Aureus Social Pro <noreply@aureussocial.be>',
          to: [email || 'info@aureus-ia.com'],
          subject: `🔒 Backup Aureus Social Pro — ${dateStr}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#1a1a2e;color:white;padding:24px;border-radius:8px 8px 0 0;">
                <h2 style="margin:0;">🔒 Backup Aureus Social Pro</h2>
                <p style="margin:8px 0 0;opacity:.8;">Généré le ${dateStr} à ${timeStr}</p>
              </div>
              <div style="background:#f8f9fa;padding:24px;border-radius:0 0 8px 8px;">
                <h3>Résumé</h3>
                <p>📊 <strong>${Object.keys(backupData).length}</strong> tables — <strong>${totalRecords}</strong> enregistrements</p>
                <ul>${Object.entries(backupData).map(([t,rows])=>`<li>${t}: ${rows.length} enregistrements</li>`).join('')}</ul>
                ${errors.length > 0 ? `<p style="color:#dc2626;">⚠️ Erreurs: ${errors.join(', ')}</p>` : ''}
                <p style="color:#666;font-size:12px;">Fichier en pièce jointe: <strong>${filename}</strong></p>
              </div>
            </div>
          `,
          attachments: [{
            filename,
            content: Buffer.from(jsonContent).toString('base64')
          }]
        })
      });
    }

    // Retourner le JSON pour téléchargement
    return new Response(jsonContent, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Backup-Email-Sent': action === 'email' || action === 'both' ? 'true' : 'false',
        'X-Backup-Records': String(totalRecords),
      },
    });

  } catch (error) {
    console.error('Backup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
