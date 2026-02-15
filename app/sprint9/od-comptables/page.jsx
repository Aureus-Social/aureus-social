'use client';
// app/sprint9/od-comptables/page.jsx
import { useState, useEffect } from 'react';
import supabase, { rpc, query } from '../../lib/supabase-helpers';

export default function ODComptablesPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [annee, setAnnee] = useState(2026);
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [ods, setOds] = useState([]);
  const [lignes, setLignes] = useState([]);
  const [selectedOd, setSelectedOd] = useState(null);
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadClients(); }, []);
  useEffect(() => { if (clientId) { loadODs(); loadPlan(); } }, [clientId, annee, mois]);

  async function loadClients() { const d = await query('clients'); setClients(d || []); if (d?.length) setClientId(d[0].id); }
  async function loadODs() {
    const { data } = await supabase.from('od_comptables').select('*')
      .eq('client_id', clientId).eq('annee', annee).eq('mois', mois).order('numero_piece');
    setOds(data || []);
  }
  async function loadPlan() { const d = await query('plan_comptable_paie', { client_id: clientId }); setPlan(d || []); }

  async function initPlan() {
    setLoading(true);
    try { const n = await rpc('initialiser_plan_comptable_paie', { p_client_id: clientId }); alert(`${n} comptes créés`); loadPlan(); }
    catch (e) { alert(e.message); }
    setLoading(false);
  }

  async function genererOD() {
    setLoading(true);
    try { await rpc('generer_od_salaires_mensuels', { p_client_id: clientId, p_annee: annee, p_mois: mois }); loadODs(); }
    catch (e) { alert(e.message); }
    setLoading(false);
  }

  async function exporterOD(format) {
    try {
      const result = await rpc('exporter_od_comptable', { p_client_id: clientId, p_annee: annee, p_mois: mois, p_format: format });
      const blob = new Blob([JSON.stringify(result.lignes, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `OD_${annee}_${mois}_${format}.json`; a.click();
    } catch (e) { alert(e.message); }
  }

  async function voirLignes(od) {
    setSelectedOd(od);
    const { data } = await supabase.from('od_lignes').select('*').eq('od_id', od.id).order('numero_ligne');
    setLignes(data || []);
  }

  const moisNoms = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📒 O.D. Comptables</h1>
          <p className="text-slate-500 text-sm">Opérations diverses paie — export BOB50 / WinBooks</p>
        </div>
        <div className="flex gap-2">
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select value={mois} onChange={e => setMois(+e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{moisNoms[i + 1]}</option>)}
          </select>
          <select value={annee} onChange={e => setAnnee(+e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            {[2024, 2025, 2026].map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={initPlan} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
          Initialiser plan comptable
        </button>
        <button onClick={genererOD} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          Générer OD {moisNoms[mois]} {annee}
        </button>
        <button onClick={() => exporterOD('bob50')} className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">Export BOB50</button>
        <button onClick={() => exporterOD('winbooks')} className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">Export WinBooks</button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Plan comptable */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-3 text-sm">Plan comptable paie ({plan.length})</h3>
          <div className="space-y-1 text-xs max-h-96 overflow-y-auto">
            {plan.map(p => (
              <div key={p.id} className="flex justify-between py-1 border-b border-slate-50">
                <span className="font-mono font-medium">{p.numero_compte}</span>
                <span className="text-slate-600 text-right">{p.libelle_fr}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ODs du mois */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {['N° Pièce', 'Type', 'Débit', 'Crédit', 'Équilibré', 'Statut', ''].map(h =>
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y">
                {ods.map(od => (
                  <tr key={od.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => voirLignes(od)}>
                    <td className="px-4 py-3 font-mono text-xs">{od.numero_piece}</td>
                    <td className="px-4 py-3">{od.type_od}</td>
                    <td className="px-4 py-3 font-mono">{od.total_debit?.toFixed(2)} €</td>
                    <td className="px-4 py-3 font-mono">{od.total_credit?.toFixed(2)} €</td>
                    <td className="px-4 py-3">{od.est_equilibre ? '✅' : '❌'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${od.statut === 'valide' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{od.statut}</span></td>
                    <td className="px-4 py-3 text-blue-600 text-xs">Détail →</td>
                  </tr>
                ))}
                {!ods.length && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Aucune OD pour ce mois</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Lignes détail */}
          {selectedOd && lignes.length > 0 && (
            <div className="bg-white p-5 rounded-xl border shadow-sm mt-4">
              <h3 className="font-semibold mb-3 text-sm">Lignes OD: {selectedOd.numero_piece}</h3>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-slate-500 border-b">
                  <th className="pb-2">#</th><th className="pb-2">Compte</th><th className="pb-2">Libellé</th><th className="pb-2 text-right">Débit</th><th className="pb-2 text-right">Crédit</th>
                </tr></thead>
                <tbody>
                  {lignes.map(l => (
                    <tr key={l.id} className="border-b border-slate-50">
                      <td className="py-2">{l.numero_ligne}</td>
                      <td className="py-2 font-mono">{l.numero_compte}</td>
                      <td className="py-2">{l.libelle}</td>
                      <td className="py-2 text-right font-mono">{l.debit > 0 ? l.debit.toFixed(2) : ''}</td>
                      <td className="py-2 text-right font-mono">{l.credit > 0 ? l.credit.toFixed(2) : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
