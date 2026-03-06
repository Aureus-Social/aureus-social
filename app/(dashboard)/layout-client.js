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
  render() {
    if (this.state.hasError) {
      return <div style={{padding:40,textAlign:'center'}}>
        <div style={{fontSize:16,fontWeight:700,color:'#c6a34e',marginBottom:8}}>Module en cours de chargement</div>
        <div style={{fontSize:11,color:'#5e5c56',marginBottom:16}}>Ce module sera disponible prochainement.</div>
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
const AnalyticsPage = dynamic(() => import('../pages/AnalyticsDashboard'), { ssr: false, loading: Loading });
const AdminBaremesPage = dynamic(() => import('../pages/AdminBaremes'), { ssr: false, loading: Loading });
const AuditCodePage = dynamic(() => import('../pages/AuditSecuriteCode'), { ssr: false, loading: Loading });
const PayrollSimPage = dynamic(() => import('../pages/PayrollSimulator'), { ssr: false, loading: Loading });
const AureusIAPage = dynamic(() => import('../pages/AureusSuitePage'), { ssr: false, loading: Loading });
const EmployeeHubPage = dynamic(() => import('../pages/EmployeeHub'), { ssr: false, loading: Loading });
const SmartOpsPage = dynamic(() => import('../pages/SmartOpsCenter'), { ssr: false, loading: Loading });
const CompliancePage = dynamic(() => import('../pages/ComplianceDashboard'), { ssr: false, loading: Loading });
const SecurityPage = dynamic(() => import('../pages/SecurityDashboard'), { ssr: false, loading: Loading });
const RelancesPage = dynamic(() => import('../pages/RelancesFacturation'), { ssr: false, loading: Loading });
const PrimesPage = dynamic(() => import('../pages/PrimesAvantagesV2'), { ssr: false, loading: Loading });

const AbsencesContratsV3Pg = dynamic(() => import('../pages/AbsencesContratsV3'), { ssr: false, loading: Loading });
const CommissionsModulePg = dynamic(() => import('../pages/CommissionsModule'), { ssr: false, loading: Loading });
const DocumentGeneratorPg = dynamic(() => import('../pages/DocumentGenerator'), { ssr: false, loading: Loading });
const EmployeePlanningPg = dynamic(() => import('../pages/EmployeePlanning'), { ssr: false, loading: Loading });
const NotificationCenterPg = dynamic(() => import('../pages/NotificationCenter'), { ssr: false, loading: Loading });
const PayrollGroupPg = dynamic(() => import('../pages/PayrollGroup'), { ssr: false, loading: Loading });
const PortalSystemPg = dynamic(() => import('../pages/PortalSystem'), { ssr: false, loading: Loading });
const TransversalCPPg = dynamic(() => import('../pages/TransversalCP'), { ssr: false, loading: Loading });

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
function DashboardHome({ state }) {
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
      case 'dashboard': return <DashboardPage s={s} d={d} />;
      case 'employees': return <EmployeesPage s={s} d={d} />;
      case 'payslip': return <PayslipsPage s={s} d={d} />;
      case 'declarations': case 'onss': return <DimonaPageComp s={s} d={d} />;
      case 'admin': return <AdminPage s={s} d={d} />;
      case 'baremescp': return <BaremesCPPage s={s} d={d} />;
      case 'calcinstant': return <SimuNetBrutPage s={s} d={d} />;
      case 'diagnostic': case 'diagnosticv': return <DiagnosticPage s={s} d={d} />;
      case 'seuilssociaux': return <SeuilsPage s={s} d={d} />;
      case 'onboarding': case 'onboardwizard': return <OnboardingPage s={s} d={d} />;
      case 'cloture': return <CloturePage s={s} d={d} />;
      case 'analytics': return <AnalyticsPage s={s} d={d} />;
      case 'adminbaremes': return <AdminBaremesPage s={s} d={d} />;
      case 'auditsecuritecode': return <AuditCodePage s={s} d={d} />;
      case 'optifiscale': case 'couttotal': return <PayrollSimPage s={s} d={d} />;
      case 'aureussuite': return <AureusIAPage s={s} d={d} />;
      case 'dashrh': return <EmployeeHubPage s={s} d={d} />;
      case 'commandcenter': return <SmartOpsPage s={s} d={d} />;
      case 'compliance': return <CompliancePage s={s} d={d} />;
      case 'securitedata': return <SecurityPage s={s} d={d} />;
      case 'facturation': return <RelancesPage s={s} d={d} />;
      case 'gestionprimes': return <PrimesPage s={s} d={d} />;
      case 'seuilssociaux': return <LoisPage s={s} d={d} />;
      case 'accidentTravail': return <PlaceholderPage id='accidentTravail' label='accidentTravail' />;
      case 'actionsrapides': return <PlaceholderPage id='actionsrapides' label='actionsrapides' />;
      case 'annexeReglement': return <PlaceholderPage id='annexeReglement' label='annexeReglement' />;
      case 'archives': return <PlaceholderPage id='archives' label='archives' />;
      case 'auditfiscale': return <PlaceholderPage id='auditfiscale' label='auditfiscale' />;
      case 'audittrail': return <PlaceholderPage id='audittrail' label='audittrail' />;
      case 'authroles': return <PlaceholderPage id='authroles' label='authroles' />;
      case 'autoindex': return <PayrollGroupPg s={s} d={d} />;
      case 'autopilot': return <PlaceholderPage id='autopilot' label='autopilot' />;
      case 'avantages': return <PlaceholderPage id='avantages' label='avantages' />;
      case 'baremespp': return <TransversalCPPg s={s} d={d} />;
      case 'batchdecl': return <PlaceholderPage id='batchdecl' label='batchdecl' />;
      case 'belcotax281': return <PlaceholderPage id='belcotax281' label='belcotax281' />;
      case 'bilansocial': return <PlaceholderPage id='bilansocial' label='bilansocial' />;
      case 'budget': return <PayrollGroupPg s={s} d={d} />;
      case 'calcmaladie': return <PlaceholderPage id='calcmaladie' label='calcmaladie' />;
      case 'calendrier': return <PlaceholderPage id='calendrier' label='calendrier' />;
      case 'ccts': return <PlaceholderPage id='ccts' label='ccts' />;
      case 'cgvsaas': return <PlaceholderPage id='cgvsaas' label='cgvsaas' />;
      case 'changelog': return <PlaceholderPage id='changelog' label='changelog' />;
      case 'chargessociales': return <PlaceholderPage id='chargessociales' label='chargessociales' />;
      case 'checklistclient': return <CommissionsModulePg s={s} d={d} />;
      case 'chomagetemporaire': return <PlaceholderPage id='chomagetemporaire' label='chomagetemporaire' />;
      case 'comparateur': return <PlaceholderPage id='comparateur' label='comparateur' />;
      case 'comparatif': return <CommissionsModulePg s={s} d={d} />;
      case 'compteIndividuel': return <PlaceholderPage id='compteIndividuel' label='compteIndividuel' />;
      case 'compteindividuelannuel': return <PlaceholderPage id='compteindividuelannuel' label='compteindividuelannuel' />;
      case 'contratgen': return <DocumentGeneratorPg s={s} d={d} />;
      case 'contratsmenu': return <DocumentGeneratorPg s={s} d={d} />;
      case 'coutsannuel': return <PayrollGroupPg s={s} d={d} />;
      case 'dashabsent': return <AbsencesContratsV3Pg s={s} d={d} />;
      case 'delegations': return <PlaceholderPage id='delegations' label='delegations' />;
      case 'delegationsyndicale': return <PlaceholderPage id='delegationsyndicale' label='delegationsyndicale' />;
      case 'demodonnees': return <PlaceholderPage id='demodonnees' label='demodonnees' />;
      case 'echeancier': return <PayrollGroupPg s={s} d={d} />;
      case 'egalitehf': return <PlaceholderPage id='egalitehf' label='egalitehf' />;
      case 'electionsociales': return <PlaceholderPage id='electionsociales' label='electionsociales' />;
      case 'exportWinbooks': return <PlaceholderPage id='exportWinbooks' label='exportWinbooks' />;
      case 'exportbatch': return <PlaceholderPage id='exportbatch' label='exportbatch' />;
      case 'exportcoda': return <PlaceholderPage id='exportcoda' label='exportcoda' />;
      case 'exportcompta': return <PlaceholderPage id='exportcompta' label='exportcompta' />;
      case 'exportcomptapro': return <PlaceholderPage id='exportcomptapro' label='exportcomptapro' />;
      case 'fiduciaire': return <PlaceholderPage id='fiduciaire' label='fiduciaire' />;
      case 'fiscal': return <PlaceholderPage id='fiscal' label='fiscal' />;
      case 'flexijobs': return <PlaceholderPage id='flexijobs' label='flexijobs' />;
      case 'formC131': return <PlaceholderPage id='formC131' label='formC131' />;
      case 'formC4': return <PlaceholderPage id='formC4' label='formC4' />;
      case 'formationsec': return <PlaceholderPage id='formationsec' label='formationsec' />;
      case 'ged': return <PlaceholderPage id='ged' label='ged' />;
      case 'gendocsjur': return <PlaceholderPage id='gendocsjur' label='gendocsjur' />;
      case 'gestionabs': return <AbsencesContratsV3Pg s={s} d={d} />;
      case 'guidecommercial': return <PlaceholderPage id='guidecommercial' label='guidecommercial' />;
      case 'guidefiduciaire': return <PlaceholderPage id='guidefiduciaire' label='guidefiduciaire' />;
      case 'historique': return <PlaceholderPage id='historique' label='historique' />;
      case 'importcsv': return <PlaceholderPage id='importcsv' label='importcsv' />;
      case 'integrations': return <PlaceholderPage id='integrations' label='integrations' />;
      case 'interimaires': return <PlaceholderPage id='interimaires' label='interimaires' />;
      case 'journal': return <PlaceholderPage id='journal' label='journal' />;
      case 'joursPrestes': return <PayrollGroupPg s={s} d={d} />;
      case 'lanceursalerte': return <PlaceholderPage id='lanceursalerte' label='lanceursalerte' />;
      case 'landing': return <PlaceholderPage id='landing' label='landing' />;
      case 'legal': return <PlaceholderPage id='legal' label='legal' />;
      case 'massengine': return <PlaceholderPage id='massengine' label='massengine' />;
      case 'mentionslegales': return <PlaceholderPage id='mentionslegales' label='mentionslegales' />;
      case 'monitoring': return <PlaceholderPage id='monitoring' label='monitoring' />;
      case 'notifications': return <NotificationCenterPg s={s} d={d} />;
      case 'parserConcurrent': return <PlaceholderPage id='parserConcurrent' label='parserConcurrent' />;
      case 'piloteauto': return <PlaceholderPage id='piloteauto' label='piloteauto' />;
      case 'plandiversite': return <PlaceholderPage id='plandiversite' label='plandiversite' />;
      case 'planifconges': return <AbsencesContratsV3Pg s={s} d={d} />;
      case 'portail': return <PortalSystemPg s={s} d={d} />;
      case 'portailclient': return <PortalSystemPg s={s} d={d} />;
      case 'portalmanager': return <PortalSystemPg s={s} d={d} />;
      case 'proceduresrh': return <PlaceholderPage id='proceduresrh' label='proceduresrh' />;
      case 'queue': return <PlaceholderPage id='queue' label='queue' />;
      case 'rapportce': return <PlaceholderPage id='rapportce' label='rapportce' />;
      case 'rapports': return <PlaceholderPage id='rapports' label='rapports' />;
      case 'rapportsrole': return <PlaceholderPage id='rapportsrole' label='rapportsrole' />;
      case 'registrepersonnel': return <EmployeePlanningPg s={s} d={d} />;
      case 'regulPP': return <PayrollGroupPg s={s} d={d} />;
      case 'reporting': return <PlaceholderPage id='reporting' label='reporting' />;
      case 'reportingpro': return <PlaceholderPage id='reportingpro' label='reportingpro' />;
      case 'repriseclient': return <PlaceholderPage id='repriseclient' label='repriseclient' />;
      case 'rgpd': return <PlaceholderPage id='rgpd' label='rgpd' />;
      case 'rh': return <PlaceholderPage id='rh' label='rh' />;
      case 'roadmapinfra': return <PlaceholderPage id='roadmapinfra' label='roadmapinfra' />;
      case 'salaires': return <PlaceholderPage id='salaires' label='salaires' />;
      case 'sepa': return <PlaceholderPage id='sepa' label='sepa' />;
      case 'simembauche': return <PlaceholderPage id='simembauche' label='simembauche' />;
      case 'simulateurspro': return <PlaceholderPage id='simulateurspro' label='simulateurspro' />;
      case 'simulicenciement': return <PlaceholderPage id='simulicenciement' label='simulicenciement' />;
      case 'simupension': return <PlaceholderPage id='simupension' label='simupension' />;
      case 'simutp': return <PlaceholderPage id='simutp' label='simutp' />;
      case 'smartalerts': return <NotificationCenterPg s={s} d={d} />;
      case 'social': return <PlaceholderPage id='social' label='social' />;
      case 'soldetoutcompte': return <PlaceholderPage id='soldetoutcompte' label='soldetoutcompte' />;
      case 'support': return <PlaceholderPage id='support' label='support' />;
      case 'tbdirection': return <PlaceholderPage id='tbdirection' label='tbdirection' />;
      case 'team': return <PlaceholderPage id='team' label='team' />;
      case 'testsuite': return <PlaceholderPage id='testsuite' label='testsuite' />;
      case 'timeline': return <PayrollGroupPg s={s} d={d} />;
      case 'validation': return <PayrollGroupPg s={s} d={d} />;
      case 'vehiculesatn': return <PlaceholderPage id='vehiculesatn' label='vehiculesatn' />;
      case 'workflowAbs': return <AbsencesContratsV3Pg s={s} d={d} />;
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
          <ErrorBoundary>{renderPage()}</ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
