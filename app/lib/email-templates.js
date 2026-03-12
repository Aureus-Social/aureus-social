// ═══════════════════════════════════════════════════════
//  AUREUS SOCIAL PRO — Templates Email HTML
//  Templates pour fiches de paie, notifications, invitations
//  Branding Aureus: #c6a34e (or), #060810 (fond sombre)
// ═══════════════════════════════════════════════════════

const BRAND = {
  gold: '#c6a34e',
  dark: '#060810',
  darkCard: '#0d1117',
  border: '#1e2633',
  text: '#e0e0e0',
  textMuted: '#8b95a5',
  logo: 'https://app.aureussocial.be/icon-192.png',
  url: 'https://app.aureussocial.be',
  company: 'Aureus Social Pro',
  legal: 'Aureus IA SPRL — BCE 1028.230.781 — Saint-Gilles, Bruxelles',
};

function baseLayout(title, content, preheader) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.dark};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${BRAND.dark};">${preheader}</div>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.dark};padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BRAND.darkCard};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
  <!-- Header -->
  <tr>
    <td style="background:linear-gradient(135deg,${BRAND.dark},#111827);padding:24px 32px;border-bottom:2px solid ${BRAND.gold};">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:22px;font-weight:700;color:${BRAND.gold};letter-spacing:1px;">
            AUREUS SOCIAL
          </td>
          <td align="right" style="font-size:12px;color:${BRAND.textMuted};">
            Logiciel de Paie Pro
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Content -->
  <tr>
    <td style="padding:32px;color:${BRAND.text};font-size:14px;line-height:1.6;">
      ${content}
    </td>
  </tr>
  <!-- Footer -->
  <tr>
    <td style="padding:20px 32px;background-color:${BRAND.dark};border-top:1px solid ${BRAND.border};font-size:11px;color:${BRAND.textMuted};text-align:center;">
      <p style="margin:0 0 8px 0;">${BRAND.legal}</p>
      <p style="margin:0;">
        <a href="${BRAND.url}" style="color:${BRAND.gold};text-decoration:none;">app.aureussocial.be</a>
        &nbsp;|&nbsp;
        <a href="mailto:support@aureussocial.be" style="color:${BRAND.gold};text-decoration:none;">Support</a>
      </p>
      <p style="margin:8px 0 0 0;font-size:10px;">
        Cet email est confidentiel. S'il ne vous est pas destiné, merci de le supprimer.
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function badge(text, color) {
  return `<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;color:#fff;background-color:${color || BRAND.gold};">${text}</span>`;
}

function row(label, value, highlight) {
  return `<tr>
  <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};color:${BRAND.textMuted};font-size:13px;width:50%;">${label}</td>
  <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};color:${highlight ? BRAND.gold : BRAND.text};font-size:13px;font-weight:${highlight ? '700' : '400'};text-align:right;">${value}</td>
</tr>`;
}

// ═══ TEMPLATE: Fiche de paie ═══
export function templatePayslip(data) {
  const { employee, period, gross, onss, pp, css, net, bonusEmploi, transport, mealVouchers, employerCost, company } = data;

  const content = `
    <h2 style="margin:0 0 4px 0;font-size:18px;color:${BRAND.gold};">Fiche de paie</h2>
    <p style="margin:0 0 20px 0;color:${BRAND.textMuted};">Période : ${period || 'N/A'}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.dark};border-radius:8px;border:1px solid ${BRAND.border};margin-bottom:20px;">
      <tr><td colspan="2" style="padding:12px;border-bottom:1px solid ${BRAND.border};font-weight:600;color:${BRAND.gold};font-size:13px;">TRAVAILLEUR</td></tr>
      ${row('Nom', employee?.name || `${employee?.first || ''} ${employee?.last || ''}`)}
      ${row('NISS', employee?.niss ? employee.niss.replace(/(\d{2})(\d{2})(\d{2})(\d{3})(\d{2})/, '$1.$2.$3-$4.$5') : 'N/A')}
      ${row('Fonction', employee?.function || 'N/A')}
      ${row('Commission paritaire', employee?.cp || '200')}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.dark};border-radius:8px;border:1px solid ${BRAND.border};margin-bottom:20px;">
      <tr><td colspan="2" style="padding:12px;border-bottom:1px solid ${BRAND.border};font-weight:600;color:${BRAND.gold};font-size:13px;">RÉMUNÉRATION</td></tr>
      ${row('Salaire brut', fmt(gross), true)}
      ${row('ONSS personnelle (13,07%)', '- ' + fmt(onss))}
      ${bonusEmploi > 0 ? row('Bonus à l\'emploi', '+ ' + fmt(bonusEmploi)) : ''}
      ${row('Précompte professionnel', '- ' + fmt(pp))}
      ${css > 0 ? row('Cotisation spéciale SS', '- ' + fmt(css)) : ''}
      ${transport > 0 ? row('Intervention transport', '+ ' + fmt(transport)) : ''}
      ${mealVouchers > 0 ? row('Chèques-repas (retenue)', '- ' + fmt(mealVouchers)) : ''}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a1628;border-radius:8px;border:2px solid ${BRAND.gold};margin-bottom:20px;">
      <tr>
        <td style="padding:16px 12px;font-size:16px;font-weight:700;color:${BRAND.gold};">NET À PAYER</td>
        <td style="padding:16px 12px;font-size:20px;font-weight:700;color:${BRAND.gold};text-align:right;">${fmt(net)}</td>
      </tr>
    </table>

    ${employerCost ? `<p style="font-size:12px;color:${BRAND.textMuted};">Coût employeur total : ${fmt(employerCost)}</p>` : ''}

    <p style="margin-top:24px;font-size:12px;color:${BRAND.textMuted};">
      Ce document est généré automatiquement par ${company || 'votre secrétariat social'} via Aureus Social Pro.
      En cas de question, contactez votre gestionnaire de paie.
    </p>`;

  return baseLayout(
    `Fiche de paie — ${period}`,
    content,
    `Votre fiche de paie pour ${period} est disponible. Net à payer : ${fmt(net)}`
  );
}

// ═══ TEMPLATE: Récap mensuel employeur ═══
export function templateRecap(data) {
  const { period, company, totalGross, totalOnssW, totalOnssE, totalPP, totalCSS, totalNet, totalCost, workerCount, details } = data;

  let detailRows = '';
  if (details?.length) {
    detailRows = details.map(d =>
      `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid ${BRAND.border};font-size:12px;color:${BRAND.text};">${d.name}</td>
        <td style="padding:6px 8px;border-bottom:1px solid ${BRAND.border};font-size:12px;color:${BRAND.text};text-align:right;">${fmt(d.gross)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid ${BRAND.border};font-size:12px;color:${BRAND.gold};text-align:right;">${fmt(d.net)}</td>
      </tr>`
    ).join('');
  }

  const content = `
    <h2 style="margin:0 0 4px 0;font-size:18px;color:${BRAND.gold};">Récapitulatif mensuel</h2>
    <p style="margin:0 0 20px 0;color:${BRAND.textMuted};">${company || 'Employeur'} — ${period}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.dark};border-radius:8px;border:1px solid ${BRAND.border};margin-bottom:20px;">
      <tr><td colspan="2" style="padding:12px;border-bottom:1px solid ${BRAND.border};font-weight:600;color:${BRAND.gold};font-size:13px;">SYNTHÈSE</td></tr>
      ${row('Nombre de travailleurs', workerCount || 0)}
      ${row('Masse salariale brute', fmt(totalGross), true)}
      ${row('ONSS travailleur (13,07%)', fmt(totalOnssW))}
      ${row('ONSS employeur', fmt(totalOnssE))}
      ${row('Précompte professionnel', fmt(totalPP))}
      ${totalCSS > 0 ? row('Cotisation spéciale SS', fmt(totalCSS)) : ''}
      ${row('Total net', fmt(totalNet), true)}
      ${row('Coût employeur total', fmt(totalCost), true)}
    </table>

    ${detailRows ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.dark};border-radius:8px;border:1px solid ${BRAND.border};margin-bottom:20px;">
      <tr>
        <td style="padding:8px;border-bottom:1px solid ${BRAND.border};font-weight:600;color:${BRAND.gold};font-size:12px;">Travailleur</td>
        <td style="padding:8px;border-bottom:1px solid ${BRAND.border};font-weight:600;color:${BRAND.gold};font-size:12px;text-align:right;">Brut</td>
        <td style="padding:8px;border-bottom:1px solid ${BRAND.border};font-weight:600;color:${BRAND.gold};font-size:12px;text-align:right;">Net</td>
      </tr>
      ${detailRows}
    </table>` : ''}

    <p style="font-size:12px;color:${BRAND.textMuted};">
      Ce récapitulatif est généré automatiquement. Les montants sont exprimés en EUR.
    </p>`;

  return baseLayout(
    `Récap paie — ${period}`,
    content,
    `Récap mensuel ${period} : ${workerCount} travailleurs, masse salariale ${fmt(totalGross)}`
  );
}

// ═══ TEMPLATE: Alerte légale ═══
export function templateAlert(data) {
  const { type, title, description, deadline, severity, actions } = data;

  const severityColor = {
    urgent: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  };

  const content = `
    <div style="text-align:center;margin-bottom:20px;">
      ${badge(severity === 'urgent' ? 'URGENT' : severity === 'warning' ? 'ATTENTION' : 'INFO', severityColor[severity] || severityColor.info)}
    </div>

    <h2 style="margin:0 0 4px 0;font-size:18px;color:${BRAND.gold};text-align:center;">${title || 'Alerte légale'}</h2>
    <p style="margin:0 0 20px 0;color:${BRAND.textMuted};text-align:center;">${type || 'Notification'}</p>

    <div style="background-color:${BRAND.dark};border-radius:8px;border:1px solid ${BRAND.border};padding:16px;margin-bottom:20px;">
      <p style="margin:0;color:${BRAND.text};font-size:14px;line-height:1.6;">${description || ''}</p>
    </div>

    ${deadline ? `
    <div style="background-color:#0a1628;border-radius:8px;border-left:4px solid ${severityColor[severity] || BRAND.gold};padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:${BRAND.textMuted};">Date limite</p>
      <p style="margin:4px 0 0 0;font-size:16px;font-weight:700;color:${BRAND.gold};">${deadline}</p>
    </div>` : ''}

    ${actions?.length ? `
    <div style="text-align:center;margin-top:20px;">
      ${actions.map(a => `<a href="${a.url || BRAND.url}" style="display:inline-block;padding:10px 24px;background-color:${BRAND.gold};color:${BRAND.dark};font-weight:600;text-decoration:none;border-radius:6px;font-size:13px;">${a.label || 'Voir détails'}</a>`).join('&nbsp;&nbsp;')}
    </div>` : ''}`;

  return baseLayout(
    `Alerte — ${title}`,
    content,
    `${severity === 'urgent' ? 'URGENT : ' : ''}${title} — ${deadline || 'Action requise'}`
  );
}

// ═══ TEMPLATE: Rappel d'échéances ═══
export function templateReminder(data) {
  const { period, deadlines, company } = data;

  const dlRows = (deadlines || []).map(d => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.text};">${d.label}</td>
      <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${d.urgent ? '#ef4444' : BRAND.gold};font-weight:600;text-align:right;">${d.date}</td>
      <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};font-size:12px;text-align:center;">
        ${d.done ? badge('Fait', '#22c55e') : d.urgent ? badge('Urgent', '#ef4444') : badge('À faire', '#f59e0b')}
      </td>
    </tr>
  `).join('');

  const content = `
    <h2 style="margin:0 0 4px 0;font-size:18px;color:${BRAND.gold};">Rappel d'échéances</h2>
    <p style="margin:0 0 20px 0;color:${BRAND.textMuted};">${company || 'Employeur'} — ${period}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.dark};border-radius:8px;border:1px solid ${BRAND.border};margin-bottom:20px;">
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};font-weight:600;color:${BRAND.gold};font-size:12px;">Échéance</td>
        <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};font-weight:600;color:${BRAND.gold};font-size:12px;text-align:right;">Date</td>
        <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};font-weight:600;color:${BRAND.gold};font-size:12px;text-align:center;">Statut</td>
      </tr>
      ${dlRows}
    </table>

    <div style="text-align:center;margin-top:20px;">
      <a href="${BRAND.url}" style="display:inline-block;padding:10px 24px;background-color:${BRAND.gold};color:${BRAND.dark};font-weight:600;text-decoration:none;border-radius:6px;font-size:13px;">Ouvrir Aureus Social</a>
    </div>`;

  return baseLayout(
    `Rappel échéances — ${period}`,
    content,
    `Rappel : ${(deadlines || []).filter(d => !d.done).length} échéance(s) en attente pour ${period}`
  );
}

// ═══ TEMPLATE: Invitation ═══
export function templateInvitation(data) {
  const { inviterName, inviterCompany, role, inviteUrl, expiresAt } = data;

  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:8px;">&#9993;</div>
      <h2 style="margin:0 0 4px 0;font-size:20px;color:${BRAND.gold};">Vous êtes invité(e)</h2>
      <p style="margin:0;color:${BRAND.textMuted};">sur Aureus Social Pro</p>
    </div>

    <div style="background-color:${BRAND.dark};border-radius:8px;border:1px solid ${BRAND.border};padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 8px 0;color:${BRAND.text};font-size:14px;">
        <strong style="color:${BRAND.gold};">${inviterName || 'Un administrateur'}</strong>
        ${inviterCompany ? `de <strong>${inviterCompany}</strong>` : ''}
        vous invite à rejoindre la plateforme.
      </p>
      ${role ? `<p style="margin:8px 0 0 0;color:${BRAND.textMuted};font-size:13px;">Rôle attribué : ${badge(role, BRAND.gold)}</p>` : ''}
    </div>

    <div style="text-align:center;margin-bottom:24px;">
      <a href="${inviteUrl || BRAND.url}" style="display:inline-block;padding:14px 36px;background-color:${BRAND.gold};color:${BRAND.dark};font-weight:700;text-decoration:none;border-radius:8px;font-size:15px;">Accepter l'invitation</a>
    </div>

    ${expiresAt ? `<p style="text-align:center;font-size:12px;color:${BRAND.textMuted};">Ce lien expire le ${expiresAt}</p>` : ''}

    <p style="margin-top:24px;font-size:11px;color:${BRAND.textMuted};text-align:center;">
      Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.
    </p>`;

  return baseLayout(
    'Invitation — Aureus Social Pro',
    content,
    `${inviterName || 'Un administrateur'} vous invite à rejoindre Aureus Social Pro`
  );
}

// ═══ TEMPLATE: Facture ═══
export function templateInvoice(data) {
  const { number, date, dueDate, company, items, total, vatAmount, totalTTC, bankInfo } = data;

  const itemRows = (items || []).map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.text};">${item.description}</td>
      <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.text};text-align:center;">${item.qty || 1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.text};text-align:right;">${fmt(item.unitPrice)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};font-size:13px;color:${BRAND.gold};text-align:right;">${fmt(item.total || (item.qty || 1) * (item.unitPrice || 0))}</td>
    </tr>
  `).join('');

  const content = `
    <h2 style="margin:0 0 4px 0;font-size:18px;color:${BRAND.gold};">Facture ${number || ''}</h2>
    <p style="margin:0 0 20px 0;color:${BRAND.textMuted};">Date : ${date || 'N/A'} — Échéance : ${dueDate || 'N/A'}</p>

    ${company ? `
    <div style="background-color:${BRAND.dark};border-radius:8px;border:1px solid ${BRAND.border};padding:12px;margin-bottom:20px;">
      <p style="margin:0;font-weight:600;color:${BRAND.text};">${company.name || ''}</p>
      <p style="margin:4px 0 0 0;font-size:12px;color:${BRAND.textMuted};">${company.address || ''}</p>
      <p style="margin:2px 0 0 0;font-size:12px;color:${BRAND.textMuted};">TVA : ${company.vat || 'N/A'}</p>
    </div>` : ''}

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.dark};border-radius:8px;border:1px solid ${BRAND.border};margin-bottom:20px;">
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};font-weight:600;color:${BRAND.gold};font-size:12px;">Description</td>
        <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};font-weight:600;color:${BRAND.gold};font-size:12px;text-align:center;">Qté</td>
        <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};font-weight:600;color:${BRAND.gold};font-size:12px;text-align:right;">P.U.</td>
        <td style="padding:8px 12px;border-bottom:1px solid ${BRAND.border};font-weight:600;color:${BRAND.gold};font-size:12px;text-align:right;">Total</td>
      </tr>
      ${itemRows}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      ${row('Total HTVA', fmt(total))}
      ${row('TVA (21%)', fmt(vatAmount))}
      ${row('Total TTC', fmt(totalTTC), true)}
    </table>

    ${bankInfo ? `
    <div style="background-color:#0a1628;border-radius:8px;border-left:4px solid ${BRAND.gold};padding:12px 16px;">
      <p style="margin:0;font-size:12px;color:${BRAND.textMuted};">Coordonnées bancaires</p>
      <p style="margin:4px 0 0 0;font-size:14px;color:${BRAND.text};">IBAN : ${bankInfo.iban || 'N/A'}</p>
      <p style="margin:2px 0 0 0;font-size:12px;color:${BRAND.textMuted};">BIC : ${bankInfo.bic || 'N/A'} — Communication : ${bankInfo.reference || number || 'N/A'}</p>
    </div>` : ''}`;

  return baseLayout(
    `Facture ${number}`,
    content,
    `Facture ${number} — Montant TTC : ${fmt(totalTTC)}`
  );
}

// ═══ TEMPLATE: Notification ONSS ═══
export function templateOnssNotification(data) {
  const { type, declarationId, status, env, details, timestamp } = data;

  const statusColor = {
    'A': '#22c55e', // Accepted
    'W': '#f59e0b', // Warning
    'R': '#ef4444', // Refused
    'PENDING': '#3b82f6',
  };

  const statusLabel = {
    'A': 'Accepté',
    'W': 'Accepté avec avertissements',
    'R': 'Refusé',
    'PENDING': 'En cours de traitement',
  };

  const content = `
    <div style="text-align:center;margin-bottom:20px;">
      ${badge(type || 'ONSS', BRAND.gold)}
      &nbsp;
      ${badge(env === 'production' ? 'PRODUCTION' : 'SIMULATION', env === 'production' ? '#ef4444' : '#3b82f6')}
    </div>

    <h2 style="margin:0 0 4px 0;font-size:18px;color:${BRAND.gold};text-align:center;">Notification ${type || 'ONSS'}</h2>
    <p style="margin:0 0 20px 0;color:${BRAND.textMuted};text-align:center;">${timestamp || new Date().toISOString()}</p>

    <div style="background-color:${BRAND.dark};border-radius:8px;border:1px solid ${BRAND.border};padding:20px;margin-bottom:20px;text-align:center;">
      <p style="margin:0;font-size:13px;color:${BRAND.textMuted};">Statut de la déclaration</p>
      <p style="margin:8px 0 0 0;font-size:20px;font-weight:700;color:${statusColor[status] || BRAND.gold};">
        ${statusLabel[status] || status || 'Inconnu'}
      </p>
      ${declarationId ? `<p style="margin:8px 0 0 0;font-size:12px;color:${BRAND.textMuted};">ID : ${declarationId}</p>` : ''}
    </div>

    ${details ? `
    <div style="background-color:${BRAND.dark};border-radius:8px;border:1px solid ${BRAND.border};padding:12px;font-size:12px;color:${BRAND.textMuted};font-family:monospace;">
      ${typeof details === 'string' ? details : JSON.stringify(details, null, 2).replace(/\n/g, '<br>')}
    </div>` : ''}`;

  return baseLayout(
    `ONSS ${type} — ${statusLabel[status] || status}`,
    content,
    `Déclaration ${type} ${declarationId || ''} : ${statusLabel[status] || status}`
  );
}

function fmt(v) {
  if (v === undefined || v === null) return '0,00 €';
  return new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(v);
}

export { BRAND, baseLayout, fmt };
