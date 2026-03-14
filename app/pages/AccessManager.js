'use client';
// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Gestion des demandes d'accès (Admin)
// Visible uniquement pour info@aureus-ia.com
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '@/app/lib/auth-fetch';

const GOLD='#c6a34e', GREEN='#22c55e', RED='#ef4444', ORANGE='#f97316', BLUE='#60a5fa';
const BG='#111620', BORDER='rgba(198,163,78,.15)';

const ROLE_LABELS = {
  fiduciaire:   '🏢 Fiduciaire',
  comptable:    '📊 Expert-comptable',
  rh_societe:   '👥 RH Société',
  rh_employeur: '🏭 RH Employeur',
  employeur:    '👔 Employeur PME',
};
const STATUS_COLORS = {
  pending:  { color: ORANGE, bg: 'rgba(249,115,22,.1)', label: '⏳ En attente' },
  approved: { color: GREEN,  bg: 'rgba(34,197,94,.1)',  label: '✅ Approuvé' },
  rejected: { color: RED,    bg: 'rgba(239,68,68,.1)',  label: '❌ Refusé' },
  blocked:  { color: '#64748b', bg: 'rgba(100,116,139,.1)', label: '🚫 Bloqué' },
};

function Badge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return <span style={{ fontSize:9, padding:'2px 8px', borderRadius:10, fontWeight:700, background:s.bg, color:s.color }}>{s.label}</span>;
}

export default function AccessManager({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('pending');
  const [selected, setSelected] = useState(null);
  const [rejReason, setRejReason] = useState('');
  const [roleOverride, setRoleOverride] = useState('');
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState(null);

  const toast_ = (msg, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3500); };

  const load = useCallback(async () => {
    const r = await authFetch('/api/access?admin=1');
    if (r.ok) { const j = await r.json(); setRequests(j.data||[]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id, action) => {
    setSaving(true);
    const r = await authFetch('/api/access', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, rejected_reason: rejReason||null, role_type: roleOverride||null }),
    });
    const j = await r.json();
    if (r.ok) {
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: j.status } : req));
      setSelected(null); setRejReason(''); setRoleOverride('');
      toast_(action === 'approve' ? '✅ Accès activé — email envoyé' : '❌ Demande refusée — email envoyé');
    } else toast_(j.error || 'Erreur', false);
    setSaving(false);
  };

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);
  const counts = { pending: requests.filter(r=>r.status==='pending').length, approved: requests.filter(r=>r.status==='approved').length, rejected: requests.filter(r=>r.status==='rejected').length };

  return (
    <div style={{ fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', color:'#e8e6e0' }}>
      {toast && <div style={{ position:'fixed',top:70,right:20,zIndex:9999,padding:'10px 18px',borderRadius:8,background:toast.ok?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)',border:`1px solid ${toast.ok?'rgba(34,197,94,.3)':'rgba(239,68,68,.3)'}`,color:toast.ok?GREEN:RED,fontSize:12,fontWeight:600 }}>{toast.msg}</div>}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800 }}>🔑 Demandes d'accès</div>
          <div style={{ fontSize:11, color:'#5e5c56', marginTop:2 }}>Valide les profils avant d'accorder l'accès à l'app</div>
        </div>
        <button onClick={load} style={{ padding:'7px 14px', borderRadius:7, border:`1px solid ${BORDER}`, background:'transparent', color:GOLD, fontSize:11, cursor:'pointer' }}>↻ Actualiser</button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        {[
          { l:'En attente', v:counts.pending, c:ORANGE },
          { l:'Approuvés', v:counts.approved, c:GREEN },
          { l:'Refusés', v:requests.filter(r=>r.status==='rejected').length, c:RED },
          { l:'Total', v:requests.length, c:GOLD },
        ].map((k,i) => (
          <div key={i} style={{ background:BG, border:`1px solid ${BORDER}`, borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:9, color:'#5e5c56', textTransform:'uppercase' }}>{k.l}</div>
            <div style={{ fontSize:22, fontWeight:800, color:k.c, marginTop:4 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {[['pending','⏳ En attente'],['approved','✅ Approuvés'],['rejected','❌ Refusés'],['all','Toutes']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{ padding:'6px 14px', borderRadius:20, border:`1px solid ${filter===v?GOLD:'rgba(255,255,255,.1)'}`, background:filter===v?'rgba(198,163,78,.12)':'transparent', color:filter===v?GOLD:'#8b95a5', fontSize:11, cursor:'pointer' }}>
            {l}{v==='pending'&&counts.pending>0?` (${counts.pending})`:''}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? <div style={{ textAlign:'center', padding:40, color:'#5e5c56' }}>Chargement...</div> :
       filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:48, border:'1px dashed rgba(198,163,78,.1)', borderRadius:12, color:'#5e5c56' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🔑</div>
          <div style={{ fontSize:14, fontWeight:600 }}>Aucune demande {filter === 'pending' ? 'en attente' : ''}</div>
        </div>
       ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {filtered.map(req => (
            <div key={req.id} style={{ background:BG, border:`1px solid ${BORDER}`, borderRadius:10, overflow:'hidden' }}>
              {/* Ligne principale */}
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', cursor:'pointer' }}
                onClick={() => setSelected(selected?.id===req.id?null:req)}>
                <div style={{ width:40, height:40, borderRadius:10, background:'rgba(198,163,78,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                  {ROLE_LABELS[req.role_type]?.[0] || '👤'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                    <span style={{ fontSize:13, fontWeight:700 }}>{req.full_name}</span>
                    <Badge status={req.status}/>
                  </div>
                  <div style={{ fontSize:10, color:'#5e5c56' }}>
                    {req.email} · {ROLE_LABELS[req.role_type] || req.role_type}
                    {req.company_name ? ` · ${req.company_name}` : ''}
                    {req.company_bce ? ` · ${req.company_bce}` : ''}
                  </div>
                </div>
                <div style={{ fontSize:9, color:'#5e5c56', flexShrink:0 }}>{new Date(req.created_at).toLocaleDateString('fr-BE')}</div>
                {req.status === 'pending' && (
                  <div style={{ display:'flex', gap:4, flexShrink:0 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleAction(req.id, 'approve')}
                      style={{ padding:'5px 12px', borderRadius:6, border:`1px solid ${GREEN}`, background:'transparent', color:GREEN, fontSize:10, cursor:'pointer', fontWeight:600 }}>✅ Approuver</button>
                    <button onClick={() => setSelected(req)}
                      style={{ padding:'5px 12px', borderRadius:6, border:`1px solid ${RED}`, background:'transparent', color:RED, fontSize:10, cursor:'pointer', fontWeight:600 }}>❌ Refuser</button>
                  </div>
                )}
              </div>

              {/* Détail déplié */}
              {selected?.id === req.id && (
                <div style={{ padding:'0 16px 16px', borderTop:'1px solid rgba(255,255,255,.04)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12, marginBottom:12 }}>
                    {[
                      ['Email', req.email],
                      ['Téléphone', req.phone || '—'],
                      ['Rôle', ROLE_LABELS[req.role_type]],
                      ['BCE', req.company_bce || '—'],
                      req.nb_dossiers ? ['Dossiers clients', req.nb_dossiers] : null,
                      req.nb_employees ? ['Employés', req.nb_employees] : null,
                    ].filter(Boolean).map(([l,v]) => (
                      <div key={l} style={{ fontSize:11 }}>
                        <span style={{ color:'#5e5c56' }}>{l} : </span>
                        <span style={{ color:'#e8e6e0', fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {req.message && <div style={{ fontSize:11, color:'#8b95a5', padding:'8px 12px', background:'rgba(0,0,0,.2)', borderRadius:6, marginBottom:12 }}><b>Message :</b> {req.message}</div>}

                  {req.status === 'pending' && (
                    <>
                      {/* Changer le rôle avant d'approuver */}
                      <div style={{ marginBottom:10 }}>
                        <label style={{ fontSize:10, color:'#8b95a5', display:'block', marginBottom:4 }}>Rôle accordé (laisser vide = rôle demandé)</label>
                        <select value={roleOverride} onChange={e => setRoleOverride(e.target.value)}
                          style={{ width:'100%', padding:'8px 12px', borderRadius:7, border:`1px solid ${BORDER}`, background:'rgba(0,0,0,.2)', color:'#e8e6e0', fontSize:12, fontFamily:'inherit', outline:'none' }}>
                          <option value="">— Rôle demandé : {ROLE_LABELS[req.role_type]} —</option>
                          {Object.entries(ROLE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom:12 }}>
                        <label style={{ fontSize:10, color:'#8b95a5', display:'block', marginBottom:4 }}>Motif de refus (si refus)</label>
                        <input value={rejReason} onChange={e => setRejReason(e.target.value)}
                          placeholder="ex: Profil incomplet, pas fiduciaire belge..."
                          style={{ width:'100%', padding:'8px 12px', borderRadius:7, border:`1px solid ${BORDER}`, background:'rgba(0,0,0,.2)', color:'#e8e6e0', fontSize:12, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={() => handleAction(req.id, 'approve')} disabled={saving}
                          style={{ flex:1, padding:'10px', borderRadius:8, border:'none', background:GREEN, color:'#fff', fontWeight:700, cursor:'pointer', fontSize:12 }}>
                          {saving?'...':'✅ Approuver l\'accès'}
                        </button>
                        <button onClick={() => handleAction(req.id, 'reject')} disabled={saving}
                          style={{ flex:1, padding:'10px', borderRadius:8, border:`1px solid ${RED}`, background:'transparent', color:RED, fontWeight:700, cursor:'pointer', fontSize:12 }}>
                          {saving?'...':'❌ Refuser'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
       )}
    </div>
  );
}
