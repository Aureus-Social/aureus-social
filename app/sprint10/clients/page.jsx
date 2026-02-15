'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'');
const EMPTY={nom:'',bce:'',adresse:'',code_postal:'',ville:'',commission_paritaire:'200',secteur:'',email:'',telephone:'',contact:'',iban:'',statut:'actif'};
export default function ClientsPage() {
  const [fid,setFid]=useState(null);const [clients,setClients]=useState([]);const [showForm,setShowForm]=useState(false);const [editId,setEditId]=useState(null);const [form,setForm]=useState({...EMPTY});const [search,setSearch]=useState('');const [loading,setLoading]=useState(true);
  useEffect(()=>{load();},[]);
  async function load(){
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href='/sprint10/auth';return;}
    const {data:f}=await supabase.from('fiduciaires').select('*').eq('user_id',user.id).single();
    setFid(f);
    if(f){const {data:cl}=await supabase.from('sp_clients').select('*').eq('fiduciaire_id',f.id).order('nom');setClients(cl||[]);}
    setLoading(false);
  }
  async function save(){
    if(!form.nom||!form.bce){alert('Nom et BCE requis');return;}
    if(editId){await supabase.from('sp_clients').update({...form}).eq('id',editId);}
    else{await supabase.from('sp_clients').insert({...form,fiduciaire_id:fid.id});}
    setShowForm(false);setEditId(null);setForm({...EMPTY});await load();
  }
  async function del(id){if(!confirm('Supprimer?'))return;await supabase.from('sp_clients').delete().eq('id',id);await load();}
  function edit(c){setForm({nom:c.nom||'',bce:c.bce||'',adresse:c.adresse||'',code_postal:c.code_postal||'',ville:c.ville||'',commission_paritaire:c.commission_paritaire||'200',secteur:c.secteur||'',email:c.email||'',telephone:c.telephone||'',contact:c.contact||'',iban:c.iban||'',statut:c.statut||'actif'});setEditId(c.id);setShowForm(true);}
  const filtered=clients.filter(c=>c.nom?.toLowerCase().includes(search.toLowerCase())||c.bce?.includes(search));
  if(loading)return <div style={{minHeight:'100vh',background:'#0a0e1a',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{color:'#c9a227'}}>Chargement...</div></div>;
  return (
    <div style={{minHeight:'100vh',background:'#0a0e1a',color:'#e2e8f0',fontFamily:"'Outfit',system-ui,sans-serif",padding:'24px 32px'}}>
      <div style={{marginBottom:20,fontSize:13}}><Link href="/sprint10/dashboard" style={{color:'#64748b',textDecoration:'none'}}>Dashboard</Link><span style={{color:'#475569',margin:'0 8px'}}>/</span><span style={{color:'#c9a227'}}>Clients</span></div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div><h1 style={{fontSize:22,fontWeight:700,margin:0,color:'#f1f5f9'}}>Gestion des Clients</h1><p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>{clients.length} entreprise(s)</p></div>
        <button onClick={()=>{setForm({...EMPTY});setEditId(null);setShowForm(true);}} style={{background:'#c9a227',color:'#0a0e1a',border:'none',padding:'10px 20px',borderRadius:6,fontWeight:600,fontSize:13,cursor:'pointer'}}>+ Nouveau client</button>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{width:400,padding:'10px 14px',background:'#131825',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13,outline:'none',marginBottom:20}}/>
      {showForm&&(<div style={{background:'#131825',border:'1px solid #c9a227',borderRadius:10,padding:24,marginBottom:24}}>
        <h2 style={{fontSize:16,fontWeight:600,color:'#c9a227',margin:'0 0 16px'}}>{editId?'Modifier':'Nouveau client'}</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {[['nom','Raison sociale'],['bce','BCE'],['commission_paritaire','CP'],['adresse','Adresse'],['code_postal','Code postal'],['ville','Ville'],['email','Email'],['telephone','Telephone'],['contact','Contact'],['iban','IBAN'],['secteur','Secteur'],['statut','Statut']].map(([k,l])=>(
            <div key={k}><label style={{display:'block',fontSize:11,color:'#94a3b8',fontWeight:500,marginBottom:4,textTransform:'uppercase'}}>{l}</label>
            {k==='statut'?<select value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={{width:'100%',padding:'8px 12px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13}}><option value="actif">Actif</option><option value="inactif">Inactif</option><option value="prospect">Prospect</option></select>
            :<input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={{width:'100%',padding:'8px 12px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13,outline:'none',boxSizing:'border-box'}}/>}</div>
          ))}
        </div>
        <div style={{display:'flex',gap:8,marginTop:20}}>
          <button onClick={save} style={{background:'#c9a227',color:'#0a0e1a',border:'none',padding:'10px 20px',borderRadius:6,fontWeight:600,fontSize:13,cursor:'pointer'}}>{editId?'Sauvegarder':'Creer'}</button>
          <button onClick={()=>setShowForm(false)} style={{background:'#1e293b',color:'#94a3b8',border:'none',padding:'10px 20px',borderRadius:6,fontSize:13,cursor:'pointer'}}>Annuler</button>
        </div>
      </div>)}
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead><tr>{['Entreprise','BCE','CP','Ville','Statut','Actions'].map(h=><th key={h} style={{background:'#131825',color:'#c9a227',padding:'10px 12px',textAlign:'left',fontWeight:600,fontSize:11,textTransform:'uppercase',borderBottom:'2px solid #1e293b'}}>{h}</th>)}</tr></thead>
        <tbody>{filtered.length===0?<tr><td colSpan={6} style={{padding:40,textAlign:'center',color:'#64748b'}}>Aucun client</td></tr>:filtered.map(c=>(
          <tr key={c.id} style={{borderBottom:'1px solid #1e293b'}}>
            <td style={{padding:'10px 12px',fontWeight:600}}>{c.nom}</td>
            <td style={{padding:'10px 12px',fontFamily:'monospace',fontSize:12}}>{c.bce}</td>
            <td style={{padding:'10px 12px'}}>CP {c.commission_paritaire}</td>
            <td style={{padding:'10px 12px'}}>{c.ville||'-'}</td>
            <td style={{padding:'10px 12px'}}><span style={{background:c.statut==='actif'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)',color:c.statut==='actif'?'#22c55e':'#ef4444',borderRadius:12,padding:'2px 10px',fontSize:11,fontWeight:600}}>{c.statut}</span></td>
            <td style={{padding:'10px 12px'}}><div style={{display:'flex',gap:6}}>
              <button onClick={()=>edit(c)} style={{background:'#1e293b',color:'#c9a227',border:'none',padding:'4px 10px',borderRadius:4,fontSize:11,cursor:'pointer'}}>Modifier</button>
              <button onClick={()=>del(c.id)} style={{background:'#1e293b',color:'#ef4444',border:'none',padding:'4px 10px',borderRadius:4,fontSize:11,cursor:'pointer'}}>Suppr</button>
            </div></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}