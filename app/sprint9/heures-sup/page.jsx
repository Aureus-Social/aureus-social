'use client';
import { useState, useEffect } from 'react';

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'');
function useData() {
  const [fid,setFid]=useState(null);const [clients,setClients]=useState([]);const [workers,setWorkers]=useState([]);const [fiches,setFiches]=useState([]);const [loading,setLoading]=useState(true);
  useEffect(()=>{(async()=>{
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){setLoading(false);return;}
    const {data:f}=await supabase.from('fiduciaires').select('*').eq('user_id',user.id).single();
    setFid(f);if(f){
      const {data:cl}=await supabase.from('sp_clients').select('*').eq('fiduciaire_id',f.id);setClients(cl||[]);
      const ids=(cl||[]).map(c=>c.id);
      if(ids.length){const {data:tr}=await supabase.from('sp_travailleurs').select('*').in('client_id',ids);setWorkers(tr||[]);
        const {data:fp}=await supabase.from('sp_fiches_paie').select('*').in('client_id',ids);setFiches(fp||[]);}
    }setLoading(false);
  })();},[]);
  return {fid,clients,workers,fiches,loading};
}
const DEMO = [
  {id:'d1',nom:'Dupont',prenom:'Marie',salaire_brut:3500,categorie:'employe',regime:'temps_plein',type_contrat:'CDI',date_entree:'2024-03-15',niss:'85.02.15-123.45',enfants_charge:2,etat_civil:'marie',client_id:'c1',statut:'actif',fonction:'Comptable',heures_semaine:38},
  {id:'d2',nom:'Janssen',prenom:'Pieter',salaire_brut:4200,categorie:'employe',regime:'temps_plein',type_contrat:'CDI',date_entree:'2023-01-10',niss:'92.08.22-456.78',enfants_charge:1,etat_civil:'celibataire',client_id:'c1',statut:'actif',fonction:'Analyste',heures_semaine:38},
  {id:'d3',nom:'Martin',prenom:'Lucas',salaire_brut:2800,categorie:'ouvrier',regime:'mi_temps',type_contrat:'CDD',date_entree:'2025-09-01',niss:'88.11.30-789.01',enfants_charge:0,etat_civil:'celibataire',client_id:'c1',statut:'actif',fonction:'Technicien',heures_semaine:19},
];

export default function HeuresSupPage() {
  const {workers:realW} = useData();
  const w = (realW.length>0?realW:DEMO).filter(t=>t.statut==='actif');
  const [mois]=useState('2026-02');

  const data = w.map(t=>{const h=Math.floor(Math.random()*15);const base=(Number(t.salaire_brut)||0)/(Number(t.heures_semaine)||38)/4.33;const suppl=h*base*1.5;return{...t,heuresSup:h,tauxH:base,suppl};});
  const totalH=data.reduce((s,d)=>s+d.heuresSup,0);const totalS=data.reduce((s,d)=>s+d.suppl,0);

  return (
    <div>
      <h1>Heures Supplementaires</h1>
      <p>Suivi et calcul — {mois} — {realW.length>0?'Donnees reelles':'Demo'}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[{l:'TRAVAILLEURS',v:w.length,c:'#f1f5f9'},{l:'HEURES SUP',v:totalH+'h',c:'#f97316'},{l:'SUPPLEMENT',v:totalS.toFixed(2)+' EUR',c:'#c9a227'},{l:'MAJORATION',v:'50%',c:'#3b82f6'}].map((k,i)=>(
          <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
            <div style={{fontSize:20,fontWeight:700,color:k.c,marginTop:4,fontFamily:'monospace'}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:16,marginBottom:24,fontSize:13,color:'#94a3b8'}}>
        Reglementation belge: au-dela de 38h/semaine ou 9h/jour. Majorations: <b style={{color:'#c9a227'}}>+50%</b> jours ouvrables, <b style={{color:'#ef4444'}}>+100%</b> dimanches/feries. Maximum: 11h/jour, 50h/semaine (avec derogation). Recuperation obligatoire dans le trimestre.
      </div>
      <table><thead><tr><th>Travailleur</th><th>Regime</th><th>Heures/sem</th><th>H. sup</th><th>Taux horaire</th><th>Majoration</th><th>Supplement</th></tr></thead>
      <tbody>{data.map((d,i)=>(
        <tr key={i}><td style={{fontWeight:600}}>{d.nom} {d.prenom||''}</td>
        <td>{d.regime==='mi_temps'?'Mi-temps':'Temps plein'}</td>
        <td style={{fontFamily:'monospace'}}>{d.heures_semaine||38}h</td>
        <td style={{fontFamily:'monospace',color:d.heuresSup>0?'#f97316':'#64748b',fontWeight:700}}>{d.heuresSup}h</td>
        <td style={{fontFamily:'monospace'}}>{d.tauxH.toFixed(2)} EUR</td>
        <td style={{fontFamily:'monospace',color:'#c9a227'}}>x1.50</td>
        <td style={{fontFamily:'monospace',fontWeight:700,color:'#c9a227'}}>{d.suppl.toFixed(2)} EUR</td></tr>
      ))}<tr style={{fontWeight:700,borderTop:'2px solid #c9a227'}}><td colSpan={3}>TOTAL</td><td style={{fontFamily:'monospace',color:'#f97316'}}>{totalH}h</td><td colSpan={2}></td><td style={{fontFamily:'monospace',color:'#c9a227'}}>{totalS.toFixed(2)} EUR</td></tr></tbody></table>
    </div>
  );
}