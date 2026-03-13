'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { TX_ONSS_W, TX_ONSS_E, genDimonaXML } from '@/app/lib/helpers';
import { supabase } from '@/app/lib/supabase';
import { authFetch } from '@/app/lib/auth-fetch';

// ═══════════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Déclarations ONSS/SPF
// Dimona IN/OUT · DmfA Trimestrielle · Belcotax-on-Web · Calendrier social
// ═══════════════════════════════════════════════════════════════════════════

const GOLD    = '#c6a34e';
const GOLD_BG = 'rgba(198,163,78,';
const DARK    = '#090c16';
const CARD    = 'rgba(255,255,255,0.025)';
const BORDER  = 'rgba(255,255,255,0.07)';

const S = {
  wrap:  { color: '#e8e6e0', fontFamily: 'inherit', padding: 24 },
  card:  { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 14 },
  h2:    { fontSize: 13, fontWeight: 700, color: GOLD, margin: '0 0 4px' },
  label: { fontSize: 10, color: '#888', display: 'block', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' },
  input: { width: '100%', padding: '8px 11px', background: DARK, border: '1px solid rgba(139,115,60,.2)', borderRadius: 7, color: '#e5e5e5', fontSize: 11, fontFamily: 'inherit', boxSizing: 'border-box' },
  btn:   (c = GOLD, sm = false, dis = false) => ({ padding: sm ? '6px 12px' : '9px 18px', borderRadius: 7, border: 'none', background: dis ? 'rgba(255,255,255,0.04)' : c === GOLD ? GOLD_BG + '0.9)' : c, color: dis ? '#555' : c === GOLD ? '#0c0b09' : '#fff', fontSize: sm ? 11 : 12, fontWeight: 700, cursor: dis ? 'not-allowed' : 'pointer', opacity: dis ? 0.5 : 1, fontFamily: 'inherit', transition: 'all .15s' }),
  tab:   (active) => ({ padding: '7px 16px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: active ? GOLD_BG + '0.12)' : 'rgba(255,255,255,.03)', color: active ? GOLD : '#888', fontFamily: 'inherit', transition: 'all .15s' }),
  badge: (c) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: c + '20', color: c, border: `1px solid ${c}40` }),
  kpi:   (c) => ({ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: `1px solid ${c}25`, textAlign: 'center' }),
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 },
  pre:   { fontSize: 10, color: '#aaa', background: 'rgba(0,0,0,0.4)', padding: 14, borderRadius: 8, overflowX: 'auto', overflowY: 'auto', maxHeight: 400, border: `1px solid ${BORDER}`, fontFamily: 'monospace', lineHeight: 1.6, whiteSpace: 'pre', userSelect: 'text' },
};

// ── Calculs ONSS ────────────────────────────────────────────────────────────
const COEF_108 = 1.08;
function calcCotisations(emp) {
  const isOuvrier = (emp.statut || emp.status_type || '').toLowerCase().includes('ouvrier');
  const brutMens  = +(emp.gross || emp.brut || emp.monthlySalary || 0);
  const brutTrim  = brutMens * 3;
  const base      = isOuvrier ? Math.round(brutTrim * COEF_108 * 100) / 100 : brutTrim;
  const cotW      = Math.round(base * TX_ONSS_W * 100) / 100;
  const cotE      = Math.round(base * TX_ONSS_E * 100) / 100;
  const reduc     = emp.premier_employe ? cotE : 0;
  return { brutTrim, base, cotW, cotE, cotENet: Math.max(0, cotE - reduc), reduc, totalDu: cotW + Math.max(0, cotE - reduc) };
}

// ── Générateur DmfA XML ─────────────────────────────────────────────────────
function escXml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function generateDmfaXml({ emps, quarter, year, co }) {
  const valid = emps.filter(e => (e.niss || '').replace(/\D/g,'').length === 11);
  const totals = valid.reduce((a, e) => {
    const c = calcCotisations(e);
    a.brut += c.brutTrim; a.cotW += c.cotW; a.cotE += c.cotE; a.cotENet += c.cotENet; a.reduc += c.reduc;
    return a;
  }, { brut: 0, cotW: 0, cotE: 0, cotENet: 0, reduc: 0 });

  const msgId   = `DMFA-${year}Q${quarter}-${Date.now().toString(36).toUpperCase()}`;
  const isoDate = `${year}-${String((quarter - 1) * 3 + 3).padStart(2,'0')}-30`;
  const moisFr  = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const trimStr = `T${quarter} ${year}`;

  const workers = valid.map(e => {
    const c  = calcCotisations(e);
    const cp = String(e.cp || '200').replace(/\D/g,'');
    const monthLines = [1,2,3].map(m => {
      const mn = (quarter - 1) * 3 + m;
      return `      <mois numero="${mn}"><salaire>${(c.brutTrim / 3).toFixed(2)}</salaire><joursPrestes>30</joursPrestes></mois>`;
    }).join('\n');
    return `  <travailleur>
    <niss>${(e.niss||'').replace(/\D/g,'')}</niss>
    <nom>${escXml((e.last||e.ln||'').toUpperCase())}</nom>
    <prenom>${escXml(e.first||e.fn||'')}</prenom>
    <dateEntree>${e.startDate||`${year}-01-01`}</dateEntree>
    <cp>${cp}</cp>
    <contrat>${(e.contractType||'CDI') === 'CDD' ? 'CTT' : 'CDI'}</contrat>
    <prestations>
${monthLines}
    </prestations>
    <remunerations>
      <remunerationBrute>${c.brutTrim.toFixed(2)}</remunerationBrute>
      <baseCotisations>${c.base.toFixed(2)}</baseCotisations>
    </remunerations>
    <cotisations>
      <cotisationTravailleur>${c.cotW.toFixed(2)}</cotisationTravailleur>
      <cotisationPatronale>${c.cotE.toFixed(2)}</cotisationPatronale>
      <reductionsGroupeCible>${c.reduc.toFixed(2)}</reductionsGroupeCible>
      <cotisationPatronaleNette>${c.cotENet.toFixed(2)}</cotisationPatronaleNette>
    </cotisations>
  </travailleur>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- DmfA ${trimStr} — Aureus Social Pro — ${new Date().toISOString()} -->
<DmfA xmlns="urn:onss:dmfa:v20">
  <entete>
    <messageId>${msgId}</messageId>
    <dateCreation>${new Date().toISOString().slice(0,10)}</dateCreation>
    <trimestre>${year}T${quarter}</trimestre>
    <version>20</version>
  </entete>
  <employeur>
    <matriculeONSS>${co?.onss || '5135771602'}</matriculeONSS>
    <nom>${escXml(co?.name || 'Aureus IA SPRL')}</nom>
    <numeroTVA>${(co?.vat || 'BE1028230781').replace(/[^A-Z0-9]/g,'')}</numeroTVA>
    <nombreTravailleurs>${valid.length}</nombreTravailleurs>
  </employeur>
  <travailleurs>
${workers}
  </travailleurs>
  <totaux>
    <remunerationBruteTotale>${totals.brut.toFixed(2)}</remunerationBruteTotale>
    <totalCotisationsTravailleur>${totals.cotW.toFixed(2)}</totalCotisationsTravailleur>
    <totalCotisationsPatronales>${totals.cotE.toFixed(2)}</totalCotisationsPatronales>
    <totalReductionsGroupeCible>${totals.reduc.toFixed(2)}</totalReductionsGroupeCible>
    <totalCotisationsPatronalesNettes>${totals.cotENet.toFixed(2)}</totalCotisationsPatronalesNettes>
    <totalDu>${(totals.cotW + totals.cotENet).toFixed(2)}</totalDu>
  </totaux>
</DmfA>`;
}

// ── Générateur Belcotax XML (fiche 281.10) ──────────────────────────────────
function generateBelcotaxXml({ emps, year, co }) {
  const fiches = emps.filter(e => +(e.gross||e.monthlySalary||0) > 0).map((e, i) => {
    const brut   = +(e.gross || e.monthlySalary || 0) * 12;
    const onssW  = brut * TX_ONSS_W;
    const pp     = brut * 0.2672;
    const net    = brut - onssW - pp;
    const niss   = (e.niss||'').replace(/\D/g,'');
    const seqNr  = String(i + 1).padStart(4,'0');
    return `  <Fiche numero="${seqNr}" type="28110">
    <BeneficiaryInfo>
      <NISS>${niss}</NISS>
      <Nom>${escXml((e.last||e.ln||'').toUpperCase())}</Nom>
      <Prenom>${escXml(e.first||e.fn||'')}</Prenom>
    </BeneficiaryInfo>
    <Remunerations>
      <Code>250</Code><!-- Rémunérations ordinaires -->
      <Montant>${brut.toFixed(2)}</Montant>
    </Remunerations>
    <Remunerations>
      <Code>286</Code><!-- Cotisations ONSS personnelles -->
      <Montant>${onssW.toFixed(2)}</Montant>
    </Remunerations>
    <Remunerations>
      <Code>225</Code><!-- Précompte professionnel retenu -->
      <Montant>${pp.toFixed(2)}</Montant>
    </Remunerations>
    <NetImposable>${net.toFixed(2)}</NetImposable>
  </Fiche>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Belcotax-on-Web 281.10 — Année ${year} — Aureus Social Pro -->
<BelcotaxDocument annee="${year}" softwareRef="AureusSocialPro" dateCreation="${new Date().toISOString().slice(0,10)}">
  <Emetteur>
    <NomSociete>${escXml(co?.name||'Aureus IA SPRL')}</NomSociete>
    <NumeroTVA>${(co?.vat||'BE1028230781').replace(/[^A-Z0-9]/g,'')}</NumeroTVA>
    <MatriculeONSS>${co?.onss||'5135771602'}</MatriculeONSS>
  </Emetteur>
  <Fiches>
${fiches.join('\n')}
  </Fiches>
</BelcotaxDocument>`;
}

// ── Download helper ─────────────────────────────────────────────────────────
function downloadFile(content, filename, mime = 'application/xml;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
}

// ── Calendrier des échéances ONSS ────────────────────────────────────────────
function getEcheances(year) {
  return [
    // DmfA
    { type: 'DmfA', label: 'DmfA T1', date: `${year}-04-30`, desc: 'Salaires Jan-Fév-Mar', color: '#a78bfa' },
    { type: 'DmfA', label: 'DmfA T2', date: `${year}-07-31`, desc: 'Salaires Avr-Mai-Jun', color: '#a78bfa' },
    { type: 'DmfA', label: 'DmfA T3', date: `${year}-10-31`, desc: 'Salaires Jul-Aoû-Sep', color: '#a78bfa' },
    { type: 'DmfA', label: 'DmfA T4', date: `${year + 1}-01-31`, desc: 'Salaires Oct-Nov-Déc', color: '#a78bfa' },
    // Paiements ONSS
    { type: 'ONSS', label: 'Paiement ONSS Jan', date: `${year}-01-05`, desc: 'Cotisations mois précédent', color: '#f87171' },
    { type: 'ONSS', label: 'Paiement ONSS Fév', date: `${year}-02-05`, desc: 'Cotisations mois précédent', color: '#f87171' },
    { type: 'ONSS', label: 'Paiement ONSS Mar', date: `${year}-03-05`, desc: 'Cotisations mois précédent', color: '#f87171' },
    { type: 'ONSS', label: 'Paiement ONSS Avr', date: `${year}-04-05`, desc: 'Cotisations mois précédent', color: '#f87171' },
    { type: 'ONSS', label: 'Paiement ONSS Mai', date: `${year}-05-05`, desc: 'Cotisations mois précédent', color: '#f87171' },
    { type: 'ONSS', label: 'Paiement ONSS Jun', date: `${year}-06-05`, desc: 'Cotisations mois précédent', color: '#f87171' },
    { type: 'ONSS', label: 'Paiement ONSS Jul', date: `${year}-07-05`, desc: 'Cotisations mois précédent', color: '#f87171' },
    { type: 'ONSS', label: 'Paiement ONSS Aoû', date: `${year}-08-05`, desc: 'Cotisations mois précédent', color: '#f87171' },
    { type: 'ONSS', label: 'Paiement ONSS Sep', date: `${year}-09-05`, desc: 'Cotisations mois précédent', color: '#f87171' },
    { type: 'ONSS', label: 'Paiement ONSS Oct', date: `${year}-10-05`, desc: 'Cotisations mois précédent', color: '#f87171' },
    { type: 'ONSS', label: 'Paiement ONSS Nov', date: `${year}-11-05`, desc: 'Cotisations mois précédent', color: '#f87171' },
    { type: 'ONSS', label: 'Paiement ONSS Déc', date: `${year}-12-05`, desc: 'Cotisations mois précédent', color: '#f87171' },
    // Belcotax
    { type: 'Belcotax', label: 'Belcotax 281.10', date: `${year + 1}-02-28`, desc: `Fiches salariales ${year}`, color: '#22c55e' },
    { type: 'Belcotax', label: 'Belcotax 281.50', date: `${year + 1}-02-28`, desc: `Commissions/honoraires ${year}`, color: '#22c55e' },
    // PP
    { type: 'PP', label: 'Versement PP mensuel', date: `${year}-01-15`, desc: 'Précompte professionnel mensuel', color: '#f59e0b' },
  ];
}

// ── Composant principal ─────────────────────────────────────────────────────
export default function DeclarationsONSS({ s }) {
  const emps    = (s?.emps || []).filter(e => e.status === 'active' || !e.status);
  const co      = s?.co || {};
  const now     = new Date();
  const curYear = now.getFullYear();
  const curQ    = Math.ceil((now.getMonth() + 1) / 3);

  const [tab,       setTab]       = useState('dimona');
  const [dmfaQ,     setDmfaQ]     = useState(curQ);
  const [dmfaYear,  setDmfaYear]  = useState(curYear);
  const [belYear,   setBelYear]   = useState(curYear - 1);
  const [preview,   setPreview]   = useState({ type: null, content: '' });
  const [loading,   setLoading]   = useState({});
  const [history,   setHistory]   = useState([]);
  const [onssStatus, setOnssStatus] = useState(null);

  // Dimona form
  const [df, setDf] = useState({
    eid: emps[0]?.id || '',
    action: 'IN', wtype: 'OTH',
    start: now.toISOString().split('T')[0],
    end: '', planHrs: '', reason: '', dimonaP: '',
  });

  const emp = emps.find(e => e.id === df.eid);

  // Load history + ONSS status
  const loadHistory = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('declarations')
      .select('id, type, period, status, data, created_at')
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) setHistory(data);
  }, []);

  useEffect(() => {
    loadHistory();
    authFetch('/api/onss/status').then(r => r.json()).then(setOnssStatus).catch(() => {});
  }, [loadHistory]);

  // ── Dimona validation ──
  const dimonaErrors = (() => {
    const e = [];
    if (!emp) e.push('Sélectionnez un travailleur');
    else if (!emp.niss) e.push(`NISS manquant — ${emp.first} ${emp.last}`);
    if (!df.start) e.push('Date de début obligatoire');
    if (df.action === 'OUT' && !df.end) e.push('Date de fin obligatoire pour OUT');
    if (['STU','FLX'].includes(df.wtype) && !df.planHrs) e.push('Heures planifiées obligatoires');
    return e;
  })();

  // ── Handlers ──
  function handleDimonaSubmit() {
    if (dimonaErrors.length) return;
    setLoading(l => ({ ...l, dimona: true }));
    const xml = genDimonaXML ? genDimonaXML({
      action: df.action, wtype: df.wtype, start: df.start, end: df.end,
      hours: df.planHrs, first: emp.first, last: emp.last, niss: emp.niss,
      birth: emp.birth, cp: emp.cp, onss: co.onss, vat: co.vat,
    }) : `<!-- Dimona ${df.action} ${emp.niss} ${df.start} -->`;

    const payload = {
      type: df.action, env: 'simulation',
      employer: { noss: co.onss || '', enterpriseNumber: (co.vat || '').replace(/\D/g,'') },
      worker: { niss: emp.niss, firstName: emp.first, lastName: emp.last, birthDate: emp.birth || '' },
      occupation: { startDate: df.start, jointCommissionNbr: emp.cp || '200', workerType: df.wtype, plannedHoursNbr: df.planHrs || undefined, plannedEndDate: df.end || undefined },
      endDate: df.end || undefined,
    };

    authFetch('/api/onss/dimona', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(r => r.json())
      .then(res => {
        setLoading(l => ({ ...l, dimona: false }));
        setPreview({ type: 'dimona', content: xml, ref: res.declarationId || `DIM-${Date.now().toString(36).toUpperCase()}`, status: res.success ? 'accepted' : 'simulated' });
        setTab('preview');
        loadHistory();
      })
      .catch(() => {
        setLoading(l => ({ ...l, dimona: false }));
        setPreview({ type: 'dimona', content: xml, ref: `DIM-${Date.now().toString(36).toUpperCase()}`, status: 'local' });
        setTab('preview');
      });
  }

  async function handleDmfaGenerate(dl = false) {
    setLoading(l => ({ ...l, dmfa: true }));
    try {
      const res = await authFetch('/api/onss/dmfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emps, quarter: dmfaQ, year: dmfaYear, co, preview: !dl }),
      });
      const data = await res.json();
      if (data.xml) {
        setPreview({ type: 'dmfa', content: data.xml, filename: data.filename, totals: data.totals, nb: data.nb_workers });
        if (dl) downloadFile(data.xml, data.filename);
        else setTab('preview');
      }
      if (!dl) loadHistory();
    } catch (e) {
      // fallback: generate locally
      const xml = generateDmfaXml({ emps, quarter: dmfaQ, year: dmfaYear, co });
      const fname = `DmfA_${dmfaYear}T${dmfaQ}.xml`;
      setPreview({ type: 'dmfa', content: xml, filename: fname });
      if (dl) downloadFile(xml, fname);
      else setTab('preview');
    }
    setLoading(l => ({ ...l, dmfa: false }));
  }

  function handleBelcotaxGenerate(dl = false) {
    setLoading(l => ({ ...l, belcotax: true }));
    const xml   = generateBelcotaxXml({ emps, year: belYear, co });
    const fname = `Belcotax_281_10_${belYear}.xml`;
    setPreview({ type: 'belcotax', content: xml, filename: fname });
    if (dl) downloadFile(xml, fname);
    else setTab('preview');
    setLoading(l => ({ ...l, belcotax: false }));
  }

  // DmfA totals preview
  const dmfaTotals = emps.reduce((a, e) => {
    const c = calcCotisations(e);
    a.brut += c.brutTrim; a.totalDu += c.totalDu;
    return a;
  }, { brut: 0, totalDu: 0 });

  const validEmps = emps.filter(e => (e.niss||'').replace(/\D/g,'').length === 11);
  const echeances = getEcheances(curYear).filter(ec => new Date(ec.date) > now).slice(0, 8);

  const WTYPES = { OTH:'Ordinaire',STU:'Étudiant',FLX:'Flexi-job',EXT:'Extra Horeca',DWD:'Occasionnel',IVT:'Stagiaire',APP:'Apprenti',ART:'Artiste' };
  const needsEnd   = df.action === 'OUT' || ['STU','FLX','EXT'].includes(df.wtype);
  const needsHours = ['STU','FLX','EXT','DWD'].includes(df.wtype);

  return (
    <div style={S.wrap}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: '0 0 4px' }}>
            📡 Déclarations ONSS / SPF
          </h2>
          <p style={{ fontSize: 11, color: '#666', margin: 0 }}>
            Dimona IN/OUT · DmfA Trimestrielle · Belcotax-on-Web · Calendrier social
          </p>
        </div>
        {/* ONSS status pill */}
        <div style={{ padding: '6px 12px', borderRadius: 20, border: `1px solid ${onssStatus?.readiness?.chamanConfig ? '#22c55e40' : '#f59e0b40'}`, background: onssStatus?.readiness?.chamanConfig ? 'rgba(34,197,94,.06)' : 'rgba(245,158,11,.06)', fontSize: 10, fontWeight: 600, color: onssStatus?.readiness?.chamanConfig ? '#22c55e' : '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
          {onssStatus?.readiness?.chamanConfig ? 'ONSS Connecté' : 'Mode simulation'}
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={S.grid4}>
        {[
          { l: 'Travailleurs actifs', v: emps.length,            c: GOLD,      i: '👥' },
          { l: 'NISS valides',        v: validEmps.length,       c: '#22c55e', i: '✅' },
          { l: `DmfA T${dmfaQ} brut`, v: `${(dmfaTotals.brut/1000).toFixed(1)}k €`, c: '#a78bfa', i: '◆' },
          { l: 'Prochaine échéance',  v: echeances[0]?.label || '—', c: '#f87171', i: '📅' },
        ].map((k, i) => (
          <div key={i} style={S.kpi(k.c)}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{k.i}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: k.c, lineHeight: 1.2 }}>{k.v}</div>
            <div style={{ fontSize: 9, color: '#555', marginTop: 3 }}>{k.l}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 16 }} />

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,.02)', borderRadius: 8, padding: 3, flexWrap: 'wrap' }}>
        {[
          { id: 'dimona',   label: '📡 Dimona' },
          { id: 'dmfa',     label: '◆ DmfA' },
          { id: 'belcotax', label: '📄 Belcotax' },
          { id: 'calendar', label: '📅 Calendrier' },
          { id: 'history',  label: `🗂️ Historique (${history.length})` },
          { id: 'preview',  label: '👁️ Aperçu', show: !!preview.content },
        ].filter(t => t.show !== false).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={S.tab(tab === t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════ TAB DIMONA */}
      {tab === 'dimona' && (
        <div style={S.grid2}>
          {/* Formulaire */}
          <div style={S.card}>
            <div style={S.h2}>📡 Nouvelle déclaration Dimona</div>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 16 }}>Déclaration immédiate emploi — ONSS REST v2</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={S.label}>Travailleur</label>
                <select value={df.eid} onChange={e => setDf(f => ({ ...f, eid: e.target.value }))} style={S.input}>
                  <option value="">— Sélectionner —</option>
                  {emps.map(e => <option key={e.id} value={e.id}>{e.first} {e.last} {!e.niss ? '⚠ NISS manquant' : ''}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Action</label>
                <select value={df.action} onChange={e => setDf(f => ({ ...f, action: e.target.value }))} style={S.input}>
                  <option value="IN">IN — Entrée en service</option>
                  <option value="OUT">OUT — Sortie de service</option>
                  <option value="UPDATE">UPDATE — Modification</option>
                  <option value="CANCEL">CANCEL — Annulation</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Type travailleur</label>
                <select value={df.wtype} onChange={e => setDf(f => ({ ...f, wtype: e.target.value }))} style={S.input}>
                  {Object.entries(WTYPES).map(([k, v]) => <option key={k} value={k}>{k} — {v}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Date début</label>
                <input type="date" value={df.start} onChange={e => setDf(f => ({ ...f, start: e.target.value }))} style={S.input} />
              </div>
              {needsEnd && (
                <div>
                  <label style={S.label}>Date fin</label>
                  <input type="date" value={df.end} onChange={e => setDf(f => ({ ...f, end: e.target.value }))} style={S.input} />
                </div>
              )}
              {needsHours && (
                <div>
                  <label style={S.label}>Heures planifiées</label>
                  <input type="number" value={df.planHrs} onChange={e => setDf(f => ({ ...f, planHrs: e.target.value }))} style={S.input} placeholder="Ex: 38" />
                </div>
              )}
              {df.action === 'OUT' && (
                <div>
                  <label style={S.label}>Motif sortie</label>
                  <select value={df.reason} onChange={e => setDf(f => ({ ...f, reason: e.target.value }))} style={S.input}>
                    <option value="">— Sélectionner —</option>
                    <option value="DEM">Démission</option>
                    <option value="LIC">Licenciement</option>
                    <option value="RUP">Rupture amiable</option>
                    <option value="FIN">Fin contrat déterminé</option>
                    <option value="RET">Retraite</option>
                    <option value="DEC">Décès</option>
                  </select>
                </div>
              )}
              {df.action === 'UPDATE' && (
                <div>
                  <label style={S.label}>N° Dimona période</label>
                  <input value={df.dimonaP} onChange={e => setDf(f => ({ ...f, dimonaP: e.target.value }))} style={S.input} placeholder="Ex: DIM20260301" />
                </div>
              )}
            </div>

            {dimonaErrors.length > 0 && (
              <div style={{ marginTop: 12, padding: 10, background: 'rgba(239,68,68,.06)', borderRadius: 6, border: '1px solid rgba(239,68,68,.2)' }}>
                {dimonaErrors.map((e, i) => <div key={i} style={{ fontSize: 10.5, color: '#f87171' }}>• {e}</div>)}
              </div>
            )}

            <button style={{ ...S.btn(), marginTop: 14, width: '100%', opacity: dimonaErrors.length ? 0.5 : 1 }}
              onClick={handleDimonaSubmit} disabled={!!dimonaErrors.length || loading.dimona}>
              {loading.dimona ? '⏳ Envoi…' : `📡 Générer Dimona ${df.action}`}
            </button>
          </div>

          {/* Infos + règles */}
          <div>
            <div style={S.card}>
              <div style={S.h2}>ℹ️ Type : {df.wtype} — {WTYPES[df.wtype]}</div>
              <div style={{ fontSize: 11, color: '#9e9b93', lineHeight: 1.7, marginTop: 8 }}>
                {df.wtype === 'STU' && 'Max 600h/an exonérées ONSS. Cotisation solidarité 5,42% + 2,71%. Vérifier Student@Work.'}
                {df.wtype === 'FLX' && 'Horeca CP 302, Commerce CP 201/202. Travailleur à 4/5 min ailleurs. Net = Brut. Cotis patronale 28%.'}
                {df.wtype === 'EXT' && 'Max 50 jours/an. Forfait journalier ONSS. CP 302 uniquement.'}
                {df.wtype === 'OTH' && 'Type ordinaire CDI/CDD. Taux ONSS normaux. Dimona IN avant mise au travail.'}
                {df.wtype === 'APP' && 'Contrat apprentissage IFAPME/EFP/VDAB. Cotisations réduites.'}
                {df.wtype === 'ART' && 'Visa artiste ou déclaration activité artistique. Régime spécifique.'}
                {!['STU','FLX','EXT','OTH','APP','ART'].includes(df.wtype) && 'Consultez la documentation ONSS.'}
              </div>
            </div>
            <div style={S.card}>
              <div style={S.h2}>⚠️ Délais légaux</div>
              <div style={{ fontSize: 11, color: '#9e9b93', lineHeight: 1.9, marginTop: 8 }}>
                <div><span style={{ color: '#4ade80', fontWeight: 700 }}>IN :</span> Avant la mise au travail</div>
                <div><span style={{ color: '#f87171', fontWeight: 700 }}>OUT :</span> Dernier jour de travail</div>
                <div><span style={{ color: '#60a5fa', fontWeight: 700 }}>UPDATE :</span> Dès que modification connue</div>
                <div style={{ marginTop: 10, padding: 8, background: 'rgba(239,68,68,.06)', borderRadius: 6, fontSize: 10, color: '#f87171' }}>
                  Amende : <b>2.500€ – 12.500€</b> par travailleur non déclaré (Art. 181 CPS)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ TAB DMFA */}
      {tab === 'dmfa' && (
        <>
          <div style={S.card}>
            <div style={S.h2}>◆ Déclaration Multifonctionnelle ONSS (DmfA)</div>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 16 }}>Génération XML trimestrielle — dépôt électronique ONSS</div>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={S.label}>Trimestre</label>
                <select value={dmfaQ} onChange={e => setDmfaQ(+e.target.value)} style={{ ...S.input, width: 120 }}>
                  {[1,2,3,4].map(q => <option key={q} value={q}>T{q} — {['Jan-Mar','Avr-Jun','Jul-Sep','Oct-Déc'][q-1]}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Année</label>
                <select value={dmfaYear} onChange={e => setDmfaYear(+e.target.value)} style={{ ...S.input, width: 90 }}>
                  {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div style={{ fontSize: 11, color: GOLD, fontWeight: 600 }}>
                {validEmps.length} travailleurs valides · Brut {(dmfaTotals.brut/1000).toFixed(2)}k € · ONSS dû {dmfaTotals.totalDu.toFixed(2)} €
              </div>
            </div>

            {emps.length - validEmps.length > 0 && (
              <div style={{ marginTop: 12, padding: 10, background: 'rgba(245,158,11,.06)', borderRadius: 6, border: '1px solid rgba(245,158,11,.2)', fontSize: 10, color: '#f59e0b' }}>
                ⚠️ {emps.length - validEmps.length} travailleur(s) sans NISS valide — exclus de la DmfA
              </div>
            )}

            {/* Tableau récapitulatif */}
            <div style={{ marginTop: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {['Travailleur','NISS','Brut trimestriel','ONSS T.','ONSS P.','Réductions','Total dû'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#888', fontSize: 10, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {validEmps.map((e, i) => {
                    const c = calcCotisations(e);
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,.02)` }}>
                        <td style={{ padding: '6px 10px', color: '#e5e5e5' }}>{e.first} {e.last}</td>
                        <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: '#60a5fa', fontSize: 10 }}>{e.niss}</td>
                        <td style={{ padding: '6px 10px', color: '#22c55e' }}>{c.brutTrim.toFixed(2)} €</td>
                        <td style={{ padding: '6px 10px', color: '#ccc' }}>{c.cotW.toFixed(2)} €</td>
                        <td style={{ padding: '6px 10px', color: '#ccc' }}>{c.cotE.toFixed(2)} €</td>
                        <td style={{ padding: '6px 10px', color: c.reduc > 0 ? '#22c55e' : '#555' }}>{c.reduc > 0 ? `-${c.reduc.toFixed(2)} €` : '—'}</td>
                        <td style={{ padding: '6px 10px', fontWeight: 700, color: '#f87171' }}>{c.totalDu.toFixed(2)} €</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `2px solid ${BORDER}` }}>
                    <td colSpan={2} style={{ padding: '8px 10px', fontWeight: 700, color: '#888', fontSize: 10 }}>TOTAL</td>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: '#22c55e' }}>{dmfaTotals.brut.toFixed(2)} €</td>
                    <td colSpan={3} />
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: '#f87171' }}>{dmfaTotals.totalDu.toFixed(2)} €</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button style={S.btn()} onClick={() => handleDmfaGenerate(false)} disabled={!validEmps.length || loading.dmfa}>
                {loading.dmfa ? '⏳' : '👁️'} Aperçu XML
              </button>
              <button style={S.btn('#60a5fa')} onClick={() => handleDmfaGenerate(true)} disabled={!validEmps.length}>
                📥 Télécharger DmfA T{dmfaQ}/{dmfaYear}.xml
              </button>
            </div>
          </div>

          {/* Guide */}
          <div style={{ ...S.card, background: GOLD_BG + '0.03)', border: `1px solid ${GOLD_BG}0.12)` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 10 }}>📖 Procédure de dépôt DmfA</div>
            <div style={S.grid2}>
              {[
                { t: 'Via portail ONSS', steps: ['Générer le XML DmfA', 'Portail securitas.social.be', 'Employeur → DmfA → Dépôt', 'Importer le fichier XML', 'Valider et confirmer'] },
                { t: 'Échéances 2026', steps: ['T1 → 30 avril 2026', 'T2 → 31 juillet 2026', 'T3 → 31 octobre 2026', 'T4 → 31 janvier 2027', 'Retard : majoration 10%'] },
              ].map((g, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#e5e5e5', marginBottom: 8 }}>{g.t}</div>
                  {g.steps.map((step, j) => (
                    <div key={j} style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>
                      <span style={{ color: GOLD, marginRight: 6 }}>{j + 1}.</span>{step}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════ TAB BELCOTAX */}
      {tab === 'belcotax' && (
        <>
          <div style={S.card}>
            <div style={S.h2}>📄 Belcotax-on-Web — Fiches 281.10</div>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 16 }}>Déclaration annuelle précompte professionnel — SPF Finances</div>

            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={S.label}>Année fiscale</label>
                <select value={belYear} onChange={e => setBelYear(+e.target.value)} style={{ ...S.input, width: 100 }}>
                  {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div style={{ fontSize: 11, color: GOLD, fontWeight: 600 }}>
                {emps.length} fiches 281.10 à générer
              </div>
            </div>

            {/* Tableau recap */}
            <div style={{ marginTop: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {['Travailleur','NISS','Brut annuel','ONSS','PP retenu','Net imposable'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#888', fontSize: 10, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {emps.filter(e => +(e.gross||e.monthlySalary||0) > 0).map((e, i) => {
                    const brut = +(e.gross||e.monthlySalary||0) * 12;
                    const onss = brut * TX_ONSS_W;
                    const pp   = brut * 0.2672;
                    const net  = brut - onss - pp;
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,.02)` }}>
                        <td style={{ padding: '6px 10px', color: '#e5e5e5' }}>{e.first} {e.last}</td>
                        <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: '#60a5fa', fontSize: 10 }}>{e.niss || '⚠ manquant'}</td>
                        <td style={{ padding: '6px 10px', color: '#22c55e' }}>{brut.toFixed(2)} €</td>
                        <td style={{ padding: '6px 10px', color: '#ccc' }}>{onss.toFixed(2)} €</td>
                        <td style={{ padding: '6px 10px', color: '#ccc' }}>{pp.toFixed(2)} €</td>
                        <td style={{ padding: '6px 10px', fontWeight: 700, color: '#e5e5e5' }}>{net.toFixed(2)} €</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button style={S.btn()} onClick={() => handleBelcotaxGenerate(false)}>
                👁️ Aperçu XML
              </button>
              <button style={S.btn('#60a5fa')} onClick={() => handleBelcotaxGenerate(true)}>
                📥 Télécharger Belcotax_{belYear}.xml
              </button>
            </div>
          </div>

          <div style={{ ...S.card, background: 'rgba(34,197,94,.03)', border: '1px solid rgba(34,197,94,.12)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', marginBottom: 10 }}>📖 Procédure Belcotax</div>
            <div style={S.grid2}>
              {[
                { t: 'Dépôt en ligne', steps: ['Générer le XML 281.10', 'belcotax.finform.fgov.be', 'Connexion eID / itsme', 'Importer fichier XML', 'Valider et envoyer'] },
                { t: 'Échéances 2026', steps: ['Fiches 281.10 : 28/02/2026', 'Fiches 281.50 : 28/02/2026', 'Retard → amende 6,25%/mois', 'Correction : jusqu\'au 30/06', 'Contact : 02/572.57.57'] },
              ].map((g, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#e5e5e5', marginBottom: 8 }}>{g.t}</div>
                  {g.steps.map((step, j) => (
                    <div key={j} style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>
                      <span style={{ color: '#22c55e', marginRight: 6 }}>{j + 1}.</span>{step}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════ TAB CALENDAR */}
      {tab === 'calendar' && (
        <div style={S.card}>
          <div style={S.h2}>📅 Calendrier des échéances sociales {curYear}</div>
          <div style={{ fontSize: 10, color: '#666', marginBottom: 16 }}>Prochaines obligations légales — triées par date</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {getEcheances(curYear).sort((a, b) => new Date(a.date) - new Date(b.date)).map((ec, i) => {
              const d      = new Date(ec.date);
              const isPast = d < now;
              const days   = Math.ceil((d - now) / 86400000);
              const urgent = days <= 14 && !isPast;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 8, background: isPast ? 'rgba(255,255,255,.01)' : urgent ? 'rgba(239,68,68,.04)' : 'rgba(255,255,255,.02)', border: `1px solid ${isPast ? 'rgba(255,255,255,.03)' : urgent ? 'rgba(239,68,68,.2)' : BORDER}`, opacity: isPast ? 0.4 : 1 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: ec.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: isPast ? '#666' : '#e5e5e5' }}>{ec.label}</div>
                    <div style={{ fontSize: 10, color: '#666' }}>{ec.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: ec.color }}>{ec.date}</div>
                    <div style={{ fontSize: 9, color: isPast ? '#444' : urgent ? '#f87171' : '#666' }}>
                      {isPast ? '✓ Passé' : urgent ? `⚠ J-${days}` : `Dans ${days}j`}
                    </div>
                  </div>
                  <span style={S.badge(ec.color)}>{ec.type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ TAB HISTORY */}
      {tab === 'history' && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={S.h2}>🗂️ Historique des déclarations ({history.length})</div>
            <button style={S.btn('#60a5fa', true)} onClick={loadHistory}>🔄 Rafraîchir</button>
          </div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#555', fontSize: 11 }}>Aucune déclaration enregistrée</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {['Type','Période','Statut','Date','Actions'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#888', fontSize: 10, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((d, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,.02)` }}>
                    <td style={{ padding: '6px 10px' }}>
                      <span style={S.badge(d.type === 'dmfa' ? '#a78bfa' : d.type === 'dimona' ? '#60a5fa' : '#22c55e')}>
                        {d.type?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '6px 10px', color: '#ccc', fontFamily: 'monospace' }}>{d.period || '—'}</td>
                    <td style={{ padding: '6px 10px' }}>
                      <span style={S.badge(d.status === 'generated' ? '#22c55e' : d.status === 'submitted' ? '#60a5fa' : '#f59e0b')}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ padding: '6px 10px', color: '#666', fontSize: 10 }}>
                      {new Date(d.created_at).toLocaleDateString('fr-BE')}
                    </td>
                    <td style={{ padding: '6px 10px' }}>
                      {d.data?.nb_workers && <span style={{ fontSize: 10, color: '#666' }}>{d.data.nb_workers} trav.</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════ TAB PREVIEW */}
      {tab === 'preview' && preview.content && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={S.h2}>👁️ Aperçu — {preview.type?.toUpperCase()} {preview.filename || ''}</div>
              {preview.ref && <div style={{ fontSize: 10, color: '#666' }}>Réf : {preview.ref} · Statut : {preview.status}</div>}
              {preview.totals && (
                <div style={{ fontSize: 10, color: GOLD, marginTop: 4 }}>
                  Brut {preview.totals.brut_trimestriel?.toFixed(2)} € · ONSS dû {preview.totals.total_du?.toFixed(2)} €
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {preview.filename && (
                <button style={S.btn(GOLD, true)} onClick={() => downloadFile(preview.content, preview.filename)}>
                  📥 Télécharger
                </button>
              )}
              <button style={S.btn('#555', true)} onClick={() => { navigator.clipboard?.writeText(preview.content); }}>
                📋 Copier
              </button>
              <button style={S.btn('#333', true)} onClick={() => { setPreview({ type: null, content: '' }); setTab(preview.type || 'dmfa'); }}>
                ✕
              </button>
            </div>
          </div>
          <pre style={S.pre}>{preview.content}</pre>
          <div style={{ fontSize: 9, color: '#555', marginTop: 8 }}>
            {preview.content.split('\n').length} lignes · {(new Blob([preview.content]).size / 1024).toFixed(1)} KB
          </div>
        </div>
      )}

    </div>
  );
}
