'use client';

import { useTransition } from 'react';
import { updateAppointmentStatus } from '@/lib/admin-actions';
import type { AppointmentStatus } from '@/lib/types';

const ACTIONS: { status: AppointmentStatus; label: string; tone: string }[] = [
  { status: 'completed', label: 'Ήρθε', tone: 'hover:border-done hover:text-done' },
  { status: 'no_show', label: 'Δεν ήρθε', tone: 'hover:border-pole hover:text-pole' },
  { status: 'cancelled', label: 'Ακύρωση', tone: 'hover:border-pole hover:text-pole' },
];

/** Undo for a mis-tapped "Ήρθε"/"Δεν ήρθε" — without it a wrong tap is permanent. */
export function RevertStatusAction({ appointmentId }: { appointmentId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => updateAppointmentStatus(appointmentId, 'booked'))}
      className="mt-2.5 border border-line px-2.5 py-1 text-xs text-mute transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed"
    >
      {pending ? 'Αναίρεση…' : 'Αναίρεση'}
    </button>
  );
}

export function StatusActions({ appointmentId }: { appointmentId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={`mt-2.5 flex flex-wrap gap-1.5 ${pending ? 'opacity-50' : ''}`}>
      {ACTIONS.map((action) => (
        <button
          key={action.status}
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => updateAppointmentStatus(appointmentId, action.status))}
          className={`border border-line px-2.5 py-1 text-xs text-mute transition-colors disabled:cursor-not-allowed ${action.tone}`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
