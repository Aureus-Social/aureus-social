'use client'
import { useState, useMemo } from 'react'

// ─── CONSTANTES LÉGALES — Loi du 26 décembre 2013 (statut unique) ────────────
const RMMMG = 2070.48 // RMMMG 2026

// Calcul préavis statut unique (Art. 37/2 Loi 3/7/1978 modifiée 26/12/2013)
// Barème officiel en semaines selon ancienneté
function calcPreavisEmploye(anciennete) {
  // Ancienneté en années complètes
  const a = Math.floor(anciennete)
  if (a < 3/12) return 1        // < 3 mois : 1 semaine
  if (a < 6/12) return 3        // 3-6 mois : 3 semaines
  if (a < 9/12) return 4        // 6-9 mois : 4 semaines
  if (a < 1) return 5           // 9-12 mois : 5 semaines
  // À partir de 1 an : 3 semaines par année commencée (1→12 ans)
  // puis 1 semaine par année à partir de 13 ans
  let sem = 0
  if (a <= 12) sem = a * 3
  else sem = 12 * 3 + (a - 12) * 1
  // Maximum légal : aucun plafond depuis 2014
  return Math.round(sem)
}

// Ouvriers : préavis selon ancienneté (même barème depuis 2014)
function calcPreavisOuvrier(anciennete) {
  return calcPreavisEmploye(anciennete) // Statut unique depuis 2014
}

// Indemnité de rupture = rémunération pendant la période de préavis
function calcIndemniteRupture(salaireRef, semPreavis) {
  const semSalaire = salaireRef / (365.25 / 7)
  return Math.round(semSalaire * semPreavis * 100) / 100
}

// Coût employeur sur l'indemnité
function calcCoutEmployeur(indemnite) {
  return Math.round(indemnite * 1.30 * 100) / 100 // +30% charges
}

// Indemnité de protection — licenciement manifestement déraisonnable
const PROTECTION_MIN = 3 // semaines
const PROTECTION_MAX = 17 // semaines

// Chômage économique après licenciement
function calcAllocationChomage(net, situation) {
  // 65% du salaire net plafonné (art. 113 AR 25/11/1991)
  const plafond = { isole: 1751.00, chef_famille: 2023.00, cohabitant: 1564.00 }
  const base = net * 0.65
  return Math.min(base, plafond[situation] || plafond.isole)
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────
export default function SimulateurLicenciement({ state, dispatch }) {
  const [form, setForm] = useState({
    typeContrat: 'employe',
    anciennete: '',
    salaireRef: '',
    regimeTravail: '100',
    situation: 'isole',
    motif: 'licenciement_std',
    dateEntree: '',
    dateSortie: '',
    preavisPreste: false,
    joursVacances: '',
    netMensuel: '',
  })
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState('calcul')

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }
  const input = { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', width: '100%', fontSize: 14, boxSizing: 'border-box' }
  const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 500 }
  const btn = (v = 'primary') => ({ background: v === 'primary' ? '#ef4444' : v === 'green' ? '#10b981' : '#1f2937', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 })
  const tabStyle = (active) => ({ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: active ? '#ef4444' : 'transparent', color: active ? '#fff' : '#9ca3af', border: 'none' })
  const fmt = (v) => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0)

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  // Calcul automatique ancienneté depuis dates
  const anciennetéAuto = useMemo(() => {
    if (!form.dateEntree || !form.dateSortie) return null
    const debut = new Date(form.dateEntree)
    const fin = new Date(form.dateSortie)
    const diff = (fin - debut) / (1000 * 60 * 60 * 24 * 365.25)
    return diff > 0 ? diff.toFixed(2) : null
  }, [form.dateEntree, form.dateSortie])

  function calculate() {
    const anciennete = parseFloat(anciennetéAuto || form.anciennete || 0)
    const salaire = parseFloat(form.salaireRef || 0)
    const regime = parseFloat(form.regimeTravail || 100) / 100
    const salaireRef = salaire // Salaire de référence = brut mensuel + avantages
    const net = parseFloat(form.netMensuel || salaire * 0.72)

    // Préavis
    const semPreavis = form.typeContrat === 'ouvrier'
      ? calcPreavisOuvrier(anciennete)
      : calcPreavisEmploye(anciennete)

    // Si préavis presté → pas d'indemnité
    const indemnite = form.preavisPreste ? 0 : calcIndemniteRupture(salaireRef, semPreavis)
    const coutEmpl = calcCoutEmployeur(indemnite)

    // Pécule de vacances de sortie (simple + double)
    const joursVac = parseFloat(form.joursVacances || 0)
    const peculeSimple = joursVac > 0 ? (salaireRef / 26 * joursVac) : 0
    const peculeDouble = salaireRef * 0.92 / 12 * (anciennete % 1) // prorata double pécule

    // Allocation chômage estimée
    const allocChomage = calcAllocationChomage(net, form.situation)

    // Délais légaux
    const joursPreavis = semPreavis * 5
    let dateFinPreavis = null
    if (form.dateSortie) {
      const d = new Date(form.dateSortie)
      d.setDate(d.getDate() + joursPreavis)
      dateFinPreavis = d.toLocaleDateString('fr-BE')
    }

    // Indemnité de protection (licenciement manifestement déraisonnable)
    const protectionMin = calcIndemniteRupture(salaireRef, PROTECTION_MIN)
    const protectionMax = calcIndemniteRupture(salaireRef, PROTECTION_MAX)

    setResult({
      anciennete, semPreavis, joursPreavis, indemnite, coutEmpl,
      peculeSimple, peculeDouble, allocChomage, dateFinPreavis,
      protectionMin, protectionMax, salaireRef, net,
      totalSortie: indemnite + peculeSimple + peculeDouble
    })
    setTab('result')
  }

  return (
    <div style={s}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>⚖️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Simulateur Licenciement</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Préavis · Indemnités · Pécules · Coût employeur — Statut unique 2014</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['calcul', '🔧 Calcul'], ['bareme', '📋 Barème préavis'], ['guide', '📖 Guide légal']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={tabStyle(tab === id)}>{label}</button>
          ))}
          {result && <button onClick={() => setTab('result')} style={tabStyle(tab === 'result')}>📊 Résultats</button>}
        </div>
      </div>

      {/* CALCUL */}
      {tab === 'calcul' && (
        <div style={{ maxWidth: 680 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#ef4444' }}>👤 Travailleur</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Type de contrat</label>
                <select style={input} value={form.typeContrat} onChange={e => set('typeContrat', e.target.value)}>
                  <option value="employe">Employé(e)</option>
                  <option value="ouvrier">Ouvrier/ière</option>
                  <option value="dirigeant">Dirigeant d'entreprise</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Situation familiale</label>
                <select style={input} value={form.situation} onChange={e => set('situation', e.target.value)}>
                  <option value="isole">Isolé(e)</option>
                  <option value="chef_famille">Chef de famille</option>
                  <option value="cohabitant">Cohabitant(e)</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Date d'entrée en service</label>
                <input type="date" style={input} value={form.dateEntree} onChange={e => set('dateEntree', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Date de sortie (ou notification)</label>
                <input type="date" style={input} value={form.dateSortie} onChange={e => set('dateSortie', e.target.value)} />
              </div>
              {anciennetéAuto ? (
                <div style={{ gridColumn: '1/-1' }}>
                  <div style={{ background: '#0d1a0d', border: '1px solid #10b981', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>✅ Ancienneté calculée : {parseFloat(anciennetéAuto).toFixed(2)} ans</span>
                    <span style={{ color: '#6b7280', marginLeft: 12 }}>({Math.floor(anciennetéAuto)} ans {Math.round((anciennetéAuto % 1) * 12)} mois)</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label style={lbl}>Ancienneté manuelle (années)</label>
                  <input type="number" step="0.1" style={input} value={form.anciennete} onChange={e => set('anciennete', e.target.value)} placeholder="Ex: 5.5" />
                </div>
              )}
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#f59e0b' }}>💰 Rémunération de référence</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Salaire brut mensuel de référence (€)</label>
                <input type="number" step="0.01" style={input} value={form.salaireRef} onChange={e => set('salaireRef', e.target.value)} placeholder="Ex: 3500" />
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Inclure avantages en nature, primes fixes</div>
              </div>
              <div>
                <label style={lbl}>Salaire net mensuel (€)</label>
                <input type="number" step="0.01" style={input} value={form.netMensuel} onChange={e => set('netMensuel', e.target.value)} placeholder="Ex: 2450" />
              </div>
              <div>
                <label style={lbl}>Régime de travail (%)</label>
                <select style={input} value={form.regimeTravail} onChange={e => set('regimeTravail', e.target.value)}>
                  <option value="100">Temps plein (100%)</option>
                  <option value="80">4/5 (80%)</option>
                  <option value="75">3/4 (75%)</option>
                  <option value="50">Mi-temps (50%)</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Jours de vacances acquis restants</label>
                <input type="number" style={input} value={form.joursVacances} onChange={e => set('joursVacances', e.target.value)} placeholder="Ex: 8" />
              </div>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#8b5cf6' }}>⚙️ Modalités</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Motif du licenciement</label>
                <select style={input} value={form.motif} onChange={e => set('motif', e.target.value)}>
                  <option value="licenciement_std">Licenciement standard</option>
                  <option value="faute_grave">Faute grave (motif grave)</option>
                  <option value="force_majeure">Force majeure médicale</option>
                  <option value="restructuration">Restructuration / Fermeture</option>
                  <option value="fin_cdd">Fin de CDD sans renouvellement</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}>
                <input type="checkbox" id="preavisPreste" checked={form.preavisPreste} onChange={e => set('preavisPreste', e.target.checked)} style={{ width: 16, height: 16 }} />
                <label htmlFor="preavisPreste" style={{ fontSize: 13, cursor: 'pointer' }}>Préavis presté (pas d'indemnité)</label>
              </div>
            </div>
            {form.motif === 'faute_grave' && (
              <div style={{ marginTop: 12, padding: 12, background: '#1a0a0a', border: '1px solid #ef444440', borderRadius: 8, fontSize: 12, color: '#fca5a5' }}>
                ⚠️ Faute grave : aucune indemnité de rupture, aucun préavis. Le motif doit être notifié dans les 3 jours ouvrables (art. 35 Loi 3/7/1978). Preuve à charge de l'employeur.
              </div>
            )}
          </div>

          <button onClick={calculate} style={{ ...btn('primary'), width: '100%', padding: 14, fontSize: 16 }}>
            Calculer les indemnités →
          </button>
        </div>
      )}

      {/* RÉSULTATS */}
      {tab === 'result' && result && (
        <div style={{ maxWidth: 680 }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Préavis légal', value: `${result.semPreavis} sem.`, sub: `${result.joursPreavis} jours ouvrés`, color: '#f59e0b' },
              { label: 'Indemnité de rupture', value: `${fmt(result.indemnite)} €`, sub: 'brut', color: '#ef4444' },
              { label: 'Coût total employeur', value: `${fmt(result.coutEmpl)} €`, sub: '+30% charges', color: '#8b5cf6' },
            ].map(item => (
              <div key={item.label} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{item.sub}</div>
                <div style={{ fontSize: 11, color: '#4b5563', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Détail */}
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>📋 Détail du calcul</h3>
            {[
              ['Ancienneté', `${result.anciennete.toFixed(2)} ans`],
              ['Salaire de référence', `${fmt(result.salaireRef)} €/mois`],
              ['Salaire hebdomadaire', `${fmt(result.salaireRef / (365.25 / 7))} €/sem`],
              ['Préavis légal', `${result.semPreavis} semaines`],
              ['Indemnité de rupture brute', `${fmt(result.indemnite)} €`],
              ['Pécule vacances simple', `${fmt(result.peculeSimple)} €`],
              ['Pécule double prorata', `${fmt(result.peculeDouble)} €`],
              ['TOTAL SORTIE travailleur', `${fmt(result.totalSortie)} €`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #1a1a1a', fontSize: 13 }}>
                <span style={{ color: '#9ca3af' }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            {result.dateFinPreavis && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', fontSize: 13 }}>
                <span style={{ color: '#9ca3af' }}>Fin du préavis estimée</span>
                <span style={{ fontWeight: 600, color: '#f59e0b' }}>{result.dateFinPreavis}</span>
              </div>
            )}
          </div>

          {/* Protection licenciement déraisonnable */}
          <div style={{ ...card, borderColor: '#8b5cf640' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#8b5cf6' }}>⚖️ Protection — Licenciement manifestement déraisonnable</h3>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
              Si le motif est contestable, le travailleur peut réclamer une indemnité complémentaire entre{' '}
              <b style={{ color: '#f1f5f9' }}>{fmt(result.protectionMin)} €</b> et{' '}
              <b style={{ color: '#f1f5f9' }}>{fmt(result.protectionMax)} €</b>
              {' '}(3 à 17 semaines · art. 8 CCT n°109).
            </div>
          </div>

          {/* Allocations chômage */}
          <div style={{ ...card, borderColor: '#10b98140' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#10b981' }}>💚 Allocation chômage estimée</h3>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{fmt(result.allocChomage)} €/mois</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>65% du net · plafonné selon situation familiale · estimation ONEM</div>
          </div>

          <button onClick={() => { setResult(null); setTab('calcul') }} style={{ ...btn('ghost'), border: '1px solid #374151', marginRight: 12 }}>Nouveau calcul</button>
        </div>
      )}

      {/* BARÈME PRÉAVIS */}
      {tab === 'bareme' && (
        <div style={{ maxWidth: 600 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>📋 Barème officiel — Statut unique (Loi 26/12/2013)</h3>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 16 }}>Valable employés ET ouvriers depuis le 01/01/2014</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#1a1a1a' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: '#9ca3af' }}>Ancienneté</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#9ca3af' }}>Semaines préavis</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#9ca3af' }}>≈ Mois</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['< 3 mois', 1, 0.25],
                  ['3 – 6 mois', 3, 0.75],
                  ['6 – 9 mois', 4, 1],
                  ['9 – 12 mois', 5, 1.25],
                  ['1 an', 3 * 1, null],
                  ['2 ans', 3 * 2, null],
                  ['3 ans', 3 * 3, null],
                  ['4 ans', 3 * 4, null],
                  ['5 ans', 3 * 5, null],
                  ['6 ans', 3 * 6, null],
                  ['7 ans', 3 * 7, null],
                  ['8 ans', 3 * 8, null],
                  ['9 ans', 3 * 9, null],
                  ['10 ans', 3 * 10, null],
                  ['11 ans', 3 * 11, null],
                  ['12 ans', 3 * 12, null],
                  ['13 ans', 36 + 1, null],
                  ['15 ans', 36 + 3, null],
                  ['20 ans', 36 + 8, null],
                  ['25 ans', 36 + 13, null],
                  ['30 ans', 36 + 18, null],
                ].map(([anc, sem]) => (
                  <tr key={anc} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '8px 12px' }}>{anc}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#f59e0b' }}>{sem} sem.</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: '#6b7280' }}>{(sem / 4.33).toFixed(1)} mois</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GUIDE LÉGAL */}
      {tab === 'guide' && (
        <div style={{ maxWidth: 680 }}>
          {[
            { titre: '⚖️ Statut unique — Loi 26/12/2013', couleur: '#ef4444', texte: 'Depuis le 1er janvier 2014, employés et ouvriers bénéficient du même régime de préavis. Les préavis se calculent en semaines selon l\'ancienneté. La notification doit être faite par recommandé ou huissier, avec mention du début et de la durée du préavis.' },
            { titre: '📋 Motif grave — Art. 35 Loi 3/7/1978', couleur: '#f59e0b', texte: 'En cas de motif grave, le licenciement est immédiat sans préavis ni indemnité. Le motif doit être notifié dans les 3 jours ouvrables suivant la connaissance des faits. La preuve du motif grave est à charge de l\'employeur. En cas d\'échec, l\'indemnité normale est due.' },
            { titre: '🛡️ CCT n°109 — Licenciement manifestement déraisonnable', couleur: '#8b5cf6', texte: 'Le travailleur peut contester le motif du licenciement devant le tribunal du travail. En l\'absence de motif valable, l\'indemnité varie de 3 à 17 semaines de salaire (en plus du préavis normal). Le délai de prescription est de 1 an à partir de la fin du contrat.' },
            { titre: '🏖 Pécule de vacances de sortie', couleur: '#3b82f6', texte: 'À la fin du contrat, l\'employeur doit verser le pécule de vacances simple (jours acquis non pris) ET le double pécule prorata temporis. Pour les ouvriers, la caisse de vacances ONVA gère ce paiement. Pour les employés, c\'est l\'employeur directement.' },
            { titre: '📅 Délais de notification', couleur: '#10b981', texte: 'Le préavis court à partir du lundi suivant la notification par recommandé. Si l\'employeur notifie un lundi, le préavis court dès ce lundi. Pendant le préavis, le travailleur a droit à 1 jour/semaine (ou 2 demi-jours) pour chercher un emploi (art. 341 Loi 5/12/1968).' },
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
