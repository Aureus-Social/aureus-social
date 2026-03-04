const AUREUS_INFO={name:"Aureus IA SPRL",vat:"BE 1028.230.781",addr:"Saint-Gilles, Bruxelles",email:"info@aureus-ia.com",version:"v38",sprint:"Sprint 17 — Automatisation 100%"};
'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LOIS_BELGES, LB, RMMMG, TX_ONSS_W, TX_ONSS_E, NET_FACTOR, PV_DOUBLE, PV_SIMPLE, PP_EST, obf, SAISIE_2026_TRAVAIL, SAISIE_2026_REMPLACEMENT, SAISIE_IMMUN_ENFANT_2026, quickNetEst } from '@/app/lib/lois-belges';
// ═══ AUREUS SOCIAL PRO — Pages Inline ═══
// Composants pages extraits du monolithe
// Dépendent de {s, d} (state, dispatch) du composant principal

// Helpers UI (identiques au monolithe)

// ═══ Stubs pour fonctions PDF définies dans le monolithe (accès via window) ═══
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
// ═══ Constantes manquantes depuis monolithe ═══
const DPER={month:new Date().getMonth()+1,year:new Date().getFullYear(),days:22,sickG:0,holidays:0,overtimeH:0,sundayH:0,nightH:0,bonus:0,y13:0,otherDed:0,advance:0,garnish:0,ppVolontaire:0,
  // Éléments fiscaux complets
  doublePecule:0,         // Double pécule vacances (si payé par employeur — employés)
  peculeDepart:0,         // Pécule de vacances de départ (sortie de service)
  primeAnciennete:0,      // Prime d'ancienneté (exo ONSS+IPP si ≤ plafond)
  primeNaissance:0,       // Prime de naissance/mariage (exo ONSS si ≤ plafond)
  primeInnovation:0,      // Prime d'innovation (Art. 38 §1er 25° CIR — exo IPP max 1 mois)
  indemTeletravail:0,     // Indemnité forfaitaire télétravail (max 154,74€/mois 2026)
  indemBureau:0,          // Indemnité frais de bureau (si pas forfaitaire)
  pensionCompl:0,         // Retenue personnelle pension complémentaire (2è pilier — assur. groupe)
  retSyndicale:0,         // Retenue cotisation syndicale
  saisieAlim:0,           // Pension alimentaire (saisie prioritaire)
  heuresSupFisc:0,        // Heures sup ouvrant droit à réduction PP (max 180h/an — Art.154bis CIR — 2026)
  // Heures sup volontaires brut=net (nouveau régime 01/04/2026)
  hsVolontBrutNet:0,      // HS volontaires brut=net (max 240h/an — 360h horeca) — exo ONSS + PP + sursalaire
  hsRelance:0,            // HS relance transitoire T1/2026 (max 120h) — brut=net aussi
  typeSpecial:"normal",   // normal, doublePecule, y13, depart, preavis
  // Activation ONEM
  allocTravail:0,         // Allocation de travail ONEM (Activa/Impulsion — déduit du net par l'employeur)
  allocTravailType:'none', // none, activa_bxl, activa_jeune, impulsion_wal, impulsion55, vdab
  // Mi-temps médical / Reprise progressive
  miTempsMed:false,       // Reprise partielle du travail (Art. 100§2 Loi coord. 14/07/1994)
  miTempsHeures:0,        // Heures/semaine prestées chez employeur (ex: 19h sur 38h)
  miTempsINAMI:0,         // Complément INAMI perçu par le travailleur (indemnités mutuelle)
};
var TX_AT=LB.assurances.accidentTravail.taux;
var COUT_MED=LB.assurances.medecineTravail.cout;



const fmt=n=>new Intl.NumberFormat('fr-BE',{style:'currency',currency:'EUR'}).format(n||0);
const fmtP=n=>`${((n||0)*100).toFixed(2)}%`;
const uid=()=>`${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
const MN_FR=['Janvier',"Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MN_NL=['Januari',"Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"];
let MN=MN_FR;

// Composants UI de base
function PH({title,sub}){return <div style={{marginBottom:16}}><div style={{fontSize:18,fontWeight:800,color:'#c6a34e',letterSpacing:'.3px'}}>{title}</div>{sub&&<div style={{fontSize:11,color:'#9e9b93',marginTop:2}}>{sub}</div>}</div>;}
function C({children,style}){return <div style={{padding:'16px 20px',background:'rgba(198,163,78,.03)',borderRadius:12,border:'1px solid rgba(198,163,78,.06)',marginBottom:14,...style}}>{children}</div>;}
function ST({children}){return <div style={{fontSize:13,fontWeight:700,color:'#c6a34e',marginBottom:10,paddingBottom:6,borderBottom:'1px solid rgba(198,163,78,.1)'}}>{children}</div>;}

// quickPP — estimation précompte professionnel
const quickPP = (brut) => {
  const imposable = brut - brut * TX_ONSS_W;
  if (imposable <= 1110) return 0;
  if (imposable <= 1560) return Math.round((imposable - 1110) * 0.2668 * 100) / 100;
  if (imposable <= 2700) return Math.round((120.06 + (imposable - 1560) * 0.4280) * 100) / 100;
  return Math.round((607.98 + (imposable - 2700) * 0.4816) * 100) / 100;
};

// aureuspdf — génération PDF (utilise jsPDF depuis CDN)
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
    alert('PDF en cours de chargement, réessayez...');
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
        <button onClick={()=>{if(confirm('Générer toutes les fiches de paie ?')){(s.emps||[]).forEach(e=>generatePayslipPDF(e,s.co));addToast(s.emps.length+' fiches de paie générées')}}} style={{padding:'7px 14px',borderRadius:8,border:'none',background:'rgba(198,163,78,.15)',color:'#c6a34e',fontSize:11,cursor:'pointer',fontWeight:600}}>📄 Fiches</button>
        <button onClick={()=>{if(confirm('Générer SEPA ?')){generateSEPAXML(s.emps||[],s.co);addToast('Fichier SEPA pain.001 généré')}}} style={{padding:'7px 14px',borderRadius:8,border:'none',background:'rgba(34,197,94,.12)',color:'#22c55e',fontSize:11,cursor:'pointer',fontWeight:600}}>💸 SEPA</button>
        <button onClick={()=>{if(confirm('Générer DmfA ?')){generateDmfAXML(s.emps||[],Math.ceil((new Date().getMonth()+1)/3),new Date().getFullYear(),s.co);addToast('DmfA trimestrielle générée')}}} style={{padding:'7px 14px',borderRadius:8,border:'none',background:'rgba(168,85,247,.12)',color:'#a855f7',fontSize:11,cursor:'pointer',fontWeight:600}}>📊 DmfA</button>
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
        {label:"Déclarations",value:`${s.pays.length}`,sub:`${s.dims.length} Dimona · ${s.dmfas.length} DmfA`,color:'#fb923c',icon:'◇'},
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
function Employees({s,d}) {
  const [form,setF]=useState(null);
  const [ed,setEd]=useState(false);
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all'); // all, active, sorti, student, ouvrier
  const [viewMode,setViewMode]=useState('list'); // list, grid
  const empty={first:'',last:'',niss:'',birth:'',addr:'',city:'',zip:'',startD:'',endD:'',fn:"",dept:'',contract:'CDI',regime:'full',whWeek:38,monthlySalary:0,civil:"single",depChildren:0,handiChildren:0,iban:'',mvT:10,mvW:CR_TRAV,mvE:8.91,expense:0,cp:'200',dmfaCode:'495',dimType:'OTH',commDist:0,commType:'none',commMonth:0,status:'active',sexe:'M',statut:'employe',niveauEtude:'sec',allocTravailType:'none',allocTravail:0,carFuel:"none",carCO2:0,carCatVal:0,carBrand:"",carModel:"",atnGSM:false,atnPC:false,atnInternet:false,atnLogement:false,atnLogementRC:0,atnChauffage:false,atnElec:false,depAscendant:0,depAscendantHandi:0,conjointHandicap:false,depAutres:0,anciennete:0,nrEngagement:0,engagementTrimestre:1,
    veloSociete:false,veloType:'none',veloValeur:0,veloLeasingMois:0,carteCarburant:false,carteCarburantMois:0,borneRecharge:false,borneRechargeCoût:0,
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
    const dupLocal=(s.emps||[]).find(e=>e.niss&&e.niss.replace(/[\s.\-]/g,'')===clean&&e.id!==currentId);
    if(dupLocal)return{level:'error',msg:`⛔ NISS déjà utilisé dans ce dossier: ${dupLocal.first} ${dupLocal.last}`};
    // Level 2: Platform-wide (check all clients)
    const allClients=s.clients||[];
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
    const headers=['Prénom',"Nom","NISS","Fonction","Département","Contrat","CP","Brut","Statut","Entrée","IBAN"];
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
    <PH title="Gestion des Employés" sub={`${(s.emps||[]).length} employé(s)`} actions={<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
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
          {id:"all",l:`Tous (${(s.emps||[]).length})`},
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
function Payslips({s,d}) {
  const [eid,setEid]=useState(s.selectedEmpIdForPayslip||(s.emps||[])[0]?.id||'');
  const [per,setPer]=useState({...DPER});
  const [res,setRes]=useState(null);
  const [batchMode,setBatchMode]=useState(false);
  const [batchResults,setBatchResults]=useState([]);
  const [batchRunning,setBatchRunning]=useState(false);
  const emp=(s.emps||[]).find(e=>e.id===eid);
  // Préremplir Activation ONEM depuis la fiche employé quand on change d'employé
  useEffect(()=>{
    if(emp&&(emp.allocTravailType||'none')!=='none')
      setPer(prev=>({...prev,allocTravailType:emp.allocTravailType||prev.allocTravailType,allocTravail:emp.allocTravail||prev.allocTravail||0}));
  },[eid]);

  // ── BATCH PROCESSING ──
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
      <button onClick={()=>{if(confirm('Générer les fiches de paie pour tous les employés ?')){(s.emps||[]).forEach(e=>generatePayslipPDF(e,s.co));alert('✅ Fiches générées')}}} style={{padding:'6px 14px',borderRadius:8,border:'none',background:'#c6a34e',color:'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>⚡ Générer tout</button>
    </div>
    {/* Batch Mode */}
    {batchMode&&<C style={{marginBottom:18,border:'1px solid rgba(198,163,78,.25)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <div style={{fontSize:15,fontWeight:600,color:'#c6a34e'}}>⚡ Batch Processing — Calcul en masse</div>
          <div style={{fontSize:11,color:'#5e5c56',marginTop:2}}>Calcule toutes les fiches de paie des travailleurs actifs en 1 clic</div>
        </div>
        <B onClick={runBatch} disabled={batchRunning} style={{fontSize:13,padding:'12px 24px'}}>
          {batchRunning?'⏳ Calcul en cours...':'⚡ Lancer le batch ('+(s.emps||[]).filter(e=>e.status==='active'||!e.status).length+' fiches)'}
        </B>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
        <I label="Mois" value={per.month} onChange={v=>setPer({...per,month:parseInt(v)})} options={MN.map((m,i)=>({v:i+1,l:m}))}/>
        <I label="Année" type="number" value={per.year} onChange={v=>setPer({...per,year:v})}/>
        <div style={{padding:12,background:'rgba(198,163,78,.06)',borderRadius:8,textAlign:'center'}}>
          <div style={{fontSize:10,color:'#9e9b93'}}>Travailleurs actifs</div>
          <div style={{fontSize:22,fontWeight:700,color:'#c6a34e'}}>{(s.emps||[]).filter(e=>e.status==='active'||!e.status).length}</div>
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
          <I label="Employé" value={eid} onChange={setEid} options={(s.emps||[]).map(e=>({v:e.id,l:`${e.first||e.fn||'Emp'} ${e.last||''}`}))} span={2}/>
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
        <div className="no-print" style={{marginTop:18,paddingTop:14,borderTop:'1px solid #e0dfda'}}>
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
        <div className="no-print" style={{marginTop:18,padding:14,background:"#f0efea",borderRadius:8}}>
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

        {/* BOUTON PDF uniquement — plus de téléchargement HTML/txt */}
        <div style={{marginTop:14,display:'flex',gap:10,justifyContent:'center'}} className="no-print">
          <button onClick={()=>{
            generatePayslipPDF(emp,res,per,s.co)}} style={{padding:'12px 28px',background:"#c6a34e",color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',letterSpacing:'.5px'}}>🖨 Imprimer / PDF</button>
        </div>
      </div>}
    </div>
    {s.pays.length>0&&<C className="no-print" style={{marginTop:20,padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Historique ({s.pays.length} fiches)</div>
        <div style={{display:'flex',gap:8}}>
          {s.pays.some(p=>(!p.gross||p.gross===0)&&(!p.ename||p.ename==='undefined undefined'))&&<button onClick={()=>{if(confirm('Supprimer toutes les fiches en erreur (undefined / 0€) ?')){const badIds=s.pays.filter(p=>(!p.gross||p.gross===0)&&(!p.ename||p.ename==='undefined undefined')).map(p=>p.id);d({type:'DEL_PAYS_BATCH',ids:badIds})}}} style={{padding:'6px 12px',background:'#7f1d1d',color:'#fca5a5',border:'1px solid #991b1b',borderRadius:6,fontSize:11,fontWeight:600,cursor:'pointer'}}>🗑 Supprimer les fiches en erreur ({s.pays.filter(p=>(!p.gross||p.gross===0)&&(!p.ename||p.ename==='undefined undefined')).length})</button>}
          {s.pays.length>0&&<button onClick={()=>{if(confirm('⚠ Supprimer TOUTES les fiches de paie ? Cette action est irréversible.')){d({type:'SET_PAYS',data:[]})}}} style={{padding:'6px 12px',background:'#1e293b',color:'#94a3b8',border:'1px solid #334155',borderRadius:6,fontSize:11,fontWeight:500,cursor:'pointer'}}>Tout effacer</button>}
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
function DimonaPage({s,d}) {
  const [f,setF]=useState({eid:(s.emps||[])[0]?.id||'',action:"IN",wtype:"OTH",start:new Date().toISOString().split('T')[0],end:"",hours:'',reason:'',dimonaP:'',planHrs:''});
  const [tab,setTab]=useState('new');
  const [filter,setFilter]=useState('all');
  const emp=(s.emps||[]).find(e=>e.id===f.eid);

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
  const statsIN=s.dims.filter(x=>x.action==='IN').length;
  const statsOUT=s.dims.filter(x=>x.action==='OUT').length;
  const statsUPD=s.dims.filter(x=>x.action==='UPDATE').length;
  const filtered=filter==='all'?s.dims:s.dims.filter(x=>x.action===filter);

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
    <div style={{marginBottom:14,padding:"10px 14px",background:"linear-gradient(135deg,rgba(59,130,246,.06),rgba(59,130,246,.02))",border:"1px solid rgba(59,130,246,.1)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontSize:11,color:"#888"}}>⚡ Dimona automatique à chaque embauche/sortie</div><button onClick={()=>{if(confirm("Générer Dimona IN pour tous ?")){(s.emps||[]).forEach(e=>generateDimonaXML(e,"IN",s.co));alert("✅ Dimona générées")}}} style={{padding:"6px 14px",borderRadius:8,border:"none",background:"#3b82f6",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:600}}>⚡ Générer tout</button></div><div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{s.emps.filter(e=>e.status==="active"||!e.status).map(e=><div key={e.id} style={{display:"flex",gap:4}}><button onClick={()=>generateDimonaXML(e,"IN",s.co)} style={{padding:"6px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:"rgba(74,222,128,.15)",color:"#4ade80"}}>IN {e.first||e.fn} {e.last||e.ln}</button><button onClick={()=>generateDimonaXML(e,"OUT",s.co)} style={{padding:"6px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,background:"rgba(248,113,113,.15)",color:"#f87171"}}>OUT {e.first||e.fn} {e.last||e.ln}</button></div>)}</div>
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
      {[{v:"new",l:"Nouvelle déclaration"},{v:"history",l:"Historique"},{v:"rules",l:"Règles & Délais"}].map(t=>
        <button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',
          background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>
      )}
    </div>

    {tab==='new'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <C><ST>Déclaration Dimona</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          <I label="Travailleur" value={f.eid} onChange={v=>setF({...f,eid:v})} span={2} options={(s.emps||[]).map(e=>({v:e.id,l:`${e.first||e.fn||'Emp'} ${e.last||''} ${e.niss?'':'⚠ NISS!'}`}))}/>
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

  // Calendrier ONSS 2026 — provisions mensuelles (le 5) + solde trimestriel
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
      <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 6px',fontFamily:"'Cormorant Garamond',serif"}}>DMFA T{q}/{y} — Envoi simulé</h2>
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:"rgba(74,222,128,.1)",color:'#4ade80',fontWeight:600}}>✓ ACRF positif</span>
        <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:anomalies.length>0?'rgba(198,163,78,.1)':'rgba(74,222,128,.1)',color:anomalies.length>0?'#c6a34e':'#4ade80',fontWeight:600}}>{anomalies.length>0?`⚠ ${anomalies.length} anomalie(s)`:'✓ Acceptée sans anomalie'}</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
        <div style={{padding:10,background:"rgba(198,163,78,.05)",borderRadius:6,fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          <div style={{fontWeight:600,color:'#c6a34e',marginBottom:4}}>Identifiants</div>
          <div>Référence: <b style={{color:'#e8e6e0',fontFamily:'monospace'}}>{ref}</b></div>
          <div>Ticket ONSS: <b style={{color:'#4ade80',fontFamily:'monospace'}}>{acrf.ticket}</b></div>
          <div>Trimestre: <b style={{color:'#e8e6e0'}}>T{q}/{y}</b></div>
          <div>Travailleurs: <b style={{color:'#e8e6e0'}}>{ae.length}</b></div>
          <div>Total cotisations: <b style={{color:'#c6a34e'}}>{fmt(totAll)}</b></div>
        </div>
        <div style={{padding:10,background:"rgba(96,165,250,.05)",borderRadius:6,fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          <div style={{fontWeight:600,color:'#60a5fa',marginBottom:4}}>Flux ONSS</div>
          <div>1. <span style={{color:'#4ade80'}}>✓</span> Envoi XML DmfAOriginal</div>
          <div>2. <span style={{color:'#4ade80'}}>✓</span> Accusé de réception (ACRF) positif</div>
          <div>3. <span style={{color:'#4ade80'}}>✓</span> Notification (DMNO) — acceptée</div>
          <div>4. <span style={{color:'#60a5fa'}}>→</span> PID reçu (identifiants permanents)</div>
          <div>5. <span style={{color:'#5e5c56'}}>○</span> Éventuelle notification de modification</div>
        </div>
      </div>
      {anomalies.length>0&&<div style={{padding:10,background:"rgba(248,113,113,.05)",borderRadius:6,marginBottom:14,border:'1px solid rgba(248,113,113,.1)'}}>
        <div style={{fontSize:11,fontWeight:600,color:'#f87171',marginBottom:6}}>Anomalies détectées</div>
        {anomalies.map((a,i)=><div key={i} style={{fontSize:11,color:'#9e9b93',padding:'3px 0'}}>• <b style={{color:'#f87171'}}>{a.zone}</b>: {a.desc}</div>)}
      </div>}
      <pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:9.5,color:'#9e9b93',overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:350,overflowY:'auto'}}>{xml}</pre>
      <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}>
        <B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B>
        <B v="outline" onClick={()=>{navigator.clipboard?.writeText(acrf.xml);alert('ACRF copié !')}}>Copier ACRF</B>
        <B onClick={()=>{navigator.clipboard?.writeText(xml);alert('XML DMFA copié !')}}>Copier XML</B>
      </div>
    </div>}});
  };
  return <div>
    <PH title="Déclaration DMFA" sub="Trimestrielle — ONSS"/>
    <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:18}}>
      <div>
      <C><ST>Période</ST>
        <I label="Trimestre" value={q} onChange={v=>setQ(parseInt(v))} options={[{v:1,l:"T1 (Jan-Mar)"},{v:2,l:"T2 (Avr-Jun)"},{v:3,l:"T3 (Jul-Sep)"},{v:4,l:"T4 (Oct-Déc)"}]}/>
        <I label="Année" type="number" value={y} onChange={v=>setY(v)} style={{marginTop:9}}/>
        <I label="Vue" value={view} onChange={setView} style={{marginTop:9}} options={[{v:"detail",l:"Détail par travailleur"},{v:"ventil",l:"Ventilation cotisations"},{v:"calendar",l:"Calendrier ONSS"}]}/>
        <B onClick={gen} style={{width:'100%',marginTop:14}}>Générer DMFA T{q}/{y}</B>
        {ticket&&<div style={{marginTop:12,padding:10,background:"rgba(74,222,128,.05)",borderRadius:8,border:'1px solid rgba(74,222,128,.15)'}}>
          <div style={{fontSize:11,fontWeight:600,color:'#4ade80',marginBottom:6}}>✓ Dernier envoi</div>
          <div style={{fontSize:10.5,color:'#9e9b93',lineHeight:2}}>
            <div>Ticket: <b style={{color:'#4ade80',fontFamily:'monospace',fontSize:9.5}}>{ticket.ticket}</b></div>
            <div>Réf: <b style={{color:'#e8e6e0',fontFamily:'monospace',fontSize:9.5}}>{ticket.ref}</b></div>
            <div>Anomalies: <b style={{color:ticket.anomalies.length>0?'#f87171':'#4ade80'}}>{ticket.anomalies.length>0?ticket.anomalies.length+' ⚠':'Aucune ✓'}</b></div>
          </div>
          <div style={{display:'flex',gap:6,marginTop:6}}>
            <B v="ghost" style={{padding:'3px 8px',fontSize:9.5}} onClick={()=>d({type:"MODAL",m:{w:700,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>Accusé de réception (ACRF)</h3><pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:12,fontSize:9.5,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:300,overflowY:'auto'}}>{ticket.acrfXml}</pre><B v="outline" onClick={()=>d({type:"MODAL",m:null})} style={{marginTop:10}}>Fermer</B></div>}})}>ACRF</B>
            <B v="ghost" style={{padding:'3px 8px',fontSize:9.5}} onClick={()=>d({type:"MODAL",m:{w:700,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>Notification (DMNO)</h3><pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:12,fontSize:9.5,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:300,overflowY:'auto'}}>{ticket.notifXml}</pre><B v="outline" onClick={()=>d({type:"MODAL",m:null})} style={{marginTop:10}}>Fermer</B></div>}})}>DMNO</B>
            <B v="ghost" style={{padding:'3px 8px',fontSize:9.5}} onClick={()=>d({type:"MODAL",m:{w:900,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>XML DmfAOriginal complet</h3><pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:12,fontSize:9,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:400,overflowY:'auto'}}>{ticket.xml}</pre><B v="outline" onClick={()=>d({type:"MODAL",m:null})} style={{marginTop:10}}>Fermer</B></div>}})}>XML</B>
          </div>
        </div>}
        <div style={{marginTop:18,padding:12,background:"rgba(198,163,78,.05)",borderRadius:8,border:'1px solid rgba(198,163,78,.1)'}}>
          <div style={{fontSize:11.5,fontWeight:600,color:'#c6a34e',marginBottom:6}}>Récapitulatif T{q}/{y}</div>
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
          <b>Ouvriers:</b> base = brut × 108%<br/>
          <b>Marchand:</b> 25% | <b>Non-marchand:</b> 32,40%
        </div>
      </C>
      </div>
      <C style={{padding:0,overflow:'hidden'}}>
        {view==='detail'&&<><div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Détail T{q}/{y}</div></div>
        <Tbl cols={[
          {k:'n',l:"Travailleur",r:r=><span style={{fontWeight:500}}>{r.e.first} {r.e.last}</span>},
          {k:'st',l:"Statut",r:r=><span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:r.isOuv?'rgba(248,113,113,.1)':'rgba(96,165,250,.1)',color:r.isOuv?'#f87171':'#60a5fa'}}>{r.isOuv?'Ouvrier':'Employé'}</span>},
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
            {l:"Cotisation chômage temporaire",v:tot.ct,pct:(tot.ct/tot.b*100).toFixed(3),c:'#60a5fa'},
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
            <span style={{fontSize:13,fontWeight:700,color:'#e8e6e0'}}>TOTAL ONSS à verser</span>
            <span style={{fontSize:16,fontWeight:700,color:'#c6a34e'}}>{fmt(tot.ow+tot.oe+tot.ffe+tot.ct+tot.am)}</span>
          </div>
          <div style={{marginTop:14,padding:10,background:"rgba(198,163,78,.05)",borderRadius:6,fontSize:10.5,color:'#9e9b93',lineHeight:1.6}}>
            <b style={{color:'#c6a34e'}}>Notes:</b><br/>
            • Cotis. patronale base: {sum.filter(s2=>s2.type==='marchand').length} trav. marchand (25%) + {sum.filter(s2=>s2.type==='non_marchand').length} trav. non-marchand (32,40%)<br/>
            • Fonds amiante: dû T1-T3 2026 uniquement<br/>
            • Ouvriers ({sum.filter(s2=>s2.isOuv).length}): base calculée sur brut × 108%<br/>
            • Réduction structurelle incluse (Cat {ae[0]?.statut==='ouvrier'?'1':'1'}) • Hors réductions groupes-cibles
          </div>
        </div></>}

        {view==='calendar'&&<><div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Calendrier ONSS {y}</div></div>
        <div style={{padding:18}}>
          {calONSS.map((c,i)=><div key={i} style={{marginBottom:16,padding:12,background:"rgba(198,163,78,.04)",borderRadius:8,border:i===(q-1)?'1px solid rgba(198,163,78,.3)':'1px solid rgba(255,255,255,.03)'}}>
            <div style={{fontSize:12,fontWeight:600,color:i===(q-1)?'#c6a34e':'#e8e6e0',marginBottom:6}}>{c.p} {i===(q-1)?'← actuel':''}</div>
            <div style={{fontSize:11,color:'#9e9b93',lineHeight:2}}>
              {c.prov.map((pr,j)=><div key={j}>Provision {j+1}: <b style={{color:'#d4d0c8'}}>{pr}</b></div>)}
              <div style={{borderTop:'1px solid rgba(255,255,255,.05)',paddingTop:4,marginTop:4}}>Solde + DmfA: <b style={{color:'#c6a34e'}}>{c.solde}</b></div>
            </div>
          </div>)}
          <div style={{padding:10,background:"rgba(96,165,250,.06)",borderRadius:6,fontSize:10.5,color:'#60a5fa',lineHeight:1.6}}>
            <b>Rappel légal:</b> Les provisions mensuelles sont calculées par l'ONSS et communiquées à l'employeur. L'employeur verse la différence entre le total des provisions et la somme totale des cotisations au plus tard le dernier jour du mois suivant le trimestre.
          </div>
        </div></>}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN DASHBOARD — PANNEAU D'ADMINISTRATION ULTRA COMPLET
// ═══════════════════════════════════════════════════════════════
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

  // Charger données depuis Supabase
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
  const revenuMensuelEstime=totalTrav*12; // 12€/fiche
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
        <div style={{fontSize:18,fontWeight:700,color:'#e8e6e0'}}>👑 Administration Aureus Social Pro</div>
        <div style={{fontSize:11.5,color:'#9e9b93',marginTop:2}}>Panneau de controle — Vue globale plateforme</div>
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <button onClick={loadData} style={{padding:'6px 14px',borderRadius:8,border:'1px solid rgba(198,163,78,.3)',background:'rgba(198,163,78,.08)',color:'#c6a34e',fontSize:11,cursor:'pointer',fontWeight:600}}>🔄 Rafraichir</button>
        <div style={{fontSize:10,color:loading?'#fb923c':'#4ade80'}}>● {loading?'Chargement...':'Connecte'}</div>
      </div>
    </div>
    
    <div style={{padding:24,maxHeight:'calc(100vh - 200px)',overflowY:'auto'}}>
    
    {/* ═══ ONGLET: USERS ═══ */}
    {sub==='admin_users'&&<div>
      {/* KPIs */}
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <Stat icon="👤" label="Utilisateurs total" value={totalUsers} sub={`${activeUsers} actifs`} color="#c6a34e"/>
        <Stat icon="🏢" label="Dossiers clients" value={totalClients} sub={`${activeClients} actifs`} color="#60a5fa"/>
        <Stat icon="👥" label="Travailleurs" value={totalTrav} sub={`${activeTrav} actifs`} color="#4ade80"/>
        <Stat icon="📄" label="Fiches de paie" value={totalFiches} sub={`${fichesMois} ce mois`} color="#a78bfa"/>
        <Stat icon="💰" label="Revenu mensuel est." value={`€${revenuMensuelEstime.toLocaleString()}`} sub={`€${revenuAnnuelEstime.toLocaleString()}/an`} color="#c6a34e"/>
      </div>

      {/* Search */}
      <div style={{marginBottom:16}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher un utilisateur (nom, email...)" style={{width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(198,163,78,.15)',borderRadius:8,color:'#e8e6e0',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
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
              <div style={{fontSize:10,color:'#5e5c56'}}>{nbClients} dossier{nbClients!==1?'s':''} · {nbTrav} travailleur{nbTrav!==1?'s':''}</div>
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
                <Stat icon="🏢" label="Dossiers" value={uClients.length} color="#60a5fa"/>
                <Stat icon="👥" label="Travailleurs" value={uTrav.length} color="#4ade80"/>
                <Stat icon="📄" label="Fiches" value={uFiches.length} color="#a78bfa"/>
                <Stat icon="💰" label="Revenu/mois" value={`€${revenu}`} sub={`€${revenu*12}/an`} color="#c6a34e"/>
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

    {/* ═══ ONGLET: CLIENTS ═══ */}
    {sub==='admin_clients'&&<div>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <Stat icon="🏢" label="Total dossiers" value={totalClients} color="#60a5fa"/>
        <Stat icon="✅" label="Actifs" value={activeClients} color="#4ade80"/>
        <Stat icon="⏸" label="Inactifs" value={totalClients-activeClients} color="#fb923c"/>
        <Stat icon="👥" label="Moy. travailleurs/client" value={moyTravParClient} color="#a78bfa"/>
      </div>

      <div style={{marginBottom:16}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Rechercher un dossier (nom, TVA, ONSS...)" style={{width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(198,163,78,.15)',borderRadius:8,color:'#e8e6e0',fontSize:12,outline:'none',boxSizing:'border-box'}}/>
      </div>

      <div style={{background:"rgba(255,255,255,.02)",borderRadius:12,border:"1px solid rgba(255,255,255,.04)",overflow:'hidden'}}>
        <div style={{display:'grid',gridTemplateColumns:'2.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr',padding:'10px 14px',background:"rgba(198,163,78,.06)",borderBottom:'1px solid rgba(198,163,78,.1)',fontSize:10,fontWeight:600,color:'#c6a34e',textTransform:'uppercase',letterSpacing:.5}}>
          <div>Société</div><div>TVA / ONSS</div><div>CP</div><div>Secteur</div><div>Travailleurs</div><div>Inscription</div><div>Statut</div>
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
              <div style={{fontSize:10,color:'#5e5c56'}}>{c.forme_juridique||'SRL'} · {c.ville||'-'} {owner?`· ${owner.prenom||''} ${owner.nom||''}`:''}</div>
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

    {/* ═══ ONGLET: STATS ═══ */}
    {sub==='admin_stats'&&<div>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <Stat icon="👤" label="Utilisateurs" value={totalUsers} sub={`${activeUsers} actifs`} color="#c6a34e"/>
        <Stat icon="🏢" label="Dossiers" value={totalClients} sub={`${activeClients} actifs`} color="#60a5fa"/>
        <Stat icon="👥" label="Travailleurs" value={totalTrav} sub={`${activeTrav} actifs`} color="#4ade80"/>
        <Stat icon="📄" label="Fiches totales" value={totalFiches} color="#a78bfa"/>
        <Stat icon="💰" label="Revenu mensuel" value={`€${revenuMensuelEstime.toLocaleString()}`} color="#c6a34e"/>
        <Stat icon="📈" label="Revenu annuel" value={`€${revenuAnnuelEstime.toLocaleString()}`} color="#4ade80"/>
      </div>

      {/* Répartition par forme juridique */}
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

      {/* Répartition par CP */}
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
        <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:10}}>💰 Projection revenus (modele €12/fiche/mois)</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
          {[
            {l:'Actuel',users:totalUsers,trav:totalTrav},
            {l:'+3 mois',users:Math.ceil(totalUsers*1.5)||5,trav:Math.ceil(totalTrav*1.5)||50},
            {l:'+6 mois',users:Math.ceil(totalUsers*3)||15,trav:Math.ceil(totalTrav*3)||150},
            {l:'+12 mois',users:Math.ceil(totalUsers*8)||50,trav:Math.ceil(totalTrav*8)||500},
          ].map((p,i)=><div key={i} style={{padding:12,background:"rgba(255,255,255,.03)",borderRadius:8,textAlign:'center'}}>
            <div style={{fontSize:10,color:'#9e9b93',marginBottom:4}}>{p.l}</div>
            <div style={{fontSize:10,color:'#5e5c56'}}>{p.users} users · {p.trav} trav.</div>
            <div style={{fontSize:18,fontWeight:700,color:'#4ade80',marginTop:4}}>€{(p.trav*12).toLocaleString()}</div>
            <div style={{fontSize:10,color:'#5e5c56'}}>/mois</div>
            <div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginTop:2}}>€{(p.trav*12*12).toLocaleString()}/an</div>
          </div>)}
        </div>
      </div>
    </div>}

    {/* ═══ ONGLET: AUDIT ═══ */}
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

    {/* ═══ ONGLET: BILLING ═══ */}
    {sub==='admin_billing'&&<div>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        <Stat icon="💰" label="Revenu mensuel" value={`€${revenuMensuelEstime.toLocaleString()}`} color="#4ade80"/>
        <Stat icon="📈" label="Revenu annuel" value={`€${revenuAnnuelEstime.toLocaleString()}`} color="#c6a34e"/>
        <Stat icon="👥" label="Fiches facturables" value={totalTrav} sub="travailleurs actifs" color="#60a5fa"/>
        <Stat icon="🏢" label="Clients facturables" value={activeClients} color="#a78bfa"/>
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
            <div style={{color:'#c6a34e',fontWeight:600}}>€{tarif}</div>
            <div style={{color:'#4ade80',fontWeight:600}}>€{mensuel}</div>
            <div style={{color:'#60a5fa'}}>€{annuel.toLocaleString()}</div>
            <div style={{color:'#a78bfa'}}>€{entree}</div>
          </div>;
        })}
        {/* Total row */}
        <div style={{display:'grid',gridTemplateColumns:'2.5fr 1fr 1fr 1fr 1fr 1fr',padding:'12px 14px',background:"rgba(198,163,78,.08)",fontSize:12,fontWeight:700,alignItems:'center',borderTop:'2px solid rgba(198,163,78,.2)'}}>
          <div style={{color:'#c6a34e'}}>TOTAL</div>
          <div style={{color:'#e8e6e0'}}>{totalTrav}</div>
          <div style={{color:'#9e9b93'}}>-</div>
          <div style={{color:'#4ade80'}}>€{revenuMensuelEstime.toLocaleString()}</div>
          <div style={{color:'#60a5fa'}}>€{revenuAnnuelEstime.toLocaleString()}</div>
          <div style={{color:'#a78bfa'}}>€{clients.filter(c=>c.active).reduce((sum,c)=>{const nb=travParClient[c.id]||0;return sum+(nb<=5?149:nb<=20?299:nb<=50?499:999);},0).toLocaleString()}</div>
        </div>
      </div>

      <div style={{marginTop:16,padding:12,background:"rgba(96,165,250,.06)",borderRadius:8,fontSize:11,color:'#60a5fa',lineHeight:1.6}}>
        ℹ️ La grille tarifaire appliquee: 1-5 trav. = €15/fiche · 6-20 = €12 · 21-50 = €9 · 51-100 = €7 · 100+ = €5. Frais d'entree: Starter €149 · Business €299 · Premium €499 · Enterprise €999.
      </div>
    </div>}

    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  GUIDE PORTAIL ONSS — PAS A PAS
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  BELCOTAX
// ═══════════════════════════════════════════════════════════════
function BelcotaxPage({s,d}) {
  const [yr,setYr]=useState(new Date().getFullYear()-1);
  const [ft,setFt]=useState('10');
  const [tab,setTab]=useState('gen');
  const [allXml,setAllXml]=useState('');
  const ae=(s.emps||[]).filter(e=>e.status==='active');

  // Validation
  const warnings=[];
  ae.forEach(e=>{
    if(!e.niss) warnings.push({emp:`${e.first||e.fn||'Emp'} ${e.last||''}`,msg:'NISS manquant — fiche invalide'});
    if(!e.addr&&!e.zip) warnings.push({emp:`${e.first||e.fn||'Emp'} ${e.last||''}`,msg:'Adresse incomplète'});
  });
  if(!s.co.onss) warnings.push({emp:'Employeur',msg:'Matricule ONSS manquant'});
  if(!s.co.vat) warnings.push({emp:'Employeur',msg:'Numéro TVA manquant'});

  const gen=()=>{
    const xmlParts=[];
    ae.forEach(emp=>{
      const p=calc(emp,DPER,s.co);
      const ad={gross:p.gross*12,onss:p.onssNet*12,empB:p.empBonus*12,tax:p.tax*12,css:p.css*12,mvC:Math.round(p.mvDays*12),mvE:p.mvEmployer*12,tr:p.transport*12,atnCar:(p.atnCar||0)*12,atnAutres:(p.atnAutresTot||0)*12,pensionCompl:(p.pensionCompl||0)*12,fraisPropres:((p.expense||0)+(p.indemTeletravail||0)+(p.indemBureau||0))*12,ecoCheques:(p.ecoCheques||0)*12};
      const xml=genBelcotax(s.co,emp,yr,ad);
      xmlParts.push(xml);
      d({type:"ADD_F",d:{eid:emp.id,ename:`${emp.first||emp.fn||emp.prenom||''} ${emp.last||emp.ln||emp.nom||''}`.trim()||'Sans nom',yr,ft,ftl:LEGAL.FICHE_281[ft],ag:ad.gross,an:p.net*12,aonss:ad.onss,atax:ad.tax,acss:ad.css,xml,at:new Date().toISOString()}});
    });
    // Récapitulatif XML global BelcotaxOnWeb
    const globalXml=`<?xml version="1.0" encoding="UTF-8"?>\n<!-- BelcotaxOnWeb — Fichier recapitulatif -->\n<!-- ${ae.length} fiche(s) 281.${ft} — Annee ${yr} -->\n<!-- Généré par: Aureus Social Pro -->\n<Belcotax xmlns="urn:belcotax:${yr}">\n  <Verzending>\n    <Aangiftenr>BELCO${Date.now().toString(36).toUpperCase()}</Aangiftenr>\n    <Aangiftetype>281.${ft}</Aangiftetype>\n    <AangifteJaar>${yr}</AangifteJaar>\n    <AantalOpgaven>${ae.length}</AantalOpgaven>\n    <Schuldenaar>\n      <KBO>${(s.co.bce||s.co.vat||'').replace(/[^0-9]/g,"")}</KBO>\n      <Naam>${s.co.name}</Naam>\n      <Adres>${s.co.addr}</Adres>\n    </Schuldenaar>\n  </Verzending>\n</Belcotax>`;
    setAllXml(globalXml);
  };

  // Stats from fiches
  const fichesYr=s.fiches.filter(f2=>f2.yr==yr);
  const totBrut=fichesYr.reduce((a,f2)=>a+(f2.ag||0),0);
  const totNet=fichesYr.reduce((a,f2)=>a+(f2.an||0),0);

  return <div>
    <PH title="Fiches Fiscales BELCOTAX" sub="BelcotaxOnWeb — SPF Finances"/>
    <div style={{marginBottom:14,padding:"10px 14px",background:"linear-gradient(135deg,rgba(239,68,68,.06),rgba(239,68,68,.02))",border:"1px solid rgba(239,68,68,.1)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontSize:11,color:"#888"}}>⚡ Belcotax 281.10 auto-générées en janvier</div><button onClick={()=>{if(confirm("Générer Belcotax ?")){ (s.emps||[]).forEach(e=>generateBelcotaxXML(e,s.co));alert("✅ Belcotax générées")}}} style={{padding:"6px 14px",borderRadius:8,border:"none",background:"#ef4444",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:600}}>⚡ Générer tout</button></div>
    {/* Stats */}
    <div style={{display:'flex',gap:12,marginBottom:18}}>
      {[{l:"Fiches générées",v:fichesYr.length,c:'#c6a34e'},{l:"Brut total",v:fmt(totBrut),c:'#e8e6e0'},{l:"Net total",v:fmt(totNet),c:'#4ade80'},{l:"Travailleurs actifs",v:ae.length,c:'#60a5fa'}].map((st,i)=>
        <div key={i} style={{flex:1,padding:'12px 16px',background:"rgba(198,163,78,.04)",borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}>
          <div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'.5px'}}>{st.l}</div>
          <div style={{fontSize:typeof st.v==='number'?22:16,fontWeight:700,color:st.c,marginTop:2}}>{st.v}</div>
        </div>
      )}
    </div>
    {/* Tabs */}
    <div style={{display:'flex',gap:6,marginBottom:16}}>
      {[{v:"gen",l:"Génération"},{v:"fiches",l:"Fiches générées"},{v:"deadlines",l:"Échéances & Règles"}].map(t=>
        <button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',
          background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>
      )}
    </div>

    {tab==='gen'&&<div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
      <div>
        <C><ST>Paramètres</ST>
          <I label="Année de revenus" type="number" value={yr} onChange={v=>setYr(v)}/>
          <I label="Type de fiche" value={ft} onChange={v=>setFt(v)} style={{marginTop:9}} options={Object.entries(LEGAL.FICHE_281).map(([k,v2])=>({v:k,l:`281.${k} — ${v2}`}))}/>
          <B onClick={gen} style={{width:'100%',marginTop:14}}>Générer toutes les 281.{ft} ({ae.length} fiches)</B>
          {allXml&&<div style={{marginTop:12}}>
            <B v="outline" style={{width:'100%',fontSize:11}} onClick={()=>d({type:"MODAL",m:{w:800,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>Récapitulatif BelcotaxOnWeb</h3><pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',whiteSpace:'pre-wrap',maxHeight:400,overflowY:'auto'}}>{allXml}</pre><div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B><B onClick={()=>{navigator.clipboard?.writeText(allXml);alert('Copié !')}}>Copier</B></div></div>}})}>Voir XML récapitulatif</B>
          </div>}
        </C>
        {warnings.length>0&&<C style={{marginTop:12,borderColor:'rgba(239,68,68,.15)'}}><ST>Anomalies ({warnings.length})</ST>
          {warnings.map((w,i)=><div key={i} style={{fontSize:10.5,color:'#9e9b93',padding:'4px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <b style={{color:'#f87171'}}>{w.emp}</b>: {w.msg}
          </div>)}
        </C>}
        <C style={{marginTop:12}}><ST>Types disponibles</ST>
          {Object.entries(LEGAL.FICHE_281).map(([k,v2])=><div key={k} style={{fontSize:10.5,color:'#9e9b93',padding:'3px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><b style={{color:'#d4d0c8'}}>281.{k}</b> — {v2}</div>)}
        </C>
      </div>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Aperçu — 281.{ft} année {yr}</div></div>
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
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Fiches générées ({s.fiches.length})</div></div>
      <Tbl cols={[
        {k:'y',l:"Année",r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{r.yr}</span>},
        {k:'t',l:"Type",r:r=>`281.${r.ft}`},{k:'e',l:"Employé",r:r=>r.ename},
        {k:'g',l:"Brut annuel",a:'right',r:r=>fmt(r.ag)},
        {k:'n',l:"Net annuel",a:'right',r:r=><span style={{color:'#4ade80'}}>{fmt(r.an)}</span>},
        {k:'x',l:"",a:'right',r:r=><B v="ghost" style={{padding:'3px 8px',fontSize:10}} onClick={()=>d({type:"MODAL",m:{w:800,c:<div><h3 style={{color:'#e8e6e0',margin:'0 0 10px'}}>281.{r.ft} — {r.ename} ({r.yr})</h3><pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:380,overflowY:'auto'}}>{r.xml}</pre><div style={{display:'flex',gap:10,marginTop:12,justifyContent:'flex-end'}}><B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B><B onClick={()=>{navigator.clipboard?.writeText(r.xml);alert('Copié !')}}>Copier</B></div></div>}})}>XML</B>},
      ]} data={s.fiches}/>
    </C>}

    {tab==='deadlines'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <C><ST>Échéances BelcotaxOnWeb</ST>
        <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          {[{l:"281.10 Rémunérations",dl:"28/02 (N+1)",note:"Obligatoire pour tous les employeurs"},{l:"281.20 Dirigeants",dl:"28/02 (N+1)",note:"Administrateurs, gérants"},{l:"281.50 Honoraires/Commissions",dl:"30/06 (N+1)",note:"plus de 250 EUR/an/bénéficiaire"},{l:"281.30 Jetons présence",dl:"28/02 (N+1)",note:"Membres CA, ASBL"},{l:"Rectificative",dl:"Pas de deadline fixe",note:"Via BelcotaxOnWeb portail SPF"}].map((r,i)=>
            <div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><b style={{color:'#e8e6e0'}}>{r.l}</b><span style={{color:'#c6a34e',fontWeight:600}}>{r.dl}</span></div>
              <div style={{fontSize:10,color:'#5e5c56'}}>{r.note}</div>
            </div>
          )}
        </div>
      </C>
      <C><ST>Procédure</ST>
        <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
          {['1. Générer les fiches 281.xx dans Aureus Social Pro',"2. Vérifier les données (NISS, montants, adresses)","3. Exporter le XML récapitulatif","4. Se connecter à BelcotaxOnWeb (MyMinfin)","5. Uploader le fichier XML","6. Valider et envoyer","7. Conserver l'accusé de réception"].map((step,i)=>
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


// ═══════════════════════════════════════════════════════════════
//  PRÉCOMPTE 274
// ═══════════════════════════════════════════════════════════════
function PrecomptePage({s,d}) {
  const [mode,setMode]=useState('mensuel');
  const [m,setM]=useState(new Date().getMonth()+1);
  const [q,setQ]=useState(Math.ceil((new Date().getMonth()+1)/3));
  const [y,setY]=useState(new Date().getFullYear());
  const ae=(s.emps||[]).filter(e=>e.status==='active');

  // Calcul mensuel
  const detMens=ae.map(e=>{const p=calc(e,{...DPER,month:m,year:y},s.co);return{e,tax:p.tax,gross:p.gross};});
  const totMens=detMens.reduce((a,r)=>a+r.tax,0);

  // Calcul trimestriel (3 mois cumulés)
  const qMonths=[(q-1)*3+1,(q-1)*3+2,(q-1)*3+3];
  const detTrim=ae.map(e=>{
    let taxQ=0,grossQ=0;
    qMonths.forEach(mo=>{const p=calc(e,{...DPER,month:mo,year:y},s.co);taxQ+=p.tax;grossQ+=p.gross;});
    return{e,tax:taxQ,gross:grossQ};
  });
  const totTrim=detTrim.reduce((a,r)=>a+r.tax,0);

  // Seuil: PP année N-1 > 50 240€ → obligatoirement mensuel
  const ppAnnuel=totMens*12;
  const seuilMensuel=50240;
  const obligMensuel=ppAnnuel>seuilMensuel;

  const det=mode==='mensuel'?detMens:detTrim;
  const tot=mode==='mensuel'?totMens:totTrim;

  // Calendrier SPF 2026
  const calMens=[{p:'Janvier 2026',dl:"13/02/2026"},{p:'Février 2026',dl:"13/03/2026"},{p:'Mars 2026',dl:"15/04/2026"},{p:'Avril 2026',dl:"15/05/2026"},{p:'Mai 2026',dl:"15/06/2026"},{p:'Juin 2026',dl:"15/07/2026"},{p:'Juillet 2026',dl:"14/08/2026"},{p:'Août 2026',dl:"15/09/2026"},{p:'Septembre 2026',dl:"15/10/2026"},{p:'Octobre 2026',dl:"13/11/2026"},{p:'Novembre 2026',dl:"15/12/2026"},{p:'Décembre 2026',dl:"15/01/2027"}];
  const calTrim=[{p:'T1 2026',dl:"15/04/2026"},{p:'T2 2026',dl:"15/07/2026"},{p:'T3 2026',dl:"15/10/2026"},{p:'T4 2026',dl:"15/01/2027"}];

  return <div>
    <PH title="Précompte Professionnel 274" sub="Déclaration et versement — FINPROF"/>
    <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:18}}>
      <div>
      <C><ST>Configuration</ST>
        <I label="Périodicité" value={mode} onChange={setMode} options={[{v:"mensuel",l:"Mensuel"},{v:"trimestriel",l:"Trimestriel"}]}/>
        {mode==='mensuel'?<I label="Mois" value={m} onChange={v=>setM(parseInt(v))} options={MN.map((x,i)=>({v:i+1,l:x}))} style={{marginTop:9}}/>
        :<I label="Trimestre" value={q} onChange={v=>setQ(parseInt(v))} options={[{v:1,l:"T1 (jan-mar)"},{v:2,l:"T2 (avr-jun)"},{v:3,l:"T3 (jul-sep)"},{v:4,l:"T4 (oct-déc)"}]} style={{marginTop:9}}/>}
        <I label="Année" type="number" value={y} onChange={v=>setY(v)} style={{marginTop:9}}/>
        <div style={{marginTop:18,padding:14,background:"rgba(198,163,78,.06)",borderRadius:8,border:'1px solid rgba(198,163,78,.1)',textAlign:'center'}}>
          <div style={{fontSize:10.5,color:'#9e9b93',textTransform:'uppercase',letterSpacing:'1px'}}>Total à verser</div>
          <div style={{fontSize:26,fontWeight:700,color:'#c6a34e',marginTop:6}}>{fmt(tot)}</div>
          <div style={{fontSize:10.5,color:'#5e5c56',marginTop:3}}>{mode==='mensuel'?`${MN[m-1]} ${y}`:`T${q} ${y}`} · {ae.length} trav.</div>
        </div>
        {obligMensuel&&mode==='trimestriel'&&<div style={{marginTop:10,padding:8,background:"rgba(239,68,68,.08)",borderRadius:6,border:'1px solid rgba(239,68,68,.15)',fontSize:10.5,color:'#ef4444'}}>
          <b>⚠</b> PP annuel estimé ({fmt(ppAnnuel)}) dépasse le seuil de {fmt(seuilMensuel)}. Déclaration <b>mensuelle obligatoire</b>.
        </div>}
        <div style={{marginTop:14,padding:10,background:"rgba(96,165,250,.06)",borderRadius:8,border:'1px solid rgba(96,165,250,.1)'}}>
          <div style={{fontSize:10.5,color:'#60a5fa',lineHeight:1.5}}>
            <b>Seuil:</b> PP N-1 {'>'} 50 240€ → mensuel<br/>
            <b>Échéance:</b> 15 du mois suivant (mensuel) ou 15 du mois suivant le trimestre<br/>
            <b>Déclaration:</b> Via FINPROF (application SPF Finances)
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
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Détail — {mode==='mensuel'?`${MN[m-1]} ${y}`:`T${q} ${y} (${qMonths.map(mo=>MN[mo-1]).join(' + ')})`}</div></div>
        <Tbl cols={[
          {k:'n',l:"Travailleur",r:r=><span style={{fontWeight:500}}>{r.e.first} {r.e.last}</span>},
          {k:'g',l:mode==='mensuel'?'Brut':'Brut cumulé',a:'right',r:r=>fmt(r.gross)},
          {k:'t',l:mode==='mensuel'?'Précompte':'PP cumulé',a:'right',r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{fmt(r.tax)}</span>},
        ]} data={det}/>
        {det.length>0&&<div style={{padding:'12px 18px',borderTop:'1px solid rgba(139,115,60,.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',gap:8}}>
            <B v="outline" style={{fontSize:10.5,padding:'6px 12px'}} onClick={()=>{
              const periode=mode==='mensuel'?`${String(m).padStart(2,"0")}/${y}`:`T${q}/${y}`;
              const xml274=`<?xml version="1.0" encoding="UTF-8"?>\n<!-- Declaration Precompte Professionnel 274 -->\n<!-- SPF Finances — FINPROF -->\n<!-- Généré par: Aureus Social Pro -->\n<PP274 xmlns="urn:pp274:${y}">\n  <Declaration>\n    <Periode>${periode}</Periode>\n    <Periodicite>${mode}</Periodicite>\n    <Employeur>\n      <KBO>${(s.co.bce||s.co.vat||'').replace(/[^0-9]/g,"")}</KBO>\n      <ONSS>${(s.co.onss||'').replace(/[^0-9]/g,"")}</ONSS>\n      <Naam>${s.co.name}</Naam>\n    </Employeur>\n    <NbrTravailleurs>${ae.length}</NbrTravailleurs>\n    <TotalBrut>${det.reduce((a,r)=>a+r.gross,0).toFixed(2)}</TotalBrut>\n    <TotalPrecompte>${tot.toFixed(2)}</TotalPrecompte>\n${det.map(r=>`    <Travailleur>\n      <Naam>${r.e.last||''} ${r.e.first||''}</Naam>\n      <INSZ>${(r.e.niss||'').replace(/[\\.-\\s]/g,"")}</INSZ>\n      <Brut>${r.gross.toFixed(2)}</Brut>\n      <PP>${r.tax.toFixed(2)}</PP>\n    </Travailleur>`).join('\n')}\n  </Declaration>\n</PP274>`;
              d({type:"MODAL",m:{w:850,c:<div>
                <h2 style={{fontSize:17,fontWeight:600,color:'#e8e6e0',margin:'0 0 6px',fontFamily:"'Cormorant Garamond',serif"}}>Déclaration PP 274 — {periode}</h2>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:"rgba(74,222,128,.1)",color:'#4ade80',fontWeight:600}}>✓ XML généré</span>
                  <span style={{fontSize:10,padding:'3px 10px',borderRadius:4,background:"rgba(198,163,78,.1)",color:'#c6a34e',fontWeight:600}}>{ae.length} trav. · {fmt(tot)}</span>
                </div>
                <pre style={{background:"#060810",border:'1px solid rgba(139,115,60,.15)',borderRadius:8,padding:14,fontSize:10,color:'#9e9b93',overflowX:'auto',whiteSpace:'pre-wrap',maxHeight:350,overflowY:'auto'}}>{xml274}</pre>
                <div style={{display:'flex',gap:10,marginTop:14,justifyContent:'flex-end'}}>
                  <B v="outline" onClick={()=>d({type:"MODAL",m:null})}>Fermer</B>
                  <B onClick={()=>{navigator.clipboard?.writeText(xml274);alert('XML 274 copié !')}}>Copier XML</B>
                </div>
              </div>}});
            }}>Générer XML 274</B>
          </div>
          <div style={{display:'flex',gap:16,alignItems:'center'}}><span style={{fontSize:12,color:'#9e9b93'}}>TOTAL:</span><span style={{fontSize:14,fontWeight:700,color:'#c6a34e'}}>{fmt(tot)}</span></div>
        </div>}
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  DOCUMENTS SOCIAUX
// ═══════════════════════════════════════════════════════════════
function DocsPage({s,d}) {
  const [dt,setDt]=useState('C4');
  const [eid,setEid]=useState((s.emps||[])[0]?.id||'');
  const [endD,setEndD]=useState(new Date().toISOString().split('T')[0]);
  const [reason,setReason]=useState('Licenciement');
  const emp=(s.emps||[]).find(e=>e.id===eid);

  const gen=()=>{if(!emp)return;
    const fields=dt==='C4'?[
      {l:"Employeur",v:s.co.name},{l:"N° ONSS",v:s.co.onss},{l:"Travailleur",v:`${emp.first} ${emp.last}`},{l:"NISS",v:emp.niss},
      {l:"Fonction",v:emp.fn},{l:"CP",v:`CP ${emp.cp}`},{l:"Entrée",v:emp.startD},{l:"Sortie",v:endD},{l:"Motif",v:reason},
      {l:"Dernier brut",v:fmt(emp.monthlySalary)},{l:"Régime",v:`${emp.whWeek}h/sem`},
    ]:dt==='VACATION'?[
      {l:"Employeur",v:s.co.name},{l:"Travailleur",v:`${emp.first} ${emp.last}`},{l:"Année réf.",v:`${new Date().getFullYear()-1}`},
      {l:"Jours vacances",v:"20 jours"},{l:"Simple pécule",v:fmt(emp.monthlySalary)},{l:"Double pécule (92% brut)",v:fmt(emp.monthlySalary*PV_DOUBLE)},{l:"  dont 1ère partie (85%)",v:fmt(emp.monthlySalary*0.85)},{l:"  dont 2ème partie (7%)",v:fmt(emp.monthlySalary*0.07)},{l:"ONSS sur 2ème partie",v:fmt(emp.monthlySalary*0.07*TX_ONSS_W)},
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
        <I label="Employé" value={eid} onChange={setEid} style={{marginTop:9}} options={(s.emps||[]).map(e=>({v:e.id,l:`${e.first||e.fn||'Emp'} ${e.last||''}`}))}/>
        {dt==='C4'&&<><I label="Date sortie" type="date" value={endD} onChange={setEndD} style={{marginTop:9}}/>
          <I label="Motif" value={reason} onChange={setReason} style={{marginTop:9}} options={[{v:"Licenciement",l:"Licenciement"},{v:"Démission",l:"Démission"},{v:"Fin CDD",l:"Fin de CDD"},{v:"Commun accord",l:"Commun accord"},{v:"Faute grave",l:"Faute grave"}]}/></>}
        <B onClick={gen} style={{width:'100%',marginTop:14}}>Générer</B>
      </C>
      <C style={{padding:0,overflow:'hidden'}}>
        <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Documents générés</div></div>
        <Tbl cols={[
          {k:'t',l:"Type",r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{r.title}</span>},
          {k:'e',l:"Employé",r:r=>r.ename},
          {k:'d',l:"Date",r:r=>new Date(r.at).toLocaleDateString('fr-BE')},
        ]} data={s.docs}/>
      </C>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  REPORTS
// ═══════════════════════════════════════════════════════════════
function ReportsPage({s,d}) {
  const ae=(s.emps||[]).filter(e=>e.status==='active');
  const md=ae.map(e=>{const p=calc(e,DPER,s.co);return{name:`${e.first||e.fn||'Emp'} ${e.last||''}`,gross:p.gross,onssW:p.onssNet,tax:p.tax,css:p.css,net:p.net,onssE:p.onssE,cost:p.costTotal};});
  const t=md.reduce((a,r)=>({g:a.g+r.gross,ow:a.ow+r.onssW,tx:a.tx+r.tax,cs:a.cs+r.css,n:a.n+r.net,oe:a.oe+r.onssE,co:a.co+r.cost}),{g:0,ow:0,tx:0,cs:0,n:0,oe:0,co:0});
  return <div>
    <PH title="Rapports" sub="Analyse masse salariale"/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:22}}>
      <SC label="Masse brute" value={fmt(t.g)} color="#60a5fa"/>
      <SC label="Charges ONSS" value={fmt(t.ow+t.oe)} color="#f87171" sub={`Trav: ${fmt(t.ow)} · Empl: ${fmt(t.oe)}`}/>
      <SC label="Précompte" value={fmt(t.tx)} color="#a78bfa"/>
      <SC label="Coût employeur" value={fmt(t.co)} color="#c6a34e" sub={`Net: ${fmt(t.n)}`}/>
    </div>
    <C style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(139,115,60,.1)'}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>Détail mensuel</div></div>
      <Tbl cols={[{k:'name',l:"Employé",b:1},{k:'g',l:"Brut",a:'right',r:r=>fmt(r.gross)},{k:'o',l:"ONSS",a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.onssW)}</span>},{k:'t',l:"Préc.",a:'right',r:r=><span style={{color:'#a78bfa'}}>{fmt(r.tax)}</span>},{k:'n',l:"Net",a:'right',r:r=><span style={{fontWeight:700,color:'#4ade80'}}>{fmt(r.net)}</span>},{k:'e',l:"ONSS empl.",a:'right',r:r=><span style={{color:'#f87171'}}>{fmt(r.onssE)}</span>},{k:'c',l:"Coût",a:'right',r:r=><span style={{fontWeight:600,color:'#c6a34e'}}>{fmt(r.cost)}</span>}]} data={md}/>
    </C>
    <C style={{marginTop:18}}><div style={{fontSize:13,fontWeight:600,color:'#e8e6e0',marginBottom:14}}>Projection annuelle</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14}}>
        {[{l:"Masse brute",v:t.g*12,c:'#60a5fa'},{l:"Charges sociales",v:(t.ow+t.oe)*12,c:'#f87171'},{l:"Net versé",v:t.n*12,c:'#4ade80'},{l:"Coût total",v:t.co*12,c:'#c6a34e'}].map((x,i)=>
          <div key={i} style={{textAlign:'center',padding:14,background:`${x.c}08`,borderRadius:8}}><div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>{x.l}</div><div style={{fontSize:18,fontWeight:700,color:x.c,marginTop:5}}>{fmt(x.v)}</div></div>
        )}
      </div>
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
//  FRAIS DE GESTION — Grille tarifaire secrétariat social
// ═══════════════════════════════════════════════════════════════


// ── Sprint 17d: Backup & Restore System ──
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

// ── Cloud Backup via Supabase ──
async function cloudBackupSave(state){
  if(!_supabaseRef||!_userIdRef)return{ok:false,msg:'Supabase non connecté'};
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
    return{ok:true,msg:'Backup cloud sauvegardé',date:backup.date,emps:backup.emps_count};
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
  if(!_supabaseRef||!_userIdRef)return{ok:false,msg:'Supabase non connecté'};
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
    return{ok:true,msg:'Restauration cloud réussie',emps:backup.employees?.length||0};
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
    <PH title="Paramètres" sub="Configuration société"/>
    {/* Backup & Restore */}
    <div style={{marginBottom:18,padding:16,background:'linear-gradient(135deg,rgba(34,197,94,.06),rgba(34,197,94,.02))',border:'1px solid rgba(34,197,94,.15)',borderRadius:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div><div style={{fontSize:14,fontWeight:600,color:'#22c55e'}}>💾 Sauvegarde & Restauration</div><div style={{fontSize:10,color:'#888',marginTop:2}}>Dernière sauvegarde auto: {safeLS.get('aureus_autobackup_date')?new Date(safeLS.get('aureus_autobackup_date')).toLocaleString('fr-BE'):'Aucune'}</div></div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>{const name=exportBackup(s);alert('✅ Backup téléchargé: '+name)}} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'#22c55e',color:'#fff',fontSize:11,fontWeight:600,cursor:'pointer'}}>📥 Exporter Backup</button>
          <label style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(59,130,246,.3)',background:'rgba(59,130,246,.1)',color:'#3b82f6',fontSize:11,fontWeight:600,cursor:'pointer'}}> Importer
            <input type="file" accept=".json" style={{display:'none'}} onChange={async(e)=>{
              const file=e.target.files[0];if(!file)return;
              try{const r=await importBackup(file,d);alert('✅ Restauration réussie!\n\n'+r.emps+' employés\n'+r.pays+' fiches de paie\n'+r.clients+' clients\n\nDate backup: '+new Date(r.date).toLocaleString('fr-BE'));}
              catch(err){alert('❌ Erreur: '+err);}
              e.target.value='';
            }}/>
          </label>
          <button onClick={()=>{
            let autoBackup=safeLS.get('aureus_autobackup');
            if(!autoBackup){alert('Aucune sauvegarde automatique trouvée');return;}
            if(confirm('Restaurer la dernière sauvegarde automatique ?\n\nDate: '+new Date(safeLS.get('aureus_autobackup_date')).toLocaleString('fr-BE'))){
              try{const b=(()=>{try{return JSON.parse(autoBackup)}catch(e){return null}})();if(b.co)d({type:'SET_COMPANY',data:b.co});if(b.emps)d({type:'SET_EMPS',data:b.emps});if(b.pays)d({type:'SET_PAYS',data:b.pays});alert('✅ Restauration auto-backup réussie');}catch(err){alert('❌ Erreur: '+err);}
            }
          }} style={{padding:'8px 16px',borderRadius:8,border:'1px solid rgba(234,179,8,.3)',background:'rgba(234,179,8,.1)',color:'#eab308',fontSize:11,fontWeight:600,cursor:'pointer'}}>🔄 Auto-backup</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        <div style={{padding:8,background:'rgba(198,163,78,.06)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:16,fontWeight:700,color:'#c6a34e'}}>{(s.emps||[]).length}</div><div style={{fontSize:9,color:'#888'}}>Employés</div></div>
        <div style={{padding:8,background:'rgba(59,130,246,.06)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:16,fontWeight:700,color:'#3b82f6'}}>{(s.pays||[]).length}</div><div style={{fontSize:9,color:'#888'}}>Fiches paie</div></div>
        <div style={{padding:8,background:'rgba(168,85,247,.06)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:16,fontWeight:700,color:'#a855f7'}}>{(s.clients||[]).length}</div><div style={{fontSize:9,color:'#888'}}>Clients</div></div>
        <div style={{padding:8,background:'rgba(34,197,94,.06)',borderRadius:8,textAlign:'center'}}><div style={{fontSize:16,fontWeight:700,color:'#22c55e'}}>{Math.round(JSON.stringify(s).length/1024)} KB</div><div style={{fontSize:9,color:'#888'}}>Taille données</div></div>
      </div>
    </div>
    {/* 2FA / MFA TOTP */}
    <div style={{marginBottom:18,padding:16,background:'linear-gradient(135deg,rgba(198,163,78,.06),rgba(198,163,78,.02))',border:'1px solid rgba(198,163,78,.15)',borderRadius:12}}>
      <TwoFactorSetup/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      <C><ST>Identification</ST><div style={{display:'grid',gap:9}}>
        <I label="Société" value={f.name} onChange={v=>setF({...f,name:v})}/>
        <I label="TVA" value={f.vat} onChange={v=>setF({...f,vat:v})}/>
        <I label="BCE" value={f.bce} onChange={v=>setF({...f,bce:v})}/>
        <I label="ONSS" value={f.onss} onChange={v=>setF({...f,onss:v})}/>
        <I label="Code NACE" value={f.nace} onChange={v=>setF({...f,nace:v})}/>
        <I label="Adresse" value={f.addr} onChange={v=>setF({...f,addr:v})}/>
        <I label="CP" value={f.cp} onChange={v=>setF({...f,cp:v})} options={Object.entries(LEGAL.CP).map(([k,v])=>({v:k,l:v}))}/>
        <I label="IBAN (compte bancaire)" value={f.bank} onChange={v=>setF({...f,bank:v})}/>
        <I label="BIC (code banque)" value={f.bic} onChange={v=>setF({...f,bic:v})} options={[
          {v:"GEBABEBB",l:"GEBABEBB — BNP Paribas Fortis"},
          {v:"BBRUBEBB",l:"BBRUBEBB — ING Belgique"},
          {v:"KREDBEBB",l:"KREDBEBB — KBC / CBC"},
          {v:"GKCCBEBB",l:"GKCCBEBB — Belfius"},
          {v:"ARSPBE22",l:"ARSPBE22 — Argenta"},
          {v:"NICABEBB",l:"NICABEBB — Crelan"},
          {v:"TRIOBEBB",l:"TRIOBEBB — Triodos"},
          {v:"AXABBE22",l:"AXABBE22 — AXA Banque"},
        ]}/>
      </div></C>
      <C><ST>Contact & Assurances</ST><div style={{display:'grid',gap:9}}>
        <I label="Contact" value={f.contact} onChange={v=>setF({...f,contact:v})}/>
        <I label="Email" value={f.email} onChange={v=>setF({...f,email:v})}/>
        <I label="Téléphone" value={f.phone} onChange={v=>setF({...f,phone:v})}/>
        <I label="Assureur AT" value={f.insurer} onChange={v=>setF({...f,insurer:v})}/>
        <I label="N° police" value={f.policyNr} onChange={v=>setF({...f,policyNr:v})}/>
        <I label="Secrétariat social" value={f.secSoc} onChange={v=>setF({...f,secSoc:v})}/>
      </div></C>
    </div>
    <div style={{marginTop:14,display:'flex',justifyContent:'flex-end'}}><B onClick={()=>{d({type:"UPD_CO",d:f});alert('Sauvegardé !')}}>Sauvegarder</B></div>
    
    {/* 2FA Security Section */}
    <C style={{marginTop:20}}>
      <ST>🔐 Sécurité — Authentification à deux facteurs (2FA)</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div>
          <div style={{fontSize:12,color:'#e8e6e0',marginBottom:8,fontWeight:600}}>Statut 2FA</div>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:14,background:'rgba(74,222,128,.04)',borderRadius:10,border:'1px solid rgba(74,222,128,.12)'}}>
            <span style={{fontSize:24}}>🔒</span>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'#4ade80'}}>2FA disponible via Supabase</div>
              <div style={{fontSize:10.5,color:'#5e5c56',marginTop:2}}>Activez la vérification en deux étapes pour sécuriser votre compte</div>
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
                  alert('2FA activé !\\n\\nScannez le QR code avec Google Authenticator ou Authy.\\n\\nSecret: '+secret+'\\n\\n(Le QR code sera affiché dans une prochaine version)');
                }
              }catch(e){alert('2FA via TOTP — Activez dans Supabase Dashboard > Authentication > MFA');}
            }}>🔐 Activer 2FA (TOTP)</B>
          </div>
        </div>
        <div>
          <div style={{fontSize:12,color:'#e8e6e0',marginBottom:8,fontWeight:600}}>Options de sécurité</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>📧</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>Email de confirmation</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>Requis à l'inscription</div>
              </div>
              <span style={{fontSize:10,color:'#4ade80',fontWeight:600}}>Actif ✓</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>🔑</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>Réinitialisation mot de passe</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>Par email sécurisé</div>
              </div>
              <span style={{fontSize:10,color:'#4ade80',fontWeight:600}}>Actif ✓</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>⏱</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>Session timeout</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>Déconnexion après inactivité</div>
              </div>
              <span style={{fontSize:10,color:'#fb923c',fontWeight:600}}>1 heure</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>📱</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>TOTP (Google Authenticator / Authy)</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>Code à 6 chiffres toutes les 30 secondes</div>
              </div>
              <span style={{fontSize:10,color:'#fb923c',fontWeight:600}}>À activer</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'rgba(198,163,78,.03)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
              <span>🛡</span>
              <div style={{flex:1}}>
                <div style={{fontSize:11.5,color:'#e8e6e0'}}>Audit trail (Boîte noire)</div>
                <div style={{fontSize:9.5,color:'#5e5c56'}}>Toute action est tracée dans audit_log</div>
              </div>
              <span style={{fontSize:10,color:'#4ade80',fontWeight:600}}>Actif ✓</span>
            </div>
          </div>
        </div>
      </div>
    </C>
    <C style={{marginTop:20}}>
      <ST>Barèmes légaux</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:20,marginTop:10}}>
        <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>ONSS</div><div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2}}>
          <div>Travailleur: <b style={{color:'#e8e6e0'}}>{fmtP(LEGAL.ONSS_W)}</b></div>
          <div>Employeur (marchand): <b style={{color:'#e8e6e0'}}>25,00%</b></div>
          <div>Employeur (non-march.): <b style={{color:'#e8e6e0'}}>32,40%</b></div>
          <div>Ouvriers: brut × 108%</div>
          <div>Bonus max: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.BONUS_2026.A_MAX)}</b></div>
        </div></div>
        <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>Avantages</div><div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2}}>
          <div>CR empl. max: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.MV.emax)}</b> (2026)</div>
          <div>CR trav. min: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.MV.wmin)}</b></div>
          <div>CR valeur max: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.MV.maxTotal)}</b></div>
          <div>Éco-chèques: <b style={{color:'#e8e6e0'}}>{fmt(LEGAL.ECO)}/an</b></div>
        </div></div>
        <div><div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:6}}>Régime</div><div style={{fontSize:11.5,color:'#9e9b93',lineHeight:2}}>
          <div>Heures/sem: <b style={{color:'#e8e6e0'}}>{LEGAL.WH}h</b></div>
          <div>Heures/jour: <b style={{color:'#e8e6e0'}}>{LEGAL.WHD}h</b></div>
          <div>Jours/mois: <b style={{color:'#e8e6e0'}}>{LEGAL.WD}</b></div>
        </div></div>
      </div>
      <div style={{marginTop:14,padding:10,background:"rgba(96,165,250,.05)",borderRadius:8,border:'1px solid rgba(96,165,250,.08)'}}>
        <div style={{fontSize:10.5,color:'#4ade80',lineHeight:1.5}}>✅ Précompte professionnel calculé selon la formule-clé complète SPF Finances — Annexe III AR/CIR 92 — Barèmes 2026 (tranches annuelles 26,75% à 53,50%, quotité exemptée 10 900€, frais forfaitaires 30% plafond 5 930€, quotient conjugal, réductions familiales annualisées).</div>
      </div>
    </C>
    <C style={{marginTop:20}}>
      <ST>🔍 Audit système — Aureus Social Pro</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginTop:12}}>
        <div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#4ade80',marginBottom:10}}>✅ Barèmes SPF vérifiés (salairesminimums.be)</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:2.2}}>
            {[
              {cp:'200',n:'CP AUXILIAIRE EMPLOYÉS',idx:'2,21%',dt:'01/01/2026',src:'Grille A/B/C/D, 0-26 ans anc.'},
              {cp:'124',n:'CONSTRUCTION',idx:'0,22%',dt:'01/01/2026',src:'Taux horaires I→Chef IV'},
              {cp:'302',n:'HÔTELLERIE',idx:'2,19%',dt:'01/01/2026',src:'Cat I-V par ancienneté'},
              {cp:'118',n:'INDUSTRIE ALIMENTAIRE (ouv.)',idx:'2,19%',dt:'01/01/2026',src:'S-sect.17, 8 classes, anc mois'},
              {cp:'140',n:'TRANSPORT ROUTIER',idx:'2,18%',dt:'01/01/2026',src:'SCP 140.03 roulant/non-roulant/garage'},
              {cp:'330',n:'SANTÉ',idx:'2,0%',dt:'01/01/2026',src:'Éch. 1.12→1.59, 13 échelons anc.'},
              {cp:'121',n:'NETTOYAGE',idx:'0,56%',dt:'01/01/2026',src:'8 catégories, régime 37h'},
              {cp:'111',n:'MÉTAL/MÉCANIQUE (ouv.)',idx:'2,72%',dt:'01/07/2025',src:'Cat 1-7 national + Agoria'},
              {cp:'116',n:'CHIMIE (ouvriers)',idx:'2,0%',dt:'01/04/2025',src:'Taux horaires manœuvre, 2 échelons'},
              {cp:'201',n:'COMMERCE DÉTAIL INDÉPENDANT',idx:'2,0%',dt:'01/04/2025',src:'Grp1 vente Cat.1-4, exp 0-14 ans'},
              {cp:'202',n:'COMMERCE DÉTAIL ALIMENTAIRE',idx:'1,0%',dt:'01/01/2026',src:'Cat 1-5 par ancienneté'},
              {cp:'209',n:'FAB. MÉTALLIQUE (empl.)',idx:'2,0%',dt:'01/07/2025',src:'Classes SCE, Agoria'},
              {cp:'220',n:'INDUSTRIE ALIMENTAIRE (empl.)',idx:'2,19%',dt:'01/01/2026',src:'Cat 1-6, CGSLB'},
              {cp:'306',n:'ASSURANCES',idx:'2,23%',dt:'01/01/2026',src:'Employés Cat.1-4B, 22 éch. anc.'},
              {cp:'304',n:'SPECTACLE',idx:'x1,37',dt:'01/02/2026',src:'Groupes 1a-6, SPF officiel'},
              {cp:'311',n:'GRANDES SURFACES',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-5, vente détail'},
              {cp:'313',n:'PHARMACIES',idx:'2,0%',dt:'01/03/2025',src:'Non-pharma Cat I-IV 0-42 ans + Pharmaciens'},
              {cp:'317',n:'GARDIENNAGE',idx:'2,21%',dt:'01/01/2026',src:'Agent A-D, sécurité'},
              {cp:'318',n:'AIDES FAMILIALES',idx:'2,0%',dt:'01/01/2026',src:'Cat 1-4 non-marchand'},
              {cp:'329',n:'SOCIO-CULTUREL',idx:'2,0%',dt:'01/01/2026',src:'Barème 1-4.1, ASBL'},
              {cp:'331',n:'AIDE SOCIALE (Flandre)',idx:'2,0%',dt:'01/01/2026',src:'IFIC Cat 1-5'},
              {cp:'332',n:'AIDE SOCIALE (francophone)',idx:'2,0%',dt:'01/01/2026',src:'IFIC Cat 1-5'},
              {cp:'336',n:'PROFESSIONS LIBÉRALES',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-4 aligné CP 200'},
              {cp:'144',n:'AGRICULTURE',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-4 secteurs verts'},
              {cp:'145',n:'HORTICULTURE',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-3 secteurs verts'},
              {cp:'152',n:'ENSEIGNEMENT LIBRE (ouv.)',idx:'2,0%',dt:'01/01/2026',src:'6 catégories CP 152.02'},
              {cp:'333',n:'ATTRACTIONS TOURISTIQUES',idx:'2,21%',dt:'01/01/2026',src:'Cat 1-4 loisirs'},
            ].map(b=><div key={b.cp} style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{background:"rgba(74,222,128,.1)",color:'#4ade80',padding:'1px 6px',borderRadius:4,fontSize:9,fontWeight:700,minWidth:44,textAlign:'center'}}>CP {b.cp}</span>
              <span style={{color:'#d4d0c8',fontSize:11}}>{b.n}</span>
              <span style={{color:'#5e5c56',fontSize:10,marginLeft:'auto'}}>idx {b.idx} · {b.dt}</span>
            </div>)}
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#facc15',marginTop:16,marginBottom:10}}>≈ Barèmes estimés (structure confirmée, montants approximatifs)</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:2.2}}>
            {[
              {cp:'149',n:'ÉLECTRICIENS',idx:'2,0%',dt:'01/01/2026',src:'5 cat. avec prime ancienneté'},
              {cp:'225',n:'ENSEIGNEMENT PRIVÉ (empl.)',idx:'2,21%',dt:'01/01/2026',src:'Aligné CP 200'},
              {cp:'226',n:'COMMERCE INTERNATIONAL',idx:'2,23%',dt:'01/01/2026',src:'CGSLB vérifié'},
              {cp:'307',n:'COURTAGE ASSURANCES',idx:'2,21%',dt:'01/01/2026',src:'Aligné CP 200 + compléments'},
              {cp:'319',n:'ÉDUCATIFS',idx:'2,0%',dt:'01/01/2026',src:'Non-marchand, IFIC'},
              {cp:'322.01',n:'TITRES-SERVICES',idx:'2,0%',dt:'01/01/2026',src:'Salaire sectoriel minimum'},
              {cp:'323',n:'IMMOBILIER',idx:'2,21%',dt:'01/01/2026',src:'Aligné CP 200'},
              {cp:'327',n:'ETA',idx:'2,0%',dt:'01/01/2026',src:'Travailleurs adaptés + encadrement'},
            ].map(b=><div key={b.cp} style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{background:"rgba(250,204,21,.1)",color:'#facc15',padding:'1px 6px',borderRadius:4,fontSize:9,fontWeight:700,minWidth:44,textAlign:'center'}}>CP {b.cp}</span>
              <span style={{color:'#d4d0c8',fontSize:11}}>{b.n}</span>
              <span style={{color:'#5e5c56',fontSize:10,marginLeft:'auto'}}>idx {b.idx} · {b.dt}</span>
            </div>)}
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#4ade80',marginTop:16,marginBottom:10}}>✅ 35 CPs — 27 vérifiés SPF + 8 estimés fiables</div>
        </div>
        <div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#e8e6e0',marginBottom:10}}>📊 Statistiques application</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:2.2}}>
            <div>Modules fonctionnels: <b style={{color:'#c6a34e'}}>46</b></div>
            <div>Composants React: <b style={{color:'#c6a34e'}}>~90</b></div>
            <div>Catégories navigation: <b style={{color:'#c6a34e'}}>12</b></div>
            <div>CPs avec barèmes: <b style={{color:'#4ade80'}}>35</b> / 35 (27 SPF + 8 estimés)</div>
            <div>Secteurs wizard: <b style={{color:'#c6a34e'}}>26</b> activités</div>
            <div>Documents DRS: <b style={{color:'#c6a34e'}}>14 types Activa + 15 chômage + 14 INAMI</b></div>
            <div>Formats comptables: <b style={{color:'#c6a34e'}}>6</b> (BOB, Winbooks, Kluwer, Popsy, Soda, Autre)</div>
            <div>Régions Activa: <b style={{color:'#c6a34e'}}>3</b> (Actiris, FOREM, VDAB)</div>
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#4ade80',marginTop:16,marginBottom:10}}>✅ Calculs conformes Annexe III 2026</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
            {[
              'Précompte pro: formule-clé COMPLÈTE SPF Finances 2026 (tranches 26,75%→53,50%, quotité exemptée 10 900€)',
              '35 CPs avec barèmes vérifiés (sources SPF et syndicales officielles)',
              'CP 209: barèmes indexés +2,72% au 01/07/2025 — montants exacts emploi.belgique.be',
              'CP 330: barèmes classiques + échelles IFIC (Cat.1.12→1.59)',
              'ONSS: taux 25% marchand + 32,40% non-marchand + ouvrier 108% + modulations sectorielles + cotis. spéciales (FFE, chômage temp., amiante)',
              'Pécule vacances: double pécule détaillé (85% + 7%, ONSS 2ème partie, cotis. spéc. 1%)',
            ].map((p,i)=><div key={i} style={{paddingLeft:10,borderLeft:'2px solid rgba(74,222,128,.3)',marginBottom:6,fontSize:10.5,color:'#4ade80'}}>{p}</div>)}
          </div>
          <div style={{fontSize:11.5,fontWeight:600,color:'#60a5fa',marginTop:16,marginBottom:10}}>💡 Pistes d'évolution future</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>
            {[
              'Module flexi-jobs (horeca, commerce, santé)',
              'Export SEPA XML ISO 20022 pour virements salaires',
              'Module évaluation annuelle / entretien fonctionnement',
              'Gestion planning/horaires avec badgeuse',
              'Intégration eBox entreprise (documents sociaux dématérialisés)',
              'Module accident du travail (déclaration + suivi FEDRIS)',
              'Connexion API DmfA / Dimona (batch ONSS)',
            ].map((p,i)=><div key={i} style={{paddingLeft:10,borderLeft:'2px solid rgba(96,165,250,.2)',marginBottom:6,fontSize:10.5,color:'#60a5fa'}}>{p}</div>)}
          </div>
        </div>
      </div>
    </C>
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  MODULES PRO
// ═══════════════════════════════════════════════════════════════
const DRS_DOCS={
  chomage:[
    {code:'C4',l:"C4 — Certificat de chômage",f:['motif',"brut","regime","preavis"]},
    {code:'C4-RCC',l:"C4 Prépension (RCC)",f:['motif',"brut","date_rcc"]},
    {code:'C4-ENS',l:"C4 Enseignement",f:['motif',"etablissement"]},
    {code:'C3.2-CD',l:"C3.2 Constat du droit",f:['regime',"heures"]},
    {code:'C3.2-OUV',l:"C3.2 Employeur → Ouvriers",f:['jours',"motif"]},
    {code:'C3.2-EMP',l:"C3.2 Anti-crise → Employés",f:['jours',"motif"]},
    {code:'C131A',l:"C131A Employeur",f:['debut',"motif","regime"]},
    {code:'C131B',l:"C131B",f:['debut',"regime"]},
    {code:'C131A-E',l:"C131A Enseignement",f:['debut',"etablissement"]},
    {code:'C131B-E',l:"C131B Enseignement",f:['debut']},
    {code:'C78-ACT-BXL',l:"C78 Activa.brussels (Actiris)",f:['type_activa',"debut","duree","montant_red"]},
    {code:'C78-ACT-WAL',l:"C78 Impulsion -12/-25 mois (FOREM)",f:['type_impulsion',"debut","duree","montant_red"]},
    {code:'C78-ACT-VL',l:"C78 Werkplekleren / Winwin (VDAB)",f:['type_vl',"debut","duree"]},
    {code:'C78-TRANS',l:"C78 Prime de transition (Bruxelles)",f:['debut',"duree","montant"]},
    {code:'C78-START',l:"C78 Activa Start (<26 ans)",f:['debut',"duree","age"]},
    {code:'C78-ETA',l:"C78 E.T.A. (Entreprise Travail Adapté)",f:['type',"debut","pct_prime"]},
    {code:'C78-ART60',l:"C78 Article 60§7 (CPAS)",f:['cpas',"debut","fin","type_art60","subsides"]},
    {code:'C78-ART61',l:"C78 Article 61 (CPAS mise à dispo)",f:['cpas',"debut","fin"]},
    {code:'C78-SINE',l:"C78 SINE (Économie sociale insertion)",f:['debut',"duree","agrément"]},
    {code:'C78.3',l:"C78.3 P.T.P. (Programme Transition Pro)",f:['debut',"heures","org_encadrement"]},
    {code:'C78-SEC',l:"C78 Sécurité & prévention",f:['debut',"fonction"]},
    {code:'C78-FIRST',l:"C78 Stage First / FPI (Actiris/FOREM)",f:['debut',"duree","indemnite"]},
    {code:'C78-FORM',l:"C78 Contrat de formation (IFAPME/EFP)",f:['debut',"duree","centre"]},
    {code:'C78-HAND',l:"C78 Prime handicap (AVIQ/PHARE/VDAB)",f:['debut',"organisme","pct_prime"]},
    {code:'C103-JE',l:"C103 Jeunes Employeur",f:['debut',"age"]},
    {code:'C103-JT',l:"C103 Jeunes Travailleur",f:['debut',"age"]},
    {code:'C103-SE',l:"C103 Seniors Employeur",f:['debut',"age"]},
    {code:'C103-ST',l:"C103 Seniors Travailleur",f:['debut',"age"]},
  ],
  inami:[
    {code:'IN-MAL',l:"Incapacité — Maladie/Accident",f:['debut',"fin","diagnostic"]},
    {code:'IN-MAT',l:"Repos de maternité",f:['accouchement',"debut","fin"]},
    {code:'IN-EC',l:"Écartement complet maternité",f:['debut',"fin"]},
    {code:'IN-EP',l:"Écartement partiel maternité",f:['debut',"fin","heures"]},
    {code:'IN-CONV',l:"Maternité/Paternité converti",f:['debut',"fin"]},
    {code:'IN-NAIS',l:"Congé naissance (10j)",f:['naissance',"debut"]},
    {code:'IN-ADOP',l:"Congé adoption",f:['debut',"fin"]},
    {code:'IN-REP',l:"Reprise partielle travail",f:['debut',"heures"]},
    {code:'IN-PROT',l:"Protection maternité",f:['debut',"fin"]},
    {code:'IN-2EMP',l:"2 employeurs différents",f:['debut',"employeur2"]},
    {code:'IN-ALL',l:"Allaitement — Pauses",f:['debut',"nb_pauses"]},
    {code:'VAC-C',l:"Vacances annuelles (caisse)",f:['annee',"jours"]},
    {code:'VAC-E',l:"Vacances annuelles (employeur)",f:['annee',"jours","montant"]},
    {code:'IN-REPR',l:"Reprise du travail",f:['date_reprise']},
  ],
  papier:[
    {code:'C4-P',l:"C4 DRS (papier)",f:['motif']},
    {code:'C4-RCC-P',l:"C4 DRS-RCC (papier)",f:['motif']},
    {code:'ATT-PV',l:"Attestation Pécules de vacances",f:['annee',"simple","double"]},
    {code:'ATT-TRAV',l:"Attestation de travail",f:['debut',"fin","fonction"]},
    {code:'ATT-276',l:"Attestation 276 frontaliers",f:['pays',"annee"]},
  ],
};
const COMPTA=[{id:"bob",n:'BOB Software',fmt:'CSV/XML'},{id:"winbooks",n:'Winbooks',fmt:'TXT/CSV'},{id:"kluwer",n:'Kluwer Expert',fmt:'CSV'},{id:"popsy",n:'Popsy',fmt:'TXT'},{id:"soda",n:'Soda',fmt:'CSV'},{id:"exact",n:'Exact Online',fmt:'CSV/XML'},{id:"octopus",n:'Octopus',fmt:'CSV'},{id:"clearfact",n:'ClearFact',fmt:'CSV/UBL'},{id:"yuki",n:'Yuki',fmt:'XML'},{id:"horus",n:'Horus',fmt:'CSV'},{id:"other",n:'Autre (txt/xls)',fmt:'TXT/XLS'}];
const CR_PROV=[{id:"pluxee",n:'Pluxee (ex-Sodexo)',ic:'🟠'},{id:"edenred",n:'Edenred',ic:'🔴'},{id:"monizze",n:'Monizze',ic:'🟢'},{id:"got",n:'G.O.T. CONNECTION',ic:'🔵'}];

// ═══════════════════════════════════════════════════════════════
//  SOUS-NAVIGATION — Breadcrumb + bouton retour + onglets
// ═══════════════════════════════════════════════════════════════
function SubNav({parentId,parentLabel,subs,activeSub,d}){
  return <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,padding:'8px 12px',background:'rgba(198,163,78,.03)',border:'1px solid rgba(198,163,78,.08)',borderRadius:10,flexWrap:'wrap'}}>
    <button onClick={()=>d({type:"NAV",page:parentId,sub:subs[0]?.id||null})} style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',borderRadius:6,border:'none',background:'rgba(198,163,78,.1)',color:'#c6a34e',fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}} title="Retour">
      ← {parentLabel}
    </button>
    <span style={{color:'#5e5c56',fontSize:11}}>›</span>
    {subs.map(sb=><button key={sb.id} onClick={()=>d({type:"NAV",page:parentId,sub:sb.id})} style={{padding:'5px 12px',borderRadius:6,border:'none',cursor:'pointer',fontSize:11,fontWeight:activeSub===sb.id?600:400,fontFamily:'inherit',background:activeSub===sb.id?'rgba(198,163,78,.12)':'transparent',color:activeSub===sb.id?'#c6a34e':'#9e9b93',transition:'all .1s'}}>{sb.l}</button>)}
  </div>;
}

// ═══════════════════════════════════════════════════════════════
//  CATEGORY ROUTER PAGES
// ═══════════════════════════════════════════════════════════════
function SalairesPage({s,d}){const sub=s.sub||'od';const _subs=[{id:"simcout",l:"Simulation coût"},{id:"netbrut",l:"Net → Brut"},{id:"provisions",l:"Provisions"},{id:"cumuls",l:"Cumuls"},{id:"indexauto",l:"Indexation"},{id:"treizieme",l:"13ème mois"},{id:"bonusemploi",l:"Bonus emploi"}];return <div>
  <SubNav parentId="salaires" parentLabel="Salaires" subs={_subs} activeSub={sub} d={d}/>
  <PH title="Salaires & Calculs" sub={`Module: ${{'od':'O.D. Comptables',"provisions":'Provisions',"cumuls":'Cumuls annuels',"netbrut":'Net → Brut',"simcout":'Simulation coût salarial',"saisies":'Saisies-Cessions',"indexauto":'Index automatique',"horsforfait":'Heures supplémentaires',"totalreward":'Total Reward Statement',"transport":'Transport domicile-travail',"treizieme":'13ème mois',"css":'Cotisation spéciale SS',"bonusemploi":'Bonus à l\'emploi'}[sub]||sub}`}/>
    <div style={{marginBottom:14,padding:'10px 14px',background:'linear-gradient(135deg,rgba(198,163,78,.06),rgba(198,163,78,.02))',border:'1px solid rgba(198,163,78,.1)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{fontSize:11,color:'#888'}}>⚡ SEPA + Fiches auto-générés le jour de paie</div>
      <div style={{display:'flex',gap:6}}>
        <button onClick={()=>{if(confirm('Générer SEPA ?')){generateSEPAXML(s.emps||[],s.co);alert('✅ SEPA généré')}}} style={{padding:'6px 12px',borderRadius:8,border:'none',background:'#22c55e',color:'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>💸 SEPA</button>
        <button onClick={()=>{if(confirm('Générer fiches ?')){(s.emps||[]).forEach(e=>generatePayslipPDF(e,s.co));alert('✅ Fiches générées')}}} style={{padding:'6px 12px',borderRadius:8,border:'none',background:'#c6a34e',color:'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>📄 Fiches</button>
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

function AvantagesPage({s,d}){const sub=s.sub||'cheques';const _subs=[{id:"cheques",l:"Chèques-repas"},{id:"ecochequesv2",l:"Eco-chèques"},{id:"plancafeteria",l:"Plan Cafeteria"},{id:"cct90bonus",l:"Bonus CCT 90"},{id:"notefraisv2",l:"Notes de frais"},{id:"warrants",l:"Warrants"},{id:"budgetmob",l:"Budget mobilité"}];return <div>
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

function ContratsMenuPage({s,d}){const sub=s.sub||'contrats';const _subs=[{id:"contrats",l:"Contrats"},{id:"reglement",l:"Règlement"},{id:"preavis",l:"Préavis"},{id:"pecsortie",l:"Pécule sortie"}];return <div>
  <SubNav parentId="contratsmenu" parentLabel="Contrats" subs={_subs} activeSub={sub} d={d}/>
  {sub==='contrats'&&<ContratsTravailModLazy s={s} d={d}/>}
  {sub==='reglement'&&<ReglementTravailModLazy s={s} d={d}/>}
  {sub==='preavis'&&<PreavisModLazy s={s} d={d}/>}
  {sub==='pecsortie'&&<PeculeSortieModLazy s={s} d={d}/>}
</div>;}

function RHPage({s,d}){const sub=s.sub||'absences';const _subs=[{id:"wf_embauche",l:"Embauche"},{id:"wf_licenciement",l:"Licenciement"},{id:"wf_maladie",l:"Maladie"},{id:"absences",l:"Absences"},{id:"credittemps",l:"Crédit-temps"},{id:"pointage",l:"Pointage"},{id:"medtravail",l:"Médecine"}];return <div>
  <SubNav parentId="rh" parentLabel="RH & Workflows" subs={_subs} activeSub={sub} d={d}/>
  <PH title="RH & Personnel" sub={`Module: ${{'wf_embauche':'⚡ Workflow Embauche','wf_licenciement':'⚡ Workflow Licenciement','wf_maladie':'⚡ Workflow Maladie','absences':'Gestion absences',"absenteisme":'Analyse absentéisme',"credittemps":'Crédit-temps',"chomtemp":'Chômage temporaire',"congeduc":'Congé-éducation payé',"rcc":'RCC / Prépension',"outplacement":'Outplacement',"pointage":'Pointage & Portail Employeur',"planform":'Plan de formation',"medtravail":'Médecine du travail',"selfservice":'Portail travailleur',"promesseembauche":'📄 Promesse d\'Embauche'}[sub]||sub}`}/>
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

function ReportingPage({s,d}){const sub=s.sub||'accounting';const _subs=[{id:"accounting",l:"Comptabilité"},{id:"bilanbnb",l:"Bilan BNB"},{id:"sepa",l:"SEPA"},{id:"envoi",l:"Envoi docs"},{id:"ged",l:"GED"}];return <div>
  <SubNav parentId="reporting" parentLabel="Reporting" subs={_subs} activeSub={sub} d={d}/>
  <PH title="Reporting & Export" sub={`Module: ${{'accounting':'Accounting Output',"bilanbnb":'Bilan Social BNB',"bilan":'Bilan Social',"statsins":'Statistiques INS',"sepa":'SEPA / Virements',"peppol":'PEPPOL e-Invoicing',"envoi":'Envoi documents',"exportimport":'Export / Import',"ged":'GED / Archivage'}[sub]||sub}`}/>
    <div style={{marginBottom:14,padding:'10px 14px',background:'linear-gradient(135deg,rgba(168,85,247,.06),rgba(168,85,247,.02))',border:'1px solid rgba(168,85,247,.1)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{fontSize:11,color:'#888'}}>⚡ Exports auto: DmfA + SEPA + Belcotax en 1 clic</div>
      <div style={{display:'flex',gap:6}}>
        <button onClick={()=>{if(confirm('Générer DmfA ?')){generateDmfAXML(s.emps||[],Math.ceil((new Date().getMonth()+1)/3),new Date().getFullYear(),s.co);alert('✅ DmfA générée')}}} style={{padding:'6px 12px',borderRadius:8,border:'none',background:'#a855f7',color:'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>📊 DmfA</button>
        <button onClick={()=>{if(confirm('Générer SEPA ?')){generateSEPAXML(s.emps||[],s.co);alert('✅ SEPA généré')}}} style={{padding:'6px 12px',borderRadius:8,border:'none',background:'#22c55e',color:'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>💸 SEPA</button>
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
    <PH title="Modules Pro" sub="47 modules — La Rolls Royce du secrétariat social"/>
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
  // Pension alimentaire = saisissable en TOTALITÉ (art. 1412 CJ)
  if(isPensionAlim)return{saisissable:netMensuel,protege:0,tranches:[],enfantImmun:0,note:"Créance alimentaire: saisissable en totalité (art. 1412 CJ)"};
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
  // Immunisation enfants à charge
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




// ═══════════════════════════════════════════════════════════════
//  SECTEURS SPÉCIFIQUES (Hôpitaux, Construction, Ateliers, IMP)
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  ACCOUNTING OUTPUT — Récapitulatif comptable pour le comptable
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  WORKFLOW EMBAUCHE — Checklist complète onboarding
// ═══════════════════════════════════════════════════════════════
function exportSimulation(){var sb=document.getElementById("sb");if(sb)sb.style.display="none";var el=document.querySelector("main")||document.body;var w=window.open("","_blank");w.document.write("<html><head><title>Aureus Social Pro</title><style>body{font-family:Arial,sans-serif;padding:30px;max-width:900px;margin:auto;color:#1a1a1a}h1,h2,h3{color:#c6a34e}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{padding:6px 10px;border:1px solid #e5e5e5;font-size:12px}</style></head><body>"+el.innerHTML+"</body></html>");w.document.close();w.print();if(sb)sb.style.display="";}function emailSimulation(t,e){if(e){window.location.href="mailto:"+e+"?subject="+encodeURIComponent(t);}}
function sendSimulationPDF(simData,clientEmail){var d=simData||{};var brut=+(d.brut||0);var onssP=Math.round(brut*TX_ONSS_E*100)/100;var assAT=Math.round(brut*TX_AT*100)/100;var med=COUT_MED;var cr=+(d.cheqRepas||130.02);var coutMens=Math.round((brut+onssP+assAT+med+cr)*100)/100;var nb=+(d.nb||1);var dur=+(d.duree||12);var coutTotal=Math.round(coutMens*nb*100)/100;var coutAn=Math.round(coutMens*nb*dur*100)/100;var onssE=Math.round(brut*TX_ONSS_W*100)/100;var pp=quickPP(brut);var net=Math.round((brut-onssE-pp)*100)/100;var ratio=brut>0?Math.round(net/coutMens*100):0;var f2=function(v){return new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0)};var coName=d.coName||"Aureus IA SPRL";var body='<div class="doc-title">SIMULATION COÛT SALARIAL</div><div class="doc-subtitle">Estimation basée sur les barèmes en vigueur</div>';body+='<div class="kpi-grid"><div class="kpi-card"><div class="kpi-val">'+f2(brut)+' €</div><div class="kpi-lab">Brut mensuel</div></div><div class="kpi-card"><div class="kpi-val">'+f2(coutMens)+' €</div><div class="kpi-lab">Coût mensuel/pers.</div></div><div class="kpi-card"><div class="kpi-val">'+f2(coutAn)+' €</div><div class="kpi-lab">Coût sur '+dur+' mois</div></div><div class="kpi-card"><div class="kpi-val">'+ratio+'%</div><div class="kpi-lab">Ratio net/coût</div></div></div>';body+='<h2 class="article-title">Décomposition coût employeur</h2><table class="doc-table"><thead><tr><th>Élément</th><th style="text-align:right">Montant</th></tr></thead><tbody><tr><td>Salaire brut</td><td style="text-align:right">'+f2(brut)+' €</td></tr><tr><td>ONSS patronal (25,07%)</td><td style="text-align:right">'+f2(onssP)+' €</td></tr><tr><td>Assurance accident travail (1%)</td><td style="text-align:right">'+f2(assAT)+' €</td></tr><tr><td>Médecine du travail</td><td style="text-align:right">'+f2(med)+' €</td></tr><tr><td>Chèques-repas</td><td style="text-align:right">'+f2(cr)+' €</td></tr><tr class="total-row"><td>COÛT par personne</td><td style="text-align:right">'+f2(coutMens)+' €</td></tr><tr class="total-row"><td>COÛT TOTAL ('+nb+' pers.)</td><td style="text-align:right">'+f2(coutTotal)+' €</td></tr></tbody></table>';body+='<h2 class="article-title">Net employé</h2><table class="doc-table"><thead><tr><th>Élément</th><th style="text-align:right">Montant</th></tr></thead><tbody><tr><td>Rémunération brute</td><td style="text-align:right">'+f2(brut)+' €</td></tr><tr><td>Cotisations ONSS (-13,07%)</td><td style="text-align:right">- '+f2(onssE)+' €</td></tr><tr><td>Précompte professionnel</td><td style="text-align:right">- '+f2(pp)+' €</td></tr><tr class="total-row"><td>NET</td><td style="text-align:right">'+f2(net)+' €</td></tr></tbody></table>';body+='<div class="ref-legal">Estimation indicative — Les montants définitifs dépendent de la situation personnelle du travailleur et des dispositions sectorielles applicables.</div>';var html=aureusDocHTML('Simulation coût salarial — '+f2(brut)+' EUR',body,{name:coName});openForPDF(html,'Simulation_'+brut+'EUR');if(clientEmail){var subject=encodeURIComponent("Simulation cout salarial - "+f2(brut)+" EUR");var emailBody=encodeURIComponent("Bonjour,\n\nSimulation:\n- Brut: "+f2(brut)+" EUR\n- Cout employeur: "+f2(coutMens)+" EUR/mois\n- Net estime: "+f2(net)+" EUR\n- Ratio: "+ratio+"%\n\nCordialement,\n"+coName);setTimeout(function(){window.location.href="mailto:"+clientEmail+"?subject="+subject+"&body="+emailBody},600)}}
function generateAttestationEmploi(emp,co){var coName=co?.name||"Aureus IA SPRL";var coVAT=co?.vat||"BE 1028.230.781";var name=(emp.first||emp.fn||"")+" "+(emp.last||emp.ln||"");var f2=function(v){return new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0)};var body='<div class="doc-title">ATTESTATION D\'EMPLOI</div><div class="doc-subtitle">Délivrée conformément à la législation sociale belge</div>';body+='<div class="article-body" style="margin:20px 0"><p>La société <strong>'+coName+'</strong> ('+coVAT+') atteste par la présente que :</p></div>';body+='<div class="parties"><div class="party-box"><div class="party-title">Travailleur</div><div class="party-row"><b>Nom :</b> '+escapeHtml(name)+'</div><div class="party-row"><b>NISS :</b> '+(emp.niss||"N/A")+'</div><div class="party-row"><b>Fonction :</b> '+(emp.function||emp.job||"employé")+'</div></div><div class="party-box"><div class="party-title">Conditions d\'emploi</div><div class="party-row"><b>Date d\'entrée :</b> '+(emp.startDate||emp.start||"N/A")+'</div><div class="party-row"><b>Type de contrat :</b> '+(emp.contractType||"CDI")+'</div><div class="party-row"><b>Régime :</b> '+(emp.whWeek||38)+'h/semaine</div><div class="party-row"><b>Rémunération brute :</b> '+f2(+(emp.monthlySalary||emp.gross||0))+' EUR/mois</div></div></div>';body+='<div class="article-body" style="margin:20px 0"><p>La présente attestation est délivrée pour servir et valoir ce que de droit.</p></div>';body+='<div class="signature-block"><div class="sig-box"><div class="sig-line">L\'Employeur</div><div class="sig-mention">Précédé de la mention « Lu et approuvé »</div></div><div class="sig-box"><div class="sig-line">Le Travailleur</div><div class="sig-mention">Précédé de la mention « Lu et approuvé »</div></div></div>';var html=aureusDocHTML('Attestation d\'emploi — '+name,body,co);openForPDF(html,'Attestation_emploi_'+name);}
function generateAttestationSalaire(emp,co){var coName=co?.name||"Aureus IA SPRL";var name=(emp.first||emp.fn||"")+" "+(emp.last||emp.ln||"");var brut=+(emp.monthlySalary||emp.gross||0);var onss=Math.round(brut*TX_ONSS_W*100)/100;var pp=quickPP(brut);var net=Math.round((brut-onss-pp)*100)/100;var f2=function(v){return new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0)};var body='<div class="doc-title">ATTESTATION DE RÉMUNÉRATION</div><div class="doc-subtitle">Conformément à la Loi du 12 avril 1965 concernant la protection de la rémunération</div>';body+='<div class="article-body" style="margin:20px 0"><p>La société <strong>'+coName+'</strong> certifie que <strong>'+escapeHtml(name)+'</strong> perçoit la rémunération suivante :</p></div>';body+='<table class="doc-table"><thead><tr><th>Élément</th><th style="text-align:right">Mensuel</th><th style="text-align:right">Annuel</th></tr></thead><tbody><tr><td>Rémunération brute</td><td style="text-align:right">'+f2(brut)+' €</td><td style="text-align:right">'+f2(brut*12)+' €</td></tr><tr><td>Cotisations ONSS (13,07%)</td><td style="text-align:right">- '+f2(onss)+' €</td><td style="text-align:right">- '+f2(onss*12)+' €</td></tr><tr><td>Précompte professionnel</td><td style="text-align:right">- '+f2(pp)+' €</td><td style="text-align:right">- '+f2(pp*12)+' €</td></tr><tr class="total-row"><td>Rémunération nette</td><td style="text-align:right">'+f2(net)+' €</td><td style="text-align:right">'+f2(net*12)+' €</td></tr></tbody></table>';body+='<div class="article-body" style="margin:20px 0"><p>La présente attestation est délivrée pour servir et valoir ce que de droit.</p></div>';body+='<div class="signature-block"><div class="sig-box"><div class="sig-line">L\'Employeur</div><div class="sig-mention">Précédé de la mention « Lu et approuvé »</div></div><div class="sig-box"><div class="sig-line">Le Travailleur</div><div class="sig-mention">Précédé de la mention « Lu et approuvé »</div></div></div>';var html=aureusDocHTML('Attestation de rémunération — '+name,body,co);openForPDF(html,'Attestation_salaire_'+name);}
function generateSoldeCompte(emp,co){var coName=co?.name||"Aureus IA SPRL";var name=(emp.first||emp.fn||"")+" "+(emp.last||emp.ln||"");var brut=+(emp.monthlySalary||emp.gross||0);var f2=function(v){return new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0)};var pro=Math.round(brut*15/22*100)/100;var pec=Math.round(brut*PV_SIMPLE*100)/100;var pre=brut;var tot=pro+pec+pre;var onss=Math.round(tot*TX_ONSS_W*100)/100;var pp=quickPP(tot);var net=Math.round((tot-onss-pp)*100)/100;var body='<div class="doc-title">SOLDE DE TOUT COMPTE</div><div class="doc-subtitle">Décompte de clôture — Art. 39 Loi du 3 juillet 1978</div>';body+='<div class="parties"><div class="party-box"><div class="party-title">Employeur</div><div class="party-row"><b>'+coName+'</b></div></div><div class="party-box"><div class="party-title">Travailleur</div><div class="party-row"><b>'+escapeHtml(name)+'</b></div><div class="party-row">NISS : '+(emp.niss||"N/A")+'</div></div></div>';body+='<table class="doc-table"><thead><tr><th>Élément</th><th style="text-align:right">Montant</th></tr></thead><tbody><tr><td>Prorata de rémunération</td><td style="text-align:right">'+f2(pro)+' €</td></tr><tr><td>Pécule de vacances de sortie</td><td style="text-align:right">'+f2(pec)+' €</td></tr><tr><td>Indemnité compensatoire de préavis</td><td style="text-align:right">'+f2(pre)+' €</td></tr><tr class="total-row"><td>Total brut</td><td style="text-align:right">'+f2(tot)+' €</td></tr><tr><td>Cotisations ONSS (13,07%)</td><td style="text-align:right">- '+f2(onss)+' €</td></tr><tr><td>Précompte professionnel</td><td style="text-align:right">- '+f2(pp)+' €</td></tr><tr class="total-row"><td>MONTANT NET À PAYER</td><td style="text-align:right">'+f2(net)+' €</td></tr></tbody></table>';body+='<div class="article-body" style="margin:20px 0"><p>Le travailleur déclare avoir reçu l\'intégralité des sommes qui lui sont dues au titre de l\'exécution et de la cessation de son contrat de travail et n\'avoir plus rien à réclamer à ce titre.</p><p><strong>Pour solde de tout compte.</strong></p></div>';body+='<div class="ref-legal">Réf. légale : Art. 39 et 40 de la Loi du 3 juillet 1978 — Loi du 12 avril 1965 sur la protection de la rémunération</div>';body+='<div class="signature-block"><div class="sig-box"><div class="sig-line">L\'Employeur</div><div class="sig-mention">Précédé de la mention « Lu et approuvé »</div></div><div class="sig-box"><div class="sig-line">Le Travailleur</div><div class="sig-mention">Précédé de la mention « Lu et approuvé »</div></div></div>';var html=aureusDocHTML('Solde de tout compte — '+name,body,co);openForPDF(html,'Solde_'+name);}
function getAlertes(emps,co){
  const now=new Date();const alerts=[];
  emps.forEach(e=>{
    const name=(e.first||e.fn||'')+" "+(e.last||e.ln||'');
    if(e.contractEnd||e.endDate){const end=new Date(e.contractEnd||e.endDate);const diff=Math.ceil((end-now)/(1000*60*60*24));if(diff>0&&diff<=30)alerts.push({type:"cdd",level:"warning",icon:"📋",msg:"CDD "+name+" expire dans "+diff+" jours ("+end.toLocaleDateString("fr-BE")+")",days:diff});if(diff<=0&&diff>-7)alerts.push({type:"cdd",level:"danger",icon:"🚨",msg:"CDD "+name+" EXPIRE! ("+end.toLocaleDateString("fr-BE")+")",days:diff});}
    if(e.lastMedical||e.medicalDate){const med=new Date(e.lastMedical||e.medicalDate);const diff=Math.ceil((now-med)/(1000*60*60*24));if(diff>335)alerts.push({type:"medical",level:diff>365?"danger":"warning",icon:"🏥",msg:"Visite medicale "+name+" : "+(diff>365?"DEPASSEE":"dans "+(365-diff)+"j")+" (derniere: "+med.toLocaleDateString("fr-BE")+")",days:diff});}
    if(e.startDate||e.start){const start=new Date(e.startDate||e.start);const diff=Math.ceil((now-start)/(1000*60*60*24));if(diff>=0&&diff<=7)alerts.push({type:"onboard",level:"info",icon:"👋",msg:"Nouvel employe "+name+" - onboarding en cours (J+"+diff+")",days:diff});}
    if(!e.niss&&(e.status==="active"||!e.status))alerts.push({type:"niss",level:"danger",icon:"⚠️",msg:"NISS manquant pour "+name,days:0});
    if(!e.iban&&(e.status==="active"||!e.status))alerts.push({type:"iban",level:"warning",icon:"🏦",msg:"IBAN manquant pour "+name,days:0});
    if(e.status==="active"||!e.status){const brut=+(e.monthlySalary||e.gross||0);if(brut>0&&brut<2029.88)alerts.push({type:"rmmmg",level:"warning",icon:"💰",msg:name+" sous le RMMMG ("+brut.toFixed(2)+" < 2.029,88 EUR)",days:0});}
  });
  const d=now.getDate();const m=now.getMonth()+1;
  if(d<=5)alerts.push({type:"deadline",level:"info",icon:"📅",msg:"Avant le 5: encodage prestations du mois",days:5-d});
  if(m===1||m===4||m===7||m===10){if(d<=15)alerts.push({type:"deadline",level:"warning",icon:"📤",msg:"Trimestre: DmfA a envoyer avant le "+((m===1||m===7)?31:30)+"/"+String(m).padStart(2,"0"),days:15-d});}
  return alerts.sort((a,b)=>a.level==="danger"?-1:b.level==="danger"?1:a.level==="warning"?-1:1);
}
function generateBelcotaxXML(emps,year,co){var coName=co?.name||"Aureus IA SPRL";var coVAT=(co?.vat||"1028230781").replace(/[^0-9]/g,"");var ae=emps.filter(function(e){return e.status==="active"||!e.status});var f2=function(v){return(Math.round(v*100)/100).toFixed(2)};var fiches=ae.map(function(e,i){var brut=+(e.monthlySalary||e.gross||0)*12;var onss=Math.round(brut*TX_ONSS_W*100)/100;var imp=brut-onss;var pp=quickPP(brut/12)*12;var net=Math.round((brut-onss-pp)*100)/100;var niss=(e.niss||"").replace(/[^0-9]/g,"");return"<Fiche281_10 seq=\""+(i+1)+"\"><Worker><INSS>"+niss+"</INSS><Name>"+(e.first||e.fn||"")+" "+(e.last||e.ln||"")+"</Name></Worker><Income><GrossRemuneration>"+f2(brut)+"</GrossRemuneration><SocialContributions>"+f2(onss)+"</SocialContributions><TaxableIncome>"+f2(imp)+"</TaxableIncome><WithholdingTax>"+f2(pp)+"</WithholdingTax><NetRemuneration>"+f2(net)+"</NetRemuneration></Income></Fiche281_10>"}).join("");var xml="<?xml version=\"1.0\" encoding=\"UTF-8\"?><Belcotax><Declarant><CompanyID>"+coVAT+"</CompanyID><Name>"+coName+"</Name><TaxYear>"+(year||2025)+"</TaxYear><IncomeYear>"+((year||2025)-1)+"</IncomeYear><NbFiches>"+ae.length+"</NbFiches></Declarant>"+fiches+"</Belcotax>";var blob=new Blob([xml],{type:"application/octet-stream"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="Belcotax_281_10_"+(year||2025)+".xml";document.body.appendChild(a);a.click();setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},3000);}
function generateDmfAXML(emps,trimestre,year,co){var coName=co?.name||"Aureus IA SPRL";var coVAT=(co?.vat||"1028230781").replace(/[^0-9]/g,"");var ae=emps.filter(function(e){return e.status==="active"||!e.status});var f2=function(v){return(Math.round(v*100)/100).toFixed(2)};var totalBrut=ae.reduce(function(a,e){return a+(+(e.monthlySalary||e.gross||0))*3},0);var totalONSS=Math.round(totalBrut*(TX_ONSS_W+TX_ONSS_E)*100)/100;var workers=ae.map(function(e){var brut3=(+(e.monthlySalary||e.gross||0))*3;var onss=Math.round(brut3*TX_ONSS_W*100)/100;var onssE=Math.round(brut3*TX_ONSS_E*100)/100;return"<WorkerRecord><INSS>"+(e.niss||"").replace(/[^0-9]/g,"")+"</INSS><Name>"+(e.first||e.fn||"")+" "+(e.last||e.ln||"")+"</Name><Category>"+(e.statut==="ouvrier"?"BC":"WC")+"</Category><JointCommittee>"+(e.cp||co?.cp||"200")+"</JointCommittee><GrossQuarter>"+f2(brut3)+"</GrossQuarter><WorkerONSS>"+f2(onss)+"</WorkerONSS><EmployerONSS>"+f2(onssE)+"</EmployerONSS></WorkerRecord>"}).join("");var xml="<?xml version=\"1.0\" encoding=\"UTF-8\"?><DmfAMessage><Header><Sender><CompanyID>"+coVAT+"</CompanyID><Name>"+coName+"</Name></Sender><Reference>DMFA-"+(year||2026)+"-Q"+(trimestre||1)+"</Reference><Quarter>"+(trimestre||1)+"</Quarter><Year>"+(year||2026)+"</Year></Header><Employer><CompanyID>"+coVAT+"</CompanyID><Name>"+coName+"</Name><NbWorkers>"+ae.length+"</NbWorkers><TotalGross>"+f2(totalBrut)+"</TotalGross><TotalONSS>"+f2(totalONSS)+"</TotalONSS>"+workers+"</Employer><Footer><TotalDue>"+f2(totalONSS)+"</TotalDue></Footer></DmfAMessage>";var blob=new Blob([xml],{type:"application/octet-stream"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="DmfA_Q"+(trimestre||1)+"_"+(year||2026)+".xml";document.body.appendChild(a);a.click();setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},3000);}
function generateC4PDF(emp,co){const coName=co?.name||"Aureus IA SPRL";const coVAT=co?.vat||"BE 1028.230.781";const name=(emp.first||emp.fn||"")+" "+(emp.last||emp.ln||"");const niss=emp.niss||"";const start=emp.startDate||emp.start||"";const end=emp.endDate||emp.contractEnd||new Date().toISOString().slice(0,10);const brut=+(emp.monthlySalary||emp.gross||0);const f2=v=>new Intl.NumberFormat("fr-BE",{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);var body='<div class="doc-title">CERTIFICAT DE CHÔMAGE C4</div><div class="doc-subtitle">Formulaire C4 — Conformément à l\'Arrêté ministériel du 26/11/1991</div>';body+='<h2 class="article-title">1. Employeur</h2><div class="parties"><div class="party-box" style="flex:1"><div class="party-row"><b>Dénomination :</b> '+coName+'</div><div class="party-row"><b>N° BCE :</b> '+coVAT+'</div><div class="party-row"><b>Commission paritaire :</b> '+(emp.cp||co?.cp||"200")+'</div></div></div>';body+='<h2 class="article-title">2. Travailleur</h2><div class="parties"><div class="party-box" style="flex:1"><div class="party-row"><b>Nom et prénom :</b> '+escapeHtml(name)+'</div><div class="party-row"><b>NISS :</b> '+niss+'</div><div class="party-row"><b>Statut :</b> '+(emp.statut||"Employé")+'</div></div></div>';body+='<h2 class="article-title">3. Occupation</h2><table class="doc-table"><tbody><tr><td><b>Date de début</b></td><td>'+start+'</td></tr><tr><td><b>Date de fin</b></td><td>'+end+'</td></tr><tr><td><b>Régime de travail</b></td><td>'+(emp.whWeek||38)+' heures/semaine</td></tr><tr><td><b>Rémunération brute</b></td><td>'+f2(brut)+' EUR/mois</td></tr></tbody></table>';body+='<h2 class="article-title">4. Motif de la fin de contrat</h2><table class="doc-table"><tbody><tr><td><b>Motif</b></td><td>'+(emp.endReason||"Fin de contrat à durée déterminée")+'</td></tr><tr><td><b>Initiative</b></td><td>'+(emp.endInitiative||"Employeur")+'</td></tr></tbody></table>';body+='<div class="ref-legal">Réf. légale : Arrêté royal du 25/11/1991 — Arrêté ministériel du 26/11/1991 — Art. 137 de l\'Arrêté royal du 25/11/1991</div>';body+='<div class="signature-block"><div class="sig-box"><div class="sig-line">Signature employeur</div><div class="sig-mention">Cachet de l\'entreprise</div></div><div class="sig-box"><div class="sig-line">Signature travailleur</div><div class="sig-mention">Précédé de la mention « Lu et approuvé »</div></div></div>';var html=aureusDocHTML('Certificat C4 — '+name,body,co);openForPDF(html,'C4_'+name);}
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
  // Détection d'arguments décalés: generatePayslipPDF(emp,co) au lieu de (emp,r,period,co)
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
    <div class="info-row"><span class="info-label">Fonction:</span><span class="info-value">${emp.function||emp.job||'Employé'}</span></div>
    <div class="info-row"><span class="info-label">Statut:</span><span class="info-value">${emp.statut||'Employé'}</span></div>
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
    <tr><td>Précompte professionnel</td><td class="right">${f2(imposable)}</td><td class="right">${imposable>0?(pp/imposable*100).toFixed(1)+'%':'-'}</td><td class="right" style="color:#c0392b">-${f2(pp)}</td></tr>
    <tr><td>Cotisation spéciale securite sociale</td><td class="right">-</td><td class="right">Bareme</td><td class="right" style="color:#c0392b">-${f2(csss)}</td></tr>
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
    <div class="info-row"><span class="info-label">Coût total employeur:</span><span class="info-value" style="color:#c6a34e;font-weight:800">${f2(coutTotal)}</span></div>
  </div>
</div>
${mealV>0?`<div style="margin-top:6px;font-size:10px;color:#666">Cheques-repas: ${emp.mealVoucher||0} x 22j = ${f2(mealV)} EUR (part patronale ${f2((emp.mealVoucher||0)*22*0.83)})</div>`:''}
<div class="footer">
  <span>Généré par Aureus Social Pro | ${coName} | ${coVAT}</span>
  <span>Date edition: ${new Date().toLocaleDateString('fr-BE')}</span>
</div>
<div style="text-align:center;margin-top:15px"><button onclick="window.print()" style="background:#c6a34e;color:#fff;border:none;padding:10px 30px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600">Imprimer / Sauvegarder PDF</button></div>
</body></html>`);
  w.document.close();
  }catch(err){alert('Erreur génération fiche: '+err.message);console.error(err);}
}

// ═══ UNIVERSAL FILE HELPERS (Sprint 24 fix) ═══
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
    alert('Erreur téléchargement: ' + err.message);
    return false;
  }
}

function openForPDF(html, title) {
  if (!html || typeof html !== 'string') { alert('Document indisponible.'); return; }
  
  // Wrap HTML with Aureus branding if not already branded
  var brandedHtml = html;
  if (html.indexOf('aureus-branded-doc') === -1) {
    var coInfo = '';
    try { coInfo = (window.__aureusCoName || 'Aureus IA SPRL') + ' — BCE BE 1028.230.781'; } catch(e) { coInfo = 'Aureus IA SPRL — BCE BE 1028.230.781'; }
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
  btnPDF.textContent = '📄 Télécharger PDF';
  btnPDF.style.cssText = 'padding:10px 24px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;background:#c6a34e;color:#060810;transition:opacity .2s';
  btnPDF.onclick = async function() {
    btnPDF.textContent = '⏳ Génération PDF...';
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
      btnPDF.textContent = '✅ PDF téléchargé !';
      btnPDF.style.opacity = '1';
      setTimeout(function(){ btnPDF.textContent = '📄 Télécharger PDF'; btnPDF.disabled = false; }, 2000);
    } catch(err) {
      console.error('PDF generation error:', err);
      btnPDF.textContent = '📄 Télécharger PDF';
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
  btnPrint.textContent = '🖨️ Imprimer';
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
  btnTab.textContent = '↗ Nouvel onglet';
  btnTab.style.cssText = 'padding:10px 20px;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;background:rgba(59,130,246,.1);color:#3b82f6';
  btnTab.onclick = function() {
    try { var w = window.open('','_blank'); if(w){w.document.write(brandedHtml);w.document.close();w.document.title=title||'Aureus Social Pro';} } catch(e) {}
  };
  topBar.appendChild(btnTab);
  
  // Close button
  var btnClose = document.createElement('button');
  btnClose.textContent = '✕ Fermer';
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
    { text: '📄 Télécharger PDF', bg: '#c6a34e', color: '#060810', fn: () => { try { iframe.contentWindow.print(); } catch(e) { alert('Utilisez Ctrl+P pour enregistrer en PDF'); } } },
    { text: '✕ Fermer', bg: '#ef4444', color: '#fff', fn: () => document.body.removeChild(overlay) }
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


// ── SCORE SANTÉ DOSSIER ──

// ── MULTI-CURRENCY CONVERTER ──

// ── INTÉGRATIONS CONNECTEURS ──

// ── WEBHOOK MANAGER ──

// ═══════════════════════════════════════════════════════════════
//  SPRINT 8 — PRÉDICTIF: BUDGET AUTO + SIMULATEUR + KPI AVANCÉS
// ═══════════════════════════════════════════════════════════════

// ── BUDGET AUTOMATIQUE ──



// ── PLANIFICATEUR DE TÂCHES ──

// ── GESTION DES ABSENCES (PRÉ-PAIE) ──

// ═══════════════════════════════════════════════════════════════
//  ALERTES LÉGALES — Veille juridique et échéances
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// MODULE: DOCUMENTS JURIDIQUES — Phase 0 Fiduciaire Sociale
// Convention de Mandat, DPA RGPD, Registre RGPD, Politique Confidentialité
// Génération PDF côté client + envoi email en 1 clic
// ═══════════════════════════════════════════════════════════

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

// Catégories de paramètres
const categories=[
{id:'onss',nom:'ONSS / Cotisations',icon:'🏛',color:'#ef4444',params:[
  {k:'onss.travailleur',l:'ONSS travailleur',v:pct(L.onss.travailleur),t:'pct'},
  {k:'onss.employeur.total',l:'ONSS employeur total',v:pct(L.onss.employeur.total),t:'pct'},
  {k:'onss.employeur.detail.pension',l:'  └ Pension',v:pct(L.onss.employeur.detail.pension),t:'pct'},
  {k:'onss.employeur.detail.maladie',l:'  └ Maladie-invalidite',v:pct(L.onss.employeur.detail.maladie),t:'pct'},
  {k:'onss.employeur.detail.chomage',l:'  └ Chomage',v:pct(L.onss.employeur.detail.chomage),t:'pct'},
  {k:'onss.employeur.detail.moderation',l:'  └ Moderation salariale',v:pct(L.onss.employeur.detail.moderation),t:'pct'},
  {k:'onss.ouvrier108',l:'Majoration ouvriers',v:'x '+L.onss.ouvrier108,t:'num'},
]},
{id:'pp',nom:'Precompte Professionnel',icon:'💰',color:'#a855f7',params:[
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
{id:'csss',nom:'CSSS',icon:'🔒',color:'#f97316',params:[
  {k:'csss.isole.0.max',l:'Seuil exoneration',v:fmt(L.csss.isole[0].max)+' EUR/an',t:'num'},
  {k:'csss.isole.4.montantFixe',l:'Plafond isole',v:fmt(L.csss.isole[4].montantFixe)+' EUR/trim',t:'num'},
]},
{id:'rem',nom:'Remuneration',icon:'💶',color:'#22c55e',params:[
  {k:'rémunération.RMMMG.montant18ans',l:'RMMMG (18 ans)',v:fmt(L.rémunération.RMMMG.montant18ans)+' EUR/mois',t:'num'},
  {k:'rémunération.indexSante.coeff',l:'Coefficient index sante',v:L.rémunération.indexSante.coeff,t:'num'},
  {k:'rémunération.peculeVacances.simple.pct',l:'Pecule vacances simple',v:pct(L.rémunération.peculeVacances.simple.pct),t:'pct'},
  {k:'rémunération.peculeVacances.double.pct',l:'Pecule vacances double',v:pct(L.rémunération.peculeVacances.double.pct),t:'pct'},
  {k:'chequesRepas.partTravailleur.min',l:'Cheques-repas part travailleur min',v:fmt(L.chequesRepas.partTravailleur.min)+' EUR',t:'num'},
  {k:'chequesRepas.valeurFaciale.max',l:'Cheques-repas valeur faciale max',v:fmt(L.chequesRepas.valeurFaciale.max)+' EUR',t:'num'},
  {k:'fraisPropres.forfaitBureau.max',l:'Forfait bureau/teletravail',v:fmt(L.fraisPropres.forfaitBureau.max)+' EUR/mois',t:'num'},
  {k:'fraisPropres.forfaitDeplacement.voiture',l:'Indemnite km voiture',v:fmt(L.fraisPropres.forfaitDeplacement.voiture)+' EUR/km',t:'num'},
]},
{id:'atn',nom:'ATN / Avantages',icon:'🚗',color:'#3b82f6',params:[
  {k:'atn.voiture.min',l:'ATN voiture minimum',v:fmt(L.atn.voiture.min)+' EUR/an',t:'num'},
  {k:'atn.gsm.forfait',l:'ATN GSM/tablette',v:fmt(L.atn.gsm.forfait)+' EUR/mois',t:'num'},
  {k:'atn.pc.forfait',l:'ATN PC/laptop',v:fmt(L.atn.pc.forfait)+' EUR/mois',t:'num'},
  {k:'atn.internet.forfait',l:'ATN Internet',v:fmt(L.atn.internet.forfait)+' EUR/mois',t:'num'},
  {k:'atn.electricite.cadre',l:'ATN electricite (cadre)',v:fmt(L.atn.electricite.cadre)+' EUR/an',t:'num'},
  {k:'atn.chauffage.cadre',l:'ATN chauffage (cadre)',v:fmt(L.atn.chauffage.cadre)+' EUR/an',t:'num'},
]},
{id:'travail',nom:'Temps de travail',icon:'⏰',color:'#eab308',params:[
  {k:'tempsTravail.dureeHebdoLegale',l:'Duree hebdo legale',v:L.tempsTravail.dureeHebdoLegale+'h',t:'num'},
  {k:'tempsTravail.heuresSupp.majoration50',l:'Heures supp (+50%)',v:pct(L.tempsTravail.heuresSupp.majoration50),t:'pct'},
  {k:'tempsTravail.heuresSupp.plafondAnnuel',l:'Plafond heures supp/an',v:L.tempsTravail.heuresSupp.plafondAnnuel+'h',t:'num'},
  {k:'tempsTravail.jourFerie.nombre',l:'Jours fériés legaux',v:L.tempsTravail.jourFerie.nombre,t:'num'},
]},
{id:'assur',nom:'Assurances & Seuils',icon:'🛡',color:'#06b6d4',params:[
  {k:'assurances.accidentTravail.taux',l:'Assurance accident travail',v:pct(L.assurances.accidentTravail.taux),t:'pct'},
  {k:'assurances.medecineTravail.cout',l:'Medecine du travail',v:fmt(L.assurances.medecineTravail.cout)+' EUR/trav',t:'num'},
  {k:'seuils.electionsSociales.cppt',l:'Seuil elections CPPT',v:L.seuils.electionsSociales.cppt+' travailleurs',t:'num'},
  {k:'seuils.electionsSociales.ce',l:'Seuil elections CE',v:L.seuils.electionsSociales.ce+' travailleurs',t:'num'},
  {k:'seuils.planFormation',l:'Seuil plan formation',v:L.seuils.planFormation+' travailleurs',t:'num'},
]},
];

const totalParams=categories.reduce((a,c)=>a+c.params.length,0);

// Vérification auto
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
<PH title="Moteur Lois Belges" sub={"Base centralisee — "+totalParams+" parametres legaux — Version "+L._meta.version+" — MAJ "+L._meta.dateMAJ}/>

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
    {checking?"⏳ Verification en cours...":"🔄 Verifier les mises a jour"}
  </button>
  <button onClick={resetAll} style={{padding:"10px 20px",borderRadius:8,border:"1px solid rgba(248,113,113,.3)",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,background:"transparent",color:"#f87171"}}>
    ↺ Reinitialiser
  </button>
  <button onClick={()=>setEditMode(!editMode)} style={{padding:"10px 20px",borderRadius:8,border:"1px solid rgba(198,163,78,.3)",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13,background:editMode?"rgba(198,163,78,.15)":"transparent",color:"#c6a34e"}}>
    {editMode?"✓ Terminer":"✏ Mode edition"}
  </button>
</div>

{/* Tabs */}
<div style={{display:"flex",gap:6,marginBottom:16}}>
{[{v:"dashboard",l:"📊 Tableau de bord"},{v:"parametres",l:"⚙ Tous les parametres"},{v:"sources",l:"🌐 Sources"},{v:"historique",l:"📜 Historique"},{v:"impact",l:"📈 Impact sur paie"},{v:"export",l:"📤 Export"}].map(t=>
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
      <span style={{color:customLois[p.k]?"#c6a34e":"#e8e6e0"}}>{customLois[p.k]||p.v}{customLois[p.k]&&<span style={{fontSize:8,marginLeft:4,color:"#c6a34e"}}>✏</span>}</span>}
    </div>
  </div>)}
  </div>
</C>)}
{editMode&&<div style={{textAlign:"center",marginTop:16}}>
  <button onClick={()=>{applyUpdate(editValues);setEditMode(false);setEditValues({});}} style={{padding:"12px 30px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:14,background:"linear-gradient(135deg,#c6a34e,#a8892e)",color:"#000"}}>
    💾 Sauvegarder les modifications ({Object.keys(editValues).length} changes)
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
    <div style={{fontSize:11,color:"#4ade80",fontWeight:600}}>✅ Backend actif — Cron quotidien 06:30 CET</div>
    <div style={{fontSize:9,color:"#5e5c56"}}>{lastCheck?("Dernier scan: "+new Date(lastCheck).toLocaleString("fr-BE")):"Aucun scan effectue"}</div>
  </div>
  <div style={{fontSize:10,color:"#9e9b93",marginTop:4}}>Le service /api/veille-juridique scrape {L.sources.length} sources officielles, detecte les changements AR/CCT, et notifie l administrateur pour validation avant mise à jour.</div>
  {updateHistory.length>0&&updateHistory[0].changes?.length>0&&<div style={{marginTop:6,padding:"6px 8px",background:"rgba(248,113,113,.06)",borderRadius:6}}>
    <div style={{fontSize:10,color:"#f87171",fontWeight:600}}>⚠️ {updateHistory[0].changes.length} changement(s) detecte(s):</div>
    {updateHistory[0].changes.slice(0,3).map((c,i)=><div key={i} style={{fontSize:10,color:"#fb923c",marginTop:2}}>{c.label}: {c.current} → {c.detected}</div>)}
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
      <div style={{fontSize:11,color:"#e8e6e0",fontWeight:600}}>{h.action==='UPDATE'?'✏ MAJ manuelle ('+h.changes+' param.)':h.status==='A_JOUR'?'✓ Verification OK — Aucun changement':h.status==='CHANGEMENTS'?'⚠ '+((h.changes||[]).length)+' changement(s) detecte(s)':h.status==='ERREUR'?'❌ Erreur: '+(h.error||'inconnue'):'⚠ A verifier'}</div>
      <span style={{fontSize:9,color:"#5e5c56"}}>{h.trigger==='manual'?'Manuel':'Auto'}{h.duration?' — '+h.duration:''}</span>
    </div>
    <div style={{fontSize:10,color:"#5e5c56"}}>{new Date(h.date).toLocaleString('fr-BE')}{h.version?' — v'+h.version:''}{h.summary?.sourcesReachable?' — '+h.summary.sourcesReachable+'/'+h.summary.sourcesChecked+' sources':''}</div>
    {h.changes?.length>0&&<div style={{marginTop:4}}>{h.changes.map((c,j)=><div key={j} style={{fontSize:10,color:"#f87171",padding:"2px 0"}}>↳ {c.label}: <b>{c.current}</b> → <b style={{color:"#fb923c"}}>{c.detected}</b> ({c.severity})</div>)}</div>}
    {h.alerts?.length>0&&<div style={{marginTop:2}}>{h.alerts.slice(0,2).map((a,j)=><div key={j} style={{fontSize:10,color:"#60a5fa",padding:"1px 0"}}>ℹ {a.text?.substring(0,100)}</div>)}</div>}
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
      {r:"Précompte professionnel",montant:"- "+fmt(pp)+" EUR",c:"#f87171",source:"AR Annexe III - Formule-cle SPF"},
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
    <div style={{fontSize:24}}>📋</div><div style={{fontWeight:600,fontSize:12,marginTop:6}}>JSON complet</div><div style={{fontSize:10,color:"#9e9b93"}}>Toute la base legale</div>
  </button>
  <button onClick={()=>{let csv='Categorie;Parametre;Valeur;Type\n';categories.forEach(cat=>cat.params.forEach(p=>{csv+=cat.nom+';'+p.l+';'+p.v+';'+p.t+'\n';}));const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='parametres_legaux_'+L._meta.annee+'.csv';a.click();}} style={{padding:16,borderRadius:10,border:"1px solid rgba(198,163,78,.2)",cursor:"pointer",fontFamily:"inherit",background:"rgba(198,163,78,.04)",color:"#c6a34e",textAlign:"center"}}>
    <div style={{fontSize:24}}>📊</div><div style={{fontWeight:600,fontSize:12,marginTop:6}}>CSV parametres</div><div style={{fontSize:10,color:"#9e9b93"}}>Pour Excel/Sheets</div>
  </button>
  <button onClick={()=>{const txt='LOIS BELGES '+L._meta.annee+'\nVersion: '+L._meta.version+'\n'+'='.repeat(50)+'\n\n'+categories.map(cat=>cat.icon+' '+cat.nom.toUpperCase()+'\n'+'-'.repeat(40)+'\n'+cat.params.map(p=>'  '+p.l+': '+p.v).join('\n')+'\n').join('\n');const escaped=(txt||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>\n');const html='<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Résumé lois '+L._meta.annee+'</title><style>body{font-family:system-ui,sans-serif;font-size:12px;padding:24px;max-width:800px;margin:0 auto;line-height:1.5;color:#1a1a1a}</style></head><body><div>'+escaped+'</div><p style="margin-top:20px;font-size:10px;color:#666">Document généré par Aureus Social Pro</p></body></html>';openForPDF(html,'Resume_lois_'+L._meta.annee);}} style={{padding:16,borderRadius:10,border:"1px solid rgba(198,163,78,.2)",cursor:"pointer",fontFamily:"inherit",background:"rgba(198,163,78,.04)",color:"#c6a34e",textAlign:"center"}}>
    <div style={{fontSize:24}}>📄</div><div style={{fontWeight:600,fontSize:12,marginTop:6}}>Résumé PDF</div><div style={{fontSize:10,color:"#9e9b93"}}>Imprimer / Enregistrer en PDF</div>
  </button>
</div>
<div style={{marginTop:16,padding:16,background:"rgba(198,163,78,.04)",borderRadius:10,border:"1px solid rgba(198,163,78,.12)"}}>
  <div style={{fontSize:12,color:"#c6a34e",fontWeight:700,marginBottom:10}}>📥 Import / MAJ en 1 clic</div>

  {/* STEP 1: Upload zone */}
  {(importState.step==='idle'||importState.step==='error'||importState.step==='applied')&&<div>
    <div
      onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor='#c6a34e';}}
      onDragLeave={e=>{e.currentTarget.style.borderColor='rgba(198,163,78,.2)';}}
      onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor='rgba(198,163,78,.2)';const f=e.dataTransfer.files[0];if(f&&f.name.endsWith('.json'))handleJsonImport(f);}}
      style={{border:"2px dashed rgba(198,163,78,.2)",borderRadius:8,padding:"20px",textAlign:"center",cursor:"pointer",transition:"border-color .2s"}}
      onClick={()=>{const inp=document.createElement('input');inp.type='file';inp.accept='.json';inp.onchange=e=>{const f=e.target.files[0];if(f)handleJsonImport(f);};inp.click();}}
    >
      <div style={{fontSize:28}}>📋</div>
      <div style={{fontSize:11,color:"#c6a34e",fontWeight:600,marginTop:6}}>Glissez un fichier JSON ici</div>
      <div style={{fontSize:10,color:"#5e5c56",marginTop:2}}>ou cliquez pour parcourir — Format: {"{\"onss.travailleur\": 0.1307, ...}"}</div>
    </div>
    {importState.step==='error'&&<div style={{marginTop:8,padding:8,background:"rgba(248,113,113,.06)",borderRadius:6}}>
      <div style={{fontSize:10,color:"#f87171"}}>{importState.validation?.errors?.join(', ')||'Erreur inconnue'}</div>
    </div>}
    {importState.step==='applied'&&<div style={{marginTop:8,padding:8,background:"rgba(74,222,128,.06)",borderRadius:6}}>
      <div style={{fontSize:10,color:"#4ade80",fontWeight:600}}>✅ {importState.appliedCount} parametre(s) applique(s) avec succes!</div>
    </div>}
  </div>}

  {/* STEP 2: Validation preview */}
  {(importState.step==='validating'||importState.step==='validated')&&importState.validation&&<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <div style={{fontSize:11,fontWeight:600,color:importState.validation.valid?"#4ade80":"#f87171"}}>
        {importState.validation.valid?"✅ Validation OK — "+importState.validation.count+" parametre(s)":"❌ Erreurs de validation"}
      </div>
      <button onClick={()=>setImportState({step:'idle',data:null,validation:null,uploading:false,history:[]})} style={{fontSize:10,padding:"4px 10px",borderRadius:4,border:"1px solid rgba(248,113,113,.3)",background:"transparent",color:"#f87171",cursor:"pointer",fontFamily:"inherit"}}>✕ Annuler</button>
    </div>
    {importState.validation.errors?.length>0&&<div style={{marginBottom:8}}>{importState.validation.errors.map((e,i)=><div key={i} style={{fontSize:10,color:"#f87171",padding:"2px 0"}}>❌ {e}</div>)}</div>}
    {importState.validation.warnings?.length>0&&<div style={{marginBottom:8}}>{importState.validation.warnings.map((w,i)=><div key={i} style={{fontSize:10,color:"#fb923c",padding:"2px 0"}}>⚠ {w}</div>)}</div>}
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
          {importState.uploading?"⏳ Envoi vers Supabase...":"📤 Stocker dans Supabase (en attente)"}
        </button>
        <button onClick={()=>{applyUpdate(importState.validation.validated);setImportState(p=>({...p,step:'applied',appliedCount:importState.validation.count}));}} style={{flex:1,padding:"10px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff"}}>
          ⚡ Appliquer directement
        </button>
      </div>
    </div>}
  </div>}

  {/* STEP 3: Uploaded to Supabase */}
  {importState.step==='uploaded'&&<div>
    <div style={{padding:12,background:"rgba(96,165,250,.06)",borderRadius:6,marginBottom:8}}>
      <div style={{fontSize:11,color:"#60a5fa",fontWeight:600}}>📦 Stocke dans Supabase — ID: {importState.uploadId?.substring(0,8)}...</div>
      <div style={{fontSize:10,color:"#9e9b93",marginTop:4}}>Statut: En attente d approbation admin</div>
    </div>
    <div style={{display:"flex",gap:8}}>
      <button onClick={()=>handleApproveAndApply(importState.uploadId)} style={{flex:1,padding:"10px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,background:"linear-gradient(135deg,#c6a34e,#a8892e)",color:"#000"}}>
        ✅ Approuver et appliquer
      </button>
      <button onClick={()=>setImportState({step:'idle',data:null,validation:null,uploading:false,history:[]})} style={{padding:"10px 16px",borderRadius:8,border:"1px solid rgba(248,113,113,.3)",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,background:"transparent",color:"#f87171"}}>
        ✕ Rejeter
      </button>
    </div>
  </div>}

  {/* Migration needed */}
  {importState.step==='migration_needed'&&<div style={{padding:12,background:"rgba(251,146,56,.06)",borderRadius:6}}>
    <div style={{fontSize:11,color:"#fb923c",fontWeight:600}}>⚠ Table Supabase manquante</div>
    <div style={{fontSize:10,color:"#9e9b93",marginTop:4}}>Executez ce SQL dans Supabase Dashboard → SQL Editor:</div>
    <pre style={{fontSize:9,color:"#60a5fa",background:"rgba(0,0,0,.3)",padding:8,borderRadius:4,marginTop:6,overflowX:"auto",maxHeight:120}}>{importState.migration}</pre>
    <button onClick={()=>setImportState({step:'idle',data:null,validation:null,uploading:false,history:[]})} style={{marginTop:8,padding:"6px 12px",borderRadius:4,border:"1px solid rgba(198,163,78,.3)",cursor:"pointer",fontFamily:"inherit",fontSize:10,background:"transparent",color:"#c6a34e"}}>
      OK, fait → Reessayer
    </button>
  </div>}

  {/* Supabase history */}
  <div style={{marginTop:12,borderTop:"1px solid rgba(255,255,255,.05)",paddingTop:10}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:10,color:"#5e5c56",fontWeight:600}}>Historique Supabase</div>
      <button onClick={loadSupabaseHistory} style={{fontSize:9,padding:"3px 8px",borderRadius:4,border:"1px solid rgba(198,163,78,.2)",background:"transparent",color:"#c6a34e",cursor:"pointer",fontFamily:"inherit"}}>🔄 Charger</button>
    </div>
    {importState.history?.length>0&&<div style={{marginTop:6,maxHeight:120,overflowY:"auto"}}>{importState.history.map((h,i)=>
      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,.02)"}}>
        <div>
          <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,marginRight:4,background:h.status==='applied'?"rgba(74,222,128,.1)":h.status==='pending'?"rgba(96,165,250,.1)":h.status==='approved'?"rgba(198,163,78,.1)":"rgba(248,113,113,.1)",color:h.status==='applied'?"#4ade80":h.status==='pending'?"#60a5fa":h.status==='approved'?"#c6a34e":"#f87171"}}>{h.status}</span>
          <span style={{fontSize:10,color:"#9e9b93"}}>{h.changes_count} params — v{h.version} — {new Date(h.created_at).toLocaleDateString('fr-BE')}</span>
        </div>
        {h.status==='applied'&&<button onClick={()=>handleRollback(h.id)} style={{fontSize:9,padding:"2px 6px",borderRadius:3,border:"1px solid rgba(248,113,113,.2)",background:"transparent",color:"#f87171",cursor:"pointer",fontFamily:"inherit"}}>↩ Rollback</button>}
        {h.status==='approved'&&<button onClick={()=>handleApproveAndApply(h.id)} style={{fontSize:9,padding:"2px 6px",borderRadius:3,border:"1px solid rgba(74,222,128,.2)",background:"transparent",color:"#4ade80",cursor:"pointer",fontFamily:"inherit"}}>▶ Appliquer</button>}
        {h.status==='pending'&&<button onClick={()=>handleApproveAndApply(h.id)} style={{fontSize:9,padding:"2px 6px",borderRadius:3,border:"1px solid rgba(198,163,78,.2)",background:"transparent",color:"#c6a34e",cursor:"pointer",fontFamily:"inherit"}}>✅ Approuver</button>}
      </div>
    )}</div>}
  </div>
</div>
</C>}

</div>;
}


// ═══════════════════════════════════════════════════════════════
//  AUREUS SUITE — Nos logiciels
// ═══════════════════════════════════════════════════════════════






// ??? EXPOSE FUNCTIONS ON WINDOW FOR CROSS-MODULE ACCESS ???
if(typeof window!=="undefined"){window.aureusDocHTML=aureusDocHTML;window.aureuspdf=aureuspdf;window.openForPDF=openForPDF;window.generateAttestationEmploi=generateAttestationEmploi;window.generateAttestationSalaire=generateAttestationSalaire;window.generateSoldeCompte=generateSoldeCompte;window.generateC4PDF=generateC4PDF;window.generatePayslipPDF=generatePayslipPDF;window.previewHTML=previewHTML;}


export { Dashboard, Employees, Payslips, DimonaPage, DMFAPage, AdminDashboard, BelcotaxPage, PrecomptePage, DocsPage, ReportsPage, SettingsPage, SubNav, SalairesPage, AvantagesPage, ContratsMenuPage, RHPage, SocialPage, ReportingPage, LegalPage, ModulesProPage, MoteurLoisBelges };
