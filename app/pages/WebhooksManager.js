'use client';
// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Webhooks API Manager
// Gérer les endpoints webhooks sortants HMAC-SHA256
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '@/app/lib/auth-fetch';

const GOLD='#c6a34e', GREEN='#22c55e', RED='#ef4444', BLUE='#60a5fa';
const BG='#111620', BORDER='rgba(198,163,78,.15)', DARK='#0d1117';

const EVENTS = ['*','facture.created','facture.sent','facture.payee','conge.approved','conge.refused','employee.created','dimona.submitted','payroll.generated'];

function Badge({active}) {
  return <span style={{fontSize:9,padding:'2px 8px',borderRadius:10,fontWeight:700,background:active?'rgba(34,197,94,.1)':'rgba(100,116,139,.1)',color:active?GREEN:'#64748b'}}>{active?'Actif':'Inactif'}</span>;
}

const inputStyle = {width:'100%',padding:'8px 12px',borderRadius:7,border:'1px solid rgba(198,163,78,.2)',background:'rgba(0,0,0,.2)',color:'#e8e6e0',fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'};

export default function WebhooksManager({ s, d }) {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ url:'', events:['*'], description:'' });
  const [testing, setTesting] = useState(null);

  const showToast = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3500); };

  const load = useCallback(async () => {
    try {
      const r = await authFetch('/api/webhooks');
      if (r.ok) { const j = await r.json(); setEndpoints(j.data||j.endpoints||[]); }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.url) return showToast('URL requise', false);
    try { new URL(form.url); } catch { return showToast('URL invalide', false); }
    const r = await authFetch('/api/webhooks', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ url: form.url, events: form.events, description: form.description })
    });
    const j = await r.json();
    if (r.ok) {
      setEndpoints(prev => [j.data||j.endpoint, ...prev]);
      setShowNew(false);
      setForm({ url:'', events:['*'], description:'' });
      showToast('Webhook créé — copiez le secret !');
      if (j.data?.secret || j.endpoint?.secret) {
        alert(`🔑 Secret HMAC (copier maintenant — affiché une seule fois) :\n\n${j.data?.secret||j.endpoint?.secret}`);
      }
    } else showToast(j.error||'Erreur', false);
  };

  const handleToggle = async (id, enabled) => {
    const r = await authFetch('/api/webhooks', {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id, enabled: !enabled })
    });
    if (r.ok) { setEndpoints(prev=>prev.map(e=>e.id===id?{...e,enabled:!enabled}:e)); showToast('Mis à jour'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce webhook ?')) return;
    const r = await authFetch(`/api/webhooks?id=${id}`, { method:'DELETE' });
    if (r.ok) { setEndpoints(prev=>prev.filter(e=>e.id!==id)); showToast('Supprimé'); }
  };

  const handleTest = async (ep) => {
    setTesting(ep.id);
    const r = await authFetch('/api/webhooks', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ test: true, endpoint_id: ep.id, url: ep.url })
    });
    const j = await r.json();
    if (r.ok && j.test_ok) showToast(`✅ Endpoint répond (${j.status_code})`);
    else showToast(`❌ Endpoint inaccessible (${j.error||j.status_code||'timeout'})`, false);
    setTesting(null);
  };

  const toggleEvent = (ev) => {
    setForm(p => ({
      ...p,
      events: p.events.includes(ev) ? p.events.filter(e=>e!==ev) : [...p.events.filter(e=>e!=='*'), ev]
    }));
  };

  return (
    <div style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',color:'#e8e6e0'}}>
      {toast && <div style={{position:'fixed',top:70,right:20,zIndex:9999,padding:'10px 18px',borderRadius:8,background:toast.ok?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)',border:`1px solid ${toast.ok?'rgba(34,197,94,.3)':'rgba(239,68,68,.3)'}`,color:toast.ok?GREEN:RED,fontSize:12,fontWeight:600}}>{toast.msg}</div>}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <div style={{fontSize:20,fontWeight:800}}>🔗 Webhooks API</div>
          <div style={{fontSize:11,color:'#5e5c56',marginTop:2}}>Notifications sortantes HMAC-SHA256 · Peppol · Identifiant 0208:1028230781</div>
        </div>
        <button onClick={()=>setShowNew(true)} style={{padding:'9px 18px',borderRadius:8,border:'none',background:GOLD,color:DARK,fontSize:13,fontWeight:700,cursor:'pointer'}}>+ Nouveau webhook</button>
      </div>

      {/* Doc rapide */}
      <div style={{background:'rgba(96,165,250,.06)',border:'1px solid rgba(96,165,250,.2)',borderRadius:10,padding:'14px 16px',marginBottom:20,fontSize:11,color:'#8b95a5'}}>
        <div style={{fontWeight:700,color:BLUE,marginBottom:6}}>📚 Intégration rapide</div>
        <div>Chaque requête est signée <code style={{background:'rgba(0,0,0,.3)',padding:'1px 5px',borderRadius:4}}>X-Aureus-Signature: sha256=HMAC</code></div>
        <div style={{marginTop:4}}>Vérification : <code style={{background:'rgba(0,0,0,.3)',padding:'1px 5px',borderRadius:4}}>crypto.createHmac('sha256', SECRET).update(JSON.stringify(body)).digest('hex')</code></div>
        <div style={{marginTop:4}}>Identifiant Peppol expéditeur : <code style={{background:'rgba(0,0,0,.3)',padding:'1px 5px',borderRadius:4}}>0208:1028230781</code></div>
      </div>

      {loading ? <div style={{textAlign:'center',padding:40,color:'#5e5c56'}}>Chargement...</div> :
       endpoints.length === 0 ? (
        <div style={{textAlign:'center',padding:48,border:'1px dashed rgba(198,163,78,.1)',borderRadius:12,color:'#5e5c56'}}>
          <div style={{fontSize:32,marginBottom:8}}>🔗</div>
          <div style={{fontSize:14,fontWeight:600}}>Aucun endpoint configuré</div>
          <div style={{fontSize:11,marginTop:4}}>Ajoutez un webhook pour notifier votre ERP en temps réel</div>
        </div>
       ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {endpoints.map(ep => (
            <div key={ep.id} style={{padding:'14px 16px',background:BG,border:`1px solid ${BORDER}`,borderRadius:10}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <span style={{fontSize:13,fontWeight:700,color:'#e8e6e0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ep.url}</span>
                    <Badge active={ep.enabled}/>
                  </div>
                  <div style={{fontSize:10,color:'#5e5c56'}}>
                    {ep.description && <span style={{marginRight:8}}>{ep.description}</span>}
                    Events: {(ep.events||['*']).join(', ')}
                  </div>
                  {ep.last_delivery && <div style={{fontSize:9,color:'#5e5c56',marginTop:2}}>Dernière livraison : {new Date(ep.last_delivery).toLocaleDateString('fr-BE')}</div>}
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <button onClick={()=>handleTest(ep)} disabled={testing===ep.id}
                    style={{padding:'6px 12px',borderRadius:6,border:`1px solid ${BLUE}`,background:'transparent',color:BLUE,fontSize:10,cursor:'pointer',fontWeight:600}}>
                    {testing===ep.id?'...':'🧪 Test'}
                  </button>
                  <button onClick={()=>handleToggle(ep.id, ep.enabled)}
                    style={{padding:'6px 12px',borderRadius:6,border:`1px solid ${ep.enabled?GOLD:'rgba(255,255,255,.1)'}`,background:'transparent',color:ep.enabled?GOLD:'#64748b',fontSize:10,cursor:'pointer'}}>
                    {ep.enabled?'⏸ Désactiver':'▶ Activer'}
                  </button>
                  <button onClick={()=>handleDelete(ep.id)}
                    style={{padding:'6px 10px',borderRadius:6,border:`1px solid ${RED}`,background:'transparent',color:RED,fontSize:10,cursor:'pointer'}}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
       )}

      {showNew && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div style={{background:DARK,border:`1px solid ${BORDER}`,borderRadius:14,padding:24,width:'100%',maxWidth:500}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
              <div style={{fontSize:14,fontWeight:700}}>Nouveau webhook</div>
              <button onClick={()=>setShowNew(false)} style={{background:'transparent',border:'none',color:'#5e5c56',fontSize:22,cursor:'pointer'}}>×</button>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:10,color:'#8b95a5',display:'block',marginBottom:4}}>URL endpoint *</label>
              <input type="url" value={form.url} onChange={e=>setForm(p=>({...p,url:e.target.value}))} placeholder="https://votre-erp.com/webhook/aureus" style={inputStyle}/>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:10,color:'#8b95a5',display:'block',marginBottom:4}}>Description (optionnel)</label>
              <input type="text" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="ERP principal, Slack, Zapier..." style={inputStyle}/>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:10,color:'#8b95a5',display:'block',marginBottom:6}}>Événements à écouter</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {EVENTS.map(ev=>(
                  <button key={ev} onClick={()=>toggleEvent(ev)}
                    style={{padding:'4px 10px',borderRadius:6,border:`1px solid ${form.events.includes(ev)?GOLD:'rgba(255,255,255,.1)'}`,background:form.events.includes(ev)?'rgba(198,163,78,.12)':'transparent',color:form.events.includes(ev)?GOLD:'#8b95a5',fontSize:10,cursor:'pointer'}}>
                    {ev}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button onClick={()=>setShowNew(false)} style={{padding:'8px 16px',borderRadius:7,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:'#8b95a5',cursor:'pointer',fontSize:12}}>Annuler</button>
              <button onClick={handleCreate} style={{padding:'8px 20px',borderRadius:7,border:'none',background:GOLD,color:DARK,fontWeight:700,cursor:'pointer',fontSize:12}}>✓ Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
