'use client';
// app/sprint9/attestations/page.jsx — F11
import { useState, useEffect } from 'react';
import supabase, { rpc, query } from '../../lib/supabase-helpers';

export default function AttestationsPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [travailleurs, setTravailleurs] = useState([]);
  const [attestations, setAttestations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ travailleur_id: '', type: 'attestation_travail', langue: 'fr', date_fin: '', motif: '', annee: 2025 });

  useEffect(() => { loadClients(); }, []);
  useEffect(() => { if (clientId) { loadTravailleurs(); loadAttestations(); } }, [clientId]);

  async function loadClients() { const d = await query('clients'); setClients(d || []); if (d?.length) setClientId(d[0].id); }
  async function loadTravailleurs() { const d = await query('travailleurs', { client_id: clientId }); setTravailleurs(d || []); }
  async function loadAttestations() {
    const { data } = await supabase.from('attestations').select('*, travailleurs(nom, prenom)')
      .eq('client_id', clientId).order('date_generation', { ascending: false }).limit(50);
    setAttestations(data || []);
  }

  async function generer(e) {
    e.preventDefault(); setLoading(true);
    try {
      const p = { p_client_id: clientId, p_trav_id: form.travailleur_id, p_langue: form.langue };
      switch (form.type) {
        case 'attestation_travail': await rpc('generer_attestation_travail', p); break;
        case 'c4': await rpc('generer_c4', { ...p, p_date_fin: form.date_fin, p_motif: form.motif }); break;
        case 'pecule_sortie': await rpc('generer_pecule_sortie', { ...p, p_date: form.date_fin }); break;
        case 'fiche_281_10': await rpc('generer_fiche_281_10', { ...p, p_annee: +form.annee }); break;
      }
      setShowForm(false); loadAttestations();
    } catch (err) { alert(err.message); }
    setLoading(false);
  }

  async function genererMasse281() {
    setLoading(true);
    try { const r = await rpc('generer_281_10_masse', { p_client_id: clientId, p_annee: +form.annee }); alert(`${r.fiches_generees} fiches 281.10 générées`); loadAttestations(); }
    catch (e) { alert(e.message); }
    setLoading(false);
  }

  const types = { attestation_travail: '📄 Attestation travail', c4: '🔴 C4 (Licenciement)', pecule_sortie: '💶 Pécule de sortie', fiche_281_10: '📋 Fiche 281.10', fiche_281_20: '📋 Fiche 281.20', salaire: '💰 Attestation salaire' };
  const statutColors = { genere: 'bg-green-100 text-green-700', brouillon: 'bg-gray-100 text-gray-700', envoye: 'bg-blue-100 text-blue-700', annule: 'bg-red-100 text-red-700' };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-800">📄 Attestations</h1><p className="text-slate-500 text-sm">C4, 281.10, pécule de sortie, attestations de travail</p></div>
        <div className="flex gap-2">
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</select>
          <button onClick={() => setShowForm(true)} className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-700">+ Attestation</button>
          <button onClick={genererMasse281} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">📋 281.10 en masse</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={generer} className="bg-white p-5 rounded-xl border shadow-sm mb-6">
          <h3 className="font-semibold mb-4">Générer une attestation</h3>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs text-slate-500 mb-1">Travailleur</label>
              <select required value={form.travailleur_id} onChange={e => setForm({ ...form, travailleur_id: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                <option value="">--</option>{travailleurs.map(t => <option key={t.id} value={t.id}>{t.nom} {t.prenom}</option>)}
              </select></div>
            <div><label className="block text-xs text-slate-500 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                <option value="attestation_travail">Attestation travail</option><option value="c4">C4</option><option value="pecule_sortie">Pécule de sortie</option><option value="fiche_281_10">Fiche 281.10</option>
              </select></div>
            <div><label className="block text-xs text-slate-500 mb-1">Langue</label>
              <select value={form.langue} onChange={e => setForm({ ...form, langue: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                <option value="fr">Français</option><option value="nl">Néerlandais</option><option value="de">Allemand</option>
              </select></div>
            {(form.type === 'c4' || form.type === 'pecule_sortie') && (
              <div><label className="block text-xs text-slate-500 mb-1">Date fin</label><input type="date" value={form.date_fin} onChange={e => setForm({ ...form, date_fin: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
            )}
            {form.type === 'c4' && (
              <div><label className="block text-xs text-slate-500 mb-1">Motif</label><input value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
            )}
            {form.type === 'fiche_281_10' && (
              <div><label className="block text-xs text-slate-500 mb-1">Année revenus</label><input type="number" value={form.annee} onChange={e => setForm({ ...form, annee: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={loading} className="bg-sky-600 text-white px-6 py-2 rounded-lg text-sm">Générer</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 text-sm">Annuler</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr>{['Travailleur', 'Type', 'Langue', 'Date', 'Référence', 'Statut'].map(h =>
            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {attestations.map(a => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{a.travailleurs?.nom} {a.travailleurs?.prenom}</td>
                <td className="px-4 py-3">{types[a.type_attestation] || a.type_attestation}</td>
                <td className="px-4 py-3">{a.langue?.toUpperCase()}</td>
                <td className="px-4 py-3">{a.date_generation?.split('T')[0]}</td>
                <td className="px-4 py-3 font-mono text-xs">{a.numero_reference}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${statutColors[a.statut] || ''}`}>{a.statut}</span></td>
              </tr>
            ))}
            {!attestations.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Aucune attestation</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
