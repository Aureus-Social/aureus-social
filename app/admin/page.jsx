'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'');

// TON EMAIL ADMIN — change si besoin
const ADMIN_EMAILS = ['moussati@aureus-ia.com','info@aureus-ia.com','nourdin@aureus-ia.com'];

export default function AdminPanel() {
  const [user,setUser]=useState(null);const [isAdmin,setIsAdmin]=useState(false);
  const [fiduciaires,setFiduciaires]=useState([]);const [loading,setLoading]=useState(true);
  const [stats,setStats]=useState({fids:0,clients:0,workers:0,fiches:0,trial:0,starter:0,pro:0,enterprise:0});
  const [search,setSearch]=useState('');const [tab,setTab]=useState('dashboard');
  const [selFid,setSelFid]=useState(null);const [fidClients,setFidClients]=useState([]);const [fidWorkers,setFidWorkers]=useState([]);

  useEffect(()=>{checkAdmin();},[]);

  async function checkAdmin(){
    const {data:{user:u}}=await supabase.auth.getUser();
    if(!u){window.location.href='/sprint10/auth';return;}
    setUser(u);
    if(ADMIN_EMAILS.includes(u.email)){
      setIsAdmin(true);
      await loadAll();
    }
    setLoading(false);
  }

  async function loadAll(){
    // Toutes les fiduciaires (sans RLS — necessite service role ou policy admin)
    const {data:fids}=await supabase.from('fiduciaires').select('*').order('created_at',{ascending:false});
    setFiduciaires(fids||[]);

    // Stats globales
    const {count:cC}=await supabase.from('sp_clients').select('*',{count:'exact',head:true});
    const {count:cW}=await supabase.from('sp_travailleurs').select('*',{count:'exact',head:true});
    const {count:cF}=await supabase.from('sp_fiches_paie').select('*',{count:'exact',head:true});

    const plans={trial:0,starter:0,pro:0,enterprise:0};
    (fids||[]).forEach(f=>{const p=(f.plan||'trial').toLowerCase();if(plans[p]!==undefined)plans[p]++;else plans.trial++;});

    setStats({
      fids:(fids||[]).length, clients:cC||0, workers:cW||0, fiches:cF||0,
      ...plans
    });
  }

  async function viewFid(fid){
    setSelFid(fid);
    const {data:cl}=await supabase.from('sp_clients').select('*').eq('fiduciaire_id',fid.id);
    setFidClients(cl||[]);
    const ids=(cl||[]).map(c=>c.id);
    if(ids.length){
      const {data:wr}=await supabase.from('sp_travailleurs').select('*').in('client_id',ids);
      setFidWorkers(wr||[]);
    }else{setFidWorkers([]);}
    setTab('detail');
  }

  async function togglePlan(fid, newPlan){
    const limits={trial:{max_clients:3,max_travailleurs:20},starter:{max_clients:5,max_travailleurs:50},pro:{max_clients:25,max_travailleurs:500},enterprise:{max_clients:9999,max_travailleurs:99999}};
    const l=limits[newPlan]||limits.trial;
    await supabase.from('fiduciaires').update({plan:newPlan,...l}).eq('id',fid.id);
    await loadAll();
    if(selFid&&selFid.id===fid.id)setSelFid({...fid,plan:newPlan,...l});
    alert('Plan mis a jour: '+newPlan);
  }

  async function toggleStatus(fid){
    const newStatus = fid.statut==='actif'?'suspendu':'actif';
    await supabase.from('fiduciaires').update({statut:newStatus}).eq('id',fid.id);
    await loadAll();
    alert('Statut: '+newStatus);
  }

  const S = {
    page:{minHeight:'100vh',background:'#0a0e1a',color:'#e2e8f0',fontFamily:"'Outfit',system-ui,sans-serif",padding:'24px 32px'},
    kpi:{background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:'18px 20px'},
    kpiL:{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:0.5},
    kpiV:{fontWeight:700,marginTop:6,fontFamily:'monospace'},
    tab:(active)=>({background:active?'#c9a227':'#131825',color:active?'#0a0e1a':'#94a3b8',border:active?'none':'1px solid #1e293b',padding:'8px 18px',borderRadius:6,fontWeight:600,fontSize:13,cursor:'pointer'}),
    th:{background:'#131825',color:'#c9a227',padding:'10px 8px',textAlign:'left',fontWeight:600,fontSize:11,textTransform:'uppercase',borderBottom:'2px solid #1e293b'},
    td:{padding:'8px',fontSize:13,borderBottom:'1px solid #0f1520'},
    badge:(c,bg)=>({background:bg,color:c,borderRadius:12,padding:'3px 10px',fontSize:11,fontWeight:700}),
  };

  const MRR = stats.starter*49 + stats.pro*149;
  const ARR = MRR*12;

  if(loading)return <div style={S.page}><div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'80vh'}}><div style={{color:'#c9a227'}}>Chargement...</div></div></div>;
  if(!isAdmin)return <div style={S.page}><div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'80vh',flexDirection:'column',gap:12}}><div style={{fontSize:48}}>X</div><div style={{color:'#ef4444',fontSize:18,fontWeight:700}}>Acces refuse</div><div style={{color:'#64748b'}}>Ce panel est reserve a l admin. Votre email: '+user?.email+'</div></div></div>;

  const filtered = fiduciaires.filter(f=>!search || (f.nom||'').toLowerCase().includes(search.toLowerCase()) || (f.bce||'').includes(search) || (f.email||'').toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="20" fill="#c9a227"/><path d="M50 18L72 75H58L54 63H46L42 75H28L50 18Z" fill="#0a0e1a" stroke="#0a0e1a" strokeWidth="2"/><path d="M50 30L62 63H38L50 30Z" fill="#c9a227"/><rect x="35" y="68" width="30" height="4" rx="2" fill="#0a0e1a"/></svg>
            <h1 style={{fontSize:22,fontWeight:700,margin:0,color:'#f1f5f9'}}>Admin Panel</h1>
          </div>
          <p style={{color:'#64748b',fontSize:13,margin:0}}>Aureus IA SPRL — Gestion de la plateforme</p>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:11,color:'#64748b'}}>{user?.email}</div>
          <div style={{fontSize:10,color:'#22c55e',fontWeight:600}}>ADMIN</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:8,marginBottom:24}}>
        {[{k:'dashboard',l:'Dashboard'},{k:'fiduciaires',l:'Fiduciaires ('+stats.fids+')'},{k:'revenus',l:'Revenus'}].map(t=>(
          <button key={t.k} onClick={()=>{setTab(t.k);setSelFid(null);}} style={S.tab(tab===t.k)}>{t.l}</button>
        ))}
        {selFid&&<button style={S.tab(tab==='detail')}>Detail: {selFid.nom}</button>}
      </div>

      {/* DASHBOARD */}
      {tab==='dashboard'&&(
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            {[
              {l:'FIDUCIAIRES',v:stats.fids,c:'#f1f5f9',sub:'inscrites'},
              {l:'CLIENTS GERES',v:stats.clients,c:'#3b82f6',sub:'entreprises'},
              {l:'TRAVAILLEURS',v:stats.workers,c:'#a855f7',sub:'actifs'},
              {l:'FICHES DE PAIE',v:stats.fiches,c:'#22c55e',sub:'generees'},
            ].map((k,i)=>(
              <div key={i} style={S.kpi}>
                <div style={S.kpiL}>{k.l}</div>
                <div style={{...S.kpiV,fontSize:28,color:k.c}}>{k.v}</div>
                <div style={{fontSize:10,color:'#475569',marginTop:2}}>{k.sub}</div>
              </div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            {[
              {l:'PLAN TRIAL',v:stats.trial,c:'#64748b',sub:'gratuit'},
              {l:'PLAN STARTER',v:stats.starter,c:'#3b82f6',sub:'49 EUR/mois'},
              {l:'PLAN PRO',v:stats.pro,c:'#c9a227',sub:'149 EUR/mois'},
              {l:'ENTERPRISE',v:stats.enterprise,c:'#a855f7',sub:'sur mesure'},
            ].map((k,i)=>(
              <div key={i} style={S.kpi}>
                <div style={S.kpiL}>{k.l}</div>
                <div style={{...S.kpiV,fontSize:28,color:k.c}}>{k.v}</div>
                <div style={{fontSize:10,color:'#475569',marginTop:2}}>{k.sub}</div>
              </div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            {[
              {l:'MRR',v:MRR.toLocaleString()+' EUR',c:'#22c55e',sub:'Monthly Recurring Revenue'},
              {l:'ARR',v:ARR.toLocaleString()+' EUR',c:'#c9a227',sub:'Annual Recurring Revenue'},
              {l:'ARPU',v:stats.fids>0?Math.round(MRR/stats.fids)+' EUR':'0 EUR',c:'#3b82f6',sub:'Revenue par fiduciaire'},
            ].map((k,i)=>(
              <div key={i} style={S.kpi}>
                <div style={S.kpiL}>{k.l}</div>
                <div style={{...S.kpiV,fontSize:24,color:k.c}}>{k.v}</div>
                <div style={{fontSize:10,color:'#475569',marginTop:2}}>{k.sub}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* FIDUCIAIRES LIST */}
      {tab==='fiduciaires'&&(
        <>
          <div style={{marginBottom:16}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par nom, BCE ou email..." style={{width:400,padding:'10px 14px',background:'#131825',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13}}/>
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>
                {['Cabinet','BCE','Plan','Clients','Max','Travailleurs','Max','Statut','Inscrit le','Actions'].map(h=><th key={h} style={S.th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(f=>{
                  const planColors={trial:{bg:'rgba(100,116,139,0.15)',c:'#94a3b8'},starter:{bg:'rgba(59,130,246,0.15)',c:'#3b82f6'},pro:{bg:'rgba(201,162,39,0.15)',c:'#c9a227'},enterprise:{bg:'rgba(168,85,247,0.15)',c:'#a855f7'}};
                  const pc=planColors[(f.plan||'trial').toLowerCase()]||planColors.trial;
                  return (
                    <tr key={f.id} style={{cursor:'pointer'}} onClick={()=>viewFid(f)}>
                      <td style={{...S.td,fontWeight:600}}>{f.nom||'-'}</td>
                      <td style={{...S.td,fontFamily:'monospace',fontSize:11}}>{f.bce||'-'}</td>
                      <td style={S.td}><span style={S.badge(pc.c,pc.bg)}>{(f.plan||'trial').toUpperCase()}</span></td>
                      <td style={{...S.td,fontFamily:'monospace'}}>{f.nb_clients||0}</td>
                      <td style={{...S.td,fontFamily:'monospace',color:'#64748b'}}>{f.max_clients||3}</td>
                      <td style={{...S.td,fontFamily:'monospace'}}>{f.nb_travailleurs||0}</td>
                      <td style={{...S.td,fontFamily:'monospace',color:'#64748b'}}>{f.max_travailleurs||20}</td>
                      <td style={S.td}><span style={S.badge(f.statut==='suspendu'?'#ef4444':'#22c55e',f.statut==='suspendu'?'rgba(239,68,68,0.15)':'rgba(34,197,94,0.15)')}>{f.statut||'actif'}</span></td>
                      <td style={{...S.td,fontSize:11,color:'#64748b'}}>{f.created_at?new Date(f.created_at).toLocaleDateString('fr-BE'):'-'}</td>
                      <td style={S.td} onClick={e=>e.stopPropagation()}>
                        <div style={{display:'flex',gap:4}}>
                          <select defaultValue={f.plan||'trial'} onChange={e=>togglePlan(f,e.target.value)} style={{background:'#0a0e1a',border:'1px solid #1e293b',color:'#e2e8f0',borderRadius:4,fontSize:11,padding:'3px 6px'}}>
                            <option value="trial">Trial</option><option value="starter">Starter</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
                          </select>
                          <button onClick={()=>toggleStatus(f)} style={{background:f.statut==='suspendu'?'#22c55e':'#ef4444',color:'#fff',border:'none',borderRadius:4,fontSize:10,padding:'3px 8px',cursor:'pointer',fontWeight:600}}>{f.statut==='suspendu'?'Activer':'Suspendre'}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length===0&&<div style={{textAlign:'center',padding:40,color:'#64748b'}}>Aucune fiduciaire inscrite pour le moment</div>}
        </>
      )}

      {/* REVENUS */}
      {tab==='revenus'&&(
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24}}>
            {[
              {l:'MRR ACTUEL',v:MRR.toLocaleString()+' EUR/mois',c:'#22c55e'},
              {l:'ARR PROJETE',v:ARR.toLocaleString()+' EUR/an',c:'#c9a227'},
              {l:'OBJECTIF 10% MARCHE',v:'470 000 EUR/an',c:'#3b82f6'},
            ].map((k,i)=>(
              <div key={i} style={S.kpi}>
                <div style={S.kpiL}>{k.l}</div>
                <div style={{...S.kpiV,fontSize:22,color:k.c}}>{k.v}</div>
              </div>
            ))}
          </div>
          <div style={{background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:24,marginBottom:20}}>
            <div style={{fontWeight:600,color:'#c9a227',marginBottom:12}}>Projection revenus</div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>{['Plan','Abonnes','Prix','MRR','ARR'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {[
                  {plan:'Trial (gratuit)',n:stats.trial,prix:0},
                  {plan:'Starter',n:stats.starter,prix:49},
                  {plan:'Pro',n:stats.pro,prix:149},
                  {plan:'Enterprise',n:stats.enterprise,prix:499},
                ].map((r,i)=>(
                  <tr key={i}><td style={{...S.td,fontWeight:600}}>{r.plan}</td><td style={{...S.td,fontFamily:'monospace'}}>{r.n}</td><td style={{...S.td,fontFamily:'monospace'}}>{r.prix} EUR</td><td style={{...S.td,fontFamily:'monospace',color:'#22c55e'}}>{(r.n*r.prix).toLocaleString()} EUR</td><td style={{...S.td,fontFamily:'monospace',color:'#c9a227'}}>{(r.n*r.prix*12).toLocaleString()} EUR</td></tr>
                ))}
                <tr style={{fontWeight:700,borderTop:'2px solid #c9a227'}}><td style={S.td}>TOTAL</td><td style={{...S.td,fontFamily:'monospace'}}>{stats.fids}</td><td style={S.td}>-</td><td style={{...S.td,fontFamily:'monospace',color:'#22c55e'}}>{MRR.toLocaleString()} EUR</td><td style={{...S.td,fontFamily:'monospace',color:'#c9a227'}}>{ARR.toLocaleString()} EUR</td></tr>
              </tbody>
            </table>
          </div>
          <div style={{background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:24}}>
            <div style={{fontWeight:600,color:'#c9a227',marginBottom:12}}>Objectifs de croissance</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
              {[
                {mois:'Mois 3',fids:10,mrr:'890',arr:'10 680'},
                {mois:'Mois 6',fids:30,mrr:'3 470',arr:'41 640'},
                {mois:'Mois 12',fids:80,mrr:'9 520',arr:'114 240'},
                {mois:'Mois 24',fids:200,mrr:'25 100',arr:'301 200'},
              ].map((o,i)=>(
                <div key={i} style={{textAlign:'center'}}>
                  <div style={{fontSize:13,color:'#c9a227',fontWeight:600}}>{o.mois}</div>
                  <div style={{fontSize:24,fontWeight:700,color:'#f1f5f9',fontFamily:'monospace'}}>{o.fids}</div>
                  <div style={{fontSize:10,color:'#64748b'}}>fiduciaires</div>
                  <div style={{fontSize:14,fontWeight:700,color:'#22c55e',fontFamily:'monospace',marginTop:4}}>{o.mrr} EUR/m</div>
                  <div style={{fontSize:11,color:'#64748b'}}>{o.arr} EUR/an</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* DETAIL FIDUCIAIRE */}
      {tab==='detail'&&selFid&&(
        <>
          <button onClick={()=>{setTab('fiduciaires');setSelFid(null);}} style={{background:'#1e293b',color:'#94a3b8',border:'none',padding:'6px 14px',borderRadius:6,fontSize:12,cursor:'pointer',marginBottom:16}}>Retour</button>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,marginBottom:20}}>
            <div style={S.kpi}>
              <div style={{fontWeight:700,color:'#f1f5f9',fontSize:18,marginBottom:12}}>{selFid.nom||'Sans nom'}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:13}}>
                <div><span style={{color:'#64748b'}}>BCE:</span> <b>{selFid.bce||'-'}</b></div>
                <div><span style={{color:'#64748b'}}>Ville:</span> <b>{selFid.ville||'-'}</b></div>
                <div><span style={{color:'#64748b'}}>Tel:</span> <b>{selFid.telephone||'-'}</b></div>
                <div><span style={{color:'#64748b'}}>Plan:</span> <b style={{color:'#c9a227'}}>{(selFid.plan||'trial').toUpperCase()}</b></div>
                <div><span style={{color:'#64748b'}}>Inscrit:</span> <b>{selFid.created_at?new Date(selFid.created_at).toLocaleDateString('fr-BE'):'-'}</b></div>
                <div><span style={{color:'#64748b'}}>User ID:</span> <span style={{fontSize:10,fontFamily:'monospace'}}>{selFid.user_id||'-'}</span></div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateRows:'1fr 1fr',gap:12}}>
              <div style={S.kpi}><div style={S.kpiL}>Clients</div><div style={{...S.kpiV,fontSize:28,color:'#3b82f6'}}>{fidClients.length} <span style={{fontSize:12,color:'#64748b'}}>/ {selFid.max_clients||3}</span></div></div>
              <div style={S.kpi}><div style={S.kpiL}>Travailleurs</div><div style={{...S.kpiV,fontSize:28,color:'#a855f7'}}>{fidWorkers.length} <span style={{fontSize:12,color:'#64748b'}}>/ {selFid.max_travailleurs||20}</span></div></div>
            </div>
          </div>

          {fidClients.length>0&&(
            <>
              <h2 style={{fontSize:15,color:'#c9a227',marginBottom:8}}>Clients ({fidClients.length})</h2>
              <table style={{width:'100%',borderCollapse:'collapse',marginBottom:20}}>
                <thead><tr>{['Nom','BCE','CP','Ville','Statut'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{fidClients.map(c=>(
                  <tr key={c.id}><td style={{...S.td,fontWeight:600}}>{c.nom}</td><td style={{...S.td,fontFamily:'monospace',fontSize:11}}>{c.bce||'-'}</td><td style={S.td}>{c.cp||c.commission_paritaire||'-'}</td><td style={S.td}>{c.ville||'-'}</td><td style={S.td}><span style={S.badge('#22c55e','rgba(34,197,94,0.15)')}>{c.statut||'actif'}</span></td></tr>
                ))}</tbody>
              </table>
            </>
          )}

          {fidWorkers.length>0&&(
            <>
              <h2 style={{fontSize:15,color:'#c9a227',marginBottom:8}}>Travailleurs ({fidWorkers.length})</h2>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr>{['Nom','Prenom','NISS','Contrat','Cat.','Brut','Statut'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{fidWorkers.map(w=>(
                  <tr key={w.id}><td style={{...S.td,fontWeight:600}}>{w.nom}</td><td style={S.td}>{w.prenom||'-'}</td><td style={{...S.td,fontFamily:'monospace',fontSize:11}}>{w.niss||'-'}</td><td style={S.td}>{w.type_contrat||'-'}</td><td style={S.td}>{w.categorie||'-'}</td><td style={{...S.td,fontFamily:'monospace'}}>{(Number(w.salaire_brut)||0).toFixed(2)} EUR</td><td style={S.td}><span style={S.badge('#22c55e','rgba(34,197,94,0.15)')}>{w.statut||'actif'}</span></td></tr>
                ))}</tbody>
              </table>
            </>
          )}
        </>
      )}

      {/* Footer */}
      <div style={{marginTop:40,paddingTop:16,borderTop:'1px solid #1e293b',textAlign:'center',color:'#475569',fontSize:11}}>
        Aureus Social Pro — Admin Panel — Aureus IA SPRL (BCE BE 1028.230.781)
      </div>
    </div>
  );
}
