import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qcunxnadjxggizdksvay.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdW54bmFkanhnZ2l6ZGtzdmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDE5MzcsImV4cCI6MjA4NjQ3NzkzN30.vxvWTPSOKsBuztgnjGV2TI4AEIic5E_a5eNtwpj4gXQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
