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

export default function ProvisionsPage() {
  const {workers:realW} = useData();
  const w = (realW.length>0?realW:DEMO).filter(t=>t.statut==='actif');
  const [mois]=useState('2026-02');

  const totalBrut=w.reduce((s,t)=>s+(Number(t.salaire_brut)||0),0);
  const pS=totalBrut/12;const pD=totalBrut*0.0769;const p13=totalBrut/12;
  const pOnss=(pS+pD+p13)*0.2492;const total=pS+pD+p13+pOnss;

  return (
    <div>
      <h1>Provisions</h1>
      <p>Provisions mensuelles — {realW.length>0?'Donnees reelles':'Demo'}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[{l:'MASSE SALARIALE',v:totalBrut.toFixed(2)+' EUR',c:'#f1f5f9'},{l:'PROV. MOIS',v:total.toFixed(2)+' EUR',c:'#c9a227'},{l:'PROV. CUMULEES',v:(total*2).toFixed(2)+' EUR',c:'#3b82f6'},{l:'PROV. ANNUELLE',v:(total*12).toFixed(2)+' EUR',c:'#22c55e'}].map((k,i)=>(
          <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
            <div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:4,fontFamily:'monospace'}}>{k.v}</div>
          </div>
        ))}
      </div>
      <h2>Decomposition mensuelle</h2>
      <table><thead><tr><th>Type</th><th>Base</th><th>Taux</th><th>Montant</th></tr></thead>
      <tbody>
        <tr><td style={{fontWeight:600}}>Pecule simple</td><td style={{fontFamily:'monospace'}}>{totalBrut.toFixed(2)}</td><td style={{fontFamily:'monospace'}}>1/12</td><td style={{fontFamily:'monospace',color:'#c9a227'}}>{pS.toFixed(2)}</td></tr>
        <tr><td style={{fontWeight:600}}>Pecule double</td><td style={{fontFamily:'monospace'}}>{totalBrut.toFixed(2)}</td><td style={{fontFamily:'monospace'}}>7.69%</td><td style={{fontFamily:'monospace',color:'#c9a227'}}>{pD.toFixed(2)}</td></tr>
        <tr><td style={{fontWeight:600}}>13eme mois</td><td style={{fontFamily:'monospace'}}>{totalBrut.toFixed(2)}</td><td style={{fontFamily:'monospace'}}>1/12</td><td style={{fontFamily:'monospace',color:'#c9a227'}}>{p13.toFixed(2)}</td></tr>
        <tr><td style={{fontWeight:600,color:'#f97316'}}>ONSS patronal</td><td style={{fontFamily:'monospace'}}>{(pS+pD+p13).toFixed(2)}</td><td style={{fontFamily:'monospace'}}>24.92%</td><td style={{fontFamily:'monospace',color:'#f97316'}}>{pOnss.toFixed(2)}</td></tr>
        <tr style={{fontWeight:700,borderTop:'2px solid #c9a227'}}><td colSpan={3}>TOTAL MENSUEL</td><td style={{fontFamily:'monospace',color:'#c9a227',fontSize:16}}>{total.toFixed(2)} EUR</td></tr>
      </tbody></table>
      <h2>Detail par travailleur</h2>
      <table><thead><tr><th>Travailleur</th><th>Brut</th><th>Prov. pecule S</th><th>Prov. pecule D</th><th>Prov. 13e</th><th>Total</th></tr></thead>
      <tbody>{w.map((t,i)=>{const b=Number(t.salaire_brut)||0;const ps=b/12;const pd=b*0.0769;const p=b/12;return(
        <tr key={i}><td style={{fontWeight:600}}>{t.nom} {t.prenom||''}</td><td style={{fontFamily:'monospace'}}>{b.toFixed(2)}</td><td style={{fontFamily:'monospace'}}>{ps.toFixed(2)}</td><td style={{fontFamily:'monospace'}}>{pd.toFixed(2)}</td><td style={{fontFamily:'monospace'}}>{p.toFixed(2)}</td><td style={{fontFamily:'monospace',fontWeight:700,color:'#c9a227'}}>{(ps+pd+p).toFixed(2)}</td></tr>);})}</tbody></table>
    </div>
  );
}