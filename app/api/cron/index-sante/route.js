// AUREUS — SYNCHRONISATION INDEX SANTÉ BELGE
// Cron : chaque 1er du mois à 06h45 CET
// Source : https://statbel.fgov.be/fr/themes/indicateurs/indice-des-prix-a-la-consommation
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const CRON_SECRET = process.env.CRON_SECRET;
const RESEND_KEY  = process.env.RESEND_API_KEY;
const ALERT_EMAIL = 'info@aureus-ia.com';

// Valeurs de référence 2026 — mis à jour automatiquement
const INDEX_PIVOT_ACTUEL = 121.15; // index-pivot déclenchant indexation
const INDEX_SANTE_2026   = 119.47; // dernier index santé connu

export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) return NextResponse.json({ error:'Unauthorized' }, { status:401 });

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  let indexActuel = INDEX_SANTE_2026;
  let indexChange = false;
  let indexPct = 0;

  // Scraper l'index santé depuis statbel.fgov.be
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch('https://statbel.fgov.be/fr/themes/indicateurs/indice-des-prix-a-la-consommation/indice-de-sante', {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'AureusSocialPro/2026 (compliance-bot; info@aureus-ia.com)' }
    });
    if (res.ok) {
      const html = await res.text();
      // Chercher le dernier index santé dans le HTML
      const match = html.match(/(\d{3}[,\.]\d{2})/g);
      if (match) {
        const candidates = match.map(m => parseFloat(m.replace(',','.'))).filter(v => v > 100 && v < 150);
        if (candidates.length > 0) {
          const newIndex = candidates[0];
          if (Math.abs(newIndex - INDEX_SANTE_2026) > 0.01) {
            indexActuel = newIndex;
            indexChange = true;
            indexPct = ((newIndex - INDEX_SANTE_2026) / INDEX_SANTE_2026 * 100).toFixed(2);
          }
        }
      }
    }
  } catch(_) {}

  // Vérifier si l'index dépasse le pivot → indexation automatique des salaires
  const indexationRequise = indexActuel >= INDEX_PIVOT_ACTUEL;

  // Récupérer les salaires à indexer si dépassement du pivot
  let nbSalairesIndexes = 0;
  if (indexationRequise) {
    const { data: emps } = await sb.from('employees')
      .select('id, salaire_brut')
      .eq('statut', 'actif')
      .not('salaire_brut', 'is', null);
    nbSalairesIndexes = emps?.length || 0;
  }

  if (!indexChange && !indexationRequise) {
    return NextResponse.json({ ok:true, index: indexActuel, changed: false, indexation: false });
  }

  if (RESEND_KEY && (indexChange || indexationRequise)) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Aureus Index Santé <noreply@aureus-ia.com>',
        to: [ALERT_EMAIL],
        subject: `${indexationRequise ? '🚨 INDEXATION REQUISE' : '📈 Index santé modifié'} — ${indexActuel}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:580px;">
          <div style="background:#0d1117;padding:18px 22px;border-radius:8px 8px 0 0;">
            <div style="color:#c6a34e;font-weight:800;font-size:16px;">AUREUS — Index Santé Belge</div>
            <div style="color:#6b7280;font-size:11px;">${new Date().toLocaleDateString('fr-BE')}</div>
          </div>
          ${indexationRequise ? `<div style="background:#fef2f2;border-left:4px solid #ef4444;padding:14px 22px;">
            <div style="font-weight:700;font-size:15px;color:#dc2626;">🚨 INDEX-PIVOT DÉPASSÉ — Indexation automatique requise</div>
            <div style="font-size:12px;color:#7f1d1d;margin-top:4px;">
              Index santé actuel : <strong>${indexActuel}</strong> ≥ Index-pivot : <strong>${INDEX_PIVOT_ACTUEL}</strong><br>
              Tous les salaires doivent être augmentés de <strong>2%</strong> (indexation légale belge).<br>
              ${nbSalairesIndexes} employé(s) concerné(s).
            </div>
          </div>` : `<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:14px 22px;">
            <div style="font-weight:700;font-size:14px;color:#92400e;">📈 Index santé modifié : ${INDEX_SANTE_2026} → ${indexActuel} (+${indexPct}%)</div>
            <div style="font-size:12px;color:#78350f;margin-top:4px;">Pas encore au niveau de l'index-pivot (${INDEX_PIVOT_ACTUEL}). Surveillance active.</div>
          </div>`}
          <div style="background:#fff;padding:16px 22px;border:1px solid #e5e7eb;border-top:none;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:6px 0;color:#6b7280;">Index santé actuel</td><td style="text-align:right;font-weight:700;">${indexActuel}</td></tr>
              <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:6px 0;color:#6b7280;">Index-pivot 2026</td><td style="text-align:right;font-weight:700;">${INDEX_PIVOT_ACTUEL}</td></tr>
              <tr><td style="padding:6px 0;color:#6b7280;">Indexation requise</td><td style="text-align:right;font-weight:700;color:${indexationRequise?'#dc2626':'#10b981'};">${indexationRequise ? 'OUI ⚠️' : 'NON ✅'}</td></tr>
            </table>
            ${indexationRequise ? `<div style="margin-top:12px;padding:10px;background:#fef2f2;border-radius:6px;font-size:12px;color:#dc2626;">
              📋 Action requise : aller dans <strong>Paie → Clôture Mensuelle</strong> et appliquer l'indexation +2% sur tous les salaires.
            </div>` : ''}
          </div>
          <div style="background:#f9fafb;padding:10px 22px;border-radius:0 0 8px 8px;font-size:10px;color:#9ca3af;">
            Source : statbel.fgov.be · <a href="https://app.aureussocial.be" style="color:#c6a34e;">app.aureussocial.be</a> · Aureus IA SPRL
          </div>
        </div>`
      })
    }).catch(() => {});
  }

  return NextResponse.json({ ok:true, index: indexActuel, changed: indexChange, indexation: indexationRequise, employes: nbSalairesIndexes });
}
