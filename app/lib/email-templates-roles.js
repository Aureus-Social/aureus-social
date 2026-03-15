// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Templates email par rôle
// Envoyé automatiquement lors de l'approbation d'accès
// ═══════════════════════════════════════════════════════════════

const APP_URL = 'https://app.aureussocial.be';

const GUIDES = {
  fiduciaire: {
    label: 'Fiduciaire / Cabinet comptable',
    icon: '🏢',
    couleur: '#C9963A',
    bienvenue: 'Votre espace fiduciaire vous permet de gérer vos dossiers clients, générer leurs fiches de paie et soumettre leurs déclarations sociales.',
    modules: [
      { icon: '🏢', label: 'Gestion Sociétés', desc: 'Créer et gérer vos sociétés clientes', route: 'gestionsocietes' },
      { icon: '👤', label: 'Employés', desc: 'Gérer les travailleurs par dossier', route: 'employees' },
      { icon: '◈', label: 'Fiches de Paie', desc: 'Générer et envoyer les fiches mensuelles', route: 'payslip' },
      { icon: '📡', label: 'Déclarations ONSS', desc: 'Dimona, DmfA, Belcotax', route: 'declarations' },
      { icon: '📤', label: 'Exports Comptables', desc: 'WinBooks, BOB 50, Exact Online', route: 'exportcompta' },
      { icon: '📊', label: 'Historique Paie', desc: 'Suivi complet par période', route: 'historiquepayroll' },
    ],
    etapes: [
      'Créez vos sociétés clientes dans "Gestion Sociétés"',
      'Ajoutez les employés pour chaque société',
      'Générez les fiches de paie et exportez vers votre logiciel comptable',
      'Soumettez les Dimona et DmfA directement depuis l\'app',
    ]
  },
  comptable: {
    label: 'Expert-comptable',
    icon: '📊',
    couleur: '#5B9BD6',
    bienvenue: 'Votre espace expert-comptable vous donne accès aux outils de calcul, déclaration et export pour vos clients employeurs.',
    modules: [
      { icon: '🧮', label: 'Calcul & Simulation', desc: 'Net/brut instantané par CP', route: 'calcinstant' },
      { icon: '📤', label: 'Exports Comptables', desc: 'WinBooks, BOB, Exact Online, Octopus', route: 'exportcompta' },
      { icon: '📡', label: 'Déclarations', desc: 'Dimona, DmfA, Belcotax 281.10', route: 'declarations' },
      { icon: '🎁', label: 'Primes & Avantages', desc: '57 primes belges configurées', route: 'gestionprimes' },
      { icon: '📐', label: 'Barèmes & Seuils', desc: 'CP, ONSS, PP à jour automatiquement', route: 'baremescp' },
      { icon: '📊', label: 'Rapports', desc: 'Rapports mensuels et annuels', route: 'rapports' },
    ],
    etapes: [
      'Consultez les barèmes CP pour vos calculs',
      'Utilisez le Simulateur Net/Brut pour vos conseils clients',
      'Exportez les écritures comptables dans votre logiciel',
      'Générez les fiches Belcotax 281.10 en fin d\'année',
    ]
  },
  rh_societe: {
    label: 'Service RH',
    icon: '👥',
    couleur: '#a78bfa',
    bienvenue: 'Votre espace RH vous permet de gérer au quotidien les employés, les absences, les contrats et le planning de votre équipe.',
    modules: [
      { icon: '👤', label: 'Liste Employés', desc: 'Dossiers complets des travailleurs', route: 'employees' },
      { icon: '🗓', label: 'Absences & Congés', desc: 'Gérer et approuver les absences', route: 'absences' },
      { icon: '🚀', label: 'Onboarding', desc: 'Intégrer les nouveaux arrivants', route: 'onboarding' },
      { icon: '👋', label: 'Offboarding', desc: 'Gérer les départs (C4, solde)', route: 'offboarding' },
      { icon: '📝', label: 'Générateur Contrats', desc: 'CDI, CDD, avenants', route: 'contratslegaux' },
      { icon: '📊', label: 'Dashboard RH', desc: 'KPIs : absentéisme, turnover', route: 'dashrh' },
    ],
    etapes: [
      'Consultez le planning absences de votre équipe',
      'Utilisez le Wizard Onboarding pour les nouveaux',
      'Générez les contrats de travail directement depuis l\'app',
      'Activez les alertes de fin de CDD dans Smart Alertes',
    ]
  },
  employeur: {
    label: 'Employeur',
    icon: '👔',
    couleur: '#4CAF80',
    bienvenue: 'Votre espace employeur vous permet de gérer vos employés, consulter leurs fiches de paie et suivre vos obligations sociales.',
    modules: [
      { icon: '👤', label: 'Mes Employés', desc: 'Voir et gérer vos travailleurs', route: 'employees' },
      { icon: '◈', label: 'Fiches de Paie', desc: 'Consulter les fiches du mois', route: 'payslip' },
      { icon: '🗓', label: 'Absences & Congés', desc: 'Gérer les congés et absences', route: 'absences' },
      { icon: '📡', label: 'Déclarations', desc: 'Dimona IN/OUT pour vos employés', route: 'declarations' },
      { icon: '🎁', label: 'Primes & Avantages', desc: 'Optimiser la rémunération', route: 'gestionprimes' },
      { icon: '💡', label: 'Optimisation Fiscale', desc: 'Réduire le coût employeur', route: 'optifiscale' },
    ],
    etapes: [
      'Vérifiez les dossiers de vos employés dans "Mes Employés"',
      'Consultez les fiches de paie du mois en cours',
      'Soumettez les Dimona IN pour vos nouveaux engagements',
      'Explorez les primes exonérées pour optimiser les rémunérations',
    ]
  },
  rh_employeur: {
    label: 'RH Employeur',
    icon: '🏭',
    couleur: '#4CAF80',
    bienvenue: 'Votre espace vous donne accès à la gestion complète des ressources humaines de votre entreprise.',
    modules: [
      { icon: '👤', label: 'Employés', desc: 'Gérer tous les dossiers', route: 'employees' },
      { icon: '◈', label: 'Fiches de Paie', desc: 'Fiches mensuelles de tous les employés', route: 'payslip' },
      { icon: '🗓', label: 'Absences', desc: 'Planning et gestion des absences', route: 'absences' },
      { icon: '📡', label: 'Dimona', desc: 'Déclarations IN/OUT', route: 'declarations' },
      { icon: '📝', label: 'Contrats', desc: 'Générer les contrats de travail', route: 'contratslegaux' },
      { icon: '📋', label: 'Procédures RH', desc: '64 procédures belges disponibles', route: 'proceduresrh' },
    ],
    etapes: [
      'Vérifiez les dossiers employés et leurs contrats',
      'Gérez les demandes d\'absence et de congé',
      'Soumettez les Dimona pour vos nouveaux engagements',
      'Consultez les procédures RH pour les questions juridiques',
    ]
  }
};

function getGuide(role) {
  if (!role) return GUIDES.employeur;
  const k = role.toLowerCase();
  if (GUIDES[k]) return GUIDES[k];
  if (k.includes('fidu') || k.includes('cabinet')) return GUIDES.fiduciaire;
  if (k.includes('compt') || k.includes('expert')) return GUIDES.comptable;
  if (k.includes('rh_s') || k.includes('rh_e') || k.includes('ressource')) return GUIDES.rh_societe;
  if (k.includes('employeur') || k.includes('patron')) return GUIDES.employeur;
  return GUIDES.employeur;
}

export function buildInviteEmail({ nom, prenom, role, societe, loginUrl }) {
  const guide = getGuide(role);
  const userName = [prenom, nom].filter(Boolean).join(' ') || 'Utilisateur';
  const url = loginUrl || APP_URL;

  const modulesHTML = guide.modules.map(m => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f0ede6;vertical-align:top">
        <span style="font-size:18px">${m.icon}</span>
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0ede6">
        <div style="font-size:13px;font-weight:700;color:#1a1a1a">${m.label}</div>
        <div style="font-size:12px;color:#888;margin-top:2px">${m.desc}</div>
      </td>
    </tr>`).join('');

  const etapesHTML = guide.etapes.map((e, i) => `
    <tr>
      <td style="padding:8px 14px;vertical-align:top;width:30px">
        <div style="width:22px;height:22px;background:#C9963A;color:#000;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700">${i+1}</div>
      </td>
      <td style="padding:8px 14px;font-size:13px;color:#444;line-height:1.5">${e}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.1)">

  <!-- HEADER -->
  <tr><td style="background:#0D0D0E;padding:28px 32px">
    <table width="100%"><tr>
      <td>
        <div style="font-size:24px;font-weight:800;color:#C9963A;letter-spacing:3px">AUREUS</div>
        <div style="font-size:11px;color:#6B6860;letter-spacing:4px;margin-top:2px">SOCIAL PRO</div>
      </td>
      <td align="right">
        <div style="background:${guide.couleur}25;color:${guide.couleur};padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;display:inline-block">
          ${guide.icon} ${guide.label}
        </div>
      </td>
    </tr></table>
  </td></tr>

  <!-- ACCÈS ACTIVÉ -->
  <tr><td style="padding:28px 32px 20px;border-bottom:1px solid #f0ede6">
    <div style="font-size:13px;color:#4CAF80;font-weight:600;margin-bottom:8px">✅ Votre accès est activé</div>
    <h2 style="margin:0 0 10px;color:#1a1a1a;font-size:21px">Bienvenue, ${userName} 👋</h2>
    <p style="margin:0;color:#6B6860;font-size:13px;line-height:1.7">${guide.bienvenue}</p>
    ${societe ? `<p style="margin:10px 0 0;color:#888;font-size:12px">Société : <strong style="color:#1a1a1a">${societe}</strong></p>` : ''}
  </td></tr>

  <!-- VOS MODULES -->
  <tr><td style="padding:24px 32px 16px">
    <div style="font-size:11px;font-weight:700;color:#C9963A;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px">
      Vos modules disponibles
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0ede6;border-radius:8px;overflow:hidden">
      ${modulesHTML}
    </table>
  </td></tr>

  <!-- PAR OÙ COMMENCER -->
  <tr><td style="padding:0 32px 24px">
    <div style="font-size:11px;font-weight:700;color:#C9963A;letter-spacing:2px;text-transform:uppercase;margin-bottom:14px">
      Par où commencer
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f3;border-radius:8px;overflow:hidden">
      ${etapesHTML}
    </table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:8px 32px 32px;text-align:center">
    <a href="${url}" style="display:inline-block;background:#C9963A;color:#000;padding:15px 40px;border-radius:7px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.5px">
      Accéder à ma plateforme →
    </a>
    <p style="margin:14px 0 0;font-size:11px;color:#888">
      <a href="${url}" style="color:#C9963A;text-decoration:none">${url}</a>
    </p>
  </td></tr>

  <!-- AIDE -->
  <tr><td style="padding:16px 32px;background:#f5f0e8;border-top:1px solid #ece8e0">
    <table width="100%"><tr>
      <td style="font-size:12px;color:#6B6860">
        ❓ Besoin d'aide ? <a href="mailto:info@aureus-ia.com" style="color:#C9963A">info@aureus-ia.com</a>
      </td>
      <td align="right" style="font-size:11px;color:#aaa">
        Aureus IA SPRL · BCE BE 1028.230.781
      </td>
    </tr></table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
