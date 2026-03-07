'use client';
import { useState } from 'react';
import { C, B, ST, PH } from '@/app/lib/helpers';

const GOLD='#c6a34e', GREEN='#22c55e', RED='#ef4444', BLUE='#3b82f6', ORANGE='#f97316';

const INITIAL_ROLES = [
  { id:'super_admin', label:'Super Admin', icon:'👑', color:GOLD,
    desc:'Accès total — gestion complète de la plateforme',
    users:['info@aureus-ia.com'],
    perms:{dashboard:1,employees:1,payroll:1,dimona:1,declarations:1,exports:1,documents:1,admin:1,billing:1,roles:1,audit:1,api:1}},
  { id:'admin', label:'Administrateur', icon:'🛡', color:BLUE,
    desc:'Gestion RH & paie — accès complet sauf facturation et rôles',
    users:['salem@aureus-ia.com'],
    perms:{dashboard:1,employees:1,payroll:1,dimona:1,declarations:1,exports:1,documents:1,admin:0,billing:0,roles:0,audit:1,api:0}},
  { id:'comptable', label:'Comptable', icon:'📊', color:GREEN,
    desc:'Lecture paie + exports comptables — pas de modification RH',
    users:[],
    perms:{dashboard:1,employees:0,payroll:0,dimona:0,declarations:1,exports:1,documents:0,admin:0,billing:1,roles:0,audit:0,api:0}},
  { id:'rh', label:'Responsable RH', icon:'👥', color:'#a855f7',
    desc:'Gestion employés et contrats — pas accès paie brute',
    users:[],
    perms:{dashboard:1,employees:1,payroll:0,dimona:1,declarations:0,exports:0,documents:1,admin:0,billing:0,roles:0,audit:0,api:0}},
  { id:'readonly', label:'Lecture seule', icon:'👁', color:'#5e5c56',
    desc:'Consultation uniquement — aucune modification possible',
    users:[],
    perms:{dashboard:1,employees:0,payroll:0,dimona:0,declarations:0,exports:0,documents:0,admin:0,billing:0,roles:0,audit:0,api:0}},
];

const PERMISSIONS = [
  {id:'dashboard',    label:'Tableau de bord',    icon:'📊', cat:'Consultation'},
  {id:'employees',    label:'Gestion employés',   icon:'👥', cat:'RH'},
  {id:'payroll',      label:'Calcul paie',         icon:'💰', cat:'Paie'},
  {id:'dimona',       label:'Dimona / ONSS',       icon:'📤', cat:'Déclarations'},
  {id:'declarations', label:'Déclarations ONSS',   icon:'📋', cat:'Déclarations'},
  {id:'exports',      label:'Exports comptables',  icon:'📥', cat:'Comptabilité'},
  {id:'documents',    label:'Documents RH',        icon:'📄', cat:'Documents'},
  {id:'billing',      label:'Facturation',         icon:'💶', cat:'Commercial'},
  {id:'admin',        label:'Administration',      icon:'⚙️', cat:'Admin'},
  {id:'roles',        label:'Rôles & Permissions', icon:'🔐', cat:'Admin'},
  {id:'audit',        label:'Audit Trail',         icon:'🔍', cat:'Admin'},
  {id:'api',          label:'Accès API',            icon:'🔌', cat:'Technique'},
];

const CATS = [...new Set(PERMISSIONS.map(p => p.cat))];

function Toggle({on, onClick}) {
  return (
    <div onClick={onClick} style={{width:40,height:22,borderRadius:11,cursor:'pointer',position:'relative',
      background:on ? GREEN+'33' : 'rgba(255,255,255,.06)',
      border:'1px solid '+(on ? GREEN : 'rgba(255,255,255,.1)'),transition:'all .2s'}}>
      <div style={{position:'absolute',top:3,left:on?20:3,width:14,height:14,borderRadius:'50%',
        background:on ? GREEN : '#5e5c56',transition:'left .2s'}}/>
    </div>
  );
}

function RolesTab({roles, setRoles}) {
  const [selected, setSelected] = useState(null);
  const role = roles.find(r => r.id === selected);

  const togglePerm = (roleId, permId) => {
    setRoles(prev => prev.map(r =>
      r.id === roleId ? {...r, perms:{...r.perms, [permId]: r.perms[permId] ? 0 : 1}} : r
    ));
  };

  return (
    <div style={{display:'grid', gridTemplateColumns:'280px 1fr', gap:16}}>
      <div>
        {roles.map(r => (
          <div key={r.id} onClick={() => setSelected(r.id === selected ? null : r.id)}
            style={{padding:'14px 16px',marginBottom:8,borderRadius:10,cursor:'pointer',
              background: selected===r.id ? 'rgba(198,163,78,.08)' : 'rgba(255,255,255,.02)',
              border:'1px solid '+(selected===r.id ? GOLD : 'rgba(198,163,78,.08)'),transition:'all .15s'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
              <span style={{fontSize:18}}>{r.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:selected===r.id ? GOLD : '#e8e6e0'}}>{r.label}</div>
                <div style={{fontSize:9,color:'#5e5c56',marginTop:1}}>
                  {r.users.length} utilisateur{r.users.length !== 1 ? 's' : ''}
                </div>
              </div>
              <span style={{padding:'2px 8px',borderRadius:5,fontSize:9,fontWeight:700,
                background:r.color+'22',color:r.color}}>
                {Object.values(r.perms).filter(Boolean).length}/{PERMISSIONS.length}
              </span>
            </div>
            <div style={{fontSize:10,color:'#9e9b93'}}>{r.desc}</div>
          </div>
        ))}
      </div>

      {role ? (
        <div>
          <C>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:role.users.length?12:0}}>
              <span style={{fontSize:28}}>{role.icon}</span>
              <div>
                <div style={{fontSize:16,fontWeight:800,color:role.color}}>{role.label}</div>
                <div style={{fontSize:10,color:'#9e9b93'}}>{role.desc}</div>
              </div>
            </div>
            {role.users.length > 0 && (
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {role.users.map((u,i) => (
                  <span key={i} style={{padding:'4px 10px',borderRadius:20,fontSize:10,
                    background:'rgba(198,163,78,.08)',color:GOLD,border:'1px solid rgba(198,163,78,.15)'}}>{u}</span>
                ))}
              </div>
            )}
          </C>
          {CATS.map(cat => {
            const catPerms = PERMISSIONS.filter(p => p.cat === cat);
            return (
              <C key={cat}>
                <ST>{cat}</ST>
                {catPerms.map(p => (
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,
                    padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
                    <span style={{fontSize:14}}>{p.icon}</span>
                    <div style={{flex:1,fontSize:12,color:'#e8e6e0'}}>{p.label}</div>
                    <Toggle on={role.perms[p.id]} onClick={() => togglePerm(role.id, p.id)}/>
                  </div>
                ))}
              </C>
            );
          })}
        </div>
      ) : (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',
          background:'rgba(198,163,78,.02)',borderRadius:12,border:'1px solid rgba(198,163,78,.06)',minHeight:200}}>
          <div style={{textAlign:'center',color:'#5e5c56'}}>
            <div style={{fontSize:32,marginBottom:8}}>🔐</div>
            <div style={{fontSize:12}}>Sélectionnez un rôle pour gérer ses permissions</div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTab({roles, setRoles}) {
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('readonly');
  const [adding, setAdding] = useState(false);

  const allUsers = roles.flatMap(r => r.users.map(u => ({email:u, role:r})));

  const addUser = () => {
    if (!newEmail.includes('@')) return;
    setRoles(prev => prev.map(r =>
      r.id === newRole ? {...r, users:[...r.users, newEmail]} : r
    ));
    setNewEmail('');
    setAdding(false);
  };

  const removeUser = (email, roleId) => {
    setRoles(prev => prev.map(r =>
      r.id === roleId ? {...r, users:r.users.filter(u => u !== email)} : r
    ));
  };

  const changeRole = (email, oldRoleId, newRoleId) => {
    setRoles(prev => prev.map(r => {
      if (r.id === oldRoleId) return {...r, users:r.users.filter(u => u !== email)};
      if (r.id === newRoleId) return {...r, users:[...r.users, email]};
      return r;
    }));
  };

  return (
    <div>
      <C>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:adding?16:0}}>
          <ST style={{margin:0}}>Utilisateurs ({allUsers.length})</ST>
          <button onClick={() => setAdding(!adding)}
            style={{padding:'6px 14px',borderRadius:8,border:'1px solid rgba(198,163,78,.3)',
              background:'transparent',color:GOLD,fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>
            {adding ? '✕ Annuler' : '+ Inviter'}
          </button>
        </div>
        {adding && (
          <div style={{display:'flex',gap:10,alignItems:'center',paddingTop:12,
            borderTop:'1px solid rgba(198,163,78,.1)'}}>
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)}
              placeholder="email@exemple.com"
              style={{flex:1,padding:'8px 12px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',
                background:'rgba(0,0,0,.2)',color:'#e8e6e0',fontSize:12,fontFamily:'inherit'}}/>
            <select value={newRole} onChange={e => setNewRole(e.target.value)}
              style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',
                background:'rgba(0,0,0,.9)',color:'#e8e6e0',fontSize:12,fontFamily:'inherit'}}>
              {roles.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
            </select>
            <button onClick={addUser}
              style={{padding:'8px 16px',borderRadius:8,border:'none',
                background:'linear-gradient(135deg,#c6a34e,#a68a3c)',
                color:'#0c0b09',fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
              Inviter
            </button>
          </div>
        )}
      </C>
      <C>
        {allUsers.length === 0 ? (
          <div style={{textAlign:'center',padding:30,color:'#5e5c56'}}>Aucun utilisateur configuré</div>
        ) : allUsers.map((u,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:12,
            padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
            <div style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',
              justifyContent:'center',background:u.role.color+'22',fontSize:16}}>{u.role.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:'#e8e6e0'}}>{u.email}</div>
              <div style={{fontSize:9,color:'#5e5c56',marginTop:1}}>Dernière connexion: il y a 2h</div>
            </div>
            <select value={u.role.id} onChange={e => changeRole(u.email, u.role.id, e.target.value)}
              style={{padding:'5px 10px',borderRadius:6,border:'1px solid '+u.role.color+'44',
                background:'rgba(0,0,0,.3)',color:u.role.color,fontSize:10,fontFamily:'inherit',cursor:'pointer'}}>
              {roles.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
            </select>
            <button onClick={() => removeUser(u.email, u.role.id)}
              style={{padding:'4px 10px',borderRadius:6,border:'1px solid rgba(239,68,68,.2)',
                background:'rgba(239,68,68,.05)',color:RED,fontSize:10,cursor:'pointer',fontFamily:'inherit'}}>
              Retirer
            </button>
          </div>
        ))}
      </C>
    </div>
  );
}

function MatriceTab({roles}) {
  return (
    <C>
      <ST>Matrice des permissions</ST>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
          <thead>
            <tr>
              <th style={{padding:'8px 12px',textAlign:'left',color:'#5e5c56',fontWeight:600,minWidth:160}}>Permission</th>
              {roles.map(r => (
                <th key={r.id} style={{padding:'8px',textAlign:'center',color:r.color,fontWeight:700,minWidth:80}}>
                  <div>{r.icon}</div>
                  <div style={{fontSize:9,marginTop:2}}>{r.label}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATS.map(cat => (
              <>
                <tr key={'cat-'+cat}>
                  <td colSpan={roles.length+1} style={{padding:'10px 12px 4px',fontSize:9,
                    color:GOLD,fontWeight:700,textTransform:'uppercase',letterSpacing:'.5px',
                    borderTop:'1px solid rgba(198,163,78,.1)'}}>{cat}</td>
                </tr>
                {PERMISSIONS.filter(p => p.cat===cat).map(p => (
                  <tr key={p.id} style={{borderBottom:'1px solid rgba(255,255,255,.03)'}}>
                    <td style={{padding:'7px 12px',color:'#9e9b93'}}>
                      <span style={{marginRight:8}}>{p.icon}</span>{p.label}
                    </td>
                    {roles.map(r => (
                      <td key={r.id} style={{padding:'7px',textAlign:'center'}}>
                        {r.perms[p.id]
                          ? <span style={{color:GREEN,fontSize:14}}>✓</span>
                          : <span style={{color:'rgba(255,255,255,.1)',fontSize:14}}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </C>
  );
}

export default function RolesPermissions({s, d, tab}) {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [activeTab, setActiveTab] = useState('roles');
  const totalPerms = PERMISSIONS.length;

  const tabs = [
    {id:'roles',   label:'🔐 Rôles',        sub:'5 rôles définis'},
    {id:'users',   label:'👥 Utilisateurs',  sub:roles.flatMap(r=>r.users).length+' actifs'},
    {id:'matrice', label:'📊 Matrice',       sub:'Vue globale'},
  ];

  return (
    <div>
      <PH title="Rôles & Permissions" sub="Contrôle d'accès granulaire — Aureus Social Pro"/>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[
          {l:'Rôles définis',      v:roles.length,                                         c:GOLD},
          {l:'Utilisateurs',       v:roles.flatMap(r=>r.users).length,                     c:BLUE},
          {l:'Permissions totales',v:totalPerms,                                            c:GREEN},
          {l:'Multi-tenant RLS',   v:'⚠️ À config',                                        c:ORANGE},
        ].map((k,i) => (
          <div key={i} style={{padding:'14px 16px',background:'rgba(198,163,78,.03)',
            borderRadius:10,border:'1px solid rgba(198,163,78,.08)'}}>
            <div style={{fontSize:9,color:'#5e5c56',textTransform:'uppercase',marginBottom:6}}>{k.l}</div>
            <div style={{fontSize:20,fontWeight:800,color:k.c}}>{k.v}</div>
          </div>
        ))}
      </div>

      <C>
        <ST>Couverture par rôle</ST>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
          {roles.map((r,i) => {
            const count = Object.values(r.perms).filter(Boolean).length;
            const pct = Math.round(count/totalPerms*100);
            return (
              <div key={i} style={{textAlign:'center',padding:'10px 8px',
                background:'rgba(255,255,255,.02)',borderRadius:8}}>
                <div style={{fontSize:18,marginBottom:4}}>{r.icon}</div>
                <div style={{fontSize:10,fontWeight:700,color:r.color,marginBottom:6}}>{r.label}</div>
                <div style={{height:4,background:'rgba(255,255,255,.06)',borderRadius:2,marginBottom:4}}>
                  <div style={{height:'100%',width:pct+'%',background:r.color,borderRadius:2}}/>
                </div>
                <div style={{fontSize:9,color:'#5e5c56'}}>{count}/{totalPerms} ({pct}%)</div>
              </div>
            );
          })}
        </div>
      </C>

      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{padding:'8px 16px',borderRadius:10,
              border:'1px solid '+(activeTab===t.id ? GOLD : 'rgba(198,163,78,.12)'),
              background: activeTab===t.id ? 'rgba(198,163,78,.08)' : 'transparent',
              color: activeTab===t.id ? GOLD : '#9e9b93',
              fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:activeTab===t.id?700:400,
              textAlign:'left'}}>
            <div>{t.label}</div>
            <div style={{fontSize:8,color:activeTab===t.id?GOLD+'99':'#5e5c56',marginTop:1}}>{t.sub}</div>
          </button>
        ))}
      </div>

      {activeTab==='roles'   && <RolesTab   roles={roles} setRoles={setRoles}/>}
      {activeTab==='users'   && <UsersTab   roles={roles} setRoles={setRoles}/>}
      {activeTab==='matrice' && <MatriceTab roles={roles}/>}

      <div style={{marginTop:20,padding:'12px 16px',background:'rgba(249,115,22,.04)',
        borderRadius:10,border:'1px solid rgba(249,115,22,.2)'}}>
        <span style={{fontSize:11,color:ORANGE}}>
          ⚠️ <strong>Important :</strong> Ces rôles sont gérés en état local frontend.
          Pour une isolation multi-tenant réelle, configurer les politiques RLS Supabase
          sur la table <code style={{background:'rgba(255,255,255,.05)',padding:'1px 5px',borderRadius:3}}>user_roles</code> avant le premier client en production.
        </span>
      </div>
    </div>
  );
}
