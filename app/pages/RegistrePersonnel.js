'use client';
// ═══════════════════════════════════════════════════════════════
// REGISTRE DU PERSONNEL — Aureus Social Pro
// Obligation légale : Art. 8 Loi 08/04/1965 — Règlement du travail
// Doit être tenu à jour et accessible à l'Inspection Sociale
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo } from 'react';
import { C, fmt } from '@/app/lib/helpers';

const GOLD='#c6a34e',GREEN='#22c55e',BLUE='#60a5fa',RED='#ef4444',PURPLE='#a78bfa';

const CONTRACT_TYPES = {CDI:'CDI',CDD:'CDD',student:'Étudiant',flexi:'Flexi-job',interimaire:'Intérimaire'};
const STATUS_COLORS = {active:GREEN,sorti:RED,suspendu:'#fb923c'};

export default function RegistrePersonnel({s, d}) {
  s = s||{emps:[],co:{}};
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCP, setFilterCP] = useState('all');
  const [sortField, setSortField] = useState('name');

  const emps = s.emps||[];
  const CPs = [...new Set(emps.map(e=>e.cp||'200'))].sort();

  const filtered = useMemo(() => {
    return emps
      .filter(e => filterStatus==='all' || e.status===filterStatus || (!e.status&&filterStatus==='active'))
      .filter(e => filterCP==='all' || (e.cp||'200')===filterCP)
      .filter(e => !search || `${e.first||''} ${e.last||''} ${e.niss||''} ${e.fn||''}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a,b) => {
        if(sortField==='name') return `${a.last||''} ${a.first||''}`.localeCompare(`${b.last||''} ${b.first||''}`);
        if(sortField==='entry') return new Date(a.startDate||0)-new Date(b.startDate||0);
        if(sortField==='cp') return (a.cp||'200').localeCompare(b.cp||'200');
        if(sortField==='brut') return (b.monthlySalary||0)-(a.monthlySalary||0);
        return 0;
      });
  }, [emps, search, filterStatus, filterCP, sortField]);

  const stats = useMemo(() => ({
    actifs: emps.filter(e=>e.status==='active'||!e.status).length,
    sortis: emps.filter(e=>e.status==='sorti').length,
    cdi: emps.filter(e=>!e.contractType||e.contractType==='CDI').length,
    cdd: emps.filter(e=>e.contractType==='CDD').length,
    etudiants: emps.filter(e=>e.contractType==='student'||e.contract==='student').length,
    masseTotale: emps.filter(e=>e.status!=='sorti').reduce((a,e)=>a+(e.monthlySalary||0),0),
    sansNISS: emps.filter(e=>!e.niss).length,
    sansIBAN: emps.filter(e=>!e.iban).length,
  }), [emps]);

  const exportCSV = () => {
    const headers = ['N°','Nom','Prénom','NISS','Date entrée','Date sortie','Type contrat','Statut','CP','Brut','IBAN','Email'];
    const rows = filtered.map((e,i) => [
      i+1,
      e.last||'',e.first||e.fn||'',
      e.niss||'',
      e.startDate||e.startD||'',e.endDate||e.endD||'',
      CONTRACT_TYPES[e.contractType||e.contract]||'CDI',
      e.status==='sorti'?'Sorti':'Actif',
      e.cp||'200',
      e.monthlySalary||0,
      e.iban||'',e.email||''
    ].join(';'));
    const csv = '\uFEFF' + headers.join(';') + '\n' + rows.join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');a.href=url;a.download=`Registre_Personnel_${s.co?.name||'Aureus'}_${new Date().toISOString().slice(0,10)}.csv`;a.click();
    URL.revokeObjectURL(url);
  };

  const SortBtn = ({field, label}) => (
    <button onClick={()=>setSortField(field)}
      style={{padding:'3px 8px',borderRadius:5,border:'none',background:sortField===field?`${GOLD}20`:'transparent',color:sortField===field?GOLD:'#5e5c56',fontSize:10,cursor:'pointer',fontWeight:sortField===field?700:400}}>
      {label} {sortField===field?'▲':''}
    </button>
  );

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:'#e8e6e0',margin:0}}>Registre du Personnel</h1>
          <div style={{fontSize:10,color:'#5e5c56',marginTop:3}}>Art. 8 Loi 08/04/1965 · Accessible Inspection Sociale · {emps.length} travailleur(s)</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{padding:'9px 16px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',background:'rgba(198,163,78,.08)',color:GOLD,fontSize:11,cursor:'pointer',fontWeight:600}}>📥 Export CSV</button>
          <button onClick={()=>d&&d({type:'NAV',page:'employees'})} style={{padding:'9px 16px',borderRadius:8,border:'1px solid rgba(34,197,94,.2)',background:'rgba(34,197,94,.08)',color:GREEN,fontSize:11,cursor:'pointer',fontWeight:600}}>+ Ajouter</button>
        </div>
      </div>

      {/* Alertes légales */}
      {(stats.sansNISS > 0 || stats.sansIBAN > 0) && (
        <div style={{padding:'12px 16px',marginBottom:16,background:'rgba(239,68,68,.04)',border:'1px solid rgba(239,68,68,.15)',borderRadius:10,display:'flex',gap:14,flexWrap:'wrap',alignItems:'center'}}>
          <span style={{fontSize:13}}>⚠️</span>
          <span style={{fontSize:11,color:'#f87171',fontWeight:600}}>Dossiers incomplets :</span>
          {stats.sansNISS>0 && <span style={{fontSize:11,color:'#f87171'}}>{stats.sansNISS} sans NISS</span>}
          {stats.sansIBAN>0 && <span style={{fontSize:11,color:'#fb923c'}}>{stats.sansIBAN} sans IBAN</span>}
          <span style={{fontSize:10,color:'#5e5c56'}}>— Obligatoire pour Dimona et virement SEPA</span>
        </div>
      )}

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10,marginBottom:18}}>
        {[
          {l:'Actifs',v:stats.actifs,c:GREEN},{l:'Sortis',v:stats.sortis,c:RED},
          {l:'CDI',v:stats.cdi,c:GOLD},{l:'CDD',v:stats.cdd,c:BLUE},
          {l:'Étudiants',v:stats.etudiants,c:PURPLE},{l:'Masse brute',v:fmt(stats.masseTotale),c:GOLD},
        ].map(k=>(
          <div key={k.l} style={{padding:'12px 14px',background:'rgba(255,255,255,.02)',border:'1px solid rgba(139,115,60,.08)',borderRadius:10,textAlign:'center'}}>
            <div style={{fontSize:16,fontWeight:700,color:k.c}}>{k.v}</div>
            <div style={{fontSize:9,color:'#5e5c56',marginTop:3}}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher nom / NISS..."
          style={{padding:'8px 12px',borderRadius:7,border:'1px solid rgba(198,163,78,.15)',background:'#0e1220',color:'#d4d0c8',fontSize:11,outline:'none',width:200}}/>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
          style={{padding:'8px 10px',borderRadius:7,border:'1px solid rgba(198,163,78,.12)',background:'#0e1220',color:'#d4d0c8',fontSize:11,cursor:'pointer'}}>
          <option value='all'>Tous statuts</option><option value='active'>Actifs</option><option value='sorti'>Sortis</option>
        </select>
        <select value={filterCP} onChange={e=>setFilterCP(e.target.value)}
          style={{padding:'8px 10px',borderRadius:7,border:'1px solid rgba(198,163,78,.12)',background:'#0e1220',color:'#d4d0c8',fontSize:11,cursor:'pointer'}}>
          <option value='all'>Toutes CP</option>
          {CPs.map(cp=><option key={cp} value={cp}>CP {cp}</option>)}
        </select>
        <div style={{display:'flex',gap:4,marginLeft:'auto'}}>
          <SortBtn field='name' label='Nom'/>
          <SortBtn field='entry' label='Entrée'/>
          <SortBtn field='cp' label='CP'/>
          <SortBtn field='brut' label='Brut'/>
        </div>
      </div>

      {/* Table */}
      <C style={{overflow:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead>
            <tr style={{borderBottom:'1px solid rgba(198,163,78,.12)'}}>
              {['N°','Nom / Prénom','NISS','Entrée','Sortie','Contrat','Statut','CP','Brut',''].map(h=>(
                <th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:9,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'1px',fontWeight:600,whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} style={{padding:30,textAlign:'center',color:'#5e5c56'}}>Aucun résultat</td></tr>
            ) : filtered.map((e,i) => {
              const isActif = e.status!=='sorti';
              return (
                <tr key={e.id||i} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}
                  onMouseEnter={ev=>ev.currentTarget.style.background='rgba(198,163,78,.03)'}
                  onMouseLeave={ev=>ev.currentTarget.style.background='transparent'}>
                  <td style={{padding:'9px 12px',color:'#5e5c56',fontSize:10}}>{i+1}</td>
                  <td style={{padding:'9px 12px'}}>
                    <div style={{fontWeight:600,color:'#e8e6e0'}}>{e.last||e.ln||''} {e.first||e.fn||''}</div>
                    <div style={{fontSize:9,color:'#5e5c56',marginTop:1}}>{e.email||'—'}</div>
                  </td>
                  <td style={{padding:'9px 12px',fontFamily:'monospace',fontSize:10,color:e.niss?'#d4d0c8':RED}}>{e.niss||'⚠️ Manquant'}</td>
                  <td style={{padding:'9px 12px',color:'#d4d0c8',fontSize:10}}>{e.startDate||e.startD||'—'}</td>
                  <td style={{padding:'9px 12px',color:'#5e5c56',fontSize:10}}>{e.endDate||e.endD||'—'}</td>
                  <td style={{padding:'9px 12px'}}><span style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:`${BLUE}15`,color:BLUE,fontWeight:600}}>{CONTRACT_TYPES[e.contractType||e.contract]||'CDI'}</span></td>
                  <td style={{padding:'9px 12px'}}><span style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:`${STATUS_COLORS[e.status||'active']}15`,color:STATUS_COLORS[e.status||'active'],fontWeight:700}}>{e.status==='sorti'?'SORTI':'ACTIF'}</span></td>
                  <td style={{padding:'9px 12px',color:GOLD,fontSize:10,fontWeight:600}}>{e.cp||'200'}</td>
                  <td style={{padding:'9px 12px',color:GREEN,fontWeight:700}}>{fmt(e.monthlySalary||0)}</td>
                  <td style={{padding:'9px 12px'}}>
                    <button onClick={()=>d&&d({type:'NAV',page:'employees'})}
                      style={{padding:'4px 8px',borderRadius:5,border:'1px solid rgba(198,163,78,.15)',background:'transparent',color:GOLD,fontSize:9,cursor:'pointer',fontWeight:600}}>✏️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{padding:'10px 14px',fontSize:10,color:'#5e5c56',borderTop:'1px solid rgba(255,255,255,.03)'}}>
          {filtered.length} / {emps.length} travailleur(s) · Masse brute filtrée: {fmt(filtered.reduce((a,e)=>a+(e.monthlySalary||0),0))}
        </div>
      </C>
    </div>
  );
}
