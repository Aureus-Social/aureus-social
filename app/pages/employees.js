'use client';
import { useLang } from '../lib/lang-context';
import { B, C, CR_PAT, CR_TRAV, CR_MAX, DPER, I, LB, LEGAL, LOIS_BELGES, NET_FACTOR, PH, PP_EST, PV_DOUBLE, PV_SIMPLE, RMMMG, ST, TX_ONSS_E, TX_ONSS_W, Tbl, calc, f0, f2, fmt, validateNISS } from '@/app/lib/helpers';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const fmtP = n => `${((n||0)*100).toFixed(2)}%`;
const uid = () => `${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
const MN_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];




function escapeHtml(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function Employees({s,d}) {
  const { t, lang } = useLang();
  s=s||{emps:[],clients:[],co:{name:"",vat:""},payrollHistory:[],dimonaHistory:[]};
  const [form,setF]=useState(null);
  const [ed,setEd]=useState(false);
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all'); // all, active, sorti, student, ouvrier
  const [viewMode,setViewMode]=useState('list'); // list, grid
  const empty={first:'',last:'',niss:'',birth:'',addr:'',city:'',zip:'',startD:'',endD:'',fn:"",dept:'',contract:'CDI',regime:'full',whWeek:38,monthlySalary:0,civil:"single",depChildren:0,handiChildren:0,iban:'',mvT:10,mvW:CR_TRAV,mvE:8.91,expense:0,cp:'200',dmfaCode:'495',dimType:'OTH',commDist:0,commType:'none',commMonth:0,status:'active',sexe:'M',statut:'employe',niveauEtude:'sec',allocTravailType:'none',allocTravail:0,carFuel:"none",carCO2:0,carCatVal:0,carBrand:"",carModel:"",atnGSM:false,atnPC:false,atnInternet:false,atnLogement:false,atnLogementRC:0,atnChauffage:false,atnElec:false,depAscendant:0,depAscendantHandi:0,conjointHandicap:false,depAutres:0,anciennete:0,nrEngagement:0,engagementTrimestre:1,
    veloSociete:false,veloType:'none',veloValeur:0,veloLeasingMois:0,motoSociete:false,motoCO2:0,motoCatVal:0,motoBrand:'',carteCarburant:false,carteCarburantMois:0,borneRecharge:false,borneRechargeCoût:0,
    frontalier:false,frontalierPays:'',frontalierConvention:'',frontalierA1:false,frontalierExoPP:false,
    pensionné:false,pensionType:'none',pensionAge:0,pensionCarriere:0,pensionCumulIllimite:false,pensionMontant:0,
  };
  // ── NISS VALIDATION ──
  const validateNISS=(niss)=>{
    if(!niss)return{valid:false,msg:'NISS requis'};
    const clean=niss.replace(/[\s.\-]/g,'');
    if(clean.length!==11||!/^\d{11}$/.test(clean))return{valid:false,msg:'NISS doit contenir 11 chiffres'};
    // Check digit (modulo 97)
    const base=clean.slice(0,9);
    const check=parseInt(clean.slice(9));
    // Born before 2000
    let mod=97-(parseInt(base)%97);
    if(mod===check)return{valid:true,msg:'✅ NISS valide'};
    // Born after 2000 (prefix with 2)
    mod=97-(parseInt('2'+base)%97);
    if(mod===check)return{valid:true,msg:'✅ NISS valide (né(e) après 2000)'};
    return{valid:false,msg:'❌ NISS invalide — chiffre de contrôle incorrect'};
  };

  // ── NISS DUPLICATE DETECTION ──
  const checkNISSDuplicate=(niss,currentId)=>{
    if(!niss)return null;
    const clean=niss.replace(/[\s.\-]/g,'');
    // Level 1: Same dossier
    const dupLocal=(s?.emps||[]).find(e=>e.niss&&e.niss.replace(/[\s.\-]/g,'')===clean&&e.id!==currentId);
    if(dupLocal)return{level:'error',msg:`⛔ NISS déjà utilisé dans ce dossier: ${dupLocal.first} ${dupLocal.last}`};
    // Level 2: Platform-wide (check all clients)
    const allClients= s?.clients||[];
    for(const cl of allClients){
      if(cl.id===s.activeClient)continue;
      const dupPlatform=(cl.emps||[]).find(e=>e.niss&&e.niss.replace(/[\s.\-]/g,'')===clean);
      if(dupPlatform)return{level:'warn',msg:`⚠️ NISS existe dans le dossier ${cl.company?.name||'autre'}: ${dupPlatform.first} ${dupPlatform.last}. Transfert?`};
    }
    return null;
  };

  // ── IBAN VALIDATION ──
  const validateIBAN=(iban)=>{
    if(!iban)return null;
    const clean=iban.replace(/\s/g,'').toUpperCase();
    if(clean.length<15||clean.length>34)return{valid:false,msg:'❌ Longueur IBAN incorrecte'};
    if(!/^[A-Z]{2}\d{2}/.test(clean))return{valid:false,msg:'❌ Format IBAN invalide (doit commencer par 2 lettres + 2 chiffres)'};
    // Belgian IBAN check
    if(clean.startsWith('BE')&&clean.length!==16)return{valid:false,msg:'❌ IBAN belge = 16 caractères (BE + 14 chiffres)'};
    // Modulo 97 check
    const rearranged=clean.slice(4)+clean.slice(0,4);
    const numeric=rearranged.split('').map(c=>/\d/.test(c)?c:(c.charCodeAt(0)-55).toString()).join('');
    let remainder=numeric.slice(0,2);
    for(let i=2;i<numeric.length;i++){
      remainder=((parseInt(remainder+numeric[i]))%97).toString();
    }
    if(parseInt(remainder)!==1)return{valid:false,msg:'❌ IBAN invalide — chiffre de contrôle incorrect'};
    return{valid:true,msg:`✅ IBAN valide (${clean.slice(0,2)})`};
  };

  const [nissCheck,setNissCheck]=useState(null);
  const [nissDup,setNissDup]=useState(null);
  const [ibanCheck,setIbanCheck]=useState(null);

  const onNissChange=(v)=>{
    setF({...form,niss:v});
    if(v.replace(/[\s.\-]/g,'').length>=11){
      setNissCheck(validateNISS(v));
      setNissDup(checkNISSDuplicate(v,form.id));
    }else{setNissCheck(null);setNissDup(null);}
  };
  const onIbanChange=(v)=>{
    setF({...form,iban:v});
    if(v.replace(/\s/g,'').length>=15)setIbanCheck(validateIBAN(v));
    else setIbanCheck(null);
  };

  // ── IMPORT EXCEL ──
  const [importing,setImporting]=useState(false);
  const handleImportExcel=async(e)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    setImporting(true);
    try{
      const XLSX=await new Promise((resolve,reject)=>{if(window.XLSX)return resolve(window.XLSX);const s=document.createElement('script');s.src='https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';s.onload=()=>resolve(window.XLSX);s.onerror=reject;document.head.appendChild(s);});
      const buf=await file.arrayBuffer();
      const wb=XLSX.read(buf);
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws);
      let added=0;
      for(const r of rows){
        const emp={
          ...empty,
          first:r['Prénom']||r['Prenom']||r['prenom']||r['first']||r['First']||'',
          last:r['Nom']||r['nom']||r['last']||r['Last']||'',
          niss:String(r['NISS']||r['niss']||r['Registre national']||''),
          fn:r['Fonction']||r['fonction']||r['function']||'',
          dept:r['Département']||r['Departement']||r['dept']||'',
          contract:r['Contrat']||r['contrat']||r['Type']||'CDI',
          cp:String(r['CP']||r['cp']||r['Commission paritaire']||'200'),
          monthlySalary:parseFloat(r['Brut']||r['brut']||r['Salaire']||r['salaire']||0),
          startD:r['Entrée']||r['Entree']||r['Date entrée']||r['startD']||'',
          iban:r['IBAN']||r['iban']||'',
          statut:r['Statut']||r['statut']||'employe',
          sexe:r['Sexe']||r['sexe']||'M',
          status:'active',
        };
        if(emp.first||emp.last){
          d({type:'ADD_E',d:emp});
          added++;
        }
      }
      alert(`✅ ${added} travailleur(s) importé(s) depuis ${file.name}`);
    }catch(err){
      alert('❌ Erreur import: '+err.message);
    }
    setImporting(false);
    e.target.value='';
  };

  // ── PRÉ-REMPLISSAGE INTELLIGENT PAR CP (référence globale optimisée) ──
  const onCPChange=(v)=>{
    const preset=CP_PRESETS_FULL[v];
    if(preset&&!ed){
      setF({...form,cp:v,
        fn:preset.fn,
        statut:preset.statut,
        monthlySalary:preset.monthlySalary,
        whWeek:preset.whWeek
      });
    }else{
      setF({...form,cp:v});
    }
  };

  // ── ROI CALCULATOR ──
  const [showROI,setShowROI]=useState(false);
  const [roiData,setRoiData]=useState({nbEmps:10,prixActuel:35,prixAureus:12});
  const roiSaving=(roiData.prixActuel-roiData.prixAureus)*roiData.nbEmps;
  const roiSavingYear=roiSaving*12;
  const roiPercent=roiData.prixActuel>0?Math.round((1-roiData.prixAureus/roiData.prixActuel)*100):0;

  const save=()=>{
    if(!form.first||!form.last)return alert('Nom requis');
    // NISS validation
    if(form.niss){
      const nc=validateNISS(form.niss);
      if(!nc.valid)return alert(nc.msg);
      const dup=checkNISSDuplicate(form.niss,form.id);
      if(dup&&dup.level==='error')return alert(dup.msg);
    }
    // IBAN validation
    if(form.iban){
      const ic=validateIBAN(form.iban);
      if(ic&&!ic.valid)return alert(ic.msg);
    }
    if(ed)d({type:"UPD_E",d:form});else d({type:"ADD_E",d:form});setF(null);setEd(false);
  };

  // Filter and search
  const filtered=(s?.emps||[]).filter(e=>{
    if(filter==='active'&&e.status==='sorti')return false;
    if(filter==='sorti'&&e.status!=='sorti')return false;
    if(filter==='student'&&e.contract!=='student')return false;
    if(filter==='ouvrier'&&e.statut!=='ouvrier')return false;
    if(search){
      const q=search.toLowerCase();
      return `${e.first||e.fn||'Emp'} ${e.last||''} ${e.fn} ${e.niss} ${e.dept} ${e.cp}`.toLowerCase().includes(q);
    }
    return true;
  });

  // CSV Export
  const exportCSV=()=>{
    const headers=['Prénom',"Nom","NISS","Fonction","Département","Contrat","CP","Brut","Statut","Entrée","IBAN"];
    const rows=filtered.map(e=>[e.first,e.last,e.niss,e.fn,e.dept,e.contract,e.cp,e.monthlySalary,e.status||'active',e.startD,e.iban]);
    const csv=[headers,...rows].map(r=>r.map(c=>`"${(c||'').toString().replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`employees_${new Date().toISOString().slice(0,10)}.csv`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
  };

  const activeCount=(s?.emps||[]).filter(e=>e.status!=='sorti').length;
  const sortiCount=(s?.emps||[]).filter(e=>e.status==='sorti').length;
  const studentCount=(s?.emps||[]).filter(e=>e.contract==='student').length;

  // Exemple Activa — Nourdin MOUSSATI (attestation Activa.brussels AP 350/800/350) — fiche complète
  // CDD 3 mois : entrée 2 mars 2026, fin 1er juin 2026 ; fiche de paie pour fin mars 2026
  const addExempleActivaNordin=()=>{
    const startDate='2026-03-02';
    const endDate='2026-06-01';
    const exemple={...empty,
      id:'E-Activa-Nourdin',
      first:'Nourdin',last:'MOUSSATI',niss:'83.09.30.133.94',birth:'1983-09-30',
      fn:'Assistant administratif',function:'Assistant administratif',dept:'Administration',
      contract:'CDD',regime:'full',whWeek:38,monthlySalary:2800,
      cp:'200',dmfaCode:'495',dimType:'OTH',
      startD:startDate,startDate:startDate,endD:endDate,endDate:endDate,
      addr:'Avenue Princesse Elisabeth 5 Bte 1',zip:'1030',city:'Schaerbeek',
      email:'nourdin.moussati@example.com',phone:'+32 2 123 45 67',
      civil:'single',depChildren:0,sexe:'M',statut:'employe',status:'active',
      iban:'BE71 0961 2345 6769',mvT:10,mvW:CR_TRAV,mvE:8.91,expense:0,
    };
    d({type:'ADD_E',d:exemple});
    d({type:'NAV',page:'payslip',sub:null,selectedEmpIdForPayslip:'E-Activa-Nourdin'});
    if(typeof addToast==='function')addToast('Nourdin MOUSSATI ajouté. Dans Fiches de Paie : choisir « Activa.brussels AP (350→800→350) » pour l\'allocation.');
    else alert('Nourdin MOUSSATI ajouté. Allez dans Fiches de Paie → sélectionnez-le → Activation ONEM : Activa.brussels AP (350→800→350).');
  };

  return <div>
    <PH title="Gestion des Employés" sub={`${(s?.emps||[]).length} employé(s)`} actions={<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      <label style={{padding:'8px 14px',borderRadius:8,fontSize:11,cursor:'pointer',border:'1px solid rgba(198,163,78,.25)',background:'transparent',color:'#c6a34e',fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
        📥 {importing?'Import...':'Import Excel'}
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportExcel} style={{display:'none'}}/>
      </label>
      <B v="outline" onClick={()=>setShowROI(!showROI)} style={{padding:'8px 14px',fontSize:11}}>💰 ROI</B>
      <B v="outline" onClick={exportCSV} style={{padding:'8px 14px',fontSize:11}}>⬇ CSV</B>
      <B v="outline" onClick={addExempleActivaNordin} style={{padding:'8px 14px',fontSize:11}}>💼 Exemple Activa Nourdin</B>
      <B onClick={()=>{setF({...empty});setEd(false);}}>+ Nouvel employé</B>
    </div>}/>
    {/* Barre visible Exemple Activa — toujours affichée sous le titre */}
    <div style={{marginBottom:16,padding:'12px 16px',background:'linear-gradient(135deg,rgba(34,197,94,.08),rgba(34,197,94,.03))',border:'1px solid rgba(34,197,94,.2)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
      <span style={{fontSize:12,color:'#86efac'}}>💼 Plan Activa (attestation Actiris) — Exemple Nourdin MOUSSATI : ajout en 1 clic + redirection Fiches de Paie</span>
      <button onClick={addExempleActivaNordin} style={{padding:'10px 18px',borderRadius:8,border:'none',background:'#22c55e',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>💼 Créer Nourdin MOUSSATI (Activa)</button>
    </div>
    {/* Search and filters bar */}
    <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
      <div style={{flex:1,minWidth:200,position:'relative'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher par nom, NISS, fonction, département..."
          style={{width:'100%',padding:'10px 14px 10px 14px',background:"#090c16",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,color:'#d4d0c8',fontSize:12.5,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
      </div>
      <div style={{display:'flex',gap:4}}>
        {[
          {id:"all",l:`Tous (${(s?.emps||[]).length})`},
          {id:"active",l:`Actifs (${activeCount})`},
          {id:"sorti",l:`Sortis (${sortiCount})`},
          {id:"student",l:`Étudiants (${studentCount})`},
        ].map(f=>
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{padding:'7px 12px',borderRadius:6,fontSize:11,fontWeight:filter===f.id?600:400,border:'1px solid '+(filter===f.id?'rgba(198,163,78,.3)':'rgba(139,115,60,.1)'),background:filter===f.id?'rgba(198,163,78,.1)':'transparent',color:filter===f.id?'#c6a34e':'#5e5c56',cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>{f.l}</button>
        )}
      </div>
      <div style={{display:'flex',gap:2,background:"rgba(198,163,78,.04)",borderRadius:6,border:'1px solid rgba(139,115,60,.1)',overflow:'hidden'}}>
        <button onClick={()=>setViewMode('list')} style={{padding:'6px 10px',border:'none',background:viewMode==='list'?'rgba(198,163,78,.15)':'transparent',color:viewMode==='list'?'#c6a34e':'#5e5c56',cursor:'pointer',fontSize:13}}>☰</button>
        <button onClick={()=>setViewMode('grid')} style={{padding:'6px 10px',border:'none',background:viewMode==='grid'?'rgba(198,163,78,.15)':'transparent',color:viewMode==='grid'?'#c6a34e':'#5e5c56',cursor:'pointer',fontSize:13}}>⊞</button>
      </div>
    </div>
    {/* ROI Calculator */}
    {showROI&&<C style={{marginBottom:20,border:'1px solid rgba(198,163,78,.25)'}}>
      <h3 style={{fontSize:15,fontWeight:600,color:'#c6a34e',margin:'0 0 12px'}}>💰 Calculateur ROI — Économies vs secrétariat social</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
        <I label="Nombre de travailleurs" type="number" value={roiData.nbEmps} onChange={v=>setRoiData({...roiData,nbEmps:parseInt(v)||0})}/>
        <I label="Prix actuel / fiche (€)" type="number" value={roiData.prixActuel} onChange={v=>setRoiData({...roiData,prixActuel:parseFloat(v)||0})}/>
        <I label="Prix Aureus / fiche (€)" type="number" value={roiData.prixAureus} onChange={v=>setRoiData({...roiData,prixAureus:parseFloat(v)||0})}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        <div style={{padding:16,borderRadius:10,background:'rgba(74,222,128,.06)',border:'1px solid rgba(74,222,128,.15)',textAlign:'center'}}>
          <div style={{fontSize:10,color:'#9e9b93',marginBottom:4}}>Économie / mois</div>
          <div style={{fontSize:22,fontWeight:700,color:'#4ade80'}}>{roiSaving.toFixed(0)} €</div>
        </div>
        <div style={{padding:16,borderRadius:10,background:'rgba(198,163,78,.06)',border:'1px solid rgba(198,163,78,.15)',textAlign:'center'}}>
          <div style={{fontSize:10,color:'#9e9b93',marginBottom:4}}>Économie / an</div>
          <div style={{fontSize:22,fontWeight:700,color:'#c6a34e'}}>{roiSavingYear.toFixed(0)} €</div>
        </div>
        <div style={{padding:16,borderRadius:10,background:'rgba(96,165,250,.06)',border:'1px solid rgba(96,165,250,.15)',textAlign:'center'}}>
          <div style={{fontSize:10,color:'#9e9b93',marginBottom:4}}>Réduction</div>
          <div style={{fontSize:22,fontWeight:700,color:'#60a5fa'}}>{roiPercent}%</div>
        </div>
      </div>
      <div style={{marginTop:12,fontSize:11,color:'#5e5c56',textAlign:'center'}}>
        Comparé à {roiData.prixActuel}€/fiche chez les prestataires traditionnels — Aureus à {roiData.prixAureus}€/fiche
      </div>
    </C>}
    {form&&<C style={{marginBottom:20}}>
      <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 16px',fontFamily:"'Cormorant Garamond',serif"}}>{ed?'Modifier':'Nouvel employé'}</h2>
      <ST>Identité</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="Prénom" value={form.first} onChange={v=>setF({...form,first:v})}/>
        <I label="Nom" value={form.last} onChange={v=>setF({...form,last:v})}/>
        <div>
          <I label="NISS" value={form.niss} onChange={onNissChange}/>
          {nissCheck&&<div style={{fontSize:10,marginTop:2,color:nissCheck.valid?'#4ade80':'#f87171'}}>{nissCheck.msg}</div>}
          {nissDup&&<div style={{fontSize:10,marginTop:2,color:nissDup.level==='error'?'#f87171':'#fb923c'}}>{nissDup.msg}</div>}
        </div>
        <I label="Naissance" type="date" value={form.birth} onChange={v=>setF({...form,birth:v})}/>
        <I label="Sexe" value={form.sexe} onChange={v=>setF({...form,sexe:v})} options={[{v:"M",l:"Homme"},{v:"F",l:"Femme"},{v:"X",l:"Non-binaire"}]}/>
        <I label="Statut" value={form.statut} onChange={v=>setF({...form,statut:v})} options={[{v:"employe",l:"Employé"},{v:"ouvrier",l:"Ouvrier"},{v:"etudiant",l:"Étudiant"},{v:"apprenti",l:"Apprenti"},{v:"dirigeant",l:"Dirigeant d\'entreprise"}]}/>
        <I label="Adresse" value={form.addr} onChange={v=>setF({...form,addr:v})} span={2}/>
        <I label="CP" value={form.zip} onChange={v=>setF({...form,zip:v})}/>
        <I label="Ville" value={form.city} onChange={v=>setF({...form,city:v})}/>
        <div>
          <I label="IBAN" value={form.iban} onChange={onIbanChange}/>
          {ibanCheck&&<div style={{fontSize:10,marginTop:2,color:ibanCheck.valid?'#4ade80':'#f87171'}}>{ibanCheck.msg}</div>}
        </div>
        <I label="Niveau d'études" value={form.niveauEtude} onChange={v=>setF({...form,niveauEtude:v})} options={[{v:"prim",l:"Primaire"},{v:"sec_inf",l:"Secondaire inférieur"},{v:"sec",l:"Secondaire supérieur"},{v:"sup",l:"Supérieur non-universitaire (bachelier)"},{v:"univ",l:"Universitaire (master/doctorat)"}]}/>
      </div>
      <ST>Contrat</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="Fonction" value={form.fn} onChange={v=>setF({...form,fn:v})}/>
        <I label="Département" value={form.dept} onChange={v=>setF({...form,dept:v})}/>
        <I label="Entrée" type="date" value={form.startD} onChange={v=>setF({...form,startD:v})}/>
        <I label="Contrat" value={form.contract} onChange={v=>setF({...form,contract:v})} options={[
          {v:"CDI",l:"CDI"},{v:"CDD",l:"CDD"},{v:"trav_det",l:"Travail nettement défini"},{v:"remplacement",l:"Remplacement"},
          {v:"tpartiel",l:"Temps partiel"},{v:"interim",l:"Intérimaire"},{v:"student",l:"Étudiant (650h)"},
          {v:"flexi",l:"Flexi-job"},{v:"saisonnier",l:"Saisonnier"},{v:"occas_horeca",l:"Extra Horeca"},
          {v:"titre_service",l:"Titres-services"},{v:"art60",l:"Art. 60§7 (CPAS)"},{v:"CIP",l:"Convention immersion"},
          {v:"alternance",l:"Alternance"},{v:"CPE",l:"Premier emploi"},{v:"ETA",l:"Travail adapté"},
          {v:"detache",l:"Détaché"},{v:"domestique",l:"Domestique"},{v:"teletravail",l:"Télétravail struct."},
          {v:"domicile",l:"Travail à domicile"},{v:"indep_princ",l:"Indép. principal"},
          {v:"indep_compl",l:"Indép. complémentaire"},{v:"mandataire",l:"Mandataire société"},
          {v:"freelance",l:"Freelance/Consultant"},{v:"smart",l:"Smart (portage)"},
          {v:"volontariat",l:"Volontariat"},{v:"artiste",l:"Artiste (ATA)"},{v:"sportif",l:"Sportif rémunéré"},
          {v:"plateforme",l:"Économie plateforme"}
        ]}/>
        <I label="H/sem" type="number" value={form.whWeek} onChange={v=>setF({...form,whWeek:v})}/>
        <I label="CP" value={form.cp} onChange={onCPChange} options={Object.entries(LEGAL.CP).map(([k,v])=>({v:k,l:v}))}/>
        <I label="Code DMFA" value={form.dmfaCode} onChange={v=>setF({...form,dmfaCode:v})} options={Object.entries(LEGAL.DMFA_CODES).map(([k,v])=>({v:k,l:`${k} - ${v}`}))}/>
        <I label="Rang engagement" value={form.nrEngagement||0} onChange={v=>setF({...form,nrEngagement:parseInt(v)||0})} options={[{v:0,l:"— Pas de réduction —"},{v:1,l:"1er employé (exo totale)"},{v:2,l:"2è employé"},{v:3,l:"3è employé"},{v:4,l:"4è employé"},{v:5,l:"5è employé"},{v:6,l:"6è employé"}]}/>
        {form.nrEngagement>0&&<I label="Trimestre depuis eng." type="number" value={form.engagementTrimestre||1} onChange={v=>setF({...form,engagementTrimestre:parseInt(v)||1})}/>}
      </div>
      <ST style={{marginTop:14}}>Activation ONEM (comme dans Fiches de Paie)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:8,padding:12,background:'rgba(34,197,94,.04)',border:'1px solid rgba(34,197,94,.15)',borderRadius:8}}>
        <I label="Activation ONEM" value={form.allocTravailType||'none'} onChange={v=>setF({...form,allocTravailType:v,allocTravail:v!=='none'?(form.allocTravail||0):0})} options={[{v:"none",l:"— Aucune —"},{v:"activa_bxl",l:"Activa.brussels (€350/m)"},{v:"activa_bxl_ap",l:"Activa.brussels AP (350→800→350)"},{v:"activa_jeune",l:"Activa Jeunes <30 (€350/m)"},{v:"impulsion_wal",l:"Impulsion Wallonie (€500/m)"},{v:"impulsion55",l:"Impulsion 55+ (€500/m)"},{v:"sine",l:"SINE écon. sociale (€500/m)"},{v:"vdab",l:"VDAB (prime directe)"},{v:"art60",l:"Art. 60 §7 (1er emploi)"}]}/>
        {form.allocTravailType&&form.allocTravailType!=='none'&&<I label="Montant alloc. ONEM (€)" type="number" value={form.allocTravail||0} onChange={v=>setF({...form,allocTravail:parseFloat(v)||0})}/>}
      </div>
      <div style={{marginTop:6,marginBottom:12,padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,fontSize:10.5,color:'#9e9b93',lineHeight:1.5}}>
        💡 Ce réglage sera repris par défaut sur les Fiches de Paie. Le montant (Activa AP) peut être calculé automatiquement selon le mois d’ancienneté (350 → 800 → 350 €).
      </div>
      <ST>Grille horaire (Loi 16/03/1971 + Règlement de travail)</ST>
      <div style={{padding:10,background:"rgba(198,163,78,.03)",borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
        <div style={{display:'flex',gap:6,marginBottom:8,alignItems:'center'}}>
          <span style={{fontSize:11,color:'#9e9b93',fontWeight:600,width:70}}>Fraction:</span>
          <span style={{fontSize:13,fontWeight:700,color:(form.whWeek||38)>=38?'#4ade80':'#fb923c'}}>{Math.round((form.whWeek||38)/38*100)}%</span>
          <span style={{fontSize:10.5,color:'#5e5c56',marginLeft:6}}>({form.whWeek||38}h / 38h réf.) — {(form.whWeek||38)>=38?'Temps plein':'Temps partiel'}</span>
          <span style={{fontSize:10.5,color:'#5e5c56',marginLeft:'auto'}}>{((form.whWeek||38)/5).toFixed(2)}h/jour · Pause: 30min (si {'>'} 6h)</span>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr style={{borderBottom:'1px solid rgba(198,163,78,.15)'}}>
            {['',"Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Total"].map(h=><th key={h} style={{padding:'4px 6px',fontSize:10,color:'#9e9b93',textAlign:'center',fontWeight:600}}>{h}</th>)}
          </tr></thead>
          <tbody>
            <tr>
              <td style={{padding:'4px 6px',fontSize:10,color:'#9e9b93'}}>Début</td>
              {['lu',"ma","me","je","ve","sa"].map(d=><td key={d}><input type="time" defaultValue={d==='sa'?'':'09:00'} style={{width:'100%',background:"rgba(198,163,78,.05)",border:'1px solid rgba(198,163,78,.1)',borderRadius:4,padding:'3px 4px',fontSize:10,color:'#e8e6e0',textAlign:'center'}} onChange={e=>setF({...form,[`h_${d}_de`]:e.target.value})}/></td>)}
              <td rowSpan={2} style={{textAlign:'center',verticalAlign:'middle'}}>
                <div style={{fontSize:16,fontWeight:700,color:'#c6a34e'}}>{form.whWeek||38}h</div>
                <div style={{fontSize:9,color:'#5e5c56'}}>/semaine</div>
              </td>
            </tr>
            <tr>
              <td style={{padding:'4px 6px',fontSize:10,color:'#9e9b93'}}>Fin</td>
              {['lu',"ma","me","je","ve","sa"].map(d=><td key={d}><input type="time" defaultValue={d==='sa'?'':'17:36'} style={{width:'100%',background:"rgba(198,163,78,.05)",border:'1px solid rgba(198,163,78,.1)',borderRadius:4,padding:'3px 4px',fontSize:10,color:'#e8e6e0',textAlign:'center'}} onChange={e=>setF({...form,[`h_${d}_a`]:e.target.value})}/></td>)}
            </tr>
          </tbody>
        </table>
        <div style={{marginTop:8,fontSize:9.5,color:'#5e5c56',lineHeight:1.5}}>
          ⏱ <b>Temps plein</b> = 38h/sem (Art. 19 Loi 16/03/1971). <b>Temps partiel</b> = min. 1/3 temps plein (≥12h40). Horaire variable possible (Art. 11bis). Dérogation samedi/dimanche = CCT sectorielle ou accord d'entreprise.
        </div>
      </div>
      <ST>Rémunération</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="Brut mensuel (€)" type="number" value={form.monthlySalary} onChange={v=>setF({...form,monthlySalary:v})}/>
        <I label="CR total (€)" type="number" value={form.mvT} onChange={v=>setF({...form,mvT:v})}/>
        <I label="CR part trav. (€)" type="number" value={form.mvW} onChange={v=>setF({...form,mvW:v})}/>
        <I label="CR part empl. (€)" type="number" value={form.mvE} onChange={v=>setF({...form,mvE:v})}/>
        <I label="Frais propres (€)" type="number" value={form.expense} onChange={v=>setF({...form,expense:v})}/>
        <I label="Transport domicile-travail" value={form.commType} onChange={v=>setF({...form,commType:v})} options={[{v:"none",l:"Aucun"},{v:"train",l:"🚆 Train (SNCB)"},{v:"bus",l:"🚌 Bus/Tram/Métro (STIB/TEC/De Lijn)"},{v:"bike",l:"🚲 Vélo"},{v:"car",l:"🚗 Voiture privée"},{v:"carpool",l:"🚗 Covoiturage"},{v:"mixed",l:"🔄 Combiné (train+autre)"},{v:"company_car",l:"🏢 Voiture de société (pas d\'interv.)"}]}/>
        {form.commType!=='none'&&form.commType!=='company_car'&&<I label="Distance simple (km)" type="number" value={form.commDist} onChange={v=>setF({...form,commDist:v})}/>}
        {(form.commType==='train'||form.commType==='bus'||form.commType==='mixed')&&<I label="Abonnement mensuel (€)" type="number" value={form.commMonth} onChange={v=>setF({...form,commMonth:v})}/>}
      </div>
      {form.commType!=='none'&&form.commType!=='company_car'&&<div style={{marginTop:8,padding:10,background:"rgba(96,165,250,.04)",borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.6}}>
        {form.commType==='train'&&'🚆 Train SNCB: intervention employeur obligatoire = 75% de l\'abonnement (CCT 19/9). Exonéré ONSS et IPP.'}
        {form.commType==='bus'&&'🚌 Transport en commun: intervention obligatoire = prix abonnement SNCB pour même distance (CCT 19/9). Exonéré ONSS et IPP.'}
        {form.commType==='bike'&&`🚲 Vélo: indemnité ${form.commDist>0?((form.commDist*2*0.27).toFixed(2)+'€/jour = '):''}0,27 €/km A/R (2026). Exonéré ONSS et IPP (max 0,27€/km). Cumulable avec transport en commun.`}
        {form.commType==='car'&&`🚗 Voiture privée: pas d'obligation légale (sauf CCT sectorielle). Si intervention: exonéré ONSS jusqu'à 490€/an. Distance: ${form.commDist||0} km × 2 = ${(form.commDist||0)*2} km A/R.`}
        {form.commType==='carpool'&&'🚗 Covoiturage: mêmes règles que voiture privée pour le conducteur. Passager = indemnité possible exonérée.'}
        {form.commType==='mixed'&&'🔄 Combiné: cumul possible train + vélo ou train + voiture. Chaque trajet est indemnisé séparément selon son mode.'}
      </div>}
      <ST>Véhicule de société (ATN)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="Carburant" value={form.carFuel} onChange={v=>setF({...form,carFuel:v})} options={[{v:"none",l:"Pas de véhicule"},{v:"essence",l:"Essence"},{v:"diesel",l:"Diesel"},{v:"lpg",l:"LPG/CNG"},{v:"electrique",l:"Électrique"},{v:"hybride",l:"Hybride PHEV"}]}/>
        <I label="CO2 g/km" type="number" value={form.carCO2} onChange={v=>setF({...form,carCO2:v})}/>
        <I label="Valeur catalogue (€)" type="number" value={form.carCatVal} onChange={v=>setF({...form,carCatVal:v})}/>
        <I label="Marque" value={form.carBrand} onChange={v=>setF({...form,carBrand:v})} options={[
          {v:"",l:"— Sélectionner —"},{v:"Aiways",l:"Aiways"},{v:"Alfa Romeo",l:"Alfa Romeo"},{v:"Alpine",l:"Alpine"},{v:"Aston Martin",l:"Aston Martin"},
          {v:"Audi",l:"Audi"},{v:"Bentley",l:"Bentley"},{v:"BMW",l:"BMW"},{v:"BYD",l:"BYD"},{v:"Cadillac",l:"Cadillac"},
          {v:"Chevrolet",l:"Chevrolet"},{v:"Chrysler",l:"Chrysler"},{v:"Citroën",l:"Citroën"},{v:"Cupra",l:"Cupra"},{v:"Dacia",l:"Dacia"},
          {v:"Dodge",l:"Dodge"},{v:"DS",l:"DS Automobiles"},{v:"Ferrari",l:"Ferrari"},{v:"Fiat",l:"Fiat"},{v:"Ford",l:"Ford"},
          {v:"Genesis",l:"Genesis"},{v:"Honda",l:"Honda"},{v:"Hyundai",l:"Hyundai"},{v:"Infiniti",l:"Infiniti"},{v:"Isuzu",l:"Isuzu"},
          {v:"Jaguar",l:"Jaguar"},{v:"Jeep",l:"Jeep"},{v:"Kia",l:"Kia"},{v:"Lamborghini",l:"Lamborghini"},{v:"Land Rover",l:"Land Rover"},
          {v:"Lexus",l:"Lexus"},{v:"Lotus",l:"Lotus"},{v:"Lynk & Co",l:"Lynk & Co"},{v:"Maserati",l:"Maserati"},{v:"Mazda",l:"Mazda"},
          {v:"McLaren",l:"McLaren"},{v:"Mercedes",l:"Mercedes-Benz"},{v:"MG",l:"MG"},{v:"Mini",l:"Mini"},{v:"Mitsubishi",l:"Mitsubishi"},
          {v:"NIO",l:"NIO"},{v:"Nissan",l:"Nissan"},{v:"Opel",l:"Opel"},{v:"Peugeot",l:"Peugeot"},{v:"Polestar",l:"Polestar"},
          {v:"Porsche",l:"Porsche"},{v:"Renault",l:"Renault"},{v:"Rolls-Royce",l:"Rolls-Royce"},{v:"Seat",l:"Seat"},{v:"Škoda",l:"Škoda"},
          {v:"Smart",l:"Smart"},{v:"SsangYong",l:"SsangYong"},{v:"Subaru",l:"Subaru"},{v:"Suzuki",l:"Suzuki"},{v:"Tesla",l:"Tesla"},
          {v:"Toyota",l:"Toyota"},{v:"Volkswagen",l:"Volkswagen"},{v:"Volvo",l:"Volvo"},{v:"XPeng",l:"XPeng"},{v:"Autre",l:"Autre"}
        ]}/>
        <I label="Modèle" value={form.carModel} onChange={v=>setF({...form,carModel:v})} options={[
          {v:"",l:"— Sélectionner —"},...((CAR_MODELS[form.carBrand]||[]).map(m=>({v:m,l:m}))),{v:"_autre",l:"Autre modèle"}
        ]}/>
      </div>
      <ST>Avantages en nature (ATN)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>📱 GSM/Téléphone (36€/an)</div>
          <div onClick={()=>setF({...form,atnGSM:!form.atnGSM})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnGSM?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnGSM?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnGSM?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnGSM?'✅ OUI — 3,00 €/mois':'❌ NON'}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>💻 PC/Tablette (72€/an)</div>
          <div onClick={()=>setF({...form,atnPC:!form.atnPC})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnPC?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnPC?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnPC?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnPC?'✅ OUI — 6,00 €/mois':'❌ NON'}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>🌐 Internet privé (60€/an)</div>
          <div onClick={()=>setF({...form,atnInternet:!form.atnInternet})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnInternet?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnInternet?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnInternet?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnInternet?'✅ OUI — 5,00 €/mois':'❌ NON'}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>🏠 Logement gratuit (RC × coeff.)</div>
          <div onClick={()=>setF({...form,atnLogement:!form.atnLogement})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnLogement?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnLogement?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnLogement?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnLogement?'✅ OUI':'❌ NON'}
          </div>
        </div>
        {form.atnLogement&&<I label="RC logement (€)" type="number" value={form.atnLogementRC} onChange={v=>setF({...form,atnLogementRC:v})}/>}
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>🔥 Chauffage gratuit (2.130€/an)</div>
          <div onClick={()=>setF({...form,atnChauffage:!form.atnChauffage})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnChauffage?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnChauffage?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnChauffage?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnChauffage?'✅ OUI — 177,50 €/mois':'❌ NON'}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>⚡ Électricité gratuite (1.060€/an)</div>
          <div onClick={()=>setF({...form,atnElec:!form.atnElec})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnElec?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnElec?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnElec?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnElec?'✅ OUI — 88,33 €/mois':'❌ NON'}
          </div>
        </div>
      </div>
      <ST>Vélo de société & Mobilité verte</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>🚲 Vélo de société (leasing)</div>
          <div onClick={()=>setF({...form,veloSociete:!form.veloSociete})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.veloSociete?'rgba(74,222,128,.15)':'rgba(198,163,78,.04)',color:form.veloSociete?'#4ade80':'#5e5c56',border:'1px solid '+(form.veloSociete?'rgba(74,222,128,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.veloSociete?'✅ OUI — ATN = 0€ (exonéré depuis 2024)':'❌ NON'}
          </div>
        </div>
        {form.veloSociete&&<I label="Type de vélo" value={form.veloType||'none'} onChange={v=>setF({...form,veloType:v})} options={[{v:"classique",l:"🚲 Vélo classique"},{v:"electrique",l:"⚡ Vélo électrique (≤25km/h)"},{v:"speed_pedelec",l:"🏎 Speed pedelec (≤45km/h)"}]}/>}
        {form.veloSociete&&<I label="Valeur catalogue (€)" type="number" value={form.veloValeur} onChange={v=>setF({...form,veloValeur:v})}/>}
        {form.veloSociete&&<I label="Leasing mensuel (€)" type="number" value={form.veloLeasingMois} onChange={v=>setF({...form,veloLeasingMois:v})}/>}
      </div>
      {form.veloSociete&&<div style={{marginTop:8,padding:10,background:"rgba(74,222,128,.04)",borderRadius:8,fontSize:10.5,color:'#4ade80',lineHeight:1.6}}>
        🚲 <b>Vélo de société</b> — ATN = 0€ (Art. 38§1er 14°a CIR — exonéré ONSS et IPP depuis 01/01/2024). Leasing vélo déductible 100% pour l'employeur. Cumulable avec l'indemnité vélo 0,27€/km. Le speed pedelec est assimilé à un vélo.
      </div>}
      <ST>Moto de société (ATN)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>🏍 Moto de société</div>
          <div onClick={()=>setF({...form,motoSociete:!form.motoSociete})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.motoSociete?'rgba(251,146,60,.15)':'rgba(198,163,78,.04)',color:form.motoSociete?'#fb923c':'#5e5c56',border:'1px solid '+(form.motoSociete?'rgba(251,146,60,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.motoSociete?'✅ OUI — ATN calculé sur valeur catalogue':'❌ NON'}
          </div>
        </div>
        {form.motoSociete&&<I label="Carburant moto" value={form.motoFuel||'essence'} onChange={v=>setF({...form,motoFuel:v})} options={[{v:'essence',l:'Essence'},{v:'electrique',l:'Électrique'},{v:'hybride',l:'Hybride'}]}/>}
        {form.motoSociete&&<I label="CO2 g/km moto" type="number" value={form.motoCO2} onChange={v=>setF({...form,motoCO2:v})}/>}
        {form.motoSociete&&<I label="Valeur catalogue moto (€)" type="number" value={form.motoCatVal} onChange={v=>setF({...form,motoCatVal:v})}/>}
        {form.motoSociete&&<I label="Marque moto" value={form.motoBrand||''} onChange={v=>setF({...form,motoBrand:v})} options={[{v:'',l:'— Sélectionner —'},{v:'BMW Motorrad',l:'BMW Motorrad'},{v:'Ducati',l:'Ducati'},{v:'Harley-Davidson',l:'Harley-Davidson'},{v:'Honda',l:'Honda'},{v:'Kawasaki',l:'Kawasaki'},{v:'KTM',l:'KTM'},{v:'Piaggio',l:'Piaggio'},{v:'Suzuki',l:'Suzuki'},{v:'Triumph',l:'Triumph'},{v:'Yamaha',l:'Yamaha'},{v:'Autre',l:'Autre'}]}/>}
        {form.motoSociete&&<I label="Modèle moto" value={form.motoModel||''} onChange={v=>setF({...form,motoModel:v})}/>}
      </div>
      {form.motoSociete&&<div style={{marginTop:8,padding:10,background:"rgba(251,146,60,.04)",borderRadius:8,fontSize:10.5,color:'#fb923c',lineHeight:1.6}}>
        🏍 <b>Moto de société</b> — ATN = valeur catalogue × (6/7) × taux CO2 / 12. Même formule que la voiture (Art. 36 CIR 92). Cotisation CO2 patronale applicable. ATN imposable PP, non soumis ONSS.
      </div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>⛽ Carte carburant / recharge</div>
          <div onClick={()=>setF({...form,carteCarburant:!form.carteCarburant})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.carteCarburant?'rgba(251,146,60,.12)':'rgba(198,163,78,.04)',color:form.carteCarburant?'#fb923c':'#5e5c56',border:'1px solid '+(form.carteCarburant?'rgba(251,146,60,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.carteCarburant?'✅ OUI':'❌ NON'}
          </div>
        </div>
        {form.carteCarburant&&<I label="Budget mensuel carte (€)" type="number" value={form.carteCarburantMois} onChange={v=>setF({...form,carteCarburantMois:v})}/>}
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>🔌 Borne de recharge domicile</div>
          <div onClick={()=>setF({...form,borneRecharge:!form.borneRecharge})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.borneRecharge?'rgba(96,165,250,.12)':'rgba(198,163,78,.04)',color:form.borneRecharge?'#60a5fa':'#5e5c56',border:'1px solid '+(form.borneRecharge?'rgba(96,165,250,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.borneRecharge?'✅ OUI — installée au domicile':'❌ NON'}
          </div>
        </div>
        {form.borneRecharge&&<I label="Coût mensuel borne+élec (€)" type="number" value={form.borneRechargeCoût} onChange={v=>setF({...form,borneRechargeCoût:v})}/>}
      </div>
      {form.carteCarburant&&!form.carFuel!=='none'&&<div style={{marginTop:8,padding:10,background:"rgba(251,146,60,.04)",borderRadius:8,fontSize:10.5,color:'#fb923c',lineHeight:1.6}}>
        ⚠ <b>Carte carburant sans voiture de société</b> — L'avantage est imposable à 100% (ATN = montant total de la carte). Si voiture de société: inclus dans l'ATN voiture (Art. 36§2 CIR).
      </div>}
      <ST>Travailleur frontalier (Règl. 883/2004)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>🌍 Travailleur frontalier</div>
          <div onClick={()=>setF({...form,frontalier:!form.frontalier})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.frontalier?'rgba(168,85,247,.12)':'rgba(198,163,78,.04)',color:form.frontalier?'#a855f7':'#5e5c56',border:'1px solid '+(form.frontalier?'rgba(168,85,247,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.frontalier?'✅ OUI — Réside hors Belgique':'❌ NON — Réside en Belgique'}
          </div>
        </div>
        {form.frontalier&&<I label="Pays de résidence" value={form.frontalierPays||''} onChange={v=>setF({...form,frontalierPays:v})} options={[{v:"FR",l:"🇫🇷 France"},{v:"NL",l:"🇳🇱 Pays-Bas"},{v:"DE",l:"🇩🇪 Allemagne"},{v:"LU",l:"🇱🇺 Luxembourg"}]}/>}
      </div>
      {form.frontalier&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:8}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>Formulaire A1 (détachement)</div>
          <div onClick={()=>setF({...form,frontalierA1:!form.frontalierA1})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.frontalierA1?'rgba(96,165,250,.12)':'rgba(198,163,78,.04)',color:form.frontalierA1?'#60a5fa':'#5e5c56',border:'1px solid '+(form.frontalierA1?'rgba(96,165,250,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.frontalierA1?'✅ A1 en cours':"❌ Pas d'A1"}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>Exonération PP (ancien régime FR)</div>
          <div onClick={()=>setF({...form,frontalierExoPP:!form.frontalierExoPP})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.frontalierExoPP?'rgba(239,68,68,.12)':'rgba(198,163,78,.04)',color:form.frontalierExoPP?'#ef4444':'#5e5c56',border:'1px solid '+(form.frontalierExoPP?'rgba(239,68,68,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.frontalierExoPP?'✅ Exonéré PP (très rare)':'❌ PP retenu en Belgique (normal)'}
          </div>
        </div>
      </div>}
      {form.frontalier&&<div style={{marginTop:8,padding:10,background:"rgba(168,85,247,.04)",borderRadius:8,fontSize:10.5,color:'#a855f7',lineHeight:1.6}}>
        🌍 <b>Frontalier {form.frontalierPays==='FR'?'France':form.frontalierPays==='NL'?'Pays-Bas':form.frontalierPays==='DE'?'Allemagne':form.frontalierPays==='LU'?'Luxembourg':''}</b><br/>
        {form.frontalierPays==='FR'&&'• Convention CPDI BE-FR 10/03/1964. Ancien régime frontalier abrogé 01/01/2012. PP retenu en Belgique. Le travailleur déclare en France avec crédit d\'impôt. Formulaire 276 Front.'}
        {form.frontalierPays==='NL'&&'• Convention CPDI BE-NL 05/06/2001. PP retenu en Belgique. Exemption avec progression aux Pays-Bas. Option: kwalificerend buitenlands belastingplichtige.'}
        {form.frontalierPays==='DE'&&'• Convention CPDI BE-DE 11/04/1967. PP retenu en Belgique. Crédit d\'impôt en Allemagne. Pas de régime frontalier spécial.'}
        {form.frontalierPays==='LU'&&'• Convention CPDI BE-LU 17/09/1970. PP retenu en Belgique. Tolérance 24j/an de télétravail depuis le Luxembourg (accord amiable 2015).'}
        <br/>• ONSS: toujours belge (lex loci laboris — Art. 11 Règl. 883/2004).
        • Limosa: pas nécessaire (le travailleur réside à l'étranger mais travaille en BE avec contrat BE).
      </div>}
      <ST>Travailleur pensionné (Cumul pension-travail)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>👴 Pensionné en activité</div>
          <div onClick={()=>setF({...form,pensionné:!form.pensionné})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.pensionné?'rgba(251,191,36,.15)':'rgba(198,163,78,.04)',color:form.pensionné?'#fbbf24':'#5e5c56',border:'1px solid '+(form.pensionné?'rgba(251,191,36,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.pensionné?'✅ OUI — Bénéficiaire d\'une pension':'❌ NON'}
          </div>
        </div>
        {form.pensionné&&<I label="Type de pension" value={form.pensionType||'none'} onChange={v=>setF({...form,pensionType:v})} options={[{v:"legal",l:"🏛 Pension légale (âge légal)"},{v:"anticipee",l:"⏰ Pension anticipée"},{v:"survie",l:"💐 Pension de survie"},{v:"invalidite",l:"♿ Pension d\'invalidité"}]}/>}
      </div>
      {form.pensionné&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginTop:8}}>
        <I label="Âge" type="number" value={form.pensionAge} onChange={v=>setF({...form,pensionAge:parseInt(v)||0})}/>
        <I label="Années de carrière" type="number" value={form.pensionCarriere} onChange={v=>setF({...form,pensionCarriere:parseInt(v)||0})}/>
        <I label="Pension mensuelle (€)" type="number" value={form.pensionMontant} onChange={v=>setF({...form,pensionMontant:v})}/>
      </div>}
      {form.pensionné&&<div style={{marginTop:8,padding:10,background:"rgba(251,191,36,.04)",borderRadius:8,fontSize:10.5,color:'#fbbf24',lineHeight:1.7}}>
        👴 <b>Cumul pension-travail</b><br/>
        {(form.pensionType==='legal'&&(form.pensionAge||0)>=66)||
         (form.pensionType==='anticipee'&&(form.pensionCarriere||0)>=45)||
         (form.pensionType==='survie'&&(form.pensionAge||0)>=65)
          ?<><span style={{color:'#4ade80',fontWeight:700}}>✅ CUMUL ILLIMITÉ</span> — {form.pensionType==='legal'?'Âge légal 66 ans atteint (AR 20/12/2006)':form.pensionType==='anticipee'?'45 ans de carrière atteints':'Pension de survie ≥ 65 ans'}. Aucun plafond de revenus. Flexi-job: plafond 12.000€ ne s'applique PAS.<br/></>
          :<><span style={{color:'#ef4444',fontWeight:700}}>⚠ CUMUL LIMITÉ</span> — Plafonds annuels bruts ({(form.depChildren||0)>0?'avec':'sans'} enfant à charge):<br/>
            {form.pensionType==='anticipee'&&`• Anticipée: ${(form.depChildren||0)>0?'13.266':'10.613'}€/an brut`}
            {form.pensionType==='survie'&&`• Survie: ${(form.depChildren||0)>0?'28.136':'22.509'}€/an brut`}
            {form.pensionType==='invalidite'&&'• Invalidité: plafonds spécifiques INAMI'}
            <br/>Dépassement = pension réduite du % de dépassement (Art. 64 AR 21/12/1967).<br/></>}
        • ONSS: normal (13,07% travailleur + taux patronal). Pas d'exonération.<br/>
        • PP: barème normal. La pension est imposée séparément par le SFP.<br/>
        • DmfA: déclaration normale. SIGEDIS/SFP vérifie le cumul automatiquement.
      </div>}
      <ST>Situation familiale</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="Situation" value={form.civil} onChange={v=>setF({...form,civil:v})} options={[{v:"single",l:"Isolé"},{v:"married_2",l:"Marié (2 revenus)"},{v:"married_1",l:"Marié (1 revenu)"},{v:"cohabit",l:"Cohabitant légal"}]}/>
        <I label="Enfants à charge" type="number" value={form.depChildren} onChange={v=>setF({...form,depChildren:v})}/>
        <I label="Enfants handicapés" type="number" value={form.handiChildren} onChange={v=>setF({...form,handiChildren:v})}/>
        <I label="Ascendants ≥65 ans à charge" type="number" value={form.depAscendant} onChange={v=>setF({...form,depAscendant:v})}/>
        <I label="Ascendants ≥65 handi." type="number" value={form.depAscendantHandi} onChange={v=>setF({...form,depAscendantHandi:v})}/>
        <I label="Autres pers. à charge" type="number" value={form.depAutres} onChange={v=>setF({...form,depAutres:v})}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:8}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>Conjoint handicapé (Art.132 CIR)</div>
          <div onClick={()=>setF({...form,conjointHandicap:!form.conjointHandicap})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.conjointHandicap?'rgba(248,113,113,.12)':'rgba(198,163,78,.04)',color:form.conjointHandicap?'#f87171':'#5e5c56',border:'1px solid '+(form.conjointHandicap?'rgba(248,113,113,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.conjointHandicap?'✅ OUI — réduction supplémentaire':'❌ NON'}
          </div>
        </div>
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}>
        <B v="outline" onClick={()=>{setF(null);setEd(false);}}>Annuler</B>
        <B onClick={save}>{ed?'Mettre à jour':'Enregistrer'}</B>
      </div>
    </C>}
    {/* GRID VIEW */}
    {viewMode==='grid'&&<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
      {filtered.map((r,i)=>{const p=calc(r,DPER,s.co);return(
        <C key={r.id} style={{padding:'18px 16px',cursor:'pointer',transition:'all .15s',position:'relative',overflow:'hidden'}} 
          onClick={()=>{setF({...r});setEd(true);}}
          onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(198,163,78,.25)'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(139,115,60,.12)'}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:`linear-gradient(135deg,${['#c6a34e',"#60a5fa","#a78bfa","#4ade80","#fb923c","#06b6d4"][i%6]}25,${['#c6a34e',"#60a5fa","#a78bfa","#4ade80","#fb923c","#06b6d4"][i%6]}08)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:['#c6a34e',"#60a5fa","#a78bfa","#4ade80","#fb923c","#06b6d4"][i%6]}}>{(r.first||'')[0]}{(r.last||'')[0]}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13.5,fontWeight:600,color:'#e8e6e0'}}>{r.first} {r.last}</div>
              <div style={{fontSize:10.5,color:'#5e5c56'}}>{r.fn||'—'}</div>
            </div>
            <span style={{fontSize:8.5,padding:'2px 7px',borderRadius:4,fontWeight:600,
              background:r.status==='sorti'?'rgba(248,113,113,.12)':r.contract==='student'?'rgba(251,146,60,.12)':r.statut==='ouvrier'?'rgba(251,146,60,.1)':'rgba(96,165,250,.08)',
              color:r.status==='sorti'?'#f87171':r.contract==='student'?'#fb923c':r.statut==='ouvrier'?'#fb923c':'#60a5fa',
            }}>{r.status==='sorti'?'SORTI':r.contract==='student'?'ÉTUDIANT':r.statut==='ouvrier'?'OUVRIER':'EMPLOYÉ'}</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:11}}>
            <div><span style={{color:'#5e5c56'}}>CP:</span> <span style={{color:'#d4d0c8'}}>{r.cp}</span></div>
            <div><span style={{color:'#5e5c56'}}>Contrat:</span> <span style={{color:'#d4d0c8'}}>{r.contract}</span></div>
            <div><span style={{color:'#5e5c56'}}>Brut:</span> <span style={{color:'#c6a34e',fontWeight:600}}>{fmt(r.monthlySalary)}</span></div>
            <div><span style={{color:'#5e5c56'}}>Net:</span> <span style={{color:'#4ade80',fontWeight:600}}>{fmt(p.net)}</span></div>
          </div>
          <div style={{marginTop:10,display:'flex',gap:6,justifyContent:'flex-end'}}>
            <B v="ghost" style={{padding:'4px 8px',fontSize:10}} onClick={e=>{e.stopPropagation();setF({...r});setEd(true);}}>✎ Modifier</B>
            <B v="danger" style={{padding:'4px 8px',fontSize:10}} onClick={e=>{e.stopPropagation();if(confirm('Supprimer ?'))d({type:"DEL_E",id:r.id});}}>✕</B>
          </div>
        </C>
      );})}
    </div>}
    {/* LIST VIEW */}
    {viewMode==='list'&&<C style={{padding:0,overflow:'hidden'}}>
      <Tbl cols={[
        {k:'n',l:"Employé",r:r=><div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:7,background:"rgba(198,163,78,.06)",display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#c6a34e'}}>{(r.first||'')[0]}{(r.last||'')[0]}</div>
          <div><div style={{fontWeight:500}}>{r.first} {r.last} <span style={{fontSize:8.5,padding:'1px 5px',borderRadius:3,fontWeight:600,background:r.status==='sorti'?'rgba(248,113,113,.12)':r.contract==='student'?'rgba(251,146,60,.12)':r.statut==='ouvrier'?'rgba(251,146,60,.1)':'rgba(96,165,250,.08)',color:r.status==='sorti'?'#f87171':r.contract==='student'?'#fb923c':r.statut==='ouvrier'?'#fb923c':'#60a5fa',marginLeft:4}}>{r.status==='sorti'?'SORTI':r.contract==='student'?'ÉTU':r.statut==='ouvrier'?'OUV':'EMPL'}</span></div><div style={{fontSize:10.5,color:'#5e5c56'}}>{r.niss} · {r.sexe==='F'?'♀':'♂'}</div></div>
        </div>},
        {k:'f',l:"Fonction",r:r=><div>{r.fn}<div style={{fontSize:10.5,color:'#5e5c56'}}>{r.dept}</div></div>},
        {k:'c',l:"Contrat",r:r=><span style={{fontSize:12}}>{r.contract} · {r.whWeek}h</span>},
        {k:'cp',l:"CP",r:r=>r.cp},
        {k:'g',l:"Brut",a:'right',r:r=><span style={{fontWeight:600}}>{fmt(r.monthlySalary)}</span>},
        {k:'ne',l:"Net",a:'right',r:r=><span style={{fontWeight:600,color:'#4ade80'}}>{fmt(calc(r,DPER,s.co).net)}</span>},
        {k:'co',l:"Coût",a:'right',r:r=><span style={{color:'#a78bfa'}}>{fmt(calc(r,DPER,s.co).costTotal)}</span>},
        {k:'a',l:"",a:'right',r:r=><div style={{display:'flex',gap:5,justifyContent:'flex-end'}}>
          <B v="ghost" style={{padding:'4px 8px',fontSize:10}} onClick={e=>{e.stopPropagation();setF({...r});setEd(true);}}>✎</B>
          <B v="danger" style={{padding:'4px 8px',fontSize:10}} onClick={e=>{e.stopPropagation();if(confirm('Supprimer ?'))d({type:"DEL_E",id:r.id});}}>✕</B>
        </div>},
      ]} data={filtered}/>
    </C>}
    {filtered.length===0&&search&&<div style={{textAlign:'center',padding:40,color:'#5e5c56',fontSize:13}}>Aucun employé trouvé pour "{search}"</div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  PAYSLIPS
// ═══════════════════════════════════════════════════════════════


export default Employees;
