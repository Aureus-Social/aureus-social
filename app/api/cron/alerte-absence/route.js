// AUREUS — ALERTE ABSENCE LONGUE DURÉE > 30 JOURS
// Cron : chaque lundi 08h30 CET
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const CRON_SECRET = process.env.CRON_SECRET;
const RESEND_KEY  = process.env.RESEND_API_KEY;
const ALERT_EMAIL = 'info@aureus-ia.com';
const SEUIL_JOURS = 30;

export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const cutoff = new Date(Date.now() - SEUIL_JOURS * 24 * 3600000).toISOString().split('T')[0];

  // Absences maladie démarrées avant le cutoff et encore ouvertes
  const { data: absences } = await sb.from('absences')
    .select('id, employee_id, type, date_debut, date_fin, motif')
    .in('type', ['maladie', 'incapacite', 'accident_travail'])
    .lte('date_debut', cutoff)
    .is('date_fin', null) // encore ouverte
    .order('date_debut', { ascending: true });

  if (!absences?.length) return NextResponse.json({ ok:true, alerts:0 });

  // Récupérer les noms des employés
  const empIds = [...new Set(absences.map(a => a.employee_id))];
  const { data: emps } = await sb.from('employees')
    .select('id, first_name, last_name, niss')
    .in('id', empIds);
  const empMap = Object.fromEntries((emps||[]).map(e => [e.id, e]));

  const now = new Date();

  if (RESEND_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Aureus Alertes RH <noreply@aureus-ia.com>',
        to: [ALERT_EMAIL],
        subject: `🏥 ${absences.length} absence(s) longue durée > ${SEUIL_JOURS}j — Vérifier INAMI`,
        html: `<div style="font-family:Arial,sans-serif;max-width:580px;">
          <div style="background:#0d1117;padding:18px 22px;border-radius:8px 8px 0 0;">
            <div style="color:#c6a34e;font-weight:800;font-size:16px;">AUREUS — Absences Longue Durée</div>
            <div style="color:#6b7280;font-size:11px;">${now.toLocaleDateString('fr-BE')}</div>
          </div>
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:14px 22px;">
            <div style="font-weight:700;font-size:15px;color:#92400e;">🏥 ${absences.length} employé(s) absent(s) depuis plus de ${SEUIL_JOURS} jours</div>
            <div style="font-size:12px;color:#78350f;margin-top:4px;">
              À partir du 31e jour d'incapacité, l'INAMI prend le relais (60% du salaire plafonné).<br>
              Vérifier que la déclaration INAMI a bien été faite.
            </div>
          </div>
          <div style="background:#fff;padding:16px 22px;border:1px solid #e5e7eb;border-top:none;">
            ${absences.map(a => {
              const emp = empMap[a.employee_id] || {};
              const debut = new Date(a.date_debut);
              const jours = Math.ceil((now - debut) / (1000*3600*24));
              return `<div style="padding:10px 14px;border:1px solid #fde68a;border-radius:6px;margin-bottom:8px;background:#fffbeb;">
                <div style="display:flex;justify-content:space-between;">
                  <div>
                    <div style="font-weight:700;">${emp.first_name||''} ${emp.last_name||'—'}</div>
                    <div style="font-size:11px;color:#6b7280;">
                      NISS: ${emp.niss||'—'} · ${a.type} · Depuis le ${debut.toLocaleDateString('fr-BE')}
                    </div>
                  </div>
                  <span style="background:#f59e0b;color:#fff;border-radius:20px;padding:3px 10px;font-size:12px;font-weight:700;white-space:nowrap;">
                    ${jours} jours
                  </span>
                </div>
              </div>`;
            }).join('')}
            <div style="margin-top:12px;padding:10px;background:#dbeafe;border-radius:6px;font-size:12px;color:#1e40af;">
              📋 Actions requises : déclaration INAMI, calcul salaire garanti, suivi médecin-contrôle
            </div>
          </div>
          <div style="background:#f9fafb;padding:10px 22px;border-radius:0 0 8px 8px;font-size:10px;color:#9ca3af;">
            <a href="https://app.aureussocial.be" style="color:#c6a34e;">Gérer les absences →</a> · Aureus IA SPRL
          </div>
        </div>`
      })
    }).catch(() => {});
  }

  return NextResponse.json({ ok:true, alerts: absences.length });
}
