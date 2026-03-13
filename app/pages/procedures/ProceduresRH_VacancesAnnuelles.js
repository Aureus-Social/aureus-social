'use client';
import { useState, useMemo } from 'react';

const PROC_VA = {
  id: 'vacances_annuelles', icon: '🌴', categorie: 'conges',
  titre: "Vacances annuelles",
  resume: "20 jours/an (temps plein 5j/sem). Droits acquis sur base des prestations de l'exercice de vacances (N-1). Vacances collectives fixées au CE. Pécule simple + double. Les vacances DOIVENT être prises dans l'année civile — pas de report.",
  baseLegale: [
    { ref: "Loi du 4 janvier 1974", desc: "Vacances annuelles des travailleurs salariés" },
    { ref: "AR du 30 mars 1967", desc: "Modalités d'exécution de la loi sur les vacances" },
    { ref: "Loi du 26 mars 2018 (Deal Emploi)", desc: "Vacances supplémentaires — débutants et reprise" },
  ],
  etapes: [
    {
      n: 1, phase: 'calcul', titre: "Calcul des droits et jours",
      detail: `═══ NOMBRE DE JOURS (2026) ═══
• Temps plein 5j/sem : 20 jours ouvrables
• Temps plein 6j/sem : 24 jours ouvrables
• Temps partiel : prorata du régime (ex: 4/5e → 16 jours)
• Calculé sur les PRESTATIONS de l'EXERCICE DE VACANCES (année N-1)

═══ EXERCICE vs ANNÉE ═══
• Exercice de vacances = 2025 (base du calcul)
• Année de vacances = 2026 (prise des congés)
→ Les vacances prises en 2026 sont basées sur les prestations de 2025

═══ JOURS ASSIMILÉS (comptent comme prestés) ═══
• Maladie garantie / accident du travail
• Congé de maternité / paternité / naissance
• Crédit-temps avec motif
• Chômage temporaire (force majeure, économique)
• Petits chômages (mariage, naissance, décès)
• Jours fériés

═══ CAS PARTICULIERS ═══
• 1ère année de travail : vacances jeunes (ONEM) ou européennes
• Passage temps plein → partiel en cours d'année : prorata recalculé
• Les vacances NON prises au 31/12 = PERDUES (pas de report légal)
• Vacances collectives : fixées avant le 31/12 de l'année précédente`,
      delai: "Droits acquis au 31/12 de l'exercice", formulaire: null,
      ou: "Service RH / secrétariat social", obligatoire: true, duree_estimee: '30 min'
    },
    {
      n: 2, phase: 'pecule', titre: "Pécule de vacances — Simple et double",
      detail: `═══ EMPLOYÉS — PAYÉ PAR L'EMPLOYEUR ═══

SIMPLE PÉCULE = salaire normal maintenu pendant les vacances

DOUBLE PÉCULE = 92% du salaire brut mensuel
• Payé au moment des vacances principales (généralement mai-juin)
• Inclut : salaire fixe + moyenne des variables (primes, commissions)
• Cotisation spéciale travailleur : 13,07% sur le double pécule

Exemple : employé 3.500€ brut/mois
→ Double pécule brut  : 3.500 × 92% = 3.220 €
→ Retenue ONSS 13,07% : - 420,86 €
→ Net avant PP       : ±2.800 €

═══ OUVRIERS — PAYÉ PAR LA CAISSE DE VACANCES ═══
• L'employeur cotise : 10,27% de la rémunération brute → ONVA ou caisse sectorielle
• La caisse paie directement au travailleur :
  - Simple pécule  : 6,8% de la rémunération brute N-1
  - Double pécule  : 7,6% de la rémunération brute N-1
  - Total          : 14,4% versé au travailleur en mai-juin

Exemple : ouvrier 35.000€ brut/an
→ Pécule total : 35.000 × 14,4% = 5.040€ brut

═══ PÉCULE DE SORTIE (départ en cours d'année) ═══
• Employé : prorata mois prestés/12 × double pécule
• Cotisation spéciale 13,07%
• Le nouvel employeur DÉDUIT le pécule de sortie déjà reçu
• Ouvrier : la caisse paie le solde`,
      delai: "Double pécule : mai-juin (ou lors des vacances principales)",
      formulaire: null, ou: "Secrétariat social", obligatoire: true, duree_estimee: '1h'
    },
    {
      n: 3, phase: 'planification', titre: "Planification et vacances collectives",
      detail: `═══ VACANCES COLLECTIVES ═══
• Fixées par le Conseil d'Entreprise (CE) ou le règlement de travail
• Affichage OBLIGATOIRE avant le 31 décembre de l'année précédente
• Le travailleur DOIT les prendre (pas de choix individuel)
• Pratique courante :
  - 2-3 semaines en juillet-août
  - 1 semaine entre Noël et Nouvel An
  - 1 semaine à Pâques (selon secteur)

═══ VACANCES INDIVIDUELLES ═══
• Accord avec l'employeur requis
• L'employeur peut refuser pour raison de service (sous conditions)
• En cas de conflit : priorité aux travailleurs avec enfants scolarisés
• Les congés doivent être notifiés avec un délai raisonnable (≥ 2 semaines)

═══ MALADIE PENDANT LES VACANCES ═══
• Si maladie PENDANT les vacances : le travailleur peut suspendre ses congés
  ET reporter les jours de maladie (règle depuis 2023)
• Condition : notification immédiate à l'employeur + certificat médical
• Les jours de maladie ne "consomment" plus les vacances`,
      delai: "Planification annuelle avant le 31/12", formulaire: null,
      ou: "Service RH / CE", obligatoire: true, duree_estimee: '1h'
    },
    {
      n: 4, phase: 'debutants', titre: "Vacances jeunes, européennes et supplémentaires",
      detail: `═══ VACANCES JEUNES (< 25 ans) ═══
• Pour les travailleurs qui n'ont pas presté une année complète en N-1
• L'ONEM complète les jours manquants à 65% du salaire plafonné
• Permet d'avoir 20 jours dès la 1ère année de travail
• Condition : avoir terminé les études ou l'apprentissage l'année précédente

═══ VACANCES EUROPÉENNES ═══
• Pour tout travailleur n'ayant pas de droits complets (pas seulement les jeunes)
• Reprise après interruption de carrière, déménagement depuis l'étranger, etc.
• Avance sur les droits futurs : le travailleur "rembourse" via retenue les années suivantes

═══ VACANCES SUPPLÉMENTAIRES (Deal pour l'Emploi 2024) ═══
• Travailleurs qui commencent ou REPRENNENT une activité salariée
• Droit à des jours supplémentaires pour atteindre 20 jours/an
• Financement : retenue sur le double pécule des années suivantes
• Vise à éviter la "pénalité" de la 1ère année pour les travailleurs qui reprennent l'emploi`,
      delai: "Demande à introduire en début d'emploi", formulaire: "Formulaire ONEM — Vacances jeunes",
      ou: "ONEM + secrétariat social", obligatoire: false, duree_estimee: '1h'
    },
  ],
  alertes: [
    { niveau: 'critique', texte: "Les vacances DOIVENT être prises dans l'année civile. Pas de report possible au 31/12. Jours non pris = PERDUS définitivement." },
    { niveau: 'critique', texte: "Maladie pendant les vacances (depuis 2023) : le travailleur peut SUSPENDRE ses congés et les reporter. Obligation de notification immédiate." },
    { niveau: 'important', texte: "Employés : double pécule = 92% du brut mensuel, payé par l'employeur. Ouvriers : caisse de vacances (ONVA) — l'employeur cotise 10,27%." },
    { niveau: 'attention', texte: "Vacances collectives : doivent être affichées avant le 31 décembre. À défaut, le travailleur peut choisir librement ses dates." },
  ],
  simulation: {
    titre: "Coût pécule double — Exemples 2026",
    lignes: [
      { label: 'Employé 2.500€/mois → Double pécule', montant: '2.300 € brut', type: 'neutre' },
      { label: 'Employé 3.500€/mois → Double pécule', montant: '3.220 € brut', type: 'neutre' },
      { label: 'Employé 5.000€/mois → Double pécule', montant: '4.600 € brut', type: 'neutre' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'Ouvrier 35.000€/an → Pécule total (caisse)', montant: '5.040 € brut', type: 'neutre' },
      { label: 'Cotisation employeur caisse (10,27%)', montant: '3.594 €/an', type: 'neutre' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'Retenue ONSS 13,07% sur double pécule', montant: 'Charge travailleur', type: 'vert_bold' },
    ]
  },
  faq: [
    { q: "Les vacances peuvent-elles être reportées à l'année suivante ?", r: "Non. Les vacances annuelles doivent impérativement être prises dans l'année civile. Les jours non pris au 31 décembre sont perdus. Il n'existe pas de report légal (sauf accord plus favorable dans la CCT)." },
    { q: "Que se passe-t-il si l'employeur ne permet pas de prendre les vacances ?", r: "L'employeur est responsable de permettre la prise des vacances. S'il empêche le travailleur de prendre ses congés, il doit payer une indemnité compensatoire. Il risque aussi des sanctions de l'inspection sociale." },
    { q: "Le double pécule est-il imposable ?", r: "Oui. Le double pécule est soumis à l'ONSS (cotisation spéciale 13,07%) et au précompte professionnel. Taux de PP souvent plus élevé car c'est un revenu exceptionnel. À mentionner sur la fiche de paie du mois de paiement." },
    { q: "Quelle est la différence entre vacances jeunes et vacances européennes ?", r: "Les vacances jeunes sont réservées aux moins de 25 ans en début de carrière. Les vacances européennes s'adressent à tout travailleur sans droits complets (reprise après longue absence, arrivée de l'étranger). Dans les deux cas, des jours supplémentaires sont octroyés pour atteindre 20 jours." },
  ],
  formulaires: [
    { nom: "ONVA — Caisse de vacances ouvriers", url: "https://www.onva.be", type: 'en_ligne' },
    { nom: "ONEM — Vacances jeunes (formulaire C103)", url: "https://www.onem.be/fr/documentation/feuille-info/t66", type: 'en_ligne' },
  ]
};

export default function ProcedureVacancesAnnuelles() {
  const P = PROC_VA;
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
export { PROC_VA };
