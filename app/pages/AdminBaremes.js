'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';

// ═══ CATÉGORIES DE PARAMÈTRES ÉDITABLES ═══
const PARAM_GROUPS = [
  {
    id: 'onss', titre: 'ONSS', icon: '🏛️', color: '#3b82f6',
    desc: 'Cotisations sociales employeur et travailleur',
    params: [
      { key: 'onss.travailleur', label: 'Cotisation travailleur', unit: '%', mult: 100, step: 0.01, path: 'onss.travailleur' },
      { key: 'onss.employeur.total', label: 'Cotisation employeur totale', unit: '%', mult: 100, step: 0.01, path: 'onss.employeur.total' },
      { key: 'onss.ouvrier108', label: 'Majoration ouvriers', unit: 'x', mult: 1, step: 0.01, path: 'onss.ouvrier108' },
    ]
  },
  {
    id: 'pp', titre: 'Précompte professionnel', icon: '💰', color: '#f59e0b',
    desc: 'Tranches, frais professionnels, quotité exemptée',
    params: [
      { key: 'pp.fraisPro.salarie.pct', label: 'Frais pro salarié (%)', unit: '%', mult: 100, step: 0.01, path: 'pp.fraisPro.salarie.pct' },
      { key: 'pp.fraisPro.salarie.max', label: 'Frais pro salarié (max)', unit: '€', mult: 1, step: 1, path: 'pp.fraisPro.salarie.max' },
      { key: 'pp.quotiteExemptee.bareme1', label: 'Quotité exemptée barème 1', unit: '€', mult: 1, step: 0.01, path: 'pp.quotiteExemptee.bareme1' },
      { key: 'pp.quotientConjugal.max', label: 'Quotient conjugal max', unit: '€', mult: 1, step: 1, path: 'pp.quotientConjugal.max' },
    ]
  },
  {
    id: 'remuneration', titre: 'Rémunération', icon: '💵', color: '#22c55e',
    desc: 'RMMMG, index, pécule de vacances',
    params: [
      { key: 'remuneration.RMMMG.montant18ans', label: 'RMMMG (18 ans)', unit: '€/mois', mult: 1, step: 0.01, path: 'remuneration.RMMMG.montant18ans' },
      { key: 'remuneration.indexSante.coeff', label: 'Coefficient index santé', unit: '', mult: 1, step: 0.0001, path: 'remuneration.indexSante.coeff' },
      { key: 'remuneration.peculeVacances.double.pct', label: 'Double pécule vacances', unit: '%', mult: 100, step: 0.01, path: 'remuneration.peculeVacances.double.pct' },
    ]
  },
  {
    id: 'cheques', titre: 'Chèques-repas & Éco', icon: '🍽️', color: '#ef4444',
    desc: 'Valeurs maximales, parts travailleur/employeur',
    params: [
      { key: 'chequesRepas.valeurFaciale.max', label: 'Chèque-repas (max valeur faciale)', unit: '€', mult: 1, step: 0.01, path: 'chequesRepas.valeurFaciale.max' },
      { key: 'chequesRepas.partPatronale.max', label: 'Part patronale max', unit: '€', mult: 1, step: 0.01, path: 'chequesRepas.partPatronale.max' },
      { key: 'chequesRepas.partTravailleur.min', label: 'Part travailleur min', unit: '€', mult: 1, step: 0.01, path: 'chequesRepas.partTravailleur.min' },
    ]
  },
  {
    id: 'frais', titre: 'Frais propres employeur', icon: '🏠', color: '#8b5cf6',
    desc: 'Forfaits bureau, km, télétravail',
    params: [
      { key: 'fraisPropres.forfaitBureau.max', label: 'Forfait bureau / télétravail', unit: '€/mois', mult: 1, step: 0.01, path: 'fraisPropres.forfaitBureau.max' },
      { key: 'fraisPropres.forfaitDeplacement.voiture', label: 'Indemnité km voiture', unit: '€/km', mult: 1, step: 0.0001, path: 'fraisPropres.forfaitDeplacement.voiture' },
      { key: 'fraisPropres.forfaitDeplacement.velo', label: 'Indemnité km vélo', unit: '€/km', mult: 1, step: 0.01, path: 'fraisPropres.forfaitDeplacement.velo' },
    ]
  },
  {
    id: 'atn', titre: 'Avantages en nature', icon: '🚗', color: '#06b6d4',
    desc: 'ATN voiture, GSM, PC, internet',
    params: [
      { key: 'atn.voiture.min', label: 'ATN voiture minimum', unit: '€/an', mult: 1, step: 1, path: 'atn.voiture.min' },
      { key: 'atn.gsm.forfait', label: 'ATN GSM', unit: '€/mois', mult: 1, step: 0.5, path: 'atn.gsm.forfait' },
      { key: 'atn.pc.forfait', label: 'ATN PC', unit: '€/mois', mult: 1, step: 0.5, path: 'atn.pc.forfait' },
      { key: 'atn.internet.forfait', label: 'ATN Internet', unit: '€/mois', mult: 1, step: 0.5, path: 'atn.internet.forfait' },
    ]
  },
  {
    id: 'contrats', titre: 'Seuils contractuels', icon: '📝', color: '#f43f5e',
    desc: 'Non-concurrence, écolage, arbitrage',
    params: [
      { key: 'contrats.clauseNonConcurrence.brut_min', label: 'Non-concurrence seuil bas', unit: '€/an', mult: 1, step: 1, path: 'contrats.clauseNonConcurrence.brut_min' },
      { key: 'contrats.clauseNonConcurrence.brut_mid', label: 'Non-concurrence seuil haut', unit: '€/an', mult: 1, step: 1, path: 'contrats.clauseNonConcurrence.brut_mid' },
      { key: 'contrats.ecolecholage.brut_min', label: 'Écolage seuil minimum', unit: '€/an', mult: 1, step: 1, path: 'contrats.ecolecholage.brut_min' },
    ]
  },
  {
    id: 'cct90', titre: 'Bonus CCT 90', icon: '🎯', color: '#14b8a6',
    desc: 'Plafonds bonus collectif',
    params: [
      { key: 'cct90.plafondONSS', label: 'Plafond ONSS', unit: '€', mult: 1, step: 1 },
      { key: 'cct90.plafondFiscal', label: 'Plafond fiscal', unit: '€', mult: 1, step: 1 },
      { key: 'cct90.cotisationPatronale', label: 'Cotisation patronale', unit: '%', mult: 100, step: 0.01 },
    ]
  },
];

// ═══ TIMELINE ENTRIES TEMPLATE ═══
const TIMELINE_TEMPLATE = {
  chequesRepas: { valeurMax: null, partPatronaleMax: null, partTravailleurMin: null },
  teletravail: { forfaitBureau: null, internet: null },
  seuils: { ecolage: null, nonConcurrenceBas: null, nonConcurrenceHaut: null },
  cct90: { plafondONSS: null, plafondFiscal: null },
  rmmmg: { montant18: null },
  indemKm: { voiture: null, velo: null },
  pp: { fraisProMax: null, quotiteExemptee1: null },
};

// Helper: get nested value
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);
}

// Helper: set nested value
function setNestedValue(obj, path, value) {
  const clone = JSON.parse(JSON.stringify(obj));
  const keys = path.split('.');
  let current = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  return clone;
}

export default function AdminBaremes({ loisBelges, loisTimeline, loisCurrent, onUpdate }) {
  const [tab, setTab] = useState('current');
  const [editValues, setEditValues] = useState({});
  const [dirty, setDirty] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newEntry, setNewEntry] = useState({ date: '', source: '', values: {} });
  const [showNewForm, setShowNewForm] = useState(false);
  const [customEntries, setCustomEntries] = useState([]);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Load LOIS_BELGES values into edit state
  useEffect(() => {
    if (!loisBelges) return;
    const vals = {};
    PARAM_GROUPS.forEach(g => {
      g.params.forEach(p => {
        const v = getNestedValue(loisBelges, p.path);
        if (v !== undefined) vals[p.key] = v;
      });
    });
    setEditValues(vals);
  }, [loisBelges]);

  // Load custom timeline entries
  useEffect(() => {
    fetch('/api/baremes').then(r => r.json()).then(d => {
      if (d.entries) setCustomEntries(d.entries);
    }).catch(() => {});
  }, []);

  const handleValueChange = useCallback((key, rawVal, mult) => {
    const numVal = parseFloat(rawVal);
    if (isNaN(numVal)) return;
    const actualVal = mult !== 1 ? numVal / mult : numVal;
    setEditValues(prev => ({ ...prev, [key]: actualVal }));
    setDirty(prev => ({ ...prev, [key]: true }));
    setSaved(false);
  }, []);

  const dirtyCount = useMemo(() => Object.values(dirty).filter(Boolean).length, [dirty]);

  // Save changes
  const handleSave = async () => {
    if (!dirtyCount || !onUpdate) return;
    setSaving(true);
    try {
      // Build updated LOIS_BELGES
      let updated = JSON.parse(JSON.stringify(loisBelges));
      Object.entries(dirty).forEach(([key, isDirty]) => {
        if (!isDirty) return;
        const param = PARAM_GROUPS.flatMap(g => g.params).find(p => p.key === key);
        if (param && editValues[key] !== undefined) {
          updated = setNestedValue(updated, param.path, editValues[key]);
        }
      });
      onUpdate(updated);
      setDirty({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Erreur: ' + e.message);
    }
    setSaving(false);
  };

  // Save new timeline entry
  const handleSaveTimeline = async () => {
    if (!newEntry.date) { alert('Date obligatoire'); return; }
    // Clean nulls from values
    const cleanValues = {};
    Object.entries(newEntry.values).forEach(([cat, vals]) => {
      const clean = {};
      Object.entries(vals).forEach(([k, v]) => {
        if (v !== null && v !== '' && v !== undefined) clean[k] = parseFloat(v);
      });
      if (Object.keys(clean).length > 0) cleanValues[cat] = clean;
    });
    if (Object.keys(cleanValues).length === 0) { alert('Au moins une valeur requise'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/baremes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          effective_date: newEntry.date,
          source: newEntry.source || 'Admin — mise à jour manuelle',
          values: cleanValues,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomEntries(prev => [...prev, data.entry]);
        setNewEntry({ date: '', source: '', values: {} });
        setShowNewForm(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Erreur: ' + (data.error || 'Inconnue'));
      }
    } catch (e) {
      alert('Erreur réseau: ' + e.message);
    }
    setSaving(false);
  };

  // Filter params by search
  const filteredGroups = useMemo(() => {
    if (!searchQ.trim()) return PARAM_GROUPS;
    const q = searchQ.toLowerCase();
    return PARAM_GROUPS.map(g => ({
      ...g,
      params: g.params.filter(p => p.label.toLowerCase().includes(q) || p.key.toLowerCase().includes(q))
    })).filter(g => g.params.length > 0 || g.titre.toLowerCase().includes(q));
  }, [searchQ]);

  // ═══ STYLES ═══
  const s = {
    pg: { fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', maxWidth: 1100, margin: '0 auto', padding: 24, background: '#0a0e1a', color: '#e2e8f0', minHeight: '100vh' },
    hd: { marginBottom: 32 },
    ti: { fontSize: 28, fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: 12 },
    badge: { fontSize: 12, padding: '4px 10px', borderRadius: 20, fontWeight: 600 },
    tabs: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #1e293b', paddingBottom: 4 },
    tab: (a) => ({ padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: a ? 700 : 500, color: a ? '#f8fafc' : '#64748b', background: a ? '#1e293b' : 'transparent', borderRadius: '8px 8px 0 0', borderBottom: a ? '2px solid #3b82f6' : 'none' }),
    search: { width: '100%', padding: '10px 16px 10px 40px', borderRadius: 10, border: '1px solid #334155', background: '#111827', color: '#f1f5f9', fontSize: 14, outline: 'none', marginBottom: 20 },
    grp: (c, open) => ({ background: '#111827', border: `1px solid ${c}30`, borderRadius: 12, marginBottom: 8, borderLeft: `4px solid ${c}`, overflow: 'hidden' }),
    grpH: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', userSelect: 'none' },
    grpI: { fontSize: 24 },
    grpT: { flex: 1, fontSize: 16, fontWeight: 700, color: '#f1f5f9' },
    grpD: { fontSize: 12, color: '#64748b' },
    paramRow: (isDirty) => ({ display: 'grid', gridTemplateColumns: '1fr 180px 60px', gap: 12, alignItems: 'center', padding: '10px 16px 10px 52px', borderTop: '1px solid #1e293b20', background: isDirty ? '#3b82f608' : 'transparent' }),
    paramLabel: { fontSize: 13, color: '#cbd5e1', fontWeight: 500 },
    input: (isDirty) => ({ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${isDirty ? '#3b82f6' : '#334155'}`, background: isDirty ? '#3b82f610' : '#0f172a', color: '#f1f5f9', fontSize: 14, fontFamily: 'monospace', textAlign: 'right', outline: 'none' }),
    unit: { fontSize: 12, color: '#64748b', textAlign: 'right' },
    saveBar: { position: 'sticky', bottom: 0, background: '#111827', borderTop: '1px solid #334155', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px 12px 0 0', marginTop: 20 },
    btn: (primary) => ({ padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, background: primary ? '#3b82f6' : '#1e293b', color: primary ? '#fff' : '#94a3b8', transition: 'all .2s' }),
    tlCard: { background: '#111827', border: '1px solid #1e293b', borderRadius: 12, padding: 16, marginBottom: 8 },
    tlDate: { fontSize: 15, fontWeight: 700, color: '#818cf8' },
    tlSource: { fontSize: 12, color: '#64748b', marginTop: 2 },
    tlVals: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginTop: 12 },
    tlVal: { fontSize: 12, color: '#94a3b8', background: '#0f172a', padding: '6px 10px', borderRadius: 6, fontFamily: 'monospace' },
    formGroup: { marginBottom: 16 },
    formLabel: { fontSize: 13, color: '#94a3b8', marginBottom: 4, display: 'block', fontWeight: 600 },
    formInput: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', fontSize: 14, outline: 'none' },
  };

  return (
    <div style={s.pg}>
      {/* HEADER */}
      <div style={s.hd}>
        <h1 style={s.ti}>
          ⚙️ Admin — Barèmes légaux
          {loisBelges?._meta && <span style={{ ...s.badge, background: '#22c55e20', color: '#4ade80' }}>v{loisBelges._meta.version}</span>}
          {loisBelges?._meta && <span style={{ ...s.badge, background: '#3b82f620', color: '#60a5fa' }}>MAJ: {loisBelges._meta.dateMAJ}</span>}
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
          Modifier les constantes légales belges sans toucher au code source. Les modifications sont appliquées immédiatement aux calculs de paie.
        </p>
      </div>

      {/* TABS */}
      <div style={s.tabs}>
        <button style={s.tab(tab === 'current')} onClick={() => setTab('current')}>📊 Paramètres actuels</button>
        <button style={s.tab(tab === 'timeline')} onClick={() => setTab('timeline')}>📅 Timeline ({(loisTimeline || []).length} entrées)</button>
        <button style={s.tab(tab === 'pp')} onClick={() => setTab('pp')}>💰 Tranches PP</button>
        <button style={s.tab(tab === 'preavis')} onClick={() => setTab('preavis')}>📨 Préavis</button>
      </div>

      {/* TAB: PARAMÈTRES ACTUELS */}
      {tab === 'current' && (
        <div>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <span style={{ position: 'absolute', left: 14, top: 11, color: '#64748b', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
            <input style={s.search} placeholder="Rechercher un paramètre..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
          </div>

          {filteredGroups.map(g => {
            const isOpen = expandedGroup === g.id;
            return (
              <div key={g.id} style={s.grp(g.color, isOpen)}>
                <div style={s.grpH} onClick={() => setExpandedGroup(isOpen ? null : g.id)}>
                  <span style={s.grpI}>{g.icon}</span>
                  <div>
                    <div style={s.grpT}>{g.titre}</div>
                    <div style={s.grpD}>{g.desc}</div>
                  </div>
                  <span style={{ ...s.badge, background: `${g.color}20`, color: g.color }}>{g.params.length} params</span>
                  <span style={{ color: '#64748b', fontSize: 18, transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform .2s' }}>▾</span>
                </div>
                {isOpen && g.params.map(p => {
                  const val = editValues[p.key];
                  const displayVal = val !== undefined ? (p.mult !== 1 ? (val * p.mult).toFixed(p.step < 0.01 ? 4 : 2) : val) : '';
                  const isDirty = dirty[p.key];
                  return (
                    <div key={p.key} style={s.paramRow(isDirty)}>
                      <div style={s.paramLabel}>
                        {p.label}
                        {isDirty && <span style={{ color: '#f59e0b', marginLeft: 8, fontSize: 11 }}>● modifié</span>}
                      </div>
                      <input
                        style={s.input(isDirty)}
                        type="number"
                        step={p.step * (p.mult || 1)}
                        value={displayVal}
                        onChange={e => handleValueChange(p.key, e.target.value, p.mult)}
                      />
                      <div style={s.unit}>{p.unit}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* SAVE BAR */}
          {dirtyCount > 0 && (
            <div style={s.saveBar}>
              <div>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{dirtyCount} modification{dirtyCount > 1 ? 's' : ''}</span>
                <span style={{ color: '#64748b', marginLeft: 12, fontSize: 13 }}>Les changements seront appliqués à tous les calculs</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={s.btn(false)} onClick={() => { setDirty({}); setSaved(false); }}>Annuler</button>
                <button style={s.btn(true)} onClick={handleSave} disabled={saving}>
                  {saving ? '⏳ Sauvegarde...' : '💾 Appliquer les modifications'}
                </button>
              </div>
            </div>
          )}

          {saved && (
            <div style={{ background: '#22c55e15', border: '1px solid #22c55e40', borderRadius: 12, padding: 16, marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>✅</span>
              <div>
                <div style={{ fontWeight: 700, color: '#4ade80' }}>Modifications appliquées</div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>Les calculs de paie utilisent maintenant les nouvelles valeurs</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: TIMELINE */}
      {tab === 'timeline' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', margin: 0 }}>📅 Timeline des modifications légales</h2>
            <button style={s.btn(true)} onClick={() => setShowNewForm(!showNewForm)}>
              {showNewForm ? '✕ Fermer' : '+ Nouvelle entrée'}
            </button>
          </div>

          {/* NEW ENTRY FORM */}
          {showNewForm && (
            <div style={{ background: '#0f172a', border: '1px solid #3b82f640', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#60a5fa', margin: '0 0 16px' }}>Nouvelle entrée timeline</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>Date d'effet *</label>
                  <input type="date" style={s.formInput} value={newEntry.date} onChange={e => setNewEntry(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div style={s.formGroup}>
                  <label style={s.formLabel}>Source (MB, AR, ...)</label>
                  <input style={s.formInput} placeholder="Ex: MB 15/11/2026 — Index" value={newEntry.source} onChange={e => setNewEntry(p => ({ ...p, source: e.target.value }))} />
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: '16px 0 12px' }}>Valeurs modifiées</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
                {[
                  { cat: 'chequesRepas', label: 'Chèque-repas max', key: 'valeurMax' },
                  { cat: 'chequesRepas', label: 'Part patronale max', key: 'partPatronaleMax' },
                  { cat: 'teletravail', label: 'Forfait bureau', key: 'forfaitBureau' },
                  { cat: 'seuils', label: 'Seuil écolage', key: 'ecolage' },
                  { cat: 'seuils', label: 'Non-concurrence bas', key: 'nonConcurrenceBas' },
                  { cat: 'seuils', label: 'Non-concurrence haut', key: 'nonConcurrenceHaut' },
                  { cat: 'cct90', label: 'CCT 90 plafond ONSS', key: 'plafondONSS' },
                  { cat: 'rmmmg', label: 'RMMMG', key: 'montant18' },
                  { cat: 'indemKm', label: 'Indemnité km', key: 'voiture' },
                  { cat: 'pp', label: 'Frais pro max', key: 'fraisProMax' },
                  { cat: 'pp', label: 'Quotité exemptée', key: 'quotiteExemptee1' },
                ].map((f, i) => (
                  <div key={i}>
                    <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 2 }}>{f.label}</label>
                    <input
                      type="number"
                      style={{ ...s.formInput, fontFamily: 'monospace' }}
                      placeholder="—"
                      value={(newEntry.values[f.cat] && newEntry.values[f.cat][f.key]) || ''}
                      onChange={e => {
                        const v = e.target.value;
                        setNewEntry(p => ({
                          ...p,
                          values: {
                            ...p.values,
                            [f.cat]: { ...(p.values[f.cat] || {}), [f.key]: v ? parseFloat(v) : null }
                          }
                        }));
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button style={s.btn(false)} onClick={() => setShowNewForm(false)}>Annuler</button>
                <button style={s.btn(true)} onClick={handleSaveTimeline} disabled={saving}>
                  {saving ? '⏳...' : '💾 Sauvegarder l\'entrée'}
                </button>
              </div>
            </div>
          )}

          {/* EXISTING TIMELINE */}
          {(loisTimeline || []).slice().reverse().map((entry, i) => (
            <div key={i} style={s.tlCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={s.tlDate}>📌 {entry.date}</div>
                  <div style={s.tlSource}>{entry.source}</div>
                </div>
                {entry.date > new Date().toISOString().slice(0, 10) && (
                  <span style={{ ...s.badge, background: '#f59e0b20', color: '#f59e0b' }}>⏳ Futur</span>
                )}
                {entry.date <= new Date().toISOString().slice(0, 10) && (
                  <span style={{ ...s.badge, background: '#22c55e20', color: '#4ade80' }}>✅ Appliqué</span>
                )}
              </div>
              <div style={s.tlVals}>
                {Object.entries(entry).filter(([k]) => k !== 'date' && k !== 'source').map(([cat, vals]) => (
                  Object.entries(vals).map(([k, v]) => (
                    <div key={`${cat}.${k}`} style={s.tlVal}>
                      <span style={{ color: '#64748b' }}>{cat}.</span>{k}: <span style={{ color: '#4ade80', fontWeight: 600 }}>{typeof v === 'number' ? v.toLocaleString('fr-BE') : v}</span>
                    </div>
                  ))
                ))}
              </div>
            </div>
          ))}

          {/* Custom entries */}
          {customEntries.length > 0 && (
            <>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f43f5e', margin: '24px 0 12px' }}>🔧 Entrées personnalisées</h3>
              {customEntries.map((e, i) => (
                <div key={i} style={{ ...s.tlCard, borderLeft: '4px solid #f43f5e' }}>
                  <div style={s.tlDate}>🔧 {e.effective_date}</div>
                  <div style={s.tlSource}>{e.source}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8, fontFamily: 'monospace' }}>
                    {typeof e.values === 'string' ? e.values : JSON.stringify(e.values, null, 2)}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* TAB: TRANCHES PP */}
      {tab === 'pp' && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>💰 Tranches de précompte professionnel</h2>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 0, padding: '12px 16px', background: '#1e293b', fontWeight: 700, fontSize: 13, color: '#94a3b8' }}>
              <div>De (€)</div><div>À (€)</div><div>Taux</div>
            </div>
            {(loisBelges?.pp?.tranches || []).map((t, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 0, padding: '10px 16px', borderTop: '1px solid #1e293b15', fontSize: 14, fontFamily: 'monospace' }}>
                <div style={{ color: '#cbd5e1' }}>{t.min.toLocaleString('fr-BE')} €</div>
                <div style={{ color: '#cbd5e1' }}>{t.max === Infinity ? '∞' : t.max.toLocaleString('fr-BE') + ' €'}</div>
                <div style={{ color: '#f59e0b', fontWeight: 700 }}>{(t.taux * 100).toFixed(2)}%</div>
              </div>
            ))}
          </div>

          {/* CSSS */}
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', margin: '24px 0 16px' }}>🏛️ CSSS — Cotisation spéciale sécurité sociale</h2>
          {['isole', 'menage2revenus', 'menage1revenu'].map(type => (
            <div key={type} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#818cf8', marginBottom: 8 }}>
                {type === 'isole' ? '👤 Isolé' : type === 'menage2revenus' ? '👥 Ménage 2 revenus' : '👤+👤 Ménage 1 revenu'}
              </h3>
              <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, overflow: 'hidden' }}>
                {(loisBelges?.csss?.[type] || []).map((t, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 100px', padding: '8px 12px', borderTop: i ? '1px solid #1e293b15' : 'none', fontSize: 12, fontFamily: 'monospace', color: '#94a3b8' }}>
                    <div>{t.min.toLocaleString('fr-BE')}€</div>
                    <div>{t.max === Infinity ? '∞' : t.max.toLocaleString('fr-BE') + '€'}</div>
                    <div>{t.montant || t.montantFixe ? (t.montant || t.montantFixe).toFixed(2) + '€' : '—'}</div>
                    <div style={{ color: '#f59e0b' }}>{t.taux ? (t.taux * 100).toFixed(1) + '%' : '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: PRÉAVIS */}
      {tab === 'preavis' && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>📨 Durées de préavis (employeur → travailleur)</h2>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', padding: '12px 16px', background: '#1e293b', fontWeight: 700, fontSize: 13, color: '#94a3b8' }}>
              <div>Ancienneté (années)</div><div>Jusqu'à</div><div>Semaines</div>
            </div>
            {(loisBelges?.preavis?.employeur || []).map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', padding: '8px 16px', borderTop: '1px solid #1e293b15', fontSize: 13, fontFamily: 'monospace' }}>
                <div style={{ color: '#cbd5e1' }}>{p.ancMin} an{p.ancMin > 1 ? 's' : ''}</div>
                <div style={{ color: '#cbd5e1' }}>{p.ancMax} an{p.ancMax > 1 ? 's' : ''}</div>
                <div style={{ color: '#3b82f6', fontWeight: 700 }}>{p.semaines} sem.</div>
              </div>
            ))}
            <div style={{ padding: '10px 16px', borderTop: '1px solid #1e293b', fontSize: 13, color: '#64748b' }}>
              Au-delà de 25 ans : +{loisBelges?.preavis?.parAnSupp || 3} semaines par année supplémentaire
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', margin: '24px 0 12px' }}>🚪 Préavis travailleur (démission)</h3>
          <div style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.8 }}>
              Facteur : <span style={{ color: '#f59e0b', fontWeight: 700 }}>{loisBelges?.preavis?.travailleur?.facteur || 0.5}x</span> du préavis employeur<br />
              Minimum : <span style={{ color: '#3b82f6', fontWeight: 700 }}>{loisBelges?.preavis?.travailleur?.min || 1} semaine</span><br />
              Maximum : <span style={{ color: '#ef4444', fontWeight: 700 }}>{loisBelges?.preavis?.travailleur?.max || 13} semaines</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
