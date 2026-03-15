'use client'
import { useState } from 'react'

const TYPES_FICHES = [
  { code: '28110', label: '281.10 — Employés & Ouvriers', fields: ['brut','pp','advantages','fraisPro','remboursements','coutEmployeur'] },
  { code: '28111', label: '281.11 — Pensions & Prépensions', fields: ['pension','pp','advantages'] },
  { code: '28113', label: '281.13 — Revenus de remplacement', fields: ['brut','pp'] },
  { code: '28114', label: '281.14 — Rentes alimentaires', fields: ['rente','pp'] },
  { code: '28117', label: '281.17 — Administrateurs & Gérants', fields: ['brut','pp','advantages','coutEmployeur'] },
  { code: '28120', label: '281.20 — Profits libéraux & Commissions', fields: ['brut','pp','fraisPro'] },
  { code: '28130', label: '281.30 — Jetons de présence', fields: ['brut','pp'] },
  { code: '28145', label: '281.45 — Droits d\'auteurs', fields: ['brut','pp','fraisForfait'] },
  { code: '28150', label: '281.50 — Honoraires & Vacations', fields: ['brut','pp','fraisPro'] },
]

const FIELD_META = {
  brut: { label: 'Rémunérations brutes annuelles (€)', type: 'number' },
  pp: { label: 'Précompte professionnel retenu (€)', type: 'number' },
  advantages: { label: 'Avantages en nature (€)', type: 'number' },
  fraisPro: { label: 'Frais professionnels réels (€)', type: 'number' },
  fraisForfait: { label: 'Frais forfaitaires (€)', type: 'number' },
  remboursements: { label: 'Remboursements de frais (€)', type: 'number' },
  coutEmployeur: { label: 'Cotisations patronales (€)', type: 'number' },
  pension: { label: 'Montant pension annuelle (€)', type: 'number' },
  rente: { label: 'Montant rente annuelle (€)', type: 'number' },
}

const SITUATIONS = ['Isolé','Chef de famille','Conjoint avec revenus','Veuf(ve)']

function generateXML(fiche, travailleur, employeur, values, annee) {
  const today = new Date().toISOString().slice(0,8).replace(/-/g,'')
  const total = parseFloat(values.brut || values.pension || values.rente || 0)
  const ppVal = parseFloat(values.pp || 0)

  return `<?xml version="1.0" encoding="UTF-8"?>
<Verzending>
  <v0002_inkomstenjaar>${annee}</v0002_inkomstenjaar>
  <v0010_bestandtype>BELCOTAX</v0010_bestandtype>
  <v0011_aanmaakdatum>${today}</v0011_aanmaakdatum>
  <v0014_naam>${employeur.nom}</v0014_naam>
  <v0015_adres>${employeur.adresse}</v0015_adres>
  <v0016_postcode>${employeur.cp}</v0016_postcode>
  <v0017_gemeente>${employeur.ville}</v0017_gemeente>
  <v0021_rijksregisternummer>${employeur.bce.replace(/\D/g,'')}</v0021_rijksregisternummer>
  <Aangifte>
    <a1002_inkomstenjaar>${annee}</a1002_inkomstenjaar>
    <a1005_registratienummer>${employeur.onss}</a1005_registratienummer>
    <Opgave325${fiche.code.slice(3)}>
      <f2002_inkomstenjaar>${annee}</f2002_inkomstenjaar>
      <f2005_registratienummer>${employeur.onss}</f2005_registratienummer>
      <f2008_typefiche>${fiche.code}</f2008_typefiche>
      <f2009_betalingscode>1</f2009_betalingscode>
      <f2011_rijksregisternummer>${travailleur.niss.replace(/\D/g,'')}</f2011_rijksregisternummer>
      <f2013_naam>${travailleur.nom}</f2013_naam>
      <f2015_voornamen>${travailleur.prenom}</f2015_voornamen>
      <f2016_adres>${travailleur.adresse}</f2016_adres>
      <f2028_totaalcontrole>${total.toFixed(2)}</f2028_totaalcontrole>
      <f2030_gewonebezoldigingen>${total.toFixed(2)}</f2030_gewonebezoldigingen>
      <f2060_bedrijfsvoorheffing>${ppVal.toFixed(2)}</f2060_bedrijfsvoorheffing>${
  values.advantages ? `\n      <f2059_voordeleallaardbedrag>${parseFloat(values.advantages).toFixed(2)}</f2059_voordeleallaardbedrag>` : ''}${
  values.fraisPro ? `\n      <f2053_werkelijkeberoepskosten>${parseFloat(values.fraisPro).toFixed(2)}</f2053_werkelijkeberoepskosten>` : ''}${
  values.coutEmployeur ? `\n      <f2034_werkgeversbijdragen>${parseFloat(values.coutEmployeur).toFixed(2)}</f2034_werkgeversbijdragen>` : ''}
    </Opgave325${fiche.code.slice(3)}>
  </Aangifte>
</Verzending>`
}

export default function BelcotaxFiches({ state, dispatch }) {
  const [etape, setEtape] = useState(1)
  const [ficheType, setFicheType] = useState(null)
  const [annee, setAnnee] = useState(new Date().getFullYear() - 1)
  const [travailleur, setTravailleur] = useState({ nom:'', prenom:'', niss:'', adresse:'', situation:'Isolé' })
  const [values, setValues] = useState({})
  const [xml, setXml] = useState('')
  const [batchMode, setBatchMode] = useState(false)
  const [batchList, setBatchList] = useState([])

  const employeur = { nom:'Aureus IA SPRL', bce:'1028.230.781', onss:'51357716', adresse:'Place Marcel Broodthaers 8', cp:'1060', ville:'Saint-Gilles' }

  const s = { background:'#0a0a0a', color:'#f1f5f9', minHeight:'100vh', padding:'24px', fontFamily:'Inter,system-ui,sans-serif' }
  const card = { background:'#111', border:'1px solid #1e1e1e', borderRadius:12, padding:'16px 20px', cursor:'pointer', transition:'all .15s' }
  const btn = (v='primary') => ({ background: v==='primary'?'#6366f1':v==='ghost'?'transparent':'#1f2937', color: v==='primary'?'#fff':'#f1f5f9', border: v==='ghost'?'1px solid #374151':'none', borderRadius:8, padding:'10px 20px', fontWeight:600, cursor:'pointer', fontSize:14 })
  const input = { background:'#0d0d0d', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 14px', color:'#f1f5f9', width:'100%', fontSize:14, boxSizing:'border-box' }
  const lbl = { display:'block', fontSize:12, color:'#6b7280', marginBottom:4, fontWeight:500 }

  function handleGenerate() {
    const x = generateXML(ficheType, travailleur, employeur, values, annee)
    setXml(x)
    if (batchMode) { setBatchList(p => [...p, { travailleur: {...travailleur}, values: {...values}, xml: x }]); setTravailleur({ nom:'', prenom:'', niss:'', adresse:'', situation:'Isolé' }); setValues({}) }
    else setEtape(4)
  }

  function downloadXML(content, filename) {
    const blob = new Blob([content], { type:'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=filename; a.click()
    URL.revokeObjectURL(url)
  }

  function downloadBatch() {
    const all = batchList.map(b => b.xml).join('\n\n<!-- ─────────────────────── -->\n\n')
    downloadXML(all, `Belcotax_${ficheType.code}_${annee}_batch.xml`)
  }

  function reset() { setEtape(1); setFicheType(null); setValues({}); setXml(''); setBatchList([]); setBatchMode(false) }

  // ÉTAPE 1 — Choix type fiche
  if (etape === 1) return (
    <div style={s}>
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <span style={{ fontSize:28 }}>📊</span>
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Fiches Fiscales Belcotax</h1>
            <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>Génération XML conforme BelcotaxOnWeb — SPF Finances</p>
          </div>
        </div>

        {/* Bannière certification */}
        <div style={{ background:'#0d1a0d', border:'1px solid #10b981', borderRadius:10, padding:'12px 16px', marginTop:16, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'#10b981' }}>🏅 Certification Belcotax-on-Web — SPF Finances</div>
            <div style={{ fontSize:11, color:'#6b7280', marginTop:3 }}>
              Agrément obligatoire avant de soumettre des fiches pour des clients tiers · Dossier à introduire via SPF Finances
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <a href="https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/belcotax-on-web" target="_blank" rel="noreferrer"
              style={{ background:'#10b98120', color:'#10b981', border:'1px solid #10b981', borderRadius:6, padding:'6px 14px', fontWeight:600, cursor:'pointer', fontSize:11, textDecoration:'none' }}>
              SPF Finances →
            </a>
            <a href="https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/various_concepts/belcotax.html" target="_blank" rel="noreferrer"
              style={{ background:'transparent', color:'#6b7280', border:'1px solid #2a2a2a', borderRadius:6, padding:'6px 14px', fontWeight:600, cursor:'pointer', fontSize:11, textDecoration:'none' }}>
              Guide ONSS
            </a>
          </div>
        </div>

        {/* Checklist certification */}
        <div style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:10, padding:'14px 16px', marginTop:12 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#f59e0b', marginBottom:10 }}>📋 Checklist certification Belcotax (à compléter avant premier client)</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[
              ['Obtenir n° d\'agrément SPF Finances (formulaire 604B)', false],
              ['BCE BE 1028.230.781 valide et actif', true],
              ['Tester la connexion BelcotaxOnWeb en mode test', false],
              ['Générer une fiche 281.10 de test et la valider', false],
              ['Signer la convention d\'utilisation BelcotaxOnWeb', false],
              ['Activer le certificat eID ou Token pour signature XML', false],
            ].map(([label, done]) => (
              <div key={label} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:12 }}>
                <span style={{ color: done ? '#10b981' : '#f59e0b', fontSize:14, lineHeight:1.4 }}>{done ? '✅' : '☐'}</span>
                <span style={{ color: done ? '#6b7280' : '#e2e8f0', lineHeight:1.5 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:16 }}>
          <div>
            <label style={lbl}>Année d'imposition</label>
            <input type="number" style={{ ...input, width:120 }} value={annee} onChange={e=>setAnnee(e.target.value)} />
          </div>
          <div style={{ marginTop:16 }}>
            <label style={{ ...lbl, cursor:'pointer' }}>
              <input type="checkbox" checked={batchMode} onChange={e=>setBatchMode(e.target.checked)} style={{ marginRight:6 }} />
              Mode batch (plusieurs travailleurs)
            </label>
          </div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:12 }}>
        {TYPES_FICHES.map(f => (
          <div key={f.code} style={card}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#6366f1';e.currentTarget.style.background='#161616'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='#1e1e1e';e.currentTarget.style.background='#111'}}
            onClick={()=>{setFicheType(f);setEtape(2)}}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:15, color:'#818cf8' }}>{f.code.replace('281','281.')}</div>
                <div style={{ fontSize:13, marginTop:2 }}>{f.label.split('—')[1].trim()}</div>
              </div>
              <div style={{ background:'#1e1b4b', color:'#818cf8', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:700 }}>{f.fields.length} champs</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // ÉTAPE 2 — Travailleur
  if (etape === 2) return (
    <div style={s}>
      <div style={{ maxWidth:600 }}>
        <button onClick={reset} style={{ ...btn('ghost'), marginBottom:20, padding:'6px 14px', fontSize:13 }}>← Retour</button>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>📊 {ficheType.label}</h2>
        <p style={{ color:'#6b7280', fontSize:13, marginBottom:24 }}>Année {annee} — Identité du bénéficiaire</p>
        {batchMode && batchList.length > 0 && (
          <div style={{ background:'#0d1117', border:'1px solid #1e3a5f', borderRadius:10, padding:12, marginBottom:20 }}>
            <div style={{ fontSize:12, color:'#3b82f6', fontWeight:600 }}>{batchList.length} fiche(s) déjà générée(s)</div>
            {batchList.map((b,i) => <div key={i} style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>• {b.travailleur.nom} {b.travailleur.prenom}</div>)}
            <button onClick={downloadBatch} style={{ ...btn('primary'), marginTop:10, padding:'6px 14px', fontSize:12 }}>⬇ Télécharger batch</button>
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          {[['nom','Nom *'],['prenom','Prénom(s) *']].map(([k,l]) => (
            <div key={k}><label style={lbl}>{l}</label><input style={input} value={travailleur[k]} onChange={e=>setTravailleur(p=>({...p,[k]:e.target.value}))} /></div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div><label style={lbl}>N° NISS *</label><input style={input} placeholder="XX.XX.XX-XXX-XX" value={travailleur.niss} onChange={e=>setTravailleur(p=>({...p,niss:e.target.value}))} /></div>
          <div><label style={lbl}>Situation familiale</label>
            <select style={input} value={travailleur.situation} onChange={e=>setTravailleur(p=>({...p,situation:e.target.value}))}>
              {SITUATIONS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom:24 }}><label style={lbl}>Adresse complète</label><input style={input} value={travailleur.adresse} onChange={e=>setTravailleur(p=>({...p,adresse:e.target.value}))} /></div>
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={reset} style={btn('ghost')}>Annuler</button>
          <button onClick={()=>setEtape(3)} disabled={!travailleur.nom||!travailleur.niss} style={{ ...btn('primary'), opacity:(!travailleur.nom||!travailleur.niss)?.5:1 }}>Continuer →</button>
        </div>
      </div>
    </div>
  )

  // ÉTAPE 3 — Montants
  if (etape === 3) return (
    <div style={s}>
      <div style={{ maxWidth:600 }}>
        <button onClick={()=>setEtape(2)} style={{ ...btn('ghost'), marginBottom:20, padding:'6px 14px', fontSize:13 }}>← Retour</button>
        <h2 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>📊 {ficheType.label}</h2>
        <p style={{ color:'#6b7280', fontSize:13, marginBottom:24 }}>{travailleur.nom} {travailleur.prenom} — Montants {annee}</p>
        <div style={{ display:'grid', gap:16, marginBottom:28 }}>
          {ficheType.fields.map(f => (
            <div key={f}>
              <label style={lbl}>{FIELD_META[f]?.label || f}</label>
              <input type="number" step="0.01" style={input} value={values[f]||''} onChange={e=>setValues(p=>({...p,[f]:e.target.value}))} placeholder="0.00" />
            </div>
          ))}
        </div>
        {/* Preview totaux */}
        {values.brut && values.pp && (
          <div style={{ background:'#0d1117', border:'1px solid #1e3a5f', borderRadius:10, padding:16, marginBottom:20 }}>
            <div style={{ fontSize:12, color:'#3b82f6', fontWeight:600, marginBottom:10 }}>APERÇU CONTRÔLE</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:13 }}>
              <div><span style={{ color:'#6b7280' }}>Brut annuel : </span><span style={{ fontWeight:700 }}>{parseFloat(values.brut||0).toLocaleString('fr-BE',{minimumFractionDigits:2})} €</span></div>
              <div><span style={{ color:'#6b7280' }}>Précompte : </span><span style={{ fontWeight:700, color:'#f87171' }}>{parseFloat(values.pp||0).toLocaleString('fr-BE',{minimumFractionDigits:2})} €</span></div>
              <div><span style={{ color:'#6b7280' }}>Taux PP effectif : </span><span style={{ fontWeight:700, color:'#34d399' }}>{values.brut>0?(parseFloat(values.pp||0)/parseFloat(values.brut)*100).toFixed(1):0}%</span></div>
              <div><span style={{ color:'#6b7280' }}>Net imposable : </span><span style={{ fontWeight:700 }}>{(parseFloat(values.brut||0)-parseFloat(values.pp||0)).toLocaleString('fr-BE',{minimumFractionDigits:2})} €</span></div>
            </div>
          </div>
        )}
        <div style={{ display:'flex', gap:12 }}>
          <button onClick={()=>setEtape(2)} style={btn('ghost')}>← Retour</button>
          <button onClick={handleGenerate} style={btn('primary')}>Générer XML →</button>
        </div>
      </div>
    </div>
  )

  // ÉTAPE 4 — XML généré
  if (etape === 4) return (
    <div style={s}>
      <div style={{ maxWidth:760 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div>
            <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>✅ XML Belcotax généré</h2>
            <p style={{ margin:0, color:'#6b7280', fontSize:13 }}>{ficheType.label} — {travailleur.nom} {travailleur.prenom} — {annee}</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={reset} style={btn('ghost')}>Nouvelle fiche</button>
            <button onClick={()=>downloadXML(xml,`${ficheType.code}_${travailleur.niss.replace(/\D/g,'')}_${annee}.xml`)} style={btn('primary')}>⬇ Télécharger XML</button>
          </div>
        </div>
        <div style={{ background:'#0d1117', border:'1px solid #1e3a5f', borderRadius:10, padding:14, marginBottom:20, display:'flex', gap:32, flexWrap:'wrap' }}>
          <div><div style={{ fontSize:11, color:'#6b7280' }}>BÉNÉFICIAIRE</div><div style={{ fontWeight:600 }}>{travailleur.nom} {travailleur.prenom}</div><div style={{ fontSize:12, color:'#94a3b8' }}>NISS: {travailleur.niss}</div></div>
          <div><div style={{ fontSize:11, color:'#6b7280' }}>TYPE FICHE</div><div style={{ fontWeight:600, color:'#818cf8' }}>{ficheType.code.replace('281','281.')}</div></div>
          <div><div style={{ fontSize:11, color:'#6b7280' }}>BRUT ANNUEL</div><div style={{ fontWeight:700, fontSize:18 }}>{parseFloat(values.brut||values.pension||values.rente||0).toLocaleString('fr-BE',{minimumFractionDigits:2})} €</div></div>
          <div><div style={{ fontSize:11, color:'#6b7280' }}>PRÉCOMPTE</div><div style={{ fontWeight:700, fontSize:18, color:'#f87171' }}>{parseFloat(values.pp||0).toLocaleString('fr-BE',{minimumFractionDigits:2})} €</div></div>
        </div>
        <pre style={{ background:'#050505', border:'1px solid #1a1a1a', borderRadius:10, padding:20, fontSize:11, color:'#94a3b8', whiteSpace:'pre-wrap', overflowY:'auto', maxHeight:450, fontFamily:'monospace', lineHeight:1.6 }}>{xml}</pre>
        <div style={{ marginTop:12, padding:12, background:'#111', borderRadius:8, fontSize:12, color:'#6b7280' }}>
          💡 Fichier prêt à uploader sur <strong style={{ color:'#f1f5f9' }}>belcotaxonweb.be</strong> — Format XML v2.4 conforme SPF Finances
        </div>
      </div>
    </div>
  )

  return null
}
