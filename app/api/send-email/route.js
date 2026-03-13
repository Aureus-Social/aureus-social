import { getAuthUser } from '@/app/lib/supabase';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const u = await getAuthUser(req);
  if (!u) return Response.json({ error: 'Non autorisé' }, { status: 401 });

  const KEY = process.env.RESEND_API_KEY;
  if (!KEY) return Response.json({ error: 'Service email non configuré' }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const { to, subject, html, text, from, replyTo } = body;

  if (!to || !subject || (!html && !text)) {
    return Response.json({ error: 'to, subject et html/text requis' }, { status: 400 });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return Response.json({ error: 'Adresse email invalide' }, { status: 400 });
  }

  try {
    const payload = {
      from: from || 'Aureus Social Pro <info@aureus-ia.com>',
      to: [to],
      subject,
      html: html || `<p>${text}</p>`,
      ...(replyTo ? { reply_to: replyTo } : {}),
    };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend error:', data);
      return Response.json({ error: data.message || 'Erreur envoi email' }, { status: 502 });
    }

    // Audit log
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      await db.from('audit_log').insert([{
        user_id: u.id, user_email: u.email,
        action: 'SEND_EMAIL',
        table_name: 'emails',
        details: { to, subject: subject.slice(0, 100), resend_id: data.id },
        created_at: new Date().toISOString(),
      }]);
    } catch(e) {}

    return Response.json({ ok: true, id: data.id });
  } catch(e) {
    console.error('send-email error:', e);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
