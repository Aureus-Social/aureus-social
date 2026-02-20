// ═══════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — API LOIS UPDATE
// Sprint 37+ : Import/MAJ en 1 clic via Supabase
// Route: /api/lois-update
// Flow: Upload JSON → Validate → Store in Supabase → Admin approves → Apply
// ═══════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// ─── Reference structure for validation ─────────────────────────────
const VALID_KEYS = {
  'onss.travailleur': { type: 'pct', min: 0.05, max: 0.25, label: 'ONSS travailleur' },
  'onss.employeur.total': { type: 'pct', min: 0.15, max: 0.40, label: 'ONSS employeur total' },
  'onss.ouvrier108': { type: 'num', min: 1.0, max: 1.2, label: 'Majoration ouvriers' },
  'pp.tranches.0.taux': { type: 'pct', min: 0.20, max: 0.35, label: 'PP Tranche 1 taux' },
  'pp.tranches.0.max': { type: 'num', min: 10000, max: 25000, label: 'PP Tranche 1 max' },
  'pp.tranches.1.taux': { type: 'pct', min: 0.35, max: 0.50, label: 'PP Tranche 2 taux' },
  'pp.tranches.1.max': { type: 'num', min: 20000, max: 40000, label: 'PP Tranche 2 max' },
  'pp.tranches.2.taux': { type: 'pct', min: 0.40, max: 0.55, label: 'PP Tranche 3 taux' },
  'pp.tranches.2.max': { type: 'num', min: 40000, max: 70000, label: 'PP Tranche 3 max' },
  'pp.tranches.3.taux': { type: 'pct', min: 0.45, max: 0.60, label: 'PP Tranche 4 taux' },
  'pp.fraisPro.salarie.pct': { type: 'pct', min: 0.20, max: 0.40, label: 'Frais pro salarié %' },
  'pp.fraisPro.salarie.max': { type: 'num', min: 4000, max: 8000, label: 'Frais pro salarié max' },
  'pp.quotiteExemptee.bareme1': { type: 'num', min: 8000, max: 15000, label: 'Quotité exemptée B1' },
  'pp.quotiteExemptee.bareme2': { type: 'num', min: 16000, max: 30000, label: 'Quotité exemptée B2' },
  'pp.quotientConjugal.max': { type: 'num', min: 10000, max: 20000, label: 'Quotient conjugal max' },
  'pp.bonusEmploi.maxMensuel': { type: 'num', min: 100, max: 300, label: 'Bonus emploi max' },
  'remuneration.RMMMG.montant18ans': { type: 'num', min: 1500, max: 3000, label: 'RMMMG 18 ans' },
  'remuneration.indexSante.coeff': { type: 'num', min: 1.5, max: 3.0, label: 'Coefficient index santé' },
  'remuneration.peculeVacances.simple.pct': { type: 'pct', min: 0.05, max: 0.15, label: 'Pécule simple %' },
  'remuneration.peculeVacances.double.pct': { type: 'pct', min: 0.80, max: 1.0, label: 'Pécule double %' },
  'chequesRepas.valeurFaciale.max': { type: 'num', min: 5, max: 12, label: 'Chèques-repas VF max' },
  'chequesRepas.partTravailleur.min': { type: 'num', min: 0.5, max: 3, label: 'CR part travailleur' },
  'chequesRepas.partPatronale.max': { type: 'num', min: 4, max: 10, label: 'CR part patronale max' },
  'fraisPropres.forfaitBureau.max': { type: 'num', min: 100, max: 250, label: 'Forfait bureau max' },
  'fraisPropres.forfaitDeplacement.voiture': { type: 'num', min: 0.30, max: 0.60, label: 'Forfait km voiture' },
  'assurances.accidentTravail.taux': { type: 'pct', min: 0.005, max: 0.05, label: 'Taux accident travail' },
  'assurances.medecineTravail.cout': { type: 'num', min: 50, max: 150, label: 'Coût médecine travail' },
  'tempsTravail.dureeHebdoLegale': { type: 'num', min: 35, max: 40, label: 'Durée hebdo légale' },
  'atn.voiture.min': { type: 'num', min: 1000, max: 2500, label: 'ATN voiture min annuel' },
  'atn.gsm.forfait': { type: 'num', min: 1, max: 10, label: 'ATN GSM forfait' },
  'atn.pc.forfait': { type: 'num', min: 1, max: 10, label: 'ATN PC forfait' },
  'atn.internet.forfait': { type: 'num', min: 1, max: 10, label: 'ATN Internet forfait' },
};

/** Validate an update payload against reference schema */
function validateUpdate(payload) {
  const errors = [];
  const warnings = [];
  const validated = {};

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Payload invalide: objet JSON attendu'], warnings: [], validated: {} };
  }

  // Check for _meta (required)
  if (!payload._meta?.annee) {
    warnings.push('Champ _meta.annee manquant — recommandé pour traçabilité');
  }

  // Validate each key-value pair
  for (const [key, value] of Object.entries(payload)) {
    if (key.startsWith('_')) continue; // Skip meta fields

    const spec = VALID_KEYS[key];
    if (!spec) {
      warnings.push(`Clé inconnue: "${key}" — ignorée`);
      continue;
    }

    const numVal = parseFloat(value);
    if (isNaN(numVal)) {
      errors.push(`${spec.label} ("${key}"): valeur non numérique "${value}"`);
      continue;
    }

    if (numVal < spec.min || numVal > spec.max) {
      errors.push(`${spec.label}: ${numVal} hors limites [${spec.min} – ${spec.max}]. Vérifiez la valeur.`);
      continue;
    }

    validated[key] = numVal;
  }

  if (Object.keys(validated).length === 0 && errors.length === 0) {
    errors.push('Aucun paramètre valide trouvé dans le JSON');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validated,
    count: Object.keys(validated).length,
  };
}

/** Deep set a value in LOIS_BELGES structure by dot path */
function resolveChanges(validated, currentLois) {
  const changes = [];
  for (const [key, newVal] of Object.entries(validated)) {
    const parts = key.split('.');
    let current = currentLois;
    let currentVal = undefined;
    for (const p of parts) {
      if (current && typeof current === 'object') {
        current = current[p];
      } else {
        current = undefined;
        break;
      }
    }
    currentVal = current;
    
    const spec = VALID_KEYS[key];
    changes.push({
      key,
      label: spec?.label || key,
      oldValue: currentVal,
      newValue: newVal,
      changed: currentVal !== undefined && Math.abs(currentVal - newVal) > 0.0001,
      type: spec?.type || 'num',
    });
  }
  return changes;
}

// ─── Handlers ───────────────────────────────────────────────────────

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    const supabase = getSupabase();

    switch (action) {
      // ── VALIDATE: Check JSON without saving ──
      case 'validate': {
        const result = validateUpdate(body.payload);
        return NextResponse.json({
          action: 'validate',
          ...result,
          timestamp: new Date().toISOString(),
        });
      }

      // ── UPLOAD: Validate + store pending update in Supabase ──
      case 'upload': {
        if (!supabase) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });

        const validation = validateUpdate(body.payload);
        if (!validation.valid) {
          return NextResponse.json({
            action: 'upload',
            status: 'rejected',
            ...validation,
          });
        }

        // Store in Supabase
        const record = {
          status: 'pending',
          payload: body.payload,
          validated: validation.validated,
          changes_count: validation.count,
          annee: body.payload._meta?.annee || new Date().getFullYear(),
          version: body.payload._meta?.version || 'custom',
          source: body.source || 'manual_upload',
          uploaded_by: body.userId || 'admin',
          notes: body.notes || '',
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('lois_updates')
          .insert(record)
          .select()
          .single();

        if (error) {
          // Table might not exist yet — create it
          if (error.message?.includes('does not exist') || error.code === '42P01') {
            return NextResponse.json({
              action: 'upload',
              status: 'table_missing',
              message: 'Table lois_updates n\'existe pas encore. Exécutez le SQL de migration.',
              migration: MIGRATION_SQL,
              validation,
            });
          }
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          action: 'upload',
          status: 'pending',
          id: data.id,
          ...validation,
          message: `${validation.count} paramètre(s) validé(s) et stocké(s). En attente d'approbation admin.`,
        });
      }

      // ── APPROVE: Admin approves a pending update ──
      case 'approve': {
        if (!supabase) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
        const { id } = body;
        if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

        const { data: update, error: fetchErr } = await supabase
          .from('lois_updates')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchErr || !update) {
          return NextResponse.json({ error: 'Update non trouvé' }, { status: 404 });
        }

        if (update.status !== 'pending') {
          return NextResponse.json({ error: `Statut actuel: ${update.status}. Seuls les updates "pending" peuvent être approuvés.` }, { status: 400 });
        }

        // Mark as approved
        const { error: updateErr } = await supabase
          .from('lois_updates')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: body.userId || 'admin',
          })
          .eq('id', id);

        if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

        return NextResponse.json({
          action: 'approve',
          status: 'approved',
          id,
          validated: update.validated,
          message: `Update #${id} approuvé. Les valeurs seront appliquées au prochain chargement.`,
        });
      }

      // ── APPLY: Apply approved update (returns values for frontend to use) ──
      case 'apply': {
        if (!supabase) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
        const { id: applyId } = body;

        let query = supabase.from('lois_updates').select('*');
        if (applyId) {
          query = query.eq('id', applyId);
        } else {
          query = query.eq('status', 'approved').order('created_at', { ascending: false }).limit(1);
        }

        const { data: updates, error: queryErr } = await query;
        if (queryErr) return NextResponse.json({ error: queryErr.message }, { status: 500 });

        const update = Array.isArray(updates) ? updates[0] : updates;
        if (!update) {
          return NextResponse.json({ action: 'apply', status: 'nothing', message: 'Aucun update approuvé en attente.' });
        }

        // Mark as applied
        await supabase
          .from('lois_updates')
          .update({
            status: 'applied',
            applied_at: new Date().toISOString(),
          })
          .eq('id', update.id);

        return NextResponse.json({
          action: 'apply',
          status: 'applied',
          id: update.id,
          validated: update.validated,
          annee: update.annee,
          version: update.version,
          changes_count: update.changes_count,
          message: `${update.changes_count} paramètre(s) appliqué(s) depuis update #${update.id}.`,
        });
      }

      // ── ROLLBACK: Revert to previous version ──
      case 'rollback': {
        if (!supabase) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
        const { id: rollbackId } = body;
        if (!rollbackId) return NextResponse.json({ error: 'ID requis pour rollback' }, { status: 400 });

        const { error: rbErr } = await supabase
          .from('lois_updates')
          .update({
            status: 'rolled_back',
            rolled_back_at: new Date().toISOString(),
          })
          .eq('id', rollbackId);

        if (rbErr) return NextResponse.json({ error: rbErr.message }, { status: 500 });

        return NextResponse.json({
          action: 'rollback',
          status: 'rolled_back',
          id: rollbackId,
          message: `Update #${rollbackId} annulé. Rechargez pour revenir aux valeurs par défaut.`,
        });
      }

      // ── LIST: Get all updates ──
      case 'list': {
        if (!supabase) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });

        const { data: updates, error: listErr } = await supabase
          .from('lois_updates')
          .select('id,status,annee,version,changes_count,source,uploaded_by,notes,created_at,approved_at,applied_at')
          .order('created_at', { ascending: false })
          .limit(20);

        if (listErr) {
          if (listErr.message?.includes('does not exist')) {
            return NextResponse.json({ action: 'list', updates: [], migration: MIGRATION_SQL });
          }
          return NextResponse.json({ error: listErr.message }, { status: 500 });
        }

        return NextResponse.json({ action: 'list', updates: updates || [] });
      }

      // ── STATUS ──
      case 'status': {
        return NextResponse.json({
          action: 'status',
          supabase: !!supabase,
          validKeys: Object.keys(VALID_KEYS).length,
          migration: !supabase ? 'Supabase non configuré' : 'OK',
        });
      }

      default:
        return NextResponse.json({ error: `Action inconnue: ${action}` }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// SQL migration for creating the table
const MIGRATION_SQL = `
-- Table: lois_updates
-- Stocke les mises à jour de la base légale LOIS_BELGES
CREATE TABLE IF NOT EXISTS lois_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','applied','rejected','rolled_back')),
  payload JSONB NOT NULL,
  validated JSONB NOT NULL,
  changes_count INTEGER NOT NULL DEFAULT 0,
  annee INTEGER NOT NULL,
  version TEXT,
  source TEXT DEFAULT 'manual_upload',
  uploaded_by TEXT,
  approved_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  rolled_back_at TIMESTAMPTZ
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_lois_updates_status ON lois_updates(status);
CREATE INDEX IF NOT EXISTS idx_lois_updates_annee ON lois_updates(annee);

-- RLS policies
ALTER TABLE lois_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON lois_updates FOR ALL USING (true);
`;

export async function GET() {
  return NextResponse.json({
    service: 'lois-update',
    version: '1.0',
    endpoints: {
      'POST /validate': 'Valider un JSON sans sauvegarder',
      'POST /upload': 'Valider + stocker en attente dans Supabase',
      'POST /approve': 'Approuver un update en attente',
      'POST /apply': 'Appliquer le dernier update approuvé',
      'POST /rollback': 'Annuler un update appliqué',
      'POST /list': 'Lister tous les updates',
    },
    validKeys: Object.keys(VALID_KEYS).length,
    migration: MIGRATION_SQL,
  });
}
