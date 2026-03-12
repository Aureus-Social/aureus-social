import { SignJWT, importPKCS8 } from 'jose';
export const dynamic = 'force-dynamic';

const CLIENT_ID = 'self_service_chaman_305534_fnlh9vng4v';
const TOKEN_URL = 'https://api.socialsecurity.be/REST/oauth/v3/token';

export async function POST() {
  try {
    const PRIVATE_KEY_PEM = process.env.ONSS_PRIVATE_KEY;
    if (!PRIVATE_KEY_PEM) {
      return Response.json({ error: 'ONSS_PRIVATE_KEY non configuree' }, { status: 500 });
    }
    const privateKey = await importPKCS8(PRIVATE_KEY_PEM, 'RS256');
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
