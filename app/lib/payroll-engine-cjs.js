// ═══════════════════════════════════════════════════════════
// PAYROLL ENGINE — Version CommonJS pour tests Jest
// Conforme barèmes SPF Finances 2026
// ═══════════════════════════════════════════════════════════

const TX_ONSS_W = 0.1307;
const TX_ONSS_E = 0.2719;
const TX_OUV108 = 1.08;
const RMMMG = (typeof globalThis !== "undefined" && globalThis.__LOIS_BELGES?.salaires?.RMMMG?.montant18ans) || 2070.48; // fallback uniquement — valeur réelle via LOIS_BELGES
const CR_MAX = 8.00;
const CR_PAT = 6.91;
const CR_TRAV = 1.09;
const PV_DOUBLE = 0.92;
const PV_SIMPLE = 0.1534;

// Bonus emploi 2026
const BONUS_SEUIL1 = 2024.24;
const BONUS_SEUIL2 = 2968.70;
const BONUS_MAX    = 181.42;

function calcBonusEmploi(brut) {
  if (brut <= BONUS_SEUIL1) return BONUS_MAX;
  if (brut <= BONUS_SEUIL2) {
    return Math.round(BONUS_MAX * (1 - (brut - BONUS_SEUIL1) / (BONUS_SEUIL2 - BONUS_SEUIL1)) * 100) / 100;
  }
  return 0;
}

// CSSS mensuelle
function calcCSS(brut) {
  const an = brut * 12;
  if (an <= 18592.01) return 0;
  if (an <= 21070.84) return Math.round((an - 18592.01) * 0.076 / 12 * 100) / 100;
  if (an <= 60161.85) return Math.round((189.03 + (an - 21070.84) * 0.1676) / 12 * 100) / 100;
  return Math.round(7364.07 / 12 * 100) / 100;
}

// Réductions PP 2026
const REDUCTIONS = {
  // Quotité exemptée mensuelle → réduction PP correspondante
  isole:    { quotite: 9990 / 12 * 0.2675 },   // ~222 EUR/mois
  marie_1r: { quotite: 9990 / 12 * 0.2675 + 10090 / 12 * 0.2675 }, // double quotité conjoint à charge
};

// Réductions enfants à charge (mensuel 2026)
const RED_ENFANT = [0, 52, 138, 367, 635, 735, 835];

/**
 * calcPrecompteExact — Barèmes SPF 2026
 */
function calcPrecompteExact(brutMensuel, options = {}) {
  const { situation = 'isole', enfants = 0, atn = 0, fraisPropres = 0, regime = 100 } = options;
  
  // Appliquer le régime horaire (temps partiel)
  const brutEffectif = Math.round(+brutMensuel * (+regime || 100) / 100 * 100) / 100;
  const brut = +brutMensuel || 0;
  
  // ONSS sur brut réel
  const onssW = Math.round(brut * TX_ONSS_W * 100) / 100;
  
  // Base imposable sur brut effectif (régime)
  const imposable = Math.max(0, brutEffectif - Math.round(brutEffectif * TX_ONSS_W * 100) / 100 + atn - fraisPropres);
  
  // Calcul PP brut (tranches annuelles → mensuel)
  let ppBrut = 0;
  const AN = imposable * 12;
  if (AN <= 0) { ppBrut = 0; }
  else if (AN <= 16710) { ppBrut = AN * 0.2675 / 12; }
  else if (AN <= 29500) { ppBrut = (16710 * 0.2675 + (AN - 16710) * 0.4280) / 12; }
  else if (AN <= 51050) { ppBrut = (16710 * 0.2675 + (29500 - 16710) * 0.4280 + (AN - 29500) * 0.4815) / 12; }
  else { ppBrut = (16710 * 0.2675 + (29500 - 16710) * 0.4280 + (51050 - 29500) * 0.4815 + (AN - 51050) * 0.5350) / 12; }
  
  // Réductions
  const red = REDUCTIONS[situation] || REDUCTIONS.isole;
  const redEnfants = RED_ENFANT[Math.min(+enfants || 0, RED_ENFANT.length - 1)] || 0;
  const bonusEmploi = calcBonusEmploi(brutEffectif);
  
  let pp = Math.max(0, ppBrut - red.quotite - redEnfants - bonusEmploi);
  pp = Math.round(pp * 100) / 100;
  
  const css = calcCSS(brutEffectif);
  const net = Math.round((imposable - pp - css) * 100) / 100;
  const onssE = Math.round(brut * TX_ONSS_E * 100) / 100;
  
  return { pp, bonusEmploi, css, onssW, imposable, net, coutEmployeur: brut + onssE, brut };
}

module.exports = {
  calcPrecompteExact,
  calcBonusEmploi,
  calcCSS,
  TX_ONSS_W,
  TX_ONSS_E,
  TX_OUV108,
  RMMMG,
  CR_MAX,
  CR_PAT,
  CR_TRAV,
  PV_DOUBLE,
  PV_SIMPLE,
  BONUS_MAX,
  BONUS_SEUIL1,
  BONUS_SEUIL2,
};
