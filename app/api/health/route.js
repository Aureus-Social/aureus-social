// ═══ AUREUS SOCIAL PRO — Health Check API ═══
// Endpoint public pour UptimeRobot / monitoring externe
// GET /api/health → 200 OK avec statut des services

import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function GET() {
  const start = Date.now();
  const checks = {};

  // 1. Check Supabase connectivity
  try {
    const { error } = await supabase.from('audit_log').select('id').limit(1);
    checks.supabase = error ? 'degraded' : 'ok';
  } catch {
    checks.supabase = 'down';
  }

  // 2. Check env vars
  checks.env = process.env.NEXT_PUBLIC_SUPABASE_URL &&
               process.env.SUPABASE_SERVICE_ROLE_KEY ? 'ok' : 'missing';

  // 3. Check Resend
  checks.resend = process.env.RESEND_API_KEY ? 'configured' : 'missing';

  const allOk = Object.values(checks).every(v => v === 'ok' || v === 'configured');
  const status = allOk ? 'healthy' : checks.supabase === 'down' ? 'degraded' : 'partial';

  return Response.json({
    status,
    version: 'v18',
    timestamp: new Date().toISOString(),
    latency_ms: Date.now() - start,
    checks,
    app: 'Aureus Social Pro',
    company: 'Aureus IA SPRL',
  }, {
    status: allOk ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' }
  });
}
