'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LOIS_BELGES, LB, RMMMG, TX_ONSS_W, TX_ONSS_E, NET_FACTOR, PV_DOUBLE, PV_SIMPLE, PP_EST } from '@/app/lib/lois-belges';

const fmt = n => new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(n || 0);
const fmtP = n => `${((n||0)*100).toFixed(2)}%`;
const uid = () => `${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
const AUREUS_INFO = { name: 'Aureus IA SPRL', vat: 'BE 1028.230.781', version: 'v38', sprint: 'Sprint 38' };
const LEGAL = { WD: 21.67, WHD: 7.6 };
const DPER = { month: new Date().getMonth()+1, year: new Date().getFullYear(), days: 21.67 };
const MN_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function PH({title,sub}){return <div style={{marginBottom:16}}><div style={{fontSize:18,fontWeight:800,color:'#c6a34e',letterSpacing:'.3px'}}>{title}</div>{sub&&<div style={{fontSize:11,color:'#9e9b93',marginTop:2}}>{sub}</div>}</div>;}
function C({children,style}){return <div style={{padding:'16px 20px',background:'rgba(198,163,78,.03)',borderRadius:12,border:'1px solid rgba(198,163,78,.06)',marginBottom:14,...style}}>{children}</div>;}
function ST({children}){return <div style={{fontSize:13,fontWeight:700,color:'#c6a34e',marginBottom:10,paddingBottom:6,borderBottom:'1px solid rgba(198,163,78,.1)'}}>{children}</div>;}

function calc(emp, per, co) {
  var brut = +(emp&&(emp.monthlySalary||emp.gross)||0);
  var onssW = Math.round(brut * TX_ONSS_W * 100) / 100;
  var imposable = brut - onssW;
  var pp = Math.round(imposable * PP_EST * 100) / 100;
  var net = Math.round((imposable - pp) * 100) / 100;
  var onssE = Math.round(brut * TX_ONSS_E * 100) / 100;
  return {base:brut,gross:brut,onssNet:onssW,imposable:imposable,tax:pp,pp:pp,css:0,net:net,onssE:onssE,costTotal:Math.round((brut+onssE)*100)/100,bonus:0,overtime:0,sunday:0,night:0,y13:0,sickPay:0,atnCar:0,cotCO2:0,hsBrutNetTotal:0};
}

function quickPP(brut) {
  const imposable = brut - brut * TX_ONSS_W;
  if (imposable <= 1110) return 0;
  if (imposable <= 1560) return Math.round((imposable - 1110) * 0.2668 * 100) / 100;
  if (imposable <= 2700) return Math.round((120.06 + (imposable - 1560) * 0.4280) * 100) / 100;
  return Math.round((607.98 + (imposable - 2700) * 0.4816) * 100) / 100;
}

function quickNet(brut) { return Math.round((brut||0) * NET_FACTOR * 100) / 100; }
function escapeHtml(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function AdminDashboard({s,d}){
  const sub=s.sub||'admin_users';
  const [users,setUsers]=useState([]);
  const [clients,setClients]=useState([]);
  const [travailleurs,setTravailleurs]=useState([]);
  const [fiches,setFiches]=useState([]);
  const [audit,setAudit]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [selectedUser,setSelectedUser]=useState(null);
  const [dateRange,setDateRange]=useState('30');

  // Charger données depuis Supabase
  useEffect(()=>{
    loadData();
  },[sub]);

  async function loadData(){
    try{
      setLoading(true);
      const {supabase}=await import('./lib/supabase');
      if(!supabase){setLoading(false);return;}
      const [uRes,cRes,tRes,fRes]=await Promise.all([
        supabase.from('users').select('*').limit(200),
        supabase.from('clients').select('*').limit(500),
        supabase.from('travailleurs').select('*').limit(2000),
        supabase.from('fiches_paie').select('*').limit(5000),
      ]);
      if(uRes.data)setUsers(uRes.data);
      if(cRes.data)setClients(cRes.data);
      if(tRes.data)setTravailleurs(tRes.data);
      if(fRes.data)setFiches(fRes.data);
    }catch(e){console.error('AdminDashboard loadData:',e);}
    finally{setLoading(false);}
  }

  // Stats globales
  const totalUsers=users.length;
  const activeUsers=users.filter(u=>u.active).length;
  const totalClients=clients.length;
  const activeClients=clients.filter(c=>c.active).length;
  const totalTrav=travailleurs.length;
  const activeTrav=travailleurs.filter(t=>t.actif).length;
  const totalFiches=fiches.length;
  const fichesMois=fiches.filter(f=>{const now=new Date();return f.annee===now.getFullYear()&&f.mois===now.getMonth()+1;}).length;
  
  // Revenue calc
  const revenuMensuelEstime=totalTrav*12; // 12€/fiche
  const revenuAnnuelEstime=revenuMensuelEstime*12;
  
  // Travailleurs par client
  const travParClient={};
  travailleurs.forEach(t=>{travParClient[t.client_id]=(travParClient[t.client_id]||0)+1;});
  const moyTravParClient=totalClients>0?(totalTrav/totalClients).toFixed(1):0;

  // Cards style
  const Stat=({label,value,sub,color,icon})=><div style={{padding:16,background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)",flex:1,minWidth:140}}>
    <div style={{fontSize:11,color:'#9e9b93',marginBottom:4}}>{icon} {label}</div>
    <div style={{fontSize:26,fontWeight:700,color:color||'#e8e6e0'}}>{value}</div>
    {sub&&<div style={{fontSize:10,color:'#5e5c56',marginTop:2}}>{sub}</div>}
  </div>;

  const Badge=({text,color})=><span style={{padding:'2px 8px',borderRadius:10,fontSize:10,fontWeight:600,background:`${color}15`,color,border:`1px solid ${color}30`}}>{text}</span>;

  // Format date
  const fDate=(d)=>{if(!d)return'-';const dt=new Date(d);return dt.toLocaleDateString('fr-BE',{day:'2-digit',month:'2-digit',year:'numeric'});};
  const fDateTime=(d)=>{if(!d)return'-';const dt=new Date(d);return dt.toLocaleDateString('fr-BE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});};
  const timeAgo=(d)=>{if(!d)return'Jamais';const now=new Date();const dt=new Date(d);const diff=Math.floor((now-dt)/1000);if(diff<60)return'Il y a '+diff+'s';if(diff<3600)return'Il y a '+Math.floor(diff/60)+'min';if(diff<86400)return'Il y a '+Math.floor(diff/3600)+'h';return'Il y a '+Math.floor(diff/86400)+'j';};

  return <div>
    <div style={{padding:'18px 24px',borderBottom:'1px solid rgba(139,115,60,.15)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:'#e8e6e0'}}>👑 Administration Aureus Social Pro</div>
        <div style={{fontSize:11.5,color:'#9e9b93',marginTop:2}}>Panneau de controle — Vue globale plateforme</div>
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <button onClick={loadData} style={{padding:'6px 14px',borderRadius:8,border:'1px solid rgba(198,163,78,.3)',background:'rgba(198,163,78,.08)',color:'#c6a34e',fontSize:11,cursor:'pointer',fontWeight:600}}>🔄 Rafraichir</button>
        <div style={{fontSize:10,color:loading?'#fb923c':'#4ade80'}}>● {loading?'Chargement...':'Connecte'}</div>
      </div>
    </div>
    
    <div style={{padding:24,maxHeight:'calc(100vh - 200px)',overflowY:'auto'}}>
    
    {/* ═══ ONGLET: USERS ═══ */}
    {sub==='admin_users'&&<div>
      {/* KPIs */}
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <Stat icon="👤" label="Utilisateurs total" value={totalUsers} sub={`${activeUsers} actifs`} color="#c6a34e"/>
        <Stat icon="🏢" label="Dossiers clients" value={totalClients} sub={`${activeClients} actifs`} color="#60a5fa"/>
        <Stat icon="👥" label="Travailleurs" value={totalTrav} sub={`${activeTrav} actifs`} color="#4ade80"/>
        <Stat icon="📄" label="Fiches de paie" value={totalFiches} sub={`${fichesMois} ce mois`} color="#a78bfa"/>
        <Stat icon="💰" label="Revenu mensuel est." value={`€${revenuMensuelEstime.toLocaleString()}`} sub={`€${revenuAnnuelEstime.toLocaleString()}/an`} color="#c6a34e"/>
      </div>

      {/* Search */}
      <div style={{marginBottom:16}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher un utilisateur (nom, email...)" style={{width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(198,163,78,.15)',borderRadius:8,color:'#e8e6e0',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
      </div>

      {/* Users table */}
      <div style={{background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)",overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 2fr 1fr 1fr 1.5fr 1.5fr 1fr',padding:'10px 14px',background:"rgba(198,163,78,.06)",borderBottom:'1px solid rgba(198,163,78,.1)',fontSize:10,fontWeight:600,color:'#c6a34e',textTransform:'uppercase',letterSpacing:.5}}>
          <div>Nom</div><div>Email</div><div>Role</div><div>Langue</div><div>Derniere connexion</div><div>Inscription</div><div>Statut</div>
        </div>
        {users.length===0?<div style={{padding:30,textAlign:'center',color:'#5e5c56',fontSize:12}}>
          {loading?'Chargement...':'Aucun utilisateur inscrit. Les utilisateurs apparaitront ici apres inscription.'}
        </div>:
        users.filter(u=>{
          if(!search)return true;
          const s=search.toLowerCase();
          return (u.nom||'').toLowerCase().includes(s)||(u.email||'').toLowerCase().includes(s)||(u.prenom||'').toLowerCase().includes(s);
        }).map((u,i)=>{
          const nbClients=clients.filter(c=>c.user_id===u.id).length;
          const nbTrav=travailleurs.filter(t=>clients.some(c=>c.id===t.client_id&&c.user_id===u.id)).length;
          return <div key={u.id} onClick={()=>setSelectedUser(selectedUser===u.id?null:u.id)} style={{display:'grid',gridTemplateColumns:'2fr 2fr 1fr 1fr 1.5fr 1.5fr 1fr',padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.03)',cursor:'pointer',background:selectedUser===u.id?"rgba(198,163,78,.06)":i%2===0?"transparent":"rgba(255,255,255,.01)",fontSize:11.5,alignItems:'center',transition:'background .15s'}}>
            <div>
              <div style={{fontWeight:600,color:'#e8e6e0'}}>{u.prenom||''} {u.nom||''}</div>
              <div style={{fontSize:10,color:'#5e5c56'}}>{nbClients} dossier{nbClients!==1?'s':''} · {nbTrav} travailleur{nbTrav!==1?'s':''}</div>
            </div>
            <div style={{color:'#9e9b93'}}>{u.email}</div>
            <div><Badge text={u.role||'admin'} color={u.role==='admin'?'#c6a34e':u.role==='gestionnaire'?'#60a5fa':'#9e9b93'}/></div>
            <div style={{color:'#9e9b93',fontSize:11}}>{(u.lang||'fr').toUpperCase()}</div>
            <div style={{color:'#9e9b93',fontSize:10.5}}>{timeAgo(u.last_login)}</div>
            <div style={{color:'#9e9b93',fontSize:10.5}}>{fDate(u.created_at)}</div>
            <div><Badge text={u.active?'Actif':'Inactif'} color={u.active?'#4ade80':'#f87171'}/></div>
          </div>;
        })}
        
        {/* Detail panel */}
        {selectedUser&&<div style={{padding:16,background:"rgba(198,163,78,.04)",borderTop:'1px solid rgba(198,163,78,.15)'}}>
          {(()=>{
            const u=users.find(u=>u.id===selectedUser);
            if(!u)return null;
            const uClients=clients.filter(c=>c.user_id===u.id);
            const uTrav=travailleurs.filter(t=>uClients.some(c=>c.id===t.client_id));
            const uFiches=fiches.filter(f=>uClients.some(c=>c.id===f.client_id));
            const revenu=uTrav.length*12;
            return <div>
              <div style={{fontSize:13,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Detail: {u.prenom} {u.nom} ({u.email})</div>
              <div style={{display:'flex',gap:12,marginBottom:12,flexWrap:'wrap'}}>
                <Stat icon="🏢" label="Dossiers" value={uClients.length} color="#60a5fa"/>
                <Stat icon="👥" label="Travailleurs" value={uTrav.length} color="#4ade80"/>
                <Stat icon="📄" label="Fiches" value={uFiches.length} color="#a78bfa"/>
                <Stat icon="💰" label="Revenu/mois" value={`€${revenu}`} sub={`€${revenu*12}/an`} color="#c6a34e"/>
              </div>
              {uClients.length>0&&<div>
                <div style={{fontSize:11,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>Ses dossiers clients :</div>
                {uClients.map(c=><div key={c.id} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 10px',background:"rgba(255,255,255,.02)",borderRadius:6,marginBottom:4}}>
                  <div style={{fontSize:11,fontWeight:600,color:'#e8e6e0',flex:1}}>{c.nom}</div>
                  <div style={{fontSize:10,color:'#9e9b93'}}>TVA: {c.tva||'-'}</div>
                  <div style={{fontSize:10,color:'#9e9b93'}}>ONSS: {c.onss||'-'}</div>
                  <div style={{fontSize:10,color:'#9e9b93'}}>CP: {c.cp_number||'-'}</div>
                  <div style={{fontSize:10,color:'#9e9b93'}}>{travParClient[c.id]||0} trav.</div>
                  <Badge text={c.active?'Actif':'Inactif'} color={c.active?'#4ade80':'#f87171'}/>
                </div>)}
              </div>}
            </div>;
          })()}
        </div>}
      </div>
    </div>}

    {/* ═══ ONGLET: CLIENTS ═══ */}
    {sub==='admin_clients'&&<div>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <Stat icon="🏢" label="Total dossiers" value={totalClients} color="#60a5fa"/>
        <Stat icon="✅" label="Actifs" value={activeClients} color="#4ade80"/>
        <Stat icon="⏸" label="Inactifs" value={totalClients-activeClients} color="#fb923c"/>
        <Stat icon="👥" label="Moy. travailleurs/client" value={moyTravParClient} color="#a78bfa"/>
      </div>

      <div style={{marginBottom:16}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher un dossier (nom, TVA, ONSS...)" style={{width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(198,163,78,.15)',borderRadius:8,color:'#e8e6e0',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
      </div>

      <div style={{background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)",overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'2.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr',padding:'10px 14px',background:"rgba(198,163,78,.06)",borderBottom:'1px solid rgba(198,163,78,.1)',fontSize:10,fontWeight:600,color:'#c6a34e',textTransform:'uppercase',letterSpacing:.5}}>
          <div>Société</div><div>TVA / ONSS</div><div>CP</div><div>Secteur</div><div>Travailleurs</div><div>Inscription</div><div>Statut</div>
        </div>
        {clients.length===0?<div style={{padding:30,textAlign:'center',color:'#5e5c56',fontSize:12}}>Aucun dossier client.</div>:
        clients.filter(c=>{
          if(!search)return true;
          const s=search.toLowerCase();
          return (c.nom||'').toLowerCase().includes(s)||(c.tva||'').toLowerCase().includes(s)||(c.onss||'').toLowerCase().includes(s);
        }).map((c,i)=>{
          const nb=travParClient[c.id]||0;
          const owner=users.find(u=>u.id===c.user_id);
          return <div key={c.id} style={{display:'grid',gridTemplateColumns:'2.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr',padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11.5,alignItems:'center',background:i%2===0?"transparent":"rgba(255,255,255,.01)"}}>
            <div>
              <div style={{fontWeight:600,color:'#e8e6e0'}}>{c.nom}</div>
              <div style={{fontSize:10,color:'#5e5c56'}}>{c.forme_juridique||'SRL'} · {c.ville||'-'} {owner?`· ${owner.prenom||''} ${owner.nom||''}`:''}</div>
            </div>
            <div><div style={{fontSize:10.5,color:'#9e9b93'}}>{c.tva||'-'}</div><div style={{fontSize:10,color:'#5e5c56'}}>{c.onss||'-'}</div></div>
            <div style={{color:'#c6a34e',fontWeight:600,fontSize:11}}>{c.cp_number||'-'}</div>
            <div style={{fontSize:10.5,color:'#9e9b93'}}>{c.secteur||'-'}</div>
            <div style={{fontWeight:600,color:nb>0?'#4ade80':'#5e5c56'}}>{nb}</div>
            <div style={{fontSize:10.5,color:'#9e9b93'}}>{fDate(c.created_at)}</div>
            <div><Badge text={c.active?'Actif':'Inactif'} color={c.active?'#4ade80':'#f87171'}/></div>
          </div>;
        })}
      </div>
    </div>}

    {/* ═══ ONGLET: STATS ═══ */}
    {sub==='admin_stats'&&<div>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <Stat icon="👤" label="Utilisateurs" value={totalUsers} sub={`${activeUsers} actifs`} color="#c6a34e"/>
        <Stat icon="🏢" label="Dossiers" value={totalClients} sub={`${activeClients} actifs`} color="#60a5fa"/>
        <Stat icon="👥" label="Travailleurs" value={totalTrav} sub={`${activeTrav} actifs`} color="#4ade80"/>
        <Stat icon="📄" label="Fiches totales" value={totalFiches} color="#a78bfa"/>
        <Stat icon="💰" label="Revenu mensuel" value={`€${revenuMensuelEstime.toLocaleString()}`} color="#c6a34e"/>
        <Stat icon="📈" label="Revenu annuel" value={`€${revenuAnnuelEstime.toLocaleString()}`} color="#4ade80"/>
      </div>

      {/* Répartition par forme juridique */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div style={{padding:16,background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)"}}>
          <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Repartition par forme juridique</div>
          {(()=>{
            const formes={};
            clients.forEach(c=>{const f=c.forme_juridique||'SRL';formes[f]=(formes[f]||0)+1;});
            return Object.entries(formes).sort((a,b)=>b[1]-a[1]).map(([f,n],i)=>{
              const pct=totalClients>0?((n/totalClients)*100).toFixed(1):0;
              return <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <div style={{flex:1,fontSize:11,color:'#e8e6e0'}}>{f}</div>
                <div style={{width:120,height:6,background:"rgba(255,255,255,.05)",borderRadius:3,overflow:'hidden'}}>
                  <div style={{width:`${pct}%`,height:'100%',background:'#c6a34e',borderRadius:3}}/>
                </div>
                <div style={{fontSize:10,color:'#9e9b93',width:50,textAlign:'right'}}>{n} ({pct}%)</div>
              </div>;
            });
          })()}
        </div>

        <div style={{padding:16,background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)"}}>
          <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Repartition par secteur</div>
          {(()=>{
            const secteurs={};
            clients.forEach(c=>{const s=c.secteur||'Non defini';secteurs[s]=(secteurs[s]||0)+1;});
            return Object.entries(secteurs).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([s,n],i)=>{
              const pct=totalClients>0?((n/totalClients)*100).toFixed(1):0;
              return <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <div style={{flex:1,fontSize:11,color:'#e8e6e0',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s}</div>
                <div style={{width:120,height:6,background:"rgba(255,255,255,.05)",borderRadius:3,overflow:'hidden'}}>
                  <div style={{width:`${pct}%`,height:'100%',background:'#60a5fa',borderRadius:3}}/>
                </div>
                <div style={{fontSize:10,color:'#9e9b93',width:50,textAlign:'right'}}>{n} ({pct}%)</div>
              </div>;
            });
          })()}
        </div>
      </div>

      {/* Répartition par CP */}
      <div style={{padding:16,background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)"}}>
        <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Top Commissions Paritaires</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:8}}>
          {(()=>{
            const cps={};
            clients.forEach(c=>{const cp=c.cp_number||'?';cps[cp]=(cps[cp]||0)+1;});
            return Object.entries(cps).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([cp,n],i)=><div key={i} style={{padding:'8px 12px',background:"rgba(198,163,78,.04)",borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>CP {cp}</div>
              <div style={{fontSize:11,color:'#c6a34e',fontWeight:600}}>{n}</div>
            </div>);
          })()}
        </div>
      </div>

      {/* Revenue projection */}
      <div style={{marginTop:16,padding:16,background:"rgba(198,163,78,.04)",borderRadius:12,border:"1px solid rgba(198,163,78,.15)"}}>
        <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>💰 Projection revenus (modele €12/fiche/mois)</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
          {[
            {l:'Actuel',users:totalUsers,trav:totalTrav},
            {l:'+3 mois',users:Math.ceil(totalUsers*1.5)||5,trav:Math.ceil(totalTrav*1.5)||50},
            {l:'+6 mois',users:Math.ceil(totalUsers*3)||15,trav:Math.ceil(totalTrav*3)||150},
            {l:'+12 mois',users:Math.ceil(totalUsers*8)||50,trav:Math.ceil(totalTrav*8)||500},
          ].map((p,i)=><div key={i} style={{padding:12,background:"rgba(255,255,255,.03)",borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:10,color:'#9e9b93',marginBottom:4}}>{p.l}</div>
            <div style={{fontSize:10,color:'#5e5c56'}}>{p.users} users · {p.trav} trav.</div>
            <div style={{fontSize:18,fontWeight:700,color:'#4ade80',marginTop:4}}>€{(p.trav*12).toLocaleString()}</div>
            <div style={{fontSize:10,color:'#5e5c56'}}>/mois</div>
            <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginTop:2}}>€{(p.trav*12*12).toLocaleString()}/an</div>
          </div>)}
        </div>
      </div>
    </div>}

    {/* ═══ ONGLET: AUDIT ═══ */}
    {sub==='admin_audit'&&<div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {['7','30','90','365'].map(d=><button key={d} onClick={()=>setDateRange(d)} style={{padding:'6px 14px',borderRadius:8,border:dateRange===d?'1px solid rgba(198,163,78,.4)':'1px solid rgba(255,255,255,.06)',background:dateRange===d?"rgba(198,163,78,.12)":"rgba(255,255,255,.02)",color:dateRange===d?'#c6a34e':'#9e9b93',fontSize:11,cursor:'pointer'}}>{d==='365'?'1 an':`${d} jours`}</button>)}
      </div>
      
      <div style={{background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)",overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'1.5fr 1.5fr 2fr 2fr 2fr',padding:'10px 14px',background:"rgba(198,163,78,.06)",borderBottom:'1px solid rgba(198,163,78,.1)',fontSize:10,fontWeight:600,color:'#c6a34e',textTransform:'uppercase',letterSpacing:.5}}>
          <div>Date</div><div>Utilisateur</div><div>Action</div><div>Table</div><div>Details</div>
        </div>
        {audit.length===0?<div style={{padding:30,textAlign:'center',color:'#5e5c56',fontSize:12}}>
          Aucune entree dans le journal d'audit. Les actions seront enregistrees automatiquement.
        </div>:
        audit.filter(a=>{
          const d=new Date(a.created_at);
          const now=new Date();
          return (now-d)<(parseInt(dateRange)*86400000);
        }).map((a,i)=>{
          const usr=users.find(u=>u.id===a.user_id);
          return <div key={a.id} style={{display:'grid',gridTemplateColumns:'1.5fr 1.5fr 2fr 2fr 2fr',padding:'8px 14px',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11,alignItems:'center',background:i%2===0?"transparent":"rgba(255,255,255,.01)"}}>
            <div style={{color:'#9e9b93',fontSize:10}}>{fDateTime(a.created_at)}</div>
            <div style={{color:'#e8e6e0'}}>{usr?`${usr.prenom||''} ${usr.nom||''}`:a.user_id?.slice(0,8)||'-'}</div>
            <div><Badge text={a.action} color={a.action?.includes('create')?'#4ade80':a.action?.includes('delete')?'#f87171':'#60a5fa'}/></div>
            <div style={{color:'#9e9b93'}}>{a.table_name||'-'}</div>
            <div style={{fontSize:10,color:'#5e5c56',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.details?JSON.stringify(a.details).slice(0,60):'-'}</div>
          </div>;
        })}
      </div>
    </div>}

    {/* ═══ ONGLET: BILLING ═══ */}
    {sub==='admin_billing'&&<div>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <Stat icon="💰" label="Revenu mensuel" value={`€${revenuMensuelEstime.toLocaleString()}`} color="#4ade80"/>
        <Stat icon="📈" label="Revenu annuel" value={`€${revenuAnnuelEstime.toLocaleString()}`} color="#c6a34e"/>
        <Stat icon="👥" label="Fiches facturables" value={totalTrav} sub="travailleurs actifs" color="#60a5fa"/>
        <Stat icon="🏢" label="Clients facturables" value={activeClients} color="#a78bfa"/>
      </div>

      {/* Facturation par client */}
      <div style={{background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)",overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'2.5fr 1fr 1fr 1fr 1fr 1fr',padding:'10px 14px',background:"rgba(198,163,78,.06)",borderBottom:'1px solid rgba(198,163,78,.1)',fontSize:10,fontWeight:600,color:'#c6a34e',textTransform:'uppercase',letterSpacing:.5}}>
          <div>Client</div><div>Travailleurs</div><div>Tarif/fiche</div><div>Mensuel</div><div>Annuel</div><div>Entree</div>
        </div>
        {clients.filter(c=>c.active).map((c,i)=>{
          const nb=travParClient[c.id]||0;
          const tarif=nb<=5?15:nb<=20?12:nb<=50?9:nb<=100?7:5;
          const mensuel=nb*tarif;
          const annuel=mensuel*12;
          const entree=nb<=5?149:nb<=20?299:nb<=50?499:999;
          return <div key={c.id} style={{display:'grid',gridTemplateColumns:'2.5fr 1fr 1fr 1fr 1fr 1fr',padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11.5,alignItems:'center',background:i%2===0?"transparent":"rgba(255,255,255,.01)"}}>
            <div style={{fontWeight:600,color:'#e8e6e0'}}>{c.nom}</div>
            <div style={{color:'#9e9b93'}}>{nb}</div>
            <div style={{color:'#c6a34e',fontWeight:600}}>€{tarif}</div>
            <div style={{color:'#4ade80',fontWeight:600}}>€{mensuel}</div>
            <div style={{color:'#60a5fa'}}>€{annuel.toLocaleString()}</div>
            <div style={{color:'#a78bfa'}}>€{entree}</div>
          </div>;
        })}
        {/* Total row */}
        <div style={{display:'grid',gridTemplateColumns:'2.5fr 1fr 1fr 1fr 1fr 1fr',padding:'12px 14px',background:"rgba(198,163,78,.08)",fontSize:12,fontWeight:700,alignItems:'center',borderTop:'2px solid rgba(198,163,78,.2)'}}>
          <div style={{color:'#c6a34e'}}>TOTAL</div>
          <div style={{color:'#e8e6e0'}}>{totalTrav}</div>
          <div style={{color:'#9e9b93'}}>-</div>
          <div style={{color:'#4ade80'}}>€{revenuMensuelEstime.toLocaleString()}</div>
          <div style={{color:'#60a5fa'}}>€{revenuAnnuelEstime.toLocaleString()}</div>
          <div style={{color:'#a78bfa'}}>€{clients.filter(c=>c.active).reduce((sum,c)=>{const nb=travParClient[c.id]||0;return sum+(nb<=5?149:nb<=20?299:nb<=50?499:999);},0).toLocaleString()}</div>
        </div>
      </div>

      <div style={{marginTop:16,padding:12,background:"rgba(96,165,250,.06)",borderRadius:8,fontSize:11,color:'#60a5fa',lineHeight:1.6}}>
        ℹ️ La grille tarifaire appliquee: 1-5 trav. = €15/fiche · 6-20 = €12 · 21-50 = €9 · 51-100 = €7 · 100+ = €5. Frais d'entree: Starter €149 · Business €299 · Premium €499 · Enterprise €999.
      </div>
    </div>}

    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  GUIDE PORTAIL ONSS — PAS A PAS
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  BELCOTAX
// ═══════════════════════════════════════════════════════════════


export default AdminDashboard;
