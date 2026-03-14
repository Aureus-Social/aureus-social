// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Helper trigger webhook sortant
// Appel interne pour déclencher un webhook HMAC depuis n'importe quelle route
// ═══════════════════════════════════════════════════════════════
import { createHmac } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.aureussocial.be';

function signPayload(payload, secret) {
  return createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
}

export async function triggerWebhook(userId, event, data) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Charger les endpoints webhooks de ce user
    const { data: endpoints } = await sb.from('webhook_endpoints')
      .select('*')
      .eq('user_id', userId)
      .eq('enabled', true)
      .limit(10);

    if (!endpoints?.length) return;

    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      api_version: 'v1',
    };

    for (const ep of endpoints) {
      if (!ep.events?.includes(event) && !ep.events?.includes('*')) continue;
      const sig = signPayload(payload, ep.secret || 'aureus-webhook-secret');
      try {
        await fetch(ep.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Aureus-Signature': `sha256=${sig}`,
            'X-Aureus-Event': event,
            'X-Aureus-Delivery': `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        });
      } catch {}
    }
  } catch {}
}
