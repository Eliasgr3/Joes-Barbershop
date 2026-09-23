'use client';

import { useActionState, useState } from 'react';
import { addDayOff, removeDayOff, type ActionResult } from '@/lib/admin-actions';
import type { BarberDayOff } from '@/lib/types';
import { AlertIcon, CalendarIcon, CloseIcon } from '@/components/ui/Icon';
import { buttonPrimary, input, label } from '@/components/admin/styles';
import { SHOP_TIMEZONE } from '@/lib/constants';
import { EmptyState } from '@/components/admin/Shell';

const initialState: ActionResult | null = null;

function prettyDate(iso: string): string {
  return new Intl.DateTimeFormat('el-GR', {
    timeZone: SHOP_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${iso}T12:00:00Z`));
}

export function DaysOffManager({ barberId, daysOff }: { barberId: string; daysOff: BarberDayOff[] }) {
  const addAction = addDayOff.bind(null, barberId);
  const [state, formAction, pending] = useActionState(addAction, initialState);
  const [scope, setScope] = useState<'full' | 'partial'>('full');

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: SHOP_TIMEZONE }).format(new Date());
  const upcoming = daysOff
    .filter((d) => d.off_date >= today)
    .sort((a, b) => a.off_date.localeCompare(b.off_date) || (a.start_time ?? '').localeCompare(b.start_time ?? ''));

  return (
    <div>
      <form action={formAction} className="border-b border-line p-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className={label}>Ημερομηνία</span>
            <input type="date" name="offDate" required min={today} className={`tnum ${input}`} />
          </label>
          <label className="block min-w-[180px] flex-1">
            <span className={label}>Λόγος</span>
            <input type="text" name="reason" placeholder="προαιρετικό — π.χ. άδεια" className={input} />
          </label>
        </div>

        <fieldset className="mt-4">
          <legend className={label}>Τι κλείνει</legend>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="scope"
                value="full"
                checked={scope === 'full'}
                onChange={() => setScope('full')}
                className="accent-ink"
              />
              Όλη η ημέρα
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="scope"
                value="partial"
                checked={scope === 'partial'}
                onChange={() => setScope('partial')}
                className="accent-ink"
              />
              Συγκεκριμένες ώρες
            </label>
          </div>
        </fieldset>

        {scope === 'partial' && (
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="block">
              <span className={label}>Από</span>
              <input type="time" name="startTime" step={900} required className={`tnum ${input}`} />
            </label>
            <label className="block">
              <span className={label}>Έως</span>
              <input type="time" name="endTime" step={900} required className={`tnum ${input}`} />
            </label>
            <p className="w-full text-xs text-mute">
              Η υπόλοιπη ημέρα παραμένει ανοιχτή για κρατήσεις.
            </p>
          </div>
        )}

        {state && !state.ok && (
          <p className="mt-3 flex items-start gap-2 text-sm text-pole">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {state.message}
          </p>
        )}

        <button type="submit" disabled={pending} className={`${buttonPrimary} mt-4`}>
          {pending ? 'Αποθήκευση…' : 'Κλείσιμο ώρας'}
        </button>
      </form>

      {upcoming.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="h-6 w-6" />}
          title="Καμία κλειστή ώρα"
          description="Ό,τι κλείνεις εδώ εξαφανίζεται αυτόματα από τις διαθέσιμες ώρες στο site."
        />
      ) : (
        <ul className="divide-y divide-line">
          {upcoming.map((day) => {
            const isFullDay = day.start_time === null;
            return (
              <li key={day.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <span className="min-w-0">
                  <span className="tnum block text-sm font-medium">{prettyDate(day.off_date)}</span>
                  <span className="block text-xs text-mute">
                    {isFullDay ? (
                      'Όλη η ημέρα'
                    ) : (
                      <span className="tnum">
                        {day.start_time?.slice(0, 5)} – {day.end_time?.slice(0, 5)}
                      </span>
                    )}
                    {day.reason && ` · ${day.reason}`}
                  </span>
                </span>
                <form action={removeDayOff.bind(null, barberId, day.id)}>
                  <button
                    type="submit"
                    aria-label={`Άνοιγμα ξανά ${day.off_date}`}
                    className="flex h-8 w-8 items-center justify-center border border-line text-mute transition-colors hover:border-pole hover:text-pole"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
