'use client';
import { useState, useMemo } from 'react';
const PROC_LA = {
  id: 'lanceurs_alerte', icon: '🚨', categorie: 'legal',
  titre: "Lanceurs d'alerte (Loi 28/11/2022)",
  resume: "Entreprises privées ≥50 travailleurs : canal de signalement interne OBLIGATOIRE. Protection absolue contre les représailles (licenciement, démotion, harcèlement). Coordinateur à désigner. Accusé de réception en 7 jours, suivi en 3 mois. Amende jusqu'à 80.000€ en cas de non-conformité.",
  baseLegale: [
    { ref: "Loi 28/11/2022", desc: "Protection des personnes signalant des violations — transposition directive (UE) 2019/1937" },
    { ref: "Directive (UE) 2019/1937", desc: "Protection des lanceurs d'alerte — cadre européen" },
    { ref: "AR 22/09/2023", desc: "Modalités des canaux de signalement interne" },
    { ref: "Code pénal social, niveau 4", desc: "Sanctions — amendes jusqu'à 80.000€" },
  ],
  etapes: [
    { n: 1, titre: "Vérifier si l'obligation s'applique", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ QUI EST OBLIGÉ ? ═══
• Entreprises privées ≥ 50 travailleurs (ETP) : OBLIGATOIRE
• Entreprises < 50 travailleurs : pas d'obligation de canal interne
  (mais la protection des signalants s'applique quand même)

═══ MATIÈRES COUVERTES ═══
• Marchés publics
• Services financiers, produits et marchés
• Sécurité des produits et des transports
• Protection de l'environnement
• Santé publique, sécurité des aliments
• RGPD / données personnelles
• Sécurité des réseaux et systèmes d'information
• Intérêts financiers de l'UE
• Concurrence et aides d'État
• Et autres violations du droit national listées à l'annexe`,
      delai: 'Canal interne à mettre en place dès 50 ETP' },
    { n: 2, titre: "Mettre en place le canal de signalement", obligatoire: true, duree_estimee: '4h',
      detail: `═══ COMPOSANTES OBLIGATOIRES ═══

1. COORDINATEUR DE SIGNALEMENT
   • Personne interne (RH, compliance, direction)
   • Ou prestataire externe (avocat, compliance officer)
   • Identité communiquée aux travailleurs
   • Obligation de confidentialité renforcée

2. CANAUX DE RÉCEPTION
   • Par écrit (formulaire, email dédié, courrier)
   • Par oral (ligne téléphonique ou réunion en personne)
   • De manière anonyme si demandé

3. ACCUSÉ DE RÉCEPTION : dans les 7 JOURS

4. SUIVI : max 3 MOIS (6 mois si justifié)

5. REGISTRE des signalements (traçabilité, conservation 5 ans recommandé)`,
      delai: 'Accusé réception 7 jours | Suivi 3 mois' },
    { n: 3, titre: "Protection contre les représailles", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ REPRÉSAILLES INTERDITES ═══
• Licenciement (direct ou indirect)
• Mise à pied, suspension, rétrogradation
• Modification unilatérale des conditions de travail
• Harcèlement moral ou sexuel
• Discrimination (évaluation négative injustifiée)
• Dénonciation pénale abusive contre le signalant

═══ RENVERSEMENT DE LA CHARGE DE LA PREUVE ═══
Si signalant démontre : signalement + mesure négative
→ L'EMPLOYEUR doit prouver que la mesure n'est PAS liée au signalement

═══ SANCTIONS ═══
• Amende administrative : jusqu'à 80.000€ (niveau 4 CPS)
• Nullité de la mesure de représailles
• Indemnité compensatoire`,
      delai: 'Protection dès le signalement de bonne foi' },
    { n: 4, titre: "Information des travailleurs", obligatoire: true, duree_estimee: '2h',
      detail: `═══ OBLIGATIONS D'INFORMATION ═══
• Informer tous les travailleurs de l'existence du canal
• Communiquer les matières couvertes
• Coordonnées du coordinateur
• Rappel de la protection contre les représailles

═══ MOYENS ═══
• Affichage obligatoire (règlement de travail — art. 6bis L. 8/04/1965)
• Note interne écrite
• Formation lors de l'onboarding
• Intranet

═══ CANAL EXTERNE ═══
Si le travailleur préfère ne pas passer par le canal interne :
→ Il peut s'adresser à l'Institut fédéral (IFLP) directement
→ L'employeur NE PEUT PAS l'en empêcher`,
    },
  ],
  alertes: [
    { niveau: 'critique', texte: "Amende jusqu'à 80.000€ pour entraves au signalement ou représailles. Code pénal social niveau 4 — le plus élevé. Sans canal interne à 50 ETP = infraction continue." },
    { niveau: 'critique', texte: "Charge de la preuve RENVERSÉE : c'est à l'employeur de prouver que le licenciement n'est pas lié au signalement. Tout licenciement d'un signalant sera scruté." },
    { niveau: 'important', texte: "Signalant de mauvaise foi : ne bénéficie PAS de la protection. Mais l'employeur doit prouver la mauvaise foi — difficile en pratique." },
  ],
  simulation: {
    titre: "Coût mise en conformité — PME 50-100 travailleurs",
    lignes: [
      { label: 'Coordinateur interne (coût temps)', montant: '0 € direct', type: 'neutre' },
      { label: 'Coordinateur externe (compliance)', montant: '2.000-5.000 €/an', type: 'neutre' },
      { label: 'Canal IT + formulaire + communication', montant: '1.000-3.000 €', type: 'neutre' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'Amende non-conformité (max)', montant: '80.000 €', type: 'vert_bold' },
    ],
  },
  faq: [
    { q: "Un travailleur peut-il signaler anonymement ?", r: "Oui — le canal doit permettre les signalements anonymes si demandé. Le coordinateur traite le signalement anonyme de la même façon qu'un signalement nominatif." },
    { q: "La loi s'applique-t-elle aux sous-traitants et prestataires ?", r: "Oui — la protection s'étend aux indépendants, sous-traitants, stagiaires, bénévoles, membres des organes d'administration. Pas uniquement aux salariés." },
    { q: "Que se passe-t-il si le canal interne ne fonctionne pas ?", r: "Le signalant peut s'adresser directement à l'IFLP ou aux autorités compétentes. L'employeur ne peut s'y opposer." },
  ],
  formulaires: [
    { nom: "IFLP — Institut fédéral protection lanceurs d'alerte", url: "https://whistleblowerinstitute.be/fr", type: 'officiel' },
    { nom: "Loi 28/11/2022 — Texte officiel", url: "https://www.ejustice.just.fgov.be/cgi_loi/change_lg.pl?language=fr&la=F&cn=2022112804&table_name=loi", type: 'officiel' },
  ],
};
export default function ProcedureLanceursAlerte() {
  const P = PROC_LA;
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
export { PROC_LA };
