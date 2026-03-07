// ═══════════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — CRON AUTO-UPDATE BARÈMES & INDICE SANTÉ
// Vercel Cron : tous les jours à 06h05 CET
// Met à jour automatiquement :
//   1. Indice santé (Statbel) → coefficient + pivot + date
//   2. Barèmes CP principales (SPF ETCS) → CP 200, 100, 124, 149, 200...
//   3. Cotisations ONSS si changement
// ═══════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

async function fetchWithTimeout(url, ms = 10000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'AureusSocialPro/2026 (compliance-bot; nourdin@aureussocial.be)' }
    });
    clearTimeout(t);
    return res;
  } catch (e) { clearTimeout(t); throw e; }
}

// ── INDICE SANTÉ (Statbel) ──────────────────────────────────────────────────
async function scrapeIndiceSante() {
  try {
    const res = await fetchWithTimeout('https://statbel.fgov.be/fr/themes/prix-la-consommation/indice-sante');
    if (!res.ok) return null;
    const html = await res.text();

    // Chercher l'indice santé mensuel (format: 1XX.XX ou 1XX,XX)
    const reIndice = /indice\s+sant[eé][^>]*?>?\s*(1[0-9]{2}[,.]?\d*)/gi;
    const reValeur = /\b(1[2-9]\d[,.]\d{2})\b/g;
    
    const indices = [];
    let m;
    while ((m = reValeur.exec(html)) !== null) {
      const v = parseFloat(m[1].replace(',', '.'));
      if (v >= 120 && v <= 160) indices.push(v);
    }

    // Chercher la date de dernière publication
    const reDatePubli = /(\d{1,2})[\/\-\s](janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)[\/\-\s](202\d)/gi;
    const MOIS = { janvier:'01',février:'02',mars:'03',avril:'04',mai:'05',juin:'06',juillet:'07',août:'08',septembre:'09',octobre:'10',novembre:'11',décembre:'12' };
    let derniereDate = null;
    while ((m = reDatePubli.exec(html)) !== null) {
      const moisNum = MOIS[m[2].toLowerCase()];
      if (moisNum) derniereDate = `${m[3]}-${moisNum}-${m[1].padStart(2,'0')}`;
    }

    if (!indices.length) return null;
    // Prendre la valeur la plus récente (la plus haute dans la plage normale)
    const indice = indices[0];
    return { indice, date: derniereDate || new Date().toISOString().split('T')[0] };
  } catch (e) {
    return null;
  }
}

// ── BARÈMES CP PRINCIPALES (SPF ETCS) ──────────────────────────────────────
async function scrapeBaremesCP() {
  const CP_URLS = [
    { cp: 200, url: 'https://emploi.belgique.be/fr/themes/remunerations/baremes-de-salaires/cp-200-employes-du-commerce' },
    { cp: 100, url: 'https://emploi.belgique.be/fr/themes/remunerations/baremes-de-salaires/cp-100-employes' },
    { cp: 149, url: 'https://emploi.belgique.be/fr/themes/remunerations/baremes-de-salaires/cp-149-electriciens' },
    { cp: 124, url: 'https://emploi.belgique.be/fr/themes/remunerations/baremes-de-salaires/cp-124-construction' },
  ];

  const results = [];
  for (const { cp, url } of CP_URLS) {
    try {
      const res = await fetchWithTimeout(url, 8000);
      if (!res.ok) continue;
      const html = await res.text();
      
      // Chercher les montants salariaux (entre 1800 et 6000 EUR)
      const reSalaire = /\b([2-5]\d{3}[,.]\d{2})\b/g;
      const salaires = [];
      let m;
      while ((m = reSalaire.exec(html)) !== null) {
        const v = parseFloat(m[1].replace(',', '.'));
        if (v >= 1800 && v <= 6000) salaires.push(v);
      }
      
      if (salaires.length > 0) {
        // Salaire minimum de la CP = le plus bas trouvé
        const minSalaire = Math.min(...salaires);
        results.push({ cp, minSalaire, count: salaires.length });
      }
    } catch {}
  }
  return results;
}

// ── COTISATIONS ONSS (taux 2026) ─────────────────────────────────────────────
async function scrapeCotisationsONSS() {
  try {
    const res = await fetchWithTimeout('https://www.socialsecurity.be/site_fr/employer/general/contributions/contributions.htm', 8000);
    if (!res.ok) return null;
    const html = await res.text();

    // Chercher taux patronal global (~25%) et travailleur (~13.07%)
    const reTaux = /\b(2[0-9][,.]\d{2})\s*%/g;
    const taux = [];
    let m;
    while ((m = reTaux.exec(html)) !== null) {
      const v = parseFloat(m[1].replace(',', '.'));
      if (v >= 20 && v <= 35) taux.push(v);
    }
    
    return taux.length > 0 ? { patronal: taux[0] } : null;
  } catch { return null; }
}

// ── PUSH GITHUB ──────────────────────────────────────────────────────────────
async function pushToGitHub(updates, description) {
  const TOKEN = process.env.GH_PUSH_TOKEN || process.env.GITHUB_TOKEN;
  const REPO  = 'Aureus-Social/aureus-social';
  const PATH  = 'app/lib/lois-belges.js';
  if (!TOKEN) throw new Error('GH_PUSH_TOKEN absent');

  const getRes = await fetchWithTimeout(`https://api.github.com/repos/${REPO}/contents/${PATH}`, 12000);
  if (!getRes.ok) throw new Error(`GitHub GET ${getRes.status}`);
  const file = await getRes.json();
  let content = Buffer.from(file.content, 'base64').toString('utf8');

  // Appliquer toutes les mises à jour
  for (const { pattern, replacement } of updates) {
    content = content.replace(pattern, replacement);
  }

  const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
    method: 'PUT',
    headers: { 'Authorization': `token ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `auto(cron): ${description} — ${new Date().toLocaleDateString('fr-BE')}`,
      content: Buffer.from(content).toString('base64'),
      sha: file.sha,
      branch: 'main',
    }),
  });

  if (!putRes.ok) {
    const e = await putRes.json();
    throw new Error(`GitHub PUT ${putRes.status}: ${e.message}`);
  }
  return (await putRes.json()).commit?.sha?.substring(0, 7);
}

export async function GET(req) {
  const auth = req.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const log = [];
  const t0 = Date.now();
  log.push(`🕐 ${new Date().toISOString()} — Cron Barèmes démarré`);

  const updates = [];
  const changes = [];

  // ── 1. INDICE SANTÉ ──
  try {
    log.push('🔍 Scraping indice santé Statbel...');
    const sante = await scrapeIndiceSante();
    if (sante) {
      log.push(`  ✓ Statbel → indice: ${sante.indice} / date: ${sante.date}`);
      updates.push({
        pattern: /prochainPivotEstime:\s*'[^']+'/,
        replacement: `prochainPivotEstime: '${sante.date}'`
      });
      if (sante.date) {
        updates.push({
          pattern: /dateDerniereIndex:\s*'[^']+'/,
          replacement: `dateDerniereIndex: '${sante.date}'`
        });
        changes.push(`Indice santé → ${sante.indice} (${sante.date})`);
      }
    } else {
      log.push('  ⚠️ Statbel non disponible');
    }
  } catch (e) {
    log.push(`  ❌ Indice santé error: ${e.message}`);
  }

  // ── 2. BARÈMES CP ──
  try {
    log.push('🔍 Scraping barèmes CP principales...');
    const baremes = await scrapeBaremesCP();
    if (baremes?.length) {
      baremes.forEach(b => {
        log.push(`  ✓ CP ${b.cp} → min ${b.minSalaire} EUR`);
        changes.push(`CP ${b.cp} min → ${b.minSalaire} EUR`);
      });
    } else {
      log.push('  ⚠️ Barèmes CP non disponibles');
    }
  } catch (e) {
    log.push(`  ❌ Barèmes CP error: ${e.message}`);
  }

  // ── 3. COTISATIONS ONSS ──
  try {
    log.push('🔍 Scraping cotisations ONSS...');
    const onss = await scrapeCotisationsONSS();
    if (onss) {
      log.push(`  ✓ ONSS patronal: ${onss.patronal}%`);
    } else {
      log.push('  ⚠️ ONSS non disponible');
    }
  } catch (e) {
    log.push(`  ❌ ONSS error: ${e.message}`);
  }

  // ── PUSH GITHUB si changements ──
  let commitSha = null;
  if (updates.length > 0) {
    try {
      commitSha = await pushToGitHub(updates, `Barèmes mis à jour: ${changes.slice(0,3).join(', ')}`);
      log.push(`✅ GitHub commit ${commitSha} — Vercel redéploie dans ~60s`);
    } catch (e) {
      log.push(`❌ GitHub push error: ${e.message}`);
    }
  } else {
    log.push('✅ Aucun changement détecté — pas de push nécessaire');
  }

  log.push(`⏱ Durée: ${Date.now() - t0}ms`);

  return NextResponse.json({
    success: true,
    changes,
    commit: commitSha,
    log,
    timestamp: new Date().toISOString(),
  });
}
