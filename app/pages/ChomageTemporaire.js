'use client'
import { useState, useMemo } from 'react'

// ─── CONSTANTES LÉGALES — Chômage temporaire Belgique ────────────────────────
// AR 25/11/1991 - Chômage économique + Force majeure + Corona
// Taux allocations : 70% du salaire plafonné

const PLAFOND_JOURNALIER = { employe: 130.98, ouvrier: 121.06 } // 2026
const TAUX_ALLOCATION = 0.70
const TAUX_ONSS_CHOMAGE = 0.1307
const PP_CHOMAGE = 0.26 // Précompte forfaitaire 26% sur allocations

const MOTIFS = [
  { id: 'economique_ouvrier', label: 'Chômage économique — Ouvriers', maxJours: 16, maxSemaines: 4 },
  { id: 'economique_employe', label: 'Chômage économique — Employés', maxJours: 16, maxSemaines: 4 },
  { id: 'force_majeure', label: 'Force majeure (météo, incendie...)', maxJours: null, maxSemaines: null },
  { id: 'greve', label: 'Grève ou lock-out', maxJours: null, maxSemaines: null },
  { id: 'intemperies', label: 'Intempéries (construction)', maxJours: null, maxSemaines: null },
]

const FORMULAIRES = [
  { code: 'C3.2', label: 'C3.2 — Constat du droit (mensuel)', description: 'À remettre à l\'ONEm chaque mois' },
  { code: 'C106', label: 'C106 — Déclaration employeur (économique)', description: 'Avant la première période de chômage' },
  { code: 'C104', label: 'C104 — Déclaration de chômage économique', description: 'Pour chaque période de chômage' },
]

function calcAllocation(salaireBrut, type, joursChomage) {
  const plafond = type === 'ouvrier' ? PLAFOND_JOURNALIER.ouvrier : PLAFOND_JOURNALIER.employe
  const salaireJournalier = salaireBrut / 26 // 26 jours/mois convention
  const baseCalc = Math.min(salaireJournalier, plafond)
  const allocBrute = baseCalc * TAUX_ALLOCATION
  const pp = allocBrute * PP_CHOMAGE
  const allocNette = (allocBrute - pp) * joursChomage
  const allocBruteTotale = allocBrute * joursChomage
  const complementEmployeur = salaireJournalier > plafond
    ? (salaireJournalier - plafond) * TAUX_ALLOCATION * joursChomage
    : 0
  return {
    salaireJournalier: salaireJournalier.toFixed(2),
    plafondJournalier: plafond.toFixed(2),
    allocJournaliereBrute: allocBrute.toFixed(2),
    allocJournaliereNette: (allocBrute - pp).toFixed(2),
    allocTotaleBrute: allocBruteTotale.toFixed(2),
    allocTotaleNette: allocNette.toFixed(2),
    ppTotal: (pp * joursChomage).toFixed(2),
    complementEmployeur: complementEmployeur.toFixed(2),
    totalTravailleur: (allocNette + complementEmployeur).toFixed(2),
    economieEmployeur: (salaireBrut / 26 * joursChomage * 1.30 - complementEmployeur).toFixed(2),
  }
}

export default function ChomageTemporaire({ state, dispatch }) {
  const [tab, setTab] = useState('calcul')
  const [form, setForm] = useState({
    typeContrat: 'employe',
    motif: 'economique_employe',
    salaireBrut: '',
    joursChomage: '',
    periodeDebut: '',
    periodeFin: '',
    travailleurNom: '',
    cp: '200',
  })
  const [result, setResult] = useState(null)
  const [notifications, setNotifications] = useState([
    { id: 1, label: 'Notification ONEm (C106) envoyée', done: false },
    { id: 2, label: 'Accord de la commission paritaire obtenu', done: false },
    { id: 3, label: 'Travailleurs informés 3 jours à l\'avance', done: false },
    { id: 4, label: 'Affichage en entreprise effectué', done: false },
    { id: 5, label: 'C3.2 préparés pour chaque travailleur', done: false },
    { id: 6, label: 'Déclaration DmfA adaptée pour la période', done: false },
  ])

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }
  const input = { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', width: '100%', fontSize: 14, boxSizing: 'border-box' }
  const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 500 }
  const btn = (v = 'primary') => ({ background: v === 'primary' ? '#f59e0b' : '#1f2937', color: v === 'primary' ? '#000' : '#f1f5f9', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 })
  const tabS = (a) => ({ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: a ? '#f59e0b' : 'transparent', color: a ? '#000' : '#9ca3af', border: 'none' })
  const fmt = (v) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2 }).format(v || 0)
  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  function calculate() {
    const r = calcAllocation(parseFloat(form.salaireBrut || 0), form.typeContrat, parseFloat(form.joursChomage || 0))
    setResult(r)
    setTab('result')
  }

  return (
    <div style={s}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>⏸</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Chômage Temporaire</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Calcul allocations · Formulaires · Procédure ONEm · AR 25/11/1991</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['calcul', '🔧 Calcul'], ['procedure', '📋 Procédure'], ['guide', '📖 Guide']].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} style={tabS(tab === id)}>{l}</button>
          ))}
          {result && <button onClick={() => setTab('result')} style={tabS(tab === 'result')}>📊 Résultats</button>}
        </div>
      </div>

      {tab === 'calcul' && (
        <div style={{ maxWidth: 640 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#f59e0b' }}>👤 Travailleur & motif</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Nom du travailleur</label>
                <input style={input} value={form.travailleurNom} onChange={e => set('travailleurNom', e.target.value)} placeholder="Nom Prénom" />
              </div>
              <div>
                <label style={lbl}>Type de contrat</label>
                <select style={input} value={form.typeContrat} onChange={e => set('typeContrat', e.target.value)}>
                  <option value="employe">Employé(e)</option>
                  <option value="ouvrier">Ouvrier/ière</option>
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Motif du chômage temporaire</label>
                <select style={input} value={form.motif} onChange={e => set('motif', e.target.value)}>
                  {MOTIFS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Début de la période</label>
                <input type="date" style={input} value={form.periodeDebut} onChange={e => set('periodeDebut', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Fin de la période</label>
                <input type="date" style={input} value={form.periodeFin} onChange={e => set('periodeFin', e.target.value)} />
              </div>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#3b82f6' }}>💰 Données salariales</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Salaire brut mensuel (€)</label>
                <input type="number" step="0.01" style={input} value={form.salaireBrut} onChange={e => set('salaireBrut', e.target.value)} placeholder="Ex: 2800" />
              </div>
              <div>
                <label style={lbl}>Nombre de jours en chômage</label>
                <input type="number" style={input} value={form.joursChomage} onChange={e => set('joursChomage', e.target.value)} placeholder="Ex: 8" />
              </div>
              <div>
                <label style={lbl}>Commission paritaire</label>
                <input style={input} value={form.cp} onChange={e => set('cp', e.target.value)} placeholder="Ex: 200" />
              </div>
            </div>
          </div>

          <button onClick={calculate} disabled={!form.salaireBrut || !form.joursChomage} style={{ ...btn(), width: '100%', padding: 14, fontSize: 16, opacity: (!form.salaireBrut || !form.joursChomage) ? 0.5 : 1 }}>
            Calculer les allocations →
          </button>
        </div>
      )}

      {tab === 'result' && result && (
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Allocation nette totale', value: `${fmt(result.allocTotaleNette)} €`, color: '#10b981' },
              { label: 'Complément employeur', value: `${fmt(result.complementEmployeur)} €`, color: '#f59e0b' },
              { label: 'Économie employeur', value: `${fmt(result.economieEmployeur)} €`, color: '#3b82f6' },
            ].map(item => (
              <div key={item.label} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>📋 Détail par jour</h3>
            {[
              ['Salaire journalier de référence', `${fmt(result.salaireJournalier)} €`],
              ['Plafond ONEm journalier', `${fmt(result.plafondJournalier)} €`],
              ['Allocation journalière brute (70%)', `${fmt(result.allocJournaliereBrute)} €`],
              ['Précompte (26%)', `-${fmt(parseFloat(result.allocJournaliereBrute) * 0.26)} €`],
              ['Allocation journalière nette', `${fmt(result.allocJournaliereNette)} €`],
              ['PP total retenu', `-${fmt(result.ppTotal)} €`],
              ['Total allocation nette', `${fmt(result.allocTotaleNette)} €`],
              ['Complément employeur (si applicable)', `${fmt(result.complementEmployeur)} €`],
              ['Total perçu par le travailleur', `${fmt(result.totalTravailleur)} €`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a1a', fontSize: 13 }}>
                <span style={{ color: '#9ca3af' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setResult(null); setTab('calcul') }} style={btn('secondary')}>Nouveau calcul</button>
        </div>
      )}

      {tab === 'procedure' && (
        <div style={{ maxWidth: 640 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: '#f59e0b' }}>✅ Checklist procédure</h3>
            {notifications.map(n => (
              <div key={n.id} onClick={() => setNotifications(p => p.map(x => x.id === n.id ? { ...x, done: !x.done } : x))}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #1a1a1a', cursor: 'pointer' }}>
                <span style={{ fontSize: 18, color: n.done ? '#10b981' : '#374151' }}>{n.done ? '✅' : '☐'}</span>
                <span style={{ fontSize: 13, color: n.done ? '#6b7280' : '#f1f5f9', textDecoration: n.done ? 'line-through' : 'none' }}>{n.label}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
              {notifications.filter(n => n.done).length}/{notifications.length} étapes complétées
            </div>
          </div>
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>📄 Formulaires requis</h3>
            {FORMULAIRES.map(f => (
              <div key={f.code} style={{ padding: '10px 0', borderBottom: '1px solid #1a1a1a' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{f.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'guide' && (
        <div style={{ maxWidth: 640 }}>
          {[
            { titre: '⚖️ Chômage économique — Conditions', couleur: '#f59e0b', texte: 'L\'employeur peut recourir au chômage économique en cas de manque de travail résultant de causes économiques. Pour les ouvriers : max 4 semaines de suspension complète par trimestre. Pour les employés : notification ONEm 14 jours avant, accord de la commission paritaire requis.' },
            { titre: '💰 Calcul des allocations', couleur: '#10b981', texte: '70% du salaire journalier plafonné. Plafond 2026 : 130,98€/jour (employé) ou 121,06€/jour (ouvrier). Précompte forfaitaire de 26% retenu à la source par l\'ONEm. Si salaire > plafond, l\'employeur verse un complément.' },
            { titre: '📋 Obligations employeur', couleur: '#3b82f6', texte: 'Notification préalable à l\'ONEm via le formulaire C106. Information des travailleurs 3 jours ouvrables avant. Affichage en entreprise. Remise du C3.2 à chaque travailleur chaque mois. Adaptation de la DmfA trimestrielle.' },
            { titre: '🏗️ Intempéries — Construction', couleur: '#8b5cf6', texte: 'Régime spécifique CP 124. Déclaration à l\'ONEm le jour même ou le lendemain. Pas de condition d\'ancienneté. Allocation = 70% du salaire plafonné. Le Fonds de sécurité d\'existence de la construction peut intervenir en complément.' },
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
