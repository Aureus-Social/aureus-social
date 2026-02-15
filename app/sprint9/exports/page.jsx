'use client';
// app/sprint9/exports/page.jsx — F12
import { useState, useEffect } from 'react';
import supabase, { query } from '../../lib/supabase-helpers';

export default function ExportsPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [annee, setAnnee] = useState(2026);
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { loadClients(); }, []);
  async function loadClients() { const d = await query('clients'); setClients(d || []); if (d?.length) setClientId(d[0].id); }

  async function exportFiches() {
    setExporting(true);
    try {
      const { data } = await supabase.from('fiches_paie').select('*, travailleurs(nom, prenom, niss)')
        .eq('client_id', clientId).eq('annee', annee).eq('mois', mois);
      if (!data?.length) { alert('Aucune fiche de paie'); return; }
      const csv = ['Nom,Prénom,NISS,Brut,ONSS,PP,CSS,Net,Jours,Heures'];
      data.forEach(f => csv.push(`${f.travailleurs?.nom},${f.travailleurs?.prenom},${f.travailleurs?.niss},${f.brut},${f.onss_travailleur},${f.precompte_pro},${f.cotisation_speciale},${f.net},${f.jours_prestes},${f.heures_prestees}`));
      download(csv.join('\n'), `fiches_paie_${annee}_${mois}.csv`);
    } catch (e) { alert(e.message); }
    setExporting(false);
  }

  async function exportONSS() {
    setExporting(true);
    try {
      const { data } = await supabase.from('declarations_onss_trimestrielles').select('*, lignes_declaration_onss(*)').eq('client_id', clientId).eq('annee', annee);
      download(JSON.stringify(data, null, 2), `onss_${annee}.json`);
    } catch (e) { alert(e.message); }
    setExporting(false);
  }

  async function exportTravailleurs() {
    setExporting(true);
    try {
      const { data } = await supabase.from('travailleurs').select('*').eq('client_id', clientId);
      const csv = ['Nom,Prénom,NISS,Statut,Contrat,Entrée,Sortie,Brut,Régime'];
      (data || []).forEach(t => csv.push(`${t.nom},${t.prenom},${t.niss},${t.statut},${t.type_contrat},${t.date_entree},${t.date_sortie || ''},${t.salaire_brut},${t.regime}`));
      download(csv.join('\n'), `travailleurs_${clientId.slice(0, 8)}.csv`);
    } catch (e) { alert(e.message); }
    setExporting(false);
  }

  function download(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  }

  const exports = [
    { label: '💰 Fiches de paie', desc: 'Export CSV des fiches du mois sélectionné', action: exportFiches, color: 'bg-emerald-600' },
    { label: '🏛️ Déclarations ONSS', desc: 'Export JSON des DmfA trimestrielles', action: exportONSS, color: 'bg-red-600' },
    { label: '👥 Liste travailleurs', desc: 'Export CSV de tous les travailleurs', action: exportTravailleurs, color: 'bg-blue-600' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">📁 Exports</h1>
      <p className="text-slate-500 text-sm mb-6">Exports CSV, Excel, CODA</p>
      <div className="flex gap-3 mb-6">
        <select value={clientId} onChange={e => setClientId(e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}</select>
        <select value={mois} onChange={e => setMois(+e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{[...Array(12)].map((_, i) => <option key={i + 1} value={i + 1}>Mois {i + 1}</option>)}</select>
        <select value={annee} onChange={e => setAnnee(+e.target.value)} className="border rounded-lg px-3 py-2 text-sm bg-white">{[2024, 2025, 2026].map(a => <option key={a}>{a}</option>)}</select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {exports.map(ex => (
          <div key={ex.label} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
            <h3 className="text-lg font-semibold mb-2">{ex.label}</h3>
            <p className="text-sm text-slate-500 flex-1">{ex.desc}</p>
            <button onClick={ex.action} disabled={exporting} className={`${ex.color} text-white px-4 py-3 rounded-lg text-sm font-medium hover:opacity-90 mt-4`}>
              {exporting ? '⏳...' : 'Télécharger'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
