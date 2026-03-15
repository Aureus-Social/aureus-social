'use client'
import { useState, useMemo } from 'react'

export default function CompteIndividuel({ state, dispatch }) {
  const emps = state?.emps || []
  const [selected, setSelected] = useState(null)
  const [annee, setAnnee] = useState(new Date().getFullYear())

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }
  const fmt = (v) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2 }).format(v || 0)

  const emp = emps.find(e => (e.id || e.fn + e.ln) === selected) || emps[0]

  const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

  const lignesMois = useMemo(() => MOIS.map((mois, i) => {
    const brut = parseFloat(emp?.gross || emp?.monthlySalary || 0)
    const onssW = brut * 0.1307
    const pp = brut * 0.22
    const net = brut - onssW - pp
    const onssE = brut * 0.2507
    // Double pécule en mai
    const extraLabel = i === 4 ? '+ Double pécule' : i === 11 ? '' : ''
    const extra = i === 4 ? brut * 0.92 : 0
    return { mois, brut, onssW, pp, net, onssE, extra, extraLabel }
  }), [emp])

  const totaux = {
    brut: lignesMois.reduce((s, l) => s + l.brut + l.extra, 0),
    onssW: lignesMois.reduce((s, l) => s + l.onssW, 0),
    pp: lignesMois.reduce((s, l) => s + l.pp, 0),
    net: lignesMois.reduce((s, l) => s + l.net + l.extra, 0),
    onssE: lignesMois.reduce((s, l) => s + l.onssE, 0),
  }

  return (
    <div style={s}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>📄</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Compte Individuel</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Récapitulatif annuel par travailleur · Cotisations · Fiches de paie</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={selected || ''} onChange={e => setSelected(e.target.value)}
            style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 14px', color: '#f1f5f9', fontSize: 13 }}>
            <option value="">— Sélectionner un travailleur —</option>
            {emps.map(e => {
              const key = e.id || (e.fn || e.first || '') + (e.ln || e.last || '')
              return <option key={key} value={key}>{(e.fn || e.first || '')} {(e.ln || e.last || '')}</option>
            })}
          </select>
          <input type="number" value={annee} onChange={e => setAnnee(e.target.value)}
            style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', fontSize: 13, width: 90 }} />
        </div>
      </div>

      {!emp ? (
        <div style={{ ...card, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
          <div style={{ color: '#6b7280' }}>Aucun travailleur sélectionné. Encodez des employés dans la liste pour générer leur compte individuel.</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Brut annuel', value: `${fmt(totaux.brut)} €`, color: '#f59e0b' },
              { label: 'ONSS travailleur', value: `${fmt(totaux.onssW)} €`, color: '#3b82f6' },
              { label: 'Net annuel', value: `${fmt(totaux.net)} €`, color: '#10b981' },
              { label: 'Coût employeur', value: `${fmt(totaux.brut + totaux.onssE)} €`, color: '#ef4444' },
            ].map(item => (
              <div key={item.label} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>
              📋 {(emp.fn || emp.first || '')} {(emp.ln || emp.last || '')} — Compte individuel {annee}
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#1a1a1a' }}>
                    {['Mois', 'Brut', 'ONSS Trav. (13,07%)', 'Précompte', 'Net', 'ONSS Pat. (25,07%)', 'Coût total'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Mois' ? 'left' : 'right', color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lignesMois.map((l, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1a1a1a', background: l.extra > 0 ? '#0d1a0d' : 'transparent' }}>
                      <td style={{ padding: '7px 10px', fontWeight: 600 }}>
                        {l.mois}
                        {l.extraLabel && <span style={{ fontSize: 10, color: '#10b981', marginLeft: 6 }}>{l.extraLabel}</span>}
                      </td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', color: l.extra > 0 ? '#10b981' : '#f1f5f9', fontWeight: l.extra > 0 ? 700 : 400 }}>{fmt(l.brut + l.extra)} €</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', color: '#3b82f6' }}>-{fmt(l.onssW)} €</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', color: '#8b5cf6' }}>-{fmt(l.pp)} €</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{fmt(l.net + l.extra)} €</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', color: '#ef4444' }}>{fmt(l.onssE)} €</td>
                      <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700 }}>{fmt(l.brut + l.extra + l.onssE)} €</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#1a1a2a', fontWeight: 700, borderTop: '2px solid #2a2a3a' }}>
                    <td style={{ padding: '10px' }}>TOTAL {annee}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#f59e0b' }}>{fmt(totaux.brut)} €</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#3b82f6' }}>-{fmt(totaux.onssW)} €</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#8b5cf6' }}>-{fmt(totaux.pp)} €</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#10b981' }}>{fmt(totaux.net)} €</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#ef4444' }}>{fmt(totaux.onssE)} €</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#f1f5f9' }}>{fmt(totaux.brut + totaux.onssE)} €</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
