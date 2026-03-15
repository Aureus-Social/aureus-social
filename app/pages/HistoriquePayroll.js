'use client';
import { useState, useEffect, useMemo } from 'react';
import { TX_ONSS_W, TX_ONSS_E, quickPP, fmt } from '@/app/lib/helpers';

const GOLD = '#c6a34e';
const TYPES = [
  { id: 'employe',   label: 'Employé',   icon: '👔', color: '#5B9BD6' },
  { id: 'ouvrier',   label: 'Ouvrier',   icon: '👷', color: '#4CAF80' },
  { id: 'dirigeant', label: 'Dirigeant', icon: '👑', color: GOLD },
  { id: 'societe',   label: 'Société',   icon: '🏢', color: '#a78bfa' },
];
const MOIS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const now = new Date();

function calcFiche(gross, type, regime = 100) {
  const brutR = Math.round(gross * (regime / 100) * 100) / 100;
  if (type === 'dirigeant') {
    // Dirigeants : pas d'ONSS personnel standard, cotisation sociale ~20.5%
    const cotis = Math.round(brutR * 0.205 * 100) / 100;
    const pp = Math.round(quickPP ? quickPP(brutR) : brutR * 0.25 * 100) / 100;
    const net = Math.round((brutR - cotis - pp) * 100) / 100;
    return { brutR, onssW: 0, onssE: 0, pp, css: 0, net, coutEmpl: brutR, cotis_dirigeant: cotis };
  }
  if (type === 'societe') {
    // Société : rémunération dirigeant d'entreprise via société
    const pp = Math.round(brutR * 0.25 * 100) / 100;
    const net = Math.round((brutR - pp) * 100) / 100;
    return { brutR, onssW: 0, onssE: 0, pp, css: 0, net, coutEmpl: brutR, cotis_dirigeant: 0 };
  }
  const onssW = Math.round(brutR * TX_ONSS_W * 100) / 100;
  const onssE = Math.round(brutR * TX_ONSS_E * 100) / 100;
  const pp = Math.round((quickPP ? quickPP(brutR - onssW) : (brutR - onssW) * 0.25) * 100) / 100;
  const css = 0; // calcCSS sera ajouté ultérieurement
  const onva = type === 'ouvrier' ? Math.round(brutR * 0.1584 * 100) / 100 : 0;
  const net = Math.round((brutR - onssW - pp - css) * 100) / 100;
  const coutEmpl = Math.round((brutR + onssE + (type === 'ouvrier' ? onva : 0)) * 100) / 100;
  return { brutR, onssW, onssE, pp, css, net, coutEmpl, onva: onva || 0 };
}

export default function HistoriquePayroll({ state, dispatch }) {
  const [tab, setTab] = useState('saisie');
  const [type, setType] = useState('employe');
  const [form, setForm] = useState({ nom: '', prenom: '', niss: '', gross: '', regime: 100, cp: '200', cheques: 0, eco: 0 });
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [fiches, setFiches] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filterType, setFilterType] = useState('tous');

  const calc = useMemo(() => {
    if (!form.gross || isNaN(form.gross)) return null;
    return calcFiche(parseFloat(form.gross), type, parseInt(form.regime));
  }, [form.gross, form.regime, type]);

  const loadFiches = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/payroll-history?year=${year}&month=${month}${filterType !== 'tous' ? `&type=${filterType}` : ''}`);
      const j = await r.json();
      if (j.ok) setFiches(j.data || []);
    } catch(e) {}
    setLoading(false);
  };

  const [sending, setSending] = useState(null);

  const sendEmail = async (fiche) => {
    const email = prompt(`Email pour ${fiche.employe_prenom} ${fiche.employe_nom} :`, fiche.employe_email || '');
    if (!email) return;
    setSending(fiche.id);
    try {
      const res = await fetch('/api/email-fiche', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiche_id: fiche.id,
          fiche: fiche,
          email_override: email,
          employe: { nom: fiche.employe_nom, prenom: fiche.employe_prenom, email },
        })
      });
      const j = await res.json();
      if (j.ok) alert('✅ Email envoyé !');
      else alert('❌ Erreur : ' + j.error);
    } catch(e) { alert('❌ Erreur réseau'); }
    setSending(null);
  };

  const loadHistory = async () => {
    try {
      const r = await fetch(`/api/payroll-history?mode=history`);
      const j = await r.json();
      if (j.ok) setHistory(j.data || []);
    } catch(e) {}
  };

  useEffect(() => { loadFiches(); }, [month, year, filterType]);
  useEffect(() => { if (tab === 'historique') loadHistory(); }, [tab]);

  const saveFiche = async () => {
    if (!calc) return;
    setLoading(true);
    try {
      const payload = {
        employe_nom: form.nom, employe_prenom: form.prenom, niss: form.niss,
        employe_type: type, gross: calc.brutR, regime: form.regime, cp: form.cp,
        onss_w: calc.onssW, onss_e: calc.onssE, pp: calc.pp, css: calc.css,
        net: calc.net, cout_empl: calc.coutEmpl, onva: calc.onva || 0,
        cotis_dirigeant: calc.cotis_dirigeant || 0,
        cheques_repas: parseFloat(form.cheques || 0),
        eco_cheques: parseFloat(form.eco || 0),
        month, year,
      };
      const r = await fetch('/api/payroll-history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (j.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setForm({ nom: '', prenom: '', niss: '', gross: '', regime: 100, cp: '200', cheques: 0, eco: 0 });
        loadFiches();
      }
    } catch(e) {}
    setLoading(false);
  };

  const totaux = useMemo(() => ({
    brut: fiches.reduce((s,f) => s + parseFloat(f.gross||0), 0),
    net: fiches.reduce((s,f) => s + parseFloat(f.net||0), 0),
    coutEmpl: fiches.reduce((s,f) => s + parseFloat(f.cout_empl||0), 0),
    onssE: fiches.reduce((s,f) => s + parseFloat(f.onss_e||0), 0),
    pp: fiches.reduce((s,f) => s + parseFloat(f.pp||0), 0),
  }), [fiches]);

  const typeInfo = TYPES.find(t => t.id === type);

  return (
    <div style={{ padding: 24, fontFamily: 'Inter, sans-serif', color: '#e8e6e0', maxWidth: 1200 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: 0 }}>📊 Historique Paie</h2>
        <span style={{ fontSize: 11, color: '#6B6860', background: '#1A1A1E', padding: '3px 10px', borderRadius: 20 }}>
          {MOIS[month-1]} {year}
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#141416', borderRadius: 8, padding: 4 }}>
        {[['saisie','➕ Saisir fiche'],['fiches','📋 Fiches du mois'],['historique','📈 Historique']].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: tab === id ? GOLD : 'transparent', color: tab === id ? '#000' : '#6B6860',
          }}>{label}</button>
        ))}
      </div>

      {/* SAISIE */}
      {tab === 'saisie' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Formulaire */}
          <div style={{ background: '#141416', border: '1px solid #2A2A30', borderRadius: 10, padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: '#6B6860', display: 'block', marginBottom: 6 }}>TYPE DE TRAVAILLEUR</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {TYPES.map(t => (
                  <button key={t.id} onClick={() => setType(t.id)} style={{
                    flex: 1, padding: '8px 4px', borderRadius: 6, border: `1px solid ${type === t.id ? t.color : '#2A2A30'}`,
                    background: type === t.id ? t.color + '20' : 'transparent', cursor: 'pointer', fontSize: 11, color: type === t.id ? t.color : '#6B6860',
                  }}>{t.icon} {t.label}</button>
                ))}
              </div>
            </div>

            {/* Période */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: '#6B6860', display: 'block', marginBottom: 4 }}>MOIS</label>
                <select value={month} onChange={e => setMonth(+e.target.value)} style={{ width: '100%', background: '#1A1A1E', border: '1px solid #2A2A30', color: '#e8e6e0', padding: '8px', borderRadius: 6, fontSize: 13 }}>
                  {MOIS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#6B6860', display: 'block', marginBottom: 4 }}>ANNÉE</label>
                <select value={year} onChange={e => setYear(+e.target.value)} style={{ width: '100%', background: '#1A1A1E', border: '1px solid #2A2A30', color: '#e8e6e0', padding: '8px', borderRadius: 6, fontSize: 13 }}>
                  {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Identité */}
            {['nom','prenom','niss'].map(field => (
              <div key={field} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: '#6B6860', display: 'block', marginBottom: 4 }}>{field.toUpperCase()}</label>
                <input value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                  style={{ width: '100%', background: '#1A1A1E', border: '1px solid #2A2A30', color: '#e8e6e0', padding: '8px', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            ))}

            {/* Salaire */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: '#6B6860', display: 'block', marginBottom: 4 }}>SALAIRE BRUT (€)</label>
              <input type="number" value={form.gross} onChange={e => setForm(p => ({ ...p, gross: e.target.value }))}
                placeholder="ex: 3500" style={{ width: '100%', background: '#1A1A1E', border: '1px solid #2A2A30', color: '#e8e6e0', padding: '8px', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: '#6B6860', display: 'block', marginBottom: 4 }}>RÉGIME (%)</label>
                <input type="number" min="10" max="100" value={form.regime} onChange={e => setForm(p => ({ ...p, regime: e.target.value }))}
                  style={{ width: '100%', background: '#1A1A1E', border: '1px solid #2A2A30', color: '#e8e6e0', padding: '8px', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#6B6860', display: 'block', marginBottom: 4 }}>CP</label>
                <input value={form.cp} onChange={e => setForm(p => ({ ...p, cp: e.target.value }))}
                  style={{ width: '100%', background: '#1A1A1E', border: '1px solid #2A2A30', color: '#e8e6e0', padding: '8px', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            </div>

            <button onClick={saveFiche} disabled={!calc || loading} style={{
              width: '100%', padding: 12, background: saved ? '#4CAF80' : GOLD, color: '#000', border: 'none',
              borderRadius: 6, fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>
              {saved ? '✅ Sauvegardé !' : loading ? 'Sauvegarde...' : '💾 Sauvegarder la fiche'}
            </button>
          </div>

          {/* Résultat calcul */}
          <div style={{ background: '#141416', border: `1px solid ${typeInfo?.color || GOLD}30`, borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: typeInfo?.color || GOLD, marginBottom: 16 }}>
              {typeInfo?.icon} Calcul {typeInfo?.label}
            </div>
            {calc ? (
              <>
                {[
                  ['Salaire brut', fmt(calc.brutR) + ' €', '#e8e6e0'],
                  type !== 'dirigeant' && type !== 'societe' && ['ONSS personnel (13,07%)', '- ' + fmt(calc.onssW) + ' €', '#E05C3A'],
                  type !== 'dirigeant' && type !== 'societe' && ['Précompte prof.', '- ' + fmt(calc.pp) + ' €', '#E05C3A'],
                  type !== 'dirigeant' && type !== 'societe' && calc.css > 0 && ['Cotisation spéciale SS', '- ' + fmt(calc.css) + ' €', '#E05C3A'],
                  type === 'ouvrier' && ['ONVA vacances (15,84%)', fmt(calc.onva) + ' €', '#6B6860'],
                  type === 'dirigeant' && ['Cotisation sociale (~20,5%)', '- ' + fmt(calc.cotis_dirigeant) + ' €', '#E05C3A'],
                  type === 'dirigeant' && ['Précompte dirigeant', '- ' + fmt(calc.pp) + ' €', '#E05C3A'],
                ].filter(Boolean).map(([l, v, c], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1A1A1E', fontSize: 13 }}>
                    <span style={{ color: '#6B6860' }}>{l}</span>
                    <span style={{ color: c, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 4, background: '#0D0D0E', borderRadius: 6, paddingLeft: 12, paddingRight: 12 }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>NET À PAYER</span>
                  <span style={{ color: '#4CAF80', fontWeight: 800, fontSize: 18 }}>{fmt(calc.net)} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', marginTop: 8, background: '#1A1A1E', borderRadius: 6 }}>
                  <span style={{ color: '#6B6860', fontSize: 12 }}>Coût total employeur</span>
                  <span style={{ color: GOLD, fontWeight: 600 }}>{fmt(calc.coutEmpl)} €</span>
                </div>
                {type !== 'dirigeant' && type !== 'societe' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', marginTop: 6, background: '#1A1A1E', borderRadius: 6 }}>
                    <span style={{ color: '#6B6860', fontSize: 12 }}>ONSS patronal</span>
                    <span style={{ color: '#5B9BD6', fontWeight: 600 }}>{fmt(calc.onssE)} €</span>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#6B6860', fontSize: 13, paddingTop: 40 }}>
                Entrez un salaire brut pour calculer
              </div>
            )}
          </div>
        </div>
      )}

      {/* FICHES DU MOIS */}
      {tab === 'fiches' && (
        <div>
          {/* Filtres + KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              ['Total brut', fmt(totaux.brut) + ' €', GOLD],
              ['Total net', fmt(totaux.net) + ' €', '#4CAF80'],
              ['Coût employeur', fmt(totaux.coutEmpl) + ' €', '#E05C3A'],
              ['ONSS patronal', fmt(totaux.onssE) + ' €', '#5B9BD6'],
              ['Précompte', fmt(totaux.pp) + ' €', '#a78bfa'],
            ].map(([l,v,c]) => (
              <div key={l} style={{ background: '#141416', border: '1px solid #2A2A30', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                <div style={{ fontSize: 10, color: '#6B6860', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Filtre type */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {[{id:'tous',label:'Tous',icon:'👥'},...TYPES].map(t => (
              <button key={t.id} onClick={() => setFilterType(t.id)} style={{
                padding: '6px 14px', borderRadius: 20, border: `1px solid ${filterType===t.id ? GOLD : '#2A2A30'}`,
                background: filterType===t.id ? GOLD+'20' : 'transparent', color: filterType===t.id ? GOLD : '#6B6860',
                cursor: 'pointer', fontSize: 12,
              }}>{t.icon} {t.label}</button>
            ))}
          </div>

          {/* Table fiches */}
          {loading ? <div style={{ textAlign: 'center', color: '#6B6860', padding: 40 }}>Chargement...</div> : fiches.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6B6860', padding: 40 }}>Aucune fiche pour {MOIS[month-1]} {year}</div>
          ) : (
            <div style={{ background: '#141416', border: '1px solid #2A2A30', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#0D0D0E' }}>
                    {['Type','Nom','NISS','CP','Brut','Net','Coût empl.','Statut'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#6B6860', fontSize: 11, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fiches.map((f,i) => {
                    const t = TYPES.find(t => t.id === f.employe_type);
                    return (
                      <tr key={f.id} style={{ borderBottom: '1px solid #1A1A1E' }}>
                        <td style={{ padding: '10px 12px' }}><span style={{ color: t?.color }}>{t?.icon} {t?.label}</span></td>
                        <td style={{ padding: '10px 12px', color: '#e8e6e0' }}>{f.employe_prenom} {f.employe_nom}</td>
                        <td style={{ padding: '10px 12px', color: '#6B6860', fontFamily: 'monospace', fontSize: 11 }}>{f.employe_niss || '—'}</td>
                        <td style={{ padding: '10px 12px', color: '#6B6860' }}>{f.cp}</td>
                        <td style={{ padding: '10px 12px', color: GOLD, fontWeight: 600 }}>{fmt(f.gross)} €</td>
                        <td style={{ padding: '10px 12px', color: '#4CAF80', fontWeight: 600 }}>{fmt(f.net)} €</td>
                        <td style={{ padding: '10px 12px', color: '#E05C3A' }}>{fmt(f.cout_empl)} €</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 3, fontSize: 10, background: f.statut==='paye'?'#4CAF8020':'#c6a34e20', color: f.statut==='paye'?'#4CAF80':GOLD }}>{f.statut}</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <button onClick={() => sendEmail(f)} disabled={sending === f.id} style={{
                            background: sending===f.id ? '#2A2A30' : '#1A1A1E', color: sending===f.id ? '#6B6860' : '#C9963A',
                            border: '1px solid #2A2A30', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 11
                          }}>{sending===f.id ? '⏳' : '📧'}</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* HISTORIQUE */}
      {tab === 'historique' && (
        <div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6B6860', padding: 60 }}>Aucun historique disponible</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {history.map(h => (
                <div key={h.id} style={{ background: '#141416', border: '1px solid #2A2A30', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ minWidth: 80 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: GOLD }}>{MOIS[(h.month||1)-1]}</div>
                    <div style={{ fontSize: 11, color: '#6B6860' }}>{h.year}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {h.nb_employes > 0 && <span style={{ fontSize: 11, color: '#5B9BD6', background: '#5B9BD620', padding: '2px 8px', borderRadius: 3 }}>👔 {h.nb_employes} emp.</span>}
                    {h.nb_ouvriers > 0 && <span style={{ fontSize: 11, color: '#4CAF80', background: '#4CAF8020', padding: '2px 8px', borderRadius: 3 }}>👷 {h.nb_ouvriers} ouv.</span>}
                    {h.nb_dirigeants > 0 && <span style={{ fontSize: 11, color: GOLD, background: GOLD+'20', padding: '2px 8px', borderRadius: 3 }}>👑 {h.nb_dirigeants} dir.</span>}
                    {h.nb_societes > 0 && <span style={{ fontSize: 11, color: '#a78bfa', background: '#a78bfa20', padding: '2px 8px', borderRadius: 3 }}>🏢 {h.nb_societes} soc.</span>}
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: GOLD }}>{fmt(h.total_brut)} €</div>
                      <div style={{ fontSize: 10, color: '#6B6860' }}>brut total</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#4CAF80' }}>{fmt(h.total_net)} €</div>
                      <div style={{ fontSize: 10, color: '#6B6860' }}>net total</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#E05C3A' }}>{fmt(h.total_cout_empl)} €</div>
                      <div style={{ fontSize: 10, color: '#6B6860' }}>coût empl.</div>
                    </div>
                  </div>
                  {h.cloture && <span style={{ fontSize: 10, color: '#4CAF80', background: '#4CAF8020', padding: '3px 10px', borderRadius: 10 }}>✅ Clôturé</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
