'use client';
// app/sprint9/cheques-repas/page.jsx
import { useState, useEffect } from 'react';
import supabase, { rpc, query, insert, update } from '@/lib/supabase-helpers';

export default function ChequesRepasPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [annee, setAnnee] = useState(2026);
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [config, setConfig] = useState(null);
  const [cheques, setCheques] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [showConfig, setShowConfig] = useState(false);
  const [configForm, setConfigForm] = useState({ valeur_faciale: 8.00, part_patronale: 6.91, fournisseur: 'edenred', base_calcul: 'jours_prestes' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadClients(); }, []);
  useEffect(() => { if (clientId) { loadConfig(); loadCheques(); loadCommandes(); } }, [clientId, annee, mois]);

  async function loadClients() { const d = await query('clients'); setClients(d || []); if (d?.length) setClientId(d[0].id); }
  async function loadConfig() { const { data } = await supabase.from('config_cheques_repas').select('*').eq('client_id', clientId).eq('actif', true).single(); setConfig(data); if (data) setConfigForm(data); }
  async function loadCheques() { const { data } = await supabase.from('cheques_repas_mensuels').select('*, travailleurs(nom, prenom)').eq('client_id', clientId).eq('annee', annee).eq('mois', mois); setCheques(data || []); }
  async function loadCommandes() { const { data } = await supabase.from('commandes_cheques_repas').select('*').eq('client_id', clientId).eq('annee', annee).eq('mois', mois); setCommandes(data || []); }

  async function saveConfig(e) {
    e.preventDefault(); setLoading(true);
    try {
      if (config) await update('config_cheques_repas', config.id, configForm);
      else await insert('config_cheques_repas', { ...configForm, client_id: clientId });
      setShowConfig(false); loadConfig();
    } catch (e) { alert(e.message); }
    setLoading(false);
  }

  async function calculerMois() {
    setLoading(true);
    try { const r = await rpc('calculer_cheques_repas_mois', { p_client_id: clientId, p_annee: annee, p_mois: mois }); alert(JSON.stringify(r)); loadCheques(); }
    catch (e) { alert(e.message); }
    setLoading(false);
  }

  async function preparerCommande() {
    setLoading(true);
    try { await rpc('preparer_commande_cheques_repas', { p_client_id: clientId, p_annee: annee, p_mois: mois }); loadCommandes(); }
    catch (e) { alert(e.message); }
    setLoading(false);
  }

  const totalCheques = cheques.reduce((s, c) => s + (c.nombre_cheques || 0), 0);
  const totalMontant = cheques.reduce((s, c) => s + (c.montant_total || 0), 0);
  const moisNoms = ['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🍽️ Chèques-repas</h1>
          <p className="text-slate-500 text-sm">Calcul et commande des chèques-repas</p>
        </div>
        <div className="flex gap-2">
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select value={mois} onChange={e => setMois(+e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            {[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>{moisNoms[i + 1]}</option>)}
          </select>
          <button onClick={() => setShowConfig(!showConfig)} className="bg-slate-200 px-3 py-2 rounded-lg text-sm">⚙️ Config</button>
          <button onClick={calculerMois} disabled={loading || !config} className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700">Calculer</button>
          <button onClick={preparerCommande} disabled={loading || !cheques.length} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">Commander</button>
        </div>
      </div>

      {/* Config */}
      {showConfig && (
        <form onSubmit={saveConfig} className="bg-white p-5 rounded-xl border shadow-sm mb-6">
          <h3 className="font-semibold mb-4">Configuration chèques-repas</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Valeur faciale (max 8€)</label>
              <input type="number" step="0.01" max="8" value={configForm.valeur_faciale} onChange={e => setConfigForm({ ...configForm, valeur_faciale: +e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Part patronale (max 6.91€)</label>
              <input type="number" step="0.01" max="6.91" value={configForm.part_patronale} onChange={e => setConfigForm({ ...configForm, part_patronale: +e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Fournisseur</label>
              <select value={configForm.fournisseur} onChange={e => setConfigForm({ ...configForm, fournisseur: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                {['edenred', 'sodexo', 'monizze', 'pluxee'].map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm w-full">Sauvegarder</button>
            </div>
          </div>
        </form>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Travailleurs</p><p className="text-2xl font-bold">{cheques.length}</p></div>
        <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Total chèques</p><p className="text-2xl font-bold">{totalCheques}</p></div>
        <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Montant total</p><p className="text-2xl font-bold font-mono">{totalMontant.toFixed(2)} €</p></div>
        <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Fournisseur</p><p className="text-2xl font-bold">{config?.fournisseur || '—'}</p></div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>{['Travailleur', 'Jours prestés', 'Nb chèques', 'Valeur', 'Part patron.', 'Part perso.', 'Total'].map(h =>
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y">
            {cheques.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{c.travailleurs?.nom} {c.travailleurs?.prenom}</td>
                <td className="px-4 py-3">{c.jours_prestes}</td>
                <td className="px-4 py-3 font-medium">{c.nombre_cheques}</td>
                <td className="px-4 py-3 font-mono">{c.valeur_faciale?.toFixed(2)} €</td>
                <td className="px-4 py-3 font-mono">{c.part_patronale?.toFixed(2)} €</td>
                <td className="px-4 py-3 font-mono">{c.part_personnelle?.toFixed(2)} €</td>
                <td className="px-4 py-3 font-mono font-medium">{c.montant_total?.toFixed(2)} €</td>
              </tr>
            ))}
            {!cheques.length && <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Cliquez "Calculer" pour générer</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
