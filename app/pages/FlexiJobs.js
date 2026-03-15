'use client'
import { useState, useMemo } from 'react'

// ─── FLEXI-JOBS — Loi 16/11/2015 modifiée 2023 ──────────────────────────────
// Taux ONSS réduits : travailleur 0%, employeur 25%
// Précompte professionnel : 0% sur flexi-salaire
// Flexi-salaire horaire minimum 2026 : 12,08€/heure

const FLEXI_ONSS_TRV = 0.00   // 0% travailleur
const FLEXI_ONSS_PAT = 0.25   // 25% patronal (réduit vs 32%)
const FLEXI_PP = 0.00          // 0% précompte professionnel
const FLEXI_HORAIRE_MIN = 12.08 // Flexi-salaire min 2026
const FLEXI_HORAIRE_MAX = FLEXI_HORAIRE_MIN * 1.50 // plafond exonération

// Secteurs autorisés (CCT n°165 + loi 2023)
const SECTEURS_AUTORISES = [
  { cp: '302', label: 'CP 302 — Hôtellerie', actif: true },
  { cp: '118', label: 'CP 118 — Alimentation', actif: true },
  { cp: '119', label: 'CP 119 — Commerce alimentaire de détail', actif: true },
  { cp: '120', label: 'CP 120 — Commerce de détail (général)', actif: true },
  { cp: '201', label: 'CP 201 — Employés commerce de détail', actif: true },
  { cp: '202', label: 'CP 202 — Employés commerce de gros', actif: true },
  { cp: '311', label: 'CP 311 — Boulangeries-pâtisseries', actif: true },
  { cp: '312', label: 'CP 312 — Meuneries', actif: true },
  { cp: '315', label: 'CP 315 — Soins de beauté (coiffure)', actif: true },
  { cp: 'Evenement', label: 'Secteur événementiel (2024+)', actif: true },
  { cp: 'Sport', label: 'Secteur sportif (clubs)', actif: true },
  { cp: 'Culture', label: 'Secteur culturel (2024+)', actif: true },
]

// Conditions travailleur flexi-job
const CONDITIONS_TRAVAILLEURS = [
  'Occupé à 4/5 temps minimum chez au moins un autre employeur',
  'OU pensionné (retraité)',
  'OU bénéficiaire d\'une pension de survie combinée avec un emploi',
  'Pas de contrat flexi-job chez le même employeur que le travail principal',
  'Déclaration Dimona de type FLX avant le début des prestations',
]

function calcFlexiJob(heures, tarifHoraire, nbSemaines) {
  const h = parseFloat(heures || 0)
  const tarif = Math.max(parseFloat(tarifHoraire || FLEXI_HORAIRE_MIN), FLEXI_HORAIRE_MIN)
  const sem = parseFloat(nbSemaines || 1)

  const brutTotal = h * tarif * sem
  const onssPatronal = brutTotal * FLEXI_ONSS_PAT
  const netTravailleur = brutTotal // 0% ONSS + 0% PP

  // Comparaison avec employé normal
  const brutNormal = brutTotal
  const onssWNormal = brutNormal * 0.1307
  const onssENormal = brutNormal * 0.2507
  const ppNormal = Math.max(0, (brutNormal - onssWNormal - 1095) * 0.2625)
  const netNormal = brutNormal - onssWNormal - ppNormal

  // Économie pour le travailleur
  const gainsSupplementaires = netTravailleur - netNormal

  // Coût employeur flexi vs normal
  const coutFlexiEmpl = brutTotal + onssPatronal
  const coutNormalEmpl = brutNormal + onssENormal
  const economieEmployeur = coutNormalEmpl - coutFlexiEmpl

  return {
    brutTotal, onssPatronal, netTravailleur,
    netNormal, gainsSupplementaires, coutFlexiEmpl,
    economieEmployeur, tarifEffectif: tarif,
    heuresTotal: h * sem,
  }
}

export default function FlexiJobs({ state, dispatch }) {
  const [form, setForm] = useState({
    cp: '302',
    heures: '',
    tarif: FLEXI_HORAIRE_MIN.toString(),
    semaines: '4',
    typeWorker: 'temps_plein_ailleurs',
  })
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState('calcul')
  const [checksDone, setChecksDone] = useState(Array(CONDITIONS_TRAVAILLEURS.length).fill(false))

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }
  const input = { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', width: '100%', fontSize: 14, boxSizing: 'border-box' }
  const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 500 }
  const btn = (v = 'primary') => ({ background: v === 'primary' ? '#f97316' : '#1f2937', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 })
  const tabS = (a) => ({ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: a ? '#f97316' : 'transparent', color: a ? '#fff' : '#9ca3af', border: 'none' })
  const fmt = (v) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2 }).format(v || 0)
  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  const secteurSelectionne = SECTEURS_AUTORISES.find(s => s.cp === form.cp)

  function calculate() {
    const r = calcFlexiJob(form.heures, form.tarif, form.semaines)
    setResult(r)
    setTab('result')
  }

  return (
    <div style={s}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>⚡</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Flexi-Jobs</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>0% ONSS travailleur · 0% PP · Loi 16/11/2015 · Secteurs autorisés</p>
          </div>
        </div>

        {/* Badge secteur */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0d1a0d', border: '1px solid #10b981', borderRadius: 8, padding: '6px 14px', marginTop: 8 }}>
          <span style={{ color: '#10b981', fontWeight: 700, fontSize: 12 }}>✓ Secteur autorisé sélectionné : {secteurSelectionne?.label}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {[['calcul', '🔧 Calcul'], ['secteurs', '🏢 Secteurs'], ['conditions', '✅ Conditions'], ['guide', '📖 Guide']].map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} style={tabS(tab === id)}>{l}</button>
          ))}
          {result && <button onClick={() => setTab('result')} style={tabS(tab === 'result')}>📊 Résultats</button>}
        </div>
      </div>

      {tab === 'calcul' && (
        <div style={{ maxWidth: 620 }}>
          <div style={{ background: '#0d1a0d', border: '1px solid #10b981', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>⚡ Avantages Flexi-Job</div>
            <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#6b7280' }}>
              <span>Travailleur : <b style={{ color: '#10b981' }}>0% ONSS · 0% PP → 100% net</b></span>
              <span>Employeur : <b style={{ color: '#f59e0b' }}>25% ONSS (vs 32% normal)</b></span>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: '#f97316' }}>🏢 Secteur & prestations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Commission paritaire</label>
                <select style={input} value={form.cp} onChange={e => set('cp', e.target.value)}>
                  {SECTEURS_AUTORISES.map(s => <option key={s.cp} value={s.cp}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Heures par semaine</label>
                <input type="number" step="0.5" style={input} value={form.heures} onChange={e => set('heures', e.target.value)} placeholder="Ex: 10" />
              </div>
              <div>
                <label style={lbl}>Nombre de semaines</label>
                <input type="number" style={input} value={form.semaines} onChange={e => set('semaines', e.target.value)} placeholder="Ex: 4" />
              </div>
              <div>
                <label style={lbl}>Tarif horaire (€) — Min {FLEXI_HORAIRE_MIN} €</label>
                <input type="number" step="0.01" style={input} value={form.tarif} onChange={e => set('tarif', e.target.value)} />
                {parseFloat(form.tarif) < FLEXI_HORAIRE_MIN && (
                  <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>⚠️ Inférieur au minimum légal {FLEXI_HORAIRE_MIN} €/h</div>
                )}
              </div>
              <div>
                <label style={lbl}>Type de travailleur flexi</label>
                <select style={input} value={form.typeWorker} onChange={e => set('typeWorker', e.target.value)}>
                  <option value="temps_plein_ailleurs">Occupé 4/5 temps ailleurs</option>
                  <option value="pensionné">Pensionné</option>
                  <option value="pension_survie">Pension de survie + emploi</option>
                </select>
              </div>
            </div>
          </div>

          <button onClick={calculate} disabled={!form.heures} style={{ ...btn(), width: '100%', padding: 14, fontSize: 16, opacity: !form.heures ? 0.5 : 1 }}>
            Calculer →
          </button>
        </div>
      )}

      {tab === 'result' && result && (
        <div style={{ maxWidth: 620 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Net travailleur', value: `${fmt(result.netTravailleur)} €`, color: '#10b981', sub: '100% du brut — 0 retenue' },
              { label: 'Coût employeur', value: `${fmt(result.coutFlexiEmpl)} €`, color: '#f97316', sub: 'Brut + 25% ONSS' },
              { label: 'Économie vs normal', value: `${fmt(result.economieEmployeur)} €`, color: '#3b82f6', sub: 'Pour l\'employeur' },
            ].map(item => (
              <div key={item.label} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>{item.sub}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>📋 Détail — {result.heuresTotal}h × {fmt(result.tarifEffectif)} €/h × {form.semaines} sem.</h3>
            {[
              ['Brut flexi-salaire total', `${fmt(result.brutTotal)} €`],
              ['ONSS travailleur (0%)', '0,00 €'],
              ['Précompte professionnel (0%)', '0,00 €'],
              ['NET travailleur', `${fmt(result.netTravailleur)} €`],
              ['', ''],
              ['ONSS patronal (25%)', `${fmt(result.onssPatronal)} €`],
              ['Coût total employeur', `${fmt(result.coutFlexiEmpl)} €`],
              ['', ''],
              ['Net si emploi normal', `${fmt(result.netNormal)} €`],
              ['Gain supplémentaire flexi', `+${fmt(result.gainsSupplementaires)} €`],
            ].filter(([k]) => k).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a1a', fontSize: 13 }}>
                <span style={{ color: '#9ca3af' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ ...card, background: '#0d1a0d', borderColor: '#10b981' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>💡 Dimona FLX obligatoire</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Déclarer chaque prestation flexi via Dimona type "FLX" <b style={{ color: '#f1f5f9' }}>avant le début du travail</b>. Pas de régularisation possible a posteriori. Amende : 50€ par Dimona manquante.</div>
          </div>

          <button onClick={() => { setResult(null); setTab('calcul') }} style={btn('secondary')}>Nouveau calcul</button>
        </div>
      )}

      {tab === 'secteurs' && (
        <div style={{ maxWidth: 620 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>🏢 Secteurs autorisés — Flexi-Jobs</h3>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>Étendu aux secteurs événementiel, sportif et culturel depuis 2024</div>
            {SECTEURS_AUTORISES.map(sec => (
              <div key={sec.cp} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #1a1a1a' }}>
                <span style={{ color: '#10b981', fontSize: 16 }}>✓</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{sec.label}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>CP {sec.cp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'conditions' && (
        <div style={{ maxWidth: 620 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#f97316' }}>✅ Conditions d'éligibilité travailleur</h3>
            {CONDITIONS_TRAVAILLEURS.map((cond, i) => (
              <div key={i} onClick={() => setChecksDone(p => p.map((v, j) => j === i ? !v : v))}
                style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', alignItems: 'flex-start' }}>
                <span style={{ color: checksDone[i] ? '#10b981' : '#f97316', fontSize: 16, flexShrink: 0 }}>{checksDone[i] ? '✅' : '☐'}</span>
                <span style={{ fontSize: 13, color: checksDone[i] ? '#6b7280' : '#f1f5f9' }}>{cond}</span>
              </div>
            ))}
            {checksDone.every(Boolean) && (
              <div style={{ marginTop: 14, padding: 12, background: '#0d1a0d', border: '1px solid #10b981', borderRadius: 8, fontSize: 13, color: '#10b981', fontWeight: 700, textAlign: 'center' }}>
                ✅ Toutes les conditions sont remplies — Flexi-job autorisé
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'guide' && (
        <div style={{ maxWidth: 620 }}>
          {[
            { titre: '⚡ Avantages fiscaux uniques', couleur: '#f97316', texte: 'Le flexi-salarié ne paie ni cotisations ONSS (0%) ni précompte professionnel (0%). Il reçoit 100% de son brut en net. L\'employeur paie seulement 25% d\'ONSS patronal (vs 32% normal) et une cotisation patronale spéciale de 25%. Aucun droit au chômage généré par ces revenus flexi.' },
            { titre: '📋 Dimona FLX — Obligation stricte', couleur: '#ef4444', texte: 'Chaque prestation flexi DOIT être déclarée via Dimona type FLX avant le début du travail. Pas de déclaration mensuelle globale possible. En cas d\'omission : amende de 50€ par déclaration manquante. Le travailleur doit avoir son eID sur lui lors des contrôles.' },
            { titre: '💰 Flexi-salaire minimum 2026', couleur: '#10b981', texte: `Le flexi-salaire horaire minimum est de ${FLEXI_HORAIRE_MIN} €/heure en 2026 (indexé annuellement). Maximum exonéré : ${fmt(FLEXI_HORAIRE_MAX)} €/heure. Au-delà du plafond mensuel, l'excédent est soumis aux cotisations normales. Le salaire est exonéré d'impôt jusqu'à 12.000€/an.` },
            { titre: '🔗 Pas de lien avec l\'emploi principal', couleur: '#3b82f6', texte: 'Le contrat flexi-job ne peut pas être conclu avec le même employeur que l\'emploi à 4/5 temps. Un intérimaire ne peut pas être mis à disposition comme flexi-job. Le flexi-job ne génère pas de droits au chômage mais ouvre des droits à la pension.' },
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
