import Link from 'next/link';
import { getAllBarbers, getAppointments } from '@/lib/admin-data';
import { AppointmentRow } from '@/components/admin/AppointmentRow';
import { EmptyState, Panel } from '@/components/admin/Shell';
import { SHOP_TIMEZONE } from '@/lib/constants';
import { CalendarIcon, ChevronLeft, ChevronRight, PlusIcon } from '@/components/ui/Icon';

function isoDate(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SHOP_TIMEZONE }).format(d);
}

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.00', '')}€`;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const today = isoDate(new Date());
  const selectedDate = date || today;

  const [barbers, appointments] = await Promise.all([
    getAllBarbers(),
    getAppointments({ from: `${selectedDate}T00:00:00Z`, to: `${selectedDate}T23:59:59Z` }),
  ]);

  const activeBarbers = barbers.filter((b) => b.is_active);
  const counted = appointments.filter((a) => a.status === 'booked' || a.status === 'completed');
  const expectedCents = counted.reduce((sum, a) => sum + a.price_cents_at_booking, 0);

  const now = new Date();
  const upcoming = appointments
    .filter((a) => a.status === 'booked' && new Date(a.starts_at) >= now)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];

  const dayLabel = new Intl.DateTimeFormat('el-GR', {
    timeZone: SHOP_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${selectedDate}T12:00:00Z`));

  return (
    <div>
      {/* The shop's status line for this day — one composed unit, read at a glance. */}
      <section className="mb-8 bg-ink px-6 py-7 text-white sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <p className="text-[11px] tracking-[0.14em] text-white/40 uppercase">
              {selectedDate === today ? 'Σήμερα' : 'Ημέρα'}
            </p>
            <h1 className="mt-1.5 font-display text-[clamp(28px,5vw,42px)] leading-none font-black uppercase">
              {dayLabel}
            </h1>
          </div>

          <dl className="tnum flex flex-wrap items-end gap-x-9 gap-y-5">
            <div>
              <dt className="text-[11px] tracking-[0.14em] text-white/40 uppercase">Ραντεβού</dt>
              <dd className="mt-1.5 font-display text-3xl leading-none font-black">{counted.length}</dd>
            </div>
            <div className="sm:border-l sm:border-white/15 sm:pl-9">
              <dt className="text-[11px] tracking-[0.14em] text-white/40 uppercase">Αναμενόμενα</dt>
              <dd className="mt-1.5 font-display text-3xl leading-none font-black text-brass">
                {formatPrice(expectedCents)}
              </dd>
            </div>
            <div className="sm:border-l sm:border-white/15 sm:pl-9">
              <dt className="text-[11px] tracking-[0.14em] text-white/40 uppercase">Επόμενος</dt>
              <dd className="mt-1.5 text-sm leading-none">
                {upcoming ? (
                  <>
                    <span className="font-display text-3xl leading-none font-black">
                      {new Intl.DateTimeFormat('el-GR', {
                        timeZone: SHOP_TIMEZONE,
                        hour: '2-digit',
                        minute: '2-digit',
                        hourCycle: 'h23',
                      }).format(new Date(upcoming.starts_at))}
                    </span>
                    <span className="mt-1.5 block text-white/50">{upcoming.customer_name}</span>
                  </>
                ) : (
                  <span className="font-display text-3xl leading-none font-black text-white/30">—</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/admin?date=${shiftDate(selectedDate, -1)}`}
            aria-label="Προηγούμενη ημέρα"
            className="flex h-9 w-9 items-center justify-center border border-line bg-paper text-mute no-underline transition-colors hover:border-ink hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link
            href="/admin"
            className="border border-line bg-paper px-4 py-2 text-sm font-semibold no-underline transition-colors hover:border-ink"
          >
            Σήμερα
          </Link>
          <Link
            href={`/admin?date=${shiftDate(selectedDate, 1)}`}
            aria-label="Επόμενη ημέρα"
            className="flex h-9 w-9 items-center justify-center border border-line bg-paper text-mute no-underline transition-colors hover:border-ink hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
          <form className="ml-2 flex items-center gap-2">
            <input
              type="date"
              name="date"
              defaultValue={selectedDate}
              className="tnum border border-line bg-paper px-3 py-2 text-sm"
            />
            <button type="submit" className="border border-line bg-paper px-3 py-2 text-sm transition-colors hover:border-ink">
              Μετάβαση
            </button>
          </form>
        </div>

        <Link
          href="/admin/appointments"
          className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 text-sm font-semibold text-white no-underline"
        >
          <PlusIcon className="h-4 w-4" />
          Νέο ραντεβού
        </Link>
      </div>

      {activeBarbers.length === 0 ? (
        <Panel>
          <EmptyState
            title="Δεν υπάρχουν ενεργοί κουρείς"
            description="Πρόσθεσε έναν κουρέα και το ωράριό του για να δέχεσαι κρατήσεις."
          />
        </Panel>
      ) : (
        <div className={`grid gap-5 ${activeBarbers.length > 1 ? 'lg:grid-cols-2' : ''}`}>
          {activeBarbers.map((barber) => {
            const dayAppointments = appointments
              .filter((a) => a.barber_id === barber.id)
              .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

            return (
              <Panel
                key={barber.id}
                title={barber.name}
                action={
                  <span className="tnum text-xs text-mute">
                    {dayAppointments.filter((a) => a.status !== 'cancelled').length} ραντεβού
                  </span>
                }
              >
                {dayAppointments.length === 0 ? (
                  <EmptyState
                    icon={<CalendarIcon className="h-6 w-6" />}
                    title="Καμία κράτηση"
                    description="Η ημέρα είναι ελεύθερη."
                  />
                ) : (
                  <div className="divide-y divide-line">
                    {dayAppointments.map((appointment) => (
                      <AppointmentRow key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                )}
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
