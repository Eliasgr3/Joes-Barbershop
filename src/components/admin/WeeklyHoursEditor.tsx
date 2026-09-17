import { setWorkingHours } from '@/lib/admin-actions';
import type { BarberWorkingHours } from '@/lib/types';
import { buttonPrimary } from '@/components/admin/styles';

const WEEKDAY_LABELS = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
// Shown Monday-first, the way the shop reads its own week.
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function WeeklyHoursEditor({ barberId, hours }: { barberId: string; hours: BarberWorkingHours[] }) {
  const byWeekday = new Map(hours.map((h) => [h.weekday, h]));

  return (
    <form action={setWorkingHours.bind(null, barberId)}>
      <div className="divide-y divide-line">
        {DISPLAY_ORDER.map((weekday) => {
          const existing = byWeekday.get(weekday);
          return (
            <div key={weekday} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
              <label className="flex w-36 shrink-0 items-center gap-2.5">
                <input
                  type="checkbox"
                  name={`day-${weekday}-enabled`}
                  defaultChecked={Boolean(existing)}
                  className="h-4 w-4 accent-ink"
                />
                <span className="text-sm font-medium">{WEEKDAY_LABELS[weekday]}</span>
              </label>
              {/* Native time inputs size themselves to the browser's locale — a 12-hour browser
                  renders "09:00 AM", which is too wide to pair side by side on a small phone,
                  so they stack below sm. */}
              <div className="tnum flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-1 sm:flex-row sm:items-center">
                <input
                  type="time"
                  aria-label={`${WEEKDAY_LABELS[weekday]} — ώρα έναρξης`}
                  name={`day-${weekday}-start`}
                  defaultValue={existing?.start_time.slice(0, 5) ?? '09:00'}
                  step={900}
                  className="w-full min-w-0 border border-line bg-paper px-2.5 py-1.5 text-sm outline-none transition-colors focus:border-ink sm:flex-1"
                />
                <span className="hidden shrink-0 text-mute sm:inline">—</span>
                <input
                  type="time"
                  aria-label={`${WEEKDAY_LABELS[weekday]} — ώρα λήξης`}
                  name={`day-${weekday}-end`}
                  defaultValue={existing?.end_time.slice(0, 5) ?? '18:00'}
                  step={900}
                  className="w-full min-w-0 border border-line bg-paper px-2.5 py-1.5 text-sm outline-none transition-colors focus:border-ink sm:flex-1"
                />
              </div>
              {!existing && <span className="text-xs text-mute">κλειστά</span>}
            </div>
          );
        })}
      </div>
      <div className="border-t border-line px-5 py-4">
        <button type="submit" className={buttonPrimary}>
          Αποθήκευση ωραρίου
        </button>
      </div>
    </form>
  );
}
