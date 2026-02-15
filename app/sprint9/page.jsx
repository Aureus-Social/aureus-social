'use client';
// app/sprint9/page.jsx — Sprint 9 Index
import Link from 'next/link';

const modules = [
  { href: '/sprint9/dimona', label: 'Dimona', desc: 'Declarations entree/sortie travailleurs', icon: '1' },
  { href: '/sprint9/precompte', label: 'Precompte Professionnel', desc: 'Calcul PP 2026 avec bareme', icon: '2' },
  { href: '/sprint9/onss', label: 'ONSS / DmfA', desc: 'Declarations trimestrielles ONSS', icon: '3' },
  { href: '/sprint9/bilan-social', label: 'Bilan Social', desc: 'Bilan social annuel BNB', icon: '4' },
  { href: '/sprint9/net-brut', label: 'Net vers Brut', desc: 'Calculateur inverse Net vers Brut', icon: '5' },
  { href: '/sprint9/od-comptables', label: 'O.D. Comptables', desc: 'Ecritures comptables de paie', icon: '6' },
  { href: '/sprint9/cheques-repas', label: 'Cheques-repas', desc: 'Gestion titres-repas', icon: '7' },
  { href: '/sprint9/trilingue', label: 'Trilingue FR/NL/DE', desc: 'Traductions officielles', icon: '8' },
  { href: '/sprint9/vacances', label: 'Vacances Annuelles', desc: 'Droits conges et pecule', icon: '9' },
  { href: '/sprint9/enfants', label: 'Enfants et Allocations', desc: 'Enfants a charge et allocations familiales', icon: '10' },
  { href: '/sprint9/attestations', label: 'Attestations', desc: 'Generation documents officiels', icon: '11' },
  { href: '/sprint9/exports', label: 'Exports', desc: 'Export CSV/JSON des donnees', icon: '12' },
  { href: '/sprint9/baremes', label: 'Baremes CP', desc: 'Baremes salariaux par commission paritaire', icon: '13' },
  { href: '/sprint9/provisions', label: 'Provisions', desc: 'Provisions pecule, 13eme mois', icon: '14' },
  { href: '/sprint9/heures-sup', label: 'Heures Supplementaires', desc: 'Gestion heures sup et sursalaire', icon: '15' },
  { href: '/sprint9/primes', label: 'Primes Sectorielles', desc: 'Primes et bonus par secteur', icon: '16' },
  { href: '/sprint9/saisies', label: 'Saisies sur Salaire', desc: 'Saisies, cessions et retenues', icon: '17' },
];

export default function Sprint9Index() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#c9a227', margin: 0 }}>
            Sprint 9 — Modules Avances
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 16, marginTop: 8 }}>
            Aureus Social Pro — 17 modules de gestion de paie belge
          </p>
          <a href="/" style={{ color: '#c9a227', fontSize: 14, textDecoration: 'none' }}>
            Retour au tableau de bord
          </a>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16
        }}>
          {modules.map((m) => (
            <Link key={m.href} href={m.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                background: '#131825',
                border: '1px solid #1e293b',
                borderRadius: 10,
                padding: '20px 24px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a227'; e.currentTarget.style.background = '#1a2035'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.background = '#131825'; }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 8,
                  background: '#c9a227', color: '#0a0e1a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16, flexShrink: 0
                }}>
                  {m.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9' }}>{m.label}</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{m.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
