// ═══ AUREUS SOCIAL PRO — Moteur de calcul paie ═══
// Extrait du monolithe pour reutilisation dans les modules
"use client";

import { LOIS_BELGES, TX_ONSS_W, TX_ONSS_E, TX_AT, PV_SIMPLE, PV_DOUBLE, PP_EST, SAISIE_2026_TRAVAIL, SAISIE_2026_REMPLACEMENT, SAISIE_IMMUN_ENFANT_2026, AF_REGIONS } from "@/app/lib/lois-belges";

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

// ═══ CALCUL PAYROLL COMPLET ═══
export function calcPayroll(brut,statut,familial,charges,regime){
  if(!brut||brut<=0)return{brut:0,onssP:0,imposable:0,pp:0,csss:0,bonusEmploi:0,net:0,onssE:0,coutTotal:0,details:{}};
  const r=(regime||100)/100;
  const brutR=brut*r;
  const onssP=Math.round(brutR*TX_ONSS_W*100)/100;
  const imposable=Math.round((brutR-onssP)*100)/100;
  const qe=statut==='independant'?0:880.83;
  const chDed=(charges||0)*175;
  const baseImp=Math.max(0,imposable-qe-chDed);
  let pp=0;
  if(baseImp>0){
    const t1=Math.min(baseImp,1128.33)*0.2675;
    const t2=baseImp>1128.33?Math.min(baseImp-1128.33,450)*0.3210:0;
    const t3=baseImp>1578.33?Math.min(baseImp-1578.33,1140)*0.4280:0;
    const t4=baseImp>2718.33?(baseImp-2718.33)*0.4815:0;
    pp=Math.round((t1+t2+t3+t4)*100)/100;
  }
  if(familial==='marie_1rev')pp=Math.round(pp*0.70*100)/100;
  if(familial==='marie_2rev')pp=Math.round(pp*PV_DOUBLE*100)/100;
  let csss=0;
  if(brutR<=1945.38)csss=0;
  else if(brutR<=2190.18)csss=brutR*0.076-147.87;
  else if(brutR<=6038.82)csss=brutR*0.011-5.25;
  else csss=60.94;
  csss=Math.round(Math.max(0,csss)*100)/100;
  let bonusEmploi=0;
  if(imposable<=1945.38)bonusEmploi=Math.min(pp,308.33);
  else if(imposable<=2721.56)bonusEmploi=Math.min(pp,Math.max(0,308.33-((imposable-1945.38)*0.3969)));
  bonusEmploi=Math.round(bonusEmploi*100)/100;
  const ppFinal=Math.round(Math.max(0,pp-bonusEmploi)*100)/100;
  const net=Math.round((brutR-onssP-ppFinal-csss)*100)/100;
  const onssE=Math.round(brutR*TX_ONSS_E*100)/100;
  const coutTotal=Math.round((brutR+onssE)*100)/100;
  return{brut:brutR,onssP,imposable,pp:ppFinal,csss,bonusEmploi,baseImp:Math.round(baseImp*100)/100,coutTotal,onssE,net,details:{qe,chDed,ppBrut:Math.round(pp*100)/100,tauxPP:imposable>0?Math.round(ppFinal/imposable*10000)/100:0,tauxNet:brutR>0?Math.round(net/brutR*10000)/100:0}};
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

