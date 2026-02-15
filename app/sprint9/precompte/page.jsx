'use client';
// app/sprint9/precompte/page.jsx
import { useState } from 'react';

// Barèmes PP 2026 simplifiés (scale 1 - isolé)
const TRANCHES = [
  { min: 0, max: 1095.09, taux: 0 },
  { min: 1095.09, max: 1544.17, taux: 0.2672 },
  { min: 1544.17, max: 2652.50, taux: 0.4280 },
  { min: 2652.50, max: 4842.83, taux: 0.4818 },
  { min: 4842.83, max: 999999, taux: 0.5350 },
];
const RED_FORFAIT = 555.00;
const DEDUCTIONS_ENFANTS = [0, 1850, 4760, 10660, 17220, 23780, 30340, 36900, 43460];

export default function PrecomptePage() {
  const [form, setForm] = useState({ brut: 3500, statut: 'employe', situation: 'isole', enfants: 0, handicap: false, conjoint_revenu: false });
  const [result, setResult] = useState(null);

  function calculer() {
    const brut = parseFloat(form.brut) || 0;
    // ONSS personnelle
    const onss = form.statut === 'employe' ? Math.round(brut * 0.1307 * 100) / 100 : 0;
    const imposable = brut - onss;
    
    // Calcul PP par tranches
    let pp = 0;
    let details = [];
    for (const t of TRANCHES) {
      if (imposable <= t.min) break;
      const base = Math.min(imposable, t.max) - t.min;
      const montant = Math.round(base * t.taux * 100) / 100;
      pp += montant;
      if (montant > 0) details.push({ tranche: `${t.min.toFixed(2)} - ${t.max < 999999 ? t.max.toFixed(2) : '...'}`, taux: (t.taux * 100).toFixed(2) + '%', base: base.toFixed(2), pp: montant.toFixed(2) });
    }
    
    // Réductions
    const redForf = Math.min(RED_FORFAIT, pp);
    pp -= redForf;
    const nEnf = parseInt(form.enfants) || 0;
    const redEnf = nEnf < DEDUCTIONS_ENFANTS.length ? Math.round(DEDUCTIONS_ENFANTS[nEnf] / 12 * 0.25 * 100) / 100 : 0;
    pp = Math.max(0, pp - redEnf);
    
    // Bonus emploi social
    let bonus = 0;
    if (imposable <= 3068.33) bonus = Math.min(Math.round(imposable * 0.3314 * 100) / 100, 510.83);
    pp = Math.max(0, pp - bonus);
    
    const net = brut - onss - pp;
    
    setResult({ brut, onss, imposable: Math.round(imposable * 100) / 100, pp_brut: pp + redForf + redEnf + bonus, 
      red_forfaitaire: redForf, red_enfants: redEnf, bonus_emploi: bonus, pp: Math.round(pp * 100) / 100, 
      net: Math.round(net * 100) / 100, taux_effectif: brut > 0 ? ((pp / brut) * 100).toFixed(2) : '0', details });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">🧮 Précompte Professionnel</h1>
      <p className="text-slate-500 text-sm mb-6">Calcul du PP selon barèmes 2026</p>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-4">Paramètres</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Brut mensuel (€)</label>
              <input type="number" value={form.brut} onChange={e => setForm({ ...form, brut: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-lg font-mono" step="0.01" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Statut</label>
              <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="employe">Employé</option>
                <option value="ouvrier">Ouvrier</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Situation familiale</label>
              <select value={form.situation} onChange={e => setForm({ ...form, situation: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="isole">Isolé</option>
                <option value="marie_2rev">Marié - 2 revenus</option>
                <option value="marie_1rev">Marié - 1 revenu</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Enfants à charge</label>
              <input type="number" value={form.enfants} onChange={e => setForm({ ...form, enfants: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" min="0" max="8" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.handicap} onChange={e => setForm({ ...form, handicap: e.target.checked })} />
              Handicap reconnu
            </label>
            <button onClick={calculer} className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition">
              Calculer le PP
            </button>
          </div>
        </div>

        <div className="col-span-2">
          {result && (
            <div className="space-y-4">
              {/* Résumé */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Brut', val: result.brut, color: 'text-slate-700' },
                  { label: 'ONSS 13.07%', val: result.onss, color: 'text-orange-600' },
                  { label: 'PP', val: result.pp, color: 'text-red-600' },
                  { label: 'Net estimé', val: result.net, color: 'text-green-600' },
                ].map(c => (
                  <div key={c.label} className="bg-white p-4 rounded-xl border">
                    <p className="text-xs text-slate-500">{c.label}</p>
                    <p className={`text-xl font-bold font-mono ${c.color}`}>{c.val.toFixed(2)} €</p>
                  </div>
                ))}
              </div>

              {/* Détail tranches */}
              <div className="bg-white p-5 rounded-xl border shadow-sm">
                <h3 className="font-semibold mb-3">Détail par tranches</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b">
                      <th className="pb-2">Tranche</th><th className="pb-2">Taux</th><th className="pb-2">Base</th><th className="pb-2 text-right">PP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.details.map((d, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-2 font-mono text-xs">{d.tranche}</td>
                        <td className="py-2">{d.taux}</td>
                        <td className="py-2 font-mono">{d.base} €</td>
                        <td className="py-2 text-right font-mono font-medium">{d.pp} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Réductions */}
              <div className="bg-white p-5 rounded-xl border shadow-sm">
                <h3 className="font-semibold mb-3">Réductions appliquées</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Réduction forfaitaire</span><span className="text-green-600 font-mono">- {result.red_forfaitaire.toFixed(2)} €</span></div>
                  {result.red_enfants > 0 && <div className="flex justify-between"><span>Réduction enfants ({form.enfants})</span><span className="text-green-600 font-mono">- {result.red_enfants.toFixed(2)} €</span></div>}
                  {result.bonus_emploi > 0 && <div className="flex justify-between"><span>Bonus à l'emploi</span><span className="text-green-600 font-mono">- {result.bonus_emploi.toFixed(2)} €</span></div>}
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Taux effectif PP</span><span className="text-red-600">{result.taux_effectif}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!result && (
            <div className="bg-white p-12 rounded-xl border text-center text-slate-400">
              <p className="text-4xl mb-3">🧮</p>
              <p>Entrez un salaire brut et cliquez sur Calculer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
