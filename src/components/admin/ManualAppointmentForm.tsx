'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { createManualAppointment, type ActionResult } from '@/lib/admin-actions';
import type { Barber, Service } from '@/lib/types';
import { AlertIcon, CheckIcon, ClockIcon } from '@/components/ui/Icon';
import { buttonPrimary, input, label } from '@/components/admin/styles';
import { SHOP_TIMEZONE } from '@/lib/constants';

const initialState: ActionResult | null = null;

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.00', '')}€`;
}

function todayLocal(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SHOP_TIMEZONE }).format(new Date());
}

function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat('el-GR', {
    timeZone: SHOP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
}

/** ISO instant -> the 'HH:MM' the <input type="time"> field needs, in shop-local time. */
function isoToTimeInputValue(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: SHOP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
}

export function ManualAppointmentForm({ barbers, services }: { barbers: Barber[]; services: Service[] }) {
  const [state, formAction, pending] = useActionState(createManualAppointment, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [barberId, setBarberId] = useState(barbers[0]?.id ?? '');
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [date, setDate] = useState(todayLocal());
  const [time, setTime] = useState('');

  const requestKey = barberId && serviceId && date ? `${barberId}|${serviceId}|${date}` : '';
  const [slotsResult, setSlotsResult] = useState<{ forKey: string; slots: string[] }>({
    forKey: '',
    slots: [],
  });

  useEffect(() => {
    if (!requestKey) return;
    let cancelled = false;
    const params = new URLSearchParams({ barberId, serviceId, date });
    fetch(`/api/availability?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSlotsResult({ forKey: requestKey, slots: Array.isArray(data.slots) ? data.slots : [] });
      })
      .catch(() => {
        if (!cancelled) setSlotsResult({ forKey: requestKey, slots: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [requestKey, barberId, serviceId, date]);

  const loadingSlots = requestKey !== '' && slotsResult.forKey !== requestKey;
  const slots = slotsResult.forKey === requestKey ? slotsResult.slots : null;

  // Reset the form back to a fresh walk-in after a successful submit. Deferred to a microtask
  // (rather than called synchronously in the effect body) to stay clear of the cascading-render
  // set-state-in-effect lint rule — same pattern used in DateTimeStep.tsx.
  useEffect(() => {
    if (!state?.ok) return;
    Promise.resolve().then(() => {
      formRef.current?.reset();
      setTime('');
      setDate(todayLocal());
    });
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Failures sit at the TOP of the form: when this was a small line underneath, a rejected
          booking could be mistaken for a saved one and the appointment was silently lost. */}
      {state && !state.ok && (
        <p
          role="alert"
          className="flex items-start gap-3 border-2 border-pole bg-pole/10 p-4 text-base font-semibold text-pole sm:col-span-2 lg:col-span-4"
        >
          <AlertIcon className="mt-0.5 h-6 w-6 shrink-0" />
          <span>
            ΔΕΝ ΑΠΟΘΗΚΕΥΤΗΚΕ — {state.message}
            <span className="mt-1 block text-sm font-normal">
              Το ραντεβού δεν καταχωρήθηκε. Διάλεξε άλλη ώρα και δοκίμασε ξανά.
            </span>
          </span>
        </p>
      )}

      {state && state.ok && (
        <p
          role="status"
          className="flex items-center gap-3 border-2 border-done bg-done/10 p-4 text-base font-semibold text-done sm:col-span-2 lg:col-span-4"
        >
          <CheckIcon className="h-6 w-6 shrink-0" />
          Το ραντεβού καταχωρήθηκε.
        </p>
      )}

      <label className="block">
        <span className={label}>Κουρέας</span>
        <select
          name="barberId"
          required
          value={barberId}
          onChange={(e) => {
            setBarberId(e.target.value);
            setTime('');
          }}
          className={input}
        >
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={label}>Υπηρεσία</span>
        <select
          name="serviceId"
          required
          value={serviceId}
          onChange={(e) => {
            setServiceId(e.target.value);
            setTime('');
          }}
          className={input}
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {formatPrice(s.price_cents)} · {s.duration_min}′
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={label}>Ημερομηνία</span>
        <input
          type="date"
          name="date"
          required
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setTime('');
          }}
          className={`tnum ${input}`}
        />
      </label>

      <label className="block">
        <span className={label}>Ώρα</span>
        <input
          type="time"
          name="time"
          required
          step={900}
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={`tnum ${input}`}
        />
      </label>

      {/* Quick-pick from real availability — same engine the public booking page uses, so a
          click here can never collide with an existing appointment. Typing the time field
          above directly still works too, for a walk-in outside normal hours. */}
      <div className="sm:col-span-2 lg:col-span-4">
        <span className={label}>Ελεύθερες ώρες</span>
        {loadingSlots && <p className="text-sm text-mute">Φόρτωση…</p>}
        {!loadingSlots && slots && slots.length === 0 && (
          <p className="flex items-center gap-2 text-sm text-mute">
            <ClockIcon className="h-4 w-4 shrink-0" />
            Καμία ελεύθερη ώρα αυτή την ημέρα — μπορείς να ορίσεις ώρα χειροκίνητα παραπάνω.
          </p>
        )}
        {!loadingSlots && slots && slots.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {slots.map((iso) => {
              const value = isoToTimeInputValue(iso);
              const active = value === time;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setTime(value)}
                  className={`tnum border px-3 py-1.5 text-sm transition-colors ${
                    active ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink'
                  }`}
                >
                  {timeLabel(iso)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <label className="block">
        <span className={label}>Όνομα πελάτη</span>
        <input type="text" name="customerName" required autoComplete="off" className={input} />
      </label>

      <label className="block">
        <span className={label}>Τηλέφωνο</span>
        <input type="tel" name="customerPhone" required autoComplete="off" className={`tnum ${input}`} />
      </label>

      <label className="block sm:col-span-2">
        <span className={label}>Σημείωση</span>
        <input type="text" name="notes" placeholder="προαιρετικό" className={input} />
      </label>

      <div className="sm:col-span-2 lg:col-span-4">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? 'Καταχώρηση…' : 'Καταχώρηση ραντεβού'}
        </button>
      </div>
    </form>
  );
}
