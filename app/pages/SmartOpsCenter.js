'use client';
import{useState,useEffect,useMemo,useCallback,useRef}from'react';

// ═══════════════════════════════════════════════════════════
// SMART OPS CENTER — Notifications + Smart Alerts + Journal
// Aureus Social Pro — Sprint 37
// ═══════════════════════════════════════════════════════════

const TX_ONSS_E=0.2507,TX_ONSS_W=0.1307;
const fmt=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);
const fi=v=>new Intl.NumberFormat('fr-BE',{maximumFractionDigits:0}).format(v||0);
const mois=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

// ═══ HELPERS ═══
const C=({children,title:t,sub})=><div style={{background:'rgba(198,163,78,.03)',borderRadius:12,padding:16,border:'1px solid rgba(198,163,78,.08)',marginBottom:14}}>{t&&<div style={{fontSize:13,fontWeight:600,color:'#c6a34e',marginBottom:sub?2:12}}>{t}</div>}{sub&&<div style={{fontSize:10,color:'#888',marginBottom:12}}>{sub}</div>}{children}</div>;
const KPI=({l,v,c,sub,onClick})=><div onClick={onClick} style={{padding:14,background:'linear-gradient(135deg,#0d1117,#131820)',border:'1px solid '+(c||'#c6a34e')+'20',borderRadius:12,textAlign:'center',flex:1,minWidth:110,cursor:onClick?'pointer':'default'}}><div style={{fontSize:20,fontWeight:800,color:c||'#c6a34e'}}>{v}</div><div style={{fontSize:9,color:'#888',marginTop:3}}>{l}</div>{sub&&<div style={{fontSize:8,color:'#5e5c56',marginTop:2}}>{sub}</div>}</div>;
const Row=({l,v,c})=><div style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><span style={{color:'#e8e6e0',fontSize:11.5}}>{l}</span><span style={{color:c||'#c6a34e',fontWeight:600,fontSize:12}}>{v}</span></div>;
const Badge=({text,color})=><span style={{padding:'2px 7px',borderRadius:5,fontSize:8,fontWeight:600,background:(color||'#888')+'15',color:color||'#888',textTransform:'uppercase',letterSpacing:'.3px'}}>{text}</span>;
const timeAgo=(t)=>{const d=Math.floor((Date.now()-new Date(t))/60000);if(d<1)return'A l\'instant';if(d<60)return d+'min';if(d<1440)return Math.floor(d/60)+'h';return Math.floor(d/1440)+'j';};

// ═══════════════════════════════════════════════════════════
// 1. SMART ALERTS ENGINE — Moteur d'alertes intelligentes
// ═══════════════════════════════════════════════════════════
export function SmartAlertsEngine({s,d}){
  const clients=s.clients||[];
  const now=new Date();
  const day=now.getDate();const month=now.getMonth();const yr=now.getFullYear();
  const quarter=Math.ceil((month+1)/3);
  const saValidTabs=['dashboard','calendar','rules','categories'];
  const [tab,setTab]=useState(s.sub&&saValidTabs.includes(s.sub)?s.sub:'dashboard');
  useEffect(()=>{if(s.sub&&saValidTabs.includes(s.sub))setTab(s.sub);},[s.sub]);
  const [filter,setFilter]=useState('all');
  const [selectedAlert,setSelectedAlert]=useState(null);
  const [rulesEnabled,setRulesEnabled]=useState({deadlines:true,compliance:true,contracts:true,payroll:true,rh:true,trends:true});

  // ═══ ALERT ENGINE — Rules-based alert generation ═══
  const alerts=useMemo(()=>{
    const a=[];
    const allEmps=clients.flatMap(c=>(c.emps||[]).map(e=>({...e,_co:c.company?.name||c.id,_cid:c.id})));
    const n=allEmps.length;

    // ── RULE 1: DEADLINES LEGALES ──
    if(rulesEnabled.deadlines){
      if(day<=5) a.push({id:'DL-ONSS-'+month,sev:'critical',cat:'ONSS',rule:'deadline',title:'ONSS provisions mensuelles',desc:'Paiement provisions ONSS du avant le 5 '+mois[month]+' '+yr,deadline:5-day,icon:'🏛',action:{page:'onss'},remedy:'Acceder au module ONSS → Generer virement provision'});
      if(day<=15) a.push({id:'DL-PP-'+month,sev:day<=5?'critical':'high',cat:'Fiscal',rule:'deadline',title:'Precompte professionnel 274',desc:'Declaration + paiement PP avant le 15 '+mois[month],deadline:15-day,icon:'💰',action:{page:'fiscal'},remedy:'Module Fiscal → Generer declaration 274'});
      if(day<=25) a.push({id:'DL-SEPA-'+month,sev:day<=20?'medium':'high',cat:'Paie',rule:'deadline',title:'Virements SEPA salaires',desc:'Virements nets a executer avant le 25 '+mois[month],deadline:25-day,icon:'💳',action:{page:'sepa'},remedy:'Module SEPA → Lancer batch virements'});
      if(day<=28) a.push({id:'DL-FICHE-'+month,sev:'low',cat:'Paie',rule:'deadline',title:'Distribution fiches de paie',desc:'Fiches a distribuer avant fin '+mois[month],deadline:28-day,icon:'📄',action:{page:'payslip'},remedy:'Module Paie → Distribuer par email'});
      // Quarterly
      if([0,3,6,9].includes(month)&&day<=10) a.push({id:'DL-DMFA-Q'+quarter,sev:'critical',cat:'ONSS',rule:'deadline',title:'DmfA trimestrielle T'+quarter,desc:'Declaration DmfA Q'+quarter+'/'+yr+' — Delai: 10 '+mois[month],deadline:10-day,icon:'🏛',action:{page:'onss'},remedy:'Module ONSS → Batch DmfA → Generer XML'});
      // Annual
      if(month===1&&day<=28) a.push({id:'DL-BELCOTAX',sev:'critical',cat:'Fiscal',rule:'deadline',title:'Belcotax 281.10 / 281.20',desc:'Fiches fiscales annuelles — Deadline 1er mars',deadline:28-day,icon:'🧾',action:{page:'fiscal'},remedy:'Module Fiscal → Generer fiches 281'});
      if(month===11&&day<=20) a.push({id:'DL-13MOIS',sev:'critical',cat:'Paie',rule:'deadline',title:'13eme mois / Prime fin annee',desc:'Versement avant le 20 decembre',deadline:20-day,icon:'🎄',action:{page:'payslip'},remedy:'Calculer prime fin annee par CP sectorielle'});
      // Pécule vacances
      if((month===3||month===4)&&day<=30) a.push({id:'DL-PECULE',sev:'high',cat:'Paie',rule:'deadline',title:'Pecule vacances employes',desc:'Versement pecule entre mai et juin',deadline:(month===3?30-day:60-day),icon:'🌴',action:{page:'payslip'},remedy:'Calculer pecule simple + double vacation'});
      // Indexation CP200 janvier
      if(month===0&&day<=31) a.push({id:'DL-INDEX',sev:'high',cat:'RH',rule:'deadline',title:'Indexation salariale CP 200',desc:'Verifier index sante janvier '+yr,deadline:31-day,icon:'📊',action:{page:'employees'},remedy:'Appliquer nouvel index aux baremes'});
    }

    // ── RULE 2: COMPLIANCE ──
    if(rulesEnabled.compliance){
      clients.forEach(cl=>{
        const co=cl.company||{};const emps=cl.emps||[];
        if(!co.vat&&emps.length>0) a.push({id:'COMP-TVA-'+cl.id,sev:'high',cat:'Compliance',rule:'compliance',title:'TVA manquante — '+(co.name||'Client'),desc:emps.length+' employes — Declarations incompletes sans TVA',icon:'🏢',action:{page:'admin',sub:'config',client:cl.id},remedy:'Completer le numero de TVA dans la fiche client'});
        if(!co.onss&&emps.length>0) a.push({id:'COMP-ONSS-'+cl.id,sev:'high',cat:'Compliance',rule:'compliance',title:'N° ONSS manquant — '+(co.name||'Client'),desc:'Declarations DmfA impossibles sans numero ONSS',icon:'🏛',action:{page:'admin',sub:'config',client:cl.id},remedy:'Encoder le numero ONSS employeur'});
        if(emps.length>=1&&!co.reglementTravail) a.push({id:'COMP-RT-'+cl.id,sev:'medium',cat:'Compliance',rule:'compliance',title:'Reglement travail absent — '+(co.name||''),desc:'Obligatoire des le 1er travailleur',icon:'📋',action:{page:'gendocsjur',client:cl.id},remedy:'Generer un reglement de travail via le module Documents'});
        if(emps.length>=50&&!co.cppt) a.push({id:'COMP-CPPT-'+cl.id,sev:'critical',cat:'Compliance',rule:'compliance',title:'CPPT obligatoire — '+(co.name||''),desc:emps.length+' travailleurs — Seuil 50 depasse',icon:'⚖️',action:{page:'rh',client:cl.id},remedy:'Mettre en place le CPPT (Comite Prevention Protection Travail)'});
        if(emps.length>=100&&!co.ce) a.push({id:'COMP-CE-'+cl.id,sev:'critical',cat:'Compliance',rule:'compliance',title:'CE obligatoire — '+(co.name||''),desc:emps.length+' travailleurs — Seuil 100 depasse',icon:'🏛',action:{page:'rh',client:cl.id},remedy:'Mettre en place le Conseil d\'Entreprise'});
      });
    }

    // ── RULE 3: CONTRATS ──
    if(rulesEnabled.contracts){
      clients.forEach(cl=>{
        const co=cl.company||{};
        (cl.emps||[]).forEach(e=>{
          const name=(e.first||e.fn||'?')+' '+(e.last||e.ln||'?');
          if((e.contractType||e.contrat||'').toString().toUpperCase()==='CDD'){
            const end=new Date(e.endDate||e.end||'2099-12-31');
            const daysLeft=Math.ceil((end-now)/86400000);
            if(daysLeft<0) a.push({id:'CDD-EXP-'+e.id,sev:'critical',cat:'Contrat',rule:'contracts',title:'CDD EXPIRE — '+name,desc:(co.name||'')+' — Expire depuis '+Math.abs(daysLeft)+' jours. Risque requalification CDI!',deadline:daysLeft,icon:'🔴',action:{page:'employees',client:cl.id},remedy:'Generer C4 + Dimona OUT immediatement ou avenant CDI',emp:name});
            else if(daysLeft<=7) a.push({id:'CDD-7J-'+e.id,sev:'critical',cat:'Contrat',rule:'contracts',title:'CDD expire dans '+daysLeft+'j — '+name,desc:(co.name||'')+' — Fin: '+end.toLocaleDateString('fr-BE'),deadline:daysLeft,icon:'🟠',action:{page:'employees',client:cl.id},remedy:'Decision: renouvellement, CDI ou fin de contrat',emp:name});
            else if(daysLeft<=30) a.push({id:'CDD-30J-'+e.id,sev:'high',cat:'Contrat',rule:'contracts',title:'CDD expire dans '+daysLeft+'j — '+name,desc:(co.name||'')+' — Preparer decision',deadline:daysLeft,icon:'🟡',action:{page:'employees',client:cl.id},remedy:'Planifier entretien evaluation + decision renouvellement',emp:name});
            else if(daysLeft<=90) a.push({id:'CDD-90J-'+e.id,sev:'low',cat:'Contrat',rule:'contracts',title:'CDD a surveiller — '+name,desc:(co.name||'')+' — '+daysLeft+' jours restants',deadline:daysLeft,icon:'🔵',action:{page:'employees',client:cl.id},remedy:'Planifier evaluation mi-contrat'});
          }
          // Période essai 6 mois
          const start=new Date(e.startDate||e.start||'2020-01-01');
          const monthsIn=Math.round((now-start)/2592000000);
          if(monthsIn>=5&&monthsIn<=7) a.push({id:'EVAL-'+e.id,sev:'medium',cat:'RH',rule:'contracts',title:'Evaluation 6 mois — '+name,desc:(co.name||'')+' — '+monthsIn+' mois d\'anciennete',icon:'📋',action:{page:'employees',client:cl.id},remedy:'Planifier entretien d\'evaluation'});
          // Anniversaire d'entreprise
          if(start.getMonth()===month&&start.getDate()>=day&&start.getDate()<=day+14&&(yr-start.getFullYear())>0){
            const years=yr-start.getFullYear();
            a.push({id:'ANNIV-'+e.id,sev:'info',cat:'RH',rule:'contracts',title:'Anniversaire '+years+' an(s) — '+name,desc:(co.name||''),deadline:start.getDate()-day,icon:'🎂'});
          }
        });
      });
    }

    // ── RULE 4: PAYROLL ──
    if(rulesEnabled.payroll){
      clients.forEach(cl=>{
        const co=cl.company||{};
        (cl.emps||[]).forEach(e=>{
          const name=(e.first||e.fn||'?')+' '+(e.last||e.ln||'?');
          if(+(e.monthlySalary||e.gross||e.brut||0)<=0) a.push({id:'PAY-0-'+e.id,sev:'critical',cat:'Paie',rule:'payroll',title:'Salaire = 0€ — '+name,desc:(co.name||'')+' — Calcul paie impossible',icon:'❌',action:{page:'employees',client:cl.id},remedy:'Encoder le salaire brut mensuel dans la fiche employe'});
          if(!(e.iban||e.IBAN)) a.push({id:'PAY-IBAN-'+e.id,sev:'high',cat:'Paie',rule:'payroll',title:'IBAN manquant — '+name,desc:(co.name||'')+' — Virement SEPA impossible',icon:'🏦',action:{page:'employees',client:cl.id},remedy:'Encoder l\'IBAN dans la fiche employe'});
          if(!(e.niss||e.NISS)) a.push({id:'PAY-NISS-'+e.id,sev:'high',cat:'Compliance',rule:'payroll',title:'NISS manquant — '+name,desc:(co.name||'')+' — Dimona et DmfA impossibles',icon:'🆔',action:{page:'employees',client:cl.id},remedy:'Encoder le numero de registre national (NISS)'});
        });
      });
    }

    // ── RULE 5: RH TRENDS ──
    if(rulesEnabled.trends){
      const totalEmps=allEmps.length;
      const totalSortis=allEmps.filter(e=>{const ds=e.dateSortie||e.endDate;return ds&&new Date(ds).getFullYear()===yr;}).length;
      const turnover=totalEmps>0?Math.round(totalSortis/totalEmps*100):0;
      if(turnover>15) a.push({id:'TREND-TURNOVER',sev:'critical',cat:'Tendance',rule:'trends',title:'Turnover eleve: '+turnover+'%',desc:'Seuil d\'alerte: 15% — '+totalSortis+' depart(s) en '+yr,icon:'📉',action:{page:'tableaudirection',sub:'rh'},remedy:'Analyser causes departs + mettre en place plan de retention'});
      else if(turnover>8) a.push({id:'TREND-TURNOVER',sev:'medium',cat:'Tendance',rule:'trends',title:'Turnover modere: '+turnover+'%',desc:totalSortis+' depart(s) en '+yr,icon:'📊',action:{page:'tableaudirection',sub:'rh'}});
      const totalAbsDays=allEmps.reduce((acc,e)=>acc+(+(e.joursMaladie||e.sickDays||0))+(+(e.joursAbsence||e.absDays||0)),0);
      const absRate=totalEmps>0?Math.round(totalAbsDays/(totalEmps*220)*10000)/100:0;
      if(absRate>5) a.push({id:'TREND-ABS',sev:'high',cat:'Tendance',rule:'trends',title:'Absenteisme eleve: '+absRate+'%',desc:totalAbsDays+' jours — Seuil Belgique: 5.8%',icon:'📊',action:{page:'tableaudirection',sub:'bradford'},remedy:'Analyser Bradford + entretiens retour + plan bien-etre'});
      const masseBrute=allEmps.reduce((acc,e)=>acc+(+(e.monthlySalary||e.gross||e.brut||0)),0);
      if(masseBrute>0&&totalEmps>0){
        const coutMoyen=masseBrute*(1+TX_ONSS_E)/totalEmps;
        if(coutMoyen>5000) a.push({id:'TREND-COUT',sev:'medium',cat:'Tendance',rule:'trends',title:'Cout moyen eleve: '+fi(coutMoyen)+' €/emp/mois',desc:'Masse brute: '+fi(masseBrute)+' €/mois pour '+totalEmps+' employes',icon:'💸',action:{page:'tableaudirection',sub:'kpi'}});
      }
    }

    // Sort: critical first, then by deadline
    const sevOrder={critical:0,high:1,medium:2,low:3,info:4};
    a.sort((x,y)=>{
      if(sevOrder[x.sev]!==sevOrder[y.sev]) return sevOrder[x.sev]-sevOrder[y.sev];
      return(x.deadline||999)-(y.deadline||999);
    });
    return a;
  },[clients,rulesEnabled,day,month,yr]);

  const cats=[...new Set(alerts.map(a=>a.cat))];
  const sevCounts={critical:alerts.filter(a=>a.sev==='critical').length,high:alerts.filter(a=>a.sev==='high').length,medium:alerts.filter(a=>a.sev==='medium').length,low:alerts.filter(a=>a.sev==='low').length,info:alerts.filter(a=>a.sev==='info').length};
  const filtered=filter==='all'?alerts:['critical','high','medium','low','info'].includes(filter)?alerts.filter(a=>a.sev===filter):alerts.filter(a=>a.cat===filter);
  const sevColors={critical:'#ef4444',high:'#fb923c',medium:'#eab308',low:'#3b82f6',info:'#888'};
  const sevLabels={critical:'CRITIQUE',high:'HAUTE',medium:'MOYENNE',low:'BASSE',info:'INFO'};

  // Calendar deadlines
  const deadlines=alerts.filter(a=>typeof a.deadline==='number'&&a.deadline>=0&&a.deadline<=30).sort((a,b)=>a.deadline-b.deadline);

  return <div style={{padding:24}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:0}}>🔔 Smart Alerts</h2>
        <p style={{fontSize:12,color:'#888',margin:'4px 0 0'}}>Moteur d'alertes intelligentes — {alerts.length} alertes actives — {Object.values(rulesEnabled).filter(Boolean).length} regles actives</p>
      </div>
      {sevCounts.critical>0&&<div style={{padding:'8px 16px',borderRadius:20,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.2)',color:'#ef4444',fontWeight:700,fontSize:13}}>
        ⚠️ {sevCounts.critical} CRITIQUE{sevCounts.critical>1?'S':''}
      </div>}
    </div>

    {/* SEVERITY KPIS */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:16}}>
      {[{l:'Critiques',v:sevCounts.critical,c:'#ef4444',f:'critical'},{l:'Hautes',v:sevCounts.high,c:'#fb923c',f:'high'},{l:'Moyennes',v:sevCounts.medium,c:'#eab308',f:'medium'},{l:'Basses',v:sevCounts.low,c:'#3b82f6',f:'low'},{l:'Info',v:sevCounts.info,c:'#888',f:'info'}].map((k,i)=>
        <KPI key={i} l={k.l} v={k.v} c={k.c} onClick={()=>setFilter(filter===k.f?'all':k.f)}/>
      )}
    </div>

    {/* TABS */}
    <div style={{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'}}>
      {[{v:'dashboard',l:'📋 Toutes alertes'},{v:'calendar',l:'📅 Calendrier'},{v:'rules',l:'⚙️ Regles'},{v:'categories',l:'📊 Par categorie'}].map(t=>
        <button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 14px',borderRadius:8,border:'none',cursor:'pointer',fontSize:11,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>
      )}
      {/* Category filters */}
      {tab==='dashboard'&&<div style={{marginLeft:'auto',display:'flex',gap:3}}>
        <button onClick={()=>setFilter('all')} style={{padding:'5px 10px',borderRadius:6,border:'none',background:filter==='all'?'rgba(198,163,78,.15)':'transparent',color:filter==='all'?'#c6a34e':'#888',fontSize:10,cursor:'pointer',fontFamily:'inherit'}}>Toutes ({alerts.length})</button>
        {cats.map(c=><button key={c} onClick={()=>setFilter(filter===c?'all':c)} style={{padding:'5px 10px',borderRadius:6,border:'none',background:filter===c?'rgba(198,163,78,.15)':'transparent',color:filter===c?'#c6a34e':'#888',fontSize:10,cursor:'pointer',fontFamily:'inherit'}}>{c}</button>)}
      </div>}
    </div>

    {/* TAB: DASHBOARD */}
    {tab==='dashboard'&&<div style={{display:'flex',flexDirection:'column',gap:6}}>
      {filtered.map((a,i)=><div key={a.id||i} onClick={()=>setSelectedAlert(selectedAlert===a.id?null:a.id)} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 16px',background:a.sev==='critical'?'rgba(239,68,68,.04)':a.sev==='high'?'rgba(251,146,60,.03)':'rgba(59,130,246,.02)',border:'1px solid '+(sevColors[a.sev]||'#888')+'20',borderRadius:12,cursor:'pointer',transition:'all .15s'}}>
        <div style={{fontSize:22,flexShrink:0}}>{a.icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
            <Badge text={sevLabels[a.sev]} color={sevColors[a.sev]}/>
            <Badge text={a.cat} color="#c6a34e"/>
            {a.rule&&<Badge text={a.rule} color="#888"/>}
          </div>
          <div style={{fontSize:12,fontWeight:600,color:sevColors[a.sev]||'#e5e5e5',marginTop:4}}>{a.title}</div>
          <div style={{fontSize:10.5,color:'#888',marginTop:2}}>{a.desc}</div>
          {/* Expanded detail */}
          {selectedAlert===a.id&&<div style={{marginTop:10,padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
            {a.remedy&&<div style={{fontSize:11,color:'#4ade80',marginBottom:6}}>💡 <b>Action recommandee:</b> {a.remedy}</div>}
            {a.action&&<button onClick={(ev)=>{ev.stopPropagation();if(a.action.client)d&&d({type:'SELECT_CLIENT',id:a.action.client});setTimeout(()=>d&&d({type:'NAV',page:a.action.page,sub:a.action.sub||null}),a.action.client?80:0);}} style={{padding:'6px 14px',borderRadius:6,border:'none',background:'rgba(198,163,78,.12)',color:'#c6a34e',fontSize:11,cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>→ Traiter maintenant</button>}
          </div>}
        </div>
        <div style={{textAlign:'right',flexShrink:0,minWidth:60}}>
          {typeof a.deadline==='number'&&a.deadline>=0&&<div style={{fontSize:16,fontWeight:800,color:a.deadline<=3?'#ef4444':a.deadline<=7?'#fb923c':'#eab308'}}>J-{a.deadline}</div>}
          {typeof a.deadline==='number'&&a.deadline<0&&<div style={{fontSize:12,fontWeight:800,color:'#ef4444'}}>⚠️ +{Math.abs(a.deadline)}j</div>}
        </div>
      </div>)}
      {filtered.length===0&&<div style={{padding:40,textAlign:'center',color:'#888',fontSize:13}}>✅ Aucune alerte dans cette categorie</div>}
    </div>}

    {/* TAB: CALENDAR */}
    {tab==='calendar'&&<C title="Calendrier des echeances" sub={deadlines.length+' echeances dans les 30 prochains jours'}>
      {deadlines.length===0&&<div style={{textAlign:'center',padding:20,color:'#4ade80'}}>✅ Aucune echeance imminente</div>}
      {deadlines.map((a,i)=>{
        const targetDate=new Date(now);targetDate.setDate(day+a.deadline);
        return <div key={a.id||i} style={{display:'flex',alignItems:'center',gap:14,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <div style={{minWidth:70,textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:800,color:a.deadline<=3?'#ef4444':a.deadline<=7?'#fb923c':'#c6a34e'}}>{targetDate.getDate()}</div>
            <div style={{fontSize:9,color:'#888'}}>{mois[targetDate.getMonth()].slice(0,3)}</div>
          </div>
          <div style={{width:3,height:40,borderRadius:2,background:sevColors[a.sev]}}/>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:14}}>{a.icon}</span>
              <b style={{fontSize:12,color:'#e5e5e5'}}>{a.title}</b>
              <Badge text={'J-'+a.deadline} color={sevColors[a.sev]}/>
            </div>
            <div style={{fontSize:10,color:'#888',marginTop:2}}>{a.desc}</div>
          </div>
          {a.action&&<button onClick={()=>{if(a.action.client)d&&d({type:'SELECT_CLIENT',id:a.action.client});setTimeout(()=>d&&d({type:'NAV',page:a.action.page,sub:a.action.sub||null}),a.action.client?80:0);}} style={{padding:'5px 10px',borderRadius:6,border:'none',background:'rgba(198,163,78,.08)',color:'#c6a34e',fontSize:10,cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>→ Traiter</button>}
        </div>;
      })}
    </C>}

    {/* TAB: RULES */}
    {tab==='rules'&&<C title="Moteur de regles" sub="Activez/desactivez les categories d'alertes">
      {[{id:'deadlines',l:'Deadlines legales',desc:'ONSS, PP, DmfA, Belcotax, 13eme mois, pecule vacances',icon:'📅',count:alerts.filter(a=>a.rule==='deadline').length},
        {id:'compliance',l:'Conformite',desc:'TVA, ONSS, reglement travail, CPPT, CE',icon:'⚖️',count:alerts.filter(a=>a.rule==='compliance').length},
        {id:'contracts',l:'Contrats',desc:'CDD expirant, evaluations, anniversaires',icon:'📝',count:alerts.filter(a=>a.rule==='contracts').length},
        {id:'payroll',l:'Paie',desc:'Salaire=0, IBAN manquant, NISS manquant',icon:'💰',count:alerts.filter(a=>a.rule==='payroll').length},
        {id:'trends',l:'Tendances RH',desc:'Turnover, absenteisme, couts',icon:'📊',count:alerts.filter(a=>a.rule==='trends').length},
      ].map((r,i)=><div key={r.id} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <span style={{fontSize:24}}>{r.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:600,color:'#e5e5e5'}}>{r.l}</div>
          <div style={{fontSize:10,color:'#888'}}>{r.desc}</div>
        </div>
        <Badge text={r.count+' alertes'} color={r.count>0?'#c6a34e':'#888'}/>
        <div onClick={()=>setRulesEnabled(p=>({...p,[r.id]:!p[r.id]}))} style={{width:44,height:24,borderRadius:12,background:rulesEnabled[r.id]?'rgba(34,197,94,.3)':'rgba(255,255,255,.08)',cursor:'pointer',position:'relative',transition:'all .2s'}}>
          <div style={{width:18,height:18,borderRadius:9,background:rulesEnabled[r.id]?'#4ade80':'#888',position:'absolute',top:3,left:rulesEnabled[r.id]?23:3,transition:'all .2s'}}/>
        </div>
      </div>)}
    </C>}

    {/* TAB: CATEGORIES */}
    {tab==='categories'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      {cats.map(cat=>{
        const catAlerts=alerts.filter(a=>a.cat===cat);
        return <C key={cat} title={cat+' ('+catAlerts.length+')'}>
          {catAlerts.slice(0,5).map((a,i)=><div key={a.id||i} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.02)'}}>
            <span style={{fontSize:14}}>{a.icon}</span>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,color:'#e5e5e5',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.title}</div></div>
            <Badge text={sevLabels[a.sev]} color={sevColors[a.sev]}/>
          </div>)}
          {catAlerts.length>5&&<div style={{fontSize:10,color:'#888',marginTop:6}}>+ {catAlerts.length-5} autres alertes</div>}
        </C>;
      })}
    </div>}
  </div>;
}


// ═══════════════════════════════════════════════════════════
// 2. NOTIFICATION CENTER — Hub unifie avec preferences
// ═══════════════════════════════════════════════════════════
export function NotificationCenterV2({s,d}){
  const clients=s.clients||[];
  const now=new Date();
  const day=now.getDate();const month=now.getMonth();const yr=now.getFullYear();
  const ncValidTabs=['inbox','prefs'];
  const [tab,setTab]=useState(s.sub&&ncValidTabs.includes(s.sub)?s.sub:'inbox');
  useEffect(()=>{if(s.sub&&ncValidTabs.includes(s.sub))setTab(s.sub);},[s.sub]);
  const [filter,setFilter]=useState('all');
  const [prefs,setPrefs]=useState({deadlines:true,compliance:true,contracts:true,payroll:true,rh:true,freq:'realtime'});

  // Generate notifications from data
  const notifs=useMemo(()=>{
    const n=[];
    const addN=(type,icon,title,desc,cat,sev,action,ts)=>n.push({id:'N-'+Math.random().toString(36).substr(2,8),type,icon,title,desc,cat,sev:sev||'medium',action,time:ts||now.toISOString(),read:false});

    // DEADLINE NOTIFICATIONS
    if(prefs.deadlines){
      if(day<=5) addN('deadline','🏛','ONSS provisions dues le 5','Paiement ONSS du avant le 5 '+mois[month],'ONSS','critical',{page:'onss'});
      if(day<=15) addN('deadline','💰','Precompte professionnel','Declaration PP avant le 15 '+mois[month],'Fiscal',day<=5?'critical':'high',{page:'fiscal'});
      if(day<=25) addN('deadline','💳','Virements SEPA salaires','SEPA a executer avant le 25','Paie','medium',{page:'sepa'});
      if([0,3,6,9].includes(month)&&day<=10) addN('deadline','🏛','DmfA T'+Math.ceil((month+1)/3),'Declaration trimestrielle','ONSS','critical',{page:'onss'});
    }

    // EMPLOYEE NOTIFICATIONS
    if(prefs.payroll||prefs.compliance){
      clients.forEach(cl=>{
        const co=cl.company||{};
        (cl.emps||[]).forEach(e=>{
          const name=(e.first||e.fn||'?')+' '+(e.last||e.ln||'?');
          if(prefs.payroll&&+(e.monthlySalary||e.gross||0)<=0) addN('error','❌','Salaire = 0€ — '+name,(co.name||'')+' — Fiche impossible','Paie','critical',{page:'employees',client:cl.id});
          if(prefs.compliance&&!(e.niss||e.NISS)) addN('warning','🆔','NISS manquant — '+name,(co.name||''),'Compliance','high',{page:'employees',client:cl.id});
          if(prefs.payroll&&!(e.iban||e.IBAN)) addN('warning','🏦','IBAN manquant — '+name,(co.name||''),'Paie','high',{page:'employees',client:cl.id});
        });
      });
    }

    // CONTRACT NOTIFICATIONS
    if(prefs.contracts){
      clients.forEach(cl=>{
        const co=cl.company||{};
        (cl.emps||[]).forEach(e=>{
          const name=(e.first||e.fn||'?')+' '+(e.last||e.ln||'?');
          if((e.contractType||'').toUpperCase()==='CDD'){
            const end=new Date(e.endDate||e.end||'2099-12-31');
            const daysLeft=Math.ceil((end-now)/86400000);
            if(daysLeft<0) addN('error','🔴','CDD EXPIRE — '+name,(co.name||'')+' — '+Math.abs(daysLeft)+'j de retard','Contrat','critical',{page:'employees',client:cl.id});
            else if(daysLeft<=30) addN('warning','🟡','CDD expire dans '+daysLeft+'j — '+name,(co.name||''),'Contrat','high',{page:'employees',client:cl.id});
          }
        });
      });
    }

    // RH TRENDS
    if(prefs.rh){
      const allEmps=clients.flatMap(c=>c.emps||[]);
      const sortis=allEmps.filter(e=>{const ds=e.dateSortie||e.endDate;return ds&&new Date(ds).getFullYear()===yr;});
      const turnover=allEmps.length>0?Math.round(sortis.length/allEmps.length*100):0;
      if(turnover>15) addN('trend','📉','Turnover eleve: '+turnover+'%',sortis.length+' depart(s) en '+yr,'Tendance','critical',{page:'tableaudirection',sub:'rh'});
    }

    // SYSTEM
    addN('system','🚀','Smart Alerts v2 actif','Moteur d\'alertes intelligentes deploye','Systeme','info',null,new Date(now-60000).toISOString());

    n.sort((a,b)=>{const sev={critical:0,high:1,medium:2,low:3,info:4};return(sev[a.sev]||4)-(sev[b.sev]||4);});
    return n;
  },[clients,prefs,day,month]);

  const [readIds,setReadIds]=useState(new Set());
  const markRead=id=>setReadIds(p=>{const s2=new Set(p);s2.add(id);return s2;});
  const markAllRead=()=>setReadIds(new Set(notifs.map(n=>n.id)));
  const unread=notifs.filter(n=>!readIds.has(n.id)).length;
  const sevColors={critical:'#ef4444',high:'#fb923c',medium:'#eab308',low:'#3b82f6',info:'#888'};
  const filteredNotifs=filter==='all'?notifs:filter==='unread'?notifs.filter(n=>!readIds.has(n.id)):notifs.filter(n=>n.sev===filter);

  return <div style={{padding:24}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>🔔 Centre de Notifications</h2>
        <p style={{fontSize:12,color:'#888',margin:0}}>{unread} non lue(s) — {notifs.length} total — Declencheurs auto actifs</p>
      </div>
      <div style={{display:'flex',gap:8}}>
        {unread>0&&<button onClick={markAllRead} style={{padding:'8px 14px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',background:'transparent',color:'#c6a34e',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>✓ Tout marquer lu</button>}
      </div>
    </div>

    {/* KPIs */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:16}}>
      <KPI l="Non lues" v={unread} c={unread>5?'#ef4444':'#c6a34e'} onClick={()=>setFilter('unread')}/>
      <KPI l="Critiques" v={notifs.filter(n=>n.sev==='critical').length} c="#ef4444" onClick={()=>setFilter('critical')}/>
      <KPI l="Hautes" v={notifs.filter(n=>n.sev==='high').length} c="#fb923c" onClick={()=>setFilter('high')}/>
      <KPI l="Moyennes" v={notifs.filter(n=>n.sev==='medium').length} c="#eab308" onClick={()=>setFilter('medium')}/>
      <KPI l="Total" v={notifs.length} c="#888" onClick={()=>setFilter('all')}/>
    </div>

    {/* TABS */}
    <div style={{display:'flex',gap:4,marginBottom:16}}>
      {[{v:'inbox',l:'📥 Boite de reception'},{v:'prefs',l:'⚙️ Preferences declencheurs'}].map(t=>
        <button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 14px',borderRadius:8,border:'none',cursor:'pointer',fontSize:11,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>
      )}
    </div>

    {/* INBOX */}
    {tab==='inbox'&&<div style={{display:'flex',flexDirection:'column',gap:4}}>
      {filteredNotifs.length===0&&<div style={{textAlign:'center',padding:40,color:'#555',fontSize:13}}>Aucune notification</div>}
      {filteredNotifs.map(n=>{const isRead=readIds.has(n.id);return <div key={n.id} onClick={()=>markRead(n.id)} style={{display:'flex',gap:12,padding:'12px 16px',background:isRead?'transparent':'rgba(198,163,78,.03)',border:'1px solid '+(isRead?'rgba(255,255,255,.03)':'rgba(198,163,78,.1)'),borderRadius:10,cursor:'pointer',alignItems:'center',transition:'all .15s'}}>
        <div style={{fontSize:20,flexShrink:0}}>{n.icon}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:12,fontWeight:isRead?400:600,color:isRead?'#888':'#e5e5e5'}}>{n.title}</span>
            {!isRead&&<span style={{width:6,height:6,borderRadius:3,background:'#c6a34e',flexShrink:0}}/>}
          </div>
          <div style={{fontSize:10,color:'#666',marginTop:2}}>{n.desc}</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0}}>
          <Badge text={n.sev} color={sevColors[n.sev]}/>
          <Badge text={n.cat} color="#888"/>
        </div>
        {n.action&&<button onClick={(ev)=>{ev.stopPropagation();if(n.action.client)d&&d({type:'SELECT_CLIENT',id:n.action.client});setTimeout(()=>d&&d({type:'NAV',page:n.action.page,sub:n.action.sub||null}),n.action.client?80:0);}} style={{padding:'4px 10px',borderRadius:5,border:'none',background:'rgba(198,163,78,.08)',color:'#c6a34e',fontSize:9,cursor:'pointer',fontWeight:600,fontFamily:'inherit',flexShrink:0}}>→</button>}
      </div>;})}
    </div>}

    {/* PREFERENCES */}
    {tab==='prefs'&&<C title="Preferences de declenchement" sub="Choisissez quelles notifications vous souhaitez recevoir">
      {[{id:'deadlines',l:'Deadlines legales',desc:'ONSS, PP, DmfA, Belcotax, pecule, 13eme mois',icon:'📅'},
        {id:'compliance',l:'Conformite',desc:'TVA, ONSS, NISS manquants, reglement travail',icon:'⚖️'},
        {id:'contracts',l:'Contrats',desc:'CDD expirant, evaluations, renouvellements',icon:'📝'},
        {id:'payroll',l:'Paie',desc:'Salaire=0, IBAN manquant, virements',icon:'💰'},
        {id:'rh',l:'Tendances RH',desc:'Turnover, absenteisme, alertes tendances',icon:'📊'},
      ].map((r,i)=><div key={r.id} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <span style={{fontSize:24}}>{r.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:600,color:'#e5e5e5'}}>{r.l}</div>
          <div style={{fontSize:10,color:'#888'}}>{r.desc}</div>
        </div>
        <div onClick={()=>setPrefs(p=>({...p,[r.id]:!p[r.id]}))} style={{width:44,height:24,borderRadius:12,background:prefs[r.id]?'rgba(34,197,94,.3)':'rgba(255,255,255,.08)',cursor:'pointer',position:'relative',transition:'all .2s'}}>
          <div style={{width:18,height:18,borderRadius:9,background:prefs[r.id]?'#4ade80':'#888',position:'absolute',top:3,left:prefs[r.id]?23:3,transition:'all .2s'}}/>
        </div>
      </div>)}
      <div style={{marginTop:16,padding:12,background:'rgba(198,163,78,.04)',borderRadius:8}}>
        <div style={{fontSize:11,color:'#c6a34e',fontWeight:600,marginBottom:8}}>Frequence de notification</div>
        <div style={{display:'flex',gap:6}}>
          {[{id:'realtime',l:'Temps reel'},{id:'daily',l:'Resume quotidien'},{id:'weekly',l:'Resume hebdo'}].map(f=>
            <button key={f.id} onClick={()=>setPrefs(p=>({...p,freq:f.id}))} style={{padding:'6px 14px',borderRadius:6,border:'none',background:prefs.freq===f.id?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:prefs.freq===f.id?'#c6a34e':'#888',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>{f.l}</button>
          )}
        </div>
      </div>
    </C>}
  </div>;
}


// ═══════════════════════════════════════════════════════════
// 3. JOURNAL ACTIVITE — Audit trail complet qui/quoi/quand
// ═══════════════════════════════════════════════════════════
export function JournalActiviteV2({s,d}){
  const clients=s.clients||[];
  const now=new Date();
  const jaValidTabs=['timeline','bytype','byuser'];
  const [tab,setTab]=useState(s.sub&&jaValidTabs.includes(s.sub)?s.sub:'timeline');
  useEffect(()=>{if(s.sub&&jaValidTabs.includes(s.sub))setTab(s.sub);},[s.sub]);
  const [filter,setFilter]=useState('all');
  const [search,setSearch]=useState('');
  const [selectedEntry,setSelectedEntry]=useState(null);
  const [dateRange,setDateRange]=useState('all');

  // Build comprehensive audit trail from all data
  const auditTrail=useMemo(()=>{
    const entries=[];
    const add=(type,icon,action,target,detail,user,who,clientName,ts,meta)=>entries.push({
      id:'AUD-'+Math.random().toString(36).substr(2,8),
      type,icon,action,target,detail,
      user:user||'admin',who:who||s.user?.email||'admin@aureussocial.be',
      client:clientName||'',
      time:ts||now.toISOString(),
      meta:meta||{}
    });

    clients.forEach(cl=>{
      const co=cl.company||{};const cname=co.name||cl.id;

      // Client creation/update
      if(cl.createdAt) add('client','🏢','CREATE','Client: '+cname,'Dossier client cree'+(co.vat?' — TVA: '+co.vat:''),'admin',s.user?.email,cname,cl.createdAt,{entity:'client',entityId:cl.id,vat:co.vat});
      if(cl.updatedAt&&cl.updatedAt!==cl.createdAt) add('client','✏️','UPDATE','Client: '+cname,'Dossier client modifie','admin',s.user?.email,cname,cl.updatedAt,{entity:'client',entityId:cl.id});

      // Employee entries
      (cl.emps||[]).forEach(e=>{
        const ename=(e.first||e.fn||'?')+' '+(e.last||e.ln||'?');
        if(e.createdAt||e.startDate||e.start){
          const ts=e.createdAt||e.startDate||e.start;
          add('employee','👤','CREATE','Employe: '+ename,'Ajout employe — Brut: '+(+(e.monthlySalary||e.gross||0)>0?fmt(+(e.monthlySalary||e.gross||0))+' €':'non defini')+' — Contrat: '+(e.contractType||e.contrat||'CDI'),'admin',s.user?.email,cname,ts,{entity:'employee',entityId:e.id,brut:+(e.monthlySalary||e.gross||0),contrat:e.contractType||'CDI',niss:e.niss||'N/A'});
        }
        if(e.updatedAt&&e.updatedAt!==(e.createdAt||e.startDate)){
          add('employee','✏️','UPDATE','Employe: '+ename,'Modification fiche employe','admin',s.user?.email,cname,e.updatedAt,{entity:'employee',entityId:e.id});
        }
        // Absences
        (e.absences||[]).forEach(ab=>{
          add('absence','📅','CREATE','Absence: '+ename,ab.type+' — '+(ab.days||ab.jours||'?')+' jours'+(ab.from?' — Du '+ab.from:''),'client',e.email||s.user?.email,cname,ab.createdAt||ab.from||now.toISOString(),{entity:'absence',empName:ename,type:ab.type});
        });
      });

      // Payslips
      (cl.pays||[]).forEach(p=>{
        add('payroll','🧮','CALC','Paie: '+(p.empName||'Employe'),'Calcul fiche de paie'+(p.brut?' — Brut: '+fmt(p.brut)+' €':'')+(p.net?' — Net: '+fmt(p.net)+' €':''),'admin',s.user?.email,cname,p.date||p.createdAt||now.toISOString(),{entity:'payslip',empName:p.empName,brut:p.brut,net:p.net});
      });

      // Dimona
      (cl.dims||[]).forEach(dm=>{
        add('dimona','📡','SUBMIT','Dimona '+(dm.type||'IN')+': '+(dm.empName||'Employe'),'Declaration Dimona '+(dm.type||'')+' soumise'+(dm.niss?' — NISS: '+dm.niss:''),'admin',s.user?.email,cname,dm.date||dm.createdAt||now.toISOString(),{entity:'dimona',type:dm.type});
      });

      // SEPA
      (cl.sepas||[]).forEach(sp=>{
        add('sepa','💳','GENERATE','SEPA: '+(cname),'Fichier SEPA genere — '+(sp.count||'?')+' virements — '+(sp.total?fmt(sp.total)+' €':''),'admin',s.user?.email,cname,sp.date||now.toISOString(),{entity:'sepa',total:sp.total});
      });

      // Documents
      (cl.docs||[]).forEach(doc=>{
        add('document','📄','GENERATE','Doc: '+(doc.name||doc.type||'Document'),'Document genere pour '+(cname),'admin',s.user?.email,cname,doc.date||doc.createdAt||now.toISOString(),{entity:'document',docType:doc.type});
      });
    });

    // System entries
    add('system','🚀','DEPLOY','Systeme','Sprint 37 deploye — Smart Alerts + Journal Audit','system','system@aureussocial.be','',now.toISOString());
    if(clients.length>0) add('system','📊','SCAN','Systeme','Scan automatique: '+clients.length+' clients — '+clients.reduce((a,c)=>a+(c.emps||[]).length,0)+' employes','system','system@aureussocial.be','',now.toISOString());

    entries.sort((a,b)=>new Date(b.time)-new Date(a.time));
    return entries;
  },[clients]);

  const typeColors={client:'#c6a34e',employee:'#3b82f6',payroll:'#22c55e',dimona:'#a855f7',sepa:'#06b6d4',absence:'#f97316',document:'#ec4899',system:'#888',email:'#60a5fa'};
  const actionColors={CREATE:'#22c55e',UPDATE:'#3b82f6',DELETE:'#ef4444',CALC:'#c6a34e',SUBMIT:'#a855f7',GENERATE:'#06b6d4',SEND:'#60a5fa',DEPLOY:'#888',SCAN:'#888'};

  // Filters
  const types=[...new Set(auditTrail.map(e=>e.type))];
  const dateFiltered=dateRange==='all'?auditTrail:dateRange==='today'?auditTrail.filter(e=>(Date.now()-new Date(e.time))<86400000):dateRange==='week'?auditTrail.filter(e=>(Date.now()-new Date(e.time))<7*86400000):dateRange==='month'?auditTrail.filter(e=>(Date.now()-new Date(e.time))<30*86400000):auditTrail;
  const filtered=dateFiltered.filter(e=>(filter==='all'||e.type===filter)&&(!search||[e.action,e.target,e.detail,e.who,e.client].join(' ').toLowerCase().includes(search.toLowerCase())));

  // Stats
  const stats={total:auditTrail.length,today:auditTrail.filter(e=>(Date.now()-new Date(e.time))<86400000).length,users:[...new Set(auditTrail.map(e=>e.who))].length,clients:[...new Set(auditTrail.filter(e=>e.client).map(e=>e.client))].length};

  // Export CSV
  const exportCSV=()=>{
    const header='Date;Heure;Utilisateur;Action;Cible;Detail;Client;Type\n';
    const rows=filtered.map(e=>{const d=new Date(e.time);return d.toLocaleDateString('fr-BE')+';'+d.toLocaleTimeString('fr-BE')+';'+e.who+';'+e.action+';'+(e.target||'')+';'+(e.detail||'').replace(/;/g,',')+';'+e.client+';'+e.type;}).join('\n');
    const blob=new Blob(['\uFEFF'+header+rows],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='journal_audit_'+new Date().toISOString().slice(0,10)+'.csv';a.click();URL.revokeObjectURL(url);
  };

  return <div style={{padding:24}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>📋 Journal d'Activite</h2>
        <p style={{fontSize:12,color:'#888',margin:0}}>Audit trail complet — Qui / Quoi / Quand / Ou — {auditTrail.length} entrees</p>
      </div>
      <div style={{display:'flex',gap:8}}>
        <button onClick={exportCSV} style={{padding:'8px 14px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',background:'transparent',color:'#c6a34e',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>📥 Export CSV</button>
      </div>
    </div>

    {/* KPIs */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
      <KPI l="Actions totales" v={stats.total} c="#c6a34e"/>
      <KPI l="Aujourd'hui" v={stats.today} c="#22c55e"/>
      <KPI l="Utilisateurs" v={stats.users} c="#3b82f6"/>
      <KPI l="Clients actifs" v={stats.clients} c="#a855f7"/>
    </div>

    {/* TABS + SEARCH */}
    <div style={{display:'flex',gap:4,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
      {[{v:'timeline',l:'📋 Timeline'},{v:'bytype',l:'📊 Par type'},{v:'byuser',l:'👤 Par utilisateur'}].map(t=>
        <button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 14px',borderRadius:8,border:'none',cursor:'pointer',fontSize:11,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>
      )}
      <div style={{marginLeft:'auto',display:'flex',gap:6}}>
        {[{id:'all',l:'Tout'},{id:'today',l:'Auj.'},{id:'week',l:'7j'},{id:'month',l:'30j'}].map(dr=>
          <button key={dr.id} onClick={()=>setDateRange(dr.id)} style={{padding:'5px 10px',borderRadius:6,border:'none',background:dateRange===dr.id?'rgba(198,163,78,.15)':'transparent',color:dateRange===dr.id?'#c6a34e':'#888',fontSize:10,cursor:'pointer',fontFamily:'inherit'}}>{dr.l}</button>
        )}
      </div>
    </div>

    {/* SEARCH + TYPE FILTERS */}
    <div style={{display:'flex',gap:6,marginBottom:14,alignItems:'center',flexWrap:'wrap'}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher action, employe, client..." style={{padding:'8px 14px',width:260,background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,color:'#e5e5e5',fontSize:11,fontFamily:'inherit',outline:'none'}}/>
      <button onClick={()=>setFilter('all')} style={{padding:'5px 10px',borderRadius:6,border:'none',background:filter==='all'?'rgba(198,163,78,.15)':'transparent',color:filter==='all'?'#c6a34e':'#888',fontSize:10,cursor:'pointer',fontFamily:'inherit'}}>Tout ({auditTrail.length})</button>
      {types.map(t=><button key={t} onClick={()=>setFilter(filter===t?'all':t)} style={{padding:'5px 10px',borderRadius:6,border:'none',background:filter===t?(typeColors[t]||'#888')+'20':'transparent',color:filter===t?typeColors[t]||'#888':'#888',fontSize:10,cursor:'pointer',fontFamily:'inherit'}}>{t} ({auditTrail.filter(e=>e.type===t).length})</button>)}
    </div>

    {/* TIMELINE */}
    {tab==='timeline'&&<div style={{border:'1px solid rgba(198,163,78,.1)',borderRadius:14,overflow:'hidden'}}>
      {/* Header */}
      <div style={{display:'grid',gridTemplateColumns:'140px 80px 1fr 160px 100px',padding:'8px 14px',background:'rgba(198,163,78,.06)',fontSize:9,fontWeight:600,color:'#c6a34e',textTransform:'uppercase',letterSpacing:'.5px'}}>
        <div>Date / Heure</div><div>Action</div><div>Cible / Detail</div><div>Utilisateur</div><div>Client</div>
      </div>
      <div style={{maxHeight:500,overflowY:'auto'}}>
        {filtered.length===0&&<div style={{padding:30,textAlign:'center',color:'#555',fontSize:12}}>Aucune entree trouvee</div>}
        {filtered.slice(0,100).map((e,i)=>{
          const d=new Date(e.time);
          return <div key={e.id} onClick={()=>setSelectedEntry(selectedEntry===e.id?null:e.id)} style={{display:'grid',gridTemplateColumns:'140px 80px 1fr 160px 100px',padding:'8px 14px',borderBottom:'1px solid rgba(255,255,255,.02)',fontSize:11,cursor:'pointer',background:selectedEntry===e.id?'rgba(198,163,78,.04)':'transparent',transition:'background .1s'}}>
            <div>
              <div style={{color:'#e8e6e0',fontSize:10.5}}>{d.toLocaleDateString('fr-BE')}</div>
              <div style={{color:'#555',fontSize:9}}>{d.toLocaleTimeString('fr-BE')}</div>
            </div>
            <div><Badge text={e.action} color={actionColors[e.action]||'#888'}/></div>
            <div style={{minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <span style={{fontSize:14}}>{e.icon}</span>
                <span style={{color:'#e8e6e0',fontWeight:500}}>{e.target}</span>
              </div>
              <div style={{fontSize:10,color:'#666',marginTop:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.detail}</div>
              {/* Expanded detail */}
              {selectedEntry===e.id&&e.meta&&Object.keys(e.meta).length>0&&<div style={{marginTop:6,padding:8,background:'rgba(198,163,78,.04)',borderRadius:6,fontSize:10}}>
                {Object.entries(e.meta).map(([k,v])=>v?<div key={k} style={{color:'#888'}}><b style={{color:'#c6a34e'}}>{k}:</b> {String(v)}</div>:null)}
              </div>}
            </div>
            <div style={{fontSize:10,color:'#888'}}>{e.who==='system@aureussocial.be'?'⚙️ Systeme':e.who?.split('@')[0]||e.user}</div>
            <div style={{fontSize:10,color:typeColors[e.type]||'#888'}}>{e.client||'—'}</div>
          </div>;
        })}
      </div>
      {filtered.length>100&&<div style={{padding:8,textAlign:'center',fontSize:10,color:'#888'}}>Affichage limite a 100 entrees — {filtered.length} au total</div>}
    </div>}

    {/* BY TYPE */}
    {tab==='bytype'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      {types.map(t=>{
        const typeEntries=dateFiltered.filter(e=>e.type===t);
        return <C key={t} title={t.charAt(0).toUpperCase()+t.slice(1)+' ('+typeEntries.length+')'}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
            <div style={{width:12,height:12,borderRadius:3,background:typeColors[t]||'#888'}}/>
            <span style={{fontSize:11,color:'#888'}}>{typeEntries.length} action(s)</span>
          </div>
          {typeEntries.slice(0,5).map((e,i)=><div key={e.id} style={{fontSize:10,padding:'4px 0',borderBottom:'1px solid rgba(255,255,255,.02)',color:'#e8e6e0'}}>
            <span style={{color:'#888'}}>{new Date(e.time).toLocaleDateString('fr-BE')}</span> — {e.target}
          </div>)}
          {typeEntries.length>5&&<div style={{fontSize:9,color:'#888',marginTop:4}}>+ {typeEntries.length-5} autres</div>}
        </C>;
      })}
    </div>}

    {/* BY USER */}
    {tab==='byuser'&&<div>
      {[...new Set(auditTrail.map(e=>e.who))].map(user=>{
        const userEntries=dateFiltered.filter(e=>e.who===user);
        return <C key={user} title={(user==='system@aureussocial.be'?'⚙️ Systeme':'👤 '+(user?.split('@')[0]||user))+' ('+userEntries.length+' actions)'}>
          {userEntries.slice(0,8).map((e,i)=><div key={e.id} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.02)'}}>
            <span style={{fontSize:12}}>{e.icon}</span>
            <Badge text={e.action} color={actionColors[e.action]}/>
            <span style={{fontSize:10.5,color:'#e8e6e0',flex:1}}>{e.target}</span>
            <span style={{fontSize:9,color:'#888'}}>{timeAgo(e.time)}</span>
          </div>)}
          {userEntries.length>8&&<div style={{fontSize:9,color:'#888',marginTop:4}}>+ {userEntries.length-8} autres actions</div>}
        </C>;
      })}
    </div>}
  </div>;
}
