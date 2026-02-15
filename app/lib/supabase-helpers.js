// lib/supabase-helpers.js
// Helpers pour appels Supabase depuis les pages features
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default supabase;

// Appel de fonction RPC
export async function rpc(fn, params = {}) {
  const { data, error } = await supabase.rpc(fn, params);
  if (error) throw error;
  return data;
}

// Select avec filtres
export async function query(table, filters = {}, options = {}) {
  let q = supabase.from(table).select(options.select || '*');
  Object.entries(filters).forEach(([k, v]) => { q = q.eq(k, v); });
  if (options.order) q = q.order(options.order, { ascending: options.asc ?? true });
  if (options.limit) q = q.limit(options.limit);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

// Insert
export async function insert(table, row) {
  const { data, error } = await supabase.from(table).insert(row).select();
  if (error) throw error;
  return data?.[0];
}

// Update
export async function update(table, id, changes) {
  const { data, error } = await supabase.from(table).update(changes).eq('id', id).select();
  if (error) throw error;
  return data?.[0];
}

// Delete
export async function remove(table, id) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}
