'use client';
// app/sprint9/enfants/page.jsx — F10
import { useState, useEffect } from 'react';
import supabase, { rpc, query, insert } from '@/lib/supabase-helpers';

export default function EnfantsPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [travailleurs, setTravailleurs] = useState([]);
  const [travId, setTravId] = useState('');
  const [enfants, setEnfants] = useState([]);
  const [impactPP, setImpactPP] = useState(null);
  const [af, setAF] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nom: '', prenom: '', date_naissance: '', niss: '', sexe: 'M', lien_parente: 'enfant', a_charge: true, a_charge_fiscal: true, handicap: false, type_garde: 'exclusive', etudiant: false, region_af: 'BXL', rang_enfant: 1 });

  useEffect(() => { loadClients(); }, []);
  useEffect(() => { if (clientId) loadTravailleurs(); }, [clientId]);
  useEffect(() => { if (travId) { loadEnfants(); loadImpact(); loadAF(); } }, [travId]);

  async function loadClients() { const d = await query('clients'); setClients(d || []); if (d?.length) setClientId(d[0].id); }
  async function loadTravailleurs() { const d = await query('travailleurs', { client_id: clientId }); setTravailleurs(d || []); if (d?.length) setTravId(d[0].id); }
  async function loadEnfants() { const d = await query('enfants_a_charge', { client_id: clientId, travailleur_id: travId }); setEnfants(d || []); }
  async function loadImpact() { try { setImpactPP(await rpc('calculer_impact_enfants_pp', { p_client_id: clientId, p_trav_id: travId })); } catch (e) { setImpactPP(null); } }
  async function loadAF() { try { setAF(await rpc('calculer_allocations_familiales', { p_client_id: clientId, p_trav_id: travId })); } catch (e) { setAF(null); } }

  async function ajouterEnfant(e) {
    e.preventDefault();
    try { await insert('enfants_a_charge', { ...form, client_id: clientId, travailleur_id: travId }); setShowForm(false); loadEnfants(); loadImpact(); loadAF(); }
    catch (err) { alert(err.message); }
  }

  function age(dn) { return dn ? Math.floor((Date.now() - new Date(dn)) / 31557600000) : '?'; }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-800">👶 Enfants & Allocations Familiales</h1><p className="text-slate-500 text-sm">Gestion des personnes à charge et impact fiscal</p></div>
        <div className="flex gap-2">
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</select>
          <select value={travId} onChange={e => setTravId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{travailleurs.map(t => <option key={t.id} value={t.id}>{t.nom} {t.prenom}</option>)}</select>
          <button onClick={() => setShowForm(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">+ Enfant</button>
        </div>
      </div>

      {/* Impact fiscal + AF */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {impactPP && (<>
          <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Enfants à charge</p><p className="text-3xl font-bold">{impactPP.enfants}</p></div>
          <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Réduction PP mensuelle</p><p className="text-2xl font-bold text-green-600 font-mono">{impactPP.reduction_pp_mensuelle?.toFixed(2)} €</p></div>
        </>)}
        {af && <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Allocations familiales / mois</p><p className="text-2xl font-bold text-blue-600 font-mono">{af.total_mensuel?.toFixed(2)} €</p></div>}
      </div>

      {/* AF detail */}
      {af?.detail?.length > 0 && (
        <div className="bg-white p-5 rounded-xl border shadow-sm mb-6">
          <h3 className="font-semibold mb-3 text-sm">Détail allocations familiales</h3>
          <div className="grid grid-cols-3 gap-3">
            {af.detail.map((d, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded-lg">
                <p className="font-medium">{d.enfant}</p>
                <p className="text-xs text-slate-500">{d.age} ans</p>
                <div className="flex justify-between mt-1 text-sm"><span>Base</span><span className="font-mono">{d.base?.toFixed(2)} €</span></div>
                {d.supplement > 0 && <div className="flex justify-between text-sm"><span>Supplément âge</span><span className="font-mono text-green-600">+{d.supplement?.toFixed(2)} €</span></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={ajouterEnfant} className="bg-white p-5 rounded-xl border shadow-sm mb-6">
          <h3 className="font-semibold mb-4">Ajouter un enfant</h3>
          <div className="grid grid-cols-4 gap-3">
            <div><label className="block text-xs text-slate-500 mb-1">Nom</label><input required value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">Prénom</label><input required value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">Date naissance</label><input type="date" required value={form.date_naissance} onChange={e => setForm({ ...form, date_naissance: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">Région AF</label>
              <select value={form.region_af} onChange={e => setForm({ ...form, region_af: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                <option value="BXL">Bruxelles</option><option value="WAL">Wallonie</option><option value="VLA">Flandre</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 mt-3">
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={form.a_charge_fiscal} onChange={e => setForm({ ...form, a_charge_fiscal: e.target.checked })} /> Charge fiscale</label>
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={form.handicap} onChange={e => setForm({ ...form, handicap: e.target.checked })} /> Handicap</label>
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={form.etudiant} onChange={e => setForm({ ...form, etudiant: e.target.checked })} /> Étudiant</label>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm">Ajouter</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 text-sm">Annuler</button>
          </div>
        </form>
      )}

      {/* Liste enfants */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr>{['Prénom', 'Nom', 'Âge', 'Lien', 'Charge fiscale', 'Handicap', 'Garde', 'Région'].map(h =>
            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {enfants.map(e => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{e.prenom}</td>
                <td className="px-4 py-3">{e.nom}</td>
                <td className="px-4 py-3">{age(e.date_naissance)} ans</td>
                <td className="px-4 py-3">{e.lien_parente}</td>
                <td className="px-4 py-3">{e.a_charge_fiscal ? '✅' : '—'}</td>
                <td className="px-4 py-3">{e.handicap ? '♿' : '—'}</td>
                <td className="px-4 py-3">{e.type_garde}</td>
                <td className="px-4 py-3">{e.region_af}</td>
              </tr>
            ))}
            {!enfants.length && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Aucun enfant enregistré</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
