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

const TYPES_PRIMES = [
  {id:'13e',nom:'13eme mois',taux:1/12,desc:'Prime de fin d annee - 1/12 du salaire annuel',imposable:true},
  {id:'vacances',nom:'Double pecule vacances',taux:0.0769,desc:'92% du salaire mensuel (employes)',imposable:true},
  {id:'anciennete',nom:'Prime d anciennete',taux:0.02,desc:'2% par 5 ans d anciennete',imposable:true},
  {id:'resultat',nom:'Prime de resultat (CCT90)',taux:0,desc:'Max 3.948 EUR/an - avantage social et fiscal',imposable:false},
  {id:'naissance',nom:'Prime de naissance',taux:0,desc:'Forfait entreprise',imposable:false},
];

export default function PrimesPage() {
  const {workers:realW} = useData();
  const w = (realW.length>0?realW:DEMO).filter(t=>t.statut==='actif');

  const masseBrute = w.reduce((s,t)=>s+(Number(t.salaire_brut)||0),0);
  const p13 = masseBrute/12;
  const pVac = masseBrute*0.0769;

  return (
    <div>
      <h1>Primes et Avantages</h1>
      <p>Gestion des primes — {realW.length>0?'Donnees reelles':'Demo'}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[{l:'TRAVAILLEURS',v:w.length,c:'#f1f5f9'},{l:'13E MOIS',v:p13.toFixed(2)+' EUR',c:'#c9a227'},{l:'PECULE DOUBLE',v:pVac.toFixed(2)+' EUR',c:'#3b82f6'},{l:'TOTAL PRIMES',v:(p13+pVac).toFixed(2)+' EUR',c:'#22c55e'}].map((k,i)=>(
          <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
            <div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:4,fontFamily:'monospace'}}>{k.v}</div>
          </div>
        ))}
      </div>
      <h2>Types de primes</h2>
      <table><thead><tr><th>Prime</th><th>Calcul</th><th>Description</th><th>Imposable</th></tr></thead>
      <tbody>{TYPES_PRIMES.map((p,i)=>(
        <tr key={i}><td style={{fontWeight:600,color:'#c9a227'}}>{p.nom}</td>
        <td style={{fontFamily:'monospace'}}>{p.taux?(p.taux*100).toFixed(2)+'%':'Forfait'}</td>
        <td style={{fontSize:12,color:'#94a3b8'}}>{p.desc}</td>
        <td><span style={{background:p.imposable?'rgba(239,68,68,0.15)':'rgba(34,197,94,0.15)',color:p.imposable?'#ef4444':'#22c55e',borderRadius:12,padding:'2px 10px',fontSize:11,fontWeight:700}}>{p.imposable?'Oui':'Non'}</span></td></tr>
      ))}</tbody></table>
      <h2>Simulation par travailleur</h2>
      <table><thead><tr><th>Travailleur</th><th>Brut</th><th>13e mois</th><th>Pecule double</th><th>Total annuel</th></tr></thead>
      <tbody>{w.map((t,i)=>{const b=Number(t.salaire_brut)||0;return(
        <tr key={i}><td style={{fontWeight:600}}>{t.nom} {t.prenom||''}</td>
        <td style={{fontFamily:'monospace'}}>{b.toFixed(2)}</td>
        <td style={{fontFamily:'monospace',color:'#c9a227'}}>{(b/12).toFixed(2)}</td>
        <td style={{fontFamily:'monospace',color:'#3b82f6'}}>{(b*0.0769).toFixed(2)}</td>
        <td style={{fontFamily:'monospace',fontWeight:700,color:'#22c55e'}}>{(b/12+b*0.0769).toFixed(2)} EUR</td></tr>);})}</tbody></table>
    </div>
  );
}