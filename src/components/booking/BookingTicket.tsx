import { SHOP_TIMEZONE } from '@/lib/constants';
import { TicketEdge } from '@/components/ui/TicketEdge';
import type { BookingState } from '@/components/booking/types';

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.00', '')}€`;
}

function Line({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
      <span className="text-[11px] tracking-[0.14em] text-white/40 uppercase">{label}</span>
      {value ? (
        <span className="rise text-right text-sm font-medium text-white">{value}</span>
      ) : (
        <span className="text-right text-sm text-white/25">—</span>
      )}
    </div>
  );
}

export function BookingTicket({ state }: { state: BookingState }) {
  const when = state.timeIso
    ? new Intl.DateTimeFormat('el-GR', {
        timeZone: SHOP_TIMEZONE,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(new Date(state.timeIso))
    : null;

  const time = state.timeIso
    ? new Intl.DateTimeFormat('el-GR', {
        timeZone: SHOP_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(new Date(state.timeIso))
    : null;

  return (
    <aside className="relative bg-ink p-7 pb-9 text-white">
      <div className="mb-6 h-px w-10 bg-brass" />
      <p className="mb-1 font-display text-2xl leading-none font-black tracking-tight text-white uppercase">
        Το ραντεβού σου
      </p>
      <p className="mb-6 text-xs text-white/40">Joe&rsquo;s Barbershop · Χολαργός</p>

      <div className="tnum">
        <Line label="Κουρέας" value={state.barber?.name ?? null} />
        <Line label="Υπηρεσία" value={state.service?.name ?? null} />
        <Line label="Ημέρα" value={when} />
        <Line label="Ώρα" value={time} />
      </div>

      <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
        <span className="pb-1 text-[11px] tracking-[0.14em] text-white/40 uppercase">Σύνολο</span>
        <span className="tnum font-display text-4xl leading-none font-black text-brass">
          {state.service ? formatPrice(state.service.price_cents) : '—'}
        </span>
      </div>
      <p className="mt-3 text-xs text-white/40">Πληρωμή στο κατάστημα</p>
      <TicketEdge notchColor="var(--color-paper)" />
    </aside>
  );
}
