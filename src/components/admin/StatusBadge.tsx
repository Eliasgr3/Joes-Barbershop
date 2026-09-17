import type { AppointmentStatus } from '@/lib/types';

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  booked: 'Κλεισμένο',
  completed: 'Ολοκληρώθηκε',
  cancelled: 'Ακυρώθηκε',
  no_show: 'Δεν ήρθε',
};

const STATUS_DOT: Record<AppointmentStatus, string> = {
  booked: 'bg-brass',
  completed: 'bg-done',
  cancelled: 'bg-mute',
  no_show: 'bg-pole',
};

const STATUS_TEXT: Record<AppointmentStatus, string> = {
  booked: 'text-brass-ink',
  completed: 'text-done',
  cancelled: 'text-mute',
  no_show: 'text-pole',
};

/** Status is never colour alone — every badge carries its dot and its written label. */
export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs whitespace-nowrap ${STATUS_TEXT[status]}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[status]}`} aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}
