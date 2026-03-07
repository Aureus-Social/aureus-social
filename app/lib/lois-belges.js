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
export const TX_AT=LB.assurances.accidentTravail.taux; // 0.01
export const COUT_MED=LB.assurances.medecineTravail.cout; // COUT_MED
export const CR_TRAV=LB.chequesRepas.partTravailleur.min; // CR_TRAV
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

// ═══ BARÈMES MINIMA SECTORIELS — CLASSE I (NON-QUALIFIÉ) ═══
// Source: CCT sectorielles + salairesminimums.be
// Auto-mis à jour par /api/cron/baremes-cp — 06h10 CET quotidien
// Ces valeurs représentent le MINIMUM ABSOLU de classe 1 pour chaque CP
export const BAREMES_CP_MIN = {
  '200':   { cl1: 2070.48, cl2: 2174.00, cl3: 2266.16, cl4: 2614.86, nom: 'CP 200 — Employés auxiliaire' },
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
  dateMAJ: '2026-03-08',
};
