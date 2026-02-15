'use client';
// app/sprint9/net-brut/page.jsx
import { useState } from 'react';

export default function NetBrutPage() {
  const [form, setForm] = useState({ net: 2500, statut: 'employe', situation: 'isole', enfants: 0 });
  const [result, setResult] = useState(null);

  function calculer() {
    const net = parseFloat(form.net) || 0;
    // Itération inverse: on cherche le brut qui donne ce net
    let brut_low = net, brut_high = net * 2.5, brut = net * 1.6;
    
    for (let i = 0; i < 50; i++) {
      brut = (brut_low + brut_high) / 2;
      const onss = form.statut === 'employe' ? brut * 0.1307 : 0;
      const imposable = brut - onss;
      
      // PP simplifié
      let pp = 0;
      const tranches = [
        { min: 0, max: 1095.09, t: 0 }, { min: 1095.09, max: 1544.17, t: 0.2672 },
        { min: 1544.17, max: 2652.50, t: 0.4280 }, { min: 2652.50, max: 4842.83, t: 0.4818 },
        { min: 4842.83, max: 999999, t: 0.5350 },
      ];
      for (const tr of tranches) {
        if (imposable <= tr.min) break;
        pp += (Math.min(imposable, tr.max) - tr.min) * tr.t;
      }
      pp = Math.max(0, pp - 555);
      const nEnf = parseInt(form.enfants) || 0;
      const redEnf = [0, 1850, 4760, 10660, 17220][Math.min(nEnf, 4)] || 17220 + (nEnf - 4) * 6560;
      pp = Math.max(0, pp - redEnf / 12 * 0.25);
      if (imposable <= 3068.33) pp = Math.max(0, pp - Math.min(imposable * 0.3314, 510.83));
      
      const net_calc = brut - onss - pp;
      if (Math.abs(net_calc - net) < 0.01) break;
      if (net_calc > net) brut_high = brut; else brut_low = brut;
    }

    const onss = form.statut === 'employe' ? Math.round(brut * 0.1307 * 100) / 100 : 0;
    const pp = Math.round((brut - onss - net) * 100) / 100;
    const cout_employeur = Math.round(brut * (1 + 0.2492 + 0.0567) * 100) / 100;

    setResult({
      net_demande: net, brut: Math.round(brut * 100) / 100, onss, pp,
      net_verif: Math.round((brut - onss - pp) * 100) / 100,
      cout_employeur, ratio: (cout_employeur / net).toFixed(2),
    });
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">🔄 Calculateur Net → Brut</h1>
      <p className="text-slate-500 text-sm mb-6">Retrouver le brut à partir d'un net souhaité</p>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold mb-4">Net souhaité</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Net mensuel souhaité (€)</label>
              <input type="number" value={form.net} onChange={e => setForm({ ...form, net: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-2xl font-mono text-green-600 font-bold" step="0.01" />
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
              <label className="block text-sm font-medium text-slate-600 mb-1">Situation</label>
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
            <button onClick={calculer} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition text-lg">
              🔄 Calculer le Brut
            </button>
          </div>
        </div>

        <div>
          {result ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-6 rounded-xl">
                <p className="text-sm opacity-80">Brut mensuel nécessaire</p>
                <p className="text-4xl font-bold font-mono mt-1">{result.brut.toFixed(2)} €</p>
                <p className="text-sm opacity-80 mt-2">Pour obtenir {result.net_demande.toFixed(2)} € net</p>
              </div>
              <div className="bg-white p-5 rounded-xl border shadow-sm space-y-3">
                <h3 className="font-semibold">Décomposition</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Brut', val: result.brut, color: '' },
                    { label: '- ONSS 13.07%', val: result.onss, color: 'text-orange-600' },
                    { label: '- Précompte prof.', val: result.pp, color: 'text-red-600' },
                    { label: '= Net', val: result.net_verif, color: 'text-green-600 font-bold' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between">
                      <span>{r.label}</span>
                      <span className={`font-mono ${r.color}`}>{r.val.toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">Coût employeur total</span>
                    <span className="font-mono font-bold text-purple-600">{result.cout_employeur.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Ratio coût/net</span>
                    <span>×{result.ratio}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl border text-center text-slate-400 h-full flex flex-col items-center justify-center">
              <p className="text-4xl mb-3">🔄</p>
              <p>Entrez un montant net et cliquez Calculer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
