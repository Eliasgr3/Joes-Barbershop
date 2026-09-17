import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/config';
import type { AppointmentStatus, AppointmentWithRelations, Barber, BarberDayOff, BarberWorkingHours, Service } from '@/lib/types';

// Every function here guards on isSupabaseConfigured() and returns an empty/default result
// instead of throwing: Next.js can render a route's layout and page concurrently, so the
// admin layout's "not configured" bail-out can't be relied on alone to stop these queries
// from running before Supabase env vars are set.

export async function getAllBarbers(): Promise<Barber[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('barbers').select('*').order('sort_order');
  return data ?? [];
}

export async function getBarberById(id: string): Promise<Barber | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('barbers').select('*').eq('id', id).single();
  return data ?? null;
}

export async function getAllServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from('services').select('*').order('sort_order');
  return data ?? [];
}

export async function getWorkingHours(barberId: string): Promise<BarberWorkingHours[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('barber_working_hours')
    .select('*')
    .eq('barber_id', barberId)
    .order('weekday');
  return data ?? [];
}

export async function getDaysOff(barberId: string): Promise<BarberDayOff[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('barber_days_off')
    .select('*')
    .eq('barber_id', barberId)
    .order('off_date');
  return data ?? [];
}

type AppointmentFilters = {
  from?: string; // ISO
  to?: string; // ISO
  barberId?: string;
  status?: AppointmentStatus;
};

export async function getAppointments(filters: AppointmentFilters = {}): Promise<AppointmentWithRelations[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from('appointments')
    .select('*, barber:barbers(id, name), service:services(id, name, duration_min)')
    .order('starts_at', { ascending: true });

  if (filters.from) query = query.gte('starts_at', filters.from);
  if (filters.to) query = query.lte('starts_at', filters.to);
  if (filters.barberId) query = query.eq('barber_id', filters.barberId);
  if (filters.status) query = query.eq('status', filters.status);

  const { data } = await query;
  return (data as AppointmentWithRelations[] | null) ?? [];
}

export async function getRevenueSummary(from: string, to: string) {
  const appointments = await getAppointments({ from, to });
  // Confirmed rule: booked + completed count; cancelled + no_show are excluded.
  const counted = appointments.filter((a) => a.status === 'booked' || a.status === 'completed');

  const totalCents = counted.reduce((sum, a) => sum + a.price_cents_at_booking, 0);

  const byService = new Map<string, { name: string; cents: number; count: number }>();
  const byBarber = new Map<string, { name: string; cents: number; count: number }>();
  const byDay = new Map<string, number>();

  for (const a of counted) {
    const svc = byService.get(a.service.id) ?? { name: a.service.name, cents: 0, count: 0 };
    svc.cents += a.price_cents_at_booking;
    svc.count += 1;
    byService.set(a.service.id, svc);

    const brb = byBarber.get(a.barber.id) ?? { name: a.barber.name, cents: 0, count: 0 };
    brb.cents += a.price_cents_at_booking;
    brb.count += 1;
    byBarber.set(a.barber.id, brb);

    const day = a.starts_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + a.price_cents_at_booking);
  }

  return {
    totalCents,
    appointmentCount: counted.length,
    byService: [...byService.values()].sort((a, b) => b.cents - a.cents),
    byBarber: [...byBarber.values()].sort((a, b) => b.cents - a.cents),
    byDay: [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)),
  };
}
