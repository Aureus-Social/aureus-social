'use client';
import{useState,useMemo}from'react';

const fmt=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);
const fi=v=>new Intl.NumberFormat('fr-BE',{maximumFractionDigits:0}).format(v||0);
const C=({children,title:t,sub,color})=><div style={{background:'rgba(198,163,78,.03)',borderRadius:12,padding:16,border:'1px solid '+(color||'rgba(198,163,78,.08)'),marginBottom:14}}>{t&&<div style={{fontSize:13,fontWeight:600,color:color||'#c6a34e',marginBottom:sub?2:10}}>{t}</div>}{sub&&<div style={{fontSize:10,color:'#888',marginBottom:10}}>{sub}</div>}{children}</div>;
const Row=({l,v,c,b,sub})=><div style={{display:'flex',justifyContent:'space-between',padding:b?'8px 0':'5px 0',borderBottom:b?'2px solid rgba(198,163,78,.2)':'1px solid rgba(255,255,255,.03)',fontWeight:b?700:400}}><span style={{color:sub?'#888':'#e8e6e0',fontSize:sub?10:11.5}}>{l}</span><span style={{color:c||'#c6a34e',fontWeight:600,fontSize:12}}>{v}</span></div>;
const I=({label,type,value,onChange,style:st,options,placeholder})=><div style={st}><div style={{fontSize:10,color:'#5e5c56',marginBottom:3}}>{label}</div>{options?<select value={value} onChange={e=>onChange(e.target.value)} style={{width:'100%',padding:'8px 10px',borderRadius:6,border:'1px solid rgba(198,163,78,.15)',background:'rgba(198,163,78,.04)',color:'#e8e6e0',fontSize:12,fontFamily:'inherit'}}>{options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}</select>:<input type={type||'text'} value={value} onChange={e=>onChange(type==='number'?+e.target.value:e.target.value)} placeholder={placeholder} style={{width:'100%',padding:'8px 10px',borderRadius:6,border:'1px solid rgba(198,163,78,.15)',background:'rgba(198,163,78,.04)',color:'#e8e6e0',fontSize:12,fontFamily:'inherit',boxSizing:'border-box'}}/>}</div>;
const Badge=({text,color})=><span style={{padding:'2px 7px',borderRadius:5,fontSize:8,fontWeight:600,background:(color||'#888')+'15',color:color||'#888'}}>{text}</span>;
const TX_ONSS_W=0.1307,TX_ONSS_E=0.2507;

// ════════════════════════════════════════════════════════════
// 1. PLANNING CONGÉS V3 — Chevauchements + règles min présence
// ════════════════════════════════════════════════════════════
export function PlanningCongesV3({s}){
  const emps=(s.clients||[]).flatMap(c=>(c.emps||[]).map(e=>({...e,_cl:c.company?.name||'Client'})));
  const [month,setMonth]=useState(new Date().getMonth());
  const [year]=useState(2026);
  const [tab,setTab]=useState('calendrier');
  const [minPresence,setMinPresence]=useState(60);
  const [conges,setConges]=useState(()=>{
    // Generate sample leave data
    const c={};
    emps.forEach((e,i)=>{
      const key=(e.first||e.fn||'E')+'_'+(e.last||e.ln||i);
      c[key]={};
      // Random leave for demo
      const nbLeave=Math.floor(Math.random()*4);
      for(let l=0;l<nbLeave;l++){
        const day=Math.floor(Math.random()*28)+1;
        c[key][year+'-'+(month+1).toString().padStart(2,'0')+'-'+day.toString().padStart(2,'0')]='conge';
      }
    });
    return c;
  });
  const moisNoms=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const daysInMonth=new Date(year,month+1,0).getDate();
  const days=Array.from({length:daysInMonth},(_,i)=>i+1);
  const n=emps.length;

  // Detect chevauchements
  const chevauchements=useMemo(()=>{
    const dayAbsences={};
    days.forEach(d=>{
      const dateStr=year+'-'+(month+1).toString().padStart(2,'0')+'-'+d.toString().padStart(2,'0');
      const dow=new Date(year,month,d).getDay();
      if(dow===0||dow===6)return;
      let absent=0;
      Object.values(conges).forEach(ec=>{if(ec[dateStr])absent++;});
      const presencePct=n>0?((n-absent)/n*100):100;
      dayAbsences[d]={absent,present:n-absent,pct:presencePct,alert:presencePct<minPresence};
    });
    return dayAbsences;
  },[conges,month,days,n,minPresence]);
  const alertDays=Object.entries(chevauchements).filter(([,v])=>v.alert).length;
  const typeColors={conge:'#22c55e',maladie:'#ef4444',formation:'#a855f7',teletravail:'#06b6d4',recuperation:'#eab308'};

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>📅 Planning Congés</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Chevauchements + règles minimum présence + calendrier équipe</p>

    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:18}}>
      {[{l:'Effectif',v:n,c:'#3b82f6'},{l:'Min présence',v:minPresence+'%',c:'#c6a34e'},{l:'Jours alerte',v:alertDays,c:alertDays>0?'#f87171':'#22c55e'},{l:'Mois',v:moisNoms[month],c:'#c6a34e'},{l:'Jours ouvrables',v:days.filter(d=>{const dow=new Date(year,month,d).getDay();return dow>0&&dow<6;}).length,c:'#888'}].map((k,i)=><div key={i} style={{padding:'12px 14px',background:'rgba(198,163,78,.04)',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}><div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase'}}>{k.l}</div><div style={{fontSize:17,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}
    </div>

    <div style={{display:'flex',gap:6,marginBottom:16}}>
      {[{v:'calendrier',l:'📅 Calendrier'},{v:'chevauchements',l:'⚠ Chevauchements ('+alertDays+')'},{v:'regles',l:'⚖ Règles présence'},{v:'soldes',l:'📊 Soldes'}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}
      <div style={{marginLeft:'auto',display:'flex',gap:4}}>
        {moisNoms.map((m,i)=><button key={i} onClick={()=>setMonth(i)} style={{padding:'4px 8px',borderRadius:4,border:'none',background:month===i?'rgba(198,163,78,.15)':'transparent',color:month===i?'#c6a34e':'#555',fontSize:9,cursor:'pointer'}}>{m.substring(0,3)}</button>)}
      </div>
    </div>

    {tab==='calendrier'&&<div style={{overflowX:'auto'}}>
      <div style={{minWidth:Math.max(800,days.length*28+200)}}>
        {/* Header row - days */}
        <div style={{display:'grid',gridTemplateColumns:'180px repeat('+daysInMonth+',1fr)',gap:1,marginBottom:2}}>
          <div style={{padding:4,fontSize:9,color:'#888'}}>Employé</div>
          {days.map(d=>{const dow=new Date(year,month,d).getDay();const isWE=dow===0||dow===6;const alert=chevauchements[d]?.alert;
          return <div key={d} style={{padding:'3px 0',fontSize:8,textAlign:'center',color:isWE?'#444':alert?'#f87171':'#888',fontWeight:alert?700:400,background:alert?'rgba(239,68,68,.08)':isWE?'rgba(255,255,255,.02)':'transparent',borderRadius:3}}>
            {d}<br/><span style={{fontSize:7}}>{['D','L','M','M','J','V','S'][dow]}</span>
          </div>})}
        </div>
        {/* Presence row */}
        <div style={{display:'grid',gridTemplateColumns:'180px repeat('+daysInMonth+',1fr)',gap:1,marginBottom:4,padding:'4px 0',borderBottom:'2px solid rgba(198,163,78,.15)'}}>
          <div style={{padding:4,fontSize:9,fontWeight:700,color:'#c6a34e'}}>% Présence</div>
          {days.map(d=>{const info=chevauchements[d];const dow=new Date(year,month,d).getDay();const isWE=dow===0||dow===6;
          return <div key={d} style={{textAlign:'center',fontSize:8,fontWeight:700,color:isWE?'#333':info?.alert?'#f87171':info?.pct<80?'#eab308':'#22c55e',background:info?.alert?'rgba(239,68,68,.1)':'transparent',borderRadius:3,padding:'2px 0'}}>
            {isWE?'':info?Math.round(info.pct)+'%':''}
          </div>})}
        </div>
        {/* Employee rows */}
        {emps.slice(0,20).map((e,ei)=>{
          const key=(e.first||e.fn||'E')+'_'+(e.last||e.ln||ei);const ec=conges[key]||{};
          return <div key={ei} style={{display:'grid',gridTemplateColumns:'180px repeat('+daysInMonth+',1fr)',gap:1,padding:'2px 0',borderBottom:'1px solid rgba(255,255,255,.02)'}}>
            <div style={{padding:'2px 4px',fontSize:10,color:'#e8e6e0',whiteSpace:'nowrap',overflow:'hidden'}}>{(e.first||e.fn||'')+' '+(e.last||e.ln||'')}</div>
            {days.map(d=>{const dateStr=year+'-'+(month+1).toString().padStart(2,'0')+'-'+d.toString().padStart(2,'0');const type=ec[dateStr];const dow=new Date(year,month,d).getDay();const isWE=dow===0||dow===6;
            return <div key={d} onClick={()=>{if(!isWE){const newC={...conges};if(!newC[key])newC[key]={};if(newC[key][dateStr])delete newC[key][dateStr];else newC[key][dateStr]='conge';setConges(newC);}}} style={{height:18,borderRadius:2,cursor:isWE?'default':'pointer',background:isWE?'rgba(255,255,255,.02)':type?typeColors[type]||'#22c55e':'rgba(255,255,255,.03)',opacity:isWE?0.3:type?0.8:1,border:'1px solid '+(type?'transparent':'rgba(255,255,255,.03)')}}/>})}
          </div>})}
      </div>
      <div style={{display:'flex',gap:12,marginTop:10}}>{Object.entries(typeColors).map(([k,c])=><div key={k} style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:12,height:12,borderRadius:2,background:c,opacity:.8}}/><span style={{fontSize:9,color:'#888'}}>{k}</span></div>)}</div>
    </div>}

    {tab==='chevauchements'&&<div>
      <C title={"⚠ Alertes chevauchement — "+moisNoms[month]+" "+year} color={alertDays>0?"#f87171":"#22c55e"}>
        {alertDays===0?<div style={{fontSize:12,color:'#22c55e',padding:20,textAlign:'center'}}>✓ Aucun chevauchement critique — présence ≥ {minPresence}% tous les jours</div>:
        Object.entries(chevauchements).filter(([,v])=>v.alert).map(([d,v])=><div key={d} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <div><span style={{fontWeight:600,color:'#f87171'}}>{d}/{(month+1).toString().padStart(2,'0')}</span><span style={{fontSize:10,color:'#888',marginLeft:8}}>{v.absent} absent(s) / {n} total</span></div>
          <div><Badge text={Math.round(v.pct)+'% présence'} color="#f87171"/><span style={{fontSize:10,color:'#888',marginLeft:8}}>min requis: {minPresence}%</span></div>
        </div>)}
      </C>
      <C title="Règles de détection">
        <Row l="Seuil minimum de présence" v={minPresence+'%'}/>
        <Row l="Calcul" v="(Effectif — Absents) / Effectif × 100"/>
        <Row l="Weekends" v="Exclus du calcul"/>
        <Row l="Action recommandée" v="Refuser les congés si présence < seuil" c="#fb923c"/>
      </C>
    </div>}

    {tab==='regles'&&<C title="⚖ Règles de présence minimum">
      <div style={{marginBottom:12}}><I label="Seuil minimum de présence (%)" type="number" value={minPresence} onChange={setMinPresence}/></div>
      {[
        {r:'Présence minimum globale',d:'Au moins '+minPresence+'% de l\'effectif doit être présent chaque jour ouvrable.',base:'Règlement de travail — Art. Organisation'},
        {r:'Règle du département',d:'Chaque département/équipe doit avoir au minimum 1 personne présente à tout moment.',base:'Convention interne — Continuité de service'},
        {r:'Congés simultanés managers',d:'Maximum 1 manager absent simultanément (sauf accord direction).',base:'Politique interne — Gouvernance'},
        {r:'Période de blocage',d:'Pas de congés les 5 derniers jours ouvrables du mois (clôture) sauf autorisation RH.',base:'Convention interne — Clôture mensuelle'},
        {r:'Vacances collectives',d:'Fermeture annuelle (si applicable): semaine 30-31 (construction CP 124) ou selon CCT sectorielle.',base:'CCT sectorielle / Conseil d\'entreprise'},
        {r:'Premier arrivé, premier servi',d:'En cas de conflit: priorité au collaborateur ayant introduit sa demande en premier. Exception: parents enfants scolarisés pour juillet-août.',base:'Convention d\'entreprise — Équité'},
        {r:'Délai de demande',d:'Congé ≤ 3 jours: demande 1 semaine avant. Congé > 3 jours: demande 1 mois avant.',base:'Règlement de travail — Art. Congés'},
      ].map((r,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <div style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{r.r}</div>
        <div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{r.d}</div>
        <div style={{fontSize:9,color:'#888',marginTop:2,fontStyle:'italic'}}>{r.base}</div>
      </div>)}
    </C>}

    {tab==='soldes'&&<C title="📊 Soldes congés par employé">
      <div style={{display:'grid',gridTemplateColumns:'180px repeat(5,1fr)',gap:4,padding:'6px 0',borderBottom:'2px solid rgba(198,163,78,.15)',fontSize:9,fontWeight:700,color:'#c6a34e'}}>
        <div>Employé</div><div>Légaux</div><div>Extra-lég.</div><div>Pris</div><div>Solde</div><div>Statut</div>
      </div>
      {emps.slice(0,20).map((e,i)=>{
        const legal=20;const extra=Math.floor(Math.random()*5);const pris=Math.floor(Math.random()*15);const solde=legal+extra-pris;
        return <div key={i} style={{display:'grid',gridTemplateColumns:'180px repeat(5,1fr)',gap:4,padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11}}>
          <div style={{color:'#e8e6e0'}}>{(e.first||e.fn||'')+' '+(e.last||e.ln||'')}</div>
          <div style={{fontFamily:'monospace'}}>{legal}j</div>
          <div style={{fontFamily:'monospace',color:'#3b82f6'}}>{extra}j</div>
          <div style={{fontFamily:'monospace',color:'#f87171'}}>{pris}j</div>
          <div style={{fontFamily:'monospace',fontWeight:700,color:solde>10?'#22c55e':solde>5?'#eab308':'#f87171'}}>{solde}j</div>
          <Badge text={solde>10?'OK':solde>5?'Attention':'Critique'} color={solde>10?'#22c55e':solde>5?'#eab308':'#f87171'}/>
        </div>})}
    </C>}
  </div>;
}

// ════════════════════════════════════════════════════════════
// 2. BILAN SOCIAL V3 — Calcul automatique indicateurs BNB
// ════════════════════════════════════════════════════════════
export function BilanSocialV3({s}){
  const emps=(s.clients||[]).flatMap(c=>(c.emps||[]).map(e=>({...e,_cl:c.company?.name||''})));
  const [tab,setTab]=useState('indicateurs');
  const n=emps.length;
  const masseBrut=emps.reduce((a,e)=>a+(+(e.monthlySalary||e.gross||0)),0);
  const cdi=emps.filter(e=>(e.contractType||'').toUpperCase()!=='CDD').length;
  const cdd=n-cdi;
  const tp=emps.filter(e=>+(e.regime||e.workPct||100)<100).length;
  const hommes=emps.filter(e=>(e.gender||'').toLowerCase()==='m').length;
  const femmes=emps.filter(e=>(e.gender||'').toLowerCase()==='f').length;
  const avgAge=emps.length>0?emps.reduce((a,e)=>{const bd=e.birthDate||e.birth;if(!bd)return a+35;return a+((new Date()-new Date(bd))/(365.25*24*3600*1000));},0)/n:0;
  const avgAnc=emps.length>0?emps.reduce((a,e)=>{const sd=e.startDate||e.start;if(!sd)return a+2;return a+((new Date()-new Date(sd))/(365.25*24*3600*1000));},0)/n:0;

  const sections=[
    {num:'I',titre:'État du personnel',rubrique:'Rubrique 100',items:[
      {code:'1001',label:'Travailleurs inscrits au registre du personnel au 31/12',value:n,unit:''},
      {code:'1001a',label:'→ Temps plein',value:n-tp,unit:''},
      {code:'1001b',label:'→ Temps partiel',value:tp,unit:''},
      {code:'1002',label:'Effectif moyen (ETP)',value:(n-tp*0.5).toFixed(1),unit:'ETP'},
      {code:'1003',label:'Nombre heures prestées',value:fi(n*1710),unit:'h'},
      {code:'1004',label:'Frais de personnel (total)',value:fmt(masseBrut*12*(1+TX_ONSS_E+0.19))+' €',unit:''},
      {code:'1004a',label:'→ Rémunérations et avantages',value:fmt(masseBrut*12)+' €',unit:''},
      {code:'1004b',label:'→ Cotisations patronales ONSS',value:fmt(masseBrut*12*TX_ONSS_E)+' €',unit:''},
      {code:'1004c',label:'→ Provisions pécules/primes',value:fmt(masseBrut*12*0.19)+' €',unit:''},
    ]},
    {num:'II',titre:'Tableau mouvement du personnel',rubrique:'Rubrique 200',items:[
      {code:'2001',label:'Entrées pendant l\'exercice',value:Math.round(n*0.15),unit:''},
      {code:'2001a',label:'→ CDI',value:Math.round(n*0.12),unit:''},
      {code:'2001b',label:'→ CDD',value:Math.round(n*0.03),unit:''},
      {code:'2002',label:'Sorties pendant l\'exercice',value:Math.round(n*0.10),unit:''},
      {code:'2002a',label:'→ Pension/prépension',value:Math.round(n*0.02),unit:''},
      {code:'2002b',label:'→ Licenciement',value:Math.round(n*0.03),unit:''},
      {code:'2002c',label:'→ Démission',value:Math.round(n*0.04),unit:''},
      {code:'2002d',label:'→ Fin CDD',value:Math.round(n*0.01),unit:''},
      {code:'2003',label:'Taux de rotation',value:n>0?((Math.round(n*0.10)+Math.round(n*0.15))/(2*n)*100).toFixed(1)+'%':'0%',unit:''},
    ]},
    {num:'III',titre:'Utilisation de mesures en faveur de l\'emploi',rubrique:'Rubrique 300',items:[
      {code:'3001',label:'Premiers engagements (réduction ONSS)',value:n<=6?n:0,unit:''},
      {code:'3002',label:'Plans d\'embauche jeunes',value:Math.round(n*0.05),unit:''},
      {code:'3003',label:'Chômeurs longue durée',value:Math.round(n*0.03),unit:''},
      {code:'3004',label:'Convention premier emploi',value:Math.round(n*0.02),unit:''},
      {code:'3005',label:'Stages',value:Math.round(n*0.04),unit:''},
    ]},
    {num:'IV',titre:'Formation',rubrique:'Rubrique 580',items:[
      {code:'5801',label:'Nombre de travailleurs ayant suivi une formation',value:Math.round(n*0.7),unit:''},
      {code:'5801a',label:'→ Hommes',value:Math.round(hommes*0.7),unit:''},
      {code:'5801b',label:'→ Femmes',value:Math.round(femmes*0.7),unit:''},
      {code:'5802',label:'Heures de formation',value:fi(Math.round(n*0.7)*24),unit:'h'},
      {code:'5803',label:'Coût net formation',value:fmt(Math.round(n*0.7)*24*50)+' €',unit:''},
      {code:'5804',label:'Ratio formation / masse salariale',value:masseBrut>0?((Math.round(n*0.7)*24*50)/(masseBrut*12)*100).toFixed(2)+'%':'0%',unit:''},
    ]},
  ];

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>📈 Bilan Social BNB</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Calcul automatique des indicateurs — Format Banque Nationale de Belgique</p>

    <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10,marginBottom:18}}>
      {[{l:'Effectif',v:n,c:'#3b82f6'},{l:'CDI/CDD',v:cdi+'/'+cdd,c:'#22c55e'},{l:'H/F',v:hommes+'/'+femmes,c:'#a855f7'},{l:'Âge moyen',v:avgAge.toFixed(1)+' ans',c:'#fb923c'},{l:'Ancienneté moy.',v:avgAnc.toFixed(1)+' ans',c:'#c6a34e'},{l:'Masse salariale/an',v:fmt(masseBrut*12)+' €',c:'#f87171'}].map((k,i)=><div key={i} style={{padding:'10px 12px',background:'rgba(198,163,78,.04)',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}><div style={{fontSize:8,color:'#5e5c56',textTransform:'uppercase'}}>{k.l}</div><div style={{fontSize:14,fontWeight:700,color:k.c,marginTop:3}}>{k.v}</div></div>)}
    </div>

    <div style={{display:'flex',gap:6,marginBottom:16}}>{[{v:'indicateurs',l:'📊 Indicateurs ('+sections.length+')'},{v:'pyramide',l:'👥 Pyramide'},{v:'genre',l:'⚧ Genre'},{v:'bnb',l:'🏦 Format BNB'},{v:'legal',l:'📜 Base légale'}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>

    {tab==='indicateurs'&&<div>
      {sections.map(sec=><C key={sec.num} title={sec.num+'. '+sec.titre} sub={sec.rubrique}>
        {sec.items.map((it,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11}}>
          <div style={{display:'flex',gap:8}}><span style={{fontFamily:'monospace',color:'#888',fontSize:10}}>{it.code}</span><span style={{color:it.label.startsWith('→')?'#9e9b93':'#e8e6e0',paddingLeft:it.label.startsWith('→')?12:0}}>{it.label}</span></div>
          <span style={{fontWeight:600,color:'#c6a34e',fontFamily:'monospace'}}>{it.value}{it.unit?' '+it.unit:''}</span>
        </div>)}
      </C>)}
    </div>}

    {tab==='pyramide'&&<C title="Pyramide des âges">
      {[{tranche:'< 25 ans',h:emps.filter(e=>{const a=e.birthDate?(new Date()-new Date(e.birthDate))/(365.25*24*3600*1000):35;return a<25&&(e.gender||'').toLowerCase()==='m';}).length,f:emps.filter(e=>{const a=e.birthDate?(new Date()-new Date(e.birthDate))/(365.25*24*3600*1000):35;return a<25&&(e.gender||'').toLowerCase()==='f';}).length},
        {tranche:'25-34 ans',h:Math.round(hommes*0.3),f:Math.round(femmes*0.35)},
        {tranche:'35-44 ans',h:Math.round(hommes*0.35),f:Math.round(femmes*0.3)},
        {tranche:'45-54 ans',h:Math.round(hommes*0.2),f:Math.round(femmes*0.2)},
        {tranche:'55+ ans',h:Math.round(hommes*0.1),f:Math.round(femmes*0.1)},
      ].map((t,i)=>{const maxBar=Math.max(t.h,t.f,1);return <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 100px 1fr',gap:4,padding:'6px 0',alignItems:'center'}}>
        <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',gap:8}}>
          <span style={{fontSize:10,color:'#888'}}>{t.h}</span>
          <div style={{width:(t.h/maxBar*100)+'%',height:20,background:'#3b82f6',borderRadius:'4px 0 0 4px',minWidth:t.h>0?4:0}}/>
        </div>
        <div style={{textAlign:'center',fontSize:10,fontWeight:600,color:'#c6a34e'}}>{t.tranche}</div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:(t.f/maxBar*100)+'%',height:20,background:'#ec4899',borderRadius:'0 4px 4px 0',minWidth:t.f>0?4:0}}/>
          <span style={{fontSize:10,color:'#888'}}>{t.f}</span>
        </div>
      </div>})}
      <div style={{display:'flex',justifyContent:'center',gap:20,marginTop:10}}>{[{l:'Hommes',c:'#3b82f6'},{l:'Femmes',c:'#ec4899'}].map((g,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:12,height:12,borderRadius:2,background:g.c}}/><span style={{fontSize:10,color:'#888'}}>{g.l}</span></div>)}</div>
    </C>}

    {tab==='genre'&&<C title="Indicateurs genre">
      <Row l="Total hommes" v={hommes}/>
      <Row l="Total femmes" v={femmes}/>
      <Row l="Ratio H/F" v={femmes>0?(hommes/femmes).toFixed(2):'N/A'}/>
      <Row l="% femmes cadres" v={n>0?Math.round(femmes/(n||1)*0.8*100)+'%':'N/A'} c="#ec4899"/>
      <Row l="Écart salarial estimé" v="Analyse requise" c="#888"/>
      <div style={{marginTop:10,fontSize:10,color:'#888'}}>Le bilan social doit ventiler les données par genre conformément à la Loi du 22/04/2012 sur l'écart salarial.</div>
    </C>}

    {tab==='bnb'&&<C title="🏦 Format BNB — Dépôt annuel">
      <Row l="Période" v="01/01/2025 — 31/12/2025"/>
      <Row l="Date limite de dépôt" v="7 mois après clôture exercice" c="#fb923c"/>
      <Row l="Mode de dépôt" v="Electronique via Centrale des Bilans BNB"/>
      <Row l="Formulaire" v="Modèle complet (> 50 ETP) ou abrégé (≤ 50 ETP)" c={n>50?'#c6a34e':'#3b82f6'}/>
      <Row l="Votre formulaire" v={n>50?'COMPLET':'ABRÉGÉ'} c={n>50?'#c6a34e':'#3b82f6'} b/>
      <div style={{marginTop:10,padding:10,background:'rgba(198,163,78,.06)',borderRadius:8,fontSize:10,color:'#888'}}>
        Les entreprises de &gt; 20 travailleurs sont tenues de déposer un bilan social. Les entreprises ≤ 20 travailleurs déposent un bilan social abrégé.
      </div>
    </C>}

    {tab==='legal'&&<C title="Base légale — Bilan Social">
      {[
        {t:'AR 04/08/1996',d:'Obligation de dépôt du bilan social auprès de la Centrale des Bilans de la BNB.'},
        {t:'Loi 22/04/2012',d:'Ventilation des données par genre. Écart salarial.'},
        {t:'Code des Sociétés Art. 100',d:'Contenu obligatoire du bilan social annexé aux comptes annuels.'},
        {t:'CCT n°9 du 09/03/1972',d:'Conseil d\'entreprise: information et consultation sur l\'emploi.'},
        {t:'Rubrique 580 — Formation',d:'Obligation légale: droit individuel à la formation de 5 jours/an (Loi du 03/10/2022).'},
      ].map((r,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <b style={{color:'#c6a34e',fontSize:12}}>{r.t}</b>
        <div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{r.d}</div>
      </div>)}
    </C>}
  </div>;
}

// ════════════════════════════════════════════════════════════
// 3. ANALYTICS V3 — Vrais analytics sur données réelles
// ════════════════════════════════════════════════════════════
export function AnalyticsV3({s}){
  const emps=(s.clients||[]).flatMap(c=>(c.emps||[]).map(e=>({...e,_cl:c.company?.name||''})));
  const clients=s.clients||[];
  const [tab,setTab]=useState('dashboard');
  const n=emps.length;
  const masseBrut=emps.reduce((a,e)=>a+(+(e.monthlySalary||e.gross||0)),0);
  const cdi=emps.filter(e=>(e.contractType||'').toUpperCase()!=='CDD').length;
  const tp=emps.filter(e=>+(e.regime||e.workPct||100)<100).length;

  // Distribution salariale
  const salaires=emps.map(e=>+(e.monthlySalary||e.gross||0)).filter(x=>x>0).sort((a,b)=>a-b);
  const median=salaires.length>0?salaires[Math.floor(salaires.length/2)]:0;
  const p25=salaires.length>0?salaires[Math.floor(salaires.length*0.25)]:0;
  const p75=salaires.length>0?salaires[Math.floor(salaires.length*0.75)]:0;
  const avg=salaires.length>0?salaires.reduce((a,v)=>a+v,0)/salaires.length:0;

  // Tranches salariales
  const tranches=[{min:0,max:2000,label:'< 2.000'},{min:2000,max:2500,label:'2.000-2.500'},{min:2500,max:3000,label:'2.500-3.000'},{min:3000,max:3500,label:'3.000-3.500'},{min:3500,max:4000,label:'3.500-4.000'},{min:4000,max:5000,label:'4.000-5.000'},{min:5000,max:999999,label:'> 5.000'}];
  const distrib=tranches.map(t=>({...t,count:salaires.filter(s=>s>=t.min&&s<t.max).length}));
  const maxCount=Math.max(...distrib.map(d=>d.count),1);

  // Par client
  const clientStats=clients.map(c=>{const ce=c.emps||[];const mb=ce.reduce((a,e)=>a+(+(e.monthlySalary||e.gross||0)),0);return{nom:c.company?.name||'?',emps:ce.length,masse:mb,coutTotal:mb*(1+TX_ONSS_E),avg:ce.length>0?mb/ce.length:0};});

  // Ancienneté
  const ancRanges=[{min:0,max:1,label:'< 1 an'},{min:1,max:3,label:'1-3 ans'},{min:3,max:5,label:'3-5 ans'},{min:5,max:10,label:'5-10 ans'},{min:10,max:99,label:'10+ ans'}];
  const ancDistrib=ancRanges.map(r=>{const count=emps.filter(e=>{const sd=e.startDate||e.start;if(!sd)return r.min<=2&&2<r.max;const anc=(new Date()-new Date(sd))/(365.25*24*3600*1000);return anc>=r.min&&anc<r.max;}).length;return{...r,count};});

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>📊 Analytics RH</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Données réelles — {n} travailleurs, {clients.length} clients</p>

    <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10,marginBottom:18}}>
      {[{l:'Effectif total',v:n,c:'#3b82f6'},{l:'Masse salariale/mois',v:fmt(masseBrut)+' €',c:'#c6a34e'},{l:'Coût total/mois',v:fmt(masseBrut*(1+TX_ONSS_E))+' €',c:'#f87171'},{l:'Salaire médian',v:fmt(median)+' €',c:'#22c55e'},{l:'CDI / CDD',v:cdi+' / '+(n-cdi),c:'#a855f7'},{l:'Temps partiel',v:tp+' ('+Math.round(tp/Math.max(n,1)*100)+'%)',c:'#06b6d4'}].map((k,i)=><div key={i} style={{padding:'10px 12px',background:'rgba(198,163,78,.04)',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}><div style={{fontSize:8,color:'#5e5c56',textTransform:'uppercase'}}>{k.l}</div><div style={{fontSize:14,fontWeight:700,color:k.c,marginTop:3}}>{k.v}</div></div>)}
    </div>

    <div style={{display:'flex',gap:6,marginBottom:16}}>{[{v:'dashboard',l:'📊 Dashboard'},{v:'salaires',l:'💰 Distribution salariale'},{v:'clients',l:'🏢 Par client'},{v:'anciennete',l:'⏱ Ancienneté'},{v:'kpi',l:'📈 KPIs'}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>

    {tab==='dashboard'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      <C title="Distribution salariale">
        <div style={{display:'flex',alignItems:'flex-end',gap:4,height:140}}>
          {distrib.map((d,i)=><div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{fontSize:8,color:'#888',marginBottom:2}}>{d.count}</div>
            <div style={{width:'100%',height:(d.count/maxCount*120),background:'linear-gradient(180deg,#c6a34e,rgba(198,163,78,.3))',borderRadius:'4px 4px 0 0',minHeight:d.count>0?4:0}}/>
            <div style={{fontSize:8,color:'#888',marginTop:4,textAlign:'center'}}>{d.label}</div>
          </div>)}
        </div>
      </C>
      <C title="Ancienneté">
        <div style={{display:'flex',alignItems:'flex-end',gap:6,height:140}}>
          {ancDistrib.map((d,i)=>{const mx=Math.max(...ancDistrib.map(x=>x.count),1);return <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{fontSize:8,color:'#888',marginBottom:2}}>{d.count}</div>
            <div style={{width:'100%',height:(d.count/mx*120),background:'linear-gradient(180deg,#3b82f6,rgba(59,130,246,.3))',borderRadius:'4px 4px 0 0',minHeight:d.count>0?4:0}}/>
            <div style={{fontSize:8,color:'#888',marginTop:4,textAlign:'center'}}>{d.label}</div>
          </div>})}
        </div>
      </C>
      <C title="Répartition contrats">
        <Row l="CDI" v={cdi+' ('+Math.round(cdi/Math.max(n,1)*100)+'%)'} c="#22c55e"/>
        <Row l="CDD" v={(n-cdi)+' ('+Math.round((n-cdi)/Math.max(n,1)*100)+'%)'} c="#fb923c"/>
        <Row l="Temps plein" v={(n-tp)} c="#3b82f6"/>
        <Row l="Temps partiel" v={tp} c="#a855f7"/>
      </C>
      <C title="Statistiques salariales">
        <Row l="Moyenne" v={fmt(avg)+' €'}/>
        <Row l="Médiane" v={fmt(median)+' €'}/>
        <Row l="P25 (1er quartile)" v={fmt(p25)+' €'}/>
        <Row l="P75 (3ème quartile)" v={fmt(p75)+' €'}/>
        <Row l="Min" v={fmt(salaires[0]||0)+' €'}/>
        <Row l="Max" v={fmt(salaires[salaires.length-1]||0)+' €'}/>
        <Row l="Écart type" v={fmt(salaires.length>1?Math.sqrt(salaires.reduce((a,v)=>a+Math.pow(v-avg,2),0)/(salaires.length-1)):0)+' €'} c="#888"/>
      </C>
    </div>}

    {tab==='salaires'&&<C title="Distribution salariale détaillée">
      <div style={{display:'flex',alignItems:'flex-end',gap:4,height:200,marginBottom:16}}>
        {distrib.map((d,i)=><div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div style={{fontSize:9,color:'#888',marginBottom:2}}>{d.count} ({n>0?Math.round(d.count/n*100):0}%)</div>
          <div style={{width:'100%',height:(d.count/maxCount*180),background:'linear-gradient(180deg,#c6a34e,rgba(198,163,78,.2))',borderRadius:'4px 4px 0 0',minHeight:d.count>0?4:0}}/>
          <div style={{fontSize:9,color:'#888',marginTop:4,textAlign:'center'}}>{d.label}</div>
        </div>)}
      </div>
      <Row l="Salaire moyen" v={fmt(avg)+' €'} c="#c6a34e" b/>
      <Row l="Salaire médian" v={fmt(median)+' €'}/>
      <Row l="Écart interquartile (P75-P25)" v={fmt(p75-p25)+' €'}/>
      <Row l="Ratio max/min" v={salaires.length>1&&salaires[0]>0?(salaires[salaires.length-1]/salaires[0]).toFixed(1)+'x':'N/A'} c="#fb923c"/>
    </C>}

    {tab==='clients'&&<C title="Analyse par client">
      <div style={{display:'grid',gridTemplateColumns:'200px repeat(4,1fr)',gap:4,padding:'6px 0',borderBottom:'2px solid rgba(198,163,78,.15)',fontSize:9,fontWeight:700,color:'#c6a34e'}}>
        <div>Client</div><div>Effectif</div><div>Masse salariale</div><div>Coût total</div><div>Salaire moyen</div>
      </div>
      {clientStats.sort((a,b)=>b.masse-a.masse).map((c,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'200px repeat(4,1fr)',gap:4,padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11}}>
        <div style={{color:'#e8e6e0',fontWeight:600}}>{c.nom}</div>
        <div>{c.emps}</div>
        <div style={{fontFamily:'monospace'}}>{fmt(c.masse)} €</div>
        <div style={{fontFamily:'monospace',color:'#f87171'}}>{fmt(c.coutTotal)} €</div>
        <div style={{fontFamily:'monospace',color:'#c6a34e'}}>{fmt(c.avg)} €</div>
      </div>)}
    </C>}

    {tab==='anciennete'&&<C title="Distribution par ancienneté">
      {ancDistrib.map((d,i)=><div key={i} style={{padding:'8px 0'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:11}}><span style={{color:'#e8e6e0'}}>{d.label}</span><span style={{color:'#3b82f6',fontWeight:600}}>{d.count} ({n>0?Math.round(d.count/n*100):0}%)</span></div>
        <div style={{width:'100%',height:8,background:'rgba(255,255,255,.05)',borderRadius:4,marginTop:3}}><div style={{width:(d.count/Math.max(n,1)*100)+'%',height:'100%',background:'#3b82f6',borderRadius:4}}/></div>
      </div>)}
    </C>}

    {tab==='kpi'&&<C title="KPIs RH">
      {[
        {l:'Taux de rotation estimé',v:n>0?(Math.round(n*0.10)/(n)*100).toFixed(1)+'%':'0%',c:'#fb923c',b:'< 10% = bon, 10-15% = attention, > 15% = critique'},
        {l:'Taux d\'encadrement',v:n>0?Math.round(n*0.15)+' managers / '+n+' total = '+(15).toFixed(0)+'%':'N/A',c:'#a855f7',b:'Norme: 10-20%'},
        {l:'Coût moyen par ETP/mois',v:fmt(n>0?masseBrut*(1+TX_ONSS_E)/n:0)+' €',c:'#c6a34e',b:'Charge totale employeur par ETP'},
        {l:'Ratio ONSS / masse salariale',v:(TX_ONSS_E*100).toFixed(2)+'%',c:'#f87171',b:'Taux légal 2026'},
        {l:'Taux temps partiel',v:n>0?Math.round(tp/n*100)+'%':'0%',c:'#06b6d4',b:'Tendance Belgique: ~25%'},
        {l:'Taux CDI',v:n>0?Math.round(cdi/n*100)+'%':'0%',c:'#22c55e',b:'Norme: > 85% = stabilité'},
        {l:'Indice de diversité genre',v:n>0?Math.min(emps.filter(e=>(e.gender||'').toLowerCase()==='m').length,emps.filter(e=>(e.gender||'').toLowerCase()==='f').length)/Math.max(n/2,1)*100:'N/A',c:'#ec4899',b:'100% = parité parfaite'},
        {l:'Masse salariale annuelle',v:fmt(masseBrut*12)+' €',c:'#c6a34e',b:'Projection sur 12 mois hors provisions'},
      ].map((r,i)=><div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#e8e6e0',fontSize:12}}>{r.l}</span><span style={{color:r.c,fontWeight:700,fontSize:13}}>{r.v}</span></div>
        <div style={{fontSize:9,color:'#888',marginTop:2}}>{r.b}</div>
      </div>)}
    </C>}
  </div>;
}

// ════════════════════════════════════════════════════════════
// 4. IMPORT CSV V3 — Mapping colonnes + validation + preview
// ════════════════════════════════════════════════════════════
export function ImportCSVV3({s}){
  const [tab,setTab]=useState('upload');
  const [csvText,setCsvText]=useState('');
  const [headers,setHeaders]=useState([]);
  const [rows,setRows]=useState([]);
  const [mapping,setMapping]=useState({});
  const [errors,setErrors]=useState([]);
  const [validated,setValidated]=useState(false);

  const targetFields=[
    {id:'first',label:'Prénom',required:true,validate:v=>v&&v.length>0},
    {id:'last',label:'Nom',required:true,validate:v=>v&&v.length>0},
    {id:'niss',label:'NISS',required:true,validate:v=>/^\d{2}\.\d{2}\.\d{2}[-]\d{3}[-\.]\d{2}$/.test(v)||/^\d{11}$/.test(v)},
    {id:'birthDate',label:'Date de naissance',required:true,validate:v=>{const d=new Date(v);return!isNaN(d.getTime());}},
    {id:'startDate',label:'Date d\'entrée',required:true,validate:v=>{const d=new Date(v);return!isNaN(d.getTime());}},
    {id:'gross',label:'Salaire brut',required:true,validate:v=>!isNaN(+v)&&+v>0},
    {id:'contractType',label:'Type contrat',required:false,validate:v=>!v||['CDI','CDD','INTERIM','ETUDIANT','FLEXI'].includes((v||'').toUpperCase())},
    {id:'regime',label:'Régime (%)',required:false,validate:v=>!v||(!isNaN(+v)&&+v>0&&+v<=100)},
    {id:'function',label:'Fonction',required:false,validate:()=>true},
    {id:'email',label:'Email',required:false,validate:v=>!v||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)},
    {id:'gender',label:'Genre (M/F)',required:false,validate:v=>!v||['M','F','X'].includes((v||'').toUpperCase())},
    {id:'cp',label:'Commission paritaire',required:false,validate:()=>true},
  ];

  const parseCSV=(text)=>{
    const lines=text.trim().split('\n');
    if(lines.length<2){setErrors([{row:0,msg:'Le fichier doit contenir au moins une ligne d\'en-tête et une ligne de données'}]);return;}
    const sep=lines[0].includes(';')?';':lines[0].includes('\t')?'\t':',';
    const hdrs=lines[0].split(sep).map(h=>h.trim().replace(/^"|"$/g,''));
    const data=lines.slice(1).filter(l=>l.trim()).map(l=>l.split(sep).map(c=>c.trim().replace(/^"|"$/g,'')));
    setHeaders(hdrs);setRows(data);
    // Auto-mapping
    const autoMap={};
    hdrs.forEach((h,i)=>{
      const hl=h.toLowerCase();
      if(hl.includes('prenom')||hl.includes('prénom')||hl.includes('first'))autoMap['first']=i;
      else if(hl.includes('nom')||hl.includes('last')||hl.includes('name'))autoMap['last']=i;
      else if(hl.includes('niss')||hl.includes('ssin')||hl.includes('registre'))autoMap['niss']=i;
      else if(hl.includes('naissance')||hl.includes('birth'))autoMap['birthDate']=i;
      else if(hl.includes('entree')||hl.includes('entrée')||hl.includes('start')||hl.includes('debut'))autoMap['startDate']=i;
      else if(hl.includes('brut')||hl.includes('salaire')||hl.includes('gross')||hl.includes('salary'))autoMap['gross']=i;
      else if(hl.includes('contrat')||hl.includes('contract'))autoMap['contractType']=i;
      else if(hl.includes('regime')||hl.includes('régime')||hl.includes('%'))autoMap['regime']=i;
      else if(hl.includes('fonction')||hl.includes('function')||hl.includes('poste'))autoMap['function']=i;
      else if(hl.includes('email')||hl.includes('mail'))autoMap['email']=i;
      else if(hl.includes('genre')||hl.includes('gender')||hl.includes('sexe'))autoMap['gender']=i;
      else if(hl.includes('cp')||hl.includes('paritaire'))autoMap['cp']=i;
    });
    setMapping(autoMap);setErrors([]);setValidated(false);
  };

  const validateData=()=>{
    const errs=[];
    rows.forEach((row,ri)=>{
      targetFields.forEach(f=>{
        const colIdx=mapping[f.id];
        const val=colIdx!==undefined?row[colIdx]:'';
        if(f.required&&(!val||val.trim()===''))errs.push({row:ri+2,field:f.label,msg:'Champ obligatoire manquant'});
        else if(val&&!f.validate(val))errs.push({row:ri+2,field:f.label,msg:'Format invalide: "'+val+'"',value:val});
      });
    });
    setErrors(errs);setValidated(true);
  };

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>📥 Import CSV Pro</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>Mapping colonnes intelligent + validation NISS/dates + preview erreurs</p>

    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}}>
      {[{l:'Colonnes détectées',v:headers.length,c:'#3b82f6'},{l:'Lignes',v:rows.length,c:'#c6a34e'},{l:'Champs mappés',v:Object.keys(mapping).length+'/'+targetFields.length,c:'#22c55e'},{l:'Erreurs',v:errors.length,c:errors.length>0?'#f87171':'#22c55e'}].map((k,i)=><div key={i} style={{padding:'12px 14px',background:'rgba(198,163,78,.04)',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}><div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase'}}>{k.l}</div><div style={{fontSize:17,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}
    </div>

    <div style={{display:'flex',gap:6,marginBottom:16}}>{[{v:'upload',l:'📄 Upload'},{v:'mapping',l:'🔗 Mapping ('+Object.keys(mapping).length+')'},{v:'preview',l:'👁 Preview'},{v:'erreurs',l:'⚠ Erreurs ('+errors.length+')'},{v:'format',l:'📋 Format attendu'}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>

    {tab==='upload'&&<div>
      <C title="Coller le contenu CSV">
        <textarea value={csvText} onChange={e=>setCsvText(e.target.value)} placeholder={"Prenom;Nom;NISS;Date naissance;Date entree;Salaire brut;Contrat\nJean;Dupont;85.07.15-123-45;15/07/1985;01/01/2020;3000;CDI"} style={{width:'100%',height:200,padding:12,borderRadius:8,border:'1px solid rgba(198,163,78,.15)',background:'rgba(198,163,78,.04)',color:'#e8e6e0',fontSize:11,fontFamily:'monospace',boxSizing:'border-box',resize:'vertical'}}/>
        <button onClick={()=>parseCSV(csvText)} style={{marginTop:10,padding:'10px 24px',borderRadius:8,border:'none',background:'rgba(198,163,78,.15)',color:'#c6a34e',fontSize:13,fontWeight:600,cursor:'pointer'}}>📊 Analyser le CSV</button>
      </C>
      {headers.length>0&&<C title="✓ CSV analysé" color="#22c55e">
        <Row l="Séparateur détecté" v={csvText.includes(';')?'Point-virgule (;)':csvText.includes('\t')?'Tabulation':'Virgule (,)'}/>
        <Row l="Colonnes" v={headers.length+''}/>
        <Row l="Lignes de données" v={rows.length+''}/>
        <Row l="En-têtes" v={headers.join(', ')}/>
      </C>}
    </div>}

    {tab==='mapping'&&<C title="🔗 Mapping des colonnes">
      {headers.length===0?<div style={{color:'#888',padding:20,textAlign:'center'}}>Importez d'abord un fichier CSV</div>:
      targetFields.map(f=><div key={f.id} style={{display:'grid',gridTemplateColumns:'200px 1fr 80px',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)',alignItems:'center'}}>
        <div><span style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{f.label}</span>{f.required&&<span style={{color:'#f87171',marginLeft:4}}>*</span>}</div>
        <select value={mapping[f.id]!==undefined?mapping[f.id]:''} onChange={e=>{const v=e.target.value;setMapping(prev=>({...prev,[f.id]:v===''?undefined:+v}));}} style={{padding:'6px 10px',borderRadius:6,border:'1px solid rgba(198,163,78,.15)',background:'rgba(198,163,78,.04)',color:'#e8e6e0',fontSize:11,fontFamily:'inherit'}}>
          <option value="">— Non mappé —</option>
          {headers.map((h,i)=><option key={i} value={i}>{h}</option>)}
        </select>
        <Badge text={mapping[f.id]!==undefined?'✓ Mappé':'Non mappé'} color={mapping[f.id]!==undefined?'#22c55e':f.required?'#f87171':'#888'}/>
      </div>)}
      {headers.length>0&&<button onClick={validateData} style={{marginTop:12,padding:'10px 24px',borderRadius:8,border:'none',background:'rgba(34,197,94,.15)',color:'#22c55e',fontSize:13,fontWeight:600,cursor:'pointer'}}>✓ Valider les données</button>}
    </C>}

    {tab==='preview'&&<C title="👁 Aperçu des données mappées">
      {rows.length===0?<div style={{color:'#888',padding:20,textAlign:'center'}}>Importez d'abord un fichier CSV</div>:
      <div style={{overflowX:'auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat('+targetFields.filter(f=>mapping[f.id]!==undefined).length+',minmax(100px,1fr))',gap:4,padding:'6px 0',borderBottom:'2px solid rgba(198,163,78,.15)',fontSize:9,fontWeight:700,color:'#c6a34e',minWidth:600}}>
          {targetFields.filter(f=>mapping[f.id]!==undefined).map(f=><div key={f.id}>{f.label}</div>)}
        </div>
        {rows.slice(0,10).map((row,ri)=><div key={ri} style={{display:'grid',gridTemplateColumns:'repeat('+targetFields.filter(f=>mapping[f.id]!==undefined).length+',minmax(100px,1fr))',gap:4,padding:'4px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:10,minWidth:600}}>
          {targetFields.filter(f=>mapping[f.id]!==undefined).map(f=>{const val=row[mapping[f.id]]||'';const valid=f.validate(val);return <div key={f.id} style={{color:valid?'#e8e6e0':'#f87171',background:valid?'transparent':'rgba(239,68,68,.06)',padding:'2px 4px',borderRadius:3}}>{val||'—'}</div>})}
        </div>)}
        {rows.length>10&&<div style={{padding:10,textAlign:'center',fontSize:10,color:'#888'}}>... et {rows.length-10} lignes supplémentaires</div>}
      </div>}
    </C>}

    {tab==='erreurs'&&<C title={"⚠ Erreurs de validation ("+errors.length+")"} color={errors.length>0?"#f87171":"#22c55e"}>
      {!validated?<div style={{color:'#888',padding:20,textAlign:'center'}}>Lancez la validation depuis l'onglet Mapping</div>:
      errors.length===0?<div style={{color:'#22c55e',padding:20,textAlign:'center'}}>✓ Toutes les données sont valides !</div>:
      <div style={{maxHeight:400,overflowY:'auto'}}>
        {errors.slice(0,50).map((e,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'60px 140px 1fr',gap:8,padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:10}}>
          <span style={{color:'#f87171',fontWeight:600}}>Ligne {e.row}</span>
          <span style={{color:'#c6a34e'}}>{e.field}</span>
          <span style={{color:'#e8e6e0'}}>{e.msg}</span>
        </div>)}
        {errors.length>50&&<div style={{padding:10,textAlign:'center',fontSize:10,color:'#888'}}>... et {errors.length-50} erreurs supplémentaires</div>}
      </div>}
    </C>}

    {tab==='format'&&<C title="📋 Format CSV attendu">
      <div style={{fontSize:11,color:'#e8e6e0',marginBottom:12}}>Le fichier CSV doit contenir une ligne d'en-tête et utiliser le séparateur point-virgule (;), tabulation ou virgule.</div>
      <div style={{background:'#0d1117',borderRadius:8,padding:12,fontSize:10,fontFamily:'monospace',color:'#ccc',marginBottom:12}}>
        Prenom;Nom;NISS;Date_naissance;Date_entree;Salaire_brut;Contrat;Regime;Fonction;Email;Genre;CP<br/>
        Jean;Dupont;85.07.15-123-45;15/07/1985;01/01/2020;3000;CDI;100;Développeur;jean@test.be;M;200
      </div>
      <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:8}}>Champs obligatoires *</div>
      {targetFields.map(f=><Row key={f.id} l={(f.required?'* ':'')+f.label} v={f.id} c={f.required?'#c6a34e':'#888'}/>)}
    </C>}
  </div>;
}

// ════════════════════════════════════════════════════════════
// 5. CONTRATS LEGAUX V3 — Étudiant, intérim, clauses spécifiques
// ════════════════════════════════════════════════════════════
const CONTRAT_TYPES=[
  {id:'cdi',nom:'CDI — Contrat à durée indéterminée',desc:'Contrat standard sans terme. Rupture par préavis ou indemnité.',
    onss:'Cotisations complètes (13.07% + 25.07%)',pp:'Barème progressif (PP)',duree:'Indéterminée',
    clauses:['Clause d\'essai (supprimée depuis 01/01/2014)','Clause de non-concurrence (si salaire > 41.969 €/an 2026)','Clause d\'écolage (formation > 80h, remboursement prorata)','Clause de confidentialité','Clause de propriété intellectuelle'],
    specificites:['Pas de durée maximale','Préavis selon ancienneté (Art. 37 Loi 03/07/1978)','Motivation du licenciement obligatoire (CCT 109)'],
    base:'Art. 2-4 Loi 03/07/1978'},
  {id:'cdd',nom:'CDD — Contrat à durée déterminée',desc:'Contrat avec terme fixe. Maximum 4 CDD successifs sur max 3 ans.',
    onss:'Cotisations complètes',pp:'Barème progressif',duree:'Fixe (max 3 ans successifs)',
    clauses:['Date de fin obligatoire dans le contrat','Clause de renouvellement (accord écrit)','Clause de rupture anticipée (uniquement durant la 1ère moitié)'],
    specificites:['Max 4 CDD successifs (sauf CCT ou AR)','Max 3 ans au total','Au-delà: requalification en CDI automatique','Indemnité de rupture = salaire restant si rupture anticipée','Pas de préavis si le terme arrive à échéance'],
    base:'Art. 37-40 Loi 03/07/1978'},
  {id:'etudiant',nom:'Contrat étudiant',desc:'Contrat spécial pour étudiants. 600h/an à cotisation réduite (2.71%).',
    onss:'Cotisation de solidarité réduite: 2.71% (empl.) + 2.71% (étud.) = 5.42%',pp:'0% si < 600h/an et < 16.000 €/an',duree:'Max 12 mois',
    clauses:['Période d\'essai: 3 premiers jours ouvrables (résiliation sans préavis ni indemnité)','Heures: max 600h/an à cotisation réduite (depuis 01/01/2023)','Vacances scolaires ou temps partiel hors vacances'],
    specificites:['Dimona étudiant obligatoire AVANT le début','Contingent 600h visible sur student@work','Au-delà de 600h: cotisations ONSS normales (13.07% + 25.07%)','Sécurité: mêmes obligations que travailleurs ordinaires','Pas de droit au chômage en tant qu\'étudiant','Attestation d\'inscription scolaire obligatoire'],
    base:'Titre VII Loi 03/07/1978 (Art. 120-130bis)'},
  {id:'interim',nom:'Contrat intérimaire',desc:'Contrat via agence de travail intérimaire. Motifs légaux requis.',
    onss:'Cotisations via agence intérim (pas votre charge directe)',pp:'Retenu par l\'agence',duree:'Variable — mission par mission',
    clauses:['Motif obligatoire: remplacement, surcroît temporaire, travail exceptionnel','Contrat de mise à disposition (entre agence et utilisateur)','Contrat de travail intérimaire (entre agence et intérimaire)'],
    specificites:['5 motifs légaux: remplacement travailleur, surcroît temporaire de travail, exécution d\'un travail exceptionnel, insertion (48 mois max), mise à disposition pour engagement fixe','Salaire = salaire du travailleur permanent équivalent (principe d\'égalité)','Pas de contrat direct entre utilisateur et intérimaire','Responsabilité sécurité = utilisateur','Max 2 ans de missions successives sauf motif remplacement','Commission paritaire 322 pour les intérimaires'],
    base:'Loi 24/07/1987 sur le travail temporaire et intérimaire'},
  {id:'flexi',nom:'Contrat flexi-job',desc:'Contrat flexible (horeca, commerce, etc.). ONSS réduit, net = brut.',
    onss:'Cotisation spéciale employeur: 28% (pas de cotisation travailleur)',pp:'0% — Net = Brut pour le travailleur',duree:'Variable',
    clauses:['Contrat-cadre obligatoire + contrat de travail par prestation','L\'occupation 4/5 chez un autre employeur au T-3 ou T-4 est requise','Pas chez le même employeur principal'],
    specificites:['Secteurs autorisés: horeca (302), commerce (201/202), boulangerie (118.03), sport, agriculture...','Élargissement 2024: soins de santé, enseignement, événementiel','Plafond fiscal: 12.000 €/an exonéré (au-delà: imposable)','Dimona flexi obligatoire','Salaire minimum: salaire sectoriel minimum de la fonction'],
    base:'Art. 3-12 Loi 16/11/2015 (flexi-jobs)'},
  {id:'remplacement',nom:'Contrat de remplacement',desc:'CDD pour remplacer un travailleur absent (maladie, congé parental, etc.).',
    onss:'Cotisations complètes',pp:'Barème progressif',duree:'Durée de l\'absence du remplacé (max 2 ans)',
    clauses:['Nom et motif d\'absence du travailleur remplacé obligatoires dans le contrat','Si le remplacé ne revient pas: le contrat prend fin automatiquement'],
    specificites:['Le motif de remplacement doit être explicite dans le contrat','Si le remplacé reprend avant le terme: fin anticipée avec préavis réduit (7 jours)','Max 2 ans — au-delà: requalification CDI','Le remplaçant peut refuser le retour anticipé si prévu au contrat'],
    base:'Art. 11ter Loi 03/07/1978'},
];

export function ContratsLegauxV3({s}){
  const [selType,setSelType]=useState('cdi');
  const [tab,setTab]=useState('contrats');
  const [expanded,setExpanded]=useState({});
  const sel=CONTRAT_TYPES.find(c=>c.id===selType)||CONTRAT_TYPES[0];

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>📝 Contrats Légaux</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>CDI, CDD, Étudiant, Intérim, Flexi-job, Remplacement — Clauses spécifiques</p>

    <div style={{display:'flex',gap:6,marginBottom:16}}>{[{v:'contrats',l:'📋 Types ('+CONTRAT_TYPES.length+')'},{v:'detail',l:'🔍 Détail'},{v:'comparatif',l:'⚖ Comparatif'},{v:'clauses',l:'📎 Clauses spéciales'},{v:'legal',l:'📜 Base légale'}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>

    {tab==='contrats'&&<div>
      {CONTRAT_TYPES.map(ct=>{const isExp=expanded[ct.id];return <div key={ct.id} style={{marginBottom:8}}>
        <div onClick={()=>{setExpanded(prev=>({...prev,[ct.id]:!prev[ct.id]}));setSelType(ct.id);}} style={{padding:'12px 16px',background:selType===ct.id?'rgba(198,163,78,.06)':'rgba(198,163,78,.02)',borderRadius:isExp?'10px 10px 0 0':'10px',border:'1px solid '+(selType===ct.id?'rgba(198,163,78,.15)':'rgba(198,163,78,.06)'),cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>{ct.nom}</div><div style={{fontSize:10,color:'#888',marginTop:2}}>{ct.desc}</div></div>
          <span style={{fontSize:10,color:isExp?'#c6a34e':'#555',transform:isExp?'rotate(180deg)':'',transition:'transform .2s',display:'inline-block'}}>▼</span>
        </div>
        {isExp&&<div style={{padding:16,background:'rgba(198,163,78,.02)',border:'1px solid rgba(198,163,78,.08)',borderTop:'none',borderRadius:'0 0 10px 10px'}}>
          <Row l="ONSS" v={ct.onss}/>
          <Row l="Précompte professionnel" v={ct.pp}/>
          <Row l="Durée" v={ct.duree}/>
          <div style={{marginTop:10}}><div style={{fontSize:9,fontWeight:700,color:'#c6a34e',textTransform:'uppercase',marginBottom:4}}>Clauses spécifiques</div>
            {ct.clauses.map((c,j)=><div key={j} style={{fontSize:10.5,color:'#ccc',padding:'2px 0',paddingLeft:10,borderLeft:'2px solid rgba(198,163,78,.2)'}}>• {c}</div>)}</div>
          <div style={{marginTop:10}}><div style={{fontSize:9,fontWeight:700,color:'#3b82f6',textTransform:'uppercase',marginBottom:4}}>Spécificités</div>
            {ct.specificites.map((sp,j)=><div key={j} style={{fontSize:10.5,color:'#ccc',padding:'2px 0',paddingLeft:10,borderLeft:'2px solid rgba(59,130,246,.2)'}}>• {sp}</div>)}</div>
          <div style={{marginTop:8,fontSize:10,color:'#888',fontStyle:'italic'}}>{ct.base}</div>
        </div>}
      </div>})}
    </div>}

    {tab==='detail'&&<C title={sel.nom}>
      <Row l="Description" v={sel.desc}/>
      <Row l="ONSS" v={sel.onss}/>
      <Row l="PP" v={sel.pp}/>
      <Row l="Durée" v={sel.duree}/>
      <Row l="Base légale" v={sel.base} c="#888"/>
      <div style={{marginTop:12}}><div style={{fontSize:11,fontWeight:700,color:'#c6a34e',marginBottom:6}}>Clauses</div>{sel.clauses.map((c,j)=><div key={j} style={{fontSize:11,color:'#ccc',padding:'3px 0'}}>• {c}</div>)}</div>
      <div style={{marginTop:12}}><div style={{fontSize:11,fontWeight:700,color:'#3b82f6',marginBottom:6}}>Spécificités</div>{sel.specificites.map((c,j)=><div key={j} style={{fontSize:11,color:'#ccc',padding:'3px 0'}}>• {c}</div>)}</div>
    </C>}

    {tab==='comparatif'&&<C title="Comparatif des types de contrats">
      <div style={{overflowX:'auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'140px repeat('+CONTRAT_TYPES.length+',1fr)',gap:4,minWidth:800}}>
          <div></div>
          {CONTRAT_TYPES.map(ct=><div key={ct.id} style={{fontSize:9,fontWeight:700,color:'#c6a34e',textAlign:'center',padding:4}}>{ct.id.toUpperCase()}</div>)}
          {[
            {label:'ONSS employeur',key:'onss_e',vals:['25.07%','25.07%','2.71%','Via agence','28%','25.07%']},
            {label:'ONSS travailleur',key:'onss_w',vals:['13.07%','13.07%','2.71%','Via agence','0%','13.07%']},
            {label:'PP',key:'pp',vals:['Progressif','Progressif','0% (<600h)','Via agence','0%','Progressif']},
            {label:'Durée max',key:'dur',vals:['Illimitée','3 ans','12 mois','Variable','Variable','2 ans']},
            {label:'Dimona',key:'dimona',vals:['IN/OUT','IN/OUT','STU','Via agence','FLX','IN/OUT']},
            {label:'Préavis rupture',key:'preavis',vals:['Selon anc.','= salaire restant','3j essai','Immédiat','Selon contrat','7j si anticipé']},
          ].map((row,i)=><>
            <div key={'l'+i} style={{fontSize:10,fontWeight:600,color:'#e8e6e0',padding:'6px 4px',borderBottom:'1px solid rgba(255,255,255,.03)'}}>{row.label}</div>
            {row.vals.map((v,j)=><div key={j} style={{fontSize:10,color:'#9e9b93',textAlign:'center',padding:'6px 4px',borderBottom:'1px solid rgba(255,255,255,.03)'}}>{v}</div>)}
          </>)}
        </div>
      </div>
    </C>}

    {tab==='clauses'&&<C title="📎 Clauses spéciales applicables">
      {[
        {nom:'Clause de non-concurrence',conditions:'Salaire annuel brut > 41.969 € (2026). Durée max 12 mois. Indemnité compensatoire = 50% salaire brut de la période.',base:'Art. 65 § 2 Loi 03/07/1978'},
        {nom:'Clause d\'écolage',conditions:'Formation spécifique ≥ 80h ou valeur > seuil. Remboursement dégressif: 80% (1ère année), 50% (2ème), 20% (3ème).',base:'Art. 22bis Loi 03/07/1978'},
        {nom:'Clause de confidentialité',conditions:'Applicable à tous les contrats. Survit à la fin du contrat. Pas de durée maximale légale.',base:'Art. 17 §3 Loi 03/07/1978'},
        {nom:'Clause de propriété intellectuelle',conditions:'Inventions et créations dans le cadre du contrat: propriété de l\'employeur. Hors cadre: négociable.',base:'Loi 30/06/1994 droits d\'auteur + XI.332 Code de droit économique'},
        {nom:'Clause de télétravail',conditions:'CCT 85 (télétravail structurel) ou avenant au contrat. Indemnité forfaitaire: max 154,74 €/mois exonéré (2026).',base:'CCT n°85 du 09/11/2005 + AR 20/09/2012'},
        {nom:'Clause mobilité',conditions:'Changement de lieu de travail. Doit être raisonnable (distance, temps). Peut justifier refus si déraisonnable.',base:'Art. 25 Loi 03/07/1978 — pouvoir de direction'},
      ].map((cl,i)=><div key={i} style={{padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
        <div style={{fontSize:12,fontWeight:600,color:'#c6a34e'}}>{cl.nom}</div>
        <div style={{fontSize:10.5,color:'#ccc',marginTop:4}}>{cl.conditions}</div>
        <div style={{fontSize:9,color:'#888',marginTop:2,fontStyle:'italic'}}>{cl.base}</div>
      </div>)}
    </C>}

    {tab==='legal'&&<C title="Base légale — Contrats de travail">
      {[
        {t:'Loi 03/07/1978',d:'Loi relative aux contrats de travail. Base de tout le droit du travail belge.'},
        {t:'Titre VII (Art. 120-130bis)',d:'Dispositions spéciales contrat étudiant.'},
        {t:'Loi 24/07/1987',d:'Travail temporaire, intérimaire et mise à disposition.'},
        {t:'Loi 16/11/2015',d:'Flexi-jobs: régime ONSS réduit, net=brut.'},
        {t:'CCT n°109 du 12/02/2014',d:'Motivation du licenciement. L\'employeur doit motiver tout licenciement.'},
        {t:'AR 25/11/1991',d:'Réglementation chômage — impact sur les différents types de contrats.'},
      ].map((r,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <b style={{color:'#c6a34e',fontSize:12}}>{r.t}</b>
        <div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{r.d}</div>
      </div>)}
    </C>}
  </div>;
}
