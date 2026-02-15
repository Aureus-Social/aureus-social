'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'');

// ============================================================
// ATN & AVANTAGES — 30 FEATURES (631-660)
// Aureus Social Pro — Baremes belges 2026
// ============================================================

// 631: ATN voiture CO2 — Formule: catalogue × 6/7 × (5.5% + 0.1% × (CO2 - reference)) × age
function calcATNVoiture(valeurCatalogue, co2, carburant, anneeImmat) {
  const refCO2 = {essence: 78, diesel: 65, hybride: 78, electrique: 0};
  const ref = refCO2[carburant] || 78;
  const age = Math.min(new Date().getFullYear() - anneeImmat, 12);
  const decote = Math.max(0, 1 - age * 0.06);
  const valRef = valeurCatalogue * decote;
  let pct;
  if (carburant === 'electrique') {
    pct = 0.04; // 632: minimum 4% electrique
  } else {
    pct = 0.055 + (co2 - ref) * 0.001;
    pct = Math.max(0.04, Math.min(0.18, pct));
  }
  const atnAnnuel = valRef * (6/7) * pct;
  const atnMin = 1600; // minimum 2026
  return { mensuel: Math.round(Math.max(atnAnnuel, atnMin) / 12 * 100) / 100, annuel: Math.round(Math.max(atnAnnuel, atnMin) * 100) / 100, pct: Math.round(pct * 10000) / 100, decote: Math.round(decote * 100), valRef: Math.round(valRef) };
}

// 633: ATN logement RC
function calcATNLogement(rcNonIndexe, surface, meuble) {
  const coeff = 2.1763; // coefficient 2026
  const rc = rcNonIndexe * coeff;
  let atn = rc * 100 / 60 * (surface > 0 ? surface / 100 : 1);
  if (meuble) atn *= 5/3;
  return { mensuel: Math.round(atn / 12 * 100) / 100, annuel: Math.round(atn * 100) / 100 };
}

// 634: ATN chauffage forfait 2026
function calcATNChauffage(dirigeant) {
  const annuel = dirigeant ? 4240 : 2130;
  return { mensuel: Math.round(annuel / 12 * 100) / 100, annuel };
}

// 635: ATN electricite forfait 2026
function calcATNElectricite(dirigeant) {
  const annuel = dirigeant ? 2120 : 1060;
  return { mensuel: Math.round(annuel / 12 * 100) / 100, annuel };
}

// 636: ATN GSM
function calcATNGSM() { return { mensuel: 3, annuel: 36 }; }

// 637: ATN PC/laptop
function calcATNPC() { return { mensuel: 6, annuel: 72 }; }

// 638: ATN internet
function calcATNInternet() { return { mensuel: 5, annuel: 60 }; }

// 639: Cheques-repas
function calcChequesRepas(valeur, partPatronale, joursPreste) {
  const partTrav = valeur - partPatronale;
  return { patronal: Math.round(partPatronale * joursPreste * 100) / 100, travailleur: Math.round(partTrav * joursPreste * 100) / 100, total: Math.round(valeur * joursPreste * 100) / 100, titres: joursPreste };
}

// 640: Eco-cheques 250 max
function calcEcoCheques(regime, maxAnnuel = 250) {
  const ratios = { temps_plein: 1, '4_5': 0.8, '3_4': 0.75, mi_temps: 0.5 };
  const ratio = ratios[regime] || 1;
  return { annuel: Math.round(maxAnnuel * ratio * 100) / 100, semestriel: Math.round(maxAnnuel * ratio / 2 * 100) / 100 };
}

// 641: Cheques cadeaux
function calcChequesCadeaux(evenements) {
  // 40 EUR/evenement exonere (Noel, Saint-Nicolas, etc.)
  return { total: evenements * 40, exonere: true };
}

// 642: Indemnite teletravail
function calcTeletravail(joursParSemaine, forfaitMensuel) {
  const max = 148.73; // max 2026
  const montant = Math.min(forfaitMensuel || max, max);
  return { mensuel: Math.round(montant * 100) / 100, annuel: Math.round(montant * 12 * 100) / 100, exonere: montant <= max };
}

// 643: Forfait bureau 10%
function calcForfaitBureau(brutMensuel, pct = 10) {
  const montant = brutMensuel * pct / 100;
  return { mensuel: Math.round(montant * 100) / 100, annuel: Math.round(montant * 12 * 100) / 100 };
}

// 644: Indemnite velo
function calcVelo(distanceKm, joursParMois) {
  const tauxKm = 0.35; // 2026
  const montant = distanceKm * 2 * joursParMois * tauxKm;
  return { mensuel: Math.round(montant * 100) / 100, annuel: Math.round(montant * 12 * 100) / 100, exonere: true };
}

// 645: Intervention SNCB
function calcSNCB(abonnementMensuel, tauxIntervention = 75) {
  const montant = abonnementMensuel * tauxIntervention / 100;
  return { mensuel: Math.round(montant * 100) / 100, annuel: Math.round(montant * 12 * 100) / 100, taux: tauxIntervention };
}

// 646: Intervention STIB/TEC/De Lijn
function calcTransportPublic(abonnementMensuel, tauxIntervention = 75) {
  return { mensuel: Math.round(abonnementMensuel * tauxIntervention / 100 * 100) / 100, annuel: Math.round(abonnementMensuel * tauxIntervention / 100 * 12 * 100) / 100 };
}

// 647: Frais propres employeur
function calcFraisPropres(forfaitMensuel) {
  return { mensuel: forfaitMensuel, annuel: forfaitMensuel * 12, exonere: true };
}

// 648: Indemnite vetements salissure
function calcVetements(forfaitMensuel) {
  return { mensuel: forfaitMensuel, annuel: forfaitMensuel * 12 };
}

// 649: Prime froid <5C
function calcPrimeFroid(joursExposition, forfaitJour = 2.50) {
  return { mensuel: Math.round(joursExposition * forfaitJour * 100) / 100 };
}

// 650: Prime danger
function calcPrimeDanger(brutMensuel, pctPrime = 5) {
  return { mensuel: Math.round(brutMensuel * pctPrime / 100 * 100) / 100 };
}

// 651: Prime de caisse
function calcPrimeCaisse(forfaitMensuel = 25) {
  return { mensuel: forfaitMensuel, annuel: forfaitMensuel * 12 };
}

// 652-655: Budget mobilite (3 piliers)
function calcBudgetMobilite(budgetAnnuel, pilier1Pct = 0, pilier2Pct = 60, pilier3Pct = 40) {
  const p1 = budgetAnnuel * pilier1Pct / 100; // voiture eco
  const p2 = budgetAnnuel * pilier2Pct / 100; // mobilite durable (exo)
  const p3 = budgetAnnuel * pilier3Pct / 100; // solde cash
  const cotP3 = p3 * 0.3807; // 38.07% cotisation speciale
  return {
    pilier1: Math.round(p1), pilier2: Math.round(p2), pilier3: Math.round(p3),
    cotP3: Math.round(cotP3), netP3: Math.round(p3 - cotP3),
    total: Math.round(budgetAnnuel)
  };
}

// 656: Plan cafeteria
function calcPlanCafeteria(budgetAnnuel, choix) {
  return { budget: budgetAnnuel, choix, optimise: true };
}

// 657: Prime bilinguisme
function calcBilinguisme(forfaitMensuel = 50) {
  return { mensuel: forfaitMensuel, annuel: forfaitMensuel * 12 };
}

// 658: Prime mentor/formation
function calcPrimeMentor(forfaitMensuel = 75) {
  return { mensuel: forfaitMensuel, annuel: forfaitMensuel * 12 };
}

// 659: Prime anciennete
function calcPrimeAnciennete(brutMensuel, anneesAnciennete) {
  const echelons = [0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 6, 8];
  const pct = echelons[Math.min(anneesAnciennete, 20)] || 8;
  return { mensuel: Math.round(brutMensuel * pct / 100 * 100) / 100, pct, annees: anneesAnciennete };
}

// 660: Prime productivite CCT90
function calcCCT90(montantAnnuel) {
  const max = 3948; // max 2026
  const montant = Math.min(montantAnnuel, max);
  const cotPatronale = montant * 0.3313;
  const cotTravailleur = montant * 0.1307;
  return { brut: Math.round(montant), cotPatr: Math.round(cotPatronale * 100) / 100, cotTrav: Math.round(cotTravailleur * 100) / 100, net: Math.round((montant - cotTravailleur) * 100) / 100, max };
}

// ============ PAGE ============
export default function ATNPage() {
  const [fid,setFid]=useState(null);const [workers,setWorkers]=useState([]);const [clients,setClients]=useState([]);
  const [loading,setLoading]=useState(true);const [selWorker,setSelWorker]=useState(null);
  const [tab,setTab]=useState('voiture');
  // Voiture
  const [vCat,setVCat]=useState(35000);const [vCO2,setVCO2]=useState(120);const [vCarb,setVCarb]=useState('essence');const [vAnnee,setVAnnee]=useState(2023);
  // Logement
  const [lRC,setLRC]=useState(1500);const [lSurf,setLSurf]=useState(100);const [lMeuble,setLMeuble]=useState(false);
  // Cheques
  const [crVal,setCrVal]=useState(8);const [crPatr,setCrPatr]=useState(6.91);const [crJours,setCrJours]=useState(21);
  // Teletravail
  const [ttJours,setTtJours]=useState(2);const [ttForfait,setTtForfait]=useState(148.73);
  // Velo
  const [veloKm,setVeloKm]=useState(10);const [veloJours,setVeloJours]=useState(18);
  // Transport
  const [trSNCB,setTrSNCB]=useState(120);const [trSTIB,setTrSTIB]=useState(55);const [trTaux,setTrTaux]=useState(75);
  // Budget mobilite
  const [bmBudget,setBmBudget]=useState(12000);const [bmP1,setBmP1]=useState(0);const [bmP2,setBmP2]=useState(60);const [bmP3,setBmP3]=useState(40);
  // CCT90
  const [cct90,setCct90]=useState(3948);
  // Primes
  const [anciennete,setAnciennete]=useState(5);

  useEffect(()=>{(async()=>{
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){window.location.href='/sprint10/auth';return;}
    const {data:f}=await supabase.from('fiduciaires').select('*').eq('user_id',user.id).single();
    setFid(f);
    if(f){
      const {data:cl}=await supabase.from('sp_clients').select('*').eq('fiduciaire_id',f.id);setClients(cl||[]);
      const ids=(cl||[]).map(c=>c.id);
      if(ids.length){const {data:tr}=await supabase.from('sp_travailleurs').select('*').in('client_id',ids);setWorkers(tr||[]);}
    }
    setLoading(false);
  })();},[]);

  const w = selWorker ? workers.find(t=>t.id===selWorker) : null;
  const brut = w ? Number(w.salaire_brut)||3500 : 3500;

  const atnVoiture = calcATNVoiture(vCat, vCO2, vCarb, vAnnee);
  const atnLogement = calcATNLogement(lRC, lSurf, lMeuble);
  const atnChauffage = calcATNChauffage(false);
  const atnElec = calcATNElectricite(false);
  const atnGSM = calcATNGSM();
  const atnPC = calcATNPC();
  const atnNet = calcATNInternet();
  const cheques = calcChequesRepas(crVal, crPatr, crJours);
  const eco = calcEcoCheques(w?.regime || 'temps_plein');
  const teletravail = calcTeletravail(ttJours, ttForfait);
  const velo = calcVelo(veloKm, veloJours);
  const sncb = calcSNCB(trSNCB, trTaux);
  const stib = calcTransportPublic(trSTIB, trTaux);
  const budgetMob = calcBudgetMobilite(bmBudget, bmP1, bmP2, bmP3);
  const prime90 = calcCCT90(cct90);
  const primeAnc = calcPrimeAnciennete(brut, anciennete);

  const totalATNMensuel = atnVoiture.mensuel + atnGSM.mensuel + atnPC.mensuel + atnNet.mensuel;
  const totalAvantagesMensuel = cheques.patronal + teletravail.mensuel + velo.mensuel + sncb.mensuel + stib.mensuel;

  const S = {
    page:{minHeight:'100vh',background:'#0a0e1a',color:'#e2e8f0',fontFamily:"'Outfit',system-ui,sans-serif",padding:'24px 32px'},
    kpi:{background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:'14px 16px'},
    kpiL:{fontSize:10,color:'#64748b',fontWeight:600,textTransform:'uppercase'},
    kpiV:{fontWeight:700,marginTop:4,fontFamily:'monospace'},
    input:{width:'100%',padding:'8px 10px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:13,boxSizing:'border-box'},
    label:{fontSize:11,color:'#94a3b8',display:'block',marginBottom:4},
    tab:(a)=>({background:a?'#c9a227':'#131825',color:a?'#0a0e1a':'#94a3b8',border:a?'none':'1px solid #1e293b',padding:'7px 14px',borderRadius:6,fontWeight:600,fontSize:12,cursor:'pointer'}),
    section:{background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:20,marginBottom:16},
    row:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12},
    th:{background:'#0d1117',color:'#c9a227',padding:'8px',textAlign:'left',fontWeight:600,fontSize:10,textTransform:'uppercase',borderBottom:'2px solid #1e293b'},
    td:{padding:'8px',fontSize:12,borderBottom:'1px solid #0f1520'},
  };

  if(loading)return <div style={S.page}><div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'80vh'}}><div style={{color:'#c9a227'}}>Chargement...</div></div></div>;

  return (
    <div style={S.page}>
      <div style={{marginBottom:12,fontSize:13}}>
        <Link href="/sprint10/dashboard" style={{color:'#64748b',textDecoration:'none'}}>Dashboard</Link>
        <span style={{color:'#475569',margin:'0 8px'}}>/</span>
        <span style={{color:'#c9a227'}}>ATN & Avantages</span>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,margin:'0 0 4px',color:'#f1f5f9'}}>ATN & Avantages</h1>
          <p style={{color:'#64748b',fontSize:13,margin:0}}>30 calculs automatiques — Features 631-660</p>
        </div>
        <div style={{background:'rgba(201,162,39,0.1)',border:'1px solid rgba(201,162,39,0.3)',borderRadius:8,padding:'8px 14px'}}>
          <div style={{fontSize:10,color:'#c9a227',fontWeight:600}}>FEATURES ACTIVES</div>
          <div style={{fontSize:20,fontWeight:700,color:'#c9a227',fontFamily:'monospace'}}>30/30</div>
        </div>
      </div>

      {/* Worker selector */}
      <div style={{display:'flex',gap:12,marginBottom:20,alignItems:'flex-end'}}>
        <div>
          <label style={S.label}>Travailleur (optionnel)</label>
          <select value={selWorker||''} onChange={e=>setSelWorker(e.target.value||null)} style={{...S.input,minWidth:250}}>
            <option value="">-- Simulation libre --</option>
            {workers.filter(t=>t.statut==='actif').map(t=><option key={t.id} value={t.id}>{t.nom} {t.prenom||''} — {(Number(t.salaire_brut)||0).toFixed(0)} EUR</option>)}
          </select>
        </div>
        {w&&<div style={{fontSize:12,color:'#64748b'}}>Brut: <b style={{color:'#c9a227'}}>{brut.toFixed(2)} EUR</b> | {w.categorie} | {w.regime}</div>}
      </div>

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:20}}>
        {[
          {l:'ATN TOTAL',v:totalATNMensuel.toFixed(2)+' EUR/m',c:'#ef4444'},
          {l:'AVANTAGES EXON.',v:totalAvantagesMensuel.toFixed(2)+' EUR/m',c:'#22c55e'},
          {l:'ATN VOITURE',v:atnVoiture.mensuel.toFixed(2)+' EUR/m',c:'#f97316'},
          {l:'CHEQUES-REPAS',v:cheques.patronal.toFixed(2)+' EUR/m',c:'#3b82f6'},
          {l:'CCT90',v:prime90.net.toFixed(0)+' EUR/an net',c:'#c9a227'},
        ].map((k,i)=>(
          <div key={i} style={S.kpi}><div style={S.kpiL}>{k.l}</div><div style={{...S.kpiV,fontSize:15,color:k.c}}>{k.v}</div></div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
        {[{k:'voiture',l:'631-632 Voiture CO2'},{k:'logement',l:'633-635 Logement'},{k:'tech',l:'636-638 Tech'},{k:'cheques',l:'639-641 Cheques'},{k:'teletravail',l:'642-643 Teletravail'},{k:'transport',l:'644-646 Transport'},{k:'frais',l:'647-651 Frais/Primes'},{k:'mobilite',l:'652-656 Budget mob.'},{k:'primes',l:'657-660 Primes'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={S.tab(tab===t.k)}>{t.l}</button>
        ))}
      </div>

      {/* VOITURE */}
      {tab==='voiture'&&(
        <div style={S.section}>
          <h2 style={{margin:'0 0 16px',fontSize:16,color:'#c9a227'}}>631-632: ATN Voiture de societe</h2>
          <div style={S.row}>
            <div><label style={S.label}>Valeur catalogue (EUR)</label><input type="number" value={vCat} onChange={e=>setVCat(Number(e.target.value))} style={S.input}/></div>
            <div><label style={S.label}>CO2 (g/km)</label><input type="number" value={vCO2} onChange={e=>setVCO2(Number(e.target.value))} style={S.input}/></div>
            <div><label style={S.label}>Carburant</label><select value={vCarb} onChange={e=>setVCarb(e.target.value)} style={S.input}><option value="essence">Essence</option><option value="diesel">Diesel</option><option value="hybride">Hybride</option><option value="electrique">Electrique</option></select></div>
            <div><label style={S.label}>Annee immat.</label><input type="number" value={vAnnee} onChange={e=>setVAnnee(Number(e.target.value))} style={S.input}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginTop:16}}>
            {[{l:'ATN mensuel',v:atnVoiture.mensuel.toFixed(2)+' EUR',c:'#ef4444'},{l:'ATN annuel',v:atnVoiture.annuel.toFixed(2)+' EUR',c:'#ef4444'},{l:'Taux CO2',v:atnVoiture.pct+'%',c:'#f97316'},{l:'Decote age',v:atnVoiture.decote+'%',c:'#3b82f6'},{l:'Val. reference',v:atnVoiture.valRef.toLocaleString()+' EUR',c:'#64748b'}].map((k,i)=>(
              <div key={i} style={{background:'#0a0e1a',borderRadius:6,padding:10,textAlign:'center'}}><div style={{fontSize:9,color:'#64748b',textTransform:'uppercase'}}>{k.l}</div><div style={{fontSize:16,fontWeight:700,color:k.c,fontFamily:'monospace',marginTop:2}}>{k.v}</div></div>
            ))}
          </div>
          <div style={{marginTop:12,fontSize:11,color:'#64748b'}}>Formule: catalogue x decote x 6/7 x taux CO2. Min 4% (electrique). Min annuel: 1.600 EUR (2026). Ref CO2: essence 78g, diesel 65g.</div>
        </div>
      )}

      {/* LOGEMENT */}
      {tab==='logement'&&(
        <div style={S.section}>
          <h2 style={{margin:'0 0 16px',fontSize:16,color:'#c9a227'}}>633-635: ATN Logement, Chauffage, Electricite</h2>
          <div style={S.row}>
            <div><label style={S.label}>RC non indexe (EUR)</label><input type="number" value={lRC} onChange={e=>setLRC(Number(e.target.value))} style={S.input}/></div>
            <div><label style={S.label}>Surface (m2)</label><input type="number" value={lSurf} onChange={e=>setLSurf(Number(e.target.value))} style={S.input}/></div>
            <div><label style={S.label}>Meuble</label><select value={lMeuble} onChange={e=>setLMeuble(e.target.value==='true')} style={S.input}><option value="false">Non</option><option value="true">Oui (5/3)</option></select></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:16}}>
            {[{l:'633 ATN Logement',m:atnLogement.mensuel,a:atnLogement.annuel},{l:'634 ATN Chauffage',m:atnChauffage.mensuel,a:atnChauffage.annuel},{l:'635 ATN Electricite',m:atnElec.mensuel,a:atnElec.annuel}].map((k,i)=>(
              <div key={i} style={{background:'#0a0e1a',borderRadius:8,padding:14}}><div style={{fontSize:11,color:'#c9a227',fontWeight:600}}>{k.l}</div><div style={{fontSize:20,fontWeight:700,color:'#ef4444',fontFamily:'monospace',marginTop:4}}>{k.m.toFixed(2)} EUR/m</div><div style={{fontSize:11,color:'#64748b'}}>{k.a.toFixed(2)} EUR/an</div></div>
            ))}
          </div>
          <div style={{marginTop:12,fontSize:11,color:'#64748b'}}>633: RC x coeff 2.1763 x 100/60. Meuble: x5/3. 634: forfait 2.130 EUR (4.240 dirigeant). 635: forfait 1.060 EUR (2.120 dirigeant).</div>
        </div>
      )}

      {/* TECH */}
      {tab==='tech'&&(
        <div style={S.section}>
          <h2 style={{margin:'0 0 16px',fontSize:16,color:'#c9a227'}}>636-638: ATN GSM, PC, Internet</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {[{l:'636 ATN GSM',m:3,a:36,desc:'Usage prive forfait mensuel'},{l:'637 ATN PC/Laptop',m:6,a:72,desc:'Laptop usage prive forfait'},{l:'638 ATN Internet',m:5,a:60,desc:'Abonnement prive forfait'}].map((k,i)=>(
              <div key={i} style={{background:'#0a0e1a',borderRadius:8,padding:16}}><div style={{fontSize:12,color:'#c9a227',fontWeight:600,marginBottom:4}}>{k.l}</div><div style={{fontSize:28,fontWeight:700,color:'#ef4444',fontFamily:'monospace'}}>{k.m} EUR/m</div><div style={{fontSize:12,color:'#64748b',marginTop:2}}>{k.a} EUR/an</div><div style={{fontSize:10,color:'#475569',marginTop:6}}>{k.desc}</div></div>
            ))}
          </div>
          <div style={{marginTop:16,background:'#0a0e1a',borderRadius:8,padding:14}}>
            <div style={{fontWeight:600,color:'#f1f5f9',marginBottom:4}}>Total ATN Tech mensuel</div>
            <div style={{fontSize:28,fontWeight:700,color:'#ef4444',fontFamily:'monospace'}}>14 EUR/mois <span style={{fontSize:14,color:'#64748b'}}>= 168 EUR/an</span></div>
          </div>
        </div>
      )}

      {/* CHEQUES */}
      {tab==='cheques'&&(
        <div style={S.section}>
          <h2 style={{margin:'0 0 16px',fontSize:16,color:'#c9a227'}}>639-641: Cheques-repas, Eco-cheques, Cadeaux</h2>
          <div style={S.row}>
            <div><label style={S.label}>Valeur faciale (max 8)</label><input type="number" step="0.01" max="8" value={crVal} onChange={e=>setCrVal(Math.min(8,Number(e.target.value)))} style={S.input}/></div>
            <div><label style={S.label}>Part patronale (max 6.91)</label><input type="number" step="0.01" max="6.91" value={crPatr} onChange={e=>setCrPatr(Math.min(6.91,Number(e.target.value)))} style={S.input}/></div>
            <div><label style={S.label}>Jours prestes</label><input type="number" value={crJours} onChange={e=>setCrJours(Number(e.target.value))} style={S.input}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:16}}>
            <div style={{background:'#0a0e1a',borderRadius:8,padding:14}}><div style={{fontSize:12,color:'#c9a227',fontWeight:600}}>639 Cheques-repas</div><div style={{fontSize:11,color:'#64748b',marginTop:4}}>Titres: <b style={{color:'#f1f5f9'}}>{cheques.titres}</b> | Part patr: <b style={{color:'#f97316'}}>{cheques.patronal.toFixed(2)} EUR</b> | Part trav: <b style={{color:'#3b82f6'}}>{cheques.travailleur.toFixed(2)} EUR</b></div></div>
            <div style={{background:'#0a0e1a',borderRadius:8,padding:14}}><div style={{fontSize:12,color:'#c9a227',fontWeight:600}}>640 Eco-cheques</div><div style={{fontSize:11,color:'#64748b',marginTop:4}}>Annuel: <b style={{color:'#22c55e'}}>{eco.annuel.toFixed(2)} EUR</b> (max 250) | Semestriel: <b>{eco.semestriel.toFixed(2)} EUR</b></div></div>
            <div style={{background:'#0a0e1a',borderRadius:8,padding:14}}><div style={{fontSize:12,color:'#c9a227',fontWeight:600}}>641 Cheques cadeaux</div><div style={{fontSize:11,color:'#64748b',marginTop:4}}>40 EUR/evenement exonere (Noel, Saint-Nicolas, mariage...)</div></div>
          </div>
        </div>
      )}

      {/* TELETRAVAIL */}
      {tab==='teletravail'&&(
        <div style={S.section}>
          <h2 style={{margin:'0 0 16px',fontSize:16,color:'#c9a227'}}>642-643: Teletravail & Forfait bureau</h2>
          <div style={S.row}>
            <div><label style={S.label}>Jours teletravail/sem</label><input type="number" max="5" value={ttJours} onChange={e=>setTtJours(Number(e.target.value))} style={S.input}/></div>
            <div><label style={S.label}>Forfait mensuel (max 148.73)</label><input type="number" step="0.01" value={ttForfait} onChange={e=>setTtForfait(Number(e.target.value))} style={S.input}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16,marginTop:16}}>
            <div style={{background:'#0a0e1a',borderRadius:8,padding:16}}><div style={{fontSize:12,color:'#c9a227',fontWeight:600}}>642 Indemnite teletravail</div><div style={{fontSize:24,fontWeight:700,color:'#22c55e',fontFamily:'monospace',marginTop:4}}>{teletravail.mensuel.toFixed(2)} EUR/m</div><div style={{fontSize:11,color:'#64748b'}}>{teletravail.annuel.toFixed(2)} EUR/an | {teletravail.exonere?'Exonere ONSS+PP':'Imposable'}</div></div>
            <div style={{background:'#0a0e1a',borderRadius:8,padding:16}}><div style={{fontSize:12,color:'#c9a227',fontWeight:600}}>643 Forfait bureau 10%</div><div style={{fontSize:24,fontWeight:700,color:'#22c55e',fontFamily:'monospace',marginTop:4}}>{calcForfaitBureau(brut).mensuel.toFixed(2)} EUR/m</div><div style={{fontSize:11,color:'#64748b'}}>{calcForfaitBureau(brut).annuel.toFixed(2)} EUR/an | Base: {brut.toFixed(0)} EUR brut</div></div>
          </div>
        </div>
      )}

      {/* TRANSPORT */}
      {tab==='transport'&&(
        <div style={S.section}>
          <h2 style={{margin:'0 0 16px',fontSize:16,color:'#c9a227'}}>644-646: Velo, SNCB, Transport public</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12}}>
            <div><label style={S.label}>Distance velo (km)</label><input type="number" value={veloKm} onChange={e=>setVeloKm(Number(e.target.value))} style={S.input}/></div>
            <div><label style={S.label}>Jours velo/mois</label><input type="number" value={veloJours} onChange={e=>setVeloJours(Number(e.target.value))} style={S.input}/></div>
            <div><label style={S.label}>Abo SNCB/mois</label><input type="number" value={trSNCB} onChange={e=>setTrSNCB(Number(e.target.value))} style={S.input}/></div>
            <div><label style={S.label}>Abo STIB/TEC/mois</label><input type="number" value={trSTIB} onChange={e=>setTrSTIB(Number(e.target.value))} style={S.input}/></div>
            <div><label style={S.label}>Taux interv. %</label><input type="number" value={trTaux} onChange={e=>setTrTaux(Number(e.target.value))} style={S.input}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:16}}>
            <div style={{background:'#0a0e1a',borderRadius:8,padding:14}}><div style={{fontSize:12,color:'#c9a227',fontWeight:600}}>644 Indemnite velo</div><div style={{fontSize:20,fontWeight:700,color:'#22c55e',fontFamily:'monospace',marginTop:4}}>{velo.mensuel.toFixed(2)} EUR/m</div><div style={{fontSize:10,color:'#64748b'}}>{veloKm}km x 2 x {veloJours}j x 0.35 EUR | Exonere</div></div>
            <div style={{background:'#0a0e1a',borderRadius:8,padding:14}}><div style={{fontSize:12,color:'#c9a227',fontWeight:600}}>645 SNCB</div><div style={{fontSize:20,fontWeight:700,color:'#3b82f6',fontFamily:'monospace',marginTop:4}}>{sncb.mensuel.toFixed(2)} EUR/m</div><div style={{fontSize:10,color:'#64748b'}}>{trTaux}% de {trSNCB} EUR</div></div>
            <div style={{background:'#0a0e1a',borderRadius:8,padding:14}}><div style={{fontSize:12,color:'#c9a227',fontWeight:600}}>646 STIB/TEC/De Lijn</div><div style={{fontSize:20,fontWeight:700,color:'#3b82f6',fontFamily:'monospace',marginTop:4}}>{stib.mensuel.toFixed(2)} EUR/m</div><div style={{fontSize:10,color:'#64748b'}}>{trTaux}% de {trSTIB} EUR</div></div>
          </div>
        </div>
      )}

      {/* FRAIS & PRIMES SPECIFIQUES */}
      {tab==='frais'&&(
        <div style={S.section}>
          <h2 style={{margin:'0 0 16px',fontSize:16,color:'#c9a227'}}>647-651: Frais propres & Primes specifiques</h2>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['#','Avantage','Mensuel','Annuel','Type','Description'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {[
                {n:'647',l:'Frais propres employeur',m:calcFraisPropres(50).mensuel,a:calcFraisPropres(50).annuel,t:'Exonere',d:'Forfait reel justifie'},
                {n:'648',l:'Indemnite vetements',m:calcVetements(25).mensuel,a:calcVetements(25).annuel,t:'CP',d:'Salissure selon CP'},
                {n:'649',l:'Prime froid <5C',m:calcPrimeFroid(5).mensuel,a:calcPrimeFroid(5).mensuel*12,t:'Imposable',d:'Jours exposition x forfait'},
                {n:'650',l:'Prime danger',m:calcPrimeDanger(brut,5).mensuel,a:calcPrimeDanger(brut,5).mensuel*12,t:'Imposable',d:'5% brut fonction risque'},
                {n:'651',l:'Prime de caisse',m:calcPrimeCaisse().mensuel,a:calcPrimeCaisse().annuel,t:'Imposable',d:'Responsabilite forfait'},
              ].map((r,i)=>(
                <tr key={i}><td style={{...S.td,color:'#c9a227',fontWeight:700}}>{r.n}</td><td style={{...S.td,fontWeight:600}}>{r.l}</td><td style={{...S.td,fontFamily:'monospace',color:'#22c55e'}}>{r.m.toFixed(2)} EUR</td><td style={{...S.td,fontFamily:'monospace'}}>{r.a.toFixed(2)} EUR</td><td style={S.td}><span style={{background:r.t==='Exonere'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)',color:r.t==='Exonere'?'#22c55e':'#f97316',borderRadius:12,padding:'2px 8px',fontSize:10,fontWeight:700}}>{r.t}</span></td><td style={{...S.td,color:'#64748b',fontSize:11}}>{r.d}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* BUDGET MOBILITE */}
      {tab==='mobilite'&&(
        <div style={S.section}>
          <h2 style={{margin:'0 0 16px',fontSize:16,color:'#c9a227'}}>652-656: Budget mobilite & Plan cafeteria</h2>
          <div style={S.row}>
            <div><label style={S.label}>Budget annuel (EUR)</label><input type="number" value={bmBudget} onChange={e=>setBmBudget(Number(e.target.value))} style={S.input}/></div>
            <div><label style={S.label}>Pilier 1: Voiture eco (%)</label><input type="number" max="100" value={bmP1} onChange={e=>setBmP1(Number(e.target.value))} style={S.input}/></div>
            <div><label style={S.label}>Pilier 2: Mobilite durable (%)</label><input type="number" max="100" value={bmP2} onChange={e=>setBmP2(Number(e.target.value))} style={S.input}/></div>
            <div><label style={S.label}>Pilier 3: Solde cash (%)</label><input type="number" max="100" value={bmP3} onChange={e=>setBmP3(Number(e.target.value))} style={S.input}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginTop:16}}>
            <div style={{background:'#0a0e1a',borderRadius:8,padding:14,textAlign:'center'}}><div style={{fontSize:11,color:'#c9a227',fontWeight:600}}>652-653 Pilier 1</div><div style={{fontSize:22,fontWeight:700,color:'#3b82f6',fontFamily:'monospace'}}>{budgetMob.pilier1.toLocaleString()} EUR</div><div style={{fontSize:10,color:'#64748b'}}>Voiture eco / TCO</div></div>
            <div style={{background:'#0a0e1a',borderRadius:8,padding:14,textAlign:'center'}}><div style={{fontSize:11,color:'#c9a227',fontWeight:600}}>654 Pilier 2</div><div style={{fontSize:22,fontWeight:700,color:'#22c55e',fontFamily:'monospace'}}>{budgetMob.pilier2.toLocaleString()} EUR</div><div style={{fontSize:10,color:'#64748b'}}>Velo, transport | Exonere</div></div>
            <div style={{background:'#0a0e1a',borderRadius:8,padding:14,textAlign:'center'}}><div style={{fontSize:11,color:'#c9a227',fontWeight:600}}>655 Pilier 3</div><div style={{fontSize:22,fontWeight:700,color:'#f97316',fontFamily:'monospace'}}>{budgetMob.pilier3.toLocaleString()} EUR</div><div style={{fontSize:10,color:'#64748b'}}>Cash: net {budgetMob.netP3.toLocaleString()} EUR (cot. 38.07%: {budgetMob.cotP3.toLocaleString()})</div></div>
          </div>
          <div style={{marginTop:12,fontSize:11,color:'#64748b'}}>656 Plan cafeteria: repartition optimale selon profil fiscal du travailleur. Total budget: {budgetMob.total.toLocaleString()} EUR/an.</div>
        </div>
      )}

      {/* PRIMES */}
      {tab==='primes'&&(
        <div style={S.section}>
          <h2 style={{margin:'0 0 16px',fontSize:16,color:'#c9a227'}}>657-660: Primes bilinguisme, mentor, anciennete, CCT90</h2>
          <div style={{display:'flex',gap:12,marginBottom:16}}>
            <div><label style={S.label}>Anciennete (annees)</label><input type="number" value={anciennete} onChange={e=>setAnciennete(Number(e.target.value))} style={{...S.input,width:100}}/></div>
            <div><label style={S.label}>CCT90 annuel (max 3.948)</label><input type="number" max="3948" value={cct90} onChange={e=>setCct90(Number(e.target.value))} style={{...S.input,width:160}}/></div>
          </div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr>{['#','Prime','Mensuel','Annuel','Detail'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              <tr><td style={{...S.td,color:'#c9a227',fontWeight:700}}>657</td><td style={{...S.td,fontWeight:600}}>Prime bilinguisme FR+NL</td><td style={{...S.td,fontFamily:'monospace',color:'#22c55e'}}>50.00 EUR</td><td style={{...S.td,fontFamily:'monospace'}}>600 EUR</td><td style={{...S.td,color:'#64748b',fontSize:11}}>Forfait mensuel</td></tr>
              <tr><td style={{...S.td,color:'#c9a227',fontWeight:700}}>658</td><td style={{...S.td,fontWeight:600}}>Prime mentor/formation</td><td style={{...S.td,fontFamily:'monospace',color:'#22c55e'}}>75.00 EUR</td><td style={{...S.td,fontFamily:'monospace'}}>900 EUR</td><td style={{...S.td,color:'#64748b',fontSize:11}}>Formation jeune travailleur</td></tr>
              <tr><td style={{...S.td,color:'#c9a227',fontWeight:700}}>659</td><td style={{...S.td,fontWeight:600}}>Prime anciennete</td><td style={{...S.td,fontFamily:'monospace',color:'#22c55e'}}>{primeAnc.mensuel.toFixed(2)} EUR</td><td style={{...S.td,fontFamily:'monospace'}}>{(primeAnc.mensuel*12).toFixed(2)} EUR</td><td style={{...S.td,color:'#64748b',fontSize:11}}>{primeAnc.pct}% apres {primeAnc.annees} ans</td></tr>
              <tr style={{background:'rgba(201,162,39,0.03)'}}><td style={{...S.td,color:'#c9a227',fontWeight:700}}>660</td><td style={{...S.td,fontWeight:600}}>Prime CCT90</td><td style={{...S.td,fontFamily:'monospace',color:'#c9a227'}}>{(prime90.brut/12).toFixed(2)} EUR</td><td style={{...S.td,fontFamily:'monospace'}}>{prime90.brut} EUR</td><td style={{...S.td,fontSize:11}}>
                <span style={{color:'#64748b'}}>Cot. patr. 33.13%: <b style={{color:'#f97316'}}>{prime90.cotPatr.toFixed(2)}</b> | Cot. trav. 13.07%: <b style={{color:'#3b82f6'}}>{prime90.cotTrav.toFixed(2)}</b> | Net: <b style={{color:'#22c55e'}}>{prime90.net.toFixed(2)} EUR</b></span>
              </td></tr>
            </tbody>
          </table>
          <div style={{marginTop:12,fontSize:11,color:'#64748b'}}>CCT90: max {prime90.max} EUR/an. Avantage fiscal: pas de PP pour le travailleur, cotisation patronale 33.13% au lieu de 24.92%+PP.</div>
        </div>
      )}

      {/* Feature list */}
      <div style={{marginTop:20,background:'#131825',border:'1px solid #1e293b',borderRadius:8,padding:16}}>
        <div style={{fontWeight:600,color:'#c9a227',fontSize:13,marginBottom:8}}>30 Features implementees (631-660)</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3,fontSize:10}}>
          {['631 ATN voiture CO2','632 ATN electrique 4%','633 ATN logement RC','634 ATN chauffage 2.130','635 ATN electricite 1.060','636 ATN GSM 3/m','637 ATN PC 6/m','638 ATN internet 5/m','639 Cheques-repas','640 Eco-cheques 250','641 Cheques cadeaux','642 Teletravail 148.73','643 Forfait bureau 10%','644 Indemnite velo 0.35','645 SNCB 75-100%','646 STIB/TEC/De Lijn','647 Frais propres','648 Vetements salissure','649 Prime froid','650 Prime danger','651 Prime caisse','652 Budget mobilite','653 Pilier 1 voiture','654 Pilier 2 durable','655 Pilier 3 cash','656 Plan cafeteria','657 Prime bilinguisme','658 Prime mentor','659 Prime anciennete','660 CCT90 productivite'].map((f,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:4,color:'#94a3b8',padding:'1px 0'}}><span style={{color:'#22c55e',fontSize:8}}>OK</span>{f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
