import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { FALLBACK_WORKING_HOURS } from '@/lib/fallback-hours';

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

/**
 * Which weekdays a barber works, and which specific dates they're off — so the date
 * picker can disable closed days up front instead of letting someone pick a day and
 * find nothing there.
 */
export async function GET(request: NextRequest) {
  const barberId = request.nextUrl.searchParams.get('barberId');
  if (!barberId) return NextResponse.json({ error: 'missing_barber' }, { status: 400 });

  if (!supabaseConfigured) {
    return NextResponse.json({
      weekdays: FALLBACK_WORKING_HOURS.map((h) => h.weekday),
      daysOff: [],
    });
  }

  const supabase = createSupabaseAdminClient();
  const [{ data: hours }, { data: daysOff }] = await Promise.all([
    supabase.from('barber_working_hours').select('weekday').eq('barber_id', barberId),
    supabase.from('barber_days_off').select('*').eq('barber_id', barberId),
  ]);

  return NextResponse.json({
    weekdays: (hours ?? []).map((h) => h.weekday),
    // Only whole-day closures grey out a date here. A partial block still leaves the day
    // bookable, so it's handled by the slot list rather than by disabling the date.
    daysOff: (daysOff ?? []).filter((d) => d.start_time == null).map((d) => d.off_date),
  });
}
