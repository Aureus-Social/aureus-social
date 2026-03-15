'use client';
import { useState, useEffect, useMemo } from 'react';

const GOLD = '#C9963A';
const PLANS = [
  { id: 'trial', label: 'Trial', color: '#6B6860', days: 14 },
  { id: 'starter', label: 'Starter', color: '#5B9BD6', price: '49€/mois' },
  { id: 'pro', label: 'Pro', color: GOLD, price: '149€/mois' },
  { id: 'fiduciaire', label: 'Fiduciaire', color: '#a78bfa', price: '349€/mois' },
];

const CP_LIST = [
  { v: '200', l: '200 — Employés (général)' },
  { v: '100', l: '100 — Commerce' },
  { v: '124', l: '124 — Construction' },
  { v: '140', l: '140 — Transport' },
  { v: '302', l: '302 — Hôtellerie' },
  { v: '218', l: '218 — Assistants commerciaux' },
  { v: '111', l: '111 — Métal Flandre' },
  { v: '330', l: '330 — Santé' },
  { v: 'autre', l: 'Autre CP' },
];

const WIZARD_STEPS = [
  { id: 0, label: 'Société', icon: '🏢' },
  { id: 1, label: 'Contact', icon: '👤' },
  { id: 2, label: 'ONSS', icon: '📡' },
  { id: 3, label: 'Comptabilité', icon: '📊' },
  { id: 4, label: 'Confirmation', icon: '✅' },
];

const EMPTY_FORM = {
  nom: '', bce: '', adresse: '', code_postal: '', ville: '', cp_paritaire: '200',
  contact_nom: '', contact_email: '', contact_tel: '',
  onss_numero: '', secteur: '',
  logiciel_compta: 'winbooks', format_export: 'winbooks',
  plan: 'trial',
};

export default function GestionSocietes({ state, dispatch }) {
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'wizard' | 'detail'
  const [societes, setSocietes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const loadSocietes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/societes');
      const j = await res.json();
      if (j.ok) setSocietes(j.data || []);
    } catch(e) {}
    setLoading(false);
  };

  useEffect(() => { loadSocietes(); }, []);

  const filtered = useMemo(() =>
    societes.filter(s =>
      !searchQ ||
      (s.nom || '').toLowerCase().includes(searchQ.toLowerCase()) ||
      (s.bce || '').includes(searchQ) ||
      (s.contact_email || '').toLowerCase().includes(searchQ.toLowerCase())
    ), [societes, searchQ]);

  const validate = () => {
    const errs = [];
    if (step === 0) {
      if (!form.nom) errs.push('Nom de la société requis');
      if (!form.bce) errs.push('Numéro BCE requis');
      if (!form.cp_paritaire) errs.push('Commission paritaire requise');
    }
    if (step === 1) {
      if (!form.contact_nom) errs.push('Nom du contact requis');
      if (!form.contact_email || !form.contact_email.includes('@')) errs.push('Email valide requis');
    }
    setErrors(errs);
    return errs.length === 0;
  };

  const nextStep = () => {
    if (!validate()) return;
    if (step < 4) setStep(s => s + 1);
  };

  const saveSociete = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/societes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const j = await res.json();
      if (j.ok) {
        setSaved(true);
        await loadSocietes();
        setTimeout(() => {
          setSaved(false);
          setView('dashboard');
          setStep(0);
          setForm(EMPTY_FORM);
        }, 1500);
      } else {
        setErrors([j.error || 'Erreur lors de la sauvegarde']);
      }
    } catch(e) {
      setErrors(['Erreur réseau']);
    }
    setSaving(false);
  };

  const planInfo = (planId) => PLANS.find(p => p.id === planId) || PLANS[0];

  // ─── DASHBOARD ──────────────────────────────────────────────
  if (view === 'dashboard') return (
    <div style={{ padding: 24, color: '#e8e6e0', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: GOLD, margin: 0 }}>🏢 Gestion Sociétés</h2>
          <p style={{ fontSize: 13, color: '#6B6860', margin: '4px 0 0' }}>
            {societes.length} société{societes.length !== 1 ? 's' : ''} cliente{societes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => { setView('wizard'); setStep(0); setForm(EMPTY_FORM); setErrors([]); }}
          style={{ background: GOLD, color: '#000', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          + Nouvelle société
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          ['Total sociétés', societes.length, GOLD],
          ['Actives', societes.filter(s => s.status === 'active').length, '#4CAF80'],
          ['Trial', societes.filter(s => s.status === 'trial' || s.plan === 'trial').length, '#5B9BD6'],
          ['MRR estimé', societes.filter(s => s.plan === 'starter').length * 49 + societes.filter(s => s.plan === 'pro').length * 149 + societes.filter(s => s.plan === 'fiduciaire').length * 349 + ' €', '#a78bfa'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ background: '#141416', border: '1px solid #2A2A30', borderRadius: 8, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 11, color: '#6B6860', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Recherche */}
      <div style={{ marginBottom: 16 }}>
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
          placeholder="🔍 Rechercher par nom, BCE, email..."
          style={{ width: '100%', background: '#141416', border: '1px solid #2A2A30', color: '#e8e6e0', padding: '10px 14px', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
      </div>

      {/* Liste sociétés */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#6B6860', padding: 60 }}>Chargement...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#e8e6e0', marginBottom: 8 }}>Aucune société cliente</div>
          <div style={{ fontSize: 13, color: '#6B6860', marginBottom: 20 }}>Ajoutez votre première société cliente pour gérer sa paie</div>
          <button onClick={() => setView('wizard')} style={{ background: GOLD, color: '#000', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>
            + Créer une société
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {filtered.map(s => {
            const plan = planInfo(s.plan);
            return (
              <div key={s.id} onClick={() => { setSelected(s); setView('detail'); }}
                style={{ background: '#141416', border: '1px solid #2A2A30', borderRadius: 10, padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16,
                  transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = GOLD}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A30'}>

                {/* Avatar */}
                <div style={{ width: 44, height: 44, borderRadius: 8, background: GOLD + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  🏢
                </div>

                {/* Infos */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{s.nom || 'Sans nom'}</div>
                  <div style={{ fontSize: 12, color: '#6B6860', marginTop: 2 }}>
                    {s.bce && `BCE ${s.bce}`}{s.bce && s.cp_paritaire && ' · '}{s.cp_paritaire && `CP ${s.cp_paritaire}`}
                  </div>
                </div>

                {/* Contact */}
                <div style={{ textAlign: 'right', minWidth: 180 }}>
                  <div style={{ fontSize: 12, color: '#e8e6e0' }}>{s.contact_nom || '—'}</div>
                  <div style={{ fontSize: 11, color: '#6B6860' }}>{s.contact_email || '—'}</div>
                </div>

                {/* Plan */}
                <div style={{ minWidth: 80, textAlign: 'center' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: plan.color + '20', color: plan.color }}>
                    {plan.label}
                  </span>
                </div>

                {/* Statut */}
                <div style={{ minWidth: 70, textAlign: 'center' }}>
                  <span style={{ padding: '4px 10px', borderRadius: 4, fontSize: 10, background: s.status === 'active' ? '#4CAF8020' : '#6B686020', color: s.status === 'active' ? '#4CAF80' : '#6B6860' }}>
                    {s.status || 'active'}
                  </span>
                </div>

                <div style={{ color: '#6B6860', fontSize: 16 }}>›</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ─── DETAIL SOCIÉTÉ ──────────────────────────────────────────
  if (view === 'detail' && selected) return (
    <div style={{ padding: 24, color: '#e8e6e0', fontFamily: 'Inter, sans-serif' }}>
      <button onClick={() => setView('dashboard')} style={{ background: 'none', border: '1px solid #2A2A30', color: '#6B6860', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', marginBottom: 20, fontSize: 13 }}>
        ← Retour
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{ width: 56, height: 56, borderRadius: 10, background: GOLD + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🏢</div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>{selected.nom}</h2>
          <div style={{ fontSize: 13, color: '#6B6860', marginTop: 4 }}>BCE {selected.bce} · CP {selected.cp_paritaire}</div>
        </div>
        <span style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: planInfo(selected.plan).color + '20', color: planInfo(selected.plan).color }}>
          {planInfo(selected.plan).label}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          ['🏢 Informations société', [['Nom', selected.nom], ['BCE', selected.bce], ['Adresse', [selected.adresse, selected.code_postal, selected.ville].filter(Boolean).join(', ')], ['CP paritaire', selected.cp_paritaire], ['N° ONSS', selected.onss_numero || '—']]],
          ['👤 Contact', [['Nom', selected.contact_nom], ['Email', selected.contact_email], ['Téléphone', selected.contact_tel || '—']]],
          ['📊 Comptabilité', [['Logiciel', selected.logiciel_compta], ['Format export', selected.format_export], ['Plan', planInfo(selected.plan).label]]],
        ].map(([title, rows]) => (
          <div key={title} style={{ background: '#141416', border: '1px solid #2A2A30', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: GOLD, marginBottom: 14 }}>{title}</div>
            {rows.map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1A1A1E', fontSize: 13 }}>
                <span style={{ color: '#6B6860' }}>{l}</span>
                <span style={{ color: '#e8e6e0', fontWeight: 500 }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  // ─── WIZARD CRÉATION ────────────────────────────────────────
  const F = ({ label, children, req }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, color: '#6B6860', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}{req && <span style={{ color: '#E05C3A' }}> *</span>}
      </label>
      {children}
    </div>
  );

  const inputS = { width: '100%', background: '#1A1A1E', border: '1px solid #2A2A30', color: '#e8e6e0', padding: '10px 12px', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' };

  return (
    <div style={{ padding: 24, color: '#e8e6e0', fontFamily: 'Inter, sans-serif', maxWidth: 700 }}>
      {/* Header wizard */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => setView('dashboard')} style={{ background: 'none', border: '1px solid #2A2A30', color: '#6B6860', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>← Annuler</button>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: GOLD, margin: 0 }}>Nouvelle société cliente</h2>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: '#141416', borderRadius: 8, padding: 4 }}>
        {WIZARD_STEPS.map((s, i) => (
          <div key={s.id} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 6, background: step === i ? GOLD : 'transparent', cursor: i < step ? 'pointer' : 'default' }}
            onClick={() => i < step && setStep(i)}>
            <div style={{ fontSize: 14 }}>{s.icon}</div>
            <div style={{ fontSize: 10, marginTop: 2, color: step === i ? '#000' : i < step ? '#e8e6e0' : '#6B6860', fontWeight: step === i ? 600 : 400 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Erreurs */}
      {errors.length > 0 && (
        <div style={{ background: '#E05C3A20', border: '1px solid #E05C3A40', borderRadius: 6, padding: 12, marginBottom: 16 }}>
          {errors.map((e, i) => <div key={i} style={{ fontSize: 13, color: '#E05C3A' }}>⚠️ {e}</div>)}
        </div>
      )}

      {/* Contenu step */}
      <div style={{ background: '#141416', border: '1px solid #2A2A30', borderRadius: 10, padding: 24, marginBottom: 20 }}>

        {/* Step 0 — Société */}
        {step === 0 && <>
          <div style={{ fontSize: 15, fontWeight: 600, color: GOLD, marginBottom: 18 }}>🏢 Informations société</div>
          <F label="Nom de la société" req><input value={form.nom} onChange={e => setForm(p => ({...p, nom: e.target.value}))} style={inputS} placeholder="ex: ACME SPRL" /></F>
          <F label="Numéro BCE / TVA" req><input value={form.bce} onChange={e => setForm(p => ({...p, bce: e.target.value}))} style={inputS} placeholder="ex: 0123.456.789" /></F>
          <F label="Adresse"><input value={form.adresse} onChange={e => setForm(p => ({...p, adresse: e.target.value}))} style={inputS} placeholder="Rue et numéro" /></F>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <F label="Code postal"><input value={form.code_postal} onChange={e => setForm(p => ({...p, code_postal: e.target.value}))} style={inputS} placeholder="1000" /></F>
            <F label="Ville"><input value={form.ville} onChange={e => setForm(p => ({...p, ville: e.target.value}))} style={inputS} placeholder="Bruxelles" /></F>
          </div>
          <F label="Commission paritaire" req>
            <select value={form.cp_paritaire} onChange={e => setForm(p => ({...p, cp_paritaire: e.target.value}))} style={inputS}>
              {CP_LIST.map(cp => <option key={cp.v} value={cp.v}>{cp.l}</option>)}
            </select>
          </F>
        </>}

        {/* Step 1 — Contact */}
        {step === 1 && <>
          <div style={{ fontSize: 15, fontWeight: 600, color: GOLD, marginBottom: 18 }}>👤 Contact principal</div>
          <F label="Nom complet" req><input value={form.contact_nom} onChange={e => setForm(p => ({...p, contact_nom: e.target.value}))} style={inputS} placeholder="Jean Dupont" /></F>
          <F label="Email" req><input type="email" value={form.contact_email} onChange={e => setForm(p => ({...p, contact_email: e.target.value}))} style={inputS} placeholder="jean@exemple.be" /></F>
          <F label="Téléphone"><input value={form.contact_tel} onChange={e => setForm(p => ({...p, contact_tel: e.target.value}))} style={inputS} placeholder="+32 2 123 45 67" /></F>
        </>}

        {/* Step 2 — ONSS */}
        {step === 2 && <>
          <div style={{ fontSize: 15, fontWeight: 600, color: GOLD, marginBottom: 18 }}>📡 Configuration ONSS</div>
          <F label="Numéro ONSS employeur"><input value={form.onss_numero} onChange={e => setForm(p => ({...p, onss_numero: e.target.value}))} style={inputS} placeholder="ex: 51357716-02" /></F>
          <F label="Secteur d'activité"><input value={form.secteur} onChange={e => setForm(p => ({...p, secteur: e.target.value}))} style={inputS} placeholder="ex: Services informatiques" /></F>
          <F label="Plan tarifaire">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
              {PLANS.map(p => (
                <div key={p.id} onClick={() => setForm(f => ({...f, plan: p.id}))}
                  style={{ padding: 12, borderRadius: 6, border: `1px solid ${form.plan === p.id ? p.color : '#2A2A30'}`, background: form.plan === p.id ? p.color + '15' : 'transparent', cursor: 'pointer' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: form.plan === p.id ? p.color : '#e8e6e0' }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: '#6B6860' }}>{p.price || `${p.days} jours gratuits`}</div>
                </div>
              ))}
            </div>
          </F>
        </>}

        {/* Step 3 — Comptabilité */}
        {step === 3 && <>
          <div style={{ fontSize: 15, fontWeight: 600, color: GOLD, marginBottom: 18 }}>📊 Paramètres comptables</div>
          <F label="Logiciel de comptabilité">
            <select value={form.logiciel_compta} onChange={e => setForm(p => ({...p, logiciel_compta: e.target.value, format_export: e.target.value}))} style={inputS}>
              {['winbooks','bob50','exact_online','octopus','horus','csv'].map(v => <option key={v} value={v}>{v === 'bob50' ? 'BOB 50 / Sage' : v === 'exact_online' ? 'Exact Online' : v === 'csv' ? 'CSV générique' : v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
            </select>
          </F>
          <F label="Format d'export comptable">
            <select value={form.format_export} onChange={e => setForm(p => ({...p, format_export: e.target.value}))} style={inputS}>
              {['winbooks','bob50','exact_online','octopus','horus','csv'].map(v => <option key={v} value={v}>{v === 'bob50' ? 'BOB 50 / Sage' : v === 'exact_online' ? 'Exact Online' : v === 'csv' ? 'CSV générique' : v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
            </select>
          </F>
        </>}

        {/* Step 4 — Confirmation */}
        {step === 4 && <>
          <div style={{ fontSize: 15, fontWeight: 600, color: GOLD, marginBottom: 18 }}>✅ Confirmation</div>
          {[
            ['Société', form.nom],
            ['BCE', form.bce],
            ['Adresse', [form.adresse, form.code_postal, form.ville].filter(Boolean).join(', ')],
            ['CP', form.cp_paritaire],
            ['Contact', form.contact_nom],
            ['Email', form.contact_email],
            ['ONSS', form.onss_numero || '—'],
            ['Plan', planInfo(form.plan).label],
            ['Logiciel compta', form.logiciel_compta],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1A1A1E', fontSize: 13 }}>
              <span style={{ color: '#6B6860' }}>{l}</span>
              <span style={{ color: '#e8e6e0', fontWeight: 500 }}>{v || '—'}</span>
            </div>
          ))}
        </>}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => step > 0 ? setStep(s => s - 1) : setView('dashboard')}
          style={{ background: 'none', border: '1px solid #2A2A30', color: '#6B6860', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          {step === 0 ? 'Annuler' : '← Précédent'}
        </button>
        {step < 4 ? (
          <button onClick={nextStep}
            style={{ background: GOLD, color: '#000', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Suivant →
          </button>
        ) : (
          <button onClick={saveSociete} disabled={saving}
            style={{ background: saved ? '#4CAF80' : GOLD, color: '#000', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            {saved ? '✅ Société créée !' : saving ? 'Enregistrement...' : '💾 Créer la société'}
          </button>
        )}
      </div>
    </div>
  );
}
