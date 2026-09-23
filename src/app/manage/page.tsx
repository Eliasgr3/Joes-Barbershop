'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { findBookingsByPhone, type FoundBooking } from '@/lib/booking-actions';
import { BookingCard } from '@/components/booking/BookingCard';
import { AlertIcon, ChevronLeft, PhoneIcon } from '@/components/ui/Icon';
import { SHOP_INFO } from '@/lib/constants';

export default function ManageBookingsPage() {
  const [phone, setPhone] = useState('');
  const [pending, startTransition] = useTransition();
  const [results, setResults] = useState<FoundBooking[] | null>(null);
  const [searchedFor, setSearchedFor] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = phone.trim();
    startTransition(async () => {
      const found = await findBookingsByPhone(value);
      setResults(found);
      setSearchedFor(value);
    });
  }

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-paper">
      <div className="bg-ink pt-5 pb-8 text-white">
        <div className="mx-auto max-w-[640px] px-[22px]">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-white/50 no-underline transition-colors hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Αρχική
            </Link>
            <Image src="/images/logo.png" alt="Joe’s Barbershop" width={110} height={28} className="h-7 w-auto opacity-90" />
          </div>
          <h1 className="text-[clamp(28px,5vw,40px)] font-black uppercase">Το ραντεβού μου</h1>
          <p className="mt-3 max-w-[46ch] text-sm text-white/55">
            Βάλε το τηλέφωνο που χρησιμοποίησες όταν έκλεισες ραντεβού, για να το βρεις και να το
            ακυρώσεις — όσες μέρες κι αν πέρασαν από τότε.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[640px] px-[22px] py-10">
        <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="mb-2 block text-[11px] tracking-[0.14em] text-mute uppercase">Τηλέφωνο</span>
            <input
              type="tel"
              required
              inputMode="tel"
              placeholder="69XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border-b border-line bg-transparent py-3 text-lg outline-none transition-colors focus:border-ink"
            />
          </label>
          <button
            type="submit"
            disabled={pending || phone.trim().length < 8}
            className="bg-ink px-6 py-3.5 text-[15px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
          >
            {pending ? 'Αναζήτηση…' : 'Βρες τα ραντεβού μου'}
          </button>
        </form>

        {results !== null && (
          <div className="rise">
            {results.length === 0 ? (
              <div className="border border-line p-8 text-center">
                <AlertIcon className="mx-auto mb-3 h-6 w-6 text-mute" />
                <p className="font-semibold">Δεν βρέθηκαν επερχόμενα ραντεβού</p>
                <p className="mx-auto mt-1.5 max-w-[36ch] text-sm text-mute">
                  Δεν βρήκαμε κάποιο ενεργό ραντεβού με το τηλέφωνο {searchedFor}. Αν νομίζεις ότι
                  κάτι δεν πάει καλά, κάλεσέ μας.
                </p>
                <a
                  href={`tel:${SHOP_INFO.phone}`}
                  className="mt-5 inline-flex items-center gap-2 border border-line px-5 py-3 text-sm font-semibold no-underline transition-colors hover:border-ink"
                >
                  <PhoneIcon className="h-4 w-4" />
                  {SHOP_INFO.phoneDisplay}
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-[11px] tracking-[0.14em] text-mute uppercase">
                  {results.length} {results.length === 1 ? 'ραντεβού' : 'ραντεβού'}
                </p>
                {results.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
