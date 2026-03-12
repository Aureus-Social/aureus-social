// API Monitoring — déclenchement manuel depuis le Dashboard
import { logInfo, logError, logWarn } from '../../lib/security/logger.js';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request) {
  // Auth Bearer obligatoire
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getSupabase();
  try {
    const checks = [];

    // 1. Santé Supabase
    const { error: dbError } = await supabase.from('audit_log').select('id').limit(1);
    checks.push({ label: 'Base de données', ok: !dbError, detail: dbError?.message || 'Connexion OK' });

    // 2. Compter employés actifs
    const { data: empsRaw, error: empError } = await supabase
      .from('employees')
      .select('id, contractEnd, end_date, first, fn, last, ln, niss_exists:niss, iban_exists:iban')
      .limit(500);
    // Masquer NISS/IBAN — on n'a besoin que de savoir s'ils existent
    const emps = (empsRaw || []).map(e => ({
      ...e,
      niss: e.niss_exists ? '***' : null,
      iban: e.iban_exists ? '***' : null,
    }));
    checks.push({ label: 'Table employees', ok: !empError, detail: empError?.message || `${(emps||[]).length} enregistrements` });

    // 3. Analyser les employés
    const empAlerts = [];
    const now = new Date();
    (emps || []).forEach(emp => {
      const name = `${emp.first || emp.fn || ''} ${emp.last || emp.ln || ''}`.trim() || emp.id;
      if (emp.contractEnd || emp.end_date) {
        const endDate = new Date(emp.contractEnd || emp.end_date);
        const daysLeft = Math.round((endDate - now) / (1000 * 60 * 60 * 24));
        if (daysLeft >= 0 && daysLeft <= 30) empAlerts.push({ severity: daysLeft <= 7 ? 'critical' : 'warning', msg: `CDD ${name} expire dans ${daysLeft}j` });
      }
      if (!emp.niss) empAlerts.push({ severity: 'warning', msg: `NISS manquant — ${name}` });
    });

    // 4. Derniers logs audit
    const { data: recentLogs } = await supabase
      .from('audit_log')
      .select('action, created_at, user_email')
      .order('created_at', { ascending: false })
      .limit(10);

    // 5. Échéances du jour
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const echeanceAlerts = [];
    if (day >= 1 && day <= 5) echeanceAlerts.push({ severity: 'warning', msg: 'Provision ONSS — avant le 5 du mois' });
    if (day >= 12 && day <= 15) echeanceAlerts.push({ severity: 'critical', msg: 'Précompte professionnel — avant le 15 du mois' });
    if (day >= 22 && day <= 25) echeanceAlerts.push({ severity: 'warning', msg: 'Virements salaires NET — avant le 25' });
    if ([2,5,8,11].includes(month) && day >= 20) echeanceAlerts.push({ severity: 'critical', msg: `DmfA trimestrielle T${Math.ceil(month/3)} — fin de mois` });

    const allAlerts = [...empAlerts, ...echeanceAlerts];
    const criticals = allAlerts.filter(a => a.severity === 'critical').length;
    const warnings = allAlerts.filter(a => a.severity === 'warning').length;

    return Response.json({
      ok: true,
      timestamp: now.toISOString(),
      checks,
      alerts: allAlerts,
      summary: { criticals, warnings, total: allAlerts.length },
      recentActivity: recentLogs || []
    });

  } catch (e) {
    return Response.json({ ok: false, error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
