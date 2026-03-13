'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { TX_ONSS_W, TX_ONSS_E, quickPP } from '@/app/lib/helpers';
import { supabase } from '@/app/lib/supabase';
import { authFetch } from '@/app/lib/auth-fetch';

// ═══════════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Connecteurs Comptables BOB / WinBooks
// BOB50 (CSV) · BOB360 (XML) · WinBooks Connect (CSV) · WinBooks Classic
// Import · Export enrichi · Mapping PCMN personnalisable par client
// ═══════════════════════════════════════════════════════════════════════════

const GOLD = '#c6a34e';
const GOLD_BG = 'rgba(198,163,78,';
const DARK = '#090c16';
const CARD = 'rgba(255,255,255,0.025)';
const BORDER = 'rgba(255,255,255,0.07)';

const S = {
  wrap:    { color: '#e8e6e0', fontFamily: 'inherit', padding: 24 },
  card:    { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 12 },
  h2:      { fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 3, margin: 0 },
  sub:     { fontSize: 10, color: '#666', marginTop: 2, marginBottom: 0 },
  label:   { fontSize: 10, color: '#888', display: 'block', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' },
  input:   { width: '100%', padding: '8px 11px', background: DARK, border: '1px solid rgba(139,115,60,.2)', borderRadius: 7, color: '#e5e5e5', fontSize: 11, fontFamily: 'inherit', boxSizing: 'border-box' },
  btn:     (c = GOLD, dis = false, sm = false) => ({ padding: sm ? '6px 12px' : '9px 18px', borderRadius: 7, border: 'none', background: dis ? 'rgba(255,255,255,0.04)' : c === GOLD ? GOLD_BG + '0.9)' : c, color: dis ? '#555' : c === GOLD ? '#0c0b09' : '#fff', fontSize: sm ? 11 : 12, fontWeight: 700, cursor: dis ? 'not-allowed' : 'pointer', opacity: dis ? 0.5 : 1, fontFamily: 'inherit', transition: 'all .15s' }),
  tab:     (active) => ({ padding: '7px 14px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: active ? GOLD_BG + '0.12)' : 'rgba(255,255,255,.03)', color: active ? GOLD : '#888', fontFamily: 'inherit', transition: 'all .15s' }),
  badge:   (c) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: c + '20', color: c, border: `1px solid ${c}40` }),
  kpi:     (c) => ({ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: `1px solid ${c}25`, textAlign: 'center' }),
  grid2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  grid3:   { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  grid4:   { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 },
};

// ── Comptes PCMN par défaut (Plan Comptable Minimum Normalisé Belge) ──────
const DEFAULT_PCMN = {
  brut:          '620000',
  onssE:         '621000',
  onssW:         '453000',
  pp:            '453100',
  net:           '455000',
  cheqRepas:     '740000',
  fraisDep:      '612500',
  provision:     '460000',
  maladieGM:     '620500',
  peculeVac:     '622000',
  primeFin:      '623000',
  avantNature:   '741000',
};
const PCMN_LABELS = {
  brut:        'Rémunérations brutes',
  onssE:       'ONSS patronal',
  onssW:       'ONSS travailleur',
  pp:          'Précompte professionnel',
  net:         'Net à payer',
  cheqRepas:   'Chèques-repas (patronal)',
  fraisDep:    'Frais de déplacement',
  provision:   'Provisions sociales',
  maladieGM:   'Assurance groupe / maladie',
  peculeVac:   'Pécule de vacances',
  primeFin:    "Prime de fin d'année",
  avantNature: 'Avantages en nature',
};

// ── Formats disponibles ────────────────────────────────────────────────────
const FORMATS = [
  { id: 'bob50',      name: 'BOB 50',             icon: '📘', ext: '.csv', color: '#3b82f6', desc: 'CSV BOB 50 / Sage BOB 50 (journal GL)' },
  { id: 'bob360',     name: 'BOB 360',             icon: '📗', ext: '.xml', color: '#22c55e', desc: 'XML BOB 360 / Exact BOB (format structuré)' },
  { id: 'wb_connect', name: 'WinBooks Connect',    icon: '📙', ext: '.txt', color: '#f59e0b', desc: 'TXT tabulation WinBooks Connect (cloud)' },
  { id: 'wb_classic', name: 'WinBooks Classic',    icon: '📒', ext: '.dbf.csv', color: '#a78bfa', desc: 'CSV compatible DBF WinBooks Classic local' },
];

// ── Générateurs ──────────────────────────────────────────────────────────
function genBOB50(lines, pcmn, period, co) {
  const { month, year } = period;
  const isoDate = `${year}-${String(month).padStart(2,'0')}-28`;
  const docNr = `SAL${String(month).padStart(2,'0')}${year}`;
  const totals = computeTotalsFromLines(lines);
  const rows = [
    ['JOURNAL', 'YEAR', 'MONTH', 'DOCNR', 'DOCTYPE', 'DTEFIN', 'ACCOUNT', 'COMMENT', 'AMOUNTD', 'AMOUNTC', 'VATCODE', 'MATCHING'].join(';'),
    `SAL;${year};${month};${docNr};N;${isoDate};${pcmn.brut};Rémunérations brutes;${totals.brut.toFixed(2)};0;;`,
    `SAL;${year};${month};${docNr};N;${isoDate};${pcmn.onssE};ONSS patronal;${totals.onssE.toFixed(2)};0;;`,
    `SAL;${year};${month};${docNr};N;${isoDate};${pcmn.onssW};ONSS travailleur;0;${totals.onssW.toFixed(2)};;`,
    `SAL;${year};${month};${docNr};N;${isoDate};${pcmn.pp};Précompte professionnel;0;${totals.pp.toFixed(2)};;`,
    `SAL;${year};${month};${docNr};N;${isoDate};${pcmn.net};Net à payer;0;${totals.net.toFixed(2)};;`,
  ];
  if (totals.cheqRepas > 0) rows.push(`SAL;${year};${month};${docNr};N;${isoDate};${pcmn.cheqRepas};Chèques-repas;${totals.cheqRepas.toFixed(2)};0;;`);
  if (totals.fraisDep > 0)  rows.push(`SAL;${year};${month};${docNr};N;${isoDate};${pcmn.fraisDep};Frais déplacement;${totals.fraisDep.toFixed(2)};0;;`);
  // Lignes détail par employé
  lines.forEach(l => {
    rows.push(`SAL;${year};${month};${docNr};A;${isoDate};${pcmn.brut};${l.name} - Brut;${l.brut.toFixed(2)};0;;${l.niss||''}`);
  });
  return rows.join('\r\n');
}

function genBOB360(lines, pcmn, period, co) {
  const { month, year } = period;
  const isoDate = `${year}-${String(month).padStart(2,'0')}-28`;
  const docNr = `SAL${String(month).padStart(2,'0')}${year}`;
  const totals = computeTotalsFromLines(lines);
  const mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const periodeStr = `${mois[month-1]} ${year}`;
  const txns = [
    `    <Transaction account="${pcmn.brut}" label="Rémunérations brutes" debit="${totals.brut.toFixed(2)}" credit="0" />`,
    `    <Transaction account="${pcmn.onssE}" label="ONSS patronal" debit="${totals.onssE.toFixed(2)}" credit="0" />`,
    `    <Transaction account="${pcmn.onssW}" label="ONSS travailleur" debit="0" credit="${totals.onssW.toFixed(2)}" />`,
    `    <Transaction account="${pcmn.pp}" label="Précompte professionnel" debit="0" credit="${totals.pp.toFixed(2)}" />`,
    `    <Transaction account="${pcmn.net}" label="Net à payer" debit="0" credit="${totals.net.toFixed(2)}" />`,
  ];
  if (totals.cheqRepas > 0) txns.push(`    <Transaction account="${pcmn.cheqRepas}" label="Chèques-repas" debit="${totals.cheqRepas.toFixed(2)}" credit="0" />`);
  lines.forEach(l => {
    txns.push(`    <DetailLine account="${pcmn.brut}" employee="${l.name}" niss="${l.niss||''}" debit="${l.brut.toFixed(2)}" credit="0" />`);
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- BOB 360 Export — Aureus Social Pro — ${periodeStr} -->
<BOBDocument version="360" exportDate="${new Date().toISOString()}" software="AureusSocialPro">
  <Company vat="${co.vat||'BE1028230781'}" name="${co.name||'Aureus IA SPRL'}" />
  <Journal code="SAL" label="Salaires ${periodeStr}" docNr="${docNr}" date="${isoDate}">
${txns.join('\n')}
  </Journal>
  <Totals>
    <Total key="brut" amount="${totals.brut.toFixed(2)}" />
    <Total key="onssE" amount="${totals.onssE.toFixed(2)}" />
    <Total key="onssW" amount="${totals.onssW.toFixed(2)}" />
    <Total key="pp" amount="${totals.pp.toFixed(2)}" />
    <Total key="net" amount="${totals.net.toFixed(2)}" />
  </Totals>
</BOBDocument>`;
}

function genWinBooksConnect(lines, pcmn, period, co) {
  const { month, year } = period;
  const isoDate = `${year}-${String(month).padStart(2,'0')}-28`;
  const docNr = `SAL${year}${String(month).padStart(2,'0')}001`;
  const periodStr = String(month).padStart(2,'0');
  const totals = computeTotalsFromLines(lines);
  const hdr = 'DBKCODE\tDOCNUMBER\tDOCORDER\tOPCODE\tACCOUNTGL\tACCOUNTRP\tBOOKYEAR\tPERIOD\tDATE\tCOMMENT\tAMOUNTEUR\tCURRCODE\n';
  const rows = [
    `SAL\t${docNr}\t1\t0\t${pcmn.brut}\t\t${year}\t${periodStr}\t${isoDate}\tRémunérations brutes\t${totals.brut.toFixed(2)}\tEUR`,
    `SAL\t${docNr}\t2\t0\t${pcmn.onssE}\t\t${year}\t${periodStr}\t${isoDate}\tONSS patronal\t${totals.onssE.toFixed(2)}\tEUR`,
    `SAL\t${docNr}\t3\t0\t${pcmn.onssW}\t\t${year}\t${periodStr}\t${isoDate}\tONSS travailleur\t${(-totals.onssW).toFixed(2)}\tEUR`,
    `SAL\t${docNr}\t4\t0\t${pcmn.pp}\t\t${year}\t${periodStr}\t${isoDate}\tPrécompte prof.\t${(-totals.pp).toFixed(2)}\tEUR`,
    `SAL\t${docNr}\t5\t0\t${pcmn.net}\t\t${year}\t${periodStr}\t${isoDate}\tNet à payer\t${(-totals.net).toFixed(2)}\tEUR`,
  ];
  if (totals.cheqRepas > 0) rows.push(`SAL\t${docNr}\t6\t0\t${pcmn.cheqRepas}\t\t${year}\t${periodStr}\t${isoDate}\tChèques-repas\t${totals.cheqRepas.toFixed(2)}\tEUR`);
  let seq = rows.length + 1;
  lines.forEach(l => {
    rows.push(`SAL\t${docNr}\t${seq++}\tD\t${pcmn.brut}\t${l.niss||''}\t${year}\t${periodStr}\t${isoDate}\t${l.name}\t${l.brut.toFixed(2)}\tEUR`);
  });
  return hdr + rows.join('\r\n');
}

function genWinBooksClassic(lines, pcmn, period, co) {
  const { month, year } = period;
  const isoDate = `${year}-${String(month).padStart(2,'0')}-28`;
  const docNr = `SAL${String(month).padStart(2,'0')}${year}`;
  const totals = computeTotalsFromLines(lines);
  const rows = [
    ['JOURNAL', 'DOCNR', 'LIGNE', 'COMPTE', 'DATE', 'LIBELLE', 'DEBIT', 'CREDIT', 'DEVISECODE', 'PERIODE', 'NISS'].join(','),
    `SAL,${docNr},1,${pcmn.brut},${isoDate},Rémunérations brutes,${totals.brut.toFixed(2)},0,EUR,${month}/${year},`,
    `SAL,${docNr},2,${pcmn.onssE},${isoDate},ONSS patronal,${totals.onssE.toFixed(2)},0,EUR,${month}/${year},`,
    `SAL,${docNr},3,${pcmn.onssW},${isoDate},ONSS travailleur,0,${totals.onssW.toFixed(2)},EUR,${month}/${year},`,
    `SAL,${docNr},4,${pcmn.pp},${isoDate},Précompte prof.,0,${totals.pp.toFixed(2)},EUR,${month}/${year},`,
    `SAL,${docNr},5,${pcmn.net},${isoDate},Net à payer,0,${totals.net.toFixed(2)},EUR,${month}/${year},`,
  ];
  if (totals.cheqRepas > 0) rows.push(`SAL,${docNr},6,${pcmn.cheqRepas},${isoDate},Chèques-repas,${totals.cheqRepas.toFixed(2)},0,EUR,${month}/${year},`);
  let seq = rows.length;
  lines.forEach(l => {
    rows.push(`SAL,${docNr},${seq++},${pcmn.brut},${isoDate},${l.name},${l.brut.toFixed(2)},0,EUR,${month}/${year},${l.niss||''}`);
  });
  return '\uFEFF' + rows.join('\r\n'); // UTF-8 BOM pour Excel/WinBooks
}

// ── Utilitaires ────────────────────────────────────────────────────────────
function computeTotalsFromLines(lines) {
  const brut    = lines.reduce((a, l) => a + l.brut, 0);
  const onssW   = lines.reduce((a, l) => a + l.onssW, 0);
  const onssE   = lines.reduce((a, l) => a + l.onssE, 0);
  const pp      = lines.reduce((a, l) => a + l.pp, 0);
  const net     = lines.reduce((a, l) => a + l.net, 0);
  const cheqRepas = lines.reduce((a, l) => a + (l.cheqRepas || 0), 0);
  const fraisDep  = lines.reduce((a, l) => a + (l.fraisDep || 0), 0);
  return { brut, onssW, onssE, pp, net, cheqRepas, fraisDep };
}

function buildLines(emps) {
  return emps.map(e => {
    const brut   = +(e.monthlySalary || e.gross || e.brut || 0);
    const onssW  = brut * TX_ONSS_W;
    const onssE  = brut * TX_ONSS_E;
    const pp     = quickPP ? quickPP(brut) : brut * 0.2672;
    const net    = brut - onssW - pp;
    return {
      name:      `${e.first || e.fn || ''} ${e.last || e.ln || ''}`.trim() || 'Employé',
      niss:      e.niss || e.nationalNumber || '',
      brut, onssW, onssE, pp, net,
      cheqRepas: +(e.cheqRepas || 0),
      fraisDep:  +(e.fraisDeplacement || 0),
    };
  });
}

function downloadFile(content, filename, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
}

// ── Parsers import ─────────────────────────────────────────────────────────
function parseBOB50Import(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('JOURNAL'));
  return lines.map(l => {
    const parts = l.split(';');
    return { journal: parts[0], year: parts[1], month: parts[2], docNr: parts[3], account: parts[6], label: parts[7], debit: parseFloat(parts[8]) || 0, credit: parseFloat(parts[9]) || 0 };
  }).filter(r => r.account);
}

function parseWinBooksImport(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('DBKCODE'));
  return lines.map(l => {
    const parts = l.split('\t');
    return { journal: parts[0], docNr: parts[1], account: parts[4], date: parts[8], label: parts[9], amount: parseFloat(parts[10]) || 0, currency: parts[11] };
  }).filter(r => r.account);
}

// ── Composant principal ────────────────────────────────────────────────────
export default function ConnecteursCompta({ s }) {
  const emps   = (s?.emps || []).filter(e => e.status === 'active' || !e.status);
  const co     = s?.co || {};
  const clients = s?.clients || [];

  const now = new Date();
  const [tab, setTab]           = useState('export');
  const [format, setFormat]     = useState('bob50');
  const [period, setPeriod]     = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [pcmn, setPcmn]         = useState({ ...DEFAULT_PCMN });
  const [pcmnDirty, setPcmnDirty] = useState(false);
  const [selClient, setSelClient] = useState('all');
  const [status, setStatus]     = useState({});  // { export: 'ok'|'error'|'loading' }
  const [preview, setPreview]   = useState('');
  const [importRows, setImportRows] = useState([]);
  const [importError, setImportError] = useState('');
  const [clientMappings, setClientMappings] = useState({}); // { clientName: { ...pcmn } }
  const fileRef = useRef();

  const moisNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  // ── Chargement fiches_paie réelles depuis Supabase ──────────────────────
  const [sbFiches, setSbFiches] = useState([]);
  const [sbEmps,   setSbEmps]   = useState([]);
  const [exportHistory, setExportHistory] = useState([]);

  const loadSupabaseData = useCallback(async () => {
    if (!supabase) return;
    const yr  = period.year;
    const mo  = String(period.month).padStart(2,'0');
    const start = `${yr}-${mo}-01`;
    const end   = `${yr}-${mo}-31`;
    const [{ data: fp }, { data: ep }, { data: hist }] = await Promise.all([
      supabase.from('fiches_paie').select('*').gte('created_at',start).lte('created_at',end),
      supabase.from('employees').select('id,first,last,niss,monthlySalary,gross,cheqRepas,fraisDeplacement').eq('status','active'),
      supabase.from('export_history').select('*').order('created_at',{ascending:false}).limit(20),
    ]);
    if (fp?.length)  setSbFiches(fp);
    if (ep?.length)  setSbEmps(ep);
    if (hist)        setExportHistory(hist);
  }, [period.year, period.month]);

  const loadMappingFromDB = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from('compta_mapping').select('*').eq('id','default').maybeSingle();
    if (data?.mapping)         setPcmn(m => ({ ...m, ...data.mapping }));
    if (data?.client_mappings) setClientMappings(data.client_mappings);
  }, []);

  useEffect(() => { loadSupabaseData(); loadMappingFromDB(); }, [loadSupabaseData, loadMappingFromDB]);


  // Résoudre les lignes: fiches_paie Supabase (priorité) > props emps
  const activeLines = (() => {
    const sourceEmps = sbEmps.length ? sbEmps : emps;
    if (sbFiches.length) {
      return sbFiches.map(f => {
        const emp = sourceEmps.find(e => e.id === f.employee_id || e.id === f.empId) || {};
        return {
          name:      `${emp.first||''} ${emp.last||''}`.trim() || `Emp.${(f.employee_id||'').slice(0,6)}`,
          niss:      emp.niss || '',
          brut:      f.gross || 0,
          onssW:     f.onssNet || 0,
          onssE:     (f.gross||0) * TX_ONSS_E,
          pp:        f.pp || 0,
          net:       f.net || 0,
          cheqRepas: emp.cheqRepas || 0,
          fraisDep:  emp.fraisDeplacement || 0,
        };
      }).filter(l => l.brut > 0);
    }
    if (selClient === 'all') return buildLines(sourceEmps);
    const clientEmps = (clients.find(c => (c.company?.name || c.name) === selClient)?.emps || []);
    return buildLines(clientEmps.length ? clientEmps : sourceEmps);
  })();

  const totals = computeTotalsFromLines(activeLines);
  const selFormat = FORMATS.find(f => f.id === format);

  // Générer le contenu selon format
  function generateContent() {
    const activePcmn = clientMappings[selClient] || pcmn;
    switch (format) {
      case 'bob50':      return genBOB50(activeLines, activePcmn, period, co);
      case 'bob360':     return genBOB360(activeLines, activePcmn, period, co);
      case 'wb_connect': return genWinBooksConnect(activeLines, activePcmn, period, co);
      case 'wb_classic': return genWinBooksClassic(activeLines, activePcmn, period, co);
      default:           return '';
    }
  }

  function handlePreview() {
    setPreview(generateContent());
    setTab('preview');
  }

  function handleExport() {
    setStatus(s => ({ ...s, export: 'loading' }));
    try {
      const content = generateContent();
      const moisStr = String(period.month).padStart(2,'0');
      const mime = format === 'bob360' ? 'application/xml' : 'text/plain;charset=utf-8';
      downloadFile(content, `Export_${selFormat.name.replace(/\s/g,'_')}_${period.year}${moisStr}${selFormat.ext}`, mime);
      setStatus(s => ({ ...s, export: 'ok' }));
    } catch (e) {
      setStatus(s => ({ ...s, export: 'error' }));
    }
  }

  function handleFileImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const text = ev.target.result;
        let rows = [];
        if (file.name.endsWith('.xml')) {
          setImportError('Import XML BOB360 — parsing XML non supporté dans le navigateur. Convertissez en CSV d\'abord.');
          return;
        } else if (text.includes('\t') && text.includes('DBKCODE')) {
          rows = parseWinBooksImport(text);
        } else if (text.includes(';') && text.includes('JOURNAL')) {
          rows = parseBOB50Import(text);
        } else {
          // CSV générique
          const lines = text.split(/\r?\n/).filter(l => l.trim());
          const hdr = lines[0].split(/[;,\t]/);
          rows = lines.slice(1).map(l => {
            const vals = l.split(/[;,\t]/);
            const obj = {};
            hdr.forEach((h, i) => { obj[h.trim()] = vals[i]?.trim(); });
            return obj;
          });
        }
        setImportRows(rows);
        setTab('import_result');
      } catch (err) {
        setImportError('Erreur de parsing: ' + err.message);
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  async function savePcmnForClient() {
    let newClientMappings = clientMappings;
    if (selClient === 'all') {
      setPcmn({ ...pcmn });
    } else {
      newClientMappings = { ...clientMappings, [selClient]: { ...pcmn } };
      setClientMappings(newClientMappings);
    }
    setPcmnDirty(false);
    setStatus(s => ({ ...s, pcmn: 'loading' }));
    try {
      if (supabase) {
        await supabase.from('compta_mapping').upsert({
          id: 'default', active: true,
          mapping: selClient === 'all' ? pcmn : DEFAULT_PCMN,
          client_mappings: newClientMappings,
          updated_at: new Date().toISOString(),
        });
      }
      setStatus(s => ({ ...s, pcmn: 'ok' }));
    } catch {
      setStatus(s => ({ ...s, pcmn: 'error' }));
    }
    setTimeout(() => setStatus(s => ({ ...s, pcmn: null })), 2500);
  }

  function resetPcmn() {
    setPcmn({ ...DEFAULT_PCMN });
    if (selClient !== 'all') setClientMappings(m => { const n = { ...m }; delete n[selClient]; return n; });
    setPcmnDirty(false);
  }

  function loadClientMapping(clientName) {
    setSelClient(clientName);
    if (clientMappings[clientName]) setPcmn({ ...clientMappings[clientName] });
    else setPcmn({ ...DEFAULT_PCMN });
    setPcmnDirty(false);
  }

  const StatusBadge = ({ id }) => {
    const v = status[id];
    if (!v) return null;
    if (v === 'loading') return <span style={S.badge('#c6a34e')}>⏳ En cours…</span>;
    if (v === 'ok')      return <span style={S.badge('#22c55e')}>✅ OK</span>;
    if (v === 'error')   return <span style={S.badge('#ef4444')}>❌ Erreur</span>;
    return null;
  };

  const TABS = [
    { id: 'export',   label: '📤 Export' },
    { id: 'import',   label: '📥 Import' },
    { id: 'mapping',  label: '🔗 Mapping PCMN' },
    { id: 'preview',  label: '👁️ Aperçu', show: !!preview },
    { id: 'import_result', label: `📋 Import (${importRows.length})`, show: importRows.length > 0 },
  ];

  return (
    <div style={S.wrap}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: '0 0 4px' }}>
            📒 Connecteurs BOB / WinBooks
          </h2>
          <p style={{ fontSize: 11, color: '#666', margin: 0 }}>
            BOB 50 · BOB 360 · WinBooks Connect · WinBooks Classic — Export + Import + Mapping PCMN par client
          </p>
        </div>
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,.02)', borderRadius: 8, padding: 3 }}>
          {TABS.filter(t => t.show !== false).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={S.tab(tab === t.id)}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={S.grid4}>
        {[
          { l: 'Travailleurs actifs', v: emps.length,              c: GOLD,      i: '👥' },
          { l: 'Total brut',          v: `${totals.brut.toFixed(0)} €`, c: '#22c55e', i: '💶' },
          { l: 'Net à payer',         v: `${totals.net.toFixed(0)} €`,  c: '#60a5fa', i: '💳' },
          { l: 'Formats dispo',       v: FORMATS.length,           c: '#a78bfa', i: '🔌' },
        ].map((k, i) => (
          <div key={i} style={S.kpi(k.c)}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{k.i}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: k.c }}>{k.v}</div>
            <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>{k.l}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 16 }} />

      {/* ════════════════════════════════════════════════════════ TAB EXPORT */}
      {tab === 'export' && (
        <>
          {/* Sélection format */}
          <div style={S.card}>
            <div style={S.grid2}>
              {FORMATS.map(fmt => (
                <button key={fmt.id} onClick={() => setFormat(fmt.id)} style={{
                  padding: 14, borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  border: format === fmt.id ? `2px solid ${fmt.color}` : `1px solid ${BORDER}`,
                  background: format === fmt.id ? `${fmt.color}12` : CARD,
                  transition: 'all .15s', width: '100%',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{fmt.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: format === fmt.id ? fmt.color : '#e5e5e5' }}>{fmt.name}</div>
                      <div style={{ fontSize: 9, color: '#666' }}>{fmt.desc}</div>
                      <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>Extension : <span style={{ color: fmt.color }}>{fmt.ext}</span></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Période & Filtre client */}
          <div style={S.card}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={S.label}>Mois</label>
                <select value={period.month} onChange={e => setPeriod(p => ({ ...p, month: +e.target.value }))} style={{ ...S.input, width: 130 }}>
                  {moisNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Année</label>
                <select value={period.year} onChange={e => setPeriod(p => ({ ...p, year: +e.target.value }))} style={{ ...S.input, width: 90 }}>
                  {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {clients.length > 0 && (
                <div>
                  <label style={S.label}>Client</label>
                  <select value={selClient} onChange={e => loadClientMapping(e.target.value)} style={{ ...S.input, width: 180 }}>
                    <option value="all">Tous les clients</option>
                    {clients.map((c, i) => <option key={i} value={c.company?.name || c.name}>{c.company?.name || c.name}</option>)}
                  </select>
                </div>
              )}
              <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, marginTop: 14 }}>
                → {activeLines.length} emp. · Brut {totals.brut.toFixed(2)} € · Net {totals.net.toFixed(2)} €
              </div>
            </div>
          </div>

          {/* Récapitulatif écritures */}
          <div style={S.card}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Écritures générées — {selFormat?.name}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {['Compte', 'Libellé', 'Débit (€)', 'Crédit (€)'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#888', fontSize: 10, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { compte: pcmn.brut,  label: 'Rémunérations brutes',   d: totals.brut,   c: 0 },
                  { compte: pcmn.onssE, label: 'ONSS patronal',           d: totals.onssE,  c: 0 },
                  { compte: pcmn.onssW, label: 'ONSS travailleur',        d: 0, c: totals.onssW },
                  { compte: pcmn.pp,    label: 'Précompte professionnel', d: 0, c: totals.pp },
                  { compte: pcmn.net,   label: 'Net à payer',             d: 0, c: totals.net },
                  ...(totals.cheqRepas > 0 ? [{ compte: pcmn.cheqRepas, label: 'Chèques-repas', d: totals.cheqRepas, c: 0 }] : []),
                  ...(totals.fraisDep  > 0 ? [{ compte: pcmn.fraisDep,  label: 'Frais déplacement', d: totals.fraisDep, c: 0 }] : []),
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,.02)` }}>
                    <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: '#60a5fa', fontSize: 11 }}>{row.compte}</td>
                    <td style={{ padding: '6px 10px', color: '#ccc' }}>{row.label}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', color: row.d > 0 ? '#22c55e' : '#444' }}>{row.d > 0 ? row.d.toFixed(2) : '—'}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', color: row.c > 0 ? '#f87171' : '#444' }}>{row.c > 0 ? row.c.toFixed(2) : '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${BORDER}` }}>
                  <td colSpan={2} style={{ padding: '8px 10px', fontWeight: 700, color: '#888', fontSize: 10 }}>TOTAUX</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#22c55e' }}>{(totals.brut + totals.onssE + (totals.cheqRepas || 0)).toFixed(2)}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#f87171' }}>{(totals.onssW + totals.pp + totals.net).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button style={S.btn()} onClick={handleExport} disabled={!activeLines.length || status.export === 'loading'}>
              📤 Télécharger {selFormat?.name}{selFormat?.ext}
            </button>
            <button style={S.btn('#60a5fa', false, true)} onClick={handlePreview} disabled={!activeLines.length}>
              👁️ Aperçu fichier
            </button>
            <StatusBadge id="export" />
            <span style={{ fontSize: 10, color: '#555' }}>
              → {activeLines.length} lignes détail + 5 écritures GL
            </span>
          </div>

          {/* Guide intégration */}
          <div style={{ ...S.card, marginTop: 16, background: `${GOLD_BG}0.03)`, border: `1px solid ${GOLD_BG}0.12)` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 10 }}>📖 Procédure d'intégration</div>
            <div style={S.grid2}>
              {[
                { t: '📘 BOB 50 / Sage BOB', steps: ["Générer le .csv BOB50","Ouvrir BOB 50 / Sage BOB","Comptabilité → Importation → Journal","Sélectionner le fichier CSV","Vérifier et valider les écritures"] },
                { t: '📗 BOB 360', steps: ["Générer le .xml BOB360","Ouvrir BOB 360 → Transactions","Import XML GL Transactions","Contrôler les comptes mappés","Lettrage et clôture période"] },
                { t: '📙 WinBooks Connect', steps: ["Générer le .txt WinBooks","MyWinBooks → Comptabilité","Importer → Format WinBooks","Sélectionner journal SAL","Valider les écritures salariales"] },
                { t: '📒 WinBooks Classic', steps: ["Générer le .csv Classic","WinBooks → Outils → Import","Choisir format CSV Standard","Mapper les colonnes (auto)","Contrôler et poster"] },
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

      {/* ════════════════════════════════════════════════════════ TAB IMPORT */}
      {tab === 'import' && (
        <>
          <div style={S.card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 4 }}>📥 Import fichier BOB / WinBooks</div>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 16 }}>
              Importer un fichier exporté depuis BOB 50 ou WinBooks pour vérification / réconciliation avec Aureus Social Pro.
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { id: 'bob50_import', label: '📘 BOB 50 CSV', desc: 'Format JOURNAL;YEAR;MONTH…' },
                { id: 'wb_import',    label: '📙 WinBooks TXT', desc: 'Format DBKCODE\\tDOCNUMBER…' },
                { id: 'csv_generic',  label: '📄 CSV Générique', desc: 'Tout fichier CSV/TXT tabulé' },
              ].map(f => (
                <div key={f.id} style={{ ...S.card, padding: 12, flex: 1, minWidth: 160, margin: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#e5e5e5' }}>{f.label}</div>
                  <div style={{ fontSize: 9, color: '#666', margin: '4px 0 8px' }}>{f.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ ...S.label, marginBottom: 8 }}>Sélectionner un fichier à importer</label>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.txt,.xml"
                onChange={handleFileImport}
                style={{ display: 'none' }}
              />
              <button style={S.btn('#60a5fa')} onClick={() => fileRef.current?.click()}>
                📂 Choisir un fichier…
              </button>
              {importError && (
                <div style={{ marginTop: 10, padding: 10, background: 'rgba(239,68,68,.08)', borderRadius: 6, border: '1px solid rgba(239,68,68,.2)', fontSize: 11, color: '#f87171' }}>
                  ⚠️ {importError}
                </div>
              )}
            </div>
          </div>

          <div style={{ ...S.card, background: `${GOLD_BG}0.03)` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 8 }}>ℹ️ Format attendu</div>
            <div style={S.grid2}>
              <div>
                <div style={{ fontSize: 10, color: '#888', marginBottom: 4, fontWeight: 600 }}>BOB 50 CSV :</div>
                <pre style={{ fontSize: 9, color: '#666', background: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 6, overflowX: 'auto' }}>
{`JOURNAL;YEAR;MONTH;DOCNR;DOCTYPE;DTEFIN;ACCOUNT;COMMENT;AMOUNTD;AMOUNTC;VATCODE;MATCHING
SAL;2026;3;SAL032026;N;2026-03-28;620000;Rémunérations;4500.00;0;;`}
                </pre>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#888', marginBottom: 4, fontWeight: 600 }}>WinBooks TXT :</div>
                <pre style={{ fontSize: 9, color: '#666', background: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 6, overflowX: 'auto' }}>
{`DBKCODE\tDOCNUMBER\tDOCORDER\tOPCODE\tACCOUNTGL\t...
SAL\tSAL2026030001\t1\t0\t620000\t...`}
                </pre>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════ TAB IMPORT RESULT */}
      {tab === 'import_result' && importRows.length > 0 && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>
              📋 Résultat import — {importRows.length} lignes
            </div>
            <button style={S.btn('#ef4444', false, true)} onClick={() => { setImportRows([]); setTab('import'); }}>
              🗑️ Effacer
            </button>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead style={{ position: 'sticky', top: 0, background: '#090c16' }}>
                <tr>
                  {Object.keys(importRows[0] || {}).map(k => (
                    <th key={k} style={{ padding: '6px 8px', textAlign: 'left', color: '#888', fontWeight: 600, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: 'rgba(255,255,255,.02)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.01)' }}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} style={{ padding: '5px 8px', color: '#ccc', whiteSpace: 'nowrap' }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════ TAB MAPPING */}
      {tab === 'mapping' && (
        <>
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 3 }}>🔗 Mapping PCMN personnalisé</div>
                <div style={{ fontSize: 10, color: '#666' }}>
                  Définissez les comptes comptables par logiciel et par client.
                  {selClient !== 'all' && <span style={{ color: GOLD }}> → Client : {selClient}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={S.btn('#ef4444', false, true)} onClick={resetPcmn}>↩️ Réinitialiser</button>
                <button style={S.btn(GOLD, false, true)} onClick={savePcmnForClient}>💾 Sauvegarder</button>
                <StatusBadge id="pcmn" />
              </div>
            </div>

            {/* Filtre client */}
            {clients.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Mapping pour client</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => loadClientMapping('all')} style={S.tab(selClient === 'all')}>Défaut (tous)</button>
                  {clients.map((c, i) => {
                    const name = c.company?.name || c.name;
                    const hasCustom = !!clientMappings[name];
                    return (
                      <button key={i} onClick={() => loadClientMapping(name)} style={{ ...S.tab(selClient === name), position: 'relative' }}>
                        {name}
                        {hasCustom && <span style={{ ...S.badge('#22c55e'), marginLeft: 5, fontSize: 8 }}>custom</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comptes */}
            <div style={S.grid2}>
              {Object.entries(PCMN_LABELS).map(([key, label]) => (
                <div key={key}>
                  <label style={S.label}>{label}</label>
                  <input
                    style={S.input}
                    value={pcmn[key] || ''}
                    placeholder={DEFAULT_PCMN[key]}
                    onChange={e => { setPcmn(p => ({ ...p, [key]: e.target.value })); setPcmnDirty(true); }}
                  />
                </div>
              ))}
            </div>

            {pcmnDirty && (
              <div style={{ marginTop: 12, padding: 8, background: `${GOLD_BG}0.06)`, borderRadius: 6, fontSize: 10, color: GOLD }}>
                ⚠️ Modifications non sauvegardées — cliquez "Sauvegarder" pour conserver ce mapping.
              </div>
            )}
          </div>

          {/* Grille comparaison formats */}
          <div style={S.card}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 12 }}>📊 Comptes PCMN par logiciel (référence)</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left', color: '#888', fontWeight: 600 }}>Rubrique</th>
                  {FORMATS.map(f => <th key={f.id} style={{ padding: '6px 10px', textAlign: 'center', color: f.color, fontWeight: 600 }}>{f.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {Object.entries(PCMN_LABELS).map(([key, label]) => (
                  <tr key={key} style={{ borderBottom: 'rgba(255,255,255,.02)' }}>
                    <td style={{ padding: '5px 10px', color: '#ccc' }}>{label}</td>
                    {FORMATS.map(f => (
                      <td key={f.id} style={{ padding: '5px 10px', textAlign: 'center', fontFamily: 'monospace', color: '#60a5fa', fontSize: 10 }}>
                        {pcmn[key] || DEFAULT_PCMN[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: 9, color: '#555', marginTop: 8 }}>
              * Les comptes ci-dessus sont ceux actuellement configurés dans votre mapping. Ils s'appliquent à tous les formats sauf override par client.
            </div>
          </div>

          {/* Résumé mappings clients */}
          {Object.keys(clientMappings).length > 0 && (
            <div style={S.card}>
              <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 10 }}>🗂️ Mappings clients sauvegardés</div>
              {Object.entries(clientMappings).map(([clientName, mapping]) => (
                <div key={clientName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${BORDER}` }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#e5e5e5', fontWeight: 600 }}>{clientName}</span>
                    <span style={{ fontSize: 9, color: '#666', marginLeft: 8 }}>
                      {Object.entries(mapping).filter(([k, v]) => v !== DEFAULT_PCMN[k]).length} compte(s) personnalisé(s)
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={S.btn('#60a5fa', false, true)} onClick={() => loadClientMapping(clientName)}>✏️ Éditer</button>
                    <button style={S.btn('#ef4444', false, true)} onClick={() => setClientMappings(m => { const n = { ...m }; delete n[clientName]; return n; })}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════ TAB PREVIEW */}
      {tab === 'preview' && preview && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>
              👁️ Aperçu — {selFormat?.name}{selFormat?.ext}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={S.btn(GOLD, false, true)} onClick={handleExport}>📤 Télécharger</button>
              <button style={S.btn('#555', false, true)} onClick={() => { setPreview(''); setTab('export'); }}>✕ Fermer</button>
            </div>
          </div>
          <pre style={{
            fontSize: 10, color: '#aaa', background: 'rgba(0,0,0,0.4)', padding: 14,
            borderRadius: 8, overflowX: 'auto', overflowY: 'auto', maxHeight: 500,
            border: `1px solid ${BORDER}`, fontFamily: 'monospace', lineHeight: 1.6,
            whiteSpace: 'pre', userSelect: 'text',
          }}>
            {preview}
          </pre>
          <div style={{ fontSize: 9, color: '#555', marginTop: 8 }}>
            {preview.split('\n').length} lignes · {(new Blob([preview]).size / 1024).toFixed(1)} KB
          </div>
        </div>
      )}

    </div>
  );
}
