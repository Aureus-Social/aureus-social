'use client';
import { useState, useMemo } from 'react';
const PROC_CE = {
  id: 'clause_ecolage', icon: '🎓', categorie: 'contrat',
  titre: "Clause d'écolage",
  resume: "Clause permettant à l'employeur de récupérer les frais de formation si le travailleur quitte prématurément. Conditions strictes : salaire annuel brut > 43.335€ (2026), formation > 80h OU coût > seuil, écrit obligatoire AVANT la formation, remboursement dégressif max 3 ans (80/50/20%). Nulle si conditions non respectées.",
  baseLegale: [
    { ref: "Art. 22bis L. 03/07/1978", desc: "Clause d'écolage — conditions de validité, plafonds, dégressivité" },
    { ref: "Loi 05/09/2001", desc: "Introduction de la clause d'écolage en droit belge" },
    { ref: "CCT n°136 du 22/01/2019", desc: "Droit à la formation — 5 jours/an, 80h sur 2 ans pour la clause" },
    { ref: "AR indexation annuel", desc: "Seuil de rémunération indexé annuellement (43.335€ en 2026)" },
  ],
  etapes: [
    { n: 1, titre: "Vérifier les 4 conditions de validité", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ CONDITIONS CUMULATIVES (toutes requises) ═══

1. SEUIL DE RÉMUNÉRATION
   Salaire brut annuel > 43.335€ (2026)
   Si salaire < seuil → CLAUSE NULLE de plein droit

2. SEUIL DE FORMATION (UN des deux suffit)
   • Durée > 80 heures de formation sur la période d'écolage
   • OU coût > 50% de la rémunération annuelle brute
   Si ni l'un ni l'autre → CLAUSE NULLE

3. FORME ÉCRITE OBLIGATOIRE
   • Annexe au contrat ou avenant signé AVANT la formation
   • Mentions obligatoires : type de formation, durée, coût, période, montant remboursable
   • Pas de signature = NULLE

4. INTERDICTIONS
   • Pas pour formation obligatoire légale (sécurité, habilitations)
   • Pas pour formation imposée pour maintenir la fonction
   • Pas signée APRÈS la formation (rétroactivité interdite)`,
      delai: 'Signature AVANT la formation — condition absolue' },
    { n: 2, titre: "Dégressivité obligatoire du remboursement", obligatoire: true, duree_estimee: '1h',
      detail: `═══ PÉRIODE D'ÉCOLAGE MAXIMALE : 3 ANS ═══

Si période = 3 ans :
• Année 1 : max 80% du coût de formation
• Année 2 : max 50% du coût de formation
• Année 3 : max 20% du coût de formation

Si période = 2 ans :
• Année 1 : max 80%
• Année 2 : max 40%

Si période = 1 an : max 80% en une fois

La clause doit MENTIONNER expressément ces montants dégressifs.`,
    },
    { n: 3, titre: "Cas de remboursement et exonérations", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ REMBOURSEMENT DÛ ═══
• Démission volontaire du travailleur pendant la période d'écolage
• Licenciement pour motif grave imputable au travailleur

═══ PAS DE REMBOURSEMENT ═══
• Licenciement par l'employeur (sauf motif grave du travailleur)
• Licenciement pour restructuration ou fermeture
• Fin de CDD à terme
• Rupture d'un commun accord à l'initiative de l'employeur
• Invalidité reconnue

═══ PROCÉDURE ═══
1. Mise en demeure écrite avec détail du montant (prorata dégressif)
2. Précompte possible sur solde de tout compte (avec accord écrit préalable)
3. Si refus : Tribunal du travail
⚠️ Jamais de retenue unilatérale sur salaire sans accord (L. 12/04/1965)`,
      delai: 'Remboursement exigible dès la fin du contrat' },
  ],
  alertes: [
    { niveau: 'critique', texte: "Clause NULLE si signée APRÈS la formation, si salaire sous le seuil, ou si formation < 80h. Une clause nulle = 0€ récupérable — même si le travailleur part le lendemain." },
    { niveau: 'important', texte: "Licenciement par l'employeur (sauf motif grave du travailleur) LIBÈRE le travailleur de tout remboursement. Impossible de licencier quelqu'un ET récupérer les frais de formation." },
    { niveau: 'attention', texte: "Formation obligatoire pour le maintien du poste (sécurité, habilitations légales) NE PEUT PAS faire l'objet d'une clause d'écolage — même si coûteuse." },
  ],
  simulation: {
    titre: "Clause d'écolage — Formation 5.000€, salaire 4.500€/mois, période 3 ans",
    lignes: [
      { label: 'Coût formation employeur', montant: '5.000 €', type: 'neutre' },
      { label: 'Max récupérable an 1 (80%)', montant: '4.000 €', type: 'neutre' },
      { label: 'Max récupérable an 2 (50%)', montant: '2.500 €', type: 'neutre' },
      { label: 'Max récupérable an 3 (20%)', montant: '1.000 €', type: 'neutre' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'Protection employeur max (an 1)', montant: '4.000 €', type: 'vert_bold' },
    ],
  },
  faq: [
    { q: "Peut-on appliquer la clause à un travailleur sous le seuil avec son accord ?", r: "Non — le seuil de 43.335€ est d'ordre public. Même avec l'accord du travailleur, la clause est nulle en dessous du seuil." },
    { q: "Un CDD peut-il faire l'objet d'une clause d'écolage ?", r: "Oui, mais le remboursement n'est exigible qu'en cas de rupture anticipée à l'initiative du travailleur. La fin normale du CDD ne donne pas lieu à remboursement." },
    { q: "Clause d'écolage et clause de non-concurrence peuvent-elles coexister ?", r: "Oui — elles sont indépendantes et couvrent des objets différents. Les deux peuvent figurer dans le même contrat." },
  ],
  formulaires: [
    { nom: "SPF Emploi — Clause d'écolage", url: "https://emploi.belgique.be/fr/themes/droit-du-travail/contrats-de-travail/clause-decolage", type: 'info' },
  ],
};
export default function ProcedureClauseEcolage() {
  const P = PROC_CE;
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
export { PROC_CE };
