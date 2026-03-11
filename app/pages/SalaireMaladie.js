'use client';
import { useState } from 'react';
import { useLang } from '../lib/lang-context';
import { TX_ONSS_W, RMMMG, fmt } from '@/app/lib/helpers';

function PH({title,sub}){return <div style={{marginBottom:16}}><div style={{fontSize:18,fontWeight:800,color:'#c6a34e',letterSpacing:'.3px'}}>{title}</div>{sub&&<div style={{fontSize:11,color:'#9e9b93',marginTop:2}}>{sub}</div>}</div>;}
function C({children,style}){return <div style={{padding:'16px 20px',background:'rgba(198,163,78,.03)',borderRadius:12,border:'1px solid rgba(198,163,78,.06)',marginBottom:14,...style}}>{children}</div>;}
function ST({children}){return <div style={{fontSize:13,fontWeight:700,color:'#c6a34e',marginBottom:10,paddingBottom:6,borderBottom:'1px solid rgba(198,163,78,.1)'}}>{children}</div>;}
function I({label,value,onChange,type='number'}){return <div style={{marginBottom:10}}><div style={{fontSize:10,color:'#5e5c56',marginBottom:3,textTransform:'uppercase',letterSpacing:'.3px'}}>{label}</div><input type={type} value={value} onChange={e=>onChange(type==='number'?+e.target.value:e.target.value)} style={{width:'100%',padding:'8px 10px',borderRadius:6,border:'1px solid rgba(198,163,78,.15)',background:'rgba(198,163,78,.04)',color:'#e8e6e0',fontSize:13,fontFamily:'inherit',boxSizing:'border-box'}}/></div>;}
function Row({l,v,bold,color,sub}){return <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><div><span style={{fontSize:12,color:'#9e9b93'}}>{l}</span>{sub&&<div style={{fontSize:9,color:'#5e5c56'}}>{sub}</div>}</div><span style={{fontSize:12,fontWeight:bold?700:400,color:color||'#e8e6e0'}}>{v}</span></div>;}

// Calcul salaire garanti loi 03/07/1978
function calcSalaireGaranti(brut, statut, anciennete, joursAbs) {
  const journalier = brut * 12 / 52 / 5; // salaire journalier (5j/sem)
  
  if (statut === 'employe') {
    // Employés : salaire garanti mensuel complet (1 mois)
    // Période 1: 30 jours 100% brut
    const periode1Jours = Math.min(joursAbs, 30);
    const garantiP1 = journalier * periode1Jours;
    return { garantiP1, garantiP2: 0, garantiTotal: garantiP1, journalier };
  } else {
    // Ouvriers : 7 jours 100% puis 7 jours 85,88% puis INAMI
    const j100 = Math.min(joursAbs, 7);
    const j86 = Math.max(0, Math.min(joursAbs - 7, 7));
    const garantiP1 = journalier * j100;
    const garantiP2 = journalier * 0.8588 * j86;
    return { garantiP1, garantiP2, garantiTotal: garantiP1 + garantiP2, journalier };
  }
}

export default function SalaireMaladie({ s }) {
  const { tText } = useLang();
  const [tab, setTab] = useState('calcul');
  const [brut, setBrut] = useState(3000);
  const [statut, setStatut] = useState('employe');
  const [anciennete, setAnciennete] = useState(2);
  const [joursAbs, setJoursAbs] = useState(10);

  const r = calcSalaireGaranti(brut, statut, anciennete, joursAbs);
  const onssGaranti = Math.round(r.garantiTotal * TX_ONSS_W * 100) / 100;
  const netGaranti = r.garantiTotal - onssGaranti;

  const tabs = [{v:'calcul',l:'Calculateur'},{v:'regles',l:'Règles légales'},{v:'procedures',l:'Procédures'},{v:'inami',l:'Indemnités INAMI'}];

  return (
    <div>
      <PH title="Salaire Garanti & Maladie" sub="Loi 03/07/1978 — Calcul garanti de revenu en cas d'incapacité" />
      <div style={{display:'flex',gap:6,marginBottom:16}}>
        {tabs.map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'8px 14px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}
      </div>

      {tab==='calcul'&&<div style={{display:'grid',gridTemplateColumns:'320px 1fr',gap:18}}>
        <C>
          <ST>Paramètres</ST>
          <I label="Salaire brut mensuel (EUR)" value={brut} onChange={setBrut}/>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:'#5e5c56',marginBottom:3,textTransform:'uppercase',letterSpacing:'.3px'}}>Statut</div>
            <select value={statut} onChange={e=>setStatut(e.target.value)} style={{width:'100%',padding:'8px 10px',borderRadius:6,border:'1px solid rgba(198,163,78,.15)',background:'rgba(198,163,78,.04)',color:'#e8e6e0',fontSize:13,fontFamily:'inherit'}}>
              <option value="employe">Employé</option>
              <option value="ouvrier">Ouvrier</option>
            </select>
          </div>
          <I label="Ancienneté (années)" value={anciennete} onChange={setAnciennete}/>
          <I label="Jours d'absence maladie" value={joursAbs} onChange={setJoursAbs}/>
        </C>
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
            {[
              {l:'Salaire journalier',v:fmt(r.journalier),c:'#c6a34e'},
              {l:'Garanti brut total',v:fmt(r.garantiTotal),c:'#fb923c'},
              {l:'Net estimé',v:fmt(netGaranti),c:'#4ade80'},
            ].map((k,i)=><div key={i} style={{padding:'14px 16px',background:'rgba(198,163,78,.04)',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}><div style={{fontSize:10,color:'#5e5c56',textTransform:'uppercase'}}>{k.l}</div><div style={{fontSize:17,fontWeight:700,color:k.c,marginTop:4}}>{k.v}</div></div>)}
          </div>
          <C>
            <ST>Détail du salaire garanti</ST>
            {statut==='employe'
              ? <><Row l="Période 1: 30 jours (100%)" v={fmt(r.garantiP1)} color="#22c55e" sub="Salaire brut normal maintenu"/><Row l="Période 2: INAMI (60% plafond)" v="Après 30 jours" color="#9e9b93" sub="Indemnités INAMI — hors garanti employeur"/></>
              : <><Row l="Jours 1-7 (100%)" v={fmt(r.garantiP1)} color="#22c55e" sub="Salaire brut journalier x jours"/><Row l="Jours 8-14 (85,88%)" v={fmt(r.garantiP2)} color="#fb923c" sub="Loi 03/07/1978 art. 71"/><Row l="Jours 15+ (INAMI)" v="60% du plafond INAMI" color="#9e9b93" sub="Hors obligation patronale"/></>
            }
            <Row l="ONSS travailleur sur garanti" v={'- '+fmt(onssGaranti)} color="#ef4444"/>
            <Row l="NET estimé" v={fmt(netGaranti)} bold color="#4ade80"/>
          </C>
          <C style={{background:'rgba(96,165,250,.03)',border:'1px solid rgba(96,165,250,.1)'}}>
            <ST>Charge employeur</ST>
            <Row l="Salaire garanti brut" v={fmt(r.garantiTotal)} color="#c6a34e"/>
            <Row l="ONSS patronal (~27,19%)" v={fmt(r.garantiTotal*0.2719)} color="#f87171"/>
            <Row l="Coût total employeur" v={fmt(r.garantiTotal*1.2719)} bold color="#f87171"/>
            <div style={{fontSize:10,color:'#5e5c56',marginTop:8}}>
              Récupération possible via assurance revenu garanti complémentaire
            </div>
          </C>
        </div>
      </div>}

      {tab==='regles'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <C>
          <ST>Employés — Art. 70-73 Loi 03/07/1978</ST>
          {[
            {p:'Carence',v:'Aucun jour de carence — dès le 1er jour',c:'#22c55e'},
            {p:'Période 1',v:'30 jours calendrier — 100% brut',c:'#22c55e'},
            {p:'Condition',v:'Ancienneté ≥ 1 mois',c:'#9e9b93'},
            {p:'Après 30 jours',v:'INAMI — 60% du plafond journalier',c:'#9e9b93'},
            {p:'Plafond INAMI 2026',v:'~193 EUR/jour (sécurité)',c:'#60a5fa'},
            {p:'Certificat médical',v:'Obligatoire dans les 2 jours ouvrables',c:'#fb923c'},
          ].map((r,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><span style={{fontSize:12,color:'#9e9b93'}}>{r.p}</span><span style={{fontSize:12,fontWeight:600,color:r.c,textAlign:'right',maxWidth:'55%'}}>{r.v}</span></div>)}
        </C>
        <C>
          <ST>Ouvriers — Art. 52 Loi 03/07/1978</ST>
          {[
            {p:'Jour de carence',v:'1 jour de carence (sauf CCT)',c:'#f87171'},
            {p:'Jours 1-7',v:'100% salaire journalier',c:'#22c55e'},
            {p:'Jours 8-14',v:'85,88% salaire journalier',c:'#fb923c'},
            {p:'Jour 15+',v:'INAMI — ~60% plafond',c:'#9e9b93'},
            {p:'Condition ancienneté',v:'≥ 1 mois de service',c:'#9e9b93'},
            {p:'Carence supprimée si',v:'CCT sectorielle ou entreprise',c:'#4ade80'},
          ].map((r,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><span style={{fontSize:12,color:'#9e9b93'}}>{r.p}</span><span style={{fontSize:12,fontWeight:600,color:r.c,textAlign:'right',maxWidth:'55%'}}>{r.v}</span></div>)}
        </C>
      </div>}

      {tab==='procedures'&&<C>
        <ST>Procédure maladie — Obligations employeur</ST>
        {[
          {t:'Jour J (premier jour)',steps:['Travailleur prévient l\'employeur (dès que possible)','Employeur acte l\'absence dans le registre','Lancer Dimona si contrat court / student']},
          {t:'Jours J+1/J+2',steps:['Travailleur envoie certificat médical (délai légal 2 jours)','Employeur encode absence dans le système de paie','Vérifier si carence applicable (ouvrier sans CCT)']},
          {t:'À partir de J+8 (ouvrier) / J+31 (employé)',steps:['Travailleur introduit dossier incapacité INAMI','Employeur cesse le salaire garanti','INAMI prend le relais (60% plafond journalier)','Encoder en paie : indemnités INAMI = non soumises ONSS']},
          {t:'Prolongation / rechute',steps:['Nouveau certificat médical requis','Rechute dans les 14 jours = suite garantie (pas de nouveau délai)','Rechute après 14 jours = nouvelle période de salaire garanti']},
        ].map((s2,i)=><div key={i} style={{marginBottom:16,padding:14,background:'rgba(255,255,255,.02)',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}><div style={{fontSize:12,fontWeight:700,color:'#c6a34e',marginBottom:10}}>{s2.t}</div>{s2.steps.map((st,j)=><div key={j} style={{display:'flex',gap:8,padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><span style={{color:'#c6a34e',fontWeight:700,minWidth:16}}>{j+1}.</span><span style={{fontSize:11,color:'#e8e6e0'}}>{st}</span></div>)}</div>)}
      </C>}

      {tab==='inami'&&<div>
        <div style={{padding:14,background:'rgba(96,165,250,.04)',borderRadius:10,border:'1px solid rgba(96,165,250,.15)',marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:'#60a5fa',marginBottom:6}}>ℹ️ Indemnités INAMI — Hors salaire garanti patronal</div>
          <div style={{fontSize:11,color:'#9e9b93',lineHeight:1.8}}>Après expiration du salaire garanti, le travailleur entre en incapacité de travail primaire. L'INAMI prend en charge une indemnité journalière calculée sur base du salaire journalier plafonné.</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
          <C>
            <ST>Taux d'indemnisation INAMI 2026</ST>
            {[
              {cat:'Cohabitant avec enfants à charge',taux:'60%',plaf:'~193 EUR/j',c:'#22c55e'},
              {cat:'Isolé / cohabitant chef de ménage',taux:'60%',plaf:'~193 EUR/j',c:'#4ade80'},
              {cat:'Cohabitant sans charge',taux:'55%',plaf:'~177 EUR/j',c:'#fb923c'},
              {cat:'Invalidité (> 1 an)',taux:'65%',plaf:'~210 EUR/j',c:'#60a5fa'},
            ].map((r,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}><span style={{fontSize:12,color:'#9e9b93'}}>{r.cat}</span><span style={{fontSize:12,fontWeight:700,color:r.c}}>{r.taux}</span></div><div style={{fontSize:10,color:'#5e5c56'}}>Plafond journalier approx.: {r.plaf}</div></div>)}
          </C>
          <C>
            <ST>Périodes d'incapacité de travail</ST>
            {[
              {p:'Incapacité primaire',d:'Jours 1 → 365',ref:'Art. 87 Loi coord. 14/07/1994'},
              {p:'Invalidité 1ère période',d:'An 2 → An 3',ref:'Art. 100 Loi coord.'},
              {p:'Invalidité longue durée',d:'Après 3 ans',ref:'Art. 100bis Loi coord.'},
              {p:'Mi-temps médical',d:'Reprise progressive autorisée',ref:'Art. 100 §2 Loi coord.'},
            ].map((r,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}><div style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{r.p}</div><div style={{fontSize:11,color:'#9e9b93'}}>{r.d}</div><div style={{fontSize:9,color:'#5e5c56'}}>{r.ref}</div></div>)}
          </C>
        </div>
      </div>}
    </div>
  );
}
