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
  const cp = escapeHtml(data.cp || company.cp || '200')
  const workerName = escapeHtml(data.name || '___')
  const workerAddr = escapeHtml(data.address || '___')
  const workerNiss = escapeHtml(data.niss || '___')
  const workerBirth = escapeHtml(data.birthDate || '___')
  const workerFn = escapeHtml(data.function || '___')
  const startDate = escapeHtml(data.startDate || '___')
  const endDate = escapeHtml(data.endDate || '___')
  const salary = escapeHtml(String(data.salary || '___'))
  const hours = escapeHtml(String(data.hoursPerWeek || '38'))
  const regime = parseFloat(data.regime || 100)
  const regimeStr = regime < 100 ? `temps partiel (${regime}%)` : 'temps plein'
  const workplace = escapeHtml(data.workplace || company.address || coAddr)
  const mealV = data.mealVouchers ? escapeHtml(String(data.mealVouchers)) : null
  const logoUrl = company.logoUrl || company.logo || ''

  // Calcul préavis pour affichage dans le contrat
  const noticeWeeksEmp = calculateNotice(data.startDate, true)
  const noticeWeeksTrav = calculateNotice(data.startDate, false)

  const CSS = `
    @page { margin: 20mm; size: A4; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; font-size: 11.5px; line-height: 1.65; color: #1a1a1a; padding: 24px; max-width: 210mm; margin: 0 auto; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #c6a34e; }
    .header-left { flex: 1; }
    .company-name { font-size: 16px; font-weight: 700; color: #c6a34e; margin-bottom: 4px; }
    .company-info { font-size: 10px; color: #555; line-height: 1.6; }
    .doc-title-block { text-align: center; margin: 24px 0 20px; }
    .doc-title { font-size: 17px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a; }
    .doc-subtitle { font-size: 10px; color: #666; font-style: italic; margin-top: 4px; }
    .parties-block { background: #f9f7f3; border: 1px solid #ddd; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
    .parties-block p { margin-bottom: 8px; }
    .parties-block p:last-child { margin-bottom: 0; }
    .entre { font-weight: 700; margin-bottom: 12px; }
    .convenu { font-weight: 700; margin: 20px 0 12px; border-top: 1px solid #ddd; padding-top: 16px; }
    .article { margin: 0 0 16px 0; }
    .article-title { font-weight: 700; font-size: 11.5px; color: #1a1a1a; margin-bottom: 6px; border-left: 3px solid #c6a34e; padding-left: 8px; }
    .article-body { padding-left: 11px; font-size: 11px; line-height: 1.7; }
    .article-body ul { margin: 6px 0 6px 18px; }
    .article-body li { margin-bottom: 3px; }
    .highlight-box { background: #fff8e7; border: 1px solid #f0d080; border-radius: 4px; padding: 8px 12px; margin: 8px 0; font-size: 10.5px; }
    .warn-box { background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 8px 12px; margin: 8px 0; font-size: 10.5px; color: #856404; }
    .signatures { margin-top: 32px; padding-top: 20px; border-top: 2px solid #c6a34e; }
    .sig-intro { margin-bottom: 20px; font-size: 11px; }
    .sig-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .sig-table td { width: 50%; vertical-align: top; padding: 12px 16px; }
    .sig-name { font-weight: 700; margin-bottom: 4px; }
    .sig-title { font-size: 10px; color: #555; margin-bottom: 40px; }
    .sig-line { border-top: 1px solid #333; padding-top: 4px; font-size: 10px; color: #555; }
    .exemplaire { font-size: 10px; color: #666; margin-top: 12px; font-style: italic; text-align: center; }
    .legal-footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #ccc; font-size: 9px; color: #888; }
    .legal-footer strong { color: #555; }
    hr.section { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
    .mention-legale { font-size: 9.5px; color: #666; font-style: italic; margin-top: 4px; }
    @media print { .no-print { display: none !important; } }
  `

  const printBar = `<div class="no-print" style="margin-bottom:16px;padding:10px 14px;background:#1a1a2e;border-radius:6px;font-size:11px;color:#c6a34e;display:flex;align-items:center;gap:12px;">
    <span>📄 <strong>Aureus Social Pro</strong> — Document prêt à imprimer</span>
    <button onclick="window.print()" style="padding:5px 14px;background:#c6a34e;color:#000;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600;">🖨️ Imprimer / PDF</button>
  </div>`

  const headerBlock = `<div class="header">
    <div class="header-left">
      ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="Logo" style="max-height:60px;max-width:160px;object-fit:contain;margin-bottom:8px;" />` : ''}
      <div class="company-name">${coName}</div>
      <div class="company-info">
        ${coAddr}<br/>
        BCE : ${coBce} &nbsp;|&nbsp; N° ONSS : ${coOnss}<br/>
        Commission Paritaire n° ${cp}
      </div>
    </div>
    <div style="text-align:right;font-size:10px;color:#888;">
      <div style="font-weight:600;color:#555;">Bruxelles, le ${dateStr}</div>
      <div style="margin-top:4px;">Document confidentiel</div>
    </div>
  </div>`

  const sigBlock = `<div class="signatures">
    <p class="sig-intro">Fait en double exemplaire à ${coCity}, le ${dateStr}.<br/>
    Chaque partie reconnaît avoir pris connaissance de l'intégralité du présent contrat et l'accepte sans réserve.</p>
    <table class="sig-table">
      <tr>
        <td>
          <div class="sig-name">L'Employeur :</div>
          <div class="sig-title">${coName}<br/>Représenté par : ${escapeHtml(company.signatoryName || company.representative || 'Le(a) Gérant(e)')}<br/>Qualité : ${escapeHtml(company.signatoryTitle || 'Gérant(e)')}</div>
          <div class="sig-line">Signature et cachet :</div>
        </td>
        <td>
          <div class="sig-name">Le/La Travailleur(euse) :</div>
          <div class="sig-title">${workerName}<br/>NISS : ${workerNiss}<br/><span style="font-style:italic;">Précédée de la mention « Lu et approuvé, bon pour accord »</span></div>
          <div class="sig-line">Signature :</div>
        </td>
      </tr>
    </table>
    <p class="exemplaire">✓ Chaque partie reconnaît avoir reçu son exemplaire original du présent contrat.</p>
  </div>`

  const legalFooter = `<div class="legal-footer">
    <strong>Références légales :</strong>
    Loi du 3 juillet 1978 relative aux contrats de travail —
    Loi du 26 décembre 2013 (statut unique) —
    Loi du 4 janvier 1974 relative aux jours fériés —
    Lois coordonnées du 28 juin 1971 (vacances annuelles) —
    Loi du 8 avril 1965 (règlement de travail) —
    Loi du 4 août 1996 (bien-être au travail) —
    Règlement (UE) 2016/679 (RGPD) — Loi belge 30 juillet 2018.<br/>
    <span style="margin-top:6px;display:block;">Document généré par Aureus Social Pro — aureussocial.be — AUREUS IA SPRL — BCE BE 1028.230.781</span>
  </div>`

  let titleDoc = '', lawRef = '', bodyHTML = ''

  // ════════════════════════════════════════════════════════════════
  // CDI — CONTRAT À DURÉE INDÉTERMINÉE
  // ════════════════════════════════════════════════════════════════
  if (type === 'CONTRAT_CDI') {
    titleDoc = 'CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE'
    lawRef = 'Articles 7 et suivants de la loi du 3 juillet 1978 relative aux contrats de travail'
    bodyHTML = `
    <div class="parties-block">
      <p class="entre">ENTRE LES SOUSSIGNÉS :</p>
      <p><strong>L'EMPLOYEUR :</strong> ${coName}, société de droit belge, dont le siège social est établi à ${coAddr}, inscrite à la BCE sous le numéro ${coBce}, numéro ONSS : ${coOnss}, représentée par ${escapeHtml(company.signatoryName || 'son gérant')}, agissant en sa qualité de ${escapeHtml(company.signatoryTitle || 'Gérant')}, dûment autorisé(e) aux fins des présentes, ci-après dénommée « <strong>l'Employeur</strong> ».</p>
      <p style="margin-top:10px;"><strong>ET LE/LA TRAVAILLEUR(EUSE) :</strong> ${workerName}, né(e) le ${workerBirth}, domicilié(e) à ${workerAddr}, numéro de registre national (NISS) : ${workerNiss}, ci-après dénommé(e) « <strong>le/la Travailleur(euse)</strong> ».</p>
    </div>
    <p class="convenu">IL EST CONVENU ET ARRÊTÉ CE QUI SUIT :</p>

    <div class="article">
      <div class="article-title">Article 1 — Objet et engagement</div>
      <div class="article-body">L'Employeur engage le/la Travailleur(euse) en qualité de <strong>${workerFn}</strong>, avec le statut de <strong>${escapeHtml(data.statut === 'OUV' ? 'Ouvrier/Ouvrière' : data.statut === 'DIR' ? 'Dirigeant(e)' : 'Employé(e)')}</strong>, sous la Commission Paritaire n° <strong>${cp}</strong>. Le/la Travailleur(euse) accepte cet engagement aux conditions ci-après définies.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 2 — Nature et durée du contrat</div>
      <div class="article-body">Le présent contrat est conclu pour une <strong>durée indéterminée</strong>. Il prend cours le <strong>${startDate}</strong>. Conformément à l'article 37 de la loi du 3 juillet 1978 relative aux contrats de travail, sa résiliation est soumise au respect d'un délai de préavis calculé conformément à la loi du 26 décembre 2013 relative à l'introduction d'un statut unique, ou au paiement d'une indemnité compensatoire de préavis équivalente.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 3 — Période d'essai</div>
      <div class="article-body"><strong>Il n'existe pas de période d'essai.</strong> Conformément à la loi du 26 décembre 2013 (article 67 de la loi du 3 juillet 1978 abrogé), la période d'essai a été supprimée pour tous les contrats de travail conclus à partir du 1er janvier 2014.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 4 — Fonction et lieu de travail</div>
      <div class="article-body">Le/la Travailleur(euse) est engagé(e) en qualité de <strong>${workerFn}</strong>. Le lieu de travail principal est fixé à : <strong>${workplace}</strong>. L'Employeur se réserve le droit de modifier temporairement ou définitivement le lieu de travail dans des circonstances raisonnables, moyennant un préavis raisonnable. Le télétravail structurel est possible selon accord individuel distinct, conformément à la CCT n°149 du 26 janvier 2021 et à la loi du 3 octobre 2022.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 5 — Temps de travail et horaires</div>
      <div class="article-body">Le/la Travailleur(euse) est engagé(e) à <strong>${regimeStr}</strong>, soit <strong>${hours} heures par semaine</strong>. Les horaires de travail sont définis dans le règlement de travail de l'entreprise. Toute prestation dépassant la durée du travail convenue constitue des heures supplémentaires soumises aux dispositions de la loi du 16 mars 1971 (art. 29 — sursalaire 50% en semaine, 100% dimanche/jours fériés).</div>
    </div>

    <div class="article">
      <div class="article-title">Article 6 — Rémunération</div>
      <div class="article-body">Le salaire brut mensuel est fixé à <strong>${salary} € brut</strong> pour un régime de ${hours} heures par semaine (CP ${cp}). Ce montant respecte le barème sectoriel applicable et le RMMMG 2026 (art. 3bis L. 12/04/1965). La rémunération est payable le dernier jour ouvrable de chaque mois par virement SEPA sur le compte bancaire communiqué par le/la Travailleur(euse). Les fiches de paie détaillées sont remises mensuellement.
      ${mealV ? `<div class="highlight-box">Avantage complémentaire : chèques-repas d'une valeur de ${mealV} €/jour (part patronale conforme à l'AR du 12/10/2010 — max 6,91 €/jr).</div>` : ''}
      ${data.carPolicy ? `<div class="highlight-box">Véhicule de société : attribué selon la car policy de l'entreprise — ATN calculé conformément à l'art. 36 CIR/92 et mentionné sur la fiche de paie.</div>` : ''}
      </div>
    </div>

    <div class="article">
      <div class="article-title">Article 7 — Vacances annuelles et jours fériés</div>
      <div class="article-body">Le/la Travailleur(euse) a droit à 20 jours ouvrables de vacances annuelles pour une année de référence complète à temps plein (lois coordonnées du 28 juin 1971). Les 10 jours fériés légaux sont accordés conformément à la loi du 4 janvier 1974. Les dates de vacances sont fixées en accord avec l'Employeur, en tenant compte des nécessités du service.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 8 — Préavis et résiliation</div>
      <div class="article-body">En cas de résiliation du présent contrat, les délais de préavis sont déterminés conformément aux articles 37 à 40 de la loi du 3 juillet 1978, tels que modifiés par la loi du 26 décembre 2013. Les délais sont calculés sur la base de l'ancienneté acquise à la date de notification du préavis. Tout licenciement pour motif grave (art. 35 L. 3/07/1978) peut intervenir sans délai de préavis ni indemnité, sous réserve du respect de la procédure légale.
      <div class="mention-legale">À titre indicatif, sur base de l'ancienneté actuelle — délai de préavis employeur : ~${noticeWeeksEmp} semaines — délai travailleur : ~${noticeWeeksTrav} semaines. Ce calcul sera actualisé à la date effective de résiliation.</div>
      </div>
    </div>

    <div class="article">
      <div class="article-title">Article 9 — Incapacité de travail et maladie</div>
      <div class="article-body">En cas d'incapacité de travail pour raison médicale, le/la Travailleur(euse) est tenu(e) d'informer l'Employeur avant 9h00 le premier jour d'absence et de produire un certificat médical dans les 2 jours ouvrables suivants. Le salaire garanti est versé conformément aux articles 52 à 56 de la loi du 3 juillet 1978 (employés). L'Employeur se réserve le droit de faire effectuer un contrôle médical par un médecin agréé (art. 31bis L. 3/07/1978).</div>
    </div>

    <div class="article">
      <div class="article-title">Article 10 — Confidentialité et secret professionnel</div>
      <div class="article-body">Le/la Travailleur(euse) s'engage, pendant et après la durée du contrat, à ne pas divulguer à des tiers les informations confidentielles auxquelles il/elle a accès dans le cadre de ses fonctions, notamment les données techniques, commerciales, financières, les codes sources, algorithmes, bases de données, et toute information qualifiée de confidentielle par l'Employeur. Cette obligation de confidentialité survit à la cessation du contrat pour une durée de 5 ans.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 11 — Propriété intellectuelle</div>
      <div class="article-body">Toutes les créations, inventions, développements logiciels, bases de données et œuvres de l'esprit réalisés par le/la Travailleur(euse) dans le cadre de ses fonctions ou avec les moyens de l'Employeur sont la propriété exclusive de l'Employeur dès leur création, conformément à l'article 3 CDE, à l'article 8 de la loi du 30 juin 1994 sur les droits d'auteur et à l'article 5/1 de la loi du 28 mars 1984 sur les brevets. Aucune rémunération complémentaire n'est due à ce titre, sauf accord écrit distinct.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 12 — Protection des données (RGPD)</div>
      <div class="article-body">Le/la Travailleur(euse) prend connaissance de la politique de protection des données de l'Employeur et s'engage à traiter les données personnelles auxquelles il/elle a accès dans le cadre de ses fonctions conformément au Règlement (UE) 2016/679 (RGPD), à la loi belge du 30 juillet 2018 et aux procédures internes de l'Employeur. Toute violation de données doit être signalée immédiatement à l'Employeur.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 13 — Exclusivité et obligations professionnelles</div>
      <div class="article-body">Le/la Travailleur(euse) s'engage à consacrer toute son activité professionnelle à l'Employeur et à ne pas exercer, sans autorisation écrite préalable, d'activité professionnelle concurrente ou susceptible de nuire aux intérêts de l'Employeur pendant la durée du contrat (art. 17 L. 3/07/1978).</div>
    </div>

    <div class="article">
      <div class="article-title">Article 14 — Règlement de travail</div>
      <div class="article-body">Le/la Travailleur(euse) déclare avoir reçu, pris connaissance et accepter le règlement de travail de l'Employeur, établi conformément à la loi du 8 avril 1965. Ce règlement de travail fait partie intégrante du présent contrat.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 15 — Bien-être au travail</div>
      <div class="article-body">L'Employeur s'engage à respecter les dispositions du Code du bien-être au travail (AR 28/05/2003 et textes suivants). Le/la Travailleur(euse) est informé(e) de l'existence du Service de Prévention et Protection au Travail (SEPP) et des procédures en matière de prévention des risques, de harcèlement moral et sexuel (loi du 4 août 1996).</div>
    </div>

    ${data.nonCompete && data.nonCompete !== 'non' ? `
    <div class="article">
      <div class="article-title">Article 16 — Clause de non-concurrence</div>
      <div class="article-body">Conformément à l'article 65 de la loi du 3 juillet 1978, une clause de non-concurrence d'une durée de <strong>${escapeHtml(String(data.nonCompete))}</strong> est annexée au présent contrat. Cette clause est applicable après la fin du contrat, sous réserve des conditions de l'article 65 (rémunération annuelle > 43.335 € en 2026). L'indemnité compensatoire correspondante sera versée conformément à l'article 65 §3.</div>
    </div>` : ''}

    <div class="article">
      <div class="article-title">Article ${data.nonCompete && data.nonCompete !== 'non' ? '17' : '16'} — Loi applicable et juridiction compétente</div>
      <div class="article-body">Le présent contrat est soumis exclusivement au droit belge, notamment à la loi du 3 juillet 1978 relative aux contrats de travail et aux dispositions légales et réglementaires belges en vigueur. Tout litige relatif à l'interprétation, l'exécution ou la résiliation du présent contrat sera soumis à la compétence exclusive du Tribunal du travail de Bruxelles.</div>
    </div>`
  }

  // ════════════════════════════════════════════════════════════════
  // CDD — CONTRAT À DURÉE DÉTERMINÉE
  // ════════════════════════════════════════════════════════════════
  else if (type === 'CONTRAT_CDD') {
    titleDoc = 'CONTRAT DE TRAVAIL À DURÉE DÉTERMINÉE'
    lawRef = 'Articles 7 et 10 de la loi du 3 juillet 1978 relative aux contrats de travail'
    const motifCDD = escapeHtml(data.reason || data.motifcdd || '[motif du recours au CDD à préciser]')
    bodyHTML = `
    <div class="warn-box">⚠️ Le recours au CDD est strictement réglementé. Il doit être justifié par un motif légal (art. 10 L. 3/07/1978). En l'absence de motif valide, le contrat est requalifié en CDI.</div>
    <div class="parties-block">
      <p class="entre">ENTRE LES SOUSSIGNÉS :</p>
      <p><strong>L'EMPLOYEUR :</strong> ${coName}, société de droit belge, BCE ${coBce}, ONSS ${coOnss}, dont le siège social est établi à ${coAddr}, représentée par ${escapeHtml(company.signatoryName || 'son gérant')}, ci-après dénommée « <strong>l'Employeur</strong> ».</p>
      <p style="margin-top:10px;"><strong>ET LE/LA TRAVAILLEUR(EUSE) :</strong> ${workerName}, né(e) le ${workerBirth}, domicilié(e) à ${workerAddr}, NISS : ${workerNiss}, ci-après dénommé(e) « <strong>le/la Travailleur(euse)</strong> ».</p>
    </div>
    <p class="convenu">IL EST CONVENU ET ARRÊTÉ CE QUI SUIT :</p>

    <div class="article">
      <div class="article-title">Article 1 — Objet et nature du contrat</div>
      <div class="article-body">L'Employeur engage le/la Travailleur(euse) en qualité de <strong>${workerFn}</strong> (${escapeHtml(data.statut === 'OUV' ? 'Ouvrier/Ouvrière' : 'Employé(e)')}), sous CP n° ${cp}, dans le cadre d'un <strong>contrat de travail à durée déterminée</strong>, conformément à l'article 10 de la loi du 3 juillet 1978.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 2 — Durée du contrat</div>
      <div class="article-body">Le présent contrat prend cours le <strong>${startDate}</strong> et expire le <strong>${endDate}</strong>. Il prend fin de plein droit à la date d'échéance, sans qu'une notification préalable soit nécessaire. <strong>Motif du recours au CDD (art. 10 L. 3/07/1978) :</strong> ${motifCDD}.
      <div class="mention-legale">Renouvellement : le CDD ne peut être renouvelé que 3 fois maximum et pour une durée totale n'excédant pas 2 ans, sauf exceptions légales (art. 10bis L. 3/07/1978). Au-delà : requalification automatique en CDI.</div>
      </div>
    </div>

    <div class="article">
      <div class="article-title">Article 3 — Fonction et lieu de travail</div>
      <div class="article-body">Le/la Travailleur(euse) exercera la fonction de <strong>${workerFn}</strong> au lieu de travail principal : ${workplace}.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 4 — Temps de travail</div>
      <div class="article-body">Le/la Travailleur(euse) est engagé(e) à <strong>${regimeStr}</strong>, soit <strong>${hours} heures par semaine</strong>, conformément au règlement de travail.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 5 — Rémunération</div>
      <div class="article-body">Le salaire brut mensuel est fixé à <strong>${salary} € brut</strong> pour un régime de ${hours} h/semaine (CP ${cp}). Payable le dernier jour ouvrable de chaque mois.
      ${mealV ? `<div class="highlight-box">Chèques-repas : ${mealV} €/jour (part patronale).</div>` : ''}</div>
    </div>

    <div class="article">
      <div class="article-title">Article 6 — Résiliation anticipée</div>
      <div class="article-body">Le CDD ne peut être résilié avant son terme que :
      <ul>
        <li>Pour <strong>motif grave</strong> (art. 35 L. 3/07/1978), sans préavis ni indemnité ;</li>
        <li>Moyennant le paiement d'une <strong>indemnité compensatoire</strong> égale au double du salaire correspondant au solde du contrat restant à courir, plafonné au délai de préavis applicable pour un CDI de même ancienneté (art. 40 L. 3/07/1978).</li>
      </ul>
      </div>
    </div>

    <div class="article">
      <div class="article-title">Article 7 — Vacances annuelles et jours fériés</div>
      <div class="article-body">Les droits aux vacances annuelles sont calculés prorata temporis conformément aux lois coordonnées du 28 juin 1971. Les jours fériés légaux sont accordés conformément à la loi du 4 janvier 1974.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 8 — Confidentialité et règlement de travail</div>
      <div class="article-body">Le/la Travailleur(euse) s'engage au respect de la confidentialité des informations de l'Employeur pendant et après la durée du contrat. Le/la Travailleur(euse) déclare avoir reçu et accepter le règlement de travail (loi 8/04/1965).</div>
    </div>

    <div class="article">
      <div class="article-title">Article 9 — Protection des données (RGPD)</div>
      <div class="article-body">Le/la Travailleur(euse) s'engage à traiter les données personnelles conformément au RGPD (2016/679) et à la loi belge du 30 juillet 2018 dans le cadre de ses fonctions.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 10 — Loi applicable et juridiction</div>
      <div class="article-body">Le présent contrat est soumis au droit belge. Tout litige relève de la compétence du Tribunal du travail de Bruxelles.</div>
    </div>`
  }

  // ════════════════════════════════════════════════════════════════
  // CONTRAT ÉTUDIANT
  // ════════════════════════════════════════════════════════════════
  else if (type === 'CONTRAT_STUDENT') {
    titleDoc = "CONVENTION D'OCCUPATION ÉTUDIANT"
    lawRef = "Titre VII de la loi du 3 juillet 1978 — AR du 8 mars 2023 — Loi du 25 décembre 2016"
    const hourlyRate = escapeHtml(String(data.hourlyRate || data.salary || '___'))
    bodyHTML = `
    <div class="highlight-box">📚 Régime cotisations réduites : 2,71% travailleur + 5,42% employeur — dans la limite de 600 heures/an (contingent étudiant). Au-delà : cotisations normales.</div>
    <div class="parties-block">
      <p class="entre">ENTRE LES SOUSSIGNÉS :</p>
      <p><strong>L'EMPLOYEUR :</strong> ${coName}, BCE ${coBce}, ONSS ${coOnss}, ${coAddr}, représenté(e) par ${escapeHtml(company.signatoryName || 'son gérant')}, ci-après « <strong>l'Employeur</strong> ».</p>
      <p style="margin-top:10px;"><strong>ET L'ÉTUDIANT(E) :</strong> ${workerName}, né(e) le ${workerBirth}, domicilié(e) à ${workerAddr}, NISS : ${workerNiss}, ci-après « <strong>l'Étudiant(e)</strong> ».</p>
    </div>
    <p class="convenu">IL EST CONVENU CE QUI SUIT :</p>

    <div class="article">
      <div class="article-title">Article 1 — Objet de la convention</div>
      <div class="article-body">L'Employeur occupe l'Étudiant(e) en qualité de <strong>${workerFn}</strong>, dans le cadre d'une convention d'occupation étudiant régie par le Titre VII de la loi du 3 juillet 1978 et l'arrêté royal du 8 mars 2023.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 2 — Durée de la convention (mention obligatoire)</div>
      <div class="article-body">La présente convention est conclue pour la période du <strong>${startDate}</strong> au <strong>${endDate}</strong>. Elle prend fin de plein droit à l'expiration du terme.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 3 — Lieu de travail (mention obligatoire)</div>
      <div class="article-body">Le lieu de travail principal est : <strong>${workplace}</strong>.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 4 — Fonction et description du travail (mention obligatoire)</div>
      <div class="article-body">L'Étudiant(e) exercera la fonction de : <strong>${workerFn}</strong>.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 5 — Rémunération et mode de paiement (mention obligatoire)</div>
      <div class="article-body">La rémunération est fixée à <strong>${hourlyRate} € brut/heure</strong> (minimum : barème sectoriel CP ${cp}).
      Pour un horaire de <strong>${hours} heures/semaine</strong>, le salaire mensuel estimé est : ${String(Math.round(parseFloat(data.salary || 0) || 0))} € brut/mois (estimation).
      Paiement le dernier jour ouvrable de chaque mois par virement bancaire.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 6 — Horaire de travail (mention obligatoire)</div>
      <div class="article-body"><strong>${hours} heures par semaine</strong>, réparties comme suit : ${escapeHtml(data.schedule || 'conformément aux plannings communiqués par l\'Employeur')}.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 7 — Délai de préavis (mention obligatoire)</div>
      <div class="article-body">Pendant les 7 premiers jours d'exécution de la convention : <strong>3 jours calendriers</strong> (pendant les 7 premiers jours) / <strong>7 jours</strong> (après les 7 premiers jours), conformément à l'article 120 de la loi du 3 juillet 1978. Le préavis est notifié par lettre recommandée ou remis en main propre contre accusé de réception.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 8 — Cotisations sociales réduites — Contingent 600 heures</div>
      <div class="article-body">L'Étudiant(e) bénéficie du régime de cotisations de solidarité réduites (2,71% travailleur + 5,42% employeur) dans la limite de <strong>600 heures par année civile</strong> (art. 17bis AR 28/11/1969, modifié). Au-delà de ce quota, les cotisations sociales normales s'appliquent.
      <div class="highlight-box">L'Étudiant(e) déclare être informé(e) du quota de 600 heures et de son droit de consulter son contingent disponible sur <strong>student.be</strong>. L'Employeur déclarera les heures prestées via la DmfA trimestrielle.</div>
      </div>
    </div>

    <div class="article">
      <div class="article-title">Article 9 — Règlement de travail et obligations</div>
      <div class="article-body">L'Étudiant(e) déclare avoir reçu et accepter le règlement de travail de l'Employeur. Il/elle s'engage au respect des instructions de l'Employeur, au secret professionnel et à la confidentialité des informations de l'entreprise et de ses clients.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 10 — Loi applicable</div>
      <div class="article-body">La présente convention est soumise au droit belge. Tout litige relève du Tribunal du travail compétent.</div>
    </div>`
  }

  // ════════════════════════════════════════════════════════════════
  // CONTRAT TEMPS PARTIEL
  // ════════════════════════════════════════════════════════════════
  else if (type === 'CONTRAT_TEMPS_PARTIEL') {
    titleDoc = 'CONTRAT DE TRAVAIL À TEMPS PARTIEL'
    lawRef = "Art. 11bis de la loi du 3 juillet 1978 — AR du 25 juin 1990 relatif au travail à temps partiel"
    const schedule = escapeHtml(data.schedule || '___')
    bodyHTML = `
    <div class="highlight-box">📋 Le travail à temps partiel doit être prévu dans le règlement de travail ou dans une convention collective (art. 11bis al.2 L. 3/07/1978). L'horaire DOIT figurer dans le contrat.</div>
    <div class="parties-block">
      <p class="entre">ENTRE LES SOUSSIGNÉS :</p>
      <p><strong>L'EMPLOYEUR :</strong> ${coName}, BCE ${coBce}, ONSS ${coOnss}, ${coAddr}, représenté(e) par ${escapeHtml(company.signatoryName || 'son gérant')}, ci-après « <strong>l'Employeur</strong> ».</p>
      <p style="margin-top:10px;"><strong>ET LE/LA TRAVAILLEUR(EUSE) :</strong> ${workerName}, né(e) le ${workerBirth}, domicilié(e) à ${workerAddr}, NISS : ${workerNiss}, ci-après « <strong>le/la Travailleur(euse)</strong> ».</p>
    </div>
    <p class="convenu">IL EST CONVENU CE QUI SUIT :</p>

    <div class="article">
      <div class="article-title">Article 1 — Objet et engagement</div>
      <div class="article-body">L'Employeur engage le/la Travailleur(euse) en qualité de <strong>${workerFn}</strong> (${escapeHtml(data.statut === 'OUV' ? 'Ouvrier/Ouvrière' : 'Employé(e)')}), sous CP n° ${cp}, dans le cadre d'un <strong>contrat de travail à temps partiel</strong>, conformément à l'art. 11bis de la loi du 3 juillet 1978 et à l'AR du 25 juin 1990.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 2 — Durée du contrat</div>
      <div class="article-body">Le présent contrat est conclu pour une <strong>durée indéterminée</strong>. Il prend cours le <strong>${startDate}</strong>.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 3 — Régime de travail (mention obligatoire — art. 11bis)</div>
      <div class="article-body">Le/la Travailleur(euse) est engagé(e) à temps partiel à raison de <strong>${hours} heures par semaine</strong>, soit <strong>${regime}% d'un temps plein</strong> de référence (38h/sem).
      <div class="highlight-box">Répartition des heures (mention obligatoire art. 11bis) :<br/>${schedule}</div>
      <div class="mention-legale">L'horaire ci-dessus est mentionné obligatoirement dans le contrat conformément à l'art. 11bis al.4 L. 3/07/1978. Toute modification de l'horaire doit faire l'objet d'un avenant écrit signé par les deux parties.</div>
      </div>
    </div>

    <div class="article">
      <div class="article-title">Article 4 — Lieu de travail</div>
      <div class="article-body">Le lieu de travail principal est : <strong>${workplace}</strong>.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 5 — Rémunération prorata temporis</div>
      <div class="article-body">Le salaire mensuel brut est fixé à <strong>${salary} € brut</strong> (prorata du temps plein au même poste), pour ${hours} heures par semaine (CP ${cp}). Payable le dernier jour ouvrable de chaque mois. Tous les avantages (pécule de vacances, primes, etc.) sont calculés au prorata du régime de travail.
      ${mealV ? `<div class="highlight-box">Chèques-repas : ${mealV} €/jour (uniquement les jours de prestation complète — AR 12/10/2010).</div>` : ''}</div>
    </div>

    <div class="article">
      <div class="article-title">Article 6 — Heures complémentaires (art. 11bis al.3)</div>
      <div class="article-body">Des heures complémentaires (dépassant l'horaire contractuel sans atteindre le temps plein) peuvent être demandées par l'Employeur dans les limites prévues par le règlement de travail et la loi. Les heures complémentaires sont rémunérées avec un sursalaire de 50% pour les heures dépassant 1/3 de l'horaire contractuel (art. 11bis §1 al.3 L. 3/07/1978).</div>
    </div>

    <div class="article">
      <div class="article-title">Article 7 — Droit de priorité au temps plein</div>
      <div class="article-body">Le/la Travailleur(euse) à temps partiel bénéficie d'un droit de priorité pour l'occupation d'un poste à temps plein qui se libère et correspond à ses qualifications (art. 11bis §2 L. 3/07/1978). L'Employeur doit l'informer de tout poste vacant.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 8 — Préavis, confidentialité et règlement de travail</div>
      <div class="article-body">Les délais de préavis sont calculés conformément à la loi du 26 décembre 2013. Le/la Travailleur(euse) s'engage au secret professionnel et au respect du règlement de travail (loi 8/04/1965), dont il/elle déclare avoir reçu un exemplaire. Protection des données : art. 12 du RGPD (UE) 2016/679.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 9 — Loi applicable</div>
      <div class="article-body">Le présent contrat est soumis au droit belge. Tout litige relève de la compétence du Tribunal du travail de Bruxelles.</div>
    </div>`
  }

  // ════════════════════════════════════════════════════════════════
  // AVENANT
  // ════════════════════════════════════════════════════════════════
  else if (type === 'AVENANT') {
    titleDoc = 'AVENANT AU CONTRAT DE TRAVAIL'
    lawRef = "Art. 1134 Code civil belge — Principe de l'accord mutuel des parties"
    const effDate = escapeHtml(data.effectiveDate || data.startDate || dateStr)
    const modif = escapeHtml(data.modification || '___')
    bodyHTML = `
    <div class="parties-block">
      <p class="entre">ENTRE LES SOUSSIGNÉS :</p>
      <p><strong>L'EMPLOYEUR :</strong> ${coName}, BCE ${coBce}, ONSS ${coOnss}, ${coAddr}.</p>
      <p style="margin-top:10px;"><strong>ET LE/LA TRAVAILLEUR(EUSE) :</strong> ${workerName}, NISS : ${workerNiss}, domicilié(e) à ${workerAddr}.</p>
    </div>
    <p class="convenu">IL EST CONVENU CE QUI SUIT :</p>

    <div class="article">
      <div class="article-title">Article 1 — Objet de l'avenant</div>
      <div class="article-body">Le présent avenant modifie le contrat de travail conclu entre les parties le ${startDate}. Les modifications ci-après prennent effet le <strong>${effDate}</strong>. Toutes les autres dispositions du contrat de travail initial demeurent inchangées et pleinement applicables.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 2 — Modifications convenues</div>
      <div class="article-body">${modif}</div>
    </div>

    <div class="article">
      <div class="article-title">Article 3 — Accord libre et éclairé</div>
      <div class="article-body">Les parties déclarent accepter librement et en connaissance de cause les modifications prévues au présent avenant. Le/la Travailleur(euse) reconnaît avoir été informé(e) de l'ensemble des implications des modifications convenues.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 4 — Loi applicable</div>
      <div class="article-body">Le présent avenant est soumis au droit belge et fait partie intégrante du contrat de travail initial. Tout litige relève du Tribunal du travail compétent.</div>
    </div>`
  }

  // ════════════════════════════════════════════════════════════════
  // RUPTURE DE COMMUN ACCORD
  // ════════════════════════════════════════════════════════════════
  else if (type === 'CONVENTION_RUPTURE') {
    titleDoc = 'CONVENTION DE RUPTURE DU CONTRAT DE TRAVAIL DE COMMUN ACCORD'
    lawRef = "Art. 32 de la loi du 3 juillet 1978 relative aux contrats de travail"
    bodyHTML = `
    <div class="warn-box">⚠️ Une rupture de commun accord peut entraîner la suspension ou la réduction des allocations de chômage par l'ONEM. Le travailleur doit en être informé préalablement. L'accord doit être libre, éclairé et non vicié par une pression de l'employeur.</div>
    <div class="parties-block">
      <p class="entre">ENTRE LES SOUSSIGNÉS :</p>
      <p><strong>L'EMPLOYEUR :</strong> ${coName}, BCE ${coBce}, ONSS ${coOnss}, ${coAddr}, représenté(e) par ${escapeHtml(company.signatoryName || 'son gérant')}.</p>
      <p style="margin-top:10px;"><strong>ET LE/LA TRAVAILLEUR(EUSE) :</strong> ${workerName}, né(e) le ${workerBirth}, domicilié(e) à ${workerAddr}, NISS : ${workerNiss}.</p>
    </div>
    <p class="convenu">IL EST CONVENU CE QUI SUIT :</p>

    <div class="article">
      <div class="article-title">Article 1 — Rupture du contrat de travail</div>
      <div class="article-body">Les parties conviennent, d'un commun accord libre et éclairé, de mettre fin au contrat de travail à durée indéterminée qui les lie depuis le <strong>${startDate}</strong>, avec effet au <strong>${endDate}</strong>. Cette rupture intervient conformément à l'article 32 de la loi du 3 juillet 1978.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 2 — Absence d'indemnité de préavis</div>
      <div class="article-body">La présente convention met fin au contrat sans délai de préavis. <strong>Aucune indemnité compensatoire de préavis n'est due</strong> par l'une ou l'autre des parties, la rupture étant décidée d'un commun accord.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 3 — Solde de tout compte</div>
      <div class="article-body">Un décompte final (solde de tout compte) sera établi et remis au/à la Travailleur(euse) au plus tard le dernier jour de travail, incluant : les salaires dus jusqu'à la date de fin, le pécule de vacances de départ (prorata), la prime de fin d'année prorata et tout avantage dû en vertu du contrat.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 4 — Remise des documents sociaux</div>
      <div class="article-body">L'Employeur s'engage à remettre au/à la Travailleur(euse), dans les 8 jours ouvrables suivant la fin du contrat, les documents suivants : certificat de chômage (C4), attestation de vacances, fiche fiscale 281.10 (au plus tard le 28 février de l'année suivante), et tout autre document légalement requis (art. 59 L. 3/07/1978).</div>
    </div>

    <div class="article">
      <div class="article-title">Article 5 — Conséquences sur le chômage</div>
      <div class="article-body">Le/la Travailleur(euse) déclare avoir été informé(e) que la rupture du contrat de commun accord peut entraîner <strong>une sanction de l'ONEM</strong> (exclusion temporaire du droit aux allocations de chômage). Il/elle reconnaît avoir fait son choix librement et en connaissance de cause, après avoir eu la possibilité de consulter un conseiller syndical ou juridique.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 6 — Accord libre et éclairé</div>
      <div class="article-body">Les parties confirment que le présent accord est intervenu librement, sans contrainte ni pression. Le/la Travailleur(euse) déclare avoir eu le temps nécessaire pour réfléchir et pour consulter un représentant syndical ou un conseiller juridique s'il/elle le souhaitait.</div>
    </div>

    <div class="article">
      <div class="article-title">Article 7 — Loi applicable</div>
      <div class="article-body">La présente convention est soumise au droit belge. Tout litige relève de la compétence exclusive du Tribunal du travail de Bruxelles.</div>
    </div>`
  }

  else {
    return ''
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${titleDoc} — ${workerName}</title>
  <style>${CSS}</style>
</head>
<body>
  ${printBar}
  ${headerBlock}
  <div class="doc-title-block">
    <div class="doc-title">${titleDoc}</div>
    <div class="doc-subtitle">${lawRef}</div>
  </div>
  ${bodyHTML}
  ${sigBlock}
  ${legalFooter}
</body>
</html>`
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
          <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${BORDER}`, background: '#fff' }}>
            <iframe
              title="Aperçu document"
              style={{ width: '100%', height: 680, border: 'none', display: 'block' }}
              srcDoc={generated.html || (CONTRACT_TYPES.includes(generated.type) ? buildContractHTML(generated.type, generated.data) : documentToPrintHTML(generated.content || '', generated.title || ''))}
            />
          </div>
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
