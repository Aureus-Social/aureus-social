import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { prenom, nom, email, societe, role, message, lang } = body;

    if (!email || !prenom) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'Resend non configuré' }, { status: 500 });
    }

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0E0D0A;padding:24px;border-radius:8px 8px 0 0">
          <div style="color:#B8913A;font-size:20px;font-weight:700;letter-spacing:2px">AUREUS</div>
          <div style="color:rgba(255,255,255,.5);font-size:12px">Social Pro — Nouvelle demande de démo</div>
        </div>
        <div style="background:#fff;border:1px solid #E8E4DC;border-top:none;padding:32px;border-radius:0 0 8px 8px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:10px 0;border-bottom:1px solid #F0EDE8;color:#9A968E;font-size:13px;width:140px">Prénom / Nom</td><td style="padding:10px 0;border-bottom:1px solid #F0EDE8;font-weight:600;color:#0E0D0A">${prenom} ${nom || ''}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #F0EDE8;color:#9A968E;font-size:13px">E-mail</td><td style="padding:10px 0;border-bottom:1px solid #F0EDE8;color:#0E0D0A"><a href="mailto:${email}" style="color:#B8913A">${email}</a></td></tr>
            ${societe ? `<tr><td style="padding:10px 0;border-bottom:1px solid #F0EDE8;color:#9A968E;font-size:13px">Société</td><td style="padding:10px 0;border-bottom:1px solid #F0EDE8;color:#0E0D0A">${societe}</td></tr>` : ''}
            ${role ? `<tr><td style="padding:10px 0;border-bottom:1px solid #F0EDE8;color:#9A968E;font-size:13px">Profil</td><td style="padding:10px 0;border-bottom:1px solid #F0EDE8;color:#0E0D0A">${role}</td></tr>` : ''}
            <tr><td style="padding:10px 0;color:#9A968E;font-size:13px;vertical-align:top">Message</td><td style="padding:10px 0;color:#0E0D0A;line-height:1.7">${message || '—'}</td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:#F9F6F0;border-radius:6px;font-size:12px;color:#9A968E">
            Langue : <strong>${(lang||'fr').toUpperCase()}</strong> · Via vitrine aureussocial.be · ${new Date().toLocaleString('fr-BE',{timeZone:'Europe/Brussels'})}
          </div>
        </div>
      </div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Aureus Social Pro <noreply@aureussocial.be>',
        to: ['info@aureus-ia.com'],
        reply_to: email,
        subject: `🔔 Nouvelle demande de démo — ${prenom} ${nom||''} ${societe?`(${societe})`:''}`,
        html,
      }),
    });

    if (!res.ok) { const err = await res.text(); console.error('Resend error:', err); return NextResponse.json({ error: 'Échec envoi' }, { status: 500 }); }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
