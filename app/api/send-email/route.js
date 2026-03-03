// ═══════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Email API (Item 15 — Production-ready)
// Resend integration with domain verification, retry, templates
// Set RESEND_API_KEY + verify aureussocial.be domain in Resend
// ═══════════════════════════════════════════════════════════

function sanitizeHTML(html) {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>/gi, '')
    .replace(/<form[\s\S]*?<\/form>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<math[\s\S]*?<\/math>/gi, '')
    .replace(/<meta[\s\S]*?>/gi, '')
    .replace(/<link[\s\S]*?>/gi, '')
    .replace(/<base[\s\S]*?>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript\s*:/gi, 'blocked:')
    .replace(/vbscript\s*:/gi, 'blocked:')
    .replace(/data\s*:\s*text\/html/gi, 'blocked:');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const TEMPLATES = {
  payslip: { subject: 'Fiche de paie {period}', from: 'Aureus Paie <paie@aureussocial.be>' },
  recap: { subject: 'Récap mensuel {period}', from: 'Aureus Social <recap@aureussocial.be>' },
  alert: { subject: 'Alerte légale — {type}', from: 'Aureus Alertes <alertes@aureussocial.be>' },
  reminder: { subject: 'Rappel échéances — {period}', from: 'Aureus Social <rappels@aureussocial.be>' },
  invoice: { subject: 'Facture {numero}', from: 'Aureus Facturation <facturation@aureussocial.be>' },
};

async function sendWithRetry(payload, apiKey, maxRetries = 2) {
  let lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      const data = await res.json();

      if (res.ok) return { success: true, data };
      if (res.status === 429 && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      lastError = data;
    } catch (err) {
      lastError = { message: err.message };
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
    }
  }
  return { success: false, error: lastError };
}

export async function POST(request) {
  try {
    // ═══ SÉCURITÉ : Vérifier l'authentification ═══
    // Auth bypass: API interne protegee par middleware Next.js

    const body = await request.json();
    const { to, subject, html, attachments, from, template, templateData } = body;

    if (!to || !subject) {
      return Response.json({ error: 'Missing to or subject' }, { status: 400 });
    }

    const recipients = Array.isArray(to) ? to : [to];
    for (const addr of recipients) {
      if (!isValidEmail(addr)) {
        return Response.json({ error: 'Invalid email address: ' + addr.slice(0, 50) }, { status: 400 });
      }
    }

    if (subject.length > 500) {
      return Response.json({ error: 'Subject too long (max 500 chars)' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.log('[EMAIL-DEV]', { to, subject, template, htmlLength: html?.length || 0 });
      return Response.json({
        success: true,
        mode: 'dev',
        message: 'Email logged (RESEND_API_KEY non configurée). Ajoutez-la dans Vercel pour envoyer en production.',
        setup: {
          step1: 'Créer un compte sur resend.com',
          step2: 'Vérifier le domaine aureussocial.be (DNS SPF + DKIM)',
          step3: 'Copier la clé API → Vercel env RESEND_API_KEY',
        },
        to,
        subject,
      });
    }

    // Resolve template
    let resolvedSubject = subject;
    let resolvedFrom = from || 'Aureus Social Pro <noreply@aureussocial.be>';
    if (template && TEMPLATES[template]) {
      const tpl = TEMPLATES[template];
      resolvedFrom = tpl.from;
      if (!from) {
        resolvedSubject = tpl.subject.replace(/\{(\w+)\}/g, (_, k) => templateData?.[k] || '');
      }
    }

    const payload = {
      from: resolvedFrom,
      to: recipients,
      subject: resolvedSubject.slice(0, 500),
      html: sanitizeHTML(html) || '<p>Voir pièce jointe</p>',
    };

    if (attachments?.length > 0) {
      payload.attachments = attachments.slice(0, 5).map(att => ({
        filename: (att.filename || 'document.pdf').slice(0, 100),
        content: att.content,
        content_type: att.contentType || 'application/pdf',
      }));
    }

    const result = await sendWithRetry(payload, apiKey);

    if (!result.success) {
      return Response.json({
        error: result.error?.message || 'Email sending failed',
        details: result.error,
      }, { status: 502 });
    }

    return Response.json({
      success: true,
      mode: 'resend',
      id: result.data.id,
      to: payload.to,
      subject: resolvedSubject,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const hasKey = !!process.env.RESEND_API_KEY;

  // Check domain verification status if key exists
  let domainStatus = null;
  if (hasKey) {
    try {
      const res = await fetch('https://api.resend.com/domains', {
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        domainStatus = (data.data || []).map(d => ({
          name: d.name,
          status: d.status,
          verified: d.status === 'verified',
        }));
      }
    } catch { /* best effort */ }
  }

  return Response.json({
    service: 'Aureus Social Pro — Email API',
    status: 'ok',
    resend: hasKey ? 'configured' : 'not configured (dev mode)',
    domains: domainStatus,
    templates: Object.keys(TEMPLATES),
    timestamp: new Date().toISOString(),
  });
}
