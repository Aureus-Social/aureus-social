// Helper pour récupérer le token JWT Supabase côté client
// Utilise le singleton supabase — pas de createClient() ici
import { supabase } from './supabase';

export async function getSupabaseToken() {
  try {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
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
