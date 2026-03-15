// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — /api/access
// Gestion des demandes d'accès et validation admin
// ═══════════════════════════════════════════════════════════════
import { sbFromRequest, sbAdmin, checkRole } from '@/app/lib/supabase-server';
export const dynamic = 'force-dynamic';

const RESEND_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.SECURITY_ALERT_EMAIL || 'info@aureus-ia.com';
const FROM = 'Aureus Social Pro <noreply@aureussocial.be>';
const APP_URL = 'https://app.aureussocial.be';

const ROLE_LABELS = {
  fiduciaire:   '🏢 Fiduciaire / Cabinet comptable',
  comptable:    '📊 Expert-comptable indépendant',
  rh_societe:   '👥 Service RH d\'une société',
  rh_employeur: '🏭 RH interne employeur',
  employeur:    '👔 Employeur direct (PME)',
};

async function sendEmail(to, subject, html) {
  if (!RESEND_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  }).catch(() => {});
}

// GET — vérifier son propre statut d'accès
export async function GET(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'authenticated'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const admin = searchParams.get('admin');

  // Mode admin — lister toutes les demandes (réservé à info@aureus-ia.com)
  if (admin === '1') {
    const isAdmin = u.email === 'info@aureus-ia.com' || u.email === 'moussati.nourdin@gmail.com';
    if (!isAdmin) return Response.json({ error: 'Accès admin requis' }, { status: 403 });
    const db2 = sbAdmin();
    const { data } = await db2.from('access_requests').select('*').order('created_at', { ascending: false }).limit(100);
    return Response.json({ ok: true, data: data || [] });
  }

  // Mode user — sa propre demande
  const { data } = await db.from('access_requests').select('*').eq('user_id', u.id).single().catch(() => ({ data: null }));
  return Response.json({ ok: true, data, user: { email: u.email, id: u.id } });
}

// POST — soumettre une demande d'accès
export async function POST(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'authenticated'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });

  const body = await req.json();
  const { full_name, company_name, company_bce, role_type, phone, message, nb_employees, nb_dossiers } = body;

  if (!full_name || !role_type) return Response.json({ error: 'Nom et type de rôle requis' }, { status: 400 });
  if (!Object.keys(ROLE_LABELS).includes(role_type)) return Response.json({ error: 'Rôle invalide' }, { status: 400 });

  // Vérifier si déjà une demande
  const { data: existing } = await db.from('access_requests').select('id,status').eq('user_id', u.id).single().catch(() => ({ data: null }));
  if (existing) return Response.json({ ok: true, data: existing, message: 'Demande déjà soumise' });

  const { data, error } = await db.from('access_requests').insert([{
    user_id: u.id, email: u.email, full_name, company_name, company_bce,
    role_type, phone, message, nb_employees, nb_dossiers,
    status: 'pending', created_at: new Date().toISOString(),
  }]).select().single();

  if (error) return Response.json({ error: process.env.NODE_ENV === 'production' ? 'Erreur interne' : error.message }, { status: 400 });

  // Email à l'admin (toi)
  await sendEmail(ADMIN_EMAIL,
    `🔔 Nouvelle demande d'accès — ${full_name} (${ROLE_LABELS[role_type]})`,
    `<div style="font-family:Arial,sans-serif;max-width:600px">
      <div style="background:#0d1117;padding:16px 24px"><span style="color:#c6a34e;font-weight:800;font-size:16px">AUREUS SOCIAL PRO</span></div>
      <div style="padding:20px">
        <h2 style="color:#0d1117;margin:0 0 16px">Nouvelle demande d'accès</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:7px;background:#f9f9f9;font-weight:bold;width:40%">Nom</td><td style="padding:7px">${full_name}</td></tr>
          <tr><td style="padding:7px;font-weight:bold">Email</td><td style="padding:7px">${u.email}</td></tr>
          <tr><td style="padding:7px;background:#f9f9f9;font-weight:bold">Rôle demandé</td><td style="padding:7px"><b>${ROLE_LABELS[role_type]}</b></td></tr>
          <tr><td style="padding:7px;font-weight:bold">Société</td><td style="padding:7px">${company_name || '—'}</td></tr>
          <tr><td style="padding:7px;background:#f9f9f9;font-weight:bold">BCE</td><td style="padding:7px">${company_bce || '—'}</td></tr>
          <tr><td style="padding:7px;font-weight:bold">Téléphone</td><td style="padding:7px">${phone || '—'}</td></tr>
          ${role_type === 'fiduciaire' || role_type === 'comptable' ? `<tr><td style="padding:7px;background:#f9f9f9;font-weight:bold">Nb dossiers clients</td><td style="padding:7px">${nb_dossiers || '—'}</td></tr>` : ''}
          ${role_type === 'employeur' || role_type === 'rh_societe' || role_type === 'rh_employeur' ? `<tr><td style="padding:7px;font-weight:bold">Nb employés</td><td style="padding:7px">${nb_employees || '—'}</td></tr>` : ''}
          ${message ? `<tr><td style="padding:7px;background:#f9f9f9;font-weight:bold">Message</td><td style="padding:7px">${message}</td></tr>` : ''}
        </table>
        <div style="margin-top:20px;display:flex;gap:10px">
          <a href="${APP_URL}/admin/access?approve=${data.id}" style="background:#16a34a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">✅ Approuver</a>
          <a href="${APP_URL}/admin/access?reject=${data.id}" style="background:#dc2626;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">❌ Refuser</a>
        </div>
        <p style="color:#888;font-size:11px;margin-top:16px">Ou gérez les accès directement dans l'app : Administration → Demandes d'accès</p>
      </div>
    </div>`
  );

  // Email au demandeur
  await sendEmail(u.email,
    'Demande d\'accès reçue — Aureus Social Pro',
    `<div style="font-family:Arial,sans-serif;max-width:600px">
      <div style="background:#0d1117;padding:16px 24px"><span style="color:#c6a34e;font-weight:800;font-size:16px">AUREUS SOCIAL PRO</span></div>
      <div style="padding:24px">
        <h2>Demande reçue, ${full_name} 👋</h2>
        <p>Votre demande d'accès en tant que <b>${ROLE_LABELS[role_type]}</b> a bien été reçue.</p>
        <p>Notre équipe va vérifier votre profil et vous contacter dans les <b>24 heures ouvrables</b>.</p>
        <p style="color:#666;font-size:11px;margin-top:20px">AUREUS IA SPRL · BCE BE 1028.230.781 · info@aureus-ia.com</p>
      </div>
    </div>`
  );

  return Response.json({ ok: true, data }, { status: 201 });
}

// PUT — admin approuve ou refuse (toi uniquement)
export async function PUT(req) {
  const { db, user: u } = await sbFromRequest(req);
  if (!u || !db) return Response.json({ error: 'Non autorisé' }, { status: 401 });
  const _rc = checkRole(u, 'authenticated'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });

  const isAdmin = u.email === 'info@aureus-ia.com' || u.email === 'moussati.nourdin@gmail.com';
  if (!isAdmin) return Response.json({ error: 'Accès admin requis' }, { status: 403 });

  const body = await req.json();
  const { id, action, rejected_reason, role_type } = body; // action: 'approve' | 'reject' | 'block'

  if (!id || !action) return Response.json({ error: 'id et action requis' }, { status: 400 });
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: 'ID invalide' }, { status: 400 });

  const db2 = sbAdmin();

  // Récupérer la demande
  const { data: req_data } = await db2.from('access_requests').select('*').eq('id', id).single();
  if (!req_data) return Response.json({ error: 'Demande introuvable' }, { status: 404 });

  const newStatus = action === 'approve' ? 'approved' : action === 'block' ? 'blocked' : 'rejected';

  // Mettre à jour la demande
  await db2.from('access_requests').update({
    status: newStatus,
    approved_by: u.email,
    approved_at: new Date().toISOString(),
    rejected_reason: rejected_reason || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id);

  // Si approuvé — mettre à jour user_metadata avec le rôle
  if (action === 'approve') {
    const finalRole = role_type || req_data.role_type;
    await db2.auth.admin.updateUserById(req_data.user_id, {
      user_metadata: {
        role: finalRole,
        approved: true,
        approved_at: new Date().toISOString(),
        full_name: req_data.full_name,
        company_name: req_data.company_name,
        company_bce: req_data.company_bce,
      },
    });

    // Email d'approbation au client
    await sendEmail(req_data.email,
      '✅ Votre accès à Aureus Social Pro est activé !',
      `<div style="font-family:Arial,sans-serif;max-width:600px">
        <div style="background:#0d1117;padding:16px 24px"><span style="color:#c6a34e;font-weight:800;font-size:16px">AUREUS SOCIAL PRO</span></div>
        <div style="padding:24px">
          <h2 style="color:#16a34a">✅ Accès activé, ${req_data.full_name} !</h2>
          <p>Votre compte <b>${ROLE_LABELS[req_data.role_type]}</b> est maintenant actif.</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${APP_URL}" style="background:#c6a34e;color:#0d1117;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
              Accéder à Aureus Social Pro →
            </a>
          </div>
          <p style="color:#666;font-size:11px">AUREUS IA SPRL · BCE BE 1028.230.781 · info@aureus-ia.com</p>
        </div>
      </div>`
    );
  } else {
    // Email de refus
    await sendEmail(req_data.email,
      'Votre demande d\'accès — Aureus Social Pro',
      `<div style="font-family:Arial,sans-serif;max-width:600px">
        <div style="background:#0d1117;padding:16px 24px"><span style="color:#c6a34e;font-weight:800;font-size:16px">AUREUS SOCIAL PRO</span></div>
        <div style="padding:24px">
          <h2>Demande non retenue</h2>
          <p>Bonjour ${req_data.full_name},</p>
          <p>Après examen de votre profil, nous ne pouvons pas activer votre accès pour le moment.</p>
          ${rejected_reason ? `<p><b>Motif :</b> ${rejected_reason}</p>` : ''}
          <p>Pour toute question : <a href="mailto:info@aureus-ia.com">info@aureus-ia.com</a></p>
        </div>
      </div>`
    );
  }

  await db2.from('audit_log').insert([{ user_id: u.id, user_email: u.email, action: `ACCESS_${action.toUpperCase()}`, table_name: 'access_requests', record_id: id, created_at: new Date().toISOString() }]).catch(() => {});

  return Response.json({ ok: true, status: newStatus });
}
