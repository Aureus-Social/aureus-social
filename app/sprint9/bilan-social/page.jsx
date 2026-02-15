'use client';
// app/sprint9/bilan-social/page.jsx
import { useState, useEffect } from 'react';
import supabase, { rpc, query } from '@/lib/supabase-helpers';

export default function BilanSocialPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [annee, setAnnee] = useState(2025);
  const [bilan, setBilan] = useState(null);
  const [etat, setEtat] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadClients(); }, []);
  useEffect(() => { if (clientId) loadBilan(); }, [clientId, annee]);

  async function loadClients() {
    const data = await query('clients');
    setClients(data || []);
    if (data?.length) setClientId(data[0].id);
  }

  async function loadBilan() {
    const { data } = await supabase.from('bilan_social').select('*')
      .eq('client_id', clientId).eq('annee', annee).single();
    setBilan(data);
    if (data) {
      const { data: ep } = await supabase.from('bilan_social_etat_personnes').select('*').eq('bilan_id', data.id).single();
      setEtat(ep);
    } else { setEtat(null); }
  }

  async function generer() {
    setLoading(true);
    try { await rpc('generer_bilan_social', { p_client_id: clientId, p_annee: annee }); loadBilan(); }
    catch (e) { alert(e.message); }
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📊 Bilan Social</h1>
          <p className="text-slate-500 text-sm">Obligation annuelle — état du personnel</p>
        </div>
        <div className="flex gap-3">
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select value={annee} onChange={e => setAnnee(+e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            {[2023, 2024, 2025, 2026].map(a => <option key={a}>{a}</option>)}
          </select>
          <button onClick={generer} disabled={loading}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700">
            {bilan ? 'Régénérer' : 'Générer'} Bilan {annee}
          </button>
        </div>
      </div>

      {bilan ? (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Modèle', val: bilan.modele === 'complet' ? 'Complet (>100)' : 'Abrégé', icon: '📋' },
              { label: 'ETP moyen', val: bilan.effectif_moyen_etp || 0, icon: '👥' },
              { label: 'Frais personnel', val: (bilan.frais_personnel_total || 0).toLocaleString('fr-BE') + ' €', icon: '💶' },
              { label: 'Entrées', val: bilan.nombre_entrees || 0, icon: '📈' },
              { label: 'Sorties', val: bilan.nombre_sorties || 0, icon: '📉' },
            ].map(k => (
              <div key={k.label} className="bg-white p-4 rounded-xl border">
                <p className="text-xs text-slate-500">{k.icon} {k.label}</p>
                <p className="text-xl font-bold mt-1">{k.val}</p>
              </div>
            ))}
          </div>

          {/* État des personnes */}
          {etat && (
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="font-semibold mb-4">État des personnes occupées</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b">
                    <th className="pb-2">Catégorie</th><th className="pb-2 text-center">Hommes TP</th><th className="pb-2 text-center">Femmes TP</th><th className="pb-2 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50">
                    <td className="py-2">CDI temps plein</td>
                    <td className="py-2 text-center font-mono">{etat.cdi_temps_plein_h || 0}</td>
                    <td className="py-2 text-center font-mono">{etat.cdi_temps_plein_f || 0}</td>
                    <td className="py-2 text-center font-mono font-medium">{(etat.cdi_temps_plein_h || 0) + (etat.cdi_temps_plein_f || 0)}</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-2">CDD temps plein</td>
                    <td className="py-2 text-center font-mono">{etat.cdd_temps_plein_h || 0}</td>
                    <td className="py-2 text-center font-mono">{etat.cdd_temps_plein_f || 0}</td>
                    <td className="py-2 text-center font-mono font-medium">{(etat.cdd_temps_plein_h || 0) + (etat.cdd_temps_plein_f || 0)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg"><span className="text-slate-500">Heures prestées</span><p className="font-mono font-semibold">{(etat.heures_prestees || 0).toLocaleString('fr-BE')}</p></div>
                <div className="bg-slate-50 p-3 rounded-lg"><span className="text-slate-500">Rémunérations</span><p className="font-mono font-semibold">{(etat.remuneration_avantages || 0).toLocaleString('fr-BE')} €</p></div>
                <div className="bg-slate-50 p-3 rounded-lg"><span className="text-slate-500">Cotisations patronales</span><p className="font-mono font-semibold">{(etat.cotisations_patronales || 0).toLocaleString('fr-BE')} €</p></div>
              </div>
            </div>
          )}

          <div className="bg-white p-5 rounded-xl border shadow-sm">
            <p className="text-sm text-slate-500">Statut: <span className={`font-medium ${bilan.statut === 'finalise' ? 'text-green-600' : 'text-amber-600'}`}>{bilan.statut}</span></p>
            <p className="text-sm text-slate-500">Exercice: {bilan.exercice_debut} → {bilan.exercice_fin}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border text-center text-slate-400">
          <p className="text-4xl mb-3">📊</p>
          <p>Aucun bilan social pour {annee}. Cliquez sur "Générer" pour créer.</p>
        </div>
      )}
    </div>
  );
}
