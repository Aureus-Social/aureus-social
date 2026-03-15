'use client';
import { useLang } from '../lib/lang-context';
import { useState } from 'react';
import { PERMISSIONS, ROLES, KPI_SCOPE, MENU_BY_ROLE, hasPermission, getPermissionsForRole, ROLE_LABELS, ROLE_COLORS, ROLE_DESCRIPTIONS } from '@/app/lib/permissions';

function PH({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#c6a34e' }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: '#9e9b93', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function C({ children, style }) {
  return <div style={{ padding: '16px 20px', background: 'rgba(198,163,78,.03)', borderRadius: 12, border: '1px solid rgba(198,163,78,.06)', marginBottom: 14, ...style }}>{children}</div>;
}

function ST({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 700, color: '#c6a34e', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(198,163,78,.1)' }}>{children}</div>;
}

const PERM_LABELS = {
  voir_fiches_paie: '👁 Voir fiches de paie',
  calculer_paie: '🧮 Calculer la paie',
  simuler_salaires: '🔬 Simuler salaires',
  gestion_primes: '🎁 Gérer primes & avantages',
  cloture_mensuelle: '🔄 Clôture mensuelle',
  soumettre_dimona: '📡 Soumettre Dimona',
  declarations_onss: '🏛 Déclarations ONSS',
  exporter_comptabilite: '📤 Exporter comptabilité',
  sepa_virements: '💳 SEPA Virements',
  voir_travailleurs: '👤 Voir travailleurs',
  modifier_travailleurs: '✏️ Modifier travailleurs',
  onboarding: '🆕 Onboarding employes',
  gerer_contrats: '📝 Gérer contrats',
  gestion_absences: '🗓 Gérer absences',
  portail_employe: '🌐 Portail employé',
  procedures_rh: '📋 Procédures RH',
  voir_prospects: '🎯 Voir prospects',
  diagnostic_commercial: '🔍 Diagnostic commercial',
  guide_commercial: '📊 Guide commercial',
  checklist_client: '✅ Checklist client',
  gerer_facturation: '🧾 Gérer facturation',
  acces_audit_trail: '🔍 Accès audit trail',
  gerer_utilisateurs: '👑 Gérer utilisateurs',
  configuration_app: '⚙️ Configuration app',
  voir_dashboard_kpis: '📊 Voir dashboard KPIs',
  mandats_primes: '🏛 Mandats & primes emploi',
};

const MODULES_PAR_ROLE = {
  admin: {
    label: 'Administrateur',
    icon: '👑',
    color: '#c6a34e',
    desc: 'Accès total à tous les modules. Gestion complète de la plateforme, facturation, audit, configuration.',
    groupes: [
      { titre: 'Tableau de bord', items: ['Dashboard Principal', 'Command Center', 'Embauche A→Z', 'Journal Activité', 'Notifications', 'Smart Alerts', 'Tableau Direction'] },
      { titre: 'Gestion RH', items: ['Liste Employés', 'Dashboard RH', 'Onboarding', 'Contrats & Documents', 'Absences', 'Planning Congés', 'Registre Personnel', 'Procédures RH (64)', 'Portail Employé', 'Portail Client', 'Interimaires', 'Formulaire C4 / C131', 'Accident du Travail'] },
      { titre: 'Paie & Calculs', items: ['Fiches de Paie', 'Salaires & Calculs', 'Gestion Primes (57)', 'Calcul Instantané', 'Simulateurs Pro (41)', 'Clôture Mensuelle', 'Validation Pré-paie', 'Barèmes CP/PP', 'Véhicules ATN', 'Flexi-Jobs', 'Temps Partiel', 'Solde Tout Compte', 'Opti Fiscale'] },
      { titre: 'Déclarations & Compta', items: ['ONSS / Dimona', 'Belcotax 281.10', 'Export Winbooks/BOB/CODA/Octopus', 'Export Batch', 'SEPA Virements', 'Import CSV', 'Budget Prévisionnel', 'Reporting & Audit Fiscal'] },
      { titre: 'Concertation Sociale', items: ['CCT / Conventions', 'Seuils Sociaux', 'Bilan Social', 'Elections Sociales', 'Egalité H/F', 'Formation & Sécurité', 'Délégations Syndicales'] },
      { titre: 'Commercial & Prospects', items: ['Diagnostic Commercial', 'Checklist Client', 'Comparatif Marché', 'Guide Commercial', 'Hub Fiduciaire', 'Reprise Client', 'Audit Concurrent', 'Facturation'] },
      { titre: 'Mandats & Primes Emploi', items: ['Mandat ONSS/Mahis', 'Belcotax Mandat', 'Activa.brussels', '1er Employé Exonération', 'Art.60 CPAS', 'Impulsion 55+', 'MonBEE', 'Hub Connexions'] },
      { titre: 'Administration Système', items: ['Backup & Restore', 'Rôles & Permissions', 'Audit Trail', 'Audit Sécurité', 'RGPD Compliance', 'Monitoring', 'Intégrations', 'GED Documents', 'Mass Engine', 'Autopilot', 'Admin Barèmes', 'Changelog', 'Support', 'Aureus IA Suite'] },
    ]
  },
  secretariat: {
    label: 'Secrétariat Social',
    icon: '📋',
    color: '#3b82f6',
    desc: 'Secrétariat social partenaire. Accès complet paie, déclarations, ONSS, Dimona, exports comptables et gestion RH pour les clients.',
    groupes: [
      { titre: 'Tableau de bord', items: ['Dashboard Principal', 'Command Center', 'Embauche A→Z', 'Journal Activité', 'Notifications'] },
      { titre: 'Gestion RH', items: ['Liste Employés', 'Dashboard RH', 'Onboarding Wizard', 'Contrats & Documents', 'Formul. C4 / C131', 'Gestion Absences', 'Planning Congés', 'Accident du Travail', 'Jours Prestés', 'Registre Personnel', 'Procédures RH (64)', 'Portail Client', 'Interimaires'] },
      { titre: 'Paie & Calculs', items: ['Fiches de Paie', 'Salaires & Calculs', 'Gestion Primes (57)', 'Calcul Instantané', 'Simulateurs Pro (41)', 'Clôture Mensuelle', 'Validation Pré-paie', 'Barèmes CP/PP', 'Opti Fiscale', 'Flexi-Jobs', 'Véhicules ATN', 'Temps Partiel', 'Solde Tout Compte', 'Auto-Indexation'] },
      { titre: 'Déclarations & Compta', items: ['ONSS / Dimona', 'Déclarations Batch', 'Belcotax 281.10', 'Export Winbooks/BOB/CODA/Octopus', 'Export Batch', 'SEPA Virements', 'Import CSV', 'Charges ONSS', 'Chômage Temporaire', 'Audit Fiscal SPF', 'Budget Prévisionnel', 'Rapports Mensuels', 'Mass Engine'] },
      { titre: 'Concertation Sociale', items: ['CCT / Conventions', 'Seuils Sociaux', 'Bilan Social', 'Egalité H/F', 'Elections Sociales', 'Formation & Sécurité', 'Social & Assurances'] },
      { titre: 'Mandats & Primes Emploi', items: ['Mandat ONSS/Mahis', 'Belcotax Mandat', 'Activa.brussels', '1er Employé Exonération', 'Art.60 CPAS', 'Impulsion 55+', 'MonBEE', 'Hub Connexions'] },
    ]
  },
  commercial: {
    label: 'Commercial',
    icon: '🎯',
    color: '#a78bfa',
    desc: 'Équipe commerciale Aureus. Accès aux outils de prospection, diagnostic, comparatifs et facturation. Pas d\'accès aux données paie des clients.',
    groupes: [
      { titre: 'Tableau de bord', items: ['Dashboard Principal', 'Notifications'] },
      { titre: 'Commercial & Prospects', items: ['Diagnostic Commercial', 'Diagnostic Prospect', 'Checklist Client', 'Comparatif Marché', 'Guide Commercial', 'Guide Fiduciaire', 'Hub Fiduciaire', 'Page Commerciale', 'Audit Concurrent', 'Reprise Client', 'Docs Juridiques'] },
      { titre: 'Facturation & Reporting', items: ['Facturation', 'Rapports par Rôle', 'Portail Client'] },
      { titre: 'Outils de simulation (lecture)', items: ['Calcul Instantané', 'Simulateur Embauche', 'Simulateurs Pro', 'Comparateur Salarial', 'Coût Total', 'Opti Fiscale', 'Barèmes CP', 'Seuils Sociaux'] },
    ]
  },
  rh_entreprise: {
    label: 'RH Entreprise',
    icon: '🏢',
    color: '#22c55e',
    desc: 'Responsable RH d\'une société cliente. Accès à la gestion de ses propres employés, absences, contrats, portail et documents. Lecture seule sur les fiches de paie.',
    groupes: [
      { titre: 'Tableau de bord', items: ['Dashboard Principal', 'Dashboard RH', 'Notifications', 'Embauche A→Z'] },
      { titre: 'Gestion RH', items: ['Liste Employés', 'Onboarding', 'Contrats & Docs', 'Aides à l\'embauche', 'Absences & Congés', 'Demandes Congés', 'Offboarding', 'Accident du Travail', 'Assurance-Loi AT', 'Procédures RH', 'Portail Employé'] },
      { titre: 'Gestion contrat', items: ['Calcul Maladie', 'Chômage Temporaire', 'Crédit-Temps', 'Temps Partiel', 'Simulateur Licenciement', 'Compte Individuel'] },
      { titre: 'Paie (lecture)', items: ['Fiches de Paie', 'Fiches PDF', 'Historique Paie', 'Primes & Avantages', 'Barèmes & Seuils', 'Chèques-Repas', 'Caisse Vacances', 'Coûts Annuels'] },
      { titre: 'Documents', items: ['Documents Sociaux DRS', 'Échéancier'] },
    ]
  },

  employe: {
    label: 'Employé',
    icon: '👤',
    color: '#06b6d4',
    desc: 'Travailleur d\'une société cliente. Accès uniquement à ses propres données — fiches de paie, congés, récapitulatif annuel. Isolation totale des données des autres employés.',
    groupes: [
      { titre: 'Mon espace', items: ['Dashboard (personnel)', 'Portail Employé'] },
      { titre: 'Mes documents', items: ['Mes Fiches de Paie (PDF)', 'Mon Compte Individuel (recap annuel)'] },
      { titre: 'Mes congés', items: ['Demander un Congé', 'Voir mes Absences'] },
      { titre: 'Information', items: ['Échéancier Social (lecture)'] },
    ]
  },

  comptable: {
    label: 'Comptable Externe',
    icon: '🧮',
    color: '#f97316',
    desc: 'Comptable ou fiduciaire externe. Accès limité aux exports comptables, SEPA, Belcotax et facturation. Aucun accès aux données RH ou aux fiches de paie individuelles.',
    groupes: [
      { titre: 'Tableau de bord', items: ['Dashboard (synthèse)'] },
      { titre: 'Exports & Comptabilité', items: ['Exports Comptables (WinBooks, BOB, Exact)', 'Connecteurs Comptables', 'SEPA Virements', 'Rapports'] },
      { titre: 'Fiscal & TVA', items: ['Belcotax 281.xx', 'Listing TVA Annuel', 'Facturation', 'Échéancier Fiscal'] },
    ]
  },
};

export default function RolesPermissions({ s }) {
  const { tText } = useLang();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [tab, setTab] = useState('modules');

  const role = MODULES_PAR_ROLE[selectedRole];
  const perms = Object.entries(PERMISSIONS);

  return (
    <div>
      <PH title="Gestion des Rôles & Accès" sub="6 profils utilisateur — filtrage menu automatique + garde d'accès serveur" />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { k: 'modules', label: '📦 Modules par profil' },
          { k: 'matrice', label: '🔐 Matrice permissions' },
          { k: 'kpis', label: '📊 Périmètre KPIs' },
        ].map(({ k, label }) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: tab === k ? 700 : 400, fontFamily: 'inherit', background: tab === k ? 'rgba(198,163,78,.15)' : 'rgba(255,255,255,.03)', color: tab === k ? '#c6a34e' : '#9e9b93' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Sélecteur de rôle */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {ROLES.map(r => (
          <button key={r} onClick={() => setSelectedRole(r)}
            style={{
              padding: '10px 18px', borderRadius: 10, border: `1px solid ${r === selectedRole ? ROLE_COLORS[r] : 'rgba(255,255,255,.06)'}`,
              background: r === selectedRole ? `${ROLE_COLORS[r]}18` : 'rgba(255,255,255,.02)',
              color: r === selectedRole ? ROLE_COLORS[r] : '#9e9b93', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12, fontWeight: r === selectedRole ? 700 : 400, display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s'
            }}>
            <span>{MODULES_PAR_ROLE[r].icon}</span>
            <span>{ROLE_LABELS[r]}</span>
          </button>
        ))}
      </div>

      {/* ── TAB : MODULES ────────────────────────────────────── */}
      {tab === 'modules' && (
        <>
          <C style={{ borderColor: `${role.color}30`, background: `${role.color}08` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>{role.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: role.color }}>{role.label}</div>
                <div style={{ fontSize: 11, color: '#9e9b93', marginTop: 2 }}>{role.desc}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {getPermissionsForRole(selectedRole).map(p => (
                <span key={p} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: `${role.color}15`, color: role.color, fontWeight: 600 }}>
                  {PERM_LABELS[p] || p}
                </span>
              ))}
            </div>
          </C>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {(role.groupes || []).map((g, i) => (
              <C key={i} style={{ marginBottom: 0 }}>
                <ST>{g.titre}</ST>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {(g.items || []).map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#c8c5bc', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                      <span style={{ color: role.color, fontSize: 10 }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 10, color: '#5e5c56', fontWeight: 600 }}>
                  {g.items.length} module{g.items.length > 1 ? 's' : ''}
                </div>
              </C>
            ))}
          </div>

          {/* Modules BLOQUÉS pour ce rôle */}
          {selectedRole !== 'admin' && (
            <C style={{ marginTop: 14, borderColor: 'rgba(239,68,68,.15)', background: 'rgba(239,68,68,.03)' }}>
              <ST style={{ color: '#ef4444' }}>🚫 Accès bloqué pour ce profil</ST>
              <div style={{ fontSize: 11, color: '#9e9b93', lineHeight: 1.7 }}>
                {selectedRole === 'secretariat' && 'Commercial & Prospects — Audit Trail — Configuration système — Backup & Restore — Rôles & Permissions — Portail Employé (privé)'}
                {selectedRole === 'commercial' && 'Fiches de paie — Calcul paie — ONSS/Dimona — Exports comptables — SEPA — RH & Contrats — Mandats & Primes — Administration système — Audit Trail'}
                {selectedRole === 'rh_entreprise' && 'Calcul paie — ONSS/Dimona — Exports comptables — SEPA — Commercial & Prospects — Mandats & Primes — Clôture mensuelle — Administration système — Audit Trail'}
              </div>
            </C>
          )}
        </>
      )}

      {/* ── TAB : MATRICE ────────────────────────────────────── */}
      {tab === 'matrice' && (
        <C>
          <ST>Matrice complète — {ROLES.length} profils × {Object.keys(PERMISSIONS).length} permissions</ST>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#c6a34e', borderBottom: '2px solid rgba(198,163,78,.2)', fontSize: 10, fontWeight: 700, minWidth: 220 }}>
                    Permission
                  </th>
                  {ROLES.map(r => (
                    <th key={r} style={{ padding: '8px 12px', textAlign: 'center', color: ROLE_COLORS[r], borderBottom: '2px solid rgba(198,163,78,.2)', fontSize: 10, fontWeight: 700, minWidth: 110 }}>
                      {MODULES_PAR_ROLE[r].icon} {ROLE_LABELS[r]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {perms.map(([perm, roleMap], i) => (
                  <tr key={perm} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.01)' }}>
                    <td style={{ padding: '7px 12px', color: '#e8e6e0', borderBottom: '1px solid rgba(255,255,255,.03)', fontSize: 11 }}>
                      {PERM_LABELS[perm] || perm}
                    </td>
                    {ROLES.map(r => (
                      <td key={r} style={{ padding: '7px 12px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                        {roleMap[r]
                          ? <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 14 }}>✓</span>
                          : <span style={{ color: '#3f3d38', fontSize: 14 }}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </C>
      )}

      {/* ── TAB : KPIs ───────────────────────────────────────── */}
      {tab === 'kpis' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {ROLES.map(r => (
            <C key={r} style={{ borderColor: `${ROLE_COLORS[r]}25` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{MODULES_PAR_ROLE[r].icon}</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: ROLE_COLORS[r] }}>{ROLE_LABELS[r]}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(KPI_SCOPE[r] || []).map(kpi => (
                  <div key={kpi} style={{ fontSize: 11, color: kpi === 'all' ? '#c6a34e' : '#c8c5bc', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: ROLE_COLORS[r], fontSize: 10 }}>▸</span>
                    {kpi === 'all' ? '🔑 Tous les KPIs' : kpi.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
            </C>
          ))}
        </div>
      )}

      {/* Notice technique */}
      <C style={{ marginTop: 20, background: 'rgba(198,163,78,.02)', borderStyle: 'dashed' }}>
        <div style={{ fontSize: 11, color: '#9e9b93', lineHeight: 1.7 }}>
          <strong style={{ color: '#c6a34e' }}>⚙️ Implémentation technique</strong><br />
          Le rôle est lu depuis <code style={{ color: '#a78bfa', fontSize: 10 }}>user.user_metadata.role</code> (Supabase Auth).<br />
          Le filtrage du menu est appliqué côté client dans <code style={{ color: '#a78bfa', fontSize: 10 }}>layout-client.js</code> via <code style={{ color: '#a78bfa', fontSize: 10 }}>getMenuForRole()</code>.<br />
          La garde d&apos;accès aux pages est appliquée via <code style={{ color: '#a78bfa', fontSize: 10 }}>canAccessPage()</code> avant tout rendu.<br />
          Les permissions API sont vérifiées côté serveur via <code style={{ color: '#a78bfa', fontSize: 10 }}>checkApiPermission()</code> dans les routes Next.js.<br />
          Pour assigner un rôle : Supabase Dashboard → Authentication → Users → Edit → user_metadata → <code style={{ color: '#3b82f6', fontSize: 10 }}>{'"role": "secretariat"'}</code>
        </div>
      </C>
    </div>
  );
}
