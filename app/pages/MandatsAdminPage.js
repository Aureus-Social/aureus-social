'use client';
import { useState, useEffect } from 'react';
import { RMMMG } from '../lib/lois-belges';

const RMMMG_H  = (RMMMG / (52 * 38 / 12)).toFixed(2);
const RMMMG_AN = (RMMMG * 12).toLocaleString('fr-BE', { minimumFractionDigits: 2 });
const RMMMG_M  = RMMMG.toLocaleString('fr-BE', { minimumFractionDigits: 2 });
const RMMMG_MOINS18 = (RMMMG * 0.8007).toLocaleString('fr-BE', { minimumFractionDigits: 2 }); // 80,07% du RMMMG

// ═══════════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — MANDATS ADMINISTRATIFS COMPLETS
// Module: Mandat ONSS/Mahis · Belcotax · Domiciliation bancaire
// Primes emploi: Art.60 §7 · Activa.brussels · 1er-6e employé
// ═══════════════════════════════════════════════════════════════════════════

const C = ({ children, style }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(198,163,78,0.12)',
    borderRadius: 12, padding: 20, marginBottom: 16, ...style }}>{children}</div>
);
const ST = ({ children, style }) => (
  <div style={{ fontSize: 14, fontWeight: 600, color: '#c6a34e', marginBottom: 12, ...style }}>{children}</div>
);
const Badge = ({ label, color = '#22c55e', bg = 'rgba(34,197,94,0.12)' }) => (
  <span style={{ fontSize: 10, fontWeight: 700, color, background: bg, padding: '3px 8px',
    borderRadius: 4, border: `1px solid ${color}40` }}>{label}</span>
);
const Btn = ({ onClick, children, color = '#c6a34e', style }) => (
  <button onClick={onClick} style={{ padding: '10px 18px', borderRadius: 8, border: `1px solid ${color}40`,
    background: `${color}15`, color, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', ...style }}>{children}</button>
);
const Field = ({ label, value, onChange, type = 'text', options, readonly }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>{label}</label>
    {options ? (
      <select value={value} onChange={e => onChange(e.target.value)} disabled={readonly}
        style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid rgba(198,163,78,0.2)',
          background: 'rgba(0,0,0,0.3)', color: '#e8e6e0', fontSize: 12, fontFamily: 'inherit' }}>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} readOnly={readonly}
        style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid rgba(198,163,78,0.2)',
          background: readonly ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.3)',
          color: '#e8e6e0', fontSize: 12, fontFamily: 'inherit', boxSizing: 'border-box' }} />
    )}
  </div>
);

// ══ DONNÉES FIXES AUREUS ══
const AUREUS = {
  nom: 'Aureus IA SPRL',
  bce: '1028.230.781',
  adresse: 'Place Marcel Broodthaers 8, 1060 Saint-Gilles',
  matriculeONSS: '51357716-02',
  gerant: 'Nourdin Moussati',
  coGerant: 'Salem Abdellah',
  mahisRef: 'DGIII/MAHI011/1028.230.781',
  csamRef1: '22A00LCY0E8HZ',
  csamRef2: '22A00LCY0ENXZ',
  peppolId: '0208:1028230781',
  actirisN: '829605',
  iban: 'BE___ ____ ____ ____', // À compléter
  bic: 'GEBABEBB',
};

// ══ RÉDUCTIONS PREMIER(S) EMPLOYÉ(S) 2026 ══
const REDUCTIONS_PREMIERS_EMPLOYES = [
  { rang: 1, label: '1er employé', exo: 'TOTALE', montant: null, duree: 'Illimitée', detail: 'Exonération totale des cotisations patronales de base. Art. 334 Loi 22/12/2003. Aucune limite dans le temps. Montant moyen économisé : ~8.000–12.000 EUR/an selon salaire.' },
  { rang: 2, label: '2e employé', exo: 'PARTIELLE', montant: 3100, duree: '13 trimestres', detail: 'Réduction forfaitaire 3.100 EUR/trimestre pendant 13 trimestres (3,25 ans). Art. 2 §2 Loi 27/06/1969. Économie totale : ~40.300 EUR.' },
  { rang: 3, label: '3e employé', exo: 'PARTIELLE', montant: 1000, duree: '13 trimestres', detail: 'Réduction forfaitaire 1.000 EUR/trimestre pendant 13 trimestres. Économie totale : ~13.000 EUR.' },
  { rang: 4, label: '4e employé', exo: 'PARTIELLE', montant: 1000, duree: '8 trimestres', detail: 'Réduction forfaitaire 1.000 EUR/trimestre pendant 8 trimestres (2 ans). Économie totale : ~8.000 EUR.' },
  { rang: 5, label: '5e employé', exo: 'PARTIELLE', montant: 1000, duree: '8 trimestres', detail: 'Réduction forfaitaire 1.000 EUR/trimestre pendant 8 trimestres. Économie totale : ~8.000 EUR.' },
  { rang: 6, label: '6e employé', exo: 'PARTIELLE', montant: 1000, duree: '4 trimestres', detail: 'Réduction forfaitaire 1.000 EUR/trimestre pendant 4 trimestres (1 an). Économie totale : ~4.000 EUR.' },
];

// ══ PRIMES ACTIVA / ART.60 2026 ══
const PRIMES_EMPLOI = [
  {
    id: 'activa_bxl',
    label: 'Activa.brussels',
    montant: '350 EUR/mois',
    duree: '24 mois',
    region: 'Bruxelles',
    organisme: 'Actiris',
    conditions: 'Demandeur d\'emploi bruxellois inoccupé ≥ 6 mois. 18–64 ans.',
    demarches: 'Attestation Actiris + formulaire C53W chez l\'employeur. Actiris verse directement.',
    base_legale: 'Ord. 22/12/2016',
    calcul: '350 EUR/mois × 24 mois = 8.400 EUR total',
  },
  {
    id: 'activa_bxl_ap',
    label: 'Activa.brussels AP (Allocations de Passage)',
    montant: '350 → 800 → 350 EUR/mois',
    duree: '24 mois (phases variables)',
    region: 'Bruxelles',
    organisme: 'Actiris',
    conditions: 'Chercheur emploi bruxellois longue durée. Attestation N° requise (ex: N° 829605).',
    demarches: 'Attestation Actiris AP + fiches de paie avec déduction mensuelle.',
    base_legale: 'Ord. 22/12/2016 — variante AP',
    calcul: 'Mois 1-12: 350 EUR/m · Mois 13-18: 800 EUR/m · Mois 19-24: 350 EUR/m = 10.200 EUR total',
  },
  {
    id: 'art60',
    label: 'Art. 60 §7 — CPAS (Premier emploi CPAS)',
    montant: '100% salaire + cotisations',
    duree: 'Variable (6–24 mois)',
    region: 'National',
    organisme: 'CPAS + ONEM',
    conditions: 'Bénéficiaire du revenu d\'intégration sociale (RIS). Contrat via CPAS qui le met à disposition d\'un tiers employeur.',
    demarches: 'Contact CPAS de la commune + convention de mise à disposition.',
    base_legale: 'Art. 60 §7 Loi CPAS 08/07/1976',
    calcul: 'CPAS prend en charge 100% du coût salarial pendant la durée convenue.',
  },
  {
    id: 'activa_jeune',
    label: 'Activa Jeunes < 30 ans',
    montant: '350 EUR/mois',
    duree: '12–24 mois',
    region: 'Bruxelles / Flandre / Wallonie',
    organisme: 'Actiris / VDAB / FOREM',
    conditions: 'Moins de 30 ans. Chercheur d\'emploi. Diplôme max CESS.',
    demarches: 'Attestation Actiris/VDAB/FOREM selon région. Déclaration à l\'ONEM.',
    base_legale: 'Loi 24/12/1999 — groupes cibles',
    calcul: '350 EUR/mois × 12-24 mois = 4.200–8.400 EUR',
  },
  {
    id: 'impulsion_55',
    label: 'Impulsion 55+',
    montant: '500 EUR/mois',
    duree: '36 mois',
    region: 'Bruxelles',
    organisme: 'Actiris',
    conditions: 'Chercheur d\'emploi ≥ 55 ans. Inoccupé ≥ 6 mois.',
    demarches: 'Attestation Actiris Impulsion 55+.',
    base_legale: 'Ord. 22/12/2016 — groupes cibles âgés',
    calcul: '500 EUR/mois × 36 mois = 18.000 EUR total',
  },
  {
    id: 'sine',
    label: 'SINE — Économie Sociale',
    montant: '500 EUR/mois',
    duree: '24 mois',
    region: 'National',
    organisme: 'ONEM',
    conditions: 'Très difficile d\'insertion. RSI ou équivalent. Engagement en économie sociale agréée.',
    demarches: 'Agrément ONEM économie sociale + formulaire C78.',
    base_legale: 'AR 11/09/2002',
    calcul: '500 EUR/mois × 24 mois = 12.000 EUR',
  },
  {
    id: 'monbee',
    label: 'MonBEE (Économie d\'énergie employeur)',
    montant: 'Variable selon investissements',
    duree: 'Annuel',
    region: 'Bruxelles',
    organisme: 'Bruxelles Environnement',
    conditions: 'Employeur bruxellois réalisant des investissements verts.',
    demarches: 'Dossier MonBEE avant le 01/06/2026 (deadline active).',
    base_legale: 'Ord. Bruxelloise sur les primes énergie',
    calcul: 'Variable selon investissements énergétiques',
  },
];

// ══ TAUX DOMICILIATION 2026 ══
const DOMICILIATION_TAUX = {
  tauxRistourne: 0.05,
  label: 'Ristourne domiciliation 5%',
  description: 'En contrepartie de la domiciliation de tous les paiements sociaux (cotisations ONSS, versements PP, virements salaires) sur le compte bancaire d\'Aureus IA SPRL référencé, le client bénéficie d\'une ristourne de 5% sur les honoraires mensuels Aureus Social Pro.',
  conditionsAppliquer: [
    'Domiciliation des virements SEPA salaires depuis Aureus',
    'Paiements ONSS trimestriels via le compte Aureus',
    'Versements précompte professionnel via Aureus',
    'Minimum 3 mois consécutifs de domiciliation active',
  ],
  calcul: 'Honoraires bruts × 0,95 = honoraires avec ristourne',
};

// ══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function MandatsAdminPage({ s, d, tab }) {
  const props_tab = tab || 'mandatonss';
  const [activeTab, setActiveTab] = useState(props_tab);
  const [copied, setCopied] = useState('');
  const [clientForm, setClientForm] = useState({
    nom: '', bce: '', matriculeONSS: '', iban: '', email: '', gerant: '', rang: '1',
  });
  const [selectedPrime, setSelectedPrime] = useState('activa_bxl');
  const [domForm, setDomForm] = useState({ honorairesBruts: 500, moisActifs: 12 });
  const [showConfirmMandat, setShowConfirmMandat] = useState(false);
  const [fiches281, setFiches281] = useState([]);
  const [xmlGenerated, setXmlGenerated] = useState('');
  const [egaliteData, setEgaliteData] = useState({ showReport: false });

  useEffect(() => { if (tab) setActiveTab(tab); }, [tab]);

  const tabs = [
    { k: 'mandatonss', l: '🏛 Mandat ONSS/Mahis' },
    { k: 'belcotax', l: '📄 Belcotax' },
    { k: 'domiciliation', l: '💳 Domiciliation 5%' },
    { k: 'premieremploi', l: '🏅 1er–6e Employé' },
    { k: 'primes', l: '💼 Activa / Art.60' },
    { k: 'generateur', l: '📝 Générateur Documents' },
    { k: 'connexions', l: '🔗 Connexions & RMMMG' },
  ];

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(''), 2000); });
  };

  const f2 = v => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2 }).format(v);

  // ── Générateur XML Belcotax 281.10 ──────────────────────────
  const generateBelcotaxXML = (emps, year) => {
    const y = year || new Date().getFullYear() - 1;
    const now = new Date().toISOString().split('T')[0].replace(/-/g,'');
    const bce = '1028230781';
    const lines = emps.map((emp, i) => {
      const brut = +(emp.gross || emp.monthlySalary || 0) * 12;
      const onssW = Math.round(brut * 0.1307 * 100) / 100;
      const imposable = brut - onssW;
      const pp = Math.round(imposable * 0.22 * 100) / 100;
      const niss = (emp.niss || '000000-000-00').replace(/[^0-9]/g, '').padStart(11, '0');
      const nom = (emp.last || emp.ln || 'NOM').toUpperCase().substring(0, 40);
      const prenom = (emp.first || emp.fn || 'PRENOM').substring(0, 40);
      return `    <Fiche281_10 seq="${i+1}">
      <Annee>${y}</Annee>
      <NISS>${niss}</NISS>
      <Nom>${nom}</Nom>
      <Prenom>${prenom}</Prenom>
      <RemunerationBrute>${brut.toFixed(2)}</RemunerationBrute>
      <CotisationONSSTravailleur>${onssW.toFixed(2)}</CotisationONSSTravailleur>
      <RemunerationImposable>${imposable.toFixed(2)}</RemunerationImposable>
      <PrecompteProfessionnel>${pp.toFixed(2)}</PrecompteProfessionnel>
      <CodeNatureSalaire>1</CodeNatureSalaire>
    </Fiche281_10>`;
    }).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<Belcotax version="2.9">
  <Declarant>
    <NumeroEntreprise>${bce}</NumeroEntreprise>
    <Denomination>Aureus IA SPRL</Denomination>
    <DateEnvoi>${now}</DateEnvoi>
    <Annee>${y}</Annee>
    <NombreRecords>${emps.length}</NombreRecords>
  </Declarant>
  <Fiches>
${lines}
  </Fiches>
</Belcotax>`;
  };

  // ── Générateur de document de mandat ──────────────────────────
  const generateMandatONSS = () => {
    const date = new Date().toLocaleDateString('fr-BE');
    return `CONVENTION DE MANDAT — GESTION SOCIALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mandant : ${clientForm.nom || '[NOM ENTREPRISE]'}
BCE : ${clientForm.bce || '[BCE]'}
Matricule ONSS : ${clientForm.matriculeONSS || '[MATRICULE ONSS]'}
Représenté par : ${clientForm.gerant || '[GÉRANT]'}

Mandataire : ${AUREUS.nom}
BCE : ${AUREUS.bce}
Adresse : ${AUREUS.adresse}
Matricule Mahis : ${AUREUS.mahisRef}
Réf. CSAM : ${AUREUS.csamRef1}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJET DU MANDAT

Le Mandant confie au Mandataire la gestion des obligations sociales suivantes :
✓ Déclarations Dimona (IN/OUT/INTERM) — AR 05/11/2002
✓ Déclarations DmfA trimestrielles — AR 28/11/1969
✓ Gestion Belcotax-on-web (fiches 281.10/20/30)
✓ Soumissions ONSS en ligne via portail Mahis
✓ Mandats CSAM/GAP pour accès aux plateformes fédérales

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BASE LÉGALE
- Loi du 27 juin 1969 (sécurité sociale des travailleurs)
- AR du 28 novembre 1969 (DmfA)
- AR du 5 novembre 2002 (Dimona)
- Règlement ONSS/Mahis — Réf. DGIII/MAHI011/${AUREUS.bce}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DURÉE : Indéterminée — résiliation avec préavis de 3 mois

Fait à Bruxelles, le ${date}

Le Mandant :                    Le Mandataire :
_____________________          _____________________
${clientForm.gerant || ''}                     Nourdin MOUSSATI
                               Aureus IA SPRL`;
  };

  const generateMandatBelcotax = () => {
    const date = new Date().toLocaleDateString('fr-BE');
    return `MANDAT BELCOTAX-ON-WEB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Par le présent mandat, je soussigné(e) ${clientForm.gerant || '[GÉRANT]'},
représentant ${clientForm.nom || '[ENTREPRISE]'} (BCE : ${clientForm.bce || '[BCE]'}),

MANDATE

${AUREUS.nom} (BCE : ${AUREUS.bce})
à soumettre les déclarations annuelles de précompte professionnel
(fiches 281.10, 281.20, 281.30) via la plateforme Belcotax-on-web
au nom et pour le compte de l'entreprise susmentionnée.

Ce mandat est accordé pour l'année fiscale en cours et les années suivantes
jusqu'à révocation expresse.

Délais légaux : fiches 281.10 avant le 1er mars de l'année suivante.

Fait à __________, le ${date}

Signature :
_____________________
${clientForm.gerant || ''}
${clientForm.nom || ''}`;
  };

  const prime = PRIMES_EMPLOI.find(p => p.id === selectedPrime);
  const ristourne = domForm.honorairesBruts * DOMICILIATION_TAUX.tauxRistourne;
  const netAvecRistourne = domForm.honorairesBruts - ristourne;
  const economieAnnuelle = ristourne * domForm.moisActifs;

  return (
    <div style={{ color: '#e8e6e0', fontFamily: 'inherit' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.k} onClick={() => setActiveTab(t.k)}
            style={{ padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: activeTab === t.k ? 600 : 400, fontFamily: 'inherit',
              background: activeTab === t.k ? 'rgba(198,163,78,0.15)' : 'rgba(255,255,255,0.03)',
              color: activeTab === t.k ? '#c6a34e' : '#9e9b93' }}>{t.l}</button>
        ))}
      </div>

      {/* ── MANDAT ONSS/MAHIS ── */}
      {activeTab === 'mandatonss' && (
        <div>
          <C>
            <ST>🏛 Statut Mandat ONSS/Mahis — Aureus IA SPRL</ST>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { l: 'Matricule provisoire', v: AUREUS.matriculeONSS, c: '#f97316' },
                { l: 'Réf. Mahis', v: AUREUS.mahisRef, c: '#22c55e' },
                { l: 'CSAM GAP réf. 1', v: AUREUS.csamRef1, c: '#60a5fa' },
              ].map((k, i) => (
                <div key={i} onClick={() => copy(k.v, k.l)} style={{ padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid ${k.c}30`,
                  cursor: 'pointer' }}>
                  <div style={{ fontSize: 10, color: '#888' }}>{k.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: k.c, marginTop: 4, fontFamily: 'monospace' }}>{k.v}</div>
                  <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>{copied === k.l ? '✅ Copié !' : 'Cliquer pour copier'}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge label="Mahis actif depuis 26/02/2026" />
              <Badge label="CSAM GAP confirmé" color="#60a5fa" bg="rgba(96,165,250,0.12)" />
              <Badge label="Dimona IN soumis" />
              <Badge label="Matricule WIDE provisoire" color="#f97316" bg="rgba(249,115,22,0.12)" />
            </div>
          </C>

          <C>
            <ST>📋 Informations Client (pour générer le document de mandat)</ST>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Nom entreprise client" value={clientForm.nom} onChange={v => setClientForm(p => ({ ...p, nom: v }))} />
              <Field label="BCE (format 0xxx.xxx.xxx)" value={clientForm.bce} onChange={v => setClientForm(p => ({ ...p, bce: v }))} />
              <Field label="Matricule ONSS client" value={clientForm.matriculeONSS} onChange={v => setClientForm(p => ({ ...p, matriculeONSS: v }))} />
              <Field label="Email responsable" value={clientForm.email} type="email" onChange={v => setClientForm(p => ({ ...p, email: v }))} />
              <Field label="Nom du gérant" value={clientForm.gerant} onChange={v => setClientForm(p => ({ ...p, gerant: v }))} />
              <Field label="IBAN client" value={clientForm.iban} onChange={v => setClientForm(p => ({ ...p, iban: v }))} />
            </div>
          </C>

          <C>
            <ST>📄 Étapes de Configuration du Mandat ONSS</ST>
            {[
              { n: '01', t: 'Client ajoute Aureus dans CSAM GAP', d: 'Le client se connecte sur csam.belgique.be → Accès aux applications → GAP → ajouter Aureus IA SPRL (BCE 1028.230.781) comme prestataire de services sociaux. Délai : 24-48h.' },
              { n: '02', t: 'Activation Mahis dans ONSS.be', d: `ONSS.be → Mahis → Mandats → configurer droits DmfA + Dimona pour le matricule ONSS du client. Référence Mahis Aureus : ${AUREUS.mahisRef}.` },
              { n: '03', t: 'Test Dimona IN de validation', d: 'Soumettre une Dimona IN test pour un travailleur fictif. Si succès → mandat actif et fonctionnel. Conserver l\'accusé de réception.' },
              { n: '04', t: 'Signature de la convention de mandat', d: 'Faire signer le document de mandat ci-dessous par le gérant client. Original papier + copie PDF en Supabase.' },
              { n: '05', t: 'Configuration Belcotax mandataire', d: 'MyMinfin.be → Belcotax-on-web → ajouter Aureus IA SPRL comme mandataire fisc pour les fiches 281.xx. Délai : 5-10 jours ouvrables.' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                <div style={{ minWidth: 32, height: 32, background: '#c6a34e', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#0a0a0a' }}>{step.n}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e6e0' }}>{step.t}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 3, lineHeight: 1.5 }}>{step.d}</div>
                </div>
              </div>
            ))}
          </C>

          {clientForm.nom && (
            <C style={{ borderColor: 'rgba(198,163,78,0.3)' }}>
              <ST>📝 Aperçu du Document de Mandat ONSS</ST>
              <pre style={{ fontSize: 10, color: '#9e9b93', lineHeight: 1.7, whiteSpace: 'pre-wrap',
                background: 'rgba(0,0,0,0.3)', padding: 14, borderRadius: 8, fontFamily: 'monospace' }}>
                {generateMandatONSS()}
              </pre>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Btn onClick={() => copy(generateMandatONSS(), 'mandat')}>
                  {copied === 'mandat' ? '✅ Copié !' : '📋 Copier le document'}
                </Btn>
              </div>
            </C>
          )}
        </div>
      )}

      {/* ── BELCOTAX ── */}
      {activeTab === 'belcotax' && (
        <div>
          <C>
            <ST>📄 Belcotax-on-web — Fiches 281 (Précompte Professionnel)</ST>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { l: 'Fiche 281.10', v: 'Salariés', desc: 'Tous les travailleurs sous contrat de travail', icon: '👔', deadline: '1er mars' },
                { l: 'Fiche 281.20', v: 'Dirigeants', desc: 'Administrateurs, gérants rémunérés', icon: '👔', deadline: '1er mars' },
                { l: 'Fiche 281.30', v: 'Honoraires', desc: 'Indépendants, free-lances', icon: '🧾', deadline: '1er mars' },
              ].map((f, i) => (
                <div key={i} style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                  border: '1px solid rgba(198,163,78,0.1)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#c6a34e' }}>{f.l} {f.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{f.v}</div>
                  <div style={{ fontSize: 10, color: '#888', marginTop: 3 }}>{f.desc}</div>
                  <div style={{ fontSize: 10, color: '#f97316', marginTop: 6 }}>⏰ Délai : {f.deadline} de l'année N+1</div>
                </div>
              ))}
            </div>
          </C>

          <C>
            <ST>📋 Informations Client pour Mandat Belcotax</ST>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Nom entreprise" value={clientForm.nom} onChange={v => setClientForm(p => ({ ...p, nom: v }))} />
              <Field label="BCE" value={clientForm.bce} onChange={v => setClientForm(p => ({ ...p, bce: v }))} />
              <Field label="Gérant" value={clientForm.gerant} onChange={v => setClientForm(p => ({ ...p, gerant: v }))} />
            </div>
          </C>

          <C>
            <ST>🗓 Calendrier Belcotax & Étapes</ST>
            {[
              { n: '01', t: 'Clôture annuelle (décembre)', d: 'Aureus génère les fiches 281.10/20/30 depuis les données de paie de l\'année. Vérification des montants bruts, PP, ATN.' },
              { n: '02', t: 'Connexion Belcotax-on-web (janvier)', d: 'MyMinfin.be → Belcotax-on-web → connexion eID/itsme. Aureus IA SPRL comme mandataire (si mandat configuré au préalable).' },
              { n: '03', t: 'Import des fiches XML (janvier–février)', d: 'Téléversement du fichier XML généré par Aureus Social Pro. Validation automatique par le SPF Finances.' },
              { n: '04', t: 'Correction des erreurs', d: 'Belcotax signale les NISS manquants, montants incohérents, codes fiscaux incorrects. Corriger dans Aureus → regénérer → re-soumettre.' },
              { n: '05', t: 'Envoi officiel (avant 1er mars)', d: 'Accusé de réception à conserver. Fiches 281.10 à distribuer aux travailleurs (pour leur déclaration IPP).' },
              { n: '06', t: 'Distribution aux travailleurs', d: 'Chaque employé doit recevoir sa fiche 281.10. Envoi automatique depuis Aureus (email + portail employé).' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                <div style={{ minWidth: 32, height: 32, background: 'rgba(198,163,78,0.15)', borderRadius: '50%',
                  border: '1px solid rgba(198,163,78,0.3)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#c6a34e' }}>{step.n}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{step.t}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 3, lineHeight: 1.5 }}>{step.d}</div>
                </div>
              </div>
            ))}
          </C>

          {clientForm.nom && (
            <C style={{ borderColor: 'rgba(198,163,78,0.3)' }}>
              <ST>📝 Aperçu Mandat Belcotax</ST>
              <pre style={{ fontSize: 10, color: '#9e9b93', lineHeight: 1.7, whiteSpace: 'pre-wrap',
                background: 'rgba(0,0,0,0.3)', padding: 14, borderRadius: 8, fontFamily: 'monospace' }}>
                {generateMandatBelcotax()}
              </pre>
              <Btn onClick={() => copy(generateMandatBelcotax(), 'belcotax')}>
                {copied === 'belcotax' ? '✅ Copié !' : '📋 Copier le mandat'}
              </Btn>
            </C>
          )}

          <C>
            <ST>🗂 Générateur XML Belcotax 281.10 — Fichier Officiel SPF Finances</ST>
            <div style={{ marginBottom: 12, padding: 10, background: 'rgba(96,165,250,.06)', borderRadius: 8, fontSize: 11, color: '#60a5fa', lineHeight: 1.6 }}>
              ℹ️ Génère le fichier XML à soumettre sur MyMinfin.be → Belcotax-on-web avant le 1er mars N+1
            </div>
            {(s?.emps||[]).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#5e5c56', fontSize: 12 }}>
                ⚠️ Aucun travailleur — ajoutez des employés d'abord
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 11, color: '#9e9b93', marginBottom: 12 }}>
                  {(s?.emps||[]).length} travailleur(s) détecté(s) → {(s?.emps||[]).length} fiche(s) 281.10 à générer
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Btn onClick={() => {
                    const xml = generateBelcotaxXML(s?.emps || [], new Date().getFullYear() - 1);
                    setXmlGenerated(xml);
                    const blob = new Blob([xml], { type: 'application/xml' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `belcotax-281-${new Date().getFullYear()-1}.xml`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }} color="#22c55e">
                    ⬇️ Télécharger XML Belcotax {new Date().getFullYear()-1}
                  </Btn>
                  <Btn onClick={() => {
                    const xml = generateBelcotaxXML(s?.emps || [], new Date().getFullYear() - 1);
                    setXmlGenerated(xml);
                  }}>
                    👁 Prévisualiser XML
                  </Btn>
                </div>
                {xmlGenerated && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10, color: '#c6a34e', marginBottom: 4, fontWeight: 700 }}>Aperçu XML (premiers 2000 caractères) :</div>
                    <pre style={{ fontSize: 9, color: '#9e9b93', background: 'rgba(0,0,0,.3)', padding: 12, borderRadius: 8, overflowX: 'auto', maxHeight: 200, overflowY: 'auto', fontFamily: 'monospace', lineHeight: 1.5 }}>
                      {xmlGenerated.substring(0, 2000)}{xmlGenerated.length > 2000 ? '\n...' : ''}
                    </pre>
                    <Btn onClick={() => copy(xmlGenerated, 'xml')} style={{ marginTop: 8 }}>
                      {copied === 'xml' ? '✅ Copié !' : '📋 Copier XML complet'}
                    </Btn>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <ST>📋 Interface Saisie Fiches 281.10</ST>
              {(s?.emps||[]).length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                      <tr>{['Travailleur','NISS','Brut annuel','ONSS trav.','Imposable','PP'].map(h => (
                        <th key={h} style={{ padding: '8px', textAlign: 'left', color: '#c6a34e', borderBottom: '2px solid rgba(198,163,78,.2)', fontSize: 10 }}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {(s?.emps||[]).map((emp, i) => {
                        const brut = +(emp.gross || emp.monthlySalary || 0) * 12;
                        const onssW = Math.round(brut * 0.1307 * 100) / 100;
                        const imposable = Math.round((brut - onssW) * 100) / 100;
                        const pp = Math.round(imposable * 0.22 * 100) / 100;
                        const f2 = v => new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2 }).format(v);
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                            <td style={{ padding: '6px' }}>{(emp.first||emp.fn||'')} {(emp.last||emp.ln||'')}</td>
                            <td style={{ padding: '6px', color: emp.niss ? '#22c55e' : '#ef4444', fontSize: 10 }}>{emp.niss || '❌ Manquant'}</td>
                            <td style={{ padding: '6px', color: '#c6a34e' }}>{f2(brut)} €</td>
                            <td style={{ padding: '6px', color: '#fb923c' }}>{f2(onssW)} €</td>
                            <td style={{ padding: '6px' }}>{f2(imposable)} €</td>
                            <td style={{ padding: '6px', color: '#60a5fa' }}>{f2(pp)} €</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ color: '#5e5c56', fontSize: 11, padding: 12 }}>Aucun travailleur — les fiches apparaîtront ici</div>
              )}
            </div>
          </C>
        </div>
      )}

      {/* ── DOMICILIATION 5% ── */}
      {activeTab === 'domiciliation' && (
        <div>
          <C style={{ background: 'rgba(198,163,78,0.06)', borderColor: 'rgba(198,163,78,0.25)' }}>
            <ST>💳 Ristourne Domiciliation 5% — Offre Aureus Social Pro</ST>
            <p style={{ fontSize: 12, color: '#9e9b93', lineHeight: 1.7, margin: '0 0 12px' }}>
              {DOMICILIATION_TAUX.description}
            </p>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#c6a34e', marginBottom: 8 }}>
                Conditions d'application :
              </div>
              {DOMICILIATION_TAUX.conditionsAppliquer.map((c, i) => (
                <div key={i} style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>✅ {c}</div>
              ))}
            </div>
          </C>

          <C>
            <ST>🔢 Calculateur de Ristourne</ST>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>
                  Honoraires mensuels bruts (EUR)
                </label>
                <input type="range" min={200} max={2000} step={50} value={domForm.honorairesBruts}
                  onChange={e => setDomForm(p => ({ ...p, honorairesBruts: +e.target.value }))}
                  style={{ width: '100%', accentColor: '#c6a34e' }} />
                <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#c6a34e', marginTop: 4 }}>
                  {f2(domForm.honorairesBruts)} EUR/mois
                </div>
              </div>
              <div>
                <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>
                  Durée (mois)
                </label>
                <input type="range" min={3} max={36} step={1} value={domForm.moisActifs}
                  onChange={e => setDomForm(p => ({ ...p, moisActifs: +e.target.value }))}
                  style={{ width: '100%', accentColor: '#c6a34e' }} />
                <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#c6a34e', marginTop: 4 }}>
                  {domForm.moisActifs} mois
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { l: 'Ristourne/mois', v: f2(ristourne) + ' EUR', c: '#22c55e' },
                { l: 'Net avec ristourne', v: f2(netAvecRistourne) + ' EUR/m', c: '#c6a34e' },
                { l: 'Économie totale', v: f2(economieAnnuelle) + ' EUR', c: '#a78bfa' },
              ].map((k, i) => (
                <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)',
                  borderRadius: 10, border: `1px solid ${k.c}30`, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#888' }}>{k.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: k.c, marginTop: 4 }}>{k.v}</div>
                </div>
              ))}
            </div>
          </C>

          <C>
            <ST>📜 Clause de Domiciliation — À Insérer dans le Contrat</ST>
            <div style={{ fontSize: 10, color: '#9e9b93', lineHeight: 1.7, fontFamily: 'monospace',
              background: 'rgba(0,0,0,0.3)', padding: 14, borderRadius: 8, whiteSpace: 'pre-wrap' }}>
{`ARTICLE X — DOMICILIATION ET RISTOURNE

Le Client accepte de domicilier les paiements suivants 
sur le compte bancaire d'Aureus IA SPRL (IBAN : ${AUREUS.iban}) :
(i)   virements des salaires des travailleurs
(ii)  paiements des cotisations ONSS trimestrielles
(iii) versements du précompte professionnel

En contrepartie de cette domiciliation, Aureus IA SPRL octroie 
au Client une ristourne de 5% sur les honoraires mensuels de gestion 
sociale, applicable dès le 4e mois consécutif de domiciliation active.

La ristourne est suspendue automatiquement si la domiciliation 
est interrompue pendant plus de 2 mois consécutifs.`}
            </div>
            <Btn onClick={() => copy('ARTICLE X — DOMICILIATION...', 'clause')} style={{ marginTop: 10 }}>
              {copied === 'clause' ? '✅ Copié !' : '📋 Copier la clause'}
            </Btn>
          </C>
        </div>
      )}

      {/* ── PREMIER EMPLOYÉ ── */}
      {activeTab === 'premieremploi' && (
        <div>
          <C style={{ background: 'rgba(34,197,94,0.04)', borderColor: 'rgba(34,197,94,0.2)' }}>
            <ST>🏅 Réductions Cotisations — 1er au 6e Employé (2026)</ST>
            <p style={{ fontSize: 11, color: '#9e9b93', lineHeight: 1.6, margin: '0 0 12px' }}>
              En Belgique, les premières embauches bénéficient de réductions massives sur les cotisations 
              patronales ONSS. Le 1er employé est exonéré <strong style={{ color: '#22c55e' }}>TOTALEMENT</strong> à vie. 
              Les suivants bénéficient de réductions forfaitaires dégressives.
            </p>
          </C>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {REDUCTIONS_PREMIERS_EMPLOYES.map(r => (
              <div key={r.rang} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                border: `1px solid ${r.rang === 1 ? 'rgba(34,197,94,0.3)' : 'rgba(198,163,78,0.15)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#e8e6e0' }}>{r.rang}. {r.label}</div>
                  <Badge
                    label={r.exo === 'TOTALE' ? '🏆 TOTALE' : `${r.montant} EUR/trim`}
                    color={r.exo === 'TOTALE' ? '#22c55e' : '#c6a34e'}
                    bg={r.exo === 'TOTALE' ? 'rgba(34,197,94,0.15)' : 'rgba(198,163,78,0.12)'}
                  />
                </div>
                <div style={{ fontSize: 10, color: '#f97316', marginBottom: 6 }}>⏱ Durée : {r.duree}</div>
                <div style={{ fontSize: 10, color: '#888', lineHeight: 1.5 }}>{r.detail}</div>
              </div>
            ))}
          </div>

          <C style={{ marginTop: 16 }}>
            <ST>📊 Économies Cumulées — Simulation Embauches Séquentielles</ST>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr>
                    {['Employé', 'Réduction', 'Durée', 'Économie totale', 'Base légale'].map(h => (
                      <th key={h} style={{ padding: '8px', textAlign: 'left', color: '#c6a34e',
                        borderBottom: '2px solid rgba(198,163,78,0.2)', fontSize: 10 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {REDUCTIONS_PREMIERS_EMPLOYES.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{r.rang}. {r.label}</td>
                      <td style={{ padding: '8px', color: r.exo === 'TOTALE' ? '#22c55e' : '#c6a34e', fontWeight: 700 }}>
                        {r.exo === 'TOTALE' ? '100% exonéré' : `${r.montant.toLocaleString('fr-BE')} EUR/trim`}
                      </td>
                      <td style={{ padding: '8px', color: '#888' }}>{r.duree}</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#22c55e' }}>
                        {r.exo === 'TOTALE' ? '~10.000 EUR/an ∞' : `~${(r.montant * parseInt(r.duree) / 3).toLocaleString('fr-BE')} EUR`}
                      </td>
                      <td style={{ padding: '8px', color: '#888', fontSize: 9 }}>
                        {r.rang === 1 ? 'Art.334 L.22/12/2003' : 'Art.2§2 L.27/06/1969'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </C>
        </div>
      )}

      {/* ── ACTIVA / ART.60 ── */}
      {activeTab === 'primes' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {PRIMES_EMPLOI.map(p => (
              <button key={p.id} onClick={() => setSelectedPrime(p.id)}
                style={{ padding: '7px 13px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: selectedPrime === p.id ? 600 : 400, fontFamily: 'inherit',
                  background: selectedPrime === p.id ? 'rgba(198,163,78,0.15)' : 'rgba(255,255,255,0.03)',
                  color: selectedPrime === p.id ? '#c6a34e' : '#9e9b93' }}>{p.label.split(' ')[0]} {p.label.split(' ')[1] || ''}</button>
            ))}
          </div>

          {prime && (
            <div>
              <C style={{ background: 'rgba(198,163,78,0.04)', borderColor: 'rgba(198,163,78,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <ST>{prime.label}</ST>
                  <Badge label={prime.region} color="#60a5fa" bg="rgba(96,165,250,0.12)" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
                  {[
                    { l: 'Montant', v: prime.montant, c: '#22c55e' },
                    { l: 'Durée', v: prime.duree, c: '#c6a34e' },
                    { l: 'Organisme', v: prime.organisme, c: '#a78bfa' },
                  ].map((k, i) => (
                    <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)',
                      borderRadius: 10, border: `1px solid ${k.c}30` }}>
                      <div style={{ fontSize: 10, color: '#888' }}>{k.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: k.c, marginTop: 3 }}>{k.v}</div>
                    </div>
                  ))}
                </div>
                {[
                  { l: '📋 Conditions', v: prime.conditions },
                  { l: '🚀 Démarches', v: prime.demarches },
                  { l: '⚖ Base légale', v: prime.base_legale },
                  { l: '🔢 Calcul économie', v: prime.calcul },
                ].map((row, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#c6a34e', marginBottom: 3 }}>{row.l}</div>
                    <div style={{ fontSize: 11, color: '#9e9b93', lineHeight: 1.5 }}>{row.v}</div>
                  </div>
                ))}
              </C>

              {prime.id === 'activa_bxl' && (
                <C>
                  <ST>✅ Activa.brussels N° 829605 — Votre Attestation Active</ST>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <Badge label="N° 829605 ACTIF" />
                    <Badge label="Actiris confirmé" color="#60a5fa" bg="rgba(96,165,250,0.12)" />
                    <Badge label="Deadline MonBEE: 01/06/2026" color="#f97316" bg="rgba(249,115,22,0.12)" />
                  </div>
                  <div style={{ fontSize: 11, color: '#9e9b93', lineHeight: 1.7 }}>
                    Votre attestation Activa.brussels N° 829605 est active pour Salem Abdellah 
                    (CDD 02/03/2026–31/05/2026, CP 200, brut 2.800 EUR). 
                    Déduction mensuelle : 350 EUR → net effectif ~2.200 EUR (1.900 + 350 Activa).
                  </div>
                </C>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── GÉNÉRATEUR DOCUMENTS ── */}
      {activeTab === 'generateur' && (
        <div>
          <C>
            <ST>📝 Générateur de Documents Administratifs</ST>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Nom entreprise client" value={clientForm.nom} onChange={v => setClientForm(p => ({ ...p, nom: v }))} />
              <Field label="BCE" value={clientForm.bce} onChange={v => setClientForm(p => ({ ...p, bce: v }))} />
              <Field label="Gérant" value={clientForm.gerant} onChange={v => setClientForm(p => ({ ...p, gerant: v }))} />
              <Field label="Rang du 1er employé engagé" value={clientForm.rang}
                onChange={v => setClientForm(p => ({ ...p, rang: v }))}
                options={REDUCTIONS_PREMIERS_EMPLOYES.map(r => ({ v: String(r.rang), l: `${r.rang}${r.rang===1?'er':'e'} employé` }))} />
            </div>
          </C>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {[
              { title: '🏛 Mandat ONSS/Mahis', key: 'mandatonss', gen: generateMandatONSS },
              { title: '📄 Mandat Belcotax', key: 'belcotax', gen: generateMandatBelcotax },
            ].map(doc => (
              <C key={doc.key}>
                <ST>{doc.title}</ST>
                <pre style={{ fontSize: 9, color: '#9e9b93', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, fontFamily: 'monospace',
                  maxHeight: 200, overflow: 'auto' }}>
                  {doc.gen()}
                </pre>
                <Btn onClick={() => copy(doc.gen(), doc.key)} style={{ marginTop: 10 }}>
                  {copied === doc.key ? '✅ Copié !' : '📋 Copier'}
                </Btn>
              </C>
            ))}
          </div>

          {clientForm.rang && (
            <C style={{ borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.04)' }}>
              <ST>🏅 Réduction Premier(s) Employé(s) — Résumé pour le Client</ST>
              {REDUCTIONS_PREMIERS_EMPLOYES.filter(r => r.rang <= parseInt(clientForm.rang)).map(r => (
                <div key={r.rang} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{r.rang}. {r.label}</span>
                    <Badge
                      label={r.exo === 'TOTALE' ? '100% EXONÉRÉ À VIE' : `${r.montant} EUR/trim × ${r.duree}`}
                      color={r.exo === 'TOTALE' ? '#22c55e' : '#c6a34e'}
                      bg={r.exo === 'TOTALE' ? 'rgba(34,197,94,0.15)' : 'rgba(198,163,78,0.12)'}
                    />
                  </div>
                </div>
              ))}
            </C>
          )}
        </div>
      )}

      {/* ── CONNEXIONS & RMMMG ── */}
      {activeTab === 'connexions' && (
        <div>
          <div style={{ padding: 20, background: 'rgba(34,197,94,0.06)', borderRadius: 14,
            border: '2px solid rgba(34,197,94,0.25)', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <ST style={{ margin: 0 }}>🏆 RMMMG 2026 — Salaire Minimum Belge</ST>
              <Badge label="CNT — CCT 43/15" color="#22c55e" bg="rgba(34,197,94,0.12)" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
              {[
                { l: 'Montant mensuel', v: `${RMMMG_M} EUR`, sub: '≥ 18 ans — taux plein', c: '#22c55e' },
                { l: 'Montant horaire (38h/sem)', v: `${RMMMG_H} EUR/h`, sub: 'Base 38h hebdomadaires', c: '#c6a34e' },
                { l: 'Montant annuel brut', v: `${RMMMG_AN} EUR`, sub: '× 12 mensualités', c: '#a78bfa' },
              ].map((k, i) => (
                <div key={i} style={{ padding: '14px', background: 'rgba(255,255,255,0.04)',
                  borderRadius: 10, border: `1px solid ${k.c}30`, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>{k.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: k.c }}>{k.v}</div>
                  <div style={{ fontSize: 9, color: '#555', marginTop: 3 }}>{k.sub}</div>
                </div>
              ))}
            </div>
            <a href="https://www.cnt-nar.be/CCT-ORIG/cct-043-15.pdf" target="_blank" rel="noreferrer"
              style={{ display: 'inline-block', padding: '8px 14px', borderRadius: 8,
                background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 11,
                fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(34,197,94,0.3)' }}>
              📄 Texte officiel CCT 43/15 — CNT ↗
            </a>
          </div>

          <C>
            <ST>📊 Barèmes RMMMG par Âge</ST>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead><tr>{['Âge', 'Ancienneté', 'Montant/mois', 'Base légale', 'Notes'].map(h => (
                <th key={h} style={{ padding: '8px', textAlign: 'left', color: '#c6a34e',
                  borderBottom: '2px solid rgba(198,163,78,0.2)', fontSize: 10 }}>{h}</th>
              ))}</tr></thead>
              <tbody>
                {[
                  ['< 18 ans', '—', `${RMMMG_MOINS18} EUR`, 'CCT 43/15 §4', 'Apprentis et étudiants jobistes'],
                  ['18 ans', 'Entrée', `${RMMMG_M} EUR`, 'CCT 43/15 §3', 'Taux de base'],
                  ['19–20 ans', '6 mois+', `${RMMMG_M} EUR`, 'CCT 43/15 §3', 'Identique taux de base'],
                  ['21 ans+', '12 mois+', `${RMMMG_M} EUR`, 'CCT 43/15 §3', '⚠ Vérifier barème sectoriel CP'],
                ].map(([age, anc, mnt, base, note], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '7px 8px', fontWeight: 600, color: '#c6a34e' }}>{age}</td>
                    <td style={{ padding: '7px 8px', color: '#888' }}>{anc}</td>
                    <td style={{ padding: '7px 8px', fontWeight: 700, color: '#22c55e' }}>{mnt}</td>
                    <td style={{ padding: '7px 8px', color: '#555', fontSize: 9, fontFamily: 'monospace' }}>{base}</td>
                    <td style={{ padding: '7px 8px', color: '#888', fontSize: 10 }}>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </C>

          <ST>🔗 Portails Officiels — Connexions Directes</ST>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {[
              { cat: '🏛 ONSS & Sécurité Sociale', color: '#c6a34e', links: [
                { l: 'ONSS — Portail employeur', url: 'https://www.socialsecurity.be', desc: 'DmfA, déclarations, cotisations' },
                { l: 'ONSS — Mahis (mandats)', url: 'https://www.socialsecurity.be/site_fr/employer/applics/mahis/index.htm', desc: 'Gestion mandats prestataires' },
                { l: 'CSAM GAP — Accès applications', url: 'https://csam.belgique.be', desc: 'Configurer accès eID / mandats' },
                { l: 'WIDE — Immatriculation ONSS', url: 'https://www.socialsecurity.be/site_fr/employer/applics/wide/index.htm', desc: 'Demande matricule employeur' },
                { l: 'Dimona — Déclarations immédiates', url: 'https://www.socialsecurity.be/site_fr/employer/applics/dimona/index.htm', desc: 'IN/OUT/INTERM travailleurs' },
              ]},
              { cat: '💰 SPF Finances & Fiscal', color: '#60a5fa', links: [
                { l: 'MyMinfin — Espace professionnel', url: 'https://eservices.minfin.fgov.be', desc: 'TVA, PP, Belcotax, taxe' },
                { l: 'Belcotax-on-web', url: 'https://eservices.minfin.fgov.be/belcotax-on-web', desc: 'Fiches 281.10/20/30 mandataire' },
                { l: 'SPF Finances — Barèmes PP 2026', url: 'https://finances.belgium.be/fr/entreprises/personnel_et_remuneration/precompte_professionnel/baremes', desc: 'Tables officielles précompte' },
                { l: 'CNT — CCT & RMMMG', url: 'https://www.cnt-nar.be', desc: 'CCT 43/15 — Salaire minimum 2.070,48 EUR' },
              ]},
              { cat: '💼 Primes Emploi Bruxelles', color: '#22c55e', links: [
                { l: 'Actiris — Activa.brussels', url: 'https://www.actiris.brussels/fr/employeurs/activa-brussels/', desc: 'Attestation, suivi N° 829605' },
                { l: 'Actiris — Impulsion 55+', url: 'https://www.actiris.brussels/fr/employeurs/impulsion/', desc: '500 EUR/mois — 36 mois' },
                { l: 'Actiris — Activa Jeunes', url: 'https://www.actiris.brussels/fr/employeurs/activa-jeunes/', desc: 'Prime < 30 ans' },
                { l: '⚠ MonBEE — deadline 01/06/2026', url: 'https://environnement.brussels/monbee', desc: 'Primes énergie bruxelloises' },
              ]},
              { cat: '📋 Réglementations & Barèmes', color: '#a78bfa', links: [
                { l: 'CCT 43/15 — RMMMG officiel', url: 'https://www.cnt-nar.be/CCT-ORIG/cct-043-15.pdf', desc: '2.070,48 EUR — texte CCT complet' },
                { l: 'ONSS — Cotisations 2026', url: 'https://www.socialsecurity.be/site_fr/employer/general/contributions/index.htm', desc: 'Taux patronaux, réductions' },
                { l: 'Fedris — Accidents du travail', url: 'https://www.fedris.be', desc: 'Taux cotisation AT par secteur' },
                { l: 'SPF ETCS — Barèmes salaires CP', url: 'https://emploi.belgique.be/fr/themes/remunerations/baremes-de-salaires', desc: '228 CP — barèmes officiels' },
              ]},
              { cat: '🔌 Outils Administratifs', color: '#f97316', links: [
                { l: 'BCE.be — Banque-Carrefour', url: 'https://economie.fgov.be/fr/themes/entreprises/banque-carrefour-des/rechercher-dans-la-banque', desc: 'Vérifier BCE, statuts, mandats' },
                { l: 'Peppol — Facturation électronique', url: 'https://peppol.eu', desc: 'ID Aureus : 0208:1028230781' },
                { l: 'Isabel 6 — Virements SEPA', url: 'https://www.isabel.eu', desc: 'Paiements SEPA pain.001' },
                { l: 'APD — Protection données', url: 'https://www.autoriteprotectiondonnees.be', desc: 'RGPD — plainte, DPA' },
              ]},
              { cat: '📊 Références Salariales', color: '#ec4899', links: [
                { l: 'RMMMG — CCT 43 coordonnée', url: 'https://www.cnt-nar.be/CCT-COORD/cct-043.pdf', desc: 'Évolutions historiques RMMMG' },
                { l: 'Statbel — Statistiques salariales', url: 'https://statbel.fgov.be/fr/themes/emploi-formation/salaires', desc: 'Données officielles salaires BE' },
                { l: 'SPF ETCS — Législation emploi', url: 'https://emploi.belgique.be/fr', desc: 'Contrats types, loi 03/07/1978' },
                { l: 'Moniteur Belge', url: 'https://www.ejustice.just.fgov.be/cgi/welcome.pl', desc: 'Législation officielle belge' },
              ]},
            ].map((section, si) => (
              <C key={si} style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: section.color, marginBottom: 10 }}>{section.cat}</div>
                {section.links.map((lnk, li) => (
                  <div key={li} style={{ padding: '7px 0',
                    borderBottom: li < section.links.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <a href={lnk.url} target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, fontWeight: 600, color: section.color,
                        textDecoration: 'none', display: 'block', marginBottom: 2 }}>
                      {lnk.l} ↗
                    </a>
                    <div style={{ fontSize: 10, color: '#555' }}>{lnk.desc}</div>
                  </div>
                ))}
              </C>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
