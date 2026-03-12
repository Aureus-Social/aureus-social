// API Permissions — vérifier et gérer les rôles utilisateurs
import { logInfo, logError, logWarn } from '../../lib/security/logger.js';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
import { hasPermission, getRoleFromUser, getPermissionsForRole, PERMISSIONS } from '@/app/lib/permissions';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// GET — récupérer les permissions d'un utilisateur (auth obligatoire)
export async function GET(request) {
  const supabase = getSupabase();
  try {
    // Auth obligatoire — évite l'énumération des rôles par un attaquant
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const permission = searchParams.get('permission');
    const role = searchParams.get('role') || 'readonly';

    if (permission) {
      return Response.json({ allowed: hasPermission(role, permission), role });
    }

    return Response.json({
      role,
      permissions: getPermissionsForRole(role),
    });
  } catch (e) {
    return Response.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// POST — mettre à jour le rôle d'un utilisateur (Admin seulement)
export async function POST(request) {
  const supabase = getSupabase();
  try {
    // ─── Vérifier que le demandeur est authentifié ET admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !caller) {
      return Response.json({ error: 'Session invalide' }, { status: 401 });
    }
    const callerRole = caller.user_metadata?.role;
    if (callerRole !== 'admin') {
      return Response.json({ error: 'Accès refusé — rôle admin requis' }, { status: 403 });
    }

    const { userId, newRole, adminEmail } = await request.json();

    // Validation stricte des inputs
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return Response.json({ error: 'userId invalide' }, { status: 400 });
    }
    if (!['admin','comptable','rh','commercial','readonly'].includes(newRole)) {
      return Response.json({ error: 'Rôle invalide' }, { status: 400 });
    }
    // Empêcher un admin de se rétrograder lui-même
    if (userId === caller.id && newRole !== 'admin') {
      return Response.json({ error: 'Impossible de modifier votre propre rôle' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole }
    });

    if (error) return Response.json({ error: 'Erreur interne du serveur' }, { status: 500 });

    await supabase.from('audit_log').insert({
      action: 'UPDATE_USER_ROLE',
      table_name: 'auth.users',
      record_id: userId,
      details: { new_role: newRole, changed_by: adminEmail },
      created_at: new Date().toISOString()
    });

    return Response.json({ success: true, user: data.user });
  } catch (e) {
    return Response.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
