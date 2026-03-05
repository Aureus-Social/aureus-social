'use client'

// ═══════════════════════════════════════════════════════
//  AUREUS SOCIAL PRO — Module: Centre de Notifications
//  Notifications in-app + Push + Historique
//  Alertes légales, rappels paie, échéances ONSS/PP
// ═══════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'

const GOLD = '#c6a34e'
const DARK = '#0d1117'
const BORDER = '#1e2633'
const TEXT = '#e0e0e0'
const MUTED = '#8b95a5'

// ── Types de notification ──
const NOTIF_TYPES = {
  DEADLINE: { label: 'Échéance', color: '#ef4444', icon: '⏰' },
  PAYROLL: { label: 'Paie', color: '#22c55e', icon: '💰' },
  ONSS: { label: 'ONSS', color: '#3b82f6', icon: '🏛' },
  FISCAL: { label: 'Fiscal', color: '#f59e0b', icon: '📋' },
  LEGAL: { label: 'Légal', color: '#8b5cf6', icon: '⚖️' },
  HR: { label: 'RH', color: '#ec4899', icon: '👥' },
  SYSTEM: { label: 'Système', color: '#6b7280', icon: '⚙️' },
  DIMONA: { label: 'Dimona', color: '#06b6d4', icon: '📡' },
}

const PRIORITY = { HIGH: 3, MEDIUM: 2, LOW: 1 }

// ── Échéances légales belges 2026 ──
function generateLegalDeadlines(year = 2026) {
  return [
    { month: 1, day: 15, label: `PP décembre ${year - 1}`, type: 'FISCAL', priority: 'HIGH' },
    { month: 1, day: 31, label: 'ONSS T4 — acompte', type: 'ONSS', priority: 'HIGH' },
    { month: 1, day: 31, label: `DmfA T4/${year - 1} — délai de soumission`, type: 'ONSS', priority: 'HIGH' },
    { month: 2, day: 15, label: 'PP janvier', type: 'FISCAL', priority: 'HIGH' },
    { month: 2, day: 28, label: `Pécule de vacances (calcul anticipé) — ouvriers`, type: 'PAYROLL', priority: 'MEDIUM' },
    { month: 3, day: 1, label: `Belcotax 281.10/20/50 — année ${year - 1}`, type: 'FISCAL', priority: 'HIGH' },
    { month: 3, day: 15, label: 'PP février', type: 'FISCAL', priority: 'HIGH' },
    { month: 3, day: 31, label: 'ONSS T1 — déclaration + solde', type: 'ONSS', priority: 'HIGH' },
    { month: 4, day: 15, label: 'PP mars', type: 'FISCAL', priority: 'HIGH' },
    { month: 4, day: 30, label: 'DmfA T1 — délai de soumission', type: 'ONSS', priority: 'HIGH' },
    { month: 5, day: 15, label: 'PP avril', type: 'FISCAL', priority: 'HIGH' },
    { month: 5, day: 31, label: 'Bilan social — dépôt BNB', type: 'LEGAL', priority: 'MEDIUM' },
    { month: 6, day: 15, label: 'PP mai', type: 'FISCAL', priority: 'HIGH' },
    { month: 6, day: 30, label: 'ONSS T2 — déclaration + solde', type: 'ONSS', priority: 'HIGH' },
    { month: 6, day: 30, label: 'Pécule de vacances — calcul et paiement employés', type: 'PAYROLL', priority: 'HIGH' },
    { month: 7, day: 15, label: 'PP juin', type: 'FISCAL', priority: 'HIGH' },
    { month: 7, day: 31, label: 'DmfA T2 — délai de soumission', type: 'ONSS', priority: 'HIGH' },
    { month: 8, day: 15, label: 'PP juillet', type: 'FISCAL', priority: 'HIGH' },
    { month: 9, day: 15, label: 'PP août', type: 'FISCAL', priority: 'HIGH' },
    { month: 9, day: 30, label: 'ONSS T3 — déclaration + solde', type: 'ONSS', priority: 'HIGH' },
    { month: 10, day: 15, label: 'PP septembre', type: 'FISCAL', priority: 'HIGH' },
    { month: 10, day: 31, label: 'DmfA T3 — délai de soumission', type: 'ONSS', priority: 'HIGH' },
    { month: 11, day: 15, label: 'PP octobre', type: 'FISCAL', priority: 'HIGH' },
    { month: 12, day: 15, label: 'PP novembre', type: 'FISCAL', priority: 'HIGH' },
    { month: 12, day: 20, label: '13ème mois — calcul et paiement', type: 'PAYROLL', priority: 'HIGH' },
    { month: 12, day: 31, label: 'ONSS T4 — déclaration + solde', type: 'ONSS', priority: 'HIGH' },
    { month: 12, day: 31, label: 'Clôture annuelle paie', type: 'PAYROLL', priority: 'HIGH' },
  ]
}

// ── Générer les notifications basées sur l'état ──
function generateNotifications(state, now) {
  const notifications = []
  const year = now.getFullYear()
  const employees = state?.employees || []
  const company = state?.co || state?.company || {}

  // 1. Échéances légales
  const deadlines = generateLegalDeadlines(year)
  deadlines.forEach((dl, i) => {
    const deadline = new Date(year, dl.month - 1, dl.day)
    const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))

    if (daysUntil >= -3 && daysUntil <= 30) {
      notifications.push({
        id: `deadline-${year}-${dl.month}-${dl.day}-${i}`,
        type: dl.type,
        priority: dl.priority,
        title: dl.label,
        message: daysUntil < 0
          ? `En retard de ${Math.abs(daysUntil)} jour(s) !`
          : daysUntil === 0
          ? 'Échéance aujourd\'hui !'
          : `Dans ${daysUntil} jour(s) — ${deadline.toLocaleDateString('fr-BE')}`,
        date: deadline,
        daysUntil,
        read: false,
        category: 'deadline',
      })
    }
  })

  // 2. Contrats arrivant à expiration (CDD)
  employees.forEach(emp => {
    if (emp.endDate || emp.endD) {
      const endDate = new Date(emp.endDate || emp.endD)
      const daysUntil = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
      if (daysUntil >= 0 && daysUntil <= 30) {
        notifications.push({
          id: `contract-end-${emp.id || emp.niss}`,
          type: 'HR',
          priority: daysUntil <= 7 ? 'HIGH' : 'MEDIUM',
          title: `Fin de contrat — ${emp.first || ''} ${emp.last || ''}`,
          message: `CDD se termine le ${endDate.toLocaleDateString('fr-BE')} (${daysUntil}j)`,
          date: endDate,
          daysUntil,
          read: false,
          category: 'contract',
          employeeId: emp.id,
        })
      }
    }
  })

  // 3. Dimona à faire (nouveaux employés sans Dimona)
  employees.forEach(emp => {
    if (!emp.dimonaIn && !emp.endDate && !emp.inactive) {
      const startDate = emp.startD || emp.startDate
      if (startDate) {
        const start = new Date(startDate)
        const daysUntil = Math.ceil((start - now) / (1000 * 60 * 60 * 24))
        if (daysUntil >= -1 && daysUntil <= 14) {
          notifications.push({
            id: `dimona-${emp.id || emp.niss}`,
            type: 'DIMONA',
            priority: daysUntil <= 0 ? 'HIGH' : 'MEDIUM',
            title: `Dimona IN requise — ${emp.first || ''} ${emp.last || ''}`,
            message: daysUntil <= 0
              ? 'La déclaration Dimona IN doit être faite immédiatement !'
              : `Entrée en service le ${start.toLocaleDateString('fr-BE')} — Dimona IN à soumettre`,
            date: start,
            daysUntil,
            read: false,
            category: 'dimona',
            employeeId: emp.id,
          })
        }
      }
    }
  })

  // 4. Période d'essai (vérification après 6 mois)
  employees.forEach(emp => {
    const startDate = emp.startD || emp.startDate
    if (startDate && !emp.endDate && !emp.inactive) {
      const start = new Date(startDate)
      const sixMonths = new Date(start)
      sixMonths.setMonth(sixMonths.getMonth() + 6)
      const daysUntil = Math.ceil((sixMonths - now) / (1000 * 60 * 60 * 24))
      if (daysUntil >= 0 && daysUntil <= 14) {
        notifications.push({
          id: `eval-${emp.id || emp.niss}`,
          type: 'HR',
          priority: 'LOW',
          title: `Évaluation 6 mois — ${emp.first || ''} ${emp.last || ''}`,
          message: `6 mois de service le ${sixMonths.toLocaleDateString('fr-BE')}`,
          date: sixMonths,
          daysUntil,
          read: false,
          category: 'evaluation',
        })
      }
    }
  })

  // 5. Configuration société incomplète
  if (!company.name && employees.length > 0) {
    notifications.push({
      id: 'config-company',
      type: 'SYSTEM',
      priority: 'MEDIUM',
      title: 'Configuration société incomplète',
      message: 'Complétez les informations de votre société (nom, BCE, ONSS, etc.)',
      date: now,
      daysUntil: 0,
      read: false,
      category: 'system',
    })
  }

  // Trier: haute priorité + échéance proche en premier
  notifications.sort((a, b) => {
    const pDiff = PRIORITY[b.priority] - PRIORITY[a.priority]
    if (pDiff !== 0) return pDiff
    return a.daysUntil - b.daysUntil
  })

  return notifications
}

// ── Push Notifications ──
async function requestPushPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  const perm = await Notification.requestPermission()
  return perm
}

function sendPushNotification(title, options) {
  if ('Notification' in window && Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
    })
  }
}

// ── Composant: Badge de notification ──
export function NotifBadge({ count, onClick }) {
  if (!count) return null
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
        padding: 4, fontSize: 18, color: TEXT,
      }}
      title={`${count} notification(s)`}
    >
      🔔
      <span style={{
        position: 'absolute', top: -2, right: -4, minWidth: 16, height: 16,
        borderRadius: 8, background: '#ef4444', color: '#fff', fontSize: 10,
        fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 4px',
      }}>
        {count > 99 ? '99+' : count}
      </span>
    </button>
  )
}

// ── Composant: Mini-liste déroulante ──
export function NotifDropdown({ notifications, onClose, onMarkRead, onViewAll }) {
  const ref = useRef()

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose?.()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  const unread = notifications.filter(n => !n.read).slice(0, 8)

  return (
    <div ref={ref} style={{
      position: 'absolute', top: '100%', right: 0, width: 360, maxHeight: 440,
      background: '#111827', border: `1px solid ${BORDER}`, borderRadius: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 9999, overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px', borderBottom: `1px solid ${BORDER}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontWeight: 600, color: GOLD, fontSize: 14 }}>Notifications</span>
        <span style={{ fontSize: 11, color: MUTED }}>{unread.length} non lue(s)</span>
      </div>

      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        {unread.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: MUTED, fontSize: 13 }}>
            Aucune notification
          </div>
        ) : unread.map(n => {
          const t = NOTIF_TYPES[n.type] || NOTIF_TYPES.SYSTEM
          return (
            <div
              key={n.id}
              onClick={() => onMarkRead?.(n.id)}
              style={{
                padding: '10px 16px', borderBottom: `1px solid ${BORDER}22`,
                cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#1f2937'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>{t.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{n.message}</div>
              </div>
              {n.priority === 'HIGH' && (
                <span style={{
                  flexShrink: 0, width: 8, height: 8, borderRadius: 4,
                  background: '#ef4444', marginTop: 6,
                }} />
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={onViewAll}
        style={{
          width: '100%', padding: '10px 16px', background: DARK,
          border: 'none', borderTop: `1px solid ${BORDER}`, cursor: 'pointer',
          color: GOLD, fontSize: 12, fontWeight: 600, textAlign: 'center',
        }}
      >
        Voir toutes les notifications →
      </button>
    </div>
  )
}

// ── Composant principal: Page Notifications ──
export default function NotificationCenter({ state, dispatch }) {
  const [filter, setFilter] = useState('all')
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('aureus_notif_read') || '[]')) }
    catch { return new Set() }
  })
  const [pushStatus, setPushStatus] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  const now = useMemo(() => new Date(), [])
  const notifications = useMemo(() => generateNotifications(state, now), [state, now])

  // Marquer les IDs lus dans le state
  const enriched = useMemo(() =>
    notifications.map(n => ({ ...n, read: readIds.has(n.id) })),
    [notifications, readIds]
  )

  const filtered = useMemo(() => {
    if (filter === 'all') return enriched
    if (filter === 'unread') return enriched.filter(n => !n.read)
    if (filter === 'high') return enriched.filter(n => n.priority === 'HIGH')
    return enriched.filter(n => n.type === filter)
  }, [enriched, filter])

  const unreadCount = enriched.filter(n => !n.read).length

  const markRead = useCallback((id) => {
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      localStorage.setItem('aureus_notif_read', JSON.stringify([...next]))
      return next
    })
  }, [])

  const markAllRead = useCallback(() => {
    setReadIds(prev => {
      const next = new Set(prev)
      notifications.forEach(n => next.add(n.id))
      localStorage.setItem('aureus_notif_read', JSON.stringify([...next]))
      return next
    })
  }, [notifications])

  // Vérifier le statut push au mount
  useEffect(() => {
    if ('Notification' in window) {
      setPushStatus(Notification.permission)
    }
  }, [])

  const filters = [
    { key: 'all', label: 'Tout', count: enriched.length },
    { key: 'unread', label: 'Non lues', count: unreadCount },
    { key: 'high', label: 'Urgentes', count: enriched.filter(n => n.priority === 'HIGH' && !n.read).length },
    ...Object.entries(NOTIF_TYPES).map(([key, val]) => ({
      key, label: `${val.icon} ${val.label}`, count: enriched.filter(n => n.type === key).length,
    })).filter(f => f.count > 0),
  ]

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: GOLD, margin: '0 0 4px 0', fontSize: 20 }}>Centre de notifications</h2>
          <p style={{ color: MUTED, margin: 0, fontSize: 13 }}>
            {unreadCount} notification(s) non lue(s) — {enriched.length} au total
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                padding: '6px 14px', background: 'transparent', border: `1px solid ${BORDER}`,
                borderRadius: 6, color: MUTED, cursor: 'pointer', fontSize: 12,
              }}
            >
              Tout marquer comme lu
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              padding: '6px 14px', background: 'transparent', border: `1px solid ${BORDER}`,
              borderRadius: 6, color: MUTED, cursor: 'pointer', fontSize: 12,
            }}
          >
            Paramètres
          </button>
        </div>
      </div>

      {/* Paramètres Push */}
      {showSettings && (
        <div style={{
          padding: 16, background: DARK, borderRadius: 8, border: `1px solid ${BORDER}`,
          marginBottom: 20,
        }}>
          <h3 style={{ color: TEXT, margin: '0 0 12px 0', fontSize: 14 }}>Notifications Push</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: MUTED }}>
              Statut : {pushStatus === 'granted' ? '✅ Activées' : pushStatus === 'denied' ? '❌ Refusées' : '⏸ Non configurées'}
            </span>
            {pushStatus !== 'granted' && pushStatus !== 'denied' && (
              <button
                onClick={async () => {
                  const result = await requestPushPermission()
                  setPushStatus(result)
                  if (result === 'granted') {
                    sendPushNotification('Aureus Social Pro', {
                      body: 'Les notifications push sont maintenant activées !',
                    })
                  }
                }}
                style={{
                  padding: '6px 14px', background: `${GOLD}22`, border: `1px solid ${GOLD}`,
                  borderRadius: 6, color: GOLD, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                }}
              >
                Activer les notifications push
              </button>
            )}
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11, color: MUTED }}>
            Les notifications push vous alertent des échéances même lorsque l'application est fermée.
          </p>
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '5px 12px', borderRadius: 16, border: `1px solid ${filter === f.key ? GOLD : BORDER}`,
              background: filter === f.key ? `${GOLD}22` : 'transparent',
              color: filter === f.key ? GOLD : MUTED, cursor: 'pointer', fontSize: 12, fontWeight: 500,
            }}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Liste des notifications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{
            padding: 48, textAlign: 'center', color: MUTED, fontSize: 14,
            background: DARK, borderRadius: 8, border: `1px solid ${BORDER}`,
          }}>
            Aucune notification dans cette catégorie
          </div>
        ) : filtered.map(n => {
          const t = NOTIF_TYPES[n.type] || NOTIF_TYPES.SYSTEM
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                padding: '14px 16px', background: n.read ? DARK : '#111827',
                borderRadius: 8, border: `1px solid ${n.read ? BORDER : t.color + '44'}`,
                cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start',
                opacity: n.read ? 0.7 : 1, transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: t.color + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {t.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: n.read ? MUTED : TEXT }}>{n.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      padding: '1px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                      background: t.color + '22', color: t.color,
                    }}>
                      {t.label}
                    </span>
                    {n.priority === 'HIGH' && !n.read && (
                      <span style={{
                        padding: '1px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600,
                        background: '#ef444422', color: '#ef4444',
                      }}>
                        URGENT
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{n.message}</div>
                {n.daysUntil !== undefined && (
                  <div style={{
                    marginTop: 6, fontSize: 11,
                    color: n.daysUntil < 0 ? '#ef4444' : n.daysUntil <= 3 ? '#f59e0b' : MUTED,
                  }}>
                    {n.daysUntil < 0 ? `⚠ En retard de ${Math.abs(n.daysUntil)}j` :
                     n.daysUntil === 0 ? '⚡ Aujourd\'hui' :
                     `📅 Dans ${n.daysUntil} jour(s)`}
                  </div>
                )}
              </div>
              {!n.read && (
                <span style={{
                  width: 8, height: 8, borderRadius: 4, background: GOLD,
                  flexShrink: 0, marginTop: 6,
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Résumé mensuel */}
      {enriched.length > 0 && (
        <div style={{
          marginTop: 24, padding: 16, background: DARK, borderRadius: 8, border: `1px solid ${BORDER}`,
        }}>
          <h3 style={{ color: GOLD, margin: '0 0 12px 0', fontSize: 14 }}>Résumé</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {Object.entries(NOTIF_TYPES).map(([key, val]) => {
              const count = enriched.filter(n => n.type === key).length
              if (!count) return null
              return (
                <div key={key} style={{
                  padding: 10, background: val.color + '11', borderRadius: 6,
                  border: `1px solid ${val.color}22`, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{val.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: val.color }}>{count}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{val.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export { generateNotifications, NOTIF_TYPES, requestPushPermission, sendPushNotification }
