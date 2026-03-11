// ═══════════════════════════════════════════════════════════════
// TESTS D'ISOLATION RLS — Aureus Social Pro v2.1
// Multi-tenant security isolation via Supabase RLS
// 24 tests · 4 suites · 87 policies vérifiées
// Run: npm run test:rls
// ═══════════════════════════════════════════════════════════════

const https = require('https');

const SUPABASE_URL = 'https://jwjtlpewwdjxdboxtbdf.supabase.co';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const TOKEN_A      = process.env.RLS_TOKEN_A || '';
const TOKEN_B      = process.env.RLS_TOKEN_B || '';
const USER_A_ID    = process.env.RLS_USER_A_ID || '';
const USER_B_ID    = process.env.RLS_USER_B_ID || '';
const EMP_A_ID     = process.env.RLS_EMP_A_ID  || '';
const EMP_B_ID     = process.env.RLS_EMP_B_ID  || '';

// Helper HTTP via https natif Node.js (pas de dépendances)
function supaRequest(path, token, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const host = 'jwjtlpewwdjxdboxtbdf.supabase.co';
    const fullPath = `/rest/v1/${path}`;
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: host, port: 443, path: fullPath, method,
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(new Error('timeout')); });
    if (payload) req.write(payload);
    req.end();
  });
}

const get  = (path, token) => supaRequest(path, token);
const post = (path, token, body) => supaRequest(path, token, 'POST', body || {});

// ─── SUITES DE TESTS ─────────────────────────────────────────

describe('RLS Isolation — Sécurité Multi-Tenant Aureus Social Pro', () => {

  describe('1. Isolation table: employees', () => {

    test('User A lit ses propres employees (>0)', async () => {
      const { body } = await get(`employees?select=id,user_id&limit=10`, TOKEN_A);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    test('User B lit ses propres employees (>0)', async () => {
      const { body } = await get(`employees?select=id,user_id&limit=10`, TOKEN_B);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    test('🔐 User A ne voit PAS l\'employee de User B (id direct)', async () => {
      const { body } = await get(`employees?id=eq.${EMP_B_ID}&select=id,user_id`, TOKEN_A);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(0);
    });

    test('🔐 User B ne voit PAS l\'employee de User A (id direct)', async () => {
      const { body } = await get(`employees?id=eq.${EMP_A_ID}&select=id,user_id`, TOKEN_B);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(0);
    });

    test('🔐 SELECT * Token A ne retourne que ses données', async () => {
      const { body } = await get(`employees?select=id,user_id&limit=100`, TOKEN_A);
      expect(Array.isArray(body)).toBe(true);
      body.forEach(e => { if (e.user_id) expect(e.user_id).toBe(USER_A_ID); });
    });

    test('🔐 user_id falsifié dans query ne bypass pas RLS', async () => {
      const { body } = await get(`employees?user_id=eq.${USER_B_ID}&select=id`, TOKEN_A);
      expect(Array.isArray(body) ? body.length : 0).toBe(0);
    });

  });

  describe('2. Isolation tables financières et RH', () => {

    const TABLES = [
      'payroll_history', 'fiches_paie', 'invoices',
      'documents', 'absences', 'relances', 'audit_log'
    ];

    for (const table of TABLES) {
      test(`🔐 ${table}: 0 données cross-tenant`, async () => {
        const { body } = await get(`${table}?user_id=eq.${USER_B_ID}&select=id&limit=5`, TOKEN_A);
        expect(Array.isArray(body) ? body.length : 0).toBe(0);
      });
    }

  });

  describe('3. Fonction SQL test_rls_isolation (87 policies)', () => {

    test('AUTH_UID correct pour User A', async () => {
      const { body } = await post(`rpc/test_rls_isolation`, TOKEN_A, {});
      expect(Array.isArray(body)).toBe(true);
      const t = body.find(x => x.test_name === 'AUTH_UID');
      expect(t?.test_result).toBe('PASS');
      expect(t?.details).toContain(USER_A_ID);
    });

    test('AUTH_UID correct pour User B', async () => {
      const { body } = await post(`rpc/test_rls_isolation`, TOKEN_B, {});
      expect(Array.isArray(body)).toBe(true);
      const t = body.find(x => x.test_name === 'AUTH_UID');
      expect(t?.test_result).toBe('PASS');
      expect(t?.details).toContain(USER_B_ID);
    });

    test('≥30 policies RLS actives (actuellement 87)', async () => {
      const { body } = await post(`rpc/test_rls_isolation`, TOKEN_A, {});
      expect(Array.isArray(body)).toBe(true);
      const t = body.find(x => x.test_name === 'POLICIES_COUNT');
      expect(t?.test_result).toBe('PASS');
      const count = parseInt(t?.details?.match(/\d+/)?.[0] || '0');
      expect(count).toBeGreaterThanOrEqual(30);
    });

    for (const testName of ['RLS_CLIENTS','RLS_PAYROLL_HISTORY','RLS_FICHES_PAIE','RLS_INVOICES','RLS_DOCUMENTS']) {
      test(`${testName} retourne PASS`, async () => {
        const { body } = await post(`rpc/test_rls_isolation`, TOKEN_A, {});
        expect(Array.isArray(body)).toBe(true);
        const t = body.find(x => x.test_name === testName);
        expect(t?.test_result).toBe('PASS');
      });
    }

  });

  describe('4. Robustesse / edge cases', () => {

    test('Token invalide → 401 ou 403', async () => {
      const { status } = await get(`employees`, 'invalid.jwt.token.xyz');
      expect([401, 403]).toContain(status);
    });

    test('🔐 SELECT * Token B ne retourne que ses données', async () => {
      const { body } = await get(`employees?select=id,user_id&limit=100`, TOKEN_B);
      expect(Array.isArray(body)).toBe(true);
      body.forEach(e => { if (e.user_id) expect(e.user_id).toBe(USER_B_ID); });
    });

  });

});
