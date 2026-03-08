'use client';
import { useLang } from '../lib/lang-context';
import { useState } from 'react';
import { PERMISSIONS, ROLES, KPI_SCOPE, hasPermission, getPermissionsForRole } from '@/app/lib/permissions';

const ROLE_LABELS = { admin:'Administrateur', comptable:'Comptable', rh:'Ressources Humaines', commercial:'Commercial', readonly:'Lecture seule' };
const ROLE_COLORS = { admin:'#c6a34e', comptable:'#60a5fa', rh:'#22c55e', commercial:'#a78bfa', readonly:'#5e5c56' };
const PERM_LABELS = {
  voir_fiches_paie:'Voir fiches de paie', calculer_paie:'Calculer la paie',
  exporter_comptabilite:'Exporter comptabilité', soumettre_dimona:'Soumettre Dimona',
  modifier_travailleurs:'Modifier travailleurs', voir_travailleurs:'Voir travailleurs',
  gerer_contrats:'Gérer contrats', voir_clients_entreprises:'Voir clients/entreprises',
  gerer_facturation:'Gérer facturation', acces_audit_trail:'Accès audit trail',
  gerer_utilisateurs:'Gérer utilisateurs', configuration_app:'Configuration app',
  exporter_donnees:'Exporter ses données', voir_dashboard_kpis:'Voir dashboard KPIs',
};

function PH({title,sub}){return <div style={{marginBottom:16}}><div style={{fontSize:18,fontWeight:800,color:'#c6a34e'}}>{title}</div>{sub&&<div style={{fontSize:11,color:'#9e9b93',marginTop:2}}>{sub}</div>}</div>;}
function C({children,style}){return <div style={{padding:'16px 20px',background:'rgba(198,163,78,.03)',borderRadius:12,border:'1px solid rgba(198,163,78,.06)',marginBottom:14,...style}}>{children}</div>;}
function ST({children}){return <div style={{fontSize:13,fontWeight:700,color:'#c6a34e',marginBottom:10,paddingBottom:6,borderBottom:'1px solid rgba(198,163,78,.1)'}}>{children}</div>;}

export default function RolesPermissions({ s }) {
  const { t, lang } = useLang();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [tab, setTab] = useState('matrice');

  const perms = Object.entries(PERMISSIONS);

  return (
    <div>
      <PH title="Matrice Permissions par Rôle" sub="Contrôle d'accès — 5 rôles, 14 permissions, implémenté côté serveur + client" />

      <div style={{display:'flex',gap:4,marginBottom:16,flexWrap:'wrap'}}>
        {['matrice','detail','kpis'].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{padding:'7px 14px',borderRadius:8,border:'none',cursor:'pointer',fontSize:11,fontWeight:tab===t?700:400,fontFamily:'inherit',background:tab===t?'rgba(198,163,78,.15)':'rgba(255,255,255,.03)',color:tab===t?'#c6a34e':'#9e9b93'}}>
            {t==='matrice'?'📊 Matrice complète':t==='detail'?'👤 Détail par rôle':'📈 Périmètre KPIs'}
          </button>
        ))}
      </div>

      {tab==='matrice' && (
        <C>
          <ST>Matrice complète — 5 rôles × 14 permissions</ST>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
              <thead>
                <tr>
                  <th style={{padding:'8px 12px',textAlign:'left',color:'#c6a34e',borderBottom:'2px solid rgba(198,163,78,.2)',fontSize:10,fontWeight:700,minWidth:180}}>Permission</th>
                  {ROLES.map(r => (
                    <th key={r} style={{padding:'8px 12px',textAlign:'center',color:ROLE_COLORS[r],borderBottom:'2px solid rgba(198,163,78,.2)',fontSize:10,fontWeight:700,minWidth:100}}>
                      {ROLE_LABELS[r].split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {perms.map(([perm, roleMap], i) => (
                  <tr key={perm} style={{background:i%2===0?'transparent':'rgba(255,255,255,.01)'}}>
                    <td style={{padding:'7px 12px',color:'#e8e6e0',borderBottom:'1px solid rgba(255,255,255,.03)',fontSize:11}}>{PERM_LABELS[perm]||perm}</td>
                    {ROLES.map(r => (
                      <td key={r} style={{padding:'7px 12px',textAlign:'center',borderBottom:'1px solid rgba(255,255,255,.03)'}}>
                        {roleMap[r]
                          ? <span style={{color:'#22c55e',fontSize:16}}>✓</span>
                          : <span style={{color:'#3f3f46',fontSize:16}}>✗</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{marginTop:12,padding:10,background:'rgba(96,165,250,.06)',borderRadius:8,fontSize:10,color:'#60a5fa',lineHeight:1.6}}>
            ℹ️ Accès limité au périmètre : Comptable = données financières uniquement · RH = données RH uniquement · Commercial = données commerciales uniquement
          </div>
        </C>
      )}

      {tab==='detail' && (
        <C>
          <ST>Détail par rôle</ST>
          <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
            {ROLES.map(r => (
              <button key={r} onClick={()=>setSelectedRole(r)} style={{padding:'6px 14px',borderRadius:8,border:`1px solid ${selectedRole===r?ROLE_COLORS[r]:'rgba(255,255,255,.08)'}`,cursor:'pointer',fontSize:11,fontWeight:selectedRole===r?700:400,fontFamily:'inherit',background:selectedRole===r?`${ROLE_COLORS[r]}15`:'rgba(255,255,255,.02)',color:selectedRole===r?ROLE_COLORS[r]:'#9e9b93'}}>
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>

          <div style={{padding:14,background:`${ROLE_COLORS[selectedRole]}08`,borderRadius:10,border:`1px solid ${ROLE_COLORS[selectedRole]}20`,marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:700,color:ROLE_COLORS[selectedRole],marginBottom:4}}>{ROLE_LABELS[selectedRole]}</div>
            <div style={{fontSize:11,color:'#9e9b93'}}>{getPermissionsForRole(selectedRole).length} permissions actives sur {perms.length}</div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
            {perms.map(([perm, roleMap]) => (
              <div key={perm} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',borderRadius:6,background:roleMap[selectedRole]?'rgba(34,197,94,.04)':'rgba(239,68,68,.04)',border:`1px solid ${roleMap[selectedRole]?'rgba(34,197,94,.1)':'rgba(239,68,68,.08)'}`}}>
                <span style={{color:roleMap[selectedRole]?'#22c55e':'#5e5c56',fontSize:14}}>{roleMap[selectedRole]?'✓':'✗'}</span>
                <span style={{fontSize:10,color:roleMap[selectedRole]?'#e8e6e0':'#5e5c56'}}>{PERM_LABELS[perm]||perm}</span>
              </div>
            ))}
          </div>
        </C>
      )}

      {tab==='kpis' && (
        <C>
          <ST>Périmètre KPIs par rôle</ST>
          {ROLES.map(r => (
            <div key={r} style={{padding:'12px',marginBottom:8,background:'rgba(255,255,255,.02)',borderRadius:8,border:'1px solid rgba(255,255,255,.04)'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{fontSize:11,fontWeight:700,color:ROLE_COLORS[r]}}>{ROLE_LABELS[r]}</span>
                <span style={{fontSize:9,padding:'2px 8px',borderRadius:10,background:`${ROLE_COLORS[r]}15`,color:ROLE_COLORS[r]}}>{KPI_SCOPE[r][0]==='all'?'Accès total':KPI_SCOPE[r].length+' KPIs'}</span>
              </div>
              <div style={{fontSize:10,color:'#9e9b93'}}>
                {KPI_SCOPE[r][0]==='all' ? 'Tous les KPIs — vue globale plateforme' : KPI_SCOPE[r].join(' · ')}
              </div>
            </div>
          ))}
        </C>
      )}
    </div>
  );
}
