import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/config';
import { SHOP_INFO, SHOP_TIMEZONE } from '@/lib/constants';
import { CancelBookingPanel } from '@/components/booking/CancelBookingPanel';
import { CalendarIcon, CheckIcon, PhoneIcon, RazorIcon } from '@/components/ui/Icon';

export const metadata = {
  title: "Ακύρωση ραντεβού — Joe's Barbershop",
};

type AppointmentView = {
  id: string;
  status: string;
  starts_at: string;
  customer_name: string;
  price_cents_at_booking: number;
  barber: { name: string } | null;
  service: { name: string } | null;
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-1 flex-col items-center justify-center bg-ink px-5 py-14 text-white">
      <div className="w-full max-w-[460px]">
        <div className="mb-9 text-center">
          <Image
            src="/images/logo.png"
            alt="Joe’s Barbershop"
            width={140}
            height={36}
            className="mx-auto h-10 w-auto"
            priority
          />
        </div>
        {children}
      </div>
    </main>
  );
}

function NotFound({ message }: { message: string }) {
  return (
    <Shell>
      <div className="text-center">
        <h1 className="text-3xl font-black uppercase">Δεν βρέθηκε</h1>
        <p className="mx-auto mt-4 max-w-[34ch] text-sm text-white/55">{message}</p>
        <a
          href={`tel:${SHOP_INFO.phone}`}
          className="mt-7 inline-flex items-center gap-2 border border-white/25 px-6 py-3.5 text-sm font-semibold text-white no-underline transition-colors hover:border-white"
        >
          <PhoneIcon className="h-4 w-4" />
          {SHOP_INFO.phoneDisplay}
        </a>
        <div className="mt-8">
          <Link href="/" className="text-sm text-white/45 no-underline transition-colors hover:text-white">
            Πίσω στην αρχική
          </Link>
        </div>
      </div>
    </Shell>
  );
}

export default async function CancelBookingPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;

  if (!isSupabaseConfigured()) {
    return <NotFound message="Το σύστημα κρατήσεων δεν είναι διαθέσιμο αυτή τη στιγμή." />;
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('appointments')
    .select('id, status, starts_at, customer_name, price_cents_at_booking, barber:barbers(name), service:services(name)')
    .eq('id', appointmentId)
    .single();

  const appointment = data as AppointmentView | null;

  if (!appointment) {
    return <NotFound message="Αυτός ο σύνδεσμος ακύρωσης δεν αντιστοιχεί σε κάποιο ραντεβού." />;
  }

  const when = new Intl.DateTimeFormat('el-GR', {
    timeZone: SHOP_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(appointment.starts_at));

  const alreadyCancelled = appointment.status === 'cancelled';
  const inThePast = new Date(appointment.starts_at) < new Date();

  return (
    <Shell>
      <div className="rise mb-8 bg-white p-7 text-ink">
        <p className="text-[11px] tracking-[0.14em] text-mute uppercase">Το ραντεβού σου</p>
        <p className="mt-2 font-display text-3xl leading-none font-black">{appointment.customer_name}</p>

        <dl className="tnum mt-6 border-t border-line">
          <div className="flex items-start gap-3 border-b border-line py-3.5">
            <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-mute" />
            <div>
              <dt className="text-[11px] tracking-[0.14em] text-mute uppercase">Ημερομηνία &amp; ώρα</dt>
              <dd className="mt-1 font-medium capitalize">{when}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3 py-3.5">
            <RazorIcon className="mt-0.5 h-4 w-4 shrink-0 text-mute" />
            <div>
              <dt className="text-[11px] tracking-[0.14em] text-mute uppercase">Υπηρεσία</dt>
              <dd className="mt-1 font-medium">
                {appointment.service?.name ?? '—'}
                {appointment.barber?.name ? ` · ${appointment.barber.name}` : ''}
              </dd>
            </div>
          </div>
        </dl>

        {/* Reads correctly both right after cancelling and when revisiting the link later. */}
        {alreadyCancelled && (
          <p className="mt-5 flex items-center gap-2 border border-line bg-stone p-3 text-sm font-medium">
            <CheckIcon className="h-4 w-4 shrink-0 text-done" />
            Αυτό το ραντεβού είναι ακυρωμένο — η ώρα ελευθερώθηκε.
          </p>
        )}
        {!alreadyCancelled && inThePast && (
          <p className="mt-5 border border-line bg-stone p-3 text-sm text-mute">
            Αυτό το ραντεβού έχει ήδη περάσει.
          </p>
        )}
      </div>

      {!alreadyCancelled && !inThePast ? (
        <CancelBookingPanel appointmentId={appointment.id} />
      ) : (
        <div className="text-center">
          <Link
            href="/book"
            className="inline-block bg-white px-6 py-3.5 text-sm font-semibold text-ink no-underline"
          >
            Κλείσε νέο ραντεβού
          </Link>
        </div>
      )}

      <div className="mt-9 text-center">
        <Link href="/" className="text-sm text-white/45 no-underline transition-colors hover:text-white">
          Πίσω στην αρχική
        </Link>
      </div>
    </Shell>
  );
}
