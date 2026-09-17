import Link from 'next/link';
import { getRevenueSummary } from '@/lib/admin-data';
import { PageHeader, Panel, EmptyState } from '@/components/admin/Shell';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { SHOP_TIMEZONE } from '@/lib/constants';
import { EuroIcon } from '@/components/ui/Icon';

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.00', '')}€`;
}

function isoDate(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SHOP_TIMEZONE }).format(d);
}

function startOfWeek(): string {
  const now = new Date();
  const day = now.getDay() || 7; // Monday = 1 … Sunday = 7
  now.setDate(now.getDate() - day + 1);
  return isoDate(now);
}

function startOfMonth(): string {
  const now = new Date();
  now.setDate(1);
  return isoDate(now);
}

function BreakdownRow({ name, cents, count, max }: { name: string; cents: number; count: number; max: number }) {
  const share = max > 0 ? (cents / max) * 100 : 0;
  return (
    <div className="relative border-b border-line px-5 py-3.5 last:border-b-0">
      <span
        className="absolute inset-y-0 left-0 bg-stone"
        style={{ width: `${share}%` }}
        aria-hidden
      />
      <span className="relative flex items-baseline justify-between gap-4">
        <span className="min-w-0 truncate">
          {name} <span className="tnum text-xs text-mute">×{count}</span>
        </span>
        <span className="tnum shrink-0 font-semibold">{formatPrice(cents)}</span>
      </span>
    </div>
  );
}

export default async function AdminRevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const today = isoDate(new Date());
  const from = params.from || today;
  const to = params.to || today;

  const summary = await getRevenueSummary(`${from}T00:00:00Z`, `${to}T23:59:59Z`);

  const presets = [
    { label: 'Σήμερα', from: today, to: today },
    { label: 'Εβδομάδα', from: startOfWeek(), to: today },
    { label: 'Μήνας', from: startOfMonth(), to: today },
  ];

  const maxService = Math.max(...summary.byService.map((s) => s.cents), 1);
  const maxBarber = Math.max(...summary.byBarber.map((b) => b.cents), 1);
  const average = summary.appointmentCount > 0 ? summary.totalCents / summary.appointmentCount : 0;

  return (
    <div>
      <PageHeader
        title="Έσοδα"
        subtitle="Μετράνε τα κλεισμένα και τα ολοκληρωμένα ραντεβού. Οι ακυρώσεις και όσοι δεν ήρθαν δεν προσμετρώνται."
      />

      <div className="mb-6 flex flex-wrap items-end gap-2">
        {presets.map((preset) => {
          const active = from === preset.from && to === preset.to;
          return (
            <Link
              key={preset.label}
              href={`/admin/revenue?from=${preset.from}&to=${preset.to}`}
              className={`border px-4 py-2 text-sm no-underline transition-colors ${
                active ? 'border-ink bg-ink text-white' : 'border-line bg-paper hover:border-ink'
              }`}
            >
              {preset.label}
            </Link>
          );
        })}

        <form className="ml-auto flex flex-wrap items-end gap-2">
          <label className="block">
            <span className="mb-1 block text-[11px] tracking-[0.14em] text-mute uppercase">Από</span>
            <input type="date" name="from" defaultValue={from} className="tnum border border-line bg-paper px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] tracking-[0.14em] text-mute uppercase">Έως</span>
            <input type="date" name="to" defaultValue={to} className="tnum border border-line bg-paper px-3 py-2 text-sm" />
          </label>
          <button type="submit" className="border border-line bg-paper px-4 py-2 text-sm transition-colors hover:border-ink">
            Εφαρμογή
          </button>
        </form>
      </div>

      <section className="mb-6 bg-ink px-6 py-8 text-white sm:px-8">
        <p className="text-[11px] tracking-[0.14em] text-white/40 uppercase">
          Σύνολο {from === to ? '' : 'περιόδου'}
        </p>
        <p className="tnum mt-2 font-display text-[clamp(44px,9vw,76px)] leading-none font-black text-brass">
          {formatPrice(summary.totalCents)}
        </p>
        <dl className="tnum mt-6 flex flex-wrap gap-x-9 gap-y-4 border-t border-white/10 pt-5 text-sm">
          <div className="flex items-baseline gap-2">
            <dt className="text-white/40">Ραντεβού</dt>
            <dd className="font-semibold">{summary.appointmentCount}</dd>
          </div>
          <div className="flex items-baseline gap-2">
            <dt className="text-white/40">Μέσος όρος ανά πελάτη</dt>
            <dd className="font-semibold">{formatPrice(Math.round(average))}</dd>
          </div>
        </dl>
      </section>

      {summary.byDay.length >= 2 && (
        <div className="mb-6">
          <RevenueChart byDay={summary.byDay} />
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Panel title="Ανά υπηρεσία">
          {summary.byService.length === 0 ? (
            <EmptyState
              icon={<EuroIcon className="h-6 w-6" />}
              title="Καμία κράτηση"
              description="Διάλεξε άλλη περίοδο για να δεις έσοδα."
            />
          ) : (
            summary.byService.map((row) => (
              <BreakdownRow key={row.name} name={row.name} cents={row.cents} count={row.count} max={maxService} />
            ))
          )}
        </Panel>

        <Panel title="Ανά κουρέα">
          {summary.byBarber.length === 0 ? (
            <EmptyState
              icon={<EuroIcon className="h-6 w-6" />}
              title="Καμία κράτηση"
              description="Διάλεξε άλλη περίοδο για να δεις έσοδα."
            />
          ) : (
            summary.byBarber.map((row) => (
              <BreakdownRow key={row.name} name={row.name} cents={row.cents} count={row.count} max={maxBarber} />
            ))
          )}
        </Panel>
      </div>
    </div>
  );
}
