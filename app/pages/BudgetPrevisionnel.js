'use client';
import { useState, useMemo } from 'react';
import { useLang } from '../lib/lang-context';

// ═══════════════════════════════════════════════════════════════════════
// BUDGET PRÉVISIONNEL — Aureus Social Pro
// Projections ARR · Coûts · Rentabilité · Scénarios
// ═══════════════════════════════════════════════════════════════════════

const PLANS = [
  { id: 'starter', label: 'Starter', prix: 15, color: '#60a5fa' },
  { id: 'pro', label: 'Pro', prix: 25, color: '#c6a34e' },
  { id: 'fiduciaire', label: 'Fiduciaire', prix: 38, color: '#a78bfa' },
];

const CHARGES_FIXES = [
  { id: 'vercel', label: 'Vercel (hébergement)', montant: 20 },
  { id: 'supabase', label: 'Supabase', montant: 25 },
  { id: 'claude', label: 'Anthropic Claude API', montant: 30 },
  { id: 'resend', label: 'Resend (emails)', montant: 0 },
  { id: 'backblaze', label: 'Backblaze B2 (backup)', montant: 5 },
  { id: 'isabel', label: 'Isabel 6', montant: 50 },
  { id: 'billit', label: 'Billit Peppol', montant: 20 },
  { id: 'expo', label: 'Expo EAS (FADJR)', montant: 50 },
  { id: 'autres', label: 'Divers (domaines, DNS…)', montant: 15 },
];

const f2 = (v) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0);
const fE = (v) => `${f2(v)} €`;

const S = {
  wrap: { color: '#e8e6e0', fontFamily: 'inherit', padding: 24 },
  card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20, marginBottom: 16 },
  h2: { fontSize: 13, fontWeight: 700, color: '#c6a34e', marginBottom: 4 },
  sub: { fontSize: 11, color: '#666', marginBottom: 16 },
  input: { padding: '7px 10px', background: '#090c16', border: '1px solid rgba(139,115,60,.2)', borderRadius: 6, color: '#e5e5e5', fontSize: 12, fontFamily: 'inherit', width: '80px', textAlign: 'right' },
  kpi: (c = '#c6a34e') => ({ background: 'rgba(255,255,255,0.02)', border: `1px solid ${c}30`, borderRadius: 12, padding: 16, textAlign: 'center' }),
};

export default function BudgetPrevisionnel({ s, d }) {
  const { tText } = useLang();

  // Paramètres clients par plan
  const [clients, setClients] = useState({ starter: 20, pro: 15, fiduciaire: 5 });
  const [empMoy, setEmpMoy] = useState({ starter: 3, pro: 8, fiduciaire: 25 });
  const [croissance, setCroissance] = useState(15); // % mensuel
  const [horizon, setHorizon] = useState(36); // mois
  const [charges, setCharges] = useState(Object.fromEntries(CHARGES_FIXES.map(c => [c.id, c.montant])));
  const [chargeSalaires, setChargeSalaires] = useState(2800); // salaires bruts mensuels
  const [tab, setTab] = useState('projections');

  // ── Calculs ──
  const calcMois = useMemo(() => {
    const rows = [];
    let cStarter = clients.starter, cPro = clients.pro, cFidu = clients.fiduciaire;
    for (let m = 1; m <= horizon; m++) {
      const mrr =
        cStarter * empMoy.starter * PLANS[0].prix +
        cPro * empMoy.pro * PLANS[1].prix +
        cFidu * empMoy.fiduciaire * PLANS[2].prix;
      const chargesFixed = Object.values(charges).reduce((a, b) => a + (+b || 0), 0);
      const profit = mrr - chargesFixed - chargeSalaires;
      rows.push({ m, mrr, cStarter: Math.round(cStarter), cPro: Math.round(cPro), cFidu: Math.round(cFidu), profit, chargesFixed });
      cStarter *= (1 + croissance / 100);
      cPro *= (1 + croissance / 100);
      cFidu *= (1 + croissance / 100);
    }
    return rows;
  }, [clients, empMoy, croissance, horizon, charges, chargeSalaires]);

  const moisActuel = calcMois[0];
  const moisFin = calcMois[calcMois.length - 1];
  const arrFin = moisFin.mrr * 12;
  const moisRentable = calcMois.findIndex(r => r.profit > 0) + 1;
  const totalClients = Math.round(moisFin.cStarter + moisFin.cPro + moisFin.cFidu);
  const totalEmps = Math.round(moisFin.cStarter * empMoy.starter + moisFin.cPro * empMoy.pro + moisFin.cFidu * empMoy.fiduciaire);
  const chargesTotal = Object.values(charges).reduce((a, b) => a + (+b || 0), 0) + chargeSalaires;

  const gold = '#c6a34e';
  const sBtn = (active) => ({ padding: '7px 14px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: active ? 'rgba(198,163,78,0.12)' : 'transparent', color: active ? gold : '#888', fontFamily: 'inherit', transition: 'all .15s' });

  return (
    <div style={S.wrap}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: gold, margin: '0 0 4px' }}>💰 Budget Prévisionnel</h2>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Projections ARR · Rentabilité · Scénarios {horizon} mois</p>
        </div>
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,.02)', borderRadius: 8, padding: 3 }}>
          {[{ id: 'projections', l: '📈 Projections' }, { id: 'parametres', l: '⚙️ Paramètres' }, { id: 'charges', l: '💸 Charges' }, { id: 'tableau', l: '📊 Tableau' }].map(t =>
            <button key={t.id} onClick={() => setTab(t.id)} style={sBtn(tab === t.id)}>{t.l}</button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'MRR Actuel', val: fE(moisActuel.mrr), color: gold },
          { label: `ARR à ${horizon} mois`, val: fE(arrFin), color: arrFin >= 1300000 ? '#22c55e' : gold },
          { label: 'Clients fin période', val: totalClients, color: '#60a5fa' },
          { label: 'Travailleurs gérés', val: f2(totalEmps), color: '#a78bfa' },
          { label: 'Mois rentabilité', val: moisRentable > 0 ? `M${moisRentable}` : 'Dès M1', color: '#22c55e' },
        ].map((k, i) => (
          <div key={i} style={S.kpi(k.color)}>
            <div style={{ fontSize: 10, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Objectif ARR */}
      {(() => {
        const pct = Math.min(100, Math.round((arrFin / 1300000) * 100));
        return (
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#888' }}>Progression vers objectif ARR 1 300 000 €</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 100 ? '#22c55e' : gold }}>{pct}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#22c55e' : `linear-gradient(90deg,#c6a34e,#a07d3e)`, borderRadius: 4, transition: 'width .5s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#888' }}>
              <span>0 €</span><span>ARR projeté : {fE(arrFin)}</span><span>Cible : 1 300 000 €</span>
            </div>
          </div>
        );
      })()}

      {/* Onglet Paramètres */}
      {tab === 'parametres' && (
        <div style={S.card}>
          <div style={S.h2}>⚙️ Paramètres de projection</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Clients initiaux</div>
              {PLANS.map(pl => (
                <div key={pl.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: pl.color, fontWeight: 600 }}>{pl.label} ({pl.prix}€/emp)</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#888' }}>clients:</span>
                    <input type="number" value={clients[pl.id]} onChange={e => setClients(p => ({ ...p, [pl.id]: +e.target.value }))} style={S.input} />
                    <span style={{ fontSize: 11, color: '#888' }}>emp moy:</span>
                    <input type="number" value={empMoy[pl.id]} onChange={e => setEmpMoy(p => ({ ...p, [pl.id]: +e.target.value }))} style={S.input} />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Paramètres croissance</div>
              {[
                { l: 'Croissance mensuelle (%)', v: croissance, set: setCroissance, max: 50 },
                { l: 'Horizon prévision (mois)', v: horizon, set: setHorizon, max: 60 },
                { l: 'Salaires mensuels (€)', v: chargeSalaires, set: setChargeSalaires, max: 20000 },
              ].map((p, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#ccc' }}>{p.l}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: gold }}>{p.v}{i === 0 ? '%' : i === 1 ? ' mois' : ' €'}</span>
                  </div>
                  <input type="range" min={0} max={p.max} value={p.v} onChange={e => p.set(+e.target.value)}
                    style={{ width: '100%', accentColor: gold }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Onglet Charges */}
      {tab === 'charges' && (
        <div style={S.card}>
          <div style={S.h2}>💸 Charges mensuelles fixes</div>
          {CHARGES_FIXES.map(ch => (
            <div key={ch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 12, color: '#ccc' }}>{ch.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="number" value={charges[ch.id]} onChange={e => setCharges(p => ({ ...p, [ch.id]: +e.target.value }))} style={S.input} />
                <span style={{ fontSize: 11, color: '#888' }}>€/mois</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(198,163,78,0.2)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: gold }}>Total charges fixes</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: gold }}>{fE(Object.values(charges).reduce((a, b) => a + (+b || 0), 0))}/mois</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ fontSize: 12, color: '#888' }}>+ Salaires</span>
            <span style={{ fontSize: 12, color: '#888' }}>{fE(chargeSalaires)}/mois</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>TOTAL charges</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>{fE(chargesTotal)}/mois</span>
          </div>
        </div>
      )}

      {/* Onglet Tableau */}
      {tab === 'tableau' && (
        <div style={S.card}>
          <div style={S.h2}>📊 Tableau de projection mois par mois</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Mois', 'Clients', 'MRR', 'Charges', 'Résultat', 'ARR'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Mois' ? 'left' : 'right', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calcMois.filter((_, i) => i === 0 || (i + 1) % 3 === 0).map(row => (
                  <tr key={row.m} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: row.profit > 0 ? 'rgba(34,197,94,0.03)' : 'transparent' }}>
                    <td style={{ padding: '7px 10px', color: gold, fontWeight: 600 }}>M{row.m}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: '#ccc' }}>{row.cStarter + row.cPro + row.cFidu}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: gold, fontWeight: 600 }}>{fE(row.mrr)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: '#ef4444' }}>{fE(row.chargesFixed + chargeSalaires)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: row.profit > 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{fE(row.profit)}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'right', color: '#a78bfa' }}>{fE(row.mrr * 12)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onglet Projections — graphe textuel */}
      {tab === 'projections' && (
        <div style={S.card}>
          <div style={S.h2}>📈 Scénarios sur {horizon} mois</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Conservateur (-50%)', mult: 0.5, color: '#60a5fa' },
              { label: 'Base (paramètres actuels)', mult: 1, color: gold },
              { label: 'Optimiste (+50%)', mult: 1.5, color: '#22c55e' },
            ].map(sc => {
              const arrSc = moisFin.mrr * sc.mult * 12;
              const pct = Math.min(100, Math.round((arrSc / 1300000) * 100));
              return (
                <div key={sc.label} style={{ padding: 16, borderRadius: 10, border: `1px solid ${sc.color}30`, background: `${sc.color}08` }}>
                  <div style={{ fontSize: 11, color: sc.color, fontWeight: 700, marginBottom: 8 }}>{sc.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: sc.color, marginBottom: 4 }}>{fE(arrSc)}</div>
                  <div style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>ARR / an à M{horizon}</div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: sc.color, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>{pct}% de l'objectif 1,3M€</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>Répartition MRR par plan (scénario base)</div>
            {PLANS.map((pl, i) => {
              const mrr = clients[pl.id] * empMoy[pl.id] * pl.prix;
              const pctPl = moisActuel.mrr > 0 ? Math.round((mrr / moisActuel.mrr) * 100) : 0;
              return (
                <div key={pl.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: pl.color, fontWeight: 600 }}>{pl.label} ({clients[pl.id]} clients × {empMoy[pl.id]} emp × {pl.prix}€)</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: pl.color }}>{fE(mrr)}/mois ({pctPl}%)</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ height: '100%', width: `${pctPl}%`, background: pl.color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
