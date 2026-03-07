'use client';
import React, { useState, useReducer, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MENU, GROUPS, getGroupItems } from '../lib/menu-config';
import { supabase } from '../lib/supabase';

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
const RolesPermissionsPage = dynamic(() => import('../pages/RolesPermissions'), { ssr: false, loading: Loading });
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
const ProceduresRHHubPgW = ({ s, d }) => <ProceduresRHHubRaw />;

// Reducer pour le state global
function reducer(state, action) {
  switch (action.type) {
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

// Dashboard principal
function DashboardHome({ state, onNavigate }) {
  const ae = (state.emps || []).filter(e => e.status === 'active' || !e.status);
  const masse = ae.reduce((a, e) => a + (+(e.monthlySalary || e.gross || 0)), 0);
  const fmt = n => new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(n || 0);
  const net = Math.round(masse * 0.6687);
  const cout = Math.round(masse * 1.2507);
  const now = new Date();
  const mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

  return (
    <div>
      <div style={{ fontSize: 19, fontWeight: 800, color: '#c6a34e', marginBottom: 4 }}>Tableau de bord</div>
      <div style={{ fontSize: 12, color: '#5e5c56', marginBottom: 24 }}>{mois[now.getMonth()]} {now.getFullYear()} — Aureus IA SPRL · BCE BE 1028.230.781</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '◉', label: 'Employés actifs', value: ae.length, sub: `0 sorti · 0 étudiant`, color: '#c6a34e' },
          { icon: '◈', label: 'Masse salariale brute', value: fmt(masse), sub: `Moy: ${fmt(ae.length ? masse / ae.length : 0)}/emp`, color: '#c6a34e' },
          { icon: '▤', label: 'Net total', value: fmt(net), sub: '68% du brut', color: '#22c55e' },
          { icon: '◆', label: 'Coût employeur total', value: fmt(cout), sub: 'Ratio: 125% du brut', color: '#a78bfa' },
        ].map((k, i) => (
          <div key={i} style={{ padding: '18px 20px', background: 'rgba(198,163,78,.03)', borderRadius: 12, border: '1px solid rgba(198,163,78,.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>{k.icon}</span>
              <span style={{ fontSize: 10, color: '#5e5c56', textTransform: 'uppercase', letterSpacing: '.5px' }}>{k.label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 10, color: '#5e5c56', marginTop: 4 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ padding: '18px 20px', background: 'rgba(198,163,78,.03)', borderRadius: 12, border: '1px solid rgba(198,163,78,.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#c6a34e', marginBottom: 12 }}>Échéances & Obligations</div>
          {[
            { icon: '◆', label: 'DmfA T1/2026', date: '31/03/2026', type: 'trimestriel' },
            { icon: '◇', label: 'Précompte professionnel 274', date: '5/04/2026', type: 'mensuel' },
            { icon: '◆', label: 'Provisions ONSS mensuelles', date: '5 du mois', type: 'mensuel' },
            { icon: '⬆', label: 'Dimona IN — Avant embauche', date: 'Permanent', type: '' },
          ].map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.03)', fontSize: 12 }}>
              <span><span style={{ marginRight: 8 }}>{e.icon}</span>{e.label}</span>
              <span style={{ color: '#c6a34e', fontSize: 11 }}>{e.date}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '18px 20px', background: 'rgba(198,163,78,.03)', borderRadius: 12, border: '1px solid rgba(198,163,78,.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#c6a34e', marginBottom: 12 }}>Actions rapides</div>
          {[
            { icon: '◉', label: '+ Nouvel employé', id: 'employees' },
            { icon: '◈', label: 'Générer fiche de paie', id: 'payslip' },
            { icon: '⬆', label: 'Dimona IN/OUT', id: 'declarations' },
            { icon: '◆', label: 'DmfA trimestrielle', id: 'declarations' },
          ].map((a, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 4, cursor: 'pointer', fontSize: 12, background: 'rgba(198,163,78,.02)' }}
              onClick={() => onNavigate && onNavigate(a.id)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(198,163,78,.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(198,163,78,.02)'}>
              <span style={{ marginRight: 8 }}>{a.icon}</span>{a.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ user }) {
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [state, dispatch] = useReducer(reducer, {
    emps: [],
    clients: [],
    payrollHistory: [],
    dimonaHistory: [],
    co: { name: 'Aureus IA SPRL', vat: 'BE 1028.230.781' }
  });

  const s = state;
  const d = dispatch;

  const toggleGroup = (gId) => setCollapsed(p => ({ ...p, [gId]: !p[gId] }));
  const currentItem = MENU.find(m => m.id === page) || { label: 'Dashboard' };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    window.location.reload();
  };

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage s={s} d={d} onNavigate={setPage} />;
      case 'employees': return <EmployeesPage s={s} d={d} />;
      case 'payslip': return <PayslipsPage s={s} d={d} />;
      case 'declarations': case 'onss': return <DimonaPageComp s={s} d={d} />;
      case 'admin': return <AdminPage s={s} d={d} tab={page} />;
      case 'baremescp': return <BaremesCPPage s={s} d={d} />;
      case 'calcinstant': return <SimuNetBrutPage s={s} d={d} tab={page} />;
      case 'diagnostic': case 'diagnosticv': return <DiagnosticPage s={s} d={d} />;
      case 'seuilssociaux': return <SeuilsPage s={s} d={d} />;
      case 'onboarding': case 'onboardwizard': return <OnboardingPage s={s} d={d} />;
      case 'cloture': return <CloturePage s={s} d={d} />;
      case 'analytics': return <AnalyticsPage s={s} d={d} tab={page} />;
      case 'adminbaremes': return <AdminBaremesPageW s={s} d={d} />;
      case 'auditsecuritecode': return <AuditCodePage s={s} d={d} tab={page} />;
      case 'optifiscale': case 'couttotal': return <PayrollSimPage s={s} d={d} tab={page} />;
      case 'aureussuite': return <AureusIAPage s={s} d={d} />;
      case 'dashrh': return <EmployeeHubPage s={s} d={d} tab={page} />;
      case 'commandcenter': return <SmartOpsPage s={s} d={d} tab={page} />;
      case 'compliance': return <CompliancePage s={s} d={d} tab={page} />;
      case 'securitedata': return <SecurityPage s={s} d={d} tab={page} />;
      case 'facturation': return <RelancesPage s={s} d={d} />;
      case 'gestionprimes': return <PrimesPage s={s} d={d} tab={page} />;
      case 'seuilssociaux': return <LoisPage s={s} d={d} tab={page} />;
      // TABLEAU DE BORD
      case 'accidentTravail': return <AbsencesContratsV3Pg s={s} d={d} tab={page} />;
      case 'actionsrapides': return <SmartOpsPage s={s} d={d} tab={page} />;
      case 'journal': return <NotificationCenterPgW s={s} d={d} tab={page} />;
      case 'tbdirection': return <AnalyticsPage s={s} d={d} tab={page} />;
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
      case 'rh': return <EmployeeHubPage s={s} d={d} tab={page} />;
      case 'proceduresrh': return <ProceduresRHHubPgW s={s} d={d} />;
      case 'portail': return <PortalSystemPg s={s} d={d} tab={page} />;
      case 'portailclient': return <PortalSystemPg s={s} d={d} tab={page} />;
      case 'portalmanager': return <PortalSystemPg s={s} d={d} tab={page} />;
      case 'formC4': return <DocumentGeneratorPgW s={s} d={d} tab={page} />;
      // PAIE & CALCULS
      case 'avantages': return <PrimesPage s={s} d={d} tab={page} />;
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
      case 'simembauche': return <SimuNetBrutPage s={s} d={d} tab={page} />;
      case 'simulateurspro': return <PayrollSimPage s={s} d={d} tab={page} />;
      case 'simulicenciement': return <PayrollSimPage s={s} d={d} tab={page} />;
      case 'simupension': return <PayrollSimPage s={s} d={d} tab={page} />;
      case 'simutp': return <SimuNetBrutPage s={s} d={d} tab={page} />;
      case 'soldetoutcompte': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'timeline': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'validation': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'vehiculesatn': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'comparateur': return <PayrollSimPage s={s} d={d} tab={page} />;
      case 'compteIndividuel': return <PayrollGroupPg s={s} d={d} tab={page} />;
      // DECLARATIONS & COMPTABILITE
      case 'batchdecl': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'belcotax281': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      // ── MANDATS & PRIMES EMPLOI ──
      case 'mandatonss': case 'belcotaxmandat': case 'domiciliation':
      case 'premieremploi': case 'activabruxelles': case 'art60cpas':
      case 'impulsion55': case 'monbee':
        return <MandatsAdminPg s={s} d={d} tab={page} />;
      case 'bilansocial': return <AnalyticsPage s={s} d={d} tab={page} />;
      case 'chargessociales': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'chomagetemporaire': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportWinbooks': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportbatch': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportcoda': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportcompta': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'exportcomptapro': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'fiscal': return <TransversalCPPg s={s} d={d} tab={page} />;
      case 'importcsv': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'rapportce': return <AnalyticsPage s={s} d={d} tab={page} />;
      case 'rapports': return <AnalyticsPage s={s} d={d} tab={page} />;
      case 'rapportsrole': return <AnalyticsPage s={s} d={d} tab={page} />;
      case 'reporting': return <AnalyticsPage s={s} d={d} tab={page} />;
      case 'reportingpro': return <AnalyticsPage s={s} d={d} tab={page} />;
      case 'sepa': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'compteindividuelannuel': return <PayrollGroupPg s={s} d={d} tab={page} />;
      // CONCERTATION SOCIALE
      case 'ccts': return <LoisPage s={s} d={d} tab={page} />;
      case 'delegations': return <LoisPage s={s} d={d} tab={page} />;
      case 'delegationsyndicale': return <LoisPage s={s} d={d} tab={page} />;
      case 'egalitehf': return <LoisPage s={s} d={d} tab={page} />;
      case 'electionsociales': return <LoisPage s={s} d={d} tab={page} />;
      case 'formationsec': return <LoisPage s={s} d={d} tab={page} />;
      case 'lanceursalerte': return <LoisPage s={s} d={d} tab={page} />;
      case 'plandiversite': return <LoisPage s={s} d={d} tab={page} />;
      case 'social': return <LoisPage s={s} d={d} tab={page} />;
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
      case 'archives': return <SecurityPage s={s} d={d} tab={page} />;
      case 'auditfiscale': return <AuditCodePage s={s} d={d} tab={page} />;
      case 'audittrail': return <AuditCodePage s={s} d={d} tab={page} />;
      case 'authroles': return <RolesPermissionsPage s={s} d={d} tab={page} />;
      case 'autoindex': return <PayrollGroupPg s={s} d={d} tab={page} />;
      case 'autopilot': return <SmartOpsPage s={s} d={d} tab={page} />;
      case 'cgvsaas': return <DocumentGeneratorPgW s={s} d={d} tab={page} />;
      case 'changelog': return <AdminPage s={s} d={d} tab={page} />;
      case 'demodonnees': return <AdminPage s={s} d={d} tab={page} />;
      case 'ged': return <SecurityPage s={s} d={d} tab={page} />;
      case 'historique': return <AdminPage s={s} d={d} tab={page} />;
      case 'integrations': return <AdminPage s={s} d={d} tab={page} />;
      case 'massengine': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'mentionslegales': return <DocumentGeneratorPgW s={s} d={d} tab={page} />;
      case 'monitoring': return <AdminPage s={s} d={d} tab={page} />;
      case 'piloteauto': return <SmartOpsPage s={s} d={d} tab={page} />;
      case 'queue': return <ModsBatch2Pg s={s} d={d} tab={page} />;
      case 'rgpd': return <CompliancePage s={s} d={d} tab={page} />;
      case 'roadmapinfra': return <AdminPage s={s} d={d} tab={page} />;
      case 'support': return <NotificationCenterPgW s={s} d={d} tab={page} />;
      case 'team': return <EmployeeHubPage s={s} d={d} tab={page} />;
      case 'testsuite': return <AuditCodePage s={s} d={d} tab={page} />;
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
            const q = searchQuery.toLowerCase();
            const results = MENU.filter(m => !m.group && (
              m.label.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
            )).slice(0, 8);
            const groupName = (g) => GROUPS.find(gr => gr.id === `_g${g}`)?.label || '';
            return results.length > 0 ? (
              <div style={{
                position: 'absolute', left: 12, right: 12, top: '100%', zIndex: 999,
                background: '#111009', border: '1px solid rgba(198,163,78,.2)',
                borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.6)', overflow: 'hidden',
              }}>
                {results.map(item => (
                  <div key={item.id}
                    onClick={() => { setPage(item.id); setSearchQuery(''); setSearchFocus(false); }}
                    style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,.03)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(198,163,78,.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 11.5, color: '#e8e6e0', fontWeight: 500 }}>{item.label}</div>
                      <div style={{ fontSize: 9.5, color: '#5e5c56', marginTop: 1 }}>{groupName(item.g)}</div>
                    </div>
                  </div>
                ))}
                {results.length === 0 && (
                  <div style={{ padding: '10px 12px', fontSize: 11, color: '#5e5c56', textAlign: 'center' }}>Aucun résultat</div>
                )}
              </div>
            ) : (
              <div style={{
                position: 'absolute', left: 12, right: 12, top: '100%', zIndex: 999,
                background: '#111009', border: '1px solid rgba(198,163,78,.2)',
                borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#5e5c56', textAlign: 'center',
              }}>Aucun résultat</div>
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
                    {group?.icon} {group?.label}
                  </span>
                  <span style={{ fontSize: 10, color: '#5e5c56', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform .15s' }}>▼</span>
                </div>
                {!isCollapsed && items.map(item => (
                  <div key={item.id} onClick={() => setPage(item.id)}
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
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(198,163,78,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', color: '#5e5c56', cursor: 'pointer', fontSize: 16, padding: 4 }}>☰</button>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e8e6e0' }}>{currentItem.icon} {currentItem.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 11, color: '#9e9b93' }}>{user?.email || 'demo'}</span>
            <button onClick={handleLogout}
              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(239,68,68,.15)', background: 'rgba(239,68,68,.05)', color: '#ef4444', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
              Déconnexion
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <ErrorBoundary pageKey={page} label={currentItem?.label}>{renderPage()}</ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
