'use client';
import React, { useState, useReducer, useMemo, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MENU, GROUPS, getGroupItems, SEARCH_SUBSECTIONS } from '../lib/menu-config';
import { I18N } from '../lib/i18n';
import { LangProvider, useLang } from '../lib/lang-context';
import { supabase } from '../lib/supabase';
import { initCryptoKey, encryptState, decryptState, getCryptoKey, decryptField } from '../lib/crypto';
import { setAuditUser, audit } from '../lib/audit';

const Loading = () => <div style={{padding:40,textAlign:'center',color:'#5e5c56'}}>Chargement...</div>;


// ErrorBoundary pour catch les crashes de modules
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidUpdate(prevProps) {
    // Reset automatique à chaque changement de page
    if (prevProps.pageKey !== this.props.pageKey) {
      this.setState({ hasError: false, error: null });
    }
  }
  componentDidCatch(error, info) {
    console.error('[Aureus] Module crash:', error?.message, info?.componentStack?.split('\n')[1]);
  }
  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message || 'Erreur inconnue';
      return <div style={{padding:32,textAlign:'center'}}>
        <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
        <div style={{fontSize:14,fontWeight:700,color:'#ef4444',marginBottom:8}}>{this.props.label || 'Module'} — Erreur de chargement</div>
        <div style={{fontSize:10,color:'#5e5c56',marginBottom:16,fontFamily:'monospace',background:'rgba(239,68,68,.04)',padding:'8px 12px',borderRadius:6,border:'1px solid rgba(239,68,68,.1)',wordBreak:'break-all',maxWidth:500,margin:'0 auto 16px'}}>{msg}</div>
        <button onClick={()=>this.setState({hasError:false,error:null})} style={{padding:'10px 24px',borderRadius:8,border:'1px solid rgba(198,163,78,.3)',background:'rgba(198,163,78,.08)',color:'#c6a34e',fontSize:12,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>🔄 Réessayer</button>
      </div>;
    }
    return this.props.children;
  }
}

// Pages migrées (import dynamique = code splitting)
const DashboardPage = dynamic(() => import('../pages/dashboard'), { ssr: false, loading: Loading });
const EmployeesPage = dynamic(() => import('../pages/employees'), { ssr: false, loading: Loading });
const PayslipsPage = dynamic(() => import('../pages/payslips'), { ssr: false, loading: Loading });
const DimonaPageComp = dynamic(() => import('../pages/dimona'), { ssr: false, loading: Loading });
const AdminPage = dynamic(() => import('../pages/admin'), { ssr: false, loading: Loading });
const RolesPermissionsPage = dynamic(() => import('../pages/RolesPermissions'), { ssr: false, loading: Loading });
const SettingsPageComp = dynamic(() => import('../pages/settings'), { ssr: false, loading: Loading });
const LoisPage = dynamic(() => import('../pages/lois'), { ssr: false, loading: Loading });
const BaremesCPPage = dynamic(() => import('../pages/BaremesCP'), { ssr: false, loading: Loading });
const SimuNetBrutPage = dynamic(() => import('../pages/SimulateurNetBrut'), { ssr: false, loading: Loading });
const DiagnosticPage = dynamic(() => import('../pages/DiagnosticCommercial'), { ssr: false, loading: Loading });
const SeuilsPage = dynamic(() => import('../pages/SeuilsSociaux'), { ssr: false, loading: Loading });
const OnboardingPage = dynamic(() => import('../pages/OnboardingHub'), { ssr: false, loading: Loading });
const CloturePage = dynamic(() => import('../pages/ClotureMensuelle'), { ssr: false, loading: Loading });
const AdminBaremesPageOld = dynamic(() => import('../pages/AdminBaremes'), { ssr: false, loading: Loading });
const SecurityPage = dynamic(() => import('../pages/SecurityDashboard'), { ssr: false, loading: Loading });
const AuditCodePage = dynamic(() => import('../pages/AuditSecuriteCode'), { ssr: false, loading: Loading });
const PayrollSimPage = dynamic(() => import('../pages/PayrollSimulator'), { ssr: false, loading: Loading });
const AureusIAPage = dynamic(() => import('../pages/AureusSuitePage'), { ssr: false, loading: Loading });
const EmployeeHubPage = dynamic(() => import('../pages/EmployeeHub'), { ssr: false, loading: Loading });
const SmartOpsPage = dynamic(() => import('../pages/SmartOpsCenter'), { ssr: false, loading: Loading });
const PrimesPage = dynamic(() => import('../pages/PrimesAvantagesV2'), { ssr: false, loading: Loading });

const AbsencesContratsV3Pg = dynamic(() => import('../pages/AbsencesContratsV3'), { ssr: false, loading: Loading });
const CommissionsModulePg = dynamic(() => import('../pages/CommissionsModule'), { ssr: false, loading: Loading });
const DocumentGeneratorPg = dynamic(() => import('../pages/DocumentGenerator'), { ssr: false, loading: Loading });
const EmployeePlanningPg = dynamic(() => import('../pages/EmployeePlanning'), { ssr: false, loading: Loading });
const NotificationCenterPg = dynamic(() => import('../pages/NotificationCenter'), { ssr: false, loading: Loading });
const PayrollGroupPg = dynamic(() => import('../pages/PayrollGroup'), { ssr: false, loading: Loading });
const PortalSystemPg = dynamic(() => import('../pages/PortalSystem'), { ssr: false, loading: Loading });
const TransversalCPPg = dynamic(() => import('../pages/TransversalCP'), { ssr: false, loading: Loading });
const ModsBatch2Pg = dynamic(() => import('../pages/ModsBatch2'), { ssr: false, loading: Loading });
const PayrollHubPg = dynamic(() => import('../pages/PayrollHub'), { ssr: false, loading: Loading });
const ProceduresRHHubPg = dynamic(() => import('../pages/procedures/ProceduresRHHub'), { ssr: false, loading: Loading });

// Wrappers pour modules avec props non-standard
const AnalyticsDashboardRaw = dynamic(() => import('../pages/AnalyticsDashboard'), { ssr: false, loading: Loading });
const PortailEmployePg = dynamic(() => import('../pages/PortailEmploye'), { ssr: false, loading: Loading });
const PortailClientPg = dynamic(() => import('../pages/PortailClient'), { ssr: false, loading: Loading });
const RegistrePersonnelPg = dynamic(() => import('../pages/RegistrePersonnel'), { ssr: false, loading: Loading });
const AnalyticsPage = ({ s, d, tab }) => <AnalyticsDashboardRaw s={s} d={d} tab={tab} />;

const ComplianceDashboardRaw = dynamic(() => import('../pages/ComplianceDashboard'), { ssr: false, loading: Loading });
const CompliancePage = ({ s, d, tab }) => <ComplianceDashboardRaw s={s} d={d} tab={tab} />;
const RGPDModuleRaw = dynamic(() => import('../pages/RGPDModule'), { ssr: false, loading: Loading });

const DocumentGeneratorRaw = dynamic(() => import('../pages/DocumentGenerator'), { ssr: false, loading: Loading });
const DocumentGeneratorPgW = ({ s, d, tab }) => <DocumentGeneratorRaw s={s} d={d} tab={tab} />;

const EmployeePlanningRaw = dynamic(() => import('../pages/EmployeePlanning'), { ssr: false, loading: Loading });
const EmployeePlanningPgW = ({ s, d, tab }) => <EmployeePlanningRaw s={s} d={d} tab={tab} />;

const NotificationCenterRaw = dynamic(() => import('../pages/NotificationCenter'), { ssr: false, loading: Loading });
const NotificationCenterPgW = ({ s, d, tab }) => <NotificationCenterRaw s={s} d={d} tab={tab} />;

const CommissionsModuleRaw = dynamic(() => import('../pages/CommissionsModule'), { ssr: false, loading: Loading });
const CommissionsModulePgW = ({ s, d, tab }) => <CommissionsModuleRaw s={s} d={d} tab={tab} />;

const AdminBaremesRaw = dynamic(() => import('../pages/AdminBaremes'), { ssr: false, loading: Loading });
const AdminBaremesPageW = ({ s, d }) => <AdminBaremesRaw loisBelges={{}} loisTimeline={[]} loisCurrent={{}} onUpdate={()=>{}} />;

const RelancesRaw = dynamic(() => import('../pages/RelancesFacturation'), { ssr: false, loading: Loading });
const RelancesPage = ({ s, d }) => <RelancesRaw supabase={null} user={s?.user} clients={s?.clients||[]} />;

const ProceduresRHHubRaw = dynamic(() => import('../pages/procedures/ProceduresRHHub'), { ssr: false, loading: Loading });
const MandatsAdminRaw = dynamic(() => import('../pages/MandatsAdminPage'), { ssr: false, loading: Loading });
const MandatsAdminPg = ({ s, d, tab }) => <MandatsAdminRaw s={s} d={d} tab={tab} />;
const ConnexionsHubRaw = dynamic(() => import('../pages/ConnexionsHub'), { ssr: false, loading: Loading });
const ConnexionsHubPg = ({ s, d }) => <ConnexionsHubRaw s={s} d={d} />;
const IntegrationsComptaRaw = dynamic(() => import('../pages/IntegrationsCompta'), { ssr: false, loading: Loading });
const VehiculeATNRaw = dynamic(() => import('../pages/VehiculeATN'), { ssr: false, loading: Loading });
const CalendrierSocialRaw = dynamic(() => import('../pages/CalendrierSocial'), { ssr: false, loading: Loading });
const SalaireMaladieRaw = dynamic(() => import('../pages/SalaireMaladie'), { ssr: false, loading: Loading });
const SimulateurPensionRaw = dynamic(() => import('../pages/SimulateurPension'), { ssr: false, loading: Loading });
const SoldeToutCompteRaw = dynamic(() => import('../pages/SoldeToutCompte'), { ssr: false, loading: Loading });
const FloatingLegalAgentRaw = dynamic(() => import('../pages/FloatingLegalAgent'), { ssr: false, loading: Loading });
const ChecklistClientRaw = dynamic(() => import('../pages/ChecklistClient'), { ssr: false, loading: Loading });
const BudgetPrevisionnelRaw = dynamic(() => import('../pages/BudgetPrevisionnel'), { ssr: false, loading: Loading });
const IntegrationsComptaPg = ({ s, d }) => <IntegrationsComptaRaw s={s} d={d} />;
const ProceduresRHHubPgW = ({ s, d }) => <ProceduresRHHubRaw />;

// Reducer pour le state global
function reducer(state, action) {
  // Audit trail serveur — actions sensibles tracées automatiquement
  if (typeof window !== 'undefined') {
    const auditMap = {
      ADD_EMP:        { label:'CREATE_EMPLOYEE',   table:'employees' },
      UPD_EMP:        { label:'UPDATE_EMPLOYEE',   table:'employees' },
      DEL_EMP:        { label:'DELETE_EMPLOYEE',   table:'employees' },
      ADD_P:          { label:'GENERATE_PAYSLIP',  table:'fiches_paie' },
      DEL_FICHE:      { label:'DELETE_PAYSLIP',    table:'fiches_paie' },
      DEL_P:          { label:'DELETE_PAYSLIP',    table:'fiches_paie' },
      DEL_PAYS_BATCH: { label:'DELETE_PAYSLIP_BATCH', table:'fiches_paie' },
      ADD_DIM:        { label:'SUBMIT_DIMONA',     table:'dimona' },
      ADD_CLIENT:     { label:'CREATE_CLIENT',     table:'clients' },
      UPD_CLIENT:     { label:'UPDATE_CLIENT',     table:'clients' },
      DEL_CLIENT:     { label:'DELETE_CLIENT',     table:'clients' },
      SET_COMPANY:    { label:'UPDATE_COMPANY',    table:'app_state' },
    };
    const auditEntry = auditMap[action.type];
    if (auditEntry) {
      const emp = action.d || action.client ||
        (action.type === 'DEL_EMP' ? state.emps?.find(e => e.id === action.id) :
         action.type === 'DEL_CLIENT' ? state.clients?.find(c => c.id === action.id) :
         action.type === 'DEL_FICHE' || action.type === 'DEL_P' ? state.pays?.find(p => p.id === action.id) : null);
      fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: auditEntry.label,
          table_name: auditEntry.table,
          record_id: emp?.id || action.id || null,
          details: {
            action_type: action.type,
            ...(emp ? { name: (emp.first_name||emp.prenom||emp.company_name||emp.fn||'') + ' ' + (emp.last_name||emp.nom||emp.ln||'') } : {}),
            ...(action.ids ? { count: action.ids?.length } : {}),
          }
        })
      }).catch(() => {});
    }
  }

  switch (action.type) {
    case 'NAV': return { ...state, _nav: action.page, _navSub: action.sub };
    case 'CLEAR_NAV': return { ...state, _nav: null, _navSub: null };
    case 'SET_CLIENTS': return { ...state, clients: action.data };
    case 'SET_EMPS': return { ...state, emps: action.data };
    case 'ADD_EMP': return { ...state, emps: [...(state.emps||[]), action.d] };
    case 'UPD_EMP': return { ...state, emps: (state.emps||[]).map(e => e.id === action.d.id ? { ...e, ...action.d } : e) };
    case 'DEL_EMP': return { ...state, emps: (state.emps||[]).filter(e => e.id !== action.id) };
    case 'ADD_P': {
      const p = { id: action.d.id || `fp-${Date.now()}-${Math.random().toString(36).substr(2,5)}`, ...action.d };
      return { ...state, pays: [...(state.pays||[]), p], payrollHistory: [...(state.payrollHistory||[]), p] };
    }
    case 'SET_PAYROLL': return { ...state, pays: action.data, payrollHistory: action.data };
    case 'DEL_FICHE': {
      const filtered = (state.pays||[]).filter(p => p.id !== action.id);
      return { ...state, pays: filtered, payrollHistory: filtered };
    }
    case 'ADD_DIM': return { ...state, dimonaHistory: [...(state.dimonaHistory||[]), action.d] };
    case 'SET_PAYS': return { ...state, pays: action.data||[], payrollHistory: action.data||[] };
    case 'DEL_P': { const f2=(state.pays||[]).filter(p=>p.id!==action.id); return {...state,pays:f2,payrollHistory:f2}; }
    case 'DEL_PAYS_BATCH': { const f3=(state.pays||[]).filter(p=>!action.ids.includes(p.id)); return {...state,pays:f3,payrollHistory:f3}; }
    case 'SET_COMPANY': return { ...state, co: { ...(state.co||{}), ...action.data } };
    case 'SELECT_CLIENT': return { ...state, activeClient: action.id };
    case 'ADD_CLIENT': return { ...state, clients: [...(state.clients||[]), action.client] };
    case 'UPD_CLIENT': return { ...state, clients: (state.clients||[]).map(c => c.id === action.client?.id ? { ...c, ...action.client } : c) };
    case 'DEL_CLIENT': return { ...state, clients: (state.clients||[]).filter(c => c.id !== action.id) };
    default: return state;
  }
}

// Placeholder pour les pages pas encore migrées
function PlaceholderPage({ id, label }) {
  return (
    <div style={{ padding: 40 }}>
      <div style={{ fontSize: 19, fontWeight: 800, color: '#c6a34e', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#5e5c56' }}>Module en cours de migration — disponible prochainement</div>
    </div>
  );
}

// Dashboard principal — version complète intégrée (sans dépendances externes)
function DashboardHome({ state, onNavigate }) {
  const s = state || {};
  const ae = (s.emps || []).filter(e => e.status === 'active' || !e.status);
  const sortie = (s.emps || []).filter(e => e.status === 'sorti');
  const etudiants = (s.emps || []).filter(e => e.contract === 'student');
  const masse = ae.reduce((a, e) => a + (+(e.monthlySalary || e.gross || 0)), 0);
  const avgGross = ae.length ? masse / ae.length : 0;
  const net = Math.round(masse * 0.6687);
  const cout = Math.round(masse * 1.2507);
  const now = new Date();
  const mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const fmtE = n => new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(n || 0);
  const f2 = n => (Math.round((n||0)*100)/100).toFixed(2);

  // Alertes dynamiques
  const alertes = [];
  ae.forEach(e => {
    const brut = +(e.monthlySalary || e.gross || 0);
    if (brut > 0 && brut < 2070.48) alertes.push({ level: 'danger', icon: '⚠', msg: `${e.first||''} ${e.last||''} — Salaire ${fmtE(brut)} sous RMMMG (${fmtE(2070.48)})` });
    if (!e.niss) alertes.push({ level: 'warning', icon: '◇', msg: `${e.first||''} ${e.last||''} — NISS manquant` });
    if (!e.iban) alertes.push({ level: 'warning', icon: '◇', msg: `${e.first||''} ${e.last||''} — IBAN manquant` });
  });
  const t1end = new Date(now.getFullYear(), 2, 31);
  const daysToT1 = Math.ceil((t1end - now) / 86400000);
  if (daysToT1 >= 0 && daysToT1 <= 30) alertes.push({ level: 'danger', icon: '⏰', msg: `DmfA T1/${now.getFullYear()} — Échéance dans ${daysToT1} jour(s) (31/03)` });

  // Échéances calendrier
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const echeances = [
    { label: `DmfA T${Math.ceil(m/3)}/${y}`, date: [new Date(y,2,31),new Date(y,5,30),new Date(y,8,30),new Date(y,11,31)][Math.ceil(m/3)-1], icon: '◆', color: '#f87171' },
    { label: `PP 274 — ${mois[m-1]} ${y}`, date: new Date(y,m-1,15), icon: '◇', color: '#fb923c' },
    { label: `ONSS provisions — ${mois[m-1]}`, date: new Date(y,m-1,5), icon: '◆', color: '#a78bfa' },
    { label: 'Dimona IN — avant embauche', date: null, icon: '⬆', color: '#4ade80' },
  ];

  const KPI = [
    { icon: '◉', label: 'Employés actifs', value: ae.length, sub: `${sortie.length} sorti · ${etudiants.length} étudiant`, color: '#c6a34e', page: 'employees' },
    { icon: '◈', label: 'Masse salariale brute', value: fmtE(masse), sub: `Moy: ${fmtE(avgGross)}/emp`, color: '#c6a34e', page: 'salaires' },
    { icon: '▤', label: 'Net total estimé', value: fmtE(net), sub: `${ae.length ? Math.round(net/masse*100) : 0}% du brut`, color: '#4ade80', page: 'payslip' },
    { icon: '◆', label: 'Coût employeur total', value: fmtE(cout), sub: `Ratio: ${ae.length ? Math.round(cout/masse*100) : 0}% du brut`, color: '#a78bfa', page: 'analytics' },
    { icon: '📄', label: 'Fiches de paie', value: (s.payrollHistory||[]).length, sub: `Ce mois: ${(s.payrollHistory||[]).filter(p=>{ const d=new Date(p.at||0); return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}).length}`, color: '#fb923c', page: 'payslip' },
    { icon: '⬆', label: 'Dimona', value: (s.dimonaHistory||[]).length, sub: `IN/OUT déclarés`, color: '#60a5fa', page: 'declarations' },
  ];

  const ACTIONS = [
    { icon: '◉', label: '+ Nouvel employé', id: 'employees', color: '#c6a34e' },
    { icon: '◈', label: 'Générer fiche de paie', id: 'payslip', color: '#4ade80' },
    { icon: '⬆', label: 'Dimona IN/OUT', id: 'declarations', color: '#60a5fa' },
    { icon: '◆', label: 'DmfA trimestrielle', id: 'declarations', color: '#a78bfa' },
    { icon: '📊', label: 'Analytics & Rapports', id: 'analytics', color: '#fb923c' },
    { icon: '🔗', label: 'Hub Connexions H24', id: 'connexionshub', color: '#c6a34e' },
    { icon: '📋', label: 'Barèmes CP', id: 'baremescp', color: '#fbbf24' },
    { icon: '⚡', label: 'Simulateur net/brut', id: 'calcinstant', color: '#4ade80' },
  ];

  return (
    <div style={{ padding: '0 2px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#c6a34e', letterSpacing: '.5px' }}>Tableau de bord</div>
          <div style={{ fontSize: 11, color: '#5e5c56', marginTop: 3 }}>{mois[now.getMonth()]} {now.getFullYear()} — Aureus IA SPRL · BCE BE 1028.230.781</div>
        </div>
        <div style={{ fontSize: 10, color: '#5e5c56', textAlign: 'right' }}>
          <div style={{ color: '#c6a34e', fontWeight: 600 }}>⚡ RMMMG: {fmtE(2070.48)}</div>
          <div>Index santé: 2,0399 · Pivot: 125,60</div>
        </div>
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(248,113,113,.2)', background: 'rgba(248,113,113,.04)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f87171', marginBottom: 8 }}>⚠ {alertes.length} alerte(s) — Action requise</div>
          {alertes.slice(0, 5).map((a, i) => (
            <div key={i} style={{ fontSize: 11, color: a.level === 'danger' ? '#f87171' : '#fb923c', padding: '3px 0' }}>{a.icon} {a.msg}</div>
          ))}
          {alertes.length > 5 && <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>+{alertes.length - 5} autres alertes</div>}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {KPI.map((k, i) => (
          <div key={i} onClick={() => onNavigate && onNavigate(k.page)}
            style={{ padding: '16px 18px', background: 'rgba(198,163,78,.03)', borderRadius: 12, border: '1px solid rgba(198,163,78,.06)', cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(198,163,78,.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(198,163,78,.03)'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 15 }}>{k.icon}</span>
              <span style={{ fontSize: 9.5, color: '#5e5c56', textTransform: 'uppercase', letterSpacing: '.5px' }}>{k.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 9.5, color: '#5e5c56', marginTop: 3 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Grille principale */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Échéances */}
        <div style={{ padding: '16px 18px', background: 'rgba(198,163,78,.03)', borderRadius: 12, border: '1px solid rgba(198,163,78,.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#c6a34e' }}>Échéances & Obligations</div>
            <button onClick={() => onNavigate && onNavigate('declarations')} style={{ fontSize: 10, color: '#c6a34e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Voir tout →</button>
          </div>
          {echeances.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.03)', fontSize: 11.5 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: e.color }}>{e.icon}</span>{e.label}
              </span>
              <span style={{ color: e.date ? (e.date < now ? '#f87171' : '#888') : '#4ade80', fontSize: 10.5, fontWeight: 600 }}>
                {e.date ? e.date.toLocaleDateString('fr-BE') : 'Permanent'}
              </span>
            </div>
          ))}
        </div>

        {/* Derniers employés */}
        <div style={{ padding: '16px 18px', background: 'rgba(198,163,78,.03)', borderRadius: 12, border: '1px solid rgba(198,163,78,.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#c6a34e' }}>Travailleurs ({ae.length})</div>
            <button onClick={() => onNavigate && onNavigate('employees')} style={{ fontSize: 10, color: '#c6a34e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Voir tout →</button>
          </div>
          {ae.length === 0 && <div style={{ fontSize: 11, color: '#5e5c56', fontStyle: 'italic' }}>Aucun travailleur encodé — <span style={{ color: '#c6a34e', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('employees')}>+ Ajouter</span></div>}
          {ae.slice(0, 5).map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.03)', fontSize: 11 }}>
              <span style={{ color: '#d4d0c8' }}>◉ {e.first||''} {e.last||''} <span style={{ color: '#5e5c56', fontSize: 9.5 }}>CP {e.cp||'200'}</span></span>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>{fmtE(+(e.monthlySalary||e.gross||0))}</span>
            </div>
          ))}
          {ae.length > 5 && <div style={{ fontSize: 10, color: '#888', marginTop: 6 }}>+{ae.length - 5} autres travailleurs</div>}
        </div>
      </div>

      {/* Actions rapides */}
      <div style={{ padding: '16px 18px', background: 'rgba(198,163,78,.03)', borderRadius: 12, border: '1px solid rgba(198,163,78,.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#c6a34e', marginBottom: 12 }}>⚡ Actions rapides</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {ACTIONS.map((a, i) => (
            <div key={i} onClick={() => onNavigate && onNavigate(a.id)}
              style={{ padding: '10px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(198,163,78,.02)', border: '1px solid rgba(198,163,78,.05)', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(198,163,78,.08)'; e.currentTarget.style.borderColor = 'rgba(198,163,78,.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(198,163,78,.02)'; e.currentTarget.style.borderColor = 'rgba(198,163,78,.05)'; }}>
              <span style={{ color: a.color }}>{a.icon}</span>
              <span style={{ color: '#d4d0c8' }}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardLayoutInner({ user }) {
  const [page, setPage] = useState('dashboard');
  const [pageHistory, setPageHistory] = useState([]);
  const [cryptoKey, setCryptoKey] = useState(null);
  const { lang, setLang, t: tCtx } = useLang();
  const [theme, setTheme] = useState(() => { try { return typeof window !== 'undefined' ? localStorage.getItem('aureus_theme') || 'dark' : 'dark'; } catch(e) { return 'dark'; } });

  // Traduction helper
  const t = tCtx;

  // Persister préférences
  useEffect(() => { try { if (typeof window !== 'undefined') localStorage.setItem('aureus_theme', theme); } catch(e) {} }, [theme]);

  // Couleurs selon thème
  const TH = {
    bg: theme === 'dark' ? '#0a0908' : '#f5f3ef',
    bg2: theme === 'dark' ? '#111009' : '#ede9e3',
    sidebar: theme === 'dark' ? '#0e0d0b' : '#faf8f4',
    border: theme === 'dark' ? 'rgba(198,163,78,.08)' : 'rgba(198,163,78,.2)',
    text: theme === 'dark' ? '#e8e6e0' : '#1a1916',
    text2: theme === 'dark' ? '#9e9b93' : '#6b6860',
    text3: theme === 'dark' ? '#5e5c56' : '#9a978f',
    surface: theme === 'dark' ? 'rgba(255,255,255,.03)' : 'rgba(0,0,0,.03)',
    header: theme === 'dark' ? 'rgba(0,0,0,.2)' : 'rgba(255,255,255,.8)',
  };
  const [collapsed, setCollapsed] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigateTo = (newPage) => {
    setPageHistory(h => newPage !== page ? [...h.slice(-19), page] : h);
    setPage(newPage);
  };
  const navigateBack = () => {
    if (pageHistory.length === 0) return;
    const prev = pageHistory[pageHistory.length - 1];
    setPageHistory(h => h.slice(0, -1));
    setPage(prev);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [scrollAnchor, setScrollAnchor] = useState(null);
  const [state, dispatch] = useReducer(reducer, {
    emps: [],
    clients: [],
    pays: [],
    payrollHistory: [],
    dimonaHistory: [],
    co: { name: 'Aureus IA SPRL', vat: 'BE 1028.230.781' }
  });

  const s = state;
  const d = dispatch;

  // Init chiffrement AES-256 au montage (RGPD Art. 32)
  useEffect(()=>{
    const userId = user?.id || user?.email || 'aureus-default-user';
    setAuditUser(user);
    audit.login(user?.email);
    initCryptoKey(userId).then(ok => {
      if(ok) setCryptoKey(true);
      else console.warn('[Crypto] Chiffrement non disponible');
    });

    // Backup automatique sécurisé AES-256 à chaque session (backup-secure.js v2.0)
    if (user) {
      setTimeout(() => {
        fetch('/api/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action:    'silent',
            userId:    user.id,
            userEmail: user.email,
            userRole:  user.user_metadata?.role || '',
          }),
        }).then(res => {
          if (res.ok) {
            const records   = res.headers.get('X-Backup-Records');
            const encrypted = res.headers.get('X-Backup-Encrypted');
            console.info(`[Backup] ${records} enregistrements — chiffré AES-256: ${encrypted}`);
          }
        }).catch(() => {}); // Silencieux — backup non bloquant
      }, 4000); // 4s après login pour ne pas bloquer le chargement initial
    }
  },[user]);

  // Charger les employés depuis Supabase au login
  useEffect(()=>{
    if (!user?.id || !supabase) return;
    supabase
      .from('employees')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(async ({ data, error }) => {
        if (!error && data) {
          // Déchiffrement RGPD Art.32 — NISS et IBAN
          const key = getCryptoKey();
          const decrypted = key ? await Promise.all(data.map(async emp => ({
            ...emp,
            niss: emp.niss ? await decryptField(emp.niss, key) : emp.niss,
            iban: emp.iban ? await decryptField(emp.iban, key) : emp.iban,
          }))) : data;
          dispatch({ type: 'SET_EMPS', data: decrypted });
          console.info(`[Supabase] ${data.length} employé(s) chargé(s)`);
        }
      });
  },[user?.id]);

    // Charger les fiches de paie depuis Supabase au login
  useEffect(()=>{
    if (!user?.id || !supabase) return;
    supabase
      .from('fiches_paie')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (!error && data) {
          // Normaliser les colonnes snake_case → camelCase pour le state
          const normalized = data.map(r => ({
            id: r.id,
            eid: r.eid,
            ename: r.ename,
            period: r.period,
            month: r.month,
            year: r.year,
            base: r.base,
            gross: r.gross,
            onssNet: r.onss_net,
            imposable: r.imposable,
            pp: r.pp,
            tax: r.pp,
            css: r.css,
            net: r.net,
            onssE: r.onss_e,
            costTotal: r.cost_total,
            bonus: r.bonus,
            overtime: r.overtime,
            y13: r.y13,
            sickPay: r.sick_pay,
            batch: r.batch,
            at: r.at,
          }));
          dispatch({ type: 'SET_PAYROLL', data: normalized });
          console.info(`[Supabase] ${data.length} fiche(s) de paie chargée(s)`);
        }
      });
  },[user?.id]);

  // Intercepte les dispatch NAV depuis les pages enfants
  useEffect(()=>{
    if(s._nav){
      setPage(s._nav);
      dispatch({type:'CLEAR_NAV'});
    }
  },[s._nav]);

  const toggleGroup = (gId) => setCollapsed(p => ({ ...p, [gId]: !p[gId] }));
  const currentItem = MENU.find(m => m.id === page) || { label: 'Dashboard' };

  const handleLogout = async () => {
    await audit.logout(user?.email);
    if (supabase) await supabase.auth.signOut();
    window.location.reload();
  };

  // Déconnexion automatique après 30min d'inactivité (Couche 4)
  useEffect(() => {
    if (!user) return;
    const TIMEOUT = 30 * 60 * 1000; // 30 minutes
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        await audit.custom('AUTO_LOGOUT_INACTIVITY', 'auth', null, { email: user?.email, reason: '30min inactivité' });
        if (supabase) await supabase.auth.signOut();
        window.location.reload();
      }, TIMEOUT);
    };

    // Réinitialiser le timer sur toute interaction utilisateur
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // Démarrer le timer initial

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [user]);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage s={s} d={d} t={t} lang={lang} onNavigate={setPage} />;
      case 'employees': return <EmployeesPage s={s} d={d} t={t} lang={lang} />;
      case 'payslip': return <PayslipsPage s={s} d={d} t={t} lang={lang} scrollAnchor={scrollAnchor} onAnchorHandled={()=>setScrollAnchor(null)} />;
      case 'declarations': case 'onss': return <DimonaPageComp s={s} d={d} t={t} lang={lang} />;
      case 'admin': return <AdminPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'backup': return <AdminPage s={s} d={d} t={t} lang={lang} tab='backup' />;
      case 'permissions': return <RolesPermissionsPage s={s} d={d} t={t} lang={lang} />;
      case 'baremescp': return <BaremesCPPage s={s} d={d} t={t} lang={lang} />;
      case 'calcinstant': return <SimuNetBrutPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'diagnostic': case 'diagnosticv': return <DiagnosticPage s={s} d={d} t={t} lang={lang} />;
      case 'seuilssociaux': return <SeuilsPage s={s} d={d} t={t} lang={lang} />;
      case 'onboarding': case 'onboardwizard': return <OnboardingPage s={s} d={d} t={t} lang={lang} />;
      case 'cloture': return <CloturePage s={s} d={d} t={t} lang={lang} />;
      case 'analytics': return <AnalyticsDashboardRaw s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'adminbaremes': return <AdminBaremesRaw s={s} d={d} t={t} lang={lang} />;
      case 'auditsecuritecode': return <AuditCodePage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'optifiscale': case 'couttotal': return <PayrollSimPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'aureussuite': return <AureusIAPage s={s} d={d} t={t} lang={lang} />;
      case 'dashrh': return <EmployeeHubPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'commandcenter': return <SmartOpsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'compliance': return <ComplianceDashboardRaw s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'securitedata': return <SecurityPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'facturation': return <RelancesRaw s={s} d={d} t={t} lang={lang} />;
      case 'gestionprimes': return <PrimesPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'seuilssociaux': return <LoisPage s={s} d={d} t={t} lang={lang} tab={page} />;
      // TABLEAU DE BORD
      case 'accidentTravail': return <AbsencesContratsV3Pg s={s} d={d} tab={page} />;
      case 'actionsrapides': return <SmartOpsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'journal': return <NotificationCenterPg s={s} d={d} tab={page} />;
      case 'tbdirection': return <AnalyticsDashboardRaw s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'smartalerts': return <NotificationCenterPg s={s} d={d} tab={page} />;
      case 'notifications': return <NotificationCenterPg s={s} d={d} tab={page} />;
      // GESTION RH
      case 'annexeReglement': return <DocumentGeneratorPg s={s} d={d} tab={page} />;
      case 'contratgen': return <DocumentGeneratorPg s={s} d={d} tab={page} />;
      case 'contratsmenu': return <DocumentGeneratorPg s={s} d={d} tab={page} />;
      case 'gendocsjur': return <DocumentGeneratorPg s={s} d={d} tab={page} />;
      case 'dashabsent': return <AbsencesContratsV3Pg s={s} d={d} tab={page} />;
      case 'gestionabs': return <AbsencesContratsV3Pg s={s} d={d} tab={page} />;
      case 'planifconges': return <AbsencesContratsV3Pg s={s} d={d} tab={page} />;
      case 'workflowAbs': return <AbsencesContratsV3Pg s={s} d={d} tab={page} />;
      case 'interimaires': return <EmployeePlanningPg s={s} d={d} tab={page} />;
      case 'joursPrestes': return <EmployeePlanningPg s={s} d={d} tab={page} />;
      case 'rh': return <EmployeeHubPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'proceduresrh': return <ProceduresRHHubPg s={s} d={d} />;
      case 'portail': return <PortailEmployePg s={s} d={d} />;
      case 'portailclient': return <PortailClientPg s={s} d={d} />;
      case 'portalmanager': return <PortalSystemPg s={s} d={d} tab={page} />;
      case 'registrepersonnel': return <RegistrePersonnelPg s={s} d={d} />;
      case 'floatinglegal': return <FloatingLegalAgentRaw s={s} d={d} />;
      case 'formC4': return <DocumentGeneratorPg s={s} d={d} tab={page} />;
      // PAIE & CALCULS
      case 'avantages': return <PrimesPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'baremespp': return <TransversalCPPg s={s} d={d} tab={page} />;
      case 'budget': return <BudgetPrevisionnelRaw s={s} d={d} />;
      case 'calcmaladie': return <SalaireMaladieRaw s={s} d={d} />;
      case 'calendrier': return <CalendrierSocialRaw s={s} d={d} />;
      case 'coutsannuel': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'echeancier': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'flexijobs': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'formC131': return <DocumentGeneratorPg s={s} d={d} tab={page} />;
      case 'joursPrestes': return <EmployeePlanningPg s={s} d={d} tab={page} />;
      case 'regulPP': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'salaires': return <PayrollHubPg s={s} d={d} tab={page} />;
      case 'simembauche': return <SimuNetBrutPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'simulateurspro': return <PayrollSimPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'simulicenciement': return <PayrollSimPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'simupension': return <SimulateurPensionRaw s={s} d={d} />;
      case 'simutp': return <SimuNetBrutPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'soldetoutcompte': return <SoldeToutCompteRaw s={s} d={d} />;
      case 'timeline': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'validation': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'vehiculesatn': return <VehiculeATNRaw s={s} d={d} />;
      case 'comparateur': return <PayrollSimPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'compteIndividuel': return <PayrollGroupPg s={s} d={d} tab={page} />;
      // DECLARATIONS & COMPTABILITE
      case 'batchdecl': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'belcotax281': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      // ── MANDATS & PRIMES EMPLOI ──
      case 'mandatonss': case 'belcotaxmandat': case 'domiciliation':
      case 'premieremploi': case 'activabruxelles': case 'art60cpas':
      case 'impulsion55': case 'monbee':
        return <MandatsAdminRaw s={s} d={d} tab={page} />;
      case 'connexionshub': case 'portailsbelges': case 'liensutiles':
        return <ConnexionsHubRaw s={s} d={d} />;
      case 'bilansocial': return <AnalyticsDashboardRaw s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'chargessociales': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'chomagetemporaire': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportWinbooks': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportbatch': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportcoda': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportcompta': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportcomptapro': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'fiscal': return <TransversalCPPg s={s} d={d} tab={page} />;
      case 'importcsv': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'rapportce': return <AnalyticsDashboardRaw s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'rapports': return <AnalyticsDashboardRaw s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'rapportsrole': return <AnalyticsDashboardRaw s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'reporting': return <AnalyticsDashboardRaw s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'reportingpro': return <AnalyticsDashboardRaw s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'sepa': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'compteindividuelannuel': return <PayrollGroupPg s={s} d={d} tab={page} />;
      // CONCERTATION SOCIALE
      case 'ccts': return <LoisPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'delegations': return <LoisPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'delegationsyndicale': return <LoisPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'egalitehf': return <LoisPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'electionsociales': return <LoisPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'formationsec': return <LoisPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'lanceursalerte': return <LoisPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'plandiversite': return <LoisPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'social': return <LoisPage s={s} d={d} t={t} lang={lang} tab={page} />;
      // COMMERCIAL
      case 'checklistclient': return <ChecklistClientRaw s={s} d={d} />;
      case 'comparatif': return <CommissionsModulePg s={s} d={d} tab={page} />;
      case 'fiduciaire': return <CommissionsModulePg s={s} d={d} tab={page} />;
      case 'guidecommercial': return <CommissionsModulePg s={s} d={d} tab={page} />;
      case 'guidefiduciaire': return <CommissionsModulePg s={s} d={d} tab={page} />;
      case 'landing': return <CommissionsModulePg s={s} d={d} tab={page} />;
      case 'legal': return <DocumentGeneratorPg s={s} d={d} tab={page} />;
      case 'parserConcurrent': return <CommissionsModulePg s={s} d={d} tab={page} />;
      case 'repriseclient': return <CommissionsModulePg s={s} d={d} tab={page} />;
      // ADMINISTRATION
      case 'archives': return <SecurityPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'auditfiscale': return <AuditCodePage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'audittrail': return <AuditCodePage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'authroles': return <RolesPermissionsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'autoindex': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'autopilot': return <SmartOpsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'cgvsaas': return <DocumentGeneratorPg s={s} d={d} tab={page} />;
      case 'changelog': return <AdminPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'demodonnees': return <AdminPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'ged': return <SecurityPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'historique': return <AdminPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'integrations': return <IntegrationsComptaPg s={s} d={d} />;
      case 'massengine': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'mentionslegales': return <DocumentGeneratorPg s={s} d={d} tab={page} />;
      case 'monitoring': return <AdminPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'piloteauto': return <SmartOpsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'queue': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'rgpd': return <RGPDModuleRaw s={s} d={d} t={t} lang={lang} state={s} />;
      case 'roadmapinfra': return <AdminPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'support': return <NotificationCenterPg s={s} d={d} tab={page} />;
      case 'team': return <EmployeeHubPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'testsuite': return <AuditCodePage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'settings': return <SettingsPageComp s={s} d={d} t={t} lang={lang} />;
      default: return <PlaceholderPage id={page} label={t('menu.' + currentItem?.id) || currentItem?.label} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <div style={{ width: sidebarOpen ? 260 : 0, background: '#0a0908', borderRight: '1px solid rgba(198,163,78,.06)', display: 'flex', flexDirection: 'column', transition: 'width .2s', overflow: 'hidden', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(198,163,78,.06)' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#c6a34e', letterSpacing: '2px' }}>AUREUS</div>
          <div style={{ fontSize: 9, color: '#5e5c56', letterSpacing: '3px', marginTop: 2 }}>SOCIAL PRO</div>
        </div>

        {/* Barre de recherche */}
        <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid rgba(198,163,78,.06)', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#5e5c56', pointerEvents: 'none' }}>🔍</span>
            <input
              type="text"
              placeholder={t('nav.search') || "Rechercher..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '7px 10px 7px 28px',
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(198,163,78,.12)',
                borderRadius: 8, color: '#e8e6e0', fontSize: 11.5,
                fontFamily: 'inherit', outline: 'none',
              }}
            />
            {searchQuery && (
              <span onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#5e5c56', cursor: 'pointer' }}>✕</span>
            )}
          </div>
          {/* Dropdown résultats */}
          {(searchFocus || searchQuery) && searchQuery.length > 0 && (() => {
            const q = searchQuery.toLowerCase();
            // Résultats pages menu
            const menuResults = MENU.filter(m => !m.group && (
              (t('menu.' + m.id) || m.label).toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
            )).slice(0, 5).map(m => ({ ...m, isSubsection: false }));
            // Résultats sous-sections (paramètres légaux fiche de paie)
            const subResults = (SEARCH_SUBSECTIONS || []).filter(s =>
              s.label.toLowerCase().includes(q) ||
              s.keywords.some(k => k.includes(q) || q.includes(k))
            ).slice(0, 4).map(s => ({ ...s, isSubsection: true }));
            const results = [...subResults, ...menuResults].slice(0, 8);
            const groupName = (g) => GROUPS.find(gr => gr.id === `_g${g}`)?.label || '';
            return results.length > 0 ? (
              <div style={{
                position: 'absolute', left: 12, right: 12, top: '100%', zIndex: 999,
                background: '#111009', border: '1px solid rgba(198,163,78,.2)',
                borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.6)', overflow: 'hidden',
              }}>
                {results.map((item, idx) => (
                  <div key={idx}
                    onClick={() => {
                      navigateTo(item.id);
                      if (item.isSubsection && item.anchor) {
                        setScrollAnchor(item.anchor);
                      }
                      setSearchQuery('');
                      setSearchFocus(false);
                    }}
                    style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,.03)', background: item.isSubsection ? 'rgba(198,163,78,.03)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(198,163,78,.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = item.isSubsection ? 'rgba(198,163,78,.03)' : 'transparent'}
                  >
                    <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11.5, color: '#e8e6e0', fontWeight: 500 }}>{t('menu.' + item.id) || item.label}</div>
                      <div style={{ fontSize: 9.5, color: item.isSubsection ? '#c6a34e' : '#5e5c56', marginTop: 1 }}>{item.isSubsection ? item.sub : groupName(item.g)}</div>
                    </div>
                    {item.isSubsection && <span style={{ fontSize: 9, color: '#c6a34e', opacity: 0.7 }}>↗ section</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                position: 'absolute', left: 12, right: 12, top: '100%', zIndex: 999,
                background: '#111009', border: '1px solid rgba(198,163,78,.2)',
                borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#5e5c56', textAlign: 'center',
              }}>{t('nav.noresult') || 'Aucun résultat'}</div>
            );
          })()}
        </div>

        {/* Menu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {[1, 2, 3, 4, 5, 6, 7].map(gNum => {
            const group = GROUPS.find(g => g.id === `_g${gNum}`);
            const items = getGroupItems(gNum) || [];
            const isCollapsed = collapsed[gNum];
            return (
              <div key={gNum}>
                <div onClick={() => toggleGroup(gNum)}
                  style={{ padding: '10px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#5e5c56', letterSpacing: '.5px', textTransform: 'uppercase' }}>
                    {group?.icon} {t('menu.' + group?.id) || group?.label}
                  </span>
                  <span style={{ fontSize: 10, color: '#5e5c56', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform .15s' }}>▼</span>
                </div>
                {!isCollapsed && items.map(item => (
                  <div key={item.id} onClick={() => navigateTo(item.id)}
                    style={{
                      padding: '7px 18px 7px 24px', cursor: 'pointer', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 8,
                      background: page === item.id ? 'rgba(198,163,78,.08)' : 'transparent',
                      color: page === item.id ? '#c6a34e' : '#9e9b93',
                      borderLeft: page === item.id ? '2px solid #c6a34e' : '2px solid transparent',
                    }}
                    onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,.02)'; }}
                    onMouseLeave={e => { if (page !== item.id) e.currentTarget.style.background = 'transparent'; }}>
                    <span style={{ fontSize: 13, width: 20, textAlign: 'center' }}>{item.icon}</span>
                    <span>{t('menu.' + item.id) || item.label}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer sidebar */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(198,163,78,.06)', fontSize: 9, color: '#5e5c56' }}>
          <div>v38 · Sprint 38</div>
          <div>BE 1028.230.781</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '12px 24px', borderBottom: `1px solid ${TH.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: TH.header, backdropFilter: 'blur(8px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', color: '#5e5c56', cursor: 'pointer', fontSize: 16, padding: 4 }}>☰</button>
            {pageHistory.length > 0 && (
              <button onClick={navigateBack}
                title={t('ui.back') || 'Retour'}
                style={{ background: 'rgba(198,163,78,.08)', border: '1px solid rgba(198,163,78,.2)', color: '#c6a34e', cursor: 'pointer', fontSize: 12, padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}>
                ← <span style={{ fontSize: 11 }}>{t('ui.back') || 'Retour'}</span>
              </button>
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e8e6e0' }}>{currentItem.icon} {t('menu.' + currentItem?.id) || currentItem?.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Sélecteur de langue */}
            <div style={{ display: 'flex', gap: 2, background: TH.surface, borderRadius: 6, padding: 2, border: `1px solid ${TH.border}` }}>
              {['fr','nl','en','de'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ padding: '3px 7px', borderRadius: 4, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 10, fontWeight: lang === l ? 700 : 400, background: lang === l ? 'rgba(198,163,78,.2)' : 'transparent', color: lang === l ? '#c6a34e' : TH.text3, transition: 'all .15s', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {l}
                </button>
              ))}
            </div>

            {/* Toggle dark/light */}
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Passer en mode jour' : 'Passer en mode nuit'}
              style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${TH.border}`, background: TH.surface, color: TH.text2, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <span title={cryptoKey ? 'Chiffrement AES-256 actif' : 'Chiffrement inactif'} style={{ fontSize: 12, color: cryptoKey ? '#22c55e' : '#ef4444' }}>{cryptoKey ? '🔒' : '🔓'}</span>
            <span style={{ fontSize: 11, color: TH.text3, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'demo'}</span>
            <button onClick={handleLogout}
              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,.15)', background: 'rgba(239,68,68,.05)', color: '#ef4444', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
              {t('nav.logout') || 'Déconnexion'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div key={page} style={{ flex: 1, overflowY: 'auto', padding: 24, background: TH.bg, color: TH.text }}>
          <ErrorBoundary pageKey={page} label={currentItem?.label}>{renderPage()}</ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ user }) {
  return (
    <LangProvider>
      <DashboardLayoutInner user={user} />
    </LangProvider>
  );
}
