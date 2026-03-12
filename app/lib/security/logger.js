/**
 * AUREUS SOCIAL PRO — Production Logger
 * Remplace les 16 console.log identifiés (info leak en prod)
 * + Wrapper pour les 30 catch(e) vides → logs structurés
 * 
 * En PROD : logs silencieux côté client, envoyés vers Supabase audit_log
 * En DEV  : logs visibles dans la console navigateur
 */

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

// ─── Niveaux de log
const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const MIN_LEVEL = isDev ? LEVELS.DEBUG : LEVELS.ERROR; // En prod : seulement les erreurs

// ─── Buffer d'erreurs à envoyer en batch vers Supabase
let errorBuffer = [];
let flushTimeout = null;

const flushErrors = async () => {
  if (!errorBuffer.length || !isProd) return;
  const batch = [...errorBuffer];
  errorBuffer = [];
  try {
    // Import dynamique pour éviter la dépendance circulaire
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    await supabase.from('error_logs').insert(batch);
  } catch {
    // Silencieux — ne pas crasher l'app si le log échoue
  }
};

const scheduleFlush = () => {
  clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flushErrors, 5000); // Batch toutes les 5s
};

// ─── Logger principal
const log = (level, module, message, data = null) => {
  if (level < MIN_LEVEL) return;

  const entry = {
    level: Object.keys(LEVELS)[level],
    module,
    message,
    data: data ? JSON.stringify(data) : null,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.pathname : 'server',
  };

  if (isDev) {
    const colors = { DEBUG: '#888', INFO: '#4ade80', WARN: '#fbbf24', ERROR: '#f87171' };
    const color = colors[entry.level] || '#fff';
    console.log(`%c[${entry.level}] [${module}] ${message}`, `color:${color}`, data || '');
  }

  if (isProd && level >= LEVELS.ERROR) {
    errorBuffer.push(entry);
    scheduleFlush();
  }
};

// ─── API publique

/** Debug (dev only) */
export const logDebug = (module, message, data) => log(LEVELS.DEBUG, module, message, data);

/** Info (dev only) */
export const logInfo = (module, message, data) => log(LEVELS.INFO, module, message, data);

/** Warning (dev + prod silent) */
export const logWarn = (module, message, data) => log(LEVELS.WARN, module, message, data);

/** Error (dev + prod → Supabase) */
export const logError = (module, message, error) => {
  log(LEVELS.ERROR, module, message, {
    error: error?.message || String(error),
    stack: error?.stack?.split('\n').slice(0, 3).join(' | '),
  });
};

/**
 * Wrapper try/catch — remplace les 30 blocs catch(e) {} vides
 * @param {Function} fn - Fonction async à exécuter
 * @param {string} module - Nom du module (pour le log)
 * @param {string} context - Description de l'action
 * @param {any} fallback - Valeur retournée en cas d'erreur
 */
export const trySafe = async (fn, module, context, fallback = null) => {
  try {
    return await fn();
  } catch (err) {
    logError(module, `trySafe: ${context}`, err);
    return fallback;
  }
};

/**
 * Wrapper pour les appels Supabase — log automatique des erreurs
 * @param {Promise} supabaseQuery - Ex: supabase.from('table').select()
 * @param {string} module - Nom du module
 * @param {string} operation - Ex: 'fetch employees'
 */
export const safeQuery = async (supabaseQuery, module, operation) => {
  const { data, error } = await supabaseQuery;
  if (error) {
    logError(module, `Supabase error: ${operation}`, error);
    return { data: null, error };
  }
  return { data, error: null };
};

// ─── Migration : remplacer console.log par logInfo
// Rechercher dans le codebase: console\.log\(
// Remplacer par: logInfo('MODULE_NAME', ...)
//
// EXEMPLE AVANT:
//   console.log('Employee saved:', emp)
//
// EXEMPLE APRÈS:
//   logInfo('PayrollGroup', 'Employee saved', emp)

export default { logDebug, logInfo, logWarn, logError, trySafe, safeQuery };
