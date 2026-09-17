'use client';

import { useRef } from 'react';
import { BOOKING_HORIZON_DAYS, SHOP_TIMEZONE } from '@/lib/constants';
import { ChevronLeft, ChevronRight } from '@/components/ui/Icon';

type Props = {
  value: string;
  onChange: (date: string) => void;
  openWeekdays: number[] | null;
  daysOff: string[];
};

function isoDate(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SHOP_TIMEZONE }).format(d);
}

function buildDays(): { iso: string; weekday: number; dayNum: string; weekdayLabel: string; monthLabel: string }[] {
  const out = [];
  const now = new Date();
  for (let i = 0; i < BOOKING_HORIZON_DAYS; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const iso = isoDate(d);
    const parts = new Intl.DateTimeFormat('el-GR', {
      timeZone: SHOP_TIMEZONE,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).formatToParts(d);
    out.push({
      iso,
      weekday: new Date(`${iso}T12:00:00Z`).getUTCDay(),
      dayNum: parts.find((p) => p.type === 'day')?.value ?? '',
      weekdayLabel: (parts.find((p) => p.type === 'weekday')?.value ?? '').replace('.', ''),
      monthLabel: (parts.find((p) => p.type === 'month')?.value ?? '').replace('.', ''),
    });
  }
  return out;
}

export function DayStrip({ value, onChange, openWeekdays, daysOff }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const days = buildDays();
  const today = days[0]?.iso;

  function nudge(direction: 1 | -1) {
    scroller.current?.scrollBy({ left: direction * 240, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] tracking-[0.14em] text-mute uppercase">Ημέρα</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label="Προηγούμενες ημέρες"
            className="flex h-7 w-7 items-center justify-center border border-line text-mute transition-colors hover:border-ink hover:text-ink"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label="Επόμενες ημέρες"
            className="flex h-7 w-7 items-center justify-center border border-line text-mute transition-colors hover:border-ink hover:text-ink"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div ref={scroller} className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => {
          const closed =
            (openWeekdays !== null && !openWeekdays.includes(day.weekday)) || daysOff.includes(day.iso);
          const selected = day.iso === value;
          return (
            <button
              key={day.iso}
              type="button"
              disabled={closed}
              onClick={() => onChange(day.iso)}
              aria-pressed={selected}
              className={`relative flex w-[74px] shrink-0 flex-col items-center gap-0.5 border py-3 transition-colors ${
                selected
                  ? 'border-ink bg-ink text-white'
                  : closed
                    ? 'cursor-not-allowed border-line/60 text-mute/40'
                    : 'border-line text-ink hover:border-ink'
              }`}
            >
              <span className="text-[11px] tracking-[0.1em] uppercase opacity-70">{day.weekdayLabel}</span>
              <span className="tnum font-display text-2xl leading-none font-black">{day.dayNum}</span>
              <span className="text-[11px] opacity-60">{closed ? 'κλειστά' : day.monthLabel}</span>
              {day.iso === today && !selected && (
                <span className="absolute top-1.5 right-1.5 h-1 w-1 rounded-full bg-brass" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
