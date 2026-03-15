'use client'
import { useState, useRef } from 'react'

// ─────────────────────────────────────────────
// CATALOGUE DRS
// ─────────────────────────────────────────────
const DRS_CATALOGUE = [
  {
    secteur: 'Chômage',
    couleur: '#f59e0b',
    icon: '📋',
    docs: [
      { id: 'C4', label: 'C4 — Certificat de chômage', fields: ['c4_motif','c4_dateDebut','c4_dateFin','c4_salaireMoyen','c4_typeContrat','c4_regimeTravail'] },
      { id: 'C4_PREPENSION', label: 'C4 — Prépension (RCC)', fields: ['c4_motif','c4_dateDebut','c4_dateFin','c4_salaireMoyen','c4_typeContrat','c4_regimeTravail','rcc_dateNaissance','rcc_anciennete'] },
      { id: 'C32_CONSTAT', label: 'C3.2 — Constat du droit', fields: ['c32_periodeDebut','c32_periodeFin','c32_joursPrestés','c32_montant'] },
      { id: 'C32_OUVRIER', label: 'C3.2 — Employeur → Ouvriers', fields: ['c32_periodeDebut','c32_periodeFin','c32_joursPrestés','c32_montant'] },
      { id: 'C78_ACTIVA', label: 'C78 — Activa/Winwin/Impulsion/Actiris', fields: ['c78_dateEngagement','c78_typeAide','c78_montantRéduction'] },
      { id: 'C78_ACTIVA_START', label: 'C78 — Activa Start', fields: ['c78_dateEngagement','c78_typeAide','c78_montantRéduction'] },
      { id: 'C78_SINE', label: 'C78 — SINE', fields: ['c78_dateEngagement','c78_typeAide','c78_montantRéduction'] },
      { id: 'C78_PTP', label: 'C78.3 — PTP', fields: ['c78_dateEngagement','c78_typeAide','c78_montantRéduction'] },
      { id: 'C103_JEUNES_EMP', label: 'C103 — Jeunes Employeur', fields: ['c103_dateNaissance','c103_dateEngagement','c103_dureeContrat'] },
      { id: 'C103_JEUNES_TRV', label: 'C103 — Jeunes Travailleur', fields: ['c103_dateNaissance','c103_dateEngagement','c103_dureeContrat'] },
      { id: 'C103_SENIORS_EMP', label: 'C103 — Seniors Employeur', fields: ['c103_dateNaissance','c103_dateEngagement','c103_dureeContrat'] },
      { id: 'C103_SENIORS_TRV', label: 'C103 — Seniors Travailleur', fields: ['c103_dateNaissance','c103_dateEngagement','c103_dureeContrat'] },
      { id: 'C131A', label: 'C131A — Employeur', fields: ['c131_periode','c131_montant','c131_motif'] },
      { id: 'C131B', label: 'C131B', fields: ['c131_periode','c131_montant','c131_motif'] },
    ]
  },
  {
    secteur: 'INAMI',
    couleur: '#3b82f6',
    icon: '🏥',
    docs: [
      { id: 'INAMI_MALADIE', label: 'Incapacité — Maladie / Accident droit commun', fields: ['inami_dateDebut','inami_dateFin','inami_typeIncapacite','inami_medecin','inami_tauxIncapacite'] },
      { id: 'INAMI_MATERNITE', label: 'Incapacité — Repos de maternité', fields: ['inami_dateDebut','inami_dateFin','inami_typeIncapacite','inami_datePrevuAccouchement'] },
      { id: 'INAMI_MATERNITE_COMPLET', label: 'Incapacité — Écartement complet maternité', fields: ['inami_dateDebut','inami_dateFin','inami_typeIncapacite','inami_datePrevuAccouchement'] },
      { id: 'INAMI_MATERNITE_PARTIEL', label: 'Incapacité — Écartement partiel maternité', fields: ['inami_dateDebut','inami_dateFin','inami_typeIncapacite','inami_datePrevuAccouchement'] },
      { id: 'INAMI_CONGE_NAISSANCE', label: 'Incapacité — Congé de naissance (10 jrs)', fields: ['inami_dateDebut','inami_dateFin','inami_typeIncapacite'] },
      { id: 'INAMI_ADOPTION', label: 'Incapacité — Congé d\'adoption', fields: ['inami_dateDebut','inami_dateFin','inami_typeIncapacite'] },
      { id: 'INAMI_TRAVAIL_ADAPTE', label: 'Travail adapté — Reprise partielle', fields: ['inami_dateDebut','inami_dateFin','inami_tauxTravail'] },
      { id: 'INAMI_TRAVAIL_PROTECTION', label: 'Travail adapté — Protection maternité', fields: ['inami_dateDebut','inami_dateFin','inami_datePrevuAccouchement'] },
      { id: 'INAMI_ALLAITEMENT', label: 'Allaitement — Déclaration des pauses', fields: ['inami_dateDebut','inami_dateFin','inami_nombrePauses'] },
      { id: 'INAMI_VACANCES_CAISSE', label: 'Déclaration annuelle vacances (caisse)', fields: ['inami_annee','inami_jourVacances','inami_montantPecule'] },
      { id: 'INAMI_VACANCES_EMP', label: 'Déclaration annuelle vacances (employeur)', fields: ['inami_annee','inami_jourVacances','inami_montantPecule'] },
      { id: 'INAMI_REPRISE', label: 'Déclaration de reprise du travail', fields: ['inami_dateReprise','inami_tauxTravail','inami_typeReprise'] },
    ]
  },
  {
    secteur: 'Attestations',
    couleur: '#10b981',
    icon: '📄',
    docs: [
      { id: 'ATT_PECULE', label: 'Attestation — Pécules de vacances', fields: ['att_annee','att_montantPecule','att_joursPrestés'] },
      { id: 'ATT_TRAVAIL', label: 'Attestation de travail', fields: ['att_dateDebut','att_dateFin','att_typeContrat','att_motifFin'] },
      { id: 'ATT_276', label: 'Attestation 276 — Frontaliers', fields: ['att_annee','att_revenusImposables','att_paysResidence'] },
    ]
  }
]

// ─────────────────────────────────────────────
// LABELS CHAMPS
// ─────────────────────────────────────────────
const FIELD_LABELS = {
  c4_motif: 'Motif de fin de contrat',
  c4_dateDebut: 'Date début chômage',
  c4_dateFin: 'Date fin occupation',
  c4_salaireMoyen: 'Salaire journalier moyen (€)',
  c4_typeContrat: 'Type de contrat',
  c4_regimeTravail: 'Régime de travail',
  rcc_dateNaissance: 'Date de naissance',
  rcc_anciennete: 'Ancienneté (années)',
  c32_periodeDebut: 'Période — début',
  c32_periodeFin: 'Période — fin',
  c32_joursPrestés: 'Jours prestés',
  c32_montant: 'Montant (€)',
  c78_dateEngagement: 'Date d\'engagement',
  c78_typeAide: 'Type d\'aide',
  c78_montantRéduction: 'Montant réduction ONSS (€)',
  c103_dateNaissance: 'Date de naissance',
  c103_dateEngagement: 'Date d\'engagement',
  c103_dureeContrat: 'Durée contrat (mois)',
  c131_periode: 'Période',
  c131_montant: 'Montant (€)',
  c131_motif: 'Motif',
  inami_dateDebut: 'Date début incapacité',
  inami_dateFin: 'Date fin incapacité',
  inami_typeIncapacite: 'Type d\'incapacité',
  inami_medecin: 'Médecin traitant',
  inami_tauxIncapacite: 'Taux d\'incapacité (%)',
  inami_datePrevuAccouchement: 'Date prévue accouchement',
  inami_tauxTravail: 'Taux de travail (%)',
  inami_nombrePauses: 'Nombre de pauses/jour',
  inami_annee: 'Année',
  inami_jourVacances: 'Jours de vacances',
  inami_montantPecule: 'Montant pécule (€)',
  inami_dateReprise: 'Date de reprise',
  inami_typeReprise: 'Type de reprise',
  att_annee: 'Année de référence',
  att_montantPecule: 'Montant pécule (€)',
  att_joursPrestés: 'Jours prestés',
  att_dateDebut: 'Date de début',
  att_dateFin: 'Date de fin',
  att_typeContrat: 'Type de contrat',
  att_motifFin: 'Motif de fin',
  att_revenusImposables: 'Revenus imposables (€)',
  att_paysResidence: 'Pays de résidence',
}

const FIELD_TYPES = {
  c4_dateDebut: 'date', c4_dateFin: 'date', rcc_dateNaissance: 'date',
  c32_periodeDebut: 'date', c32_periodeFin: 'date',
  c78_dateEngagement: 'date', c103_dateNaissance: 'date', c103_dateEngagement: 'date',
  inami_dateDebut: 'date', inami_dateFin: 'date', inami_datePrevuAccouchement: 'date',
  inami_dateReprise: 'date', att_dateDebut: 'date', att_dateFin: 'date',
  c4_salaireMoyen: 'number', c32_montant: 'number', c78_montantRéduction: 'number',
  c131_montant: 'number', inami_tauxIncapacite: 'number', inami_tauxTravail: 'number',
  inami_nombrePauses: 'number', inami_annee: 'number', inami_jourVacances: 'number',
  inami_montantPecule: 'number', att_annee: 'number', att_montantPecule: 'number',
  att_joursPrestés: 'number', rcc_anciennete: 'number', c103_dureeContrat: 'number',
  att_revenusImposables: 'number', c32_joursPrestés: 'number',
}

const FIELD_OPTIONS = {
  c4_motif: ['Fin de contrat à durée déterminée','Licenciement','Démission','Fermeture d\'entreprise','Force majeure','Rupture mutuelle','Fin de mission intérim'],
  c4_typeContrat: ['CDI','CDD','Intérim','Remplacement','Étudiant'],
  c4_regimeTravail: ['Temps plein','Temps partiel','Crédit-temps'],
  inami_typeIncapacite: ['Maladie','Accident droit commun','Accident du travail','Maladie professionnelle'],
  inami_typeReprise: ['Reprise complète','Reprise partielle progressive','Travail adapté'],
  att_typeContrat: ['CDI','CDD','Intérim','Remplacement','Étudiant'],
  att_motifFin: ['Fin de contrat','Licenciement','Démission','Retraite','Décès','Rupture mutuelle'],
}

// ─────────────────────────────────────────────
// GENERATEUR PDF / PREVIEW
// ─────────────────────────────────────────────
function generateDRSPreview(doc, travailleur, employeur, values) {
  const today = new Date().toLocaleDateString('fr-BE')
  return `
═══════════════════════════════════════════════════════
  ${doc.label.toUpperCase()}
  Généré le ${today} — Aureus Social Pro
═══════════════════════════════════════════════════════

EMPLOYEUR
─────────
Raison sociale : ${employeur?.nom || '—'}
N° BCE          : ${employeur?.bce || '—'}
N° ONSS         : ${employeur?.onss || '—'}
Adresse         : ${employeur?.adresse || '—'}

TRAVAILLEUR
───────────
Nom             : ${travailleur?.nom || '—'} ${travailleur?.prenom || ''}
NISS            : ${travailleur?.niss || '—'}
Date naissance  : ${travailleur?.dateNaissance || '—'}
Adresse         : ${travailleur?.adresse || '—'}

DONNÉES DU DOCUMENT
───────────────────
${doc.fields.map(f => `${(FIELD_LABELS[f] || f).padEnd(32)}: ${values[f] || '—'}`).join('\n')}

═══════════════════════════════════════════════════════
  Ce document a été généré automatiquement par
  Aureus Social Pro — Aureus IA SPRL
  Place Marcel Broodthaers 8 — 1060 Saint-Gilles
═══════════════════════════════════════════════════════
  `.trim()
}

// ─────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────
export default function DocumentsSociaux({ state, dispatch }) {
  const [recherche, setRecherche] = useState('')
  const [secteurActif, setSecteurActif] = useState('Tous')
  const [docSelectionne, setDocSelectionne] = useState(null)
  const [etape, setEtape] = useState(1) // 1=choix doc, 2=travailleur, 3=données, 4=preview
  const [travailleur, setTravailleur] = useState({ nom:'', prenom:'', niss:'', dateNaissance:'', adresse:'' })
  const [employeur] = useState({ nom:'Aureus IA SPRL', bce:'1028.230.781', onss:'51357716-02', adresse:'Place Marcel Broodthaers 8, 1060 Saint-Gilles' })
  const [values, setValues] = useState({})
  const [preview, setPreview] = useState('')
  const previewRef = useRef(null)

  const s = { background:'#0a0a0a', color:'#f1f5f9', minHeight:'100vh', fontFamily:'Inter,system-ui,sans-serif', padding:'24px' }

  // Filtrage catalogue
  const docsFiltres = DRS_CATALOGUE
    .filter(sec => secteurActif === 'Tous' || sec.secteur === secteurActif)
    .map(sec => ({
      ...sec,
      docs: sec.docs.filter(d =>
        !recherche || d.label.toLowerCase().includes(recherche.toLowerCase())
      )
    }))
    .filter(sec => sec.docs.length > 0)

  const totalDocs = DRS_CATALOGUE.reduce((a, s) => a + s.docs.length, 0)
  const docsFiltresCount = docsFiltres.reduce((a, s) => a + s.docs.length, 0)

  function handleSelectDoc(doc) {
    setDocSelectionne(doc)
    setValues({})
    setEtape(2)
  }

  function handleGenerer() {
    const txt = generateDRSPreview(docSelectionne, travailleur, employeur, values)
    setPreview(txt)
    setEtape(4)
  }

  function handleDownload() {
    const blob = new Blob([preview], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${docSelectionne.id}_${travailleur.nom || 'travailleur'}_${new Date().toISOString().slice(0,10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    setDocSelectionne(null)
    setEtape(1)
    setValues({})
    setTravailleur({ nom:'', prenom:'', niss:'', dateNaissance:'', adresse:'' })
    setPreview('')
  }

  // ── STYLES ──
  const card = { background:'#111', border:'1px solid #222', borderRadius:12, padding:'16px 20px', marginBottom:12, cursor:'pointer', transition:'all .15s' }
  const badge = (couleur) => ({ background: couleur + '20', color: couleur, border:`1px solid ${couleur}40`, borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:700 })
  const btn = (variant='primary') => ({
    background: variant==='primary' ? '#f59e0b' : variant==='ghost' ? 'transparent' : '#1f2937',
    color: variant==='primary' ? '#000' : '#f1f5f9',
    border: variant==='ghost' ? '1px solid #374151' : 'none',
    borderRadius:8, padding:'10px 20px', fontWeight:600, cursor:'pointer', fontSize:14
  })
  const input = { background:'#0d0d0d', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 14px', color:'#f1f5f9', width:'100%', fontSize:14, boxSizing:'border-box' }
  const label = { display:'block', fontSize:12, color:'#6b7280', marginBottom:4, fontWeight:500 }

  // ─────────────────────────────────────────────
  // ÉTAPE 1 — CATALOGUE
  // ─────────────────────────────────────────────
  if (etape === 1) return (
    <div style={s}>
      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <span style={{ fontSize:28 }}>📑</span>
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Documents Sociaux — DRS</h1>
            <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>{totalDocs} formulaires belges · Chômage · INAMI · Attestations</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:12, marginTop:16 }}>
          {DRS_CATALOGUE.map(sec => (
            <div key={sec.secteur} style={{ background:'#111', border:'1px solid #222', borderRadius:10, padding:'10px 16px', flex:1 }}>
              <div style={{ fontSize:18 }}>{sec.icon}</div>
              <div style={{ fontSize:18, fontWeight:700, color: sec.couleur }}>{sec.docs.length}</div>
              <div style={{ fontSize:11, color:'#6b7280' }}>{sec.secteur}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input
          style={{ ...input, width:260 }}
          placeholder="🔍  Rechercher un document..."
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
        />
        {['Tous', ...DRS_CATALOGUE.map(s => s.secteur)].map(sec => (
          <button key={sec} onClick={() => setSecteurActif(sec)} style={{
            ...btn(secteurActif === sec ? 'primary' : 'ghost'),
            padding:'8px 14px', fontSize:13
          }}>{sec}</button>
        ))}
      </div>
      {recherche && <p style={{ color:'#6b7280', fontSize:13, marginBottom:16 }}>{docsFiltresCount} résultat(s) pour « {recherche} »</p>}

      {/* Catalogue */}
      {docsFiltres.map(sec => (
        <div key={sec.secteur} style={{ marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <span style={{ fontSize:20 }}>{sec.icon}</span>
            <h2 style={{ margin:0, fontSize:16, fontWeight:700, color: sec.couleur }}>{sec.secteur}</h2>
            <span style={badge(sec.couleur)}>{sec.docs.length} docs</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:10 }}>
            {sec.docs.map(doc => (
              <div key={doc.id}
                style={{ ...card, borderColor:'#1e1e1e' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = sec.couleur; e.currentTarget.style.background = '#161616' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.background = '#111' }}
                onClick={() => handleSelectDoc(doc)}
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{doc.label}</div>
                    <div style={{ fontSize:12, color:'#4b5563' }}>{doc.fields.length} champs · {doc.id}</div>
                  </div>
                  <span style={badge(sec.couleur)}>{sec.secteur}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  // ─────────────────────────────────────────────
  // ÉTAPE 2 — TRAVAILLEUR
  // ─────────────────────────────────────────────
  if (etape === 2) return (
    <div style={s}>
      <div style={{ maxWidth:600 }}>
        <button onClick={reset} style={{ ...btn('ghost'), marginBottom:20, padding:'6px 14px', fontSize:13 }}>← Retour catalogue</button>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>📑 {docSelectionne.label}</h2>
        <p style={{ color:'#6b7280', fontSize:13, marginBottom:24 }}>Étape 1 / 2 — Identité du travailleur</p>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          {[['nom','Nom de famille'],['prenom','Prénom(s)']].map(([k,l]) => (
            <div key={k}>
              <label style={label}>{l} *</label>
              <input style={input} value={travailleur[k]} onChange={e => setTravailleur(p => ({...p,[k]:e.target.value}))} />
            </div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div>
            <label style={label}>N° NISS *</label>
            <input style={input} placeholder="XX.XX.XX-XXX-XX" value={travailleur.niss} onChange={e => setTravailleur(p => ({...p,niss:e.target.value}))} />
          </div>
          <div>
            <label style={label}>Date de naissance</label>
            <input type="date" style={input} value={travailleur.dateNaissance} onChange={e => setTravailleur(p => ({...p,dateNaissance:e.target.value}))} />
          </div>
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={label}>Adresse complète</label>
          <input style={input} placeholder="Rue, N°, Code postal, Commune" value={travailleur.adresse} onChange={e => setTravailleur(p => ({...p,adresse:e.target.value}))} />
        </div>

        {/* Employeur (readonly) */}
        <div style={{ background:'#0d1117', border:'1px solid #1e3a5f', borderRadius:10, padding:16, marginBottom:24 }}>
          <div style={{ fontSize:12, color:'#3b82f6', fontWeight:600, marginBottom:8 }}>EMPLOYEUR — pré-rempli</div>
          <div style={{ fontSize:13, color:'#94a3b8', lineHeight:1.8 }}>
            <b style={{ color:'#f1f5f9' }}>{employeur.nom}</b><br/>
            BCE : {employeur.bce} · ONSS : {employeur.onss}<br/>
            {employeur.adresse}
          </div>
        </div>

        <div style={{ display:'flex', gap:12 }}>
          <button onClick={reset} style={btn('ghost')}>Annuler</button>
          <button
            onClick={() => setEtape(3)}
            disabled={!travailleur.nom || !travailleur.niss}
            style={{ ...btn('primary'), opacity: (!travailleur.nom || !travailleur.niss) ? .5 : 1 }}
          >Continuer →</button>
        </div>
      </div>
    </div>
  )

  // ─────────────────────────────────────────────
  // ÉTAPE 3 — DONNÉES DU DOCUMENT
  // ─────────────────────────────────────────────
  if (etape === 3) return (
    <div style={s}>
      <div style={{ maxWidth:600 }}>
        <button onClick={() => setEtape(2)} style={{ ...btn('ghost'), marginBottom:20, padding:'6px 14px', fontSize:13 }}>← Retour</button>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>📑 {docSelectionne.label}</h2>
        <p style={{ color:'#6b7280', fontSize:13, marginBottom:24 }}>Étape 2 / 2 — Données spécifiques</p>

        <div style={{ display:'grid', gap:16, marginBottom:28 }}>
          {docSelectionne.fields.map(field => {
            const type = FIELD_TYPES[field] || 'text'
            const opts = FIELD_OPTIONS[field]
            return (
              <div key={field}>
                <label style={label}>{FIELD_LABELS[field] || field}</label>
                {opts ? (
                  <select style={input} value={values[field]||''} onChange={e => setValues(p => ({...p,[field]:e.target.value}))}>
                    <option value="">— Sélectionner —</option>
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={type}
                    style={input}
                    value={values[field]||''}
                    onChange={e => setValues(p => ({...p,[field]:e.target.value}))}
                    step={type==='number' ? 'any' : undefined}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div style={{ display:'flex', gap:12 }}>
          <button onClick={() => setEtape(2)} style={btn('ghost')}>← Retour</button>
          <button onClick={handleGenerer} style={btn('primary')}>Générer le document →</button>
        </div>
      </div>
    </div>
  )

  // ─────────────────────────────────────────────
  // ÉTAPE 4 — PREVIEW + TÉLÉCHARGEMENT
  // ─────────────────────────────────────────────
  if (etape === 4) return (
    <div style={s}>
      <div style={{ maxWidth:720 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>✅ Document généré</h2>
            <p style={{ margin:0, color:'#6b7280', fontSize:13 }}>{docSelectionne.label}</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={reset} style={btn('ghost')}>Nouveau document</button>
            <button onClick={handleDownload} style={btn('primary')}>⬇ Télécharger</button>
          </div>
        </div>

        {/* Récap travailleur */}
        <div style={{ background:'#0d1117', border:'1px solid #1e3a5f', borderRadius:10, padding:14, marginBottom:20, display:'flex', gap:32 }}>
          <div>
            <div style={{ fontSize:11, color:'#6b7280', marginBottom:2 }}>TRAVAILLEUR</div>
            <div style={{ fontWeight:600 }}>{travailleur.nom} {travailleur.prenom}</div>
            <div style={{ fontSize:12, color:'#94a3b8' }}>NISS : {travailleur.niss}</div>
          </div>
          <div>
            <div style={{ fontSize:11, color:'#6b7280', marginBottom:2 }}>EMPLOYEUR</div>
            <div style={{ fontWeight:600 }}>{employeur.nom}</div>
            <div style={{ fontSize:12, color:'#94a3b8' }}>BCE : {employeur.bce}</div>
          </div>
        </div>

        {/* Preview */}
        <pre ref={previewRef} style={{
          background:'#050505', border:'1px solid #1a1a1a', borderRadius:10,
          padding:20, fontSize:12, color:'#94a3b8', whiteSpace:'pre-wrap',
          overflowY:'auto', maxHeight:500, lineHeight:1.7, fontFamily:'monospace'
        }}>{preview}</pre>

        {/* Champs saisis */}
        <div style={{ marginTop:20, background:'#111', border:'1px solid #222', borderRadius:10, padding:16 }}>
          <div style={{ fontSize:12, color:'#6b7280', fontWeight:600, marginBottom:12 }}>DONNÉES SAISIES</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {docSelectionne.fields.map(f => (
              <div key={f} style={{ fontSize:12 }}>
                <span style={{ color:'#4b5563' }}>{FIELD_LABELS[f] || f} : </span>
                <span style={{ color:'#f1f5f9' }}>{values[f] || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return null
}
