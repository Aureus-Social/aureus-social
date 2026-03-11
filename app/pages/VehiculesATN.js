'use client';
import { TX_ONSS_E } from '@/app/lib/helpers';
// ATN Voiture de société — Art. 36 CIR/92 + AR CO2 2026
import { useState, useMemo } from 'react';
import { C, fmt, TX_ONSS_W } from '@/app/lib/helpers';
const GOLD='#c6a34e',GREEN='#22c55e',BLUE='#60a5fa',RED='#ef4444';

const TAUX_REF_CO2 = { essence: 91, diesel: 75, hybride: 78, electrique: 0 };

function calcATN(valCatalogue, co2, carburant, ageAns) {
  if (!valCatalogue) return { atn: 0, coefCO2: 0, atnAnnuel: 0, cotisationCO2: 0 };
  const tauxRef = TAUX_REF_CO2[carburant] || 91;
  const ecartCO2 = co2 - tauxRef;
  let coefBase = 5.5;
  if (co2 <= tauxRef) coefBase = Math.max(4, 5.5 - (tauxRef - co2) * 0.1);
  else coefBase = Math.min(18, 5.5 + ecartCO2 * 0.1);
  if (carburant === 'electrique') coefBase = 4;
  const depreciation = Math.max(0.7, 1 - Math.min(ageAns, 5) * 0.06);
  const baseATN = valCatalogue * coefBase / 100 * depreciation;
  const atnAnnuel = Math.max(1600, Math.round(baseATN));
  const atn = Math.round(atnAnnuel / 12 * 100) / 100;
  // Cotisation CO2 patronale mensuelle
  const cotCO2Base = co2 <= 0 ? 0 : carburant === 'electrique' ? 0
    : Math.max(0, (co2 - tauxRef) * 12 + 30);
  const cotisationCO2 = Math.round(Math.max(0, cotCO2Base) * 100) / 100;
  return { atn, coefCO2: coefBase, atnAnnuel, cotisationCO2 };
}

export default function VehiculesATN({ s, d }) {
  s = s || { emps: [], co: {} };
  const [tab, setTab] = useState('calculateur');
  const [f, setF] = useState({
    valCatalogue: 35000, co2: 95, carburant: 'essence', ageAns: 0,
    empId: (s.emps||[])[0]?.id || ''
  });

  const calc = useMemo(() => calcATN(f.valCatalogue, f.co2, f.carburant, f.ageAns), [f]);
  const emp = (s.emps||[]).find(e=>e.id===f.empId)||(s.emps||[])[0];
  const brut = emp?.monthlySalary || 3000;
  const onssATN = Math.round(calc.atn * TX_ONSS_W * 100) / 100;
  const ppATN = Math.round(calc.atn * 0.26 * 100) / 100;
  const coutNetTrav = Math.round((onssATN + ppATN) * 100) / 100;
  const coutTotalEmployeur = Math.round((calc.cotisationCO2 + calc.atn * TX_ONSS_E) * 100) / 100;

  // Simuler flotte
  const flotte = useMemo(() => (s.emps||[]).filter(e=>e.voiture).map(e => {
    const c = calcATN(e.valCatalogue||35000, e.co2||95, e.carburant||'essence', e.ageVehicule||0);
    return { ...e, ...c };
  }), [s.emps]);

  return (
    <div>
      <div style={{marginBottom:20}}>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:'#e8e6e0',margin:0}}>Véhicules & ATN</h1>
        <div style={{fontSize:10,color:'#5e5c56',marginTop:3}}>Art. 36 CIR/92 · Cotisation CO₂ · Avantage de toute nature voiture société</div>
      </div>

      <div style={{display:'flex',gap:4,marginBottom:16}}>
        {[{k:'calculateur',l:'Calculateur ATN'},{k:'flotte',l:'Gestion flotte'},{k:'regles',l:'Règles légales 2026'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:11,fontWeight:tab===t.k?700:400,background:tab===t.k?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.k?GOLD:'#5e5c56'}}>{t.l}</button>
        ))}
      </div>

      {tab === 'calculateur' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <C style={{padding:'20px 22px'}}>
            <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14}}>🚗 Paramètres véhicule</div>
            {[
              ['Valeur catalogue (€)', 'number', 'valCatalogue', 1, 200000, 1000],
              ['Émissions CO₂ (g/km)', 'number', 'co2', 0, 400, 1],
              ['Âge véhicule (ans)', 'number', 'ageAns', 0, 15, 1],
            ].map(([l,t,k,min,max,step])=>(
              <div key={k} style={{marginBottom:12}}>
                <label style={{fontSize:10,color:'#5e5c56',display:'block',marginBottom:4}}>{l}</label>
                <input type={t} min={min} max={max} step={step} value={f[k]}
                  onChange={e=>setF(prev=>({...prev,[k]:+e.target.value}))}
                  style={{width:'100%',padding:'8px 10px',borderRadius:7,border:'1px solid rgba(198,163,78,.15)',background:'#0a0908',color:'#d4d0c8',fontSize:12}}/>
              </div>
            ))}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:10,color:'#5e5c56',display:'block',marginBottom:4}}>Type de carburant</label>
              <select value={f.carburant} onChange={e=>setF(p=>({...p,carburant:e.target.value}))}
                style={{width:'100%',padding:'8px 10px',borderRadius:7,border:'1px solid rgba(198,163,78,.15)',background:'#0a0908',color:'#d4d0c8',fontSize:12}}>
                <option value='essence'>Essence / LPG</option>
                <option value='diesel'>Diesel</option>
                <option value='hybride'>Hybride rechargeable</option>
                <option value='electrique'>⚡ 100% Électrique</option>
              </select>
            </div>
          </C>

          <C style={{padding:'20px 22px'}}>
            <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14}}>📊 Résultats ATN 2026</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
              {[
                {l:'ATN mensuel',v:fmt(calc.atn),c:RED,sub:'Imposable travailleur'},
                {l:'ATN annuel',v:fmt(calc.atnAnnuel),c:RED,sub:`Min. 1.600 €/an`},
                {l:'Coeff. CO₂',v:`${calc.coefCO2.toFixed(1)}%`,c:GOLD,sub:`Taux ref: ${TAUX_REF_CO2[f.carburant]}g CO₂`},
                {l:'Cotis. CO₂ patron',v:fmt(calc.cotisationCO2)+'/mois',c:BLUE,sub:'Cotisation mensuelle'},
              ].map(k=>(
                <div key={k.l} style={{padding:'12px',background:'rgba(255,255,255,.02)',border:'1px solid rgba(139,115,60,.08)',borderRadius:9}}>
                  <div style={{fontSize:9,color:'#5e5c56'}}>{k.l}</div>
                  <div style={{fontSize:16,fontWeight:700,color:k.c,marginTop:3}}>{k.v}</div>
                  <div style={{fontSize:9,color:'#5e5c56',marginTop:2}}>{k.sub}</div>
                </div>
              ))}
            </div>
            <div style={{padding:'12px 14px',background:'rgba(239,68,68,.05)',border:'1px solid rgba(239,68,68,.1)',borderRadius:8,marginBottom:10}}>
              <div style={{fontSize:10,color:'#f87171',fontWeight:600,marginBottom:6}}>Impact travailleur (mensuel)</div>
              <div style={{fontSize:10,color:'#9e9b93'}}>ONSS sur ATN: <strong style={{color:RED}}>-{fmt(onssATN)}</strong></div>
              <div style={{fontSize:10,color:'#9e9b93',marginTop:3}}>PP sur ATN ~26%: <strong style={{color:RED}}>-{fmt(ppATN)}</strong></div>
              <div style={{fontSize:11,color:'#f87171',fontWeight:700,marginTop:6}}>Coût net mensuel travailleur: -{fmt(coutNetTrav)}</div>
            </div>
            <div style={{padding:'12px 14px',background:`${BLUE}08`,border:`1px solid ${BLUE}15`,borderRadius:8}}>
              <div style={{fontSize:10,color:BLUE,fontWeight:600,marginBottom:4}}>Coût total mensuel employeur</div>
              <div style={{fontSize:14,fontWeight:700,color:BLUE}}>{fmt(coutTotalEmployeur + calc.cotisationCO2)} / mois</div>
              <div style={{fontSize:9,color:'#5e5c56',marginTop:3}}>ONSS patronal ATN + cotisation CO₂</div>
            </div>
          </C>
        </div>
      )}

      {tab === 'flotte' && (
        <C style={{padding:'20px 22px'}}>
          <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14}}>🚗 Flotte véhicules ({flotte.length} véhicule{flotte.length!==1?'s':''})</div>
          {flotte.length === 0 ? (
            <div style={{padding:30,textAlign:'center',color:'#5e5c56'}}>Aucun travailleur avec voiture de société (cocher "voiture" dans le dossier employé)</div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
              <thead><tr style={{borderBottom:'1px solid rgba(198,163,78,.15)'}}>
                {['Travailleur','Val. catalogue','CO₂','ATN/mois','ATN/an','Cotis. CO₂'].map(h=>(
                  <th key={h} style={{padding:'8px',textAlign:'left',fontSize:9,color:'#5e5c56',textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {flotte.map((e,i)=>(
                  <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>
                    <td style={{padding:'8px',fontWeight:600}}>{e.first||e.fn||''} {e.last||e.ln||''}</td>
                    <td style={{padding:'8px'}}>{fmt(e.valCatalogue||35000)}</td>
                    <td style={{padding:'8px',color:e.co2>100?RED:GREEN}}>{e.co2||95}g</td>
                    <td style={{padding:'8px',color:RED,fontWeight:600}}>{fmt(e.atn)}</td>
                    <td style={{padding:'8px',color:RED}}>{fmt(e.atnAnnuel)}</td>
                    <td style={{padding:'8px',color:BLUE}}>{fmt(e.cotisationCO2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </C>
      )}

      {tab === 'regles' && (
        <C style={{padding:'20px 22px'}}>
          <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14}}>⚖️ Règles légales ATN 2026</div>
          {[
            {t:'Formule ATN',d:'ATN = Val. catalogue neuve × Coeff. CO₂ (%) × (1 - 6% par année d\'âge, max 30%)',ref:'Art. 36 CIR/92'},
            {t:'Plancher ATN',d:'Minimum 1.600 EUR/an (ajusté annuellement — montant 2026)',ref:'AR 25/04/2022'},
            {t:'Taux référence essence',d:'91g CO₂/km → coefficient de base 5,5%',ref:'AR CO₂ 2026'},
            {t:'Taux référence diesel',d:'75g CO₂/km → coefficient de base 5,5%',ref:'AR CO₂ 2026'},
            {t:'Véhicule 100% électrique',d:'CO₂ = 0 → coefficient minimum 4% · Plancher ATN identique',ref:'Art. 36 §2 CIR/92'},
            {t:'Cotisation CO₂',d:'Cotisation mensuelle patronale calculée sur les émissions réelles',ref:'AR 27/12/2004'},
            {t:'Impact ONSS',d:'ATN soumis à ONSS travailleur (13,07%) + ONSS patronal (~25%)',ref:'LSS Art. 19'},
            {t:'Impact PP',d:'ATN ajouté au salaire imposable → PP calculé sur base élargie',ref:'AR Précompte 2026'},
          ].map((r,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <div><div style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{r.t}</div><div style={{fontSize:10,color:'#5e5c56',marginTop:2}}>{r.d}</div></div>
              <span style={{fontSize:9,color:GOLD,whiteSpace:'nowrap',marginLeft:14}}>{r.ref}</span>
            </div>
          ))}
        </C>
      )}
    </div>
  );
}
