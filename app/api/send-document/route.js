// AUREUS SOCIAL PRO — /api/send-document
// Envoi de documents par email via Resend

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = 'Aureus Social Pro <noreply@aureussocial.be>';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function buildEmailHTML({ docTitle, docType, recipientName, message, downloadUrl }) {
  const gold = '#c6a34e';
  const dark = '#060810';
  const card = '#0d1117';
  const border = '#1e2633';
  const text = '#e0e0e0';
  const muted = '#8b95a5';
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>${docTitle || 'Document'}</title></head>
<body style="margin:0;padding:0;background:${dark};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${dark};padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${card};border:1px solid ${border};border-radius:12px;overflow:hidden;">
  <tr>
    <td style="background:linear-gradient(135deg,${dark},#111827);padding:24px 32px;border-bottom:2px solid ${gold};">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:22px;font-weight:700;color:${gold};letter-spacing:1px;">AUREUS SOCIAL</td>
          <td align="right" style="font-size:12px;color:${muted};">Logiciel de Paie Pro</td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:28px 32px 0;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:rgba(198,163,78,.12);border:1px solid rgba(198,163,78,.3);border-radius:6px;padding:6px 14px;">
            <span style="font-size:11px;font-weight:700;color:${gold};letter-spacing:.5px;text-transform:uppercase;">
              ${docType || 'Document'}
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:24px 32px;">
      ${recipientName ? `<p style="color:${text};font-size:14px;margin:0 0 16px;">Bonjour <strong>${recipientName}</strong>,</p>` : ''}
      <p style="color:${text};font-size:14px;margin:0 0 16px;">
        Veuillez trouver ci-joint le document : <strong style="color:${gold};">${docTitle || 'Document'}</strong>
      </p>
      ${message ? `<p style="color:${muted};font-size:13px;margin:0 0 16px;padding:12px;background:rgba(255,255,255,.03);border-left:3px solid ${gold};border-radius:0 6px 6px 0;">${message}</p>` : ''}
      ${downloadUrl ? `<p style="margin:20px 0;"><a href="${downloadUrl}" style="background:${gold};color:${dark};padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;font-size:13px;">Telecharger le document</a></p>` : ''}
      <p style="color:${muted};font-size:12px;margin:24px 0 0;padding-top:16px;border-top:1px solid ${border};">
        Aureus Social Pro &mdash; aureussocial.be<br>
        Aureus IA SPRL &mdash; BCE BE 1028.230.781
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function POST(req) {
  try {
    if (!RESEND_API_KEY) return NextResponse.json({ error: 'RESEND_API_KEY manquante' }, { status: 500 });

    // Auth optionnelle - pour le log uniquement
    let userId = null;
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '');
      if (token && SUPABASE_URL && SUPABASE_KEY) {
        const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data: { user } } = await sb.auth.getUser(token);
        userId = user?.id || null;
      }
    } catch (_) {}

    const body = await req.json();
    const { to, subject, docTitle, docType, senderName, recipientName, message, downloadUrl, htmlContent, attachments } = body;

    if (!to || !docTitle) {
      return NextResponse.json({ error: 'Champs requis : to, docTitle' }, { status: 400 });
    }

    const recipients = Array.isArray(to) ? to : [to];
    const emailSubject = subject || `${docTitle} — Aureus Social Pro`;

    const resendPayload = {
      from: FROM,
      to: recipients,
      subject: emailSubject,
      html: buildEmailHTML({ docTitle, docType, senderName, recipientName, message, downloadUrl }),
    };

    const allAttachments = [];
    if (htmlContent) {
      const base64 = Buffer.from(htmlContent).toString('base64');
      const safeName = (docTitle || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
      allAttachments.push({ filename: `${safeName}.html`, content: base64, type: 'text/html' });
    }
    if (attachments && Array.isArray(attachments)) allAttachments.push(...attachments);
    if (allAttachments.length > 0) {
      resendPayload.attachments = allAttachments.map(a => ({ filename: a.filename, content: a.content }));
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(resendPayload),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      console.error('[send-document] Resend error:', resendData);
      return NextResponse.json({ error: resendData.message || 'Erreur Resend' }, { status: 500 });
    }

    // Log optionnel
    try {
      if (userId && SUPABASE_URL && SUPABASE_KEY) {
        const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
        await sb.from('email_logs').insert({
          user_id: userId, type: 'document', doc_title: docTitle,
          recipients, resend_id: resendData.id, sent_at: new Date().toISOString(),
        });
      }
    } catch (_) {}

    return NextResponse.json({ success: true, id: resendData.id, recipients });

  } catch (err) {
    console.error('[send-document] Exception:', err);
    return NextResponse.json({ error: err.message || 'Erreur interne' }, { status: 500 });
  }
}
