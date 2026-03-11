'use client';
import { PV_DOUBLE } from '@/app/lib/helpers';
// Solde de Tout Compte — Loi 03/07/1978 + AR 09/06/2004
import { useState, useMemo } from 'react';
import { C, fmt, f2, RMMMG, TX_ONSS_W, LOIS_BELGES } from '@/app/lib/helpers';
const GOLD='#c6a34e',GREEN='#22c55e',BLUE='#60a5fa',RED='#ef4444',PURPLE='#a78bfa';

function calcPreavis(anciennete, statut) {
  if (statut === 'ouvrier') {
    if (anciennete < 0.5) return { s: 1, base: 'Loi 26/12/2013' };
    if (anciennete < 1) return { s: 3, base: 'Loi 26/12/2013' };
    if (anciennete < 2) return { s: 6, base: 'Loi 26/12/2013' };
    if (anciennete < 3) return { s: 10, base: 'Loi 26/12/2013' };
    return { s: Math.min(13 + Math.floor(anciennete - 3) * 3, 62), base: 'Loi 26/12/2013' };
  }
  if (anciennete < 0.25) return { s: 2, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 0.5) return { s: 3, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 1) return { s: 4, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 2) return { s: 8, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 3) return { s: 12, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 4) return { s: 13, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 5) return { s: 15, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 6) return { s: 18, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 7) return { s: 21, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 8) return { s: 24, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 9) return { s: 27, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 10) return { s: 30, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 11) return { s: 33, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 12) return { s: 36, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 13) return { s: 39, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 14) return { s: 42, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 15) return { s: 45, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 16) return { s: 48, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 17) return { s: 51, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 18) return { s: 54, base: 'Loi 26/12/2013 Art. 37' };
  if (anciennete < 19) return { s: 57, base: 'Loi 26/12/2013 Art. 37' };
  return { s: Math.min(62, 57 + Math.floor(anciennete - 19) * 3), base: 'Loi 26/12/2013 Art. 37' };
}

export default function SoldeToutCompte({ s, d }) {
  s = s || { emps: [], co: {} };
  const [empId, setEmpId] = useState((s.emps||[])[0]?.id || '');
  const [motif, setMotif] = useState('licenciement');
  const [dateDebut, setDateDebut] = useState('2026-03-01');
  const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0]);
  const [preavisPresté, setPreavisPresté] = useState(0);
  const [tab, setTab] = useState('calc');

  const emp = useMemo(() => (s.emps||[]).find(e => e.id === empId) || (s.emps||[])[0], [empId, s.emps]);
  const brut = emp?.monthlySalary || emp?.gross || 0;

  const calcul = useMemo(() => {
    if (!emp || !brut) return null;
    const d1 = new Date(dateDebut); const d2 = new Date(dateFin);
    const anciennete = Math.max(0, (d2 - d1) / (365.25 * 24 * 3600 * 1000));
    const statut = emp.statut === 'ouvrier' ? 'ouvrier' : 'employe';
    const preavis = calcPreavis(anciennete, statut);
    const semainesSalaire = brut / (365.25/7);
    const indemnite = Math.max(0, preavis.s - preavisPresté) * semainesSalaire;
    const joursRestants = (dateFin ? new Date(d2) : new Date()) - d1;
    const moisCourus = (d2.getMonth() - new Date().getMonth() + 12) % 12 || 12;
    const joursFin = d2.getDate();
    const prorata = joursFin / new Date(d2.getFullYear(), d2.getMonth()+1, 0).getDate();
    const salaireMoisFin = Math.round(brut * prorata * 100) / 100;
    const peculeSimple = Math.round(brut * 0.1534 * anciennete * 100) / 100;
    const peculeDouble = Math.round(brut * PV_DOUBLE * 100) / 100;
    const totalBrut = indemnite + salaireMoisFin + (motif !== 'demission' ? peculeSimple : 0);
    const onss = Math.round(totalBrut * TX_ONSS_W * 100) / 100;
    const pp = Math.round(totalBrut * 0.26 * 100) / 100;
    const totalNet = totalBrut - onss - pp;
    return { anciennete: anciennete.toFixed(2), preavis, indemnite, salaireMoisFin, peculeSimple, peculeDouble, totalBrut, onss, pp, totalNet };
  }, [emp, brut, dateDebut, dateFin, motif, preavisPresté]);

  const MOTIFS = [
    { k: 'licenciement', l: '📤 Licenciement (sans motif grave)' },
    { k: 'motif_grave', l: '🚫 Licenciement motif grave' },
    { k: 'demission', l: '🚪 Démission' },
    { k: 'cdd_fin', l: '📅 Fin CDD' },
    { k: 'rupture_commun', l: '🤝 Rupture de commun accord' },
    { k: 'pension', l: '🏖 Départ à la pension' },
  ];

  return (
    <div>
      <div style={{marginBottom:20}}>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:'#e8e6e0',margin:0}}>Solde de Tout Compte</h1>
        <div style={{fontSize:10,color:'#5e5c56',marginTop:3}}>Loi 03/07/1978 · Loi 26/12/2013 (carrière unifiée) · AR 09/06/2004</div>
      </div>

      <div style={{display:'flex',gap:4,marginBottom:16}}>
        {[{k:'calc',l:'Calculateur'},{k:'checklist',l:'Checklist documents'},{k:'lettres',l:'Modèles courrier'}].map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:11,fontWeight:tab===t.k?700:400,background:tab===t.k?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.k?GOLD:'#5e5c56'}}>{t.l}</button>
        ))}
      </div>

      {tab === 'calc' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          {/* Paramètres */}
          <C style={{padding:'20px 22px'}}>
            <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14}}>⚙️ Paramètres</div>
            {[
              ['Travailleur', <select value={empId} onChange={e=>setEmpId(e.target.value)} style={{width:'100%',padding:'7px 10px',borderRadius:7,border:'1px solid rgba(198,163,78,.15)',background:'#0a0908',color:'#d4d0c8',fontSize:11}}>
                {(s.emps||[]).map(e=><option key={e.id} value={e.id}>{e.first||e.fn||''} {e.last||e.ln||''}</option>)}
              </select>],
              ['Motif de fin', <select value={motif} onChange={e=>setMotif(e.target.value)} style={{width:'100%',padding:'7px 10px',borderRadius:7,border:'1px solid rgba(198,163,78,.15)',background:'#0a0908',color:'#d4d0c8',fontSize:11}}>
                {MOTIFS.map(m=><option key={m.k} value={m.k}>{m.l}</option>)}
              </select>],
              ['Date entrée', <input type='date' value={dateDebut} onChange={e=>setDateDebut(e.target.value)} style={{width:'100%',padding:'7px 10px',borderRadius:7,border:'1px solid rgba(198,163,78,.15)',background:'#0a0908',color:'#d4d0c8',fontSize:11}}/>],
              ['Date sortie', <input type='date' value={dateFin} onChange={e=>setDateFin(e.target.value)} style={{width:'100%',padding:'7px 10px',borderRadius:7,border:'1px solid rgba(198,163,78,.15)',background:'#0a0908',color:'#d4d0c8',fontSize:11}}/>],
              ['Préavis déjà presté (sem.)', <input type='number' min={0} value={preavisPresté} onChange={e=>setPreavisPresté(+e.target.value)} style={{width:'100%',padding:'7px 10px',borderRadius:7,border:'1px solid rgba(198,163,78,.15)',background:'#0a0908',color:'#d4d0c8',fontSize:11}}/>],
            ].map(([l,v])=>(
              <div key={l} style={{marginBottom:12}}>
                <label style={{fontSize:10,color:'#5e5c56',display:'block',marginBottom:4}}>{l}</label>
                {v}
              </div>
            ))}
          </C>

          {/* Résultats */}
          <div>
            {calcul ? (
              <C style={{padding:'20px 22px'}}>
                <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14}}>📊 Calcul solde de tout compte</div>
                <div style={{padding:'10px 14px',marginBottom:14,background:`${BLUE}10`,border:`1px solid ${BLUE}25`,borderRadius:8}}>
                  <div style={{fontSize:11,color:BLUE,fontWeight:600}}>Ancienneté: {calcul.anciennete} ans · Préavis légal: {calcul.preavis.s} semaines</div>
                  <div style={{fontSize:9,color:'#5e5c56',marginTop:2}}>{calcul.preavis.base}</div>
                </div>
                {[
                  ['Indemnité compensatoire de préavis', calcul.indemnite, GOLD],
                  ['Salaire mois de sortie (prorata)', calcul.salaireMoisFin, '#d4d0c8'],
                  ...(motif !== 'demission' && motif !== 'motif_grave' ? [['Pécule simple de vacances', calcul.peculeSimple, BLUE]] : []),
                  ['── TOTAL BRUT ──', calcul.totalBrut, GOLD],
                  ['ONSS 13,07%', -calcul.onss, RED],
                  ['Précompte professionnel ~26%', -calcul.pp, RED],
                  ['── TOTAL NET À PAYER ──', calcul.totalNet, GREEN],
                ].map(([l,v,c])=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.04)',borderTop:l.startsWith('──')?'2px solid rgba(198,163,78,.1)':'none'}}>
                    <span style={{fontSize:11,color:l.startsWith('──')?GOLD:'#9e9b93',fontWeight:l.startsWith('──')?700:400}}>{l.replace(/──\s*/g,'')}</span>
                    <span style={{fontSize:l.startsWith('──')?14:12,fontWeight:l.startsWith('──')?700:500,color:c}}>{v<0?'-':''}{fmt(Math.abs(v))}</span>
                  </div>
                ))}
                <button onClick={()=>{
                  const txt = `SOLDE DE TOUT COMPTE\n${new Date().toLocaleDateString('fr-BE')}\n\nTravailleur: ${emp?.first||''} ${emp?.last||''}\nMotif: ${motif}\nAncienneté: ${calcul.anciennete} ans\nPréavis légal: ${calcul.preavis.s} semaines\n\nIndemnité: ${fmt(calcul.indemnite)}\nSalaire fin mois: ${fmt(calcul.salaireMoisFin)}\nTOTAL BRUT: ${fmt(calcul.totalBrut)}\nONSS: -${fmt(calcul.onss)}\nPP: -${fmt(calcul.pp)}\nTOTAL NET: ${fmt(calcul.totalNet)}\n\n${calcul.preavis.base}`;
                  const b = new Blob([txt],{type:'text/plain'}); const u = URL.createObjectURL(b);
                  const a = document.createElement('a'); a.href=u; a.download=`solde_tout_compte_${emp?.last||'employe'}.txt`; a.click();
                }} style={{marginTop:14,width:'100%',padding:'10px',borderRadius:8,border:'1px solid rgba(198,163,78,.3)',background:'rgba(198,163,78,.1)',color:GOLD,fontSize:12,cursor:'pointer',fontWeight:700}}>📥 Télécharger le calcul</button>
              </C>
            ) : (
              <div style={{padding:40,textAlign:'center',color:'#5e5c56',border:'1px dashed rgba(198,163,78,.1)',borderRadius:12}}>Sélectionnez un travailleur</div>
            )}
          </div>
        </div>
      )}

      {tab === 'checklist' && (
        <C style={{padding:'20px 22px'}}>
          <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14}}>📋 Documents obligatoires à la sortie</div>
          {[
            {doc:'C4 (chômage)',delai:'Jour de sortie',ref:'AR 25/11/1991',obligatoire:true},
            {doc:'Certificat d\'emploi',delai:'Jour de sortie',ref:'Art. 35 Loi 03/07/1978',obligatoire:true},
            {doc:'Fiche fiscale 281.10',delai:'31 janvier N+1',ref:'CIR/92',obligatoire:true},
            {doc:'Attestation de vacances',delai:'Fin de contrat',ref:'Lois coord. 28/06/1971',obligatoire:true},
            {doc:'Solde de tout compte signé',delai:'Dernier jour',ref:'Loi 03/07/1978',obligatoire:true},
            {doc:'Lettre de licenciement / démission',delai:'Avant fin contrat',ref:'Loi 26/12/2013',obligatoire:motif!=='demission'},
            {doc:'Déclaration Dimona OUT',delai:'1er jour ouvrable après sortie',ref:'AR 05/11/2002',obligatoire:true},
          ].map((item,i)=>(
            <div key={i} style={{display:'flex',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.04)',alignItems:'center'}}>
              <span style={{fontSize:16}}>{item.obligatoire?'✅':'ℹ️'}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{item.doc}</div>
                <div style={{fontSize:10,color:'#5e5c56'}}>Délai: {item.delai} · {item.ref}</div>
              </div>
            </div>
          ))}
        </C>
      )}

      {tab === 'lettres' && (
        <C style={{padding:'20px 22px'}}>
          <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:14}}>✉️ Modèles de courrier</div>
          {[
            {titre:'Lettre de licenciement (préavis)',motif:'licenciement',contenu:`Madame/Monsieur,\n\nNous vous informons par la présente de la résiliation de votre contrat de travail.\n\nConformément à l'article 37 de la loi du 03/07/1978, nous vous notifions un préavis de [SEMAINES] semaines, prenant cours le lundi [DATE].\n\n[EMPLOYEUR]\n[DATE]`},
            {titre:'Solde de tout compte (reçu)',motif:'tous',contenu:`Je soussigné(e) [NOM TRAVAILLEUR], reconnais avoir reçu de [EMPLOYEUR] la somme de [MONTANT] EUR à titre de solde de tout compte pour la période du [DATE DEBUT] au [DATE FIN].\n\nJe reconnais que ce paiement règle l'intégralité des sommes dues.\n\nFait à [LIEU], le [DATE]\n\nSignature:`},
          ].map((m,i)=>(
            <div key={i} style={{marginBottom:16,padding:'14px',background:'rgba(255,255,255,.02)',border:'1px solid rgba(139,115,60,.1)',borderRadius:10}}>
              <div style={{fontSize:12,fontWeight:700,color:GOLD,marginBottom:8}}>{m.titre}</div>
              <pre style={{fontSize:10,color:'#9e9b93',whiteSpace:'pre-wrap',lineHeight:1.6,margin:0}}>{m.contenu}</pre>
              <button onClick={()=>{const b=new Blob([m.contenu],{type:'text/plain'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`modele_${m.motif}.txt`;a.click();}} style={{marginTop:10,padding:'7px 14px',borderRadius:7,border:'1px solid rgba(198,163,78,.2)',background:'rgba(198,163,78,.08)',color:GOLD,fontSize:11,cursor:'pointer',fontWeight:600}}>📥 Télécharger</button>
            </div>
          ))}
        </C>
      )}
    </div>
  );
}
