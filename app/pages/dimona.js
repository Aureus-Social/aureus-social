'use client';
import { B, C, CR_PAT, I, LB, LOIS_BELGES, NET_FACTOR, PH, PP_EST, PV_DOUBLE, PV_SIMPLE, RMMMG, ST, TX_ONSS_E, TX_ONSS_W, Tbl, f0, f2, genDimonaXML, submitToONSS } from '@/app/lib/helpers';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const fmtP = n => `${((n||0)*100).toFixed(2)}%`;
const uid = () => `${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
const MN_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];




function escapeHtml(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function DimonaPage({s,d}) {
  s=s||{emps:[],clients:[],co:{name:"",vat:""},payrollHistory:[],dimonaHistory:[]};
  const [f,setF]=useState({eid:(s?.emps||[])[0]?.id||'',action:"IN",wtype:"OTH",start:new Date().toISOString().split('T')[0],end:"",hours:'',reason:'',dimonaP:'',planHrs:''});
  const [tab,setTab]=useState('new');
  const [filter,setFilter]=useState('all');
  const emp=(s?.emps||[]).find(e=>e.id===f.eid);

  // Validation engine
  const validate=()=>{
    const errs=[];
    if(!emp) errs.push('Sélectionnez un travailleur');
    if(emp&&!emp.niss) errs.push('NISS manquant pour '+emp.first+' '+emp.last);
    if(!f.start) errs.push('Date de début obligatoire');
    if(f.action==='OUT'&&!f.end) errs.push('Date de fin obligatoire pour OUT');
    if(f.action==='UPDATE'&&!f.dimonaP) errs.push('Numéro Dimona période requis pour UPDATE');
    if(['STU',"FLX"].includes(f.wtype)&&!f.planHrs) errs.push('Heures planifiées obligatoires pour '+f.wtype);
    if(f.action==='IN'){
      const startD=new Date(f.start);const today=new Date();today.setHours(0,0,0,0);
      if(startD<today) errs.push('⚠ Dimona IN tardive (début passé) — amende possible');
    }
    if(f.action==='OUT'&&f.end&&f.start&&new Date(f.end)<new Date(f.start)) errs.push('Date fin avant date début');
    return errs;
  };
  const errs=validate();

  // Worker type descriptions
  const wtDescs={OTH:'Ordinaire',STU:'Étudiant (max 600h/an)',FLX:'Flexi-job',EXT:'Extra Horeca',DWD:'Travailleur occasionnel',IVT:'Stagiaire',BCW:'ALE/PWA',APP:'Apprenti',ART:'Artiste',SP1:'Travailleurs saisonniers',DIP:'Diplomate'};

  // Dimona type specific fields
  const needsEnd=f.action==='OUT'||f.wtype==='STU'||f.wtype==='FLX'||f.wtype==='EXT';
  const needsHours=['STU',"FLX","EXT","DWD"].includes(f.wtype);

  const [onssStatus,setOnssStatus]=useState(null);
  const [submitting,setSubmitting]=useState(false);

  // Check ONSS connection on mount
  useEffect(()=>{fetch('/api/onss/status').then(r=>r.json()).then(setOnssStatus).catch(()=>setOnssStatus({readiness:{oauthToken:false}}));},[]);

  const submitToONSS=async(declaration)=>{
    setSubmitting(true);
    try{
      const resp=await fetch('/api/onss/dimona',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(declaration)});
      const result=await resp.json();
      setSubmitting(false);
      return result;
    }catch(e){setSubmitting(false);return{success:false,error:e.message};}
  };

  const gen=()=>{
    if(errs.filter(e=>!e.startsWith('⚠')).length>0) return;
    const xml=genDimonaXML({action:f.action,wtype:f.wtype,start:f.start,end:f.end,hours:f.planHrs||f.hours,first:emp.first,last:emp.last,niss:emp.niss,birth:emp.birth,cp:emp.cp,onss:s.co.onss,vat:s.co.vat,dimonaP:f.dimonaP,reason:f.reason});
    const dimNr='DIM'+Date.now().toString(36).toUpperCase();

    // Build REST API payload
    const apiPayload={
      type:f.action,
      env:'simulation',
      employer:{noss:s.co.onss||'',enterpriseNumber:(s.co.vat||'').replace(/[^0-9]/g,'')},
      worker:{niss:emp.niss||'',firstName:emp.first||emp.fn||'',lastName:emp.last||emp.ln||'',birthDate:emp.birth||emp.birthDate||''},
      occupation:{startDate:f.start,jointCommissionNbr:emp.cp||'200',workerType:f.wtype,plannedHoursNbr:f.planHrs||undefined,plannedEndDate:f.end||undefined},
      endDate:f.end||undefined,
      periodId:f.dimonaP||undefined,
    };

    // Submit to ONSS REST API
    submitToONSS(apiPayload).then(result=>{
      const status=result.success?'accepted':'error';
      d({type:"ADD_DIM",d:{eid:emp.id,ename:`${emp.first||emp.fn||emp.prenom||''} ${emp.last||emp.ln||emp.nom||''}`.trim()||'Sans nom',action:f.action,wtype:f.wtype,wtypeDesc:wtDescs[f.wtype]||f.wtype,start:f.start,end:f.end,xml,at:new Date().toISOString(),status,dimNr:result.declarationId||dimNr,hours:f.planHrs||f.hours,reason:f.reason,onssResult:result}});
    });

    d({type:"ADD_DIM",d:{eid:emp.id,ename:`${emp.first||emp.fn||emp.prenom||''} ${emp.last||emp.ln||emp.nom||''}`.trim()||'Sans nom',action:f.action,wtype:f.wtype,wtypeDesc:wtDescs[f.wtype]||f.wtype,start:f.start,end:f.end,xml,at:new Date().toISOString(),status:'pending',dimNr,hours:f.planHrs||f.hours,reason:f.reason}});
    d({type:"MODAL",m:{w:850,c:<div>
      <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 6px',fontFamily:"'Cormorant Garamond',serif"}}>Dimona {f.action} — {emp.first} {emp.last}</h2>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:"rgba(74,222,128,.1)",color:'#4ade80',fontWeight:600}}>✓ XML généré</span>
        <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:"rgba(198,163,78,.1)",color:'#c6a34e',fontWeight:600}}>{f.wtype} — {wtDescs[f.wtype]||f.wtype}</span>
        <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:"rgba(96,165,250,.1)",color:'#60a5fa',fontWeight:600}}>Réf: {dimNr}</span>
      </div>
      {errs.filter(e=>e.startsWith('⚠')).map((e,i)=><div key={i} style={{fontSize:10.5,color:'#f59e0b',marginBottom:6}}>⚠ {e.replace('⚠ ',"")}</div>)}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        <div style={{padding:10,background:"rgba(198,163,78,.05)",borderRadius:6,fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Identifiants</div>
          <div>Travailleur: <b style={{color:'#e8e6e0'}}>{emp.first} {emp.last}</b></div>
          <div>NISS: <b style={{color:'#e8e6e0',fontFamily:'monospace'}}>{emp.niss}</b></div>
          <div>CP: <b style={{color:'#e8e6e0'}}>{emp.cp}</b></div>
        </div>
        <div style={{padding:10,background:"rgba(96,165,250,.05)",borderRadius:6,fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          <div style={{fontWeight:600,color:'#60a5fa',marginBottom:4}}>Déclaration</div>
          <div>Action: <b style={{color:'#e8e6e0'}}>{f.action}</b></div>
          <div>Type: <b style={{color:'#e8e6e0'}}>{f.wtype} ({wtDescs[f.wtype]})</b></div>
          <div>Début: <b style={{color:'#e8e6e0'}}>{f.start}</b></div>
          {f.end&&<div>Fin: <b style={{color:'#e8e6e0'}}>{f.end}</b></div>}
        </div>
      </div>
      <pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:320,overflowY:'auto'}}>{xml}</pre>
      <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}>
        <B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B>
        <B onClick={()=>{navigator.clipboard?.writeText(xml);alert('XML Dimona copié !')}}>Copier XML</B>
      </div>
    </div>}});
  };

  // Stats
  const statsIN=( s.dims||[]).filter(x=>x.action==='IN').length;
  const statsOUT=( s.dims||[]).filter(x=>x.action==='OUT').length;
  const statsUPD=( s.dims||[]).filter(x=>x.action==='UPDATE').length;
  const filtered=filter==='all'?s.dims:( s.dims||[]).filter(x=>x.action===filter);

  return <div>
    <PH title="Déclarations Dimona" sub="Déclaration immédiate de l'emploi — ONSS REST v2 — Connecté via Chaman"/>
    {/* ONSS Connection Status */}
    <div style={{marginBottom:14,padding:"12px 16px",background:onssStatus?.readiness?.chamanConfig?"linear-gradient(135deg,rgba(34,197,94,.06),rgba(34,197,94,.02))":"linear-gradient(135deg,rgba(251,146,56,.06),rgba(251,146,56,.02))",border:"1px solid "+(onssStatus?.readiness?.chamanConfig?"rgba(34,197,94,.15)":"rgba(251,146,56,.15)"),borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:onssStatus?.readiness?.chamanConfig?"#22c55e":"#fb923c"}}/>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:onssStatus?.readiness?.chamanConfig?"#22c55e":"#fb923c"}}>{onssStatus?.readiness?.chamanConfig?"Connecté à l'ONSS REST v2":"Configuration Chaman en attente"}</div>
          <div style={{fontSize:10,color:"#5e5c56"}}>{onssStatus?.enterprise?.identificationRef||"DGIII/MAHI011/1028.230.781"} — Aureus IA SPRL — {onssStatus?.configuration?.env||"simulation"}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>fetch('/api/onss/status?test=true').then(r=>r.json()).then(r=>{setOnssStatus(r);alert(r.readiness?.oauthToken?'✅ Token OAuth OK — Dimona prêt':'❌ Token échoué: '+(r.configuration?.oauthError||'Vérifiez les env vars'))})} style={{padding:"6px 14px",borderRadius:8,border:"none",background:"rgba(96,165,250,.15)",color:"#60a5fa",fontSize:10,cursor:"pointer",fontWeight:600}}>Tester connexion</button>
        <span style={{fontSize:9,padding:"4px 10px",borderRadius:6,background:"rgba(198,163,78,.08)",color:"#c6a34e",display:"flex",alignItems:"center"}}>{submitting?"⏳ Envoi en cours...":"REST v2 / OAuth2 JWT"}</span>
      </div>
    </div>
    <div style={{marginBottom:14,padding:"10px 14px",background:"linear-gradient(135deg,rgba(59,130,246,.06),rgba(59,130,246,.02))",border:"1px solid rgba(59,130,246,.1)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontSize:11,color:"#888"}}>⚡ Dimona automatique à chaque embauche/sortie</div><button onClick={()=>{if(confirm("Générer Dimona IN pour tous ?")){(s?.emps||[]).forEach(e=>generateDimonaXML(e,"IN",s.co));alert("✅ Dimona générées")}}} style={{padding:"6px 14px",borderRadius:8,border:"none",background:"#3b82f6",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:600}}>⚡ Générer tout</button></div><div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{s.emps.filter(e=>e.status==="active"||!e.status).map(e=><div key={e.id} style={{display:"flex",gap:4}}><button onClick={()=>generateDimonaXML(e,"IN",s.co)} style={{padding:"6px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:"rgba(74,222,128,.15)",color:"#4ade80"}}>IN {e.first||e.fn} {e.last||e.ln}</button><button onClick={()=>generateDimonaXML(e,"OUT",s.co)} style={{padding:"6px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:"rgba(248,113,113,.15)",color:"#f87171"}}>OUT {e.first||e.fn} {e.last||e.ln}</button></div>)}</div>
    <div style={{marginBottom:12}}><button onClick={()=>generateSEPAXML(s.emps,per,s.co)} style={{padding:"8px 16px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:"rgba(96,165,250,.15)",color:"#60a5fa"}}>Generer SEPA XML (virements)</button></div>{/* Stats bar */}
    <div style={{display:'flex',gap:12,marginBottom:18}}>
      {[{l:"Total",v:(s.dims||[]).length,c:'#c6a34e'},{l:"IN",v:statsIN,c:'#4ade80'},{l:"OUT",v:statsOUT,c:'#f87171'},{l:"UPDATE",v:statsUPD,c:'#60a5fa'}].map((st,i)=>
        <div key={i} style={{flex:1,padding:'12px 16px',background:"rgba(198,163,78,.04)",borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}>
          <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'.5px'}}>{st.l}</div>
          <div style={{fontSize:22,fontWeight:700,color:st.c,marginTop:2}}>{st.v}</div>
        </div>
      )}
    </div>
    {/* Tabs */}
    <div style={{display:'flex',gap:6,marginBottom:16}}>
      {[{v:"new",l:"Nouvelle déclaration"},{v:"history",l:"Historique"},{v:"rules",l:"Règles & Délais"}].map(t=>
        <button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',
          background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>
      )}
    </div>

    {tab==='new'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <C><ST>Déclaration Dimona</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          <I label="Travailleur" value={f.eid} onChange={v=>setF({...f,eid:v})} span={2} options={(s?.emps||[]).map(e=>({v:e.id,l:`${e.first||e.fn||'Emp'} ${e.last||''} ${e.niss?'':'⚠ NISS!'}`}))}/>
          <I label="Action" value={f.action} onChange={v=>setF({...f,action:v})} options={[{v:"IN",l:"IN — Entrée en service"},{v:"OUT",l:"OUT — Sortie de service"},{v:"UPDATE",l:"UPDATE — Modification"},{v:"CANCEL",l:"CANCEL — Annulation"}]}/>
          <I label="Type travailleur" value={f.wtype} onChange={v=>setF({...f,wtype:v})} options={Object.entries(wtDescs).map(([k,v])=>({v:k,l:`${k} — ${v}`}))}/>
          <I label="Date début" type="date" value={f.start} onChange={v=>setF({...f,start:v})}/>
          {needsEnd&&<I label="Date fin" type="date" value={f.end} onChange={v=>setF({...f,end:v})}/>}
          {needsHours&&<I label="Heures planifiées" type="number" value={f.planHrs} onChange={v=>setF({...f,planHrs:v})}/>}
          {f.action==='OUT'&&<I label="Motif sortie" value={f.reason} onChange={v=>setF({...f,reason:v})} options={[{v:"",l:"— Sélectionner —"},{v:"DEM",l:"Démission"},{v:"LIC",l:"Licenciement"},{v:"RUP",l:"Rupture amiable"},{v:"FIN",l:"Fin contrat déterminé"},{v:"RET",l:"Retraite"},{v:"DEC",l:"Décès"},{v:"FOR",l:"Force majeure"}]}/>}
          {f.action==='UPDATE'&&<I label="N° Dimona période" value={f.dimonaP} onChange={v=>setF({...f,dimonaP:v})}/>}
        </div>
        {/* Validation errors */}
        {errs.length>0&&<div style={{marginTop:12,padding:10,background:errs.some(e=>!e.startsWith('⚠'))?'rgba(239,68,68,.06)':'rgba(245,158,11,.06)',borderRadius:8,border:`1px solid ${errs.some(e=>!e.startsWith('⚠'))?'rgba(239,68,68,.15)':'rgba(245,158,11,.15)'}`}}>
          {errs.map((e,i)=><div key={i} style={{fontSize:10.5,color:e.startsWith('⚠')?'#f59e0b':'#ef4444',padding:'2px 0'}}>• {e}</div>)}
        </div>}
        <B onClick={gen} disabled={errs.filter(e=>!e.startsWith('⚠')).length>0} style={{width:'100%',marginTop:14,opacity:errs.filter(e=>!e.startsWith('⚠')).length>0?.5:1}}>Générer Dimona {f.action}</B>
      </C>
      <div>
        <C><ST>Info type: {f.wtype}</ST>
          <div style={{fontSize:12,color:'#9e9b93',lineHeight:1.7}}>
            {f.wtype==='OTH'&&<>Type ordinaire — contrat à durée déterminée ou indéterminée. Pas de champs spécifiques supplémentaires.</>}
            {f.wtype==='STU'&&<><b style={{color:'#c6a34e'}}>Étudiant:</b> Max 600h/an exonérées cotisations ONSS normales (cotis solidarité 5,42% + 2,71%). Heures planifiées obligatoires. Vérifier compteur Student@Work.</>}
            {f.wtype==='FLX'&&<><b style={{color:'#c6a34e'}}>Flexi-job:</b> Exclusivement pour secteurs autorisés (Horeca CP 302, Commerce CP 201/202, etc.). Travailleur doit avoir un emploi principal à min 4/5. Net = Brut (pas d'ONSS/PP). Cotis patronale 28%.</>}
            {f.wtype==='EXT'&&<><b style={{color:'#c6a34e'}}>Extra Horeca:</b> Maximum 50 jours/an. Forfait journalier ONSS. Uniquement CP 302.</>}
            {f.wtype==='DWD'&&<><b style={{color:'#c6a34e'}}>Occasionnel:</b> Travailleurs occasionnels agriculture/horticulture. Forfait journalier.</>}
            {f.wtype==='IVT'&&<><b style={{color:'#c6a34e'}}>Stagiaire:</b> Convention d'immersion professionnelle (CIP). Pas de cotisations ONSS normales si indemnité ≤ plafond.</>}
            {f.wtype==='APP'&&<><b style={{color:'#c6a34e'}}>Apprenti:</b> Contrat d'apprentissage (IFAPME/EFP/VDAB/Syntra). Cotisations réduites.</>}
            {f.wtype==='ART'&&<><b style={{color:'#c6a34e'}}>Artiste:</b> Visa artiste ou déclaration d'activité artistique. Régime spécifique.</>}
            {!['OTH',"STU","FLX","EXT","DWD","IVT","APP","ART"].includes(f.wtype)&&<>Type spécifique — consultez la documentation ONSS.</>}
          </div>
        </C>
        <C style={{marginTop:12}}><ST>Rappels légaux</ST>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.7}}>
            <div style={{padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <b style={{color:'#4ade80'}}>IN:</b> Au plus tard au <b>moment</b> de la mise au travail</div>
            <div style={{padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <b style={{color:'#f87171'}}>OUT:</b> Au plus tard le <b>dernier jour</b> de travail</div>
            <div style={{padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <b style={{color:'#60a5fa'}}>UPDATE:</b> Dès que la modification est connue</div>
            <div style={{padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <b style={{color:'#a78bfa'}}>CANCEL:</b> Si le travailleur ne se présente pas</div>
            <div style={{padding:'6px 0',marginTop:6,background:"rgba(239,68,68,.06)",borderRadius:6,paddingLeft:8}}>
              <b style={{color:'#ef4444'}}>Amendes:</b> 2.500€ à 12.500€ par travailleur non déclaré (Code pénal social Art. 181)
            </div>
          </div>
        </C>
      </div>
    </div>}

    {tab==='history'&&<C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Historique Dimona ({filtered.length})</div>
        <div style={{display:'flex',gap:6}}>
          {['all',"IN","OUT","UPDATE"].map(v=>
            <button key={v} onClick={()=>setFilter(v)} style={{padding:'4px 10px',borderRadius:6,border:'none',cursor:'pointer',fontSize:10,fontFamily:'inherit',fontWeight:filter===v?600:400,
              background:filter===v?'rgba(198,163,78,.15)':'rgba(255,255,255,.04)',color:filter===v?'#c6a34e':'#9e9b93'}}>{v==='all'?'Tous':v}</button>
          )}
        </div>
      </div>
      <Tbl cols={[
        {k:'a',l:"Action",r:r=><span style={{padding:'2px 7px',borderRadius:4,fontSize:10.5,fontWeight:600,background:r.action==='IN'?'rgba(74,222,128,.1)':r.action==='OUT'?'rgba(248,113,113,.1)':r.action==='UPDATE'?'rgba(96,165,250,.1)':'rgba(167,139,250,.1)',color:r.action==='IN'?'#4ade80':r.action==='OUT'?'#f87171':r.action==='UPDATE'?'#60a5fa':'#a78bfa'}}>{r.action}</span>},
        {k:'t',l:"Type",r:r=><span style={{fontSize:10,color:'#c6a34e'}}>{r.wtype} {r.wtypeDesc?`(${r.wtypeDesc})`:''}</span>},
        {k:'e',l:"Travailleur",r:r=>r.ename},
        {k:'s',l:"Début",r:r=>r.start},{k:'en',l:"Fin",r:r=>r.end||'—'},
        {k:'h',l:"Heures",r:r=>r.hours||'—'},
        {k:'r',l:"Réf",r:r=><span style={{fontFamily:'monospace',fontSize:9.5,color:'#60a5fa'}}>{r.dimNr||'—'}</span>},
        {k:'st',l:"Statut",r:r=><span style={{color:'#4ade80',fontSize:11}}>✓</span>},
        {k:'x',l:"",a:'right',r:r=><B v="ghost" style={{padding:'3px 8px',fontSize:10}} onClick={()=>d({type:"MODAL",m:{w:800,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>Dimona {r.action} — {r.ename}</h3><pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:380,overflowY:'auto'}}>{r.xml}</pre><div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B><B onClick={()=>{navigator.clipboard?.writeText(r.xml);alert('Copié !')}}>Copier</B></div></div>}})}>XML</B>},
      ]} data={filtered}/>
    </C>}

    {tab==='rules'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <C><ST>Délais légaux par type</ST>
        <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          {[{t:'OTH — Ordinaire',d:"IN: avant mise au travail. OUT: dernier jour.",c:'#e8e6e0'},
            {t:'STU — Étudiant',d:"IN: avant début. Vérifier Student@Work (600h/an). OUT: dernier jour.",c:'#60a5fa'},
            {t:'FLX — Flexi-job',d:"IN: avant chaque prestation. OUT: dernier jour prestation. Heures planifiées obligatoires.",c:'#4ade80'},
            {t:'EXT — Extra Horeca',d:"IN: avant mise au travail. Max 50j/an. Forfait ONSS journalier.",c:'#f59e0b'},
            {t:'DWD — Occasionnel',d:"Agriculture/horticulture. Dimona journalière.",c:'#a78bfa'},
            {t:'APP — Apprenti',d:"Comme ordinaire + numéro contrat apprentissage.",c:'#f87171'},
          ].map((r,i)=><div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <div style={{fontWeight:600,color:r.c}}>{r.t}</div><div style={{fontSize:10.5,marginTop:2}}>{r.d}</div>
          </div>)}
        </div>
      </C>
      <C><ST>Sanctions & Amendes</ST>
        <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          {[{l:"Absence de Dimona IN",a:'Niveau 4: 2.500€ — 12.500€/travailleur',s:'Art. 181 CPS'},{l:"Dimona IN tardive",a:'Niveau 2: 400€ — 4.000€',s:'Art. 182 CPS'},{l:"Absence de Dimona OUT",a:'Niveau 2: 400€ — 4.000€',s:'Art. 182 CPS'},{l:"Données inexactes",a:'Niveau 2: 400€ — 4.000€',s:'Art. 182 CPS'},{l:"Récidive dans les 12 mois",a:'Amende doublée',s:'Art. 111 CPS'}].map((r,i)=>
            <div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <div style={{fontWeight:600,color:'#e8e6e0'}}>{r.l}</div>
              <div style={{color:'#f87171',fontSize:10.5}}>{r.a}</div>
              <div style={{color:'#5e5c56',fontSize:10}}>{r.s}</div>
            </div>
          )}
        </div>
        <div style={{marginTop:14,padding:10,background:"rgba(96,165,250,.06)",borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          <b>Portail:</b> www.socialsecurity.be → Dimona Web<br/>
          <b>Batch:</b> Envoi XML via canal sécurisé (FTP/MQ)<br/>
          <b>Helpdesk:</b> Contact Center ONSS — 02/509 59 59
        </div>
      </C>
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  DMFA
// ═══════════════════════════════════════════════════════════════


export default DimonaPage;
