'use client';
import { useState, useMemo } from 'react';
import { useLang } from '../lib/lang-context';

// ═══════════════════════════════════════════════════════════════
// SIMULATEUR PENSION BELGE — Aureus Social Pro v2
// Loi 28/12/1971 + LPC 28/04/2003 + Réforme Lalieux 2022
// ═══════════════════════════════════════════════════════════════

const GOLD='#c6a34e',GREEN='#22c55e',RED='#ef4444',BLUE='#60a5fa',PURPLE='#a78bfa',GRAY='#888';

// Paramètres légaux belges 2026
const PARAMS = {
  plafondSalaire: 3175.14,      // Plafond salaire pris en compte
  tauxIsole: 0.75,              // 75% salaire moyen — isolé
  tauxMenage: 0.60,             // 60% salaire moyen — ménage
  pensionMinIsole: 1743.87,     // Pension minimum garantie isolé/mois
  pensionMinMenage: 1394.44,    // Pension minimum ménage/mois
  pensionMaxIsole: 2873.53,     // Pension maximum légale brute
  ageLegal: 65,                 // Âge légal 2026
  carrierePenible: 42,          // Carrière complète pénible
  carriereNormale: 45,          // Carrière complète normale
  onssRetraite: 0.0357,         // Cotisation sécurité sociale pension
  rendementEpargne: 0.04,       // Rendement épargne pension fictif 4%
  rendementGroupe: 0.04,        // Rendement assurance groupe 4%
  // Bonus pension (Loi 28/07/2011) : +2% par année après 65 ans
  bonusPensionAnnuel: 0.02,
  // Malus anticipation : -3% par année avant 65 ans (simplifié)
  malusAnticipation: 0.03,
};

function calcPP(brut) {
  if (brut <= 0) return 0;
  // PP simplifié sur pension (tranches 2026)
  if (brut <= 1075) return brut * 0.0;    // exonéré en dessous
  if (brut <= 1600) return (brut - 1075) * 0.11;
  if (brut <= 2500) return 525 * 0.11 + (brut - 1600) * 0.30;
  return 525 * 0.11 + 900 * 0.30 + (brut - 2500) * 0.40;
}

function simuler(params) {
  const { brut, age, ageDepart, annéesCotisées, situation, cotisGroupe, cotisEpargne, tauxBonus } = params;
  const annéesRestantes = Math.max(0, ageDepart - age);
  const annéesTotal = Math.min(PARAMS.carriereNormale, annéesCotisées + annéesRestantes);
  const salMoyen = Math.min(brut, PARAMS.plafondSalaire);
  const taux = situation === 'isole' ? PARAMS.tauxIsole : PARAMS.tauxMenage;

  // Pension légale brute
  let pensionTheorique = salMoyen * taux * (annéesTotal / PARAMS.carriereNormale);
  const pensionMin = situation === 'isole' ? PARAMS.pensionMinIsole : PARAMS.pensionMinMenage;
  const pensionBruteLegale = Math.min(Math.max(pensionTheorique, pensionMin), PARAMS.pensionMaxIsole);

  // Bonus/Malus
  let multiplicateur = 1;
  if (ageDepart > PARAMS.ageLegal) multiplicateur += (ageDepart - PARAMS.ageLegal) * PARAMS.bonusPensionAnnuel;
  if (ageDepart < PARAMS.ageLegal) multiplicateur -= (PARAMS.ageLegal - ageDepart) * PARAMS.malusAnticipation;
  multiplicateur = Math.max(0.7, Math.min(1.3, multiplicateur));
  const pensionBrute = Math.round(pensionBruteLegale * multiplicateur);

  // Cotisations sur pension
  const onssRetraite = Math.round(pensionBrute * PARAMS.onssRetraite);
  const pp = Math.round(calcPP(pensionBrute));
  const pensionNette = pensionBrute - onssRetraite - pp;

  // 2e pilier — assurance groupe
  const capitalGroupe = cotisGroupe > 0
    ? brut * (cotisGroupe / 100) * 12 * annéesTotal * ((Math.pow(1 + PARAMS.rendementGroupe, annéesTotal) - 1) / (PARAMS.rendementGroupe * annéesTotal))
    : 0;
  const rente2ePilier = Math.round(capitalGroupe / (12 * 20)); // rente sur 20 ans

  // 3e pilier — épargne pension
  const capitalEpargne = cotisEpargne > 0
    ? cotisEpargne * 12 * annéesRestantes * ((Math.pow(1 + PARAMS.rendementEpargne, annéesRestantes) - 1) / (PARAMS.rendementEpargne * Math.max(1, annéesRestantes)))
    : 0;
  const rente3ePilier = Math.round(capitalEpargne / (12 * 20));

  // Taux de remplacement
  const tauxRemplacement = brut > 0 ? Math.round(pensionNette / (brut * 0.687) * 100) : 0; // vs net actuel

  // Projection revenu total retraite
  const totalBrut = pensionBrute + rente2ePilier + rente3ePilier;
  const totalNet = pensionNette + rente2ePilier + rente3ePilier;

  return {
    pensionBrute, onssRetraite, pp, pensionNette,
    annéesTotal: Math.round(annéesTotal * 10) / 10,
    multiplicateur: Math.round(multiplicateur * 100),
    capitalGroupe: Math.round(capitalGroupe), rente2ePilier,
    capitalEpargne: Math.round(capitalEpargne), rente3ePilier,
    tauxRemplacement, totalBrut, totalNet,
    pensionBruteLegale: Math.round(pensionBruteLegale),
    bonusMalus: ageDepart !== PARAMS.ageLegal ? (ageDepart > PARAMS.ageLegal ? '+' : '') + Math.round((multiplicateur - 1) * 100) + '%' : '0%',
  };
}

export default function SimulateurPension({ s, d }) {
  const { tText } = useLang();
  const [f, setF] = useState({
    brut: 3500, age: 45, ageDepart: 65,
    annéesCotisées: 20, situation: 'isole',
    cotisGroupe: 4, cotisEpargne: 100,
  });
  const [tab, setTab] = useState('calcul');

  const setFld = (k, v) => setF(p => ({...p, [k]: v}));
  const res = useMemo(() => simuler(f), [f]);
  const f2 = v => new Intl.NumberFormat('fr-BE', {minimumFractionDigits:2, maximumFractionDigits:2}).format(v||0);

  const sCard = { background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:16, marginBottom:12 };
  const sInput = { padding:'8px 12px', background:'#090c16', border:'1px solid rgba(139,115,60,.15)', borderRadius:6, color:'#e5e5e5', fontSize:12, fontFamily:'inherit', width:'100%', boxSizing:'border-box' };
  const sLabel = { fontSize:10, color:GRAY, display:'block', marginBottom:4, fontWeight:600, textTransform:'uppercase', letterSpacing:'.5px' };
  const sBtn = (active) => ({ padding:'6px 14px', borderRadius:6, border:'none', fontSize:11, fontWeight:600, cursor:'pointer', background:active?'rgba(198,163,78,.12)':'rgba(255,255,255,.03)', color:active?GOLD:'#888' });

  const scoreColor = res.tauxRemplacement >= 70 ? GREEN : res.tauxRemplacement >= 50 ? GOLD : RED;

  return (
    <div style={{padding:24, color:'#e8e6e0', fontFamily:'inherit'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20}}>
        <div>
          <h2 style={{fontSize:22, fontWeight:700, color:GOLD, margin:'0 0 4px'}}>🏖 Simulateur Pension Belge</h2>
          <p style={{fontSize:12, color:GRAY, margin:0}}>Loi 28/12/1971 · LPC 28/04/2003 · Réforme Lalieux 2022 · Paramètres 2026</p>
        </div>
      </div>

      <div style={{display:'flex', gap:4, marginBottom:16}}>
        {[['calcul','⚙️ Paramètres'],['resultat','📊 Résultats'],['piliers','🏛 3 piliers'],['conseil','💡 Conseils']].map(([v,l])=>
          <button key={v} onClick={()=>setTab(v)} style={sBtn(tab===v)}>{l}</button>
        )}
      </div>

      {tab==='calcul' && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <div style={sCard}>
            <div style={{fontSize:12, fontWeight:700, color:GOLD, marginBottom:12}}>Situation personnelle</div>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              <div><label style={sLabel}>Salaire brut mensuel actuel (€)</label><input type="number" value={f.brut} onChange={e=>setFld('brut',+e.target.value)} style={sInput}/></div>
              <div><label style={sLabel}>Âge actuel</label><input type="number" value={f.age} min={20} max={64} onChange={e=>setFld('age',+e.target.value)} style={sInput}/></div>
              <div><label style={sLabel}>Âge de départ à la pension</label>
                <select value={f.ageDepart} onChange={e=>setFld('ageDepart',+e.target.value)} style={sInput}>
                  {[60,61,62,63,64,65,66,67,68].map(a=><option key={a} value={a}>{a} ans {a<65?'⚠️ malus':a>65?'✅ bonus':''}</option>)}
                </select>
              </div>
              <div><label style={sLabel}>Années cotisées à ce jour</label><input type="number" value={f.annéesCotisées} min={0} max={45} onChange={e=>setFld('annéesCotisées',+e.target.value)} style={sInput}/></div>
              <div><label style={sLabel}>Situation familiale</label>
                <select value={f.situation} onChange={e=>setFld('situation',e.target.value)} style={sInput}>
                  <option value="isole">Isolé (75% — taux plus élevé)</option>
                  <option value="menage">Ménage (60%)</option>
                </select>
              </div>
            </div>
          </div>
          <div style={sCard}>
            <div style={{fontSize:12, fontWeight:700, color:GOLD, marginBottom:12}}>Épargne complémentaire</div>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              <div>
                <label style={sLabel}>2e pilier — Cotisation assurance groupe (% brut)</label>
                <input type="number" value={f.cotisGroupe} step="0.5" min={0} max={20} onChange={e=>setFld('cotisGroupe',+e.target.value)} style={sInput}/>
                <div style={{fontSize:10, color:GRAY, marginTop:3}}>Ex: 4% = cotisation mensuelle de {f2(f.brut * f.cotisGroupe / 100)} €</div>
              </div>
              <div>
                <label style={sLabel}>3e pilier — Épargne pension mensuelle (€)</label>
                <input type="number" value={f.cotisEpargne} step={10} min={0} max={1000} onChange={e=>setFld('cotisEpargne',+e.target.value)} style={sInput}/>
                <div style={{fontSize:10, color:GRAY, marginTop:3}}>Max déductible fiscalement: 1 310 €/an (2026)</div>
              </div>
              <div style={{background:'rgba(198,163,78,.06)', borderRadius:8, padding:12, marginTop:8}}>
                <div style={{fontSize:11, fontWeight:700, color:GOLD, marginBottom:6}}>Paramètres calculés</div>
                <div style={{fontSize:11, color:'#ccc'}}>Carrière totale estimée: <b style={{color:'#e8e6e0'}}>{res.annéesTotal} ans</b></div>
                <div style={{fontSize:11, color:'#ccc'}}>Années restantes: <b style={{color:'#e8e6e0'}}>{Math.max(0,f.ageDepart-f.age)} ans</b></div>
                <div style={{fontSize:11, color:'#ccc'}}>Plafond salaire pension: <b style={{color:'#e8e6e0'}}>{f2(PARAMS.plafondSalaire)} €</b></div>
                <div style={{fontSize:11, color:f.ageDepart<65?RED:f.ageDepart>65?GREEN:GRAY}}>Bonus/Malus anticipation: <b>{res.bonusMalus}</b></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab==='resultat' && (
        <>
          {/* Score taux remplacement */}
          <div style={{...sCard, textAlign:'center', padding:24}}>
            <div style={{fontSize:11, color:GRAY, marginBottom:8, textTransform:'uppercase', letterSpacing:'.5px'}}>Taux de remplacement (pension nette vs net actuel)</div>
            <div style={{fontSize:52, fontWeight:900, color:scoreColor}}>{res.tauxRemplacement}%</div>
            <div style={{fontSize:12, color:GRAY, marginTop:4}}>
              {res.tauxRemplacement >= 70 ? '✅ Excellent — objectif pension atteint' :
               res.tauxRemplacement >= 50 ? '⚠️ Acceptable — épargne complémentaire recommandée' :
               '❌ Insuffisant — action urgente requise'}
            </div>
          </div>

          {/* KPIs */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:12}}>
            {[
              {label:'Pension légale brute', val:f2(res.pensionBrute)+' €', color:GOLD},
              {label:'ONSS + PP pension', val:f2(res.onssRetraite+res.pp)+' €', color:RED},
              {label:'Pension légale nette', val:f2(res.pensionNette)+' €', color:GREEN, big:true},
              {label:'Revenu total retraite', val:f2(res.totalNet)+' €', color:BLUE, big:true},
            ].map((k,i)=>(
              <div key={i} style={{...sCard, marginBottom:0, textAlign:'center'}}>
                <div style={{fontSize:10, color:GRAY, marginBottom:4}}>{k.label}</div>
                <div style={{fontSize:k.big?18:15, fontWeight:700, color:k.color}}>{k.val}</div>
              </div>
            ))}
          </div>

          {/* Détail calcul */}
          <div style={sCard}>
            <div style={{fontSize:12, fontWeight:700, color:GOLD, marginBottom:12}}>Détail du calcul</div>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <tbody>
                {[
                  ['Salaire moyen pris en compte', f2(Math.min(f.brut, PARAMS.plafondSalaire))+' €', ''],
                  ['Taux pension applicable', (f.situation==='isole'?75:60)+'%', f.situation==='isole'?'Isolé (75%)':'Ménage (60%)'],
                  ['Carrière totale estimée', res.annéesTotal+' ans', 'Max 45 ans'],
                  ['Pension légale théorique', f2(res.pensionBruteLegale)+' €', ''],
                  ['Ajustement bonus/malus', res.bonusMalus, f.ageDepart<65?'Départ anticipé':f.ageDepart>65?'Départ tardif':'À 65 ans'],
                  ['Pension légale brute finale', f2(res.pensionBrute)+' €', GOLD],
                  ['ONSS retraite (3.57%)', '-'+f2(res.onssRetraite)+' €', RED],
                  ['Précompte professionnel', '-'+f2(res.pp)+' €', RED],
                  ['Pension légale NETTE', f2(res.pensionNette)+' €', GREEN],
                ].map(([l,v,c],i)=>(
                  <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>
                    <td style={{padding:'7px 0', fontSize:11, color:'#aaa'}}>{l}</td>
                    <td style={{padding:'7px 0', fontSize:11, fontWeight:c?700:400, color:c||'#e8e6e0', textAlign:'right'}}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab==='piliers' && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
          {[
            { n:'1', emoji:'🏛', title:'1er pilier — Pension légale', color:GOLD,
              items:[
                ['Pension brute mensuelle', f2(res.pensionBrute)+' €'],
                ['Pension nette mensuelle', f2(res.pensionNette)+' €'],
                ['Carrière prise en compte', res.annéesTotal+' ans'],
                ['Bonus/Malus', res.bonusMalus],
              ],
              info:'Financée par les cotisations ONSS. Gérée par le Service Fédéral des Pensions (SFP).',
              url:'https://www.sfpd.fgov.be'
            },
            { n:'2', emoji:'💼', title:'2e pilier — Assurance groupe', color:BLUE,
              items:[
                ['Capital accumulé estimé', f2(res.capitalGroupe)+' €'],
                ['Rente mensuelle estimée', f2(res.rente2ePilier)+' €'],
                ['Cotisation mensuelle', f2(f.brut*f.cotisGroupe/100)+' €'],
                ['Rendement estimé', '4%/an'],
              ],
              info:'Plan de pension complémentaire via employeur. Géré par assureur (AG Insurance, AXA, etc.).',
              url:'https://www.assuralia.be'
            },
            { n:'3', emoji:'💰', title:'3e pilier — Épargne pension', color:PURPLE,
              items:[
                ['Capital accumulé estimé', f2(res.capitalEpargne)+' €'],
                ['Rente mensuelle estimée', f2(res.rente3ePilier)+' €'],
                ['Versement mensuel', f2(f.cotisEpargne)+' €'],
                ['Avantage fiscal', '30% de réduction d\'impôt'],
              ],
              info:'Épargne individuelle avec avantage fiscal. Max 1 310 €/an déductible (2026).',
              url:'https://finances.belgium.be'
            },
          ].map(p=>(
            <div key={p.n} style={{...sCard, borderTop:`3px solid ${p.color}`}}>
              <div style={{fontSize:14, fontWeight:700, color:p.color, marginBottom:8}}>{p.emoji} {p.title}</div>
              {p.items.map(([l,v],i)=>(
                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,.03)'}}>
                  <span style={{fontSize:11, color:GRAY}}>{l}</span>
                  <span style={{fontSize:11, fontWeight:600, color:'#e8e6e0'}}>{v}</span>
                </div>
              ))}
              <div style={{fontSize:10, color:GRAY, marginTop:10, lineHeight:1.5}}>{p.info}</div>
            </div>
          ))}

          {/* Synthèse */}
          <div style={{...sCard, gridColumn:'1/-1', background:'rgba(198,163,78,.04)'}}>
            <div style={{fontSize:12, fontWeight:700, color:GOLD, marginBottom:10}}>Synthèse revenu total retraite</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10}}>
              {[
                {label:'1er pilier (légal)', val:f2(res.pensionNette)+' €', color:GOLD},
                {label:'2e pilier (groupe)', val:f2(res.rente2ePilier)+' €', color:BLUE},
                {label:'3e pilier (épargne)', val:f2(res.rente3ePilier)+' €', color:PURPLE},
                {label:'TOTAL RETRAITE/MOIS', val:f2(res.totalNet)+' €', color:GREEN, big:true},
              ].map((k,i)=>(
                <div key={i} style={{textAlign:'center'}}>
                  <div style={{fontSize:10, color:GRAY, marginBottom:4}}>{k.label}</div>
                  <div style={{fontSize:k.big?18:14, fontWeight:700, color:k.color}}>{k.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==='conseil' && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          {[
            { title:'🎯 Objectif taux de remplacement', color:GOLD,
              lines: res.tauxRemplacement >= 70
                ? ['✅ Votre taux de remplacement est excellent ('+res.tauxRemplacement+'%).','Continuez à cotiser régulièrement.','Pensez à la déclaration annuelle via MyPension.']
                : ['⚠️ Taux actuel: '+res.tauxRemplacement+'% — objectif: 70%+',`Déficit estimé: ${f2(Math.max(0, f.brut*0.7*0.687 - res.totalNet))} €/mois`,`Augmentez le 2e ou 3e pilier pour combler l'écart`] },
            { title:'📅 Âge de départ optimal', color:BLUE,
              lines: [
                `Départ à ${f.ageDepart} ans: ${res.bonusMalus} sur la pension`,
                f.ageDepart < 65 ? `Conditions anticipation: 45 ans carrière ET ${f.age+(65-f.ageDepart)} ans minimum` : f.ageDepart > 65 ? `Bonus pension: +${(PARAMS.bonusPensionAnnuel*(f.ageDepart-65)*100).toFixed(0)}% soit +${f2((res.pensionBruteLegale*PARAMS.bonusPensionAnnuel*(f.ageDepart-65)))} €/mois` : `Âge légal 2026: aucun bonus/malus`,
                `Vérifiez vos droits sur mypension.be`
              ] },
            { title:'💼 Optimiser le 2e pilier', color:PURPLE,
              lines: [
                `Cotisation actuelle: ${f.cotisGroupe}% du brut = ${f2(f.brut*f.cotisGroupe/100)} €/mois`,
                `Capital estimé à ${f.ageDepart} ans: ${f2(res.capitalGroupe)} €`,
                `Rente mensuelle estimée: ${f2(res.rente2ePilier)} €`,
                `Demandez à votre employeur une augmentation des cotisations (moins taxé que salaire)` ] },
            { title:'💰 Épargne pension (3e pilier)', color:GREEN,
              lines: [
                `Montant actuel: ${f2(f.cotisEpargne)} €/mois`,
                `Max déductible: 1 310 €/an = 109 €/mois`,
                `Avantage fiscal: 30% = économie ${f2(Math.min(f.cotisEpargne*12,1310)*0.30)} €/an`,
                `Capital estimé: ${f2(res.capitalEpargne)} €` ] },
            { title:'🔗 Liens officiels', color:GRAY,
              lines: [
                '→ mypension.be — Simulateur officiel pension',
                '→ sfpd.fgov.be — Service Fédéral des Pensions',
                '→ onss.be — Historique carrière',
                '→ finances.belgium.be — Épargne pension déductible' ] },
            { title:'⚠️ Limitations du simulateur', color:RED,
              lines: [
                'Simulation indicative — non opposable à la SFP',
                'Ne tient pas compte des périodes assimilées',
                'Ne tient pas compte des régimes mixtes (travailleur/indépendant)',
                'Consultez un conseiller pension pour un calcul précis' ] },
          ].map((c,i)=>(
            <div key={i} style={{...sCard, borderLeft:`3px solid ${c.color}`}}>
              <div style={{fontSize:12, fontWeight:700, color:c.color, marginBottom:10}}>{c.title}</div>
              {c.lines.map((l,j)=><div key={j} style={{fontSize:11, color:'#ccc', marginBottom:5, lineHeight:1.5}}>{l}</div>)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
