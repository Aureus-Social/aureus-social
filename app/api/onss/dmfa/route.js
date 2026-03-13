// ═══════════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — API DmfA XML (Déclaration Multifonctionnelle ONSS)
// POST /api/onss/dmfa
// Génère le XML DmfA trimestriel + l'enregistre dans Supabase + le retourne
// Ref: ONSS — Instructions administratives DmfA
//      https://www.socialsecurity.be/employer/instructions/dmfa
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

const ONSS_NUMBER = '5135771602';  // Matricule provisoire Aureus IA SPRL

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// ── Taux ONSS 2026 ──
const TX_ONSS_W  = 0.1307;
const TX_ONSS_E  = 0.2500;  // taux patronal global (CP200 env.)
const COEF_108   = 1.08;    // base ouvriers = brut × 1.08

// ── Calcul cotisations ONSS par travailleur ──
function calcCotisations(emp, quarter) {
  const isOuvrier = (emp.statut || emp.status_type || '').toLowerCase().includes('ouvrier');
  const brutMensuel = +(emp.gross || emp.brut || emp.monthlySalary || 0);
  const brutTrimestriel = brutMensuel * 3;
  const baseCotisations = isOuvrier
    ? Math.round(brutTrimestriel * COEF_108 * 100) / 100
    : brutTrimestriel;

  const cotTravailleur = Math.round(baseCotisations * TX_ONSS_W * 100) / 100;
  const cotPatronat    = Math.round(baseCotisations * TX_ONSS_E * 100) / 100;
  const reductionsPrime = _calcReductions(emp, brutTrimestriel);

  return {
    brutTrimestriel,
    baseCotisations,
    cotTravailleur,
    cotPatronat,
    cotPatronalNet: Math.max(0, cotPatronat - reductionsPrime),
    reductions: reductionsPrime,
    isOuvrier
  };
}

// ── Réductions groupe-cible ONSS ──
function _calcReductions(emp, brutTrim) {
  let reductions = 0;

  // 1er employé → exonération totale cotisations patronales
  if (emp.premier_employe || emp.firstEmployee) {
    reductions += Math.round(brutTrim * TX_ONSS_E * 100) / 100;
    return reductions; // Pas besoin de cumuler
  }

  // Bas salaires (CESS) — réduction structurelle
  const brutMens = brutTrim / 3;
  if (brutMens <= 1945.38) {
    reductions += 667 * 3; // max trimestriel bas salaires 2026
  } else if (brutMens <= 3207.40) {
    const base = 667 - Math.max(0, (brutMens - 1945.38) / (3207.40 - 1945.38) * 667);
    reductions += Math.round(base * 3 * 100) / 100;
  }

  return reductions;
}

// ── Construction ligne DmfA par travailleur ──
function buildWorkerBlock(emp, quarter, year) {
  const niss = (emp.niss || emp.nationalRegisterNumber || '').replace(/\D/g, '');
  if (!niss) return null;

  const cots = calcCotisations(emp, quarter);
  const cp   = String(emp.cp || emp.cpId || '200').replace(/[^0-9]/g, '');
  const contractCode = (emp.contractType || 'CTT') === 'CDD' ? 'CTT' : 'CDI';
  const regime = emp.regime || '1'; // 1=temps plein, 2=temps partiel

  const months = [1, 2, 3].map(m => {
    const month = (quarter - 1) * 3 + m;
    const jours = 30; // simplification — à affiner si temps partiel
    const salMens = Math.round(cots.brutTrimestriel / 3 * 100) / 100;
    return `
    <mois numero="${month}">
      <salaire>${salMens.toFixed(2)}</salaire>
      <joursPrestes>${jours}</joursPrestes>
    </mois>`;
  }).join('');

  return `
  <travailleur>
    <niss>${niss}</niss>
    <nom>${escXml((emp.last || emp.ln || '').toUpperCase())}</nom>
    <prenom>${escXml(emp.first || emp.fn || '')}</prenom>
    <dateEntree>${emp.startDate || `${year}-01-01`}</dateEntree>
    <cp>${cp}</cp>
    <contrat>${contractCode}</contrat>
    <regime>${regime}</regime>
    <prestations>${months}
    </prestations>
    <remunerations>
      <remunerationBrute>${cots.brutTrimestriel.toFixed(2)}</remunerationBrute>
      <baseCotisations>${cots.baseCotisations.toFixed(2)}</baseCotisations>
    </remunerations>
    <cotisations>
      <cotisationTravailleur>${cots.cotTravailleur.toFixed(2)}</cotisationTravailleur>
      <cotisationPatronale>${cots.cotPatronat.toFixed(2)}</cotisationPatronale>
      <reductionsGroupeCible>${cots.reductions.toFixed(2)}</reductionsGroupeCible>
      <cotisationPatronaleNette>${cots.cotPatronalNet.toFixed(2)}</cotisationPatronaleNette>
    </cotisations>
  </travailleur>`;
}

function escXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ── Génération DmfA XML complet ──
function generateDmfaXml({ emps, quarter, year, co }) {
  const validEmps = emps.filter(e => {
    const niss = (e.niss || e.nationalRegisterNumber || '').replace(/\D/g, '');
    return niss.length === 11;
  });

  const workerBlocks = validEmps
    .map(e => buildWorkerBlock(e, quarter, year))
    .filter(Boolean)
    .join('');

  // Totaux
  const totals = validEmps.reduce((acc, emp) => {
    const c = calcCotisations(emp, quarter);
    acc.brutTotal    += c.brutTrimestriel;
    acc.cotTrav      += c.cotTravailleur;
    acc.cotPat       += c.cotPatronat;
    acc.cotPatNet    += c.cotPatronalNet;
    acc.reductions   += c.reductions;
    return acc;
  }, { brutTotal: 0, cotTrav: 0, cotPat: 0, cotPatNet: 0, reductions: 0 });

  const msgId  = `DMFA-${year}Q${quarter}-${Date.now().toString(36).toUpperCase()}`;
  const coName = escXml(co?.name || 'Aureus IA SPRL');
  const coVat  = (co?.vat || 'BE1028230781').replace(/[^A-Z0-9]/g, '');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- DmfA - Déclaration Multifonctionnelle ONSS -->
<!-- Aureus Social Pro — Générée le ${new Date().toISOString()} -->
<DmfA xmlns="urn:onss:dmfa:v20"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <entete>
    <messageId>${msgId}</messageId>
    <dateCreation>${new Date().toISOString().slice(0, 10)}</dateCreation>
    <trimestre>${year}T${quarter}</trimestre>
    <version>20</version>
    <emetteur>
      <nom>Aureus Social Pro</nom>
      <siteWeb>app.aureussocial.be</siteWeb>
    </emetteur>
  </entete>
  <employeur>
    <matriculeONSS>${ONSS_NUMBER}</matriculeONSS>
    <nom>${coName}</nom>
    <numeroTVA>${coVat}</numeroTVA>
    <nombreTravailleurs>${validEmps.length}</nombreTravailleurs>
  </employeur>
  <travailleurs>${workerBlocks}
  </travailleurs>
  <totaux>
    <remunerationBruteTotale>${totals.brutTotal.toFixed(2)}</remunerationBruteTotale>
    <totalCotisationsTravailleur>${totals.cotTrav.toFixed(2)}</totalCotisationsTravailleur>
    <totalCotisationsPatronales>${totals.cotPat.toFixed(2)}</totalCotisationsPatronales>
    <totalReductionsGroupeCible>${totals.reductions.toFixed(2)}</totalReductionsGroupeCible>
    <totalCotisationsPatronalesNettes>${totals.cotPatNet.toFixed(2)}</totalCotisationsPatronalesNettes>
    <totalDu>${(totals.cotTrav + totals.cotPatNet).toFixed(2)}</totalDu>
  </totaux>
</DmfA>`;
}

// ── Handler POST ──
export async function POST(request) {
  try {
    const caller = await getAuthUser(request);
    if (!caller) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    if (!['admin', 'secretariat'].includes(caller.role))
      return Response.json({ error: 'Rôle insuffisant' }, { status: 403 });

    const body = await request.json();
    const { emps, quarter, year, co, preview } = body;

    if (!emps || !Array.isArray(emps) || emps.length === 0)
      return Response.json({ error: 'Liste travailleurs vide' }, { status: 400 });
    if (!quarter || quarter < 1 || quarter > 4)
      return Response.json({ error: 'Trimestre invalide (1-4)' }, { status: 400 });

    const currentYear = year || new Date().getFullYear();
    const xml = generateDmfaXml({ emps, quarter, year: currentYear, co });

    // Calculer les totaux pour la réponse
    const validEmps = emps.filter(e => (e.niss || e.nationalRegisterNumber || '').replace(/\D/g, '').length === 11);
    const totals = validEmps.reduce((acc, emp) => {
      const c = calcCotisations(emp, quarter);
      acc.brutTotal  += c.brutTrimestriel;
      acc.cotTrav    += c.cotTravailleur;
      acc.cotPat     += c.cotPatronat;
      acc.cotPatNet  += c.cotPatronalNet;
      acc.reductions += c.reductions;
      return acc;
    }, { brutTotal: 0, cotTrav: 0, cotPat: 0, cotPatNet: 0, reductions: 0 });

    // Sauvegarder dans Supabase (sauf mode preview)
    let declarationId = null;
    if (!preview && supabase) {
      try {
        const { data: decl } = await supabase.from('declarations').insert({
          type: 'dmfa',
          period: `${currentYear}Q${quarter}`,
          status: 'generated',
          data: {
            quarter,
            year: currentYear,
            nb_workers: validEmps.length,
            totals,
            xml_size: xml.length,
            generated_by: caller.id,
            generated_at: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        }).select('id').single();
        declarationId = decl?.id;

        // Audit log
        await supabase.from('audit_log').insert({
          user_id: caller.id,
          action: 'DMFA_GENERATE',
          details: {
            period: `${currentYear}Q${quarter}`,
            nb_workers: validEmps.length,
            total_du: (totals.cotTrav + totals.cotPatNet).toFixed(2)
          },
          created_at: new Date().toISOString()
        });
      } catch (_) {}
    }

    return Response.json({
      ok: true,
      xml,
      filename: `DmfA_${currentYear}T${quarter}_${new Date().toISOString().slice(0, 10)}.xml`,
      declarationId,
      period: `${currentYear}T${quarter}`,
      nb_workers: validEmps.length,
      nb_without_niss: emps.length - validEmps.length,
      totals: {
        brut_trimestriel:    +totals.brutTotal.toFixed(2),
        cot_travailleur:     +totals.cotTrav.toFixed(2),
        cot_patronale:       +totals.cotPat.toFixed(2),
        reductions:          +totals.reductions.toFixed(2),
        cot_patronale_nette: +totals.cotPatNet.toFixed(2),
        total_du:            +(totals.cotTrav + totals.cotPatNet).toFixed(2)
      }
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// ── GET — Historique DmfA ──
export async function GET(request) {
  try {
    const caller = await getAuthUser(request);
    if (!caller) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    if (!supabase) return Response.json({ declarations: [] });

    const { data } = await supabase
      .from('declarations')
      .select('id, period, status, data, created_at')
      .eq('type', 'dmfa')
      .order('created_at', { ascending: false })
      .limit(20);

    return Response.json({ declarations: data || [] });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
