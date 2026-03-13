'use client';
import { useState, useEffect, useCallback } from 'react';
import { TX_ONSS_W, TX_ONSS_E } from '@/app/lib/helpers';
import { supabase } from '@/app/lib/supabase';
import { authFetch } from '@/app/lib/auth-fetch';

// ═══════════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Export CODA (Coded Statement of Account)
// Format bancaire belge standard — BNB spec v2.6
// Génère fichiers CODA pour : virements salaires, ONSS, PP
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
  tab:   (a) => ({ padding: '7px 16px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: a ? GOLD_BG + '0.12)' : 'rgba(255,255,255,.03)', color: a ? GOLD : '#888', fontFamily: 'inherit', transition: 'all .15s' }),
  badge: (c) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: c + '20', color: c, border: `1px solid ${c}40` }),
  kpi:   (c) => ({ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: `1px solid ${c}25`, textAlign: 'center' }),
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 },
  pre:   { fontSize: 10, color: '#aaa', background: 'rgba(0,0,0,0.4)', padding: 14, borderRadius: 8, overflowX: 'auto', overflowY: 'auto', maxHeight: 420, border: `1px solid ${BORDER}`, fontFamily: 'monospace', lineHeight: 1.6, whiteSpace: 'pre', userSelect: 'text' },
};

// ══════════════════════════════════════════════════════════════════════
// CODA FORMAT SPEC — BNB v2.6 — Lignes de 128 caractères
// Record types:
//   0 = En-tête (header)
//   1 = Solde initial
//   2x = Mouvement (transaction)
//   3x = Information complémentaire
//   4  = Libre
//   8  = Solde final
//   9  = Fin de fichier
// ══════════════════════════════════════════════════════════════════════

function pad(str, len, char = ' ', right = false) {
  const s = String(str || '');
  if (right) return s.slice(0, len).padEnd(len, char);
  return s.slice(0, len).padStart(len, char);
}
function padL(str, len)  { return pad(str, len, ' ', true); }
function padR(num, len)  { return pad(String(Math.round((num || 0) * 100)).replace('-',''), len, '0'); }
function codaDate(d)     { const dt = d ? new Date(d) : new Date(); return pad(dt.getDate(),2,'0') + pad(dt.getMonth()+1,2,'0') + String(dt.getFullYear()).slice(2); }
function iban2bban(iban) { return (iban || '').replace(/\s/g,'').replace(/^BE\d{2}/,'').replace(/-/g,'').padEnd(12,' '); }
function cleanStr(s, len){ return (s || '').replace(/[^A-Za-z0-9 .,\-\/]/g,'').slice(0, len).padEnd(len,' '); }
function bic8(bic)       { return (bic || 'GEBABEBB').replace(/\s/g,'').padEnd(8,' ').slice(0,8); }

/**
 * Génère un fichier CODA complet selon spec BNB v2.6
 * @param {Object} params
 * @param {string} params.iban       IBAN compte donneur d'ordre (ex: BE68 5390 0754 7034)
 * @param {string} params.bic        BIC banque (ex: GEBABEBB)
 * @param {string} params.name       Nom titulaire
 * @param {number} params.soldeInit  Solde initial (en EUR)
 * @param {Array}  params.mouvements Tableau de mouvements
 * @param {string} params.date       Date relevé (ISO)
 * @param {string} params.seq        Numéro séquence fichier (000-999)
 */
function generateCODA({ iban, bic, name, soldeInit = 0, mouvements = [], date, seq = '001' }) {
  const lines = [];
  const d       = codaDate(date);
  const ibanClean = (iban || '').replace(/\s/g,'');
  const bban    = iban2bban(ibanClean);
  const bicStr  = bic8(bic);
  const accNr   = padL(bban, 12);
  const seqStr  = pad(seq, 3, '0');
  const nameStr = cleanStr(name, 26);
  const creDate = codaDate(new Date());

  // ── Record 0 : En-tête ─────────────────────────────────────────────
  // pos 1      : '0'
  // pos 2-6    : date création (JJMMAA)
  // pos 7      : '0' (version)
  // pos 8-14   : numéro BE entreprise (7 chiffres)
  // pos 15-24  : blank
  // pos 25-50  : nom logiciel
  // pos 51-75  : identifiant application
  // pos 76-79  : version logiciel
  // pos 80-128 : blank
  lines.push(
    '0' +
    creDate +
    '0' +
    pad('1028230781', 10, '0') +   // numéro entreprise
    padL('', 10) +
    padL('Aureus Social Pro', 26) +
    padL('AUREUS_CODA_V1', 11) +
    padL('1.0', 4) +
    padL('', 67)
  );

  // ── Record 1 : Identification compte + solde initial ───────────────
  // pos 1      : '1'
  // pos 2-4    : numéro séquence
  // pos 5-16   : numéro compte (bban 12)
  // pos 17     : indicateur monnaie '0'=EUR
  // pos 18-23  : date relevé
  // pos 24-29  : numéro relevé
  // pos 30     : signe solde initial (0=crédit,1=débit)
  // pos 31-45  : solde initial (15 chiffres, 3 décimales)
  // pos 46-63  : nom titulaire (18)
  // pos 64-78  : description compte (15)
  // pos 79-91  : BIC (13)
  // pos 92-128 : réservé
  const signInit = soldeInit >= 0 ? '0' : '1';
  lines.push(
    '1' +
    seqStr +
    accNr +
    '0' +
    d +
    pad('001', 6) +
    signInit +
    padR(Math.abs(soldeInit), 15) +
    cleanStr(name, 18) +
    cleanStr('Salaires', 15) +
    padL(bicStr, 13) +
    padL('', 37)
  );

  // ── Records 2/3 : Mouvements ────────────────────────────────────────
  let seq2 = 1;
  let totalCredit = 0, totalDebit = 0;

  mouvements.forEach((mv) => {
    const isDebit  = mv.amount < 0;
    const amount   = Math.abs(mv.amount);
    const sign     = isDebit ? '1' : '0';
    const mvDate   = codaDate(mv.date || date);
    const valDate  = codaDate(mv.valDate || mv.date || date);
    const seqMv    = pad(seq2, 4, '0');
    const detail   = cleanStr(mv.label || 'Virement', 31);
    const benefName = cleanStr(mv.benefName || '', 16);
    const benefIban = (mv.benefIban || '').replace(/\s/g,'').padEnd(12,' ').slice(0,12);
    const commStr  = cleanStr(mv.communication || mv.structured || '', 31);

    if (isDebit) totalDebit += amount;
    else totalCredit += amount;

    // Record 2.1 — Transaction principale
    lines.push(
      '21' +
      seqMv +
      '0' +                           // numéro article
      sign +
      padR(amount, 15) +
      mvDate +
      valDate +
      padL(mv.txCode || '043', 3) +   // code transaction (043=virement ordinaire)
      padL('', 4) +
      detail +
      padL('', 5) +
      '0' +                           // indicateur
      padL('', 35)
    );

    // Record 3.1 — Communication / coordonnées bénéficiaire
    lines.push(
      '31' +
      seqMv +
      '0' +
      benefIban +
      padL(benefName, 22) +
      padL('', 3) +
      padL(mv.structured ? '101' : '100', 4) + // 101=structuré, 100=libre
      commStr +
      padL('', 19)
    );

    seq2++;
  });

  // ── Record 8 : Solde final ──────────────────────────────────────────
  const soldeFinal = soldeInit + totalCredit - totalDebit;
  const signFinal  = soldeFinal >= 0 ? '0' : '1';
  lines.push(
    '8' +
    seqStr +
    accNr +
    '0' +
    signFinal +
    padR(Math.abs(soldeFinal), 15) +
    padL('', 97)
  );

  // ── Record 9 : Fin de fichier ───────────────────────────────────────
  const totalLines = lines.length + 1;
  lines.push(
    '9' +
    padL('', 3) +
    pad(totalLines, 6, '0') +
    padR(totalDebit, 15) +
    padR(totalCredit, 15) +
    padL('', 88)
  );

  // Vérification longueur lignes (toutes doivent faire 128 chars)
  const normalized = lines.map((l, i) => {
    if (l.length > 128) return l.slice(0, 128);
    return l.padEnd(128, ' ');
  });

  return normalized.join('\r\n');
}

// ── Builders de mouvements depuis fiches de paie ────────────────────────────
function buildSalaryMovements(emps, period, co) {
  const { month, year } = period;
  const d = `${year}-${String(month).padStart(2,'0')}-28`;
  return emps
    .filter(e => +(e.gross || e.monthlySalary || 0) > 0)
    .map(e => {
      const brut   = +(e.gross || e.monthlySalary || 0);
      const onssW  = brut * TX_ONSS_W;
      const pp     = brut * 0.2672;
      const net    = brut - onssW - pp;
      const name   = `${e.first || ''} ${e.last || ''}`.trim();
      const iban   = (e.iban || '').replace(/\s/g,'');
      return {
        amount:        -net, // débit compte employeur
        date:          d,
        valDate:       d,
        txCode:        '043',
        label:         `Sal ${String(month).padStart(2,'0')}/${year} ${name}`.slice(0, 31),
        benefName:     name,
        benefIban:     iban.slice(2, 14), // bban
        communication: `SAL/${year}/${String(month).padStart(2,'0')}/${(e.niss||'').slice(0,11)}`,
        structured:    false,
      };
    });
}

function buildONSSMovement(emps, period, co) {
  const { month, year } = period;
  const d = `${year}-${String(month).padStart(2,'0')}-05`; // 5e du mois suivant
  const totalBrut = emps.reduce((a, e) => a + +(e.gross || e.monthlySalary || 0), 0);
  const onssW  = totalBrut * TX_ONSS_W;
  const onssE  = totalBrut * TX_ONSS_E;
  const total  = onssW + onssE;
  return [{
    amount:        -total,
    date:          d,
    valDate:       d,
    txCode:        '043',
    label:         `ONSS ${String(month).padStart(2,'0')}/${year}`,
    benefName:     'ONSS-RSZ',
    benefIban:     '6798000002',
    communication: `/${year.toString().slice(2)}${String(month).padStart(2,'0')}000000/${co?.onss || '5135771602'}/`,
    structured:    true,
  }];
}

function buildPPMovement(emps, period, co) {
  const { month, year } = period;
  const d = `${year}-${String(month).padStart(2,'0')}-15`;
  const totalBrut = emps.reduce((a, e) => a + +(e.gross || e.monthlySalary || 0), 0);
  const pp = totalBrut * 0.2672;
  return [{
    amount:        -pp,
    date:          d,
    valDate:       d,
    txCode:        '043',
    label:         `PP ${String(month).padStart(2,'0')}/${year}`,
    benefName:     'SPF Finances',
    benefIban:     '6798000000', // compte PP SPF Finances
    communication: `PP/${year}/${String(month).padStart(2,'0')}/${(co?.vat || '').replace(/\D/g,'').slice(2)}`,
    structured:    false,
  }];
}

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
}

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

// ── Composant principal ─────────────────────────────────────────────────────
export default function ExportCODA({ s }) {
  const emps = (s?.emps || []).filter(e => e.status === 'active' || !e.status);
  const co   = s?.co || {};
  const now  = new Date();

  const [tab,     setTab]     = useState('generate');
  const [period,  setPeriod]  = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const [types,   setTypes]   = useState({ salaires: true, onss: true, pp: true });
  const [iban,    setIban]    = useState(co.iban || '');
  const [bic,     setBic]     = useState(co.bic  || 'GEBABEBB');
  const [solde,   setSolde]   = useState('50000');
  const [preview, setPreview] = useState('');
  const [history, setHistory] = useState([]);
  const [status,  setStatus]  = useState({});

  const loadHistory = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('export_history')
      .select('*')
      .eq('format', 'coda')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setHistory(data);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // Calculs récapitulatifs
  const totals = emps.reduce((a, e) => {
    const brut = +(e.gross || e.monthlySalary || 0);
    a.brut  += brut;
    a.net   += brut - brut * TX_ONSS_W - brut * 0.2672;
    a.onss  += brut * (TX_ONSS_W + TX_ONSS_E);
    a.pp    += brut * 0.2672;
    return a;
  }, { brut: 0, net: 0, onss: 0, pp: 0 });

  const totalVirements = (types.salaires ? totals.net : 0) + (types.onss ? totals.onss : 0) + (types.pp ? totals.pp : 0);

  function buildMovements() {
    let mvs = [];
    if (types.salaires) mvs = [...mvs, ...buildSalaryMovements(emps, period, co)];
    if (types.onss)     mvs = [...mvs, ...buildONSSMovement(emps, period, co)];
    if (types.pp)       mvs = [...mvs, ...buildPPMovement(emps, period, co)];
    return mvs;
  }

  function generate(dl = false) {
    setStatus(st => ({ ...st, gen: 'loading' }));
    try {
      const mvs = buildMovements();
      if (!mvs.length) { setStatus(st => ({ ...st, gen: 'error' })); return; }

      const coda = generateCODA({
        iban,
        bic,
        name:      co.name || 'Aureus IA SPRL',
        soldeInit: +(solde || 0),
        mouvements: mvs,
        date:       `${period.year}-${String(period.month).padStart(2,'0')}-28`,
        seq:        String(history.length + 1).padStart(3,'0'),
      });

      const fname = `CODA_${period.year}${String(period.month).padStart(2,'0')}_Salaires.cod`;

      if (dl) {
        downloadFile(coda, fname);
        // Log en DB
        if (supabase) {
          supabase.from('export_history').insert({
            format: 'coda', period: `${period.year}-${String(period.month).padStart(2,'0')}`,
            count: mvs.length, created_at: new Date().toISOString(),
          }).then(() => loadHistory());
        }
      } else {
        setPreview(coda);
        setTab('preview');
      }
      setStatus(st => ({ ...st, gen: 'ok' }));
    } catch (e) {
      setStatus(st => ({ ...st, gen: 'error' }));
      console.error('CODA error:', e);
    }
  }

  const empsWithIBAN   = emps.filter(e => e.iban).length;
  const empsWithoutIBAN = emps.length - empsWithIBAN;

  return (
    <div style={S.wrap}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: '0 0 4px' }}>
          🏦 Export CODA — Relevés bancaires
        </h2>
        <p style={{ fontSize: 11, color: '#666', margin: 0 }}>
          Format BNB v2.6 · Virements salaires · ONSS · Précompte professionnel
        </p>
      </div>

      {/* ── KPIs ── */}
      <div style={S.grid4}>
        {[
          { l: 'Travailleurs',     v: emps.length,               c: GOLD,      i: '👥' },
          { l: 'IBAN renseignés',  v: empsWithIBAN,              c: '#22c55e', i: '💳' },
          { l: 'Net total à virer',v: `${totals.net.toFixed(0)} €`, c: '#60a5fa', i: '💶' },
          { l: 'Total mouvements', v: `${totalVirements.toFixed(0)} €`, c: '#f87171', i: '📤' },
        ].map((k, i) => (
          <div key={i} style={S.kpi(k.c)}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{k.i}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: k.c }}>{k.v}</div>
            <div style={{ fontSize: 9, color: '#555', marginTop: 3 }}>{k.l}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 16 }} />

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,.02)', borderRadius: 8, padding: 3 }}>
        {[
          { id: 'generate', label: '🏦 Générer CODA' },
          { id: 'preview',  label: '👁️ Aperçu', show: !!preview },
          { id: 'history',  label: `📋 Historique (${history.length})` },
          { id: 'guide',    label: '📖 Guide' },
        ].filter(t => t.show !== false).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={S.tab(tab === t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════ TAB GENERATE */}
      {tab === 'generate' && (
        <>
          {/* Config compte donneur d'ordre */}
          <div style={S.card}>
            <div style={S.h2}>🏦 Compte donneur d'ordre</div>
            <div style={{ fontSize: 10, color: '#666', marginBottom: 14 }}>Compte bancaire de l'entreprise depuis lequel les paiements sont effectués</div>
            <div style={S.grid3}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={S.label}>IBAN entreprise</label>
                <input value={iban} onChange={e => setIban(e.target.value)} style={S.input} placeholder="BE68 5390 0754 7034" />
              </div>
              <div>
                <label style={S.label}>BIC</label>
                <input value={bic} onChange={e => setBic(e.target.value)} style={S.input} placeholder="GEBABEBB" />
              </div>
              <div>
                <label style={S.label}>Solde initial (€)</label>
                <input type="number" value={solde} onChange={e => setSolde(e.target.value)} style={S.input} placeholder="50000" />
              </div>
            </div>
          </div>

          {/* Période + types */}
          <div style={S.card}>
            <div style={S.h2}>📅 Période & Types de mouvements</div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
              <div>
                <label style={S.label}>Mois</label>
                <select value={period.month} onChange={e => setPeriod(p => ({ ...p, month: +e.target.value }))} style={{ ...S.input, width: 130 }}>
                  {MOIS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Année</label>
                <select value={period.year} onChange={e => setPeriod(p => ({ ...p, year: +e.target.value }))} style={{ ...S.input, width: 90 }}>
                  {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Sélection types mouvements */}
            <div style={S.grid3}>
              {[
                { key: 'salaires', label: 'Virements salaires nets', amount: totals.net,  color: '#22c55e', icon: '💶', desc: `${emps.length} travailleurs` },
                { key: 'onss',     label: 'Cotisations ONSS',        amount: totals.onss, color: '#a78bfa', icon: '◆',  desc: 'ONSS patronal + travailleur' },
                { key: 'pp',       label: 'Précompte professionnel',  amount: totals.pp,   color: '#f59e0b', icon: '📄', desc: 'SPF Finances' },
              ].map(({ key, label, amount, color, icon, desc }) => (
                <button
                  key={key}
                  onClick={() => setTypes(t => ({ ...t, [key]: !t[key] }))}
                  style={{
                    padding: 14, borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    border: types[key] ? `2px solid ${color}` : `1px solid ${BORDER}`,
                    background: types[key] ? `${color}12` : CARD,
                    transition: 'all .15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <span style={{ ...S.badge(types[key] ? color : '#555'), fontSize: 8 }}>
                      {types[key] ? '✓ INCLUS' : 'EXCLU'}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: types[key] ? color : '#888', marginTop: 6 }}>{label}</div>
                  <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{desc}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: types[key] ? color : '#555', marginTop: 6 }}>
                    {amount.toFixed(2)} €
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Récap mouvements */}
          <div style={S.card}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Récapitulatif — {buildMovements().length} mouvement(s) · Total {totalVirements.toFixed(2)} €
            </div>

            {empsWithoutIBAN > 0 && (
              <div style={{ marginBottom: 12, padding: 10, background: 'rgba(245,158,11,.06)', borderRadius: 6, border: '1px solid rgba(245,158,11,.2)', fontSize: 10, color: '#f59e0b' }}>
                ⚠️ {empsWithoutIBAN} travailleur(s) sans IBAN — virements salaires impossibles pour ces personnes
              </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {['Type','Bénéficiaire','IBAN bénéf.','Montant','Date valeur','Communication'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#888', fontSize: 10, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buildMovements().map((mv, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,.02)` }}>
                    <td style={{ padding: '6px 10px' }}>
                      <span style={S.badge(mv.txCode === '043' && mv.label?.includes('ONSS') ? '#a78bfa' : mv.label?.includes('PP') ? '#f59e0b' : '#22c55e')}>
                        {mv.label?.includes('ONSS') ? 'ONSS' : mv.label?.includes('PP') ? 'PP' : 'SAL'}
                      </span>
                    </td>
                    <td style={{ padding: '6px 10px', color: '#e5e5e5' }}>{mv.benefName || '—'}</td>
                    <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: '#60a5fa', fontSize: 10 }}>{mv.benefIban || '—'}</td>
                    <td style={{ padding: '6px 10px', fontWeight: 700, color: '#f87171' }}>{Math.abs(mv.amount).toFixed(2)} €</td>
                    <td style={{ padding: '6px 10px', color: '#666', fontSize: 10 }}>{mv.valDate}</td>
                    <td style={{ padding: '6px 10px', color: '#888', fontSize: 9, fontFamily: 'monospace' }}>{mv.communication}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${BORDER}` }}>
                  <td colSpan={3} style={{ padding: '8px 10px', fontWeight: 700, color: '#888', fontSize: 10 }}>TOTAL DÉBITÉ</td>
                  <td style={{ padding: '8px 10px', fontWeight: 700, color: '#f87171' }}>{totalVirements.toFixed(2)} €</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>

            <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
              <button style={S.btn()} onClick={() => generate(true)} disabled={!buildMovements().length || !iban}>
                📥 Télécharger CODA .cod
              </button>
              <button style={S.btn('#60a5fa', true)} onClick={() => generate(false)} disabled={!buildMovements().length}>
                👁️ Aperçu
              </button>
              {!iban && <span style={{ fontSize: 10, color: '#f87171' }}>⚠️ IBAN entreprise requis</span>}
              {status.gen === 'ok'      && <span style={S.badge('#22c55e')}>✅ Généré</span>}
              {status.gen === 'error'   && <span style={S.badge('#f87171')}>❌ Erreur</span>}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════ TAB PREVIEW */}
      {tab === 'preview' && preview && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={S.h2}>👁️ Aperçu CODA — {MOIS[period.month-1]} {period.year}</div>
              <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                Format BNB v2.6 · Lignes de 128 caractères · {preview.split('\n').length} lignes
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={S.btn(GOLD, true)} onClick={() => generate(true)}>📥 Télécharger</button>
              <button style={S.btn('#555', true)} onClick={() => { navigator.clipboard?.writeText(preview); }}>📋 Copier</button>
              <button style={S.btn('#333', true)} onClick={() => { setPreview(''); setTab('generate'); }}>✕</button>
            </div>
          </div>

          {/* Légende types de records */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {[
              { c: '0', label: 'En-tête',          color: '#60a5fa' },
              { c: '1', label: 'Solde initial',     color: GOLD },
              { c: '2', label: 'Transaction',       color: '#22c55e' },
              { c: '3', label: 'Communication',     color: '#a78bfa' },
              { c: '8', label: 'Solde final',       color: '#f59e0b' },
              { c: '9', label: 'Fin fichier',       color: '#f87171' },
            ].map(r => (
              <span key={r.c} style={S.badge(r.color)}>Rec {r.c} — {r.label}</span>
            ))}
          </div>

          <pre style={S.pre}>
            {preview.split('\n').map((line, i) => {
              const type = line[0];
              const colors = { '0':'#60a5fa','1':GOLD,'2':'#22c55e','3':'#a78bfa','8':'#f59e0b','9':'#f87171' };
              const c = colors[type] || '#aaa';
              return <span key={i} style={{ color: c, display: 'block' }}>{line}</span>;
            })}
          </pre>
          <div style={{ fontSize: 9, color: '#555', marginTop: 8 }}>
            {preview.split('\n').length} lignes · {(new Blob([preview]).size / 1024).toFixed(1)} KB · Encoding UTF-8
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ TAB HISTORY */}
      {tab === 'history' && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={S.h2}>📋 Historique exports CODA ({history.length})</div>
            <button style={S.btn('#60a5fa', true)} onClick={loadHistory}>🔄</button>
          </div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#555', fontSize: 11 }}>Aucun export enregistré</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {['Période','Mouvements','Date export'].map(h => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#888', fontSize: 10, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,.02)` }}>
                    <td style={{ padding: '6px 10px', fontFamily: 'monospace', color: GOLD }}>{h.period}</td>
                    <td style={{ padding: '6px 10px', color: '#ccc' }}>{h.count}</td>
                    <td style={{ padding: '6px 10px', color: '#666', fontSize: 10 }}>
                      {new Date(h.created_at).toLocaleDateString('fr-BE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════ TAB GUIDE */}
      {tab === 'guide' && (
        <>
          <div style={S.card}>
            <div style={S.h2}>📖 Format CODA — Coded Statement of Account</div>
            <div style={{ fontSize: 11, color: '#9e9b93', lineHeight: 1.8, marginTop: 10 }}>
              CODA est le format standard belge pour l'échange de relevés bancaires électroniques, défini par la BNB (Banque Nationale de Belgique). Chaque fichier .cod contient des enregistrements de longueur fixe (128 caractères).
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                  { rec: '0', label: 'En-tête', desc: 'Identification fichier, date, logiciel émetteur', c: '#60a5fa' },
                  { rec: '1', label: 'Solde initial', desc: 'Compte, IBAN, solde avant transactions', c: GOLD },
                  { rec: '21', label: 'Transaction', desc: 'Montant, date, code transaction, libellé', c: '#22c55e' },
                  { rec: '31', label: 'Communication', desc: 'IBAN bénéficiaire, communication libre/structurée', c: '#a78bfa' },
                  { rec: '8', label: 'Solde final', desc: 'Solde après toutes les transactions', c: '#f59e0b' },
                  { rec: '9', label: 'Fin fichier', desc: 'Total lignes, total débits, total crédits', c: '#f87171' },
                ].map((r, i) => (
                  <div key={i} style={{ background: 'rgba(0,0,0,.2)', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ ...S.badge(r.c), fontSize: 10 }}>Rec {r.rec}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#e5e5e5' }}>{r.label}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#888' }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.h2}>🏦 Intégration bancaire</div>
            <div style={S.grid2}>
              {[
                { t: 'Isabel 6 / Ponto', steps: ['Générer le .cod', 'Ouvrir Isabel 6', 'Paiements → Importer', 'Sélectionner format CODA', 'Valider et signer'] },
                { t: 'MultiLine / SWIFT', steps: ['Générer le .cod', 'MultiLine → Import relevé', 'Format : CODA BNB', 'Rapprochement automatique', 'Export vers comptabilité'] },
                { t: 'Exact Online / BOB', steps: ['Importer .cod dans BOB/Exact', 'Comptabilité → Relevés', 'Import CODA → automatique', 'Lettrage automatique', 'Journalisation écritures'] },
                { t: 'Codes transaction', steps: ['043 = Virement ordinaire', '064 = Virement salaire', '003 = Virement fiscal', '001 = Domiciliation', '060 = Virement SEPA'] },
              ].map((g, i) => (
                <div key={i} style={{ background: 'rgba(0,0,0,.2)', borderRadius: 8, padding: 12 }}>
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

    </div>
  );
}
