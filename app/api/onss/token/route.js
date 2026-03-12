// app/api/onss/token/route.js
// Route serveur — la clé privée reste côté serveur, jamais exposée au client

import { SignJWT, importPKCS8 } from 'jose';

const ONSS_CONFIG = {
  clientId: 'self_service_chaman_305534_fnlh9vng4v',
  tokenUrl: 'https://api.socialsecurity.be/REST/oauth/v3/token',
};

// Clé privée stockée en variable d'environnement (ONSS_PRIVATE_KEY)
const PRIVATE_KEY_PEM = process.env.ONSS_PRIVATE_KEY;

export async function POST() {
  try {
    if (!PRIVATE_KEY_PEM) {
      return Response.json({ error: 'ONSS_PRIVATE_KEY non configurée' }, { status: 500 });
    }

    // Importer la clé privée
    const privateKey = await importPKCS8(PRIVATE_KEY_PEM, 'RS256');

    // Créer le JWT signé pour l'authentification ONSS
    const now = Math.floor(Date.now() / 1000);
    const jwt = await new SignJWT({
      iss: ONSS_CONFIG.clientId,
      sub: ONSS_CONFIG.clientId,
      aud: ONSS_CONFIG.tokenUrl,
      iat: now,
      exp: now + 300, // valide 5 minutes
      jti: `${Date.now()}-${Math.random().toString(36).substr(2,9)}`,
    })
    .setProtectedHeader({ alg: 'RS256' })
    .sign(privateKey);

    // Demander le token ONSS
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: jwt,
      scope: 'dimona',
    });

    const resp = await fetch(ONSS_CONFIG.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return Response.json({ error: 'ONSS token error: ' + err }, { status: resp.status });
    }

    const tokenData = await resp.json();
    return Response.json(tokenData);

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
