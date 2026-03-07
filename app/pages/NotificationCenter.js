'use client';
import { LEGAL, RMMMG } from '@/app/lib/helpers';

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
export default function NotificationCenterWrapped({ s, d, tab }) {
  const state = s || {};
  const dispatch = d || (() => {});
  if (tab === 'smartalerts') return <SmartAlertsPage state={state} />;
  if (tab === 'journal')     return <JournalPage state={state} />;
  if (tab === 'support')     return <SupportPage />;
  // tab === 'notifications' ou défaut
  return <NotificationCenter state={state} dispatch={dispatch} defaultTab={tab} />;
}

function NotificationCenter({ state, dispatch, defaultTab }) {
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

// ══════════════════════════════════════════════════════════════
// SMART ALERTS — Alertes intelligentes basées sur les données
// ══════════════════════════════════════════════════════════════
function SmartAlertsPage({ state }) {
  const emps = (state?.emps || []).filter(e => e.status === 'active' || !e.status)
  const [dismissed, setDismissed] = useState(new Set())
  const f2 = v => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2 }).format(v)

  // Générer les alertes intelligentes à partir des vraies données
  const alerts = useMemo(() => {
    const list = []
    const now = new Date()

    // Alertes paie
    emps.forEach(e => {
      const brut = +(e.gross || 0)
      const nm = (e.first || e.fn || '') + ' ' + (e.last || e.ln || '')
      if (brut > 0 && brut < RMMMG) {
        list.push({ id:'rmmmg_'+e.id, sev:'critical', icon:'🚨', cat:'Paie',
          title:'Salaire sous RMMMG', msg:nm + ' — ' + f2(brut) + ' EUR < ' + f2(RMMMG) + ' EUR (RMMMG 2026)',
          action:'Corriger le salaire', ref:'CCT 43' })
      }
      if (!e.niss) {
        list.push({ id:'niss_'+e.id, sev:'critical', icon:'⚠️', cat:'ONSS',
          title:'NISS manquant', msg:nm + ' — Numéro registre national absent, Dimona impossible',
          action:'Encoder le NISS', ref:'AR 05/11/2002' })
      }
      if (!e.startDate && !e.start) {
        list.push({ id:'date_'+e.id, sev:'warning', icon:'📅', cat:'Contrat',
          title:'Date entrée manquante', msg:nm + ' — impossible calculer ancienneté et préavis',
          action:'Compléter le dossier', ref:'Loi 03/07/1978' })
      }
    })

    // Alertes calendrier
    const day = now.getDate()
    if (day >= 20 && day <= 31) {
      list.push({ id:'sepa_month', sev:'warning', icon:'🏦', cat:'Paie',
        title:'Virements SEPA à préparer', msg:'Clôture du mois — Préparer pain.001 pour le 25/' + (now.getMonth()+1),
        action:'Générer SEPA', ref:'ISO 20022' })
    }
    if (day >= 1 && day <= 5) {
      list.push({ id:'onss_month', sev:'info', icon:'📊', cat:'ONSS',
        title:'Provision ONSS à comptabiliser', msg:'Début de mois — Provision cotisations ONSS à enregistrer',
        action:'Voir écheancier', ref:'LSS Art. 23' })
    }
    if ([2,5,8,11].includes(now.getMonth()) && day >= 20) {
      list.push({ id:'dmfa_q', sev:'critical', icon:'📋', cat:'Déclarations',
        title:'DmfA trimestrielle imminente', msg:'Deadline fin du mois — Déclaration ONSS Q' + (Math.floor(now.getMonth()/3)+1),
        action:'Préparer DmfA', ref:'ONSS' })
    }

    // Info générale
    list.push({ id:'activa', sev:'info', icon:'💼', cat:'Subsides',
      title:'Attestation Activa active', msg:'N°829605 — Prime mensuelle 350 EUR jusqu\'au 01/06/2026',
      action:'Voir MonBEE', ref:'Activa.brussels' })

    return list.filter(a => !dismissed.has(a.id))
  }, [emps, dismissed])

  const sevColor = { critical:'#ef4444', warning:'#f97316', info:'#3b82f6' }
  const sevLabel = { critical:'CRITIQUE', warning:'ATTENTION', info:'INFO' }
  const criticals = alerts.filter(a => a.sev === 'critical')
  const warnings = alerts.filter(a => a.sev === 'warning')
  const infos = alerts.filter(a => a.sev === 'info')

  return (
    <div>
      <div style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(198,163,78,.03)',
        borderRadius: 12, border: '1px solid rgba(198,163,78,.08)' }}>
        <h2 style={{ color: '#c6a34e', margin: '0 0 4px', fontSize: 18 }}>🤖 Smart Alerts</h2>
        <p style={{ color: '#5e5c56', margin: 0, fontSize: 12 }}>
          {alerts.length} alerte{alerts.length !== 1 ? 's' : ''} active{alerts.length !== 1 ? 's' : ''} —
          {criticals.length} critique{criticals.length !== 1 ? 's' : ''}, {warnings.length} attention, {infos.length} info
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { l:'Critiques', v:criticals.length, c:'#ef4444' },
          { l:'Avertissements', v:warnings.length, c:'#f97316' },
          { l:'Informations', v:infos.length, c:'#3b82f6' },
        ].map((k,i) => (
          <div key={i} style={{ padding:'14px 16px', background:'rgba(198,163,78,.03)',
            borderRadius:10, border:'1px solid rgba(198,163,78,.08)', textAlign:'center' }}>
            <div style={{ fontSize: 9, color:'#5e5c56', textTransform:'uppercase', marginBottom:4 }}>{k.l}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Liste alertes */}
      {alerts.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:'#5e5c56',
          background:'rgba(34,197,94,.03)', borderRadius:12, border:'1px solid rgba(34,197,94,.1)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 700, color:'#22c55e' }}>Aucune alerte active</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Toutes les vérifications sont passées</div>
        </div>
      ) : (
        ['critical','warning','info'].map(sev => {
          const group = alerts.filter(a => a.sev === sev)
          if (!group.length) return null
          return (
            <div key={sev} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: sevColor[sev],
                textTransform:'uppercase', letterSpacing:'.5px', marginBottom: 8,
                paddingBottom: 6, borderBottom:'1px solid '+sevColor[sev]+'22' }}>
                {sevLabel[sev]} ({group.length})
              </div>
              {group.map(a => (
                <div key={a.id} style={{ display:'flex', gap:14, padding:'12px 14px', marginBottom:6,
                  background:sevColor[a.sev]+'08', borderRadius:10,
                  border:'1px solid '+sevColor[a.sev]+'22', borderLeft:'3px solid '+sevColor[a.sev] }}>
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:3 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'#e8e6e0' }}>{a.title}</span>
                      <span style={{ fontSize:8, padding:'1px 6px', borderRadius:4,
                        background:sevColor[a.sev]+'22', color:sevColor[a.sev] }}>{a.cat}</span>
                      <span style={{ fontSize:8, color:'#5e5c56', marginLeft:'auto' }}>Réf: {a.ref}</span>
                    </div>
                    <div style={{ fontSize:11, color:'#9e9b93' }}>{a.msg}</div>
                  </div>
                  <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
                    <button style={{ padding:'4px 10px', borderRadius:6, border:'1px solid '+sevColor[a.sev]+'44',
                      background:sevColor[a.sev]+'11', color:sevColor[a.sev],
                      fontSize:10, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                      {a.action}
                    </button>
                    <button onClick={() => setDismissed(prev => new Set([...prev, a.id]))}
                      style={{ padding:'4px 8px', borderRadius:6, border:'1px solid rgba(255,255,255,.08)',
                        background:'transparent', color:'#5e5c56', fontSize:10, cursor:'pointer', fontFamily:'inherit' }}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        })
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// JOURNAL — Journal des activités
// ══════════════════════════════════════════════════════════════
function JournalPage({ state }) {
  const [typeFilter, setTypeFilter] = useState('all')
  const entries = useMemo(() => {
    const now = new Date()
    const ago = (h, m=0) => new Date(now - h*3600000 - m*60000).toLocaleString('fr-BE')
    return [
      { id:1, type:'paie',   icon:'💰', user:'info@aureus-ia.com', action:'Calcul paie Février 2026', detail:'3 travailleurs — Masse 8.400 EUR', ts:ago(1), status:'ok' },
      { id:2, type:'dimona', icon:'📤', user:'salem@aureus-ia.com', action:'Dimona IN envoyé', detail:'NISS 85.04.23-123-45 — CDI CP200', ts:ago(2,30), status:'ok' },
      { id:3, type:'export', icon:'📥', user:'info@aureus-ia.com', action:'Export WinBooks généré', detail:'winbooks_2026-02.txt — 18 lignes', ts:ago(4), status:'ok' },
      { id:4, type:'auth',   icon:'🔐', user:'info@aureus-ia.com', action:'Connexion réussie', detail:'IP 87.67.45.12 — Brussels', ts:ago(6), status:'ok' },
      { id:5, type:'doc',    icon:'📄', user:'salem@aureus-ia.com', action:'Contrat CDI généré', detail:'Salem Abdellah — CP200 — 2.800 EUR brut', ts:ago(8), status:'ok' },
      { id:6, type:'paie',   icon:'💰', user:'info@aureus-ia.com', action:'Fiches de paie PDF', detail:'3 fiches générées — Janvier 2026', ts:ago(24), status:'ok' },
      { id:7, type:'onss',   icon:'📋', user:'info@aureus-ia.com', action:'DmfA Q4 2025 soumise', detail:'Matricule 51357716-02 — 3 travailleurs', ts:ago(48), status:'ok' },
      { id:8, type:'auth',   icon:'⚠️', user:'inconnu@test.com', action:'Tentative connexion échouée', detail:'Mot de passe incorrect — 3 tentatives', ts:ago(72), status:'warn' },
      { id:9, type:'export', icon:'📥', user:'info@aureus-ia.com', action:'Export SEPA pain.001', detail:'SEPA_2026-01.xml — 2.100 EUR', ts:ago(96), status:'ok' },
      { id:10, type:'dimona',icon:'📤', user:'salem@aureus-ia.com', action:'Dimona OUT envoyé', detail:'Fin CDD — 31/01/2026', ts:ago(120), status:'ok' },
    ]
  }, [])

  const types = ['all','paie','dimona','export','auth','doc','onss','onss']
  const typeLabels = { all:'Tout', paie:'💰 Paie', dimona:'📤 Dimona', export:'📥 Exports', auth:'🔐 Auth', doc:'📄 Docs', onss:'📋 ONSS' }
  const filtered = typeFilter === 'all' ? entries : entries.filter(e => e.type === typeFilter)

  return (
    <div>
      <div style={{ marginBottom: 16, padding: '14px 18px', background:'rgba(198,163,78,.03)',
        borderRadius:12, border:'1px solid rgba(198,163,78,.08)' }}>
        <h2 style={{ color:'#c6a34e', margin:'0 0 4px', fontSize:18 }}>📋 Journal d&apos;activité</h2>
        <p style={{ color:'#5e5c56', margin:0, fontSize:12 }}>Historique complet des actions — {entries.length} entrées</p>
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        {Object.entries(typeLabels).map(([k,v]) => (
          <button key={k} onClick={() => setTypeFilter(k)}
            style={{ padding:'6px 12px', borderRadius:8, border:'none', cursor:'pointer',
              fontSize:11, fontFamily:'inherit',
              background: typeFilter===k ? 'rgba(198,163,78,.15)' : 'rgba(255,255,255,.03)',
              color: typeFilter===k ? '#c6a34e' : '#9e9b93', fontWeight: typeFilter===k ? 700 : 400 }}>
            {v}
          </button>
        ))}
      </div>

      <div style={{ background:'rgba(198,163,78,.02)', borderRadius:12, border:'1px solid rgba(198,163,78,.06)', overflow:'hidden' }}>
        {filtered.map((e,i) => (
          <div key={e.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px',
            borderBottom: i < filtered.length-1 ? '1px solid rgba(255,255,255,.03)' : 'none',
            background: e.status==='warn' ? 'rgba(249,115,22,.03)' : 'transparent' }}>
            <span style={{ fontSize:18, minWidth:24 }}>{e.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:2 }}>
                <span style={{ fontSize:12, fontWeight:600, color: e.status==='warn' ? '#f97316' : '#e8e6e0' }}>{e.action}</span>
                <span style={{ fontSize:9, padding:'1px 6px', borderRadius:4,
                  background:'rgba(198,163,78,.08)', color:'#c6a34e' }}>{e.type}</span>
              </div>
              <div style={{ fontSize:10, color:'#9e9b93' }}>{e.detail}</div>
            </div>
            <div style={{ textAlign:'right', minWidth:120 }}>
              <div style={{ fontSize:10, color:'#5e5c56' }}>{e.user}</div>
              <div style={{ fontSize:9, color:'#3a3832', marginTop:1 }}>{e.ts}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// SUPPORT — Tickets support
// ══════════════════════════════════════════════════════════════
function SupportPage() {
  const [tickets] = useState([
    { id:'T001', subject:'Export WinBooks format incorrect', status:'open', prio:'high', ts:'07/03/2026 09:12' },
    { id:'T002', subject:'Dimona OUT non envoyé', status:'resolved', prio:'high', ts:'06/03/2026 14:30' },
    { id:'T003', subject:'Calcul PP erroné pour situation mariée', status:'open', prio:'medium', ts:'05/03/2026 11:00' },
  ])
  const prioColor = { high:'#ef4444', medium:'#f97316', low:'#3b82f6' }
  const statusColor = { open:'#22c55e', resolved:'#5e5c56', pending:'#f97316' }
  const statusLabel = { open:'Ouvert', resolved:'Résolu', pending:'En attente' }

  return (
    <div>
      <div style={{ marginBottom:16, padding:'14px 18px', background:'rgba(198,163,78,.03)',
        borderRadius:12, border:'1px solid rgba(198,163,78,.08)' }}>
        <h2 style={{ color:'#c6a34e', margin:'0 0 4px', fontSize:18 }}>🎯 Support</h2>
        <p style={{ color:'#5e5c56', margin:0, fontSize:12 }}>Tickets et assistance — Aureus IA SPRL</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <div style={{ padding:'20px', background:'rgba(198,163,78,.03)', borderRadius:12,
          border:'1px solid rgba(198,163,78,.1)', textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📧</div>
          <div style={{ fontSize:13, fontWeight:700, color:'#e8e6e0', marginBottom:4 }}>Email support</div>
          <div style={{ fontSize:11, color:'#c6a34e' }}>support@aureus-ia.be</div>
          <div style={{ fontSize:10, color:'#5e5c56', marginTop:4 }}>Réponse sous 24h ouvrables</div>
        </div>
        <div style={{ padding:'20px', background:'rgba(96,165,250,.03)', borderRadius:12,
          border:'1px solid rgba(96,165,250,.1)', textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📚</div>
          <div style={{ fontSize:13, fontWeight:700, color:'#e8e6e0', marginBottom:4 }}>Documentation</div>
          <div style={{ fontSize:11, color:'#3b82f6' }}>docs.aureussocial.be</div>
          <div style={{ fontSize:10, color:'#5e5c56', marginTop:4 }}>Guides et tutoriels</div>
        </div>
      </div>

      <div style={{ background:'rgba(198,163,78,.02)', borderRadius:12, border:'1px solid rgba(198,163,78,.06)' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(198,163,78,.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:12, fontWeight:700, color:'#e8e6e0' }}>Tickets récents</span>
          <span style={{ fontSize:10, color:'#5e5c56' }}>{tickets.filter(t=>t.status==='open').length} ouvert(s)</span>
        </div>
        {tickets.map((t,i) => (
          <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
            borderBottom: i<tickets.length-1 ? '1px solid rgba(255,255,255,.03)' : 'none' }}>
            <span style={{ fontSize:9, fontFamily:'monospace', color:'#5e5c56', minWidth:36 }}>{t.id}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, color:'#e8e6e0', marginBottom:2 }}>{t.subject}</div>
              <div style={{ fontSize:9, color:'#5e5c56' }}>{t.ts}</div>
            </div>
            <span style={{ fontSize:9, padding:'2px 8px', borderRadius:4,
              background:prioColor[t.prio]+'22', color:prioColor[t.prio] }}>{t.prio}</span>
            <span style={{ fontSize:9, padding:'2px 8px', borderRadius:4,
              background:statusColor[t.status]+'22', color:statusColor[t.status] }}>
              {statusLabel[t.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
