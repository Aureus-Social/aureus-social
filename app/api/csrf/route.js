// ═══════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — CSRF Token API
// GET  : génère un token CSRF signé (valide 1h)
// POST : valide un token CSRF
// Usage côté client : fetch('/api/csrf') → stocker token → envoyer
// dans header X-CSRF-Token sur chaque mutation POST/PUT/DELETE
// ═══════════════════════════════════════════════════════════════
import { createHmac, randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

const SECRET = process.env.ENCRYPTION_KEY || 'aureus-csrf-secret-2026';
const TOKEN_TTL = 3600; // 1 heure

function generateToken() {
  const nonce = randomBytes(16).toString('hex');
  const expires = Math.floor(Date.now() / 1000) + TOKEN_TTL;
  const payload = `${nonce}:${expires}`;
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

function validateToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;
    const [nonce, expires, sig] = parts;
    // Vérifier expiration
    if (Math.floor(Date.now() / 1000) > parseInt(expires)) return false;
    // Vérifier signature
    const payload = `${nonce}:${expires}`;
    const expected = createHmac('sha256', SECRET).update(payload).digest('hex');
    return sig === expected;
  } catch {
    return false;
  }
}

export async function GET() {
  const token = generateToken();
  const response = Response.json({ token, expires_in: TOKEN_TTL });
  // Cookie HttpOnly en backup
  response.headers.set('Set-Cookie',
    `csrf_token=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${TOKEN_TTL}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  );
  return response;
}

export async function POST(request) {
  try {
    const { token } = await request.json();
    if (!token) return Response.json({ valid: false, error: 'Token manquant' }, { status: 400 });
    const valid = validateToken(token);
    return Response.json({ valid });
  } catch {
    return Response.json({ valid: false, error: 'Token invalide' }, { status: 400 });
  }
}
