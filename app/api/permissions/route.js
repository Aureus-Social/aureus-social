// API Permissions — vérifier et gérer les rôles utilisateurs
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
import { hasPermission, getRoleFromUser, getPermissionsForRole, PERMISSIONS } from '@/app/lib/permissions';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// GET — récupérer les permissions d'un utilisateur
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const permission = searchParams.get('permission');
    const role = searchParams.get('role') || 'readonly';

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

// POST — mettre à jour le rôle d'un utilisateur (Admin seulement)
export async function POST(request) {
  try {
    const { userId, newRole, adminEmail } = await request.json();

    if (!['admin','comptable','rh','commercial','readonly'].includes(newRole)) {
      return Response.json({ error: 'Rôle invalide' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role: newRole }
    });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    await supabase.from('audit_log').insert({
      action: 'UPDATE_USER_ROLE',
      table_name: 'auth.users',
      record_id: userId,
      details: { new_role: newRole, changed_by: adminEmail },
      created_at: new Date().toISOString()
    });

    return Response.json({ success: true, user: data.user });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
