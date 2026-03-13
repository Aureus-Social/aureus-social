'use client';
import { useState, useMemo } from 'react';
const PROC_TE = {
  id: 'transfert_entreprise', icon: '🔄', categorie: 'restructuration',
  titre: "Transfert d'entreprise (CCT n°32bis)",
  resume: "En cas de cession, fusion, scission ou reprise : TOUS les contrats de travail sont automatiquement transférés avec toutes leurs conditions. Licenciement interdit uniquement pour le motif du transfert. Information et consultation des représentants obligatoires. Solidarité cédant/cessionnaire 1 an pour les dettes salariales.",
  baseLegale: [
    { ref: "CCT n°32bis du 07/06/1985", desc: "Transfert d'entreprise — maintien des droits des travailleurs" },
    { ref: "Directive (CE) 2001/23", desc: "Directive européenne transfert d'entreprise" },
    { ref: "Loi 13/02/1998, art. 61-75", desc: "Transfert conventionnel d'entreprise — procédure belge" },
    { ref: "CCT n°9 du 09/03/1972", desc: "Information et consultation des représentants des travailleurs" },
  ],
  etapes: [
    { n: 1, titre: "Identifier si la CCT n°32bis s'applique", obligatoire: true, duree_estimee: '1h',
      detail: `═══ QUAND S'APPLIQUE-T-ELLE ? ═══
• Cession d'entreprise (vente de fonds de commerce)
• Fusion-acquisition (toutes formes)
• Scission d'entreprise
• Reprise d'activité après faillite (partielle — jurisprudence nuancée)
• Externalisation ou reprise d'activité
• Reprise d'un marché ou contrat de service si entité économique maintenue

═══ CONDITION CLÉ : ENTITÉ ÉCONOMIQUE ═══
La CCT n°32bis s'applique si :
• Transfert d'une entité économique AUTONOME
• L'entité conserve son identité après le transfert
• Test : les moyens (personnel, clients, outils, savoir-faire) sont repris

═══ JURISPRUDENCE ═══
Dans les activités de main-d'œuvre intensive (nettoyage, sécurité, IT) :
→ La reprise du PERSONNEL SUFFIT à caractériser le transfert d'entité`,
      delai: 'Analyse préalable obligatoire avant la cession' },
    { n: 2, titre: "Information et consultation obligatoires", obligatoire: true, duree_estimee: '2h',
      detail: `═══ INFORMATION PRÉALABLE ═══
Représentants des travailleurs (DS, CE, CPPT) doivent être informés :
• Date prévue du transfert
• Motifs du transfert
• Conséquences juridiques, économiques et sociales pour les travailleurs
• Mesures envisagées à l'égard des travailleurs

Délai : "en temps utile" avant le transfert

═══ CONSULTATION ═══
Si des mesures affectent les travailleurs :
• Consultation de la délégation syndicale / conseil d'entreprise
• Objectif : chercher un accord (pas nécessairement l'obtenir)

═══ SANCTIONS ═══
• Information insuffisante : délai supplémentaire accordé aux représentants
• Tribunal du travail en référé pour forcer la consultation`,
      delai: 'Information avant le transfert — en temps utile' },
    { n: 3, titre: "Maintien des contrats et conditions", obligatoire: true, duree_estimee: '1h',
      detail: `═══ TRANSFERT AUTOMATIQUE ═══
• TOUS les contrats en cours au moment du transfert sont automatiquement repris
• Aucun acte séparé n'est nécessaire
• Ancienneté INTÉGRALEMENT conservée (préavis, primes, pécule)

═══ CONDITIONS MAINTENUES ═══
• Salaire brut identique
• Avantages acquis (voiture, chèques-repas, assurance groupe)
• CCT applicable maintenue pendant 1 an minimum
• Droits individuels acquis maintenus

═══ SOLIDARITÉ ═══
Cédant et cessionnaire solidairement responsables des dettes salariales nées avant le transfert
→ Pendant 1 an après le transfert`,
    },
    { n: 4, titre: "Licenciement et protection", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ LICENCIEMENT POUR CAUSE DE TRANSFERT : INTERDIT ═══
• Ni cédant ni cessionnaire ne peuvent licencier UNIQUEMENT en raison du transfert
• Exception : raisons économiques, techniques ou organisationnelles DISTINCTES du transfert

═══ REFUS DU TRAVAILLEUR ═══
• Si le travailleur refuse le transfert → considéré comme ayant démissionné
• MAIS si les conditions changent substantiellement (salaire, lieu, fonction) :
  → L'employeur est responsable de la rupture (= comme un licenciement)

═══ TRANSFERT APRÈS FAILLITE ═══
• Le repreneur n'est pas tenu de reprendre TOUS les travailleurs
• Les travailleurs repris bénéficient de la protection CCT n°32bis
• Fonds de fermeture intervient pour les dettes salariales antérieures`,
    },
  ],
  alertes: [
    { niveau: 'critique', texte: "Le transfert des contrats est AUTOMATIQUE — pas de droit de veto pour le cessionnaire. S'il ne veut pas reprendre certains travailleurs, il doit justifier d'une raison économique/organisationnelle distincte du transfert." },
    { niveau: 'important', texte: "Ancienneté INTÉGRALEMENT conservée. Un travailleur avec 15 ans chez le cédant conserve ses 15 ans chez le cessionnaire — impact majeur sur les préavis, le pécule, les primes d'ancienneté." },
    { niveau: 'attention', texte: "Solidarité pour les dettes salariales pendant 1 AN. Le cessionnaire doit exiger du cédant des attestations ONSS, fiches de paie et CDB à jour avant la signature de la cession." },
  ],
  simulation: {
    titre: "Exemple transfert — 10 travailleurs (ancienneté 8 ans, brut moyen 3.200€)",
    lignes: [
      { label: 'Dettes ONSS à vérifier (solidarité)', montant: 'À auditer', type: 'neutre' },
      { label: 'Pécule vacances accumulé (estimation)', montant: '~24.576 €', type: 'neutre' },
      { label: 'Préavis potentiel si licenciement (8 ans)', montant: '~9 semaines/pers.', type: 'neutre' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'Passif social à reprendre', montant: 'Audit social obligatoire', type: 'vert_bold' },
    ],
  },
  faq: [
    { q: "Le cessionnaire peut-il modifier les salaires après le transfert ?", r: "Pas immédiatement. Les salaires sont maintenus pendant au moins 1 an. Après, le cessionnaire peut négocier une nouvelle CCT ou un accord individuel. Réduction unilatérale = illégale." },
    { q: "La CCT n°32bis s'applique-t-elle aux travailleurs intérimaires ?", r: "Non — uniquement aux travailleurs liés par un contrat de travail avec le cédant. Les intérimaires (liés à l'agence) ne sont pas automatiquement transférés." },
    { q: "Un licenciement peut-il être valable juste avant le transfert ?", r: "Oui, si la raison est économique/organisationnelle réelle et distincte du transfert. Mais la chronologie est scrutée : licencier la veille du transfert pour 'réduire les coûts' sera requalifié." },
  ],
  formulaires: [
    { nom: "CCT n°32bis — Texte officiel CNT", url: "https://cnt-nar.be/fr/convention-collective-de-travail/maintien-des-droits-des-travailleurs-en-cas-de-changement-demployeur", type: 'officiel' },
  ],
};
export default function ProcedureTransfertEntreprise() {
  const P = PROC_TE;
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
export { PROC_TE };
