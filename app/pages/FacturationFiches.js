'use client'
import { useState, useEffect } from 'react'
import { authFetch } from '@/app/lib/auth-fetch'

const PRIX_FICHE = 2 // 2€ par fiche

export default function FacturationFiches({ state, dispatch }) {
  const [fiches, setFiches] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [filtre, setFiltre] = useState('tous') // tous | impaye | paye
  const [search, setSearch] = useState('')

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }

  useEffect(() => { loadFiches() }, [])

  async function loadFiches() {
    setLoading(true)
    try {
      const r = await authFetch('/api/payroll-history?limit=500')
      const j = await r.json()
      if (j.data) setFiches(j.data)
    } catch(e) {}
    finally { setLoading(false) }
  }

  async function marquerPaye(id) {
    try {
      const r = await authFetch('/api/payroll-history', {
        method: 'PUT',
        body: JSON.stringify({ id, statut_paiement: 'paye', date_paiement: new Date().toISOString() })
      })
      const j = await r.json()
      if (j.ok) {
        setFiches(prev => prev.map(f => f.id === id ? { ...f, statut_paiement: 'paye', date_paiement: new Date().toISOString() } : f))
        setMsg({ type: 'success', text: '✅ Fiche marquée comme payée — 2€ encaissés' })
        setTimeout(() => setMsg(null), 3000)
      }
    } catch(e) {}
  }

  async function marquerImpaye(id) {
    try {
      const r = await authFetch('/api/payroll-history', {
        method: 'PUT',
        body: JSON.stringify({ id, statut_paiement: 'impaye', date_paiement: null })
      })
      const j = await r.json()
      if (j.ok) {
        setFiches(prev => prev.map(f => f.id === id ? { ...f, statut_paiement: 'impaye', date_paiement: null } : f))
      }
    } catch(e) {}
  }

  const fichesFiltrees = fiches
    .filter(f => filtre === 'tous' || (filtre === 'paye' ? f.statut_paiement === 'paye' : f.statut_paiement !== 'paye'))
    .filter(f => !search || (f.nom || f.employee_name || f.empId || '').toLowerCase().includes(search.toLowerCase()))

  const totalFiches = fiches.length
  const fichesPayees = fiches.filter(f => f.statut_paiement === 'paye').length
  const fichesImpayees = fiches.filter(f => f.statut_paiement !== 'paye').length
  const revenusEncaisses = fichesPayees * PRIX_FICHE
  const revenusAttendus = fichesImpayees * PRIX_FICHE

  const fmt = (v) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2 }).format(v)

  return (
    <div style={s}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>💰</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Facturation Fiches de Paie</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>2€ par fiche générée · Suivi des paiements clients</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: '#0d1a0d', border: '1px solid #10b981', fontSize: 13, color: '#10b981' }}>
          {msg.text}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total fiches', value: totalFiches, color: '#f1f5f9', sub: 'générées' },
          { label: 'Fiches payées', value: fichesPayees, color: '#10b981', sub: `${fmt(revenusEncaisses)} €` },
          { label: 'Fiches impayées', value: fichesImpayees, color: '#f97316', sub: `${fmt(revenusAttendus)} € à encaisser` },
          { label: 'Revenus total', value: `${fmt(revenusEncaisses)} €`, color: '#c6a34e', sub: `sur ${fmt((totalFiches) * PRIX_FICHE)} € potentiel` },
        ].map(k => (
          <div key={k.label} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{k.label}</div>
            <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Filtres + Recherche */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {[['tous', 'Toutes'], ['impaye', '🟠 Impayées'], ['paye', '🟢 Payées']].map(([id, lbl]) => (
          <button key={id} onClick={() => setFiltre(id)}
            style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filtre === id ? '#c6a34e' : '#1f2937', color: filtre === id ? '#000' : '#9ca3af' }}>
            {lbl} {id === 'tous' ? `(${totalFiches})` : id === 'impaye' ? `(${fichesImpayees})` : `(${fichesPayees})`}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher un employé..."
          style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, padding: '7px 12px', color: '#f1f5f9', fontSize: 12, marginLeft: 'auto' }} />
        <button onClick={loadFiches} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #2a2a2a', background: 'transparent', color: '#6b7280', fontSize: 12, cursor: 'pointer' }}>
          🔄 Actualiser
        </button>
      </div>

      {/* Liste des fiches */}
      <div style={card}>
        {loading && <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>⏳ Chargement...</div>}

        {!loading && fichesFiltrees.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            Aucune fiche {filtre !== 'tous' ? (filtre === 'paye' ? 'payée' : 'impayée') : ''} trouvée.
          </div>
        )}

        {!loading && fichesFiltrees.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#1a1a1a' }}>
                {['Employé', 'Période', 'Brut', 'Net', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Brut' || h === 'Net' ? 'right' : 'left', color: '#6b7280', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fichesFiltrees.map((f, i) => {
                const paye = f.statut_paiement === 'paye'
                const nom = f.nom || f.employee_name || f.first_name || f.empId || `Employé ${i+1}`
                const periode = f.periode || f.month || f.created_at?.substring(0, 7) || '—'
                const brut = parseFloat(f.brut || f.gross || f.montant_brut || 0)
                const net = parseFloat(f.net || f.montant_net || 0)
                return (
                  <tr key={f.id || i} style={{ borderBottom: '1px solid #1a1a1a', background: paye ? '#0d1a0d' : 'transparent' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{nom}</td>
                    <td style={{ padding: '10px 12px', color: '#6b7280' }}>{periode}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#f59e0b' }}>{fmt(brut)} €</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#10b981' }}>{fmt(net)} €</td>
                    <td style={{ padding: '10px 12px' }}>
                      {paye ? (
                        <span style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98140', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                          ✅ Payé — 2€
                        </span>
                      ) : (
                        <span style={{ background: '#f9741620', color: '#f97316', border: '1px solid #f9741640', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                          🟠 À encaisser — 2€
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {paye ? (
                        <button onClick={() => marquerImpaye(f.id)}
                          style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #4b5563', background: 'transparent', color: '#6b7280', fontSize: 11, cursor: 'pointer' }}>
                          Annuler
                        </button>
                      ) : (
                        <button onClick={() => marquerPaye(f.id)}
                          style={{ padding: '5px 14px', borderRadius: 6, border: 'none', background: '#10b981', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          ✅ Marquer payé — 2€
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#1a1a2a', borderTop: '2px solid #2a2a3a' }}>
                <td colSpan={4} style={{ padding: '10px 12px', fontWeight: 700, color: '#c6a34e' }}>
                  Total — {fichesFiltrees.length} fiche(s) affichée(s)
                </td>
                <td colSpan={2} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>
                  <span style={{ color: '#10b981' }}>{fmt(fichesFiltrees.filter(f => f.statut_paiement === 'paye').length * PRIX_FICHE)} € encaissés</span>
                  {' · '}
                  <span style={{ color: '#f97316' }}>{fmt(fichesFiltrees.filter(f => f.statut_paiement !== 'paye').length * PRIX_FICHE)} € à encaisser</span>
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
