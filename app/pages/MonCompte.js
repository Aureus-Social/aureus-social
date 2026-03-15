'use client'
import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { ROLE_LABELS, ROLE_COLORS } from '@/app/lib/permissions'

export default function MonCompte({ user }) {
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const role = user?.user_metadata?.role || 'rh_entreprise'
  const prenom = user?.user_metadata?.prenom || ''
  const nom = user?.user_metadata?.nom || ''
  const societe = user?.user_metadata?.societe || ''
  const color = ROLE_COLORS[role] || '#c6a34e'

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 24, marginBottom: 16 }
  const input = { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', width: '100%', fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' }
  const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 6, fontWeight: 500 }

  async function changePassword() {
    if (!newPwd || !confirmPwd) return setMsg({ type: 'error', text: 'Remplissez tous les champs' })
    if (newPwd.length < 8) return setMsg({ type: 'error', text: 'Minimum 8 caractères' })
    if (newPwd !== confirmPwd) return setMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas' })

    setLoading(true)
    setMsg(null)

    try {
      // Vérifier l'ancien mot de passe en se reconnectant
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPwd
      })
      if (signInErr) {
        setMsg({ type: 'error', text: 'Ancien mot de passe incorrect' })
        setLoading(false)
        return
      }

      // Changer le mot de passe
      const { error } = await supabase.auth.updateUser({ password: newPwd })
      if (error) {
        setMsg({ type: 'error', text: error.message })
      } else {
        setMsg({ type: 'success', text: '✅ Mot de passe changé avec succès !' })
        setOldPwd(''); setNewPwd(''); setConfirmPwd('')
      }
    } catch(e) {
      setMsg({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  const strength = newPwd.length === 0 ? 0 : newPwd.length < 6 ? 1 : newPwd.length < 10 ? 2 : /[A-Z]/.test(newPwd) && /[0-9]/.test(newPwd) ? 4 : 3
  const strengthLabel = ['', 'Faible', 'Moyen', 'Bon', 'Fort']
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981']

  return (
    <div style={s}>
      <div style={{ maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>⚙️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Mon Compte</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Gérez vos informations et votre mot de passe</p>
          </div>
        </div>

        {/* Profil */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: color + '20', border: `2px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {prenom ? prenom[0].toUpperCase() : user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{prenom} {nom}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{user?.email}</div>
              <span style={{ background: color + '20', color, border: `1px solid ${color}40`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700, display: 'inline-block', marginTop: 4 }}>
                {ROLE_LABELS[role] || role}
              </span>
              {societe && <div style={{ fontSize: 12, color: '#c6a34e', marginTop: 4 }}>{societe}</div>}
            </div>
          </div>
          <div style={{ background: '#0d0d0d', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#6b7280' }}>
            Membre depuis le {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-BE', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
          </div>
        </div>

        {/* Changer mot de passe */}
        <div style={card}>
          <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: '#c6a34e' }}>🔐 Changer mon mot de passe</h3>

          {msg && (
            <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, background: msg.type === 'success' ? '#0d1a0d' : '#1a0d0d', border: `1px solid ${msg.type === 'success' ? '#10b981' : '#ef4444'}`, fontSize: 13, color: msg.type === 'success' ? '#10b981' : '#ef4444' }}>
              {msg.text}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Mot de passe actuel</label>
            <div style={{ position: 'relative' }}>
              <input type={showOld ? 'text' : 'password'} value={oldPwd} onChange={e => setOldPwd(e.target.value)}
                placeholder="Votre mot de passe actuel" style={input} />
              <button onClick={() => setShowOld(!showOld)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14 }}>
                {showOld ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Nouveau mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input type={showNew ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)}
                placeholder="Minimum 8 caractères" style={input} />
              <button onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14 }}>
                {showNew ? '🙈' : '👁️'}
              </button>
            </div>
            {newPwd && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#1a1a1a', overflow: 'hidden' }}>
                  <div style={{ width: `${strength * 25}%`, height: '100%', background: strengthColor[strength], transition: 'all .3s' }} />
                </div>
                <span style={{ fontSize: 11, color: strengthColor[strength], fontWeight: 600 }}>{strengthLabel[strength]}</span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Confirmer le nouveau mot de passe</label>
            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
              placeholder="Retapez le nouveau mot de passe"
              style={{ ...input, borderColor: confirmPwd && confirmPwd !== newPwd ? '#ef4444' : '#2a2a2a' }} />
            {confirmPwd && confirmPwd !== newPwd && (
              <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Les mots de passe ne correspondent pas</div>
            )}
          </div>

          <button onClick={changePassword} disabled={loading || !oldPwd || !newPwd || !confirmPwd}
            style={{ width: '100%', padding: 14, borderRadius: 8, border: 'none', background: '#c6a34e', color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', opacity: (loading || !oldPwd || !newPwd || !confirmPwd) ? 0.5 : 1 }}>
            {loading ? '⏳ Mise à jour...' : '🔐 Changer mon mot de passe'}
          </button>
        </div>

        {/* Conseils sécurité */}
        <div style={{ ...card, borderColor: '#1e3a5f', background: '#0d1117' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', marginBottom: 8 }}>💡 Conseils de sécurité</div>
          {['Minimum 8 caractères', 'Mélangez majuscules, minuscules et chiffres', 'N\'utilisez pas votre date de naissance', 'N\'utilisez pas ce mot de passe sur d\'autres sites'].map((t, i) => (
            <div key={i} style={{ fontSize: 12, color: '#6b7280', padding: '3px 0' }}>· {t}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
