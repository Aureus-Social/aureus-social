'use client';
import{useState,useMemo,useEffect}from'react';

// ═══════════════════════════════════════════════════════════
// ONBOARDING HUB — Wizard complet + Reprise concurrent
// ═══════════════════════════════════════════════════════════
const TX_ONSS_E=0.2507;
const C=({children,title:t,sub})=><div style={{background:'rgba(198,163,78,.03)',borderRadius:12,padding:16,border:'1px solid rgba(198,163,78,.08)',marginBottom:14}}>{t&&<div style={{fontSize:13,fontWeight:600,color:'#c6a34e',marginBottom:sub?2:12}}>{t}</div>}{sub&&<div style={{fontSize:10,color:'#888',marginBottom:12}}>{sub}</div>}{children}</div>;
const inputStyle={width:'100%',padding:'10px 12px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,color:'#e5e5e5',fontSize:12,fontFamily:'inherit',boxSizing:'border-box'};
const labelStyle={fontSize:10,color:'#888',display:'block',marginBottom:4,fontWeight:500};
const fmt=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);
const Field=({l,children,req})=><div style={{marginBottom:10}}><label style={labelStyle}>{l}{req&&<span style={{color:'#ef4444'}}> *</span>}</label>{children}</div>;
const Input=({value,onChange,placeholder,type,req,disabled})=><input type={type||'text'} value={value||''} onChange={e=>onChange(type==='number'?+e.target.value:e.target.value)} placeholder={placeholder} disabled={disabled} required={req} style={{...inputStyle,opacity:disabled?.5:1}}/>;
const Select=({value,onChange,options})=><select value={value||''} onChange={e=>onChange(e.target.value)} style={inputStyle}>{options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}</select>;
const Badge=({text,color})=><span style={{padding:'2px 7px',borderRadius:5,fontSize:8,fontWeight:600,background:(color||'#888')+'15',color:color||'#888'}}>{text}</span>;

const CP_LIST=[{v:'200',l:'200 — Employes'},{v:'100',l:'100 — Ouvriers auxiliaire'},{v:'124',l:'124 — Construction'},{v:'302',l:'302 — Hotellerie'},{v:'330',l:'330 — Sante'},{v:'140',l:'140 — Transport'},{v:'111',l:'111 — Metal'},{v:'118',l:'118 — Alimentaire'},{v:'other',l:'Autre'}];

// ═══ VALIDATION ENGINE ═══
const validate=(step,data)=>{
  const errs=[];
  if(step===0){
    if(!data.company.name)errs.push('Nom entreprise requis');
    if(!data.company.vat)errs.push('N° TVA/BCE requis');
    if(!data.company.cp)errs.push('Commission paritaire requise');
  }
  if(step===1){
    if(!data.contact.name)errs.push('Nom contact requis');
    if(!data.contact.email)errs.push('Email requis');
    if(data.contact.email&&!data.contact.email.includes('@'))errs.push('Email invalide');
  }
  if(step===2){
    if(data.bank.iban&&data.bank.iban.replace(/\s/g,'').length<16)errs.push('IBAN trop court (min 16 car.)');
  }
  if(step===4){
    data.employees.forEach((e,i)=>{
      if(!e.first||!e.last)errs.push('Employe '+(i+1)+': nom/prenom requis');
      if(!e.startDate)errs.push((e.first||'Employe '+(i+1))+': date debut requise');
      if(!(+(e.monthlySalary||0)))errs.push((e.first||'Employe '+(i+1))+': salaire requis');
    });
  }
  return errs;
};

// ═══ DIMONA XML GENERATOR ═══
const generateDimonaPreview=(emp,company)=>{
  return `<?xml version="1.0" encoding="UTF-8"?>
<DmfAConsult xmlns="http://www.smals.be/xml/ns/systemSupply">
  <Dimona type="IN">
    <Employer><CompanyID>${company.vat||'BE0000000000'}</CompanyID><ONSS>${company.onss||''}</ONSS></Employer>
    <Worker><INSS>${emp.niss||''}</INSS><LastName>${emp.last||''}</LastName><FirstName>${emp.first||''}</FirstName></Worker>
    <Period><StartDate>${emp.startDate||''}</StartDate>${emp.endDate?'<EndDate>'+emp.endDate+'</EndDate>':''}</Period>
    <ContractType>${emp.contractType||'CDI'}</ContractType>
    <JointCommittee>${company.cp||'200'}</JointCommittee>
    <WorkerType>1</WorkerType>
  </Dimona>
</DmfAConsult>`;
};

export function OnboardingWizardV2({s,d}){
  const [mode,setMode]=useState('choose'); // choose | wizard | reprise
  const [step,setStep]=useState(0);
  const [errors,setErrors]=useState([]);
  const [showDimona,setShowDimona]=useState(null);
  const [data,setData]=useState({
    company:{name:'',vat:'',address:'',zip:'',city:'',cp:'200',nace:'',onss:'',phone:'',email:''},
    contact:{name:'',email:'',phone:'',function:'Gerant'},
    bank:{iban:'',bic:'',bank:''},
    social:{onss:'',sepp:'',medecineTravail:'',assuranceAT:'',caisseVacances:''},
    employees:[],
    options:{cheqRepas:false,cheqRepasVal:8,ecoCheques:false,ecoChequesVal:250,assuranceGroupe:false,teletravail:false,teletravailVal:148.73,planCafeteria:false},
  });
  const [newEmp,setNewEmp]=useState({first:'',last:'',niss:'',email:'',startDate:'',endDate:'',contractType:'CDI',monthlySalary:'',function:'',regime:100,iban:''});
  // Reprise concurrent
  const [repriseData,setRepriseData]=useState('');
  const [repriseSource,setRepriseSource]=useState('csv');
  const [importedEmps,setImportedEmps]=useState([]);

  const steps=[
    {title:'Entreprise',icon:'🏢',desc:'Identite BCE / TVA'},
    {title:'Contact',icon:'👤',desc:'Personne de reference'},
    {title:'Bancaire',icon:'🏦',desc:'Coordonnees bancaires'},
    {title:'Social',icon:'🏛',desc:'Affiliations & securite'},
    {title:'Employes',icon:'👥',desc:'Personnel a encoder'},
    {title:'Avantages',icon:'🎁',desc:'Extra-legaux'},
    {title:'Validation',icon:'✅',desc:'Resume & creation'},
  ];

  const ud=(section,key,val)=>setData(p=>({...p,[section]:{...p[section],[key]:val}}));
  const addEmp=()=>{
    if(!newEmp.first||!newEmp.last)return;
    setData(p=>({...p,employees:[...p.employees,{...newEmp,id:Date.now()}]}));
    setNewEmp({first:'',last:'',niss:'',email:'',startDate:'',endDate:'',contractType:'CDI',monthlySalary:'',function:'',regime:100,iban:''});
  };
  const delEmp=id=>setData(p=>({...p,employees:p.employees.filter(e=>e.id!==id)}));

  const nextStep=()=>{
    const errs=validate(step,data);
    if(errs.length>0){setErrors(errs);return;}
    setErrors([]);setStep(s2=>Math.min(s2+1,7));
  };

  const finalize=()=>{
    const newClient={
      id:'CL-'+Date.now(),
      company:{...data.company,...data.bank,email:data.contact.email},
      emps:data.employees.map(e=>({...e,first:e.first,last:e.last,fn:e.first,ln:e.last,niss:e.niss,startDate:e.startDate,endDate:e.endDate,contractType:e.contractType,monthlySalary:+e.monthlySalary,gross:+e.monthlySalary,function:e.function,regime:e.regime,iban:e.iban,email:e.email})),
      createdAt:new Date().toISOString(),
      onboarded:true,
      checklist:{bce:!!data.company.vat,cp:!!data.company.cp,contact:!!data.contact.email,iban:!!data.bank.iban,onss:!!data.social.onss,sepp:!!data.social.sepp},
    };
    if(d)d({type:'ADD_CLIENT',client:newClient});
    setStep(7);
  };

  // CSV PARSER for reprise
  const parseCSV=(txt)=>{
    const lines=txt.trim().split('\n');
    if(lines.length<2)return[];
    const headers=lines[0].split(/[;,\t]/).map(h=>h.trim().toLowerCase().replace(/['"]/g,''));
    const fieldMap={prenom:'first',nom:'last',niss:'niss',email:'email',debut:'startDate',start:'startDate','date debut':'startDate',contrat:'contractType',type:'contractType',brut:'monthlySalary',salaire:'monthlySalary',gross:'monthlySalary',fonction:'function',regime:'regime',iban:'iban',fin:'endDate',end:'endDate'};
    return lines.slice(1).filter(l=>l.trim()).map(line=>{
      const vals=line.split(/[;,\t]/).map(v=>v.trim().replace(/^["']|["']$/g,''));
      const emp={id:Date.now()+Math.random(),contractType:'CDI',regime:100};
      headers.forEach((h,i)=>{
        const mapped=fieldMap[h]||fieldMap[Object.keys(fieldMap).find(k=>h.includes(k))]||null;
        if(mapped&&vals[i])emp[mapped]=mapped==='monthlySalary'||mapped==='regime'?+vals[i].replace(',','.'):vals[i];
      });
      return emp;
    }).filter(e=>e.first||e.last);
  };

  const doImport=()=>{
    const parsed=parseCSV(repriseData);
    if(parsed.length>0){
      setImportedEmps(parsed);
      setData(p=>({...p,employees:[...p.employees,...parsed]}));
    }
  };

  // ═══ CHOOSE MODE ═══
  if(mode==='choose')return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>🚀 Onboarding Client</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 24px'}}>Choisissez le mode d'integration</p>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      <div onClick={()=>setMode('wizard')} style={{padding:30,background:'linear-gradient(135deg,#0d1117,#131820)',border:'2px solid rgba(198,163,78,.15)',borderRadius:16,cursor:'pointer',textAlign:'center',transition:'all .2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(198,163,78,.4)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(198,163,78,.15)'}>
        <div style={{fontSize:40,marginBottom:10}}>🆕</div>
        <div style={{fontSize:16,fontWeight:700,color:'#c6a34e',marginBottom:6}}>Nouveau Client</div>
        <div style={{fontSize:11,color:'#888'}}>Wizard 7 etapes — Creation complete du dossier<br/>Entreprise → Contact → Banque → Social → Employes → Avantages → Validation</div>
        <div style={{marginTop:12}}><Badge text="DIMONA AUTO" color="#4ade80"/></div>
      </div>
      <div onClick={()=>setMode('reprise')} style={{padding:30,background:'linear-gradient(135deg,#0d1117,#131820)',border:'2px solid rgba(59,130,246,.15)',borderRadius:16,cursor:'pointer',textAlign:'center',transition:'all .2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(59,130,246,.4)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(59,130,246,.15)'}>
        <div style={{fontSize:40,marginBottom:10}}>📥</div>
        <div style={{fontSize:16,fontWeight:700,color:'#3b82f6',marginBottom:6}}>Reprise Concurrent</div>
        <div style={{fontSize:11,color:'#888'}}>Import CSV/Excel depuis un autre secretariat social<br/>autres secrétariats sociaux...</div>
        <div style={{marginTop:12}}><Badge text="IMPORT DONNEES" color="#3b82f6"/></div>
      </div>
    </div>
  </div>;

  // ═══ REPRISE CONCURRENT ═══
  if(mode==='reprise')return <div style={{padding:24}}>
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
      <button onClick={()=>setMode('choose')} style={{background:'none',border:'none',color:'#888',fontSize:18,cursor:'pointer'}}>←</button>
      <div><h2 style={{fontSize:22,fontWeight:700,color:'#3b82f6',margin:0}}>📥 Reprise Concurrent</h2><p style={{fontSize:12,color:'#888',margin:'4px 0 0'}}>Importez les donnees employes depuis un fichier CSV</p></div>
    </div>

    <C title="1. Source des donnees">
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        {['csv','sdworx','partena','securex','ucm','liantis','gappaie'].map(src=>
          <button key={src} onClick={()=>setRepriseSource(src)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:repriseSource===src?'rgba(59,130,246,.15)':'rgba(255,255,255,.03)',color:repriseSource===src?'#3b82f6':'#888',fontSize:10,cursor:'pointer',fontFamily:'inherit',fontWeight:repriseSource===src?600:400}}>{src==='csv'?'CSV libre':src.charAt(0).toUpperCase()+src.slice(1)}</button>
        )}
      </div>
      <div style={{padding:10,background:'rgba(59,130,246,.04)',borderRadius:8,fontSize:10,color:'#60a5fa',marginBottom:12}}>
        💡 Format attendu: Prenom;Nom;NISS;Email;Date debut;Contrat;Brut;Fonction;Regime;IBAN<br/>
        Separateur: ; ou , ou TAB. Premiere ligne = en-tetes.
      </div>
    </C>

    <C title="2. Collez les donnees CSV">
      <textarea value={repriseData} onChange={e=>setRepriseData(e.target.value)} placeholder={"Prenom;Nom;NISS;Email;Date debut;Contrat;Brut;Fonction\nJean;Dupont;85.07.15-123.45;jean@ex.com;2020-01-15;CDI;3200;Comptable\nMarie;Martin;90.12.25-987.65;marie@ex.com;2022-06-01;CDD;2800;Assistante"} style={{...inputStyle,height:180,resize:'vertical',fontFamily:'monospace',fontSize:11}}/>
      <div style={{display:'flex',gap:8,marginTop:10}}>
        <button onClick={doImport} style={{padding:'10px 20px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#3b82f6,#2563eb)',color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer'}}>📥 Analyser & Importer</button>
        <button onClick={()=>{setRepriseData('');setImportedEmps([]);}} style={{padding:'10px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:'#888',fontSize:12,cursor:'pointer'}}>Effacer</button>
      </div>
    </C>

    {importedEmps.length>0&&<C title={"3. "+importedEmps.length+" employes detectes"}>
      <div style={{border:'1px solid rgba(59,130,246,.1)',borderRadius:10,overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 120px 80px 80px 80px',padding:'8px 14px',background:'rgba(59,130,246,.06)',fontSize:9,fontWeight:600,color:'#3b82f6'}}>
          <div>Prenom</div><div>Nom</div><div>NISS</div><div>Contrat</div><div>Brut</div><div>Statut</div>
        </div>
        {importedEmps.map((e,i)=>{
          const ok=e.first&&e.last&&e.niss&&e.monthlySalary;
          return <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 120px 80px 80px 80px',padding:'6px 14px',borderBottom:'1px solid rgba(255,255,255,.02)',fontSize:11}}>
            <span style={{color:e.first?'#e8e6e0':'#ef4444'}}>{e.first||'⚠️ Manquant'}</span>
            <span style={{color:e.last?'#e8e6e0':'#ef4444'}}>{e.last||'⚠️'}</span>
            <span style={{color:e.niss?'#e8e6e0':'#eab308',fontFamily:'monospace',fontSize:10}}>{e.niss||'—'}</span>
            <span>{e.contractType||'CDI'}</span>
            <span style={{color:'#c6a34e'}}>{e.monthlySalary?fmt(e.monthlySalary):'⚠️'}</span>
            <Badge text={ok?'OK':'Incomplet'} color={ok?'#4ade80':'#eab308'}/>
          </div>;
        })}
      </div>
      <button onClick={()=>{setMode('wizard');setStep(0);}} style={{marginTop:12,padding:'10px 20px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#c6a34e,#a07d3e)',color:'#060810',fontWeight:700,fontSize:12,cursor:'pointer'}}>→ Continuer vers le Wizard (entreprise + validation)</button>
    </C>}
  </div>;

  // ═══ WIZARD COMPLETE ═══
  if(step===7)return <div style={{padding:24,textAlign:'center'}}>
    <div style={{fontSize:60,marginBottom:12}}>🎉</div>
    <h2 style={{fontSize:22,fontWeight:700,color:'#4ade80'}}>Dossier cree avec succes !</h2>
    <p style={{fontSize:13,color:'#888',margin:'8px 0 24px'}}>{data.company.name} — {data.employees.length} employe(s) — CP {data.company.cp}</p>
    <div style={{display:'flex',gap:10,justifyContent:'center'}}>
      <button onClick={()=>{setMode('choose');setStep(0);setData({company:{name:'',vat:'',address:'',zip:'',city:'',cp:'200',nace:'',onss:'',phone:'',email:''},contact:{name:'',email:'',phone:'',function:'Gerant'},bank:{iban:'',bic:'',bank:''},social:{onss:'',sepp:'',medecineTravail:'',assuranceAT:'',caisseVacances:''},employees:[],options:{cheqRepas:false,cheqRepasVal:8,ecoCheques:false,ecoChequesVal:250,assuranceGroupe:false,teletravail:false,teletravailVal:148.73,planCafeteria:false}});}} style={{padding:'10px 20px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#c6a34e,#a07d3e)',color:'#060810',fontWeight:700,cursor:'pointer'}}>+ Nouveau dossier</button>
      <button onClick={()=>d&&d({type:'NAV',page:'dashclient'})} style={{padding:'10px 20px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',background:'transparent',color:'#c6a34e',fontWeight:600,cursor:'pointer'}}>Voir Dashboard</button>
    </div>
  </div>;

  return <div style={{padding:24}}>
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
      <button onClick={()=>setMode('choose')} style={{background:'none',border:'none',color:'#888',fontSize:18,cursor:'pointer'}}>←</button>
      <div><h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:0}}>🚀 Onboarding — {data.company.name||'Nouveau Client'}</h2></div>
    </div>

    {/* PROGRESS BAR */}
    <div style={{display:'flex',gap:4,marginBottom:24}}>
      {steps.map((st,i)=><div key={i} onClick={()=>{if(i<=step)setStep(i);}} style={{flex:1,padding:'10px 6px',borderRadius:10,background:i===step?'rgba(198,163,78,.1)':i<step?'rgba(34,197,94,.05)':'rgba(255,255,255,.02)',border:'1px solid '+(i===step?'rgba(198,163,78,.2)':i<step?'rgba(34,197,94,.1)':'rgba(255,255,255,.04)'),cursor:i<=step?'pointer':'default',textAlign:'center'}}>
        <div style={{fontSize:16}}>{i<step?'✅':st.icon}</div>
        <div style={{fontSize:9,fontWeight:600,color:i===step?'#c6a34e':i<step?'#22c55e':'#555',marginTop:2}}>{st.title}</div>
      </div>)}
    </div>

    {/* ERRORS */}
    {errors.length>0&&<div style={{padding:12,background:'rgba(239,68,68,.06)',border:'1px solid rgba(239,68,68,.2)',borderRadius:10,marginBottom:16}}>
      {errors.map((e,i)=><div key={i} style={{fontSize:11,color:'#ef4444',marginBottom:2}}>⚠️ {e}</div>)}
    </div>}

    {/* STEP 0: ENTREPRISE */}
    {step===0&&<C title="🏢 Identite de l'entreprise">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Field l="Nom de l'entreprise" req><Input value={data.company.name} onChange={v=>ud('company','name',v)} placeholder="SA / SPRL / ASBL..." req/></Field>
        <Field l="N° TVA / BCE" req><Input value={data.company.vat} onChange={v=>ud('company','vat',v)} placeholder="BE 0123.456.789" req/></Field>
        <Field l="Adresse"><Input value={data.company.address} onChange={v=>ud('company','address',v)} placeholder="Rue, numero"/></Field>
        <div style={{display:'flex',gap:8}}><div style={{flex:1}}><Field l="Code postal"><Input value={data.company.zip} onChange={v=>ud('company','zip',v)} placeholder="1000"/></Field></div><div style={{flex:2}}><Field l="Ville"><Input value={data.company.city} onChange={v=>ud('company','city',v)} placeholder="Bruxelles"/></Field></div></div>
        <Field l="Commission Paritaire" req><Select value={data.company.cp} onChange={v=>ud('company','cp',v)} options={CP_LIST}/></Field>
        <Field l="Code NACE"><Input value={data.company.nace} onChange={v=>ud('company','nace',v)} placeholder="62010"/></Field>
        <Field l="Telephone"><Input value={data.company.phone} onChange={v=>ud('company','phone',v)} placeholder="+32 2 ..."/></Field>
        <Field l="Email entreprise"><Input value={data.company.email} onChange={v=>ud('company','email',v)} placeholder="info@..." type="email"/></Field>
      </div>
    </C>}

    {/* STEP 1: CONTACT */}
    {step===1&&<C title="👤 Personne de contact">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Field l="Nom complet" req><Input value={data.contact.name} onChange={v=>ud('contact','name',v)} req/></Field>
        <Field l="Fonction"><Select value={data.contact.function} onChange={v=>ud('contact','function',v)} options={['Gerant','Directeur','Comptable','RH','Administrateur','Autre']}/></Field>
        <Field l="Email" req><Input value={data.contact.email} onChange={v=>ud('contact','email',v)} type="email" req/></Field>
        <Field l="Telephone"><Input value={data.contact.phone} onChange={v=>ud('contact','phone',v)} placeholder="+32 ..."/></Field>
      </div>
    </C>}

    {/* STEP 2: BANCAIRE */}
    {step===2&&<C title="🏦 Coordonnees bancaires">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Field l="IBAN entreprise"><Input value={data.bank.iban} onChange={v=>ud('bank','iban',v)} placeholder="BE68 0000 0000 0000"/></Field>
        <Field l="BIC"><Input value={data.bank.bic} onChange={v=>ud('bank','bic',v)} placeholder="GEBABEBB"/></Field>
        <Field l="Banque"><Select value={data.bank.bank} onChange={v=>ud('bank','bank',v)} options={['','BNP Paribas Fortis','ING','KBC/CBC','Belfius','Argenta','Crelan','AXA Banque','Autre']}/></Field>
      </div>
    </C>}

    {/* STEP 3: SOCIAL */}
    {step===3&&<C title="🏛 Affiliations sociales">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <Field l="N° ONSS employeur"><Input value={data.social.onss} onChange={v=>ud('social','onss',v)} placeholder="XXX-XXXXXXX-XX"/></Field>
        <Field l="SEPP (Service Prevention)"><Select value={data.social.sepp} onChange={v=>ud('social','sepp',v)} options={['','SEPP agréé','Mensura','Cohezio','Idewe','Autre']}/></Field>
        <Field l="Medecine du travail"><Input value={data.social.medecineTravail} onChange={v=>ud('social','medecineTravail',v)} placeholder="Nom du service externe"/></Field>
        <Field l="Assurance accidents travail"><Input value={data.social.assuranceAT} onChange={v=>ud('social','assuranceAT',v)} placeholder="Compagnie + n° police"/></Field>
        <Field l="Caisse vacances (ouvriers)"><Input value={data.social.caisseVacances} onChange={v=>ud('social','caisseVacances',v)} placeholder="Si ouvriers uniquement"/></Field>
      </div>
    </C>}

    {/* STEP 4: EMPLOYES */}
    {step===4&&<div>
      <C title={"👥 Employes ("+data.employees.length+")"}>
        {data.employees.length>0&&<div style={{border:'1px solid rgba(198,163,78,.1)',borderRadius:10,overflow:'hidden',marginBottom:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 110px 60px 80px 60px 30px',padding:'6px 12px',background:'rgba(198,163,78,.06)',fontSize:9,fontWeight:600,color:'#c6a34e'}}>
            <div>Prenom</div><div>Nom</div><div>NISS</div><div>Contrat</div><div>Brut</div><div>DIMONA</div><div/>
          </div>
          {data.employees.map((e,i)=><div key={e.id||i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 110px 60px 80px 60px 30px',padding:'5px 12px',borderBottom:'1px solid rgba(255,255,255,.02)',fontSize:11,alignItems:'center'}}>
            <span style={{color:'#e8e6e0'}}>{e.first}</span>
            <span style={{color:'#e8e6e0'}}>{e.last}</span>
            <span style={{fontFamily:'monospace',fontSize:10,color:e.niss?'#e8e6e0':'#eab308'}}>{e.niss||'—'}</span>
            <Badge text={e.contractType||'CDI'} color={e.contractType==='CDD'?'#eab308':'#4ade80'}/>
            <span style={{color:'#c6a34e'}}>{fmt(+(e.monthlySalary||0))}</span>
            <button onClick={()=>setShowDimona(e)} style={{background:'rgba(34,197,94,.08)',border:'1px solid rgba(34,197,94,.15)',borderRadius:4,color:'#4ade80',fontSize:8,cursor:'pointer',padding:'2px 6px',fontFamily:'inherit'}}>XML</button>
            <button onClick={()=>delEmp(e.id)} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:12}}>✕</button>
          </div>)}
        </div>}

        <div style={{padding:14,background:'rgba(198,163,78,.03)',borderRadius:10,border:'1px dashed rgba(198,163,78,.15)'}}>
          <div style={{fontSize:11,fontWeight:600,color:'#c6a34e',marginBottom:10}}>+ Ajouter un employe</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
            <Field l="Prenom" req><Input value={newEmp.first} onChange={v=>setNewEmp(p=>({...p,first:v}))}/></Field>
            <Field l="Nom" req><Input value={newEmp.last} onChange={v=>setNewEmp(p=>({...p,last:v}))}/></Field>
            <Field l="NISS"><Input value={newEmp.niss} onChange={v=>setNewEmp(p=>({...p,niss:v}))} placeholder="XX.XX.XX-XXX.XX"/></Field>
            <Field l="Email"><Input value={newEmp.email} onChange={v=>setNewEmp(p=>({...p,email:v}))}/></Field>
            <Field l="Date debut" req><Input value={newEmp.startDate} onChange={v=>setNewEmp(p=>({...p,startDate:v}))} type="date"/></Field>
            <Field l="Date fin (CDD)"><Input value={newEmp.endDate} onChange={v=>setNewEmp(p=>({...p,endDate:v}))} type="date"/></Field>
            <Field l="Contrat"><Select value={newEmp.contractType} onChange={v=>setNewEmp(p=>({...p,contractType:v}))} options={['CDI','CDD','Etudiant','Flexi-job','Interim']}/></Field>
            <Field l="Brut mensuel" req><Input value={newEmp.monthlySalary} onChange={v=>setNewEmp(p=>({...p,monthlySalary:v}))} type="number" placeholder="3000"/></Field>
            <Field l="Fonction"><Input value={newEmp.function} onChange={v=>setNewEmp(p=>({...p,function:v}))}/></Field>
            <Field l="Regime (%)"><Input value={newEmp.regime} onChange={v=>setNewEmp(p=>({...p,regime:v}))} type="number"/></Field>
            <Field l="IBAN"><Input value={newEmp.iban} onChange={v=>setNewEmp(p=>({...p,iban:v}))} placeholder="BE68 ..."/></Field>
          </div>
          <button onClick={addEmp} style={{marginTop:8,padding:'8px 20px',borderRadius:8,border:'none',background:'rgba(198,163,78,.12)',color:'#c6a34e',fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>+ Ajouter</button>
        </div>
      </C>

      {/* DIMONA PREVIEW MODAL */}
      {showDimona&&<div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.6)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowDimona(null)}>
        <div onClick={e=>e.stopPropagation()} style={{background:'#0d1117',border:'1px solid rgba(34,197,94,.2)',borderRadius:16,padding:24,width:540,maxHeight:'80vh',overflow:'auto'}}>
          <h3 style={{fontSize:16,fontWeight:700,color:'#4ade80',marginBottom:12}}>📡 Dimona IN Preview — {showDimona.first} {showDimona.last}</h3>
          <pre style={{background:'#090c16',padding:12,borderRadius:8,fontSize:10,color:'#4ade80',whiteSpace:'pre-wrap',fontFamily:'monospace',lineHeight:1.6}}>{generateDimonaPreview(showDimona,data.company)}</pre>
          <div style={{marginTop:10,fontSize:10,color:'#888'}}>Ce XML sera soumis a l'ONSS via le canal Dimona electronique apres creation du dossier.</div>
          <button onClick={()=>setShowDimona(null)} style={{marginTop:10,padding:'8px 20px',borderRadius:8,border:'1px solid rgba(34,197,94,.2)',background:'transparent',color:'#4ade80',cursor:'pointer',fontFamily:'inherit'}}>Fermer</button>
        </div>
      </div>}
    </div>}

    {/* STEP 5: AVANTAGES */}
    {step===5&&<C title="🎁 Avantages extra-legaux">
      {[{id:'cheqRepas',l:'Cheques-repas',desc:'Max 8 EUR/jour dont max 6.91 EUR patronal',c:'#fb923c',val:'cheqRepasVal',unit:'EUR/cheque'},
        {id:'ecoCheques',l:'Eco-cheques',desc:'Max 250 EUR/an exonere ONSS + fiscal',c:'#22c55e',val:'ecoChequesVal',unit:'EUR/an'},
        {id:'teletravail',l:'Indemnite teletravail',desc:'Forfait bureau indexe mensuellement',c:'#3b82f6',val:'teletravailVal',unit:'EUR/mois'},
        {id:'assuranceGroupe',l:'Assurance groupe',desc:'Pension complementaire (2e pilier)',c:'#a855f7'},
        {id:'planCafeteria',l:'Plan cafeteria',desc:'Echange avantages via budget flexible',c:'#c6a34e'},
      ].map((opt,i)=><div key={opt.id} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <div onClick={()=>setData(p=>({...p,options:{...p.options,[opt.id]:!p.options[opt.id]}}))} style={{width:44,height:24,borderRadius:12,background:data.options[opt.id]?'rgba(34,197,94,.3)':'rgba(255,255,255,.08)',cursor:'pointer',position:'relative',transition:'all .2s',flexShrink:0}}>
          <div style={{width:18,height:18,borderRadius:9,background:data.options[opt.id]?'#4ade80':'#888',position:'absolute',top:3,left:data.options[opt.id]?23:3,transition:'all .2s'}}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:600,color:opt.c}}>{opt.l}</div>
          <div style={{fontSize:10,color:'#888'}}>{opt.desc}</div>
        </div>
        {opt.val&&data.options[opt.id]&&<div style={{width:100}}>
          <Input value={data.options[opt.val]} onChange={v=>setData(p=>({...p,options:{...p.options,[opt.val]:v}}))} type="number"/>
          <div style={{fontSize:8,color:'#888',marginTop:2,textAlign:'right'}}>{opt.unit}</div>
        </div>}
      </div>)}
    </C>}

    {/* STEP 6: RESUME & VALIDATION */}
    {step===6&&<div>
      <C title="✅ Resume du dossier">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:'#c6a34e',marginBottom:8}}>🏢 Entreprise</div>
            <div style={{fontSize:11,color:'#e8e6e0'}}><b>{data.company.name}</b></div>
            <div style={{fontSize:10,color:'#888'}}>TVA: {data.company.vat} — CP: {data.company.cp}</div>
            <div style={{fontSize:10,color:'#888'}}>{data.company.address} {data.company.zip} {data.company.city}</div>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:'#c6a34e',marginBottom:8}}>👤 Contact</div>
            <div style={{fontSize:11,color:'#e8e6e0'}}>{data.contact.name} — {data.contact.function}</div>
            <div style={{fontSize:10,color:'#888'}}>{data.contact.email} {data.contact.phone}</div>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:'#c6a34e',marginBottom:8}}>🏦 Bancaire</div>
            <div style={{fontSize:10,color:'#888'}}>IBAN: {data.bank.iban||'—'} — BIC: {data.bank.bic||'—'}</div>
          </div>
          <div>
            <div style={{fontSize:11,fontWeight:600,color:'#c6a34e',marginBottom:8}}>🏛 Social</div>
            <div style={{fontSize:10,color:'#888'}}>ONSS: {data.social.onss||'—'} — SEPP: {data.social.sepp||'—'}</div>
          </div>
        </div>
      </C>

      <C title={"👥 "+data.employees.length+" employe(s) — Cout total: "+fmt(data.employees.reduce((a,e)=>a+(+(e.monthlySalary||0))*(1+TX_ONSS_E),0))+' EUR/mois'}>
        {data.employees.map((e,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11}}>
          <span style={{color:'#e8e6e0'}}>{e.first} {e.last} <span style={{color:'#888'}}>({e.contractType})</span></span>
          <span style={{color:'#c6a34e',fontWeight:600}}>{fmt(+(e.monthlySalary||0))} EUR brut</span>
        </div>)}
        {data.employees.length===0&&<div style={{color:'#eab308',fontSize:11}}>⚠️ Aucun employe. Vous pouvez en ajouter plus tard.</div>}
      </C>

      <C title="🎁 Avantages">
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {data.options.cheqRepas&&<Badge text={"Cheques-repas "+data.options.cheqRepasVal+"€"} color="#fb923c"/>}
          {data.options.ecoCheques&&<Badge text={"Eco-cheques "+data.options.ecoChequesVal+"€/an"} color="#22c55e"/>}
          {data.options.teletravail&&<Badge text={"Teletravail "+data.options.teletravailVal+"€/mois"} color="#3b82f6"/>}
          {data.options.assuranceGroupe&&<Badge text="Assurance groupe" color="#a855f7"/>}
          {data.options.planCafeteria&&<Badge text="Plan cafeteria" color="#c6a34e"/>}
          {!data.options.cheqRepas&&!data.options.ecoCheques&&!data.options.teletravail&&<span style={{color:'#888',fontSize:11}}>Aucun avantage selectionne</span>}
        </div>
      </C>

      {data.employees.length>0&&<C title={"📡 DIMONA IN — "+data.employees.filter(e=>e.niss).length+"/"+data.employees.length+" prets"} sub="Les declarations Dimona seront generees automatiquement a la validation">
        {data.employees.map((e,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',fontSize:11}}>
          <span style={{fontSize:14}}>{e.niss?'✅':'⚠️'}</span>
          <span style={{color:'#e8e6e0'}}>{e.first} {e.last}</span>
          <span style={{color:e.niss?'#4ade80':'#eab308',fontSize:10}}>{e.niss?'DIMONA pret':'NISS manquant'}</span>
        </div>)}
      </C>}
    </div>}

    {/* NAV BUTTONS */}
    <div style={{display:'flex',justifyContent:'space-between',marginTop:20}}>
      <button onClick={()=>{setErrors([]);setStep(s2=>Math.max(0,s2-1));}} disabled={step===0} style={{padding:'10px 20px',borderRadius:8,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:step===0?'#555':'#888',cursor:step===0?'default':'pointer',fontSize:12,fontFamily:'inherit'}}>← Precedent</button>
      {step<6?<button onClick={nextStep} style={{padding:'10px 24px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#c6a34e,#a07d3e)',color:'#060810',fontWeight:700,fontSize:12,cursor:'pointer'}}>Suivant →</button>
      :<button onClick={finalize} style={{padding:'10px 24px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#22c55e,#16a34a)',color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer'}}>✅ Creer le dossier + DIMONA</button>}
    </div>
  </div>;
}
