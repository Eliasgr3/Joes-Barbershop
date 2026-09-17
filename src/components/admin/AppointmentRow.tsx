import type { AppointmentWithRelations } from '@/lib/types';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { StatusActions } from '@/components/admin/StatusActions';
import { SHOP_TIMEZONE } from '@/lib/constants';

function time(iso: string): string {
  return new Intl.DateTimeFormat('el-GR', {
    timeZone: SHOP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
}

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.00', '')}€`;
}

export function AppointmentRow({
  appointment,
  showBarber = false,
}: {
  appointment: AppointmentWithRelations;
  showBarber?: boolean;
}) {
  const faded = appointment.status === 'cancelled';

  return (
    <div className={`flex gap-4 px-5 py-4 transition-colors hover:bg-stone/60 ${faded ? 'opacity-45' : ''}`}>
      <div className="tnum w-14 shrink-0 pt-0.5">
        <div className="font-display text-xl leading-none font-black">{time(appointment.starts_at)}</div>
        <div className="mt-1 text-[11px] text-mute">{time(appointment.ends_at)}</div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-semibold">{appointment.customer_name}</span>
          <StatusBadge status={appointment.status} />
        </div>
        <p className="mt-1 text-sm text-mute">
          {appointment.service.name}
          {showBarber && ` · ${appointment.barber.name}`}
        </p>
        <a
          href={`tel:${appointment.customer_phone}`}
          className="tnum mt-1 inline-block text-sm text-mute underline-offset-2 hover:text-ink hover:underline"
        >
          {appointment.customer_phone}
        </a>
        {appointment.notes && <p className="mt-1.5 text-sm text-mute italic">{appointment.notes}</p>}
        {appointment.status === 'booked' && <StatusActions appointmentId={appointment.id} />}
      </div>

      <div className="tnum shrink-0 pt-0.5 text-right">
        <span className="font-display text-xl leading-none font-black">
          {formatPrice(appointment.price_cents_at_booking)}
        </span>
      </div>
    </div>
  );
}
