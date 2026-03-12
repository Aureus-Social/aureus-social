'use client';
import { logInfo, logWarn } from '../lib/security/logger.js';
import React, { useState, useReducer, useMemo, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MENU, GROUPS, getGroupItems, SEARCH_SUBSECTIONS } from '../lib/menu-config';
import { I18N } from '../lib/i18n';
import { LangProvider, useLang } from '../lib/lang-context';
import { supabase } from '../lib/supabase';
import { initCryptoKey, encryptState, decryptState } from '../lib/crypto';
import { setAuditUser, audit } from '../lib/audit';

const Loading = () => <div style={{padding:40,textAlign:'center',color:'#5e5c56'}}>Chargement...</div>;


// ErrorBoundary pour catch les crashes de modules
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidUpdate(prevProps) {
    if (prevProps.pageKey !== this.props.pageKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }
  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message || 'Erreur inconnue';
      return <div style={{padding:40}}>
        <div style={{fontSize:15,fontWeight:700,color:'#ef4444',marginBottom:8}}>❌ {this.props.label || 'Module'} — Erreur</div>
        <div style={{fontSize:11,color:'#9e9b93',marginBottom:12,fontFamily:'monospace',background:'rgba(239,68,68,.06)',padding:'10px 14px',borderRadius:8,border:'1px solid rgba(239,68,68,.15)',wordBreak:'break-all'}}>{msg}</div>
        <button onClick={()=>this.setState({hasError:false,error:null})} style={{padding:'8px 20px',borderRadius:8,border:'1px solid rgba(198,163,78,.2)',background:'transparent',color:'#c6a34e',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Réessayer</button>
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
const FloatingLegalAgentComp = dynamic(() => import('../pages/FloatingLegalAgent'), { ssr: false, loading: Loading });

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
const AnalyticsPage = ({ s, d, tab }) => <AnalyticsDashboardRaw s={s} d={d} tab={tab} />;

const ComplianceDashboardRaw = dynamic(() => import('../pages/ComplianceDashboard'), { ssr: false, loading: Loading });
const CompliancePage = ({ s, d, tab }) => <ComplianceDashboardRaw s={s} d={d} tab={tab} />;

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
const ProceduresRHHubPgW = ({ s, d }) => <ProceduresRHHubRaw />;

// Reducer pour le state global
function reducer(state, action) {
  // Audit trail serveur — actions sensibles tracées automatiquement
  if (typeof window !== 'undefined') {
    const sensitiveActions = ['ADD_EMP','UPD_EMP','DEL_EMP','ADD_P','ADD_DIM'];
    if (sensitiveActions.includes(action.type)) {
      const labels = { ADD_EMP:'CREATE_EMPLOYEE', UPD_EMP:'UPDATE_EMPLOYEE', DEL_EMP:'DELETE_EMPLOYEE', ADD_P:'GENERATE_PAYSLIP', ADD_DIM:'SUBMIT_DIMONA' };
      const emp = action.d || (action.type === 'DEL_EMP' ? state.emps?.find(e => e.id === action.id) : null);
      fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: labels[action.type],
          table_name: action.type.includes('EMP') ? 'employees' : action.type === 'ADD_P' ? 'fiches_paie' : 'dimona',
          record_id: emp?.id || null,
          details: emp ? { name: (emp.first||emp.fn||'')+ ' ' +(emp.last||emp.ln||''), action_type: action.type } : null
        })
      }).catch(() => { /* fire-and-forget */ });
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
    case 'ADD_P': return { ...state, payrollHistory: [...(state.payrollHistory||[]), action.d] };
    case 'ADD_DIM': return { ...state, dimonaHistory: [...(state.dimonaHistory||[]), action.d] };
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
  const [cryptoKey, setCryptoKey] = useState(null);
  const { lang, setLang, t: tCtx } = useLang();
  const [theme, setTheme] = useState(() => (typeof window !== 'undefined' ? (()=>{ try { return localStorage.getItem('aureus_theme') || 'dark'; } catch { return 'dark'; } })() : 'dark'));

  // Traduction helper
  const t = tCtx;

  // Persister préférences
  useEffect(() => { try { if (typeof window !== 'undefined') localStorage.setItem('aureus_theme', theme); } catch { /* handled */ } }, [theme]);

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [scrollAnchor, setScrollAnchor] = useState(null);
  const [state, dispatch] = useReducer(reducer, {
    emps: [],
    clients: [],
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
      else logWarn('Layout', 'Chiffrement non disponible');
    });

    // Backup automatique silencieux à chaque session (4.3)
    if (user) {
      const BACKUP_KEY = 'aureus_last_backup_' + (user.id || user.email);
      const lastBackup = sessionStorage.getItem(BACKUP_KEY);
      const now = Date.now();
      const TWO_HOURS = 2 * 60 * 60 * 1000;
      if (!lastBackup || (now - parseInt(lastBackup)) > TWO_HOURS) {
        setTimeout(() => {
          fetch('/api/backup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'silent', userEmail: user.email, userRole: user.user_metadata?.role || '' })
          }).then(res => {
            if (res.ok) {
              sessionStorage.setItem(BACKUP_KEY, String(now));
              const records = res.headers.get('X-Backup-Records');
              logInfo('Layout', `Backup auto: ${records} enregistrements sauvegardés`);
            }
          }).catch(() => { /* fire-and-forget */ });
        }, 3000); // 3s après login pour ne pas bloquer le chargement
      }
    }
  },[user]);

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
      case 'analytics': return <AnalyticsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'adminbaremes': return <AdminBaremesPageW s={s} d={d} t={t} lang={lang} />;
      case 'auditsecuritecode': return <AuditCodePage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'optifiscale': case 'couttotal': return <PayrollSimPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'aureussuite': return <AureusIAPage s={s} d={d} t={t} lang={lang} />;
      case 'dashrh': return <EmployeeHubPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'commandcenter': return <SmartOpsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'compliance': return <CompliancePage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'securitedata': return <SecurityPage s={s} d={d} t={t} lang={lang} tab={page} supabase={supabase} user={user} />;
      case 'facturation': return <RelancesPage s={s} d={d} t={t} lang={lang} />;
      case 'gestionprimes': return <PrimesPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'seuilssociaux': return <LoisPage s={s} d={d} t={t} lang={lang} tab={page} />;
      // TABLEAU DE BORD
      case 'accidentTravail': return <AbsencesContratsV3Pg s={s} d={d} tab={page} />;
      case 'actionsrapides': return <SmartOpsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'journal': return <NotificationCenterPgW s={s} d={d} tab={page} />;
      case 'tbdirection': return <AnalyticsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'smartalerts': return <NotificationCenterPgW s={s} d={d} tab={page} />;
      case 'notifications': return <NotificationCenterPgW s={s} d={d} tab={page} />;
      // GESTION RH
      case 'annexeReglement': return <DocumentGeneratorPgW s={s} d={d} tab={page} />;
      case 'contratgen': return <DocumentGeneratorPgW s={s} d={d} tab={page} />;
      case 'contratsmenu': return <DocumentGeneratorPgW s={s} d={d} tab={page} />;
      case 'gendocsjur': return <DocumentGeneratorPgW s={s} d={d} tab={page} />;
      case 'dashabsent': return <AbsencesContratsV3Pg s={s} d={d} tab={page} />;
      case 'gestionabs': return <AbsencesContratsV3Pg s={s} d={d} tab={page} />;
      case 'planifconges': return <AbsencesContratsV3Pg s={s} d={d} tab={page} />;
      case 'workflowAbs': return <AbsencesContratsV3Pg s={s} d={d} tab={page} />;
      case 'interimaires': return <EmployeePlanningPgW s={s} d={d} tab={page} />;
      case 'joursPrestes': return <EmployeePlanningPgW s={s} d={d} tab={page} />;
      case 'registrepersonnel': return <EmployeePlanningPgW s={s} d={d} tab={page} />;
      case 'rh': return <EmployeeHubPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'proceduresrh': return <ProceduresRHHubPgW s={s} d={d} />;
      case 'portail': return <PortalSystemPg s={s} d={d} tab={page} />;
      case 'portailclient': return <PortalSystemPg s={s} d={d} tab={page} />;
      case 'portalmanager': return <PortalSystemPg s={s} d={d} tab={page} />;
      case 'formC4': return <DocumentGeneratorPgW s={s} d={d} tab={page} />;
      // PAIE & CALCULS
      case 'avantages': return <PrimesPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'baremespp': return <TransversalCPPg s={s} d={d} tab={page} />;
      case 'budget': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'calcmaladie': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'calendrier': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'coutsannuel': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'echeancier': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'flexijobs': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'formC131': return <DocumentGeneratorPgW s={s} d={d} tab={page} />;
      case 'joursPrestes': return <EmployeePlanningPgW s={s} d={d} tab={page} />;
      case 'regulPP': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'salaires': return <PayrollHubPg s={s} d={d} tab={page} />;
      case 'simembauche': return <SimuNetBrutPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'simulateurspro': return <PayrollSimPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'simulicenciement': return <PayrollSimPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'simupension': return <PayrollSimPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'simutp': return <SimuNetBrutPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'soldetoutcompte': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'timeline': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'validation': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'vehiculesatn': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'comparateur': return <PayrollSimPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'compteIndividuel': return <PayrollGroupPg s={s} d={d} tab={page} />;
      // DECLARATIONS & COMPTABILITE
      case 'batchdecl': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'belcotax281': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      // ── MANDATS & PRIMES EMPLOI ──
      case 'mandatonss': case 'belcotaxmandat': case 'domiciliation':
      case 'premieremploi': case 'activabruxelles': case 'art60cpas':
      case 'impulsion55': case 'monbee':
        return <MandatsAdminPg s={s} d={d} tab={page} />;
      case 'connexionshub': case 'portailsbelges': case 'liensutiles':
        return <ConnexionsHubPg s={s} d={d} />;
      case 'bilansocial': return <AnalyticsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'chargessociales': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'chomagetemporaire': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportWinbooks': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportbatch': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportcoda': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportcompta': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportcomptapro': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'fiscal': return <TransversalCPPg s={s} d={d} tab={page} />;
      case 'importcsv': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'rapportce': return <AnalyticsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'rapports': return <AnalyticsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'rapportsrole': return <AnalyticsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'reporting': return <AnalyticsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'reportingpro': return <AnalyticsPage s={s} d={d} t={t} lang={lang} tab={page} />;
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
      case 'checklistclient': return <CommissionsModulePgW s={s} d={d} tab={page} />;
      case 'comparatif': return <CommissionsModulePgW s={s} d={d} tab={page} />;
      case 'fiduciaire': return <CommissionsModulePgW s={s} d={d} tab={page} />;
      case 'guidecommercial': return <CommissionsModulePgW s={s} d={d} tab={page} />;
      case 'guidefiduciaire': return <CommissionsModulePgW s={s} d={d} tab={page} />;
      case 'landing': return <CommissionsModulePgW s={s} d={d} tab={page} />;
      case 'legal': return <DocumentGeneratorPgW s={s} d={d} tab={page} />;
      case 'parserConcurrent': return <CommissionsModulePgW s={s} d={d} tab={page} />;
      case 'repriseclient': return <CommissionsModulePgW s={s} d={d} tab={page} />;
      // ADMINISTRATION
      case 'archives': return <SecurityPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'auditfiscale': return <AuditCodePage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'audittrail': return <AuditCodePage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'authroles': return <RolesPermissionsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'autoindex': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'autopilot': return <SmartOpsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'cgvsaas': return <DocumentGeneratorPgW s={s} d={d} tab={page} />;
      case 'changelog': return <AdminPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'demodonnees': return <AdminPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'ged': return <SecurityPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'historique': return <AdminPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'integrations': return <AdminPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'massengine': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'mentionslegales': return <DocumentGeneratorPgW s={s} d={d} tab={page} />;
      case 'monitoring': return <AdminPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'piloteauto': return <SmartOpsPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'queue': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'rgpd': return <CompliancePage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'roadmapinfra': return <AdminPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'support': return <NotificationCenterPgW s={s} d={d} tab={page} />;
      case 'team': return <EmployeeHubPage s={s} d={d} t={t} lang={lang} tab={page} />;
      case 'testsuite': return <AuditCodePage s={s} d={d} t={t} lang={lang} tab={page} />;
      default: return <PlaceholderPage id={page} label={currentItem.label} />;
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
              placeholder="Rechercher..."
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
            const q = searchQuery.toLowerCase().trim();

            // ── 1. Résultats menu principal ──────────────────────────────
            const menuResults = MENU.filter(m => !m.group && (
              m.label.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
            )).map(m => ({ ...m, type: 'page' }));

            // ── 2. Sous-sections fiche de paie ───────────────────────────
            const subResults = (SEARCH_SUBSECTIONS || []).filter(s =>
              s.label.toLowerCase().includes(q) ||
              s.keywords.some(k => k.includes(q) || q.includes(k))
            ).map(s => ({ ...s, type: 'subsection' }));

            // ── 3. Index étendu — tous les onglets internes ──────────────
            const INNER_TABS = [
              // Sécurité des Données
              { id:'securitedata', label:'Vue d\'ensemble Sécurité', sub:'Sécurité des Données', icon:'🛡', tab:'overview', keywords:['securite','overview','score','controles'] },
              { id:'securitedata', label:'N1 Urgent — Failles critiques', sub:'Sécurité des Données', icon:'🔴', tab:'niveau1', keywords:['urgent','failles','critique','p1'] },
              { id:'securitedata', label:'N2 Chiffrement', sub:'Sécurité des Données', icon:'🟠', tab:'niveau2', keywords:['chiffrement','aes','crypto','encrypt'] },
              { id:'securitedata', label:'N3 Blindage', sub:'Sécurité des Données', icon:'🟡', tab:'niveau3', keywords:['blindage','hardening','csp','cors'] },
              { id:'securitedata', label:'N4 RGPD', sub:'Sécurité des Données', icon:'🔵', tab:'rgpd', keywords:['rgpd','gdpr','dpo','article'] },
              { id:'securitedata', label:'Test mot de passe', sub:'Sécurité des Données', icon:'🔑', tab:'password', keywords:['password','mot de passe','force','test'] },
              { id:'securitedata', label:'Headers HTTP', sub:'Sécurité des Données', icon:'📋', tab:'headers', keywords:['headers','http','csp','hsts','cors'] },
              { id:'securitedata', label:'Documents RGPD', sub:'Sécurité des Données', icon:'📜', tab:'rgpddocs', keywords:['rgpd','documents','dpa','article 28','30'] },
              { id:'securitedata', label:'IP Whitelist', sub:'Sécurité des Données', icon:'🌐', tab:'ipwhitelist', keywords:['ip','whitelist','blocklist','acces'] },
              { id:'securitedata', label:'Backup données', sub:'Sécurité des Données', icon:'💾', tab:'backup', keywords:['backup','sauvegarde','export','restore'] },
              { id:'securitedata', label:'Security Pro — Backups B2 & Intrusions', sub:'Sécurité des Données', icon:'🔐', tab:'secpro', keywords:['security pro','b2','backblaze','intrusion','geoip','brute force'] },
              // Audit Sécurité Code
              { id:'auditsecuritecode', label:'Audit Sécurité Code', sub:'Audit Code', icon:'🛡', tab:'securite', keywords:['audit','code','securite'] },
              { id:'auditsecuritecode', label:'Audit Trail', sub:'Audit Code', icon:'🔍', tab:'trail', keywords:['audit trail','logs','historique','actions'] },
              { id:'auditsecuritecode', label:'Test Suite', sub:'Audit Code', icon:'🧪', tab:'tests', keywords:['test','suite','jest','unit'] },
              // Fiches de paie
              { id:'payslip', label:'Nouvelle fiche de paie', sub:'Fiches de Paie', icon:'➕', tab:'new', keywords:['nouvelle','creer','fiche','paie'] },
              { id:'payslip', label:'Historique fiches de paie', sub:'Fiches de Paie', icon:'📋', tab:'history', keywords:['historique','fiches','liste','archives'] },
              { id:'payslip', label:'Paramètres légaux', sub:'Fiches de Paie', icon:'⚙️', tab:'params', keywords:['parametres','legaux','taux','baremes'] },
              // Dashboard RH
              { id:'dashrh', label:'Planning RH', sub:'Dashboard RH', icon:'📅', tab:'planning', keywords:['planning','calendrier','rh'] },
              { id:'dashrh', label:'Absences RH', sub:'Dashboard RH', icon:'🏖', tab:'absences', keywords:['absences','conges','maladie'] },
              { id:'dashrh', label:'Analytics RH', sub:'Dashboard RH', icon:'📊', tab:'analytics', keywords:['analytics','stats','rh','indicateurs'] },
              // Declarations
              { id:'declarations', label:'Dimona IN', sub:'Déclarations ONSS/SPF', icon:'📡', tab:'dimona-in', keywords:['dimona','in','entree','declaration'] },
              { id:'declarations', label:'Dimona OUT', sub:'Déclarations ONSS/SPF', icon:'📡', tab:'dimona-out', keywords:['dimona','out','sortie','fin contrat'] },
              { id:'declarations', label:'DMFA Trimestrielle', sub:'Déclarations ONSS/SPF', icon:'📊', tab:'dmfa', keywords:['dmfa','trimestrielle','onss','declaration'] },
              { id:'declarations', label:'Belcotax XML', sub:'Déclarations ONSS/SPF', icon:'📄', tab:'belcotax', keywords:['belcotax','281','xml','fiscal'] },
              // Export Comptable Pro
              { id:'exportcomptapro', label:'Export WinBooks ACT', sub:'Export Comptable Pro', icon:'📤', tab:'winbooks', keywords:['winbooks','act','export','compta'] },
              { id:'exportcomptapro', label:'Export BOB50', sub:'Export Comptable Pro', icon:'📒', tab:'bob', keywords:['bob','bob50','export','compta'] },
              { id:'exportcomptapro', label:'Export Exact Online', sub:'Export Comptable Pro', icon:'🔵', tab:'exact', keywords:['exact','online','xml','export'] },
              { id:'exportcomptapro', label:'Export Octopus', sub:'Export Comptable Pro', icon:'🐙', tab:'octopus', keywords:['octopus','export','compta'] },
              { id:'exportcomptapro', label:'Export Horus/Popsy', sub:'Export Comptable Pro', icon:'📊', tab:'horus', keywords:['horus','popsy','export','compta'] },
              // Admin
              { id:'admin', label:'Gestion utilisateurs', sub:'Administration', icon:'👥', tab:'users', keywords:['utilisateurs','users','admin','gestion'] },
              { id:'admin', label:'Paramètres app', sub:'Administration', icon:'⚙️', tab:'settings', keywords:['parametres','settings','config','app'] },
              { id:'admin', label:'Logs système', sub:'Administration', icon:'📋', tab:'logs', keywords:['logs','systeme','erreurs','debug'] },
              // Simulateurs Pro
              { id:'simulateurspro', label:'Simulateur Net→Brut', sub:'Simulateurs Pro', icon:'🧮', tab:'netbrut', keywords:['net','brut','simulateur','calcul'] },
              { id:'simulateurspro', label:'Simulateur Licenciement', sub:'Simulateurs Pro', icon:'⚖️', tab:'licenciement', keywords:['licenciement','preavis','indemnite','rupture'] },
              { id:'simulateurspro', label:'Simulateur Pension', sub:'Simulateurs Pro', icon:'🏖', tab:'pension', keywords:['pension','retraite','simulateur'] },
              { id:'simulateurspro', label:'Coût total employeur', sub:'Simulateurs Pro', icon:'💰', tab:'cout', keywords:['cout','total','employeur','charge'] },
              // Compliance
              { id:'compliance', label:'Veille légale', sub:'Compliance Radar', icon:'⚖️', tab:'veille', keywords:['veille','legale','loi','monitoring'] },
              { id:'compliance', label:'Alertes conformité', sub:'Compliance Radar', icon:'🔔', tab:'alertes', keywords:['alertes','conformite','compliance','rgpd'] },
              // GED
              { id:'ged', label:'Documents GED', sub:'GED Documents', icon:'📁', tab:'docs', keywords:['ged','documents','fichiers','archive'] },
              { id:'ged', label:'RGPD Docs', sub:'GED Documents', icon:'🔒', tab:'rgpddocs', keywords:['rgpd','documents','dpa','art30'] },
              // Hub Connexions
              { id:'connexionshub', label:'ONSS / Mahis', sub:'Hub Connexions H24', icon:'🏛', tab:'onss', keywords:['onss','mahis','connexion','portail'] },
              { id:'connexionshub', label:'CSAM / eHealth', sub:'Hub Connexions H24', icon:'🏥', tab:'csam', keywords:['csam','ehealth','gap','designation'] },
              { id:'connexionshub', label:'Belcotax Online', sub:'Hub Connexions H24', icon:'📄', tab:'belcotax', keywords:['belcotax','fiscal','fisc','online'] },
              // Reporting Pro
              { id:'reportingpro', label:'Rapports par rôle', sub:'Reporting Pro', icon:'📈', tab:'roles', keywords:['rapports','role','reporting'] },
              { id:'reportingpro', label:'Export analytique', sub:'Reporting Pro', icon:'📊', tab:'export', keywords:['export','analytique','reporting'] },
            ];

            const tabResults = INNER_TABS.filter(t =>
              t.label.toLowerCase().includes(q) ||
              t.sub.toLowerCase().includes(q) ||
              t.keywords.some(k => k.includes(q) || q.includes(k))
            ).map(t => ({ ...t, type: 'tab' }));

            // ── Fusion + déduplication ────────────────────────────────────
            const all = [...subResults, ...tabResults, ...menuResults];
            // Dédupliquer : garder le premier de chaque id+tab combo
            const seen = new Set();
            const results = all.filter(r => {
              const key = r.id + '|' + (r.tab||'') + '|' + (r.anchor||'');
              if (seen.has(key)) return false;
              seen.add(key); return true;
            }).slice(0, 12);

            const groupName = (g) => GROUPS.find(gr => gr.id === `_g${g}`)?.label || '';
            return results.length > 0 ? (
              <div style={{
                position: 'absolute', left: 12, right: 12, top: '100%', zIndex: 999,
                background: '#111009', border: '1px solid rgba(198,163,78,.2)',
                borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.6)', overflow: 'hidden',
                maxHeight: 420, overflowY: 'auto',
              }}>
                {results.map((item, idx) => (
                  <div key={idx}
                    onClick={() => {
                      setPage(item.id);
                      if (item.type === 'subsection' && item.anchor) setScrollAnchor(item.anchor);
                      if (item.type === 'tab' && item.tab) setTimeout(() => {
                        const ev = new CustomEvent('aureus:settab', { detail: { tab: item.tab } });
                        window.dispatchEvent(ev);
                      }, 400);
                      setSearchQuery('');
                      setSearchFocus(false);
                    }}
                    style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,.03)',
                      background: item.type === 'subsection' ? 'rgba(198,163,78,.03)' : item.type === 'tab' ? 'rgba(100,160,255,.03)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(198,163,78,.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = item.type === 'subsection' ? 'rgba(198,163,78,.03)' : item.type === 'tab' ? 'rgba(100,160,255,.03)' : 'transparent'}
                  >
                    <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11.5, color: '#e8e6e0', fontWeight: 500 }}>{item.label}</div>
                      <div style={{ fontSize: 9.5, color: item.type !== 'page' ? '#c6a34e' : '#5e5c56', marginTop: 1 }}>
                        {item.type === 'page' ? groupName(item.g) : item.sub}
                      </div>
                    </div>
                    {item.type === 'subsection' && <span style={{ fontSize: 9, color: '#c6a34e', opacity: 0.7 }}>↗ section</span>}
                    {item.type === 'tab' && <span style={{ fontSize: 9, color: '#6ab0ff', opacity: 0.7 }}>↗ onglet</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                position: 'absolute', left: 12, right: 12, top: '100%', zIndex: 999,
                background: '#111009', border: '1px solid rgba(198,163,78,.2)',
                borderRadius: 8, padding: '12px', textAlign: 'center', color: '#5e5c56', fontSize: 11,
              }}>Aucun résultat pour « {searchQuery} »</div>
            )
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
                    {group?.icon} {group?.label}
                  </span>
                  <span style={{ fontSize: 10, color: '#5e5c56', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform .15s' }}>▼</span>
                </div>
                {!isCollapsed && items.map(item => (
                  <div key={item.id} onClick={() => item.external ? window.open(item.external, '_blank') : setPage(item.id)}
                    style={{
                      padding: '7px 18px 7px 24px', cursor: 'pointer', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 8,
                      background: page === item.id ? 'rgba(198,163,78,.08)' : 'transparent',
                      color: page === item.id ? '#c6a34e' : '#9e9b93',
                      borderLeft: page === item.id ? '2px solid #c6a34e' : '2px solid transparent',
                    }}
                    onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,.02)'; }}
                    onMouseLeave={e => { if (page !== item.id) e.currentTarget.style.background = 'transparent'; }}>
                    <span style={{ fontSize: 13, width: 20, textAlign: 'center' }}>{item.icon}</span>
                    <span>{item.label}</span>
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
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e8e6e0' }}>{currentItem.icon} {currentItem.label}</span>
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
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: TH.bg, color: TH.text }}>
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
