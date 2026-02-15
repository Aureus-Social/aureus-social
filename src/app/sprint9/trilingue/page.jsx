'use client';
// app/sprint9/trilingue/page.jsx — F8
import { useState, useEffect } from 'react';
import supabase, { rpc, query, update } from '@/lib/supabase-helpers';

export default function TrilinguePage() {
  const [traductions, setTraductions] = useState([]);
  const [filter, setFilter] = useState('');
  const [contexte, setContexte] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { loadTraductions(); }, [contexte]);

  async function loadTraductions() {
    let q = supabase.from('traductions').select('*').order('contexte').order('cle');
    if (contexte) q = q.eq('contexte', contexte);
    const { data } = await q;
    setTraductions(data || []);
  }

  async function saveEdit() {
    try { await update('traductions', editId, editForm); setEditId(null); loadTraductions(); }
    catch (e) { alert(e.message); }
  }

  const filtered = traductions.filter(t => !filter || t.cle.includes(filter) || t.fr?.includes(filter) || t.nl?.includes(filter));
  const contextes = ['', 'general', 'fiche_paie', 'contrat', 'dimona', 'onss', 'attestation', 'document', 'menu', 'erreur'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🌍 Trilingue FR/NL/DE</h1>
          <p className="text-slate-500 text-sm">Gestion des traductions officielles</p>
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Rechercher..." value={filter} onChange={e => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-60" />
          <select value={contexte} onChange={e => setContexte(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            {contextes.map(c => <option key={c} value={c}>{c || 'Tous contextes'}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>{['Clé', 'Contexte', '🇫🇷 Français', '🇳🇱 Néerlandais', '🇩🇪 Allemand', 'Officiel', ''].map(h =>
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 font-mono text-xs">{t.cle}</td>
                <td className="px-4 py-2"><span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{t.contexte}</span></td>
                {editId === t.id ? (
                  <>
                    <td className="px-2 py-1"><input className="w-full border rounded px-2 py-1 text-xs" value={editForm.fr || ''} onChange={e => setEditForm({ ...editForm, fr: e.target.value })} /></td>
                    <td className="px-2 py-1"><input className="w-full border rounded px-2 py-1 text-xs" value={editForm.nl || ''} onChange={e => setEditForm({ ...editForm, nl: e.target.value })} /></td>
                    <td className="px-2 py-1"><input className="w-full border rounded px-2 py-1 text-xs" value={editForm.de || ''} onChange={e => setEditForm({ ...editForm, de: e.target.value })} /></td>
                    <td className="px-2 py-1">{t.est_officiel ? '✅' : '—'}</td>
                    <td className="px-2 py-1"><button onClick={saveEdit} className="text-green-600 text-xs font-medium">💾</button></td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2">{t.fr}</td>
                    <td className="px-4 py-2 text-slate-600">{t.nl || <span className="text-red-400 text-xs">manquant</span>}</td>
                    <td className="px-4 py-2 text-slate-600">{t.de || <span className="text-red-400 text-xs">manquant</span>}</td>
                    <td className="px-4 py-2">{t.est_officiel ? '✅' : '—'}</td>
                    <td className="px-4 py-2"><button onClick={() => { setEditId(t.id); setEditForm({ fr: t.fr, nl: t.nl, de: t.de }); }} className="text-blue-600 text-xs">✏️</button></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-3">{filtered.length} traductions affichées</p>
    </div>
  );
}
