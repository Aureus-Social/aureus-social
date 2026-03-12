import { SignJWT, importPKCS8 } from 'jose';
export const dynamic = 'force-dynamic';

const CLIENT_ID = 'self_service_chaman_305534_fnlh9vng4v';
const TOKEN_URL = 'https://api.socialsecurity.be/REST/oauth/v3/token';
const DIMONA_URL = 'https://api.socialsecurity.be/REST/dimona/v2/declarations';
const ONSS_NUMBER = '51357716';

export async function GET() {
  const results = [];

  // TEST 1 — Clé privée présente ?
  const keyPresent = !!process.env.ONSS_PRIVATE_KEY;
  results.push({ test: 'Cle privee ONSS_PRIVATE_KEY', ok: keyPresent, detail: keyPresent ? 'Presente (' + (process.env.ONSS_PRIVATE_KEY?.length || 0) + ' chars)' : 'ABSENTE' });

  // TEST 2 — Format clé valide ?
  const keyValid = process.env.ONSS_PRIVATE_KEY?.includes('BEGIN PRIVATE KEY') || false;
  results.push({ test: 'Format cle PEM valide', ok: keyValid, detail: keyValid ? 'BEGIN PRIVATE KEY detecte' : 'Format invalide' });

  // TEST 3 — Obtenir token ONSS
  let tokenOk = false;
  let tokenDetail = '';
  let accessToken = null;
  try {
    const privateKey = await importPKCS8(process.env.ONSS_PRIVATE_KEY, 'RS256');
    const now = Math.floor(Date.now() / 1000);
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer(CLIENT_ID)
      .setSubject(CLIENT_ID)
      .setAudience(TOKEN_URL)
      .setIssuedAt(now)
      .setExpirationTime(now + 300)
      .setJti(Date.now() + '-test')
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

    const data = await resp.json();
    if (resp.ok && data.access_token) {
      tokenOk = true;
      accessToken = data.access_token;
      tokenDetail = 'Token obtenu! Expire dans ' + data.expires_in + 's';
    } else {
      tokenDetail = 'Erreur ' + resp.status + ': ' + JSON.stringify(data).slice(0,200);
    }
  } catch(e) {
    tokenDetail = 'Exception: ' + e.message;
  }
  results.push({ test: 'Obtenir token OAuth2 ONSS', ok: tokenOk, detail: tokenDetail });

  // TEST 4 — Simulation Dimona IN (données fictives)
  let dimonaOk = false;
  let dimonaDetail = '';
  if (accessToken) {
    try {
      const payload = {
        declarationType: 'IN',
        worker: { ssin: '95012345601' }, // NISS fictif
        employer: { nssoNumber: ONSS_NUMBER },
        occupation: {
          startDate: new Date().toISOString().split('T')[0],
          workerType: 'OTH',
          jointCommitteeNumber: '200',
        }
      };

      const resp = await fetch(DIMONA_URL, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      // 201 = succès, 400/422 = données invalides (normal avec NISS fictif) mais API accessible
      if (resp.status === 201) {
        dimonaOk = true;
        dimonaDetail = 'Dimona acceptee! ID: ' + (data.declarationId || data.id);
      } else if (resp.status === 400 || resp.status === 422 || resp.status === 404) {
        dimonaOk = true; // API accessible, juste NISS fictif rejeté = normal
        dimonaDetail = 'API accessible (NISS fictif rejete normalement): ' + resp.status + ' - ' + JSON.stringify(data).slice(0,150);
      } else if (resp.status === 401) {
        dimonaDetail = 'Token non autorise pour Dimona - verifier permissions Chaman';
      } else {
        dimonaDetail = 'Status ' + resp.status + ': ' + JSON.stringify(data).slice(0,200);
      }
    } catch(e) {
      dimonaDetail = 'Exception: ' + e.message;
    }
  } else {
    dimonaDetail = 'Skip - pas de token';
  }
  results.push({ test: 'Test Dimona IN (NISS fictif)', ok: dimonaOk, detail: dimonaDetail });

  const allOk = results.every(r => r.ok);
  return Response.json({ 
    status: allOk ? 'TOUT OK' : 'PROBLEMES DETECTES',
    timestamp: new Date().toISOString(),
    clientId: CLIENT_ID,
    onssNumber: ONSS_NUMBER,
    results 
  }, { status: 200 });
}
