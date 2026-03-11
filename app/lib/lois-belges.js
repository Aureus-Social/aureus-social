// ═══ AUREUS SOCIAL PRO — Constantes legales belges ═══
// Extrait du monolithe pour reutilisation dans les modules
"use client";

export const LOIS_BELGES = {
  _meta: { version: '2026.1.0', dateMAJ: '2026-01-01', source: 'SPF Finances / ONSS / CNT / Moniteur Belge', annee: 2026 },

  // ═══ ONSS ═══
  onss: {
    travailleur: 0.1307,
    employeur: { total: 0.2507, detail: { pension: 0.0886, maladie: 0.0370, chomage: 0.0138, accidents: 0.0087, maladiesPro: 0.0102, fermeture: 0.0012, moderation: 0.0560, cotisationsSpec: 0.0352 }},
    plafondAnnuel: null, // pas de plafond en Belgique
    ouvrier108: 1.08, // majoration 8% ouvriers
    cotisVacancesOuv: 0.1584, // Cotisation patronale ONVA (Office National des Vacances Annuelles) — AR 30/03/2000
    reductionStructurelle: { seuil: 9932.40, forfait: 0, pctAuDessus: 0 },
    groupeCible: { jeunesNonQualifies: { age: 25, reduc: 1500 }, agees: { age: 55, reduc: 1500 }, handicapes: { reduc: 1500 }},
  },

  // ═══ PRÉCOMPTE PROFESSIONNEL ═══
  pp: {
    tranches: [
      { min: 0, max: 16710, taux: 0.2675 },
      { min: 16710, max: 29500, taux: 0.4280 },
      { min: 29500, max: 51050, taux: 0.4815 },
      { min: 51050, max: Infinity, taux: 0.5350 },
    ],
    fraisPro: { salarie: { pct: 0.30, max: 6070 }, dirigeant: { pct: 0.03, max: 3120 }},
    quotiteExemptee: { bareme1: 2987.98, bareme2: 5975.96 },
    quotientConjugal: { pct: 0.30, max: 12520 },
    reductionsEnfants: [0, 624, 1656, 4404, 7620, 11100, 14592, 18120, 21996],
    reductionEnfantSupp: 3864,
    reductionParentIsole: 624,
    reductionHandicape: 624,
    reductionConjointHandicape: 624,
    reductionConjointRevenuLimite: 1698,
    reductionConjointPensionLimitee: 3390,
    reductionPersonne65: 1992,
    reductionAutreCharge: 624,
    bonusEmploi: { pctReduction: 0.3314, maxMensuel: 194.03, seuilBrut1: 2561.42, seuilBrut2: 2997.59 },
    tauxPPSpecial: 0.2315, // Taux PP forfaitaire pécule double + 13ème mois (Annexe III SPF Finances)
  },

  // ═══ CSSS — Cotisation Spéciale Sécurité Sociale ═══
  csss: {
    isole: [
      { min: 0, max: 18592.02, montant: 0, taux: 0 },
      { min: 18592.02, max: 21070.96, montant: 0, taux: 0.076 },
      { min: 21070.96, max: 37344.02, montant: 9.30, taux: 0.011 },
      { min: 37344.02, max: 60181.95, montant: 9.30, tauxBase: 0.011, taux: 0.013, palierBase: 37344.02 },
      { min: 60181.95, max: Infinity, montantFixe: 51.64 },
    ],
    menage2revenus: [
      { min: 0, max: 18592.02, montant: 0, taux: 0 },
      { min: 18592.02, max: 21070.96, montant: 0, taux: 0.076 },
      { min: 21070.96, max: 60181.95, montant: 9.30, taux: 0.011 },
      { min: 60181.95, max: Infinity, montantFixe: 51.64 },
    ],
    menage1revenu: [
      { min: 0, max: 18592.02, montant: 0, taux: 0 },
      { min: 18592.02, max: 21070.96, montant: 0, taux: 0.076 },
      { min: 21070.96, max: 37344.02, montant: 9.30, taux: 0.011 },
      { min: 37344.02, max: 60181.95, montant: 0, taux: 0.013 },
      { min: 60181.95, max: Infinity, montantFixe: 51.64 },
    ],
  },

  // ═══ RÉMUNÉRATION ═══
  remuneration: {
    RMMMG: { montant18ans: 2070.48, montant20ans6m: 2070.48, montant21ans12m: 2070.48, source: 'CNT - CCT 43/15' },
    indexSante: { coeff: 2.0399, pivot: 125.60, dateDerniereIndex: '2024-12-01', prochainPivotEstime: '2026-06-01' },
    peculeVacances: {
      simple: { pct: 0.0767, base: 'brut annuel precedent' },
      double: { pct: 0.9200, base: 'brut mensuel' },
      patronal: { pct: 0.1535, base: 'brut annuel precedent' },
      ouvrierDouble: { pct: 0.0858, base: 'brut ouvrier x 108%' },
    },
    treizieme: { obligatoire: true, cp200: true, base: 'salaire mensuel brut', onss: true },
  },

  // ═══ CHÈQUES-REPAS ═══
  chequesRepas: {
    partTravailleur: { min: 1.09, max: null },
    valeurFaciale: { max: 8.00 },
    partPatronale: { max: 6.91 },
    conditions: 'Par jour effectivement preste',
    exonerationFiscale: true,
    exonerationONSS: true,
  },

  // ═══ FRAIS PROPRES EMPLOYEUR ═══
  fraisPropres: {
    forfaitBureau: { max: 154.74, base: 'mensuel' },
    forfaitDeplacement: { voiture: 0.4415, velo: 0.35, transportCommun: 1.00 },
    forfaitRepresentation: { max: 40, base: 'mensuel sans justificatif' },
    teletravail: { max: 154.74, base: 'mensuel structurel' },
  },


  // ═══ AVANTAGES — ALIAS POUR MODULES ═══
  avantages: {
    fraisPropres: {
      bureau: 154.74,
      km: 0.4415,
      repas: 19.22,
      teletravail: 154.74,
    },
    atnGSM: 3,
    atnPC: 6,
    atnInternet: 5,
    ecoMax: 250,
  },


  // ═══ COTISATIONS SPÉCIALES ═══
  cotisations: {
    cotCO2Min: 31.34,
    plafondONSS: 75038.09,
    flexiJob: { plafond: 12000, taux: 0.2807 },
  },

  // ═══ ATN — AVANTAGES EN NATURE ═══
  atn: {
    voiture: { CO2Ref: { essence: 102, diesel: 84, hybride: 84 }, coeff: 0.055, min: 1600, formule: '(catalogue x 6/7 x vetuste) x %CO2 / 12' },
    logement: { cadastralx100: true, meuble: 1.333 },
    gsm: { forfait: 3, mensuel: true },
    pc: { forfait: 6, mensuel: true },
    internet: { forfait: 5, mensuel: true },
    electricite: { cadre: 2130, noncadre: 960, annuel: true },
    chauffage: { cadre: 4720, noncadre: 2130, annuel: true },
  },

  // ═══ PRÉAVIS (CCT 109 / Loi Statut Unique) ═══
  preavis: {
    // Durée en semaines par ancienneté (années)
    employeur: [
      { ancMin: 0, ancMax: 0.25, semaines: 1 },
      { ancMin: 0.25, ancMax: 0.5, semaines: 3 },
      { ancMin: 0.5, ancMax: 0.75, semaines: 4 },
      { ancMin: 0.75, ancMax: 1, semaines: 5 },
      { ancMin: 1, ancMax: 2, semaines: 6 },
      { ancMin: 2, ancMax: 3, semaines: 7 },
      { ancMin: 3, ancMax: 4, semaines: 9 },
      { ancMin: 4, ancMax: 5, semaines: 12 },
      { ancMin: 5, ancMax: 6, semaines: 15 },
      { ancMin: 6, ancMax: 7, semaines: 18 },
      { ancMin: 7, ancMax: 8, semaines: 21 },
      { ancMin: 8, ancMax: 9, semaines: 24 },
      { ancMin: 9, ancMax: 10, semaines: 27 },
      { ancMin: 10, ancMax: 11, semaines: 30 },
      { ancMin: 11, ancMax: 12, semaines: 33 },
      { ancMin: 12, ancMax: 13, semaines: 36 },
      { ancMin: 13, ancMax: 14, semaines: 39 },
      { ancMin: 14, ancMax: 15, semaines: 42 },
      { ancMin: 15, ancMax: 16, semaines: 45 },
      { ancMin: 16, ancMax: 17, semaines: 48 },
      { ancMin: 17, ancMax: 18, semaines: 51 },
      { ancMin: 18, ancMax: 19, semaines: 54 },
      { ancMin: 19, ancMax: 20, semaines: 57 },
      { ancMin: 20, ancMax: 21, semaines: 60 },
      { ancMin: 21, ancMax: 22, semaines: 62 },
      { ancMin: 22, ancMax: 23, semaines: 63 },
      { ancMin: 23, ancMax: 24, semaines: 64 },
      { ancMin: 24, ancMax: 25, semaines: 65 },
    ],
    parAnSupp: 3, // +3 semaines par année > 25 ans
    travailleur: { facteur: 0.5, min: 1, max: 13 },
    motifGrave: 0,
    outplacement: { seuil: 30, semaines: 4 },
  },

  // ═══ TEMPS DE TRAVAIL ═══
  tempsTravail: {
    dureeHebdoLegale: 38,
    dureeHebdoMax: 38,
    heuresSupp: { majoration50: 0.50, majoration100: 1.00, recuperation: true, plafondAnnuel: 120, plafondVolontaire: 360 },
    nuit: { debut: '20:00', fin: '06:00', majoration: 0 },
    dimanche: { majoration: 1.00, repos: true },
    jourFerie: { nombre: 10, majoration: 2.00, remplacement: true },
    petitChomage: { mariage: 2, deces1: 3, deces2: 1, communion: 1, demenagement: 1 },
  },

  // ═══ CONTRATS ═══
  contrats: {
    periodeEssai: { supprimee: true, exception: 'travail etudiant/interim/occupation temporaire' },
    clauseNonConcurrence: { dureeMax: 12, brut_min: 42441, indemniteMin: 0.50 },
    ecolecholage: { dureeMax: 36, brut_min: 39422, formationMin: 80 },
  },

  // ═══ SEUILS SOCIAUX ═══
  seuils: {
    electionsSociales: { cppt: 50, ce: 100 },
    planFormation: 20,
    bilanSocial: 20,
    reglementTravail: 1,
    delegationSyndicale: { cp200: 50 },
    servicePPT: { interne: 20 },
    conseillerPrevention: { interne: 20 },
  },

  // ═══ ASSURANCES ═══
  assurances: {
    accidentTravail: { taux: 0.01, obligatoire: true },
    medecineTravail: { cout: 91.50, parTravailleur: true, annuel: false },
    assuranceLoi: { obligatoire: true },
    assuranceGroupe: { deductible: true, plafond80pct: true },
  },

  // ═══ ALLOCATIONS FAMILIALES (Région Bruxelles) ═══
  allocFamBxl: {
    base: { montant: 171.08, parEnfant: true },
    supplement1218: 29.64,
    supplementSocial: { plafondRevenu: 35978, montant: 54.38 },
    primeNaissance: { premier: 1214.73, suivants: 607.37 },
  },

  // ═══ DIMONA ═══
  dimona: {
    delaiIN: 'Avant debut prestations',
    delaiOUT: 'Le jour meme',
    types: ['IN','OUT','UPDATE','CANCEL'],
    canal: 'Portail securite sociale ou batch',
    sanctionNiveau: 3,
  },

  // ═══ DMFA ═══
  dmfa: {
    periodicite: 'Trimestrielle',
    delai: 'Dernier jour du mois suivant le trimestre',
    format: 'XML via batch ou portail',
    cotisationsPNP: true,
  },

  // ═══ BELCOTAX ═══
  belcotax: {
    delai: '1er mars annee N+1',
    format: 'XML BelcotaxOnWeb',
    fiches: ['281.10','281.13','281.14','281.20','281.30','281.50'],
  },

  // ═══ SOURCES OFFICIELLES ═══
  sources: [
    { id: 'spf', nom: 'SPF Finances', url: 'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/precompte_professionnel', type: 'PP/Fiscal' },
    { id: 'onss', nom: 'ONSS', url: 'https://www.socialsecurity.be', type: 'Cotisations sociales' },
    { id: 'cnt', nom: 'Conseil National du Travail', url: 'https://www.cnt-nar.be', type: 'CCT/RMMMG' },
    { id: 'spf_emploi', nom: 'SPF Emploi', url: 'https://emploi.belgique.be', type: 'Droit du travail' },
    { id: 'moniteur', nom: 'Moniteur Belge', url: 'https://www.ejustice.just.fgov.be/cgi/summary.pl', type: 'Legislation' },
    { id: 'statbel', nom: 'Statbel', url: 'https://statbel.fgov.be/fr/themes/prix-la-consommation/indice-sante', type: 'Index/Prix' },
    { id: 'bnb', nom: 'Banque Nationale', url: 'https://www.nbb.be', type: 'Bilan social' },
    { id: 'refli', nom: 'Refli.be', url: 'https://refli.be/fr/documentation/computation/tax', type: 'Reference technique' },
  ],
};

export const LB=LOIS_BELGES;
export const TX_ONSS_W=LB.onss.travailleur; // 0.1307
export const TX_ONSS_E=LB.onss.employeur.total; // 0.2507
export const TX_OUV108=LB.onss.ouvrier108; // 1.08
export const COTIS_VAC_OUV=LB.onss.cotisVacancesOuv; // 0.1584 — ONVA cotisation patronale
export const TX_AT=LB.assurances.accidentTravail.taux; // 0.01
export const COUT_MED=LB.assurances.medecineTravail.cout; // COUT_MED
export const CR_TRAV=LB.chequesRepas.partTravailleur.min; // CR_TRAV
export const PP_SPEC=LB.pp.tauxPPSpecial; // 0.2315 — PP forfaitaire pécule double + 13ème mois
export const PP_EST=0.22; // PP estimation moyenne (~22% de l'imposable)
export const NET_FACTOR=(1-TX_ONSS_W)*(1-PP_EST); // facteur net approx = ~0.5645
export const quickNetEst=(b)=>Math.round(b*NET_FACTOR*100)/100; // estimation rapide net

// ═══ SPRINT 41: EXPORTS COMPTABLES RÉELS ═══
export function generateExportCompta(format,ops,periode,company){
  const co=company||{};const coName=co.name||'Aureus IA SPRL';const coVAT=(co.vat||'BE1028230781').replace(/[^A-Z0-9]/g,'');
  const f2=v=>(Math.round(v*100)/100).toFixed(2);
  const fBE=v=>f2(v).replace('.',',');
  const now=new Date();const dateStr=now.toISOString().slice(0,10);const periodeStr=periode||dateStr.slice(0,7);
  const journal='OD';const piece='SAL'+periodeStr.replace(/-/g,'');
  let output='';let filename='';let mime='text/plain';
  // ——— BOB50 ———
  if(format==='bob50'||format==='bob'){
    // BOB50 format: journal|date|piece|compte|libelle|montant_debit|montant_credit
    output=ops.map(o=>[journal,dateStr.replace(/-/g,''),piece,o.compte,'"'+o.desc.replace(/"/g,"'")+'"',o.sens==='D'?fBE(o.montant):'0,00',o.sens==='C'?fBE(o.montant):'0,00'].join('\t')).join('\n');
    output='Journal\tDate\tPiece\tCompte\tLibelle\tDebit\tCredit\n'+output;
    filename='BOB50_OD_'+periodeStr+'.txt';
  }
  // ——— WINBOOKS ———
  else if(format==='winbooks'){
    // Winbooks TXT: DBK|BOOKYEAR|PERIOD|DOCNUMBER|ACCOUNTGL|AMOUNTEUR|DTEFROM|COMMENT
    const year=now.getFullYear();const month=now.getMonth()+1;
    output=ops.map((o,i)=>['OD',year,month.toString().padStart(2,'0'),piece,(o.compte||'').padEnd(10,' '),o.sens==='D'?f2(o.montant):'-'+f2(o.montant),dateStr.replace(/-/g,''),o.desc.slice(0,40)].join('\t')).join('\n');
    output='DBK\tBOOKYEAR\tPERIOD\tDOCNUMBER\tACCOUNTGL\tAMOUNTEUR\tDTEFROM\tCOMMENT\n'+output;
    filename='Winbooks_OD_'+periodeStr+'.txt';
  }
  // ——— EXACT ONLINE ———
  else if(format==='exact'){
    // Exact CSV: Journal;Boekjaar;Periode;Dagboek;Rekeningnr;Omschrijving;Debet;Credit;Datum
    output=ops.map(o=>['OD',now.getFullYear(),now.getMonth()+1,'OD',o.compte,'"'+o.desc+'"',o.sens==='D'?fBE(o.montant):'',o.sens==='C'?fBE(o.montant):'',dateStr.split('-').reverse().join('/')].join(';')).join('\n');
    output='Journal;Boekjaar;Periode;Dagboek;Rekeningnr;Omschrijving;Debet;Credit;Datum\n'+output;
    filename='Exact_OD_'+periodeStr+'.csv';mime='text/csv';
  }
  // ——— HORUS ———
  else if(format==='horus'){
    // Horus XML format
    const entries=ops.map((o,i)=>'<Entry seq="'+(i+1)+'"><Account>'+o.compte+'</Account><Description>'+o.desc.replace(/&/g,'&amp;')+'</Description><Debit>'+(o.sens==='D'?f2(o.montant):'0.00')+'</Debit><Credit>'+(o.sens==='C'?f2(o.montant):'0.00')+'</Credit><Date>'+dateStr+'</Date></Entry>').join('');
    output='<?xml version="1.0" encoding="UTF-8"?>\n<HorusExport><Journal>OD</Journal><Period>'+periodeStr+'</Period><Company>'+coName+'</Company><VAT>'+coVAT+'</VAT><Entries>'+entries+'</Entries></HorusExport>';
    filename='Horus_OD_'+periodeStr+'.xml';mime='application/xml';
  }
  // ——— OCTOPUS ———
  else if(format==='octopus'){
    // Octopus CSV: Dagboek,Datum,Stuk,Rekening,Omschrijving,Debet,Credit
    output=ops.map(o=>['OD',dateStr.split('-').reverse().join('/'),piece,o.compte,'"'+o.desc+'"',o.sens==='D'?fBE(o.montant):'',o.sens==='C'?fBE(o.montant):''].join(',')).join('\n');
    output='Dagboek,Datum,Stuk,Rekening,Omschrijving,Debet,Credit\n'+output;
    filename='Octopus_OD_'+periodeStr+'.csv';mime='text/csv';
  }
  // ——— YUKI ———
  else if(format==='yuki'){
    // Yuki XML
    const lines=ops.map((o,i)=>'<Line><LineNumber>'+(i+1)+'</LineNumber><GLAccountCode>'+o.compte+'</GLAccountCode><Description>'+o.desc.replace(/&/g,'&amp;')+'</Description><DebitAmount>'+(o.sens==='D'?f2(o.montant):'0.00')+'</DebitAmount><CreditAmount>'+(o.sens==='C'?f2(o.montant):'0.00')+'</CreditAmount></Line>').join('');
    output='<?xml version="1.0" encoding="UTF-8"?>\n<YukiImport><Administration>'+coVAT+'</Administration><Journal><Code>OD</Code><Description>OD Salaires '+periodeStr+'</Description><Date>'+dateStr+'</Date><Lines>'+lines+'</Lines></Journal></YukiImport>';
    filename='Yuki_OD_'+periodeStr+'.xml';mime='application/xml';
  }
  // ——— KLUWER ———
  else if(format==='kluwer'){
    output=ops.map(o=>['OD',dateStr.replace(/-/g,''),piece,o.compte,o.desc.slice(0,40).padEnd(40,' '),o.sens==='D'?fBE(o.montant).padStart(15,' '):''.padStart(15,' '),o.sens==='C'?fBE(o.montant).padStart(15,' '):''.padStart(15,' ')].join('|')).join('\n');
    filename='Kluwer_OD_'+periodeStr+'.txt';
  }
  // ——— POPSY ———
  else if(format==='popsy'){
    output=ops.map((o,i)=>[piece,dateStr.replace(/-/g,''),o.compte,o.desc.slice(0,30),o.sens==='D'?fBE(o.montant):'0,00',o.sens==='C'?fBE(o.montant):'0,00'].join(';')).join('\n');
    output='Piece;Date;Compte;Libelle;Debit;Credit\n'+output;
    filename='Popsy_OD_'+periodeStr+'.txt';
  }
  // Download
  var blob=new Blob([output],{type:mime+';charset=utf-8'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},3000);
  return {filename,size:output.length,lines:output.split('\n').length};
}

// ═══ SPRINT 41: CSV EXPORT TRAVAILLEURS ═══
export function exportTravailleurs(emps,company){
  const co=company||{};const coName=co.name||'';
  const headers=['NISS','Nom','Prenom','DateNaissance','Genre','Email','Telephone','Adresse','CodePostal','Ville','IBAN','BIC','Statut','TypeContrat','DateEntree','DateSortie','Fonction','Regime','BrutMensuel','CP','Matricule'];
  const rows=emps.map(e=>[
    (e.niss||''),
    (e.last||e.ln||'').replace(/;/g,','),
    (e.first||e.fn||'').replace(/;/g,','),
    (e.birthDate||''),
    (e.gender||''),
    (e.email||''),
    (e.phone||''),
    (e.address||''),
    (e.zip||''),
    (e.city||''),
    (e.iban||''),
    (e.bic||''),
    (e.statut||'Employe'),
    (e.contractType||'CDI'),
    (e.startDate||''),
    (e.endDate||''),
    (e.fonction||e.jobTitle||''),
    (+e.regime||100)+'%',
    (+(e.monthlySalary||e.gross||0)).toFixed(2),
    (e.cp||''),
    (e.matricule||e.id||'')
  ].join(';'));
  const csv='\uFEFF'+headers.join(';')+'\n'+rows.join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='Travailleurs_'+coName.replace(/[^a-zA-Z0-9]/g,'_')+'_'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a);a.click();
  setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},3000);
  return rows.length;
}

// ═══ SPRINT 41: CSV IMPORT TRAVAILLEURS ═══
export function importTravailleurs(csvText){
  const lines=csvText.split(/\r?\n/).filter(l=>l.trim());
  if(lines.length<2)return {error:'Fichier vide ou sans données',imported:[]};
  const headers=lines[0].split(';').map(h=>h.trim().toLowerCase());
  const fieldMap={
    'niss':'niss','nom':'last','prenom':'first','datenaissance':'birthDate',
    'genre':'gender','email':'email','telephone':'phone','adresse':'address',
    'codepostal':'zip','ville':'city','iban':'iban','bic':'bic',
    'statut':'statut','typecontrat':'contractType','dateentree':'startDate',
    'datesortie':'endDate','fonction':'fonction','regime':'regime',
    'brutmensuel':'gross','cp':'cp','matricule':'matricule',
    'last':'last','first':'first','fn':'first','ln':'last',
    'name':'last','firstname':'first','lastname':'last',
    'salary':'gross','brut':'gross','gross':'gross',
    'contract':'contractType','type':'contractType',
    'start':'startDate','end':'endDate','birth':'birthDate'
  };
  const colMap=headers.map(h=>{
    const clean=h.replace(/[^a-z]/g,'');
    return fieldMap[clean]||null;
  });
  const imported=[];
  for(let i=1;i<lines.length;i++){
    const vals=lines[i].split(';');
    if(vals.length<3)continue;
    const emp={id:'imp_'+Date.now()+'_'+i,status:'active'};
    colMap.forEach((field,j)=>{
      if(field&&vals[j]!==undefined){
        let v=vals[j].trim().replace(/^"|"$/g,'');
        if(field==='gross')v=parseFloat(v.replace(',','.'))||0;
        else if(field==='regime')v=parseInt(v)||100;
        emp[field]=v;
      }
    });
    if(emp.first||emp.last||emp.niss)imported.push(emp);
  }
  return {imported,count:imported.length,headers:headers};
}

// ═══ SPRINT 41: TEST SUITE CALCULS PAIE ═══
function runPayrollTests(){
  const tests=[];
  const assert=(name,actual,expected,tolerance)=>{
    const tol=tolerance||0.01;
    const pass=Math.abs(actual-expected)<=tol;
    tests.push({name,actual:Math.round(actual*100)/100,expected,pass,diff:Math.round((actual-expected)*100)/100});
  };
  // ══ ONSS TRAVAILLEUR ══
  assert('ONSS 3500 brut',3500*TX_ONSS_W,457.45);
  assert('ONSS 2000 brut',2000*TX_ONSS_W,261.40);
  assert('ONSS 5000 brut',5000*TX_ONSS_W,653.50);
  // ══ PRECOMPTE PROFESSIONNEL (formule-clé SPF) ══
  const pp1=calcPrecompteExact(3500,{situation:'isole',enfants:0});
  assert('PP 3500 isolé 0enf',pp1.pp,660.63,1.0);
  const pp2=calcPrecompteExact(3500,{situation:'marie_1r',enfants:0});
  assert('PP 3500 marié1r 0enf',pp2.pp,470,15);
  const pp3=calcPrecompteExact(2000,{situation:'isole',enfants:0});
  assert('PP 2000 isolé 0enf',pp3.pp,218,10);
  const pp4=calcPrecompteExact(5000,{situation:'isole',enfants:0});
  assert('PP 5000 isolé 0enf',pp4.pp,1230,20);
  const pp5=calcPrecompteExact(3500,{situation:'isole',enfants:2});
  assert('PP 3500 isolé 2enf < PP sans enf',pp5.pp<pp1.pp?1:0,1);
  // ══ CSSS ══
  const csss1=calcCSSS(3500,'isole');
  assert('CSSS 3500 isolé',csss1,14.93,2);
  // ══ BONUS EMPLOI ══
  const be1=calcBonusEmploi(2000);
  assert('Bonus emploi 2000 > 0',be1>0?1:0,1);
  const be2=calcBonusEmploi(5000);
  assert('Bonus emploi 5000 = 0',be2,0);
  // ══ NET COMPLET ══
  const net1=quickNet(3500);
  assert('Net 3500 > 2200',net1>2200?1:0,1);
  assert('Net 3500 < 2800',net1<2800?1:0,1);
  // ══ PECULE VACANCES ══
  assert('PV simple 7.67%',PV_SIMPLE,0.0767);
  assert('PV double 92%',PV_DOUBLE,0.92);
  assert('PV ouvrier 8.58%',LOIS_BELGES.remuneration.peculeVacances.ouvrierDouble.pct,0.0858);
  // ══ RMMMG ══
  assert('RMMMG 2026',RMMMG,2070.48,5);
  // ══ CONSTANTES CENTRALISEES ══
  assert('TX_ONSS_W',TX_ONSS_W,0.1307);
  assert('TX_ONSS_E',TX_ONSS_E,0.2507,0.001);
  assert('CR_PAT',CR_PAT,6.91);
  // ══ RATIOS ══
  const brut=3500;const onss=brut*TX_ONSS_W;const pp=quickPP(brut);const net=brut-onss-pp;
  assert('Ratio net/brut 3500',net/brut*100,67,3);
  assert('Cout employeur',brut*(1+TX_ONSS_E),4377.45,5);
  // RESULTS
  const passed=tests.filter(t=>t.pass).length;
  const failed=tests.filter(t=>!t.pass).length;
  return {tests,passed,failed,total:tests.length,score:Math.round(passed/tests.length*100)};
}



// ═══ SPRINT 43: OBFUSCATION NISS/IBAN ═══
export const obf={
  encode:(v)=>{if(!v)return '';try{return btoa(unescape(encodeURIComponent(String(v).split('').reverse().join(''))));}catch(e){return v;}},
  decode:(v)=>{if(!v)return '';try{return decodeURIComponent(escape(atob(v))).split('').reverse().join('');}catch(e){return v;}},
  maskNISS:(n)=>{if(!n||n.length<6)return n;return n.slice(0,2)+'.***.***'+n.slice(-2);},
  maskIBAN:(i)=>{if(!i||i.length<8)return i;return i.slice(0,4)+' **** **** '+i.slice(-4);}
};
export const safeLS={get:(k)=>{try{if(typeof window==='undefined')return null;return window.localStorage.getItem(k);}catch(e){return null;}},set:(k,v)=>{try{if(typeof window==='undefined')return;window.localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v));}catch(e){}},remove:(k)=>{try{if(typeof window==='undefined')return;window.localStorage.removeItem(k);}catch(e){}}};
export const CR_MAX=LB.chequesRepas.valeurFaciale.max; // 8.00
export const CR_PAT=LB.chequesRepas.partPatronale.max; // 6.91
export const FORF_BUREAU=LB.fraisPropres.forfaitBureau.max; // FORF_BUREAU
export const FORF_KM=LB.fraisPropres.forfaitDeplacement.voiture; // 0.4415
export const PV_SIMPLE=LB.remuneration.peculeVacances.simple.pct; // PV_SIMPLE
export const PV_DOUBLE=LB.remuneration.peculeVacances.double.pct; // 0.92
export const RMMMG=LB.remuneration.RMMMG.montant18ans; // RMMMG
export const BONUS_MAX=LB.pp.bonusEmploi.maxMensuel; // 194.03
export const SEUIL_CPPT=LB.seuils.electionsSociales.cppt; // 50
export const SEUIL_CE=LB.seuils.electionsSociales.ce; // 100
export const HEURES_HEBDO=LB.tempsTravail.dureeHebdoLegale; // 38
export const JOURS_FERIES=LB.tempsTravail.jourFerie.nombre; // 10


// ═══ SAISIES SUR SALAIRE — Barèmes 2026 (Art. 1409-1412 Code judiciaire) ═══
export const SAISIE_2026_TRAVAIL = [
  { min: 0, max: 1278, pct: 0, label: "Insaisissable" },
  { min: 1278, max: 1372, pct: 20, label: "20%" },
  { min: 1372, max: 1513, pct: 30, label: "30%" },
  { min: 1513, max: 1654, pct: 40, label: "40%" },
  { min: 1654, max: Infinity, pct: 100, label: "Saisissable en totalité" },
];

export const SAISIE_2026_REMPLACEMENT = [
  { min: 0, max: 1278, pct: 0, label: "Insaisissable" },
  { min: 1278, max: 1372, pct: 20, label: "20%" },
  { min: 1372, max: 1513, pct: 30, label: "30%" },
  { min: 1513, max: 1654, pct: 40, label: "40%" },
  { min: 1654, max: Infinity, pct: 100, label: "Saisissable en totalité" },
];

export const SAISIE_IMMUN_ENFANT_2026 = 73;

// ═══ ALLOCATIONS FAMILIALES PAR RÉGION ═══
export const AF_REGIONS = {
  BXL: { cutoff: 2020, base: [{ age: 0, to: 11, amt: 171.08 }, { age: 12, to: 17, amt: 171.08 + 29.64 }, { age: 18, to: 24, amt: 171.08 + 29.64 }], ancien: { rang1: 97.73 }, ancienReduction: 0 },
  WAL: { cutoff: 2020, base: [{ age: 0, to: 5, amt: 181.61 }, { age: 6, to: 11, amt: 181.61 }, { age: 12, to: 17, amt: 181.61 + 22.53 }, { age: 18, to: 24, amt: 181.61 + 30.88 }], ancien: { rang1: 97.73 } },
  VL: { cutoff: 2019, base: [{ age: 0, to: 11, amt: 173.20 }, { age: 12, to: 17, amt: 173.20 + 6.32 }, { age: 18, to: 24, amt: 173.20 + 10.44 }], ancien: { rang1: 97.73 } },
};

// ═══════════════════════════════════════════════════════════
// BARÈMES CP — BASE COMPLÈTE 2026
// Barèmes classe + ancienneté + prime sectorielle + cotisation extra
// + indexation sectorielle + type (ouvrier/employé)
// Source: CCT sectorielles, SPF ETCS, salairesminimums.be
// Auto-mis à jour par /api/cron/baremes-cp — 06h10 CET quotidien
// ═══════════════════════════════════════════════════════════
export const BAREMES_CP_MIN = {
  '200':   { cl1: 2070.48, cl2: 2174.00, cl3: 2266.16, cl4: 2614.86, nom: 'CP 200 — Employés (général)' },
  '118':   { cl1: 2095.44, cl2: 2173.20, cl3: 2269.56, cl4: 2365.92, cl5: 2510.52, nom: 'CP 118 — Industrie alimentaire' },
  '119':   { cl1: 2029.88, cl2: 2134.72, cl3: 2269.56, cl4: 2414.40, nom: 'CP 119 — Commerce alimentaire' },
  '302':   { cl1: 2029.88, cl2: 2095.44, cl3: 2226.58, cl4: 2365.92, cl5: 2582.76, nom: 'CP 302 — Hôtellerie' },
  '124':   { cl1: 2095.44, cl2: 2204.76, cl3: 2366.28, cl4: 2594.16, nom: 'CP 124 — Construction' },
  '32201': { cl1: 2029.88, cl2: 2070.48, nom: 'CP 322.01 — Titres-services' },
  '330':   { cl1: 2070.48, cl2: 2173.20, cl3: 2366.28, cl4: 2623.92, cl5: 2916.24, nom: 'CP 330 — Santé' },
  '111':   { cl1: 2095.44, cl2: 2248.32, cl3: 2473.80, cl4: 2723.58, nom: 'CP 111 — Métal' },
  '140':   { cl1: 2095.44, cl2: 2204.76, cl3: 2430.12, cl4: 2763.60, nom: 'CP 140 — Transport' },
  '121':   { cl1: 2029.88, cl2: 2095.44, cl3: 2204.76, cl4: 2366.28, nom: 'CP 121 — Nettoyage' },
  '152':   { cl1: 2029.88, cl2: 2134.72, cl3: 2269.56, cl4: 2462.28, nom: 'CP 152 — Enseignement libre' },
  '100':   { cl1: 2070.48, cl2: 2134.72, cl3: 2204.76, cl4: 2366.28, nom: 'CP 100 — Ouvriers (général)' },
  '112':   { cl1: 2095.44, cl2: 2248.32, cl3: 2473.80, cl4: 2723.58, nom: 'CP 112 — Métal électrotechnique' },
  '126':   { cl1: 2070.48, cl2: 2173.20, cl3: 2269.56, cl4: 2414.40, nom: 'CP 126 — Bois & ameublement' },
  '130':   { cl1: 2134.72, cl2: 2269.56, cl3: 2430.12, cl4: 2623.92, nom: 'CP 130 — Imprimerie' },
  '149':   { cl1: 2134.72, cl2: 2269.56, cl3: 2462.28, cl4: 2689.44, nom: 'CP 149 — Electricité' },
  '220':   { cl1: 2070.48, cl2: 2134.72, cl3: 2204.76, cl4: 2366.28, nom: 'CP 220 — Commerce détail' },
  '226':   { cl1: 2095.44, cl2: 2204.76, cl3: 2366.28, cl4: 2582.76, nom: 'CP 226 — Peinture' },
  '308':   { cl1: 2029.88, cl2: 2095.44, cl3: 2204.76, cl4: 2366.28, nom: 'CP 308 — Hôtels & restaurants' },
  '313':   { cl1: 2134.72, cl2: 2269.56, cl3: 2430.12, cl4: 2689.44, nom: 'CP 313 — Pharmacies' },
  '315':   { cl1: 2070.48, cl2: 2173.20, cl3: 2269.56, cl4: 2462.28, nom: 'CP 315 — Garages' },
  '317':   { cl1: 2095.44, cl2: 2204.76, cl3: 2366.28, cl4: 2582.76, nom: 'CP 317 — Transport & Logistique' },
  '319':   { cl1: 2134.72, cl2: 2366.28, cl3: 2582.76, cl4: 2916.24, nom: 'CP 319 — Assurances' },
  '322':   { cl1: 2070.48, cl2: 2134.72, nom: 'CP 322 — Intérim employés' },
  '326':   { cl1: 2070.48, cl2: 2173.20, cl3: 2269.56, cl4: 2430.12, nom: 'CP 326 — Commerce de gros' },
  '329':   { cl1: 2070.48, cl2: 2134.72, cl3: 2204.76, cl4: 2366.28, nom: 'CP 329 — Socio-culturel' },
  '331':   { cl1: 2366.28, cl2: 2582.76, cl3: 2916.24, cl4: 3249.72, nom: 'CP 331 — Crédit (banques)' },
  '332':   { cl1: 2070.48, cl2: 2134.72, nom: 'CP 332 — Intérim ouvriers' },
  '336':   { cl1: 2070.48, cl2: 2134.72, cl3: 2204.76, cl4: 2366.28, nom: 'CP 336 — Grande distribution' },
  '337':   { cl1: 2070.48, cl2: 2134.72, cl3: 2204.76, cl4: 2366.28, nom: 'CP 337 — Non-marchand' },
  '341':   { cl1: 2366.28, cl2: 2582.76, cl3: 2916.24, cl4: 3249.72, cl5: 3749.16, nom: 'CP 341 — Informatique' },
  dateMAJ: '2026-03-08',
};

// ═══════════════════════════════════════════════════════════
// CP_DATA — BASE COMPLÈTE PAR COMMISSION PARITAIRE
// Structure: { nom, type, ouvrier, cl1..cl5, onssE_extra,
//              primeSect (€/an), anciennete (€/an par tranche),
//              indexation (type), cotisations_speciales }
// ═══════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// CP_DATA — BASE COMPLÈTE PAR COMMISSION PARITAIRE (v3 — Précision Totale)
// Champs:
//   nom          : libellé officiel
//   ouvrier      : true = ouvrier, false = employé
//   cl1..cl5     : barèmes mensuels bruts par classe (€/mois, indexés 2026)
//   anciennete   : [ { ans, pct, montantFixe? } ] — % OU montant fixe/mois
//   onssE_extra  : cotisation patronale supplémentaire (décimal, ex: 0.021 = 2,1%)
//   primeSect    : prime sectorielle ANNUELLE en € (CCT sectorielle)
//   primeAncEuro : prime d'ancienneté fixe en €/mois par tranche (alternative au %)
//   indexation   : 'IPC' (indice santé) | 'AGORIA' | 'CC' (commission centrale)
//   coefIndex    : coefficient d'indexation sectoriel actuel (base 100 = jan 2024)
//   fonds        : description fonds sectoriels obligatoires
//   cotisSpec    : cotisations spéciales en plus (timbres, fonds, etc.)
//   regimeOuvrier108: true = base ONSS × 1.08 (pécule ouvrier)
// Source: SPF ETCS, CCT sectorielles, salairesminimums.be — MAJ: 2026-01-01
// ═══════════════════════════════════════════════════════════════════
export const CP_DATA = {
  '100': {
    nom: 'CP 100 — Ouvriers (général)', ouvrier: true,
    cl1: 2070.48, cl2: 2134.72, cl3: 2204.76, cl4: 2366.28,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 2 }, { ans: 10, pct: 5 }, { ans: 20, pct: 8 }
    ],
    onssE_extra: 0, primeSect: 0,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '111': {
    nom: 'CP 111 — Métal Fabrications Métalliques', ouvrier: true,
    cl1: 2095.44, cl2: 2248.32, cl3: 2473.80, cl4: 2723.58,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 3 }, { ans: 10, pct: 6 }, { ans: 15, pct: 9 }, { ans: 20, pct: 12 }
    ],
    onssE_extra: 0.005, primeSect: 60,
    indexation: 'AGORIA', coefIndex: 1.0000,
    fonds: "Fonds de sécurité d'existence 0,5%",
    cotisSpec: [{ label: 'Fonds sécurité', pct: 0.005, base: 'brut' }],
    dateMAJ: '2026-01-01',
  },
  '112': {
    nom: 'CP 112 — Métal Électrotechnique', ouvrier: true,
    cl1: 2095.44, cl2: 2248.32, cl3: 2473.80, cl4: 2723.58,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 3 }, { ans: 10, pct: 6 }, { ans: 20, pct: 12 }
    ],
    onssE_extra: 0.005, primeSect: 60,
    indexation: 'AGORIA', coefIndex: 1.0000,
    fonds: 'Fonds de formation 0,5%',
    cotisSpec: [{ label: 'Fonds formation', pct: 0.005, base: 'brut' }],
    dateMAJ: '2026-01-01',
  },
  '118': {
    nom: 'CP 118 — Industrie alimentaire', ouvrier: true,
    cl1: 2095.44, cl2: 2173.20, cl3: 2269.56, cl4: 2365.92, cl5: 2510.52,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 3, pct: 2 }, { ans: 5, pct: 3 }, { ans: 10, pct: 5 }, { ans: 20, pct: 8 }
    ],
    onssE_extra: 0.003, primeSect: 45,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: 'Fonds de formation 0,3%',
    cotisSpec: [{ label: 'Fonds formation', pct: 0.003, base: 'brut' }],
    dateMAJ: '2026-01-01',
  },
  '119': {
    nom: 'CP 119 — Commerce alimentaire', ouvrier: true,
    cl1: 2029.88, cl2: 2134.72, cl3: 2269.56, cl4: 2414.40,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 2 }, { ans: 10, pct: 4 }
    ],
    onssE_extra: 0, primeSect: 0,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '121': {
    nom: 'CP 121 — Nettoyage et désinfection', ouvrier: true,
    cl1: 2029.88, cl2: 2095.44, cl3: 2204.76, cl4: 2366.28,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 3, pct: 1 }, { ans: 5, pct: 2 }, { ans: 10, pct: 3 }
    ],
    onssE_extra: 0.002, primeSect: 0,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: 'Fonds RCC 0,2%',
    cotisSpec: [{ label: 'Fonds RCC', pct: 0.002, base: 'brut' }],
    dateMAJ: '2026-01-01',
  },
  '124': {
    nom: 'CP 124 — Construction', ouvrier: true,
    cl1: 2095.44, cl2: 2204.76, cl3: 2366.28, cl4: 2594.16,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 4 }, { ans: 10, pct: 8 }, { ans: 20, pct: 12 }
    ],
    onssE_extra: 0.021, primeSect: 80,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: 'FFB 2,1% (timbres fidélité + intempéries)',
    cotisSpec: [
      { label: 'Timbres fidélité FFB', pct: 0.012, base: 'brut' },
      { label: 'Fonds intempéries', pct: 0.009, base: 'brut' },
    ],
    dateMAJ: '2026-01-01',
  },
  '126': {
    nom: 'CP 126 — Bois & Ameublement', ouvrier: true,
    cl1: 2070.48, cl2: 2173.20, cl3: 2269.56, cl4: 2414.40,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 3 }, { ans: 10, pct: 6 }
    ],
    onssE_extra: 0.003, primeSect: 50,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: 'Fonds de sécurité 0,3%',
    cotisSpec: [{ label: 'Fonds sécurité', pct: 0.003, base: 'brut' }],
    dateMAJ: '2026-01-01',
  },
  '130': {
    nom: 'CP 130 — Imprimerie', ouvrier: true,
    cl1: 2134.72, cl2: 2269.56, cl3: 2430.12, cl4: 2623.92,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 4 }, { ans: 10, pct: 8 }, { ans: 20, pct: 12 }
    ],
    onssE_extra: 0.004, primeSect: 70,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: 'Fonds de formation 0,4%',
    cotisSpec: [{ label: 'Fonds formation', pct: 0.004, base: 'brut' }],
    dateMAJ: '2026-01-01',
  },
  '140': {
    nom: 'CP 140 — Transport routier & Logistique', ouvrier: true,
    cl1: 2095.44, cl2: 2204.76, cl3: 2430.12, cl4: 2763.60,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 2 }, { ans: 10, pct: 4 }, { ans: 15, pct: 6 }
    ],
    onssE_extra: 0.001, primeSect: 40,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: 'Fonds de sécurité 0,1%',
    cotisSpec: [{ label: 'Fonds sécurité', pct: 0.001, base: 'brut' }],
    dateMAJ: '2026-01-01',
  },
  '149': {
    nom: 'CP 149 — Electricité', ouvrier: true,
    cl1: 2134.72, cl2: 2269.56, cl3: 2462.28, cl4: 2689.44,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 4 }, { ans: 10, pct: 7 }, { ans: 20, pct: 10 }
    ],
    onssE_extra: 0.003, primeSect: 65,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: 'Volta Fonds 0,3%',
    cotisSpec: [{ label: 'Fonds Volta', pct: 0.003, base: 'brut' }],
    dateMAJ: '2026-01-01',
  },
  '152': {
    nom: 'CP 152 — Enseignement libre subventionné', ouvrier: false,
    cl1: 2029.88, cl2: 2134.72, cl3: 2269.56, cl4: 2462.28,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 3 }, { ans: 10, pct: 6 }, { ans: 20, pct: 10 }
    ],
    onssE_extra: 0, primeSect: 0,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '200': {
    nom: 'CP 200 — Employés (général)', ouvrier: false,
    cl1: 2070.48, cl2: 2174.00, cl3: 2266.16, cl4: 2614.86,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 3 }, { ans: 10, pct: 6 }, { ans: 15, pct: 9 }, { ans: 20, pct: 12 }
    ],
    onssE_extra: 0, primeSect: 0,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '218': {
    nom: 'CP 218 — Aide alimentaire (employés)', ouvrier: false,
    cl1: 2070.48, cl2: 2134.72, cl3: 2204.76, cl4: 2366.28,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 2 }, { ans: 10, pct: 4 }
    ],
    onssE_extra: 0, primeSect: 0,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '220': {
    nom: 'CP 220 — Commerce détail alimentaire', ouvrier: false,
    cl1: 2070.48, cl2: 2134.72, cl3: 2204.76, cl4: 2366.28,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 2 }, { ans: 10, pct: 4 }
    ],
    onssE_extra: 0, primeSect: 25,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '226': {
    nom: 'CP 226 — Peinture & décoration', ouvrier: false,
    cl1: 2095.44, cl2: 2204.76, cl3: 2366.28, cl4: 2582.76,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 3 }, { ans: 10, pct: 5 }
    ],
    onssE_extra: 0, primeSect: 50,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '227': {
    nom: 'CP 227 — Audio-visuel', ouvrier: false,
    cl1: 2134.72, cl2: 2269.56, cl3: 2462.28, cl4: 2689.44,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 3 }, { ans: 10, pct: 6 }
    ],
    onssE_extra: 0, primeSect: 0,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '302': {
    nom: 'CP 302 — Hôtellerie (ouvriers)', ouvrier: true,
    cl1: 2029.88, cl2: 2095.44, cl3: 2226.58, cl4: 2365.92, cl5: 2582.76,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 2 }, { ans: 10, pct: 4 }
    ],
    onssE_extra: 0, primeSect: 30,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '308': {
    nom: 'CP 308 — Hôtels & Restaurants (employés)', ouvrier: false,
    cl1: 2029.88, cl2: 2095.44, cl3: 2204.76, cl4: 2366.28,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 2 }, { ans: 10, pct: 4 }
    ],
    onssE_extra: 0, primeSect: 30,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '313': {
    nom: 'CP 313 — Pharmacies', ouvrier: false,
    cl1: 2134.72, cl2: 2269.56, cl3: 2430.12, cl4: 2689.44,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 3, pct: 3 }, { ans: 5, pct: 5 }, { ans: 10, pct: 8 }, { ans: 20, pct: 12 }
    ],
    onssE_extra: 0, primeSect: 0,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '315': {
    nom: 'CP 315 — Garages & Carrosseries', ouvrier: false,
    cl1: 2070.48, cl2: 2173.20, cl3: 2269.56, cl4: 2462.28,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 3 }, { ans: 10, pct: 5 }
    ],
    onssE_extra: 0, primeSect: 40,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '317': {
    nom: 'CP 317 — Transport & Logistique (employés)', ouvrier: false,
    cl1: 2095.44, cl2: 2204.76, cl3: 2366.28, cl4: 2582.76,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 2 }, { ans: 10, pct: 4 }
    ],
    onssE_extra: 0, primeSect: 0,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '319': {
    nom: 'CP 319 — Assurances', ouvrier: false,
    cl1: 2134.72, cl2: 2366.28, cl3: 2582.76, cl4: 2916.24,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 3, pct: 4 }, { ans: 5, pct: 7 }, { ans: 10, pct: 12 }, { ans: 20, pct: 18 }
    ],
    onssE_extra: 0, primeSect: 100,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '322': {
    nom: 'CP 322 — Intérim (employés)', ouvrier: false,
    cl1: 2070.48, cl2: 2134.72,
    anciennete: [{ ans: 0, pct: 0 }],
    onssE_extra: 0.0015, primeSect: 0,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: 'Fonds de formation intérim 0,15%',
    cotisSpec: [{ label: 'Fonds formation intérim', pct: 0.0015, base: 'brut' }],
    dateMAJ: '2026-01-01',
  },
  '32201': {
    nom: 'CP 322.01 — Titres-services', ouvrier: true,
    cl1: 2029.88, cl2: 2070.48,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 2 }, { ans: 10, pct: 4 }
    ],
    onssE_extra: 0.0028, primeSect: 0,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: 'Fonds formation titres-services 0,28%',
    cotisSpec: [{ label: 'Cotis. complémentaire titres-services', pct: 0.0028, base: 'brut' }],
    dateMAJ: '2026-01-01',
  },
  '326': {
    nom: 'CP 326 — Commerce de gros alimentaire', ouvrier: false,
    cl1: 2070.48, cl2: 2173.20, cl3: 2269.56, cl4: 2430.12,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 2 }, { ans: 10, pct: 4 }
    ],
    onssE_extra: 0, primeSect: 20,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '329': {
    nom: 'CP 329 — Socio-culturel', ouvrier: false,
    cl1: 2070.48, cl2: 2134.72, cl3: 2204.76, cl4: 2366.28,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 3 }, { ans: 10, pct: 6 }
    ],
    onssE_extra: 0.003, primeSect: 0,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: 'Maribel social 0,3%',
    cotisSpec: [{ label: 'Maribel social', pct: 0.003, base: 'brut' }],
    dateMAJ: '2026-01-01',
  },
  '330': {
    nom: 'CP 330 — Santé privée', ouvrier: false,
    cl1: 2070.48, cl2: 2173.20, cl3: 2366.28, cl4: 2623.92, cl5: 2916.24,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 3, pct: 3 }, { ans: 5, pct: 5 }, { ans: 10, pct: 8 }, { ans: 20, pct: 12 }
    ],
    onssE_extra: 0, primeSect: 35,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '331': {
    nom: 'CP 331 — Crédit & Banques', ouvrier: false,
    cl1: 2366.28, cl2: 2582.76, cl3: 2916.24, cl4: 3249.72,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 3, pct: 5 }, { ans: 5, pct: 8 }, { ans: 10, pct: 14 }, { ans: 20, pct: 20 }
    ],
    onssE_extra: 0, primeSect: 120,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '332': {
    nom: 'CP 332 — Intérim (ouvriers)', ouvrier: true,
    cl1: 2070.48, cl2: 2134.72,
    anciennete: [{ ans: 0, pct: 0 }],
    onssE_extra: 0.0015, primeSect: 0,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: 'Fonds de formation intérim 0,15%',
    cotisSpec: [{ label: 'Fonds formation intérim', pct: 0.0015, base: 'brut' }],
    dateMAJ: '2026-01-01',
  },
  '336': {
    nom: 'CP 336 — Grande distribution', ouvrier: false,
    cl1: 2070.48, cl2: 2134.72, cl3: 2204.76, cl4: 2366.28,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 5, pct: 2 }, { ans: 10, pct: 4 }
    ],
    onssE_extra: 0, primeSect: 30,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
  '337': {
    nom: 'CP 337 — Non-marchand & Aide sociale', ouvrier: false,
    cl1: 2070.48, cl2: 2134.72, cl3: 2204.76, cl4: 2366.28,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 3, pct: 3 }, { ans: 5, pct: 5 }, { ans: 10, pct: 8 }, { ans: 20, pct: 12 }
    ],
    onssE_extra: 0.003, primeSect: 0,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: 'Maribel social renforcé 0,3%',
    cotisSpec: [{ label: 'Maribel social renforcé', pct: 0.003, base: 'brut' }],
    dateMAJ: '2026-01-01',
  },
  '341': {
    nom: 'CP 341 — Services informatiques (IT)', ouvrier: false,
    cl1: 2366.28, cl2: 2582.76, cl3: 2916.24, cl4: 3249.72, cl5: 3749.16,
    anciennete: [
      { ans: 0, pct: 0 }, { ans: 3, pct: 5 }, { ans: 5, pct: 8 }, { ans: 10, pct: 14 }, { ans: 20, pct: 20 }
    ],
    onssE_extra: 0, primeSect: 150,
    indexation: 'IPC', coefIndex: 1.0000,
    fonds: null, cotisSpec: [],
    dateMAJ: '2026-01-01',
  },
};

// Fonction utilitaire: calcule le barème minimum pour une CP, classe et ancienneté
export function getBaremeCP(cpId, classe, anciennetAns) {
  const cp = CP_DATA[cpId] || CP_DATA['200'];
  const cl = Math.min(Math.max(classe || 1, 1), 5);
  const key = 'cl' + cl;
  const base = cp[key] || cp.cl1 || 2070.48;
  // Ancienneté: trouver la tranche applicable
  const tranches = cp.anciennete || [];
  let pctAnc = 0;
  for (const t of tranches) {
    if ((anciennetAns || 0) >= t.ans) pctAnc = t.pct;
  }
  return Math.round(base * (1 + pctAnc / 100) * 100) / 100;
}

// Fonction utilitaire: prime sectorielle mensuelle
export function getPrimeSectorielle(cpId) {
  const cp = CP_DATA[cpId] || CP_DATA['200'];
  return Math.round((cp.primeSect || 0) / 12 * 100) / 100;
}

// Fonction utilitaire: cotisation ONSS patronale extra sectorielle
export function getOnssEExtra(cpId) {
  const cp = CP_DATA[cpId] || CP_DATA['200'];
  return cp.onssE_extra || 0;
}

// ── Barèmes IPP annuels 2026 (Art. 130 CIR/92) ──
export const IPP_TRANCHES_2026 = [
  { max: 15200,  taux: 0.25 },
  { max: 26440,  taux: 0.40 },
  { max: 45500,  taux: 0.45 },
  { max: Infinity, taux: 0.50 },
];
export const IPP_FRAIS_PRO_PCT  = 0.30;  // déduction forfaitaire frais pro
export const IPP_FRAIS_PRO_MAX  = 5750;  // plafond annuel frais pro
export const IPP_TAXE_COMMUNALE = 0.07;  // taux communal moyen (6-8%, base 7%)
export const IPP_QUOTITE_BASE   = 10160; // quotité exemptée de base (revenu annuel)
// Réductions enfants (annuelles, sur impôt à payer)
export const IPP_REDUC_ENFANTS  = [0, 1850, 2990, 4990, 7410]; // 0,1,2,3,4+ enfants

// ── Taux cotisations patronales sectoriels ──
export const ONSS_E_SECTEURS = {
  '100': 0, '111': 0.005, '112': 0.005, '118': 0.003, '121': 0.002,
  '124': 0.021, '126': 0.003, '130': 0.004, '140': 0.001, '149': 0.003,
  '200': 0, '220': 0, '226': 0, '308': 0, '313': 0, '315': 0,
  '317': 0, '319': 0, '322': 0.0015, '326': 0, '329': 0.003,
  '330': 0, '331': 0, '332': 0.0015, '336': 0, '337': 0.003, '341': 0,
};
export const PRIMES_SECTORIELLES = {
  '100': 0, '111': 60, '112': 60, '118': 45, '121': 0, '124': 80,
  '126': 50, '130': 70, '140': 40, '149': 65, '200': 0, '220': 25,
  '226': 50, '308': 30, '313': 0, '315': 40, '317': 0, '319': 100,
  '322': 0, '326': 20, '329': 0, '330': 35, '331': 120, '332': 0,
  '336': 30, '337': 0, '341': 150,
};

// ── Régimes fiscaux spéciaux avantages & primes ──
export const TAUX_WARRANTS         = 0.18;   // Loi 26/03/1999 — imposition forfaitaire warrants à l'attribution
export const TAUX_PARTICIPATION    = 0.07;   // Loi 22/05/2001 — taxe spéciale participation bénéfices
export const TAUX_CCT90_COTIS      = 0.1307; // CCT 90 — cotisation solidarité travailleur sur prime résultat
export const TAUX_DOUBLE_PECULE    = 0.92;   // AR 30/03/2000 — pécule vacances double (92% brut mensuel)
export const TAUX_HEURES_SUPP_SAL  = 0.50;   // AR 25/11/1991 — sursalaire heures supplémentaires (50%)
export const TAUX_HEURES_SUPP_NW   = 1.00;   // Dimanche/férié — sursalaire 100%
export const HEURES_MENSUELLES     = 173;    // 38h/semaine × 52/12 = 164.67 arrondi 173 (usage convention)
export const HEURES_ATN_VOITURE    = 0.006;  // ATN voiture: coeff mensuel → voir LOIS_BELGES.atn
export const TAUX_CCP28            = 0.28;   // Cotisation complémentaire CP 32201 titres-services
export const PLANCHER_ETUDIANT_SOL = 0.0271; // Cotisations solidarité étudiant (2.71% W + 5.42% E hors contingent)
export const CCT90_PLAFOND         = 4255;   // CCT 90 — plafond annuel prime résultat (AR 22/12/2023)
export const CCT90_COTIS_E         = 0.33;   // CCT 90 — cotisation spéciale employeur (33% au lieu de 25.07%)
export const TX_BUDGET_MOB         = 0.3807; // Budget mobilité pilier 3 — cotisation ONSS forfaitaire (AR 17/03/2019)
export const BONUS_SEUIL1          = LB.pp.bonusEmploi.seuilBrut1; // 2561.42 — seuil bas bonus emploi
export const BONUS_SEUIL2          = LB.pp.bonusEmploi.seuilBrut2; // 2997.59 — seuil haut bonus emploi
export const ECO_MAX               = 250;    // CCT 98 — plafond éco-chèques annuel (temps plein)
