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

export default function ODComptablesPage() {
  const {workers:realW,fiches} = useData();
  const w = (realW.length>0?realW:DEMO).filter(t=>t.statut==='actif');
  const [mois]=useState('2026-02');const [format,setFormat]=useState('BOB50');

  const totalBrut=w.reduce((s,t)=>s+(Number(t.salaire_brut)||0),0);
  const onssPatr=totalBrut*0.2492;const onssPerso=totalBrut*0.1307;const pp=totalBrut*0.27;const css=w.length*60.94;const net=totalBrut-onssPerso-pp-css;

  const ecritures=[
    {c:'455000',l:'Remunerations brutes',d:totalBrut,cr:0},
    {c:'453000',l:'ONSS patronal',d:onssPatr,cr:0},
    {c:'621000',l:'Cotisations patronales',d:0,cr:onssPatr},
    {c:'453100',l:'ONSS personnel',d:0,cr:onssPerso},
    {c:'453200',l:'Precompte professionnel',d:0,cr:pp},
    {c:'453300',l:'CSS',d:0,cr:css},
    {c:'455100',l:'Net a payer',d:0,cr:net},
    {c:'620000',l:'Remunerations',d:0,cr:totalBrut},
  ];
  const tD=ecritures.reduce((s,e)=>s+e.d,0);const tC=ecritures.reduce((s,e)=>s+e.cr,0);

  return (
    <div>
      <h1>O.D. Comptables</h1>
      <p>Ecritures de paie — {mois} — {realW.length>0?'Donnees reelles':'Demo'}</p>
      <div style={{display:'flex',gap:16,marginBottom:24,alignItems:'flex-end'}}>
        <div><label>Format</label><select value={format} onChange={e=>setFormat(e.target.value)} style={{marginLeft:8}}>{['BOB50','WinBooks','Horus','Exact Online','CSV'].map(f=><option key={f}>{f}</option>)}</select></div>
        <button onClick={()=>alert('Export '+format+' genere')}>Exporter {format}</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
        {[{l:'TOTAL DEBIT',v:tD.toFixed(2)+' EUR',c:'#3b82f6'},{l:'TOTAL CREDIT',v:tC.toFixed(2)+' EUR',c:'#f97316'},{l:'EQUILIBRE',v:Math.abs(tD-tC)<0.01?'OK':'ERREUR',c:Math.abs(tD-tC)<0.01?'#22c55e':'#ef4444'}].map((k,i)=>(
          <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
            <div style={{fontSize:20,fontWeight:700,color:k.c,marginTop:4,fontFamily:'monospace'}}>{k.v}</div>
          </div>
        ))}
      </div>
      <table><thead><tr><th>Compte</th><th>Libelle</th><th>Debit</th><th>Credit</th></tr></thead>
      <tbody>{ecritures.map((e,i)=>(
        <tr key={i}><td style={{fontFamily:'monospace',fontWeight:600}}>{e.c}</td><td>{e.l}</td>
        <td style={{fontFamily:'monospace',color:e.d?'#3b82f6':'#64748b'}}>{e.d?e.d.toFixed(2)+' EUR':'-'}</td>
        <td style={{fontFamily:'monospace',color:e.cr?'#f97316':'#64748b'}}>{e.cr?e.cr.toFixed(2)+' EUR':'-'}</td></tr>
      ))}<tr style={{fontWeight:700,borderTop:'2px solid #c9a227'}}><td colSpan={2}>TOTAL</td><td style={{fontFamily:'monospace',color:'#3b82f6'}}>{tD.toFixed(2)}</td><td style={{fontFamily:'monospace',color:'#f97316'}}>{tC.toFixed(2)}</td></tr></tbody></table>
    </div>
  );
}