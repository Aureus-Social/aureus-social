/**
 * AUREUS SOCIAL PRO — Code Splitting
 * Remplace les imports statiques des 8 GroupModules
 * 
 * AVANT (bundle 526 kB chargé intégralement au démarrage):
 *   import DashboardGroup from './modules/DashboardGroup'
 *   import PayrollGroup from './modules/PayrollGroup'
 *   ...
 * 
 * APRÈS (bundle initial ~80 kB, modules chargés à la demande):
 *   const DashboardGroup = lazy(() => import('./modules/DashboardGroup'))
 *   ...
 * 
 * INSTRUCTION D'INTÉGRATION:
 * 1. Remplacer le bloc d'imports en haut de SprintComponents.js / AureusSocialPro.js
 * 2. Wrapper le switch/case principal avec <Suspense>
 * 3. Ajouter le composant <ModuleLoader> ci-dessous
 */

import { lazy, Suspense } from 'react';

// ─── Imports dynamiques — chaque module chargé uniquement quand nécessaire
export const DashboardGroup = lazy(() =>
  import('./modules/DashboardGroup').catch(() => ({ default: () => <ModuleError name="Dashboard" /> }))
);

export const PayrollGroup = lazy(() =>
  import('./modules/PayrollGroup').catch(() => ({ default: () => <ModuleError name="Payroll" /> }))
);

export const HRGroup = lazy(() =>
  import('./modules/HRGroup').catch(() => ({ default: () => <ModuleError name="RH" /> }))
);

export const DeclarationsGroup = lazy(() =>
  import('./modules/DeclarationsGroup').catch(() => ({ default: () => <ModuleError name="Déclarations" /> }))
);

export const AdminGroup = lazy(() =>
  import('./modules/AdminGroup').catch(() => ({ default: () => <ModuleError name="Admin" /> }))
);

export const AutomationGroup = lazy(() =>
  import('./modules/AutomationGroup').catch(() => ({ default: () => <ModuleError name="Automatisation" /> }))
);

export const CommercialGroup = lazy(() =>
  import('./modules/CommercialGroup').catch(() => ({ default: () => <ModuleError name="Commercial" /> }))
);

export const UtilsGroup = lazy(() =>
  import('./modules/UtilsGroup').catch(() => ({ default: () => <ModuleError name="Utilitaires" /> }))
);

// ─── Préchargement intelligent — au hover sur un lien de navigation
// Appeler au survol du menu pour anticiper le clic
export const preloadModule = {
  dashboard: () => import('./modules/DashboardGroup'),
  payroll:   () => import('./modules/PayrollGroup'),
  hr:        () => import('./modules/HRGroup'),
  decl:      () => import('./modules/DeclarationsGroup'),
  admin:     () => import('./modules/AdminGroup'),
  auto:      () => import('./modules/AutomationGroup'),
  commercial:() => import('./modules/CommercialGroup'),
  utils:     () => import('./modules/UtilsGroup'),
};

// ─── Skeleton de chargement — affiché pendant le lazy load
const ModuleSkeleton = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: 16,
    padding: 32, animation: 'pulse 1.5s ease-in-out infinite',
  }}>
    <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }`}</style>
    {[...Array(3)].map((_, i) => (
      <div key={i} style={{
        height: i === 0 ? 48 : 120,
        borderRadius: 12,
        background: 'linear-gradient(90deg, rgba(198,163,78,.08), rgba(198,163,78,.15), rgba(198,163,78,.08))',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }} />
    ))}
    <style>{`@keyframes shimmer { 0%{background-position:200%} 100%{background-position:-200%} }`}</style>
  </div>
);

// ─── Fallback d'erreur module
const ModuleError = ({ name }) => (
  <div style={{
    padding: 32, textAlign: 'center', color: '#f87171',
    border: '1px solid rgba(248,113,113,.2)', borderRadius: 12, margin: 16,
  }}>
    <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
    <div style={{ fontWeight: 600, marginBottom: 8 }}>Module {name} temporairement indisponible</div>
    <button
      onClick={() => window.location.reload()}
      style={{
        padding: '8px 16px', borderRadius: 8, border: 'none',
        background: 'rgba(248,113,113,.1)', color: '#f87171', cursor: 'pointer',
      }}
    >
      Recharger
    </button>
  </div>
);

/**
 * Wrapper Suspense à utiliser autour du switch/case principal
 * 
 * EXEMPLE D'UTILISATION dans AureusSocialPro.js:
 * 
 * <ModuleLoader>
 *   {page === 'dashboard' && <DashboardGroup {...props} />}
 *   {page === 'employees' && <PayrollGroup section="employees" {...props} />}
 *   ...
 * </ModuleLoader>
 */
export const ModuleLoader = ({ children }) => (
  <Suspense fallback={<ModuleSkeleton />}>
    {children}
  </Suspense>
);

// ─── HOC pour envelopper les routes avec Suspense individuellement
export const withLazy = (Component) => (props) => (
  <Suspense fallback={<ModuleSkeleton />}>
    <Component {...props} />
  </Suspense>
);
