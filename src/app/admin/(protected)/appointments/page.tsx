import { getAllBarbers, getAllServices, getAppointments } from '@/lib/admin-data';
import { ManualAppointmentForm } from '@/components/admin/ManualAppointmentForm';
import { AppointmentRow } from '@/components/admin/AppointmentRow';
import { STATUS_LABELS } from '@/components/admin/StatusBadge';
import { PageHeader, Panel, EmptyState } from '@/components/admin/Shell';
import type { AppointmentStatus, AppointmentWithRelations } from '@/lib/types';
import { SHOP_TIMEZONE } from '@/lib/constants';
import { CalendarIcon, PlusIcon } from '@/components/ui/Icon';

type SearchParams = { from?: string; to?: string; barberId?: string; status?: string };

function dayHeading(iso: string): string {
  return new Intl.DateTimeFormat('el-GR', {
    timeZone: SHOP_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(iso));
}

function groupByDay(appointments: AppointmentWithRelations[]) {
  const groups = new Map<string, AppointmentWithRelations[]>();
  for (const appointment of appointments) {
    const key = new Intl.DateTimeFormat('en-CA', { timeZone: SHOP_TIMEZONE }).format(
      new Date(appointment.starts_at),
    );
    groups.set(key, [...(groups.get(key) ?? []), appointment]);
  }
  return [...groups.entries()];
}

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [barbers, services, appointments] = await Promise.all([
    getAllBarbers(),
    getAllServices(),
    getAppointments({
      from: params.from ? `${params.from}T00:00:00Z` : undefined,
      to: params.to ? `${params.to}T23:59:59Z` : undefined,
      barberId: params.barberId || undefined,
      status: (params.status as AppointmentStatus) || undefined,
    }),
  ]);

  const grouped = groupByDay(appointments);
  const multiBarber = barbers.filter((b) => b.is_active).length > 1;

  return (
    <div>
      <PageHeader title="Ραντεβού" subtitle="Όλες οι κρατήσεις, με φίλτρα και χειροκίνητη καταχώρηση." />

      <details className="group mb-6 border border-line bg-paper">
        <summary className="flex cursor-pointer items-center gap-2 px-5 py-3.5 text-sm font-semibold">
          <PlusIcon className="h-4 w-4 transition-transform duration-300 group-open:rotate-45" />
          Καταχώρηση ραντεβού (walk-in ή τηλεφωνικό)
        </summary>
        <div className="border-t border-line p-5">
          <ManualAppointmentForm
            barbers={barbers.filter((b) => b.is_active)}
            services={services.filter((s) => s.is_active)}
          />
        </div>
      </details>

      <form className="mb-6 flex flex-wrap items-end gap-3 border border-line bg-paper p-4">
        <label className="block">
          <span className="mb-1 block text-[11px] tracking-[0.14em] text-mute uppercase">Από</span>
          <input type="date" name="from" defaultValue={params.from} className="tnum border border-line px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] tracking-[0.14em] text-mute uppercase">Έως</span>
          <input type="date" name="to" defaultValue={params.to} className="tnum border border-line px-3 py-2 text-sm" />
        </label>
        {multiBarber && (
          <label className="block">
            <span className="mb-1 block text-[11px] tracking-[0.14em] text-mute uppercase">Κουρέας</span>
            <select name="barberId" defaultValue={params.barberId ?? ''} className="border border-line px-3 py-2 text-sm">
              <option value="">Όλοι</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block">
          <span className="mb-1 block text-[11px] tracking-[0.14em] text-mute uppercase">Κατάσταση</span>
          <select name="status" defaultValue={params.status ?? ''} className="border border-line px-3 py-2 text-sm">
            <option value="">Όλες</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="bg-ink px-4 py-2.5 text-sm font-semibold text-white">
          Φιλτράρισμα
        </button>
        <a href="/admin/appointments" className="px-2 py-2.5 text-sm text-mute no-underline hover:text-ink">
          Καθαρισμός
        </a>
      </form>

      {grouped.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<CalendarIcon className="h-6 w-6" />}
            title="Δεν βρέθηκαν ραντεβού"
            description="Δοκίμασε να αλλάξεις τα φίλτρα ή καταχώρησε ένα νέο ραντεβού."
          />
        </Panel>
      ) : (
        <div className="flex flex-col gap-5">
          {grouped.map(([day, dayAppointments]) => (
            <Panel
              key={day}
              title={dayHeading(`${day}T12:00:00Z`)}
              action={<span className="tnum text-xs text-mute">{dayAppointments.length}</span>}
            >
              <div className="divide-y divide-line">
                {dayAppointments.map((appointment) => (
                  <AppointmentRow key={appointment.id} appointment={appointment} showBarber={multiBarber} />
                ))}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
