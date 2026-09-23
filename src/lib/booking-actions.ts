'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type CancelResult = { ok: true } | { ok: false; message: string };

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
