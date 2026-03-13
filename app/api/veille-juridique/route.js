import { getAuthUser } from '@/app/lib/supabase';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const sb = () => process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Sources légales à surveiller
const SOURCES = [
  { id: 'onss', name: 'ONSS — Instructions administratives', url: 'https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/socialsecurity/contributions/contributions.html' },
  { id: 'cnt_rmmmg', name: 'CNT — RMMMG salaire minimum', url: 'https://cnt-nar.be/fr/salaires-baremes-primes/salaire-minimum-interprofessionnel' },
  { id: 'spf_pp', name: 'SPF Finances — Barèmes précompte', url: 'https://finances.belgium.be/fr/particuliers/impots_sur_le_revenu/precompte_professionnel/tarifs' },
  { id: 'moniteur', name: 'Moniteur Belge — Lois sociales', url: 'https://www.ejustice.just.fgov.be/loi/loi.htm' },
  { id: 'cnc_cr', name: 'CNT — Chèques-repas', url: 'https://cnt-nar.be/fr/avantages-extrasalariaux/cheques-repas' },
];

async function checkSource(source) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Aureus-Social-Pro/2026 legal-watch' }
    });
    clearTimeout(timeout);
    const text = await res.text();
    // Simple hash: length + first 200 chars hash
    const snippet = text.slice(0, 500);
    const hash = snippet.length + '_' + btoa(snippet.slice(0, 50)).slice(0, 20);
    return { id: source.id, name: source.name, ok: true, status: res.status, hash, checked_at: new Date().toISOString() };
  } catch(e) {
    return { id: source.id, name: source.name, ok: false, error: e.message, checked_at: new Date().toISOString() };
  }
}

export async function GET(req) {
  const u = await getAuthUser(req);
  if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const manual = searchParams.get('manual') === 'true';
  const db = sb();
  const t0 = Date.now();

  // Get previous hashes from Supabase
  let prevHashes = {};
  if (db) {
    try {
      const { data } = await db.from('legal_watch_hashes').select('source_id, hash').limit(50);
      if (data) data.forEach(r => { prevHashes[r.source_id] = r.hash; });
    } catch(e) {}
  }

  // Check sources (max 3 for manual to avoid timeout)
  const sourcesToCheck = manual ? SOURCES.slice(0, 3) : SOURCES;
  const results = await Promise.all(sourcesToCheck.map(checkSource));

  const okResults = results.filter(r => r.ok);
  const errorResults = results.filter(r => !r.ok);
  const changes = okResults.filter(r => prevHashes[r.id] && prevHashes[r.id] !== r.hash);

  // Save new hashes
  if (db && okResults.length > 0) {
    try {
      await db.from('legal_watch_hashes').upsert(
        okResults.map(r => ({ source_id: r.id, hash: r.hash, checked_at: r.checked_at })),
        { onConflict: 'source_id' }
      );
    } catch(e) {}
  }

  // Determine overall status
  const status = changes.length > 0 ? 'CHANGES_DETECTED' : errorResults.length > 2 ? 'ALERTS' : 'UP_TO_DATE';

  const duration = Date.now() - t0;

  // Audit
  if (db && manual) {
    try {
      await db.from('audit_log').insert([{
        user_id: u.id, user_email: u.email,
        action: 'VEILLE_JURIDIQUE_MANUAL',
        table_name: 'legal_watch',
        details: { sources_checked: okResults.length, changes_detected: changes.length, duration_ms: duration },
        created_at: new Date().toISOString(),
      }]);
    } catch(e) {}
  }

  return Response.json({
    ok: true,
    status,
    sources: results.map(r => ({
      id: r.id, name: r.name, ok: r.ok, status: r.status || null,
      changed: changes.some(c => c.id === r.id),
      error: r.error || null, checked_at: r.checked_at,
    })),
    changes: changes.map(r => ({ id: r.id, name: r.name })),
    alerts: errorResults.map(r => ({ id: r.id, name: r.name, error: r.error })),
    summary: {
      total: results.length, ok: okResults.length,
      errors: errorResults.length, changes: changes.length,
    },
    duration,
  });
}
