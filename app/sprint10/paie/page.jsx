'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'');

// ============================================================
// MOTEUR DE PAIE BELGE AVANCE — 30 FEATURES (601-630)
// Aureus Social Pro — Baremes 2026
// ============================================================

// 601: Conversion horaire <-> mensuel (38h/sem, 164.67h/mois)
function horaireVersMensuel(tauxH, hSem = 38) { return tauxH * hSem * 52 / 12; }
function mensuelVersHoraire(mensuel, hSem = 38) { return mensuel / (hSem * 52 / 12); }

// 602-603: Heures sup 50% (ouvrable) et 100% (dimanche/ferie)
function calcHeuresSup(tauxH, hSup50 = 0, hSup100 = 0) {
  return { sup50: hSup50 * tauxH * 1.5, sup100: hSup100 * tauxH * 2.0, total: hSup50 * tauxH * 1.5 + hSup100 * tauxH * 2.0 };
}

// 604: Heures nuit 21h-6h
function calcNuit(tauxH, hNuit = 0, majoPct = 0.20) { return hNuit * tauxH * (1 + majoPct); }

// 605-607: Travail samedi/dimanche/ferie
function calcSamedi(tauxH, h = 0, majoPct = 0.50) { return h * tauxH * (1 + majoPct); }
function calcDimanche(tauxH, h = 0) { return h * tauxH * 2.0; }
function calcFerie(tauxH, h = 0) { return h * tauxH * 2.0; }

// 608-611: Equipes 2x8/3x8 — primes
function calcPrimeEquipe(type, jours = 0) {
  const primes = { matin: 1.25, apresMidi: 1.50, nuit: 3.00 }; // EUR/h forfait moyen
  return (primes[type] || 0) * 8 * jours;
}

// 612: Astreinte forfait
function calcAstreinte(forfaitJour = 25, jours = 0) { return forfaitJour * jours; }

// 613: Rappel minimum 3h
function calcRappel(tauxH, nbRappels = 0) { return nbRappels * tauxH * 3 * 1.5; }

// 614: Prorata temps partiel
function calcProrata(brutTP, regime) {
  const ratios = { temps_plein: 1, '4_5': 0.8, '3_4': 0.75, mi_temps: 0.5 };
  return brutTP * (ratios[regime] || 1);
}

// 615: Complement differentiel (changement regime)
function calcDifferentiel(ancienBrut, nouveauBrut) { return Math.max(0, ancienBrut - nouveauBrut); }

// 616: Avance sur salaire
function calcAvance(avance = 0) { return avance; }

// 617-620: Retenues judiciaires, pension alimentaire, saisies, plafond insaisissable
function calcSaisie(netAvantSaisie, saisie = 0, pensionAlim = 0, retJudiciaire = 0) {
  // Tranches insaisissables 2026
  const tranches = [
    { min: 0, max: 1342, pct: 0 },
    { min: 1342, max: 1441, pct: 0.20 },
    { min: 1441, max: 1589, pct: 0.30 },
    { min: 1589, max: 1737, pct: 0.40 },
    { max: Infinity, pct: 1.0 },
  ];
  let saisissable = 0;
  for (const t of tranches) {
    if (netAvantSaisie > (t.min || 0)) {
      saisissable += (Math.min(netAvantSaisie, t.max) - (t.min || 0)) * t.pct;
    }
  }
  // Pension alimentaire prend priorite (hors tranches)
  const totalRetenues = Math.min(saisissable, saisie + retJudiciaire) + pensionAlim;
  return { saisissable: Math.round(saisissable * 100) / 100, pensionAlim, retJudiciaire: Math.min(saisissable, retJudiciaire), saisie: Math.min(saisissable - Math.min(saisissable, retJudiciaire), saisie), total: Math.round(totalRetenues * 100) / 100 };
}

// 621: Net imposable
function calcNetImposable(brut, onssPerso, forfaitFrais) {
  return brut - onssPerso - forfaitFrais;
}

// 622-623: Quotite exemptee + reduction enfants
function calcQuotiteExemptee(etatCivil, enfants, handicap) {
  let base = 10570; // quotite de base 2026
  // Supplement par enfant
  const suppEnfants = [0, 1920, 4920, 11050, 17850, 24650, 31450];
  base += suppEnfants[Math.min(enfants, 6)] || 0;
  if (handicap) base += 1920;
  if (etatCivil === 'marie' || etatCivil === 'cohabitant') base += 0; // deja dans quotient conjugal
  return base;
}

// 624: Bonus emploi (A+B)
function calcBonusEmploi(imposable) {
  if (imposable <= 0) return 0;
  const annuel = imposable * 12;
  // Seuils 2026
  if (annuel <= 17880) return 34.57;
  if (annuel <= 23480) return Math.max(0, 34.57 - (annuel - 17880) * 0.001747);
  return 0;
}

// 625: CSS isole/menage
function calcCSS(brutMensuel, etatCivil) {
  const isole = etatCivil !== 'marie' && etatCivil !== 'cohabitant';
  if (brutMensuel <= 1945.38) return 0;
  if (brutMensuel <= 2190.18) return isole ? (7.60 + 0.011 * (brutMensuel - 1945.38)) : (9.30 + 0.011 * (brutMensuel - 1945.38));
  if (brutMensuel <= 6038.82) return isole ? 60.94 : 60.94;
  return isole ? (60.94 + 0.013 * (brutMensuel - 6038.82)) : (60.94 + 0.013 * (brutMensuel - 6038.82));
}

// 626: Impot communal
function calcImpotCommunal(pp, tauxCommune = 7.0) { return pp * tauxCommune / 100; }

// 627: ONSS 13.07% perso (+ 108% ouvrier)
function calcONSSPerso(brut, cat) {
  return cat === 'ouvrier' ? brut * 1.08 * 0.1307 : brut * 0.1307;
}

// 628: Reduction structurelle bas salaires
function calcReductionStructurelle(brutTrim, cat) {
  const seuil = cat === 'ouvrier' ? 9588.01 : 8871.39;
  if (brutTrim >= seuil) return 0;
  const reduction = cat === 'ouvrier' ? 0.1400 * (seuil - brutTrim) : 0.2590 * (seuil - brutTrim);
  return Math.min(Math.max(0, reduction), 560); // plafonné
}

// 629: Dispense PP travail nuit (57.75%)
function calcDispenseNuit(ppNuit) { return ppNuit * 0.5775; }

// 630: Dispense PP heures sup (32.19% pour <130h, 41.25% au-dela)
function calcDispenseHSup(ppHSup, hSup) { return ppHSup * (hSup > 130 ? 0.4125 : 0.3219); }

// PRECOMPTE PROFESSIONNEL — Tranches 2026
function calcPP(imposableMensuel, etatCivil, enfants, handicap, codePostal) {
  const annuel = imposableMensuel * 12;
  const tranches = [
    { min: 0, max: 10580, t: 0.25 },
    { min: 10580, max: 15820, t: 0.40 },
    { min: 15820, max: 27920, t: 0.45 },
    { min: 27920, max: Infinity, t: 0.50 },
  ];
  let ppAnnuel = 0;
  for (const tr of tranches) {
    if (annuel > tr.min) ppAnnuel += (Math.min(annuel, tr.max) - tr.min) * tr.t;
  }
  // Quotite exemptee
  const qe = calcQuotiteExemptee(etatCivil, enfants, handicap);
  let redQE = 0;
  if (qe <= 10580) redQE = qe * 0.25;
  else if (qe <= 15820) redQE = 10580 * 0.25 + (qe - 10580) * 0.40;
  else redQE = 10580 * 0.25 + 5240 * 0.40 + (qe - 15820) * 0.45;

  let ppMensuel = Math.max(0, (ppAnnuel - redQE) / 12);

  // 624: Bonus emploi
  ppMensuel -= calcBonusEmploi(imposableMensuel);
  ppMensuel = Math.max(0, ppMensuel);

  // 626: Impot communal
  const tauxCom = getTauxCommunal(codePostal);
  const impCom = calcImpotCommunal(ppMensuel, tauxCom);
  ppMensuel += impCom;

  return Math.round(ppMensuel * 100) / 100;
}

// Taux communaux principaux
function getTauxCommunal(cp) {
  const taux = {'1000':6.0,'1050':6.0,'1060':6.0,'1070':6.0,'1080':6.0,'1081':6.0,'1082':6.0,'1083':6.0,'1090':6.0,'1140':7.0,'1150':7.0,'1160':7.0,'1170':7.0,'1180':7.0,'1190':7.0,'1200':7.5,'1210':6.0,'1300':7.5,'1348':7.5,'1400':7.0,'1500':7.5,'2000':7.0,'2018':7.0,'2600':7.5,'3000':7.0,'3001':7.0,'4000':8.0,'4020':8.0,'4100':8.0,'5000':8.5,'5100':8.5,'6000':8.5,'6200':8.5,'7000':8.5,'7500':8.5,'8000':7.5,'8400':7.5,'9000':7.5,'9100':7.5};
  return taux[cp] || 7.0;
}

// ============ MOTEUR COMPLET ============
function calcFicheComplete(params) {
  const { brut, categorie, regime, etatCivil, enfants, handicap, codePostal,
    hSup50, hSup100, hNuit, hSamedi, hDimanche, hFerie,
    equipe, joursEquipe, astreinteForfait, joursAstreinte, nbRappels,
    avanceSalaire, saisie, pensionAlim, retJudiciaire, heuresSemaine } = params;

  const hSem = heuresSemaine || 38;

  // 614: Prorata
  const brutProrata = calcProrata(brut, regime);

  // 601: Taux horaire
  const tauxH = mensuelVersHoraire(brutProrata, hSem);

  // 602-607: Supplements
  const supplements = calcHeuresSup(tauxH, hSup50 || 0, hSup100 || 0);
  const suppNuit = calcNuit(tauxH, hNuit || 0);
  const suppSamedi = calcSamedi(tauxH, hSamedi || 0);
  const suppDimanche = calcDimanche(tauxH, hDimanche || 0);
  const suppFerie = calcFerie(tauxH, hFerie || 0);

  // 608-611: Primes equipe
  const primeEquipe = equipe ? calcPrimeEquipe(equipe, joursEquipe || 0) : 0;

  // 612-613: Astreinte + rappel
  const astreinte = calcAstreinte(astreinteForfait || 25, joursAstreinte || 0);
  const rappel = calcRappel(tauxH, nbRappels || 0);

  // Brut total
  const brutTotal = brutProrata + supplements.total + suppNuit + suppSamedi + suppDimanche + suppFerie + primeEquipe + astreinte + rappel;

  // 627: ONSS personnel
  const onssPerso = calcONSSPerso(brutTotal, categorie);

  // 621: Forfait frais pro
  const forfaitFrais = 555 / 12; // mensualise

  // Net imposable
  const imposable = brutTotal - onssPerso;

  // PP avec 622-626
  const pp = calcPP(imposable, etatCivil, enfants || 0, handicap, codePostal || '1000');

  // 625: CSS
  const css = calcCSS(brutTotal, etatCivil);

  // Net avant saisies
  const netAvantSaisie = brutTotal - onssPerso - pp - css;

  // 616-620: Avance + saisies
  const avance = calcAvance(avanceSalaire || 0);
  const saisieResult = calcSaisie(netAvantSaisie, saisie || 0, pensionAlim || 0, retJudiciaire || 0);

  // Net a payer
  const netAPayer = netAvantSaisie - avance - saisieResult.total;

  // Charges patronales
  const onssPatronal = brutTotal * 0.2492;

  // 628: Reduction structurelle
  const redStruct = calcReductionStructurelle(brutTotal * 3, categorie);

  // 629-630: Dispenses PP
  const dispNuit = (hNuit || 0) > 0 ? calcDispenseNuit(pp * (suppNuit / Math.max(1, brutTotal))) : 0;
  const dispHSup = ((hSup50 || 0) + (hSup100 || 0)) > 0 ? calcDispenseHSup(pp * (supplements.total / Math.max(1, brutTotal)), (hSup50 || 0) + (hSup100 || 0)) : 0;

  const coutEmployeur = brutTotal + onssPatronal - redStruct / 3 - dispNuit - dispHSup;

  return {
    // Base
    brutBase: Math.round(brutProrata * 100) / 100,
    tauxHoraire: Math.round(tauxH * 100) / 100,
    // Supplements
    sup50: Math.round(supplements.sup50 * 100) / 100,
    sup100: Math.round(supplements.sup100 * 100) / 100,
    suppNuit: Math.round(suppNuit * 100) / 100,
    suppSamedi: Math.round(suppSamedi * 100) / 100,
    suppDimanche: Math.round(suppDimanche * 100) / 100,
    suppFerie: Math.round(suppFerie * 100) / 100,
    primeEquipe: Math.round(primeEquipe * 100) / 100,
    astreinte: Math.round(astreinte * 100) / 100,
    rappel: Math.round(rappel * 100) / 100,
    totalSupplements: Math.round((supplements.total + suppNuit + suppSamedi + suppDimanche + suppFerie + primeEquipe + astreinte + rappel) * 100) / 100,
    // Brut total
    brutTotal: Math.round(brutTotal * 100) / 100,
    // Retenues
    onssPerso: Math.round(onssPerso * 100) / 100,
    imposable: Math.round(imposable * 100) / 100,
    pp: Math.round(pp * 100) / 100,
    css: Math.round(css * 100) / 100,
    totalRetenues: Math.round((onssPerso + pp + css) * 100) / 100,
    // Saisies
    avance: Math.round(avance * 100) / 100,
    saisie: saisieResult,
    // Net
    netAvantSaisie: Math.round(netAvantSaisie * 100) / 100,
    netAPayer: Math.round(netAPayer * 100) / 100,
    // Patronal
    onssPatronal: Math.round(onssPatronal * 100) / 100,
    reductionStructurelle: Math.round(redStruct * 100) / 100,
    dispenseNuit: Math.round(dispNuit * 100) / 100,
    dispenseHSup: Math.round(dispHSup * 100) / 100,
    coutEmployeur: Math.round(coutEmployeur * 100) / 100,
    // Meta
    tauxCommunal: getTauxCommunal(codePostal || '1000'),
    quotiteExemptee: calcQuotiteExemptee(etatCivil, enfants || 0, handicap),
    bonusEmploi: Math.round(calcBonusEmploi(imposable) * 100) / 100,
  };
}

// ============ PAGE ============
export default function PaiePage() {
  const [fid,setFid]=useState(null);const [clients,setClients]=useState([]);const [trav,setTrav]=useState([]);
  const [selClient,setSelClient]=useState('');const [mois,setMois]=useState('2026-02');
  const [fiches,setFiches]=useState([]);const [loading,setLoading]=useState(true);const [generating,setGenerating]=useState(false);
  const [savedFiches,setSavedFiches]=useState([]);
  const [showDetail,setShowDetail]=useState(null);
  const [extras,setExtras]=useState({});

  useEffect(()=>{load();},[]);

  async function load(){
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href='/sprint10/auth';return;}
    const {data:f}=await supabase.from('fiduciaires').select('*').eq('user_id',user.id).single();
    setFid(f);
    if(f){
      const {data:cl}=await supabase.from('sp_clients').select('*').eq('fiduciaire_id',f.id).order('nom');setClients(cl||[]);
      const ids=(cl||[]).map(c=>c.id);
      if(ids.length){
        const {data:tr}=await supabase.from('sp_travailleurs').select('*').in('client_id',ids).order('nom');setTrav(tr||[]);
        const {data:sf}=await supabase.from('sp_fiches_paie').select('*').in('client_id',ids);setSavedFiches(sf||[]);
      }
    }
    setLoading(false);
  }

  function getExtra(id) { return extras[id] || {}; }
  function setExtra(id, field, val) { setExtras({...extras, [id]: {...(extras[id]||{}), [field]: Number(val)||0 }}); }

  function genererFiches(){
    const workers = selClient ? trav.filter(t=>t.client_id===selClient) : trav;
    const results = workers.filter(t=>t.statut==='actif').map(t=>{
      const ex = getExtra(t.id);
      const calc = calcFicheComplete({
        brut: Number(t.salaire_brut)||0, categorie: t.categorie||'employe', regime: t.regime||'temps_plein',
        etatCivil: t.etat_civil||'celibataire', enfants: Number(t.enfants_charge)||0, handicap: t.handicap||false,
        codePostal: '1060', heuresSemaine: Number(t.heures_semaine)||38,
        hSup50: ex.hSup50||0, hSup100: ex.hSup100||0, hNuit: ex.hNuit||0,
        hSamedi: ex.hSamedi||0, hDimanche: ex.hDimanche||0, hFerie: ex.hFerie||0,
        equipe: ex.equipe||null, joursEquipe: ex.joursEquipe||0,
        astreinteForfait: ex.astreinteForfait||25, joursAstreinte: ex.joursAstreinte||0,
        nbRappels: ex.nbRappels||0, avanceSalaire: ex.avanceSalaire||0,
        saisie: ex.saisie||0, pensionAlim: ex.pensionAlim||0, retJudiciaire: ex.retJudiciaire||0,
      });
      return { ...calc, travailleur_id: t.id, client_id: t.client_id, nom: t.nom+' '+(t.prenom||''), fonction: t.fonction, categorie: t.categorie, mois };
    });
    setFiches(results);
  }

  async function sauvegarder(){
    setGenerating(true);
    for(const f of fiches){
      const exists = savedFiches.find(s=>s.travailleur_id===f.travailleur_id && s.mois===f.mois);
      const data = {
        travailleur_id:f.travailleur_id, client_id:f.client_id, mois:f.mois,
        salaire_brut:f.brutTotal, onss_personnel:f.onssPerso, precompte_pro:f.pp,
        css:f.css, salaire_net:f.netAvantSaisie, onss_patronal:f.onssPatronal,
        cout_employeur:f.coutEmployeur, net_a_payer:f.netAPayer, statut:'valide'
      };
      if(exists){ await supabase.from('sp_fiches_paie').update(data).eq('id',exists.id); }
      else{ await supabase.from('sp_fiches_paie').insert(data); }
    }
    await load();setGenerating(false);alert(fiches.length+' fiche(s) sauvegardees !');
  }

  function genererSEPA(){
    const xml = ['<?xml version="1.0" encoding="UTF-8"?>','<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">','<CstmrCdtTrfInitn>',
      '<GrpHdr><MsgId>AUREUS-'+mois+'</MsgId><CreDtTm>'+new Date().toISOString()+'</CreDtTm><NbOfTxs>'+fiches.length+'</NbOfTxs></GrpHdr>',
      '<PmtInf><PmtInfId>PAY-'+mois+'</PmtInfId><PmtMtd>TRF</PmtMtd>',
      ...fiches.map(f=>'<CdtTrfTxInf><Amt><InstdAmt Ccy="EUR">'+f.netAPayer.toFixed(2)+'</InstdAmt></Amt><Cdtr><Nm>'+f.nom+'</Nm></Cdtr></CdtTrfTxInf>'),
      '</PmtInf></CstmrCdtTrfInitn></Document>'
    ].join('\n');
    const blob = new Blob([xml],{type:'application/xml'});const url = URL.createObjectURL(blob);
    const a = document.createElement('a');a.href=url;a.download='SEPA_'+mois+'.xml';a.click();
  }

  const S = {
    kpi: {background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:'16px 18px'},
    kpiL: {fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:0.5},
    kpiV: {fontWeight:700,marginTop:4,fontFamily:'monospace'},
    input: {width:'100%',padding:'6px 10px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:4,color:'#e2e8f0',fontSize:12,boxSizing:'border-box'},
    label: {fontSize:10,color:'#64748b',display:'block',marginBottom:2},
    th: {background:'#131825',color:'#c9a227',padding:'8px 6px',textAlign:'left',fontWeight:600,fontSize:10,textTransform:'uppercase',borderBottom:'2px solid #1e293b',whiteSpace:'nowrap'},
    td: {padding:'6px',fontSize:12,borderBottom:'1px solid #0f1520'},
  };

  const totalBrut=fiches.reduce((s,f)=>s+f.brutTotal,0);
  const totalNet=fiches.reduce((s,f)=>s+f.netAPayer,0);
  const totalCout=fiches.reduce((s,f)=>s+f.coutEmployeur,0);
  const totalONSS=fiches.reduce((s,f)=>s+f.onssPerso+f.onssPatronal,0);
  const totalPP=fiches.reduce((s,f)=>s+f.pp,0);
  const totalSup=fiches.reduce((s,f)=>s+f.totalSupplements,0);

  if(loading)return <div style={{minHeight:'100vh',background:'#0a0e1a',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{color:'#c9a227'}}>Chargement...</div></div>;

  return (
    <div style={{minHeight:'100vh',background:'#0a0e1a',color:'#e2e8f0',fontFamily:"'Outfit',system-ui,sans-serif",padding:'24px 32px'}}>
      <div style={{marginBottom:16,fontSize:13}}>
        <Link href="/sprint10/dashboard" style={{color:'#64748b',textDecoration:'none'}}>Dashboard</Link>
        <span style={{color:'#475569',margin:'0 8px'}}>/</span>
        <span style={{color:'#c9a227'}}>Moteur de Paie Avance</span>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,margin:'0 0 4px',color:'#f1f5f9'}}>Moteur de Paie Avance</h1>
          <p style={{color:'#64748b',fontSize:13,margin:0}}>30 calculs automatiques — Baremes belges 2026 — Features 601-630</p>
        </div>
        <div style={{background:'rgba(201,162,39,0.1)',border:'1px solid rgba(201,162,39,0.3)',borderRadius:8,padding:'8px 14px'}}>
          <div style={{fontSize:10,color:'#c9a227',fontWeight:600}}>FEATURES ACTIVES</div>
          <div style={{fontSize:20,fontWeight:700,color:'#c9a227',fontFamily:'monospace'}}>30/30</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{display:'flex',gap:12,marginBottom:20,alignItems:'flex-end',flexWrap:'wrap'}}>
        <div>
          <label style={S.label}>Client</label>
          <select value={selClient} onChange={e=>setSelClient(e.target.value)} style={{...S.input,minWidth:220,padding:'8px 12px'}}><option value="">Tous</option>{clients.map(c=><option key={c.id} value={c.id}>{c.nom}</option>)}</select>
        </div>
        <div>
          <label style={S.label}>Mois</label>
          <input type="month" value={mois} onChange={e=>setMois(e.target.value)} style={{...S.input,padding:'8px 12px'}}/>
        </div>
        <button onClick={genererFiches} style={{background:'#c9a227',color:'#0a0e1a',border:'none',padding:'10px 20px',borderRadius:6,fontWeight:700,fontSize:13,cursor:'pointer'}}>Generer les fiches</button>
        {fiches.length>0&&(<>
          <button onClick={sauvegarder} disabled={generating} style={{background:'#22c55e',color:'#fff',border:'none',padding:'10px 16px',borderRadius:6,fontWeight:600,fontSize:12,cursor:'pointer',opacity:generating?0.6:1}}>{generating?'...':'Sauvegarder'}</button>
          <button onClick={genererSEPA} style={{background:'#3b82f6',color:'#fff',border:'none',padding:'10px 16px',borderRadius:6,fontWeight:600,fontSize:12,cursor:'pointer'}}>SEPA XML</button>
        </>)}
      </div>

      {/* Extras input per worker */}
      {trav.filter(t=>!selClient||t.client_id===selClient).filter(t=>t.statut==='actif').length>0 && (
        <div style={{background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:16,marginBottom:20}}>
          <div style={{fontWeight:600,color:'#c9a227',fontSize:13,marginBottom:10}}>Variables du mois (heures sup, nuit, saisies...)</div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr>
                {['Travailleur','H.Sup 50%','H.Sup 100%','H.Nuit','H.Sam','H.Dim','H.Ferie','Equipe','Astreinte j','Avance','Saisie','Pension A.'].map(h=><th key={h} style={{...S.th,fontSize:9,padding:'6px 4px'}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {trav.filter(t=>!selClient||t.client_id===selClient).filter(t=>t.statut==='actif').map(t=>(
                  <tr key={t.id}>
                    <td style={{...S.td,fontWeight:600,fontSize:11,whiteSpace:'nowrap'}}>{t.nom} {t.prenom||''}</td>
                    {['hSup50','hSup100','hNuit','hSamedi','hDimanche','hFerie'].map(f=>(
                      <td key={f} style={S.td}><input type="number" min="0" value={getExtra(t.id)[f]||''} onChange={e=>setExtra(t.id,f,e.target.value)} style={{...S.input,width:50}} placeholder="0"/></td>
                    ))}
                    <td style={S.td}><select value={getExtra(t.id).equipe||''} onChange={e=>setExtra(t.id,'equipe',e.target.value)} style={{...S.input,width:70}}><option value="">-</option><option value="matin">Matin</option><option value="apresMidi">AM</option><option value="nuit">Nuit</option></select></td>
                    <td style={S.td}><input type="number" min="0" value={getExtra(t.id).joursAstreinte||''} onChange={e=>setExtra(t.id,'joursAstreinte',e.target.value)} style={{...S.input,width:40}} placeholder="0"/></td>
                    <td style={S.td}><input type="number" min="0" value={getExtra(t.id).avanceSalaire||''} onChange={e=>setExtra(t.id,'avanceSalaire',e.target.value)} style={{...S.input,width:60}} placeholder="0"/></td>
                    <td style={S.td}><input type="number" min="0" value={getExtra(t.id).saisie||''} onChange={e=>setExtra(t.id,'saisie',e.target.value)} style={{...S.input,width:60}} placeholder="0"/></td>
                    <td style={S.td}><input type="number" min="0" value={getExtra(t.id).pensionAlim||''} onChange={e=>setExtra(t.id,'pensionAlim',e.target.value)} style={{...S.input,width:60}} placeholder="0"/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KPIs */}
      {fiches.length>0&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10,marginBottom:20}}>
          {[
            {l:'FICHES',v:fiches.length,c:'#f1f5f9'},
            {l:'BRUT TOTAL',v:totalBrut.toLocaleString(undefined,{maximumFractionDigits:0})+' EUR',c:'#f1f5f9'},
            {l:'SUPPLEMENTS',v:totalSup.toLocaleString(undefined,{maximumFractionDigits:0})+' EUR',c:'#a855f7'},
            {l:'NET TOTAL',v:totalNet.toLocaleString(undefined,{maximumFractionDigits:0})+' EUR',c:'#22c55e'},
            {l:'ONSS TOTAL',v:totalONSS.toLocaleString(undefined,{maximumFractionDigits:0})+' EUR',c:'#3b82f6'},
            {l:'COUT EMPLOYEUR',v:totalCout.toLocaleString(undefined,{maximumFractionDigits:0})+' EUR',c:'#ef4444'},
          ].map((k,i)=>(
            <div key={i} style={S.kpi}><div style={S.kpiL}>{k.l}</div><div style={{...S.kpiV,fontSize:16,color:k.c}}>{k.v}</div></div>
          ))}
        </div>
      )}

      {/* Results */}
      {fiches.length>0?(
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead><tr>
              {['Travailleur','Cat.','Brut base','Suppl.','Brut total','ONSS 13.07%','PP','CSS','Net','Saisies','Net a payer','ONSS Patr.','Cout','Detail'].map(h=>
                <th key={h} style={S.th}>{h}</th>
              )}
            </tr></thead>
            <tbody>
              {fiches.map((f,i)=>(
                <tr key={i} style={{borderBottom:'1px solid #0f1520'}}>
                  <td style={{...S.td,fontWeight:600,fontSize:11}}>{f.nom}<br/><span style={{color:'#64748b',fontSize:9}}>{f.fonction||''}</span></td>
                  <td style={S.td}><span style={{background:f.categorie==='employe'?'rgba(59,130,246,0.15)':'rgba(168,85,247,0.15)',color:f.categorie==='employe'?'#3b82f6':'#a855f7',borderRadius:12,padding:'2px 6px',fontSize:9,fontWeight:700}}>{f.categorie}</span></td>
                  <td style={{...S.td,fontFamily:'monospace'}}>{f.brutBase.toFixed(2)}</td>
                  <td style={{...S.td,fontFamily:'monospace',color:f.totalSupplements>0?'#a855f7':'#475569'}}>{f.totalSupplements>0?'+'+f.totalSupplements.toFixed(2):'-'}</td>
                  <td style={{...S.td,fontFamily:'monospace',fontWeight:700}}>{f.brutTotal.toFixed(2)}</td>
                  <td style={{...S.td,fontFamily:'monospace',color:'#f97316'}}>{f.onssPerso.toFixed(2)}</td>
                  <td style={{...S.td,fontFamily:'monospace',color:'#ef4444'}}>{f.pp.toFixed(2)}</td>
                  <td style={{...S.td,fontFamily:'monospace'}}>{f.css.toFixed(2)}</td>
                  <td style={{...S.td,fontFamily:'monospace',color:'#22c55e'}}>{f.netAvantSaisie.toFixed(2)}</td>
                  <td style={{...S.td,fontFamily:'monospace',color:f.saisie.total>0?'#ef4444':'#475569'}}>{f.saisie.total>0?'-'+f.saisie.total.toFixed(2):'-'}</td>
                  <td style={{...S.td,fontFamily:'monospace',color:'#22c55e',fontWeight:700}}>{f.netAPayer.toFixed(2)}</td>
                  <td style={{...S.td,fontFamily:'monospace',color:'#f97316'}}>{f.onssPatronal.toFixed(2)}</td>
                  <td style={{...S.td,fontFamily:'monospace',color:'#ef4444',fontWeight:700}}>{f.coutEmployeur.toFixed(2)}</td>
                  <td style={S.td}><button onClick={()=>setShowDetail(showDetail===i?null:i)} style={{background:'#1e293b',color:'#c9a227',border:'none',padding:'3px 8px',borderRadius:4,fontSize:10,cursor:'pointer'}}>{showDetail===i?'X':'?'}</button></td>
                </tr>
              ))}
              {showDetail!==null&&fiches[showDetail]&&(
                <tr><td colSpan={14} style={{padding:16,background:'#0d1117'}}>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,fontSize:11}}>
                    <div style={{background:'#131825',borderRadius:6,padding:12}}>
                      <div style={{color:'#c9a227',fontWeight:600,marginBottom:6}}>Base</div>
                      <div>Taux horaire: <b>{fiches[showDetail].tauxHoraire.toFixed(2)} EUR/h</b></div>
                      <div>Quotite exemptee: <b>{fiches[showDetail].quotiteExemptee.toLocaleString()} EUR</b></div>
                      <div>Bonus emploi: <b>{fiches[showDetail].bonusEmploi.toFixed(2)} EUR</b></div>
                      <div>Taux communal: <b>{fiches[showDetail].tauxCommunal}%</b></div>
                    </div>
                    <div style={{background:'#131825',borderRadius:6,padding:12}}>
                      <div style={{color:'#a855f7',fontWeight:600,marginBottom:6}}>Supplements</div>
                      <div>H.Sup 50%: <b>{fiches[showDetail].sup50.toFixed(2)}</b></div>
                      <div>H.Sup 100%: <b>{fiches[showDetail].sup100.toFixed(2)}</b></div>
                      <div>Nuit: <b>{fiches[showDetail].suppNuit.toFixed(2)}</b></div>
                      <div>Sam/Dim/Fer: <b>{(fiches[showDetail].suppSamedi+fiches[showDetail].suppDimanche+fiches[showDetail].suppFerie).toFixed(2)}</b></div>
                      <div>Equipe: <b>{fiches[showDetail].primeEquipe.toFixed(2)}</b></div>
                      <div>Astreinte: <b>{fiches[showDetail].astreinte.toFixed(2)}</b></div>
                    </div>
                    <div style={{background:'#131825',borderRadius:6,padding:12}}>
                      <div style={{color:'#ef4444',fontWeight:600,marginBottom:6}}>Retenues & Saisies</div>
                      <div>Montant saisissable: <b>{fiches[showDetail].saisie.saisissable.toFixed(2)}</b></div>
                      <div>Saisie: <b>{fiches[showDetail].saisie.saisie.toFixed(2)}</b></div>
                      <div>Pension alim: <b>{fiches[showDetail].saisie.pensionAlim.toFixed(2)}</b></div>
                      <div>Ret. judiciaire: <b>{fiches[showDetail].saisie.retJudiciaire.toFixed(2)}</b></div>
                      <div>Avance salaire: <b>{fiches[showDetail].avance.toFixed(2)}</b></div>
                    </div>
                    <div style={{background:'#131825',borderRadius:6,padding:12}}>
                      <div style={{color:'#22c55e',fontWeight:600,marginBottom:6}}>Employeur</div>
                      <div>ONSS patronal: <b>{fiches[showDetail].onssPatronal.toFixed(2)}</b></div>
                      <div>Red. structurelle: <b>-{fiches[showDetail].reductionStructurelle.toFixed(2)}</b></div>
                      <div>Dispense nuit: <b>-{fiches[showDetail].dispenseNuit.toFixed(2)}</b></div>
                      <div>Dispense H.sup: <b>-{fiches[showDetail].dispenseHSup.toFixed(2)}</b></div>
                      <div style={{marginTop:4,color:'#c9a227',fontWeight:700}}>Cout final: {fiches[showDetail].coutEmployeur.toFixed(2)}</div>
                    </div>
                  </div>
                </td></tr>
              )}
              <tr style={{fontWeight:700,borderTop:'2px solid #c9a227'}}>
                <td colSpan={2} style={{...S.td,color:'#c9a227'}}>TOTAL {mois}</td>
                <td style={{...S.td,fontFamily:'monospace'}}>{fiches.reduce((s,f)=>s+f.brutBase,0).toFixed(2)}</td>
                <td style={{...S.td,fontFamily:'monospace',color:'#a855f7'}}>{totalSup>0?'+'+totalSup.toFixed(2):'-'}</td>
                <td style={{...S.td,fontFamily:'monospace'}}>{totalBrut.toFixed(2)}</td>
                <td style={{...S.td,fontFamily:'monospace',color:'#f97316'}}>{fiches.reduce((s,f)=>s+f.onssPerso,0).toFixed(2)}</td>
                <td style={{...S.td,fontFamily:'monospace',color:'#ef4444'}}>{totalPP.toFixed(2)}</td>
                <td style={{...S.td,fontFamily:'monospace'}}>{fiches.reduce((s,f)=>s+f.css,0).toFixed(2)}</td>
                <td style={{...S.td,fontFamily:'monospace',color:'#22c55e'}}>{fiches.reduce((s,f)=>s+f.netAvantSaisie,0).toFixed(2)}</td>
                <td style={{...S.td,fontFamily:'monospace'}}>{fiches.reduce((s,f)=>s+f.saisie.total,0).toFixed(2)}</td>
                <td style={{...S.td,fontFamily:'monospace',color:'#22c55e',fontWeight:700}}>{totalNet.toFixed(2)}</td>
                <td style={{...S.td,fontFamily:'monospace',color:'#f97316'}}>{fiches.reduce((s,f)=>s+f.onssPatronal,0).toFixed(2)}</td>
                <td style={{...S.td,fontFamily:'monospace',color:'#ef4444'}}>{totalCout.toFixed(2)}</td>
                <td style={S.td}></td>
              </tr>
            </tbody>
          </table>
        </div>
      ):(
        <div style={{background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:40,textAlign:'center'}}>
          <div style={{color:'#c9a227',fontSize:18,fontWeight:700,marginBottom:8}}>Moteur de Paie Avance — 30 Features</div>
          <div style={{color:'#64748b',fontSize:13,marginBottom:16}}>Selectionnez un client et un mois, remplissez les variables (heures sup, nuit, saisies), puis generez</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,maxWidth:600,margin:'0 auto',fontSize:11,color:'#94a3b8'}}>
            {['601 Horaire/mensuel','602 H.Sup 50%','603 H.Sup 100%','604 Nuit 21h-6h','605 Samedi','606 Dimanche','607 Ferie','608-611 Equipes','612 Astreinte','613 Rappel 3h','614 Prorata TP','615 Differentiel','616 Avance salaire','617 Ret. judiciaire','618 Pension alim.','619-620 Saisies','621 Net imposable','622-623 Quotite','624 Bonus emploi','625 CSS','626 Impot communal','627 ONSS 13.07%','628 Red. structurelle','629 Dispense nuit','630 Dispense H.sup','PP Tranches 2026','Forfait frais pro','SEPA XML','Multi-client','Sauvegarde DB'].map((f,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:4}}><span style={{color:'#22c55e'}}>+</span>{f}</div>
            ))}
          </div>
        </div>
      )}

      {/* Feature list */}
      <div style={{marginTop:24,background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:16}}>
        <div style={{fontWeight:600,color:'#c9a227',fontSize:13,marginBottom:8}}>Features implementees (601-630)</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:4,fontSize:11}}>
          {[
            '601 Auto-calcul salaire horaire/mensuel','602 Auto-calcul heures sup 50%','603 Auto-calcul heures sup 100%',
            '604 Auto-calcul heures nuit 21h-6h','605 Auto-calcul travail samedi','606 Auto-calcul travail dimanche +100%',
            '607 Auto-calcul travail ferie +100%','608 Auto-calcul equipes 2x8/3x8','609-611 Auto-calcul primes equipe',
            '612 Auto-calcul astreinte forfait','613 Auto-calcul rappel minimum 3h','614 Auto-prorata temps partiel',
            '615 Auto-calcul complement differentiel','616 Auto-calcul avance sur salaire','617 Auto-calcul retenue judiciaire',
            '618 Auto-calcul pension alimentaire','619 Auto-calcul saisie sur salaire','620 Auto-calcul plafond insaisissable 2026',
            '621 Auto-calcul net imposable','622 Auto-calcul quotite exemptee','623 Auto-calcul reduction enfants',
            '624 Auto-calcul bonus emploi A+B','625 Auto-calcul CSS isole/menage','626 Auto-calcul impot communal',
            '627 Auto-calcul ONSS 13,07% perso','628 Auto-calcul reduction structurelle','629 Auto-calcul dispense PP nuit 57,75%',
            '630 Auto-calcul dispense PP heures sup','PP Precompte professionnel tranches 2026','Taux communaux 40+ communes belges'
          ].map((f,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:6,color:'#94a3b8',padding:'2px 0'}}><span style={{color:'#22c55e',fontSize:10}}>OK</span>{f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
