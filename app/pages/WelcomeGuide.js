'use client';
import { useState } from 'react';

const GOLD = '#C9963A';

const ROLE_GUIDES = {
  admin: {
    label: 'Administrateur', icon: '👑', color: GOLD,
    bienvenue: 'Bienvenue sur votre plateforme de secrétariat social digital.',
    description: 'Vous disposez d\'un accès complet. Voici comment démarrer efficacement.',
    etapes: [
      { icon: '🏢', titre: 'Configurez votre société', desc: 'Renseignez BCE, ONSS, CP paritaire, coordonnées bancaires.', action: 'gestionsocietes', cta: 'Configurer' },
      { icon: '👤', titre: 'Ajoutez vos employés', desc: 'Importez ou créez les dossiers de vos travailleurs.', action: 'employees', cta: 'Ajouter' },
      { icon: '💰', titre: 'Générez votre première fiche', desc: 'Calculez et envoyez une fiche de paie en quelques clics.', action: 'payslip', cta: 'Générer' },
      { icon: '📡', titre: 'Soumettez vos Dimona', desc: 'Déclarez vos travailleurs à l\'ONSS via l\'interface intégrée.', action: 'declarations', cta: 'Déclarer' },
      { icon: '🔐', titre: 'Invitez votre équipe', desc: 'Donnez accès à vos collaborateurs avec les bons rôles.', action: 'authroles', cta: 'Inviter' },
    ],
    raccourcis: [
      { label: 'Dashboard', id: 'dashboard', icon: '◫' },
      { label: 'Fiches de Paie', id: 'payslip', icon: '◈' },
      { label: 'ONSS & Dimona', id: 'declarations', icon: '📡' },
      { label: 'Exports Compta', id: 'exportcompta', icon: '📤' },
      { label: 'Smart Alertes', id: 'smartalerts', icon: '🔔' },
      { label: 'Audit Trail', id: 'audittrail', icon: '🔍' },
    ]
  },
  secretariat: {
    label: 'Secrétariat Social', icon: '📋', color: '#3b82f6',
    bienvenue: 'Bienvenue sur votre espace Secrétariat Social.',
    description: 'Gérez la paie, les déclarations et les exports comptables.',
    etapes: [
      { icon: '👥', titre: 'Consultez les dossiers', desc: 'Accédez aux dossiers travailleurs de vos clients.', action: 'employees', cta: 'Voir' },
      { icon: '🧮', titre: 'Calculez les salaires', desc: 'Simulateur net/brut pour des calculs instantanés.', action: 'calcinstant', cta: 'Simuler' },
      { icon: '📄', titre: 'Générez les fiches', desc: 'Créez et envoyez les fiches du mois par email.', action: 'payslip', cta: 'Générer' },
      { icon: '📡', titre: 'Dimona IN/OUT', desc: 'Traitez les entrées et sorties de personnel.', action: 'declarations', cta: 'Déclarer' },
      { icon: '📤', titre: 'Export comptable', desc: 'Générez WinBooks, BOB ou Exact Online.', action: 'exportcompta', cta: 'Exporter' },
    ],
    raccourcis: [
      { label: 'Fiches de Paie', id: 'payslip', icon: '◈' },
      { label: 'Calcul Instantané', id: 'calcinstant', icon: '🧮' },
      { label: 'ONSS & Dimona', id: 'declarations', icon: '📡' },
      { label: 'Belcotax 281.10', id: 'belcotax281', icon: '📊' },
      { label: 'Exports Compta', id: 'exportcompta', icon: '📤' },
      { label: 'Historique Paie', id: 'historiquepayroll', icon: '📊' },
    ]
  },
  commercial: {
    label: 'Commercial', icon: '🎯', color: '#a78bfa',
    bienvenue: 'Bienvenue sur votre espace Commercial.',
    description: 'Prospectez, diagnostiquez et convertissez vos clients.',
    etapes: [
      { icon: '🔍', titre: 'Analysez un prospect', desc: 'Identifiez les économies possibles vs son secrétariat actuel.', action: 'diagnostic', cta: 'Analyser' },
      { icon: '⚔️', titre: 'Comparez la concurrence', desc: 'Générez un comparatif SD Worx / Partena / Securex.', action: 'comparatif', cta: 'Comparer' },
      { icon: '📖', titre: 'Préparez votre pitch', desc: 'Scripts, objections et argumentaires.', action: 'guidecommercial', cta: 'Voir le guide' },
      { icon: '🏢', titre: 'Hub Fiduciaire', desc: 'Approchez les experts-comptables partenaires.', action: 'hubfidu', cta: 'Voir' },
      { icon: '✅', titre: 'Checklist reprise', desc: 'Processus complet de reprise d\'un concurrent.', action: 'checklistclient', cta: 'Voir' },
    ],
    raccourcis: [
      { label: 'Diagnostic Client', id: 'diagnostic', icon: '🔍' },
      { label: 'Comparatif Marché', id: 'comparatif', icon: '⚔️' },
      { label: 'Guide Commercial', id: 'guidecommercial', icon: '📖' },
      { label: 'Hub Fiduciaire', id: 'hubfidu', icon: '🏢' },
      { label: 'Checklist Reprise', id: 'checklistclient', icon: '✅' },
      { label: 'Procédures RH', id: 'proceduresrh', icon: '📋' },
    ]
  },
  rh_entreprise: {
    label: 'RH Entreprise', icon: '👥', color: '#22c55e',
    bienvenue: 'Bienvenue sur votre espace RH.',
    description: 'Gérez vos employés, absences, congés et contrats au quotidien.',
    etapes: [
      { icon: '👤', titre: 'Consultez vos employés', desc: 'Accédez aux dossiers complets de votre équipe.', action: 'employees', cta: 'Voir' },
      { icon: '🗓', titre: 'Gérez les absences', desc: 'Vue calendaire de toutes les absences et congés.', action: 'absences', cta: 'Gérer' },
      { icon: '✅', titre: 'Traitez les demandes', desc: 'Approuvez ou refusez les demandes de congé.', action: 'congesdemandes', cta: 'Traiter' },
      { icon: '📝', titre: 'Générez un contrat', desc: 'Contrat CDD ou CDI en quelques minutes.', action: 'generatcontrats', cta: 'Générer' },
      { icon: '🚀', titre: 'Onboardez un employé', desc: 'Wizard d\'intégration étape par étape.', action: 'onboarding', cta: 'Démarrer' },
    ],
    raccourcis: [
      { label: 'Liste Employés', id: 'employees', icon: '👤' },
      { label: 'Absences & Congés', id: 'absences', icon: '🗓' },
      { label: 'Planning Congés', id: 'conges', icon: '📅' },
      { label: 'Dashboard RH', id: 'dashrh', icon: '📊' },
      { label: 'Procédures RH', id: 'proceduresrh', icon: '📋' },
      { label: 'Portail Employé', id: 'portailemploye', icon: '🌐' },
    ]
  }
};

export default function WelcomeGuide({ state, dispatch, onNavigate, onDismiss }) {
  const userRole = state?.user?.user_metadata?.role || 'admin';
  const guide = ROLE_GUIDES[userRole] || ROLE_GUIDES.admin;
  const prenom = state?.user?.user_metadata?.prenom || state?.user?.email?.split('@')[0] || 'vous';

  const navigate = (id) => {
    if (onNavigate) onNavigate(id);
    if (dispatch) dispatch({ type: 'SET_PAGE', payload: id });
    if (onDismiss) onDismiss();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#141416', border: `1px solid ${guide.color}40`, borderRadius: 12, padding: 32, maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: `0 0 60px ${guide.color}15` }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 28 }}>{guide.icon}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Bienvenue, {prenom} !</span>
            </div>
            <div style={{ fontSize: 13, color: '#6B6860' }}>{guide.bienvenue}</div>
          </div>
          <button onClick={() => onDismiss && onDismiss()} style={{ background: 'none', border: '1px solid #2A2A30', color: '#6B6860', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, flexShrink: 0, marginLeft: 16 }}>✕</button>
        </div>

        {/* Badge rôle */}
        <div style={{ marginBottom: 20 }}>
          <span style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: guide.color + '20', color: guide.color }}>
            {guide.icon} {guide.label}
          </span>
          <span style={{ fontSize: 13, color: '#6B6860', marginLeft: 10 }}>{guide.description}</span>
        </div>

        {/* Étapes */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B6860', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Par où commencer ?</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {guide.etapes.map((e, i) => (
              <div key={i} onClick={() => navigate(e.action)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#1A1A1E', border: '1px solid #2A2A30', borderRadius: 8, padding: '10px 14px', cursor: 'pointer' }}
                onMouseEnter={el => el.currentTarget.style.borderColor = guide.color}
                onMouseLeave={el => el.currentTarget.style.borderColor = '#2A2A30'}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{e.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{e.titre}</div>
                  <div style={{ fontSize: 11, color: '#6B6860', marginTop: 1 }}>{e.desc}</div>
                </div>
                <span style={{ background: guide.color + '20', color: guide.color, border: `1px solid ${guide.color}30`, borderRadius: 4, padding: '3px 10px', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{e.cta} →</span>
              </div>
            ))}
          </div>
        </div>

        {/* Raccourcis */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B6860', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>Accès rapides</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {guide.raccourcis.map(r => (
              <button key={r.id} onClick={() => navigate(r.id)} style={{ background: '#1A1A1E', border: '1px solid #2A2A30', color: '#e8e6e0', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>
                {r.icon} {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ paddingTop: 16, borderTop: '1px solid #2A2A30', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#6B6860' }}>Rouvrez ce guide via Menu → Support</span>
          <button onClick={() => navigate('dashboard')} style={{ background: guide.color, color: '#000', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Accéder au dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
