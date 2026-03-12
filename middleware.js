import { NextResponse } from 'next/server';

// Rate limiting maps
const rateMap = new Map();
const RATE_LIMIT = 60;
const WINDOW_MS = 60000;

function checkRateLimit(ip, limit = RATE_LIMIT) {
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + WINDOW_MS; }
  entry.count++;
  rateMap.set(ip, entry);
  if (rateMap.size > 10000) { for (const [k, v] of rateMap) { if (now > v.resetAt) rateMap.delete(k); } }
  return entry.count <= limit;
}

// ── IP Whitelist (Item 19) ──
// Set IP_WHITELIST env var as comma-separated CIDR: "83.134.25.12/32,10.0.0.0/8"
// If not set or empty → no restriction (all IPs allowed)
function ipMatchesCIDR(ip, cidr) {
  const [range, bits = '32'] = cidr.split('/');
  const mask = ~(2 ** (32 - parseInt(bits)) - 1) >>> 0;
  const ipParts = ip.split('.');
  const rangeParts = range.split('.');
  if (ipParts.length !== 4 || rangeParts.length !== 4) return false;
  const ipNum = ipParts.reduce((a, o) => (a * 256) + parseInt(o), 0) >>> 0;
  const rangeNum = rangeParts.reduce((a, o) => (a * 256) + parseInt(o), 0) >>> 0;
  return (ipNum & mask) === (rangeNum & mask);
}

function checkIpWhitelist(ip) {
  const whitelist = process.env.IP_WHITELIST;
  if (!whitelist || whitelist.trim() === '') return true; // No restriction
  const cidrs = whitelist.split(',').map(s => s.trim()).filter(Boolean);
  if (cidrs.length === 0) return true;
  return cidrs.some(cidr => ipMatchesCIDR(ip, cidr));
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  // IP Whitelist enforcement for admin/API routes
  if (pathname.startsWith('/api/v1/') || pathname.startsWith('/api/cron')) {
    if (!checkIpWhitelist(ip)) {
      return NextResponse.json(
        { error: 'IP non autorisée', code: 'IP_BLOCKED' },
        { status: 403 }
      );
    }
  }

  // ═══ JWT PRESENCE CHECK — routes protégées (vérification complète dans getAuthUser) ═══
  // Middleware vérifie la présence du token — la validation cryptographique se fait dans getAuthUser()
  const PROTECTED_API = [
    '/api/employees', '/api/payroll', '/api/declarations', '/api/export',
    '/api/restore', '/api/rgpd', '/api/documents', '/api/onss',
    '/api/sepa', '/api/stats', '/api/permissions', '/api/backup',
    '/api/monitoring', '/api/anomaly', '/api/audit',
  ];
  const isProtectedApi = PROTECTED_API.some(p => pathname.startsWith(p));
  if (isProtectedApi && request.method !== 'OPTIONS') {
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé — JWT manquant', code: 'NO_JWT' }, { status: 401 });
    }
    // Vérification longueur minimale token JWT (header.payload.signature = 3 parties)
    const parts = authHeader.slice(7).split('.');
    if (parts.length !== 3 || parts.some(p => p.length < 4)) {
      return NextResponse.json({ error: 'Token JWT malformé', code: 'INVALID_JWT' }, { status: 401 });
    }
  }

  // ═══ RATE LIMITING RENFORCÉ — endpoints sensibles ═══
  const AUTH_RATE_LIMIT = 10; // 10 req/min pour login/reset (anti brute-force)
  if (pathname === '/api/auth' || pathname.startsWith('/api/auth/')) {
    if (!checkRateLimit('auth:' + ip, AUTH_RATE_LIMIT)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '120' } });
    }
  }

  // Rate limit strict sur endpoints critiques (5 req/min)
  const STRICT_RATE_PATHS = ['/api/restore', '/api/backup', '/api/sepa', '/api/onss'];
  if (STRICT_RATE_PATHS.some(p => pathname.startsWith(p))) {
    if (!checkRateLimit('strict:' + ip, 5)) {
      return NextResponse.json({ error: 'Too many requests', code: 'RATE_LIMIT' }, { status: 429, headers: { 'Retry-After': '60' } });
    }
  }

  // ── CSRF Protection — mutations sensibles ────────────────────
  const MUTATION_PATHS = ['/api/employees', '/api/payroll', '/api/declarations', '/api/export', '/api/restore', '/api/rgpd'];
  const isMutation = request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE';
  const needsCsrf = MUTATION_PATHS.some(p => pathname.startsWith(p)) && isMutation;
  if (needsCsrf) {
    const csrfHeader = request.headers.get('x-csrf-token') || '';
    const csrfCookie = request.cookies.get('csrf_token')?.value || '';
    // On accepte le token en header OU en cookie (double submit pattern)
    // La validation complète se fait via /api/csrf — ici on vérifie juste la présence
    if (!csrfHeader && !csrfCookie) {
      return Response.json({ error: 'CSRF token manquant', code: 'CSRF_MISSING' }, { status: 403 });
    }
  }

  // API ROUTES
  if (pathname.startsWith('/api/')) {
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } });
    }
    const origin = request.headers.get('origin') || '';
    const allowedOrigins = [
      process.env.ALLOWED_ORIGIN,
      'https://aureussocial.be', 'https://www.aureussocial.be',
      'https://app.aureussocial.be',
      'https://aureus-social-v18.vercel.app',
      'http://localhost:3000'
    ].filter(Boolean);
    const isAllowed = allowedOrigins.some(o => origin === o) || !origin;

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: {
        'Access-Control-Allow-Origin': isAllowed ? origin : '',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id',
        'Access-Control-Max-Age': '86400',
      }});
    }
    const response = NextResponse.next();
    if (isAllowed) response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    return response;
  }

  // ALL ROUTES — Security Headers
  const response = NextResponse.next();
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // CSP — Content Security Policy (en prod : stricte ; en dev Next.js nécessite unsafe-eval)
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
    : '*.supabase.co';
  const scriptSrc = process.env.NODE_ENV === 'development'
    ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com`
    : `script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com`;
  const csp = [
    "default-src 'self'",
    scriptSrc,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: blob: https://${supabaseHost}`,
    `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://api.anthropic.com https://api.resend.com https://api.github.com https://ipapi.co https://api.ipify.org`,
    `worker-src 'self' blob:`,
    `child-src 'self' blob:`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `upgrade-insecure-requests`,
    `object-src 'none'`,
  ].join('; ');
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  return response;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
