'use client';
// app/sprint9/baremes/page.jsx — F13
import { useState, useEffect } from 'react';
import supabase, { rpc, query } from '@/lib/supabase-helpers';

export default function BaremesPage() {
  const [cps, setCPs] = useState([]);
  const [selectedCP, setSelectedCP] = useState(null);
  const [baremes, setBaremes] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [searchForm, setSearchForm] = useState({ cp: 200, cat: '2', anc: 5 });

  useEffect(() => { loadCPs(); }, []);

  async function loadCPs() { const d = await query('commissions_paritaires', {}, { order: 'numero_cp' }); setCPs(d || []); }

  async function selectCP(cp) {
    setSelectedCP(cp);
    const { data } = await supabase.from('baremes_cp').select('*').eq('numero_cp', cp.numero_cp).eq('actif', true).order('categorie').order('anciennete_min');
    setBaremes(data || []);
  }

  async function rechercher() {
    try { setSearchResult(await rpc('rechercher_bareme', { p_cp: +searchForm.cp, p_cat: searchForm.cat, p_anc: +searchForm.anc })); }
    catch (e) { alert(e.message); }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">📋 Barèmes Commissions Paritaires</h1>
      <p className="text-slate-500 text-sm mb-6">Salaires minimums par CP, catégorie et ancienneté</p>

      {/* Recherche rapide */}
      <div className="bg-white p-5 rounded-xl border shadow-sm mb-6">
        <h3 className="font-semibold mb-3">Recherche rapide de barème</h3>
        <div className="flex gap-3 items-end">
          <div><label className="block text-xs text-slate-500 mb-1">CP</label><input type="number" value={searchForm.cp} onChange={e => setSearchForm({ ...searchForm, cp: e.target.value })} className="border rounded px-3 py-2 text-sm w-24" /></div>
          <div><label className="block text-xs text-slate-500 mb-1">Catégorie</label><input value={searchForm.cat} onChange={e => setSearchForm({ ...searchForm, cat: e.target.value })} className="border rounded px-3 py-2 text-sm w-20" /></div>
          <div><label className="block text-xs text-slate-500 mb-1">Ancienneté (ans)</label><input type="number" value={searchForm.anc} onChange={e => setSearchForm({ ...searchForm, anc: e.target.value })} className="border rounded px-3 py-2 text-sm w-20" /></div>
          <button onClick={rechercher} className="bg-rose-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-rose-700">Rechercher</button>
          {searchResult && !searchResult.erreur && (
            <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
              <span className="text-sm">CP {searchResult.cp} — {searchResult.categorie}: </span>
              <span className="text-lg font-bold font-mono text-green-700">{searchResult.salaire_mensuel?.toFixed(2)} €</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Liste CP */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-3 bg-slate-50 border-b"><h3 className="font-semibold text-sm">Commissions Paritaires</h3></div>
          <div className="max-h-[600px] overflow-y-auto">
            {cps.map(cp => (
              <button key={cp.id} onClick={() => selectCP(cp)}
                className={`w-full text-left px-4 py-3 border-b text-sm hover:bg-slate-50 ${selectedCP?.id === cp.id ? 'bg-blue-50 border-l-3 border-l-blue-500' : ''}`}>
                <span className="font-mono font-bold">{cp.numero_cp}</span>
                <span className="text-xs text-slate-500 ml-2">{cp.sous_cp || ''}</span>
                <p className="text-xs text-slate-600 truncate">{cp.nom_fr}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Barèmes */}
        <div className="col-span-3">
          {selectedCP ? (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b">
                <h3 className="font-semibold">CP {selectedCP.numero_cp} — {selectedCP.nom_fr}</h3>
                <p className="text-xs text-slate-500">Secteur: {selectedCP.secteur} | {selectedCP.heures_semaine_standard}h/sem | Index: {selectedCP.dernier_coefficient_index}</p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b"><tr>{['Catégorie', 'Description', 'Ancienneté', 'Mensuel', 'Horaire', 'Coeff.'].map(h =>
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {baremes.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium">{b.categorie}</td>
                      <td className="px-4 py-2 text-xs">{b.description_fr}</td>
                      <td className="px-4 py-2">{b.anciennete_min}-{b.anciennete_max || '+'} ans</td>
                      <td className="px-4 py-2 font-mono font-medium">{b.salaire_mensuel?.toFixed(2)} €</td>
                      <td className="px-4 py-2 font-mono text-xs">{b.salaire_horaire?.toFixed(4)} €</td>
                      <td className="px-4 py-2 font-mono text-xs">{b.coefficient_index}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl border text-center text-slate-400">Sélectionnez une CP à gauche</div>
          )}
        </div>
      </div>
    </div>
  );
}
