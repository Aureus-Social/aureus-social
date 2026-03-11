'use client';
import { useState } from 'react';
import { useLang } from '../lib/lang-context';

function PH({title,sub}){return <div style={{marginBottom:16}}><div style={{fontSize:18,fontWeight:800,color:'#c6a34e',letterSpacing:'.3px'}}>{title}</div>{sub&&<div style={{fontSize:11,color:'#9e9b93',marginTop:2}}>{sub}</div>}</div>;}
function C({children,style}){return <div style={{padding:'16px 20px',background:'rgba(198,163,78,.03)',borderRadius:12,border:'1px solid rgba(198,163,78,.06)',marginBottom:14,...style}}>{children}</div>;}
function ST({children}){return <div style={{fontSize:13,fontWeight:700,color:'#c6a34e',marginBottom:10,paddingBottom:6,borderBottom:'1px solid rgba(198,163,78,.1)'}}>{children}</div>;}
function I({label,value,onChange,type='number',min,max,step}){return <div style={{marginBottom:10}}><div style={{fontSize:10,color:'#5e5c56',marginBottom:3,textTransform:'uppercase',letterSpacing:'.3px'}}>{label}</div><input type={type} value={value} min={min} max={max} step={step||1} onChange={e=>onChange(type==='number'?+e.target.value:e.target.value)} style={{width:'100%',padding:'8px 10px',borderRadius:6,border:'1px solid rgba(198,163,78,.15)',background:'rgba(198,163,78,.04)',color:'#e8e6e0',fontSize:13,fontFamily:'inherit',boxSizing:'border-box'}}/></div>;}
function Row({l,v,bold,color}){return <div style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><span style={{fontSize:12,color:'#9e9b93'}}>{l}</span><span style={{fontSize:12,fontWeight:bold?700:400,color:color||'#e8e6e0'}}>{v}</span></div>;}

// Taux CO2 2026 selon formule Art.36 CIR/92
function coefCO2(co2, fuel) {
  const ref = fuel === 'diesel' ? 65 : fuel === 'electrique' ? 0 : 84; // essence/hybride
  if (co2 <= 0) return 4.0; // électrique
  const base = 5.5 + (co2 - ref) * 0.1;
  return Math.min(Math.max(base, 4.0), 18.0);
}

function calcATN(valCat, co2, fuel, age) {
  const coef = coefCO2(co2, fuel) / 100;
  const reduction = Math.min(age * 0.06, 0.72); // 6%/an max 72% à 12 ans
  const baseAnn = valCat * coef * (1 - reduction);
  const atnAnn = Math.max(baseAnn, 1600); // minimum 1.600 EUR/an (2026)
  return { coef: coef * 100, atnAnn: Math.round(atnAnn * 100) / 100, atnMens: Math.round(atnAnn / 12 * 100) / 100 };
}

const EXEMPLES = [
  { label: 'BMW 320d (diesel)', valCat: 45000, co2: 118, fuel: 'diesel', age: 0 },
  { label: 'Tesla Model 3 (électrique)', valCat: 52000, co2: 0, fuel: 'electrique', age: 0 },
  { label: 'VW Golf 1.5 TSI (essence)', valCat: 32000, co2: 128, fuel: 'essence', age: 2 },
  { label: 'Volvo XC40 hybride', valCat: 55000, co2: 38, fuel: 'hybride', age: 1 },
];

export default function VehiculeATN({ s }) {
  const { tText } = useLang();
  const [tab, setTab] = useState('calc');
  const [valCat, setValCat] = useState(40000);
  const [co2, setCo2] = useState(110);
  const [fuel, setFuel] = useState('diesel');
  const [age, setAge] = useState(0);

  const r = calcATN(valCat, co2, fuel, age);
  const onssATN = Math.round(r.atnMens * 0.1307 * 100) / 100;
  const ppATN = Math.round(r.atnMens * 0.30 * 100) / 100; // approx
  const coutNet = Math.round((r.atnMens - onssATN - ppATN) * 100) / 100;

  const tabs = [{v:'calc',l:'Calculateur'},{v:'table',l:'Tableau comparatif'},{v:'legal',l:'Base légale'},{v:'electrique',l:'🔋 Électrique'}];

  return (
    <div>
      <PH title="Véhicules de Société & ATN" sub="Calcul avantage en nature — Art. 36 CIR/92 — Barème 2026" />
      <div style={{display:'flex',gap:6,marginBottom:16}}>
        {tabs.map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 14px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}
      </div>

      {tab==='calc'&&<div style={{display:'grid',gridTemplateColumns:'340px 1fr',gap:18}}>
        <C>
          <ST>Paramètres du véhicule</ST>
          <I label="Valeur catalogue (EUR TVAC)" value={valCat} onChange={setValCat} step={500} min={0}/>
          <I label="Émissions CO2 (g/km)" value={co2} onChange={setCo2} min={0} max={400}/>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:'#5e5c56',marginBottom:3,textTransform:'uppercase',letterSpacing:'.3px'}}>Carburant</div>
            <select value={fuel} onChange={e=>setFuel(e.target.value)} style={{width:'100%',padding:'8px 10px',borderRadius:6,border:'1px solid rgba(198,163,78,.15)',background:'rgba(198,163,78,.04)',color:'#e8e6e0',fontSize:13,fontFamily:'inherit'}}>
              <option value="diesel">Diesel</option>
              <option value="essence">Essence / GPL</option>
              <option value="hybride">Hybride rechargeable</option>
              <option value="electrique">Électrique 100%</option>
            </select>
          </div>
          <I label="Âge du véhicule (années)" value={age} onChange={setAge} min={0} max={12}/>
          <div style={{marginTop:12,padding:10,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:10,color:'#9e9b93',lineHeight:1.7}}>
            💡 Valeur catalogue = prix liste neuf TVAC options incluses<br/>
            Réduction: 6% par an d'âge — max 72% à 12 ans<br/>
            Minimum légal: 1.600 EUR/an (2026)
          </div>
        </C>
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
            {[
              {l:'ATN annuel',v:(r.atnAnn.toFixed(2))+' EUR',c:'#c6a34e'},
              {l:'ATN mensuel',v:(r.atnMens.toFixed(2))+' EUR',c:'#fb923c'},
              {l:'Coef. CO2',v:(r.coef.toFixed(2))+'%',c:'#60a5fa'},
            ].map((k,i)=><div key={i} style={{padding:'14px 16px',background:'rgba(198,163,78,.04)',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}><div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>{k.l}</div><div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}
          </div>
          <C>
            <ST>Impact fiscal mensuel sur le travailleur</ST>
            <Row l="ATN brut mensuel" v={r.atnMens.toFixed(2)+' EUR'} color="#fb923c"/>
            <Row l="ONSS sur ATN (13,07%)" v={'+ '+onssATN.toFixed(2)+' EUR'} color="#ef4444"/>
            <Row l="Précompte sur ATN (~30%)" v={'+ '+ppATN.toFixed(2)+' EUR'} color="#ef4444"/>
            <Row l="Coût net mensuel pour le travailleur" v={(onssATN+ppATN).toFixed(2)+' EUR'} bold color="#f87171"/>
            <div style={{marginTop:12,padding:10,background:'rgba(239,68,68,.04)',borderRadius:8,border:'1px solid rgba(239,68,68,.1)'}}>
              <div style={{fontSize:11,color:'#f87171',fontWeight:600}}>⚠️ À déclarer obligatoirement sur la fiche 281.10</div>
              <div style={{fontSize:10,color:'#9e9b93',marginTop:3}}>Code 250 — Avantages de toute nature — valeur annuelle : {r.atnAnn.toFixed(2)} EUR</div>
            </div>
          </C>
          <C>
            <ST>Cotisation CO2 employeur (mensuelle)</ST>
            {[
              {fuel:'diesel',ref:65,label:'Diesel'},
              {fuel:'essence',ref:84,label:'Essence/GPL'},
              {fuel:'electrique',ref:0,label:'Électrique'},
            ].map((f,i)=>{
              const co2Val = f.fuel==='electrique'?0:co2;
              const cotis = f.fuel==='electrique'?29.45:Math.max(29.45, Math.round((co2Val/f.ref)*29.45*100)/100);
              return <Row key={i} l={'Cotisation CO2 '+f.label} v={cotis.toFixed(2)+' EUR/mois'} color={f.fuel===fuel?'#c6a34e':'#9e9b93'}/>;
            })}
            <div style={{fontSize:10,color:'#5e5c56',marginTop:8}}>Base légale: AR 27/01/2011 — indexé annuellement</div>
          </C>
        </div>
      </div>}

      {tab==='table'&&<C>
        <ST>Comparatif — Exemples de véhicules courants</ST>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr>{['Véhicule','Val. cat.','CO2','Coef','ATN/an','ATN/mois','ONSS trav.'].map(h=><th key={h} style={{padding:'8px',textAlign:'left',color:'#c6a34e',borderBottom:'2px solid rgba(198,163,78,.2)',fontSize:10}}>{h}</th>)}</tr></thead>
          <tbody>{EXEMPLES.map((ex,i)=>{
            const ri = calcATN(ex.valCat, ex.co2, ex.fuel, ex.age);
            return <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <td style={{padding:'8px',fontWeight:600,color:'#e8e6e0'}}>{ex.label}</td>
              <td style={{padding:'8px',color:'#9e9b93'}}>{ex.valCat.toLocaleString('fr-BE')} €</td>
              <td style={{padding:'8px',color:'#60a5fa'}}>{ex.co2}g</td>
              <td style={{padding:'8px',color:'#fb923c'}}>{ri.coef.toFixed(1)}%</td>
              <td style={{padding:'8px',color:'#c6a34e',fontWeight:600}}>{ri.atnAnn.toFixed(0)} €</td>
              <td style={{padding:'8px',color:'#fb923c'}}>{ri.atnMens.toFixed(0)} €</td>
              <td style={{padding:'8px',color:'#ef4444'}}>{(ri.atnMens*0.1307).toFixed(0)} €</td>
            </tr>;
          })}</tbody>
        </table>
      </C>}

      {tab==='legal'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <C>
          <ST>Formule légale — Art. 36 CIR/92</ST>
          <div style={{padding:14,background:'rgba(96,165,250,.04)',borderRadius:8,border:'1px solid rgba(96,165,250,.1)',marginBottom:12,fontFamily:'monospace',fontSize:11,color:'#e8e6e0',lineHeight:2}}>
            ATN = Val. catalogue × Coef. CO2 × (1 – Âge × 6%)<br/>
            MIN = 1.600 EUR/an (2026)<br/>
            <br/>
            Coef. CO2 diesel = 5,5% + (CO2 – 65) × 0,1%<br/>
            Coef. CO2 essence = 5,5% + (CO2 – 84) × 0,1%<br/>
            Coef. MIN = 4% | MAX = 18%<br/>
            Électrique = 4% (CO2 = 0g)
          </div>
          {[
            {t:'Art. 36 CIR/92',d:'Évaluation des avantages de toute nature — voitures'},
            {t:'AR 27/01/2011',d:'Cotisation CO2 employeur — indexation annuelle'},
            {t:'Circ. 2013/C/47',d:'FAQ ATN voiture — administration fiscale'},
            {t:'Art. 38 §1 14° CIR',d:'Exonération voiture électrique — CO2 = 0g'},
          ].map((r,i)=><div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><div style={{fontSize:12,fontWeight:600,color:'#c6a34e'}}>{r.t}</div><div style={{fontSize:10,color:'#9e9b93'}}>{r.d}</div></div>)}
        </C>
        <C>
          <ST>Points de vigilance</ST>
          {[
            {ico:'⚠️',t:'Valeur catalogue = TVAC options comprises',d:'Remises commerciales NON déductibles de la base'},
            {ico:'📅',t:'Âge = date 1ère immatriculation',d:'Pas la date d\'achat par l\'employeur — date de la plaque'},
            {ico:'🔋',t:'Hybrides rechargeables ≤ 50g CO2',d:'Traitement électrique jusqu\'au 31/12/2026 puis recalcul'},
            {ico:'🚗',t:'Usage privé = usage domicile-travail',d:'Trajet domicile-lieu habituel de travail = privé'},
            {ico:'📋',t:'Mise à disposition = déclaration obligatoire',d:'Même si travailleur ne l\'utilise pas — à déclarer'},
            {ico:'💶',t:'Cotisation CO2 = charge employeur',d:'Non récupérable — coût réel à intégrer dans le coût salarial'},
          ].map((r,i)=><div key={i} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><span style={{fontSize:16}}>{r.ico}</span><div><div style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{r.t}</div><div style={{fontSize:10,color:'#9e9b93'}}>{r.d}</div></div></div>)}
        </C>
      </div>}

      {tab==='electrique'&&<div>
        <div style={{padding:14,background:'rgba(34,197,94,.05)',borderRadius:10,border:'1px solid rgba(34,197,94,.15)',marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:'#4ade80',marginBottom:6}}>🔋 Avantages fiscaux véhicules électriques 2026</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
            Les véhicules 100% électriques bénéficient du coefficient CO2 minimal de 4% (CO2 = 0g).<br/>
            De plus, la déductibilité employeur est maintenue à <strong style={{color:'#4ade80'}}>100%</strong> pour les véhicules commandés avant 2026.
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
          <C>
            <ST>Déductibilité employeur par année</ST>
            {[
              {an:'Commandé ≤ 2022',d:'100%',c:'#22c55e'},
              {an:'Commandé 2023',d:'100% → 95% → 90%...',c:'#4ade80'},
              {an:'Commandé 2024',d:'75% dégressif',c:'#fb923c'},
              {an:'Commandé 2025',d:'75% dégressif',c:'#fb923c'},
              {an:'Commandé 2026+',d:'Voir réforme fiscale',c:'#f87171'},
              {an:'Thermique (diesel/essence)',d:'40% → 0% d\'ici 2028',c:'#ef4444'},
            ].map((r,i)=><Row key={i} l={r.an} v={r.d} color={r.c}/>)}
          </C>
          <C>
            <ST>Comparatif ATN diesel vs électrique (40.000 EUR)</ST>
            {['diesel','electrique'].map((f,i)=>{
              const ri = calcATN(40000, f==='diesel'?110:0, f, 0);
              return <div key={i} style={{padding:12,borderRadius:8,background:f==='electrique'?'rgba(34,197,94,.04)':'rgba(239,68,68,.04)',border:`1px solid ${f==='electrique'?'rgba(34,197,94,.15)':'rgba(239,68,68,.1)'}`,marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:700,color:f==='electrique'?'#4ade80':'#f87171',marginBottom:4}}>{f==='electrique'?'⚡ Électrique':'🚘 Diesel'}</div>
                <Row l="Coef CO2" v={ri.coef.toFixed(1)+'%'} />
                <Row l="ATN mensuel" v={ri.atnMens.toFixed(0)+' EUR'} bold color={f==='electrique'?'#4ade80':'#fb923c'}/>
              </div>;
            })}
          </C>
        </div>
      </div>}
    </div>
  );
}
