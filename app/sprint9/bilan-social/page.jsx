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

export default function BilanSocialPage() {
  const {workers:realW} = useData();
  const w = realW.length>0?realW:DEMO;
  const actifs=w.filter(t=>t.statut==='actif');
  const h=actifs.filter(t=>t.sexe!=='F').length;const f=actifs.filter(t=>t.sexe==='F').length;
  const etp=actifs.filter(t=>t.regime==='temps_plein').length+actifs.filter(t=>t.regime!=='temps_plein').length*0.5;
  const masseBrute=actifs.reduce((s,t)=>s+(Number(t.salaire_brut)||0)*12,0);

  return (
    <div>
      <h1>Bilan Social</h1>
      <p>Bilan annuel BNB — {realW.length>0?'Donnees reelles':'Demo'}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[{l:'EFFECTIF',v:actifs.length,c:'#f1f5f9'},{l:'ETP',v:etp.toFixed(1),c:'#3b82f6'},{l:'HOMMES',v:h,c:'#a855f7'},{l:'FEMMES',v:f,c:'#ec4899'}].map((k,i)=>(
          <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
            <div style={{fontSize:24,fontWeight:700,color:k.c,marginTop:4,fontFamily:'monospace'}}>{k.v}</div>
          </div>
        ))}
      </div>
      <h2>Etat de l emploi</h2>
      <table><thead><tr><th>Rubrique</th><th>H</th><th>F</th><th>Total</th></tr></thead>
      <tbody>
        <tr><td>Inscrits au registre</td><td style={{fontFamily:'monospace'}}>{h}</td><td style={{fontFamily:'monospace'}}>{f}</td><td style={{fontFamily:'monospace',fontWeight:700}}>{actifs.length}</td></tr>
        <tr><td>ETP</td><td style={{fontFamily:'monospace'}}>{(etp*h/Math.max(1,actifs.length)).toFixed(1)}</td><td style={{fontFamily:'monospace'}}>{(etp*f/Math.max(1,actifs.length)).toFixed(1)}</td><td style={{fontFamily:'monospace',fontWeight:700}}>{etp.toFixed(1)}</td></tr>
        <tr><td>Frais de personnel (EUR)</td><td style={{fontFamily:'monospace'}}>{Math.round(masseBrute*h/Math.max(1,actifs.length)).toLocaleString()}</td><td style={{fontFamily:'monospace'}}>{Math.round(masseBrute*f/Math.max(1,actifs.length)).toLocaleString()}</td><td style={{fontFamily:'monospace',fontWeight:700,color:'#c9a227'}}>{Math.round(masseBrute).toLocaleString()}</td></tr>
      </tbody></table>
    </div>
  );
}