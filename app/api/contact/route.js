import { NextResponse } from 'next/server';

const CONFIRM = {
  fr: { subject: 'Votre demande de démo Aureus Social Pro', greeting: 'Bonjour', body: 'Nous avons bien reçu votre demande de démo. Notre équipe vous contactera sous <strong>4h ouvrables</strong>.', closing: 'À très bientôt', footer: 'Aureus IA SPRL · Place Marcel Broodthaers 8, 1060 Saint-Gilles · info@aureus-ia.com' },
  nl: { subject: 'Uw demo-aanvraag Aureus Social Pro', greeting: 'Goeiedag', body: 'We hebben uw demo-aanvraag goed ontvangen. Ons team neemt contact met u op binnen <strong>4 werkuren</strong>.', closing: 'Tot snel', footer: 'Aureus IA SPRL · Place Marcel Broodthaers 8, 1060 Sint-Gillis · info@aureus-ia.com' },
  en: { subject: 'Your Aureus Social Pro demo request', greeting: 'Hello', body: 'We have received your demo request. Our team will get back to you within <strong>4 business hours</strong>.', closing: 'Talk soon', footer: 'Aureus IA SPRL · Place Marcel Broodthaers 8, 1060 Saint-Gilles · info@aureus-ia.com' },
  de: { subject: 'Ihre Demo-Anfrage Aureus Social Pro', greeting: 'Hallo', body: 'Wir haben Ihre Demo-Anfrage erhalten. Unser Team wird sich innerhalb von <strong>4 Arbeitsstunden</strong> bei Ihnen melden.', closing: 'Bis bald', footer: 'Aureus IA SPRL · Place Marcel Broodthaers 8, 1060 Saint-Gilles · info@aureus-ia.com' },
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { prenom, nom, email, societe, role, message, lang } = body;

    if (!email || !prenom) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const KEY = process.env.RESEND_API_KEY;
    if (!KEY) return NextResponse.json({ error: 'Resend non configuré' }, { status: 500 });

    const ts = new Date().toLocaleString('fr-BE', { timeZone: 'Europe/Brussels' });
    const c = CONFIRM[lang] || CONFIRM.fr;

    // ── Email 1 : notification interne ──────────────────────────────
    const htmlInternal = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
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
          Langue : <strong>${(lang||'fr').toUpperCase()}</strong> · ${ts}
        </div>
      </div>
    </div>`;

    // ── Email 2 : confirmation au client ────────────────────────────
    const htmlConfirm = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0E0D0A;padding:24px;border-radius:8px 8px 0 0">
        <div style="color:#B8913A;font-size:20px;font-weight:700;letter-spacing:2px">AUREUS</div>
        <div style="color:rgba(255,255,255,.5);font-size:12px">Social Pro</div>
      </div>
      <div style="background:#fff;border:1px solid #E8E4DC;border-top:none;padding:36px;border-radius:0 0 8px 8px">
        <p style="font-size:16px;color:#0E0D0A;margin-bottom:16px">${c.greeting} <strong>${prenom}</strong>,</p>
        <p style="font-size:15px;color:#56524A;line-height:1.8;margin-bottom:24px">${c.body}</p>
        <div style="background:#F9F6F0;border-left:3px solid #B8913A;padding:16px 20px;border-radius:0 6px 6px 0;margin-bottom:28px">
          <div style="font-size:13px;color:#9A968E;margin-bottom:4px">Récapitulatif</div>
          <div style="font-size:14px;color:#0E0D0A"><strong>${prenom} ${nom||''}</strong>${societe ? ` — ${societe}` : ''}</div>
          <div style="font-size:13px;color:#56524A">${email}</div>
          ${message ? `<div style="font-size:13px;color:#56524A;margin-top:8px;font-style:italic">"${message}"</div>` : ''}
        </div>
        <p style="font-size:14px;color:#56524A">${c.closing},<br/><strong style="color:#0E0D0A">L'équipe Aureus Social Pro</strong></p>
        <div style="margin-top:32px;padding-top:20px;border-top:1px solid #E8E4DC;font-size:11px;color:#9A968E;line-height:1.6">${c.footer}</div>
      </div>
    </div>`;

    // Envoyer les 2 emails en parallèle
    const [r1, r2] = await Promise.all([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Aureus Social Pro <noreply@aureussocial.be>',
          to: ['info@aureus-ia.com'],
          reply_to: email,
          subject: `🔔 Nouvelle demande — ${prenom} ${nom||''} ${societe?`(${societe})`:''}`,
          html: htmlInternal,
        }),
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Aureus Social Pro <noreply@aureussocial.be>',
          to: [email],
          subject: c.subject,
          html: htmlConfirm,
        }),
      }),
    ]);

    if (!r1.ok || !r2.ok) {
      const e1 = r1.ok ? '' : await r1.text();
      const e2 = r2.ok ? '' : await r2.text();
      console.error('Resend errors:', e1, e2);
      return NextResponse.json({ error: 'Échec envoi' }, { status: 500 });
    }

    // ── Log consentement RGPD Art. 6.1.a en BDD ──────────────────
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      await supa.from('contact_consents').upsert({
        email: email.toLowerCase().trim(),
        prenom, nom: nom || null, societe: societe || null, role: role || null,
        lang: lang || 'fr',
        consent: true,
        consent_ip: ip,
        consent_date: new Date().toISOString(),
        consent_text: 'En soumettant ce formulaire, vous acceptez notre politique RGPD.',
        source: 'vitrine_contact',
        message_excerpt: (message || '').slice(0, 200),
      }, { onConflict: 'email' });
    } catch (dbErr) {
      console.warn('[contact] Consent log failed (non-blocking):', dbErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
