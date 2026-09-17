'use client';

import { useEffect, useState } from 'react';
import type { Barber, Service } from '@/lib/types';
import { StepShell } from '@/components/booking/StepShell';
import { DayStrip } from '@/components/booking/DayStrip';
import { SHOP_TIMEZONE } from '@/lib/constants';
import { AlertIcon, ClockIcon } from '@/components/ui/Icon';

type Props = {
  barber: Barber;
  service: Service;
  date: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (iso: string) => void;
  onBack?: () => void;
};

type FetchState = { forKey: string; slots: string[] | null; error: string | null };

function todayLocal(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SHOP_TIMEZONE }).format(new Date());
}

function athensHour(iso: string): number {
  return Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: SHOP_TIMEZONE, hour: 'numeric', hourCycle: 'h23' }).format(
      new Date(iso),
    ),
  );
}

function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat('el-GR', {
    timeZone: SHOP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
}

const BANDS = [
  { key: 'morning', label: 'Πρωί', test: (h: number) => h < 12 },
  { key: 'afternoon', label: 'Μεσημέρι', test: (h: number) => h >= 12 && h < 17 },
  { key: 'evening', label: 'Απόγευμα', test: (h: number) => h >= 17 },
];

export function DateTimeStep({ barber, service, date, onSelectDate, onSelectTime, onBack }: Props) {
  const effectiveDate = date || todayLocal();
  const requestKey = `${barber.id}|${service.id}|${effectiveDate}`;

  const [result, setResult] = useState<FetchState>({ forKey: '', slots: null, error: null });
  const [schedule, setSchedule] = useState<{ weekdays: number[]; daysOff: string[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/schedule?barberId=${encodeURIComponent(barber.id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.weekdays)) {
          setSchedule({ weekdays: data.weekdays, daysOff: data.daysOff ?? [] });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [barber.id]);

  useEffect(() => {
    if (!effectiveDate) return;
    let cancelled = false;
    const params = new URLSearchParams({ barberId: barber.id, serviceId: service.id, date: effectiveDate });
    fetch(`/api/availability?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setResult({ forKey: requestKey, slots: [], error: 'Κάτι πήγε στραβά. Δοκίμασε ξανά.' });
        } else {
          setResult({ forKey: requestKey, slots: data.slots ?? [], error: null });
        }
      })
      .catch(() => {
        if (!cancelled) setResult({ forKey: requestKey, slots: [], error: 'Κάτι πήγε στραβά. Δοκίμασε ξανά.' });
      });
    return () => {
      cancelled = true;
    };
  }, [barber.id, service.id, effectiveDate, requestKey]);

  const loading = result.forKey !== requestKey;
  const slots = loading ? null : result.slots;
  const error = loading ? null : result.error;

  const bands = BANDS.map((band) => ({
    ...band,
    slots: (slots ?? []).filter((iso) => band.test(athensHour(iso))),
  })).filter((band) => band.slots.length > 0);

  return (
    <StepShell
      title="Διάλεξε ώρα"
      hint={`${service.name} · ${service.duration_min} λεπτά με ${barber.name}`}
      onBack={onBack}
    >
      <DayStrip
        value={effectiveDate}
        onChange={onSelectDate}
        openWeekdays={schedule?.weekdays ?? null}
        daysOff={schedule?.daysOff ?? []}
      />

      <div className="mt-8">
        {loading && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Φόρτωση διαθέσιμων ωρών">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse border border-line bg-stone" />
            ))}
          </div>
        )}

        {error && (
          <p className="flex items-center gap-2 border border-pole/30 bg-pole/5 p-4 text-sm text-pole">
            <AlertIcon className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {!loading && !error && slots && slots.length === 0 && (
          <div className="border border-line p-8 text-center">
            <ClockIcon className="mx-auto mb-3 h-6 w-6 text-mute" />
            <p className="font-semibold">Δεν υπάρχουν ελεύθερες ώρες</p>
            <p className="mx-auto mt-1 max-w-[34ch] text-sm text-mute">
              Δοκίμασε άλλη ημέρα από την μπάρα πιο πάνω, ή κάλεσέ μας στο 210 652 5504.
            </p>
          </div>
        )}

        {!loading &&
          bands.map((band) => (
            <div key={band.key} className="mb-7 last:mb-0">
              <p className="mb-3 text-[11px] tracking-[0.14em] text-mute uppercase">{band.label}</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {band.slots.map((iso) => (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => onSelectTime(iso)}
                    className="tnum border border-line py-3.5 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-white"
                  >
                    {timeLabel(iso)}
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>
    </StepShell>
  );
}
