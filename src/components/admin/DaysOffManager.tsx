import { addDayOff, removeDayOff } from '@/lib/admin-actions';
import type { BarberDayOff } from '@/lib/types';
import { CalendarIcon, CloseIcon } from '@/components/ui/Icon';
import { buttonPrimary, input, label } from '@/components/admin/styles';
import { SHOP_TIMEZONE } from '@/lib/constants';
import { EmptyState } from '@/components/admin/Shell';

function pretty(iso: string): string {
  return new Intl.DateTimeFormat('el-GR', {
    timeZone: SHOP_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${iso}T12:00:00Z`));
}

export function DaysOffManager({ barberId, daysOff }: { barberId: string; daysOff: BarberDayOff[] }) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: SHOP_TIMEZONE }).format(new Date());
  const upcoming = daysOff.filter((d) => d.off_date >= today);

  return (
    <div>
      <form action={addDayOff.bind(null, barberId)} className="flex flex-wrap items-end gap-3 border-b border-line p-5">
        <label className="block">
          <span className={label}>Ημερομηνία</span>
          <input type="date" name="offDate" required min={today} className={`tnum ${input}`} />
        </label>
        <label className="block min-w-[200px] flex-1">
          <span className={label}>Λόγος</span>
          <input type="text" name="reason" placeholder="προαιρετικό — π.χ. άδεια" className={input} />
        </label>
        <button type="submit" className={buttonPrimary}>
          Προσθήκη ρεπό
        </button>
      </form>

      {upcoming.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="h-6 w-6" />}
          title="Κανένα ρεπό"
          description="Οι μέρες που προσθέτεις εδώ κλείνουν αυτόματα από την online κράτηση."
        />
      ) : (
        <ul className="divide-y divide-line">
          {upcoming.map((day) => (
            <li key={day.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <span className="min-w-0">
                <span className="tnum block text-sm font-medium">{pretty(day.off_date)}</span>
                {day.reason && <span className="block truncate text-xs text-mute">{day.reason}</span>}
              </span>
              <form action={removeDayOff.bind(null, barberId, day.id)}>
                <button
                  type="submit"
                  aria-label={`Αφαίρεση ρεπό ${day.off_date}`}
                  className="flex h-8 w-8 items-center justify-center border border-line text-mute transition-colors hover:border-pole hover:text-pole"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
