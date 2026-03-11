'use client';
// ═══════════════════════════════════════════════════════════════
// PORTAIL CLIENT / FIDUCIAIRE — Aureus Social Pro
// Vue multi-clients : résumé masse salariale, alertes, accès rapide
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo } from 'react';
import { C, fmt, f2, calc, DPER } from '@/app/lib/helpers';

const GOLD='#c6a34e',GREEN='#22c55e',BLUE='#60a5fa',RED='#ef4444',PURPLE='#a78bfa';

export default function PortailClient({s, d}) {
  s = s||{emps:[],pays:[],co:{},clients:[]};
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('masse');
  const [activeClient, setActiveClient] = useState(null);

  const clients = s.clients||[];
  const emps = s.emps||[];

  // Grouper les employés par client
  const clientStats = useMemo(() => {
    return clients.map(cl => {
      const clEmps = emps.filter(e=>e.clientId===cl.id||(cl.id==='default'&&!e.clientId));
      const activeEmps = clEmps.filter(e=>e.status==='active'||!e.status);
      const masse = activeEmps.reduce((a,e)=>a+(e.monthlySalary||0),0);
      const calcs = activeEmps.map(e=>({e,c:calc(e,DPER,s.co)}));
      const cout = calcs.reduce((a,x)=>a+x.c.costTotal,0);
      const net = calcs.reduce((a,x)=>a+x.c.net,0);
      const alertes = activeEmps.filter(e=>!e.niss||!e.iban||!e.monthlySalary).length;
      return { ...cl, activeEmps: activeEmps.length, totalEmps: clEmps.length, masse, cout, net, alertes };
    }).filter(cl => !search || cl.name?.toLowerCase().includes(search.toLowerCase()) || cl.vat?.includes(search));
  }, [clients, emps, search, s.co]);

  const sorted = useMemo(() => [...clientStats].sort((a,b) => {
    if(sortBy==='masse') return b.masse-a.masse;
    if(sortBy==='emps') return b.activeEmps-a.activeEmps;
    if(sortBy==='alertes') return b.alertes-a.alertes;
    return (a.name||'').localeCompare(b.name||'');
  }), [clientStats, sortBy]);

  const totalMasse = clientStats.reduce((a,c)=>a+c.masse,0);
  const totalEmps = clientStats.reduce((a,c)=>a+c.activeEmps,0);
  const totalAlertes = clientStats.reduce((a,c)=>a+c.alertes,0);

  return (
    <div>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:'#e8e6e0',margin:0}}>Portail Client — Fiduciaire</h1>
          <div style={{fontSize:11,color:'#5e5c56',marginTop:4}}>{clients.length} client(s) · {totalEmps} travailleur(s) actif(s)</div>
        </div>
        <button onClick={()=>d&&d({type:'NAV',page:'onboarding'})}
          style={{padding:'10px 18px',borderRadius:9,border:'1px solid rgba(198,163,78,.3)',background:'rgba(198,163,78,.1)',color:GOLD,fontSize:12,cursor:'pointer',fontWeight:700}}>
          + Nouveau client
        </button>
      </div>

      {/* KPIs globaux */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[
          {label:'Clients actifs', value:clients.length, color:GOLD, icon:'🏢'},
          {label:'Travailleurs total', value:totalEmps, color:BLUE, icon:'👥'},
          {label:'Masse salariale', value:fmt(totalMasse), color:GREEN, icon:'💰'},
          {label:'Alertes dossiers', value:totalAlertes, color:totalAlertes>0?RED:'#5e5c56', icon:'⚠️'},
        ].map(k=>(
          <div key={k.label} style={{padding:'16px 18px',background:'linear-gradient(145deg,#0e1220,#131829)',border:'1px solid rgba(139,115,60,.1)',borderRadius:12}}>
            <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'1px',marginBottom:6}}>{k.icon} {k.label}</div>
            <div style={{fontSize:22,fontWeight:700,color:k.color}}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Barre recherche + tri */}
      <div style={{display:'flex',gap:10,marginBottom:14}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Rechercher un client..."
          style={{flex:1,padding:'9px 14px',borderRadius:8,border:'1px solid rgba(198,163,78,.15)',background:'#0e1220',color:'#d4d0c8',fontSize:12,outline:'none'}}/>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
          style={{padding:'9px 12px',borderRadius:8,border:'1px solid rgba(198,163,78,.15)',background:'#0e1220',color:'#d4d0c8',fontSize:12,cursor:'pointer'}}>
          <option value='masse'>Trier: Masse</option>
          <option value='emps'>Trier: Employés</option>
          <option value='alertes'>Trier: Alertes</option>
          <option value='nom'>Trier: Nom</option>
        </select>
      </div>

      {/* Liste clients */}
      {clients.length === 0
        ? <div style={{padding:50,textAlign:'center',border:'1px dashed rgba(198,163,78,.1)',borderRadius:12,color:'#5e5c56'}}>
            <div style={{fontSize:32,marginBottom:12}}>🏢</div>
            <div style={{fontSize:14,fontWeight:600,color:'#e8e6e0',marginBottom:8}}>Aucun client</div>
            <div style={{fontSize:11,marginBottom:16}}>Créez votre premier dossier client pour commencer</div>
            <button onClick={()=>d&&d({type:'NAV',page:'onboarding'})}
              style={{padding:'10px 20px',borderRadius:9,border:'1px solid rgba(198,163,78,.3)',background:'rgba(198,163,78,.1)',color:GOLD,fontSize:12,cursor:'pointer',fontWeight:700}}>+ Nouveau client</button>
          </div>
        : <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {sorted.map(cl=>(
              <div key={cl.id} onClick={()=>setActiveClient(activeClient===cl.id?null:cl.id)}
                style={{padding:'14px 18px',background:'rgba(255,255,255,.02)',border:`1px solid ${cl.alertes>0?'rgba(239,68,68,.15)':'rgba(139,115,60,.1)'}`,borderRadius:11,cursor:'pointer',transition:'all .15s'}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(198,163,78,.04)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.02)'}>
                <div style={{display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:40,height:40,borderRadius:10,background:`${GOLD}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,color:GOLD}}>
                    {(cl.name||'?')[0]}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>{cl.name||'—'}</div>
                    <div style={{fontSize:10,color:'#5e5c56',marginTop:2}}>{cl.vat||cl.bce||'—'} · {cl.activeEmps} travailleur(s)</div>
                  </div>
                  <div style={{textAlign:'right',minWidth:120}}>
                    <div style={{fontSize:14,fontWeight:700,color:GREEN}}>{fmt(cl.masse)}</div>
                    <div style={{fontSize:9,color:'#5e5c56'}}>masse brute/mois</div>
                  </div>
                  {cl.alertes > 0 && <span style={{fontSize:9,padding:'3px 8px',borderRadius:5,background:'rgba(239,68,68,.12)',color:RED,fontWeight:700}}>{cl.alertes} alerte{cl.alertes>1?'s':''}</span>}
                  <span style={{fontSize:12,color:'#5e5c56',transition:'transform .2s',transform:activeClient===cl.id?'rotate(180deg)':'none'}}>▼</span>
                </div>
                {/* Détail déplié */}
                {activeClient===cl.id && (
                  <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid rgba(255,255,255,.04)',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                    {[
                      {l:'Travailleurs actifs', v:cl.activeEmps, c:BLUE},
                      {l:'Net total', v:fmt(cl.net), c:GREEN},
                      {l:'Coût employeur', v:fmt(cl.cout), c:PURPLE},
                      {l:'Alertes dossier', v:cl.alertes, c:cl.alertes>0?RED:'#5e5c56'},
                    ].map(x=>(
                      <div key={x.l} style={{padding:'10px 12px',background:'rgba(255,255,255,.02)',borderRadius:8,border:'1px solid rgba(255,255,255,.04)'}}>
                        <div style={{fontSize:9,color:'#5e5c56',marginBottom:4}}>{x.l}</div>
                        <div style={{fontSize:14,fontWeight:700,color:x.c}}>{x.v}</div>
                      </div>
                    ))}
                    <div style={{gridColumn:'1/-1',display:'flex',gap:6,marginTop:4}}>
                      <button onClick={e=>{e.stopPropagation();d&&d({type:'NAV',page:'employees'})}}
                        style={{padding:'7px 14px',borderRadius:7,border:'1px solid rgba(198,163,78,.2)',background:'rgba(198,163,78,.06)',color:GOLD,fontSize:11,cursor:'pointer',fontWeight:600}}>👥 Travailleurs</button>
                      <button onClick={e=>{e.stopPropagation();d&&d({type:'NAV',page:'payslip'})}}
                        style={{padding:'7px 14px',borderRadius:7,border:'1px solid rgba(34,197,94,.2)',background:'rgba(34,197,94,.06)',color:GREEN,fontSize:11,cursor:'pointer',fontWeight:600}}>💰 Fiches de paie</button>
                      <button onClick={e=>{e.stopPropagation();d&&d({type:'NAV',page:'onss'})}}
                        style={{padding:'7px 14px',borderRadius:7,border:'1px solid rgba(96,165,250,.2)',background:'rgba(96,165,250,.06)',color:BLUE,fontSize:11,cursor:'pointer',fontWeight:600}}>📡 Dimona</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
      }
    </div>
  );
}
