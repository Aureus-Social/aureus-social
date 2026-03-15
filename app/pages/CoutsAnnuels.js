'use client'
import { useState, useMemo } from 'react'

const TX_ONSS_W = 0.1307
const TX_ONSS_E = 0.2507
const TX_AT = 0.0097
const MOIS_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

function calcCoutAnnuel(emp) {
  const brut = parseFloat(emp.brut || 0)
  const regime = parseFloat(emp.regime || 100) / 100
  const brutR = brut * regime
  const onssW = brutR * TX_ONSS_W
  const onssE = brutR * TX_ONSS_E
  const at = brutR * TX_AT
  const cr = emp.chequesRepas ? (parseFloat(emp.joursRepas || 22) * parseFloat(emp.valeurCR || 8) * 0.93) : 0 // part patronale 93%
  const ecocheques = emp.ecocheques ? parseFloat(emp.montantEco || 250) / 12 : 0
  const assurGrp = parseFloat(emp.assuranceGroupe || 0)
  const voiture = emp.voiture ? parseFloat(emp.coutVoiture || 0) : 0
  const teletravail = emp.teletravail ? (parseFloat(emp.joursHD || 8) * 148.73 / 30) : 0

  const mensuel = brutR + onssE + at + cr + ecocheques + assurGrp + voiture + teletravail
  const doubleP = brutR * 0.92 // double pécule de vacances
  const primeFinAnnee = emp.primeFinAnnee ? brutR : 0 // 13e mois
  const annuel = mensuel * 12 + doubleP + primeFinAnnee

  return { brutR, onssW, onssE, at, cr, ecocheques, assurGrp, voiture, teletravail, mensuel, doubleP, primeFinAnnee, annuel }
}

export default function CoutsAnnuels({ state, dispatch }) {
  const emps = state?.emps || []
  const [customEmps, setCustomEmps] = useState([])
  const [newEmp, setNewEmp] = useState({ nom: '', brut: '', regime: '100', cp: '200', chequesRepas: false, joursRepas: '22', valeurCR: '8', ecocheques: false, montantEco: '250', assuranceGroupe: '', voiture: false, coutVoiture: '', primeFinAnnee: false, teletravail: false, joursHD: '8' })
  const [tab, setTab] = useState('overview')
  const [annee, setAnnee] = useState(new Date().getFullYear())

  const allEmps = useMemo(() => [
    ...emps.map(e => ({ nom: `${e.fn || e.first || ''} ${e.ln || e.last || ''}`.trim(), brut: e.gross || e.monthlySalary || 0, regime: e.regime || 100, cp: e.cp || '200', chequesRepas: e.chequesRepas || false, joursRepas: e.chequesRepasJours || 22, valeurCR: 8, primeFinAnnee: false, assuranceGroupe: 0, voiture: false, coutVoiture: 0, ecocheques: false, montantEco: 250, teletravail: false, joursHD: 8 })),
    ...customEmps
  ], [emps, customEmps])

  const totaux = useMemo(() => {
    return allEmps.map(e => ({ ...e, ...calcCoutAnnuel(e) }))
  }, [allEmps])

  const masseSalariale = totaux.reduce((s, e) => s + e.annuel, 0)
  const masseONSSE = totaux.reduce((s, e) => s + e.onssE * 12, 0)
  const masseAT = totaux.reduce((s, e) => s + e.at * 12, 0)
  const masseBrute = totaux.reduce((s, e) => s + e.brutR * 12, 0)

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }
  const input = { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 12px', color: '#f1f5f9', fontSize: 13, boxSizing: 'border-box' }
  const lbl = { display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 3 }
  const btn = (v = 'primary') => ({ background: v === 'primary' ? '#6366f1' : '#1f2937', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 13 })
  const tabS = (a) => ({ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#9ca3af', border: 'none' })
  const fmt = (v) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0)
  const fmtD = (v) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2 }).format(v || 0)

  function addCustomEmp() {
    if (!newEmp.brut) return
    setCustomEmps(p => [...p, { ...newEmp, brut: parseFloat(newEmp.brut), regime: parseFloat(newEmp.regime), joursRepas: parseFloat(newEmp.joursRepas), valeurCR: parseFloat(newEmp.valeurCR), assuranceGroupe: parseFloat(newEmp.assuranceGroupe || 0), coutVoiture: parseFloat(newEmp.coutVoiture || 0), montantEco: parseFloat(newEmp.montantEco || 250), joursHD: parseFloat(newEmp.joursHD || 8), id: Date.now() }])
    setNewEmp({ nom: '', brut: '', regime: '100', cp: '200', chequesRepas: false, joursRepas: '22', valeurCR: '8', ecocheques: false, montantEco: '250', assuranceGroupe: '', voiture: false, coutVoiture: '', primeFinAnnee: false, teletravail: false, joursHD: '8' })
  }

  function setN(k, v) { setNewEmp(p => ({ ...p, [k]: v })) }

  return (
    <div style={s}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>📊</span>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Coûts Annuels</h1>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Masse salariale totale · Projection 12 mois · Coût réel employeur</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 12, color: '#6b7280' }}>Année</label>
            <input type="number" value={annee} onChange={e => setAnnee(e.target.value)} style={{ ...input, width: 80 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {[['overview', '📊 Vue globale'], ['detail', '👤 Par employé'], ['ajouter', '➕ Simuler']].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} style={tabS(tab === id)}>{l}</button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <div>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Coût total annuel', value: `${fmt(masseSalariale)} €`, color: '#ef4444', sub: `${allEmps.length} travailleur(s)` },
              { label: 'Masse salariale brute', value: `${fmt(masseBrute)} €`, color: '#f59e0b', sub: 'Avant charges' },
              { label: 'ONSS patronal total', value: `${fmt(masseONSSE)} €`, color: '#3b82f6', sub: '25,07%/an' },
              { label: 'Coût moyen/employé', value: allEmps.length ? `${fmt(masseSalariale / allEmps.length)} €` : '—', color: '#10b981', sub: 'Par an' },
            ].map(item => (
              <div key={item.label} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>{item.sub}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Répartition charges */}
          {totaux.length > 0 && (
            <div style={card}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>📈 Répartition des coûts {annee}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  {[
                    { label: 'Salaires bruts', montant: masseBrute, color: '#f59e0b' },
                    { label: 'Cotisations ONSS patronales', montant: masseONSSE, color: '#3b82f6' },
                    { label: 'Assurance AT', montant: masseAT, color: '#8b5cf6' },
                    { label: 'Avantages extralégaux', montant: totaux.reduce((s, e) => s + (e.cr + e.ecocheques + e.assurGrp + e.voiture + e.teletravail) * 12, 0), color: '#10b981' },
                    { label: 'Pécules & primes annuelles', montant: totaux.reduce((s, e) => s + e.doubleP + e.primeFinAnnee, 0), color: '#ef4444' },
                  ].map(item => {
                    const pct = masseSalariale > 0 ? (item.montant / masseSalariale * 100).toFixed(1) : 0
                    return (
                      <div key={item.label} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: '#9ca3af' }}>{item.label}</span>
                          <span style={{ fontWeight: 600 }}>{fmt(item.montant)} € <span style={{ color: '#4b5563' }}>({pct}%)</span></span>
                        </div>
                        <div style={{ height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: 3, transition: 'width .5s' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>Projection mensuelle</div>
                  {MOIS_LABELS.map((m, i) => {
                    const mois = i + 1
                    // Double pécule en mai, 13e mois en décembre
                    const extra = totaux.reduce((s, e) => {
                      let ex = 0
                      if (mois === 5) ex += e.doubleP
                      if (mois === 12 && e.primeFinAnnee > 0) ex += e.primeFinAnnee
                      return s + ex
                    }, 0)
                    const base = totaux.reduce((s, e) => s + e.mensuel, 0)
                    const total = base + extra
                    const maxVal = Math.max(...MOIS_LABELS.map((_, j) => {
                      const mo = j + 1
                      const ex2 = totaux.reduce((s, e) => s + (mo === 5 ? e.doubleP : 0) + (mo === 12 && e.primeFinAnnee > 0 ? e.primeFinAnnee : 0), 0)
                      return totaux.reduce((s, e) => s + e.mensuel, 0) + ex2
                    }))
                    return (
                      <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 28, fontSize: 10, color: '#6b7280', flexShrink: 0 }}>{m}</div>
                        <div style={{ flex: 1, height: 14, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${maxVal > 0 ? total / maxVal * 100 : 0}%`, background: extra > 0 ? '#f59e0b' : '#6366f1', borderRadius: 2 }} />
                        </div>
                        <div style={{ fontSize: 10, color: '#9ca3af', width: 70, textAlign: 'right' }}>{fmt(total)} €</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {allEmps.length === 0 && (
            <div style={{ ...card, textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
              <div style={{ color: '#6b7280' }}>Aucun employé dans la base. Ajoutez-en via l'onglet "Simuler" ou encodez des employés dans la liste.</div>
            </div>
          )}
        </div>
      )}

      {tab === 'detail' && (
        <div style={card}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>👤 Détail par travailleur</h3>
          {totaux.length === 0 ? (
            <div style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', padding: 24 }}>Aucun travailleur — utilisez l'onglet Simuler</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#1a1a1a' }}>
                    {['Nom', 'Brut/mois', 'ONSS E', 'Avantages', 'Double P.', 'Coût/mois', 'Coût annuel'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Nom' ? 'left' : 'right', color: '#6b7280', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {totaux.map((e, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{e.nom || `Employé ${i + 1}`}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmtD(e.brutR)} €</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#3b82f6' }}>{fmtD(e.onssE)} €</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#10b981' }}>{fmtD(e.cr + e.ecocheques + e.assurGrp + e.voiture + e.teletravail)} €</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#f59e0b' }}>{fmtD(e.doubleP)} €</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{fmtD(e.mensuel)} €</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#ef4444' }}>{fmt(e.annuel)} €</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#1a1a2a', fontWeight: 700 }}>
                    <td style={{ padding: '10px' }}>TOTAL</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{fmt(totaux.reduce((s, e) => s + e.brutR, 0))} €</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#3b82f6' }}>{fmt(totaux.reduce((s, e) => s + e.onssE, 0))} €</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#10b981' }}>{fmt(totaux.reduce((s, e) => s + e.cr + e.ecocheques + e.assurGrp + e.voiture + e.teletravail, 0))} €</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#f59e0b' }}>{fmt(totaux.reduce((s, e) => s + e.doubleP, 0))} €</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{fmt(totaux.reduce((s, e) => s + e.mensuel, 0))} €</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#ef4444' }}>{fmt(masseSalariale)} €</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'ajouter' && (
        <div style={{ maxWidth: 640 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#6366f1' }}>➕ Ajouter un employé (simulation)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={lbl}>Nom</label><input style={input} value={newEmp.nom} onChange={e => setN('nom', e.target.value)} placeholder="Nom Prénom" /></div>
              <div><label style={lbl}>Brut mensuel (€) *</label><input type="number" style={input} value={newEmp.brut} onChange={e => setN('brut', e.target.value)} placeholder="Ex: 3000" /></div>
              <div><label style={lbl}>Régime (%)</label><select style={input} value={newEmp.regime} onChange={e => setN('regime', e.target.value)}>
                <option value="100">100%</option><option value="80">80%</option><option value="75">75%</option><option value="50">50%</option>
              </select></div>
              <div><label style={lbl}>CP</label><input style={input} value={newEmp.cp} onChange={e => setN('cp', e.target.value)} placeholder="200" /></div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  ['chequesRepas', '🍽 Chèques-repas'],
                  ['ecocheques', '🌿 Éco-chèques'],
                  ['voiture', '🚗 Voiture'],
                  ['primeFinAnnee', '🎁 13e mois'],
                  ['teletravail', '🏠 Télétravail'],
                ].map(([k, l]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                    <input type="checkbox" checked={newEmp[k]} onChange={e => setN(k, e.target.checked)} />
                    {l}
                  </label>
                ))}
              </div>
              {newEmp.voiture && <div><label style={lbl}>Coût voiture/mois (€)</label><input type="number" style={input} value={newEmp.coutVoiture} onChange={e => setN('coutVoiture', e.target.value)} placeholder="Ex: 800" /></div>}
              {newEmp.chequesRepas && <div><label style={lbl}>Jours repas/mois</label><input type="number" style={input} value={newEmp.joursRepas} onChange={e => setN('joursRepas', e.target.value)} /></div>}
            </div>
            <button onClick={addCustomEmp} style={{ ...btn(), marginTop: 16 }}>Ajouter à la simulation</button>
          </div>
          {customEmps.length > 0 && (
            <div style={card}>
              <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700 }}>Employés simulés ({customEmps.length})</h4>
              {customEmps.map((e, i) => (
                <div key={e.id || i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a1a', fontSize: 13 }}>
                  <span>{e.nom || `Employé ${i + 1}`} — {e.brut} €/mois</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{fmt(calcCoutAnnuel(e).annuel)} €/an</span>
                </div>
              ))}
              <button onClick={() => setTab('overview')} style={{ ...btn(), marginTop: 12 }}>Voir la synthèse →</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
