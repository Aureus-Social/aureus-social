"use client";
// ═══════════════════════════════════════════════════════════════════
// SIMULATEUR PAIE AVANCÉ — Net↔Brut, Optimisation Package, Comparaison
// Sources: SPF Finances 2026, ONSS Instructions T1/2026
// ═══════════════════════════════════════════════════════════════════
import React, { useState, useMemo } from 'react';

const R2 = v => Math.round(v * 100) / 100;
const fmt = v => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0);
const GOLD = '#c6a34e', GREEN = '#22c55e', RED = '#ef4444', BLUE = '#3b82f6';

// ═══════════════════════════════════════════════════════════════════
// NET → BRUT (Dichotomie haute précision)
// ═══════════════════════════════════════════════════════════════════
export function netToBrut(targetNet, calcPayrollFn, opts = {}) {
  const { familial = 'isole', charges = 0, statut = 'employe', regime = 100 } = opts;
  let lo = targetNet * 0.5, hi = targetNet * 3.5;
  for (let i = 0; i < 120; i++) {
    const mid = (lo + hi) / 2;
    const r = calcPayrollFn(mid, statut, familial, charges, regime, opts);
    if (Math.abs(r.net - targetNet) < 0.005) return { brut: R2(mid), ...r, iterations: i };
    if (r.net > targetNet) hi = mid; else lo = mid;
  }
  const mid = (lo + hi) / 2;
  const r = calcPayrollFn(mid, statut, familial, charges, regime, opts);
  return { brut: R2(mid), ...r, iterations: 120 };
}

// ═══════════════════════════════════════════════════════════════════
// COÛT TOTAL → BRUT (Dichotomie)
// ═══════════════════════════════════════════════════════════════════
export function coûtToBrut(targetCoût, calcPayrollFn, opts = {}) {
  const { familial = 'isole', charges = 0, statut = 'employe', regime = 100 } = opts;
  let lo = targetCoût * 0.3, hi = targetCoût * 0.95;
  for (let i = 0; i < 120; i++) {
    const mid = (lo + hi) / 2;
    const r = calcPayrollFn(mid, statut, familial, charges, regime, opts);
    if (Math.abs(r.coûtTotal - targetCoût) < 0.01) return { brut: R2(mid), ...r, iterations: i };
    if (r.coûtTotal > targetCoût) hi = mid; else lo = mid;
  }
  const mid = (lo + hi) / 2;
  const r = calcPayrollFn(mid, statut, familial, charges, regime, opts);
  return { brut: R2(mid), ...r, iterations: 120 };
}

// ═══════════════════════════════════════════════════════════════════
// PACKAGE OPTIMIZER — Maximiser le net pour un budget donné
// Calcul: salaire brut + chèques-repas + frais propres + éco-chèques
// ═══════════════════════════════════════════════════════════════════
export function optimizePackage(budgetMensuel, calcPayrollFn, LOIS_BELGES, opts = {}) {
  const LB = LOIS_BELGES;
  const joursOuvrables = opts.joursOuvrables || 20;
  const { familial = 'isole', charges = 0, statut = 'employe', regime = 100 } = opts;

  // Scénario 1: Tout en brut
  const sc1 = calcPayrollFn(budgetMensuel / (1 + LB.onss.employeur.total), statut, familial, charges, regime, opts);
  const brutMax = sc1.brut;

  // Scénario 2: Brut + Chèques-repas max
  const crVF = LB.chequesRepas?.valeurFaciale?.max || 8;
  const crE = LB.chequesRepas?.partPatronale?.max || 6.91;
  const crW = LB.chequesRepas?.partTravailleur?.min || 1.09;
  const coûtCR = crE * joursOuvrables; // coût employeur CR
  const netCR = (crVF - crW) * joursOuvrables; // avantage net travailleur
  const budgetAprèsCR = budgetMensuel - coûtCR;
  const sc2 = budgetAprèsCR > 0 ? calcPayrollFn(budgetAprèsCR / (1 + LB.onss.employeur.total), statut, familial, charges, regime, opts) : null;

  // Scénario 3: Brut + CR + Frais propres bureau
  const forfaitBureau = LB.fraisPropres?.forfaitBureau?.max || 148.73;
  const budgetAprèsCRFP = budgetMensuel - coûtCR - forfaitBureau;
  const sc3 = budgetAprèsCRFP > 0 ? calcPayrollFn(budgetAprèsCRFP / (1 + LB.onss.employeur.total), statut, familial, charges, regime, opts) : null;

  // Scénario 4: Brut + CR + FP + Éco-chèques
  const ecoMax = 250 / 12; // max 250€/an = 20.83€/mois
  const budgetAprèsTout = budgetMensuel - coûtCR - forfaitBureau - ecoMax;
  const sc4 = budgetAprèsTout > 0 ? calcPayrollFn(budgetAprèsTout / (1 + LB.onss.employeur.total), statut, familial, charges, regime, opts) : null;

  const scenarios = [
    {
      id: 'brut_pur', label: '100% Salaire brut',
      brut: sc1.brut, net: sc1.net, coût: sc1.coûtTotal,
      avantagesNets: 0, totalNet: sc1.net,
      detail: { brut: sc1.brut, onssP: sc1.onssP, pp: sc1.pp, csss: sc1.csss }
    },
    sc2 ? {
      id: 'brut_cr', label: 'Brut + Chèques-repas',
      brut: sc2.brut, net: sc2.net, coût: R2(sc2.coûtTotal + coûtCR),
      avantagesNets: R2(netCR), totalNet: R2(sc2.net + netCR),
      detail: { brut: sc2.brut, chequesRepas: R2(crVF * joursOuvrables), partTravailleur: R2(crW * joursOuvrables) }
    } : null,
    sc3 ? {
      id: 'brut_cr_fp', label: 'Brut + CR + Frais propres',
      brut: sc3.brut, net: sc3.net, coût: R2(sc3.coûtTotal + coûtCR + forfaitBureau),
      avantagesNets: R2(netCR + forfaitBureau), totalNet: R2(sc3.net + netCR + forfaitBureau),
      detail: { brut: sc3.brut, chequesRepas: R2(crVF * joursOuvrables), fraisPropres: forfaitBureau }
    } : null,
    sc4 ? {
      id: 'optimal', label: 'Package optimal',
      brut: sc4.brut, net: sc4.net, coût: R2(sc4.coûtTotal + coûtCR + forfaitBureau + ecoMax),
      avantagesNets: R2(netCR + forfaitBureau + ecoMax), totalNet: R2(sc4.net + netCR + forfaitBureau + ecoMax),
      detail: { brut: sc4.brut, chequesRepas: R2(crVF * joursOuvrables), fraisPropres: forfaitBureau, ecoChèques: R2(ecoMax) }
    } : null,
  ].filter(Boolean);

  // Tri par total net décroissant
  scenarios.sort((a, b) => b.totalNet - a.totalNet);
  const gain = scenarios.length > 1 ? R2(scenarios[0].totalNet - scenarios[scenarios.length - 1].totalNet) : 0;

  return { budget: budgetMensuel, scenarios, bestScenario: scenarios[0], gain };
}


// ═══════════════════════════════════════════════════════════════════
// COMPOSANT: Simulateur Avancé Brut↔Net
// ═══════════════════════════════════════════════════════════════════
export function PayrollSimulatorAdvanced({ calcPayroll, LOIS_BELGES }) {
  const [tab, setTab] = useState('brut2net');
  const [brut, setBrut] = useState(3500);
  const [targetNet, setTargetNet] = useState(2200);
  const [targetCost, setTargetCost] = useState(5000);
  const [budget, setBudget] = useState(5000);
  const [fam, setFam] = useState('isole');
  const [ch, setCh] = useState(0);
  const [statut, setStatut] = useState('employe');
  const [reg, setReg] = useState(100);

  // ── Brut → Net ──
  const b2n = useMemo(() => calcPayroll(brut, statut, fam, ch, reg), [brut, statut, fam, ch, reg]);

  // ── Net → Brut ──
  const n2b = useMemo(() => netToBrut(targetNet, calcPayroll, { familial: fam, charges: ch, statut, regime: reg }), [targetNet, fam, ch, statut, reg]);

  // ── Coût → Brut/Net ──
  const c2b = useMemo(() => coûtToBrut(targetCost, calcPayroll, { familial: fam, charges: ch, statut, regime: reg }), [targetCost, fam, ch, statut, reg]);

  // ── Package optimizer ──
  const pkg = useMemo(() => optimizePackage(budget, calcPayroll, LOIS_BELGES, { familial: fam, charges: ch, statut, regime: reg }), [budget, fam, ch, statut, reg]);

  // ── Comparison table (5 salary levels) ──
  const comparison = useMemo(() => {
    return [2000, 2500, 3000, 3500, 4000, 5000, 6000, 8000, 10000].map(b => {
      const r = calcPayroll(b, statut, fam, ch, reg);
      return { brut: b, ...r, tauxNet: R2(r.net / b * 100), tauxCoût: R2(r.coûtTotal / b * 100) };
    });
  }, [statut, fam, ch, reg]);

  const cs = { padding: '20px', borderRadius: '14px', border: '1px solid rgba(198,163,78,.06)', background: 'rgba(255,255,255,.01)', marginBottom: 16 };
  const inputS = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)', color: '#e8e6e0', fontSize: 14, fontFamily: 'inherit', outline: 'none' };
  const labelS = { fontSize: 10, color: '#5e5c56', marginBottom: 4, letterSpacing: '0.5px', textTransform: 'uppercase' };
  const tabS = (a) => ({ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: a ? 600 : 400, fontFamily: 'inherit', background: a ? 'rgba(198,163,78,.15)' : 'rgba(255,255,255,.03)', color: a ? GOLD : '#9e9b93', transition: 'all .2s' });

  // Shared controls
  const Controls = () => React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 16 } },
    React.createElement('div', null,
      React.createElement('div', { style: labelS }, 'Statut'),
      React.createElement('select', { value: statut, onChange: e => setStatut(e.target.value), style: inputS },
        React.createElement('option', { value: 'employe' }, 'Employé'),
        React.createElement('option', { value: 'ouvrier' }, 'Ouvrier'),
        React.createElement('option', { value: 'dirigeant' }, 'Dirigeant')
      )
    ),
    React.createElement('div', null,
      React.createElement('div', { style: labelS }, 'Situation'),
      React.createElement('select', { value: fam, onChange: e => setFam(e.target.value), style: inputS },
        React.createElement('option', { value: 'isole' }, 'Isolé'),
        React.createElement('option', { value: 'marie_1rev' }, 'Marié - 1 revenu'),
        React.createElement('option', { value: 'marie_2rev' }, 'Marié - 2 revenus'),
        React.createElement('option', { value: 'cohabitant' }, 'Cohabitant')
      )
    ),
    React.createElement('div', null,
      React.createElement('div', { style: labelS }, 'Personnes à charge'),
      React.createElement('input', { type: 'number', min: 0, max: 10, value: ch, onChange: e => setCh(+e.target.value), style: inputS })
    ),
    React.createElement('div', null,
      React.createElement('div', { style: labelS }, 'Régime (%)'),
      React.createElement('input', { type: 'number', min: 1, max: 100, value: reg, onChange: e => setReg(+e.target.value), style: inputS })
    )
  );

  const ResultRow = ({ label, value, color, bold, separator }) => React.createElement('div', {
    style: { display: 'flex', justifyContent: 'space-between', padding: bold ? '10px 0 4px' : '5px 0',
      borderTop: separator ? '2px solid rgba(198,163,78,.2)' : bold ? '1px solid rgba(255,255,255,.04)' : 'none' }
  },
    React.createElement('span', { style: { color: '#9e9b93', fontSize: 12, fontWeight: bold ? 600 : 400 } }, label),
    React.createElement('span', { style: { color: color || '#e8e6e0', fontSize: bold ? 15 : 12, fontWeight: bold ? 800 : 600, fontFamily: 'monospace' } },
      typeof value === 'number' ? (value >= 0 ? fmt(value) : '- ' + fmt(Math.abs(value))) : value)
  );

  return React.createElement('div', { style: { maxWidth: 1060, margin: '0 auto' } },
    // Header
    React.createElement('div', { style: { marginBottom: 20 } },
      React.createElement('div', { style: { fontSize: 24, fontWeight: 300, color: '#e8e6e0' } }, '⚡ Simulateur Paie Avancé'),
      React.createElement('div', { style: { fontSize: 12, color: '#888', marginTop: 4 } }, 'Brut↔Net · Net→Brut · Coût→Net · Package Optimizer · Comparaison')
    ),

    // Tabs
    React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' } },
      [{ id: 'brut2net', l: '💰 Brut → Net' }, { id: 'net2brut', l: '🔄 Net → Brut' }, { id: 'cost2net', l: '🏢 Coût → Net' },
       { id: 'package', l: '🎁 Package Optimal' }, { id: 'compare', l: '📊 Comparaison' }].map(t =>
        React.createElement('button', { key: t.id, onClick: () => setTab(t.id), style: tabS(tab === t.id) }, t.l)
      )
    ),

    // Controls
    React.createElement(Controls),

    // ══════════════════════════════════
    // TAB: Brut → Net
    // ══════════════════════════════════
    tab === 'brut2net' && React.createElement('div', null,
      React.createElement('div', { style: cs },
        React.createElement('div', { style: labelS }, 'Salaire brut mensuel (€)'),
        React.createElement('input', { type: 'number', value: brut, onChange: e => setBrut(+e.target.value), style: { ...inputS, fontSize: 22, fontWeight: 300, textAlign: 'center', padding: '14px', marginBottom: 16 } }),
        // Quick amounts
        React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' } },
          [2000, 2500, 3000, 3500, 4000, 5000, 6000, 8000].map(v =>
            React.createElement('button', { key: v, onClick: () => setBrut(v),
              style: { padding: '4px 12px', borderRadius: 6, border: brut === v ? '1px solid ' + GOLD + '60' : '1px solid rgba(255,255,255,.06)',
                background: brut === v ? 'rgba(198,163,78,.1)' : 'transparent', color: brut === v ? GOLD : '#888', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }
            }, fmt(v))
          )
        ),
        React.createElement(ResultRow, { label: 'Salaire brut', value: b2n.brut, color: '#e8e6e0' }),
        React.createElement(ResultRow, { label: 'ONSS personnel (13.07%)', value: -b2n.onssP, color: RED }),
        React.createElement(ResultRow, { label: 'Revenu imposable', value: b2n.imposable, color: '#9e9b93' }),
        React.createElement(ResultRow, { label: 'Précompte professionnel', value: -b2n.pp, color: RED }),
        React.createElement(ResultRow, { label: 'CSSS', value: -b2n.csss, color: RED }),
        b2n.bonusEmploi > 0 && React.createElement(ResultRow, { label: 'Bonus à l\'emploi', value: b2n.bonusEmploi, color: GREEN }),
        React.createElement(ResultRow, { label: 'SALAIRE NET', value: b2n.net, color: GREEN, bold: true, separator: true }),
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 } },
          [{ l: 'ONSS patronal', v: b2n.onssE, c: RED }, { l: 'Coût total', v: b2n.coûtTotal, c: GOLD }, { l: 'Taux net/brut', v: b2n.details?.tauxNet + '%', c: BLUE }].map((k, i) =>
            React.createElement('div', { key: i, style: { padding: 12, borderRadius: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', textAlign: 'center' } },
              React.createElement('div', { style: { fontSize: 9, color: '#666', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 } }, k.l),
              React.createElement('div', { style: { fontSize: 18, fontWeight: 300, color: k.c } }, typeof k.v === 'number' ? fmt(k.v) : k.v)
            )
          )
        )
      )
    ),

    // ══════════════════════════════════
    // TAB: Net → Brut
    // ══════════════════════════════════
    tab === 'net2brut' && React.createElement('div', null,
      React.createElement('div', { style: cs },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: 12 } },
          React.createElement('div', { style: { fontSize: 12, color: '#888', marginBottom: 6 } }, 'Quel brut pour obtenir ce net ?'),
          React.createElement('div', { style: labelS }, 'Salaire net souhaité (€)')
        ),
        React.createElement('input', { type: 'number', value: targetNet, onChange: e => setTargetNet(+e.target.value), style: { ...inputS, fontSize: 22, fontWeight: 300, textAlign: 'center', padding: '14px', marginBottom: 16 } }),
        React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' } },
          [1500, 1800, 2000, 2200, 2500, 3000, 3500, 4000].map(v =>
            React.createElement('button', { key: v, onClick: () => setTargetNet(v),
              style: { padding: '4px 12px', borderRadius: 6, border: targetNet === v ? '1px solid ' + GREEN + '60' : '1px solid rgba(255,255,255,.06)',
                background: targetNet === v ? 'rgba(34,197,94,.1)' : 'transparent', color: targetNet === v ? GREEN : '#888', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }
            }, fmt(v))
          )
        ),
        // Arrow
        React.createElement('div', { style: { textAlign: 'center', fontSize: 30, color: GOLD, margin: '12px 0' } }, '⬇'),
        // Result
        React.createElement('div', { style: { padding: 20, borderRadius: 12, background: 'linear-gradient(135deg,rgba(198,163,78,.08),rgba(198,163,78,.02))', border: '1px solid rgba(198,163,78,.15)', textAlign: 'center', marginBottom: 16 } },
          React.createElement('div', { style: { fontSize: 10, color: '#888', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 6 } }, 'Salaire brut nécessaire'),
          React.createElement('div', { style: { fontSize: 32, fontWeight: 300, color: GOLD } }, fmt(n2b.brut) + ' €'),
          React.createElement('div', { style: { fontSize: 11, color: '#888', marginTop: 6 } }, 'Net obtenu : ' + fmt(n2b.net) + ' €  ·  Coût total : ' + fmt(n2b.coûtTotal) + ' €')
        ),
        React.createElement(ResultRow, { label: 'Brut calculé', value: n2b.brut }),
        React.createElement(ResultRow, { label: 'ONSS personnel', value: -n2b.onssP, color: RED }),
        React.createElement(ResultRow, { label: 'Précompte professionnel', value: -n2b.pp, color: RED }),
        React.createElement(ResultRow, { label: 'CSSS', value: -n2b.csss, color: RED }),
        React.createElement(ResultRow, { label: 'Net obtenu', value: n2b.net, color: GREEN, bold: true, separator: true }),
        React.createElement(ResultRow, { label: 'ONSS patronal', value: n2b.onssE, color: RED }),
        React.createElement(ResultRow, { label: 'Coût total employeur', value: n2b.coûtTotal, color: GOLD, bold: true })
      )
    ),

    // ══════════════════════════════════
    // TAB: Coût → Net
    // ══════════════════════════════════
    tab === 'cost2net' && React.createElement('div', null,
      React.createElement('div', { style: cs },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: 12 } },
          React.createElement('div', { style: { fontSize: 12, color: '#888', marginBottom: 6 } }, 'Budget employeur → Combien en net pour le travailleur ?'),
          React.createElement('div', { style: labelS }, 'Budget mensuel employeur (€)')
        ),
        React.createElement('input', { type: 'number', value: targetCost, onChange: e => setTargetCost(+e.target.value), style: { ...inputS, fontSize: 22, fontWeight: 300, textAlign: 'center', padding: '14px', marginBottom: 16 } }),
        React.createElement('div', { style: { display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' } },
          [3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000].map(v =>
            React.createElement('button', { key: v, onClick: () => setTargetCost(v),
              style: { padding: '4px 12px', borderRadius: 6, border: targetCost === v ? '1px solid ' + GOLD + '60' : '1px solid rgba(255,255,255,.06)',
                background: targetCost === v ? 'rgba(198,163,78,.1)' : 'transparent', color: targetCost === v ? GOLD : '#888', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }
            }, fmt(v))
          )
        ),
        React.createElement('div', { style: { textAlign: 'center', fontSize: 30, color: GOLD, margin: '12px 0' } }, '⬇'),
        // Breakdown visual
        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 } },
          [{ l: 'Brut', v: c2b.brut, c: '#e8e6e0', sub: R2(c2b.brut / targetCost * 100) + '% du budget' },
           { l: 'ONSS patronal', v: c2b.onssE, c: RED, sub: R2(c2b.onssE / targetCost * 100) + '% du budget' },
           { l: 'Net travailleur', v: c2b.net, c: GREEN, sub: R2(c2b.net / targetCost * 100) + '% du budget' }
          ].map((k, i) => React.createElement('div', { key: i, style: { padding: 16, borderRadius: 12, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)', textAlign: 'center' } },
            React.createElement('div', { style: { fontSize: 9, color: '#666', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 } }, k.l),
            React.createElement('div', { style: { fontSize: 22, fontWeight: 300, color: k.c } }, fmt(k.v)),
            React.createElement('div', { style: { fontSize: 10, color: '#555', marginTop: 4 } }, k.sub)
          ))
        ),
        // Efficiency bar
        React.createElement('div', { style: { padding: 14, borderRadius: 10, background: 'rgba(198,163,78,.04)', border: '1px solid rgba(198,163,78,.1)' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 } },
            React.createElement('span', { style: { fontSize: 11, color: '#888' } }, 'Efficacité du budget'),
            React.createElement('span', { style: { fontSize: 13, fontWeight: 700, color: GOLD } }, R2(c2b.net / targetCost * 100) + '%')
          ),
          React.createElement('div', { style: { height: 8, borderRadius: 4, background: 'rgba(255,255,255,.06)', overflow: 'hidden' } },
            React.createElement('div', { style: { height: '100%', width: R2(c2b.net / targetCost * 100) + '%', borderRadius: 4, background: 'linear-gradient(90deg,' + GOLD + ',' + GREEN + ')', transition: 'width .5s' } })
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9, color: '#555' } },
            React.createElement('span', null, 'Charges (ONSS+PP+CSSS) : ' + R2((1 - c2b.net / targetCost) * 100) + '%'),
            React.createElement('span', null, 'Net : ' + R2(c2b.net / targetCost * 100) + '%')
          )
        )
      )
    ),

    // ══════════════════════════════════
    // TAB: Package Optimal
    // ══════════════════════════════════
    tab === 'package' && React.createElement('div', null,
      React.createElement('div', { style: cs },
        React.createElement('div', { style: { textAlign: 'center', marginBottom: 12 } },
          React.createElement('div', { style: { fontSize: 12, color: '#888', marginBottom: 6 } }, 'Optimisez le package salarial pour maximiser le net'),
          React.createElement('div', { style: labelS }, 'Budget mensuel employeur (€)')
        ),
        React.createElement('input', { type: 'number', value: budget, onChange: e => setBudget(+e.target.value), style: { ...inputS, fontSize: 22, fontWeight: 300, textAlign: 'center', padding: '14px', marginBottom: 16 } }),
        pkg.gain > 0 && React.createElement('div', { style: { padding: 14, borderRadius: 10, background: 'linear-gradient(135deg,rgba(34,197,94,.08),rgba(34,197,94,.02))', border: '1px solid rgba(34,197,94,.2)', textAlign: 'center', marginBottom: 16 } },
          React.createElement('div', { style: { fontSize: 11, color: GREEN } }, '🎉 Gain potentiel avec package optimisé'),
          React.createElement('div', { style: { fontSize: 28, fontWeight: 300, color: GREEN } }, '+' + fmt(pkg.gain) + ' €/mois net'),
          React.createElement('div', { style: { fontSize: 10, color: '#888', marginTop: 4 } }, 'soit +' + fmt(pkg.gain * 12) + ' €/an pour le même coût employeur')
        ),
        // Scenarios comparison
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
          pkg.scenarios.map((sc, i) => React.createElement('div', { key: sc.id,
            style: { padding: 16, borderRadius: 12, border: i === 0 ? '2px solid rgba(34,197,94,.3)' : '1px solid rgba(255,255,255,.06)',
              background: i === 0 ? 'rgba(34,197,94,.04)' : 'rgba(255,255,255,.01)', position: 'relative' }
          },
            i === 0 && React.createElement('div', { style: { position: 'absolute', top: -10, right: 12, padding: '2px 10px', borderRadius: 6, background: GREEN, color: '#fff', fontSize: 9, fontWeight: 700 } }, '✨ OPTIMAL'),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
              React.createElement('span', { style: { fontSize: 13, fontWeight: 600, color: '#e8e6e0' } }, sc.label),
              React.createElement('span', { style: { fontSize: 18, fontWeight: 300, color: i === 0 ? GREEN : '#e8e6e0' } }, fmt(sc.totalNet) + ' € net')
            ),
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, fontSize: 10 } },
              React.createElement('div', null,
                React.createElement('div', { style: { color: '#555' } }, 'Brut'),
                React.createElement('div', { style: { color: '#e8e6e0', fontWeight: 600 } }, fmt(sc.brut))
              ),
              React.createElement('div', null,
                React.createElement('div', { style: { color: '#555' } }, 'Net salaire'),
                React.createElement('div', { style: { color: '#e8e6e0', fontWeight: 600 } }, fmt(sc.net))
              ),
              React.createElement('div', null,
                React.createElement('div', { style: { color: '#555' } }, 'Avantages nets'),
                React.createElement('div', { style: { color: GREEN, fontWeight: 600 } }, fmt(sc.avantagesNets))
              ),
              React.createElement('div', null,
                React.createElement('div', { style: { color: '#555' } }, 'Coût employeur'),
                React.createElement('div', { style: { color: GOLD, fontWeight: 600 } }, fmt(sc.coût))
              )
            )
          ))
        )
      )
    ),

    // ══════════════════════════════════
    // TAB: Comparaison
    // ══════════════════════════════════
    tab === 'compare' && React.createElement('div', null,
      React.createElement('div', { style: cs },
        React.createElement('div', { style: { fontSize: 11, color: '#555', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 } }, 'Tableau comparatif — 9 niveaux de salaire'),
        React.createElement('table', { style: { width: '100%', borderCollapse: 'collapse' } },
          React.createElement('thead', null, React.createElement('tr', { style: { borderBottom: '1px solid rgba(198,163,78,.1)' } },
            ['Brut', 'ONSS', 'PP', 'CSSS', 'Net', '% Net', 'ONSS Empl.', 'Coût Total', '% Coût'].map((h, i) =>
              React.createElement('th', { key: i, style: { padding: '8px 6px', textAlign: 'right', fontSize: 9, color: GOLD, letterSpacing: '0.5px', textTransform: 'uppercase' } }, h))
          )),
          React.createElement('tbody', null, comparison.map((r, i) =>
            React.createElement('tr', { key: i, style: { borderBottom: '1px solid rgba(255,255,255,.03)', background: r.brut === brut ? 'rgba(198,163,78,.05)' : 'transparent' },
              onMouseEnter: e => { e.currentTarget.style.background = 'rgba(198,163,78,.03)'; },
              onMouseLeave: e => { e.currentTarget.style.background = r.brut === brut ? 'rgba(198,163,78,.05)' : 'transparent'; }
            },
              React.createElement('td', { style: { padding: '7px 6px', fontSize: 12, fontWeight: 600, color: '#e8e6e0', textAlign: 'right', cursor: 'pointer' }, onClick: () => setBrut(r.brut) }, fmt(r.brut)),
              React.createElement('td', { style: { padding: '7px 6px', fontSize: 11, color: RED, textAlign: 'right' } }, fmt(r.onssP)),
              React.createElement('td', { style: { padding: '7px 6px', fontSize: 11, color: RED, textAlign: 'right' } }, fmt(r.pp)),
              React.createElement('td', { style: { padding: '7px 6px', fontSize: 11, color: RED, textAlign: 'right' } }, fmt(r.csss)),
              React.createElement('td', { style: { padding: '7px 6px', fontSize: 12, fontWeight: 700, color: GREEN, textAlign: 'right' } }, fmt(r.net)),
              React.createElement('td', { style: { padding: '7px 6px', fontSize: 10, color: BLUE, textAlign: 'right' } }, r.tauxNet + '%'),
              React.createElement('td', { style: { padding: '7px 6px', fontSize: 11, color: '#f97316', textAlign: 'right' } }, fmt(r.onssE)),
              React.createElement('td', { style: { padding: '7px 6px', fontSize: 12, fontWeight: 600, color: GOLD, textAlign: 'right' } }, fmt(r.coûtTotal)),
              React.createElement('td', { style: { padding: '7px 6px', fontSize: 10, color: '#888', textAlign: 'right' } }, r.tauxCoût + '%')
            )
          ))
        ),
        // Legend
        React.createElement('div', { style: { marginTop: 14, padding: 10, borderRadius: 8, background: 'rgba(96,165,250,.04)', fontSize: 10, color: '#60a5fa', lineHeight: 1.6 } },
          'Barèmes PP 2026 : 26,75% (0–16.310€) · 42,80% (16.310–28.790€) · 48,15% (28.790–49.820€) · 53,50% (49.820€+)  —  ',
          'ONSS : travailleur 13,07% · employeur ~25,07%  —  ',
          statut === 'ouvrier' ? 'Ouvrier : base ONSS = brut × 108%' : 'Employé : base ONSS = brut'
        )
      )
    )
  );
}

export default PayrollSimulatorAdvanced;
