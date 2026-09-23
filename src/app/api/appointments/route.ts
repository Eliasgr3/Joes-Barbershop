import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { computeAvailableSlots, type TimeOff, type WorkingHours } from '@/lib/availability';
import { bookingRequestSchema } from '@/lib/validation';
import { sendBookingConfirmationEmail } from '@/lib/email';

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const POSTGRES_EXCLUSION_VIOLATION = '23P01';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request', details: parsed.error.flatten() }, { status: 400 });
  }

  if (!supabaseConfigured) {
    return NextResponse.json(
      {
        error: 'booking_not_configured',
        message:
          'Το online σύστημα κρατήσεων δεν έχει ενεργοποιηθεί ακόμα. Καλέστε μας στο 210 652 5504 για ραντεβού.',
      },
      { status: 503 },
    );
  }

  const { barberId, serviceId, startsAt, customerName, customerPhone, customerEmail } = parsed.data;
  const supabase = createSupabaseAdminClient();

  const [{ data: service }, { data: barber }] = await Promise.all([
    supabase.from('services').select('id, name, price_cents, duration_min, is_active').eq('id', serviceId).single(),
    supabase.from('barbers').select('id, name, is_active').eq('id', barberId).single(),
  ]);

  if (!service || !service.is_active) {
    return NextResponse.json({ error: 'service_unavailable' }, { status: 404 });
  }
  if (!barber || !barber.is_active) {
    return NextResponse.json({ error: 'barber_unavailable' }, { status: 404 });
  }

  const startDate = new Date(startsAt);
  const date = startDate.toISOString().slice(0, 10);

  const [{ data: hoursRows }, { data: daysOffRows }, { data: appointmentRows }] = await Promise.all([
    supabase.from('barber_working_hours').select('weekday, start_time, end_time').eq('barber_id', barberId),
    supabase.from('barber_days_off').select('*').eq('barber_id', barberId).eq('off_date', date),
    supabase
      .from('appointments')
      .select('starts_at, ends_at')
      .eq('barber_id', barberId)
      .eq('status', 'booked')
      .gte('starts_at', `${date}T00:00:00Z`)
      .lte('starts_at', `${date}T23:59:59Z`),
  ]);

  const workingHours: WorkingHours[] = (hoursRows ?? []).map((h) => ({
    weekday: h.weekday,
    startTime: h.start_time,
    endTime: h.end_time,
  }));
  const timeOff: TimeOff[] = (daysOffRows ?? []).map((d) => ({
    date: d.off_date,
    startTime: d.start_time ?? null,
    endTime: d.end_time ?? null,
  }));
  const existingAppointments = (appointmentRows ?? []).map((a) => ({
    startsAt: a.starts_at,
    endsAt: a.ends_at,
  }));

  const availableSlots = computeAvailableSlots({
    workingHours,
    timeOff,
    date,
    durationMin: service.duration_min,
    existingAppointments,
    now: new Date(),
  });

  if (!availableSlots.includes(startDate.toISOString())) {
    return NextResponse.json(
      { error: 'slot_unavailable', message: 'Αυτή η ώρα δεν είναι πλέον διαθέσιμη. Διάλεξε άλλη ώρα.' },
      { status: 409 },
    );
  }

  const endsAt = new Date(startDate.getTime() + service.duration_min * 60_000);

  const { data: appointment, error: insertError } = await supabase
    .from('appointments')
    .insert({
      barber_id: barberId,
      service_id: serviceId,
      starts_at: startDate.toISOString(),
      ends_at: endsAt.toISOString(),
      status: 'booked',
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      source: 'public',
      price_cents_at_booking: service.price_cents,
    })
    .select('id')
    .single();

  if (insertError) {
    if (insertError.code === POSTGRES_EXCLUSION_VIOLATION) {
      return NextResponse.json(
        { error: 'slot_unavailable', message: 'Αυτή η ώρα μόλις κλείστηκε από κάποιον άλλον. Διάλεξε άλλη ώρα.' },
        { status: 409 },
      );
    }
    console.error('[appointments] insert error:', insertError);
    return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
  }

  let confirmationEmailSent = false;
  if (customerEmail) {
    confirmationEmailSent = await sendBookingConfirmationEmail({
      to: customerEmail,
      customerName,
      serviceName: service.name,
      barberName: barber.name,
      startsAtIso: startDate.toISOString(),
      priceCents: service.price_cents,
      appointmentId: appointment.id,
    });
    if (confirmationEmailSent) {
      await supabase.from('appointments').update({ confirmation_email_sent: true }).eq('id', appointment.id);
    }
  }

  return NextResponse.json({
    id: appointment.id,
    barberName: barber.name,
    serviceName: service.name,
    startsAt: startDate.toISOString(),
    durationMin: service.duration_min,
    priceCents: service.price_cents,
    confirmationEmailSent,
  });
}
