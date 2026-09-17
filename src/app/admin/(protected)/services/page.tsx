import { getAllServices } from '@/lib/admin-data';
import { ServiceForm } from '@/components/admin/ServiceForm';
import { ServiceRow } from '@/components/admin/ServiceRow';
import { PageHeader, Panel, EmptyState } from '@/components/admin/Shell';
import { PlusIcon, RazorIcon } from '@/components/ui/Icon';

export default async function AdminServicesPage() {
  const services = await getAllServices();
  const active = services.filter((s) => s.is_active);

  return (
    <div>
      <PageHeader
        title="Υπηρεσίες"
        subtitle="Ο τιμοκατάλογος του καταστήματος. Ό,τι αλλάξεις εδώ ενημερώνεται αμέσως στο site και στην online κράτηση."
      />

      <Panel
        title="Τιμοκατάλογος"
        action={<span className="tnum text-xs text-mute">{active.length} ενεργές</span>}
        className="mb-6"
      >
        {services.length === 0 ? (
          <EmptyState
            icon={<RazorIcon className="h-6 w-6" />}
            title="Δεν υπάρχουν υπηρεσίες"
            description="Πρόσθεσε την πρώτη υπηρεσία για να μπορούν οι πελάτες να κλείνουν ραντεβού."
          />
        ) : (
          services.map((service) => <ServiceRow key={service.id} service={service} />)
        )}
      </Panel>

      <details className="group border border-line bg-paper">
        <summary className="flex cursor-pointer items-center gap-2 px-5 py-3.5 text-sm font-semibold">
          <PlusIcon className="h-4 w-4 transition-transform duration-300 group-open:rotate-45" />
          Νέα υπηρεσία
        </summary>
        <div className="border-t border-line p-5">
          <ServiceForm />
        </div>
      </details>
    </div>
  );
}
