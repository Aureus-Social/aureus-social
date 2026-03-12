// ═══ AUREUS SOCIAL PRO — Module: Générateurs XML (DmfA, Dimona, SEPA, Belcotax) ═══

let fmt;
export function initXML(deps) { fmt = deps.fmt; }

function genDimonaXML(d) {
  const niss=(d.niss||'').replace(/[\.\-\s]/g,"");
  const onss=(d.onss||'').replace(/[\.\-\s]/g,"");
  const vat=(d.vat||'').replace(/[^0-9]/g,"");
  const dimRef='DIM'+crypto.randomUUID().replace(/-/g,'').substring(0,12).toUpperCase();
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Dimona Declaration — ONSS / socialsecurity.be -->
<!-- Generee par: Aureus Social Pro — Aureus IA SPRL -->
<!-- Reference: ${dimRef} -->
<Dimona xmlns="http://www.smals-mvm.be/xml/ns/systemFlux">
  <DimonaDeclaration>
    <EmployerId>
      <NLOSSRegistrationNbr>${onss}</NLOSSRegistrationNbr>
      <CompanyID>${vat}</CompanyID>
    </EmployerId>
    <Feature>
      <CreationDate>${new Date().toISOString().split('T')[0]}</CreationDate>
      <Action>${d.action}</Action>${d.action==='UPDATE'&&d.dimonaP?`
      <DimPeriodId>${d.dimonaP}</DimPeriodId>`:''}
      <Worker>
        <INSS>${niss}</INSS>
        <WorkerName>${d.last||''}</WorkerName>
        <WorkerFirstName>${d.first||''}</WorkerFirstName>
        <BirthDate>${d.birth||''}</BirthDate>
      </Worker>
      <Period>
        <StartingDate>${d.start}</StartingDate>${d.end?`
        <EndingDate>${d.end}</EndingDate>`:''}
      </Period>
      <WorkerType>${d.wtype}</WorkerType>
      <JointCommission>${d.cp||'200'}</JointCommission>${d.hours?`
      <PlannedDaysOrHours>
        <PlannedHoursNbr>${d.hours}</PlannedHoursNbr>
      </PlannedDaysOrHours>`:''}${d.action==='OUT'&&d.reason?`
      <EndingReason>${d.reason}</EndingReason>`:''}${d.wtype==='STU'?`
      <StudentData>
        <MaxHoursPerYear>600</MaxHoursPerYear>
        <SolidarityContribution>YES</SolidarityContribution>
      </StudentData>`:''}${d.wtype==='FLX'?`
      <FlexiJobData>
        <FlexiWage>YES</FlexiWage>
        <SpecialContribution28>YES</SpecialContribution28>
      </FlexiJobData>`:''}${d.wtype==='EXT'?`
      <ExtraData>
        <MaxDaysPerYear>50</MaxDaysPerYear>
        <FlatRateContribution>YES</FlatRateContribution>
      </ExtraData>`:''}
    </Feature>
    <SenderSoftware>AureusSocialPro</SenderSoftware>
    <SenderSoftwareVersion>2026.4</SenderSoftwareVersion>
  </DimonaDeclaration>
</Dimona>`;
}


function genDMFAXML(co, emps, q, y) {
  // DMFA conforme schema XSD ONSS — socialsecurity.be/TechLib
  // Structure: FormCreation > EmployerDeclaration > WorkerRecord > OccupationRecord > ServiceRecord > RemunRecord + ContributionRecord
  const qStart=new Date(y,(q-1)*3,1);
  const qEnd=new Date(y,q*3,0);
  const fmtDt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const ref='DMFAP'+crypto.randomUUID().replace(/-/g,'').substring(0,9).toUpperCase();
  const catEmpl=(co.cp==='330'||co.cp==='331'||co.cp==='332')?'010':'000';
  const nrONSS=(co.onss||'').replace(/[\.\-\s]/g,"")||'0000000000';
  const nrEnt=(co.vat||'').replace(/[^0-9]/g,"")||'0000000000';

  const wrs=emps.map((e,idx)=>{
    const p=calc(e,{days:65},co);
    const niss=(e.niss||'').replace(/[\.\-\s]/g,"");
    const isOuv=(e.statut==='ouvrier');
    const codeTrav=e.dmfaCode||'495';
    const baseONSS=isOuv?p.gross*3*TX_OUV108:p.gross*3;
    const wh=e.whWeek||38;
    const daysQ=Math.round((p.mvDays||22)*3);
    const hoursQ=Math.round(daysQ*(wh/5)*100)/100;
    const startD=e.startD||fmtDt(qStart);
    return `    <WorkerRecord>
      <WorkerIdentification>
        <INSS>${niss}</INSS>
        <WorkerName>${e.last||''}</WorkerName>
        <WorkerFirstName>${e.first||''}</WorkerFirstName>
      </WorkerIdentification>
      <WorkerContributionCode>${codeTrav}</WorkerContributionCode>
      <WorkerCategory>${catEmpl}</WorkerCategory>
      <OccupationRecord>
        <OccupationSequenceNbr>${idx+1}</OccupationSequenceNbr>
        <CommissionNbr>${e.cp||'200'}</CommissionNbr>
        <WorkerStatus>${isOuv?'1':'2'}</WorkerStatus>
        <MeanWorkingHoursPerWorker>${wh.toFixed(2)}</MeanWorkingHoursPerWorker>
        <MeanWorkingHoursReferPerson>38.00</MeanWorkingHoursReferPerson>
        <WorkSchedule>${e.regime==='full'?'F':'P'}</WorkSchedule>
        <OccupationStartingDate>${startD}</OccupationStartingDate>
        <OccupationEndingDate>${fmtDt(qEnd)}</OccupationEndingDate>
        <EstablishmentUnitNbr>${nrEnt}</EstablishmentUnitNbr>
        <ServiceRecord>
          <ServiceCode>001</ServiceCode>
          <ServiceNbrDays>${daysQ}</ServiceNbrDays>
          <ServiceNbrHours>${hoursQ.toFixed(2)}</ServiceNbrHours>
        </ServiceRecord>
        <RemunRecord>
          <RemunCode>001</RemunCode>
          <RemunAmount>${(p.gross*3).toFixed(2)}</RemunAmount>
          <RemunFrequency>1</RemunFrequency>
        </RemunRecord>${isOuv?`
        <RemunRecord>
          <RemunCode>010</RemunCode>
          <RemunAmount>${(p.gross*3*0.08).toFixed(2)}</RemunAmount>
          <RemunFrequency>1</RemunFrequency>
        </RemunRecord>`:''}
      </OccupationRecord>
      <ContributionWorkerRecord>
        <ContributionType>001</ContributionType>
        <ContributionBase>${baseONSS.toFixed(2)}</ContributionBase>
        <ContributionPercentage>13.07</ContributionPercentage>
        <ContributionAmount>${(baseONSS*LEGAL.ONSS_W).toFixed(2)}</ContributionAmount>
      </ContributionWorkerRecord>${p.empBonus>0?`
      <DeductionRecord>
        <DeductionType>001</DeductionType>
        <DeductionAmount>${(p.empBonus*3).toFixed(2)}</DeductionAmount>
      </DeductionRecord>`:''}
    </WorkerRecord>`;
  }).join('\n');

  const totW=emps.reduce((s,e)=>{const p=calc(e,{days:65},co);const isO=e.statut==='ouvrier';const b=isO?p.gross*3*TX_OUV108:p.gross*3;return s+b*LEGAL.ONSS_W;},0);
  const totE=emps.reduce((s,e)=>{const p=calc(e,{days:65},co);return s+p.onssE*3;},0);
  const totFFE=emps.reduce((s,e)=>{const p=calc(e,{days:65},co);return s+(p.onss_ffe||0)*3;},0);
  const totChT=emps.reduce((s,e)=>{const p=calc(e,{days:65},co);return s+(p.onss_chomTemp||0)*3;},0);
  const totAm=emps.reduce((s,e)=>{const p=calc(e,{days:65},co);return s+(p.onss_amiante||0)*3;},0);
  const totBase=emps.reduce((s,e)=>{const p=calc(e,{days:65},co);const isO=e.statut==='ouvrier';return s+(isO?p.gross*3*TX_OUV108:p.gross*3);},0);

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- DmfAOriginal — Declaration Multifonctionnelle / Securite Sociale Belge -->
<!-- Schema conforme ONSS — socialsecurity.be/TechLib -->
<!-- Reference: ${ref} | Trimestre: ${q}/${y} -->
<!-- Genere par: Aureus Social Pro — Aureus IA SPRL (${AUREUS_INFO.vat}) -->
<DmfAOriginal xmlns="http://www.smals-mvm.be/xml/ns/systemFlux"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <FormCreation>
    <FormType>DMFA</FormType>
    <FormCreationDate>${fmtDt(new Date())}</FormCreationDate>
    <Reference>${ref}</Reference>
    <FormSubType>ORIGINAL</FormSubType>
    <SenderSoftware>AureusSocialPro</SenderSoftware>
    <SenderSoftwareVersion>2026.4</SenderSoftwareVersion>
    <SenderCompanyID>${nrEnt}</SenderCompanyID>
  </FormCreation>
  <EmployerDeclaration>
    <NLOSSRegistrationNbr>${nrONSS}</NLOSSRegistrationNbr>
    <CompanyID>${nrEnt}</CompanyID>
    <EmployerDenomination>${co.name||''}</EmployerDenomination>
    <LanguageCode>1</LanguageCode>
    <Quarter>${q}</Quarter>
    <Year>${y}</Year>
    <EmployerCategory>${catEmpl}</EmployerCategory>
    <NbrOfWorkers>${emps.length}</NbrOfWorkers>
${wrs}
    <GlobalContribution>
      <ContributionRecord><ContributionType>001</ContributionType><ContributionBase>${totBase.toFixed(2)}</ContributionBase><ContributionAmount>${totE.toFixed(2)}</ContributionAmount></ContributionRecord>
      <ContributionRecord><ContributionType>810</ContributionType><ContributionBase>${totBase.toFixed(2)}</ContributionBase><ContributionAmount>${totFFE.toFixed(2)}</ContributionAmount></ContributionRecord>
      <ContributionRecord><ContributionType>855</ContributionType><ContributionBase>${totBase.toFixed(2)}</ContributionBase><ContributionAmount>${totChT.toFixed(2)}</ContributionAmount></ContributionRecord>
      ${q<=3?`<ContributionRecord><ContributionType>862</ContributionType><ContributionBase>${totBase.toFixed(2)}</ContributionBase><ContributionAmount>${totAm.toFixed(2)}</ContributionAmount></ContributionRecord>`:'<!-- Fonds amiante: non du en T4 -->'}
    </GlobalContribution>
    <DeclarationTotals>
      <TotalWorkerContribution>${totW.toFixed(2)}</TotalWorkerContribution>
      <TotalEmployerContribution>${(totE+totFFE+totChT+totAm).toFixed(2)}</TotalEmployerContribution>
      <TotalContribution>${(totW+totE+totFFE+totChT+totAm).toFixed(2)}</TotalContribution>
    </DeclarationTotals>
  </EmployerDeclaration>
</DmfAOriginal>`;
}

// Genere un accuse de reception (ACRF) simule conforme ONSS
function genDMFATicket(ref,co){
  const ticket='DMFAP'+crypto.randomUUID().replace(/-/g,'').substring(0,9).toUpperCase();
  const fmtDt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  return {ticket,xml:`<?xml version="1.0" encoding="UTF-8"?>
<!-- Accuse de reception (ACRF) — ONSS -->
<AcknowledgmentOfReceipt>
  <Ticket>${ticket}</Ticket>
  <FormType>DMFA</FormType>
  <Reference>${ref}</Reference>
  <ReceptionDate>${fmtDt(new Date())}</ReceptionDate>
  <ResultCode>1</ResultCode>
  <ResultDescription>Fichier accepte pour traitement</ResultDescription>
  <CompanyID>${(co.vat||'').replace(/[^0-9]/g,"")}</CompanyID>
  <Software>AureusSocialPro v2226.1</Software>
</AcknowledgmentOfReceipt>`};
}

// Genere une notification (DMNO) simulee conforme ONSS
function genDMFANotification(ticket,co,q,y,nW,totC,anomalies){
  const fmtDt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Notification (DMNO) — ONSS -->
<DmfANotification>
  <FormType>DMFA</FormType>
  <Ticket>${ticket}</Ticket>
  <Quarter>${q}</Quarter><Year>${y}</Year>
  <CompanyID>${(co.vat||'').replace(/[^0-9]/g,"")}</CompanyID>
  <ResultCode>${anomalies.length===0?'1':'1'}</ResultCode>
  <ResultDescription>Declaration acceptee${anomalies.length>0?' avec anomalies':''}</ResultDescription>
  <HandlingDate>${fmtDt(new Date())}</HandlingDate>
  <NbrOfWorkers>${nW}</NbrOfWorkers>
  <TotalContribution>${totC}</TotalContribution>
  ${anomalies.length>0?'<AnomalyReport>'+anomalies.map(a=>'<Anomaly><Zone>'+a.zone+'</Zone><Severity>'+a.sev+'</Severity><Desc>'+a.desc+'</Desc></Anomaly>').join('')+'</AnomalyReport>':'<AnomalyReport/>'}
</DmfANotification>`;
}

function genBelcotax(co, emp, yr, ad) {
  // Belcotax XML — Format BelcotaxOnWeb SPF Finances
  // Ref: https://financien.belgium.be/fr/e-services/belcotaxonweb
  // 281.10 = salariés | 281.20 = dirigeants | 281.50 = commissions
  const statut = emp.statut === 'dirigeant' ? '20' : '10';
  return `<?xml version="1.0" encoding="UTF-8"?>
<Belcotax xmlns="urn:belcotax:${yr}">
  <Verzending>
    <Aangifte>
      <Taal>FR</Taal>
      <Aangiftetype>281.${statut}</Aangiftetype>
      <AangifteJaar>${yr}</AangifteJaar>
      <Schuldenaar>
        <KBO>${(co.bce||co.vat||'').replace(/[^0-9]/g,"")}</KBO>
        <BTWNr>${(co.vat||'').replace(/[^0-9]/g,"")}</BTWNr>
        <ONSS>${(co.onss||'').replace(/[^0-9]/g,"")}</ONSS>
        <NACECode>${co.nace||''}</NACECode>
        <Naam>${co.name}</Naam>
        <Adres>${co.addr}</Adres>
      </Schuldenaar>
      <Opgave>
        <Verkrijger>
          <INSZ>${(emp.niss||'').replace(/[\.\-\s]/g,"")}</INSZ>
          <Naam>${emp.last}</Naam>
          <Voornaam>${emp.first}</Voornaam>
          <Adres>${emp.addr||''} ${emp.zip||''} ${emp.city||''}</Adres>
          <Geboortedatum>${emp.birth||''}</Geboortedatum>
        </Verkrijger>
        <Bezoldiging>
          <Lonen>${(ad.gross||0).toFixed(2)}</Lonen>
          <RIZIV>${(ad.onss||0).toFixed(2)}</RIZIV>
          <WerkBonus>${(ad.empB||0).toFixed(2)}</WerkBonus>
          <BedrijfsVH>${(ad.tax||0).toFixed(2)}</BedrijfsVH>
          <BijzBijdrSZ>${(ad.css||0).toFixed(2)}</BijzBijdrSZ>
          <Maaltijdcheques aantal="${ad.mvC||0}">${(ad.mvE||0).toFixed(2)}</Maaltijdcheques>
          <Vervoer>${(ad.tr||0).toFixed(2)}</Vervoer>
          <VoertuigVAA>${(ad.atnCar||0).toFixed(2)}</VoertuigVAA>
          <AndereVAA>${(ad.atnAutres||0).toFixed(2)}</AndereVAA>
          <AanvullendPensioen>${(ad.pensionCompl||0).toFixed(2)}</AanvullendPensioen>
          <EigenKosten>${(ad.fraisPropres||0).toFixed(2)}</EigenKosten>
          <EcoCheques>${(ad.ecoCheques||0).toFixed(2)}</EcoCheques>
        </Bezoldiging>
        <Periode><Van>01-01-${yr}</Van><Tot>31-12-${yr}</Tot></Periode>
        <Tewerkstelling>
          <CP>${emp.cp||'200'}</CP>
          <Functie>${emp.fn||''}</Functie>
          <Regime>${emp.regime==='full'?'VT':'DT'}</Regime>
          <Uren>${emp.whWeek||38}</Uren>
        </Tewerkstelling>
      </Opgave>
    </Aangifte>
  </Verzending>
</Belcotax>`;
}

// ─── INITIAL STATE ───────────────────────────────────────────
const AUREUS_INFO={name:'Aureus IA SPRL',vat:'BE 1028.230.781',addr:'Saint-Gilles, Bruxelles',email:"info@aureus-ia.com",version:'v38',sprint:'Sprint 17 — Automatisation 100%'};
const CAR_MODELS={
'Aiways':['U5',"U6"],
'Alfa Romeo':['Giulia',"Stelvio","Tonale","Junior","Giulietta","MiTo"],
'Alpine':['A110',"A290"],
'Aston Martin':['DB12',"DBX","Vantage","DBS"],
'Audi':['A1',"A3","A4","A5","A6","A7","A8","Q2","Q3","Q4 e-tron","Q5","Q7","Q8","e-tron","e-tron GT","TT","RS3","RS4","RS5","RS6","S3","S4","S5"],
'Bentley':['Continental GT',"Flying Spur","Bentayga"],
'BMW':['Série 1',"Série 2","Série 3","Série 4","Série 5","Série 7","Série 8","X1","X2","X3","X4","X5","X6","X7","XM","iX","iX1","iX3","i4","i5","i7","Z4","M2","M3","M4"],
'BYD':['Atto 3',"Dolphin","Seal","Tang","Han","Seal U"],
'Cadillac':['XT4',"XT5","Escalade","Lyriq"],
'Chevrolet':['Camaro',"Corvette","Tahoe"],
'Chrysler':['300',"Pacifica"],
'Citroën':['C3',"C3 Aircross","C4","C4 X","C5 Aircross","C5 X","Berlingo","ë-C3","ë-C4","ë-Berlingo"],
'Cupra':['Born',"Formentor","Leon","Ateca","Tavascan","Terramar"],
'Dacia':['Sandero',"Duster","Jogger","Spring","Logan"],
'Dodge':['Challenger',"Charger","Durango","RAM 1500"],
'DS':['DS 3',"DS 4","DS 7","DS 9"],
'Ferrari':['296 GTB',"Roma","Purosangue","SF90","F8","812"],
'Fiat':['500',"500X","500e","Tipo","Panda","Doblo","600e"],
'Ford':['Fiesta',"Focus","Puma","Kuga","Mustang","Mustang Mach-E","Explorer","Ranger","Transit","Transit Custom","Tourneo"],
'Genesis':['G70',"G80","GV60","GV70","GV80"],
'Honda':['Civic',"HR-V","CR-V","ZR-V","Jazz","e:Ny1","Honda e"],
'Hyundai':['i10',"i20","i30","Kona","Tucson","Santa Fe","Ioniq 5","Ioniq 6","Bayon","Staria"],
'Infiniti':['Q30',"Q50","QX50"],
'Isuzu':['D-Max'],
'Jaguar':['F-Pace',"E-Pace","I-Pace","XE","XF","F-Type"],
'Jeep':['Renegade',"Compass","Avenger","Wrangler","Grand Cherokee"],
'Kia':['Picanto',"Rio","Ceed","Sportage","Sorento","Niro","EV6","EV9","Stonic","XCeed"],
'Lamborghini':['Huracán',"Urus","Revuelto"],
'Land Rover':['Defender',"Discovery","Discovery Sport","Range Rover","Range Rover Sport","Range Rover Velar","Range Rover Evoque"],
'Lexus':['UX',"NX","RX","ES","IS","LC","RZ"],
'Lotus':['Emira',"Eletre","Emeya"],
'Lynk & Co':['01',"02"],
'Maserati':['Ghibli',"Levante","Quattroporte","MC20","Grecale","GranTurismo"],
'Mazda':['Mazda2',"Mazda3","CX-3","CX-30","CX-5","CX-60","MX-5","MX-30"],
'McLaren':['720S',"Artura","GT"],
'Mercedes':['Classe A',"Classe B","Classe C","Classe E","Classe S","CLA","CLE","GLA","GLB","GLC","GLE","GLS","EQA","EQB","EQC","EQE","EQS","AMG GT","Classe G","Classe V","Vito","Sprinter"],
'MG':['ZS',"MG4","MG5","Marvel R","HS","Cyberster"],
'Mini':['Cooper',"Countryman","Clubman","Aceman"],
'Mitsubishi':['ASX',"Eclipse Cross","Outlander","Space Star","L200"],
'NIO':['ET5',"ET7","EL6","EL7","EL8"],
'Nissan':['Micra',"Juke","Qashqai","X-Trail","Leaf","Ariya","Townstar","Navara"],
'Opel':['Corsa',"Astra","Mokka","Crossland","Grandland","Combo","Vivaro","Movano"],
'Peugeot':['208',"308","408","508","2008","3008","5008","e-208","e-308","e-2008","e-3008","Rifter","Partner","Expert"],
'Polestar':['Polestar 2',"Polestar 3","Polestar 4"],
'Porsche':['911',"718 Cayman","718 Boxster","Cayenne","Macan","Panamera","Taycan"],
'Renault':['Clio',"Captur","Mégane E-Tech","Arkana","Austral","Espace","Scénic","Kangoo","Trafic","Master","Zoe","Twingo"],
'Rolls-Royce':['Ghost',"Phantom","Cullinan","Spectre"],
'Seat':['Ibiza',"Leon","Arona","Ateca","Tarraco"],
'Škoda':['Fabia',"Scala","Octavia","Superb","Kamiq","Karoq","Kodiaq","Enyaq","Elroq"],
'Smart':['#1',"#3","Fortwo","Forfour"],
'SsangYong':['Tivoli',"Korando","Rexton","Torres"],
'Subaru':['Impreza',"XV","Outback","Forester","Solterra","BRZ"],
'Suzuki':['Swift',"Vitara","S-Cross","Jimny","Ignis","Across","Swace"],
'Tesla':['Model 3',"Model Y","Model S","Model X","Cybertruck"],
'Toyota':['Yaris',"Yaris Cross","Corolla","Camry","C-HR","RAV4","Highlander","Land Cruiser","bZ4X","Supra","GR86","Proace","Hilux","Aygo X"],
'Volkswagen':['Polo',"Golf","ID.3","ID.4","ID.5","ID.7","ID. Buzz","T-Roc","T-Cross","Tiguan","Touareg","Arteon","Passat","Caddy","Transporter","Multivan"],
'Volvo':['XC40',"XC60","XC90","C40","S60","S90","V60","V90","EX30","EX90","EM90"],
'XPeng':['G6',"G9","P7"],
};

// ═══ SEPA pain.001.003 — ISO 20022 Credit Transfer ═══
// Ref: ISO 20022 pain.001.001.03 — Virements SEPA zone EUR
// Conforme: Reglement UE 260/2012 (Single Euro Payments Area)
function genSEPAXML(co, emps, period) {
  const msgId = 'AUREUS-' + crypto.randomUUID().replace(/-/g,'').substring(0,12).toUpperCase();
  const pmtInfId = 'SAL-' + (period?.month || new Date().getMonth() + 1).toString().padStart(2, '0') + '-' + (period?.year || new Date().getFullYear());
  const creationDate = new Date().toISOString().replace(/\.\d{3}Z$/, '');
  const reqDate = period?.execDate || new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0];

  // Calculer les montants nets par employe
  const payments = emps.filter(e => {
    const net = +(e.net || e.netSalary || 0);
    const iban = (e.iban || '').replace(/\s/g, '');
    return net > 0 && iban.length >= 16;
  }).map(e => {
    const net = +(e.net || e.netSalary || 0);
    const iban = (e.iban || '').replace(/\s/g, '');
    const bic = e.bic || '';
    const name = ((e.first || '') + ' ' + (e.last || '')).trim() || 'Employe';
    const ref = 'SAL/' + pmtInfId + '/' + (e.id || '').slice(0, 8);
    return { net, iban, bic, name, ref };
  });

  if (payments.length === 0) return null;

  const totalAmount = payments.reduce((s, p) => s + p.net, 0);
  const debtorIBAN = (co.bank || co.iban || '').replace(/\s/g, '');
  const debtorBIC = co.bic || '';
  const debtorName = co.name || 'Employeur';

  const txs = payments.map(p => `      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>${p.ref}</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="EUR">${p.net.toFixed(2)}</InstdAmt>
        </Amt>${p.bic ? `
        <CdtrAgt>
          <FinInstnId>
            <BIC>${p.bic}</BIC>
          </FinInstnId>
        </CdtrAgt>` : ''}
        <Cdtr>
          <Nm>${p.name}</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id>
            <IBAN>${p.iban}</IBAN>
          </Id>
        </CdtrAcct>
        <RmtInf>
          <Ustrd>Salaire ${(period?.month || new Date().getMonth() + 1).toString().padStart(2, '0')}/${period?.year || new Date().getFullYear()} - ${p.name}</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- SEPA Credit Transfer — pain.001.001.03 -->
<!-- ISO 20022 — Reglement UE 260/2012 -->
<!-- Genere par: Aureus Social Pro — Aureus IA SPRL (${AUREUS_INFO.vat}) -->
<!-- Periode: ${pmtInfId} | Nb virements: ${payments.length} | Total: ${totalAmount.toFixed(2)} EUR -->
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${creationDate}</CreDtTm>
      <NbOfTxs>${payments.length}</NbOfTxs>
      <CtrlSum>${totalAmount.toFixed(2)}</CtrlSum>
      <InitgPty>
        <Nm>${debtorName}</Nm>
        <Id>
          <OrgId>
            <Othr>
              <Id>${(co.vat || '').replace(/[^0-9]/g, '')}</Id>
              <SchmeNm><Cd>BANK</Cd></SchmeNm>
            </Othr>
          </OrgId>
        </Id>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${pmtInfId}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <BtchBookg>true</BtchBookg>
      <NbOfTxs>${payments.length}</NbOfTxs>
      <CtrlSum>${totalAmount.toFixed(2)}</CtrlSum>
      <PmtTpInf>
        <SvcLvl>
          <Cd>SEPA</Cd>
        </SvcLvl>
      </PmtTpInf>
      <ReqdExctnDt>${reqDate}</ReqdExctnDt>
      <Dbtr>
        <Nm>${debtorName}</Nm>
        <PstlAdr>
          <Ctry>BE</Ctry>
        </PstlAdr>
      </Dbtr>
      <DbtrAcct>
        <Id>
          <IBAN>${debtorIBAN}</IBAN>
        </Id>
      </DbtrAcct>${debtorBIC ? `
      <DbtrAgt>
        <FinInstnId>
          <BIC>${debtorBIC}</BIC>
        </FinInstnId>
      </DbtrAgt>` : `
      <DbtrAgt>
        <FinInstnId>
          <Othr><Id>NOTPROVIDED</Id></Othr>
        </FinInstnId>
      </DbtrAgt>`}
      <ChrgBr>SLEV</ChrgBr>
${txs}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
}

export { genDimonaXML, genDMFAXML, genDMFATicket, genDMFANotification, genBelcotax, genSEPAXML };
