/**
 * AUREUS SOCIAL PRO — API Guard
 * Validation centralisée pour les routes API
 * - Auth Supabase
 * - Rate limiting
 * - Input sanitization
 * - Error normalization
 */

import { createClient } from '@supabase/supabase-js';
import { logError, logWarn } from './security/logger.js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Réponses d'erreur normalisées (sans fuites d'info)
export const err = {
  unauthorized:  () => Response.json({ error: 'Non autorisé' }, { status: 401 }),
  forbidden:     () => Response.json({ error: 'Accès refusé' }, { status: 403 }),
  badRequest:    (msg = 'Requête invalide') => Response.json({ error: msg }, { status: 400 }),
  notFound:      () => Response.json({ error: 'Ressource introuvable' }, { status: 404 }),
  tooMany:       () => Response.json({ error: 'Trop de requêtes' }, { status: 429 }),
  internal:      () => Response.json({ error: 'Erreur interne du serveur' }, { status: 500 }),
  unavailable:   (msg = 'Service temporairement indisponible') => Response.json({ error: msg }, { status: 503 }),
};

// ─── Vérifier l'auth Bearer token Supabase
export async function requireAuth(request, requiredRole = null) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return { user: null, error: 'missing_token' };

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  
  if (error || !user) return { user: null, error: 'invalid_token' };
  
  if (requiredRole) {
    const role = user.user_metadata?.role;
    if (role !== requiredRole && role !== 'admin') {
      return { user: null, error: 'insufficient_role' };
    }
  }
  
  return { user, error: null };
}

// ─── Valider et sanitizer les inputs
export function validateBody(body, schema) {
  const errors = [];
  const result = {};
  
  for (const [key, rules] of Object.entries(schema)) {
    const val = body[key];
    
    if (rules.required && (val === undefined || val === null || val === '')) {
      errors.push(`${key} est requis`);
      continue;
    }
    if (val === undefined || val === null) continue;
    
    if (rules.type && typeof val !== rules.type) {
      errors.push(`${key} doit être de type ${rules.type}`);
      continue;
    }
    if (rules.maxLength && typeof val === 'string' && val.length > rules.maxLength) {
      errors.push(`${key} trop long (max ${rules.maxLength})`);
      continue;
    }
    if (rules.enum && !rules.enum.includes(val)) {
      errors.push(`${key} invalide (valeurs: ${rules.enum.join(', ')})`);
      continue;
    }
    if (rules.pattern && !rules.pattern.test(val)) {
      errors.push(`${key} format invalide`);
      continue;
    }
    
    // Sanitize strings
    result[key] = typeof val === 'string' ? val.trim().substring(0, rules.maxLength || 10000) : val;
  }
  
  return { valid: errors.length === 0, errors, data: result };
}

// ─── Wrapper try/catch pour les handlers API
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (e) {
      logError('APIGuard', 'Unhandled error in API route', e);
      return err.internal();
    }
  };
}

// ─── Vérifier le CRON_SECRET pour les routes cron
export function requireCronSecret(request) {
  const auth = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    logWarn('APIGuard', 'CRON_SECRET non configuré — route cron non protégée');
    return true; // Permissif si secret non configuré (dev)
  }
  return auth === `Bearer ${secret}`;
}
