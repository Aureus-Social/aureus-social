'use client';
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
    label: 'Contrat CDI',
    category: 'contrat',
    icon: '📄',
    description: 'Contrat à durée indéterminée — employé ou ouvrier',
    required: ['name', 'startDate', 'salary', 'function', 'cp'],
  },
  CONTRAT_CDD: {
    label: 'Contrat CDD',
    category: 'contrat',
    icon: '📄',
    description: 'Contrat à durée déterminée',
    required: ['name', 'startDate', 'endDate', 'salary', 'function', 'cp'],
  },
  CONTRAT_STUDENT: {
    label: 'Convention étudiant',
    category: 'contrat',
    icon: '🎓',
    description: 'Convention d\'occupation étudiant — max 600 h/an, cotisations réduites 2,71 %',
    required: ['name', 'startDate', 'endDate', 'salary'],
  },
  AVENANT: {
    label: 'Avenant au contrat',
    category: 'contrat',
    icon: '📝',
    description: 'Modification du contrat de travail existant',
    required: ['name', 'modification'],
  },
  CONVENTION_RUPTURE: {
    label: 'Convention de rupture',
    category: 'sortie',
    icon: '🤝',
    description: 'Rupture d\'un commun accord — pas de préavis (Art. 32 Loi 03/07/1978)',
    required: ['name', 'endDate'],
  },
  CONTRAT_TEMPS_PARTIEL: {
    label: 'Contrat temps partiel',
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
    label: 'Attestation de salaire',
    category: 'attestation',
    icon: '💰',
    description: 'Attestation du montant du salaire (pour banque, propriétaire, etc.)',
    required: ['name', 'salary'],
  },
  C4: {
    label: 'Formulaire C4',
    category: 'sortie',
    icon: '🔴',
    description: 'Certificat de chômage — fin de contrat',
    required: ['name', 'startDate', 'endDate', 'motif'],
  },
  PREAVIS: {
    label: 'Lettre de préavis',
    category: 'sortie',
    icon: '⏳',
    description: 'Notification de préavis selon la loi belge',
    required: ['name', 'startDate', 'noticeWeeks'],
  },
  REGLEMENT_TRAVAIL: {
    label: 'Règlement de travail',
    category: 'reglementaire',
    icon: '📋',
    description: 'Règlement de travail conforme à la loi du 8 avril 1965',
    required: ['companyName'],
  },
  ATTESTATION_VACANCES: {
    label: 'Attestation de vacances',
    category: 'attestation',
    icon: '🏖',
    description: 'Attestation de vacances annuelles (pécule)',
    required: ['name', 'year'],
  },
}

const CATEGORIES = {
  contrat: { label: 'Contrats', icon: '📄', color: '#3b82f6' },
  attestation: { label: 'Attestations', icon: '✅', color: '#22c55e' },
  sortie: { label: 'Sortie / Fin contrat', icon: '🔴', color: '#ef4444' },
  reglementaire: { label: 'Réglementaire', icon: '📋', color: '#f59e0b' },
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
  const logoUrl = company.logoUrl || company.logo || ''
  const coName = escapeHtml(company.name || 'ENTREPRISE')
  const coAddr = escapeHtml(company.address || '')
  const coBce = escapeHtml(company.bce || 'N/A')
  const coOnss = escapeHtml(company.onss || 'N/A')
  const cp = escapeHtml(data.cp || company.cp || '200')
  const workerName = escapeHtml(data.name || '___')
  const workerAddr = escapeHtml(data.address || '___')
  const workerNiss = escapeHtml(data.niss || '___')
  const workerBirth = escapeHtml(data.birthDate || '___')
  const workerFn = escapeHtml(data.function || '___')
  const startDate = escapeHtml(data.startDate || '___')
  const endDate = escapeHtml(data.endDate || '___')
  const salary = escapeHtml(data.salary || '___')
  const hours = escapeHtml(data.hoursPerWeek || '38')
  const workplace = escapeHtml(data.workplace || company.address || '___')
  const city = escapeHtml(company.city || '___')
  const regime = escapeHtml(data.regime || 'plein')

  const headerBlock = `
    <header class="contract-header">
      ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="Logo" class="contract-logo" />` : `<div class="contract-logo-placeholder">${coName}</div>`}
      <div class="contract-company"><strong>${coName}</strong><br/>${coAddr}<br/>BCE : ${coBce} — ONSS : ${coOnss}<br/>CP : n° ${cp}</div>
    </header>`

  const loisBlock = `
    <footer class="contract-lois">
      <strong>Références légales</strong>
      <ul>${REFERENCE_LOIS.map(l => `<li><strong>${escapeHtml(l.abbr)}</strong> — ${escapeHtml(l.full)} (${escapeHtml(l.arts)})</li>`).join('')}</ul>
      <p class="contract-generated">Document généré par Aureus Social Pro — ${dateStr}</p>
    </footer>`

  const signaturesBlock = `
    <div class="contract-signatures">
      <p>Fait en double exemplaire à ${city}, le ${dateStr}.</p>
      <table class="sign-table"><tr>
        <td><strong>L'employeur</strong><br/>${coName}<br/><em>(signature)</em></td>
        <td><strong>Le travailleur</strong><br/>${workerName}<br/><em>(signature)</em></td>
      </tr></table>
      <p class="exemplaire">Chaque partie reconnaît avoir reçu un exemplaire du présent contrat.</p>
    </div>`

  let titleDoc = ''; let lawRef = ''; let bodyArticles = ''
  switch (type) {
    case 'CONTRAT_CDI':
      titleDoc = 'CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE'; lawRef = 'Article 7 de la loi du 3 juillet 1978'
      bodyArticles = `
        <article class="contract-article"><strong>Article 1 — Objet</strong><br/>Le travailleur est engagé en qualité de ${workerFn}, contrat à durée indéterminée, à temps ${regime}.</article>
        <article class="contract-article"><strong>Article 2 — Date d'entrée</strong><br/>Le présent contrat prend effet le ${startDate}.</article>
        <article class="contract-article"><strong>Article 3 — Fonction et lieu</strong><br/>Fonction : ${workerFn}. Lieu : ${workplace}.</article>
        <article class="contract-article"><strong>Article 4 — Rémunération</strong><br/>Salaire mensuel brut : ${salary} EUR pour ${hours} h/semaine.</article>
        <article class="contract-article"><strong>Article 5 — Horaire</strong><br/>Conforme au règlement de travail. Régime : ${hours} h/semaine.</article>
        <article class="contract-article"><strong>Article 6 — Commission paritaire</strong><br/>CP n° ${cp}.</article>
        <article class="contract-article"><strong>Article 7 — Période d'essai</strong><br/>Conformément à la loi du 26 décembre 2013, plus de clause d'essai depuis le 1er janvier 2014.</article>
        <article class="contract-article"><strong>Article 8 — Préavis</strong><br/>Délais prévus par la loi du 26 décembre 2013 (statut unique).</article>
        <article class="contract-article"><strong>Article 9 — Divers</strong><br/>Respect du règlement de travail et secret professionnel.</article>`
      break
    case 'CONTRAT_CDD':
      titleDoc = 'CONTRAT DE TRAVAIL À DURÉE DÉTERMINÉE'; lawRef = 'Article 7 de la loi du 3 juillet 1978'
      bodyArticles = `
        <article class="contract-article"><strong>Article 1</strong><br/>Engagement en qualité de ${workerFn}, CDD du ${startDate} au ${endDate}.</article>
        <article class="contract-article"><strong>Article 2 — Rémunération</strong><br/>${salary} EUR brut/mois, ${hours} h/semaine. CP n° ${cp}.</article>
        <article class="contract-article"><strong>Article 3 — Fin</strong><br/>Fin de plein droit à l'échéance. Résiliation anticipée : motif grave ou indemnité compensatoire (loi 3 juillet 1978).</article>`
      break
    case 'CONTRAT_STUDENT':
      titleDoc = "CONVENTION D'OCCUPATION ÉTUDIANT"; lawRef = 'Titre VII loi du 3 juillet 1978 — AR du 8 mars 2023'
      bodyArticles = `
        <article class="contract-article"><strong>Article 1 — Parties</strong><br/>Employeur : ${coName}. Étudiant : ${workerName} — NISS : ${workerNiss}.</article>
        <article class="contract-article"><strong>Article 2 — Période</strong><br/>Du ${startDate} au ${endDate}. Fonction : ${workerFn}. Rémunération : ${salary} EUR brut/heure. ${hours} h/semaine.</article>
        <article class="contract-article"><strong>Article 3 — Mentions obligatoires (AR 8 mars 2023)</strong><br/>Lieu : ${workplace}, préavis, etc.</article>
        <article class="contract-article"><strong>Article 4 — Cotisations réduites</strong><br/>2,71 % / 5,42 % dans la limite de 600 h/an (Loi 03/07/1978, Titre VII).</article>`
      break
    case 'CONTRAT_TEMPS_PARTIEL':
      titleDoc = 'CONTRAT DE TRAVAIL À TEMPS PARTIEL'; lawRef = 'AR du 25 juin 1990 — Art. 11bis loi du 3 juillet 1978'
      bodyArticles = `
        <article class="contract-article"><strong>Article 1 — Régime</strong><br/>Temps partiel : ${hours} h/semaine.</article>
        <article class="contract-article"><strong>Article 2 — Entrée</strong><br/>Effet le ${startDate}.</article>
        <article class="contract-article"><strong>Article 3 — Fonction et rémunération</strong><br/>${workerFn} — ${salary} EUR (prorata). CP n° ${cp}.</article>
        <article class="contract-article"><strong>Article 4 — Art. 11bis</strong><br/>Dérogations régies par le règlement de travail et la loi.</article>`
      break
    case 'AVENANT':
      titleDoc = 'AVENANT AU CONTRAT DE TRAVAIL'; lawRef = 'Art. 1134 Code civil'
      const modif = escapeHtml(data.modification || '___'); const effDate = escapeHtml(data.effectiveDate || data.startDate || dateStr)
      bodyArticles = `<article class="contract-article"><strong>Article 1 — Modifications</strong><br/>Effet le ${effDate} :<br/>${modif}</article>`
      break
    case 'CONVENTION_RUPTURE':
      titleDoc = 'CONVENTION DE RUPTURE DE COMMUN ACCORD'; lawRef = 'Art. 32 de la loi du 3 juillet 1978'
      bodyArticles = `<article class="contract-article"><strong>Article 1</strong><br/>Fin du contrat sans préavis le ${endDate}. Rupture libre et éclairée. Aucune indemnité de préavis. Information sur les conséquences chômage.</article>`
      break
    default: return ''
  }

  const partiesBlock = (type === 'CONVENTION_RUPTURE' || type === 'AVENANT') ? `
    <div class="contract-parties">
      <p><strong>L'employeur :</strong> ${coName} — BCE : ${coBce}<br/>${coAddr}</p>
      <p><strong>Le travailleur :</strong> ${workerName}<br/>NISS : ${workerNiss}${type === 'CONVENTION_RUPTURE' ? `<br/>Domicile : ${workerAddr}` : ''}</p>
    </div>` : `
    <div class="contract-parties">
      <p><strong>L'employeur :</strong> ${coName}, siège ${coAddr}, BCE ${coBce}.</p>
      <p><strong>Le travailleur :</strong> ${workerName}<br/>Domicile : ${workerAddr}<br/>NISS : ${workerNiss}${workerBirth !== '___' ? `<br/>Né(e) le : ${workerBirth}` : ''}</p>
    </div>`

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${titleDoc} — ${workerName}</title>
<style>
  @page{margin:20mm;size:A4}*{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Georgia,serif;font-size:11px;line-height:1.5;color:#1a1a1a;padding:20px;max-width:210mm;margin:0 auto}
  .contract-header{display:flex;align-items:center;gap:20px;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #c6a34e}
  .contract-logo{max-height:70px;max-width:180px;object-fit:contain}
  .contract-logo-placeholder{font-size:18px;font-weight:700;color:#c6a34e;min-width:160px}
  .contract-company{font-size:11px;color:#333;line-height:1.5}
  .contract-title{font-size:16px;font-weight:700;text-align:center;margin:16px 0 6px;text-transform:uppercase}
  .contract-law-ref{font-size:10px;color:#666;text-align:center;margin-bottom:16px;font-style:italic}
  .contract-parties{margin:14px 0;padding:12px;background:#f8f8f8;border-radius:6px}
  .contract-article{margin:12px 0;padding-left:8px;border-left:3px solid #c6a34e}
  .contract-signatures{margin-top:28px}.sign-table{width:100%;margin-top:24px}
  .sign-table td{width:50%;vertical-align:top;padding:8px;font-size:10px}
  .contract-lois{margin-top:28px;padding-top:16px;border-top:1px solid #ccc;font-size:9px;color:#555}
  .contract-lois ul{margin:8px 0;padding-left:18px}.contract-generated{margin-top:12px;color:#999}
  .exemplaire{font-size:10px;margin-top:12px;color:#666}
  .no-print{display:none!important}
  @media print{.no-print{display:none!important}}
</style></head><body>
<div class="no-print" style="margin-bottom:12px;padding:10px;background:#f0f0f0;border-radius:6px;font-size:11px;">Pour enregistrer en PDF : <strong>Ctrl+P</strong> (ou Cmd+P) puis « Enregistrer au format PDF ».</div>
${headerBlock}
<h1 class="contract-title">${titleDoc}</h1>
<p class="contract-law-ref">${lawRef}</p>
${partiesBlock}
<p><strong>Il est convenu ce qui suit :</strong></p>
${bodyArticles}
${signaturesBlock}
${loisBlock}
</body></html>`
}

// ── Calcul préavis belge (loi du 26 décembre 2013) ──
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
      return `Document de type ${type} — génération non implémentée.`
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
  Pour enregistrer en PDF : <strong>Ctrl+P</strong> (ou Cmd+P) puis choisir « Enregistrer au format PDF ».
</div>
<div class="content">${escaped}</div>
<div class="footer">Document généré par Aureus Social Pro — ${new Date().toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
</body></html>`
}

// ── Composant principal ──
export default function DocumentGeneratorWrapped({ s, d, tab }) {
  const TAB_TO_CAT = {'contratgen': 'contrat', 'contratsmenu': 'contrat', 'annexeReglement': 'reglementaire', 'gendocsjur': 'reglementaire', 'formC4': 'sortie', 'formC131': 'attestation', 'legal': 'reglementaire', 'cgvsaas': 'reglementaire', 'mentionslegales': 'reglementaire'};
  const initialCat = TAB_TO_CAT[tab] || null;
  return <DocumentGenerator state={s || {}} defaultTab={tab} initialCat={initialCat} />;
}

function DocumentGenerator({ state, defaultTab, initialCat }) {
  const [selectedType, setSelectedType] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [formData, setFormData] = useState({})
  const [generated, setGenerated] = useState(null)
  const [filterCat, setFilterCat] = useState(initialCat || 'all')

  const employees = state?.employees || []
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
      <h2 style={{ color: GOLD, margin: '0 0 4px 0', fontSize: 20 }}>Générateur de documents</h2>
      <p style={{ color: MUTED, margin: '0 0 20px 0', fontSize: 13 }}>
        Contrats, attestations, C4, préavis — conformes au droit du travail belge
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
            {val.icon} {val.label}
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
            <div style={{ fontSize: 13, fontWeight: 600, color: selectedType === key ? GOLD : TEXT }}>{val.label}</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{val.description}</div>
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
              <label style={{ fontSize: 12, color: MUTED, display: 'block', marginBottom: 4 }}>Travailleur</label>
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
          padding: 20, background: DARK, borderRadius: 8, border: `1px solid ${BORDER}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: GOLD, margin: 0, fontSize: 15 }}>
              {DOC_TYPES[generated.type]?.label}
            </h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={handleDownloadPDF} style={{ ...btnStyle, background: GOLD, color: DARK, fontWeight: 600 }}>
                📄 Télécharger PDF
              </button>
              <button onClick={handlePrint} style={btnStyle}>Imprimer</button>
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
  padding: '6px 14px', background: 'transparent', border: `1px solid ${BORDER}`,
  borderRadius: 6, color: MUTED, cursor: 'pointer', fontSize: 12,
}

function Field({ label, value, onChange, type, placeholder }) {
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
