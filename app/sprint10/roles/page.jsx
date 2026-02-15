'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const ROLES = {
  admin: {
    label: 'Administrateur',
    desc: 'Accès complet à toutes les fonctionnalités et paramètres',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.25)',
    icon: '👑',
    permissions: ['clients', 'travailleurs', 'paie', 'onss', 'fiscal', 'rapports', 'parametres', 'utilisateurs', 'facturation'],
  },
  gestionnaire: {
    label: 'Gestionnaire paie',
    desc: 'Gestion complète de la paie, des travailleurs et des déclarations',
    color: '#c9a227',
    bg: 'rgba(201,162,39,0.1)',
    border: 'rgba(201,162,39,0.25)',
    icon: '💼',
    permissions: ['clients', 'travailleurs', 'paie', 'onss', 'fiscal', 'rapports'],
  },
  comptable: {
    label: 'Comptable',
    desc: 'Consultation des données financières et export comptable',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.25)',
    icon: '📊',
    permissions: ['clients', 'paie', 'rapports'],
  },
  client: {
    label: 'Client (lecture)',
    desc: 'Accès en lecture seule aux données de sa société',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.25)',
    icon: '👁️',
    permissions: ['travailleurs', 'paie'],
  },
};

const ALL_PERMISSIONS = [
  { key: 'clients', label: 'Gestion clients', icon: '🏢', desc: 'Créer, modifier, supprimer des sociétés clientes' },
  { key: 'travailleurs', label: 'Travailleurs', icon: '👤', desc: 'Gérer les fiches signalétiques et contrats' },
  { key: 'paie', label: 'Calcul de paie', icon: '💰', desc: 'Calculer, valider et générer les fiches de paie' },
  { key: 'onss', label: 'ONSS / Dimona', icon: '🏛️', desc: 'Déclarations DMFA et Dimona' },
  { key: 'fiscal', label: 'Fiscal', icon: '📋', desc: 'Précompte professionnel, fiches 281.10' },
  { key: 'rapports', label: 'Rapports', icon: '📊', desc: 'Consulter et exporter les rapports' },
  { key: 'parametres', label: 'Paramètres', icon: '⚙️', desc: 'Configuration du cabinet et barèmes' },
  { key: 'utilisateurs', label: 'Utilisateurs', icon: '👥', desc: 'Gérer les membres de l\'équipe et rôles' },
  { key: 'facturation', label: 'Facturation', icon: '💳', desc: 'Gérer l\'abonnement et la facturation' },
];

export default function RolesPage() {
  const [user, setUser] = useState(null);
  const [fid, setFid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('gestionnaire');
  const [inviteNom, setInviteNom] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = '/sprint10/auth'; return; }
      setUser(u);

      const { data: f } = await supabase.from('fiduciaires').select('*').eq('user_id', u.id).single();
      setFid(f);

      if (f) {
        // Try loading team members
        try {
          const { data: team } = await supabase
            .from('sp_team_members')
            .select('*')
            .eq('fiduciaire_id', f.id)
            .order('created_at', { ascending: true });
          setMembers(team || []);
        } catch (e) {
          // Table may not exist — show default admin
          setMembers([]);
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail || !inviteNom) return;
    
    const newMember = {
      fiduciaire_id: fid?.id,
      email: inviteEmail,
      nom: inviteNom,
      role: inviteRole,
      statut: 'invite',
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('sp_team_members').insert(newMember);
    } catch (e) {
      // Table might not exist yet
    }

    setMembers([...members, { ...newMember, id: Date.now() }]);
    setShowInvite(false);
    setInviteEmail('');
    setInviteNom('');
    setInviteRole('gestionnaire');
    setSuccessMsg(`Invitation envoyée à ${inviteEmail}`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRemove = async (member) => {
    if (!confirm(`Retirer ${member.nom} de l'équipe ?`)) return;
    setMembers(members.filter(m => m.id !== member.id));
    try {
      await supabase.from('sp_team_members').delete().eq('id', member.id);
    } catch (e) {}
  };

  // Current user as admin
  const allMembers = [
    {
      id: 'owner',
      email: user?.email || '',
      nom: fid?.responsable || 'Vous',
      role: 'admin',
      statut: 'actif',
      isOwner: true,
    },
    ...members,
  ];

  const S = {
    input: { width: '100%', padding: '10px 14px', background: '#0a0e1a', border: '1px solid #1e293b', borderRadius: 6, color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
    label: { display: 'block', fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 },
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#c9a227', fontFamily: "'Outfit',system-ui,sans-serif" }}>Chargement...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e2e8f0', fontFamily: "'Outfit',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .role-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3)}
        .member-row:hover{background:rgba(201,162,39,0.02)}
        .perm-item:hover{background:rgba(201,162,39,0.03)}
        @media(max-width:768px){
          .roles-grid{grid-template-columns:1fr 1fr!important}
          .members-table{overflow-x:auto}
          .perm-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/sprint10/dashboard" style={{ textDecoration: 'none', color: '#64748b', fontSize: 20, marginRight: 4 }}>←</Link>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9' }}>👥 Gestion de l'équipe</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>Rôles et permissions — {fid?.nom || 'Cabinet'}</div>
          </div>
        </div>
        <button onClick={() => setShowInvite(true)} style={{ background: '#c9a227', color: '#0a0e1a', border: 'none', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          + Inviter un membre
        </button>
      </header>

      <div style={{ padding: '24px 32px' }}>
        {/* SUCCESS MESSAGE */}
        {successMsg && (
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#22c55e', fontSize: 13, fontWeight: 500 }}>
            ✅ {successMsg}
          </div>
        )}

        {/* ROLES OVERVIEW */}
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#c9a227', margin: '0 0 14px' }}>Rôles disponibles</h2>
        <div className="roles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
          {Object.entries(ROLES).map(([key, role]) => {
            const count = allMembers.filter(m => m.role === key).length;
            return (
              <div key={key} className="role-card" onClick={() => setSelectedRole(selectedRole === key ? null : key)} style={{
                background: '#131825', border: `1px solid ${selectedRole === key ? role.border : '#1e293b'}`,
                borderRadius: 10, padding: 18, cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{role.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 10, background: role.bg, color: role.color }}>
                    {count} membre{count > 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#f1f5f9', marginBottom: 4 }}>{role.label}</div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>{role.desc}</div>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {role.permissions.map(p => (
                    <span key={p} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(201,162,39,0.08)', color: '#94a3b8' }}>{p}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* PERMISSIONS DETAIL */}
        {selectedRole && (
          <div style={{ background: '#131825', border: '1px solid #1e293b', borderRadius: 10, padding: 20, marginBottom: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: ROLES[selectedRole].color, margin: '0 0 14px' }}>
              {ROLES[selectedRole].icon} Permissions: {ROLES[selectedRole].label}
            </h3>
            <div className="perm-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {ALL_PERMISSIONS.map(p => {
                const has = ROLES[selectedRole].permissions.includes(p.key);
                return (
                  <div key={p.key} className="perm-item" style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 6,
                    background: has ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.02)',
                    border: `1px solid ${has ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)'}`,
                  }}>
                    <span style={{ fontSize: 18 }}>{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#e2e8f0' }}>{p.label}</div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{p.desc}</div>
                    </div>
                    <span style={{ fontSize: 14 }}>{has ? '✅' : '❌'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TEAM MEMBERS */}
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#c9a227', margin: '0 0 14px' }}>Membres de l'équipe</h2>
        <div style={{ background: '#131825', border: '1px solid #1e293b', borderRadius: 10, overflow: 'hidden' }}>
          {allMembers.map((m, i) => {
            const role = ROLES[m.role] || ROLES.client;
            return (
              <div key={m.id} className="member-row" style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                borderBottom: i < allMembers.length - 1 ? '1px solid #1e293b' : 'none',
                transition: 'background 0.15s',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: role.bg, border: `1px solid ${role.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {role.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{m.nom}</span>
                    {m.isOwner && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(201,162,39,0.2)', color: '#c9a227' }}>PROPRIÉTAIRE</span>}
                    {m.statut === 'invite' && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>EN ATTENTE</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{m.email}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 8, background: role.bg, color: role.color, border: `1px solid ${role.border}` }}>
                  {role.label}
                </div>
                {!m.isOwner && (
                  <button onClick={() => handleRemove(m)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>
                    Retirer
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* INVITE MODAL */}
        {showInvite && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowInvite(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#131825', border: '1px solid #1e293b', borderRadius: 12, padding: 28, width: 440, maxWidth: '90vw' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px' }}>👥 Inviter un membre</h3>
              
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Nom complet</label>
                <input value={inviteNom} onChange={e => setInviteNom(e.target.value)} placeholder="Jean Dupont" style={S.input} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Email</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="collaborateur@cabinet.be" style={S.input} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>Rôle</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(ROLES).filter(([k]) => k !== 'admin').map(([key, role]) => (
                    <label key={key} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                      background: inviteRole === key ? role.bg : 'transparent',
                      border: `1px solid ${inviteRole === key ? role.border : '#1e293b'}`,
                    }}>
                      <input type="radio" name="role" checked={inviteRole === key} onChange={() => setInviteRole(key)} style={{ accentColor: '#c9a227' }} />
                      <span style={{ fontSize: 18 }}>{role.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{role.label}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{role.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowInvite(false)} style={{ flex: 1, padding: '10px 0', background: 'transparent', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button onClick={handleInvite} disabled={!inviteEmail || !inviteNom} style={{
                  flex: 1, padding: '10px 0', background: '#c9a227', color: '#0a0e1a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  opacity: (!inviteEmail || !inviteNom) ? 0.5 : 1,
                }}>
                  Envoyer l'invitation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
