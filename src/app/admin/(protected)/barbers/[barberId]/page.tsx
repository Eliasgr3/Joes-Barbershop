import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBarberById, getDaysOff, getWorkingHours } from '@/lib/admin-data';
import { BarberForm } from '@/components/admin/BarberForm';
import { WeeklyHoursEditor } from '@/components/admin/WeeklyHoursEditor';
import { DaysOffManager } from '@/components/admin/DaysOffManager';
import { PageHeader, Panel } from '@/components/admin/Shell';
import { ChevronLeft } from '@/components/ui/Icon';

export default async function AdminBarberDetailPage({
  params,
}: {
  params: Promise<{ barberId: string }>;
}) {
  const { barberId } = await params;
  const barber = await getBarberById(barberId);
  if (!barber) notFound();

  const [hours, daysOff] = await Promise.all([getWorkingHours(barberId), getDaysOff(barberId)]);

  return (
    <div>
      <Link
        href="/admin/barbers"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-mute no-underline transition-colors hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" />
        Κουρείς
      </Link>

      <PageHeader
        title={barber.name}
        subtitle="Το ωράριο και τα ρεπό καθορίζουν τι βλέπουν οι πελάτες ως διαθέσιμο στην online κράτηση."
      />

      <div className="mb-6">
        <Panel title="Στοιχεία">
          <div className="p-5">
            <BarberForm barber={barber} />
          </div>
        </Panel>
      </div>

      {/* minmax(0,1fr) so a wide child (the native time inputs) can't stretch the column. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="Εβδομαδιαίο ωράριο">
          <WeeklyHoursEditor barberId={barberId} hours={hours} />
        </Panel>

        <Panel title="Ρεπό & εξαιρέσεις">
          <DaysOffManager barberId={barberId} daysOff={daysOff} />
        </Panel>
      </div>
    </div>
  );
}
