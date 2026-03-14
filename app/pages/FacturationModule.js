'use client';
// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Module Facturation Interne
// Créer · envoyer · suivre les factures clients fiduciaires
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo, useCallback } from 'react';
import { authFetch } from '@/app/lib/auth-fetch';

const GOLD='#c6a34e', GREEN='#22c55e', RED='#ef4444', ORANGE='#f97316', BLUE='#60a5fa';
const DARK='#0d1117', BG='#111620', BORDER='rgba(198,163,78,.15)';
const f2 = v => new Intl.NumberFormat('fr-BE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v||0);
const fDate = d => d ? new Date(d).toLocaleDateString('fr-BE') : '—';

const STATUS = {
  brouillon: { label:'Brouillon', color:'#64748b', bg:'rgba(100,116,139,.1)' },
  envoyee:   { label:'Envoyée',   color:BLUE,      bg:'rgba(96,165,250,.1)' },
  payee:     { label:'Payée',     color:GREEN,     bg:'rgba(34,197,94,.1)' },
  retard:    { label:'En retard', color:ORANGE,    bg:'rgba(249,115,22,.1)' },
  annulee:   { label:'Annulée',   color:RED,       bg:'rgba(239,68,68,.1)' },
};

function Badge({s}) {
  const st = STATUS[s] || STATUS.brouillon;
  return <span style={{fontSize:9,padding:'2px 8px',borderRadius:10,fontWeight:700,background:st.bg,color:st.color}}>{st.label}</span>;
}

function StatCard({label, value, color, sub}) {
  return (
    <div style={{background:BG,border:`1px solid ${BORDER}`,borderRadius:10,padding:'14px 16px'}}>
      <div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase',letterSpacing:'.5px'}}>{label}</div>
      <div style={{fontSize:20,fontWeight:800,color:color||GOLD,marginTop:4}}>{value}</div>
      {sub && <div style={{fontSize:9,color:'#5e5c56',marginTop:2}}>{sub}</div>}
    </div>
  );
}

function Modal({title, onClose, children}) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:DARK,border:`1px solid ${BORDER}`,borderRadius:14,padding:24,width:'100%',maxWidth:560,maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div style={{fontSize:15,fontWeight:700,color:'#e8e6e0'}}>{title}</div>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:'#5e5c56',fontSize:20,cursor:'pointer',lineHeight:1}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({label, value, onChange, type='text', placeholder='', required=false}) {
  return (
    <div style={{marginBottom:12}}>
      <label style={{fontSize:10,color:'#8b95a5',display:'block',marginBottom:4}}>{label}{required&&' *'}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',padding:'8px 12px',borderRadius:7,border:`1px solid rgba(198,163,78,.2)`,background:'rgba(0,0,0,.2)',color:'#e8e6e0',fontSize:13,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
    </div>
  );
}

function Textarea({label, value, onChange, rows=3}) {
  return (
    <div style={{marginBottom:12}}>
      <label style={{fontSize:10,color:'#8b95a5',display:'block',marginBottom:4}}>{label}</label>
      <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows}
        style={{width:'100%',padding:'8px 12px',borderRadius:7,border:`1px solid rgba(198,163,78,.2)`,background:'rgba(0,0,0,.2)',color:'#e8e6e0',fontSize:13,fontFamily:'inherit',outline:'none',resize:'vertical',boxSizing:'border-box'}}/>
    </div>
  );
}

function Select({label, value, onChange, options}) {
  return (
    <div style={{marginBottom:12}}>
      <label style={{fontSize:10,color:'#8b95a5',display:'block',marginBottom:4}}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:'100%',padding:'8px 12px',borderRadius:7,border:`1px solid rgba(198,163,78,.2)`,background:BG,color:'#e8e6e0',fontSize:13,fontFamily:'inherit',outline:'none'}}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function FacturationModule({ s, d }) {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    client_name:'', client_email:'', montant:'', description:'', echeance:'',
  });

  const showToast = (msg, ok=true) => {
    setToast({msg, ok});
    setTimeout(()=>setToast(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const r = await authFetch('/api/facturation');
      if (r.ok) { const j = await r.json(); setFactures(j.data||[]); }
    } catch(e) {}
    setLoading(false);
  }, []);

  useEffect(()=>{ load(); }, [load]);

  // Auto-marquer en retard
  useEffect(()=>{
    const today = new Date().toISOString().slice(0,10);
    factures.forEach(async f => {
      if (f.echeance && f.status === 'envoyee' && f.echeance < today) {
        await authFetch('/api/facturation', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id:f.id, status:'retard'}) });
      }
    });
  }, [factures]);

  const stats = useMemo(() => {
    const total = factures.reduce((a,f)=>a+(f.montant||0),0);
    const payees = factures.filter(f=>f.status==='payee').reduce((a,f)=>a+(f.montant||0),0);
    const enAttente = factures.filter(f=>['envoyee','retard'].includes(f.status)).reduce((a,f)=>a+(f.montant||0),0);
    const retard = factures.filter(f=>f.status==='retard').length;
    return { total, payees, enAttente, retard, count: factures.length };
  }, [factures]);

  const filtered = useMemo(() => {
    return factures
      .filter(f => filter==='all' || f.status===filter)
      .filter(f => !search || `${f.client_name} ${f.numero} ${f.description||''}`.toLowerCase().includes(search.toLowerCase()));
  }, [factures, filter, search]);

  const handleCreate = async () => {
    if (!form.client_name || !form.montant) return showToast('Client et montant requis', false);
    setSaving(true);
    try {
      const r = await authFetch('/api/facturation', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form)
      });
      const j = await r.json();
      if (r.ok) {
        setFactures(prev=>[j.data, ...prev]);
        setShowNew(false);
        setForm({client_name:'', client_email:'', montant:'', description:'', echeance:''});
        showToast(`Facture ${j.data.numero} créée`);
      } else showToast(j.error||'Erreur', false);
    } catch(e) { showToast('Erreur réseau', false); }
    setSaving(false);
  };

  const handleStatus = async (id, status) => {
    const r = await authFetch('/api/facturation', {
      method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id, status})
    });
    if (r.ok) {
      setFactures(prev=>prev.map(f=>f.id===id?{...f,status}:f));
      if (showDetail?.id===id) setShowDetail(prev=>({...prev,status}));
      showToast('Statut mis à jour');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette facture définitivement ?')) return;
    const r = await authFetch(`/api/facturation?id=${id}`, { method:'DELETE' });
    if (r.ok) { setFactures(prev=>prev.filter(f=>f.id!==id)); setShowDetail(null); showToast('Supprimée'); }
  };

  const handleSendEmail = async (f) => {
    if (!f.client_email) return showToast('Email client manquant', false);
    const subject = `Facture ${f.numero} — ${f.montant.toFixed(2)} €`;
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0d1117;color:#c6a34e;padding:20px;text-align:center">
        <h2 style="margin:0;font-size:20px">AUREUS SOCIAL PRO</h2>
        <p style="margin:4px 0;color:#888;font-size:12px">Secrétariat social numérique belge</p>
      </div>
      <div style="padding:24px;background:#f9f9f9">
        <h3>Facture ${f.numero}</h3>
        <p>Bonjour,</p>
        <p>Veuillez trouver ci-joint votre facture d'un montant de <strong>${f.montant.toFixed(2)} €</strong>.</p>
        ${f.description?`<p><em>${f.description}</em></p>`:''}
        ${f.echeance?`<p>Date d'échéance : <strong>${fDate(f.echeance)}</strong></p>`:''}
        <div style="background:#fff;border:1px solid #ddd;border-radius:8px;padding:16px;margin:20px 0;text-align:center">
          <div style="font-size:28px;font-weight:bold;color:#0d1117">${f.montant.toFixed(2)} €</div>
          <div style="color:#666;font-size:12px;margin-top:4px">HTVA</div>
        </div>
        <p style="color:#666;font-size:11px">Paiement par virement bancaire — IBAN : BE60 0634 2848 8290 — BIC : GKCCBEBB<br/>
        Communication : ${f.numero}<br/>
        AUREUS IA SPRL — BCE BE 1028.230.781 — info@aureus-ia.com</p>
      </div>
    </div>`;
    const r = await authFetch('/api/send-email', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ to: f.client_email, subject, html })
    });
    if (r.ok) {
      await handleStatus(f.id, 'envoyee');
      showToast(`Email envoyé à ${f.client_email}`);
    } else showToast('Erreur envoi email', false);
  };

  const printFacture = (f) => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Facture ${f.numero}</title>
    <style>@page{margin:20mm}body{font-family:Arial,sans-serif;font-size:11pt;color:#111}
    .header{background:#0d1117;color:#c6a34e;padding:16px 24px;display:flex;justify-content:space-between}
    .gold{color:#c6a34e}.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6}
    .total{font-size:16pt;font-weight:bold;color:#0d1117}.footer{font-size:8pt;color:#9ca3af;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:8px}</style></head><body>
    <div class="header"><div><b>AUREUS SOCIAL PRO</b><br/><small>Secrétariat social numérique</small></div>
    <div style="text-align:right"><small>BCE BE 1028.230.781</small><br/><small>info@aureus-ia.com</small></div></div>
    <div style="padding:24px">
    <div style="display:flex;justify-content:space-between;margin-bottom:24px">
    <div><h2 style="margin:0">Facture</h2><span style="font-size:18pt;color:#c6a34e;font-weight:bold">${f.numero}</span></div>
    <div style="text-align:right"><div>Date : ${fDate(f.created_at)}</div>${f.echeance?`<div>Échéance : ${fDate(f.echeance)}</div>`:''}</div></div>
    <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-bottom:20px">
    <b>Facturé à :</b><br/>${f.client_name}${f.client_email?`<br/>${f.client_email}`:''}
    </div>
    ${f.description?`<div style="margin-bottom:16px"><b>Objet :</b><br/>${f.description}</div>`:''}
    <div style="border:2px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center;margin:20px 0">
    <div class="total">${f2(f.montant)} €</div><div style="color:#666;font-size:10pt">Montant HTVA</div></div>
    <div class="row"><span>Sous-total HTVA</span><span>${f2(f.montant)} €</span></div>
    <div class="row" style="border:none;font-weight:bold"><span>Total à payer</span><span>${f2(f.montant)} €</span></div>
    <div class="footer">Paiement par virement · IBAN : BE60 0634 2848 8290 · BIC : GKCCBEBB · Communication : ${f.numero}<br/>
    AUREUS IA SPRL · BCE BE 1028.230.781 · Place Marcel Broodthaers 8, 1060 Saint-Gilles · info@aureus-ia.com<br/>
    Conformément à la loi du 2 août 2002, tout retard de paiement entraîne des intérêts de 10%/an + indemnité forfaitaire de 40€.</div>
    </div></body></html>`;
    const w = window.open('','_blank'); w.document.write(html); w.document.close(); w.print();
  };

  const btn = (label, onClick, color=GOLD, outlined=false) => (
    <button onClick={onClick} style={{padding:'7px 14px',borderRadius:7,border:`1px solid ${color}`,
      background: outlined ? 'transparent' : color, color: outlined ? color : DARK,
      fontSize:11,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
      {label}
    </button>
  );

  return (
    <div style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',color:'#e8e6e0',padding:0}}>
      {/* Toast */}
      {toast && <div style={{position:'fixed',top:70,right:20,zIndex:9999,padding:'10px 18px',borderRadius:8,background:toast.ok?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)',border:`1px solid ${toast.ok?'rgba(34,197,94,.3)':'rgba(239,68,68,.3)'}`,color:toast.ok?GREEN:RED,fontSize:12,fontWeight:600}}>{toast.msg}</div>}

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:'#e8e6e0'}}>🧾 Facturation</div>
          <div style={{fontSize:11,color:'#5e5c56',marginTop:2}}>Créer · envoyer · suivre vos factures clients</div>
        </div>
        <button onClick={()=>setShowNew(true)} style={{padding:'9px 18px',borderRadius:8,border:'none',background:GOLD,color:DARK,fontSize:13,fontWeight:700,cursor:'pointer'}}>+ Nouvelle facture</button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
        <StatCard label="Total facturé" value={`${f2(stats.total)} €`} color={GOLD} sub={`${stats.count} facture(s)`}/>
        <StatCard label="Payé" value={`${f2(stats.payees)} €`} color={GREEN}/>
        <StatCard label="En attente" value={`${f2(stats.enAttente)} €`} color={BLUE}/>
        <StatCard label="En retard" value={stats.retard} color={ORANGE} sub="facture(s)"/>
      </div>

      {/* Filtres + Search */}
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        {[['all','Toutes'],['brouillon','Brouillons'],['envoyee','Envoyées'],['payee','Payées'],['retard','En retard'],['annulee','Annulées']].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{padding:'6px 14px',borderRadius:20,border:`1px solid ${filter===v?GOLD:'rgba(255,255,255,.1)'}`,background:filter===v?'rgba(198,163,78,.12)':'transparent',color:filter===v?GOLD:'#8b95a5',fontSize:11,cursor:'pointer'}}>{l}</button>
        ))}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
          style={{marginLeft:'auto',padding:'6px 12px',borderRadius:7,border:'1px solid rgba(255,255,255,.1)',background:'rgba(0,0,0,.2)',color:'#e8e6e0',fontSize:12,fontFamily:'inherit',outline:'none',width:200}}/>
      </div>

      {/* Liste */}
      {loading ? <div style={{textAlign:'center',padding:40,color:'#5e5c56'}}>Chargement...</div> :
       filtered.length === 0 ? (
        <div style={{textAlign:'center',padding:48,border:'1px dashed rgba(198,163,78,.1)',borderRadius:12,color:'#5e5c56'}}>
          <div style={{fontSize:32,marginBottom:8}}>🧾</div>
          <div style={{fontSize:14,fontWeight:600}}>Aucune facture</div>
          <div style={{fontSize:11,marginTop:4}}>Créez votre première facture en cliquant sur "+ Nouvelle facture"</div>
        </div>
       ) : (
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {filtered.map(f=>(
            <div key={f.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',background:BG,border:`1px solid ${BORDER}`,borderRadius:10,cursor:'pointer'}}
              onClick={()=>setShowDetail(f)}>
              <div style={{width:40,height:40,borderRadius:8,background:'rgba(198,163,78,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>🧾</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:13,fontWeight:700,color:'#e8e6e0'}}>{f.numero}</span>
                  <Badge s={f.status}/>
                </div>
                <div style={{fontSize:11,color:'#5e5c56',marginTop:2}}>{f.client_name}{f.echeance?` · Échéance ${fDate(f.echeance)}`:''}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:16,fontWeight:800,color:f.status==='payee'?GREEN:GOLD}}>{f2(f.montant)} €</div>
                <div style={{fontSize:9,color:'#5e5c56'}}>{fDate(f.created_at)}</div>
              </div>
              <div style={{display:'flex',gap:4}} onClick={e=>e.stopPropagation()}>
                {f.status==='brouillon' && f.client_email && btn('📨',()=>handleSendEmail(f),BLUE,true)}
                {f.status==='envoyee'   && btn('✅ Payée',()=>handleStatus(f.id,'payee'),GREEN,true)}
                {btn('🖨️',()=>printFacture(f),'rgba(255,255,255,.2)',true)}
              </div>
            </div>
          ))}
        </div>
       )}

      {/* Modal nouvelle facture */}
      {showNew && (
        <Modal title="Nouvelle facture" onClose={()=>setShowNew(false)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <Input label="Client *" value={form.client_name} onChange={v=>setForm(p=>({...p,client_name:v}))} placeholder="Boulangerie Dupont SPRL" required/>
            <Input label="Email client" value={form.client_email} onChange={v=>setForm(p=>({...p,client_email:v}))} placeholder="contact@client.be" type="email"/>
            <Input label="Montant HTVA (€) *" value={form.montant} onChange={v=>setForm(p=>({...p,montant:v}))} placeholder="950.00" type="number" required/>
            <Input label="Date d'échéance" value={form.echeance} onChange={v=>setForm(p=>({...p,echeance:v}))} type="date"/>
          </div>
          <Textarea label="Objet / Description" value={form.description} onChange={v=>setForm(p=>({...p,description:v}))} placeholder="Services paie janvier 2026 — 10 travailleurs"/>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
            <button onClick={()=>setShowNew(false)} style={{padding:'8px 16px',borderRadius:7,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:'#8b95a5',cursor:'pointer',fontSize:12}}>Annuler</button>
            <button onClick={handleCreate} disabled={saving} style={{padding:'8px 20px',borderRadius:7,border:'none',background:GOLD,color:DARK,fontWeight:700,cursor:'pointer',fontSize:12}}>
              {saving ? 'Création...' : '✓ Créer la facture'}
            </button>
          </div>
        </Modal>
      )}

      {/* Modal détail */}
      {showDetail && (
        <Modal title={`Facture ${showDetail.numero}`} onClose={()=>setShowDetail(null)}>
          <div style={{background:'rgba(198,163,78,.04)',border:`1px solid ${BORDER}`,borderRadius:8,padding:14,marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <Badge s={showDetail.status}/>
              <span style={{fontSize:20,fontWeight:800,color:GOLD}}>{f2(showDetail.montant)} €</span>
            </div>
            <div style={{fontSize:11,color:'#8b95a5'}}><b style={{color:'#e8e6e0'}}>Client :</b> {showDetail.client_name}</div>
            {showDetail.client_email && <div style={{fontSize:11,color:'#8b95a5'}}><b style={{color:'#e8e6e0'}}>Email :</b> {showDetail.client_email}</div>}
            {showDetail.description && <div style={{fontSize:11,color:'#8b95a5',marginTop:4}}>{showDetail.description}</div>}
            {showDetail.echeance && <div style={{fontSize:11,color:'#8b95a5'}}><b style={{color:'#e8e6e0'}}>Échéance :</b> {fDate(showDetail.echeance)}</div>}
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'space-between'}}>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {showDetail.status==='brouillon' && <button onClick={()=>{if(showDetail.client_email)handleSendEmail(showDetail);else showToast('Email client manquant',false)}} style={{padding:'7px 14px',borderRadius:7,border:`1px solid ${BLUE}`,background:'transparent',color:BLUE,fontSize:11,fontWeight:600,cursor:'pointer'}}>📨 Envoyer</button>}
              {['envoyee','retard'].includes(showDetail.status) && <button onClick={()=>handleStatus(showDetail.id,'payee')} style={{padding:'7px 14px',borderRadius:7,border:`1px solid ${GREEN}`,background:'transparent',color:GREEN,fontSize:11,fontWeight:600,cursor:'pointer'}}>✅ Marquer payée</button>}
              {showDetail.status==='envoyee' && <button onClick={()=>handleStatus(showDetail.id,'retard')} style={{padding:'7px 14px',borderRadius:7,border:`1px solid ${ORANGE}`,background:'transparent',color:ORANGE,fontSize:11,fontWeight:600,cursor:'pointer'}}>⏰ Marquer en retard</button>}
              {!['payee'].includes(showDetail.status) && <button onClick={()=>handleStatus(showDetail.id,'annulee')} style={{padding:'7px 14px',borderRadius:7,border:`1px solid ${RED}`,background:'transparent',color:RED,fontSize:11,fontWeight:600,cursor:'pointer'}}>✕ Annuler</button>}
            </div>
            <div style={{display:'flex',gap:6}}>
              <button onClick={()=>printFacture(showDetail)} style={{padding:'7px 14px',borderRadius:7,border:'1px solid rgba(255,255,255,.1)',background:'transparent',color:'#8b95a5',fontSize:11,cursor:'pointer'}}>🖨️ PDF</button>
              <button onClick={async()=>{
                const r = await authFetch(`/api/peppol?id=${showDetail.id}`);
                if(r.ok){const blob=await r.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`peppol-${showDetail.numero}.xml`;a.click();URL.revokeObjectURL(url);}
              }} style={{padding:'7px 14px',borderRadius:7,border:'1px solid rgba(198,163,78,.15)',background:'transparent',color:'#8b7340',fontSize:11,cursor:'pointer'}}>📋 Peppol UBL</button>
              <button onClick={()=>handleDelete(showDetail.id)} style={{padding:'7px 14px',borderRadius:7,border:`1px solid ${RED}`,background:'transparent',color:RED,fontSize:11,cursor:'pointer'}}>🗑</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
