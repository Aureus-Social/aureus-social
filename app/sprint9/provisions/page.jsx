'use client';
// app/sprint9/provisions/page.jsx — F14
import { useState, useEffect } from 'react';
import supabase, { rpc, query } from '@/lib/supabase-helpers';

export default function ProvisionsPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [annee, setAnnee] = useState(2026);
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [provisions, setProvisions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadClients(); }, []);
  useEffect(() => { if (clientId) loadProvisions(); }, [clientId, annee]);

  async function loadClients() { const d = await query('clients'); setClients(d || []); if (d?.length) setClientId(d[0].id); }
  async function loadProvisions() {
    const { data } = await supabase.from('comptes_provision').select('*')
      .eq('client_id', clientId).eq('annee', annee).order('type_provision').order('mois');
    setProvisions(data || []);
  }

  async function calculer() {
    setLoading(true);
    try { const r = await rpc('calculer_provisions_mensuelles', { p_client_id: clientId, p_annee: annee, p_mois: mois }); alert(JSON.stringify(r)); loadProvisions(); }
    catch (e) { alert(e.message); }
    setLoading(false);
  }

  const types = { pecule_vacances_simple: { label: 'Pécule simple', color: 'text-blue-600', rate: '8.33%' },
    pecule_vacances_double: { label: 'Pécule double', color: 'text-indigo-600', rate: '7.67%' },
    prime_fin_annee: { label: '13ème mois', color: 'text-purple-600', rate: '8.33%' } };
  
  const grouped = {};
  provisions.forEach(p => { if (!grouped[p.type_provision]) grouped[p.type_provision] = []; grouped[p.type_provision].push(p); });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-800">💰 Provisions</h1><p className="text-slate-500 text-sm">Pécules vacances et prime de fin d'année</p></div>
        <div className="flex gap-2">
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</select>
          <select value={annee} onChange={e => setAnnee(+e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{[2024, 2025, 2026].map(a => <option key={a}>{a}</option>)}</select>
          <select value={mois} onChange={e => setMois(+e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>Mois {i + 1}</option>)}</select>
          <button onClick={calculer} disabled={loading} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-violet-700">Calculer mois {mois}</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.entries(types).map(([key, t]) => {
          const items = grouped[key] || [];
          const lastItem = items[items.length - 1];
          return (
            <div key={key} className="bg-white p-5 rounded-xl border shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500">{t.label} ({t.rate})</p>
                  <p className={`text-2xl font-bold font-mono ${t.color} mt-1`}>{lastItem?.montant_cumule?.toFixed(2) || '0.00'} €</p>
                  <p className="text-xs text-slate-400 mt-1">cumulé {annee}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Dernier mois</p>
                  <p className="text-sm font-mono">{lastItem?.montant_provision?.toFixed(2) || '—'} €</p>
                  <p className="text-xs text-slate-400">ONSS: {lastItem?.onss_provision?.toFixed(2) || '—'} €</p>
                </div>
              </div>
              {/* Mini sparkline */}
              <div className="flex gap-0.5 mt-3 h-8 items-end">
                {items.map(p => (
                  <div key={p.mois} className={`flex-1 rounded-t ${t.color.replace('text', 'bg')} bg-opacity-30`}
                    style={{ height: `${Math.min(100, (p.montant_provision || 0) / (Math.max(...items.map(i => i.montant_provision || 1))) * 100)}%` }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr>{['Type', 'Mois', 'Base calcul', 'Taux', 'Dotation', 'Cumulé', 'Utilisé', 'Solde', 'ONSS'].map(h =>
            <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {provisions.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 text-xs">{types[p.type_provision]?.label || p.type_provision}</td>
                <td className="px-3 py-2 font-medium">{p.mois}/{p.annee}</td>
                <td className="px-3 py-2 font-mono">{p.base_calcul?.toFixed(2)} €</td>
                <td className="px-3 py-2">{(p.taux_provision * 100).toFixed(2)}%</td>
                <td className="px-3 py-2 font-mono">{p.montant_provision?.toFixed(2)} €</td>
                <td className="px-3 py-2 font-mono font-medium">{p.montant_cumule?.toFixed(2)} €</td>
                <td className="px-3 py-2 font-mono">{p.montant_utilise?.toFixed(2)} €</td>
                <td className="px-3 py-2 font-mono text-green-600">{p.solde_provision?.toFixed(2)} €</td>
                <td className="px-3 py-2 font-mono text-xs">{p.onss_provision?.toFixed(2)} €</td>
              </tr>
            ))}
            {!provisions.length && <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Aucune provision. Calculez un mois.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
