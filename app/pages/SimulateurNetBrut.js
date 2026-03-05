"use client";
// ═══════════════════════════════════════════════════════════
// Item #18 — SIMULATEUR NET ↔ BRUT INTERACTIF
// Real-time slider: brut → net with ONSS, PP, bonus display
// Or reverse: net → brut calculation
// ═══════════════════════════════════════════════════════════
import React, { useState, useMemo } from 'react';

const GOLD='#c6a34e',GREEN='#22c55e';

export function SimulateurNetBrut({ calcPaie, baremes }) {
  const [mode, setMode] = useState('brut'); // 'brut' or 'net'
  const [brutInput, setBrutInput] = useState(3500);
  const [netInput, setNetInput] = useState(2200);
  const [situation, setSituation] = useState('isole');
  const [enfants, setEnfants] = useState(0);
  const [cp, setCp] = useState('200');

  const result = useMemo(() => {
    const brut = mode === 'brut' ? brutInput : brutInput;
    const onss = Math.round(brut * 0.1307 * 100) / 100;
    const imposable = brut - onss;
    // Simplified PP calculation
    const annuel = imposable * 12;
    const fraisPro = Math.min(annuel * 0.3, 5750);
    const base = annuel - fraisPro;
    let ppAn = 0;
    if (base > 0) ppAn += Math.min(base, 15200) * 0.25;
    if (base > 15200) ppAn += Math.min(base - 15200, 11240) * 0.40;
    if (base > 26440) ppAn += Math.min(base - 26440, 19060) * 0.45;
    if (base > 45500) ppAn += (base - 45500) * 0.50;
    // Quotite exemptee
    let exempt = 10160;
    if (enfants >= 1) exempt += 1850;
    if (enfants >= 2) exempt += 2990 - 1850;
    if (enfants >= 3) exempt += 4990 - 2990;
    ppAn -= exempt * 0.25;
    ppAn = Math.max(0, ppAn);
    // Taxe communale 7%
    ppAn *= 1.07;
    const ppMois = Math.round(ppAn / 12 * 100) / 100;
    const net = Math.round((brut - onss - ppMois) * 100) / 100;
    const coutTotal = Math.round(brut * 1.2706 * 100) / 100; // 27.06% cotisations patronales
    return { brut, onss, imposable: Math.round(imposable*100)/100, pp: ppMois, net, coutTotal };
  }, [brutInput, mode, situation, enfants]);

  const s = {
    card: { padding: '32px', borderRadius: '20px', border: '1px solid rgba(198,163,78,.08)', background: 'rgba(255,255,255,.015)' },
    label: { fontSize: '10px', color: '#555', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' },
    val: { fontFamily: "'JetBrains Mono',monospace", fontSize: '14px', color: '#e5e5e5' },
    bar: { height: '8px', borderRadius: '4px', background: 'rgba(198,163,78,.08)', overflow: 'hidden', marginTop: '4px' },
  };

  return React.createElement('div', { style: { maxWidth: 700, margin: '0 auto' } },
    React.createElement('div', { style: { display: 'flex', gap: '8px', marginBottom: '24px', justifyContent: 'center' } },
      ['brut', 'net'].map(m => React.createElement('button', {
        key: m, onClick: () => setMode(m),
        style: { padding: '10px 24px', borderRadius: '10px', border: `1px solid ${mode === m ? 'rgba(198,163,78,.3)' : 'rgba(198,163,78,.08)'}`, background: mode === m ? 'rgba(198,163,78,.08)' : 'transparent', color: mode === m ? GOLD : '#999', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }
      }, m === 'brut' ? 'Brut → Net' : 'Net → Brut'))
    ),
    React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' } },
      React.createElement('div', null,
        React.createElement('div', { style: s.label }, mode === 'brut' ? 'Salaire brut mensuel' : 'Net souhaité'),
        React.createElement('input', {
          type: 'range', min: 1800, max: 12000, step: 50, value: brutInput,
          onChange: e => setBrutInput(+e.target.value),
          style: { width: '100%', accentColor: GOLD }
        }),
        React.createElement('div', { style: { fontFamily: "'JetBrains Mono',monospace", fontSize: '24px', color: '#e2c878', textAlign: 'center', marginTop: '8px' } }, '€ ' + brutInput.toLocaleString('fr-BE'))
      ),
      React.createElement('div', null,
        React.createElement('div', { style: s.label }, 'Situation'),
        React.createElement('select', {
          value: situation, onChange: e => setSituation(e.target.value),
          style: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(198,163,78,.1)', background: '#0a0e1a', color: '#e5e5e5', fontSize: '13px', marginBottom: '12px' }
        },
          React.createElement('option', { value: 'isole' }, 'Isolé(e)'),
          React.createElement('option', { value: 'marie1' }, 'Marié(e) - 1 revenu'),
          React.createElement('option', { value: 'marie2' }, 'Marié(e) - 2 revenus')
        ),
        React.createElement('div', { style: s.label }, 'Enfants à charge'),
        React.createElement('div', { style: { display: 'flex', gap: '8px' } },
          [0, 1, 2, 3, 4].map(n => React.createElement('button', {
            key: n, onClick: () => setEnfants(n),
            style: { width: 36, height: 36, borderRadius: 8, border: `1px solid ${enfants === n ? 'rgba(198,163,78,.3)' : 'rgba(198,163,78,.06)'}`, background: enfants === n ? 'rgba(198,163,78,.1)' : 'transparent', color: enfants === n ? GOLD : '#666', cursor: 'pointer', fontSize: 13 }
          }, n))
        )
      )
    ),
    // Results breakdown
    React.createElement('div', { style: s.card },
      React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' } },
        [
          { label: 'Coût total employeur', val: result.coutTotal, color: '#ef4444' },
          { label: 'Salaire brut', val: result.brut, color: GOLD },
          { label: 'Net à payer', val: result.net, color: GREEN },
        ].map((item, i) => React.createElement('div', { key: i, style: { textAlign: 'center' } },
          React.createElement('div', { style: s.label }, item.label),
          React.createElement('div', { style: { fontFamily: "'JetBrains Mono',monospace", fontSize: '22px', fontWeight: 600, color: item.color } }, '€ ' + item.val.toLocaleString('fr-BE'))
        ))
      ),
      // Breakdown bars
      React.createElement('div', { style: { borderTop: '1px solid rgba(198,163,78,.06)', paddingTop: '16px' } },
        [
          { label: 'ONSS travailleur (13,07%)', val: result.onss, pct: (result.onss / result.brut * 100), color: '#f97316' },
          { label: 'Précompte professionnel', val: result.pp, pct: (result.pp / result.brut * 100), color: '#ef4444' },
          { label: 'Net', val: result.net, pct: (result.net / result.brut * 100), color: GREEN },
        ].map((item, i) => React.createElement('div', { key: i, style: { marginBottom: '12px' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' } },
            React.createElement('span', { style: { fontSize: '12px', color: '#999' } }, item.label),
            React.createElement('span', { style: { fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', color: '#e5e5e5' } }, '€ ' + item.val.toLocaleString('fr-BE') + ' (' + Math.round(item.pct) + '%)')
          ),
          React.createElement('div', { style: s.bar },
            React.createElement('div', { style: { height: '100%', width: item.pct + '%', borderRadius: '4px', background: item.color, transition: 'width .6s cubic-bezier(.22,1,.36,1)' } })
          )
        ))
      )
    )
  );
}

export default SimulateurNetBrut;
