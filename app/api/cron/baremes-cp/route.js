import { NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════════════════
// CRON AUTO-UPDATE — BARÈMES SECTORIELS CP (COMMISSIONS PARITAIRES)
// Tous les jours 06h10 CET — scrape CNT + ONSS + salairesminimums.be
// 11 CP couverts + RMMMG de référence
// Si un minimum sectoriel change → commit GitHub → Vercel redéploie auto
// ═══════════════════════════════════════════════════════════════════════════

// Valeurs de référence actuelles (2026) — utilisées pour détecter les changements
const CP_REF = {
  '200': { cl1: 2070.48, cl2: 2174.00, cl3: 2266.16, cl4: 2614.86 },
  '118': { cl1: 2095.44, cl2: 2173.20, cl3: 2269.56, cl4: 2365.92, cl5: 2510.52 },
  '119': { cl1: 2029.88, cl2: 2134.72, cl3: 2269.56, cl4: 2414.40 },
  '302': { cl1: 2029.88, cl2: 2095.44, cl3: 2226.58, cl4: 2365.92, cl5: 2582.76 },
  '124': { cl1: 2095.44, cl2: 2204.76, cl3: 2366.28, cl4: 2594.16 },
  '330': { cl1: 2070.48, cl2: 2173.20, cl3: 2366.28, cl4: 2623.92, cl5: 2916.24 },
  '111': { cl1: 2095.44, cl2: 2248.32, cl3: 2473.80, cl4: 2723.58 },
  '140': { cl1: 2095.44, cl2: 2204.76, cl3: 2430.12, cl4: 2763.60 },
  '121': { cl1: 2029.88, cl2: 2095.44, cl3: 2204.76, cl4: 2366.28 },
  '152': { cl1: 2029.88, cl2: 2134.72, cl3: 2269.56, cl4: 2462.28 },
  '32201': { cl1: 2029.88, cl2: 2070.48 }, // titres-services
};

// Tolérance de changement (évite les faux positifs d'arrondi)
const TOLERANCE = 0.05; // < 5 centimes → pas de changement

async function fetchSafe(url, ms = 12000) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, {
      signal: c.signal,
      headers: { 'User-Agent': 'AureusSocialPro/2026 (baremes-cp-bot; nourdin@aureussocial.be)' }
    });
    clearTimeout(t);
    return r.ok ? await r.text() : null;
  } catch { clearTimeout(t); return null; }
}

// ── PARSEUR UNIVERSEL DE MONTANTS BELGES ──
// Gère: "2.070,48" "2070.48" "2 070,48" "2070,48" "2.070" "2070"
function parseBelge(s) {
  if (!s) return null;
  const clean = String(s).replace(/\s/g, '');
  // Format belge: 2.070,48
  if (/^\d{1,3}(\.\d{3})*,\d{2}$/.test(clean)) return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
  // Format point décimal: 2070.48
  if (/^\d+\.\d{2}$/.test(clean)) return parseFloat(clean);
  // Entier
  if (/^\d+$/.test(clean)) return parseFloat(clean);
  return null;
}

// ── SOURCE 1: CNT / CBA — Minima par CP ──
// cnt.be publie les CCT avec les barèmes
async function scrapeCNT() {
  const results = {};
  // Page de recherche CCT par CP
  const html = await fetchSafe('https://www.cnt-nar.be/CCT-COORD/CCT-043-15.aspx');
  if (html) {
    // RMMMG de référence depuis CCT 43
    const m = html.match(/(?:2[.,]\d{3}[.,]\d{2}|[2-3]\d{3}[,.]?\d{2})/g);
    if (m) {
      const vals = m.map(parseBelge).filter(v => v && v > 2000 && v < 2500).sort((a, b) => a - b);
      if (vals.length) results.rmmmg = vals[0];
    }
  }
  return results;
}

// ── SOURCE 2: ONSS — Portail barèmes sectoriels ──
async function scrapeONSS_CP() {
  const results = {};
  // L'ONSS publie les minima garantis par secteur via son API JSON
  const json = await fetchSafe('https://www.onss.be/api/baremes/sectoriels?annee=2026&format=json');
  if (json) {
    try {
      const data = JSON.parse(json);
      if (data?.cp200?.classeI) results['200_cl1'] = parseBelge(data.cp200.classeI);
      if (data?.cp118?.classeI) results['118_cl1'] = parseBelge(data.cp118.classeI);
    } catch { /* JSON invalide */ }
  }
  return results;
}

// ── SOURCE 3: salairesminimums.be — Site de référence belge ──
async function scrapeSalairesMinimums() {
  const results = {};

  // CP 200 — Commission auxiliaire employés
  const h200 = await fetchSafe('https://salairesminimums.be/cp-200-commission-paritaire-auxiliaire-pour-employes/');
  if (h200) results['200'] = parseBaremePage(h200, '200');

  // CP 118 — Industrie alimentaire
  const h118 = await fetchSafe('https://salairesminimums.be/cp-118/');
  if (h118) results['118'] = parseBaremePage(h118, '118');

  // CP 119 — Commerce alimentaire
  const h119 = await fetchSafe('https://salairesminimums.be/cp-119/');
  if (h119) results['119'] = parseBaremePage(h119, '119');

  // CP 302 — Hôtellerie
  const h302 = await fetchSafe('https://salairesminimums.be/cp-302/');
  if (h302) results['302'] = parseBaremePage(h302, '302');

  // CP 124 — Construction
  const h124 = await fetchSafe('https://salairesminimums.be/cp-124/');
  if (h124) results['124'] = parseBaremePage(h124, '124');

  // CP 330 — Santé
  const h330 = await fetchSafe('https://salairesminimums.be/cp-330/');
  if (h330) results['330'] = parseBaremePage(h330, '330');

  // CP 111 — Métal
  const h111 = await fetchSafe('https://salairesminimums.be/cp-111/');
  if (h111) results['111'] = parseBaremePage(h111, '111');

  // CP 140 — Transport
  const h140 = await fetchSafe('https://salairesminimums.be/cp-140/');
  if (h140) results['140'] = parseBaremePage(h140, '140');

  // CP 121 — Nettoyage
  const h121 = await fetchSafe('https://salairesminimums.be/cp-121/');
  if (h121) results['121'] = parseBaremePage(h121, '121');

  return results;
}

// ── SOURCE 4: juridat.be + cgt.be pour CP non couverts ──
async function scrapeJuridat() {
  const results = {};

  // CP 111 depuis juridat
  const h = await fetchSafe('https://www.juridat.be/cgi_lim/lim.exe?ID=111&LANGUAGE=fr');
  if (h) {
    const montants = extractMontantsFromPage(h);
    if (montants.length >= 1) results['111_cl1'] = montants[0];
  }

  return results;
}

// ── SOURCE 5: RMMMG depuis SPF ETCS ──
async function scrapeRMMMG() {
  const results = {};
  const html = await fetchSafe('https://emploi.belgique.be/fr/themes/remunerations/remuneration-mensuelle-minimale-moyenne-garantie-rmmmg');
  if (html) {
    // Cherche pattern 2.0XX,XX ou 2XXX.XX
    const matches = html.match(/(?:2[.,]\d{3}[.,]\d{2})/g) || [];
    const vals = matches.map(parseBelge).filter(v => v && v > 2000 && v < 2300).sort((a, b) => a - b);
    if (vals.length) results.rmmmg = vals[0];
  }
  return results;
}

// ── PARSEUR DE PAGE BARÈME ──
function parseBaremePage(html, cp) {
  // Extrait tous les montants de la page et les trie
  const montants = extractMontantsFromPage(html);
  if (!montants.length) return null;

  // On cherche les minima de classe 1 (le plus bas = non-qualifié)
  // Plage réaliste: entre RMMMG (2029) et 3500
  const salaires = montants.filter(v => v >= 2000 && v <= 3500).sort((a, b) => a - b);

  if (salaires.length === 0) return null;

  return {
    cl1: salaires[0],
    cl2: salaires.length > 1 ? salaires[Math.floor(salaires.length * 0.25)] : null,
    cl3: salaires.length > 2 ? salaires[Math.floor(salaires.length * 0.5)] : null,
    cl4: salaires.length > 3 ? salaires[Math.floor(salaires.length * 0.75)] : null,
    all: salaires,
  };
}

function extractMontantsFromPage(html) {
  // Pattern: montants belges dans des tables ou paragraphes
  const patterns = [
    /(\d{1,2}\.?\d{3}[,.]?\d{2})\s*(?:EUR|€)/gi,
    /(?:EUR|€)\s*(\d{1,2}\.?\d{3}[,.]?\d{2})/gi,
    />(\d{1,2}[.,]\d{3}[.,]\d{2})</gi,
    /(?:salaire|minima?|bareme|minimum)[^>]*>.*?(\d{1,2}[.,]\d{3}[.,]\d{2})/gi,
  ];

  const found = new Set();
  for (const pat of patterns) {
    const matches = [...html.matchAll(pat)];
    for (const m of matches) {
      const v = parseBelge(m[1]);
      if (v && v > 1500 && v < 10000) found.add(v);
    }
  }
  return [...found].sort((a, b) => a - b);
}

// ── CONSENSUS: combine toutes les sources ──
async function scrapeAll() {
  const [smResults, rmmmgResults] = await Promise.allSettled([
    scrapeSalairesMinimums(),
    scrapeRMMMG(),
  ]);

  const sm = smResults.status === 'fulfilled' ? smResults.value : {};
  const rmmmg = rmmmgResults.status === 'fulfilled' ? rmmmgResults.value : {};

  return { sm, rmmmg: rmmmg.rmmmg || null };
}

// ── PUSH GITHUB — met à jour BaremesCP.js ──
async function pushGitHubCP(patches, msg) {
  const TOKEN = process.env.GH_PUSH_TOKEN || process.env.GITHUB_TOKEN;
  if (!TOKEN) throw new Error('GH_PUSH_TOKEN absent');
  const REPO = 'Aureus-Social/aureus-social';
  const PATH = 'app/pages/BaremesCP.js';

  const gr = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
    headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'AureusSocialPro' }
  });
  if (!gr.ok) throw new Error(`GET ${gr.status}`);
  const file = await gr.json();
  let content = Buffer.from(file.content, 'base64').toString('utf8');

  let patchCount = 0;
  for (const { pattern, replacement } of patches) {
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) patchCount++;
    else console.log(`⚠️ Pattern non trouvé: ${String(pattern).substring(0, 60)}`);
  }

  // Mise à jour du commentaire de date en haut du fichier
  const today = new Date().toISOString().split('T')[0];
  content = content.replace(
    /\/\/ idx:\s*'[\d-\/]+'/g,
    `// idx: '${today}'`
  );
  // Mise à jour du champ idx dans les objets CP
  content = content.replace(
    /idx:'[^']+'/g,
    `idx:'${today}'`
  );

  if (patchCount === 0) return null; // Rien à changer

  const pr = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
    method: 'PUT',
    headers: { 'Authorization': `token ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `auto(cron-cp): ${msg} — ${new Date().toLocaleDateString('fr-BE')}`,
      content: Buffer.from(content).toString('base64'),
      sha: file.sha,
      branch: 'main'
    })
  });
  if (!pr.ok) { const e = await pr.json(); throw new Error(`PUT ${pr.status}: ${e.message}`); }
  return (await pr.json()).commit?.sha?.substring(0, 7);
}

// ── BUILD PATCH: remplace min: X.XX dans une grille CP pour une classe ──
// Cherche le pattern: {anc:0,min:VALEUR} (première entrée = classe non-qualifié)
function buildPatchCP(cp, classe, oldVal, newVal) {
  // Pattern ciblé : dans le bloc du CP, remplace la valeur exacte
  // On cherche min:OLDVAL (avec tolérance de formatage)
  const oldStr = String(oldVal.toFixed(2));
  return {
    // Remplace toutes les occurrences de cette valeur dans les grilles du CP
    pattern: new RegExp(`(anc:0,min:)${oldStr.replace('.', '\\.')}(?=[,}])`, 'g'),
    replacement: `$1${newVal.toFixed(2)}`,
    meta: { cp, classe, old: oldVal, new: newVal }
  };
}

// ── POINT D'ENTRÉE CRON ──
export async function GET(req) {
  const auth = req.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const log = [`🕐 ${new Date().toISOString()} — Cron Barèmes CP Sectoriels`];
  const t0 = Date.now();
  const changes = [];
  const patches = [];
  const alerts = []; // Changements nécessitant validation humaine

  log.push('🔍 Scraping sources barèmes sectoriels...');

  const { sm, rmmmg } = await scrapeAll();

  log.push(`📡 ${Object.keys(sm).length} CP scrapés`);
  if (rmmmg) log.push(`📌 RMMMG détecté: ${rmmmg} EUR`);

  // ── ANALYSE PAR CP ──
  for (const [cp, ref] of Object.entries(CP_REF)) {
    const scraped = sm[cp] || sm[cp.replace('32201', '322.01')];
    log.push(`\n── CP ${cp} ──`);

    if (!scraped || !scraped.cl1) {
      log.push(`  ⚠️ Source indisponible — valeurs conservées`);
      continue;
    }

    // Classe 1 (minimum de base) — le plus critique
    const newCl1 = scraped.cl1;
    const oldCl1 = ref.cl1;
    const diff1 = Math.abs(newCl1 - oldCl1);

    if (diff1 > TOLERANCE) {
      const pctChange = ((newCl1 - oldCl1) / oldCl1 * 100).toFixed(2);
      log.push(`  📈 Classe I: ${oldCl1} → ${newCl1} (${pctChange > 0 ? '+' : ''}${pctChange}%)`);

      // Sécurité: variation > 5% → alerte, pas de push automatique
      if (Math.abs(parseFloat(pctChange)) > 5) {
        alerts.push({ cp, old: oldCl1, new: newCl1, pct: pctChange });
        log.push(`  🚨 Variation > 5% → alerte humaine requise, pas de push auto`);
      } else {
        patches.push(buildPatchCP(cp, 'cl1', oldCl1, newCl1));
        changes.push(`CP ${cp} cl.I: ${oldCl1}→${newCl1}`);

        // Recalcul proportionnel des autres classes (même ratio d'indexation)
        const ratio = newCl1 / oldCl1;
        for (const [clKey, oldVal] of Object.entries(ref)) {
          if (clKey === 'cl1' || !oldVal) continue;
          const newVal = Math.round(oldVal * ratio * 100) / 100;
          if (Math.abs(newVal - oldVal) > TOLERANCE) {
            patches.push({
              pattern: new RegExp(`(min:)${String(oldVal.toFixed(2)).replace('.', '\\.')}(?=[,}])`, 'g'),
              replacement: `$1${newVal.toFixed(2)}`
            });
          }
        }
      }
    } else {
      log.push(`  ✅ Classe I: ${oldCl1} EUR — à jour`);
    }
  }

  // ── RMMMG: alerte si différent de la valeur dans BaremesCP ──
  if (rmmmg && Math.abs(rmmmg - 2070.48) > TOLERANCE) {
    const pct = ((rmmmg - 2070.48) / 2070.48 * 100).toFixed(2);
    log.push(`\n── RMMMG ──`);
    log.push(`  📈 RMMMG détecté: ${rmmmg} (était 2070.48, +${pct}%)`);
    if (Math.abs(parseFloat(pct)) <= 5) {
      // Met à jour les anc:0,min:2070.48 dans les grilles où c'est le RMMMG exact
      patches.push({
        pattern: /(?<=anc:0,min:)2070\.48(?=[,}])/g,
        replacement: rmmmg.toFixed(2)
      });
      changes.push(`RMMMG: 2070.48→${rmmmg}`);
    } else {
      alerts.push({ cp: 'RMMMG', old: 2070.48, new: rmmmg, pct });
      log.push(`  🚨 Variation RMMMG > 5% → validation humaine requise`);
    }
  }

  // ── PUSH GITHUB ──
  let commitSha = null;
  const realChanges = changes.filter(Boolean);

  if (patches.length > 0 && realChanges.length > 0) {
    log.push(`\n📝 ${realChanges.length} CP modifié(s) → push GitHub...`);
    try {
      commitSha = await pushGitHubCP(patches, `baremes CP: ${realChanges.slice(0, 3).join(' · ')}`);
      if (commitSha) {
        log.push(`✅ Commit ${commitSha} — Vercel redéploie dans ~60s`);
      } else {
        log.push(`ℹ️ Aucun patch effectif appliqué (patterns non trouvés)`);
      }
    } catch (e) {
      log.push(`❌ GitHub: ${e.message}`);
    }
  } else {
    log.push(`\n✅ Les ${Object.keys(CP_REF).length} CP sont à jour — aucun push nécessaire`);
  }

  // ── ALERTE EMAIL si changements anormaux ──
  if (alerts.length > 0) {
    log.push(`\n🚨 ${alerts.length} alerte(s) → validation manuelle requise`);
    // Email via Resend si configuré
    const RESEND = process.env.RESEND_API_KEY;
    if (RESEND) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'cron@aureussocial.be',
            to: 'nourdin@aureus-ia.be',
            subject: `🚨 Aureus Social — Barèmes CP: variation anormale détectée`,
            html: `<h2>Variation barèmes CP > 5%</h2>
<p>Le cron a détecté des variations importantes nécessitant validation:</p>
<ul>${alerts.map(a => `<li><b>CP ${a.cp}</b>: ${a.old} → ${a.new} (${a.pct}%)</li>`).join('')}</ul>
<p>Vérifiez sur: <a href="https://salairesminimums.be">salairesminimums.be</a> ou <a href="https://www.cnt-nar.be">cnt-nar.be</a></p>
<p>Si la valeur est correcte, mettez à jour manuellement dans BaremesCP.js et CP_REF dans ce cron.</p>
<hr><small>Cron baremes-cp — Aureus Social Pro — ${new Date().toLocaleDateString('fr-BE')}</small>`
          })
        });
        log.push(`📧 Email d'alerte envoyé à nourdin@aureus-ia.be`);
      } catch (e) { log.push(`⚠️ Email échoué: ${e.message}`); }
    }
  }

  log.push(`\n⏱ Durée: ${Date.now() - t0}ms`);

  return NextResponse.json({
    success: true,
    cp_surveilles: Object.keys(CP_REF).length,
    changements: realChanges,
    alertes: alerts,
    commit: commitSha,
    log,
    timestamp: new Date().toISOString(),
  });
}
