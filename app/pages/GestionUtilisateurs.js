'use client'
import { useState, useEffect } from 'react'
import { authFetch } from '@/app/lib/auth-fetch'
import { ROLES, ROLE_LABELS, ROLE_COLORS, ROLE_DESCRIPTIONS } from '@/app/lib/permissions'

const ROLE_ICONS = {
  admin: '👑', secretariat: '📋', commercial: '🎯',
  rh_entreprise: '🏢', employe: '👤', comptable: '🧮'
}

export default function GestionUtilisateurs({ state, dispatch }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('liste')
  const [form, setForm] = useState({ email: '', role: 'secretariat', nom: '', prenom: '', societe: '' })
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState(null)
  const [editUser, setEditUser] = useState(null)
  const [newRole, setNewRole] = useState('')

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }
  const input = { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', width: '100%', fontSize: 14, boxSizing: 'border-box' }
  const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 500 }
  const btn = (v = 'primary') => ({ background: v === 'primary' ? '#c6a34e' : v === 'danger' ? '#ef4444' : '#1f2937', color: v === 'primary' ? '#000' : '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 13 })
  const tabS = (a) => ({ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: a ? '#c6a34e' : 'transparent', color: a ? '#000' : '#9ca3af', border: 'none' })
  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  // Charger la liste des utilisateurs
  async function loadUsers() {
    setLoading(true)
    try {
      const r = await authFetch('/api/invite-role?action=list')
      const j = await r.json()
      if (j.users) setUsers(j.users)
    } catch(e) {}
    finally { setLoading(false) }
  }

  useEffect(() => { loadUsers() }, [])

  // Inviter un utilisateur
  async function inviteUser() {
    if (!form.email || !form.role) return
    setSending(true); setMsg(null)
    try {
      const r = await authFetch('/api/invite-role', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          role: form.role,
          nom: form.nom,
          prenom: form.prenom,
          societe: form.societe,
        })
      })
      const j = await r.json()
      if (j.ok || j.message) {
        setMsg({ type: 'success', text: `✅ Invitation envoyée à ${form.email} avec le rôle ${ROLE_LABELS[form.role]}` })
        setForm({ email: '', role: 'secretariat', nom: '', prenom: '', societe: '' })
        loadUsers()
      } else {
        setMsg({ type: 'error', text: `❌ ${j.error || 'Erreur lors de l\'invitation'}` })
      }
    } catch(e) {
      setMsg({ type: 'error', text: `❌ ${e.message}` })
    } finally { setSending(false) }
  }

  // Modifier le rôle d'un utilisateur
  async function updateRole(userId, role) {
    try {
      const r = await authFetch('/api/invite-role', {
        method: 'PUT',
        body: JSON.stringify({ userId, role })
      })
      const j = await r.json()
      if (j.ok) {
        setMsg({ type: 'success', text: `✅ Rôle mis à jour → ${ROLE_LABELS[role]}` })
        setEditUser(null)
        loadUsers()
      } else {
        setMsg({ type: 'error', text: `❌ ${j.error}` })
      }
    } catch(e) {
      setMsg({ type: 'error', text: `❌ ${e.message}` })
    }
  }

  // Désactiver un utilisateur
  async function deactivateUser(userId, email) {
    if (!confirm(`Désactiver le compte de ${email} ?`)) return
    try {
      const r = await authFetch(`/api/invite-role?userId=${userId}`, { method: 'DELETE' })
      const j = await r.json()
      if (j.ok) {
        setMsg({ type: 'success', text: `✅ Compte ${email} désactivé` })
        loadUsers()
      } else {
        setMsg({ type: 'error', text: `❌ ${j.error}` })
      }
    } catch(e) {
      setMsg({ type: 'error', text: `❌ ${e.message}` })
    }
  }

  return (
    <div style={s}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>👥</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Gestion des Utilisateurs</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Inviter · Assigner un rôle · Gérer les accès — sans passer par Supabase</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['liste', `👥 Utilisateurs (${users.length})`], ['inviter', '➕ Inviter'], ['roles', '🎭 Rôles']].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} style={tabS(tab === id)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Message */}
      {msg && (
        <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: msg.type === 'success' ? '#0d1a0d' : '#1a0d0d', border: `1px solid ${msg.type === 'success' ? '#10b981' : '#ef4444'}`, fontSize: 13, color: msg.type === 'success' ? '#10b981' : '#ef4444', display: 'flex', justifyContent: 'space-between' }}>
          {msg.text}
          <span onClick={() => setMsg(null)} style={{ cursor: 'pointer', opacity: 0.6 }}>✕</span>
        </div>
      )}

      {/* LISTE UTILISATEURS */}
      {tab === 'liste' && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Utilisateurs actifs</h3>
            <button onClick={loadUsers} style={{ ...btn('secondary'), padding: '6px 12px', fontSize: 12 }}>
              {loading ? '⏳' : '🔄'} Actualiser
            </button>
          </div>

          {loading && <div style={{ color: '#6b7280', textAlign: 'center', padding: 32 }}>Chargement...</div>}

          {!loading && users.length === 0 && (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
              Aucun utilisateur trouvé. Utilisez "Inviter" pour ajouter des accès.
            </div>
          )}

          {!loading && users.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#1a1a1a' }}>
                  {['Utilisateur', 'Rôle', 'Créé le', 'Dernière connexion', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const role = u.user_metadata?.role || 'rh_entreprise'
                  const color = ROLE_COLORS[role] || '#6b7280'
                  const isEditing = editUser === u.id
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600 }}>{u.user_metadata?.prenom || ''} {u.user_metadata?.nom || u.email?.split('@')[0]}</div>
                        <div style={{ fontSize: 11, color: '#6b7280' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {isEditing ? (
                          <select value={newRole || role} onChange={e => setNewRole(e.target.value)}
                            style={{ ...input, width: 160, padding: '5px 8px', fontSize: 12 }}>
                            {ROLES.map(r => <option key={r} value={r}>{ROLE_ICONS[r]} {ROLE_LABELS[r]}</option>)}
                          </select>
                        ) : (
                          <span style={{ background: color + '20', color, border: `1px solid ${color}40`, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                            {ROLE_ICONS[role]} {ROLE_LABELS[role] || role}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 11 }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-BE') : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 11 }}>
                        {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('fr-BE') : 'Jamais'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => updateRole(u.id, newRole || role)} style={{ ...btn('primary'), padding: '5px 10px', fontSize: 11 }}>✓ Sauver</button>
                            <button onClick={() => { setEditUser(null); setNewRole('') }} style={{ ...btn('secondary'), padding: '5px 10px', fontSize: 11 }}>✕</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { setEditUser(u.id); setNewRole(role) }} style={{ ...btn('secondary'), padding: '5px 10px', fontSize: 11 }}>✏️ Rôle</button>
                            <button onClick={() => deactivateUser(u.id, u.email)} style={{ ...btn('danger'), padding: '5px 10px', fontSize: 11 }}>🚫</button>
                          </div>
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

      {/* INVITER */}
      {tab === 'inviter' && (
        <div style={{ maxWidth: 600 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#c6a34e' }}>➕ Inviter un utilisateur</h3>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>
              Un email d'invitation sera envoyé avec les instructions d'accès selon le rôle choisi.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Prénom</label>
                <input style={input} value={form.prenom} onChange={e => set('prenom', e.target.value)} placeholder="Ex: Jean" />
              </div>
              <div>
                <label style={lbl}>Nom</label>
                <input style={input} value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="Ex: Dupont" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Email *</label>
                <input type="email" style={input} value={form.email} onChange={e => set('email', e.target.value)} placeholder="jean.dupont@exemple.be" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Société / Fiduciaire</label>
                <input style={input} value={form.societe} onChange={e => set('societe', e.target.value)} placeholder="Ex: Fiduciaire ABC" />
              </div>
            </div>

            {/* Sélection rôle visuelle */}
            <label style={lbl}>Rôle *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
              {ROLES.map(r => {
                const color = ROLE_COLORS[r]
                const selected = form.role === r
                return (
                  <div key={r} onClick={() => set('role', r)}
                    style={{ padding: 12, borderRadius: 10, cursor: 'pointer', border: `1px solid ${selected ? color : '#2a2a2a'}`, background: selected ? color + '15' : '#0d0d0d', transition: 'all .15s' }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{ROLE_ICONS[r]}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: selected ? color : '#f1f5f9' }}>{ROLE_LABELS[r]}</div>
                    <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3, lineHeight: 1.4 }}>{ROLE_DESCRIPTIONS[r]?.split(' — ')[0]}</div>
                  </div>
                )
              })}
            </div>

            {/* Preview accès */}
            {form.role && (
              <div style={{ background: '#0d1117', border: `1px solid ${ROLE_COLORS[form.role]}30`, borderRadius: 8, padding: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: ROLE_COLORS[form.role], fontWeight: 700, marginBottom: 6 }}>
                  {ROLE_ICONS[form.role]} Accès avec le rôle {ROLE_LABELS[form.role]}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{ROLE_DESCRIPTIONS[form.role]}</div>
              </div>
            )}

            <button onClick={inviteUser} disabled={!form.email || sending}
              style={{ ...btn('primary'), width: '100%', padding: 14, fontSize: 15, opacity: (!form.email || sending) ? 0.5 : 1 }}>
              {sending ? '⏳ Envoi en cours...' : '📧 Envoyer l\'invitation →'}
            </button>
          </div>
        </div>
      )}

      {/* ROLES INFO */}
      {tab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
          {ROLES.map(r => {
            const color = ROLE_COLORS[r]
            const count = users.filter(u => (u.user_metadata?.role || 'rh_entreprise') === r).length
            return (
              <div key={r} style={{ ...card, borderLeft: `3px solid ${color}`, marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 24 }}>{ROLE_ICONS[r]}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color }}>{ROLE_LABELS[r]}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{count} utilisateur(s)</div>
                    </div>
                  </div>
                  <button onClick={() => { set('role', r); setTab('inviter') }}
                    style={{ ...btn('secondary'), padding: '5px 12px', fontSize: 11 }}>
                    + Inviter
                  </button>
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>{ROLE_DESCRIPTIONS[r]}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
