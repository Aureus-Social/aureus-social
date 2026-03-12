// === AUREUS SOCIAL PRO - Helpers partages ===
"use client";
export { C, B, I, ST, PH, SC, fmt, Tbl, f2, f0 } from './shared-ui';
export { LOIS_BELGES, LB, TX_ONSS_W, TX_ONSS_E, TX_OUV108, TX_AT, PP_EST, NET_FACTOR, PV_SIMPLE, PV_DOUBLE, RMMMG, CR_PAT, CR_MAX, CR_TRAV, FORF_BUREAU, FORF_KM, BONUS_MAX, SEUIL_CPPT, SEUIL_CE, HEURES_HEBDO, JOURS_FERIES, SAISIE_2026_TRAVAIL, SAISIE_2026_REMPLACEMENT, SAISIE_IMMUN_ENFANT_2026, AF_REGIONS, quickNetEst, generateExportCompta, exportTravailleurs, importTravailleurs, obf, safeLS } from './lois-belges';
// Exports supplémentaires pour éliminer les valeurs en dur dans les modules
export const FORF_VELO = 0.35;   // LB.fraisPropres.forfaitDeplacement.velo
export const ECO_MAX   = 250;    // LB.avantages.ecoMax
export const TX_OUV_SPECIAL = 0.2714; // ONSS patronal ouvrier 108% (~25.07% × 1.08)
export const BONUS_SEUIL1 = 2561.42; // LB.pp.bonusEmploi.seuilBrut1
export const BONUS_SEUIL2 = 2997.59; // LB.pp.bonusEmploi.seuilBrut2
export const CO2MIN = 31.34;          // LB.vehicules.cotCO2Min
export const LEGAL = { WD: 21.67, WHD: 7.6 };
export const DPER = { month: new Date().getMonth()+1, year: new Date().getFullYear(), days: 21.67 };
export function calc(emp, per, co) {
  const brut = +(emp&&(emp.monthlySalary||emp.gross||emp.brut)||0);
  const onssW = Math.round(brut*0.1307*100)/100;
  const imposable = brut-onssW;
  const pp = Math.round(imposable*0.22*100)/100;
  const net = Math.round((imposable-pp)*100)/100;
  const onssE = Math.round(brut*0.2507*100)/100;
  return {base:brut,gross:brut,onssNet:onssW,imposable,tax:pp,pp,css:0,net,onssE,costTotal:Math.round((brut+onssE)*100)/100,bonus:0,overtime:0,y13:0,sickPay:0};
}
export function quickPP(brut) {
  const imp = brut-brut*0.1307;
  if(imp<=1110)return 0;
  if(imp<=1560)return Math.round((imp-1110)*0.2668*100)/100;
  if(imp<=2700)return Math.round((120.06+(imp-1560)*0.4280)*100)/100;
  return Math.round((607.98+(imp-2700)*0.4816)*100)/100;
}
export function quickNet(brut){return Math.round((brut||0)*(1-0.1307)*(1-0.22)*100)/100;}
export function validateNISS(niss){
  if(!niss)return{valid:false,msg:'NISS vide'};
  const c=String(niss).replace(/[\s.\-]/g,'');
  if(!/^\d{11}$/.test(c))return{valid:false,msg:'Format invalide (11 chiffres)'};
  const base=parseInt(c.substring(0,9)),check=parseInt(c.substring(9,11));
  const v=97-(base%97)===check||97-((2000000000+base)%97)===check;
  return{valid:v,msg:v?'NISS valide':'Cle de controle invalide'};
}
export function genDimonaXML({emp,action,startDate,endDate,wtype,employer}){
  const e=emp||{},niss=(e.niss||'').replace(/[\s.\-]/g,'');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Dimona xmlns="http://www.socialsecurity.be/xsd/dimona/2.1">\n  <Sender><EnterpriseID>${employer?.vat?.replace(/[^0-9]/g,'')||'1028230781'}</EnterpriseID><Timestamp>${new Date().toISOString()}</Timestamp></Sender>\n  <Declaration><Action>${action||'IN'}</Action><Worker><NISS>${niss}</NISS><LastName>${e.last||''}</LastName><FirstName>${e.first||''}</FirstName></Worker><WorkerType>${wtype||'OTH'}</WorkerType><StartDate>${startDate||new Date().toISOString().split('T')[0]}</StartDate>${endDate?`<EndDate>${endDate}</EndDate>`:''}</Declaration>\n</Dimona>`;
}
export async function submitToONSS(xml,env){
  await new Promise(r=>setTimeout(r,800));
  return{success:true,ref:`SIM-${Date.now()}`,status:'ACCEPTED',env:'simulation',msg:'Dimona simulee - reference test generee'};
}
export async function generatePayslipPDF(payslip,emp,co){
  const{aureuspdf}=await import('./pdf-aureus');
  return aureuspdf(`Fiche de paie - ${co?.name||'Employeur'}`,[{title:'Employe',items:[{label:'Nom',value:`${emp?.first||''} ${emp?.last||''}`},{label:'NISS',value:emp?.niss||'-'},{label:'CP',value:emp?.cp||'200'}]},{title:'Remuneration',items:[{label:'Brut',value:`${payslip?.gross||0} EUR`},{label:'ONSS',value:`-${payslip?.onssNet||0} EUR`},{label:'PP',value:`-${payslip?.pp||0} EUR`},{label:'NET',value:`${payslip?.net||0} EUR`,bold:true}]}],{period:payslip?.period});
}
export function getAlertes(emps,co){
  const al=[];
  const ae=(emps||[]).filter(e=>e.status==='active'||!e.status);
  if(!ae.length)al.push({level:'info',icon:'👥',msg:'Aucun travailleur actif'});
  ae.forEach(e=>{
    if(!e.niss)al.push({level:'warning',icon:'⚠️',msg:`NISS manquant - ${e.first||''} ${e.last||''}`});
    if(!e.monthlySalary&&!e.gross)al.push({level:'warning',icon:'💰',msg:`Salaire non defini - ${e.first||''}`});
  });
  const now=new Date();
  if(now.getDate()>=20)al.push({level:'info',icon:'📅',msg:`Cloture paie ${now.getMonth()+1}/${now.getFullYear()}`});
  if(now.getDate()>=25)al.push({level:'danger',icon:'🚨',msg:'Virements SEPA a preparer'});
  return al;
}
export { BAREMES_CP_MIN } from './lois-belges';

// ── SEPA depuis doc-generators ──
export { generateSEPAXML } from './doc-generators';

// ── DmfA XML generator ──
export function generateDmfAXML(emps, trimestre, annee, co) {
  const coName = co?.name || 'Aureus IA SPRL';
  const coOnss = (co?.onss || '').replace(/[^0-9]/g, '');
  const ae = (emps || []).filter(e => e.status === 'active' || !e.status);
  const lignes = ae.map(e => {
    const brut = +(e.monthlySalary || e.gross || 0) * 3; // trimestre
    const onssW = Math.round(brut * 0.1307 * 100) / 100;
    const onssE = Math.round(brut * 0.2507 * 100) / 100;
    return `  <Travailleur>
    <NISS>${e.niss || ''}</NISS>
    <Nom>${(e.last || e.ln || '')}</Nom>
    <Prenom>${(e.first || e.fn || '')}</Prenom>
    <RemunerationBrute>${brut.toFixed(2)}</RemunerationBrute>
    <CotisationTravailleur>${onssW.toFixed(2)}</CotisationTravailleur>
    <CotisationPatronale>${onssE.toFixed(2)}</CotisationPatronale>
  </Travailleur>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<DmfA xmlns="http://www.onss.be/dmfa/2026">
  <Employeur>
    <Nom>${coName}</Nom>
    <MatriculeONSS>${coOnss}</MatriculeONSS>
    <Trimestre>${annee}T${trimestre}</Trimestre>
  </Employeur>
  <Travailleurs>
${lignes}
  </Travailleurs>
</DmfA>`;
  const blob = new Blob([xml], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `DmfA_${annee}_T${trimestre}.xml`;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 3000);
  return xml;
}
