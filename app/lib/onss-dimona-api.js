// ═══════════════════════════════════════════════════════════════════
// ONSS DIMONA API — Aureus Social Pro
// Client ID: self_service_chaman_305534_fnlh9vng4v
// Numéro expéditeur: 305534
// Certificat: aureus-onss-2026 (valide jusqu'au 11/03/2028)
// ═══════════════════════════════════════════════════════════════════

'use client';

// Configuration ONSS
const ONSS_CONFIG = {
  clientId: 'self_service_chaman_305534_fnlh9vng4v',
  expediteur: '305534',
  onssNumber: '51357716',  // Matricule ONSS Aureus IA
  bceNumber: '1028230781',
  // URLs ONSS
  tokenUrl: 'https://api.socialsecurity.be/REST/oauth/v3/token',
  dimonaUrl: 'https://api.socialsecurity.be/REST/dimona/v2/declarations',
  simulationUrl: 'https://api.socialsecurity.be/REST/dimona/v2/declarations', // même URL en simulation
};

// Types Dimona selon type de contrat
const DIMONA_WORKER_TYPES = {
  'CDI': 'OTH',
  'CDD': 'OTH', 
  'STUDENT': 'STU',
  'FLEXI': 'FLX',
  'INTERM': 'INTERM',
  'student': 'STU',
  'flexi': 'FLX',
  'interim': 'INTERM',
};

/**
 * Obtenir un token OAuth2 via certificat JWT
 * L'authentification se fait côté serveur (Next.js API route)
 * car la clé privée ne doit JAMAIS être exposée côté client
 */
async function getONSSToken() {
  const res = await fetch('/api/onss/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Token ONSS impossible: ' + res.status);
  const data = await res.json();
  return data.access_token;
}

/**
 * Envoyer une Dimona IN via l'API ONSS
 */
async function sendDimonaIN(worker) {
  const res = await fetch('/api/onss/dimona', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'IN',
      worker: {
        ssin: worker.niss?.replace(/[^0-9]/g, ''),
        lastName: worker.last || worker.nom,
        firstName: worker.first || worker.prenom,
      },
      occupation: {
        startDate: worker.startD || worker.entree,
        workerType: DIMONA_WORKER_TYPES[worker.contract] || 'OTH',
        jointCommitteeNumber: worker.cp || '200',
      }
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur Dimona IN');
  return data;
}

/**
 * Envoyer une Dimona OUT via l'API ONSS
 */
async function sendDimonaOUT(worker, endDate, reason) {
  const res = await fetch('/api/onss/dimona', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'OUT',
      worker: {
        ssin: worker.niss?.replace(/[^0-9]/g, ''),
      },
      occupation: {
        startDate: worker.startD || worker.entree,
        endDate: endDate,
        workerType: DIMONA_WORKER_TYPES[worker.contract] || 'OTH',
        jointCommitteeNumber: worker.cp || '200',
        endReason: reason || 'END_OF_CONTRACT',
      }
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur Dimona OUT');
  return data;
}

/**
 * Consulter une Dimona existante
 */
async function getDimona(declarationId) {
  const res = await fetch(`/api/onss/dimona?id=${declarationId}`);
  if (!res.ok) throw new Error('Consultation impossible');
  return res.json();
}

export { sendDimonaIN, sendDimonaOUT, getDimona, DIMONA_WORKER_TYPES, ONSS_CONFIG };
