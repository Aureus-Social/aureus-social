'use client'
import { useState, useCallback } from 'react'

// ─── CONSTANTES LÉGALES DECAVA ───────────────────────────────────────────────
// DECAVA = Déclaration de voiture à usage mixte (art. 19bis LCPSP)
// Taux déductibilité TVA selon usage professionnel réel ou forfait
const TAUX_FORFAIT = 0.35 // 35% forfait usage pro minimum
const TVA_TAUX = 0.21

const CARBURANTS = [
  { id: 'essence', label: 'Essence / Hybride essence', co2_ref: 115 },
  { id: 'diesel', label: 'Diesel / Hybride diesel', co2_ref: 95 },
  { id: 'electrique', label: 'Électrique (0 CO₂)', co2_ref: 0 },
  { id: 'gpl', label: 'GPL / CNG', co2_ref: 105 },
]

// Taux déductibilité CO₂ (ISOC + IPP) — barème fédéral 2024-2026
function tauxDeductibiliteCO2(co2, carburant) {
  if (carburant === 'electrique') return 1.00
  if (co2 === 0) return 1.00
  if (co2 <= 50) return 1.00
  if (co2 <= 100) return 0.90
  if (co2 <= 110) return 0.80
  if (co2 <= 120) return 0.75
  if (co2 <= 130) return 0.70
  if (co2 <= 140) return 0.65
  if (co2 <= 150) return 0.60
  if (co2 <= 160) return 0.55
  if (co2 <= 170) return 0.50
  if (co2 <= 180) return 0.40
  if (co2 <= 190) return 0.30
  if (co2 <= 200) return 0.25
  return 0.40 // minimum
}

function calcDecava(data) {
  const {
    valeurVehicule, kmTotal, kmPro, kmDomicileTravail,
    carburant, co2, tvaAchat, tvaEntretien, tvaCarburant,
    methode, tauxProManuel
  } = data

  const kmProNum = parseFloat(kmPro) || 0
  const kmTotalNum = parseFloat(kmTotal) || 0
  const kmDTNum = parseFloat(kmDomicileTravail) || 0

  // Usage professionnel réel
  const tauxProReel = kmTotalNum > 0 ? kmProNum / kmTotalNum : 0
  // Domicile-travail compte à 50% comme pro pour TVA
  const tauxProTVA = kmTotalNum > 0 ? (kmProNum + kmDTNum * 0.50) / kmTotalNum : 0

  const tauxPro = methode === 'reel'
    ? Math.min(tauxProTVA, 1)
    : methode === 'manuel'
    ? (parseFloat(tauxProManuel) || 0) / 100
    : TAUX_FORFAIT

  // Déductibilité CO₂ pour frais
  const tauxCO2 = tauxDeductibiliteCO2(parseFloat(co2) || 0, carburant)

  // TVA récupérable
  const tvaAchatNum = parseFloat(tvaAchat) || 0
  const tvaEntretienNum = parseFloat(tvaEntretien) || 0
  const tvaCarburantNum = parseFloat(tvaCarburant) || 0

  // Max 50% TVA véhicule usage mixte (règle absolue belge)
  const tvaRecupAchat = Math.min(tvaAchatNum * tauxPro, tvaAchatNum * 0.50)
  const tvaRecupEntretien = Math.min(tvaEntretienNum * tauxPro, tvaEntretienNum * 0.50)
  const tvaRecupCarburant = carburant === 'electrique'
    ? tvaCarburantNum * tauxPro
    : Math.min(tvaCarburantNum * tauxPro, tvaCarburantNum * 0.50)

  const totalTVARecup = tvaRecupAchat + tvaRecupEntretien + tvaRecupCarburant

  // ATN (Avantage en Nature) conducteur si véhicule société
  const valeurNum = parseFloat(valeurVehicule) || 0
  const co2Num = parseFloat(co2) || 0
  let pourcentageATN = 0.055 // base 5.5%
  if (carburant === 'electrique') pourcentageATN = 0.04
  else if (co2Num > 0) {
    // Formule officielle SPF Finances
    const base = carburant === 'diesel' ? 0.055 : 0.055
    const ajustement = (co2Num - (carburant === 'diesel' ? 87 : 107)) * 0.001
    pourcentageATN = Math.max(0.04, Math.min(0.18, base + ajustement))
  }
  const atnAnnuel = valeurNum * 6/7 * pourcentageATN * 1.00

  // Frais déductibles ISOC
  const fraisVehicule = (parseFloat(data.fraisTotal) || 0)
  const fraisDeduc = fraisVehicule * tauxCO2

  return {
    tauxPro: (tauxPro * 100).toFixed(1),
    tauxCO2: (tauxCO2 * 100).toFixed(0),
    tvaRecupAchat: tvaRecupAchat.toFixed(2),
    tvaRecupEntretien: tvaRecupEntretien.toFixed(2),
    tvaRecupCarburant: tvaRecupCarburant.toFixed(2),
    totalTVARecup: totalTVARecup.toFixed(2),
    atnAnnuel: atnAnnuel.toFixed(2),
    atnMensuel: (atnAnnuel / 12).toFixed(2),
    pourcentageATN: (pourcentageATN * 100).toFixed(1),
    fraisDeduc: fraisDeduc.toFixed(2),
  }
}

export default function Decava({ state, dispatch }) {
  const [data, setData] = useState({
    valeurVehicule: '', co2: '', carburant: 'essence',
    kmTotal: '', kmPro: '', kmDomicileTravail: '',
    tvaAchat: '', tvaEntretien: '', tvaCarburant: '',
    fraisTotal: '', methode: 'forfait', tauxProManuel: ''
  })
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState('calcul')

  const s = { background: '#0a0a0a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter,system-ui,sans-serif', padding: 24 }
  const card = { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: 20, marginBottom: 16 }
  const input = { background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#f1f5f9', width: '100%', fontSize: 14, boxSizing: 'border-box' }
  const lbl = { display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: 500 }
  const btn = (v = 'primary') => ({ background: v === 'primary' ? '#f59e0b' : '#1f2937', color: v === 'primary' ? '#000' : '#f1f5f9', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 })
  const badge = (c) => ({ background: c + '20', color: c, border: `1px solid ${c}40`, borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 700 })

  function set(k, v) { setData(p => ({ ...p, [k]: v })) }

  function calculate() {
    const r = calcDecava(data)
    setResult(r)
    setTab('result')
  }

  const tabStyle = (active) => ({
    padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
    background: active ? '#f59e0b' : 'transparent',
    color: active ? '#000' : '#9ca3af',
    border: 'none'
  })

  return (
    <div style={s}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>🚗</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>DECAVA — Véhicules Mixtes</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Récupération TVA · ATN · Déductibilité CO₂ · Art. 19bis LCPSP</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {[['calcul','🔧 Calcul'],['guide','📖 Guide légal']].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={tabStyle(tab === id)}>{label}</button>
          ))}
          {result && <button onClick={() => setTab('result')} style={tabStyle(tab === 'result')}>📊 Résultats</button>}
        </div>
      </div>

      {/* ONGLET CALCUL */}
      {tab === 'calcul' && (
        <div style={{ maxWidth: 680 }}>
          {/* Véhicule */}
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#f59e0b' }}>🚗 Données véhicule</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Valeur catalogue TVAC (€)</label>
                <input style={input} type="number" value={data.valeurVehicule} onChange={e => set('valeurVehicule', e.target.value)} placeholder="Ex: 35000" />
              </div>
              <div>
                <label style={lbl}>Émissions CO₂ (g/km)</label>
                <input style={input} type="number" value={data.co2} onChange={e => set('co2', e.target.value)} placeholder="Ex: 120" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Type de carburant</label>
                <select style={input} value={data.carburant} onChange={e => set('carburant', e.target.value)}>
                  {CARBURANTS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Kilométrage */}
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#3b82f6' }}>📍 Kilométrage annuel</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>Total km/an</label>
                <input style={input} type="number" value={data.kmTotal} onChange={e => set('kmTotal', e.target.value)} placeholder="Ex: 25000" />
              </div>
              <div>
                <label style={lbl}>Km professionnels</label>
                <input style={input} type="number" value={data.kmPro} onChange={e => set('kmPro', e.target.value)} placeholder="Ex: 10000" />
              </div>
              <div>
                <label style={lbl}>Km domicile-travail</label>
                <input style={input} type="number" value={data.kmDomicileTravail} onChange={e => set('kmDomicileTravail', e.target.value)} placeholder="Ex: 5000" />
              </div>
            </div>
          </div>

          {/* Méthode calcul usage pro */}
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#10b981' }}>⚖️ Méthode usage professionnel</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              {[['forfait','Forfait 35%'],['reel','Réel (km)'],['manuel','Manuel']].map(([v,l]) => (
                <button key={v} onClick={() => set('methode', v)} style={{
                  ...btn(data.methode === v ? 'primary' : 'secondary'),
                  padding: '8px 14px', fontSize: 13
                }}>{l}</button>
              ))}
            </div>
            {data.methode === 'manuel' && (
              <div>
                <label style={lbl}>Taux usage professionnel (%)</label>
                <input style={{ ...input, width: 150 }} type="number" min="0" max="100" value={data.tauxProManuel} onChange={e => set('tauxProManuel', e.target.value)} placeholder="Ex: 60" />
              </div>
            )}
            {data.methode === 'reel' && data.kmTotal && data.kmPro && (
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>
                Taux calculé : {((parseFloat(data.kmPro) + parseFloat(data.kmDomicileTravail||0)*0.5) / parseFloat(data.kmTotal) * 100).toFixed(1)}%
              </div>
            )}
          </div>

          {/* TVA */}
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#8b5cf6' }}>🧾 TVA payée (€)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div>
                <label style={lbl}>TVA achat véhicule</label>
                <input style={input} type="number" step="0.01" value={data.tvaAchat} onChange={e => set('tvaAchat', e.target.value)} placeholder="Ex: 6174" />
              </div>
              <div>
                <label style={lbl}>TVA entretien/réparations</label>
                <input style={input} type="number" step="0.01" value={data.tvaEntretien} onChange={e => set('tvaEntretien', e.target.value)} placeholder="Ex: 420" />
              </div>
              <div>
                <label style={lbl}>TVA carburant/énergie</label>
                <input style={input} type="number" step="0.01" value={data.tvaCarburant} onChange={e => set('tvaCarburant', e.target.value)} placeholder="Ex: 840" />
              </div>
            </div>
          </div>

          {/* Frais total */}
          <div style={card}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#ef4444' }}>💰 Frais véhicule HTVA (déductibilité ISOC)</h3>
            <div>
              <label style={lbl}>Total frais annuels HTVA (€) — carburant + entretien + assurance + financement...</label>
              <input style={{ ...input, width: 250 }} type="number" step="0.01" value={data.fraisTotal} onChange={e => set('fraisTotal', e.target.value)} placeholder="Ex: 8500" />
            </div>
          </div>

          <button onClick={calculate} style={{ ...btn('primary'), width: '100%', padding: '14px', fontSize: 16 }}>
            Calculer la récupération TVA & ATN →
          </button>
        </div>
      )}

      {/* ONGLET RÉSULTATS */}
      {tab === 'result' && result && (
        <div style={{ maxWidth: 680 }}>
          {/* Résumé */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'TVA totale récupérable', value: `${result.totalTVARecup} €`, color: '#10b981' },
              { label: 'ATN annuel travailleur', value: `${result.atnAnnuel} €`, color: '#f59e0b' },
              { label: 'Frais déductibles ISOC', value: `${result.fraisDeduc} €`, color: '#3b82f6' },
            ].map(item => (
              <div key={item.label} style={{ ...card, marginBottom: 0, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Détail TVA */}
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#10b981' }}>🧾 Détail récupération TVA</h3>
            <div style={{ display: 'flex', gap: 20, marginBottom: 14, fontSize: 13, color: '#6b7280' }}>
              <span>Usage pro : <b style={{ color: '#f1f5f9' }}>{result.tauxPro}%</b></span>
              <span>Taux CO₂ : <b style={{ color: '#f1f5f9' }}>{result.tauxCO2}%</b></span>
            </div>
            {[
              ['TVA achat véhicule (max 50%)', result.tvaRecupAchat],
              ['TVA entretien/réparations (max 50%)', result.tvaRecupEntretien],
              ['TVA carburant/énergie', result.tvaRecupCarburant],
            ].map(([l,v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1a1a1a', fontSize: 14 }}>
                <span style={{ color: '#9ca3af' }}>{l}</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>{v} €</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 15, fontWeight: 800 }}>
              <span>TOTAL TVA RÉCUPÉRABLE</span>
              <span style={{ color: '#10b981' }}>{result.totalTVARecup} €</span>
            </div>
          </div>

          {/* ATN */}
          <div style={card}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#f59e0b' }}>🚗 ATN — Avantage en Nature travailleur</h3>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
              Taux ATN appliqué : <b style={{ color: '#f1f5f9' }}>{result.pourcentageATN}%</b> de la valeur catalogue × 6/7
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ ...card, flex: 1, marginBottom: 0, textAlign: 'center', background: '#0d0d0d' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{result.atnMensuel} €/mois</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>ATN mensuel à déclarer</div>
              </div>
              <div style={{ ...card, flex: 1, marginBottom: 0, textAlign: 'center', background: '#0d0d0d' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{result.atnAnnuel} €/an</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>ATN annuel (fiche 281.10)</div>
              </div>
            </div>
          </div>

          {/* Frais ISOC */}
          <div style={card}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: '#3b82f6' }}>💼 Déductibilité ISOC/IPP</h3>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
              Taux CO₂ appliqué : <b style={{ color: '#f1f5f9' }}>{result.tauxCO2}%</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: '#9ca3af' }}>Frais totaux HTVA</span>
              <span>{data.fraisTotal || 0} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 8, fontWeight: 700 }}>
              <span style={{ color: '#9ca3af' }}>Frais déductibles</span>
              <span style={{ color: '#3b82f6' }}>{result.fraisDeduc} €</span>
            </div>
          </div>

          <button onClick={() => { setResult(null); setTab('calcul') }} style={{ ...btn('secondary'), marginRight: 10 }}>Nouveau calcul</button>
        </div>
      )}

      {/* ONGLET GUIDE LÉGAL */}
      {tab === 'guide' && (
        <div style={{ maxWidth: 680 }}>
          {[
            { titre: '📌 Règle des 50% — TVA véhicule mixte', couleur: '#f59e0b', texte: 'Un véhicule "mixte" (usage pro + privé) ne permet jamais de récupérer plus de 50% de la TVA, même si l\'usage professionnel réel dépasse 50%. Cette limite est absolue (CJCE C-434/10). L\'administration fiscale belge l\'applique strictement.' },
            { titre: '📊 Méthodes de calcul usage pro', couleur: '#3b82f6', texte: 'Méthode 1 — Forfait 35% : simple, sans journal de bord. Méthode 2 — Réel kilométrique : nécessite un journal de bord détaillé (date, trajet, km, motif). Le domicile-travail compte pour 50% en usage professionnel pour la TVA. Méthode 3 — Taux conventionnel par secteur d\'activité.' },
            { titre: '🚗 Calcul ATN — Formule officielle SPF Finances', couleur: '#10b981', texte: 'ATN = valeur catalogue × 6/7 × taux CO₂. Le taux CO₂ de base est 5,5% (essence, co2 = 107g) ou 5,5% (diesel, co2 = 87g). Ajustement : ±0,1% par gramme au-delà/en dessous. Min 4%, max 18%. L\'ATN est imposable dans le chef du travailleur (fiche 281.10 case 30).' },
            { titre: '🌿 Taux déductibilité CO₂ (ISOC)', couleur: '#8b5cf6', texte: '≤50g : 100% · ≤100g : 90% · ≤110g : 80% · ≤120g : 75% · ≤130g : 70% · ≤140g : 65% · ≤150g : 60% · ≤160g : 55% · ≤170g : 50% · ≤180g : 40% · ≤190g : 30% · ≤200g : 25% · >200g : 40% minimum. Électrique : 100%.' },
            { titre: '📋 Obligations DECAVA', couleur: '#ef4444', texte: 'Toute société mettant un véhicule à disposition d\'un travailleur ou dirigeant pour usage privé doit déclarer l\'ATN dans la fiche 281.10. L\'employeur doit retenir le précompte sur cet ATN. Journal de bord recommandé pour justifier le taux pro réel en cas de contrôle.' },
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
