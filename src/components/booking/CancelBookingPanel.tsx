'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { cancelOwnBooking, type CancelResult } from '@/lib/booking-actions';
import { AlertIcon, CheckIcon } from '@/components/ui/Icon';
import { SHOP_INFO } from '@/lib/constants';

const initialState: CancelResult | null = null;

export function CancelBookingPanel({ appointmentId }: { appointmentId: string }) {
  const action = cancelOwnBooking.bind(null, appointmentId);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state?.ok) {
    return (
      <div className="rise border border-white/15 p-7 text-center">
        <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center border border-brass text-brass">
          <CheckIcon className="h-5 w-5" strokeWidth={2} />
        </span>
        <p className="font-display text-2xl leading-none font-black uppercase">Ακυρώθηκε</p>
        <p className="mx-auto mt-3 max-w-[34ch] text-sm text-white/55">
          Το ραντεβού σου ακυρώθηκε και η ώρα ελευθερώθηκε. Μπορείς να κλείσεις νέο ραντεβού όποτε θες.
        </p>
        <Link
          href="/book"
          className="mt-6 inline-block bg-white px-6 py-3.5 text-sm font-semibold text-ink no-underline"
        >
          Κλείσε νέο ραντεβού
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="text-center">
      {state && !state.ok && (
        <p className="mb-5 flex items-start justify-center gap-2 border border-pole/40 bg-pole/10 p-4 text-left text-sm text-white">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-pole" />
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full border border-pole bg-transparent px-6 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-pole disabled:opacity-50"
      >
        {pending ? 'Ακύρωση…' : 'Ακύρωση ραντεβού'}
      </button>

      <p className="mt-4 text-xs text-white/45">
        Έκανες λάθος; Μπορείς απλά να κλείσεις νέο ραντεβού, ή να μας καλέσεις στο{' '}
        <a href={`tel:${SHOP_INFO.phone}`} className="text-white underline">
          {SHOP_INFO.phoneDisplay}
        </a>
        .
      </p>
    </form>
  );
}
