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
const AF=[{rang:1,montant:101.31,s6:17.52,s12:26.79,s18:30.33},{rang:2,montant:187.49,s6:34.28,s12:52.44,s18:59.31},{rang:3,montant:249.41,s6:34.28,s12:52.44,s18:59.31}];

export default function EnfantsPage() {
  const {workers:realW} = useData();
  const w = realW.length>0?realW:DEMO;
  const totalEnf=w.reduce((s,t)=>s+(Number(t.enfants_charge)||0),0);
  const withKids=w.filter(t=>(Number(t.enfants_charge)||0)>0);

  return (
    <div>
      <h1>Enfants et Allocations Familiales</h1>
      <p>Impact fiscal et social — {realW.length>0?'Donnees reelles':'Demo'}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
        {[{l:'AVEC ENFANTS',v:withKids.length,c:'#f1f5f9'},{l:'TOTAL ENFANTS',v:totalEnf,c:'#3b82f6'},{l:'IMPACT PP',v:'~'+([0,48,128,340][Math.min(totalEnf,3)])+' EUR/mois',c:'#22c55e'}].map((k,i)=>(
          <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
            <div style={{fontSize:20,fontWeight:700,color:k.c,marginTop:4,fontFamily:'monospace'}}>{k.v}</div>
          </div>
        ))}
      </div>
      <h2>Detail par travailleur</h2>
      <table><thead><tr><th>Travailleur</th><th>Enfants</th><th>Reduction PP</th></tr></thead>
      <tbody>{w.map((t,i)=>{const n=Number(t.enfants_charge)||0;return(
        <tr key={i}><td style={{fontWeight:600}}>{t.nom} {t.prenom||''}</td><td style={{fontFamily:'monospace'}}>{n}</td>
        <td style={{fontFamily:'monospace',color:'#22c55e'}}>{n>0?([0,48,128,340][Math.min(n,3)])+' EUR':'-'}</td></tr>);})}</tbody></table>
      <h2>Baremes allocations familiales (Bruxelles)</h2>
      <table><thead><tr><th>Rang</th><th>Base</th><th>+6 ans</th><th>+12 ans</th><th>+18 ans</th></tr></thead>
      <tbody>{AF.map((a,i)=>(<tr key={i}><td style={{fontWeight:700}}>{a.rang}e</td><td style={{fontFamily:'monospace',color:'#c9a227'}}>{a.montant.toFixed(2)}</td><td style={{fontFamily:'monospace'}}>+{a.s6.toFixed(2)}</td><td style={{fontFamily:'monospace'}}>+{a.s12.toFixed(2)}</td><td style={{fontFamily:'monospace'}}>+{a.s18.toFixed(2)}</td></tr>))}</tbody></table>
    </div>
  );
}