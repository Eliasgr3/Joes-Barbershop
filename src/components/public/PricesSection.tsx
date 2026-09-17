import Link from 'next/link';
import type { Service } from '@/lib/types';

type Props = { services: Service[] };

// Presentational grouping only (not stored in the DB) — keeps the 12-item catalog scannable.
const GROUPS = [
  { title: 'Κούρεμα', names: ['Regular haircut', 'Gents haircut', 'Kids haircut', 'One size haircut', 'Long hair'] },
  { title: 'Γένια', names: ['Beard trim', 'Beard trim & line up design', 'Long beard trim'] },
  { title: 'Extras', names: ['Hair & scalp treatment', 'Hot wax'] },
  { title: 'Combo', names: ['Total service', 'Premium total service'] },
];

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.00', '')}€`;
}

export function PricesSection({ services }: Props) {
  const byName = new Map(services.map((s) => [s.name, s]));

  return (
    <section id="times" className="bg-stone py-[60px]">
      <div className="mx-auto max-w-[1040px] px-[22px]">
        <h2 className="mb-[26px] text-[clamp(30px,7vw,46px)] font-black uppercase">Τιμές</h2>

        {GROUPS.map((group) => {
          const rows = group.names.map((n) => byName.get(n)).filter((s): s is Service => Boolean(s));
          if (rows.length === 0) return null;
          return (
            <div key={group.title} className="mb-8 last:mb-0">
              <p className="mb-2 text-[13px] text-mute">{group.title}</p>
              {rows.map((service) => (
                <div key={service.id} className="flex items-baseline justify-between gap-5 border-b border-line py-[22px] last:border-b-0">
                  <div>
                    <h3 className="text-[23px] font-bold">{service.name}</h3>
                    {service.description && <p className="mt-[5px] text-sm text-mute">{service.description}</p>}
                  </div>
                  <div className="whitespace-nowrap font-display text-[38px] font-black">
                    {formatPrice(service.price_cents)}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        <p className="mt-5 text-sm text-mute">Πληρωμή στο κατάστημα.</p>
        <Link
          href="/book"
          className="mt-6 inline-flex items-center justify-center bg-ink px-[30px] py-4 text-[15px] font-semibold text-white no-underline"
        >
          Κλείσε ραντεβού
        </Link>
      </div>
    </section>
  );
}
