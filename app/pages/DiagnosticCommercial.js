'use client';
import { useState, useMemo } from 'react';
import { LOIS_BELGES, RMMMG, f2 } from '@/app/lib/helpers';

// ─── Styles ───────────────────────────────────────────────────
const TH = { gold:'#c6a34e', bg:'#0a0908', bg2:'#111009', surface:'rgba(255,255,255,.03)', border:'rgba(198,163,78,.08)', text:'#e8e6e0', text2:'#9e9b93', text3:'#5e5c56', green:'#22c55e', red:'#ef4444', orange:'#f97316' };

const S = {
  card: { background: TH.surface, borderRadius: 12, padding: 20, border: `1px solid ${TH.border}`, marginBottom: 14 },
  label: { fontSize: 10, color: TH.text3, fontWeight: 700, letterSpacing: '.4px', textTransform: 'uppercase', marginBottom: 6, display: 'block' },
  input: { width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid rgba(198,163,78,.15)`, background: 'rgba(0,0,0,.3)', color: TH.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid rgba(198,163,78,.15)`, background: '#0e0d0b', color: TH.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' },
  btn: (active, color='#c6a34e') => ({ padding: '8px 16px', borderRadius: 8, border: `1px solid ${active ? color : 'rgba(255,255,255,.06)'}`, background: active ? `${color}18` : 'transparent', color: active ? color : TH.text2, cursor: 'pointer', fontSize: 12, fontWeight: active ? 700 : 400, fontFamily: 'inherit', transition: 'all .15s' }),
};

function PH({ title, sub }) {
  return <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 18, fontWeight: 800, color: TH.gold }}>{title}</div>
    {sub && <div style={{ fontSize: 11, color: TH.text3, marginTop: 3 }}>{sub}</div>}
  </div>;
}

// ─── Tarifs concurrents (moyennes marché belge 2026) ──────────
const CONCURRENTS = {
  sdworx:  { label: 'SD Worx',  color: '#e53e3e', prixBase: 32, fraisSetup: 500,  fraisAnnexe: 8,  fraisExit: 3,  delai: 3 },
  partena: { label: 'Partena',  color: '#dd6b20', prixBase: 28, fraisSetup: 350,  fraisAnnexe: 6,  fraisExit: 2,  delai: 2 },
  securex: { label: 'Securex',  color: '#d69e2e', prixBase: 30, fraisSetup: 450,  fraisAnnexe: 7,  fraisExit: 3,  delai: 3 },
  liantis: { label: 'Liantis',  color: '#805ad5', prixBase: 26, fraisSetup: 300,  fraisAnnexe: 5,  fraisExit: 1,  delai: 2 },
  autre:   { label: 'Autre',    color: '#4a5568', prixBase: 28, fraisSetup: 400,  fraisAnnexe: 6,  fraisExit: 2,  delai: 2 },
};

const TARIFS_AUREUS = { prixBase: 15, fraisSetup: 0, fraisAnnexe: 0 };

const CP_LIST = [
  '100 - CPNAE', '200 - Employés', '111 - Métal', '118 - Alimentaire', '119 - Commerce', 
  '124 - Textile', '140 - Transport', '200 - CP polyvalent', '302 - Horeca', '318 - Culture',
  '330 - Soins de santé', '337 - Nettoyage', '341 - Transport rémunéré', '228 - Secteur financier',
];

// ─── Points d'audit (ce qu'on vérifie chez le prospect) ───────
const AUDIT_POINTS = [
  { id: 'dimona_retard', label: 'Dimona soumise en retard (>J+1)', impact: 'AMENDE', amende: 1600, desc: 'Amende ONSS de 1.600€ par Dimona tardive (Art. 22 loi 1969)' },
  { id: 'fiches_erreur', label: 'Erreurs sur fiches de paie', impact: 'RISQUE', amende: 0, desc: 'PP mal calculé → régularisation fiscale + pénalités SPF' },
  { id: 'onss_retard', label: 'Paiement ONSS en retard', impact: 'AMENDE', amende: 0, desc: 'Majoration 10% + intérêts 7% annuel' },
  { id: 'pas_activa', label: 'Activa.brussels non activé', impact: 'MANQUE', amende: 0, desc: 'Jusqu\'à 12.600€ de subsides non perçus par embauche éligible' },
  { id: 'pas_1er_emploi', label: 'Exonération 1er employé non demandée', impact: 'MANQUE', amende: 0, desc: 'Économie ONSS patronal 100% pendant 13 trimestres' },
  { id: 'cct_non_conforme', label: 'CCT sectorielle non respectée', impact: 'RISQUE', amende: 0, desc: 'Risque prud\'homal + rappel de salaire sur 5 ans (prescription 2262bis CC)' },
  { id: 'contrats_non_conformes', label: 'Contrats non mis à jour 2025/2026', impact: 'RISQUE', amende: 0, desc: 'Contrats sans clause télétravail, sans annexe RGPD → nullité partielle' },
  { id: 'belcotax_oublie', label: 'Belcotax non soumis à temps', impact: 'AMENDE', amende: 1250, desc: 'Amende SPF Finances 1.250€ + 10% du PP non déclaré' },
];

// ─── Composant principal ──────────────────────────────────────
export default function DiagnosticCommercial({ s, d, th }) {
  const [tab, setTab] = useState('saisie');
  const [form, setForm] = useState({
    entreprise: '', secteur: '', cp: '200 - Employés', nbEmployes: 5,
    salaireMoyen: 3200, concurrent: 'sdworx', prixActuel: 28,
    fraisAnnexes: 6, contratMois: 12,
  });
  const [auditChecked, setAuditChecked] = useState({});
  const [showRapport, setShowRapport] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleAudit = (id) => setAuditChecked(p => ({ ...p, [id]: !p[id] }));

  const conc = CONCURRENTS[form.concurrent] || CONCURRENTS.sdworx;

  // ─── Calculs ────────────────────────────────────────────────
  const calcul = useMemo(() => {
    const n = +form.nbEmployes || 1;
    const mois = +form.contratMois || 12;
    const prixActuel = +form.prixActuel || conc.prixBase;
    const fraisAnn = +form.fraisAnnexes || conc.fraisAnnexe;

    // Coûts concurrent (mensuel)
    const coutConcMensuel = (prixActuel + fraisAnn) * n;
    const coutConcAnnuel = coutConcMensuel * 12;
    const coutConcTotal = coutConcAnnuel * (mois / 12);

    // Coûts Aureus
    const coutAureusMensuel = TARIFS_AUREUS.prixBase * n;
    const coutAureusAnnuel = coutAureusMensuel * 12;
    const coutAureusTotal = coutAureusAnnuel * (mois / 12);

    // Économie
    const economieMensuelle = coutConcMensuel - coutAureusMensuel;
    const economieAnnuelle = economieMensuelle * 12;
    const economieTotal = economieAnnuelle * (mois / 12);
    const economiePct = economieMensuelle / coutConcMensuel * 100;

    // Amendes détectées
    const amendes = AUDIT_POINTS
      .filter(p => auditChecked[p.id] && p.amende > 0)
      .reduce((s, p) => s + p.amende, 0);

    // ROI
    const roiMois = conc.fraisExit * n > 0 ? Math.ceil((conc.fraisExit * n) / economieMensuelle) : 0;

    return { coutConcMensuel, coutConcAnnuel, coutConcTotal, coutAureusMensuel, coutAureusAnnuel, coutAureusTotal, economieMensuelle, economieAnnuelle, economieTotal, economiePct, amendes, roiMois, n };
  }, [form, auditChecked, conc]);

  const auditRisques = AUDIT_POINTS.filter(p => auditChecked[p.id]);
  const score = Math.max(0, 100 - auditRisques.length * 15);
  const scoreColor = score >= 80 ? TH.green : score >= 50 ? TH.orange : TH.red;

  const tabs = [
    { k: 'saisie', label: '1 · Informations' },
    { k: 'audit', label: '2 · Audit risques' },
    { k: 'comparatif', label: '3 · Comparatif' },
    { k: 'rapport', label: '4 · Rapport' },
  ];

  return (
    <div style={{ maxWidth: 900 }}>
      <PH title="Diagnostic Commercial" sub="Outil de conviction prospect — analyse coûts, risques et économies vs secrétariat social actuel" />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `1px solid ${TH.border}`, paddingBottom: 8 }}>
        {tabs.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={S.btn(tab === t.k)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ ONGLET 1 : SAISIE ══════════════════════════════════ */}
      {tab === 'saisie' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={S.card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TH.gold, marginBottom: 14 }}>🏢 L'entreprise prospect</div>
              <div style={{ marginBottom: 10 }}>
                <label style={S.label}>Nom de l'entreprise</label>
                <input style={S.input} value={form.entreprise} onChange={e => set('entreprise', e.target.value)} placeholder="Ex: Boulangerie Dupont SA" />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={S.label}>Commission paritaire</label>
                <select style={S.select} value={form.cp} onChange={e => set('cp', e.target.value)}>
                  {CP_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={S.label}>Nb d'employés</label>
                  <input style={S.input} type="number" min="1" value={form.nbEmployes} onChange={e => set('nbEmployes', +e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Salaire moyen brut (€)</label>
                  <input style={S.input} type="number" value={form.salaireMoyen} onChange={e => set('salaireMoyen', +e.target.value)} />
                </div>
              </div>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TH.gold, marginBottom: 14 }}>📋 Secrétariat actuel</div>
              <div style={{ marginBottom: 10 }}>
                <label style={S.label}>Concurrent</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Object.entries(CONCURRENTS).map(([k, v]) => (
                    <button key={k} onClick={() => { set('concurrent', k); set('prixActuel', v.prixBase); set('fraisAnnexes', v.fraisAnnexe); }} style={S.btn(form.concurrent === k, v.color)}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                <div>
                  <label style={S.label}>Prix / employé / mois (€)</label>
                  <input style={S.input} type="number" value={form.prixActuel} onChange={e => set('prixActuel', +e.target.value)} />
                </div>
                <div>
                  <label style={S.label}>Frais annexes / emp. (€)</label>
                  <input style={S.input} type="number" value={form.fraisAnnexes} onChange={e => set('fraisAnnexes', +e.target.value)} />
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <label style={S.label}>Durée contrat à proposer (mois)</label>
                <select style={S.select} value={form.contratMois} onChange={e => set('contratMois', +e.target.value)}>
                  {[6, 12, 24, 36].map(m => <option key={m} value={m}>{m} mois</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Aperçu rapide */}
          <div style={{ ...S.card, background: 'rgba(198,163,78,.04)', borderColor: 'rgba(198,163,78,.2)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: TH.gold, marginBottom: 12 }}>⚡ Aperçu rapide</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Coût actuel / mois', val: `${f2(calcul.coutConcMensuel)} €`, color: TH.red },
                { label: 'Aureus / mois', val: `${f2(calcul.coutAureusMensuel)} €`, color: TH.green },
                { label: 'Économie / mois', val: `${f2(calcul.economieMensuelle)} €`, color: TH.gold },
                { label: 'Économie / an', val: `${f2(calcul.economieAnnuelle)} €`, color: TH.gold },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '12px 8px', background: 'rgba(0,0,0,.2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: item.color }}>{item.val}</div>
                  <div style={{ fontSize: 10, color: TH.text3, marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setTab('audit')} style={{ ...S.btn(true), marginTop: 8, padding: '10px 24px', fontSize: 13 }}>
            Suivant → Audit des risques
          </button>
        </>
      )}

      {/* ══ ONGLET 2 : AUDIT RISQUES ═══════════════════════════ */}
      {tab === 'audit' && (
        <>
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TH.gold }}>⚠️ Points de non-conformité détectés</div>
              <div style={{ fontSize: 11, color: TH.text3 }}>Cochez les problèmes identifiés chez le prospect</div>
            </div>
            {AUDIT_POINTS.map(p => (
              <div key={p.id} onClick={() => toggleAudit(p.id)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                  background: auditChecked[p.id] ? 'rgba(239,68,68,.06)' : 'rgba(255,255,255,.02)',
                  border: `1px solid ${auditChecked[p.id] ? 'rgba(239,68,68,.2)' : 'rgba(255,255,255,.04)'}`,
                  transition: 'all .15s' }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${auditChecked[p.id] ? TH.red : 'rgba(255,255,255,.15)'}`,
                  background: auditChecked[p.id] ? TH.red : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1, transition: 'all .15s' }}>
                  {auditChecked[p.id] && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: auditChecked[p.id] ? '#fca5a5' : TH.text }}>{p.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                      background: p.impact === 'AMENDE' ? 'rgba(239,68,68,.1)' : p.impact === 'MANQUE' ? 'rgba(249,115,22,.1)' : 'rgba(234,179,8,.1)',
                      color: p.impact === 'AMENDE' ? TH.red : p.impact === 'MANQUE' ? TH.orange : '#eab308' }}>
                      {p.impact === 'AMENDE' ? `⚡ AMENDE ${f2(p.amende)} €` : p.impact === 'MANQUE' ? '💸 SUBSIDES NON PERÇUS' : '⚖️ RISQUE JURIDIQUE'}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: TH.text3, marginTop: 3 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Score */}
          <div style={{ ...S.card, background: `${scoreColor}08`, borderColor: `${scoreColor}30` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: scoreColor }}>
                  Score conformité : {score}/100
                </div>
                <div style={{ fontSize: 11, color: TH.text3, marginTop: 3 }}>
                  {auditRisques.length === 0 ? 'Aucun problème identifié — prospect bien géré' :
                   `${auditRisques.length} problème${auditRisques.length > 1 ? 's' : ''} détecté${auditRisques.length > 1 ? 's' : ''} — argument de vente fort`}
                </div>
              </div>
              <div style={{ fontSize: 40, fontWeight: 900, color: scoreColor }}>{score}</div>
            </div>
            {calcul.amendes > 0 && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(239,68,68,.08)', borderRadius: 8, fontSize: 12, color: '#fca5a5' }}>
                💸 Amendes potentielles évitables : <strong>{f2(calcul.amendes)} € / an</strong> avec Aureus
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setTab('saisie')} style={{ ...S.btn(false), padding: '10px 20px' }}>← Retour</button>
            <button onClick={() => setTab('comparatif')} style={{ ...S.btn(true), padding: '10px 24px', fontSize: 13 }}>Suivant → Comparatif tarifs</button>
          </div>
        </>
      )}

      {/* ══ ONGLET 3 : COMPARATIF ══════════════════════════════ */}
      {tab === 'comparatif' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Concurrent */}
            <div style={{ ...S.card, borderColor: `${conc.color}40` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: conc.color, marginBottom: 16 }}>{conc.label} — Coûts actuels</div>
              {[
                ['Prix / employé / mois', `${form.prixActuel} €`],
                ['Frais annexes / emp.', `${form.fraisAnnexes} €`],
                ['Total / employé / mois', `${f2(+form.prixActuel + +form.fraisAnnexes)} €`],
                ['Total mensuel ({n} emp.)', `${f2(calcul.coutConcMensuel)} €`],
                ['Total annuel', `${f2(calcul.coutConcAnnuel)} €`],
                [`Total ${form.contratMois} mois`, `${f2(calcul.coutConcTotal)} €`],
                ['Frais de résiliation', `${conc.fraisExit * calcul.n} €`],
                ['Délai de résiliation', `${conc.delai} mois`],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${TH.border}`, fontSize: 12 }}>
                  <span style={{ color: TH.text2 }}>{l.replace('{n}', calcul.n)}</span>
                  <span style={{ color: TH.text, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Aureus */}
            <div style={{ ...S.card, borderColor: 'rgba(34,197,94,.3)', background: 'rgba(34,197,94,.03)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TH.green, marginBottom: 16 }}>Aureus Social Pro — Offre</div>
              {[
                ['Prix / employé / mois', `${TARIFS_AUREUS.prixBase} €`],
                ['Frais annexes', '0 €'],
                ['Total / employé / mois', `${TARIFS_AUREUS.prixBase} €`],
                [`Total mensuel (${calcul.n} emp.)`, `${f2(calcul.coutAureusMensuel)} €`],
                ['Total annuel', `${f2(calcul.coutAureusAnnuel)} €`],
                [`Total ${form.contratMois} mois`, `${f2(calcul.coutAureusTotal)} €`],
                ['Frais de résiliation', '0 €'],
                ['Mise en route', '0 € — 48h'],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid rgba(34,197,94,.08)`, fontSize: 12 }}>
                  <span style={{ color: TH.text2 }}>{l}</span>
                  <span style={{ color: TH.green, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Économies */}
          <div style={{ ...S.card, background: 'rgba(198,163,78,.04)', borderColor: 'rgba(198,163,78,.25)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: TH.gold, marginBottom: 14 }}>💰 Économies réalisées avec Aureus</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'Économie mensuelle', val: `${f2(calcul.economieMensuelle)} €`, sub: `soit ${f2(calcul.economiePct)}% de réduction` },
                { label: 'Économie annuelle', val: `${f2(calcul.economieAnnuelle)} €`, sub: 'récurrente chaque année' },
                { label: `Économie sur ${form.contratMois} mois`, val: `${f2(calcul.economieTotal)} €`, sub: `ROI atteint en ${calcul.roiMois} mois` },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center', padding: 16, background: 'rgba(0,0,0,.2)', borderRadius: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: TH.gold }}>{item.val}</div>
                  <div style={{ fontSize: 11, color: TH.text2, marginTop: 4, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: TH.text3, marginTop: 2 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setTab('audit')} style={{ ...S.btn(false), padding: '10px 20px' }}>← Retour</button>
            <button onClick={() => setTab('rapport')} style={{ ...S.btn(true), padding: '10px 24px', fontSize: 13 }}>Suivant → Générer le rapport</button>
          </div>
        </>
      )}

      {/* ══ ONGLET 4 : RAPPORT ═════════════════════════════════ */}
      {tab === 'rapport' && (
        <>
          {/* En-tête rapport */}
          <div style={{ ...S.card, background: 'rgba(198,163,78,.04)', borderColor: 'rgba(198,163,78,.25)', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: TH.gold }}>
                  Rapport de diagnostic — {form.entreprise || 'Prospect'}
                </div>
                <div style={{ fontSize: 11, color: TH.text3, marginTop: 4 }}>
                  {new Date().toLocaleDateString('fr-BE', { day: '2-digit', month: 'long', year: 'numeric' })} · CP {form.cp} · {calcul.n} employé{calcul.n > 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: TH.text3 }}>Score conformité</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: scoreColor }}>{score}/100</div>
              </div>
            </div>
          </div>

          {/* Résumé exécutif */}
          <div style={S.card}>
            <div style={{ fontSize: 12, fontWeight: 700, color: TH.gold, marginBottom: 12 }}>📋 Résumé exécutif</div>
            <div style={{ fontSize: 13, color: TH.text, lineHeight: 1.8 }}>
              {form.entreprise || 'Votre entreprise'} paie actuellement <strong style={{ color: TH.red }}>{f2(calcul.coutConcAnnuel)} €/an</strong> à {conc.label} pour la gestion de {calcul.n} employé{calcul.n > 1 ? 's' : ''}.
              En passant à Aureus Social Pro, vous réalisez une économie de <strong style={{ color: TH.gold }}>{f2(calcul.economieAnnuelle)} €/an</strong> ({f2(calcul.economiePct)}% de réduction),
              sans frais de mise en route et avec une reprise complète en 48h.
              {auditRisques.length > 0 && ` De plus, ${auditRisques.length} point${auditRisques.length > 1 ? 's' : ''} de non-conformité ont été identifiés dans votre gestion actuelle, représentant un risque financier supplémentaire.`}
            </div>
          </div>

          {/* Points clés */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={S.card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TH.green, marginBottom: 12 }}>✅ Ce qu'Aureus inclut</div>
              {[
                'Fiches de paie conformes CP ' + form.cp,
                'Dimona en temps réel (J+0)',
                'Exports Winbooks / BOB / CODA',
                'Portail employé inclus',
                'Veille légale automatique',
                'Support direct — pas de call center',
                'Mandats ONSS/Mahis gérés',
                'Activa.brussels & primes emploi',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', fontSize: 12, color: TH.text, borderBottom: `1px solid ${TH.border}` }}>
                  <span style={{ color: TH.green }}>✓</span> {item}
                </div>
              ))}
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TH.red, marginBottom: 12 }}>⚠️ Risques identifiés chez {conc.label}</div>
              {auditRisques.length === 0 ? (
                <div style={{ fontSize: 12, color: TH.text3, fontStyle: 'italic' }}>Aucun risque coché — retournez à l'onglet Audit pour identifier les problèmes</div>
              ) : auditRisques.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', fontSize: 12, color: '#fca5a5', borderBottom: '1px solid rgba(239,68,68,.08)' }}>
                  <span>⚡</span> {p.label}
                </div>
              ))}
              {calcul.amendes > 0 && (
                <div style={{ marginTop: 10, padding: '8px 10px', background: 'rgba(239,68,68,.06)', borderRadius: 6, fontSize: 11, color: '#fca5a5' }}>
                  Total amendes potentielles : <strong>{f2(calcul.amendes)} €</strong>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div style={{ ...S.card, background: 'rgba(34,197,94,.04)', borderColor: 'rgba(34,197,94,.25)', textAlign: 'center', padding: 28 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: TH.green, marginBottom: 8 }}>
              Économie totale sur {form.contratMois} mois : {f2(calcul.economieTotal)} €
            </div>
            <div style={{ fontSize: 12, color: TH.text2, marginBottom: 16 }}>
              Aucun frais de mise en route · Reprise en 48h · Résiliation sans pénalité
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => window.print()} style={{ ...S.btn(true, TH.green), padding: '10px 24px', fontSize: 13 }}>
                🖨️ Imprimer / PDF
              </button>
              <button onClick={() => {
                const txt = `RAPPORT DIAGNOSTIC AUREUS — ${form.entreprise || 'Prospect'}\n\nSecrétariat actuel: ${conc.label}\nNb employés: ${calcul.n}\nCoût actuel: ${f2(calcul.coutConcAnnuel)} €/an\nAureus: ${f2(calcul.coutAureusAnnuel)} €/an\nÉconomie: ${f2(calcul.economieAnnuelle)} €/an (${f2(calcul.economiePct)}%)\nScore conformité: ${score}/100\n${auditRisques.length > 0 ? 'Risques: ' + auditRisques.map(p=>p.label).join(', ') : ''}`;
                navigator.clipboard?.writeText(txt);
              }} style={{ ...S.btn(false), padding: '10px 24px', fontSize: 13 }}>
                📋 Copier résumé
              </button>
            </div>
          </div>

          <button onClick={() => setTab('comparatif')} style={{ ...S.btn(false), padding: '10px 20px' }}>← Retour</button>
        </>
      )}
    </div>
  );
}
