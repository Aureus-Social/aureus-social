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
const TAUX = {patronal:0.2492,personnel:0.1307};

export default function ONSSPage() {
  const {workers:realW,loading} = useData();
  const w = (realW.length>0?realW:DEMO).filter(t=>t.statut==='actif');
  const [trimestre,setTrimestre]=useState('2026-Q1');

  const totalBrut=w.reduce((s,t)=>s+(Number(t.salaire_brut)||0)*3,0);
  const cotP=totalBrut*TAUX.patronal;const cotPers=totalBrut*TAUX.personnel;const cotT=cotP+cotPers;

  return (
    <div>
      <h1>ONSS / DmfA</h1>
      <p>Declarations trimestrielles — {realW.length>0?'Donnees reelles':'Demo'}</p>
      <div style={{display:'flex',gap:16,marginBottom:24,alignItems:'center'}}>
        <div><label>Trimestre </label><select value={trimestre} onChange={e=>setTrimestre(e.target.value)} style={{marginLeft:8}}>{['2026-Q1','2025-Q4','2025-Q3'].map(t=><option key={t}>{t}</option>)}</select></div>
        <button onClick={()=>alert('DmfA genere pour '+trimestre)}>Generer DmfA</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[{l:'MASSE BRUTE TRIM.',v:totalBrut.toFixed(2)+' EUR',c:'#f1f5f9'},{l:'COT. PATRONALES',v:cotP.toFixed(2)+' EUR',c:'#f97316'},{l:'COT. PERSONNELLES',v:cotPers.toFixed(2)+' EUR',c:'#3b82f6'},{l:'TOTAL ONSS',v:cotT.toFixed(2)+' EUR',c:'#ef4444'}].map((k,i)=>(
          <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
            <div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:4,fontFamily:'monospace'}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:20,marginBottom:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,textAlign:'center'}}>
          <div><div style={{fontSize:28,fontWeight:700,color:'#f97316',fontFamily:'monospace'}}>{(TAUX.patronal*100).toFixed(2)}%</div><div style={{fontSize:12,color:'#94a3b8'}}>Patronal</div></div>
          <div><div style={{fontSize:28,fontWeight:700,color:'#3b82f6',fontFamily:'monospace'}}>{(TAUX.personnel*100).toFixed(2)}%</div><div style={{fontSize:12,color:'#94a3b8'}}>Personnel</div></div>
          <div><div style={{fontSize:28,fontWeight:700,color:'#c9a227',fontFamily:'monospace'}}>{((TAUX.patronal+TAUX.personnel)*100).toFixed(2)}%</div><div style={{fontSize:12,color:'#94a3b8'}}>Total</div></div>
        </div>
      </div>
      <h2>Detail DmfA — {trimestre}</h2>
      <table><thead><tr><th>Travailleur</th><th>Cat.</th><th>Brut trim.</th><th>Cot. patr.</th><th>Cot. pers.</th><th>Total</th></tr></thead>
      <tbody>{w.map((t,i)=>{const b=(Number(t.salaire_brut)||0)*3;const cp=b*TAUX.patronal;const ct=b*TAUX.personnel;return(
        <tr key={i}><td style={{fontWeight:600}}>{t.nom} {t.prenom||''}</td>
        <td><span style={{background:t.categorie==='employe'?'rgba(59,130,246,0.15)':'rgba(168,85,247,0.15)',color:t.categorie==='employe'?'#3b82f6':'#a855f7',borderRadius:12,padding:'2px 10px',fontSize:11,fontWeight:600}}>{t.categorie||'employe'}</span></td>
        <td style={{fontFamily:'monospace'}}>{b.toFixed(2)}</td>
        <td style={{fontFamily:'monospace',color:'#f97316'}}>{cp.toFixed(2)}</td>
        <td style={{fontFamily:'monospace',color:'#3b82f6'}}>{ct.toFixed(2)}</td>
        <td style={{fontFamily:'monospace',fontWeight:700}}>{(cp+ct).toFixed(2)}</td></tr>);})
      }<tr style={{fontWeight:700,borderTop:'2px solid #c9a227'}}><td colSpan={2}>TOTAL</td><td style={{fontFamily:'monospace'}}>{totalBrut.toFixed(2)}</td><td style={{fontFamily:'monospace',color:'#f97316'}}>{cotP.toFixed(2)}</td><td style={{fontFamily:'monospace',color:'#3b82f6'}}>{cotPers.toFixed(2)}</td><td style={{fontFamily:'monospace',color:'#ef4444'}}>{cotT.toFixed(2)}</td></tr></tbody></table>
    </div>
  );
}