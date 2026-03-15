'use client'
import { useState, useMemo } from 'react'

const TX_ONSS_W = 0.1307
const TX_ONSS_E = 0.2507
const RMMMG = 2070.48

// Plancher fictif ONSS pour temps partiel (AR 28/11/1969)
// Si rémunération partielle < 1/3 RMMMG → ONSS calculé sur 1/3 RMMMG
const PLANCHER_TIERS = RMMMG / 3 // ~690€

function calcTempsPartiel(brutTP, regimePct, brutRef) {
  const regime = regimePct / 100
  const brutTPNum = parseFloat(brutTP || 0)
  const brutRefNum = parseFloat(brutRef || brutTPNum / regime)

  // Plancher fictif ONSS
  const plancherFictif = Math.max(brutRefNum * regime, PLANCHER_TIERS)
  const baseCotisationONSS = Math.max(brutTPNum, plancherFictif)

  // Cotisations travailleur
  const onssW = baseCotisationONSS * TX_ONSS_W
  const onssE = baseCotisationONSS * TX_ONSS_E

  // PP sur salaire réel (pas le fictif)
  const brutImp = brutTPNum - onssW
  let pp = 0
  if (brutImp <= 1095) pp = 0
  else if (brutImp <= 1945) pp = (brutImp - 1095) * 0.2625
  else if (brutImp <= 2800) pp = 224.06 + (brutImp - 1945) * 0.3220
  else if (brutImp <= 4300) pp = 499.27 + (brutImp - 2800) * 0.3475
  else pp = 1021.02 + (brutImp - 4300) * 0.50

  const net = Math.max(0, brutTPNum - onssW - pp)

  // Droits pro-rata
  const vacancesJours = Math.round(20 * regime)
  const peculeDouble = brutTPNum * 0.92
  const chRRepas = Math.round(22 * regime) // jours pro-rata

  // Comparaison plein temps
  const brutPlein = brutRefNum
  const onssWPlein = brutPlein * TX_ONSS_W
  let ppPlein = 0
  const brutImpPlein = brutPlein - onssWPlein
  if (brutImpPlein <= 1095) ppPlein = 0
  else if (brutImpPlein <= 1945) ppPlein = (brutImpPlein - 1095) * 0.2625
  else if (brutImpPlein <= 2800) ppPlein = 224.06 + (brutImpPlein - 1945) * 0.3220
  else if (brutImpPlein <= 4300) ppPlein = 499.27 + (brutImpPlein - 2800) * 0.3475
  else ppPlein = 1021.02 + (brutImpPlein - 4300) * 0.50
  const netPlein = brutPlein - onssWPlein - ppPlein

  return {
    brutTP: brutTPNum, regime, brutRef: brutRefNum,
    baseCotisationONSS, plancherFictif,
    onssW, onssE, pp, net,
    vacancesJours, peculeDouble, chRRepas,
    brutPlein, netPlein,
    efficaciteNette: brutTPNum > 0 ? (net / brutTPNum * 100).toFixed(1) : 0,
    pertePctVsPlein: netPlein > 0 ? ((1 - net / netPlein) * 100).toFixed(1) : 0,
  }
}

const REGIMES = [
  { label: '4/5 temps', val: 80, heures: 32 },
  { label: 'Mi-temps', val: 50, heures: 19 },
  { label: '3/4 temps', val: 75, heures: 28.5 },
  { label: '3/5 temps', val: 60, heures: 22.8 },
  { label: '2/5 temps', val: 40, heures: 15.2 },
]

export default function SimulateurTempsPartiel({ state, dispatch }) {
  const [form, setForm] = useState({ brutRef: '', regime: '80', typeContrat: 'employe', motif: 'choix', anciennete: '' })
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState('calcul')

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }
  const input = { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', width: '100%', fontSize: 14, boxSizing: 'border-box' }
  const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 500 }
  const btn = (v = 'primary') => ({ background: v === 'primary' ? '#10b981' : '#1f2937', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 })
  const tabS = (a) => ({ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: a ? '#10b981' : 'transparent', color: a ? '#fff' : '#9ca3af', border: 'none' })
  const fmt = (v) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2 }).format(v || 0)
  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  function calculate() {
    const brutTP = parseFloat(form.brutRef || 0) * (parseFloat(form.regime) / 100)
    const r = calcTempsPartiel(brutTP, parseFloat(form.regime), parseFloat(form.brutRef))
    setResult(r)
    setTab('result')
  }

  return (
    <div style={s}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>⏱</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Simulateur Temps Partiel</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Plancher ONSS fictif · Pro-rata droits · Comparaison plein temps · Loi 3/7/1978</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['calcul', '🔧 Calcul'], ['droits', '📋 Droits pro-rata'], ['guide', '📖 Règles légales']].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} style={tabS(tab === id)}>{l}</button>
          ))}
          {result && <button onClick={() => setTab('result')} style={tabS(tab === 'result')}>📊 Résultats</button>}
        </div>
      </div>

      {tab === 'calcul' && (
        <div style={{ maxWidth: 600 }}>
          {/* Régimes rapides */}
          <div style={card}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#10b981' }}>⚡ Régimes courants</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {REGIMES.map(r => (
                <button key={r.val} onClick={() => set('regime', r.val.toString())}
                  style={{ padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: form.regime === r.val.toString() ? '#10b981' : '#1f2937', color: form.regime === r.val.toString() ? '#fff' : '#9ca3af', border: 'none' }}>
                  {r.label} ({r.val}% — {r.heures}h/sem)
                </button>
              ))}
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>💰 Données</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Salaire brut plein temps (€/mois)</label>
                <input type="number" step="0.01" style={input} value={form.brutRef} onChange={e => set('brutRef', e.target.value)} placeholder="Ex: 3500" />
              </div>
              <div>
                <label style={lbl}>Régime de travail (%)</label>
                <input type="number" min="10" max="99" style={input} value={form.regime} onChange={e => set('regime', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Type de contrat</label>
                <select style={input} value={form.typeContrat} onChange={e => set('typeContrat', e.target.value)}>
                  <option value="employe">Employé(e) — CDI temps partiel</option>
                  <option value="employe_cdd">Employé(e) — CDD temps partiel</option>
                  <option value="ouvrier">Ouvrier/ière temps partiel</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Motif du temps partiel</label>
                <select style={input} value={form.motif} onChange={e => set('motif', e.target.value)}>
                  <option value="choix">Choix personnel</option>
                  <option value="credit_temps">Crédit-temps</option>
                  <option value="parental">Congé parental</option>
                  <option value="economique">Raisons économiques (employeur)</option>
                  <option value="medical">Raisons médicales</option>
                </select>
              </div>
            </div>
            {form.brutRef && form.regime && (
              <div style={{ marginTop: 14, padding: 12, background: '#0d1a0d', border: '1px solid #10b98130', borderRadius: 8, fontSize: 13 }}>
                Salaire brut temps partiel : <b style={{ color: '#10b981' }}>{fmt(parseFloat(form.brutRef) * parseFloat(form.regime) / 100)} €</b>
                {parseFloat(form.brutRef) * parseFloat(form.regime) / 100 < PLANCHER_TIERS && (
                  <span style={{ color: '#f59e0b', marginLeft: 12 }}>⚠️ Inférieur au plancher fictif ONSS ({fmt(PLANCHER_TIERS)} €)</span>
                )}
              </div>
            )}
          </div>
          <button onClick={calculate} disabled={!form.brutRef} style={{ ...btn(), width: '100%', padding: 14, fontSize: 16, opacity: !form.brutRef ? 0.5 : 1 }}>
            Calculer →
          </button>
        </div>
      )}

      {tab === 'result' && result && (
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Net temps partiel', value: `${fmt(result.net)} €`, color: '#10b981' },
              { label: 'Net plein temps', value: `${fmt(result.netPlein)} €`, color: '#6b7280' },
              { label: 'Perte vs plein temps', value: `-${result.pertePctVsPlein}%`, color: '#ef4444' },
            ].map(item => (
              <div key={item.label} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>📋 Détail calcul — Régime {(result.regime * 100).toFixed(0)}%</h3>
            {[
              ['Salaire brut temps partiel', `${fmt(result.brutTP)} €`],
              ['Base cotisation ONSS (plancher fictif)', `${fmt(result.baseCotisationONSS)} €`],
              ['ONSS travailleur (13,07%)', `-${fmt(result.onssW)} €`],
              ['Précompte professionnel', `-${fmt(result.pp)} €`],
              ['Salaire NET', `${fmt(result.net)} €`],
              ['ONSS patronal (25,07%)', `${fmt(result.onssE)} €`],
              ['Coût total employeur', `${fmt(result.brutTP + result.onssE)} €`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a1a', fontSize: 13 }}>
                <span style={{ color: '#9ca3af' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#10b981' }}>📅 Droits pro-rata</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Jours de vacances/an', value: `${result.vacancesJours} jours` },
                { label: 'Double pécule', value: `${fmt(result.peculeDouble)} €` },
                { label: 'Chèques-repas/mois', value: `${result.chRRepas} tickets` },
                { label: 'Ancienneté', value: '100% (pas de proratisation)' },
              ].map(item => (
                <div key={item.label} style={{ background: '#0d0d0d', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{item.label}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#10b981', marginTop: 4 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => { setResult(null); setTab('calcul') }} style={btn('secondary')}>Nouveau calcul</button>
        </div>
      )}

      {tab === 'droits' && (
        <div style={{ maxWidth: 640 }}>
          {[
            { titre: '🏖 Vacances annuelles', texte: 'Pro-rata du régime de travail : 4/5 temps = 16 jours, mi-temps = 10 jours. Le calcul se base sur les jours prestés dans l\'année de référence.' },
            { titre: '🍽 Chèques-repas', texte: 'Uniquement pour les jours effectivement travaillés. 4/5 temps = environ 18 tickets/mois (4 jours × ~4,5 semaines). Valeur maximale 8€/ticket exonérée.' },
            { titre: '💰 Double pécule de vacances', texte: 'Pro-rata : calculé sur le salaire brut du régime partiel × 0,92. Pas de pro-rata sur la définition — droit entier dès que le travailleur est actif.' },
            { titre: '📋 Contrat écrit obligatoire', texte: 'Le contrat de travail à temps partiel DOIT être rédigé par écrit AVANT le début de l\'occupation. Mention obligatoire du régime et des horaires fixes ou variables.' },
            { titre: '⚡ Heures supplémentaires', texte: 'Les heures entre le régime partiel et le plein temps sont des "heures complémentaires" (pas supplémentaires). Un crédit de 12h/mois est toléré sans surcharge. Au-delà : surcharge de 50% ou 100%.' },
            { titre: '🔄 Priorité plein temps', texte: 'Le travailleur à temps partiel a priorité pour un poste à temps plein disponible, proportionnellement à l\'ancienneté et si les compétences correspondent.' },
          ].map((item, i) => (
            <div key={i} style={{ ...card, borderLeft: '3px solid #10b981' }}>
              <h4 style={{ margin: '0 0 8px', color: '#10b981', fontSize: 14 }}>{item.titre}</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', lineHeight: 1.7 }}>{item.texte}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'guide' && (
        <div style={{ maxWidth: 640 }}>
          {[
            { titre: '⚖️ Plancher fictif ONSS (Art. 23bis LCPSP)', couleur: '#f59e0b', texte: `Si le salaire temps partiel est inférieur à 1/3 du RMMMG (${fmt(RMMMG / 3)} €/mois en 2026), les cotisations ONSS sont calculées sur le plancher fictif. Cela protège les droits sociaux du travailleur mais augmente le coût proportionnel.` },
            { titre: '📝 Contrat obligatoire — Loi 3/7/1978 Art. 11bis', couleur: '#3b82f6', texte: 'Contrat ÉCRIT avant le 1er jour. Mentions obligatoires : régime de travail (hebdomadaire ou mensuel), horaire fixe ou variable, référence au règlement de travail. Sans contrat écrit : présomption de plein temps!' },
            { titre: '📣 Affichage et notification', couleur: '#8b5cf6', texte: 'Les horaires variables doivent être affichés au moins 5 jours ouvrables à l\'avance au lieu de travail. Le travailleur doit en avoir connaissance. Non-respect = heures complémentaires non prévues payables à 50%.' },
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
