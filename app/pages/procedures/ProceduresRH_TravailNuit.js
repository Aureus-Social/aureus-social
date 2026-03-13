'use client';
import { useState, useMemo } from 'react';
const PROC_TN = {
  id: 'travail_nuit', icon: '🌙', categorie: 'organisation',
  titre: "Travail de nuit & dimanche",
  resume: "Travail entre 20h et 6h = travail de nuit (interdit par principe sauf CCT/AR sectoriel). Dimanche = interdit par principe sauf dérogations légales. Sursalaire dimanche LÉGAL : 100%. Prime de nuit : selon CCT (pas de minimum légal). Surveillance médicale renforcée obligatoire pour travailleurs de nuit réguliers.",
  baseLegale: [
    { ref: "Loi 16/03/1971, art. 35-38", desc: "Repos dominical — principe et exceptions" },
    { ref: "Loi 16/03/1971, art. 19ter", desc: "Définition travail de nuit (20h-6h)" },
    { ref: "CCT n°46 du 23/03/1990", desc: "Encadrement du travail en équipes comportant du travail de nuit" },
    { ref: "AR 28/05/2003, art. 24-28", desc: "Surveillance santé renforcée — travailleurs de nuit" },
    { ref: "Loi 16/03/1971, art. 29", desc: "Sursalaires heures supplémentaires et dimanche" },
  ],
  etapes: [
    { n: 1, titre: "Vérifier l'autorisation légale", obligatoire: true, duree_estimee: '1h',
      detail: `═══ TRAVAIL DE NUIT (20H-6H) ═══
INTERDIT par principe sauf :
• CCT sectorielle l'autorisant (ex. CP 200 : autorisé sur accord)
• CCT d'entreprise déposée au SPF Emploi
• AR spécifique pour certains secteurs (horeca, sécurité, soins, transport)
• Nécessité technique impérieuse ou surveillance continue

═══ TRAVAIL DU DIMANCHE ═══
INTERDIT par principe sauf :
• Commerce de détail : autorisation limitée (loi 10/11/2006)
• Secteurs en continu : sidérurgie, chimie, alimentation, soins
• Travaux urgents ou force majeure

═══ PROCÉDURE POUR INSTAURER LE TRAVAIL DE NUIT ═══
1. Négociation délégation syndicale (si ≥50 travailleurs)
2. Consultation conseil d'entreprise (si ≥100 travailleurs)
3. Dépôt CCT au Greffe SPF Emploi
4. Modification du règlement de travail`,
      delai: 'Procédure légale obligatoire avant instauration' },
    { n: 2, titre: "Sursalaires obligatoires", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ TRAVAIL DU DIMANCHE ═══
• Sursalaire LÉGAL obligatoire : 100% du salaire journalier en plus
  → Doublement du salaire journalier (art. 29 §1 L. 16/03/1971)
• + Repos compensatoire dans les 6 jours suivants (obligatoire)

═══ TRAVAIL DE NUIT ═══
• La loi ne fixe PAS de sursalaire minimum légal pour la nuit
• Se référer à la CCT sectorielle CP [CP]
  → CP 200 : prime de nuit selon CCT d'entreprise (souvent 20-35%)
  → CP 302 (horeca) : prime nuit + prime dimanche cumulables

═══ JOURS FÉRIÉS ═══
• Sursalaire LÉGAL : 100% (loi 4/01/1974)
• + Repos compensatoire obligatoire (même durée que les prestations)`,
      delai: 'Paiement sur fiche de paie du mois concerné' },
    { n: 3, titre: "Surveillance médicale renforcée", obligatoire: true, duree_estimee: '1h', formulaire: 'Formulaire SEPP',
      detail: `═══ POUR QUI ? ═══
Travailleurs de nuit réguliers (≥3h entre 22h-6h de façon régulière) :
• Évaluation de santé AVANT prise de poste de nuit
• Surveillance régulière (au moins tous les 2 ans)
• Droit au retour au travail de jour si incompatibilité médicale

═══ PROCÉDURE ═══
1. Déclaration au SEPP (Service Externe Prévention)
2. Visite médicale préalable
3. Registre des prestations de nuit (obligatoire — conservé 5 ans)

═══ FEMMES ENCEINTES ═══
• Droit ABSOLU au retour au travail de jour dès déclaration de grossesse
• Si pas de poste de jour disponible : dispense + salaire maintenu`,
      ou: 'SEPP — Service Externe Prévention' },
  ],
  alertes: [
    { niveau: 'critique', texte: "Instaurer du travail de nuit SANS CCT ni AR habilitant = infraction pénale (art. 49 L. 16/03/1971) — amende jusqu'à 4.800€/travailleur × 8 (Code pénal social)." },
    { niveau: 'critique', texte: "Sursalaire dimanche (100%) d'ORDRE PUBLIC — aucune CCT ni contrat ne peut y déroger à la baisse. Oubli fréquent et coûteux en contrôle." },
    { niveau: 'important', texte: "Surveillance médicale renforcée obligatoire — visite manquante expose l'employeur devant le Tribunal correctionnel en cas d'accident." },
  ],
  simulation: {
    titre: "Coût dimanche/nuit — journalier 138€ (3.000€/mois ÷ 21,66)",
    lignes: [
      { label: 'Dimanche (sursalaire légal 100%)', montant: '+138 € / jour', type: 'neutre' },
      { label: 'Prime de nuit CCT (ex. 25%)', montant: '+34,5 € / nuit', type: 'neutre' },
      { label: 'ONSS patronal sur sursalaire (~27%)', montant: '+37 € / jour dim.', type: 'neutre' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'Surcoût dimanche vs jour normal', montant: '+175 € / dimanche', type: 'vert_bold' },
    ],
  },
  faq: [
    { q: "Un travailleur peut-il refuser de travailler la nuit ou le dimanche ?", r: "Oui, si aucune clause de travail de nuit/dimanche dans son contrat. Modification unilatérale = illégale. Nécessite un avenant signé." },
    { q: "Le repos compensatoire peut-il être remplacé par un supplément financier ?", r: "Non pour dimanche et jours fériés — le repos compensatoire est légalement obligatoire. Pour les nuits, cela dépend de la CCT sectorielle." },
    { q: "Une femme enceinte peut-elle refuser un poste de nuit ?", r: "Oui — droit absolu dès la déclaration de grossesse. L'employeur propose un poste de jour équivalent. Si impossible : dispense avec maintien du salaire." },
  ],
  formulaires: [
    { nom: "SPF Emploi — Travail de nuit", url: "https://emploi.belgique.be/fr/themes/droit-du-travail/reglementation-du-travail/travail-de-nuit", type: 'info' },
  ],
};
export default function ProcedureTravailNuit() {
  const P = PROC_TN;
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
export { PROC_TN };
