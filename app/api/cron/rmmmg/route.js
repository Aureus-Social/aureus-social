// ═══════════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — CRON AUTO-UPDATE RMMMG
// Vercel Cron : chaque lundi 06h00 CET
// Scrape SPF ETCS + ONSS → compare → met à jour lois-belges.js via GitHub API
// → Vercel redéploie automatiquement → RMMMG à jour partout dans l'app
// ═══════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

const RMMMG_FALLBACK = 2070.48; // Valeur connue — fallback si scraping impossible

async function fetchWithTimeout(url, ms = 8000) {
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

function extractRMMMG(text) {
  // Cherche montants entre 1800 et 2500 EUR dans le texte
  const found = [];
  // Format belge : 2.070,48 ou 2070,48 ou 2070.48
  const re = /\b(1[89]\d{2}|2[0-4]\d{2})[,.](\d{2})\b/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const v = parseFloat(m[1] + '.' + m[2]);
    if (v >= 1800 && v <= 2500) found.push(v);
  }
  // Format avec séparateur milliers : 2.070,48
  const re2 = /\b(1|2)[.,](\d{3})[.,](\d{2})\b/g;
  while ((m = re2.exec(text)) !== null) {
    const v = parseFloat(m[1] + m[2] + '.' + m[3]);
    if (v >= 1800 && v <= 2500) found.push(v);
  }
  if (!found.length) return null;
  // Valeur la plus fréquente
  const freq = found.reduce((a, v) => { a[v] = (a[v]||0)+1; return a; }, {});
  return parseFloat(Object.keys(freq).sort((a,b)=>freq[b]-freq[a])[0]);
}

async function scrapeSPF() {
  try {
    const res = await fetchWithTimeout('https://emploi.belgique.be/fr/themes/remunerations/salaire-minimum');
    if (!res.ok) return null;
    const html = await res.text();
    const v = extractRMMMG(html);
    return v ? { source: 'SPF ETCS', value: v } : null;
  } catch { return null; }
}

async function scrapeONSS() {
  try {
    const res = await fetchWithTimeout('https://www.socialsecurity.be/site_fr/employer/general/contributions/reductions/groupcible.htm');
    if (!res.ok) return null;
    const html = await res.text();
    const v = extractRMMMG(html);
    return v ? { source: 'ONSS', value: v } : null;
  } catch { return null; }
}

async function scrapeFinances() {
  try {
    const res = await fetchWithTimeout('https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/precompte_professionnel/baremes');
    if (!res.ok) return null;
    const html = await res.text();
    const v = extractRMMMG(html);
    return v ? { source: 'SPF Finances', value: v } : null;
  } catch { return null; }
}

async function pushToGitHub(newVal, oldVal) {
  const TOKEN = process.env.GH_PUSH_TOKEN || process.env.GITHUB_TOKEN;
  const REPO  = 'Aureus-Social/aureus-social';
  const PATH  = 'app/lib/lois-belges.js';
  if (!TOKEN) throw new Error('GH_PUSH_TOKEN absent des variables Vercel');

  // Lire le fichier actuel
  const getRes = await fetchWithTimeout(`https://api.github.com/repos/${REPO}/contents/${PATH}`, 12000);
  if (!getRes.ok) throw new Error(`GitHub GET ${getRes.status}`);
  const file = await getRes.json();
  const content = Buffer.from(file.content, 'base64').toString('utf8');

  // Remplacer toutes les occurrences de l'ancienne valeur RMMMG
  const updated = content
    .replace(/montant18ans:\s*[\d.]+/g,  `montant18ans: ${newVal}`)
    .replace(/montant20ans6m:\s*[\d.]+/g,`montant20ans6m: ${newVal}`)
    .replace(/montant21ans12m:\s*[\d.]+/g,`montant21ans12m: ${newVal}`);

  if (updated === content) throw new Error('Aucun remplacement effectué — pattern introuvable');

  const putRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
    method: 'PUT',
    headers: { 'Authorization': `token ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `auto(cron): RMMMG ${oldVal} → ${newVal} EUR — CNT ${new Date().toLocaleDateString('fr-BE')}`,
      content: Buffer.from(updated).toString('base64'),
      sha: file.sha,
      branch: 'main',
    }),
  });
  if (!putRes.ok) { const e = await putRes.json(); throw new Error(`GitHub PUT ${putRes.status}: ${e.message}`); }
  return (await putRes.json()).commit?.sha?.substring(0,7);
}

export async function GET(req) {
  // Sécurité : vérifier le secret Vercel Cron
  const auth = req.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const log = [];
  const t0  = Date.now();
  log.push(`🕐 ${new Date().toISOString()} — Cron RMMMG démarré`);

  // Valeur actuelle (injectée comme env var par le cron précédent, sinon fallback)
  const currentRMMMG = parseFloat(process.env.RMMMG_CURRENT || String(RMMMG_FALLBACK));
  log.push(`📋 RMMMG en base : ${currentRMMMG} EUR`);

  // Scraping parallèle des 3 sources
  const results = await Promise.allSettled([scrapeSPF(), scrapeONSS(), scrapeFinances()]);
  const hits = results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);
  log.push(`📡 Sources OK : ${hits.length}/3 — ${hits.map(h=>`${h.source}: ${h.value}`).join(' · ')}`);

  let newRMMMG = currentRMMMG;
  if (hits.length >= 2) {
    // Consensus : au moins 2 sources d'accord
    const vals = hits.map(h => h.value);
    const consensus = vals.find(v => vals.filter(x => x === v).length >= 2);
    if (consensus && consensus !== currentRMMMG) {
      newRMMMG = consensus;
      log.push(`🆕 NOUVEAU RMMMG (consensus ${hits.filter(h=>h.value===consensus).length}/3) : ${currentRMMMG} → ${newRMMMG} EUR`);
    } else if (!consensus && hits[0].value !== currentRMMMG) {
      // Pas de consensus → ne rien changer, log alerte
      log.push(`⚠️ Sources divergentes — pas de mise à jour automatique. Vérification manuelle requise.`);
    } else {
      log.push(`✅ RMMMG inchangé : ${currentRMMMG} EUR`);
    }
  } else if (hits.length === 1) {
    log.push(`⚠️ 1 seule source disponible — pas de mise à jour sans consensus`);
  } else {
    log.push(`❌ Aucune source disponible — RMMMG conservé`);
  }

  // Mise à jour GitHub si changement confirmé
  let commitSha = null;
  if (newRMMMG !== currentRMMMG) {
    try {
      commitSha = await pushToGitHub(newRMMMG, currentRMMMG);
      log.push(`✅ GitHub mis à jour — commit ${commitSha}`);
      log.push(`🚀 Vercel redéploie automatiquement dans ~60s`);
      log.push(`💶 ${currentRMMMG} EUR → ${newRMMMG} EUR (+${(newRMMMG-currentRMMMG).toFixed(2)} EUR)`);
    } catch (e) {
      log.push(`❌ GitHub error : ${e.message}`);
      newRMMMG = currentRMMMG; // rollback
    }
  }

  log.push(`⏱ Durée : ${Date.now()-t0}ms`);

  return NextResponse.json({
    success: true,
    rmmmg_actuel: currentRMMMG,
    rmmmg_nouveau: newRMMMG,
    mis_a_jour: newRMMMG !== currentRMMMG,
    commit: commitSha,
    sources: hits,
    log,
    timestamp: new Date().toISOString(),
  });
}
