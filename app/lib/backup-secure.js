'use client';
// ═══════════════════════════════════════════════════════════════════════════
// AUREUS SOCIAL PRO — backup-secure.js v2.0
// Chiffrement AES-256-GCM + PBKDF2 (100 000 itérations)
// Remplace backup.js (non chiffré)
// ═══════════════════════════════════════════════════════════════════════════

const SALT_PREFIX = 'aureus-backup-salt-2026-v2-';
const ITERATIONS  = 100000;
const KEY_LEN     = 256;

// ─── Dériver une clé AES-256 depuis userId ──────────────────────────────
async function deriveKey(userId) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(userId),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(SALT_PREFIX + userId),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LEN },
    false,
    ['encrypt', 'decrypt']
  );
}

// ─── Chiffrer données JSON ───────────────────────────────────────────────
export async function encryptData(userId, data) {
  const key = await deriveKey(userId);
  const iv  = crypto.getRandomValues(new Uint8Array(12));
  const encoded   = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return {
    iv:  Array.from(iv),
    data: Array.from(new Uint8Array(encrypted)),
    v:   '2.0',
    ts:  Date.now(),
  };
}

// ─── Déchiffrer données ──────────────────────────────────────────────────
export async function decryptData(userId, payload) {
  if (!payload?.v || payload.v !== '2.0') throw new Error('Format backup invalide ou version incompatible');
  const key = await deriveKey(userId);
  const iv  = new Uint8Array(payload.iv);
  const enc = new Uint8Array(payload.data);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, enc);
  return JSON.parse(new TextDecoder().decode(decrypted));
}

// ─── Tables par rôle ─────────────────────────────────────────────────────
const ROLE_TABLES = {
  admin:      ['employees', 'travailleurs', 'fiches_paie', 'payroll_history',
               'documents', 'audit_log', 'activity_log', 'app_state',
               'dimona', 'dmfa', 'baremes_cp', 'declaration_queue', 'invoices'],
  comptable:  ['payroll_history', 'fiches_paie', 'documents', 'baremes_cp', 'invoices'],
  rh:         ['employees', 'travailleurs', 'documents', 'activity_log'],
  commercial: ['documents', 'app_state', 'invoices'],
  readonly:   [],
};

// ─── Backup automatique à chaque session (max 1x/2h) ────────────────────
export async function autoBackupOnSession(supabase, user) {
  if (!user?.id) return null;

  const role   = user?.user_metadata?.role || 'readonly';
  const tables = ROLE_TABLES[role] || [];
  if (!tables.length) return null;

  // Throttle côté serveur : on vérifie le dernier backup dans audit_log
  try {
    const { data: lastBk } = await supabase
      .from('audit_log')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('action', 'auto_backup_secure')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastBk) {
      const elapsed = Date.now() - new Date(lastBk.created_at).getTime();
      const TWO_HOURS = 2 * 60 * 60 * 1000;
      if (elapsed < TWO_HOURS) return null; // Trop tôt
    }
  } catch (_) { /* table absente — on continue */ }

  // Récupérer les données selon le rôle
  const backupData = {
    timestamp: new Date().toISOString(),
    version:   '2.0',
    role,
    userId:    user.id,
    tables:    {},
  };

  let totalRecords = 0;
  for (const table of tables) {
    try {
      const { data } = await supabase.from(table).select('*').eq('user_id', user.id);
      backupData.tables[table] = data || [];
      totalRecords += (data || []).length;
    } catch (_) {
      backupData.tables[table] = [];
    }
  }

  // Chiffrement AES-256-GCM
  const encrypted = await encryptData(user.id, backupData);

  // Persister en base (session_backups) + tracer dans audit_log
  try {
    await Promise.all([
      supabase.from('session_backups').upsert({
        user_id:     user.id,
        role,
        backup_data: encrypted,
        records:     totalRecords,
        tables_count: tables.length,
        updated_at:  new Date().toISOString(),
      }, { onConflict: 'user_id' }),

      supabase.from('audit_log').insert({
        user_id:    user.id,
        action:     'auto_backup_secure',
        details:    JSON.stringify({ records: totalRecords, tables: tables.length, role }),
        created_at: new Date().toISOString(),
      }),
    ]);
  } catch (_) { /* Silencieux — backup non bloquant */ }

  return { records: totalRecords, tables: tables.length, role };
}

// ─── Restauration depuis backup chiffré ─────────────────────────────────
export async function restoreFromBackup(supabase, user, encryptedPayload) {
  if (!user?.id) throw new Error('Utilisateur non authentifié');

  const data = await decryptData(user.id, encryptedPayload);

  // Vérification rôle
  const userRole = user?.user_metadata?.role || 'readonly';
  if (data.role !== userRole) {
    throw new Error(`Incompatibilité de rôle — backup: ${data.role}, session: ${userRole}`);
  }

  let restored = 0;
  for (const [table, rows] of Object.entries(data.tables)) {
    if (!rows.length) continue;
    try {
      const { error } = await supabase
        .from(table)
        .upsert(rows.map(r => ({ ...r, user_id: user.id })), { onConflict: 'id' });
      if (!error) restored += rows.length;
    } catch (_) {}
  }

  // Audit
  try {
    await supabase.from('audit_log').insert({
      user_id:    user.id,
      action:     'restore_backup',
      details:    JSON.stringify({ restored, tables: Object.keys(data.tables).length, from_ts: data.timestamp }),
      created_at: new Date().toISOString(),
    });
  } catch (_) {}

  return { restored, tables: Object.keys(data.tables).length, from: data.timestamp };
}

// ─── Statut du dernier backup ────────────────────────────────────────────
export async function getBackupStatus(supabase, userId) {
  try {
    const { data } = await supabase
      .from('session_backups')
      .select('updated_at, records, tables_count, role')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data) return { label: 'Jamais sauvegardé', color: '#ef4444', ok: false };

    const mins = Math.floor((Date.now() - new Date(data.updated_at).getTime()) / 60000);
    const label = mins < 60
      ? `Sauvegardé il y a ${mins}min`
      : `Sauvegardé il y a ${Math.floor(mins / 60)}h`;
    const color = mins < 150 ? '#22c55e' : mins < 360 ? '#f97316' : '#ef4444';

    return { label, color, ok: mins < 150, records: data.records, tables: data.tables_count, role: data.role };
  } catch (_) {
    return { label: 'Statut inconnu', color: '#9e9b93', ok: false };
  }
}

// ─── Download backup chiffré (JSON) ─────────────────────────────────────
export async function downloadEncryptedBackup(supabase, user) {
  if (!user?.id) return;
  const { data } = await supabase
    .from('session_backups')
    .select('backup_data, updated_at, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data?.backup_data) throw new Error('Aucun backup disponible');

  const json = JSON.stringify(data.backup_data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `aureus-backup-encrypted-${data.role}-${data.updated_at.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);

  return { filename: a.download };
}

// ─── Réexports compatibilité (fonctions backup.js conservées) ────────────
// ─── Export CSV utilitaires (anciennement dans backup.js) ───────────────────
function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 3000);
}

export function exportEmployeesCSV(employees) {
  if (!employees || !employees.length) return { error: 'Aucun employé à exporter' };
  const headers = ['Nom','Prénom','NISS','Email','Téléphone','Statut','Contrat','Date entrée','Date sortie','Fonction','Brut mensuel','Régime','CP','IBAN'];
  const rows = employees.map(e => [
    (e.last||e.ln||'').replace(/;/g,','), (e.first||e.fn||'').replace(/;/g,','),
    e.niss||'', e.email||'', e.phone||'', e.statut||'Employé', e.contractType||'CDI',
    e.startDate||'', e.endDate||'', e.fonction||e.jobTitle||'',
    (+(e.monthlySalary||e.gross||0)).toFixed(2), (+(e.regime||100))+'%', e.cp||'', e.iban||''
  ].join(';'));
  const csv = '\uFEFF' + headers.join(';') + '\n' + rows.join('\n');
  const date = new Date().toISOString().slice(0,10);
  downloadFile(csv, `Employes_backup_${date}.csv`, 'text/csv');
  return { count: employees.length, filename: `Employes_backup_${date}.csv` };
}

export function exportPayrollCSV(payrollHistory) {
  if (!payrollHistory || !payrollHistory.length) return { error: 'Aucune fiche de paie à exporter' };
  const headers = ['Période','Nom','Prénom','Brut','ONSS','Précompte','Net','Coût employeur','Statut'];
  const rows = payrollHistory.map(p => [
    p.periode||p.period||'', p.last||p.nom||p.ln||'', p.first||p.prenom||p.fn||'',
    (+(p.brut||p.gross||0)).toFixed(2), (+(p.onss||p.cotisationsONSS||0)).toFixed(2),
    (+(p.precompte||p.pp||0)).toFixed(2), (+(p.net||0)).toFixed(2),
    (+(p.coutEmployeur||p.totalCost||0)).toFixed(2), p.status||p.statut||'Calculé'
  ].join(';'));
  const csv = '\uFEFF' + headers.join(';') + '\n' + rows.join('\n');
  const date = new Date().toISOString().slice(0,10);
  downloadFile(csv, `FichesPayroll_backup_${date}.csv`, 'text/csv');
  return { count: payrollHistory.length, filename: `FichesPayroll_backup_${date}.csv` };
}

export async function exportAllData(supabase, userId, employees, payrollHistory) {
  const results = {};
  if (employees && employees.length) results.employees = exportEmployeesCSV(employees);
  if (payrollHistory && payrollHistory.length) results.payroll = exportPayrollCSV(payrollHistory);
  return results;
}
