import { SLOT_GRANULARITY_MIN } from '@/lib/constants';

export type WorkingHours = { weekday: number; startTime: string; endTime: string };
export type ExistingAppointment = { startsAt: string; endsAt: string };

type ComputeSlotsArgs = {
  workingHours: WorkingHours[]; // this barber's rows for every weekday they work
  daysOff: Set<string>; // 'YYYY-MM-DD' dates this barber is off
  date: string; // 'YYYY-MM-DD', the day being queried
  durationMin: number; // the selected service's duration
  existingAppointments: ExistingAppointment[]; // this barber's OTHER booked appointments that day
  now: Date; // current instant, to exclude past slots on "today"
};

/** 'YYYY-MM-DD' + 'HH:MM:SS' in a fixed local offset, treated as shop-local wall-clock time. */
export function localDateTimeToUTC(date: string, time: string, offsetMinutes: number): Date {
  const [h, m, s] = time.split(':').map(Number);
  const [y, mo, d] = date.split('-').map(Number);
  // Build as if UTC, then subtract the local offset to get the true UTC instant.
  const asUtc = new Date(Date.UTC(y, mo - 1, d, h, m, s ?? 0));
  return new Date(asUtc.getTime() - offsetMinutes * 60_000);
}

/**
 * Europe/Athens offset (in minutes ahead of UTC) for a given date, accounting for DST
 * (EET/UTC+2 in winter, EEST/UTC+3 in summer). Computed via Intl rather than hardcoded.
 */
export function athensOffsetMinutes(date: string): number {
  const probe = new Date(`${date}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Athens',
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(probe);
  const localHour = Number(parts.find((p) => p.type === 'hour')?.value ?? '12');
  return (localHour - 12) * 60;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Computes bookable start times for one barber, one service, one day.
 * Pure function — no I/O — so it's unit-testable and reusable from both
 * the /api/availability route and the /api/appointments re-validation on submit.
 */
export function computeAvailableSlots({
  workingHours,
  daysOff,
  date,
  durationMin,
  existingAppointments,
  now,
}: ComputeSlotsArgs): string[] {
  if (daysOff.has(date)) return [];

  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  const hours = workingHours.find((h) => h.weekday === weekday);
  if (!hours) return [];

  const offsetMinutes = athensOffsetMinutes(date);
  const dayStart = localDateTimeToUTC(date, hours.startTime, offsetMinutes);
  const dayEnd = localDateTimeToUTC(date, hours.endTime, offsetMinutes);

  const busy = existingAppointments.map((a) => ({
    start: new Date(a.startsAt),
    end: new Date(a.endsAt),
  }));

  const slots: string[] = [];
  const stepMs = SLOT_GRANULARITY_MIN * 60_000;
  const durationMs = durationMin * 60_000;

  for (let start = dayStart.getTime(); start + durationMs <= dayEnd.getTime(); start += stepMs) {
    const slotStart = new Date(start);
    const slotEnd = new Date(start + durationMs);

    if (slotStart < now) continue;
    if (busy.some((b) => overlaps(slotStart, slotEnd, b.start, b.end))) continue;

    slots.push(slotStart.toISOString());
  }

  return slots;
}
