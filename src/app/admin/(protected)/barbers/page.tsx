import Link from 'next/link';
import { getAllBarbers } from '@/lib/admin-data';
import { BarberForm } from '@/components/admin/BarberForm';
import { PageHeader, Panel, EmptyState } from '@/components/admin/Shell';
import { ChevronRight, PlusIcon, RazorIcon } from '@/components/ui/Icon';

export default async function AdminBarbersPage() {
  const barbers = await getAllBarbers();

  return (
    <div>
      <PageHeader
        title="Κουρείς"
        subtitle="Κάθε κουρέας έχει δικό του ωράριο και ρεπό. Οι διαθέσιμες ώρες στην online κράτηση βγαίνουν από εδώ."
      />

      <Panel title="Ομάδα" className="mb-6">
        {barbers.length === 0 ? (
          <EmptyState
            icon={<RazorIcon className="h-6 w-6" />}
            title="Δεν υπάρχουν κουρείς"
            description="Πρόσθεσε τον πρώτο κουρέα για να ανοίξουν οι online κρατήσεις."
          />
        ) : (
          barbers.map((barber) => (
            <Link
              key={barber.id}
              href={`/admin/barbers/${barber.id}`}
              className="group flex items-center gap-4 border-b border-line px-5 py-4 no-underline transition-colors last:border-b-0 hover:bg-stone/60"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center ${
                  barber.is_active ? 'bg-ink text-brass' : 'bg-line text-mute'
                }`}
              >
                <RazorIcon className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{barber.name}</span>
                <span className="block text-xs text-mute">
                  {barber.is_active ? 'Δέχεται κρατήσεις' : 'Ανενεργός — δεν εμφανίζεται στο site'}
                </span>
              </span>
              <span className="hidden text-sm text-mute sm:inline">Ωράριο &amp; ρεπό</span>
              <ChevronRight className="h-4 w-4 text-mute transition-transform duration-300 group-hover:translate-x-1 group-hover:text-ink" />
            </Link>
          ))
        )}
      </Panel>

      <details className="group border border-line bg-paper">
        <summary className="flex cursor-pointer items-center gap-2 px-5 py-3.5 text-sm font-semibold">
          <PlusIcon className="h-4 w-4 transition-transform duration-300 group-open:rotate-45" />
          Νέος κουρέας
        </summary>
        <div className="border-t border-line p-5">
          <BarberForm />
        </div>
      </details>
    </div>
  );
}
