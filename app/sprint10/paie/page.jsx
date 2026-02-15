'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'');

function calcPaie(brut, cat, etatCivil, enfants, handicap) {
  const onssP = cat === 'ouvrier' ? brut * 1.08 * 0.1307 : brut * 0.1307;
  const imposable = brut - onssP;
  // Tranches PP 2026
  const tranches = [{min:0,max:10580,t:0.25},{min:10580,max:15820,t:0.40},{min:15820,max:27920,t:0.45},{min:27920,max:Infinity,t:0.50}];
  const annuel = imposable * 12;
  let ppAnnuel = 0;
  for (const tr of tranches) {
    if (annuel > tr.min) { ppAnnuel += (Math.min(annuel, tr.max) - tr.min) * tr.t; }
  }
  // Reductions
  let redAnnuelle = 555 * 12 / 12; // forfait frais mensuel
  const redEnfants = [0, 48, 128, 340, 572, 804, 1060][Math.min(enfants, 6)] || 0;
  redAnnuelle += redEnfants;
  if (etatCivil === 'marie') redAnnuelle += 0;
  if (handicap) redAnnuelle *= 2;
  // Bonus emploi
  let bonus = 0;
  if (imposable < 3261.08) bonus = 34.57;
  else if (imposable < 3461.08) bonus = 34.57 - (imposable - 3261.08) * 0.1732;
  let ppMensuel = Math.max(0, (ppAnnuel / 12) - redAnnuelle - bonus);
  // CSS
  let css = 0;
  if (brut > 1945.38 && brut <= 2190.18) css = 7.60 + 0.011 * (brut - 1945.38);
  else if (brut > 2190.18 && brut <= 6038.82) css = 60.94;
  else if (brut > 6038.82) css = 60.94 + 0.013 * (brut - 6038.82);
  const net = brut - onssP - ppMensuel - css;
  const onssPatronal = brut * 0.2492;
  const cout = brut + onssPatronal;
  return {
    brut, onssPersonnel: Math.round(onssP*100)/100, imposable: Math.round(imposable*100)/100,
    pp: Math.round(ppMensuel*100)/100, css: Math.round(css*100)/100,
    net: Math.round(net*100)/100, onssPatronal: Math.round(onssPatronal*100)/100,
    cout: Math.round(cout*100)/100
  };
}

export default function PaiePage() {
  const [fid,setFid]=useState(null);const [clients,setClients]=useState([]);const [trav,setTrav]=useState([]);
  const [selClient,setSelClient]=useState('');const [mois,setMois]=useState('2026-02');
  const [fiches,setFiches]=useState([]);const [loading,setLoading]=useState(true);const [generating,setGenerating]=useState(false);
  const [savedFiches,setSavedFiches]=useState([]);

  useEffect(()=>{load();},[]);

  async function load(){
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href='/sprint10/auth';return;}
    const {data:f}=await supabase.from('fiduciaires').select('*').eq('user_id',user.id).single();
    setFid(f);
    if(f){
      const {data:cl}=await supabase.from('sp_clients').select('*').eq('fiduciaire_id',f.id).order('nom');
      setClients(cl||[]);
      const ids=(cl||[]).map(c=>c.id);
      if(ids.length){
        const {data:tr}=await supabase.from('sp_travailleurs').select('*').in('client_id',ids).order('nom');
        setTrav(tr||[]);
        const {data:sf}=await supabase.from('sp_fiches_paie').select('*').in('client_id',ids);
        setSavedFiches(sf||[]);
      }
    }
    setLoading(false);
  }

  function genererFiches(){
    const workers = selClient ? trav.filter(t=>t.client_id===selClient) : trav;
    const results = workers.filter(t=>t.statut==='actif').map(t=>{
      const calc = calcPaie(Number(t.salaire_brut)||0, t.categorie||'employe', t.etat_civil||'celibataire', Number(t.enfants_charge)||0, t.handicap||false);
      return { ...calc, travailleur_id: t.id, client_id: t.client_id, nom: t.nom+' '+t.prenom, fonction: t.fonction, categorie: t.categorie, mois };
    });
    setFiches(results);
  }

  async function sauvegarder(){
    setGenerating(true);
    for(const f of fiches){
      const exists = savedFiches.find(s=>s.travailleur_id===f.travailleur_id && s.mois===f.mois);
      const data = {
        travailleur_id:f.travailleur_id, client_id:f.client_id, mois:f.mois,
        salaire_brut:f.brut, onss_personnel:f.onssPersonnel, precompte_pro:f.pp,
        css:f.css, salaire_net:f.net, onss_patronal:f.onssPatronal,
        cout_employeur:f.cout, net_a_payer:f.net, statut:'valide'
      };
      if(exists){ await supabase.from('sp_fiches_paie').update(data).eq('id',exists.id); }
      else{ await supabase.from('sp_fiches_paie').insert(data); }
    }
    await load();
    setGenerating(false);
    alert(fiches.length+' fiche(s) sauvegardees !');
  }

  function genererSEPA(){
    const xml = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">',
      '<CstmrCdtTrfInitn>',
      '<GrpHdr><MsgId>AUREUS-'+mois+'</MsgId><CreDtTm>'+new Date().toISOString()+'</CreDtTm><NbOfTxs>'+fiches.length+'</NbOfTxs></GrpHdr>',
      '<PmtInf><PmtInfId>PAY-'+mois+'</PmtInfId><PmtMtd>TRF</PmtMtd>',
      ...fiches.map(f=>'<CdtTrfTxInf><Amt><InstdAmt Ccy="EUR">'+f.net.toFixed(2)+'</InstdAmt></Amt><Cdtr><Nm>'+f.nom+'</Nm></Cdtr></CdtTrfTxInf>'),
      '</PmtInf></CstmrCdtTrfInitn></Document>'
    ].join('\n');
    const blob = new Blob([xml],{type:'application/xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='SEPA_'+mois+'.xml'; a.click();
  }

  const totalBrut=fiches.reduce((s,f)=>s+f.brut,0);
  const totalNet=fiches.reduce((s,f)=>s+f.net,0);
  const totalCout=fiches.reduce((s,f)=>s+f.cout,0);
  const totalONSS=fiches.reduce((s,f)=>s+f.onssPersonnel+f.onssPatronal,0);
  const totalPP=fiches.reduce((s,f)=>s+f.pp,0);

  if(loading)return <div style={{minHeight:'100vh',background:'#0a0e1a',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{color:'#c9a227'}}>Chargement...</div></div>;

  return (
    <div style={{minHeight:'100vh',background:'#0a0e1a',color:'#e2e8f0',fontFamily:"'Outfit',system-ui,sans-serif",padding:'24px 32px'}}>
      <div style={{marginBottom:20,fontSize:13}}>
        <Link href="/sprint10/dashboard" style={{color:'#64748b',textDecoration:'none'}}>Dashboard</Link>
        <span style={{color:'#475569',margin:'0 8px'}}>/</span>
        <span style={{color:'#c9a227'}}>Generation de paie</span>
      </div>

      <h1 style={{fontSize:22,fontWeight:700,margin:'0 0 4px',color:'#f1f5f9'}}>Moteur de Paie</h1>
      <p style={{color:'#64748b',fontSize:13,margin:'0 0 24px'}}>Generation automatique des fiches de paie selon les baremes belges 2026</p>

      {/* Controls */}
      <div style={{display:'flex',gap:16,marginBottom:24,alignItems:'flex-end'}}>
        <div>
          <label style={{display:'block',fontSize:11,color:'#94a3b8',marginBottom:4,textTransform:'uppercase'}}>Client</label>
          <select value={selClient} onChange={e=>setSelClient(e.target.value)} style={{padding:'8px 14px',background:'#131825',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13,minWidth:250}}>
            <option value="">Tous les clients</option>
            {clients.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>
        <div>
          <label style={{display:'block',fontSize:11,color:'#94a3b8',marginBottom:4,textTransform:'uppercase'}}>Mois</label>
          <input type="month" value={mois} onChange={e=>setMois(e.target.value)} style={{padding:'8px 14px',background:'#131825',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13}}/>
        </div>
        <button onClick={genererFiches} style={{background:'#c9a227',color:'#0a0e1a',border:'none',padding:'10px 24px',borderRadius:6,fontWeight:700,fontSize:13,cursor:'pointer'}}>
          Generer les fiches
        </button>
        {fiches.length>0&&(<>
          <button onClick={sauvegarder} disabled={generating} style={{background:'#22c55e',color:'#fff',border:'none',padding:'10px 20px',borderRadius:6,fontWeight:600,fontSize:13,cursor:'pointer',opacity:generating?0.6:1}}>
            {generating?'Sauvegarde...':'Sauvegarder en DB'}
          </button>
          <button onClick={genererSEPA} style={{background:'#3b82f6',color:'#fff',border:'none',padding:'10px 20px',borderRadius:6,fontWeight:600,fontSize:13,cursor:'pointer'}}>
            Fichier SEPA
          </button>
        </>)}
      </div>

      {/* KPIs */}
      {fiches.length>0&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:24}}>
          {[
            {l:'FICHES',v:fiches.length,c:'#f1f5f9'},
            {l:'MASSE BRUTE',v:totalBrut.toLocaleString(undefined,{maximumFractionDigits:0})+' EUR',c:'#f97316'},
            {l:'TOTAL NET',v:totalNet.toLocaleString(undefined,{maximumFractionDigits:0})+' EUR',c:'#22c55e'},
            {l:'TOTAL ONSS',v:totalONSS.toLocaleString(undefined,{maximumFractionDigits:0})+' EUR',c:'#3b82f6'},
            {l:'COUT TOTAL',v:totalCout.toLocaleString(undefined,{maximumFractionDigits:0})+' EUR',c:'#ef4444'},
          ].map((k,i)=>(
            <div key={i} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:'16px 18px'}}>
              <div style={{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>{k.l}</div>
              <div style={{fontSize:20,fontWeight:700,color:k.c,marginTop:4,fontFamily:'monospace'}}>{k.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Results table */}
      {fiches.length>0?(
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr>{['Travailleur','Cat.','Brut','ONSS 13.07%','Imposable','PP','CSS','Net','ONSS Patr.','Cout total'].map(h=>
              <th key={h} style={{background:'#131825',color:'#c9a227',padding:'10px 8px',textAlign:'left',fontWeight:600,fontSize:10,textTransform:'uppercase',borderBottom:'2px solid #1e293b',whiteSpace:'nowrap'}}>{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {fiches.map((f,i)=>(
              <tr key={i} style={{borderBottom:'1px solid #1e293b'}}>
                <td style={{padding:'8px',fontWeight:600,fontSize:12}}>{f.nom}<br/><span style={{color:'#64748b',fontSize:10}}>{f.fonction||''}</span></td>
                <td style={{padding:'8px'}}><span style={{background:f.categorie==='employe'?'rgba(59,130,246,0.15)':'rgba(168,85,247,0.15)',color:f.categorie==='employe'?'#3b82f6':'#a855f7',borderRadius:12,padding:'2px 6px',fontSize:10,fontWeight:600}}>{f.categorie}</span></td>
                <td style={{padding:'8px',fontFamily:'monospace',fontSize:12}}>{f.brut.toFixed(2)}</td>
                <td style={{padding:'8px',fontFamily:'monospace',fontSize:12,color:'#f97316'}}>{f.onssPersonnel.toFixed(2)}</td>
                <td style={{padding:'8px',fontFamily:'monospace',fontSize:12}}>{f.imposable.toFixed(2)}</td>
                <td style={{padding:'8px',fontFamily:'monospace',fontSize:12,color:'#ef4444'}}>{f.pp.toFixed(2)}</td>
                <td style={{padding:'8px',fontFamily:'monospace',fontSize:12}}>{f.css.toFixed(2)}</td>
                <td style={{padding:'8px',fontFamily:'monospace',fontSize:12,color:'#22c55e',fontWeight:700}}>{f.net.toFixed(2)}</td>
                <td style={{padding:'8px',fontFamily:'monospace',fontSize:12,color:'#f97316'}}>{f.onssPatronal.toFixed(2)}</td>
                <td style={{padding:'8px',fontFamily:'monospace',fontSize:12,color:'#ef4444',fontWeight:700}}>{f.cout.toFixed(2)}</td>
              </tr>
            ))}
            <tr style={{fontWeight:700,borderTop:'2px solid #c9a227'}}>
              <td colSpan={2} style={{padding:'10px 8px',color:'#c9a227'}}>TOTAL {mois}</td>
              <td style={{padding:'8px',fontFamily:'monospace'}}>{totalBrut.toFixed(2)}</td>
              <td style={{padding:'8px',fontFamily:'monospace',color:'#f97316'}}>{fiches.reduce((s,f)=>s+f.onssPersonnel,0).toFixed(2)}</td>
              <td style={{padding:'8px',fontFamily:'monospace'}}>{fiches.reduce((s,f)=>s+f.imposable,0).toFixed(2)}</td>
              <td style={{padding:'8px',fontFamily:'monospace',color:'#ef4444'}}>{totalPP.toFixed(2)}</td>
              <td style={{padding:'8px',fontFamily:'monospace'}}>{fiches.reduce((s,f)=>s+f.css,0).toFixed(2)}</td>
              <td style={{padding:'8px',fontFamily:'monospace',color:'#22c55e',fontWeight:700}}>{totalNet.toFixed(2)}</td>
              <td style={{padding:'8px',fontFamily:'monospace',color:'#f97316'}}>{fiches.reduce((s,f)=>s+f.onssPatronal,0).toFixed(2)}</td>
              <td style={{padding:'8px',fontFamily:'monospace',color:'#ef4444'}}>{totalCout.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      ):(
        <div style={{background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:40,textAlign:'center'}}>
          <div style={{color:'#64748b',fontSize:14,marginBottom:8}}>Selectionnez un client et un mois puis cliquez sur "Generer les fiches"</div>
          <div style={{color:'#475569',fontSize:12}}>Le moteur calcule automatiquement: ONSS, precompte professionnel, CSS, net, cout employeur</div>
        </div>
      )}

      {/* Historique */}
      {savedFiches.length>0&&(
        <div style={{marginTop:32}}>
          <h2 style={{fontSize:16,fontWeight:600,color:'#c9a227',marginBottom:12}}>Historique des fiches sauvegardees</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            {[...new Set(savedFiches.map(f=>f.mois))].sort().reverse().map(m=>{
              const mFiches=savedFiches.filter(f=>f.mois===m);
              const mTotal=mFiches.reduce((s,f)=>s+(f.salaire_brut||0),0);
              const mNet=mFiches.reduce((s,f)=>s+(f.net_a_payer||0),0);
              return (
                <div key={m} style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontWeight:700,color:'#f1f5f9'}}>{m}</span>
                    <span style={{background:'rgba(34,197,94,0.15)',color:'#22c55e',borderRadius:12,padding:'2px 8px',fontSize:10,fontWeight:600}}>{mFiches.length} fiches</span>
                  </div>
                  <div style={{marginTop:8,fontSize:12}}>
                    <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#64748b'}}>Masse brute</span><span style={{fontFamily:'monospace'}}>{mTotal.toLocaleString()} EUR</span></div>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:2}}><span style={{color:'#64748b'}}>Total net</span><span style={{fontFamily:'monospace',color:'#22c55e'}}>{mNet.toLocaleString()} EUR</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}