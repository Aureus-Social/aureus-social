'use client'
import { useState, useEffect } from 'react'
import { authFetch } from '@/app/lib/auth-fetch'

const PLANS = [
  {
    id: 'starter',
    label: 'Starter',
    prix: 49,
    couleur: '#6b7280',
    features: ['Jusqu\'à 5 employés', 'Fiches de paie PDF', 'ONSS & Dimona', 'Belcotax 281.10', 'Email support'],
  },
  {
    id: 'pro',
    label: 'Pro',
    prix: 149,
    couleur: '#6366f1',
    badge: 'Recommandé',
    features: ['Jusqu\'à 25 employés', 'Tout Starter +', 'Exports comptables (WinBooks, BOB)', 'Simulateurs avancés', 'DRS documents sociaux', 'Support prioritaire', 'Veille légale quotidienne'],
  },
  {
    id: 'fiduciaire',
    label: 'Fiduciaire',
    prix: 349,
    couleur: '#f59e0b',
    features: ['Employés illimités', 'Multi-clients illimité', 'Tout Pro +', 'Portail client dédié', 'API accès', 'SLA 99,9%', 'Account manager dédié', 'Onboarding prioritaire'],
  },
]

export default function Subscriptions({ state, dispatch }) {
  const [societes, setSocietes] = useState([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('overview')
  const [editingId, setEditingId] = useState(null)
  const [newPlan, setNewPlan] = useState('')

  const clients = state?.clients || societes

  useEffect(() => {
    setLoading(true)
    authFetch('/api/clients').then(r => r.json()).then(j => {
      if (j.data) setSocietes(j.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  // Stats MRR
  const mrr = clients.reduce((s, c) => {
    const plan = PLANS.find(p => p.id === c.plan)
    return s + (plan?.prix || 0)
  }, 0)
  const arr = mrr * 12
  const parPlan = PLANS.map(p => ({
    ...p,
    count: clients.filter(c => c.plan === p.id).length,
    revenue: clients.filter(c => c.plan === p.id).length * p.prix,
  }))

  async function updatePlan(clientId, plan) {
    await authFetch(`/api/clients?id=${clientId}`, {
      method: 'PUT',
      body: JSON.stringify({ plan })
    }).catch(() => {})
    setSocietes(p => p.map(c => c.id === clientId ? { ...c, plan } : c))
    if (dispatch) dispatch({ type: 'UPD_CLIENT', id: clientId, data: { plan } })
    setEditingId(null)
  }

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }
  const tabS = (a) => ({ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#9ca3af', border: 'none' })
  const fmt = (v) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 0 }).format(v || 0)

  return (
    <div style={s}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>💳</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Subscriptions & Pricing</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>MRR · Gestion des plans · Clients actifs</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['overview', '📊 MRR'], ['clients', '👥 Clients'], ['plans', '💡 Plans']].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} style={tabS(tab === id)}>{l}</button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <div>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'MRR', value: `${fmt(mrr)} €`, sub: 'Mensuel récurrent', color: '#10b981' },
              { label: 'ARR', value: `${fmt(arr)} €`, sub: 'Annuel récurrent', color: '#6366f1' },
              { label: 'Clients actifs', value: clients.length, sub: 'Total base', color: '#f59e0b' },
              { label: 'ARPU', value: clients.length > 0 ? `${fmt(mrr / clients.length)} €` : '—', sub: 'Revenu moyen/client', color: '#a855f7' },
            ].map(item => (
              <div key={item.label} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>{item.sub}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Répartition par plan */}
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>📈 Répartition par plan</h3>
            {parPlan.map(p => (
              <div key={p.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: p.couleur }}>{p.label}</span>
                  <span style={{ color: '#9ca3af' }}>{p.count} client(s) · <b style={{ color: '#f1f5f9' }}>{fmt(p.revenue)} €/mois</b></span>
                </div>
                <div style={{ height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: clients.length > 0 ? `${p.count / clients.length * 100}%` : '0%', background: p.couleur, borderRadius: 4, transition: 'width .5s' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Objectif MRR */}
          <div style={{ ...card, borderColor: '#10b98140' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#10b981' }}>🎯 Objectif 6 mois</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, fontSize: 13 }}>
              {[
                { label: 'MRR actuel', value: `${fmt(mrr)} €`, color: '#10b981' },
                { label: 'Objectif MRR (20 clients)', value: '3.000 €', color: '#6366f1' },
                { label: 'Progression', value: `${Math.min(100, (mrr / 3000 * 100)).toFixed(0)}%`, color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>{item.value}</div>
                  <div style={{ color: '#6b7280', marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, height: 8, background: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, mrr / 3000 * 100)}%`, background: 'linear-gradient(90deg, #10b981, #6366f1)', borderRadius: 4, transition: 'width .5s' }} />
            </div>
          </div>
        </div>
      )}

      {tab === 'clients' && (
        <div style={card}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>👥 Clients & Plans</h3>
          {loading && <div style={{ color: '#6b7280', textAlign: 'center', padding: 24 }}>Chargement...</div>}
          {!loading && clients.length === 0 && (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
              Aucun client encore. Ajoutez vos premiers clients via le module Onboarding.
            </div>
          )}
          {clients.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#1a1a1a' }}>
                  {['Client', 'BCE', 'Plan', 'MRR', 'Statut', 'Action'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map(c => {
                  const plan = PLANS.find(p => p.id === c.plan) || PLANS[0]
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{c.nom || c.name || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 11 }}>{c.siret_bce || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {editingId === c.id ? (
                          <select value={newPlan || c.plan} onChange={e => setNewPlan(e.target.value)}
                            style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 4, padding: '4px 8px', color: '#f1f5f9', fontSize: 12 }}>
                            {PLANS.map(p => <option key={p.id} value={p.id}>{p.label} ({p.prix}€)</option>)}
                          </select>
                        ) : (
                          <span style={{ background: plan.couleur + '20', color: plan.couleur, border: `1px solid ${plan.couleur}40`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{plan.label}</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#10b981' }}>{plan.prix} €/mois</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: '#10b98120', color: '#10b981', borderRadius: 4, padding: '2px 6px', fontSize: 10 }}>Actif</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {editingId === c.id ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => updatePlan(c.id, newPlan || c.plan)} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 11 }}>✓</button>
                            <button onClick={() => setEditingId(null)} style={{ background: '#1f2937', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 11 }}>✕</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingId(c.id); setNewPlan(c.plan) }} style={{ background: '#1f2937', color: '#9ca3af', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 11 }}>Modifier</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{ ...card, borderColor: plan.couleur + '40', position: 'relative' }}>
              {plan.badge && (
                <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: plan.couleur, color: '#000', borderRadius: 20, padding: '2px 12px', fontSize: 11, fontWeight: 700 }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: plan.couleur, marginBottom: 4 }}>{plan.label}</div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{plan.prix} €</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>/ mois · HTVA</div>
              </div>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: plan.couleur, flexShrink: 0 }}>✓</span>
                  <span style={{ color: '#9ca3af' }}>{f}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
