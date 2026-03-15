// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Guide par rôle
// Utilisé dans les emails d'invitation + page d'accueil guidée
// ═══════════════════════════════════════════════════════════════

export const ROLE_GUIDES = {
  admin: {
    label: 'Administrateur',
    icon: '👑',
    couleur: '#C9963A',
    description: 'Accès complet à toute la plateforme',
    bienvenue: 'Vous disposez des droits administrateur complets sur Aureus Social Pro.',
    modules_cles: [
      { icon: '👤', label: 'Employés', desc: 'Gérer tous les travailleurs et leurs dossiers', route: 'employees' },
      { icon: '◈', label: 'Fiches de Paie', desc: 'Générer et envoyer les fiches mensuelles', route: 'payslip' },
      { icon: '📡', label: 'Déclarations', desc: 'Dimona, DmfA, Belcotax, exports', route: 'declarations' },
      { icon: '🔐', label: 'Rôles & Accès', desc: 'Inviter et gérer les utilisateurs', route: 'authroles' },
      { icon: '📊', label: 'Historique Paie', desc: 'Suivi complet employés/ouvriers/dirigeants', route: 'historiquepayroll' },
      { icon: '🏢', label: 'Gestion Sociétés', desc: 'Gérer vos sociétés clientes', route: 'gestionsocietes' },
    ],
    premieres_etapes: [
      'Commencez par ajouter vos employés dans "Liste & Fiches"',
      'Configurez les paramètres ONSS dans "Déclarations"',
      'Invitez vos collaborateurs via "Rôles & Accès"',
      'Activez les Smart Alertes pour ne manquer aucune échéance',
    ]
  },
  secretariat: {
    label: 'Secrétariat Social',
    icon: '📋',
    couleur: '#5B9BD6',
    description: 'Gestion de la paie et des déclarations',
    bienvenue: 'Votre espace est centré sur la gestion de la paie et les déclarations sociales.',
    modules_cles: [
      { icon: '◈', label: 'Fiches de Paie', desc: 'Générer les fiches du mois', route: 'payslip' },
      { icon: '🧮', label: 'Calcul & Simulation', desc: 'Calculer net/brut instantanément', route: 'calcinstant' },
      { icon: '📡', label: 'Dimona', desc: 'Soumettre les déclarations IN/OUT', route: 'declarations' },
      { icon: '📊', label: 'Historique Paie', desc: 'Consulter l\'historique complet', route: 'historiquepayroll' },
      { icon: '🔄', label: 'Clôture Mensuelle', desc: 'Valider et clôturer la période', route: 'cloture' },
      { icon: '📤', label: 'Exports Comptables', desc: 'WinBooks, BOB, Exact Online', route: 'exportcompta' },
    ],
    premieres_etapes: [
      'Vérifiez les dossiers travailleurs dans "Liste & Fiches"',
      'Utilisez "Validation Pré-Paie" avant chaque clôture',
      'Générez les fiches de paie et envoyez-les par email',
      'Exportez les écritures comptables pour votre logiciel',
    ]
  },
  commercial: {
    label: 'Commercial',
    icon: '🎯',
    couleur: '#4CAF80',
    description: 'Prospection et outils commerciaux',
    bienvenue: 'Votre espace est dédié aux outils de prospection et aux guides commerciaux.',
    modules_cles: [
      { icon: '🔍', label: 'Diagnostic Client', desc: 'Analyser la situation d\'un prospect', route: 'diagnostic' },
      { icon: '⚔️', label: 'Comparatif Marché', desc: 'Comparer avec SD Worx / Partena', route: 'comparatif' },
      { icon: '📖', label: 'Guide Commercial', desc: 'Scripts, objections, argumentaires', route: 'guidecommercial' },
      { icon: '🏢', label: 'Hub Fiduciaire', desc: 'Portail dédié aux fiduciaires', route: 'hubfidu' },
      { icon: '✅', label: 'Checklist Reprise', desc: 'Processus de reprise concurrent', route: 'checklistclient' },
      { icon: '📋', label: 'Procédures RH', desc: 'Répondre aux questions juridiques', route: 'proceduresrh' },
    ],
    premieres_etapes: [
      'Testez le Diagnostic Client avec un prospect en démo',
      'Préparez le Comparatif Marché pour vos rendez-vous',
      'Consultez le Guide Commercial pour les scripts de vente',
      'Utilisez les Procédures RH pour répondre aux questions clients',
    ]
  },
  rh: {
    label: 'RH Entreprise',
    icon: '👥',
    couleur: '#a78bfa',
    description: 'Gestion RH et planning des équipes',
    bienvenue: 'Votre espace est dédié à la gestion quotidienne des ressources humaines.',
    modules_cles: [
      { icon: '👤', label: 'Liste Employés', desc: 'Consulter les dossiers des travailleurs', route: 'employees' },
      { icon: '🗓', label: 'Absences & Congés', desc: 'Gérer les absences et demandes', route: 'absences' },
      { icon: '🚀', label: 'Onboarding', desc: 'Intégrer un nouvel employé', route: 'onboarding' },
      { icon: '👋', label: 'Offboarding', desc: 'Gérer les départs (C4, solde)', route: 'offboarding' },
      { icon: '📝', label: 'Générateur Contrats', desc: 'Créer des contrats CDI/CDD', route: 'contratslegaux' },
      { icon: '📊', label: 'Dashboard RH', desc: 'KPIs : absentéisme, turnover', route: 'dashrh' },
    ],
    premieres_etapes: [
      'Consultez le planning des absences dans "Absences & Congés"',
      'Utilisez le Wizard Onboarding pour les nouveaux arrivants',
      'Configurez les alertes de fin de CDD dans Smart Alertes',
      'Explorez le Dashboard RH pour les KPIs de votre équipe',
    ]
  }
};

export function getRoleGuide(role) {
  if (!role) return ROLE_GUIDES.admin;
  const key = role.toLowerCase();
  if (key.includes('admin')) return ROLE_GUIDES.admin;
  if (key.includes('secret') || key.includes('paie') || key.includes('social')) return ROLE_GUIDES.secretariat;
  if (key.includes('commercial') || key.includes('vente')) return ROLE_GUIDES.commercial;
  if (key.includes('rh') || key.includes('ressource') || key.includes('entreprise')) return ROLE_GUIDES.rh;
  return ROLE_GUIDES.admin;
}

// Template email HTML par rôle
export function buildInviteEmailHTML(userName, role, appUrl, inviteUrl) {
  const guide = getRoleGuide(role);
  const modulesHTML = guide.modules_cles.map(m => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0ede6;font-size:13px">
        <span style="font-size:16px;margin-right:8px">${m.icon}</span>
        <strong style="color:#1a1a1a">${m.label}</strong>
        <span style="color:#888;font-size:12px;display:block;margin-left:28px;margin-top:2px">${m.desc}</span>
      </td>
    </tr>`).join('');

  const etapesHTML = guide.premieres_etapes.map((e, i) => `
    <tr>
      <td style="padding:8px 12px;font-size:13px;color:#444">
        <span style="background:${guide.couleur};color:#000;border-radius:50%;width:20px;height:20px;display:inline-block;text-align:center;line-height:20px;font-size:11px;font-weight:700;margin-right:8px">${i+1}</span>
        ${e}
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">

  <!-- HEADER -->
  <tr><td style="background:#0D0D0E;padding:28px 32px">
    <table width="100%"><tr>
      <td>
        <div style="font-size:22px;font-weight:800;color:#C9963A;letter-spacing:2px">AUREUS SOCIAL PRO</div>
        <div style="font-size:10px;color:#6B6860;letter-spacing:3px;margin-top:2px">SECRÉTARIAT SOCIAL DIGITAL</div>
      </td>
      <td align="right">
        <span style="background:${guide.couleur}20;color:${guide.couleur};padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600">${guide.icon} ${guide.label}</span>
      </td>
    </tr></table>
  </td></tr>

  <!-- BIENVENUE -->
  <tr><td style="padding:28px 32px;border-bottom:1px solid #f0ede6">
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:20px">Bienvenue, ${userName} 👋</h2>
    <p style="margin:0;color:#6B6860;font-size:13px;line-height:1.6">${guide.bienvenue}</p>
  </td></tr>

  <!-- MODULES -->
  <tr><td style="padding:24px 32px">
    <div style="font-size:13px;font-weight:700;color:#C9963A;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px">Vos modules</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0ede6;border-radius:8px;overflow:hidden">
      ${modulesHTML}
    </table>
  </td></tr>

  <!-- PREMIERS PAS -->
  <tr><td style="padding:0 32px 24px">
    <div style="font-size:13px;font-weight:700;color:#C9963A;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px">Par où commencer</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f3;border-radius:8px;overflow:hidden">
      ${etapesHTML}
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 32px 28px;text-align:center">
    <a href="${inviteUrl}" style="display:inline-block;background:#C9963A;color:#000;padding:14px 36px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px">
      Accéder à ma plateforme →
    </a>
    <p style="margin:12px 0 0;font-size:11px;color:#6B6860">Lien valable 7 jours · <a href="${appUrl}" style="color:#C9963A">${appUrl}</a></p>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="padding:16px 32px;background:#f5f0e8;border-top:1px solid #e8e4dc">
    <div style="font-size:11px;color:#6B6860;text-align:center">
      Aureus IA SPRL · BCE BE 1028.230.781 · info@aureus-ia.com<br>
      Place Marcel Broodthaers 8, 1060 Saint-Gilles, Bruxelles
    </div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
