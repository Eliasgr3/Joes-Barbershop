'use client';

import { useActionState } from 'react';
import { createManualAppointment, type ActionResult } from '@/lib/admin-actions';
import type { Barber, Service } from '@/lib/types';
import { AlertIcon, CheckIcon } from '@/components/ui/Icon';
import { buttonPrimary, input, label } from '@/components/admin/styles';

const initialState: ActionResult | null = null;

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.00', '')}€`;
}

export function ManualAppointmentForm({ barbers, services }: { barbers: Barber[]; services: Service[] }) {
  const [state, formAction, pending] = useActionState(createManualAppointment, initialState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="block">
        <span className={label}>Κουρέας</span>
        <select name="barberId" required className={input}>
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={label}>Υπηρεσία</span>
        <select name="serviceId" required className={input}>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {formatPrice(s.price_cents)} · {s.duration_min}′
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={label}>Ημερομηνία</span>
        <input type="date" name="date" required className={`tnum ${input}`} />
      </label>

      <label className="block">
        <span className={label}>Ώρα</span>
        <input type="time" name="time" required step={900} className={`tnum ${input}`} />
      </label>

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

      {state && !state.ok && (
        <p className="flex items-start gap-2 text-sm text-pole sm:col-span-2 lg:col-span-4">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}

      {state && state.ok && (
        <p className="flex items-center gap-2 text-sm text-done sm:col-span-2 lg:col-span-4">
          <CheckIcon className="h-4 w-4 shrink-0" />
          Το ραντεβού καταχωρήθηκε.
        </p>
      )}

      <div className="sm:col-span-2 lg:col-span-4">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? 'Καταχώρηση…' : 'Καταχώρηση ραντεβού'}
        </button>
      </div>
    </form>
  );
}
