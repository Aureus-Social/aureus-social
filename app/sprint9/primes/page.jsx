'use client';
// app/sprint9/primes/page.jsx — F16
import { useState, useEffect } from 'react';
import supabase, { rpc, query } from '../../lib/supabase-helpers';

export default function PrimesPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [annee, setAnnee] = useState(2026);
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [primesSect, setPrimesSect] = useState([]);
  const [primesAttr, setPrimesAttr] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadClients(); loadPrimesSectorielles(); }, []);
  useEffect(() => { if (clientId) loadAttribuees(); }, [clientId, annee, mois]);

  async function loadClients() { const d = await query('clients'); setClients(d || []); if (d?.length) setClientId(d[0].id); }
  async function loadPrimesSectorielles() {
    const { data } = await supabase.from('primes_sectorielles').select('*').eq('actif', true).order('numero_cp');
    setPrimesSect(data || []);
  }
  async function loadAttribuees() {
    const { data } = await supabase.from('primes_attribuees').select('*, travailleurs(nom, prenom)')
      .eq('client_id', clientId).eq('annee', annee).eq('mois', mois).order('created_at', { ascending: false });
    setPrimesAttr(data || []);
  }

  async function attribuerMois() {
    setLoading(true);
    try { const r = await rpc('attribuer_primes_mensuelles', { p_client_id: clientId, p_annee: annee, p_mois: mois }); alert(`${r.primes_attribuees} primes attribuées, total: ${r.total_brut}€`); loadAttribuees(); }
    catch (e) { alert(e.message); }
    setLoading(false);
  }

  const totalBrut = primesAttr.reduce((s, p) => s + (p.montant_brut || 0), 0);
  const totalNet = primesAttr.reduce((s, p) => s + (p.montant_net || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-800">🎁 Primes Sectorielles</h1><p className="text-slate-500 text-sm">Attribution des primes par CP — fin d'année, éco-chèques, ancienneté</p></div>
        <div className="flex gap-2">
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</select>
          <select value={mois} onChange={e => setMois(+e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>Mois {i + 1}</option>)}</select>
          <select value={annee} onChange={e => setAnnee(+e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{[2025, 2026].map(a => <option key={a}>{a}</option>)}</select>
          <button onClick={attribuerMois} disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">Attribuer primes mois {mois}</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Primes attribuées</p><p className="text-2xl font-bold">{primesAttr.length}</p></div>
        <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Total brut</p><p className="text-2xl font-bold font-mono text-emerald-600">{totalBrut.toFixed(2)} €</p></div>
        <div className="bg-white p-4 rounded-xl border"><p className="text-xs text-slate-500">Total net</p><p className="text-2xl font-bold font-mono text-green-600">{totalNet.toFixed(2)} €</p></div>
      </div>

      {/* Primes attribuées */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-6">
        <div className="p-3 bg-slate-50 border-b"><h3 className="font-semibold text-sm">Primes attribuées — {mois}/{annee}</h3></div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr>{['Travailleur', 'Code', 'Prime', 'Brut', 'ONSS', 'PP', 'Net', 'Intégrée'].map(h =>
            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {primesAttr.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 font-medium">{p.travailleurs?.nom} {p.travailleurs?.prenom}</td>
                <td className="px-4 py-2 font-mono text-xs">{p.code_prime}</td>
                <td className="px-4 py-2">{p.libelle}</td>
                <td className="px-4 py-2 font-mono">{p.montant_brut?.toFixed(2)} €</td>
                <td className="px-4 py-2 font-mono text-xs">{p.montant_onss?.toFixed(2)} €</td>
                <td className="px-4 py-2 font-mono text-xs">{p.montant_pp?.toFixed(2)} €</td>
                <td className="px-4 py-2 font-mono font-medium text-green-600">{p.montant_net?.toFixed(2)} €</td>
                <td className="px-4 py-2">{p.integre_paie ? '✅' : '—'}</td>
              </tr>
            ))}
            {!primesAttr.length && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Aucune prime ce mois. Cliquez "Attribuer"</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Catalogue primes sectorielles */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-50 border-b"><h3 className="font-semibold text-sm">Catalogue primes sectorielles ({primesSect.length})</h3></div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr>{['CP', 'Code', 'Nom', 'Type', 'Mode', 'Montant/Taux', 'Fréquence', 'ONSS', 'PP'].map(h =>
            <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>)}</tr></thead>
          <tbody className="divide-y">
            {primesSect.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 text-xs">
                <td className="px-3 py-2 font-mono">{p.numero_cp}</td>
                <td className="px-3 py-2 font-mono">{p.code_prime}</td>
                <td className="px-3 py-2">{p.nom_fr}</td>
                <td className="px-3 py-2">{p.type_prime}</td>
                <td className="px-3 py-2">{p.mode_calcul}</td>
                <td className="px-3 py-2 font-mono">{p.montant_fixe ? `${p.montant_fixe}€` : p.pourcentage ? `${p.pourcentage}%` : '—'}</td>
                <td className="px-3 py-2">{p.frequence}</td>
                <td className="px-3 py-2">{p.soumis_onss ? '✅' : '—'}</td>
                <td className="px-3 py-2">{p.soumis_pp ? '✅' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
