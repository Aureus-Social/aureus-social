import { SignJWT, importPKCS8 } from 'jose';
export const dynamic = 'force-dynamic';

const CLIENT_ID = 'self_service_chaman_305534_fnlh9vng4v';
const TOKEN_URL = 'https://api.socialsecurity.be/REST/oauth/v3/token';

function getPrivateKey() {
  const raw = process.env.ONSS_PRIVATE_KEY || '';
  // Si la clé est en base64 (pas de saut de ligne, pas de BEGIN)
  if (!raw.includes('BEGIN') && raw.length > 100) {
    return Buffer.from(raw, 'base64').toString('utf-8');
  }
  // Sinon reconstruire les sauts de ligne si perdus
  if (raw.includes('BEGIN PRIVATE KEY') && !raw.includes('\n')) {
    return raw.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
              .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----')
              .replace(/(.{64})/g, '$1\n');
  }
  return raw;
}

export async function POST() {
  try {
    const pemKey = getPrivateKey();
    if (!pemKey || !pemKey.includes('BEGIN')) {
      return Response.json({ error: 'ONSS_PRIVATE_KEY invalide ou absente', raw_length: (process.env.ONSS_PRIVATE_KEY||'').length }, { status: 500 });
    }
    const privateKey = await importPKCS8(pemKey, 'RS256');
    const now = Math.floor(Date.now() / 1000);
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer(CLIENT_ID)
      .setSubject(CLIENT_ID)
      .setAudience(TOKEN_URL)
      .setIssuedAt(now)
      .setExpirationTime(now + 300)
      .setJti(Date.now() + '-' + Math.random().toString(36).substr(2,9))
      .sign(privateKey);
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: jwt,
      scope: 'dimona',
    });
    const resp = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    if (!resp.ok) {
      const err = await resp.text();
      return Response.json({ error: 'ONSS: ' + err }, { status: resp.status });
    }
    const tokenData = await resp.json();
    return Response.json(tokenData);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
