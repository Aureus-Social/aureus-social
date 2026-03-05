// Pages registry - auto-generated
// 19 pages disponibles
const dashboardPage = dynamic(() => import('../pages/dashboard'), { ssr: false, loading: () => <Loading /> });
const employeesPage = dynamic(() => import('../pages/employees'), { ssr: false, loading: () => <Loading /> });
const payslipsPage = dynamic(() => import('../pages/payslips'), { ssr: false, loading: () => <Loading /> });
const dimonaPage = dynamic(() => import('../pages/dimona'), { ssr: false, loading: () => <Loading /> });
const adminPage = dynamic(() => import('../pages/admin'), { ssr: false, loading: () => <Loading /> });
const PayrollGroupPage = dynamic(() => import('../pages/PayrollGroup'), { ssr: false, loading: () => <Loading /> });
const BaremesCPPage = dynamic(() => import('../pages/BaremesCP'), { ssr: false, loading: () => <Loading /> });
const SimulateurNetBrutPage = dynamic(() => import('../pages/SimulateurNetBrut'), { ssr: false, loading: () => <Loading /> });
const SeuilsSociauxPage = dynamic(() => import('../pages/SeuilsSociaux'), { ssr: false, loading: () => <Loading /> });
const PrimesAvantagesV2Page = dynamic(() => import('../pages/PrimesAvantagesV2'), { ssr: false, loading: () => <Loading /> });
const OnboardingHubPage = dynamic(() => import('../pages/OnboardingHub'), { ssr: false, loading: () => <Loading /> });
const ClotureMensuellePage = dynamic(() => import('../pages/ClotureMensuelle'), { ssr: false, loading: () => <Loading /> });
const AnalyticsDashboardPage = dynamic(() => import('../pages/AnalyticsDashboard'), { ssr: false, loading: () => <Loading /> });
const ComplianceDashboardPage = dynamic(() => import('../pages/ComplianceDashboard'), { ssr: false, loading: () => <Loading /> });
const SecurityDashboardPage = dynamic(() => import('../pages/SecurityDashboard'), { ssr: false, loading: () => <Loading /> });
const AdminBaremesPage = dynamic(() => import('../pages/AdminBaremes'), { ssr: false, loading: () => <Loading /> });
const RelancesFacturationPage = dynamic(() => import('../pages/RelancesFacturation'), { ssr: false, loading: () => <Loading /> });
const AureusSuitePagePage = dynamic(() => import('../pages/AureusSuitePage'), { ssr: false, loading: () => <Loading /> });
const PayrollSimulatorPage = dynamic(() => import('../pages/PayrollSimulator'), { ssr: false, loading: () => <Loading /> });

// Router
export function routePage(page, state, dispatch) {
  switch(page) {
    case 'dashboard': return <dashboardPage s={state} d={dispatch} />;
    case 'employees': return <employeesPage s={state} d={dispatch} />;
    case 'payslip': return <payslipsPage s={state} d={dispatch} />;
    case 'declarations': return <dimonaPage s={state} d={dispatch} />;
    case 'admin': return <adminPage s={state} d={dispatch} />;
    case 'gestionprimes': return <PayrollGroupPage s={state} d={dispatch} />;
    case 'baremescp': return <BaremesCPPage s={state} d={dispatch} />;
    case 'calcinstant': return <SimulateurNetBrutPage s={state} d={dispatch} />;
    case 'seuilssociaux': return <SeuilsSociauxPage s={state} d={dispatch} />;
    case 'proceduresrh': return <PrimesAvantagesV2Page s={state} d={dispatch} />;
    case 'onboarding': return <OnboardingHubPage s={state} d={dispatch} />;
    case 'cloture': return <ClotureMensuellePage s={state} d={dispatch} />;
    case 'analytics': return <AnalyticsDashboardPage s={state} d={dispatch} />;
    case 'compliance': return <ComplianceDashboardPage s={state} d={dispatch} />;
    case 'securitedata': return <SecurityDashboardPage s={state} d={dispatch} />;
    case 'adminbaremes': return <AdminBaremesPage s={state} d={dispatch} />;
    case 'facturation': return <RelancesFacturationPage s={state} d={dispatch} />;
    case 'aureussuite': return <AureusSuitePagePage s={state} d={dispatch} />;
    case 'optifiscale': return <PayrollSimulatorPage s={state} d={dispatch} />;
    default: return null;
  }
}
