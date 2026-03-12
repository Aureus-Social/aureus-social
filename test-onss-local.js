
const { execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

const CLIENT_ID = 'self_service_chaman_305534_fnlh9vng4v';
const TOKEN_URL = 'https://api.socialsecurity.be/REST/oauth/v3/token';

// Lire la clé privée
const privateKey = fs.readFileSync('C:/Users/mouss/Downloads/aureus-onss-key.pem', 'utf8');

// Créer JWT manuellement
const header = Buffer.from(JSON.stringify({alg:'RS256',typ:'JWT'})).toString('base64url');
const now = Math.floor(Date.now()/1000);
const payload = Buffer.from(JSON.stringify({
  iss: CLIENT_ID, sub: CLIENT_ID, aud: TOKEN_URL,
  iat: now, exp: now+300, jti: Date.now()+'-test'
})).toString('base64url');

const sign = crypto.createSign('RSA-SHA256');
sign.update(header + '.' + payload);
const signature = sign.sign(privateKey, 'base64url');
const jwt = header + '.' + payload + '.' + signature;

// Tester avec curl
const curlCmd = `curl -s -X POST "${TOKEN_URL}" -H "Content-Type: application/x-www-form-urlencoded" -d "grant_type=client_credentials&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion=${jwt}&scope=dimona"`;

console.log('Test token ONSS...');
try {
  const result = execSync(curlCmd, {timeout: 15000}).toString();
  console.log('Reponse ONSS:', result);
} catch(e) {
  console.log('Erreur:', e.message);
}
