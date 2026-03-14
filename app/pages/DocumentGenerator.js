'use client';
import { useLang } from '../lib/lang-context';
import { B } from '@/app/lib/helpers';

// ═══════════════════════════════════════════════════════
//  AUREUS SOCIAL PRO — Module: Générateur de Documents
//  Génération de contrats, attestations, C4, certificats
//  Templates conformes au droit du travail belge
// ═══════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from 'react'
import { openForPDF } from '@/app/lib/doc-generators'

const GOLD = '#c6a34e'
const DARK = '#0d1117'
const BORDER = '#1e2633'
const TEXT = '#e0e0e0'
const MUTED = '#8b95a5'

// ── Types de documents ──
const DOC_TYPES = {
  CONTRAT_CDI: {
    label:'Contrat CDI',
    category: 'contrat',
    icon: '📄',
    description: 'Contrat à durée indéterminée — employé ou ouvrier',
    required: ['name', 'startDate', 'salary', 'function', 'cp'],
  },
  CONTRAT_CDD: {
    label:'Contrat CDD',
    category: 'contrat',
    icon: '📄',
    description: 'Contrat à durée déterminée',
    required: ['name', 'startDate', 'endDate', 'salary', 'function', 'cp'],
  },
  CONTRAT_STUDENT: {
    label:'Convention étudiant',
    category: 'contrat',
    icon: '🎓',
    description: 'Convention d\'occupation étudiant — max 600 h/an, cotisations réduites 2,71 %',
    required: ['name', 'startDate', 'endDate', 'salary'],
  },
  AVENANT: {
    label:'Avenant au contrat',
    category: 'contrat',
    icon: '📝',
    description: 'Modification du contrat de travail existant',
    required: ['name', 'modification'],
  },
  CONVENTION_RUPTURE: {
    label:'Convention de rupture',
    category: 'sortie',
    icon: '🤝',
    description: 'Rupture d\'un commun accord — pas de préavis (Art. 32 Loi 03/07/1978)',
    required: ['name', 'endDate'],
  },
  CONTRAT_TEMPS_PARTIEL: {
    label:'Contrat temps partiel',
    category: 'contrat',
    icon: '📄',
    description: 'AR 25/06/1990 — Mentions obligatoires: régime, horaire',
    required: ['name', 'startDate', 'salary', 'function', 'hoursPerWeek'],
  },
  ATTESTATION_EMPLOI: {
    label: 'Attestation d\'emploi',
    category: 'attestation',
    icon: '✅',
    description: 'Certificat confirmant l\'emploi actuel du travailleur',
    required: ['name', 'startDate', 'function'],
  },
  ATTESTATION_SALAIRE: {
    label:'Attestation de salaire',
    category: 'attestation',
    icon: '💰',
    description: 'Attestation du montant du salaire (pour banque, propriétaire, etc.)',
    required: ['name', 'salary'],
  },
  C4: {
    label:'Formulaire C4',
    category: 'sortie',
    icon: '🔴',
    description: 'Certificat de chômage — fin de contrat',
    required: ['name', 'startDate', 'endDate', 'motif'],
  },
  PREAVIS: {
    label:'Lettre de préavis',
    category: 'sortie',
    icon: '⏳',
    description: 'Notification de préavis selon la loi belge',
    required: ['name', 'startDate', 'noticeWeeks'],
  },
  REGLEMENT_TRAVAIL: {
    label:'Règlement de travail',
    category: 'reglementaire',
    icon: '📋',
    description: 'Règlement de travail conforme à la loi du 8 avril 1965',
    required: ['companyName'],
  },
  ATTESTATION_VACANCES: {
    label:'Attestation de vacances',
    category: 'attestation',
    icon: '🏖',
    description: 'Attestation de vacances annuelles (pécule)',
    required: ['name', 'year'],
  },
}

const CATEGORIES = {
  contrat: { label:'Contrats', icon: '📄', color: '#3b82f6' },
  attestation: { label:'Attestations', icon: '✅', color: '#22c55e' },
  sortie: { label:'Sortie / Fin contrat', icon: '🔴', color: '#ef4444' },
  reglementaire: { label:'Réglementaire', icon: '📋', color: '#f59e0b' },
}

// Types « contrat de travail » (layout avec logo + références légales)
const CONTRACT_TYPES = ['CONTRAT_CDI', 'CONTRAT_CDD', 'CONTRAT_STUDENT', 'CONTRAT_TEMPS_PARTIEL', 'AVENANT', 'CONVENTION_RUPTURE']

const REFERENCE_LOIS = [
  { abbr: 'Loi du 3 juillet 1978', full: 'Loi relative aux contrats de travail (M.B. 22 août 1978)', arts: 'Art. 2, 7, 11, 32' },
  { abbr: 'Loi du 26 décembre 2013', full: 'Statut unique — préavis', arts: 'Art. 67 à 82' },
  { abbr: 'AR du 25 juin 1990', full: 'Temps partiel, équipes, week-end', arts: 'Mentions obligatoires' },
  { abbr: 'Loi du 8 avril 1965', full: 'Règlement de travail', arts: 'Art. 3 et suivants' },
  { abbr: 'Code civil', full: 'Obligations contractuelles', arts: 'Art. 1134' },
  { abbr: 'CCT et CP', full: 'Conventions collectives et commission paritaire', arts: 'Conformité CP' },
]

function escapeHtml(s) {
  if (s == null || s === '') return ''
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildContractHTML(type, data) {
  const company = data.company || {}
  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })
  const coName = escapeHtml(company.name || 'ENTREPRISE')
  const coAddr = escapeHtml(company.address || '___')
  const coBce = escapeHtml(company.bce || 'N/A')
  const coOnss = escapeHtml(company.onss || 'N/A')
  const coCity = escapeHtml(company.city || 'Bruxelles')
  const coZip = escapeHtml(company.zip || '')
  const cp = escapeHtml(data.cp || company.cp || '200')
  const workerName = escapeHtml(data.name || '___')
  const workerFirst = workerName.split(' ')[0] || workerName
  const workerAddr = escapeHtml(data.address || '___')
  const workerNiss = escapeHtml(data.niss || '___')
  const workerBirth = escapeHtml(data.birthDate || '___')
  const workerFn = escapeHtml(data.function || '___')
  const startDate = escapeHtml(data.startDate || '___')
  const endDate = escapeHtml(data.endDate || '___')
  const salary = escapeHtml(String(data.salary || '___'))
  const hours = escapeHtml(String(data.hoursPerWeek || '38'))
  const regime = parseFloat(data.regime || 100)
  const regimePct = regime < 100 ? `${regime}%` : '100%'
  const regimeLabel = regime < 100 ? `temps partiel à ${regime}%` : 'temps plein'
  const workplace = escapeHtml(data.workplace || company.address || coAddr)
  const signatory = escapeHtml(company.signatoryName || 'le/la Gérant(e)')
  const signatoryTitle = escapeHtml(company.signatoryTitle || 'Gérant(e)')
  const motifCDD = escapeHtml(data.reason || data.motifcdd || '[motif du recours au CDD à préciser conformément à l\'article 10 de la loi du 3 juillet 1978]')
  const nonConc = data.nonCompete && data.nonCompete !== 'non'
  const mealV = data.mealVouchers ? escapeHtml(String(data.mealVouchers)) : null
  const schedule = escapeHtml(data.schedule || 'selon les plannings communiqués par l\'Employeur avec un préavis raisonnable')
  const logoUrl = company.logoUrl || company.logo || ''
  const noticeEmp = calculateNotice(data.startDate, true)
  const noticeTrav = calculateNotice(data.startDate, false)

  const CSS = `
    @page {
      margin: 25mm 20mm 20mm 25mm;
      size: A4;
      @bottom-center {
        content: "— " counter(page) " —";
        font-size: 9pt;
        color: #888;
        font-family: Georgia, serif;
      }
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.75;
      color: #1a1a1a;
      padding: 24px 32px;
      max-width: 210mm;
      margin: 0 auto;
      counter-reset: page;
    }
    /* En-tête institutionnel */
    .header-band {
      background: #0d1117;
      color: #c6a34e;
      padding: 14px 24px;
      margin: -24px -32px 0 -32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-band-left { display: flex; align-items: center; gap: 16px; }
    .header-logo { max-height: 44px; max-width: 120px; object-fit: contain; }
    .header-company-name { font-size: 14pt; font-weight: 700; letter-spacing: 0.5px; }
    .header-company-sub { font-size: 8pt; color: #a89060; margin-top: 2px; font-weight: 400; }
    .header-ref { text-align: right; font-size: 8pt; color: #a89060; line-height: 1.5; }
    /* Séparateur doré */
    .gold-rule { height: 3px; background: linear-gradient(90deg, #c6a34e, #e8c97a, #c6a34e); margin: 0 -32px 28px -32px; }
    .gold-rule-thin { height: 1px; background: #c6a34e; margin: 20px 0; opacity: 0.4; }
    /* Titre du document */
    .doc-title-block {
      text-align: center;
      margin: 28px 0 24px;
      padding: 20px;
      border: 2px solid #c6a34e;
      border-radius: 2px;
    }
    .doc-title {
      font-size: 16pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #0d1117;
    }
    .doc-subtitle {
      font-size: 9pt;
      color: #666;
      font-style: italic;
      margin-top: 6px;
      line-height: 1.5;
    }
    .doc-ref {
      font-size: 8.5pt;
      color: #999;
      margin-top: 8px;
    }
    /* Bloc parties */
    .parties-section {
      margin: 24px 0;
      padding: 0;
    }
    .parties-intro {
      font-size: 10.5pt;
      color: #555;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ddd;
    }
    .partie-block {
      margin-bottom: 18px;
      padding: 14px 18px;
      background: #f9f8f5;
      border-left: 4px solid #c6a34e;
      border-radius: 0 4px 4px 0;
    }
    .partie-block p { margin-bottom: 4px; line-height: 1.65; font-size: 10.5pt; }
    .partie-label {
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #c6a34e;
      margin-bottom: 8px;
    }
    .convenu-intro {
      font-weight: 700;
      font-size: 11pt;
      text-align: center;
      margin: 28px 0 24px;
      padding: 12px;
      background: #f5f3ee;
      border-top: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
      letter-spacing: 0.5px;
    }
    /* Articles */
    .article {
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .article-header {
      font-size: 11pt;
      font-weight: 700;
      color: #0d1117;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e8c97a;
      letter-spacing: 0.3px;
    }
    .article-header span {
      color: #c6a34e;
      margin-right: 6px;
    }
    .article-body {
      font-size: 10.5pt;
      line-height: 1.8;
      text-align: justify;
      hyphens: auto;
      color: #1a1a1a;
    }
    .article-body p { margin-bottom: 10px; }
    .article-body p:last-child { margin-bottom: 0; }
    .article-body .sub-clause {
      margin: 8px 0 8px 20px;
      padding-left: 12px;
      border-left: 2px solid #ddd;
      font-size: 10pt;
      color: #333;
    }
    /* Encadrés */
    .encadre-info {
      background: #fefdf8;
      border: 1px solid #e8c97a;
      border-radius: 3px;
      padding: 12px 16px;
      margin: 12px 0;
      font-size: 9.5pt;
      color: #5a4a1a;
      line-height: 1.6;
    }
    .encadre-warn {
      background: #fff8f0;
      border: 1px solid #f0c060;
      border-left: 4px solid #f0a000;
      border-radius: 0 3px 3px 0;
      padding: 10px 14px;
      margin: 12px 0;
      font-size: 9.5pt;
      color: #5a3a00;
      line-height: 1.6;
    }
    .mention-ref {
      font-size: 8.5pt;
      color: #888;
      font-style: italic;
      margin-top: 6px;
      line-height: 1.5;
    }
    /* Saut de page */
    .page-break { page-break-before: always; }
    /* Signatures */
    .signatures-section {
      margin-top: 36px;
      padding-top: 24px;
      border-top: 2px solid #c6a34e;
      page-break-inside: avoid;
    }
    .signatures-intro {
      font-size: 10.5pt;
      text-align: justify;
      margin-bottom: 20px;
      line-height: 1.7;
    }
    .signatures-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-top: 12px;
    }
    .sig-box { }
    .sig-label { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #c6a34e; margin-bottom: 6px; }
    .sig-name { font-size: 11pt; font-weight: 700; color: #0d1117; margin-bottom: 2px; }
    .sig-title { font-size: 9pt; color: #666; margin-bottom: 4px; }
    .sig-mention { font-size: 8pt; color: #888; font-style: italic; margin-bottom: 36px; }
    .sig-line { border-top: 1px solid #333; padding-top: 4px; font-size: 8pt; color: #888; }
    .sig-exemplaire {
      margin-top: 20px;
      font-size: 9pt;
      color: #666;
      font-style: italic;
      text-align: center;
      padding: 8px;
      border: 1px dashed #ccc;
    }
    /* Footer légal */
    .legal-footer {
      margin-top: 32px;
      padding: 16px 20px;
      background: #f5f3ee;
      border-top: 1px solid #ddd;
      font-size: 8pt;
      color: #777;
      line-height: 1.6;
    }
    .legal-footer-title { font-weight: 700; color: #555; margin-bottom: 6px; font-size: 8.5pt; }
    .legal-footer-refs { margin-bottom: 6px; }
    .legal-footer-gen { color: #aaa; font-style: italic; }
    /* Barre d'impression */
    .print-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #0d1117;
      color: #c6a34e;
      padding: 8px 20px;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 9999;
      font-family: -apple-system, sans-serif;
    }
    .print-btn {
      padding: 6px 18px;
      background: #c6a34e;
      color: #000;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
    }
    @media print {
      .print-bar { display: none !important; }
      body { padding-top: 0 !important; }
      .header-band { margin-top: 0; }
    }
    body { padding-top: 52px; }
  `

  // ── Blocs communs ──────────────────────────────────────────
  const printBar = `<div class="print-bar">
    <span>📄 <strong>Aureus Social Pro</strong> — Document confidentiel · ${coName} · ${dateStr}</span>
    <button class="print-btn" onclick="window.print()">🖨️ Imprimer / Enregistrer PDF</button>
  </div>`

  const headerBand = `<div class="header-band">
    <div class="header-band-left">
      ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" class="header-logo" alt="Logo ${coName}" />` : ''}
      <div>
        <div class="header-company-name">${coName}</div>
        <div class="header-company-sub">BCE ${coBce} &nbsp;·&nbsp; ONSS ${coOnss} &nbsp;·&nbsp; CP n° ${cp}</div>
      </div>
    </div>
    <div class="header-ref">
      <div>${coAddr}</div>
      <div style="margin-top:2px;">Document généré le ${dateStr}</div>
      <div style="margin-top:2px;color:#777;">Aureus Social Pro</div>
    </div>
  </div>
  <div class="gold-rule"></div>`

  const signaturesBlock = (extraMention) => `<div class="signatures-section">
    <p class="signatures-intro">
      Fait en double exemplaire à ${coCity}, le ${dateStr}. Chaque partie reconnaît avoir pris connaissance de l'intégralité du présent contrat, en avoir compris toutes les dispositions et l'accepter sans réserve. Le/la Travailleur(euse) reconnaît avoir reçu son exemplaire original signé.
    </p>
    ${extraMention ? `<div class="encadre-info">${extraMention}</div>` : ''}
    <div class="signatures-grid">
      <div class="sig-box">
        <div class="sig-label">Pour l'Employeur</div>
        <div class="sig-name">${coName}</div>
        <div class="sig-title">${signatory}, ${signatoryTitle}</div>
        <div class="sig-mention">Signature précédée du cachet de la société</div>
        <div class="sig-line">Signature :</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Le/La Travailleur(euse)</div>
        <div class="sig-name">${workerName}</div>
        <div class="sig-title">NISS : ${workerNiss}</div>
        <div class="sig-mention">Précédée de la mention manuscrite <em>« Lu et approuvé, bon pour accord »</em></div>
        <div class="sig-line">Signature :</div>
      </div>
    </div>
    <div class="sig-exemplaire">✓ Chaque partie reconnaît avoir reçu un exemplaire original du présent contrat.</div>
  </div>`

  const legalFooter = (refs) => `<div class="legal-footer">
    <div class="legal-footer-title">Références légales applicables au présent contrat :</div>
    <div class="legal-footer-refs">${refs}</div>
    <div class="legal-footer-gen">Document généré automatiquement par Aureus Social Pro (aureussocial.be) · AUREUS IA SPRL · BCE BE 1028.230.781 · Les données du présent contrat sont traitées conformément au RGPD (UE) 2016/679 et à la loi belge du 30 juillet 2018 relative à la protection des personnes physiques à l'égard des traitements de données à caractère personnel.</div>
  </div>`

  // ══════════════════════════════════════════════════════════════════════
  // CDI
  // ══════════════════════════════════════════════════════════════════════
  if (type === 'CONTRAT_CDI') {
    const body = `
    <div class="doc-title-block">
      <div class="doc-title">Contrat de travail<br/>à durée indéterminée</div>
      <div class="doc-subtitle">Conclu en application de la loi du 3 juillet 1978 relative aux contrats de travail,<br/>telle que modifiée par la loi du 26 décembre 2013 instaurant le statut unique.</div>
      <div class="doc-ref">Référence : CDI · ${workerName} · Entrée : ${startDate}</div>
    </div>

    <div class="parties-section">
      <div class="parties-intro">Entre les soussignés</div>
      <div class="partie-block">
        <div class="partie-label">L'Employeur</div>
        <p><strong>${coName}</strong>, société de droit belge, dont le siège social est établi à <strong>${coAddr}</strong>, inscrite à la Banque-Carrefour des Entreprises sous le numéro <strong>${coBce}</strong>, enregistrée à l'Office National de Sécurité Sociale sous le numéro patronal <strong>${coOnss}</strong>, ressortissant de la Commission Paritaire n° <strong>${cp}</strong>, représentée aux fins du présent acte par <strong>${signatory}</strong>, agissant en sa qualité de <strong>${signatoryTitle}</strong>, dûment habilité(e) à cet effet ;</p>
        <p>ci-après dénommée <strong>« l'Employeur »</strong> ;</p>
      </div>
      <div class="partie-block">
        <div class="partie-label">Le/La Travailleur(euse)</div>
        <p><strong>${workerName}</strong>, né(e) le <strong>${workerBirth}</strong>, domicilié(e) à <strong>${workerAddr}</strong>, titulaire du numéro de registre national (NISS) <strong>${workerNiss}</strong> ;</p>
        <p>ci-après dénommé(e) <strong>« le/la Travailleur(euse) »</strong> ;</p>
      </div>
    </div>

    <div class="convenu-intro">Il a été convenu et arrêté ce qui suit</div>

    <div class="article">
      <div class="article-header"><span>Article 1.</span>Objet du contrat et engagement</div>
      <div class="article-body">
        <p>L'Employeur engage le/la Travailleur(euse) en qualité de <strong>${workerFn}</strong>, avec le statut de <strong>${escapeHtml(data.statut === 'OUV' ? 'Ouvrier / Ouvrière' : data.statut === 'DIR' ? 'Dirigeant(e) d\'entreprise' : 'Employé(e)')}</strong>, sous la Commission Paritaire n° <strong>${cp}</strong>. Le/la Travailleur(euse) accepte cet engagement aux conditions définies ci-après et déclare avoir pris connaissance de l'ensemble des obligations qui en découlent.</p>
        <p>La présente convention a été librement conclue entre des parties ayant toute capacité de contracter et constitue la loi des parties, conformément à l'article 1134 du Code civil belge, sous réserve des dispositions impératives de la loi du 3 juillet 1978 et des conventions collectives de travail applicables.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 2.</span>Nature et durée du contrat</div>
      <div class="article-body">
        <p>Le présent contrat est conclu pour une <strong>durée indéterminée</strong> et prend cours le <strong>${startDate}</strong>. Il lie les parties sans limitation dans le temps, jusqu'à sa résiliation dans les formes et conditions prévues par la loi du 3 juillet 1978 et la loi du 26 décembre 2013 relative à l'introduction d'un statut unique pour ouvriers et employés.</p>
        <p>Conformément à la loi du 26 décembre 2013 (article 67 de la loi du 3 juillet 1978, désormais abrogé), <strong>aucune période d'essai n'est applicable</strong> au présent contrat. Cette disposition est d'ordre public et ne peut faire l'objet d'aucune dérogation conventionnelle pour les contrats conclus postérieurement au 1er janvier 2014.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 3.</span>Fonction et lieu de travail</div>
      <div class="article-body">
        <p>Le/la Travailleur(euse) est engagé(e) pour exercer les fonctions de <strong>${workerFn}</strong>. Cette qualification correspond à la classification fonctionnelle en vigueur au sein de l'entreprise et au barème applicable sous la CP n° ${cp}.</p>
        <p>Le lieu de travail principal est fixé à : <strong>${workplace}</strong>. L'Employeur se réserve le droit de modifier le lieu de travail dans des circonstances raisonnables liées aux nécessités de l'entreprise, moyennant un préavis approprié et dans le respect des dispositions légales. Le télétravail structurel est possible selon accord individuel distinct, conformément à la convention collective de travail n° 149 du 26 janvier 2021 et à la loi du 3 octobre 2022 réglementant le télétravail.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 4.</span>Durée du travail et horaires</div>
      <div class="article-body">
        <p>Le/la Travailleur(euse) est engagé(e) à <strong>${regimeLabel}</strong>, soit <strong>${hours} heures par semaine</strong>, conformément au régime de travail applicable dans l'entreprise. Les horaires spécifiques de travail sont définis dans le règlement de travail en vigueur et peuvent faire l'objet de plannings communiqués selon les besoins de l'entreprise.</p>
        <p>Toute prestation excédant la durée du travail conventionnellement définie constitue des heures supplémentaires au sens de la loi du 16 mars 1971, soumises au régime des sursalaires légaux (majoration de 50 % en semaine ordinaire et le samedi, de 100 % le dimanche et les jours fériés légaux). Les heures supplémentaires ne peuvent être effectuées qu'avec l'accord préalable de l'Employeur et dans les limites fixées par la loi et les conventions collectives applicables.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 5.</span>Rémunération</div>
      <div class="article-body">
        <p>En contrepartie des prestations fournies, le/la Travailleur(euse) percevra un salaire mensuel brut de <strong>${salary} € (euros bruts)</strong> pour un régime de travail de ${hours} heures par semaine, conformément au barème sectoriel applicable à la CP n° ${cp} et au revenu minimum mensuel moyen garanti (RMMMG) en vigueur.</p>
        <p>Ce salaire est payé le dernier jour ouvrable de chaque mois civil par virement bancaire SEPA sur le compte communiqué par le/la Travailleur(euse). Une fiche de paie détaillée, mentionnant l'ensemble des éléments de rémunération, est remise mensuellement conformément à l'arrêté royal du 28 octobre 1967 et à l'arrêté royal du 23 octobre 1978.</p>
        ${mealV ? `<div class="encadre-info">Avantage complémentaire : chèques-repas d'une valeur faciale de ${mealV} € par jour de prestation effective, dont la part patronale est fixée conformément aux maxima prévus par l'arrêté royal du 12 octobre 2010 (maximum 6,91 € en 2026) et la part personnelle du travailleur au minimum légal (1,09 €). Les chèques-repas sont exonérés de cotisations ONSS et d'impôt dans ces limites.</div>` : ''}
        ${data.carPolicy ? `<div class="encadre-info">Véhicule de société : une voiture de société est mise à disposition du/de la Travailleur(euse) selon les modalités de la politique véhicule (car policy) de l'entreprise. L'avantage de toute nature (ATN) correspondant est calculé conformément à l'article 36 du Code des impôts sur les revenus 1992 et mentionné mensuellement sur la fiche de paie et annuellement sur la fiche fiscale 281.10.</div>` : ''}
        <p class="mention-ref">À titre indicatif, sur base de la date d'entrée indiquée : délai de préavis employeur estimé ~${noticeEmp} semaines — délai travailleur estimé ~${noticeTrav} semaines. Ce calcul sera actualisé à la date effective de notification.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 6.</span>Congés annuels et jours fériés</div>
      <div class="article-body">
        <p>Le/la Travailleur(euse) bénéficie de vingt jours ouvrables de vacances annuelles payées pour une année de référence complète prestée à temps plein, conformément aux lois coordonnées du 28 juin 1971 relatives aux vacances annuelles des travailleurs salariés. Le droit est calculé au prorata du temps de travail et des prestations effectives de l'année de référence. Les dates de vacances sont fixées en concertation avec l'Employeur, en tenant compte des nécessités du service.</p>
        <p>Les dix jours fériés légaux énumérés par la loi du 4 janvier 1974 relative aux jours fériés sont accordés au/à la Travailleur(euse), sous réserve des dérogations sectorielles applicables. En cas de coïncidence d'un jour férié avec un dimanche ou un jour habituel d'inactivité, un jour de remplacement est accordé conformément à la législation en vigueur.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 7.</span>Incapacité de travail et maladie</div>
      <div class="article-body">
        <p>En cas d'incapacité de travail résultant d'une maladie ou d'un accident, le/la Travailleur(euse) est tenu(e) d'en informer l'Employeur avant 9 heures du matin le premier jour d'absence et de produire un certificat médical dans les deux jours ouvrables suivant le début de l'incapacité, ou dans le délai prévu par la convention collective sectorielle applicable.</p>
        <p>La rémunération garantie durant les périodes d'incapacité est versée conformément aux articles 52 à 56 de la loi du 3 juillet 1978, selon le statut du/de la Travailleur(euse). L'Employeur se réserve le droit de faire procéder à un contrôle médical par un médecin agréé, conformément à l'article 31bis de la loi du 3 juillet 1978 et à la convention collective de travail n° 19bis.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 8.</span>Résiliation du contrat et délais de préavis</div>
      <div class="article-body">
        <p>Le présent contrat peut être résilié par l'une ou l'autre des parties moyennant le respect d'un délai de préavis calculé conformément aux articles 37 à 40 de la loi du 3 juillet 1978, tels que modifiés par la loi du 26 décembre 2013 relative à l'introduction d'un statut unique. Le délai de préavis est déterminé sur la base de l'ancienneté acquise dans l'entreprise à la date de la notification, selon le barème progressif légal.</p>
        <p>En cas de non-respect du délai de préavis, la partie qui y met fin est tenue de verser à l'autre une indemnité compensatoire de préavis équivalente à la rémunération correspondant à la durée du préavis non presté, calculée conformément aux articles 39 et 39bis de la loi du 3 juillet 1978.</p>
        <p>Le présent contrat peut également être résilié sans préavis ni indemnité en cas de faute grave de l'une des parties, constituant un manquement grave rendant immédiatement et définitivement impossible toute collaboration professionnelle, conformément à l'article 35 de la loi du 3 juillet 1978. La partie invoquant le motif grave dispose de trois jours ouvrables pour notifier la rupture et de trois jours supplémentaires pour communiquer les motifs précis par lettre recommandée.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 9.</span>Confidentialité et secret professionnel</div>
      <div class="article-body">
        <p>Le/la Travailleur(euse) s'engage à observer le secret le plus absolu sur toutes les informations confidentielles auxquelles il/elle a accès dans le cadre de l'exercice de ses fonctions. Sont réputées confidentielles, sans que cette liste soit limitative : les informations techniques, commerciales, financières, stratégiques, les codes sources et algorithmes, les bases de données clients et fournisseurs, les tarifs, les procédés de fabrication ou de développement, ainsi que toute information expressément désignée comme confidentielle par l'Employeur.</p>
        <p>Cette obligation de confidentialité est d'application non seulement pendant la durée du contrat de travail, mais également après sa cessation pour quelque cause que ce soit, pour une durée de <strong>cinq ans</strong> à compter de la date de fin effective du contrat. La violation de cette obligation engage la responsabilité civile du/de la Travailleur(euse) et peut constituer un motif grave justifiant la résiliation immédiate du contrat.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 10.</span>Propriété intellectuelle</div>
      <div class="article-body">
        <p>L'ensemble des créations intellectuelles, inventions, développements logiciels, programmes informatiques, bases de données, algorithmes, œuvres audiovisuelles, textuelles ou graphiques, ainsi que tout autre résultat du travail intellectuel ou créatif réalisé par le/la Travailleur(euse) dans le cadre de l'exécution du présent contrat ou avec les ressources, outils ou informations mis à disposition par l'Employeur, est la propriété exclusive et intégrale de l'Employeur dès le moment de leur création.</p>
        <p>Cette cession de droits est globale, définitive et couvre l'ensemble des droits patrimoniaux, à titre exclusif, pour toutes les formes d'exploitation actuelles et futures, pour le monde entier et pour toute la durée légale de protection, conformément à la loi du 30 juin 1994 relative aux droits d'auteur et aux droits voisins (art. 3 et suivants), à la loi du 28 mars 1984 sur les brevets et au Code de droit économique.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 11.</span>Protection des données à caractère personnel</div>
      <div class="article-body">
        <p>Le/la Travailleur(euse) est informé(e) que l'Employeur traite ses données personnelles aux fins de gestion des ressources humaines, d'exécution du contrat de travail, de respect des obligations légales (ONSS, déclarations fiscales, Dimona) et d'intérêts légitimes de gestion interne, conformément au Règlement (UE) 2016/679 du 27 avril 2016 (RGPD) et à la loi belge du 30 juillet 2018 relative à la protection des personnes physiques à l'égard des traitements de données à caractère personnel.</p>
        <p>Dans le cadre de l'exercice de ses fonctions, le/la Travailleur(euse) s'engage à traiter avec la plus grande rigueur les données personnelles auxquelles il/elle a accès, en stricte conformité avec les instructions de l'Employeur, les politiques internes de protection des données et les dispositions du RGPD. Toute violation ou suspicion de violation de données doit être immédiatement portée à la connaissance de l'Employeur, conformément à l'article 33 du RGPD.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 12.</span>Exclusivité et obligations déontologiques</div>
      <div class="article-body">
        <p>Le/la Travailleur(euse) s'engage à consacrer l'intégralité de son activité professionnelle à l'Employeur durant l'exécution du présent contrat et à s'abstenir d'exercer, directement ou indirectement, sans autorisation écrite préalable de l'Employeur, toute activité professionnelle rémunérée ou non susceptible de concurrencer l'Employeur, de nuire à ses intérêts ou de compromettre l'exécution loyale du présent contrat, conformément à l'article 17 de la loi du 3 juillet 1978.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 13.</span>Règlement de travail</div>
      <div class="article-body">
        <p>Le/la Travailleur(euse) déclare avoir reçu un exemplaire du règlement de travail de l'Employeur, établi conformément à la loi du 8 avril 1965 instituant les règlements de travail, en avoir pris connaissance dans son intégralité et l'accepter sans réserve. Le règlement de travail constitue une annexe juridiquement contraignante du présent contrat et en fait partie intégrante. Toute modification ultérieure du règlement de travail fera l'objet de la procédure légale prévue par la loi du 8 avril 1965.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 14.</span>Bien-être au travail et prévention</div>
      <div class="article-body">
        <p>L'Employeur s'engage à prendre toutes les mesures nécessaires pour assurer la sécurité et la santé des travailleurs dans tous les aspects liés au travail, conformément au Code du bien-être au travail (loi du 4 août 1996 et ses arrêtés d'exécution). Le/la Travailleur(euse) est informé(e) de l'existence du Service Externe de Prévention et Protection au Travail (SEPP), de la personne de confiance et des procédures applicables en matière de prévention du harcèlement moral et sexuel au travail.</p>
      </div>
    </div>

    ${nonConc ? `
    <div class="article">
      <div class="article-header"><span>Article 15.</span>Clause de non-concurrence</div>
      <div class="article-body">
        <p>Conformément à l'article 65 de la loi du 3 juillet 1978, une clause de non-concurrence d'une durée de <strong>${escapeHtml(String(data.nonCompete))}</strong> à compter de la cessation effective du contrat de travail est stipulée au bénéfice de l'Employeur. Cette clause interdit au/à la Travailleur(euse), à l'expiration du contrat pour quelque cause que ce soit, d'exercer une activité similaire, que ce soit comme travailleur salarié ou indépendant, susceptible de nuire à l'Employeur.</p>
        <p>En contrepartie, l'Employeur s'engage à verser au/à la Travailleur(euse), dans les quinze jours suivant la fin du contrat, une indemnité compensatoire égale à la moitié de la rémunération brute correspondant à la durée de la clause, conformément à l'article 65 § 3 de la loi du 3 juillet 1978. L'Employeur se réserve le droit de renoncer à la clause dans les quinze jours suivant la fin du contrat, auquel cas aucune indemnité n'est due. La présente clause est nulle de plein droit si la rémunération annuelle brute du/de la Travailleur(euse) est inférieure au seuil légal en vigueur (43.335 € en 2026, indexé annuellement).</p>
      </div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 16.</span>Loi applicable et juridiction compétente</div>` : `
    <div class="article">
      <div class="article-header"><span>Article 15.</span>Loi applicable et juridiction compétente</div>`}
      <div class="article-body">
        <p>Le présent contrat de travail est régi exclusivement par le droit belge dans toutes ses dispositions. Tout litige relatif à la conclusion, l'interprétation, l'exécution ou la résiliation du présent contrat sera soumis à la compétence exclusive du Tribunal du travail de Bruxelles, sans préjudice de la compétence d'une juridiction d'appel et des voies de recours extraordinaires prévues par le Code judiciaire belge.</p>
      </div>
    </div>`

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CDI — ${workerName} — ${coName}</title><style>${CSS}</style></head><body>
    ${printBar}${headerBand}${body}
    ${signaturesBlock('Les parties certifient que le présent contrat a été établi en deux exemplaires originaux, dont chacun a reçu le sien. La signature du/de la Travailleur(euse) précédée de la mention manuscrite « Lu et approuvé, bon pour accord » vaut acceptation de l\'ensemble des clauses du présent contrat.')}
    ${legalFooter('Loi du 3 juillet 1978 relative aux contrats de travail · Loi du 26 décembre 2013 (statut unique) · Loi du 16 mars 1971 sur le travail · Lois coordonnées du 28 juin 1971 (vacances annuelles) · Loi du 4 janvier 1974 (jours fériés) · Loi du 8 avril 1965 (règlement de travail) · Loi du 4 août 1996 (bien-être au travail) · Loi du 30 juin 1994 (droits d\'auteur) · RGPD (UE) 2016/679 · Loi belge du 30 juillet 2018 (protection des données) · CCT n°149 (télétravail)')}
    </body></html>`
  }

  // ══════════════════════════════════════════════════════════════════════
  // CDD
  // ══════════════════════════════════════════════════════════════════════
  if (type === 'CONTRAT_CDD') {
    const body = `
    <div class="encadre-warn">⚖️ <strong>Avertissement légal :</strong> Le recours à un contrat de travail à durée déterminée est soumis à des conditions strictes fixées par l'article 10 de la loi du 3 juillet 1978. L'absence de motif valide ou le renouvellement irrégulier entraîne de plein droit la requalification du contrat en contrat à durée indéterminée. Le présent contrat doit impérativement mentionner le motif de recours au CDD.</div>

    <div class="doc-title-block">
      <div class="doc-title">Contrat de travail<br/>à durée déterminée</div>
      <div class="doc-subtitle">Conclu en application des articles 7 et 10 de la loi du 3 juillet 1978 relative aux contrats de travail.</div>
      <div class="doc-ref">Référence : CDD · ${workerName} · Du ${startDate} au ${endDate}</div>
    </div>

    <div class="parties-section">
      <div class="parties-intro">Entre les soussignés</div>
      <div class="partie-block">
        <div class="partie-label">L'Employeur</div>
        <p><strong>${coName}</strong>, société de droit belge, BCE <strong>${coBce}</strong>, ONSS <strong>${coOnss}</strong>, dont le siège social est établi à <strong>${coAddr}</strong>, représentée par <strong>${signatory}</strong>, <strong>${signatoryTitle}</strong>, dûment autorisé(e) ;</p>
        <p>ci-après dénommée <strong>« l'Employeur »</strong> ;</p>
      </div>
      <div class="partie-block">
        <div class="partie-label">Le/La Travailleur(euse)</div>
        <p><strong>${workerName}</strong>, né(e) le <strong>${workerBirth}</strong>, domicilié(e) à <strong>${workerAddr}</strong>, NISS : <strong>${workerNiss}</strong> ;</p>
        <p>ci-après dénommé(e) <strong>« le/la Travailleur(euse) »</strong> ;</p>
      </div>
    </div>

    <div class="convenu-intro">Il a été convenu et arrêté ce qui suit</div>

    <div class="article">
      <div class="article-header"><span>Article 1.</span>Objet et nature du contrat</div>
      <div class="article-body">
        <p>L'Employeur engage le/la Travailleur(euse) en qualité de <strong>${workerFn}</strong>, avec le statut de <strong>${escapeHtml(data.statut === 'OUV' ? 'Ouvrier / Ouvrière' : 'Employé(e)')}</strong>, sous la Commission Paritaire n° <strong>${cp}</strong>, dans le cadre d'un contrat de travail à durée déterminée, conformément aux articles 7 et 10 de la loi du 3 juillet 1978 relative aux contrats de travail.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 2.</span>Durée du contrat et motif du recours au CDD</div>
      <div class="article-body">
        <p>Le présent contrat prend cours le <strong>${startDate}</strong> et expire de plein droit le <strong>${endDate}</strong>, sans qu'il soit nécessaire de procéder à une quelconque notification préalable. La survenance du terme entraîne automatiquement la fin du lien contractuel.</p>
        <p><strong>Motif légal du recours au contrat à durée déterminée (art. 10 L. 3/07/1978) :</strong> ${motifCDD}.</p>
        <div class="encadre-info"><strong>Renouvellement :</strong> Le présent contrat ne peut être renouvelé que dans les strictes conditions prévues par l'article 10bis de la loi du 3 juillet 1978 : maximum trois renouvellements successifs, pour une durée totale n'excédant pas deux ans, sous peine de requalification automatique en contrat à durée indéterminée. Tout renouvellement doit faire l'objet d'un avenant écrit signé par les deux parties.</div>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 3.</span>Fonction et lieu de travail</div>
      <div class="article-body">
        <p>Le/la Travailleur(euse) exercera la fonction de <strong>${workerFn}</strong> au lieu de travail principal fixé à <strong>${workplace}</strong>. Des déplacements occasionnels pourront être requis selon les nécessités du service.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 4.</span>Durée du travail et horaires</div>
      <div class="article-body">
        <p>Le/la Travailleur(euse) est engagé(e) à <strong>${regimeLabel}</strong>, soit <strong>${hours} heures par semaine</strong>, selon les horaires définis dans le règlement de travail. Les heures supplémentaires éventuelles sont soumises aux règles prévues par la loi du 16 mars 1971 et les conventions collectives applicables.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 5.</span>Rémunération</div>
      <div class="article-body">
        <p>En contrepartie de ses prestations, le/la Travailleur(euse) percevra un salaire mensuel brut de <strong>${salary} € (euros bruts)</strong> pour un régime de ${hours} heures par semaine, conformément au barème sectoriel CP n° ${cp}. Ce salaire est payable le dernier jour ouvrable de chaque mois par virement bancaire.</p>
        ${mealV ? `<div class="encadre-info">Chèques-repas : ${mealV} € de valeur faciale par jour de prestation effective (part patronale dans les limites de l'AR du 12/10/2010).</div>` : ''}
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 6.</span>Résiliation anticipée du CDD</div>
      <div class="article-body">
        <p>Le présent contrat à durée déterminée ne peut être résilié avant son terme que dans les hypothèses limitativement prévues par la loi du 3 juillet 1978, à savoir :</p>
        <p class="sub-clause">Pour <strong>motif grave</strong> de l'une des parties (art. 35), constitutif d'un manquement grave rendant impossible toute collaboration professionnelle immédiate, sans préavis ni indemnité, sous réserve du respect de la procédure légale (notification dans les trois jours, communication des motifs par recommandé dans les trois jours suivants) ;</p>
        <p class="sub-clause">Moyennant le paiement d'une <strong>indemnité compensatoire</strong> égale à la rémunération restant à courir jusqu'au terme du contrat, limitée au double de la rémunération due en cas de résiliation d'un contrat à durée indéterminée de même ancienneté, conformément à l'article 40 de la loi du 3 juillet 1978.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 7.</span>Congés annuels, jours fériés et maladie</div>
      <div class="article-body">
        <p>Les droits aux vacances annuelles sont calculés au prorata des jours effectivement travaillés ou assimilés, conformément aux lois coordonnées du 28 juin 1971. Les jours fériés légaux sont accordés conformément à la loi du 4 janvier 1974. En cas d'incapacité de travail, la rémunération garantie est versée selon les règles de la loi du 3 juillet 1978.</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 8.</span>Confidentialité, PI, RGPD et obligations déontologiques</div>
      <div class="article-body">
        <p>Le/la Travailleur(euse) est tenu(e) au secret professionnel le plus strict durant et après l'exécution du présent contrat. L'ensemble des créations réalisées dans le cadre du contrat sont la propriété exclusive de l'Employeur (loi 30/06/1994). Le traitement des données personnelles s'effectue conformément au RGPD (UE) 2016/679. Le/la Travailleur(euse) déclare avoir reçu et accepté le règlement de travail (loi 8/04/1965).</p>
      </div>
    </div>

    <div class="article">
      <div class="article-header"><span>Article 9.</span>Loi applicable et juridiction</div>
      <div class="article-body">
        <p>Le présent contrat est régi par le droit belge. Tout litige relatif à son exécution ou à sa résiliation sera soumis à la compétence exclusive du Tribunal du travail de Bruxelles.</p>
      </div>
    </div>`

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CDD — ${workerName} — ${coName}</title><style>${CSS}</style></head><body>
    ${printBar}${headerBand}${body}
    ${signaturesBlock(null)}
    ${legalFooter('Loi du 3 juillet 1978 (art. 7 et 10 — CDD) · Loi du 26 décembre 2013 · Lois coordonnées 28 juin 1971 · Loi du 4 janvier 1974 · RGPD (UE) 2016/679')}
    </body></html>`
  }

  // ══════════════════════════════════════════════════════════════════════
  // CONTRAT ÉTUDIANT
  // ══════════════════════════════════════════════════════════════════════
  if (type === 'CONTRAT_STUDENT') {
    const hourlyRate = escapeHtml(String(data.hourlyRate || data.salary || '___'))
    const body = `
    <div class="doc-title-block">
      <div class="doc-title">Convention d'occupation étudiant</div>
      <div class="doc-subtitle">Conclue en application du Titre VII de la loi du 3 juillet 1978 relative aux contrats de travail<br/>et de l'arrêté royal du 8 mars 2023 fixant les mentions obligatoires.</div>
      <div class="doc-ref">Référence : Étudiant · ${workerName} · Du ${startDate} au ${endDate}</div>
    </div>

    <div class="encadre-info">📚 <strong>Régime spécial de cotisations sociales :</strong> Dans la limite de 600 heures par année civile, les cotisations sociales sont réduites à 2,71 % (travailleur) et 5,42 % (employeur), au lieu des taux normaux. Au-delà de ce contingent annuel, les cotisations ordinaires s'appliquent. L'étudiant peut consulter son contingent disponible sur <strong>www.student.be</strong>.</div>

    <div class="parties-section">
      <div class="parties-intro">Entre les soussignés</div>
      <div class="partie-block">
        <div class="partie-label">L'Employeur</div>
        <p><strong>${coName}</strong>, BCE <strong>${coBce}</strong>, ONSS <strong>${coOnss}</strong>, ${coAddr}, représenté(e) par <strong>${signatory}</strong>, <strong>${signatoryTitle}</strong> — ci-après <strong>« l'Employeur »</strong>.</p>
      </div>
      <div class="partie-block">
        <div class="partie-label">L'Étudiant(e)</div>
        <p><strong>${workerName}</strong>, né(e) le <strong>${workerBirth}</strong>, domicilié(e) à <strong>${workerAddr}</strong>, NISS : <strong>${workerNiss}</strong> — ci-après <strong>« l'Étudiant(e) »</strong>.</p>
      </div>
    </div>

    <div class="convenu-intro">Il a été convenu ce qui suit</div>

    <div class="article">
      <div class="article-header"><span>Article 1.</span>Objet de la convention</div>
      <div class="article-body"><p>L'Employeur occupe l'Étudiant(e) en qualité de <strong>${workerFn}</strong> dans le cadre d'une convention d'occupation étudiant régie par le Titre VII de la loi du 3 juillet 1978 et l'AR du 8 mars 2023. L'Étudiant(e) confirme être régulièrement inscrit(e) dans un établissement d'enseignement reconnu.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 2.</span>Durée de la convention <em>(mention obligatoire — AR 8 mars 2023)</em></div>
      <div class="article-body"><p>La présente convention est conclue pour la période du <strong>${startDate}</strong> au <strong>${endDate}</strong> inclus. Elle prend fin de plein droit à l'expiration du terme convenu.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 3.</span>Lieu de travail <em>(mention obligatoire)</em></div>
      <div class="article-body"><p>Le lieu de travail est : <strong>${workplace}</strong>.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 4.</span>Fonction <em>(mention obligatoire)</em></div>
      <div class="article-body"><p>L'Étudiant(e) est occupé(e) en qualité de : <strong>${workerFn}</strong>.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 5.</span>Rémunération et mode de paiement <em>(mention obligatoire)</em></div>
      <div class="article-body"><p>La rémunération est fixée à <strong>${hourlyRate} € brut par heure</strong>, conformément au barème sectoriel applicable à la CP n° ${cp}. Le paiement s'effectue le dernier jour ouvrable de chaque mois par virement bancaire.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 6.</span>Horaire de travail <em>(mention obligatoire)</em></div>
      <div class="article-body"><p><strong>${hours} heures par semaine</strong>. Répartition : ${schedule}.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 7.</span>Délai de préavis <em>(mention obligatoire — art. 120 L. 3/07/1978)</em></div>
      <div class="article-body"><p>Durant les sept premiers jours calendriers d'exécution de la convention : <strong>3 jours calendriers</strong>. Après ces sept premiers jours : <strong>7 jours calendriers</strong>. La notification s'effectue par lettre recommandée ou remise en main propre contre accusé de réception signé.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 8.</span>Cotisations de solidarité réduites — Contingent 600 heures</div>
      <div class="article-body">
        <p>L'Étudiant(e) bénéficie du régime de cotisations réduites (2,71 % à charge du travailleur, 5,42 % à charge de l'employeur) dans la limite globale de <strong>600 heures par année civile</strong> (art. 17bis de l'arrêté royal du 28 novembre 1969, tel que modifié). L'Employeur déclarera les heures prestées via la Déclaration multifonctionnelle (DmfA) trimestrielle à l'ONSS.</p>
        <p>L'Étudiant(e) déclare avoir été informé(e) de son droit de consulter son contingent disponible sur www.student.be et certifie que l'occupation dans le cadre de la présente convention n'entraîne pas un dépassement du plafond de 600 heures.</p>
      </div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 9.</span>Obligations, règlement de travail et protection des données</div>
      <div class="article-body"><p>L'Étudiant(e) déclare avoir reçu et accepter le règlement de travail (loi 8/04/1965) et s'engage au respect des instructions de l'Employeur, au secret professionnel et à la confidentialité. Le traitement des données personnelles est effectué conformément au RGPD (UE) 2016/679.</p></div>
    </div>`

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Convention étudiant — ${workerName} — ${coName}</title><style>${CSS}</style></head><body>
    ${printBar}${headerBand}${body}
    ${signaturesBlock('L\'Étudiant(e) confirme sa qualité d\'étudiant(e) régulièrement inscrit(e) et son engagement à informer l\'Employeur de tout changement susceptible d\'affecter l\'application du régime des cotisations réduites.')}
    ${legalFooter('Loi du 3 juillet 1978 Titre VII (convention étudiant) · AR du 8 mars 2023 (mentions obligatoires) · Art. 17bis AR 28/11/1969 (cotisations réduites) · Loi du 25 décembre 2016 · RGPD (UE) 2016/679')}
    </body></html>`
  }

  // ══════════════════════════════════════════════════════════════════════
  // TEMPS PARTIEL
  // ══════════════════════════════════════════════════════════════════════
  if (type === 'CONTRAT_TEMPS_PARTIEL') {
    const body = `
    <div class="doc-title-block">
      <div class="doc-title">Contrat de travail<br/>à temps partiel</div>
      <div class="doc-subtitle">Conclu en application de l'article 11bis de la loi du 3 juillet 1978<br/>et de l'arrêté royal du 25 juin 1990 relatif au travail à temps partiel.</div>
      <div class="doc-ref">Référence : Temps partiel · ${workerName} · ${regimePct} · Entrée : ${startDate}</div>
    </div>

    <div class="encadre-warn">📋 <strong>Mention obligatoire (art. 11bis al.4 L. 3/07/1978) :</strong> L'horaire de travail convenu doit impérativement figurer dans le contrat écrit. Toute modification de l'horaire exige un avenant signé par les deux parties.</div>

    <div class="parties-section">
      <div class="parties-intro">Entre les soussignés</div>
      <div class="partie-block">
        <div class="partie-label">L'Employeur</div>
        <p><strong>${coName}</strong>, BCE <strong>${coBce}</strong>, ONSS <strong>${coOnss}</strong>, ${coAddr}, CP n° ${cp}, représenté(e) par <strong>${signatory}</strong>, <strong>${signatoryTitle}</strong> — ci-après <strong>« l'Employeur »</strong>.</p>
      </div>
      <div class="partie-block">
        <div class="partie-label">Le/La Travailleur(euse)</div>
        <p><strong>${workerName}</strong>, né(e) le <strong>${workerBirth}</strong>, domicilié(e) à <strong>${workerAddr}</strong>, NISS : <strong>${workerNiss}</strong> — ci-après <strong>« le/la Travailleur(euse) »</strong>.</p>
      </div>
    </div>

    <div class="convenu-intro">Il a été convenu et arrêté ce qui suit</div>

    <div class="article">
      <div class="article-header"><span>Article 1.</span>Objet et engagement</div>
      <div class="article-body"><p>L'Employeur engage le/la Travailleur(euse) en qualité de <strong>${workerFn}</strong> (${escapeHtml(data.statut === 'OUV' ? 'Ouvrier/Ouvrière' : 'Employé(e)')}), CP n° ${cp}, dans le cadre d'un contrat de travail à <strong>durée indéterminée à temps partiel</strong>, conformément à l'article 11bis de la loi du 3 juillet 1978 et à l'arrêté royal du 25 juin 1990.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 2.</span>Régime de travail et horaire contractuel <em>(mention obligatoire — art. 11bis al.4)</em></div>
      <div class="article-body">
        <p>Le/la Travailleur(euse) est engagé(e) à temps partiel à raison de <strong>${hours} heures par semaine</strong>, soit <strong>${regimePct} d'un temps plein de référence</strong> (38 heures par semaine). L'horaire convenu entre les parties est le suivant : <strong>${schedule}</strong>.</p>
        <div class="encadre-info">Toute modification permanente ou structurelle de l'horaire contractuel ci-dessus doit faire l'objet d'un avenant écrit signé par les deux parties préalablement à sa mise en application, conformément à l'article 11bis alinéa 4 de la loi du 3 juillet 1978.</div>
      </div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 3.</span>Prise de cours et lieu de travail</div>
      <div class="article-body"><p>Le présent contrat prend cours le <strong>${startDate}</strong>. Conformément à la loi du 26 décembre 2013, aucune période d'essai n'est applicable. Le lieu de travail principal est : <strong>${workplace}</strong>.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 4.</span>Rémunération prorata temporis</div>
      <div class="article-body">
        <p>Le salaire mensuel brut est fixé à <strong>${salary} € brut</strong>, calculé au prorata du temps de travail convenu par rapport au temps plein de référence, conformément au barème sectoriel CP n° ${cp}. Tous les avantages légaux et conventionnels (pécule de vacances, prime de fin d'année, jours fériés) sont calculés et accordés au prorata du régime de travail.</p>
        ${mealV ? `<div class="encadre-info">Chèques-repas : ${mealV} € par jour de prestation complète uniquement (AR 12/10/2010).</div>` : ''}
      </div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 5.</span>Heures complémentaires</div>
      <div class="article-body"><p>Des heures complémentaires (dépassant l'horaire contractuel sans atteindre le temps plein) peuvent être demandées par l'Employeur dans les limites prévues par la loi et le règlement de travail. Les heures complémentaires dépassant d'un tiers l'horaire contractuel sont rémunérées avec un sursalaire de 50 %, conformément à l'article 11bis § 1 alinéa 3 de la loi du 3 juillet 1978.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 6.</span>Droit de priorité à un emploi à temps plein</div>
      <div class="article-body"><p>Le/la Travailleur(euse) à temps partiel bénéficie, conformément à l'article 11bis § 2 de la loi du 3 juillet 1978, d'un droit de priorité d'accès aux postes à temps plein vacants qui correspondent à ses qualifications. L'Employeur informera le/la Travailleur(euse) de toute vacance de poste à temps plein.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 7.</span>Confidentialité, propriété intellectuelle, RGPD et règlement de travail</div>
      <div class="article-body"><p>Le/la Travailleur(euse) est soumis(e) aux mêmes obligations de confidentialité, de propriété intellectuelle et de protection des données que dans un contrat à temps plein. Il/elle déclare avoir reçu et accepté le règlement de travail (loi 8/04/1965). Les délais de préavis sont calculés conformément à la loi du 26 décembre 2013.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 8.</span>Loi applicable</div>
      <div class="article-body"><p>Le présent contrat est régi par le droit belge. Tout litige relève de la compétence exclusive du Tribunal du travail de Bruxelles.</p></div>
    </div>`

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Temps partiel — ${workerName} — ${coName}</title><style>${CSS}</style></head><body>
    ${printBar}${headerBand}${body}
    ${signaturesBlock(null)}
    ${legalFooter('Loi du 3 juillet 1978 (art. 11bis) · AR du 25 juin 1990 (temps partiel) · Loi du 26 décembre 2013 · Lois coordonnées 28 juin 1971 · RGPD (UE) 2016/679')}
    </body></html>`
  }

  // ══════════════════════════════════════════════════════════════════════
  // AVENANT
  // ══════════════════════════════════════════════════════════════════════
  if (type === 'AVENANT') {
    const effDate = escapeHtml(data.effectiveDate || data.startDate || dateStr)
    const modif = escapeHtml(data.modification || '[modifications à décrire précisément]')
    const body = `
    <div class="doc-title-block">
      <div class="doc-title">Avenant au contrat de travail</div>
      <div class="doc-subtitle">Modification du contrat de travail par accord mutuel des parties<br/>conformément à l'article 1134 du Code civil belge.</div>
      <div class="doc-ref">Référence : Avenant · ${workerName} · Effet : ${effDate}</div>
    </div>
    <div class="parties-section">
      <div class="parties-intro">Entre les soussignés</div>
      <div class="partie-block">
        <div class="partie-label">L'Employeur</div>
        <p><strong>${coName}</strong>, BCE <strong>${coBce}</strong>, ${coAddr}, représenté(e) par <strong>${signatory}</strong>, <strong>${signatoryTitle}</strong>.</p>
      </div>
      <div class="partie-block">
        <div class="partie-label">Le/La Travailleur(euse)</div>
        <p><strong>${workerName}</strong>, domicilié(e) à <strong>${workerAddr}</strong>, NISS : <strong>${workerNiss}</strong>.</p>
      </div>
    </div>
    <div class="convenu-intro">Il a été convenu et arrêté ce qui suit</div>
    <div class="article">
      <div class="article-header"><span>Article 1.</span>Objet du présent avenant</div>
      <div class="article-body"><p>Le présent avenant a pour objet de modifier le contrat de travail conclu le <strong>${startDate}</strong> entre les parties. Les modifications ci-après prennent effet au <strong>${effDate}</strong>. Toutes les autres dispositions du contrat initial non expressément modifiées par le présent avenant demeurent inchangées et pleinement applicables.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 2.</span>Modifications convenues</div>
      <div class="article-body"><p>${modif}</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 3.</span>Accord libre et éclairé</div>
      <div class="article-body"><p>Les parties déclarent avoir librement consenti aux modifications prévues au présent avenant, en parfaite connaissance de cause et sans contrainte ni pression d'aucune sorte. Le/la Travailleur(euse) reconnaît avoir disposé du temps nécessaire pour réfléchir aux implications des modifications convenues et avoir eu la possibilité de consulter un conseiller juridique ou syndical.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 4.</span>Loi applicable</div>
      <div class="article-body"><p>Le présent avenant fait partie intégrante du contrat de travail initial et est soumis au droit belge. Tout litige relève de la compétence du Tribunal du travail de Bruxelles.</p></div>
    </div>`

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Avenant — ${workerName} — ${coName}</title><style>${CSS}</style></head><body>
    ${printBar}${headerBand}${body}
    ${signaturesBlock(null)}
    ${legalFooter('Art. 1134 Code civil · Loi du 3 juillet 1978 · Loi du 26 décembre 2013')}
    </body></html>`
  }

  // ══════════════════════════════════════════════════════════════════════
  // RUPTURE DE COMMUN ACCORD
  // ══════════════════════════════════════════════════════════════════════
  if (type === 'CONVENTION_RUPTURE') {
    const body = `
    <div class="encadre-warn">⚖️ <strong>Avertissement ONEM :</strong> La rupture du contrat de travail de commun accord peut entraîner une exclusion temporaire du droit aux allocations de chômage ou une réduction de celles-ci, conformément aux articles 44 à 52 de l'arrêté royal du 25 novembre 1991. Le/la Travailleur(euse) est vivement conseillé(e) de consulter son organisme de paiement ou un conseiller syndical avant de signer.</div>

    <div class="doc-title-block">
      <div class="doc-title">Convention de rupture<br/>du contrat de travail de commun accord</div>
      <div class="doc-subtitle">Conclue en application de l'article 32 de la loi du 3 juillet 1978 relative aux contrats de travail.</div>
      <div class="doc-ref">Référence : Rupture · ${workerName} · Fin : ${endDate}</div>
    </div>

    <div class="parties-section">
      <div class="parties-intro">Entre les soussignés</div>
      <div class="partie-block">
        <div class="partie-label">L'Employeur</div>
        <p><strong>${coName}</strong>, BCE <strong>${coBce}</strong>, ONSS <strong>${coOnss}</strong>, ${coAddr}, représenté(e) par <strong>${signatory}</strong>, <strong>${signatoryTitle}</strong> — ci-après <strong>« l'Employeur »</strong>.</p>
      </div>
      <div class="partie-block">
        <div class="partie-label">Le/La Travailleur(euse)</div>
        <p><strong>${workerName}</strong>, né(e) le <strong>${workerBirth}</strong>, domicilié(e) à <strong>${workerAddr}</strong>, NISS : <strong>${workerNiss}</strong> — ci-après <strong>« le/la Travailleur(euse) »</strong>.</p>
      </div>
    </div>

    <div class="convenu-intro">Il a été convenu et arrêté ce qui suit</div>

    <div class="article">
      <div class="article-header"><span>Article 1.</span>Rupture amiable du contrat de travail</div>
      <div class="article-body"><p>Les parties conviennent, d'un commun accord librement et éclairément exprimé, de mettre fin au contrat de travail à durée indéterminée qui les unit depuis le <strong>${startDate}</strong>, avec effet au <strong>${endDate}</strong>. Cette convention de rupture est conclue conformément à l'article 32 de la loi du 3 juillet 1978.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 2.</span>Absence d'indemnité compensatoire de préavis</div>
      <div class="article-body"><p>La présente convention met fin au contrat sans délai de préavis. <strong>Aucune indemnité compensatoire de préavis n'est due</strong> par l'une ou l'autre des parties, la rupture étant décidée d'un commun accord mutuellement consenti.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 3.</span>Solde de tout compte et documents sociaux</div>
      <div class="article-body">
        <p>Un décompte final (solde de tout compte) sera établi et remis au/à la Travailleur(euse) au plus tard à la date de fin du contrat. Ce décompte comprendra : les salaires dus jusqu'à la date de fin, le pécule de vacances de départ calculé conformément aux lois coordonnées du 28 juin 1971, la prime de fin d'année prorata temporis selon la CCT applicable, et tout autre avantage dû en vertu du contrat.</p>
        <p>L'Employeur remettra les documents sociaux légalement requis dans les délais impartis : certificat de chômage (C4) et attestation de vacances dans les 8 jours ouvrables suivant la fin du contrat (art. 59 L. 3/07/1978), fiche fiscale 281.10 au plus tard le 28 février de l'exercice fiscal suivant.</p>
      </div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 4.</span>Conséquences sur le droit aux allocations de chômage</div>
      <div class="article-body">
        <p>Le/la Travailleur(euse) déclare avoir été expressément informé(e) par l'Employeur que la rupture du contrat de travail de commun accord est susceptible d'entraîner, conformément aux articles 44 à 52 de l'arrêté royal du 25 novembre 1991 relatif à l'octroi des allocations de chômage, une exclusion temporaire ou une réduction du montant des allocations de chômage auxquelles il/elle pourrait prétendre.</p>
        <p>Le/la Travailleur(euse) reconnaît avoir eu la possibilité de consulter son organisme de paiement, son syndicat ou un conseiller juridique avant de signer la présente convention, et avoir fait son choix librement et en pleine connaissance des conséquences possibles.</p>
      </div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 5.</span>Accord libre, éclairé et sans vice de consentement</div>
      <div class="article-body"><p>Les parties certifient que la présente convention a été conclue librement, sans contrainte ni pression d'aucune nature, et que leur consentement n'a été vicié ni par erreur, ni par dol, ni par violence au sens des articles 1109 et suivants du Code civil belge. Le/la Travailleur(euse) confirme avoir disposé d'un délai de réflexion suffisant avant de signer.</p></div>
    </div>
    <div class="article">
      <div class="article-header"><span>Article 6.</span>Loi applicable et juridiction</div>
      <div class="article-body"><p>La présente convention est régie par le droit belge. Tout litige relatif à son interprétation ou son exécution sera soumis à la compétence exclusive du Tribunal du travail de Bruxelles.</p></div>
    </div>`

    return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rupture commun accord — ${workerName} — ${coName}</title><style>${CSS}</style></head><body>
    ${printBar}${headerBand}${body}
    ${signaturesBlock('Le/La Travailleur(euse) certifie avoir été informé(e) des conséquences possibles sur ses droits aux allocations de chômage et avoir signé la présente convention librement et en connaissance de cause.')}
    ${legalFooter('Art. 32 L. 3/07/1978 · AR du 25 novembre 1991 (chômage, art. 44-52) · Lois coordonnées 28 juin 1971 · Art. 59 L. 3/07/1978 (documents sociaux) · Art. 1109 Code civil')}
    </body></html>`
  }

  return ''
}

function calculateNotice(startDate, isEmployer, statut) {
  if (!startDate) return 0
  const start = new Date(startDate)
  const now = new Date()
  const ancMonths = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 30.44))
  const ancYears = ancMonths / 12

  // Barème employeur (en semaines)
  if (isEmployer) {
    if (ancMonths < 3) return 1
    if (ancMonths < 6) return 3
    if (ancMonths < 9) return 4
    if (ancMonths < 12) return 5
    if (ancMonths < 15) return 6
    if (ancMonths < 18) return 7
    if (ancMonths < 21) return 8
    if (ancMonths < 24) return 9
    if (ancYears < 3) return 12
    if (ancYears < 4) return 13
    if (ancYears < 5) return 15
    // +3 semaines par année commencée au-delà de 5 ans
    return 15 + Math.ceil(ancYears - 5) * 3
  }

  // Barème travailleur (en semaines)
  if (ancMonths < 3) return 1
  if (ancMonths < 6) return 2
  if (ancMonths < 12) return 3
  if (ancYears < 2) return 4
  if (ancYears < 4) return 5
  if (ancYears < 5) return 6
  if (ancYears < 8) return 9
  return 13 // max 13 semaines
}

// ── Générateur de contenu document ──
function generateDocument(type, data) {
  const company = data.company || {}
  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })

  const header = `
${company.name || 'ENTREPRISE'}
${company.address || ''}
BCE : ${company.bce || 'N/A'} — ONSS : ${company.onss || 'N/A'}
CP : ${data.cp || company.cp || '200'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

  switch (type) {
    case 'CONTRAT_CDI':
      return `${header}
CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE
(Article 7 de la loi du 3 juillet 1978)

Entre :
  L'employeur : ${company.name || '___'}, dont le siège social est situé
  ${company.address || '___'}, inscrit à la BCE sous le n° ${company.bce || '___'}

Et :
  Le travailleur : ${data.name || '___'}
  Domicilié(e) à : ${data.address || '___'}
  NISS : ${data.niss || '___'}
  Né(e) le : ${data.birthDate || '___'}

Il est convenu ce qui suit :

Article 1 — Objet
Le travailleur est engagé en qualité de ${data.function || '___'} dans le cadre d'un contrat
de travail à durée indéterminée, à temps ${data.regime || 'plein'}.

Article 2 — Date d'entrée en service
Le présent contrat prend effet le ${data.startDate || '___'}.

Article 3 — Fonction et lieu de travail
Le travailleur exercera la fonction de ${data.function || '___'}.
Le lieu de travail principal est : ${data.workplace || company.address || '___'}.

Article 4 — Rémunération
Le salaire mensuel brut est fixé à ${data.salary || '___'} EUR pour un régime de travail
de ${data.hoursPerWeek || '38'} heures par semaine.
${data.mealVouchers ? `Le travailleur bénéficie de chèques-repas d'une valeur de ${data.mealVouchers} EUR/jour.` : ''}

Article 5 — Horaire de travail
L'horaire de travail est conforme au règlement de travail.
Régime : ${data.hoursPerWeek || '38'} heures/semaine.

Article 6 — Commission paritaire
Le présent contrat est régi par la commission paritaire n° ${data.cp || '200'}.

Article 7 — Période d'essai
Conformément à la loi du 26 décembre 2013, il n'y a plus de clause d'essai
pour les contrats conclus après le 1er janvier 2014.

Article 8 — Préavis
Les délais de préavis sont ceux prévus par la loi du 26 décembre 2013
relative à l'introduction d'un statut unique.

Article 9 — Clauses diverses
- Le travailleur s'engage à respecter le règlement de travail.
- Le travailleur est tenu au secret professionnel.
${data.nonCompete ? '- Une clause de non-concurrence est applicable (voir annexe).' : ''}
${data.carPolicy ? '- Le travailleur bénéficie d\'un véhicule de société (voir car policy).' : ''}

Fait en double exemplaire à ${company.city || '___'}, le ${dateStr}.

L'employeur                          Le travailleur
${company.name || '___'}             ${data.name || '___'}
(signature)                          (signature)
Chaque partie reconnaît avoir reçu un exemplaire du présent contrat.
`

    case 'CONTRAT_CDD':
      return `${header}
CONTRAT DE TRAVAIL À DURÉE DÉTERMINÉE
(Article 7 de la loi du 3 juillet 1978)

Entre :
  L'employeur : ${company.name || '___'}
  ${company.address || '___'} — BCE : ${company.bce || '___'}

Et :
  Le travailleur : ${data.name || '___'}
  NISS : ${data.niss || '___'}

Il est convenu ce qui suit :

Article 1 — Le travailleur est engagé en qualité de ${data.function || '___'}
dans le cadre d'un CDD du ${data.startDate || '___'} au ${data.endDate || '___'}.

Article 2 — Rémunération : ${data.salary || '___'} EUR brut/mois.
Régime : ${data.hoursPerWeek || '38'}h/semaine. CP n° ${data.cp || '200'}.

Article 3 — Le contrat prend fin de plein droit à la date d'échéance.
Il ne peut être résilié anticipativement que pour motif grave ou moyennant
une indemnité compensatoire (double du solde restant, plafonné au préavis CDI).

${data.reason ? `Article 4 — Motif du recours au CDD : ${data.reason}` : ''}

Fait en double exemplaire à ${company.city || '___'}, le ${dateStr}.

L'employeur                          Le travailleur
`

    case 'CONTRAT_STUDENT':
      return `${header}
CONVENTION D'OCCUPATION ÉTUDIANT
(Titre VII de la loi du 3 juillet 1978)

Entre :
  L'employeur : ${company.name || '___'} — BCE : ${company.bce || '___'}
Et :
  L'étudiant(e) : ${data.name || '___'} — NISS : ${data.niss || '___'}

Période : du ${data.startDate || '___'} au ${data.endDate || '___'}
Fonction : ${data.function || '___'}
Rémunération : ${data.salary || '___'} EUR brut/heure
Horaire : ${data.hoursPerWeek || '20'}h/semaine

MENTIONS OBLIGATOIRES (AR du 8 mars 2023) :
- Date de début et de fin du contrat
- Lieu de travail : ${data.workplace || company.address || '___'}
- Fonction : ${data.function || '___'}
- Rémunération et mode de paiement
- Horaire de travail
- Durée du préavis : ${data.noticeDays || 3} jours (premiers 7 jours) / 7 jours (après)

COTISATIONS SOCIALES RÉDUITES :
L'étudiant bénéficie du régime de cotisations réduites (2,71 % travailleur, 5,42 % employeur)
dans la limite de 600 heures par année civile (contingent — Loi 03/07/1978, Titre VII).

Fait en double exemplaire à ${company.city || '___'}, le ${dateStr}.
`

    case 'C4': {
      const noticeWeeks = calculateNotice(data.startDate, true)
      return `${header}
FORMULAIRE C4 — CERTIFICAT DE CHÔMAGE
(Arrêté royal du 25 novembre 1991)

EMPLOYEUR :
  ${company.name || '___'} — ONSS n° ${company.onss || '___'}
  ${company.address || '___'}

TRAVAILLEUR :
  Nom et prénom : ${data.name || '___'}
  NISS : ${data.niss || '___'}
  Domicile : ${data.address || '___'}

OCCUPATION :
  Du : ${data.startDate || '___'}
  Au : ${data.endDate || '___'}
  Statut : ${data.statut || 'Employé'}
  Régime : ${data.regime || 'Temps plein'} — ${data.hoursPerWeek || '38'}h/semaine
  CP n° ${data.cp || '200'}

MOTIF DE FIN DE CONTRAT :
  ☐ Licenciement (motif : ${data.motif || '___'})
  ☐ Fin de CDD
  ☐ Démission
  ☐ Rupture d'un commun accord
  ☐ Force majeure
  ☐ Motif grave

PRÉAVIS :
  Délai légal : ${noticeWeeks} semaines
  ${data.indemnityPaid ? 'Indemnité compensatoire de préavis versée' : 'Préavis presté'}

RÉMUNÉRATION :
  Dernier salaire brut : ${data.salary || '___'} EUR/mois

Ce certificat est délivré conformément à l'article 137 de l'AR du 25/11/1991.

Date : ${dateStr}
Signature de l'employeur : ___
Cachet de l'entreprise : ___
`
    }

    case 'PREAVIS': {
      const weeks = data.noticeWeeks || calculateNotice(data.startDate, true)
      const startNotice = new Date()
      // Le préavis commence le lundi suivant
      const dayOfWeek = startNotice.getDay()
      const nextMonday = new Date(startNotice)
      nextMonday.setDate(startNotice.getDate() + ((8 - dayOfWeek) % 7 || 7))
      const endNotice = new Date(nextMonday)
      endNotice.setDate(nextMonday.getDate() + weeks * 7)

      return `${header}
NOTIFICATION DE PRÉAVIS
(Loi du 26 décembre 2013 — statut unique)

${company.name || '___'}
${company.address || '___'}

À l'attention de : ${data.name || '___'}

${company.city || '___'}, le ${dateStr}

Madame, Monsieur,

Par la présente, nous vous notifions notre décision de mettre fin au contrat de
travail qui nous lie, moyennant un préavis de ${weeks} semaines.

Ce préavis prendra cours le ${nextMonday.toLocaleDateString('fr-BE')}
et prendra fin le ${endNotice.toLocaleDateString('fr-BE')}.

Date d'entrée en service : ${data.startDate || '___'}
Ancienneté : à calculer au début du préavis
Délai de préavis : ${weeks} semaines (conformément à la loi du 26/12/2013)

${data.reason ? `Motif : ${data.reason}` : ''}

Durant le préavis, vous êtes autorisé(e) à vous absenter du travail avec
maintien de votre rémunération afin de rechercher un nouvel emploi (jour de
sollicitation — 1 jour ou 2 demi-jours par semaine).

Veuillez agréer, Madame, Monsieur, l'expression de nos salutations distinguées.

${company.name || '___'}
(signature)
`
    }

    case 'ATTESTATION_EMPLOI':
      return `${header}
ATTESTATION D'EMPLOI

Je soussigné(e), ${data.signatoryName || '___'}, agissant en qualité de
${data.signatoryTitle || 'gérant(e)'} de la société ${company.name || '___'},

ATTESTE QUE :

Madame/Monsieur ${data.name || '___'}, domicilié(e) à ${data.address || '___'},
est employé(e) au sein de notre entreprise depuis le ${data.startDate || '___'},
en qualité de ${data.function || '___'}, sous contrat à durée ${data.contractType || 'indéterminée'},
à temps ${data.regime || 'plein'}.

La présente attestation est délivrée à la demande de l'intéressé(e) pour
servir et valoir ce que de droit.

Fait à ${company.city || '___'}, le ${dateStr}.

${data.signatoryName || '___'}
${data.signatoryTitle || 'Gérant(e)'}
${company.name || '___'}

(signature et cachet)
`

    case 'ATTESTATION_SALAIRE':
      return `${header}
ATTESTATION DE RÉMUNÉRATION

Je soussigné(e), ${data.signatoryName || '___'}, agissant en qualité de
${data.signatoryTitle || 'gérant(e)'} de la société ${company.name || '___'},

ATTESTE QUE :

Madame/Monsieur ${data.name || '___'} perçoit une rémunération mensuelle
brute de ${data.salary || '___'} EUR, soit un salaire net mensuel estimé
à ${data.netSalary || '___'} EUR.

Contrat : ${data.contractType || 'CDI'} depuis le ${data.startDate || '___'}.
Fonction : ${data.function || '___'}.
Régime : temps ${data.regime || 'plein'} (${data.hoursPerWeek || '38'}h/semaine).
${data.additionalBenefits ? `Avantages extra-légaux : ${data.additionalBenefits}` : ''}

La présente attestation est délivrée à la demande de l'intéressé(e).

Fait à ${company.city || '___'}, le ${dateStr}.

(signature et cachet)
`

    case 'AVENANT':
      return `${header}
AVENANT AU CONTRAT DE TRAVAIL
(Art. 1134 Code civil — modification par accord mutuel)

Entre :
  L'employeur : ${company.name || '___'} — BCE : ${company.bce || '___'}
  ${company.address || '___'}

Et :
  Le travailleur : ${data.name || '___'}
  NISS : ${data.niss || '___'}

Les parties conviennent des modifications suivantes, prenant effet le ${data.effectiveDate || data.startDate || dateStr} :

${data.modification || '___'}

Fait en double exemplaire à ${company.city || '___'}, le ${dateStr}.

L'employeur                          Le travailleur
(signature)                          (signature)
`

    case 'CONVENTION_RUPTURE':
      return `${header}
CONVENTION DE RUPTURE DE COMMUN ACCORD
(Art. 32 de la loi du 3 juillet 1978)

Entre :
  L'employeur : ${company.name || '___'} — BCE : ${company.bce || '___'}
  ${company.address || '___'}

Et :
  Le travailleur : ${data.name || '___'}
  NISS : ${data.niss || '___'}
  Domicilié(e) à : ${data.address || '___'}

Les parties conviennent de mettre fin au contrat de travail qui les lie,
sans préavis, à la date du ${data.endDate || '___'}.

Cette rupture est décidée d'un commun accord, libre et éclairé.
Aucune indemnité de préavis n'est due.

Le travailleur déclare avoir été informé des conséquences sur ses droits
au chômage (possibilité de sanction ONEM en cas de rupture de commun accord).

Fait en double exemplaire à ${company.city || '___'}, le ${dateStr}.

L'employeur                          Le travailleur
(signature)                          (signature)
`

    case 'CONTRAT_TEMPS_PARTIEL':
      return `${header}
CONTRAT DE TRAVAIL À TEMPS PARTIEL
(AR du 25 juin 1990 — Art. 11bis loi du 3 juillet 1978)

Entre :
  L'employeur : ${company.name || '___'} — BCE : ${company.bce || '___'}
  ${company.address || '___'}

Et :
  Le travailleur : ${data.name || '___'}
  NISS : ${data.niss || '___'}

Il est convenu ce qui suit :

Article 1 — Régime de travail
Le travailleur est engagé à temps partiel.
Nombre d'heures par semaine : ${data.hoursPerWeek || '___'} heures.
Répartition : ${data.schedule || 'conformément au règlement de travail'}.

Article 2 — Entrée en service
Le présent contrat prend effet le ${data.startDate || '___'}.

Article 3 — Fonction et rémunération
Fonction : ${data.function || '___'}.
Salaire mensuel brut (prorata) : ${data.salary || '___'} EUR.
Commission paritaire : n° ${data.cp || '200'}.

Article 4 — Mentions obligatoires (Art. 11bis)
Les dérogations au principe de l'égalité de traitement (heures complémentaires,
jours de travail, etc.) sont régies par le règlement de travail et la loi.

Fait en double exemplaire à ${company.city || '___'}, le ${dateStr}.

L'employeur                          Le travailleur
(signature)                          (signature)
`

    case 'REGLEMENT_TRAVAIL':
      return `${header}
RÈGLEMENT DE TRAVAIL
(Loi du 8 avril 1965)

Entreprise : ${company.name || data.companyName || '___'}
Siège : ${company.address || '___'}
BCE : ${company.bce || '___'}

Le présent règlement de travail est applicable à l'ensemble du personnel.
Il comporte les dispositions relatives à l'ordre et à la discipline,
à la durée du travail, aux congés, à la rémunération et aux conditions
de travail, conformément à la loi du 8 avril 1965.

(Modèle — à compléter selon les dispositions légales et la CCT applicable.)

Fait à ${company.city || '___'}, le ${dateStr}.
`

    case 'ATTESTATION_VACANCES':
      return `${header}
ATTESTATION DE VACANCES ANNUELLES
(Année ${data.year || now.getFullYear()})

Je soussigné(e), ${data.signatoryName || '___'}, au nom de ${company.name || '___'},

ATTESTE QUE :

Madame/Monsieur ${data.name || '___'} a droit au pécule de vacances
pour l'année ${data.year || now.getFullYear()}, conformément à la législation
sur les vacances annuelles (loi du 4 janvier 1974).

La présente attestation est délivrée pour servir et valoir ce que de droit.

Fait à ${company.city || '___'}, le ${dateStr}.

(signature et cachet)
`

    default:
      return `${type}\n\nCe type de document est en cours d'intégration.\n\nContactez votre secrétariat social ou utilisez le modèle Word disponible dans vos ressources.\n\nDonnées : ${data.name||'—'} — ${data.company?.name||'—'} — ${dateStr}`
  }
}

// ── HTML print-ready pour export PDF (impression navigateur → Enregistrer en PDF) ──
function documentToPrintHTML(content, title) {
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>\n')
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${title || 'Document'}</title>
<style>
  @page { margin: 20mm; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; line-height: 1.5; color: #1a1a1a; padding: 24px; max-width: 210mm; margin: 0 auto; }
  .content { white-space: pre-wrap; word-wrap: break-word; }
  .content br { display: block; content: ''; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #ccc; font-size: 9px; color: #666; }
  @media print { body { padding: 0; } .no-print { display: none !important; } }
</style></head><body>
<div class="no-print" style="margin-bottom:16px;padding:12px;background:#f0f0f0;border-radius:8px;font-size:12px;">
  Pour enregistrer en PDF : <strong>{'Ctrl+P'}</strong> (ou Cmd+P) puis choisir « Enregistrer au format PDF ».
</div>
<div class="content">${escaped}</div>
<div class="footer">Document généré par Aureus Social Pro — ${new Date().toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
</body></html>`
}


// ── UI Règlement de travail — téléchargement fichiers statiques ──
function buildReglementUI(company) {
  const co = company || {}
  const coName = (co.name || 'AUREUS IA SPRL').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  const now = new Date().toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Règlement de travail — ${coName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #e0e0e0; padding: 32px; }
  .header { text-align: center; margin-bottom: 32px; }
  .header h1 { font-size: 22px; color: #c6a34e; margin-bottom: 6px; }
  .header p { font-size: 13px; color: #8b95a5; }
  .badge { display: inline-block; background: rgba(198,163,78,.12); border: 1px solid rgba(198,163,78,.3); color: #c6a34e; border-radius: 20px; padding: 3px 12px; font-size: 11px; font-weight: 600; margin-bottom: 12px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 700px; margin: 0 auto 28px; }
  .card { background: #111620; border: 1px solid #1e2633; border-radius: 12px; padding: 24px; text-align: center; }
  .card-flag { font-size: 28px; margin-bottom: 8px; }
  .card-title { font-size: 15px; font-weight: 700; color: #e0e0e0; margin-bottom: 4px; }
  .card-sub { font-size: 11px; color: #8b95a5; margin-bottom: 16px; line-height: 1.5; }
  .btn-group { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
  .btn-pdf { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: #c6a34e; color: #0d1117; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700; text-decoration: none; }
  .btn-docx { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; background: rgba(59,130,246,.15); color: #60a5fa; border: 1px solid rgba(59,130,246,.3); border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; text-decoration: none; }
  .info-box { max-width: 700px; margin: 0 auto; background: rgba(198,163,78,.06); border: 1px solid rgba(198,163,78,.2); border-radius: 10px; padding: 16px 20px; font-size: 12px; color: #b89a4a; line-height: 1.7; }
  .info-box strong { font-size: 13px; display: block; margin-bottom: 8px; color: #c6a34e; }
  .info-box b { color: #e0e0e0; }
  .stats { max-width: 700px; margin: 0 auto 24px; display: flex; gap: 12px; justify-content: center; }
  .stat { background: #111620; border: 1px solid #1e2633; border-radius: 8px; padding: 10px 20px; text-align: center; }
  .stat-val { font-size: 20px; font-weight: 700; color: #c6a34e; }
  .stat-label { font-size: 10px; color: #8b95a5; margin-top: 2px; }
</style>
</head><body>
<div class="header">
  <div class="badge">📋 Document officiel</div>
  <h1>Règlement de travail</h1>
  <p>${coName} &nbsp;·&nbsp; Conforme à la loi du 8 avril 1965 &nbsp;·&nbsp; FR et NL</p>
</div>
<div class="stats">
  <div class="stat"><div class="stat-val">47</div><div class="stat-label">Pages</div></div>
  <div class="stat"><div class="stat-val">22</div><div class="stat-label">Articles</div></div>
  <div class="stat"><div class="stat-val">2</div><div class="stat-label">Langues</div></div>
  <div class="stat"><div class="stat-val">2026</div><div class="stat-label">À jour</div></div>
</div>
<div class="grid">
  <div class="card">
    <div class="card-flag">🇫🇷</div>
    <div class="card-title">Français</div>
    <div class="card-sub">Règlement de travail complet<br/>Loi 8 avril 1965 — 47 pages</div>
    <div class="btn-group">
      <a href="/documents/reglement_travail_FR.pdf" target="_blank" class="btn-pdf">📄 Ouvrir PDF</a>
      <a href="/documents/reglement_travail_FR.docx" download="Reglement_travail_FR.docx" class="btn-docx">📝 Word</a>
    </div>
  </div>
  <div class="card">
    <div class="card-flag">🇧🇪</div>
    <div class="card-title">Nederlands</div>
    <div class="card-sub">Arbeidsreglement volledig<br/>Wet 8 april 1965 — 47 pagina's</div>
    <div class="btn-group">
      <a href="/documents/reglement_travail_NL.pdf" target="_blank" class="btn-pdf">📄 Ouvrir PDF</a>
      <a href="/documents/reglement_travail_NL.docx" download="Arbeidsreglement_NL.docx" class="btn-docx">📝 Word</a>
    </div>
  </div>
</div>
<div class="info-box">
  <strong>ℹ️ Comment utiliser ce document</strong>
  <b>PDF</b> — Version finale à remettre obligatoirement à chaque travailleur lors de son engagement (loi du 8 avril 1965, art. 15 — présomption de connaissance). Cliquez pour l'ouvrir dans votre navigateur, imprimez-le ou envoyez-le par email.<br/><br/>
  <b>Word (.docx)</b> — Version modifiable pour adapter les champs spécifiques (horaires précis, CP, adresse, représentant syndical) avant impression. Toute modification structurelle doit suivre la procédure art. 12 loi 8 avril 1965 (dépôt SPF Emploi + affichage 8 jours).<br/><br/>
  <b>Obligation légale</b> — La remise du règlement de travail est obligatoire pour tous les employeurs dès le premier travailleur. Disponible en FR et NL conformément à la législation linguistique. Mis à jour ${now}.
</div>
</body></html>`
}

// ── Composant principal ──
export default function DocumentGeneratorWrapped({ s, d, tab }) {
  s=s||{}; d=d||(()=>{});
  const _emps=s?.emps||[]; const _clients=s?.clients||[];
  const { t, lang, tText } = useLang();
  const TAB_TO_CAT = {'contratgen': tText('contrat'), 'contratsmenu': tText('contrat'), 'annexeReglement': 'reglementaire', 'gendocsjur': 'reglementaire', 'formC4': 'sortie', 'formC131': 'attestation', 'legal': 'reglementaire', 'cgvsaas': 'reglementaire', 'mentionslegales': 'reglementaire'};
  const initialCat = TAB_TO_CAT[tab] || null;
  return <DocumentGenerator state={s || {}} defaultTab={tab} initialCat={initialCat} />;
}

function DocumentGenerator({ state, defaultTab, initialCat }) {
  const { t, lang, tText } = useLang();
  const [selectedType, setSelectedType] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [formData, setFormData] = useState({})
  const [generated, setGenerated] = useState(null)
  const [filterCat, setFilterCat] = useState(initialCat || 'all')

  const employees = state?.emps || state?.employees || []
  const company = state?.co || state?.company || {}

  const filteredTypes = useMemo(() => {
    return Object.entries(DOC_TYPES).filter(([, val]) =>
      filterCat === 'all' || val.category === filterCat
    )
  }, [filterCat])

  const handleGenerate = useCallback(() => {
    if (!selectedType) return

    // ── Règlement de travail : servir les fichiers statiques ──
    if (selectedType === 'REGLEMENT_TRAVAIL') {
      const reglementHTML = buildReglementUI(company)
      setGenerated({ type: 'REGLEMENT_TRAVAIL', content: '', data: {company}, html: reglementHTML, title: 'Règlement de travail' })
      return
    }

    const emp = selectedEmployee ? employees.find(e =>
      (e.id || e.niss) === selectedEmployee
    ) : {}

    const data = {
      ...formData,
      name: emp ? `${emp.first || ''} ${emp.last || ''}`.trim() : formData.name || '',
      niss: emp?.niss || formData.niss || '',
      address: emp?.address || formData.address || '',
      startDate: emp?.startD || emp?.startDate || formData.startDate || '',
      endDate: emp?.endD || emp?.endDate || formData.endDate || '',
      salary: emp?.monthlySalary || emp?.gross || emp?.brut || formData.salary || '',
      function: emp?.fn || emp?.function || formData.function || '',
      statut: emp?.statut || formData.statut || 'employe',
      cp: emp?.cp || company?.cp || formData.cp || '200',
      company,
    }

    const content = generateDocument(selectedType, data)

    const typeName = DOC_TYPES[selectedType]?.label || selectedType
    const title = `${typeName} — ${(data.name || 'doc').replace(/\s+/g, ' ').trim() || 'doc'}`
    const html = CONTRACT_TYPES.includes(selectedType)
      ? buildContractHTML(selectedType, data)
      : documentToPrintHTML(content, title)

    setGenerated({ type: selectedType, content, data, html, title })

    // PDF par défaut (impression navigateur → Enregistrer au format PDF)
    openForPDF(html, title)
  }, [selectedType, selectedEmployee, formData, employees, company])

  const handleDownloadPDF = useCallback(() => {
    if (!generated) return
    const typeName = DOC_TYPES[generated.type]?.label || generated.type
    const title = `${typeName} — ${(generated.data.name || 'doc').replace(/\s+/g, ' ')}`
    const html = CONTRACT_TYPES.includes(generated.type)
      ? buildContractHTML(generated.type, generated.data)
      : documentToPrintHTML(generated.content, title)
    openForPDF(html, title)
  }, [generated])

  const handlePrint = useCallback(() => {
    if (!generated) return
    const typeName = DOC_TYPES[generated.type]?.label || generated.type
    const html = CONTRACT_TYPES.includes(generated.type)
      ? buildContractHTML(generated.type, generated.data)
      : documentToPrintHTML(generated.content, typeName)
    openForPDF(html, typeName)
  }, [generated])

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: GOLD, margin: '0 0 4px 0', fontSize: 20 }}>{t(tText('docs.title'))||'Générateur de documents'}</h2>
      <p style={{ color: MUTED, margin: '0 0 20px 0', fontSize: 13 }}>
        {t(tText('docs.subtitle'))||'Contrats, attestations'}
      </p>

      {/* Filtres catégorie */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        <button
          onClick={() => setFilterCat('all')}
          style={{
            padding: '5px 14px', borderRadius: 16,
            border: `1px solid ${filterCat === 'all' ? GOLD : BORDER}`,
            background: filterCat === 'all' ? `${GOLD}22` : 'transparent',
            color: filterCat === 'all' ? GOLD : MUTED, cursor: 'pointer', fontSize: 12,
          }}
        >
          Tout
        </button>
        {Object.entries(CATEGORIES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setFilterCat(key)}
            style={{
              padding: '5px 14px', borderRadius: 16,
              border: `1px solid ${filterCat === key ? val.color : BORDER}`,
              background: filterCat === key ? val.color + '22' : 'transparent',
              color: filterCat === key ? val.color : MUTED, cursor: 'pointer', fontSize: 12,
            }}
          >
            {val.icon} {tText(val.label)}
          </button>
        ))}
      </div>

      {/* Sélection du type de document */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10, marginBottom: 24 }}>
        {filteredTypes.map(([key, val]) => (
          <button
            key={key}
            onClick={() => { setSelectedType(key); setGenerated(null) }}
            style={{
              padding: 14, background: selectedType === key ? `${GOLD}22` : DARK,
              border: `1px solid ${selectedType === key ? GOLD : BORDER}`,
              borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s',
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 6 }}>{val.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: selectedType === key ? GOLD : TEXT }}>{tText(val.label)}</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{tText(val.description)}</div>
          </button>
        ))}
      </div>

      {/* Formulaire */}
      {selectedType && (
        <div style={{
          padding: 20, background: DARK, borderRadius: 8, border: `1px solid ${BORDER}`,
          marginBottom: 20,
        }}>
          <h3 style={{ color: GOLD, margin: '0 0 16px 0', fontSize: 15 }}>
            {DOC_TYPES[selectedType].icon} {DOC_TYPES[selectedType].label}
          </h3>

          {/* Sélection employé */}
          {employees.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: MUTED, display: 'block', marginBottom: 4 }}>{tText('Travailleur')}</label>
              <select
                value={selectedEmployee || ''}
                onChange={e => setSelectedEmployee(e.target.value || null)}
                style={{
                  width: '100%', padding: '8px 12px', background: '#111827',
                  border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, fontSize: 13,
                }}
              >
                <option value="">— Sélectionner ou saisir manuellement —</option>
                {employees.filter(e => !e.inactive).map((e, i) => (
                  <option key={e.id || e.niss || i} value={e.id || e.niss}>
                    {e.first || ''} {e.last || ''} {e.niss ? `(${e.niss.slice(0, 6)}...)` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Champs dynamiques selon le type */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {!selectedEmployee && (
              <Field label="Nom complet" value={formData.name} onChange={v => setFormData(p => ({ ...p, name: v }))} />
            )}
            {DOC_TYPES[selectedType].required.includes('startDate') && !selectedEmployee && (
              <Field label="Date d'entrée" type="date" value={formData.startDate} onChange={v => setFormData(p => ({ ...p, startDate: v }))} />
            )}
            {DOC_TYPES[selectedType].required.includes('endDate') && (
              <Field label="Date de fin" type="date" value={formData.endDate} onChange={v => setFormData(p => ({ ...p, endDate: v }))} />
            )}
            {DOC_TYPES[selectedType].required.includes('salary') && !selectedEmployee && (
              <Field label="Salaire brut/mois (EUR)" value={formData.salary} onChange={v => setFormData(p => ({ ...p, salary: v }))} />
            )}
            {DOC_TYPES[selectedType].required.includes('function') && !selectedEmployee && (
              <Field label="Fonction" value={formData.function} onChange={v => setFormData(p => ({ ...p, function: v }))} />
            )}
            {DOC_TYPES[selectedType].required.includes('motif') && (
              <Field label="Motif" value={formData.motif} onChange={v => setFormData(p => ({ ...p, motif: v }))} />
            )}
            {DOC_TYPES[selectedType].required.includes('modification') && (
              <Field label="Modification" value={formData.modification} onChange={v => setFormData(p => ({ ...p, modification: v }))} />
            )}
            {DOC_TYPES[selectedType].required.includes('noticeWeeks') && (
              <Field label="Semaines de préavis" value={formData.noticeWeeks} onChange={v => setFormData(p => ({ ...p, noticeWeeks: v }))} placeholder="Auto-calculé si vide" />
            )}
          </div>

          <button
            onClick={handleGenerate}
            style={{
              marginTop: 16, padding: '10px 24px', background: GOLD,
              border: 'none', borderRadius: 6, color: DARK, fontSize: 14,
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Générer le document
          </button>
        </div>
      )}

      {/* Résultat */}
      {generated && (
        <div style={{
          padding: 20, background: '#111620', borderRadius: 12, border: '1px solid rgba(198,163,78,.25)',
          boxShadow: '0 8px 32px rgba(0,0,0,.6)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: GOLD, margin: 0, fontSize: 15 }}>
              {DOC_TYPES[generated.type]?.label}
            </h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={handleDownloadPDF} style={{ ...btnStyle, background: GOLD, color: DARK, fontWeight: 600 }}>
                📄 Télécharger PDF
              </button>
              <button onClick={handlePrint} style={btnStyle}>{t(tText('ui.print'))||'Imprimer'}</button>
              <button
                onClick={() => { navigator.clipboard?.writeText(generated.content) }}
                style={btnStyle}
              >
                Copier le texte
              </button>
            </div>
          </div>
          {generated.type === 'REGLEMENT_TRAVAIL' ? (
            <div style={{ borderRadius: 10, border: '1px solid rgba(198,163,78,.2)', background: '#0d1117', padding: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ fontSize: 14, color: '#c6a34e', fontWeight: 700, marginBottom: 6 }}>📋 Règlement de travail — Fichiers disponibles</div>
                <div style={{ fontSize: 11, color: '#8b95a5' }}>Loi du 8 avril 1965 · 47 pages · Mis à jour 2026 · FR et NL</div>
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
                {[
                  { lang: '🇫🇷 Français', pdf: '/documents/reglement_travail_FR.pdf', docx: '/documents/reglement_travail_FR.docx', dl: 'Reglement_travail_FR.docx' },
                  { lang: '🇧🇪 Nederlands', pdf: '/documents/reglement_travail_NL.pdf', docx: '/documents/reglement_travail_NL.docx', dl: 'Arbeidsreglement_NL.docx' },
                ].map((v, i) => (
                  <div key={i} style={{ background: '#111620', border: '1px solid #1e2633', borderRadius: 12, padding: 24, textAlign: 'center', minWidth: 240 }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{v.lang.split(' ')[0]}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#e0e0e0', marginBottom: 4 }}>{v.lang.split(' ').slice(1).join(' ')}</div>
                    <div style={{ fontSize: 11, color: '#8b95a5', marginBottom: 16, lineHeight: 1.5 }}>Règlement complet · 47 pages<br/>Loi 8 avril 1965</div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <a href={v.pdf} target="_blank" rel="noopener noreferrer"
                        style={{ padding: '8px 16px', background: '#c6a34e', color: '#0d1117', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        📄 PDF
                      </a>
                      <a href={v.docx} download={v.dl}
                        style={{ padding: '8px 16px', background: 'rgba(59,130,246,.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,.3)', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        📝 Word
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(198,163,78,.06)', border: '1px solid rgba(198,163,78,.2)', borderRadius: 8, padding: '14px 18px', fontSize: 11, color: '#b89a4a', lineHeight: 1.7 }}>
                <strong style={{ color: '#c6a34e', display: 'block', marginBottom: 6 }}>ℹ️ Obligation légale</strong>
                <strong style={{ color: '#e0e0e0' }}>PDF</strong> — Remise obligatoire à chaque travailleur à l'embauche (art. 15 loi 8/04/1965 — présomption de connaissance).<br/>
                <strong style={{ color: '#e0e0e0' }}>Word</strong> — Version modifiable pour adapter les champs (CP, horaires, adresse). Toute modification structurelle suit la procédure art. 12 (dépôt SPF Emploi + affichage 8 jours).
              </div>
            </div>
          ) : (
            <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}`, background: '#fff' }}>
              <iframe
                title="Aperçu document"
                style={{ width: '100%', height: 680, border: 'none', display: 'block' }}
                srcDoc={generated.html || (CONTRACT_TYPES.includes(generated.type) ? buildContractHTML(generated.type, generated.data) : documentToPrintHTML(generated.content || '', generated.title || ''))}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const btnStyle = {
  padding: '7px 16px', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.15)',
  borderRadius: 6, color: '#e8e6e0', cursor: 'pointer', fontSize: 12, fontWeight: 500,
}

function Field({ label, value, onChange, type, placeholder }) {
  const { t, lang, tText } = useLang();
  return (
    <div>
      <label style={{ fontSize: 12, color: MUTED, display: 'block', marginBottom: 4 }}>{label}</label>
      <input
        type={type || 'text'}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '8px 12px', background: '#111827',
          border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT, fontSize: 13,
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

export { DOC_TYPES, CATEGORIES, calculateNotice, generateDocument }
