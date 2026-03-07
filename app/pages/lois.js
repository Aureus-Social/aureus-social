'use client';
import { C, CR_PAT, LB, LOIS_BELGES, NET_FACTOR, PH, PP_EST, PV_DOUBLE, PV_SIMPLE, RMMMG, ST, TX_ONSS_E, TX_ONSS_W, Tbl, f0, f2, fmt, quickPP, safeLS } from '@/app/lib/helpers';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const fmtP = n => `${((n||0)*100).toFixed(2)}%`;
const uid = () => `${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
const MN_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];




function escapeHtml(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function MoteurLoisBelges({s,d}){
  s=s||{emps:[],clients:[],co:{name:"",vat:""},payrollHistory:[],dimonaHistory:[]};
const ae= s?.emps||[];
const [tab,setTab]=useState(defaultTab||"dashboard");
const [editMode,setEditMode]=useState(false);
const [customLois,setCustomLois]=useState(()=>{try{return (()=>{try{return JSON.parse(safeLS.get('aureus_lois_custom'))}catch(e){return null}})()||{};}catch(e){return {};}});
const [updateHistory,setUpdateHistory]=useState(()=>{try{return (()=>{try{return JSON.parse(safeLS.get('aureus_lois_history'))}catch(e){return null}})()||[];}catch(e){return [];}});
const [checking,setChecking]=useState(false);
const [lastCheck,setLastCheck]=useState(()=>safeLS.get('aureus_lois_lastcheck')||null);
const [editValues,setEditValues]=useState({});
const [importState,setImportState]=useState({step:'idle',data:null,validation:null,uploading:false,history:[]});
const handleJsonImport=async(file)=>{
  setImportState(p=>({...p,step:'reading'}));
  try{
    const text=await file.text();
    const json=(()=>{try{return JSON.parse(text)}catch(e){return null}})();
    setImportState(p=>({...p,step:'validating',data:json}));
    const resp=await fetch('/api/lois-update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'validate',payload:json})});
    const result=await resp.json();
    setImportState(p=>({...p,step:'validated',validation:result}));
  }catch(e){setImportState({step:'error',data:null,validation:{valid:false,errors:[e.message]},uploading:false,history:[]});}
};
const handleUploadToSupabase=async()=>{
  if(!importState.data||!importState.validation?.valid)return;
  setImportState(p=>({...p,uploading:true}));
  try{
    const resp=await fetch('/api/lois-update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'upload',payload:importState.data,source:'json_upload'})});
    const result=await resp.json();
    if(result.status==='pending'){
      setImportState(p=>({...p,step:'uploaded',uploading:false,uploadId:result.id}));
    }else if(result.status==='table_missing'){
      setImportState(p=>({...p,step:'migration_needed',uploading:false,migration:result.migration}));
    }else{
      setImportState(p=>({...p,step:'error',uploading:false,validation:result}));
    }
  }catch(e){setImportState(p=>({...p,step:'error',uploading:false,validation:{errors:[e.message]}}));}
};
const handleApproveAndApply=async(id)=>{
  try{
    await fetch('/api/lois-update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'approve',id})});
    const resp=await fetch('/api/lois-update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'apply',id})});
    const result=await resp.json();
    if(result.validated){
      applyUpdate(result.validated);
      setImportState(p=>({...p,step:'applied',appliedCount:result.changes_count}));
    }
  }catch(e){setImportState(p=>({...p,step:'error',validation:{errors:[e.message]}}));}
};
const loadSupabaseHistory=async()=>{
  try{
    const resp=await fetch('/api/lois-update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'list'})});
    const result=await resp.json();
    setImportState(p=>({...p,history:result.updates||[]}));
  }catch(e){}
};
const handleRollback=async(id)=>{
  if(!confirm('Annuler cet update et revenir aux valeurs par defaut?'))return;
  try{
    await fetch('/api/lois-update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'rollback',id})});
    setCustomLois({});
    safeLS.remove('aureus_lois_custom');
    loadSupabaseHistory();
  }catch(e){}
};

const L=LOIS_BELGES;
const fmtNum=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
const pct=v=>(v*100).toFixed(2)+'%';

// Catégories de paramètres
const categories=[
{id:'onss',nom:'ONSS / Cotisations',icon:'🏛',color:'#ef4444',params:[
  {k:'onss.travailleur',l:'ONSS travailleur',v:pct(L.onss.travailleur),t:'pct'},
  {k:'onss.employeur.total',l:'ONSS employeur total',v:pct(L.onss.employeur.total),t:'pct'},
  {k:'onss.employeur.detail.pension',l:'  └ Pension',v:pct(L.onss.employeur.detail.pension),t:'pct'},
  {k:'onss.employeur.detail.maladie',l:'  └ Maladie-invalidite',v:pct(L.onss.employeur.detail.maladie),t:'pct'},
  {k:'onss.employeur.detail.chomage',l:'  └ Chomage',v:pct(L.onss.employeur.detail.chomage),t:'pct'},
  {k:'onss.employeur.detail.moderation',l:'  └ Moderation salariale',v:pct(L.onss.employeur.detail.moderation),t:'pct'},
  {k:'onss.ouvrier108',l:'Majoration ouvriers',v:'x '+L.onss.ouvrier108,t:'num'},
]},
{id:'pp',nom:'Precompte Professionnel',icon:'💰',color:'#a855f7',params:[
  {k:'pp.tranches.0',l:'Tranche 1: 0-'+fmt(L.pp.tranches[0].max),v:pct(L.pp.tranches[0].taux),t:'pct'},
  {k:'pp.tranches.1',l:'Tranche 2: '+fmt(L.pp.tranches[1].min)+'-'+fmt(L.pp.tranches[1].max),v:pct(L.pp.tranches[1].taux),t:'pct'},
  {k:'pp.tranches.2',l:'Tranche 3: '+fmt(L.pp.tranches[2].min)+'-'+fmt(L.pp.tranches[2].max),v:pct(L.pp.tranches[2].taux),t:'pct'},
  {k:'pp.tranches.3',l:'Tranche 4: '+fmt(L.pp.tranches[3].min)+'+',v:pct(L.pp.tranches[3].taux),t:'pct'},
  {k:'pp.fraisPro.salarie.pct',l:'Frais pro salarie',v:pct(L.pp.fraisPro.salarie.pct)+' max '+fmt(L.pp.fraisPro.salarie.max),t:'txt'},
  {k:'pp.fraisPro.dirigeant.pct',l:'Frais pro dirigeant',v:pct(L.pp.fraisPro.dirigeant.pct)+' max '+fmt(L.pp.fraisPro.dirigeant.max),t:'txt'},
  {k:'pp.quotiteExemptee.bareme1',l:'Quotite exemptee (bareme 1)',v:fmt(L.pp.quotiteExemptee.bareme1)+' EUR/an',t:'num'},
  {k:'pp.quotiteExemptee.bareme2',l:'Quotite exemptee (bareme 2)',v:fmt(L.pp.quotiteExemptee.bareme2)+' EUR/an',t:'num'},
  {k:'pp.quotientConjugal.max',l:'Quotient conjugal max',v:fmt(L.pp.quotientConjugal.max)+' EUR/an',t:'num'},
  {k:'pp.reductionsEnfants',l:'Reductions enfants (1-8)',v:L.pp.reductionsEnfants.slice(1).map(v=>fmt(v)).join(' | '),t:'arr'},
  {k:'pp.bonusEmploi.maxMensuel',l:'Bonus emploi max',v:fmt(L.pp.bonusEmploi.maxMensuel)+' EUR/mois',t:'num'},
]},
{id:'csss',nom:'CSSS',icon:'🔒',color:'#f97316',params:[
  {k:'csss.isole.0.max',l:'Seuil exoneration',v:fmt(L.csss.isole[0].max)+' EUR/an',t:'num'},
  {k:'csss.isole.4.montantFixe',l:'Plafond isole',v:fmt(L.csss.isole[4].montantFixe)+' EUR/trim',t:'num'},
]},
{id:'rem',nom:'Remuneration',icon:'💶',color:'#22c55e',params:[
  {k:'rémunération.RMMMG.montant18ans',l:'RMMMG (18 ans)',v:fmt(L.remuneration.RMMMG.montant18ans)+' EUR/mois',t:'num'},
  {k:'rémunération.indexSante.coeff',l:'Coefficient index sante',v:L.remuneration.indexSante.coeff,t:'num'},
  {k:'rémunération.peculeVacances.simple.pct',l:'Pecule vacances simple',v:pct(L.remuneration.peculeVacances.simple.pct),t:'pct'},
  {k:'rémunération.peculeVacances.double.pct',l:'Pecule vacances double',v:pct(L.remuneration.peculeVacances.double.pct),t:'pct'},
  {k:'chequesRepas.partTravailleur.min',l:'Cheques-repas part travailleur min',v:fmt(L.chequesRepas.partTravailleur.min)+' EUR',t:'num'},
  {k:'chequesRepas.valeurFaciale.max',l:'Cheques-repas valeur faciale max',v:fmt(L.chequesRepas.valeurFaciale.max)+' EUR',t:'num'},
  {k:'fraisPropres.forfaitBureau.max',l:'Forfait bureau/teletravail',v:fmt(L.fraisPropres.forfaitBureau.max)+' EUR/mois',t:'num'},
  {k:'fraisPropres.forfaitDeplacement.voiture',l:'Indemnite km voiture',v:fmt(L.fraisPropres.forfaitDeplacement.voiture)+' EUR/km',t:'num'},
]},
{id:'atn',nom:'ATN / Avantages',icon:'🚗',color:'#3b82f6',params:[
  {k:'atn.voiture.min',l:'ATN voiture minimum',v:fmt(L.atn.voiture.min)+' EUR/an',t:'num'},
  {k:'atn.gsm.forfait',l:'ATN GSM/tablette',v:fmt(L.atn.gsm.forfait)+' EUR/mois',t:'num'},
  {k:'atn.pc.forfait',l:'ATN PC/laptop',v:fmt(L.atn.pc.forfait)+' EUR/mois',t:'num'},
  {k:'atn.internet.forfait',l:'ATN Internet',v:fmt(L.atn.internet.forfait)+' EUR/mois',t:'num'},
  {k:'atn.electricite.cadre',l:'ATN electricite (cadre)',v:fmt(L.atn.electricite.cadre)+' EUR/an',t:'num'},
  {k:'atn.chauffage.cadre',l:'ATN chauffage (cadre)',v:fmt(L.atn.chauffage.cadre)+' EUR/an',t:'num'},
]},
{id:'travail',nom:'Temps de travail',icon:'⏰',color:'#eab308',params:[
  {k:'tempsTravail.dureeHebdoLegale',l:'Duree hebdo legale',v:L.tempsTravail.dureeHebdoLegale+'h',t:'num'},
  {k:'tempsTravail.heuresSupp.majoration50',l:'Heures supp (+50%)',v:pct(L.tempsTravail.heuresSupp.majoration50),t:'pct'},
  {k:'tempsTravail.heuresSupp.plafondAnnuel',l:'Plafond heures supp/an',v:L.tempsTravail.heuresSupp.plafondAnnuel+'h',t:'num'},
  {k:'tempsTravail.jourFerie.nombre',l:'Jours fériés legaux',v:L.tempsTravail.jourFerie.nombre,t:'num'},
]},
{id:'assur',nom:'Assurances & Seuils',icon:'🛡',color:'#06b6d4',params:[
  {k:'assurances.accidentTravail.taux',l:'Assurance accident travail',v:pct(L.assurances.accidentTravail.taux),t:'pct'},
  {k:'assurances.medecineTravail.cout',l:'Medecine du travail',v:fmt(L.assurances.medecineTravail.cout)+' EUR/trav',t:'num'},
  {k:'seuils.electionsSociales.cppt',l:'Seuil elections CPPT',v:L.seuils.electionsSociales.cppt+' travailleurs',t:'num'},
  {k:'seuils.electionsSociales.ce',l:'Seuil elections CE',v:L.seuils.electionsSociales.ce+' travailleurs',t:'num'},
  {k:'seuils.planFormation',l:'Seuil plan formation',v:L.seuils.planFormation+' travailleurs',t:'num'},
]},
];

const totalParams=categories.reduce((a,c)=>a+c.params.length,0);

// Vérification auto
const doCheck=async()=>{
  setChecking(true);
  const now=new Date().toISOString();
  try{
    const resp=await fetch('/api/veille-juridique?manual=true');
    const data=await resp.json();
    const entry={
      date:now,
      version:L._meta.version,
      status:data.status==='UP_TO_DATE'?'A_JOUR':data.status==='CHANGES_DETECTED'?'CHANGEMENTS':'ALERTES',
      results:data.sources||[],
      changes:data.changes||[],
      alerts:data.alerts||[],
      summary:data.summary||{},
      duration:data.duration,
      trigger:'manual',
    };
    const hist=[entry,...updateHistory].slice(0,30);
    setUpdateHistory(hist);
    setLastCheck(now);
    safeLS.set('aureus_lois_history',JSON.stringify(hist));
    safeLS.set('aureus_lois_lastcheck',now);
  }catch(e){
    const entry={date:now,version:L._meta.version,status:'ERREUR',error:e.message,trigger:'manual'};
    const hist=[entry,...updateHistory].slice(0,30);
    setUpdateHistory(hist);
    setLastCheck(now);
    safeLS.set('aureus_lois_history',JSON.stringify(hist));
    safeLS.set('aureus_lois_lastcheck',now);
  }
  setChecking(false);
};

// MAJ en 1 clic
const applyUpdate=(newValues)=>{
  const merged={...customLois,...newValues,_updated:new Date().toISOString()};
  setCustomLois(merged);
  safeLS.set('aureus_lois_custom',JSON.stringify(merged));
  // Log
  const histEntry={date:new Date().toISOString(),action:'UPDATE',changes:Object.keys(newValues).length,detail:newValues};
  const hist=[histEntry,...updateHistory].slice(0,50);
  setUpdateHistory(hist);
  safeLS.set('aureus_lois_history',JSON.stringify(hist));
};

const resetAll=()=>{
  if(confirm('Reinitialiser toutes les valeurs personnalisees? Les valeurs par defaut 2026 seront restaurees.')){
    setCustomLois({});
    safeLS.remove('aureus_lois_custom');
  }
};

return <div>
<PH title="Moteur Lois Belges" sub={"Base centralisee — "+totalParams+" parametres legaux — Version "+L._meta.version+" — MAJ "+L._meta.dateMAJ}/>

{/* KPIs */}
<div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:18}}>
{[
  {l:"Parametres legaux",v:totalParams,c:"#c6a34e"},
  {l:"Categories",v:categories.length,c:"#60a5fa"},
  {l:"Sources surveillees",v:L.sources.length,c:"#a855f7"},
  {l:"Version",v:L._meta.version,c:"#4ade80"},
  {l:"Statut",v:checking?"Verification...":lastCheck?"A jour":"Non verifie",c:lastCheck?"#4ade80":"#fb923c"},
].map((k,i)=><div key={i} style={{padding:"12px 14px",background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)"}}>
  <div style={{fontSize:9,color:"#5e5c56",textTransform:"uppercase",letterSpacing:".5px"}}>{k.l}</div>
  <div style={{fontSize:17,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div>
</div>)}
</div>

{/* Actions rapides */}
<div style={{display:"flex",gap:8,marginBottom:16}}>
  <button onClick={doCheck} disabled={checking} style={{padding:"10px 20px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,background:checking?"rgba(198,163,78,.1)":"linear-gradient(135deg,#c6a34e,#a8892e)",color:checking?"#9e9b93":"#000"}}>
    {checking?"⏳ Verification en cours...":"🔄 Verifier les mises a jour"}
  </button>
  <button onClick={resetAll} style={{padding:"10px 20px",borderRadius:8,border:"1px solid rgba(248,113,113,.3)",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,background:"transparent",color:"#f87171"}}>
    ↺ Reinitialiser
  </button>
  <button onClick={()=>setEditMode(!editMode)} style={{padding:"10px 20px",borderRadius:8,border:"1px solid rgba(198,163,78,.3)",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,background:editMode?"rgba(198,163,78,.15)":"transparent",color:"#c6a34e"}}>
    {editMode?"✓ Terminer":"✏ Mode edition"}
  </button>
</div>

{/* Tabs */}
<div style={{display:"flex",gap:6,marginBottom:16}}>
{[{v:"dashboard",l:"📊 Tableau de bord"},{v:"parametres",l:"⚙ Tous les parametres"},{v:"sources",l:"🌐 Sources"},{v:"historique",l:"📜 Historique"},{v:"impact",l:"📈 Impact sur paie"},{v:"export",l:"📤 Export"}].map(t=>
  <button key={t.v} onClick={()=>setTab(t.v)} style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:"inherit",background:tab===t.v?"rgba(198,163,78,.15)":"rgba(255,255,255,.03)",color:tab===t.v?"#c6a34e":"#9e9b93"}}>{t.l}</button>
)}
</div>

{/* DASHBOARD */}
{tab==="dashboard"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
{categories.map(cat=><C key={cat.id}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
    <ST><span style={{marginRight:6}}>{cat.icon}</span>{cat.nom}</ST>
    <span style={{fontSize:10,padding:"3px 8px",borderRadius:6,background:cat.color+"15",color:cat.color,fontWeight:600}}>{cat.params.length} params</span>
  </div>
  {cat.params.slice(0,5).map((p,j)=><div key={j} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.02)"}}>
    <span style={{fontSize:11,color:"#9e9b93"}}>{p.l}</span>
    <span style={{fontSize:11,fontWeight:600,color:cat.color}}>{typeof p.v==='string'?p.v.substring(0,30):p.v}</span>
  </div>)}
  {cat.params.length>5&&<div style={{fontSize:10,color:"#5e5c56",textAlign:"center",marginTop:6}}>+{cat.params.length-5} autres parametres</div>}
</C>)}
</div>}

{/* TOUS LES PARAMETRES */}
{tab==="parametres"&&<div>
{categories.map(cat=><C key={cat.id}>
  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
    <span style={{fontSize:18}}>{cat.icon}</span>
    <ST>{cat.nom}</ST>
    <div style={{flex:1}}/>
    <span style={{fontSize:10,padding:"3px 10px",borderRadius:6,background:cat.color+"15",color:cat.color,fontWeight:600}}>{cat.params.length}</span>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"4px 12px"}}>
  {cat.params.map((p,j)=><div key={j} style={{display:"contents"}}>
    <div style={{fontSize:11,color:"#9e9b93",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.02)"}}>{p.l}</div>
    <div style={{fontSize:11,fontWeight:600,color:"#e8e6e0",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.02)",textAlign:"right"}}>
      {editMode?<input value={editValues[p.k]||p.v} onChange={e=>setEditValues({...editValues,[p.k]:e.target.value})} style={{width:160,padding:"3px 6px",borderRadius:4,border:"1px solid rgba(198,163,78,.3)",background:"rgba(198,163,78,.05)",color:"#c6a34e",fontSize:11,fontFamily:"inherit",textAlign:"right"}}/>:
      <span style={{color:customLois[p.k]?"#c6a34e":"#e8e6e0"}}>{customLois[p.k]||p.v}{customLois[p.k]&&<span style={{fontSize:8,marginLeft:4,color:"#c6a34e"}}>✏</span>}</span>}
    </div>
  </div>)}
  </div>
</C>)}
{editMode&&<div style={{textAlign:"center",marginTop:16}}>
  <button onClick={()=>{applyUpdate(editValues);setEditMode(false);setEditValues({});}} style={{padding:"12px 30px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:14,background:"linear-gradient(135deg,#c6a34e,#a8892e)",color:"#000"}}>
    💾 Sauvegarder les modifications ({Object.keys(editValues).length} changes)
  </button>
</div>}
</div>}

{/* SOURCES */}
{tab==="sources"&&<C>
<ST>Sources officielles surveillees</ST>
<div style={{fontSize:11,color:"#9e9b93",marginBottom:12}}>Le systeme surveille {L.sources.length} sources officielles belges pour detecter les changements legislatifs</div>
{L.sources.map((src,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
  <div style={{width:8,height:8,borderRadius:"50%",background:"#4ade80",flexShrink:0}}/>
  <div style={{flex:1}}>
    <div style={{fontWeight:600,color:"#e8e6e0",fontSize:12}}>{src.nom}</div>
    <div style={{fontSize:10,color:"#5e5c56"}}>{src.url}</div>
  </div>
  <span style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:"rgba(96,165,250,.1)",color:"#60a5fa"}}>{src.type}</span>
</div>)}
<div style={{marginTop:16,padding:12,background:"rgba(74,222,128,.04)",borderRadius:8,border:"1px solid rgba(74,222,128,.1)"}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div style={{fontSize:11,color:"#4ade80",fontWeight:600}}>✅ Backend actif — Cron quotidien 06:30 CET</div>
    <div style={{fontSize:9,color:"#5e5c56"}}>{lastCheck?("Dernier scan: "+new Date(lastCheck).toLocaleString("fr-BE")):"Aucun scan effectue"}</div>
  </div>
  <div style={{fontSize:10,color:"#9e9b93",marginTop:4}}>Le service /api/veille-juridique scrape {L.sources.length} sources officielles, detecte les changements AR/CCT, et notifie l administrateur pour validation avant mise à jour.</div>
  {updateHistory.length>0&&updateHistory[0].changes?.length>0&&<div style={{marginTop:6,padding:"6px 8px",background:"rgba(248,113,113,.06)",borderRadius:6}}>
    <div style={{fontSize:10,color:"#f87171",fontWeight:600}}>⚠️ {updateHistory[0].changes.length} changement(s) detecte(s):</div>
    {updateHistory[0].changes.slice(0,3).map((c,i)=><div key={i} style={{fontSize:10,color:"#fb923c",marginTop:2}}>{c.label}: {c.current} → {c.detected}</div>)}
  </div>}
</div>
</C>}

{/* HISTORIQUE */}
{tab==="historique"&&<C>
<ST>Historique des verifications et mises a jour</ST>
{updateHistory.length===0?<div style={{textAlign:"center",padding:30,color:"#5e5c56"}}>Aucune verification effectuee. Cliquez sur "Verifier les mises a jour".</div>:
updateHistory.map((h,i)=><div key={i} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.03)"}}>
  <div style={{width:8,height:8,borderRadius:"50%",background:h.action==='UPDATE'?"#c6a34e":h.status==='A_JOUR'?"#4ade80":h.status==='CHANGEMENTS'?"#f87171":h.status==='ERREUR'?"#ef4444":"#fb923c",marginTop:5,flexShrink:0}}/>
  <div style={{flex:1}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:11,color:"#e8e6e0",fontWeight:600}}>{h.action==='UPDATE'?'✏ MAJ manuelle ('+h.changes+' param.)':h.status==='A_JOUR'?'✓ Verification OK — Aucun changement':h.status==='CHANGEMENTS'?'⚠ '+((h.changes||[]).length)+' changement(s) detecte(s)':h.status==='ERREUR'?'❌ Erreur: '+(h.error||'inconnue'):'⚠ A verifier'}</div>
      <span style={{fontSize:9,color:"#5e5c56"}}>{h.trigger==='manual'?'Manuel':'Auto'}{h.duration?' — '+h.duration:''}</span>
    </div>
    <div style={{fontSize:10,color:"#5e5c56"}}>{new Date(h.date).toLocaleString('fr-BE')}{h.version?' — v'+h.version:''}{h.summary?.sourcesReachable?' — '+h.summary.sourcesReachable+'/'+h.summary.sourcesChecked+' sources':''}</div>
    {h.changes?.length>0&&<div style={{marginTop:4}}>{h.changes.map((c,j)=><div key={j} style={{fontSize:10,color:"#f87171",padding:"2px 0"}}>↳ {c.label}: <b>{c.current}</b> → <b style={{color:"#fb923c"}}>{c.detected}</b> ({c.severity})</div>)}</div>}
    {h.alerts?.length>0&&<div style={{marginTop:2}}>{h.alerts.slice(0,2).map((a,j)=><div key={j} style={{fontSize:10,color:"#60a5fa",padding:"1px 0"}}>ℹ {a.text?.substring(0,100)}</div>)}</div>}
  </div>
</div>)}
</C>}

{/* IMPACT SUR PAIE */}
{tab==="impact"&&<C>
<ST>Impact des parametres sur la paie</ST>
<div style={{fontSize:11,color:"#9e9b93",marginBottom:16}}>Simulation pour un salaire brut de reference (3.500 EUR/mois, isole, 0 enfant)</div>
{(()=>{
  const brut=3500;
  const onssW=Math.round(brut*L.onss.travailleur*100)/100;
  const onssE=Math.round(brut*L.onss.employeur.total*100)/100;
  const pp=quickPP(brut);
  const csss=calcCSSS(brut,'isole');
  const net=Math.round((brut-onssW-pp-csss)*100)/100;
  const cout=Math.round((brut+onssE+brut*L.assurances.accidentTravail.taux+L.assurances.medecineTravail.cout)*100)/100;
  return <div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
    {[{l:"Brut",v:fmt(brut),c:"#c6a34e"},{l:"Net",v:fmt(net),c:"#4ade80"},{l:"Cout employeur",v:fmt(cout),c:"#f87171"}].map((k,i)=>
      <div key={i} style={{padding:14,background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.08)",textAlign:"center"}}>
        <div style={{fontSize:9,color:"#5e5c56",textTransform:"uppercase"}}>{k.l}</div>
        <div style={{fontSize:20,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div>
      </div>)}
    </div>
    <Tbl cols={[{k:"r",l:"Rubrique",b:1},{k:"v",l:"Montant",a:"right",r:r=><span style={{color:r.c,fontWeight:600}}>{r.montant}</span>},{k:"s",l:"Source legale",r:r=><span style={{fontSize:10,color:"#5e5c56"}}>{r.source}</span>}]}
    data={[
      {r:"Salaire brut",montant:fmt(brut)+" EUR",c:"#c6a34e",source:"Contrat de travail"},
      {r:"ONSS travailleur ("+pct(L.onss.travailleur)+")",montant:"- "+fmt(onssW)+" EUR",c:"#f87171",source:"Loi 27/06/1969"},
      {r:"Précompte professionnel",montant:"- "+fmt(pp)+" EUR",c:"#f87171",source:"AR Annexe III - Formule-cle SPF"},
      {r:"CSSS",montant:"- "+fmt(csss)+" EUR",c:"#f87171",source:"AR 29/03/2012"},
      {r:"NET A PAYER",montant:fmt(net)+" EUR",c:"#4ade80",source:""},
      {r:"ONSS employeur ("+pct(L.onss.employeur.total)+")",montant:fmt(onssE)+" EUR",c:"#fb923c",source:"Loi 27/06/1969"},
      {r:"Assurance accident travail",montant:fmt(brut*L.assurances.accidentTravail.taux)+" EUR",c:"#fb923c",source:"Loi 10/04/1971"},
      {r:"Medecine du travail",montant:fmt(L.assurances.medecineTravail.cout)+" EUR",c:"#fb923c",source:"Code bien-etre au travail"},
      {r:"COUT TOTAL EMPLOYEUR",montant:fmt(cout)+" EUR",c:"#f87171",source:""},
    ]}/>
    <div style={{marginTop:16,padding:12,background:"rgba(74,222,128,.04)",borderRadius:8}}>
      <div style={{fontSize:11,color:"#4ade80",fontWeight:600}}>Taux effectif PP: {(pp/brut*100).toFixed(2)}% | Ratio net/brut: {(net/brut*100).toFixed(1)}% | Ratio net/cout: {(net/cout*100).toFixed(1)}%</div>
    </div>
  </div>;
})()}
</C>}

{/* EXPORT */}
{tab==="export"&&<C>
<ST>Export base legale</ST>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:12}}>
  <button onClick={()=>{const blob=new Blob([JSON.stringify(LOIS_BELGES,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='lois_belges_'+L._meta.annee+'.json';a.click();}} style={{padding:16,borderRadius:10,border:"1px solid rgba(198,163,78,.2)",cursor:"pointer",fontFamily:"inherit",background:"rgba(198,163,78,.04)",color:"#c6a34e",textAlign:"center"}}>
    <div style={{fontSize:24}}>📋</div><div style={{fontWeight:600,fontSize:12,marginTop:6}}>JSON complet</div><div style={{fontSize:10,color:"#9e9b93"}}>Toute la base legale</div>
  </button>
  <button onClick={()=>{let csv='Categorie;Parametre;Valeur;Type\n';categories.forEach(cat=>cat.params.forEach(p=>{csv+=cat.nom+';'+p.l+';'+p.v+';'+p.t+'\n';}));const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='parametres_legaux_'+L._meta.annee+'.csv';a.click();}} style={{padding:16,borderRadius:10,border:"1px solid rgba(198,163,78,.2)",cursor:"pointer",fontFamily:"inherit",background:"rgba(198,163,78,.04)",color:"#c6a34e",textAlign:"center"}}>
    <div style={{fontSize:24}}>📊</div><div style={{fontWeight:600,fontSize:12,marginTop:6}}>CSV parametres</div><div style={{fontSize:10,color:"#9e9b93"}}>Pour Excel/Sheets</div>
  </button>
  <button onClick={()=>{const txt='LOIS BELGES '+L._meta.annee+'\nVersion: '+L._meta.version+'\n'+'='.repeat(50)+'\n\n'+categories.map(cat=>cat.icon+' '+cat.nom.toUpperCase()+'\n'+'-'.repeat(40)+'\n'+cat.params.map(p=>'  '+p.l+': '+p.v).join('\n')+'\n').join('\n');const escaped=(txt||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>\n');const html='<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Résumé lois '+L._meta.annee+'</title><style>body{font-family:system-ui,sans-serif;font-size:12px;padding:24px;max-width:800px;margin:0 auto;line-height:1.5;color:#1a1a1a}</style></head><body><div>'+escaped+'</div><p style="margin-top:20px;font-size:10px;color:#666">Document généré par Aureus Social Pro</p></body></html>';openForPDF(html,'Resume_lois_'+L._meta.annee);}} style={{padding:16,borderRadius:10,border:"1px solid rgba(198,163,78,.2)",cursor:"pointer",fontFamily:"inherit",background:"rgba(198,163,78,.04)",color:"#c6a34e",textAlign:"center"}}>
    <div style={{fontSize:24}}>📄</div><div style={{fontWeight:600,fontSize:12,marginTop:6}}>Résumé PDF</div><div style={{fontSize:10,color:"#9e9b93"}}>Imprimer / Enregistrer en PDF</div>
  </button>
</div>
<div style={{marginTop:16,padding:16,background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.12)"}}>
  <div style={{fontSize:12,color:"#c6a34e",fontWeight:700,marginBottom:10}}>📥 Import / MAJ en 1 clic</div>

  {/* STEP 1: Upload zone */}
  {(importState.step==='idle'||importState.step==='error'||importState.step==='applied')&&<div>
    <div
      onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor='#c6a34e';}}
      onDragLeave={e=>{e.currentTarget.style.borderColor='rgba(198,163,78,.2)';}}
      onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor='rgba(198,163,78,.2)';const f=e.dataTransfer.files[0];if(f&&f.name.endsWith('.json'))handleJsonImport(f);}}
      style={{border:"2px dashed rgba(198,163,78,.2)",borderRadius:8,padding:"20px",textAlign:"center",cursor:"pointer",transition:"border-color .2s"}}
      onClick={()=>{const inp=document.createElement('input');inp.type='file';inp.accept='.json';inp.onchange=e=>{const f=e.target.files[0];if(f)handleJsonImport(f);};inp.click();}}
    >
      <div style={{fontSize:28}}>📋</div>
      <div style={{fontSize:11,color:"#c6a34e",fontWeight:600,marginTop:6}}>Glissez un fichier JSON ici</div>
      <div style={{fontSize:10,color:"#5e5c56",marginTop:2}}>ou cliquez pour parcourir — Format: {"{\"onss.travailleur\": 0.1307, ...}"}</div>
    </div>
    {importState.step==='error'&&<div style={{marginTop:8,padding:8,background:"rgba(248,113,113,.06)",borderRadius:6}}>
      <div style={{fontSize:10,color:"#f87171"}}>{importState.validation?.errors?.join(', ')||'Erreur inconnue'}</div>
    </div>}
    {importState.step==='applied'&&<div style={{marginTop:8,padding:8,background:"rgba(74,222,128,.06)",borderRadius:6}}>
      <div style={{fontSize:10,color:"#4ade80",fontWeight:600}}>✅ {importState.appliedCount} parametre(s) applique(s) avec succes!</div>
    </div>}
  </div>}

  {/* STEP 2: Validation preview */}
  {(importState.step==='validating'||importState.step==='validated')&&importState.validation&&<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <div style={{fontSize:11,fontWeight:600,color:importState.validation.valid?"#4ade80":"#f87171"}}>
        {importState.validation.valid?"✅ Validation OK — "+importState.validation.count+" parametre(s)":"❌ Erreurs de validation"}
      </div>
      <button onClick={()=>setImportState({step:'idle',data:null,validation:null,uploading:false,history:[]})} style={{fontSize:10,padding:"4px 10px",borderRadius:4,border:"1px solid rgba(248,113,113,.3)",background:"transparent",color:"#f87171",cursor:"pointer",fontFamily:"inherit"}}>✕ Annuler</button>
    </div>
    {importState.validation.errors?.length>0&&<div style={{marginBottom:8}}>{importState.validation.errors.map((e,i)=><div key={i} style={{fontSize:10,color:"#f87171",padding:"2px 0"}}>❌ {e}</div>)}</div>}
    {importState.validation.warnings?.length>0&&<div style={{marginBottom:8}}>{importState.validation.warnings.map((w,i)=><div key={i} style={{fontSize:10,color:"#fb923c",padding:"2px 0"}}>⚠ {w}</div>)}</div>}
    {importState.validation.valid&&<div>
      <div style={{fontSize:10,color:"#9e9b93",marginBottom:6}}>Parametres valides:</div>
      <div style={{maxHeight:150,overflowY:"auto",marginBottom:8}}>{Object.entries(importState.validation.validated||{}).map(([k,v],i)=>
        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,.02)"}}>
          <span style={{fontSize:10,color:"#9e9b93"}}>{k}</span>
          <span style={{fontSize:10,fontWeight:600,color:"#c6a34e"}}>{v}</span>
        </div>
      )}</div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={handleUploadToSupabase} disabled={importState.uploading} style={{flex:1,padding:"10px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,background:importState.uploading?"rgba(198,163,78,.1)":"linear-gradient(135deg,#c6a34e,#a8892e)",color:importState.uploading?"#9e9b93":"#000"}}>
          {importState.uploading?"⏳ Envoi vers Supabase...":"📤 Stocker dans Supabase (en attente)"}
        </button>
        <button onClick={()=>{applyUpdate(importState.validation.validated);setImportState(p=>({...p,step:'applied',appliedCount:importState.validation.count}));}} style={{flex:1,padding:"10px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff"}}>
          ⚡ Appliquer directement
        </button>
      </div>
    </div>}
  </div>}

  {/* STEP 3: Uploaded to Supabase */}
  {importState.step==='uploaded'&&<div>
    <div style={{padding:12,background:"rgba(96,165,250,.06)",borderRadius:6,marginBottom:8}}>
      <div style={{fontSize:11,color:"#60a5fa",fontWeight:600}}>📦 Stocke dans Supabase — ID: {importState.uploadId?.substring(0,8)}...</div>
      <div style={{fontSize:10,color:"#9e9b93",marginTop:4}}>Statut: En attente d approbation admin</div>
    </div>
    <div style={{display:"flex",gap:8}}>
      <button onClick={()=>handleApproveAndApply(importState.uploadId)} style={{flex:1,padding:"10px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,background:"linear-gradient(135deg,#c6a34e,#a8892e)",color:"#000"}}>
        ✅ Approuver et appliquer
      </button>
      <button onClick={()=>setImportState({step:'idle',data:null,validation:null,uploading:false,history:[]})} style={{padding:"10px 16px",borderRadius:8,border:"1px solid rgba(248,113,113,.3)",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,background:"transparent",color:"#f87171"}}>
        ✕ Rejeter
      </button>
    </div>
  </div>}

  {/* Migration needed */}
  {importState.step==='migration_needed'&&<div style={{padding:12,background:"rgba(251,146,56,.06)",borderRadius:6}}>
    <div style={{fontSize:11,color:"#fb923c",fontWeight:600}}>⚠ Table Supabase manquante</div>
    <div style={{fontSize:10,color:"#9e9b93",marginTop:4}}>Executez ce SQL dans Supabase Dashboard → SQL Editor:</div>
    <pre style={{fontSize:9,color:"#60a5fa",background:"rgba(0,0,0,.3)",padding:8,borderRadius:4,marginTop:6,overflowX:"auto",maxHeight:120}}>{importState.migration}</pre>
    <button onClick={()=>setImportState({step:'idle',data:null,validation:null,uploading:false,history:[]})} style={{marginTop:8,padding:"6px 12px",borderRadius:4,border:"1px solid rgba(198,163,78,.3)",cursor:"pointer",fontFamily:"inherit",fontSize:10,background:"transparent",color:"#c6a34e"}}>
      OK, fait → Reessayer
    </button>
  </div>}

  {/* Supabase history */}
  <div style={{marginTop:12,borderTop:"1px solid rgba(255,255,255,.05)",paddingTop:10}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:10,color:"#5e5c56",fontWeight:600}}>Historique Supabase</div>
      <button onClick={loadSupabaseHistory} style={{fontSize:9,padding:"3px 8px",borderRadius:4,border:"1px solid rgba(198,163,78,.2)",background:"transparent",color:"#c6a34e",cursor:"pointer",fontFamily:"inherit"}}>🔄 Charger</button>
    </div>
    {importState.history?.length>0&&<div style={{marginTop:6,maxHeight:120,overflowY:"auto"}}>{importState.history.map((h,i)=>
      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.02)"}}>
        <div>
          <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,marginRight:4,background:h.status==='applied'?"rgba(74,222,128,.1)":h.status==='pending'?"rgba(96,165,250,.1)":h.status==='approved'?"rgba(198,163,78,.1)":"rgba(248,113,113,.1)",color:h.status==='applied'?"#4ade80":h.status==='pending'?"#60a5fa":h.status==='approved'?"#c6a34e":"#f87171"}}>{h.status}</span>
          <span style={{fontSize:10,color:"#9e9b93"}}>{h.changes_count} params — v{h.version} — {new Date(h.created_at).toLocaleDateString('fr-BE')}</span>
        </div>
        {h.status==='applied'&&<button onClick={()=>handleRollback(h.id)} style={{fontSize:9,padding:"2px 6px",borderRadius:3,border:"1px solid rgba(248,113,113,.2)",background:"transparent",color:"#f87171",cursor:"pointer",fontFamily:"inherit"}}>↩ Rollback</button>}
        {h.status==='approved'&&<button onClick={()=>handleApproveAndApply(h.id)} style={{fontSize:9,padding:"2px 6px",borderRadius:3,border:"1px solid rgba(74,222,128,.2)",background:"transparent",color:"#4ade80",cursor:"pointer",fontFamily:"inherit"}}>▶ Appliquer</button>}
        {h.status==='pending'&&<button onClick={()=>handleApproveAndApply(h.id)} style={{fontSize:9,padding:"2px 6px",borderRadius:3,border:"1px solid rgba(198,163,78,.2)",background:"transparent",color:"#c6a34e",cursor:"pointer",fontFamily:"inherit"}}>✅ Approuver</button>}
      </div>
    )}</div>}
  </div>
</div>
</C>}

</div>;
}


// ═══════════════════════════════════════════════════════════════
//  AUREUS SUITE — Nos logiciels
// ═══════════════════════════════════════════════════════════════






// ??? EXPOSE FUNCTIONS ON WINDOW FOR CROSS-MODULE ACCESS ???






export default function LoisWrapped({ s, d, tab }) {
  // Mapper nos tabs menu vers les onglets internes du moteur lois
  const TAB_MAP = {
    seuilssociaux:       'parametres',
    ccts:                'parametres',
    delegations:         'parametres',
    delegationsyndicale: 'parametres',
    egalitehf:           'parametres',
    electionsociales:    'parametres',
    formationsec:        'parametres',
    lanceursalerte:      'parametres',
    plandiversite:       'parametres',
    social:              'dashboard',
  };
  const TAB_LABELS = {
    seuilssociaux:       '📐 Seuils Sociaux 2026',
    ccts:                '📜 Conventions CCT',
    delegations:         '🏛 Délégations',
    delegationsyndicale: '🏛 Délégation Syndicale',
    egalitehf:           '⚖️ Égalité H/F',
    electionsociales:    '🗳 Élections Sociales',
    formationsec:        '🎓 Formation & Sécurité',
    lanceursalerte:      '🚨 Lanceurs d\'Alerte',
    plandiversite:       '🌍 Plan Diversité',
    social:              '◆ Social & Assurances',
  };
  const mappedTab = TAB_MAP[tab] || 'dashboard';
  const label = TAB_LABELS[tab];
  return (
    <div>
      {label && (
        <div style={{marginBottom:12,padding:'10px 16px',background:'rgba(198,163,78,.03)',
          borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}>
          <h2 style={{color:'#c6a34e',margin:0,fontSize:16}}>{label}</h2>
        </div>
      )}
      <MoteurLoisBelges s={s} d={d} defaultTab={mappedTab} />
    </div>
  );
}

