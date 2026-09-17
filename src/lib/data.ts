import { createSupabaseServerClient } from '@/lib/supabase/server';
import { FALLBACK_BARBERS, FALLBACK_SERVICES } from '@/lib/fallback-data';
import type { Barber, Service } from '@/lib/types';

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function getActiveBarbers(): Promise<Barber[]> {
  if (!supabaseConfigured) return FALLBACK_BARBERS;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error || !data || data.length === 0) return FALLBACK_BARBERS;
    return data;
  } catch {
    return FALLBACK_BARBERS;
  }
}

export async function getActiveServices(): Promise<Service[]> {
  if (!supabaseConfigured) return FALLBACK_SERVICES;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error || !data || data.length === 0) return FALLBACK_SERVICES;
    return data;
  } catch {
    return FALLBACK_SERVICES;
  }
}
