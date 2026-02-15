'use client';
// app/sprint9/saisies/page.jsx — F17
import { useState, useEffect } from 'react';
import supabase, { rpc, query, insert } from '../../lib/supabase-helpers';

export default function SaisiesPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [travailleurs, setTravailleurs] = useState([]);
  const [saisies, setSaisies] = useState([]);
  const [retenues, setRetenues] = useState([]);
  const [simulation, setSimulation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [simForm, setSimForm] = useState({ net: 2500, enfants: 0 });
  const [form, setForm] = useState({ travailleur_id: '', type_saisie: 'saisie_execution', creancier: '', montant_total_du: '', montant_mensuel_fixe: '', priorite: 4, date_signification: '' });

  useEffect(() => { loadClients(); }, []);
  useEffect(() => { if (clientId) { loadTravailleurs(); loadSaisies(); } }, [clientId]);

  async function loadClients() { const d = await query('clients'); setClients(d || []); if (d?.length) setClientId(d[0].id); }
  async function loadTravailleurs() { const d = await query('travailleurs', { client_id: clientId }); setTravailleurs(d || []); }
  async function loadSaisies() {
    const { data } = await supabase.from('saisies_salaire').select('*, travailleurs(nom, prenom)')
      .eq('client_id', clientId).order('priorite').order('date_signification');
    setSaisies(data || []);
  }

  async function ajouterSaisie(e) {
    e.preventDefault();
    await insert('saisies_salaire', { ...form, client_id: clientId, statut: 'active',
      montant_total_du: form.montant_total_du ? +form.montant_total_du : null,
      montant_mensuel_fixe: form.montant_mensuel_fixe ? +form.montant_mensuel_fixe : null,
      montant_deja_retenu: 0, montant_restant: form.montant_total_du ? +form.montant_total_du : null });
    setShowForm(false); loadSaisies();
  }

  async function simuler() {
    try { setSimulation(await rpc('calculer_saisie_mensuelle', { p_net: +simForm.net, p_enf: +simForm.enfants })); }
    catch (e) { alert(e.message); }
  }

  async function appliquerSaisies(travId) {
    const annee = 2026, mois = new Date().getMonth() + 1;
    const trav = travailleurs.find(t => t.id === travId);
    try {
      const r = await rpc('appliquer_saisies_travailleur', { p_client_id: clientId, p_trav_id: travId, p_annee: annee, p_mois: mois, p_net: trav?.salaire_brut * 0.65 || 2000 });
      alert(`Retenu: ${r.total_retenu}€ — Net après saisie: ${r.net_apres_saisie}€`);
      loadSaisies();
    } catch (e) { alert(e.message); }
  }

  const typeLabels = { saisie_conservatoire: '🔒 Conservatoire', saisie_execution: '⚡ Exécution', cession_volontaire: '📝 Cession volontaire', pension_alimentaire: '👨‍👧 Pension alimentaire', dette_fiscale: '🏛️ Fisc', dette_onss: '🏢 ONSS' };
  const prioriteLabels = { 1: '🔴 P1 (aliments)', 2: '🟠 P2 (fisc)', 3: '🟡 P3 (ONSS)', 4: '🔵 P4 (judiciaire)', 5: '⚪ P5 (volontaire)' };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-800">⚖️ Saisies sur Salaire</h1><p className="text-slate-500 text-sm">Barèmes d'insaisissabilité, retenues, simulation</p></div>
        <div className="flex gap-2">
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</select>
          <button onClick={() => setShowForm(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">+ Saisie</button>
        </div>
      </div>

      {/* Simulateur */}
      <div className="bg-white p-5 rounded-xl border shadow-sm mb-6">
        <h3 className="font-semibold mb-3">Simulateur de quotité saisissable (2026)</h3>
        <div className="flex gap-3 items-end">
          <div><label className="block text-xs text-slate-500 mb-1">Net mensuel (€)</label><input type="number" value={simForm.net} onChange={e => setSimForm({ ...simForm, net: e.target.value })} className="border rounded px-3 py-2 text-sm w-32" /></div>
          <div><label className="block text-xs text-slate-500 mb-1">Enfants à charge</label><input type="number" min="0" value={simForm.enfants} onChange={e => setSimForm({ ...simForm, enfants: e.target.value })} className="border rounded px-3 py-2 text-sm w-20" /></div>
          <button onClick={simuler} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm">Simuler</button>
          {simulation && (
            <div className="flex gap-4 ml-4">
              <div className="bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
                <p className="text-xs text-red-500">Saisissable</p>
                <p className="text-lg font-bold font-mono text-red-700">{simulation.saisissable?.toFixed(2)} €</p>
              </div>
              <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                <p className="text-xs text-green-500">Immunisé</p>
                <p className="text-lg font-bold font-mono text-green-700">{simulation.immunise?.toFixed(2)} €</p>
              </div>
              {+simForm.enfants > 0 && (
                <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
                  <p className="text-xs text-blue-500">Supplément enfants</p>
                  <p className="text-lg font-bold font-mono text-blue-700">{simulation.supplement?.toFixed(2)} €</p>
                </div>
              )}
            </div>
          )}
        </div>
        {simulation?.detail?.length > 0 && (
          <div className="mt-3 flex gap-2">
            {simulation.detail.map((d, i) => (
              <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded">
                {d.taux}: {d.base?.toFixed(0)}€ → {d.saisie?.toFixed(2)}€
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Form nouvelle saisie */}
      {showForm && (
        <form onSubmit={ajouterSaisie} className="bg-white p-5 rounded-xl border shadow-sm mb-6">
          <h3 className="font-semibold mb-4">Nouvelle saisie</h3>
          <div className="grid grid-cols-4 gap-3">
            <div><label className="block text-xs text-slate-500 mb-1">Travailleur</label><select required value={form.travailleur_id} onChange={e => setForm({ ...form, travailleur_id: e.target.value })} className="w-full border rounded px-3 py-2 text-sm"><option value="">--</option>{travailleurs.map(t => <option key={t.id} value={t.id}>{t.nom} {t.prenom}</option>)}</select></div>
            <div><label className="block text-xs text-slate-500 mb-1">Type</label><select value={form.type_saisie} onChange={e => setForm({ ...form, type_saisie: e.target.value, priorite: e.target.value === 'pension_alimentaire' ? 1 : e.target.value === 'dette_fiscale' ? 2 : e.target.value === 'dette_onss' ? 3 : e.target.value === 'cession_volontaire' ? 5 : 4 })} className="w-full border rounded px-3 py-2 text-sm">
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="block text-xs text-slate-500 mb-1">Créancier</label><input required value={form.creancier} onChange={e => setForm({ ...form, creancier: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">Date signification</label><input type="date" value={form.date_signification} onChange={e => setForm({ ...form, date_signification: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">Montant total dû (€)</label><input type="number" step="0.01" value={form.montant_total_du} onChange={e => setForm({ ...form, montant_total_du: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="Vide si pension" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">Montant mensuel fixe</label><input type="number" step="0.01" value={form.montant_mensuel_fixe} onChange={e => setForm({ ...form, montant_mensuel_fixe: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="Pour pension alim." /></div>
            <div><label className="block text-xs text-slate-500 mb-1">Priorité</label><select value={form.priorite} onChange={e => setForm({ ...form, priorite: +e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
              {Object.entries(prioriteLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div className="flex items-end gap-2"><button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm">Créer</button><button type="button" onClick={() => setShowForm(false)} className="text-slate-400 text-sm">Annuler</button></div>
          </div>
        </form>
      )}

      {/* Barèmes de référence */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
        <h4 className="font-semibold text-sm text-amber-800 mb-2">Barèmes insaisissabilité 2026</h4>
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="bg-white p-2 rounded"><p className="font-medium">0 - 1.311€</p><p className="text-green-600">0% (exempt)</p></div>
          <div className="bg-white p-2 rounded"><p className="font-medium">1.311 - 1.410€</p><p className="text-amber-600">20%</p></div>
          <div className="bg-white p-2 rounded"><p className="font-medium">1.410 - 1.556€</p><p className="text-orange-600">30%</p></div>
          <div className="bg-white p-2 rounded"><p className="font-medium">1.556 - 1.702€</p><p className="text-red-500">40%</p></div>
          <div className="bg-white p-2 rounded"><p className="font-medium">&gt; 1.702€</p><p className="text-red-700">100%</p></div>
        </div>
        <p className="text-xs text-amber-700 mt-2">Supplément par enfant à charge: +76€ par tranche</p>
      </div>

      {/* Table saisies */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr>{['Travailleur', 'Type', 'Créancier', 'Priorité', 'Total dû', 'Déjà retenu', 'Restant', 'Statut', ''].map(h =>
            <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {saisies.map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 font-medium">{s.travailleurs?.nom} {s.travailleurs?.prenom}</td>
                <td className="px-3 py-2 text-xs">{typeLabels[s.type_saisie] || s.type_saisie}</td>
                <td className="px-3 py-2">{s.creancier}</td>
                <td className="px-3 py-2">{prioriteLabels[s.priorite] || s.priorite}</td>
                <td className="px-3 py-2 font-mono">{s.montant_total_du?.toFixed(2) || '∞'} €</td>
                <td className="px-3 py-2 font-mono text-orange-600">{s.montant_deja_retenu?.toFixed(2)} €</td>
                <td className="px-3 py-2 font-mono font-medium text-red-600">{s.montant_restant?.toFixed(2) || '—'} €</td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${s.statut === 'active' ? 'bg-red-100 text-red-700' : s.statut === 'terminee' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{s.statut}</span></td>
                <td className="px-3 py-2">{s.statut === 'active' && <button onClick={() => appliquerSaisies(s.travailleur_id)} className="text-blue-600 text-xs">Appliquer</button>}</td>
              </tr>
            ))}
            {!saisies.length && <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Aucune saisie enregistrée</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
