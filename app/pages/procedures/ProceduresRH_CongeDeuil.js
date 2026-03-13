'use client';
import { useState, useMemo } from 'react';
const PROC_CD = {
  id: 'conge_deuil', icon: '😢', categorie: 'conges',
  titre: "Congé de deuil (10 jours)",
  resume: "Depuis le 1er janvier 2023 : 10 jours de congé pour décès du conjoint/cohabitant légal ou d'un enfant. Jours 1-3 payés par l'employeur à 100%, jours 4-10 par la mutuelle à 82%. Flexible sur 12 mois. Distinct du petit chômage CCT n°45.",
  baseLegale: [
    { ref: "Art. 39quater L. 03/07/1978", desc: "Congé de deuil — 10 jours, conditions, indemnisation" },
    { ref: "Loi 18/07/2021", desc: "Extension à 10 jours — entrée en vigueur 01/01/2023" },
    { ref: "AR 17/10/1994", desc: "Indemnisation mutuelle 82% du salaire plafonné" },
    { ref: "CCT n°45", desc: "Petit chômage — distinct du congé de deuil" },
  ],
  etapes: [
    { n: 1, titre: "Identifier le droit applicable", obligatoire: true, duree_estimee: '15 min',
      detail: `═══ CONGÉ DE DEUIL (10 JOURS) — ART. 39QUATER ═══
Applicable UNIQUEMENT pour le décès de :
• Le conjoint ou cohabitant LÉGAL (pas le cohabitant de fait)
• Un enfant (biologique, adopté, ou enfant du conjoint résidant sous le même toit)

═══ PETIT CHÔMAGE (CCT n°45) — AUTRES DÉCÈS ═══
• Père, mère, beau-père, belle-mère : 3 jours
• Frère, sœur, beau-frère, belle-sœur : 1 jour
• Grands-parents, petits-enfants : 1 jour
Ces jours sont ENTIÈREMENT à charge de l'employeur

═══ RÉPARTITION DES 10 JOURS ═══
• Au moins 1 jour doit coïncider avec les funérailles
• Les 9 autres jours : à prendre librement dans les 12 mois suivant le décès
• Peut être fractionné (minimum 1 journée complète sauf accord)`,
      delai: 'À prendre dans les 12 mois suivant le décès' },
    { n: 2, titre: "Charge employeur vs mutuelle", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ JOURS 1, 2, 3 : EMPLOYEUR ═══
• 100% du salaire brut normal
• Pas de plafond pour la part employeur
• Soumis ONSS et PP normaux

═══ JOURS 4 À 10 : MUTUELLE ═══
• 82% du salaire brut journalier
• Plafond journalier 2026 : 180,44 €
• Exemple brut 3.000€/mois : 3.000/26 × 82% = 94,61€/jour

═══ DOSSIER MUTUELLE ═══
1. Acte de décès
2. Preuve du lien de parenté
3. Formulaire "congé de deuil" de la mutuelle
4. Attestation employeur de suspension du contrat
5. Relevé des 3 derniers salaires`,
      ou: 'Mutuelle du travailleur' },
    { n: 3, titre: "Demande et justificatifs", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ PROCÉDURE ═══
• Informer l'employeur le plus tôt possible
• L'employeur peut demander l'acte de décès (justificatif)
• Le congé de deuil est un DROIT — l'employeur ne peut pas le refuser

═══ DÉLAI MUTUELLE ═══
• Introduire la demande dans les 14 jours suivant le premier jour de congé
• Passé ce délai, des pénalités peuvent s'appliquer

═══ PROTECTION ═══
• Protection contre le licenciement pendant le congé de deuil
• Indemnité 6 mois si licenciement en représailles`,
    },
  ],
  alertes: [
    { niveau: 'critique', texte: "Jours 1-3 : à charge de l'EMPLOYEUR à 100% — même si le salaire dépasse le plafond mutuelle. Pas de plafond pour la part employeur." },
    { niveau: 'important', texte: "Les 7 jours restants (mutuelle) sont flexibles sur 12 mois. L'employeur DOIT les accorder à la demande du travailleur dans ce délai. Refuser = illégal." },
    { niveau: 'attention', texte: "Ne s'applique QU'AU conjoint/cohabitant légal et aux enfants. Pour les autres membres de la famille → petit chômage CCT n°45 (1 à 3 jours)." },
  ],
  simulation: {
    titre: "Coût employeur — Congé de deuil 10 jours (brut 3.000 €/mois)",
    lignes: [
      { label: 'Jours 1-3 : employeur 100%', montant: '~415 €', type: 'neutre' },
      { label: 'Jours 4-10 : mutuelle 82%', montant: '0 € coût direct', type: 'neutre' },
      { label: 'ONSS patronal jours 1-3', montant: '~112 €', type: 'neutre' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'Coût total employeur', montant: '~527 €', type: 'vert_bold' },
    ],
  },
  faq: [
    { q: "Le cohabitant de fait bénéficie-t-il du congé de deuil de 10 jours ?", r: "Non — uniquement les cohabitants LÉGAUX (déclaration à la commune) et les conjoints mariés. Le cohabitant de fait bénéficie seulement du petit chômage." },
    { q: "Les 7 jours restants peuvent-ils être pris en demi-journées ?", r: "Possible mais requiert un accord avec l'employeur. Sans accord, le minimum est 1 journée complète par période." },
    { q: "Que se passe-t-il si l'employeur refuse les jours restants ?", r: "Le refus est illégal. Saisir l'Inspection sociale SPF ETCS ou le Tribunal du travail en référé. Indemnité de 6 mois possible si représailles." },
  ],
  formulaires: [
    { nom: "SPF Emploi — Congé de deuil", url: "https://emploi.belgique.be/fr/themes/droit-du-travail/contrats-de-travail/interruption-du-contrat-de-travail/conge-de-deuil", type: 'info' },
  ],
};
export default function ProcedureCongeDeuil() {
  const P = PROC_CD;
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
      })}</div>}
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
export { PROC_CD };
