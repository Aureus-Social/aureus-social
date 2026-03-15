'use client'
import { useState, useEffect } from 'react'

const OPERATEURS = [
  { id:'sodexo', label:'Sodexo', couleur:'#e53e3e', logo:'🔴', url:'https://www.sodexo.be' },
  { id:'edenred', label:'Edenred', couleur:'#f6831e', logo:'🟠', url:'https://www.edenred.be' },
  { id:'monizze', label:'Monizze', couleur:'#2b6cb0', logo:'🔵', url:'https://www.monizze.be' },
]

const VALEURS_STANDARD = [6.00, 6.50, 7.00, 7.50, 8.00]

// Calcul légal chèques-repas
function calcChequeRepas(valeurFace, nbJours) {
  // Plafond légal employeur : 6.91€/jour (2024)
  const PLAFOND_EMP = 6.91
  // Contribution travailleur min : 1.09€/jour
  const CONTRIB_TRV = 1.09
  const valeurEmp = Math.min(valeurFace - CONTRIB_TRV, PLAFOND_EMP)
  const valeurTrv = valeurFace - valeurEmp
  return {
    valeurFace,
    valeurEmp: Math.round(valeurEmp * 100) / 100,
    valeurTrv: Math.round(valeurTrv * 100) / 100,
    totalEmp: Math.round(valeurEmp * nbJours * 100) / 100,
    totalTrv: Math.round(valeurTrv * nbJours * 100) / 100,
    totalCommande: Math.round(valeurFace * nbJours * 100) / 100,
    nbJours,
  }
}

const MOCK_EMPLOYEES = [
  { id:1, nom:'Dupont', prenom:'Marie', niss:'85010112345', regime:100, joursBase:21, actif:true },
  { id:2, nom:'Martin', prenom:'Jean', niss:'79030254321', regime:80, joursBase:17, actif:true },
  { id:3, nom:'Leblanc', prenom:'Sophie', niss:'92071509876', regime:100, joursBase:21, actif:true },
]

export default function ChequesRepas({ state, dispatch }) {
  const [onglet, setOnglet] = useState('commande')
  const [operateur, setOperateur] = useState('sodexo')
  const [valeurFace, setValeurFace] = useState(8.00)
  const [mois, setMois] = useState(new Date().toISOString().slice(0,7))
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES)
  const [joursParEmp, setJoursParEmp] = useState({})
  const [commande, setCommande] = useState(null)
  const [historique] = useState([
    { mois:'2026-02', operateur:'Sodexo', valeur:8.00, total:504.00, nbEmp:3, statut:'Livré' },
    { mois:'2026-01', operateur:'Sodexo', valeur:8.00, total:488.00, nbEmp:3, statut:'Livré' },
  ])

  const op = OPERATEURS.find(o => o.id === operateur)

  const s = { background:'#0a0a0a', color:'#f1f5f9', minHeight:'100vh', padding:'24px', fontFamily:'Inter,system-ui,sans-serif' }
  const btn = (v='primary', couleur='#10b981') => ({ background: v==='primary'?couleur:v==='ghost'?'transparent':'#1f2937', color: v==='primary'?'#fff':'#f1f5f9', border: v==='ghost'?'1px solid #374151':'none', borderRadius:8, padding:'8px 16px', fontWeight:600, cursor:'pointer', fontSize:13 })
  const input = { background:'#0d0d0d', border:'1px solid #2a2a2a', borderRadius:8, padding:'9px 13px', color:'#f1f5f9', fontSize:13, boxSizing:'border-box' }

  function getJours(emp) { return joursParEmp[emp.id] ?? Math.round(emp.joursBase * (emp.regime / 100)) }

  function calculerCommande() {
    const lignes = employees.filter(e => e.actif).map(e => {
      const j = getJours(e)
      const calc = calcChequeRepas(valeurFace, j)
      return { ...e, jours:j, ...calc }
    })
    const totaux = {
      nbCheques: lignes.reduce((a,l) => a+l.nbJours, 0),
      totalEmp: lignes.reduce((a,l) => a+l.totalEmp, 0),
      totalTrv: lignes.reduce((a,l) => a+l.totalTrv, 0),
      total: lignes.reduce((a,l) => a+l.totalCommande, 0),
    }
    setCommande({ lignes, totaux, operateur: op.label, valeurFace, mois })
    setOnglet('recap')
  }

  const limiteEmp = 6.91
  const isOK = valeurFace <= (limiteEmp + 1.09)

  return (
    <div style={s}>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <span style={{ fontSize:28 }}>🍽️</span>
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Chèques-Repas</h1>
            <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>Gestion & commandes — Sodexo · Edenred · Monizze</p>
          </div>
        </div>
        {/* Stats rapides */}
        <div style={{ display:'flex', gap:12, marginTop:16 }}>
          {[
            { label:'Travailleurs actifs', val: employees.filter(e=>e.actif).length, color:'#10b981' },
            { label:'Valeur faciale', val: `${valeurFace.toFixed(2)} €`, color:'#f59e0b' },
            { label:'Part employeur max', val: `${limiteEmp.toFixed(2)} €`, color:'#6366f1' },
            { label:'Part travailleur min', val: '1.09 €', color:'#94a3b8' },
          ].map(st => (
            <div key={st.label} style={{ background:'#111', border:'1px solid #222', borderRadius:10, padding:'10px 16px', flex:1 }}>
              <div style={{ fontSize:18, fontWeight:700, color:st.color }}>{st.val}</div>
              <div style={{ fontSize:11, color:'#6b7280' }}>{st.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display:'flex', gap:2, marginBottom:24, background:'#111', borderRadius:10, padding:4, width:'fit-content' }}>
        {[['commande','📋 Commande'],['parametres','⚙️ Paramètres'],['historique','📅 Historique'],['legal','⚖️ Légal']].map(([id,label]) => (
          <button key={id} onClick={()=>setOnglet(id)} style={{ background:onglet===id?'#1f2937':'transparent', color:onglet===id?'#f1f5f9':'#6b7280', border:'none', borderRadius:8, padding:'8px 16px', cursor:'pointer', fontWeight:onglet===id?600:400, fontSize:13 }}>{label}</button>
        ))}
        {commande && <button onClick={()=>setOnglet('recap')} style={{ background:onglet==='recap'?'#1f2937':'transparent', color:onglet==='recap'?'#f1f5f9':'#6b7280', border:'none', borderRadius:8, padding:'8px 16px', cursor:'pointer', fontWeight:600, fontSize:13 }}>✅ Récap commande</button>}
      </div>

      {/* ─── ONGLET COMMANDE ─── */}
      {onglet === 'commande' && (
        <div>
          {/* Config */}
          <div style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:12, padding:20, marginBottom:20 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>Configuration de la commande</div>
            <div style={{ display:'flex', gap:20, flexWrap:'wrap', alignItems:'flex-end' }}>
              <div>
                <div style={{ fontSize:12, color:'#6b7280', marginBottom:8 }}>Opérateur</div>
                <div style={{ display:'flex', gap:8 }}>
                  {OPERATEURS.map(o => (
                    <button key={o.id} onClick={()=>setOperateur(o.id)} style={{ background:operateur===o.id?o.couleur+'20':'#0d0d0d', border:`2px solid ${operateur===o.id?o.couleur:'#2a2a2a'}`, borderRadius:8, padding:'8px 16px', color: operateur===o.id?o.couleur:'#6b7280', cursor:'pointer', fontWeight:operateur===o.id?700:400, fontSize:13 }}>
                      {o.logo} {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize:12, color:'#6b7280', marginBottom:8 }}>Valeur faciale</div>
                <div style={{ display:'flex', gap:6 }}>
                  {VALEURS_STANDARD.map(v => (
                    <button key={v} onClick={()=>setValeurFace(v)} style={{ background:valeurFace===v?'#10b981':'#0d0d0d', border:`1px solid ${valeurFace===v?'#10b981':'#2a2a2a'}`, borderRadius:6, padding:'6px 12px', color:valeurFace===v?'#fff':'#9ca3af', cursor:'pointer', fontWeight:valeurFace===v?700:400, fontSize:13 }}>
                      {v.toFixed(2)}€
                    </button>
                  ))}
                  <input type="number" step="0.01" min="1.09" max="8.00" style={{ ...input, width:80 }} value={valeurFace} onChange={e=>setValeurFace(parseFloat(e.target.value)||8)} />
                </div>
              </div>
              <div>
                <div style={{ fontSize:12, color:'#6b7280', marginBottom:8 }}>Mois</div>
                <input type="month" style={input} value={mois} onChange={e=>setMois(e.target.value)} />
              </div>
            </div>
            {!isOK && <div style={{ marginTop:12, background:'#450a0a', border:'1px solid #7f1d1d', borderRadius:8, padding:10, fontSize:12, color:'#fca5a5' }}>⚠️ Valeur faciale dépasse le plafond légal (8.00€ max)</div>}
          </div>

          {/* Tableau travailleurs */}
          <div style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #1e1e1e', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontWeight:600 }}>Travailleurs — {employees.filter(e=>e.actif).length} actifs</div>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#0d0d0d' }}>
                  {['Actif','Nom','Régime','Jours CR','Part EMP','Part TRV','Total'].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'#6b7280', fontWeight:600, borderBottom:'1px solid #1e1e1e' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => {
                  const j = getJours(emp)
                  const calc = calcChequeRepas(valeurFace, j)
                  return (
                    <tr key={emp.id} style={{ borderBottom:'1px solid #141414' }}>
                      <td style={{ padding:'10px 16px' }}>
                        <input type="checkbox" checked={emp.actif} onChange={e=>setEmployees(p=>p.map((em,idx)=>idx===i?{...em,actif:e.target.checked}:em))} />
                      </td>
                      <td style={{ padding:'10px 16px', fontWeight:500 }}>{emp.nom} {emp.prenom}</td>
                      <td style={{ padding:'10px 16px', color:'#6b7280' }}>{emp.regime}%</td>
                      <td style={{ padding:'10px 16px' }}>
                        <input type="number" min="0" max="31" style={{ ...input, width:60, padding:'4px 8px' }} value={j} onChange={e=>setJoursParEmp(p=>({...p,[emp.id]:parseInt(e.target.value)||0}))} />
                      </td>
                      <td style={{ padding:'10px 16px', color:'#10b981', fontWeight:600 }}>{calc.totalEmp.toFixed(2)} €</td>
                      <td style={{ padding:'10px 16px', color:'#94a3b8' }}>{calc.totalTrv.toFixed(2)} €</td>
                      <td style={{ padding:'10px 16px', fontWeight:700 }}>{calc.totalCommande.toFixed(2)} €</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr style={{ background:'#0d0d0d', borderTop:'2px solid #2a2a2a' }}>
                  <td colSpan={4} style={{ padding:'12px 16px', fontWeight:700 }}>TOTAL</td>
                  <td style={{ padding:'12px 16px', fontWeight:700, color:'#10b981' }}>
                    {employees.filter(e=>e.actif).reduce((a,e)=>a+calcChequeRepas(valeurFace,getJours(e)).totalEmp,0).toFixed(2)} €
                  </td>
                  <td style={{ padding:'12px 16px', fontWeight:700 }}>
                    {employees.filter(e=>e.actif).reduce((a,e)=>a+calcChequeRepas(valeurFace,getJours(e)).totalTrv,0).toFixed(2)} €
                  </td>
                  <td style={{ padding:'12px 16px', fontWeight:700, fontSize:16, color:'#f59e0b' }}>
                    {employees.filter(e=>e.actif).reduce((a,e)=>a+calcChequeRepas(valeurFace,getJours(e)).totalCommande,0).toFixed(2)} €
                  </td>
                </tr>
              </tfoot>
            </table>
            <div style={{ padding:16, borderTop:'1px solid #1e1e1e' }}>
              <button onClick={calculerCommande} style={btn('primary','#10b981')}>Générer la commande {op.logo} {op.label} →</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── ONGLET RECAP COMMANDE ─── */}
      {onglet === 'recap' && commande && (
        <div>
          <div style={{ background:'#052e16', border:'1px solid #166534', borderRadius:12, padding:20, marginBottom:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:14, color:'#4ade80', fontWeight:600, marginBottom:4 }}>✅ Commande prête — {commande.operateur}</div>
                <div style={{ fontSize:13, color:'#86efac' }}>Mois : {commande.mois} · Valeur : {commande.valeurFace.toFixed(2)}€ · {commande.lignes.filter(l=>l.actif).length} travailleurs</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:28, fontWeight:800, color:'#4ade80' }}>{commande.totaux.total.toFixed(2)} €</div>
                <div style={{ fontSize:12, color:'#86efac' }}>{commande.totaux.nbCheques} chèques</div>
              </div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
            {[
              { label:'Coût employeur', val:commande.totaux.totalEmp.toFixed(2)+' €', color:'#10b981' },
              { label:'Déductions travailleurs', val:commande.totaux.totalTrv.toFixed(2)+' €', color:'#f87171' },
              { label:'Total commande', val:commande.totaux.total.toFixed(2)+' €', color:'#f59e0b' },
            ].map(st => (
              <div key={st.label} style={{ background:'#111', border:'1px solid #222', borderRadius:10, padding:'14px 18px' }}>
                <div style={{ fontSize:20, fontWeight:700, color:st.color }}>{st.val}</div>
                <div style={{ fontSize:12, color:'#6b7280' }}>{st.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:12, overflow:'hidden', marginBottom:20 }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:'#0d0d0d' }}>
                {['Travailleur','Jours','Chèques','Part EMP','Part TRV','Total'].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'#6b7280', fontWeight:600, borderBottom:'1px solid #1e1e1e' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {commande.lignes.filter(l=>l.actif).map(l => (
                  <tr key={l.id} style={{ borderBottom:'1px solid #141414' }}>
                    <td style={{ padding:'10px 16px', fontWeight:500 }}>{l.nom} {l.prenom}</td>
                    <td style={{ padding:'10px 16px', color:'#6b7280' }}>{l.jours}</td>
                    <td style={{ padding:'10px 16px' }}>{l.jours} × {l.valeurFace.toFixed(2)}€</td>
                    <td style={{ padding:'10px 16px', color:'#10b981', fontWeight:600 }}>{l.totalEmp.toFixed(2)} €</td>
                    <td style={{ padding:'10px 16px', color:'#f87171' }}>-{l.totalTrv.toFixed(2)} €</td>
                    <td style={{ padding:'10px 16px', fontWeight:700 }}>{l.totalCommande.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background:'#111', border:'1px solid #1e3a5f', borderRadius:10, padding:16, fontSize:13, color:'#94a3b8' }}>
            💡 <strong style={{ color:'#3b82f6' }}>Prochaine étape :</strong> Connecter au portail {commande.operateur} pour transmission électronique automatique. Disponible dans une prochaine mise à jour.
          </div>
        </div>
      )}

      {/* ─── ONGLET HISTORIQUE ─── */}
      {onglet === 'historique' && (
        <div style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #1e1e1e', fontWeight:600 }}>Historique des commandes</div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:'#0d0d0d' }}>
              {['Mois','Opérateur','Valeur','Total','Travailleurs','Statut'].map(h=>(
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'#6b7280', fontWeight:600, borderBottom:'1px solid #1e1e1e' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {historique.map((h,i) => (
                <tr key={i} style={{ borderBottom:'1px solid #141414' }}>
                  <td style={{ padding:'10px 16px', fontWeight:500 }}>{h.mois}</td>
                  <td style={{ padding:'10px 16px' }}>{h.operateur}</td>
                  <td style={{ padding:'10px 16px' }}>{h.valeur.toFixed(2)} €</td>
                  <td style={{ padding:'10px 16px', fontWeight:700 }}>{h.total.toFixed(2)} €</td>
                  <td style={{ padding:'10px 16px', color:'#6b7280' }}>{h.nbEmp}</td>
                  <td style={{ padding:'10px 16px' }}><span style={{ background:'#052e16', color:'#4ade80', borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:700 }}>{h.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── ONGLET LÉGAL ─── */}
      {onglet === 'legal' && (
        <div style={{ display:'grid', gap:16, maxWidth:700 }}>
          {[
            { titre:'Plafonds légaux 2024', contenu:[
              'Valeur faciale maximum : 8.00 €/jour',
              'Part patronale maximum : 6.91 €/jour',
              'Part travailleur minimum : 1.09 €/jour',
              'Octroi conditionnel : min 1 heure de travail effectif par jour',
            ]},
            { titre:'Conditions d\'exonération', contenu:[
              'Exonéré ONSS et PP si valeur ≤ 8.00€/jour',
              'Doit être prévu par CCT sectorielle, CCT entreprise ou contrat individuel',
              'Non convertible en espèces',
              'Nominatif par travailleur',
              'Valable minimum 12 mois',
            ]},
            { titre:'Base légale', contenu:[
              'Loi du 3 juillet 2005 (art. 19bis AR 28/11/1969)',
              'AR du 9 mars 2006 fixant les modalités',
              'Circulaire ONSS 2024/C-3 — plafonds actualisés',
            ]},
          ].map(sec => (
            <div key={sec.titre} style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:12, padding:20 }}>
              <div style={{ fontWeight:700, marginBottom:12, color:'#10b981' }}>{sec.titre}</div>
              {sec.contenu.map((c,i) => <div key={i} style={{ fontSize:13, color:'#94a3b8', marginBottom:6, paddingLeft:12, borderLeft:'2px solid #1e1e1e' }}>• {c}</div>)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
