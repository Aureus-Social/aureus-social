'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL||'',process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'');
export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [cabinet, setCabinet] = useState('');
  const [bce, setBce] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const handleLogin = async () => {
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    window.location.href = '/sprint10/dashboard';
  };
  const handleRegister = async () => {
    setLoading(true); setError('');
    if (!nom || !cabinet || !bce) { setError('Tous les champs sont requis'); setLoading(false); return; }
    const { data, error: err } = await supabase.auth.signUp({ email, password, options: { data: { nom, cabinet, bce } } });
    if (err) { setError(err.message); setLoading(false); return; }
    await supabase.from('fiduciaires').insert({ user_id: data.user?.id, nom: cabinet, bce, email, responsable: nom, plan: 'trial' });
    setSuccess('Compte cree ! Verifiez votre email.'); setLoading(false);
  };
  const S = { input: { width:'100%',padding:'10px 14px',background:'#0a0e1a',border:'1px solid #1e293b',borderRadius:6,color:'#e2e8f0',fontSize:14,outline:'none',boxSizing:'border-box' }, label: { display:'block',fontSize:12,color:'#94a3b8',fontWeight:500,marginBottom:6,textTransform:'uppercase',letterSpacing:0.3 } };
  return (
    <div style={{minHeight:'100vh',background:'#0a0e1a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Outfit',system-ui,sans-serif"}}>
      <div style={{width:440,padding:40}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:56,height:56,borderRadius:12,background:'#c9a227',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:800,color:'#0a0e1a',margin:'0 auto 12px'}}>A</div>
          <h1 style={{fontSize:22,fontWeight:700,color:'#f1f5f9',margin:0}}>Aureus Social Pro</h1>
          <p style={{color:'#64748b',fontSize:13,marginTop:4}}>Logiciel de paie belge</p>
        </div>
        <div style={{display:'flex',background:'#131825',borderRadius:8,padding:3,marginBottom:24}}>
          {['login','register'].map(m=>(<button key={m} onClick={()=>{setMode(m);setError('');setSuccess('');}} style={{flex:1,padding:'10px 0',border:'none',borderRadius:6,cursor:'pointer',fontSize:13,fontWeight:600,background:mode===m?'#c9a227':'transparent',color:mode===m?'#0a0e1a':'#64748b'}}>{m==='login'?'Connexion':'Inscription'}</button>))}
        </div>
        <div style={{background:'#131825',border:'1px solid #1e293b',borderRadius:10,padding:24}}>
          {mode==='register'&&(<><div style={{marginBottom:16}}><label style={S.label}>Votre nom</label><input value={nom} onChange={e=>setNom(e.target.value)} placeholder="Jean Dupont" style={S.input}/></div><div style={{marginBottom:16}}><label style={S.label}>Cabinet</label><input value={cabinet} onChange={e=>setCabinet(e.target.value)} placeholder="Cabinet Dupont SPRL" style={S.input}/></div><div style={{marginBottom:16}}><label style={S.label}>BCE</label><input value={bce} onChange={e=>setBce(e.target.value)} placeholder="0XXX.XXX.XXX" style={S.input}/></div></>)}
          <div style={{marginBottom:16}}><label style={S.label}>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@cabinet.be" style={S.input}/></div>
          <div style={{marginBottom:20}}><label style={S.label}>Mot de passe</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 8 caracteres" style={S.input}/></div>
          {error&&<div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:6,padding:'10px 14px',marginBottom:16,color:'#ef4444',fontSize:13}}>{error}</div>}
          {success&&<div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:6,padding:'10px 14px',marginBottom:16,color:'#22c55e',fontSize:13}}>{success}</div>}
          <button onClick={mode==='login'?handleLogin:handleRegister} disabled={loading} style={{width:'100%',padding:'12px 0',background:'#c9a227',color:'#0a0e1a',border:'none',borderRadius:6,fontSize:14,fontWeight:700,cursor:loading?'wait':'pointer',opacity:loading?0.6:1}}>{loading?'Chargement...':mode==='login'?'Se connecter':'Creer mon compte'}</button>
        </div>
        <div style={{textAlign:'center',marginTop:24,color:'#475569',fontSize:11}}>Aureus Social Pro v10 — Aureus IA SPRL — BE 1028.230.781</div>
      </div>
    </div>
  );
}