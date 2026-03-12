import { SignJWT, importPKCS8 } from 'jose';
export const dynamic = 'force-dynamic';

const CLIENT_ID = 'self_service_chaman_305534_fnlh9vng4v';
const TOKEN_URL = 'https://api.socialsecurity.be/REST/oauth/v3/token';
const DIMONA_URL = 'https://api.socialsecurity.be/REST/dimona/v2/declarations';
const ONSS_NUMBER = '51357716';

function getPrivateKey() {
  const raw = process.env.ONSS_PRIVATE_KEY || '';
  if (!raw.includes('BEGIN') && raw.length > 100) {
    return Buffer.from(raw, 'base64').toString('utf-8');
  }
  if (raw.includes('BEGIN PRIVATE KEY') && !raw.includes('\n')) {
    return raw.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
              .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----\n')
              .replace(/([A-Za-z0-9+/=]{64})/g, '$1\n');
  }
  return raw;
}

export async function GET() {
  const results = [];
  const rawKey = process.env.ONSS_PRIVATE_KEY || '';
  const pemKey = getPrivateKey();

  results.push({ test: 'Cle brute presente', ok: rawKey.length > 0, detail: rawKey.length + ' chars, base64=' + !rawKey.includes('BEGIN') });
  results.push({ test: 'Cle PEM reconstituee', ok: pemKey.includes('BEGIN PRIVATE KEY'), detail: pemKey.slice(0,60) + '...' });

  let tokenOk = false, tokenDetail = '', accessToken = null;
  try {
    const privateKey = await importPKCS8(pemKey, 'RS256');
    const now = Math.floor(Date.now() / 1000);
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer(CLIENT_ID).setSubject(CLIENT_ID).setAudience(TOKEN_URL)
      .setIssuedAt(now).setExpirationTime(now + 300)
      .setJti(Date.now() + '-test').sign(privateKey);
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: jwt, scope: 'dimona',
    });
    const resp = await fetch(TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() });
    const data = await resp.json();
    if (resp.ok && data.access_token) {
      tokenOk = true; accessToken = data.access_token;
      tokenDetail = 'Token OK! Expire dans ' + data.expires_in + 's';
    } else {
      tokenDetail = 'HTTP ' + resp.status + ': ' + JSON.stringify(data).slice(0,300);
    }
  } catch(e) { tokenDetail = e.message; }
  results.push({ test: 'Token OAuth2 ONSS', ok: tokenOk, detail: tokenDetail });

  let dimonaOk = false, dimonaDetail = '';
  if (accessToken) {
    try {
      const resp = await fetch(DIMONA_URL, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ declarationType: 'IN', worker: { ssin: '95012345601' }, employer: { nssoNumber: ONSS_NUMBER }, occupation: { startDate: new Date().toISOString().split('T')[0], workerType: 'OTH', jointCommitteeNumber: '200' } }),
      });
      const data = await resp.json();
      dimonaOk = [201, 400, 422, 404].includes(resp.status);
      dimonaDetail = 'HTTP ' + resp.status + ': ' + JSON.stringify(data).slice(0,300);
    } catch(e) { dimonaDetail = e.message; }
  } else { dimonaDetail = 'Skip - pas de token'; }
  results.push({ test: 'API Dimona accessible', ok: dimonaOk, detail: dimonaDetail });

  return Response.json({ status: results.every(r=>r.ok) ? 'TOUT OK' : 'PROBLEMES', timestamp: new Date().toISOString(), results });
}
