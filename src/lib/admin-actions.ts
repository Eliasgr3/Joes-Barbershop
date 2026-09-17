'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  barberFormSchema,
  manualAppointmentSchema,
  serviceFormSchema,
} from '@/lib/validation';

export type ActionResult = { ok: true } | { ok: false; message: string };

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: 'Λάθος email ή κωδικός.' };
  redirect('/admin');
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// ---- Services ----

export async function createService(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = serviceFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') ?? '',
    priceEuros: Number(formData.get('priceEuros')),
    durationMin: Number(formData.get('durationMin')),
    isActive: formData.get('isActive') === 'on',
  });
  if (!parsed.success) return { ok: false, message: 'Μη έγκυρα στοιχεία υπηρεσίας.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('services').insert({
    name: parsed.data.name,
    description: parsed.data.description || null,
    price_cents: Math.round(parsed.data.priceEuros * 100),
    duration_min: parsed.data.durationMin,
    is_active: parsed.data.isActive,
  });
  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin/services');
  return { ok: true };
}

export async function updateService(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = serviceFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') ?? '',
    priceEuros: Number(formData.get('priceEuros')),
    durationMin: Number(formData.get('durationMin')),
    isActive: formData.get('isActive') === 'on',
  });
  if (!parsed.success) return { ok: false, message: 'Μη έγκυρα στοιχεία υπηρεσίας.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('services')
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      price_cents: Math.round(parsed.data.priceEuros * 100),
      duration_min: parsed.data.durationMin,
      is_active: parsed.data.isActive,
    })
    .eq('id', id);
  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin/services');
  return { ok: true };
}

// ---- Barbers ----

export async function createBarber(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = barberFormSchema.safeParse({
    name: formData.get('name'),
    isActive: formData.get('isActive') === 'on',
  });
  if (!parsed.success) return { ok: false, message: 'Μη έγκυρο όνομα κουρέα.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('barbers').insert({ name: parsed.data.name, is_active: parsed.data.isActive });
  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin/barbers');
  return { ok: true };
}

export async function updateBarber(id: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = barberFormSchema.safeParse({
    name: formData.get('name'),
    isActive: formData.get('isActive') === 'on',
  });
  if (!parsed.success) return { ok: false, message: 'Μη έγκυρο όνομα κουρέα.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('barbers')
    .update({ name: parsed.data.name, is_active: parsed.data.isActive })
    .eq('id', id);
  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin/barbers');
  revalidatePath(`/admin/barbers/${id}`);
  return { ok: true };
}

export async function setWorkingHours(barberId: string, formData: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();

  // Replace-all: delete existing rows for this barber, insert the submitted set.
  await supabase.from('barber_working_hours').delete().eq('barber_id', barberId);

  const rows: { barber_id: string; weekday: number; start_time: string; end_time: string }[] = [];
  for (let weekday = 0; weekday <= 6; weekday++) {
    const enabled = formData.get(`day-${weekday}-enabled`) === 'on';
    if (!enabled) continue;
    const start = String(formData.get(`day-${weekday}-start`) ?? '');
    const end = String(formData.get(`day-${weekday}-end`) ?? '');
    if (!start || !end || start >= end) continue;
    rows.push({ barber_id: barberId, weekday, start_time: `${start}:00`, end_time: `${end}:00` });
  }

  if (rows.length > 0) {
    await supabase.from('barber_working_hours').insert(rows);
  }
  revalidatePath(`/admin/barbers/${barberId}`);
}

export async function addDayOff(barberId: string, formData: FormData): Promise<void> {
  const offDate = String(formData.get('offDate') ?? '');
  const reason = String(formData.get('reason') ?? '');
  if (!offDate) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from('barber_days_off').insert({ barber_id: barberId, off_date: offDate, reason: reason || null });
  revalidatePath(`/admin/barbers/${barberId}`);
}

export async function removeDayOff(barberId: string, dayOffId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.from('barber_days_off').delete().eq('id', dayOffId);
  revalidatePath(`/admin/barbers/${barberId}`);
}

// ---- Appointments ----

export async function createManualAppointment(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const date = String(formData.get('date') ?? '');
  const time = String(formData.get('time') ?? '');
  const parsed = manualAppointmentSchema.safeParse({
    barberId: formData.get('barberId'),
    serviceId: formData.get('serviceId'),
    startsAt: date && time ? new Date(`${date}T${time}:00`).toISOString() : '',
    customerName: formData.get('customerName'),
    customerPhone: formData.get('customerPhone'),
    customerEmail: formData.get('customerEmail') ?? '',
    notes: formData.get('notes') ?? '',
  });
  if (!parsed.success) return { ok: false, message: 'Μη έγκυρα στοιχεία ραντεβού.' };

  const supabase = await createSupabaseServerClient();
  const { data: service } = await supabase
    .from('services')
    .select('price_cents, duration_min')
    .eq('id', parsed.data.serviceId)
    .single();
  if (!service) return { ok: false, message: 'Η υπηρεσία δεν βρέθηκε.' };

  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(startsAt.getTime() + service.duration_min * 60_000);

  const { error } = await supabase.from('appointments').insert({
    barber_id: parsed.data.barberId,
    service_id: parsed.data.serviceId,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    status: 'booked',
    customer_name: parsed.data.customerName,
    customer_phone: parsed.data.customerPhone,
    customer_email: parsed.data.customerEmail || null,
    notes: parsed.data.notes || null,
    source: 'admin',
    price_cents_at_booking: service.price_cents,
  });

  if (error) {
    if (error.code === '23P01') return { ok: false, message: 'Αυτή η ώρα είναι ήδη κλεισμένη για αυτόν τον κουρέα.' };
    return { ok: false, message: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/appointments');
  revalidatePath('/admin/revenue');
  return { ok: true };
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: 'booked' | 'completed' | 'cancelled' | 'no_show',
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.from('appointments').update({ status }).eq('id', appointmentId);
  revalidatePath('/admin');
  revalidatePath('/admin/appointments');
  revalidatePath('/admin/revenue');
}
