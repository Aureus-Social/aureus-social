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

  // ═══ RATE LIMITING RENFORCÉ — endpoints sensibles ═══
  const AUTH_RATE_LIMIT = 10; // 10 req/min pour login/reset (anti brute-force)
  if (pathname === '/api/auth' || pathname.startsWith('/api/auth/')) {
    if (!checkRateLimit('auth:' + ip, AUTH_RATE_LIMIT)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '120' } });
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
    `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://api.anthropic.com https://api.resend.com`,
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
