import { SignJWT } from 'jose';
import { createPrivateKey } from 'crypto';
export const dynamic = 'force-dynamic';

const CLIENT_ID = 'self_service_chaman_305534_fnlh9vng4v';
const TOKEN_URL = 'https://services.socialsecurity.be/REST/oauth/v5/token';
const DIMONA_URL = 'https://services.socialsecurity.be/REST/dimona/v2/declarations';
const CERT_SERIAL = '111034742307725981523417471549021221440785823051';

function getPrivateKey() {
  const raw = process.env.ONSS_PRIVATE_KEY || '';
  if (!raw.includes('BEGIN') && raw.length > 100) {
    return Buffer.from(raw, 'base64').toString('utf-8');
  }
  return raw;
}

export async function GET() {
  const results = [];
  const raw = process.env.ONSS_PRIVATE_KEY || '';
  const isBase64 = !raw.includes('BEGIN') && raw.length > 100;
  results.push({ test: 'Cle brute presente', ok: raw.length > 0, detail: raw.length + ' chars, base64=' + isBase64 });

  const pem = getPrivateKey();
  const pemOk = pem.includes('RSA PRIVATE KEY') || pem.includes('PRIVATE KEY');
  results.push({ test: 'Cle PEM reconstituee', ok: pemOk, detail: pem.substring(0,60) + '...' });

  let token = null;
  try {
    const privateKey = createPrivateKey(pem);
    const now = Math.floor(Date.now() / 1000);
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256', kid: CERT_SERIAL })
      .setIssuer(CLIENT_ID).setSubject(CLIENT_ID).setAudience(TOKEN_URL)
      .setIssuedAt(now).setExpirationTime(now + 300)
      .setJti(Date.now() + '-test')
      .sign(privateKey);
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: jwt,
    });
    const resp = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const text = await resp.text();
    if (resp.ok) {
      token = JSON.parse(text).access_token;
      results.push({ test: 'Token OAuth2 ONSS', ok: true, detail: 'Token obtenu: ' + token.substring(0,20) + '...' });
    } else {
      results.push({ test: 'Token OAuth2 ONSS', ok: false, detail: 'HTTP ' + resp.status + ': ' + text.substring(0,300) });
    }
  } catch(e) {
    results.push({ test: 'Token OAuth2 ONSS', ok: false, detail: e.message });
  }

  if (token) {
    try {
      const resp = await fetch(DIMONA_URL + '?employerNumber=51357716&limit=1', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      results.push({ test: 'API Dimona accessible', ok: resp.status < 500, detail: 'HTTP ' + resp.status });
    } catch(e) {
      results.push({ test: 'API Dimona accessible', ok: false, detail: e.message });
    }
  } else {
    results.push({ test: 'API Dimona accessible', ok: false, detail: 'Skip - pas de token' });
  }

  const allOk = results.every(r => r.ok);
  return Response.json({ status: allOk ? 'OK' : 'PROBLEMES', timestamp: new Date().toISOString(), results });
}
