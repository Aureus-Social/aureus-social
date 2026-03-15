// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — /api/email-fiche
// Envoi fiche de paie par email via Resend
// ═══════════════════════════════════════════════════════════════
import { sbFromRequest, checkRole } from '@/app/lib/supabase-server';
export const dynamic = 'force-dynamic';

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = 'Aureus Social Pro <noreply@aureussocial.be>';
const APP_URL = 'https://app.aureussocial.be';

function fmt(v) {
  return new Intl.NumberFormat('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0);
}

function buildHTML(fiche, employe, societe) {
  const {
    brut = 0, onss_travailleur = 0, precompte_pro = 0,
    cotisation_onss_perso = 0, net_a_payer = 0,
    onss_patronale = 0, brut_total = 0,
    mois = new Date().getMonth() + 1,
    annee = new Date().getFullYear(),
    employe_type = 'employe'
  } = fiche;

  const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const periode = `${MOIS[mois - 1]} ${annee}`;
  const nomEmploye = employe?.nom ? `${employe.prenom || ''} ${employe.nom}`.trim() : 'Travailleur';
  const nomSociete = societe?.name || societe?.nom || 'Aureus Social Pro';

  const netVal = net_a_payer || (brut - (onss_travailleur || cotisation_onss_perso) - precompte_pro);
  const onssW = onss_travailleur || cotisation_onss_perso || 0;

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Inter,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">

  <!-- HEADER -->
  <tr><td style="background:#0D0D0E;padding:28px 32px">
    <table width="100%"><tr>
      <td><div style="font-size:22px;font-weight:800;color:#C9963A;letter-spacing:2px">AUREUS</div>
        <div style="font-size:10px;color:#6B6860;letter-spacing:3px;margin-top:2px">SOCIAL PRO</div></td>
      <td align="right"><div style="font-size:12px;color:#6B6860">Fiche de paie</div>
        <div style="font-size:14px;font-weight:600;color:#C9963A">${periode}</div></td>
    </tr></table>
  </td></tr>

  <!-- TRAVAILLEUR INFO -->
  <tr><td style="padding:24px 32px;border-bottom:1px solid #f0ede6">
    <div style="font-size:18px;font-weight:700;color:#1a1a1a">${nomEmploye}</div>
    <div style="font-size:13px;color:#6B6860;margin-top:4px">${nomSociete}</div>
  </td></tr>

  <!-- CALCULS -->
  <tr><td style="padding:24px 32px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:10px 0;border-bottom:1px solid #f5f0e8;font-size:13px;color:#1a1a1a">Salaire brut</td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #f5f0e8;font-size:13px;font-weight:600;color:#1a1a1a">${fmt(brut_total || brut)} €</td></tr>
      ${onssW > 0 ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f5f0e8;font-size:13px;color:#6B6860">Cotisations ONSS (13,07%)</td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #f5f0e8;font-size:13px;color:#E05C3A">- ${fmt(onssW)} €</td></tr>` : ''}
      ${precompte_pro > 0 ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f5f0e8;font-size:13px;color:#6B6860">Précompte professionnel</td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #f5f0e8;font-size:13px;color:#E05C3A">- ${fmt(precompte_pro)} €</td></tr>` : ''}
      <!-- NET -->
      <tr><td colspan="2" style="padding:4px 0"></td></tr>
      <tr style="background:#0D0D0E;border-radius:6px">
        <td style="padding:14px 16px;font-size:15px;font-weight:700;color:#fff;border-radius:6px 0 0 6px">NET À PAYER</td>
        <td align="right" style="padding:14px 16px;font-size:20px;font-weight:800;color:#4CAF80;border-radius:0 6px 6px 0">${fmt(netVal)} €</td>
      </tr>
    </table>
  </td></tr>

  <!-- COÛT EMPLOYEUR -->
  ${onss_patronale > 0 ? `<tr><td style="padding:12px 32px;background:#f9f7f3">
    <table width="100%"><tr>
      <td style="font-size:12px;color:#6B6860">Coût total employeur</td>
      <td align="right" style="font-size:13px;font-weight:600;color:#C9963A">${fmt(parseFloat(brut_total || brut) + parseFloat(onss_patronale))} €</td>
    </tr></table>
  </td></tr>` : ''}

  <!-- FOOTER -->
  <tr><td style="padding:20px 32px;background:#f5f0e8;border-top:1px solid #e8e4dc">
    <div style="font-size:11px;color:#6B6860;text-align:center">
      Aureus IA SPRL · BCE BE 1028.230.781 · Place Marcel Broodthaers 8, 1060 Saint-Gilles<br>
      <a href="${APP_URL}" style="color:#C9963A">app.aureussocial.be</a>
    </div>
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
  const _rc = checkRole(u, 'payroll_read'); if (!_rc.ok) return Response.json({ error: _rc.error }, { status: 403 });

  if (!RESEND_KEY) return Response.json({ error: 'RESEND_API_KEY manquante dans les variables Vercel' }, { status: 500 });

  const body = await req.json();
  const { fiche_id, email_override, employe, societe } = body;

  // Charger la fiche si ID fourni
  let ficheData = body.fiche || {};
  if (fiche_id) {
    const { data } = await db.from('fiches_paie').select('*').eq('id', fiche_id).single();
    if (data) ficheData = data;
  }

  const toEmail = email_override || employe?.email;
  if (!toEmail) return Response.json({ error: 'Email destinataire manquant' }, { status: 400 });

  const nomEmploye = employe?.nom ? `${employe.prenom || ''} ${employe.nom}`.trim() : 'Travailleur';
  const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const periode = `${MOIS[(ficheData.mois || new Date().getMonth() + 1) - 1]} ${ficheData.annee || new Date().getFullYear()}`;

  const html = buildHTML(ficheData, employe, societe);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [toEmail],
      subject: `Fiche de paie — ${nomEmploye} — ${periode}`,
      html,
    })
  });

  const result = await res.json();
  if (!res.ok) return Response.json({ error: result.message || 'Erreur Resend' }, { status: 500 });

  // Log audit
  await db.from('audit_log').insert([{
    user_id: u.id, user_email: u.email,
    action: 'SEND_PAYSLIP_EMAIL',
    table_name: 'fiches_paie',
    created_at: new Date().toISOString()
  }]).catch(() => {});

  return Response.json({ ok: true, email_id: result.id });
}
