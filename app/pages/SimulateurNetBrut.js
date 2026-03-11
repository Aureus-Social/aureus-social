"use client";
import { useLang } from '../lib/lang-context';
import React, { useState, useMemo } from 'react';
import { TX_ONSS_W, TX_ONSS_E, RMMMG, IPP_TRANCHES_2026, IPP_FRAIS_PRO_PCT, IPP_FRAIS_PRO_MAX, IPP_TAXE_COMMUNALE, IPP_QUOTITE_BASE, IPP_REDUC_ENFANTS, ONSS_E_SECTEURS, PRIMES_SECTORIELLES, BAREMES_CP_MIN } from '@/app/lib/helpers';

// ═══════════════════════════════════════════════════════════
// CP DATABASE — barèmes minimums + spécificités sectorielles
// ═══════════════════════════════════════════════════════════
const CP_LIST = [
  { id:'200',  label:'CP 200 — Employés (général)',         rmmmg: CP_DATA['200']?.cl1 || RMMMG, onssE_extra: 0,     primeSect: 0,   note:'Barème général employés' },
  { id:'218',  label:'CP 218 — Aide alimentaire',           rmmmg: 2100.00, onssE_extra: 0,     primeSect: 0,   note:'' },
  { id:'220',  label:'CP 220 — Commerce détail',            rmmmg: 2080.00, onssE_extra: 0,     primeSect: 25,  note:'Prime fin année' },
  { id:'226',  label:'CP 226 — Peinture',                   rmmmg: 2150.00, onssE_extra: 0,     primeSect: 50,  note:'Prime intempéries' },
  { id:'227',  label:'CP 227 — Audio-visuel',               rmmmg: 2200.00, onssE_extra: 0,     primeSect: 0,   note:'' },
  { id:'308',  label:'CP 308 — Hôtels & Restaurants',       rmmmg: 2050.00, onssE_extra: 0,     primeSect: 30,  note:'Prime repas incluse' },
  { id:'313',  label:'CP 313 — Pharmacies',                 rmmmg: 2250.00, onssE_extra: 0,     primeSect: 0,   note:'Barème élevé' },
  { id:'315',  label:'CP 315 — Garages',                    rmmmg: 2120.00, onssE_extra: 0,     primeSect: 40,  note:'Prime technique' },
  { id:'317',  label:'CP 317 — Transport & Logistique',     rmmmg: 2150.00, onssE_extra: 0,     primeSect: 0,   note:'' },
  { id:'319',  label:'CP 319 — Assurances',                 rmmmg: 2300.00, onssE_extra: 0,     primeSect: 100, note:'Secteur qualifié' },
  { id:'322',  label:'CP 322 — Intérim (employés)',         rmmmg: CP_DATA['200']?.cl1 || RMMMG, onssE_extra: 0.0015,primeSect: 0,   note:'Fonds formation 0,15%' },
  { id:'326',  label:'CP 326 — Commerce de gros',           rmmmg: 2090.00, onssE_extra: 0,     primeSect: 20,  note:'' },
  { id:'330',  label:'CP 330 — Commerce alimentaire',       rmmmg: 2100.00, onssE_extra: 0,     primeSect: 35,  note:'' },
  { id:'331',  label:'CP 331 — Crédit (banques)',           rmmmg: 2400.00, onssE_extra: 0,     primeSect: 120, note:'Barème élevé' },
  { id:'336',  label:'CP 336 — Grande distribution',        rmmmg: 2080.00, onssE_extra: 0,     primeSect: 30,  note:'GMS' },
  { id:'337',  label:'CP 337 — Non-marchand',               rmmmg: CP_DATA['200']?.cl1 || RMMMG, onssE_extra: 0.003, primeSect: 0,   note:'Maribel social' },
  { id:'341',  label:'CP 341 — Services informatiques',     rmmmg: 2500.00, onssE_extra: 0,     primeSect: 150, note:'IT — barème élevé' },
  { id:'100',  label:'CP 100 — Ouvriers (général)',         rmmmg: CP_DATA['200']?.cl1 || RMMMG, onssE_extra: 0,     primeSect: 0,   note:'Base 108% ONSS',         ouvrier: true },
  { id:'111',  label:'CP 111 — Métal Fabrications',         rmmmg: 2180.00, onssE_extra: 0.005, primeSect: 60,  note:'Fonds sécurité 0,5%',    ouvrier: true },
  { id:'112',  label:'CP 112 — Métal Électrotechnique',     rmmmg: 2180.00, onssE_extra: 0.005, primeSect: 60,  note:'',                        ouvrier: true },
  { id:'118',  label:'CP 118 — Alimentation',               rmmmg: 2100.00, onssE_extra: 0.003, primeSect: 45,  note:'Fonds formation',         ouvrier: true },
  { id:'121',  label:'CP 121 — Nettoyage',                  rmmmg: CP_DATA['200']?.cl1 || RMMMG, onssE_extra: 0.002, primeSect: 0,   note:'Fonds RCC 0,2%',          ouvrier: true },
  { id:'124',  label:'CP 124 — Construction',               rmmmg: 2100.00, onssE_extra: 0.021, primeSect: 80,  note:'FFB 2,1% + fidélité',     ouvrier: true },
  { id:'126',  label:'CP 126 — Bois & Ameublement',         rmmmg: 2100.00, onssE_extra: 0.003, primeSect: 50,  note:'',                        ouvrier: true },
  { id:'130',  label:'CP 130 — Imprimerie',                 rmmmg: 2200.00, onssE_extra: 0.004, primeSect: 70,  note:'',                        ouvrier: true },
  { id:'140',  label:'CP 140 — Transport routier',          rmmmg: 2150.00, onssE_extra: 0.001, primeSect: 40,  note:'',                        ouvrier: true },
  { id:'149',  label:'CP 149 — Électricité',                rmmmg: 2200.00, onssE_extra: 0.003, primeSect: 65,  note:'Fonds Volta',             ouvrier: true },
  { id:'302',  label:'CP 302 — Hôtels (ouvriers)',          rmmmg: 2050.00, onssE_extra: 0,     primeSect: 30,  note:'',                        ouvrier: true },
  { id:'329',  label:'CP 329 — Socio-culturel',             rmmmg: CP_DATA['200']?.cl1 || RMMMG, onssE_extra: 0.003, primeSect: 0,   note:'Maribel social' },
  { id:'332',  label:'CP 332 — Intérim (ouvriers)',         rmmmg: CP_DATA['200']?.cl1 || RMMMG, onssE_extra: 0.0015,primeSect: 0,   note:'Fonds formation',         ouvrier: true },
];

const GOLD='#c6a34e',GREEN='#22c55e',RED='#ef4444',BLUE='#60a5fa',ORANGE='#fb923c';

export function SimulateurNetBrut({ props_tab }) {
  const { tText } = useLang();
  const [mode, setMode] = useState(props_tab === 'simutp' ? 'net' : 'brut');
  const [brutInput, setBrutInput] = useState(3500);
  const [situation, setSituation] = useState('isole');
  const [enfants, setEnfants] = useState(0);
  const [cpId, setCpId] = useState('200');
  const [showCPDetail, setShowCPDetail] = useState(false);

  const cp = CP_LIST.find(c => c.id === cpId) || CP_LIST[0];
  const isOuvrier = !!cp.ouvrier;

  const result = useMemo(() => {
    const brut = brutInput;
    const onssBase = isOuvrier ? Math.round(brut * 1.08 * 100) / 100 : brut;
    const onssW = Math.round(onssBase * TX_ONSS_W * 100) / 100;
    const onssE = Math.round(brut * (TX_ONSS_E + (cp.onssE_extra||0)) * 100) / 100;
    const imposable = brut - onssW;
    const annuel = imposable * 12;
    const fraisPro = Math.min(annuel * IPP_FRAIS_PRO_PCT, IPP_FRAIS_PRO_MAX);
    const base = Math.max(0, annuel - fraisPro);
    // Tranches IPP 2026 — Art. 130 CIR/92
    let ppAn = 0, reste = base, prev = 0;
    for (const t of IPP_TRANCHES_2026) {
      const tranche = Math.min(reste, t.max === Infinity ? reste : t.max - prev);
      if (tranche <= 0) break;
      ppAn += tranche * t.taux;
      reste -= tranche;
      prev = t.max;
    }
    let exempt = IPP_QUOTITE_BASE;
    if (situation === 'marie1') exempt += 7370;
    if (enfants >= 1) exempt += 1850;
    if (enfants >= 2) exempt += 1140;
    if (enfants >= 3) exempt += 2000;
    if (enfants >= 4) exempt += 2370;
    ppAn -= Math.max(0, Math.min(exempt, base)) * 0.25;
    const reducEnfants = IPP_REDUC_ENFANTS[Math.min(enfants, 4)] || 0;
    ppAn = Math.max(0, ppAn - reducEnfants) * (1 + IPP_TAXE_COMMUNALE);
    let bonusEmploi = 0;
    if (brut <= 2968.70) bonusEmploi = Math.round(Math.min(((2968.70-brut)/2968.70)*180, 180)*100)/100;
    const ppMois = Math.max(0, Math.round((ppAn/12 - bonusEmploi)*100)/100);
    const primeMensuelle = Math.round((cp.primeSect||0) / 12 * 100) / 100;
    const net = Math.round((brut - onssW - ppMois)*100)/100;
    const netAvecPrime = Math.round((net + primeMensuelle)*100)/100;
    const coutTotal = Math.round((brut + onssE)*100)/100;
    const baremeMin = Math.max(RMMMG, cp.rmmmg||0);
    const baremeOk = brut >= baremeMin;
    const baremeGap = baremeOk ? 0 : Math.round((baremeMin-brut)*100)/100;
    return { brut, onssW, onssE, pp: ppMois, bonusEmploi, net, netAvecPrime, primeMensuelle, coutTotal, baremeMin, baremeOk, baremeGap };
  }, [brutInput, situation, enfants, cp, isOuvrier]);

  const sSelect = { width:'100%', padding:'10px 12px', background:'#0d1117', border:'1px solid rgba(198,163,78,.15)', borderRadius:8, color:'#e8e6e0', fontSize:12, fontFamily:'inherit' };
  const sLabel = { fontSize:10, color:'#888', textTransform:'uppercase', letterSpacing:'1px', marginBottom:6, display:'block' };
  const sCard = { padding:18, borderRadius:14, border:'1px solid rgba(198,163,78,.08)', background:'rgba(255,255,255,.015)', marginBottom:14 };

  return (
    <div style={{ maxWidth:780, margin:'0 auto', padding:24, color:'#e8e6e0' }}>
      <h2 style={{ fontSize:20, fontWeight:700, color:GOLD, margin:'0 0 4px' }}>⚡ Simulateur Brut ↔ Net</h2>
      <p style={{ fontSize:12, color:'#888', margin:'0 0 20px' }}>Calcul temps réel — PP barèmes 2026 — CP sectorielle intégrée</p>

      <div style={{ display:'flex', gap:8, marginBottom:20, justifyContent:'center' }}>
        {[{v:'brut',l:'Brut → Net'},{v:'net',l:'Net → Brut'}].map(m =>
          <button key={m.v} onClick={() => setMode(m.v)} style={{ padding:'10px 28px', borderRadius:10, border:`1px solid ${mode===m.v?'rgba(198,163,78,.3)':'rgba(198,163,78,.08)'}`, background:mode===m.v?'rgba(198,163,78,.1)':'transparent', color:mode===m.v?GOLD:'#666', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit' }}>{m.l}</button>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:14 }}>
        <div style={sCard}>
          <label style={sLabel}>{mode==='brut'?'Salaire brut mensuel':'Net souhaité'}</label>
          <input type="range" min={1800} max={12000} step={50} value={brutInput} onChange={e => setBrutInput(+e.target.value)} style={{ width:'100%', accentColor:GOLD, marginBottom:8 }} />
          <div style={{ fontFamily:'monospace', fontSize:28, color:GOLD, textAlign:'center', fontWeight:700 }}>{brutInput.toLocaleString('fr-BE')} €</div>
          {!result.baremeOk && <div style={{ marginTop:10, padding:'8px 12px', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:8, fontSize:11, color:RED }}>⚠️ Sous barème CP {cp.id} — min. {result.baremeMin.toLocaleString('fr-BE')} € (manque {result.baremeGap.toFixed(2)} €)</div>}
          {result.baremeOk && <div style={{ marginTop:10, padding:'6px 12px', background:'rgba(34,197,94,.05)', border:'1px solid rgba(34,197,94,.15)', borderRadius:8, fontSize:11, color:GREEN }}>✅ Barème CP {cp.id} respecté — min. {result.baremeMin.toLocaleString('fr-BE')} €</div>}
        </div>

        <div style={sCard}>
          <label style={sLabel}>Situation familiale</label>
          <select value={situation} onChange={e => setSituation(e.target.value)} style={{ ...sSelect, marginBottom:12 }}>
            <option value="isole">Isolé(e)</option>
            <option value="marie1">Marié(e) — 1 revenu</option>
            <option value="marie2">Marié(e) — 2 revenus</option>
          </select>
          <label style={sLabel}>Enfants à charge</label>
          <div style={{ display:'flex', gap:6 }}>
            {[0,1,2,3,4].map(n => <button key={n} onClick={() => setEnfants(n)} style={{ flex:1, height:34, borderRadius:7, border:`1px solid ${enfants===n?'rgba(198,163,78,.3)':'rgba(255,255,255,.06)'}`, background:enfants===n?'rgba(198,163,78,.12)':'transparent', color:enfants===n?GOLD:'#666', cursor:'pointer', fontSize:13, fontWeight:enfants===n?700:400 }}>{n}</button>)}
          </div>
        </div>
      </div>

      {/* Sélecteur CP */}
      <div style={{ ...sCard }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <label style={{ ...sLabel, marginBottom:0 }}>🏭 Commission Paritaire</label>
          <button onClick={() => setShowCPDetail(v => !v)} style={{ padding:'3px 10px', borderRadius:6, border:'1px solid rgba(198,163,78,.2)', background:'transparent', color:GOLD, fontSize:10, cursor:'pointer', fontFamily:'inherit' }}>{showCPDetail?'▲ Masquer':'▼ Voir impact'}</button>
        </div>
        <select value={cpId} onChange={e => setCpId(e.target.value)} style={sSelect}>
          <optgroup label="── Employés ──">
            {CP_LIST.filter(c => !c.ouvrier).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </optgroup>
          <optgroup label="── Ouvriers ──">
            {CP_LIST.filter(c => c.ouvrier).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </optgroup>
        </select>
        <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
          <span style={{ padding:'3px 8px', borderRadius:5, fontSize:10, background:'rgba(198,163,78,.1)', color:GOLD }}>Barème min: {cp.rmmmg?.toLocaleString('fr-BE')} €</span>
          {cp.primeSect > 0 && <span style={{ padding:'3px 8px', borderRadius:5, fontSize:10, background:'rgba(34,197,94,.1)', color:GREEN }}>Prime sectorielle: +{cp.primeSect} €/an ({Math.round(cp.primeSect/12)}€/mois)</span>}
          {(cp.onssE_extra||0) > 0 && <span style={{ padding:'3px 8px', borderRadius:5, fontSize:10, background:'rgba(239,68,68,.1)', color:RED }}>Cotisation extra employeur: +{((cp.onssE_extra||0)*100).toFixed(2)}%</span>}
          {isOuvrier && <span style={{ padding:'3px 8px', borderRadius:5, fontSize:10, background:'rgba(251,146,60,.1)', color:ORANGE }}>Ouvrier: base ONSS ×1.08</span>}
          {cp.note && <span style={{ padding:'3px 8px', borderRadius:5, fontSize:10, background:'rgba(96,165,250,.08)', color:BLUE }}>{cp.note}</span>}
        </div>

        {showCPDetail && (
          <div style={{ marginTop:12, padding:12, background:'rgba(255,255,255,.02)', borderRadius:8, fontSize:11 }}>
            <div style={{ fontWeight:700, color:GOLD, marginBottom:8 }}>Impact CP {cp.id} sur ce salaire</div>
            {[
              { l:'Barème minimum sectoriel', v:`${cp.rmmmg?.toLocaleString('fr-BE')} € (RMMMG: ${RMMMG.toLocaleString('fr-BE')} €)`, ok: (cp.rmmmg||0) <= brutInput },
              { l:'Cotisation ONSS patronale extra', v:`+${((cp.onssE_extra||0)*100).toFixed(2)}% = +${(brutInput*(cp.onssE_extra||0)).toFixed(2)} €/mois employeur`, ok: false },
              { l:'Prime sectorielle annuelle', v:`${cp.primeSect||0} €/an → +${Math.round((cp.primeSect||0)/12)} €/mois net travailleur`, ok: true },
              { l:'Coût employeur total', v:`${result.coutTotal.toLocaleString('fr-BE')} € (ONSS patronal: ${result.onssE.toLocaleString('fr-BE')} €)`, ok: null },
            ].map((r, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,.04)', gap:12 }}>
                <span style={{ color:'#9e9b93', minWidth:200 }}>{r.l}</span>
                <span style={{ color: r.ok === true ? GREEN : r.ok === false && (cp.onssE_extra||0) > 0 ? RED : '#e8e6e0', fontWeight:600, textAlign:'right' }}>{r.v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Résultats */}
      <div style={sCard}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
          {[
            { l:'Coût total employeur', v:result.coutTotal, c:RED },
            { l:'Brut mensuel', v:result.brut, c:GOLD },
            { l:'Net à payer', v:result.net, c:GREEN },
          ].map((k,i) => (
            <div key={i} style={{ textAlign:'center', padding:'14px 10px', background:'rgba(255,255,255,.02)', borderRadius:10 }}>
              <div style={{ fontSize:10, color:'#888', marginBottom:6, textTransform:'uppercase', letterSpacing:'1px' }}>{k.l}</div>
              <div style={{ fontFamily:'monospace', fontSize:22, fontWeight:700, color:k.c }}>{k.v.toLocaleString('fr-BE')} €</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop:'1px solid rgba(198,163,78,.06)', paddingTop:16 }}>
          {[
            { l:`ONSS travailleur (13,07%${isOuvrier?' ×1.08':''})`, v:result.onssW, pct:result.onssW/result.brut*100, c:ORANGE },
            { l:'Précompte professionnel', v:result.pp, pct:result.pp/result.brut*100, c:RED },
            ...(result.bonusEmploi > 0 ? [{ l:'✅ Bonus emploi (Art. 289ter CIR)', v:-result.bonusEmploi, pct:0, c:GREEN }] : []),
            { l:'Net', v:result.net, pct:result.net/result.brut*100, c:GREEN },
          ].map((item,i) => (
            <div key={i} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:12, color:'#999' }}>{item.l}</span>
                <span style={{ fontFamily:'monospace', fontSize:12, color:'#e5e5e5' }}>{item.v < 0 ? '+' : ''}{Math.abs(item.v).toLocaleString('fr-BE')} € {item.pct > 0 ? `(${Math.round(item.pct)}%)` : ''}</span>
              </div>
              {item.pct > 0 && <div style={{ height:7, borderRadius:4, background:'rgba(198,163,78,.06)', overflow:'hidden' }}><div style={{ height:'100%', width:Math.min(item.pct,100)+'%', background:item.c, borderRadius:4, transition:'width .5s ease' }}/></div>}
            </div>
          ))}
        </div>

        {result.primeMensuelle > 0 && <>
          <div style={{ marginTop:12, padding:'10px 14px', background:'rgba(34,197,94,.05)', border:'1px solid rgba(34,197,94,.15)', borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:GREEN }}>+ Prime sectorielle CP {cp.id}</div>
              <div style={{ fontSize:10, color:'#888' }}>CCT sectorielle — {cp.primeSect} €/an proratisé</div>
            </div>
            <div style={{ fontFamily:'monospace', fontSize:16, fontWeight:700, color:GREEN }}>+{result.primeMensuelle.toFixed(2)} €/mois</div>
          </div>
          <div style={{ marginTop:8, padding:'12px 14px', background:'rgba(198,163,78,.06)', border:'1px solid rgba(198,163,78,.15)', borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, fontWeight:700, color:GOLD }}>Net total avec prime sectorielle</span>
            <span style={{ fontFamily:'monospace', fontSize:20, fontWeight:700, color:GOLD }}>{result.netAvecPrime.toLocaleString('fr-BE')} €</span>
          </div>
        </>}
      </div>

      <div style={{ fontSize:10, color:'#555', textAlign:'center', lineHeight:1.7 }}>
        Calcul estimatif — Barèmes PP SPF Finances 2026 · ONSS 13,07% (travailleur) + {((TX_ONSS_E+(cp.onssE_extra||0))*100).toFixed(2)}% (patronal CP {cp.id}) · Taxe communale 7% incluse
        {isOuvrier && ' · Base ONSS ouvrier ×1.08 (AR 28/11/1969)'}
      </div>
    </div>
  );
}

export default function SimulateurNetBrutWrapped({ s, d, tab }) {
  return <SimulateurNetBrut props_tab={tab} />;
}
