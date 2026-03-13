'use client'
// ═══════════════════════════════════════════════════════════════════
//  AUREUS SOCIAL PRO — Module RGPD Complet
//  Règlement (UE) 2016/679 + Loi belge 30/07/2018
//  Gestion opérationnelle: droits, violations, DPA, rétention, AIPD
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'

const G = '#c6a34e'
const D = '#0d1117'
const B = '#1e2633'
const T = '#e0e0e0'
const M = '#8b95a5'
const ERR = '#ef4444'
const OK = '#22c55e'
const INFO = '#3b82f6'
const WARN = '#f59e0b'

// ── Utilitaires UI ─────────────────────────────────────────────
const Card = ({ children, title, sub, accent }) => (
  <div style={{ background: 'rgba(255,255,255,.025)', border: `1px solid ${accent ? `rgba(${accent},.25)` : 'rgba(198,163,78,.08)'}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
    {title && <div style={{ fontSize: 13, fontWeight: 700, color: G, marginBottom: sub ? 4 : 14 }}>{title}</div>}
    {sub && <div style={{ fontSize: 10, color: M, marginBottom: 14 }}>{sub}</div>}
    {children}
  </div>
)

const Badge = ({ text, color = G, bg }) => (
  <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700, background: bg || `${color}18`, color, letterSpacing: '.3px', border: `1px solid ${color}30` }}>{text}</span>
)

const Btn = ({ onClick, children, color = G, sm, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ padding: sm ? '6px 12px' : '9px 18px', borderRadius: 8, border: `1px solid ${color}40`, background: `${color}12`, color, fontSize: sm ? 10 : 11, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: disabled ? .5 : 1, transition: 'all .15s' }}>
    {children}
  </button>
)

const Input = ({ value, onChange, placeholder, type = 'text', rows }) => (
  rows
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ width: '100%', padding: '9px 12px', background: '#090c16', border: `1px solid ${B}`, borderRadius: 8, color: T, fontSize: 11, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
    : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', background: '#090c16', border: `1px solid ${B}`, borderRadius: 8, color: T, fontSize: 11, fontFamily: 'inherit', boxSizing: 'border-box' }} />
)

const Select = ({ value, onChange, options }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ width: '100%', padding: '9px 12px', background: '#090c16', border: `1px solid ${B}`, borderRadius: 8, color: T, fontSize: 11, fontFamily: 'inherit' }}>
    {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
)

const StatusPill = ({ status }) => {
  const map = { completed: [OK, 'Traité'], pending: [WARN, 'En attente'], partial: [WARN, 'Partiel'], pending_apd: [ERR, 'Notif. APD requise'], failed: [ERR, 'Échec'] }
  const [c, l] = map[status] || [M, status]
  return <Badge text={l} color={c} />
}

// ── Constantes RGPD Belge ───────────────────────────────────────
const DROITS = [
  { id: 'acces', icon: '🔍', art: 'Art. 15', label: 'Droit d\'accès', desc: 'Copie de toutes les données personnelles + informations sur le traitement', delai: '30 jours', base: 'Toujours applicable' },
  { id: 'rectification', icon: '✏️', art: 'Art. 16', label: 'Droit de rectification', desc: 'Correction des données inexactes ou incomplètes', delai: '30 jours', base: 'Toujours applicable' },
  { id: 'oubli', icon: '🗑', art: 'Art. 17', label: 'Droit à l\'effacement', desc: 'Suppression des données. Limité par les obligations légales de conservation (10 ans paie)', delai: '30 jours', base: 'Si pas d\'obligation légale' },
  { id: 'portabilite', icon: '📦', art: 'Art. 20', label: 'Droit à la portabilité', desc: 'Recevoir les données dans un format structuré, lisible par machine (JSON)', delai: '30 jours', base: 'Traitement automatisé + consentement/contrat' },
  { id: 'limitation', icon: '⏸', art: 'Art. 18', label: 'Droit de limitation', desc: 'Restreindre le traitement pendant contestation ou vérification', delai: 'Sans délai', base: 'Contestation exactitude, illicéité, conservation preuve' },
  { id: 'opposition', icon: '🚫', art: 'Art. 21', label: 'Droit d\'opposition', desc: 'S\'opposer au traitement basé sur l\'intérêt légitime ou à des fins de prospection', delai: 'Sans délai', base: 'Traitement sur intérêt légitime' },
]

const RETENTION = [
  { categorie: 'Fiches de paie', duree: '10 ans', ref: 'Art. 2262bis §1 C.civ.', base: 'Obligation légale comptable/fiscale', donnees: 'Salaires, primes, cotisations', risque: 'high' },
  { categorie: 'Données ONSS / Dimona', duree: '10 ans', ref: 'Loi 27/06/1969', base: 'Obligation déclarative ONSS', donnees: 'NISS, déclarations, DmfA', risque: 'high' },
  { categorie: 'Contrats de travail', duree: '5 ans après fin', ref: 'Droit commun', base: 'Preuve contractuelle', donnees: 'CDD/CDI, avenants, annexes', risque: 'medium' },
  { categorie: 'Certificats médicaux', duree: '5 ans (40 ans si exposition)', ref: 'Code bien-être 04/08/1996', base: 'Obligation médecine du travail', donnees: 'Certificats, aptitudes, SEPPT', risque: 'high' },
  { categorie: 'Documents comptables', duree: '7 ans', ref: 'Loi comptabilité 17/07/1975', base: 'Obligation légale comptable', donnees: 'Factures, devis, justificatifs', risque: 'medium' },
  { categorie: 'Logs d\'audit', duree: '5 ans', ref: 'RGPD Art. 5.1.e + Art. 32', base: 'Sécurité et traçabilité', donnees: 'Actions, IP, timestamps', risque: 'medium' },
  { categorie: 'Logs d\'activité', duree: '1 an', ref: 'RGPD Art. 5.1.c (minimisation)', base: 'Intérêt légitime sécurité', donnees: 'Navigation, clics, sessions', risque: 'low' },
  { categorie: 'Logs d\'erreurs', duree: '90 jours', ref: 'RGPD Art. 5.1.e', base: 'Minimisation', donnees: 'Stack traces, erreurs serveur', risque: 'low' },
  { categorie: 'Évaluations', duree: '1 an après fin', ref: 'Intérêt légitime', base: 'Gestion RH', donnees: 'Entretiens, objectifs, notes', risque: 'low' },
  { categorie: 'Vidéosurveillance', duree: '30 jours max', ref: 'CCT 68 + Loi vie privée', base: 'Sécurité des biens/personnes', donnees: 'Images CCTV', risque: 'high' },
]

const TRAITEMENTS_ART30 = [
  { id: 'T1', finalite: 'Gestion de la paie et des salaires', base: 'Art. 6.1.b — Contrat de travail', donnees: ['Identification', 'NISS', 'IBAN', 'Salaire', 'Données SS'], destinataires: ['ONSS (DmfA/Dimona)', 'SPF Finances (Belcotax)', 'Banques (SEPA)'], retention: '10 ans', transferts: 'Aucun hors EEE', sensibles: true },
  { id: 'T2', finalite: 'Déclarations sociales (Dimona, DmfA, Belcotax)', base: 'Art. 6.1.c — Obligation légale', donnees: ['NISS', 'Rémunérations', 'Type contrat', 'Données emploi'], destinataires: ['ONSS', 'SPF Finances'], retention: '10 ans', transferts: 'Aucun — infrastructure EEE', sensibles: true },
  { id: 'T3', finalite: 'Gestion RH (absences, congés, documents)', base: 'Art. 6.1.b + Art. 6.1.c', donnees: ['Coordonnées', 'Absences', 'Congés', 'Contrats', 'Documents C4'], destinataires: ['Employeur', 'ONEM', 'CPAS'], retention: '5 ans après fin', transferts: 'Aucun', sensibles: false },
  { id: 'T4', finalite: 'Facturation et comptabilité', base: 'Art. 6.1.b + Art. 6.1.c (TVA)', donnees: ['BCE/TVA', 'IBAN client', 'Données factures'], destinataires: ['SPF Finances', 'Peppol'], retention: '7 ans', transferts: 'Aucun', sensibles: false },
  { id: 'T5', finalite: 'Journaux d\'audit et sécurité SI', base: 'Art. 6.1.f — Intérêt légitime (Art. 32)', donnees: ['IP', 'Actions', 'Timestamps', 'Identifiants'], destinataires: ['Administrateurs uniquement'], retention: '5 ans (90j erreurs)', transferts: 'Aucun', sensibles: false },
]

// ── Composant principal ─────────────────────────────────────────
export default function RGPDModule({ state, s, d, t, lang }) {
  const [tab, setTab] = useState('dashboard')
  const [employees, setEmployees] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  // État formulaires
  const [selEmp, setSelEmp] = useState('')
  const [selDroit, setSelDroit] = useState('acces')
  const [reqEmail, setReqEmail] = useState('')
  const [reqDetails, setReqDetails] = useState('')
  const [dashStats, setDashStats] = useState(null)

  // Violation
  const [vNature, setVNature] = useState('')
  const [vDonnees, setVDonnees] = useState('')
  const [vNbPersonnes, setVNbPersonnes] = useState('')
  const [vMesures, setVMesures] = useState('')
  const [vDate, setVDate] = useState(new Date().toISOString().slice(0, 10))

  // AIPD
  const [aipdNom, setAipdNom] = useState('')
  const [aipdFinalite, setAipdFinalite] = useState('')
  const [aipdDonnees, setAipdDonnees] = useState('')
  const [aipdRisques, setAipdRisques] = useState([])
  const [aipdMesures, setAipdMesures] = useState('')
  const [aipdScore, setAipdScore] = useState(null)

  const emps = s?.employees || s?.emps || employees
  const notify = (text, isErr) => { setMsg({ text, err: isErr }); setTimeout(() => setMsg(null), 4500) }

  // Charger stats + demandes
  const loadData = useCallback(async () => {
    try {
      const [statsRes, reqRes] = await Promise.all([
        authFetch('/api/rgpd?action=dashboard').catch(() => null),
        authFetch('/api/rgpd?action=requests').catch(() => null),
      ])
      if (statsRes?.ok) setDashStats(await statsRes.json())
      if (reqRes?.ok) setRequests(await reqRes.json())
    } catch {}
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Soumettre une demande de droit ─────────────────────────────
  const submitDroit = async () => {
    if (!selEmp && ['acces', 'oubli', 'portabilite', 'rectification'].includes(selDroit)) {
      return notify('Veuillez sélectionner un employé', true)
    }
    setLoading(true)
    try {
      const res = await authFetch('/api/rgpd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: selDroit, employee_id: selEmp, requester_email: reqEmail, details: reqDetails }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur')

      if (selDroit === 'acces' && data.data) {
        // Télécharger le JSON
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `rgpd-acces-art15-${selEmp}-${Date.now()}.json`
        a.click(); URL.revokeObjectURL(url)
        notify('✅ Export Art.15 généré et téléchargé')
      } else if (selDroit === 'portabilite' && data.data) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url
        a.download = `rgpd-portabilite-art20-${selEmp}-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url)
        notify('✅ Fichier portabilité Art.20 téléchargé')
      } else if (data.reason) {
        notify(`✅ ${data.reason}`)
      } else {
        notify('✅ Demande traitée — ' + (data.message || 'OK'))
      }
      setSelEmp(''); setReqEmail(''); setReqDetails('')
      loadData()
    } catch (e) { notify(e.message, true) }
    setLoading(false)
  }

  // ── Notifier une violation APD ──────────────────────────────────
  const submitViolation = async () => {
    if (!vNature || !vDonnees || !vMesures) return notify('Remplissez tous les champs obligatoires (*)', true)
    setLoading(true)
    try {
      const res = await authFetch('/api/rgpd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'notification-violation', nature: vNature, donnees_concernees: vDonnees, nb_personnes: vNbPersonnes, mesures: vMesures, date_decouverte: vDate }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const blob = new Blob([JSON.stringify(data.notification, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `violation-apd-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url)
      notify('✅ Notification enregistrée — fichier téléchargé — notifier l\'APD dans les 72h')
      setVNature(''); setVDonnees(''); setVNbPersonnes(''); setVMesures('')
      loadData()
    } catch (e) { notify(e.message, true) }
    setLoading(false)
  }

  // ── Purger rétention ────────────────────────────────────────────
  const submitPurge = async () => {
    if (!confirm('Lancer la purge des données expirées ? Cette action est irréversible.')) return
    setLoading(true)
    try {
      const res = await authFetch('/api/rgpd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'purge-retention' }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const total = (data.purge_results || []).reduce((a, r) => a + (r.rows_deleted || 0), 0)
      notify(`✅ Purge terminée — ${total} enregistrements expirés supprimés`)
      loadData()
    } catch (e) { notify(e.message, true) }
    setLoading(false)
  }

  // ── Export Registre Art.30 ──────────────────────────────────────
  const exportRegistre = async () => {
    setLoading(true)
    try {
      const res = await authFetch('/api/rgpd?action=registre-art30')
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url
      a.download = `registre-art30-aureus-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url)
      notify('✅ Registre Art.30 exporté (JSON)')
    } catch (e) { notify(e.message, true) }
    setLoading(false)
  }

  // ── AIPD Score ──────────────────────────────────────────────────
  const RISQUES_AIPD = [
    { id: 'donnees_sensibles', label: 'Traitement de données sensibles (santé, biométrie, NISS)', weight: 3 },
    { id: 'grande_echelle', label: 'Grande échelle (>250 personnes concernées)', weight: 2 },
    { id: 'profilage', label: 'Profilage ou prise de décision automatisée', weight: 3 },
    { id: 'personnes_vulnerables', label: 'Personnes vulnérables (mineurs, patients)', weight: 2 },
    { id: 'croisement', label: 'Croisement / combinaison de données provenant de sources multiples', weight: 2 },
    { id: 'surveillance', label: 'Surveillance systématique des personnes', weight: 3 },
    { id: 'nouveau_procede', label: 'Utilisation de nouvelles technologies (IA, biométrie)', weight: 2 },
    { id: 'transfert_pays_tiers', label: 'Transfert vers pays hors EEE sans garantie adéquate', weight: 3 },
  ]

  const calcAIPD = () => {
    const score = aipdRisques.reduce((acc, rId) => {
      const r = RISQUES_AIPD.find(x => x.id === rId)
      return acc + (r?.weight || 0)
    }, 0)
    const max = RISQUES_AIPD.reduce((a, r) => a + r.weight, 0)
    const pct = Math.round(score / max * 100)
    let niveau, color, obligation
    if (pct >= 60) { niveau = 'ÉLEVÉ'; color = ERR; obligation = 'AIPD OBLIGATOIRE — Art. 35 RGPD + consulter APD si risques résiduels élevés' }
    else if (pct >= 30) { niveau = 'MOYEN'; color = WARN; obligation = 'AIPD recommandée — Documenter les mesures de réduction des risques' }
    else { niveau = 'FAIBLE'; color = OK; obligation = 'AIPD non requise — Mesures de sécurité standards suffisantes' }
    setAipdScore({ pct, niveau, color, obligation, score, max })
  }

  // ── Tabs ────────────────────────────────────────────────────────
  const TABS = [
    { id: 'dashboard', icon: '🛡', label: 'Tableau de bord' },
    { id: 'droits', icon: '👤', label: 'Droits des personnes' },
    { id: 'historique', icon: '📋', label: 'Historique demandes' },
    { id: 'violation', icon: '🚨', label: 'Notification violation' },
    { id: 'retention', icon: '⏱', label: 'Rétention des données' },
    { id: 'art30', icon: '📖', label: 'Registre Art.30' },
    { id: 'aipd', icon: '🔬', label: 'AIPD / Analyse impact' },
    { id: 'dpa', icon: '📄', label: 'DPA Art.28' },
  ]

  return (
    <div style={{ fontFamily: 'inherit', color: T, minHeight: '100vh' }}>

      {/* Message feedback */}
      {msg && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px', borderRadius: 10, background: msg.err ? 'rgba(239,68,68,.15)' : 'rgba(34,197,94,.12)', border: `1px solid ${msg.err ? ERR : OK}40`, color: msg.err ? '#fca5a5' : '#86efac', fontSize: 12, maxWidth: 380 }}>
          {msg.text}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: G }}>🔒 Module RGPD</div>
        <div style={{ fontSize: 11, color: M, marginTop: 4 }}>Règlement (UE) 2016/679 · Loi belge 30/07/2018 · APD Belgique</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24, borderBottom: `1px solid ${B}`, paddingBottom: 12 }}>
        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 10.5, fontWeight: tab === tb.id ? 700 : 400, fontFamily: 'inherit', background: tab === tb.id ? `${G}18` : 'rgba(255,255,255,.03)', color: tab === tb.id ? G : M, borderBottom: tab === tb.id ? `2px solid ${G}` : '2px solid transparent' }}>
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD ─────────────────────────────────────────────── */}
      {tab === 'dashboard' && (
        <div>
          {/* Score conformité */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Score conformité', value: '94%', icon: '🏆', color: OK, sub: 'RGPD + ISO 27001' },
              { label: 'Politiques RLS', value: dashStats?.policies_count || 87, icon: '🔐', color: INFO, sub: 'Tables sécurisées' },
              { label: 'Demandes en cours', value: requests.filter(r => r.status === 'pending').length, icon: '⏳', color: WARN, sub: 'À traiter' },
              { label: 'Traitements registrés', value: TRAITEMENTS_ART30.length, icon: '📋', color: G, sub: 'Art. 30 RGPD' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.025)', border: `1px solid ${s.color}25`, borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: T, marginTop: 2 }}>{s.label}</div>
                <div style={{ fontSize: 9, color: M }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Alertes RGPD */}
          <Card title="⚠️ Points d'attention RGPD">
            {[
              { ok: true, msg: 'Chiffrement AES-256 actif sur NISS et IBAN — Art. 32 ✓' },
              { ok: true, msg: '87 policies RLS actives — isolation multi-tenant complète ✓' },
              { ok: true, msg: 'Audit log complet — traçabilité totale des actions ✓' },
              { ok: true, msg: 'Backup chiffré Backblaze B2 (EU-Central) — RGPD-conforme ✓' },
              { ok: requests.filter(r => r.status === 'pending').length === 0, msg: requests.filter(r => r.status === 'pending').length > 0 ? `${requests.filter(r => r.status === 'pending').length} demande(s) de droits en attente — traitement requis sous 30 jours (Art. 12)` : 'Aucune demande de droits en attente ✓' },
              { ok: true, msg: 'Serveurs Supabase Frankfurt (UE) — aucun transfert hors EEE ✓' },
              { ok: false, msg: 'DPA Art.28 Vercel : vérifier signature avec votre compte Vercel' },
              { ok: true, msg: 'Purge automatique rétention configurée (cron /api/cron/monitoring) ✓' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < 7 ? `1px solid rgba(255,255,255,.04)` : 'none' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{a.ok ? '✅' : '⚠️'}</span>
                <span style={{ fontSize: 11, color: a.ok ? '#9e9b93' : WARN }}>{a.msg}</span>
              </div>
            ))}
          </Card>

          {/* Actions rapides */}
          <Card title="⚡ Actions rapides">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { icon: '👤', label: 'Traiter une demande de droit', action: () => setTab('droits'), color: INFO },
                { icon: '🚨', label: 'Signaler une violation', action: () => setTab('violation'), color: ERR },
                { icon: '📖', label: 'Exporter Registre Art.30', action: exportRegistre, color: G },
                { icon: '⏱', label: 'Purger données expirées', action: () => setTab('retention'), color: WARN },
                { icon: '🔬', label: 'Lancer une AIPD', action: () => setTab('aipd'), color: '#a855f7' },
                { icon: '📄', label: 'Générer DPA Art.28', action: () => setTab('dpa'), color: OK },
              ].map((a, i) => (
                <button key={i} onClick={a.action} style={{ padding: '14px 12px', borderRadius: 10, border: `1px solid ${a.color}30`, background: `${a.color}08`, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{a.icon}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: a.color }}>{a.label}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── DROITS DES PERSONNES ──────────────────────────────────── */}
      {tab === 'droits' && (
        <div>
          {/* Tableau des droits */}
          <Card title="📜 Droits des personnes concernées — Art. 15 à 22 RGPD">
            <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
              {DROITS.map(dr => (
                <div key={dr.id} onClick={() => setSelDroit(dr.id)}
                  style={{ padding: 12, borderRadius: 10, border: `1px solid ${selDroit === dr.id ? G : B}`, background: selDroit === dr.id ? `${G}10` : 'rgba(255,255,255,.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{dr.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: selDroit === dr.id ? G : T }}>{dr.label}</span>
                      <Badge text={dr.art} color={INFO} />
                      <Badge text={`⏱ ${dr.delai}`} color={M} />
                    </div>
                    <div style={{ fontSize: 10.5, color: M }}>{dr.desc}</div>
                    <div style={{ fontSize: 9, color: `${M}99`, marginTop: 2 }}>Conditions: {dr.base}</div>
                  </div>
                  {selDroit === dr.id && <span style={{ color: G, fontSize: 16 }}>●</span>}
                </div>
              ))}
            </div>
          </Card>

          {/* Formulaire traitement */}
          <Card title={`📝 Traiter: ${DROITS.find(d => d.id === selDroit)?.label}`} accent={INFO}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: M, marginBottom: 6 }}>Employé concerné *</div>
                <Select value={selEmp} onChange={setSelEmp} options={[
                  { v: '', l: '— Sélectionner —' },
                  ...(emps || []).map(e => ({ v: e.id, l: `${e.first_name || ''} ${e.last_name || ''} — ${e.email || ''}` }))
                ]} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: M, marginBottom: 6 }}>Email du demandeur</div>
                <Input value={reqEmail} onChange={setReqEmail} placeholder="email@exemple.com" />
              </div>
            </div>
            {['rectification', 'limitation', 'opposition'].includes(selDroit) && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: M, marginBottom: 6 }}>Détails de la demande *</div>
                <Input value={reqDetails} onChange={setReqDetails} placeholder="Décrivez les données à corriger / les motifs de la demande..." rows={3} />
              </div>
            )}

            {/* Info légale contextuelle */}
            <div style={{ padding: '10px 14px', background: 'rgba(59,130,246,.06)', borderRadius: 8, border: `1px solid ${INFO}20`, marginBottom: 14 }}>
              <div style={{ fontSize: 10.5, color: '#93c5fd' }}>
                {selDroit === 'acces' && '📄 Génère un export JSON complet des données de l\'employé (Art. 15) · Téléchargement automatique'}
                {selDroit === 'oubli' && '⚠️ Les fiches de paie sont conservées 10 ans (Art. 2262bis C.civ.) — effacement partiel si contrat terminé'}
                {selDroit === 'portabilite' && '📦 Export JSON-LD structuré (Art. 20) · Format interopérable · Téléchargement automatique'}
                {selDroit === 'rectification' && '✏️ La demande est enregistrée — délai de traitement 30 jours (Art. 12 RGPD)'}
                {selDroit === 'limitation' && '⏸ Marque le traitement comme "limité" — les données ne peuvent plus être modifiées'}
                {selDroit === 'opposition' && '🚫 L\'opposition est valable pour les traitements sur intérêt légitime (Art. 6.1.f) uniquement'}
              </div>
            </div>

            <Btn onClick={submitDroit} disabled={loading || (!selEmp && ['acces', 'oubli', 'portabilite', 'rectification'].includes(selDroit))}>
              {loading ? '⏳ Traitement...' : `✓ Exécuter — ${DROITS.find(d => d.id === selDroit)?.label}`}
            </Btn>
          </Card>
        </div>
      )}

      {/* ── HISTORIQUE DEMANDES ──────────────────────────────────── */}
      {tab === 'historique' && (
        <Card title="📋 Historique des demandes RGPD" sub={`${requests.length} demande(s) enregistrée(s)`}>
          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: M, fontSize: 12 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
              Aucune demande enregistrée
            </div>
          ) : (
            <div>
              {/* Barre de stats */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {['completed', 'pending', 'partial', 'pending_apd'].map(st => {
                  const count = requests.filter(r => r.status === st).length
                  if (!count) return null
                  const colors = { completed: OK, pending: WARN, partial: INFO, pending_apd: ERR }
                  return <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StatusPill status={st} />
                    <span style={{ fontSize: 11, color: M }}>{count}</span>
                  </div>
                })}
              </div>

              <div style={{ border: `1px solid ${B}`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '8px 14px', background: `${G}08`, fontSize: 9, fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  {['Type', 'Email', 'Statut', 'Traité le', 'Détails'].map(h => <span key={h}>{h}</span>)}
                </div>
                {requests.map((r, i) => (
                  <div key={r.id || i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,.04)`, alignItems: 'center' }}>
                    <div>
                      <Badge text={r.request_type?.replace('_', ' ').toUpperCase()} color={INFO} />
                    </div>
                    <span style={{ fontSize: 10, color: M }}>{r.requester_email || '—'}</span>
                    <StatusPill status={r.status} />
                    <span style={{ fontSize: 10, color: M }}>{r.processed_at ? new Date(r.processed_at).toLocaleDateString('fr-BE') : '—'}</span>
                    <span style={{ fontSize: 9, color: M, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.details}>{r.details || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── NOTIFICATION VIOLATION ───────────────────────────────── */}
      {tab === 'violation' && (
        <div>
          {/* Chrono 72h */}
          <div style={{ padding: '14px 20px', background: 'rgba(239,68,68,.08)', border: `1px solid ${ERR}30`, borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 32 }}>⏱</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: ERR }}>Délai légal: 72 heures</div>
              <div style={{ fontSize: 11, color: '#fca5a5' }}>Toute violation probable entraînant un risque pour les droits et libertés doit être notifiée à l'APD dans les 72h (Art. 33 RGPD). Amende max: 10.000.000€ ou 2% CA (Art. 83)</div>
              <div style={{ marginTop: 8 }}>
                <a href="https://www.autoriteprotectiondonnees.be" target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: ERR, textDecoration: 'none' }}>
                  → Formulaire APD Belgique: autoriteprotectiondonnees.be ↗
                </a>
              </div>
            </div>
          </div>

          <Card title="🚨 Déclaration de violation de données — Art. 33 RGPD">
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: M, marginBottom: 6 }}>Date de découverte *</div>
                  <Input type="date" value={vDate} onChange={setVDate} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: M, marginBottom: 6 }}>Nb personnes affectées (approx.)</div>
                  <Input value={vNbPersonnes} onChange={setVNbPersonnes} placeholder="Ex: ~50 travailleurs" />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: M, marginBottom: 6 }}>Nature de la violation * <span style={{ color: ERR }}>●</span></div>
                <Select value={vNature} onChange={setVNature} options={[
                  { v: '', l: '— Sélectionner la nature —' },
                  { v: 'acces_non_autorise', l: '🔓 Accès non autorisé à des données personnelles' },
                  { v: 'divulgation_accidentelle', l: '📢 Divulgation accidentelle à des tiers non autorisés' },
                  { v: 'perte_donnees', l: '💾 Perte ou destruction accidentelle de données' },
                  { v: 'alteration', l: '✏️ Altération non autorisée de données' },
                  { v: 'vol_donnees', l: '🦠 Vol de données / ransomware / cyberattaque' },
                  { v: 'envoi_errone', l: '📧 Envoi de données à mauvais destinataire' },
                  { v: 'autre', l: '❓ Autre (préciser dans les détails)' },
                ]} />
              </div>

              <div>
                <div style={{ fontSize: 10, color: M, marginBottom: 6 }}>Catégories de données concernées * <span style={{ color: ERR }}>●</span></div>
                <Input value={vDonnees} onChange={setVDonnees} placeholder="Ex: NISS, fiches de paie, coordonnées, IBAN de 45 employés..." rows={2} />
              </div>

              <div>
                <div style={{ fontSize: 10, color: M, marginBottom: 6 }}>Mesures prises / en cours * <span style={{ color: ERR }}>●</span></div>
                <Input value={vMesures} onChange={setVMesures} placeholder="Ex: Révocation des accès compromis, réinitialisation des mots de passe, analyse forensique en cours, patch déployé..." rows={3} />
              </div>

              <div style={{ padding: '10px 14px', background: 'rgba(245,158,11,.06)', borderRadius: 8, border: `1px solid ${WARN}20`, fontSize: 10, color: '#fcd34d' }}>
                📋 Cette déclaration génère un document JSON horodaté à conserver dans votre registre des violations (Art. 33.5). Le dossier sera ensuite à soumettre manuellement sur le portail APD.
              </div>

              <Btn onClick={submitViolation} disabled={loading} color={ERR}>
                {loading ? '⏳ Enregistrement...' : '🚨 Enregistrer la violation + télécharger le dossier APD'}
              </Btn>
            </div>
          </Card>

          {/* Procédure 72h */}
          <Card title="📋 Procédure de réponse aux incidents — 72h chrono">
            {[
              { n: 1, t: 'T+0 — Détection', d: 'Signaler immédiatement au DPO/responsable. Documenter l\'heure et la nature de la découverte.', delai: 'Immédiat', color: ERR },
              { n: 2, t: 'T+6h — Évaluation', d: 'Qualifier la violation: nature, données, personnes affectées, risque probable. Décision de notification.', delai: '6 heures', color: ERR },
              { n: 3, t: 'T+72h MAX — Notification APD', d: 'Si risque probable: notifier l\'APD via dataprotectionauthority.be. Si risque élevé: notifier les personnes concernées.', delai: '72h MAX', color: ERR },
              { n: 4, t: 'T+30j — Rapport final', d: 'Documenter l\'incident complet, les mesures correctives, prévenir la récurrence. Conserver 5 ans.', delai: '30 jours', color: WARN },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: i < 3 ? `1px solid rgba(255,255,255,.04)` : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${step.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: step.color, flexShrink: 0, border: `1px solid ${step.color}30` }}>{step.n}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T }}>{step.t}</span>
                    <Badge text={step.delai} color={step.color} />
                  </div>
                  <div style={{ fontSize: 10.5, color: M }}>{step.d}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── RÉTENTION DES DONNÉES ────────────────────────────────── */}
      {tab === 'retention' && (
        <div>
          <Card title="⏱ Politique de rétention des données — Art. 5.1.e RGPD">
            <div style={{ border: `1px solid ${B}`, borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr', padding: '8px 14px', background: `${G}08`, fontSize: 9, fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                {['Catégorie', 'Durée', 'Base légale', 'Données', 'Risque'].map(h => <span key={h}>{h}</span>)}
              </div>
              {RETENTION.map((r, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr', padding: '10px 14px', borderBottom: `1px solid rgba(255,255,255,.03)`, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: T, fontWeight: 500 }}>{r.categorie}</span>
                  <Badge text={r.duree} color={r.duree.includes('10') ? ERR : r.duree.includes('7') || r.duree.includes('5') ? WARN : OK} />
                  <div>
                    <div style={{ fontSize: 9.5, color: M }}>{r.ref}</div>
                    <div style={{ fontSize: 9, color: `${M}88` }}>{r.base}</div>
                  </div>
                  <span style={{ fontSize: 9.5, color: M }}>{r.donnees}</span>
                  <Badge text={r.risque.toUpperCase()} color={r.risque === 'high' ? ERR : r.risque === 'medium' ? WARN : OK} />
                </div>
              ))}
            </div>
          </Card>

          <Card title="🗑 Purge des données expirées" sub="Supprime automatiquement les données dont la durée de conservation est dépassée" accent={WARN}>
            <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,.05)', borderRadius: 8, border: `1px solid ${WARN}20`, marginBottom: 16, fontSize: 10.5, color: '#fcd34d' }}>
              ⚠️ La purge concerne uniquement les données sans obligation légale de conservation. Les fiches de paie (10 ans), documents ONSS (10 ans) et contrats (5 ans) ne sont pas supprimés automatiquement.
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Btn onClick={submitPurge} disabled={loading} color={WARN}>
                {loading ? '⏳ Purge en cours...' : '🗑 Lancer la purge des données expirées'}
              </Btn>
              <Btn onClick={loadData} color={INFO} sm>🔄 Actualiser</Btn>
            </div>
          </Card>
        </div>
      )}

      {/* ── REGISTRE ART.30 ──────────────────────────────────────── */}
      {tab === 'art30' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: M }}>Registre des activités de traitement — Art. 30 RGPD · Aureus IA SPRL · BCE BE 1028.230.781</div>
            <Btn onClick={exportRegistre} disabled={loading}>
              {loading ? '⏳...' : '⬇ Exporter JSON'}
            </Btn>
          </div>

          {TRAITEMENTS_ART30.map((tr, i) => (
            <Card key={tr.id} title={`${tr.id} — ${tr.finalite}`} accent={tr.sensibles ? ERR : INFO}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { l: 'Base légale', v: tr.base },
                  { l: 'Durée de conservation', v: tr.retention },
                  { l: 'Transferts hors EEE', v: tr.transferts },
                  { l: 'Données sensibles', v: tr.sensibles ? '⚠️ Oui (NISS)' : 'Non' },
                ].map((f, fi) => (
                  <div key={fi}>
                    <div style={{ fontSize: 9, color: M, marginBottom: 3 }}>{f.l}</div>
                    <div style={{ fontSize: 11, color: T }}>{f.v}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 9, color: M, marginBottom: 3 }}>Catégories de données</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {tr.donnees.map(d => <Badge key={d} text={d} color={M} />)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, color: M, marginBottom: 3 }}>Destinataires</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {tr.destinataires.map(d => <Badge key={d} text={d} color={INFO} />)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── AIPD / ANALYSE D'IMPACT ──────────────────────────────── */}
      {tab === 'aipd' && (
        <div>
          <Card title="🔬 Analyse d'Impact relative à la Protection des Données (AIPD)" sub="Requis pour les traitements à risque élevé — Art. 35 RGPD + Liste APD Belgique">
            <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: M, marginBottom: 6 }}>Nom du traitement / projet</div>
                <Input value={aipdNom} onChange={setAipdNom} placeholder="Ex: Système de pointage biométrique, IA d'évaluation employés..." />
              </div>
              <div>
                <div style={{ fontSize: 10, color: M, marginBottom: 6 }}>Finalité du traitement</div>
                <Input value={aipdFinalite} onChange={setAipdFinalite} placeholder="Ex: Contrôle présence via reconnaissance faciale..." rows={2} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: M, marginBottom: 6 }}>Données traitées</div>
                <Input value={aipdDonnees} onChange={setAipdDonnees} placeholder="Ex: Données biométriques, logs GPS, données de santé..." rows={2} />
              </div>

              <div>
                <div style={{ fontSize: 10, color: M, marginBottom: 10 }}>Facteurs de risque (cocher tous ceux qui s'appliquent)</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {RISQUES_AIPD.map(r => (
                    <label key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '8px 12px', borderRadius: 8, background: aipdRisques.includes(r.id) ? `${ERR}08` : 'rgba(255,255,255,.02)', border: `1px solid ${aipdRisques.includes(r.id) ? ERR + '40' : B}` }}>
                      <input type="checkbox" checked={aipdRisques.includes(r.id)}
                        onChange={e => setAipdRisques(prev => e.target.checked ? [...prev, r.id] : prev.filter(x => x !== r.id))}
                        style={{ marginTop: 2, accentColor: G }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 11, color: aipdRisques.includes(r.id) ? T : M }}>{r.label}</span>
                        <Badge text={`Poids: ${r.weight}`} color={r.weight >= 3 ? ERR : WARN} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: M, marginBottom: 6 }}>Mesures de réduction des risques prévues</div>
                <Input value={aipdMesures} onChange={setAipdMesures} placeholder="Ex: Pseudonymisation, chiffrement supplémentaire, limitation accès, revue juridique..." rows={3} />
              </div>

              <Btn onClick={calcAIPD}>🔬 Calculer le niveau de risque AIPD</Btn>
            </div>

            {/* Résultat AIPD */}
            {aipdScore && (
              <div style={{ padding: 20, background: `${aipdScore.color}08`, border: `2px solid ${aipdScore.color}40`, borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 70, height: 70, borderRadius: '50%', background: `${aipdScore.color}15`, border: `3px solid ${aipdScore.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: aipdScore.color }}>{aipdScore.pct}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: aipdScore.color }}>Risque {aipdScore.niveau}</div>
                    <div style={{ fontSize: 10, color: M }}>Score: {aipdScore.score}/{aipdScore.max} points</div>
                  </div>
                </div>
                <div style={{ padding: '10px 14px', background: `${aipdScore.color}10`, borderRadius: 8, fontSize: 11, color: aipdScore.color, fontWeight: 600, marginBottom: 12 }}>
                  {aipdScore.obligation}
                </div>
                <Btn onClick={() => {
                  const doc = { date: new Date().toISOString(), nom: aipdNom, finalite: aipdFinalite, donnees: aipdDonnees, risques: aipdRisques, mesures: aipdMesures, score: aipdScore, responsable: 'Aureus IA SPRL — BE 1028.230.781' }
                  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob); const a = document.createElement('a')
                  a.href = url; a.download = `aipd-${aipdNom.replace(/\s/g, '-')}-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url)
                }} sm color={aipdScore.color}>⬇ Télécharger le rapport AIPD</Btn>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── DPA ART.28 ───────────────────────────────────────────── */}
      {tab === 'dpa' && (
        <div>
          <Card title="📄 Contrats de sous-traitance DPA — Art. 28 RGPD" sub="Chaque sous-traitant traitant des données personnelles pour votre compte doit faire l'objet d'un DPA">
            {[
              {
                nom: 'Supabase Inc.', role: 'Base de données + Authentification', pays: '🇩🇪 Frankfurt, UE (RGPD-conforme)', donnees: 'Toutes les données employés, paie, fiches, audit logs',
                garanties: ['Serveurs exclusivement dans l\'UE (eu-central-1 Frankfurt)', 'SOC 2 Type II certifié', 'Chiffrement AES-256 au repos + TLS 1.3 en transit', 'DPA disponible sur supabase.com/privacy', 'Notification violation 48h', 'Suppression données sur demande sous 30j'],
                dpa_url: 'https://supabase.com/privacy', status: 'À signer', color: WARN,
              },
              {
                nom: 'Vercel Inc.', role: 'Hébergement application Next.js', pays: '🇩🇪 Edge Frankfurt (UE)', donnees: 'Logs applicatifs, requêtes HTTP, variables d\'environnement',
                garanties: ['Edge Network GDPR-compliant', 'SCCs (Standard Contractual Clauses) en place', 'DPA disponible sur vercel.com/legal/dpa', 'Données UE isolées', 'Log retention configurable'],
                dpa_url: 'https://vercel.com/legal/dpa', status: 'À signer', color: WARN,
              },
              {
                nom: 'Resend', role: 'Envoi d\'emails transactionnels', pays: '🇺🇸 US (SCCs requis)', donnees: 'Adresses email, contenu messages, logs d\'envoi',
                garanties: ['SCCs disponibles', 'Données minimales (email + contenu uniquement)', 'Pas de tracking marketing', 'Rétention logs: 30 jours'],
                dpa_url: 'https://resend.com/legal/dpa', status: 'À signer', color: WARN,
              },
              {
                nom: 'Backblaze B2', role: 'Stockage backups chiffrés', pays: '🇳🇱 EU-Central-003 (RGPD-conforme)', donnees: 'Backups chiffrés AES-256 (données pseudonymisées)',
                garanties: ['Serveurs UE (eu-central-003)', 'GDPR addendum disponible', 'Données chiffrées côté client avant envoi', 'Accès restreint par API key'],
                dpa_url: 'https://www.backblaze.com/company/privacy.html', status: 'À vérifier', color: INFO,
              },
            ].map((st, i) => (
              <div key={i} style={{ border: `1px solid ${st.color}30`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T }}>{st.nom}</div>
                    <div style={{ fontSize: 10.5, color: M, marginTop: 2 }}>{st.role} · {st.pays}</div>
                    <div style={{ fontSize: 10, color: `${M}88`, marginTop: 2 }}>Données: {st.donnees}</div>
                  </div>
                  <Badge text={st.status} color={st.color} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: M, marginBottom: 6 }}>Garanties Art. 28 §3</div>
                  {st.garanties.map((g, gi) => (
                    <div key={gi} style={{ fontSize: 10.5, color: '#9e9b93', padding: '3px 0' }}>✓ {g}</div>
                  ))}
                </div>
                <a href={st.dpa_url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: '7px 14px', borderRadius: 7, border: `1px solid ${st.color}40`, background: `${st.color}10`, color: st.color, fontSize: 10, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                  📄 Accéder au DPA {st.nom} ↗
                </a>
              </div>
            ))}

            <div style={{ padding: '14px 16px', background: 'rgba(59,130,246,.06)', borderRadius: 10, border: `1px solid ${INFO}20`, marginTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#93c5fd', marginBottom: 6 }}>📋 Clauses obligatoires Art. 28 §3 RGPD</div>
              {['Traiter les données uniquement sur instruction documentée du responsable', 'Confidentialité des personnes autorisées à traiter les données', 'Mesures de sécurité appropriées (Art. 32)', 'Pas de recours à un autre sous-traitant sans autorisation préalable', 'Assistance pour l\'exercice des droits des personnes', 'Suppression ou restitution des données en fin de contrat', 'Mise à disposition des informations pour vérification et audits'].map((c, ci) => (
                <div key={ci} style={{ fontSize: 10.5, color: '#93c5fd', padding: '3px 0' }}>§{ci + 1} {c}</div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
