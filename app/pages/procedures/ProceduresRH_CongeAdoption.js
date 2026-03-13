'use client';
import { useState, useMemo } from 'react';
const PROC_CA = {
  id: 'conge_adoption', icon: '👨‍👩‍👧', categorie: 'conges',
  titre: "Congé d'adoption",
  resume: "6 semaines par parent adoptif (+1 sem/3 ans de l'enfant). 3 premiers jours à charge de l'employeur à 100%, ensuite mutuelle 82%. Protection absolue contre licenciement pendant + 2 mois. Applicable aussi aux familles d'accueil longue durée depuis 2023.",
  baseLegale: [
    { ref: "Loi 01/04/1985 modifiée", desc: "Congé d'adoption — durée et conditions" },
    { ref: "AR 17/10/1994", desc: "Indemnisation mutuelle 82% — plafond journalier" },
    { ref: "Art. 39ter L. 03/07/1978", desc: "Protection contre le licenciement pendant et 2 mois après" },
    { ref: "Loi 07/04/2023", desc: "Extension aux familles d'accueil longue durée (≥6 mois)" },
  ],
  etapes: [
    { n: 1, titre: "Vérification des conditions d'éligibilité", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ DURÉE DU CONGÉ ═══
• Enfant < 3 ans : 6 semaines par parent
• Enfant 3-6 ans : 7 semaines
• Enfant 6-10 ans : 8 semaines
• Enfant handicapé : + 2 semaines
• Peut être pris simultanément par les 2 parents
• Fractionnable (min 1 semaine/période)
• À prendre dans les 2 mois suivant l'entrée de l'enfant dans le ménage

═══ CONDITIONS ═══
• Adoption légalement reconnue (Belgique ou étranger — procédure exequatur terminée)
• Enfant < 10 ans (sauf handicap reconnu)
• Depuis 2023 : famille d'accueil longue durée (≥6 mois de placement continu)`,
      delai: "Dans les 2 mois de l'entrée de l'enfant" },
    { n: 2, titre: "Notification à l'employeur", obligatoire: true, duree_estimee: '1h', formulaire: 'Lettre recommandée',
      detail: `═══ DÉLAI ═══
• 7 jours avant le début du congé (si possible)
• Adoption internationale : notification dès que possible

═══ DOCUMENTS À FOURNIR ═══
• Copie du jugement d'adoption
• Attestation date d'entrée de l'enfant dans le ménage
• Document d'identité de l'enfant

═══ CONTENU ═══
• Date début et fin prévue
• Durée totale et fractionnement si applicable`,
      ou: 'Employeur — recommandé' },
    { n: 3, titre: "Rémunération — 3 premiers jours + mutuelle", obligatoire: true, duree_estimee: '1h',
      detail: `═══ JOURS 1-3 : EMPLOYEUR ═══
• 100% salaire brut normal
• Soumis ONSS et PP normaux

═══ À PARTIR DU 4e JOUR : MUTUELLE ═══
• 82% du salaire brut plafonné
• Plafond journalier 2026 : 180,44 €/jour

═══ DOSSIER MUTUELLE ═══
1. Formulaire spécifique adoption
2. Copie jugement d'adoption
3. Attestation employeur de suspension du contrat
4. Relevé salaire 3 derniers mois`,
      ou: 'Mutuelle du travailleur' },
    { n: 4, titre: "Protection contre le licenciement", obligatoire: true, duree_estimee: '15 min',
      detail: `═══ PÉRIODE PROTÉGÉE ═══
• Pendant le congé d'adoption
• + 2 mois après la fin du congé

═══ SANCTION ═══
• Indemnité forfaitaire : 6 mois de salaire brut
• Sans préjudice de l'indemnité de préavis normale

═══ EXCEPTIONS ═══
• Motif grave non lié à l'adoption
• Cessation d'activité de l'entreprise`,
      delai: 'Protection pendant + 2 mois après le congé' },
  ],
  alertes: [
    { niveau: 'critique', texte: "Jours 1-3 : à charge de l'employeur à 100% — pas de plafond. Erreur fréquente : croire que la mutuelle prend tout dès le 1er jour." },
    { niveau: 'important', texte: "Les 2 parents peuvent prendre leur congé simultanément. Chacun a droit à sa durée complète indépendamment de l'autre." },
    { niveau: 'attention', texte: "Délai de notification : 7 jours avant le début. Si adoption internationale urgente, notifier dès que possible — le délai est adapté aux circonstances." },
  ],
  simulation: {
    titre: "Coût employeur — Congé adoption 6 semaines (brut 3.000 €/mois)",
    lignes: [
      { label: 'Jours 1-3 (employeur 100%)', montant: '~415 €', type: 'neutre' },
      { label: 'Semaines 2-6 (mutuelle 82%)', montant: '0 € coût direct', type: 'neutre' },
      { label: 'ONSS patronal jours 1-3 (~27%)', montant: '~112 €', type: 'neutre' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'Coût total employeur', montant: '~527 €', type: 'vert_bold' },
    ],
  },
  faq: [
    { q: "Les 2 parents peuvent-ils prendre le congé en même temps ?", r: "Oui, les 2 parents adoptifs peuvent prendre leur congé simultanément. Chacun a droit à sa durée complète." },
    { q: "Que se passe-t-il si l'adoption échoue en cours de congé ?", r: "Le congé est interrompu. L'employeur doit réintégrer le travailleur dès que possible. La mutuelle cesse de payer à la date d'interruption." },
    { q: "Le congé d'adoption est-il cumulable avec les vacances annuelles ?", r: "Non — le congé d'adoption suspend le contrat de travail. Il ne peut pas être pris simultanément avec des vacances annuelles légales." },
  ],
  formulaires: [
    { nom: "SPF Emploi — Congé d'adoption", url: "https://emploi.belgique.be/fr/themes/droit-du-travail/contrats-de-travail/interruption-du-contrat-de-travail/conge-dadoption", type: 'info' },
  ],
};
export default function ProcedureCongeAdoption() {
  const P = PROC_CA;
  const [eo, sEo] = useState(null);
  const [ev, sEv] = useState({});
  const [ong, sO] = useState('etapes');
  const tg = n => sEo(eo === n ? null : n);
  const tV = n => sEv(p => ({ ...p, [n]: !p[n] }));
  const pr = useMemo(() => {
    const t = P.etapes.filter(e => e.obligatoire).length;
    const f = P.etapes.filter(e => e.obligatoire && ev[e.n]).length;
    return { t, f, p: t ? Math.round(f / t * 100) : 0 };
  }, [ev]);
  const og = [
    { id: 'etapes', l: 'Étapes', i: '📋' },
    { id: 'simulation', l: 'Coûts', i: '🧮' },
    { id: 'alertes', l: 'Alertes', i: '⚠️' },
    { id: 'faq', l: 'FAQ', i: '❓' },
    { id: 'legal', l: 'Base légale', i: '⚖️' },
  ];
  const s = {
    pg: { fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', maxWidth: 960, margin: '0 auto', padding: 24, background: '#0a0e1a', color: '#e2e8f0', minHeight: '100vh' },
    ti: { fontSize: 28, fontWeight: 800, color: '#f8fafc', margin: 0 },
    rs: { fontSize: 15, color: '#94a3b8', marginTop: 12, lineHeight: 1.6 },
    pb: { background: '#1e293b', borderRadius: 12, padding: 16, marginBottom: 24 },
    pt: { height: 8, background: '#334155', borderRadius: 4, overflow: 'hidden' },
    pf: p => ({ height: '100%', width: `${p}%`, background: p === 100 ? '#22c55e' : '#3b82f6', borderRadius: 4, transition: 'width .5s' }),
    ts: { display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' },
    tb: a => ({ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: a ? 700 : 500, background: a ? '#3b82f6' : '#1e293b', color: a ? '#fff' : '#94a3b8' }),
    st2: { fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 16 },
    cd: { background: '#111827', border: '1px solid #1e293b', borderRadius: 12, padding: 16, marginBottom: 8 },
    ac: n => ({ background: n === 'critique' ? '#dc262610' : n === 'important' ? '#f9731620' : '#3b82f610', border: `1px solid ${n === 'critique' ? '#dc262640' : n === 'important' ? '#f9731640' : '#3b82f630'}`, borderRadius: 12, padding: 16, marginBottom: 8 }),
    an: n => ({ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: n === 'critique' ? '#ef4444' : n === 'important' ? '#f97316' : '#3b82f6', marginBottom: 6 }),
    ec: (o, v) => ({ background: v ? '#22c55e08' : '#111827', border: `1px solid ${v ? '#22c55e30' : o ? '#3b82f650' : '#1e293b'}`, borderRadius: 12, marginBottom: 8, borderLeft: `4px solid ${v ? '#22c55e' : '#3b82f6'}` }),
    eh: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', userSelect: 'none' },
    en: v => ({ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: v ? '#22c55e' : '#3b82f620', color: v ? '#fff' : '#3b82f6', flexShrink: 0 }),
    et: { flex: 1, fontSize: 14, fontWeight: 600, color: '#f1f5f9' },
    eb: o => ({ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: o ? '#ef444420' : '#64748b20', color: o ? '#f87171' : '#64748b', fontWeight: 600 }),
    ed: { fontSize: 13, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-line' },
    em: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    mi: c => ({ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: `${c}15`, color: c }),
    cb: ch => ({ width: 20, height: 20, borderRadius: 4, border: `2px solid ${ch ? '#22c55e' : '#475569'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: ch ? '#22c55e' : 'transparent' }),
    sr: t => ({ display: 'flex', justifyContent: 'space-between', padding: t === 'separateur' ? 0 : '10px 0', borderBottom: t === 'separateur' ? '1px solid #1e293b' : 'none', marginBottom: t === 'separateur' ? 8 : 0 }),
    sl: t => ({ fontSize: 14, color: t?.includes('vert') ? '#4ade80' : '#cbd5e1', fontWeight: t === 'vert_bold' ? 700 : 400 }),
    sm: t => ({ fontSize: t === 'vert_bold' ? 18 : 14, fontWeight: t?.includes('vert') ? 700 : 400, color: t?.includes('vert') ? '#4ade80' : '#f1f5f9', fontFamily: 'monospace' }),
  };
  return (
    <div style={s.pg}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={s.ti}>{P.icon} {P.titre}</h1>
        <p style={s.rs}>{P.resume}</p>
      </div>
      <div style={s.pb}>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span>Progression : {pr.f}/{pr.t}</span>
          <span style={{ fontWeight: 700, color: pr.p === 100 ? '#22c55e' : '#3b82f6' }}>{pr.p}%</span>
        </div>
        <div style={s.pt}><div style={s.pf(pr.p)} /></div>
      </div>
      <div style={s.ts}>
        {og.map(o => <button key={o.id} style={s.tb(ong === o.id)} onClick={() => sO(o.id)}>{o.i} {o.l}</button>)}
      </div>
      {ong === 'etapes' && <div>{P.etapes.map(e => {
        const o = eo === e.n, v = ev[e.n];
        return <div key={e.n} style={s.ec(o, v)}>
          <div style={s.eh} onClick={() => tg(e.n)}>
            <div style={s.cb(v)} onClick={x => { x.stopPropagation(); tV(e.n); }}>{v && <span style={{ color: '#fff', fontSize: 14 }}>✓</span>}</div>
            <div style={s.en(v)}>{e.n}</div>
            <span style={s.et}>{e.titre}</span>
            <span style={s.eb(e.obligatoire)}>{e.obligatoire ? 'Obligatoire' : 'Info'}</span>
            <span style={{ color: '#64748b', fontSize: 18, transform: o ? 'rotate(180deg)' : '', transition: 'transform .2s' }}>▾</span>
          </div>
          {o && <div style={{ padding: '0 16px 16px 60px' }}>
            <div style={s.ed}>{e.detail}</div>
            <div style={s.em}>
              {e.delai && <span style={s.mi('#f59e0b')}>⏰ {e.delai}</span>}
              {e.duree_estimee && <span style={s.mi('#8b5cf6')}>⏱️ {e.duree_estimee}</span>}
              {e.formulaire && <span style={s.mi('#3b82f6')}>📄 {e.formulaire}</span>}
              {e.ou && <span style={s.mi('#64748b')}>📍 {e.ou}</span>}
            </div>
          </div>}
        </div>;
      })}
      </div>}
      {ong === 'simulation' && <div>
        <h2 style={s.st2}>🧮 {P.simulation.titre}</h2>
        <div style={s.cd}>
          {P.simulation.lignes.map((r, i) => r.type === 'separateur'
            ? <div key={i} style={s.sr('separateur')} />
            : <div key={i} style={s.sr(r.type)}>
              <span style={s.sl(r.type)}>{r.label}</span>
              <span style={s.sm(r.type)}>{r.montant}</span>
            </div>)}
        </div>
      </div>}
      {ong === 'alertes' && <div>
        <h2 style={s.st2}>⚠️ Alertes</h2>
        {P.alertes.map((a, i) => <div key={i} style={s.ac(a.niveau)}>
          <div style={s.an(a.niveau)}>{a.niveau}</div>
          <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6 }}>{a.texte}</div>
        </div>)}
      </div>}
      {ong === 'faq' && <div>
        <h2 style={s.st2}>❓ FAQ</h2>
        {P.faq.map((f, i) => <div key={i} style={s.cd}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>Q : {f.q}</div>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>R : {f.r}</div>
        </div>)}
      </div>}
      {ong === 'legal' && <div>
        <h2 style={s.st2}>⚖️ Base légale</h2>
        {P.baseLegale.map((l, i) => <div key={i} style={s.cd}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#818cf8', marginBottom: 4 }}>{l.ref}</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>{l.desc}</div>
        </div>)}
        {P.formulaires && <div style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>📎 Formulaires officiels</h3>
          {P.formulaires.map((f, i) => <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px 14px', background: '#111827', borderRadius: 8, marginBottom: 6, color: '#60a5fa', fontSize: 13, textDecoration: 'none' }}>🔗 {f.nom}</a>)}
        </div>}
      </div>}
    </div>
  );
}
export { PROC_CA };
