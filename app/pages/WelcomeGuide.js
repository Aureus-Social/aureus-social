'use client';
import { useState } from 'react';

const GOLD = '#C9963A';

const ROLE_GUIDES = {
  admin: {
    label: 'Administrateur', icon: '👑', couleur: '#C9963A',
    bienvenue: 'Vous disposez des droits administrateur complets sur Aureus Social Pro.',
    modules_cles: [
      { icon: '👤', label: 'Employés', desc: 'Gérer tous les travailleurs', route: 'employees' },
      { icon: '◈', label: 'Fiches de Paie', desc: 'Générer et envoyer les fiches', route: 'payslip' },
      { icon: '📡', label: 'Déclarations', desc: 'Dimona, DmfA, Belcotax', route: 'declarations' },
      { icon: '🏢', label: 'Gestion Sociétés', desc: 'Gérer vos sociétés clientes', route: 'gestionsocietes' },
      { icon: '📊', label: 'Historique Paie', desc: 'Suivi complet par type', route: 'historiquepayroll' },
      { icon: '🔐', label: 'Rôles & Accès', desc: 'Inviter et gérer les utilisateurs', route: 'authroles' },
    ],
    etapes: [
      'Ajoutez vos employés dans "Liste & Fiches"',
      'Configurez vos déclarations ONSS',
      'Invitez vos collaborateurs via "Rôles & Accès"',
      'Activez les Smart Alertes pour les échéances',
    ]
  },
  secretariat: {
    label: 'Secrétariat Social', icon: '📋', couleur: '#5B9BD6',
    bienvenue: 'Votre espace est centré sur la gestion de la paie et les déclarations sociales.',
    modules_cles: [
      { icon: '◈', label: 'Fiches de Paie', desc: 'Générer les fiches du mois', route: 'payslip' },
      { icon: '🧮', label: 'Calcul & Simulation', desc: 'Net/brut instantané', route: 'calcinstant' },
      { icon: '📡', label: 'Dimona', desc: 'Soumettre les déclarations', route: 'declarations' },
      { icon: '📊', label: 'Historique Paie', desc: 'Historique complet', route: 'historiquepayroll' },
      { icon: '🔄', label: 'Clôture Mensuelle', desc: 'Valider la période', route: 'cloture' },
      { icon: '📤', label: 'Exports Comptables', desc: 'WinBooks, BOB, Exact', route: 'exportcompta' },
    ],
    etapes: [
      'Vérifiez les dossiers travailleurs dans "Liste & Fiches"',
      'Utilisez "Validation Pré-Paie" avant chaque clôture',
      'Générez les fiches et envoyez-les par email',
      'Exportez les écritures pour votre logiciel comptable',
    ]
  },
  commercial: {
    label: 'Commercial', icon: '🎯', couleur: '#4CAF80',
    bienvenue: 'Votre espace est dédié aux outils de prospection et aux guides commerciaux.',
    modules_cles: [
      { icon: '🔍', label: 'Diagnostic Client', desc: 'Analyser un prospect', route: 'diagnostic' },
      { icon: '⚔️', label: 'Comparatif Marché', desc: 'vs SD Worx / Partena', route: 'comparatif' },
      { icon: '📖', label: 'Guide Commercial', desc: 'Scripts et argumentaires', route: 'guidecommercial' },
      { icon: '🏢', label: 'Hub Fiduciaire', desc: 'Portail fiduciaires', route: 'hubfidu' },
      { icon: '✅', label: 'Checklist Reprise', desc: 'Reprendre un concurrent', route: 'checklistclient' },
      { icon: '📋', label: 'Procédures RH', desc: 'Répondre aux questions', route: 'proceduresrh' },
    ],
    etapes: [
      'Testez le Diagnostic Client en démo avec un prospect',
      'Préparez le Comparatif Marché pour vos rendez-vous',
      'Consultez le Guide Commercial pour les scripts',
      'Utilisez les Procédures RH pour les questions juridiques',
    ]
  },
  rh: {
    label: 'RH Entreprise', icon: '👥', couleur: '#a78bfa',
    bienvenue: 'Votre espace est dédié à la gestion quotidienne des ressources humaines.',
    modules_cles: [
      { icon: '👤', label: 'Liste Employés', desc: 'Dossiers des travailleurs', route: 'employees' },
      { icon: '🗓', label: 'Absences & Congés', desc: 'Gérer les absences', route: 'absences' },
      { icon: '🚀', label: 'Onboarding', desc: 'Intégrer un nouvel employé', route: 'onboarding' },
      { icon: '👋', label: 'Offboarding', desc: 'Gérer les départs', route: 'offboarding' },
      { icon: '📝', label: 'Générateur Contrats', desc: 'Créer des contrats', route: 'contratslegaux' },
      { icon: '📊', label: 'Dashboard RH', desc: 'KPIs absentéisme, turnover', route: 'dashrh' },
    ],
    etapes: [
      'Consultez le planning absences dans "Absences & Congés"',
      'Utilisez le Wizard Onboarding pour les nouveaux',
      'Configurez les alertes de fin de CDD',
      'Explorez le Dashboard RH pour vos KPIs',
    ]
  }
};

function getRoleGuide(role) {
  if (!role) return ROLE_GUIDES.admin;
  const k = role.toLowerCase();
  if (k.includes('admin')) return ROLE_GUIDES.admin;
  if (k.includes('secret') || k.includes('paie') || k.includes('social')) return ROLE_GUIDES.secretariat;
  if (k.includes('commercial') || k.includes('vente')) return ROLE_GUIDES.commercial;
  if (k.includes('rh') || k.includes('ressource') || k.includes('entreprise')) return ROLE_GUIDES.rh;
  return ROLE_GUIDES.admin;
}

export default function WelcomeGuide({ state, onNavigate, onDismiss }) {
  const guide = getRoleGuide(state?.userRole || state?.role || 'admin');
  const userName = state?.user?.name || state?.user?.email?.split('@')[0] || 'vous';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#141416', border: `1px solid ${guide.couleur}40`, borderRadius: 14, maxWidth: 680, width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: `0 0 60px ${guide.couleur}20` }}>

        {/* Header */}
        <div style={{ background: '#0D0D0E', padding: '24px 28px', borderBottom: '1px solid #2A2A30', borderRadius: '14px 14px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: GOLD, letterSpacing: 2 }}>AUREUS SOCIAL PRO</div>
              <div style={{ fontSize: 10, color: '#6B6860', letterSpacing: 3, marginTop: 2 }}>SÉCRÉTARIAT SOCIAL DIGITAL</div>
            </div>
            <span style={{ background: guide.couleur + '20', color: guide.couleur, padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
              {guide.icon} {guide.label}
            </span>
          </div>
        </div>

        {/* Bienvenue */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #2A2A30' }}>
          <h2 style={{ margin: '0 0 8px', color: '#fff', fontSize: 20 }}>Bienvenue, {userName} 👋</h2>
          <p style={{ margin: 0, color: '#6B6860', fontSize: 13, lineHeight: 1.6 }}>{guide.bienvenue}</p>
        </div>

        {/* Modules */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #2A2A30' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Vos modules</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {guide.modules_cles.map(m => (
              <div key={m.route} onClick={() => { onNavigate && onNavigate(m.route); onDismiss && onDismiss(); }}
                style={{ background: '#1A1A1E', border: '1px solid #2A2A30', borderRadius: 8, padding: '12px 14px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = guide.couleur}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A30'}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{m.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e6e0' }}>{m.label}</div>
                <div style={{ fontSize: 11, color: '#6B6860', marginTop: 2 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Premiers pas */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #2A2A30' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Par où commencer</div>
          {guide.etapes.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0', borderBottom: i < guide.etapes.length - 1 ? '1px solid #1A1A1E' : 'none' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: guide.couleur, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 13, color: '#e8e6e0', lineHeight: 1.5 }}>{e}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: '20px 28px', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={() => onDismiss && onDismiss()}
            style={{ background: 'none', border: '1px solid #2A2A30', color: '#6B6860', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            Passer
          </button>
          <button onClick={() => { onNavigate && onNavigate(guide.modules_cles[0].route); onDismiss && onDismiss(); }}
            style={{ background: GOLD, color: '#000', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Commencer {guide.modules_cles[0].icon} →
          </button>
        </div>
      </div>
    </div>
  );
}
