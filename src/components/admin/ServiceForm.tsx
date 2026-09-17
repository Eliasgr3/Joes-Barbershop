'use client';

import { useActionState } from 'react';
import { createService, updateService, type ActionResult } from '@/lib/admin-actions';
import type { Service } from '@/lib/types';
import { AlertIcon, CheckIcon } from '@/components/ui/Icon';
import { buttonPrimary, input, label } from '@/components/admin/styles';

const initialState: ActionResult | null = null;

export function ServiceForm({ service, onDone }: { service?: Service; onDone?: () => void }) {
  const action = service ? updateService.bind(null, service.id) : createService;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="block lg:col-span-2">
        <span className={label}>Όνομα</span>
        <input type="text" name="name" defaultValue={service?.name} required className={input} />
      </label>

      <label className="block lg:col-span-2">
        <span className={label}>Περιγραφή</span>
        <input type="text" name="description" defaultValue={service?.description ?? ''} className={input} />
      </label>

      <label className="block">
        <span className={label}>Τιμή (€)</span>
        <input
          type="number"
          name="priceEuros"
          step="0.5"
          min="0"
          defaultValue={service ? service.price_cents / 100 : undefined}
          required
          className={`tnum ${input}`}
        />
      </label>

      <label className="block">
        <span className={label}>Διάρκεια (λεπτά)</span>
        <input
          type="number"
          name="durationMin"
          step="5"
          min="5"
          defaultValue={service?.duration_min ?? 30}
          required
          className={`tnum ${input}`}
        />
      </label>

      <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
        <input type="checkbox" name="isActive" defaultChecked={service?.is_active ?? true} className="h-4 w-4 accent-ink" />
        <span>Ενεργή — εμφανίζεται στην online κράτηση</span>
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
          Αποθηκεύτηκε.
        </p>
      )}

      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
        <button type="submit" disabled={pending} className={buttonPrimary}>
          {pending ? 'Αποθήκευση…' : service ? 'Αποθήκευση αλλαγών' : 'Προσθήκη υπηρεσίας'}
        </button>
        {onDone && (
          <button type="button" onClick={onDone} className="text-sm text-mute hover:text-ink">
            Άκυρο
          </button>
        )}
      </div>
    </form>
  );
}
