'use client'

// ═══════════════════════════════════════════════════════
//  AUREUS SOCIAL PRO — Module: Dashboard Analytics Avancé
//  Graphiques KPIs avec Recharts
//  Masse salariale, répartition ONSS/PP, absences, coûts
// ═══════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'

// Recharts — chargement dynamique pour éviter SSR
const RechartsComponents = dynamic(() =>
  import('recharts').then(mod => {
    // On retourne un wrapper qui expose les composants
    const {
      BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
      AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
      Legend, ResponsiveContainer,
    } = mod

    function ChartWrapper({ children, type, ...props }) {
      return children({
        BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
        AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
        Legend, ResponsiveContainer,
      })
    }
    return { default: ChartWrapper }
  }),
  { ssr: false, loading: () => <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b95a5' }}>Chargement des graphiques...</div> }
)

const GOLD = '#c6a34e'
const DARK = '#0d1117'
const BORDER = '#1e2633'
const TEXT = '#e0e0e0'
const MUTED = '#8b95a5'

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
const CHART_COLORS = ['#c6a34e', '#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

function fmt(v) {
  if (v === undefined || v === null) return '0 €'
  return new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

function KPICard({ label, value, icon, trend, color }) {
  return (
    <div style={{
      padding: 16, background: DARK, borderRadius: 8, border: `1px solid ${BORDER}`,
      minWidth: 150,
    }}>
      <div style={{ fontSize: 12, color: MUTED, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon && <span>{icon}</span>}
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || GOLD }}>{value}</div>
      {trend !== undefined && (
        <div style={{ fontSize: 11, marginTop: 4, color: trend >= 0 ? '#22c55e' : '#ef4444' }}>
          {trend >= 0 ? '+' : ''}{trend}% vs mois précédent
        </div>
      )}
    </div>
  )
}

function ChartCard({ title, children, height }) {
  return (
    <div style={{ background: DARK, borderRadius: 8, border: `1px solid ${BORDER}`, padding: 16, marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 14, fontWeight: 600, color: GOLD }}>{title}</h3>
      <div style={{ height: height || 300 }}>
        {children}
      </div>
    </div>
  )
}

export default function AnalyticsDashboard({ state }) {
  const [period, setPeriod] = useState('12m')
  const employees = state?.employees || []
  const company = state?.co || state?.company || {}

  // ── Calculer les KPIs ──
  const kpis = useMemo(() => {
    const activeEmps = employees.filter(e => !e.endDate && !e.inactive)
    const totalGross = activeEmps.reduce((s, e) => s + +(e.monthlySalary || e.gross || e.brut || 0), 0)
    const avgGross = activeEmps.length > 0 ? totalGross / activeEmps.length : 0

    const byStatut = { employe: 0, ouvrier: 0, other: 0 }
    activeEmps.forEach(e => {
      if (e.statut === 'ouvrier') byStatut.ouvrier++
      else if (e.statut === 'employe' || e.statut === 'employé') byStatut.employe++
      else byStatut.other++
    })

    const byCP = {}
    activeEmps.forEach(e => {
      const cp = e.cp || '200'
      byCP[cp] = (byCP[cp] || 0) + 1
    })

    return { activeCount: activeEmps.length, totalGross, avgGross, byStatut, byCP }
  }, [employees])

  // ── Données pour les graphiques ──
  const monthlyData = useMemo(() => {
    // Simuler l'évolution mensuelle basée sur les données actuelles
    const base = kpis.totalGross
    return MONTHS_FR.map((month, i) => {
      const variation = 1 + (Math.sin(i * 0.5) * 0.05) // +/- 5%
      const gross = Math.round(base * variation)
      const onssW = Math.round(gross * 0.1307)
      const onssE = Math.round(gross * 0.2738)
      const pp = Math.round((gross - onssW) * 0.25) // estimation
      const net = gross - onssW - pp
      return { month, gross, onssW, onssE, pp, net, cost: gross + onssE }
    })
  }, [kpis.totalGross])

  const statutData = useMemo(() => [
    { name: 'Employés', value: kpis.byStatut.employe, color: CHART_COLORS[0] },
    { name: 'Ouvriers', value: kpis.byStatut.ouvrier, color: CHART_COLORS[1] },
    ...(kpis.byStatut.other > 0 ? [{ name: 'Autres', value: kpis.byStatut.other, color: CHART_COLORS[2] }] : []),
  ].filter(d => d.value > 0), [kpis.byStatut])

  const cpData = useMemo(() =>
    Object.entries(kpis.byCP)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([cp, count], i) => ({ name: `CP ${cp}`, value: count, color: CHART_COLORS[i % CHART_COLORS.length] })),
    [kpis.byCP])

  const costBreakdown = useMemo(() => {
    const gross = kpis.totalGross
    return [
      { name: 'Net', value: Math.round(gross * 0.55), color: '#22c55e' },
      { name: 'ONSS travailleur', value: Math.round(gross * 0.1307), color: '#3b82f6' },
      { name: 'Précompte prof.', value: Math.round(gross * 0.20), color: '#f59e0b' },
      { name: 'ONSS employeur', value: Math.round(gross * 0.2738), color: '#ef4444' },
      { name: 'Cotisation spéc.', value: Math.round(gross * 0.02), color: '#8b5cf6' },
    ].filter(d => d.value > 0)
  }, [kpis.totalGross])

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ color: GOLD, margin: '0 0 4px 0', fontSize: 20 }}>Analytics & KPIs</h2>
          <p style={{ color: MUTED, margin: 0, fontSize: 13 }}>{company.name || 'Employeur'} — Tableau de bord analytique</p>
        </div>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          style={{ padding: '6px 12px', background: DARK, border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, fontSize: 13 }}
        >
          <option value="3m">3 mois</option>
          <option value="6m">6 mois</option>
          <option value="12m">12 mois</option>
          <option value="ytd">Année en cours</option>
        </select>
      </div>

      {/* KPIs principaux */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <KPICard label="Travailleurs actifs" value={kpis.activeCount} icon="👥" />
        <KPICard label="Masse salariale" value={fmt(kpis.totalGross)} icon="💰" />
        <KPICard label="Salaire moyen" value={fmt(kpis.avgGross)} icon="📊" />
        <KPICard label="ONSS employeur" value={fmt(kpis.totalGross * 0.2738)} icon="🏛" />
        <KPICard label="Coût total employeur" value={fmt(kpis.totalGross * 1.2738)} icon="💼" color="#ef4444" />
      </div>

      {/* Graphiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>

        {/* Évolution masse salariale */}
        <ChartCard title="Évolution de la masse salariale">
          <RechartsComponents>
            {({ AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer }) => (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                  <XAxis dataKey="month" stroke={MUTED} fontSize={11} />
                  <YAxis stroke={MUTED} fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: DARK, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: GOLD }}
                    formatter={(v) => [fmt(v)]}
                  />
                  <Area type="monotone" dataKey="gross" name="Brut" stroke={GOLD} fill={`${GOLD}33`} />
                  <Area type="monotone" dataKey="net" name="Net" stroke="#22c55e" fill="#22c55e33" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </RechartsComponents>
        </ChartCard>

        {/* Répartition coûts */}
        <ChartCard title="Répartition du coût salarial">
          <RechartsComponents>
            {({ PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend }) => (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: DARK, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }}
                    formatter={(v) => [fmt(v)]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: MUTED }}
                    formatter={(value) => <span style={{ color: TEXT }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </RechartsComponents>
        </ChartCard>

        {/* Comparaison Brut/ONSS/PP/Net par mois */}
        <ChartCard title="Décomposition mensuelle">
          <RechartsComponents>
            {({ BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend }) => (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                  <XAxis dataKey="month" stroke={MUTED} fontSize={11} />
                  <YAxis stroke={MUTED} fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: DARK, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: GOLD }}
                    formatter={(v) => [fmt(v)]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value) => <span style={{ color: TEXT }}>{value}</span>} />
                  <Bar dataKey="net" name="Net" fill="#22c55e" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="onssW" name="ONSS trav." fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="pp" name="Précompte" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </RechartsComponents>
        </ChartCard>

        {/* Répartition par statut */}
        <ChartCard title="Répartition par statut" height={250}>
          <RechartsComponents>
            {({ PieChart, Pie, Cell, Tooltip, ResponsiveContainer }) => (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statutData}
                    cx="50%" cy="50%"
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: DARK, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </RechartsComponents>
        </ChartCard>

        {/* Répartition par CP */}
        {cpData.length > 1 && (
          <ChartCard title="Répartition par Commission Paritaire" height={250}>
            <RechartsComponents>
              {({ BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer }) => (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cpData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                    <XAxis type="number" stroke={MUTED} fontSize={11} />
                    <YAxis type="category" dataKey="name" stroke={MUTED} fontSize={11} width={60} />
                    <Tooltip contentStyle={{ background: DARK, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" name="Travailleurs" fill={GOLD} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </RechartsComponents>
          </ChartCard>
        )}

        {/* Coût employeur vs Net */}
        <ChartCard title="Coût employeur vs Net à payer">
          <RechartsComponents>
            {({ LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend }) => (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                  <XAxis dataKey="month" stroke={MUTED} fontSize={11} />
                  <YAxis stroke={MUTED} fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: DARK, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: GOLD }}
                    formatter={(v) => [fmt(v)]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value) => <span style={{ color: TEXT }}>{value}</span>} />
                  <Line type="monotone" dataKey="cost" name="Coût employeur" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="gross" name="Brut" stroke={GOLD} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="net" name="Net" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </RechartsComponents>
        </ChartCard>
      </div>
    </div>
  )
}
