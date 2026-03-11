'use client';
import { useState } from 'react';
import { useLang } from '../lib/lang-context';

function PH({title,sub}){return <div style={{marginBottom:16}}><div style={{fontSize:18,fontWeight:800,color:'#c6a34e',letterSpacing:'.3px'}}>{title}</div>{sub&&<div style={{fontSize:11,color:'#9e9b93',marginTop:2}}>{sub}</div>}</div>;}
function C({children,style}){return <div style={{padding:'16px 20px',background:'rgba(198,163,78,.03)',borderRadius:12,border:'1px solid rgba(198,163,78,.06)',marginBottom:14,...style}}>{children}</div>;}
function ST({children}){return <div style={{fontSize:13,fontWeight:700,color:'#c6a34e',marginBottom:10,paddingBottom:6,borderBottom:'1px solid rgba(198,163,78,.1)'}}>{children}</div>;}

const DEADLINES_2026 = [
  { mois:'Janvier',     dead:'31/01', type:'ONSS',    label:'Déclaration ONSS Q4 2025 (estimée)', ref:'AR 27/04/2007', urgent:true },
  { mois:'Février',     dead:'28/02', type:'FISC',    label:'Fiches 281.10 → travailleurs', ref:'Art. 57 CIR/92', urgent:true },
  { mois:'Mars',        dead:'01/03', type:'FISC',    label:'Dépôt Belcotax-on-Web — fiches 281.10', ref:'Art. 57 CIR/92', urgent:true },
  { mois:'Mars',        dead:'31/03', type:'TVA',     label:'Listing annuel clients TVA 2025', ref:'Art. 53quinquies CTVA', urgent:true },
  { mois:'Avril',       dead:'30/04', type:'ONSS',    label:'DmfA Q1 2026 — déclaration trimestrielle', ref:'Loi 27/06/1969', urgent:false },
  { mois:'Mai',         dead:'31/05', type:'FISC',    label:'Déclaration IPP (délai ordinaire)', ref:'CIR Art. 307', urgent:false },
  { mois:'Juin',        dead:'01/06', type:'PRIME',   label:'MonBEE — Prime recrutement (deadline!)', ref:'MonBEE.brussels', urgent:true },
  { mois:'Juin',        dead:'30/06', type:'CONGES',  label:'Prise obligatoire principal congé (12 jours consécutifs)', ref:'Loi 28/06/1971', urgent:false },
  { mois:'Juillet',     dead:'31/07', type:'ONSS',    label:'DmfA Q2 2026 — déclaration trimestrielle', ref:'Loi 27/06/1969', urgent:false },
  { mois:'Juillet',     dead:'15/07', type:'FISC',    label:'Déclaration IPP électronique (Tax-on-web)', ref:'CIR Art. 307', urgent:false },
  { mois:'Octobre',     dead:'31/10', type:'ONSS',    label:'DmfA Q3 2026 — déclaration trimestrielle', ref:'Loi 27/06/1969', urgent:false },
  { mois:'Octobre',     dead:'31/10', type:'CONGES',  label:'Clôture droits aux congés N-1 ouvriers', ref:'Lois coord. 28/06/1971', urgent:false },
  { mois:'Décembre',    dead:'31/12', type:'FISC',    label:'Clôture exercice — réconciliation PP', ref:'CIR Art. 273', urgent:false },
  { mois:'Décembre',    dead:'31/12', type:'ONSS',    label:'DmfA Q4 2026 — à soumettre avant le 31/01/2027', ref:'Loi 27/06/1969', urgent:false },
];

const JOURS_FERIES_2026 = [
  { d:'01/01', l:"Jour de l'An" },
  { d:'06/04', l:'Lundi de Pâques' },
  { d:'01/05', l:'Fête du Travail' },
  { d:'14/05', l:'Ascension' },
  { d:'25/05', l:'Lundi de Pentecôte' },
  { d:'21/07', l:'Fête Nationale' },
  { d:'15/08', l:"Assomption" },
  { d:'01/11', l:'Toussaint' },
  { d:'11/11', l:'Armistice' },
  { d:'25/12', l:'Noël' },
];

const TYPE_COLORS = {
  ONSS:'#60a5fa', FISC:'#a78bfa', TVA:'#fb923c', PRIME:'#4ade80', CONGES:'#f9a8d4'
};

export default function CalendrierSocial({ s }) {
  const [tab, setTab] = useState('deadlines');
  const [filtre, setFiltre] = useState('TOUS');

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const tabs = [{v:'deadlines',l:'Deadlines 2026'},{v:'jours',l:'Jours fériés'},{v:'paie',l:'Calendrier paie'},{v:'conges',l:'Congés annuels'}];
  const types = ['TOUS','ONSS','FISC','TVA','PRIME','CONGES'];

  const moisIdx = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const filteredDeadlines = filtre==='TOUS' ? DEADLINES_2026 : DEADLINES_2026.filter(d=>d.type===filtre);

  return (
    <div>
      <PH title="Calendrier Social 2026" sub="Deadlines légales belges — ONSS, SPF Finances, congés annuels" />
      <div style={{display:'flex',gap:6,marginBottom:16}}>
        {tabs.map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 14px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}
      </div>

      {tab==='deadlines'&&<div>
        <div style={{display:'flex',gap:6,marginBottom:14}}>
          {types.map(tp=><button key={tp} onClick={()=>setFiltre(tp)} style={{padding:'4px 10px',borderRadius:6,border:`1px solid ${filtre===tp?(TYPE_COLORS[tp]||'#c6a34e'):'rgba(255,255,255,.08)'}`,background:filtre===tp?`${TYPE_COLORS[tp]||'#c6a34e'}15`:'transparent',color:filtre===tp?(TYPE_COLORS[tp]||'#c6a34e'):'#9e9b93',fontSize:10,fontWeight:600,cursor:'pointer'}}>{tp}</button>)}
        </div>
        <div>
          {filteredDeadlines.map((d,i)=>{
            const mIdx = moisIdx.indexOf(d.mois)+1;
            const isPast = mIdx < currentMonth;
            const isCurrent = mIdx === currentMonth;
            return <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 14px',marginBottom:6,background:d.urgent&&!isPast?'rgba(239,68,68,.03)':'rgba(255,255,255,.01)',borderRadius:10,border:`1px solid ${d.urgent&&!isPast?'rgba(239,68,68,.15)':isCurrent?'rgba(198,163,78,.2)':'rgba(255,255,255,.04)'}`,opacity:isPast?.5:1}}>
              <div style={{minWidth:60,textAlign:'center'}}>
                <div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase'}}>{d.mois.slice(0,3)}</div>
                <div style={{fontSize:16,fontWeight:800,color:isCurrent?'#c6a34e':isPast?'#5e5c56':'#e8e6e0'}}>{d.dead}</div>
              </div>
              <div style={{width:3,height:40,borderRadius:2,background:TYPE_COLORS[d.type]||'#9e9b93'}}/>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                  <span style={{fontSize:12,fontWeight:600,color:isPast?'#5e5c56':'#e8e6e0'}}>{d.label}</span>
                  {d.urgent&&!isPast&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:6,background:'rgba(239,68,68,.1)',color:'#ef4444'}}>URGENT</span>}
                  {isCurrent&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:6,background:'rgba(198,163,78,.1)',color:'#c6a34e'}}>CE MOIS</span>}
                  {isPast&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:6,background:'rgba(255,255,255,.04)',color:'#5e5c56'}}>PASSÉ</span>}
                </div>
                <div style={{fontSize:10,color:'#5e5c56'}}>Réf: {d.ref}</div>
              </div>
              <div style={{fontSize:9,padding:'3px 8px',borderRadius:6,background:`${TYPE_COLORS[d.type]||'#9e9b93'}15`,color:TYPE_COLORS[d.type]||'#9e9b93',fontWeight:600}}>{d.type}</div>
            </div>;
          })}
        </div>
      </div>}

      {tab==='jours'&&<C>
        <ST>Jours fériés légaux belges 2026 (Art. 1 Loi 04/01/1974)</ST>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {JOURS_FERIES_2026.map((j,i)=>{
            const [d2,m2] = j.d.split('/').map(Number);
            const isPast = m2 < currentMonth || (m2===currentMonth && d2 < now.getDate());
            return <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,background:isPast?'rgba(255,255,255,.01)':'rgba(198,163,78,.03)',border:'1px solid rgba(198,163,78,.08)',opacity:isPast?.5:1}}>
              <div style={{width:40,textAlign:'center'}}>
                <div style={{fontSize:9,color:'#5e5c56'}}>{['','Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'][m2]}</div>
                <div style={{fontSize:18,fontWeight:800,color:isPast?'#5e5c56':'#c6a34e'}}>{d2}</div>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:isPast?'#5e5c56':'#e8e6e0'}}>{j.l}</div>
                <div style={{fontSize:9,color:'#5e5c56'}}>Rémunéré — Art. 1 Loi 04/01/1974</div>
              </div>
            </div>;
          })}
        </div>
        <div style={{marginTop:12,padding:10,background:'rgba(251,146,56,.05)',borderRadius:8,border:'1px solid rgba(251,146,56,.1)',fontSize:10,color:'#9e9b93',lineHeight:1.7}}>
          <strong style={{color:'#fb923c'}}>Rappel légal:</strong> Si un jour férié tombe un dimanche, un jour de remplacement doit être accordé (négocié en CP ou en entreprise). Les travailleurs à temps partiel ont droit au prorata du jour férié.
        </div>
      </C>}

      {tab==='paie'&&<C>
        <ST>Calendrier type de clôture paie mensuelle</ST>
        {[
          {j:'J-5',label:'Transmission données variables (absences, primes, HS)',who:'Client → Aureus'},
          {j:'J-3',label:'Calcul des salaires + contrôle validation engine',who:'Aureus Social Pro'},
          {j:'J-2',label:'Envoi fiches de paie pour validation client',who:'Aureus → Client'},
          {j:'J-1',label:'Génération SEPA pain.001 + Isabel 6',who:'Aureus Social Pro'},
          {j:'J',  label:'Paiement salaires (virement SEPA)',who:'Banque'},
          {j:'J+3',label:'Dimona IN/OUT du mois',who:'Aureus → ONSS'},
          {j:'J+5',label:'Archivage fiches de paie + audit trail',who:'Aureus Social Pro'},
        ].map((e,i)=><div key={i} style={{display:'flex',gap:14,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(198,163,78,.1)',fontSize:10,fontWeight:700,color:'#c6a34e',flexShrink:0}}>{e.j}</div>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{e.label}</div><div style={{fontSize:10,color:'#5e5c56',marginTop:2}}>{e.who}</div></div>
        </div>)}
      </C>}

      {tab==='conges'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <C>
          <ST>Droits aux congés annuels — Employés 2026</ST>
          {[
            {l:'Jours de congé légaux',v:'20 jours / an (5 semaines)',c:'#22c55e'},
            {l:'Pécule de vacances simple',v:'15,34% du brut annuel',c:'#c6a34e'},
            {l:'Pécule de vacances double',v:'92% de la rémunération mensuelle brute',c:'#c6a34e'},
            {l:'Période de référence',v:'Année N-1 (travail effectif)',c:'#9e9b93'},
            {l:'Congé principal (12j consécutifs)',v:'Avant 30/06/2026',c:'#fb923c'},
            {l:'Congé principal minimum',v:'2 semaines consécutives (loi)',c:'#9e9b93'},
          ].map((r,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><span style={{fontSize:12,color:'#9e9b93'}}>{r.l}</span><span style={{fontSize:12,fontWeight:600,color:r.c,textAlign:'right',maxWidth:'55%'}}>{r.v}</span></div>)}
        </C>
        <C>
          <ST>Droits aux congés annuels — Ouvriers 2026</ST>
          {[
            {l:'Jours de congé légaux',v:'20 jours / an',c:'#22c55e'},
            {l:'Pécule géré par',v:'Caisse de vacances (ONVA/CP)',c:'#60a5fa'},
            {l:'Pécule simple ouvrier',v:'Payé par la caisse — ~15,34%',c:'#c6a34e'},
            {l:'Pécule double ouvrier',v:'~85% d\'une rémunération mensuelle',c:'#c6a34e'},
            {l:'Cotisation vacances patronale',v:'10,27% (simple) + 6,93% (double)',c:'#f87171'},
            {l:'Attestation vacances (C131)',v:'Obligatoire lors de la sortie',c:'#fb923c'},
          ].map((r,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><span style={{fontSize:12,color:'#9e9b93'}}>{r.l}</span><span style={{fontSize:12,fontWeight:600,color:r.c,textAlign:'right',maxWidth:'55%'}}>{r.v}</span></div>)}
        </C>
      </div>}
    </div>
  );
}
