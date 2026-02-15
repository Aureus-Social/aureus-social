'use client';
// app/sprint9/vacances/page.jsx
import { useState, useEffect } from 'react';
import supabase, { rpc, query } from '@/lib/supabase-helpers';

export default function VacancesPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [annee, setAnnee] = useState(2026);
  const [vacances, setVacances] = useState([]);
  const [suivis, setSuivis] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadClients(); }, []);
  useEffect(() => { if (clientId) loadVacances(); }, [clientId, annee]);

  async function loadClients() { const d = await query('clients'); setClients(d || []); if (d?.length) setClientId(d[0].id); }
  async function loadVacances() {
    const { data } = await supabase.from('vacances_annuelles').select('*, travailleurs(nom, prenom, statut)')
      .eq('client_id', clientId).eq('annee_vacances', annee);
    setVacances(data || []);
  }

  async function calculerTous() {
    setLoading(true);
    const travs = await query('travailleurs', { client_id: clientId });
    for (const t of (travs || []).filter(t => !t.date_sortie)) {
      try { await rpc('calculer_droits_vacances', { p_client_id: clientId, p_trav_id: t.id, p_annee: annee }); } catch (e) { console.error(e); }
    }
    loadVacances(); setLoading(false);
  }

  const totalJours = vacances.reduce((s, v) => s + (v.jours_vacances_legaux || 0), 0);
  const totalPris = vacances.reduce((s, v) => s + (v.jours_vacances_pris || 0), 0);
  const totalSolde = vacances.reduce((s, v) => s + (v.jours_vacances_solde || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🏖️ Vacances Annuelles</h1>
          <p className="text-slate-500 text-sm">Droits, soldes et pécules de vacances</p>
        </div>
        <div className="flex gap-2">
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select value={annee} onChange={e => setAnnee(+e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            {[2024, 2025, 2026].map(a => <option key={a}>{a}</option>)}
          </select>
          <button onClick={calculerTous} disabled={loading}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700">
            {loading ? '⏳ Calcul...' : 'Calculer droits ' + annee}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Travailleurs</p><p className="text-2xl font-bold">{vacances.length}</p></div>
        <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Total jours légaux</p><p className="text-2xl font-bold text-blue-600">{totalJours}</p></div>
        <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Jours pris</p><p className="text-2xl font-bold text-orange-600">{totalPris}</p></div>
        <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Solde restant</p><p className="text-2xl font-bold text-green-600">{totalSolde}</p></div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>{['Travailleur', 'Statut', 'Jours exercice N-1', 'Jours légaux', 'Pris', 'Solde', 'Pécule simple', 'Pécule double', 'Ouvrier brut'].map(h =>
              <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {vacances.map(v => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="px-3 py-3 font-medium">{v.travailleurs?.nom} {v.travailleurs?.prenom}</td>
                <td className="px-3 py-3"><span className={`px-2 py-0.5 rounded text-xs ${v.statut_travailleur === 'ouvrier' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{v.statut_travailleur}</span></td>
                <td className="px-3 py-3 font-mono">{v.jours_prestes_exercice}</td>
                <td className="px-3 py-3 font-mono font-medium">{v.jours_vacances_legaux}</td>
                <td className="px-3 py-3 font-mono">{v.jours_vacances_pris || 0}</td>
                <td className="px-3 py-3 font-mono font-medium text-green-600">{v.jours_vacances_solde}</td>
                <td className="px-3 py-3 font-mono">{v.pecule_simple?.toFixed(2) || '—'}</td>
                <td className="px-3 py-3 font-mono">{v.pecule_double_brut?.toFixed(2) || '—'}</td>
                <td className="px-3 py-3 font-mono">{v.pecule_ouvrier_brut?.toFixed(2) || '—'}</td>
              </tr>
            ))}
            {!vacances.length && <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Cliquez "Calculer droits" pour générer</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
