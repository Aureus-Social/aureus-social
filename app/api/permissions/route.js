// API Permissions — vérifier et gérer les rôles utilisateurs
import { createClient } from '@supabase/supabase-js';
import { getAuthUser } from '@/app/lib/supabase';
import { hasPermission, getRoleFromUser, getPermissionsForRole, PERMISSIONS } from '@/app/lib/permissions';

export const dynamic = 'force-dynamic';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// GET — récupérer les permissions d'un utilisateur (JWT requis)
export async function GET(request) {
  try {
    // ✅ Auth JWT obligatoire
    const caller = await getAuthUser(request);
    if (!caller) return Response.json({ error: 'Non autorisé — JWT requis' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const permission = searchParams.get('permission');
    const role = searchParams.get('role') || getRoleFromUser(caller) || 'readonly';

    if (permission) {
      return Response.json({ allowed: hasPermission(role, permission), role });
    }

    return Response.json({
      role,
      permissions: getPermissionsForRole(role),
      all_permissions: Object.keys(PERMISSIONS)
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// POST — mettre à jour le rôle d'un utilisateur (Admin JWT uniquement)
export async function POST(request) {
  try {
    // ✅ Auth JWT obligatoire + vérif rôle admin côté serveur
    const caller = await getAuthUser(request);
    if (!caller) return Response.json({ error: 'Non autorisé — JWT requis' }, { status: 401 });

    const callerRole = getRoleFromUser(caller) || caller?.user_metadata?.role || 'readonly';
    if (callerRole !== 'admin') {
      return Response.json({ error: 'Accès refusé — rôle admin requis' }, { status: 403 });
    }

    const { userId, newRole } = await request.json();

    if (!['admin','comptable','rh','commercial','readonly'].includes(newRole)) {
      return Response.json({ error: 'Rôle invalide' }, { status: 400 });
    }

    // Empêcher l'auto-promotion (sécurité supplémentaire)
    if (userId === caller.id && newRole === 'admin') {
      return Response.json({ error: 'Auto-promotion interdite' }, { status: 403 });
    }

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole }
    });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    await supabase.from('audit_log').insert({
      action: 'UPDATE_USER_ROLE',
      table_name: 'auth.users',
      record_id: userId,
      details: { new_role: newRole, changed_by: caller.email },
      user_id: caller.id,
      user_email: caller.email,
      created_at: new Date().toISOString()
    });

    return Response.json({ success: true, user: data.user });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
