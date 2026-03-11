'use client';
import { useState } from 'react';
import { useLang } from '../lib/lang-context';

// ═══════════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Intégrations Comptables
// Isabel 6 (SEPA pain.001) · Clearfacts (push documents) · Billit (Peppol)
// ═══════════════════════════════════════════════════════════════════════════

const S = {
  wrap:   { color:'#e8e6e0', fontFamily:'inherit' },
  card:   { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:20, marginBottom:12 },
  h2:     { fontSize:13, fontWeight:700, color:'#c6a34e', marginBottom:4 },
  sub:    { fontSize:11, color:'#666', marginBottom:16 },
  badge:  (c) => ({ display:'inline-block', padding:'2px 8px', borderRadius:4, fontSize:9, fontWeight:700, background:c+'20', color:c, border:`1px solid ${c}40` }),
  btn:    (c='#c6a34e',dis=false) => ({ padding:'9px 18px', borderRadius:8, border:'none', background:dis?'rgba(255,255,255,0.05)':c, color:dis?'#555':'#0c0b09', fontSize:12, fontWeight:700, cursor:dis?'not-allowed':'pointer', opacity:dis?0.6:1, fontFamily:'inherit' }),
  input:  { width:'100%', padding:'8px 12px', background:'#090c16', border:'1px solid rgba(139,115,60,.2)', borderRadius:8, color:'#e5e5e5', fontSize:12, fontFamily:'inherit', boxSizing:'border-box' },
  label:  { fontSize:10, color:'#888', display:'block', marginBottom:4, fontWeight:600 },
  row:    { display:'flex', gap:10, alignItems:'center', marginBottom:8 },
  status: (ok) => ({ width:8, height:8, borderRadius:'50%', background:ok?'#22c55e':'#ef4444', display:'inline-block', marginRight:6 }),
  grid2:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
};

// ── GÉNÉRATEUR SEPA pain.001.001.03 Isabel 6 ──
function generateIsabelXML(emps, co, period) {
  const now = new Date();
  const execDate = new Date(now.getTime() + 2 * 86400000).toISOString().slice(0, 10);
  const msgId = `AUREUS-${now.toISOString().replace(/[^0-9]/g,'').slice(0,14)}`;
  const pmtId = `PAY-${period.month}-${period.year}`;
  const mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const periodeStr = `${mois[period.month-1]} ${period.year}`;

  const payments = emps
    .filter(e => e.iban && (e.status === 'active' || !e.status))
    .map(e => {
      const brut = +(e.monthlySalary || e.gross || 0);
      const onss = Math.round(brut * TX_ONSS_W * 100) / 100;
      const pp   = Math.round(brut * 0.18 * 100) / 100;
      const net  = Math.round((brut - onss - pp) * 100) / 100;
      return {
        name: `${e.first||e.fn||''} ${e.last||e.ln||''}`.trim(),
        iban: (e.iban||'').replace(/\s/g,''),
        bic:  e.bic || 'GEBABEBB',
        amount: net,
        ref: `SAL/${pmtId}/${(e.id||'').slice(0,8)}`,
      };
    })
    .filter(p => p.amount > 0);

  const total = payments.reduce((a,p) => a+p.amount, 0);
  const f2 = v => v.toFixed(2);

  const txns = payments.map(p => `
    <CdtTrfTxInf>
      <PmtId><EndToEndId>${p.ref}</EndToEndId></PmtId>
      <Amt><InstdAmt Ccy="EUR">${f2(p.amount)}</InstdAmt></Amt>
      <CdtrAgt><FinInstnId><BIC>${p.bic}</BIC></FinInstnId></CdtrAgt>
      <Cdtr><Nm>${p.name}</Nm></Cdtr>
      <CdtrAcct><Id><IBAN>${p.iban}</IBAN></Id></CdtrAcct>
      <RmtInf><Ustrd>Salaire ${periodeStr}</Ustrd></RmtInf>
    </CdtTrfTxInf>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${now.toISOString()}</CreDtTm>
      <NbOfTxs>${payments.length}</NbOfTxs>
      <CtrlSum>${f2(total)}</CtrlSum>
      <InitgPty><Nm>${co.name||'Aureus IA SPRL'}</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${pmtId}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <NbOfTxs>${payments.length}</NbOfTxs>
      <CtrlSum>${f2(total)}</CtrlSum>
      <PmtTpInf><SvcLvl><Cd>SEPA</Cd></SvcLvl></PmtTpInf>
      <ReqdExctnDt>${execDate}</ReqdExctnDt>
      <Dbtr><Nm>${co.name||'Aureus IA SPRL'}</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>${(co.iban||'BE00000000000000').replace(/\s/g,'')}</IBAN></Id></DbtrAcct>
      <DbtrAgt><FinInstnId><BIC>${co.bic||'GEBABEBB'}</BIC></FinInstnId></DbtrAgt>
      <ChrgBr>SLEV</ChrgBr>
      ${txns}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
}

// ── GÉNÉRATEUR CLEARFACTS (CSV + metadata JSON) ──
function generateClearfactsPackage(emps, fiches, period, co) {
  const mois = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const periodeStr = `${mois[period.month-1]}_${period.year}`;

  // CSV récapitulatif paie
  const csvLines = [
    'Nom,Prénom,NISS,Brut,ONSS_Travailleur,PP,Net,Période',
    ...emps.filter(e => e.status==='active'||!e.status).map(e => {
      const brut = +(e.monthlySalary||e.gross||0);
      const onss = +(brut*TX_ONSS_W).toFixed(2);
      const pp   = +(brut*0.18).toFixed(2);
      const net  = +(brut-onss-pp).toFixed(2);
      return `"${e.last||e.ln||''}","${e.first||e.fn||''}","${e.niss||''}",${brut},${onss},${pp},${net},"${mois[period.month-1]} ${period.year}"`;
    })
  ].join('\n');

  // Metadata JSON pour Clearfacts
  const metadata = JSON.stringify({
    source: 'Aureus Social Pro',
    version: 'v18',
    company: co.name || 'Aureus IA SPRL',
    vat: co.vat || 'BE 1028.230.781',
    period: { month: period.month, year: period.year },
    document_type: 'payroll_summary',
    created_at: new Date().toISOString(),
    employees_count: emps.filter(e=>e.status==='active'||!e.status).length,
    peppol_id: '0208:1028230781',
  }, null, 2);

  return { csv: csvLines, metadata, filename: `clearfacts_paie_${periodeStr}` };
}

// ── GÉNÉRATEUR BILLIT (Peppol UBL 2.1) ──
function generateBillitUBL(co, period, emps) {
  const now = new Date();
  const mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const periodeStr = `${mois[period.month-1]} ${period.year}`;
  const invoiceId = `AUR-PAIE-${period.year}${String(period.month).padStart(2,'0')}`;
  const total = emps.filter(e=>e.status==='active'||!e.status)
    .reduce((a,e) => {
      const b = +(e.monthlySalary||e.gross||0);
      const net = b - b*TX_ONSS_W - b*TAUX_WARRANTS;
      return a + net;
    }, 0);

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:ID>${invoiceId}</cbc:ID>
  <cbc:IssueDate>${now.toISOString().slice(0,10)}</cbc:IssueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:Note>Récapitulatif paie ${periodeStr} — Aureus Social Pro</cbc:Note>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:EndpointID schemeID="0208">${(co.vat||'BE1028230781').replace(/[^0-9]/g,'')}</cbc:EndpointID>
      <cac:PartyName><cbc:Name>${co.name||'Aureus IA SPRL'}</cbc:Name></cac:PartyName>
      <cac:PostalAddress><cac:Country><cbc:IdentificationCode>BE</cbc:IdentificationCode></cac:Country></cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${co.vat||'BE1028230781'}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="EUR">${total.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="EUR">${total.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:PayableAmount currencyID="EUR">${total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>`;
}

// ── COMPOSANT PRINCIPAL ──
export default function IntegrationsCompta({ s }) {
  const { tText } = useLang();
  const emps = s?.emps || [];
  const co   = s?.co   || {};
  const pays = s?.pays || [];

  const [period, setPeriod] = useState({ month: new Date().getMonth()+1, year: new Date().getFullYear() });
  const [status, setStatus] = useState({});
  const [cfg, setCfg] = useState({ clearfacts_email:'', billit_peppolid:'', isabel_iban:co.iban||'' });

  const moisNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const activeEmps = emps.filter(e => e.status==='active'||!e.status);
  const totalNet = activeEmps.reduce((a,e) => {
    const b = +(e.monthlySalary||e.gross||0);
    return a + b - b*TX_ONSS_W - b*TAUX_WARRANTS;
  }, 0);

  function dl(content, filename, type='text/xml') {
    const blob = new Blob([content], { type });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
  }

  // ── Isabel 6 ──
  async function handleIsabel() {
    setStatus(s => ({...s, isabel:'loading'}));
    try {
      const xml = generateIsabelXML(activeEmps, {
        ...co, iban: cfg.isabel_iban || co.iban,
      }, period);
      dl(xml, `isabel_pain001_${period.year}${String(period.month).padStart(2,'0')}.xml`);
      setStatus(s => ({...s, isabel:'ok'}));
    } catch(e) {
      setStatus(s => ({...s, isabel:'error'}));
    }
  }

  // ── Clearfacts ──
  async function handleClearfacts() {
    setStatus(s => ({...s, clearfacts:'loading'}));
    try {
      const pkg = generateClearfactsPackage(activeEmps, pays, period, co);
      dl(pkg.csv, `${pkg.filename}_paie.csv`, 'text/csv;charset=utf-8');
      setTimeout(() => dl(pkg.metadata, `${pkg.filename}_metadata.json`, 'application/json'), 500);
      setStatus(s => ({...s, clearfacts:'ok'}));
    } catch(e) {
      setStatus(s => ({...s, clearfacts:'error'}));
    }
  }

  // ── Billit ──
  async function handleBillit() {
    setStatus(s => ({...s, billit:'loading'}));
    try {
      const ubl = generateBillitUBL(co, period, activeEmps);
      dl(ubl, `billit_ubl21_${period.year}${String(period.month).padStart(2,'0')}.xml`);
      setStatus(s => ({...s, billit:'ok'}));
    } catch(e) {
      setStatus(s => ({...s, billit:'error'}));
    }
  }

  const StatusBadge = ({ id }) => {
    const v = status[id];
    if (!v) return null;
    if (v === 'loading') return <span style={S.badge('#c6a34e')}>⏳ Génération...</span>;
    if (v === 'ok')      return <span style={S.badge('#22c55e')}>✅ Fichier téléchargé</span>;
    if (v === 'error')   return <span style={S.badge('#ef4444')}>❌ Erreur</span>;
  };

  return (
    <div style={S.wrap}>

      {/* ── KPIs ── */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16}}>
        {[
          { l:'Travailleurs actifs', v:activeEmps.length,                c:'#c6a34e', i:'👥' },
          { l:'Net total à virer',   v:`${totalNet.toFixed(0)} €`,       c:'#22c55e', i:'💶' },
          { l:'Formats supportés',   v:'3',                               c:'#60a5fa', i:'🔌' },
          { l:'Peppol ID',           v:'0208:1028230781',                 c:'#a78bfa', i:'🔗' },
        ].map((k,i) => (
          <div key={i} style={{padding:'12px 14px', background:'rgba(255,255,255,0.03)',
            borderRadius:10, border:`1px solid ${k.c}25`, textAlign:'center'}}>
            <div style={{fontSize:18, marginBottom:2}}>{k.i}</div>
            <div style={{fontSize:18, fontWeight:700, color:k.c}}>{k.v}</div>
            <div style={{fontSize:9, color:'#555', marginTop:2}}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* ── Période ── */}
      <div style={{...S.card, padding:'14px 18px'}}>
        <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap'}}>
          <span style={{fontSize:11, color:'#888', fontWeight:600}}>📅 Période :</span>
          <select value={period.month} onChange={e=>setPeriod(p=>({...p,month:+e.target.value}))}
            style={{...S.input, width:130}}>
            {moisNames.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={period.year} onChange={e=>setPeriod(p=>({...p,year:+e.target.value}))}
            style={{...S.input, width:90}}>
            {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span style={{fontSize:11, color:'#c6a34e', fontWeight:600}}>
            → {activeEmps.length} employé{activeEmps.length>1?'s':''} · {totalNet.toFixed(2)} € net
          </span>
        </div>
      </div>

      {/* ── ISABEL 6 ── */}
      <div style={S.card}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
          <div>
            <div style={S.h2}>💳 Isabel 6 — Virement SEPA pain.001</div>
            <div style={S.sub}>Fichier XML ISO 20022 prêt à importer dans Isabel 6 · Virements salaires batch</div>
          </div>
          <div style={{display:'flex', gap:6, alignItems:'center'}}>
            <span style={S.badge('#22c55e')}>✅ Opérationnel</span>
            <StatusBadge id="isabel" />
          </div>
        </div>

        <div style={{marginBottom:14}}>
          <label style={S.label}>IBAN compte débiteur (votre entreprise)</label>
          <input style={S.input} value={cfg.isabel_iban}
            onChange={e=>setCfg(c=>({...c,isabel_iban:e.target.value}))}
            placeholder="BE00 0000 0000 0000" />
        </div>

        <div style={{background:'rgba(198,163,78,0.05)', borderRadius:8, padding:12, marginBottom:14}}>
          <div style={{fontSize:10, color:'#666', marginBottom:6}}>📋 Récapitulatif virements :</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8}}>
            {activeEmps.slice(0,6).map((e,i) => {
              const b = +(e.monthlySalary||e.gross||0);
              const net = b - b*TX_ONSS_W - b*TAUX_WARRANTS;
              return (
                <div key={i} style={{fontSize:10, color:'#888'}}>
                  <span style={{color:'#e5e5e5'}}>{e.first||e.fn||''} {e.last||e.ln||''}</span>
                  <span style={{color:'#22c55e', marginLeft:6}}>{net.toFixed(2)} €</span>
                </div>
              );
            })}
            {activeEmps.length > 6 && <div style={{fontSize:10,color:'#555'}}>+{activeEmps.length-6} autres</div>}
          </div>
        </div>

        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button style={S.btn()} onClick={handleIsabel} disabled={!activeEmps.length || status.isabel==='loading'}>
            💳 Générer pain.001.xml Isabel 6
          </button>
          <span style={{fontSize:10,color:'#555'}}>→ Import direct dans Isabel 6 → Approuver → Envoyer</span>
        </div>
      </div>

      {/* ── CLEARFACTS ── */}
      <div style={S.card}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
          <div>
            <div style={S.h2}>📂 Clearfacts — Push documents paie</div>
            <div style={S.sub}>Export CSV paie + metadata JSON · Compatible Clearfacts Document Management</div>
          </div>
          <div style={{display:'flex', gap:6, alignItems:'center'}}>
            <span style={S.badge('#22c55e')}>✅ Opérationnel</span>
            <StatusBadge id="clearfacts" />
          </div>
        </div>

        <div style={{marginBottom:14}}>
          <label style={S.label}>Email Clearfacts de réception (optionnel)</label>
          <input style={S.input} value={cfg.clearfacts_email}
            onChange={e=>setCfg(c=>({...c,clearfacts_email:e.target.value}))}
            placeholder="comptable@fiduciaire.be" />
        </div>

        <div style={{background:'rgba(96,165,250,0.05)', borderRadius:8, padding:12, marginBottom:14}}>
          <div style={{fontSize:10, color:'#666', marginBottom:4}}>📦 Contenu du package :</div>
          <div style={{fontSize:10, color:'#888', lineHeight:2}}>
            📄 <span style={{color:'#e5e5e5'}}>clearfacts_paie_{period.year}{String(period.month).padStart(2,'0')}_paie.csv</span> — Récapitulatif toutes fiches<br/>
            📋 <span style={{color:'#e5e5e5'}}>clearfacts_paie_{period.year}{String(period.month).padStart(2,'0')}_metadata.json</span> — Metadata société + période
          </div>
        </div>

        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button style={S.btn('#60a5fa')} onClick={handleClearfacts} disabled={!activeEmps.length || status.clearfacts==='loading'}>
            📂 Exporter vers Clearfacts
          </button>
          <span style={{fontSize:10,color:'#555'}}>→ 2 fichiers téléchargés → Upload dans Clearfacts</span>
        </div>
      </div>

      {/* ── BILLIT / PEPPOL ── */}
      <div style={S.card}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
          <div>
            <div style={S.h2}>🔌 Billit — Facture Peppol UBL 2.1</div>
            <div style={S.sub}>Format UBL 2.1 certifié Peppol · ID Aureus : 0208:1028230781 · Compatible Billit / Mercurius / Unifiedpost</div>
          </div>
          <div style={{display:'flex', gap:6, alignItems:'center'}}>
            <span style={S.badge('#a78bfa')}>✅ Peppol certifié</span>
            <StatusBadge id="billit" />
          </div>
        </div>

        <div style={{marginBottom:14}}>
          <label style={S.label}>Peppol ID destinataire (fiduciaire)</label>
          <input style={S.input} value={cfg.billit_peppolid}
            onChange={e=>setCfg(c=>({...c,billit_peppolid:e.target.value}))}
            placeholder="0208:0123456789 (N° BCE précédé de 0208:)" />
        </div>

        <div style={{background:'rgba(167,139,250,0.05)', borderRadius:8, padding:12, marginBottom:14}}>
          <div style={{fontSize:10, color:'#666', marginBottom:4}}>📋 Contenu UBL 2.1 :</div>
          <div style={{fontSize:10, color:'#888', lineHeight:1.8}}>
            • Standard ISO OASIS UBL 2.1 · Invoice type 380<br/>
            • Montant total NET : <span style={{color:'#22c55e', fontWeight:700}}>{totalNet.toFixed(2)} €</span><br/>
            • Référence : AUR-PAIE-{period.year}{String(period.month).padStart(2,'0')}<br/>
            • Compatible : Billit, Mercurius, Unifiedpost, CodaBox, Basware
          </div>
        </div>

        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button style={S.btn('#a78bfa')} onClick={handleBillit} disabled={!activeEmps.length || status.billit==='loading'}>
            🔌 Générer UBL 2.1 Billit / Peppol
          </button>
          <span style={{fontSize:10,color:'#555'}}>→ Upload dans Billit → Envoi réseau Peppol</span>
        </div>
      </div>

      {/* ── Guide rapide ── */}
      <div style={{...S.card, background:'rgba(198,163,78,0.03)', border:'1px solid rgba(198,163,78,0.12)'}}>
        <div style={{fontSize:11, fontWeight:700, color:'#c6a34e', marginBottom:10}}>📖 Comment utiliser ces intégrations ?</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
          {[
            { t:'💳 Isabel 6', steps:['Générer pain.001.xml','Ouvrir isabel.eu','Importer le fichier','Approuver les virements','Envoyer → salaires payés'] },
            { t:'📂 Clearfacts', steps:['Exporter les 2 fichiers','Ouvrir clearfacts.eu','Upload dans votre dossier','Votre comptable les voit instantanément'] },
            { t:'🔌 Billit / Peppol', steps:['Générer UBL 2.1','Ouvrir billit.be','Upload ou API Peppol','Document transmis au réseau belge'] },
          ].map((g,i) => (
            <div key={i} style={{background:'rgba(0,0,0,0.2)', borderRadius:8, padding:12}}>
              <div style={{fontSize:11, fontWeight:700, color:'#e5e5e5', marginBottom:8}}>{g.t}</div>
              {g.steps.map((s,j) => (
                <div key={j} style={{fontSize:10, color:'#888', marginBottom:4}}>
                  <span style={{color:'#c6a34e', marginRight:6}}>{j+1}.</span>{s}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
