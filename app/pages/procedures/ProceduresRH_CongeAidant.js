'use client';
import { useState, useMemo } from 'react';
const PROC_CAID = {
  id: 'conge_aidant', icon: '🧑‍🤝‍🧑', categorie: 'conges',
  titre: "Congé d'aidant proche",
  resume: "5 jours ouvrables par an pour soins personnels à un membre du ménage ou de la famille souffrant d'un problème médical grave. Transposé en droit belge en 2023 (Directive UE 2019/1158). Pas de rémunération légale automatique — vérifier CCT. Protection contre le licenciement.",
  baseLegale: [
    { ref: "Art. 30 §5 L. 03/07/1978", desc: "Congé d'aidant proche — 5 jours/an, conditions" },
    { ref: "Directive UE 2019/1158", desc: "Équilibre vie pro/vie privée — transposée 2023" },
    { ref: "Loi 07/04/2023", desc: "Transposition en droit belge — en vigueur depuis 10/11/2022" },
  ],
  etapes: [
    { n: 1, titre: "Conditions d'accès et bénéficiaires des soins", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ QUI PEUT BÉNÉFICIER DES SOINS ? ═══
• Membre du ménage (domicile commun)
• Famille 1er degré : parents, enfants
• Depuis 2023 : frères/sœurs, grands-parents, petits-enfants
• Conjoint/cohabitant légal

═══ CONDITION MÉDICALE ═══
• Maladie grave nécessitant soins quotidiens ou complexes
• Handicap reconnu nécessitant aide permanente ou fréquente
• Âge avancé avec perte d'autonomie

═══ DROIT ═══
• 5 jours ouvrables par ANNÉE CIVILE (1er jan → 31 déc)
• Fractionnable par jour ou demi-journée
• Ne peut être refusé par l'employeur — droit absolu

═══ RÉMUNÉRATION ═══
• La loi ne prévoit PAS le maintien automatique du salaire
• Vérifier la CCT sectorielle applicable`,
      delai: '5 jours max par année civile (1er jan - 31 déc)' },
    { n: 2, titre: "Notification et justificatifs", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ NOTIFICATION ═══
• Le plus tôt possible — idéalement la veille
• En cas d'urgence : le jour même
• Oral + confirmation écrite recommandée

═══ JUSTIFICATIFS ═══
• Attestation médicale précisant la nécessité de soins personnels
• L'employeur peut demander un justificatif
• Pas d'obligation de fournir le diagnostic (RGPD)

═══ FORMAT ═══
Email ou lettre : "Congé d'aidant proche — art. 30 §5 L. 03/07/1978"`,
      ou: 'Employeur' },
    { n: 3, titre: "Protection contre le licenciement", obligatoire: true, duree_estimee: '15 min',
      detail: `═══ PROTECTION ═══
• Interdiction de licencier ou de modifier unilatéralement les conditions de travail
• Pendant le congé ET les 2 semaines suivantes
• Protection contre toute représaille

═══ SANCTION ═══
• Indemnité = 2 semaines de salaire minimum
• Sans préjudice de l'indemnité de préavis
• Tribunal du travail compétent

═══ RAPPEL ═══
• Ce droit ne peut pas être limité par le règlement de travail
• L'employeur NE PEUT PAS conditionner le congé à un remplacement préalable`,
    },
  ],
  alertes: [
    { niveau: 'important', texte: "5 jours seulement par AN — période de référence = ANNÉE CIVILE (1er janvier au 31 décembre), pas l'anniversaire d'entrée en service. Vérifier le solde avant d'accorder." },
    { niveau: 'attention', texte: "Rémunération non automatique légalement — vérifier la CCT sectorielle. Si silencieuse, le travailleur peut être non payé. Clarifier dans le règlement de travail." },
    { niveau: 'attention', texte: "Distinct du congé pour assistance médicale (art. 30bis) qui couvre jusqu'à 10 jours pour accompagner un proche en soins palliatifs ou en fin de vie." },
  ],
  simulation: {
    titre: "Impact salarial — 5 jours aidant proche (brut 3.000 €/mois)",
    lignes: [
      { label: 'Si CCT prévoit maintien salaire', montant: '~693 €', type: 'neutre' },
      { label: 'ONSS patronal maintenu', montant: '~187 €', type: 'neutre' },
      { label: 'Si pas de maintien (loi seule)', montant: '0 € coût direct', type: 'neutre' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'Coût max employeur (avec CCT)', montant: '~880 €', type: 'vert_bold' },
    ],
  },
  faq: [
    { q: "Les 5 jours peuvent-ils être pris en demi-journées ?", r: "Oui — depuis 2023, le congé peut être pris par demi-journées (= 10 demi-journées/an). Accord avec l'employeur recommandé mais pas obligatoire légalement." },
    { q: "L'employeur peut-il reporter ce congé ?", r: "Non — l'employeur ne peut pas reporter ni refuser. C'est un droit absolu. Seule exception : contestation de la justification médicale via le médecin conseil de la mutuelle." },
    { q: "Ce congé se cumule-t-il avec le petit chômage ?", r: "Ce sont deux régimes distincts couvrant des situations différentes. Ils ne se cumulent pas pour le même événement mais peuvent s'appliquer à des situations distinctes." },
  ],
  formulaires: [
    { nom: "SPF Emploi — Congé aidant proche", url: "https://emploi.belgique.be/fr/themes/droit-du-travail/contrats-de-travail/interruption-du-contrat-de-travail/conge-pour-raisons-imperieuses", type: 'info' },
  ],
};
export default function ProcedureCongeAidant() {
  const P = PROC_CAID;
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
export { PROC_CAID };
