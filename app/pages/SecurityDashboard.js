'use client';
import{useState,useEffect,useCallback}from'react';

// ═══════════════════════════════════════════════════════════════
// SECURITY PRO — Backup History B2 + Intrusion Monitor
// ═══════════════════════════════════════════════════════════════
const SecProTab=({supabase,user,C})=>{
  console.log("[SecProTab] mounted, supabase=", !!supabase, "user=", !!user);
  const[secTab,setSecTab]=useState('backup');
  const[backupRuns,setBackupRuns]=useState([]);
  const[backupLoading,setBackupLoading]=useState(false);
  const[backupError,setBackupError]=useState(null);
  const[intrusionLogs,setIntrusionLogs]=useState([]);
  const[intrusionLoading,setIntrusionLoading]=useState(false);
  const[geoCache,setGeoCache]=useState({});
  const[lastRefresh,setLastRefresh]=useState(null);

  const fmtDate=d=>{if(!d)return'—';const dt=new Date(d);return dt.toLocaleDateString('fr-BE')+' '+dt.toLocaleTimeString('fr-BE',{hour:'2-digit',minute:'2-digit'});};
  const timeSince=d=>{if(!d)return'—';const diff=Date.now()-new Date(d);const h=Math.floor(diff/3600000);const m=Math.floor((diff%3600000)/60000);if(h>24)return Math.floor(h/24)+'j';if(h>0)return h+'h'+m+'m';return m+'min';};
  const bColor=a=>{if(!a)return'#888';if(a.includes('SUCCESS'))return'#22c55e';if(a.includes('FAILED'))return'#ef4444';if(a.includes('RUNNING'))return'#eab308';if(a==='RESTORE_COMPLETED')return'#a855f7';return'#c6a34e';};
  const bIcon=a=>{if(!a)return'⬜';if(a.includes('SUCCESS'))return'✅';if(a.includes('FAILED'))return'❌';if(a.includes('RUNNING'))return'🔄';if(a==='RESTORE_COMPLETED')return'♻️';return'📦';};
  const bLabel=a=>{if(a?.includes('SUCCESS'))return'Succès';if(a?.includes('FAILED'))return'Échec';if(a?.includes('RUNNING'))return'En cours';if(a==='RESTORE_COMPLETED')return'Restauration';return a?.replace(/_/g,' ')||'—';};
  const iColor=a=>{if(!a)return'#888';if(a.includes('FAILED')||a.includes('BRUTE')||a.includes('UNAUTHORIZED')||a.includes('SUSPICIOUS'))return'#ef4444';if(a.includes('RATE_LIMIT')||a.includes('DENIED')||a.includes('INVALID'))return'#f97316';if(a.includes('LOGIN'))return'#22c55e';return'#888';};

  const loadBackups=useCallback(async()=>{
    if(!supabase)return;
    setBackupLoading(true);setBackupError(null);
    try{
      // Audit log interne
      const{data,error}=await supabase.from('audit_log')
        .select('id,action,details,created_at,ip_address,user_email')
        .in('action',['BACKUP_GENERATED','BACKUP_B2_SUCCESS','BACKUP_B2_FAILED','BACKUP_FAILED','RESTORE_COMPLETED'])
        .order('created_at',{ascending:false}).limit(30);
      if(error)throw error;

      // GitHub Actions runs (API publique)
      let ghRuns=[];
      try{
        const r=await fetch('https://api.github.com/repos/Aureus-Social/aureus-social-v18/actions/workflows/backup-b2.yml/runs?per_page=20',
          {headers:{'Accept':'application/vnd.github+json'}});
        if(r.ok){
          const g=await r.json();
          ghRuns=(g.workflow_runs||[]).map(r=>({
            id:'gh_'+r.id,source:'github',
            action:r.conclusion==='success'?'BACKUP_B2_SUCCESS':r.conclusion==='failure'?'BACKUP_B2_FAILED':'BACKUP_B2_RUNNING',
            created_at:r.created_at,
            details:{duration_s:r.updated_at?Math.round((new Date(r.updated_at)-new Date(r.run_started_at))/1000):null,
              run_id:r.id,run_number:r.run_number,html_url:r.html_url,
              conclusion:r.conclusion,status:r.status,trigger:r.event,
              head_commit:r.head_commit?.message?.substring(0,60)},
          }));
        }
      }catch(e){}

      const all=[...ghRuns,...(data||[])].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
      setBackupRuns(all);setLastRefresh(new Date());
    }catch(e){setBackupError(e.message);}
    setBackupLoading(false);
  },[supabase]);

  const loadIntrusions=useCallback(async()=>{
    if(!supabase)return;
    setIntrusionLoading(true);
    try{
      const{data:a}=await supabase.from('audit_log')
        .select('id,action,details,created_at,ip_address,user_email,user_agent')
        .in('action',['LOGIN_FAILED','AUTH_ERROR','UNAUTHORIZED_ACCESS','RATE_LIMIT_HIT','INVALID_TOKEN','BRUTE_FORCE_DETECTED','USER_LOGIN','PERMISSION_DENIED','SUSPICIOUS_ACTIVITY'])
        .order('created_at',{ascending:false}).limit(100);
      const{data:e}=await supabase.from('error_logs')
        .select('id,level,module,message,data,created_at')
        .in('level',['WARN','ERROR'])
        .or('message.ilike.%unauthorized%,message.ilike.%401%,message.ilike.%brute%,message.ilike.%rate limit%')
        .order('created_at',{ascending:false}).limit(50);
      const all=[
        ...(a||[]).map(l=>({...l,source:'audit'})),
        ...(e||[]).map(l=>({id:'err_'+l.id,action:l.level+'_'+l.module,ip_address:l.data?.ip||null,user_email:l.data?.email||null,user_agent:l.data?.user_agent||null,created_at:l.created_at,details:{message:l.message,...l.data},source:'error_log'})),
      ].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
      setIntrusionLogs(all);

      // Géolocalisation IPs uniques
      const ips=[...new Set(all.map(l=>l.ip_address).filter(ip=>ip&&ip!=='unknown'&&ip!=='127.0.0.1'))];
      const newGeo={};
      await Promise.all(ips.slice(0,15).map(async ip=>{
        if(geoCache[ip])return;
        try{
          const r=await fetch(`https://ipapi.co/${ip}/json/`);
          if(r.ok){const d=await r.json();
            newGeo[ip]={country:d.country_name||'?',country_code:d.country_code||'??',city:d.city||'?',org:d.org||'?',
              flag:d.country_code?String.fromCodePoint(...[...d.country_code].map(c=>127397+c.charCodeAt(0))):'🌍',
              isp:d.asn||'',is_vpn:d.threat?.is_vpn||false,is_tor:d.threat?.is_tor||false};
          }
        }catch(e){newGeo[ip]={country:'Inconnu',flag:'🌍',city:'?',org:'?'};}
      }));
      setGeoCache(prev=>({...prev,...newGeo}));
    }catch(e){console.error('[SecPro]',e);}
    setIntrusionLoading(false);
  },[supabase,geoCache]);

  useEffect(()=>{if(secTab==='backup')loadBackups();if(secTab==='intrusion')loadIntrusions();},[secTab]);

  // Stats
  const bSuccess=backupRuns.filter(r=>r.action?.includes('SUCCESS')).length;
  const bFailed=backupRuns.filter(r=>r.action?.includes('FAILED')).length;
  const bLast=backupRuns.find(r=>r.action?.includes('SUCCESS')||r.action?.includes('FAILED'));
  const bRate=bSuccess+bFailed>0?Math.round(bSuccess/(bSuccess+bFailed)*100):null;
  const iTotal=intrusionLogs.length;
  const iFailed=intrusionLogs.filter(l=>l.action?.includes('FAILED')||l.action?.includes('BRUTE')||l.action?.includes('UNAUTHORIZED')).length;
  const iUniqueIps=new Set(intrusionLogs.map(l=>l.ip_address).filter(Boolean)).size;
  const iUniqueCountries=new Set(Object.values(geoCache).map(g=>g.country)).size;

  const STBtn=({v,l})=><button onClick={()=>setSecTab(v)} style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',fontSize:11,fontWeight:secTab===v?700:400,fontFamily:'inherit',background:secTab===v?'rgba(198,163,78,.2)':'rgba(255,255,255,.04)',color:secTab===v?'#c6a34e':'#9e9b93',borderBottom:secTab===v?'2px solid #c6a34e':'2px solid transparent'}}>{l}</button>;
  const Kpi=({l,v,c})=><div style={{padding:'12px 14px',background:'rgba(198,163,78,.04)',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}><div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase',marginBottom:4}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:c||'#c6a34e'}}>{v}</div></div>;

  return <div>
    {/* Sous-onglets */}
    <div style={{display:'flex',gap:8,marginBottom:16,alignItems:'center'}}>
      <STBtn v='backup' l='💾 Historique Backups B2'/>
      <STBtn v='intrusion' l="🚨 Tentatives d'Intrusion"/>
      <button onClick={()=>secTab==='backup'?loadBackups():loadIntrusions()} style={{marginLeft:'auto',padding:'8px 14px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',background:'transparent',color:'#c6a34e',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>
        🔄 Actualiser {lastRefresh?'· '+timeSince(lastRefresh):''}
      </button>
    </div>

    {/* ── BACKUP ── */}
    {secTab==='backup'&&<div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        <Kpi l='Taux de succès' v={bRate!==null?bRate+'%':'—'} c={bRate>=90?'#22c55e':bRate>=70?'#eab308':'#ef4444'}/>
        <Kpi l='Succès' v={bSuccess} c='#22c55e'/>
        <Kpi l='Échecs' v={bFailed} c={bFailed>0?'#ef4444':'#22c55e'}/>
        <Kpi l='Dernier backup' v={bLast?timeSince(bLast.created_at):'—'} c='#c6a34e'/>
      </div>

      {/* Statut dernier run */}
      {bLast&&<div style={{padding:14,borderRadius:10,marginBottom:14,background:bLast.action?.includes('SUCCESS')?'rgba(34,197,94,.06)':'rgba(239,68,68,.06)',border:'1px solid '+(bLast.action?.includes('SUCCESS')?'rgba(34,197,94,.2)':'rgba(239,68,68,.2)')}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><span style={{fontSize:18,marginRight:8}}>{bIcon(bLast.action)}</span>
            <span style={{fontSize:12,fontWeight:700,color:bColor(bLast.action)}}>Dernier backup nightly : {bLabel(bLast.action)}</span>
          </div>
          <span style={{fontSize:11,color:'#888'}}>{fmtDate(bLast.created_at)}</span>
        </div>
        {bLast.details?.duration_s&&<div style={{fontSize:10,color:'#888',marginTop:4}}>
          Durée : {bLast.details.duration_s}s
          {bLast.details.html_url&&<a href={bLast.details.html_url} target='_blank' rel='noreferrer' style={{marginLeft:12,color:'#c6a34e',fontSize:10}}>→ Voir sur GitHub Actions ↗</a>}
        </div>}
        {bLast.action?.includes('FAILED')&&bLast.details?.error&&<div style={{marginTop:8,padding:8,background:'rgba(239,68,68,.08)',borderRadius:6,fontSize:10,color:'#fca5a5',fontFamily:'monospace'}}>❌ {bLast.details.error}</div>}
      </div>}

      {/* Historique */}
      <C title='📋 Historique des runs backup' sub='GitHub Actions backup-b2.yml + backups manuels'>
        {backupLoading?<div style={{textAlign:'center',padding:20,color:'#888',fontSize:11}}>⏳ Chargement...</div>
        :backupError?<div style={{padding:12,background:'rgba(239,68,68,.08)',borderRadius:8,fontSize:10,color:'#fca5a5'}}>
          ⚠️ {backupError}
          <div style={{color:'#888',marginTop:4}}>Vérifier que la table <code>audit_log</code> existe dans Supabase.</div>
          <a href='https://github.com/Aureus-Social/aureus-social-v18/actions/workflows/backup-b2.yml' target='_blank' rel='noreferrer' style={{color:'#c6a34e',fontSize:10}}>→ Voir directement GitHub Actions ↗</a>
        </div>
        :backupRuns.length===0?<div style={{textAlign:'center',padding:20,color:'#888',fontSize:11}}>
          Aucun historique trouvé.<br/>
          <a href='https://github.com/Aureus-Social/aureus-social-v18/actions/workflows/backup-b2.yml' target='_blank' rel='noreferrer' style={{color:'#c6a34e',fontSize:10,display:'block',marginTop:8}}>→ Voir les runs sur GitHub Actions ↗</a>
        </div>
        :<div>
          {/* Header tableau */}
          <div style={{display:'grid',gridTemplateColumns:'28px 80px 1fr 70px 80px',gap:8,padding:'6px 10px',borderBottom:'1px solid rgba(198,163,78,.15)',marginBottom:4}}>
            {['','Statut','Détail / Erreur','Durée','Il y a'].map((h,i)=><span key={i} style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase',fontWeight:700}}>{h}</span>)}
          </div>
          {backupRuns.slice(0,20).map((run,i)=><div key={run.id} style={{display:'grid',gridTemplateColumns:'28px 80px 1fr 70px 80px',gap:8,padding:'9px 10px',borderRadius:6,marginBottom:2,background:run.action?.includes('FAILED')?'rgba(239,68,68,.04)':i%2===0?'rgba(255,255,255,.015)':'transparent',alignItems:'start'}}>
            <span style={{fontSize:14,marginTop:1}}>{bIcon(run.action)}</span>
            <span style={{fontSize:10,fontWeight:700,color:bColor(run.action),marginTop:2}}>{bLabel(run.action)}</span>
            <div>
              {run.source==='github'?<div>
                <div style={{fontSize:10,color:'#e8e6e0'}}>Run #{run.details?.run_number} — GitHub Actions</div>
                {run.details?.head_commit&&<div style={{fontSize:9,color:'#888',marginTop:1}}>{run.details.head_commit}</div>}
                {run.action?.includes('FAILED')&&<div style={{fontSize:9,color:'#fca5a5',marginTop:2}}>Ouvrir GitHub pour voir le log d'erreur complet</div>}
                {run.details?.html_url&&<a href={run.details.html_url} target='_blank' rel='noreferrer' style={{fontSize:9,color:'#c6a34e',textDecoration:'none'}}>→ Ouvrir dans GitHub ↗</a>}
              </div>:<div>
                <div style={{fontSize:10,color:'#e8e6e0'}}>{run.action?.replace(/_/g,' ')}</div>
                {run.details?.total_records&&<span style={{fontSize:9,color:'#888'}}>{run.details.total_records} enregistrements</span>}
                {run.user_email&&<div style={{fontSize:9,color:'#888',marginTop:1}}>Par : {run.user_email}</div>}
              </div>}
            </div>
            <span style={{fontSize:10,color:'#888',marginTop:2}}>{run.details?.duration_s?run.details.duration_s+'s':'—'}</span>
            <span style={{fontSize:9,color:'#888',marginTop:2}}>{timeSince(run.created_at)}</span>
          </div>)}
        </div>}
      </C>

      <div style={{marginTop:10,padding:12,background:'rgba(198,163,78,.04)',borderRadius:8,border:'1px solid rgba(198,163,78,.08)'}}>
        <div style={{fontSize:10,color:'#888',marginBottom:6}}>📎 Accès direct GitHub Actions (logs complets + taille fichiers)</div>
        <a href='https://github.com/Aureus-Social/aureus-social-v18/actions/workflows/backup-b2.yml' target='_blank' rel='noreferrer' style={{fontSize:11,color:'#c6a34e',textDecoration:'none',fontWeight:600}}>
          → Voir tous les runs backup-b2.yml ↗
        </a>
      </div>
    </div>}

    {/* ── INTRUSION ── */}
    {secTab==='intrusion'&&<div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        <Kpi l='Événements' v={iTotal} c={iTotal>10?'#ef4444':'#c6a34e'}/>
        <Kpi l='Tentatives échouées' v={iFailed} c={iFailed>5?'#ef4444':iFailed>0?'#f97316':'#22c55e'}/>
        <Kpi l='IPs uniques' v={iUniqueIps} c={iUniqueIps>3?'#f97316':'#22c55e'}/>
        <Kpi l='Pays détectés' v={iUniqueCountries||'...'} c='#a855f7'/>
      </div>

      {/* Carte géo */}
      {Object.keys(geoCache).length>0&&<C title='🌍 Géolocalisation des IPs' sub='Source: ipapi.co — données en temps réel'>
        <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
          {Object.entries(geoCache).map(([ip,geo])=><div key={ip} style={{padding:'10px 14px',borderRadius:10,
            background:geo.is_tor?'rgba(239,68,68,.1)':geo.is_vpn?'rgba(249,115,22,.1)':'rgba(255,255,255,.04)',
            border:'1px solid '+(geo.is_tor?'rgba(239,68,68,.3)':geo.is_vpn?'rgba(249,115,22,.3)':'rgba(255,255,255,.06)'),
            minWidth:180}}>
            <div style={{fontSize:22,marginBottom:4}}>{geo.flag}</div>
            <div style={{fontSize:11,fontWeight:700,color:'#e8e6e0',fontFamily:'monospace'}}>{ip}</div>
            <div style={{fontSize:10,color:'#888',marginTop:2}}>{geo.city}, {geo.country}</div>
            <div style={{fontSize:9,color:'#666',marginTop:1}}>{geo.org}</div>
            {geo.is_vpn&&<div style={{fontSize:9,color:'#f97316',fontWeight:700,marginTop:4}}>⚠️ VPN détecté</div>}
            {geo.is_tor&&<div style={{fontSize:9,color:'#ef4444',fontWeight:700,marginTop:4}}>🧅 TOR détecté</div>}
          </div>)}
        </div>
      </C>}

      {/* Journal événements */}
      <C title='🚨 Journal des événements suspects' sub='Logins échoués · Accès non autorisés · Rate limits · Brute force'>
        {intrusionLoading?<div style={{textAlign:'center',padding:20,color:'#888',fontSize:11}}>⏳ Chargement + géolocalisation des IPs...</div>
        :intrusionLogs.length===0?<div style={{textAlign:'center',padding:24,color:'#22c55e',fontSize:12}}>
          ✅ Aucun événement suspect détecté
          <div style={{fontSize:10,color:'#888',marginTop:6}}>La table <code>audit_log</code> doit être alimentée pour afficher des données.</div>
        </div>
        :<div>
          <div style={{display:'grid',gridTemplateColumns:'110px 110px 1fr 140px 70px',gap:8,padding:'6px 10px',borderBottom:'1px solid rgba(198,163,78,.15)',marginBottom:4}}>
            {['Action','IP','Email / Détail','Localisation','Il y a'].map((h,i)=><span key={i} style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase',fontWeight:700}}>{h}</span>)}
          </div>
          {intrusionLogs.slice(0,50).map((log,i)=>{
            const geo=log.ip_address?geoCache[log.ip_address]:null;
            const isAlert=log.action?.includes('FAILED')||log.action?.includes('BRUTE')||log.action?.includes('UNAUTHORIZED');
            return <div key={log.id} style={{display:'grid',gridTemplateColumns:'110px 110px 1fr 140px 70px',gap:8,padding:'8px 10px',borderRadius:6,marginBottom:2,alignItems:'start',background:isAlert?'rgba(239,68,68,.05)':i%2===0?'rgba(255,255,255,.015)':'transparent'}}>
              <span style={{fontSize:9,fontWeight:700,color:iColor(log.action),marginTop:1}}>{log.action?.replace(/_/g,' ').substring(0,18)}</span>
              <div>
                <div style={{fontSize:9,fontFamily:'monospace',color:'#e8e6e0'}}>{log.ip_address||'—'}</div>
                {geo?.is_tor&&<span style={{fontSize:8,color:'#ef4444',fontWeight:700}}>🧅 TOR</span>}
                {geo?.is_vpn&&<span style={{fontSize:8,color:'#f97316',fontWeight:700}}> ⚠️ VPN</span>}
              </div>
              <div>
                <div style={{fontSize:10,color:'#e8e6e0'}}>{log.user_email||log.details?.email||'—'}</div>
                {log.details?.message&&<div style={{fontSize:9,color:'#888',marginTop:1}}>{String(log.details.message).substring(0,70)}</div>}
                {log.user_agent&&<div style={{fontSize:8,color:'#555',marginTop:1}}>{String(log.user_agent).substring(0,55)}</div>}
              </div>
              <div style={{fontSize:10,color:'#888'}}>
                {geo?<span>{geo.flag} {geo.city}, {geo.country}</span>:log.ip_address&&log.ip_address!=='unknown'?<span style={{color:'#555'}}>Géoloc...</span>:<span style={{color:'#444'}}>—</span>}
              </div>
              <span style={{fontSize:9,color:'#888'}}>{timeSince(log.created_at)}</span>
            </div>;
          })}
        </div>}
      </C>

      {/* Recommandations si attaques */}
      {iFailed>0&&<div style={{marginTop:12,padding:14,background:'rgba(239,68,68,.06)',borderRadius:10,border:'1px solid rgba(239,68,68,.2)'}}>
        <div style={{fontSize:12,fontWeight:700,color:'#ef4444',marginBottom:8}}>⚠️ Actions recommandées</div>
        {[
          iFailed>10?'🔴 Plus de 10 tentatives échouées — envisager un blocage IP dans Vercel Edge Config':null,
          iUniqueIps>5?'🟠 IPs multiples simultanées — probable attaque distribuée (botnet)':null,
          Object.values(geoCache).some(g=>g.is_tor)?'🧅 Réseau TOR détecté — bloquer dans middleware.js':null,
          Object.values(geoCache).some(g=>g.is_vpn)?'⚠️ VPN détecté — surveiller les pays inhabituels':null,
          '📧 Vérifier Supabase → Authentication → Audit Logs pour les détails complets',
          '🔑 En cas de compromission suspectée — régénérer SUPABASE_SERVICE_ROLE_KEY immédiatement',
        ].filter(Boolean).map((tip,i)=><div key={i} style={{fontSize:10,color:'#fca5a5',marginBottom:4}}>• {tip}</div>)}
      </div>}
    </div>}
  </div>;
};

const C=({children,title:t,sub,color})=><div style={{background:'rgba(198,163,78,.03)',borderRadius:12,padding:16,border:'1px solid '+(color||'rgba(198,163,78,.08)'),marginBottom:14}}>{t&&<div style={{fontSize:13,fontWeight:600,color:color||'#c6a34e',marginBottom:sub?2:10}}>{t}</div>}{sub&&<div style={{fontSize:10,color:'#888',marginBottom:10}}>{sub}</div>}{children}</div>;
const Row=({l,v,c,b})=><div style={{display:'flex',justifyContent:'space-between',padding:b?'8px 0':'5px 0',borderBottom:b?'2px solid rgba(198,163,78,.2)':'1px solid rgba(255,255,255,.03)',fontWeight:b?700:400}}><span style={{color:'#e8e6e0',fontSize:11.5}}>{l}</span><span style={{color:c||'#c6a34e',fontWeight:600,fontSize:12}}>{v}</span></div>;
const Badge=({text,color})=><span style={{padding:'2px 7px',borderRadius:5,fontSize:8,fontWeight:600,background:(color||'#888')+'15',color:color||'#888'}}>{text}</span>;
const StatusDot=({ok})=><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:ok?'#22c55e':'#ef4444',marginRight:6}}/>;

// ════════════════════════════════════════════════════════════
// SECURITY DASHBOARD — Vue complète sécurité
// ════════════════════════════════════════════════════════════
export function SecurityDashboard({s,d,supabase,user,defaultTab}){
  const [tab,setTab]=useState(defaultTab||'overview');
  const [pwTest,setPwTest]=useState('');
  const [ipList,setIpList]=useState([
    {ip:'0.0.0.0/0',label:'Accès global (dev)',added:'2026-01-01',active:true}
  ]);
  const [newIp,setNewIp]=useState('');
  const [newIpLabel,setNewIpLabel]=useState('');
  const [currentIp,setCurrentIp]=useState('...');
  useEffect(()=>{fetch('https://api.ipify.org?format=json').then(r=>r.json()).then(d=>setCurrentIp(d.ip)).catch(()=>setCurrentIp('N/A'));},[]);

  // Password validation inline
  const validatePw=(pw)=>{
    const errs=[];let score=0;
    if(!pw)return{valid:false,errors:['Requis'],score:0,label:'Vide',color:'#ef4444'};
    if(pw.length<12)errs.push('Min 12 caractères');
    if(!/[A-Z]/.test(pw))errs.push('Majuscule requise');
    if(!/[a-z]/.test(pw))errs.push('Minuscule requise');
    if(!/[0-9]/.test(pw))errs.push('Chiffre requis');
    if(!/[^A-Za-z0-9]/.test(pw))errs.push('Caractère spécial requis');
    if(pw.length>=12)score++;if(pw.length>=16)score++;if(pw.length>=20)score++;
    if(/[A-Z]/.test(pw))score++;if(/[a-z]/.test(pw))score++;if(/[0-9]/.test(pw))score++;if(/[^A-Za-z0-9]/.test(pw))score++;
    const s5=Math.min(5,Math.round(score*5/7));
    const labels=['Très faible','Faible','Moyen','Fort','Très fort','Excellent'];
    const colors=['#ef4444','#f97316','#eab308','#22c55e','#10b981','#059669'];
    return{valid:errs.length===0,errors:errs,score:s5,label:labels[s5],color:colors[s5]};
  };
  const pwResult=validatePw(pwTest);

  // Security checklist
  const checks=[
    // Niveau 1 — Urgent
    {level:1,cat:'Authentification',item:'HTTPS strict (HSTS)',status:true,detail:'Strict-Transport-Security: max-age=63072000; includeSubDomains; preload'},
    {level:1,cat:'Authentification',item:'Content Security Policy (CSP)',status:true,detail:'CSP strict avec whitelist domaines Supabase + CDN'},
    {level:1,cat:'Authentification',item:'Rate limiting API',status:true,detail:'60 req/min général, 10 req/min auth endpoints'},
    {level:1,cat:'Authentification',item:'Brute force protection',status:true,detail:'5 tentatives max → blocage 30 minutes par IP'},
    {level:1,cat:'Authentification',item:'Mots de passe forts',status:true,detail:'Min 12 chars, majuscule, minuscule, chiffre, spécial'},
    {level:1,cat:'Authentification',item:'Session timeout',status:true,detail:'Déconnexion auto après 15 min d\'inactivité'},
    {level:1,cat:'Authentification',item:'X-Frame-Options DENY',status:true,detail:'Protection anti-clickjacking'},
    {level:1,cat:'Authentification',item:'X-Content-Type-Options',status:true,detail:'nosniff — protection MIME sniffing'},
    {level:1,cat:'Authentification',item:'Audit log système',status:true,detail:'Table audit_logs avec user, action, module, IP, timestamp'},
    {level:1,cat:'Authentification',item:'2FA (TOTP)',status:'config',detail:'Supabase Auth MFA — à activer dans le dashboard Supabase'},
    // Niveau 2 — Chiffrement
    {level:2,cat:'Chiffrement',item:'AES-256-GCM chiffrement NISS',status:true,detail:'Web Crypto API, PBKDF2 key derivation, salt+IV uniques'},
    {level:2,cat:'Chiffrement',item:'AES-256-GCM chiffrement IBAN',status:true,detail:'Même système, clé séparée via env variable'},
    {level:2,cat:'Chiffrement',item:'AES-256-GCM chiffrement salaires',status:true,detail:'Montants brut/net chiffrés, valeur numérique gardée pour calculs'},
    {level:2,cat:'Chiffrement',item:'Chiffrement au repos (DB)',status:'config',detail:'Supabase Pro: encryption at rest activé côté Supabase'},
    {level:2,cat:'Chiffrement',item:'Clés séparées (ENCRYPTION_KEY)',status:'config',detail:'Variable Vercel séparée — JAMAIS dans le code source'},
    {level:2,cat:'Chiffrement',item:'Backup chiffré',status:'config',detail:'Supabase daily backup + pg_dump chiffré'},
    {level:2,cat:'Chiffrement',item:'Purge automatique RGPD',status:true,detail:'Cron job purge après X ans configurable'},
    // Niveau 3 — Blindage
    {level:3,cat:'Blindage',item:'IP whitelist',status:'planned',detail:'Middleware Vercel + table autorisations par client'},
    {level:3,cat:'Blindage',item:'Alerte intrusion (géolocalisation)',status:'done',detail:'Module dédié — détection pays + notification DPO'},
    {level:3,cat:'Blindage',item:'Captcha après 3 échecs',status:'planned',detail:'hCaptcha ou Turnstile Cloudflare'},
    {level:3,cat:'Blindage',item:'Isolation multi-tenant (RLS)',status:true,detail:'Supabase Row Level Security par organisation'},
    {level:3,cat:'Blindage',item:'Pen test automatisé',status:'planned',detail:'OWASP ZAP en CI/CD GitHub Actions'},
    // Niveau 4 — RGPD
    {level:4,cat:'RGPD',item:'Registre des traitements (Art. 30)',status:true,detail:'Document complet avec 12 catégories de données'},
    {level:4,cat:'RGPD',item:'Contrat sous-traitant DPA (Art. 28)',status:true,detail:'Data Processing Agreement avec Supabase/Vercel'},
    {level:4,cat:'RGPD',item:'Politique de confidentialité',status:true,detail:'Politique complète conforme RGPD'},
    {level:4,cat:'RGPD',item:'Procédure violation données (72h)',status:true,detail:'Procédure notification APD dans les 72h'},
    {level:4,cat:'RGPD',item:'Portail droits employés',status:true,detail:'Accès, rectification, suppression, portabilité, export JSON'},
  ];

  const totalChecks=checks.length;
  const doneChecks=checks.filter(c=>c.status===true).length;
  const configChecks=checks.filter(c=>c.status==='config').length;
  const plannedChecks=checks.filter(c=>c.status==='planned').length;
  const secScore=Math.round(doneChecks/totalChecks*100);

  return <div style={{padding:24}}>
    <h2 style={{fontSize:22,fontWeight:700,color:'#c6a34e',margin:'0 0 4px'}}>🛡 Sécurité & Conformité</h2>
    <p style={{fontSize:12,color:'#888',margin:'0 0 20px'}}>4 niveaux de protection — RGPD — Chiffrement AES-256 — Audit</p>

    <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10,marginBottom:18}}>
      {[{l:'Score sécurité',v:secScore+'%',c:secScore>=80?'#22c55e':secScore>=60?'#eab308':'#f87171'},{l:'Contrôles actifs',v:doneChecks+'/'+totalChecks,c:'#22c55e'},{l:'À configurer',v:configChecks+'',c:'#eab308'},{l:'Planifiés',v:plannedChecks+'',c:'#3b82f6'},{l:'Chiffrement',v:'AES-256-GCM',c:'#a855f7'},{l:'Niveau RGPD',v:'Conforme',c:'#22c55e'}].map((k,i)=><div key={i} style={{padding:'10px 12px',background:'rgba(198,163,78,.04)',borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}><div style={{fontSize:8,color:'#5e5c56',textTransform:'uppercase'}}>{k.l}</div><div style={{fontSize:14,fontWeight:700,color:k.c,marginTop:3}}>{k.v}</div></div>)}
    </div>

    <div style={{display:'flex',gap:4,marginBottom:16,overflowX:'auto',paddingBottom:4,flexShrink:0}}>{[{v:'overview',l:'🛡 Vue d\'ensemble'},{v:'niveau1',l:'🔴 N1 ('+checks.filter(c=>c.level===1).length+')'},{v:'niveau2',l:'🟠 N2 ('+checks.filter(c=>c.level===2).length+')'},{v:'niveau3',l:'🟡 N3 ('+checks.filter(c=>c.level===3).length+')'},{v:'rgpd',l:'🔵 N4 ('+checks.filter(c=>c.level===4).length+')'},{v:'password',l:'🔑 Test mot de passe'},{v:'headers',l:'📋 Headers HTTP'},{v:'encryption',l:'🔒 Chiffrement'},{v:'rgpddocs',l:'📜 Documents RGPD'},{v:'ipwhitelist',l:'🌐 IP Whitelist'},{v:'backup',l:'💾 Backup données'},{v:'secpro',l:'🔐 Sec Pro'}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} style={{padding:'6px 10px',borderRadius:8,border:'none',cursor:'pointer',fontSize:11,flexShrink:0,whiteSpace:'nowrap',fontWeight:tab===t.v?600:400,fontFamily:'inherit',background:tab===t.v?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t.v?'#c6a34e':'#9e9b93'}}>{t.l}</button>)}</div>

    {tab==='overview'&&<div>
      {[1,2,3,4].map(level=>{const lvlChecks=checks.filter(c=>c.level===level);const done=lvlChecks.filter(c=>c.status===true).length;const pct=Math.round(done/lvlChecks.length*100);
      const titles={1:'🔴 Niveau 1 — URGENT (avant de vendre)',2:'🟠 Niveau 2 — Chiffrement (avant premier client)',3:'🟡 Niveau 3 — Blindage (pour fiduciaires)',4:'🔵 Niveau 4 — RGPD légal (obligatoire)'};
      return <C key={level} title={titles[level]} color={pct>=80?'#22c55e':pct>=50?'#eab308':'#f87171'}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:11,color:'#888'}}>{done}/{lvlChecks.length} contrôles actifs</span><span style={{fontSize:12,fontWeight:700,color:pct>=80?'#22c55e':pct>=50?'#eab308':'#f87171'}}>{pct}%</span></div>
        <div style={{width:'100%',height:8,background:'rgba(255,255,255,.05)',borderRadius:4,marginBottom:10}}><div style={{width:pct+'%',height:'100%',background:pct>=80?'#22c55e':pct>=50?'#eab308':'#f87171',borderRadius:4,transition:'width .3s'}}/></div>
        {lvlChecks.map((c,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}><StatusDot ok={c.status===true}/><span style={{fontSize:11,color:'#e8e6e0'}}>{c.item}</span></div>
          <Badge text={c.status===true?'✓ Actif':c.status==='config'?'⚙ À configurer':'📋 Planifié'} color={c.status===true?'#22c55e':c.status==='config'?'#eab308':'#3b82f6'}/>
        </div>)}
      </C>})}
    </div>}

    {(tab==='niveau1'||tab==='niveau2'||tab==='niveau3')&&<div>
      {checks.filter(c=>c.level===(tab==='niveau1'?1:tab==='niveau2'?2:3)).map((c,i)=><div key={i} style={{padding:'12px 16px',background:'rgba(198,163,78,.03)',borderRadius:10,border:'1px solid rgba(198,163,78,.06)',marginBottom:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}><StatusDot ok={c.status===true}/><span style={{fontSize:13,fontWeight:600,color:'#e8e6e0'}}>{c.item}</span></div>
          <Badge text={c.status===true?'✓ ACTIF':c.status==='config'?'⚙ CONFIG REQUISE':'📋 PLANIFIÉ'} color={c.status===true?'#22c55e':c.status==='config'?'#eab308':'#3b82f6'}/>
        </div>
        <div style={{fontSize:10.5,color:'#9e9b93',marginTop:4,paddingLeft:22}}>{c.detail}</div>
      </div>)}
    </div>}

    {tab==='password'&&<C title="🔑 Test force mot de passe">
      <div style={{marginBottom:12}}>
        <div style={{fontSize:10,color:'#5e5c56',marginBottom:3}}>Tester un mot de passe</div>
        <input type="text" value={pwTest} onChange={e=>setPwTest(e.target.value)} placeholder="Tapez un mot de passe à tester..." style={{width:'100%',padding:'10px 14px',borderRadius:8,border:'1px solid rgba(198,163,78,.15)',background:'rgba(198,163,78,.04)',color:'#e8e6e0',fontSize:13,fontFamily:'monospace',boxSizing:'border-box'}}/>
      </div>
      {pwTest&&<div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
          <div style={{flex:1,height:10,background:'rgba(255,255,255,.05)',borderRadius:5}}>
            <div style={{width:(pwResult.score/5*100)+'%',height:'100%',background:pwResult.color,borderRadius:5,transition:'all .3s'}}/>
          </div>
          <span style={{fontSize:13,fontWeight:700,color:pwResult.color}}>{pwResult.label} ({pwResult.score}/5)</span>
        </div>
        <div style={{fontSize:12,fontWeight:600,color:pwResult.valid?'#22c55e':'#f87171',marginBottom:6}}>{pwResult.valid?'✓ Mot de passe conforme':'✗ Non conforme'}</div>
        {pwResult.errors.map((e,i)=><div key={i} style={{fontSize:11,color:'#f87171',padding:'2px 0',paddingLeft:12,borderLeft:'2px solid rgba(239,68,68,.3)'}}>✗ {e}</div>)}
        {pwResult.valid&&<div style={{fontSize:11,color:'#22c55e',padding:'2px 0',paddingLeft:12,borderLeft:'2px solid rgba(34,197,94,.3)'}}>✓ Toutes les conditions respectées</div>}
      </div>}
      <div style={{marginTop:16}}><div style={{fontSize:12,fontWeight:600,color:'#c6a34e',marginBottom:8}}>Règles obligatoires</div>
        {[{r:'Minimum 12 caractères',ok:pwTest.length>=12},{r:'Au moins 1 majuscule (A-Z)',ok:/[A-Z]/.test(pwTest)},{r:'Au moins 1 minuscule (a-z)',ok:/[a-z]/.test(pwTest)},{r:'Au moins 1 chiffre (0-9)',ok:/[0-9]/.test(pwTest)},{r:'Au moins 1 caractère spécial (!@#$%...)',ok:/[^A-Za-z0-9]/.test(pwTest)},{r:'Pas de mot de passe commun',ok:!['password','123456','admin','azerty'].some(c=>pwTest.toLowerCase().includes(c))}].map((r,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:6,padding:'3px 0'}}><StatusDot ok={pwTest?r.ok:false}/><span style={{fontSize:11,color:pwTest?(r.ok?'#22c55e':'#888'):'#888'}}>{r.r}</span></div>)}
      </div>
    </C>}

    {tab==='headers'&&<C title="📋 Headers de sécurité HTTP">
      {[
        {h:'Strict-Transport-Security',v:'max-age=63072000; includeSubDomains; preload',ok:true,desc:'HSTS — Force HTTPS pendant 2 ans, sous-domaines inclus'},
        {h:'Content-Security-Policy',v:'default-src \'self\'; script-src \'self\' cdn...; ...',ok:true,desc:'CSP — Whitelist strict des sources de scripts/styles/images'},
        {h:'X-Frame-Options',v:'DENY',ok:true,desc:'Bloque l\'inclusion dans des iframes (anti-clickjacking)'},
        {h:'X-Content-Type-Options',v:'nosniff',ok:true,desc:'Empêche le navigateur de deviner le type MIME'},
        {h:'X-XSS-Protection',v:'1; mode=block',ok:true,desc:'Protection XSS (navigateurs legacy)'},
        {h:'Referrer-Policy',v:'strict-origin-when-cross-origin',ok:true,desc:'Limite les informations envoyées dans le Referer'},
        {h:'Permissions-Policy',v:'camera=(), microphone=(), geolocation=()...',ok:true,desc:'Désactive les API navigateur non nécessaires'},
        {h:'X-Powered-By',v:'(supprimé)',ok:true,desc:'Masque la technologie serveur'},
        {h:'Access-Control-Allow-Origin',v:'whitelist domaines autorisés',ok:true,desc:'CORS strict — seuls les domaines Aureus autorisés'},
      ].map((h,i)=><div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{display:'flex',alignItems:'center',gap:6}}><StatusDot ok={h.ok}/><span style={{fontSize:12,fontWeight:600,color:'#e8e6e0',fontFamily:'monospace'}}>{h.h}</span></div><Badge text={h.ok?'✓ Actif':'✗ Manquant'} color={h.ok?'#22c55e':'#f87171'}/></div>
        <div style={{fontSize:10,color:'#c6a34e',marginTop:2,paddingLeft:22,fontFamily:'monospace'}}>{h.v}</div>
        <div style={{fontSize:10,color:'#888',marginTop:1,paddingLeft:22}}>{h.desc}</div>
      </div>)}
    </C>}

    {tab==='encryption'&&<div>
      <C title="🔒 Chiffrement AES-256-GCM">
        <Row l="Algorithme" v="AES-256-GCM (Galois/Counter Mode)"/>
        <Row l="Longueur clé" v="256 bits"/>
        <Row l="Vecteur initialisation" v="96 bits (unique par opération)"/>
        <Row l="Sel" v="128 bits (unique par opération)"/>
        <Row l="Dérivation clé" v="PBKDF2 — 100.000 itérations — SHA-256"/>
        <Row l="API" v="Web Crypto API (standard W3C)"/>
        <Row l="Compatibilité" v="Browser + Node.js + Edge Runtime"/>
      </C>
      <C title="Données chiffrées">
        {[{d:'NISS (numéro national)',champ:'niss / NISS',sensibilite:'CRITIQUE',chiffre:true},
          {d:'IBAN (compte bancaire)',champ:'iban / IBAN',sensibilite:'CRITIQUE',chiffre:true},
          {d:'Salaire brut/net',champ:'monthlySalary / gross',sensibilite:'ÉLEVÉE',chiffre:true},
          {d:'Adresse',champ:'address',sensibilite:'MOYENNE',chiffre:false},
          {d:'Email',champ:'email',sensibilite:'BASSE',chiffre:false},
        ].map((d,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}><StatusDot ok={d.chiffre}/><span style={{fontSize:11,color:'#e8e6e0'}}>{d.d}</span></div>
          <div style={{display:'flex',gap:8}}><Badge text={d.sensibilite} color={d.sensibilite==='CRITIQUE'?'#ef4444':d.sensibilite==='ÉLEVÉE'?'#fb923c':'#888'}/><Badge text={d.chiffre?'🔒 Chiffré':'En clair'} color={d.chiffre?'#22c55e':'#888'}/></div>
        </div>)}
      </C>
      <C title="Configuration requise">
        <div style={{background:'#0d1117',borderRadius:8,padding:12,fontSize:11,fontFamily:'monospace',color:'#ccc',lineHeight:1.8}}>
          # Vercel Dashboard → Settings → Environment Variables<br/>
          <br/>
          <span style={{color:'#c6a34e'}}>ENCRYPTION_KEY</span>=<span style={{color:'#22c55e'}}>"votre-cle-secrete-minimum-32-caracteres"</span><br/>
          <br/>
          # ⚠ JAMAIS dans le code source<br/>
          # ⚠ JAMAIS dans .env.local commité<br/>
          # ⚠ Différente de SUPABASE_SERVICE_ROLE_KEY<br/>
        </div>
      </C>
    </div>}

    {tab==='rgpd'||tab==='rgpddocs'?<div>
      <C title="📜 Registre des traitements — Article 30 RGPD">
        <div style={{fontSize:11,color:'#e8e6e0',marginBottom:10}}>Responsable du traitement: Aureus IA SPRL — BCE BE 1028.230.781</div>
        {[
          {cat:'Identité',donnees:'Nom, prénom, date de naissance, genre, nationalité, photo',base:'Exécution du contrat de travail',duree:'Fin contrat + 5 ans',destinataires:'ONSS, SPF Finances, mutuelle'},
          {cat:'Identification nationale',donnees:'NISS (numéro national), carte identité',base:'Obligation légale (ONSS, fiscal)',duree:'Fin contrat + 10 ans',destinataires:'ONSS, SPF, ONEM'},
          {cat:'Coordonnées',donnees:'Adresse, email, téléphone',base:'Exécution contrat + intérêt légitime',duree:'Fin contrat + 1 an',destinataires:'Employeur, secrétariat social'},
          {cat:'Financières',donnees:'Salaire, IBAN, primes, avantages, fiches de paie',base:'Exécution contrat + obligation légale',duree:'Fin contrat + 10 ans (fiscal)',destinataires:'ONSS, SPF Finances, banque (SEPA)'},
          {cat:'Contractuelles',donnees:'Type contrat, date début/fin, CP, régime horaire',base:'Exécution contrat + obligation légale',duree:'Fin contrat + 5 ans',destinataires:'ONSS (Dimona), SPF ETCS'},
          {cat:'Familiales',donnees:'Situation familiale, enfants à charge, personnes à charge',base:'Obligation légale (PP, allocations)',duree:'Fin contrat + 5 ans',destinataires:'SPF Finances (PP), caisse allocations'},
          {cat:'Santé',donnees:'Certificats médicaux, médecine du travail, aptitude',base:'Obligation légale (Code bien-être)',duree:'Fin contrat + 40 ans (exposition)',destinataires:'Médecin du travail, SEPPT'},
          {cat:'Absences',donnees:'Congés, maladies, accidents, télétravail',base:'Exécution contrat + obligation légale',duree:'Fin contrat + 5 ans',destinataires:'ONSS, mutuelle, ONEM'},
          {cat:'Formation',donnees:'Formations suivies, certificats, budget',base:'Obligation légale (5j/an)',duree:'Fin contrat + 3 ans',destinataires:'Federal Learning Account'},
          {cat:'Évaluation',donnees:'Objectifs, notes, entretiens',base:'Intérêt légitime de l\'employeur',duree:'Fin contrat + 1 an',destinataires:'Management, RH'},
          {cat:'Accès système',donnees:'Logs connexion, IP, actions, timestamps',base:'Intérêt légitime (sécurité)',duree:'2 ans',destinataires:'Administrateur système'},
          {cat:'Véhicule société',donnees:'Immatriculation, CO2, ATN, kilométrage',base:'Obligation légale (ONSS, fiscal)',duree:'Fin contrat + 5 ans',destinataires:'SPF Finances (ATN), assureur'},
        ].map((r,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.05)'}}>
          <div style={{fontSize:12,fontWeight:600,color:'#c6a34e'}}>{r.cat}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:4}}>
            <div><span style={{fontSize:9,color:'#888'}}>Données: </span><span style={{fontSize:10,color:'#ccc'}}>{r.donnees}</span></div>
            <div><span style={{fontSize:9,color:'#888'}}>Base légale: </span><span style={{fontSize:10,color:'#ccc'}}>{r.base}</span></div>
            <div><span style={{fontSize:9,color:'#888'}}>Durée conservation: </span><span style={{fontSize:10,color:'#22c55e'}}>{r.duree}</span></div>
            <div><span style={{fontSize:9,color:'#888'}}>Destinataires: </span><span style={{fontSize:10,color:'#ccc'}}>{r.destinataires}</span></div>
          </div>
        </div>)}
      </C>

      <C title="📋 Contrat sous-traitant DPA — Article 28 RGPD">
        {[
          {t:'Sous-traitants',d:'Supabase Inc. (hébergement DB, auth), Vercel Inc. (hébergement app), Sendgrid (email)'},
          {t:'Localisation serveurs',d:'Supabase: eu-central-1 (Frankfurt, UE). Vercel: Edge Frankfurt (UE).'},
          {t:'Garanties Art. 28',d:'Chaque sous-traitant a signé un DPA conforme RGPD. Données traitées exclusivement en UE.'},
          {t:'Mesures techniques',d:'Chiffrement TLS 1.3 en transit, AES-256 au repos, RLS Supabase, backup quotidien'},
          {t:'Notification violation',d:'Chaque sous-traitant notifie dans les 48h en cas de violation de données'},
          {t:'Audit droit',d:'Le responsable de traitement peut auditer les sous-traitants sur demande'},
          {t:'Suppression fin contrat',d:'Les données sont supprimées ou restituées dans les 30 jours suivant la fin du contrat'},
        ].map((r,i)=><div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <b style={{color:'#c6a34e',fontSize:11}}>{r.t}</b>
          <div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{r.d}</div>
        </div>)}
      </C>

      <C title="📝 Procédure violation de données — 72 heures">
        {[
          {n:1,t:'Détection (T+0)',d:'Tout incident de sécurité (accès non autorisé, perte de données, fuite) doit être signalé immédiatement au DPO/responsable.',delai:'Immédiat'},
          {n:2,t:'Évaluation (T+6h)',d:'Évaluer la nature et la gravité: quelles données, combien de personnes, risque pour les droits/libertés.',delai:'6 heures max'},
          {n:3,t:'Notification APD (T+72h max)',d:'Si risque pour les droits des personnes: notification à l\'Autorité de Protection des Données via formulaire en ligne (dataprotectionauthority.be).',delai:'72 heures MAX'},
          {n:4,t:'Notification personnes',d:'Si risque élevé: notifier les personnes concernées sans délai excessif. Indiquer: nature violation, conséquences, mesures prises.',delai:'Sans délai'},
          {n:5,t:'Documentation',d:'Documenter l\'incident dans le registre des violations: date, nature, données, personnes affectées, mesures correctives.',delai:'Immédiat'},
          {n:6,t:'Mesures correctives',d:'Corriger la faille, renforcer les mesures de sécurité, prévenir la récurrence. Rapport final.',delai:'Sous 30 jours'},
        ].map((step,i)=><div key={i} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(239,68,68,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#ef4444',flexShrink:0}}>{step.n}</div>
          <div style={{flex:1}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{step.t}</span><Badge text={step.delai} color="#ef4444"/></div>
            <div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{step.d}</div>
          </div>
        </div>)}
        <div style={{marginTop:10,padding:10,background:'rgba(239,68,68,.06)',borderRadius:8,fontSize:10,color:'#f87171'}}>⚠ Le non-respect du délai de 72h pour la notification APD peut entraîner une amende jusqu'à 10.000.000 EUR ou 2% du chiffre d'affaires annuel mondial (Art. 83 RGPD).</div>
      </C>

      <C title="👤 Portail droits employés — Articles 15-22 RGPD">
        {[
          {droit:'Droit d\'accès (Art. 15)',desc:'L\'employé peut demander une copie de toutes ses données personnelles.',action:'Export JSON complet des données',delai:'30 jours max',impl:true},
          {droit:'Droit de rectification (Art. 16)',desc:'L\'employé peut demander la correction de données inexactes.',action:'Modification directe dans le portail',delai:'Sans délai',impl:true},
          {droit:'Droit à l\'effacement (Art. 17)',desc:'Suppression des données si plus nécessaire. SAUF obligation légale de conservation.',action:'Anonymisation après délai légal',delai:'30 jours max',impl:true},
          {droit:'Droit à la portabilité (Art. 20)',desc:'Recevoir ses données dans un format structuré et lisible par machine.',action:'Export JSON / CSV',delai:'30 jours max',impl:true},
          {droit:'Droit d\'opposition (Art. 21)',desc:'S\'opposer au traitement basé sur l\'intérêt légitime.',action:'Formulaire d\'opposition',delai:'Sans délai',impl:true},
          {droit:'Droit de limitation (Art. 18)',desc:'Demander la restriction du traitement pendant vérification.',action:'Flag "traitement limité"',delai:'Sans délai',impl:true},
        ].map((d,i)=><div key={i} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:12,fontWeight:600,color:'#c6a34e'}}>{d.droit}</span><div style={{display:'flex',gap:6}}><Badge text={d.delai} color="#888"/><Badge text={d.impl?'✓ Implémenté':'À faire'} color={d.impl?'#22c55e':'#f87171'}/></div></div>
          <div style={{fontSize:10.5,color:'#ccc',marginTop:2}}>{d.desc}</div>
          <div style={{fontSize:10,color:'#888',marginTop:2}}>Action: {d.action}</div>
        </div>)}
      </C>

      <C title="📖 Politique de confidentialité — Résumé">
        {[
          {t:'Responsable de traitement',d:'Aureus IA SPRL — BCE BE 1028.230.781 — Bruxelles, Belgique'},
          {t:'DPO / Contact',d:'info@aureus-ia.com — Adresse siège social'},
          {t:'Finalités',d:'Gestion paie, administration du personnel, déclarations sociales/fiscales, reporting RH'},
          {t:'Base légale',d:'Exécution du contrat de travail (Art. 6.1.b), obligation légale (Art. 6.1.c), intérêt légitime (Art. 6.1.f)'},
          {t:'Transferts hors UE',d:'AUCUN — Toutes les données restent dans l\'UE (serveurs Frankfurt)'},
          {t:'Sécurité',d:'AES-256-GCM, TLS 1.3, HSTS, CSP, RLS, audit log, backup chiffré'},
          {t:'Durée conservation',d:'Variable selon catégorie (1 an à 40 ans) — voir registre des traitements'},
          {t:'Droits',d:'Accès, rectification, effacement, portabilité, opposition, limitation — via portail ou email DPO'},
          {t:'Réclamation',d:'Autorité de Protection des Données — dataprotectionauthority.be'},
        ].map((r,i)=><div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
          <b style={{color:'#c6a34e',fontSize:11}}>{r.t}</b>
          <div style={{fontSize:10.5,color:'#9e9b93',marginTop:2}}>{r.d}</div>
        </div>)}
      </C>
    </div>:null}

    {tab==='ipwhitelist'&&<div>
      <C title="🌐 IP Whitelist — Restriction d'accès par fiduciaire" sub="Configurez les adresses IP autorisées à accéder au tableau de bord">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{fontSize:10,color:'#888'}}>Votre IP actuelle: <b style={{color:'#c6a34e',fontFamily:'monospace'}}>{currentIp}</b></div>
          <button onClick={()=>{if(currentIp&&currentIp!=='...'&&currentIp!=='N/A'){setIpList(prev=>[...prev,{ip:currentIp+'/32',label:'Mon IP actuelle',added:new Date().toISOString().slice(0,10),active:true}]);}}} style={{padding:'6px 12px',borderRadius:6,border:'none',background:'rgba(34,197,94,.1)',color:'#22c55e',fontSize:10,cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>+ Ajouter mon IP</button>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          <input type="text" value={newIp} onChange={e=>setNewIp(e.target.value)} placeholder="Ex: 192.168.1.0/24 ou 83.134.25.12/32" style={{flex:1,padding:'8px 10px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:6,color:'#e5e5e5',fontSize:11,fontFamily:'monospace'}}/>
          <input type="text" value={newIpLabel} onChange={e=>setNewIpLabel(e.target.value)} placeholder="Label (ex: Bureau Bruxelles)" style={{flex:1,padding:'8px 10px',background:'#090c16',border:'1px solid rgba(139,115,60,.15)',borderRadius:6,color:'#e5e5e5',fontSize:11,fontFamily:'inherit'}}/>
          <button onClick={()=>{
            if(!newIp)return;
            const ipRegex=/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
            if(!ipRegex.test(newIp)){alert('Format IP invalide. Utilisez: 192.168.1.0/24 ou 83.134.25.12/32');return;}
            const parts=newIp.split('/')[0].split('.').map(Number);
            if(parts.some(p=>p<0||p>255)){alert('Octets IP doivent être entre 0 et 255');return;}
            const cidr=parseInt(newIp.split('/')[1]||'32');
            if(cidr<0||cidr>32){alert('CIDR doit être entre 0 et 32');return;}
            setIpList(prev=>[...prev,{ip:newIp.includes('/')?newIp:newIp+'/32',label:newIpLabel||'Sans label',added:new Date().toISOString().slice(0,10),active:true}]);
            setNewIp('');setNewIpLabel('');
          }} style={{padding:'8px 16px',borderRadius:6,border:'none',background:'rgba(198,163,78,.15)',color:'#c6a34e',fontSize:11,cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>Ajouter</button>
        </div>
        <div style={{border:'1px solid rgba(198,163,78,.1)',borderRadius:10,overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 2fr 1fr 0.8fr 0.5fr',gap:0,padding:'8px 14px',background:'rgba(198,163,78,.06)',fontSize:10,fontWeight:600,color:'#c6a34e',textTransform:'uppercase',letterSpacing:'.5px'}}>
            {['Adresse IP / CIDR','Label','Ajoutée le','Statut',''].map(h=><span key={h}>{h}</span>)}
          </div>
          {ipList.map((entry,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'2fr 2fr 1fr 0.8fr 0.5fr',gap:0,padding:'8px 14px',borderBottom:'1px solid rgba(255,255,255,.03)',alignItems:'center'}}>
            <span style={{fontSize:11,fontFamily:'monospace',color:'#e5e5e5'}}>{entry.ip}</span>
            <span style={{fontSize:11,color:'#9e9b93'}}>{entry.label}</span>
            <span style={{fontSize:10,color:'#888'}}>{entry.added}</span>
            <div style={{width:36,height:20,borderRadius:10,background:entry.active?'rgba(34,197,94,.2)':'rgba(255,255,255,.06)',border:'1px solid '+(entry.active?'rgba(34,197,94,.3)':'rgba(255,255,255,.1)'),position:'relative',cursor:'pointer'}} onClick={()=>setIpList(prev=>prev.map((e,j)=>j===i?{...e,active:!e.active}:e))}>
              <div style={{width:16,height:16,borderRadius:'50%',background:entry.active?'#22c55e':'#888',position:'absolute',top:1,left:entry.active?17:1,transition:'left .2s'}}/>
            </div>
            <button onClick={()=>{if(confirm('Supprimer '+entry.ip+' ?'))setIpList(prev=>prev.filter((_,j)=>j!==i));}} style={{padding:'4px 8px',borderRadius:5,border:'none',background:'rgba(239,68,68,.1)',color:'#ef4444',fontSize:10,cursor:'pointer'}}>✕</button>
          </div>)}
          {ipList.length===0&&<div style={{padding:16,textAlign:'center',color:'#888',fontSize:11}}>Aucune IP configurée — accès non restreint</div>}
        </div>
      </C>
      <C title="📋 Middleware de vérification IP" sub="Code à ajouter dans middleware.js pour enforcement">
        <div style={{background:'rgba(255,255,255,.02)',borderRadius:8,padding:14,fontFamily:'monospace',fontSize:10,color:'#e5e5e5',whiteSpace:'pre-wrap',lineHeight:1.6,maxHeight:300,overflow:'auto'}}>
{`// middleware.js — IP Whitelist Enforcement
// import removed - not needed client-side
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Get client IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || req.ip || '0.0.0.0'
  
  // Get user session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res
  
  const tenantId = session.user?.user_metadata?.tenant_id
  if (!tenantId) return res
  
  // Check IP whitelist from Supabase
  const { data: whitelist } = await supabase
    .from('ip_whitelist')
    .select('ip_cidr, active')
    .eq('tenant_id', tenantId)
    .eq('active', true)
  
  if (!whitelist || whitelist.length === 0) return res
  
  // Check if IP matches any CIDR
  const isAllowed = whitelist.some(entry => {
    if (entry.ip_cidr === '0.0.0.0/0') return true
    return ipMatchesCIDR(ip, entry.ip_cidr)
  })
  
  if (!isAllowed) {
    return new NextResponse(
      JSON.stringify({ error: 'IP non autorisée' }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    )
  }
  return res
}

function ipMatchesCIDR(ip, cidr) {
  const [range, bits = '32'] = cidr.split('/')
  const mask = ~(2 ** (32 - parseInt(bits)) - 1)
  const ipNum = ip.split('.').reduce((a, o) => (a << 8) + parseInt(o), 0)
  const rangeNum = range.split('.').reduce((a, o) => (a << 8) + parseInt(o), 0)
  return (ipNum & mask) === (rangeNum & mask)
}`}
        </div>
      </C>
      <C title="🗄 Table Supabase" sub="SQL pour créer la table ip_whitelist">
        <div style={{background:'rgba(255,255,255,.02)',borderRadius:8,padding:14,fontFamily:'monospace',fontSize:10,color:'#e5e5e5',whiteSpace:'pre-wrap',lineHeight:1.6}}>
{`CREATE TABLE IF NOT EXISTS ip_whitelist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  ip_cidr TEXT NOT NULL,  -- ex: '192.168.1.0/24'
  label TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE ip_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation"
  ON ip_whitelist FOR ALL
  USING (tenant_id = (auth.jwt()->'user_metadata'->>'tenant_id')::UUID);

CREATE INDEX idx_ip_whitelist_tenant ON ip_whitelist(tenant_id, active);`}
        </div>
      </C>
    </div>}

    {tab==='backup'&&<div>
      <C title="💾 Sauvegarde manuelle des données" sub="Exportez vos données en JSON ou CSV à tout moment">
        <div style={{marginBottom:16,padding:14,background:'rgba(34,197,94,.05)',borderRadius:10,border:'1px solid rgba(34,197,94,.15)'}}>
          <div style={{fontSize:11,color:'#22c55e',fontWeight:600,marginBottom:4}}>Backup automatique Supabase</div>
          <div style={{fontSize:10,color:'#888'}}>Vos données sont sauvegardées automatiquement chaque jour par Supabase (rétention 7 jours).</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          <button onClick={async()=>{
            try{
              const{createFullBackup}=await import('@/app/lib/backup');
              const res=await createFullBackup(supabase,user?.id);
              alert('Backup JSON téléchargé ('+Math.round(res.size/1024)+' KB, '+res.tables+' tables)');
            }catch(e){alert('Erreur: '+e.message)}
          }} style={{padding:'16px 14px',borderRadius:12,border:'1px solid rgba(198,163,78,.2)',background:'rgba(198,163,78,.06)',cursor:'pointer',textAlign:'center'}}>
            <div style={{fontSize:24,marginBottom:6}}>📦</div>
            <div style={{fontSize:12,fontWeight:600,color:'#c6a34e'}}>Export complet JSON</div>
            <div style={{fontSize:9,color:'#888',marginTop:4}}>Toutes les tables (restaurable)</div>
          </button>
          <button onClick={()=>{
            try{
              const emps=s?.employees||s?.emps||[];
              if(!emps.length){alert('Aucun employé trouvé');return;}
              import('@/app/lib/backup').then(m=>{
                const res=m.exportEmployeesCSV(emps);
                alert('Export CSV employés: '+res.count+' lignes');
              });
            }catch(e){alert('Erreur: '+e.message)}
          }} style={{padding:'16px 14px',borderRadius:12,border:'1px solid rgba(59,130,246,.2)',background:'rgba(59,130,246,.06)',cursor:'pointer',textAlign:'center'}}>
            <div style={{fontSize:24,marginBottom:6}}>👥</div>
            <div style={{fontSize:12,fontWeight:600,color:'#3b82f6'}}>Export employés CSV</div>
            <div style={{fontSize:9,color:'#888',marginTop:4}}>Données employés (Excel)</div>
          </button>
          <button onClick={()=>{
            try{
              const hist=s?.payrollHistory||s?.history||[];
              if(!hist.length){alert('Aucune fiche de paie trouvée');return;}
              import('@/app/lib/backup').then(m=>{
                const res=m.exportPayrollCSV(hist);
                alert('Export CSV paie: '+res.count+' fiches');
              });
            }catch(e){alert('Erreur: '+e.message)}
          }} style={{padding:'16px 14px',borderRadius:12,border:'1px solid rgba(168,85,247,.2)',background:'rgba(168,85,247,.06)',cursor:'pointer',textAlign:'center'}}>
            <div style={{fontSize:24,marginBottom:6}}>💰</div>
            <div style={{fontSize:12,fontWeight:600,color:'#a855f7'}}>Export fiches de paie CSV</div>
            <div style={{fontSize:9,color:'#888',marginTop:4}}>Historique paie (Excel)</div>
          </button>
          <button onClick={async()=>{
            try{
              const{exportAllData}=await import('@/app/lib/backup');
              const emps=s?.employees||s?.emps||[];
              const hist=s?.payrollHistory||s?.history||[];
              const res=await exportAllData(supabase,user?.id,emps,hist);
              alert('Backup complet terminé — JSON + CSV employés + CSV paie');
            }catch(e){alert('Erreur: '+e.message)}
          }} style={{padding:'16px 14px',borderRadius:12,border:'1px solid rgba(34,197,94,.2)',background:'rgba(34,197,94,.06)',cursor:'pointer',textAlign:'center'}}>
            <div style={{fontSize:24,marginBottom:6}}>🔄</div>
            <div style={{fontSize:12,fontWeight:600,color:'#22c55e'}}>Tout exporter</div>
            <div style={{fontSize:9,color:'#888',marginTop:4}}>JSON + CSV (3 fichiers)</div>
          </button>
        </div>
        <C title="🔄 Restaurer un backup" sub="Importer un fichier JSON précédemment exporté">
          <input type="file" accept=".json" onChange={async(e)=>{
            const file=e.target.files?.[0];
            if(!file)return;
            try{
              const{restoreBackup}=await import('@/app/lib/backup');
              const res=await restoreBackup(supabase,user?.id,file);
              alert('Restauration réussie: '+res.restored+' enregistrements dans '+res.tables+' tables');
            }catch(err){alert('Erreur restauration: '+err.message)}
          }} style={{fontSize:11,color:'#888'}}/>
        </C>
      </C>
    </div>}

    {tab==='secpro'&&<SecProTab supabase={supabase} user={user} C={C}/>}
  </div>;
}


export default function SecurityDashboardWrapped({ s, d, tab, supabase, user }) {
  const tabMap = { securitedata:'overview', archives:'niveau3', ged:'rgpddocs' };
  const mappedTab = tabMap[tab] || tab || 'overview';
  return <SecurityDashboard s={s} d={d} defaultTab={mappedTab} supabase={supabase} user={user} />;
}

// force redeploy Thu Mar 12 12:09:41 UTC 2026
