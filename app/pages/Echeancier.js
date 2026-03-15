'use client'
import { useState, useMemo } from 'react'

const ECHEANCES_2026 = [
  { date: '2026-01-31', label: 'DmfA T4 2025', type: 'onss', urgence: 'passé', lien: 'https://www.socialsecurity.be' },
  { date: '2026-02-28', label: 'TVA T4 2025 (trimestriel)', type: 'tva', urgence: 'passé', lien: 'https://myminfin.be' },
  { date: '2026-03-01', label: 'Fiches fiscales 281.10 — Employeurs', type: 'fiscal', urgence: 'passé', lien: 'https://belcotaxonweb.be' },
  { date: '2026-03-15', label: 'Précompte professionnel — Mensuel (Feb)', type: 'fiscal', urgence: 'passé', lien: 'https://myminfin.be' },
  { date: '2026-03-31', label: 'Listing TVA annuel 2025 ⚠️', type: 'tva', urgence: 'urgent', lien: 'https://intervat.minfin.fgov.be' },
  { date: '2026-04-15', label: 'Précompte professionnel — Mensuel (Mar)', type: 'fiscal', urgence: 'prochain', lien: 'https://myminfin.be' },
  { date: '2026-04-30', label: 'DmfA T1 2026', type: 'onss', urgence: 'prochain', lien: 'https://www.socialsecurity.be' },
  { date: '2026-04-30', label: 'TVA T1 2026 (trimestriel)', type: 'tva', urgence: 'prochain', lien: 'https://myminfin.be' },
  { date: '2026-05-15', label: 'Précompte professionnel — Mensuel (Avr)', type: 'fiscal', urgence: 'futur', lien: 'https://myminfin.be' },
  { date: '2026-05-31', label: 'Double pécule de vacances — Employés', type: 'rh', urgence: 'futur', lien: '' },
  { date: '2026-06-01', label: 'Deadline MonBEE — Prime recrutement ⚠️', type: 'aide', urgence: 'urgent', lien: 'https://monbee.brussels' },
  { date: '2026-06-15', label: 'Précompte professionnel — Mensuel (Mai)', type: 'fiscal', urgence: 'futur', lien: 'https://myminfin.be' },
  { date: '2026-06-30', label: 'TVA mensuel — Mai', type: 'tva', urgence: 'futur', lien: 'https://myminfin.be' },
  { date: '2026-07-15', label: 'Précompte professionnel — Mensuel (Jun)', type: 'fiscal', urgence: 'futur', lien: 'https://myminfin.be' },
  { date: '2026-07-31', label: 'DmfA T2 2026', type: 'onss', urgence: 'futur', lien: 'https://www.socialsecurity.be' },
  { date: '2026-07-31', label: 'TVA T2 2026 (trimestriel)', type: 'tva', urgence: 'futur', lien: 'https://myminfin.be' },
  { date: '2026-08-15', label: 'Précompte professionnel — Mensuel (Jul)', type: 'fiscal', urgence: 'futur', lien: 'https://myminfin.be' },
  { date: '2026-08-26', label: 'Deadline mandat Mahis — Dimona/DmfA', type: 'onss', urgence: 'futur', lien: 'https://mahis.be' },
  { date: '2026-09-15', label: 'Précompte professionnel — Mensuel (Aoû)', type: 'fiscal', urgence: 'futur', lien: 'https://myminfin.be' },
  { date: '2026-10-15', label: 'Précompte professionnel — Mensuel (Sep)', type: 'fiscal', urgence: 'futur', lien: 'https://myminfin.be' },
  { date: '2026-10-31', label: 'DmfA T3 2026', type: 'onss', urgence: 'futur', lien: 'https://www.socialsecurity.be' },
  { date: '2026-10-31', label: 'TVA T3 2026 (trimestriel)', type: 'tva', urgence: 'futur', lien: 'https://myminfin.be' },
  { date: '2026-11-15', label: 'Précompte professionnel — Mensuel (Oct)', type: 'fiscal', urgence: 'futur', lien: 'https://myminfin.be' },
  { date: '2026-12-15', label: 'Précompte professionnel — Mensuel (Nov)', type: 'fiscal', urgence: 'futur', lien: 'https://myminfin.be' },
  { date: '2026-12-31', label: 'TVA mensuel — Nov', type: 'tva', urgence: 'futur', lien: 'https://myminfin.be' },
  { date: '2026-12-31', label: 'Fiches de paie décembre + 13e mois', type: 'rh', urgence: 'futur', lien: '' },
]

const TYPE_CONFIG = {
  onss: { label: 'ONSS', couleur: '#3b82f6', bg: '#1e3a5f' },
  fiscal: { label: 'Fiscal', couleur: '#f59e0b', bg: '#1a1200' },
  tva: { label: 'TVA', couleur: '#10b981', bg: '#0d1a0d' },
  rh: { label: 'RH', couleur: '#a855f7', bg: '#1a0d2e' },
  aide: { label: 'Aide', couleur: '#ef4444', bg: '#1a0d0d' },
}

const URGENCE_CONFIG = {
  passé: { label: 'Passé', couleur: '#4b5563' },
  urgent: { label: '⚠️ Urgent', couleur: '#ef4444' },
  prochain: { label: '🔔 Prochain', couleur: '#f59e0b' },
  futur: { label: 'À venir', couleur: '#6b7280' },
}

export default function Echeancier({ state, dispatch }) {
  const [filtre, setFiltre] = useState('tous')
  const [typeFiltre, setTypeFiltre] = useState('tous')

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }

  const echeancesFiltrees = ECHEANCES_2026
    .filter(e => filtre === 'tous' || e.urgence === filtre)
    .filter(e => typeFiltre === 'tous' || e.type === typeFiltre)

  const prochaines = ECHEANCES_2026.filter(e => e.urgence === 'prochain' || e.urgence === 'urgent')
  const urgentes = ECHEANCES_2026.filter(e => e.urgence === 'urgent')

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-BE', { day: '2-digit', month: 'long', year: 'numeric' })
  const joursRestants = (d) => {
    const diff = new Date(d) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div style={s}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>📅</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Échéancier Social 2026</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>ONSS · Fiscal · TVA · RH · Aides à l'emploi · Calendrier complet</p>
          </div>
        </div>
      </div>

      {/* Alertes urgentes */}
      {urgentes.length > 0 && (
        <div style={{ ...card, borderColor: '#ef4444', background: '#1a0d0d', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 10 }}>⚠️ Échéances urgentes</div>
          {urgentes.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < urgentes.length - 1 ? '1px solid #2a0d0d' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{e.label}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{formatDate(e.date)}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: joursRestants(e.date) < 0 ? '#6b7280' : '#ef4444', fontSize: 12, fontWeight: 700 }}>
                  {joursRestants(e.date) < 0 ? `${Math.abs(joursRestants(e.date))}j de retard` : `J-${joursRestants(e.date)}`}
                </span>
                {e.lien && <a href={e.lien} target="_blank" rel="noreferrer" style={{ background: '#ef4444', color: '#fff', borderRadius: 4, padding: '3px 10px', fontSize: 11, textDecoration: 'none', fontWeight: 600 }}>Ouvrir →</a>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['tous', 'urgent', 'prochain', 'futur', 'passé'].map(f => (
          <button key={f} onClick={() => setFiltre(f)} style={{ padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filtre === f ? '#f1f5f9' : '#1f2937', color: filtre === f ? '#000' : '#9ca3af', border: 'none' }}>
            {f === 'tous' ? 'Tous' : URGENCE_CONFIG[f]?.label}
          </button>
        ))}
        <div style={{ width: 1, background: '#2a2a2a', margin: '0 4px' }} />
        {['tous', 'onss', 'fiscal', 'tva', 'rh', 'aide'].map(t => (
          <button key={t} onClick={() => setTypeFiltre(t)} style={{ padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: typeFiltre === t ? (TYPE_CONFIG[t]?.couleur || '#f1f5f9') : '#1f2937', color: typeFiltre === t ? (t === 'tous' ? '#000' : '#fff') : '#9ca3af', border: 'none' }}>
            {t === 'tous' ? 'Tous types' : TYPE_CONFIG[t]?.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div style={card}>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>{echeancesFiltrees.length} échéance(s)</div>
        {echeancesFiltrees.map((e, i) => {
          const tc = TYPE_CONFIG[e.type] || TYPE_CONFIG.rh
          const jours = joursRestants(e.date)
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < echeancesFiltrees.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ background: tc.bg, color: tc.couleur, border: `1px solid ${tc.couleur}40`, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>{tc.label}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: e.urgence === 'passé' ? '#4b5563' : '#f1f5f9' }}>{e.label}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{formatDate(e.date)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: jours < 0 ? '#4b5563' : jours <= 7 ? '#ef4444' : jours <= 30 ? '#f59e0b' : '#6b7280' }}>
                  {jours < 0 ? `${Math.abs(jours)}j passé` : `J-${jours}`}
                </span>
                {e.lien && (
                  <a href={e.lien} target="_blank" rel="noreferrer" style={{ background: '#1f2937', color: '#9ca3af', borderRadius: 4, padding: '3px 8px', fontSize: 10, textDecoration: 'none' }}>↗</a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
