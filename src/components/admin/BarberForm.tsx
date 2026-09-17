'use client';

import { useActionState } from 'react';
import { createBarber, updateBarber, type ActionResult } from '@/lib/admin-actions';
import type { Barber } from '@/lib/types';
import { AlertIcon, CheckIcon } from '@/components/ui/Icon';
import { buttonPrimary, input, label } from '@/components/admin/styles';

const initialState: ActionResult | null = null;

export function BarberForm({ barber }: { barber?: Barber }) {
  const action = barber ? updateBarber.bind(null, barber.id) : createBarber;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-4">
      <label className="block min-w-[240px] flex-1">
        <span className={label}>Όνομα</span>
        <input type="text" name="name" defaultValue={barber?.name} required className={input} />
      </label>

      <label className="flex h-[42px] items-center gap-2.5 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={barber?.is_active ?? true} className="h-4 w-4 accent-ink" />
        <span>Ενεργός</span>
      </label>

      <button type="submit" disabled={pending} className={buttonPrimary}>
        {pending ? 'Αποθήκευση…' : barber ? 'Αποθήκευση' : 'Προσθήκη κουρέα'}
      </button>

      {state && !state.ok && (
        <p className="flex w-full items-start gap-2 text-sm text-pole">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}
      {state && state.ok && (
        <p className="flex w-full items-center gap-2 text-sm text-done">
          <CheckIcon className="h-4 w-4 shrink-0" />
          Αποθηκεύτηκε.
        </p>
      )}
    </form>
  );
}
