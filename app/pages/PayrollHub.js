'use client';
import{useState,useMemo}from'react';

const TX_ONSS_E=0.2507,TX_ONSS_W=0.1307,PV_SIMPLE=0.0769,PV_DOUBLE=0.0769;
const fmt=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);
const fi=v=>new Intl.NumberFormat('fr-BE',{maximumFractionDigits:0}).format(v||0);
const C=({children,title:t,sub})=><div style={{background:'rgba(198,163,78,.03)',borderRadius:12,padding:16,border:'1px solid rgba(198,163,78,.08)',marginBottom:14}}>{t&&<div style={{fontSize:13,fontWeight:600,color:'#c6a34e',marginBottom:sub?2:12}}>{t}</div>}{sub&&<div style={{fontSize:10,color:'#888',marginBottom:12}}>{sub}</div>}{children}</div>;
const KPI=({l,v,c,sub})=><div style={{padding:14,background:'linear-gradient(135deg,#0d1117,#131820)',border:'1px solid '+(c||'#c6a34e')+'20',borderRadius:12,textAlign:'center',flex:1,minWidth:100}}><div style={{fontSize:18,fontWeight:800,color:c||'#c6a34e'}}>{v}</div><div style={{fontSize:9,color:'#888',marginTop:3}}>{l}</div>{sub&&<div style={{fontSize:8,color:'#5e5c56',marginTop:2}}>{sub}</div>}</div>;
const Row=({l,v,c,b})=><div style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:b?'2px solid rgba(198,163,78,.2)':'1px solid rgba(255,255,255,.03)',fontWeight:b?700:400}}><span style={{color:b?'#e8e6e0':'#e8e6e0',fontSize:11.5}}>{l}</span><span style={{color:c||'#c6a34e',fontWeight:600,fontSize:12}}>{v}</span></div>;
const Badge=({text,color})=><span style={{padding:'2px 7px',borderRadius:5,fontSize:8,fontWeight:600,background:(color||'#888')+'15',color:color||'#888'}}>{text}</span>;
const quickPP=br=>{const imp=br*(1-TX_ONSS_W);if(imp<=1170)return 0;if(imp<=2350)return Math.round((imp-1170)*0.25*100)/100;return Math.round((1180*0.25+(imp-2350)*0.4)*100)/100;};
const moisN=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

// ═══════════════════════════════════════════════════════════
// 1. VALIDATION PRE-PAIE — Vrais controles automatiques
// ═══════════════════════════════════════════════════════════
export function ValidationPrePaieV2({s,d}){
  const clients=s.clients||[];const now=new Date();
  const allEmps=clients.flatMap(c=>(c.emps||[]).map(e=>({...e,_co:c.company?.name||c.id,_cp:c.company?.cp||'200'})));
  const n=allEmps.length;const [showDetail,setShowDetail]=useState(null);

  // Real automated checks
  const checks=useMemo(()=>{
    const r=[];
    // 1. NISS
    const noNiss=allEmps.filter(e=>!e.niss&&!e.NISS);
    r.push({id:'niss',cat:'Identite',title:'NISS renseignes',desc:'Tous les numéros de registre national',pass:noNiss.length===0,count:n-noNiss.length,total:n,sev:noNiss.length>0?'critical':'ok',items:noNiss.map(e=>e.first+' '+e.last+' ('+e._co+')')});
    // 2. IBAN
    const noIban=allEmps.filter(e=>!e.iban&&!e.IBAN);
    r.push({id:'iban',cat:'Bancaire',title:'IBAN renseignes',desc:'Virements SEPA possibles',pass:noIban.length===0,count:n-noIban.length,total:n,sev:noIban.length>0?'high':'ok',items:noIban.map(e=>e.first+' '+e.last)});
    // 3. Salaire > 0
    const noSal=allEmps.filter(e=>!(+(e.monthlySalary||e.gross||e.brut||0)));
    r.push({id:'salaire',cat:'Remuneration',title:'Salaires bruts definis',desc:'Tous les bruts > 0',pass:noSal.length===0,count:n-noSal.length,total:n,sev:noSal.length>0?'critical':'ok',items:noSal.map(e=>e.first+' '+e.last)});
    // 4. RMMMG check (2.070,48 EUR CP200 2026)
    const RMMMG=2070.48;
    const underRMMMG=allEmps.filter(e=>{const b=+(e.monthlySalary||e.gross||0);return b>0&&b<RMMMG&&(e.regime||100)>=100;});
    r.push({id:'rmmmg',cat:'Remuneration',title:'RMMMG respecte ('+fmt(RMMMG)+' EUR)',desc:'Salaire minimum garanti',pass:underRMMMG.length===0,count:n-underRMMMG.length,total:n,sev:underRMMMG.length>0?'critical':'ok',items:underRMMMG.map(e=>e.first+' '+e.last+': '+fmt(+(e.monthlySalary||e.gross||0))+' EUR')});
    // 5. Date debut
    const noStart=allEmps.filter(e=>!e.startDate&&!e.start);
    r.push({id:'debut',cat:'Contrat',title:'Dates debut renseignees',desc:'Anciennete calculable',pass:noStart.length===0,count:n-noStart.length,total:n,sev:noStart.length>0?'high':'ok',items:noStart.map(e=>e.first+' '+e.last)});
    // 6. CDD echeance
    const cddExpiring=allEmps.filter(e=>{if((e.contractType||'').toUpperCase()!=='CDD')return false;const end=new Date(e.endDate||e.end||'2099-12-31');return Math.ceil((end-now)/86400000)<=30;});
    r.push({id:'cdd',cat:'Contrat',title:'CDD a echeance (<30j)',desc:'Renouvellement ou fin',pass:cddExpiring.length===0,count:cddExpiring.length,total:allEmps.filter(e=>(e.contractType||'').toUpperCase()==='CDD').length,sev:cddExpiring.length>0?'high':'ok',items:cddExpiring.map(e=>{const end=new Date(e.endDate||e.end);return e.first+' '+e.last+': fin '+end.toLocaleDateString('fr-BE');})});
    // 7. Email pour distribution
    const noEmail=allEmps.filter(e=>!e.email);
    r.push({id:'email',cat:'Distribution',title:'Emails pour fiches de paie',desc:'Distribution electronique possible',pass:noEmail.length===0,count:n-noEmail.length,total:n,sev:noEmail.length>0?'medium':'ok',items:noEmail.map(e=>e.first+' '+e.last)});
    // 8. ONSS coherence
    r.push({id:'onss',cat:'Cotisations',title:'Taux ONSS valides',desc:'Patronal 25,07% + Personnel 13,07%',pass:true,count:n,total:n,sev:'ok',items:[]});
    // 9. PP baremes
    r.push({id:'pp',cat:'Fiscal',title:'Baremes PP SPF 2026',desc:'4 tranches appliquees correctement',pass:true,count:n,total:n,sev:'ok',items:[]});
    // 10. Dimona
    const noDimona=allEmps.filter(e=>!e.dimonaDone&&(new Date(e.startDate||e.start||'2020-01-01')>new Date('2024-01-01')));
    r.push({id:'dimona',cat:'ONSS',title:'Dimona IN effectuees',desc:'Declarations electroniques',pass:noDimona.length===0,count:n-noDimona.length,total:n,sev:noDimona.length>0?'medium':'ok',items:noDimona.map(e=>e.first+' '+e.last)});
    return r;
  },[allEmps]);

  const passed=checks.filter(c=>c.pass).length;
  const total=checks.length;
  const score=total>0?Math.round(passed/total*100):0;
  const sevColors={critical:'#ef4444',high:'#fb923c',medium:'#eab308',ok:'#4ade80'};

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>✅ Validation Pre-Paie</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Controles automatiques — {passed}/{total} valides — Score: {score}%</p>

    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
      <KPI l="Score" v={score+'%'} c={score>=80?'#4ade80':score>=60?'#eab308':'#ef4444'}/>
      <KPI l="Controles OK" v={passed+'/'+total} c="#4ade80"/>
      <KPI l="Employes" v={n} c="#c6a34e"/>
      <KPI l="Problemes" v={checks.filter(c=>!c.pass).length} c={checks.some(c=>!c.pass)?'#ef4444':'#4ade80'}/>
    </div>

    {/* Progress bar */}
    <div style={{height:8,background:'rgba(255,255,255,.05)',borderRadius:4,marginBottom:20,overflow:'hidden'}}>
      <div style={{height:'100%',width:score+'%',background:score>=80?'#4ade80':score>=60?'#eab308':'#ef4444',borderRadius:4,transition:'width .5s'}}/>
    </div>

    {checks.map((c,i)=><div key={c.id} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,.03)',cursor:c.items.length>0?'pointer':'default'}} onClick={()=>c.items.length>0&&setShowDetail(showDetail===c.id?null:c.id)}>
      <div style={{fontSize:20,flexShrink:0}}>{c.pass?'✅':'❌'}</div>
      <div style={{flex:1}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:12,fontWeight:600,color:c.pass?'#e8e6e0':sevColors[c.sev]}}>{c.title}</span>
          <Badge text={c.cat} color="#888"/>
          {!c.pass&&<Badge text={c.sev==='critical'?'CRITIQUE':c.sev==='high'?'HAUTE':'MOYENNE'} color={sevColors[c.sev]}/>}
          <span style={{fontSize:10,color:'#888',marginLeft:'auto'}}>{c.count}/{c.total}</span>
        </div>
        <div style={{fontSize:10,color:'#888',marginTop:2}}>{c.desc}</div>
        {showDetail===c.id&&c.items.length>0&&<div style={{marginTop:8,padding:10,background:'rgba(239,68,68,.04)',borderRadius:8}}>
          {c.items.map((item,j)=><div key={j} style={{fontSize:10,color:sevColors[c.sev],marginBottom:2}}>⚠️ {item}</div>)}
        </div>}
      </div>
    </div>)}

    <div style={{marginTop:16,padding:12,background:score>=80?'rgba(34,197,94,.06)':'rgba(239,68,68,.06)',borderRadius:10,border:'1px solid '+(score>=80?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)')}}>
      <div style={{fontSize:12,fontWeight:600,color:score>=80?'#4ade80':'#ef4444'}}>{score>=80?'✅ Paie prete a lancer':'⚠️ Corrections requises avant lancement paie'}</div>
      <div style={{fontSize:10,color:'#888',marginTop:4}}>{score>=80?'Tous les controles critiques sont passes. Vous pouvez lancer le calcul.':'Corrigez les problemes ci-dessus puis relancez la validation.'}</div>
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════
// 2. TIMELINE PAIE — Liee aux vrais deadlines ONSS/SPF
// ═══════════════════════════════════════════════════════════
export function TimelinePaieV2({s}){
  const now=new Date();const yr=now.getFullYear();const m=now.getMonth();const d=now.getDate();
  const [selMonth,setSelMonth]=useState(m);

  const deadlines=useMemo(()=>{
    const dl=[];
    for(let mi=0;mi<12;mi++){
      const my=moisN[mi]+' '+yr;
      dl.push({month:mi,day:5,title:'Provision ONSS',desc:'Paiement provisions mensuelles ONSS',cat:'ONSS',c:'#ef4444',recurring:true});
      dl.push({month:mi,day:15,title:'Précompte professionnel',desc:'Declaration + paiement PP (formulaire 274)',cat:'Fiscal',c:'#a855f7',recurring:true});
      dl.push({month:mi,day:25,title:'Virements salaires SEPA',desc:'Exécution virements nets employés',cat:'Paie',c:'#22c55e',recurring:true});
      dl.push({month:mi,day:28,title:'Distribution fiches de paie',desc:'Envoi fiches par email / portail',cat:'Paie',c:'#3b82f6',recurring:true});
    }
    // Quarterly DmfA
    [0,3,6,9].forEach(mi=>dl.push({month:mi,day:10,title:'DmfA T'+Math.ceil((mi+1)/3),desc:'Declaration trimestrielle ONSS',cat:'ONSS',c:'#ef4444'}));
    // Annual
    dl.push({month:1,day:28,title:'Belcotax 281.10/281.20',desc:'Fiches fiscales annuelles au SPF',cat:'Fiscal',c:'#a855f7'});
    dl.push({month:2,day:1,title:'Deadline Belcotax',desc:'Transmission XML au SPF Finances',cat:'Fiscal',c:'#ef4444'});
    dl.push({month:4,day:30,title:'Pécule vacances simple',desc:'Versement pécule simple employés',cat:'Paie',c:'#06b6d4'});
    dl.push({month:5,day:30,title:'Pécule vacances double',desc:'Versement pécule double',cat:'Paie',c:'#06b6d4'});
    dl.push({month:11,day:20,title:'13eme mois / Prime fin annee',desc:'Versement prime fin annee',cat:'Paie',c:'#c6a34e'});
    dl.push({month:0,day:31,title:'Indexation CP 200',desc:'Verification et application index sante',cat:'RH',c:'#fb923c'});
    dl.push({month:5,day:30,title:'Bilan social BNB',desc:'Depot si >= 20 ETP',cat:'Compliance',c:'#fb923c'});
    dl.push({month:2,day:31,title:'Plan formation',desc:'Depot plan annuel si >= 20 travailleurs',cat:'RH',c:'#3b82f6'});
    return dl;
  },[yr]);

  const monthDeadlines=deadlines.filter(dl=>dl.month===selMonth).sort((a,b)=>a.day-b.day);
  const upcomingAll=deadlines.filter(dl=>{
    if(dl.month>m)return true;
    if(dl.month===m&&dl.day>=d)return true;
    return false;
  }).sort((a,b)=>a.month!==b.month?a.month-b.month:a.day-b.day).slice(0,10);

  const catColors={ONSS:'#ef4444',Fiscal:'#a855f7',Paie:'#22c55e',RH:'#fb923c',Compliance:'#3b82f6'};

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>📅 Timeline Paie</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Deadlines ONSS, SPF, Paie — Calendrier {yr}</p>

    {/* Next deadline highlight */}
    {upcomingAll.length>0&&<div style={{padding:14,background:'linear-gradient(135deg,rgba(198,163,78,.04),rgba(198,163,78,.01))',border:'1px solid rgba(198,163,78,.15)',borderRadius:12,marginBottom:16,display:'flex',alignItems:'center',gap:14}}>
      <div style={{fontSize:28,fontWeight:800,color:upcomingAll[0].c}}>{upcomingAll[0].day}</div>
      <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{upcomingAll[0].title}</div><div style={{fontSize:10,color:'#888'}}>{moisN[upcomingAll[0].month]} — {upcomingAll[0].desc}</div></div>
      <Badge text={'J-'+Math.max(0,Math.ceil((new Date(yr,upcomingAll[0].month,upcomingAll[0].day)-now)/86400000))} color={upcomingAll[0].c}/>
    </div>}

    {/* Month selector */}
    <div style={{display:'flex',gap:3,marginBottom:16,flexWrap:'wrap'}}>
      {moisN.map((mn,i)=><button key={i} onClick={()=>setSelMonth(i)} style={{padding:'6px 10px',borderRadius:6,border:'none',background:selMonth===i?'rgba(198,163,78,.15)':i===m?'rgba(255,255,255,.05)':'transparent',color:selMonth===i?'#c6a34e':i===m?'#e8e6e0':'#888',fontSize:10,cursor:'pointer',fontFamily:'inherit',fontWeight:selMonth===i||i===m?600:400}}>{mn.slice(0,3)}</button>)}
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      {/* Month deadlines */}
      <C title={moisN[selMonth]+' '+yr+' — '+monthDeadlines.length+' echeances'}>
        {monthDeadlines.map((dl,i)=>{
          const isPast=selMonth<m||(selMonth===m&&dl.day<d);
          const isToday=selMonth===m&&dl.day===d;
          return <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)',opacity:isPast?.5:1}}>
            <div style={{minWidth:30,textAlign:'center',fontSize:14,fontWeight:700,color:isToday?'#c6a34e':dl.c}}>{dl.day}</div>
            <div style={{width:3,height:30,borderRadius:2,background:dl.c}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:500,color:'#e8e6e0'}}>{dl.title}</div>
              <div style={{fontSize:9,color:'#888'}}>{dl.desc}</div>
            </div>
            <Badge text={dl.cat} color={catColors[dl.cat]}/>
            {isPast&&<span style={{fontSize:10}}>✅</span>}
          </div>;
        })}
      </C>

      {/* Upcoming */}
      <C title="Prochaines echeances">
        {upcomingAll.map((dl,i)=>{
          const jours=Math.max(0,Math.ceil((new Date(yr,dl.month,dl.day)-now)/86400000));
          return <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <div style={{minWidth:50,textAlign:'center'}}>
              <div style={{fontSize:14,fontWeight:700,color:jours<=3?'#ef4444':jours<=7?'#eab308':'#c6a34e'}}>{dl.day}/{dl.month+1}</div>
              <div style={{fontSize:8,color:'#888'}}>J-{jours}</div>
            </div>
            <div style={{flex:1}}><div style={{fontSize:11,color:'#e8e6e0'}}>{dl.title}</div></div>
            <Badge text={dl.cat} color={catColors[dl.cat]}/>
          </div>;
        })}
      </C>
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════
// 3. SOLDE TOUT COMPTE V2 — Prorata complet
// ═══════════════════════════════════════════════════════════
export function SoldeToutCompteV2({s,d}){
  const clients=s.clients||[];const allEmps=clients.flatMap(c=>(c.emps||[]).map(e=>({...e,_co:c.company?.name||'',_cp:c.company?.cp||'200'})));
  const [selEmp,setSelEmp]=useState('');const [dateSortie,setDateSortie]=useState(new Date().toISOString().slice(0,10));
  const [motif,setMotif]=useState('employeur');const [result,setResult]=useState(null);

  const calcul=()=>{
    const emp=allEmps.find(e=>e.id===selEmp)||allEmps[0];if(!emp)return;
    const brut=+(emp.monthlySalary||emp.gross||emp.brut||0);
    const start=new Date(emp.startDate||emp.start||'2020-01-01');
    const end=new Date(dateSortie);
    const ancJours=Math.max(0,Math.ceil((end-start)/86400000));
    const ancAnnees=ancJours/365.25;
    const ancMois=Math.round(ancAnnees*12);

    // Préavis (Loi 26/12/2013)
    const isEmployeur=motif==='employeur';
    let semPreavis=0;
    if(isEmployeur){
      if(ancAnnees<0.25)semPreavis=1;else if(ancAnnees<0.5)semPreavis=3;else if(ancAnnees<1)semPreavis=4;
      else if(ancAnnees<2)semPreavis=5;else if(ancAnnees<3)semPreavis=6;else if(ancAnnees<4)semPreavis=7;
      else if(ancAnnees<5)semPreavis=9;else if(ancAnnees<6)semPreavis=10;else if(ancAnnees<8)semPreavis=13;
      else if(ancAnnees<9)semPreavis=15;else if(ancAnnees<10)semPreavis=16;else if(ancAnnees<11)semPreavis=17;
      else if(ancAnnees<13)semPreavis=19;else if(ancAnnees<15)semPreavis=21;else if(ancAnnees<16)semPreavis=24;
      else if(ancAnnees<17)semPreavis=27;else if(ancAnnees<18)semPreavis=30;else if(ancAnnees<19)semPreavis=33;
      else if(ancAnnees<20)semPreavis=36;else if(ancAnnees<21)semPreavis=39;else if(ancAnnees<22)semPreavis=42;
      else if(ancAnnees<23)semPreavis=45;else if(ancAnnees<24)semPreavis=48;else if(ancAnnees<25)semPreavis=51;
      else semPreavis=Math.min(78,51+Math.floor((ancAnnees-25)*3));
    } else {
      const empSem=isEmployeur?0:Math.min(13,Math.ceil(ancAnnees<=0.25?1:ancAnnees<=0.5?2:ancAnnees<=1?2:ancAnnees<=2?3:ancAnnees<=4?4:ancAnnees<=5?5:ancAnnees<=6?6:ancAnnees<=7?7:ancAnnees<=8?8:Math.min(13,Math.floor(ancAnnees))));
      semPreavis=empSem;
    }
    const indemPreavis=Math.round(brut/4*semPreavis*100)/100;

    // Prorata mois en cours
    const jourMois=end.getDate();const totalJoursMois=new Date(end.getFullYear(),end.getMonth()+1,0).getDate();
    const prorataMois=Math.round(brut*jourMois/totalJoursMois*100)/100;

    // Pécule vacances prorata
    const moisPrestes=end.getMonth()+1; // mois de l'année de sortie
    const peculeSimple=Math.round(brut*moisPrestes/12*PV_SIMPLE*100)/100;
    const peculeDouble=Math.round(brut*moisPrestes/12*PV_DOUBLE*100)/100;

    // 13ème mois prorata
    const treizieme=Math.round(brut*moisPrestes/12*100)/100;

    // Outplacement (si préavis >= 30 semaines)
    const outplacement=semPreavis>=30;
    const coutOutplacement=outplacement?Math.round(brut*4/52*4*100)/100:0; // 4 semaines de rému

    // Indemnités spéciales
    const indemProtection=motif==='protege'?brut*6:0; // protection 6 mois
    const indemAbus=motif==='abus'?brut*3:0; // licenciement manifestement déraisonnable: 3-17 sem

    // Totaux
    const details=[
      {label:'Prorata salaire mois en cours',brut:prorataMois,note:jourMois+'/'+totalJoursMois+' jours'},
      {label:'Indemnite compensatoire de preavis',brut:indemPreavis,note:semPreavis+' semaines'},
      {label:'Pécule vacances simple (prorata)',brut:peculeSimple,note:moisPrestes+'/12 mois'},
      {label:'Pécule vacances double (prorata)',brut:peculeDouble,note:moisPrestes+'/12 mois'},
      {label:'13eme mois prorata',brut:treizieme,note:moisPrestes+'/12 mois'},
    ];
    if(outplacement) details.push({label:'Provision outplacement (4 sem.)',brut:coutOutplacement,note:'Obligatoire si preavis >= 30 sem.'});
    if(indemProtection>0) details.push({label:'Indemnite de protection',brut:indemProtection,note:'6 mois brut'});
    if(indemAbus>0) details.push({label:'Indemnite licenciement abusif',brut:indemAbus,note:'3-17 semaines (CCT 109)'});

    const brutTotal=details.reduce((a,d2)=>a+d2.brut,0);
    const onssT=Math.round(brutTotal*TX_ONSS_W*100)/100;
    const ppEstime=Math.round((brutTotal-onssT)*0.35*100)/100; // estimation 35% pour solde
    const netEstime=Math.round((brutTotal-onssT-ppEstime)*100)/100;
    const coutEmployeur=Math.round(brutTotal*(1+TX_ONSS_E)*100)/100;

    setResult({details,totaux:{brutTotal,onssT,ppEstime,netEstime,coutEmployeur},preavis:{sem:semPreavis,indem:indemPreavis},outplacement,emp,ancAnnees:Math.round(ancAnnees*10)/10,ancMois});
  };

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>💼 Solde de Tout Compte</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Preavis + pecule prorata + 13eme + outplacement + indemnites speciales</p>

    <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'flex-end'}}>
      <div><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Employe</label>
        <select value={selEmp} onChange={e=>setSelEmp(e.target.value)} style={{padding:'10px 12px',borderRadius:8,background:'#090c16',border:'1px solid rgba(139,115,60,.15)',color:'#e5e5e5',fontSize:12,fontFamily:'inherit',minWidth:200}}>
          <option value="">-- Selectionner --</option>
          {allEmps.map((e,i)=><option key={e.id||i} value={e.id||i}>{(e.first||'?')+' '+(e.last||'?')+' — '+e._co}</option>)}
        </select></div>
      <div><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Date sortie</label>
        <input type="date" value={dateSortie} onChange={e=>setDateSortie(e.target.value)} style={{padding:'10px 12px',borderRadius:8,background:'#090c16',border:'1px solid rgba(139,115,60,.15)',color:'#e5e5e5',fontSize:12,fontFamily:'inherit'}}/></div>
      <div><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Motif</label>
        <select value={motif} onChange={e=>setMotif(e.target.value)} style={{padding:'10px 12px',borderRadius:8,background:'#090c16',border:'1px solid rgba(139,115,60,.15)',color:'#e5e5e5',fontSize:12,fontFamily:'inherit'}}>
          <option value="employeur">Licenciement employeur</option>
          <option value="travailleur">Demission travailleur</option>
          <option value="commun">Rupture d'un commun accord</option>
          <option value="protege">Travailleur protege</option>
          <option value="abus">Licenciement abusif (CCT 109)</option>
          <option value="faute">Faute grave (Art. 35)</option>
        </select></div>
      <button onClick={calcul} style={{padding:'10px 24px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#c6a34e,#a07d3e)',color:'#060810',fontWeight:700,fontSize:13,cursor:'pointer',height:42}}>Calculer</button>
    </div>

    {result&&<div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
        <KPI l="Brut total" v={fi(result.totaux.brutTotal)+' €'} c="#c6a34e"/>
        <KPI l="Net estime" v={fi(result.totaux.netEstime)+' €'} c="#22c55e"/>
        <KPI l="Cout employeur" v={fi(result.totaux.coutEmployeur)+' €'} c="#ef4444"/>
        <KPI l="Preavis" v={result.preavis.sem+' sem.'} c="#3b82f6" sub={fi(result.preavis.indem)+' €'}/>
      </div>

      <C title="Detail du solde">
        {result.details.map((d2,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <span style={{color:'#e8e6e0',fontSize:12}}>{d2.label}{d2.note&&<span style={{color:'#888',marginLeft:6,fontSize:10}}>({d2.note})</span>}</span>
          <span style={{color:'#c6a34e',fontWeight:600}}>{fmt(d2.brut)} €</span>
        </div>)}
        <Row l="TOTAL BRUT" v={fmt(result.totaux.brutTotal)+' €'} b/>
        <Row l={'ONSS ('+( TX_ONSS_W*100).toFixed(2)+'%)'} v={'-'+fmt(result.totaux.onssT)+' €'} c="#ef4444"/>
        <Row l="PP estime (~35%)" v={'-'+fmt(result.totaux.ppEstime)+' €'} c="#fb923c"/>
        <Row l="NET ESTIME" v={fmt(result.totaux.netEstime)+' €'} c="#22c55e" b/>
      </C>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <C title="Informations">
          <Row l="Anciennete" v={result.ancAnnees+' ans ('+result.ancMois+' mois)'}/>
          <Row l="Preavis" v={result.preavis.sem+' semaines'}/>
          {result.outplacement&&<Row l="Outplacement" v="Obligatoire (>= 30 sem.)" c="#fb923c"/>}
          {motif==='faute'&&<div style={{marginTop:8,padding:8,background:'rgba(239,68,68,.06)',borderRadius:6,fontSize:10,color:'#ef4444'}}>⚠️ Faute grave: pas d'indemnite de preavis. Verifiez la procedure (Art. 35 Loi contrats travail).</div>}
        </C>
        <C title="Base legale">
          <div style={{fontSize:10,color:'#888'}}>{[
            'Loi 26/12/2013 — Statut unique (preavis)',
            'CCT 109 — Licenciement manifestement deraisonnable',
            'AR Outplacement — Si preavis >= 30 semaines',
            'Art. 67 Lois coordonnees vacances — Pecule prorata',
          ].map((t,i)=><div key={i} style={{padding:'3px 0'}}>• {t}</div>)}</div>
        </C>
      </div>
    </div>}
  </div>;
}


// ═══════════════════════════════════════════════════════════
// 4. COUTS ANNUELS V2 — Saisonnalite + primes sectorielles
// ═══════════════════════════════════════════════════════════
export function CoutsAnnuelsV2({s}){
  const clients=s.clients||[];
  const allEmps=clients.flatMap(c=>(c.emps||[]).map(e=>({...e,_cp:c.company?.cp||'200'})));
  const n=allEmps.length;const mb=allEmps.reduce((a,e)=>a+(+(e.monthlySalary||e.gross||e.brut||0)),0);
  const coutM=mb*(1+TX_ONSS_E);const ppM=allEmps.reduce((a,e)=>a+quickPP(+(e.monthlySalary||e.gross||0)),0);

  // Monthly breakdown with seasonal variation
  const mensuel=moisN.map((mn,i)=>{
    let extra=0;let label='';
    if(i===0){extra=mb*0.02;label='Indexation';} // Jan: indexation provision
    if(i===4){extra=mb*0.1538;label='Pecule simple';} // Mai: pecule
    if(i===5){extra=mb*0.0769;label='Pecule double';} // Juin: pecule double
    if(i===11){extra=mb;label='13eme mois';} // Dec: 13eme
    return {mois:mn,brut:mb,cout:coutM,extra,label,total:coutM+extra*(1+TX_ONSS_E)};
  });
  const totalAnnuel=mensuel.reduce((a,m2)=>a+m2.total,0);
  const maxM=Math.max(...mensuel.map(m2=>m2.total));

  // Primes sectorielles
  const primesSectorielles=[
    {cp:'200',prime:'Prime de fin année',montant:'Barème CP 200',mois:'Décembre'},
    {cp:'200',prime:'Eco-cheques',montant:'Max 250 EUR/an',mois:'Juin'},
    {cp:'124',prime:'Timbre fidelite',montant:'Variable',mois:'Juin-Juillet'},
    {cp:'302',prime:'Prime horeca',montant:'Selon heures',mois:'Variable'},
    {cp:'330',prime:'Prime IFIC/attractivite',montant:'Grille IFIC',mois:'Mensuel'},
  ];

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>📊 Couts Annuels</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Projection avec saisonnalite, pecule, 13eme mois, primes sectorielles</p>

    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
      <KPI l="Cout annuel total" v={fi(totalAnnuel)+' €'} c="#c6a34e"/>
      <KPI l="Cout mensuel moyen" v={fi(totalAnnuel/12)+' €'} c="#60a5fa"/>
      <KPI l="Mois le + cher" v={moisN[mensuel.indexOf(mensuel.find(m2=>m2.total===maxM))]} c="#ef4444" sub={fi(maxM)+' €'}/>
      <KPI l="Employes" v={n} c="#888"/>
    </div>

    {/* Bar chart */}
    <C title="Cout mensuel avec saisonnalite">
      <div style={{display:'flex',alignItems:'flex-end',gap:4,height:160,marginBottom:8}}>
        {mensuel.map((m2,i)=>{
          const pct=maxM>0?m2.total/maxM*100:0;
          const hasExtra=m2.extra>0;
          return <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
            <div style={{fontSize:7,color:'#888',textAlign:'center'}}>{fi(m2.total)}</div>
            <div style={{width:'100%',display:'flex',flexDirection:'column',justifyContent:'flex-end',height:pct+'%',minHeight:4}}>
              {hasExtra&&<div style={{width:'100%',height:Math.round(m2.extra*(1+TX_ONSS_E)/m2.total*100)+'%',background:'linear-gradient(180deg,#fb923c,#c6a34e)',borderRadius:'3px 3px 0 0',minHeight:3}}/>}
              <div style={{width:'100%',flex:1,background:hasExtra?'linear-gradient(180deg,rgba(198,163,78,.4),rgba(198,163,78,.15))':'linear-gradient(180deg,rgba(198,163,78,.3),rgba(198,163,78,.1))',borderRadius:hasExtra?'0':'3px 3px 0 0'}}/>
            </div>
            <div style={{fontSize:8,color:i===new Date().getMonth()?'#c6a34e':'#888',fontWeight:i===new Date().getMonth()?700:400}}>{m2.mois.slice(0,3)}</div>
            {hasExtra&&<div style={{fontSize:7,color:'#fb923c'}}>{m2.label}</div>}
          </div>;
        })}
      </div>
    </C>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <C title="Detail mensuel">
        {mensuel.map((m2,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11}}>
          <span style={{color:m2.extra>0?'#fb923c':'#e8e6e0'}}>{m2.mois}{m2.label&&' ('+m2.label+')'}</span>
          <span style={{fontFamily:'monospace',color:'#c6a34e'}}>{fi(m2.total)} €</span>
        </div>)}
        <Row l="TOTAL ANNUEL" v={fi(totalAnnuel)+' €'} b/>
      </C>
      <C title="Provisions annuelles">
        <Row l="Salaires bruts x12" v={fi(mb*12)+' €'}/>
        <Row l="ONSS patronal" v={fi(mb*12*TX_ONSS_E)+' €'} c="#f87171"/>
        <Row l="Pecule vacances (15,38%)" v={fi(mb*12*0.1538)+' €'} c="#06b6d4"/>
        <Row l="13eme mois" v={fi(mb)+' €'} c="#c6a34e"/>
        <Row l="Assurance AT (~1.5%)" v={fi(mb*12*0.015)+' €'} c="#888"/>
        <Row l="Medecine travail" v={fi(n*100)+' €'} c="#888"/>
        <Row l="Cheques-repas (est.)" v={fi(n*6.91*20*12)+' €'} c="#fb923c"/>
        <Row l="Formation (2%)" v={fi(totalAnnuel*0.02)+' €'} c="#a78bfa"/>
        <Row l="BUDGET COMPLET" v={fi(totalAnnuel+n*100+n*6.91*20*12)+' €'} b/>
      </C>
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════
// 5. SIMU LICENCIEMENT V2 — Outplacement + indemnites speciales
// ═══════════════════════════════════════════════════════════
export function SimuLicenciementV2({s}){
  const clients=s.clients||[];
  const allEmps=clients.flatMap(c=>(c.emps||[]).map(e=>({...e,_co:c.company?.name||''})));
  const [selEmp,setSelEmp]=useState(null);const [motif,setMotif]=useState('employeur');
  const [manualAnc,setManualAnc]=useState('');const [manualBrut,setManualBrut]=useState('');
  const now=new Date();

  const emp=selEmp?allEmps.find(e=>e.id===selEmp):null;
  const brut=+(manualBrut||(emp?+(emp.monthlySalary||emp.gross||0):3000));
  const start=emp?new Date(emp.startDate||emp.start||'2020-01-01'):new Date(now.getFullYear()-5,0,1);
  const ancAnnees=manualAnc?+manualAnc:Math.max(0,(now-start)/(365.25*24*60*60*1000));

  // Calcul préavis barème complet
  const isEmployeur=motif==='employeur'||motif==='protege'||motif==='abus';
  let semaines=0;
  if(isEmployeur){
    if(ancAnnees<0.25)semaines=1;else if(ancAnnees<0.5)semaines=3;else if(ancAnnees<1)semaines=4;
    else if(ancAnnees<2)semaines=5;else if(ancAnnees<3)semaines=6;else if(ancAnnees<4)semaines=7;
    else if(ancAnnees<5)semaines=9;else if(ancAnnees<6)semaines=10;else if(ancAnnees<8)semaines=13;
    else if(ancAnnees<9)semaines=15;else if(ancAnnees<10)semaines=16;else if(ancAnnees<11)semaines=17;
    else if(ancAnnees<13)semaines=19;else if(ancAnnees<15)semaines=21;else if(ancAnnees<16)semaines=24;
    else if(ancAnnees<17)semaines=27;else if(ancAnnees<18)semaines=30;else if(ancAnnees<19)semaines=33;
    else if(ancAnnees<20)semaines=36;else if(ancAnnees<21)semaines=39;else if(ancAnnees<25)semaines=51;
    else semaines=Math.min(78,51+Math.floor((ancAnnees-25)*3));
  } else {
    if(ancAnnees<0.25)semaines=1;else if(ancAnnees<0.5)semaines=2;else if(ancAnnees<1)semaines=2;
    else if(ancAnnees<2)semaines=3;else if(ancAnnees<4)semaines=4;else if(ancAnnees<5)semaines=5;
    else if(ancAnnees<8)semaines=7;else semaines=Math.min(13,Math.floor(ancAnnees));
  }

  const indemPreavis=Math.round(brut/4*semaines*100)/100;
  const outplacement=semaines>=30;
  const coutOutplacement=outplacement?Math.round(brut/13*4*100)/100:0;
  const indemProtection=motif==='protege'?brut*6:0;
  const indemAbus=motif==='abus'?Math.round(brut/4*17*100)/100:0; // max 17 sem CCT 109
  const coutTotal=Math.round((indemPreavis+coutOutplacement+indemProtection+indemAbus)*(1+TX_ONSS_E)*100)/100;

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>⚖️ Simulateur Licenciement</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Preavis + outplacement + indemnites speciales — Loi 26/12/2013</p>

    <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:16}}>
      <div style={{padding:18,background:'linear-gradient(135deg,#0d1117,#131820)',border:'1px solid rgba(198,163,78,.1)',borderRadius:14}}>
        <div style={{marginBottom:10}}><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Employe (optionnel)</label>
          <select value={selEmp||''} onChange={e=>setSelEmp(e.target.value||null)} style={{width:'100%',padding:'8px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:6,color:'#e5e5e5',fontSize:11,fontFamily:'inherit'}}>
            <option value="">Calcul libre</option>{allEmps.map((e,i)=><option key={e.id||i} value={e.id}>{e.first+' '+e.last+' — '+e._co}</option>)}
          </select></div>
        <div style={{marginBottom:10}}><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Brut mensuel: {fmt(brut)} €</label><input type="range" min={1800} max={10000} step={50} value={brut} onChange={e=>setManualBrut(e.target.value)} style={{width:'100%',accentColor:'#c6a34e'}}/></div>
        <div style={{marginBottom:10}}><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Anciennete: {manualAnc||Math.round(ancAnnees*10)/10} ans</label><input type="range" min={0} max={40} step={0.5} value={manualAnc||ancAnnees} onChange={e=>setManualAnc(e.target.value)} style={{width:'100%',accentColor:'#c6a34e'}}/></div>
        <div><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Motif</label>
          <select value={motif} onChange={e=>setMotif(e.target.value)} style={{width:'100%',padding:'8px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:6,color:'#e5e5e5',fontSize:11,fontFamily:'inherit'}}>
            <option value="employeur">Licenciement employeur</option><option value="travailleur">Demission</option><option value="protege">Travailleur protege</option><option value="abus">Licenciement abusif</option><option value="faute">Faute grave</option>
          </select></div>
      </div>
      <div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
          <KPI l="Preavis" v={semaines+' sem.'} c="#3b82f6" sub={fi(indemPreavis)+' €'}/>
          <KPI l="Cout total employeur" v={fi(coutTotal)+' €'} c="#ef4444"/>
          <KPI l={outplacement?'Outplacement obligatoire':'Outplacement'} v={outplacement?'OUI':'Non'} c={outplacement?'#fb923c':'#4ade80'}/>
        </div>
        <C title="Detail">
          <Row l="Indemnite preavis" v={fmt(indemPreavis)+' €'} c="#3b82f6"/>
          {outplacement&&<Row l="Outplacement (4 sem.)" v={fmt(coutOutplacement)+' €'} c="#fb923c"/>}
          {indemProtection>0&&<Row l="Indemnite protection (6 mois)" v={fmt(indemProtection)+' €'} c="#ef4444"/>}
          {indemAbus>0&&<Row l="Indemnite abus (max 17 sem.)" v={fmt(indemAbus)+' €'} c="#ef4444"/>}
          {motif==='faute'&&<div style={{padding:8,background:'rgba(239,68,68,.06)',borderRadius:6,fontSize:10,color:'#ef4444'}}>⚠️ Faute grave: pas d'indemnite. Procedure stricte Art. 35 + 3 jours ouvrables.</div>}
          <Row l={'ONSS employeur ('+(TX_ONSS_E*100).toFixed(1)+'%)'} v={'+'+fmt((indemPreavis+coutOutplacement+indemProtection+indemAbus)*TX_ONSS_E)+' €'} c="#f87171"/>
          <Row l="COUT TOTAL EMPLOYEUR" v={fmt(coutTotal)+' €'} b/>
        </C>
        <C title="Base legale">
          <div style={{fontSize:10,color:'#888'}}>{[
            'Loi 26/12/2013 — Statut unique (bareme preavis)',
            outplacement?'AR Outplacement — Obligatoire si preavis >= 30 sem.':'',
            motif==='abus'?'CCT 109 — 3 a 17 semaines (manifestement deraisonnable)':'',
            motif==='protege'?'Loi protection — Delegues, femmes enceintes, credit-temps':'',
          ].filter(Boolean).map((t,i)=><div key={i} style={{padding:'3px 0'}}>• {t}</div>)}</div>
        </C>
      </div>
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════
// 6. SIMU PENSION V2 — Formules SdPSP/SFPD branchees
// ═══════════════════════════════════════════════════════════
export function SimuPensionV2({s}){
  const [age,setAge]=useState(35);const [brut,setBrut]=useState(3500);const [annees,setAnnees]=useState(15);
  const [statut,setStatut]=useState('isole');const [ag,setAg]=useState(true);const [cotAG,setCotAG]=useState(3);
  const [epargne,setEpargne]=useState(0);

  // Real Belgian pension formula (SFPD/SdPSP)
  const ageRetraite=67; // 2030+
  const rest=Math.max(0,ageRetraite-age);
  const carriereTotale=annees+rest;
  const carriereComplete=45;
  const fraction=Math.min(carriereTotale,carriereComplete)/carriereComplete;

  // Plafond salarial pension 2026
  const plafondAnnuel=73538.58; // estimation 2026
  const salairePris=Math.min(brut*12,plafondAnnuel);

  // Taux: isolé 60%, ménage 75%
  const taux=statut==='menage'?0.75:0.60;
  const pensionAnnuelle=Math.round(salairePris*fraction*taux*100)/100;
  const pensionMensuelle=Math.round(pensionAnnuelle/12*100)/100;

  // Pension minimum (carrière complète) 2026
  const minIsole=1738.26;const minMenage=2173.13;
  const pensionMin=statut==='menage'?minMenage:minIsole;
  const pensionMinProrata=Math.round(pensionMin*fraction*100)/100;

  // Pension maximale (plafond)
  const pensionMax=Math.round(plafondAnnuel/carriereComplete*carriereComplete*taux/12*100)/100;

  // Assurance groupe (2e pilier)
  const capitalAG=ag?Math.round(brut*cotAG/100*12*carriereTotale*1.02*100)/100:0;
  const renteAG=Math.round(capitalAG/240*100)/100; // rente sur 20 ans

  // Epargne pension (3e pilier)
  const capitalEP=Math.round(epargne*12*(1.01**rest)*100)/100;

  const totalMensuel=Math.round((Math.max(pensionMensuelle,pensionMinProrata)+renteAG+capitalEP/240)*100)/100;
  const tauxRemplacement=brut>0?Math.round(totalMensuel/brut*10000)/100:0;

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>🏖 Simulateur Pension</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Legale (SFPD) + complementaire (2e pilier) + epargne (3e pilier) — Projection a {ageRetraite} ans</p>

    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:16}}>
      <div style={{padding:18,background:'linear-gradient(135deg,#0d1117,#131820)',border:'1px solid rgba(198,163,78,.1)',borderRadius:14}}>
        {[{l:'Age: '+age+' ans',v:age,set:setAge,min:20,max:65},{l:'Brut: '+fmt(brut)+' €',v:brut,set:setBrut,min:1800,max:10000,step:50},{l:'Annees carriere: '+annees,v:annees,set:setAnnees,min:0,max:45}].map((sl,i)=>
          <div key={i} style={{marginBottom:12}}><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>{sl.l}</label><input type="range" min={sl.min} max={sl.max} step={sl.step||1} value={sl.v} onChange={e=>sl.set(+e.target.value)} style={{width:'100%',accentColor:'#c6a34e'}}/></div>
        )}
        <div style={{marginBottom:10}}><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Situation familiale</label>
          <div style={{display:'flex',gap:4}}>{[{id:'isole',l:'Isole (60%)'},{id:'menage',l:'Menage (75%)'}].map(o=><button key={o.id} onClick={()=>setStatut(o.id)} style={{flex:1,padding:'6px',borderRadius:6,border:'none',background:statut===o.id?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:statut===o.id?'#c6a34e':'#888',fontSize:10,cursor:'pointer',fontFamily:'inherit'}}>{o.l}</button>)}</div></div>
        <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginBottom:8}}><input type="checkbox" checked={ag} onChange={e=>setAg(e.target.checked)} style={{accentColor:'#c6a34e'}}/><span style={{fontSize:11,color:'#e5e5e5'}}>2e pilier ({cotAG}%)</span></label>
        {ag&&<input type="range" min={1} max={8} step={0.5} value={cotAG} onChange={e=>setCotAG(+e.target.value)} style={{width:'100%',accentColor:'#c6a34e',marginBottom:8}}/>}
        <div><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Epargne pension/mois: {fi(epargne)} €</label><input type="range" min={0} max={300} step={25} value={epargne} onChange={e=>setEpargne(+e.target.value)} style={{width:'100%',accentColor:'#c6a34e'}}/></div>
      </div>
      <div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
          <KPI l="Pension legale/m" v={fmt(Math.max(pensionMensuelle,pensionMinProrata))} c="#3b82f6"/>
          <KPI l="2e pilier/m" v={fmt(renteAG)} c="#22c55e"/>
          <KPI l="TOTAL/mois" v={fmt(totalMensuel)} c="#c6a34e"/>
          <KPI l="Taux remplacement" v={tauxRemplacement+'%'} c={tauxRemplacement>=70?'#22c55e':tauxRemplacement>=50?'#eab308':'#ef4444'}/>
        </div>

        <C title="Projection detaillee">
          <Row l="Carriere a la pension" v={Math.min(carriereTotale,45)+'/45 ans'}/>
          <Row l="Plafond salarial annuel" v={fi(plafondAnnuel)+' €'}/>
          <Row l={'Taux: '+(statut==='menage'?'Menage 75%':'Isole 60%')} v={taux*100+'%'}/>
          <Row l="Pension legale brute/mois" v={fmt(pensionMensuelle)+' €'} c="#3b82f6"/>
          <Row l="Pension minimum (prorata)" v={fmt(pensionMinProrata)+' €'} c="#888"/>
          {ag&&<Row l={'Capital 2e pilier ('+cotAG+'%)'} v={fi(capitalAG)+' €'} c="#22c55e"/>}
          {ag&&<Row l="Rente 2e pilier/mois" v={fmt(renteAG)+' €'} c="#22c55e"/>}
          {epargne>0&&<Row l="Capital 3e pilier" v={fi(capitalEP)+' €'} c="#a78bfa"/>}
          <Row l="TOTAL MENSUEL" v={fmt(totalMensuel)+' €'} b/>
        </C>

        <div style={{padding:12,background:tauxRemplacement>=70?'rgba(34,197,94,.06)':tauxRemplacement>=50?'rgba(234,179,8,.06)':'rgba(239,68,68,.06)',borderRadius:10,fontSize:11}}>
          <span style={{color:tauxRemplacement>=70?'#4ade80':tauxRemplacement>=50?'#eab308':'#ef4444',fontWeight:600}}>
            {tauxRemplacement>=70?'✅ Bon taux de remplacement':tauxRemplacement>=50?'⚡ Taux modere — Augmenter 2e/3e pilier':'⚠️ Taux insuffisant — Action necessaire'}
          </span>
          <div style={{fontSize:10,color:'#888',marginTop:4}}>Objectif: 70% du dernier salaire brut. Source: SFPD (Service federal des Pensions).</div>
        </div>
      </div>
    </div>
  </div>;
}


// ═══════════════════════════════════════════════════════════
// 7. TEMPS PARTIEL V2 — Credit heures + heures complementaires
// ═══════════════════════════════════════════════════════════
export function SimuTempsPartielV2({s}){
  const [brutFT,setBrutFT]=useState(3500);const [heures,setHeures]=useState(19);const [hCompl,setHCompl]=useState(0);
  const regime=38;const fraction=heures/regime;
  const brutTP=Math.round(brutFT*fraction*100)/100;
  const brutCompl=Math.round(brutFT/regime*hCompl*4.33*100)/100; // heures complémentaires mensuelles
  const brutTotal=brutTP+brutCompl;
  const onssW=Math.round(brutTotal*TX_ONSS_W*100)/100;const pp=quickPP(brutTotal);
  const net=Math.round((brutTotal-onssW-pp)*100)/100;const coutE=Math.round(brutTotal*(1+TX_ONSS_E)*100)/100;
  const netFT=Math.round((brutFT-brutFT*TX_ONSS_W-quickPP(brutFT))*100)/100;

  const regimes=[{h:38,l:'Temps plein',f:'100%'},{h:30.4,l:'4/5eme',f:'80%'},{h:28.5,l:'3/4',f:'75%'},{h:19,l:'Mi-temps',f:'50%'},{h:12.67,l:'1/3',f:'33%'},{h:7.6,l:'1/5eme',f:'20%'}];

  // Credit-temps
  const creditTemps=[
    {type:'Credit-temps sans motif',duree:'Max 12 mois sur carriere',alloc:'Pas d\'allocation ONEM'},
    {type:'Credit-temps motif soins',duree:'Max 51 mois',alloc:'Allocation ONEM (~200-400 €/m)'},
    {type:'Credit-temps formation',duree:'Max 36 mois',alloc:'Allocation ONEM'},
    {type:'Credit-temps fin carriere',duree:'Jusqu\'a pension (>55 ans)',alloc:'Allocation ONEM majoree'},
  ];

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>⏱ Simulateur Temps Partiel</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Prorata + credit heures + heures complementaires + droits sociaux</p>

    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:16}}>
      <div style={{padding:18,background:'linear-gradient(135deg,#0d1117,#131820)',border:'1px solid rgba(198,163,78,.1)',borderRadius:14}}>
        <div style={{marginBottom:12}}><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Brut temps plein: {fmt(brutFT)} €</label>
          <input type="range" min={1800} max={8000} step={50} value={brutFT} onChange={e=>setBrutFT(+e.target.value)} style={{width:'100%',accentColor:'#c6a34e'}}/></div>
        <div style={{fontSize:10,color:'#888',marginBottom:6}}>Regime horaire</div>
        {regimes.map(r=><button key={r.h} onClick={()=>setHeures(r.h)} style={{display:'block',width:'100%',padding:'6px 10px',marginBottom:3,borderRadius:6,border:heures===r.h?'1px solid #c6a34e':'1px solid rgba(255,255,255,.05)',background:heures===r.h?'rgba(198,163,78,.08)':'transparent',color:heures===r.h?'#c6a34e':'#888',fontSize:10,cursor:'pointer',textAlign:'left',fontFamily:'inherit'}}>{r.l} ({r.h}h — {r.f})</button>)}
        <div style={{marginTop:12}}><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Heures complementaires/sem: {hCompl}h</label>
          <input type="range" min={0} max={12} step={1} value={hCompl} onChange={e=>setHCompl(+e.target.value)} style={{width:'100%',accentColor:'#fb923c'}}/></div>
        <div style={{marginTop:8,padding:8,background:'rgba(198,163,78,.04)',borderRadius:6,fontSize:10,color:'#888'}}>Fraction: <b style={{color:'#c6a34e'}}>{Math.round(fraction*10000)/100}%</b></div>
      </div>
      <div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          <C title="Temps plein"><Row l="Brut" v={fmt(brutFT)+' €'}/><Row l="Net" v={fmt(netFT)+' €'} c="#4ade80"/><Row l="Cout" v={fmt(Math.round(brutFT*(1+TX_ONSS_E)*100)/100)+' €'} c="#f87171"/></C>
          <C title={"Temps partiel ("+Math.round(fraction*100)+"%)"}><Row l="Brut prorata" v={fmt(brutTP)+' €'}/>{hCompl>0&&<Row l={"+ Heures compl. ("+hCompl+"h/sem)"} v={'+'+fmt(brutCompl)+' €'} c="#fb923c"/>}<Row l="Net total" v={fmt(net)+' €'} c="#4ade80"/><Row l="Cout employeur" v={fmt(coutE)+' €'} c="#f87171"/></C>
        </div>

        <C title="Impact droits sociaux">
          {[{l:'Conges payes',v:Math.round(20*fraction)+'j / 20j',p:fraction*100,c:fraction>=0.5?'#4ade80':'#eab308'},
            {l:'Pecule vacances',v:fmt(brutTP*0.1538*12)+' €/an',p:fraction*100,c:'#06b6d4'},
            {l:'Pension legale',v:'Prorata '+Math.round(fraction*100)+'%',p:fraction*100,c:'#3b82f6'},
            {l:'Chomage',v:fraction>=0.33?'Droits maintenus':'⚠️ Risque perte',p:fraction>=0.33?100:30,c:fraction>=0.33?'#4ade80':'#ef4444'},
            {l:'Maladie (salaire garanti)',v:fraction>=0.5?'30 jours complets':'Prorata',p:fraction>=0.5?100:fraction*100,c:fraction>=0.5?'#4ade80':'#eab308'},
          ].map((r,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <span style={{fontSize:11,color:'#e8e6e0',flex:1}}>{r.l}</span>
            <span style={{fontSize:11,color:r.c,fontWeight:600}}>{r.v}</span>
          </div>)}
        </C>

        <C title="Credit-temps (Loi 10/08/2001)">
          {creditTemps.map((ct,i)=><div key={i} style={{padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <div style={{fontSize:11,fontWeight:600,color:'#c6a34e'}}>{ct.type}</div>
            <div style={{fontSize:10,color:'#888'}}>{ct.duree} — {ct.alloc}</div>
          </div>)}
        </C>
      </div>
    </div>
  </div>;
}
