import type { WorkingHours } from '@/lib/availability';

/** Matches supabase/migrations/0003_seed_data.sql — only used when Supabase isn't configured. */
export const FALLBACK_WORKING_HOURS: WorkingHours[] = [
  { weekday: 1, startTime: '09:00:00', endTime: '17:00:00' }, // Monday
  { weekday: 2, startTime: '11:00:00', endTime: '20:00:00' }, // Tuesday
  { weekday: 3, startTime: '11:00:00', endTime: '20:00:00' }, // Wednesday
  { weekday: 4, startTime: '11:00:00', endTime: '20:00:00' }, // Thursday
  { weekday: 5, startTime: '11:00:00', endTime: '20:00:00' }, // Friday
  { weekday: 6, startTime: '09:00:00', endTime: '17:00:00' }, // Saturday
];
