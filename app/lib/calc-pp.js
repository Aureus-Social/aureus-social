// ═══ AUREUS SOCIAL PRO — Module: Précompte Professionnel + CSSS + Bonus Emploi ═══
// Barème 2026, Art. 275-289 CIR 92
import { LOIS_BELGES } from './lois-belges.js';

function calcPrecompteExact(brutMensuel, options) {
  const opts = options || {};
  const situation = opts.situation || 'isole';
  const enfants = +(opts.enfants || 0);
  const enfantsHandicapes = +(opts.enfantsHandicapes || 0);
  const handicape = !!opts.handicape;
  const conjointHandicape = !!opts.conjointHandicape;
  const conjointRevenus = !!opts.conjointRevenus;
  const conjointRevenuLimite = !!opts.conjointRevenuLimite;
  const conjointPensionLimitee = !!opts.conjointPensionLimitee;
  const parentIsole = !!opts.parentIsole;
  const personnes65 = +(opts.personnes65 || 0);
  const autresCharges = +(opts.autresCharges || 0);
  const dirigeant = !!opts.dirigeant;
  const taxeCom = +(opts.taxeCom || 7) / 100;
  const regime = +(opts.regime || 100) / 100;
  const isBareme2 = situation === 'marie_1r' || (situation === 'cohabitant' && !conjointRevenus);

  const brut = brutMensuel * regime;
  if (brut <= 0) return { pp: 0, rate: 0, forfait: 0, reduction: 0, bonusEmploi: 0, detail: {} };

  // 1. ONSS travailleur 13.07%
  const onss = Math.round(brut * _OW * 100) / 100;
  const imposable = brut - onss;

  // 2. Annualisation
  const annuel = imposable * 12;

  // 3. Frais professionnels forfaitaires 2026
  let forfaitAn = 0;
  if (dirigeant) {
    forfaitAn = Math.min(annuel * LOIS_BELGES.pp.fraisPro.dirigeant.pct, LOIS_BELGES.pp.fraisPro.dirigeant.max);
  } else {
    forfaitAn = Math.min(annuel * LOIS_BELGES.pp.fraisPro.salarie.pct, LOIS_BELGES.pp.fraisPro.salarie.max);
  }

  // 4. Revenu net imposable annuel
  const baseAnnuelle = Math.max(0, annuel - forfaitAn);

  // 5. Quotient conjugal (barème 2 uniquement)
  let qcAttribue = 0;
  let baseApresQC = baseAnnuelle;
  if (isBareme2) {
    qcAttribue = Math.min(baseAnnuelle * LOIS_BELGES.pp.quotientConjugal.pct, LOIS_BELGES.pp.quotientConjugal.max);
    baseApresQC = baseAnnuelle - qcAttribue;
  }

  // 6. Impôt progressif — Tranches PP SPF 2026 (Formule-clé Annexe III)
  const calcImpotProgressif = (base) => {
    if (base <= 0) return 0;
    const T=LOIS_BELGES.pp.tranches;let imp=0,prev=0;for(const t of T){const s=Math.min(base,t.max)-Math.max(prev,t.min);if(s>0)imp+=s*t.taux;prev=t.max;}return imp;
  };
  let impot = calcImpotProgressif(baseApresQC);

  // Impôt sur quotient conjugal (même barème progressif)
  if (isBareme2 && qcAttribue > 0) {
    impot += calcImpotProgressif(qcAttribue);
  }

  // 7. Réduction quotité exemptée
  const qeBase = isBareme2 ? LOIS_BELGES.pp.quotiteExemptee.bareme2 : LOIS_BELGES.pp.quotiteExemptee.bareme1;
  const redQE = qeBase;

  // 8. Réduction enfants à charge (montants annuels 2026)
  const tabEnfants = LOIS_BELGES.pp.reductionsEnfants;
  const suppEnfant = LOIS_BELGES.pp.reductionEnfantSupp;
  const enfTotal = enfants + enfantsHandicapes; // handicapés comptent double fiscalement
  const enfFiscaux = enfTotal + enfantsHandicapes; // double comptage
  let redEnfants = 0;
  if (enfFiscaux > 0) {
    if (enfFiscaux <= 8) redEnfants = tabEnfants[enfFiscaux];
    else redEnfants = tabEnfants[8] + (enfFiscaux - 8) * suppEnfant;
  }

  // 9. Réduction parent isolé avec enfants
  let redParentIsole = 0;
  if (parentIsole && enfTotal > 0) redParentIsole = LOIS_BELGES.pp.reductionParentIsole;

  // 10. Réduction bénéficiaire handicapé
  let redHandicape = 0;
  if (handicape) redHandicape = LOIS_BELGES.pp.reductionHandicape;

  // 11. Réduction conjoint handicapé (barème 2)
  let redConjHandicape = 0;
  if (isBareme2 && conjointHandicape) redConjHandicape = LOIS_BELGES.pp.reductionConjointHandicape;

  // 12. Réduction conjoint revenu limité
  let redConjRevLimite = 0;
  if (conjointRevenuLimite) redConjRevLimite = LOIS_BELGES.pp.reductionConjointRevenuLimite;

  // 13. Réduction conjoint pension limitée
  let redConjPension = 0;
  if (conjointPensionLimitee) redConjPension = LOIS_BELGES.pp.reductionConjointPensionLimitee;

  // 14. Réduction personnes 65+ à charge
  let redP65 = personnes65 * LOIS_BELGES.pp.reductionPersonne65;

  // 15. Réduction autres personnes à charge
  let redAutres = autresCharges * LOIS_BELGES.pp.reductionAutreCharge;

  // Total réductions annuelles
  const totalReductions = redQE + redEnfants + redParentIsole + redHandicape + redConjHandicape + redConjRevLimite + redConjPension + redP65 + redAutres;

  // 6b. Impôt annuel après réductions
  const impotApresReduc = Math.max(0, impot - totalReductions);

  // 16. Taxe communale
  const impotAvecTaxeCom = Math.round(impotApresReduc * (1 + taxeCom) * 100) / 100;

  // Bonus emploi fiscal (33.14% réduction sur bonus social ONSS)
  const bonusEmploi = 0; // calculé séparément si nécessaire

  // PP mensuel
  const ppMensuel = Math.round(impotAvecTaxeCom / 12 * 100) / 100;

  // Taux effectif
  const taux = brut > 0 ? Math.round(ppMensuel / brut * 10000) / 100 : 0;

  return {
    pp: ppMensuel,
    rate: taux,
    forfait: Math.round(forfaitAn / 12 * 100) / 100,
    reduction: Math.round(totalReductions / 12 * 100) / 100,
    bonusEmploi,
    detail: {
      brut, onss, imposable, annuel, forfaitAn,
      baseAnnuelle, qcAttribue, baseApresQC,
      impotBrut: Math.round(impot * 100) / 100,
      redQE, redEnfants, redParentIsole, redHandicape,
      redConjHandicape, redConjRevLimite, redConjPension, redP65, redAutres,
      totalReductions: Math.round(totalReductions * 100) / 100,
      impotApresReduc: Math.round(impotApresReduc * 100) / 100,
      impotAvecTaxeCom,
      ppMensuel, taux,
      situation, enfants, enfantsHandicapes, dirigeant, isBareme2
    }
  };
}
// Helper rapide: PP pour un brut donné (defaults isolé, 0 enfant)
function quickPP(brut,sit,enf){return calcPrecompteExact(brut,{situation:sit||'isole',enfants:enf||0}).pp;}
function quickNet(brut,sit,enf){const o=Math.round(brut*_OW*100)/100;return Math.round((brut-o-quickPP(brut,sit,enf))*100)/100;}

// CSSS — Cotisation Spéciale Sécurité Sociale (AR 29/03/2012)
function calcCSSS(brutMensuel, situation) {
  const brut = brutMensuel;
  const onss = Math.round(brut * _OW * 100) / 100;
  const imposable = brut - onss;
  const annuel = imposable * 12;
  const isole = !situation || situation === 'isole';
  const baremes = isole ? LOIS_BELGES.csss.isole : LOIS_BELGES.csss.menage2revenus;
  // Seuils CSSS dynamiques depuis LOIS_BELGES
  const s0=baremes[0].max, s1=baremes[1].max, s2=baremes[2]?.max||60181.95;
  const t1=baremes[1].taux, t2=baremes[2]?.taux||0.011;
  const base2=baremes[2]?.montant||9.30;
  const plafond=baremes[baremes.length-1].montantFixe||51.64;
  if (annuel <= s0) return 0;
  if (annuel <= s1) return Math.round((annuel - s0) * t1 / 12 * 100) / 100;
  if (isole && baremes.length > 4) {
    const s3=baremes[3]?.min||37344.02, t3=baremes[3]?.taux||0.013;
    if (annuel <= s3) return Math.round((base2 + (annuel - s1) * t2) / 12 * 100) / 100;
    if (annuel <= baremes[4]?.min||60181.95) return Math.round((base2 + (s3 - s1) * t2 + (annuel - s3) * t3) / 12 * 100) / 100;
  } else {
    if (annuel <= s2) return Math.round((base2 + (annuel - s1) * t2) / 12 * 100) / 100;
  }
  return Math.round(plafond / 12 * 100) / 100;
}

// Bonus emploi (Art. 289ter CIR) — Réduction fiscale
function calcBonusEmploi(brutMensuel) {
  if (brutMensuel <= 0) return 0;
  const onss = Math.round(brutMensuel * _OW * 100) / 100;
  const refSalaire = brutMensuel;
  const BE = LOIS_BELGES.pp.bonusEmploi;
  const seuil1 = BE.seuilBrut1;
  const seuil2 = BE.seuilBrut2;
  const maxBonus = BE.maxMensuel;
  
  if (refSalaire <= seuil1) return maxBonus;
  if (refSalaire <= seuil2) {
    return Math.round(maxBonus * (1 - (refSalaire - seuil1) / (seuil2 - seuil1)) * 100) / 100;
  }
  return 0;
}

// ═══════════════════════════════════════════════════════════════════════
// CALCUL RÉGIME INDÉPENDANT — INASTI/NISSE 2026
// ═══════════════════════════════════════════════════════════════════════
// Gère: principal, complémentaire, pensionné, conjoint aidant,
//       étudiant-entrepreneur, mandataire société, primo-starter
// Source: AR 19/12/1967 + Loi 05/08/2022 + Instructions INASTI 2026

export { calcPrecompteExact, calcCSSS, calcBonusEmploi };
