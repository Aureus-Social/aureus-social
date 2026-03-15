'use client'
import { useState } from 'react'

// ─── CONSTANTES ASSURANCE LOI ────────────────────────────────────────────────
// Loi du 10 avril 1971 sur les accidents du travail
// Taux de prime moyen : 0.5% à 3% selon secteur NACE

const SECTEURS_NACE = [
  { code: '1', label: 'Agriculture, sylviculture et pêche', tauxMoyen: 2.80 },
  { code: '2', label: 'Industries extractives', tauxMoyen: 3.50 },
  { code: '3', label: 'Industrie manufacturière', tauxMoyen: 2.20 },
  { code: '4', label: 'Production énergie / eau', tauxMoyen: 1.50 },
  { code: '5', label: 'Construction', tauxMoyen: 3.80 },
  { code: '6', label: 'Commerce / Réparation', tauxMoyen: 1.20 },
  { code: '7', label: 'Transport et entreposage', tauxMoyen: 2.50 },
  { code: '8', label: 'Hébergement et restauration', tauxMoyen: 1.80 },
  { code: '9', label: 'Information et communication', tauxMoyen: 0.60 },
  { code: '10', label: 'Activités financières et assurance', tauxMoyen: 0.45 },
  { code: '11', label: 'Activités immobilières', tauxMoyen: 0.80 },
  { code: '12', label: 'Activités spécialisées, scientifiques', tauxMoyen: 0.70 },
  { code: '13', label: 'Activités de services administratifs', tauxMoyen: 1.10 },
  { code: '14', label: 'Administration publique', tauxMoyen: 1.00 },
  { code: '15', label: 'Enseignement', tauxMoyen: 0.50 },
  { code: '16', label: 'Santé humaine et action sociale', tauxMoyen: 1.40 },
  { code: '17', label: 'Arts, spectacles et activités récréatives', tauxMoyen: 1.60 },
  { code: '18', label: 'Autres activités de services', tauxMoyen: 0.90 },
]

const ASSUREURS = [
  'Ethias', 'AG Insurance', 'AXA Belgium', 'Belfius Insurance',
  'Federale Assurance', 'KBC Assurances', 'Allianz Belgium',
  'Corona Direct', 'DVV Assurances', 'Vanbreda Risk & Benefits', 'Autre'
]

const TYPES_ACCIDENT = [
  { id: 'at_travail', label: 'Accident du travail', desc: 'Survenu pendant l\'exécution du contrat de travail' },
  { id: 'at_trajet', label: 'Accident sur le trajet', desc: 'Domicile ↔ Lieu de travail' },
  { id: 'maladie_pro', label: 'Maladie professionnelle', desc: 'Déclarée via Fedris (ex-FAT)' },
]

function calcPrime(masse, taux) {
  const m = parseFloat(masse) || 0
  const t = parseFloat(taux) || 0
  return (m * t / 100).toFixed(2)
}

export default function AssuranceLoi({ state, dispatch }) {
  const [tab, setTab] = useState('declaration')
  const [form, setForm] = useState({
    annee: new Date().getFullYear(),
    assureur: '', nPolice: '', dateEcheance: '',
    secteurNACE: '', tauxPrime: '', masseSalariale: '',
    primeAnnuelle: '', primePrevue: '',
    nbTravailleursOuvriers: '', nbTravailleursEmployes: '',
    nbAccidentsAT: '', nbAccidentsTR: '', nbJoursPerdus: '',
  })
  const [accidents, setAccidents] = useState([])
  const [newAccident, setNewAccident] = useState({
    travailleur: '', date: '', type: 'at_travail', description: '',
    joursIncapacite: '', gravite: 'leger', declaration: false
  })

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }
  const input = { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', width: '100%', fontSize: 14, boxSizing: 'border-box' }
  const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 500 }
  const btn = (v = 'primary') => ({ background: v === 'primary' ? '#ef4444' : v === 'green' ? '#10b981' : '#1f2937', color: v === 'primary' || v === 'green' ? '#fff' : '#f1f5f9', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 })
  const tabStyle = (active) => ({ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: active ? '#ef4444' : 'transparent', color: active ? '#fff' : '#9ca3af', border: 'none' })

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }
  function setAcc(k, v) { setNewAccident(p => ({ ...p, [k]: v })) }

  function addAccident() {
    if (!newAccident.travailleur || !newAccident.date) return
    setAccidents(p => [...p, { ...newAccident, id: Date.now() }])
    setNewAccident({ travailleur: '', date: '', type: 'at_travail', description: '', joursIncapacite: '', gravite: 'leger', declaration: false })
  }

  const primeCal = calcPrime(form.masseSalariale, form.tauxPrime)
  const secteur = SECTEURS_NACE.find(s => s.code === form.secteurNACE)

  // Stats accidents
  const totalAT = accidents.filter(a => a.type === 'at_travail').length
  const totalTR = accidents.filter(a => a.type === 'at_trajet').length
  const totalJours = accidents.reduce((s, a) => s + (parseInt(a.joursIncapacite) || 0), 0)
  const tauxFrequence = form.nbTravailleursOuvriers && totalAT > 0
    ? ((totalAT / (parseInt(form.nbTravailleursOuvriers) * 250)) * 1000000).toFixed(2) : '—'

  return (
    <div style={s}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🛡️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Assurance-Loi — Accidents du Travail</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Loi 10/04/1971 · Déclaration · Relevé annuel · Sinistres · Fedris</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {[['declaration','📋 Police & Prime'],['accidents','⚠️ Sinistres'],['releve','📊 Relevé annuel'],['guide','📖 Obligations']].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={tabStyle(tab === id)}>{label}</button>
          ))}
        </div>
      </div>

      {/* POLICE & PRIME */}
      {tab === 'declaration' && (
        <div style={{ maxWidth: 680 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#ef4444' }}>🛡️ Police d'assurance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Assureur *</label>
                <select style={input} value={form.assureur} onChange={e => set('assureur', e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {ASSUREURS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>N° de police</label>
                <input style={input} value={form.nPolice} onChange={e => set('nPolice', e.target.value)} placeholder="Ex: AT-2024-001234" />
              </div>
              <div>
                <label style={lbl}>Date d'échéance</label>
                <input type="date" style={input} value={form.dateEcheance} onChange={e => set('dateEcheance', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Année de référence</label>
                <input type="number" style={input} value={form.annee} onChange={e => set('annee', e.target.value)} />
              </div>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#f59e0b' }}>💰 Calcul de prime</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Secteur NACE</label>
                <select style={input} value={form.secteurNACE} onChange={e => {
                  const sec = SECTEURS_NACE.find(s => s.code === e.target.value)
                  set('secteurNACE', e.target.value)
                  if (sec) set('tauxPrime', sec.tauxMoyen.toString())
                }}>
                  <option value="">— Sélectionner votre secteur —</option>
                  {SECTEURS_NACE.map(s => <option key={s.code} value={s.code}>{s.label} (~{s.tauxMoyen}%)</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Masse salariale annuelle brute (€)</label>
                <input type="number" step="0.01" style={input} value={form.masseSalariale} onChange={e => set('masseSalariale', e.target.value)} placeholder="Ex: 250000" />
              </div>
              <div>
                <label style={lbl}>Taux de prime (%)</label>
                <input type="number" step="0.01" style={input} value={form.tauxPrime} onChange={e => set('tauxPrime', e.target.value)} placeholder="Ex: 1.20" />
                {secteur && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Taux moyen secteur : ~{secteur.tauxMoyen}%</div>}
              </div>
              <div>
                <label style={lbl}>Prime calculée</label>
                <div style={{ ...input, background: '#0a1a0a', color: '#10b981', fontWeight: 700, fontSize: 18, cursor: 'default' }}>{primeCal} €</div>
              </div>
              <div>
                <label style={lbl}>Prime facturée par l'assureur (€)</label>
                <input type="number" step="0.01" style={input} value={form.primeAnnuelle} onChange={e => set('primeAnnuelle', e.target.value)} />
              </div>
            </div>
            {form.primeAnnuelle && primeCal && (
              <div style={{ marginTop: 14, padding: 12, background: '#0d1117', borderRadius: 8, fontSize: 13 }}>
                {parseFloat(form.primeAnnuelle) > parseFloat(primeCal) * 1.1
                  ? <span style={{ color: '#ef4444' }}>⚠️ Prime facturée supérieure de {((parseFloat(form.primeAnnuelle) / parseFloat(primeCal) - 1) * 100).toFixed(1)}% au calcul théorique — vérifier avec l'assureur</span>
                  : <span style={{ color: '#10b981' }}>✅ Prime cohérente avec le taux secteur</span>
                }
              </div>
            )}
          </div>

          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#3b82f6' }}>👥 Effectifs déclarés</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Nombre d'ouvriers ETP</label>
                <input type="number" style={input} value={form.nbTravailleursOuvriers} onChange={e => set('nbTravailleursOuvriers', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Nombre d'employés ETP</label>
                <input type="number" style={input} value={form.nbTravailleursEmployes} onChange={e => set('nbTravailleursEmployes', e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINISTRES */}
      {tab === 'accidents' && (
        <div style={{ maxWidth: 720 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Accidents travail', value: totalAT, color: '#ef4444' },
              { label: 'Accidents trajet', value: totalTR, color: '#f59e0b' },
              { label: 'Jours perdus', value: totalJours, color: '#3b82f6' },
              { label: 'Taux fréquence', value: tauxFrequence, color: '#8b5cf6' },
            ].map(item => (
              <div key={item.label} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Formulaire nouveau sinistre */}
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#ef4444' }}>➕ Déclarer un sinistre</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Travailleur victime *</label>
                <input style={input} value={newAccident.travailleur} onChange={e => setAcc('travailleur', e.target.value)} placeholder="Nom Prénom" />
              </div>
              <div>
                <label style={lbl}>Date de l'accident *</label>
                <input type="date" style={input} value={newAccident.date} onChange={e => setAcc('date', e.target.value)} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Type d'accident</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {TYPES_ACCIDENT.map(t => (
                    <button key={t.id} onClick={() => setAcc('type', t.id)} style={{
                      flex: 1, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'center',
                      background: newAccident.type === t.id ? '#ef444420' : '#0d0d0d',
                      border: `1px solid ${newAccident.type === t.id ? '#ef4444' : '#2a2a2a'}`,
                      color: newAccident.type === t.id ? '#ef4444' : '#9ca3af'
                    }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl}>Jours d'incapacité</label>
                <input type="number" style={input} value={newAccident.joursIncapacite} onChange={e => setAcc('joursIncapacite', e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Gravité</label>
                <select style={input} value={newAccident.gravite} onChange={e => setAcc('gravite', e.target.value)}>
                  <option value="leger">Léger (< 4 jours)</option>
                  <option value="grave">Grave (≥ 4 jours)</option>
                  <option value="invalidite">Invalidité permanente</option>
                  <option value="mortel">Mortel</option>
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Description / circonstances</label>
                <input style={input} value={newAccident.description} onChange={e => setAcc('description', e.target.value)} placeholder="Brève description des circonstances..." />
              </div>
            </div>
            <button onClick={addAccident} style={btn('primary')}>+ Ajouter le sinistre</button>
          </div>

          {/* Liste sinistres */}
          {accidents.length > 0 && (
            <div style={card}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>📋 Sinistres déclarés ({accidents.length})</h3>
              {accidents.map(acc => {
                const type = TYPES_ACCIDENT.find(t => t.id === acc.type)
                const graviteColor = acc.gravite === 'mortel' ? '#ef4444' : acc.gravite === 'invalidite' ? '#f59e0b' : acc.gravite === 'grave' ? '#f97316' : '#10b981'
                return (
                  <div key={acc.id} style={{ borderBottom: '1px solid #1a1a1a', padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{acc.travailleur}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{acc.date} · {type?.label} · {acc.joursIncapacite || 0} jours</div>
                      {acc.description && <div style={{ fontSize: 12, color: '#4b5563', marginTop: 4 }}>{acc.description}</div>}
                    </div>
                    <span style={{ background: graviteColor + '20', color: graviteColor, border: `1px solid ${graviteColor}40`, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {acc.gravite}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* RELEVÉ ANNUEL */}
      {tab === 'releve' && (
        <div style={{ maxWidth: 680 }}>
          <div style={card}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>📊 Relevé Assurance-Loi {form.annee}</h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>Document récapitulatif à transmettre à l'assureur en fin d'année</p>
            <div style={{ display: 'grid', gap: 1, background: '#1a1a1a', borderRadius: 8, overflow: 'hidden' }}>
              {[
                ['Assureur', form.assureur || '—'],
                ['N° de police', form.nPolice || '—'],
                ['Masse salariale brute', form.masseSalariale ? `${parseFloat(form.masseSalariale).toLocaleString('fr-BE')} €` : '—'],
                ['Taux de prime appliqué', form.tauxPrime ? `${form.tauxPrime}%` : '—'],
                ['Prime calculée', primeCal ? `${primeCal} €` : '—'],
                ['Prime facturée', form.primeAnnuelle ? `${form.primeAnnuelle} €` : '—'],
                ['Ouvriers ETP', form.nbTravailleursOuvriers || '—'],
                ['Employés ETP', form.nbTravailleursEmployes || '—'],
                ['Accidents du travail', accidents.filter(a => a.type === 'at_travail').length],
                ['Accidents de trajet', accidents.filter(a => a.type === 'at_trajet').length],
                ['Total jours d\'incapacité', totalJours],
                ['Taux de fréquence (×10⁶h)', tauxFrequence],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: '#111', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GUIDE OBLIGATIONS */}
      {tab === 'guide' && (
        <div style={{ maxWidth: 680 }}>
          {[
            { titre: '⚖️ Obligation légale', couleur: '#ef4444', texte: 'Tout employeur occupant du personnel est légalement tenu de souscrire une assurance contre les accidents du travail (Loi du 10 avril 1971). L\'absence de contrat expose l\'employeur à couvrir personnellement tous les frais et rentes.' },
            { titre: '📋 Déclaration d\'accident', couleur: '#f59e0b', texte: 'Tout accident entraînant une incapacité de travail doit être déclaré à l\'assureur dans les 8 jours. La déclaration se fait via le formulaire officiel Fedris. Pour les accidents graves ou mortels, déclaration immédiate obligatoire + signalement à l\'Inspection du travail.' },
            { titre: '📊 Taux de prime', couleur: '#3b82f6', texte: 'Le taux de prime dépend du secteur NACE, du sinistralité historique et du nombre de travailleurs. La prime = masse salariale brute × taux. L\'assureur peut ajuster le taux annuellement selon l\'expérience sinistralité (bonus/malus).' },
            { titre: '🏥 Couverture obligatoire', couleur: '#10b981', texte: 'L\'assurance couvre : frais médicaux (illimités), indemnité incapacité temporaire (90% salaire), rente incapacité permanente, rente de décès (conjoint + enfants). Elle couvre le trajet domicile-travail et les déplacements professionnels.' },
            { titre: '📁 Relevé annuel à Fedris', couleur: '#8b5cf6', texte: 'Chaque année, l\'assureur transmet à Fedris (Fonds des accidents du travail) les statistiques de sinistralité. L\'employeur reçoit un relevé de prime définitif basé sur la masse salariale réelle. Conserver 10 ans tous les documents d\'accidents.' },
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
