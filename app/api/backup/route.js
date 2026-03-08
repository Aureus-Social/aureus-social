import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

const TABLES = [
  'employees', 'travailleurs', 'fiches_paie', 'documents',
  'audit_log', 'activity_log', 'app_state', 'payroll_history',
  'dimona', 'dmfa', 'baremes_cp'
];

export async function POST(request) {
  try {
    const { action, email } = await request.json();

    // Récupérer toutes les données
    const backupData = {};
    const errors = [];

    for (const table of TABLES) {
      try {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          errors.push(`${table}: ${error.message}`);
        } else {
          backupData[table] = data || [];
        }
      } catch (e) {
        errors.push(`${table}: ${e.message}`);
      }
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, 'h').substring(0, 5);

    const backupPayload = {
      metadata: {
        generated_at: now.toISOString(),
        project: 'Aureus Social Pro',
        version: '2.0',
        tables_backed_up: Object.keys(backupData).length,
        total_records: Object.values(backupData).reduce((sum, arr) => sum + arr.length, 0),
        errors: errors
      },
      data: backupData
    };

    const jsonContent = JSON.stringify(backupPayload, null, 2);
    const filename = `aureus-backup-${dateStr}-${timeStr}.json`;

    // Action ZIP = retourner le JSON pour téléchargement
    if (action === 'download' || action === 'both') {
      if (action === 'download') {
        return new Response(jsonContent, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }
    }

    // Action email
    if (action === 'email' || action === 'both') {
      const totalRecords = backupPayload.metadata.total_records;
      const tablesCount = backupPayload.metadata.tables_backed_up;

      await resend.emails.send({
        from: 'Aureus Social Pro <noreply@aureussocial.be>',
        to: email || 'info@aureus-ia.com',
        subject: `🔒 Backup Aureus Social Pro — ${dateStr}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a1a2e; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0;">🔒 Backup Aureus Social Pro</h2>
              <p style="margin: 8px 0 0; opacity: 0.8;">Généré le ${dateStr} à ${timeStr}</p>
            </div>
            <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px;">
              <h3 style="color: #1a1a2e;">Résumé du backup</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: white; padding: 12px;">
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">📊 Tables sauvegardées</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${tablesCount}</td>
                </tr>
                <tr style="background: white;">
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">📝 Total enregistrements</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${totalRecords}</td>
                </tr>
                ${Object.entries(backupData).map(([table, rows]) => `
                <tr>
                  <td style="padding: 8px 10px; color: #666; font-size: 13px;">${table}</td>
                  <td style="padding: 8px 10px; color: #666; font-size: 13px;">${rows.length} enregistrements</td>
                </tr>`).join('')}
              </table>
              ${errors.length > 0 ? `
              <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 4px; margin-top: 16px;">
                <strong>⚠️ Tables non accessibles :</strong><br>
                ${errors.join('<br>')}
              </div>` : ''}
              <p style="color: #666; font-size: 12px; margin-top: 24px;">
                Le fichier JSON complet est en pièce jointe : <strong>${filename}</strong>
              </p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: filename,
            content: Buffer.from(jsonContent).toString('base64'),
          }
        ]
      });
    }

    // Si action = both, retourner aussi le JSON pour téléchargement
    if (action === 'both') {
      return new Response(jsonContent, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'X-Backup-Email-Sent': 'true',
          'X-Backup-Records': String(backupPayload.metadata.total_records),
        },
      });
    }

    return Response.json({ success: true, filename, records: backupPayload.metadata.total_records });

  } catch (error) {
    console.error('Backup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
