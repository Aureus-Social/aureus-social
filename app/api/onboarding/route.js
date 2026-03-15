import { checkRole } from '@/app/lib/supabase-server';
// ═══ AUREUS SOCIAL PRO — API Onboarding ═══
// Déclenché au premier login d'un nouveau client
// 1. Crée le tenant dans Supabase (table clients)
// 2. Envoie email de bienvenue au client (Resend)
// 3. Envoie notification à info@aureus-ia.com

import { getAuthUser } from '@/app/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = 'info@aureus-ia.com';

async function sendEmail(to, subject, html) {
  if (!RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY manquant' };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Aureus Social Pro <noreply@aureus-ia.com>', to: [to], subject, html }),
  });
  return { ok: res.ok, status: res.status };
}

export async function POST(request) {
  const u = await getAuthUser(request);
  if (!u) return Response.json({ is_new: false, onboarded: true, skipped: true }, { status: 200 });
  const _rc = checkRole(u, 'employees_write'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });

  if (!supabase) {
    console.warn('[Onboarding] Supabase non configuré — skip');
    return Response.json({ is_new: false, onboarded: true, skipped: true }, { status: 200 });
  }

  try {
    const body = await request.json();
    const { company_name, action } = body;
    // SÉCURITÉ : user_id et email TOUJOURS depuis le JWT — jamais du body
    const user_id = u.id;
    const email = u.email;
    if (!user_id || !email) return Response.json({ error: 'Utilisateur non authentifié' }, { status: 401 });

    // ── 1. Vérifier si c'est vraiment un nouveau client ──
    const { data: existing } = await supabase
      .from('clients')
      .select('id, onboarded_at')
      .eq('user_id', user_id)
      .single();

    const isNew = !existing;

    if (action === 'check') {
      return Response.json({ is_new: isNew, onboarded: !!existing?.onboarded_at });
    }

    // ── 2. Créer le tenant si nouveau ──
    if (isNew) {
      const { error: insertError } = await supabase.from('clients').insert({
        user_id,
        email,
        company_name: company_name || null,
        status: 'active',
        plan: 'trial',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 jours
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        // Table 'clients' peut ne pas encore exister → on log et on continue
        console.warn('[Onboarding] Skip client insert:', insertError.message);
        // Ne pas bloquer — retourner succès silencieux
        return Response.json({ is_new: false, onboarded: true, skipped: true }, { status: 200 });
      }

      // ── 3. Audit log ──
      await supabase.from('audit_log').insert({
        action: 'NEW_CLIENT_ONBOARDING',
        table_name: 'clients',
        user_id,
        user_email: email,
        details: { company_name, plan: 'trial', trial_days: 14 },
        created_at: new Date().toISOString(),
      }).catch(() => {});

      // ── 4. Email de bienvenue au client ──
      await sendEmail(
        email,
        '🎉 Bienvenue sur Aureus Social Pro !',
        `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f8f9fa;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:#0c0b09;padding:32px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#c6a34e;letter-spacing:3px;">AUREUS</div>
      <div style="font-size:12px;color:#888;margin-top:4px;letter-spacing:1px;">SOCIAL PRO</div>
    </div>
    <div style="padding:40px 36px;">
      <h1 style="color:#1a1a2e;font-size:22px;margin:0 0 16px;">Bienvenue${company_name ? ` chez ${company_name}` : ''} ! 👋</h1>
      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 20px;">
        Votre accès à <strong>Aureus Social Pro</strong> est actif. Vous bénéficiez de <strong>14 jours d'essai gratuit</strong> — aucune carte bancaire requise.
      </p>
      <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:24px 0;">
        <div style="font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:12px;">🚀 Pour démarrer :</div>
        <div style="color:#4b5563;font-size:13px;line-height:2;">
          ✅ &nbsp;Complétez les infos de votre entreprise<br>
          ✅ &nbsp;Ajoutez vos travailleurs<br>
          ✅ &nbsp;Générez votre première fiche de paie<br>
          ✅ &nbsp;Soumettez votre première Dimona en &lt; 8 secondes
        </div>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="https://app.aureussocial.be" 
           style="background:#c6a34e;color:#0c0b09;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">
          Accéder à mon espace →
        </a>
      </div>
      <p style="color:#9ca3af;font-size:12px;line-height:1.6;border-top:1px solid #e5e7eb;padding-top:20px;margin-top:20px;">
        Une question ? Répondez directement à cet email ou écrivez à <a href="mailto:info@aureus-ia.com" style="color:#c6a34e;">info@aureus-ia.com</a>.<br>
        Nous répondons sous 4h ouvrables.
      </p>
    </div>
    <div style="background:#f8f9fa;padding:16px;text-align:center;">
      <div style="font-size:11px;color:#9ca3af;">© 2026 Aureus IA SPRL · BCE BE 1028.230.781 · Saint-Gilles, Bruxelles</div>
    </div>
  </div>
</body>
</html>`
      );

      // ── 5. Notification admin ──
      await sendEmail(
        ADMIN_EMAIL,
        `🆕 Nouveau client — ${email}`,
        `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;padding:24px;">
  <h2 style="color:#1a1a2e;">🆕 Nouveau client inscrit</h2>
  <table style="border-collapse:collapse;width:100%;margin:16px 0;">
    <tr><td style="padding:8px;background:#f8f9fa;font-weight:700;width:140px;">Email</td><td style="padding:8px;">${email}</td></tr>
    <tr><td style="padding:8px;background:#f8f9fa;font-weight:700;">Société</td><td style="padding:8px;">${company_name || 'Non renseigné'}</td></tr>
    <tr><td style="padding:8px;background:#f8f9fa;font-weight:700;">User ID</td><td style="padding:8px;font-size:11px;">${user_id}</td></tr>
    <tr><td style="padding:8px;background:#f8f9fa;font-weight:700;">Plan</td><td style="padding:8px;">Trial 14 jours</td></tr>
    <tr><td style="padding:8px;background:#f8f9fa;font-weight:700;">Date</td><td style="padding:8px;">${new Date().toLocaleString('fr-BE')}</td></tr>
  </table>
  <a href="https://supabase.com/dashboard/project/jwjtlpewwdjxdboxtbdf/editor" style="background:#c6a34e;color:#0c0b09;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px;">Voir dans Supabase →</a>
</body>
</html>`
      );

      return Response.json({ success: true, action: 'onboarded', is_new: true });
    }

    return Response.json({ success: true, action: 'existing', is_new: false });

  } catch (e) {
    console.error('[Onboarding] Erreur:', e.message);
    return Response.json({ error: process.env.NODE_ENV==="production"?"Erreur interne":(e.message||"Erreur") }, { status: 500 });
  }
}
