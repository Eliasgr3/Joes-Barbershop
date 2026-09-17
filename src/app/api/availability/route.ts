import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { athensOffsetMinutes, computeAvailableSlots, type WorkingHours } from '@/lib/availability';
import { availabilityQuerySchema } from '@/lib/validation';
import { FALLBACK_SERVICES } from '@/lib/fallback-data';
import { FALLBACK_WORKING_HOURS } from '@/lib/fallback-hours';

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function GET(request: NextRequest) {
  const parsed = availabilityQuerySchema.safeParse({
    barberId: request.nextUrl.searchParams.get('barberId'),
    serviceId: request.nextUrl.searchParams.get('serviceId'),
    date: request.nextUrl.searchParams.get('date'),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_query' }, { status: 400 });
  }
  const { barberId, serviceId, date } = parsed.data;

  if (!supabaseConfigured) {
    const service = FALLBACK_SERVICES.find((s) => s.id === serviceId);
    if (!service || barberId !== 'fallback-barber-1') {
      return NextResponse.json({ slots: [] });
    }
    const slots = computeAvailableSlots({
      workingHours: FALLBACK_WORKING_HOURS,
      daysOff: new Set(),
      date,
      durationMin: service.duration_min,
      existingAppointments: [],
      now: new Date(),
    });
    return NextResponse.json({ slots, demo: true });
  }

  const supabase = createSupabaseAdminClient();

  const [{ data: service }, { data: hoursRows }, { data: daysOffRows }, { data: appointmentRows }] =
    await Promise.all([
      supabase.from('services').select('duration_min').eq('id', serviceId).single(),
      supabase.from('barber_working_hours').select('weekday, start_time, end_time').eq('barber_id', barberId),
      supabase.from('barber_days_off').select('off_date').eq('barber_id', barberId),
      supabase
        .from('appointments')
        .select('starts_at, ends_at')
        .eq('barber_id', barberId)
        .eq('status', 'booked')
        .gte('starts_at', `${date}T00:00:00Z`)
        .lte('starts_at', `${date}T23:59:59Z`),
    ]);

  if (!service) {
    return NextResponse.json({ error: 'service_not_found' }, { status: 404 });
  }

  const workingHours: WorkingHours[] = (hoursRows ?? []).map((h) => ({
    weekday: h.weekday,
    startTime: h.start_time,
    endTime: h.end_time,
  }));
  const daysOff = new Set((daysOffRows ?? []).map((d) => d.off_date));
  const existingAppointments = (appointmentRows ?? []).map((a) => ({
    startsAt: a.starts_at,
    endsAt: a.ends_at,
  }));

  const now = new Date();
  const slots = computeAvailableSlots({
    workingHours,
    daysOff,
    date,
    durationMin: service.duration_min,
    existingAppointments,
    now,
  });

  if (request.nextUrl.searchParams.get('debug') === '1') {
    return NextResponse.json({
      slots,
      debug: {
        date,
        nowIso: now.toISOString(),
        workingHours,
        durationMin: service.duration_min,
        weekdayFromDate: new Date(`${date}T12:00:00Z`).getUTCDay(),
        athensOffsetMinutes: athensOffsetMinutes(date),
      },
    });
  }

  return NextResponse.json({ slots });
}
