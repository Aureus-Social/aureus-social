'use client'
const AUREUS_INFO={name:'Aureus IA SPRL',vat:'BE 1028.230.781',addr:'Saint-Gilles, Bruxelles',email:"info@aureus-ia.com",version:'v38',sprint:'Sprint 17 — Automatisation 100%'};
'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LOIS_BELGES, LB, RMMMG, TX_ONSS_W, TX_ONSS_E, NET_FACTOR, PV_DOUBLE, PV_SIMPLE, PP_EST, obf, SAISIE_2026_TRAVAIL, SAISIE_2026_REMPLACEMENT, SAISIE_IMMUN_ENFANT_2026, quickNetEst } from '@/app/lib/lois-belges';
// â•â•â• AUREUS SOCIAL PRO â€” Pages Inline â•â•â•
// Composants pages extraits du monolithe
// DÃ©pendent de {s, d} (state, dispatch) du composant principal

// Helpers UI (identiques au monolithe)

// â•â•â• Stubs pour fonctions PDF dÃ©finies dans le monolithe (accÃ¨s via window) â•â•â•
function aureusDocHTML(title, bodyContent, co, options) {
  if (typeof window !== 'undefined' && window.aureusDocHTML && window.aureusDocHTML !== aureusDocHTML) {
    return window.aureusDocHTML(title, bodyContent, co, options);
  }
  // Fallback minimal
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + (title||'') + '</title></head><body>' + (bodyContent||'') + '</body></html>';
}
function escapeHtml(str) {
  if (typeof window !== 'undefined' && window.escapeHtml && window.escapeHtml !== escapeHtml) {
    return window.escapeHtml(str);
  }
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function calc(emp, per, co) {
  if (typeof window !== 'undefined' && window.calc) return window.calc(emp, per, co);
  const b=+(emp?.monthlySalary||emp?.gross||0);
  return {gross:b,net:b*0.56,tax:b*0.22,onssNet:b*0.1307,onssE:b*0.2507,css:0,costTotal:b*1.2507,bonus:0,peculeV:0,y13:0,totalBrut:b,netAPayer:b*0.56};
}
function calcCSSS(emp, per, co) {
  if (typeof window !== 'undefined' && window.calcCSSS) return window.calcCSSS(emp, per, co);
  return 0;
}
function quickNet(brut) {
  if (typeof window !== 'undefined' && window.quickNet) return window.quickNet(brut);
  return Math.round((brut||0)*0.56*100)/100;
}
function genBelcotax(data) {
  if (typeof window !== 'undefined' && window.genBelcotax) return window.genBelcotax(data);
  return "";
}
function genDMFANotification(data) {
  if (typeof window !== 'undefined' && window.genDMFANotification) return window.genDMFANotification(data);
  return "";
}
function genDMFATicket(data) {
  if (typeof window !== 'undefined' && window.genDMFATicket) return window.genDMFATicket(data);
  return "";
}
function genDMFAXML(data) {
  if (typeof window !== 'undefined' && window.genDMFAXML) return window.genDMFAXML(data);
  return "";
}
function genDimonaXML(data) {
  if (typeof window !== 'undefined' && window.genDimonaXML) return window.genDimonaXML(data);
  return "";
}
function loadHtml2Pdf() {
  if (typeof window !== 'undefined' && window.loadHtml2Pdf) return window.loadHtml2Pdf();
  return "";
}
// â•â•â• Constantes manquantes depuis monolithe â•â•â•
const DPER={month:new Date().getMonth()+1,year:new Date().getFullYear(),days:22,sickG:0,holidays:0,overtimeH:0,sundayH:0,nightH:0,bonus:0,y13:0,otherDed:0,advance:0,garnish:0,ppVolontaire:0,
  // Ã‰lÃ©ments fiscaux complets
  doublePecule:0,         // Double pÃ©cule vacances (si payÃ© par employeur â€” employÃ©s)
  peculeDepart:0,         // PÃ©cule de vacances de dÃ©part (sortie de service)
  primeAnciennete:0,      // Prime d'anciennetÃ© (exo ONSS+IPP si â‰¤ plafond)
  primeNaissance:0,       // Prime de naissance/mariage (exo ONSS si â‰¤ plafond)
  primeInnovation:0,      // Prime d'innovation (Art. 38 Â§1er 25Â° CIR â€” exo IPP max 1 mois)
  indemTeletravail:0,     // IndemnitÃ© forfaitaire tÃ©lÃ©travail (max 154,74â‚¬/mois 2026)
  indemBureau:0,          // IndemnitÃ© frais de bureau (si pas forfaitaire)
  pensionCompl:0,         // Retenue personnelle pension complÃ©mentaire (2Ã¨ pilier â€” assur. groupe)
  retSyndicale:0,         // Retenue cotisation syndicale
  saisieAlim:0,           // Pension alimentaire (saisie prioritaire)
  heuresSupFisc:0,        // Heures sup ouvrant droit Ã  rÃ©duction PP (max 180h/an â€” Art.154bis CIR â€” 2026)
  // Heures sup volontaires brut=net (nouveau rÃ©gime 01/04/2026)
  hsVolontBrutNet:0,      // HS volontaires brut=net (max 240h/an â€” 360h horeca) â€” exo ONSS + PP + sursalaire
  hsRelance:0,            // HS relance transitoire T1/2026 (max 120h) â€” brut=net aussi
  typeSpecial:"normal",   // normal, doublePecule, y13, depart, preavis
  // Activation ONEM
  allocTravail:0,         // Allocation de travail ONEM (Activa/Impulsion â€” dÃ©duit du net par l'employeur)
  allocTravailType:'none', // none, activa_bxl, activa_jeune, impulsion_wal, impulsion55, vdab
  // Mi-temps mÃ©dical / Reprise progressive
  miTempsMed:false,       // Reprise partielle du travail (Art. 100Â§2 Loi coord. 14/07/1994)
  miTempsHeures:0,        // Heures/semaine prestÃ©es chez employeur (ex: 19h sur 38h)
  miTempsINAMI:0,         // ComplÃ©ment INAMI perÃ§u par le travailleur (indemnitÃ©s mutuelle)
};
var TX_AT=LB.assurances.accidentTravail.taux;
var COUT_MED=LB.assurances.medecineTravail.cout;



const fmt=n=>new Intl.NumberFormat('fr-BE',{style:'currency',currency:'EUR'}).format(n||0);
const fmtP=n=>`${((n||0)*100).toFixed(2)}%`;
const uid=()=>`${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
const MN_FR=['Janvier',"FÃ©vrier","Mars","Avril","Mai","Juin","Juillet","AoÃ»t","Septembre","Octobre","Novembre","DÃ©cembre"];
const MN_NL=['Januari',"Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"];
let MN=MN_FR;

// Composants UI de base
function PH({title,sub}){return <div style={{marginBottom:16}}><div style={{fontSize:18,fontWeight:800,color:'#c6a34e',letterSpacing:'.3px'}}>{title}</div>{sub&&<div style={{fontSize:11,color:'#9e9b93',marginTop:2}}>{sub}</div>}</div>;}
function C({children,style}){return <div style={{padding:'16px 20px',background:'rgba(198,163,78,.03)',borderRadius:12,border:'1px solid rgba(198,163,78,.06)',marginBottom:14,...style}}>{children}</div>;}
function ST({children}){return <div style={{fontSize:13,fontWeight:700,color:'#c6a34e',marginBottom:10,paddingBottom:6,borderBottom:'1px solid rgba(198,163,78,.1)'}}>{children}</div>;}

// quickPP â€” estimation prÃ©compte professionnel
const quickPP = (brut) => {
  const imposable = brut - brut * TX_ONSS_W;
  if (imposable <= 1110) return 0;
  if (imposable <= 1560) return Math.round((imposable - 1110) * 0.2668 * 100) / 100;
  if (imposable <= 2700) return Math.round((120.06 + (imposable - 1560) * 0.4280) * 100) / 100;
  return Math.round((607.98 + (imposable - 2700) * 0.4816) * 100) / 100;
};

// aureuspdf â€” gÃ©nÃ©ration PDF (utilise jsPDF depuis CDN)
const aureuspdf = (title, sections, opts = {}) => {
  if (typeof window === 'undefined') return;
  const fn = opts.filename || title.replace(/[^a-zA-Z0-9]/g, '_');
  if (typeof window.jspdf !== 'undefined') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text(title, 14, 20);
    let y = 35;
    (sections || []).forEach(s => {
      if (s.type === 'title') { doc.setFontSize(14); doc.text(s.text || '', 14, y); y += 8; }
      else if (s.type === 'subtitle') { doc.setFontSize(11); doc.setFont(undefined, 'bold'); doc.text(s.text || '', 14, y); doc.setFont(undefined, 'normal'); y += 7; }
      else if (s.type === 'text') { doc.setFontSize(9); const lines = doc.splitTextToSize(s.text || '', 180); doc.text(lines, 14, y); y += lines.length * 4.5; }
      else if (s.type === 'kv') { doc.setFontSize(9); doc.text(`${s.k}: ${s.v}`, 14, y); y += 5; }
      else if (s.type === 'line') { doc.line(14, y, 196, y); y += 4; }
      else if (s.type === 'space') { y += s.h || 5; }
      if (y > 275) { doc.addPage(); y = 20; }
    });
    doc.save(fn + '.pdf');
  } else {
    alert('PDF en cours de chargement, rÃ©essayez...');
  }
};

function Dashboard({s,d}) {
  const ae=(s.emps||[]).filter(e=>e.status==='active'||!e.status||e.status===undefined);
  const sortie=(s.emps||[]).filter(e=>e.status==='sorti');
  const etudiants=(s.emps||[]).filter(e=>e.contract==='student');
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
    const found=s.pays.filter(p=>p.month===mi+1&&p.year===yi);
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
    dl.push({l:"PrÃ©compte professionnel 274",d:`5/${String(curMonth+2).padStart(2,"0")}/${curYear}`,days:daysToPP,t:'mensuel',urgent:daysToPP<=5,icon:'â—‡'});
    const daysToDmfa=Math.ceil((qEnd-now)/(1000*60*60*24));
    dl.push({l:`DmfA T${q}/${curYear}`,d:`${qEnd.getDate()}/${String(q*3).padStart(2,"0")}/${curYear}`,days:daysToDmfa,t:'trimestriel',urgent:daysToDmfa<=14,icon:'â—†'});
    if(curMonth<=1){const belco=new Date(curYear,2,1);const dB=Math.ceil((belco-now)/(1000*60*60*24));dl.push({l:"Belcotax 281.xx",d:`01/03/${curYear}`,days:dB,t:'annuel',urgent:dB<=30,icon:'â–£'});}
    if(curMonth<=1){const bilan=new Date(curYear,1,28);const dBi=Math.ceil((bilan-now)/(1000*60*60*24));dl.push({l:"Bilan Social BNB",d:`28/02/${curYear}`,days:dBi,t:'annuel',urgent:dBi<=30,icon:'â—ˆ'});}
    dl.push({l:"Dimona IN â€” Avant embauche",d:"Permanent",days:null,t:'event',urgent:false,icon:'â¬†'});
    dl.push({l:"Provisions ONSS mensuelles",d:`5 du mois`,days:daysToPP,t:'mensuel',urgent:daysToPP<=5,icon:'â—†'});
    return dl.sort((a,b)=>(a.days??999)-(b.days??999));
  };
  const deadlines=getDeadlines();
  const urgentCount=deadlines.filter(d=>d.urgent).length;

  // â”€â”€ ALERTES INTELLIGENTES â”€â”€
  const getAlerts=()=>{
    const alerts=[];
    const today=new Date();
    const eName=(e)=>(e.first||e.last)?`${e.first||''} ${e.last||''}`.trim():(e.fn||`EmployÃ© ${(e.id||'').slice(-3)}`);
    // CDD fin proche (30 jours)
    ae.forEach(e=>{
      if(e.endD){
        const end=new Date(e.endD);
        const days=Math.ceil((end-today)/(1000*60*60*24));
        if(days>0&&days<=30)alerts.push({type:'warning',icon:'â°',msg:`CDD de ${eName(e)} expire dans ${days} jours (${e.endD})`,cat:'Contrat'});
        if(days<=0)alerts.push({type:'error',icon:'ðŸ”´',msg:`CDD de ${eName(e)} expirÃ© depuis ${Math.abs(days)} jours !`,cat:'Contrat'});
      }
      // PÃ©riode d'essai (si entrÃ©e < 14 jours pour Ã©tudiant)
      if(e.contract==='student'&&e.startD){
        const start=new Date(e.startD);
        const days=Math.ceil((today-start)/(1000*60*60*24));
        if(days<=3)alerts.push({type:'info',icon:'ðŸ“‹',msg:`${eName(e)}: pÃ©riode d'essai Ã©tudiant (3 premiers jours)`,cat:'Contrat'});
      }
      // NISS manquant
      if(!e.niss)alerts.push({type:'warning',icon:'ðŸ†”',msg:`NISS manquant pour ${eName(e)}`,cat:'IdentitÃ©'});
      // IBAN manquant
      if(!e.iban)alerts.push({type:'info',icon:'ðŸ¦',msg:`IBAN manquant pour ${eName(e)}`,cat:'Financier'});
      // Salaire Ã  0
      if(!e.monthlySalary||e.monthlySalary<=0)alerts.push({type:'error',icon:'ðŸ’°',msg:`Salaire non configurÃ© pour ${eName(e)}`,cat:'RÃ©munÃ©ration'});
    });
    // Indexation prÃ©vue
    const nextIndex=new Date(today.getFullYear(),0,1);
    if(today.getMonth()>=10)nextIndex.setFullYear(today.getFullYear()+1);
    const daysToIndex=Math.ceil((nextIndex-today)/(1000*60*60*24));
    if(daysToIndex<=60&&daysToIndex>0)alerts.push({type:'info',icon:'ðŸ“ˆ',msg:`Indexation salariale prÃ©vue dans ~${daysToIndex} jours (janvier ${nextIndex.getFullYear()})`,cat:'LÃ©gal'});
    // DmfA trimestrielle
    const q=Math.floor(today.getMonth()/3)+1;
    const qEnd=new Date(today.getFullYear(),q*3,0);
    const daysToDmfa=Math.ceil((qEnd-today)/(1000*60*60*24));
    if(daysToDmfa<=14)alerts.push({type:'warning',icon:'ðŸ“¡',msg:`DmfA T${q}/${today.getFullYear()} Ã  dÃ©poser dans ${daysToDmfa} jours`,cat:'ONSS'});
    return alerts.sort((a,b)=>a.type==='error'?-1:b.type==='error'?1:a.type==='warning'?-1:1);
  };
  const alerts=getAlerts();

  // Dept breakdown
  const depts={};
  ae.forEach(e=>{const dp=e.dept||'Non dÃ©fini';if(!depts[dp])depts[dp]={count:0,mass:0};depts[dp].count++;depts[dp].mass+=(e.monthlySalary||0);});

  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
      <div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:'#e8e6e0',margin:0}}>Tableau de bord</h1>
        <div style={{fontSize:12.5,color:'#8b7340',marginTop:4}}>{MN[curMonth]} {curYear} â€” {s.co.name||'â€”'} {s.co.vat?`Â· ${s.co.vat}`:''}</div>
      </div>
      {urgentCount>0&&<div style={{padding:'8px 16px',background:"rgba(248,113,113,.08)",border:'1px solid rgba(248,113,113,.2)',borderRadius:10,display:'flex',alignItems:'center',gap:8,animation:'pulse 2s infinite'}}>
        <span style={{width:8,height:8,borderRadius:'50%',background:"#ef4444",display:'inline-block',animation:'blink 1.5s infinite'}}/>
        <span style={{fontSize:12,fontWeight:600,color:'#f87171'}}>{urgentCount} Ã©chÃ©ance{urgentCount>1?'s':''} urgente{urgentCount>1?'s':''}</span>
      </div>}
    </div>
    

    
    {/* âš¡ Automation Shortcuts */}
    <div style={{marginBottom:20,padding:16,background:'linear-gradient(135deg,rgba(198,163,78,.06),rgba(198,163,78,.02))',border:'1px solid rgba(198,163,78,.15)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:18}}>âš¡</span>
        <div><div style={{fontSize:13,fontWeight:600,color:'#c6a34e'}}>Automatisation</div><div style={{fontSize:10,color:'#888'}}>Actions rapides</div></div>
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        <button onClick={()=>{if(confirm('GÃ©nÃ©rer toutes les fiches de paie ?')){(s.emps||[]).forEach(e=>generatePayslipPDF(e,s.co));addToast(s.emps.length+' fiches de paie gÃ©nÃ©rÃ©es')}}} style={{padding:'7px 14px',borderRadius:8,border:'none',background:'rgba(198,163,78,.15)',color:'#c6a34e',fontSize:11,cursor:'pointer',fontWeight:600}}>ðŸ“„ Fiches</button>
        <button onClick={()=>{if(confirm('GÃ©nÃ©rer SEPA ?')){generateSEPAXML(s.emps||[],s.co);addToast('Fichier SEPA pain.001 gÃ©nÃ©rÃ©')}}} style={{padding:'7px 14px',borderRadius:8,border:'none',background:'rgba(34,197,94,.12)',color:'#22c55e',fontSize:11,cursor:'pointer',fontWeight:600}}>ðŸ’¸ SEPA</button>
        <button onClick={()=>{if(confirm('GÃ©nÃ©rer DmfA ?')){generateDmfAXML(s.emps||[],Math.ceil((new Date().getMonth()+1)/3),new Date().getFullYear(),s.co);addToast('DmfA trimestrielle gÃ©nÃ©rÃ©e')}}} style={{padding:'7px 14px',borderRadius:8,border:'none',background:'rgba(168,85,247,.12)',color:'#a855f7',fontSize:11,cursor:'pointer',fontWeight:600}}>ðŸ“Š DmfA</button>
        <button onClick={()=>d({type:'NAV',page:'automatisation'})} style={{padding:'7px 14px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',background:'transparent',color:'#c6a34e',fontSize:11,cursor:'pointer',fontWeight:500}}>Voir tout â†’</button>
      </div>
    </div>
{(()=>{const al=getAlertes(s.emps||[],s.co);return al.length>0?<div style={{marginBottom:16,borderRadius:10,border:"1px solid rgba(198,163,78,.15)",padding:12,background:"rgba(198,163,78,.03)"}}><div style={{fontSize:12,fontWeight:700,color:"#c6a34e",marginBottom:8}}>Alertes ({al.length})</div>{al.slice(0,8).map((a,i)=><div key={i} style={{padding:"6px 8px",marginBottom:4,borderRadius:6,fontSize:11,background:a.level==="danger"?"rgba(248,113,113,.08)":a.level==="warning"?"rgba(251,146,60,.08)":"rgba(96,165,250,.08)",color:a.level==="danger"?"#f87171":a.level==="warning"?"#fb923c":"#60a5fa"}}>{a.icon} {a.msg}</div>)}{al.length>8?<div style={{fontSize:10,color:"#9e9b93",marginTop:4}}>+{al.length-8} autres alertes</div>:null}</div>:null})()}
    
    {/* KPI ROW */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginBottom:22}}>
      {[
        {label:"EmployÃ©s actifs",value:ae.length,sub:`${sortie.length} sorti${sortie.length>1?'s':''} Â· ${etudiants.length} Ã©tudiant${etudiants.length>1?'s':''}`,color:'#c6a34e',icon:'â—‰'},
        {label:"Masse salariale brute",value:fmt(tm),sub:`Moy: ${fmt(avgGross)}/emp`,color:'#4ade80',icon:'â—ˆ'},
        {label:"Net total",value:fmt(tn),sub:`${ae.length?Math.round(tn/tm*100):0}% du brut`,color:'#60a5fa',icon:'â–¤'},
        {label:"CoÃ»t employeur total",value:fmt(tc),sub:`Ratio: ${ae.length?((tc/tm)*100).toFixed(0):0}% du brut`,color:'#a78bfa',icon:'â—†'},
        {label:"DÃ©clarations",value:`${s.pays.length}`,sub:`${s.dims.length} Dimona Â· ${s.dmfas.length} DmfA`,color:'#fb923c',icon:'â—‡'},
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
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Ã‰volution coÃ»t salarial â€” 12 mois</div>
          <div style={{display:'flex',gap:14}}>
            {[{l:"CoÃ»t total",c:'#a78bfa'},{l:"Masse brute",c:'#c6a34e'},{l:"Net",c:'#4ade80'}].map(x=>
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
              <div style={{fontSize:9,color:'#5e5c56',fontWeight:500}}>{fmt(m.cost).replace(/\sâ‚¬/,"")}</div>
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
          Ã‰chÃ©ances & Obligations
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
          <span style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>Aureus Social Pro â€” {AUREUS_INFO.sprint}</span>
        </div>
        <span style={{fontSize:10,color:'#5e5c56'}}>DerniÃ¨re mise Ã  jour: {new Date().toLocaleDateString('fr-BE')}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {[
          {v:'v37',title:'Sprint 9',items:['âš™ï¸ 13 automatisations (validation obligatoire)','ðŸ“… Gestion absences prÃ©-paie','âš¡ 8 actions en masse multi-clients','ðŸ¥ Audit santÃ© global','ðŸ“‹ Planificateur 14 tÃ¢ches','ðŸ“‘ 15 ModÃ¨les documents','ðŸ” Filtres score santÃ©'],color:'#06b6d4'},
          {v:'v36',title:'Sprint 8',items:['ðŸ“Š Budget Auto','ðŸ”® Simulateur What-If','ðŸ“ˆ KPI + Equal Pay'],color:'#f472b6'},
          {v:'v35',title:'Sprint 7',items:['ðŸª Marketplace 12 modules','ðŸ”— IntÃ©grations 25+ connecteurs','ðŸ”” Webhook Manager'],color:'#a78bfa'},
          {v:'v34',title:'Sprint 6',items:['ðŸŒ 4 langues (FR/NL/EN/DE)','ðŸ”Œ API Documentation','ðŸ’± Multi-Devises'],color:'#fb923c'},
          {v:'v33',title:'Sprint 5',items:['ðŸ§  PrÃ©diction Turnover','ðŸ’¡ Reco Salariales IA','ðŸ“ˆ PrÃ©vision Masse','ðŸ” DÃ©tection Anomalies','ðŸ¥ Score SantÃ© Dossier'],color:'#f87171'},
          {v:'v32',title:'Sprint 4',items:['âš¡ Batch Processing','ðŸ”” Alertes intelligentes','ðŸ” 2FA (TOTP)','ðŸ“¡ DmfA amÃ©liorÃ©e'],color:'#a78bfa'},
          {v:'v31',title:'Sprint 3',items:['âš¡ Workflow Embauche','âš¡ Workflow Licenciement','âš¡ Workflow Maladie','ðŸ“‚ Export 11 formats + ClearFact'],color:'#60a5fa'},
          {v:'v30',title:'Sprint 2',items:['ðŸ“¥ Import Excel','ðŸ’° ROI Calculator','ðŸ”’ Validation NISS/IBAN','ðŸ§  153 CP prÃ©-remplissage'],color:'#4ade80'},
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
        <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>ðŸ”” Alertes intelligentes ({alerts.length})</div>
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
          {l:"+ Nouvel employÃ©",p:'employees',i:'â—‰',c:'#4ade80'},
          {l:"GÃ©nÃ©rer fiche de paie",p:'payslip',i:'â—ˆ',c:'#60a5fa'},
          {l:"Dimona IN/OUT",p:'onss',sb:'dimona',i:'â¬†',c:'#c6a34e'},
          {l:"DmfA trimestrielle",p:'onss',sb:'dmfa',i:'â—†',c:'#a78bfa'},
          {l:"Belcotax 281.10",p:'fiscal',sb:'belcotax',i:'â—‡',c:'#fb923c'},
          {l:"Virement SEPA",p:'reporting',sb:'sepa',i:'â–¤',c:'#06b6d4'},
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
          <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Ã‰quipe ({ae.length})</div>
          <button onClick={()=>d({type:"NAV",page:'employees'})} style={{fontSize:10,color:'#c6a34e',background:"none",border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:500}}>Voir tout â†’</button>
        </div>
        {calcs.slice(0,8).map(({e,c},i)=>(
          <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid rgba(255,255,255,.03)',animation:`fadeIn .3s ease ${i*0.04}s both`}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${['#c6a34e',"#60a5fa","#a78bfa","#4ade80","#fb923c","#06b6d4"][i%6]}22,${['#c6a34e',"#60a5fa","#a78bfa","#4ade80","#fb923c","#06b6d4"][i%6]}08)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:['#c6a34e',"#60a5fa","#a78bfa","#4ade80","#fb923c","#06b6d4"][i%6]}}>{(e.first||'')[0]}{(e.last||'')[0]}</div>
              <div>
                <div style={{fontSize:12.5,fontWeight:500,color:'#e8e6e0'}}>{e.first||e.fn||'EmployÃ©'} {e.last||''}
                  <span style={{fontSize:8.5,padding:'1px 5px',borderRadius:3,marginLeft:6,fontWeight:600,
                    background:e.status==='sorti'?'rgba(248,113,113,.12)':e.contract==='student'?'rgba(251,146,60,.12)':e.statut==='ouvrier'?'rgba(251,146,60,.1)':'rgba(96,165,250,.08)',
                    color:e.status==='sorti'?'#f87171':e.contract==='student'?'#fb923c':e.statut==='ouvrier'?'#fb923c':'#60a5fa',
                  }}>{e.status==='sorti'?'SORTI':e.contract==='student'?'Ã‰TU':e.statut==='ouvrier'?'OUV':'EMPL'}</span>
                </div>
                <div style={{fontSize:10,color:'#5e5c56'}}>{e.fn||'â€”'} Â· CP {e.cp||'200'}</div>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:13,fontWeight:600,color:'#4ade80'}}>{fmt(c.net)}</div>
              <div style={{fontSize:9,color:'#5e5c56'}}>coÃ»t: {fmt(c.costTotal)}</div>
            </div>
          </div>
        ))}
        {ae.length>8&&<div style={{textAlign:'center',padding:'10px 0',fontSize:11,color:'#8b7340'}}>+ {ae.length-8} autre{ae.length-8>1?'s':''}</div>}
      </C>

      {/* DEPARTMENT BREAKDOWN */}
      <C style={{padding:'20px 18px'}}>
        <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:16}}>RÃ©partition par dÃ©partement</div>
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
        {Object.keys(depts).length===0&&<div style={{textAlign:'center',color:'#5e5c56',fontSize:12,padding:20}}>Aucun employÃ©</div>}
        <div style={{marginTop:16,padding:'12px 14px',background:"rgba(198,163,78,.03)",borderRadius:8,border:'1px solid rgba(198,163,78,.06)'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'1px'}}>Ratio net/brut</span>
            <span style={{fontSize:13,fontWeight:700,color:'#4ade80'}}>{tm>0?Math.round(tn/tm*100):0}%</span>
          </div>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'1px'}}>CoÃ»t/brut</span>
            <span style={{fontSize:13,fontWeight:700,color:'#a78bfa'}}>{tm>0?((tc/tm)*100).toFixed(0):0}%</span>
          </div>
        </div>
      </C>
    </div>
  </div>;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  EMPLOYEES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function Employees({s,d}) {
  const [form,setF]=useState(null);
  const [ed,setEd]=useState(false);
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all'); // all, active, sorti, student, ouvrier
  const [viewMode,setViewMode]=useState('list'); // list, grid
  const empty={first:'',last:'',niss:'',birth:'',addr:'',city:'',zip:'',startD:'',endD:'',fn:"",dept:'',contract:'CDI',regime:'full',whWeek:38,monthlySalary:0,civil:"single",depChildren:0,handiChildren:0,iban:'',mvT:10,mvW:CR_TRAV,mvE:8.91,expense:0,cp:'200',dmfaCode:'495',dimType:'OTH',commDist:0,commType:'none',commMonth:0,status:'active',sexe:'M',statut:'employe',niveauEtude:'sec',allocTravailType:'none',allocTravail:0,carFuel:"none",carCO2:0,carCatVal:0,carBrand:"",carModel:"",atnGSM:false,atnPC:false,atnInternet:false,atnLogement:false,atnLogementRC:0,atnChauffage:false,atnElec:false,depAscendant:0,depAscendantHandi:0,conjointHandicap:false,depAutres:0,anciennete:0,nrEngagement:0,engagementTrimestre:1,
    veloSociete:false,veloType:'none',veloValeur:0,veloLeasingMois:0,carteCarburant:false,carteCarburantMois:0,borneRecharge:false,borneRechargeCoÃ»t:0,
    frontalier:false,frontalierPays:'',frontalierConvention:'',frontalierA1:false,frontalierExoPP:false,
    pensionnÃ©:false,pensionType:'none',pensionAge:0,pensionCarriere:0,pensionCumulIllimite:false,pensionMontant:0,
  };
  // â”€â”€ NISS VALIDATION â”€â”€
  const validateNISS=(niss)=>{
    if(!niss)return{valid:false,msg:'NISS requis'};
    const clean=niss.replace(/[\s.\-]/g,'');
    if(clean.length!==11||!/^\d{11}$/.test(clean))return{valid:false,msg:'NISS doit contenir 11 chiffres'};
    // Check digit (modulo 97)
    const base=clean.slice(0,9);
    const check=parseInt(clean.slice(9));
    // Born before 2000
    let mod=97-(parseInt(base)%97);
    if(mod===check)return{valid:true,msg:'âœ… NISS valide'};
    // Born after 2000 (prefix with 2)
    mod=97-(parseInt('2'+base)%97);
    if(mod===check)return{valid:true,msg:'âœ… NISS valide (nÃ©(e) aprÃ¨s 2000)'};
    return{valid:false,msg:'âŒ NISS invalide â€” chiffre de contrÃ´le incorrect'};
  };

  // â”€â”€ NISS DUPLICATE DETECTION â”€â”€
  const checkNISSDuplicate=(niss,currentId)=>{
    if(!niss)return null;
    const clean=niss.replace(/[\s.\-]/g,'');
    // Level 1: Same dossier
    const dupLocal=(s.emps||[]).find(e=>e.niss&&e.niss.replace(/[\s.\-]/g,'')===clean&&e.id!==currentId);
    if(dupLocal)return{level:'error',msg:`â›” NISS dÃ©jÃ  utilisÃ© dans ce dossier: ${dupLocal.first} ${dupLocal.last}`};
    // Level 2: Platform-wide (check all clients)
    const allClients=s.clients||[];
    for(const cl of allClients){
      if(cl.id===s.activeClient)continue;
      const dupPlatform=(cl.emps||[]).find(e=>e.niss&&e.niss.replace(/[\s.\-]/g,'')===clean);
      if(dupPlatform)return{level:'warn',msg:`âš ï¸ NISS existe dans le dossier ${cl.company?.name||'autre'}: ${dupPlatform.first} ${dupPlatform.last}. Transfert?`};
    }
    return null;
  };

  // â”€â”€ IBAN VALIDATION â”€â”€
  const validateIBAN=(iban)=>{
    if(!iban)return null;
    const clean=iban.replace(/\s/g,'').toUpperCase();
    if(clean.length<15||clean.length>34)return{valid:false,msg:'âŒ Longueur IBAN incorrecte'};
    if(!/^[A-Z]{2}\d{2}/.test(clean))return{valid:false,msg:'âŒ Format IBAN invalide (doit commencer par 2 lettres + 2 chiffres)'};
    // Belgian IBAN check
    if(clean.startsWith('BE')&&clean.length!==16)return{valid:false,msg:'âŒ IBAN belge = 16 caractÃ¨res (BE + 14 chiffres)'};
    // Modulo 97 check
    const rearranged=clean.slice(4)+clean.slice(0,4);
    const numeric=rearranged.split('').map(c=>/\d/.test(c)?c:(c.charCodeAt(0)-55).toString()).join('');
    let remainder=numeric.slice(0,2);
    for(let i=2;i<numeric.length;i++){
      remainder=((parseInt(remainder+numeric[i]))%97).toString();
    }
    if(parseInt(remainder)!==1)return{valid:false,msg:'âŒ IBAN invalide â€” chiffre de contrÃ´le incorrect'};
    return{valid:true,msg:`âœ… IBAN valide (${clean.slice(0,2)})`};
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

  // â”€â”€ IMPORT EXCEL â”€â”€
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
          first:r['PrÃ©nom']||r['Prenom']||r['prenom']||r['first']||r['First']||'',
          last:r['Nom']||r['nom']||r['last']||r['Last']||'',
          niss:String(r['NISS']||r['niss']||r['Registre national']||''),
          fn:r['Fonction']||r['fonction']||r['function']||'',
          dept:r['DÃ©partement']||r['Departement']||r['dept']||'',
          contract:r['Contrat']||r['contrat']||r['Type']||'CDI',
          cp:String(r['CP']||r['cp']||r['Commission paritaire']||'200'),
          monthlySalary:parseFloat(r['Brut']||r['brut']||r['Salaire']||r['salaire']||0),
          startD:r['EntrÃ©e']||r['Entree']||r['Date entrÃ©e']||r['startD']||'',
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
      alert(`âœ… ${added} travailleur(s) importÃ©(s) depuis ${file.name}`);
    }catch(err){
      alert('âŒ Erreur import: '+err.message);
    }
    setImporting(false);
    e.target.value='';
  };

  // â”€â”€ PRÃ‰-REMPLISSAGE INTELLIGENT PAR CP (rÃ©fÃ©rence globale optimisÃ©e) â”€â”€
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

  // â”€â”€ ROI CALCULATOR â”€â”€
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
  const filtered=(s.emps||[]).filter(e=>{
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
    const headers=['PrÃ©nom',"Nom","NISS","Fonction","DÃ©partement","Contrat","CP","Brut","Statut","EntrÃ©e","IBAN"];
    const rows=filtered.map(e=>[e.first,e.last,e.niss,e.fn,e.dept,e.contract,e.cp,e.monthlySalary,e.status||'active',e.startD,e.iban]);
    const csv=[headers,...rows].map(r=>r.map(c=>`"${(c||'').toString().replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`employees_${new Date().toISOString().slice(0,10)}.csv`;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
  };

  const activeCount=(s.emps||[]).filter(e=>e.status!=='sorti').length;
  const sortiCount=(s.emps||[]).filter(e=>e.status==='sorti').length;
  const studentCount=(s.emps||[]).filter(e=>e.contract==='student').length;

  // Exemple Activa â€” Nourdin MOUSSATI (attestation Activa.brussels AP 350/800/350) â€” fiche complÃ¨te
  // CDD 3 mois : entrÃ©e 2 mars 2026, fin 1er juin 2026 ; fiche de paie pour fin mars 2026
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
    if(typeof addToast==='function')addToast('Nourdin MOUSSATI ajoutÃ©. Dans Fiches de Paie : choisir Â« Activa.brussels AP (350â†’800â†’350) Â» pour l\'allocation.');
    else alert('Nourdin MOUSSATI ajoutÃ©. Allez dans Fiches de Paie â†’ sÃ©lectionnez-le â†’ Activation ONEM : Activa.brussels AP (350â†’800â†’350).');
  };

  return <div>
    <PH title="Gestion des EmployÃ©s" sub={`${(s.emps||[]).length} employÃ©(s)`} actions={<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
      <label style={{padding:'8px 14px',borderRadius:8,fontSize:11,cursor:'pointer',border:'1px solid rgba(198,163,78,.25)',background:'transparent',color:'#c6a34e',fontWeight:600,display:'flex',alignItems:'center',gap:4}}>
        ðŸ“¥ {importing?'Import...':'Import Excel'}
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImportExcel} style={{display:'none'}}/>
      </label>
      <B v="outline" onClick={()=>setShowROI(!showROI)} style={{padding:'8px 14px',fontSize:11}}>ðŸ’° ROI</B>
      <B v="outline" onClick={exportCSV} style={{padding:'8px 14px',fontSize:11}}>â¬‡ CSV</B>
      <B v="outline" onClick={addExempleActivaNordin} style={{padding:'8px 14px',fontSize:11}}>ðŸ’¼ Exemple Activa Nourdin</B>
      <B onClick={()=>{setF({...empty});setEd(false);}}>+ Nouvel employÃ©</B>
    </div>}/>
    {/* Barre visible Exemple Activa â€” toujours affichÃ©e sous le titre */}
    <div style={{marginBottom:16,padding:'12px 16px',background:'linear-gradient(135deg,rgba(34,197,94,.08),rgba(34,197,94,.03))',border:'1px solid rgba(34,197,94,.2)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
      <span style={{fontSize:12,color:'#86efac'}}>ðŸ’¼ Plan Activa (attestation Actiris) â€” Exemple Nourdin MOUSSATI : ajout en 1 clic + redirection Fiches de Paie</span>
      <button onClick={addExempleActivaNordin} style={{padding:'10px 18px',borderRadius:8,border:'none',background:'#22c55e',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>ðŸ’¼ CrÃ©er Nourdin MOUSSATI (Activa)</button>
    </div>
    {/* Search and filters bar */}
    <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
      <div style={{flex:1,minWidth:200,position:'relative'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ðŸ” Rechercher par nom, NISS, fonction, dÃ©partement..."
          style={{width:'100%',padding:'10px 14px 10px 14px',background:"#090c16",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,color:'#d4d0c8',fontSize:12.5,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
      </div>
      <div style={{display:'flex',gap:4}}>
        {[
          {id:"all",l:`Tous (${(s.emps||[]).length})`},
          {id:"active",l:`Actifs (${activeCount})`},
          {id:"sorti",l:`Sortis (${sortiCount})`},
          {id:"student",l:`Ã‰tudiants (${studentCount})`},
        ].map(f=>
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{padding:'7px 12px',borderRadius:6,fontSize:11,fontWeight:filter===f.id?600:400,border:'1px solid '+(filter===f.id?'rgba(198,163,78,.3)':'rgba(139,115,60,.1)'),background:filter===f.id?'rgba(198,163,78,.1)':'transparent',color:filter===f.id?'#c6a34e':'#5e5c56',cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>{f.l}</button>
        )}
      </div>
      <div style={{display:'flex',gap:2,background:"rgba(198,163,78,.04)",borderRadius:6,border:'1px solid rgba(139,115,60,.1)',overflow:'hidden'}}>
        <button onClick={()=>setViewMode('list')} style={{padding:'6px 10px',border:'none',background:viewMode==='list'?'rgba(198,163,78,.15)':'transparent',color:viewMode==='list'?'#c6a34e':'#5e5c56',cursor:'pointer',fontSize:13}}>â˜°</button>
        <button onClick={()=>setViewMode('grid')} style={{padding:'6px 10px',border:'none',background:viewMode==='grid'?'rgba(198,163,78,.15)':'transparent',color:viewMode==='grid'?'#c6a34e':'#5e5c56',cursor:'pointer',fontSize:13}}>âŠž</button>
      </div>
    </div>
    {/* ROI Calculator */}
    {showROI&&<C style={{marginBottom:20,border:'1px solid rgba(198,163,78,.25)'}}>
      <h3 style={{fontSize:15,fontWeight:600,color:'#c6a34e',margin:'0 0 12px'}}>ðŸ’° Calculateur ROI â€” Ã‰conomies vs secrÃ©tariat social</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
        <I label="Nombre de travailleurs" type="number" value={roiData.nbEmps} onChange={v=>setRoiData({...roiData,nbEmps:parseInt(v)||0})}/>
        <I label="Prix actuel / fiche (â‚¬)" type="number" value={roiData.prixActuel} onChange={v=>setRoiData({...roiData,prixActuel:parseFloat(v)||0})}/>
        <I label="Prix Aureus / fiche (â‚¬)" type="number" value={roiData.prixAureus} onChange={v=>setRoiData({...roiData,prixAureus:parseFloat(v)||0})}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
        <div style={{padding:16,borderRadius:10,background:'rgba(74,222,128,.06)',border:'1px solid rgba(74,222,128,.15)',textAlign:'center'}}>
          <div style={{fontSize:10,color:'#9e9b93',marginBottom:4}}>Ã‰conomie / mois</div>
          <div style={{fontSize:22,fontWeight:700,color:'#4ade80'}}>{roiSaving.toFixed(0)} â‚¬</div>
        </div>
        <div style={{padding:16,borderRadius:10,background:'rgba(198,163,78,.06)',border:'1px solid rgba(198,163,78,.15)',textAlign:'center'}}>
          <div style={{fontSize:10,color:'#9e9b93',marginBottom:4}}>Ã‰conomie / an</div>
          <div style={{fontSize:22,fontWeight:700,color:'#c6a34e'}}>{roiSavingYear.toFixed(0)} â‚¬</div>
        </div>
        <div style={{padding:16,borderRadius:10,background:'rgba(96,165,250,.06)',border:'1px solid rgba(96,165,250,.15)',textAlign:'center'}}>
          <div style={{fontSize:10,color:'#9e9b93',marginBottom:4}}>RÃ©duction</div>
          <div style={{fontSize:22,fontWeight:700,color:'#60a5fa'}}>{roiPercent}%</div>
        </div>
      </div>
      <div style={{marginTop:12,fontSize:11,color:'#5e5c56',textAlign:'center'}}>
        ComparÃ© Ã  {roiData.prixActuel}â‚¬/fiche chez les prestataires traditionnels â€” Aureus Ã  {roiData.prixAureus}â‚¬/fiche
      </div>
    </C>}
    {form&&<C style={{marginBottom:20}}>
      <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 16px',fontFamily:"'Cormorant Garamond',serif"}}>{ed?'Modifier':'Nouvel employÃ©'}</h2>
      <ST>IdentitÃ©</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="PrÃ©nom" value={form.first} onChange={v=>setF({...form,first:v})}/>
        <I label="Nom" value={form.last} onChange={v=>setF({...form,last:v})}/>
        <div>
          <I label="NISS" value={form.niss} onChange={onNissChange}/>
          {nissCheck&&<div style={{fontSize:10,marginTop:2,color:nissCheck.valid?'#4ade80':'#f87171'}}>{nissCheck.msg}</div>}
          {nissDup&&<div style={{fontSize:10,marginTop:2,color:nissDup.level==='error'?'#f87171':'#fb923c'}}>{nissDup.msg}</div>}
        </div>
        <I label="Naissance" type="date" value={form.birth} onChange={v=>setF({...form,birth:v})}/>
        <I label="Sexe" value={form.sexe} onChange={v=>setF({...form,sexe:v})} options={[{v:"M",l:"Homme"},{v:"F",l:"Femme"},{v:"X",l:"Non-binaire"}]}/>
        <I label="Statut" value={form.statut} onChange={v=>setF({...form,statut:v})} options={[{v:"employe",l:"EmployÃ©"},{v:"ouvrier",l:"Ouvrier"},{v:"etudiant",l:"Ã‰tudiant"},{v:"apprenti",l:"Apprenti"},{v:"dirigeant",l:"Dirigeant d\'entreprise"}]}/>
        <I label="Adresse" value={form.addr} onChange={v=>setF({...form,addr:v})} span={2}/>
        <I label="CP" value={form.zip} onChange={v=>setF({...form,zip:v})}/>
        <I label="Ville" value={form.city} onChange={v=>setF({...form,city:v})}/>
        <div>
          <I label="IBAN" value={form.iban} onChange={onIbanChange}/>
          {ibanCheck&&<div style={{fontSize:10,marginTop:2,color:ibanCheck.valid?'#4ade80':'#f87171'}}>{ibanCheck.msg}</div>}
        </div>
        <I label="Niveau d'Ã©tudes" value={form.niveauEtude} onChange={v=>setF({...form,niveauEtude:v})} options={[{v:"prim",l:"Primaire"},{v:"sec_inf",l:"Secondaire infÃ©rieur"},{v:"sec",l:"Secondaire supÃ©rieur"},{v:"sup",l:"SupÃ©rieur non-universitaire (bachelier)"},{v:"univ",l:"Universitaire (master/doctorat)"}]}/>
      </div>
      <ST>Contrat</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="Fonction" value={form.fn} onChange={v=>setF({...form,fn:v})}/>
        <I label="DÃ©partement" value={form.dept} onChange={v=>setF({...form,dept:v})}/>
        <I label="EntrÃ©e" type="date" value={form.startD} onChange={v=>setF({...form,startD:v})}/>
        <I label="Contrat" value={form.contract} onChange={v=>setF({...form,contract:v})} options={[
          {v:"CDI",l:"CDI"},{v:"CDD",l:"CDD"},{v:"trav_det",l:"Travail nettement dÃ©fini"},{v:"remplacement",l:"Remplacement"},
          {v:"tpartiel",l:"Temps partiel"},{v:"interim",l:"IntÃ©rimaire"},{v:"student",l:"Ã‰tudiant (650h)"},
          {v:"flexi",l:"Flexi-job"},{v:"saisonnier",l:"Saisonnier"},{v:"occas_horeca",l:"Extra Horeca"},
          {v:"titre_service",l:"Titres-services"},{v:"art60",l:"Art. 60Â§7 (CPAS)"},{v:"CIP",l:"Convention immersion"},
          {v:"alternance",l:"Alternance"},{v:"CPE",l:"Premier emploi"},{v:"ETA",l:"Travail adaptÃ©"},
          {v:"detache",l:"DÃ©tachÃ©"},{v:"domestique",l:"Domestique"},{v:"teletravail",l:"TÃ©lÃ©travail struct."},
          {v:"domicile",l:"Travail Ã  domicile"},{v:"indep_princ",l:"IndÃ©p. principal"},
          {v:"indep_compl",l:"IndÃ©p. complÃ©mentaire"},{v:"mandataire",l:"Mandataire sociÃ©tÃ©"},
          {v:"freelance",l:"Freelance/Consultant"},{v:"smart",l:"Smart (portage)"},
          {v:"volontariat",l:"Volontariat"},{v:"artiste",l:"Artiste (ATA)"},{v:"sportif",l:"Sportif rÃ©munÃ©rÃ©"},
          {v:"plateforme",l:"Ã‰conomie plateforme"}
        ]}/>
        <I label="H/sem" type="number" value={form.whWeek} onChange={v=>setF({...form,whWeek:v})}/>
        <I label="CP" value={form.cp} onChange={onCPChange} options={Object.entries(LEGAL.CP).map(([k,v])=>({v:k,l:v}))}/>
        <I label="Code DMFA" value={form.dmfaCode} onChange={v=>setF({...form,dmfaCode:v})} options={Object.entries(LEGAL.DMFA_CODES).map(([k,v])=>({v:k,l:`${k} - ${v}`}))}/>
        <I label="Rang engagement" value={form.nrEngagement||0} onChange={v=>setF({...form,nrEngagement:parseInt(v)||0})} options={[{v:0,l:"â€” Pas de rÃ©duction â€”"},{v:1,l:"1er employÃ© (exo totale)"},{v:2,l:"2Ã¨ employÃ©"},{v:3,l:"3Ã¨ employÃ©"},{v:4,l:"4Ã¨ employÃ©"},{v:5,l:"5Ã¨ employÃ©"},{v:6,l:"6Ã¨ employÃ©"}]}/>
        {form.nrEngagement>0&&<I label="Trimestre depuis eng." type="number" value={form.engagementTrimestre||1} onChange={v=>setF({...form,engagementTrimestre:parseInt(v)||1})}/>}
      </div>
      <ST style={{marginTop:14}}>Activation ONEM (comme dans Fiches de Paie)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:8,padding:12,background:'rgba(34,197,94,.04)',border:'1px solid rgba(34,197,94,.15)',borderRadius:8}}>
        <I label="Activation ONEM" value={form.allocTravailType||'none'} onChange={v=>setF({...form,allocTravailType:v,allocTravail:v!=='none'?(form.allocTravail||0):0})} options={[{v:"none",l:"â€” Aucune â€”"},{v:"activa_bxl",l:"Activa.brussels (â‚¬350/m)"},{v:"activa_bxl_ap",l:"Activa.brussels AP (350â†’800â†’350)"},{v:"activa_jeune",l:"Activa Jeunes <30 (â‚¬350/m)"},{v:"impulsion_wal",l:"Impulsion Wallonie (â‚¬500/m)"},{v:"impulsion55",l:"Impulsion 55+ (â‚¬500/m)"},{v:"sine",l:"SINE Ã©con. sociale (â‚¬500/m)"},{v:"vdab",l:"VDAB (prime directe)"},{v:"art60",l:"Art. 60 Â§7 (1er emploi)"}]}/>
        {form.allocTravailType&&form.allocTravailType!=='none'&&<I label="Montant alloc. ONEM (â‚¬)" type="number" value={form.allocTravail||0} onChange={v=>setF({...form,allocTravail:parseFloat(v)||0})}/>}
      </div>
      <div style={{marginTop:6,marginBottom:12,padding:10,background:'rgba(198,163,78,.04)',borderRadius:8,fontSize:10.5,color:'#9e9b93',lineHeight:1.5}}>
        ðŸ’¡ Ce rÃ©glage sera repris par dÃ©faut sur les Fiches de Paie. Le montant (Activa AP) peut Ãªtre calculÃ© automatiquement selon le mois dâ€™anciennetÃ© (350 â†’ 800 â†’ 350 â‚¬).
      </div>
      <ST>Grille horaire (Loi 16/03/1971 + RÃ¨glement de travail)</ST>
      <div style={{padding:10,background:"rgba(198,163,78,.03)",borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
        <div style={{display:'flex',gap:6,marginBottom:8,alignItems:'center'}}>
          <span style={{fontSize:11,color:'#9e9b93',fontWeight:600,width:70}}>Fraction:</span>
          <span style={{fontSize:13,fontWeight:700,color:(form.whWeek||38)>=38?'#4ade80':'#fb923c'}}>{Math.round((form.whWeek||38)/38*100)}%</span>
          <span style={{fontSize:10.5,color:'#5e5c56',marginLeft:6}}>({form.whWeek||38}h / 38h rÃ©f.) â€” {(form.whWeek||38)>=38?'Temps plein':'Temps partiel'}</span>
          <span style={{fontSize:10.5,color:'#5e5c56',marginLeft:'auto'}}>{((form.whWeek||38)/5).toFixed(2)}h/jour Â· Pause: 30min (si {'>'} 6h)</span>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead><tr style={{borderBottom:'1px solid rgba(198,163,78,.15)'}}>
            {['',"Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Total"].map(h=><th key={h} style={{padding:'4px 6px',fontSize:10,color:'#9e9b93',textAlign:'center',fontWeight:600}}>{h}</th>)}
          </tr></thead>
          <tbody>
            <tr>
              <td style={{padding:'4px 6px',fontSize:10,color:'#9e9b93'}}>DÃ©but</td>
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
          â± <b>Temps plein</b> = 38h/sem (Art. 19 Loi 16/03/1971). <b>Temps partiel</b> = min. 1/3 temps plein (â‰¥12h40). Horaire variable possible (Art. 11bis). DÃ©rogation samedi/dimanche = CCT sectorielle ou accord d'entreprise.
        </div>
      </div>
      <ST>RÃ©munÃ©ration</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="Brut mensuel (â‚¬)" type="number" value={form.monthlySalary} onChange={v=>setF({...form,monthlySalary:v})}/>
        <I label="CR total (â‚¬)" type="number" value={form.mvT} onChange={v=>setF({...form,mvT:v})}/>
        <I label="CR part trav. (â‚¬)" type="number" value={form.mvW} onChange={v=>setF({...form,mvW:v})}/>
        <I label="CR part empl. (â‚¬)" type="number" value={form.mvE} onChange={v=>setF({...form,mvE:v})}/>
        <I label="Frais propres (â‚¬)" type="number" value={form.expense} onChange={v=>setF({...form,expense:v})}/>
        <I label="Transport domicile-travail" value={form.commType} onChange={v=>setF({...form,commType:v})} options={[{v:"none",l:"Aucun"},{v:"train",l:"ðŸš† Train (SNCB)"},{v:"bus",l:"ðŸšŒ Bus/Tram/MÃ©tro (STIB/TEC/De Lijn)"},{v:"bike",l:"ðŸš² VÃ©lo"},{v:"car",l:"ðŸš— Voiture privÃ©e"},{v:"carpool",l:"ðŸš— Covoiturage"},{v:"mixed",l:"ðŸ”„ CombinÃ© (train+autre)"},{v:"company_car",l:"ðŸ¢ Voiture de sociÃ©tÃ© (pas d\'interv.)"}]}/>
        {form.commType!=='none'&&form.commType!=='company_car'&&<I label="Distance simple (km)" type="number" value={form.commDist} onChange={v=>setF({...form,commDist:v})}/>}
        {(form.commType==='train'||form.commType==='bus'||form.commType==='mixed')&&<I label="Abonnement mensuel (â‚¬)" type="number" value={form.commMonth} onChange={v=>setF({...form,commMonth:v})}/>}
      </div>
      {form.commType!=='none'&&form.commType!=='company_car'&&<div style={{marginTop:8,padding:10,background:"rgba(96,165,250,.04)",borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.6}}>
        {form.commType==='train'&&'ðŸš† Train SNCB: intervention employeur obligatoire = 75% de l\'abonnement (CCT 19/9). ExonÃ©rÃ© ONSS et IPP.'}
        {form.commType==='bus'&&'ðŸšŒ Transport en commun: intervention obligatoire = prix abonnement SNCB pour mÃªme distance (CCT 19/9). ExonÃ©rÃ© ONSS et IPP.'}
        {form.commType==='bike'&&`ðŸš² VÃ©lo: indemnitÃ© ${form.commDist>0?((form.commDist*2*0.27).toFixed(2)+'â‚¬/jour = '):''}0,27 â‚¬/km A/R (2026). ExonÃ©rÃ© ONSS et IPP (max 0,27â‚¬/km). Cumulable avec transport en commun.`}
        {form.commType==='car'&&`ðŸš— Voiture privÃ©e: pas d'obligation lÃ©gale (sauf CCT sectorielle). Si intervention: exonÃ©rÃ© ONSS jusqu'Ã  490â‚¬/an. Distance: ${form.commDist||0} km Ã— 2 = ${(form.commDist||0)*2} km A/R.`}
        {form.commType==='carpool'&&'ðŸš— Covoiturage: mÃªmes rÃ¨gles que voiture privÃ©e pour le conducteur. Passager = indemnitÃ© possible exonÃ©rÃ©e.'}
        {form.commType==='mixed'&&'ðŸ”„ CombinÃ©: cumul possible train + vÃ©lo ou train + voiture. Chaque trajet est indemnisÃ© sÃ©parÃ©ment selon son mode.'}
      </div>}
      <ST>VÃ©hicule de sociÃ©tÃ© (ATN)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="Carburant" value={form.carFuel} onChange={v=>setF({...form,carFuel:v})} options={[{v:"none",l:"Pas de vÃ©hicule"},{v:"essence",l:"Essence"},{v:"diesel",l:"Diesel"},{v:"lpg",l:"LPG/CNG"},{v:"electrique",l:"Ã‰lectrique"},{v:"hybride",l:"Hybride PHEV"}]}/>
        <I label="CO2 g/km" type="number" value={form.carCO2} onChange={v=>setF({...form,carCO2:v})}/>
        <I label="Valeur catalogue (â‚¬)" type="number" value={form.carCatVal} onChange={v=>setF({...form,carCatVal:v})}/>
        <I label="Marque" value={form.carBrand} onChange={v=>setF({...form,carBrand:v})} options={[
          {v:"",l:"â€” SÃ©lectionner â€”"},{v:"Aiways",l:"Aiways"},{v:"Alfa Romeo",l:"Alfa Romeo"},{v:"Alpine",l:"Alpine"},{v:"Aston Martin",l:"Aston Martin"},
          {v:"Audi",l:"Audi"},{v:"Bentley",l:"Bentley"},{v:"BMW",l:"BMW"},{v:"BYD",l:"BYD"},{v:"Cadillac",l:"Cadillac"},
          {v:"Chevrolet",l:"Chevrolet"},{v:"Chrysler",l:"Chrysler"},{v:"CitroÃ«n",l:"CitroÃ«n"},{v:"Cupra",l:"Cupra"},{v:"Dacia",l:"Dacia"},
          {v:"Dodge",l:"Dodge"},{v:"DS",l:"DS Automobiles"},{v:"Ferrari",l:"Ferrari"},{v:"Fiat",l:"Fiat"},{v:"Ford",l:"Ford"},
          {v:"Genesis",l:"Genesis"},{v:"Honda",l:"Honda"},{v:"Hyundai",l:"Hyundai"},{v:"Infiniti",l:"Infiniti"},{v:"Isuzu",l:"Isuzu"},
          {v:"Jaguar",l:"Jaguar"},{v:"Jeep",l:"Jeep"},{v:"Kia",l:"Kia"},{v:"Lamborghini",l:"Lamborghini"},{v:"Land Rover",l:"Land Rover"},
          {v:"Lexus",l:"Lexus"},{v:"Lotus",l:"Lotus"},{v:"Lynk & Co",l:"Lynk & Co"},{v:"Maserati",l:"Maserati"},{v:"Mazda",l:"Mazda"},
          {v:"McLaren",l:"McLaren"},{v:"Mercedes",l:"Mercedes-Benz"},{v:"MG",l:"MG"},{v:"Mini",l:"Mini"},{v:"Mitsubishi",l:"Mitsubishi"},
          {v:"NIO",l:"NIO"},{v:"Nissan",l:"Nissan"},{v:"Opel",l:"Opel"},{v:"Peugeot",l:"Peugeot"},{v:"Polestar",l:"Polestar"},
          {v:"Porsche",l:"Porsche"},{v:"Renault",l:"Renault"},{v:"Rolls-Royce",l:"Rolls-Royce"},{v:"Seat",l:"Seat"},{v:"Å koda",l:"Å koda"},
          {v:"Smart",l:"Smart"},{v:"SsangYong",l:"SsangYong"},{v:"Subaru",l:"Subaru"},{v:"Suzuki",l:"Suzuki"},{v:"Tesla",l:"Tesla"},
          {v:"Toyota",l:"Toyota"},{v:"Volkswagen",l:"Volkswagen"},{v:"Volvo",l:"Volvo"},{v:"XPeng",l:"XPeng"},{v:"Autre",l:"Autre"}
        ]}/>
        <I label="ModÃ¨le" value={form.carModel} onChange={v=>setF({...form,carModel:v})} options={[
          {v:"",l:"â€” SÃ©lectionner â€”"},...((CAR_MODELS[form.carBrand]||[]).map(m=>({v:m,l:m}))),{v:"_autre",l:"Autre modÃ¨le"}
        ]}/>
      </div>
      <ST>Avantages en nature (ATN)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>ðŸ“± GSM/TÃ©lÃ©phone (36â‚¬/an)</div>
          <div onClick={()=>setF({...form,atnGSM:!form.atnGSM})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnGSM?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnGSM?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnGSM?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnGSM?'âœ… OUI â€” 3,00 â‚¬/mois':'âŒ NON'}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>ðŸ’» PC/Tablette (72â‚¬/an)</div>
          <div onClick={()=>setF({...form,atnPC:!form.atnPC})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnPC?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnPC?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnPC?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnPC?'âœ… OUI â€” 6,00 â‚¬/mois':'âŒ NON'}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>ðŸŒ Internet privÃ© (60â‚¬/an)</div>
          <div onClick={()=>setF({...form,atnInternet:!form.atnInternet})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnInternet?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnInternet?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnInternet?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnInternet?'âœ… OUI â€” 5,00 â‚¬/mois':'âŒ NON'}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>ðŸ  Logement gratuit (RC Ã— coeff.)</div>
          <div onClick={()=>setF({...form,atnLogement:!form.atnLogement})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnLogement?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnLogement?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnLogement?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnLogement?'âœ… OUI':'âŒ NON'}
          </div>
        </div>
        {form.atnLogement&&<I label="RC logement (â‚¬)" type="number" value={form.atnLogementRC} onChange={v=>setF({...form,atnLogementRC:v})}/>}
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>ðŸ”¥ Chauffage gratuit (2.130â‚¬/an)</div>
          <div onClick={()=>setF({...form,atnChauffage:!form.atnChauffage})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnChauffage?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnChauffage?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnChauffage?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnChauffage?'âœ… OUI â€” 177,50 â‚¬/mois':'âŒ NON'}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>âš¡ Ã‰lectricitÃ© gratuite (1.060â‚¬/an)</div>
          <div onClick={()=>setF({...form,atnElec:!form.atnElec})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.atnElec?'rgba(198,163,78,.15)':'rgba(198,163,78,.04)',color:form.atnElec?'#c6a34e':'#5e5c56',border:'1px solid '+(form.atnElec?'rgba(198,163,78,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.atnElec?'âœ… OUI â€” 88,33 â‚¬/mois':'âŒ NON'}
          </div>
        </div>
      </div>
      <ST>VÃ©lo de sociÃ©tÃ© & MobilitÃ© verte</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>ðŸš² VÃ©lo de sociÃ©tÃ© (leasing)</div>
          <div onClick={()=>setF({...form,veloSociete:!form.veloSociete})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.veloSociete?'rgba(74,222,128,.15)':'rgba(198,163,78,.04)',color:form.veloSociete?'#4ade80':'#5e5c56',border:'1px solid '+(form.veloSociete?'rgba(74,222,128,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.veloSociete?'âœ… OUI â€” ATN = 0â‚¬ (exonÃ©rÃ© depuis 2024)':'âŒ NON'}
          </div>
        </div>
        {form.veloSociete&&<I label="Type de vÃ©lo" value={form.veloType||'none'} onChange={v=>setF({...form,veloType:v})} options={[{v:"classique",l:"ðŸš² VÃ©lo classique"},{v:"electrique",l:"âš¡ VÃ©lo Ã©lectrique (â‰¤25km/h)"},{v:"speed_pedelec",l:"ðŸŽ Speed pedelec (â‰¤45km/h)"}]}/>}
        {form.veloSociete&&<I label="Valeur catalogue (â‚¬)" type="number" value={form.veloValeur} onChange={v=>setF({...form,veloValeur:v})}/>}
        {form.veloSociete&&<I label="Leasing mensuel (â‚¬)" type="number" value={form.veloLeasingMois} onChange={v=>setF({...form,veloLeasingMois:v})}/>}
      </div>
      {form.veloSociete&&<div style={{marginTop:8,padding:10,background:"rgba(74,222,128,.04)",borderRadius:8,fontSize:10.5,color:'#4ade80',lineHeight:1.6}}>
        ðŸš² <b>VÃ©lo de sociÃ©tÃ©</b> â€” ATN = 0â‚¬ (Art. 38Â§1er 14Â°a CIR â€” exonÃ©rÃ© ONSS et IPP depuis 01/01/2024). Leasing vÃ©lo dÃ©ductible 100% pour l'employeur. Cumulable avec l'indemnitÃ© vÃ©lo 0,27â‚¬/km. Le speed pedelec est assimilÃ© Ã  un vÃ©lo.
      </div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>â›½ Carte carburant / recharge</div>
          <div onClick={()=>setF({...form,carteCarburant:!form.carteCarburant})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.carteCarburant?'rgba(251,146,60,.12)':'rgba(198,163,78,.04)',color:form.carteCarburant?'#fb923c':'#5e5c56',border:'1px solid '+(form.carteCarburant?'rgba(251,146,60,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.carteCarburant?'âœ… OUI':'âŒ NON'}
          </div>
        </div>
        {form.carteCarburant&&<I label="Budget mensuel carte (â‚¬)" type="number" value={form.carteCarburantMois} onChange={v=>setF({...form,carteCarburantMois:v})}/>}
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>ðŸ”Œ Borne de recharge domicile</div>
          <div onClick={()=>setF({...form,borneRecharge:!form.borneRecharge})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.borneRecharge?'rgba(96,165,250,.12)':'rgba(198,163,78,.04)',color:form.borneRecharge?'#60a5fa':'#5e5c56',border:'1px solid '+(form.borneRecharge?'rgba(96,165,250,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.borneRecharge?'âœ… OUI â€” installÃ©e au domicile':'âŒ NON'}
          </div>
        </div>
        {form.borneRecharge&&<I label="CoÃ»t mensuel borne+Ã©lec (â‚¬)" type="number" value={form.borneRechargeCoÃ»t} onChange={v=>setF({...form,borneRechargeCoÃ»t:v})}/>}
      </div>
      {form.carteCarburant&&!form.carFuel!=='none'&&<div style={{marginTop:8,padding:10,background:"rgba(251,146,60,.04)",borderRadius:8,fontSize:10.5,color:'#fb923c',lineHeight:1.6}}>
        âš  <b>Carte carburant sans voiture de sociÃ©tÃ©</b> â€” L'avantage est imposable Ã  100% (ATN = montant total de la carte). Si voiture de sociÃ©tÃ©: inclus dans l'ATN voiture (Art. 36Â§2 CIR).
      </div>}
      <ST>Travailleur frontalier (RÃ¨gl. 883/2004)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>ðŸŒ Travailleur frontalier</div>
          <div onClick={()=>setF({...form,frontalier:!form.frontalier})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.frontalier?'rgba(168,85,247,.12)':'rgba(198,163,78,.04)',color:form.frontalier?'#a855f7':'#5e5c56',border:'1px solid '+(form.frontalier?'rgba(168,85,247,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.frontalier?'âœ… OUI â€” RÃ©side hors Belgique':'âŒ NON â€” RÃ©side en Belgique'}
          </div>
        </div>
        {form.frontalier&&<I label="Pays de rÃ©sidence" value={form.frontalierPays||''} onChange={v=>setF({...form,frontalierPays:v})} options={[{v:"FR",l:"ðŸ‡«ðŸ‡· France"},{v:"NL",l:"ðŸ‡³ðŸ‡± Pays-Bas"},{v:"DE",l:"ðŸ‡©ðŸ‡ª Allemagne"},{v:"LU",l:"ðŸ‡±ðŸ‡º Luxembourg"}]}/>}
      </div>
      {form.frontalier&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:8}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>Formulaire A1 (dÃ©tachement)</div>
          <div onClick={()=>setF({...form,frontalierA1:!form.frontalierA1})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.frontalierA1?'rgba(96,165,250,.12)':'rgba(198,163,78,.04)',color:form.frontalierA1?'#60a5fa':'#5e5c56',border:'1px solid '+(form.frontalierA1?'rgba(96,165,250,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.frontalierA1?'âœ… A1 en cours':"âŒ Pas d'A1"}
          </div>
        </div>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>ExonÃ©ration PP (ancien rÃ©gime FR)</div>
          <div onClick={()=>setF({...form,frontalierExoPP:!form.frontalierExoPP})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.frontalierExoPP?'rgba(239,68,68,.12)':'rgba(198,163,78,.04)',color:form.frontalierExoPP?'#ef4444':'#5e5c56',border:'1px solid '+(form.frontalierExoPP?'rgba(239,68,68,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.frontalierExoPP?'âœ… ExonÃ©rÃ© PP (trÃ¨s rare)':'âŒ PP retenu en Belgique (normal)'}
          </div>
        </div>
      </div>}
      {form.frontalier&&<div style={{marginTop:8,padding:10,background:"rgba(168,85,247,.04)",borderRadius:8,fontSize:10.5,color:'#a855f7',lineHeight:1.6}}>
        ðŸŒ <b>Frontalier {form.frontalierPays==='FR'?'France':form.frontalierPays==='NL'?'Pays-Bas':form.frontalierPays==='DE'?'Allemagne':form.frontalierPays==='LU'?'Luxembourg':''}</b><br/>
        {form.frontalierPays==='FR'&&'â€¢ Convention CPDI BE-FR 10/03/1964. Ancien rÃ©gime frontalier abrogÃ© 01/01/2012. PP retenu en Belgique. Le travailleur dÃ©clare en France avec crÃ©dit d\'impÃ´t. Formulaire 276 Front.'}
        {form.frontalierPays==='NL'&&'â€¢ Convention CPDI BE-NL 05/06/2001. PP retenu en Belgique. Exemption avec progression aux Pays-Bas. Option: kwalificerend buitenlands belastingplichtige.'}
        {form.frontalierPays==='DE'&&'â€¢ Convention CPDI BE-DE 11/04/1967. PP retenu en Belgique. CrÃ©dit d\'impÃ´t en Allemagne. Pas de rÃ©gime frontalier spÃ©cial.'}
        {form.frontalierPays==='LU'&&'â€¢ Convention CPDI BE-LU 17/09/1970. PP retenu en Belgique. TolÃ©rance 24j/an de tÃ©lÃ©travail depuis le Luxembourg (accord amiable 2015).'}
        <br/>â€¢ ONSS: toujours belge (lex loci laboris â€” Art. 11 RÃ¨gl. 883/2004).
        â€¢ Limosa: pas nÃ©cessaire (le travailleur rÃ©side Ã  l'Ã©tranger mais travaille en BE avec contrat BE).
      </div>}
      <ST>Travailleur pensionnÃ© (Cumul pension-travail)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>ðŸ‘´ PensionnÃ© en activitÃ©</div>
          <div onClick={()=>setF({...form,pensionnÃ©:!form.pensionnÃ©})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.pensionnÃ©?'rgba(251,191,36,.15)':'rgba(198,163,78,.04)',color:form.pensionnÃ©?'#fbbf24':'#5e5c56',border:'1px solid '+(form.pensionnÃ©?'rgba(251,191,36,.3)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.pensionnÃ©?'âœ… OUI â€” BÃ©nÃ©ficiaire d\'une pension':'âŒ NON'}
          </div>
        </div>
        {form.pensionnÃ©&&<I label="Type de pension" value={form.pensionType||'none'} onChange={v=>setF({...form,pensionType:v})} options={[{v:"legal",l:"ðŸ› Pension lÃ©gale (Ã¢ge lÃ©gal)"},{v:"anticipee",l:"â° Pension anticipÃ©e"},{v:"survie",l:"ðŸ’ Pension de survie"},{v:"invalidite",l:"â™¿ Pension d\'invaliditÃ©"}]}/>}
      </div>
      {form.pensionnÃ©&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginTop:8}}>
        <I label="Ã‚ge" type="number" value={form.pensionAge} onChange={v=>setF({...form,pensionAge:parseInt(v)||0})}/>
        <I label="AnnÃ©es de carriÃ¨re" type="number" value={form.pensionCarriere} onChange={v=>setF({...form,pensionCarriere:parseInt(v)||0})}/>
        <I label="Pension mensuelle (â‚¬)" type="number" value={form.pensionMontant} onChange={v=>setF({...form,pensionMontant:v})}/>
      </div>}
      {form.pensionnÃ©&&<div style={{marginTop:8,padding:10,background:"rgba(251,191,36,.04)",borderRadius:8,fontSize:10.5,color:'#fbbf24',lineHeight:1.7}}>
        ðŸ‘´ <b>Cumul pension-travail</b><br/>
        {(form.pensionType==='legal'&&(form.pensionAge||0)>=66)||
         (form.pensionType==='anticipee'&&(form.pensionCarriere||0)>=45)||
         (form.pensionType==='survie'&&(form.pensionAge||0)>=65)
          ?<><span style={{color:'#4ade80',fontWeight:700}}>âœ… CUMUL ILLIMITÃ‰</span> â€” {form.pensionType==='legal'?'Ã‚ge lÃ©gal 66 ans atteint (AR 20/12/2006)':form.pensionType==='anticipee'?'45 ans de carriÃ¨re atteints':'Pension de survie â‰¥ 65 ans'}. Aucun plafond de revenus. Flexi-job: plafond 12.000â‚¬ ne s'applique PAS.<br/></>
          :<><span style={{color:'#ef4444',fontWeight:700}}>âš  CUMUL LIMITÃ‰</span> â€” Plafonds annuels bruts ({(form.depChildren||0)>0?'avec':'sans'} enfant Ã  charge):<br/>
            {form.pensionType==='anticipee'&&`â€¢ AnticipÃ©e: ${(form.depChildren||0)>0?'13.266':'10.613'}â‚¬/an brut`}
            {form.pensionType==='survie'&&`â€¢ Survie: ${(form.depChildren||0)>0?'28.136':'22.509'}â‚¬/an brut`}
            {form.pensionType==='invalidite'&&'â€¢ InvaliditÃ©: plafonds spÃ©cifiques INAMI'}
            <br/>DÃ©passement = pension rÃ©duite du % de dÃ©passement (Art. 64 AR 21/12/1967).<br/></>}
        â€¢ ONSS: normal (13,07% travailleur + taux patronal). Pas d'exonÃ©ration.<br/>
        â€¢ PP: barÃ¨me normal. La pension est imposÃ©e sÃ©parÃ©ment par le SFP.<br/>
        â€¢ DmfA: dÃ©claration normale. SIGEDIS/SFP vÃ©rifie le cumul automatiquement.
      </div>}
      <ST>Situation familiale</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        <I label="Situation" value={form.civil} onChange={v=>setF({...form,civil:v})} options={[{v:"single",l:"IsolÃ©"},{v:"married_2",l:"MariÃ© (2 revenus)"},{v:"married_1",l:"MariÃ© (1 revenu)"},{v:"cohabit",l:"Cohabitant lÃ©gal"}]}/>
        <I label="Enfants Ã  charge" type="number" value={form.depChildren} onChange={v=>setF({...form,depChildren:v})}/>
        <I label="Enfants handicapÃ©s" type="number" value={form.handiChildren} onChange={v=>setF({...form,handiChildren:v})}/>
        <I label="Ascendants â‰¥65 ans Ã  charge" type="number" value={form.depAscendant} onChange={v=>setF({...form,depAscendant:v})}/>
        <I label="Ascendants â‰¥65 handi." type="number" value={form.depAscendantHandi} onChange={v=>setF({...form,depAscendantHandi:v})}/>
        <I label="Autres pers. Ã  charge" type="number" value={form.depAutres} onChange={v=>setF({...form,depAutres:v})}/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:8}}>
        <div><div style={{fontSize:10.5,color:'#9e9b93',marginBottom:4}}>Conjoint handicapÃ© (Art.132 CIR)</div>
          <div onClick={()=>setF({...form,conjointHandicap:!form.conjointHandicap})} style={{padding:'8px 12px',borderRadius:6,cursor:'pointer',fontSize:11,
            background:form.conjointHandicap?'rgba(248,113,113,.12)':'rgba(198,163,78,.04)',color:form.conjointHandicap?'#f87171':'#5e5c56',border:'1px solid '+(form.conjointHandicap?'rgba(248,113,113,.25)':'rgba(198,163,78,.1)'),textAlign:'center'}}>
            {form.conjointHandicap?'âœ… OUI â€” rÃ©duction supplÃ©mentaire':'âŒ NON'}
          </div>
        </div>
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}>
        <B v="outline" onClick={()=>{setF(null);setEd(false);}}>Annuler</B>
        <B onClick={save}>{ed?'Mettre Ã  jour':'Enregistrer'}</B>
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
              <div style={{fontSize:10.5,color:'#5e5c56'}}>{r.fn||'â€”'}</div>
            </div>
            <span style={{fontSize:8.5,padding:'2px 7px',borderRadius:4,fontWeight:600,
              background:r.status==='sorti'?'rgba(248,113,113,.12)':r.contract==='student'?'rgba(251,146,60,.12)':r.statut==='ouvrier'?'rgba(251,146,60,.1)':'rgba(96,165,250,.08)',
              color:r.status==='sorti'?'#f87171':r.contract==='student'?'#fb923c':r.statut==='ouvrier'?'#fb923c':'#60a5fa',
            }}>{r.status==='sorti'?'SORTI':r.contract==='student'?'Ã‰TUDIANT':r.statut==='ouvrier'?'OUVRIER':'EMPLOYÃ‰'}</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:11}}>
            <div><span style={{color:'#5e5c56'}}>CP:</span> <span style={{color:'#d4d0c8'}}>{r.cp}</span></div>
            <div><span style={{color:'#5e5c56'}}>Contrat:</span> <span style={{color:'#d4d0c8'}}>{r.contract}</span></div>
            <div><span style={{color:'#5e5c56'}}>Brut:</span> <span style={{color:'#c6a34e',fontWeight:600}}>{fmt(r.monthlySalary)}</span></div>
            <div><span style={{color:'#5e5c56'}}>Net:</span> <span style={{color:'#4ade80',fontWeight:600}}>{fmt(p.net)}</span></div>
          </div>
          <div style={{marginTop:10,display:'flex',gap:6,justifyContent:'flex-end'}}>
            <B v="ghost" style={{padding:'4px 8px',fontSize:10}} onClick={e=>{e.stopPropagation();setF({...r});setEd(true);}}>âœŽ Modifier</B>
            <B v="danger" style={{padding:'4px 8px',fontSize:10}} onClick={e=>{e.stopPropagation();if(confirm('Supprimer ?'))d({type:"DEL_E",id:r.id});}}>âœ•</B>
          </div>
        </C>
      );})}
    </div>}
    {/* LIST VIEW */}
    {viewMode==='list'&&<C style={{padding:0,overflow:'hidden'}}>
      <Tbl cols={[
        {k:'n',l:"EmployÃ©",r:r=><div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:30,height:30,borderRadius:7,background:"rgba(198,163,78,.06)",display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#c6a34e'}}>{(r.first||'')[0]}{(r.last||'')[0]}</div>
          <div><div style={{fontWeight:500}}>{r.first} {r.last} <span style={{fontSize:8.5,padding:'1px 5px',borderRadius:3,fontWeight:600,background:r.status==='sorti'?'rgba(248,113,113,.12)':r.contract==='student'?'rgba(251,146,60,.12)':r.statut==='ouvrier'?'rgba(251,146,60,.1)':'rgba(96,165,250,.08)',color:r.status==='sorti'?'#f87171':r.contract==='student'?'#fb923c':r.statut==='ouvrier'?'#fb923c':'#60a5fa',marginLeft:4}}>{r.status==='sorti'?'SORTI':r.contract==='student'?'Ã‰TU':r.statut==='ouvrier'?'OUV':'EMPL'}</span></div><div style={{fontSize:10.5,color:'#5e5c56'}}>{r.niss} Â· {r.sexe==='F'?'â™€':'â™‚'}</div></div>
        </div>},
        {k:'f',l:"Fonction",r:r=><div>{r.fn}<div style={{fontSize:10.5,color:'#5e5c56'}}>{r.dept}</div></div>},
        {k:'c',l:"Contrat",r:r=><span style={{fontSize:12}}>{r.contract} Â· {r.whWeek}h</span>},
        {k:'cp',l:"CP",r:r=>r.cp},
        {k:'g',l:"Brut",a:'right',r:r=><span style={{fontWeight:600}}>{fmt(r.monthlySalary)}</span>},
        {k:'ne',l:"Net",a:'right',r:r=><span style={{fontWeight:600,color:'#4ade80'}}>{fmt(calc(r,DPER,s.co).net)}</span>},
        {k:'co',l:"CoÃ»t",a:'right',r:r=><span style={{color:'#a78bfa'}}>{fmt(calc(r,DPER,s.co).costTotal)}</span>},
        {k:'a',l:"",a:'right',r:r=><div style={{display:'flex',gap:5,justifyContent:'flex-end'}}>
          <B v="ghost" style={{padding:'4px 8px',fontSize:10}} onClick={e=>{e.stopPropagation();setF({...r});setEd(true);}}>âœŽ</B>
          <B v="danger" style={{padding:'4px 8px',fontSize:10}} onClick={e=>{e.stopPropagation();if(confirm('Supprimer ?'))d({type:"DEL_E",id:r.id});}}>âœ•</B>
        </div>},
      ]} data={filtered}/>
    </C>}
    {filtered.length===0&&search&&<div style={{textAlign:'center',padding:40,color:'#5e5c56',fontSize:13}}>Aucun employÃ© trouvÃ© pour "{search}"</div>}
  </div>;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  PAYSLIPS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function Payslips({s,d}) {
  const [eid,setEid]=useState(s.selectedEmpIdForPayslip||(s.emps||[])[0]?.id||'');
  const [per,setPer]=useState({...DPER});
  const [res,setRes]=useState(null);
  const [batchMode,setBatchMode]=useState(false);
  const [batchResults,setBatchResults]=useState([]);
  const [batchRunning,setBatchRunning]=useState(false);
  const emp=(s.emps||[]).find(e=>e.id===eid);
  // PrÃ©remplir Activation ONEM depuis la fiche employÃ© quand on change d'employÃ©
  useEffect(()=>{
    if(emp&&(emp.allocTravailType||'none')!=='none')
      setPer(prev=>({...prev,allocTravailType:emp.allocTravailType||prev.allocTravailType,allocTravail:emp.allocTravail||prev.allocTravail||0}));
  },[eid]);

  // â”€â”€ BATCH PROCESSING â”€â”€
  const runBatch=()=>{
    setBatchRunning(true);
    const ae=(s.emps||[]).filter(e=>e.status==='active'||!e.status);
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
    alert(`âœ… Batch terminÃ©: ${ok} fiches calculÃ©es${fail>0?`, ${fail} erreurs`:''}`);
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
    <PH title="Fiches de Paie" sub="Formule-clÃ© SPF Finances" actions={<div style={{display:'flex',gap:8}}>
      <B v={batchMode?'gold':'outline'} onClick={()=>setBatchMode(!batchMode)} style={{fontSize:11,padding:'8px 14px'}}>{batchMode?'âš¡ Mode Batch ON':'âš¡ Batch'}</B>
    </div>}/>
    <div style={{marginBottom:14,padding:'10px 14px',background:'linear-gradient(135deg,rgba(198,163,78,.06),rgba(198,163,78,.02))',border:'1px solid rgba(198,163,78,.1)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{fontSize:11,color:'#888'}}>âš¡ Auto-gÃ©nÃ©ration disponible</div>
      <button onClick={()=>{if(confirm('GÃ©nÃ©rer les fiches de paie pour tous les employÃ©s ?')){(s.emps||[]).forEach(e=>generatePayslipPDF(e,s.co));alert('âœ… Fiches gÃ©nÃ©rÃ©es')}}} style={{padding:'6px 14px',borderRadius:8,border:'none',background:'#c6a34e',color:'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>âš¡ GÃ©nÃ©rer tout</button>
    </div>
    {/* Batch Mode */}
    {batchMode&&<C style={{marginBottom:18,border:'1px solid rgba(198,163,78,.25)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <div style={{fontSize:15,fontWeight:600,color:'#c6a34e'}}>âš¡ Batch Processing â€” Calcul en masse</div>
          <div style={{fontSize:11,color:'#5e5c56',marginTop:2}}>Calcule toutes les fiches de paie des travailleurs actifs en 1 clic</div>
        </div>
        <B onClick={runBatch} disabled={batchRunning} style={{fontSize:13,padding:'12px 24px'}}>
          {batchRunning?'â³ Calcul en cours...':'âš¡ Lancer le batch ('+(s.emps||[]).filter(e=>e.status==='active'||!e.status).length+' fiches)'}
        </B>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
        <I label="Mois" value={per.month} onChange={v=>setPer({...per,month:parseInt(v)})} options={MN.map((m,i)=>({v:i+1,l:m}))}/>
        <I label="AnnÃ©e" type="number" value={per.year} onChange={v=>setPer({...per,year:v})}/>
        <div style={{padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,textAlign:'center'}}>
          <div style={{fontSize:10,color:'#9e9b93'}}>Travailleurs actifs</div>
          <div style={{fontSize:22,fontWeight:700,color:'#c6a34e'}}>{(s.emps||[]).filter(e=>e.status==='active'||!e.status).length}</div>
        </div>
      </div>
      {batchResults.length>0&&<div>
        <ST>RÃ©sultats du batch</ST>
        <div style={{maxHeight:300,overflowY:'auto'}}>
          {batchResults.map((br,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',borderRadius:6,marginBottom:4,background:br.ok?'rgba(74,222,128,.04)':'rgba(248,113,113,.04)',border:'1px solid '+(br.ok?'rgba(74,222,128,.1)':'rgba(248,113,113,.1)')}}>
            <span style={{fontSize:12,color:br.ok?'#4ade80':'#f87171'}}>{br.ok?'âœ…':'âŒ'} {br.emp.first} {br.emp.last}</span>
            {br.ok&&<span style={{fontSize:12,color:'#c6a34e',fontFamily:'monospace'}}>{fmt(br.r.gross)} brut â†’ {fmt(br.r.net)} net</span>}
            {!br.ok&&<span style={{fontSize:11,color:'#f87171'}}>{br.error}</span>}
          </div>)}
        </div>
        <div style={{marginTop:8,padding:10,background:'rgba(198,163,78,.06)',borderRadius:8,display:'flex',justifyContent:'space-between'}}>
          <span style={{fontSize:12,color:'#c6a34e',fontWeight:600}}>Total masse salariale</span>
          <span style={{fontSize:14,fontWeight:700,color:'#c6a34e'}}>{fmt(batchResults.filter(r=>r.ok).reduce((a,r)=>a+r.r.gross,0))} brut â†’ {fmt(batchResults.filter(r=>r.ok).reduce((a,r)=>a+r.r.net,0))} net</span>
        </div>
      </div>}
    </C>}
    <div style={{display:'grid',gridTemplateColumns:res?'360px 1fr':'1fr',gap:18}}>
      <C>
        <ST>ParamÃ¨tres</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          <I label="EmployÃ©" value={eid} onChange={setEid} options={(s.emps||[]).map(e=>({v:e.id,l:`${e.first||e.fn||'Emp'} ${e.last||''}`}))} span={2}/>
          <I label="Mois" value={per.month} onChange={v=>setPer({...per,month:parseInt(v)})} options={MN.map((m,i)=>({v:i+1,l:m}))}/>
          <I label="AnnÃ©e" type="number" value={per.year} onChange={v=>setPer({...per,year:v})}/>
          <I label="Jours prestÃ©s" type="number" value={per.days} onChange={v=>setPer({...per,days:v})}/>
          <I label="H. sup." type="number" value={per.overtimeH} onChange={v=>setPer({...per,overtimeH:v})}/>
          <I label="H. dimanche" type="number" value={per.sundayH} onChange={v=>setPer({...per,sundayH:v})}/>
          <I label="H. nuit" type="number" value={per.nightH} onChange={v=>setPer({...per,nightH:v})}/>
          <I label="Maladie (j garanti)" type="number" value={per.sickG} onChange={v=>setPer({...per,sickG:v})}/>
          <I label="Prime (â‚¬)" type="number" value={per.bonus} onChange={v=>setPer({...per,bonus:v})}/>
          <I label="13Ã¨me mois (â‚¬)" type="number" value={per.y13} onChange={v=>setPer({...per,y13:v})}/>
          <I label="Acompte (â‚¬)" type="number" value={per.advance} onChange={v=>setPer({...per,advance:v})}/>
          <I label="Saisie (â‚¬)" type="number" value={per.garnish} onChange={v=>setPer({...per,garnish:v})}/>
          <I label="PP volontaire (â‚¬)" type="number" value={per.ppVolontaire} onChange={v=>setPer({...per,ppVolontaire:v})}/>
          <I label="Autres ret. (â‚¬)" type="number" value={per.otherDed} onChange={v=>setPer({...per,otherDed:v})}/>
        </div>
        <ST style={{marginTop:14}}>Ã‰lÃ©ments fiscaux spÃ©ciaux</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          <I label="Double pÃ©cule vac. (â‚¬)" type="number" value={per.doublePecule} onChange={v=>setPer({...per,doublePecule:v})}/>
          <I label="PÃ©cule dÃ©part (â‚¬)" type="number" value={per.peculeDepart} onChange={v=>setPer({...per,peculeDepart:v})}/>
          <I label="Prime anciennetÃ© (â‚¬)" type="number" value={per.primeAnciennete} onChange={v=>setPer({...per,primeAnciennete:v})}/>
          <I label="Prime naissance/mariage (â‚¬)" type="number" value={per.primeNaissance} onChange={v=>setPer({...per,primeNaissance:v})}/>
          <I label="Prime innovation (â‚¬)" type="number" value={per.primeInnovation} onChange={v=>setPer({...per,primeInnovation:v})}/>
          <I label="Indem. tÃ©lÃ©travail (â‚¬)" type="number" value={per.indemTeletravail} onChange={v=>setPer({...per,indemTeletravail:v})}/>
          <I label="Indem. bureau (â‚¬)" type="number" value={per.indemBureau} onChange={v=>setPer({...per,indemBureau:v})}/>
          <I label="H.sup fiscales (180h)" type="number" value={per.heuresSupFisc} onChange={v=>setPer({...per,heuresSupFisc:v})}/>
          <I label="HS volont. brut=net (h)" type="number" value={per.hsVolontBrutNet} onChange={v=>setPer({...per,hsVolontBrutNet:v})}/>
          <I label="HS relance T1 (h)" type="number" value={per.hsRelance} onChange={v=>setPer({...per,hsRelance:v})}/>
          <I label="Pension compl. ret. (â‚¬)" type="number" value={per.pensionCompl} onChange={v=>setPer({...per,pensionCompl:v})}/>
          <I label="Cotis. syndicale (â‚¬)" type="number" value={per.retSyndicale} onChange={v=>setPer({...per,retSyndicale:v})}/>
          <I label="Pension aliment. (â‚¬)" type="number" value={per.saisieAlim} onChange={v=>setPer({...per,saisieAlim:v})}/>
          <I label="Type spÃ©cial" value={per.typeSpecial||'normal'} onChange={v=>setPer({...per,typeSpecial:v})} options={[{v:"normal",l:"Normal"},{v:"doublePecule",l:"Double pÃ©cule"},{v:"y13",l:"13Ã¨me mois"},{v:"depart",l:"Sortie de service"},{v:"preavis",l:"IndemnitÃ© de prÃ©avis"}]}/>
          <I label="Petit chÃ´mage (jours)" type="number" value={per.petitChomage} onChange={v=>setPer({...per,petitChomage:v})}/>
          <I label="Ã‰co-chÃ¨ques (â‚¬)" type="number" value={per.ecoCheques} onChange={v=>setPer({...per,ecoCheques:v})}/>
          <I label="Cadeaux/Ã©vÃ©nements (â‚¬)" type="number" value={per.cadeaux} onChange={v=>setPer({...per,cadeaux:v})}/>
          <I label="Budget mobilitÃ© P2 (â‚¬)" type="number" value={per.budgetMobP2} onChange={v=>setPer({...per,budgetMobP2:v})}/>
          <I label="Budget mobilitÃ© P3 (â‚¬)" type="number" value={per.budgetMobP3} onChange={v=>setPer({...per,budgetMobP3:v})}/>
          <I label="RÃ©d. trav. Ã¢gÃ© 55+ (â‚¬)" type="number" value={per.redGCAge} onChange={v=>setPer({...per,redGCAge:v})}/>
          <I label="RÃ©d. jeune <26 (â‚¬)" type="number" value={per.redGCJeune} onChange={v=>setPer({...per,redGCJeune:v})}/>
          <I label="RÃ©d. handicap (â‚¬)" type="number" value={per.redGCHandicap} onChange={v=>setPer({...per,redGCHandicap:v})}/>
          <I label="Activation ONEM" value={per.allocTravailType||emp?.allocTravailType||'none'} onChange={v=>setPer({...per,allocTravailType:v,allocTravail:0})} options={[{v:"none",l:"â€” Aucune â€”"},{v:"activa_bxl",l:"Activa.brussels (â‚¬350/m)"},{v:"activa_bxl_ap",l:"Activa.brussels AP (350â†’800â†’350)"},{v:"activa_jeune",l:"Activa Jeunes <30 (â‚¬350/m)"},{v:"impulsion_wal",l:"Impulsion Wallonie (â‚¬500/m)"},{v:"impulsion55",l:"Impulsion 55+ (â‚¬500/m)"},{v:"sine",l:"SINE Ã©con. sociale (â‚¬500/m)"},{v:"vdab",l:"VDAB (prime directe)"},{v:"art60",l:"Art. 60 Â§7 (1er emploi)"}]}/>
          {per.allocTravailType&&per.allocTravailType!=='none'&&<I label="Montant alloc. ONEM (â‚¬)" type="number" value={per.allocTravail} onChange={v=>setPer({...per,allocTravail:v})}/>}
        </div>
        <ST style={{marginTop:14}}>Mi-temps mÃ©dical / thÃ©rapeutique</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          <div style={{gridColumn:'1/-1'}}><div onClick={()=>setPer({...per,miTempsMed:!per.miTempsMed})} style={{padding:'10px 14px',borderRadius:8,cursor:'pointer',fontSize:12,
            background:per.miTempsMed?'rgba(251,146,60,.1)':'rgba(198,163,78,.04)',color:per.miTempsMed?'#fb923c':'#5e5c56',border:'1px solid '+(per.miTempsMed?'rgba(251,146,60,.25)':'rgba(198,163,78,.1)'),textAlign:'center',fontWeight:600}}>
            {per.miTempsMed?'âš• MI-TEMPS MÃ‰DICAL / THÃ‰RAPEUTIQUE â€” Reprise progressive INAMI (Art. 100Â§2)':'âŒ Pas de mi-temps mÃ©dical / thÃ©rapeutique'}
          </div></div>
          {per.miTempsMed&&<><I label="Heures/sem prestÃ©es" type="number" value={per.miTempsHeures} onChange={v=>setPer({...per,miTempsHeures:v})}/>
          <I label="ComplÃ©ment INAMI (â‚¬/mois)" type="number" value={per.miTempsINAMI} onChange={v=>setPer({...per,miTempsINAMI:v})}/>
          <div style={{gridColumn:'1/-1',padding:10,background:"rgba(96,165,250,.04)",borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.6}}>
            âš• <b>Reprise progressive</b> â€” Le travailleur preste {per.miTempsHeures||0}h/{emp?.whWeek||38}h = <b>{Math.round((per.miTempsHeures||0)/(emp?.whWeek||38)*100)}%</b>. L'employeur paie le salaire prorata. L'INAMI verse le complÃ©ment directement au travailleur via la mutuelle. Documents: C3.2 (mÃ©decin-conseil) + DRS (eBox).
          </div></>}
        </div>
        <B onClick={gen} style={{width:'100%',marginTop:14,padding:13,fontSize:13.5,letterSpacing:'.5px'}}>GÃ‰NÃ‰RER LA FICHE DE PAIE</B>
      </C>

      {res&&emp&&<div data-payslip style={{background:"#fffef9",borderRadius:14,padding:'32px 36px',color:'#1a1a18',fontFamily:"'Outfit',sans-serif",boxShadow:'0 4px 30px rgba(0,0,0,.3)'}}><div style={{textAlign:"right",marginBottom:12}}><button onClick={()=>generatePayslipPDF(emp,res,per,s.co)} style={{background:"#c6a34e",color:"#fff",border:"none",padding:"8px 20px",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:600}}>Imprimer / PDF</button></div>
        <div style={{display:'flex',justifyContent:'space-between',paddingBottom:18,borderBottom:'3px solid #c6a34e',marginBottom:22}}>
          <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700}}>{s.co.name}</div><div style={{fontSize:10.5,color:'#888',marginTop:2}}>{s.co.addr}</div><div style={{fontSize:10.5,color:'#888'}}>TVA: {s.co.vat} Â· BCE: {s.co.bce||s.co.vat?.replace(/^BE\s?/,"")||'â€”'} Â· ONSS: {s.co.onss}</div><div style={{fontSize:10.5,color:'#888'}}>CP: {emp.cp||s.co.cp||'200'} â€” {LEGAL.CP[emp.cp||s.co.cp||'200']||''}</div></div>
          <div style={{textAlign:'right'}}><div style={{fontSize:14,fontWeight:700,color:'#c6a34e',textTransform:'uppercase',letterSpacing:'2px'}}>Fiche de Paie</div><div style={{fontSize:12.5,color:'#888',marginTop:3}}>{MN[per.month-1]} {per.year}</div><div style={{fontSize:10,color:'#aaa',marginTop:2}}>PÃ©riode du 01/{String(per.month).padStart(2,"0")}/{per.year} au {new Date(per.year,per.month,0).getDate()}/{String(per.month).padStart(2,"0")}/{per.year}</div><div style={{fontSize:10,color:'#aaa'}}>Date de paiement: dernier jour ouvrable du mois</div></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:20,padding:14,background:"#f5f4ef",borderRadius:8}}>
          <div><div style={{fontSize:9.5,color:'#aaa',textTransform:'uppercase',letterSpacing:'1px',marginBottom:3}}>Travailleur</div><div style={{fontWeight:600,fontSize:13.5}}>{emp.first} {emp.last}</div><div style={{fontSize:10.5,color:'#666'}}>{emp.fn} â€” {emp.dept}</div><div style={{fontSize:10.5,color:'#666'}}>NISS: {emp.niss}{emp.birth?` Â· NÃ©(e) le ${emp.birth}`:''}</div><div style={{fontSize:10.5,color:'#666'}}>{emp.addr?`${emp.addr}, ${emp.zip||''} ${emp.city||''}`:''}</div></div>
          <div><div style={{fontSize:9.5,color:'#aaa',textTransform:'uppercase',letterSpacing:'1px',marginBottom:3}}>Contrat & BarÃ¨me</div><div style={{fontSize:10.5,color:'#555'}}>{emp.contract} Â· CP {emp.cp} Â· {emp.whWeek}h/sem Â· {emp.statut==='ouvrier'?'Ouvrier':'EmployÃ©'}</div><div style={{fontSize:10.5,color:'#555'}}>EntrÃ©e: {emp.startD} Â· AnciennetÃ©: {emp.anciennete||0} an(s)</div><div style={{fontSize:10.5,color:'#555'}}>Sit: {emp.civil==='single'?'IsolÃ©':emp.civil==='married_1'?'MariÃ© (1 revenu)':emp.civil==='married_2'?'MariÃ© (2 revenus)':emp.civil==='cohabit'?'Cohabitant':emp.civil==='widowed'?'Veuf/ve':emp.civil}{emp.depChildren>0?` Â· ${emp.depChildren} enfant(s)`:''}</div><div style={{fontSize:10.5,color:'#555'}}>BarÃ¨me: {fmt(emp.monthlySalary)}/mois Â· {fmt(Math.round((emp.monthlySalary||0)/(emp.whWeek||38)/4.33*100)/100)}/h Â· {per.days||0}j / {Math.round((per.days||0)*(emp.whWeek||38)/5*100)/100}h prestÃ©es</div>
            {emp.frontalier&&<div style={{fontSize:10.5,color:'#a855f7',fontWeight:600}}>ðŸŒ Frontalier â€” RÃ©side: {emp.frontalierPays==='FR'?'France':emp.frontalierPays==='NL'?'Pays-Bas':emp.frontalierPays==='DE'?'Allemagne':emp.frontalierPays==='LU'?'Luxembourg':emp.frontalierPays} Â· ONSS: Belgique Â· PP: {emp.frontalierExoPP?'ExonÃ©rÃ© (276 Front.)':'Retenu en Belgique'}</div>}
            {emp.pensionnÃ©&&<div style={{fontSize:10.5,color:'#fbbf24',fontWeight:600}}>ðŸ‘´ PensionnÃ© ({emp.pensionType==='legal'?'pension lÃ©gale':emp.pensionType==='anticipee'?'pension anticipÃ©e':emp.pensionType==='survie'?'pension de survie':'pension invaliditÃ©'}) â€” Cumul: {res.pensionCumulIllimite?'ILLIMITÃ‰':'LIMITÃ‰ (plafond '+fmt(res.pensionPlafond)+'/an)'}{res.pensionDepassement?' âš  DÃ‰PASSEMENT ESTIMÃ‰: '+res.pensionDepassPct+'%':''}</div>}
          </div>
        </div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr style={{borderBottom:'2px solid #c6a34e'}}><th style={{textAlign:'left',padding:'7px 0',fontSize:9.5,textTransform:'uppercase',letterSpacing:'1px',color:'#999'}}>Description</th><th style={{textAlign:'right',padding:'7px 0',fontSize:9.5,textTransform:'uppercase',letterSpacing:'1px',color:'#999'}}>Taux</th><th style={{textAlign:'right',padding:'7px 0',fontSize:9.5,textTransform:'uppercase',letterSpacing:'1px',color:'#999'}}>Montant</th></tr></thead>
          <tbody>
            <PS t="RÃ©munÃ©ration brute"/>
            {res.isFlexiJob&&<tr><td colSpan={3} style={{padding:'6px 0 8px',fontSize:11,color:'#4ade80',fontWeight:600,background:"rgba(74,222,128,.05)",borderRadius:4}}>ðŸ”„ FLEXI-JOB â€” Loi 16/11/2015 Â· Net = Brut Â· ONSS trav. 0% Â· PP 0% Â· ONSS empl. 28%</td></tr>}
            {res.isFlexiJob&&<><PR l={`Flexi-salaire (${res.flexiHeures}h Ã— ${fmt(res.flexiSalaireH)}/h)`} a={res.flexiBrut}/>
              <PR l="Flexi-pÃ©cule vacances (7,67%)" a={res.flexiPecule} pos/>
              <PR l="TOTAL FLEXI BRUT" a={res.gross} bold/>
              <PS t="Cotisations"/>
              <PR l="ONSS travailleur" rate="0%" a={0}/>
              <PR l="PrÃ©compte professionnel" rate="0%" a={0}/>
              <PR l="Cotisation spÃ©ciale SS" rate="0%" a={0}/>
              <PS t="CoÃ»t employeur"/>
              <PR l="ONSS patronal spÃ©cial (28%)" a={-res.flexiOnssPatronal} neg/>
            </>}
            {!res.isFlexiJob&&<>
            {res.miTempsMed&&<tr><td colSpan={3} style={{padding:'6px 0 8px',fontSize:11,color:'#fb923c',fontWeight:600,background:"rgba(251,146,60,.05)",borderRadius:4}}>âš• REPRISE PROGRESSIVE â€” Mi-temps mÃ©dical / thÃ©rapeutique (Art. 100Â§2 Loi coord. 14/07/1994) â€” Fraction: {Math.round(res.miTempsFraction*100)}% ({res.miTempsHeures}h/{emp.whWeek||38}h)</td></tr>}
            <PR l="Salaire de base" a={res.base}/>
            {res.miTempsMed&&<PR l={`  â”” Brut normal: ${fmt(res.miTempsBrutOriginal)} Ã— ${Math.round(res.miTempsFraction*100)}% prorata`} a={res.base} sub/>}
            {res.overtime>0&&<PR l="Heures sup. (150%)" rate={`${per.overtimeH}h`} a={res.overtime}/>}
            {res.sunday>0&&<PR l="Dimanche (200%)" rate={`${per.sundayH}h`} a={res.sunday}/>}
            {res.night>0&&<PR l="Nuit (125%)" rate={`${per.nightH}h`} a={res.night}/>}
            {res.bonus>0&&<PR l="Prime" a={res.bonus}/>}
            {res.y13>0&&<PR l="Prime fin d'annÃ©e" a={res.y13}/>}
            {res.sickPay>0&&<PR l="Salaire garanti maladie" a={res.sickPay}/>}
            <PR l="TOTAL BRUT" a={res.gross} bold/>
            {emp.statut==='ouvrier'&&<>
              <tr><td colSpan={3} style={{padding:'4px 0 2px',fontSize:10,color:'#fb923c',fontStyle:'italic'}}>
                Ouvrier â€” Base ONSS = brut Ã— 108% = {fmt(res.gross)} Ã— 1,08 = <b>{fmt(res.gross*TX_OUV108)}</b> (compensation pÃ©cule vacances simple â€” Art. 23 AR 28/11/1969)
              </td></tr>
              {res.cotisVacOuv>0&&<PR l={`Cotisation vacances ouvrier (15,84% sur brut 108%)`} a={-res.cotisVacOuv} neg/>}
            </>}
            {res.atnCar>0&&<><PS t="Avantage de toute nature (ATN)"/>
            <PR l={`ATN voiture de sociÃ©tÃ© (${emp.carBrand||''} ${emp.carModel||''} â€” ${emp.carCO2||0}g CO2)`} rate={`${(res.atnPct||0).toFixed(1)}%`} a={res.atnCar}/>
            <PR l="ATN ajoutÃ© au revenu imposable" a={res.atnCar} sub/></>}
            {(res.atnAutresTot>0&&!res.atnCar)&&<PS t="Avantages de toute nature (ATN)"/>}
            {res.atnGSM>0&&<PR l="ATN GSM/TÃ©lÃ©phone (forfait 36â‚¬/an)" a={res.atnGSM}/>}
            {res.atnPC>0&&<PR l="ATN PC/Tablette (forfait 72â‚¬/an)" a={res.atnPC}/>}
            {res.atnInternet>0&&<PR l="ATN Internet privÃ© (forfait 60â‚¬/an)" a={res.atnInternet}/>}
            {res.atnLogement>0&&<PR l="ATN Logement gratuit (RC Ã— coeff.)" a={res.atnLogement}/>}
            {res.atnChauffage>0&&<PR l="ATN Chauffage gratuit (2.130â‚¬/an)" a={res.atnChauffage}/>}
            {res.atnElec>0&&<PR l="ATN Ã‰lectricitÃ© gratuite (1.060â‚¬/an)" a={res.atnElec}/>}
            {res.veloSociete&&<PR l={`ðŸš² VÃ©lo de sociÃ©tÃ© (${res.veloType}) â€” ATN = 0â‚¬ (Art.38Â§1er 14Â°a â€” exonÃ©rÃ©)`} a={0}/>}
            {res.atnCarteCarburant>0&&<PR l="ATN Carte carburant (sans voiture soc. â€” imposable)" a={res.atnCarteCarburant}/>}
            {res.atnBorne>0&&<PR l="ATN Borne recharge domicile (sans voiture soc.)" a={res.atnBorne}/>}
            {res.atnAutresTot>0&&<PR l="Total ATN autres (ajoutÃ© au revenu imposable)" a={res.atnAutresTot} sub/>}
            <PS t="Cotisations ONSS"/>
            <PR l={`ONSS travailleur (${fmtP(LEGAL.ONSS_W)} sur ${emp.statut==='ouvrier'?'brut 108% = '+fmt(res.gross*TX_OUV108):'brut '+fmt(res.gross)})`} rate={fmtP(LEGAL.ONSS_W)} a={-res.onssW} neg/>
            {res.empBonus>0&&<PR l={`Bonus Ã  l'emploi social (rÃ©duction ONSS bas salaires â€” AR 21/12/2017)`} a={res.empBonus} pos/>}
            {res.empBonusA>0&&<PR l={`  â”” Volet A (bas salaires): ${fmt(res.empBonusA)}`} a={res.empBonusA} pos sub/>}
            {res.empBonusB>0&&<PR l={`  â”” Volet B (trÃ¨s bas salaires): ${fmt(res.empBonusB)}`} a={res.empBonusB} pos sub/>}
            <PR l={`ONSS net Ã  retenir (${fmt(res.onssW)} âˆ’ ${fmt(res.empBonus)} bonus)`} a={-res.onssNet} bold neg/>
            {res.redStructMois>0&&<PR l={`RÃ©duction structurelle patronale (Cat ${res.redStructCat}${res.redStructFraction<1?' Ã— '+Math.round(res.redStructFraction*100)+'% TP':''})`} a={res.redStructMois} pos/>}
            {res.empBonusFisc>0&&<PR l={`Bonus emploi fiscal (rÃ©duction PP: volet A ${fmtP(0.3314)} + volet B ${fmtP(0.5254)})`} a={res.empBonusFisc} pos/>}
            <PS t="FiscalitÃ© (Formule-clÃ© SPF)"/>
            <PR l="Revenu imposable" a={res.taxGross} sub/>
            <PR l="Frais prof. forfaitaires" a={-res.profExp} sub/>
            <PR l="Base taxable" a={res.taxNet} sub/>
            <PR l="ImpÃ´t (barÃ¨me progressif)" a={-res.baseTax} neg/>
            {res.famRed>0&&<PR l="RÃ©ductions familiales (Art.132-140 CIR)" a={res.famRed} pos/>}
            <PR l="PrÃ©compte professionnel" a={-res.tax} bold neg/>
            {res.ppVolontaire>0&&<PR l="PrÃ©compte volontaire (Art. 275Â§1 CIR 92 â€” demande Ã©crite travailleur)" a={-res.ppVolontaire} neg/>}
            <PR l="Cotisation spÃ©ciale SS" a={-res.css} neg/>
            <PS t="Retenues & Avantages"/>
            {res.mvWorker>0&&<PR l={`ChÃ¨ques repas (${res.mvDays}j)`} a={-res.mvWorker} neg/>}
            {res.transport>0&&<PR l={`Transport dom.-travail (${res.transportDetail||emp.commType})`} a={res.transport} pos/>}
            {res.transport>0&&emp.commType==='bike'&&<tr><td colSpan={3} style={{padding:'2px 0 6px',fontSize:9.5,color:'#4ade80',fontStyle:'italic'}}>ðŸš² Total: {((emp.commDist||0)*2*(per.days||21))} km/mois ({emp.commDist} km Ã— 2 A/R Ã— {per.days||21} jours) â€” ExonÃ©rÃ© ONSS et IPP (Art. 38Â§1er 14Â° CIR)</td></tr>}
            {res.expense>0&&<PR l="Frais propres employeur" a={res.expense} pos/>}
            {res.indemTeletravail>0&&<PR l="IndemnitÃ© tÃ©lÃ©travail (exonÃ©rÃ©e â€” max 154,74â‚¬)" a={res.indemTeletravail} pos/>}
            {res.indemBureau>0&&<PR l="IndemnitÃ© frais de bureau (exonÃ©rÃ©e)" a={res.indemBureau} pos/>}
            {res.garnish>0&&<PR l="Saisie sur salaire" a={-res.garnish} neg/>}
            {res.saisieAlim>0&&<PR l="Pension alimentaire (prioritaire â€” Art.1409 C.jud.)" a={-res.saisieAlim} neg/>}
            {res.advance>0&&<PR l="Acompte" a={-res.advance} neg/>}
            {res.pensionCompl>0&&<PR l="Retenue pension complÃ©mentaire (2Ã¨ pilier â€” LPC)" a={-res.pensionCompl} neg/>}
            {res.retSyndicale>0&&<PR l="Cotisation syndicale" a={-res.retSyndicale} neg/>}
            {res.otherDed>0&&<PR l="Autres retenues" a={-res.otherDed} neg/>}
            {res.atnCar>0&&<PR l="ATN voiture (dÃ©duit du net)" a={-res.atnCar} neg/>}
            {res.atnAutresTot>0&&<PR l="ATN autres (dÃ©duit du net)" a={-res.atnAutresTot} neg/>}
            {(res.doublePecule>0||res.peculeDepart>0||res.primeAnciennete>0||res.primeNaissance>0||res.primeInnovation>0)&&<PS t="Ã‰lÃ©ments exceptionnels"/>}
            {res.doublePecule>0&&<><PR l="Double pÃ©cule vacances (92% brut)" a={res.doublePecule} pos/>
              <PR l="  â”” ONSS sur 2Ã¨me partie (7% Ã— 13,07%)" a={-res.dpOnss} neg sub/>
              <PR l="  â”” Cotisation spÃ©ciale 1%" a={-res.dpCotisSpec} neg sub/></>}
            {res.peculeDepart>0&&<><PR l="PÃ©cule vacances de dÃ©part (Art.46)" a={res.peculeDepart} pos/>
              <PR l="  â”” ONSS 13,07% sur pÃ©cule dÃ©part" a={-res.pdOnss} neg sub/></>}
            {res.primeAnciennete>0&&<><PR l={`Prime anciennetÃ© (${emp.anciennete||0} ans)`} a={res.primeAnciennete}/>
              {res.primeAncExoneree>0&&<PR l="  â”” Dont exonÃ©rÃ© ONSS+IPP (Art.19Â§2 14Â°)" a={res.primeAncExoneree} pos sub/>}
              {res.primeAncTaxable>0&&<PR l="  â”” Dont taxable" a={res.primeAncTaxable} sub/>}</>}
            {res.primeNaissance>0&&<PR l="Prime naissance/mariage (avantage social â€” exo)" a={res.primeNaissance} pos/>}
            {res.primeInnovation>0&&<PR l="Prime innovation (Art.38Â§1er 25Â° CIR â€” exo IPP)" a={res.primeInnovation} pos/>}
            {res.redPPHeuresSup>0&&<PS t="RÃ©ductions fiscales"/>}
            {res.redPPHeuresSup>0&&<PR l={`RÃ©d. PP heures sup. (${res.heuresSupFisc}h Ã— 66,81% â€” Art.154bis)`} a={res.redPPHeuresSup} pos/>}
            {res.ppTauxExcep>0&&<PR l={`PP taux exceptionnel ${(res.ppTauxExcepRate*100).toFixed(2)}% (AR 09/01/2024 ann.III)`} a={-res.ppTauxExcep} neg/>}
            {res.petitChomageVal>0&&<><PS t="Absences rÃ©munÃ©rÃ©es"/>
              <PR l={`Petit chÃ´mage / CongÃ© circonstanciel (${res.petitChomage}j â€” AR 28/08/1963)`} a={res.petitChomageVal} pos/></>}
            {(res.ecoCheques>0||res.cadeaux>0||res.budgetMobPilier2>0)&&<PS t="Avantages exonÃ©rÃ©s"/>}
            {res.ecoCheques>0&&<PR l="Ã‰co-chÃ¨ques (CCT 98 â€” max 250â‚¬/an â€” exo ONSS+IPP)" a={res.ecoCheques} pos/>}
            {res.cadeaux>0&&<PR l="Cadeaux/Ã©vÃ©nements (exo si â‰¤ plafond â€” Circ. ONSS)" a={res.cadeaux} pos/>}
            {res.budgetMobPilier2>0&&<PR l="Budget mobilitÃ© â€” Pilier 2 (mobilitÃ© durable â€” exo)" a={res.budgetMobPilier2} pos/>}
            {res.hsBrutNetTotal>0&&<><PS t="Heures supplÃ©mentaires brut=net (01/04/2026)"/>
              {res.hsVolontBrutNet>0&&<PR l={`HS volontaires brut=net (${per.hsVolontBrutNet||0}h Ã— ${fmt(res.hsVolontBrutNet/(per.hsVolontBrutNet||1))}/h â€” exo ONSS+PP)`} a={res.hsVolontBrutNet} pos/>}
              {res.hsRelance>0&&<PR l={`HS relance transitoire T1 (${per.hsRelance||0}h â€” brut=net â€” dÃ©duit quota 240h)`} a={res.hsRelance} pos/>}
              <tr><td colSpan={3} style={{padding:'4px 0 6px',fontSize:10,color:'#4ade80',fontStyle:'italic'}}>
                Nouveau rÃ©gime: max 360h/an (450h horeca). 240h brut=net. Pas de sursalaire. Accord Ã©crit 1 an requis.
              </td></tr></>}
            {res.budgetMobPilier3>0&&<><PR l="Budget mobilitÃ© â€” Pilier 3 (cash)" a={res.budgetMobPilier3}/>
              <PR l="  â”” Cotisation spÃ©ciale 38,07% (Loi 17/03/2019)" a={-res.budgetMobCotis38} neg sub/></>}
            {res.allocTravail>0&&<><PS t="Activation ONEM"/>
              <PR l={`Allocation de travail ${res.allocTravailLabel} (AR 19/12/2001)`} a={-res.allocTravail} neg/>
              <tr><td colSpan={3} style={{padding:'4px 0 8px',fontSize:10,color:'#60a5fa',fontStyle:'italic',lineHeight:1.5}}>
                â†’ DÃ©duit du salaire net. Le travailleur reÃ§oit {fmt(res.allocTravail)}/mois directement de l'ONEM via CAPAC/syndicat.<br/>
                â†’ RÃ©munÃ©ration totale travailleur inchangÃ©e: {fmt(res.net)} (employeur) + {fmt(res.allocTravail)} (ONEM) = {fmt(res.net+res.allocTravail)}<br/>
                â†’ L'allocation n'est PAS soumise Ã  l'ONSS (pas de rÃ©munÃ©ration). Le PP est retenu par l'ONEM (10,09%).<br/>
                â†’ L'employeur ne dÃ©clare PAS l'allocation en DmfA. Formulaire: C78 (ONEM) + carte Activa/attestation FOREM.
              </td></tr></>}
            </>}
            <tr style={{borderTop:'3px solid #c6a34e'}}><td style={{padding:'14px 0',fontWeight:800,fontSize:15}}>NET Ã€ PAYER</td><td></td><td style={{textAlign:'right',padding:'14px 0',fontWeight:800,fontSize:18,color:'#16a34a'}}>{fmt(res.net)}</td></tr>
            {res.miTempsMed&&<><tr style={{background:"rgba(251,146,60,.04)"}}><td colSpan={3} style={{padding:'10px 0 4px'}}>
              <div style={{fontSize:11,fontWeight:700,color:'#fb923c'}}>âš• POUR MÃ‰MOIRE â€” ComplÃ©ment INAMI (hors fiche de paie)</div>
            </td></tr>
            <PR l={`IndemnitÃ©s INAMI mutuelle (${Math.round((1-res.miTempsFraction)*100)}% non prestÃ©)`} a={res.miTempsINAMI}/>
            <tr><td style={{padding:'6px 0',fontWeight:700,fontSize:13}}>REVENU TOTAL TRAVAILLEUR</td><td></td><td style={{textAlign:'right',padding:'6px 0',fontWeight:700,fontSize:14,color:'#c6a34e'}}>{fmt(res.net + res.miTempsINAMI)}</td></tr>
            <tr><td colSpan={3} style={{padding:'4px 0 8px',fontSize:9.5,color:'#999',fontStyle:'italic'}}>Le complÃ©ment INAMI est versÃ© directement par la mutuelle au travailleur. Il n'est pas soumis Ã  l'ONSS. Le PP est retenu Ã  la source par la mutuelle (11,11%). Le travailleur conserve son contrat Ã  temps plein.</td></tr></>}
          </tbody>
        </table>
        {/* CUMUL ANNUEL YTD (AR 27/09/1966 Art.9 â€” mention obligatoire) */}
        <div style={{marginTop:14,padding:12,background:"#f5f4ef",borderRadius:8}}>
          <div style={{fontSize:9.5,color:'#aaa',textTransform:'uppercase',letterSpacing:'1px',fontWeight:600,marginBottom:8}}>Cumul annuel (YTD â€” Janvier Ã  {MN[per.month-1]} {per.year})</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8}}>
            {[
              {l:"Brut cumulÃ©",v:res.gross*per.month},
              {l:"ONSS cumulÃ©",v:res.onssNet*per.month},
              {l:"PP cumulÃ©",v:res.tax*per.month},
              {l:"CSS cumulÃ©",v:res.css*per.month},
              {l:"Net cumulÃ©",v:res.net*per.month,c:'#16a34a'},
              {l:"CoÃ»t empl. cumulÃ©",v:res.costTotal*per.month,c:'#c6a34e'},
            ].map((x,i)=><div key={i} style={{textAlign:'center'}}>
              <div style={{fontSize:8.5,color:'#999'}}>{x.l}</div>
              <div style={{fontSize:11.5,fontWeight:600,color:x.c||'#555',marginTop:2}}>{fmt(x.v)}</div>
            </div>)}
          </div>
          <div style={{fontSize:8,color:'#bbb',marginTop:6,fontStyle:'italic'}}>* Estimation basÃ©e sur le salaire du mois courant Ã— {per.month} mois. Les cumuls rÃ©els seront calculÃ©s sur base de l'historique des fiches.</div>
        </div>
        {/* COMPTEURS CONGÃ‰S & HEURES (Loi 28/06/1971 + CCT) */}
        <div style={{marginTop:10,padding:12,background:"#f5f4ef",borderRadius:8,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
          {[
            {l:"CongÃ©s lÃ©gaux",v:`${20-Math.min(per.month*2,20)}j restants`,s:`Total: 20j/an (employÃ© TP)`},
            {l:"Heures sup. rÃ©cup.",v:`${(per.overtimeH||0)}h ce mois`,s:'RÃ©cupÃ©rables dans les 3 mois'},
            {l:"Jours maladie",v:`${per.sickG||0}j ce mois`,s:'Sal. garanti: 30j (employÃ©) / 7+7+14j (ouvrier)'},
            {l:"CrÃ©dit-temps",v:"â€”",s:'Non activÃ©'},
          ].map((x,i)=><div key={i} style={{textAlign:'center'}}>
            <div style={{fontSize:8.5,color:'#999'}}>{x.l}</div>
            <div style={{fontSize:11,fontWeight:600,color:'#555',marginTop:2}}>{x.v}</div>
            <div style={{fontSize:7.5,color:'#bbb',marginTop:1}}>{x.s}</div>
          </div>)}
        </div>
        {/* PÃ‰CULE VACANCES & 13ÃˆME MOIS â€” Estimations annuelles */}
        <div style={{marginTop:10,padding:12,background:"#f8f7f2",borderRadius:8,border:'1px solid rgba(198,163,78,.1)'}}>
          <div style={{fontSize:9,color:'#c6a34e',textTransform:'uppercase',letterSpacing:'1px',fontWeight:600,marginBottom:8}}>Estimations annuelles â€” PÃ©cule vacances & 13Ã¨me mois</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div>
              <div style={{fontSize:9.5,fontWeight:600,color:'#555',marginBottom:4}}>ðŸ– PÃ©cule de vacances ({res.peculeVacCalc?.type==='ouvrier'?'Ouvrier â€” ONVA':'EmployÃ© â€” Employeur'})</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,fontSize:9.5,color:'#777'}}>
                <span>Simple:</span><span style={{fontWeight:600,textAlign:'right'}}>{fmt(res.peculeVacCalc?.simple||0)}</span>
                <span>Double (92%):</span><span style={{fontWeight:600,textAlign:'right'}}>{fmt(res.peculeVacCalc?.double||0)}</span>
                <span>ONSS 2Ã¨ partie:</span><span style={{fontWeight:600,textAlign:'right',color:'#f87171'}}>-{fmt(res.peculeVacCalc?.onss2emePartie||0)}</span>
                <span>PP exceptionnel:</span><span style={{fontWeight:600,textAlign:'right',color:'#f87171'}}>-{fmt(res.peculeVacCalc?.ppExcep||0)} ({Math.round((res.peculeVacCalc?.ppExcepRate||0)*100)}%)</span>
                <span style={{borderTop:'1px solid #ddd',paddingTop:3}}>Total estimÃ©:</span><span style={{fontWeight:700,textAlign:'right',color:'#16a34a',borderTop:'1px solid #ddd',paddingTop:3}}>{fmt(res.peculeVacCalc?.total||0)}</span>
              </div>
              <div style={{fontSize:8,color:'#aaa',marginTop:4}}>Paiement: {res.peculeVacCalc?.moisPaiement}</div>
            </div>
            <div>
              <div style={{fontSize:9.5,fontWeight:600,color:'#555',marginBottom:4}}>ðŸŽ„ Prime de fin d'annÃ©e (13Ã¨me mois)</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,fontSize:9.5,color:'#777'}}>
                <span>Brut:</span><span style={{fontWeight:600,textAlign:'right'}}>{fmt(res.y13Calc?.montant||0)}</span>
                <span>ONSS (13,07%):</span><span style={{fontWeight:600,textAlign:'right',color:'#f87171'}}>-{fmt(res.y13Calc?.onss||0)}</span>
                <span>PP exceptionnel:</span><span style={{fontWeight:600,textAlign:'right',color:'#f87171'}}>-{fmt(res.y13Calc?.ppExcep||0)} ({Math.round((res.y13Calc?.ppExcepRate||0)*100)}%)</span>
                <span style={{borderTop:'1px solid #ddd',paddingTop:3}}>Net estimÃ©:</span><span style={{fontWeight:700,textAlign:'right',color:'#16a34a',borderTop:'1px solid #ddd',paddingTop:3}}>{fmt(res.y13Calc?.netEstime||0)}</span>
              </div>
              <div style={{fontSize:8,color:'#aaa',marginTop:4}}>{res.y13Calc?.methode} Â· Paiement: {res.y13Calc?.moisPaiement}</div>
            </div>
          </div>
        </div>
        <div style={{marginTop:18,padding:14,background:"#f0efea",borderRadius:8,display:'grid',gridTemplateColumns:res.atnCar>0?'repeat(5,1fr)':'repeat(4,1fr)',gap:10}}>
          {[{l:"Brut",v:res.gross},{l:`ONSS empl. (${(res.onssE_rate*100).toFixed(0)}%)`,v:res.onssE},...(res.cotisVacOuv>0?[{l:"Cot. vac. ouvrier (15,84%)",v:res.cotisVacOuv}]:[]),...(res.atnCar>0?[{l:"Cot. CO2",v:res.cotCO2}]:[]),...(res.pensionComplEmpl>0?[{l:"Pension compl. empl.",v:res.pensionComplEmpl}]:[]),...(res.ecoCheques>0?[{l:"Ã‰co-chÃ¨ques",v:res.ecoCheques}]:[]),...(res.dispensePPTotal>0?[{l:"Dispense PP (nuit/HS)",v:-res.dispensePPTotal}]:[]),...(res.redGCPremier>0?[{l:`RÃ©d. ${res.redGCPremierLabel||'1er eng.'} (Art.336 LP)`,v:-res.redGCPremier}]:[]),...(res.redGCAge>0?[{l:"RÃ©d. trav. Ã¢gÃ© 55+",v:-res.redGCAge}]:[]),...(res.redGCJeune>0?[{l:"RÃ©d. jeune <26",v:-res.redGCJeune}]:[]),...(res.redGCHandicap>0?[{l:"RÃ©d. handicap",v:-res.redGCHandicap}]:[]),...(res.allocTravail>0?[{l:`Alloc. ONEM ${res.allocTravailLabel}`,v:-res.allocTravail}]:[]),{l:"Avantages",v:res.mvEmployer+res.expense+res.transport+res.indemTeletravail+res.indemBureau},{l:"COÃ›T TOTAL",v:res.costTotal,g:1}].map((x,i)=>
            <div key={i} style={{textAlign:'center'}}><div style={{fontSize:9.5,color:'#999',textTransform:'uppercase'}}>{x.l}</div><div style={{fontSize:13,fontWeight:x.g?800:600,marginTop:3,color:x.g?'#c6a34e':'#333'}}>{fmt(x.v)}</div></div>
          )}
        </div>
        <div style={{marginTop:10,fontSize:10.5,color:'#bbb'}}>Versement: {emp.iban}</div>
        {/* CONDITIONS GÃ‰NÃ‰RALES INSTITUTIONNELLES */}
        <div className="no-print" style={{marginTop:18,paddingTop:14,borderTop:'1px solid #e0dfda'}}>
          <div style={{fontSize:8.5,color:'#bbb',textTransform:'uppercase',letterSpacing:'1.5px',fontWeight:600,marginBottom:8}}>Conditions gÃ©nÃ©rales</div>
          <div style={{fontSize:8,color:'#aaa',lineHeight:1.7,columnCount:2,columnGap:20}}>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>1. ConfidentialitÃ©</b> â€” La prÃ©sente fiche de paie est un document strictement confidentiel destinÃ© exclusivement au travailleur mentionnÃ© ci-dessus. Toute reproduction, diffusion ou communication Ã  des tiers est interdite sauf accord Ã©crit de l'employeur.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>2. Base lÃ©gale</b> â€” Ce document est Ã©tabli conformÃ©ment Ã  la loi du 12 avril 1965 concernant la protection de la rÃ©munÃ©ration des travailleurs et Ã  l'arrÃªtÃ© royal du 27 septembre 1966 dÃ©terminant les mentions obligatoires du dÃ©compte de rÃ©munÃ©ration.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>3. Calculs</b> â€” Les retenues ONSS sont effectuÃ©es conformÃ©ment Ã  la loi du 29 juin 1981. Le prÃ©compte professionnel est calculÃ© selon la formule-clÃ© du SPF Finances (annexe III AR/CIR 92). La cotisation spÃ©ciale de sÃ©curitÃ© sociale est Ã©tablie conformÃ©ment Ã  la loi du 30 mars 1994.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>4. Contestation</b> â€” Toute contestation relative au prÃ©sent dÃ©compte doit Ãªtre adressÃ©e par Ã©crit Ã  l'employeur dans un dÃ©lai d'un mois Ã  compter de la date de rÃ©ception. PassÃ© ce dÃ©lai, le dÃ©compte est rÃ©putÃ© acceptÃ©, sans prÃ©judice du droit de rÃ©clamation lÃ©gal.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>5. Conservation</b> â€” Le travailleur est tenu de conserver ce document pendant une durÃ©e minimale de 5 ans. Ce document peut Ãªtre requis pour l'Ã©tablissement de la dÃ©claration fiscale (IPP) et pour toute dÃ©marche administrative (chÃ´mage, pension, crÃ©dit).</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>6. DonnÃ©es personnelles</b> â€” Le traitement des donnÃ©es Ã  caractÃ¨re personnel figurant sur ce document est effectuÃ© conformÃ©ment au RÃ¨glement (UE) 2016/679 (RGPD). Les donnÃ©es sont traitÃ©es aux seules fins de gestion salariale, dÃ©clarations sociales et fiscales. Le travailleur dispose d'un droit d'accÃ¨s, de rectification et de suppression de ses donnÃ©es (art. 15-17 RGPD).</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>7. BarÃ¨mes</b> â€” Les rÃ©munÃ©rations sont conformes aux barÃ¨mes sectoriels en vigueur de la commission paritaire applicable (CP {emp.cp||s.co.cp||'200'}), tels que publiÃ©s par le SPF Emploi, Travail et Concertation sociale.</p>
            <p style={{margin:'0 0 4px'}}><b style={{color:'#999'}}>8. Paiement</b> â€” Le salaire net est versÃ© par virement bancaire sur le compte communiquÃ© par le travailleur, au plus tard le dernier jour ouvrable du mois en cours, conformÃ©ment Ã  l'art. 5 de la loi du 12/04/1965.</p>
          </div>
          <div style={{marginTop:10,paddingTop:8,borderTop:'1px solid #eee',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:7.5,color:'#ccc'}}>{s.co.name} Â· {s.co.vat} Â· {s.co.addr} Â· SecrÃ©tariat social: Aureus Social Pro</div>
            <div style={{fontSize:7.5,color:'#ccc'}}>Document gÃ©nÃ©rÃ© le {new Date().toLocaleDateString('fr-BE')} Â· Page 1/1</div>
          </div>
        </div>

        {/* TABLEAU RÃ‰CAPITULATIF SOUMISSION ONSS / PP PAR Ã‰LÃ‰MENT */}
        <div className="no-print" style={{marginTop:18,padding:14,background:"#f0efea",borderRadius:8}}>
          <div style={{fontSize:9.5,color:'#999',textTransform:'uppercase',letterSpacing:'1px',fontWeight:600,marginBottom:10}}>RÃ©capitulatif soumission ONSS & PrÃ©compte professionnel</div>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10.5}}>
            <thead><tr style={{borderBottom:'2px solid #c6a34e'}}>
              <th style={{textAlign:'left',padding:'6px 8px',color:'#999',fontSize:9}}>Ã‰lÃ©ment</th>
              <th style={{textAlign:'center',padding:'6px 8px',color:'#999',fontSize:9}}>Montant</th>
              <th style={{textAlign:'center',padding:'6px 8px',color:'#999',fontSize:9}}>ONSS</th>
              <th style={{textAlign:'center',padding:'6px 8px',color:'#999',fontSize:9}}>PP</th>
              <th style={{textAlign:'left',padding:'6px 8px',color:'#999',fontSize:9}}>Base lÃ©gale</th>
            </tr></thead>
            <tbody>
              {[
                {l:"Salaire de base",m:res.base,onss:'âœ… Oui',pp:'âœ… Oui',ref:"Loi 12/04/1965"},
                ...(res.overtime>0?[{l:"Heures supplÃ©mentaires (150%)",m:res.overtime,onss:'âœ… Oui',pp:'âœ… Oui',ref:"Loi 16/03/1971"}]:[]),
                ...(res.sunday>0?[{l:"SupplÃ©ment dimanche (200%)",m:res.sunday,onss:'âœ… Oui',pp:'âœ… Oui',ref:"Loi 16/03/1971"}]:[]),
                ...(res.night>0?[{l:"SupplÃ©ment nuit (125%)",m:res.night,onss:'âœ… Oui',pp:'âœ… Oui',ref:"Loi 16/03/1971"}]:[]),
                ...(res.bonus>0?[{l:"Prime",m:res.bonus,onss:'âœ… Oui',pp:'âœ… Oui',ref:"Art. 2 Loi 12/04/1965"}]:[]),
                ...(res.y13>0?[{l:"13Ã¨me mois",m:res.y13,onss:'âœ… Oui',pp:'âœ… Taux except.',ref:"AR 09/01/2024 ann.III"}]:[]),
                ...(res.sickPay>0?[{l:"Salaire garanti maladie",m:res.sickPay,onss:'âœ… Oui',pp:'âœ… Oui',ref:"Loi 03/07/1978 Art.52-70"}]:[]),
                {l:"â–¬ TOTAL BRUT",m:res.gross,onss:'',pp:'',ref:"",bold:true},
                ...(emp.statut==='ouvrier'?[{l:"  â”” Base ONSS ouvrier (brut Ã— 108%)",m:Math.round(res.gross*TX_OUV108*100)/100,onss:'âœ… 13,07%',pp:'â€”',ref:"Loi 29/06/1981 Art.23",hl:"orange"}]:[]),
                {l:"ONSS travailleur (13,07%)",m:res.onssW,onss:'â€”',pp:'â€”',ref:"Loi 29/06/1981",neg:true},
                ...(res.empBonus>0?[{l:"  â”” Bonus Ã  l\'emploi social (volet A+B)",m:res.empBonus,onss:'RÃ©duction',pp:'â€”',ref:"AR 01/06/1999 Art.2",hl:"green"}]:[]),
                ...(res.empBonusFisc>0?[{l:"  â”” Bonus emploi fiscal (PP)",m:res.empBonusFisc,onss:'â€”',pp:'RÃ©duction',ref:"Art. 289ter CIR 92",hl:"green"}]:[]),
                {l:"ONSS net retenu",m:res.onssNet,onss:'â€”',pp:'â€”',ref:"",neg:true,bold:true},
                {l:"PrÃ©compte professionnel",m:res.tax,onss:'â€”',pp:'â€”',ref:"AR/CIR 92 annexe III",neg:true},
                ...(res.ppVolontaire>0?[{l:"PP volontaire",m:res.ppVolontaire,onss:'â€”',pp:'â€”',ref:"Art. 275Â§1 CIR 92",neg:true}]:[]),
                {l:"Cotisation spÃ©ciale SS",m:res.css,onss:'â€”',pp:'â€”',ref:"Loi 30/03/1994",neg:true},
                ...(res.atnCar>0?[{l:"ATN Voiture de sociÃ©tÃ©",m:res.atnCar,onss:'âŒ Non',pp:'âœ… Oui',ref:"Art. 36 CIR 92"}]:[]),
                ...(res.atnGSM>0?[{l:"ATN GSM",m:res.atnGSM,onss:'âŒ Non',pp:'âœ… Oui',ref:"AR 18/12/2024 forfait"}]:[]),
                ...(res.atnPC>0?[{l:"ATN PC",m:res.atnPC,onss:'âŒ Non',pp:'âœ… Oui',ref:"AR 18/12/2024 forfait"}]:[]),
                ...(res.atnInternet>0?[{l:"ATN Internet",m:res.atnInternet,onss:'âŒ Non',pp:'âœ… Oui',ref:"AR 18/12/2024 forfait"}]:[]),
                ...(res.atnLogement>0?[{l:"ATN Logement",m:res.atnLogement,onss:'âŒ Non',pp:'âœ… Oui',ref:"Art. 18 AR/CIR 92"}]:[]),
                ...(res.atnChauffage>0?[{l:"ATN Chauffage",m:res.atnChauffage,onss:'âŒ Non',pp:'âœ… Oui',ref:"Art. 18 AR/CIR 92"}]:[]),
                ...(res.atnElec>0?[{l:"ATN Ã‰lectricitÃ©",m:res.atnElec,onss:'âŒ Non',pp:'âœ… Oui',ref:"Art. 18 AR/CIR 92"}]:[]),
                ...(res.veloSociete?[{l:"ðŸš² VÃ©lo de sociÃ©tÃ©",m:0,onss:'âŒ ExonÃ©rÃ©',pp:'âŒ ExonÃ©rÃ©',ref:"Art. 38Â§1er 14Â°a CIR",hl:"green"}]:[]),
                ...(res.atnCarteCarburant>0?[{l:"Carte carburant (sans voit. soc.)",m:res.atnCarteCarburant,onss:'âœ… Oui',pp:'âœ… Oui',ref:"Art. 36Â§2 CIR 92"}]:[]),
                ...(res.transport>0?[{l:"Transport domicile-travail",m:res.transport,onss:'âŒ ExonÃ©rÃ©',pp:'âŒ ExonÃ©rÃ©',ref:"CCT 19/9 + Art. 38Â§1er 9Â° CIR",hl:"green"}]:[]),
                ...(res.expense>0?[{l:"Frais propres employeur",m:res.expense,onss:'âŒ ExonÃ©rÃ©',pp:'âŒ ExonÃ©rÃ©',ref:"Art. 31 CIR 92",hl:"green"}]:[]),
                ...(res.indemTeletravail>0?[{l:"IndemnitÃ© tÃ©lÃ©travail",m:res.indemTeletravail,onss:'âŒ ExonÃ©rÃ©',pp:'âŒ ExonÃ©rÃ©',ref:"Circ. 2021/C/20 (max 154,74â‚¬)",hl:"green"}]:[]),
                ...(res.indemBureau>0?[{l:"IndemnitÃ© bureau",m:res.indemBureau,onss:'âŒ ExonÃ©rÃ©',pp:'âŒ ExonÃ©rÃ©',ref:"Art. 31 CIR 92",hl:"green"}]:[]),
                ...(res.doublePecule>0?[{l:"Double pÃ©cule vacances",m:res.doublePecule,onss:'âœ… 2Ã¨ partie',pp:'âœ… Taux except.',ref:"AR 28/11/1969 Art.19Â§2"}]:[]),
                ...(res.peculeDepart>0?[{l:"PÃ©cule vacances dÃ©part",m:res.peculeDepart,onss:'âœ… 13,07%',pp:'âœ… Taux except.',ref:"Loi 12/04/1965 Art.46"}]:[]),
                ...(res.primeAncExoneree>0?[{l:"Prime anciennetÃ© (exonÃ©rÃ©e)",m:res.primeAncExoneree,onss:'âŒ ExonÃ©rÃ©',pp:'âŒ ExonÃ©rÃ©',ref:"Art. 19Â§2 14Â° AR ONSS",hl:"green"}]:[]),
                ...(res.primeAncTaxable>0?[{l:"Prime anciennetÃ© (taxable)",m:res.primeAncTaxable,onss:'âœ… Oui',pp:'âœ… Oui',ref:"Art. 19Â§2 14Â° AR ONSS"}]:[]),
                ...(res.primeNaissance>0?[{l:"Prime naissance/mariage",m:res.primeNaissance,onss:'âŒ ExonÃ©rÃ©',pp:'âŒ ExonÃ©rÃ©',ref:"Circ. ONSS â€” avantage social",hl:"green"}]:[]),
                ...(res.primeInnovation>0?[{l:"Prime innovation",m:res.primeInnovation,onss:'âœ… Oui',pp:'âŒ ExonÃ©rÃ©',ref:"Art. 38Â§1er 25Â° CIR"}]:[]),
                ...(res.ecoCheques>0?[{l:"Ã‰co-chÃ¨ques",m:res.ecoCheques,onss:'âŒ ExonÃ©rÃ©',pp:'âŒ ExonÃ©rÃ©',ref:"CCT 98 du 20/02/2009",hl:"green"}]:[]),
                ...(res.cadeaux>0?[{l:"Cadeaux/Ã©vÃ©nements",m:res.cadeaux,onss:'âŒ ExonÃ©rÃ©',pp:'âŒ ExonÃ©rÃ©',ref:"Circ. ONSS (â‰¤ plafond)",hl:"green"}]:[]),
                ...(res.budgetMobPilier2>0?[{l:"Budget mobilitÃ© Pilier 2",m:res.budgetMobPilier2,onss:'âŒ ExonÃ©rÃ©',pp:'âŒ ExonÃ©rÃ©',ref:"Loi 17/03/2019",hl:"green"}]:[]),
                ...(res.budgetMobPilier3>0?[{l:"Budget mobilitÃ© Pilier 3 (cash)",m:res.budgetMobPilier3,onss:'âœ… 38,07%',pp:'âŒ Non',ref:"Loi 17/03/2019"}]:[]),
                ...(res.pensionCompl>0?[{l:"Pension complÃ©mentaire (ret. pers.)",m:res.pensionCompl,onss:'âœ… Oui',pp:'âŒ RÃ©duc. 30%',ref:"LPC 28/04/2003 + Art.145/1"}]:[]),
                ...(res.allocTravail>0?[{l:`Allocation travail ONEM (${res.allocTravailLabel})`,m:res.allocTravail,onss:'âŒ Non',pp:'âœ… Retenu ONEM',ref:"AR 19/12/2001"}]:[]),
                ...(res.mvWorker>0?[{l:"ChÃ¨ques-repas (part travailleur)",m:res.mvWorker,onss:'âŒ ExonÃ©rÃ©',pp:'âŒ ExonÃ©rÃ©',ref:"AR 28/11/1969 Art.19bisÂ§2",hl:"green"}]:[]),
                {l:"â–¬ TOTAL RETENUES",m:res.totalDed,onss:'',pp:'',ref:"",bold:true,neg:true},
                {l:"â–¬ NET Ã€ PAYER",m:res.net,onss:'',pp:'',ref:"",bold:true,hl:"net"},
              ].map((x,i)=><tr key={i} style={{borderBottom:'1px solid '+(x.bold?'#c6a34e':'#e5e4df'),background:x.hl==='green'?'rgba(22,163,74,.03)':x.hl==='orange'?'rgba(251,146,60,.04)':x.hl==='net'?'rgba(22,163,74,.06)':'transparent'}}>
                <td style={{padding:'5px 8px',color:x.bold?'#1a1a18':'#555',fontWeight:x.bold?700:400,fontSize:x.bold?11:10.5}}>{x.l}</td>
                <td style={{padding:'5px 8px',textAlign:'center',fontWeight:600,color:x.neg?'#dc2626':x.bold?'#1a1a18':x.hl==='net'?'#16a34a':'#333',fontSize:x.bold?12:10.5}}>{x.neg?'-':''}{fmt(x.m)}</td>
                <td style={{padding:'5px 8px',textAlign:'center',color:x.onss?.includes('âŒ')?'#16a34a':x.onss?.includes('âœ…')?'#dc2626':'#999',fontWeight:600,fontSize:10}}>{x.onss||''}</td>
                <td style={{padding:'5px 8px',textAlign:'center',color:x.pp?.includes('âŒ')?'#16a34a':x.pp?.includes('âœ…')?'#dc2626':'#999',fontWeight:600,fontSize:10}}>{x.pp||''}</td>
                <td style={{padding:'5px 8px',fontSize:9,color:'#999'}}>{x.ref||''}</td>
              </tr>)}
            </tbody>
          </table>
        </div>

        {/* BOUTON PDF uniquement â€” plus de tÃ©lÃ©chargement HTML/txt */}
        <div style={{marginTop:14,display:'flex',gap:10,justifyContent:'center'}} className="no-print">
          <button onClick={()=>{
            generatePayslipPDF(emp,res,per,s.co)}} style={{padding:'12px 28px',background:"#c6a34e",color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',letterSpacing:'.5px'}}>ðŸ–¨ Imprimer / PDF</button>
        </div>
      </div>}
    </div>
    {s.pays.length>0&&<C className="no-print" style={{marginTop:20,padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Historique ({s.pays.length} fiches)</div>
        <div style={{display:'flex',gap:8}}>
          {s.pays.some(p=>(!p.gross||p.gross===0)&&(!p.ename||p.ename==='undefined undefined'))&&<button onClick={()=>{if(confirm('Supprimer toutes les fiches en erreur (undefined / 0â‚¬) ?')){const badIds=s.pays.filter(p=>(!p.gross||p.gross===0)&&(!p.ename||p.ename==='undefined undefined')).map(p=>p.id);d({type:'DEL_PAYS_BATCH',ids:badIds})}}} style={{padding:'6px 12px',background:'#7f1d1d',color:'#fca5a5',border:'1px solid #991b1b',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer'}}>ðŸ—‘ Supprimer les fiches en erreur ({s.pays.filter(p=>(!p.gross||p.gross===0)&&(!p.ename||p.ename==='undefined undefined')).length})</button>}
          {s.pays.length>0&&<button onClick={()=>{if(confirm('âš  Supprimer TOUTES les fiches de paie ? Cette action est irrÃ©versible.')){d({type:'SET_PAYS',data:[]})}}} style={{padding:'6px 12px',background:'#1e293b',color:'#94a3b8',border:'1px solid #334155',borderRadius:6,fontSize:11,fontWeight:500,cursor:'pointer'}}>Tout effacer</button>}
        </div>
      </div>
      <Tbl cols={[
        {k:'p',l:"PÃ©riode",b:1,c:'#c6a34e',r:r=>r.period},{k:'e',l:"EmployÃ©",r:r=>r.ename},
        {k:'g',l:"Brut",a:'right',r:r=>fmt(r.gross)},{k:'o',l:"ONSS",a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.onssNet)}</span>},
        {k:'t',l:"PrÃ©compte",a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.tax)}</span>},
        {k:'n',l:"Net",a:'right',r:r=><span style={{fontWeight:700,color:'#4ade80'}}>{fmt(r.net)}</span>},
        {k:'c',l:"CoÃ»t",a:'right',r:r=><span style={{color:'#a78bfa'}}>{fmt(r.costTotal)}</span>},
        {k:'x',l:"",a:'center',r:r=><button onClick={(e)=>{e.stopPropagation();if(confirm('Supprimer cette fiche de '+r.ename+' ('+r.period+') ?'))d({type:'DEL_P',id:r.id})}} style={{padding:'4px 8px',background:'transparent',color:'#ef4444',border:'1px solid rgba(239,68,68,.3)',borderRadius:4,fontSize:10,cursor:'pointer',fontWeight:600,opacity:.7}} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=.7}>ðŸ—‘</button>},
      ]} data={s.pays}/>
    </C>}
  </div>;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  DIMONA
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function DimonaPage({s,d}) {
  const [f,setF]=useState({eid:(s.emps||[])[0]?.id||'',action:"IN",wtype:"OTH",start:new Date().toISOString().split('T')[0],end:"",hours:'',reason:'',dimonaP:'',planHrs:''});
  const [tab,setTab]=useState('new');
  const [filter,setFilter]=useState('all');
  const emp=(s.emps||[]).find(e=>e.id===f.eid);

  // Validation engine
  const validate=()=>{
    const errs=[];
    if(!emp) errs.push('SÃ©lectionnez un travailleur');
    if(emp&&!emp.niss) errs.push('NISS manquant pour '+emp.first+' '+emp.last);
    if(!f.start) errs.push('Date de dÃ©but obligatoire');
    if(f.action==='OUT'&&!f.end) errs.push('Date de fin obligatoire pour OUT');
    if(f.action==='UPDATE'&&!f.dimonaP) errs.push('NumÃ©ro Dimona pÃ©riode requis pour UPDATE');
    if(['STU',"FLX"].includes(f.wtype)&&!f.planHrs) errs.push('Heures planifiÃ©es obligatoires pour '+f.wtype);
    if(f.action==='IN'){
      const startD=new Date(f.start);const today=new Date();today.setHours(0,0,0,0);
      if(startD<today) errs.push('âš  Dimona IN tardive (dÃ©but passÃ©) â€” amende possible');
    }
    if(f.action==='OUT'&&f.end&&f.start&&new Date(f.end)<new Date(f.start)) errs.push('Date fin avant date dÃ©but');
    return errs;
  };
  const errs=validate();

  // Worker type descriptions
  const wtDescs={OTH:'Ordinaire',STU:'Ã‰tudiant (max 600h/an)',FLX:'Flexi-job',EXT:'Extra Horeca',DWD:'Travailleur occasionnel',IVT:'Stagiaire',BCW:'ALE/PWA',APP:'Apprenti',ART:'Artiste',SP1:'Travailleurs saisonniers',DIP:'Diplomate'};

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
    if(errs.filter(e=>!e.startsWith('âš ')).length>0) return;
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
      <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 6px',fontFamily:"'Cormorant Garamond',serif"}}>Dimona {f.action} â€” {emp.first} {emp.last}</h2>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:"rgba(74,222,128,.1)",color:'#4ade80',fontWeight:600}}>âœ“ XML gÃ©nÃ©rÃ©</span>
        <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:"rgba(198,163,78,.1)",color:'#c6a34e',fontWeight:600}}>{f.wtype} â€” {wtDescs[f.wtype]||f.wtype}</span>
        <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:"rgba(96,165,250,.1)",color:'#60a5fa',fontWeight:600}}>RÃ©f: {dimNr}</span>
      </div>
      {errs.filter(e=>e.startsWith('âš ')).map((e,i)=><div key={i} style={{fontSize:10.5,color:'#f59e0b',marginBottom:6}}>âš  {e.replace('âš  ',"")}</div>)}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        <div style={{padding:10,background:"rgba(198,163,78,.05)",borderRadius:6,fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Identifiants</div>
          <div>Travailleur: <b style={{color:'#e8e6e0'}}>{emp.first} {emp.last}</b></div>
          <div>NISS: <b style={{color:'#e8e6e0',fontFamily:'monospace'}}>{emp.niss}</b></div>
          <div>CP: <b style={{color:'#e8e6e0'}}>{emp.cp}</b></div>
        </div>
        <div style={{padding:10,background:"rgba(96,165,250,.05)",borderRadius:6,fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          <div style={{fontWeight:600,color:'#60a5fa',marginBottom:4}}>DÃ©claration</div>
          <div>Action: <b style={{color:'#e8e6e0'}}>{f.action}</b></div>
          <div>Type: <b style={{color:'#e8e6e0'}}>{f.wtype} ({wtDescs[f.wtype]})</b></div>
          <div>DÃ©but: <b style={{color:'#e8e6e0'}}>{f.start}</b></div>
          {f.end&&<div>Fin: <b style={{color:'#e8e6e0'}}>{f.end}</b></div>}
        </div>
      </div>
      <pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:320,overflowY:'auto'}}>{xml}</pre>
      <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}>
        <B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B>
        <B onClick={()=>{navigator.clipboard?.writeText(xml);alert('XML Dimona copiÃ© !')}}>Copier XML</B>
      </div>
    </div>}});
  };

  // Stats
  const statsIN=s.dims.filter(x=>x.action==='IN').length;
  const statsOUT=s.dims.filter(x=>x.action==='OUT').length;
  const statsUPD=s.dims.filter(x=>x.action==='UPDATE').length;
  const filtered=filter==='all'?s.dims:s.dims.filter(x=>x.action===filter);

  return <div>
    <PH title="DÃ©clarations Dimona" sub="DÃ©claration immÃ©diate de l'emploi â€” ONSS REST v2 â€” ConnectÃ© via Chaman"/>
    {/* ONSS Connection Status */}
    <div style={{marginBottom:14,padding:"12px 16px",background:onssStatus?.readiness?.chamanConfig?"linear-gradient(135deg,rgba(34,197,94,.06),rgba(34,197,94,.02))":"linear-gradient(135deg,rgba(251,146,56,.06),rgba(251,146,56,.02))",border:"1px solid "+(onssStatus?.readiness?.chamanConfig?"rgba(34,197,94,.15)":"rgba(251,146,56,.15)"),borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:onssStatus?.readiness?.chamanConfig?"#22c55e":"#fb923c"}}/>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:onssStatus?.readiness?.chamanConfig?"#22c55e":"#fb923c"}}>{onssStatus?.readiness?.chamanConfig?"ConnectÃ© Ã  l'ONSS REST v2":"Configuration Chaman en attente"}</div>
          <div style={{fontSize:10,color:"#5e5c56"}}>{onssStatus?.enterprise?.identificationRef||"DGIII/MAHI011/1028.230.781"} â€” Aureus IA SPRL â€” {onssStatus?.configuration?.env||"simulation"}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>fetch('/api/onss/status?test=true').then(r=>r.json()).then(r=>{setOnssStatus(r);alert(r.readiness?.oauthToken?'âœ… Token OAuth OK â€” Dimona prÃªt':'âŒ Token Ã©chouÃ©: '+(r.configuration?.oauthError||'VÃ©rifiez les env vars'))})} style={{padding:"6px 14px",borderRadius:8,border:"none",background:"rgba(96,165,250,.15)",color:"#60a5fa",fontSize:10,cursor:"pointer",fontWeight:600}}>Tester connexion</button>
        <span style={{fontSize:9,padding:"4px 10px",borderRadius:6,background:"rgba(198,163,78,.08)",color:"#c6a34e",display:"flex",alignItems:"center"}}>{submitting?"â³ Envoi en cours...":"REST v2 / OAuth2 JWT"}</span>
      </div>
    </div>
    <div style={{marginBottom:14,padding:"10px 14px",background:"linear-gradient(135deg,rgba(59,130,246,.06),rgba(59,130,246,.02))",border:"1px solid rgba(59,130,246,.1)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontSize:11,color:"#888"}}>âš¡ Dimona automatique Ã  chaque embauche/sortie</div><button onClick={()=>{if(confirm("GÃ©nÃ©rer Dimona IN pour tous ?")){(s.emps||[]).forEach(e=>generateDimonaXML(e,"IN",s.co));alert("âœ… Dimona gÃ©nÃ©rÃ©es")}}} style={{padding:"6px 14px",borderRadius:8,border:"none",background:"#3b82f6",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:600}}>âš¡ GÃ©nÃ©rer tout</button></div><div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{s.emps.filter(e=>e.status==="active"||!e.status).map(e=><div key={e.id} style={{display:"flex",gap:4}}><button onClick={()=>generateDimonaXML(e,"IN",s.co)} style={{padding:"6px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:"rgba(74,222,128,.15)",color:"#4ade80"}}>IN {e.first||e.fn} {e.last||e.ln}</button><button onClick={()=>generateDimonaXML(e,"OUT",s.co)} style={{padding:"6px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:"rgba(248,113,113,.15)",color:"#f87171"}}>OUT {e.first||e.fn} {e.last||e.ln}</button></div>)}</div>
    <div style={{marginBottom:12}}><button onClick={()=>generateSEPAXML(s.emps,per,s.co)} style={{padding:"8px 16px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:"rgba(96,165,250,.15)",color:"#60a5fa"}}>Generer SEPA XML (virements)</button></div>{/* Stats bar */}
    <div style={{display:'flex',gap:12,marginBottom:18}}>
      {[{l:"Total",v:s.dims.length,c:'#c6a34e'},{l:"IN",v:statsIN,c:'#4ade80'},{l:"OUT",v:statsOUT,c:'#f87171'},{l:"UPDATE",v:statsUPD,c:'#60a5fa'}].map((st,i)=>
        <div key={i} style={{flex:1,padding:'12px 16px',background:"rgba(198,163,78,.04)",borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}>
          <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'.5px'}}>{st.l}</div>
          <div style={{fontSize:22,fontWeight:700,color:st.c,marginTop:2}}>{st.v}</div>
        </div>
      )}
    </div>
    {/* Tabs */}
    <div style={{display:'flex',gap:6,marginBottom:16}}>
      {[{v:"new",l:"Nouvelle dÃ©claration"},{v:"history",l:"Historique"},{v:"rules",l:"RÃ¨gles & DÃ©lais"}].map(t=>
        <button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',
          background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>
      )}
    </div>

    {tab==='new'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <C><ST>DÃ©claration Dimona</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          <I label="Travailleur" value={f.eid} onChange={v=>setF({...f,eid:v})} span={2} options={(s.emps||[]).map(e=>({v:e.id,l:`${e.first||e.fn||'Emp'} ${e.last||''} ${e.niss?'':'âš  NISS!'}`}))}/>
          <I label="Action" value={f.action} onChange={v=>setF({...f,action:v})} options={[{v:"IN",l:"IN â€” EntrÃ©e en service"},{v:"OUT",l:"OUT â€” Sortie de service"},{v:"UPDATE",l:"UPDATE â€” Modification"},{v:"CANCEL",l:"CANCEL â€” Annulation"}]}/>
          <I label="Type travailleur" value={f.wtype} onChange={v=>setF({...f,wtype:v})} options={Object.entries(wtDescs).map(([k,v])=>({v:k,l:`${k} â€” ${v}`}))}/>
          <I label="Date dÃ©but" type="date" value={f.start} onChange={v=>setF({...f,start:v})}/>
          {needsEnd&&<I label="Date fin" type="date" value={f.end} onChange={v=>setF({...f,end:v})}/>}
          {needsHours&&<I label="Heures planifiÃ©es" type="number" value={f.planHrs} onChange={v=>setF({...f,planHrs:v})}/>}
          {f.action==='OUT'&&<I label="Motif sortie" value={f.reason} onChange={v=>setF({...f,reason:v})} options={[{v:"",l:"â€” SÃ©lectionner â€”"},{v:"DEM",l:"DÃ©mission"},{v:"LIC",l:"Licenciement"},{v:"RUP",l:"Rupture amiable"},{v:"FIN",l:"Fin contrat dÃ©terminÃ©"},{v:"RET",l:"Retraite"},{v:"DEC",l:"DÃ©cÃ¨s"},{v:"FOR",l:"Force majeure"}]}/>}
          {f.action==='UPDATE'&&<I label="NÂ° Dimona pÃ©riode" value={f.dimonaP} onChange={v=>setF({...f,dimonaP:v})}/>}
        </div>
        {/* Validation errors */}
        {errs.length>0&&<div style={{marginTop:12,padding:10,background:errs.some(e=>!e.startsWith('âš '))?'rgba(239,68,68,.06)':'rgba(245,158,11,.06)',borderRadius:8,border:`1px solid ${errs.some(e=>!e.startsWith('âš '))?'rgba(239,68,68,.15)':'rgba(245,158,11,.15)'}`}}>
          {errs.map((e,i)=><div key={i} style={{fontSize:10.5,color:e.startsWith('âš ')?'#f59e0b':'#ef4444',padding:'2px 0'}}>â€¢ {e}</div>)}
        </div>}
        <B onClick={gen} disabled={errs.filter(e=>!e.startsWith('âš ')).length>0} style={{width:'100%',marginTop:14,opacity:errs.filter(e=>!e.startsWith('âš ')).length>0?.5:1}}>GÃ©nÃ©rer Dimona {f.action}</B>
      </C>
      <div>
        <C><ST>Info type: {f.wtype}</ST>
          <div style={{fontSize:12,color:'#9e9b93',lineHeight:1.7}}>
            {f.wtype==='OTH'&&<>Type ordinaire â€” contrat Ã  durÃ©e dÃ©terminÃ©e ou indÃ©terminÃ©e. Pas de champs spÃ©cifiques supplÃ©mentaires.</>}
            {f.wtype==='STU'&&<><b style={{color:'#c6a34e'}}>Ã‰tudiant:</b> Max 600h/an exonÃ©rÃ©es cotisations ONSS normales (cotis solidaritÃ© 5,42% + 2,71%). Heures planifiÃ©es obligatoires. VÃ©rifier compteur Student@Work.</>}
            {f.wtype==='FLX'&&<><b style={{color:'#c6a34e'}}>Flexi-job:</b> Exclusivement pour secteurs autorisÃ©s (Horeca CP 302, Commerce CP 201/202, etc.). Travailleur doit avoir un emploi principal Ã  min 4/5. Net = Brut (pas d'ONSS/PP). Cotis patronale 28%.</>}
            {f.wtype==='EXT'&&<><b style={{color:'#c6a34e'}}>Extra Horeca:</b> Maximum 50 jours/an. Forfait journalier ONSS. Uniquement CP 302.</>}
            {f.wtype==='DWD'&&<><b style={{color:'#c6a34e'}}>Occasionnel:</b> Travailleurs occasionnels agriculture/horticulture. Forfait journalier.</>}
            {f.wtype==='IVT'&&<><b style={{color:'#c6a34e'}}>Stagiaire:</b> Convention d'immersion professionnelle (CIP). Pas de cotisations ONSS normales si indemnitÃ© â‰¤ plafond.</>}
            {f.wtype==='APP'&&<><b style={{color:'#c6a34e'}}>Apprenti:</b> Contrat d'apprentissage (IFAPME/EFP/VDAB/Syntra). Cotisations rÃ©duites.</>}
            {f.wtype==='ART'&&<><b style={{color:'#c6a34e'}}>Artiste:</b> Visa artiste ou dÃ©claration d'activitÃ© artistique. RÃ©gime spÃ©cifique.</>}
            {!['OTH',"STU","FLX","EXT","DWD","IVT","APP","ART"].includes(f.wtype)&&<>Type spÃ©cifique â€” consultez la documentation ONSS.</>}
          </div>
        </C>
        <C style={{marginTop:12}}><ST>Rappels lÃ©gaux</ST>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.7}}>
            <div style={{padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <b style={{color:'#4ade80'}}>IN:</b> Au plus tard au <b>moment</b> de la mise au travail</div>
            <div style={{padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <b style={{color:'#f87171'}}>OUT:</b> Au plus tard le <b>dernier jour</b> de travail</div>
            <div style={{padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <b style={{color:'#60a5fa'}}>UPDATE:</b> DÃ¨s que la modification est connue</div>
            <div style={{padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <b style={{color:'#a78bfa'}}>CANCEL:</b> Si le travailleur ne se prÃ©sente pas</div>
            <div style={{padding:'6px 0',marginTop:6,background:"rgba(239,68,68,.06)",borderRadius:6,paddingLeft:8}}>
              <b style={{color:'#ef4444'}}>Amendes:</b> 2.500â‚¬ Ã  12.500â‚¬ par travailleur non dÃ©clarÃ© (Code pÃ©nal social Art. 181)
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
        {k:'s',l:"DÃ©but",r:r=>r.start},{k:'en',l:"Fin",r:r=>r.end||'â€”'},
        {k:'h',l:"Heures",r:r=>r.hours||'â€”'},
        {k:'r',l:"RÃ©f",r:r=><span style={{fontFamily:'monospace',fontSize:9.5,color:'#60a5fa'}}>{r.dimNr||'â€”'}</span>},
        {k:'st',l:"Statut",r:r=><span style={{color:'#4ade80',fontSize:11}}>âœ“</span>},
        {k:'x',l:"",a:'right',r:r=><B v="ghost" style={{padding:'3px 8px',fontSize:10}} onClick={()=>d({type:"MODAL",m:{w:800,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>Dimona {r.action} â€” {r.ename}</h3><pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:380,overflowY:'auto'}}>{r.xml}</pre><div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B><B onClick={()=>{navigator.clipboard?.writeText(r.xml);alert('CopiÃ© !')}}>Copier</B></div></div>}})}>XML</B>},
      ]} data={filtered}/>
    </C>}

    {tab==='rules'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <C><ST>DÃ©lais lÃ©gaux par type</ST>
        <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          {[{t:'OTH â€” Ordinaire',d:"IN: avant mise au travail. OUT: dernier jour.",c:'#e8e6e0'},
            {t:'STU â€” Ã‰tudiant',d:"IN: avant dÃ©but. VÃ©rifier Student@Work (600h/an). OUT: dernier jour.",c:'#60a5fa'},
            {t:'FLX â€” Flexi-job',d:"IN: avant chaque prestation. OUT: dernier jour prestation. Heures planifiÃ©es obligatoires.",c:'#4ade80'},
            {t:'EXT â€” Extra Horeca',d:"IN: avant mise au travail. Max 50j/an. Forfait ONSS journalier.",c:'#f59e0b'},
            {t:'DWD â€” Occasionnel',d:"Agriculture/horticulture. Dimona journaliÃ¨re.",c:'#a78bfa'},
            {t:'APP â€” Apprenti',d:"Comme ordinaire + numÃ©ro contrat apprentissage.",c:'#f87171'},
          ].map((r,i)=><div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <div style={{fontWeight:600,color:r.c}}>{r.t}</div><div style={{fontSize:10.5,marginTop:2}}>{r.d}</div>
          </div>)}
        </div>
      </C>
      <C><ST>Sanctions & Amendes</ST>
        <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          {[{l:"Absence de Dimona IN",a:'Niveau 4: 2.500â‚¬ â€” 12.500â‚¬/travailleur',s:'Art. 181 CPS'},{l:"Dimona IN tardive",a:'Niveau 2: 400â‚¬ â€” 4.000â‚¬',s:'Art. 182 CPS'},{l:"Absence de Dimona OUT",a:'Niveau 2: 400â‚¬ â€” 4.000â‚¬',s:'Art. 182 CPS'},{l:"DonnÃ©es inexactes",a:'Niveau 2: 400â‚¬ â€” 4.000â‚¬',s:'Art. 182 CPS'},{l:"RÃ©cidive dans les 12 mois",a:'Amende doublÃ©e',s:'Art. 111 CPS'}].map((r,i)=>
            <div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <div style={{fontWeight:600,color:'#e8e6e0'}}>{r.l}</div>
              <div style={{color:'#f87171',fontSize:10.5}}>{r.a}</div>
              <div style={{color:'#5e5c56',fontSize:10}}>{r.s}</div>
            </div>
          )}
        </div>
        <div style={{marginTop:14,padding:10,background:"rgba(96,165,250,.06)",borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          <b>Portail:</b> www.socialsecurity.be â†’ Dimona Web<br/>
          <b>Batch:</b> Envoi XML via canal sÃ©curisÃ© (FTP/MQ)<br/>
          <b>Helpdesk:</b> Contact Center ONSS â€” 02/509 59 59
        </div>
      </C>
    </div>}
  </div>;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  DMFA
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function DMFAPage({s,d}) {
  const [q,setQ]=useState(Math.ceil((new Date().getMonth()+1)/3));
  const [y,setY]=useState(new Date().getFullYear());
  const [view,setView]=useState('detail');
  const ae=(s.emps||[]).filter(e=>e.status==='active');
  const sum=ae.map(e=>{
    const p=calc(e,{...DPER,days:65},s.co);
    const isOuv=(e.statut==='ouvrier');
    const base=isOuv?p.gross*3*TX_OUV108:p.gross*3;
    return{e,g3:p.gross*3,base3:base,isOuv,ow3:p.onssNet*3,oe3:p.onssE*3,
      ffe3:p.onss_ffe*3,chomT3:p.onss_chomTemp*3,amia3:p.onss_amiante*3,
      rate:p.onssE_rate,note:p.onssE_note,type:p.onssE_type};
  });
  const tot=sum.reduce((a,r)=>({g:a.g+r.g3,b:a.b+r.base3,ow:a.ow+r.ow3,oe:a.oe+r.oe3,ffe:a.ffe+r.ffe3,ct:a.ct+r.chomT3,am:a.am+r.amia3}),{g:0,b:0,ow:0,oe:0,ffe:0,ct:0,am:0});

  // Calendrier ONSS 2026 â€” provisions mensuelles (le 5) + solde trimestriel
  const calONSS=[
    {p:'T1 2026',prov:['05/02',"05/03","05/04"],solde:'30/04/2026'},
    {p:'T2 2026',prov:['05/05',"05/06","05/07"],solde:'31/07/2026'},
    {p:'T3 2026',prov:['05/08',"05/09","05/10"],solde:'31/10/2026'},
    {p:'T4 2026',prov:['05/11',"05/12","05/01/2027"],solde:'31/01/2027'},
  ];

  const [ticket,setTicket]=useState(null);
  const gen=()=>{
    const xml=genDMFAXML(s.co,ae,q,y);
    const refMatch=xml.match(/Reference>([^<]+)</);
    const ref=refMatch?refMatch[1]:'REF-'+Date.now();
    const acrf=genDMFATicket(ref,s.co);
    const totAll=tot.ow+tot.oe+tot.ffe+tot.ct+tot.am;
    const anomalies=[];
    ae.forEach(e=>{if(!e.niss)anomalies.push({zone:'INSS',sev:"E",desc:`NISS manquant pour ${e.first||e.fn||'Emp'} ${e.last||''}`});});
    if(!s.co.onss)anomalies.push({zone:'NLOSSRegistrationNbr',sev:"E",desc:"Matricule ONSS employeur manquant"});
    const notif=genDMFANotification(acrf.ticket,s.co,q,y,ae.length,totAll.toFixed(2),anomalies);
    d({type:"ADD_DMFA",d:{q,y,cnt:ae.length,xml,ticket:acrf.ticket,ref,at:new Date().toISOString()}});
    setTicket({ref,ticket:acrf.ticket,acrfXml:acrf.xml,notifXml:notif,anomalies,xml});
    d({type:"MODAL",m:{w:950,c:<div>
      <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 6px',fontFamily:"'Cormorant Garamond',serif"}}>DMFA T{q}/{y} â€” Envoi simulÃ©</h2>
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:"rgba(74,222,128,.1)",color:'#4ade80',fontWeight:600}}>âœ“ ACRF positif</span>
        <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:anomalies.length>0?'rgba(198,163,78,.1)':'rgba(74,222,128,.1)',color:anomalies.length>0?'#c6a34e':'#4ade80',fontWeight:600}}>{anomalies.length>0?`âš  ${anomalies.length} anomalie(s)`:'âœ“ AcceptÃ©e sans anomalie'}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
        <div style={{padding:10,background:"rgba(198,163,78,.05)",borderRadius:6,fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Identifiants</div>
          <div>RÃ©fÃ©rence: <b style={{color:'#e8e6e0',fontFamily:'monospace'}}>{ref}</b></div>
          <div>Ticket ONSS: <b style={{color:'#4ade80',fontFamily:'monospace'}}>{acrf.ticket}</b></div>
          <div>Trimestre: <b style={{color:'#e8e6e0'}}>T{q}/{y}</b></div>
          <div>Travailleurs: <b style={{color:'#e8e6e0'}}>{ae.length}</b></div>
          <div>Total cotisations: <b style={{color:'#c6a34e'}}>{fmt(totAll)}</b></div>
        </div>
        <div style={{padding:10,background:"rgba(96,165,250,.05)",borderRadius:6,fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          <div style={{fontWeight:600,color:'#60a5fa',marginBottom:4}}>Flux ONSS</div>
          <div>1. <span style={{color:'#4ade80'}}>âœ“</span> Envoi XML DmfAOriginal</div>
          <div>2. <span style={{color:'#4ade80'}}>âœ“</span> AccusÃ© de rÃ©ception (ACRF) positif</div>
          <div>3. <span style={{color:'#4ade80'}}>âœ“</span> Notification (DMNO) â€” acceptÃ©e</div>
          <div>4. <span style={{color:'#60a5fa'}}>â†’</span> PID reÃ§u (identifiants permanents)</div>
          <div>5. <span style={{color:'#5e5c56'}}>â—‹</span> Ã‰ventuelle notification de modification</div>
        </div>
      </div>
      {anomalies.length>0&&<div style={{padding:10,background:"rgba(248,113,113,.05)",borderRadius:6,marginBottom:14,border:'1px solid rgba(248,113,113,.1)'}}>
        <div style={{fontSize:11,fontWeight:600,color:'#f87171',marginBottom:6}}>Anomalies dÃ©tectÃ©es</div>
        {anomalies.map((a,i)=><div key={i} style={{fontSize:11,color:'#9e9b93',padding:'3px 0'}}>â€¢ <b style={{color:'#f87171'}}>{a.zone}</b>: {a.desc}</div>)}
      </div>}
      <pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:9.5,color:'#9e9b93',overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:350,overflowY:'auto'}}>{xml}</pre>
      <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}>
        <B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B>
        <B v="outline" onClick={()=>{navigator.clipboard?.writeText(acrf.xml);alert('ACRF copiÃ© !')}}>Copier ACRF</B>
        <B onClick={()=>{navigator.clipboard?.writeText(xml);alert('XML DMFA copiÃ© !')}}>Copier XML</B>
      </div>
    </div>}});
  };
  return <div>
    <PH title="DÃ©claration DMFA" sub="Trimestrielle â€” ONSS"/>
    <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:18}}>
      <div>
      <C><ST>PÃ©riode</ST>
        <I label="Trimestre" value={q} onChange={v=>setQ(parseInt(v))} options={[{v:1,l:"T1 (Jan-Mar)"},{v:2,l:"T2 (Avr-Jun)"},{v:3,l:"T3 (Jul-Sep)"},{v:4,l:"T4 (Oct-DÃ©c)"}]}/>
        <I label="AnnÃ©e" type="number" value={y} onChange={v=>setY(v)} style={{marginTop:9}}/>
        <I label="Vue" value={view} onChange={setView} style={{marginTop:9}} options={[{v:"detail",l:"DÃ©tail par travailleur"},{v:"ventil",l:"Ventilation cotisations"},{v:"calendar",l:"Calendrier ONSS"}]}/>
        <B onClick={gen} style={{width:'100%',marginTop:14}}>GÃ©nÃ©rer DMFA T{q}/{y}</B>
        {ticket&&<div style={{marginTop:12,padding:10,background:"rgba(74,222,128,.05)",borderRadius:8,border:'1px solid rgba(74,222,128,.15)'}}>
          <div style={{fontSize:11,fontWeight:600,color:'#4ade80',marginBottom:6}}>âœ“ Dernier envoi</div>
          <div style={{fontSize:10.5,color:'#9e9b93',lineHeight:2}}>
            <div>Ticket: <b style={{color:'#4ade80',fontFamily:'monospace',fontSize:9.5}}>{ticket.ticket}</b></div>
            <div>RÃ©f: <b style={{color:'#e8e6e0',fontFamily:'monospace',fontSize:9.5}}>{ticket.ref}</b></div>
            <div>Anomalies: <b style={{color:ticket.anomalies.length>0?'#f87171':'#4ade80'}}>{ticket.anomalies.length>0?ticket.anomalies.length+' âš ':'Aucune âœ“'}</b></div>
          </div>
          <div style={{display:'flex',gap:6,marginTop:6}}>
            <B v="ghost" style={{padding:'3px 8px',fontSize:9.5}} onClick={()=>d({type:"MODAL",m:{w:700,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>AccusÃ© de rÃ©ception (ACRF)</h3><pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:12,fontSize:9.5,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:300,overflowY:'auto'}}>{ticket.acrfXml}</pre><B v="outline" onClick={()=>d({type:"MODAL",m:null})} style={{marginTop:10}}>Fermer</B></div>}})}>ACRF</B>
            <B v="ghost" style={{padding:'3px 8px',fontSize:9.5}} onClick={()=>d({type:"MODAL",m:{w:700,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>Notification (DMNO)</h3><pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:12,fontSize:9.5,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:300,overflowY:'auto'}}>{ticket.notifXml}</pre><B v="outline" onClick={()=>d({type:"MODAL",m:null})} style={{marginTop:10}}>Fermer</B></div>}})}>DMNO</B>
            <B v="ghost" style={{padding:'3px 8px',fontSize:9.5}} onClick={()=>d({type:"MODAL",m:{w:900,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>XML DmfAOriginal complet</h3><pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:12,fontSize:9,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:400,overflowY:'auto'}}>{ticket.xml}</pre><B v="outline" onClick={()=>d({type:"MODAL",m:null})} style={{marginTop:10}}>Fermer</B></div>}})}>XML</B>
          </div>
        </div>}
        <div style={{marginTop:18,padding:12,background:"rgba(198,163,78,.05)",borderRadius:8,border:'1px solid rgba(198,163,78,.1)'}}>
          <div style={{fontSize:11.5,fontWeight:600,color:'#c6a34e',marginBottom:6}}>RÃ©capitulatif T{q}/{y}</div>
          <div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2}}>
            <div>Travailleurs: <b style={{color:'#e8e6e0'}}>{ae.length}</b> ({sum.filter(s2=>s2.isOuv).length} ouv. / {sum.filter(s2=>!s2.isOuv).length} empl.)</div>
            <div>Masse brute: <b style={{color:'#e8e6e0'}}>{fmt(tot.g)}</b></div>
            <div>Base ONSS (108%): <b style={{color:'#e8e6e0'}}>{fmt(tot.b)}</b></div>
            <div>ONSS trav.: <b style={{color:'#f87171'}}>{fmt(tot.ow)}</b></div>
            <div>ONSS empl.: <b style={{color:'#f87171'}}>{fmt(tot.oe)}</b></div>
            <div style={{borderTop:'1px solid rgba(198,163,78,.15)',paddingTop:4,marginTop:4}}>Total ONSS: <b style={{color:'#c6a34e'}}>{fmt(tot.ow+tot.oe)}</b></div>
          </div>
        </div>
        <div style={{marginTop:10,padding:8,background:"rgba(96,165,250,.06)",borderRadius:6,fontSize:10,color:'#60a5fa',lineHeight:1.6}}>
          <b>Provisions:</b> le 5 de chaque mois<br/>
          <b>Solde trim.:</b> dernier jour du mois suivant<br/>
          <b>Ouvriers:</b> base = brut Ã— 108%<br/>
          <b>Marchand:</b> 25% | <b>Non-marchand:</b> 32,40%
        </div>
      </C>
      </div>
      <C style={{padding:0,overflow:'hidden'}}>
        {view==='detail'&&<><div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>DÃ©tail T{q}/{y}</div></div>
        <Tbl cols={[
          {k:'n',l:"Travailleur",r:r=><span style={{fontWeight:500}}>{r.e.first} {r.e.last}</span>},
          {k:'st',l:"Statut",r:r=><span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:r.isOuv?'rgba(248,113,113,.1)':'rgba(96,165,250,.1)',color:r.isOuv?'#f87171':'#60a5fa'}}>{r.isOuv?'Ouvrier':'EmployÃ©'}</span>},
          {k:'c',l:"Code",r:r=>r.e.dmfaCode},{k:'cp',l:"CP",r:r=>r.e.cp},
          {k:'b',l:"Base ONSS",a:'right',r:r=><span style={{fontSize:11}}>{fmt(r.base3)}{r.isOuv?' (108%)':''}</span>},
          {k:'ow',l:"ONSS trav.",a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.ow3)}</span>},
          {k:'oe',l:"ONSS empl.",a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.oe3)}</span>},
          {k:'r',l:"Taux",a:'right',r:r=><span style={{fontSize:10,color:'#c6a34e'}}>{(r.rate*100).toFixed(1)}%</span>},
        ]} data={sum}/></>}

        {view==='ventil'&&<><div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Ventilation cotisations T{q}/{y}</div></div>
        <div style={{padding:18}}>
          {[
            {l:"Cotisation patronale de base",v:tot.oe,pct:(tot.oe/tot.b*100).toFixed(2),c:'#f87171'},
            {l:"Cotisation Fonds fermeture (FFE)",v:tot.ffe,pct:(tot.ffe/tot.b*100).toFixed(3),c:'#a78bfa'},
            {l:"Cotisation chÃ´mage temporaire",v:tot.ct,pct:(tot.ct/tot.b*100).toFixed(3),c:'#60a5fa'},
            {l:"Cotisation Fonds amiante",v:tot.am,pct:(tot.am/tot.b*100).toFixed(4),c:'#4ade80'},
            {l:"ONSS travailleur (13,07%)",v:tot.ow,pct:"13.07",c:'#f87171'},
          ].map((r,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <span style={{fontSize:12,color:'#9e9b93'}}>{r.l}</span>
            <span style={{display:'flex',gap:12,alignItems:'center'}}>
              <span style={{fontSize:10,color:'#5e5c56'}}>{r.pct}%</span>
              <span style={{fontWeight:600,color:r.c,fontSize:13,minWidth:90,textAlign:'right'}}>{fmt(r.v)}</span>
            </span>
          </div>)}
          <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderTop:'2px solid rgba(198,163,78,.3)',marginTop:8}}>
            <span style={{fontSize:13,fontWeight:700,color:'#e8e6e0'}}>TOTAL ONSS Ã  verser</span>
            <span style={{fontSize:16,fontWeight:700,color:'#c6a34e'}}>{fmt(tot.ow+tot.oe+tot.ffe+tot.ct+tot.am)}</span>
          </div>
          <div style={{marginTop:14,padding:10,background:"rgba(198,163,78,.05)",borderRadius:6,fontSize:10.5,color:'#9e9b93',lineHeight:1.6}}>
            <b style={{color:'#c6a34e'}}>Notes:</b><br/>
            â€¢ Cotis. patronale base: {sum.filter(s2=>s2.type==='marchand').length} trav. marchand (25%) + {sum.filter(s2=>s2.type==='non_marchand').length} trav. non-marchand (32,40%)<br/>
            â€¢ Fonds amiante: dÃ» T1-T3 2026 uniquement<br/>
            â€¢ Ouvriers ({sum.filter(s2=>s2.isOuv).length}): base calculÃ©e sur brut Ã— 108%<br/>
            â€¢ RÃ©duction structurelle incluse (Cat {ae[0]?.statut==='ouvrier'?'1':'1'}) â€¢ Hors rÃ©ductions groupes-cibles
          </div>
        </div></>}

        {view==='calendar'&&<><div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Calendrier ONSS {y}</div></div>
        <div style={{padding:18}}>
          {calONSS.map((c,i)=><div key={i} style={{marginBottom:16,padding:12,background:"rgba(198,163,78,.04)",borderRadius:8,border:i===(q-1)?'1px solid rgba(198,163,78,.3)':'1px solid rgba(255,255,255,.03)'}}>
            <div style={{fontSize:12,fontWeight:600,color:i===(q-1)?'#c6a34e':'#e8e6e0',marginBottom:6}}>{c.p} {i===(q-1)?'â† actuel':''}</div>
            <div style={{fontSize:11,color:'#9e9b93',lineHeight:2}}>
              {c.prov.map((pr,j)=><div key={j}>Provision {j+1}: <b style={{color:'#d4d0c8'}}>{pr}</b></div>)}
              <div style={{borderTop:'1px solid rgba(255,255,255,.05)',paddingTop:4,marginTop:4}}>Solde + DmfA: <b style={{color:'#c6a34e'}}>{c.solde}</b></div>
            </div>
          </div>)}
          <div style={{padding:10,background:"rgba(96,165,250,.06)",borderRadius:6,fontSize:10.5,color:'#60a5fa',lineHeight:1.6}}>
            <b>Rappel lÃ©gal:</b> Les provisions mensuelles sont calculÃ©es par l'ONSS et communiquÃ©es Ã  l'employeur. L'employeur verse la diffÃ©rence entre le total des provisions et la somme totale des cotisations au plus tard le dernier jour du mois suivant le trimestre.
          </div>
        </div></>}
      </C>
    </div>
  </div>;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  ADMIN DASHBOARD â€” PANNEAU D'ADMINISTRATION ULTRA COMPLET
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function AdminDashboard({s,d}){
  const sub=s.sub||'admin_users';
  const [users,setUsers]=useState([]);
  const [clients,setClients]=useState([]);
  const [travailleurs,setTravailleurs]=useState([]);
  const [fiches,setFiches]=useState([]);
  const [audit,setAudit]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [selectedUser,setSelectedUser]=useState(null);
  const [dateRange,setDateRange]=useState('30');

  // Charger donnÃ©es depuis Supabase
  useEffect(()=>{
    loadData();
  },[sub]);

  async function loadData(){
    try{
      setLoading(true);
      const {supabase}=await import('./lib/supabase');
      if(!supabase){setLoading(false);return;}
      const [uRes,cRes,tRes,fRes]=await Promise.all([
        supabase.from('users').select('*').limit(200),
        supabase.from('clients').select('*').limit(500),
        supabase.from('travailleurs').select('*').limit(2000),
        supabase.from('fiches_paie').select('*').limit(5000),
      ]);
      if(uRes.data)setUsers(uRes.data);
      if(cRes.data)setClients(cRes.data);
      if(tRes.data)setTravailleurs(tRes.data);
      if(fRes.data)setFiches(fRes.data);
    }catch(e){console.error('AdminDashboard loadData:',e);}
    finally{setLoading(false);}
  }

  // Stats globales
  const totalUsers=users.length;
  const activeUsers=users.filter(u=>u.active).length;
  const totalClients=clients.length;
  const activeClients=clients.filter(c=>c.active).length;
  const totalTrav=travailleurs.length;
  const activeTrav=travailleurs.filter(t=>t.actif).length;
  const totalFiches=fiches.length;
  const fichesMois=fiches.filter(f=>{const now=new Date();return f.annee===now.getFullYear()&&f.mois===now.getMonth()+1;}).length;
  
  // Revenue calc
  const revenuMensuelEstime=totalTrav*12; // 12â‚¬/fiche
  const revenuAnnuelEstime=revenuMensuelEstime*12;
  
  // Travailleurs par client
  const travParClient={};
  travailleurs.forEach(t=>{travParClient[t.client_id]=(travParClient[t.client_id]||0)+1;});
  const moyTravParClient=totalClients>0?(totalTrav/totalClients).toFixed(1):0;

  // Cards style
  const Stat=({label,value,sub,color,icon})=><div style={{padding:16,background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)",flex:1,minWidth:140}}>
    <div style={{fontSize:11,color:'#9e9b93',marginBottom:4}}>{icon} {label}</div>
    <div style={{fontSize:26,fontWeight:700,color:color||'#e8e6e0'}}>{value}</div>
    {sub&&<div style={{fontSize:10,color:'#5e5c56',marginTop:2}}>{sub}</div>}
  </div>;

  const Badge=({text,color})=><span style={{padding:'2px 8px',borderRadius:10,fontSize:10,fontWeight:600,background:`${color}15`,color,border:`1px solid ${color}30`}}>{text}</span>;

  // Format date
  const fDate=(d)=>{if(!d)return'-';const dt=new Date(d);return dt.toLocaleDateString('fr-BE',{day:'2-digit',month:'2-digit',year:'numeric'});};
  const fDateTime=(d)=>{if(!d)return'-';const dt=new Date(d);return dt.toLocaleDateString('fr-BE',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});};
  const timeAgo=(d)=>{if(!d)return'Jamais';const now=new Date();const dt=new Date(d);const diff=Math.floor((now-dt)/1000);if(diff<60)return'Il y a '+diff+'s';if(diff<3600)return'Il y a '+Math.floor(diff/60)+'min';if(diff<86400)return'Il y a '+Math.floor(diff/3600)+'h';return'Il y a '+Math.floor(diff/86400)+'j';};

  return <div>
    <div style={{padding:'18px 24px',borderBottom:'1px solid rgba(139,115,60,.15)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div>
        <div style={{fontSize:18,fontWeight:700,color:'#e8e6e0'}}>ðŸ‘‘ Administration Aureus Social Pro</div>
        <div style={{fontSize:11.5,color:'#9e9b93',marginTop:2}}>Panneau de controle â€” Vue globale plateforme</div>
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <button onClick={loadData} style={{padding:'6px 14px',borderRadius:8,border:'1px solid rgba(198,163,78,.3)',background:'rgba(198,163,78,.08)',color:'#c6a34e',fontSize:11,cursor:'pointer',fontWeight:600}}>ðŸ”„ Rafraichir</button>
        <div style={{fontSize:10,color:loading?'#fb923c':'#4ade80'}}>â— {loading?'Chargement...':'Connecte'}</div>
      </div>
    </div>
    
    <div style={{padding:24,maxHeight:'calc(100vh - 200px)',overflowY:'auto'}}>
    
    {/* â•â•â• ONGLET: USERS â•â•â• */}
    {sub==='admin_users'&&<div>
      {/* KPIs */}
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <Stat icon="ðŸ‘¤" label="Utilisateurs total" value={totalUsers} sub={`${activeUsers} actifs`} color="#c6a34e"/>
        <Stat icon="ðŸ¢" label="Dossiers clients" value={totalClients} sub={`${activeClients} actifs`} color="#60a5fa"/>
        <Stat icon="ðŸ‘¥" label="Travailleurs" value={totalTrav} sub={`${activeTrav} actifs`} color="#4ade80"/>
        <Stat icon="ðŸ“„" label="Fiches de paie" value={totalFiches} sub={`${fichesMois} ce mois`} color="#a78bfa"/>
        <Stat icon="ðŸ’°" label="Revenu mensuel est." value={`â‚¬${revenuMensuelEstime.toLocaleString()}`} sub={`â‚¬${revenuAnnuelEstime.toLocaleString()}/an`} color="#c6a34e"/>
      </div>

      {/* Search */}
      <div style={{marginBottom:16}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ðŸ” Rechercher un utilisateur (nom, email...)" style={{width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(198,163,78,.15)',borderRadius:8,color:'#e8e6e0',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
      </div>

      {/* Users table */}
      <div style={{background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)",overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 2fr 1fr 1fr 1.5fr 1.5fr 1fr',padding:'10px 14px',background:"rgba(198,163,78,.06)",borderBottom:'1px solid rgba(198,163,78,.1)',fontSize:10,fontWeight:600,color:'#c6a34e',textTransform:'uppercase',letterSpacing:.5}}>
          <div>Nom</div><div>Email</div><div>Role</div><div>Langue</div><div>Derniere connexion</div><div>Inscription</div><div>Statut</div>
        </div>
        {users.length===0?<div style={{padding:30,textAlign:'center',color:'#5e5c56',fontSize:12}}>
          {loading?'Chargement...':'Aucun utilisateur inscrit. Les utilisateurs apparaitront ici apres inscription.'}
        </div>:
        users.filter(u=>{
          if(!search)return true;
          const s=search.toLowerCase();
          return (u.nom||'').toLowerCase().includes(s)||(u.email||'').toLowerCase().includes(s)||(u.prenom||'').toLowerCase().includes(s);
        }).map((u,i)=>{
          const nbClients=clients.filter(c=>c.user_id===u.id).length;
          const nbTrav=travailleurs.filter(t=>clients.some(c=>c.id===t.client_id&&c.user_id===u.id)).length;
          return <div key={u.id} onClick={()=>setSelectedUser(selectedUser===u.id?null:u.id)} style={{display:'grid',gridTemplateColumns:'2fr 2fr 1fr 1fr 1.5fr 1.5fr 1fr',padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.03)',cursor:'pointer',background:selectedUser===u.id?"rgba(198,163,78,.06)":i%2===0?"transparent":"rgba(255,255,255,.01)",fontSize:11.5,alignItems:'center',transition:'background .15s'}}>
            <div>
              <div style={{fontWeight:600,color:'#e8e6e0'}}>{u.prenom||''} {u.nom||''}</div>
              <div style={{fontSize:10,color:'#5e5c56'}}>{nbClients} dossier{nbClients!==1?'s':''} Â· {nbTrav} travailleur{nbTrav!==1?'s':''}</div>
            </div>
            <div style={{color:'#9e9b93'}}>{u.email}</div>
            <div><Badge text={u.role||'admin'} color={u.role==='admin'?'#c6a34e':u.role==='gestionnaire'?'#60a5fa':'#9e9b93'}/></div>
            <div style={{color:'#9e9b93',fontSize:11}}>{(u.lang||'fr').toUpperCase()}</div>
            <div style={{color:'#9e9b93',fontSize:10.5}}>{timeAgo(u.last_login)}</div>
            <div style={{color:'#9e9b93',fontSize:10.5}}>{fDate(u.created_at)}</div>
            <div><Badge text={u.active?'Actif':'Inactif'} color={u.active?'#4ade80':'#f87171'}/></div>
          </div>;
        })}
        
        {/* Detail panel */}
        {selectedUser&&<div style={{padding:16,background:"rgba(198,163,78,.04)",borderTop:'1px solid rgba(198,163,78,.15)'}}>
          {(()=>{
            const u=users.find(u=>u.id===selectedUser);
            if(!u)return null;
            const uClients=clients.filter(c=>c.user_id===u.id);
            const uTrav=travailleurs.filter(t=>uClients.some(c=>c.id===t.client_id));
            const uFiches=fiches.filter(f=>uClients.some(c=>c.id===f.client_id));
            const revenu=uTrav.length*12;
            return <div>
              <div style={{fontSize:13,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Detail: {u.prenom} {u.nom} ({u.email})</div>
              <div style={{display:'flex',gap:12,marginBottom:12,flexWrap:'wrap'}}>
                <Stat icon="ðŸ¢" label="Dossiers" value={uClients.length} color="#60a5fa"/>
                <Stat icon="ðŸ‘¥" label="Travailleurs" value={uTrav.length} color="#4ade80"/>
                <Stat icon="ðŸ“„" label="Fiches" value={uFiches.length} color="#a78bfa"/>
                <Stat icon="ðŸ’°" label="Revenu/mois" value={`â‚¬${revenu}`} sub={`â‚¬${revenu*12}/an`} color="#c6a34e"/>
              </div>
              {uClients.length>0&&<div>
                <div style={{fontSize:11,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>Ses dossiers clients :</div>
                {uClients.map(c=><div key={c.id} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 10px',background:"rgba(255,255,255,.02)",borderRadius:6,marginBottom:4}}>
                  <div style={{fontSize:11,fontWeight:600,color:'#e8e6e0',flex:1}}>{c.nom}</div>
                  <div style={{fontSize:10,color:'#9e9b93'}}>TVA: {c.tva||'-'}</div>
                  <div style={{fontSize:10,color:'#9e9b93'}}>ONSS: {c.onss||'-'}</div>
                  <div style={{fontSize:10,color:'#9e9b93'}}>CP: {c.cp_number||'-'}</div>
                  <div style={{fontSize:10,color:'#9e9b93'}}>{travParClient[c.id]||0} trav.</div>
                  <Badge text={c.active?'Actif':'Inactif'} color={c.active?'#4ade80':'#f87171'}/>
                </div>)}
              </div>}
            </div>;
          })()}
        </div>}
      </div>
    </div>}

    {/* â•â•â• ONGLET: CLIENTS â•â•â• */}
    {sub==='admin_clients'&&<div>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <Stat icon="ðŸ¢" label="Total dossiers" value={totalClients} color="#60a5fa"/>
        <Stat icon="âœ…" label="Actifs" value={activeClients} color="#4ade80"/>
        <Stat icon="â¸" label="Inactifs" value={totalClients-activeClients} color="#fb923c"/>
        <Stat icon="ðŸ‘¥" label="Moy. travailleurs/client" value={moyTravParClient} color="#a78bfa"/>
      </div>

      <div style={{marginBottom:16}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ðŸ” Rechercher un dossier (nom, TVA, ONSS...)" style={{width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(198,163,78,.15)',borderRadius:8,color:'#e8e6e0',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
      </div>

      <div style={{background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)",overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'2.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr',padding:'10px 14px',background:"rgba(198,163,78,.06)",borderBottom:'1px solid rgba(198,163,78,.1)',fontSize:10,fontWeight:600,color:'#c6a34e',textTransform:'uppercase',letterSpacing:.5}}>
          <div>SociÃ©tÃ©</div><div>TVA / ONSS</div><div>CP</div><div>Secteur</div><div>Travailleurs</div><div>Inscription</div><div>Statut</div>
        </div>
        {clients.length===0?<div style={{padding:30,textAlign:'center',color:'#5e5c56',fontSize:12}}>Aucun dossier client.</div>:
        clients.filter(c=>{
          if(!search)return true;
          const s=search.toLowerCase();
          return (c.nom||'').toLowerCase().includes(s)||(c.tva||'').toLowerCase().includes(s)||(c.onss||'').toLowerCase().includes(s);
        }).map((c,i)=>{
          const nb=travParClient[c.id]||0;
          const owner=users.find(u=>u.id===c.user_id);
          return <div key={c.id} style={{display:'grid',gridTemplateColumns:'2.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr',padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11.5,alignItems:'center',background:i%2===0?"transparent":"rgba(255,255,255,.01)"}}>
            <div>
              <div style={{fontWeight:600,color:'#e8e6e0'}}>{c.nom}</div>
              <div style={{fontSize:10,color:'#5e5c56'}}>{c.forme_juridique||'SRL'} Â· {c.ville||'-'} {owner?`Â· ${owner.prenom||''} ${owner.nom||''}`:''}</div>
            </div>
            <div><div style={{fontSize:10.5,color:'#9e9b93'}}>{c.tva||'-'}</div><div style={{fontSize:10,color:'#5e5c56'}}>{c.onss||'-'}</div></div>
            <div style={{color:'#c6a34e',fontWeight:600,fontSize:11}}>{c.cp_number||'-'}</div>
            <div style={{fontSize:10.5,color:'#9e9b93'}}>{c.secteur||'-'}</div>
            <div style={{fontWeight:600,color:nb>0?'#4ade80':'#5e5c56'}}>{nb}</div>
            <div style={{fontSize:10.5,color:'#9e9b93'}}>{fDate(c.created_at)}</div>
            <div><Badge text={c.active?'Actif':'Inactif'} color={c.active?'#4ade80':'#f87171'}/></div>
          </div>;
        })}
      </div>
    </div>}

    {/* â•â•â• ONGLET: STATS â•â•â• */}
    {sub==='admin_stats'&&<div>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <Stat icon="ðŸ‘¤" label="Utilisateurs" value={totalUsers} sub={`${activeUsers} actifs`} color="#c6a34e"/>
        <Stat icon="ðŸ¢" label="Dossiers" value={totalClients} sub={`${activeClients} actifs`} color="#60a5fa"/>
        <Stat icon="ðŸ‘¥" label="Travailleurs" value={totalTrav} sub={`${activeTrav} actifs`} color="#4ade80"/>
        <Stat icon="ðŸ“„" label="Fiches totales" value={totalFiches} color="#a78bfa"/>
        <Stat icon="ðŸ’°" label="Revenu mensuel" value={`â‚¬${revenuMensuelEstime.toLocaleString()}`} color="#c6a34e"/>
        <Stat icon="ðŸ“ˆ" label="Revenu annuel" value={`â‚¬${revenuAnnuelEstime.toLocaleString()}`} color="#4ade80"/>
      </div>

      {/* RÃ©partition par forme juridique */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div style={{padding:16,background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)"}}>
          <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Repartition par forme juridique</div>
          {(()=>{
            const formes={};
            clients.forEach(c=>{const f=c.forme_juridique||'SRL';formes[f]=(formes[f]||0)+1;});
            return Object.entries(formes).sort((a,b)=>b[1]-a[1]).map(([f,n],i)=>{
              const pct=totalClients>0?((n/totalClients)*100).toFixed(1):0;
              return <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <div style={{flex:1,fontSize:11,color:'#e8e6e0'}}>{f}</div>
                <div style={{width:120,height:6,background:"rgba(255,255,255,.05)",borderRadius:3,overflow:'hidden'}}>
                  <div style={{width:`${pct}%`,height:'100%',background:'#c6a34e',borderRadius:3}}/>
                </div>
                <div style={{fontSize:10,color:'#9e9b93',width:50,textAlign:'right'}}>{n} ({pct}%)</div>
              </div>;
            });
          })()}
        </div>

        <div style={{padding:16,background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)"}}>
          <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Repartition par secteur</div>
          {(()=>{
            const secteurs={};
            clients.forEach(c=>{const s=c.secteur||'Non defini';secteurs[s]=(secteurs[s]||0)+1;});
            return Object.entries(secteurs).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([s,n],i)=>{
              const pct=totalClients>0?((n/totalClients)*100).toFixed(1):0;
              return <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <div style={{flex:1,fontSize:11,color:'#e8e6e0',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s}</div>
                <div style={{width:120,height:6,background:"rgba(255,255,255,.05)",borderRadius:3,overflow:'hidden'}}>
                  <div style={{width:`${pct}%`,height:'100%',background:'#60a5fa',borderRadius:3}}/>
                </div>
                <div style={{fontSize:10,color:'#9e9b93',width:50,textAlign:'right'}}>{n} ({pct}%)</div>
              </div>;
            });
          })()}
        </div>
      </div>

      {/* RÃ©partition par CP */}
      <div style={{padding:16,background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)"}}>
        <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>Top Commissions Paritaires</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:8}}>
          {(()=>{
            const cps={};
            clients.forEach(c=>{const cp=c.cp_number||'?';cps[cp]=(cps[cp]||0)+1;});
            return Object.entries(cps).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([cp,n],i)=><div key={i} style={{padding:'8px 12px',background:"rgba(198,163,78,.04)",borderRadius:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>CP {cp}</div>
              <div style={{fontSize:11,color:'#c6a34e',fontWeight:600}}>{n}</div>
            </div>);
          })()}
        </div>
      </div>

      {/* Revenue projection */}
      <div style={{marginTop:16,padding:16,background:"rgba(198,163,78,.04)",borderRadius:12,border:"1px solid rgba(198,163,78,.15)"}}>
        <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>ðŸ’° Projection revenus (modele â‚¬12/fiche/mois)</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
          {[
            {l:'Actuel',users:totalUsers,trav:totalTrav},
            {l:'+3 mois',users:Math.ceil(totalUsers*1.5)||5,trav:Math.ceil(totalTrav*1.5)||50},
            {l:'+6 mois',users:Math.ceil(totalUsers*3)||15,trav:Math.ceil(totalTrav*3)||150},
            {l:'+12 mois',users:Math.ceil(totalUsers*8)||50,trav:Math.ceil(totalTrav*8)||500},
          ].map((p,i)=><div key={i} style={{padding:12,background:"rgba(255,255,255,.03)",borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:10,color:'#9e9b93',marginBottom:4}}>{p.l}</div>
            <div style={{fontSize:10,color:'#5e5c56'}}>{p.users} users Â· {p.trav} trav.</div>
            <div style={{fontSize:18,fontWeight:700,color:'#4ade80',marginTop:4}}>â‚¬{(p.trav*12).toLocaleString()}</div>
            <div style={{fontSize:10,color:'#5e5c56'}}>/mois</div>
            <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginTop:2}}>â‚¬{(p.trav*12*12).toLocaleString()}/an</div>
          </div>)}
        </div>
      </div>
    </div>}

    {/* â•â•â• ONGLET: AUDIT â•â•â• */}
    {sub==='admin_audit'&&<div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {['7','30','90','365'].map(d=><button key={d} onClick={()=>setDateRange(d)} style={{padding:'6px 14px',borderRadius:8,border:dateRange===d?'1px solid rgba(198,163,78,.4)':'1px solid rgba(255,255,255,.06)',background:dateRange===d?"rgba(198,163,78,.12)":"rgba(255,255,255,.02)",color:dateRange===d?'#c6a34e':'#9e9b93',fontSize:11,cursor:'pointer'}}>{d==='365'?'1 an':`${d} jours`}</button>)}
      </div>
      
      <div style={{background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)",overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'1.5fr 1.5fr 2fr 2fr 2fr',padding:'10px 14px',background:"rgba(198,163,78,.06)",borderBottom:'1px solid rgba(198,163,78,.1)',fontSize:10,fontWeight:600,color:'#c6a34e',textTransform:'uppercase',letterSpacing:.5}}>
          <div>Date</div><div>Utilisateur</div><div>Action</div><div>Table</div><div>Details</div>
        </div>
        {audit.length===0?<div style={{padding:30,textAlign:'center',color:'#5e5c56',fontSize:12}}>
          Aucune entree dans le journal d'audit. Les actions seront enregistrees automatiquement.
        </div>:
        audit.filter(a=>{
          const d=new Date(a.created_at);
          const now=new Date();
          return (now-d)<(parseInt(dateRange)*86400000);
        }).map((a,i)=>{
          const usr=users.find(u=>u.id===a.user_id);
          return <div key={a.id} style={{display:'grid',gridTemplateColumns:'1.5fr 1.5fr 2fr 2fr 2fr',padding:'8px 14px',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11,alignItems:'center',background:i%2===0?"transparent":"rgba(255,255,255,.01)"}}>
            <div style={{color:'#9e9b93',fontSize:10}}>{fDateTime(a.created_at)}</div>
            <div style={{color:'#e8e6e0'}}>{usr?`${usr.prenom||''} ${usr.nom||''}`:a.user_id?.slice(0,8)||'-'}</div>
            <div><Badge text={a.action} color={a.action?.includes('create')?'#4ade80':a.action?.includes('delete')?'#f87171':'#60a5fa'}/></div>
            <div style={{color:'#9e9b93'}}>{a.table_name||'-'}</div>
            <div style={{fontSize:10,color:'#5e5c56',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.details?JSON.stringify(a.details).slice(0,60):'-'}</div>
          </div>;
        })}
      </div>
    </div>}

    {/* â•â•â• ONGLET: BILLING â•â•â• */}
    {sub==='admin_billing'&&<div>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <Stat icon="ðŸ’°" label="Revenu mensuel" value={`â‚¬${revenuMensuelEstime.toLocaleString()}`} color="#4ade80"/>
        <Stat icon="ðŸ“ˆ" label="Revenu annuel" value={`â‚¬${revenuAnnuelEstime.toLocaleString()}`} color="#c6a34e"/>
        <Stat icon="ðŸ‘¥" label="Fiches facturables" value={totalTrav} sub="travailleurs actifs" color="#60a5fa"/>
        <Stat icon="ðŸ¢" label="Clients facturables" value={activeClients} color="#a78bfa"/>
      </div>

      {/* Facturation par client */}
      <div style={{background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)",overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'2.5fr 1fr 1fr 1fr 1fr 1fr',padding:'10px 14px',background:"rgba(198,163,78,.06)",borderBottom:'1px solid rgba(198,163,78,.1)',fontSize:10,fontWeight:600,color:'#c6a34e',textTransform:'uppercase',letterSpacing:.5}}>
          <div>Client</div><div>Travailleurs</div><div>Tarif/fiche</div><div>Mensuel</div><div>Annuel</div><div>Entree</div>
        </div>
        {clients.filter(c=>c.active).map((c,i)=>{
          const nb=travParClient[c.id]||0;
          const tarif=nb<=5?15:nb<=20?12:nb<=50?9:nb<=100?7:5;
          const mensuel=nb*tarif;
          const annuel=mensuel*12;
          const entree=nb<=5?149:nb<=20?299:nb<=50?499:999;
          return <div key={c.id} style={{display:'grid',gridTemplateColumns:'2.5fr 1fr 1fr 1fr 1fr 1fr',padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11.5,alignItems:'center',background:i%2===0?"transparent":"rgba(255,255,255,.01)"}}>
            <div style={{fontWeight:600,color:'#e8e6e0'}}>{c.nom}</div>
            <div style={{color:'#9e9b93'}}>{nb}</div>
            <div style={{color:'#c6a34e',fontWeight:600}}>â‚¬{tarif}</div>
            <div style={{color:'#4ade80',fontWeight:600}}>â‚¬{mensuel}</div>
            <div style={{color:'#60a5fa'}}>â‚¬{annuel.toLocaleString()}</div>
            <div style={{color:'#a78bfa'}}>â‚¬{entree}</div>
          </div>;
        })}
        {/* Total row */}
        <div style={{display:'grid',gridTemplateColumns:'2.5fr 1fr 1fr 1fr 1fr 1fr',padding:'12px 14px',background:"rgba(198,163,78,.08)",fontSize:12,fontWeight:700,alignItems:'center',borderTop:'2px solid rgba(198,163,78,.2)'}}>
          <div style={{color:'#c6a34e'}}>TOTAL</div>
          <div style={{color:'#e8e6e0'}}>{totalTrav}</div>
          <div style={{color:'#9e9b93'}}>-</div>
          <div style={{color:'#4ade80'}}>â‚¬{revenuMensuelEstime.toLocaleString()}</div>
          <div style={{color:'#60a5fa'}}>â‚¬{revenuAnnuelEstime.toLocaleString()}</div>
          <div style={{color:'#a78bfa'}}>â‚¬{clients.filter(c=>c.active).reduce((sum,c)=>{const nb=travParClient[c.id]||0;return sum+(nb<=5?149:nb<=20?299:nb<=50?499:999);},0).toLocaleString()}</div>
        </div>
      </div>

      <div style={{marginTop:16,padding:12,background:"rgba(96,165,250,.06)",borderRadius:8,fontSize:11,color:'#60a5fa',lineHeight:1.6}}>
        â„¹ï¸ La grille tarifaire appliquee: 1-5 trav. = â‚¬15/fiche Â· 6-20 = â‚¬12 Â· 21-50 = â‚¬9 Â· 51-100 = â‚¬7 Â· 100+ = â‚¬5. Frais d'entree: Starter â‚¬149 Â· Business â‚¬299 Â· Premium â‚¬499 Â· Enterprise â‚¬999.
      </div>
    </div>}

    </div>
  </div>;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  GUIDE PORTAIL ONSS â€” PAS A PAS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  BELCOTAX
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function BelcotaxPage({s,d}) {
  const [yr,setYr]=useState(new Date().getFullYear()-1);
  const [ft,setFt]=useState('10');
  const [tab,setTab]=useState('gen');
  const [allXml,setAllXml]=useState('');
  const ae=(s.emps||[]).filter(e=>e.status==='active');

  // Validation
  const warnings=[];
  ae.forEach(e=>{
    if(!e.niss) warnings.push({emp:`${e.first||e.fn||'Emp'} ${e.last||''}`,msg:'NISS manquant â€” fiche invalide'});
    if(!e.addr&&!e.zip) warnings.push({emp:`${e.first||e.fn||'Emp'} ${e.last||''}`,msg:'Adresse incomplÃ¨te'});
  });
  if(!s.co.onss) warnings.push({emp:'Employeur',msg:'Matricule ONSS manquant'});
  if(!s.co.vat) warnings.push({emp:'Employeur',msg:'NumÃ©ro TVA manquant'});

  const gen=()=>{
    const xmlParts=[];
    ae.forEach(emp=>{
      const p=calc(emp,DPER,s.co);
      const ad={gross:p.gross*12,onss:p.onssNet*12,empB:p.empBonus*12,tax:p.tax*12,css:p.css*12,mvC:Math.round(p.mvDays*12),mvE:p.mvEmployer*12,tr:p.transport*12,atnCar:(p.atnCar||0)*12,atnAutres:(p.atnAutresTot||0)*12,pensionCompl:(p.pensionCompl||0)*12,fraisPropres:((p.expense||0)+(p.indemTeletravail||0)+(p.indemBureau||0))*12,ecoCheques:(p.ecoCheques||0)*12};
      const xml=genBelcotax(s.co,emp,yr,ad);
      xmlParts.push(xml);
      d({type:"ADD_F",d:{eid:emp.id,ename:`${emp.first||emp.fn||emp.prenom||''} ${emp.last||emp.ln||emp.nom||''}`.trim()||'Sans nom',yr,ft,ftl:LEGAL.FICHE_281[ft],ag:ad.gross,an:p.net*12,aonss:ad.onss,atax:ad.tax,acss:ad.css,xml,at:new Date().toISOString()}});
    });
    // RÃ©capitulatif XML global BelcotaxOnWeb
    const globalXml=`<?xml version="1.0" encoding="UTF-8"?>\n<!-- BelcotaxOnWeb â€” Fichier recapitulatif -->\n<!-- ${ae.length} fiche(s) 281.${ft} â€” Annee ${yr} -->\n<!-- GÃ©nÃ©rÃ© par: Aureus Social Pro -->\n<Belcotax xmlns="urn:belcotax:${yr}">\n  <Verzending>\n    <Aangiftenr>BELCO${Date.now().toString(36).toUpperCase()}</Aangiftenr>\n    <Aangiftetype>281.${ft}</Aangiftetype>\n    <AangifteJaar>${yr}</AangifteJaar>\n    <AantalOpgaven>${ae.length}</AantalOpgaven>\n    <Schuldenaar>\n      <KBO>${(s.co.bce||s.co.vat||'').replace(/[^0-9]/g,"")}</KBO>\n      <Naam>${s.co.name}</Naam>\n      <Adres>${s.co.addr}</Adres>\n    </Schuldenaar>\n  </Verzending>\n</Belcotax>`;
    setAllXml(globalXml);
  };

  // Stats from fiches
  const fichesYr=s.fiches.filter(f2=>f2.yr==yr);
  const totBrut=fichesYr.reduce((a,f2)=>a+(f2.ag||0),0);
  const totNet=fichesYr.reduce((a,f2)=>a+(f2.an||0),0);

  return <div>
    <PH title="Fiches Fiscales BELCOTAX" sub="BelcotaxOnWeb â€” SPF Finances"/>
    <div style={{marginBottom:14,padding:"10px 14px",background:"linear-gradient(135deg,rgba(239,68,68,.06),rgba(239,68,68,.02))",border:"1px solid rgba(239,68,68,.1)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontSize:11,color:"#888"}}>âš¡ Belcotax 281.10 auto-gÃ©nÃ©rÃ©es en janvier</div><button onClick={()=>{if(confirm("GÃ©nÃ©rer Belcotax ?")){ (s.emps||[]).forEach(e=>generateBelcotaxXML(e,s.co));alert("âœ… Belcotax gÃ©nÃ©rÃ©es")}}} style={{padding:"6px 14px",borderRadius:8,border:"none",background:"#ef4444",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:600}}>âš¡ GÃ©nÃ©rer tout</button></div>
    {/* Stats */}
    <div style={{display:'flex',gap:12,marginBottom:18}}>
      {[{l:"Fiches gÃ©nÃ©rÃ©es",v:fichesYr.length,c:'#c6a34e'},{l:"Brut total",v:fmt(totBrut),c:'#e8e6e0'},{l:"Net total",v:fmt(totNet),c:'#4ade80'},{l:"Travailleurs actifs",v:ae.length,c:'#60a5fa'}].map((st,i)=>
        <div key={i} style={{flex:1,padding:'12px 16px',background:"rgba(198,163,78,.04)",borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}>
          <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'.5px'}}>{st.l}</div>
          <div style={{fontSize:typeof st.v==='number'?22:16,fontWeight:700,color:st.c,marginTop:2}}>{st.v}</div>
        </div>
      )}
    </div>
    {/* Tabs */}
    <div style={{display:'flex',gap:6,marginBottom:16}}>
      {[{v:"gen",l:"GÃ©nÃ©ration"},{v:"fiches",l:"Fiches gÃ©nÃ©rÃ©es"},{v:"deadlines",l:"Ã‰chÃ©ances & RÃ¨gles"}].map(t=>
        <button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',
          background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>
      )}
    </div>

    {tab==='gen'&&<div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
      <div>
        <C><ST>ParamÃ¨tres</ST>
          <I label="AnnÃ©e de revenus" type="number" value={yr} onChange={v=>setYr(v)}/>
          <I label="Type de fiche" value={ft} onChange={v=>setFt(v)} style={{marginTop:9}} options={Object.entries(LEGAL.FICHE_281).map(([k,v2])=>({v:k,l:`281.${k} â€” ${v2}`}))}/>
          <B onClick={gen} style={{width:'100%',marginTop:14}}>GÃ©nÃ©rer toutes les 281.{ft} ({ae.length} fiches)</B>
          {allXml&&<div style={{marginTop:12}}>
            <B v="outline" style={{width:'100%',fontSize:11}} onClick={()=>d({type:"MODAL",m:{w:800,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>RÃ©capitulatif BelcotaxOnWeb</h3><pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:400,overflowY:'auto'}}>{allXml}</pre><div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B><B onClick={()=>{navigator.clipboard?.writeText(allXml);alert('CopiÃ© !')}}>Copier</B></div></div>}})}>Voir XML rÃ©capitulatif</B>
          </div>}
        </C>
        {warnings.length>0&&<C style={{marginTop:12,borderColor:'rgba(239,68,68,.15)'}}><ST>Anomalies ({warnings.length})</ST>
          {warnings.map((w,i)=><div key={i} style={{fontSize:10.5,color:'#9e9b93',padding:'4px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <b style={{color:'#f87171'}}>{w.emp}</b>: {w.msg}
          </div>)}
        </C>}
        <C style={{marginTop:12}}><ST>Types disponibles</ST>
          {Object.entries(LEGAL.FICHE_281).map(([k,v2])=><div key={k} style={{fontSize:10.5,color:'#9e9b93',padding:'3px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><b style={{color:'#d4d0c8'}}>281.{k}</b> â€” {v2}</div>)}
        </C>
      </div>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>AperÃ§u â€” 281.{ft} annÃ©e {yr}</div></div>
        <Tbl cols={[
          {k:'n',l:"Travailleur",b:1,r:r=>`${r.first} ${r.last}`},
          {k:'niss',l:"NISS",r:r=><span style={{fontFamily:'monospace',fontSize:10,color:r.niss?'#9e9b93':'#f87171'}}>{r.niss||'MANQUANT'}</span>},
          {k:'g',l:"Brut annuel",a:'right',r:r=>{const p=calc(r,DPER,s.co);return fmt(p.gross*12)}},
          {k:'t',l:"PP annuel",a:'right',r:r=>{const p=calc(r,DPER,s.co);return <span style={{color:'#f87171'}}>{fmt(p.tax*12)}</span>}},
          {k:'ne',l:"Net annuel",a:'right',r:r=>{const p=calc(r,DPER,s.co);return <span style={{color:'#4ade80'}}>{fmt(p.net*12)}</span>}},
        ]} data={ae}/>
      </C>
    </div>}

    {tab==='fiches'&&<C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Fiches gÃ©nÃ©rÃ©es ({s.fiches.length})</div></div>
      <Tbl cols={[
        {k:'y',l:"AnnÃ©e",r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{r.yr}</span>},
        {k:'t',l:"Type",r:r=>`281.${r.ft}`},{k:'e',l:"EmployÃ©",r:r=>r.ename},
        {k:'g',l:"Brut annuel",a:'right',r:r=>fmt(r.ag)},
        {k:'n',l:"Net annuel",a:'right',r:r=><span style={{color:'#4ade80'}}>{fmt(r.an)}</span>},
        {k:'x',l:"",a:'right',r:r=><B v="ghost" style={{padding:'3px 8px',fontSize:10}} onClick={()=>d({type:"MODAL",m:{w:800,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>281.{r.ft} â€” {r.ename} ({r.yr})</h3><pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:380,overflowY:'auto'}}>{r.xml}</pre><div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B><B onClick={()=>{navigator.clipboard?.writeText(r.xml);alert('CopiÃ© !')}}>Copier</B></div></div>}})}>XML</B>},
      ]} data={s.fiches}/>
    </C>}

    {tab==='deadlines'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <C><ST>Ã‰chÃ©ances BelcotaxOnWeb</ST>
        <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          {[{l:"281.10 RÃ©munÃ©rations",dl:"28/02 (N+1)",note:"Obligatoire pour tous les employeurs"},{l:"281.20 Dirigeants",dl:"28/02 (N+1)",note:"Administrateurs, gÃ©rants"},{l:"281.50 Honoraires/Commissions",dl:"30/06 (N+1)",note:"plus de 250 EUR/an/bÃ©nÃ©ficiaire"},{l:"281.30 Jetons prÃ©sence",dl:"28/02 (N+1)",note:"Membres CA, ASBL"},{l:"Rectificative",dl:"Pas de deadline fixe",note:"Via BelcotaxOnWeb portail SPF"}].map((r,i)=>
            <div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><b style={{color:'#e8e6e0'}}>{r.l}</b><span style={{color:'#c6a34e',fontWeight:600}}>{r.dl}</span></div>
              <div style={{fontSize:10,color:'#5e5c56'}}>{r.note}</div>
            </div>
          )}
        </div>
      </C>
      <C><ST>ProcÃ©dure</ST>
        <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          {['1. GÃ©nÃ©rer les fiches 281.xx dans Aureus Social Pro',"2. VÃ©rifier les donnÃ©es (NISS, montants, adresses)","3. Exporter le XML rÃ©capitulatif","4. Se connecter Ã  BelcotaxOnWeb (MyMinfin)","5. Uploader le fichier XML","6. Valider et envoyer","7. Conserver l'accusÃ© de rÃ©ception"].map((step,i)=>
            <div key={i} style={{padding:'4px 0'}}>{step}</div>
          )}
        </div>
        <div style={{marginTop:14,padding:10,background:"rgba(96,165,250,.06)",borderRadius:8,fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
          <b>Portail:</b> finances.belgium.be/fr/E-services/Belcotaxonweb<br/>
          <b>Helpdesk SPF:</b> 0257/257 57<br/>
          <b>Format XML:</b> Conforme XSD BelcotaxOnWeb v{yr}
        </div>
      </C>
    </div>}
  </div>;
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  PRÃ‰COMPTE 274
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function PrecomptePage({s,d}) {
  const [mode,setMode]=useState('mensuel');
  const [m,setM]=useState(new Date().getMonth()+1);
  const [q,setQ]=useState(Math.ceil((new Date().getMonth()+1)/3));
  const [y,setY]=useState(new Date().getFullYear());
  const ae=(s.emps||[]).filter(e=>e.status==='active');

  // Calcul mensuel
  const detMens=ae.map(e=>{const p=calc(e,{...DPER,month:m,year:y},s.co);return{e,tax:p.tax,gross:p.gross};});
  const totMens=detMens.reduce((a,r)=>a+r.tax,0);

  // Calcul trimestriel (3 mois cumulÃ©s)
  const qMonths=[(q-1)*3+1,(q-1)*3+2,(q-1)*3+3];
  const detTrim=ae.map(e=>{
    let taxQ=0,grossQ=0;
    qMonths.forEach(mo=>{const p=calc(e,{...DPER,month:mo,year:y},s.co);taxQ+=p.tax;grossQ+=p.gross;});
    return{e,tax:taxQ,gross:grossQ};
  });
  const totTrim=detTrim.reduce((a,r)=>a+r.tax,0);

  // Seuil: PP annÃ©e N-1 > 50 240â‚¬ â†’ obligatoirement mensuel
  const ppAnnuel=totMens*12;
  const seuilMensuel=50240;
  const obligMensuel=ppAnnuel>seuilMensuel;

  const det=mode==='mensuel'?detMens:detTrim;
  const tot=mode==='mensuel'?totMens:totTrim;

  // Calendrier SPF 2026
  const calMens=[{p:'Janvier 2026',dl:"13/02/2026"},{p:'FÃ©vrier 2026',dl:"13/03/2026"},{p:'Mars 2026',dl:"15/04/2026"},{p:'Avril 2026',dl:"15/05/2026"},{p:'Mai 2026',dl:"15/06/2026"},{p:'Juin 2026',dl:"15/07/2026"},{p:'Juillet 2026',dl:"14/08/2026"},{p:'AoÃ»t 2026',dl:"15/09/2026"},{p:'Septembre 2026',dl:"15/10/2026"},{p:'Octobre 2026',dl:"13/11/2026"},{p:'Novembre 2026',dl:"15/12/2026"},{p:'DÃ©cembre 2026',dl:"15/01/2027"}];
  const calTrim=[{p:'T1 2026',dl:"15/04/2026"},{p:'T2 2026',dl:"15/07/2026"},{p:'T3 2026',dl:"15/10/2026"},{p:'T4 2026',dl:"15/01/2027"}];

  return <div>
    <PH title="PrÃ©compte Professionnel 274" sub="DÃ©claration et versement â€” FINPROF"/>
    <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:18}}>
      <div>
      <C><ST>Configuration</ST>
        <I label="PÃ©riodicitÃ©" value={mode} onChange={setMode} options={[{v:"mensuel",l:"Mensuel"},{v:"trimestriel",l:"Trimestriel"}]}/>
        {mode==='mensuel'?<I label="Mois" value={m} onChange={v=>setM(parseInt(v))} options={MN.map((x,i)=>({v:i+1,l:x}))} style={{marginTop:9}}/>
        :<I label="Trimestre" value={q} onChange={v=>setQ(parseInt(v))} options={[{v:1,l:"T1 (jan-mar)"},{v:2,l:"T2 (avr-jun)"},{v:3,l:"T3 (jul-sep)"},{v:4,l:"T4 (oct-dÃ©c)"}]} style={{marginTop:9}}/>}
        <I label="AnnÃ©e" type="number" value={y} onChange={v=>setY(v)} style={{marginTop:9}}/>
        <div style={{marginTop:18,padding:14,background:"rgba(198,163,78,.06)",borderRadius:8,border:'1px solid rgba(198,163,78,.1)',textAlign:'center'}}>
          <div style={{fontSize:10.5,color:'#9e9b93',textTransform:'uppercase',letterSpacing:'1px'}}>Total Ã  verser</div>
          <div style={{fontSize:26,fontWeight:700,color:'#c6a34e',marginTop:6}}>{fmt(tot)}</div>
          <div style={{fontSize:10.5,color:'#5e5c56',marginTop:3}}>{mode==='mensuel'?`${MN[m-1]} ${y}`:`T${q} ${y}`} Â· {ae.length} trav.</div>
        </div>
        {obligMensuel&&mode==='trimestriel'&&<div style={{marginTop:10,padding:8,background:"rgba(239,68,68,.08)",borderRadius:6,border:'1px solid rgba(239,68,68,.15)',fontSize:10.5,color:'#ef4444'}}>
          <b>âš </b> PP annuel estimÃ© ({fmt(ppAnnuel)}) dÃ©passe le seuil de {fmt(seuilMensuel)}. DÃ©claration <b>mensuelle obligatoire</b>.
        </div>}
        <div style={{marginTop:14,padding:10,background:"rgba(96,165,250,.06)",borderRadius:8,border:'1px solid rgba(96,165,250,.1)'}}>
          <div style={{fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
            <b>Seuil:</b> PP N-1 {'>'} 50 240â‚¬ â†’ mensuel<br/>
            <b>Ã‰chÃ©ance:</b> 15 du mois suivant (mensuel) ou 15 du mois suivant le trimestre<br/>
            <b>DÃ©claration:</b> Via FINPROF (application SPF Finances)
          </div>
        </div>
      </C>
      <C style={{marginTop:12}}><ST>Calendrier SPF {y}</ST>
        <div style={{maxHeight:200,overflow:'auto'}}>
        {(mode==='mensuel'?calMens:calTrim).map((c,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11}}>
          <span style={{color:'#9e9b93'}}>{c.p}</span><span style={{fontWeight:600,color:i===((mode==='mensuel'?m:q)-1)?'#c6a34e':'#d4d0c8'}}>{c.dl}</span>
        </div>)}
        </div>
      </C>
      </div>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>DÃ©tail â€” {mode==='mensuel'?`${MN[m-1]} ${y}`:`T${q} ${y} (${qMonths.map(mo=>MN[mo-1]).join(' + ')})`}</div></div>
        <Tbl cols={[
          {k:'n',l:"Travailleur",r:r=><span style={{fontWeight:500}}>{r.e.first} {r.e.last}</span>},
          {k:'g',l:mode==='mensuel'?'Brut':'Brut cumulÃ©',a:'right',r:r=>fmt(r.gross)},
          {k:'t',l:mode==='mensuel'?'PrÃ©compte':'PP cumulÃ©',a:'right',r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{fmt(r.tax)}</span>},
        ]} data={det}/>
        {det.length>0&&<div style={{padding:'12px 18px',borderTop:'1px solid rgba(139,115,60,.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',gap:8}}>
            <B v="outline" style={{fontSize:10.5,padding:'6px 12px'}} onClick={()=>{
              const periode=mode==='mensuel'?`${String(m).padStart(2,"0")}/${y}`:`T${q}/${y}`;
              const xml274=`<?xml version="1.0" encoding="UTF-8"?>\n<!-- Declaration Precompte Professionnel 274 -->\n<!-- SPF Finances â€” FINPROF -->\n<!-- GÃ©nÃ©rÃ© par: Aureus Social Pro -->\n<PP274 xmlns="urn:pp274:${y}">\n  <Declaration>\n    <Periode>${periode}</Periode>\n    <Periodicite>${mode}</Periodicite>\n    <Employeur>\n      <KBO>${(s.co.bce||s.co.vat||'').replace(/[^0-9]/g,"")}</KBO>\n      <ONSS>${(s.co.onss||'').replace(/[^0-9]/g,"")}</ONSS>\n      <Naam>${s.co.name}</Naam>\n    </Employeur>\n    <NbrTravailleurs>${ae.length}</NbrTravailleurs>\n    <TotalBrut>${det.reduce((a,r)=>a+r.gross,0).toFixed(2)}</TotalBrut>\n    <TotalPrecompte>${tot.toFixed(2)}</TotalPrecompte>\n${det.map(r=>`    <Travailleur>\n      <Naam>${r.e.last||''} ${r.e.first||''}</Naam>\n      <INSZ>${(r.e.niss||'').replace(/[\\.-\\s]/g,"")}</INSZ>\n      <Brut>${r.gross.toFixed(2)}</Brut>\n      <PP>${r.tax.toFixed(2)}</PP>\n    </Travailleur>`).join('\n')}\n  </Declaration>\n</PP274>`;
              d({type:"MODAL",m:{w:850,c:<div>
                <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 6px',fontFamily:"'Cormorant Garamond',serif"}}>DÃ©claration PP 274 â€” {periode}</h2>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:"rgba(74,222,128,.1)",color:'#4ade80',fontWeight:600}}>âœ“ XML gÃ©nÃ©rÃ©</span>
                  <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:"rgba(198,163,78,.1)",color:'#c6a34e',fontWeight:600}}>{ae.length} trav. Â· {fmt(tot)}</span>
                </div>
                <pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:350,overflowY:'auto'}}>{xml274}</pre>
                <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}>
                  <B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B>
                  <B onClick={()=>{navigator.clipboard?.writeText(xml274);alert('XML 274 copiÃ© !')}}>Copier XML</B>
                </div>
              </div>}});
            }}>GÃ©nÃ©rer XML 274</B>
          </div>
          <div style={{display:'flex',gap:16,alignItems:'center'}}><span style={{fontSize:12,color:'#9e9b93'}}>TOTAL:</span><span style={{fontSize:14,fontWeight:700,color:'#c6a34e'}}>{fmt(tot)}</span></div>
        </div>}
      </C>
    </div>
  </div>;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  DOCUMENTS SOCIAUX
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function DocsPage({s,d}) {
  const [dt,setDt]=useState('C4');
  const [eid,setEid]=useState((s.emps||[])[0]?.id||'');
  const [endD,setEndD]=useState(new Date().toISOString().split('T')[0]);
  const [reason,setReason]=useState('Licenciement');
  const emp=(s.emps||[]).find(e=>e.id===eid);

  const gen=()=>{if(!emp)return;
    const fields=dt==='C4'?[
      {l:"Employeur",v:s.co.name},{l:"NÂ° ONSS",v:s.co.onss},{l:"Travailleur",v:`${emp.first} ${emp.last}`},{l:"NISS",v:emp.niss},
      {l:"Fonction",v:emp.fn},{l:"CP",v:`CP ${emp.cp}`},{l:"EntrÃ©e",v:emp.startD},{l:"Sortie",v:endD},{l:"Motif",v:reason},
      {l:"Dernier brut",v:fmt(emp.monthlySalary)},{l:"RÃ©gime",v:`${emp.whWeek}h/sem`},
    ]:dt==='VACATION'?[
      {l:"Employeur",v:s.co.name},{l:"Travailleur",v:`${emp.first} ${emp.last}`},{l:"AnnÃ©e rÃ©f.",v:`${new Date().getFullYear()-1}`},
      {l:"Jours vacances",v:"20 jours"},{l:"Simple pÃ©cule",v:fmt(emp.monthlySalary)},{l:"Double pÃ©cule (92% brut)",v:fmt(emp.monthlySalary*PV_DOUBLE)},{l:"  dont 1Ã¨re partie (85%)",v:fmt(emp.monthlySalary*0.85)},{l:"  dont 2Ã¨me partie (7%)",v:fmt(emp.monthlySalary*0.07)},{l:"ONSS sur 2Ã¨me partie",v:fmt(emp.monthlySalary*0.07*TX_ONSS_W)},
    ]:[{l:"Employeur",v:s.co.name},{l:"Travailleur",v:`${emp.first} ${emp.last}`},{l:"Date",v:new Date().toLocaleDateString('fr-BE')}];

    const title=LEGAL.SOCIAL_DOCS[dt]||dt;
    d({type:"ADD_DOC",d:{eid:emp.id,ename:`${emp.first||emp.fn||emp.prenom||''} ${emp.last||emp.ln||emp.nom||''}`.trim()||'Sans nom',dt,title,fields,at:new Date().toISOString()}});
    d({type:"MODAL",m:{w:580,c:<div>
      <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 3px',fontFamily:"'Cormorant Garamond',serif"}}>{title}</h2>
      <div style={{fontSize:10.5,color:'#c6a34e',marginBottom:16}}>{s.co.name}</div>
      <div style={{padding:18,background:"#faf9f4",borderRadius:10,color:'#1a1a18'}}>
        {fields.map((f,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #eee',fontSize:12.5}}><span style={{color:'#888'}}>{f.l}</span><span style={{fontWeight:500}}>{f.v}</span></div>)}
        <div style={{marginTop:22,display:'flex',justifyContent:'space-between'}}>
          <div style={{fontSize:10.5,color:'#999'}}>Fait le {new Date().toLocaleDateString('fr-BE')}</div>
          <div style={{fontSize:10.5,color:'#999',textAlign:'right'}}>Signature<br/><br/>_____________________</div>
        </div>
      </div>
      <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B></div>
    </div>}});
  };
  return <div>
    <PH title="Documents Sociaux" sub="C4, attestations, certificats"/>
    <div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
      <C><ST>Nouveau document</ST>
        <I label="Type" value={dt} onChange={setDt} options={Object.entries(LEGAL.SOCIAL_DOCS).map(([k,v])=>({v:k,l:v}))}/>
        <I label="EmployÃ©" value={eid} onChange={setEid} style={{marginTop:9}} options={(s.emps||[]).map(e=>({v:e.id,l:`${e.first||e.fn||'Emp'} ${e.last||''}`}))}/>
        {dt==='C4'&&<><I label="Date sortie" type="date" value={endD} onChange={setEndD} style={{marginTop:9}}/>
          <I label="Motif" value={reason} onChange={setReason} style={{marginTop:9}} options={[{v:"Licenciement",l:"Licenciement"},{v:"DÃ©mission",l:"DÃ©mission"},{v:"Fin CDD",l:"Fin de CDD"},{v:"Commun accord",l:"Commun accord"},{v:"Faute grave",l:"Faute grave"}]}/></>}
        <B onClick={gen} style={{width:'100%',marginTop:14}}>GÃ©nÃ©rer</B>
      </C>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Documents gÃ©nÃ©rÃ©s</div></div>
        <Tbl cols={[
          {k:'t',l:"Type",r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{r.title}</span>},
          {k:'e',l:"EmployÃ©",r:r=>r.ename},
          {k:'d',l:"Date",r:r=>new Date(r.at).toLocaleDateString('fr-BE')},
        ]} data={s.docs}/>
      </C>
    </div>
  </div>;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  REPORTS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function ReportsPage({s,d}) {
  const ae=(s.emps||[]).filter(e=>e.status==='active');
  const md=ae.map(e=>{const p=calc(e,DPER,s.co);return{name:`${e.first||e.fn||'Emp'} ${e.last||''}`,gross:p.gross,onssW:p.onssNet,tax:p.tax,css:p.css,net:p.net,onssE:p.onssE,cost:p.costTotal};});
  const t=md.reduce((a,r)=>({g:a.g+r.gross,ow:a.ow+r.onssW,tx:a.tx+r.tax,cs:a.cs+r.css,n:a.n+r.net,oe:a.oe+r.onssE,co:a.co+r.cost}),{g:0,ow:0,tx:0,cs:0,n:0,oe:0,co:0});
  return <div>
    <PH title="Rapports" sub="Analyse masse salariale"/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:22}}>
      <SC label="Masse brute" value={fmt(t.g)} color="#60a5fa"/>
      <SC label="Charges ONSS" value={fmt(t.ow+t.oe)} color="#f87171" sub={`Trav: ${fmt(t.ow)} Â· Empl: ${fmt(t.oe)}`}/>
      <SC label="PrÃ©compte" value={fmt(t.tx)} color="#a78bfa"/>
      <SC label="CoÃ»t employeur" value={fmt(t.co)} color="#c6a34e" sub={`Net: ${fmt(t.n)}`}/>
    </div>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>DÃ©tail mensuel</div></div>
      <Tbl cols={[{k:'name',l:"EmployÃ©",b:1},{k:'g',l:"Brut",a:'right',r:r=>fmt(r.gross)},{k:'o',l:"ONSS",a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.onssW)}</span>},{k:'t',l:"PrÃ©c.",a:'right',r:r=><span style={{color:'#a78bfa'}}>{fmt(r.tax)}</span>},{k:'n',l:"Net",a:'right',r:r=><span style={{fontWeight:700,color:'#4ade80'}}>{fmt(r.net)}</span>},{k:'e',l:"ONSS empl.",a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.onssE)}</span>},{k:'c',l:"CoÃ»t",a:'right',r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{fmt(r.cost)}</span>}]} data={md}/>
    </C>
    <C style={{marginTop:18}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:14}}>Projection annuelle</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {[{l:"Masse brute",v:t.g*12,c:'#60a5fa'},{l:"Charges sociales",v:(t.ow+t.oe)*12,c:'#f87171'},{l:"Net versÃ©",v:t.n*12,c:'#4ade80'},{l:"CoÃ»t total",v:t.co*12,c:'#c6a34e'}].map((x,i)=>
          <div key={i} style={{textAlign:'center',padding:14,background:`${x.c}08`,borderRadius:8}}><div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>{x.l}</div><div style={{fontSize:18,fontWeight:700,color:x.c,marginTop:5}}>{fmt(x.v)}</div></div>
        )}
      </div>
    </C>
  </div>;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SETTINGS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  FRAIS DE GESTION â€” Grille tarifaire secrÃ©tariat social
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•


// â”€â”€ Sprint 17d: Backup & Restore System â”€â”€
function exportBackup(state){
  const backup={
    version:'v38',
    date:new Date().toISOString(),
    app:'Aureus Social Pro',
    data:{
      company:state.co||{},
      employees:state.emps||[],
      payslips:state.pays||[],
      clients:state.clients||[],
      activeClient:state.activeClient||null,
      settings:state.settings||{}
    }
  };
  const json=JSON.stringify(backup,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const d=new Date();
  a.href=url;
  a.download='AureusSocial_Backup_'+d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0')+'_'+d.getHours().toString().padStart(2,'0')+'h'+d.getMinutes().toString().padStart(2,'0')+'.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},3000);
  return a.download;
}

function importBackup(file,dispatch){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=function(e){
      try{
        const backup=(()=>{try{return JSON.parse(e.target.result)}catch(e){return null}})();
        if(!backup.data||!backup.app){reject('Fichier invalide');return;}
        if(backup.data.company)dispatch({type:'SET_COMPANY',data:backup.data.company});
        if(backup.data.employees)dispatch({type:'SET_EMPS',data:backup.data.employees});
        if(backup.data.payslips)dispatch({type:'SET_PAYS',data:backup.data.payslips});
        if(backup.data.clients)dispatch({type:'SET_CLIENTS',data:backup.data.clients});
        resolve({
          date:backup.date,
          emps:backup.data.employees?.length||0,
          pays:backup.data.payslips?.length||0,
          clients:backup.data.clients?.length||0
        });
      }catch(err){reject('Erreur lecture: '+err.message);}
    };
    reader.onerror=()=>reject('Erreur lecture fichier');
    reader.readAsText(file);
  });
}

// â”€â”€ Cloud Backup via Supabase â”€â”€
async function cloudBackupSave(state){
  if(!_supabaseRef||!_userIdRef)return{ok:false,msg:'Supabase non connectÃ©'};
  try{
    const backup={
      version:'v38',
      date:new Date().toISOString(),
      company:state.co||{},
      employees:state.emps||[],
      payslips:state.pays||[],
      clients:state.clients||[],
      activeClient:state.activeClient||null,
      emps_count:(state.emps||[]).length,
      pays_count:(state.pays||[]).length,
      clients_count:(state.clients||[]).length
    };
    const{error}=await _supabaseRef.from('backups').insert({
      user_id:_userIdRef,
      backup_data:backup,
      backup_type:'manual',
      label:'Backup '+new Date().toLocaleString('fr-BE'),
      emps_count:backup.emps_count,
      pays_count:backup.pays_count,
      created_at:new Date().toISOString()
    });
    if(error){
      // Table might not exist - try upsert to app_state as fallback
      const{error:e2}=await _supabaseRef.from('app_state').upsert({
        user_id:_userIdRef,
        state_key:'backup_'+Date.now(),
        state_data:backup,
        updated_at:new Date().toISOString()
      },{onConflict:'user_id,state_key'});
      if(e2)return{ok:false,msg:'Erreur: '+e2.message};
    }
    return{ok:true,msg:'Backup cloud sauvegardÃ©',date:backup.date,emps:backup.emps_count};
  }catch(e){return{ok:false,msg:'Erreur: '+e.message};}
}

async function cloudBackupList(){
  if(!_supabaseRef||!_userIdRef)return[];
  try{
    // Try backups table first
    const{data,error}=await _supabaseRef.from('backups')
      .select('id,label,emps_count,pays_count,created_at,backup_type')
      .eq('user_id',_userIdRef)
      .order('created_at',{ascending:false})
      .limit(20);
    if(!error&&data)return data;
    // Fallback: list from app_state
    const{data:d2}=await _supabaseRef.from('app_state')
      .select('state_key,updated_at,state_data')
      .eq('user_id',_userIdRef)
      .like('state_key','backup_%')
      .order('updated_at',{ascending:false})
      .limit(20);
    if(d2)return d2.map(r=>({id:r.state_key,label:r.state_key,created_at:r.updated_at,emps_count:r.state_data?.emps_count||0,pays_count:r.state_data?.pays_count||0}));
    return[];
  }catch(e){return[];}
}

async function cloudBackupRestore(backupId,dispatch){
  if(!_supabaseRef||!_userIdRef)return{ok:false,msg:'Supabase non connectÃ©'};
  try{
    // Try backups table
    let backup=null;
    const{data,error}=await _supabaseRef.from('backups')
      .select('backup_data')
      .eq('id',backupId)
      .eq('user_id',_userIdRef)
      .maybeSingle();
    if(!error&&data)backup=data.backup_data;
    else{
      // Fallback app_state
      const{data:d2}=await _supabaseRef.from('app_state')
        .select('state_data')
        .eq('user_id',_userIdRef)
        .eq('state_key',backupId)
        .maybeSingle();
      if(d2)backup=d2.state_data;
    }
    if(!backup)return{ok:false,msg:'Backup introuvable'};
    if(backup.company)dispatch({type:'SET_COMPANY',data:backup.company});
    if(backup.employees)dispatch({type:'SET_EMPS',data:backup.employees});
    if(backup.payslips)dispatch({type:'SET_PAYS',data:backup.payslips});
    if(backup.clients)dispatch({type:'SET_CLIENTS',data:backup.clients});
    return{ok:true,msg:'Restauration cloud rÃ©ussie',emps:backup.employees?.length||0};
  }catch(e){return{ok:false,msg:'Erreur: '+e.message};}
}

async function cloudAutoBackup(state){
  if(!_supabaseRef||!_userIdRef)return;
  try{
    await _supabaseRef.from('app_state').upsert({
      user_id:_userIdRef,
      state_key:'autobackup',
      state_data:{
        co:state.co,emps:state.emps,pays:state.pays,
        clients:state.clients,activeClient:state.activeClient,
        date:new Date().toISOString(),
        emps_count:(state.emps||[]).length
      },
      updated_at:new Date().toISOString()
    },{onConflict:'user_id,state_key'});
  }catch(e){}
}


// Auto-backup to localStorage every 5 minutes
function setupAutoBackup(getState){
  setInterval(()=>{
    try{
      const state=getState();
      const backup={
        date:new Date().toISOString(),
        co:state.co,
        emps:state.emps,
        pays:state.pays,
        clients:state.clients,
        activeClient:state.activeClient
      };
      safeLS.set('aureus_autobackup',JSON.stringify(backup));
      safeLS.set('aureus_autobackup_date',new Date().toISOString());
    }catch(e){console.log('Auto-backup failed:',e);}
  },300000); // 5 minutes
}

function SettingsPage({s,d}) {
  const [f,setF]=useState({...s.co});
  return <div>
    <PH title="ParamÃ¨tres" sub="Configuration sociÃ©tÃ©"/>
    {/* Backup & Restore */}
    <div style={{marginBottom:18,padding:16,background:'linear-gradient(135deg,rgba(34,197,94,.06),rgba(34,197,94,.02))',border:'1px solid rgba(34,197,94,.15)',borderRadius:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div><div style={{fontSize:14,fontWeight:600,color:'#22c55e'}}>ðŸ’¾ Sauvegarde & Restauration</div><div style={{fontSize:10,color:'#888',marginTop:2}}>DerniÃ¨re sauvegarde auto: {safeLS.get('aureus_autobackup_date')?new Date(safeLS.get('aureus_autobackup_date')).toLocaleString('fr-BE'):'Aucune'}</div></div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>{const name=exportBackup(s);alert('âœ… Backup tÃ©lÃ©chargÃ©: '+name)}} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'#22c55e',color:'#fff',fontSize:11,fontWeight:600,cursor:'pointer'}}>ðŸ“¥ Exporter Backup</button>
          <label style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(59,130,246,.3)',background:'rgba(59,130,246,.1)',color:'#3b82f6',fontSize:11,fontWeight:600,cursor:'pointer'}}> Importer
            <input type="file" accept=".json" style={{display:'none'}} onChange={async(e)=>{
              const file=e.target.files[0];if(!file)return;
              try{const r=await importBackup(file,d);alert('âœ… Restauration rÃ©ussie!\n\n'+r.emps+' employÃ©s\n'+r.pays+' fiches de paie\n'+r.clients+' clients\n\nDate backup: '+new Date(r.date).toLocaleString('fr-BE'));}
              catch(err){alert('âŒ Erreur: '+err);}
              e.target.value='';
            }}/>
          </label>
          <button onClick={()=>{
            let autoBackup=safeLS.get('aureus_autobackup');
            if(!autoBackup){alert('Aucune sauvegarde automatique trouvÃ©e');return;}
            if(confirm('Restaurer la derniÃ¨re sauvegarde automatique ?\n\nDate: '+new Date(safeLS.get('aureus_autobackup_date')).toLocaleString('fr-BE'))){
              try{const b=(()=>{try{return JSON.parse(autoBackup)}catch(e){return null}})();if(b.co)d({type:'SET_COMPANY',data:b.co});if(b.emps)d({type:'SET_EMPS',data:b.emps});if(b.pays)d({type:'SET_PAYS',data:b.pays});alert('âœ… Restauration auto-backup rÃ©ussie');}catch(err){alert('âŒ Erreur: '+err);}
            }
          }} style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(234,179,8,.3)',background:'rgba(234,179,8,.1)',color:'#eab308',fontSize:11,fontWeight:600,cursor:'pointer'}}>ðŸ”„ Auto-backup</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        <div style={{padding:8,background:'rgba(198,163,78,.06)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:16,fontWeight:700,color:'#c6a34e'}}>{(s.emps||[]).length}</div><div style={{fontSize:9,color:'#888'}}>EmployÃ©s</div></div>
        <div style={{padding:8,background:'rgba(59,130,246,.06)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:16,fontWeight:700,color:'#3b82f6'}}>{(s.pays||[]).length}</div><div style={{fontSize:9,color:'#888'}}>Fiches paie</div></div>
        <div style={{padding:8,background:'rgba(168,85,247,.06)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:16,fontWeight:700,color:'#a855f7'}}>{(s.clients||[]).length}</div><div style={{fontSize:9,color:'#888'}}>Clients</div></div>
        <div style={{padding:8,background:'rgba(34,197,94,.06)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:16,fontWeight:700,color:'#22c55e'}}>{Math.round(JSON.stringify(s).length/1024)} KB</div><div style={{fontSize:9,color:'#888'}}>Taille donnÃ©es</div></div>
      </div>
    </div>
    {/* 2FA / MFA TOTP */}
    <div style={{marginBottom:18,padding:16,background:'linear-gradient(135deg,rgba(198,163,78,.06),rgba(198,163,78,.02))',border:'1px solid rgba(198,163,78,.15)',borderRadius:12}}>
      <TwoFactorSetup/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <C><ST>Identification</ST><div style={{display:'grid',gap:9}}>
        <I label="SociÃ©tÃ©" value={f.name} onChange={v=>setF({...f,name:v})}/>
        <I label="TVA" value={f.vat} onChange={v=>setF({...f,vat:v})}/>
        <I label="BCE" value={f.bce} onChange={v=>setF({...f,bce:v})}/>
        <I label="ONSS" value={f.onss} onChange={v=>setF({...f,onss:v})}/>
        <I label="Code NACE" value={f.nace} onChange={v=>setF({...f,nace:v})}/>
        <I label="Adresse" value={f.addr} onChange={v=>setF({...f,addr:v})}/>
        <I label="CP" value={f.cp} onChange={v=>setF({...f,cp:v})} options={Object.entries(LEGAL.CP).map(([k,v])=>({v:k,l:v}))}/>
        <I label="IBAN (compte bancaire)" value={f.bank} onChange={v=>setF({...f,bank:v})}/>
        <I label="BIC (code banque)" value={f.bic} onChange={v=>setF({...f,bic:v})} options={[
          {v:"GEBABEBB",l:"GEBABEBB â€” BNP Paribas Fortis"},
          {v:"BBRUBEBB",l:"BBRUBEBB â€” ING Belgique"},
          {v:"KREDBEBB",l:"KREDBEBB â€” KBC / CBC"},
          {v:"GKCCBEBB",l:"GKCCBEBB â€” Belfius"},
          {v:"ARSPBE22",l:"ARSPBE22 â€” Argenta"},
          {v:"NICABEBB",l:"NICABEBB â€” Crelan"},
          {v:"TRIOBEBB",l:"TRIOBEBB â€” Triodos"},
          {v:"AXABBE22",l:"AXABBE22 â€” AXA Banque"},
        ]}/>
      </div></C>
      <C><ST>Contact & Assurances</ST><div style={{display:'grid',gap:9}}>
        <I label="Contact" value={f.contact} onChange={v=>setF({...f,contact:v})}/>
        <I label="Email" value={f.email} onChange={v=>setF({...f,email:v})}/>
        <I label="TÃ©lÃ©phone" value={f.phone} onChange={v=>setF({...f,phone:v})}/>
        <I label="Assureur AT" value={f.insurer} onChange={v=>setF({...f,insurer:v})}/>
        <I label="NÂ° police" value={f.policyNr} onChange={v=>setF({...f,policyNr:v})}/>
        <I label="SecrÃ©tariat social" value={f.secSoc} onChange={v=>setF({...f,secSoc:v})}/>
      </div></C>
    </div>
    <div style={{marginTop:14,display:'flex',justifyContent:'flex-end'}}><B onClick={()=>{d({type:"UPD_CO",d:f});alert('SauvegardÃ© !')}}>Sauvegarder</B></div>
    
    {/* 2FA Security Section */}
    <C style={{marginTop:20}}>
      <ST>ðŸ” SÃ©curitÃ© â€” Authentification Ã  deux facteurs (2FA)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div>
          <div style={{fontSize:12,color:'#e8e6e0',marginBottom:8,fontWeight:600}}>Statut 2FA</div>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:14,background:'rgba(74,222,128,.04)',borderRadius:10,border:'1px solid rgba(74,222,128,.12)'}}>
            <span style={{fontSize:24}}>ðŸ”’</span>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'#4ade80'}}>2FA disponible via Supabase</div>
              <div style={{fontSize:10.5,color:'#5e5c56',marginTop:2}}>Activez la vÃ©rification en deux Ã©tapes pour sÃ©curiser votre compte</div>
            </div>
          </div>
          <div style={{marginTop:12}}>
            <B v="outline" style={{width:'100%'}} onClick={async()=>{
              try{
                const{data,error}=await(await import('./lib/supabase')).supabase.auth.mfa.enroll({factorType:'totp'});
                if(error)return alert('Erreur: '+error.message);
                if(data){
                  const qr=data.totp?.qr_code;
                  const secret=data.totp?.secret;
                  alert('2FA activÃ© !\\n\\nScannez le QR code avec Google Authenticator ou Authy.\\n\\nSecret: '+secret+'\\n\\n(Le QR code sera affichÃ© dans une prochaine version)');
                }
              }catch(e){alert('2FA via TOTP â€” Activez dans Supabase Dashboard > Authentication > MFA');}
            }}>ðŸ” Activer 2FA (TOTP)</B>
          </div>
        </div>
        <div>
          <div style={{fontSize:12,color:'#e8e6e0',marginBottom:8,fontWeight:600}}>Options de sÃ©curitÃ©</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>ðŸ“§</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>Email de confirmation</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>Requis Ã  l'inscription</div>
              </div>
              <span style={{fontSize:10,color:'#4ade80',fontWeight:600}}>Actif âœ“</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>ðŸ”‘</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>RÃ©initialisation mot de passe</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>Par email sÃ©curisÃ©</div>
              </div>
              <span style={{fontSize:10,color:'#4ade80',fontWeight:600}}>Actif âœ“</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>â±</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>Session timeout</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>DÃ©connexion aprÃ¨s inactivitÃ©</div>
              </div>
              <span style={{fontSize:10,color:'#fb923c',fontWeight:600}}>1 heure</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>ðŸ“±</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>TOTP (Google Authenticator / Authy)</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>Code Ã  6 chiffres toutes les 30 secondes</div>
              </div>
              <span style={{fontSize:10,color:'#fb923c',fontWeight:600}}>Ã€ activer</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>ðŸ›¡</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>Audit trail (BoÃ®te noire)</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>Toute action est tracÃ©e dans audit_log</div>
              </div>
              <span style={{fontSize:10,color:'#4ade80',fontWeight:600}}>Actif âœ“</span>
            </div>
          </div>
        </div>
      </div>
    </C>
    <C style={{marginTop:20}}>
      <ST>BarÃ¨mes lÃ©gaux</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20,marginTop:10}}>
        <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>ONSS</div><div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2}}>
          <div>Travailleur: <b style={{color:'#e8e6e0'}}>{fmtP(LEGAL.ONSS_W)}</b></div>
          <div>Employeur (marchand): <b style={{color:'#e8e6e0'}}>25,00%</b></div>
          <div>Employeur (non-march.): <b style={{color:'#e8e6e0'}}>32,40%</b></div>
          <div>Ouvriers: brut Ã— 108%</div>
          <div>Bonus max: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.BONUS_2026.A_MAX)}</b></div>
        </div></div>
        <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>Avantages</div><div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2}}>
          <div>CR empl. max: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.MV.emax)}</b> (2026)</div>
          <div>CR trav. min: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.MV.wmin)}</b></div>
          <div>CR valeur max: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.MV.maxTotal)}</b></div>
          <div>Ã‰co-chÃ¨ques: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.ECO)}/an</b></div>
        </div></div>
        <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>RÃ©gime</div><div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2}}>
          <div>Heures/sem: <b style={{color:'#e8e6e0'}}>{LEGAL.WH}h</b></div>
          <div>Heures/jour: <b style={{color:'#e8e6e0'}}>{LEGAL.WHD}h</b></div>
          <div>Jours/mois: <b style={{color:'#e8e6e0'}}>{LEGAL.WD}</b></div>
        </div></div>
      </div>
      <div style={{marginTop:14,padding:10,background:"rgba(96,165,250,.05)",borderRadius:8,border:'1px solid rgba(96,165,250,.08)'}}>
        <div style={{fontSize:10.5,color:'#4ade80',lineHeight:1.5}}>âœ… PrÃ©compte professionnel calculÃ© selon la formule-clÃ© complÃ¨te SPF Finances â€” Annexe III AR/CIR 92 â€” BarÃ¨mes 2026 (tranches annuelles 26,75% Ã  53,50%, quotitÃ© exemptÃ©e 10 900â‚¬, frais forfaitaires 30% plafond 5 930â‚¬, quotient conjugal, rÃ©ductions familiales annualisÃ©es).</div>
      </div>
    </C>
    <C style={{marginTop:20}}>
      <ST>ðŸ” Audit systÃ¨me â€” Aureus Social Pro</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginTop:12}}>
        <div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#4ade80',marginBottom:10}}>âœ… BarÃ¨mes SPF vÃ©rifiÃ©s (salairesminimums.be)</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:2.2}}>
            {[
              {cp:'200',n:'CP AUXILIAIRE EMPLOYÃ‰S',idx:'2,21%',dt:'01/01/2026',src:'Grille A/B/C/D, 0-26 ans anc.'},
              {cp:'124',n:'CONSTRUCTION',idx:'0,22%',dt:'01/01/2026',src:'Taux horaires Iâ†’Chef IV'},
              {cp:'302',n:'HÃ”TELLERIE',idx:'2,19%',dt:'01/01/2026',src:'Cat I-V par anciennetÃ©'},
              {cp:'118',n:'INDUSTRIE ALIMENTAIRE (ouv.)',idx:'2,19%',dt:'01/01/2026',src:'S-sect.17, 8 classes, anc mois'},
              {cp:'140',n:'TRANSPORT ROUTIER',idx:'2,18%',dt:'01/01/2026',src:'SCP 140.03 roulant/non-roulant/garage'},
              {cp:'330',n:'SANTÃ‰',idx:'2,0%',dt:'01/01/2026',src:'Ã‰ch. 1.12â†’1.59, 13 Ã©chelons anc.'},
              {cp:'121',n:'NETTOYAGE',idx:'0,56%',dt:'01/01/2026',src:'8 catÃ©gories, rÃ©gime 37h'},
              {cp:'111',n:'MÃ‰TAL/MÃ‰CANIQUE (ouv.)',idx:'2,72%',dt:'01/07/2025',src:'Cat 1-7 national + Agoria'},
              {cp:'116',n:'CHIMIE (ouvriers)',idx:'2,0%',dt:'01/04/2025',src:'Taux horaires manÅ“uvre, 2 Ã©chelons'},
              {cp:'201',n:'COMMERCE DÃ‰TAIL INDÃ‰PENDANT',idx:'2,0%',dt:'01/04/2025',src:'Grp1 vente Cat.1-4, exp 0-14 ans'},
              {cp:'202',n:'COMMERCE DÃ‰TAIL ALIMENTAIRE',idx:'1,0%',dt:'01/01/2026',src:'Cat 1-5 par anciennetÃ©'},
              {cp:'209',n:'FAB. MÃ‰TALLIQUE (empl.)',idx:'2,0%',dt:'01/07/2025',src:'Classes SCE, Agoria'},
              {cp:'220',n:'INDUSTRIE ALIMENTAIRE (empl.)',idx:'2,19%',dt:'01/01/2026',src:'Cat 1-6, CGSLB'},
              {cp:'306',n:'ASSURANCES',idx:'2,23%',dt:'01/01/2026',src:'EmployÃ©s Cat.1-4B, 22 Ã©ch. anc.'},
              {cp:'304',n:'SPECTACLE',idx:'x1,37',dt:'01/02/2026',src:'Groupes 1a-6, SPF officiel'},
              {cp:'311',n:'GRANDES SURFACES',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-5, vente dÃ©tail'},
              {cp:'313',n:'PHARMACIES',idx:'2,0%',dt:'01/03/2025',src:'Non-pharma Cat I-IV 0-42 ans + Pharmaciens'},
              {cp:'317',n:'GARDIENNAGE',idx:'2,21%',dt:'01/01/2026',src:'Agent A-D, sÃ©curitÃ©'},
              {cp:'318',n:'AIDES FAMILIALES',idx:'2,0%',dt:'01/01/2026',src:'Cat 1-4 non-marchand'},
              {cp:'329',n:'SOCIO-CULTUREL',idx:'2,0%',dt:'01/01/2026',src:'BarÃ¨me 1-4.1, ASBL'},
              {cp:'331',n:'AIDE SOCIALE (Flandre)',idx:'2,0%',dt:'01/01/2026',src:'IFIC Cat 1-5'},
              {cp:'332',n:'AIDE SOCIALE (francophone)',idx:'2,0%',dt:'01/01/2026',src:'IFIC Cat 1-5'},
              {cp:'336',n:'PROFESSIONS LIBÃ‰RALES',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-4 alignÃ© CP 200'},
              {cp:'144',n:'AGRICULTURE',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-4 secteurs verts'},
              {cp:'145',n:'HORTICULTURE',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-3 secteurs verts'},
              {cp:'152',n:'ENSEIGNEMENT LIBRE (ouv.)',idx:'2,0%',dt:'01/01/2026',src:'6 catÃ©gories CP 152.02'},
              {cp:'333',n:'ATTRACTIONS TOURISTIQUES',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-4 loisirs'},
            ].map(b=><div key={b.cp} style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{background:"rgba(74,222,128,.1)",color:'#4ade80',padding:'1px 6px',borderRadius:4,fontSize:9,fontWeight:700,minWidth:44,textAlign:'center'}}>CP {b.cp}</span>
              <span style={{color:'#d4d0c8',fontSize:11}}>{b.n}</span>
              <span style={{color:'#5e5c56',fontSize:10,marginLeft:'auto'}}>idx {b.idx} Â· {b.dt}</span>
            </div>)}
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#facc15',marginTop:16,marginBottom:10}}>â‰ˆ BarÃ¨mes estimÃ©s (structure confirmÃ©e, montants approximatifs)</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:2.2}}>
            {[
              {cp:'149',n:'Ã‰LECTRICIENS',idx:'2,0%',dt:'01/01/2026',src:'5 cat. avec prime anciennetÃ©'},
              {cp:'225',n:'ENSEIGNEMENT PRIVÃ‰ (empl.)',idx:'2,21%',dt:'01/01/2026',src:'AlignÃ© CP 200'},
              {cp:'226',n:'COMMERCE INTERNATIONAL',idx:'2,23%',dt:'01/01/2026',src:'CGSLB vÃ©rifiÃ©'},
              {cp:'307',n:'COURTAGE ASSURANCES',idx:'2,21%',dt:'01/01/2026',src:'AlignÃ© CP 200 + complÃ©ments'},
              {cp:'319',n:'Ã‰DUCATIFS',idx:'2,0%',dt:'01/01/2026',src:'Non-marchand, IFIC'},
              {cp:'322.01',n:'TITRES-SERVICES',idx:'2,0%',dt:'01/01/2026',src:'Salaire sectoriel minimum'},
              {cp:'323',n:'IMMOBILIER',idx:'2,21%',dt:'01/01/2026',src:'AlignÃ© CP 200'},
              {cp:'327',n:'ETA',idx:'2,0%',dt:'01/01/2026',src:'Travailleurs adaptÃ©s + encadrement'},
            ].map(b=><div key={b.cp} style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{background:"rgba(250,204,21,.1)",color:'#facc15',padding:'1px 6px',borderRadius:4,fontSize:9,fontWeight:700,minWidth:44,textAlign:'center'}}>CP {b.cp}</span>
              <span style={{color:'#d4d0c8',fontSize:11}}>{b.n}</span>
              <span style={{color:'#5e5c56',fontSize:10,marginLeft:'auto'}}>idx {b.idx} Â· {b.dt}</span>
            </div>)}
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#4ade80',marginTop:16,marginBottom:10}}>âœ… 35 CPs â€” 27 vÃ©rifiÃ©s SPF + 8 estimÃ©s fiables</div>
        </div>
        <div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:10}}>ðŸ“Š Statistiques application</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:2.2}}>
            <div>Modules fonctionnels: <b style={{color:'#c6a34e'}}>46</b></div>
            <div>Composants React: <b style={{color:'#c6a34e'}}>~90</b></div>
            <div>CatÃ©gories navigation: <b style={{color:'#c6a34e'}}>12</b></div>
            <div>CPs avec barÃ¨mes: <b style={{color:'#4ade80'}}>35</b> / 35 (27 SPF + 8 estimÃ©s)</div>
            <div>Secteurs wizard: <b style={{color:'#c6a34e'}}>26</b> activitÃ©s</div>
            <div>Documents DRS: <b style={{color:'#c6a34e'}}>14 types Activa + 15 chÃ´mage + 14 INAMI</b></div>
            <div>Formats comptables: <b style={{color:'#c6a34e'}}>6</b> (BOB, Winbooks, Kluwer, Popsy, Soda, Autre)</div>
            <div>RÃ©gions Activa: <b style={{color:'#c6a34e'}}>3</b> (Actiris, FOREM, VDAB)</div>
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#4ade80',marginTop:16,marginBottom:10}}>âœ… Calculs conformes Annexe III 2026</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
            {[
              'PrÃ©compte pro: formule-clÃ© COMPLÃˆTE SPF Finances 2026 (tranches 26,75%â†’53,50%, quotitÃ© exemptÃ©e 10 900â‚¬)',
              '35 CPs avec barÃ¨mes vÃ©rifiÃ©s (sources SPF et syndicales officielles)',
              'CP 209: barÃ¨mes indexÃ©s +2,72% au 01/07/2025 â€” montants exacts emploi.belgique.be',
              'CP 330: barÃ¨mes classiques + Ã©chelles IFIC (Cat.1.12â†’1.59)',
              'ONSS: taux 25% marchand + 32,40% non-marchand + ouvrier 108% + modulations sectorielles + cotis. spÃ©ciales (FFE, chÃ´mage temp., amiante)',
              'PÃ©cule vacances: double pÃ©cule dÃ©taillÃ© (85% + 7%, ONSS 2Ã¨me partie, cotis. spÃ©c. 1%)',
            ].map((p,i)=><div key={i} style={{paddingLeft:10,borderLeft:'2px solid rgba(74,222,128,.3)',marginBottom:6,fontSize:10.5,color:'#4ade80'}}>{p}</div>)}
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#60a5fa',marginTop:16,marginBottom:10}}>ðŸ’¡ Pistes d'Ã©volution future</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
            {[
              'Module flexi-jobs (horeca, commerce, santÃ©)',
              'Export SEPA XML ISO 20022 pour virements salaires',
              'Module Ã©valuation annuelle / entretien fonctionnement',
              'Gestion planning/horaires avec badgeuse',
              'IntÃ©gration eBox entreprise (documents sociaux dÃ©matÃ©rialisÃ©s)',
              'Module accident du travail (dÃ©claration + suivi FEDRIS)',
              'Connexion API DmfA / Dimona (batch ONSS)',
            ].map((p,i)=><div key={i} style={{paddingLeft:10,borderLeft:'2px solid rgba(96,165,250,.2)',marginBottom:6,fontSize:10.5,color:'#60a5fa'}}>{p}</div>)}
          </div>
        </div>
      </div>
    </C>
  </div>;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  MODULES PRO
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const DRS_DOCS={
  chomage:[
    {code:'C4',l:"C4 â€” Certificat de chÃ´mage",f:['motif',"brut","regime","preavis"]},
    {code:'C4-RCC',l:"C4 PrÃ©pension (RCC)",f:['motif',"brut","date_rcc"]},
    {code:'C4-ENS',l:"C4 Enseignement",f:['motif',"etablissement"]},
    {code:'C3.2-CD',l:"C3.2 Constat du droit",f:['regime',"heures"]},
    {code:'C3.2-OUV',l:"C3.2 Employeur â†’ Ouvriers",f:['jours',"motif"]},
    {code:'C3.2-EMP',l:"C3.2 Anti-crise â†’ EmployÃ©s",f:['jours',"motif"]},
    {code:'C131A',l:"C131A Employeur",f:['debut',"motif","regime"]},
    {code:'C131B',l:"C131B",f:['debut',"regime"]},
    {code:'C131A-E',l:"C131A Enseignement",f:['debut',"etablissement"]},
    {code:'C131B-E',l:"C131B Enseignement",f:['debut']},
    {code:'C78-ACT-BXL',l:"C78 Activa.brussels (Actiris)",f:['type_activa',"debut","duree","montant_red"]},
    {code:'C78-ACT-WAL',l:"C78 Impulsion -12/-25 mois (FOREM)",f:['type_impulsion',"debut","duree","montant_red"]},
    {code:'C78-ACT-VL',l:"C78 Werkplekleren / Winwin (VDAB)",f:['type_vl',"debut","duree"]},
    {code:'C78-TRANS',l:"C78 Prime de transition (Bruxelles)",f:['debut',"duree","montant"]},
    {code:'C78-START',l:"C78 Activa Start (<26 ans)",f:['debut',"duree","age"]},
    {code:'C78-ETA',l:"C78 E.T.A. (Entreprise Travail AdaptÃ©)",f:['type',"debut","pct_prime"]},
    {code:'C78-ART60',l:"C78 Article 60Â§7 (CPAS)",f:['cpas',"debut","fin","type_art60","subsides"]},
    {code:'C78-ART61',l:"C78 Article 61 (CPAS mise Ã  dispo)",f:['cpas',"debut","fin"]},
    {code:'C78-SINE',l:"C78 SINE (Ã‰conomie sociale insertion)",f:['debut',"duree","agrÃ©ment"]},
    {code:'C78.3',l:"C78.3 P.T.P. (Programme Transition Pro)",f:['debut',"heures","org_encadrement"]},
    {code:'C78-SEC',l:"C78 SÃ©curitÃ© & prÃ©vention",f:['debut',"fonction"]},
    {code:'C78-FIRST',l:"C78 Stage First / FPI (Actiris/FOREM)",f:['debut',"duree","indemnite"]},
    {code:'C78-FORM',l:"C78 Contrat de formation (IFAPME/EFP)",f:['debut',"duree","centre"]},
    {code:'C78-HAND',l:"C78 Prime handicap (AVIQ/PHARE/VDAB)",f:['debut',"organisme","pct_prime"]},
    {code:'C103-JE',l:"C103 Jeunes Employeur",f:['debut',"age"]},
    {code:'C103-JT',l:"C103 Jeunes Travailleur",f:['debut',"age"]},
    {code:'C103-SE',l:"C103 Seniors Employeur",f:['debut',"age"]},
    {code:'C103-ST',l:"C103 Seniors Travailleur",f:['debut',"age"]},
  ],
  inami:[
    {code:'IN-MAL',l:"IncapacitÃ© â€” Maladie/Accident",f:['debut',"fin","diagnostic"]},
    {code:'IN-MAT',l:"Repos de maternitÃ©",f:['accouchement',"debut","fin"]},
    {code:'IN-EC',l:"Ã‰cartement complet maternitÃ©",f:['debut',"fin"]},
    {code:'IN-EP',l:"Ã‰cartement partiel maternitÃ©",f:['debut',"fin","heures"]},
    {code:'IN-CONV',l:"MaternitÃ©/PaternitÃ© converti",f:['debut',"fin"]},
    {code:'IN-NAIS',l:"CongÃ© naissance (10j)",f:['naissance',"debut"]},
    {code:'IN-ADOP',l:"CongÃ© adoption",f:['debut',"fin"]},
    {code:'IN-REP',l:"Reprise partielle travail",f:['debut',"heures"]},
    {code:'IN-PROT',l:"Protection maternitÃ©",f:['debut',"fin"]},
    {code:'IN-2EMP',l:"2 employeurs diffÃ©rents",f:['debut',"employeur2"]},
    {code:'IN-ALL',l:"Allaitement â€” Pauses",f:['debut',"nb_pauses"]},
    {code:'VAC-C',l:"Vacances annuelles (caisse)",f:['annee',"jours"]},
    {code:'VAC-E',l:"Vacances annuelles (employeur)",f:['annee',"jours","montant"]},
    {code:'IN-REPR',l:"Reprise du travail",f:['date_reprise']},
  ],
  papier:[
    {code:'C4-P',l:"C4 DRS (papier)",f:['motif']},
    {code:'C4-RCC-P',l:"C4 DRS-RCC (papier)",f:['motif']},
    {code:'ATT-PV',l:"Attestation PÃ©cules de vacances",f:['annee',"simple","double"]},
    {code:'ATT-TRAV',l:"Attestation de travail",f:['debut',"fin","fonction"]},
    {code:'ATT-276',l:"Attestation 276 frontaliers",f:['pays',"annee"]},
  ],
};
const COMPTA=[{id:"bob",n:'BOB Software',fmt:'CSV/XML'},{id:"winbooks",n:'Winbooks',fmt:'TXT/CSV'},{id:"kluwer",n:'Kluwer Expert',fmt:'CSV'},{id:"popsy",n:'Popsy',fmt:'TXT'},{id:"soda",n:'Soda',fmt:'CSV'},{id:"exact",n:'Exact Online',fmt:'CSV/XML'},{id:"octopus",n:'Octopus',fmt:'CSV'},{id:"clearfact",n:'ClearFact',fmt:'CSV/UBL'},{id:"yuki",n:'Yuki',fmt:'XML'},{id:"horus",n:'Horus',fmt:'CSV'},{id:"other",n:'Autre (txt/xls)',fmt:'TXT/XLS'}];
const CR_PROV=[{id:"pluxee",n:'Pluxee (ex-Sodexo)',ic:'ðŸŸ '},{id:"edenred",n:'Edenred',ic:'ðŸ”´'},{id:"monizze",n:'Monizze',ic:'ðŸŸ¢'},{id:"got",n:'G.O.T. CONNECTION',ic:'ðŸ”µ'}];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SOUS-NAVIGATION â€” Breadcrumb + bouton retour + onglets
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function SubNav({parentId,parentLabel,subs,activeSub,d}){
  return <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,padding:'8px 12px',background:'rgba(198,163,78,.03)',border:'1px solid rgba(198,163,78,.08)',borderRadius:10,flexWrap:'wrap'}}>
    <button onClick={()=>d({type:"NAV",page:parentId,sub:subs[0]?.id||null})} style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:6,border:'none',background:'rgba(198,163,78,.1)',color:'#c6a34e',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}} title="Retour">
      â† {parentLabel}
    </button>
    <span style={{color:'#5e5c56',fontSize:11}}>â€º</span>
    {subs.map(sb=><button key={sb.id} onClick={()=>d({type:"NAV",page:parentId,sub:sb.id})} style={{padding:'5px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:11,fontWeight:activeSub===sb.id?600:400,fontFamily:'inherit',background:activeSub===sb.id?'rgba(198,163,78,.12)':'transparent',color:activeSub===sb.id?'#c6a34e':'#9e9b93',transition:'all .1s'}}>{sb.l}</button>)}
  </div>;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  CATEGORY ROUTER PAGES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function SalairesPage({s,d}){const sub=s.sub||'od';const _subs=[{id:"simcout",l:"Simulation coÃ»t"},{id:"netbrut",l:"Net â†’ Brut"},{id:"provisions",l:"Provisions"},{id:"cumuls",l:"Cumuls"},{id:"indexauto",l:"Indexation"},{id:"treizieme",l:"13Ã¨me mois"},{id:"bonusemploi",l:"Bonus emploi"}];return <div>
  <SubNav parentId="salaires" parentLabel="Salaires" subs={_subs} activeSub={sub} d={d}/>
  <PH title="Salaires & Calculs" sub={`Module: ${{'od':'O.D. Comptables',"provisions":'Provisions',"cumuls":'Cumuls annuels',"netbrut":'Net â†’ Brut',"simcout":'Simulation coÃ»t salarial',"saisies":'Saisies-Cessions',"indexauto":'Index automatique',"horsforfait":'Heures supplÃ©mentaires',"totalreward":'Total Reward Statement',"transport":'Transport domicile-travail',"treizieme":'13Ã¨me mois',"css":'Cotisation spÃ©ciale SS',"bonusemploi":'Bonus Ã  l\'emploi'}[sub]||sub}`}/>
    <div style={{marginBottom:14,padding:'10px 14px',background:'linear-gradient(135deg,rgba(198,163,78,.06),rgba(198,163,78,.02))',border:'1px solid rgba(198,163,78,.1)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{fontSize:11,color:'#888'}}>âš¡ SEPA + Fiches auto-gÃ©nÃ©rÃ©s le jour de paie</div>
      <div style={{display:'flex',gap:6}}>
        <button onClick={()=>{if(confirm('GÃ©nÃ©rer SEPA ?')){generateSEPAXML(s.emps||[],s.co);alert('âœ… SEPA gÃ©nÃ©rÃ©')}}} style={{padding:'6px 12px',borderRadius:8,border:'none',background:'#22c55e',color:'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>ðŸ’¸ SEPA</button>
        <button onClick={()=>{if(confirm('GÃ©nÃ©rer fiches ?')){(s.emps||[]).forEach(e=>generatePayslipPDF(e,s.co));alert('âœ… Fiches gÃ©nÃ©rÃ©es')}}} style={{padding:'6px 12px',borderRadius:8,border:'none',background:'#c6a34e',color:'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>ðŸ“„ Fiches</button>
      </div>
    </div>
  {sub==='od'&&<ODModLazy s={s} d={d}/>}{sub==='provisions'&&<ProvisionsModLazy s={s} d={d}/>}
  {sub==='cumuls'&&<CumulsModLazy s={s} d={d}/>}{sub==='netbrut'&&<NetBrutModLazy s={s} d={d}/>}
  {sub==='simcout'&&<SimCoutModLazy s={s} d={d}/>}{sub==='totalreward'&&<TotalRewardModLazy s={s} d={d}/>}
  {sub==='saisies'&&<SaisiesModLazy s={s} d={d}/>}{sub==='indexauto'&&<IndexAutoModLazy s={s} d={d}/>}
  {sub==='horsforfait'&&<HeuresSupModLazy s={s} d={d}/>}
  {sub==='transport'&&<TransportDomTravModLazy s={s} d={d}/>}
  {sub==='treizieme'&&<TreizMoisModLazy s={s} d={d}/>}
  {sub==='css'&&<CSSModLazy s={s} d={d}/>}
  {sub==='bonusemploi'&&<BonusEmploiModLazy s={s} d={d}/>}
</div>;}

function AvantagesPage({s,d}){const sub=s.sub||'cheques';const _subs=[{id:"cheques",l:"ChÃ¨ques-repas"},{id:"ecochequesv2",l:"Eco-chÃ¨ques"},{id:"plancafeteria",l:"Plan Cafeteria"},{id:"cct90bonus",l:"Bonus CCT 90"},{id:"notefraisv2",l:"Notes de frais"},{id:"warrants",l:"Warrants"},{id:"budgetmob",l:"Budget mobilitÃ©"}];return <div>
  <SubNav parentId="avantages" parentLabel="Avantages" subs={_subs} activeSub={sub} d={d}/>
  {sub==='cheques'&&<CRModLazy s={s} d={d}/>}
  {sub==='cafeteria'&&<CafeteriaModLazy s={s} d={d}/>}
  {sub==='plancafeteria'&&<CafeteriaModLazy s={s} d={d}/>}
  {sub==='cct90'&&<CCT90ModLazy s={s} d={d}/>}
  {sub==='cct90bonus'&&<CCT90ModLazy s={s} d={d}/>}
  {sub==='warrants'&&<WarrantsModLazy s={s} d={d}/>}
  {sub==='budgetmob'&&<BudgetMobiliteModLazy s={s} d={d}/>}
  {sub==='ecochequesv2'&&<CRModLazy s={s} d={d}/>}
  {sub==='notefraisv2'&&<NoteFraisModLazy s={s} d={d}/>}
</div>;}

function ContratsMenuPage({s,d}){const sub=s.sub||'contrats';const _subs=[{id:"contrats",l:"Contrats"},{id:"reglement",l:"RÃ¨glement"},{id:"preavis",l:"PrÃ©avis"},{id:"pecsortie",l:"PÃ©cule sortie"}];return <div>
  <SubNav parentId="contratsmenu" parentLabel="Contrats" subs={_subs} activeSub={sub} d={d}/>
  {sub==='contrats'&&<ContratsTravailModLazy s={s} d={d}/>}
  {sub==='reglement'&&<ReglementTravailModLazy s={s} d={d}/>}
  {sub==='preavis'&&<PreavisModLazy s={s} d={d}/>}
  {sub==='pecsortie'&&<PeculeSortieModLazy s={s} d={d}/>}
</div>;}

function RHPage({s,d}){const sub=s.sub||'absences';const _subs=[{id:"wf_embauche",l:"Embauche"},{id:"wf_licenciement",l:"Licenciement"},{id:"wf_maladie",l:"Maladie"},{id:"absences",l:"Absences"},{id:"credittemps",l:"CrÃ©dit-temps"},{id:"pointage",l:"Pointage"},{id:"medtravail",l:"MÃ©decine"}];return <div>
  <SubNav parentId="rh" parentLabel="RH & Workflows" subs={_subs} activeSub={sub} d={d}/>
  <PH title="RH & Personnel" sub={`Module: ${{'wf_embauche':'âš¡ Workflow Embauche','wf_licenciement':'âš¡ Workflow Licenciement','wf_maladie':'âš¡ Workflow Maladie','absences':'Gestion absences',"absenteisme":'Analyse absentÃ©isme',"credittemps":'CrÃ©dit-temps',"chomtemp":'ChÃ´mage temporaire',"congeduc":'CongÃ©-Ã©ducation payÃ©',"rcc":'RCC / PrÃ©pension',"outplacement":'Outplacement',"pointage":'Pointage & Portail Employeur',"planform":'Plan de formation',"medtravail":'MÃ©decine du travail',"selfservice":'Portail travailleur',"promesseembauche":'ðŸ“„ Promesse d\'Embauche'}[sub]||sub}`}/>
  {sub==='wf_embauche'&&<WorkflowEmbaucheModLazy s={s} d={d}/>}{sub==='wf_licenciement'&&<WorkflowLicenciementModLazy s={s} d={d}/>}{sub==='wf_maladie'&&<WorkflowMaladieModLazy s={s} d={d}/>}
  {sub==='absences'&&<AbsencesModLazy s={s} d={d}/>}{sub==='absenteisme'&&<AbsenteismeModLazy s={s} d={d}/>}
  {sub==='credittemps'&&<CreditTempsModLazy s={s} d={d}/>}{sub==='chomtemp'&&<ChomTempModLazy s={s} d={d}/>}
  {sub==='congeduc'&&<CongeEducModLazy s={s} d={d}/>}{sub==='rcc'&&<RCCModLazy s={s} d={d}/>}
  {sub==='outplacement'&&<OutplacementModLazy s={s} d={d}/>}{sub==='pointage'&&<PointageModLazy s={s} d={d}/>}
  {sub==='planform'&&<PlanFormationModLazy s={s} d={d}/>}{sub==='medtravail'&&<MedTravailModLazy s={s} d={d}/>}
  {sub==='selfservice'&&<SelfServiceModLazy s={s} d={d}/>}
  {sub==='onboarding'&&<OnboardingModLazy s={s} d={d}/>}
  {sub==='offboarding'&&<OffboardingModLazy s={s} d={d}/>}
  {sub==='registre'&&<RegistrePersonnelModLazy s={s} d={d}/>}
  {sub==='totalreward'&&<TotalRewardModLazy s={s} d={d}/>}
  {sub==='promesseembauche'&&<PromesseEmbaucheLazy s={s} d={d}/>}
</div>;}

function SocialPage({s,d}){const sub=s.sub||'assloi';const _subs=[{id:"assloi",l:"Ass. Loi"},{id:"assgroupe",l:"Ass. Groupe"},{id:"syndicales",l:"Syndicales"},{id:"allocfam",l:"Alloc. Fam."},{id:"aidesemploi",l:"Aides emploi"}];return <div>
  <SubNav parentId="social" parentLabel="Social" subs={_subs} activeSub={sub} d={d}/>
  {sub==='assloi'&&<AssLoiModLazy s={s} d={d}/>}
  {sub==='assgroupe'&&<AssGroupeModLazy s={s} d={d}/>}
  {sub==='syndicales'&&<SyndicalesModLazy s={s} d={d}/>}
  {sub==='allocfam'&&<AllocFamModLazy s={s} d={d}/>}
  {sub==='aidesemploi'&&<AidesEmploiModLazy s={s} d={d}/>}
</div>;}

function ReportingPage({s,d}){const sub=s.sub||'accounting';const _subs=[{id:"accounting",l:"ComptabilitÃ©"},{id:"bilanbnb",l:"Bilan BNB"},{id:"sepa",l:"SEPA"},{id:"envoi",l:"Envoi docs"},{id:"ged",l:"GED"}];return <div>
  <SubNav parentId="reporting" parentLabel="Reporting" subs={_subs} activeSub={sub} d={d}/>
  <PH title="Reporting & Export" sub={`Module: ${{'accounting':'Accounting Output',"bilanbnb":'Bilan Social BNB',"bilan":'Bilan Social',"statsins":'Statistiques INS',"sepa":'SEPA / Virements',"peppol":'PEPPOL e-Invoicing',"envoi":'Envoi documents',"exportimport":'Export / Import',"ged":'GED / Archivage'}[sub]||sub}`}/>
    <div style={{marginBottom:14,padding:'10px 14px',background:'linear-gradient(135deg,rgba(168,85,247,.06),rgba(168,85,247,.02))',border:'1px solid rgba(168,85,247,.1)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{fontSize:11,color:'#888'}}>âš¡ Exports auto: DmfA + SEPA + Belcotax en 1 clic</div>
      <div style={{display:'flex',gap:6}}>
        <button onClick={()=>{if(confirm('GÃ©nÃ©rer DmfA ?')){generateDmfAXML(s.emps||[],Math.ceil((new Date().getMonth()+1)/3),new Date().getFullYear(),s.co);alert('âœ… DmfA gÃ©nÃ©rÃ©e')}}} style={{padding:'6px 12px',borderRadius:8,border:'none',background:'#a855f7',color:'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>ðŸ“Š DmfA</button>
        <button onClick={()=>{if(confirm('GÃ©nÃ©rer SEPA ?')){generateSEPAXML(s.emps||[],s.co);alert('âœ… SEPA gÃ©nÃ©rÃ©')}}} style={{padding:'6px 12px',borderRadius:8,border:'none',background:'#22c55e',color:'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>ðŸ’¸ SEPA</button>
      </div>
    </div>
  {sub==='accounting'&&<AccountingOutputModLazy s={s} d={d}/>}{sub==='bilanbnb'&&<BilanSocialBNBModLazy s={s} d={d}/>}
  {sub==='bilan'&&<BilanSocialModLazy s={s} d={d}/>}{sub==='statsins'&&<StatsINSModLazy s={s} d={d}/>}
  {sub==='sepa'&&<SEPAModLazy s={s} d={d}/>}{sub==='peppol'&&<PeppolModLazy s={s} d={d}/>}{sub==='envoi'&&<EnvoiModLazy s={s} d={d}/>}
  {sub==='exportimport'&&<ExportImportModLazy s={s} d={d}/>}{sub==='ged'&&<GEDModLazy s={s} d={d}/>}
</div>;}

function LegalPage({s,d}){const sub=s.sub||"docsjuridiques";const _subs=[{id:"docsjuridiques",l:"Documents"},{id:"alertes",l:"Alertes"},{id:"secteurs",l:"Secteurs"},{id:"moteurlois",l:"Moteur Lois"}];return <div>
  <SubNav parentId="legal" parentLabel="Legal" subs={_subs} activeSub={sub} d={d}/>
  {sub==="docsjuridiques"&&<MoteurLoisBelges s={s} d={d}/>}
  {sub==="alertes"&&<AlertesLegalesModLazy s={s} d={d}/>}
  {sub==="secteurs"&&<SecteursModLazy s={s} d={d}/>}
  {sub==="moteurlois"&&<MoteurLoisBelges s={s} d={d}/>}
</div>;}

function ModulesProPage({s,d}){
  const sub=s.sub||'od';
  return <div>
    <PH title="Modules Pro" sub="47 modules â€” La Rolls Royce du secrÃ©tariat social"/>
    {sub==='od'&&<ODModLazy s={s} d={d}/>}
    {sub==='cheques'&&<CRModLazy s={s} d={d}/>}
    {sub==='envoi'&&<EnvoiModLazy s={s} d={d}/>}
    {sub==='drs'&&<DRSModLazy s={s} d={d}/>}
    {sub==='fiches_ext'&&<FichesModLazy s={s} d={d}/>}
    {sub==='pointage'&&<PointageModLazy s={s} d={d}/>}
    {sub==='syndicales'&&<SyndicalesModLazy s={s} d={d}/>}
    {sub==='onssapl'&&<ONSSAPLModLazy s={s} d={d}/>}
    {sub==='eta'&&<ETAModLazy s={s} d={d}/>}
    {sub==='exportimport'&&<ExportImportModLazy s={s} d={d}/>}
    {sub==='netbrut'&&<NetBrutModLazy s={s} d={d}/>}
    {sub==='decava'&&<DecavaModLazy s={s} d={d}/>}
    {sub==='bilan'&&<BilanSocialModLazy s={s} d={d}/>}
    {sub==='provisions'&&<ProvisionsModLazy s={s} d={d}/>}
    {sub==='cumuls'&&<CumulsModLazy s={s} d={d}/>}
    {sub==='saisies'&&<SaisiesModLazy s={s} d={d}/>}
    {sub==='rentes'&&<RentesModLazy s={s} d={d}/>}
    {sub==='assloi'&&<AssLoiModLazy s={s} d={d}/>}
    {sub==='assgroupe'&&<AssGroupeModLazy s={s} d={d}/>}
    {sub==='medtravail'&&<MedTravailModLazy s={s} d={d}/>}
    {sub==='allocfam'&&<AllocFamModLazy s={s} d={d}/>}
    {sub==='caissevac'&&<CaisseVacModLazy s={s} d={d}/>}
    {sub==='sepa'&&<SEPAModLazy s={s} d={d}/>}
    {sub==='secteurs'&&<SecteursModLazy s={s} d={d}/>}
    {sub==='reglement'&&<ReglementTravailModLazy s={s} d={d}/>}
    {sub==='contrats'&&<ContratsTravailModLazy s={s} d={d}/>}
    {sub==='compteindiv'&&<CompteIndividuelModLazy s={s} d={d}/>}
    {sub==='accounting'&&<AccountingOutputModLazy s={s} d={d}/>}
    {sub==='alertes'&&<AlertesLegalesModLazy s={s} d={d}/>}
    {sub==='bilanbnb'&&<BilanSocialBNBModLazy s={s} d={d}/>}
    {sub==='co2'&&<CO2ModLazy s={s} d={d}/>}
    {sub==='certpme'&&<CertPMEModLazy s={s} d={d}/>}
    {sub==='ecocmd'&&<EcoCommandeModLazy s={s} d={d}/>}
    {sub==='preavis'&&<PreavisModLazy s={s} d={d}/>}
    {sub==='pecsortie'&&<PeculeSortieModLazy s={s} d={d}/>}
    {sub==='credittemps'&&<CreditTempsModLazy s={s} d={d}/>}
    {sub==='absences'&&<AbsencesModLazy s={s} d={d}/>}
    {sub==='indexauto'&&<IndexAutoModLazy s={s} d={d}/>}
    {sub==='cafeteria'&&<CafeteriaModLazy s={s} d={d}/>}
    {sub==='cct90'&&<CCT90ModLazy s={s} d={d}/>}
    {sub==='budgetmob'&&<BudgetMobiliteModLazy s={s} d={d}/>}
    {sub==='statsins'&&<StatsINSModLazy s={s} d={d}/>}
    {sub==='warrants'&&<WarrantsModLazy s={s} d={d}/>}
    {sub==='planform'&&<PlanFormationModLazy s={s} d={d}/>}
    {sub==='ecocircul'&&<NoteFraisModLazy s={s} d={d}/>}
    {sub==='horsforfait'&&<HeuresSupModLazy s={s} d={d}/>}
    {sub==='peppol'&&<PeppolModLazy s={s} d={d}/>}
  </div>;
}






function calcQuotiteSaisissable(netMensuel,nbEnfantsCharge=0,isRemplacement=false,isPensionAlim=false){
  // Pension alimentaire = saisissable en TOTALITÃ‰ (art. 1412 CJ)
  if(isPensionAlim)return{saisissable:netMensuel,protege:0,tranches:[],enfantImmun:0,note:"CrÃ©ance alimentaire: saisissable en totalitÃ© (art. 1412 CJ)"};
  const bareme=isRemplacement?SAISIE_2026_REMPLACEMENT:SAISIE_2026_TRAVAIL;
  let totalSaisissable=0;const tranches=[];
  for(const t of bareme){
    if(netMensuel<=t.min)break;
    const dansLaTranche=Math.min(netMensuel,t.max)-t.min;
    if(dansLaTranche<=0)continue;
    const retenue=+(dansLaTranche*t.pct/100).toFixed(2);
    tranches.push({min:t.min,max:Math.min(t.max,netMensuel),pct:t.pct,montantTranche:+dansLaTranche.toFixed(2),retenue,label:t.label});
    totalSaisissable+=retenue;
  }
  // Immunisation enfants Ã  charge
  const enfantImmun=nbEnfantsCharge*SAISIE_IMMUN_ENFANT_2026;
  const saisissable=Math.max(0,+(totalSaisissable-enfantImmun).toFixed(2));
  const protege=+(netMensuel-saisissable).toFixed(2);
  return{saisissable,protege,tranches,enfantImmun,totalAvantImmun:+totalSaisissable.toFixed(2),note:null};
}

const AF_REGIONS={
  bruxelles:{base:168.97,suppAge:[{from:0,to:5,amt:0},{from:6,to:11,amt:31.36},{from:12,to:17,amt:48.24},{from:18,to:24,amt:60.96}]},
  flandre:{base:173.20,suppRang3:57.42,participation:77.22,suppAge:[{from:0,to:5,amt:0},{from:6,to:11,amt:0},{from:12,to:17,amt:0},{from:18,to:24,amt:0}]},
  wallonie:{bases:[181.61,216.61,247.61],suppAge:[{from:0,to:5,amt:0},{from:6,to:11,amt:21.45},{from:12,to:17,amt:32.18},{from:18,to:24,amt:41.86}]}
};
function calcAllocEnfant(nbEnf,ages,region){
  const reg=AF_REGIONS[region];if(!reg)return{total:0,detail:[]};
  const detail=[];
  for(let i=0;i<nbEnf;i++){
    const age=ages[i]||0;let amt=0;
    if(region==='wallonie'){
      const baseIdx=Math.min(i,reg.bases.length-1);
      amt=reg.bases[baseIdx];
    }else{
      amt=reg.base;
      if(region==='flandre'&&i>=2)amt+=reg.suppRang3;
    }
    const supp=reg.suppAge.find(t=>age>=t.from&&age<=t.to);
    if(supp)amt+=supp.amt;
    detail.push(Math.round(amt*100)/100);
  }
  return{total:detail.reduce((a,v)=>a+v,0),detail};
}




// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SECTEURS SPÃ‰CIFIQUES (HÃ´pitaux, Construction, Ateliers, IMP)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  ACCOUNTING OUTPUT â€” RÃ©capitulatif comptable pour le comptable
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  WORKFLOW EMBAUCHE â€” Checklist complÃ¨te onboarding
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function exportSimulation(){var sb=document.getElementById("sb");if(sb)sb.style.display="none";var el=document.querySelector("main")||document.body;var w=window.open("","_blank");w.document.write("<html><head><title>Aureus Social Pro</title><style>body{font-family:Arial,sans-serif;padding:30px;max-width:900px;margin:auto;color:#1a1a1a}h1,h2,h3{color:#c6a34e}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{padding:6px 10px;border:1px solid #e5e5e5;font-size:12px}</style></head><body>"+el.innerHTML+"</body></html>");w.document.close();w.print();if(sb)sb.style.display="";}function emailSimulation(t,e){if(e){window.location.href="mailto:"+e+"?subject="+encodeURIComponent(t);}}
function sendSimulationPDF(simData,clientEmail){var d=simData||{};var brut=+(d.brut||0);var onssP=Math.round(brut*TX_ONSS_E*100)/100;var assAT=Math.round(brut*TX_AT*100)/100;var med=COUT_MED;var cr=+(d.cheqRepas||130.02);var coutMens=Math.round((brut+onssP+assAT+med+cr)*100)/100;var nb=+(d.nb||1);var dur=+(d.duree||12);var coutTotal=Math.round(coutMens*nb*100)/100;var coutAn=Math.round(coutMens*nb*dur*100)/100;var onssE=Math.round(brut*TX_ONSS_W*100)/100;var pp=quickPP(brut);var net=Math.round((brut-onssE-pp)*100)/100;var ratio=brut>0?Math.round(net/coutMens*100):0;var f2=function(v){return new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0)};var coName=d.coName||"Aureus IA SPRL";var body='<div class="doc-title">SIMULATION COÃ›T SALARIAL</div><div class="doc-subtitle">Estimation basÃ©e sur les barÃ¨mes en vigueur</div>';body+='<div class="kpi-grid"><div class="kpi-card"><div class="kpi-val">'+f2(brut)+' â‚¬</div><div class="kpi-lab">Brut mensuel</div></div><div class="kpi-card"><div class="kpi-val">'+f2(coutMens)+' â‚¬</div><div class="kpi-lab">CoÃ»t mensuel/pers.</div></div><div class="kpi-card"><div class="kpi-val">'+f2(coutAn)+' â‚¬</div><div class="kpi-lab">CoÃ»t sur '+dur+' mois</div></div><div class="kpi-card"><div class="kpi-val">'+ratio+'%</div><div class="kpi-lab">Ratio net/coÃ»t</div></div></div>';body+='<h2 class="article-title">DÃ©composition coÃ»t employeur</h2><table class="doc-table"><thead><tr><th>Ã‰lÃ©ment</th><th style="text-align:right">Montant</th></tr></thead><tbody><tr><td>Salaire brut</td><td style="text-align:right">'+f2(brut)+' â‚¬</td></tr><tr><td>ONSS patronal (25,07%)</td><td style="text-align:right">'+f2(onssP)+' â‚¬</td></tr><tr><td>Assurance accident travail (1%)</td><td style="text-align:right">'+f2(assAT)+' â‚¬</td></tr><tr><td>MÃ©decine du travail</td><td style="text-align:right">'+f2(med)+' â‚¬</td></tr><tr><td>ChÃ¨ques-repas</td><td style="text-align:right">'+f2(cr)+' â‚¬</td></tr><tr class="total-row"><td>COÃ›T par personne</td><td style="text-align:right">'+f2(coutMens)+' â‚¬</td></tr><tr class="total-row"><td>COÃ›T TOTAL ('+nb+' pers.)</td><td style="text-align:right">'+f2(coutTotal)+' â‚¬</td></tr></tbody></table>';body+='<h2 class="article-title">Net employÃ©</h2><table class="doc-table"><thead><tr><th>Ã‰lÃ©ment</th><th style="text-align:right">Montant</th></tr></thead><tbody><tr><td>RÃ©munÃ©ration brute</td><td style="text-align:right">'+f2(brut)+' â‚¬</td></tr><tr><td>Cotisations ONSS (-13,07%)</td><td style="text-align:right">- '+f2(onssE)+' â‚¬</td></tr><tr><td>PrÃ©compte professionnel</td><td style="text-align:right">- '+f2(pp)+' â‚¬</td></tr><tr class="total-row"><td>NET</td><td style="text-align:right">'+f2(net)+' â‚¬</td></tr></tbody></table>';body+='<div class="ref-legal">Estimation indicative â€” Les montants dÃ©finitifs dÃ©pendent de la situation personnelle du travailleur et des dispositions sectorielles applicables.</div>';var html=aureusDocHTML('Simulation coÃ»t salarial â€” '+f2(brut)+' EUR',body,{name:coName});openForPDF(html,'Simulation_'+brut+'EUR');if(clientEmail){var subject=encodeURIComponent("Simulation cout salarial - "+f2(brut)+" EUR");var emailBody=encodeURIComponent("Bonjour,\n\nSimulation:\n- Brut: "+f2(brut)+" EUR\n- Cout employeur: "+f2(coutMens)+" EUR/mois\n- Net estime: "+f2(net)+" EUR\n- Ratio: "+ratio+"%\n\nCordialement,\n"+coName);setTimeout(function(){window.location.href="mailto:"+clientEmail+"?subject="+subject+"&body="+emailBody},600)}}
function generateAttestationEmploi(emp,co){var coName=co?.name||"Aureus IA SPRL";var coVAT=co?.vat||"BE 1028.230.781";var name=(emp.first||emp.fn||"")+" "+(emp.last||emp.ln||"");var f2=function(v){return new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0)};var body='<div class="doc-title">ATTESTATION D\'EMPLOI</div><div class="doc-subtitle">DÃ©livrÃ©e conformÃ©ment Ã  la lÃ©gislation sociale belge</div>';body+='<div class="article-body" style="margin:20px 0"><p>La sociÃ©tÃ© <strong>'+coName+'</strong> ('+coVAT+') atteste par la prÃ©sente que :</p></div>';body+='<div class="parties"><div class="party-box"><div class="party-title">Travailleur</div><div class="party-row"><b>Nom :</b> '+escapeHtml(name)+'</div><div class="party-row"><b>NISS :</b> '+(emp.niss||"N/A")+'</div><div class="party-row"><b>Fonction :</b> '+(emp.function||emp.job||"employÃ©")+'</div></div><div class="party-box"><div class="party-title">Conditions d\'emploi</div><div class="party-row"><b>Date d\'entrÃ©e :</b> '+(emp.startDate||emp.start||"N/A")+'</div><div class="party-row"><b>Type de contrat :</b> '+(emp.contractType||"CDI")+'</div><div class="party-row"><b>RÃ©gime :</b> '+(emp.whWeek||38)+'h/semaine</div><div class="party-row"><b>RÃ©munÃ©ration brute :</b> '+f2(+(emp.monthlySalary||emp.gross||0))+' EUR/mois</div></div></div>';body+='<div class="article-body" style="margin:20px 0"><p>La prÃ©sente attestation est dÃ©livrÃ©e pour servir et valoir ce que de droit.</p></div>';body+='<div class="signature-block"><div class="sig-box"><div class="sig-line">L\'Employeur</div><div class="sig-mention">PrÃ©cÃ©dÃ© de la mention Â« Lu et approuvÃ© Â»</div></div><div class="sig-box"><div class="sig-line">Le Travailleur</div><div class="sig-mention">PrÃ©cÃ©dÃ© de la mention Â« Lu et approuvÃ© Â»</div></div></div>';var html=aureusDocHTML('Attestation d\'emploi â€” '+name,body,co);openForPDF(html,'Attestation_emploi_'+name);}
function generateAttestationSalaire(emp,co){var coName=co?.name||"Aureus IA SPRL";var name=(emp.first||emp.fn||"")+" "+(emp.last||emp.ln||"");var brut=+(emp.monthlySalary||emp.gross||0);var onss=Math.round(brut*TX_ONSS_W*100)/100;var pp=quickPP(brut);var net=Math.round((brut-onss-pp)*100)/100;var f2=function(v){return new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0)};var body='<div class="doc-title">ATTESTATION DE RÃ‰MUNÃ‰RATION</div><div class="doc-subtitle">ConformÃ©ment Ã  la Loi du 12 avril 1965 concernant la protection de la rÃ©munÃ©ration</div>';body+='<div class="article-body" style="margin:20px 0"><p>La sociÃ©tÃ© <strong>'+coName+'</strong> certifie que <strong>'+escapeHtml(name)+'</strong> perÃ§oit la rÃ©munÃ©ration suivante :</p></div>';body+='<table class="doc-table"><thead><tr><th>Ã‰lÃ©ment</th><th style="text-align:right">Mensuel</th><th style="text-align:right">Annuel</th></tr></thead><tbody><tr><td>RÃ©munÃ©ration brute</td><td style="text-align:right">'+f2(brut)+' â‚¬</td><td style="text-align:right">'+f2(brut*12)+' â‚¬</td></tr><tr><td>Cotisations ONSS (13,07%)</td><td style="text-align:right">- '+f2(onss)+' â‚¬</td><td style="text-align:right">- '+f2(onss*12)+' â‚¬</td></tr><tr><td>PrÃ©compte professionnel</td><td style="text-align:right">- '+f2(pp)+' â‚¬</td><td style="text-align:right">- '+f2(pp*12)+' â‚¬</td></tr><tr class="total-row"><td>RÃ©munÃ©ration nette</td><td style="text-align:right">'+f2(net)+' â‚¬</td><td style="text-align:right">'+f2(net*12)+' â‚¬</td></tr></tbody></table>';body+='<div class="article-body" style="margin:20px 0"><p>La prÃ©sente attestation est dÃ©livrÃ©e pour servir et valoir ce que de droit.</p></div>';body+='<div class="signature-block"><div class="sig-box"><div class="sig-line">L\'Employeur</div><div class="sig-mention">PrÃ©cÃ©dÃ© de la mention Â« Lu et approuvÃ© Â»</div></div><div class="sig-box"><div class="sig-line">Le Travailleur</div><div class="sig-mention">PrÃ©cÃ©dÃ© de la mention Â« Lu et approuvÃ© Â»</div></div></div>';var html=aureusDocHTML('Attestation de rÃ©munÃ©ration â€” '+name,body,co);openForPDF(html,'Attestation_salaire_'+name);}
function generateSoldeCompte(emp,co){var coName=co?.name||"Aureus IA SPRL";var name=(emp.first||emp.fn||"")+" "+(emp.last||emp.ln||"");var brut=+(emp.monthlySalary||emp.gross||0);var f2=function(v){return new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0)};var pro=Math.round(brut*15/22*100)/100;var pec=Math.round(brut*PV_SIMPLE*100)/100;var pre=brut;var tot=pro+pec+pre;var onss=Math.round(tot*TX_ONSS_W*100)/100;var pp=quickPP(tot);var net=Math.round((tot-onss-pp)*100)/100;var body='<div class="doc-title">SOLDE DE TOUT COMPTE</div><div class="doc-subtitle">DÃ©compte de clÃ´ture â€” Art. 39 Loi du 3 juillet 1978</div>';body+='<div class="parties"><div class="party-box"><div class="party-title">Employeur</div><div class="party-row"><b>'+coName+'</b></div></div><div class="party-box"><div class="party-title">Travailleur</div><div class="party-row"><b>'+escapeHtml(name)+'</b></div><div class="party-row">NISS : '+(emp.niss||"N/A")+'</div></div></div>';body+='<table class="doc-table"><thead><tr><th>Ã‰lÃ©ment</th><th style="text-align:right">Montant</th></tr></thead><tbody><tr><td>Prorata de rÃ©munÃ©ration</td><td style="text-align:right">'+f2(pro)+' â‚¬</td></tr><tr><td>PÃ©cule de vacances de sortie</td><td style="text-align:right">'+f2(pec)+' â‚¬</td></tr><tr><td>IndemnitÃ© compensatoire de prÃ©avis</td><td style="text-align:right">'+f2(pre)+' â‚¬</td></tr><tr class="total-row"><td>Total brut</td><td style="text-align:right">'+f2(tot)+' â‚¬</td></tr><tr><td>Cotisations ONSS (13,07%)</td><td style="text-align:right">- '+f2(onss)+' â‚¬</td></tr><tr><td>PrÃ©compte professionnel</td><td style="text-align:right">- '+f2(pp)+' â‚¬</td></tr><tr class="total-row"><td>MONTANT NET Ã€ PAYER</td><td style="text-align:right">'+f2(net)+' â‚¬</td></tr></tbody></table>';body+='<div class="article-body" style="margin:20px 0"><p>Le travailleur dÃ©clare avoir reÃ§u l\'intÃ©gralitÃ© des sommes qui lui sont dues au titre de l\'exÃ©cution et de la cessation de son contrat de travail et n\'avoir plus rien Ã  rÃ©clamer Ã  ce titre.</p><p><strong>Pour solde de tout compte.</strong></p></div>';body+='<div class="ref-legal">RÃ©f. lÃ©gale : Art. 39 et 40 de la Loi du 3 juillet 1978 â€” Loi du 12 avril 1965 sur la protection de la rÃ©munÃ©ration</div>';body+='<div class="signature-block"><div class="sig-box"><div class="sig-line">L\'Employeur</div><div class="sig-mention">PrÃ©cÃ©dÃ© de la mention Â« Lu et approuvÃ© Â»</div></div><div class="sig-box"><div class="sig-line">Le Travailleur</div><div class="sig-mention">PrÃ©cÃ©dÃ© de la mention Â« Lu et approuvÃ© Â»</div></div></div>';var html=aureusDocHTML('Solde de tout compte â€” '+name,body,co);openForPDF(html,'Solde_'+name);}
function getAlertes(emps,co){
  const now=new Date();const alerts=[];
  emps.forEach(e=>{
    const name=(e.first||e.fn||'')+" "+(e.last||e.ln||'');
    if(e.contractEnd||e.endDate){const end=new Date(e.contractEnd||e.endDate);const diff=Math.ceil((end-now)/(1000*60*60*24));if(diff>0&&diff<=30)alerts.push({type:"cdd",level:"warning",icon:"ðŸ“‹",msg:"CDD "+name+" expire dans "+diff+" jours ("+end.toLocaleDateString("fr-BE")+")",days:diff});if(diff<=0&&diff>-7)alerts.push({type:"cdd",level:"danger",icon:"ðŸš¨",msg:"CDD "+name+" EXPIRE! ("+end.toLocaleDateString("fr-BE")+")",days:diff});}
    if(e.lastMedical||e.medicalDate){const med=new Date(e.lastMedical||e.medicalDate);const diff=Math.ceil((now-med)/(1000*60*60*24));if(diff>335)alerts.push({type:"medical",level:diff>365?"danger":"warning",icon:"ðŸ¥",msg:"Visite medicale "+name+" : "+(diff>365?"DEPASSEE":"dans "+(365-diff)+"j")+" (derniere: "+med.toLocaleDateString("fr-BE")+")",days:diff});}
    if(e.startDate||e.start){const start=new Date(e.startDate||e.start);const diff=Math.ceil((now-start)/(1000*60*60*24));if(diff>=0&&diff<=7)alerts.push({type:"onboard",level:"info",icon:"ðŸ‘‹",msg:"Nouvel employe "+name+" - onboarding en cours (J+"+diff+")",days:diff});}
    if(!e.niss&&(e.status==="active"||!e.status))alerts.push({type:"niss",level:"danger",icon:"âš ï¸",msg:"NISS manquant pour "+name,days:0});
    if(!e.iban&&(e.status==="active"||!e.status))alerts.push({type:"iban",level:"warning",icon:"ðŸ¦",msg:"IBAN manquant pour "+name,days:0});
    if(e.status==="active"||!e.status){const brut=+(e.monthlySalary||e.gross||0);if(brut>0&&brut<2029.88)alerts.push({type:"rmmmg",level:"warning",icon:"ðŸ’°",msg:name+" sous le RMMMG ("+brut.toFixed(2)+" < 2.029,88 EUR)",days:0});}
  });
  const d=now.getDate();const m=now.getMonth()+1;
  if(d<=5)alerts.push({type:"deadline",level:"info",icon:"ðŸ“…",msg:"Avant le 5: encodage prestations du mois",days:5-d});
  if(m===1||m===4||m===7||m===10){if(d<=15)alerts.push({type:"deadline",level:"warning",icon:"ðŸ“¤",msg:"Trimestre: DmfA a envoyer avant le "+((m===1||m===7)?31:30)+"/"+String(m).padStart(2,"0"),days:15-d});}
  return alerts.sort((a,b)=>a.level==="danger"?-1:b.level==="danger"?1:a.level==="warning"?-1:1);
}
function generateBelcotaxXML(emps,year,co){var coName=co?.name||"Aureus IA SPRL";var coVAT=(co?.vat||"1028230781").replace(/[^0-9]/g,"");var ae=emps.filter(function(e){return e.status==="active"||!e.status});var f2=function(v){return(Math.round(v*100)/100).toFixed(2)};var fiches=ae.map(function(e,i){var brut=+(e.monthlySalary||e.gross||0)*12;var onss=Math.round(brut*TX_ONSS_W*100)/100;var imp=brut-onss;var pp=quickPP(brut/12)*12;var net=Math.round((brut-onss-pp)*100)/100;var niss=(e.niss||"").replace(/[^0-9]/g,"");return"<Fiche281_10 seq=\""+(i+1)+"\"><Worker><INSS>"+niss+"</INSS><Name>"+(e.first||e.fn||"")+" "+(e.last||e.ln||"")+"</Name></Worker><Income><GrossRemuneration>"+f2(brut)+"</GrossRemuneration><SocialContributions>"+f2(onss)+"</SocialContributions><TaxableIncome>"+f2(imp)+"</TaxableIncome><WithholdingTax>"+f2(pp)+"</WithholdingTax><NetRemuneration>"+f2(net)+"</NetRemuneration></Income></Fiche281_10>"}).join("");var xml="<?xml version=\"1.0\" encoding=\"UTF-8\"?><Belcotax><Declarant><CompanyID>"+coVAT+"</CompanyID><Name>"+coName+"</Name><TaxYear>"+(year||2025)+"</TaxYear><IncomeYear>"+((year||2025)-1)+"</IncomeYear><NbFiches>"+ae.length+"</NbFiches></Declarant>"+fiches+"</Belcotax>";var blob=new Blob([xml],{type:"application/octet-stream"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="Belcotax_281_10_"+(year||2025)+".xml";document.body.appendChild(a);a.click();setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},3000);}
function generateDmfAXML(emps,trimestre,year,co){var coName=co?.name||"Aureus IA SPRL";var coVAT=(co?.vat||"1028230781").replace(/[^0-9]/g,"");var ae=emps.filter(function(e){return e.status==="active"||!e.status});var f2=function(v){return(Math.round(v*100)/100).toFixed(2)};var totalBrut=ae.reduce(function(a,e){return a+(+(e.monthlySalary||e.gross||0))*3},0);var totalONSS=Math.round(totalBrut*(TX_ONSS_W+TX_ONSS_E)*100)/100;var workers=ae.map(function(e){var brut3=(+(e.monthlySalary||e.gross||0))*3;var onss=Math.round(brut3*TX_ONSS_W*100)/100;var onssE=Math.round(brut3*TX_ONSS_E*100)/100;return"<WorkerRecord><INSS>"+(e.niss||"").replace(/[^0-9]/g,"")+"</INSS><Name>"+(e.first||e.fn||"")+" "+(e.last||e.ln||"")+"</Name><Category>"+(e.statut==="ouvrier"?"BC":"WC")+"</Category><JointCommittee>"+(e.cp||co?.cp||"200")+"</JointCommittee><GrossQuarter>"+f2(brut3)+"</GrossQuarter><WorkerONSS>"+f2(onss)+"</WorkerONSS><EmployerONSS>"+f2(onssE)+"</EmployerONSS></WorkerRecord>"}).join("");var xml="<?xml version=\"1.0\" encoding=\"UTF-8\"?><DmfAMessage><Header><Sender><CompanyID>"+coVAT+"</CompanyID><Name>"+coName+"</Name></Sender><Reference>DMFA-"+(year||2026)+"-Q"+(trimestre||1)+"</Reference><Quarter>"+(trimestre||1)+"</Quarter><Year>"+(year||2026)+"</Year></Header><Employer><CompanyID>"+coVAT+"</CompanyID><Name>"+coName+"</Name><NbWorkers>"+ae.length+"</NbWorkers><TotalGross>"+f2(totalBrut)+"</TotalGross><TotalONSS>"+f2(totalONSS)+"</TotalONSS>"+workers+"</Employer><Footer><TotalDue>"+f2(totalONSS)+"</TotalDue></Footer></DmfAMessage>";var blob=new Blob([xml],{type:"application/octet-stream"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="DmfA_Q"+(trimestre||1)+"_"+(year||2026)+".xml";document.body.appendChild(a);a.click();setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},3000);}
function generateC4PDF(emp,co){const coName=co?.name||"Aureus IA SPRL";const coVAT=co?.vat||"BE 1028.230.781";const name=(emp.first||emp.fn||"")+" "+(emp.last||emp.ln||"");const niss=emp.niss||"";const start=emp.startDate||emp.start||"";const end=emp.endDate||emp.contractEnd||new Date().toISOString().slice(0,10);const brut=+(emp.monthlySalary||emp.gross||0);const f2=v=>new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);var body='<div class="doc-title">CERTIFICAT DE CHÃ”MAGE C4</div><div class="doc-subtitle">Formulaire C4 â€” ConformÃ©ment Ã  l\'ArrÃªtÃ© ministÃ©riel du 26/11/1991</div>';body+='<h2 class="article-title">1. Employeur</h2><div class="parties"><div class="party-box" style="flex:1"><div class="party-row"><b>DÃ©nomination :</b> '+coName+'</div><div class="party-row"><b>NÂ° BCE :</b> '+coVAT+'</div><div class="party-row"><b>Commission paritaire :</b> '+(emp.cp||co?.cp||"200")+'</div></div></div>';body+='<h2 class="article-title">2. Travailleur</h2><div class="parties"><div class="party-box" style="flex:1"><div class="party-row"><b>Nom et prÃ©nom :</b> '+escapeHtml(name)+'</div><div class="party-row"><b>NISS :</b> '+niss+'</div><div class="party-row"><b>Statut :</b> '+(emp.statut||"EmployÃ©")+'</div></div></div>';body+='<h2 class="article-title">3. Occupation</h2><table class="doc-table"><tbody><tr><td><b>Date de dÃ©but</b></td><td>'+start+'</td></tr><tr><td><b>Date de fin</b></td><td>'+end+'</td></tr><tr><td><b>RÃ©gime de travail</b></td><td>'+(emp.whWeek||38)+' heures/semaine</td></tr><tr><td><b>RÃ©munÃ©ration brute</b></td><td>'+f2(brut)+' EUR/mois</td></tr></tbody></table>';body+='<h2 class="article-title">4. Motif de la fin de contrat</h2><table class="doc-table"><tbody><tr><td><b>Motif</b></td><td>'+(emp.endReason||"Fin de contrat Ã  durÃ©e dÃ©terminÃ©e")+'</td></tr><tr><td><b>Initiative</b></td><td>'+(emp.endInitiative||"Employeur")+'</td></tr></tbody></table>';body+='<div class="ref-legal">RÃ©f. lÃ©gale : ArrÃªtÃ© royal du 25/11/1991 â€” ArrÃªtÃ© ministÃ©riel du 26/11/1991 â€” Art. 137 de l\'ArrÃªtÃ© royal du 25/11/1991</div>';body+='<div class="signature-block"><div class="sig-box"><div class="sig-line">Signature employeur</div><div class="sig-mention">Cachet de l\'entreprise</div></div><div class="sig-box"><div class="sig-line">Signature travailleur</div><div class="sig-mention">PrÃ©cÃ©dÃ© de la mention Â« Lu et approuvÃ© Â»</div></div></div>';var html=aureusDocHTML('Certificat C4 â€” '+name,body,co);openForPDF(html,'C4_'+name);}
function generateSEPAXML(emps,period,co){var coName=co?.name||"Aureus IA SPRL";var coIBAN=co?.iban||"BE00000000000000";var coBIC=co?.bic||"GEBABEBB";var coVAT=(co?.vat||"BE1028230781").replace(/[^A-Z0-9]/g,"");var now=new Date();var msgId="SEPA-"+now.toISOString().replace(/[^0-9]/g,"").slice(0,14);var pmtId="PAY-"+(period?.month||now.getMonth()+1)+"-"+(period?.year||now.getFullYear());var mois=["Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Decembre"];var periodeStr=(mois[(period?.month||1)-1]||"")+" "+(period?.year||2026);var ae=emps.filter(function(e){return(e.status==="active"||!e.status)&&e.iban});var payments=ae.map(function(e){var brut=+(e.monthlySalary||e.gross||0);var onss=Math.round(brut*TX_ONSS_W*100)/100;var imp=brut-onss;var pp=quickPP(brut);var net=Math.round((brut-onss-pp)*100)/100;return{name:(e.first||e.fn||"")+" "+(e.last||e.ln||""),iban:(e.iban||"").replace(/\s/g,""),bic:e.bic||"GEBABEBB",amount:net,ref:"SAL/"+pmtId+"/"+(e.id||"").slice(0,8)}}).filter(function(p){return p.amount>0});var totalAmount=payments.reduce(function(a,p){return a+p.amount},0);var f2=function(v){return(Math.round(v*100)/100).toFixed(2)};var txns=payments.map(function(p){return"<CdtTrfTxInf><PmtId><EndToEndId>"+p.ref+"</EndToEndId></PmtId><Amt><InstdAmt Ccy=\"EUR\">"+f2(p.amount)+"</InstdAmt></Amt><CdtrAgt><FinInstnId><BIC>"+p.bic+"</BIC></FinInstnId></CdtrAgt><Cdtr><Nm>"+p.name+"</Nm></Cdtr><CdtrAcct><Id><IBAN>"+p.iban+"</IBAN></Id></CdtrAcct><RmtInf><Ustrd>Salaire "+periodeStr+"</Ustrd></RmtInf></CdtTrfTxInf>"}).join("");var xml="<?xml version=\"1.0\" encoding=\"UTF-8\"?><Document xmlns=\"urn:iso:std:iso:20022:tech:xsd:pain.001.001.03\"><CstmrCdtTrfInitn><GrpHdr><MsgId>"+msgId+"</MsgId><CreDtTm>"+now.toISOString()+"</CreDtTm><NbOfTxs>"+payments.length+"</NbOfTxs><CtrlSum>"+f2(totalAmount)+"</CtrlSum><InitgPty><Nm>"+coName+"</Nm></InitgPty></GrpHdr><PmtInf><PmtInfId>"+pmtId+"</PmtInfId><PmtMtd>TRF</PmtMtd><NbOfTxs>"+payments.length+"</NbOfTxs><CtrlSum>"+f2(totalAmount)+"</CtrlSum><PmtTpInf><SvcLvl><Cd>SEPA</Cd></SvcLvl></PmtTpInf><ReqdExctnDt>"+now.toISOString().slice(0,10)+"</ReqdExctnDt><Dbtr><Nm>"+coName+"</Nm></Dbtr><DbtrAcct><Id><IBAN>"+coIBAN+"</IBAN></Id></DbtrAcct><DbtrAgt><FinInstnId><BIC>"+coBIC+"</BIC></FinInstnId></DbtrAgt><ChrgBr>SLEV</ChrgBr>"+txns+"</PmtInf></CstmrCdtTrfInitn></Document>";var blob=new Blob([xml],{type:"application/octet-stream"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="SEPA_Salaires_"+periodeStr.replace(/ /g,"_")+".xml";document.body.appendChild(a);a.click();setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},3000);}
function generateDimonaXML(emp,type,co){
  const coVAT=(co?.vat||'1028230781').replace(/[^0-9]/g,'');
  const empName=(emp.first||emp.fn||'')+" "+(emp.last||emp.ln||'');
  const niss=(emp.niss||emp.NISS||'').replace(/[^0-9]/g,'');
  const startD=(emp.startDate||emp.start||new Date().toISOString().slice(0,10)).replace(/-/g,'');
  const endD=(emp.endDate||emp.end||'').replace(/-/g,'')||startD;
  const now=new Date();
  const ts=now.toISOString().replace(/[-:T]/g,'').slice(0,14);
  const refNum='DIM'+ts+Math.floor(Math.random()*9999).toString().padStart(4,'0');
  const xml=`<?xml version="1.0" encoding="UTF-8"?>
<DIMONAMessage xmlns="http://www.smals-mvm.be/xml/ns/dimona" version="20240101">
  <Header>
    <Sender>
      <CompanyID origin="KBO">${coVAT}</CompanyID>
      <Name>${co?.name||'Aureus IA SPRL'}</Name>
    </Sender>
    <Reference>${refNum}</Reference>
    <CreationDate>${now.toISOString().slice(0,10)}</CreationDate>
    <CreationTime>${now.toTimeString().slice(0,8)}</CreationTime>
  </Header>
  <Declaration>
    <DeclarationType>${type==='OUT'?'DIMONAOUT':'DIMONAIN'}</DeclarationType>
    <Employer>
      <CompanyID origin="KBO">${coVAT}</CompanyID>
      <NOSS>${coVAT.slice(0,10)}</NOSS>
      <Name>${co?.name||'Aureus IA SPRL'}</Name>
      <JointCommittee>${emp.cp||co?.cp||'200'}</JointCommittee>
    </Employer>
    <Worker>
      <INSS>${niss}</INSS>
      <LastName>${emp.last||emp.ln||''}</LastName>
      <FirstName>${emp.first||emp.fn||''}</FirstName>
      <WorkerType>${emp.statut==='ouvrier'?'BC':'WC'}</WorkerType>
    </Worker>
    <EmploymentDetail>
      <StartDate>${startD}</StartDate>
      ${type==='OUT'?`<EndDate>${endD}</EndDate>
      <EndReason>${emp.endReason||'CONTRACT_END'}</EndReason>`:''}
      <WorkerCategory>${emp.category||'1'}</WorkerCategory>
      <JointCommittee>${emp.cp||co?.cp||'200'}</JointCommittee>
      <PlannedHoursPerWeek>${emp.whWeek||emp.regime||38}</PlannedHoursPerWeek>
      <ReferenceHoursPerWeek>38</ReferenceHoursPerWeek>
    </EmploymentDetail>
  </Declaration>
  <Footer>
    <TotalDeclarations>1</TotalDeclarations>
  </Footer>
</DIMONAMessage>`;
  const blob=new Blob([xml],{type:'application/octet-stream'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='DIMONA_'+type+'_'+empName.replace(/ /g,'_')+'_'+now.toISOString().slice(0,10)+'.xml';
  document.body.appendChild(a);a.click();setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},3000);
  return{ref:refNum,xml};
}

async function generatePayslipPDF(emp,r,period,co){
  try{
  // DÃ©tection d'arguments dÃ©calÃ©s: generatePayslipPDF(emp,co) au lieu de (emp,r,period,co)
  if(r&&(r.name||r.vat)&&!period&&!co){co=r;r=null;period=null;}
  if(!r){const brut=+(emp.monthlySalary||emp.gross||0);r=typeof calc==='function'?calc(emp,{},co||{}):({brut,gross:brut,onssP:Math.round(brut*TX_ONSS_W*100)/100,pp:quickPP(brut),net:quickNet(brut),onssE:Math.round(brut*TX_ONSS_E*100)/100,coutTotal:Math.round(brut*(1+TX_ONSS_E)*100)/100});}
  if(!period){const d=new Date();period={month:d.getMonth()+1,year:d.getFullYear()};}
  const _payslipHTML=[];const w={document:{write:function(h){_payslipHTML.push(h)},close:function(){try{const html=_payslipHTML.join('');if(!html||html.length<100){alert('Erreur: HTML vide');return;}
  openForPDF(html, 'Fiche_paie_'+empName);
  }catch(err){alert('Erreur download: '+err.message);}}}};
  const coName=co?.name||'Entreprise';
  const coVAT=co?.vat||'BE XXXX.XXX.XXX';
  const coAddr=co?.address||'';
  const coCP=co?.cp||'CP 200';
  const empName=(emp.first||emp.fn||'')+" "+(emp.last||emp.ln||'');
  const empNISS=emp.niss||emp.NISS||'XX.XX.XX-XXX.XX';
  const empIBAN=emp.iban||emp.IBAN||'';
  const mois=["Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Decembre"];
  const periodeStr=period?(mois[(period.month||1)-1]||"")+" "+(period.year||2026):"Fevrier 2026";
  const brut=r.gross||r.brut||0;
  const onssP=r.onssP||r.onss||Math.round(brut*TX_ONSS_W*100)/100;
  const imposable=r.imposable||Math.round((brut-onssP)*100)/100;
  const pp=r.pp||r.withholding||Math.round(imposable*PP_EST*100)/100;
  const csss=r.csss||r.specSS||0;
  const net=r.net||Math.round((brut-onssP-pp-csss)*100)/100;
  const onssE=r.onssE||r.empSS||Math.round(brut*TX_ONSS_E*100)/100;
  const coutTotal=r.coutTotal||Math.round((brut+onssE)*100)/100;
  const mealV=r.mealV||(emp.mealVoucher?emp.mealVoucher*22:0);
  const f2=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Fiche de paie - ${empName} - ${periodeStr}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#1a1a1a;padding:30px;max-width:800px;margin:auto;background:#fff}
.header{display:flex;justify-content:space-between;border-bottom:3px solid #c6a34e;padding-bottom:15px;margin-bottom:15px}
.header-left{flex:1}
.header-right{text-align:right;flex:1}
.company{font-size:16px;font-weight:700;color:#1a1a1a}
.subtitle{font-size:10px;color:#666;margin-top:2px}
.gold{color:#c6a34e}
.period-badge{display:inline-block;background:#c6a34e;color:#fff;padding:4px 12px;border-radius:4px;font-weight:700;font-size:12px}
.section{margin:12px 0}
.section-title{font-size:11px;font-weight:700;color:#c6a34e;text-transform:uppercase;letter-spacing:1px;padding:4px 0;border-bottom:1px solid #e5e5e5;margin-bottom:6px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px}
.info-row{display:flex;justify-content:space-between;font-size:10px}
.info-label{color:#666}
.info-value{font-weight:600}
table{width:100%;border-collapse:collapse;margin:6px 0}
th{text-align:left;font-size:9px;text-transform:uppercase;color:#666;padding:4px 6px;border-bottom:2px solid #e5e5e5;letter-spacing:0.5px}
th.right{text-align:right}
td{padding:4px 6px;border-bottom:1px solid #f0f0f0;font-size:10px}
td.right{text-align:right;font-family:'Courier New',monospace}
td.bold{font-weight:700}
.total-row{background:#f8f6f0;font-weight:700}
.total-row td{border-top:2px solid #c6a34e;border-bottom:2px solid #c6a34e;padding:6px}
.net-row{background:#c6a34e;color:#fff;font-weight:800;font-size:12px}
.net-row td{padding:8px 6px;border:none}
.footer{margin-top:20px;padding-top:10px;border-top:1px solid #e5e5e5;display:flex;justify-content:space-between;font-size:9px;color:#999}
.employer-box{margin-top:12px;padding:8px;background:#fafafa;border:1px solid #e5e5e5;border-radius:4px}
.employer-box .title{font-size:9px;color:#c6a34e;font-weight:700;text-transform:uppercase;margin-bottom:4px}
@media print{body{padding:20px}button{display:none!important}}
</style></head><body>
<div class="header">
  <div class="header-left">
    <div class="company">${coName}</div>
    <div class="subtitle">${coVAT} | ${coCP}</div>
    <div class="subtitle">${coAddr}</div>
  </div>
  <div class="header-right">
    <div class="period-badge">${periodeStr}</div>
    <div style="margin-top:6px;font-size:10px;color:#666">FICHE DE PAIE</div>
    <div style="font-size:9px;color:#999">Document confidentiel</div>
  </div>
</div>
<div class="section">
  <div class="section-title">Identification travailleur</div>
  <div class="info-grid">
    <div class="info-row"><span class="info-label">Nom:</span><span class="info-value">${empName}</span></div>
    <div class="info-row"><span class="info-label">NISS:</span><span class="info-value">${empNISS}</span></div>
    <div class="info-row"><span class="info-label">Fonction:</span><span class="info-value">${emp.function||emp.job||'EmployÃ©'}</span></div>
    <div class="info-row"><span class="info-label">Statut:</span><span class="info-value">${emp.statut||'EmployÃ©'}</span></div>
    <div class="info-row"><span class="info-label">Entree:</span><span class="info-value">${emp.startDate||emp.start||'-'}</span></div>
    <div class="info-row"><span class="info-label">Regime:</span><span class="info-value">${emp.regime||emp.whWeek||38}h/sem</span></div>
  </div>
</div>
<div class="section">
  <div class="section-title">Remuneration brute</div>
  <table>
    <tr><th>Description</th><th class="right">Jours/Heures</th><th class="right">Taux</th><th class="right">Montant</th></tr>
    <tr><td>Salaire mensuel de base</td><td class="right">${r.workDays||22} j</td><td class="right">${f2(brut/22)}/j</td><td class="right bold">${f2(r.base||brut)}</td></tr>
    ${(r.overtime||0)>0?`<tr><td>Heures supplementaires (150%)</td><td class="right">${r.overtimeH||'-'}h</td><td class="right">150%</td><td class="right">${f2(r.overtime)}</td></tr>`:''}
    ${(r.sunday||0)>0?`<tr><td>Heures dimanche (200%)</td><td class="right">${r.sundayH||'-'}h</td><td class="right">200%</td><td class="right">${f2(r.sunday)}</td></tr>`:''}
    ${(r.night||0)>0?`<tr><td>Heures nuit (125%)</td><td class="right">${r.nightH||'-'}h</td><td class="right">125%</td><td class="right">${f2(r.night)}</td></tr>`:''}
    ${(r.bonus||0)>0?`<tr><td>Prime/Bonus</td><td class="right">-</td><td class="right">-</td><td class="right">${f2(r.bonus)}</td></tr>`:''}
    <tr class="total-row"><td colspan="3">TOTAL BRUT</td><td class="right">${f2(brut)}</td></tr>
  </table>
</div>
<div class="section">
  <div class="section-title">Retenues</div>
  <table>
    <tr><th>Description</th><th class="right">Base</th><th class="right">Taux</th><th class="right">Montant</th></tr>
    <tr><td>Cotisation ONSS personnelle</td><td class="right">${f2(brut)}</td><td class="right">13,07%</td><td class="right" style="color:#c0392b">-${f2(onssP)}</td></tr>
    <tr><td>PrÃ©compte professionnel</td><td class="right">${f2(imposable)}</td><td class="right">${imposable>0?(pp/imposable*100).toFixed(1)+'%':'-'}</td><td class="right" style="color:#c0392b">-${f2(pp)}</td></tr>
    <tr><td>Cotisation spÃ©ciale securite sociale</td><td class="right">-</td><td class="right">Bareme</td><td class="right" style="color:#c0392b">-${f2(csss)}</td></tr>
    <tr class="total-row"><td colspan="3">TOTAL RETENUES</td><td class="right" style="color:#c0392b">-${f2(onssP+pp+csss)}</td></tr>
  </table>
</div>
<div class="section">
  <table>
    <tr class="net-row"><td colspan="3" style="font-size:13px">NET A PAYER</td><td class="right" style="font-size:15px">${f2(net)} EUR</td></tr>
  </table>
</div>
${empIBAN?`<div style="font-size:10px;color:#666;margin-top:4px">Virement sur: <b>${empIBAN}</b></div>`:''}
<div class="employer-box">
  <div class="title">Charges patronales (pour information)</div>
  <div class="info-grid">
    <div class="info-row"><span class="info-label">ONSS patronal (25,07%):</span><span class="info-value">${f2(onssE)}</span></div>
    <div class="info-row"><span class="info-label">CoÃ»t total employeur:</span><span class="info-value" style="color:#c6a34e;font-weight:800">${f2(coutTotal)}</span></div>
  </div>
</div>
${mealV>0?`<div style="margin-top:6px;font-size:10px;color:#666">Cheques-repas: ${emp.mealVoucher||0} x 22j = ${f2(mealV)} EUR (part patronale ${f2((emp.mealVoucher||0)*22*0.83)})</div>`:''}
<div class="footer">
  <span>GÃ©nÃ©rÃ© par Aureus Social Pro | ${coName} | ${coVAT}</span>
  <span>Date edition: ${new Date().toLocaleDateString('fr-BE')}</span>
</div>
<div style="text-align:center;margin-top:15px"><button onclick="window.print()" style="background:#c6a34e;color:#fff;border:none;padding:10px 30px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600">Imprimer / Sauvegarder PDF</button></div>
</body></html>`);
  w.document.close();
  }catch(err){alert('Erreur gÃ©nÃ©ration fiche: '+err.message);console.error(err);}
}

// â•â•â• UNIVERSAL FILE HELPERS (Sprint 24 fix) â•â•â•
function downloadFile(content, filename, mimeType) {
  try {
    const blob = new Blob([content], { type: mimeType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    // Try standard download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { try { document.body.removeChild(a); } catch(e) {} URL.revokeObjectURL(url); }, 5000);
    return true;
  } catch(err) { 
    console.error('Download error:', err);
    alert('Erreur tÃ©lÃ©chargement: ' + err.message);
    return false;
  }
}

function openForPDF(html, title) {
  if (!html || typeof html !== 'string') { alert('Document indisponible.'); return; }
  
  // Wrap HTML with Aureus branding if not already branded
  var brandedHtml = html;
  if (html.indexOf('aureus-branded-doc') === -1) {
    var coInfo = '';
    try { coInfo = (window.__aureusCoName || 'Aureus IA SPRL') + ' â€” BCE BE 1028.230.781'; } catch(e) { coInfo = 'Aureus IA SPRL â€” BCE BE 1028.230.781'; }
    var headerStyle = 'style="background:#060810;padding:20px 30px 15px;margin:-40px -40px 20px -40px;border-bottom:3px solid #c6a34e"';
    if (html.indexOf('<body') === -1) {
      brandedHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Segoe UI,Arial,sans-serif;font-size:11px;padding:40px;max-width:800px;margin:auto;color:#1a1a1a;background:#fff}@media print{.no-print{display:none!important}}</style></head><body class="aureus-branded-doc">' + html + '</body></html>';
    } else {
      brandedHtml = html.replace('<body', '<body class="aureus-branded-doc"');
    }
    // Inject Aureus header after <body...>
    var bodyTagEnd = brandedHtml.indexOf('>', brandedHtml.indexOf('<body')) + 1;
    var aureusHeader = '<div ' + headerStyle + '><div style="display:flex;justify-content:space-between;align-items:center"><div><span style="font-family:Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;color:#c6a34e;letter-spacing:1px">AUREUS</span><span style="font-size:8px;color:#9e9b93;margin-left:8px;letter-spacing:2px">SOCIAL PRO</span></div><div style="text-align:right"><div style="font-size:10px;color:#e8e6e0;font-weight:600">' + (title||'Document').replace(/_/g,' ') + '</div><div style="font-size:8px;color:#9e9b93;margin-top:2px">' + new Date().toLocaleDateString('fr-BE') + ' | Ref: ASP-' + new Date().getFullYear() + '-' + String(new Date().getMonth()+1).padStart(2,'0') + '-' + String(Math.floor(Math.random()*9000+1000)) + '</div></div></div></div>';
    var aureusFooter = '<div class="no-print" style="margin-top:30px;padding-top:10px;border-top:1px solid #c6a34e;text-align:center;font-size:8px;color:#9e9b93">Aureus Social Pro | ' + coInfo + ' | Place Marcel Broodthaers 8, 1060 Saint-Gilles | www.aureussocial.be</div>';
    brandedHtml = brandedHtml.slice(0, bodyTagEnd) + aureusHeader + brandedHtml.slice(bodyTagEnd);
    // Add footer before </body>
    brandedHtml = brandedHtml.replace('</body>', aureusFooter + '</body>');
  }
  
  // Show overlay with PDF download + preview
  var overlay = document.createElement('div');
  overlay.id = 'aureus-pdf-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(6,8,16,.95);z-index:2147483647;display:flex;flex-direction:column;align-items:center;padding:16px;font-family:system-ui,sans-serif';
  
  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;gap:10px;margin-bottom:12px;align-items:center';
  
  var titleEl = document.createElement('div');
  titleEl.textContent = (title||'Document').replace(/_/g, ' ');
  titleEl.style.cssText = 'color:#c6a34e;font-weight:700;font-size:15px;margin-right:20px';
  topBar.appendChild(titleEl);
  
  // PDF Download button (native PDF via html2pdf.js)
  var btnPDF = document.createElement('button');
  btnPDF.textContent = 'ðŸ“„ TÃ©lÃ©charger PDF';
  btnPDF.style.cssText = 'padding:10px 24px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;background:#c6a34e;color:#060810;transition:opacity .2s';
  btnPDF.onclick = async function() {
    btnPDF.textContent = 'â³ GÃ©nÃ©ration PDF...';
    btnPDF.style.opacity = '0.6';
    btnPDF.disabled = true;
    try {
      await loadHtml2Pdf();
      // Create temp container for html2pdf
      var container = document.createElement('div');
      container.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;background:#fff';
      container.innerHTML = brandedHtml.replace(/<html[^>]*>|<\/html>|<head>[\s\S]*?<\/head>|<body[^>]*>|<\/body>|<!DOCTYPE[^>]*>/gi, '');
      // Extract and apply styles
      var styleMatch = brandedHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
      if (styleMatch) {
        var styleEl = document.createElement('style');
        styleEl.textContent = styleMatch.map(function(s){ return s.replace(/<\/?style[^>]*>/gi,''); }).join('\n');
        container.prepend(styleEl);
      }
      document.body.appendChild(container);
      var fname = (title || 'Aureus_Document').replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf';
      await window.html2pdf().set({
        margin: [10, 10, 15, 10],
        filename: fname,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }).from(container).save();
      document.body.removeChild(container);
      btnPDF.textContent = 'âœ… PDF tÃ©lÃ©chargÃ© !';
      btnPDF.style.opacity = '1';
      setTimeout(function(){ btnPDF.textContent = 'ðŸ“„ TÃ©lÃ©charger PDF'; btnPDF.disabled = false; }, 2000);
    } catch(err) {
      console.error('PDF generation error:', err);
      btnPDF.textContent = 'ðŸ“„ TÃ©lÃ©charger PDF';
      btnPDF.style.opacity = '1';
      btnPDF.disabled = false;
      // Fallback: print dialog
      try { 
        var iframe = overlay.querySelector('iframe');
        if (iframe && iframe.contentWindow) iframe.contentWindow.print(); 
        else alert('Utilisez Ctrl+P puis "Enregistrer au format PDF"');
      } catch(e2) { alert('Utilisez Ctrl+P puis "Enregistrer au format PDF"'); }
    }
  };
  topBar.appendChild(btnPDF);
  
  // Print button
  var btnPrint = document.createElement('button');
  btnPrint.textContent = 'ðŸ–¨ï¸ Imprimer';
  btnPrint.style.cssText = 'padding:10px 20px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;background:rgba(198,163,78,.15);color:#c6a34e';
  btnPrint.onclick = function() {
    try { 
      var iframe = overlay.querySelector('iframe');
      if (iframe && iframe.contentWindow) iframe.contentWindow.print(); 
    } catch(e) { alert('Ctrl+P pour imprimer'); }
  };
  topBar.appendChild(btnPrint);
  
  // Open in new tab button
  var btnTab = document.createElement('button');
  btnTab.textContent = 'â†— Nouvel onglet';
  btnTab.style.cssText = 'padding:10px 20px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;background:rgba(59,130,246,.1);color:#3b82f6';
  btnTab.onclick = function() {
    try { var w = window.open('','_blank'); if(w){w.document.write(brandedHtml);w.document.close();w.document.title=title||'Aureus Social Pro';} } catch(e) {}
  };
  topBar.appendChild(btnTab);
  
  // Close button
  var btnClose = document.createElement('button');
  btnClose.textContent = 'âœ• Fermer';
  btnClose.style.cssText = 'padding:10px 20px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;background:#ef4444;color:#fff;margin-left:10px';
  btnClose.onclick = function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
  topBar.appendChild(btnClose);
  
  overlay.appendChild(topBar);
  
  // Preview iframe
  var iframe = document.createElement('iframe');
  iframe.style.cssText = 'flex:1;width:100%;max-width:900px;border:2px solid rgba(198,163,78,.3);border-radius:10px;background:#fff';
  iframe.srcdoc = brandedHtml;
  overlay.appendChild(iframe);
  
  document.body.appendChild(overlay);
}

function previewHTML(html, title) {
  try {
    const win = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    if (win && !win.closed) {
      win.document.write(html);
      win.document.close();
      win.document.title = title || 'Aureus Social Pro';
      win.focus();
      return;
    }
  } catch(e) {}
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.88);z-index:99999;display:flex;flex-direction:column;align-items:center;padding:16px';
  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex;gap:8px;margin-bottom:12px';
  const iframe = document.createElement('iframe');
  [
    { text: 'ðŸ“„ TÃ©lÃ©charger PDF', bg: '#c6a34e', color: '#060810', fn: () => { try { iframe.contentWindow.print(); } catch(e) { alert('Utilisez Ctrl+P pour enregistrer en PDF'); } } },
    { text: 'âœ• Fermer', bg: '#ef4444', color: '#fff', fn: () => document.body.removeChild(overlay) }
  ].forEach(b => {
    const btn = document.createElement('button');
    btn.textContent = b.text;
    btn.style.cssText = 'padding:10px 20px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;background:' + b.bg + ';color:' + b.color;
    btn.onclick = b.fn;
    bar.appendChild(btn);
  });
  iframe.style.cssText = 'flex:1;width:100%;max-width:900px;border:2px solid rgba(198,163,78,.3);border-radius:10px;background:#fff';
  iframe.srcdoc = html;
  overlay.appendChild(bar);
  overlay.appendChild(iframe);
  document.body.appendChild(overlay);
}

function calcPayroll(brut,statut,familial,charges,regime){
  if(!brut||brut<=0)return{brut:0,onssP:0,imposable:0,pp:0,csss:0,bonusEmploi:0,net:0,onssE:0,coutTotal:0,details:{}};
  const r=(regime||100)/100;
  const brutR=brut*r;
  const onssP=Math.round(brutR*TX_ONSS_W*100)/100;
  const imposable=Math.round((brutR-onssP)*100)/100;
  const qe=statut==='independant'?0:880.83;
  const chDed=(charges||0)*175;
  const baseImp=Math.max(0,imposable-qe-chDed);
  let pp=0;
  if(baseImp>0){
    const t1=Math.min(baseImp,1128.33)*0.2675;
    const t2=baseImp>1128.33?Math.min(baseImp-1128.33,450)*0.3210:0;
    const t3=baseImp>1578.33?Math.min(baseImp-1578.33,1140)*0.4280:0;
    const t4=baseImp>2718.33?(baseImp-2718.33)*0.4815:0;
    pp=Math.round((t1+t2+t3+t4)*100)/100;
  }
  if(familial==='marie_1rev')pp=Math.round(pp*0.70*100)/100;
  if(familial==='marie_2rev')pp=Math.round(pp*PV_DOUBLE*100)/100;
  let csss=0;
  if(brutR<=1945.38)csss=0;
  else if(brutR<=2190.18)csss=brutR*0.076-147.87;
  else if(brutR<=6038.82)csss=brutR*0.011-5.25;
  else csss=60.94;
  csss=Math.round(Math.max(0,csss)*100)/100;
  let bonusEmploi=0;
  if(imposable<=1945.38)bonusEmploi=Math.min(pp,308.33);
  else if(imposable<=2721.56)bonusEmploi=Math.min(pp,Math.max(0,308.33-((imposable-1945.38)*0.3969)));
  bonusEmploi=Math.round(bonusEmploi*100)/100;
  const ppFinal=Math.round(Math.max(0,pp-bonusEmploi)*100)/100;
  const net=Math.round((brutR-onssP-ppFinal-csss)*100)/100;
  const onssE=Math.round(brutR*TX_ONSS_E*100)/100;
  const coutTotal=Math.round((brutR+onssE)*100)/100;
  return{brut:brutR,onssP,imposable,pp:ppFinal,csss,bonusEmploi,baseImp:Math.round(baseImp*100)/100,coutTotal,onssE,net,details:{qe,chDed,ppBrut:Math.round(pp*100)/100,tauxPP:imposable>0?Math.round(ppFinal/imposable*10000)/100:0,tauxNet:brutR>0?Math.round(net/brutR*10000)/100:0}};
}
function calcPeculeDouble(brutAnnuel){
  const base=Math.round(brutAnnuel*PV_DOUBLE*100)/100;
  const onss=Math.round(base*TX_ONSS_W*100)/100;
  const cotSpec=Math.round(base*TX_AT*100)/100;
  const imposable=Math.round((base-onss)*100)/100;
  const pp=Math.round(imposable*0.2315*100)/100;
  const net=Math.round((base-onss-cotSpec-pp)*100)/100;
  return{base,onss,cotSpec,imposable,pp,net};
}
function calcProrata(brut,joursPreste,joursMois){
  const jm=joursMois||22;
  const ratio=Math.min(joursPreste,jm)/jm;
  return Math.round(brut*ratio*100)/100;
}
function calc13eMois(brutMensuel){
  const brut=brutMensuel;
  const onss=Math.round(brut*TX_ONSS_W*100)/100;
  const imposable=Math.round((brut-onss)*100)/100;
  const pp=Math.round(imposable*0.2315*100)/100;
  const net=Math.round((brut-onss-pp)*100)/100;
  return{brut,onss,imposable,pp,net};
}

const CP_PRESETS_GLOBAL={"cp200":{id:"cp200",label:"CP 200 - CPNAE",barMin:2029.88},"cp100":{id:"cp100",label:"CP 100",barMin:RMMMG},"cp110":{id:"cp110",label:"CP 110 - Textile",barMin:RMMMG},"cp124":{id:"cp124",label:"CP 124 - Construction",barMin:2100},"cp140":{id:"cp140",label:"CP 140 - Transport",barMin:2050},"cp149":{id:"cp149",label:"CP 149.01 - Electriciens",barMin:2000},"cp200":{id:"cp200",label:"CP 200 - CPNAE",barMin:2029.88},"cp209":{id:"cp209",label:"CP 209 - Metal",barMin:2100},"cp218":{id:"cp218",label:"CP 218",barMin:2029.88},"cp302":{id:"cp302",label:"CP 302 - Horeca",barMin:RMMMG},"cp330":{id:"cp330",label:"CP 330 - Soins",barMin:2029.88}};


// â”€â”€ SCORE SANTÃ‰ DOSSIER â”€â”€

// â”€â”€ MULTI-CURRENCY CONVERTER â”€â”€

// â”€â”€ INTÃ‰GRATIONS CONNECTEURS â”€â”€

// â”€â”€ WEBHOOK MANAGER â”€â”€

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  SPRINT 8 â€” PRÃ‰DICTIF: BUDGET AUTO + SIMULATEUR + KPI AVANCÃ‰S
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ BUDGET AUTOMATIQUE â”€â”€



// â”€â”€ PLANIFICATEUR DE TÃ‚CHES â”€â”€

// â”€â”€ GESTION DES ABSENCES (PRÃ‰-PAIE) â”€â”€

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  ALERTES LÃ‰GALES â€” Veille juridique et Ã©chÃ©ances
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MODULE: DOCUMENTS JURIDIQUES â€” Phase 0 Fiduciaire Sociale
// Convention de Mandat, DPA RGPD, Registre RGPD, Politique ConfidentialitÃ©
// GÃ©nÃ©ration PDF cÃ´tÃ© client + envoi email en 1 clic
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function MoteurLoisBelges({s,d}){
const ae=s.emps||[];
const [tab,setTab]=useState("dashboard");
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
const fmt=v=>new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
const pct=v=>(v*100).toFixed(2)+'%';

// CatÃ©gories de paramÃ¨tres
const categories=[
{id:'onss',nom:'ONSS / Cotisations',icon:'ðŸ›',color:'#ef4444',params:[
  {k:'onss.travailleur',l:'ONSS travailleur',v:pct(L.onss.travailleur),t:'pct'},
  {k:'onss.employeur.total',l:'ONSS employeur total',v:pct(L.onss.employeur.total),t:'pct'},
  {k:'onss.employeur.detail.pension',l:'  â”” Pension',v:pct(L.onss.employeur.detail.pension),t:'pct'},
  {k:'onss.employeur.detail.maladie',l:'  â”” Maladie-invalidite',v:pct(L.onss.employeur.detail.maladie),t:'pct'},
  {k:'onss.employeur.detail.chomage',l:'  â”” Chomage',v:pct(L.onss.employeur.detail.chomage),t:'pct'},
  {k:'onss.employeur.detail.moderation',l:'  â”” Moderation salariale',v:pct(L.onss.employeur.detail.moderation),t:'pct'},
  {k:'onss.ouvrier108',l:'Majoration ouvriers',v:'x '+L.onss.ouvrier108,t:'num'},
]},
{id:'pp',nom:'Precompte Professionnel',icon:'ðŸ’°',color:'#a855f7',params:[
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
{id:'csss',nom:'CSSS',icon:'ðŸ”’',color:'#f97316',params:[
  {k:'csss.isole.0.max',l:'Seuil exoneration',v:fmt(L.csss.isole[0].max)+' EUR/an',t:'num'},
  {k:'csss.isole.4.montantFixe',l:'Plafond isole',v:fmt(L.csss.isole[4].montantFixe)+' EUR/trim',t:'num'},
]},
{id:'rem',nom:'Remuneration',icon:'ðŸ’¶',color:'#22c55e',params:[
  {k:'rÃ©munÃ©ration.RMMMG.montant18ans',l:'RMMMG (18 ans)',v:fmt(L.rÃ©munÃ©ration.RMMMG.montant18ans)+' EUR/mois',t:'num'},
  {k:'rÃ©munÃ©ration.indexSante.coeff',l:'Coefficient index sante',v:L.rÃ©munÃ©ration.indexSante.coeff,t:'num'},
  {k:'rÃ©munÃ©ration.peculeVacances.simple.pct',l:'Pecule vacances simple',v:pct(L.rÃ©munÃ©ration.peculeVacances.simple.pct),t:'pct'},
  {k:'rÃ©munÃ©ration.peculeVacances.double.pct',l:'Pecule vacances double',v:pct(L.rÃ©munÃ©ration.peculeVacances.double.pct),t:'pct'},
  {k:'chequesRepas.partTravailleur.min',l:'Cheques-repas part travailleur min',v:fmt(L.chequesRepas.partTravailleur.min)+' EUR',t:'num'},
  {k:'chequesRepas.valeurFaciale.max',l:'Cheques-repas valeur faciale max',v:fmt(L.chequesRepas.valeurFaciale.max)+' EUR',t:'num'},
  {k:'fraisPropres.forfaitBureau.max',l:'Forfait bureau/teletravail',v:fmt(L.fraisPropres.forfaitBureau.max)+' EUR/mois',t:'num'},
  {k:'fraisPropres.forfaitDeplacement.voiture',l:'Indemnite km voiture',v:fmt(L.fraisPropres.forfaitDeplacement.voiture)+' EUR/km',t:'num'},
]},
{id:'atn',nom:'ATN / Avantages',icon:'ðŸš—',color:'#3b82f6',params:[
  {k:'atn.voiture.min',l:'ATN voiture minimum',v:fmt(L.atn.voiture.min)+' EUR/an',t:'num'},
  {k:'atn.gsm.forfait',l:'ATN GSM/tablette',v:fmt(L.atn.gsm.forfait)+' EUR/mois',t:'num'},
  {k:'atn.pc.forfait',l:'ATN PC/laptop',v:fmt(L.atn.pc.forfait)+' EUR/mois',t:'num'},
  {k:'atn.internet.forfait',l:'ATN Internet',v:fmt(L.atn.internet.forfait)+' EUR/mois',t:'num'},
  {k:'atn.electricite.cadre',l:'ATN electricite (cadre)',v:fmt(L.atn.electricite.cadre)+' EUR/an',t:'num'},
  {k:'atn.chauffage.cadre',l:'ATN chauffage (cadre)',v:fmt(L.atn.chauffage.cadre)+' EUR/an',t:'num'},
]},
{id:'travail',nom:'Temps de travail',icon:'â°',color:'#eab308',params:[
  {k:'tempsTravail.dureeHebdoLegale',l:'Duree hebdo legale',v:L.tempsTravail.dureeHebdoLegale+'h',t:'num'},
  {k:'tempsTravail.heuresSupp.majoration50',l:'Heures supp (+50%)',v:pct(L.tempsTravail.heuresSupp.majoration50),t:'pct'},
  {k:'tempsTravail.heuresSupp.plafondAnnuel',l:'Plafond heures supp/an',v:L.tempsTravail.heuresSupp.plafondAnnuel+'h',t:'num'},
  {k:'tempsTravail.jourFerie.nombre',l:'Jours fÃ©riÃ©s legaux',v:L.tempsTravail.jourFerie.nombre,t:'num'},
]},
{id:'assur',nom:'Assurances & Seuils',icon:'ðŸ›¡',color:'#06b6d4',params:[
  {k:'assurances.accidentTravail.taux',l:'Assurance accident travail',v:pct(L.assurances.accidentTravail.taux),t:'pct'},
  {k:'assurances.medecineTravail.cout',l:'Medecine du travail',v:fmt(L.assurances.medecineTravail.cout)+' EUR/trav',t:'num'},
  {k:'seuils.electionsSociales.cppt',l:'Seuil elections CPPT',v:L.seuils.electionsSociales.cppt+' travailleurs',t:'num'},
  {k:'seuils.electionsSociales.ce',l:'Seuil elections CE',v:L.seuils.electionsSociales.ce+' travailleurs',t:'num'},
  {k:'seuils.planFormation',l:'Seuil plan formation',v:L.seuils.planFormation+' travailleurs',t:'num'},
]},
];

const totalParams=categories.reduce((a,c)=>a+c.params.length,0);

// VÃ©rification auto
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
<PH title="Moteur Lois Belges" sub={"Base centralisee â€” "+totalParams+" parametres legaux â€” Version "+L._meta.version+" â€” MAJ "+L._meta.dateMAJ}/>

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
    {checking?"â³ Verification en cours...":"ðŸ”„ Verifier les mises a jour"}
  </button>
  <button onClick={resetAll} style={{padding:"10px 20px",borderRadius:8,border:"1px solid rgba(248,113,113,.3)",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,background:"transparent",color:"#f87171"}}>
    â†º Reinitialiser
  </button>
  <button onClick={()=>setEditMode(!editMode)} style={{padding:"10px 20px",borderRadius:8,border:"1px solid rgba(198,163,78,.3)",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,background:editMode?"rgba(198,163,78,.15)":"transparent",color:"#c6a34e"}}>
    {editMode?"âœ“ Terminer":"âœ Mode edition"}
  </button>
</div>

{/* Tabs */}
<div style={{display:"flex",gap:6,marginBottom:16}}>
{[{v:"dashboard",l:"ðŸ“Š Tableau de bord"},{v:"parametres",l:"âš™ Tous les parametres"},{v:"sources",l:"ðŸŒ Sources"},{v:"historique",l:"ðŸ“œ Historique"},{v:"impact",l:"ðŸ“ˆ Impact sur paie"},{v:"export",l:"ðŸ“¤ Export"}].map(t=>
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
      <span style={{color:customLois[p.k]?"#c6a34e":"#e8e6e0"}}>{customLois[p.k]||p.v}{customLois[p.k]&&<span style={{fontSize:8,marginLeft:4,color:"#c6a34e"}}>âœ</span>}</span>}
    </div>
  </div>)}
  </div>
</C>)}
{editMode&&<div style={{textAlign:"center",marginTop:16}}>
  <button onClick={()=>{applyUpdate(editValues);setEditMode(false);setEditValues({});}} style={{padding:"12px 30px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:14,background:"linear-gradient(135deg,#c6a34e,#a8892e)",color:"#000"}}>
    ðŸ’¾ Sauvegarder les modifications ({Object.keys(editValues).length} changes)
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
    <div style={{fontSize:11,color:"#4ade80",fontWeight:600}}>âœ… Backend actif â€” Cron quotidien 06:30 CET</div>
    <div style={{fontSize:9,color:"#5e5c56"}}>{lastCheck?("Dernier scan: "+new Date(lastCheck).toLocaleString("fr-BE")):"Aucun scan effectue"}</div>
  </div>
  <div style={{fontSize:10,color:"#9e9b93",marginTop:4}}>Le service /api/veille-juridique scrape {L.sources.length} sources officielles, detecte les changements AR/CCT, et notifie l administrateur pour validation avant mise Ã  jour.</div>
  {updateHistory.length>0&&updateHistory[0].changes?.length>0&&<div style={{marginTop:6,padding:"6px 8px",background:"rgba(248,113,113,.06)",borderRadius:6}}>
    <div style={{fontSize:10,color:"#f87171",fontWeight:600}}>âš ï¸ {updateHistory[0].changes.length} changement(s) detecte(s):</div>
    {updateHistory[0].changes.slice(0,3).map((c,i)=><div key={i} style={{fontSize:10,color:"#fb923c",marginTop:2}}>{c.label}: {c.current} â†’ {c.detected}</div>)}
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
      <div style={{fontSize:11,color:"#e8e6e0",fontWeight:600}}>{h.action==='UPDATE'?'âœ MAJ manuelle ('+h.changes+' param.)':h.status==='A_JOUR'?'âœ“ Verification OK â€” Aucun changement':h.status==='CHANGEMENTS'?'âš  '+((h.changes||[]).length)+' changement(s) detecte(s)':h.status==='ERREUR'?'âŒ Erreur: '+(h.error||'inconnue'):'âš  A verifier'}</div>
      <span style={{fontSize:9,color:"#5e5c56"}}>{h.trigger==='manual'?'Manuel':'Auto'}{h.duration?' â€” '+h.duration:''}</span>
    </div>
    <div style={{fontSize:10,color:"#5e5c56"}}>{new Date(h.date).toLocaleString('fr-BE')}{h.version?' â€” v'+h.version:''}{h.summary?.sourcesReachable?' â€” '+h.summary.sourcesReachable+'/'+h.summary.sourcesChecked+' sources':''}</div>
    {h.changes?.length>0&&<div style={{marginTop:4}}>{h.changes.map((c,j)=><div key={j} style={{fontSize:10,color:"#f87171",padding:"2px 0"}}>â†³ {c.label}: <b>{c.current}</b> â†’ <b style={{color:"#fb923c"}}>{c.detected}</b> ({c.severity})</div>)}</div>}
    {h.alerts?.length>0&&<div style={{marginTop:2}}>{h.alerts.slice(0,2).map((a,j)=><div key={j} style={{fontSize:10,color:"#60a5fa",padding:"1px 0"}}>â„¹ {a.text?.substring(0,100)}</div>)}</div>}
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
      {r:"PrÃ©compte professionnel",montant:"- "+fmt(pp)+" EUR",c:"#f87171",source:"AR Annexe III - Formule-cle SPF"},
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
    <div style={{fontSize:24}}>ðŸ“‹</div><div style={{fontWeight:600,fontSize:12,marginTop:6}}>JSON complet</div><div style={{fontSize:10,color:"#9e9b93"}}>Toute la base legale</div>
  </button>
  <button onClick={()=>{let csv='Categorie;Parametre;Valeur;Type\n';categories.forEach(cat=>cat.params.forEach(p=>{csv+=cat.nom+';'+p.l+';'+p.v+';'+p.t+'\n';}));const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='parametres_legaux_'+L._meta.annee+'.csv';a.click();}} style={{padding:16,borderRadius:10,border:"1px solid rgba(198,163,78,.2)",cursor:"pointer",fontFamily:"inherit",background:"rgba(198,163,78,.04)",color:"#c6a34e",textAlign:"center"}}>
    <div style={{fontSize:24}}>ðŸ“Š</div><div style={{fontWeight:600,fontSize:12,marginTop:6}}>CSV parametres</div><div style={{fontSize:10,color:"#9e9b93"}}>Pour Excel/Sheets</div>
  </button>
  <button onClick={()=>{const txt='LOIS BELGES '+L._meta.annee+'\nVersion: '+L._meta.version+'\n'+'='.repeat(50)+'\n\n'+categories.map(cat=>cat.icon+' '+cat.nom.toUpperCase()+'\n'+'-'.repeat(40)+'\n'+cat.params.map(p=>'  '+p.l+': '+p.v).join('\n')+'\n').join('\n');const escaped=(txt||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>\n');const html='<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>RÃ©sumÃ© lois '+L._meta.annee+'</title><style>body{font-family:system-ui,sans-serif;font-size:12px;padding:24px;max-width:800px;margin:0 auto;line-height:1.5;color:#1a1a1a}</style></head><body><div>'+escaped+'</div><p style="margin-top:20px;font-size:10px;color:#666">Document gÃ©nÃ©rÃ© par Aureus Social Pro</p></body></html>';openForPDF(html,'Resume_lois_'+L._meta.annee);}} style={{padding:16,borderRadius:10,border:"1px solid rgba(198,163,78,.2)",cursor:"pointer",fontFamily:"inherit",background:"rgba(198,163,78,.04)",color:"#c6a34e",textAlign:"center"}}>
    <div style={{fontSize:24}}>ðŸ“„</div><div style={{fontWeight:600,fontSize:12,marginTop:6}}>RÃ©sumÃ© PDF</div><div style={{fontSize:10,color:"#9e9b93"}}>Imprimer / Enregistrer en PDF</div>
  </button>
</div>
<div style={{marginTop:16,padding:16,background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.12)"}}>
  <div style={{fontSize:12,color:"#c6a34e",fontWeight:700,marginBottom:10}}>ðŸ“¥ Import / MAJ en 1 clic</div>

  {/* STEP 1: Upload zone */}
  {(importState.step==='idle'||importState.step==='error'||importState.step==='applied')&&<div>
    <div
      onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor='#c6a34e';}}
      onDragLeave={e=>{e.currentTarget.style.borderColor='rgba(198,163,78,.2)';}}
      onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor='rgba(198,163,78,.2)';const f=e.dataTransfer.files[0];if(f&&f.name.endsWith('.json'))handleJsonImport(f);}}
      style={{border:"2px dashed rgba(198,163,78,.2)",borderRadius:8,padding:"20px",textAlign:"center",cursor:"pointer",transition:"border-color .2s"}}
      onClick={()=>{const inp=document.createElement('input');inp.type='file';inp.accept='.json';inp.onchange=e=>{const f=e.target.files[0];if(f)handleJsonImport(f);};inp.click();}}
    >
      <div style={{fontSize:28}}>ðŸ“‹</div>
      <div style={{fontSize:11,color:"#c6a34e",fontWeight:600,marginTop:6}}>Glissez un fichier JSON ici</div>
      <div style={{fontSize:10,color:"#5e5c56",marginTop:2}}>ou cliquez pour parcourir â€” Format: {"{\"onss.travailleur\": 0.1307, ...}"}</div>
    </div>
    {importState.step==='error'&&<div style={{marginTop:8,padding:8,background:"rgba(248,113,113,.06)",borderRadius:6}}>
      <div style={{fontSize:10,color:"#f87171"}}>{importState.validation?.errors?.join(', ')||'Erreur inconnue'}</div>
    </div>}
    {importState.step==='applied'&&<div style={{marginTop:8,padding:8,background:"rgba(74,222,128,.06)",borderRadius:6}}>
      <div style={{fontSize:10,color:"#4ade80",fontWeight:600}}>âœ… {importState.appliedCount} parametre(s) applique(s) avec succes!</div>
    </div>}
  </div>}

  {/* STEP 2: Validation preview */}
  {(importState.step==='validating'||importState.step==='validated')&&importState.validation&&<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <div style={{fontSize:11,fontWeight:600,color:importState.validation.valid?"#4ade80":"#f87171"}}>
        {importState.validation.valid?"âœ… Validation OK â€” "+importState.validation.count+" parametre(s)":"âŒ Erreurs de validation"}
      </div>
      <button onClick={()=>setImportState({step:'idle',data:null,validation:null,uploading:false,history:[]})} style={{fontSize:10,padding:"4px 10px",borderRadius:4,border:"1px solid rgba(248,113,113,.3)",background:"transparent",color:"#f87171",cursor:"pointer",fontFamily:"inherit"}}>âœ• Annuler</button>
    </div>
    {importState.validation.errors?.length>0&&<div style={{marginBottom:8}}>{importState.validation.errors.map((e,i)=><div key={i} style={{fontSize:10,color:"#f87171",padding:"2px 0"}}>âŒ {e}</div>)}</div>}
    {importState.validation.warnings?.length>0&&<div style={{marginBottom:8}}>{importState.validation.warnings.map((w,i)=><div key={i} style={{fontSize:10,color:"#fb923c",padding:"2px 0"}}>âš  {w}</div>)}</div>}
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
          {importState.uploading?"â³ Envoi vers Supabase...":"ðŸ“¤ Stocker dans Supabase (en attente)"}
        </button>
        <button onClick={()=>{applyUpdate(importState.validation.validated);setImportState(p=>({...p,step:'applied',appliedCount:importState.validation.count}));}} style={{flex:1,padding:"10px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff"}}>
          âš¡ Appliquer directement
        </button>
      </div>
    </div>}
  </div>}

  {/* STEP 3: Uploaded to Supabase */}
  {importState.step==='uploaded'&&<div>
    <div style={{padding:12,background:"rgba(96,165,250,.06)",borderRadius:6,marginBottom:8}}>
      <div style={{fontSize:11,color:"#60a5fa",fontWeight:600}}>ðŸ“¦ Stocke dans Supabase â€” ID: {importState.uploadId?.substring(0,8)}...</div>
      <div style={{fontSize:10,color:"#9e9b93",marginTop:4}}>Statut: En attente d approbation admin</div>
    </div>
    <div style={{display:"flex",gap:8}}>
      <button onClick={()=>handleApproveAndApply(importState.uploadId)} style={{flex:1,padding:"10px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,background:"linear-gradient(135deg,#c6a34e,#a8892e)",color:"#000"}}>
        âœ… Approuver et appliquer
      </button>
      <button onClick={()=>setImportState({step:'idle',data:null,validation:null,uploading:false,history:[]})} style={{padding:"10px 16px",borderRadius:8,border:"1px solid rgba(248,113,113,.3)",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,background:"transparent",color:"#f87171"}}>
        âœ• Rejeter
      </button>
    </div>
  </div>}

  {/* Migration needed */}
  {importState.step==='migration_needed'&&<div style={{padding:12,background:"rgba(251,146,56,.06)",borderRadius:6}}>
    <div style={{fontSize:11,color:"#fb923c",fontWeight:600}}>âš  Table Supabase manquante</div>
    <div style={{fontSize:10,color:"#9e9b93",marginTop:4}}>Executez ce SQL dans Supabase Dashboard â†’ SQL Editor:</div>
    <pre style={{fontSize:9,color:"#60a5fa",background:"rgba(0,0,0,.3)",padding:8,borderRadius:4,marginTop:6,overflowX:"auto",maxHeight:120}}>{importState.migration}</pre>
    <button onClick={()=>setImportState({step:'idle',data:null,validation:null,uploading:false,history:[]})} style={{marginTop:8,padding:"6px 12px",borderRadius:4,border:"1px solid rgba(198,163,78,.3)",cursor:"pointer",fontFamily:"inherit",fontSize:10,background:"transparent",color:"#c6a34e"}}>
      OK, fait â†’ Reessayer
    </button>
  </div>}

  {/* Supabase history */}
  <div style={{marginTop:12,borderTop:"1px solid rgba(255,255,255,.05)",paddingTop:10}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:10,color:"#5e5c56",fontWeight:600}}>Historique Supabase</div>
      <button onClick={loadSupabaseHistory} style={{fontSize:9,padding:"3px 8px",borderRadius:4,border:"1px solid rgba(198,163,78,.2)",background:"transparent",color:"#c6a34e",cursor:"pointer",fontFamily:"inherit"}}>ðŸ”„ Charger</button>
    </div>
    {importState.history?.length>0&&<div style={{marginTop:6,maxHeight:120,overflowY:"auto"}}>{importState.history.map((h,i)=>
      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.02)"}}>
        <div>
          <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,marginRight:4,background:h.status==='applied'?"rgba(74,222,128,.1)":h.status==='pending'?"rgba(96,165,250,.1)":h.status==='approved'?"rgba(198,163,78,.1)":"rgba(248,113,113,.1)",color:h.status==='applied'?"#4ade80":h.status==='pending'?"#60a5fa":h.status==='approved'?"#c6a34e":"#f87171"}}>{h.status}</span>
          <span style={{fontSize:10,color:"#9e9b93"}}>{h.changes_count} params â€” v{h.version} â€” {new Date(h.created_at).toLocaleDateString('fr-BE')}</span>
        </div>
        {h.status==='applied'&&<button onClick={()=>handleRollback(h.id)} style={{fontSize:9,padding:"2px 6px",borderRadius:3,border:"1px solid rgba(248,113,113,.2)",background:"transparent",color:"#f87171",cursor:"pointer",fontFamily:"inherit"}}>â†© Rollback</button>}
        {h.status==='approved'&&<button onClick={()=>handleApproveAndApply(h.id)} style={{fontSize:9,padding:"2px 6px",borderRadius:3,border:"1px solid rgba(74,222,128,.2)",background:"transparent",color:"#4ade80",cursor:"pointer",fontFamily:"inherit"}}>â–¶ Appliquer</button>}
        {h.status==='pending'&&<button onClick={()=>handleApproveAndApply(h.id)} style={{fontSize:9,padding:"2px 6px",borderRadius:3,border:"1px solid rgba(198,163,78,.2)",background:"transparent",color:"#c6a34e",cursor:"pointer",fontFamily:"inherit"}}>âœ… Approuver</button>}
      </div>
    )}</div>}
  </div>
</div>
</C>}

</div>;
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  AUREUS SUITE â€” Nos logiciels
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•






// ??? EXPOSE FUNCTIONS ON WINDOW FOR CROSS-MODULE ACCESS ???
if(typeof window!=="undefined"){window.aureusDocHTML=aureusDocHTML;window.aureuspdf=aureuspdf;window.openForPDF=openForPDF;window.generateAttestationEmploi=generateAttestationEmploi;window.generateAttestationSalaire=generateAttestationSalaire;window.generateSoldeCompte=generateSoldeCompte;window.generateC4PDF=generateC4PDF;window.generatePayslipPDF=generatePayslipPDF;window.previewHTML=previewHTML;}


export { Dashboard, Employees, Payslips, DimonaPage, DMFAPage, AdminDashboard, BelcotaxPage, PrecomptePage, DocsPage, ReportsPage, SettingsPage, SubNav, SalairesPage, AvantagesPage, ContratsMenuPage, RHPage, SocialPage, ReportingPage, LegalPage, ModulesProPage, MoteurLoisBelges };

