// ═══ AUREUS SOCIAL PRO — Moteur de calcul paie ═══
// Extrait du monolithe pour reutilisation dans les modules
"use client";

import { LOIS_BELGES, TX_ONSS_W, TX_ONSS_E, TX_AT, PV_SIMPLE, PV_DOUBLE, PP_EST, SAISIE_2026_TRAVAIL, SAISIE_2026_REMPLACEMENT, SAISIE_IMMUN_ENFANT_2026, AF_REGIONS, CP_DATA, BAREMES_CP_MIN, ONSS_E_SECTEURS, PRIMES_SECTORIELLES, RMMMG, COTIS_VAC_OUV } from "@/app/lib/lois-belges";

export function calcPrecompteExact(brutMensuel, options) {
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
  const onss = Math.round(brut * TX_ONSS_W * 100) / 100;
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

export function calcCSSS(brutMensuel, situation) {
  const brut = brutMensuel;
  const onss = Math.round(brut * TX_ONSS_W * 100) / 100;
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

export function calcBonusEmploi(brutMensuel) {
  if (brutMensuel <= 0) return 0;
  const onss = Math.round(brutMensuel * TX_ONSS_W * 100) / 100;
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

export function quickPP(brut,sit,enf){return calcPrecompteExact(brut,{situation:sit||'isole',enfants:enf||0}).pp;}

export function quickNet(brut,sit,enf){const o=Math.round(brut*TX_ONSS_W*100)/100;return Math.round((brut-o-quickPP(brut,sit,enf))*100)/100;}

// ═══════════════════════════════════════════════════════════════════
// calcPayroll() — MOTEUR CENTRAL DE PRÉCISION CP v3
// Paramètres:
//   brut       : salaire brut mensuel
//   statut     : 'employe' | 'ouvrier' | 'etudiant' | 'independant'
//   familial   : 'isole' | 'marie_1rev' | 'marie_2rev' | 'cohabitant'
//   charges    : nb personnes à charge (entier)
//   regime     : régime horaire (0-100, défaut 100)
//   opts: {
//     cp         : identifiant CP (défaut '200')
//     classe     : classe barémique 1-5 (défaut 1)
//     anciennete : années d'ancienneté (défaut 0)
//     taxeCom    : taux additionnel communal % (défaut 7)
//     enfants    : nb enfants fiscaux (défaut = charges)
//   }
// Retourne: objet complet avec tous montants + cpInfo + cotisSpec
// ═══════════════════════════════════════════════════════════════════
export function calcPayroll(brut, statut, familial, charges, regime, opts) {
  const R2 = v => Math.round(v * 100) / 100;
  if (!brut || brut <= 0) return {
    brut: 0, brutR: 0, onssBase: 0, onssP: 0, imposable: 0,
    pp: 0, csss: 0, bonusEmploi: 0, net: 0,
    onssE: 0, onssEExtra: 0, cotisSpecTotal: 0, coutTotal: 0,
    primeSect: 0, primeAncMensuel: 0, netAvecPrime: 0,
    baremeMin: 0, baremeOk: true, baremeGap: 0,
    pctAnciennete: 0, isOuvrier: false, cpId: '200', cpInfo: null, details: {}
  };

  const o = opts || {};
  const cpId  = String(o.cp || '200');
  const classe = Math.min(Math.max(+(o.classe || 1), 1), 5);
  const anc    = +(o.anciennete || 0);
  const r      = R2((+(regime || 100)) / 100);
  const brutR  = R2(brut * r);
  const taxeCom = (+(o.taxeCom || 7)) / 100;
  const nbEnf   = +(o.enfants !== undefined ? o.enfants : charges || 0);

  // ── 1. CP Data ──────────────────────────────────────────────
  const cpData    = CP_DATA[cpId] || CP_DATA['200'];
  const isOuvrier = cpData.ouvrier || statut === 'ouvrier';

  // ── 2. Barème minimum avec ancienneté et indexation sectorielle ──
  const clKey   = 'cl' + classe;
  const barBase = cpData[clKey] || cpData.cl1 || RMMMG;
  // Ancienneté: % progressif (CCT sectorielle)
  let pctAnc = 0;
  for (const t of (cpData.anciennete || [])) {
    if (anc >= t.ans) pctAnc = t.pct;
  }
  // Appliquer coefficient d'indexation sectoriel (IPC / Agoria)
  const coefIdx   = cpData.coefIndex || 1.0000;
  const baremeBase = R2(barBase * coefIdx);
  const baremeMin  = R2(Math.max(RMMMG, baremeBase * (1 + pctAnc / 100)) * r);
  const baremeOk   = brutR >= baremeMin;
  const baremeGap  = baremeOk ? 0 : R2(baremeMin - brutR);

  // ── 3. Base ONSS — ×1.08 pour ouvriers (AR 28/11/1969) ─────
  const onssBase = isOuvrier ? R2(brutR * 1.08) : brutR;
  const onssP    = R2(onssBase * TX_ONSS_W);
  const imposable = R2(brutR - onssP);

  // ── 4. Précompte professionnel exact (Annexe III SPF 2026) ──
  const ppRes = calcPrecompteExact(brut, {
    situation: familial || 'isole',
    enfants:   nbEnf,
    regime:    regime || 100,
    taxeCom:   (taxeCom * 100).toFixed(0),
  });
  let ppBrut = ppRes.pp;

  // ── 5. Bonus emploi (Art. 289ter CIR/92) ────────────────────
  const bonusEmploi = calcBonusEmploi(brutR);
  const ppFinal     = R2(Math.max(0, ppBrut - bonusEmploi));

  // ── 6. CSSS (Cotisation Spéciale Sécurité Sociale) ──────────
  const csss = calcCSSS(brutR, familial || 'isole');

  // ── 7. Net travailleur ───────────────────────────────────────
  const net = R2(brutR - onssP - ppFinal - csss);

  // ── 8. ONSS patronal total ───────────────────────────────────
  const onssEExtra = cpData.onssE_extra || ONSS_E_SECTEURS[cpId] || 0;
  const onssE      = R2(brutR * (TX_ONSS_E + onssEExtra));

  // ── 9. Cotisations spéciales sectorielles (fonds, timbres…) ──
  const cotisSpec = (cpData.cotisSpec || []).map(cs => ({
    label:   cs.label,
    pct:     cs.pct,
    montant: R2(brutR * cs.pct),
  }));
  const cotisSpecTotal = R2(cotisSpec.reduce((s, c) => s + c.montant, 0));

  // ── 10. Coût employeur total ──────────────────────────────────
  const coutTotal = R2(brutR + onssE);

  // ── 11. Prime sectorielle mensuelle (CCT) ────────────────────
  const primeSect = R2((cpData.primeSect || PRIMES_SECTORIELLES[cpId] || 0) / 12);

  // ── 12. Net avec prime sectorielle ───────────────────────────
  const netAvecPrime = R2(net + primeSect);

  return {
    // Salaires
    brut,
    brutR,
    // ONSS travailleur
    onssBase: isOuvrier ? onssBase : null,
    onssP,
    imposable,
    // Fiscalité
    pp: ppFinal,
    ppDetail: ppRes.detail,
    csss,
    bonusEmploi,
    // Net
    net,
    netAvecPrime,
    primeSect,
    // ONSS patronal
    onssE,
    onssEExtra: R2(brutR * onssEExtra),
    // Cotisations spéciales sectorielles
    cotisSpec,
    cotisSpecTotal,
    // Coût total employeur
    coutTotal,
    // Conformité barème
    baremeMin,
    baremeOk,
    baremeGap,
    pctAnciennete: pctAnc,
    coefIndex: coefIdx,
    isOuvrier,
    cpId,
    // CP Info complet
    cpInfo: {
      id:              cpId,
      nom:             cpData.nom,
      cl1:             cpData.cl1,
      baremeClasse:    barBase,
      baremeIndexe:    baremeBase,
      baremeAvecAnc:   baremeMin,
      primeSectAnnuel: cpData.primeSect || 0,
      onssE_extra:     onssEExtra,
      indexation:      cpData.indexation || 'IPC',
      coefIndex:       coefIdx,
      fonds:           cpData.fonds || null,
      cotisSpec:       cpData.cotisSpec || [],
      dateMAJ:         cpData.dateMAJ || null,
    },
    // Détails calcul
    details: {
      regime:    r,
      tauxPP:    imposable > 0 ? R2(ppFinal / imposable * 100) : 0,
      tauxNet:   brutR > 0 ? R2(net / brutR * 100) : 0,
      tauxNetAvecPrime: brutR > 0 ? R2(netAvecPrime / brutR * 100) : 0,
      tauxCoutEmpl: brutR > 0 ? R2(coutTotal / brutR * 100) : 0,
    }
  };
}

// ═══ Utilitaire rapide: barème minimum CP ═══
export function getBaremeMinCP(cpId, classe, anciennete, regime) {
  const cpData = CP_DATA[String(cpId)] || CP_DATA['200'];
  const cl = Math.min(Math.max(+(classe||1),1),5);
  const base = cpData['cl'+cl] || cpData.cl1 || RMMMG;
  let pct = 0;
  for (const t of (cpData.anciennete||[])) { if ((anciennete||0) >= t.ans) pct = t.pct; }
  const coef = cpData.coefIndex || 1;
  const min = Math.round(Math.max(RMMMG, base * coef * (1 + pct/100)) * ((regime||100)/100) * 100) / 100;
  return { min, pct, coef, base, nom: cpData.nom };
}

// ═══ Utilitaire: résumé CP complet pour affichage ═══
export function getCPSummary(cpId) {
  const d = CP_DATA[String(cpId)] || CP_DATA['200'];
  return {
    id:          cpId,
    nom:         d.nom,
    ouvrier:     d.ouvrier || false,
    baremes:     { cl1:d.cl1, cl2:d.cl2, cl3:d.cl3, cl4:d.cl4, cl5:d.cl5 },
    anciennete:  d.anciennete || [],
    primeSect:   d.primeSect || 0,
    onssE_extra: d.onssE_extra || 0,
    cotisSpec:   d.cotisSpec || [],
    fonds:       d.fonds || null,
    indexation:  d.indexation || 'IPC',
    coefIndex:   d.coefIndex || 1,
  };
}

// ═══ PÉCULE VACANCES DOUBLE ═══
export function calcPeculeDouble(brutAnnuel){
  const base=Math.round(brutAnnuel*PV_DOUBLE*100)/100;
  const onss=Math.round(base*TX_ONSS_W*100)/100;
  const cotSpec=Math.round(base*TX_AT*100)/100;
  const imposable=Math.round((base-onss)*100)/100;
  const pp=Math.round(imposable*0.2315*100)/100;
  const net=Math.round((base-onss-cotSpec-pp)*100)/100;
  return{base,onss,cotSpec,imposable,pp,net};
}

// ═══ PRORATA ═══
export function calcProrata(brut,joursPreste,joursMois){
  const jm=joursMois||22;
  const ratio=Math.min(joursPreste,jm)/jm;
  return Math.round(brut*ratio*100)/100;
}

// ═══ 13ÈME MOIS ═══
export function calc13eMois(brutMensuel){
  const brut=brutMensuel;
  const onss=Math.round(brut*TX_ONSS_W*100)/100;
  const imposable=Math.round((brut-onss)*100)/100;
  const pp=Math.round(imposable*0.2315*100)/100;
  const net=Math.round((brut-onss-pp)*100)/100;
  return{brut,onss,imposable,pp,net};
}

// ═══ QUOTITÉ SAISISSABLE (Art. 1409-1412 Code judiciaire) ═══
export function calcQuotiteSaisissable(netMensuel,nbEnfantsCharge=0,isRemplacement=false,isPensionAlim=false){
  if(isPensionAlim)return{saisissable:netMensuel,protege:0,tranches:[],enfantImmun:0,note:"Créance alimentaire: saisissable en totalité (art. 1412 CJ)"};
  const bareme=isRemplacement?SAISIE_2026_REMPLACEMENT:SAISIE_2026_TRAVAIL;
  let totalSaisissable=0;const tranches=[];
  for(const t of bareme){
    if(netMensuel<=t.min)break;
    const dansLaTranche=Math.min(netMensuel,t.max)-t.min;
    if(dansLaTranche<=0)continue;
    const retenue=+(dansLaTranche*t.pct/100).toFixed(2);
    tranches.push({min:t.min,max:Math.min(t.max,netMensuel),pct:t.pct,montantTranche:+dansLaTranche.toFixed(2),retenue,label:t.label});
    totalSaisissable+=retenue;
  }
  const enfantImmun=nbEnfantsCharge*SAISIE_IMMUN_ENFANT_2026;
  const saisissable=Math.max(0,+(totalSaisissable-enfantImmun).toFixed(2));
  const protege=+(netMensuel-saisissable).toFixed(2);
  return{saisissable,protege,tranches,enfantImmun,totalAvantImmun:+totalSaisissable.toFixed(2),note:null};
}

// ═══ ALLOCATIONS FAMILIALES ═══
export function calcAllocEnfant(region,birthYear,age){
  const reg=AF_REGIONS[region];if(!reg)return 0;
  const isNew=birthYear>=reg.cutoff;
  if(isNew){
    const tranche=reg.base.find(t=>age>=t.age&&age<=t.to);
    return tranche?tranche.amt:0;
  } else {
    if(region==='BXL'){
      const tranche=reg.base.find(t=>age>=t.age&&age<=t.to);
      return tranche?Math.max(tranche.amt-(reg.ancienReduction||0),0):0;
    }
    return reg.ancien?reg.ancien.rang1:0;
  }
}


// ═══════════════════════════════════════════════════════════════════
// calcPayrollFromEmp() — WRAPPER HAUTE PRÉCISION DEPUIS OBJET EMPLOYÉ
// Prend directement un objet emp (DB/state) et retourne calcPayroll()
// complet avec CP, ancienneté, classe, régime, situation familiale.
// Usage: const r = calcPayrollFromEmp(emp); r.net, r.baremeOk, etc.
// ═══════════════════════════════════════════════════════════════════
export function calcPayrollFromEmp(emp, overrides) {
  if (!emp) return null;
  const ov = overrides || {};
  const brut   = +(ov.brut || emp.monthlySalary || emp.gross || emp.brut || 0);
  const statut = ov.statut || emp.statut || emp.status_type || 'employe';
  const famil  = ov.familial || emp.civil || 'isole';
  const enf    = +(ov.enfants !== undefined ? ov.enfants : (emp.depChildren || emp.children || 0));
  const regime = +(ov.regime !== undefined ? ov.regime : (emp.regime || emp.whWeek ? (emp.whWeek ? Math.round(emp.whWeek / 38 * 100) : 100) : 100));
  const cp     = String(ov.cp || emp.cp || '200');
  const classe = +(ov.classe || emp.classe || emp.classeCp || 1);
  const anc    = +(ov.anciennete !== undefined ? ov.anciennete : (emp.anciennete || 0));

  return calcPayroll(brut, statut, famil, enf, regime, {
    cp, classe, anciennete: anc,
    taxeCom: ov.taxeCom || emp.taxeCom || 7,
    enfants: enf,
  });
}

// ═══════════════════════════════════════════════════════════════════
// calcEmployerCostFromEmp() — COÛT EMPLOYEUR PRÉCIS AVEC CP
// Retourne coût total employeur incluant ONSS patronal + cotis. sect.
// ═══════════════════════════════════════════════════════════════════
export function calcEmployerCostFromEmp(emp, overrides) {
  const r = calcPayrollFromEmp(emp, overrides);
  if (!r) return { coutTotal: 0, onssE: 0, onssEExtra: 0, cotisSpecTotal: 0, brutR: 0 };
  return {
    coutTotal:      r.coutTotal,
    onssE:          r.onssE,
    onssEExtra:     r.onssEExtra,
    cotisSpecTotal: r.cotisSpecTotal,
    brutR:          r.brutR,
    baremeOk:       r.baremeOk,
    baremeGap:      r.baremeGap,
    cpId:           r.cpId,
    primeSect:      r.primeSect,
  };
}

// ═══════════════════════════════════════════════════════════════════
// calcMasseSalariale() — MASSE SALARIALE PRÉCISE SUR LISTE EMPLOYÉS
// Agrège calcPayrollFromEmp() sur tous les employés actifs.
// ═══════════════════════════════════════════════════════════════════
export function calcMasseSalariale(emps) {
  const actifs = (emps || []).filter(e => e.status === 'active' || !e.status);
  let brutTotal = 0, netTotal = 0, onssWTotal = 0, onssETotal = 0,
      coutTotal = 0, primeTotal = 0, nonConformes = 0;
  const details = actifs.map(emp => {
    const r = calcPayrollFromEmp(emp);
    if (!r) return null;
    brutTotal  += r.brutR;
    netTotal   += r.net;
    onssWTotal += r.onssP;
    onssETotal += r.onssE;
    coutTotal  += r.coutTotal;
    primeTotal += r.primeSect;
    if (!r.baremeOk) nonConformes++;
    return { emp, r };
  }).filter(Boolean);

  return {
    brutTotal:    Math.round(brutTotal * 100) / 100,
    netTotal:     Math.round(netTotal * 100) / 100,
    onssWTotal:   Math.round(onssWTotal * 100) / 100,
    onssETotal:   Math.round(onssETotal * 100) / 100,
    coutTotal:    Math.round(coutTotal * 100) / 100,
    primeTotal:   Math.round(primeTotal * 100) / 100,
    nonConformes,
    nbActifs:     actifs.length,
    details,
  };
}


// ── calc() — Version CP-aware complète (remplace estimation 22% fixe) ──
// Utilise calcPayrollFromEmp() via payroll-engine pour précision totale :
// barème CP, ancienneté, indexation sectorielle, cotisations spéciales.
// Rétrocompatible : retourne les mêmes clés qu'avant + enrichissements CP.
// ═══ calcFiche() — Fiche de paie complète depuis objet employé + période ═══
export function calcFiche(emp, per, co) {
  const brut = +(emp&&(emp.monthlySalary||emp.gross||emp.brut)||0);
  if (!brut) return {base:0,gross:0,onssNet:0,onssW:0,imposable:0,tax:0,pp:0,css:0,csss:0,net:0,onssE:0,onssEExtra:0,costTotal:0,coutTotal:0,bonus:0,bonusEmploi:0,overtime:0,y13:0,sickPay:0,baremeOk:true,baremeGap:0,primeSect:0,netAvecPrime:0,cpId:'200',cotisSpec:[],cotisSpecTotal:0};
  const r = calcPayrollFromEmp(emp);
  if (!r) { const _ow=Math.round(brut*TX_ONSS_W*100)/100; const _oe=Math.round(brut*TX_ONSS_E*100)/100; return {base:brut,gross:brut,onssNet:_ow,onssW:_ow,imposable:0,tax:0,pp:0,css:0,csss:0,net:brut-_ow,onssE:_oe,onssEExtra:0,costTotal:Math.round((brut*(1+TX_ONSS_E))*100)/100,coutTotal:Math.round((brut*(1+TX_ONSS_E))*100)/100,bonus:0,bonusEmploi:0,overtime:0,y13:0,sickPay:0,baremeOk:true,baremeGap:0,primeSect:0,netAvecPrime:0,cpId:'200',cotisSpec:[],cotisSpecTotal:0}; }
  // Calculs supplémentaires période (heures sup, avantages, etc.)
  const hsVolontBrutNet = +(per?.hsVolontBrutNet||0) * (brut/((emp.whWeek||38)*4.33));
  const hsRelance       = +(per?.hsRelance||0)       * (brut/((emp.whWeek||38)*4.33));
  const hsBrutNetTotal  = Math.round((hsVolontBrutNet+hsRelance)*100)/100;
  const atnCar          = r.brutR > 0 ? (per?.atnCar||emp?.atnCar||0) : 0;
  const atnGSM          = per?.atnGSM||emp?.atnGSM||0;
  const atnLogement     = per?.atnLogement||emp?.atnLogement||0;
  const atnTotal        = Math.round(((+atnCar)+(+atnGSM)+(+atnLogement))*100)/100;
  const fraisPropres    = +(per?.expense||emp?.expense||0);
  const transport       = +(per?.mvT||emp?.mvT||0);
  const chRepPatron     = +(per?.mvE||emp?.mvE||0);
  const chRepTravail    = +(per?.mvW||emp?.mvW||0);
  const indemTeletravail= +(per?.indemTeletravail||emp?.indemTeletravail||0);
  const indemBureau     = +(per?.indemBureau||emp?.indemBureau||0);
  const cotisVacOuv     = r.isOuvrier ? Math.round(r.brutR*COTIS_VAC_OUV*100)/100 : 0;
  const empBonus        = r.bonusEmploi;
  const onssNet         = Math.round((r.onssP - empBonus)*100)/100;
  const net             = r.net;
  const mvEmployer      = Math.round((transport+chRepPatron+indemTeletravail+indemBureau+fraisPropres)*100)/100;
  const onssE_rate      = r.isOuvrier ? (TX_OUV108||TX_ONSS_E) : (TX_ONSS_E + (r.onssEExtra/r.brutR||0));
  const pensionComplEmpl= Math.round(r.brutR*(emp?.assurGroupe||0)/100*100)/100;
  const dispensePPTotal = Math.round((hsVolontBrutNet+hsRelance)*TX_ONSS_W*100)/100;
  const miTempsINAMI    = +(per?.miTempsINAMI||0);
  const allocTravail    = +(per?.allocTravail||emp?.allocTravail||emp?.allocTravailMontant||0);
  const allocTravailLabel = emp?.allocTravailType||'';
  const redGCPremier    = 0; // calculé séparément si nécessaire
  const redGCAge        = 0;
  const redGCJeune      = 0;
  const redGCHandicap   = 0;
  const redGCPremierLabel = '';
  const ecoCheques      = Math.round((emp?.ecoCheques||0)/12*100)/100;
  const cotCO2          = 0; // calculé dans VehiculeATN
  const costTotal       = Math.round((r.coutTotal + cotisVacOuv + pensionComplEmpl + mvEmployer - redGCPremier - redGCAge - redGCJeune - allocTravail)*100)/100;

  return {
    // Rétrocompatibilité totale
    base: r.brutR, gross: r.brutR,
    onssNet, onssW: r.onssP, empBonus,
    imposable: r.imposable,
    tax: r.pp, pp: r.pp,
    css: r.csss, csss: r.csss,
    net: Math.round((net + hsBrutNetTotal)*100)/100,
    onssE: r.onssE, onssE_rate, onssEExtra: r.onssEExtra,
    costTotal, coutTotal: costTotal,
    bonus: r.bonusEmploi, bonusEmploi: r.bonusEmploi,
    overtime: 0, y13: 0, sickPay: 0,
    // Précision CP
    baremeOk: r.baremeOk, baremeGap: r.baremeGap,
    baremeMin: r.baremeMin,
    primeSect: r.primeSect, netAvecPrime: r.netAvecPrime,
    cpId: r.cpId, cpInfo: r.cpInfo,
    cotisSpec: r.cotisSpec, cotisSpecTotal: r.cotisSpecTotal,
    pctAnciennete: r.pctAnciennete,
    coefIndex: r.coefIndex,
    isOuvrier: r.isOuvrier,
    // Période
    hsBrutNetTotal, hsVolontBrutNet, hsRelance,
    atnCar, atnGSM, atnLogement, atnTotal,
    fraisPropres, transport, chRepPatron, chRepTravail,
    indemTeletravail, indemBureau, mvEmployer,
    cotisVacOuv, cotCO2, pensionComplEmpl,
    dispensePPTotal, miTempsINAMI,
    allocTravail, allocTravailLabel,
    redGCPremier, redGCAge, redGCJeune, redGCHandicap, redGCPremierLabel,
    ecoCheques,
  };
}
