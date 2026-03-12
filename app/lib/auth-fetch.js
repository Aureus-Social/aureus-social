// Helper pour récupérer le token JWT Supabase côté client
export async function getSupabaseToken() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    const { data } = await sb.auth.getSession();
    return data?.session?.access_token || null;
  } catch {
    return null;
  }
}

export async function authFetch(url, options = {}) {
  const token = await getSupabaseToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}
