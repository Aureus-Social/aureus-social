// ═══ AUREUS SOCIAL PRO — Générateurs de documents ═══
// Extrait du monolithe pour réutilisation dans les modules
"use client";

import { TX_ONSS_W, TX_ONSS_E, TX_AT, COUT_MED, PV_SIMPLE, PP_EST } from "@/app/lib/lois-belges";
import { quickPP } from "@/app/lib/payroll-engine";

// ═══ HELPERS ═══
export function downloadFile(content, filename, mimeType) {
  try {
    const blob = new Blob([content], { type: mimeType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { try { document.body.removeChild(a); } catch(e) {} URL.revokeObjectURL(url); }, 5000);
    return true;
  } catch(err) {
    console.error('Download error:', err);
    alert('Erreur téléchargement: ' + err.message);
    return false;
  }
}

export function previewHTML(html, title) {
  try {
    const win = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    if (win && !win.closed) {
      win.document.write(html);
      win.document.close();
      win.document.title = title || 'Aureus Social Pro';
      win.focus();
      return;
    }
  } catch(e) {}
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.88);z-index:99999;display:flex;flex-direction:column;align-items:center;padding:16px';
  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex;gap:8px;margin-bottom:12px';
  const iframe = document.createElement('iframe');
  [
    { text: '📄 Télécharger PDF', bg: '#c6a34e', color: '#060810', fn: () => { try { iframe.contentWindow.print(); } catch(e) { alert('Utilisez Ctrl+P pour enregistrer en PDF'); } } },
    { text: '✕ Fermer', bg: '#ef4444', color: '#fff', fn: () => document.body.removeChild(overlay) }
  ].forEach(b => {
    const btn = document.createElement('button');
    btn.textContent = b.text;
    btn.style.cssText = 'padding:10px 20px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;background:' + b.bg + ';color:' + b.color;
    btn.onclick = b.fn;
    bar.appendChild(btn);
  });
  iframe.style.cssText = 'flex:1;width:100%;max-width:900px;border:2px solid rgba(198,163,78,.3);border-radius:10px;background:#fff';
  iframe.srcdoc = html;
  overlay.appendChild(bar);
  overlay.appendChild(iframe);
  document.body.appendChild(overlay);
}

/** Ouvre le document et lance l'impression (Enregistrer au format PDF). */
export function openForPDF(html, title) {
  if (!html || typeof html !== 'string') { alert('Document indisponible.'); return; }
  try {
    const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700,scrollbars=yes');
    if (win && !win.closed) {
      win.document.write(html);
      win.document.close();
      win.document.title = title || 'Aureus Social Pro';
      win.focus();
      setTimeout(() => { try { win.print(); } catch(e) {} }, 600);
      return;
    }
  } catch(e) {}
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.9);z-index:2147483647;display:flex;flex-direction:column;align-items:center;padding:20px;font-family:system-ui,sans-serif';
  const titre = document.createElement('div');
  titre.textContent = 'Document prêt — Cliquez « Télécharger PDF » puis dans la fenêtre choisissez « Enregistrer au format PDF »';
  titre.style.cssText = 'color:#c6a34e;font-weight:700;font-size:14px;margin-bottom:12px;text-align:center;max-width:600px';
  overlay.appendChild(titre);
  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex;gap:8px;margin-bottom:12px';
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'flex:1;width:100%;max-width:900px;border:2px solid rgba(198,163,78,.4);border-radius:10px;background:#fff';
  iframe.srcdoc = html;
  [
    { text: '📄 Télécharger PDF', bg: '#c6a34e', color: '#060810', fn: () => { try { if (iframe.contentWindow) iframe.contentWindow.print(); else alert('Chargement... Réessayez dans 2 secondes.'); } catch(e) { alert('Utilisez Ctrl+P (ou Cmd+P) puis « Enregistrer au format PDF »'); } } },
    { text: '✕ Fermer', bg: '#ef4444', color: '#fff', fn: () => { try { document.body.removeChild(overlay); } catch(e) {} } }
  ].forEach(b => {
    const btn = document.createElement('button');
    btn.textContent = b.text;
    btn.style.cssText = 'padding:10px 20px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;background:' + b.bg + ';color:' + b.color;
    btn.onclick = b.fn;
    bar.appendChild(btn);
  });
  overlay.appendChild(bar);
  overlay.appendChild(iframe);
  document.body.appendChild(overlay);
}

// ═══ SIMULATION PDF ═══
export function sendSimulationPDF(simData,clientEmail){var d=simData||{};var brut=+(d.brut||0);var onssP=Math.round(brut*TX_ONSS_E*100)/100;var assAT=Math.round(brut*TX_AT*100)/100;var med=COUT_MED;var cr=+(d.cheqRepas||130.02);var coutMens=Math.round((brut+onssP+assAT+med+cr)*100)/100;var nb=+(d.nb||1);var dur=+(d.duree||12);var coutTotal=Math.round(coutMens*nb*100)/100;var coutAn=Math.round(coutMens*nb*dur*100)/100;var onssE=Math.round(brut*TX_ONSS_W*100)/100;var imp=brut-onssE;var pp=quickPP(brut);var net=Math.round((brut-onssE-pp)*100)/100;var ratio=brut>0?Math.round(net/coutMens*100):0;var f2=function(v){return new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0)};var coName=d.coName||"Aureus IA SPRL";var html="<!DOCTYPE html><html><head><meta charset=utf-8><title>Simulation coût salarial</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;padding:30px;max-width:800px;margin:auto;color:#1a1a1a}h1{font-size:18px;color:#c6a34e;margin-bottom:5px}h2{font-size:13px;color:#333;margin:15px 0 8px;border-bottom:1px solid #e5e5e5;padding-bottom:4px}table{width:100%;border-collapse:collapse;margin:8px 0}td{padding:5px 8px;font-size:11px}td:last-child{text-align:right;font-family:monospace;font-weight:600}.kpi{display:flex;gap:15px;margin:12px 0;flex-wrap:wrap}.kpi-box{flex:1;min-width:140px;background:#f8f7f4;border:1px solid #e5e2d9;border-radius:6px;padding:10px;text-align:center}.kpi-val{font-size:16px;font-weight:700;color:#c6a34e}.kpi-lab{font-size:9px;color:#666;margin-top:2px}.total td{font-weight:700;border-top:2px solid #c6a34e;padding-top:8px}.foot{margin-top:25px;font-size:9px;color:#999;text-align:center}@media print{button{display:none!important}}</style></head><body><h1>"+coName+"</h1><p style=font-size:10px;color:#666>Simulation coût salarial - "+new Date().toLocaleDateString("fr-BE")+"</p><div class=kpi><div class=kpi-box><div class=kpi-val>"+f2(brut)+" EUR</div><div class=kpi-lab>Brut mensuel</div></div><div class=kpi-box><div class=kpi-val>"+f2(coutMens)+" EUR</div><div class=kpi-lab>Coût mensuel/pers.</div></div><div class=kpi-box><div class=kpi-val>"+f2(coutAn)+" EUR</div><div class=kpi-lab>Coût sur "+dur+" mois</div></div><div class=kpi-box><div class=kpi-val>"+ratio+"%</div><div class=kpi-lab>Ratio net/coût</div></div></div><h2>Décomposition coût employeur</h2><table><tr><td>Salaire brut</td><td>"+f2(brut)+" EUR</td></tr><tr><td>ONSS patronal 25,07%</td><td>"+f2(onssP)+" EUR</td></tr><tr><td>Assurance AT 1%</td><td>"+f2(assAT)+" EUR</td></tr><tr><td>Médecine travail</td><td>"+f2(med)+" EUR</td></tr><tr><td>Chèques-repas</td><td>"+f2(cr)+" EUR</td></tr><tr class=total><td>COÛT / personne</td><td>"+f2(coutMens)+" EUR</td></tr><tr><td>COÛT TOTAL "+nb+" pers.</td><td>"+f2(coutTotal)+" EUR</td></tr></table><h2>Net employé</h2><table><tr><td>Brut</td><td>"+f2(brut)+"</td></tr><tr><td>ONSS -13,07%</td><td>-"+f2(onssE)+"</td></tr><tr><td>PP</td><td>-"+f2(pp)+"</td></tr><tr class=total><td>Net</td><td>"+f2(net)+" EUR</td></tr></table><div class=foot>Aureus Social Pro - aureussocial.be</div><button onclick=window.print() style=display:block;margin:15px_auto;background:#c6a34e;color:#fff;border:none;padding:10px_30px;border-radius:6px;cursor:pointer>Imprimer</button></body></html>";previewHTML(html,'Simulation_'+brut+'EUR');if(clientEmail){var subject=encodeURIComponent("Simulation coût salarial - "+f2(brut)+" EUR");var body=encodeURIComponent("Bonjour,\n\nSimulation:\n- Brut: "+f2(brut)+" EUR\n- Coût employeur: "+f2(coutMens)+" EUR/mois\n- Net estimé: "+f2(net)+" EUR\n- Ratio: "+ratio+"%\n\nCordialement,\n"+coName);setTimeout(function(){window.location.href="mailto:"+clientEmail+"?subject="+subject+"&body="+body},600)}}

// ═══ ATTESTATION D'EMPLOI ═══
export function generateAttestationEmploi(emp,co){var coName=co?.name||"Aureus IA SPRL";var coVAT=co?.vat||"BE 1028.230.781";var name=(emp.first||emp.fn||"")+" "+(emp.last||emp.ln||"");var f2=function(v){return new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0)};var html="<!DOCTYPE html><html><head><meta charset=utf-8><title>Attestation "+name+"</title><style>*{margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:12px;padding:40px;max-width:800px;margin:auto;line-height:1.6}@media print{button{display:none!important}}</style></head><body><h2 style=text-align:center;text-decoration:underline;margin:20px>ATTESTATION D EMPLOI</h2><p>"+coName+" ("+coVAT+") atteste que <b>"+name+"</b> (NISS: "+(emp.niss||"N/A")+") est employé(e) depuis le <b>"+(emp.startDate||emp.start||"N/A")+"</b> en qualité de <b>"+(emp.function||emp.job||"employé")+"</b>. Contrat: "+(emp.contractType||"CDI")+" - "+(emp.whWeek||38)+"h/sem. Brut: "+f2(+(emp.monthlySalary||emp.gross||0))+" EUR/mois.</p><p>Pour servir et valoir ce que de droit.</p><div style=text-align:center;margin-top:20px><button onclick=window.print()>Imprimer</button></div></body></html>";openForPDF(html,'Attestation_emploi_'+name);}

// ═══ ATTESTATION DE SALAIRE ═══
export function generateAttestationSalaire(emp,co){var coName=co?.name||"Aureus IA SPRL";var name=(emp.first||emp.fn||"")+" "+(emp.last||emp.ln||"");var brut=+(emp.monthlySalary||emp.gross||0);var onss=Math.round(brut*TX_ONSS_W*100)/100;var pp=quickPP(brut);var net=Math.round((brut-onss-pp)*100)/100;var f2=function(v){return new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0)};var html="<!DOCTYPE html><html><head><meta charset=utf-8><style>*{margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:12px;padding:40px;max-width:800px;margin:auto}table{width:100%;border-collapse:collapse;margin:15px 0}th,td{padding:6px 10px;border:1px solid #ccc}@media print{button{display:none!important}}</style></head><body><h2 style=text-align:center;text-decoration:underline>ATTESTATION DE RÉMUNÉRATION</h2><p>"+coName+" certifie que <b>"+name+"</b> perçoit:</p><table><tr><th>Élément</th><th>Mensuel</th><th>Annuel</th></tr><tr><td>Brut</td><td>"+f2(brut)+"</td><td>"+f2(brut*12)+"</td></tr><tr><td>ONSS</td><td>-"+f2(onss)+"</td><td>-"+f2(onss*12)+"</td></tr><tr><td>PP</td><td>-"+f2(pp)+"</td><td>-"+f2(pp*12)+"</td></tr><tr style=font-weight:700><td>Net</td><td>"+f2(net)+"</td><td>"+f2(net*12)+"</td></tr></table><div style=text-align:center;margin-top:20px><button onclick=window.print()>Imprimer</button></div></body></html>";openForPDF(html,'Attestation_salaire_'+name);}

// ═══ SOLDE DE TOUT COMPTE ═══
export function generateSoldeCompte(emp,co){var coName=co?.name||"Aureus IA SPRL";var name=(emp.first||emp.fn||"")+" "+(emp.last||emp.ln||"");var brut=+(emp.monthlySalary||emp.gross||0);var f2=function(v){return new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0)};var pro=Math.round(brut*15/22*100)/100;var pec=Math.round(brut*PV_SIMPLE*100)/100;var pre=brut;var tot=pro+pec+pre;var onss=Math.round(tot*TX_ONSS_W*100)/100;var pp=quickPP(tot);var net=Math.round((tot-onss-pp)*100)/100;var html="<!DOCTYPE html><html><head><meta charset=utf-8><style>*{margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:12px;padding:40px;max-width:800px;margin:auto}table{width:100%;border-collapse:collapse;margin:15px 0}th,td{padding:6px 10px;border:1px solid #ccc}@media print{button{display:none!important}}</style></head><body><h2 style=text-align:center;text-decoration:underline>SOLDE DE TOUT COMPTE</h2><p>"+coName+" - Travailleur: <b>"+name+"</b></p><table><tr><th>Élément</th><th>Montant</th></tr><tr><td>Prorata</td><td>"+f2(pro)+"</td></tr><tr><td>Pécule sortie</td><td>"+f2(pec)+"</td></tr><tr><td>Préavis</td><td>"+f2(pre)+"</td></tr><tr style=font-weight:700><td>Total brut</td><td>"+f2(tot)+"</td></tr><tr><td>ONSS</td><td>-"+f2(onss)+"</td></tr><tr><td>PP</td><td>-"+f2(pp)+"</td></tr><tr style=font-weight:700><td>NET</td><td>"+f2(net)+"</td></tr></table><p>Pour solde de tout compte.</p><div style=text-align:center;margin-top:20px><button onclick=window.print()>Imprimer</button></div></body></html>";openForPDF(html,'Solde_'+name);}

// ═══ CERTIFICAT C4 ═══
export function generateC4PDF(emp,co){const coName=co?.name||"Aureus IA SPRL";const coVAT=co?.vat||"BE 1028.230.781";const name=(emp.first||emp.fn||"")+" "+(emp.last||emp.ln||"");const niss=emp.niss||"";const start=emp.startDate||emp.start||"";const end=emp.endDate||emp.contractEnd||new Date().toISOString().slice(0,10);const brut=+(emp.monthlySalary||emp.gross||0);const f2=v=>new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);const html="<!DOCTYPE html><html><head><meta charset=utf-8><title>C4 - "+name+"</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;padding:30px;max-width:800px;margin:auto}.header{text-align:center;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:15px}.title{font-size:16px;font-weight:700}.section{margin:10px 0;padding:8px;border:1px solid #ccc}.section-title{font-weight:700;font-size:12px;margin-bottom:6px;text-decoration:underline}.row{display:flex;justify-content:space-between;margin:3px 0;font-size:10px}.signature{margin-top:40px;display:flex;justify-content:space-between}.sig-box{width:45%;border-top:1px solid #000;padding-top:5px;text-align:center;font-size:10px}@media print{button{display:none!important}}</style></head><body><div class=header><div class=title>CERTIFICAT DE CHÔMAGE C4</div><div>Formulaire C4</div></div><div class=section><div class=section-title>1. Employeur</div><div class=row><span>Dénomination:</span><span>"+coName+"</span></div><div class=row><span>BCE/TVA:</span><span>"+coVAT+"</span></div><div class=row><span>CP:</span><span>"+(emp.cp||co?.cp||"200")+"</span></div></div><div class=section><div class=section-title>2. Travailleur</div><div class=row><span>Nom:</span><span>"+name+"</span></div><div class=row><span>NISS:</span><span>"+niss+"</span></div><div class=row><span>Statut:</span><span>"+(emp.statut||"Employé")+"</span></div></div><div class=section><div class=section-title>3. Occupation</div><div class=row><span>Début:</span><span>"+start+"</span></div><div class=row><span>Fin:</span><span>"+end+"</span></div><div class=row><span>Régime:</span><span>"+(emp.whWeek||38)+"h/sem</span></div><div class=row><span>Brut:</span><span>"+f2(brut)+" EUR/mois</span></div></div><div class=section><div class=section-title>4. Motif</div><div class=row><span>Motif:</span><span>"+(emp.endReason||"Fin de contrat")+"</span></div><div class=row><span>Initiative:</span><span>"+(emp.endInitiative||"Employeur")+"</span></div></div><div class=signature><div class=sig-box>Signature employeur</div><div class=sig-box>Signature travailleur</div></div><div style=text-align:center;margin-top:20px><button onclick=window.print() style=background:#333;color:#fff;border:none;padding:10px_30px;border-radius:6px;cursor:pointer>Imprimer C4</button></div></body></html>";openForPDF(html,'C4_'+name);}

// ═══ SEPA XML (pain.001.001.03) ═══
export function generateSEPAXML(emps,period,co){var coName=co?.name||"Aureus IA SPRL";var coIBAN=co?.iban||"BE00000000000000";var coBIC=co?.bic||"GEBABEBB";var coVAT=(co?.vat||"BE1028230781").replace(/[^A-Z0-9]/g,"");var now=new Date();var msgId="SEPA-"+now.toISOString().replace(/[^0-9]/g,"").slice(0,14);var pmtId="PAY-"+(period?.month||now.getMonth()+1)+"-"+(period?.year||now.getFullYear());var mois=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];var periodeStr=(mois[(period?.month||1)-1]||"")+" "+(period?.year||2026);var ae=emps.filter(function(e){return(e.status==="active"||!e.status)&&e.iban});var payments=ae.map(function(e){var brut=+(e.monthlySalary||e.gross||0);var onss=Math.round(brut*TX_ONSS_W*100)/100;var pp=quickPP(brut);var net=Math.round((brut-onss-pp)*100)/100;return{name:(e.first||e.fn||"")+" "+(e.last||e.ln||""),iban:(e.iban||"").replace(/\s/g,""),bic:e.bic||"GEBABEBB",amount:net,ref:"SAL/"+pmtId+"/"+(e.id||"").slice(0,8)}}).filter(function(p){return p.amount>0});var totalAmount=payments.reduce(function(a,p){return a+p.amount},0);var f2=function(v){return(Math.round(v*100)/100).toFixed(2)};var txns=payments.map(function(p){return"<CdtTrfTxInf><PmtId><EndToEndId>"+p.ref+"</EndToEndId></PmtId><Amt><InstdAmt Ccy=\"EUR\">"+f2(p.amount)+"</InstdAmt></Amt><CdtrAgt><FinInstnId><BIC>"+p.bic+"</BIC></FinInstnId></CdtrAgt><Cdtr><Nm>"+p.name+"</Nm></Cdtr><CdtrAcct><Id><IBAN>"+p.iban+"</IBAN></Id></CdtrAcct><RmtInf><Ustrd>Salaire "+periodeStr+"</Ustrd></RmtInf></CdtTrfTxInf>"}).join("");var xml="<?xml version=\"1.0\" encoding=\"UTF-8\"?><Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:pain.001.001.03\"><CstmrCdtTrfInitn><GrpHdr><MsgId>"+msgId+"</MsgId><CreDtTm>"+now.toISOString()+"</CreDtTm><NbOfTxs>"+payments.length+"</NbOfTxs><CtrlSum>"+f2(totalAmount)+"</CtrlSum><InitgPty><Nm>"+coName+"</Nm></InitgPty></GrpHdr><PmtInf><PmtInfId>"+pmtId+"</PmtInfId><PmtMtd>TRF</PmtMtd><NbOfTxs>"+payments.length+"</NbOfTxs><CtrlSum>"+f2(totalAmount)+"</CtrlSum><PmtTpInf><SvcLvl><Cd>SEPA</Cd></SvcLvl></PmtTpInf><ReqdExctnDt>"+now.toISOString().slice(0,10)+"</ReqdExctnDt><Dbtr><Nm>"+coName+"</Nm></Dbtr><DbtrAcct><Id><IBAN>"+coIBAN+"</IBAN></Id></DbtrAcct><DbtrAgt><FinInstnId><BIC>"+coBIC+"</BIC></FinInstnId></DbtrAgt><ChrgBr>SLEV</ChrgBr>"+txns+"</PmtInf></CstmrCdtTrfInitn></Document>";var blob=new Blob([xml],{type:"application/octet-stream"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="SEPA_Salaires_"+periodeStr.replace(/ /g,"_")+".xml";document.body.appendChild(a);a.click();setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},3000);return xml;}

// ═══ FICHE DE PAIE ═══
export async function generatePayslipPDF(emp,r,period,co){
  try{
  const _payslipHTML=[];const empName=(emp.first||emp.fn||'')+" "+(emp.last||emp.ln||'');const w={document:{write:function(h){_payslipHTML.push(h)},close:function(){try{const html=_payslipHTML.join('');if(!html||html.length<100){alert('Erreur: HTML vide');return;}
  openForPDF(html, 'Fiche_paie_'+empName);
  }catch(err){alert('Erreur download: '+err.message);}}}};
  const coName=co?.name||'Entreprise';
  const coVAT=co?.vat||'BE XXXX.XXX.XXX';
  const coAddr=co?.address||'';
  const coCP=co?.cp||'CP 200';
  const empNISS=emp.niss||emp.NISS||'XX.XX.XX-XXX.XX';
  const empIBAN=emp.iban||emp.IBAN||'';
  const mois=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const periodeStr=period?(mois[(period.month||1)-1]||"")+" "+(period.year||2026):"Février 2026";
  const brut=r.gross||r.brut||0;
  const onssP=r.onssP||r.onss||Math.round(brut*TX_ONSS_W*100)/100;
  const imposable=r.imposable||Math.round((brut-onssP)*100)/100;
  const pp=r.pp||r.withholding||Math.round(imposable*PP_EST*100)/100;
  const csss=r.csss||r.specSS||0;
  const net=r.net||Math.round((brut-onssP-pp-csss)*100)/100;
  const onssE=r.onssE||r.empSS||Math.round(brut*TX_ONSS_E*100)/100;
  const coutTotal=r.coutTotal||Math.round((brut+onssE)*100)/100;
  const mealV=r.mealV||(emp.mealVoucher?emp.mealVoucher*22:0);
  const f2=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Fiche de paie - ${empName} - ${periodeStr}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#1a1a1a;padding:30px;max-width:800px;margin:auto;background:#fff}
.header{display:flex;justify-content:space-between;border-bottom:3px solid #c6a34e;padding-bottom:15px;margin-bottom:15px}
.header-left{flex:1}.header-right{text-align:right;flex:1}
.company{font-size:16px;font-weight:700;color:#1a1a1a}
.subtitle{font-size:10px;color:#666;margin-top:2px}
.period-badge{display:inline-block;background:#c6a34e;color:#fff;padding:4px 12px;border-radius:4px;font-weight:700;font-size:12px}
.section{margin:12px 0}.section-title{font-size:11px;font-weight:700;color:#c6a34e;text-transform:uppercase;letter-spacing:1px;padding:4px 0;border-bottom:1px solid #e5e5e5;margin-bottom:6px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px}
.info-row{display:flex;justify-content:space-between;font-size:10px}.info-label{color:#666}.info-value{font-weight:600}
table{width:100%;border-collapse:collapse;margin:6px 0}
th{text-align:left;font-size:9px;text-transform:uppercase;color:#666;padding:4px 6px;border-bottom:2px solid #e5e5e5;letter-spacing:0.5px}
th.right{text-align:right}td{padding:4px 6px;border-bottom:1px solid #f0f0f0;font-size:10px}
td.right{text-align:right;font-family:'Courier New',monospace}td.bold{font-weight:700}
.total-row{background:#f8f6f0;font-weight:700}.total-row td{border-top:2px solid #c6a34e;border-bottom:2px solid #c6a34e;padding:6px}
.net-row{background:#c6a34e;color:#fff;font-weight:800;font-size:12px}.net-row td{padding:8px 6px;border:none}
.footer{margin-top:20px;padding-top:10px;border-top:1px solid #e5e5e5;display:flex;justify-content:space-between;font-size:9px;color:#999}
.employer-box{margin-top:12px;padding:8px;background:#fafafa;border:1px solid #e5e5e5;border-radius:4px}
.employer-box .title{font-size:9px;color:#c6a34e;font-weight:700;text-transform:uppercase;margin-bottom:4px}
@media print{body{padding:20px}button{display:none!important}}
</style></head><body>
<div class="header"><div class="header-left"><div class="company">${coName}</div><div class="subtitle">${coVAT} | ${coCP}</div><div class="subtitle">${coAddr}</div></div><div class="header-right"><div class="period-badge">${periodeStr}</div><div style="margin-top:6px;font-size:10px;color:#666">FICHE DE PAIE</div><div style="font-size:9px;color:#999">Document confidentiel</div></div></div>
<div class="section"><div class="section-title">Identification travailleur</div><div class="info-grid"><div class="info-row"><span class="info-label">Nom:</span><span class="info-value">${empName}</span></div><div class="info-row"><span class="info-label">NISS:</span><span class="info-value">${empNISS}</span></div><div class="info-row"><span class="info-label">Fonction:</span><span class="info-value">${emp.function||emp.job||'Employé'}</span></div><div class="info-row"><span class="info-label">Statut:</span><span class="info-value">${emp.statut||'Employé'}</span></div><div class="info-row"><span class="info-label">Entrée:</span><span class="info-value">${emp.startDate||emp.start||'-'}</span></div><div class="info-row"><span class="info-label">Régime:</span><span class="info-value">${emp.regime||emp.whWeek||38}h/sem</span></div></div></div>
<div class="section"><div class="section-title">Rémunération brute</div><table><tr><th>Description</th><th class="right">Jours/Heures</th><th class="right">Taux</th><th class="right">Montant</th></tr><tr><td>Salaire mensuel de base</td><td class="right">${r.workDays||22} j</td><td class="right">${f2(brut/22)}/j</td><td class="right bold">${f2(r.base||brut)}</td></tr>${(r.overtime||0)>0?`<tr><td>Heures supplémentaires (150%)</td><td class="right">${r.overtimeH||'-'}h</td><td class="right">150%</td><td class="right">${f2(r.overtime)}</td></tr>`:''}<tr class="total-row"><td colspan="3">TOTAL BRUT</td><td class="right">${f2(brut)}</td></tr></table></div>
<div class="section"><div class="section-title">Retenues</div><table><tr><th>Description</th><th class="right">Base</th><th class="right">Taux</th><th class="right">Montant</th></tr><tr><td>Cotisation ONSS personnelle</td><td class="right">${f2(brut)}</td><td class="right">13,07%</td><td class="right" style="color:#c0392b">-${f2(onssP)}</td></tr><tr><td>Précompte professionnel</td><td class="right">${f2(imposable)}</td><td class="right">${imposable>0?(pp/imposable*100).toFixed(1)+'%':'-'}</td><td class="right" style="color:#c0392b">-${f2(pp)}</td></tr><tr><td>Cotisation spéciale sécurité sociale</td><td class="right">-</td><td class="right">Barème</td><td class="right" style="color:#c0392b">-${f2(csss)}</td></tr><tr class="total-row"><td colspan="3">TOTAL RETENUES</td><td class="right" style="color:#c0392b">-${f2(onssP+pp+csss)}</td></tr></table></div>
<div class="section"><table><tr class="net-row"><td colspan="3" style="font-size:13px">NET À PAYER</td><td class="right" style="font-size:15px">${f2(net)} EUR</td></tr></table></div>
${empIBAN?`<div style="font-size:10px;color:#666;margin-top:4px">Virement sur: <b>${empIBAN}</b></div>`:''}
<div class="employer-box"><div class="title">Charges patronales (pour information)</div><div class="info-grid"><div class="info-row"><span class="info-label">ONSS patronal (25,07%):</span><span class="info-value">${f2(onssE)}</span></div><div class="info-row"><span class="info-label">Coût total employeur:</span><span class="info-value" style="color:#c6a34e;font-weight:800">${f2(coutTotal)}</span></div></div></div>
${mealV>0?`<div style="margin-top:6px;font-size:10px;color:#666">Chèques-repas: ${emp.mealVoucher||0} x 22j = ${f2(mealV)} EUR (part patronale ${f2((emp.mealVoucher||0)*22*0.83)})</div>`:''}
<div class="footer"><span>Généré par Aureus Social Pro | ${coName} | ${coVAT}</span><span>Date édition: ${new Date().toLocaleDateString('fr-BE')}</span></div>
<div style="text-align:center;margin-top:15px"><button onclick="window.print()" style="background:#c6a34e;color:#fff;border:none;padding:10px 30px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600">Imprimer / Sauvegarder PDF</button></div>
</body></html>`);
  w.document.close();
  }catch(err){alert('Erreur génération fiche: '+err.message);console.error(err);}
}

// ═══ ALERTES LÉGALES ═══
export function getAlertes(emps,co){
  const now=new Date();const alerts=[];
  emps.forEach(e=>{
    const name=(e.first||e.fn||'')+" "+(e.last||e.ln||'');
    if(e.contractEnd||e.endDate){const end=new Date(e.contractEnd||e.endDate);const diff=Math.ceil((end-now)/(1000*60*60*24));if(diff>0&&diff<=30)alerts.push({type:"cdd",level:"warning",icon:"📋",msg:"CDD "+name+" expire dans "+diff+" jours ("+end.toLocaleDateString("fr-BE")+")",days:diff});if(diff<=0&&diff>-7)alerts.push({type:"cdd",level:"danger",icon:"🚨",msg:"CDD "+name+" EXPIRÉ! ("+end.toLocaleDateString("fr-BE")+")",days:diff});}
    if(e.lastMedical||e.medicalDate){const med=new Date(e.lastMedical||e.medicalDate);const diff=Math.ceil((now-med)/(1000*60*60*24));if(diff>335)alerts.push({type:"medical",level:diff>365?"danger":"warning",icon:"🏥",msg:"Visite médicale "+name+" : "+(diff>365?"DÉPASSÉE":"dans "+(365-diff)+"j")+" (dernière: "+med.toLocaleDateString("fr-BE")+")",days:diff});}
    if(e.startDate||e.start){const start=new Date(e.startDate||e.start);const diff=Math.ceil((now-start)/(1000*60*60*24));if(diff>=0&&diff<=7)alerts.push({type:"onboard",level:"info",icon:"👋",msg:"Nouvel employé "+name+" - onboarding en cours (J+"+diff+")",days:diff});}
    if(!e.niss&&(e.status==="active"||!e.status))alerts.push({type:"niss",level:"danger",icon:"⚠️",msg:"NISS manquant pour "+name,days:0});
    if(!e.iban&&(e.status==="active"||!e.status))alerts.push({type:"iban",level:"warning",icon:"🏦",msg:"IBAN manquant pour "+name,days:0});
    if(e.status==="active"||!e.status){const brut=+(e.monthlySalary||e.gross||0);if(brut>0&&brut<2029.88)alerts.push({type:"rmmmg",level:"warning",icon:"💰",msg:name+" sous le RMMMG ("+brut.toFixed(2)+" < 2.029,88 EUR)",days:0});}
  });
  const d=now.getDate();const m=now.getMonth()+1;
  if(d<=5)alerts.push({type:"deadline",level:"info",icon:"📅",msg:"Avant le 5: encodage prestations du mois",days:5-d});
  if(m===1||m===4||m===7||m===10){if(d<=15)alerts.push({type:"deadline",level:"warning",icon:"📤",msg:"Trimestre: DmfA à envoyer avant le "+((m===1||m===7)?31:30)+"/"+String(m).padStart(2,"0"),days:15-d});}
  return alerts.sort((a,b)=>a.level==="danger"?-1:b.level==="danger"?1:a.level==="warning"?-1:1);
}
