'use client'
import { useState, useCallback } from 'react'

// ── Constantes légales belges 2024-2026 ──
const ONSS_TRV = 0.1307
const ONSS_PAT = 0.2507
const ONSS_AT  = 0.0097

const PP_TRANCHES = [
  { max: 1095,     taux: 0 },
  { max: 1945,     taux: 0.2625 },
  { max: 2800,     taux: 0.3220 },
  { max: 4300,     taux: 0.3475 },
  { max: Infinity, taux: 0.5000 },
]

const PP_REDUCTIONS = {
  isole: 38.00, chef_famille: 76.00, conjoint_revenus: 0, veuf: 57.00,
}

const CSS_TRANCHES = [
  { min:0,       max:1945.38, montant:0 },
  { min:1945.38, max:2190.18, montant:9.30 },
  { min:2190.18, max:6038.82, taux:0.0220 },
  { min:6038.82, max:Infinity,taux:0.0110 },
]

function calcPP(brutImposable, situation='isole') {
  const annuel = brutImposable * 12
  let pp = 0
  for (const t of PP_TRANCHES) {
    if (annuel <= t.max) { pp = annuel * t.taux; break }
  }
  pp -= (PP_REDUCTIONS[situation] || 0) * 12
  return Math.max(0, Math.round((pp / 12) * 100) / 100)
}

function calcCSS(brut) {
  for (const t of CSS_TRANCHES) {
    if (brut >= t.min && brut < t.max) {
      return t.montant ?? Math.round(brut * t.taux * 100) / 100
    }
  }
  return 0
}

// ── Brut → Net (direct) ──
function brutToNet(brut, regime=100, situation='isole', enfants=0) {
  const brutR = Math.round(brut * (regime/100) * 100) / 100
  const onssW = Math.round(brutR * ONSS_TRV * 100) / 100
  const brutImp = brutR - onssW
  const bonusEmploi = calcBonusEmploi(brutR)
  let pp = calcPP(brutImp, situation)
  pp -= bonusEmploi
  pp -= enfants * 38 / 12
  pp = Math.max(0, Math.round(pp * 100) / 100)
  const css = calcCSS(brutImp)
  const net = Math.round((brutImp - pp - css) * 100) / 100
  const onssE = Math.round(brutR * ONSS_PAT * 100) / 100
  const at = Math.round(brutR * ONSS_AT * 100) / 100
  const coutEmpl = Math.round((brutR + onssE + at) * 100) / 100
  return { brutR, onssW, brutImp, pp, css, net, onssE, at, coutEmpl, bonusEmploi }
}

function calcBonusEmploi(brut) {
  if (brut <= 1945) return Math.round(brut * 0.2860 * 100) / 100
  if (brut <= 2600) return Math.round((556.87 - (brut - 1945) * 0.2860) * 100) / 100
  return 0
}

// ── Net → Brut (bisection numérique) ──
function netToBrut(targetNet, regime=100, situation='isole', enfants=0, precision=0.01) {
  let lo = targetNet, hi = targetNet * 2.5
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    const res = brutToNet(mid, regime, situation, enfants)
    if (Math.abs(res.net - targetNet) < precision) return { brut: Math.round(mid*100)/100, ...brutToNet(mid, regime, situation, enfants) }
    if (res.net < targetNet) lo = mid; else hi = mid
  }
  const brut = Math.round(((lo+hi)/2)*100)/100
  return { brut, ...brutToNet(brut, regime, situation, enfants) }
}

const SITUATIONS = [
  { id:'isole', label:'Isolé(e)' },
  { id:'chef_famille', label:'Chef de famille' },
  { id:'conjoint_revenus', label:'Conjoint avec revenus' },
  { id:'veuf', label:'Veuf/Veuve' },
]

export default function NetAuBrut({ state, dispatch }) {
  const [mode, setMode] = useState('brut_net') // 'brut_net' | 'net_brut'
  const [montant, setMontant] = useState('')
  const [regime, setRegime] = useState(100)
  const [situation, setSituation] = useState('isole')
  const [enfants, setEnfants] = useState(0)
  const [result, setResult] = useState(null)
  const [compare, setCompare] = useState([])

  const s = { background:'#0a0a0a', color:'#f1f5f9', minHeight:'100vh', padding:'24px', fontFamily:'Inter,system-ui,sans-serif' }
  const btn = (v='primary',active=true) => ({ background:v==='primary'?'#f59e0b':v==='ghost'?'transparent':'#1f2937', color:v==='primary'?'#000':'#f1f5f9', border:v==='ghost'?'1px solid #374151':'none', borderRadius:8, padding:'10px 20px', fontWeight:600, cursor:'pointer', fontSize:14, opacity:active?1:.6 })
  const inp = { background:'#0d0d0d', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 14px', color:'#f1f5f9', fontSize:14, boxSizing:'border-box' }
  const lbl = { display:'block', fontSize:12, color:'#6b7280', marginBottom:4, fontWeight:500 }

  function calculate() {
    const val = parseFloat(montant)
    if (!val || val <= 0) return
    const r = mode==='brut_net' ? brutToNet(val, regime, situation, enfants) : netToBrut(val, regime, situation, enfants)
    setResult({ mode, input:val, regime, situation, enfants, ...r })
  }

  function addToCompare() {
    if (!result) return
    setCompare(p => [...p.slice(-4), { ...result, label: `${result.mode==='brut_net'?result.brutR:result.brut}€ brut` }])
  }

  const Row = ({ label, val, color, sub, big }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #141414' }}>
      <div>
        <div style={{ fontSize: big?14:13, color: sub?'#6b7280':'#f1f5f9', fontWeight: big?700:400 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:'#4b5563' }}>{sub}</div>}
      </div>
      <div style={{ fontSize: big?18:14, fontWeight: big?800:600, color: color||'#f1f5f9' }}>
        {typeof val === 'number' ? val.toLocaleString('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €' : val}
      </div>
    </div>
  )

  return (
    <div style={s}>
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <span style={{ fontSize:28 }}>⚖️</span>
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:700 }}>Net au Brut / Brut au Net</h1>
            <p style={{ margin:0, fontSize:13, color:'#6b7280' }}>Calcul inverse précis — droit social belge 2024-2026</p>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, maxWidth:900 }}>
        {/* Panel gauche - inputs */}
        <div>
          {/* Mode switch */}
          <div style={{ display:'flex', gap:2, background:'#111', borderRadius:10, padding:4, marginBottom:20 }}>
            {[['brut_net','💰 Brut → Net'],['net_brut','🎯 Net → Brut']].map(([id,label])=>(
              <button key={id} onClick={()=>{ setMode(id); setResult(null) }} style={{ flex:1, background:mode===id?'#1f2937':'transparent', color:mode===id?'#f59e0b':'#6b7280', border:'none', borderRadius:8, padding:'10px', cursor:'pointer', fontWeight:mode===id?700:400, fontSize:13 }}>{label}</button>
            ))}
          </div>

          <div style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:12, padding:20 }}>
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>{mode==='brut_net' ? 'Salaire brut mensuel (€)' : 'Salaire net souhaité (€)'}</label>
              <input type="number" step="0.01" style={{ ...inp, width:'100%', fontSize:20, fontWeight:700, padding:'14px' }}
                value={montant} onChange={e=>setMontant(e.target.value)}
                placeholder={mode==='brut_net'?'Ex: 3500':'Ex: 2500'}
                onKeyDown={e=>e.key==='Enter'&&calculate()} />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              <div>
                <label style={lbl}>Régime de travail</label>
                <select style={{ ...inp, width:'100%' }} value={regime} onChange={e=>setRegime(parseInt(e.target.value))}>
                  {[100,90,80,75,60,50].map(r=><option key={r} value={r}>{r}% — {r===100?'Temps plein':'Temps partiel'}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Situation familiale</label>
                <select style={{ ...inp, width:'100%' }} value={situation} onChange={e=>setSituation(e.target.value)}>
                  {SITUATIONS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={lbl}>Enfants à charge</label>
              <div style={{ display:'flex', gap:8 }}>
                {[0,1,2,3,4,5].map(n=>(
                  <button key={n} onClick={()=>setEnfants(n)} style={{ background:enfants===n?'#f59e0b20':'#0d0d0d', border:`1px solid ${enfants===n?'#f59e0b':'#2a2a2a'}`, borderRadius:8, padding:'8px 14px', color:enfants===n?'#f59e0b':'#9ca3af', cursor:'pointer', fontWeight:enfants===n?700:400, fontSize:13 }}>{n}</button>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={calculate} style={{ ...btn('primary'), flex:1 }}>
                {mode==='brut_net' ? '→ Calculer le net' : '→ Calculer le brut'}
              </button>
              {result && <button onClick={addToCompare} style={btn('secondary')}>+ Comparer</button>}
            </div>
          </div>
        </div>

        {/* Panel droit - résultat */}
        <div>
          {!result ? (
            <div style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:12, padding:40, textAlign:'center', color:'#4b5563' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>⚖️</div>
              <div style={{ fontSize:14 }}>Entrez un montant et calculez</div>
            </div>
          ) : (
            <div style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:12, padding:20 }}>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, color:'#6b7280', marginBottom:4 }}>
                  {result.mode==='brut_net'?'BRUT MENSUEL':'NET CIBLE'}
                </div>
                <div style={{ fontSize:28, fontWeight:800, color:'#f59e0b' }}>
                  {(result.mode==='brut_net'?result.brutR:result.input).toLocaleString('fr-BE',{minimumFractionDigits:2})} €
                </div>
                <div style={{ fontSize:12, color:'#6b7280' }}>
                  {SITUATIONS.find(s=>s.id===result.situation)?.label} · {result.regime}% · {result.enfants} enfant(s)
                </div>
              </div>

              <div>
                <Row label="Brut mensuel" val={result.mode==='brut_net'?result.brutR:result.brut} />
                <Row label="ONSS travailleur (13.07%)" val={-result.onssW} color='#f87171' sub="Cotisation sociale" />
                <Row label="Brut imposable" val={result.brutImp} color='#94a3b8' />
                {result.bonusEmploi > 0 && <Row label="Bonus à l'emploi" val={result.bonusEmploi} color='#34d399' sub="Réduction PP" />}
                <Row label="Précompte professionnel" val={-result.pp} color='#f87171' sub={`${result.pp>0?((result.pp/result.brutImp)*100).toFixed(1):0}% du brut imposable`} />
                <Row label="Cotisation spéciale SS" val={-result.css} color='#f87171' sub="CSS mensuelle" />
                <Row label="SALAIRE NET" val={result.net} color='#4ade80' big />
                <div style={{ height:8 }} />
                <Row label="ONSS patronale (25.07%)" val={result.onssE} color='#94a3b8' sub="Charge employeur" />
                <Row label="Assurance accidents travail" val={result.at} color='#94a3b8' sub="0.97%" />
                <Row label="COÛT EMPLOYEUR TOTAL" val={result.coutEmpl} color='#f59e0b' big />
              </div>

              <div style={{ marginTop:12, padding:10, background:'#0d0d0d', borderRadius:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'#6b7280' }}>Taux net effectif</span>
                  <span style={{ fontWeight:700, color:'#4ade80' }}>{((result.net/(result.mode==='brut_net'?result.brutR:result.brut))*100).toFixed(1)}%</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginTop:4 }}>
                  <span style={{ color:'#6b7280' }}>Rapport net/coût employeur</span>
                  <span style={{ fontWeight:700, color:'#94a3b8' }}>{((result.net/result.coutEmpl)*100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tableau comparatif */}
      {compare.length > 0 && (
        <div style={{ marginTop:32 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ margin:0, fontSize:16, fontWeight:700 }}>📊 Comparatif</h2>
            <button onClick={()=>setCompare([])} style={{ ...btn('ghost'), padding:'6px 12px', fontSize:12 }}>Effacer</button>
          </div>
          <div style={{ background:'#111', border:'1px solid #1e1e1e', borderRadius:12, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:'#0d0d0d' }}>
                {['Brut','Net','ONSS Trv','PP','CSS','Coût EMP','Taux net'].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:11, color:'#6b7280', fontWeight:600, borderBottom:'1px solid #1e1e1e' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {compare.map((c,i)=>(
                  <tr key={i} style={{ borderBottom:'1px solid #141414' }}>
                    <td style={{ padding:'10px 16px', fontWeight:700, color:'#f59e0b' }}>{(c.mode==='brut_net'?c.brutR:c.brut).toFixed(2)} €</td>
                    <td style={{ padding:'10px 16px', fontWeight:700, color:'#4ade80' }}>{c.net.toFixed(2)} €</td>
                    <td style={{ padding:'10px 16px', color:'#f87171' }}>-{c.onssW.toFixed(2)} €</td>
                    <td style={{ padding:'10px 16px', color:'#f87171' }}>-{c.pp.toFixed(2)} €</td>
                    <td style={{ padding:'10px 16px', color:'#f87171' }}>-{c.css.toFixed(2)} €</td>
                    <td style={{ padding:'10px 16px', color:'#f59e0b' }}>{c.coutEmpl.toFixed(2)} €</td>
                    <td style={{ padding:'10px 16px', color:'#4ade80', fontWeight:600 }}>{((c.net/(c.mode==='brut_net'?c.brutR:c.brut))*100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
