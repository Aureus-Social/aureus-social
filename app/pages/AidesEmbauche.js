'use client'
import { useState } from 'react'

// ─── CATALOGUE AIDES À L'EMBAUCHE BELGES 2026 ────────────────────────────────
const AIDES = [
  {
    id: 'activa_plan',
    label: 'Plan Activa / Impulsion',
    icon: '⚡',
    couleur: '#f59e0b',
    organisme: 'Actiris / VDAB / Forem',
    document: 'C78 Activa',
    region: 'Bruxelles / Wallonie / Flandre',
    conditions: [
      'Travailleur inscrit comme demandeur d\'emploi ≥ 6 mois',
      'Âge : 18 à 64 ans',
      'Contrat CDI ou CDD ≥ 3 mois',
      'Régime de travail ≥ 1/3 temps',
    ],
    avantage: 'Réduction ONSS patronale : 1.000 € à 1.500 €/trimestre pendant 8 trimestres',
    montantMax: 12000,
    duree: '24 mois',
    lienInfo: 'https://www.actiris.be/fr/employeurs/prime-activa/',
    calcul: (brut) => Math.min(brut * 0.12, 1500),
  },
  {
    id: 'activa_start',
    label: 'Activa Start',
    icon: '🚀',
    couleur: '#3b82f6',
    organisme: 'Actiris (Bruxelles uniquement)',
    document: 'C78 Activa Start',
    region: 'Bruxelles',
    conditions: [
      'Jeune ≤ 25 ans, peu qualifié (max CESS)',
      'Inscrit au Forem/Actiris ≥ 6 mois',
      'Contrat CDI ou CDD ≥ 6 mois',
      'Mi-temps minimum',
    ],
    avantage: 'Allocation de travail mensuelle versée au travailleur + réduction ONSS employeur',
    montantMax: 18000,
    duree: '36 mois',
    lienInfo: 'https://www.actiris.be',
    calcul: (brut) => Math.min(brut * 0.15, 1800),
  },
  {
    id: 'sine',
    label: 'SINE — Économie Sociale',
    icon: '🤝',
    couleur: '#10b981',
    organisme: 'ONEM / Actiris',
    document: 'C78 SINE',
    region: 'Toute Belgique',
    conditions: [
      'Entreprise d\'insertion ou EI agréée',
      'Travailleur très difficile à placer',
      'Chômeur longue durée (≥ 24 mois)',
      'CDI obligatoire',
    ],
    avantage: 'Réduction ONSS quasi-totale (jusqu\'à 1.700 €/trimestre) + subvention salariale',
    montantMax: 24000,
    duree: '5 ans renouvelable',
    lienInfo: 'https://www.onem.be/fr/documentation/sine',
    calcul: (brut) => Math.min(brut * 0.20, 1700),
  },
  {
    id: 'c103_jeunes',
    label: 'C103 — Jeunes (1er emploi)',
    icon: '🎓',
    couleur: '#8b5cf6',
    organisme: 'ONSS',
    document: 'C103 Jeunes',
    region: 'Toute Belgique',
    conditions: [
      'Jeune ≤ 26 ans au moment de l\'engagement',
      'Pas d\'expérience de travail antérieure significative',
      'Contrat à durée indéterminée',
      'CP 200 ou autre CP éligible',
    ],
    avantage: 'Dispense de précompte professionnel sur 1.200 € (employeur) + réduction ONSS',
    montantMax: 4800,
    duree: '12 mois',
    lienInfo: 'https://www.onss.be',
    calcul: (brut) => Math.min(brut * 0.08, 400),
  },
  {
    id: 'c103_seniors',
    label: 'C103 — Travailleurs âgés (55+)',
    icon: '👴',
    couleur: '#ef4444',
    organisme: 'ONSS',
    document: 'C103 Seniors',
    region: 'Toute Belgique',
    conditions: [
      'Travailleur ≥ 55 ans',
      'Demandeur d\'emploi ou licencié collectif',
      'CDI ou CDD ≥ 6 mois',
      'Salaire ≤ plafond ONSS',
    ],
    avantage: 'Réduction ONSS patronale structurelle + bonus emploi seniors',
    montantMax: 9600,
    duree: '24 mois',
    lienInfo: 'https://www.onss.be/fr/reduction-groupe-cible-travailleurs-ages',
    calcul: (brut) => Math.min(brut * 0.10, 800),
  },
  {
    id: 'winwin',
    label: 'Win-Win / Impulsion',
    icon: '🏆',
    couleur: '#f97316',
    organisme: 'Actiris / SPF Emploi',
    document: 'C78 Activa Winwin/Impulsion',
    region: 'Bruxelles prioritaire',
    conditions: [
      'Chômeur longue durée (≥ 12 mois)',
      'Contrat CDI',
      'Secteur non marchand ou PME < 50 travailleurs',
    ],
    avantage: 'Allocation de retour à l\'emploi + réduction ONSS 500 €/trimestre',
    montantMax: 8000,
    duree: '16 trimestres',
    lienInfo: 'https://www.actiris.be',
    calcul: (brut) => Math.min(brut * 0.09, 500),
  },
  {
    id: 'ptp',
    label: 'PTP — Programme de Transition',
    icon: '🔄',
    couleur: '#06b6d4',
    organisme: 'ONEM',
    document: 'C78.3 PTP',
    region: 'Toute Belgique',
    conditions: [
      'Chômeur complet indemnisé ≥ 24 mois',
      'Secteur non marchand exclusivement',
      'Temps plein ou 4/5',
      'Emploi supplémentaire (pas de remplacement)',
    ],
    avantage: 'Allocation ONEM couvre 50-100% du salaire net + exemption ONSS patronal',
    montantMax: 15000,
    duree: '12 à 36 mois',
    lienInfo: 'https://www.onem.be/fr/documentation/ptp',
    calcul: (brut) => Math.min(brut * 0.18, 1250),
  },
  {
    id: 'monbee',
    label: 'MonBEE — Bruxelles Emploi',
    icon: '🐝',
    couleur: '#eab308',
    organisme: 'Bruxelles Économie & Emploi',
    document: 'Dossier MonBEE',
    region: 'Bruxelles uniquement',
    conditions: [
      'Entreprise établie en Région bruxelloise',
      'Secteur commercial (pas ASBL)',
      'Travailleur domicilié en RBC',
      'Contrat CDI ≥ mi-temps',
      '⚠️ Deadline dossier : 01/06/2026',
    ],
    avantage: 'Subside salarial 30% pendant 6 mois + formation possible',
    montantMax: 6000,
    duree: '6 mois renouvelable',
    lienInfo: 'https://economie-emploi.brussels/monbee',
    calcul: (brut) => brut * 0.30,
    urgent: true,
  },
]

export default function AidesEmbauche({ state, dispatch }) {
  const [filtreRegion, setFiltreRegion] = useState('Tous')
  const [brutMensuel, setBrutMensuel] = useState('')
  const [aideSelectee, setAideSelectee] = useState(null)
  const [recherche, setRecherche] = useState('')

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 14 }
  const input = { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box' }
  const btn = (v = 'primary', c = '#f59e0b') => ({ background: v === 'primary' ? c : 'transparent', color: v === 'primary' ? '#000' : '#9ca3af', border: v === 'ghost' ? '1px solid #374151' : 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 })
  const badge = (c) => ({ background: c + '20', color: c, border: `1px solid ${c}40`, borderRadius: 6, padding: '2px 10px', fontSize: 11, fontWeight: 700 })

  const regions = ['Tous', 'Bruxelles', 'Wallonie', 'Flandre', 'Toute Belgique']

  const aidesFiltrees = AIDES.filter(a => {
    const matchRegion = filtreRegion === 'Tous' || a.region.includes(filtreRegion)
    const matchRecherche = !recherche || a.label.toLowerCase().includes(recherche.toLowerCase()) || a.document.toLowerCase().includes(recherche.toLowerCase())
    return matchRegion && matchRecherche
  })

  const brutNum = parseFloat(brutMensuel) || 0
  const economiesTotales = aidesFiltrees.reduce((sum, a) => sum + (brutNum ? a.calcul(brutNum) : a.montantMax / 24), 0)

  if (aideSelectee) {
    const aide = AIDES.find(a => a.id === aideSelectee)
    const economie = brutNum ? aide.calcul(brutNum) : null
    return (
      <div style={s}>
        <button onClick={() => setAideSelectee(null)} style={{ ...btn('ghost'), marginBottom: 20, padding: '6px 14px' }}>← Retour</button>
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 32 }}>{aide.icon}</span>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{aide.label}</h1>
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <span style={badge(aide.couleur)}>{aide.document}</span>
                <span style={badge('#6b7280')}>{aide.region}</span>
                {aide.urgent && <span style={badge('#ef4444')}>⚠️ URGENT</span>}
              </div>
            </div>
          </div>

          {/* Économie calculée */}
          {brutNum > 0 && (
            <div style={{ ...card, background: aide.couleur + '10', borderColor: aide.couleur + '40', marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: aide.couleur, fontWeight: 600, marginBottom: 8 }}>💰 Économie estimée pour un brut de {brutMensuel} €/mois</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: aide.couleur }}>{economie?.toFixed(0)} €<span style={{ fontSize: 14, fontWeight: 400 }}>/mois</span></div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Soit {(economie * 12)?.toFixed(0)} €/an · Plafond : {aide.montantMax.toLocaleString('fr-BE')} € sur {aide.duree}</div>
            </div>
          )}

          <div style={card}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>✅ Conditions d'accès</h3>
            {aide.conditions.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: aide.couleur, flexShrink: 0 }}>•</span>
                <span style={{ color: c.startsWith('⚠️') ? '#ef4444' : '#d1d5db' }}>{c}</span>
              </div>
            ))}
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#10b981' }}>🎯 Avantage</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', lineHeight: 1.7 }}>{aide.avantage}</p>
            <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Montant max total</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{aide.montantMax.toLocaleString('fr-BE')} €</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Durée</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{aide.duree}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>Organisme</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{aide.organisme}</div>
              </div>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>📋 Document requis</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={badge(aide.couleur)}>{aide.document}</span>
              <button
                onClick={() => { if (typeof window !== 'undefined' && dispatch) dispatch({ type: 'SET_PAGE', payload: 'documentsociaux' }) }}
                style={{ ...btn('primary', aide.couleur), fontSize: 12 }}
              >
                Générer le {aide.document} →
              </button>
            </div>
          </div>

          <a href={aide.lienInfo} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 4, fontSize: 13, color: '#3b82f6' }}>
            📎 Informations officielles →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={s}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>💶</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Aides à l'embauche</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{AIDES.length} dispositifs belges · Activa · C78 · C103 · MonBEE · SINE · PTP</p>
          </div>
        </div>

        {/* Alerte MonBEE */}
        <div style={{ background: '#ef444415', border: '1px solid #ef444440', borderRadius: 10, padding: '10px 16px', marginTop: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>MonBEE — Deadline 01/06/2026</span>
            <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>Dossier subside salarial bruxellois à soumettre avant le 1er juin</span>
          </div>
        </div>
      </div>

      {/* Simulateur */}
      <div style={{ ...card, borderColor: '#f59e0b40', background: '#f59e0b08', marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginBottom: 10 }}>🧮 Simulateur d'économies</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Salaire brut mensuel (€)</div>
            <input style={{ ...input, width: 180 }} type="number" value={brutMensuel} onChange={e => setBrutMensuel(e.target.value)} placeholder="Ex: 3200" />
          </div>
          {brutNum > 0 && (
            <div style={{ background: '#f59e0b20', border: '1px solid #f59e0b40', borderRadius: 10, padding: '10px 20px' }}>
              <div style={{ fontSize: 11, color: '#f59e0b' }}>Économies max cumulables</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>{economiesTotales.toFixed(0)} €<span style={{ fontSize: 12, fontWeight: 400 }}>/mois</span></div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Sur {aidesFiltrees.length} aides visibles</div>
            </div>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...input, width: 220 }} placeholder="🔍  Rechercher une aide..." value={recherche} onChange={e => setRecherche(e.target.value)} />
        {regions.map(r => (
          <button key={r} onClick={() => setFiltreRegion(r)} style={{
            padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: filtreRegion === r ? '#f59e0b' : 'transparent',
            color: filtreRegion === r ? '#000' : '#9ca3af',
            border: filtreRegion === r ? 'none' : '1px solid #374151'
          }}>{r}</button>
        ))}
      </div>

      {/* Grille aides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
        {aidesFiltrees.map(aide => {
          const economie = brutNum ? aide.calcul(brutNum) : null
          return (
            <div key={aide.id}
              onClick={() => setAideSelectee(aide.id)}
              style={{ ...card, cursor: 'pointer', borderColor: aide.urgent ? '#ef444440' : '#1e1e1e', position: 'relative', marginBottom: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = aide.couleur; e.currentTarget.style.background = '#161616' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = aide.urgent ? '#ef444440' : '#1e1e1e'; e.currentTarget.style.background = '#111' }}
            >
              {aide.urgent && (
                <div style={{ position: 'absolute', top: 12, right: 12, ...badge('#ef4444') }}>⚠️ URGENT</div>
              )}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>{aide.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, paddingRight: aide.urgent ? 80 : 0 }}>{aide.label}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={badge(aide.couleur)}>{aide.document}</span>
                    <span style={badge('#374151')}>{aide.organisme}</span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12, lineHeight: 1.5 }}>
                {aide.avantage.slice(0, 80)}...
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#4b5563' }}>Max total</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: aide.couleur }}>{aide.montantMax.toLocaleString('fr-BE')} €</div>
                </div>
                {economie !== null && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#4b5563' }}>Votre économie</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#10b981' }}>{economie.toFixed(0)} €/mois</div>
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#3b82f6' }}>Voir →</div>
              </div>
            </div>
          )
        })}
      </div>

      {aidesFiltrees.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#4b5563' }}>
          Aucune aide trouvée pour ces critères.
        </div>
      )}
    </div>
  )
}
