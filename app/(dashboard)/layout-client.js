'use client';
import { useState, useReducer, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { MENU, GROUPS, getGroupItems } from '../lib/menu-config';
import { supabase } from '../lib/supabase';

const Loading = () => <div style={{padding:40,textAlign:'center',color:'#5e5c56'}}>Chargement...</div>;

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
            const items = getGroupItems(gNum);
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
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
