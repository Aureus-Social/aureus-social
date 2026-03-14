'use client';
// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Page demande d'accès
// Affichée aux nouveaux inscrits en attente de validation
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { authFetch } from '@/app/lib/auth-fetch';

const GOLD='#c6a34e', GREEN='#22c55e', RED='#ef4444', DARK='#0d1117';

const ROLES = [
  { id:'fiduciaire',   icon:'🏢', label:'Fiduciaire / Cabinet comptable',     desc:'Je gère la paie de plusieurs clients employeurs' },
  { id:'comptable',    icon:'📊', label:'Expert-comptable indépendant',        desc:'Je gère les déclarations sociales pour mes clients' },
  { id:'rh_societe',   icon:'👥', label:'Service RH d\'une société',           desc:'Je gère les RH d\'une ou plusieurs sociétés en interne' },
  { id:'rh_employeur', icon:'🏭', label:'RH interne pour un employeur',        desc:'Je suis responsable RH d\'une entreprise' },
  { id:'employeur',    icon:'👔', label:'Employeur direct (PME / indépendant)', desc:'Je gère directement mes propres employés' },
];

export default function AccessRequest({ user, onApproved }) {
  const [status, setStatus]       = useState(null); // null | pending | approved | rejected
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [form, setForm] = useState({
    full_name: '', company_name: '', company_bce: '',
    phone: '', message: '', nb_employees: '', nb_dossiers: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    authFetch('/api/access').then(r => r.json()).then(j => {
      if (j.data?.status === 'approved') {
        setStatus('approved');
        onApproved && onApproved();
      } else if (j.data?.status) {
        setStatus(j.data.status);
      } else {
        setStatus('new');
        // Pré-remplir le nom depuis les metadata
        if (user?.user_metadata?.full_name) setForm(p => ({ ...p, full_name: user.user_metadata.full_name }));
      }
    }).catch(() => setStatus('new')).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!selectedRole) return setError('Sélectionnez votre profil');
    if (!form.full_name) return setError('Votre nom est requis');
    setSubmitting(true); setError('');
    try {
      const r = await authFetch('/api/access', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role_type: selectedRole,
          nb_employees: form.nb_employees ? parseInt(form.nb_employees) : null,
          nb_dossiers: form.nb_dossiers ? parseInt(form.nb_dossiers) : null,
        }),
      });
      const j = await r.json();
      if (r.ok) setStatus('pending');
      else setError(j.error || 'Erreur');
    } catch { setError('Erreur réseau'); }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:DARK, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#5e5c56', fontSize:13 }}>Vérification de votre accès...</div>
    </div>
  );

  // Approuvé → l'app se charge normalement (géré par onApproved)
  if (status === 'approved') return null;

  return (
    <div style={{ minHeight:'100vh', background:DARK, fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', color:'#e8e6e0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>

      {/* Logo */}
      <div style={{ marginBottom:32, textAlign:'center' }}>
        <div style={{ fontSize:28, fontWeight:800, color:GOLD, letterSpacing:2 }}>AUREUS</div>
        <div style={{ fontSize:11, color:'#5e5c56', letterSpacing:3, marginTop:2 }}>SOCIAL PRO</div>
      </div>

      {/* En attente */}
      {status === 'pending' && (
        <div style={{ maxWidth:480, width:'100%', background:'#111620', border:'1px solid rgba(198,163,78,.2)', borderRadius:16, padding:32, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>⏳</div>
          <div style={{ fontSize:20, fontWeight:700, color:GOLD, marginBottom:8 }}>Demande envoyée !</div>
          <div style={{ fontSize:13, color:'#8b95a5', lineHeight:1.7, marginBottom:20 }}>
            Notre équipe va vérifier votre profil.<br/>
            Vous recevrez un email de confirmation dans les <b style={{ color:'#e8e6e0' }}>24 heures ouvrables</b>.
          </div>
          <div style={{ padding:'12px 16px', background:'rgba(198,163,78,.06)', border:'1px solid rgba(198,163,78,.15)', borderRadius:8, fontSize:11, color:'#8b95a5' }}>
            📧 Un email a été envoyé à <b style={{ color:'#e8e6e0' }}>{user?.email}</b>
          </div>
        </div>
      )}

      {/* Refusé */}
      {status === 'rejected' && (
        <div style={{ maxWidth:480, width:'100%', background:'#111620', border:'1px solid rgba(239,68,68,.2)', borderRadius:16, padding:32, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>❌</div>
          <div style={{ fontSize:20, fontWeight:700, color:RED, marginBottom:8 }}>Accès non accordé</div>
          <div style={{ fontSize:13, color:'#8b95a5', lineHeight:1.7 }}>
            Votre demande n'a pas été retenue.<br/>
            Contactez-nous : <a href="mailto:info@aureus-ia.com" style={{ color:GOLD }}>info@aureus-ia.com</a>
          </div>
        </div>
      )}

      {/* Bloqué */}
      {status === 'blocked' && (
        <div style={{ maxWidth:480, width:'100%', background:'#111620', border:'1px solid rgba(239,68,68,.2)', borderRadius:16, padding:32, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🚫</div>
          <div style={{ fontSize:20, fontWeight:700, color:RED, marginBottom:8 }}>Compte bloqué</div>
          <div style={{ fontSize:13, color:'#8b95a5' }}>Contactez-nous : <a href="mailto:info@aureus-ia.com" style={{ color:GOLD }}>info@aureus-ia.com</a></div>
        </div>
      )}

      {/* Nouveau — formulaire */}
      {status === 'new' && (
        <div style={{ maxWidth:560, width:'100%' }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ fontSize:22, fontWeight:700 }}>Demande d'accès</div>
            <div style={{ fontSize:12, color:'#5e5c56', marginTop:4 }}>
              Connecté en tant que <b style={{ color:GOLD }}>{user?.email}</b>
            </div>
          </div>

          {/* Sélection rôle */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#8b95a5', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:12 }}>
              Votre profil *
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {ROLES.map(r => (
                <div key={r.id} onClick={() => setSelectedRole(r.id)}
                  style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:selectedRole===r.id?'rgba(198,163,78,.08)':'#111620',
                    border:`2px solid ${selectedRole===r.id?GOLD:'rgba(255,255,255,.06)'}`,
                    borderRadius:10, cursor:'pointer', transition:'all .15s' }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:selectedRole===r.id?'rgba(198,163,78,.15)':'rgba(255,255,255,.04)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{r.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:selectedRole===r.id?GOLD:'#e8e6e0' }}>{r.label}</div>
                    <div style={{ fontSize:10, color:'#5e5c56', marginTop:2 }}>{r.desc}</div>
                  </div>
                  <div style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${selectedRole===r.id?GOLD:'rgba(255,255,255,.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {selectedRole===r.id && <div style={{ width:8, height:8, borderRadius:'50%', background:GOLD }}/>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infos personnelles */}
          <div style={{ background:'#111620', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:20, marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#8b95a5', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:14 }}>Vos informations</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { key:'full_name', label:'Nom complet *', placeholder:'Jean Dupont', col:2 },
                { key:'company_name', label:'Nom de la société', placeholder:'Fiduciaire Dupont SPRL' },
                { key:'company_bce', label:'N° BCE', placeholder:'BE 0123.456.789' },
                { key:'phone', label:'Téléphone', placeholder:'+32 470 12 34 56' },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.col === 2 ? '1/-1' : 'auto' }}>
                  <label style={{ fontSize:10, color:'#8b95a5', display:'block', marginBottom:4 }}>{f.label}</label>
                  <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width:'100%', padding:'9px 12px', borderRadius:7, border:'1px solid rgba(198,163,78,.2)', background:'rgba(0,0,0,.2)', color:'#e8e6e0', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
                </div>
              ))}

              {/* Champs conditionnels */}
              {(selectedRole==='fiduciaire'||selectedRole==='comptable') && (
                <div>
                  <label style={{ fontSize:10, color:'#8b95a5', display:'block', marginBottom:4 }}>Nb de dossiers clients</label>
                  <input type="number" value={form.nb_dossiers} onChange={e => setForm(p => ({ ...p, nb_dossiers: e.target.value }))}
                    placeholder="ex: 25"
                    style={{ width:'100%', padding:'9px 12px', borderRadius:7, border:'1px solid rgba(198,163,78,.2)', background:'rgba(0,0,0,.2)', color:'#e8e6e0', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
                </div>
              )}
              {(selectedRole==='employeur'||selectedRole==='rh_societe'||selectedRole==='rh_employeur') && (
                <div>
                  <label style={{ fontSize:10, color:'#8b95a5', display:'block', marginBottom:4 }}>Nb d'employés</label>
                  <input type="number" value={form.nb_employees} onChange={e => setForm(p => ({ ...p, nb_employees: e.target.value }))}
                    placeholder="ex: 12"
                    style={{ width:'100%', padding:'9px 12px', borderRadius:7, border:'1px solid rgba(198,163,78,.2)', background:'rgba(0,0,0,.2)', color:'#e8e6e0', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' }}/>
                </div>
              )}
            </div>

            <div style={{ marginTop:10 }}>
              <label style={{ fontSize:10, color:'#8b95a5', display:'block', marginBottom:4 }}>Message (optionnel)</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                placeholder="Décrivez votre besoin, votre contexte..."
                rows={2}
                style={{ width:'100%', padding:'9px 12px', borderRadius:7, border:'1px solid rgba(198,163,78,.2)', background:'rgba(0,0,0,.2)', color:'#e8e6e0', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' }}/>
            </div>
          </div>

          {error && <div style={{ color:RED, fontSize:12, marginBottom:12, padding:'8px 12px', background:'rgba(239,68,68,.08)', borderRadius:7 }}>{error}</div>}

          <button onClick={handleSubmit} disabled={submitting || !selectedRole || !form.full_name}
            style={{ width:'100%', padding:'14px', borderRadius:10, border:'none',
              background: (!selectedRole||!form.full_name) ? 'rgba(198,163,78,.3)' : GOLD,
              color:DARK, fontSize:14, fontWeight:700, cursor:(!selectedRole||!form.full_name)?'default':'pointer' }}>
            {submitting ? 'Envoi en cours...' : '✉️ Soumettre ma demande d\'accès'}
          </button>
          <div style={{ textAlign:'center', marginTop:10, fontSize:10, color:'#5e5c56' }}>
            Validation sous 24h ouvrables · info@aureus-ia.com
          </div>
        </div>
      )}
    </div>
  );
}
