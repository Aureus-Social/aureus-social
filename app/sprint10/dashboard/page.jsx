'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'');
export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [fid, setFid] = useState(null);
  const [clients, setClients] = useState([]);
  const [trav, setTrav] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{(async()=>{
    const {data:{user:u}}=await supabase.auth.getUser();
    if(!u){window.location.href='/sprint10/auth';return;}
    setUser(u);
    const {data:f}=await supabase.from('fiduciaires').select('*').eq('user_id',u.id).single();
    setFid(f);
    if(f){
      const {data:cl}=await supabase.from('sp_clients').select('*').eq('fiduciaire_id',f.id);
      setClients(cl||[]);
      const ids=(cl||[]).map(c=>c.id);
      if(ids.length){const {data:tr}=await supabase.from('sp_travailleurs').select('*').in('client_id',ids);setTrav(tr||[]);}
    }
    setLoading(false);
  })();},[]);
  const masse=trav.reduce((s,t)=>s+(t.salaire_brut||0),0);
  const cout=masse*1.2492;
  if(loading)return <div style={{minHeight:'100vh',background:'#0a0e1a',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{color:'#c9a227'}}>Chargement...</div></div>;
  return (
    <div style={{minHeight:'100vh',background:'#0a0e1a',color:'#e2e8f0',fontFamily:"'Outfit',system-ui,sans-serif"}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 32px',borderBottom:'1px solid #1e293b'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,borderRadius:8,background:'#c9a227',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:'#0a0e1a'}}>A</div>
          <div><div style={{fontWeight:700,fontSize:15}}>Aureus Social Pro</div><div style={{fontSize:11,color:'#64748b'}}>{fid?.nom||'Cabinet'} — {fid?.bce||''}</div></div>
        </div>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <Link href="/sprint9" style={{color:'#94a3b8',fontSize:13,textDecoration:'none'}}>Sprint 9</Link>
          <span style={{color:'#94a3b8',fontSize:13}}>{user?.email}</span>
          <button onClick={async()=>{await supabase.auth.signOut();window.location.href='/sprint10/auth';}} style={{background:'#1e293b',color:'#94a3b8',border:'none',padding:'6px 14px',borderRadius:6,fontSize:12,cursor:'pointer'}}>Deconnexion</button>
        </div>
      </header>
      <div style={{padding:'24px 32px'}}>
        <h1 style={{fontSize:22,fontWeight:700,margin:'0 0 4px',color:'#f1f5f9'}}>Bonjour{fid?.responsable?', '+fid.responsable:''} !</h1>
        <p style={{color:'#64748b',fontSize:14,margin:'0 0 24px'}}>Vue d ensemble de votre portefeuille</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:32}}>
          {[{l:'CLIENTS',v:clients.length,c:'#3b82f6'},{l:'TRAVAILLEURS',v:trav.length,c:'#22c55e'},{l:'MASSE SALARIALE',v:masse.toLocaleString()+' EUR',c:'#f97316'},{l:'COUT TOTAL',v:Math.round(cout).toLocaleString()+' EUR',c:'#ef4444'}].map((k,i)=>(
            <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:'18px 20px'}}>
              <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>{k.l}</div>
              <div style={{fontSize:24,fontWeight:700,color:k.c,marginTop:6,fontFamily:'monospace'}}>{k.v}</div>
            </div>
          ))}
        </div>
        <h2 style={{fontSize:16,fontWeight:600,color:'#c9a227',marginBottom:16}}>Actions rapides</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
          {[{h:'/sprint10/clients',l:'Clients',d:'Gerer entreprises',i:'C'},{h:'/sprint10/travailleurs',l:'Travailleurs',d:'Gerer employes',i:'T'},{h:'/sprint9/precompte',l:'Precompte',d:'Calculer PP',i:'PP'},{h:'/sprint9',l:'Sprint 9',d:'17 modules',i:'9'}].map((a,i)=>(
            <Link key={i} href={a.h} style={{textDecoration:'none'}}>
              <div style={{background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:20,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#c9a227'} onMouseLeave={e=>e.currentTarget.style.borderColor='#1e293b'}>
                <div style={{width:40,height:40,borderRadius:8,background:'#c9a227',color:'#0a0e1a',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16,marginBottom:12}}>{a.i}</div>
                <div style={{fontWeight:600,fontSize:14,color:'#f1f5f9'}}>{a.l}</div>
                <div style={{fontSize:12,color:'#64748b',marginTop:2}}>{a.d}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}