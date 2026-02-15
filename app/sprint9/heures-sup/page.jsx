'use client';
// app/sprint9/heures-sup/page.jsx — F15
import { useState, useEffect } from 'react';
import supabase, { rpc, query, insert } from '../../lib/supabase-helpers';

export default function HeuresSupPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [travailleurs, setTravailleurs] = useState([]);
  const [annee, setAnnee] = useState(2026);
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [heures, setHeures] = useState([]);
  const [contingents, setContingents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ travailleur_id: '', date_prestation: '', heures: 2, type_hsup: 'depassement_normal', salaire_horaire_base: 20 });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadClients(); }, []);
  useEffect(() => { if (clientId) { loadTravailleurs(); loadHeures(); loadContingents(); } }, [clientId, annee, mois]);

  async function loadClients() { const d = await query('clients'); setClients(d || []); if (d?.length) setClientId(d[0].id); }
  async function loadTravailleurs() { const d = await query('travailleurs', { client_id: clientId }); setTravailleurs(d || []); }
  async function loadHeures() {
    const { data } = await supabase.from('heures_supplementaires').select('*, travailleurs(nom, prenom)')
      .eq('client_id', clientId).eq('annee', annee).eq('mois', mois).order('date_prestation');
    setHeures(data || []);
  }
  async function loadContingents() {
    const { data } = await supabase.from('contingent_heures_sup').select('*, travailleurs(nom, prenom)')
      .eq('client_id', clientId).eq('annee', annee);
    setContingents(data || []);
  }

  async function ajouter(e) {
    e.preventDefault();
    const taux = ['dimanche', 'jour_ferie'].includes(form.type_hsup) ? 100 : 50;
    const base = +form.heures * +form.salaire_horaire_base;
    await insert('heures_supplementaires', {
      ...form, client_id: clientId, annee, mois, taux_sursalaire: taux,
      montant_base: base, montant_sursalaire: base * taux / 100, montant_total: base * (1 + taux / 100),
      eligible_avantage_fiscal: true
    });
    setShowForm(false); loadHeures();
  }

  async function calculerMois(travId) {
    setLoading(true);
    try { const r = await rpc('calculer_heures_sup', { p_client_id: clientId, p_trav_id: travId, p_annee: annee, p_mois: mois }); alert(JSON.stringify(r)); loadContingents(); }
    catch (e) { alert(e.message); }
    setLoading(false);
  }

  const typesHSup = ['depassement_normal', 'samedi', 'dimanche', 'jour_ferie', 'nuit', 'urgence', 'volontaire_130', 'relance_120'];
  const totalH = heures.reduce((s, h) => s + (h.heures || 0), 0);
  const totalSur = heures.reduce((s, h) => s + (h.montant_sursalaire || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-800">⏰ Heures Supplémentaires</h1><p className="text-slate-500 text-sm">Sursalaires, contingents fiscaux 130h</p></div>
        <div className="flex gap-2">
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</select>
          <select value={mois} onChange={e => setMois(+e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>Mois {i + 1}</option>)}</select>
          <select value={annee} onChange={e => setAnnee(+e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{[2025, 2026].map(a => <option key={a}>{a}</option>)}</select>
          <button onClick={() => setShowForm(true)} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700">+ Heures sup</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Total heures ce mois</p><p className="text-2xl font-bold">{totalH}h</p></div>
        <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Total sursalaire</p><p className="text-2xl font-bold font-mono text-amber-600">{totalSur.toFixed(2)} €</p></div>
        <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Contingent fiscal</p><p className="text-2xl font-bold">130h/an</p><p className="text-xs text-slate-400">Réduction PP 66.81% + dispense 32.19%</p></div>
      </div>

      {showForm && (
        <form onSubmit={ajouter} className="bg-white p-5 rounded-xl border shadow-sm mb-6">
          <div className="grid grid-cols-5 gap-3">
            <div><label className="block text-xs text-slate-500 mb-1">Travailleur</label><select required value={form.travailleur_id} onChange={e => setForm({ ...form, travailleur_id: e.target.value })} className="w-full border rounded px-3 py-2 text-sm"><option value="">--</option>{travailleurs.map(t => <option key={t.id} value={t.id}>{t.nom} {t.prenom}</option>)}</select></div>
            <div><label className="block text-xs text-slate-500 mb-1">Date</label><input type="date" required value={form.date_prestation} onChange={e => setForm({ ...form, date_prestation: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">Heures</label><input type="number" step="0.5" value={form.heures} onChange={e => setForm({ ...form, heures: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">Type</label><select value={form.type_hsup} onChange={e => setForm({ ...form, type_hsup: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">{typesHSup.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}</select></div>
            <div className="flex items-end gap-2"><button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm">Ajouter</button><button type="button" onClick={() => setShowForm(false)} className="text-slate-400 text-sm">✕</button></div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr>{['Travailleur', 'Date', 'Heures', 'Type', 'Taux', 'Sursalaire', 'Total', ''].map(h =>
            <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {heures.map(h => (
              <tr key={h.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-medium">{h.travailleurs?.nom} {h.travailleurs?.prenom}</td>
                <td className="px-3 py-2">{h.date_prestation}</td>
                <td className="px-3 py-2 font-mono font-medium">{h.heures}h</td>
                <td className="px-3 py-2 text-xs">{h.type_hsup?.replace(/_/g, ' ')}</td>
                <td className="px-3 py-2">{h.taux_sursalaire}%</td>
                <td className="px-3 py-2 font-mono text-amber-600">{h.montant_sursalaire?.toFixed(2)} €</td>
                <td className="px-3 py-2 font-mono font-medium">{h.montant_total?.toFixed(2)} €</td>
                <td className="px-3 py-2"><button onClick={() => calculerMois(h.travailleur_id)} className="text-blue-600 text-xs">Calc fiscal</button></td>
              </tr>
            ))}
            {!heures.length && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Aucune heure supplémentaire ce mois</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
