'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { B, C, DPER, I, LB, LEGAL, LOIS_BELGES, NET_FACTOR, PH, PP_EST, PV_DOUBLE, PV_SIMPLE, RMMMG, ST, TX_ONSS_E, TX_ONSS_W, Tbl, calc, f0, f2, fmt, generatePayslipPDF, getAlertes, quickNet, quickPP, generateSEPAXML, generateDmfAXML } from '@/app/lib/helpers';
const AUREUS_INFO = { name: 'Aureus IA SPRL', vat: 'BE 1028.230.781', version: 'v38', sprint: 'Sprint 38' };
const MN_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

const fmtP = n => `${((n||0)*100).toFixed(2)}%`;
const uid = () => `${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
const MN = MN_FR;





function escapeHtml(str) { return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function Dashboard({s,d}) {
  s=s||{emps:[],clients:[],co:{name:"",vat:""},payrollHistory:[],dimonaHistory:[]};
  const ae=(s?.emps||[]).filter(e=>e.status==='active'||!e.status||e.status===undefined);
  const sortie=(s?.emps||[]).filter(e=>e.status==='sorti');
  const etudiants=(s?.emps||[]).filter(e=>e.contract==='student');
  const tm=ae.reduce((a,e)=>a+(e.monthlySalary||0),0);
  const calcs=ae.map(e=>({e,c:calc(e,DPER,s.co)}));
  const tc=calcs.reduce((a,x)=>a+x.c.costTotal,0);
  const tn=calcs.reduce((a,x)=>a+x.c.net,0);
  const avgGross=ae.length?tm/ae.length:0;
  const now=new Date();
  const curMonth=now.getMonth();
  const curYear=now.getFullYear();
  // 12-month salary mass simulation
  const months12=Array.from({length:12},(_,i)=>{
    const mi=(curMonth-11+i+12)%12;
    const yi=curYear-(curMonth-11+i<0?1:0);
    const found=( s.pays||[]).filter(p=>p.month===mi+1&&p.year===yi);
    const mass=found.length>0?found.reduce((a,p)=>a+(p.gross||0),0):tm;
    const cost=found.length>0?found.reduce((a,p)=>a+(p.costTotal||0),0):tc;
    return {m:MN[mi]?.substring(0,3)||'',mass,cost,net:found.length>0?found.reduce((a,p)=>a+(p.net||0),0):tn};
  });
  const maxChart=Math.max(...months12.map(m=>m.cost),1);

  // Deadlines calculation
  const getDeadlines=()=>{
    const dl=[];
    const q=Math.floor(curMonth/3)+1;
    const qEnd=new Date(curYear,q*3,0);
    const nextMonth5=new Date(curYear,curMonth+1,5);
    const daysToPP=Math.ceil((nextMonth5-now)/(1000*60*60*24));
    dl.push({l:"Précompte professionnel 274",d:`5/${String(curMonth+2).padStart(2,"0")}/${curYear}`,days:daysToPP,t:'mensuel',urgent:daysToPP<=5,icon:'◇'});
    const daysToDmfa=Math.ceil((qEnd-now)/(1000*60*60*24));
    dl.push({l:`DmfA T${q}/${curYear}`,d:`${qEnd.getDate()}/${String(q*3).padStart(2,"0")}/${curYear}`,days:daysToDmfa,t:'trimestriel',urgent:daysToDmfa<=14,icon:'◆'});
    if(curMonth<=1){const belco=new Date(curYear,2,1);const dB=Math.ceil((belco-now)/(1000*60*60*24));dl.push({l:"Belcotax 281.xx",d:`01/03/${curYear}`,days:dB,t:'annuel',urgent:dB<=30,icon:'▣'});}
    if(curMonth<=1){const bilan=new Date(curYear,1,28);const dBi=Math.ceil((bilan-now)/(1000*60*60*24));dl.push({l:"Bilan Social BNB",d:`28/02/${curYear}`,days:dBi,t:'annuel',urgent:dBi<=30,icon:'◈'});}
    dl.push({l:"Dimona IN — Avant embauche",d:"Permanent",days:null,t:'event',urgent:false,icon:'⬆'});
    dl.push({l:"Provisions ONSS mensuelles",d:`5 du mois`,days:daysToPP,t:'mensuel',urgent:daysToPP<=5,icon:'◆'});
    return dl.sort((a,b)=>(a.days??999)-(b.days??999));
  };
  const deadlines=getDeadlines();
  const urgentCount=deadlines.filter(d=>d.urgent).length;

  // ── ALERTES INTELLIGENTES ──
  const getAlerts=()=>{
    const alerts=[];
    const today=new Date();
    const eName=(e)=>(e.first||e.last)?`${e.first||''} ${e.last||''}`.trim():(e.fn||`Employé ${(e.id||'').slice(-3)}`);
    // CDD fin proche (30 jours)
    ae.forEach(e=>{
      if(e.endD){
        const end=new Date(e.endD);
        const days=Math.ceil((end-today)/(1000*60*60*24));
        if(days>0&&days<=30)alerts.push({type:'warning',icon:'⏰',msg:`CDD de ${eName(e)} expire dans ${days} jours (${e.endD})`,cat:'Contrat'});
        if(days<=0)alerts.push({type:'error',icon:'🔴',msg:`CDD de ${eName(e)} expiré depuis ${Math.abs(days)} jours !`,cat:'Contrat'});
      }
      // Période d'essai (si entrée < 14 jours pour étudiant)
      if(e.contract==='student'&&e.startD){
        const start=new Date(e.startD);
        const days=Math.ceil((today-start)/(1000*60*60*24));
        if(days<=3)alerts.push({type:'info',icon:'📋',msg:`${eName(e)}: période d'essai étudiant (3 premiers jours)`,cat:'Contrat'});
      }
      // NISS manquant
      if(!e.niss)alerts.push({type:'warning',icon:'🆔',msg:`NISS manquant pour ${eName(e)}`,cat:'Identité'});
      // IBAN manquant
      if(!e.iban)alerts.push({type:'info',icon:'🏦',msg:`IBAN manquant pour ${eName(e)}`,cat:'Financier'});
      // Salaire à 0
      if(!e.monthlySalary||e.monthlySalary<=0)alerts.push({type:'error',icon:'💰',msg:`Salaire non configuré pour ${eName(e)}`,cat:'Rémunération'});
    });
    // Indexation prévue
    const nextIndex=new Date(today.getFullYear(),0,1);
    if(today.getMonth()>=10)nextIndex.setFullYear(today.getFullYear()+1);
    const daysToIndex=Math.ceil((nextIndex-today)/(1000*60*60*24));
    if(daysToIndex<=60&&daysToIndex>0)alerts.push({type:'info',icon:'📈',msg:`Indexation salariale prévue dans ~${daysToIndex} jours (janvier ${nextIndex.getFullYear()})`,cat:'Légal'});
    // DmfA trimestrielle
    const q=Math.floor(today.getMonth()/3)+1;
    const qEnd=new Date(today.getFullYear(),q*3,0);
    const daysToDmfa=Math.ceil((qEnd-today)/(1000*60*60*24));
    if(daysToDmfa<=14)alerts.push({type:'warning',icon:'📡',msg:`DmfA T${q}/${today.getFullYear()} à déposer dans ${daysToDmfa} jours`,cat:'ONSS'});
    return alerts.sort((a,b)=>a.type==='error'?-1:b.type==='error'?1:a.type==='warning'?-1:1);
  };
  const alerts=getAlerts();

  // Dept breakdown
  const depts={};
  ae.forEach(e=>{const dp=e.dept||'Non défini';if(!depts[dp])depts[dp]={count:0,mass:0};depts[dp].count++;depts[dp].mass+=(e.monthlySalary||0);});

  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
      <div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:'#e8e6e0',margin:0}}>Tableau de bord</h1>
        <div style={{fontSize:12.5,color:'#8b7340',marginTop:4}}>{MN[curMonth]} {curYear} — {s.co.name||'—'} {s.co.vat?`· ${s.co.vat}`:''}</div>
      </div>
      {urgentCount>0&&<div style={{padding:'8px 16px',background:"rgba(248,113,113,.08)",border:'1px solid rgba(248,113,113,.2)',borderRadius:10,display:'flex',alignItems:'center',gap:8,animation:'pulse 2s infinite'}}>
        <span style={{width:8,height:8,borderRadius:'50%',background:"#ef4444",display:'inline-block',animation:'blink 1.5s infinite'}}/>
        <span style={{fontSize:12,fontWeight:600,color:'#f87171'}}>{urgentCount} échéance{urgentCount>1?'s':''} urgente{urgentCount>1?'s':''}</span>
      </div>}
    </div>
    

    
    {/* ⚡ Automation Shortcuts */}
    <div style={{marginBottom:20,padding:16,background:'linear-gradient(135deg,rgba(198,163,78,.06),rgba(198,163,78,.02))',border:'1px solid rgba(198,163,78,.15)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:18}}>⚡</span>
        <div><div style={{fontSize:13,fontWeight:600,color:'#c6a34e'}}>Automatisation</div><div style={{fontSize:10,color:'#888'}}>Actions rapides</div></div>
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        <button onClick={()=>{if(confirm('Générer toutes les fiches de paie ?')){(s?.emps||[]).forEach(e=>generatePayslipPDF(e,s.co));alert(s.emps.length+' fiches de paie générées')}}} style={{padding:'7px 14px',borderRadius:8,border:'none',background:'rgba(198,163,78,.15)',color:'#c6a34e',fontSize:11,cursor:'pointer',fontWeight:600}}>📄 Fiches</button>
        <button onClick={()=>{if(confirm('Générer SEPA ?')){generateSEPAXML(s.emps||[],s.co);alert('Fichier SEPA pain.001 généré')}}} style={{padding:'7px 14px',borderRadius:8,border:'none',background:'rgba(34,197,94,.12)',color:'#22c55e',fontSize:11,cursor:'pointer',fontWeight:600}}>💸 SEPA</button>
        <button onClick={()=>{if(confirm('Générer DmfA ?')){generateDmfAXML(s.emps||[],Math.ceil((new Date().getMonth()+1)/3),new Date().getFullYear(),s.co);alert('DmfA trimestrielle générée')}}} style={{padding:'7px 14px',borderRadius:8,border:'none',background:'rgba(168,85,247,.12)',color:'#a855f7',fontSize:11,cursor:'pointer',fontWeight:600}}>📊 DmfA</button>
        <button onClick={async()=>{
          const email = prompt('Email de réception du backup ?','info@aureus-ia.com');
          if(!email) return;
          const btn = document.getElementById('backup-btn');
          if(btn){btn.textContent='⏳ En cours...';btn.disabled=true;}
          try {
            const res = await fetch('/api/backup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'both',email,userEmail:s?.user?.email||'',userRole:s?.user?.user_metadata?.role||''})});
            if(!res.ok) throw new Error('Erreur serveur');
            const blob = await res.blob();
            const emailSent = res.headers.get('X-Backup-Email-Sent');
            const records = res.headers.get('X-Backup-Records');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            a.href = url; a.download = `aureus-backup-${dateStr}.json`; a.click();
            URL.revokeObjectURL(url);
            const role = res.headers.get('X-Backup-Role')||'admin'; const tables = res.headers.get('X-Backup-Tables')||'?'; alert(`✅ Backup OK !\n👤 Rôle: ${role}\n📊 ${records} enregistrements (${tables} tables)\n📥 Fichier téléchargé\n📧 Email envoyé à ${email}`);
          } catch(e) {
            alert('❌ Erreur backup : '+e.message);
          } finally {
            if(btn){btn.textContent='💾 Backup';btn.disabled=false;}
          }
        }} id="backup-btn" style={{padding:'7px 14px',borderRadius:8,border:'none',background:'rgba(34,197,94,.12)',color:'#22c55e',fontSize:11,cursor:'pointer',fontWeight:600}}>💾 Backup</button>
        <button onClick={async()=>{
          const btn = document.getElementById('monitor-btn');
          if(btn){btn.textContent='⏳...';btn.disabled=true;}
          try {
            const res = await fetch('/api/monitoring');
            const data = await res.json();
            if(!data.ok) throw new Error(data.error);
            const {summary, alerts, checks} = data;
            const dbOk = checks.every(c=>c.ok);
            const msg = `📊 Monitoring Aureus Social Pro\n` +
              `═══════════════════════════\n` +
              `🔴 Critiques: ${summary.criticals}\n` +
              `🟡 Warnings: ${summary.warnings}\n` +
              `✅ DB: ${dbOk?'OK':'ERREUR'}\n` +
              (alerts.length>0 ? `\n⚠️ Alertes:\n${alerts.slice(0,5).map(a=>'• '+a.msg).join('\n')}` : '\n✅ Aucune anomalie détectée');
            alert(msg);
          } catch(e){alert('❌ Erreur monitoring: '+e.message);}
          finally{if(btn){btn.textContent='📡 Monitor';btn.disabled=false;}}
        }} id="monitor-btn" style={{padding:'7px 14px',borderRadius:8,border:'none',background:'rgba(96,165,250,.12)',color:'#60a5fa',fontSize:11,cursor:'pointer',fontWeight:600}}>📡 Monitor</button>
        <button onClick={()=>d({type:'NAV',page:'automatisation'})} style={{padding:'7px 14px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',background:'transparent',color:'#c6a34e',fontSize:11,cursor:'pointer',fontWeight:500}}>Voir tout →</button>
      </div>
    </div>
{(()=>{const al=getAlertes(s.emps||[],s.co);return al.length>0?<div style={{marginBottom:16,borderRadius:10,border:"1px solid rgba(198,163,78,.15)",padding:12,background:"rgba(198,163,78,.03)"}}><div style={{fontSize:12,fontWeight:700,color:"#c6a34e",marginBottom:8}}>Alertes ({al.length})</div>{al.slice(0,8).map((a,i)=><div key={i} style={{padding:"6px 8px",marginBottom:4,borderRadius:6,fontSize:11,background:a.level==="danger"?"rgba(248,113,113,.08)":a.level==="warning"?"rgba(251,146,60,.08)":"rgba(96,165,250,.08)",color:a.level==="danger"?"#f87171":a.level==="warning"?"#fb923c":"#60a5fa"}}>{a.icon} {a.msg}</div>)}{al.length>8?<div style={{fontSize:10,color:"#9e9b93",marginTop:4}}>+{al.length-8} autres alertes</div>:null}</div>:null})()}
    
    {/* KPI ROW */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginBottom:22}}>
      {[
        {label:"Employés actifs",value:ae.length,sub:`${sortie.length} sorti${sortie.length>1?'s':''} · ${etudiants.length} étudiant${etudiants.length>1?'s':''}`,color:'#c6a34e',icon:'◉'},
        {label:"Masse salariale brute",value:fmt(tm),sub:`Moy: ${fmt(avgGross)}/emp`,color:'#4ade80',icon:'◈'},
        {label:"Net total",value:fmt(tn),sub:`${ae.length?Math.round(tn/tm*100):0}% du brut`,color:'#60a5fa',icon:'▤'},
        {label:"Coût employeur total",value:fmt(tc),sub:`Ratio: ${ae.length?((tc/tm)*100).toFixed(0):0}% du brut`,color:'#a78bfa',icon:'◆'},
        {label:"Déclarations",value:`${(s.pays||[]).length}`,sub:`${(s.dims||[]).length} Dimona · ${(s.dmfas||[]).length} DmfA`,color:'#fb923c',icon:'◇'},
      ].map((kpi,i)=>
        <div key={i} style={{background:"linear-gradient(145deg,#0e1220,#131829)",border:'1px solid rgba(139,115,60,.12)',borderRadius:14,padding:'20px 18px',position:'relative',overflow:'hidden',animation:`fadeIn .4s ease ${i*0.08}s both`}}>
          <div style={{position:'absolute',top:12,right:14,fontSize:22,opacity:.08,color:kpi.color}}>{kpi.icon}</div>
          <div style={{fontSize:10,color:'#5e5c56',marginBottom:8,textTransform:'uppercase',letterSpacing:'1.2px',fontWeight:600}}>{kpi.label}</div>
          <div style={{fontSize:24,fontWeight:700,color:kpi.color,animation:'countUp .5s ease'}}>{kpi.value}</div>
          {kpi.sub&&<div style={{fontSize:10,color:'#5e5c56',marginTop:5}}>{kpi.sub}</div>}
        </div>
      )}
    </div>

    {/* MAIN GRID: Chart + Deadlines */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:14,marginBottom:16}}>
      {/* 12-MONTH CHART */}
      <C style={{padding:'22px 24px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Évolution coût salarial — 12 mois</div>
          <div style={{display:'flex',gap:14}}>
            {[{l:"Coût total",c:'#a78bfa'},{l:"Masse brute",c:'#c6a34e'},{l:"Net",c:'#4ade80'}].map(x=>
              <div key={x.l} style={{display:'flex',alignItems:'center',gap:5,fontSize:10,color:'#5e5c56'}}>
                <span style={{width:8,height:3,borderRadius:2,background:x.c,display:'inline-block'}}/>{x.l}
              </div>
            )}
          </div>
        </div>
        <div style={{display:'flex',alignItems:'flex-end',gap:6,height:180}}>
          {months12.map((m,i)=>{
            const hCost=Math.round((m.cost/maxChart)*150);
            const hMass=Math.round((m.mass/maxChart)*150);
            const hNet=Math.round((m.net/maxChart)*150);
            return <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <div style={{fontSize:9,color:'#5e5c56',fontWeight:500}}>{fmt(m.cost).replace(/\s€/,"")}</div>
              <div style={{width:'100%',position:'relative',height:155,display:'flex',alignItems:'flex-end',justifyContent:'center',gap:2}}>
                <div style={{width:'30%',height:Math.max(hCost,2),background:"linear-gradient(180deg,#a78bfa,#7c3aed)",borderRadius:'3px 3px 0 0',transition:'height .5s ease',animation:`fadeIn .3s ease ${i*0.05}s both`}}/>
                <div style={{width:'30%',height:Math.max(hMass,2),background:"linear-gradient(180deg,#c6a34e,#a68a3c)",borderRadius:'3px 3px 0 0',transition:'height .5s ease',animation:`fadeIn .3s ease ${i*0.05+0.1}s both`}}/>
                <div style={{width:'30%',height:Math.max(hNet,2),background:"linear-gradient(180deg,#4ade80,#16a34a)",borderRadius:'3px 3px 0 0',transition:'height .5s ease',animation:`fadeIn .3s ease ${i*0.05+0.2}s both`}}/>
              </div>
              <div style={{fontSize:9,color:i===11?'#c6a34e':'#5e5c56',fontWeight:i===11?700:400}}>{m.m}</div>
            </div>;
          })}
        </div>
      </C>

      {/* DEADLINES */}
      <C style={{padding:'22px 20px'}}>
        <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
          Échéances & Obligations
          {urgentCount>0&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:10,background:"rgba(248,113,113,.12)",color:'#f87171',fontWeight:700}}>{urgentCount}</span>}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {deadlines.map((dl,i)=>
            <div key={i} style={{display:'flex',gap:10,padding:'10px 12px',borderRadius:8,background:dl.urgent?'rgba(248,113,113,.04)':'rgba(198,163,78,.02)',border:`1px solid ${dl.urgent?'rgba(248,113,113,.15)':'rgba(139,115,60,.08)'}`,alignItems:'center',animation:`fadeIn .3s ease ${i*0.06}s both`}}>
              <span style={{fontSize:16,opacity:.4}}>{dl.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:dl.urgent?'#f87171':'#d4d0c8',fontWeight:dl.urgent?600:400}}>{dl.l}</div>
                <div style={{fontSize:10,color:'#5e5c56',marginTop:2}}>{dl.d}</div>
              </div>
              {dl.days!==null&&<div style={{textAlign:'right'}}>
                <div style={{fontSize:14,fontWeight:700,color:dl.urgent?'#ef4444':dl.days<=30?'#fb923c':'#4ade80'}}>{dl.days}j</div>
                <span style={{fontSize:8.5,padding:'1px 6px',borderRadius:4,fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',
                  background:dl.t==='mensuel'?'rgba(96,165,250,.1)':dl.t==='trimestriel'?'rgba(167,139,250,.1)':dl.t==='annuel'?'rgba(198,163,78,.1)':'rgba(74,222,128,.1)',
                  color:dl.t==='mensuel'?'#60a5fa':dl.t==='trimestriel'?'#a78bfa':dl.t==='annuel'?'#c6a34e':'#4ade80'}}>{dl.t}</span>
              </div>}
            </div>
          )}
        </div>
      </C>
    </div>

    {/* VERSION & CHANGELOG */}
    <C style={{marginBottom:16,border:'1px solid rgba(198,163,78,.15)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:11,padding:'3px 10px',borderRadius:6,background:'linear-gradient(135deg,#c6a34e,#a68a3c)',color:'#060810',fontWeight:700}}>{AUREUS_INFO.version}</span>
          <span style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>Aureus Social Pro — {AUREUS_INFO.sprint}</span>
        </div>
        <span style={{fontSize:10,color:'#5e5c56'}}>Dernière mise à jour: {new Date().toLocaleDateString('fr-BE')}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {[
          {v:'v37',title:'Sprint 9',items:['⚙️ 13 automatisations (validation obligatoire)','📅 Gestion absences pré-paie','⚡ 8 actions en masse multi-clients','🏥 Audit santé global','📋 Planificateur 14 tâches','📑 15 Modèles documents','🔍 Filtres score santé'],color:'#06b6d4'},
          {v:'v36',title:'Sprint 8',items:['📊 Budget Auto','🔮 Simulateur What-If','📈 KPI + Equal Pay'],color:'#f472b6'},
          {v:'v35',title:'Sprint 7',items:['🏪 Marketplace 12 modules','🔗 Intégrations 25+ connecteurs','🔔 Webhook Manager'],color:'#a78bfa'},
          {v:'v34',title:'Sprint 6',items:['🌐 4 langues (FR/NL/EN/DE)','🔌 API Documentation','💱 Multi-Devises'],color:'#fb923c'},
          {v:'v33',title:'Sprint 5',items:['🧠 Prédiction Turnover','💡 Reco Salariales IA','📈 Prévision Masse','🔍 Détection Anomalies','🏥 Score Santé Dossier'],color:'#f87171'},
          {v:'v32',title:'Sprint 4',items:['⚡ Batch Processing','🔔 Alertes intelligentes','🔐 2FA (TOTP)','📡 DmfA améliorée'],color:'#a78bfa'},
          {v:'v31',title:'Sprint 3',items:['⚡ Workflow Embauche','⚡ Workflow Licenciement','⚡ Workflow Maladie','📂 Export 11 formats + ClearFact'],color:'#60a5fa'},
          {v:'v30',title:'Sprint 2',items:['📥 Import Excel','💰 ROI Calculator','🔒 Validation NISS/IBAN','🧠 153 CP pré-remplissage'],color:'#4ade80'},
        ].map((sp,i)=><div key={i} style={{padding:12,borderRadius:10,background:'rgba(198,163,78,.02)',border:'1px solid rgba(198,163,78,.08)'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
            <span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:`${sp.color}22`,color:sp.color,fontWeight:700}}>{sp.v}</span>
            <span style={{fontSize:11,fontWeight:600,color:'#e8e6e0'}}>{sp.title}</span>
          </div>
          {sp.items.map((it,j)=><div key={j} style={{fontSize:10,color:'#9e9b93',padding:'2px 0'}}>{it}</div>)}
        </div>)}
      </div>
    </C>

    {/* BOTTOM ROW: Alerts + Actions + Employees + Dept breakdown */}
    {alerts.length>0&&<C style={{marginBottom:16,border:'1px solid '+(alerts.some(a=>a.type==='error')?'rgba(248,113,113,.2)':'rgba(251,146,60,.15)')}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>🔔 Alertes intelligentes ({alerts.length})</div>
        <div style={{display:'flex',gap:8}}>
          <span style={{fontSize:10,padding:'2px 8px',borderRadius:10,background:'rgba(248,113,113,.1)',color:'#f87171'}}>{alerts.filter(a=>a.type==='error').length} critiques</span>
          <span style={{fontSize:10,padding:'2px 8px',borderRadius:10,background:'rgba(251,146,60,.1)',color:'#fb923c'}}>{alerts.filter(a=>a.type==='warning').length} avertissements</span>
          <span style={{fontSize:10,padding:'2px 8px',borderRadius:10,background:'rgba(96,165,250,.1)',color:'#60a5fa'}}>{alerts.filter(a=>a.type==='info').length} infos</span>
        </div>
      </div>
      <div style={{maxHeight:200,overflowY:'auto',display:'flex',flexDirection:'column',gap:4}}>
        {alerts.map((a,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',borderRadius:8,background:a.type==='error'?'rgba(248,113,113,.04)':a.type==='warning'?'rgba(251,146,60,.04)':'rgba(96,165,250,.04)',border:'1px solid '+(a.type==='error'?'rgba(248,113,113,.1)':a.type==='warning'?'rgba(251,146,60,.1)':'rgba(96,165,250,.1)')}}>
          <span style={{fontSize:14}}>{a.icon}</span>
          <span style={{flex:1,fontSize:11.5,color:a.type==='error'?'#f87171':a.type==='warning'?'#fb923c':'#60a5fa'}}>{a.msg}</span>
          <span style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:'rgba(198,163,78,.06)',color:'#5e5c56'}}>{a.cat}</span>
        </div>)}
      </div>
    </C>}
    <div style={{display:'grid',gridTemplateColumns:'260px 1fr 300px',gap:14}}>
      {/* QUICK ACTIONS */}
      <C style={{padding:'20px 18px'}}>
        <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:14}}>Actions rapides</div>
        {[
          {l:"+ Nouvel employé",p:'employees',i:'◉',c:'#4ade80'},
          {l:"Générer fiche de paie",p:'payslip',i:'◈',c:'#60a5fa'},
          {l:"Dimona IN/OUT",p:'onss',sb:'dimona',i:'⬆',c:'#c6a34e'},
          {l:"DmfA trimestrielle",p:'onss',sb:'dmfa',i:'◆',c:'#a78bfa'},
          {l:"Belcotax 281.10",p:'fiscal',sb:'belcotax',i:'◇',c:'#fb923c'},
          {l:"Virement SEPA",p:'reporting',sb:'sepa',i:'▤',c:'#06b6d4'},
        ].map((a,i)=>
          <button key={i} onClick={()=>d({type:"NAV",page:a.p,sub:a.sb})} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 12px',marginBottom:4,background:"rgba(198,163,78,.03)",border:'1px solid rgba(198,163,78,.06)',borderRadius:8,color:'#d4d0c8',cursor:'pointer',fontSize:12,fontWeight:500,textAlign:'left',fontFamily:'inherit',transition:'all .15s'}}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(198,163,78,.08)';e.currentTarget.style.borderColor='rgba(198,163,78,.2)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(198,163,78,.03)';e.currentTarget.style.borderColor='rgba(198,163,78,.06)';}}>
            <span style={{fontSize:14,color:a.c,opacity:.7}}>{a.i}</span>{a.l}
          </button>
        )}
      </C>

      {/* EMPLOYEES LIST */}
      <C style={{padding:'20px 18px',maxHeight:340,overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Équipe ({ae.length})</div>
          <button onClick={()=>d({type:"NAV",page:'employees'})} style={{fontSize:10,color:'#c6a34e',background:"none",border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:500}}>Voir tout →</button>
        </div>
        {calcs.slice(0,8).map(({e,c},i)=>(
          <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid rgba(255,255,255,.03)',animation:`fadeIn .3s ease ${i*0.04}s both`}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${['#c6a34e',"#60a5fa","#a78bfa","#4ade80","#fb923c","#06b6d4"][i%6]}22,${['#c6a34e',"#60a5fa","#a78bfa","#4ade80","#fb923c","#06b6d4"][i%6]}08)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:['#c6a34e',"#60a5fa","#a78bfa","#4ade80","#fb923c","#06b6d4"][i%6]}}>{(e.first||'')[0]}{(e.last||'')[0]}</div>
              <div>
                <div style={{fontSize:12.5,fontWeight:500,color:'#e8e6e0'}}>{e.first||e.fn||'Employé'} {e.last||''}
                  <span style={{fontSize:8.5,padding:'1px 5px',borderRadius:3,marginLeft:6,fontWeight:600,
                    background:e.status==='sorti'?'rgba(248,113,113,.12)':e.contract==='student'?'rgba(251,146,60,.12)':e.statut==='ouvrier'?'rgba(251,146,60,.1)':'rgba(96,165,250,.08)',
                    color:e.status==='sorti'?'#f87171':e.contract==='student'?'#fb923c':e.statut==='ouvrier'?'#fb923c':'#60a5fa',
                  }}>{e.status==='sorti'?'SORTI':e.contract==='student'?'ÉTU':e.statut==='ouvrier'?'OUV':'EMPL'}</span>
                </div>
                <div style={{fontSize:10,color:'#5e5c56'}}>{e.fn||'—'} · CP {e.cp||'200'}</div>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:13,fontWeight:600,color:'#4ade80'}}>{fmt(c.net)}</div>
              <div style={{fontSize:9,color:'#5e5c56'}}>coût: {fmt(c.costTotal)}</div>
            </div>
          </div>
        ))}
        {ae.length>8&&<div style={{textAlign:'center',padding:'10px 0',fontSize:11,color:'#8b7340'}}>+ {ae.length-8} autre{ae.length-8>1?'s':''}</div>}
      </C>

      {/* DEPARTMENT BREAKDOWN */}
      <C style={{padding:'20px 18px'}}>
        <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:16}}>Répartition par département</div>
        {Object.entries(depts).sort((a,b)=>b[1].mass-a[1].mass).map(([dp,data],i)=>{
          const pct=tm>0?Math.round(data.mass/tm*100):0;
          return <div key={dp} style={{marginBottom:12,animation:`fadeIn .3s ease ${i*0.06}s both`}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <div style={{fontSize:11.5,color:'#d4d0c8',fontWeight:500}}>{dp} <span style={{color:'#5e5c56',fontWeight:400}}>({data.count})</span></div>
              <div style={{fontSize:11,color:'#c6a34e',fontWeight:600}}>{fmt(data.mass)}</div>
            </div>
            <div style={{height:6,background:"rgba(198,163,78,.06)",borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${pct}%`,background:"linear-gradient(90deg,#c6a34e,#e2c878)",borderRadius:3,transition:'width .8s ease'}}/>
            </div>
            <div style={{fontSize:9,color:'#5e5c56',marginTop:2}}>{pct}% de la masse salariale</div>
          </div>;
        })}
        {Object.keys(depts).length===0&&<div style={{textAlign:'center',color:'#5e5c56',fontSize:12,padding:20}}>Aucun employé</div>}
        <div style={{marginTop:16,padding:'12px 14px',background:"rgba(198,163,78,.03)",borderRadius:8,border:'1px solid rgba(198,163,78,.06)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'1px'}}>Ratio net/brut</span>
            <span style={{fontSize:13,fontWeight:700,color:'#4ade80'}}>{tm>0?Math.round(tn/tm*100):0}%</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'1px'}}>Coût/brut</span>
            <span style={{fontSize:13,fontWeight:700,color:'#a78bfa'}}>{tm>0?((tc/tm)*100).toFixed(0):0}%</span>
          </div>
        </div>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  EMPLOYEES
// ═══════════════════════════════════════════════════════════════


export default Dashboard;