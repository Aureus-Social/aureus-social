// ═══════════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — CRON VEILLE LÉGALE BELGE
// Vercel Cron : chaque jour à 06h00 CET  (vercel.json: "0 5 * * *" UTC)
// Sources : Mon Moniteur, ONSS, SPF Finances, SPF ETCS, Belcotax, CNT
// → Détecte les changements vs snapshot précédent, alerte par email HTML
// ═══════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CRON_SECRET   = process.env.CRON_SECRET;
const ALERT_EMAIL   = 'info@aureus-ia.com';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;


const GH_REPO = 'Aureus-Social/aureus-social';
const GH_PATH = 'app/lib/lois-belges.js';

// ── Patch automatique lois-belges.js via GitHub API ──
async function patchLoisBelges(sourceId, sourceName) {
  const TOKEN = process.env.GH_PUSH_TOKEN || process.env.GITHUB_TOKEN;
  if (!TOKEN) return { pushed: false, reason: 'no_token' };

  try {
    // Récupérer le fichier actuel
    const gr = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${GH_PATH}`, {
      headers: { 'Authorization': `token ${TOKEN}`, 'User-Agent': 'AureusSocialPro' }
    });
    if (!gr.ok) return { pushed: false, reason: `GET ${gr.status}` };
    const file = await gr.json();
    let content = Buffer.from(file.content, 'base64').toString('utf8');

    // Mettre à jour la date de mise à jour et un flag de changement détecté
    const today = new Date().toISOString().split('T')[0];
    content = content.replace(/dateMAJ:\s*'[^']+'/, `dateMAJ: '${today}'`);
    content = content.replace(/dernierChangement:\s*'[^']+'/, `dernierChangement: '${sourceId} — ${today}'`);

    // Push via GitHub API → déclenche redéploiement Vercel automatique
    const pr = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${GH_PATH}`, {
      method: 'PUT',
      headers: { 'Authorization': `token ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `auto(veille): changement détecté — ${sourceName} — ${today}`,
        content: Buffer.from(content).toString('base64'),
        sha: file.sha,
        branch: 'main'
      })
    });
    if (!pr.ok) return { pushed: false, reason: `PUT ${pr.status}` };
    const result = await pr.json();
    return { pushed: true, sha: result.commit?.sha?.substring(0, 7) };
  } catch(e) {
    return { pushed: false, reason: e.message };
  }
}

// ── Sources légales à surveiller ──
const SOURCES = [
  {
    id: 'onss_instructions',
    name: 'ONSS — Instructions administratives',
    url: 'https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/socialsecurity/contributions/contributions.html',
  },
  {
    id: 'rmmmg_cnc',
    name: 'CNT — Salaire minimum interprofessionnel (RMMMG)',
    url: 'https://cnt-nar.be/fr/salaires-baremes-primes/salaire-minimum-interprofessionnel',
  },
  {
    id: 'spf_baremes_pp',
    name: 'SPF Finances — Barèmes précompte professionnel',
    url: 'https://finances.belgium.be/fr/particuliers/impots_sur_le_revenu/precompte_professionnel/tarifs',
  },
  {
    id: 'spf_etcs_cp200',
    name: 'SPF ETCS — Commission paritaire CP200',
    url: 'https://www.emploi.belgique.be/fr/themes/relations-collectives/commissions-paritaires/liste-des-commissions-paritaires/commission-200',
  },
  {
    id: 'belcotax_news',
    name: 'Belcotax — Mises à jour & news',
    url: 'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/belcotax/news',
  },
  {
    id: 'onem_chomage_temp',
    name: 'ONEM — Chômage temporaire',
    url: 'https://www.onem.be/fr/citoyen/chomage-temporaire',
  },
  {
    id: 'socialsecurity_indexation',
    name: 'SSB — Indexation & taux cotisations 2026',
    url: 'https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/socialsecurity/contributions/indexation.html',
  },
  {
    id: 'spf_frais_propres',
    name: 'SPF Finances — Frais propres forfaitaires',
    url: 'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/frais_professionnels/frais_propres_a_lemployeur',
  }
];

// ── Hash FNV-1a (stable, rapide) ──
function hashContent(str) {
  const s = str.replace(/\s+/g, ' ').trim().slice(0, 20000);
  let hash = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
    hash >>>= 0;
  }
  return hash.toString(36);
}

// ── Fetch source avec timeout 8s ──
async function fetchSource(source) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const resp = await fetch(source.url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'AureusSocialPro/2.0 (legal-watch; info@aureus-ia.com)' }
    });
    clearTimeout(t);
    if (!resp.ok) return { id: source.id, error: `HTTP ${resp.status}` };
    const raw = await resp.text();
    const cleaned = raw
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return { id: source.id, hash: hashContent(cleaned), length: cleaned.length, ok: true };
  } catch (e) {
    return { id: source.id, error: process.env.NODE_ENV==="production"?"Erreur interne":(e.message||"Erreur") };
  }
}

// ── Charger hashes précédents depuis Supabase ──
async function loadPreviousHashes() {
  if (!supabase) return {};
  try {
    const { data } = await supabase
      .from('legal_watch_hashes')
      .select('source_id, hash, checked_at')
      .order('checked_at', { ascending: false })
      .limit(100);
    const map = {};
    for (const row of (data || [])) {
      if (!map[row.source_id]) map[row.source_id] = row;
    }
    return map;
  } catch (_) { return {}; }
}

// ── Persister les hashes dans Supabase ──
async function saveHashes(results) {
  if (!supabase) return;
  const now = new Date().toISOString();
  const rows = results.filter(r => r.ok).map(r => ({ source_id: r.id, hash: r.hash, checked_at: now, updated_at: now }));
  if (!rows.length) return;
  try { await supabase.from('legal_watch_hashes').insert(rows); } catch (_) {}
}

// ── Email d'alerte Resend ──
async function sendAlertEmail(changes, totalOk) {
  if (!RESEND_API_KEY || !changes.length) return;
  const rows = changes.map(c => `
    <div style="margin-bottom:12px;padding:14px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:4px;">
      <div style="font-weight:700;color:#92400e;font-size:13px;">${c.name}</div>
      <div style="margin-top:4px;font-size:11px;">
        <a href="${c.url}" style="color:#1d4ed8;word-break:break-all;">${c.url}</a>
      </div>
    </div>`).join('');

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Aureus Veille Legale <noreply@aureus-ia.com>',
      to: [ALERT_EMAIL],
      subject: `[Veille legale] ${changes.length} source(s) modifiee(s) — ${new Date().toLocaleDateString('fr-BE')}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
          <div style="background:#b45309;color:#fff;padding:20px;border-radius:8px 8px 0 0;">
            <h2 style="margin:0;font-size:17px;">Aureus Social Pro — Veille Legale</h2>
            <p style="margin:5px 0 0;opacity:.85;font-size:12px;">${new Date().toLocaleString('fr-BE')}</p>
          </div>
          <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;">
            <p style="font-size:14px;color:#374151;">
              <strong>${changes.length} modification(s)</strong> detectee(s) sur ${totalOk} sources surveillees.
              Verifiez et mettez a jour <code>LOIS_BELGES</code> si necessaire.
            </p>
            <h3 style="color:#92400e;font-size:13px;">Sources modifiees :</h3>
            ${rows}
            <div style="margin-top:16px;padding:12px;background:#dbeafe;border-radius:6px;font-size:12px;color:#1e40af;">
              Connectez-vous a <a href="https://app.aureussocial.be" style="color:#1d4ed8;">app.aureussocial.be</a>
              → Lois Belges → Parametres legaux pour mettre a jour les valeurs.
            </div>
            <p style="margin-top:16px;font-size:10px;color:#9ca3af;">
              Aureus Social Pro — Veille legale 6h00 CET | Aureus IA SPRL BE 1028.230.781
            </p>
          </div>
        </div>`
    })
  });
}

// ── Handler principal ──
export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const t0 = Date.now();
  const results = [];

  // Fetch par lots de 4 en parallèle
  for (let i = 0; i < SOURCES.length; i += 4) {
    const batch = await Promise.all(SOURCES.slice(i, i + 4).map(fetchSource));
    results.push(...batch);
  }

  const prevHashes = await loadPreviousHashes();

  // Détecter changements
  const changes = results
    .filter(r => r.ok && prevHashes[r.id] && prevHashes[r.id].hash !== r.hash)
    .map(r => ({ ...SOURCES.find(s => s.id === r.id) }));

  const errors = results.filter(r => !r.ok);
  const okResults = results.filter(r => r.ok);

  await saveHashes(okResults);
  await sendAlertEmail(changes, okResults.length);

  // ── Auto-patch lois-belges.js si changements détectés ──
  const githubResults = [];
  if (changes.length > 0) {
    // On déclenche le cron baremes complet pour rescaper et mettre à jour
    try {
      const baremesUrl = new URL('/api/cron/baremes', 'https://app.aureussocial.be');
      const cronSecret = process.env.CRON_SECRET;
      const baremesRes = await fetch(baremesUrl.toString(), {
        headers: cronSecret ? { 'Authorization': `Bearer ${cronSecret}` } : {},
        signal: AbortSignal.timeout(55000)
      });
      const baremesJson = await baremesRes.json().catch(() => ({}));
      githubResults.push({ triggered: 'cron/baremes', pushed: baremesJson.pushed, sha: baremesJson.sha });
    } catch(e) {
      // Fallback : juste mettre à jour la date dans lois-belges.js
      for (const change of changes.slice(0, 1)) {
        const r = await patchLoisBelges(change.id, change.name);
        githubResults.push(r);
      }
    }
  }

  // Audit log
  if (supabase) {
    try {
      await supabase.from('audit_log').insert({
        action: 'LEGAL_WATCH_CRON',
        details: {
          sources_checked: okResults.length,
          errors: errors.length,
          changes_detected: changes.length,
          changed: changes.map(c => c.id),
          duration_ms: Date.now() - t0
        },
        created_at: new Date().toISOString()
      });
    } catch (_) {}
  }

  return NextResponse.json({
    ok: true,
    sources_checked: okResults.length,
    errors: errors.length,
    changes_detected: changes.length,
    changed_sources: changes.map(c => c.id),
    duration_ms: Date.now() - t0
  });
}
