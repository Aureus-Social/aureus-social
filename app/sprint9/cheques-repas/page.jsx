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

export default function ChequesRepasPage() {
  const {workers:realW} = useData();
  const w = (realW.length>0?realW:DEMO).filter(t=>t.statut==='actif');
  const [valeur,setValeur]=useState(8);const [partPatr,setPartPatr]=useState(6.91);const [mois,setMois]=useState('2026-02');

  const partTrav=valeur-partPatr;
  const totalJ=w.reduce((s,t)=>s+(t.regime==='mi_temps'?10:21),0);
  const coutP=totalJ*partPatr;const coutT=totalJ*partTrav;const coutTotal=totalJ*valeur;

  return (
    <div>
      <h1>Cheques-repas</h1>
      <p>Commande mensuelle — {realW.length>0?'Donnees reelles':'Demo'}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
        <div><label>Valeur faciale (max 8)</label><input type="number" step="0.01" max="8" value={valeur} onChange={e=>setValeur(Math.min(8,Number(e.target.value)))} style={{width:'100%',marginTop:4}}/></div>
        <div><label>Part patronale (max 6.91)</label><input type="number" step="0.01" max="6.91" value={partPatr} onChange={e=>setPartPatr(Math.min(6.91,Number(e.target.value)))} style={{width:'100%',marginTop:4}}/></div>
        <div><label>Mois</label><input type="month" value={mois} onChange={e=>setMois(e.target.value)} style={{width:'100%',marginTop:4}}/></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[{l:'TITRES',v:totalJ,c:'#f1f5f9'},{l:'COUT PATRONAL',v:coutP.toFixed(2)+' EUR',c:'#f97316'},{l:'RETENUE TRAV.',v:coutT.toFixed(2)+' EUR',c:'#3b82f6'},{l:'TOTAL',v:coutTotal.toFixed(2)+' EUR',c:'#c9a227'}].map((k,i)=>(
          <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
            <div style={{fontSize:20,fontWeight:700,color:k.c,marginTop:4,fontFamily:'monospace'}}>{k.v}</div>
          </div>
        ))}
      </div>
      <h2>Detail par travailleur — {mois}</h2>
      <table><thead><tr><th>Travailleur</th><th>Regime</th><th>Jours</th><th>Titres</th><th>Part patr.</th><th>Part trav.</th><th>Total</th></tr></thead>
      <tbody>{w.map((t,i)=>{const j=t.regime==='mi_temps'?10:21;return(
        <tr key={i}><td style={{fontWeight:600}}>{t.nom} {t.prenom||''}</td>
        <td><span style={{background:t.regime==='mi_temps'?'rgba(59,130,246,0.15)':'rgba(34,197,94,0.15)',color:t.regime==='mi_temps'?'#3b82f6':'#22c55e',borderRadius:12,padding:'2px 10px',fontSize:11,fontWeight:600}}>{t.regime==='mi_temps'?'Mi-temps':'Temps plein'}</span></td>
        <td style={{fontFamily:'monospace'}}>{j}</td><td style={{fontFamily:'monospace',fontWeight:700}}>{j}</td>
        <td style={{fontFamily:'monospace',color:'#f97316'}}>{(j*partPatr).toFixed(2)}</td>
        <td style={{fontFamily:'monospace',color:'#3b82f6'}}>{(j*partTrav).toFixed(2)}</td>
        <td style={{fontFamily:'monospace',fontWeight:700}}>{(j*valeur).toFixed(2)}</td></tr>);})}
      <tr style={{fontWeight:700,borderTop:'2px solid #c9a227'}}><td colSpan={3}>TOTAL</td><td style={{fontFamily:'monospace'}}>{totalJ}</td><td style={{fontFamily:'monospace',color:'#f97316'}}>{coutP.toFixed(2)}</td><td style={{fontFamily:'monospace',color:'#3b82f6'}}>{coutT.toFixed(2)}</td><td style={{fontFamily:'monospace',color:'#c9a227'}}>{coutTotal.toFixed(2)}</td></tr></tbody></table>
    </div>
  );
}