'use client'
import { useState } from 'react'

// ─── CONSTANTES — Loi 3/7/1978 + AR 13/3/1973 ───────────────────────────────
// Salaire garanti employé : Art. 52-53 Loi 3/7/1978
// Salaire garanti ouvrier : Art. 56-57 + CCT n°12bis

const PERIODES_GARANTI = {
  employe: [
    { duree: 30, taux: 1.00, label: '30 premiers jours', description: '100% du salaire brut' },
    { duree: null, taux: 0, label: 'À partir du 31e jour', description: 'Indemnités INAMI (60% du salaire plafonné)' },
  ],
  ouvrier: [
    { duree: 7, taux: 1.00, label: '7 premiers jours (carence)', description: '100% (si > 1 mois ancienneté)' },
    { duree: 7, taux: 0.875, label: 'Jours 8 à 14', description: '87,5% du salaire brut' },
    { duree: 16, taux: 0.80, label: 'Jours 15 à 30', description: '80% du salaire brut' },
    { duree: null, taux: 0, label: 'À partir du 31e jour', description: 'INAMI + complément employeur éventuel' },
  ]
}

// Plafond INAMI 2026 (cotisation maladie)
const PLAFOND_INAMI_JOUR = 111.38 // journalier brut plafonné
const TAUX_INAMI = 0.60
const PP_INAMI = 0.11 // précompte 11% sur indemnités INAMI

// Jours de carence ouvrier
const CARENCE_OUVRIER = { moins1mois: 3, plus1mois: 0 } // jours non payés

function calcSalaireGaranti(salaireBrut, typeContrat, joursAbsence, anciennete) {
  const sJournalier = salaireBrut / 26
  const results = []
  let joursRestants = joursAbsence

  if (typeContrat === 'employe') {
    // 30 jours à 100%
    const j30 = Math.min(joursRestants, 30)
    results.push({
      periode: '30 premiers jours',
      jours: j30,
      taux: '100%',
      montant: (sJournalier * j30).toFixed(2),
      charge: 'Employeur'
    })
    joursRestants -= j30
    if (joursRestants > 0) {
      const allocINAMI = Math.min(sJournalier, PLAFOND_INAMI_JOUR) * TAUX_INAMI
      const allocNette = allocINAMI * (1 - PP_INAMI)
      results.push({
        periode: `Jours 31 à ${joursAbsence}`,
        jours: joursRestants,
        taux: '60% plafonné',
        montant: (allocNette * joursRestants).toFixed(2),
        charge: 'INAMI/mutualité'
      })
    }
  } else {
    // Ouvrier
    const carence = anciennete < 1 ? CARENCE_OUVRIER.moins1mois : CARENCE_OUVRIER.plus1mois
    if (carence > 0 && joursRestants > 0) {
      const jCar = Math.min(joursRestants, carence)
      results.push({ periode: `Jours de carence`, jours: jCar, taux: '0%', montant: '0.00', charge: 'Non payé' })
      joursRestants -= jCar
    }
    // 7 premiers jours à 100%
    if (joursRestants > 0) {
      const j7 = Math.min(joursRestants, 7)
      results.push({ periode: '7 premiers jours', jours: j7, taux: '100%', montant: (sJournalier * j7).toFixed(2), charge: 'Employeur' })
      joursRestants -= j7
    }
    // Jours 8-14 à 87.5%
    if (joursRestants > 0) {
      const j7b = Math.min(joursRestants, 7)
      results.push({ periode: 'Jours 8-14', jours: j7b, taux: '87,5%', montant: (sJournalier * 0.875 * j7b).toFixed(2), charge: 'Employeur' })
      joursRestants -= j7b
    }
    // Jours 15-30 à 80%
    if (joursRestants > 0) {
      const j16 = Math.min(joursRestants, 16)
      results.push({ periode: 'Jours 15-30', jours: j16, taux: '80%', montant: (sJournalier * 0.80 * j16).toFixed(2), charge: 'Employeur' })
      joursRestants -= j16
    }
    // À partir du 31e jour INAMI
    if (joursRestants > 0) {
      const allocINAMI = Math.min(sJournalier, PLAFOND_INAMI_JOUR) * TAUX_INAMI * (1 - PP_INAMI)
      results.push({ periode: `À partir du 31e jour`, jours: joursRestants, taux: '60% INAMI', montant: (allocINAMI * joursRestants).toFixed(2), charge: 'INAMI/mutualité' })
    }
  }

  const totalEmployeur = results.filter(r => r.charge === 'Employeur').reduce((s, r) => s + parseFloat(r.montant), 0)
  const totalINAMI = results.filter(r => r.charge === 'INAMI/mutualité').reduce((s, r) => s + parseFloat(r.montant), 0)
  const totalTravailleur = totalEmployeur + totalINAMI

  return { periodes: results, totalEmployeur, totalINAMI, totalTravailleur, sJournalier }
}

export default function CalcMaladie({ state, dispatch }) {
  const [form, setForm] = useState({
    typeContrat: 'employe',
    salaireBrut: '',
    joursAbsence: '',
    anciennete: '',
    dateDebut: '',
    typeIncapacite: 'maladie',
  })
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState('calcul')

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }
  const input = { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', width: '100%', fontSize: 14, boxSizing: 'border-box' }
  const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 500 }
  const btn = (v = 'primary') => ({ background: v === 'primary' ? '#3b82f6' : '#1f2937', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 })
  const tabS = (a) => ({ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: a ? '#3b82f6' : 'transparent', color: a ? '#fff' : '#9ca3af', border: 'none' })
  const fmt = (v) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2 }).format(v || 0)
  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  function calculate() {
    const r = calcSalaireGaranti(parseFloat(form.salaireBrut || 0), form.typeContrat, parseFloat(form.joursAbsence || 0), parseFloat(form.anciennete || 0))
    setResult(r)
    setTab('result')
  }

  return (
    <div style={s}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🏥</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Calcul Maladie — Salaire Garanti</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Employé & Ouvrier · Délais légaux · INAMI · Loi 3/07/1978</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['calcul', '🔧 Calcul'], ['guide', '📖 Délais légaux']].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} style={tabS(tab === id)}>{l}</button>
          ))}
          {result && <button onClick={() => setTab('result')} style={tabS(tab === 'result')}>📊 Résultats</button>}
        </div>
      </div>

      {tab === 'calcul' && (
        <div style={{ maxWidth: 600 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#3b82f6' }}>📋 Données</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Type de contrat</label>
                <select style={input} value={form.typeContrat} onChange={e => set('typeContrat', e.target.value)}>
                  <option value="employe">Employé(e)</option>
                  <option value="ouvrier">Ouvrier/ière</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Type d'incapacité</label>
                <select style={input} value={form.typeIncapacite} onChange={e => set('typeIncapacite', e.target.value)}>
                  <option value="maladie">Maladie ordinaire</option>
                  <option value="accident">Accident droit commun</option>
                  <option value="maternite">Maternité</option>
                  <option value="burnout">Burn-out / Maladie longue durée</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Salaire brut mensuel (€)</label>
                <input type="number" step="0.01" style={input} value={form.salaireBrut} onChange={e => set('salaireBrut', e.target.value)} placeholder="Ex: 3200" />
              </div>
              <div>
                <label style={lbl}>Nombre de jours d'absence</label>
                <input type="number" style={input} value={form.joursAbsence} onChange={e => set('joursAbsence', e.target.value)} placeholder="Ex: 45" />
              </div>
              <div>
                <label style={lbl}>Ancienneté (années)</label>
                <input type="number" step="0.1" style={input} value={form.anciennete} onChange={e => set('anciennete', e.target.value)} placeholder="Ex: 3.5" />
              </div>
              <div>
                <label style={lbl}>Date de début d'incapacité</label>
                <input type="date" style={input} value={form.dateDebut} onChange={e => set('dateDebut', e.target.value)} />
              </div>
            </div>
          </div>
          <button onClick={calculate} disabled={!form.salaireBrut || !form.joursAbsence} style={{ ...btn(), width: '100%', padding: 14, fontSize: 16, opacity: (!form.salaireBrut || !form.joursAbsence) ? 0.5 : 1 }}>
            Calculer le salaire garanti →
          </button>
        </div>
      )}

      {tab === 'result' && result && (
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Total employeur', value: `${fmt(result.totalEmployeur)} €`, color: '#ef4444' },
              { label: 'Pris en charge INAMI', value: `${fmt(result.totalINAMI)} €`, color: '#3b82f6' },
              { label: 'Total travailleur', value: `${fmt(result.totalTravailleur)} €`, color: '#10b981' },
            ].map(item => (
              <div key={item.label} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>📋 Détail par période</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#1a1a1a' }}>
                  {['Période', 'Jours', 'Taux', 'Montant', 'Charge'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.periodes.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '8px 10px' }}>{p.periode}</td>
                    <td style={{ padding: '8px 10px', color: '#9ca3af' }}>{p.jours}</td>
                    <td style={{ padding: '8px 10px', color: '#f59e0b', fontWeight: 600 }}>{p.taux}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 700 }}>{fmt(p.montant)} €</td>
                    <td style={{ padding: '8px 10px', color: p.charge === 'Employeur' ? '#ef4444' : p.charge === 'INAMI/mutualité' ? '#3b82f6' : '#6b7280', fontSize: 11 }}>{p.charge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => { setResult(null); setTab('calcul') }} style={btn('secondary')}>Nouveau calcul</button>
        </div>
      )}

      {tab === 'guide' && (
        <div style={{ maxWidth: 640 }}>
          {[
            { titre: '👔 Employé — 30 jours à 100%', couleur: '#3b82f6', texte: 'L\'employé malade a droit à 100% de son salaire pendant 30 jours calendrier, payé par l\'employeur. À partir du 31e jour, l\'INAMI (mutualité) prend le relais à 60% du salaire plafonné. Le certificat médical doit être remis dans les 2 jours ouvrables.' },
            { titre: '👷 Ouvrier — Système progressif', couleur: '#f59e0b', texte: 'Jours de carence (0-3 jours non payés selon ancienneté), puis 7 jours à 100%, 7 jours à 87,5%, 16 jours à 80%. À partir du 31e jour : INAMI. La CCT n°12bis a harmonisé ce régime. Aucun jour de carence si ancienneté > 1 mois.' },
            { titre: '🏥 INAMI — À partir du 31e jour', couleur: '#10b981', texte: 'Le médecin-conseil de la mutualité reconnaît l\'incapacité. Indemnité = 60% du salaire journalier plafonné (111,38€/jour en 2026). Après 1 an, invalide : taux différencié (65% chef de famille, 55% isolé, 40% cohabitant).' },
            { titre: '📋 Obligations employeur', couleur: '#8b5cf6', texte: 'Certificat médical requis (délai selon règlement de travail, max 2 jours). Maintien des droits : ancienneté, avantages. Pas de licenciement pendant 6 premiers mois de maladie (protection relative). Déclaration DmfA adaptée.' },
          ].map(item => (
            <div key={item.titre} style={{ ...card, borderLeft: `3px solid ${item.couleur}` }}>
              <h4 style={{ margin: '0 0 8px', color: item.couleur, fontSize: 14 }}>{item.titre}</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', lineHeight: 1.7 }}>{item.texte}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
