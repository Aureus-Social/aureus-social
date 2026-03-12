'use client';
import { useState } from 'react';
import { useLang } from '../lib/lang-context';

const C = ({ children, style }) => (
  <div style={{ background: 'rgba(198,163,78,.03)', borderRadius: 12, padding: '16px 20px', border: '1px solid rgba(198,163,78,.08)', marginBottom: 14, ...style }}>
    {children}
  </div>
);
const ST = ({ children, color }) => (
  <div style={{ fontSize: 13, fontWeight: 700, color: color || '#c6a34e', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(198,163,78,.1)' }}>
    {children}
  </div>
);
const Badge = ({ text, color }) => (
  <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 600, background: (color || '#888') + '20', color: color || '#888' }}>{text}</span>
);
const Row = ({ l, v, sub }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.03)', alignItems: sub ? 'flex-start' : 'center' }}>
    <span style={{ fontSize: 11.5, color: '#c8c5bc' }}>{l}</span>
    <span style={{ fontSize: 11.5, color: '#c6a34e', fontWeight: 600, textAlign: 'right', maxWidth: '55%' }}>{v}</span>
  </div>
);

// ─── CHECKLIST REPRISE ─────────────────────────────────────────
const CHECKLIST_SECTIONS = [
  {
    titre: '📋 Documents à collecter',
    color: '#3b82f6',
    items: [
      { l: 'Contrat actuel secrétariat social (SD Worx / Partena / Securex)', done: false },
      { l: 'Préavis de résiliation — délai contractuel (Art. 40 loi 27/06/1969)', done: false },
      { l: 'Liste des travailleurs avec NISS, CP, type contrat', done: false },
      { l: 'Historique DMFA des 4 derniers trimestres', done: false },
      { l: 'Fiches de paie des 12 derniers mois', done: false },
      { l: 'Mandat ONSS actuel (Mahis ou autre)', done: false },
      { l: 'Mandat Belcotax (fisc)', done: false },
      { l: 'Numéro d\'employeur ONSS', done: false },
      { l: 'Coordonnées bancaires (SEPA domiciliation)', done: false },
    ]
  },
  {
    titre: '⚙️ Actions techniques (Aureus)',
    color: '#c6a34e',
    items: [
      { l: 'Créer le compte client dans Aureus Social Pro', done: false },
      { l: 'Encoder tous les travailleurs avec données complètes', done: false },
      { l: 'Importer l\'historique paie via Import CSV', done: false },
      { l: 'Configurer la commission paritaire (CP) de chaque travailleur', done: false },
      { l: 'Paramétrer avantages extralégaux (chèques-repas, télétravail, etc.)', done: false },
      { l: 'Soumettre Dimona IN pour chaque travailleur actif', done: false },
      { l: 'Activer mandat ONSS/Mahis (délai 24-48h)', done: false },
      { l: 'Activer mandat Belcotax', done: false },
      { l: 'Paramétrer SEPA domiciliation', done: false },
      { l: 'Tester 1ère fiche de paie et valider avec le client', done: false },
    ]
  },
  {
    titre: '📅 Timing & délais légaux',
    color: '#22c55e',
    items: [
      { l: 'Préavis résiliation — vérifier délai contractuel (souvent 3 mois)', done: false },
      { l: 'Art. 1231 C.civ. — réduction judiciaire max 3 mois si clause abusive', done: false },
      { l: 'Envoi recommandé AR au secrétariat sortant', done: false },
      { l: 'Confirmation reprise 1er du mois (ne pas commencer en milieu de mois)', done: false },
      { l: 'Deadline Dimona IN : avant 1er jour de travail', done: false },
      { l: 'Deadline DMFA : fin du mois suivant le trimestre', done: false },
    ]
  },
  {
    titre: '✅ Validation finale',
    color: '#a78bfa',
    items: [
      { l: 'Client a bien reçu ses accès Aureus Social Pro', done: false },
      { l: '1ère fiche de paie validée et approuvée par le client', done: false },
      { l: 'Virement SEPA testé et confirmé', done: false },
      { l: 'Mandat ONSS actif — visible dans Mahis', done: false },
      { l: 'Contrat SaaS Aureus signé (CGV)', done: false },
      { l: 'Facturation mensuelle configurée', done: false },
    ]
  },
];

function ChecklistReprise() {
  const [checked, setChecked] = useState({});
  const total = CHECKLIST_SECTIONS.flatMap(s => s.items).length;
  const done = Object.values(checked).filter(Boolean).length;
  const pct = Math.round(done / total * 100);

  const toggle = (key) => setChecked(p => ({ ...p, [key]: !p[key] }));

  return (
    <div>
      {/* Barre de progression */}
      <C style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#c6a34e' }}>Progression reprise client</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: pct === 100 ? '#22c55e' : '#c6a34e' }}>{done}/{total} — {pct}%</span>
        </div>
        <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,.06)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: pct + '%', height: '100%', background: pct === 100 ? '#22c55e' : '#c6a34e', borderRadius: 4, transition: 'width .3s' }} />
        </div>
        {pct === 100 && <div style={{ marginTop: 8, fontSize: 12, color: '#22c55e', fontWeight: 600 }}>✅ Reprise complète — client opérationnel</div>}
      </C>

      {CHECKLIST_SECTIONS.map((section, si) => (
        <C key={si}>
          <ST color={section.color}>{section.titre}</ST>
          {section.items.map((item, ii) => {
            const key = `${si}-${ii}`;
            const isDone = checked[key];
            return (
              <div key={key} onClick={() => toggle(key)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,.03)', opacity: isDone ? 0.5 : 1 }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${isDone ? '#22c55e' : 'rgba(255,255,255,.15)'}`, background: isDone ? '#22c55e20' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isDone && <span style={{ fontSize: 11, color: '#22c55e' }}>✓</span>}
                </div>
                <span style={{ fontSize: 11.5, color: isDone ? '#5e5c56' : '#c8c5bc', textDecoration: isDone ? 'line-through' : 'none' }}>{item.l}</span>
              </div>
            );
          })}
        </C>
      ))}
    </div>
  );
}

// ─── COMPARATIF MARCHÉ ─────────────────────────────────────────
function ComparatifMarche() {
  const concurrents = [
    {
      nom: 'SD Worx', logo: '🔵', color: '#3b82f6',
      prix_base: '25–45€', prix_emp: '8–15€/emp', engagement: '3–6 mois', preavis: '3 mois',
      points_forts: ['Réseau international', 'Outil RH complet', 'Réputation établie'],
      points_faibles: ['Prix élevé', 'Service client lent', 'Pas de IA', 'Interface vieillissante'],
      score: 3,
    },
    {
      nom: 'Partena', logo: '🟠', color: '#f97316',
      prix_base: '20–40€', prix_emp: '7–13€/emp', engagement: '3 mois', preavis: '3 mois',
      points_forts: ['Présence belge forte', 'Service bilingue', 'Formation continue'],
      points_faibles: ['Moins innovant', 'Support parfois lent', 'Prix peu transparents'],
      score: 3,
    },
    {
      nom: 'Securex', logo: '🟢', color: '#22c55e',
      prix_base: '22–42€', prix_emp: '8–14€/emp', engagement: '3 mois', preavis: '3 mois',
      points_forts: ['Bon service médical', 'Intégration prévention', 'Couvre toute la Belgique'],
      points_faibles: ['Pas spécialisé paie', 'IA absente', 'Contrats complexes'],
      score: 3,
    },
    {
      nom: 'Aureus Social Pro', logo: '⭐', color: '#c6a34e',
      prix_base: '15–30€', prix_emp: '5–10€/emp', engagement: '1 mois', preavis: '1 mois',
      points_forts: ['IA intégrée', 'Tarif transparent', 'Interface moderne', 'RGPD Frankfurt', 'Support direct', 'Engagement flexible'],
      points_faibles: ['Nouveau sur le marché', 'Réseau en construction'],
      score: 5,
    },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {concurrents.map((c) => (
          <C key={c.nom} style={{ borderColor: c.nom === 'Aureus Social Pro' ? 'rgba(198,163,78,.3)' : 'rgba(198,163,78,.08)', background: c.nom === 'Aureus Social Pro' ? 'rgba(198,163,78,.05)' : 'rgba(198,163,78,.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{c.logo}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.color }}>{c.nom}</div>
                <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
                  {Array(5).fill(0).map((_, i) => <span key={i} style={{ fontSize: 12, color: i < c.score ? '#c6a34e' : '#3f3d38' }}>★</span>)}
                </div>
              </div>
            </div>
            <Row l="Tarif de base" v={c.prix_base + '/mois'} />
            <Row l="Par employé" v={c.prix_emp} />
            <Row l="Engagement min." v={c.engagement} />
            <Row l="Préavis résiliation" v={c.preavis} />
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>POINTS FORTS</div>
              {c.points_forts.map((p, i) => <div key={i} style={{ fontSize: 11, color: '#c8c5bc', padding: '2px 0', paddingLeft: 10, borderLeft: '2px solid rgba(34,197,94,.2)' }}>+ {p}</div>)}
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>POINTS FAIBLES</div>
              {c.points_faibles.map((p, i) => <div key={i} style={{ fontSize: 11, color: '#888', padding: '2px 0', paddingLeft: 10, borderLeft: '2px solid rgba(239,68,68,.2)' }}>− {p}</div>)}
            </div>
          </C>
        ))}
      </div>

      <C style={{ marginTop: 4 }}>
        <ST>💬 Arguments clés face à la concurrence</ST>
        {[
          ['VS SD Worx', 'Même couverture légale belge, 40% moins cher, engagement mensuel, IA native pour détecter les aides emploi automatiquement.'],
          ['VS Partena', 'Interface moderne vs interface des années 2010. Support direct vs call center. 57 primes intégrées avec calcul automatique.'],
          ['VS Securex', 'Spécialisé paie là où Securex est généraliste. Dimona en temps réel. Export CODA/Winbooks/BOB natif.'],
          ['Argument prix', 'Pour 10 employés : SD Worx = ~200€/mois, Aureus = ~115€/mois. Économie 85€/mois = 1.020€/an.'],
        ].map(([titre, texte], i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#c6a34e', marginBottom: 4 }}>{titre}</div>
            <div style={{ fontSize: 11.5, color: '#c8c5bc', lineHeight: 1.6 }}>{texte}</div>
          </div>
        ))}
      </C>
    </div>
  );
}

// ─── GUIDE COMMERCIAL ──────────────────────────────────────────
function GuideCommercial() {
  const [openSection, setOpenSection] = useState(0);

  const sections = [
    {
      titre: '📞 Script appel découverte (5 min)',
      color: '#3b82f6',
      contenu: [
        { label: 'Accroche', texte: '"Bonjour [Prénom], je suis [Nom] d\'Aureus Social Pro — on aide les PME belges à économiser en moyenne 40% sur leurs frais de secrétariat social. Est-ce que vous avez 5 minutes ?"' },
        { label: 'Question clé', texte: '"Avec quel secrétariat social vous travaillez actuellement ? Et si je vous dis qu\'on peut faire la même chose pour moins cher avec un outil moderne, ça vous intéresse ?"' },
        { label: 'Objection prix', texte: '"Je comprends que vous avez un budget. Justement, notre modèle est au mois, sans engagement, et on vous offre le 1er mois gratuit pour tester."' },
        { label: 'Clôture', texte: '"Je vous propose une démo de 20 minutes cette semaine — mardi ou jeudi, ce qui vous convient ?"' },
      ]
    },
    {
      titre: '📧 Email de prospection',
      color: '#a78bfa',
      contenu: [
        { label: 'Objet', texte: 'Réduire vos frais de secrétariat social de 40% — sans changer votre comptable' },
        { label: 'Corps', texte: 'Bonjour [Prénom],\n\nVotre entreprise gère actuellement la paie via [concurrent]. Nous aidons des sociétés similaires à économiser en moyenne 1.200€/an avec Aureus Social Pro.\n\nNotre différence : IA native, Dimona temps réel, interface moderne, et un engagement mensuel (pas de préavis de 3 mois).\n\nUne démo de 20 minutes cette semaine ?\n\nCordialement,\n[Prénom] — Aureus Social Pro\napp.aureussocial.be' },
      ]
    },
    {
      titre: '🤝 Traitement des objections',
      color: '#22c55e',
      contenu: [
        { label: '"On est satisfait de SD Worx"', texte: '"C\'est bien ! La question c\'est : combien vous payez par mois ? Je peux vous faire une comparaison gratuite — si on n\'est pas moins cher, je vous dis bonjour."' },
        { label: '"On n\'a pas le temps de changer"', texte: '"C\'est exactement pour ça qu\'on existe — la reprise prend 2h côté client. On s\'occupe de tout : transfert des données, Dimona, mandat ONSS."' },
        { label: '"Vous êtes nouveaux"', texte: '"Nouveau outil, oui. Fondateur expert en droit social belge, 10 ans d\'expérience. Et toutes les lois 2026 sont déjà intégrées — ce que certains vieux logiciels n\'ont pas encore fait."' },
        { label: '"On a un contrat jusqu\'en juin"', texte: '"Parfait, on commence à préparer votre migration maintenant pour être opérationnel le 1er juillet. Je vous montre comment résilier en 1 recommandé."' },
      ]
    },
    {
      titre: '💰 Proposition tarifaire type',
      color: '#c6a34e',
      contenu: [
        { label: 'Structure', texte: 'Forfait mensuel fixe + par employé actif. Pas de frais cachés, pas de setup, pas de préavis.' },
        { label: '1–5 employés', texte: '15€/mois + 8€/employé actif' },
        { label: '6–20 employés', texte: '25€/mois + 6€/employé actif' },
        { label: '21–50 employés', texte: '40€/mois + 5€/employé actif' },
        { label: 'Offre lancement', texte: '1er mois offert + reprise des données gratuite (valeur 200€)' },
      ]
    },
    {
      titre: '📋 Qualification prospect (BANT)',
      color: '#f97316',
      contenu: [
        { label: 'Budget', texte: 'Combien payez-vous par mois actuellement ? (si > 100€ → bon prospect)' },
        { label: 'Autorité', texte: 'C\'est vous qui décidez du changement de secrétariat social ? (gérant, DRH, comptable ?)' },
        { label: 'Besoin', texte: 'Qu\'est-ce qui vous dérange avec votre secrétariat actuel ? (prix, lenteur, erreurs, interface ?)' },
        { label: 'Timing', texte: 'Votre contrat actuel se termine quand ? (ou : vous avez un préavis à envoyer avant quand ?)' },
      ]
    },
  ];

  return (
    <div>
      <C style={{ marginBottom: 16, background: 'rgba(198,163,78,.05)', borderColor: 'rgba(198,163,78,.2)' }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[['🎯 Cible', 'PME 1–50 emp. Belgique'], ['💰 Ticket moyen', '120–400€/mois'], ['⏱ Cycle vente', '1–3 semaines'], ['📈 Avantage clé', '40% moins cher']].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: '#5e5c56', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#c6a34e' }}>{val}</div>
            </div>
          ))}
        </div>
      </C>

      {sections.map((section, i) => (
        <C key={i} style={{ marginBottom: 10 }}>
          <div onClick={() => setOpenSection(openSection === i ? -1 : i)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <ST color={section.color} style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>{section.titre}</ST>
            <span style={{ color: '#5e5c56', transform: openSection === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
          </div>
          {openSection === i && (
            <div style={{ marginTop: 12 }}>
              {section.contenu.map((item, j) => (
                <div key={j} style={{ padding: '10px 14px', background: 'rgba(255,255,255,.02)', borderRadius: 8, marginBottom: 8, borderLeft: `3px solid ${section.color}40` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: section.color, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px' }}>{item.label}</div>
                  <div style={{ fontSize: 11.5, color: '#c8c5bc', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{item.texte}</div>
                </div>
              ))}
            </div>
          )}
        </C>
      ))}
    </div>
  );
}

// ─── EXPORT PRINCIPAL ──────────────────────────────────────────
export default function CommercialHub({ s, d, tab }) {
  const { tText } = useLang();

  const TABS = [
    { id: 'checklistclient', label: '✅ Checklist Reprise',  component: <ChecklistReprise /> },
    { id: 'comparatif',      label: '⚔️ Comparatif Marché', component: <ComparatifMarche /> },
    { id: 'guidecommercial', label: '📖 Guide Commercial',  component: <GuideCommercial /> },
  ];

  const defaultTab = TABS.find(t => t.id === tab)?.id || 'checklistclient';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const current = TABS.find(t => t.id === activeTab);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#c6a34e', margin: '0 0 4px' }}>🎯 Commercial</h2>
        <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Outils de vente, reprise client et analyse concurrentielle</p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: activeTab === t.id ? 700 : 400, fontFamily: 'inherit', background: activeTab === t.id ? 'rgba(198,163,78,.15)' : 'rgba(255,255,255,.03)', color: activeTab === t.id ? '#c6a34e' : '#9e9b93', transition: 'all .15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {current?.component}
    </div>
  );
}
