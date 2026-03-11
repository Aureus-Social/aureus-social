'use client';
// Simulateur Pension belge — Loi 28/12/1971 + LPC 28/04/2003
import { useState, useMemo } from 'react';
import { C, fmt, RMMMG } from '@/app/lib/helpers';
const GOLD='#c6a34e',GREEN='#22c55e',BLUE='#60a5fa',RED='#ef4444',PURPLE='#a78bfa';

const PLAFOND_PENSION_2026 = 3175.14; // plafond salaire pris en compte pour pension
const TAUX_PENSION_SALARIÉ = 0.60;    // 60% du salaire moyen de carrière (conjoint)
const TAUX_PENSION_ISOLÉ = 0.60;      // 75% si isolé → simplifié ici à 60% unifié
const PENSION_MIN_2026 = 1743.87;     // pension minimum garantie (isolé, 2026)
const PENSION_MIN_CONJ = 1394.44;     // pension minimum (ménage)
const AGE_LÉGAL = 65;

function calcPension(brut, annéesCarrière, situation, tauxGroupe, cotisGroupe) {
  const salMoyen = Math.min(brut, PLAFOND_PENSION_2026);
  const taux = situation === 'isole' ? 0.75 : TAUX_PENSION_SALARIÉ;
  const pensionThéorique = salMoyen * taux * (annéesCarrière / 45);
  const pensionLégale = Math.max(
    pensionThéorique,
    situation === 'isole' ? PENSION_MIN_2026 : PENSION_MIN_CONJ
  );
  // Pension complémentaire (2e pilier)
  const capitalGroupe = brut * (cotisGroupe / 100) * 12 * annéesCarrière * 1.04; // rendement 4% fictif
  const rente2ePilier = capitalGroupe / 120; // rente sur 10 ans
  const totalBrut = Math.min(pensionLégale, PLAFOND_PENSION_2026 * 0.75);
  const onss = Math.round(totalBrut * 0.0357 * 100) / 100; // 3.57% cotisation sécurité sociale pension
  const pp = Math.round(totalBrut * 0.11 * 100) / 100; // PP simplifié ~11%
  const pensionNette = totalBrut - onss - pp;
  return { pensionLégale: Math.round(pensionLégale), totalBrut: Math.round(totalBrut), pensionNette: Math.round(pensionNette), rente2ePilier: Math.round(rente2ePilier), capitalGroupe: Math.round(capitalGroupe), onss, pp, tauxRemplacement: Math.round(pensionNette/brut*100) };
}

export default function SimulateurPension({ s, d }) {
  const [f, setF] = useState({
    brut: 3500, age: 45, ageDepart: 65, debutCarriere: 2005,
    situation: 'isole', annéesCotisées: 25,
    cotisGroupe: 4, tauxGroupe: 4,
  });

  const calc = useMemo(() => {
    const annéesRestantes = f.ageDepart - f.age;
    const annéesTotal = f.annéesCotisées + annéesRestantes;
    return calcPension(f.brut, Math.min(45, annéesTotal), f.situation, f.tauxGroupe, f.cotisGroupe);
  }, [f]);

  const setFld = (k,v) => setF(p=>({...p,[k]:v}));

  return (
    <div>
      <div style={{marginBottom:20}}>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:'#e8e6e0',margin:0}}>Simulateur Pension</h1>
        <div style={{fontSize:10,color:'#5e5c56',marginTop:3}}>Pension légale (1er pilier) + Pension complémentaire (2e pilier LPC) · Barèmes 2026</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {/* Paramètres */}
        <C style={{padding:'20px 22px'}}>
          <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14}}>⚙️ Votre profil</div>
          {[
            ['Salaire brut mensuel (€)', 'brut', 'range', 1000, 8000, 50],
            ['Âge actuel', 'age', 'number', 20, 64, 1],
            ['Âge de départ souhaité', 'ageDepart', 'number', 60, 67, 1],
            ['Années cotisées à ce jour', 'annéesCotisées', 'number', 0, 45, 1],
            ['Cotisation groupe (% brut)', 'cotisGroupe', 'range', 0, 10, 0.5],
          ].map(([l,k,t,min,max,step])=>(
            <div key={k} style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <label style={{fontSize:10,color:'#5e5c56'}}>{l}</label>
                <span style={{fontSize:11,fontWeight:700,color:GOLD}}>
                  {k==='brut'?fmt(f[k]):k==='cotisGroupe'?`${f[k]}%`:f[k]}
                </span>
              </div>
              {t==='range'?<input type='range' min={min} max={max} step={step} value={f[k]} onChange={e=>setFld(k,+e.target.value)} style={{width:'100%',accentColor:GOLD}}/>
              :<input type={t} min={min} max={max} step={step} value={f[k]} onChange={e=>setFld(k,+e.target.value)} style={{width:'100%',padding:'7px 10px',borderRadius:7,border:'1px solid rgba(198,163,78,.15)',background:'#0a0908',color:'#d4d0c8',fontSize:12}}/>}
            </div>
          ))}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:10,color:'#5e5c56',display:'block',marginBottom:6}}>Situation familiale</label>
            <div style={{display:'flex',gap:6}}>
              {[{k:'isole',l:'Isolé(e)'},{k:'menage',l:'Ménage'}].map(s=>(
                <button key={s.k} onClick={()=>setFld('situation',s.k)} style={{flex:1,padding:'8px',borderRadius:7,border:`1px solid ${f.situation===s.k?GOLD:'rgba(198,163,78,.15)'}`,background:f.situation===s.k?`${GOLD}15`:'transparent',color:f.situation===s.k?GOLD:'#5e5c56',fontSize:11,cursor:'pointer',fontWeight:f.situation===s.k?700:400}}>{s.l}</button>
              ))}
            </div>
          </div>
        </C>

        {/* Résultats */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[
              {l:'Pension légale brute',v:fmt(calc.pensionLégale),c:GOLD,sub:'1er pilier/mois'},
              {l:'Pension nette estimée',v:fmt(calc.pensionNette),c:GREEN,sub:'Après cotis. + PP'},
              {l:'Rente 2e pilier',v:fmt(calc.rente2ePilier),c:BLUE,sub:'Capital: '+fmt(calc.capitalGroupe)},
              {l:'Taux de remplacement',v:`${calc.tauxRemplacement}%`,c:calc.tauxRemplacement>60?GREEN:calc.tauxRemplacement>40?GOLD:RED,sub:`vs salaire ${fmt(f.brut)}`},
            ].map(k=>(
              <div key={k.l} style={{padding:'16px',background:'linear-gradient(145deg,#0e1220,#131829)',border:'1px solid rgba(139,115,60,.1)',borderRadius:12}}>
                <div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'1px',marginBottom:6}}>{k.l}</div>
                <div style={{fontSize:22,fontWeight:700,color:k.c}}>{k.v}</div>
                <div style={{fontSize:9,color:'#5e5c56',marginTop:4}}>{k.sub}</div>
              </div>
            ))}
          </div>

          <C style={{padding:'18px 20px'}}>
            <div style={{fontSize:11,fontWeight:700,color:GOLD,marginBottom:10}}>📋 Décomposition</div>
            {[
              ['Pension légale brute', fmt(calc.pensionLégale), GOLD],
              ['Cotisation sécurité sociale pension (3,57%)', `-${fmt(calc.onss)}`, RED],
              ['Précompte professionnel estimé (~11%)', `-${fmt(calc.pp)}`, RED],
              ['Pension légale nette', fmt(calc.pensionNette), GREEN],
              ['+ Rente pension complémentaire', fmt(calc.rente2ePilier), BLUE],
              ['= TOTAL PENSION MENSUELLE NET', fmt(calc.pensionNette + calc.rente2ePilier), GREEN],
            ].map(([l,v,c])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
                <span style={{fontSize:10,color:l.startsWith('=')||l.startsWith('+')?'#e8e6e0':'#9e9b93',fontWeight:l.startsWith('=')?700:400}}>{l}</span>
                <span style={{fontSize:11,fontWeight:700,color:c}}>{v}</span>
              </div>
            ))}
          </C>

          <C style={{padding:'14px 18px',background:'rgba(34,197,94,.03)',border:'1px solid rgba(34,197,94,.1)',borderRadius:10}}>
            <div style={{fontSize:10,color:GREEN,fontWeight:700,marginBottom:6}}>ℹ️ Réforme pension belge</div>
            <div style={{fontSize:10,color:'#5e5c56',lineHeight:1.6}}>
              Âge légal: <strong style={{color:GOLD}}>65 ans</strong> (66 ans en 2025, 67 ans en 2030) ·
              Pension anticipée: <strong style={{color:GOLD}}>63 ans</strong> avec 42 ans de carrière ·
              Plafond salaire pris en compte: <strong style={{color:GOLD}}>{fmt(PLAFOND_PENSION_2026)}</strong>/mois ·
              Base légale: Loi 28/12/1971 réformée · LPC 28/04/2003 (2e pilier)
            </div>
          </C>
        </div>
      </div>
    </div>
  );
}
