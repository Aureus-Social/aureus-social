'use client';
// components/Sprint9Sidebar.jsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const modules = [
  { id: 1, name: 'Dimona', icon: '📤', href: '/sprint9/dimona', color: '#3B82F6' },
  { id: 2, name: 'Précompte Pro', icon: '🧮', href: '/sprint9/precompte', color: '#8B5CF6' },
  { id: 3, name: 'ONSS / DmfA', icon: '🏛️', href: '/sprint9/onss', color: '#EF4444' },
  { id: 4, name: 'Bilan Social', icon: '📊', href: '/sprint9/bilan-social', color: '#F59E0B' },
  { id: 5, name: 'Net → Brut', icon: '🔄', href: '/sprint9/net-brut', color: '#10B981' },
  { id: 6, name: 'O.D. Comptables', icon: '📒', href: '/sprint9/od-comptables', color: '#6366F1' },
  { id: 7, name: 'Chèques-repas', icon: '🍽️', href: '/sprint9/cheques-repas', color: '#EC4899' },
  { id: 8, name: 'Trilingue', icon: '🌍', href: '/sprint9/trilingue', color: '#14B8A6' },
  { id: 9, name: 'Vacances', icon: '🏖️', href: '/sprint9/vacances', color: '#F97316' },
  { id: 10, name: 'Enfants & AF', icon: '👶', href: '/sprint9/enfants', color: '#A855F7' },
  { id: 11, name: 'Attestations', icon: '📄', href: '/sprint9/attestations', color: '#0EA5E9' },
  { id: 12, name: 'Exports Excel', icon: '📁', href: '/sprint9/exports', color: '#22C55E' },
  { id: 13, name: 'Barèmes CP', icon: '📋', href: '/sprint9/baremes', color: '#E11D48' },
  { id: 14, name: 'Provisions', icon: '💰', href: '/sprint9/provisions', color: '#7C3AED' },
  { id: 15, name: 'Heures Sup', icon: '⏰', href: '/sprint9/heures-sup', color: '#D97706' },
  { id: 16, name: 'Primes', icon: '🎁', href: '/sprint9/primes', color: '#059669' },
  { id: 17, name: 'Saisies Salaire', icon: '⚖️', href: '/sprint9/saisies', color: '#DC2626' },
];

export default function Sprint9Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-bold text-amber-400">Aureus Social Pro</h2>
        <p className="text-xs text-slate-400 mt-1">Sprint 9 — 17 Modules</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {modules.map(m => {
          const active = pathname === m.href;
          return (
            <Link key={m.id} href={m.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all
                ${active ? 'bg-slate-700 text-white border-l-3 border-amber-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              <span className="text-lg">{m.icon}</span>
              <span className="flex-1">{m.name}</span>
              <span className="text-[10px] text-slate-500">F{m.id}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export { modules };
