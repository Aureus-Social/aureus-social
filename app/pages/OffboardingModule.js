'use client';
// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Offboarding Suite
// Processus de sortie complet : C4, Dimona OUT, matériel, solde
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo } from 'react';
import { authFetch } from '@/app/lib/auth-fetch';
import { fmt } from '@/app/lib/helpers';

const GOLD='#c6a34e', GREEN='#22c55e', RED='#ef4444', ORANGE='#f97316', BLUE='#60a5fa';
const BG='#111620', BORDER='rgba(198,163,78,.15)', DARK='#0d1117';
const fDate = d => d ? new Date(d).toLocaleDateString('fr-BE') : '—';

const MOTIFS_C4 = [
  { v:'1', l:'Fin de contrat à durée déterminée' },
  { v:'2', l:'Démission' },
  { v:'3', l:'Licenciement' },
  { v:'4', l:'Licenciement pour motif grave' },
  { v:'5', l:'Rupture de commun accord' },
  { v:'6', l:'Départ à la retraite' },
  { v:'7', l:'Force majeure' },
  { v:'9', l:'Autre' },
];

const CHECKLIST_TEMPLATE = [
  { id:'dimona_out', cat:'Déclarations', label:'Dimona OUT soumise', urgent:true, detail:'ONSS — délai: dernier jour de travail ou le lendemain matin' },
  { id:'c4', cat:'Déclarations', label:'C4 remis au travailleur', urgent:true, detail:'Art. 59 L. 3/07/1978 — dans les 8 jours ouvrables suivant la fin du contrat' },
  { id:'attestation_vac', cat:'Déclarations', label:'Attestation de vacances', urgent:true, detail:'Pécule de départ calculé et communiqué — base de calcul pour prochain employeur' },
  { id:'solde_compte', cat:'Paie', label:'Solde de tout compte calculé', urgent:true, detail:'Salaire du mois + prorata primes + pécule de départ + heures supplémentaires non compensées' },
  { id:'dernier_virement', cat:'Paie', label:'Dernier virement effectué', urgent:true, detail:'Sur le compte IBAN du travailleur — délai légal : le dernier jour ouvrable du mois' },
  { id:'fiche_281', cat:'Fiscal', label:'Fiche 281.10 préparée', urgent:false, detail:'À envoyer avant le 28 février N+1 au travailleur et au SPF Finances via Belcotax' },
  { id:'materiel', cat:'Matériel', label:'Matériel récupéré', urgent:false, detail:'Ordinateur, téléphone, badge, clés, véhicule, cartes de crédit, tenue de travail' },
  { id:'acces', cat:'IT', label:'Accès IT révoqués', urgent:true, detail:'Email pro, applications, VPN, comptes partagés — le jour de la sortie idéalement' },
  { id:'transfert', cat:'Connaissance', label:'Transfert de connaissances planifié', urgent:false, detail:'Dossiers, mots de passe partagés, contacts clés, projets en cours documentés' },
  { id:'reglement_concurrence', cat:'Légal', label:'Clause non-concurrence notifiée', urgent:false, detail:'Si applicable : rappel écrit des obligations dans les 15 jours. Indemnité 50% à verser.' },
  { id:'reseaux_sociaux', cat:'Communication', label:'Accès réseaux sociaux professionnels révoqués', urgent:false, detail:'LinkedIn company page, comptes Twitter/Instagram professionnels' },
  { id:'exit_interview', cat:'RH', label:'Exit interview réalisé', urgent:false, detail:'Recueil des motifs de départ — amélioration continue et rétention' },
];

function ProgressBar({ done, total }) {
  const pct = total ? Math.round(done/total*100) : 0;
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,color:'#8b95a5',marginBottom:4 }}>
        <span>Progression</span>
        <span style={{ color:pct===100?GREEN:GOLD,fontWeight:700 }}>{done}/{total} — {pct}%</span>
      </div>
      <div style={{ height:6,background:'rgba(255,255,255,.07)',borderRadius:3 }}>
        <div style={{ height:'100%',width:`${pct}%`,background:pct===100?GREEN:GOLD,borderRadius:3,transition:'width .3s' }}/>
      </div>
    </div>
  );
}

export default function OffboardingModule({ s, d }) {
  const emps = s?.emps || [];
  const [empId, setEmpId] = useState('');
  const [motif, setMotif] = useState('3');
  const [dateF, setDateF] = useState('');
  const [done, setDone] = useState({});
  const [started, setStarted] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const toast_ = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  const emp = useMemo(() => emps.find(e=>e.id===empId), [emps, empId]);
  const name = emp ? `${emp.first||emp.fn||''} ${emp.last||emp.ln||''}`.trim() : '';
  const totalItems = CHECKLIST_TEMPLATE.length;
  const doneCount = Object.values(done).filter(Boolean).length;

  const cats = [...new Set(CHECKLIST_TEMPLATE.map(i=>i.cat))];

  const handleStart = () => {
    if (!empId || !dateF) return toast_('Sélectionnez un employé et une date', false);
    setStarted(true);
    setDone({});
  };

  const handleDimona = async () => {
    if (!emp) return;
    const r = await authFetch('/api/onss/dimona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empId: emp.id, action: 'OUT', endDate: dateF, workerType: 'OTH' })
    });
    if (r.ok) {
      setDone(p=>({...p, dimona_out:true}));
      // Déclencher webhook
      await authFetch('/api/webhooks', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ trigger:true, event:'dimona.out', data:{ empId: emp.id, empName: name, date: dateF } }) }).catch(()=>{});
      toast_('Dimona OUT soumise');
    } else toast_('Erreur Dimona OUT', false);
  };

  const printC4 = () => {
    if (!emp) return;
    const motifLabel = MOTIFS_C4.find(m=>m.v===motif)?.l || motif;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>C4 — ${name}</title>
    <style>@page{margin:15mm}body{font-family:Arial,sans-serif;font-size:10pt;color:#111}
    .header{background:#0d1117;color:#c6a34e;padding:12px 20px;font-size:14pt;font-weight:bold}
    .title{font-size:16pt;font-weight:bold;margin:16px 0 4px}
    .section{margin:14px 0;padding:12px;border:1px solid #e5e7eb;border-radius:6px}
    .row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #f3f4f6;font-size:9.5pt}
    .footer{margin-top:24px;font-size:8pt;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:8px}</style></head><body>
    <div class="header">AUREUS SOCIAL PRO — Secrétariat social numérique</div>
    <div style="padding:16px">
    <div class="title">C4 — Certificat de chômage</div>
    <div style="font-size:9pt;color:#666;margin-bottom:12px">Art. 59 L. 3/07/1978 · Généré le ${new Date().toLocaleDateString('fr-BE')}</div>
    <div class="section">
      <b>EMPLOYEUR</b>
      <div class="row"><span>Raison sociale</span><span>${s?.co?.name||'Aureus IA SPRL'}</span></div>
      <div class="row"><span>BCE</span><span>${s?.co?.vat||'BE 1028.230.781'}</span></div>
      <div class="row"><span>ONSS</span><span>${s?.co?.onss||'51357716-02'}</span></div>
      <div class="row"><span>Adresse</span><span>${s?.co?.address||'Place Marcel Broodthaers 8, 1060 Saint-Gilles'}</span></div>
    </div>
    <div class="section">
      <b>TRAVAILLEUR</b>
      <div class="row"><span>Nom</span><span><b>${name}</b></span></div>
      <div class="row"><span>NISS</span><span>${emp?.niss||'—'}</span></div>
      <div class="row"><span>Adresse</span><span>${emp?.address||'—'}</span></div>
      <div class="row"><span>Fonction</span><span>${emp?.fonction||emp?.jobTitle||emp?.function||'—'}</span></div>
    </div>
    <div class="section">
      <b>CONTRAT</b>
      <div class="row"><span>Type de contrat</span><span>${emp?.contractType||emp?.contract||'CDI'}</span></div>
      <div class="row"><span>Date d'entrée</span><span>${fDate(emp?.startDate||emp?.startD)}</span></div>
      <div class="row"><span>Date de sortie</span><span><b>${fDate(dateF)}</b></span></div>
      <div class="row"><span>Motif de fin</span><span>${motifLabel}</span></div>
      <div class="row"><span>Salaire brut mensuel</span><span>${(emp?.monthlySalary||emp?.gross||0).toFixed(2)} €</span></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:24px">
      <div><div style="font-weight:bold;margin-bottom:30px">Pour l'employeur :</div><div style="border-top:1px solid #111;padding-top:4px;font-size:9pt">Signature et cachet</div></div>
      <div><div style="font-weight:bold;margin-bottom:30px">Lu et approuvé :</div><div style="border-top:1px solid #111;padding-top:4px;font-size:9pt">Signature du travailleur</div></div>
    </div>
    <div class="footer">AUREUS IA SPRL · BCE BE 1028.230.781 · À remettre au travailleur dans les 8 jours ouvrables (art.59 L.3/07/1978)</div>
    </div></body></html>`;
    const w = window.open('','_blank'); w.document.write(html); w.document.close(); w.print();
    setDone(p=>({...p, c4:true}));
  };

  if (!started) {
    return (
      <div style={{ fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',color:'#e8e6e0' }}>
        {toast && <div style={{ position:'fixed',top:70,right:20,zIndex:9999,padding:'10px 18px',borderRadius:8,background:toast.ok?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)',border:`1px solid ${toast.ok?'rgba(34,197,94,.3)':'rgba(239,68,68,.3)'}`,color:toast.ok?GREEN:RED,fontSize:12,fontWeight:600 }}>{toast.msg}</div>}
        <div style={{ fontSize:20,fontWeight:800,marginBottom:4 }}>👋 Offboarding Suite</div>
        <div style={{ fontSize:11,color:'#5e5c56',marginBottom:24 }}>Processus de sortie complet — C4, Dimona OUT, matériel, solde, transfert</div>
        <div style={{ background:BG,border:`1px solid ${BORDER}`,borderRadius:12,padding:24,maxWidth:500 }}>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:10,color:'#8b95a5',display:'block',marginBottom:4 }}>Travailleur qui part *</label>
            <select value={empId} onChange={e=>setEmpId(e.target.value)} style={{ width:'100%',padding:'9px 12px',borderRadius:7,border:'1px solid rgba(198,163,78,.2)',background:'rgba(0,0,0,.2)',color:'#e8e6e0',fontSize:13,fontFamily:'inherit',outline:'none' }}>
              <option value="">— Sélectionner —</option>
              {emps.filter(e=>e.status==='active'||!e.status).map(e=>(
                <option key={e.id} value={e.id}>{e.first||e.fn||''} {e.last||e.ln||''}</option>
              ))}
            </select>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14 }}>
            <div>
              <label style={{ fontSize:10,color:'#8b95a5',display:'block',marginBottom:4 }}>Date de sortie *</label>
              <input type="date" value={dateF} onChange={e=>setDateF(e.target.value)} style={{ width:'100%',padding:'8px 12px',borderRadius:7,border:'1px solid rgba(198,163,78,.2)',background:'rgba(0,0,0,.2)',color:'#e8e6e0',fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box' }}/>
            </div>
            <div>
              <label style={{ fontSize:10,color:'#8b95a5',display:'block',marginBottom:4 }}>Motif C4</label>
              <select value={motif} onChange={e=>setMotif(e.target.value)} style={{ width:'100%',padding:'8px 12px',borderRadius:7,border:'1px solid rgba(198,163,78,.2)',background:'rgba(0,0,0,.2)',color:'#e8e6e0',fontSize:12,fontFamily:'inherit',outline:'none' }}>
                {MOTIFS_C4.map(m=><option key={m.v} value={m.v}>{m.l}</option>)}
              </select>
            </div>
          </div>
          <button onClick={handleStart} style={{ width:'100%',padding:'11px',borderRadius:8,border:'none',background:GOLD,color:DARK,fontSize:13,fontWeight:700,cursor:'pointer' }}>
            Démarrer le processus d'offboarding →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',color:'#e8e6e0' }}>
      {toast && <div style={{ position:'fixed',top:70,right:20,zIndex:9999,padding:'10px 18px',borderRadius:8,background:toast.ok?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)',border:`1px solid ${toast.ok?'rgba(34,197,94,.3)':'rgba(239,68,68,.3)'}`,color:toast.ok?GREEN:RED,fontSize:12,fontWeight:600 }}>{toast.msg}</div>}

      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20,fontWeight:800 }}>👋 Offboarding — {name}</div>
          <div style={{ fontSize:11,color:'#5e5c56',marginTop:2 }}>Sortie le {fDate(dateF)} · Motif : {MOTIFS_C4.find(m=>m.v===motif)?.l}</div>
        </div>
        <button onClick={()=>setStarted(false)} style={{ padding:'7px 14px',borderRadius:7,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:'#8b95a5',fontSize:11,cursor:'pointer' }}>← Changer d'employé</button>
      </div>

      <ProgressBar done={doneCount} total={totalItems}/>

      {/* Actions rapides */}
      <div style={{ display:'flex',gap:8,marginBottom:20,flexWrap:'wrap' }}>
        <button onClick={handleDimona} style={{ padding:'9px 16px',borderRadius:8,border:`1px solid ${done.dimona_out?GREEN:RED}`,background:done.dimona_out?'rgba(34,197,94,.1)':'rgba(239,68,68,.1)',color:done.dimona_out?GREEN:RED,fontSize:12,fontWeight:600,cursor:'pointer' }}>
          {done.dimona_out?'✅':'⚡'} Dimona OUT
        </button>
        <button onClick={printC4} style={{ padding:'9px 16px',borderRadius:8,border:`1px solid ${done.c4?GREEN:ORANGE}`,background:done.c4?'rgba(34,197,94,.1)':'rgba(249,115,22,.1)',color:done.c4?GREEN:ORANGE,fontSize:12,fontWeight:600,cursor:'pointer' }}>
          {done.c4?'✅':'🖨️'} Générer C4
        </button>
      </div>

      {/* Checklist par catégorie */}
      {cats.map(cat=>(
        <div key={cat} style={{ marginBottom:16 }}>
          <div style={{ fontSize:10,fontWeight:700,color:'#8b95a5',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:8 }}>{cat}</div>
          <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
            {CHECKLIST_TEMPLATE.filter(i=>i.cat===cat).map(item=>(
              <div key={item.id} onClick={()=>setDone(p=>({...p,[item.id]:!p[item.id]}))}
                style={{ display:'flex',alignItems:'flex-start',gap:12,padding:'10px 14px',background:done[item.id]?'rgba(34,197,94,.05)':BG,border:`1px solid ${done[item.id]?'rgba(34,197,94,.2)':BORDER}`,borderRadius:8,cursor:'pointer',transition:'all .15s' }}>
                <div style={{ width:18,height:18,borderRadius:4,border:`2px solid ${done[item.id]?GREEN:'rgba(198,163,78,.3)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1,background:done[item.id]?GREEN:'transparent' }}>
                  {done[item.id]&&<span style={{ color:'#fff',fontSize:11,fontWeight:700 }}>✓</span>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12,fontWeight:600,color:done[item.id]?'#5e5c56':'#e8e6e0',textDecoration:done[item.id]?'line-through':'none' }}>
                    {item.urgent && !done[item.id] && <span style={{ color:RED,fontSize:9,fontWeight:700,marginRight:6 }}>URGENT</span>}
                    {item.label}
                  </div>
                  <div style={{ fontSize:10,color:'#5e5c56',marginTop:2 }}>{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {doneCount === totalItems && (
        <div style={{ textAlign:'center',padding:24,background:'rgba(34,197,94,.08)',border:'1px solid rgba(34,197,94,.2)',borderRadius:12,marginTop:8 }}>
          <div style={{ fontSize:32,marginBottom:8 }}>✅</div>
          <div style={{ fontSize:15,fontWeight:700,color:GREEN }}>Offboarding complété !</div>
          <div style={{ fontSize:11,color:'#5e5c56',marginTop:4 }}>Tous les éléments ont été traités pour {name}.</div>
        </div>
      )}
    </div>
  );
}
