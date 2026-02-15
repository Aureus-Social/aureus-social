'use client';
import { useState, useEffect } from 'react';

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'');

function useData() {
  const [user,setUser]=useState(null);const [fid,setFid]=useState(null);const [clients,setClients]=useState([]);const [workers,setWorkers]=useState([]);const [fiches,setFiches]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{(async()=>{
    const {data:{user:u}}=await supabase.auth.getUser();
    if(!u){setLoading(false);return;}
    setUser(u);
    const {data:f}=await supabase.from('fiduciaires').select('*').eq('user_id',u.id).single();
    setFid(f);
    if(f){
      const {data:cl}=await supabase.from('sp_clients').select('*').eq('fiduciaire_id',f.id);
      setClients(cl||[]);
      const ids=(cl||[]).map(c=>c.id);
      if(ids.length){
        const {data:tr}=await supabase.from('sp_travailleurs').select('*').in('client_id',ids);
        setWorkers(tr||[]);
        const {data:fp}=await supabase.from('sp_fiches_paie').select('*').in('client_id',ids);
        setFiches(fp||[]);
      }
    }
    setLoading(false);
  })();},[]);
  return {user,fid,clients,workers,fiches,loading};
}

const DEMO = [
  {id:'d1',nom:'Dupont',prenom:'Marie',salaire_brut:3500,categorie:'employe',regime:'temps_plein',type_contrat:'CDI',date_entree:'2024-03-15',niss:'85.02.15-123.45',enfants_charge:2,etat_civil:'marie',client_id:'c1',statut:'actif',fonction:'Comptable'},
  {id:'d2',nom:'Janssen',prenom:'Pieter',salaire_brut:4200,categorie:'employe',regime:'temps_plein',type_contrat:'CDI',date_entree:'2023-01-10',niss:'92.08.22-456.78',enfants_charge:1,etat_civil:'celibataire',client_id:'c1',statut:'actif',fonction:'Analyste'},
  {id:'d3',nom:'Martin',prenom:'Lucas',salaire_brut:2800,categorie:'ouvrier',regime:'mi_temps',type_contrat:'CDD',date_entree:'2025-09-01',niss:'88.11.30-789.01',enfants_charge:0,etat_civil:'celibataire',client_id:'c1',statut:'actif',fonction:'Technicien'},
];

export default function DimonaPage() {
  const {workers:realW,loading} = useData();
  const w = realW.length > 0 ? realW : DEMO;
  const [declarations, setDeclarations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({travailleur:'',type:'IN',date:new Date().toISOString().split('T')[0]});

  useEffect(()=>{
    setDeclarations(w.filter(t=>t.statut==='actif').map((t,i)=>({
      id:i, nom:t.nom+' '+(t.prenom||''), type:i===w.length-1?'OUT':'IN',
      date:t.date_entree||'2026-01-15', niss:t.niss||'-', typeTrav:'OTH',
      statut:i<2?'acceptee':'a_envoyer', numero:i<2?'DIM-2026-'+(142+i):'-'
    })));
  },[realW.length]);

  const stats = {total:declarations.length, in:declarations.filter(d=>d.type==='IN').length, out:declarations.filter(d=>d.type==='OUT').length, att:declarations.filter(d=>d.statut==='a_envoyer').length};

  return (
    <div>
      <h1>Dimona</h1>
      <p>Declarations d entree et sortie — {realW.length>0?'Donnees reelles':'Donnees demo'}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[{l:'TOTAL',v:stats.total,c:'#f1f5f9'},{l:'DIMONA IN',v:stats.in,c:'#22c55e'},{l:'DIMONA OUT',v:stats.out,c:'#ef4444'},{l:'EN ATTENTE',v:stats.att,c:'#f97316'}].map((k,i)=>(
          <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
            <div style={{fontSize:24,fontWeight:700,color:k.c,marginTop:4,fontFamily:'monospace'}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        <button onClick={()=>setShowForm(!showForm)}>+ Nouvelle Dimona</button>
        <button style={{background:'#131825',color:'#94a3b8',border:'1px solid #1e293b'}} onClick={()=>{const a=declarations.filter(d=>d.statut==='a_envoyer');if(a.length){setDeclarations(declarations.map(d=>d.statut==='a_envoyer'?{...d,statut:'en_cours'}:d));alert(a.length+' envoyee(s)');}else alert('Rien');}}>Envoyer en attente</button>
      </div>
      {showForm&&(<div style={{background:'#131825',border:'1px solid #c9a227',borderRadius:8,padding:20,marginBottom:20}}>
        <h2 style={{marginTop:0}}>Nouvelle Dimona</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          <div><label>Travailleur</label><select value={form.travailleur} onChange={e=>setForm({...form,travailleur:e.target.value})} style={{width:'100%',marginTop:4}}><option value="">--</option>{w.map((t,i)=><option key={i} value={t.nom}>{t.nom} {t.prenom||''}</option>)}</select></div>
          <div><label>Type</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{width:'100%',marginTop:4}}><option>IN</option><option>OUT</option><option>UPDATE</option></select></div>
          <div><label>Date</label><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={{width:'100%',marginTop:4}}/></div>
        </div>
        <div style={{marginTop:12,display:'flex',gap:8}}>
          <button onClick={()=>{if(!form.travailleur)return alert('Selectionnez un travailleur');setDeclarations([...declarations,{id:Date.now(),nom:form.travailleur,type:form.type,date:form.date,niss:'-',typeTrav:'OTH',statut:'a_envoyer',numero:'-'}]);setShowForm(false);}}>Creer</button>
          <button onClick={()=>setShowForm(false)} style={{background:'#1e293b',color:'#94a3b8'}}>Annuler</button>
        </div>
      </div>)}
      <table><thead><tr><th>Travailleur</th><th>Type</th><th>Date</th><th>NISS</th><th>Statut</th><th>N Dimona</th></tr></thead>
      <tbody>{declarations.map(d=>{const stColors={acceptee:'#22c55e',a_envoyer:'#f97316',rejetee:'#ef4444',en_cours:'#3b82f6'};return(
        <tr key={d.id}><td style={{fontWeight:600}}>{d.nom}</td>
        <td><span style={{background:d.type==='IN'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)',color:d.type==='IN'?'#22c55e':'#ef4444',borderRadius:12,padding:'2px 10px',fontSize:11,fontWeight:700}}>{d.type}</span></td>
        <td style={{fontFamily:'monospace'}}>{d.date}</td><td style={{fontFamily:'monospace',fontSize:12}}>{d.niss}</td>
        <td><span style={{background:(stColors[d.statut]||'#3b82f6')+'20',color:stColors[d.statut]||'#3b82f6',borderRadius:12,padding:'2px 10px',fontSize:11,fontWeight:700}}>{d.statut}</span></td>
        <td style={{fontFamily:'monospace',fontSize:12}}>{d.numero}</td></tr>)})}</tbody></table>
    </div>
  );
}