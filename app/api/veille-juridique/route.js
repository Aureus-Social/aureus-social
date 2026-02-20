// ═══════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — API VEILLE JURIDIQUE
// Sprint 37+ : Cron quotidien — Scrape sources officielles belges,
//              détecte les changements AR/CCT, notifie l'admin.
// Route: /api/veille-juridique
// Vercel Cron: Quotidien 06:30 CET (voir vercel.json)
// ═══════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

// ─── Valeurs de référence LOIS_BELGES 2026 ──────────────────────────
// Miroir exact des valeurs hardcodées dans LOIS_BELGES (AureusSocialPro.js)
// Si une source retourne une valeur différente → changement détecté
const REF_2026 = {
  annee: 2026,
  version: '2026.1',
  onss: {
    travailleur: 0.1307,
    employeurTotal: 0.2507,
    ouvrier108: 1.08,
  },
  pp: {
    tranche1: { max: 16710, taux: 0.2675 },
    tranche2: { max: 29500, taux: 0.4280 },
    tranche3: { max: 51050, taux: 0.4815 },
    tranche4: { taux: 0.5350 },
    fraisProSalarie: { pct: 0.30, max: 5520 },
    quotiteExB1: 10570,
    quotiteExB2: 21140,
    bonusEmploiMax: 194.03,
  },
  rmmmg: 2070.48,
  chequesRepas: { vfMax: 8.00, partTrav: 1.09, partPat: 6.91 },
  forfaitBureau: 154.74,
  forfaitKm: 0.4415,
  indexSante: 2.0399,
  at: 0.01,
  medecineTravail: 91.50,
};

// ─── Sources officielles à scraper ──────────────────────────────────
const SOURCES = [
  {
    id: 'moniteur_belge',
    nom: 'Moniteur Belge',
    url: 'https://www.ejustice.just.fgov.be/cgi/summary.pl',
    type: 'Legislation',
    keywords: ['precompte professionnel', 'ONSS', 'cotisations sociales', 'salaire minimum', 'cheques-repas', 'index', 'arrete royal'],
    priority: 'critical',
  },
  {
    id: 'spf_finances',
    nom: 'SPF Finances — Précompte',
    url: 'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/precompte_professionnel/calcul',
    type: 'Official',
    keywords: ['bareme', 'precompte', '2026', '2027', 'arrete royal'],
    priority: 'critical',
    extract: 'pp_bareme',
  },
  {
    id: 'onss',
    nom: 'ONSS — Taux cotisations',
    url: 'https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/socialsecuritycontributions/contributions.html',
    type: 'Official',
    keywords: ['13,07', '25,07', 'cotisation personnelle', 'cotisation patronale'],
    priority: 'critical',
    extract: 'onss_rates',
  },
  {
    id: 'cnt_rmmmg',
    nom: 'CNT — RMMMG',
    url: 'https://www.cnt-nar.be/CCT-COORD/cct-043.pdf',
    type: 'Official',
    keywords: ['2070', 'revenu minimum', 'garantie'],
    priority: 'high',
    extract: 'rmmmg',
  },
  {
    id: 'spf_index',
    nom: 'SPF Economie — Index',
    url: 'https://statbel.fgov.be/fr/themes/prix-la-consommation/indice-des-prix-la-consommation',
    type: 'Official',
    keywords: ['indice sante', 'indice pivot', 'indexation'],
    priority: 'high',
    extract: 'index_sante',
  },
  {
    id: 'securex',
    nom: 'Securex — Actualités sociales',
    url: 'https://www.securex.be/fr/lex4you/employeur/actualites',
    type: 'Secondary',
    keywords: ['2026', '2027', 'modification', 'nouveau', 'changement'],
    priority: 'medium',
  },
  {
    id: 'ucm',
    nom: 'UCM — Actualités PME',
    url: 'https://www.ucm.be/actualites',
    type: 'Secondary',
    keywords: ['social', 'cotisation', 'salaire', 'index', 'precompte'],
    priority: 'medium',
  },
  {
    id: 'refli',
    nom: 'Refli.be — Barèmes',
    url: 'https://refli.be/fr/documentation/computation/tax',
    type: 'Reference',
    keywords: ['bareme', 'tranches', 'precompte', '2026'],
    priority: 'medium',
    extract: 'pp_refli',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────

/** Safe fetch with timeout */
async function safeFetch(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AureusSocialPro/1.0 (veille-juridique; contact@aureus-ia.be)',
        'Accept': 'text/html,application/xhtml+xml,application/json',
        'Accept-Language': 'fr-BE,fr;q=0.9,nl-BE;q=0.8',
      },
    });
    clearTimeout(timer);
    if (!res.ok) return { ok: false, status: res.status, body: null };
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/pdf')) {
      return { ok: true, status: res.status, body: '[PDF document]', isPdf: true };
    }
    const body = await res.text();
    return { ok: true, status: res.status, body: body.substring(0, 100000) }; // Cap at 100KB
  } catch (e) {
    clearTimeout(timer);
    return { ok: false, status: 0, body: null, error: e.message };
  }
}

/** Search for keywords in HTML body, return matches with context */
function findKeywords(body, keywords) {
  if (!body) return [];
  const text = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const matches = [];
  for (const kw of keywords) {
    const idx = text.toLowerCase().indexOf(kw.toLowerCase());
    if (idx >= 0) {
      const start = Math.max(0, idx - 60);
      const end = Math.min(text.length, idx + kw.length + 60);
      matches.push({
        keyword: kw,
        context: text.substring(start, end).trim(),
        position: idx,
      });
    }
  }
  return matches;
}

/** Extract ONSS rates from page */
function extractOnssRates(body) {
  if (!body) return null;
  const text = body.replace(/<[^>]+>/g, ' ');
  const rates = {};

  // Look for "13,07" pattern (Belgian decimal format)
  const travMatch = text.match(/(?:personnelle|travailleur|salarié)[^0-9]*(\d{1,2}[,.]0\d)\s*%/i);
  if (travMatch) rates.travailleur = parseFloat(travMatch[1].replace(',', '.')) / 100;

  // Look for employer rate
  const empMatch = text.match(/(?:patronale|employeur)[^0-9]*(\d{1,2}[,.]0\d)\s*%/i);
  if (empMatch) rates.employeur = parseFloat(empMatch[1].replace(',', '.')) / 100;

  // Direct number patterns
  if (!rates.travailleur && text.includes('13,07')) rates.travailleur = 0.1307;
  if (!rates.employeur && text.includes('25,07')) rates.employeur = 0.2507;

  return Object.keys(rates).length > 0 ? rates : null;
}

/** Extract PP barème from page */
function extractPPBareme(body) {
  if (!body) return null;
  const text = body.replace(/<[^>]+>/g, ' ');
  const bareme = {};

  // Look for tranches pattern
  const tranchePatterns = [
    /0\s*[-–à]\s*([\d.]+)\s*(?:EUR)?\s*[:=]?\s*([\d,]+)\s*%/,
    /([\d.]+)\s*[-–à]\s*([\d.]+)\s*(?:EUR)?\s*[:=]?\s*([\d,]+)\s*%/,
  ];

  // Look for specific values we know
  const knownValues = {
    '26,75': { tranche: 1, taux: 0.2675 },
    '42,80': { tranche: 2, taux: 0.4280 },
    '48,15': { tranche: 3, taux: 0.4815 },
    '53,50': { tranche: 4, taux: 0.5350 },
    '16.710': { tranche: 1, max: 16710 },
    '16710': { tranche: 1, max: 16710 },
    '29.500': { tranche: 2, max: 29500 },
    '29500': { tranche: 2, max: 29500 },
    '51.050': { tranche: 3, max: 51050 },
    '51050': { tranche: 3, max: 51050 },
  };

  for (const [pattern, data] of Object.entries(knownValues)) {
    if (text.includes(pattern)) {
      bareme[`tranche${data.tranche}_${data.taux ? 'taux' : 'max'}`] = data.taux || data.max;
    }
  }

  // Look for year mention
  const yearMatch = text.match(/(?:barème|bareme|exercice|année)\s*(\d{4})/i);
  if (yearMatch) bareme.annee = parseInt(yearMatch[1]);

  return Object.keys(bareme).length > 0 ? bareme : null;
}

/** Extract RMMMG from page */
function extractRmmmg(body) {
  if (!body) return null;
  const text = body.replace(/<[^>]+>/g, ' ');

  // Look for RMMMG amount patterns
  const patterns = [
    /(?:RMMMG|revenu minimum|salaire minimum)[^0-9]*([\d.]+[,.][\d]+)\s*(?:EUR|€)/i,
    /(2[\.,]0\d{2}[,.][\d]+)\s*(?:EUR|€)/,
  ];

  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      const val = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
      if (val > 1500 && val < 3000) return { montant: val };
    }
  }

  if (text.includes('2.070,48') || text.includes('2070,48') || text.includes('2070.48')) {
    return { montant: 2070.48 };
  }

  return null;
}

/** Extract index santé from page */
function extractIndexSante(body) {
  if (!body) return null;
  const text = body.replace(/<[^>]+>/g, ' ');

  // Look for index coefficient
  const m = text.match(/(?:indice\s+santé|indice\s+pivot|coefficient)[^0-9]*([\d,]+[,.][\d]+)/i);
  if (m) {
    const val = parseFloat(m[1].replace(',', '.'));
    if (val > 1.5 && val < 3.0) return { coeff: val };
  }

  return null;
}

/** Compare extracted values against reference */
function compareWithRef(extracted, sourceId) {
  const changes = [];

  if (sourceId === 'onss' && extracted) {
    if (extracted.travailleur && Math.abs(extracted.travailleur - REF_2026.onss.travailleur) > 0.0001) {
      changes.push({
        param: 'onss.travailleur',
        label: 'ONSS travailleur',
        current: REF_2026.onss.travailleur,
        detected: extracted.travailleur,
        severity: 'critical',
      });
    }
    if (extracted.employeur && Math.abs(extracted.employeur - REF_2026.onss.employeurTotal) > 0.0001) {
      changes.push({
        param: 'onss.employeur.total',
        label: 'ONSS employeur',
        current: REF_2026.onss.employeurTotal,
        detected: extracted.employeur,
        severity: 'critical',
      });
    }
  }

  if (sourceId === 'spf_finances' && extracted) {
    if (extracted.annee && extracted.annee > REF_2026.annee) {
      changes.push({
        param: 'pp.annee',
        label: 'Nouveau barème PP détecté',
        current: REF_2026.annee,
        detected: extracted.annee,
        severity: 'critical',
      });
    }
    // Check if taux changed
    for (const [key, val] of Object.entries(extracted)) {
      if (key.includes('taux') && typeof val === 'number') {
        const tranche = parseInt(key.match(/\d/)?.[0] || '0');
        const ref = REF_2026.pp[`tranche${tranche}`]?.taux;
        if (ref && Math.abs(val - ref) > 0.0001) {
          changes.push({
            param: `pp.tranches.${tranche - 1}.taux`,
            label: `PP Tranche ${tranche} taux`,
            current: ref,
            detected: val,
            severity: 'critical',
          });
        }
      }
    }
  }

  if (sourceId === 'cnt_rmmmg' && extracted) {
    if (extracted.montant && Math.abs(extracted.montant - REF_2026.rmmmg) > 0.01) {
      changes.push({
        param: 'remuneration.RMMMG.montant18ans',
        label: 'RMMMG',
        current: REF_2026.rmmmg,
        detected: extracted.montant,
        severity: 'high',
      });
    }
  }

  if (sourceId === 'spf_index' && extracted) {
    if (extracted.coeff && Math.abs(extracted.coeff - REF_2026.indexSante) > 0.001) {
      changes.push({
        param: 'remuneration.indexSante.coeff',
        label: 'Index santé',
        current: REF_2026.indexSante,
        detected: extracted.coeff,
        severity: 'high',
      });
    }
  }

  return changes;
}

/** Scan for Moniteur Belge new AR/CCT publications */
function scanMoniteurBelge(body) {
  if (!body) return [];
  const alerts = [];
  const text = body.replace(/<[^>]+>/g, ' ');

  const arPatterns = [
    /arrêté\s+royal\s+(?:du\s+)?(\d{1,2}\s+\w+\s+\d{4})[^.]*(?:précompte|ONSS|cotisation|salaire minimum|chèques.repas|index)/gi,
    /(?:CCT|convention\s+collective)[^.]*(?:RMMMG|salaire\s+minimum|chèques.repas|flexi)/gi,
    /(?:loi|loi-programme)[^.]*(?:social|travail|fiscal|cotisation)/gi,
  ];

  for (const pat of arPatterns) {
    let m;
    while ((m = pat.exec(text)) !== null) {
      alerts.push({
        type: 'ar_publication',
        text: m[0].substring(0, 200).trim(),
        date: m[1] || null,
        severity: 'review',
      });
    }
  }

  // Check for year mentions that could indicate new legislation
  const nextYear = new Date().getFullYear() + 1;
  if (text.includes(String(nextYear)) && (text.includes('précompte') || text.includes('ONSS') || text.includes('barème'))) {
    alerts.push({
      type: 'new_year_legislation',
      text: `Références à l'année ${nextYear} détectées — possible nouveau barème`,
      severity: 'critical',
    });
  }

  return alerts;
}

// ─── Notification (extensible: email, Slack, webhook) ───────────────
async function notifyAdmin(changes, alerts, results) {
  // In production, this sends email via /api/send-email or Slack webhook
  // For now, we log and store the notification payload
  const notification = {
    timestamp: new Date().toISOString(),
    type: changes.length > 0 ? 'CHANGES_DETECTED' : 'ROUTINE_CHECK',
    summary: changes.length > 0
      ? `⚠️ ${changes.length} changement(s) détecté(s) dans la législation sociale belge`
      : '✅ Aucun changement détecté — Lois belges à jour',
    changes,
    alerts: alerts.filter(a => a.severity === 'critical' || a.severity === 'review'),
    sourceResults: results.map(r => ({ source: r.source, status: r.status })),
  };

  // TODO: Enable in production
  // await fetch('/api/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     to: process.env.ADMIN_EMAIL || 'admin@aureus-ia.be',
  //     subject: notification.summary,
  //     body: JSON.stringify(notification, null, 2),
  //   }),
  // });

  return notification;
}

// ─── Main handler ───────────────────────────────────────────────────

export async function GET(request) {
  // Verify cron secret for automated calls (Vercel Cron)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  const isManual = !cronSecret || request.nextUrl?.searchParams?.get('manual') === 'true';

  if (!isCron && !isManual) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const results = [];
  const allChanges = [];
  const allAlerts = [];

  // ── Scrape each source ──
  for (const source of SOURCES) {
    const sourceResult = {
      id: source.id,
      source: source.nom,
      url: source.url,
      type: source.type,
      priority: source.priority,
      status: 'pending',
      keywords: [],
      extracted: null,
      changes: [],
      alerts: [],
      fetchTime: 0,
    };

    const t0 = Date.now();
    const resp = await safeFetch(source.url);
    sourceResult.fetchTime = Date.now() - t0;

    if (!resp.ok) {
      sourceResult.status = resp.error?.includes('abort') ? 'timeout' : 'unreachable';
      sourceResult.error = resp.error || `HTTP ${resp.status}`;
      results.push(sourceResult);
      continue;
    }

    sourceResult.status = 'fetched';

    // Keyword search
    sourceResult.keywords = findKeywords(resp.body, source.keywords);

    // Structured extraction based on source type
    if (source.extract === 'onss_rates') {
      sourceResult.extracted = extractOnssRates(resp.body);
    } else if (source.extract === 'pp_bareme' || source.extract === 'pp_refli') {
      sourceResult.extracted = extractPPBareme(resp.body);
    } else if (source.extract === 'rmmmg') {
      sourceResult.extracted = extractRmmmg(resp.body);
    } else if (source.extract === 'index_sante') {
      sourceResult.extracted = extractIndexSante(resp.body);
    }

    // Compare with reference
    if (sourceResult.extracted) {
      sourceResult.changes = compareWithRef(sourceResult.extracted, source.id);
      allChanges.push(...sourceResult.changes);
    }

    // Moniteur Belge special: scan for new AR/CCT
    if (source.id === 'moniteur_belge') {
      sourceResult.alerts = scanMoniteurBelge(resp.body);
      allAlerts.push(...sourceResult.alerts);
    }

    // Mark final status
    sourceResult.status = sourceResult.changes.length > 0 ? 'CHANGES_DETECTED'
      : sourceResult.keywords.length > 0 ? 'ok_with_keywords'
      : 'ok';

    results.push(sourceResult);
  }

  // ── Temporal checks (independent of scraping) ──
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // December alert: watch for new AR publication for next year
  if (currentMonth >= 10) { // Nov-Dec
    allAlerts.push({
      type: 'season_watch',
      text: `Période de publication des barèmes ${currentYear + 1}. Surveillance active du Moniteur Belge.`,
      severity: 'info',
    });
  }

  // January alert: verify new year barèmes are loaded
  if (currentMonth === 0) {
    allAlerts.push({
      type: 'new_year_check',
      text: `Janvier ${currentYear}: Vérifier que tous les barèmes ${currentYear} sont à jour (PP, ONSS, index, RMMMG).`,
      severity: 'high',
    });
  }

  // ── Build response ──
  const duration = Date.now() - startTime;
  const hasChanges = allChanges.length > 0;
  const hasCriticalAlerts = allAlerts.some(a => a.severity === 'critical');

  // Notify admin if changes detected
  let notification = null;
  if (hasChanges || hasCriticalAlerts) {
    notification = await notifyAdmin(allChanges, allAlerts, results);
  }

  const response = {
    status: hasChanges ? 'CHANGES_DETECTED' : hasCriticalAlerts ? 'ALERTS' : 'UP_TO_DATE',
    timestamp: now.toISOString(),
    duration: `${duration}ms`,
    reference: { annee: REF_2026.annee, version: REF_2026.version },
    summary: {
      sourcesChecked: results.length,
      sourcesReachable: results.filter(r => r.status !== 'unreachable' && r.status !== 'timeout').length,
      changesDetected: allChanges.length,
      alertsTotal: allAlerts.length,
      alertsCritical: allAlerts.filter(a => a.severity === 'critical').length,
    },
    changes: allChanges,
    alerts: allAlerts,
    sources: results.map(r => ({
      id: r.id,
      source: r.source,
      status: r.status,
      priority: r.priority,
      fetchTime: r.fetchTime,
      keywordsFound: r.keywords.length,
      changesDetected: r.changes.length,
      alertsDetected: r.alerts?.length || 0,
      extracted: r.extracted,
      error: r.error || null,
    })),
    notification,
    _meta: {
      trigger: isCron ? 'cron' : 'manual',
      nextCron: '06:30 CET demain',
      version: 'veille-juridique-v1.0',
    },
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Veille-Status': response.status,
    },
  });
}

// POST: Allow manual trigger with custom params
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, sourceFilter, forceNotify } = body;

    if (action === 'check') {
      // Redirect to GET logic but via internal call
      const url = new URL(request.url);
      url.searchParams.set('manual', 'true');
      if (sourceFilter) url.searchParams.set('source', sourceFilter);
      const getReq = new Request(url, { headers: request.headers });
      return GET(getReq);
    }

    if (action === 'status') {
      return NextResponse.json({
        status: 'operational',
        sources: SOURCES.length,
        reference: REF_2026,
        nextCheck: '06:30 CET',
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
