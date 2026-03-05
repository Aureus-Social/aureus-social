'use client';
import{useState,useMemo}from'react';

const TX_ONSS_E=0.2507,TX_ONSS_W=0.1307;
const fmt=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);
const fi=v=>new Intl.NumberFormat('fr-BE',{maximumFractionDigits:0}).format(v||0);
const C=({children,title:t})=><div style={{background:'rgba(198,163,78,.03)',borderRadius:12,padding:16,border:'1px solid rgba(198,163,78,.08)',marginBottom:14}}>{t&&<div style={{fontSize:13,fontWeight:600,color:'#c6a34e',marginBottom:12}}>{t}</div>}{children}</div>;
const KPI=({l,v,c,sub})=><div style={{padding:14,background:'linear-gradient(135deg,#0d1117,#131820)',border:'1px solid '+(c||'#c6a34e')+'20',borderRadius:12,textAlign:'center',flex:1,minWidth:110}}><div style={{fontSize:20,fontWeight:800,color:c||'#c6a34e'}}>{v}</div><div style={{fontSize:9,color:'#888',marginTop:3}}>{l}</div>{sub&&<div style={{fontSize:8,color:'#5e5c56',marginTop:2}}>{sub}</div>}</div>;
const Row=({l,v,c})=><div style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><span style={{color:'#e8e6e0',fontSize:11.5}}>{l}</span><span style={{color:c||'#c6a34e',fontWeight:600,fontSize:12}}>{v}</span></div>;
const Badge=({text,color})=><span style={{padding:'2px 7px',borderRadius:5,fontSize:8,fontWeight:600,background:(color||'#888')+'15',color:color||'#888'}}>{text}</span>;
const quickPP=br=>{const imp=br*(1-TX_ONSS_W);if(imp<=1170)return 0;if(imp<=2350)return Math.round((imp-1170)*0.25*100)/100;return Math.round((1180*0.25+(imp-2350)*0.4)*100)/100;};

// ═══════════════════════════════════════════════════════════
// 1. DASHBOARD RH — Vrais indicateurs calcules
// ═══════════════════════════════════════════════════════════
export function DashboardRHV2({s,d}){
  const clients=s.clients||[];const now=new Date();const yr=now.getFullYear();
  const allEmps=clients.flatMap(c=>(c.emps||[]).map(e=>({...e,_co:c.company?.name||c.id})));
  const n=allEmps.length;const [tab,setTab]=useState('overview');
  const mb=allEmps.reduce((a,e)=>a+(+(e.monthlySalary||e.gross||e.brut||0)),0);
  const coutTotal=mb*(1+TX_ONSS_E);

  // Real calcs
  const cdi=allEmps.filter(e=>!e.contractType||(e.contractType||'').toUpperCase()==='CDI').length;
  const cdd=allEmps.filter(e=>(e.contractType||'').toUpperCase()==='CDD').length;
  const tp=allEmps.filter(e=>(e.regime||100)<100).length;
  const sortis=allEmps.filter(e=>{const ds=e.dateSortie||e.endDate;return ds&&new Date(ds).getFullYear()===yr;}).length;
  const entres=allEmps.filter(e=>{const de=e.dateEntree||e.startDate||e.start;return de&&new Date(de).getFullYear()===yr;}).length;
  const turnover=n>0?Math.round(sortis/n*100):0;
  const totalAbsDays=allEmps.reduce((a,e)=>a+(+(e.joursMaladie||e.sickDays||0))+(+(e.joursAbsence||0)),0);
  const absRate=n>0?Math.round(totalAbsDays/(n*220)*10000)/100:0;
  const avgBrut=n>0?mb/n:0;
  const avgAnc=n>0?Math.round(allEmps.reduce((a,e)=>{const s2=new Date(e.startDate||e.start||'2020-01-01');return a+Math.max(0,(now-s2)/(365.25*24*60*60*1000));},0)/n*10)/10:0;
  const hommes=allEmps.filter(e=>(e.sexe||e.gender||'').toLowerCase().match(/^(m|h|homme|male)/)).length;
  const femmes=allEmps.filter(e=>(e.sexe||e.gender||'').toLowerCase().match(/^(f|v|femme|female)/)).length;
  const noNISS=allEmps.filter(e=>!e.niss&&!e.NISS).length;
  const noIBAN=allEmps.filter(e=>!e.iban&&!e.IBAN).length;
  const noSalary=allEmps.filter(e=>!(+(e.monthlySalary||e.gross||0))).length;

  // Events
  const events=[];
  allEmps.forEach(e=>{
    const name=(e.first||e.fn||'?')+' '+(e.last||e.ln||'?');
    if((e.contractType||'').toUpperCase()==='CDD'){
      const end=new Date(e.endDate||e.end||'2099-12-31');
      const d2=Math.ceil((end-now)/86400000);
      if(d2<=90&&d2>-30) events.push({name,event:d2<0?'CDD expire!':'Fin CDD J-'+d2,c:d2<0?'#ef4444':d2<30?'#eab308':'#3b82f6',co:e._co,days:d2});
    }
    const start=new Date(e.startDate||e.start||'2020-01-01');
    const mIn=Math.round((now-start)/2592000000);
    if(mIn>=5&&mIn<=7) events.push({name,event:'Evaluation 6 mois',c:'#a855f7',co:e._co,days:180-Math.ceil((now-start)/86400000)});
    if(start.getMonth()===now.getMonth()&&(yr-start.getFullYear())>0) events.push({name,event:'Anniversaire '+(yr-start.getFullYear())+'an(s)',c:'#c6a34e',co:e._co,days:start.getDate()-now.getDate()});
  });
  events.sort((a,b)=>a.days-b.days);

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>📊 Dashboard RH</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Indicateurs reels calcules — {n} travailleurs — {clients.length} clients</p>

    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
      <KPI l="Effectif" v={n} c="#c6a34e" sub={cdi+' CDI / '+cdd+' CDD'}/>
      <KPI l="Turnover" v={turnover+'%'} c={turnover>15?'#ef4444':turnover>8?'#eab308':'#22c55e'} sub={sortis+' depart(s)'}/>
      <KPI l="Absenteisme" v={absRate+'%'} c={absRate>5?'#ef4444':absRate>3?'#eab308':'#22c55e'} sub={totalAbsDays+' jours'}/>
      <KPI l="Masse brute" v={fi(mb)+' €/m'} c="#60a5fa" sub={'Moy: '+fi(avgBrut)+' €'}/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
      <KPI l="Cout employeur" v={fi(coutTotal)+' €/m'} c="#f87171"/>
      <KPI l="Anciennete moy." v={avgAnc+' ans'} c="#a78bfa"/>
      <KPI l="Genre H/F" v={hommes+'/'+femmes} c="#3b82f6" sub={n-hommes-femmes>0?(n-hommes-femmes)+' non def.':''}/>
      <KPI l="Alertes" v={noNISS+noIBAN+noSalary} c={noNISS+noIBAN+noSalary>0?'#ef4444':'#4ade80'} sub={noNISS+' NISS, '+noIBAN+' IBAN'}/>
    </div>

    <div style={{display:'flex',gap:4,marginBottom:16}}>{[{v:'overview',l:'Vue globale'},{v:'events',l:'Evenements'},{v:'alerts',l:'Alertes donnees'},{v:'costs',l:'Analyse couts'}].map(t=>
      <button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 14px',borderRadius:8,border:'none',cursor:'pointer',fontSize:11,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>

    {tab==='overview'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <C title="Repartition contrats">{[{l:'CDI',v:cdi,c:'#4ade80'},{l:'CDD',v:cdd,c:'#f87171'},{l:'Temps partiel',v:tp,c:'#60a5fa'}].map((r,i)=><Row key={i} l={r.l+' ('+( n>0?Math.round(r.v/n*100):0)+'%)'} v={r.v} c={r.c}/>)}</C>
      <C title="Top 5 salaires">{[...allEmps].sort((a,b)=>(+(b.monthlySalary||b.gross||0))-(+(a.monthlySalary||a.gross||0))).slice(0,5).map((e,i)=><Row key={i} l={(e.first||'?')+' '+(e.last||'?')+' — '+e._co} v={fmt(+(e.monthlySalary||e.gross||0))+' €'}/>)}</C>
      <C title="Par client">{clients.map((c,i)=>{const ce=(c.emps||[]);return <Row key={i} l={(c.company?.name||'Client '+(i+1))+' ('+ce.length+' emp.)'} v={fi(ce.reduce((a,e)=>a+(+(e.monthlySalary||e.gross||0)),0)*(1+TX_ONSS_E))+' €/m'}/>;})}</C>
      <C title="Projections annuelles"><Row l="Masse brute annuelle" v={fi(mb*12)+' €'}/><Row l="Cout employeur annuel" v={fi(coutTotal*12)+' €'} c="#f87171"/><Row l="ONSS total" v={fi(mb*12*(TX_ONSS_W+TX_ONSS_E))+' €'} c="#fb923c"/><Row l="Pécule vacances (15.38%)" v={fi(mb*12*0.1538)+' €'} c="#4ade80"/><Row l="13eme mois" v={fi(mb)+' €'} c="#60a5fa"/></C>
    </div>}
    {tab==='events'&&<C title={"Evenements a venir ("+events.length+")"}>
      {events.slice(0,20).map((ev,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <div style={{minWidth:40,textAlign:'center',fontSize:12,fontWeight:700,color:ev.c}}>{ev.days<0?'+'+Math.abs(ev.days):'J-'+ev.days}</div>
        <div style={{flex:1}}><div style={{fontSize:11,color:'#e8e6e0'}}>{ev.name}</div><div style={{fontSize:9,color:'#888'}}>{ev.co}</div></div>
        <Badge text={ev.event} color={ev.c}/>
      </div>)}
      {events.length===0&&<div style={{textAlign:'center',color:'#888',padding:20}}>Aucun evenement a venir</div>}
    </C>}
    {tab==='alerts'&&<C title="Donnees incompletes">
      {noNISS>0&&<Row l={'NISS manquants: '+noNISS+' employe(s)'} v="⚠️" c="#ef4444"/>}
      {noIBAN>0&&<Row l={'IBAN manquants: '+noIBAN+' employe(s)'} v="⚠️" c="#eab308"/>}
      {noSalary>0&&<Row l={'Salaire = 0: '+noSalary+' employe(s)'} v="❌" c="#ef4444"/>}
      {noNISS+noIBAN+noSalary===0&&<div style={{textAlign:'center',padding:20,color:'#4ade80'}}>✅ Toutes les donnees sont completes</div>}
      {allEmps.filter(e=>!e.niss&&!e.NISS).slice(0,10).map((e,i)=><div key={i} style={{fontSize:10,color:'#888',padding:'3px 0'}}>🆔 {e.first||'?'} {e.last||'?'} — {e._co}</div>)}
    </C>}
    {tab==='costs'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <C title="Structure cout mensuel"><Row l="Salaires bruts" v={fmt(mb)+' €'}/><Row l={'ONSS patronal ('+(TX_ONSS_E*100).toFixed(1)+'%)'} v={'+'+fmt(mb*TX_ONSS_E)+' €'} c="#f87171"/><Row l="Precompte pro estime" v={fmt(allEmps.reduce((a,e)=>a+quickPP(+(e.monthlySalary||e.gross||0)),0))+' €'} c="#fb923c"/><Row l="Net total employes" v={fmt(mb*(1-TX_ONSS_W)-allEmps.reduce((a,e)=>a+quickPP(+(e.monthlySalary||e.gross||0)),0))+' €'} c="#4ade80"/><div style={{borderTop:'2px solid rgba(198,163,78,.2)',paddingTop:8,marginTop:4}}><Row l="COUT TOTAL" v={fmt(coutTotal)+' €/mois'}/></div></C>
      <C title="Ratio & benchmarks"><Row l="Cout moyen/employe" v={fi(n>0?coutTotal/n:0)+' €'}/><Row l="Ratio net/cout" v={(coutTotal>0?Math.round((mb*(1-TX_ONSS_W)-allEmps.reduce((a,e)=>a+quickPP(+(e.monthlySalary||e.gross||0)),0))/coutTotal*10000)/100:0)+'%'} c="#4ade80"/><Row l="Taux de charge" v={(mb>0?Math.round((coutTotal-mb)/mb*10000)/100:0)+'%'} c="#f87171"/><Row l="Benchmark CP 200" v="~30-35%" c="#888"/></C>
    </div>}
  </div>;
}

// ═══════════════════════════════════════════════════════════
// 2. REGISTRE PERSONNEL — Format legal + export PDF
// ═══════════════════════════════════════════════════════════
export function RegistrePersonnelV2({s}){
  const clients=s.clients||[];const [sel,setSel]=useState(0);const now=new Date();
  const cl=clients[sel];const co=cl?.company||{};const emps=cl?.emps||[];

  const generateRegistre=()=>{
    let html=`<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:10px;padding:20mm;max-width:297mm}
h1{font-size:14px;text-align:center;margin:8px 0;text-transform:uppercase;letter-spacing:2px}
table{width:100%;border-collapse:collapse;margin:12px 0}
th{background:#f5f1e8;padding:5px 4px;font-size:7.5px;border:1px solid #ccc;text-align:center;text-transform:uppercase}
td{padding:4px;border:1px solid #ddd;font-size:8.5px}
.header{text-align:center;border-bottom:2px solid #c6a34e;padding-bottom:10px;margin-bottom:15px}
.footer{margin-top:20px;font-size:8px;color:#888;border-top:1px solid #ddd;padding-top:8px}
@media print{button{display:none!important}.no-print{display:none!important}}
</style></head><body>
<div class="header">
  <div style="font-size:18px;font-weight:800;color:#c6a34e;letter-spacing:3px">REGISTRE GENERAL DU PERSONNEL</div>
  <div style="font-size:10px;color:#666;margin-top:4px">Arrete Royal du 8 aout 1980 relatif a la tenue des documents sociaux</div>
</div>
<table style="width:auto;margin-bottom:15px">
  <tr><td style="font-weight:bold;width:150px">Employeur</td><td>${co.name||'—'}</td></tr>
  <tr><td style="font-weight:bold">N° BCE / TVA</td><td>${co.vat||'—'}</td></tr>
  <tr><td style="font-weight:bold">N° ONSS</td><td>${co.onss||'—'}</td></tr>
  <tr><td style="font-weight:bold">Siege social</td><td>${co.address||''} ${co.zip||''} ${co.city||''}</td></tr>
  <tr><td style="font-weight:bold">Commission paritaire</td><td>CP ${co.cp||'200'}</td></tr>
  <tr><td style="font-weight:bold">Date impression</td><td>${now.toLocaleDateString('fr-BE')} a ${now.toLocaleTimeString('fr-BE')}</td></tr>
</table>
<table>
  <tr><th>N° ordre</th><th>Nom</th><th>Prenom</th><th>NISS</th><th>Sexe</th><th>Nationalite</th><th>Date naiss.</th><th>Domicile</th><th>Debut</th><th>Fin</th><th>Type contrat</th><th>Regime</th><th>Fonction</th><th>Brut mensuel</th></tr>`;
    emps.forEach((e,i)=>{
      html+=`<tr>
        <td style="text-align:center;font-weight:bold">${String(i+1).padStart(3,'0')}</td>
        <td style="font-weight:bold">${e.last||e.ln||'—'}</td><td>${e.first||e.fn||'—'}</td>
        <td style="font-family:monospace">${e.niss||e.NISS||'—'}</td>
        <td style="text-align:center">${e.sexe||e.gender||'—'}</td>
        <td>${e.nationality||'Belge'}</td><td>${e.birthDate||'—'}</td>
        <td style="font-size:7.5px">${e.address||'—'}</td>
        <td>${e.startDate||e.start||'—'}</td><td>${e.endDate||e.end||'—'}</td>
        <td style="text-align:center">${e.contractType||'CDI'}</td>
        <td style="text-align:center">${e.regime||100}%</td>
        <td>${e.function||e.titre||e.job||'—'}</td>
        <td style="text-align:right;font-family:monospace">${fmt(+(e.monthlySalary||e.gross||0))} EUR</td>
      </tr>`;
    });
    html+=`</table>
<div class="footer">
  <div>Total: <strong>${emps.length}</strong> travailleur(s) inscrit(s) au registre</div>
  <div>Ce document est confidentiel et doit etre tenu a disposition de l'inspection sociale (Art. 4 AR 08/08/1980)</div>
  <div>Document généré par Aureus Social Pro — ${now.toLocaleDateString('fr-BE')}</div>
</div>
<div style="text-align:center;margin:20px" class="no-print">
  <button onclick="window.print()" style="background:#c6a34e;color:#fff;border:none;padding:12px 30px;border-radius:8px;cursor:pointer;font-weight:700;font-size:14px">🖨 Imprimer / Sauvegarder PDF</button>
</div>
</body></html>`;
    const w=window.open('','_blank');w.document.write(html);w.document.close();
  };

  return <div style={{padding:24}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
      <div><h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:0}}>📖 Registre du Personnel</h2><p style={{fontSize:12,color:'#888',margin:'4px 0 0'}}>Format legal — AR du 8 aout 1980 — {emps.length} travailleurs</p></div>
      <div style={{display:'flex',gap:8}}>
        <select value={sel} onChange={e=>setSel(+e.target.value)} style={{padding:'8px 12px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:8,color:'#e5e5e5',fontSize:11,fontFamily:'inherit'}}>{clients.map((c,i)=><option key={i} value={i}>{c.company?.name||'Client '+(i+1)} ({(c.emps||[]).length})</option>)}</select>
        <button onClick={generateRegistre} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#c6a34e,#a07d3e)',color:'#060810',fontWeight:700,fontSize:12,cursor:'pointer'}}>📄 Generer PDF legal</button>
      </div>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
      <KPI l="Inscrits" v={emps.length} c="#c6a34e"/><KPI l="CDI" v={emps.filter(e=>!e.contractType||e.contractType==='CDI').length} c="#4ade80"/><KPI l="CDD" v={emps.filter(e=>e.contractType==='CDD').length} c="#eab308"/><KPI l="NISS complets" v={emps.filter(e=>e.niss||e.NISS).length+'/'+emps.length} c={emps.every(e=>e.niss||e.NISS)?'#4ade80':'#ef4444'}/>
    </div>

    <div style={{border:'1px solid rgba(198,163,78,.1)',borderRadius:14,overflow:'hidden'}}>
      <div style={{display:'grid',gridTemplateColumns:'40px 1fr 1fr 120px 60px 80px 80px 80px',padding:'8px 12px',background:'rgba(198,163,78,.06)',fontSize:8,fontWeight:600,color:'#c6a34e',textTransform:'uppercase',letterSpacing:'.5px'}}>
        <div>N°</div><div>Nom</div><div>Prenom</div><div>NISS</div><div>Contrat</div><div>Debut</div><div>Fonction</div><div style={{textAlign:'right'}}>Brut</div>
      </div>
      <div style={{maxHeight:500,overflowY:'auto'}}>
        {emps.map((e,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'40px 1fr 1fr 120px 60px 80px 80px 80px',padding:'6px 12px',borderBottom:'1px solid rgba(255,255,255,.02)',fontSize:11,alignItems:'center'}}>
          <span style={{color:'#888',fontWeight:600}}>{String(i+1).padStart(3,'0')}</span>
          <span style={{color:'#e8e6e0',fontWeight:600}}>{e.last||e.ln||'—'}</span>
          <span style={{color:'#e8e6e0'}}>{e.first||e.fn||'—'}</span>
          <span style={{fontFamily:'monospace',fontSize:10,color:e.niss||e.NISS?'#e8e6e0':'#ef4444'}}>{e.niss||e.NISS||'⚠️ MANQUANT'}</span>
          <Badge text={e.contractType||'CDI'} color={(e.contractType||'CDI')==='CDI'?'#4ade80':'#eab308'}/>
          <span style={{fontSize:10,color:'#888'}}>{e.startDate||e.start||'—'}</span>
          <span style={{fontSize:10,color:'#888'}}>{e.function||e.titre||'—'}</span>
          <span style={{textAlign:'right',fontFamily:'monospace',color:'#c6a34e'}}>{fmt(+(e.monthlySalary||e.gross||0))}</span>
        </div>)}
        {emps.length===0&&<div style={{padding:30,textAlign:'center',color:'#888'}}>Aucun employé pour ce client</div>}
      </div>
    </div>
    <div style={{marginTop:12,padding:10,background:'rgba(198,163,78,.03)',borderRadius:8,fontSize:10,color:'#888'}}>
      📋 Obligation legale: Le registre du personnel doit etre tenu a jour et mis a disposition lors de tout controle social (Art. 4 AR 08/08/1980). Le bouton "Generer PDF legal" produit un document au format officiel imprimable.
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════
// 3. PORTAIL EMPLOYE — Fiches paie + demandes fonctionnelles
// ═══════════════════════════════════════════════════════════
export function PortailEmployeV2({s,d}){
  const clients=s.clients||[];const [selC,setSelC]=useState(0);const [selE,setSelE]=useState(0);
  const [tab,setTab]=useState('accueil');const [demandes,setDemandes]=useState([]);
  const [newDem,setNewDem]=useState({type:'conge',dateDebut:'',dateFin:'',motif:''});
  const mois=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const cl=clients[selC]||{emps:[]};const emp=(cl.emps||[])[selE];
  if(!emp)return <div style={{padding:24,textAlign:'center',color:'#888'}}>Ajoutez des clients et employés pour accéder au portail.</div>;

  const name=(emp.first||emp.fn||'')+' '+(emp.last||emp.ln||'');
  const brut=+(emp.monthlySalary||emp.gross||0);
  const onss=Math.round(brut*TX_ONSS_W*100)/100;
  const pp=quickPP(brut);
  const net=Math.round((brut-onss-pp)*100)/100;
  const anc=emp.startDate?Math.round((new Date()-new Date(emp.startDate))/2592000000):0;
  const congesUsed=(emp.absences||[]).filter(a=>a.type==='conge').reduce((a,ab)=>a+(+(ab.days||ab.jours||1)),0);
  const congesTotal=20;const congesRestants=Math.max(0,congesTotal-congesUsed);

  // Mock payslip history
  const payHistory=Array.from({length:6},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-1-i);return{month:mois[d.getMonth()],year:d.getFullYear(),brut,onss,pp,net,status:'distribue'};});

  const submitDemande=()=>{
    if(!newDem.dateDebut)return;
    setDemandes(p=>[{...newDem,id:Date.now(),status:'en_attente',createdAt:new Date().toISOString(),empName:name},...p]);
    setNewDem({type:'conge',dateDebut:'',dateFin:'',motif:''});
  };

  return <div style={{padding:24}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
      <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:0}}>👤 Portail Employe</h2>
      <div style={{display:'flex',gap:6}}>
        <select value={selC} onChange={e=>{setSelC(+e.target.value);setSelE(0);}} style={{padding:'6px 10px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:6,color:'#e5e5e5',fontSize:10,fontFamily:'inherit'}}>{clients.map((c,i)=><option key={i} value={i}>{c.company?.name||'Client '+(i+1)}</option>)}</select>
        <select value={selE} onChange={e=>setSelE(+e.target.value)} style={{padding:'6px 10px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:6,color:'#e5e5e5',fontSize:10,fontFamily:'inherit'}}>{(cl.emps||[]).map((e,i)=><option key={i} value={i}>{(e.first||'?')+' '+(e.last||'?')}</option>)}</select>
        <Badge text="MODE PREVIEW" color="#eab308"/>
      </div>
    </div>
    <p style={{fontSize:11,color:'#888',margin:'0 0 16px'}}>Espace personnel employé — fiches de paie, demandes, infos</p>

    {/* Welcome */}
    <div style={{padding:18,background:'linear-gradient(135deg,#0d1117,#131820)',border:'1px solid rgba(198,163,78,.15)',borderRadius:14,marginBottom:16}}>
      <div style={{display:'flex',alignItems:'center',gap:14}}>
        <div style={{width:48,height:48,borderRadius:24,background:'linear-gradient(135deg,#c6a34e,#a07d3e)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'#060810',fontWeight:800}}>{(emp.first||'?')[0]}{(emp.last||'?')[0]}</div>
        <div><div style={{fontSize:16,fontWeight:700,color:'#e5e5e5'}}>Bonjour, {emp.first||name} 👋</div><div style={{fontSize:11,color:'#888'}}>{emp.function||emp.job||'Employé'} — {cl.company?.name} — {emp.contractType||'CDI'} — {anc} mois ancienneté</div></div>
      </div>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
      <KPI l="Net mensuel" v={fmt(net)+' €'} c="#22c55e"/><KPI l="Conges restants" v={congesRestants+'/'+congesTotal} c="#c6a34e"/><KPI l="Anciennete" v={anc+' mois'} c="#3b82f6"/><KPI l="Prochain salaire" v={'25/'+String(new Date().getMonth()+1).padStart(2,'0')} c="#a855f7"/>
    </div>

    <div style={{display:'flex',gap:4,marginBottom:16}}>{[{v:'accueil',l:'📋 Mon dossier'},{v:'fiches',l:'💰 Fiches de paie'},{v:'demandes',l:'📝 Demandes'},{v:'absences',l:'📅 Absences'}].map(t=>
      <button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 14px',borderRadius:8,border:'none',cursor:'pointer',fontSize:11,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>

    {tab==='accueil'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <C title="Informations personnelles"><Row l="Nom" v={name}/><Row l="NISS" v={emp.niss||'—'}/><Row l="Email" v={emp.email||'—'}/><Row l="Adresse" v={emp.address||'—'}/><Row l="IBAN" v={emp.iban||'—'}/></C>
      <C title="Contrat"><Row l="Type" v={emp.contractType||'CDI'}/><Row l="Debut" v={emp.startDate||emp.start||'—'}/><Row l="Regime" v={(emp.regime||100)+'%'}/><Row l="Fonction" v={emp.function||'—'}/><Row l="Brut mensuel" v={fmt(brut)+' €'}/></C>
    </div>}

    {tab==='fiches'&&<C title="Historique fiches de paie">
      <div style={{border:'1px solid rgba(198,163,78,.08)',borderRadius:10,overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 80px 80px 60px',padding:'8px 12px',background:'rgba(198,163,78,.06)',fontSize:9,fontWeight:600,color:'#c6a34e'}}>
          <div>Periode</div><div style={{textAlign:'right'}}>Brut</div><div style={{textAlign:'right'}}>ONSS</div><div style={{textAlign:'right'}}>PP</div><div style={{textAlign:'right'}}>Net</div><div/>
        </div>
        {payHistory.map((p,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 80px 80px 60px',padding:'6px 12px',borderBottom:'1px solid rgba(255,255,255,.02)',fontSize:11,alignItems:'center'}}>
          <span style={{color:'#e8e6e0',fontWeight:500}}>{p.month} {p.year}</span>
          <span style={{textAlign:'right',fontFamily:'monospace'}}>{fmt(p.brut)}</span>
          <span style={{textAlign:'right',fontFamily:'monospace',color:'#f87171'}}>-{fmt(p.onss)}</span>
          <span style={{textAlign:'right',fontFamily:'monospace',color:'#fb923c'}}>-{fmt(p.pp)}</span>
          <span style={{textAlign:'right',fontFamily:'monospace',color:'#4ade80',fontWeight:700}}>{fmt(p.net)}</span>
          <button style={{padding:'3px 8px',borderRadius:4,border:'none',background:'rgba(198,163,78,.08)',color:'#c6a34e',fontSize:9,cursor:'pointer',fontFamily:'inherit'}}>📄 PDF</button>
        </div>)}
      </div>
    </C>}

    {tab==='demandes'&&<div>
      <C title="Nouvelle demande">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8,marginBottom:10}}>
          <div><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Type</label><select value={newDem.type} onChange={e=>setNewDem(p=>({...p,type:e.target.value}))} style={{width:'100%',padding:'8px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:6,color:'#e5e5e5',fontSize:11,fontFamily:'inherit'}}><option value="conge">Conge</option><option value="maladie">Maladie</option><option value="formation">Formation</option><option value="teletravail">Teletravail</option><option value="attestation">Attestation</option><option value="autre">Autre</option></select></div>
          <div><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Date debut</label><input type="date" value={newDem.dateDebut} onChange={e=>setNewDem(p=>({...p,dateDebut:e.target.value}))} style={{width:'100%',padding:'8px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:6,color:'#e5e5e5',fontSize:11,fontFamily:'inherit'}}/></div>
          <div><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Date fin</label><input type="date" value={newDem.dateFin} onChange={e=>setNewDem(p=>({...p,dateFin:e.target.value}))} style={{width:'100%',padding:'8px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:6,color:'#e5e5e5',fontSize:11,fontFamily:'inherit'}}/></div>
          <div><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Motif</label><input value={newDem.motif} onChange={e=>setNewDem(p=>({...p,motif:e.target.value}))} placeholder="Optionnel" style={{width:'100%',padding:'8px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:6,color:'#e5e5e5',fontSize:11,fontFamily:'inherit'}}/></div>
        </div>
        <button onClick={submitDemande} style={{padding:'8px 20px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#c6a34e,#a07d3e)',color:'#060810',fontWeight:700,fontSize:12,cursor:'pointer'}}>📝 Soumettre</button>
      </C>
      <C title={"Mes demandes ("+demandes.length+")"}>
        {demandes.map((dm,i)=><div key={dm.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <Badge text={dm.type} color="#c6a34e"/><span style={{color:'#e8e6e0',fontSize:11,flex:1}}>{dm.dateDebut}{dm.dateFin?' → '+dm.dateFin:''} {dm.motif&&'— '+dm.motif}</span>
          <Badge text={dm.status==='en_attente'?'En attente':dm.status==='approuve'?'Approuve':'Refuse'} color={dm.status==='en_attente'?'#eab308':dm.status==='approuve'?'#4ade80':'#ef4444'}/>
        </div>)}
        {demandes.length===0&&<div style={{textAlign:'center',padding:20,color:'#888',fontSize:11}}>Aucune demande</div>}
      </C>
    </div>}

    {tab==='absences'&&<C title="Historique absences">
      {(emp.absences||[]).length===0&&<div style={{textAlign:'center',padding:20,color:'#888'}}>Aucune absence enregistree</div>}
      {(emp.absences||[]).map((ab,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <Badge text={ab.type} color={ab.type==='maladie'?'#ef4444':ab.type==='conge'?'#22c55e':'#3b82f6'}/>
        <span style={{fontSize:11,color:'#e8e6e0',flex:1}}>{ab.dateDebut||ab.from||'—'} → {ab.dateFin||ab.to||'—'}</span>
        <span style={{fontSize:10,color:'#888'}}>{ab.days||ab.jours||'?'} jours</span>
      </div>)}
    </C>}
  </div>;
}

// ═══════════════════════════════════════════════════════════
// 4. GESTION INTERIMAIRES — Contrats + DIMONA + Couts
// ═══════════════════════════════════════════════════════════
export function GestionInterimairesV2({s,d}){
  const clients=s.clients||[];const [sel,setSel]=useState(0);
  const [ints,setInts]=useState([]);const [showAdd,setShowAdd]=useState(false);const [tab,setTab]=useState('liste');
  const agences=[{id:'randstad',n:'Randstad',c:'#0066cc'},{id:'adecco',n:'Adecco',c:'#ef4444'},{id:'manpower',n:'Manpower',c:'#3b82f6'},{id:'tempo',n:'Tempo-Team',c:'#22c55e'},{id:'start',n:'Start People',c:'#eab308'},{id:'unique',n:'Unique',c:'#a855f7'},{id:'robert',n:'Robert Half',c:'#06b6d4'}];
  const [ni,setNi]=useState({first:'',last:'',niss:'',agence:'randstad',brutH:15.50,heures:152,coeff:2.0,motif:'remplacement',debut:'',fin:'',client:''});
  const addI=()=>{if(!ni.first)return;const b=Math.round(ni.brutH*ni.heures*100)/100;setInts(p=>[...p,{...ni,id:Date.now(),brut:b,cout:Math.round(b*ni.coeff*100)/100,dimona:!!ni.niss}]);setShowAdd(false);setNi({first:'',last:'',niss:'',agence:'randstad',brutH:15.50,heures:152,coeff:2.0,motif:'remplacement',debut:'',fin:'',client:''});};

  const totalBrut=ints.reduce((a,i)=>a+i.brut,0);
  const totalCout=ints.reduce((a,i)=>a+i.cout,0);

  return <div style={{padding:24}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
      <div><h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:0}}>👷 Gestion Interimaires</h2><p style={{fontSize:12,color:'#888',margin:'4px 0 0'}}>Contrats, DIMONA, suivi couts agences — {ints.length} actifs</p></div>
      <button onClick={()=>setShowAdd(true)} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#c6a34e,#a07d3e)',color:'#060810',fontWeight:700,fontSize:12,cursor:'pointer'}}>+ Interimaire</button>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
      <KPI l="Interimaires actifs" v={ints.length} c="#c6a34e"/><KPI l="Brut total" v={fmt(totalBrut)+' €'} c="#60a5fa"/><KPI l="Cout agences" v={fmt(totalCout)+' €'} c="#ef4444"/><KPI l="Coeff. moyen" v={ints.length>0?'x'+(ints.reduce((a,i)=>a+i.coeff,0)/ints.length).toFixed(2):'—'} c="#fb923c"/>
    </div>

    <div style={{display:'flex',gap:4,marginBottom:16}}>{[{v:'liste',l:'📋 Liste'},{v:'contrats',l:'📝 Contrats'},{v:'couts',l:'💰 Analyse couts'}].map(t=>
      <button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 14px',borderRadius:8,border:'none',cursor:'pointer',fontSize:11,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>

    {tab==='liste'&&<div style={{border:'1px solid rgba(198,163,78,.1)',borderRadius:14,overflow:'hidden'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 100px 70px 60px 80px 80px 30px',padding:'8px 12px',background:'rgba(198,163,78,.06)',fontSize:9,fontWeight:600,color:'#c6a34e'}}>
        <div>Nom</div><div>Agence</div><div>NISS</div><div>Heures</div><div>Coeff</div><div style={{textAlign:'right'}}>Brut</div><div style={{textAlign:'right'}}>Cout</div><div/>
      </div>
      {ints.map((it,i)=>{const ag=agences.find(a=>a.id===it.agence);return <div key={it.id} style={{display:'grid',gridTemplateColumns:'1fr 1fr 100px 70px 60px 80px 80px 30px',padding:'6px 12px',borderBottom:'1px solid rgba(255,255,255,.02)',fontSize:11,alignItems:'center'}}>
        <span style={{color:'#e8e6e0',fontWeight:500}}>{it.first} {it.last}</span>
        <span style={{color:ag?.c||'#888'}}>{ag?.n||it.agence}</span>
        <span style={{fontFamily:'monospace',fontSize:10,color:it.niss?'#e8e6e0':'#eab308'}}>{it.niss||'—'}</span>
        <span style={{color:'#888'}}>{it.heures}h</span>
        <span style={{color:'#c6a34e'}}>x{it.coeff}</span>
        <span style={{textAlign:'right',fontFamily:'monospace'}}>{fmt(it.brut)}</span>
        <span style={{textAlign:'right',fontFamily:'monospace',color:'#ef4444',fontWeight:600}}>{fmt(it.cout)}</span>
        <button onClick={()=>setInts(p=>p.filter(x=>x.id!==it.id))} style={{background:'none',border:'none',color:'#ef4444',cursor:'pointer'}}>✕</button>
      </div>;})}
      {ints.length===0&&<div style={{padding:30,textAlign:'center',color:'#888'}}>Aucun interimaire. Cliquez + pour ajouter.</div>}
    </div>}

    {tab==='contrats'&&<C title="Contrats & DIMONA interimaires">
      {ints.map((it,i)=><div key={it.id} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><b style={{color:'#e8e6e0',fontSize:12}}>{it.first} {it.last}</b> <span style={{color:'#888',fontSize:10}}>— {agences.find(a=>a.id===it.agence)?.n} — {it.motif}</span></div>
          <div style={{display:'flex',gap:6}}>
            <Badge text={it.debut?'Du '+it.debut:'Pas de date'} color={it.debut?'#4ade80':'#eab308'}/>
            <Badge text={it.niss?'DIMONA pret':'NISS manquant'} color={it.niss?'#4ade80':'#ef4444'}/>
          </div>
        </div>
      </div>)}
      {ints.length===0&&<div style={{textAlign:'center',padding:20,color:'#888'}}>Aucun contrat interimaire</div>}
    </C>}

    {tab==='couts'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <C title="Cout par agence">{[...new Set(ints.map(i=>i.agence))].map(ag=>{const agInts=ints.filter(i=>i.agence===ag);const agInfo=agences.find(a=>a.id===ag);return <Row key={ag} l={(agInfo?.n||ag)+' ('+agInts.length+')' } v={fmt(agInts.reduce((a,i)=>a+i.cout,0))+' €'} c={agInfo?.c}/>;})}{ints.length===0&&<div style={{color:'#888',fontSize:11}}>Pas de donnees</div>}</C>
      <C title="Comparaison interim vs CDI">
        <Row l="Cout interim/mois" v={fmt(totalCout)+' €'} c="#ef4444"/>
        <Row l="Equivalent CDI (ONSS)" v={fmt(totalBrut*(1+TX_ONSS_E))+' €'} c="#4ade80"/>
        <Row l="Surcout interim" v={totalBrut>0?'+'+Math.round((totalCout-totalBrut*(1+TX_ONSS_E))/(totalBrut*(1+TX_ONSS_E))*100)+'%':'—'} c={totalCout>totalBrut*(1+TX_ONSS_E)?'#ef4444':'#4ade80'}/>
        <div style={{marginTop:8,fontSize:10,color:'#888'}}>💡 L'interim coute en moyenne 80-100% de plus qu'un CDI equivalent (coefficient agence 1.8-2.2x).</div>
      </C>
    </div>}

    {showAdd&&<div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.6)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowAdd(false)}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#0d1117',border:'1px solid rgba(198,163,78,.2)',borderRadius:16,padding:24,width:500}}>
        <h3 style={{fontSize:16,fontWeight:700,color:'#c6a34e',marginBottom:14}}>Nouvel interimaire</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {[{l:'Prenom',k:'first'},{l:'Nom',k:'last'},{l:'NISS',k:'niss'},{l:'Brut/h (€)',k:'brutH',t:'number'},{l:'Heures/mois',k:'heures',t:'number'},{l:'Coefficient',k:'coeff',t:'number'},{l:'Date debut',k:'debut',t:'date'},{l:'Date fin',k:'fin',t:'date'},{l:'Motif',k:'motif'}].map((f,i)=>
            <div key={i}><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>{f.l}</label><input type={f.t||'text'} value={ni[f.k]} onChange={e=>setNi(p=>({...p,[f.k]:f.t==='number'?+e.target.value:e.target.value}))} style={{width:'100%',padding:'8px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:6,color:'#e5e5e5',fontSize:11,fontFamily:'inherit',boxSizing:'border-box'}}/></div>
          )}
          <div><label style={{fontSize:10,color:'#888',display:'block',marginBottom:3}}>Agence</label><select value={ni.agence} onChange={e=>setNi(p=>({...p,agence:e.target.value}))} style={{width:'100%',padding:'8px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:6,color:'#e5e5e5',fontSize:11,fontFamily:'inherit'}}>{agences.map(a=><option key={a.id} value={a.id}>{a.n}</option>)}</select></div>
        </div>
        <div style={{display:'flex',gap:8,marginTop:14}}><button onClick={addI} style={{flex:1,padding:'10px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#c6a34e,#a07d3e)',color:'#060810',fontWeight:700,fontSize:12,cursor:'pointer'}}>Ajouter</button><button onClick={()=>setShowAdd(false)} style={{padding:'10px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:'#888',fontSize:12,cursor:'pointer'}}>Annuler</button></div>
      </div>
    </div>}
  </div>;
}
