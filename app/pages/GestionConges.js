'use client';
// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Gestion des Congés avec workflow approbation
// Demande → Notification manager → Approbation/Refus → Notification employé
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo, useCallback } from 'react';
import { authFetch } from '@/app/lib/auth-fetch';

const GOLD='#c6a34e', GREEN='#22c55e', RED='#ef4444', ORANGE='#f97316', BLUE='#60a5fa';
const BG='#111620', BORDER='rgba(198,163,78,.15)';
const f0 = v => Math.round(v||0);
const fDate = d => d ? new Date(d).toLocaleDateString('fr-BE') : '—';
const diffJours = (d1, d2) => {
  if (!d1||!d2) return 0;
  const ms = new Date(d2)-new Date(d1);
  return Math.max(1, Math.round(ms/(1000*60*60*24))+1);
};

const TYPES = ['Congés annuels','Congé maladie','Congé parental','Petit chômage','Congé sans solde','Congé de maternité','Congé de paternité','Formation','Récupération','Autre'];
const STATUS_MAP = {
  en_attente: { label:'En attente', color:ORANGE, bg:'rgba(249,115,22,.1)' },
  approuve:   { label:'Approuvé',   color:GREEN,  bg:'rgba(34,197,94,.1)' },
  refuse:     { label:'Refusé',     color:RED,    bg:'rgba(239,68,68,.1)' },
  annule:     { label:'Annulé',     color:'#64748b', bg:'rgba(100,116,139,.1)' },
};

function Badge({s}) {
  const st = STATUS_MAP[s]||STATUS_MAP.en_attente;
  return <span style={{fontSize:9,padding:'2px 8px',borderRadius:10,fontWeight:700,background:st.bg,color:st.color}}>{st.label}</span>;
}

function Modal({title,onClose,children}) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:'#0d1117',border:`1px solid ${BORDER}`,borderRadius:14,padding:24,width:'100%',maxWidth:520,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div style={{fontSize:15,fontWeight:700,color:'#e8e6e0'}}>{title}</div>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:'#5e5c56',fontSize:22,cursor:'pointer',lineHeight:1}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({label,children}) {
  return <div style={{marginBottom:12}}>
    <label style={{fontSize:10,color:'#8b95a5',display:'block',marginBottom:4}}>{label}</label>
    {children}
  </div>;
}

const inputStyle = {width:'100%',padding:'8px 12px',borderRadius:7,border:'1px solid rgba(198,163,78,.2)',background:'rgba(0,0,0,.2)',color:'#e8e6e0',fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'};

export default function GestionConges({ s, d }) {
  const emps = s?.emps || [];
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('toutes');
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [commentaire, setCommentaire] = useState('');

  const [form, setForm] = useState({ emp_id:'', type:'Congés annuels', date_debut:'', date_fin:'', motif:'', manager_email:'' });

  const showToast = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  const load = useCallback(async () => {
    try {
      const r = await authFetch('/api/conges');
      if (r.ok) { const j = await r.json(); setDemandes(j.data||[]); }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(()=>{ load(); }, [load]);

  const stats = useMemo(()=>({
    total: demandes.length,
    attente: demandes.filter(c=>c.status==='en_attente').length,
    approuve: demandes.filter(c=>c.status==='approuve').length,
    refuse: demandes.filter(c=>c.status==='refuse').length,
  }), [demandes]);

  const filtered = useMemo(()=>{
    if (tab==='toutes') return demandes;
    return demandes.filter(c=>c.status===tab);
  }, [demandes, tab]);

  const selectedEmp = useMemo(()=> emps.find(e=>e.id===form.emp_id), [emps, form.emp_id]);

  const handleCreate = async () => {
    if (!form.emp_id || !form.date_debut || !form.date_fin) return showToast('Employé et dates requis', false);
    if (form.date_fin < form.date_debut) return showToast('Date de fin avant date de début', false);
    setSaving(true);
    const emp = emps.find(e=>e.id===form.emp_id);
    const nb_jours = diffJours(form.date_debut, form.date_fin);
    try {
      const r = await authFetch('/api/conges', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          ...form, nb_jours,
          emp_name: emp ? `${emp.first||emp.fn||''} ${emp.last||emp.ln||''}`.trim() : '',
          emp_email: emp?.email || null,
        })
      });
      const j = await r.json();
      if (r.ok) {
        setDemandes(prev=>[j.data, ...prev]);
        setShowNew(false);
        setForm({emp_id:'', type:'Congés annuels', date_debut:'', date_fin:'', motif:'', manager_email:''});
        showToast('Demande créée' + (form.manager_email?' — notification envoyée':''));
      } else showToast(j.error||'Erreur', false);
    } catch { showToast('Erreur réseau', false); }
    setSaving(false);
  };

  const handleDecision = async (id, status) => {
    setSaving(true);
    try {
      const r = await authFetch('/api/conges', {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({id, status, commentaire: commentaire||null})
      });
      const j = await r.json();
      if (r.ok) {
        setDemandes(prev=>prev.map(c=>c.id===id?j.data:c));
        setShowDetail(null);
        setCommentaire('');
        showToast(status==='approuve'?'✅ Congé approuvé':'❌ Congé refusé', status==='approuve');
      } else showToast(j.error||'Erreur', false);
    } catch { showToast('Erreur', false); }
    setSaving(false);
  };

  const tabs = [
    {k:'toutes',l:`Toutes (${stats.total})`},
    {k:'en_attente',l:`⏳ En attente (${stats.attente})`},
    {k:'approuve',l:`✅ Approuvées (${stats.approuve})`},
    {k:'refuse',l:`❌ Refusées (${stats.refuse})`},
  ];

  return (
    <div style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',color:'#e8e6e0'}}>
      {toast && <div style={{position:'fixed',top:70,right:20,zIndex:9999,padding:'10px 18px',borderRadius:8,background:toast.ok?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)',border:`1px solid ${toast.ok?'rgba(34,197,94,.3)':'rgba(239,68,68,.3)'}`,color:toast.ok?GREEN:RED,fontSize:12,fontWeight:600}}>{toast.msg}</div>}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <div style={{fontSize:20,fontWeight:800}}>🗓️ Gestion des Congés</div>
          <div style={{fontSize:11,color:'#5e5c56',marginTop:2}}>Demandes · Approbation manager · Notifications automatiques</div>
        </div>
        <button onClick={()=>setShowNew(true)} style={{padding:'9px 18px',borderRadius:8,border:'none',background:GOLD,color:'#0d1117',fontSize:13,fontWeight:700,cursor:'pointer'}}>+ Nouvelle demande</button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
        {[
          {l:'Total demandes', v:stats.total, c:GOLD},
          {l:'En attente', v:stats.attente, c:ORANGE},
          {l:'Approuvées', v:stats.approuve, c:GREEN},
          {l:'Refusées', v:stats.refuse, c:RED},
        ].map((k,i)=>(
          <div key={i} style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:10,padding:'14px 16px'}}>
            <div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase'}}>{k.l}</div>
            <div style={{fontSize:22,fontWeight:800,color:k.c,marginTop:4}}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'}}>
        {tabs.map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:'6px 14px',borderRadius:20,border:`1px solid ${tab===t.k?GOLD:'rgba(255,255,255,.1)'}`,background:tab===t.k?'rgba(198,163,78,.12)':'transparent',color:tab===t.k?GOLD:'#8b95a5',fontSize:11,cursor:'pointer'}}>{t.l}</button>
        ))}
      </div>

      {/* Liste */}
      {loading ? <div style={{textAlign:'center',padding:40,color:'#5e5c56'}}>Chargement...</div> :
       filtered.length===0 ? (
        <div style={{textAlign:'center',padding:48,border:'1px dashed rgba(198,163,78,.1)',borderRadius:12,color:'#5e5c56'}}>
          <div style={{fontSize:32,marginBottom:8}}>🗓️</div>
          <div style={{fontSize:14,fontWeight:600}}>Aucune demande</div>
          {tab==='toutes'&&<div style={{fontSize:11,marginTop:4}}>Cliquez sur "+ Nouvelle demande" pour commencer</div>}
        </div>
       ) : (
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {filtered.map(c=>(
            <div key={c.id} onClick={()=>{setShowDetail(c);setCommentaire('');}}
              style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',background:BG,border:`1px solid ${BORDER}`,borderRadius:10,cursor:'pointer',transition:'border-color .15s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(198,163,78,.3)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor=BORDER}>
              <div style={{width:38,height:38,borderRadius:8,background:'rgba(198,163,78,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>🗓️</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                  <span style={{fontSize:13,fontWeight:700}}>{c.emp_name||'—'}</span>
                  <Badge s={c.status}/>
                </div>
                <div style={{fontSize:11,color:'#5e5c56'}}>{c.type} · {fDate(c.date_debut)} → {fDate(c.date_fin)}{c.nb_jours?` · ${c.nb_jours}j`:''}</div>
              </div>
              <div style={{fontSize:9,color:'#5e5c56',flexShrink:0}}>{fDate(c.created_at)}</div>
              {c.status==='en_attente'&&(
                <div style={{display:'flex',gap:4}} onClick={e=>e.stopPropagation()}>
                  <button onClick={()=>handleDecision(c.id,'approuve')} style={{padding:'5px 10px',borderRadius:6,border:`1px solid ${GREEN}`,background:'transparent',color:GREEN,fontSize:10,cursor:'pointer',fontWeight:600}}>✅ OK</button>
                  <button onClick={()=>handleDecision(c.id,'refuse')} style={{padding:'5px 10px',borderRadius:6,border:`1px solid ${RED}`,background:'transparent',color:RED,fontSize:10,cursor:'pointer',fontWeight:600}}>✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
       )}

      {/* Modal nouvelle demande */}
      {showNew && (
        <Modal title="Nouvelle demande de congé" onClose={()=>setShowNew(false)}>
          <Field label="Travailleur *">
            <select value={form.emp_id} onChange={e=>setForm(p=>({...p,emp_id:e.target.value}))} style={inputStyle}>
              <option value="">— Sélectionner —</option>
              {emps.filter(e=>e.status==='active'||!e.status).map(e=>(
                <option key={e.id} value={e.id}>{e.first||e.fn||''} {e.last||e.ln||''}</option>
              ))}
            </select>
          </Field>
          <Field label="Type de congé *">
            <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={inputStyle}>
              {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <Field label="Date début *">
              <input type="date" value={form.date_debut} onChange={e=>setForm(p=>({...p,date_debut:e.target.value}))} style={inputStyle}/>
            </Field>
            <Field label="Date fin *">
              <input type="date" value={form.date_fin} onChange={e=>setForm(p=>({...p,date_fin:e.target.value}))} style={inputStyle}/>
            </Field>
          </div>
          {form.date_debut && form.date_fin && form.date_fin >= form.date_debut && (
            <div style={{fontSize:11,color:GOLD,marginBottom:8,marginTop:-4}}>→ {diffJours(form.date_debut,form.date_fin)} jour(s)</div>
          )}
          <Field label="Motif (optionnel)">
            <input type="text" value={form.motif} onChange={e=>setForm(p=>({...p,motif:e.target.value}))} placeholder="ex: vacances été, rendez-vous médical..." style={inputStyle}/>
          </Field>
          <Field label="Email manager (pour notification)">
            <input type="email" value={form.manager_email} onChange={e=>setForm(p=>({...p,manager_email:e.target.value}))} placeholder="manager@entreprise.be" style={inputStyle}/>
            <div style={{fontSize:9,color:'#5e5c56',marginTop:3}}>Un email de notification sera envoyé automatiquement</div>
          </Field>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
            <button onClick={()=>setShowNew(false)} style={{padding:'8px 16px',borderRadius:7,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:'#8b95a5',cursor:'pointer',fontSize:12}}>Annuler</button>
            <button onClick={handleCreate} disabled={saving} style={{padding:'8px 20px',borderRadius:7,border:'none',background:GOLD,color:'#0d1117',fontWeight:700,cursor:'pointer',fontSize:12}}>
              {saving?'Envoi...':'✓ Soumettre la demande'}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal détail / approbation */}
      {showDetail && (
        <Modal title="Détail de la demande" onClose={()=>setShowDetail(null)}>
          <div style={{background:'rgba(198,163,78,.04)',border:`1px solid ${BORDER}`,borderRadius:8,padding:14,marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
              <div style={{fontSize:14,fontWeight:700}}>{showDetail.emp_name}</div>
              <Badge s={showDetail.status}/>
            </div>
            {[
              ['Type', showDetail.type],
              ['Période', `${fDate(showDetail.date_debut)} → ${fDate(showDetail.date_fin)}`],
              ['Durée', showDetail.nb_jours ? `${showDetail.nb_jours} jour(s)` : '—'],
              ['Motif', showDetail.motif||'—'],
              ['Demandé le', fDate(showDetail.created_at)],
              ['Email travailleur', showDetail.emp_email||'—'],
            ].map(([l,v])=>(
              <div key={l} style={{display:'flex',gap:8,marginBottom:4,fontSize:11}}>
                <span style={{color:'#5e5c56',minWidth:120}}>{l} :</span>
                <span style={{color:'#e8e6e0'}}>{v}</span>
              </div>
            ))}
            {showDetail.commentaire && (
              <div style={{marginTop:8,padding:8,background:'rgba(0,0,0,.2)',borderRadius:6,fontSize:11,color:'#e8e6e0'}}>
                <b>Commentaire :</b> {showDetail.commentaire}
              </div>
            )}
          </div>

          {showDetail.status==='en_attente' && (
            <>
              <Field label="Commentaire (optionnel)">
                <textarea value={commentaire} onChange={e=>setCommentaire(e.target.value)} rows={2}
                  placeholder="Message pour le travailleur..."
                  style={{...inputStyle, resize:'vertical'}}/>
              </Field>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                <button onClick={()=>handleDecision(showDetail.id,'refuse')} disabled={saving}
                  style={{padding:'8px 16px',borderRadius:7,border:`1px solid ${RED}`,background:'transparent',color:RED,fontSize:12,fontWeight:600,cursor:'pointer'}}>
                  ❌ Refuser
                </button>
                <button onClick={()=>handleDecision(showDetail.id,'approuve')} disabled={saving}
                  style={{padding:'8px 20px',borderRadius:7,border:'none',background:GREEN,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                  {saving?'...':'✅ Approuver'}
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
