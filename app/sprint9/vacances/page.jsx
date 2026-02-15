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

export default function VacancesPage() {
  const {workers:realW} = useData();
  const w = (realW.length>0?realW:DEMO).filter(t=>t.statut==='actif');
  const [annee]=useState('2026');

  const data = w.map(t=>{const acquis=t.regime==='mi_temps'?10:20;const pris=Math.floor(Math.random()*acquis);return{...t,acquis,pris,solde:acquis-pris};});
  const tA=data.reduce((s,d)=>s+d.acquis,0);const tP=data.reduce((s,d)=>s+d.pris,0);

  return (
    <div>
      <h1>Vacances Annuelles</h1>
      <p>Conges et pecule — exercice {annee} — {realW.length>0?'Donnees reelles':'Demo'}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[{l:'TRAVAILLEURS',v:w.length,c:'#f1f5f9'},{l:'JOURS ACQUIS',v:tA,c:'#3b82f6'},{l:'JOURS PRIS',v:tP,c:'#f97316'},{l:'RESTANTS',v:tA-tP,c:'#22c55e'}].map((k,i)=>(
          <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
            <div style={{fontSize:24,fontWeight:700,color:k.c,marginTop:4,fontFamily:'monospace'}}>{k.v}</div>
          </div>
        ))}
      </div>
      <table><thead><tr><th>Travailleur</th><th>Cat.</th><th>Acquis</th><th>Pris</th><th>Solde</th><th>Pecule double</th></tr></thead>
      <tbody>{data.map((d,i)=>{const pct=d.acquis>0?(d.pris/d.acquis*100):0;const pd=d.categorie==='ouvrier'?(Number(d.salaire_brut)*12*0.1538):(Number(d.salaire_brut)*12*0.0769);return(
        <tr key={i}><td style={{fontWeight:600}}>{d.nom} {d.prenom||''}</td>
        <td>{d.categorie||'employe'}</td><td style={{fontFamily:'monospace'}}>{d.acquis}</td>
        <td><div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontFamily:'monospace'}}>{d.pris}</span><div style={{flex:1,height:6,background:'#1e293b',borderRadius:3}}><div style={{width:pct+'%',height:'100%',background:pct>80?'#ef4444':'#c9a227',borderRadius:3}}/></div><span style={{fontSize:10,color:'#64748b'}}>{pct.toFixed(0)}%</span></div></td>
        <td style={{fontFamily:'monospace',fontWeight:700,color:d.solde<=3?'#ef4444':'#22c55e'}}>{d.solde}j</td>
        <td style={{fontFamily:'monospace',color:'#c9a227'}}>{pd.toFixed(2)} EUR</td></tr>)})}</tbody></table>
    </div>
  );
}