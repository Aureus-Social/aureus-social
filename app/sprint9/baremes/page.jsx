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

const BAREMES = {
  '100':{nom:'Commission paritaire auxiliaire pour ouvriers',min:14.5089,cat:'ouvrier'},
  '111':{nom:'Construction',min:16.5460,cat:'ouvrier'},
  '200':{nom:'Commission paritaire auxiliaire pour employes',min:1842.28,cat:'employe',type:'mensuel'},
  '201':{nom:'Commerce de detail independant',min:1842.28,cat:'employe',type:'mensuel'},
  '302':{nom:'Industrie hoteliere',min:13.7637,cat:'employe'},
  '304':{nom:'Spectacle',min:14.2000,cat:'employe'},
  '310':{nom:'Banques',min:2150.00,cat:'employe',type:'mensuel'},
  '317':{nom:'Gardiennage',min:14.8500,cat:'ouvrier'},
  '322':{nom:'Interim',min:0,cat:'employe',note:'Selon CP utilisateur'},
  '330':{nom:'Sante',min:1950.00,cat:'employe',type:'mensuel'},
  '332':{nom:'Aide sociale',min:1842.28,cat:'employe',type:'mensuel'},
};

export default function BaremesPage() {
  const {workers:realW} = useData();
  const w = realW.length>0?realW:DEMO;
  const [selCP,setSelCP]=useState('200');
  const [annee]=useState('2026');

  const bar = BAREMES[selCP]||BAREMES['200'];
  const cpWorkers = w.filter(t=>true); // all workers shown

  return (
    <div>
      <h1>Baremes par Commission Paritaire</h1>
      <p>Salaires minimums et indexation — {annee} — {realW.length>0?'Donnees reelles':'Demo'}</p>
      <div style={{display:'flex',gap:16,marginBottom:24,alignItems:'flex-end'}}>
        <div><label>Commission paritaire</label><select value={selCP} onChange={e=>setSelCP(e.target.value)} style={{display:'block',marginTop:4,minWidth:300}}>
          {Object.entries(BAREMES).map(([k,v])=><option key={k} value={k}>CP {k} - {v.nom}</option>)}
        </select></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[{l:'CP',v:selCP,c:'#f1f5f9'},{l:'MIN. '+(bar.type==='mensuel'?'MENSUEL':'HORAIRE'),v:bar.min?(bar.min.toFixed(bar.type==='mensuel'?2:4)+(bar.type==='mensuel'?' EUR':' EUR/h')):'Variable',c:'#c9a227'},{l:'CATEGORIE',v:bar.cat,c:'#3b82f6'},{l:'INDEX 2026',v:'+2.00%',c:'#22c55e'}].map((k,i)=>(
          <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
            <div style={{fontSize:18,fontWeight:700,color:k.c,marginTop:4,fontFamily:'monospace'}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:20,marginBottom:24}}>
        <div style={{fontWeight:700,color:'#c9a227',marginBottom:8}}>CP {selCP} — {bar.nom}</div>
        <div style={{fontSize:13,color:'#94a3b8',lineHeight:1.6}}>{bar.note||('Salaire minimum '+(bar.type==='mensuel'?'mensuel':'horaire')+' pour les '+(bar.cat==='ouvrier'?'ouvriers':'employes')+' de la CP '+selCP+'. Indexation annuelle automatique selon l indice sante.')}</div>
      </div>
      <h2>Verification salaires vs minimum</h2>
      <table><thead><tr><th>Travailleur</th><th>Cat.</th><th>Brut actuel</th><th>Minimum CP {selCP}</th><th>Statut</th></tr></thead>
      <tbody>{cpWorkers.map((t,i)=>{const brut=Number(t.salaire_brut)||0;const min=bar.type==='mensuel'?bar.min:(bar.min*(Number(t.heures_semaine)||38)*4.33);const ok=brut>=min;return(
        <tr key={i}><td style={{fontWeight:600}}>{t.nom} {t.prenom||''}</td>
        <td>{t.categorie||'employe'}</td>
        <td style={{fontFamily:'monospace'}}>{brut.toFixed(2)} EUR</td>
        <td style={{fontFamily:'monospace',color:'#64748b'}}>{min.toFixed(2)} EUR</td>
        <td><span style={{background:ok?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)',color:ok?'#22c55e':'#ef4444',borderRadius:12,padding:'2px 10px',fontSize:11,fontWeight:700}}>{ok?'Conforme':'Sous minimum!'}</span></td></tr>);})}</tbody></table>
      <h2>Toutes les CP disponibles</h2>
      <table><thead><tr><th>CP</th><th>Denomination</th><th>Cat.</th><th>Minimum</th></tr></thead>
      <tbody>{Object.entries(BAREMES).map(([k,v])=>(
        <tr key={k} style={{cursor:'pointer',background:k===selCP?'rgba(201,162,39,0.05)':'transparent'}} onClick={()=>setSelCP(k)}>
          <td style={{fontWeight:700,color:'#c9a227'}}>{k}</td><td>{v.nom}</td><td>{v.cat}</td>
          <td style={{fontFamily:'monospace'}}>{v.min?(v.min.toFixed(v.type==='mensuel'?2:4)+(v.type==='mensuel'?' EUR/mois':' EUR/h')):'Variable'}</td></tr>))}</tbody></table>
    </div>
  );
}