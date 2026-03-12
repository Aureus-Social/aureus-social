import { logWarn } from './security/logger.js';
// ═══ AUREUS SOCIAL PRO — Audit Trail Serveur (RGPD Art. 30) ═══
// Toutes les actions sensibles tracées côté serveur via /api/audit

let _currentUser = null;

export function setAuditUser(user) {
  _currentUser = user;
}

/**
 * Tracer une action côté serveur
 * @param {string} action - Ex: 'CREATE_EMPLOYEE', 'UPDATE_PAYSLIP', 'DELETE_CONTRACT'
 * @param {string} table_name - Table concernée
 * @param {string|null} record_id - ID de l'enregistrement
 * @param {object|null} details - Détails supplémentaires (avant/après, champs modifiés)
 */
export async function auditLog(action, table_name = null, record_id = null, details = null) {
  try {
    await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        table_name,
        record_id,
        details,
        user_id: _currentUser?.id || null,
        user_email: _currentUser?.email || null,
      })
    });
  } catch (e) {
    logWarn('Audit', `Échec trace: ${action}`, e);
  }
}

// Helpers prêts à l'emploi
export const audit = {
  // Employés
  createEmployee: (emp) => auditLog('CREATE_EMPLOYEE', 'employees', emp?.id, { name: `${emp?.prenom} ${emp?.nom}`, niss_masked: emp?.niss ? emp.niss.substring(0,6)+'***' : null }),
  updateEmployee: (emp, fields) => auditLog('UPDATE_EMPLOYEE', 'employees', emp?.id, { name: `${emp?.prenom} ${emp?.nom}`, fields_changed: fields }),
  deleteEmployee: (emp) => auditLog('DELETE_EMPLOYEE', 'employees', emp?.id, { name: `${emp?.prenom} ${emp?.nom}` }),

  // Fiches de paie
  generatePayslip: (emp, month, year) => auditLog('GENERATE_PAYSLIP', 'fiches_paie', null, { employee: `${emp?.prenom} ${emp?.nom}`, period: `${month}/${year}` }),
  exportPayslip: (emp, month, year) => auditLog('EXPORT_PAYSLIP', 'fiches_paie', null, { employee: `${emp?.prenom} ${emp?.nom}`, period: `${month}/${year}` }),

  // Déclarations
  submitDimona: (emp, type) => auditLog('SUBMIT_DIMONA', 'dimona', null, { employee: `${emp?.prenom} ${emp?.nom}`, type }),
  submitDmfa: (quarter, year) => auditLog('SUBMIT_DMFA', 'dmfa', null, { quarter, year }),

  // Documents
  generateContract: (emp, type) => auditLog('GENERATE_CONTRACT', 'documents', null, { employee: `${emp?.prenom} ${emp?.nom}`, type }),

  // Auth
  login: (email) => auditLog('USER_LOGIN', 'auth', null, { email }),
  logout: (email) => auditLog('USER_LOGOUT', 'auth', null, { email }),

  // Backup
  backup: (records) => auditLog('BACKUP_GENERATED', 'backup', null, { total_records: records }),

  // Admin
  updateSettings: (section) => auditLog('UPDATE_SETTINGS', 'app_state', null, { section }),

  // Générique
  custom: (action, table, id, details) => auditLog(action, table, id, details),
};
