'use client';

import { StepShell } from '@/components/booking/StepShell';
import { SHOP_TIMEZONE } from '@/lib/constants';
import { AlertIcon, CalendarIcon, PhoneIcon, RazorIcon, UserIcon } from '@/components/ui/Icon';
import type { BookingState } from '@/components/booking/types';

type Props = {
  state: BookingState;
  submitting: boolean;
  errorMessage: string | null;
  onConfirm: () => void;
  onBack?: () => void;
};

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.00', '')}€`;
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 border-b border-line py-4 last:border-b-0">
      <span className="mt-0.5 text-mute">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] tracking-[0.14em] text-mute uppercase">{label}</span>
        <span className="tnum mt-1 block font-medium">{value}</span>
      </span>
    </div>
  );
}

export function BookingSummary({ state, submitting, errorMessage, onConfirm, onBack }: Props) {
  if (!state.barber || !state.service || !state.timeIso) return null;

  const when = new Intl.DateTimeFormat('el-GR', {
    timeZone: SHOP_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(state.timeIso));

  return (
    <StepShell title="Όλα έτοιμα;" hint="Ρίξε μια τελευταία ματιά πριν κλείσουμε τη θέση σου." onBack={onBack}>
      <div className="border-t border-line">
        <Row icon={<CalendarIcon className="h-4 w-4" />} label="Ημερομηνία & ώρα" value={when} />
        <Row
          icon={<RazorIcon className="h-4 w-4" />}
          label="Υπηρεσία"
          value={`${state.service.name} · ${state.service.duration_min} λεπτά · ${formatPrice(state.service.price_cents)}`}
        />
        <Row icon={<UserIcon className="h-4 w-4" />} label="Κουρέας" value={state.barber.name} />
        <Row
          icon={<PhoneIcon className="h-4 w-4" />}
          label="Στοιχεία σου"
          value={[state.customerName, state.customerPhone, state.customerEmail].filter(Boolean).join(' · ')}
        />
      </div>

      {errorMessage && (
        <p className="mt-6 flex items-start gap-2 border border-pole/30 bg-pole/5 p-4 text-sm text-pole">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={onConfirm}
        disabled={submitting}
        className="mt-8 w-full bg-ink px-6 py-5 text-[15px] font-semibold text-white transition-opacity disabled:opacity-50"
      >
        {submitting ? 'Κλείνουμε τη θέση σου…' : 'Κλείσε το ραντεβού'}
      </button>
      <p className="mt-3 text-center text-xs text-mute">
        Πληρώνεις στο κατάστημα. Χωρίς προκαταβολή.
      </p>
    </StepShell>
  );
}
