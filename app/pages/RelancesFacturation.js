'use client';
import { supabase } from '@/app/lib/supabase';
import { useState, useEffect, useCallback } from 'react';

const fmt = v => new Intl.NumberFormat('fr-BE', { style:'currency', currency:'EUR' }).format(v||0);
const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-BE') : '—';
const daysSince = d => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0;

const NIVEAUX = {
  15: { label: 'Rappel amical', color: '#eab308', bg: 'rgba(234,179,8,.12)', emoji: '🟡', type: 'amical' },
  30: { label: 'Rappel ferme', color: '#f97316', bg: 'rgba(249,115,22,.12)', emoji: '🟠', type: 'ferme' },
  45: { label: 'Mise en demeure', color: '#ef4444', bg: 'rgba(239,68,68,.12)', emoji: '🔴', type: 'demeure' }
};

const getNiveau = (jours) => {
  if (jours >= 45) return NIVEAUX[45];
  if (jours >= 30) return NIVEAUX[30];
  if (jours >= 15) return NIVEAUX[15];
  return null;
};

// Templates email par niveau
const TEMPLATES = {
  amical: (client, montant, date) => ({
    subject: `Rappel amical — Facture ${fmtDate(date)} en attente`,
    html: `<p>Cher partenaire ${client},</p><p>Nous nous permettons de vous rappeler que la facture de <strong>${fmt(montant)}</strong> du ${fmtDate(date)} est en attente de paiement.</p><p>Si le paiement a déjà été effectué, veuillez ne pas tenir compte de ce message.</p><p>Cordialement,<br/>Aureus Social — Secrétariat Social</p>`
  }),
  ferme: (client, montant, date) => ({
    subject: `RAPPEL — Facture impayée du ${fmtDate(date)}`,
    html: `<p>Madame, Monsieur (${client}),</p><p>Malgré notre précédent rappel, nous constatons que la facture de <strong>${fmt(montant)}</strong> du ${fmtDate(date)} reste impayée.</p><p>Nous vous prions de bien vouloir procéder au règlement dans les <strong>7 jours ouvrables</strong>.</p><p>Cordialement,<br/>Aureus Social — Secrétariat Social</p>`
  }),
  demeure: (client, montant, date) => ({
    subject: `MISE EN DEMEURE — Facture ${fmtDate(date)}`,
    html: `<p>Madame, Monsieur (${client}),</p><p>Nous vous mettons en demeure de régler la facture de <strong>${fmt(montant)}</strong> du ${fmtDate(date)}.</p><p>Sans paiement dans les <strong>5 jours ouvrables</strong>, nous nous réservons le droit de transmettre ce dossier à notre service de recouvrement.</p><p>Des intérêts de retard de 10% annuels et une indemnité forfaitaire de 40€ pourront être appliqués conformément à la loi du 2 août 2002.</p><p>Cordialement,<br/>Aureus Social — Service Facturation</p>`
  })
};


// ── SÉCURITÉ: sanitize HTML — prévention XSS ──────────────────────────────
function sanitizeHtml(html) {
  const ALLOWED_TAGS = ['p','strong','em','br','ul','ol','li','span','div','h1','h2','h3','b','i'];
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  // Supprimer les balises dangereuses et attributs event handlers
  const dangerous = tmp.querySelectorAll('script,iframe,object,embed,form,input,button,link,style,meta,base,applet');
  dangerous.forEach(el => el.remove());
  // Supprimer les attributs on* (onclick, onerror...) et href javascript:
  tmp.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on') || (attr.name === 'href' && attr.value.toLowerCase().startsWith('javascript'))) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return tmp.innerHTML;
}
// ─────────────────────────────────────────────────────────────────────────────
// Données de test initiales
const DEMO_FACTURES = [
  { id: 'FAC-2026-001', client: 'Boulangerie Dupont SPRL', email: 'comptabilite@dupont.be', montant: 950, dateFacture: '2026-01-10', status: 'impayee', relances: [] },
  { id: 'FAC-2026-002', client: 'Tech Solutions SA', email: 'finance@techsolutions.be', montant: 2850, dateFacture: '2026-01-20', status: 'impayee', relances: [] },
  { id: 'FAC-2026-003', client: 'Restaurant Le Bruxellois', email: 'admin@lebruxellois.be', montant: 475, dateFacture: '2026-02-01', status: 'impayee', relances: [] },
  { id: 'FAC-2026-004', client: 'Garage AutoFix BVBA', email: 'factures@autofix.be', montant: 1520, dateFacture: '2025-12-15', status: 'impayee', relances: [] },
  { id: 'FAC-2026-005', client: 'Cabinet Avocat Martin', email: 'secretariat@martin-law.be', montant: 3200, dateFacture: '2025-12-01', status: 'impayee', relances: [] },
];

export default function RelancesFacturation({ supabase, user, clients = [] }) {
  const [factures, setFactures] = useState([]);
  const [tab, setTab] = useState('retard');
  const [sending, setSending] = useState(null);
  const [showPreview, setShowPreview] = useState(null);
  const [filterNiveau, setFilterNiveau] = useState('all');
  const [sortBy, setSortBy] = useState('jours');

  // Chargement initial
  useEffect(() => {
    try {
      const raw = localStorage.getItem('aureus_relances');
      if (raw) {
        setFactures(JSON.parse(raw));
      } else {
        // Premier lancement : données de test
        localStorage.setItem('aureus_relances', JSON.stringify(DEMO_FACTURES));
        setFactures(DEMO_FACTURES);
      }
    } catch (e) { setFactures(DEMO_FACTURES); }
  }, []);

  const save = useCallback((updated) => {
    setFactures(updated);
    localStorage.setItem('aureus_relances', JSON.stringify(updated));
  }, []);

  // Envoyer une relance individuelle
  const envoyerRelance = async (facture) => {
    const jours = daysSince(facture.dateFacture);
    const niveau = getNiveau(jours);
    if (!niveau) return;

    setSending(facture.id);
    const template = TEMPLATES[niveau.type](facture.client, facture.montant, facture.dateFacture);

    // Tentative envoi email via API Resend
    let emailSent = false;
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: facture.email, subject: template.subject, html: template.html })
      });
      emailSent = res.ok;
    } catch (e) { emailSent = false; }

    // Enregistrer la relance même si email échoue
    const relance = {
      id: 'REL-' + Date.now(),
      date: new Date().toISOString(),
      niveau: niveau.type,
      label: niveau.label,
      emailSent,
      sentBy: user?.email || 'system'
    };

    const updated = factures.map(f =>
      f.id === facture.id
        ? { ...f, relances: [...(f.relances || []), relance], lastRelance: relance.date, lastNiveau: niveau.type }
        : f
    );
    save(updated);
    setSending(null);
  };

  // Envoyer toutes les relances en batch
  const envoyerToutesRelances = async () => {
    if (!confirm(`Envoyer les relances pour ${facturesEnRetard.length} factures impayées ?`)) return;
    for (const f of facturesEnRetard) {
      await envoyerRelance(f);
    }
  };

  // Marquer comme payée
  const marquerPayee = (id) => {
    if (!confirm('Marquer cette facture comme payée ?')) return;
    const updated = factures.map(f =>
      f.id === id ? { ...f, status: 'payee', paidAt: new Date().toISOString() } : f
    );
    save(updated);
  };

  // Ajouter une facture test
  const [showAdd, setShowAdd] = useState(false);
  const [newFac, setNewFac] = useState({ client: '', email: '', montant: '', dateFacture: '' });
  const ajouterFacture = () => {
    if (!newFac.client || !newFac.montant || !newFac.dateFacture) return;
    const f = {
      id: 'FAC-' + Date.now(),
      client: newFac.client,
      email: newFac.email || 'contact@example.be',
      montant: parseFloat(newFac.montant),
      dateFacture: newFac.dateFacture,
      status: 'impayee',
      relances: []
    };
    save([...factures, f]);
    setNewFac({ client: '', email: '', montant: '', dateFacture: '' });
    setShowAdd(false);
  };

  // Filtrage
  const facturesEnRetard = factures.filter(f => f.status === 'impayee' && daysSince(f.dateFacture) >= 15);
  const facturesRelancees = factures.filter(f => f.status === 'impayee' && (f.relances?.length || 0) > 0);
  const facturesPayees = factures.filter(f => f.status === 'payee');
  const historique = factures.flatMap(f => (f.relances || []).map(r => ({ ...r, facture: f }))).sort((a, b) => new Date(b.date) - new Date(a.date));

  // KPIs
  const totalImpaye = factures.filter(f => f.status === 'impayee').reduce((a, f) => a + f.montant, 0);
  const nbJ15 = facturesEnRetard.filter(f => { const j = daysSince(f.dateFacture); return j >= 15 && j < 30; }).length;
  const nbJ30 = facturesEnRetard.filter(f => { const j = daysSince(f.dateFacture); return j >= 30 && j < 45; }).length;
  const nbJ45 = facturesEnRetard.filter(f => daysSince(f.dateFacture) >= 45).length;

  // Tri
  const getDisplayList = () => {
    let list = tab === 'retard' ? facturesEnRetard : tab === 'relancees' ? facturesRelancees : facturesPayees;
    if (filterNiveau !== 'all') {
      list = list.filter(f => {
        const j = daysSince(f.dateFacture);
        if (filterNiveau === '15') return j >= 15 && j < 30;
        if (filterNiveau === '30') return j >= 30 && j < 45;
        if (filterNiveau === '45') return j >= 45;
        return true;
      });
    }
    if (sortBy === 'jours') list = [...list].sort((a, b) => daysSince(b.dateFacture) - daysSince(a.dateFacture));
    if (sortBy === 'montant') list = [...list].sort((a, b) => b.montant - a.montant);
    if (sortBy === 'client') list = [...list].sort((a, b) => a.client.localeCompare(b.client));
    return list;
  };

  const S = {
    card: { padding: '14px 16px', background: 'rgba(198,163,78,.04)', borderRadius: 10, border: '1px solid rgba(198,163,78,.08)' },
    section: { background: 'rgba(255,255,255,.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,.04)', padding: 20, marginBottom: 20 },
    btn: (color = '#c6a34e') => ({ padding: '8px 16px', borderRadius: 8, border: 'none', background: `${color}22`, color, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }),
    input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(198,163,78,.2)', background: 'rgba(0,0,0,.3)', color: '#e8e6e0', fontSize: 13, fontFamily: 'inherit', outline: 'none' },
    badge: (niv) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: niv.bg, color: niv.color, fontSize: 11, fontWeight: 700 }),
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#c6a34e' }}>⚠ Relances Facturation</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9e9b93' }}>Gestion automatisée des factures impayées — Secrétariat social</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { l: 'Total impayé', v: fmt(totalImpaye), c: '#ef4444', icon: '💰' },
          { l: 'Rappels amicaux (J+15)', v: nbJ15, c: '#eab308', icon: '🟡' },
          { l: 'Rappels fermes (J+30)', v: nbJ30, c: '#f97316', icon: '🟠' },
          { l: 'Mises en demeure (J+45)', v: nbJ45, c: '#ef4444', icon: '🔴' }
        ].map((k, i) => (
          <div key={i} style={S.card}>
            <div style={{ fontSize: 10, color: '#5e5c56', textTransform: 'uppercase', marginBottom: 4 }}>{k.icon} {k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.c }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Onglets */}
        {[
          { id: 'retard', l: `⏳ En retard (${facturesEnRetard.length})` },
          { id: 'relancees', l: `📧 Relancées (${facturesRelancees.length})` },
          { id: 'payees', l: `✅ Payées (${facturesPayees.length})` },
          { id: 'historique', l: `📋 Historique (${historique.length})` }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ ...S.btn(tab === t.id ? '#c6a34e' : '#9e9b93'), background: tab === t.id ? 'rgba(198,163,78,.15)' : 'rgba(255,255,255,.03)' }}>
            {t.l}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Filtre niveau */}
        {tab === 'retard' && (
          <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)}
            style={{ ...S.input, width: 'auto', padding: '6px 12px', fontSize: 11 }}>
            <option value="all">Tous niveaux</option>
            <option value="15">🟡 J+15</option>
            <option value="30">🟠 J+30</option>
            <option value="45">🔴 J+45</option>
          </select>
        )}

        {/* Tri */}
        {tab !== 'historique' && (
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ ...S.input, width: 'auto', padding: '6px 12px', fontSize: 11 }}>
            <option value="jours">Tri: Jours retard</option>
            <option value="montant">Tri: Montant</option>
            <option value="client">Tri: Client</option>
          </select>
        )}

        {/* Actions */}
        <button onClick={() => setShowAdd(!showAdd)} style={S.btn('#22c55e')}>+ Ajouter facture</button>
        {tab === 'retard' && facturesEnRetard.length > 0 && (
          <button onClick={envoyerToutesRelances} style={S.btn('#ef4444')}>🚨 Relancer tout ({facturesEnRetard.length})</button>
        )}
      </div>

      {/* Formulaire ajout */}
      {showAdd && (
        <div style={{ ...S.section, display: 'grid', gridTemplateColumns: 'repeat(4,1fr) auto', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 10, color: '#9e9b93', display: 'block', marginBottom: 4 }}>Client *</label>
            <input style={S.input} value={newFac.client} onChange={e => setNewFac({ ...newFac, client: e.target.value })} placeholder="Nom société" />
          </div>
          <div>
            <label style={{ fontSize: 10, color: '#9e9b93', display: 'block', marginBottom: 4 }}>Email</label>
            <input style={S.input} value={newFac.email} onChange={e => setNewFac({ ...newFac, email: e.target.value })} placeholder="email@client.be" />
          </div>
          <div>
            <label style={{ fontSize: 10, color: '#9e9b93', display: 'block', marginBottom: 4 }}>Montant € *</label>
            <input style={S.input} type="number" value={newFac.montant} onChange={e => setNewFac({ ...newFac, montant: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label style={{ fontSize: 10, color: '#9e9b93', display: 'block', marginBottom: 4 }}>Date facture *</label>
            <input style={S.input} type="date" value={newFac.dateFacture} onChange={e => setNewFac({ ...newFac, dateFacture: e.target.value })} />
          </div>
          <button onClick={ajouterFacture} style={{ ...S.btn('#22c55e'), padding: '10px 20px' }}>✓</button>
        </div>
      )}

      {/* Tableau principal */}
      {tab !== 'historique' ? (
        <div style={S.section}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(198,163,78,.15)' }}>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#c6a34e', fontSize: 10, textTransform: 'uppercase' }}>Réf</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#c6a34e', fontSize: 10, textTransform: 'uppercase' }}>Client</th>
                <th style={{ textAlign: 'right', padding: '10px 8px', color: '#c6a34e', fontSize: 10, textTransform: 'uppercase' }}>Montant</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', color: '#c6a34e', fontSize: 10, textTransform: 'uppercase' }}>Date</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', color: '#c6a34e', fontSize: 10, textTransform: 'uppercase' }}>Jours</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', color: '#c6a34e', fontSize: 10, textTransform: 'uppercase' }}>Niveau</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', color: '#c6a34e', fontSize: 10, textTransform: 'uppercase' }}>Relances</th>
                <th style={{ textAlign: 'right', padding: '10px 8px', color: '#c6a34e', fontSize: 10, textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {getDisplayList().map(f => {
                const jours = daysSince(f.dateFacture);
                const niveau = getNiveau(jours);
                return (
                  <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', color: '#9e9b93', fontSize: 11 }}>{f.id}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ fontWeight: 600, color: '#e8e6e0' }}>{f.client}</div>
                      <div style={{ fontSize: 10, color: '#5e5c56' }}>{f.email}</div>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#e8e6e0' }}>{fmt(f.montant)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', color: '#9e9b93' }}>{fmtDate(f.dateFacture)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: niveau?.color || '#9e9b93' }}>{jours}j</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      {f.status === 'payee'
                        ? <span style={{ ...S.badge({ bg: 'rgba(34,197,94,.12)', color: '#22c55e' }) }}>✅ Payée</span>
                        : niveau
                          ? <span style={S.badge(niveau)}>{niveau.emoji} {niveau.label}</span>
                          : <span style={{ fontSize: 11, color: '#5e5c56' }}>OK</span>
                      }
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', color: '#9e9b93' }}>{f.relances?.length || 0}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {f.status === 'impayee' && niveau && (
                          <>
                            <button onClick={() => setShowPreview(f)} style={S.btn('#60a5fa')} title="Aperçu email">👁</button>
                            <button onClick={() => envoyerRelance(f)} disabled={sending === f.id}
                              style={{ ...S.btn(niveau.color), opacity: sending === f.id ? 0.5 : 1 }}>
                              {sending === f.id ? '⏳' : '📧'}
                            </button>
                          </>
                        )}
                        {f.status === 'impayee' && (
                          <button onClick={() => marquerPayee(f.id)} style={S.btn('#22c55e')} title="Marquer payée">✓</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {getDisplayList().length === 0 && (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#5e5c56' }}>
                  {tab === 'retard' ? 'Aucune facture en retard 🎉' : tab === 'payees' ? 'Aucune facture payée' : 'Aucune facture relancée'}
                </td></tr>
              )}
            </tbody>
          </table>

          {/* Total */}
          {tab === 'retard' && facturesEnRetard.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid rgba(198,163,78,.1)', marginTop: 8 }}>
              <span style={{ fontSize: 13, color: '#9e9b93', marginRight: 12 }}>Total impayé :</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>
                {fmt(getDisplayList().reduce((a, f) => a + f.montant, 0))}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Historique des relances */
        <div style={S.section}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(198,163,78,.15)' }}>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#c6a34e', fontSize: 10, textTransform: 'uppercase' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#c6a34e', fontSize: 10, textTransform: 'uppercase' }}>Client</th>
                <th style={{ textAlign: 'right', padding: '10px 8px', color: '#c6a34e', fontSize: 10, textTransform: 'uppercase' }}>Montant</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', color: '#c6a34e', fontSize: 10, textTransform: 'uppercase' }}>Type relance</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', color: '#c6a34e', fontSize: 10, textTransform: 'uppercase' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#c6a34e', fontSize: 10, textTransform: 'uppercase' }}>Par</th>
              </tr>
            </thead>
            <tbody>
              {historique.map((r, i) => {
                const niv = r.niveau === 'demeure' ? NIVEAUX[45] : r.niveau === 'ferme' ? NIVEAUX[30] : NIVEAUX[15];
                return (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                    <td style={{ padding: '10px 8px', color: '#9e9b93' }}>{fmtDate(r.date)}</td>
                    <td style={{ padding: '10px 8px', fontWeight: 600, color: '#e8e6e0' }}>{r.facture.client}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#e8e6e0' }}>{fmt(r.facture.montant)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={S.badge(niv)}>{niv.emoji} {niv.label}</span>
                    </td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      {r.emailSent ? <span style={{ color: '#22c55e' }}>✅</span> : <span style={{ color: '#ef4444' }}>❌</span>}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#9e9b93', fontSize: 11 }}>{r.sentBy}</td>
                  </tr>
                );
              })}
              {historique.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#5e5c56' }}>Aucune relance envoyée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal aperçu email */}
      {showPreview && (() => {
        const jours = daysSince(showPreview.dateFacture);
        const niveau = getNiveau(jours);
        if (!niveau) return null;
        const template = TEMPLATES[niveau.type](showPreview.client, showPreview.montant, showPreview.dateFacture);
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowPreview(null)}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#0a0e1a', borderRadius: 16, border: '1px solid rgba(198,163,78,.2)', padding: 24, maxWidth: 600, width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: '#c6a34e', fontSize: 16 }}>📧 Aperçu email</h3>
                <button onClick={() => setShowPreview(null)} style={{ background: 'none', border: 'none', color: '#9e9b93', fontSize: 20, cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#5e5c56', marginBottom: 2 }}>À :</div>
                <div style={{ fontSize: 13, color: '#e8e6e0' }}>{showPreview.email}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#5e5c56', marginBottom: 2 }}>Objet :</div>
                <div style={{ fontSize: 13, color: '#e8e6e0', fontWeight: 600 }}>{template.subject}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#5e5c56', marginBottom: 6 }}>Corps :</div>
                <div style={{ background: '#fff', borderRadius: 8, padding: 16, color: '#1a1a1a', fontSize: 13, lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(template.html) }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowPreview(null)} style={S.btn('#9e9b93')}>Fermer</button>
                <button onClick={() => { envoyerRelance(showPreview); setShowPreview(null); }} style={S.btn(niveau.color)}>📧 Envoyer</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Légende */}
      <div style={{ display: 'flex', gap: 20, padding: '12px 0', borderTop: '1px solid rgba(255,255,255,.04)', marginTop: 8 }}>
        <span style={{ fontSize: 11, color: '#5e5c56' }}>Légende :</span>
        <span style={{ fontSize: 11, color: '#eab308' }}>🟡 J+15 — Rappel amical</span>
        <span style={{ fontSize: 11, color: '#f97316' }}>🟠 J+30 — Rappel ferme</span>
        <span style={{ fontSize: 11, color: '#ef4444' }}>🔴 J+45 — Mise en demeure (loi 2 août 2002)</span>
      </div>
    </div>
  );
}
