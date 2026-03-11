// ══════════════════════════════════════════════════════
//  /api/newsletter — Inscription + consentement RGPD
//  Base légale: Art. 6.1.a RGPD (consentement explicite)
// ══════════════════════════════════════════════════════
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupa() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST(req) {
  try {
    const { email, lang, source, consent } = await req.json();
    if (!email || !email.includes('@')) return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    if (!consent) return NextResponse.json({ error: 'Consentement requis (Art. 6.1.a RGPD)' }, { status: 400 });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const supa = getSupa();

    // Upsert avec proof of consent
    const { error } = await supa.from('newsletter_subscribers').upsert({
      email: email.toLowerCase().trim(),
      lang: lang || 'fr',
      source: source || 'vitrine',
      consent: true,
      consent_ip: ip,
      consent_date: new Date().toISOString(),
      consent_text: 'J\'accepte de recevoir la newsletter Aureus Social Pro. Je peux me désinscrire à tout moment.',
      active: true,
      subscribed_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    if (error) throw error;

    // Email de confirmation via Resend
    const KEY = process.env.RESEND_API_KEY;
    if (KEY) {
      const msgs = {
        fr: { sub: '✓ Inscription confirmée — Newsletter Aureus Social Pro', body: 'Bienvenue ! Vous recevrez nos actualités droit social belge, barèmes et conseils.<br><br>Pour vous désinscrire à tout moment : <a href="https://app.aureussocial.be/api/unsubscribe?email=' + encodeURIComponent(email) + '">Cliquez ici</a>' },
        nl: { sub: '✓ Inschrijving bevestigd — Aureus Social Pro nieuwsbrief', body: 'Welkom! U ontvangt onze updates over Belgisch sociaal recht.<br><br>Uitschrijven: <a href="https://app.aureussocial.be/api/unsubscribe?email=' + encodeURIComponent(email) + '">Klik hier</a>' },
        en: { sub: '✓ Subscription confirmed — Aureus Social Pro newsletter', body: 'Welcome! You will receive our Belgian social law updates.<br><br>To unsubscribe: <a href="https://app.aureussocial.be/api/unsubscribe?email=' + encodeURIComponent(email) + '">Click here</a>' },
      };
      const m = msgs[lang] || msgs.fr;
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'Aureus Social Pro <info@aureus-ia.com>', to: email, subject: m.sub, html: `<div style="font-family:Arial,sans-serif;max-width:600px"><p>${m.body}</p><hr><p style="font-size:11px;color:#999">Aureus IA SPRL · BCE BE 1028.230.781 · Saint-Gilles, Bruxelles<br>Conformément au RGPD Art. 17, vous pouvez demander la suppression de vos données : <a href="mailto:info@aureus-ia.com">info@aureus-ia.com</a></p></div>` }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, message: 'Inscription confirmée' });
  } catch (e) {
    console.error('[newsletter]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET: vérifier statut
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  const supa = getSupa();
  const { data } = await supa.from('newsletter_subscribers').select('active, subscribed_at').eq('email', email.toLowerCase()).single();
  return NextResponse.json(data || { active: false });
}
