'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const modules = [
  { href: '/sprint9/dimona', label: 'Dimona', icon: '1' },
  { href: '/sprint9/precompte', label: 'Precompte Pro', icon: '2' },
  { href: '/sprint9/onss', label: 'ONSS / DmfA', icon: '3' },
  { href: '/sprint9/bilan-social', label: 'Bilan Social', icon: '4' },
  { href: '/sprint9/net-brut', label: 'Net vers Brut', icon: '5' },
  { href: '/sprint9/od-comptables', label: 'O.D. Comptables', icon: '6' },
  { href: '/sprint9/cheques-repas', label: 'Cheques-repas', icon: '7' },
  { href: '/sprint9/trilingue', label: 'Trilingue FR/NL/DE', icon: '8' },
  { href: '/sprint9/vacances', label: 'Vacances Annuelles', icon: '9' },
  { href: '/sprint9/enfants', label: 'Enfants et AF', icon: '10' },
  { href: '/sprint9/attestations', label: 'Attestations', icon: '11' },
  { href: '/sprint9/exports', label: 'Exports', icon: '12' },
  { href: '/sprint9/baremes', label: 'Baremes CP', icon: '13' },
  { href: '/sprint9/provisions', label: 'Provisions', icon: '14' },
  { href: '/sprint9/heures-sup', label: 'Heures Sup', icon: '15' },
  { href: '/sprint9/primes', label: 'Primes', icon: '16' },
  { href: '/sprint9/saisies', label: 'Saisies Salaire', icon: '17' },
];

export default function Sprint9Layout({ children }) {
  const pathname = usePathname();

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0a0e1a',
      color: '#e2e8f0',
      fontFamily: "'Outfit', system-ui, sans-serif"
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: '#0d1117',
        borderRight: '1px solid #1e293b',
        padding: '16px 0',
        overflowY: 'auto',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        {/* Header */}
        <div style={{ padding: '8px 16px 16px', borderBottom: '1px solid #1e293b', marginBottom: 8 }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b', fontSize: 12, display: 'block', marginBottom: 8 }}>
            ← Retour Tableau de bord
          </Link>
          <div style={{ color: '#c9a227', fontWeight: 700, fontSize: 15 }}>Sprint 9</div>
          <div style={{ color: '#64748b', fontSize: 11 }}>17 Modules Avances</div>
        </div>

        {/* Nav items */}
        {modules.map((m) => {
          const active = pathname === m.href;
          return (
            <Link key={m.href} href={m.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 16px',
                fontSize: 13,
                color: active ? '#c9a227' : '#94a3b8',
                background: active ? 'rgba(201,162,39,0.08)' : 'transparent',
                borderLeft: active ? '3px solid #c9a227' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#e2e8f0'; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: 5,
                  background: active ? '#c9a227' : '#1e293b',
                  color: active ? '#0a0e1a' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, flexShrink: 0
                }}>
                  {m.icon}
                </span>
                <span style={{ fontWeight: active ? 600 : 400 }}>{m.label}</span>
              </div>
            </Link>
          );
        })}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
        <style>{`
          /* Sprint 9 Dark Theme Overrides */
          .s9-page h1, .s9-page h2, .s9-page h3 { color: #f1f5f9; }
          .s9-page h1 { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
          .s9-page h2 { font-size: 18px; font-weight: 600; margin: 16px 0 8px; color: #c9a227; }
          .s9-page p { color: #94a3b8; margin: 0 0 20px; font-size: 14px; }

          .s9-page select, .s9-page input, .s9-page textarea {
            background: #131825 !important;
            border: 1px solid #1e293b !important;
            color: #e2e8f0 !important;
            padding: 8px 12px !important;
            border-radius: 6px !important;
            font-size: 13px !important;
            outline: none !important;
          }
          .s9-page select:focus, .s9-page input:focus, .s9-page textarea:focus {
            border-color: #c9a227 !important;
          }

          .s9-page button {
            background: #c9a227 !important;
            color: #0a0e1a !important;
            border: none !important;
            padding: 8px 16px !important;
            border-radius: 6px !important;
            font-weight: 600 !important;
            font-size: 13px !important;
            cursor: pointer !important;
            transition: opacity 0.15s !important;
          }
          .s9-page button:hover { opacity: 0.85 !important; }

          .s9-page table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 12px 0 !important;
            font-size: 13px !important;
          }
          .s9-page th {
            background: #131825 !important;
            color: #c9a227 !important;
            padding: 10px 12px !important;
            text-align: left !important;
            font-weight: 600 !important;
            border-bottom: 2px solid #1e293b !important;
            font-size: 12px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
          }
          .s9-page td {
            padding: 10px 12px !important;
            border-bottom: 1px solid #1e293b !important;
            color: #e2e8f0 !important;
          }
          .s9-page tr:hover td {
            background: rgba(201,162,39,0.04) !important;
          }

          .s9-page label {
            color: #94a3b8 !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.3px !important;
          }

          /* KPI cards */
          .s9-page .kpi, .s9-page div[style*="border-radius"] {
            background: #131825;
            border: 1px solid #1e293b;
          }

          /* Scrollbar */
          .s9-page ::-webkit-scrollbar { width: 6px; }
          .s9-page ::-webkit-scrollbar-track { background: #0a0e1a; }
          .s9-page ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }

          /* Status badges */
          .s9-page span[style*="background"] {
            border-radius: 12px !important;
            padding: 2px 10px !important;
            font-size: 11px !important;
            font-weight: 600 !important;
          }

          /* Monospace for numbers */
          .s9-page td:nth-child(n+3) { font-family: 'JetBrains Mono', monospace; }

          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        `}</style>
        <div className="s9-page">
          {children}
        </div>
      </main>
    </div>
  );
}
