'use client';
import { useState, useMemo } from 'react';

const PROC_PV = {
  id: 'pecule_vacances', icon: '💶', categorie: 'conges',
  titre: "Pécule de vacances — Calcul détaillé",
  resume: "Simple pécule = salaire maintenu. Double pécule employés = 92% brut mensuel (payé par l'employeur). Ouvriers = caisse de vacances ONVA (cotisation employeur 10,27%). Pécule de sortie = prorata avec retenue 13,07%. Vacances jeunes et européennes pour les débutants.",
  baseLegale: [
    { ref: "Loi du 4 janvier 1974", desc: "Calcul et paiement du pécule de vacances" },
    { ref: "AR du 30 mars 1967", desc: "Modalités pécule — ouvriers et employés" },
    { ref: "Art. 46 Loi vacances", desc: "Cotisation spéciale 13,07% sur double pécule" },
    { ref: "CCT n°43bis", desc: "Pécule de vacances complémentaire secteurs" },
  ],
  etapes: [
    {
      n: 1, phase: 'employes', titre: "Calcul pour les EMPLOYÉS",
      detail: `═══ SIMPLE PÉCULE — EMPLOYÉS ═══
= Salaire normal maintenu pendant les jours de vacances
• Pas de calcul particulier : l'employeur paie le salaire habituel
• Inclut tous les éléments du salaire : fixe, primes contractuelles, avantages

═══ DOUBLE PÉCULE — EMPLOYÉS ═══
Formule : salaire brut mensuel × 92%

BASE DE CALCUL :
• Dernier salaire brut mensuel
• + Moyenne des éléments variables (commissions, primes, sur les 12 derniers mois)
• Commissions variables → moyenne mensuelle des 12 derniers mois
• Voiture de société → pas incluse dans la base

EXEMPLES :
  Salaire 2.500 €/mois → Double pécule brut = 2.300 €
  Salaire 3.500 €/mois → Double pécule brut = 3.220 €
  Salaire 5.000 €/mois → Double pécule brut = 4.600 €

CHARGES :
• Cotisation spéciale ONSS travailleur : 13,07% sur le double pécule brut
• Précompte professionnel : taux spécial (souvent plus élevé — revenu exceptionnel)
• Pas de cotisation patronale ONSS sur le double pécule

MOMENT DU PAIEMENT :
• Lors des vacances principales (généralement mai-juin)
• OU fractionné si vacances prises en plusieurs fois
• Doit apparaître sur la fiche de paie du mois concerné`,
      delai: "Mai-juin ou au moment des vacances principales", formulaire: null,
      ou: "Secrétariat social / service paie", obligatoire: true, duree_estimee: '30 min'
    },
    {
      n: 2, phase: 'ouvriers', titre: "Calcul pour les OUVRIERS — Caisse de vacances",
      detail: `═══ FONCTIONNEMENT — OUVRIERS ═══

L'employeur NE PAIE PAS directement le pécule aux ouvriers.
→ L'employeur cotise à la CAISSE DE VACANCES
→ La caisse paie directement le travailleur

═══ COTISATION EMPLOYEUR ═══
• Taux : 10,27% de la rémunération brute trimestrielle
• Déclarée et versée via DmfA chaque trimestre
• Destinataire : ONVA ou caisse sectorielle (ex: CAPAC Construction)

Exemple : ouvrier avec 8.750€ brut/trimestre
→ Cotisation caisse : 8.750 × 10,27% = 898,63€/trimestre

═══ PÉCULE VERSÉ PAR LA CAISSE ═══
Base = rémunération brute de l'EXERCICE de vacances (N-1)

• Simple pécule  : 6,8% de la rémunération brute N-1
• Double pécule  : 7,6% de la rémunération brute N-1
• Total          : 14,4% versé au travailleur

Exemple : ouvrier 35.000€ brut en 2025 (exercice)
→ Pécule total 2026 : 35.000 × 14,4% = 5.040€ brut
→ Payé par la caisse directement au travailleur

═══ CAISSES DE VACANCES ═══
• ONVA (Office National des Vacances Annuelles) : secteur général
• ONSS-APL : secteur public local
• Caisses sectorielles : construction (FONDS VACANCES CONSTRUCTION), etc.`,
      delai: "Cotisation : DmfA trimestrielle. Pécule : versé par la caisse en mai-juin.",
      formulaire: "DmfA — ligne cotisation caisse de vacances", ou: "ONVA / caisse sectorielle", obligatoire: true, duree_estimee: '1h'
    },
    {
      n: 3, phase: 'sortie', titre: "Pécule de sortie — Départ en cours d'année",
      detail: `═══ PÉCULE DE SORTIE — EMPLOYÉS ═══

Lors de la rupture du contrat (démission, licenciement, fin CDD) :
L'employeur DOIT payer le pécule de vacances prorata

CALCUL :
• Mois prestés dans l'année de vacances (N) / 12 × double pécule annuel
• + Reliquat de l'année précédente si non encore payé

Exemple : départ en avril (4 mois prestés en 2026)
  Salaire 3.000€ → Double pécule = 3.000 × 92% = 2.760€
  → Pécule de sortie = 2.760 × 4/12 = 920€ brut
  → Retenue ONSS 13,07% = 120,24€
  → Net versé à la sortie : ±800€

ATTENTION — CHEZ LE NOUVEL EMPLOYEUR :
• Le nouveau bénéficie de l'info via la fiche de paie de sortie
• Il DÉDUIT le pécule de sortie déjà reçu lors du versement de son propre double pécule
• Éviter le double paiement : la déduction est obligatoire

═══ PÉCULE DE SORTIE — OUVRIERS ═══
• La caisse de vacances gère le prorata
• L'ouvrier reçoit son pécule de la caisse en proportion des trimestres prestés
• L'employeur n'intervient pas directement

═══ COTISATION SPÉCIALE À LA SORTIE ═══
• 13,07% sur le double pécule de sortie (charge travailleur)
• + Précompte professionnel (taux spécial)
• À mentionner sur la fiche de paie de sortie ET le C4`,
      delai: "Payé avec le dernier salaire ou dans les jours suivant la sortie",
      formulaire: "Fiche de paie sortie + C4 (montant pécule de sortie)", ou: "Secrétariat social", obligatoire: true, duree_estimee: '1h'
    },
    {
      n: 4, phase: 'cas_speciaux', titre: "Cas spéciaux — Jeunes, européen, Deal Emploi",
      detail: `═══ VACANCES JEUNES (travailleurs < 25 ans) ═══
Objectif : garantir 20 jours dès la 1ère année de travail

• Qui : moins de 25 ans, fin d'études/apprentissage en N-1
• Comment : l'ONEM complète les jours manquants
• Allocation : 65% du salaire journalier PLAFONNÉ (plafond 2026 : ±160€/jour)
• Formulaire C103 à introduire à l'ONEM
• L'employeur délivre un C4 pour les jours ONEM

═══ VACANCES EUROPÉENNES ═══
• Pour tout travailleur sans droits complets (pas que les jeunes)
• Reprise après congé parental, retour de l'étranger, interruption longue
• Mécanisme : avance sur droits futurs — le travailleur prend ses jours
• Régularisation : retenue sur le double pécule des années suivantes
• Aucune démarche spéciale côté employeur

═══ VACANCES SUPPLÉMENTAIRES (Deal Emploi 2024) ═══
• Travailleurs qui REPRENNENT une activité après longue interruption
• Droit à des jours supplémentaires pour atteindre 20 jours/an
• Financement : retenue étalée sur 3 ans sur les doubles pécules futurs
• Vise à supprimer la "pénalité" de la première année de reprise

═══ CUMUL INTERDITS ═══
• Vacances jeunes ET vacances européennes ne peuvent pas se cumuler pour les mêmes jours
• Le travailleur choisit le régime le plus favorable`,
      delai: "Demande à l'ONEM en début d'année de vacances", formulaire: "C103 — Vacances jeunes (ONEM)",
      ou: "ONEM + secrétariat social", obligatoire: false, duree_estimee: '1h'
    },
  ],
  alertes: [
    { niveau: 'critique', texte: "Pécule de sortie obligatoire lors de tout départ. Le nouvel employeur DÉDUIT le montant reçu. Double paiement = erreur de paie fréquente et coûteuse." },
    { niveau: 'critique', texte: "Ouvriers : l'employeur NE paie PAS le pécule directement. Il cotise à la caisse (10,27% DmfA). Payer directement = doublon + irrégularité." },
    { niveau: 'important', texte: "Employés : double pécule = 92% du brut mensuel. Prévoir la provision en comptabilité ! Charge ±1 mois de salaire supplémentaire en mai-juin." },
    { niveau: 'attention', texte: "Cotisation spéciale 13,07% sur le double pécule : charge du TRAVAILLEUR, pas de l'employeur. À retenir sur la fiche de paie, pas à payer en plus." },
  ],
  simulation: {
    titre: "Simulation pécule 2026 — Employés",
    lignes: [
      { label: 'Salaire 2.000€/mois → Double pécule brut', montant: '1.840 €', type: 'neutre' },
      { label: 'Salaire 3.000€/mois → Double pécule brut', montant: '2.760 €', type: 'neutre' },
      { label: 'Salaire 4.000€/mois → Double pécule brut', montant: '3.680 €', type: 'neutre' },
      { label: 'Salaire 5.000€/mois → Double pécule brut', montant: '4.600 €', type: 'neutre' },
      { label: '', montant: '', type: 'separateur' },
      { label: '- Retenue ONSS 13,07% (sur salaire 3.000€)', montant: '- 360,73 €', type: 'neutre' },
      { label: '= Net avant PP (salaire 3.000€)', montant: '≈ 2.399 €', type: 'vert_bold' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'Ouvrier 35.000€/an → Pécule caisse total', montant: '5.040 € brut', type: 'neutre' },
    ]
  },
  faq: [
    { q: "L'employeur doit-il provisionner le double pécule ?", r: "Oui, en bonne gestion comptable, l'employeur doit constituer une provision mensuelle pour le double pécule (1/12e de 92% du salaire mensuel chaque mois). Cette provision est déductible fiscalement. Son absence peut fausser les comptes annuels." },
    { q: "Que se passe-t-il si l'employeur ne paie pas le double pécule à temps ?", r: "Le travailleur peut saisir le tribunal du travail. L'inspecteur social peut aussi constater l'infraction. Des intérêts de retard sont dus. L'employeur risque une amende de niveau 2 (CODEX bien-être)." },
    { q: "Le pécule de sortie est-il dû en cas de rupture pour motif grave ?", r: "Oui. Même en cas de licenciement pour motif grave, l'employeur doit payer le pécule de vacances acquis (simple et double prorata). Le motif grave n'exonère pas du pécule de vacances." },
    { q: "Comment calculer le double pécule pour un temps partiel ?", r: "Le calcul est identique mais sur le salaire prorata. Ex: mi-temps avec 1.500€ brut → double pécule = 1.500 × 92% = 1.380€ brut. Le nombre de jours de vacances est aussi réduit au prorata." },
  ],
  formulaires: [
    { nom: "ONVA — Office National des Vacances Annuelles", url: "https://www.onva.be", type: 'en_ligne' },
    { nom: "DmfA — Portail sécurité sociale", url: "https://www.socialsecurity.be", type: 'en_ligne' },
    { nom: "ONEM — Vacances jeunes (C103)", url: "https://www.onem.be/fr/documentation/feuille-info/t66", type: 'en_ligne' },
  ]
};

export default function ProcedurePeculeVacances() {
  const P = PROC_PV;
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
    { id: 'simulation', l: 'Simulation', i: '🧮' },
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
export { PROC_PV };
