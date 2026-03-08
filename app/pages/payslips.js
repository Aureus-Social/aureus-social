'use client';
import { useLang } from '../lib/lang-context';
import { B, BAREMES_CP_MIN, BONUS_MAX, BONUS_SEUIL1, BONUS_SEUIL2, C, CO2MIN, CR_MAX, CR_PAT, DPER, ECO_MAX, FORF_BUREAU, FORF_KM, I, LB, LEGAL, LOIS_BELGES, NET_FACTOR, PH, PP_EST, PV_DOUBLE, PV_SIMPLE, RMMMG, AF_REGIONS, SAISIE_2026_TRAVAIL, SAISIE_IMMUN_ENFANT_2026, ST, TX_ONSS_E, TX_ONSS_W, TX_OUV108, Tbl, calc, f0, f2, fmt, generatePayslipPDF } from '@/app/lib/helpers';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const fmtP = n => `${((n||0)*100).toFixed(2)}%`;
const uid = () => `${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
const MN_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MN = MN_FR;




function escapeHtml(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function Payslips({s,d,scrollAnchor,onAnchorHandled}) {
  const { t, lang } = useLang();
  s=s||{emps:[],clients:[],co:{name:"",vat:""},payrollHistory:[],dimonaHistory:[]};
  const [eid,setEid]=useState(s.selectedEmpIdForPayslip||(s?.emps||[])[0]?.id||'');
  const [per,setPer]=useState({...DPER});
  const [res,setRes]=useState(null);
  const [batchMode,setBatchMode]=useState(false);
  const [batchResults,setBatchResults]=useState([]);
  const [batchRunning,setBatchRunning]=useState(false);
  const emp=(s?.emps||[]).find(e=>e.id===eid);
  // Scroll vers une section quand scrollAnchor est défini
  useEffect(()=>{
    if(!scrollAnchor) return;
    const el=document.getElementById(scrollAnchor);
    if(el){el.scrollIntoView({behavior:'smooth',block:'start'});}
    if(onAnchorHandled) setTimeout(onAnchorHandled,500);
  },[scrollAnchor]);
  // Préremplir Activation ONEM depuis la fiche employé quand on change d'employé
  useEffect(()=>{
    if(emp&&(emp.allocTravailType||'none')!=='none')
      setPer(prev=>({...prev,allocTravailType:emp.allocTravailType||prev.allocTravailType,allocTravail:emp.allocTravail||prev.allocTravail||0}));
  },[eid]);

  // ── BATCH PROCESSING ──
  const runBatch=()=>{
    setBatchRunning(true);
    const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status);
    const results=[];
    for(const emp of ae){
      try{
        const r=calc(emp,per,s.co);
        d({type:"ADD_P",d:{eid:emp.id,ename:`${emp.first||emp.fn||emp.prenom||''} ${emp.last||emp.ln||emp.nom||''}`.trim()||'Sans nom',period:`${MN[per.month-1]} ${per.year}`,month:per.month,year:per.year,...r,at:new Date().toISOString(),batch:true}});
        results.push({emp,r,ok:true});
      }catch(e){
        results.push({emp,error:e.message,ok:false});
      }
    }
    setBatchResults(results);
    setBatchRunning(false);
    const ok=results.filter(r=>r.ok).length;
    const fail=results.filter(r=>!r.ok).length;
    alert(`✅ Batch terminé: ${ok} fiches calculées${fail>0?`, ${fail} erreurs`:''}`);
  };

  const gen=()=>{if(!emp)return;const r=calc(emp,per,s.co);setRes(r);
    d({type:"ADD_P",d:{eid:emp.id,ename:`${emp.first||emp.fn||emp.prenom||''} ${emp.last||emp.ln||emp.nom||''}`.trim()||'Sans nom',period:`${MN[per.month-1]} ${per.year}`,month:per.month,year:per.year,...r,at:new Date().toISOString()}});};

  const PR=({l,rate,a,bold,neg,pos,sub})=><tr>
    <td style={{padding:'5px 0',fontWeight:bold?700:400,fontSize:sub?10.5:12,color:sub?'#999':'#333',fontStyle:sub?'italic':'normal'}}>{l}</td>
    <td style={{textAlign:'right',padding:'5px 0',color:'#999',fontSize:10.5}}>{rate||''}</td>
    <td style={{textAlign:'right',padding:'5px 0',fontWeight:bold?700:400,color:neg?'#dc2626':pos?'#16a34a':sub?'#999':'#333'}}>{neg&&a!==0?'- ':''}{fmt(Math.abs(a||0))}</td>
  </tr>;
  const PS=({t})=><tr style={{background:"#f8f7f2"}}><td colSpan={3} style={{padding:'11px 0 5px',fontWeight:700,fontSize:10.5,color:'#c6a34e',textTransform:'uppercase',letterSpacing:'1px'}}>{t}</td></tr>;

  return <div>
    <PH title="Fiches de Paie" sub="Formule-clé SPF Finances" actions={<div style={{display:'flex',gap:8}}>
      <B v={batchMode?'gold':'outline'} onClick={()=>setBatchMode(!batchMode)} style={{fontSize:11,padding:'8px 14px'}}>{batchMode?'⚡ Mode Batch ON':'⚡ Batch'}</B>
    </div>}/>
    <div style={{marginBottom:14,padding:'10px 14px',background:'linear-gradient(135deg,rgba(198,163,78,.06),rgba(198,163,78,.02))',border:'1px solid rgba(198,163,78,.1)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{fontSize:11,color:'#888'}}>⚡ Auto-génération disponible</div>
      <button onClick={()=>{if(confirm('Générer les fiches de paie pour tous les employés ?')){(s?.emps||[]).forEach(e=>generatePayslipPDF(e,s.co));alert('✅ Fiches générées')}}} style={{padding:'6px 14px',borderRadius:8,border:'none',background:'#c6a34e',color:'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>⚡ Générer tout</button>
    </div>
    {/* Batch Mode */}
    {batchMode&&<C style={{marginBottom:18,border:'1px solid rgba(198,163,78,.25)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <div style={{fontSize:15,fontWeight:600,color:'#c6a34e'}}>⚡ Batch Processing — Calcul en masse</div>
          <div style={{fontSize:11,color:'#5e5c56',marginTop:2}}>Calcule toutes les fiches de paie des travailleurs actifs en 1 clic</div>
        </div>
        <B onClick={runBatch} disabled={batchRunning} style={{fontSize:13,padding:'12px 24px'}}>
          {batchRunning?'⏳ Calcul en cours...':'⚡ Lancer le batch ('+(s?.emps||[]).filter(e=>e.status==='active'||!e.status).length+' fiches)'}
        </B>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
        <I label="Mois" value={per.month} onChange={v=>setPer({...per,month:parseInt(v)})} options={MN.map((m,i)=>({v:i+1,l:m}))}/>
        <I label="Année" type="number" value={per.year} onChange={v=>setPer({...per,year:v})}/>
        <div style={{padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,textAlign:'center'}}>
          <div style={{fontSize:10,color:'#9e9b93'}}>Travailleurs actifs</div>
          <div style={{fontSize:22,fontWeight:700,color:'#c6a34e'}}>{(s?.emps||[]).filter(e=>e.status==='active'||!e.status).length}</div>
        </div>
      </div>
      {batchResults.length>0&&<div>
        <ST>Résultats du batch</ST>
        <div style={{maxHeight:300,overflowY:'auto'}}>
          {batchResults.map((br,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',borderRadius:6,marginBottom:4,background:br.ok?'rgba(74,222,128,.04)':'rgba(248,113,113,.04)',border:'1px solid '+(br.ok?'rgba(74,222,128,.1)':'rgba(248,113,113,.1)')}}>
            <span style={{fontSize:12,color:br.ok?'#4ade80':'#f87171'}}>{br.ok?'✅':'❌'} {br.emp.first} {br.emp.last}</span>
            {br.ok&&<span style={{fontSize:12,color:'#c6a34e',fontFamily:'monospace'}}>{fmt(br.r.gross)} brut → {fmt(br.r.net)} net</span>}
            {!br.ok&&<span style={{fontSize:11,color:'#f87171'}}>{br.error}</span>}
          </div>)}
        </div>
        <div style={{marginTop:8,padding:10,background:'rgba(198,163,78,.06)',borderRadius:8,display:'flex',justifyContent:'space-between'}}>
          <span style={{fontSize:12,color:'#c6a34e',fontWeight:600}}>Total masse salariale</span>
          <span style={{fontSize:14,fontWeight:700,color:'#c6a34e'}}>{fmt(batchResults.filter(r=>r.ok).reduce((a,r)=>a+r.r.gross,0))} brut → {fmt(batchResults.filter(r=>r.ok).reduce((a,r)=>a+r.r.net,0))} net</span>
        </div>
      </div>}
    </C>}
    <div style={{display:'grid',gridTemplateColumns:res?'360px 1fr':'1fr',gap:18}}>
      <C>
        <ST>Paramètres</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          <I label="Employé" value={eid} onChange={setEid} options={(s?.emps||[]).map(e=>({v:e.id,l:`${e.first||e.fn||'Emp'} ${e.last||''}`}))} span={2}/>
          <I label="Mois" value={per.month} onChange={v=>setPer({...per,month:parseInt(v)})} options={MN.map((m,i)=>({v:i+1,l:m}))}/>
          <I label="Année" type="number" value={per.year} onChange={v=>setPer({...per,year:v})}/>
          <I label="Jours prestés" type="number" value={per.days} onChange={v=>setPer({...per,days:v})}/>
          <I label="H. sup." type="number" value={per.overtimeH} onChange={v=>setPer({...per,overtimeH:v})}/>
          <I label="H. dimanche" type="number" value={per.sundayH} onChange={v=>setPer({...per,sundayH:v})}/>
          <I label="H. nuit" type="number" value={per.nightH} onChange={v=>setPer({...per,nightH:v})}/>
          <I label="Maladie (j garanti)" type="number" value={per.sickG} onChange={v=>setPer({...per,sickG:v})}/>
          <I label="Prime (€)" type="number" value={per.bonus} onChange={v=>setPer({...per,bonus:v})}/>
          <I label="13ème mois (€)" type="number" value={per.y13} onChange={v=>setPer({...per,y13:v})}/>
          <I label="Acompte (€)" type="number" value={per.advance} onChange={v=>setPer({...per,advance:v})}/>
          <I label="Saisie (€)" type="number" value={per.garnish} onChange={v=>setPer({...per,garnish:v})}/>
          <I label="PP volontaire (€)" type="number" value={per.ppVolontaire} onChange={v=>setPer({...per,ppVolontaire:v})}/>
          <I label="Autres ret. (€)" type="number" value={per.otherDed} onChange={v=>setPer({...per,otherDed:v})}/>
        </div>
        <ST style={{marginTop:14}}>Éléments fiscaux spéciaux</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          <I label="Double pécule vac. (€)" type="number" value={per.doublePecule} onChange={v=>setPer({...per,doublePecule:v})}/>
          <I label="Pécule départ (€)" type="number" value={per.peculeDepart} onChange={v=>setPer({...per,peculeDepart:v})}/>
          <I label="Prime ancienneté (€)" type="number" value={per.primeAnciennete} onChange={v=>setPer({...per,primeAnciennete:v})}/>
          <I label="Prime naissance/mariage (€)" type="number" value={per.primeNaissance} onChange={v=>setPer({...per,primeNaissance:v})}/>
          <I label="Prime innovation (€)" type="number" value={per.primeInnovation} onChange={v=>setPer({...per,primeInnovation:v})}/>
          <I label="Indem. télétravail (€)" type="number" value={per.indemTeletravail} onChange={v=>setPer({...per,indemTeletravail:v})}/>
          <I label="Indem. bureau (€)" type="number" value={per.indemBureau} onChange={v=>setPer({...per,indemBureau:v})}/>
          <I label="H.sup fiscales (180h)" type="number" value={per.heuresSupFisc} onChange={v=>setPer({...per,heuresSupFisc:v})}/>
          <I label="HS volont. brut=net (h)" type="number" value={per.hsVolontBrutNet} onChange={v=>setPer({...per,hsVolontBrutNet:v})}/>
          <I label="HS relance T1 (h)" type="number" value={per.hsRelance} onChange={v=>setPer({...per,hsRelance:v})}/>
          <I label="Pension compl. ret. (€)" type="number" value={per.pensionCompl} onChange={v=>setPer({...per,pensionCompl:v})}/>
          <I label="Cotis. syndicale (€)" type="number" value={per.retSyndicale} onChange={v=>setPer({...per,retSyndicale:v})}/>
          <I label="Pension aliment. (€)" type="number" value={per.saisieAlim} onChange={v=>setPer({...per,saisieAlim:v})}/>
          <I label="Type spécial" value={per.typeSpecial||'normal'} onChange={v=>setPer({...per,typeSpecial:v})} options={[{v:"normal",l:"Normal"},{v:"doublePecule",l:"Double pécule"},{v:"y13",l:"13ème mois"},{v:"depart",l:"Sortie de service"},{v:"preavis",l:"Indemnité de préavis"}]}/>
          <I label="Petit chômage (jours)" type="number" value={per.petitChomage} onChange={v=>setPer({...per,petitChomage:v})}/>
          <I label="Éco-chèques (€)" type="number" value={per.ecoCheques} onChange={v=>setPer({...per,ecoCheques:v})}/>
          <I label="Cadeaux/événements (€)" type="number" value={per.cadeaux} onChange={v=>setPer({...per,cadeaux:v})}/>
          <I label="Budget mobilité P2 (€)" type="number" value={per.budgetMobP2} onChange={v=>setPer({...per,budgetMobP2:v})}/>
          <I label="Budget mobilité P3 (€)" type="number" value={per.budgetMobP3} onChange={v=>setPer({...per,budgetMobP3:v})}/>
          <I label="Réd. trav. âgé 55+ (€)" type="number" value={per.redGCAge} onChange={v=>setPer({...per,redGCAge:v})}/>
          <I label="Réd. jeune <26 (€)" type="number" value={per.redGCJeune} onChange={v=>setPer({...per,redGCJeune:v})}/>
          <I label="Réd. handicap (€)" type="number" value={per.redGCHandicap} onChange={v=>setPer({...per,redGCHandicap:v})}/>
          <I label="Activation ONEM" value={per.allocTravailType||emp?.allocTravailType||'none'} onChange={v=>setPer({...per,allocTravailType:v,allocTravail:0})} options={[{v:"none",l:"— Aucune —"},{v:"activa_bxl",l:"Activa.brussels (€350/m)"},{v:"activa_bxl_ap",l:"Activa.brussels AP (350→800→350)"},{v:"activa_jeune",l:"Activa Jeunes <30 (€350/m)"},{v:"impulsion_wal",l:"Impulsion Wallonie (€500/m)"},{v:"impulsion55",l:"Impulsion 55+ (€500/m)"},{v:"sine",l:"SINE écon. sociale (€500/m)"},{v:"vdab",l:"VDAB (prime directe)"},{v:"art60",l:"Art. 60 §7 (1er emploi)"}]}/>
          {per.allocTravailType&&per.allocTravailType!=='none'&&<I label="Montant alloc. ONEM (€)" type="number" value={per.allocTravail} onChange={v=>setPer({...per,allocTravail:v})}/>}
        </div>
        <ST style={{marginTop:14}}>Mi-temps médical / thérapeutique</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          <div style={{gridColumn:'1/-1'}}><div onClick={()=>setPer({...per,miTempsMed:!per.miTempsMed})} style={{padding:'10px 14px',borderRadius:8,cursor:'pointer',fontSize:12,
            background:per.miTempsMed?'rgba(251,146,60,.1)':'rgba(198,163,78,.04)',color:per.miTempsMed?'#fb923c':'#5e5c56',border:'1px solid '+(per.miTempsMed?'rgba(251,146,60,.25)':'rgba(198,163,78,.1)'),textAlign:'center',fontWeight:600}}>
            {per.miTempsMed?'⚕ MI-TEMPS MÉDICAL / THÉRAPEUTIQUE — Reprise progressive INAMI (Art. 100§2)':'❌ Pas de mi-temps médical / thérapeutique'}
          </div></div>
          {per.miTempsMed&&<><I label="Heures/sem prestées" type="number" value={per.miTempsHeures} onChange={v=>setPer({...per,miTempsHeures:v})}/>
          <I label="Complément INAMI (€/mois)" type="number" value={per.miTempsINAMI} onChange={v=>setPer({...per,miTempsINAMI:v})}/>
          <div style={{gridColumn:'1/-1',padding:10,background:"rgba(96,165,250,.04)",borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.6}}>
            ⚕ <b>Reprise progressive</b> — Le travailleur preste {per.miTempsHeures||0}h/{emp?.whWeek||38}h = <b>{Math.round((per.miTempsHeures||0)/(emp?.whWeek||38)*100)}%</b>. L'employeur paie le salaire prorata. L'INAMI verse le complément directement au travailleur via la mutuelle. Documents: C3.2 (médecin-conseil) + DRS (eBox).
          </div></>}
        </div>
        <B onClick={gen} style={{width:'100%',marginTop:14,padding:13,fontSize:13.5,letterSpacing:'.5px'}}>GÉNÉRER LA FICHE DE PAIE</B>
      </C>

      {res&&emp&&<div data-payslip style={{background:"#fffef9",borderRadius:14,padding:'32px 36px',color:'#1a1a18',fontFamily:"'Outfit',sans-serif",boxShadow:'0 4px 30px rgba(0,0,0,.3)'}}><div style={{textAlign:"right",marginBottom:12}}><button onClick={()=>generatePayslipPDF(emp,res,per,s.co)} style={{background:"#c6a34e",color:"#fff",border:"none",padding:"8px 20px",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:600}}>Imprimer / PDF</button></div>
        <div style={{display:'flex',justifyContent:'space-between',paddingBottom:18,borderBottom:'3px solid #c6a34e',marginBottom:22}}>
          <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700}}>{s.co.name}</div><div style={{fontSize:10.5,color:'#888',marginTop:2}}>{s.co.addr}</div><div style={{fontSize:10.5,color:'#888'}}>TVA: {s.co.vat} · BCE: {s.co.bce||s.co.vat?.replace(/^BE\s?/,"")||'—'} · ONSS: {s.co.onss}</div><div style={{fontSize:10.5,color:'#888'}}>CP: {emp.cp||s.co.cp||'200'} — {LEGAL.CP[emp.cp||s.co.cp||'200']||''}</div></div>
          <div style={{textAlign:'right'}}><div style={{fontSize:14,fontWeight:700,color:'#c6a34e',textTransform:'uppercase',letterSpacing:'2px'}}>Fiche de Paie</div><div style={{fontSize:12.5,color:'#888',marginTop:3}}>{MN[per.month-1]} {per.year}</div><div style={{fontSize:10,color:'#aaa',marginTop:2}}>Période du 01/{String(per.month).padStart(2,"0")}/{per.year} au {new Date(per.year,per.month,0).getDate()}/{String(per.month).padStart(2,"0")}/{per.year}</div><div style={{fontSize:10,color:'#aaa'}}>Date de paiement: dernier jour ouvrable du mois</div></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:20,padding:14,background:"#f5f4ef",borderRadius:8}}>
          <div><div style={{fontSize:9.5,color:'#aaa',textTransform:'uppercase',letterSpacing:'1px',marginBottom:3}}>Travailleur</div><div style={{fontWeight:600,fontSize:13.5}}>{emp.first} {emp.last}</div><div style={{fontSize:10.5,color:'#666'}}>{emp.fn} — {emp.dept}</div><div style={{fontSize:10.5,color:'#666'}}>NISS: {emp.niss}{emp.birth?` · Né(e) le ${emp.birth}`:''}</div><div style={{fontSize:10.5,color:'#666'}}>{emp.addr?`${emp.addr}, ${emp.zip||''} ${emp.city||''}`:''}</div></div>
          <div><div style={{fontSize:9.5,color:'#aaa',textTransform:'uppercase',letterSpacing:'1px',marginBottom:3}}>Contrat & Barème</div><div style={{fontSize:10.5,color:'#555'}}>{emp.contract} · CP {emp.cp} · {emp.whWeek}h/sem · {emp.statut==='ouvrier'?'Ouvrier':'Employé'}</div><div style={{fontSize:10.5,color:'#555'}}>Entrée: {emp.startD} · Ancienneté: {emp.anciennete||0} an(s)</div><div style={{fontSize:10.5,color:'#555'}}>Sit: {emp.civil==='single'?'Isolé':emp.civil==='married_1'?'Marié (1 revenu)':emp.civil==='married_2'?'Marié (2 revenus)':emp.civil==='cohabit'?'Cohabitant':emp.civil==='widowed'?'Veuf/ve':emp.civil}{emp.depChildren>0?` · ${emp.depChildren} enfant(s)`:''}</div><div style={{fontSize:10.5,color:'#555'}}>Barème: {fmt(emp.monthlySalary)}/mois · {fmt(Math.round((emp.monthlySalary||0)/(emp.whWeek||38)/4.33*100)/100)}/h · {per.days||0}j / {Math.round((per.days||0)*(emp.whWeek||38)/5*100)/100}h prestées</div>
            {emp.frontalier&&<div style={{fontSize:10.5,color:'#a855f7',fontWeight:600}}>🌍 Frontalier — Réside: {emp.frontalierPays==='FR'?'France':emp.frontalierPays==='NL'?'Pays-Bas':emp.frontalierPays==='DE'?'Allemagne':emp.frontalierPays==='LU'?'Luxembourg':emp.frontalierPays} · ONSS: Belgique · PP: {emp.frontalierExoPP?'Exonéré (276 Front.)':'Retenu en Belgique'}</div>}
            {emp.pensionné&&<div style={{fontSize:10.5,color:'#fbbf24',fontWeight:600}}>👴 Pensionné ({emp.pensionType==='legal'?'pension légale':emp.pensionType==='anticipee'?'pension anticipée':emp.pensionType==='survie'?'pension de survie':'pension invalidité'}) — Cumul: {res.pensionCumulIllimite?'ILLIMITÉ':'LIMITÉ (plafond '+fmt(res.pensionPlafond)+'/an)'}{res.pensionDepassement?' ⚠ DÉPASSEMENT ESTIMÉ: '+res.pensionDepassPct+'%':''}</div>}
          </div>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr style={{borderBottom:'2px solid #c6a34e'}}><th style={{textAlign:'left',padding:'7px 0',fontSize:9.5,textTransform:'uppercase',letterSpacing:'1px',color:'#999'}}>Description</th><th style={{textAlign:'right',padding:'7px 0',fontSize:9.5,textTransform:'uppercase',letterSpacing:'1px',color:'#999'}}>Taux</th><th style={{textAlign:'right',padding:'7px 0',fontSize:9.5,textTransform:'uppercase',letterSpacing:'1px',color:'#999'}}>Montant</th></tr></thead>
          <tbody>
            <PS t="Rémunération brute"/>
            {res.isFlexiJob&&<tr><td colSpan={3} style={{padding:'6px 0 8px',fontSize:11,color:'#4ade80',fontWeight:600,background:"rgba(74,222,128,.05)",borderRadius:4}}>🔄 FLEXI-JOB — Loi 16/11/2015 · Net = Brut · ONSS trav. 0% · PP 0% · ONSS empl. 28%</td></tr>}
            {res.isFlexiJob&&<><PR l={`Flexi-salaire (${res.flexiHeures}h × ${fmt(res.flexiSalaireH)}/h)`} a={res.flexiBrut}/>
              <PR l="Flexi-pécule vacances (7,67%)" a={res.flexiPecule} pos/>
              <PR l="TOTAL FLEXI BRUT" a={res.gross} bold/>
              <PS t="Cotisations"/>
              <PR l="ONSS travailleur" rate="0%" a={0}/>
              <PR l="Précompte professionnel" rate="0%" a={0}/>
              <PR l="Cotisation spéciale SS" rate="0%" a={0}/>
              <PS t="Coût employeur"/>
              <PR l="ONSS patronal spécial (28%)" a={-res.flexiOnssPatronal} neg/>
            </>}
            {!res.isFlexiJob&&<>
            {res.miTempsMed&&<tr><td colSpan={3} style={{padding:'6px 0 8px',fontSize:11,color:'#fb923c',fontWeight:600,background:"rgba(251,146,60,.05)",borderRadius:4}}>⚕ REPRISE PROGRESSIVE — Mi-temps médical / thérapeutique (Art. 100§2 Loi coord. 14/07/1994) — Fraction: {Math.round(res.miTempsFraction*100)}% ({res.miTempsHeures}h/{emp.whWeek||38}h)</td></tr>}
            <PR l="Salaire de base" a={res.base}/>
            {res.miTempsMed&&<PR l={`  └ Brut normal: ${fmt(res.miTempsBrutOriginal)} × ${Math.round(res.miTempsFraction*100)}% prorata`} a={res.base} sub/>}
            {res.overtime>0&&<PR l="Heures sup. (150%)" rate={`${per.overtimeH}h`} a={res.overtime}/>}
            {res.sunday>0&&<PR l="Dimanche (200%)" rate={`${per.sundayH}h`} a={res.sunday}/>}
            {res.night>0&&<PR l="Nuit (125%)" rate={`${per.nightH}h`} a={res.night}/>}
            {res.bonus>0&&<PR l="Prime" a={res.bonus}/>}
            {res.y13>0&&<PR l="Prime fin d'année" a={res.y13}/>}
            {res.sickPay>0&&<PR l="Salaire garanti maladie" a={res.sickPay}/>}
            <PR l="TOTAL BRUT" a={res.gross} bold/>
            {emp.statut==='ouvrier'&&<>
              <tr><td colSpan={3} style={{padding:'4px 0 2px',fontSize:10,color:'#fb923c',fontStyle:'italic'}}>
                Ouvrier — Base ONSS = brut × 108% = {fmt(res.gross)} × 1,08 = <b>{fmt(res.gross*TX_OUV108)}</b> (compensation pécule vacances simple — Art. 23 AR 28/11/1969)
              </td></tr>
              {res.cotisVacOuv>0&&<PR l={`Cotisation vacances ouvrier (15,84% sur brut 108%)`} a={-res.cotisVacOuv} neg/>}
            </>}
            {res.atnCar>0&&<><PS t="Avantage de toute nature (ATN)"/>
            <PR l={`ATN voiture de société (${emp.carBrand||''} ${emp.carModel||''} — ${emp.carCO2||0}g CO2)`} rate={`${(res.atnPct||0).toFixed(1)}%`} a={res.atnCar}/>
            <PR l="ATN ajouté au revenu imposable" a={res.atnCar} sub/></>}
            {(res.atnAutresTot>0&&!res.atnCar)&&<PS t="Avantages de toute nature (ATN)"/>}
            {res.atnGSM>0&&<PR l="ATN GSM/Téléphone (forfait 36€/an)" a={res.atnGSM}/>}
            {res.atnPC>0&&<PR l="ATN PC/Tablette (forfait 72€/an)" a={res.atnPC}/>}
            {res.atnInternet>0&&<PR l="ATN Internet privé (forfait 60€/an)" a={res.atnInternet}/>}
            {res.atnLogement>0&&<PR l="ATN Logement gratuit (RC × coeff.)" a={res.atnLogement}/>}
            {res.atnChauffage>0&&<PR l="ATN Chauffage gratuit (2.130€/an)" a={res.atnChauffage}/>}
            {res.atnElec>0&&<PR l="ATN Électricité gratuite (1.060€/an)" a={res.atnElec}/>}
            {res.atnMoto>0&&<PR l={`ATN moto de société (${emp.motoBrand||''} ${emp.motoModel||''} — ${emp.motoCO2||0}g CO2)`} rate={`${(res.atnPctMoto||0).toFixed(1)}%`} a={res.atnMoto}/>}
            {res.veloSociete&&<PR l={`🚲 Vélo de société (${res.veloType}) — ATN = 0€ (Art.38§1er 14°a — exonéré)`} a={0}/>}
            {res.atnCarteCarburant>0&&<PR l="ATN Carte carburant (sans voiture soc. — imposable)" a={res.atnCarteCarburant}/>}
            {res.atnBorne>0&&<PR l="ATN Borne recharge domicile (sans voiture soc.)" a={res.atnBorne}/>}
            {res.atnAutresTot>0&&<PR l="Total ATN autres (ajouté au revenu imposable)" a={res.atnAutresTot} sub/>}
            <PS t="Cotisations ONSS"/>
            <PR l={`ONSS travailleur (${fmtP(LEGAL.ONSS_W)} sur ${emp.statut==='ouvrier'?'brut 108% = '+fmt(res.gross*TX_OUV108):'brut '+fmt(res.gross)})`} rate={fmtP(LEGAL.ONSS_W)} a={-res.onssW} neg/>
            {res.empBonus>0&&<PR l={`Bonus à l'emploi social (réduction ONSS bas salaires — AR 21/12/2017)`} a={res.empBonus} pos/>}
            {res.empBonusA>0&&<PR l={`  └ Volet A (bas salaires): ${fmt(res.empBonusA)}`} a={res.empBonusA} pos sub/>}
            {res.empBonusB>0&&<PR l={`  └ Volet B (très bas salaires): ${fmt(res.empBonusB)}`} a={res.empBonusB} pos sub/>}
            <PR l={`ONSS net à retenir (${fmt(res.onssW)} − ${fmt(res.empBonus)} bonus)`} a={-res.onssNet} bold neg/>
            {res.redStructMois>0&&<PR l={`Réduction structurelle patronale (Cat ${res.redStructCat}${res.redStructFraction<1?' × '+Math.round(res.redStructFraction*100)+'% TP':''})`} a={res.redStructMois} pos/>}
            {res.empBonusFisc>0&&<PR l={`Bonus emploi fiscal (réduction PP: volet A ${fmtP(0.3314)} + volet B ${fmtP(0.5254)})`} a={res.empBonusFisc} pos/>}
            <PS t="Fiscalité (Formule-clé SPF)"/>
            <PR l="Revenu imposable" a={res.taxGross} sub/>
            <PR l="Frais prof. forfaitaires" a={-res.profExp} sub/>
            <PR l="Base taxable" a={res.taxNet} sub/>
            <PR l="Impôt (barème progressif)" a={-res.baseTax} neg/>
            {res.famRed>0&&<PR l="Réductions familiales (Art.132-140 CIR)" a={res.famRed} pos/>}
            <PR l="Précompte professionnel" a={-res.tax} bold neg/>
            {res.ppVolontaire>0&&<PR l="Précompte volontaire (Art. 275§1 CIR 92 — demande écrite travailleur)" a={-res.ppVolontaire} neg/>}
            <PR l="Cotisation spéciale SS" a={-res.css} neg/>
            <PS t="Retenues & Avantages"/>
            {res.mvWorker>0&&<PR l={`Chèques repas (${res.mvDays}j)`} a={-res.mvWorker} neg/>}
            {res.transport>0&&<PR l={`Transport dom.-travail (${res.transportDetail||emp.commType})`} a={res.transport} pos/>}
            {res.transport>0&&emp.commType==='bike'&&<tr><td colSpan={3} style={{padding:'2px 0 6px',fontSize:9.5,color:'#4ade80',fontStyle:'italic'}}>🚲 Total: {((emp.commDist||0)*2*(per.days||21))} km/mois ({emp.commDist} km × 2 A/R × {per.days||21} jours) — Exonéré ONSS et IPP (Art. 38§1er 14° CIR)</td></tr>}
            {res.expense>0&&<PR l="Frais propres employeur" a={res.expense} pos/>}
            {res.indemTeletravail>0&&<PR l="Indemnité télétravail (exonérée — max 154,74€)" a={res.indemTeletravail} pos/>}
            {res.indemBureau>0&&<PR l="Indemnité frais de bureau (exonérée)" a={res.indemBureau} pos/>}
            {res.garnish>0&&<PR l="Saisie sur salaire" a={-res.garnish} neg/>}
            {res.saisieAlim>0&&<PR l="Pension alimentaire (prioritaire — Art.1409 C.jud.)" a={-res.saisieAlim} neg/>}
            {res.advance>0&&<PR l="Acompte" a={-res.advance} neg/>}
            {res.pensionCompl>0&&<PR l="Retenue pension complémentaire (2è pilier — LPC)" a={-res.pensionCompl} neg/>}
            {res.retSyndicale>0&&<PR l="Cotisation syndicale" a={-res.retSyndicale} neg/>}
            {res.otherDed>0&&<PR l="Autres retenues" a={-res.otherDed} neg/>}
            {res.atnCar>0&&<PR l="ATN voiture (déduit du net)" a={-res.atnCar} neg/>}
            {res.atnMoto>0&&<PR l="ATN moto (déduit du net)" a={-res.atnMoto} neg/>}
            {res.atnAutresTot>0&&<PR l="ATN autres (déduit du net)" a={-res.atnAutresTot} neg/>}
            {(res.doublePecule>0||res.peculeDepart>0||res.primeAnciennete>0||res.primeNaissance>0||res.primeInnovation>0)&&<PS t="Éléments exceptionnels"/>}
            {res.doublePecule>0&&<><PR l="Double pécule vacances (92% brut)" a={res.doublePecule} pos/>
              <PR l="  └ ONSS sur 2ème partie (7% × 13,07%)" a={-res.dpOnss} neg sub/>
              <PR l="  └ Cotisation spéciale 1%" a={-res.dpCotisSpec} neg sub/></>}
            {res.peculeDepart>0&&<><PR l="Pécule vacances de départ (Art.46)" a={res.peculeDepart} pos/>
              <PR l="  └ ONSS 13,07% sur pécule départ" a={-res.pdOnss} neg sub/></>}
            {res.primeAnciennete>0&&<><PR l={`Prime ancienneté (${emp.anciennete||0} ans)`} a={res.primeAnciennete}/>
              {res.primeAncExoneree>0&&<PR l="  └ Dont exonéré ONSS+IPP (Art.19§2 14°)" a={res.primeAncExoneree} pos sub/>}
              {res.primeAncTaxable>0&&<PR l="  └ Dont taxable" a={res.primeAncTaxable} sub/>}</>}
            {res.primeNaissance>0&&<PR l="Prime naissance/mariage (avantage social — exo)" a={res.primeNaissance} pos/>}
            {res.primeInnovation>0&&<PR l="Prime innovation (Art.38§1er 25° CIR — exo IPP)" a={res.primeInnovation} pos/>}
            {res.redPPHeuresSup>0&&<PS t="Réductions fiscales"/>}
            {res.redPPHeuresSup>0&&<PR l={`Réd. PP heures sup. (${res.heuresSupFisc}h × 66,81% — Art.154bis)`} a={res.redPPHeuresSup} pos/>}
            {res.ppTauxExcep>0&&<PR l={`PP taux exceptionnel ${(res.ppTauxExcepRate*100).toFixed(2)}% (AR 09/01/2024 ann.III)`} a={-res.ppTauxExcep} neg/>}
            {res.petitChomageVal>0&&<><PS t="Absences rémunérées"/>
              <PR l={`Petit chômage / Congé circonstanciel (${res.petitChomage}j — AR 28/08/1963)`} a={res.petitChomageVal} pos/></>}
            {(res.ecoCheques>0||res.cadeaux>0||res.budgetMobPilier2>0)&&<PS t="Avantages exonérés"/>}
            {res.ecoCheques>0&&<PR l="Éco-chèques (CCT 98 — max 250€/an — exo ONSS+IPP)" a={res.ecoCheques} pos/>}
            {res.cadeaux>0&&<PR l="Cadeaux/événements (exo si ≤ plafond — Circ. ONSS)" a={res.cadeaux} pos/>}
            {res.budgetMobPilier2>0&&<PR l="Budget mobilité — Pilier 2 (mobilité durable — exo)" a={res.budgetMobPilier2} pos/>}
            {res.hsBrutNetTotal>0&&<><PS t="Heures supplémentaires brut=net (01/04/2026)"/>
              {res.hsVolontBrutNet>0&&<PR l={`HS volontaires brut=net (${per.hsVolontBrutNet||0}h × ${fmt(res.hsVolontBrutNet/(per.hsVolontBrutNet||1))}/h — exo ONSS+PP)`} a={res.hsVolontBrutNet} pos/>}
              {res.hsRelance>0&&<PR l={`HS relance transitoire T1 (${per.hsRelance||0}h — brut=net — déduit quota 240h)`} a={res.hsRelance} pos/>}
              <tr><td colSpan={3} style={{padding:'4px 0 6px',fontSize:10,color:'#4ade80',fontStyle:'italic'}}>
                Nouveau régime: max 360h/an (450h horeca). 240h brut=net. Pas de sursalaire. Accord écrit 1 an requis.
              </td></tr></>}
            {res.budgetMobPilier3>0&&<><PR l="Budget mobilité — Pilier 3 (cash)" a={res.budgetMobPilier3}/>
              <PR l="  └ Cotisation spéciale 38,07% (Loi 17/03/2019)" a={-res.budgetMobCotis38} neg sub/></>}
            {res.allocTravail>0&&<><PS t="Activation ONEM"/>
              <PR l={`Allocation de travail ${res.allocTravailLabel} (AR 19/12/2001)`} a={-res.allocTravail} neg/>
              <tr><td colSpan={3} style={{padding:'4px 0 8px',fontSize:10,color:'#60a5fa',fontStyle:'italic',lineHeight:1.5}}>
                → Déduit du salaire net. Le travailleur reçoit {fmt(res.allocTravail)}/mois directement de l'ONEM via CAPAC/syndicat.<br/>
                → Rémunération totale travailleur inchangée: {fmt(res.net)} (employeur) + {fmt(res.allocTravail)} (ONEM) = {fmt(res.net+res.allocTravail)}<br/>
                → L'allocation n'est PAS soumise à l'ONSS (pas de rémunération). Le PP est retenu par l'ONEM (10,09%).<br/>
                → L'employeur ne déclare PAS l'allocation en DmfA. Formulaire: C78 (ONEM) + carte Activa/attestation FOREM.
              </td></tr></>}
            </>}
            <tr style={{borderTop:'3px solid #c6a34e'}}><td style={{padding:'14px 0',fontWeight:800,fontSize:15}}>NET À PAYER</td><td></td><td style={{textAlign:'right',padding:'14px 0',fontWeight:800,fontSize:18,color:'#16a34a'}}>{fmt(res.net)}</td></tr>
            {res.miTempsMed&&<><tr style={{background:"rgba(251,146,60,.04)"}}><td colSpan={3} style={{padding:'10px 0 4px'}}>
              <div style={{fontSize:11,fontWeight:700,color:'#fb923c'}}>⚕ POUR MÉMOIRE — Complément INAMI (hors fiche de paie)</div>
            </td></tr>
            <PR l={`Indemnités INAMI mutuelle (${Math.round((1-res.miTempsFraction)*100)}% non presté)`} a={res.miTempsINAMI}/>
            <tr><td style={{padding:'6px 0',fontWeight:700,fontSize:13}}>REVENU TOTAL TRAVAILLEUR</td><td></td><td style={{textAlign:'right',padding:'6px 0',fontWeight:700,fontSize:14,color:'#c6a34e'}}>{fmt(res.net + res.miTempsINAMI)}</td></tr>
            <tr><td colSpan={3} style={{padding:'4px 0 8px',fontSize:9.5,color:'#999',fontStyle:'italic'}}>Le complément INAMI est versé directement par la mutuelle au travailleur. Il n'est pas soumis à l'ONSS. Le PP est retenu à la source par la mutuelle (11,11%). Le travailleur conserve son contrat à temps plein.</td></tr></>}
          </tbody>
        </table>
        {/* CUMUL ANNUEL YTD (AR 27/09/1966 Art.9 — mention obligatoire) */}
        <div style={{marginTop:14,padding:12,background:"#f5f4ef",borderRadius:8}}>
          <div style={{fontSize:9.5,color:'#aaa',textTransform:'uppercase',letterSpacing:'1px',fontWeight:600,marginBottom:8}}>Cumul annuel (YTD — Janvier à {MN[per.month-1]} {per.year})</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8}}>
            {[
              {l:"Brut cumulé",v:res.gross*per.month},
              {l:"ONSS cumulé",v:res.onssNet*per.month},
              {l:"PP cumulé",v:res.tax*per.month},
              {l:"CSS cumulé",v:res.css*per.month},
              {l:"Net cumulé",v:res.net*per.month,c:'#16a34a'},
              {l:"Coût empl. cumulé",v:res.costTotal*per.month,c:'#c6a34e'},
            ].map((x,i)=><div key={i} style={{textAlign:'center'}}>
              <div style={{fontSize:8.5,color:'#999'}}>{x.l}</div>
              <div style={{fontSize:11.5,fontWeight:600,color:x.c||'#555',marginTop:2}}>{fmt(x.v)}</div>
            </div>)}
          </div>
          <div style={{fontSize:8,color:'#bbb',marginTop:6,fontStyle:'italic'}}>* Estimation basée sur le salaire du mois courant × {per.month} mois. Les cumuls réels seront calculés sur base de l'historique des fiches.</div>
        </div>
        {/* COMPTEURS CONGÉS & HEURES (Loi 28/06/1971 + CCT) */}
        <div style={{marginTop:10,padding:12,background:"#f5f4ef",borderRadius:8,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
          {[
            {l:"Congés légaux",v:`${20-Math.min(per.month*2,20)}j restants`,s:`Total: 20j/an (employé TP)`},
            {l:"Heures sup. récup.",v:`${(per.overtimeH||0)}h ce mois`,s:'Récupérables dans les 3 mois'},
            {l:"Jours maladie",v:`${per.sickG||0}j ce mois`,s:'Sal. garanti: 30j (employé) / 7+7+14j (ouvrier)'},
            {l:"Crédit-temps",v:"—",s:'Non activé'},
          ].map((x,i)=><div key={i} style={{textAlign:'center'}}>
            <div style={{fontSize:8.5,color:'#999'}}>{x.l}</div>
            <div style={{fontSize:11,fontWeight:600,color:'#555',marginTop:2}}>{x.v}</div>
            <div style={{fontSize:7.5,color:'#bbb',marginTop:1}}>{x.s}</div>
          </div>)}
        </div>
        {/* PÉCULE VACANCES & 13ÈME MOIS — Estimations annuelles */}
        <div style={{marginTop:10,padding:12,background:"#f8f7f2",borderRadius:8,border:'1px solid rgba(198,163,78,.1)'}}>
          <div style={{fontSize:9,color:'#c6a34e',textTransform:'uppercase',letterSpacing:'1px',fontWeight:600,marginBottom:8}}>Estimations annuelles — Pécule vacances & 13ème mois</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div>
              <div style={{fontSize:9.5,fontWeight:600,color:'#555',marginBottom:4}}>🏖 Pécule de vacances ({res.peculeVacCalc?.type==='ouvrier'?'Ouvrier — ONVA':'Employé — Employeur'})</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,fontSize:9.5,color:'#777'}}>
                <span>Simple:</span><span style={{fontWeight:600,textAlign:'right'}}>{fmt(res.peculeVacCalc?.simple||0)}</span>
                <span>Double (92%):</span><span style={{fontWeight:600,textAlign:'right'}}>{fmt(res.peculeVacCalc?.double||0)}</span>
                <span>ONSS 2è partie:</span><span style={{fontWeight:600,textAlign:'right',color:'#f87171'}}>-{fmt(res.peculeVacCalc?.onss2emePartie||0)}</span>
                <span>PP exceptionnel:</span><span style={{fontWeight:600,textAlign:'right',color:'#f87171'}}>-{fmt(res.peculeVacCalc?.ppExcep||0)} ({Math.round((res.peculeVacCalc?.ppExcepRate||0)*100)}%)</span>
                <span style={{borderTop:'1px solid #ddd',paddingTop:3}}>Total estimé:</span><span style={{fontWeight:700,textAlign:'right',color:'#16a34a',borderTop:'1px solid #ddd',paddingTop:3}}>{fmt(res.peculeVacCalc?.total||0)}</span>
              </div>
              <div style={{fontSize:8,color:'#aaa',marginTop:4}}>Paiement: {res.peculeVacCalc?.moisPaiement}</div>
            </div>
            <div>
              <div style={{fontSize:9.5,fontWeight:600,color:'#555',marginBottom:4}}>🎄 Prime de fin d'année (13ème mois)</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,fontSize:9.5,color:'#777'}}>
                <span>Brut:</span><span style={{fontWeight:600,textAlign:'right'}}>{fmt(res.y13Calc?.montant||0)}</span>
                <span>ONSS (13,07%):</span><span style={{fontWeight:600,textAlign:'right',color:'#f87171'}}>-{fmt(res.y13Calc?.onss||0)}</span>
                <span>PP exceptionnel:</span><span style={{fontWeight:600,textAlign:'right',color:'#f87171'}}>-{fmt(res.y13Calc?.ppExcep||0)} ({Math.round((res.y13Calc?.ppExcepRate||0)*100)}%)</span>
                <span style={{borderTop:'1px solid #ddd',paddingTop:3}}>Net estimé:</span><span style={{fontWeight:700,textAlign:'right',color:'#16a34a',borderTop:'1px solid #ddd',paddingTop:3}}>{fmt(res.y13Calc?.netEstime||0)}</span>
              </div>
              <div style={{fontSize:8,color:'#aaa',marginTop:4}}>{res.y13Calc?.methode} · Paiement: {res.y13Calc?.moisPaiement}</div>
            </div>
          </div>
        </div>
        <div style={{marginTop:18,padding:14,background:"#f0efea",borderRadius:8,display:'grid',gridTemplateColumns:res.atnCar>0?'repeat(5,1fr)':'repeat(4,1fr)',gap:10}}>
          {[{l:"Brut",v:res.gross},{l:`ONSS empl. (${(res.onssE_rate*100).toFixed(0)}%)`,v:res.onssE},...(res.cotisVacOuv>0?[{l:"Cot. vac. ouvrier (15,84%)",v:res.cotisVacOuv}]:[]),...(res.atnCar>0?[{l:"Cot. CO2",v:res.cotCO2}]:[]),...(res.pensionComplEmpl>0?[{l:"Pension compl. empl.",v:res.pensionComplEmpl}]:[]),...(res.ecoCheques>0?[{l:"Éco-chèques",v:res.ecoCheques}]:[]),...(res.dispensePPTotal>0?[{l:"Dispense PP (nuit/HS)",v:-res.dispensePPTotal}]:[]),...(res.redGCPremier>0?[{l:`Réd. ${res.redGCPremierLabel||'1er eng.'} (Art.336 LP)`,v:-res.redGCPremier}]:[]),...(res.redGCAge>0?[{l:"Réd. trav. âgé 55+",v:-res.redGCAge}]:[]),...(res.redGCJeune>0?[{l:"Réd. jeune <26",v:-res.redGCJeune}]:[]),...(res.redGCHandicap>0?[{l:"Réd. handicap",v:-res.redGCHandicap}]:[]),...(res.allocTravail>0?[{l:`Alloc. ONEM ${res.allocTravailLabel}`,v:-res.allocTravail}]:[]),{l:"Avantages",v:res.mvEmployer+res.expense+res.transport+res.indemTeletravail+res.indemBureau},{l:"COÛT TOTAL",v:res.costTotal,g:1}].map((x,i)=>
            <div key={i} style={{textAlign:'center'}}><div style={{fontSize:9.5,color:'#999',textTransform:'uppercase'}}>{x.l}</div><div style={{fontSize:13,fontWeight:x.g?800:600,marginTop:3,color:x.g?'#c6a34e':'#333'}}>{fmt(x.v)}</div></div>
          )}
        </div>
        <div style={{marginTop:10,fontSize:10.5,color:'#bbb'}}>Versement: {emp.iban}</div>
        {/* CONDITIONS GÉNÉRALES INSTITUTIONNELLES */}
        <div  style={{marginTop:18,paddingTop:14,borderTop:'1px solid #e0dfda'}}>
          <div style={{fontSize:8.5,color:'#bbb',textTransform:'uppercase',letterSpacing:'1.5px',fontWeight:600,marginBottom:8}}>Conditions générales</div>
          <div style={{fontSize:8,color:'#aaa',lineHeight:1.7,columnCount:2,columnGap:20}}>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>1. Confidentialité</b> — La présente fiche de paie est un document strictement confidentiel destiné exclusivement au travailleur mentionné ci-dessus. Toute reproduction, diffusion ou communication à des tiers est interdite sauf accord écrit de l'employeur.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>2. Base légale</b> — Ce document est établi conformément à la loi du 12 avril 1965 concernant la protection de la rémunération des travailleurs et à l'arrêté royal du 27 septembre 1966 déterminant les mentions obligatoires du décompte de rémunération.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>3. Calculs</b> — Les retenues ONSS sont effectuées conformément à la loi du 29 juin 1981. Le précompte professionnel est calculé selon la formule-clé du SPF Finances (annexe III AR/CIR 92). La cotisation spéciale de sécurité sociale est établie conformément à la loi du 30 mars 1994.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>4. Contestation</b> — Toute contestation relative au présent décompte doit être adressée par écrit à l'employeur dans un délai d'un mois à compter de la date de réception. Passé ce délai, le décompte est réputé accepté, sans préjudice du droit de réclamation légal.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>5. Conservation</b> — Le travailleur est tenu de conserver ce document pendant une durée minimale de 5 ans. Ce document peut être requis pour l'établissement de la déclaration fiscale (IPP) et pour toute démarche administrative (chômage, pension, crédit).</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>6. Données personnelles</b> — Le traitement des données à caractère personnel figurant sur ce document est effectué conformément au Règlement (UE) 2016/679 (RGPD). Les données sont traitées aux seules fins de gestion salariale, déclarations sociales et fiscales. Le travailleur dispose d'un droit d'accès, de rectification et de suppression de ses données (art. 15-17 RGPD).</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>7. Barèmes</b> — Les rémunérations sont conformes aux barèmes sectoriels en vigueur de la commission paritaire applicable (CP {emp.cp||s.co.cp||'200'}), tels que publiés par le SPF Emploi, Travail et Concertation sociale.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>8. Paiement</b> — Le salaire net est versé par virement bancaire sur le compte communiqué par le travailleur, au plus tard le dernier jour ouvrable du mois en cours, conformément à l'art. 5 de la loi du 12/04/1965.</p>
          </div>
          <div style={{marginTop:10,paddingTop:8,borderTop:'1px solid #eee',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:7.5,color:'#ccc'}}>{s.co.name} · {s.co.vat} · {s.co.addr} · Secrétariat social: Aureus Social Pro</div>
            <div style={{fontSize:7.5,color:'#ccc'}}>Document généré le {new Date().toLocaleDateString('fr-BE')} · Page 1/1</div>
          </div>
        </div>

        {/* TABLEAU RÉCAPITULATIF SOUMISSION ONSS / PP PAR ÉLÉMENT */}
        <div  style={{marginTop:18,padding:14,background:"#f0efea",borderRadius:8}}>
          <div style={{fontSize:9.5,color:'#999',textTransform:'uppercase',letterSpacing:'1px',fontWeight:600,marginBottom:10}}>Récapitulatif soumission ONSS & Précompte professionnel</div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10.5}}>
            <thead><tr style={{borderBottom:'2px solid #c6a34e'}}>
              <th style={{textAlign:'left',padding:'6px 8px',color:'#999',fontSize:9}}>Élément</th>
              <th style={{textAlign:'center',padding:'6px 8px',color:'#999',fontSize:9}}>Montant</th>
              <th style={{textAlign:'center',padding:'6px 8px',color:'#999',fontSize:9}}>ONSS</th>
              <th style={{textAlign:'center',padding:'6px 8px',color:'#999',fontSize:9}}>PP</th>
              <th style={{textAlign:'left',padding:'6px 8px',color:'#999',fontSize:9}}>Base légale</th>
            </tr></thead>
            <tbody>
              {[
                {l:"Salaire de base",m:res.base,onss:'✅ Oui',pp:'✅ Oui',ref:"Loi 12/04/1965"},
                ...(res.overtime>0?[{l:"Heures supplémentaires (150%)",m:res.overtime,onss:'✅ Oui',pp:'✅ Oui',ref:"Loi 16/03/1971"}]:[]),
                ...(res.sunday>0?[{l:"Supplément dimanche (200%)",m:res.sunday,onss:'✅ Oui',pp:'✅ Oui',ref:"Loi 16/03/1971"}]:[]),
                ...(res.night>0?[{l:"Supplément nuit (125%)",m:res.night,onss:'✅ Oui',pp:'✅ Oui',ref:"Loi 16/03/1971"}]:[]),
                ...(res.bonus>0?[{l:"Prime",m:res.bonus,onss:'✅ Oui',pp:'✅ Oui',ref:"Art. 2 Loi 12/04/1965"}]:[]),
                ...(res.y13>0?[{l:"13ème mois",m:res.y13,onss:'✅ Oui',pp:'✅ Taux except.',ref:"AR 09/01/2024 ann.III"}]:[]),
                ...(res.sickPay>0?[{l:"Salaire garanti maladie",m:res.sickPay,onss:'✅ Oui',pp:'✅ Oui',ref:"Loi 03/07/1978 Art.52-70"}]:[]),
                {l:"▬ TOTAL BRUT",m:res.gross,onss:'',pp:'',ref:"",bold:true},
                ...(emp.statut==='ouvrier'?[{l:"  └ Base ONSS ouvrier (brut × 108%)",m:Math.round(res.gross*TX_OUV108*100)/100,onss:'✅ 13,07%',pp:'—',ref:"Loi 29/06/1981 Art.23",hl:"orange"}]:[]),
                {l:"ONSS travailleur (13,07%)",m:res.onssW,onss:'—',pp:'—',ref:"Loi 29/06/1981",neg:true},
                ...(res.empBonus>0?[{l:"  └ Bonus à l\'emploi social (volet A+B)",m:res.empBonus,onss:'Réduction',pp:'—',ref:"AR 01/06/1999 Art.2",hl:"green"}]:[]),
                ...(res.empBonusFisc>0?[{l:"  └ Bonus emploi fiscal (PP)",m:res.empBonusFisc,onss:'—',pp:'Réduction',ref:"Art. 289ter CIR 92",hl:"green"}]:[]),
                {l:"ONSS net retenu",m:res.onssNet,onss:'—',pp:'—',ref:"",neg:true,bold:true},
                {l:"Précompte professionnel",m:res.tax,onss:'—',pp:'—',ref:"AR/CIR 92 annexe III",neg:true},
                ...(res.ppVolontaire>0?[{l:"PP volontaire",m:res.ppVolontaire,onss:'—',pp:'—',ref:"Art. 275§1 CIR 92",neg:true}]:[]),
                {l:"Cotisation spéciale SS",m:res.css,onss:'—',pp:'—',ref:"Loi 30/03/1994",neg:true},
                ...(res.atnCar>0?[{l:"ATN Voiture de société",m:res.atnCar,onss:'❌ Non',pp:'✅ Oui',ref:"Art. 36 CIR 92"}]:[]),
                ...(res.atnGSM>0?[{l:"ATN GSM",m:res.atnGSM,onss:'❌ Non',pp:'✅ Oui',ref:"AR 18/12/2024 forfait"}]:[]),
                ...(res.atnPC>0?[{l:"ATN PC",m:res.atnPC,onss:'❌ Non',pp:'✅ Oui',ref:"AR 18/12/2024 forfait"}]:[]),
                ...(res.atnInternet>0?[{l:"ATN Internet",m:res.atnInternet,onss:'❌ Non',pp:'✅ Oui',ref:"AR 18/12/2024 forfait"}]:[]),
                ...(res.atnLogement>0?[{l:"ATN Logement",m:res.atnLogement,onss:'❌ Non',pp:'✅ Oui',ref:"Art. 18 AR/CIR 92"}]:[]),
                ...(res.atnChauffage>0?[{l:"ATN Chauffage",m:res.atnChauffage,onss:'❌ Non',pp:'✅ Oui',ref:"Art. 18 AR/CIR 92"}]:[]),
                ...(res.atnElec>0?[{l:"ATN Électricité",m:res.atnElec,onss:'❌ Non',pp:'✅ Oui',ref:"Art. 18 AR/CIR 92"}]:[]),
                ...(res.atnMoto>0?[{l:`🏍 ATN moto (${emp.motoBrand||''} ${emp.motoModel||''})`,m:res.atnMoto,onss:'❌ Non',pp:'✅ Oui',ref:"Art. 36 CIR 92"}]:[]),
                ...(res.veloSociete?[{l:"🚲 Vélo de société",m:0,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:"Art. 38§1er 14°a CIR",hl:"green"}]:[]),
                ...(res.atnCarteCarburant>0?[{l:"Carte carburant (sans voit. soc.)",m:res.atnCarteCarburant,onss:'✅ Oui',pp:'✅ Oui',ref:"Art. 36§2 CIR 92"}]:[]),
                ...(res.transport>0?[{l:"Transport domicile-travail",m:res.transport,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:"CCT 19/9 + Art. 38§1er 9° CIR",hl:"green"}]:[]),
                ...(res.expense>0?[{l:"Frais propres employeur",m:res.expense,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:"Art. 31 CIR 92",hl:"green"}]:[]),
                ...(res.indemTeletravail>0?[{l:"Indemnité télétravail",m:res.indemTeletravail,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:"Circ. 2021/C/20 (max 154,74€)",hl:"green"}]:[]),
                ...(res.indemBureau>0?[{l:"Indemnité bureau",m:res.indemBureau,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:"Art. 31 CIR 92",hl:"green"}]:[]),
                ...(res.doublePecule>0?[{l:"Double pécule vacances",m:res.doublePecule,onss:'✅ 2è partie',pp:'✅ Taux except.',ref:"AR 28/11/1969 Art.19§2"}]:[]),
                ...(res.peculeDepart>0?[{l:"Pécule vacances départ",m:res.peculeDepart,onss:'✅ 13,07%',pp:'✅ Taux except.',ref:"Loi 12/04/1965 Art.46"}]:[]),
                ...(res.primeAncExoneree>0?[{l:"Prime ancienneté (exonérée)",m:res.primeAncExoneree,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:"Art. 19§2 14° AR ONSS",hl:"green"}]:[]),
                ...(res.primeAncTaxable>0?[{l:"Prime ancienneté (taxable)",m:res.primeAncTaxable,onss:'✅ Oui',pp:'✅ Oui',ref:"Art. 19§2 14° AR ONSS"}]:[]),
                ...(res.primeNaissance>0?[{l:"Prime naissance/mariage",m:res.primeNaissance,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:"Circ. ONSS — avantage social",hl:"green"}]:[]),
                ...(res.primeInnovation>0?[{l:"Prime innovation",m:res.primeInnovation,onss:'✅ Oui',pp:'❌ Exonéré',ref:"Art. 38§1er 25° CIR"}]:[]),
                ...(res.ecoCheques>0?[{l:"Éco-chèques",m:res.ecoCheques,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:"CCT 98 du 20/02/2009",hl:"green"}]:[]),
                ...(res.cadeaux>0?[{l:"Cadeaux/événements",m:res.cadeaux,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:"Circ. ONSS (≤ plafond)",hl:"green"}]:[]),
                ...(res.budgetMobPilier2>0?[{l:"Budget mobilité Pilier 2",m:res.budgetMobPilier2,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:"Loi 17/03/2019",hl:"green"}]:[]),
                ...(res.budgetMobPilier3>0?[{l:"Budget mobilité Pilier 3 (cash)",m:res.budgetMobPilier3,onss:'✅ 38,07%',pp:'❌ Non',ref:"Loi 17/03/2019"}]:[]),
                ...(res.pensionCompl>0?[{l:"Pension complémentaire (ret. pers.)",m:res.pensionCompl,onss:'✅ Oui',pp:'❌ Réduc. 30%',ref:"LPC 28/04/2003 + Art.145/1"}]:[]),
                ...(res.allocTravail>0?[{l:`Allocation travail ONEM (${res.allocTravailLabel})`,m:res.allocTravail,onss:'❌ Non',pp:'✅ Retenu ONEM',ref:"AR 19/12/2001"}]:[]),
                ...(res.mvWorker>0?[{l:"Chèques-repas (part travailleur)",m:res.mvWorker,onss:'❌ Exonéré',pp:'❌ Exonéré',ref:"AR 28/11/1969 Art.19bis§2",hl:"green"}]:[]),
                {l:"▬ TOTAL RETENUES",m:res.totalDed,onss:'',pp:'',ref:"",bold:true,neg:true},
                {l:"▬ NET À PAYER",m:res.net,onss:'',pp:'',ref:"",bold:true,hl:"net"},
              ].map((x,i)=><tr key={i} style={{borderBottom:'1px solid '+(x.bold?'#c6a34e':'#e5e4df'),background:x.hl==='green'?'rgba(22,163,74,.03)':x.hl==='orange'?'rgba(251,146,60,.04)':x.hl==='net'?'rgba(22,163,74,.06)':'transparent'}}>
                <td style={{padding:'5px 8px',color:x.bold?'#1a1a18':'#555',fontWeight:x.bold?700:400,fontSize:x.bold?11:10.5}}>{x.l}</td>
                <td style={{padding:'5px 8px',textAlign:'center',fontWeight:600,color:x.neg?'#dc2626':x.bold?'#1a1a18':x.hl==='net'?'#16a34a':'#333',fontSize:x.bold?12:10.5}}>{x.neg?'-':''}{fmt(x.m)}</td>
                <td style={{padding:'5px 8px',textAlign:'center',color:x.onss?.includes('❌')?'#16a34a':x.onss?.includes('✅')?'#dc2626':'#999',fontWeight:600,fontSize:10}}>{x.onss||''}</td>
                <td style={{padding:'5px 8px',textAlign:'center',color:x.pp?.includes('❌')?'#16a34a':x.pp?.includes('✅')?'#dc2626':'#999',fontWeight:600,fontSize:10}}>{x.pp||''}</td>
                <td style={{padding:'5px 8px',fontSize:9,color:'#999'}}>{x.ref||''}</td>
              </tr>)}
            </tbody>
          </table>
        </div>



        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CHARGES & AVANTAGES EMPLOYEUR — Détail complet                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {(res.atnCar>0||res.atnMoto>0||res.veloSociete||res.atnGSM>0||res.atnPC>0||res.atnInternet>0||res.atnChauffage>0||res.atnElec>0||res.atnLogement>0||res.carteCarburant||res.borneRecharge)&&<div style={{marginTop:14,padding:14,background:"#f5f4ef",borderRadius:10,border:'1px solid rgba(198,163,78,.12)'}}>
          <div style={{fontSize:9.5,color:'#c6a34e',textTransform:'uppercase',letterSpacing:'1px',fontWeight:600,marginBottom:10}}>
            Charges & Avantages Employeur — Détail
          </div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10.5}}>
            <thead><tr style={{borderBottom:'2px solid #c6a34e'}}>
              <th style={{textAlign:'left',padding:'6px 8px',color:'#999',fontSize:9,textTransform:'uppercase'}}>Avantage</th>
              <th style={{textAlign:'right',padding:'6px 8px',color:'#999',fontSize:9}}>ATN / Charge</th>
              <th style={{textAlign:'center',padding:'6px 8px',color:'#999',fontSize:9}}>ONSS empl.</th>
              <th style={{textAlign:'center',padding:'6px 8px',color:'#999',fontSize:9}}>PP trav.</th>
              <th style={{textAlign:'right',padding:'6px 8px',color:'#999',fontSize:9}}>Coût empl./mois</th>
              <th style={{textAlign:'left',padding:'6px 8px',color:'#999',fontSize:9}}>Référence</th>
            </tr></thead>
            <tbody>
              {[
                // Voiture de société
                ...(res.atnCar>0?[{
                  l:`🚗 Voiture société (${emp.carBrand||''} ${emp.carModel||''} — ${emp.carFuel||''} ${emp.carCO2||0}g)`,
                  atn:res.atnCar, onssEmpl:'❌ Non soumis', ppTrav:'✅ Imposable',
                  cout:res.cotCO2, coutLabel:`Cot. CO2: ${fmt(res.cotCO2)}/mois`,
                  ref:'Art. 36 CIR 92 + cotis. solidarité ONSS'
                }]:[]),
                // Moto de société
                ...(res.atnMoto>0?[{
                  l:`🏍 Moto société (${emp.motoBrand||''} ${emp.motoModel||''} — ${emp.motoFuel||''} ${emp.motoCO2||0}g)`,
                  atn:res.atnMoto, onssEmpl:'❌ Non soumis', ppTrav:'✅ Imposable',
                  cout:res.cotCO2Moto||0, coutLabel:`Cot. CO2: ${fmt(res.cotCO2Moto||0)}/mois`,
                  ref:'Art. 36 CIR 92'
                }]:[]),
                // Vélo de société
                ...(res.veloSociete?[{
                  l:`🚲 Vélo société (${res.veloType||''})${res.veloLeasingMois>0?' — Leasing: '+fmt(res.veloLeasingMois)+'/mois':''}`,
                  atn:0, onssEmpl:'❌ Exonéré', ppTrav:'❌ Exonéré (ATN=0)',
                  cout:res.veloLeasingMois||0, coutLabel:`Leasing: ${fmt(res.veloLeasingMois||0)}/mois (déduc. 100%)`,
                  ref:'Art. 38§1er 14°a CIR — exo depuis 01/01/2024', green:true
                }]:[]),
                // PC / Tablette
                ...(res.atnPC>0?[{
                  l:'💻 PC / Tablette de société', atn:res.atnPC,
                  onssEmpl:'❌ Non soumis', ppTrav:'✅ Imposable (6€/mois)',
                  cout:res.atnPC, coutLabel:`ATN: ${fmt(res.atnPC)}/mois`,
                  ref:'AR 18/12/2024 — forfait 72€/an'
                }]:[]),
                // Abonnement GSM
                ...(res.atnGSM>0?[{
                  l:'📱 Abonnement GSM / Téléphone', atn:res.atnGSM,
                  onssEmpl:'❌ Non soumis', ppTrav:'✅ Imposable (3€/mois)',
                  cout:res.atnGSM, coutLabel:`ATN: ${fmt(res.atnGSM)}/mois`,
                  ref:'AR 18/12/2024 — forfait 36€/an'
                }]:[]),
                // Internet privé
                ...(res.atnInternet>0?[{
                  l:'🌐 Connexion internet privée', atn:res.atnInternet,
                  onssEmpl:'❌ Non soumis', ppTrav:'✅ Imposable (5€/mois)',
                  cout:res.atnInternet, coutLabel:`ATN: ${fmt(res.atnInternet)}/mois`,
                  ref:'AR 18/12/2024 — forfait 60€/an'
                }]:[]),
                // Carte carburant
                ...(res.carteCarburant?[{
                  l:`⛽ Carte carburant / recharge (${fmt(res.carteCarburantMois)}/mois)`,
                  atn:res.atnCarteCarburant>0?res.atnCarteCarburant:0,
                  onssEmpl:res.atnCar>0?'Inclus ATN voiture':'✅ Soumis ONSS',
                  ppTrav:res.atnCar>0?'Inclus ATN voiture':'✅ Imposable',
                  cout:res.carteCarburantMois||0, coutLabel:`Budget: ${fmt(res.carteCarburantMois||0)}/mois`,
                  ref:res.atnCar>0?'Art. 36§2 CIR — inclus ATN voiture':'Art. 36§2 CIR — ATN imposable si sans voiture soc.'
                }]:[]),
                // Borne de recharge
                ...(res.borneRecharge?[{
                  l:`🔌 Borne de recharge domicile (${fmt(res.borneRechargeCoût||0)}/mois)`,
                  atn:res.atnBorne>0?res.atnBorne:0,
                  onssEmpl:res.atnCar>0?'❌ Exonéré':'✅ Soumis si sans voit.',
                  ppTrav:res.atnCar>0?'❌ Exonéré':'✅ Imposable si sans voit.',
                  cout:res.borneRechargeCoût||0, coutLabel:`Coût: ${fmt(res.borneRechargeCoût||0)}/mois`,
                  ref:res.atnCar>0?'Art. 14536 CIR — exo si voiture soc.':'Art. 14536 CIR — ATN si sans voiture soc.',
                  green:res.atnCar>0
                }]:[]),
                // Chauffage gratuit
                ...(res.atnChauffage>0?[{
                  l:'🔥 Chauffage gratuit (forfait 2.130€/an)',
                  atn:res.atnChauffage, onssEmpl:'❌ Non soumis', ppTrav:'✅ Imposable',
                  cout:res.atnChauffage, coutLabel:`Forfait: ${fmt(res.atnChauffage)}/mois`,
                  ref:'Art. 18 §3 4° AR/CIR 92'
                }]:[]),
                // Électricité gratuite
                ...(res.atnElec>0?[{
                  l:'⚡ Électricité gratuite (forfait 1.060€/an)',
                  atn:res.atnElec, onssEmpl:'❌ Non soumis', ppTrav:'✅ Imposable',
                  cout:res.atnElec, coutLabel:`Forfait: ${fmt(res.atnElec)}/mois`,
                  ref:'Art. 18 §3 3° AR/CIR 92'
                }]:[]),
                // Logement gratuit
                ...(res.atnLogement>0?[{
                  l:'🏠 Logement gratuit (RC indexé × coeff.)',
                  atn:res.atnLogement, onssEmpl:'❌ Non soumis', ppTrav:'✅ Imposable',
                  cout:res.atnLogement, coutLabel:`ATN: ${fmt(res.atnLogement)}/mois`,
                  ref:'Art. 18 §1er AR/CIR 92 — RC × 2,1763 / 12'
                }]:[]),
              ].map((x,i)=><tr key={i} style={{borderBottom:'1px solid #e5e4df',background:x.green?'rgba(74,222,128,.03)':'transparent'}}>
                <td style={{padding:'6px 8px',fontSize:10.5,color:x.green?'#4ade80':'#555',fontWeight:500}}>{x.l}</td>
                <td style={{padding:'6px 8px',textAlign:'right',fontWeight:600,color:x.atn>0?'#fb923c':'#4ade80',fontSize:10.5}}>{x.atn>0?fmt(x.atn):'0€ exonéré'}</td>
                <td style={{padding:'6px 8px',textAlign:'center',color:x.onssEmpl?.includes('❌')?'#4ade80':'#fb923c',fontSize:10}}>{x.onssEmpl}</td>
                <td style={{padding:'6px 8px',textAlign:'center',color:x.ppTrav?.includes('❌')?'#4ade80':'#fb923c',fontSize:10}}>{x.ppTrav}</td>
                <td style={{padding:'6px 8px',textAlign:'right',fontSize:10,color:'#888'}}>{x.coutLabel}</td>
                <td style={{padding:'6px 8px',fontSize:9,color:'#999'}}>{x.ref}</td>
              </tr>)}
              <tr style={{borderTop:'2px solid #c6a34e',background:'rgba(198,163,78,.05)'}}>
                <td style={{padding:'8px',fontWeight:700,fontSize:11,color:'#c6a34e'}}>TOTAL ATN imposable (ajouté revenu PP)</td>
                <td style={{padding:'8px',textAlign:'right',fontWeight:800,fontSize:12,color:'#fb923c'}}>{fmt(res.atnTotal||0)}</td>
                <td colSpan={2} style={{padding:'8px',textAlign:'center',fontSize:10,color:'#888'}}>Soumis PP uniquement</td>
                <td style={{padding:'8px',textAlign:'right',fontWeight:700,fontSize:11,color:'#c6a34e'}}>{fmt((res.cotCO2||0)+(res.cotCO2Moto||0)+(res.veloLeasingMois||0))}/mois charges</td>
                <td style={{padding:'8px',fontSize:9,color:'#999'}}>Art. 36 + 38 CIR 92</td>
              </tr>
            </tbody>
          </table>
          <div style={{marginTop:8,fontSize:8.5,color:'#aaa',lineHeight:1.6}}>
            ⚠ Les ATN augmentent le revenu imposable du travailleur (base PP) mais ne sont <b>pas soumis à l'ONSS</b> (sauf exception). 
            Les cotisations CO2 sont des charges patronales ONSS. Les coûts de leasing vélo sont déductibles à 100% pour l'employeur.
          </div>
        </div>}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PARAMÈTRES LÉGAUX APPLICABLES — Source: crons auto-update      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div style={{marginTop:18,padding:16,background:'linear-gradient(135deg,rgba(198,163,78,.05),rgba(198,163,78,.02))',borderRadius:10,border:'1px solid rgba(198,163,78,.15)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'#c6a34e',textTransform:'uppercase',letterSpacing:'1.5px'}}>⚡ Paramètres légaux applicables</div>
              <div style={{fontSize:8.5,color:'#888',marginTop:2}}>Valeurs utilisées pour ce calcul — mise à jour automatique quotidienne (crons 06h00–06h10)</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:8,color:'#aaa'}}>Source: {LOIS_BELGES._meta?.source||'SPF Finances / ONSS / CNT'}</div>
              <div style={{fontSize:8,color:'#aaa'}}>Dernière MAJ: {LOIS_BELGES._meta?.dateMAJ||'—'} · v{LOIS_BELGES._meta?.version||'2026'}</div>
              {(()=>{const cp=emp.cp||s.co?.cp||'200';const bcp=BAREMES_CP_MIN?.[cp];return bcp?<div style={{fontSize:8,color:'#4ade80',marginTop:1}}>Barème CP {cp} MAJ: {BAREMES_CP_MIN?.dateMAJ||'—'}</div>:null;})()}
            </div>
          </div>

          {/* Ligne 1 — ONSS */}
          <div style={{marginBottom:8}}>
            <div id='section-onss-cotisations' style={{fontSize:8.5,color:'#c6a34e',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',marginBottom:5,paddingBottom:3,borderBottom:'1px solid rgba(198,163,78,.1)'}}>ONSS & Cotisations</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
              {[
                {l:'ONSS travailleur',v:`${(TX_ONSS_W*100).toFixed(2)}%`,ref:'Loi 29/06/1981',ok:true},
                {l:'ONSS patronal',v:`${(TX_ONSS_E*100).toFixed(2)}%`,ref:'Loi 29/06/1981',ok:true},
                ...(emp.statut==='ouvrier'?[{l:'Majoration ouvrier',v:'× 108%',ref:'AR 28/11/1969 Art.23',ok:true}]:[]),
                {l:'RMMMG (CCT 43)',v:`${fmt(RMMMG)}`,ref:'CNT CCT 43/15',ok:!!(res.gross>=RMMMG),warn:res.gross<RMMMG},
                {l:'Cot. CO2 min',v:`${fmt(CO2MIN)}`,ref:'AR ATN voiture',ok:true},
              ].map((x,i)=><div key={i} style={{background:x.warn?'rgba(239,68,68,.08)':'rgba(198,163,78,.04)',borderRadius:6,padding:'6px 8px',border:`1px solid ${x.warn?'rgba(239,68,68,.2)':'rgba(198,163,78,.08)'}`}}>
                <div style={{fontSize:7.5,color:x.warn?'#f87171':'#888'}}>{x.l}</div>
                <div style={{fontSize:11,fontWeight:700,color:x.warn?'#f87171':'#e8e6e0',marginTop:1}}>{x.v}</div>
                <div style={{fontSize:7,color:'#666',marginTop:1}}>{x.ref}</div>
                {x.warn&&<div style={{fontSize:7,color:'#f87171',fontWeight:700,marginTop:2}}>⚠ Salaire sous RMMMG!</div>}
              </div>)}
            </div>
          </div>

          {/* Ligne 2 — Fiscalité PP */}
          <div style={{marginBottom:8}}>
            <div id='section-precompte' style={{fontSize:8.5,color:'#c6a34e',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',marginBottom:5,paddingBottom:3,borderBottom:'1px solid rgba(198,163,78,.1)'}}>Précompte professionnel & Bonus emploi</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
              {[
                {l:'Tranche ≤ 16.710€',v:'26,75%',ref:'AR/CIR 92 ann.III',ok:true},
                {l:'Tranche 16.710–29.500€',v:'42,80%',ref:'AR/CIR 92 ann.III',ok:true},
                {l:'Tranche 29.500–51.050€',v:'48,15%',ref:'AR/CIR 92 ann.III',ok:true},
                {l:'Tranche > 51.050€',v:'53,50%',ref:'AR/CIR 92 ann.III',ok:true},
                {l:'Quotité exemptée',v:`${fmt(LOIS_BELGES.pp?.quotiteExemptee?.bareme1||2987.98)}`,ref:'Art.131 CIR 92',ok:true},
              ].map((x,i)=><div key={i} style={{background:'rgba(198,163,78,.04)',borderRadius:6,padding:'6px 8px',border:'1px solid rgba(198,163,78,.08)'}}>
                <div style={{fontSize:7.5,color:'#888'}}>{x.l}</div>
                <div style={{fontSize:11,fontWeight:700,color:'#e8e6e0',marginTop:1}}>{x.v}</div>
                <div style={{fontSize:7,color:'#666',marginTop:1}}>{x.ref}</div>
              </div>)}
            </div>
            {res.gross<=BONUS_SEUIL2&&<div style={{marginTop:6,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
              {[
                {l:`Bonus emploi — seuil brut 1`,v:`${fmt(BONUS_SEUIL1)}`,ref:'AR 21/12/2017',active:res.gross<=BONUS_SEUIL1},
                {l:`Bonus emploi — seuil brut 2`,v:`${fmt(BONUS_SEUIL2)}`,ref:'AR 21/12/2017',active:res.gross>BONUS_SEUIL1&&res.gross<=BONUS_SEUIL2},
                {l:`Bonus emploi max (${(LOIS_BELGES.pp?.bonusEmploi?.pctReduction*100||33.14).toFixed(2)}%)`,v:`${fmt(BONUS_MAX)}/mois`,ref:'Art. 289ter CIR',active:res.empBonus>0},
              ].map((x,i)=><div key={i} style={{background:x.active?'rgba(74,222,128,.06)':'rgba(198,163,78,.04)',borderRadius:6,padding:'6px 8px',border:`1px solid ${x.active?'rgba(74,222,128,.15)':'rgba(198,163,78,.08)'}`}}>
                <div style={{fontSize:7.5,color:x.active?'#4ade80':'#888'}}>{x.l} {x.active&&'✓'}</div>
                <div style={{fontSize:11,fontWeight:700,color:x.active?'#4ade80':'#e8e6e0',marginTop:1}}>{x.v}</div>
                <div style={{fontSize:7,color:'#666',marginTop:1}}>{x.ref}</div>
              </div>)}
            </div>}
          </div>

          {/* Ligne 3 — CSSS */}
          <div style={{marginBottom:8}}>
            <div id='section-csss' style={{fontSize:8.5,color:'#c6a34e',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',marginBottom:5,paddingBottom:3,borderBottom:'1px solid rgba(198,163,78,.1)'}}>CSSS — Cotisation spéciale sécurité sociale</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
              {(()=>{
                const tranches=LOIS_BELGES.csss?.isole||[];
                const annuel=(res.gross||0)*12;
                return tranches.filter(t=>t.taux>0||t.montantFixe).map((t,i)=>{
                  const active=annuel>=t.min&&annuel<(t.max===Infinity?999999:t.max);
                  return <div key={i} style={{background:active?'rgba(96,165,250,.06)':'rgba(198,163,78,.04)',borderRadius:6,padding:'6px 8px',border:`1px solid ${active?'rgba(96,165,250,.15)':'rgba(198,163,78,.08)'}`}}>
                    <div style={{fontSize:7.5,color:active?'#60a5fa':'#888'}}>Tranche {i+1} {active&&'← applicable'}</div>
                    <div style={{fontSize:9,fontWeight:700,color:active?'#60a5fa':'#e8e6e0',marginTop:1}}>
                      {t.montantFixe?`Fixe: ${fmt(t.montantFixe)}`:`${(t.taux*100).toFixed(1)}%`}
                    </div>
                    <div style={{fontSize:7,color:'#666',marginTop:1}}>{fmt(t.min)}–{t.max===Infinity?'∞':fmt(t.max)} €/an</div>
                    {active&&<div style={{fontSize:7.5,fontWeight:700,color:'#60a5fa',marginTop:2}}>{fmt(res.css)}/mois</div>}
                  </div>;
                });
              })()}
            </div>
          </div>

          {/* Ligne 4 — Avantages & Frais */}
          <div style={{marginBottom:8}}>
            <div id='section-avantages' style={{fontSize:8.5,color:'#c6a34e',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',marginBottom:5,paddingBottom:3,borderBottom:'1px solid rgba(198,163,78,.1)'}}>Avantages exonérés & Frais propres</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
              {[
                {l:'Chèques-repas max',v:`${fmt(CR_MAX)}/jour`,ref:'CCT nat. + AR',used:res.mvDays>0},
                {l:'Part patronale CR max',v:`${fmt(CR_PAT)}/jour`,ref:'AR 28/11/1969 Art.19bis',used:res.mvEmployer>0},
                {l:'Éco-chèques max',v:`${fmt(ECO_MAX)}/an`,ref:'CCT 98 — 20/02/2009',used:res.ecoCheques>0},
                {l:'Forfait bureau/télétravail',v:`${fmt(FORF_BUREAU)}/mois`,ref:'Circ. 2021/C/20',used:res.indemTeletravail>0||res.indemBureau>0},
                {l:'Indemnité km voiture',v:`${FORF_KM} €/km`,ref:'AR mobilité 2026',used:emp.commType==='car'||emp.commType==='own'},
              ].map((x,i)=><div key={i} style={{background:x.used?'rgba(74,222,128,.06)':'rgba(198,163,78,.04)',borderRadius:6,padding:'6px 8px',border:`1px solid ${x.used?'rgba(74,222,128,.15)':'rgba(198,163,78,.08)'}`}}>
                <div style={{fontSize:7.5,color:x.used?'#4ade80':'#888'}}>{x.l} {x.used&&'✓'}</div>
                <div style={{fontSize:11,fontWeight:700,color:x.used?'#4ade80':'#e8e6e0',marginTop:1}}>{x.v}</div>
                <div style={{fontSize:7,color:'#666',marginTop:1}}>{x.ref}</div>
              </div>)}
            </div>
          </div>

          {/* Ligne 5 — Saisies sur salaire */}
          {res.garnish>0&&<div style={{marginBottom:8}}>
            <div id='section-saisies' style={{fontSize:8.5,color:'#c6a34e',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',marginBottom:5,paddingBottom:3,borderBottom:'1px solid rgba(198,163,78,.1)'}}>Saisies sur salaire — Barèmes 2026 (Art.1409 C.jud.)</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
              {(SAISIE_2026_TRAVAIL||[]).map((t,i)=>{
                const active=res.net>=t.min&&res.net<(t.max===Infinity?999999:t.max);
                return <div key={i} style={{background:active?'rgba(251,146,60,.08)':'rgba(198,163,78,.04)',borderRadius:6,padding:'6px 8px',border:`1px solid ${active?'rgba(251,146,60,.2)':'rgba(198,163,78,.08)'}`}}>
                  <div style={{fontSize:7.5,color:active?'#fb923c':'#888'}}>{t.label} {active&&'← applicable'}</div>
                  <div style={{fontSize:9,fontWeight:700,color:active?'#fb923c':'#e8e6e0',marginTop:1}}>{fmt(t.min)}–{t.max===Infinity?'∞':fmt(t.max)}</div>
                  {active&&<div style={{fontSize:7.5,fontWeight:700,color:'#fb923c',marginTop:2}}>Saisie: {fmt(res.garnish)}</div>}
                </div>;
              })}
              <div style={{background:'rgba(239,68,68,.06)',borderRadius:6,padding:'6px 8px',border:'1px solid rgba(239,68,68,.1)'}}>
                <div style={{fontSize:7.5,color:'#f87171'}}>Immunité enfant à charge</div>
                <div style={{fontSize:11,fontWeight:700,color:'#f87171',marginTop:1}}>+{fmt(SAISIE_IMMUN_ENFANT_2026)}/enfant</div>
                <div style={{fontSize:7,color:'#666',marginTop:1}}>Art.1409§1 bis C.jud.</div>
              </div>
            </div>
          </div>}

          {/* Ligne 6 — Allocations familiales région */}
          {emp.region&&<div style={{marginBottom:8}}>
            <div style={{fontSize:8.5,color:'#c6a34e',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',marginBottom:5,paddingBottom:3,borderBottom:'1px solid rgba(198,163,78,.1)'}} id='section-af'>Allocations familiales — {emp.region==='BXL'?'Bruxelles (Iriscare)':emp.region==='WAL'?'Wallonie (AViQ)':emp.region==='VL'?'Flandre (Groeipakket)':'Région'}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
              {(()=>{
                const reg=AF_REGIONS?.[emp.region];
                if(!reg) return null;
                return reg.base?.slice(0,3).map((t,i)=><div key={i} style={{background:'rgba(167,139,250,.06)',borderRadius:6,padding:'6px 8px',border:'1px solid rgba(167,139,250,.1)'}}>
                  <div style={{fontSize:7.5,color:'#a78bfa'}}>{t.age||0}–{t.to||'?'} ans</div>
                  <div style={{fontSize:11,fontWeight:700,color:'#a78bfa',marginTop:1}}>{fmt(t.amt)}/mois</div>
                  <div style={{fontSize:7,color:'#666',marginTop:1}}>Source cron quotidien</div>
                </div>);
              })()}
            </div>
          </div>}

          {/* Ligne 7 — Barème sectoriel CP */}
          {(()=>{
            const cp=emp.cp||s.co?.cp||'200';
            const bcp=BAREMES_CP_MIN?.[cp];
            if(!bcp) return null;
            const belowMin=res.gross<bcp.cl1;
            return <div id='section-cp' style={{marginBottom:4}}>
              <div style={{fontSize:8.5,color:'#c6a34e',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',marginBottom:5,paddingBottom:3,borderBottom:'1px solid rgba(198,163,78,.1)'}}>Barème sectoriel CP {cp} — Minima {bcp.nom||''}</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                {['cl1','cl2','cl3','cl4','cl5'].filter(k=>bcp[k]).map((k,i)=>{
                  const active=i===0&&belowMin;
                  return <div key={k} style={{background:belowMin&&i===0?'rgba(239,68,68,.08)':'rgba(198,163,78,.04)',borderRadius:6,padding:'6px 8px',border:`1px solid ${belowMin&&i===0?'rgba(239,68,68,.2)':'rgba(198,163,78,.08)'}`}}>
                    <div style={{fontSize:7.5,color:belowMin&&i===0?'#f87171':'#888'}}>Classe {i+1} {i===0&&belowMin&&'⚠ SOUS MIN'}</div>
                    <div style={{fontSize:11,fontWeight:700,color:belowMin&&i===0?'#f87171':'#e8e6e0',marginTop:1}}>{fmt(bcp[k])}</div>
                    <div style={{fontSize:7,color:'#666',marginTop:1}}>min. anc. 0 an — MAJ {BAREMES_CP_MIN?.dateMAJ||'—'}</div>
                  </div>;
                })}
              </div>
              {belowMin&&<div style={{marginTop:6,padding:'6px 10px',background:'rgba(239,68,68,.08)',borderRadius:6,border:'1px solid rgba(239,68,68,.2)',fontSize:9,color:'#f87171',fontWeight:600}}>
                ⚠ ATTENTION — Salaire brut {fmt(res.gross)} inférieur au minimum CP {cp} classe I ({fmt(bcp.cl1)}) — Risque de sanction ONSS
              </div>}
            </div>;
          })()}

          <div style={{marginTop:10,paddingTop:8,borderTop:'1px solid rgba(198,163,78,.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:7.5,color:'#555'}}>
              🤖 Ces paramètres sont mis à jour automatiquement chaque matin à 06h00 par les crons Aureus Social Pro
              via scraping officiel: SPF Finances · ONSS · CNT · Iriscare · AViQ · Groeipakket · SPF Justice
            </div>
            <div style={{fontSize:7.5,color:'#888',textAlign:'right'}}>
              Indice santé: {LOIS_BELGES.remuneration?.indexSante?.coeff||2.0399} (pivot {LOIS_BELGES.remuneration?.indexSante?.pivot||125.60})<br/>
              Prochain pivot estimé: {LOIS_BELGES.remuneration?.indexSante?.prochainPivotEstime||'—'}
            </div>
          </div>
        </div>


        {/* BOUTON PDF uniquement — plus de téléchargement HTML/txt */}
        <div style={{marginTop:14,display:'flex',gap:10,justifyContent:'center'}} >
          <button onClick={()=>{
            generatePayslipPDF(emp,res,per,s.co)}} style={{padding:'12px 28px',background:"#c6a34e",color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',letterSpacing:'.5px'}}>🖨 Imprimer / PDF</button>
        </div>
      </div>}
    </div>
    {(s.pays||[]).length>0&&<C  style={{marginTop:20,padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Historique ({(s.pays||[]).length} fiches)</div>
        <div style={{display:'flex',gap:8}}>
          {(s.pays||[]).some(p=>(!p.gross||p.gross===0)&&(!p.ename||p.ename==='undefined undefined'))&&<button onClick={()=>{if(confirm('Supprimer toutes les fiches en erreur (undefined / 0€) ?')){const badIds=(s.pays||[]).filter(p=>(!p.gross||p.gross===0)&&(!p.ename||p.ename==='undefined undefined')).map(p=>p.id);d({type:'DEL_PAYS_BATCH',ids:badIds})}}} style={{padding:'6px 12px',background:'#7f1d1d',color:'#fca5a5',border:'1px solid #991b1b',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer'}}>🗑 Supprimer les fiches en erreur ({(s.pays||[]).filter(p=>(!p.gross||p.gross===0)&&(!p.ename||p.ename==='undefined undefined')).length})</button>}
          {(s.pays||[]).length>0&&<button onClick={()=>{if(confirm('⚠ Supprimer TOUTES les fiches de paie ? Cette action est irréversible.')){d({type:'SET_PAYS',data:[]})}}} style={{padding:'6px 12px',background:'#1e293b',color:'#94a3b8',border:'1px solid #334155',borderRadius:6,fontSize:11,fontWeight:500,cursor:'pointer'}}>Tout effacer</button>}
        </div>
      </div>
      <Tbl cols={[
        {k:'p',l:"Période",b:1,c:'#c6a34e',r:r=>r.period},{k:'e',l:"Employé",r:r=>r.ename},
        {k:'g',l:"Brut",a:'right',r:r=>fmt(r.gross)},{k:'o',l:"ONSS",a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.onssNet)}</span>},
        {k:'t',l:"Précompte",a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.tax)}</span>},
        {k:'n',l:"Net",a:'right',r:r=><span style={{fontWeight:700,color:'#4ade80'}}>{fmt(r.net)}</span>},
        {k:'c',l:"Coût",a:'right',r:r=><span style={{color:'#a78bfa'}}>{fmt(r.costTotal)}</span>},
        {k:'x',l:"",a:'center',r:r=><button onClick={(e)=>{e.stopPropagation();if(confirm('Supprimer cette fiche de '+r.ename+' ('+r.period+') ?'))d({type:'DEL_P',id:r.id})}} style={{padding:'4px 8px',background:'transparent',color:'#ef4444',border:'1px solid rgba(239,68,68,.3)',borderRadius:4,fontSize:10,cursor:'pointer',fontWeight:600,opacity:.7}} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=.7}>🗑</button>},
      ]} data={s.pays}/>
    </C>}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  DIMONA
// ═══════════════════════════════════════════════════════════════


export default Payslips;
