'use client'
import { useState } from 'react'

// ─── CCT n°103 — Crédit-temps 2024-2026 ─────────────────────────────────────
// AR 12/12/2001 modifié + CCT n°103 (01/09/2012) + CCT n°127 (2020)

const TYPES_CREDIT = [
  {
    id: 'plein_sans_motif',
    label: 'Crédit-temps sans motif (plein)',
    description: 'Suspension complète, sans motif, max 51 mois carrière',
    allocation: false,
    reductionONSS: true,
    dureeMax: 51,
  },
  {
    id: 'partiel_sans_motif',
    label: 'Crédit-temps sans motif (1/2 ou 1/5)',
    description: '1/2 ou 1/5 de réduction, max 51 mois carrière',
    allocation: false,
    reductionONSS: true,
    dureeMax: 51,
  },
  {
    id: 'motif_soins_enfant',
    label: 'Avec motif — Soins enfant (-8 ans)',
    description: 'Enfant < 8 ans. Allocation ONEm. Max 51 mois.',
    allocation: true,
    allocMontant: { plein: 832.85, miTemps: 434.69, unCinquieme: 148.02 },
    dureeMax: 51,
  },
  {
    id: 'motif_soins_parent',
    label: 'Avec motif — Soins parent (malade)',
    description: 'Soins à parent gravement malade. Allocation ONEm.',
    allocation: true,
    allocMontant: { plein: 832.85, miTemps: 434.69, unCinquieme: 148.02 },
    dureeMax: 24,
  },
  {
    id: 'motif_palliatif',
    label: 'Avec motif — Soins palliatifs',
    description: 'Accompagnement fin de vie. Allocation ONEm. Max 3 mois.',
    allocation: true,
    allocMontant: { plein: 832.85, miTemps: 434.69, unCinquieme: 148.02 },
    dureeMax: 3,
  },
  {
    id: 'motif_formation',
    label: 'Avec motif — Formation reconnue',
    description: 'Formation reconnue par la région. Allocation ONEm.',
    allocation: true,
    allocMontant: { plein: 832.85, miTemps: 434.69, unCinquieme: 148.02 },
    dureeMax: 36,
  },
  {
    id: 'fin_carriere_55',
    label: 'Crédit-temps fin de carrière (+55 ans)',
    description: 'Droit renforcé à partir de 55 ans. Allocation ONEm majorée.',
    allocation: true,
    allocMontant: { plein: 1070.40, miTemps: 536.91, unCinquieme: 202.31 },
    dureeMax: null,
  },
]

// Réduction ONSS employeur crédit-temps (AR 25/11/1991 + CCT n°103)
const REDUCTIONS_ONSS = {
  plein: 400, // €/mois réduction cotisations patronales
  miTemps: 200,
  unCinquieme: 100,
}

const ALLOCATIONS_ONEMP = {
  motif_soins_enfant: { plein: 832.85, miTemps: 434.69, unCinquieme: 148.02 },
  motif_soins_parent: { plein: 832.85, miTemps: 434.69, unCinquieme: 148.02 },
  motif_palliatif: { plein: 1104.53, miTemps: 552.27, unCinquieme: 190.42 },
  motif_formation: { plein: 832.85, miTemps: 434.69, unCinquieme: 148.02 },
  fin_carriere_55: { plein: 1070.40, miTemps: 536.91, unCinquieme: 202.31 },
}

function calcCredit(type, regime, salaireBrut, duree, age) {
  const typeInfo = TYPES_CREDIT.find(t => t.id === type)
  const brutNum = parseFloat(salaireBrut || 0)

  // Allocation ONEm
  const allocs = ALLOCATIONS_ONEMP[type]
  let allocMensuelle = 0
  if (typeInfo?.allocation && allocs) {
    allocMensuelle = regime === 'plein' ? allocs.plein : regime === 'miTemps' ? allocs.miTemps : allocs.unCinquieme
  }

  // Salaire pendant crédit-temps
  const salairePendant = regime === 'plein' ? 0 : regime === 'miTemps' ? brutNum * 0.50 : brutNum * 0.80
  const totalMensuel = salairePendant + allocMensuelle

  // Réduction ONSS employeur
  const redONSS = REDUCTIONS_ONSS[regime === 'plein' ? 'plein' : regime === 'miTemps' ? 'miTemps' : 'unCinquieme']

  // Économie totale employeur sur la durée
  const dureeNum = parseFloat(duree || 0)
  const economieEmployeur = (brutNum - salairePendant) * dureeNum - (redONSS * dureeNum) * -1

  return {
    typeInfo, regime, allocMensuelle, salairePendant, totalMensuel, redONSS,
    dureeMax: typeInfo?.dureeMax,
    perteSalaire: brutNum - salairePendant,
    compensationAlloc: allocMensuelle > 0 ? ((allocMensuelle / (brutNum - salairePendant)) * 100).toFixed(1) : '0',
  }
}

export default function CreditTemps({ state, dispatch }) {
  const [form, setForm] = useState({ type: 'motif_soins_enfant', regime: 'miTemps', salaireBrut: '', duree: '', age: '', anciennete: '' })
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState('calcul')

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }
  const input = { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', width: '100%', fontSize: 14, boxSizing: 'border-box' }
  const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 500 }
  const btn = (v = 'primary') => ({ background: v === 'primary' ? '#a855f7' : '#1f2937', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 })
  const tabS = (a) => ({ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: a ? '#a855f7' : 'transparent', color: a ? '#fff' : '#9ca3af', border: 'none' })
  const fmt = (v) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2 }).format(v || 0)
  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  function calculate() {
    const r = calcCredit(form.type, form.regime, form.salaireBrut, form.duree, form.age)
    setResult(r)
    setTab('result')
  }

  const typeSelectionne = TYPES_CREDIT.find(t => t.id === form.type)

  return (
    <div style={s}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🔄</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Crédit-Temps</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Allocations ONEm · Réductions ONSS · CCT n°103 · Types et conditions</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['calcul', '🔧 Calcul'], ['types', '📋 Types'], ['guide', '📖 Conditions']].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} style={tabS(tab === id)}>{l}</button>
          ))}
          {result && <button onClick={() => setTab('result')} style={tabS(tab === 'result')}>📊 Résultats</button>}
        </div>
      </div>

      {tab === 'calcul' && (
        <div style={{ maxWidth: 640 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#a855f7' }}>🔄 Type de crédit-temps</h3>
            <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
              {TYPES_CREDIT.map(t => (
                <div key={t.id} onClick={() => set('type', t.id)}
                  style={{ padding: '12px 14px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${form.type === t.id ? '#a855f7' : '#2a2a2a'}`, background: form.type === t.id ? '#a855f710' : '#0d0d0d', transition: 'all .15s' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: form.type === t.id ? '#a855f7' : '#f1f5f9' }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{t.description}
                    {t.allocation && <span style={{ marginLeft: 8, color: '#10b981', fontWeight: 600 }}>✓ Allocation ONEm</span>}
                    {t.dureeMax && <span style={{ marginLeft: 8, color: '#f59e0b' }}>Max {t.dureeMax} mois</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700 }}>⚙️ Modalités</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Régime de réduction</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[['plein', 'Suspension complète (100%)'], ['miTemps', 'Mi-temps (50%)'], ['unCinquieme', '1/5 temps (80%)']].map(([v, l]) => (
                    <button key={v} onClick={() => set('regime', v)} style={{ flex: 1, padding: '8px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: form.regime === v ? '#a855f7' : '#1f2937', color: '#fff', border: 'none' }}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl}>Salaire brut mensuel (€)</label>
                <input type="number" step="0.01" style={input} value={form.salaireBrut} onChange={e => set('salaireBrut', e.target.value)} placeholder="Ex: 3200" />
              </div>
              <div>
                <label style={lbl}>Durée souhaitée (mois)</label>
                <input type="number" style={input} value={form.duree} onChange={e => set('duree', e.target.value)} placeholder={`Max: ${typeSelectionne?.dureeMax || '∞'} mois`} />
              </div>
              <div>
                <label style={lbl}>Âge du travailleur</label>
                <input type="number" style={input} value={form.age} onChange={e => set('age', e.target.value)} placeholder="Ex: 45" />
              </div>
              <div>
                <label style={lbl}>Ancienneté (années)</label>
                <input type="number" step="0.5" style={input} value={form.anciennete} onChange={e => set('anciennete', e.target.value)} placeholder="Ex: 5" />
              </div>
            </div>
          </div>
          <button onClick={calculate} disabled={!form.salaireBrut} style={{ ...btn(), width: '100%', padding: 14, fontSize: 16, opacity: !form.salaireBrut ? 0.5 : 1 }}>
            Calculer →
          </button>
        </div>
      )}

      {tab === 'result' && result && (
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Salaire pendant crédit', value: `${fmt(result.salairePendant)} €`, color: '#f59e0b' },
              { label: 'Allocation ONEm', value: `${fmt(result.allocMensuelle)} €`, color: '#10b981' },
              { label: 'Total mensuel', value: `${fmt(result.totalMensuel)} €`, color: '#a855f7' },
            ].map(item => (
              <div key={item.label} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>📋 Détail</h3>
            {[
              ['Type de crédit-temps', result.typeInfo?.label],
              ['Perte de salaire mensuelle', `-${fmt(result.perteSalaire)} €`],
              ['Allocation ONEm mensuelle', `+${fmt(result.allocMensuelle)} €`],
              ['Compensation allocation', `${result.compensationAlloc}% de la perte`],
              ['Réduction ONSS employeur', `${fmt(result.redONSS)} €/mois`],
              ['Durée max autorisée', result.dureeMax ? `${result.dureeMax} mois` : 'Illimitée (fin carrière)'],
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

      {tab === 'types' && (
        <div style={{ maxWidth: 640 }}>
          {TYPES_CREDIT.map(t => (
            <div key={t.id} style={{ ...card, borderLeft: `3px solid ${t.allocation ? '#10b981' : '#6b7280'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{t.label}</div>
                {t.allocation && <span style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98140', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>ONEm</span>}
              </div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>{t.description}</div>
              {t.allocMontant && (
                <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                  <span style={{ color: '#10b981' }}>Plein : {fmt(t.allocMontant.plein)} €</span>
                  <span style={{ color: '#10b981' }}>1/2 : {fmt(t.allocMontant.miTemps)} €</span>
                  <span style={{ color: '#10b981' }}>1/5 : {fmt(t.allocMontant.unCinquieme)} €</span>
                </div>
              )}
              {t.dureeMax && <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>Durée max : {t.dureeMax} mois</div>}
            </div>
          ))}
        </div>
      )}

      {tab === 'guide' && (
        <div style={{ maxWidth: 640 }}>
          {[
            { titre: '✅ Conditions d\'accès générales', couleur: '#a855f7', texte: 'Ancienneté minimale de 2 ans chez l\'employeur. L\'employeur emploie au moins 10 travailleurs (pour crédit-temps sans motif). La demande se fait auprès de l\'employeur, qui ne peut refuser que pour raisons d\'organisation dans les 30 jours.' },
            { titre: '📋 Procédure de demande', couleur: '#3b82f6', texte: 'Notification écrite à l\'employeur (recommandé ou remise en mains propres) au moins 3 mois avant la date souhaitée. L\'employeur a 30 jours pour accepter/refuser. En cas de refus, recours possible devant la commission paritaire.' },
            { titre: '💰 Allocations ONEm', couleur: '#10b981', texte: 'Les allocations sont accordées par l\'ONEm via la mutualité ou la CAPAC. Elles sont imposables mais bénéficient d\'un taux réduit. Formulaire C61 à remplir. Les montants dépendent du type de motif et de l\'âge.' },
            { titre: '🔒 Protection contre le licenciement', couleur: '#ef4444', texte: 'Protection contre le licenciement pendant la durée du crédit-temps + 3 mois après le retour. Indemnité protection = 6 mois de salaire. Exception : licenciement pour motif grave ou raisons économiques structurelles prouvées.' },
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
