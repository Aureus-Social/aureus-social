'use client';
// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Webhooks Manager
// Configurer les webhooks sortants HMAC-SHA256 vers les ERP
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '@/app/lib/auth-fetch';

const GOLD='#c6a34e', GREEN='#22c55e', RED='#ef4444', BLUE='#60a5fa';
const BG='#111620', BORDER='rgba(198,163,78,.15)', DARK='#0d1117';

const ALL_EVENTS = [
  { id: '*', label: 'Tous les événements' },
  { id: 'payroll.generated', label: 'Fiche de paie générée' },
  { id: 'dimona.submitted', label: 'Dimona IN soumise' },
  { id: 'dimona.out', label: 'Dimona OUT soumise' },
  { id: 'employee.created', label: 'Employé créé' },
  { id: 'employee.updated', label: 'Employé modifié' },
  { id: 'employee.deleted', label: 'Employé supprimé' },
  { id: 'conge.approved', label: 'Congé approuvé' },
  { id: 'conge.refused', label: 'Congé refusé' },
  { id: 'facture.sent', label: 'Facture envoyée' },
  { id: 'facture.paid', label: 'Facture payée' },
  { id: 'backup.completed', label: 'Backup complété' },
];

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:DARK,border:`1px solid ${BORDER}`,borderRadius:14,padding:24,width:'100%',maxWidth:540,maxHeight:'90vh',overflowY:'auto' }}>
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:20 }}>
          <div style={{ fontSize:15,fontWeight:700,color:'#e8e6e0' }}>{title}</div>
          <button onClick={onClose} style={{ background:'transparent',border:'none',color:'#5e5c56',fontSize:22,cursor:'pointer' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = { width:'100%',padding:'8px 12px',borderRadius:7,border:'1px solid rgba(198,163,78,.2)',background:'rgba(0,0,0,.2)',color:'#e8e6e0',fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box' };

export default function WebhooksManager({ s }) {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [showSecret, setShowSecret] = useState(null);
  const [toast, setToast] = useState(null);
  const [testing, setTesting] = useState(null);
  const [form, setForm] = useState({ url: '', events: ['*'] });

  const toast_ = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3500); };

  const load = useCallback(async () => {
    try {
      const r = await authFetch('/api/webhooks');
      if (r.ok) { const j = await r.json(); setWebhooks(j.data||[]); }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.url) return toast_('URL requise', false);
    try { new URL(form.url); } catch { return toast_('URL invalide', false); }
    if (!form.events.length) return toast_('Au moins un événement requis', false);
    const r = await authFetch('/api/webhooks', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    const j = await r.json();
    if (r.ok) {
      setWebhooks(prev => [j.data, ...prev]);
      setShowNew(false);
      setForm({ url: '', events: ['*'] });
      setShowSecret(j.data.secret);
      toast_('Webhook créé — copiez le secret maintenant');
    } else toast_(j.error||'Erreur', false);
  };

  const handleToggle = async (hook) => {
    const r = await authFetch('/api/webhooks', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id:hook.id, active:!hook.active}) });
    if (r.ok) { const j = await r.json(); setWebhooks(prev=>prev.map(h=>h.id===hook.id?j.data:h)); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce webhook définitivement ?')) return;
    await authFetch(`/api/webhooks?id=${id}`, { method:'DELETE' });
    setWebhooks(prev=>prev.filter(h=>h.id!==id));
    toast_('Webhook supprimé');
  };

  const handleTest = async (hook) => {
    setTesting(hook.id);
    const r = await authFetch('/api/webhooks', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ trigger:true, event:'test.ping', data:{ message:'Test depuis Aureus Social Pro', timestamp: new Date().toISOString() } })
    });
    const j = await r.json();
    setTesting(null);
    if (j.ok && j.delivered > 0) toast_('✅ Test envoyé avec succès');
    else toast_('❌ Échec de livraison', false);
  };

  const toggleEvent = (ev) => {
    if (ev === '*') { setForm(p=>({...p, events:['*']})); return; }
    setForm(p => {
      const evs = p.events.filter(e=>e!=='*');
      return { ...p, events: evs.includes(ev) ? evs.filter(e=>e!==ev) : [...evs, ev] };
    });
  };

  return (
    <div style={{ fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',color:'#e8e6e0' }}>
      {toast && <div style={{ position:'fixed',top:70,right:20,zIndex:9999,padding:'10px 18px',borderRadius:8,background:toast.ok?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)',border:`1px solid ${toast.ok?'rgba(34,197,94,.3)':'rgba(239,68,68,.3)'}`,color:toast.ok?GREEN:RED,fontSize:12,fontWeight:600 }}>{toast.msg}</div>}

      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20,fontWeight:800 }}>🔗 Webhooks API</div>
          <div style={{ fontSize:11,color:'#5e5c56',marginTop:2 }}>Notifications temps réel vers votre ERP · HMAC-SHA256 · REST</div>
        </div>
        <button onClick={()=>setShowNew(true)} style={{ padding:'9px 18px',borderRadius:8,border:'none',background:GOLD,color:DARK,fontSize:13,fontWeight:700,cursor:'pointer' }}>+ Nouveau webhook</button>
      </div>

      {/* Doc rapide */}
      <div style={{ background:'rgba(37,99,235,.06)',border:'1px solid rgba(37,99,235,.2)',borderRadius:10,padding:14,marginBottom:20,fontSize:11,color:'#93c5fd',lineHeight:1.7 }}>
        <b style={{ color:BLUE }}>Vérification HMAC :</b> Chaque requête inclut le header <code style={{ background:'rgba(0,0,0,.3)',padding:'1px 6px',borderRadius:4 }}>X-Aureus-Signature: sha256=&lt;hex&gt;</code><br/>
        Calculez : <code style={{ background:'rgba(0,0,0,.3)',padding:'1px 6px',borderRadius:4 }}>HMAC-SHA256(secret, JSON.stringify(payload))</code> et comparez au header.
      </div>

      {loading ? <div style={{ textAlign:'center',padding:40,color:'#5e5c56' }}>Chargement...</div> :
       webhooks.length === 0 ? (
        <div style={{ textAlign:'center',padding:48,border:'1px dashed rgba(198,163,78,.1)',borderRadius:12,color:'#5e5c56' }}>
          <div style={{ fontSize:32,marginBottom:8 }}>🔗</div>
          <div style={{ fontSize:14,fontWeight:600 }}>Aucun webhook configuré</div>
          <div style={{ fontSize:11,marginTop:4 }}>Connectez votre ERP ou logiciel comptable pour recevoir les événements en temps réel</div>
        </div>
       ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          {webhooks.map(h => (
            <div key={h.id} style={{ background:BG,border:`1px solid ${BORDER}`,borderRadius:10,padding:'14px 16px' }}>
              <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:8 }}>
                <div style={{ width:8,height:8,borderRadius:'50%',background:h.active?GREEN:RED,flexShrink:0 }}/>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:'#e8e6e0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{h.url}</div>
                  <div style={{ fontSize:10,color:'#5e5c56',marginTop:2 }}>
                    {(h.events||[]).join(', ')} · {h.delivery_count||0} livraisons
                    {h.last_delivery && ` · Dernier: ${new Date(h.last_delivery).toLocaleDateString('fr-BE')}`}
                    {h.last_status && <span style={{ color:h.last_status==='success'?GREEN:RED }}> ({h.last_status})</span>}
                  </div>
                </div>
                <div style={{ display:'flex',gap:6,flexShrink:0 }}>
                  <button onClick={()=>handleTest(h)} disabled={testing===h.id} style={{ padding:'5px 10px',borderRadius:6,border:`1px solid ${BLUE}`,background:'transparent',color:BLUE,fontSize:10,cursor:'pointer' }}>{testing===h.id?'...':'Test'}</button>
                  <button onClick={()=>handleToggle(h)} style={{ padding:'5px 10px',borderRadius:6,border:`1px solid ${h.active?GOLD:GREEN}`,background:'transparent',color:h.active?GOLD:GREEN,fontSize:10,cursor:'pointer' }}>{h.active?'Pause':'Activer'}</button>
                  <button onClick={()=>handleDelete(h.id)} style={{ padding:'5px 10px',borderRadius:6,border:`1px solid ${RED}`,background:'transparent',color:RED,fontSize:10,cursor:'pointer' }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
       )}

      {/* Modal secret one-time */}
      {showSecret && (
        <Modal title="🔑 Secret du webhook — copiez maintenant" onClose={()=>setShowSecret(null)}>
          <div style={{ background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.2)',borderRadius:8,padding:12,marginBottom:16,fontSize:11,color:'#fca5a5' }}>
            ⚠️ Ce secret ne sera affiché qu'une seule fois. Copiez-le maintenant.
          </div>
          <div style={{ background:'rgba(0,0,0,.3)',borderRadius:8,padding:12,fontFamily:'monospace',fontSize:11,color:GREEN,wordBreak:'break-all',marginBottom:16 }}>{showSecret}</div>
          <button onClick={()=>{ navigator.clipboard?.writeText(showSecret); toast_('Copié !'); }} style={{ width:'100%',padding:'10px',borderRadius:8,border:'none',background:GOLD,color:DARK,fontWeight:700,cursor:'pointer' }}>📋 Copier le secret</button>
        </Modal>
      )}

      {/* Modal nouveau webhook */}
      {showNew && (
        <Modal title="Nouveau webhook" onClose={()=>setShowNew(false)}>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:10,color:'#8b95a5',display:'block',marginBottom:4 }}>URL de destination *</label>
            <input value={form.url} onChange={e=>setForm(p=>({...p,url:e.target.value}))} placeholder="https://api.mon-erp.be/webhooks/aureus" style={inputStyle}/>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:10,color:'#8b95a5',display:'block',marginBottom:8 }}>Événements à écouter *</label>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
              {ALL_EVENTS.map(ev=>(
                <button key={ev.id} onClick={()=>toggleEvent(ev.id)}
                  style={{ padding:'4px 10px',borderRadius:20,border:`1px solid ${form.events.includes(ev.id)?GOLD:'rgba(255,255,255,.1)'}`,background:form.events.includes(ev.id)?'rgba(198,163,78,.12)':'transparent',color:form.events.includes(ev.id)?GOLD:'#8b95a5',fontSize:10,cursor:'pointer' }}>
                  {ev.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex',justifyContent:'flex-end',gap:8 }}>
            <button onClick={()=>setShowNew(false)} style={{ padding:'8px 16px',borderRadius:7,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:'#8b95a5',cursor:'pointer',fontSize:12 }}>Annuler</button>
            <button onClick={handleCreate} style={{ padding:'8px 20px',borderRadius:7,border:'none',background:GOLD,color:DARK,fontWeight:700,cursor:'pointer',fontSize:12 }}>✓ Créer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
