'use client';
// app/sprint9/onss/page.jsx
import { useState, useEffect } from 'react';
import supabase, { rpc, query } from '../../lib/supabase-helpers';

export default function ONSSPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [annee, setAnnee] = useState(2026);
  const [declarations, setDeclarations] = useState([]);
  const [echeances, setEcheances] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadClients(); }, []);
  useEffect(() => { if (clientId) { loadDeclarations(); loadEcheances(); } }, [clientId, annee]);

  async function loadClients() {
    const data = await query('clients');
    setClients(data || []);
    if (data?.length) setClientId(data[0].id);
  }

  async function loadDeclarations() {
    const { data } = await supabase.from('declarations_onss_trimestrielles')
      .select('*').eq('client_id', clientId).eq('annee', annee).order('trimestre');
    setDeclarations(data || []);
  }

  async function loadEcheances() {
    const { data } = await supabase.from('echeances_onss')
      .select('*').eq('client_id', clientId).eq('annee', annee).order('trimestre');
    setEcheances(data || []);
  }

  async function genererEcheances() {
    setLoading(true);
    try { await rpc('generer_echeances_onss', { p_client_id: clientId, p_annee: annee }); loadEcheances(); }
    catch (e) { alert(e.message); }
    setLoading(false);
  }

  async function preparerDMFA(trim) {
    setLoading(true);
    try { await rpc('preparer_dmfa_trimestre', { p_client_id: clientId, p_annee: annee, p_trim: trim }); loadDeclarations(); }
    catch (e) { alert(e.message); }
    setLoading(false);
  }

  const trimLabels = { 1: 'T1 (Jan-Mars)', 2: 'T2 (Avr-Juin)', 3: 'T3 (Juil-Sept)', 4: 'T4 (Oct-Déc)' };
  const statutColors = { en_cours: 'bg-yellow-100 text-yellow-700', valide: 'bg-green-100 text-green-700', envoye: 'bg-blue-100 text-blue-700' };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🏛️ ONSS / DmfA</h1>
          <p className="text-slate-500 text-sm">Déclarations trimestrielles et échéances</p>
        </div>
        <div className="flex gap-3">
          <select value={clientId} onChange={e => setClientId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select value={annee} onChange={e => setAnnee(+e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">
            {[2024, 2025, 2026].map(a => <option key={a}>{a}</option>)}
          </select>
          <button onClick={genererEcheances} disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
            Générer échéances {annee}
          </button>
        </div>
      </div>

      {/* Échéances */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(t => {
          const ech = echeances.find(e => e.trimestre === t);
          const decl = declarations.find(d => d.trimestre === t);
          return (
            <div key={t} className="bg-white p-5 rounded-xl border shadow-sm">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-sm">{trimLabels[t]}</h3>
                {decl && <span className={`px-2 py-0.5 rounded-full text-xs ${statutColors[decl.statut] || 'bg-gray-100'}`}>{decl.statut}</span>}
              </div>
              {ech && <p className="text-xs text-slate-500 mt-1">Échéance: {ech.date_echeance}</p>}
              {decl ? (
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Travailleurs</span><span className="font-medium">{decl.nombre_travailleurs}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Brut total</span><span className="font-mono">{decl.total_brut?.toFixed(2)} €</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">ONSS total</span><span className="font-mono text-red-600">{((decl.total_onss_travailleur || 0) + (decl.total_onss_patronal || 0)).toFixed(2)} €</span></div>
                </div>
              ) : (
                <button onClick={() => preparerDMFA(t)} disabled={loading}
                  className="mt-3 w-full bg-slate-100 text-slate-600 py-2 rounded-lg text-xs hover:bg-slate-200 transition">
                  Préparer DmfA T{t}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Cotisations de référence */}
      <div className="bg-white p-5 rounded-xl border shadow-sm">
        <h3 className="font-semibold mb-3">Taux de cotisations ONSS 2026</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500 mb-2 font-semibold uppercase">Travailleur</p>
            <div className="space-y-1">
              <div className="flex justify-between"><span>ONSS personnelle</span><span className="font-mono">13.07%</span></div>
              <div className="flex justify-between"><span>Cotisation spéciale</span><span className="font-mono">variable</span></div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2 font-semibold uppercase">Employeur</p>
            <div className="space-y-1">
              <div className="flex justify-between"><span>ONSS patronale de base</span><span className="font-mono">24.92%</span></div>
              <div className="flex justify-between"><span>Modération salariale</span><span className="font-mono">5.67%</span></div>
              <div className="flex justify-between"><span>Fonds fermeture</span><span className="font-mono">0.20%</span></div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2 font-semibold uppercase">Réductions</p>
            <div className="space-y-1">
              <div className="flex justify-between"><span>Structurelle</span><span className="font-mono">max 1550 €</span></div>
              <div className="flex justify-between"><span>1er engagement</span><span className="font-mono">1550 €/trim</span></div>
              <div className="flex justify-between"><span>Jeunes &lt;25</span><span className="font-mono">variable</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
