'use client'

// ═══════════════════════════════════════════════════════
//  AUREUS SOCIAL PRO — Module: Planning & Calendrier
//  Vue calendrier des absences, présences, congés
//  Planning mensuel par équipe/département
// ═══════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from 'react'

const GOLD = '#c6a34e'
const DARK = '#0d1117'
const BORDER = '#1e2633'
const TEXT = '#e0e0e0'
const MUTED = '#8b95a5'

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const DAYS_SHORT = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

// ── Types d'absence belges ──
const ABSENCE_TYPES = {
  CONGE: { label: 'Congé annuel', short: 'CA', color: '#3b82f6', legal: '20 jours/an (régime 5j)' },
  MALADIE: { label: 'Maladie', short: 'M', color: '#ef4444', legal: 'Salaire garanti: 30j employé / 7j ouvrier' },
  CTM: { label: 'Congé thématique', short: 'CT', color: '#8b5cf6', legal: 'Crédit-temps, congé parental, etc.' },
  FORMATION: { label: 'Formation', short: 'F', color: '#06b6d4', legal: 'Congé-éducation payé: max 125h/an' },
  PETIT_CHOMAGE: { label: 'Petit chômage', short: 'PC', color: '#f59e0b', legal: 'Événements familiaux (mariage, décès, etc.)' },
  CHOMAGE_TEMP: { label: 'Chômage temporaire', short: 'TE', color: '#ef4444', legal: 'Force majeure, économique, etc.' },
  MATERNITE: { label: 'Maternité', short: 'MA', color: '#ec4899', legal: '15 semaines (105 jours)' },
  PATERNITE: { label: 'Paternité', short: 'PA', color: '#3b82f6', legal: '20 jours (2025+)' },
  SANS_SOLDE: { label: 'Sans solde', short: 'SS', color: '#6b7280', legal: 'Convention avec employeur' },
  TELETRAVAIL: { label: 'Télétravail', short: 'TT', color: '#22c55e', legal: 'Selon convention d\'entreprise' },
  FERIE: { label: 'Jour férié', short: 'JF', color: '#c6a34e', legal: '10 jours fériés légaux/an' },
  DEMI_JOUR: { label: 'Demi-jour', short: '½', color: '#f59e0b', legal: 'Demi-journée de congé' },
}

// ── Jours fériés belges 2026 ──
function getJoursFeries(year) {
  const paq = easterDate(year)
  const lunPaq = new Date(paq); lunPaq.setDate(paq.getDate() + 1)
  const ascension = new Date(paq); ascension.setDate(paq.getDate() + 39)
  const lunPent = new Date(paq); lunPent.setDate(paq.getDate() + 50)

  return [
    { date: new Date(year, 0, 1), label: 'Jour de l\'An' },
    { date: paq, label: 'Pâques' },
    { date: lunPaq, label: 'Lundi de Pâques' },
    { date: new Date(year, 4, 1), label: 'Fête du Travail' },
    { date: ascension, label: 'Ascension' },
    { date: lunPent, label: 'Lundi de Pentecôte' },
    { date: new Date(year, 6, 21), label: 'Fête nationale' },
    { date: new Date(year, 7, 15), label: 'Assomption' },
    { date: new Date(year, 10, 1), label: 'Toussaint' },
    { date: new Date(year, 10, 11), label: 'Armistice' },
    { date: new Date(year, 11, 25), label: 'Noël' },
  ]
}

function easterDate(year) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // Lundi = 0
}

// ── Composant: Vue mensuelle d'un employé ──
function EmployeeRow({ employee, year, month, absences, joursFeries, onCellClick }) {
  const days = getDaysInMonth(year, month)
  const ferieMap = {}
  joursFeries.forEach(jf => {
    if (jf.date.getMonth() === month && jf.date.getFullYear() === year) {
      ferieMap[jf.date.getDate()] = jf
    }
  })

  const empAbsences = absences.filter(a =>
    a.employeeId === (employee.id || employee.niss)
  )

  function getAbsenceForDay(day) {
    const d = new Date(year, month, day)
    for (const a of empAbsences) {
      const start = new Date(a.startDate)
      const end = new Date(a.endDate || a.startDate)
      if (d >= start && d <= end) return a
    }
    return null
  }

  return (
    <tr>
      <td style={{
        padding: '6px 10px', borderBottom: `1px solid ${BORDER}`, position: 'sticky', left: 0,
        background: '#111827', zIndex: 2, minWidth: 160, fontSize: 12, color: TEXT,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {employee.first || ''} {employee.last || ''}
        <div style={{ fontSize: 10, color: MUTED }}>{employee.fn || employee.function || ''}</div>
      </td>
      {Array.from({ length: days }, (_, i) => {
        const day = i + 1
        const d = new Date(year, month, day)
        const isWeekend = d.getDay() === 0 || d.getDay() === 6
        const ferie = ferieMap[day]
        const absence = getAbsenceForDay(day)
        const isToday = dateKey(d) === dateKey(new Date())
        const absType = absence ? ABSENCE_TYPES[absence.type] : null

        let bg = 'transparent'
        let color = TEXT
        let label = ''

        if (ferie) {
          bg = `${GOLD}22`
          color = GOLD
          label = 'JF'
        } else if (absence && absType) {
          bg = absType.color + '33'
          color = absType.color
          label = absType.short
        } else if (isWeekend) {
          bg = '#ffffff08'
          color = MUTED
        }

        return (
          <td
            key={day}
            onClick={() => onCellClick?.(employee, day)}
            title={ferie ? ferie.label : absence ? `${absType?.label || ''}: ${absence.reason || ''}` : ''}
            style={{
              padding: 0, borderBottom: `1px solid ${BORDER}`, borderLeft: `1px solid ${BORDER}22`,
              textAlign: 'center', cursor: 'pointer', width: 28, minWidth: 28, maxWidth: 28,
              background: bg, position: 'relative',
            }}
          >
            {isToday && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: GOLD,
              }} />
            )}
            <span style={{ fontSize: 10, fontWeight: label ? 600 : 400, color }}>
              {label || (isWeekend ? '' : '')}
            </span>
          </td>
        )
      })}
    </tr>
  )
}

// ── Composant principal ──
export default function EmployeePlanning({ state, dispatch }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [view, setView] = useState('team') // team | individual
  const [selectedEmp, setSelectedEmp] = useState(null)
  const [showAddAbsence, setShowAddAbsence] = useState(false)
  const [newAbsence, setNewAbsence] = useState({ type: 'CONGE', startDate: '', endDate: '', reason: '' })
  const [absences, setAbsences] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aureus_absences') || '[]') }
    catch { return [] }
  })
  const [filterDept, setFilterDept] = useState('all')

  const employees = state?.employees || []
  const activeEmployees = employees.filter(e => !e.endDate && !e.inactive)
  const joursFeries = useMemo(() => getJoursFeries(year), [year])
  const days = getDaysInMonth(year, month)

  // Départements
  const departments = useMemo(() => {
    const depts = new Set()
    activeEmployees.forEach(e => { if (e.department || e.dept) depts.add(e.department || e.dept) })
    return ['all', ...Array.from(depts)]
  }, [activeEmployees])

  const filteredEmployees = useMemo(() => {
    if (filterDept === 'all') return activeEmployees
    return activeEmployees.filter(e => (e.department || e.dept) === filterDept)
  }, [activeEmployees, filterDept])

  // Statistiques du mois
  const monthStats = useMemo(() => {
    const stats = { workDays: 0, totalAbsences: 0, byType: {} }
    for (let d = 1; d <= days; d++) {
      const date = new Date(year, month, d)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const isFerie = joursFeries.some(jf =>
        jf.date.getDate() === d && jf.date.getMonth() === month && jf.date.getFullYear() === year
      )
      if (!isWeekend && !isFerie) stats.workDays++
    }

    absences.forEach(a => {
      const start = new Date(a.startDate)
      const end = new Date(a.endDate || a.startDate)
      if (start.getMonth() <= month && end.getMonth() >= month && start.getFullYear() <= year && end.getFullYear() >= year) {
        stats.totalAbsences++
        stats.byType[a.type] = (stats.byType[a.type] || 0) + 1
      }
    })

    return stats
  }, [absences, days, joursFeries, month, year])

  const saveAbsences = useCallback((newList) => {
    setAbsences(newList)
    localStorage.setItem('aureus_absences', JSON.stringify(newList))
  }, [])

  function handleAddAbsence() {
    if (!selectedEmp || !newAbsence.startDate) return
    const absence = {
      id: `abs-${Date.now()}`,
      employeeId: selectedEmp.id || selectedEmp.niss,
      employeeName: `${selectedEmp.first} ${selectedEmp.last}`,
      ...newAbsence,
    }
    saveAbsences([...absences, absence])
    setShowAddAbsence(false)
    setNewAbsence({ type: 'CONGE', startDate: '', endDate: '', reason: '' })
  }

  function handleDeleteAbsence(id) {
    saveAbsences(absences.filter(a => a.id !== id))
  }

  function handleCellClick(emp, day) {
    setSelectedEmp(emp)
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setNewAbsence(prev => ({ ...prev, startDate: d, endDate: d }))
    setShowAddAbsence(true)
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: GOLD, margin: '0 0 4px 0', fontSize: 20 }}>Planning & Calendrier</h2>
          <p style={{ color: MUTED, margin: 0, fontSize: 13 }}>
            {activeEmployees.length} travailleurs actifs — {monthStats.workDays} jours ouvrables en {MONTHS[month]}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            style={{
              padding: '6px 12px', background: DARK, border: `1px solid ${BORDER}`,
              borderRadius: 6, color: TEXT, fontSize: 12,
            }}
          >
            <option value="all">Tous les départements</option>
            {departments.filter(d => d !== 'all').map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation mois */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16,
        marginBottom: 20, padding: 12, background: DARK, borderRadius: 8, border: `1px solid ${BORDER}`,
      }}>
        <button
          onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }}
          style={{ padding: '6px 14px', background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, cursor: 'pointer', fontSize: 14 }}
        >
          ←
        </button>
        <span style={{ fontSize: 16, fontWeight: 600, color: GOLD, minWidth: 180, textAlign: 'center' }}>
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }}
          style={{ padding: '6px 14px', background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, cursor: 'pointer', fontSize: 14 }}
        >
          →
        </button>
        <button
          onClick={() => { setMonth(now.getMonth()); setYear(now.getFullYear()) }}
          style={{
            padding: '6px 14px', background: `${GOLD}22`, border: `1px solid ${GOLD}`,
            borderRadius: 6, color: GOLD, cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}
        >
          Aujourd'hui
        </button>
      </div>

      {/* Légende */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {Object.entries(ABSENCE_TYPES).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: MUTED }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: val.color + '44', border: `1px solid ${val.color}`, display: 'inline-block' }} />
            <span>{val.short} = {val.label}</span>
          </div>
        ))}
      </div>

      {/* Jours fériés du mois */}
      {joursFeries.filter(jf => jf.date.getMonth() === month && jf.date.getFullYear() === year).length > 0 && (
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, padding: 10,
          background: `${GOLD}11`, borderRadius: 6, border: `1px solid ${GOLD}33`,
        }}>
          <span style={{ fontSize: 11, color: GOLD, fontWeight: 600 }}>Jours fériés :</span>
          {joursFeries
            .filter(jf => jf.date.getMonth() === month && jf.date.getFullYear() === year)
            .map((jf, i) => (
              <span key={i} style={{ fontSize: 11, color: GOLD }}>
                {jf.date.getDate()} — {jf.label}
                {i < joursFeries.filter(j => j.date.getMonth() === month).length - 1 ? ' |' : ''}
              </span>
            ))
          }
        </div>
      )}

      {/* Grille planning */}
      <div style={{ overflowX: 'auto', borderRadius: 8, border: `1px solid ${BORDER}` }}>
        <table cellPadding="0" cellSpacing="0" style={{ width: '100%', background: '#111827', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{
                padding: '8px 10px', borderBottom: `1px solid ${BORDER}`, position: 'sticky',
                left: 0, background: DARK, zIndex: 3, fontSize: 12, color: GOLD, textAlign: 'left',
                minWidth: 160,
              }}>
                Travailleur
              </th>
              {Array.from({ length: days }, (_, i) => {
                const day = i + 1
                const d = new Date(year, month, day)
                const isWeekend = d.getDay() === 0 || d.getDay() === 6
                const isToday = dateKey(d) === dateKey(new Date())
                return (
                  <th key={day} style={{
                    padding: '4px 0', borderBottom: `1px solid ${BORDER}`,
                    background: isToday ? `${GOLD}22` : isWeekend ? '#ffffff08' : DARK,
                    width: 28, minWidth: 28, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 9, color: isWeekend ? MUTED : TEXT, fontWeight: isToday ? 700 : 400 }}>
                      {DAYS_SHORT[(d.getDay() + 6) % 7]}
                    </div>
                    <div style={{ fontSize: 11, color: isToday ? GOLD : isWeekend ? MUTED : TEXT, fontWeight: isToday ? 700 : 400 }}>
                      {day}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={days + 1} style={{ padding: 24, textAlign: 'center', color: MUTED, fontSize: 13 }}>
                  Aucun travailleur actif
                </td>
              </tr>
            ) : filteredEmployees.map((emp, idx) => (
              <EmployeeRow
                key={emp.id || emp.niss || idx}
                employee={emp}
                year={year}
                month={month}
                absences={absences}
                joursFeries={joursFeries}
                onCellClick={handleCellClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Statistiques */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 10, marginTop: 20,
      }}>
        <div style={{ padding: 12, background: DARK, borderRadius: 8, border: `1px solid ${BORDER}`, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: GOLD }}>{monthStats.workDays}</div>
          <div style={{ fontSize: 11, color: MUTED }}>Jours ouvrables</div>
        </div>
        <div style={{ padding: 12, background: DARK, borderRadius: 8, border: `1px solid ${BORDER}`, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>{monthStats.totalAbsences}</div>
          <div style={{ fontSize: 11, color: MUTED }}>Absences</div>
        </div>
        {Object.entries(monthStats.byType).map(([type, count]) => {
          const t = ABSENCE_TYPES[type]
          return (
            <div key={type} style={{
              padding: 12, background: DARK, borderRadius: 8, border: `1px solid ${BORDER}`, textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: t?.color || GOLD }}>{count}</div>
              <div style={{ fontSize: 11, color: MUTED }}>{t?.label || type}</div>
            </div>
          )
        })}
      </div>

      {/* Modal ajout absence */}
      {showAddAbsence && selectedEmp && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 10000,
        }}>
          <div style={{
            background: '#111827', borderRadius: 12, border: `1px solid ${BORDER}`,
            padding: 24, width: 420, maxWidth: '90vw',
          }}>
            <h3 style={{ color: GOLD, margin: '0 0 16px 0', fontSize: 16 }}>
              Ajouter une absence — {selectedEmp.first} {selectedEmp.last}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: MUTED, marginBottom: 4, display: 'block' }}>Type</label>
                <select
                  value={newAbsence.type}
                  onChange={e => setNewAbsence(prev => ({ ...prev, type: e.target.value }))}
                  style={{
                    width: '100%', padding: '8px 12px', background: DARK,
                    border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, fontSize: 13,
                  }}
                >
                  {Object.entries(ABSENCE_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                {ABSENCE_TYPES[newAbsence.type] && (
                  <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>
                    {ABSENCE_TYPES[newAbsence.type].legal}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, color: MUTED, marginBottom: 4, display: 'block' }}>Du</label>
                  <input
                    type="date"
                    value={newAbsence.startDate}
                    onChange={e => setNewAbsence(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 12px', background: DARK,
                      border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, fontSize: 13,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: MUTED, marginBottom: 4, display: 'block' }}>Au</label>
                  <input
                    type="date"
                    value={newAbsence.endDate}
                    onChange={e => setNewAbsence(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{
                      width: '100%', padding: '8px 12px', background: DARK,
                      border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, fontSize: 13,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: MUTED, marginBottom: 4, display: 'block' }}>Motif (optionnel)</label>
                <input
                  value={newAbsence.reason}
                  onChange={e => setNewAbsence(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Motif de l'absence..."
                  style={{
                    width: '100%', padding: '8px 12px', background: DARK,
                    border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddAbsence(false)}
                style={{
                  padding: '8px 16px', background: 'transparent', border: `1px solid ${BORDER}`,
                  borderRadius: 6, color: MUTED, cursor: 'pointer', fontSize: 13,
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleAddAbsence}
                style={{
                  padding: '8px 16px', background: GOLD, border: 'none',
                  borderRadius: 6, color: DARK, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste absences du mois */}
      {absences.filter(a => {
        const s = new Date(a.startDate)
        const e = new Date(a.endDate || a.startDate)
        return (s.getMonth() <= month && e.getMonth() >= month && s.getFullYear() <= year && e.getFullYear() >= year)
      }).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ color: GOLD, fontSize: 14, margin: '0 0 12px 0' }}>Absences du mois</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {absences.filter(a => {
              const s = new Date(a.startDate)
              const e = new Date(a.endDate || a.startDate)
              return (s.getMonth() <= month && e.getMonth() >= month && s.getFullYear() <= year && e.getFullYear() >= year)
            }).map(a => {
              const t = ABSENCE_TYPES[a.type]
              return (
                <div key={a.id} style={{
                  padding: '8px 12px', background: DARK, borderRadius: 6,
                  border: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                      background: (t?.color || GOLD) + '22', color: t?.color || GOLD,
                    }}>
                      {t?.short || '?'}
                    </span>
                    <span style={{ fontSize: 13, color: TEXT }}>{a.employeeName || 'N/A'}</span>
                    <span style={{ fontSize: 12, color: MUTED }}>
                      {new Date(a.startDate).toLocaleDateString('fr-BE')}
                      {a.endDate && a.endDate !== a.startDate ? ` → ${new Date(a.endDate).toLocaleDateString('fr-BE')}` : ''}
                    </span>
                    {a.reason && <span style={{ fontSize: 11, color: MUTED }}>— {a.reason}</span>}
                  </div>
                  <button
                    onClick={() => handleDeleteAbsence(a.id)}
                    style={{
                      background: 'transparent', border: 'none', color: '#ef4444',
                      cursor: 'pointer', fontSize: 12, padding: '2px 8px',
                    }}
                  >
                    Suppr.
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export { ABSENCE_TYPES, getJoursFeries, easterDate }
