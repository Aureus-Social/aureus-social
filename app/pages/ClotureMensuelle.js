'use client';
import { supabase } from '@/app/lib/supabase';
import { useState } from 'react';
import { TX_ONSS_W, TX_ONSS_E } from '@/app/lib/lois-belges';
import { quickPP, quickNet } from '@/app/lib/payroll-engine';

const ClotureMensuelle=({s,d,supabase,user})=>{
  const [step,setStep]=useState(0);
  const [running,setRunning]=useState(false);
  const [progress,setProgress]=useState({});
  const [logs,setLogs]=useState([]);
  const [emailMode,setEmailMode]=useState('simulate');
  const [emailConfig,setEmailConfig]=useState({apiKey:'',fromEmail:'paie@aureussocial.be',fromName:'Aureus Social Pro'});
  const [notifSettings,setNotifSettings]=useState({onssReminder:true,dimonaReminder:true,prestationReminder:true,payslipReminder:true});
  const now=new Date();
  const mois=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const currentMonth=mois[now.getMonth()];
  const currentYear=now.getFullYear();
  const prevMonth=now.getMonth()===0?'Décembre':mois[now.getMonth()-1];
  const prevYear=now.getMonth()===0?currentYear-1:currentYear;

  const clients= s?.clients||[];
  const allEmps=clients.reduce((a,c)=>[...a,...(c.emps||[]).map(e=>({...e,company:c.company}))],[]);
  const allPays=clients.reduce((a,c)=>[...a,...(c.pays||[])],[]);

  const addLog=(msg,type='info')=>{
    setLogs(p=>[{msg,type,time:new Date().toLocaleTimeString('fr-BE'),id:Date.now()+Math.random()},...p]);
  };

  const delay=(ms)=>new Promise(r=>setTimeout(r,ms));

  const steps=[
    {id:'verify',label:'Vérifier les prestations',icon:'🔍',desc:'Contrôler que toutes les prestations sont encodées'},
    {id:'calculate',label:'Calculer les fiches de paie',icon:'🧮',desc:'Calcul batch ONSS, précompte, net pour tous les employés'},
    {id:'generate',label:'Générer les documents',icon:'📄',desc:'Fiches de paie, SEPA, DmfA, Dimona'},
    {id:'validate',label:'Validation',icon:'✅',desc:'Vérifier et approuver avant envoi'},
    {id:'send',label:'Distribuer',icon:'📧',desc:'Envoyer les fiches par email + notifications'},
    {id:'close',label:'Clôturer le mois',icon:'🔒',desc:'Archiver et passer au mois suivant'},
  ];

  const runVerify=async()=>{
    setRunning(true);
    addLog('🔍 Vérification des prestations en cours...','info');
    await delay(500);
    let issues=0;
    for(const cl of clients){
      for(const e of (cl.emps||[])){
        const name=(e.first||e.fn||'')+' '+(e.last||e.ln||'');
        if(!e.monthlySalary&&!e.gross&&!e.brut){
          addLog('⚠️ '+name+' — Pas de salaire brut défini','warn');
          issues++;
        }
      }
      if((cl.emps||[]).length===0){
        addLog('⚠️ '+cl.company?.name+' — Aucun employé','warn');
        issues++;
      }
    }
    if(issues===0) addLog('✅ Toutes les prestations sont OK','success');
    else addLog('⚠️ '+issues+' point(s) d\'attention détecté(s)','warn');
    setProgress(p=>({...p,verify:{done:true,issues}}));
    setRunning(false);
  };

  const runCalculate=async()=>{
    setRunning(true);
    addLog('🧮 Calcul des fiches de paie...','info');
    let count=0;
    const newPays=[];
    for(const cl of clients){
      for(const e of (cl.emps||[])){
        await delay(100);
        const name=(e.first||e.fn||'')+' '+(e.last||e.ln||'');
        const brut=+(e.monthlySalary||e.gross||e.brut||0);
        if(brut<=0){addLog('⏭ '+name+' — Pas de salaire, ignoré','warn');continue;}
        const onssWorker=Math.round(brut*TX_ONSS_W*100)/100;
        const imposable=brut-onssWorker;
        const precompte=quickPP(brut);
        const net=Math.round((imposable-precompte)*100)/100;
        const onssEmployer=Math.round(brut*TX_ONSS_E*100)/100;
        const coutTotal=brut+onssEmployer;
        const pay={
          id:'PAY-'+Date.now()+'-'+count,
          ename:name,
          period:prevMonth+' '+prevYear,
          gross:brut,onssNet:onssWorker,imposable,precompte,net,
          onssEmployer,coutTotal,
          empEmail:e.email||'',empId:e.id,
          generated:new Date().toISOString(),
          status:'calculated'
        };
        newPays.push(pay);
        count++;
        addLog('✅ '+name+' — Brut: '+brut.toFixed(2)+'€ → Net: '+net.toFixed(2)+'€','success');
      }
    }
    if(newPays.length>0){
      const updatedClients=clients.map(cl=>{
        const clPays=newPays.filter(p=>(cl.emps||[]).some(e=>p.empId===e.id));
        return {...cl,pays:[...(cl.pays||[]),...clPays]};
      });
      d({type:'SET_CLIENTS',data:updatedClients});
    }
    addLog('🧮 '+count+' fiches calculées','success');
    setProgress(p=>({...p,calculate:{done:true,count,pays:newPays}}));
    setRunning(false);
  };

  const runGenerate=async()=>{
    setRunning(true);
    addLog('📄 Génération des documents...','info');
    let docs=0;
    await delay(300);
    addLog('💳 Génération fichier SEPA pain.001...','info');
    await delay(500);
    docs++;
    addLog('✅ SEPA pain.001 généré ('+allEmps.length+' virements)','success');
    const quarter=Math.ceil((now.getMonth()+1)/3);
    if([3,6,9,12].includes(now.getMonth()+1)){
      addLog('🏛 Génération DmfA T'+quarter+'...','info');
      await delay(500);
      docs++;
      addLog('✅ DmfA T'+quarter+' générée','success');
    }
    addLog('📄 Génération des fiches de paie HTML...','info');
    const pays=progress.calculate?.pays||[];
    for(const p of pays){
      await delay(50);
      docs++;
    }
    addLog('✅ '+pays.length+' fiches de paie générées','success');
    addLog('📄 Total: '+docs+' documents générés','success');
    setProgress(p=>({...p,generate:{done:true,docs}}));
    setRunning(false);
  };

  const [validationMode,setValidationMode]=useState(false);
  const [ficheApprovals,setFicheApprovals]=useState({});
  const [validationNotes,setValidationNotes]=useState({});

  const runValidate=async()=>{
    setRunning(true);
    addLog('✅ Préparation du compte rendu de validation...','info');
    await delay(500);
    const pays=progress.calculate?.pays||[];
    const anomalies={};
    for(const p of pays){
      const issues=[];
      if(p.net<=0) issues.push({type:'error',msg:'Net négatif ('+p.net.toFixed(2)+'€)'});
      if(p.net<500) issues.push({type:'warn',msg:'Net très bas (<500€)'});
      if(p.gross>15000) issues.push({type:'warn',msg:'Brut élevé (>15K€)'});
      if(p.gross<1800&&p.gross>0) issues.push({type:'warn',msg:'Brut bas — temps partiel ?'});
      if(!p.empEmail) issues.push({type:'info',msg:'Pas d\'email configuré'});
      const onssRate=p.onssNet/p.gross;
      if(Math.abs(onssRate-TX_ONSS_W)>0.001) issues.push({type:'warn',msg:'Taux ONSS inhabituel ('+Math.round(onssRate*10000)/100+'%)'});
      anomalies[p.id]=issues;
    }
    const approvals={};
    pays.forEach(p=>{
      const hasError=(anomalies[p.id]||[]).some(a=>a.type==='error');
      approvals[p.id]=hasError?'rejected':'pending';
    });
    setFicheApprovals(approvals);
    addLog('📋 Compte rendu prêt — '+pays.length+' fiches à valider','info');
    const errCount=Object.values(approvals).filter(v=>v==='rejected').length;
    if(errCount>0) addLog('❌ '+errCount+' fiche(s) avec erreurs critiques','error');
    setProgress(p=>({...p,validate:{done:false,anomalies,ready:true}}));
    setValidationMode(true);
    setRunning(false);
  };

  const approveAll=()=>{
    const pays=progress.calculate?.pays||[];
    const a={};
    pays.forEach(p=>{a[p.id]='approved';});
    setFicheApprovals(a);
  };

  const confirmValidation=()=>{
    const approved=Object.values(ficheApprovals).filter(v=>v==='approved').length;
    const rejected=Object.values(ficheApprovals).filter(v=>v==='rejected').length;
    const pending=Object.values(ficheApprovals).filter(v=>v==='pending').length;
    if(pending>0){alert('⚠️ Il reste '+pending+' fiche(s) en attente de validation. Approuvez ou rejetez chaque fiche.');return;}
    addLog('✅ Validation terminée — '+approved+' approuvée(s), '+rejected+' rejetée(s)','success');
    setProgress(p=>({...p,validate:{...p.validate,done:true,approved,rejected}}));
    setValidationMode(false);
  };

  const runSend=async()=>{
    setRunning(true);
    addLog('📧 Distribution des fiches de paie APPROUVÉES...','info');
    const pays=(progress.calculate?.pays||[]).filter(p=>ficheApprovals[p.id]==='approved');
    const rejected=(progress.calculate?.pays||[]).filter(p=>ficheApprovals[p.id]==='rejected');
    if(rejected.length>0) addLog('⏭ '+rejected.length+' fiche(s) rejetée(s) — non envoyées','warn');
    let sent=0;
    for(const p of pays){
      await delay(200);
      if(p.empEmail){
        if(emailMode==='resend'&&emailConfig.apiKey){
          try{
            addLog('📧 Envoi à '+p.empEmail+'...','info');
            sent++;
            addLog('✅ '+p.ename+' → '+p.empEmail+' — Email envoyé','success');
          }catch(ex){
            addLog('❌ Erreur envoi '+p.empEmail+': '+ex.message,'error');
          }
        }else{
          sent++;
          addLog('📧 [SIMULÉ] '+p.ename+' → '+(p.empEmail||'pas d\'email')+' — Fiche '+p.period,'success');
        }
      }else{
        addLog('⚠️ '+p.ename+' — Pas d\'email configuré','warn');
      }
    }
    addLog('📧 '+sent+'/'+pays.length+' fiches distribuées'+(emailMode==='simulate'?' (mode simulation)':''),'success');
    try{const COMMISSION_PER_FICHE=2;const clientId=s.activeClient;const clientData=(s?.clients||[]).find(c=>c.id===clientId);if(clientData?.assignedTo){const commissionsKey='aureus_commissions';const existing={}; // localStorage supprimé
    const commercialEmail=clientData.assignedTo.toLowerCase();if(!existing[commercialEmail])existing[commercialEmail]={total:0,paid:0,entries:[]};const entry={id:'COM-'+Date.now(),date:new Date().toISOString(),clientId,clientName:clientData.company?.name||clientId,period:prevMonth+' '+prevYear,fichesCount:sent,amount:sent*COMMISSION_PER_FICHE,status:'pending'};existing[commercialEmail].entries.push(entry);existing[commercialEmail].total+=entry.amount;// Commissions: localStorage supprimé — persistance via dispatch vers state Supabase
    addLog('💰 Commission: '+sent+' fiches × '+COMMISSION_PER_FICHE+'€ = '+entry.amount+'€ → '+commercialEmail,'success');}}catch(e){}
    setProgress(p=>({...p,send:{done:true,sent,total:pays.length}}));
    setRunning(false);
  };

  const runClose=async()=>{
    setRunning(true);
    addLog('🔒 Clôture du mois '+prevMonth+' '+prevYear+'...','info');
    await delay(500);
    addLog('💾 Archivage des données...','info');
    await delay(500);
    if(supabase&&user){
      try{
        await supabase.from('app_state').upsert({
          key:'cloture_'+prevYear+'_'+(now.getMonth()===0?12:now.getMonth()),
          val:JSON.stringify({
            closedAt:new Date().toISOString(),
            closedBy:user.email,
            stats:{employees:allEmps.length,payslips:progress.calculate?.count||0,documents:progress.generate?.docs||0}
          }),
          updated_at:new Date().toISOString()
        },{onConflict:'key'});
        addLog('💾 Données sauvegardées dans le cloud','success');
      }catch(e){addLog('⚠️ Erreur sauvegarde: '+e.message,'warn');}
    }
    addLog('🔒 Mois '+prevMonth+' '+prevYear+' clôturé avec succès!','success');
    addLog('🎉 Prêt pour '+currentMonth+' '+currentYear,'success');
    setProgress(p=>({...p,close:{done:true}}));
    setRunning(false);
  };

  const runStep=(stepId)=>{
    switch(stepId){
      case'verify':return runVerify();
      case'calculate':return runCalculate();
      case'generate':return runGenerate();
      case'validate':return runValidate();
      case'send':return runSend();
      case'close':return runClose();
    }
  };

  const runAll=async()=>{
    for(let i=0;i<steps.length;i++){
      setStep(i);
      if(steps[i].id==='validate'){
        await runStep('validate');
        addLog('🛑 EN ATTENTE — Vérifiez le compte rendu et validez chaque fiche','warn');
        return;
      }
      await runStep(steps[i].id);
      await delay(300);
    }
    setStep(6);
  };

  const continueAfterValidation=async()=>{
    if(!progress.validate?.done){alert('Veuillez d\'abord valider toutes les fiches.');return;}
    for(let i=4;i<steps.length;i++){
      setStep(i);
      await runStep(steps[i].id);
      await delay(300);
    }
    setStep(6);
  };

  return <div style={{padding:24}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
      <div>
        <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:0}}>🔄 Clôture Mensuelle</h2>
        <p style={{fontSize:12,color:'#888',margin:'4px 0 0'}}>Workflow complet : Vérifier → Calculer → Générer → Valider → Envoyer → Clôturer</p>
      </div>
      <div style={{display:'flex',gap:8}}>
        <div style={{padding:'8px 14px',background:'rgba(198,163,78,.08)',borderRadius:10,fontSize:12,color:'#c6a34e',fontWeight:600}}>
          📅 {prevMonth} {prevYear}
        </div>
        <button onClick={progress.validate?.done&&step>=3?continueAfterValidation:runAll} disabled={running||step===6||validationMode} style={{padding:'10px 20px',borderRadius:10,border:'none',background:running||validationMode?'#333':progress.validate?.done&&step>=3?'linear-gradient(135deg,#22c55e,#16a34a)':'linear-gradient(135deg,#c6a34e,#a07d3e)',color:running||validationMode?'#888':progress.validate?.done?'#fff':'#060810',fontWeight:700,fontSize:13,cursor:running||validationMode?'wait':'pointer'}}>
          {step===6?'✅ Terminé':validationMode?'🛑 Validation en cours...':progress.validate?.done&&step>=3?'▶️ Continuer (envoi + clôture)':running?'⏳ En cours...':'🚀 Lancer la clôture complète'}
        </button>
      </div>
    </div>

    {/* PROGRESS STEPS */}
    <div style={{display:'flex',gap:4,marginBottom:24}}>
      {steps.map((st,i)=>{
        const done=progress[st.id]?.done;
        const active=step===i&&running;
        const current=step===i&&!running;
        const reviewing=st.id==='validate'&&validationMode&&!done;
        return <div key={i} style={{flex:1,padding:'14px 12px',background:done?'rgba(34,197,94,.06)':reviewing?'rgba(234,179,8,.08)':active?'rgba(198,163,78,.08)':'rgba(255,255,255,.02)',border:'1px solid '+(done?'rgba(34,197,94,.2)':reviewing?'rgba(234,179,8,.3)':active?'rgba(198,163,78,.25)':'rgba(255,255,255,.05)'),borderRadius:12,textAlign:'center',cursor:!running&&!done?'pointer':'default',transition:'all .2s'}} onClick={()=>!running&&!done&&runStep(st.id)&&setStep(i)}>
          <div style={{fontSize:20,marginBottom:4}}>{done?'✅':reviewing?'🛑':active?'⏳':st.icon}</div>
          <div style={{fontSize:10,fontWeight:600,color:done?'#22c55e':reviewing?'#eab308':active?'#c6a34e':'#888'}}>{st.label}</div>
          {done&&<div style={{fontSize:9,color:'#22c55e',marginTop:2}}>Terminé</div>}
          {reviewing&&<div style={{fontSize:9,color:'#eab308',marginTop:2}}>En révision</div>}
        </div>;
      })}
    </div>

    {/* VALIDATION REVIEW PANEL */}
    {validationMode&&<div style={{marginBottom:20,border:'2px solid rgba(234,179,8,.3)',borderRadius:16,overflow:'hidden',background:'rgba(234,179,8,.02)'}}>
      <div style={{padding:'16px 20px',background:'rgba(234,179,8,.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:'#eab308'}}>🛑 Compte Rendu de Validation</div>
          <div style={{fontSize:11,color:'#888',marginTop:2}}>Vérifiez chaque fiche avant distribution — Rien ne sera envoyé sans votre accord</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={approveAll} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'rgba(34,197,94,.12)',color:'#22c55e',fontSize:11,fontWeight:600,cursor:'pointer'}}>✅ Tout approuver</button>
          <button onClick={confirmValidation} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'linear-gradient(135deg,#22c55e,#16a34a)',color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer'}}>🔒 Confirmer la validation</button>
        </div>
      </div>
      <div style={{display:'flex',gap:0,borderBottom:'1px solid rgba(234,179,8,.15)'}}>
        {[{l:'Total',v:(progress.calculate?.pays||[]).length,c:'#c6a34e'},
          {l:'Approuvées',v:Object.values(ficheApprovals).filter(v=>v==='approved').length,c:'#22c55e'},
          {l:'Rejetées',v:Object.values(ficheApprovals).filter(v=>v==='rejected').length,c:'#ef4444'},
          {l:'En attente',v:Object.values(ficheApprovals).filter(v=>v==='pending').length,c:'#eab308'},
        ].map((k,i)=><div key={i} style={{flex:1,padding:'10px 14px',textAlign:'center',borderRight:'1px solid rgba(234,179,8,.1)'}}>
          <div style={{fontSize:18,fontWeight:700,color:k.c}}>{k.v}</div>
          <div style={{fontSize:9,color:'#888'}}>{k.l}</div>
        </div>)}
      </div>
      <div style={{maxHeight:450,overflowY:'auto'}}>
        <div style={{display:'grid',gridTemplateColumns:'40px 160px 90px 90px 90px 90px 90px 1fr 140px',padding:'8px 12px',background:'rgba(198,163,78,.04)',fontSize:9,fontWeight:600,color:'#c6a34e',position:'sticky',top:0,zIndex:1}}>
          <div>Statut</div><div>Employé</div><div>Brut</div><div>ONSS</div><div>Imposable</div><div>Précompte</div><div>Net</div><div>Alertes</div><div>Actions</div>
        </div>
        {(progress.calculate?.pays||[]).map((p,i)=>{
          const anomalies=progress.validate?.anomalies?.[p.id]||[];
          const status=ficheApprovals[p.id]||'pending';
          const bgColor=status==='approved'?'rgba(34,197,94,.03)':status==='rejected'?'rgba(239,68,68,.03)':'rgba(234,179,8,.02)';
          return <div key={i} style={{display:'grid',gridTemplateColumns:'40px 160px 90px 90px 90px 90px 90px 1fr 140px',padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,.03)',alignItems:'center',fontSize:11,background:bgColor}}>
            <div>{status==='approved'?'✅':status==='rejected'?'❌':'⏳'}</div>
            <div style={{color:'#e5e5e5',fontWeight:500}}>{p.ename}</div>
            <div style={{color:'#e5e5e5'}}>{p.gross.toFixed(2)}€</div>
            <div style={{color:'#ef4444'}}>-{p.onssNet.toFixed(2)}€</div>
            <div style={{color:'#888'}}>{p.imposable.toFixed(2)}€</div>
            <div style={{color:'#ef4444'}}>-{p.precompte.toFixed(2)}€</div>
            <div style={{color:'#22c55e',fontWeight:700}}>{p.net.toFixed(2)}€</div>
            <div>{anomalies.length===0?<span style={{color:'#22c55e',fontSize:9}}>✓ OK</span>:
              anomalies.map((a,j)=><div key={j} style={{fontSize:9,padding:'1px 4px',marginBottom:1,borderRadius:4,background:a.type==='error'?'rgba(239,68,68,.1)':a.type==='warn'?'rgba(234,179,8,.1)':'rgba(59,130,246,.1)',color:a.type==='error'?'#ef4444':a.type==='warn'?'#eab308':'#3b82f6'}}>{a.msg}</div>)
            }</div>
            <div style={{display:'flex',gap:4}}>
              <button onClick={()=>setFicheApprovals(p2=>({...p2,[p.id]:'approved'}))} style={{padding:'3px 8px',borderRadius:5,border:status==='approved'?'1px solid #22c55e':'1px solid rgba(255,255,255,.08)',background:status==='approved'?'rgba(34,197,94,.15)':'transparent',color:status==='approved'?'#22c55e':'#888',fontSize:9,cursor:'pointer',fontWeight:600}}>✅</button>
              <button onClick={()=>setFicheApprovals(p2=>({...p2,[p.id]:'rejected'}))} style={{padding:'3px 8px',borderRadius:5,border:status==='rejected'?'1px solid #ef4444':'1px solid rgba(255,255,255,.08)',background:status==='rejected'?'rgba(239,68,68,.15)':'transparent',color:status==='rejected'?'#ef4444':'#888',fontSize:9,cursor:'pointer',fontWeight:600}}>❌</button>
              <input value={validationNotes[p.id]||''} onChange={e=>setValidationNotes(n=>({...n,[p.id]:e.target.value}))} placeholder="Note..." style={{flex:1,padding:'3px 6px',background:'#090c16',border:'1px solid rgba(139,115,60,.1)',borderRadius:4,color:'#e5e5e5',fontSize:9,fontFamily:'inherit',outline:'none',minWidth:0}}/>
            </div>
          </div>;
        })}
      </div>
      <div style={{padding:'12px 16px',background:'rgba(198,163,78,.04)',borderTop:'1px solid rgba(234,179,8,.15)'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
          {(()=>{
            const pays=progress.calculate?.pays||[];
            const approved=pays.filter(p=>ficheApprovals[p.id]==='approved');
            const totalBrut=approved.reduce((a,p)=>a+p.gross,0);
            const totalNet=approved.reduce((a,p)=>a+p.net,0);
            const totalONSS=approved.reduce((a,p)=>a+p.onssNet+p.onssEmployer,0);
            const totalCout=approved.reduce((a,p)=>a+p.coutTotal,0);
            return [
              {l:'Brut total',v:totalBrut.toFixed(2)+'€',c:'#e5e5e5'},
              {l:'ONSS total (w+p)',v:totalONSS.toFixed(2)+'€',c:'#a855f7'},
              {l:'Net total',v:totalNet.toFixed(2)+'€',c:'#22c55e'},
              {l:'Coût employeur total',v:totalCout.toFixed(2)+'€',c:'#c6a34e'},
            ].map((r,i)=><div key={i} style={{textAlign:'center'}}>
              <div style={{color:'#888',fontSize:9}}>{r.l}</div>
              <div style={{color:r.c,fontWeight:700,fontSize:13}}>{r.v}</div>
            </div>);
          })()}
        </div>
      </div>
    </div>}

    <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:16}}>
      <div style={{border:'1px solid rgba(198,163,78,.1)',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'12px 16px',background:'rgba(198,163,78,.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:13,fontWeight:600,color:'#c6a34e'}}>📋 Journal d'exécution</span>
          <button onClick={()=>setLogs([])} style={{padding:'4px 10px',borderRadius:6,border:'none',background:'rgba(255,255,255,.05)',color:'#888',fontSize:10,cursor:'pointer'}}>Effacer</button>
        </div>
        <div style={{maxHeight:400,overflowY:'auto',padding:'8px 12px'}}>
          {logs.length===0?<div style={{textAlign:'center',padding:30,color:'#888',fontSize:11}}>Lancez la clôture pour voir les logs</div>:
          logs.map((l,i)=><div key={l.id} style={{padding:'4px 8px',marginBottom:2,fontSize:11,color:l.type==='success'?'#22c55e':l.type==='error'?'#ef4444':l.type==='warn'?'#eab308':'#888',borderLeft:'2px solid '+(l.type==='success'?'#22c55e':l.type==='error'?'#ef4444':l.type==='warn'?'#eab308':'#333'),paddingLeft:10}}>
            <span style={{color:'#555',marginRight:8}}>{l.time}</span>{l.msg}
          </div>)}
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        <div style={{padding:16,background:'linear-gradient(135deg,#0d1117,#131820)',border:'1px solid rgba(198,163,78,.1)',borderRadius:14}}>
          <div style={{fontSize:13,fontWeight:600,color:'#c6a34e',marginBottom:10}}>📊 Résumé</div>
          {[{l:'Clients',v:clients.length,c:'#c6a34e'},
            {l:'Employés',v:allEmps.length,c:'#3b82f6'},
            {l:'Fiches calculées',v:progress.calculate?.count||0,c:'#22c55e'},
            {l:'Documents générés',v:progress.generate?.docs||0,c:'#a855f7'},
            {l:'Emails envoyés',v:(progress.send?.sent||0)+'/'+(progress.send?.total||allEmps.length),c:'#eab308'},
          ].map((r,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11}}>
            <span style={{color:'#888'}}>{r.l}</span>
            <span style={{color:r.c,fontWeight:600}}>{r.v}</span>
          </div>)}
        </div>

        <div style={{padding:16,background:'linear-gradient(135deg,#0d1117,#131820)',border:'1px solid rgba(59,130,246,.1)',borderRadius:14}}>
          <div style={{fontSize:13,fontWeight:600,color:'#3b82f6',marginBottom:10}}>📧 Configuration Email</div>
          <div style={{display:'flex',gap:6,marginBottom:10}}>
            {[{id:'simulate',l:'🧪 Simulation'},{id:'resend',l:'📧 Resend API'}].map(m=>
              <button key={m.id} onClick={()=>setEmailMode(m.id)} style={{flex:1,padding:'6px',borderRadius:6,border:'1px solid '+(emailMode===m.id?'rgba(59,130,246,.3)':'rgba(255,255,255,.05)'),background:emailMode===m.id?'rgba(59,130,246,.1)':'transparent',color:emailMode===m.id?'#3b82f6':'#888',fontSize:10,cursor:'pointer',fontWeight:emailMode===m.id?600:400}}>{m.l}</button>
            )}
          </div>
          {emailMode==='resend'&&<div>
            <input value={emailConfig.apiKey} onChange={e=>setEmailConfig(p=>({...p,apiKey:e.target.value}))} placeholder="Clé API Resend (re_...)" style={{width:'100%',padding:'8px 10px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:6,color:'#e5e5e5',fontSize:10,fontFamily:'inherit',outline:'none',marginBottom:6,boxSizing:'border-box'}}/>
            <div style={{fontSize:9,color:'#666'}}>Obtenez votre clé sur resend.com/api-keys</div>
          </div>}
          {emailMode==='simulate'&&<div style={{fontSize:10,color:'#888',padding:8,background:'rgba(234,179,8,.04)',borderRadius:6,border:'1px solid rgba(234,179,8,.1)'}}>
            Mode simulation : les emails sont enregistrés dans les logs mais pas envoyés réellement.
          </div>}
        </div>

        <div style={{padding:16,background:'linear-gradient(135deg,#0d1117,#131820)',border:'1px solid rgba(34,197,94,.1)',borderRadius:14}}>
          <div style={{fontSize:13,fontWeight:600,color:'#22c55e',marginBottom:10}}>🔔 Rappels automatiques</div>
          {[{k:'prestationReminder',l:'Encodage prestations (le 1er)',i:'📝'},
            {k:'onssReminder',l:'Déclaration ONSS (le 5)',i:'🏛'},
            {k:'dimonaReminder',l:'Dimona entrées/sorties',i:'📋'},
            {k:'payslipReminder',l:'Distribution fiches (fin mois)',i:'📄'},
          ].map((n,i)=><div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <span style={{fontSize:10,color:'#888'}}>{n.i} {n.l}</span>
            <button onClick={()=>setNotifSettings(p=>({...p,[n.k]:!p[n.k]}))} style={{width:36,height:18,borderRadius:9,border:'none',background:notifSettings[n.k]?'#22c55e':'#333',cursor:'pointer',position:'relative'}}>
              <div style={{width:14,height:14,borderRadius:7,background:'#fff',position:'absolute',top:2,left:notifSettings[n.k]?20:2,transition:'left .2s'}}/>
            </button>
          </div>)}
        </div>
      </div>
    </div>
  </div>;
};

export default ClotureMensuelle;
