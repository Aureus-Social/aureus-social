'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'');

const STEPS = ['Votre compte','Votre cabinet','Premier client','Premier travailleur','Termine!'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [fidId, setFidId] = useState(null);
  const [clientId, setClientId] = useState(null);

  const [account, setAccount] = useState({email:'',password:'',nom:''});
  const [cabinet, setCabinet] = useState({nom:'',bce:'',ville:'Bruxelles',telephone:''});
  const [client, setClient] = useState({nom:'',bce:'',cp:'200',ville:''});
  const [worker, setWorker] = useState({nom:'',prenom:'',niss:'',salaire:3000,contrat:'CDI',categorie:'employe'});

  async function createAccount() {
    setLoading(true);setError('');
    if(!account.email||!account.password||!account.nom){setError('Tous les champs sont requis');setLoading(false);return;}
    const {data,error:e}=await supabase.auth.signUp({email:account.email,password:account.password,options:{data:{nom:account.nom}}});
    if(e){setError(e.message);setLoading(false);return;}
    setUserId(data.user?.id);
    // Auto-login
    await supabase.auth.signInWithPassword({email:account.email,password:account.password});
    setStep(1);setLoading(false);
  }

  async function createCabinet() {
    setLoading(true);setError('');
    if(!cabinet.nom){setError('Nom du cabinet requis');setLoading(false);return;}
    const {data:{user}}=await supabase.auth.getUser();
    const {data,error:e}=await supabase.from('fiduciaires').insert({user_id:user?.id||userId,nom:cabinet.nom,bce:cabinet.bce,ville:cabinet.ville,telephone:cabinet.telephone,responsable:account.nom,email:account.email,plan:'trial'}).select().single();
    if(e){setError(e.message);setLoading(false);return;}
    setFidId(data.id);
    setStep(2);setLoading(false);
  }

  async function createClient() {
    setLoading(true);setError('');
    if(!client.nom){setError('Nom requis');setLoading(false);return;}
    const {data,error:e}=await supabase.from('sp_clients').insert({fiduciaire_id:fidId,nom:client.nom,bce:client.bce,commission_paritaire:client.cp,ville:client.ville,statut:'actif'}).select().single();
    if(e){setError(e.message);setLoading(false);return;}
    setClientId(data.id);
    setStep(3);setLoading(false);
  }

  async function createWorker() {
    setLoading(true);setError('');
    if(!worker.nom||!worker.prenom){setError('Nom et prenom requis');setLoading(false);return;}
    const {error:e}=await supabase.from('sp_travailleurs').insert({client_id:clientId,nom:worker.nom,prenom:worker.prenom,niss:worker.niss,salaire_brut:Number(worker.salaire),type_contrat:worker.contrat,categorie:worker.categorie,regime:'temps_plein',statut:'actif',date_entree:new Date().toISOString().split('T')[0]});
    if(e){setError(e.message);setLoading(false);return;}
    setStep(4);setLoading(false);
  }

  const S={input:{width:'100%',padding:'12px 16px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:8,color:'#e2e8f0',fontSize:14,outline:'none',boxSizing:'border-box',marginBottom:12},label:{display:'block',fontSize:12,color:'#94a3b8',fontWeight:500,marginBottom:6,textTransform:'uppercase',letterSpacing:0.3},btn:{width:'100%',padding:'14px 0',background:'#c9a227',color:'#0a0e1a',border:'none',borderRadius:8,fontSize:15,fontWeight:700,cursor:'pointer',marginTop:8}};

  return (
    <div style={{minHeight:'100vh',background:'#0a0e1a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Outfit',system-ui,sans-serif"}}>
      <div style={{width:520,padding:40}}>
        {/* Progress */}
        <div style={{display:'flex',gap:4,marginBottom:32}}>
          {STEPS.map((s,i)=>(
            <div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?'#c9a227':'#1e293b',transition:'all 0.3s'}}/>
          ))}
        </div>

        <div style={{textAlign:'center',marginBottom:8}}>
          <div style={{fontSize:12,color:'#c9a227',fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>Etape {step+1}/{STEPS.length}</div>
        </div>

        {/* Step 0: Account */}
        {step===0&&(<div>
          <h1 style={{fontSize:24,fontWeight:700,color:'#f1f5f9',textAlign:'center',margin:'0 0 8px'}}>Creez votre compte</h1>
          <p style={{color:'#64748b',textAlign:'center',fontSize:14,margin:'0 0 28px'}}>30 jours gratuits, aucune carte requise</p>
          <div style={{background:'#131825',border:'1px solid #1e293b',borderRadius:12,padding:28}}>
            <label style={S.label}>Votre nom</label><input value={account.nom} onChange={e=>setAccount({...account,nom:e.target.value})} placeholder="Jean Dupont" style={S.input}/>
            <label style={S.label}>Email</label><input type="email" value={account.email} onChange={e=>setAccount({...account,email:e.target.value})} placeholder="vous@cabinet.be" style={S.input}/>
            <label style={S.label}>Mot de passe</label><input type="password" value={account.password} onChange={e=>setAccount({...account,password:e.target.value})} placeholder="Minimum 8 caracteres" style={S.input}/>
            {error&&<div style={{color:'#ef4444',fontSize:13,marginBottom:8}}>{error}</div>}
            <button onClick={createAccount} disabled={loading} style={{...S.btn,opacity:loading?0.6:1}}>{loading?'Creation...':'Continuer'}</button>
          </div>
        </div>)}

        {/* Step 1: Cabinet */}
        {step===1&&(<div>
          <h1 style={{fontSize:24,fontWeight:700,color:'#f1f5f9',textAlign:'center',margin:'0 0 8px'}}>Votre cabinet</h1>
          <p style={{color:'#64748b',textAlign:'center',fontSize:14,margin:'0 0 28px'}}>Informations sur votre fiduciaire</p>
          <div style={{background:'#131825',border:'1px solid #1e293b',borderRadius:12,padding:28}}>
            <label style={S.label}>Nom du cabinet</label><input value={cabinet.nom} onChange={e=>setCabinet({...cabinet,nom:e.target.value})} placeholder="Cabinet Dupont SPRL" style={S.input}/>
            <label style={S.label}>Numero BCE</label><input value={cabinet.bce} onChange={e=>setCabinet({...cabinet,bce:e.target.value})} placeholder="0XXX.XXX.XXX" style={S.input}/>
            <label style={S.label}>Ville</label><input value={cabinet.ville} onChange={e=>setCabinet({...cabinet,ville:e.target.value})} placeholder="Bruxelles" style={S.input}/>
            <label style={S.label}>Telephone</label><input value={cabinet.telephone} onChange={e=>setCabinet({...cabinet,telephone:e.target.value})} placeholder="+32 2 XXX XX XX" style={S.input}/>
            {error&&<div style={{color:'#ef4444',fontSize:13,marginBottom:8}}>{error}</div>}
            <button onClick={createCabinet} disabled={loading} style={{...S.btn,opacity:loading?0.6:1}}>{loading?'Enregistrement...':'Continuer'}</button>
          </div>
        </div>)}

        {/* Step 2: Client */}
        {step===2&&(<div>
          <h1 style={{fontSize:24,fontWeight:700,color:'#f1f5f9',textAlign:'center',margin:'0 0 8px'}}>Votre premier client</h1>
          <p style={{color:'#64748b',textAlign:'center',fontSize:14,margin:'0 0 28px'}}>Ajoutez une entreprise a gerer</p>
          <div style={{background:'#131825',border:'1px solid #1e293b',borderRadius:12,padding:28}}>
            <label style={S.label}>Nom de l entreprise</label><input value={client.nom} onChange={e=>setClient({...client,nom:e.target.value})} placeholder="SPRL Exemple" style={S.input}/>
            <label style={S.label}>BCE</label><input value={client.bce} onChange={e=>setClient({...client,bce:e.target.value})} placeholder="0XXX.XXX.XXX" style={S.input}/>
            <label style={S.label}>Commission paritaire</label>
            <select value={client.cp} onChange={e=>setClient({...client,cp:e.target.value})} style={{...S.input,padding:'12px 16px'}}>
              {['100','111','200','302','304'].map(c=><option key={c} value={c}>CP {c}</option>)}
            </select>
            <label style={S.label}>Ville</label><input value={client.ville} onChange={e=>setClient({...client,ville:e.target.value})} placeholder="Bruxelles" style={S.input}/>
            {error&&<div style={{color:'#ef4444',fontSize:13,marginBottom:8}}>{error}</div>}
            <div style={{display:'flex',gap:8}}>
              <button onClick={createClient} disabled={loading} style={{...S.btn,flex:2,opacity:loading?0.6:1}}>{loading?'Enregistrement...':'Continuer'}</button>
              <button onClick={()=>setStep(4)} style={{...S.btn,flex:1,background:'#1e293b',color:'#94a3b8'}}>Passer</button>
            </div>
          </div>
        </div>)}

        {/* Step 3: Worker */}
        {step===3&&(<div>
          <h1 style={{fontSize:24,fontWeight:700,color:'#f1f5f9',textAlign:'center',margin:'0 0 8px'}}>Premier travailleur</h1>
          <p style={{color:'#64748b',textAlign:'center',fontSize:14,margin:'0 0 28px'}}>Ajoutez un employe a votre client</p>
          <div style={{background:'#131825',border:'1px solid #1e293b',borderRadius:12,padding:28}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><label style={S.label}>Nom</label><input value={worker.nom} onChange={e=>setWorker({...worker,nom:e.target.value})} placeholder="Dupont" style={S.input}/></div>
              <div><label style={S.label}>Prenom</label><input value={worker.prenom} onChange={e=>setWorker({...worker,prenom:e.target.value})} placeholder="Jean" style={S.input}/></div>
            </div>
            <label style={S.label}>NISS</label><input value={worker.niss} onChange={e=>setWorker({...worker,niss:e.target.value})} placeholder="XX.XX.XX-XXX.XX" style={S.input}/>
            <label style={S.label}>Salaire brut (EUR)</label><input type="number" value={worker.salaire} onChange={e=>setWorker({...worker,salaire:e.target.value})} style={S.input}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><label style={S.label}>Contrat</label><select value={worker.contrat} onChange={e=>setWorker({...worker,contrat:e.target.value})} style={{...S.input}}><option value="CDI">CDI</option><option value="CDD">CDD</option></select></div>
              <div><label style={S.label}>Categorie</label><select value={worker.categorie} onChange={e=>setWorker({...worker,categorie:e.target.value})} style={{...S.input}}><option value="employe">Employe</option><option value="ouvrier">Ouvrier</option></select></div>
            </div>
            {error&&<div style={{color:'#ef4444',fontSize:13,marginBottom:8}}>{error}</div>}
            <div style={{display:'flex',gap:8}}>
              <button onClick={createWorker} disabled={loading} style={{...S.btn,flex:2,opacity:loading?0.6:1}}>{loading?'Enregistrement...':'Terminer'}</button>
              <button onClick={()=>setStep(4)} style={{...S.btn,flex:1,background:'#1e293b',color:'#94a3b8'}}>Passer</button>
            </div>
          </div>
        </div>)}

        {/* Step 4: Done */}
        {step===4&&(<div style={{textAlign:'center'}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(34,197,94,0.15)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
            <span style={{fontSize:36,color:'#22c55e'}}>+</span>
          </div>
          <h1 style={{fontSize:24,fontWeight:700,color:'#f1f5f9',margin:'0 0 8px'}}>Tout est pret !</h1>
          <p style={{color:'#64748b',fontSize:14,margin:'0 0 28px'}}>Votre espace Aureus Social Pro est configure. Vous pouvez maintenant generer vos premieres fiches de paie.</p>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <a href="/sprint10/dashboard"><button style={{...S.btn}}>Acceder au dashboard</button></a>
            <a href="/sprint10/paie"><button style={{...S.btn,background:'#131825',color:'#c9a227',border:'1px solid #c9a227'}}>Generer ma premiere paie</button></a>
          </div>
        </div>)}

        <div style={{textAlign:'center',marginTop:24,color:'#475569',fontSize:11}}>Aureus Social Pro — Aureus IA SPRL</div>
      </div>
    </div>
  );
}