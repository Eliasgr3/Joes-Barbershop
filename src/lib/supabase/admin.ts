import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';

/**
 * Service-role client — bypasses RLS entirely. Only ever imported from route handlers
 * (never a 'use client' file): the availability engine and the public booking insert
 * need it precisely because the anon key must never see other customers' appointment rows.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
