'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'');
const EMPTY={nom:'',prenom:'',niss:'',date_naissance:'',sexe:'M',date_entree:new Date().toISOString().split('T')[0],type_contrat:'CDI',regime:'temps_plein',heures_semaine:38,salaire_brut:0,fonction:'',categorie:'employe',etat_civil:'celibataire',enfants_charge:0,client_id:'',statut:'actif'};
export default function TravailleursPage() {
  const [fid,setFid]=useState(null);const [clients,setClients]=useState([]);const [trav,setTrav]=useState([]);const [showForm,setShowForm]=useState(false);const [editId,setEditId]=useState(null);const [form,setForm]=useState({...EMPTY});const [search,setSearch]=useState('');const [filterClient,setFilterClient]=useState('');const [loading,setLoading]=useState(true);
  useEffect(()=>{load();},[]);
  async function load(){
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href='/sprint10/auth';return;}
    const {data:f}=await supabase.from('fiduciaires').select('*').eq('user_id',user.id).single();
    setFid(f);
    if(f){
      const {data:cl}=await supabase.from('sp_clients').select('*').eq('fiduciaire_id',f.id).order('nom');setClients(cl||[]);
      const ids=(cl||[]).map(c=>c.id);
      if(ids.length){const {data:tr}=await supabase.from('sp_travailleurs').select('*').in('client_id',ids).order('nom');setTrav(tr||[]);}
    }
    setLoading(false);
  }
  async function save(){
    if(!form.nom||!form.prenom||!form.client_id){alert('Nom, prenom et client requis');return;}
    const d={...form,salaire_brut:Number(form.salaire_brut),enfants_charge:Number(form.enfants_charge),heures_semaine:Number(form.heures_semaine)};
    if(editId){await supabase.from('sp_travailleurs').update(d).eq('id',editId);}
    else{await supabase.from('sp_travailleurs').insert(d);}
    setShowForm(false);setEditId(null);setForm({...EMPTY});await load();
  }
  async function del(id){if(!confirm('Supprimer?'))return;await supabase.from('sp_travailleurs').delete().eq('id',id);await load();}
  function edit(t){setForm({nom:t.nom||'',prenom:t.prenom||'',niss:t.niss||'',date_naissance:t.date_naissance||'',sexe:t.sexe||'M',date_entree:t.date_entree||'',type_contrat:t.type_contrat||'CDI',regime:t.regime||'temps_plein',heures_semaine:t.heures_semaine||38,salaire_brut:t.salaire_brut||0,fonction:t.fonction||'',categorie:t.categorie||'employe',etat_civil:t.etat_civil||'celibataire',enfants_charge:t.enfants_charge||0,client_id:t.client_id||'',statut:t.statut||'actif'});setEditId(t.id);setShowForm(true);}
  const getName=id=>clients.find(c=>c.id===id)?.nom||'-';
  const filtered=trav.filter(t=>{const ms=!search||t.nom?.toLowerCase().includes(search.toLowerCase())||t.prenom?.toLowerCase().includes(search.toLowerCase());const mc=!filterClient||t.client_id===filterClient;return ms&&mc;});
  if(loading)return <div style={{minHeight:'100vh',background:'#0a0e1a',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{color:'#c9a227'}}>Chargement...</div></div>;
  return (
    <div style={{minHeight:'100vh',background:'#0a0e1a',color:'#e2e8f0',fontFamily:"'Outfit',system-ui,sans-serif",padding:'24px 32px'}}>
      <div style={{marginBottom:20,fontSize:13}}><Link href="/sprint10/dashboard" style={{color:'#64748b',textDecoration:'none'}}>Dashboard</Link><span style={{color:'#475569',margin:'0 8px'}}>/</span><span style={{color:'#c9a227'}}>Travailleurs</span></div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div><h1 style={{fontSize:22,fontWeight:700,margin:0,color:'#f1f5f9'}}>Gestion des Travailleurs</h1><p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>{trav.length} travailleur(s)</p></div>
        <button onClick={()=>{setForm({...EMPTY});setEditId(null);setShowForm(true);}} style={{background:'#c9a227',color:'#0a0e1a',border:'none',padding:'10px 20px',borderRadius:6,fontWeight:600,fontSize:13,cursor:'pointer'}}>+ Nouveau travailleur</button>
      </div>
      <div style={{display:'flex',gap:12,marginBottom:20}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." style={{width:300,padding:'8px 14px',background:'#131825',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13,outline:'none'}}/>
        <select value={filterClient} onChange={e=>setFilterClient(e.target.value)} style={{padding:'8px 14px',background:'#131825',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13}}><option value="">Tous les clients</option>{clients.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select>
      </div>
      {showForm&&(<div style={{background:'#131825',border:'1px solid #c9a227',borderRadius:10,padding:24,marginBottom:24}}>
        <h2 style={{fontSize:16,fontWeight:600,color:'#c9a227',margin:'0 0 16px'}}>{editId?'Modifier':'Nouveau travailleur'}</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
          <div><label style={{display:'block',fontSize:11,color:'#94a3b8',marginBottom:4,textTransform:'uppercase'}}>Client</label><select value={form.client_id} onChange={e=>setForm({...form,client_id:e.target.value})} style={{width:'100%',padding:'8px 12px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13}}><option value="">--</option>{clients.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
          {[['nom','Nom'],['prenom','Prenom'],['niss','NISS']].map(([k,l])=><div key={k}><label style={{display:'block',fontSize:11,color:'#94a3b8',marginBottom:4,textTransform:'uppercase'}}>{l}</label><input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={{width:'100%',padding:'8px 12px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13,boxSizing:'border-box'}}/></div>)}
          <div><label style={{display:'block',fontSize:11,color:'#94a3b8',marginBottom:4,textTransform:'uppercase'}}>Contrat</label><select value={form.type_contrat} onChange={e=>setForm({...form,type_contrat:e.target.value})} style={{width:'100%',padding:'8px 12px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13}}><option value="CDI">CDI</option><option value="CDD">CDD</option><option value="interim">Interim</option><option value="etudiant">Etudiant</option></select></div>
          <div><label style={{display:'block',fontSize:11,color:'#94a3b8',marginBottom:4,textTransform:'uppercase'}}>Categorie</label><select value={form.categorie} onChange={e=>setForm({...form,categorie:e.target.value})} style={{width:'100%',padding:'8px 12px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13}}><option value="employe">Employe</option><option value="ouvrier">Ouvrier</option><option value="cadre">Cadre</option></select></div>
          <div><label style={{display:'block',fontSize:11,color:'#94a3b8',marginBottom:4,textTransform:'uppercase'}}>Regime</label><select value={form.regime} onChange={e=>setForm({...form,regime:e.target.value})} style={{width:'100%',padding:'8px 12px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13}}><option value="temps_plein">Temps plein</option><option value="mi_temps">Mi-temps</option><option value="4_5">4/5e</option></select></div>
          <div><label style={{display:'block',fontSize:11,color:'#94a3b8',marginBottom:4,textTransform:'uppercase'}}>Salaire brut (EUR)</label><input type="number" value={form.salaire_brut} onChange={e=>setForm({...form,salaire_brut:e.target.value})} style={{width:'100%',padding:'8px 12px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13,boxSizing:'border-box'}}/></div>
          <div><label style={{display:'block',fontSize:11,color:'#94a3b8',marginBottom:4,textTransform:'uppercase'}}>Enfants a charge</label><input type="number" value={form.enfants_charge} onChange={e=>setForm({...form,enfants_charge:e.target.value})} style={{width:'100%',padding:'8px 12px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13,boxSizing:'border-box'}}/></div>
          <div><label style={{display:'block',fontSize:11,color:'#94a3b8',marginBottom:4,textTransform:'uppercase'}}>Fonction</label><input value={form.fonction} onChange={e=>setForm({...form,fonction:e.target.value})} style={{width:'100%',padding:'8px 12px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13,boxSizing:'border-box'}}/></div>
          <div><label style={{display:'block',fontSize:11,color:'#94a3b8',marginBottom:4,textTransform:'uppercase'}}>Date entree</label><input type="date" value={form.date_entree} onChange={e=>setForm({...form,date_entree:e.target.value})} style={{width:'100%',padding:'8px 12px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13,boxSizing:'border-box'}}/></div>
        </div>
        <div style={{display:'flex',gap:8,marginTop:20}}>
          <button onClick={save} style={{background:'#c9a227',color:'#0a0e1a',border:'none',padding:'10px 20px',borderRadius:6,fontWeight:600,fontSize:13,cursor:'pointer'}}>{editId?'Sauvegarder':'Creer'}</button>
          <button onClick={()=>setShowForm(false)} style={{background:'#1e293b',color:'#94a3b8',border:'none',padding:'10px 20px',borderRadius:6,fontSize:13,cursor:'pointer'}}>Annuler</button>
        </div>
      </div>)}
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead><tr>{['Nom','Client','Contrat','Brut','Regime','Entree','Statut','Actions'].map(h=><th key={h} style={{background:'#131825',color:'#c9a227',padding:'10px 12px',textAlign:'left',fontWeight:600,fontSize:11,textTransform:'uppercase',borderBottom:'2px solid #1e293b'}}>{h}</th>)}</tr></thead>
        <tbody>{filtered.length===0?<tr><td colSpan={8} style={{padding:40,textAlign:'center',color:'#64748b'}}>Aucun travailleur</td></tr>:filtered.map(t=>(
          <tr key={t.id} style={{borderBottom:'1px solid #1e293b'}}>
            <td style={{padding:'10px 12px',fontWeight:600}}>{t.nom} {t.prenom}</td>
            <td style={{padding:'10px 12px',fontSize:12}}>{getName(t.client_id)}</td>
            <td style={{padding:'10px 12px'}}><span style={{background:'rgba(59,130,246,0.15)',color:'#3b82f6',borderRadius:12,padding:'2px 8px',fontSize:11,fontWeight:600}}>{t.type_contrat}</span></td>
            <td style={{padding:'10px 12px',fontFamily:'monospace',color:'#c9a227',fontWeight:600}}>{Number(t.salaire_brut).toLocaleString()} EUR</td>
            <td style={{padding:'10px 12px',fontSize:12}}>{t.regime?.replace('_',' ')}</td>
            <td style={{padding:'10px 12px',fontFamily:'monospace',fontSize:11}}>{t.date_entree||'-'}</td>
            <td style={{padding:'10px 12px'}}><span style={{background:t.statut==='actif'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)',color:t.statut==='actif'?'#22c55e':'#ef4444',borderRadius:12,padding:'2px 10px',fontSize:11,fontWeight:600}}>{t.statut}</span></td>
            <td style={{padding:'10px 12px'}}><div style={{display:'flex',gap:6}}>
              <button onClick={()=>edit(t)} style={{background:'#1e293b',color:'#c9a227',border:'none',padding:'4px 10px',borderRadius:4,fontSize:11,cursor:'pointer'}}>Modifier</button>
              <button onClick={()=>del(t.id)} style={{background:'#1e293b',color:'#ef4444',border:'none',padding:'4px 10px',borderRadius:4,fontSize:11,cursor:'pointer'}}>Suppr</button>
            </div></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}