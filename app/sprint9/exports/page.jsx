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

export default function ExportsPage() {
  const {workers:realW,clients,fiches,fid} = useData();
  const w = realW.length>0?realW:DEMO;

  function exportCSV(type){
    let csv='';
    if(type==='travailleurs'){
      csv='Nom;Prenom;NISS;Contrat;Categorie;Regime;Brut;Fonction;Date entree\n';
      w.forEach(t=>{csv+=t.nom+';'+(t.prenom||'')+';'+(t.niss||'')+';'+(t.type_contrat||'')+';'+(t.categorie||'')+';'+(t.regime||'')+';'+(t.salaire_brut||0)+';'+(t.fonction||'')+';'+(t.date_entree||'')+'\n';});
    }else if(type==='clients'){
      csv='Nom;BCE;CP;Ville;Statut\n';
      (clients.length?clients:[{nom:'SPRL Exemple',bce:'0123.456.789',commission_paritaire:'200',ville:'Bruxelles',statut:'actif'}]).forEach(c=>{csv+=c.nom+';'+(c.bce||'')+';CP '+(c.commission_paritaire||'')+';'+(c.ville||'')+';'+(c.statut||'')+'\n';});
    }else if(type==='fiches'){
      csv='Mois;Travailleur;Brut;ONSS;PP;CSS;Net;ONSS Patr;Cout\n';
      (fiches.length?fiches:[]).forEach(f=>{csv+=(f.mois||'')+';'+(f.travailleur_id||'')+';'+(f.salaire_brut||0)+';'+(f.onss_personnel||0)+';'+(f.precompte_pro||0)+';'+(f.css||0)+';'+(f.net_a_payer||0)+';'+(f.onss_patronal||0)+';'+(f.cout_employeur||0)+'\n';});
    }
    const blob = new Blob([csv],{type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');a.href=url;a.download='export_'+type+'_'+new Date().toISOString().split('T')[0]+'.csv';a.click();
  }

  function exportJSON(type){
    const data = type==='travailleurs'?w:type==='clients'?(clients.length?clients:[]):fiches;
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');a.href=url;a.download='export_'+type+'_'+new Date().toISOString().split('T')[0]+'.json';a.click();
  }

  return (
    <div>
      <h1>Exports</h1>
      <p>Exportation des donnees — {realW.length>0?'Donnees reelles':'Demo'}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
        {[{l:'TRAVAILLEURS',v:w.length,c:'#3b82f6'},{l:'CLIENTS',v:clients.length||1,c:'#22c55e'},{l:'FICHES',v:fiches.length,c:'#c9a227'}].map((k,i)=>(
          <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
            <div style={{fontSize:24,fontWeight:700,color:k.c,marginTop:4,fontFamily:'monospace'}}>{k.v}</div>
          </div>
        ))}
      </div>
      <h2>Exports disponibles</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
        {[
          {type:'travailleurs',titre:'Travailleurs',desc:'Liste complete avec NISS, contrat, salaire',icon:'T'},
          {type:'clients',titre:'Clients',desc:'Entreprises avec BCE, CP, ville',icon:'C'},
          {type:'fiches',titre:'Fiches de paie',desc:'Historique brut, net, ONSS, PP',icon:'F'},
        ].map((e,i)=>(
          <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:24}}>
            <div style={{width:40,height:40,borderRadius:8,background:'rgba(201,162,39,0.15)',color:'#c9a227',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16,marginBottom:12}}>{e.icon}</div>
            <div style={{fontWeight:600,fontSize:15,color:'#f1f5f9',marginBottom:4}}>{e.titre}</div>
            <div style={{fontSize:12,color:'#94a3b8',marginBottom:16}}>{e.desc}</div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>exportCSV(e.type)} style={{flex:1}}>CSV</button>
              <button onClick={()=>exportJSON(e.type)} style={{flex:1,background:'#1e293b',color:'#94a3b8'}}>JSON</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}