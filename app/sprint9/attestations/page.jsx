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

export default function AttestationsPage() {
  const {workers:realW,fid,clients} = useData();
  const w = realW.length>0?realW:DEMO;
  const [selWorker,setSelWorker]=useState('');
  const [type,setType]=useState('travail');

  const worker = w.find(t=>t.id===selWorker);
  const client = worker&&clients.length?clients.find(c=>c.id===worker.client_id):null;

  function generer(){
    if(!worker){alert('Selectionnez un travailleur');return;}
    const win = window.open('','','width=800,height=900');
    const types = {
      travail:{titre:'ATTESTATION DE TRAVAIL',corps:'Nous attestons que <b>'+worker.nom+' '+(worker.prenom||'')+'</b> (NISS: '+(worker.niss||'-')+') est employe(e) au sein de notre entreprise'+(client?' <b>'+client.nom+'</b>':'')+' depuis le <b>'+(worker.date_entree||'-')+'</b> en qualite de <b>'+(worker.fonction||worker.categorie||'employe')+'</b> sous contrat <b>'+(worker.type_contrat||'CDI')+'</b> a '+(worker.regime==='mi_temps'?'mi-temps':'temps plein')+'.'},
      c4:{titre:'FORMULAIRE C4 - CERTIFICAT DE CHOMAGE',corps:'Le(la) travailleur(se) <b>'+worker.nom+' '+(worker.prenom||'')+'</b> (NISS: '+(worker.niss||'-')+') a ete occupe(e) du <b>'+(worker.date_entree||'-')+'</b> au <b>'+new Date().toISOString().split('T')[0]+'</b>.<br/>Remuneration mensuelle brute: <b>'+(Number(worker.salaire_brut)||0).toFixed(2)+' EUR</b><br/>Motif de fin: ..............'},
      fiche281:{titre:'FICHE 281.10 - REVENUS PROFESSIONNELS',corps:'Beneficiaire: <b>'+worker.nom+' '+(worker.prenom||'')+'</b><br/>NISS: '+(worker.niss||'-')+'<br/>Remunerations brutes annuelles: <b>'+((Number(worker.salaire_brut)||0)*12).toFixed(2)+' EUR</b><br/>Precompte professionnel retenu: <b>'+((Number(worker.salaire_brut)||0)*12*0.27).toFixed(2)+' EUR</b><br/>Cotisations personnelles ONSS: <b>'+((Number(worker.salaire_brut)||0)*12*0.1307).toFixed(2)+' EUR</b>'},
    };
    const doc = types[type];
    win.document.write('<html><head><title>'+doc.titre+'</title><style>body{font-family:Arial,sans-serif;padding:60px;color:#1a1a1a;font-size:13px;line-height:1.8}h1{font-size:18px;text-align:center;border-bottom:2px solid #c9a227;padding-bottom:12px}.footer{margin-top:60px;font-size:11px;color:#666;border-top:1px solid #ddd;padding-top:12px}</style></head><body>');
    win.document.write('<div style="text-align:right;color:#c9a227;font-weight:700;font-size:16px">AUREUS SOCIAL PRO</div>');
    win.document.write('<div style="text-align:right;font-size:11px;color:#666">'+(fid?.nom||'Cabinet')+' | '+(fid?.bce||'')+'</div>');
    win.document.write('<h1>'+doc.titre+'</h1>');
    win.document.write('<p style="margin-top:30px">'+doc.corps+'</p>');
    win.document.write('<p style="margin-top:40px">Fait a Bruxelles, le '+new Date().toLocaleDateString('fr-BE')+'</p>');
    win.document.write('<div style="margin-top:60px;display:flex;justify-content:space-between"><div>Signature employeur<br/><br/><br/>_______________</div><div>Signature travailleur<br/><br/><br/>_______________</div></div>');
    win.document.write('<div class="footer">Document genere par Aureus Social Pro — '+(fid?.nom||'Cabinet')+' — '+new Date().toLocaleDateString('fr-BE')+'</div>');
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  }

  return (
    <div>
      <h1>Attestations</h1>
      <p>Generation de documents officiels — {realW.length>0?'Donnees reelles':'Demo'}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
        {[{l:'TRAVAILLEURS',v:w.length,c:'#f1f5f9'},{l:'TYPES DISPO',v:3,c:'#3b82f6'},{l:'SOURCE',v:realW.length>0?'Supabase':'Demo',c:'#c9a227'}].map((k,i)=>(
          <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:'14px 16px'}}>
            <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
            <div style={{fontSize:20,fontWeight:700,color:k.c,marginTop:4,fontFamily:'monospace'}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:16,marginBottom:24,alignItems:'flex-end'}}>
        <div><label>Travailleur</label><select value={selWorker} onChange={e=>setSelWorker(e.target.value)} style={{display:'block',width:300,marginTop:4}}><option value="">-- Choisir --</option>{w.map(t=><option key={t.id} value={t.id}>{t.nom} {t.prenom||''}</option>)}</select></div>
        <div><label>Type</label><select value={type} onChange={e=>setType(e.target.value)} style={{display:'block',marginTop:4}}><option value="travail">Attestation de travail</option><option value="c4">Formulaire C4</option><option value="fiche281">Fiche 281.10</option></select></div>
        <button onClick={generer}>Generer et imprimer</button>
      </div>
      <h2>Types d attestations disponibles</h2>
      <table><thead><tr><th>Type</th><th>Description</th><th>Usage</th></tr></thead>
      <tbody>
        <tr><td style={{fontWeight:600,color:'#c9a227'}}>Attestation de travail</td><td>Confirme l emploi actuel du travailleur</td><td>Banque, bail, administration</td></tr>
        <tr><td style={{fontWeight:600,color:'#c9a227'}}>Formulaire C4</td><td>Certificat de chomage en cas de fin de contrat</td><td>ONEM / syndicat</td></tr>
        <tr><td style={{fontWeight:600,color:'#c9a227'}}>Fiche 281.10</td><td>Fiche fiscale annuelle des revenus</td><td>Declaration d impots</td></tr>
      </tbody></table>
    </div>
  );
}