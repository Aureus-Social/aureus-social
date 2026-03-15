'use client'
import { useState } from 'react'

// Taux cotisation vacances ouvriers (ONVA) — AR 30/03/2000
const TAUX_ONVA = 0.1584  // 15.84% sur brut
const TAUX_SIMPLE_PECULE = 0.92  // 92% de 1 mois
const TAUX_DOUBLE_PECULE = 0.92  // pécule de vacances double = 92% du brut mensuel

function calcVacances(ouvrier) {
  const { brutMensuel, moisPrestesAnneeRef, regime } = ouvrier
  const brutR = brutMensuel * (regime / 100)
  // Cotisation ONVA sur brut x 12 mois (proratisé)
  const brutAnnuel = brutR * moisPrestesAnneeRef
  const cotisationONVA = Math.round(brutAnnuel * TAUX_ONVA * 100) / 100
  // Jours de vacances acquis (base 20j temps plein)
  const joursVacances = Math.round((moisPrestesAnneeRef / 12) * 20 * (regime / 100))
  // Pécule simple (payé par ONVA)
  const peculeSimple = Math.round(brutR * TAUX_SIMPLE_PECULE * 100) / 100
  // Double pécule vacances (92% du brut mensuel)
  const peculeDouble = Math.round(brutR * TAUX_DOUBLE_PECULE * 100) / 100
  // Total pécule
  const peculeTotal = Math.round((peculeSimple + peculeDouble) * 100) / 100

  return { brutR, brutAnnuel, cotisationONVA, joursVacances, peculeSimple, peculeDouble, peculeTotal }
}

const MOCK_OUVRIERS = [
  { id:1, nom:'Dupont', prenom:'Thomas', niss:'78051234567', cp:'200', brutMensuel:2800, regime:100, moisPrestesAnneeRef:12, statut:'ouvrier' },
  { id:2, nom:'Ahmed', prenom:'Karim', niss:'89091187654', cp:'124', brutMensuel:2400, regime:80, moisPrestesAnneeRef:10, statut:'ouvrier' },
  { id:3, nom:'Lecomte', prenom:'Julie', niss:'93030312345', cp:'200', brutMensuel:3100, regime:100, moisPrestesAnneeRef:12, statut:'ouvrier' },
]

export default function CaisseVacances({ state, dispatch }) {
  const [ouvriers, setOuvriers] = useState(MOCK_OUVRIERS)
  const [annee, setAnnee] = useState(new Date().getFullYear() - 1)
  const [onglet, setOnglet] = useState('calcul')
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newOuvrier, setNewOuvrier] = useState({ nom:'', prenom:'', niss:'', cp:'200', brutMensuel:'', regime:100, moisPrestesAnneeRef:12 })

  const s = { background:'#0a0a0a', color:'#f1f5f9', minHeight:'100vh', padding:'24px', fontFamily:'Inter,system-ui,sans-serif' }
  const btn = (v='primary') => ({ background:v==='primary'?'#06b6d4':v==='ghost'?'transparent':'#1f2937', color:v==='primary'?'#000':'#f1f5f9', border:v==='ghost'?'1px solid #374151':'none', borderRadius:8, padding:'9px 18px', fontWeight:600, cursor:'pointer', fontSize:13 })
  const inp = { background:'#0d0d0d', border:'1px solid #2a2a2a', borderRadius:8, padding:'9px 13px', color:'#f1f5f9', fontSize:13, boxSizing:'border-box', width:'100%' }
  const lbl = { display:'block', fontSize:12, color:'#6b7280', marginBottom:4, fontWeight:500 }

  const calcTous = ouvriers.map(o => ({ ...o, ...calcVacances(o) }))
  const totalCotisation = calcTous.reduce((a,o) => a+o.cotisationONVA, 0)
  const totalPecule = calcTous.reduce((a,o) => a+o.peculeTotal, 0)
  const totalJours = calcTous.reduce((a,o) => a+o.joursVacances, 0)

  function addOuvrier() {
    const id = Date.now()
    setOuvriers(p => [...p, { ...newOuvrier, id, brutMensuel:parseFloat(newOuvrier.brutMensuel)||0, regime:parseInt(newOuvrier.regime)||100, moisPrestesAnneeRef:parseInt(newOuvrier.moisPrestesAnneeRef)||12 }])
    setNewOuvrier({ nom:'', prenom:'', niss:'', cp:'200', brutMensuel:'', regime:100, moisPrestesAnneeRef:12 })
    setShowAdd(false)
  }

  function generateDeclaration() {
    const lines = calcTous.map(o =>
      `${o.nom.padEnd(20)} ${o.prenom.padEnd(15)} NISS: ${o.niss.padEnd(15)} Jours: ${String(o.joursVacances).padEnd(5)} Cotis: ${o.cotisationONVA.toFixed(2).padEnd(10)} Pécule: ${o.peculeTotal.toFixed(2)} €`
    ).join('\n')
    const txt = `DÉCLARATION VACANCES ANNUELLES OUVRIERS — ${annee}
Aureus IA SPRL — BCE 1028.230.781 — ONSS 51357716
Caisse de Vacances : ONVA (Office National des Vacances Annuelles)
${'═'.repeat(80)}
${lines}
${'─'.repeat(80)}
TOTAUX
Nb ouvriers          : ${ouvriers.length}
Total jours acquis   : ${totalJours} jours
Total cotisations    : ${totalCotisation.toFixed(2)} €
Total pécules        : ${totalPecule.toFixed(2)} €
${'═'.repeat(80)}
Taux ONVA : ${(TAUX_ONVA*100).toFixed(2)}% sur brut annuel (AR 30/03/2000)`
    const blob = new Blob([txt], { type:'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`Vacances_Ouvriers_${annee}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={s}>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:28 }}>🏖️</span>
            <div>
              <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Caisse de Vacances Ouvriers</h1>
              <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>ONVA — Cotisations & pécules — AR 30/03/2000</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <select style={{ background:'#111', border:'1px solid #2a2a2a', borderRadius:8, padding:'8px 12px', color:'#f1f5f9', fontSize:13 }} value={annee} onChange={e=>setAnnee(e.target.value)}>
              {[2025,2024,2023,2022].map(y=><option key={y}>{y}</option>)}
            </select>
            <button onClick={generateDeclaration} style={btn('primary')}>⬇ Exporter déclaration</button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display:'flex', gap:12, marginTop:16 }}>
          {[
            { label:'Ouvriers', val:ouvriers.length, color:'#06b6d4' },
            { label:'Total jours acquis', val:`${totalJours} j`, color:'#f59e0b' },
            { label:'Cotisations ONVA', val:`${totalCotisation.toFixed(2)} €`, color:'#f87171' },
            { label:'Pécules à verser', val:`${totalPecule.toFixed(2)} €`, color:'#4ade80' },
            { label:'Taux ONVA', val:'15.84%', color:'#94a3b8' },
          ].map(st=>(
            <div key={st.label} style={{ background:'#111', border:'1px solid #222', borderRadius:10, padding:'10px 16px', flex:1 }}>
              <div style={{ fontSize:st.label==='Cotisations ONVA'||st.label==='Pécules à verser'?14:18, fontWeight:700, color:st.color }}>{st.val}</div>
              <div style={{ fontSize:11, color:'#6b7280' }}>{st.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display:'flex', gap:2, marginBottom:20, background:'#111', borderRadius:10, padding:4, width:'fit-content' }}>
        {[['calcul','📊 Calculs'],['legal','⚖️ Base légale']].map(([id,label])=>(
          <button key={id} onClick={()=>setOnglet(id)} style={{ background:onglet===id?'#1f2937':'transparent', color:onglet===id?'#f1f5f9':'#6b7280', border:'none', borderRadius:8, padding:'8px 16px', cursor:'pointer', fontWeight:onglet===id?600:400, fontSize:13 }}>{label}</button>
        ))}
      </div>

      {onglet === 'calcul' && (
        <div>
          {/* Tableau principal */}
          <div style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:12, overflow:'hidden', marginBottom:20 }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid #1e1e1e', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontWeight:600 }}>Ouvriers — Année de référence {annee}</div>
              <button onClick={()=>setShowAdd(p=>!p)} style={{ ...btn('ghost'), padding:'6px 14px', fontSize:12 }}>+ Ajouter ouvrier</button>
            </div>

            {showAdd && (
              <div style={{ padding:20, background:'#0d1117', borderBottom:'1px solid #1e1e1e' }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:12 }}>
                  {[['nom','Nom'],['prenom','Prénom'],['niss','NISS'],['cp','Commission Paritaire']].map(([k,l])=>(
                    <div key={k}><label style={lbl}>{l}</label><input style={inp} value={newOuvrier[k]} onChange={e=>setNewOuvrier(p=>({...p,[k]:e.target.value}))} /></div>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:12 }}>
                  <div><label style={lbl}>Brut mensuel (€)</label><input type="number" style={inp} value={newOuvrier.brutMensuel} onChange={e=>setNewOuvrier(p=>({...p,brutMensuel:e.target.value}))} /></div>
                  <div><label style={lbl}>Régime (%)</label>
                    <select style={inp} value={newOuvrier.regime} onChange={e=>setNewOuvrier(p=>({...p,regime:e.target.value}))}>
                      {[100,90,80,75,60,50].map(r=><option key={r} value={r}>{r}%</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Mois prestés (année réf.)</label><input type="number" min="1" max="12" style={inp} value={newOuvrier.moisPrestesAnneeRef} onChange={e=>setNewOuvrier(p=>({...p,moisPrestesAnneeRef:e.target.value}))} /></div>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={()=>setShowAdd(false)} style={{ ...btn('ghost'), padding:'8px 16px', fontSize:13 }}>Annuler</button>
                  <button onClick={addOuvrier} disabled={!newOuvrier.nom||!newOuvrier.brutMensuel} style={{ ...btn('primary'), padding:'8px 16px', fontSize:13 }}>Ajouter</button>
                </div>
              </div>
            )}

            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:'#0d0d0d' }}>
                {['Ouvrier','CP','Régime','Brut mensuel','Mois prestés','Jours acquis','Cotis. ONVA','Pécule simple','Pécule double','Total pécule'].map(h=>(
                  <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:10, color:'#6b7280', fontWeight:600, borderBottom:'1px solid #1e1e1e', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {calcTous.map(o=>(
                  <tr key={o.id} style={{ borderBottom:'1px solid #141414', cursor:'pointer' }}
                    onClick={()=>setSelected(selected===o.id?null:o.id)}>
                    <td style={{ padding:'10px 12px', fontWeight:500 }}>{o.nom} {o.prenom}</td>
                    <td style={{ padding:'10px 12px', color:'#6b7280', fontSize:12 }}>{o.cp}</td>
                    <td style={{ padding:'10px 12px', color:'#6b7280' }}>{o.regime}%</td>
                    <td style={{ padding:'10px 12px' }}>{o.brutR.toFixed(2)} €</td>
                    <td style={{ padding:'10px 12px', textAlign:'center' }}>{o.moisPrestesAnneeRef}</td>
                    <td style={{ padding:'10px 12px', fontWeight:700, color:'#f59e0b', textAlign:'center' }}>{o.joursVacances}j</td>
                    <td style={{ padding:'10px 12px', color:'#f87171' }}>{o.cotisationONVA.toFixed(2)} €</td>
                    <td style={{ padding:'10px 12px' }}>{o.peculeSimple.toFixed(2)} €</td>
                    <td style={{ padding:'10px 12px' }}>{o.peculeDouble.toFixed(2)} €</td>
                    <td style={{ padding:'10px 12px', fontWeight:700, color:'#4ade80' }}>{o.peculeTotal.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background:'#0d0d0d', borderTop:'2px solid #2a2a2a' }}>
                  <td colSpan={5} style={{ padding:'12px', fontWeight:700 }}>TOTAL — {ouvriers.length} ouvriers</td>
                  <td style={{ padding:'12px', fontWeight:700, color:'#f59e0b', textAlign:'center' }}>{totalJours}j</td>
                  <td style={{ padding:'12px', fontWeight:700, color:'#f87171' }}>{totalCotisation.toFixed(2)} €</td>
                  <td colSpan={2} />
                  <td style={{ padding:'12px', fontWeight:800, color:'#4ade80', fontSize:15 }}>{totalPecule.toFixed(2)} €</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {onglet === 'legal' && (
        <div style={{ display:'grid', gap:16, maxWidth:700 }}>
          {[
            { titre:'Base légale', couleur:'#06b6d4', items:[
              'AR du 30 mars 2000 relatif aux vacances annuelles des ouvriers',
              'Loi du 28 juin 1971 — vacances annuelles des travailleurs salariés',
              'Taux cotisation ONVA : 15.84% sur brut annuel',
              'Organisé par l\'ONVA (Office National des Vacances Annuelles)',
            ]},
            { titre:'Droit aux vacances — Ouvriers', couleur:'#f59e0b', items:[
              '20 jours de vacances pour 12 mois complets prestés (temps plein)',
              'Proratisé selon mois prestés et régime de travail',
              'Pécule simple : 92% du salaire brut journalier moyen',
              'Pécule double : 92% d\'un mois de salaire brut',
              'Payé directement par la caisse de vacances, PAS par l\'employeur',
            ]},
            { titre:'Différence Ouvriers / Employés', couleur:'#8b5cf6', items:[
              'Ouvriers → caisse de vacances (ONVA ou sectorielle)',
              'Employés → pécule payé par l\'employeur lui-même',
              'Ouvriers : cotisation patronale 15.84% constituée chaque trimestre',
              'Ouvriers : pécule versé en mai/juin de l\'année suivante',
            ]},
          ].map(sec=>(
            <div key={sec.titre} style={{ background:'#111', border:`1px solid ${sec.couleur}30`, borderRadius:12, padding:20 }}>
              <div style={{ fontWeight:700, marginBottom:12, color:sec.couleur }}>{sec.titre}</div>
              {sec.items.map((item,i)=><div key={i} style={{ fontSize:13, color:'#94a3b8', marginBottom:6, paddingLeft:12, borderLeft:`2px solid ${sec.couleur}40` }}>• {item}</div>)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
