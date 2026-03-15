// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — /api/invite-role
// Invitation utilisateur avec email mode d'emploi par rôle
// ═══════════════════════════════════════════════════════════════
import { sbFromRequest, sbAdmin, checkRole } from '@/app/lib/supabase-server';
export const dynamic = 'force-dynamic';

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = 'Aureus Social Pro <noreply@aureussocial.be>';
const APP_URL = 'https://app.aureussocial.be';

const ROLE_DATA = {
  admin: {
    label: 'Administrateur',
    icon: '👑',
    color: '#C9963A',
    description: 'Vous disposez d\'un accès complet à toutes les fonctionnalités.',
    modules: ['Tableau de bord complet', 'Gestion RH & Paie', 'Déclarations ONSS/Dimona', 'Administration & Sécurité', 'Exports comptables', 'Audit trail'],
    premieres_etapes: [
      { n: 1, titre: 'Connexion', desc: 'Connectez-vous sur app.aureussocial.be avec cet email' },
      { n: 2, titre: 'Dashboard', desc: 'Consultez vos KPIs, alertes et prochaines échéances' },
      { n: 3, titre: 'Employés', desc: 'Ajoutez vos premiers travailleurs via Menu → Nouvel employé' },
      { n: 4, titre: 'Première paie', desc: 'Menu Paie → Fiches de Paie → Générer et envoyer par email' },
    ]
  },
  secretariat: {
    label: 'Secrétariat Social',
    icon: '📋',
    color: '#3b82f6',
    description: 'Vous gérez la paie, les déclarations ONSS et les exports comptables.',
    modules: ['Fiches de Paie', 'Calcul & Simulation', 'Dimona IN/OUT', 'DmfA trimestrielle', 'Belcotax 281.10', 'Exports WinBooks/BOB/Exact'],
    premieres_etapes: [
      { n: 1, titre: 'Connexion', desc: 'Connectez-vous sur app.aureussocial.be avec cet email' },
      { n: 2, titre: 'Dossiers travailleurs', desc: 'Menu Employés → Liste & Fiches → consulter les dossiers' },
      { n: 3, titre: 'Calculer un salaire', desc: 'Menu Paie → Calcul & Simulation → entrer le brut → résultat instantané' },
      { n: 4, titre: 'Soumettre Dimona', desc: 'Menu Déclarations → ONSS & Dimona → Nouvelle Dimona' },
    ]
  },
  commercial: {
    label: 'Commercial',
    icon: '🎯',
    color: '#a78bfa',
    description: 'Vous accédez aux outils de prospection, diagnostics et guides commerciaux.',
    modules: ['Diagnostic Client', 'Comparatif Marché', 'Guide Commercial', 'Hub Fiduciaire', 'Checklist Reprise', 'Procédures RH (64)'],
    premieres_etapes: [
      { n: 1, titre: 'Connexion', desc: 'Connectez-vous sur app.aureussocial.be avec cet email' },
      { n: 2, titre: 'Diagnostic prospect', desc: 'Menu Commercial → Diagnostic Client → analyser un prospect' },
      { n: 3, titre: 'Comparatif', desc: 'Menu Commercial → Comparatif Marché → générer un PDF à envoyer' },
      { n: 4, titre: 'Guide de vente', desc: 'Menu Commercial → Guide Commercial → scripts et objections' },
    ]
  },
  rh_entreprise: {
    label: 'RH Entreprise',
    icon: '👥',
    color: '#22c55e',
    description: 'Vous gérez les employés, absences, congés et contrats de votre entreprise.',
    modules: ['Liste & Fiches Employés', 'Absences & Congés', 'Planning Congés', 'Générateur Contrats', 'Onboarding Wizard', 'Dashboard RH'],
    premieres_etapes: [
      { n: 1, titre: 'Connexion', desc: 'Connectez-vous sur app.aureussocial.be avec cet email' },
      { n: 2, titre: 'Vos employés', desc: 'Menu Employés → Liste & Fiches → consulter les dossiers' },
      { n: 3, titre: 'Gérer les absences', desc: 'Menu Employés → Absences & Congés → vue calendaire de l\'équipe' },
      { n: 4, titre: 'Traiter les congés', desc: 'Menu Employés → Demandes Congés → approuver ou refuser' },
    ]
  }
};

function buildEmailHTML(prenom, role, roleData, tempPassword, societe) {
  const steps = roleData.premieres_etapes.map(s => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #f0ede6;vertical-align:top;width:36px">
        <div style="width:28px;height:28px;border-radius:50%;background:${roleData.color};color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;text-align:center;line-height:28px">${s.n}</div>
      </td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0ede6">
        <div style="font-size:13px;font-weight:600;color:#1a1a1a">${s.titre}</div>
        <div style="font-size:12px;color:#6B6860;margin-top:2px">${s.desc}</div>
      </td>
    </tr>`).join('');

  const modules = roleData.modules.map(m =>
    `<span style="display:inline-block;padding:3px 10px;margin:3px;border-radius:4px;font-size:11px;background:${roleData.color}15;color:${roleData.color};font-weight:600">${m}</span>`
  ).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Inter,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">

  <!-- HEADER -->
  <tr><td style="background:#0D0D0E;padding:28px 32px">
    <table width="100%"><tr>
      <td><div style="font-size:22px;font-weight:800;color:#C9963A;letter-spacing:2px">AUREUS</div>
        <div style="font-size:10px;color:#6B6860;letter-spacing:3px;margin-top:2px">SOCIAL PRO</div></td>
      <td align="right">
        <div style="background:${roleData.color}20;border:1px solid ${roleData.color}40;padding:6px 14px;border-radius:20px;display:inline-block">
          <span style="font-size:14px">${roleData.icon}</span>
          <span style="font-size:12px;font-weight:600;color:${roleData.color};margin-left:6px">${roleData.label}</span>
        </div>
      </td>
    </tr></table>
  </td></tr>

  <!-- WELCOME -->
  <tr><td style="padding:28px 32px;border-bottom:1px solid #f0ede6">
    <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">Bienvenue sur Aureus Social Pro, ${prenom} 👋</h2>
    ${societe ? `<div style="font-size:12px;color:#C9963A;font-weight:600;margin-bottom:6px">${societe}</div>` : ""}<p style="margin:0;font-size:13px;color:#6B6860;line-height:1.6">${roleData.description}</p>
  </td></tr>

  <!-- ACCÈS -->
  <tr><td style="padding:20px 32px;border-bottom:1px solid #f0ede6">
    <div style="font-size:12px;font-weight:600;color:#6B6860;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Vos modules accessibles</div>
    <div>${modules}</div>
  </td></tr>

  <!-- CONNEXION -->
  <tr><td style="padding:20px 32px;background:#f9f7f3;border-bottom:1px solid #f0ede6">
    <div style="font-size:12px;font-weight:600;color:#6B6860;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Vos identifiants de connexion</div>
    <table width="100%">
      <tr><td style="font-size:13px;color:#1a1a1a;padding:4px 0"><strong>URL :</strong></td><td style="font-size:13px;color:#C9963A">app.aureussocial.be</td></tr>
      <tr><td style='font-size:13px;color:#1a1a1a;padding:4px 0'><strong>Mot de passe temporaire :</strong></td>
       <td style='font-family:monospace;font-size:16px;font-weight:800;color:#C9963A;letter-spacing:2px'>${tempPassword}</td></tr>
       <tr><td colspan='2' style='font-size:11px;color:#6B6860;padding-top:4px'>Changez votre mot de passe après la première connexion.</td></tr>
    </table>
  </td></tr>

  <!-- ÉTAPES -->
  <tr><td style="padding:20px 32px;border-bottom:1px solid #f0ede6">
    <div style="font-size:12px;font-weight:600;color:#6B6860;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Par où commencer ?</div>
    <table width="100%" cellpadding="0" cellspacing="0">${steps}</table>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:24px 32px;text-align:center">
    <a href="https://app.aureussocial.be" style="background:${roleData.color};color:${role === 'admin' ? '#000' : '#fff'};padding:14px 36px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
      Se connecter à ma plateforme →
    </a>
    <p style="font-size:11px;color:#6B6860;margin-top:12px">Des questions ? Contactez-nous : info@aureus-ia.com</p>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="padding:16px 32px;background:#f5f0e8;border-top:1px solid #e8e4dc;text-align:center">
    <div style="font-size:11px;color:#6B6860">Aureus IA SPRL · BCE BE 1028.230.781 · Place Marcel Broodthaers 8, 1060 Saint-Gilles</div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'admin_only'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });
  if (!RESEND_KEY) return Response.json({ error: 'RESEND_API_KEY manquante' }, { status: 500 });

  const { email, prenom, nom, role = 'secretariat', societe } = await req.json();
  if (!email || !email.includes('@')) return Response.json({ error: 'Email valide requis' }, { status: 400 });
  if (!ROLE_DATA[role]) return Response.json({ error: 'Rôle invalide' }, { status: 400 });

  const roleData = ROLE_DATA[role];
  const prenomDisplay = prenom || email.split('@')[0];

  // 1. Créer ou mettre à jour l'utilisateur avec mot de passe temporaire
  const tempPassword = Math.random().toString(36).slice(2, 6).toUpperCase() +
                       Math.random().toString(36).slice(2, 6) +
                       Math.floor(Math.random() * 90 + 10);

  try {
    const admin = sbAdmin();

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUsers } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const existingUser = existingUsers?.users?.find(usr => usr.email === email);

    if (existingUser) {
      // Mettre à jour rôle + nouveau mot de passe temporaire
      await admin.auth.admin.updateUserById(existingUser.id, {
        password: tempPassword,
        user_metadata: { role, prenom, nom, societe, approved: true }
      });
    } else {
      // Créer le compte directement
      await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { role, prenom, nom, societe, approved: true, invited_by: u.email }
      });
    }
  } catch(e) { console.error('createUser error:', e.message); }

  // 2. Envoyer l'email Resend avec le vrai lien d'accès
  const html = buildEmailHTML(prenomDisplay, role, roleData, tempPassword, societe);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      subject: `Votre accès Aureus Social Pro — ${roleData.label}`,
      html
    })
  });

  const result = await res.json();
  if (!res.ok) return Response.json({ error: result.message }, { status: 500 });

  // 3. Log audit
  await db.from('audit_log').insert([{
    user_id: u.id, user_email: u.email,
    action: 'INVITE_USER_WITH_ROLE',
    table_name: 'auth.users',
    new_values: { email, role, societe },
    created_at: new Date().toISOString()
  }]).catch(() => {});

  return Response.json({ 
    ok: true, 
    email_id: result.id, 
    role, 
    
    roleData: { label: roleData.label, icon: roleData.icon } 
  });
}

// ── GET — liste tous les utilisateurs ─────────────────────────
export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'admin_only'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });

  try {
    const admin = sbAdmin();
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ users: data.users || [] });
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// ── PUT — modifier le rôle d'un utilisateur ───────────────────
export async function PUT(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'admin_only'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });

  const { userId, role } = await req.json();
  if (!userId || !role) return Response.json({ error: 'userId et role requis' }, { status: 400 });

  const VALID_ROLES = ['admin', 'secretariat', 'commercial', 'rh_entreprise', 'employe', 'comptable'];
  if (!VALID_ROLES.includes(role)) return Response.json({ error: 'Rôle invalide' }, { status: 400 });

  try {
    const admin = sbAdmin();
    const { error } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: { role }
    });
    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Log audit
    await db.from('audit_log').insert([{
      user_id: u.id, user_email: u.email,
      action: 'UPDATE_USER_ROLE',
      table_name: 'auth.users',
      new_values: { userId, role },
      created_at: new Date().toISOString()
    }]).catch(() => {});

    return Response.json({ ok: true, userId, role });
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// ── DELETE — désactiver un utilisateur ────────────────────────
export async function DELETE(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'admin_only'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return Response.json({ error: 'userId requis' }, { status: 400 });
  // Sécurité : ne pas supprimer son propre compte
  if (userId === u.id) return Response.json({ error: 'Impossible de désactiver votre propre compte' }, { status: 400 });

  try {
    const admin = sbAdmin();
    // Ban plutôt que delete — désactive sans supprimer les données
    const { error } = await admin.auth.admin.updateUserById(userId, {
      ban_duration: '87600h' // 10 ans = désactivé
    });
    if (error) return Response.json({ error: error.message }, { status: 500 });

    await db.from('audit_log').insert([{
      user_id: u.id, user_email: u.email,
      action: 'DEACTIVATE_USER',
      table_name: 'auth.users',
      new_values: { userId },
      created_at: new Date().toISOString()
    }]).catch(() => {});

    return Response.json({ ok: true, userId });
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
