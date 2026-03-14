// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — Middleware global
// Rate limiting simple par IP sur les routes sensibles
// ═══════════════════════════════════════════════════════════════
import { NextResponse } from 'next/server';

// Store en mémoire (reset à chaque déploiement — suffisant pour prod Vercel)
const rateLimits = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const LIMITS = {
  '/api/agent': 20,        // 20 req/min — protège ANTHROPIC_API_KEY
  '/api/send-email': 10,   // 10 emails/min
  '/api/send-document': 10,
  '/api/onss': 30,
  '/api/auth': 10,
  'default': 200,          // 200 req/min pour les autres routes API
};

function getLimit(pathname) {
  for (const [prefix, limit] of Object.entries(LIMITS)) {
    if (prefix !== 'default' && pathname.startsWith(prefix)) return limit;
  }
  return LIMITS.default;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Appliquer seulement aux routes API
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const key = `${ip}:${pathname}`;
  const limit = getLimit(pathname);
  const now = Date.now();

  const entry = rateLimits.get(key) || { count: 0, resetAt: now + WINDOW_MS };

  // Reset si fenêtre expirée
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }

  entry.count++;
  rateLimits.set(key, entry);

  // Nettoyage périodique pour éviter fuite mémoire
  if (rateLimits.size > 10000) {
    for (const [k, v] of rateLimits.entries()) {
      if (now > v.resetAt) rateLimits.delete(k);
    }
  }

  if (entry.count > limit) {
    return NextResponse.json(
      { error: 'Trop de requêtes — réessayez dans une minute' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(entry.resetAt),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(Math.max(0, limit - entry.count)));
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
