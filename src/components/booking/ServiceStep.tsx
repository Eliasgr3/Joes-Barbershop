import type { Service } from '@/lib/types';
import { StepShell } from '@/components/booking/StepShell';
import { ChevronRight } from '@/components/ui/Icon';

type Props = {
  services: Service[];
  onSelect: (service: Service) => void;
  onBack?: () => void;
};

const GROUPS = [
  { title: 'Κούρεμα', names: ['Regular haircut', 'Gents haircut', 'Kids haircut', 'One size haircut', 'Long hair'] },
  { title: 'Γένια', names: ['Beard trim', 'Beard trim & line up design', 'Long beard trim'] },
  { title: 'Περιποίηση', names: ['Hair & scalp treatment', 'Hot wax'] },
  { title: 'Combo', names: ['Total service', 'Premium total service'] },
];

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.00', '')}€`;
}

export function ServiceStep({ services, onSelect, onBack }: Props) {
  const byName = new Map(services.map((s) => [s.name, s]));
  const listed = new Set(GROUPS.flatMap((g) => g.names));
  const grouped = GROUPS.map((g) => ({
    title: g.title,
    rows: g.names.map((n) => byName.get(n)).filter((s): s is Service => Boolean(s)),
  })).filter((g) => g.rows.length > 0);

  // Anything the shop adds later that isn't in the curated grouping still shows up.
  const ungrouped = services.filter((s) => !listed.has(s.name));
  if (ungrouped.length > 0) grouped.push({ title: 'Άλλες υπηρεσίες', rows: ungrouped });

  return (
    <StepShell title="Διάλεξε υπηρεσία" onBack={onBack}>
      <div className="flex flex-col gap-9">
        {grouped.map((group) => (
          <div key={group.title}>
            <div className="mb-1 flex items-center gap-3">
              <span className="text-[11px] tracking-[0.14em] text-mute uppercase">{group.title}</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div>
              {group.rows.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => onSelect(service)}
                  className="group flex w-full items-center justify-between gap-5 border-b border-line py-5 text-left transition-colors last:border-b-0 hover:bg-stone"
                >
                  <span className="min-w-0">
                    <span className="block text-lg font-semibold">{service.name}</span>
                    {service.description && (
                      <span className="mt-1 block text-sm text-mute">{service.description}</span>
                    )}
                    <span className="tnum mt-1.5 block text-xs text-mute">{service.duration_min} λεπτά</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="tnum font-display text-3xl leading-none font-black">
                      {formatPrice(service.price_cents)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-mute transition-transform duration-300 group-hover:translate-x-1 group-hover:text-ink" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </StepShell>
  );
}
