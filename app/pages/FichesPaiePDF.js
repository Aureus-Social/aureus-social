'use client';
import { useState, useEffect, useCallback } from 'react';
import { TX_ONSS_W, TX_ONSS_E, quickPP, fmt } from '@/app/lib/helpers';
import { authFetch } from '@/app/lib/auth-fetch';

// ── Helpers ──────────────────────────────────────────────────────────────────
const CR_TRAV = 1.09;
const TX_AT   = 0.01;

function calcNet(emp) {
  const brut    = parseFloat(emp.gross || emp.monthlySalary || emp.brut || 0);
  const regime  = parseFloat(emp.regime || 100) / 100;
  const brutR   = Math.round(brut * regime * 100) / 100;
  const isOuv   = (emp.statut || '').toLowerCase().includes('ouvrier');
  const onssW   = Math.round((isOuv ? brutR * 1.08 : brutR) * TX_ONSS_W * 100) / 100;
  const pp      = quickPP ? quickPP(brutR) : Math.round(brutR * 0.22 * 100) / 100;
  const annB    = brutR * 3;
  let css = 0;
  if (annB > 6570) css = annB <= 8829 ? annB * 0.0764 : annB <= 13635 ? 51.64 + (annB - 8829) * 0.011 : 154.92;
  css = Math.round(css * 100) / 100;
  const crRet   = emp.chequesRepas ? Math.round(CR_TRAV * (emp.chequesRepasJours || 22) * 100) / 100 : 0;
  const frais   = parseFloat(emp.frais || 0);
  return Math.round((brutR - onssW - pp - css + frais - crRet) * 100) / 100;
}

function calcCoutEmpl(emp) {
  const brut   = parseFloat(emp.gross || emp.monthlySalary || emp.brut || 0);
  const regime = parseFloat(emp.regime || 100) / 100;
  const brutR  = Math.round(brut * regime * 100) / 100;
  const onssE  = Math.round(brutR * TX_ONSS_E * 100) / 100;
  const atE    = Math.round(brutR * TX_AT * 100) / 100;
  const crPat  = emp.chequesRepas ? Math.round((parseFloat(emp.chequesRepasVal || 8) - CR_TRAV) * (emp.chequesRepasJours || 22) * 100) / 100 : 0;
  return Math.round((brutR + onssE + atE + crPat) * 100) / 100;
}

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

// ── Styles ───────────────────────────────────────────────────────────────────
const gold = '#c6a34e';
const S = {
  card:    { background: 'rgba(198,163,78,.04)', border: '1px solid rgba(198,163,78,.1)', borderRadius: 12, padding: 16, marginBottom: 12 },
  badge:   (c) => ({ padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 600, background: c + '15', color: c }),
  btn:     (primary) => ({
    padding: primary ? '10px 20px' : '8px 16px',
    borderRadius: 8, border: primary ? 'none' : `1px solid ${gold}`,
    background: primary ? `linear-gradient(135deg,${gold},#a8893a)` : 'transparent',
    color: primary ? '#090c16' : gold, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity .2s',
  }),
  input:   { padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(198,163,78,.2)', background: 'rgba(0,0,0,.2)', color: '#e8e6e0', fontSize: 12, fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' },
  label:   { fontSize: 10, color: '#888', display: 'block', marginBottom: 4 },
  kpi:     (c) => ({ padding: '12px 14px', background: 'rgba(198,163,78,.04)', border: '1px solid rgba(198,163,78,.08)', borderRadius: 10, textAlign: 'center' }),
};

function KPI({ l, v, c, sub }) {
  return (
    <div style={S.kpi(c)}>
      <div style={{ fontSize: 9, color: '#5e5c56', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>{l}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: c || gold }}>{v}</div>
      {sub && <div style={{ fontSize: 9, color: '#5e5c56', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { generating: ['⏳', '#eab308', 'En cours'], done: ['✅', '#4ade80', 'Généré'], error: ['❌', '#ef4444', 'Erreur'] };
  const [icon, c, label] = map[status] || ['—', '#888', '—'];
  return <span style={S.badge(c)}>{icon} {label}</span>;
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function FichesPaiePDF({ s, d }) {
  const [tab, setTab]             = useState('generer');
  const [month, setMonth]         = useState(new Date().getMonth() + 1);
  const [year, setYear]           = useState(new Date().getFullYear());
  const [selected, setSelected]   = useState([]);
  const [statuses, setStatuses]   = useState({});
  const [history, setHistory]     = useState([]);
  const [loadingHist, setLoadingHist] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [coOverride, setCoOverride] = useState({ name: '', vat: '', onss: '', address: '' });
  const [coLoaded, setCoLoaded]   = useState(false);
  const [previewEmp, setPreviewEmp] = useState(null);

  // Tous les employés (clients + directs)
  const allEmps = [
    ...(s?.emps || []).map(e => ({ ...e, _src: 'direct' })),
    ...(s?.clients || []).flatMap(c => (c.emps || []).map(e => ({ ...e, _src: c.company?.name || c.id, _co: c.company }))),
  ];
  const co = s?.co || {};

  // Pré-remplir les infos société
  useEffect(() => {
    if (!coLoaded && co?.name) {
      setCoOverride({ name: co.name || '', vat: co.vat || '', onss: co.onss || '', address: co.address || co.adresse || '' });
      setCoLoaded(true);
    }
  }, [co]);

  // Charger historique
  const loadHistory = useCallback(async () => {
    setLoadingHist(true);
    try {
      const r = await authFetch('/api/payroll?limit=50');
      const j = await r.json();
      if (j.data) setHistory(j.data);
    } catch {}
    setLoadingHist(false);
  }, []);

  useEffect(() => { if (tab === 'historique') loadHistory(); }, [tab]);

  // Sélection tous / aucun
  const toggleAll = () => {
    if (selected.length === allEmps.length) setSelected([]);
    else setSelected(allEmps.map(e => e.id));
  };
  const toggleEmp = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  // ── Génération PDF individuelle ──────────────────────────────────────────
  const generateOne = async (emp) => {
    const key = emp.id || (emp.first + emp.last);
    setStatuses(p => ({ ...p, [key]: 'generating' }));
    try {
      const payload = { emp, co: { ...co, ...coOverride }, period: { month, year } };
      const res = await authFetch('/api/payslips/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const isFallback = res.headers.get('X-Fallback') === 'html';
      const ct = res.headers.get('Content-Type') || '';
      if (!isFallback && ct.includes('application/pdf')) {
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url;
        a.download = `fiche-paie_${(emp.first||'')}-${(emp.last||'')}_${MOIS[month-1]}-${year}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Fallback HTML → impression navigateur (Ctrl+P → Enregistrer en PDF)
        const html = await res.text();
        const win = window.open('', '_blank', 'width=960,height=720');
        if (win) { win.document.write(html); win.document.close(); setTimeout(() => { win.focus(); win.print(); }, 900); }
      }
      setStatuses(p => ({ ...p, [key]: 'done' }));
    } catch (err) {
      console.error(err);
      setStatuses(p => ({ ...p, [key]: 'error' }));
    }
  };

  // ── Génération batch ─────────────────────────────────────────────────────
  const generateBatch = async () => {
    const targets = allEmps.filter(e => selected.includes(e.id));
    if (!targets.length) return;
    setGlobalLoading(true);
    for (const emp of targets) await generateOne(emp);
    setGlobalLoading(false);
    loadHistory();
  };

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const totalBrut  = allEmps.reduce((a, e) => a + parseFloat(e.gross || e.monthlySalary || 0), 0);
  const totalNet   = allEmps.reduce((a, e) => a + calcNet(e), 0);
  const totalCout  = allEmps.reduce((a, e) => a + calcCoutEmpl(e), 0);
  const nSelected  = selected.length;

  const years = [2024, 2025, 2026, 2027];

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: gold, margin: '0 0 4px' }}>📄 Fiches de Paie PDF</h2>
        <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
          Conforme Art. 15 loi 12/04/1965 — Barèmes SPF Finances 2026 — {allEmps.length} travailleur{allEmps.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 18 }}>
        <KPI l="Travailleurs" v={allEmps.length} c={gold} />
        <KPI l="Masse brute" v={fmt(totalBrut)} c="#60a5fa" sub="/mois" />
        <KPI l="Total net à payer" v={fmt(totalNet)} c="#4ade80" sub="/mois" />
        <KPI l="Coût employeur total" v={fmt(totalCout)} c="#f87171" sub="/mois" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { v: 'generer', l: '🖨️ Générer' },
          { v: 'apercu', l: '👁️ Aperçu calcul' },
          { v: 'historique', l: '📋 Historique' },
          { v: 'config', l: '⚙️ Config société' },
        ].map(t => (
          <button key={t.v} onClick={() => setTab(t.v)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: tab === t.v ? 600 : 400, fontFamily: 'inherit',
            background: tab === t.v ? 'rgba(198,163,78,.15)' : 'rgba(255,255,255,.03)',
            color: tab === t.v ? gold : '#9e9b93',
          }}>{t.l}</button>
        ))}
      </div>

      {/* ── TAB: GÉNÉRER ─────────────────────────────────────────────────── */}
      {tab === 'generer' && (
        <div>
          {/* Période */}
          <div style={S.card}>
            <div style={{ fontWeight: 600, color: gold, fontSize: 13, marginBottom: 10 }}>Période de paie</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={S.label}>Mois</label>
                <select value={month} onChange={e => setMonth(+e.target.value)} style={{ ...S.input, width: 160 }}>
                  {MOIS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Année</label>
                <select value={year} onChange={e => setYear(+e.target.value)} style={{ ...S.input, width: 100 }}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div style={{ padding: '8px 14px', background: 'rgba(198,163,78,.08)', borderRadius: 8, border: '1px solid rgba(198,163,78,.15)' }}>
                <span style={{ color: gold, fontWeight: 600, fontSize: 13 }}>{MOIS[month - 1]} {year}</span>
              </div>
            </div>
          </div>

          {/* Liste travailleurs */}
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, color: gold, fontSize: 13 }}>
                Travailleurs — {nSelected}/{allEmps.length} sélectionnés
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={toggleAll} style={S.btn(false)}>
                  {selected.length === allEmps.length ? '☐ Désélectionner tout' : '☑ Tout sélectionner'}
                </button>
                <button
                  onClick={generateBatch}
                  disabled={!nSelected || globalLoading}
                  style={{ ...S.btn(true), opacity: (!nSelected || globalLoading) ? 0.4 : 1 }}
                >
                  {globalLoading ? '⏳ Génération...' : `🖨️ Générer ${nSelected || ''} fiche${nSelected > 1 ? 's' : ''}`}
                </button>
              </div>
            </div>

            {allEmps.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#5e5c56' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                <div>Aucun employé trouvé. Créez des employés via <b style={{ color: gold }}>Employés</b>.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(198,163,78,.2)' }}>
                      {['', 'Nom', 'Statut', 'CP', 'Brut', 'Net', 'Coût empl.', 'Action'].map((h, i) => (
                        <th key={i} style={{ padding: '8px 6px', textAlign: i >= 4 ? 'right' : 'left', color: gold, fontWeight: 600, fontSize: 10 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allEmps.map((emp, i) => {
                      const key = emp.id || (emp.first + emp.last);
                      const sel = selected.includes(emp.id);
                      const st  = statuses[key];
                      const net = calcNet(emp);
                      const cout = calcCoutEmpl(emp);
                      const brut = parseFloat(emp.gross || emp.monthlySalary || 0);
                      return (
                        <tr key={key + i} style={{
                          borderBottom: '1px solid rgba(255,255,255,.03)',
                          background: sel ? 'rgba(198,163,78,.04)' : 'transparent',
                          transition: 'background .15s',
                        }}>
                          <td style={{ padding: '8px 6px' }}>
                            <input type="checkbox" checked={sel} onChange={() => toggleEmp(emp.id)}
                              style={{ accentColor: gold, width: 14, height: 14, cursor: 'pointer' }} />
                          </td>
                          <td style={{ padding: '8px 6px' }}>
                            <div style={{ fontWeight: 600, color: '#e8e6e0' }}>
                              {(emp.first || emp.fn || '')} {(emp.last || emp.ln || '')}
                            </div>
                            <div style={{ fontSize: 9, color: '#5e5c56' }}>
                              {emp._src !== 'direct' ? emp._src : 'Direct'} {emp.niss ? `· ${emp.niss}` : ''}
                            </div>
                          </td>
                          <td style={{ padding: '8px 6px' }}>
                            <span style={S.badge(emp.statut?.includes('ouvrier') ? '#fb923c' : '#60a5fa')}>
                              {emp.statut || 'Employé'}
                            </span>
                          </td>
                          <td style={{ padding: '8px 6px', color: '#9e9b93' }}>{emp.cp || '200'}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'right', color: gold, fontWeight: 600 }}>{fmt(brut)}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'right', color: '#4ade80', fontWeight: 600 }}>{fmt(net)}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'right', color: '#f87171' }}>{fmt(cout)}</td>
                          <td style={{ padding: '8px 6px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                              {st && <StatusBadge status={st} />}
                              <button
                                onClick={() => generateOne(emp)}
                                disabled={st === 'generating'}
                                style={{ ...S.btn(true), padding: '5px 12px', fontSize: 10, opacity: st === 'generating' ? 0.5 : 1 }}
                              >
                                {st === 'generating' ? '⏳' : '📥 PDF'}
                              </button>
                              <button
                                onClick={() => { setPreviewEmp(emp); setTab('apercu'); }}
                                style={{ ...S.btn(false), padding: '5px 10px', fontSize: 10 }}
                              >👁️</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: APERÇU ──────────────────────────────────────────────────── */}
      {tab === 'apercu' && (
        <div>
          {/* Sélecteur employé */}
          <div style={S.card}>
            <label style={S.label}>Sélectionner un employé</label>
            <select
              value={previewEmp?.id || ''}
              onChange={e => setPreviewEmp(allEmps.find(emp => emp.id === e.target.value) || null)}
              style={{ ...S.input, width: 300 }}
            >
              <option value="">— Choisir —</option>
              {allEmps.map((e, i) => (
                <option key={e.id || i} value={e.id}>
                  {(e.first || '')} {(e.last || '')} — {fmt(parseFloat(e.gross || e.monthlySalary || 0))} brut
                </option>
              ))}
            </select>
          </div>

          {previewEmp && (() => {
            const emp    = previewEmp;
            const brut   = parseFloat(emp.gross || emp.monthlySalary || emp.brut || 0);
            const regime = parseFloat(emp.regime || 100) / 100;
            const brutR  = Math.round(brut * regime * 100) / 100;
            const isOuv  = (emp.statut || '').toLowerCase().includes('ouvrier');
            const onssBase = isOuv ? brutR * 1.08 : brutR;
            const onssW  = Math.round(onssBase * TX_ONSS_W * 100) / 100;
            const onssE  = Math.round(brutR * TX_ONSS_E * 100) / 100;
            const pp     = quickPP ? quickPP(brutR) : Math.round(brutR * 0.22 * 100) / 100;
            const annB   = brutR * 3;
            let css = 0;
            if (annB > 6570) css = annB <= 8829 ? annB * 0.0764 : annB <= 13635 ? 51.64 + (annB - 8829) * 0.011 : 154.92;
            css = Math.round(css * 100) / 100;
            const crN    = emp.chequesRepasJours || 22;
            const hasCR  = !!(emp.chequesRepas || emp.cr);
            const crRet  = hasCR ? Math.round(CR_TRAV * crN * 100) / 100 : 0;
            const crPat  = hasCR ? Math.round((parseFloat(emp.chequesRepasVal || 8) - CR_TRAV) * crN * 100) / 100 : 0;
            const frais  = parseFloat(emp.frais || 0);
            const atE    = Math.round(brutR * TX_AT * 100) / 100;
            const net    = Math.round((brutR - onssW - pp - css + frais - crRet) * 100) / 100;
            const coutEmpl = Math.round((brutR + onssE + atE + crPat) * 100) / 100;

            const Row = ({ l, v, c, b, sub }) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: b ? '2px solid rgba(198,163,78,.25)' : '1px solid rgba(255,255,255,.04)' }}>
                <span style={{ color: '#e8e6e0', fontSize: 12, fontWeight: b ? 600 : 400 }}>{l}{sub && <span style={{ color: '#5e5c56', fontSize: 10, marginLeft: 6 }}>{sub}</span>}</span>
                <span style={{ color: c || gold, fontWeight: 600, fontSize: 12 }}>{fmt(v)}</span>
              </div>
            );

            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Côté travailleur */}
                <div style={S.card}>
                  <div style={{ fontWeight: 700, color: gold, fontSize: 13, marginBottom: 12 }}>
                    💼 {(emp.first || '')} {(emp.last || '')}
                    <span style={{ fontSize: 9, color: '#5e5c56', marginLeft: 8 }}>Employé</span>
                  </div>
                  <Row l="Salaire brut" v={brut} b />
                  {regime < 1 && <Row l={`Régime ${(regime * 100).toFixed(0)}%`} v={brutR} />}
                  <Row l={`ONSS pers. (${(TX_ONSS_W * 100).toFixed(2)}%)`} v={-onssW} c="#f87171" />
                  <Row l="Rémunération imposable" v={brutR - onssW} c="#60a5fa" />
                  <Row l="Précompte professionnel" v={-pp} c="#f87171" />
                  {css > 0 && <Row l="Cotisation spéciale SS" v={-css} c="#f87171" />}
                  {hasCR && crRet > 0 && <Row l={`Chèques-repas (${crN}j × ${CR_TRAV.toFixed(2)}€)`} v={-crRet} c="#f87171" />}
                  {frais > 0 && <Row l="Frais propres employeur" v={frais} c="#4ade80" />}
                  <div style={{ height: 1, background: 'rgba(74,222,128,.3)', margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 15 }}>NET À PAYER</span>
                    <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 17 }}>{fmt(net)}</span>
                  </div>
                </div>

                {/* Côté employeur */}
                <div style={S.card}>
                  <div style={{ fontWeight: 700, color: '#f87171', fontSize: 13, marginBottom: 12 }}>🏢 Coût Employeur</div>
                  <Row l="Salaire brut" v={brutR} c="#e8e6e0" />
                  <Row l={`ONSS patronal (${(TX_ONSS_E * 100).toFixed(2)}%)`} v={onssE} c="#f87171" />
                  <Row l={`Assurance AT (${(TX_AT * 100).toFixed(0)}%)`} v={atE} c="#f87171" />
                  {hasCR && crPat > 0 && <Row l={`Chèques-repas patronal (${crN}j)`} v={crPat} c="#fb923c" />}
                  <div style={{ height: 1, background: 'rgba(248,113,113,.3)', margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span style={{ color: '#f87171', fontWeight: 700, fontSize: 15 }}>COÛT TOTAL</span>
                    <span style={{ color: '#f87171', fontWeight: 700, fontSize: 17 }}>{fmt(coutEmpl)}</span>
                  </div>
                  <div style={{ padding: '8px 10px', background: 'rgba(198,163,78,.04)', borderRadius: 8, marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: '#5e5c56', marginBottom: 2 }}>Ratio net / coût employeur</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: gold }}>{coutEmpl > 0 ? ((net / coutEmpl) * 100).toFixed(1) : '—'}%</div>
                    <div style={{ height: 4, background: 'rgba(198,163,78,.1)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: coutEmpl > 0 ? (net / coutEmpl * 100) + '%' : '0%', background: 'linear-gradient(90deg,#c6a34e,#4ade80)', borderRadius: 2 }} />
                    </div>
                  </div>
                </div>

                {/* Bouton télécharger */}
                <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <button onClick={() => generateOne(previewEmp)} style={{ ...S.btn(true), padding: '12px 32px', fontSize: 13 }}>
                    📥 Télécharger la fiche PDF — {MOIS[month - 1]} {year}
                  </button>
                  <button onClick={() => { setTab('generer'); }} style={{ ...S.btn(false), padding: '12px 20px', fontSize: 13 }}>
                    ← Retour liste
                  </button>
                </div>
              </div>
            );
          })()}

          {!previewEmp && (
            <div style={{ padding: 40, textAlign: 'center', color: '#5e5c56' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>👆</div>
              <div>Sélectionnez un travailleur pour voir l'aperçu du calcul</div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: HISTORIQUE ──────────────────────────────────────────────── */}
      {tab === 'historique' && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, color: gold, fontSize: 13 }}>Fiches générées</div>
            <button onClick={loadHistory} style={S.btn(false)}>🔄 Rafraîchir</button>
          </div>
          {loadingHist ? (
            <div style={{ textAlign: 'center', color: '#5e5c56', padding: 32 }}>Chargement...</div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#5e5c56', padding: 32 }}>Aucune fiche générée</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(198,163,78,.2)' }}>
                  {['Travailleur', 'Période', 'Brut', 'Net', 'Coût empl.', 'Généré le'].map((h, i) => (
                    <th key={i} style={{ padding: '7px 6px', textAlign: i >= 2 ? 'right' : 'left', color: gold, fontSize: 10, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={row.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                    <td style={{ padding: '6px' }}>{row.employee_name || row.empId || '—'}</td>
                    <td style={{ padding: '6px', color: '#9e9b93' }}>{row.period || '—'}</td>
                    <td style={{ padding: '6px', textAlign: 'right', color: gold }}>{row.brut ? fmt(row.brut) : '—'}</td>
                    <td style={{ padding: '6px', textAlign: 'right', color: '#4ade80' }}>{row.net ? fmt(row.net) : '—'}</td>
                    <td style={{ padding: '6px', textAlign: 'right', color: '#f87171' }}>{row.cout_empl ? fmt(row.cout_empl) : '—'}</td>
                    <td style={{ padding: '6px', color: '#5e5c56' }}>
                      {row.created_at ? new Date(row.created_at).toLocaleDateString('fr-BE') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB: CONFIG ──────────────────────────────────────────────────── */}
      {tab === 'config' && (
        <div style={S.card}>
          <div style={{ fontWeight: 600, color: gold, fontSize: 13, marginBottom: 14 }}>Informations société sur les fiches</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { k: 'name',    l: 'Nom de la société' },
              { k: 'vat',     l: 'Numéro BCE (BE XXXX.XXX.XXX)' },
              { k: 'onss',    l: 'Numéro ONSS employeur' },
              { k: 'address', l: 'Adresse complète' },
            ].map(({ k, l }) => (
              <div key={k}>
                <label style={S.label}>{l}</label>
                <input
                  value={coOverride[k] || ''}
                  onChange={e => setCoOverride(p => ({ ...p, [k]: e.target.value }))}
                  style={S.input}
                  placeholder={co?.[k] || l}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: 12, background: 'rgba(74,222,128,.04)', borderRadius: 8, border: '1px solid rgba(74,222,128,.1)', fontSize: 11, color: '#9e9b93' }}>
            ✅ Ces informations apparaîtront sur toutes les fiches PDF générées. Elles ne modifient pas les données Supabase.
          </div>
        </div>
      )}
    </div>
  );
}
