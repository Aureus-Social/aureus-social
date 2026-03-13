'use client';
import { useState, useMemo } from 'react';
const PROC_DISC = {
  id: 'discrimination', icon: '⚖️', categorie: 'legal',
  titre: "Discrimination & égalité de traitement",
  resume: "19 critères protégés en droit belge (âge, sexe, handicap, origine ethnique, orientation sexuelle, convictions...). Discrimination directe ET indirecte interdites. Charge de la preuve partagée dès présomption. Indemnité minimum 6 mois de salaire brut. Rapport bisannuel écart salarial H/F obligatoire (≥50 travailleurs).",
  baseLegale: [
    { ref: "Loi 10/05/2007 (antidiscrimination générale)", desc: "19 critères protégés — discrimination directe, indirecte, harcèlement" },
    { ref: "Loi 10/05/2007 (genre)", desc: "Égalité de traitement H/F dans l'emploi" },
    { ref: "Loi 30/07/1981 (Moureaux)", desc: "Discrimination fondée sur l'origine raciale ou ethnique" },
    { ref: "Loi 22/04/2012", desc: "Écart salarial H/F — rapport bisannuel obligatoire ≥50 travailleurs" },
  ],
  etapes: [
    { n: 1, titre: "Les 19 critères protégés", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ CRITÈRES PROTÉGÉS — LOI 10/05/2007 ═══
1. Âge
2. Orientation sexuelle
3. État civil
4. Naissance (légitimité, adoption)
5. Fortune (patrimoine)
6. Convictions religieuses ou philosophiques
7. Convictions politiques
8. Langue
9. Situation de santé actuelle ou future
10. Handicap
11. Caractéristique physique ou génétique
12. Origine sociale
13. Nationalité
14. Prétendue race / couleur de peau
15. Ascendance
16. Origine nationale ou ethnique

Critères loi genre :
17. Sexe (y compris grossesse, maternité, paternité)
18. Identité de genre
19. Expression de genre

⚠️ La liste est EXHAUSTIVE — un traitement différencié sur un autre critère n'est pas couvert par ces lois`,
    },
    { n: 2, titre: "Discrimination directe vs indirecte", obligatoire: true, duree_estimee: '30 min',
      detail: `═══ DISCRIMINATION DIRECTE ═══
Traitement MOINS FAVORABLE fondé directement sur un critère protégé
Exemples :
• Refus d'embauche "vous avez l'air trop âgé" → âge
• Salaire inférieur à fonction égale pour une femme → sexe
• Licenciement lors d'annonce de grossesse → sexe/grossesse

Justification possible : exigence professionnelle essentielle et déterminante

═══ DISCRIMINATION INDIRECTE ═══
Mesure NEUTRE en apparence qui désavantage PARTICULIÈREMENT un groupe protégé
Exemples :
• Exiger un permis de conduire pour poste sédentaire (défavorise handicapés)
• Horaire fixe excluant de facto les parents isolés (majorité de femmes)

Justification possible : objectif légitime + mesure appropriée + nécessaire

═══ AUTRES FORMES ═══
• Injonction à discriminer (donner l'ordre de discriminer = aussi illégal)
• Harcèlement discriminatoire (comportement lié à un critère protégé)
• Victimisation (représailles contre celui qui dénonce une discrimination)`,
    },
    { n: 3, titre: "Charge de la preuve et sanctions", obligatoire: true, duree_estimee: '1h',
      detail: `═══ RENVERSEMENT DE LA CHARGE DE LA PREUVE ═══
1. La personne discriminée établit des FAITS permettant de PRÉSUMER la discrimination
2. → C'est à l'EMPLOYEUR de prouver l'ABSENCE de discrimination

Présomption établie par ex. :
• Statistiques montrant sous-représentation d'un groupe
• Déclarations directes de l'employeur
• Chronologie suspecte (licenciement 2 jours après annonce grossesse)

═══ SANCTIONS ═══
• Indemnité forfaitaire MINIMUM : 6 mois de salaire brut (sans preuve de préjudice réel)
• Ou préjudice réel si > 6 mois
• Nullité de l'acte discriminatoire (licenciement nul → réintégration possible)

═══ ORGANES DE CONTRÔLE ═══
• Unia (antidiscrimination générale) : www.unia.be
• IEFH (égalité H/F) : www.iefh.be
• Inspection sociale SPF ETCS`,
      delai: 'Prescription : 1 an à partir du fait discriminatoire' },
    { n: 4, titre: "Rapport écart salarial H/F (≥50 travailleurs)", obligatoire: true, duree_estimee: '4h',
      detail: `═══ OBLIGATION LOI 22/04/2012 ═══
Entreprises ≥50 travailleurs : rapport analytique tous les 2 ans
• Remis au conseil d'entreprise (ou délégation syndicale)
• Ventilé par sexe, catégorie de fonction, ancienneté

═══ CONTENU ═══
1. Répartition H/F par catégorie
2. Salaire moyen brut H/F par catégorie
3. Ancienneté moyenne H/F
4. Heures de travail H/F (temps plein/partiel)
5. Primes et avantages H/F
6. Analyse des écarts constatés
7. Plan d'action si écart > 5%`,
      delai: 'Tous les 2 ans — remis au CE/DS' },
  ],
  alertes: [
    { niveau: 'critique', texte: "INDEMNITÉ MINIMALE : 6 mois de salaire brut SANS avoir à prouver le préjudice. Pour 3.000€/mois = 18.000€ minimum. Indemnité forfaitaire — le travailleur y a droit dès que la discrimination est établie." },
    { niveau: 'critique', texte: "Charge de la preuve RENVERSÉE dès présomption. L'employeur doit prouver l'ABSENCE de discrimination — extrêmement difficile. Toujours documenter les raisons objectives de chaque décision RH." },
    { niveau: 'important', texte: "Rapport écart salarial H/F : une entreprise de 50+ travailleurs qui ne produit pas ce rapport risque des sanctions ONSS et injonctions de l'IEFH." },
  ],
  simulation: {
    titre: "Risque financier discrimination — salaire 3.000 €/mois",
    lignes: [
      { label: 'Indemnité min. discrimination (6 mois)', montant: '18.000 €', type: 'neutre' },
      { label: 'Indemnité préavis (ex. 9 semaines)', montant: '~6.230 €', type: 'neutre' },
      { label: 'Frais avocat + procédure', montant: '3.000-10.000 €', type: 'neutre' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'Risque total estimé par dossier', montant: '>30.000 €', type: 'vert_bold' },
    ],
  },
  faq: [
    { q: "Un employeur peut-il pratiquer une 'discrimination positive' ?", r: "Oui, sous conditions strictes. L'action positive est autorisée si : groupe sous-représenté, mesure temporaire, objectif proportionné, abolie dès l'objectif atteint (art. 10 Loi 10/05/2007)." },
    { q: "Un employeur peut-il demander une photo lors d'un entretien d'embauche ?", r: "Légalement non. Demander une photo crée un risque de discrimination (apparence physique, origine, âge apparent). Recommandation : ne jamais demander de photo dans le cadre d'un recrutement." },
    { q: "Le harcèlement moral est-il de la discrimination ?", r: "Pas automatiquement. Le harcèlement moral (L. 4/08/1996) est distinct. Mais si le harcèlement est fondé sur un critère protégé, les deux lois s'appliquent cumulativement." },
  ],
  formulaires: [
    { nom: "Unia — Signalement discrimination", url: "https://www.unia.be/fr/signalement", type: 'officiel' },
    { nom: "IEFH — Institut Égalité H/F", url: "https://igvm-iefh.belgium.be/fr", type: 'officiel' },
  ],
};
export default function ProcedureDiscrimination() {
  const P = PROC_DISC;
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
export { PROC_DISC };
