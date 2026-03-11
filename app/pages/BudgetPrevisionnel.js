'use client';
import { LB, TX_ONSS_W, TX_ONSS_E, CR_PAT, CR_TRAV } from '@/app/lib/helpers';
import { useState, useMemo } from 'react';
import { useLang } from '../lib/lang-context';

// ═══════════════════════════════════════════════════════════════
// BUDGET PRÉVISIONNEL RH — Aureus Social Pro
// Simulation coût salarial total employeur sur 12 mois
// ═══════════════════════════════════════════════════════════════

const GOLD='#c6a34e',GREEN='#22c55e',RED='#ef4444',BLUE='#60a5fa',GRAY='#888';

// Taux belges 2026
const TX_VACANCES = 0.1538; // Pécule vacances travailleur ~15.38% brut
const TX_13E = 1/12;        // 13e mois (si applicable)
const ACTIVA_DEDUCTION = 350; // Réduction Activa.brussels 1er travailleur

const POSTES_FIXES = [
  { id:'assurance_loi', label:'Assurance loi accidents du travail', montant:0, pct:0.005, base:'brut', info:'~0.5% brut — variable selon secteur' },
  { id:'medecine', label:'Médecine du travail (SEPP/CESI)', montant:25, pct:0, base:'fixe', info:'~25€/travailleur/an' },
  { id:'fond_vacances', label:"Caisse de vacances (ouvriers)", montant:0, pct:0.1538, base:'brut', info:'15.38% brut — ouvriers seulement' },
  { id:'cheques_repas', label:'Chèques-repas (contribution patronale)', montant:0, pct:0, base:'fixe_mensuel', info:'Max 6.91€/jour presté (déductible 2€)' },
];

export default function BudgetPrevisionnel({ s, d }) {
  const { tText } = useLang();
  const ae = (s?.emps || []).filter(e => e.status === 'active' || !e.status);

  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [tauxIndex, setTauxIndex] = useState(2.0); // indexation salariale %
  const [inclure13e, setInclure13e] = useState(true);
  const [inclurevacances, setInclureVacances] = useState(true);
  const [inclureActiva, setInclureActiva] = useState(false);
  const [inclureCheques, setInclureCheques] = useState(false);
  const [joursChequesRepas, setJoursChequesRepas] = useState(21);
  const [montantCheque, setMontantCheque] = useState(CR_PAT);
  const [selectedEmp, setSelectedEmp] = useState('all');
  const [tab, setTab] = useState('mensuel');

  const emps = selectedEmp === 'all' ? ae : ae.filter(e => e.id === selectedEmp);

  const budget = useMemo(() => {
    const coeff = 1 + (tauxIndex / 100);
    return emps.map(emp => {
      const brut = +(emp.monthlySalary || emp.gross || emp.brut || 0) * coeff;
      const onssE = brut * TX_ONSS_E;
      const onssW = brut * TX_ONSS_W;
      const net = brut - onssW;
      const coutMensuel = brut + onssE;
      const pecule = inclurevacances ? brut * TX_VACANCES : 0;
      const treizieme = inclure13e ? brut : 0;
      const cheques = inclureCheques ? joursChequesRepas * (montantCheque - CR_TRAV) : 0; // part patronale nette
      const activaDeduction = inclureActiva ? ACTIVA_DEDUCTION : 0;
      const coutAnnuel = (coutMensuel * 12) + pecule + treizieme + (cheques * 12) - (activaDeduction * 12);
      const mois = Array.from({length:12}, (_,i) => ({
        mois: i+1,
        brut,
        onssE,
        coutMensuel: coutMensuel + cheques - activaDeduction,
        net,
      }));
      // Mois avec pécule (juin) et 13e (décembre)
      if (inclurevacances) mois[5].coutMensuel += pecule;
      if (inclure13e) mois[11].coutMensuel += treizieme;
      return {
        emp,
        brut, onssE, onssW, net,
        coutMensuel, pecule, treizieme, cheques, activaDeduction,
        coutAnnuel,
        mois,
      };
    });
  }, [emps, tauxIndex, inclure13e, inclurevacances, inclureActiva, inclureCheques, joursChequesRepas, montantCheque]);

  const totaux = useMemo(() => ({
    brutMensuel: budget.reduce((a,b) => a+b.brut, 0),
    onssEMensuel: budget.reduce((a,b) => a+b.onssE, 0),
    coutMensuel: budget.reduce((a,b) => a+b.coutMensuel, 0),
    coutAnnuel: budget.reduce((a,b) => a+b.coutAnnuel, 0),
    netMensuel: budget.reduce((a,b) => a+b.net, 0),
  }), [budget]);

  const f2 = v => new Intl.NumberFormat('fr-BE', { minimumFractionDigits:2, maximumFractionDigits:2 }).format(v||0);
  const sCard = { background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:16, marginBottom:12 };
  const sBtn = (active) => ({ padding:'6px 14px', borderRadius:6, border:'none', fontSize:11, fontWeight:600, cursor:'pointer', background:active?'rgba(198,163,78,.12)':'rgba(255,255,255,.03)', color:active?GOLD:'#888' });
  const sInput = { padding:'8px 12px', background:'#090c16', border:'1px solid rgba(139,115,60,.15)', borderRadius:6, color:'#e5e5e5', fontSize:12, fontFamily:'inherit' };
  const sTh = { padding:'8px 10px', textAlign:'left', borderBottom:'1px solid rgba(255,255,255,.05)', color:GRAY, fontWeight:600, fontSize:10, textTransform:'uppercase' };
  const sTd = { padding:'7px 10px', borderBottom:'1px solid rgba(255,255,255,.02)', color:'#ccc', fontSize:11 };

  const MOIS_LABELS = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];

  const exportCSV = () => {
    const rows = [
      ['Travailleur','Brut mensuel','ONSS patronal','Coût mensuel','Coût annuel','Net mensuel'],
      ...budget.map(b => [
        `${b.emp.first||b.emp.fn||''} ${b.emp.last||b.emp.ln||''}`.trim(),
        b.brut.toFixed(2), b.onssE.toFixed(2), b.coutMensuel.toFixed(2), b.coutAnnuel.toFixed(2), b.net.toFixed(2)
      ]),
      ['TOTAL', totaux.brutMensuel.toFixed(2), totaux.onssEMensuel.toFixed(2), totaux.coutMensuel.toFixed(2), totaux.coutAnnuel.toFixed(2), totaux.netMensuel.toFixed(2)]
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `Budget_RH_${annee}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div style={{padding:24, color:'#e8e6e0', fontFamily:'inherit'}}>
      {/* Header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20}}>
        <div>
          <h2 style={{fontSize:22, fontWeight:700, color:GOLD, margin:'0 0 4px'}}>📊 Budget Prévisionnel RH</h2>
          <p style={{fontSize:12, color:GRAY, margin:0}}>Coût salarial total employeur — {annee} — {emps.length} travailleur{emps.length>1?'s':''}</p>
        </div>
        <button onClick={exportCSV} style={{padding:'8px 16px', borderRadius:8, border:'none', background:GOLD, color:'#0c0b09', fontSize:12, fontWeight:700, cursor:'pointer'}}>📥 Export CSV</button>
      </div>

      {/* Paramètres */}
      <div style={{...sCard}}>
        <div style={{fontSize:11, fontWeight:600, color:GRAY, marginBottom:12, textTransform:'uppercase', letterSpacing:'.5px'}}>Paramètres</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:12}}>
          <div>
            <label style={{fontSize:10, color:GRAY, display:'block', marginBottom:4}}>Année</label>
            <select value={annee} onChange={e=>setAnnee(+e.target.value)} style={sInput}>
              {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:10, color:GRAY, display:'block', marginBottom:4}}>Indexation salariale (%)</label>
            <input type="number" value={tauxIndex} step="0.1" onChange={e=>setTauxIndex(+e.target.value)} style={{...sInput, width:'100%', boxSizing:'border-box'}} />
          </div>
          <div>
            <label style={{fontSize:10, color:GRAY, display:'block', marginBottom:4}}>Travailleur</label>
            <select value={selectedEmp} onChange={e=>setSelectedEmp(e.target.value)} style={sInput}>
              <option value="all">Tous ({ae.length})</option>
              {ae.map(e=><option key={e.id} value={e.id}>{e.first||e.fn||''} {e.last||e.ln||''}</option>)}
            </select>
          </div>
          <div>
            <label style={{fontSize:10, color:GRAY, display:'block', marginBottom:4}}>Jours/mois (chèques)</label>
            <input type="number" value={joursChequesRepas} onChange={e=>setJoursChequesRepas(+e.target.value)} style={{...sInput, width:'100%', boxSizing:'border-box'}} />
          </div>
        </div>
        <div style={{display:'flex', gap:16, flexWrap:'wrap'}}>
          {[
            [inclure13e, setInclure13e, '13e mois (déc.)'],
            [inclurevacances, setInclureVacances, 'Pécule vacances (juin)'],
            [inclureActiva, setInclureActiva, `Activa.brussels (-${350}€/mois)`],
            [inclureCheques, setInclureCheques, `Chèques-repas (${montantCheque}€/jr)`],
          ].map(([val, set, label], i) => (
            <label key={i} style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:12, color:'#ccc'}}>
              <input type="checkbox" checked={val} onChange={e=>set(e.target.checked)} style={{accentColor:GOLD}} />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:16}}>
        {[
          {label:'Brut mensuel total', val:f2(totaux.brutMensuel)+'€', color:GOLD},
          {label:'ONSS patronal/mois', val:f2(totaux.onssEMensuel)+'€', color:RED},
          {label:'Coût total/mois', val:f2(totaux.coutMensuel)+'€', color:'#e8e6e0', big:true},
          {label:'Coût total annuel', val:f2(totaux.coutAnnuel)+'€', color:BLUE, big:true},
          {label:'Net versé/mois', val:f2(totaux.netMensuel)+'€', color:GREEN},
        ].map((k,i) => (
          <div key={i} style={{...sCard, marginBottom:0, textAlign:'center'}}>
            <div style={{fontSize:10, color:GRAY, marginBottom:4}}>{k.label}</div>
            <div style={{fontSize:k.big?16:14, fontWeight:700, color:k.color}}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex', gap:4, marginBottom:12}}>
        {[['mensuel','📅 Vue mensuelle'],['annuel','📋 Récap annuel'],['employes','👥 Par employé']].map(([v,l])=>
          <button key={v} onClick={()=>setTab(v)} style={sBtn(tab===v)}>{l}</button>
        )}
      </div>

      {/* Vue mensuelle */}
      {tab==='mensuel' && (
        <div style={sCard}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr>
                <th style={sTh}>Mois</th>
                <th style={{...sTh, textAlign:'right'}}>Brut total</th>
                <th style={{...sTh, textAlign:'right'}}>ONSS patronal</th>
                <th style={{...sTh, textAlign:'right', color:GOLD}}>Coût employeur</th>
                <th style={{...sTh, textAlign:'right'}}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {MOIS_LABELS.map((m,i) => {
                const brutTotal = budget.reduce((a,b)=>a+b.mois[i].brut,0);
                const onssTotal = budget.reduce((a,b)=>a+b.mois[i].onssE,0);
                const coutTotal = budget.reduce((a,b)=>a+b.mois[i].coutMensuel,0);
                const note = [];
                if (i===5 && inclurevacances) note.push('+ Pécule vacances');
                if (i===11 && inclure13e) note.push('+ 13e mois');
                return (
                  <tr key={i} style={{background: (i===5||i===11)?'rgba(198,163,78,.04)':'transparent'}}>
                    <td style={sTd}>{m} {annee}</td>
                    <td style={{...sTd, textAlign:'right'}}>{f2(brutTotal)} €</td>
                    <td style={{...sTd, textAlign:'right', color:RED}}>{f2(onssTotal)} €</td>
                    <td style={{...sTd, textAlign:'right', fontWeight:700, color:GOLD}}>{f2(coutTotal)} €</td>
                    <td style={{...sTd, fontSize:10, color:GOLD}}>{note.join(' ')}</td>
                  </tr>
                );
              })}
              <tr style={{borderTop:'2px solid rgba(198,163,78,.3)'}}>
                <td style={{...sTd, fontWeight:700, color:'#e8e6e0'}}>TOTAL {annee}</td>
                <td style={{...sTd, textAlign:'right', fontWeight:700}}>{f2(totaux.brutMensuel*12)} €</td>
                <td style={{...sTd, textAlign:'right', fontWeight:700, color:RED}}>{f2(totaux.onssEMensuel*12)} €</td>
                <td style={{...sTd, textAlign:'right', fontWeight:700, color:GOLD, fontSize:14}}>{f2(totaux.coutAnnuel)} €</td>
                <td style={sTd}></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Récap annuel */}
      {tab==='annuel' && (
        <div style={sCard}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr>
                {['Poste de coût','Mensuel','Annuel','% masse salariale'].map(h=><th key={h} style={sTh}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                {label:'Rémunérations brutes', val:totaux.brutMensuel, color:'#e8e6e0'},
                {label:`ONSS patronal (${(TX_ONSS_E*100).toFixed(2)}%)`, val:totaux.onssEMensuel, color:RED},
                ...(inclureCheques?[{label:'Chèques-repas (part patronale)', val:budget.reduce((a,b)=>a+b.cheques,0), color:BLUE}]:[]),
                ...(inclurevacances?[{label:'Pécule vacances (juin)', val:budget.reduce((a,b)=>a+b.pecule,0)/12, color:GOLD}]:[]),
                ...(inclure13e?[{label:'13e mois (décembre)', val:budget.reduce((a,b)=>a+b.treizieme,0)/12, color:GOLD}]:[]),
                ...(inclureActiva?[{label:'Réduction Activa.brussels', val:-budget.reduce((a,b)=>a+b.activaDeduction,0), color:GREEN}]:[]),
              ].map((p,i)=>(
                <tr key={i}>
                  <td style={sTd}>{p.label}</td>
                  <td style={{...sTd, fontWeight:600, color:p.color}}>{f2(p.val)} €</td>
                  <td style={{...sTd, fontWeight:600, color:p.color}}>{f2(p.val*12)} €</td>
                  <td style={{...sTd, color:GRAY}}>{totaux.coutMensuel>0?(Math.abs(p.val)/totaux.coutMensuel*100).toFixed(1)+'%':'-'}</td>
                </tr>
              ))}
              <tr style={{borderTop:'2px solid rgba(198,163,78,.3)'}}>
                <td style={{...sTd, fontWeight:700, color:'#e8e6e0'}}>COÛT TOTAL EMPLOYEUR</td>
                <td style={{...sTd, fontWeight:700, color:GOLD, fontSize:14}}>{f2(totaux.coutMensuel)} €</td>
                <td style={{...sTd, fontWeight:700, color:GOLD, fontSize:14}}>{f2(totaux.coutAnnuel)} €</td>
                <td style={{...sTd, fontWeight:700, color:GOLD}}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Par employé */}
      {tab==='employes' && (
        <div style={sCard}>
          {budget.length === 0 ? (
            <p style={{color:GRAY, fontSize:12, textAlign:'center', padding:20}}>Aucun employé actif trouvé. Ajoutez des employés d'abord.</p>
          ) : (
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr>
                  {['Travailleur','Brut','ONSS pat.','Coût/mois','Coût annuel','Net','Taux charge'].map(h=><th key={h} style={sTh}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {budget.map((b,i)=>{
                  const name = `${b.emp.first||b.emp.fn||''} ${b.emp.last||b.emp.ln||''}`.trim()||'Employé';
                  const txCharge = b.brut>0?(b.coutAnnuel/(b.brut*12)-1)*100:0;
                  return (
                    <tr key={i}>
                      <td style={{...sTd, fontWeight:600}}>{name}</td>
                      <td style={sTd}>{f2(b.brut)} €</td>
                      <td style={{...sTd, color:RED}}>{f2(b.onssE)} €</td>
                      <td style={{...sTd, fontWeight:700, color:GOLD}}>{f2(b.coutMensuel)} €</td>
                      <td style={{...sTd, fontWeight:700, color:BLUE}}>{f2(b.coutAnnuel)} €</td>
                      <td style={{...sTd, color:GREEN}}>{f2(b.net)} €</td>
                      <td style={{...sTd, color:GRAY}}>+{txCharge.toFixed(1)}%</td>
                    </tr>
                  );
                })}
                <tr style={{borderTop:'2px solid rgba(198,163,78,.3)'}}>
                  <td style={{...sTd, fontWeight:700}}>TOTAL</td>
                  <td style={{...sTd, fontWeight:700}}>{f2(totaux.brutMensuel)} €</td>
                  <td style={{...sTd, fontWeight:700, color:RED}}>{f2(totaux.onssEMensuel)} €</td>
                  <td style={{...sTd, fontWeight:700, color:GOLD}}>{f2(totaux.coutMensuel)} €</td>
                  <td style={{...sTd, fontWeight:700, color:BLUE}}>{f2(totaux.coutAnnuel)} €</td>
                  <td style={{...sTd, fontWeight:700, color:GREEN}}>{f2(totaux.netMensuel)} €</td>
                  <td style={sTd}></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
