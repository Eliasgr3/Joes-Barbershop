import Link from 'next/link';
import Image from 'next/image';
import { SHOP_INFO, SHOP_TIMEZONE } from '@/lib/constants';
import { CalendarIcon, CheckIcon, MapPinIcon, PhoneIcon } from '@/components/ui/Icon';
import { TicketEdge } from '@/components/ui/TicketEdge';

export const metadata = {
  title: "Το ραντεβού σου κλείστηκε — Joe's Barbershop",
};

type SearchParams = {
  id?: string;
  barberName?: string;
  serviceName?: string;
  startsAt?: string;
  durationMin?: string;
  priceCents?: string;
  emailSent?: string;
};

function googleCalendarUrl(args: {
  serviceName: string;
  barberName: string;
  startsAt: string;
  durationMin: number;
}): string {
  const start = new Date(args.startsAt);
  const end = new Date(start.getTime() + args.durationMin * 60_000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${args.serviceName} — Joe's Barbershop`,
    dates: `${stamp(start)}/${stamp(end)}`,
    location: SHOP_INFO.address,
    details: `Κουρέας: ${args.barberName}\nΤηλέφωνο: ${SHOP_INFO.phoneDisplay}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  if (!params.barberName || !params.serviceName || !params.startsAt) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-ink px-6 text-center text-white">
        <div>
          <h1 className="mb-3 text-3xl font-black uppercase">Δεν βρέθηκε ραντεβού</h1>
          <p className="mb-8 text-sm text-white/50">Ο σύνδεσμος δεν περιέχει στοιχεία κράτησης.</p>
          <Link href="/book" className="inline-block bg-white px-7 py-4 text-sm font-semibold text-ink no-underline">
            Κλείσε ραντεβού
          </Link>
        </div>
      </main>
    );
  }

  const start = new Date(params.startsAt);
  const dayLabel = new Intl.DateTimeFormat('el-GR', {
    timeZone: SHOP_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(start);
  const timeLabel = new Intl.DateTimeFormat('el-GR', {
    timeZone: SHOP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(start);
  const price = params.priceCents
    ? `${(Number(params.priceCents) / 100).toFixed(2).replace('.00', '')}€`
    : '';

  return (
    <main className="flex-1 bg-ink py-14 text-white">
      <div className="mx-auto max-w-[560px] px-[22px]">
        <div className="rise text-center">
          <span className="mx-auto mb-7 flex h-14 w-14 items-center justify-center border border-brass text-brass">
            <CheckIcon className="h-6 w-6" strokeWidth={2} />
          </span>
          <h1 className="text-[clamp(34px,8vw,56px)] font-black uppercase">Κλείστηκε</h1>
          <p className="mx-auto mt-4 max-w-[34ch] text-[15px] leading-relaxed text-white/55">
            Σε περιμένουμε {dayLabel} στις {timeLabel}. Δεν χρειάζεται να πληρώσεις τίποτα τώρα.
          </p>
          {params.emailSent === 'true' && (
            <p className="mt-3 text-xs text-brass">Σου στείλαμε κι ένα email επιβεβαίωσης.</p>
          )}
        </div>

        <div className="rise relative mt-11 bg-white p-8 pb-10 text-ink">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.14em] text-mute uppercase">Ραντεβού</p>
              <p className="tnum font-display text-4xl leading-none font-black">{timeLabel}</p>
              <p className="mt-1.5 text-sm text-mute capitalize">{dayLabel}</p>
            </div>
            <Image src="/images/logo.png" alt="" width={64} height={64} className="h-12 w-auto opacity-25 invert" />
          </div>

          <dl className="tnum border-t border-line">
            <div className="flex items-baseline justify-between gap-4 border-b border-line py-3.5">
              <dt className="text-[11px] tracking-[0.14em] text-mute uppercase">Υπηρεσία</dt>
              <dd className="text-right font-medium">{params.serviceName}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-line py-3.5">
              <dt className="text-[11px] tracking-[0.14em] text-mute uppercase">Κουρέας</dt>
              <dd className="text-right font-medium">{params.barberName}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3.5">
              <dt className="text-[11px] tracking-[0.14em] text-mute uppercase">Πληρωμή στο κατάστημα</dt>
              <dd className="font-display text-2xl leading-none font-black">{price}</dd>
            </div>
          </dl>

          <TicketEdge notchColor="var(--color-ink)" />
        </div>

        <div className="mt-9 flex flex-col gap-3">
          <a
            href={googleCalendarUrl({
              serviceName: params.serviceName,
              barberName: params.barberName,
              startsAt: params.startsAt,
              durationMin: Number(params.durationMin) || 30,
            })}
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2.5 border border-white/25 py-4 text-sm font-semibold text-white no-underline transition-colors hover:border-white"
          >
            <CalendarIcon className="h-4 w-4" />
            Πρόσθεσέ το στο ημερολόγιο
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP_INFO.mapsQuery)}`}
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-2.5 border border-white/25 py-4 text-sm font-semibold text-white no-underline transition-colors hover:border-white"
          >
            <MapPinIcon className="h-4 w-4" />
            {SHOP_INFO.address}
          </a>
        </div>

        <div className="mt-9 text-center">
          <p className="text-sm text-white/45">Άλλαξαν τα σχέδιά σου;</p>
          {params.id && (
            <p className="mt-2 text-sm">
              <Link href={`/cancel/${params.id}`} className="text-white underline underline-offset-4">
                Ακύρωσε το ραντεβού
              </Link>
              <span className="text-white/45"> — κράτα αυτή τη σελίδα για να τη βρεις ξανά.</span>
            </p>
          )}
          <p className="mt-2 text-sm text-white/45">
            ή κάλεσέ μας στο{' '}
            <a href={`tel:${SHOP_INFO.phone}`} className="inline-flex items-center gap-1.5 text-white underline">
              <PhoneIcon className="h-3.5 w-3.5" />
              {SHOP_INFO.phoneDisplay}
            </a>
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm text-white/45 no-underline transition-colors hover:text-white">
            Πίσω στην αρχική
          </Link>
        </div>
      </div>
    </main>
  );
}
