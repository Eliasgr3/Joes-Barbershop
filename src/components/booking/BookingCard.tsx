'use client';

import { useState, useTransition } from 'react';
import { cancelOwnBooking, type FoundBooking } from '@/lib/booking-actions';
import { CalendarIcon, CheckIcon, RazorIcon } from '@/components/ui/Icon';

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.00', '')}€`;
}

export function BookingCard({ booking }: { booking: FoundBooking }) {
  const [pending, startTransition] = useTransition();
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelOwnBooking(booking.id, null);
      if (result.ok) {
        setCancelled(true);
      } else {
        setError(result.message);
      }
    });
  }

  if (cancelled) {
    return (
      <div className="flex items-center gap-3 border border-line bg-stone p-5">
        <CheckIcon className="h-4 w-4 shrink-0 text-done" />
        <p className="text-sm font-medium">Ακυρώθηκε — η ώρα ελευθερώθηκε.</p>
      </div>
    );
  }

  return (
    <div className="border border-line bg-white p-5">
      <div className="flex items-start gap-3">
        <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-mute" />
        <div className="min-w-0 flex-1">
          <p className="font-medium capitalize">{booking.whenLabel}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-mute">
            <RazorIcon className="h-3.5 w-3.5 shrink-0" />
            {booking.serviceName} · {booking.barberName}
          </p>
        </div>
        <span className="tnum shrink-0 font-display text-xl leading-none font-black">
          {formatPrice(booking.priceCents)}
        </span>
      </div>

      {error && <p className="mt-3 text-sm text-pole">{error}</p>}

      <button
        type="button"
        onClick={handleCancel}
        disabled={pending}
        className="mt-4 w-full border border-pole px-4 py-2.5 text-sm font-semibold text-pole transition-colors hover:bg-pole hover:text-white disabled:opacity-50"
      >
        {pending ? 'Ακύρωση…' : 'Ακύρωση ραντεβού'}
      </button>
    </div>
  );
}
