/**
 * AUREUS SOCIAL PRO — Health Check API
 * GET /api/health
 * 
 * Destination: app/api/health/route.js
 * Testé par les smoke tests Playwright + monitoring externe
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  // Auth Bearer obligatoire
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const start = Date.now();
  const checks = {};

  // ─── 1. Vérifier la connexion Supabase
  try {
    const supabase = createClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
      (process.env.SUPABASE_SERVICE_ROLE_KEY || '')  // Service role pour le health check
    );
    const { error } = await supabase.from('app_state').select('id').limit(1);
    checks.database = error ? 'degraded' : 'ok';
  } catch {
    checks.database = 'down';
  }

  // ─── 2. Variables d'environnement critiques
  checks.env = {
    supabase_url:    !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_key:    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    encryption_key:  !!process.env.ENCRYPTION_KEY,
    storage_key:     !!process.env.NEXT_PUBLIC_STORAGE_KEY,
  };
  checks.env_ok = Object.values(checks.env).every(Boolean);

  // ─── 3. Status global
  const allOk = checks.database === 'ok' && checks.env_ok;
  const status = allOk ? 'healthy' : 'degraded';

  return NextResponse.json({
    status,
    version: process.env.npm_package_version || '18.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    latency_ms: Date.now() - start,
    checks,
  }, {
    status: allOk ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache',
    }
  });
}
