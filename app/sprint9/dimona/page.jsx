'use client';
// app/sprint9/dimona/page.jsx
import { useState, useEffect } from 'react';
import supabase, { rpc, query, insert } from '../../lib/supabase-helpers';

export default function DimonaPage() {
  const [declarations, setDeclarations] = useState([]);
  const [travailleurs, setTravailleurs] = useState([]);
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ travailleur_id: '', type: 'IN', date: new Date().toISOString().split('T')[0], type_trav: 'EMP', motif: '' });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (clientId) { loadDeclarations(); loadDashboard(); loadTravailleurs(); }
  }, [clientId]);

  async function loadClients() {
    const data = await query('clients');
    setClients(data || []);
    if (data?.length) setClientId(data[0].id);
  }

  async function loadTravailleurs() {
    const data = await query('travailleurs', { client_id: clientId });
    setTravailleurs(data || []);
  }

  async function loadDeclarations() {
    const { data } = await supabase.from('dimona_declarations').select('*, travailleurs(nom, prenom)')
      .eq('client_id', clientId).order('created_at', { ascending: false }).limit(50);
    setDeclarations(data || []);
  }

  async function loadDashboard() {
    try { const d = await rpc('dimona_dashboard', { p_client_id: clientId }); setDashboard(d); } catch (e) { console.error(e); }
  }

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true);
    try {
      if (form.type === 'IN') {
        await rpc('auto_dimona_in', { p_client_id: clientId, p_trav_id: form.travailleur_id, p_date: form.date, p_type: form.type_trav });
      } else {
        await rpc('auto_dimona_out', { p_client_id: clientId, p_trav_id: form.travailleur_id, p_date: form.date, p_motif: form.motif || null });
      }
      setShowForm(false); loadDeclarations(); loadDashboard();
    } catch (err) { alert('Erreur: ' + err.message); }
    setLoading(false);
  }

  const statuts = { a_envoyer: '🟡 À envoyer', envoyee: '🔵 Envoyée', acceptee: '✅ Acceptée', rejetee: '❌ Rejetée' };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📤 Dimona</h1>
          <p className="text-slate-500 text-sm">Déclarations d'entrée et sortie de travailleurs</p>
        </div>
        <div className="flex gap-3">
          <select value={clientId} onChange={e => setClientId(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white">
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            + Nouvelle Dimona
          </button>
        </div>
      </div>

      {/* Dashboard cards */}
      {dashboard && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'À envoyer', val: dashboard.a_envoyer, color: 'bg-amber-50 text-amber-700 border-amber-200' },
            { label: 'Acceptées', val: dashboard.acceptees, color: 'bg-green-50 text-green-700 border-green-200' },
            { label: 'Rejetées', val: dashboard.rejetees, color: 'bg-red-50 text-red-700 border-red-200' },
            { label: 'Total', val: dashboard.total, color: 'bg-blue-50 text-blue-700 border-blue-200' },
          ].map(c => (
            <div key={c.label} className={`p-4 rounded-xl border ${c.color}`}>
              <p className="text-sm opacity-75">{c.label}</p>
              <p className="text-3xl font-bold mt-1">{c.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm mb-6">
          <h3 className="font-semibold mb-4">Nouvelle déclaration Dimona</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Travailleur</label>
              <select value={form.travailleur_id} onChange={e => setForm({ ...form, travailleur_id: e.target.value })}
                required className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">-- Sélectionner --</option>
                {travailleurs.map(t => <option key={t.id} value={t.id}>{t.nom} {t.prenom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="IN">IN — Entrée</option>
                <option value="OUT">OUT — Sortie</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                required className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            {form.type === 'IN' ? (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Type travailleur</label>
                <select value={form.type_trav} onChange={e => setForm({ ...form, type_trav: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  {['EMP','OUV','STU','APP','FLE','DOM','ART','STA','IND','INT','BEN','PFI','EXT'].map(t =>
                    <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Motif sortie</label>
                <input type="text" value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })}
                  placeholder="Démission, licenciement..." className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Envoi...' : 'Créer la déclaration'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Annuler</button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              {['Travailleur', 'Type', 'Date', 'NISS', 'Type trav.', 'Statut', 'N° Dimona'].map(h =>
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y">
            {declarations.map(d => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{d.travailleurs?.nom} {d.travailleurs?.prenom}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.type_dimona === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {d.type_dimona}
                  </span>
                </td>
                <td className="px-4 py-3">{d.type_dimona === 'IN' ? d.date_entree_service : d.date_sortie_service}</td>
                <td className="px-4 py-3 font-mono text-xs">{d.niss}</td>
                <td className="px-4 py-3">{d.type_travailleur}</td>
                <td className="px-4 py-3">{statuts[d.statut] || d.statut}</td>
                <td className="px-4 py-3 font-mono text-xs">{d.numero_dimona || '—'}</td>
              </tr>
            ))}
            {!declarations.length && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Aucune déclaration Dimona</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
