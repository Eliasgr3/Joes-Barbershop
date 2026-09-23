'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { SHOP_TIMEZONE } from '@/lib/constants';

export type CancelResult = { ok: true } | { ok: false; message: string };

export type FoundBooking = {
  id: string;
  serviceName: string;
  barberName: string;
  whenLabel: string;
  priceCents: number;
};

/**
 * Phone numbers get typed in every format a person can think of — with or without the country
 * code, with spaces, with a leading zero. Comparing on just the last 10 digits (a full Greek
 * mobile number) makes all of those match each other.
 */
function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '').slice(-10);
}

/**
 * Self-serve "find my booking" — the only way back to a cancellable appointment once the
 * confirmation screen/email is long gone. Deliberately just a phone match, no second factor:
 * this mirrors the trust level of calling the shop and saying "hi, it's Giannis" — nothing
 * more sensitive than a haircut time is exposed, and requiring an OTP here would be security
 * theater for a corner barbershop.
 */
export async function findBookingsByPhone(phone: string): Promise<FoundBooking[]> {
  const target = normalizePhone(phone);
  if (target.length < 8) return [];

  // Embedded relations don't type-infer against our hand-written Database type, so the joined
  // shape is asserted here the same way admin-data.ts does it.
  type Row = {
    id: string;
    starts_at: string;
    customer_phone: string;
    price_cents_at_booking: number;
    service: { name: string } | null;
    barber: { name: string } | null;
  };

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('appointments')
    .select('id, starts_at, customer_phone, price_cents_at_booking, service:services(name), barber:barbers(name)')
    .eq('status', 'booked')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true });

  const rows = (data as Row[] | null) ?? [];
  const matches = rows.filter((a) => normalizePhone(a.customer_phone) === target);

  const fmt = new Intl.DateTimeFormat('el-GR', {
    timeZone: SHOP_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  return matches.map((a) => ({
    id: a.id,
    serviceName: a.service?.name ?? '—',
    barberName: a.barber?.name ?? '—',
    whenLabel: fmt.format(new Date(a.starts_at)),
    priceCents: a.price_cents_at_booking,
  }));
}

/**
 * Cancels a customer's own booking. The appointment's UUID is the bearer token — whoever holds
 * the link can cancel it, which is why the link only ever goes to the person who booked (their
 * confirmation screen and their confirmation email). There is no customer login to check against.
 */
export async function cancelOwnBooking(
  appointmentId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by useActionState's signature
  _prev: CancelResult | null,
): Promise<CancelResult> {
  const supabase = createSupabaseAdminClient();

  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, status, starts_at')
    .eq('id', appointmentId)
    .single();

  if (!appointment) return { ok: false, message: 'Το ραντεβού δεν βρέθηκε.' };
  if (appointment.status === 'cancelled') return { ok: false, message: 'Το ραντεβού έχει ήδη ακυρωθεί.' };
  if (new Date(appointment.starts_at) < new Date()) {
    return { ok: false, message: 'Το ραντεβού έχει ήδη περάσει. Για οτιδήποτε άλλο, κάλεσέ μας.' };
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId);

  if (error) return { ok: false, message: 'Κάτι πήγε στραβά. Δοκίμασε ξανά ή κάλεσέ μας.' };

  // The freed slot should reappear on the booking page, and the shop's views should update.
  revalidatePath('/admin');
  revalidatePath('/admin/appointments');
  revalidatePath('/admin/revenue');
  return { ok: true };
}
