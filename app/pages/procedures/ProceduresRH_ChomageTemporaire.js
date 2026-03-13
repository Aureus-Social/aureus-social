'use client';
import { useState, useMemo } from 'react';

const PROC_CT = {
  id: 'chomage_temporaire', icon: '⏸️', categorie: 'contrat',
  titre: "Chômage temporaire",
  resume: "Suspension temporaire du contrat pour raisons économiques, force majeure ou intempéries. Allocation ONEM = 65% du salaire plafonné. Notification ONEM obligatoire AVANT la suspension. Employés et ouvriers éligibles depuis 2020. Supplément employeur de ±2-5€/jour obligatoire.",
  baseLegale: [
    { ref: "Art. 26-51 Loi du 3 juillet 1978", desc: "Suspension du contrat de travail" },
    { ref: "Loi du 26 juillet 1996", desc: "Chômage temporaire pour raisons économiques" },
    { ref: "AR du 25 novembre 1991", desc: "Réglementation chômage temporaire — procédure et allocations" },
    { ref: "CCT n°12 et n°12bis", desc: "Garantie de rémunération en cas de chômage temporaire" },
    { ref: "Loi du 23 juillet 2020", desc: "Extension chômage temporaire aux employés (toutes causes)" },
  ],
  etapes: [
    {
      n: 1, phase: 'types', titre: "Types de chômage temporaire",
      detail: `═══ 1. RAISONS ÉCONOMIQUES (ouvriers + employés) ═══
• Causes : baisse de commandes, difficultés financières temporaires, restructuration
• OUVRIERS : max 4 semaines complètes OU 18 demi-jours par trimestre
• EMPLOYÉS : max 16 semaines/an (régime classique)
          OU max 26 semaines/an (régime renforcé si accord secteur)
• Plan de formation OBLIGATOIRE pour les employés
• Notification ONEM : 7 jours calendrier AVANT la mise en chômage

═══ 2. FORCE MAJEURE ═══
• Causes : incendie, inondation, pandémie, panne informatique majeure,
          faillite soudaine d'un fournisseur unique, guerre, etc.
• La cause doit être imprévisible, externe et irrésistible
• Notification ONEM : IMMÉDIATE (jour même ou dès que possible)
• Pas de durée maximale (aussi longtemps que la force majeure persiste)
• Pas de plan de formation exigé

═══ 3. INTEMPÉRIES (ouvriers uniquement) ═══
• Secteurs concernés : construction, agriculture, travaux extérieurs
• Gel, neige, pluie intense empêchant le travail
• Notification ONEM : jour même (avant 10h idéalement)
• L'employeur décide heure par heure en fonction des conditions

═══ 4. CAS PARTICULIERS ═══
• Travail à temps partiel volontaire : autre régime (accord bilatéral)
• Accords de crise (AR spécifique) : régimes dérogatoires temporaires`,
      delai: "Notification avant ou le jour même selon le type", formulaire: "C106A (voie électronique)",
      ou: "Bureau ONEM compétent", obligatoire: true, duree_estimee: '2h'
    },
    {
      n: 2, phase: 'procedure', titre: "Procédure et notification ONEM",
      detail: `═══ ÉTAPES OBLIGATOIRES ═══

ÉTAPE 1 — NOTIFICATION ONEM
• Via le portail www.socialsecurity.be → formulaire C106A électronique
• Indiquer : période prévue, nombre de travailleurs, motif précis
• Pour raisons économiques : 7 jours calendrier AVANT
• Pour force majeure : jour même
• Pour intempéries : avant 10h le matin (idéalement)

ÉTAPE 2 — INFORMATION AUX TRAVAILLEURS
• Affichage obligatoire sur le lieu de travail
• Idéalement : communication individuelle + affichage collectif
• Indiquer : dates, motif, durée prévue

ÉTAPE 3 — DÉLIVRANCE DES CARTES DE CONTRÔLE
• Formulaire C3.2 remis à chaque travailleur AVANT le début du chômage
• Le travailleur remplit la carte au jour le jour (jours chômés)
• La carte est remise à l'organisme de paiement en fin de mois

ÉTAPE 4 — VALIDATION MENSUELLE
• L'employeur transmet les données de présence/absence via DmfA
• Codes spécifiques pour les jours de chômage temporaire
• Pas de salaire payé pour les jours chômés

ÉTAPE 5 — SUIVI POST-PÉRIODE
• Si la situation se prolonge : renouveler la notification ONEM
• Tenir un registre des jours de chômage (contrôle inspection sociale)`,
      delai: "Notification : 7j avant (éco) ou jour même (force majeure/intempéries)",
      formulaire: "C106A + C3.2 cartes de contrôle", ou: "ONEM + organisme de paiement du travailleur", obligatoire: true, duree_estimee: '2-4h'
    },
    {
      n: 3, phase: 'allocations', titre: "Allocations et supplément employeur",
      detail: `═══ ALLOCATION ONEM ═══
• Montant : 65% du salaire journalier PLAFONNÉ
• Plafond 2026 : ±3.200€ brut/mois → plafond journalier ±156€
• Allocation max : 156 × 65% ≈ 101€/jour brut
• L'allocation est versée par l'organisme de paiement du travailleur
  (ONEM via CSC/CGSLB/FGTB ou CAPAC pour non-syndiqués)

═══ SUPPLÉMENT EMPLOYEUR (OBLIGATOIRE) ═══
• Montant minimum légal : 2€/jour chômé
• En pratique : souvent 5-10€/jour selon CCT sectorielle ou d'entreprise
• Payé PAR L'EMPLOYEUR directement au travailleur
• Ce supplément N'EST PAS soumis aux cotisations ONSS normales
  (cotisation spéciale patronale de 13,07% applicable dans certains cas)

EXEMPLE — Ouvrier 2.800€/mois :
  Salaire journalier : 2.800/26 ≈ 107,69€
  Allocation ONEM (65%) : ±70€/jour
  Supplément employeur (min) : +2€/jour
  Total travailleur : ±72€/jour chômé (vs 107,69€ travaillé)

═══ PLAN DE FORMATION (employés, raisons économiques) ═══
• Obligation légale depuis 2013
• Au moins 1 jour de formation pour 2 semaines de chômage
• Formation professionnelle ou reconversion
• À annexer à la notification ONEM`,
      delai: "Supplément payé avec le salaire du mois", formulaire: "Plan de formation (raisons économiques employés)",
      ou: "ONEM + organisme de paiement", obligatoire: true, duree_estimee: '1h'
    },
    {
      n: 4, phase: 'impact', titre: "Impact sur le contrat et sanctions",
      detail: `═══ STATUT DU CONTRAT ═══
• Le contrat est SUSPENDU (pas rompu)
• L'ancienneté continue de courir
• Les droits aux vacances annuelles continuent (jours assimilés)
• L'assurance groupe et hospitalisation maintenues
• Le travailleur peut démissionner sans préavis pendant le chômage temporaire
  → L'employeur NE PEUT PAS refuser la démission

═══ MAINTIEN DES AVANTAGES ═══
• Chèques-repas : en principe pas dus pour les jours chômés (sauf CCT plus favorable)
• Voiture de société : à vérifier selon le contrat/policy
• Assurance groupe : cotisations souvent maintenues (check contrat)

═══ SANCTIONS EN CAS D'ABUS ═══
Pour l'EMPLOYEUR :
• Pas de notification → salaire normal dû pour tous les jours chômés
• Abus de chômage économique → redressement ONSS (cotisations + majorations)
• Faux motif → amende pénale + cotisations + dommages au travailleur

Pour le TRAVAILLEUR :
• Travail au noir pendant le chômage temporaire → récupération des allocations
• Déclaration incorrecte de la carte C3.2 → sanction ONEM

═══ CONTRÔLE INSPECTION SOCIALE ═══
• L'inspection sociale peut vérifier la réalité du motif à tout moment
• Garder tous les documents : commandes, factures, correspondances
• Le registre des jours de chômage doit être disponible immédiatement`,
      delai: "Contrat suspendu — effets immédiats", formulaire: null,
      ou: "Inspection sociale SPF Emploi", obligatoire: true, duree_estimee: '1h'
    },
  ],
  alertes: [
    { niveau: 'critique', texte: "Notification ONEM OBLIGATOIRE AVANT la suspension (7j pour raisons économiques). Sans notification = salaire normal intégralement dû pour tous les jours." },
    { niveau: 'critique', texte: "Employés — raisons économiques : plan de formation obligatoire à annexer à la notification. Sans plan = notification invalide." },
    { niveau: 'important', texte: "Supplément employeur minimum 2€/jour chômé (légal). Vérifier la CCT sectorielle : souvent plus élevé (5-10€/jour)." },
    { niveau: 'important', texte: "Le travailleur peut démissionner SANS PRÉAVIS pendant le chômage temporaire. L'employeur ne peut pas s'y opposer." },
    { niveau: 'attention', texte: "Chèques-repas : en principe pas dus pour les jours chômés. Vérifier la CCT et le contrat. Erreur fréquente = paiement indu." },
  ],
  simulation: {
    titre: "Impact financier — Chômage temporaire 1 semaine",
    lignes: [
      { label: 'Salaire ouvrier 2.800€/mois (5 jours chômés)', montant: '', type: 'neutre' },
      { label: '→ Coût salaire économisé (5 × 107,69€)', montant: '538,46 €', type: 'neutre' },
      { label: '→ Supplément employeur à payer (5 × 2€ min)', montant: '- 10 €', type: 'neutre' },
      { label: '→ Économie nette employeur', montant: '≈ 528 €', type: 'vert_bold' },
      { label: '', montant: '', type: 'separateur' },
      { label: 'Travailleur reçoit (allocation 65% + supplément)', montant: '±360 € net', type: 'neutre' },
      { label: 'Perte travailleur vs salaire normal', montant: '±178 €/semaine', type: 'neutre' },
    ]
  },
  faq: [
    { q: "Peut-on mettre en chômage temporaire un travailleur en maladie ?", r: "Non. Un travailleur en incapacité de travail ne peut pas être mis en chômage temporaire simultanément. La maladie prime. Si le chômage temporaire est déclaré avant la maladie, la maladie suspend le chômage." },
    { q: "Combien de temps peut durer le chômage temporaire pour raisons économiques ?", r: "Pour les ouvriers : max 4 semaines complètes ou 18 demi-jours par trimestre. Pour les employés : max 16 semaines/an (classique) ou 26 semaines/an (renforcé si accord sectoriel). Au-delà, l'employeur doit soit reprendre le travail, soit entamer une procédure de licenciement." },
    { q: "Le chômage temporaire peut-il précéder un licenciement collectif ?", r: "Oui, c'est souvent utilisé comme mesure préalable. Mais l'inspection sociale surveille les abus : utiliser le chômage temporaire uniquement pour retarder un licenciement collectif (et éviter la procédure Renault) peut être requalifié." },
    { q: "Que se passe-t-il si l'employeur ne paie pas le supplément ?", r: "Le travailleur peut exiger le supplément devant le tribunal du travail. L'inspection sociale peut aussi constater l'infraction. Des arriérés avec intérêts sont dus. Si la CCT prévoit un supplément plus élevé, c'est ce montant qui s'applique." },
  ],
  formulaires: [
    { nom: "ONEM — C106A (notification chômage temporaire)", url: "https://www.onem.be/fr/documentation/feuille-info/t131", type: 'en_ligne' },
    { nom: "Portail sécurité sociale — Déclaration employeur", url: "https://www.socialsecurity.be", type: 'en_ligne' },
    { nom: "SPF Emploi — Procédure intempéries", url: "https://emploi.belgique.be/fr/chomage-temporaire", type: 'en_ligne' },
  ]
};

export default function ProcedureChomageTemporaire() {
  const P = PROC_CT;
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
    { id: 'simulation', l: 'Impact financier', i: '🧮' },
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
export { PROC_CT };
