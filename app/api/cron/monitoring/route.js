// ═══════════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — CRON MONITORING & ALERTES
// Vercel Cron : chaque jour à 07h00 CET
// Vérifie : erreurs Supabase, échéances critiques, anomalies paie, sécurité
// → Envoie email d'alerte si anomalie détectée
// ═══════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const ALERT_EMAIL = 'info@aureus-ia.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function sendAlertEmail(subject, htmlContent, severity = 'warning') {
  if (!RESEND_API_KEY) return;
  const colors = { critical: '#ef4444', warning: '#fb923c', info: '#60a5fa' };
  const color = colors[severity] || colors.warning;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Aureus Monitoring <noreply@aureussocial.be>',
      to: [ALERT_EMAIL],
      subject: `${severity === 'critical' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️'} ${subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:${color};color:white;padding:20px;border-radius:8px 8px 0 0;">
            <h2 style="margin:0;">Aureus Social Pro — Monitoring</h2>
            <p style="margin:6px 0 0;opacity:.9;font-size:13px;">${new Date().toLocaleString('fr-BE')}</p>
          </div>
          <div style="background:#f8f9fa;padding:24px;border-radius:0 0 8px 8px;">
            ${htmlContent}
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
            <p style="color:#9ca3af;font-size:11px;">Aureus Social Pro — Monitoring automatique | app.aureussocial.be</p>
          </div>
        </div>
      `
    })
  });
}

async function checkSupabaseHealth() {
  const alerts = [];
  try {
    // Test connexion basique
    const { error } = await supabase.from('audit_log').select('id').limit(1);
    if (error) alerts.push({ severity: 'critical', msg: `Base de données inaccessible: ${error.message}` });

    // Vérifier erreurs récentes dans audit_log (actions échouées)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentLogs } = await supabase
      .from('audit_log')
      .select('action, created_at, details')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(100);

    const errorLogs = (recentLogs || []).filter(l => l.action?.includes('ERROR') || l.action?.includes('FAIL'));
    if (errorLogs.length > 5) {
      alerts.push({ severity: 'warning', msg: `${errorLogs.length} erreurs détectées dans les dernières 24h` });
    }

  } catch (e) {
    alerts.push({ severity: 'critical', msg: `Erreur critique Supabase: ${e.message}` });
  }
  return alerts;
}

async function checkEcheances() {
  const alerts = [];
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;

  // Échéances critiques belges
  const echeances = [
    { day: 5,  msg: 'Provision ONSS à verser avant le 5 du mois', severity: 'warning' },
    { day: 15, msg: 'Précompte professionnel à verser au SPF Finances (déclaration 274)', severity: 'critical' },
    { day: 25, msg: 'Virements salaires NET — SEPA pain.001 à préparer', severity: 'warning' },
    { day: 28, msg: 'Fiches de paie à remettre aux travailleurs', severity: 'info' },
  ];

  // Alertes DmfA trimestrielle (mois 2, 5, 8, 11 — fin de mois)
  if ([2, 5, 8, 11].includes(month) && day >= 15) {
    const daysLeft = new Date(now.getFullYear(), month, 0).getDate() - day;
    if (daysLeft <= 15) {
      alerts.push({ severity: 'critical', msg: `DmfA trimestrielle T${Math.ceil(month/3)} — ${daysLeft} jours restants` });
    }
  }

  echeances.forEach(e => {
    const daysUntil = e.day - day;
    if (daysUntil >= 0 && daysUntil <= 3) {
      alerts.push({ severity: daysUntil === 0 ? 'critical' : e.severity, msg: `J${daysUntil === 0 ? '+0 AUJOURD\'HUI' : '+'+daysUntil} — ${e.msg}` });
    }
  });

  return alerts;
}

async function checkEmployees() {
  const alerts = [];
  try {
    const { data: emps, error } = await supabase.from('employees').select('*').limit(500);
    if (error || !emps) return alerts;

    const now = new Date();
    emps.forEach(emp => {
      const name = `${emp.first || emp.fn || ''} ${emp.last || emp.ln || ''}`.trim() || emp.id;

      // CDD expirant dans 30 jours
      if (emp.contractEnd || emp.end_date) {
        const endDate = new Date(emp.contractEnd || emp.end_date);
        const daysLeft = Math.round((endDate - now) / (1000 * 60 * 60 * 24));
        if (daysLeft >= 0 && daysLeft <= 30) {
          alerts.push({ severity: daysLeft <= 7 ? 'critical' : 'warning', msg: `CDD de ${name} expire dans ${daysLeft} jour(s) — renouvellement ou fin à prévoir` });
        }
      }

      // NISS manquant
      if (!emp.niss && !emp.registreNational) {
        alerts.push({ severity: 'warning', msg: `NISS manquant pour ${name} — Dimona impossible` });
      }

      // IBAN manquant
      if (!emp.iban && !emp.bankAccount) {
        alerts.push({ severity: 'info', msg: `IBAN manquant pour ${name} — virement SEPA impossible` });
      }
    });
  } catch (e) {
    alerts.push({ severity: 'warning', msg: `Impossible de vérifier les employés: ${e.message}` });
  }
  return alerts;
}

async function checkSecurityAnomalies() {
  const alerts = [];
  try {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // dernière heure
    const { data: recentLogins } = await supabase
      .from('audit_log')
      .select('user_email, ip_address, created_at')
      .eq('action', 'USER_LOGIN')
      .gte('created_at', since);

    if (recentLogins && recentLogins.length > 10) {
      alerts.push({ severity: 'critical', msg: `${recentLogins.length} tentatives de connexion en 1h — possible attaque brute force` });
    }

    // Logins depuis IPs inhabituelles (hors Belgique/Europe — heuristique simple)
    const suspiciousIPs = (recentLogins || []).filter(l => {
      const ip = l.ip_address || '';
      return ip.startsWith('1.') || ip.startsWith('103.') || ip.startsWith('45.') || ip.startsWith('192.168.') === false && ip.startsWith('10.') === false;
    });

    if (suspiciousIPs.length > 0) {
      const uniqueIPs = [...new Set(suspiciousIPs.map(l => l.ip_address))];
      alerts.push({ severity: 'warning', msg: `Connexions depuis IP(s) à vérifier: ${uniqueIPs.slice(0,3).join(', ')}` });
    }

  } catch (e) {
    // Silencieux si audit_log vide
  }
  return alerts;
}

export async function GET(request) {
  // Vérification token cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const allAlerts = [];

  try {
    // Lancer tous les checks en parallèle
    const [dbAlerts, echeanceAlerts, empAlerts, secAlerts] = await Promise.all([
      checkSupabaseHealth(),
      checkEcheances(),
      checkEmployees(),
      checkSecurityAnomalies(),
    ]);

    allAlerts.push(...dbAlerts, ...echeanceAlerts, ...empAlerts, ...secAlerts);

    const criticals = allAlerts.filter(a => a.severity === 'critical');
    const warnings = allAlerts.filter(a => a.severity === 'warning');
    const infos = allAlerts.filter(a => a.severity === 'info');

    // Envoyer email seulement si alertes critiques ou warnings
    if (criticals.length > 0 || warnings.length > 0) {
      const severity = criticals.length > 0 ? 'critical' : 'warning';
      const subject = criticals.length > 0
        ? `${criticals.length} alerte(s) CRITIQUE(S) détectée(s)`
        : `${warnings.length} avertissement(s) — Action requise`;

      const htmlContent = `
        <h3 style="color:#1f2937;">Rapport de monitoring — ${new Date().toLocaleDateString('fr-BE')}</h3>
        <div style="display:flex;gap:16px;margin-bottom:20px;">
          <div style="text-align:center;padding:12px 20px;background:#fee2e2;border-radius:8px;">
            <div style="font-size:24px;font-weight:800;color:#ef4444;">${criticals.length}</div>
            <div style="font-size:11px;color:#dc2626;">CRITIQUES</div>
          </div>
          <div style="text-align:center;padding:12px 20px;background:#fff7ed;border-radius:8px;">
            <div style="font-size:24px;font-weight:800;color:#fb923c;">${warnings.length}</div>
            <div style="font-size:11px;color:#ea580c;">WARNINGS</div>
          </div>
          <div style="text-align:center;padding:12px 20px;background:#eff6ff;border-radius:8px;">
            <div style="font-size:24px;font-weight:800;color:#60a5fa;">${infos.length}</div>
            <div style="font-size:11px;color:#3b82f6;">INFOS</div>
          </div>
        </div>
        ${criticals.length > 0 ? `
        <h4 style="color:#ef4444;margin-bottom:8px;">🚨 Alertes critiques</h4>
        <ul style="padding-left:20px;">
          ${criticals.map(a => `<li style="margin-bottom:6px;color:#1f2937;">${a.msg}</li>`).join('')}
        </ul>` : ''}
        ${warnings.length > 0 ? `
        <h4 style="color:#fb923c;margin-bottom:8px;">⚠️ Avertissements</h4>
        <ul style="padding-left:20px;">
          ${warnings.map(a => `<li style="margin-bottom:6px;color:#1f2937;">${a.msg}</li>`).join('')}
        </ul>` : ''}
        ${infos.length > 0 ? `
        <h4 style="color:#60a5fa;margin-bottom:8px;">ℹ️ Informations</h4>
        <ul style="padding-left:20px;">
          ${infos.map(a => `<li style="margin-bottom:6px;color:#6b7280;">${a.msg}</li>`).join('')}
        </ul>` : ''}
        <p style="margin-top:20px;">
          <a href="https://app.aureussocial.be" style="background:#1a1a2e;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px;">
            Ouvrir Aureus Social Pro →
          </a>
        </p>
      `;

      await sendAlertEmail(subject, htmlContent, severity);
    }

    // Logger le monitoring dans audit_log
    await supabase.from('audit_log').insert({
      action: 'MONITORING_RUN',
      table_name: 'system',
      details: {
        duration_ms: Date.now() - startTime,
        criticals: criticals.length,
        warnings: warnings.length,
        infos: infos.length,
        email_sent: criticals.length > 0 || warnings.length > 0,
        alerts: allAlerts
      },
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      ok: true,
      duration_ms: Date.now() - startTime,
      alerts: { criticals: criticals.length, warnings: warnings.length, infos: infos.length },
      details: allAlerts
    });

  } catch (e) {
    console.error('[Monitoring] Erreur fatale:', e.message);
    await sendAlertEmail('Erreur fatale du système de monitoring', `<p>Le cron de monitoring a rencontré une erreur fatale:</p><pre>${e.message}</pre>`, 'critical');
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
