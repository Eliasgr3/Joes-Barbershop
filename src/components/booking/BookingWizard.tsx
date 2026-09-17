'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Barber, Service } from '@/lib/types';
import { BarberStep } from '@/components/booking/BarberStep';
import { ServiceStep } from '@/components/booking/ServiceStep';
import { DateTimeStep } from '@/components/booking/DateTimeStep';
import { ContactDetailsStep } from '@/components/booking/ContactDetailsStep';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { BookingProgress } from '@/components/booking/BookingProgress';
import { BookingTicket } from '@/components/booking/BookingTicket';
import { INITIAL_BOOKING_STATE, type BookingState, type WizardStep } from '@/components/booking/types';
import { ChevronLeft } from '@/components/ui/Icon';

const STEP_LABELS: Record<WizardStep, string> = {
  barber: 'Κουρέας',
  service: 'Υπηρεσία',
  datetime: 'Ώρα',
  contact: 'Στοιχεία',
  review: 'Επιβεβαίωση',
};

export function BookingWizard() {
  const router = useRouter();
  const [barbers, setBarbers] = useState<Barber[] | null>(null);
  const [services, setServices] = useState<Service[] | null>(null);
  const [step, setStep] = useState<WizardStep>('barber');
  const [state, setState] = useState<BookingState>(INITIAL_BOOKING_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/barbers').then((r) => r.json()),
      fetch('/api/services').then((r) => r.json()),
    ]).then(([barbersData, servicesData]) => {
      const loadedBarbers: Barber[] = barbersData.barbers ?? [];
      setBarbers(loadedBarbers);
      setServices(servicesData.services ?? []);
      // A single barber is not a choice — pick them and open on the services.
      if (loadedBarbers.length === 1) {
        setState((s) => ({ ...s, barber: loadedBarbers[0] }));
        setStep('service');
      }
    });
  }, []);

  const multiBarber = (barbers?.length ?? 0) > 1;
  const stepOrder: WizardStep[] = multiBarber
    ? ['barber', 'service', 'datetime', 'contact', 'review']
    : ['service', 'datetime', 'contact', 'review'];

  async function handleConfirm() {
    if (!state.barber || !state.service || !state.timeIso) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId: state.barber.id,
          serviceId: state.service.id,
          startsAt: state.timeIso,
          customerName: state.customerName,
          customerPhone: state.customerPhone,
          customerEmail: state.customerEmail || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'slot_unavailable') {
          setErrorMessage(data.message);
          setStep('datetime');
          setState((s) => ({ ...s, timeIso: null }));
        } else if (data.error === 'booking_not_configured') {
          setErrorMessage(data.message);
        } else {
          setErrorMessage('Κάτι πήγε στραβά. Δοκίμασε ξανά ή καλέστε μας.');
        }
        return;
      }

      const params = new URLSearchParams({
        barberName: data.barberName,
        serviceName: data.serviceName,
        startsAt: data.startsAt,
        durationMin: String(data.durationMin),
        priceCents: String(data.priceCents),
        emailSent: String(Boolean(data.confirmationEmailSent)),
      });
      router.push(`/book/confirmation?${params.toString()}`);
    } catch {
      setErrorMessage('Κάτι πήγε στραβά. Δοκίμασε ξανά ή καλέστε μας.');
    } finally {
      setSubmitting(false);
    }
  }

  function renderStep() {
    if (!barbers || !services) {
      return (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse border border-line bg-stone" />
          ))}
        </div>
      );
    }

    if (step === 'barber') {
      return (
        <BarberStep
          barbers={barbers}
          onSelect={(barber) => {
            setState((s) => ({ ...s, barber }));
            setStep('service');
          }}
        />
      );
    }

    if (step === 'service') {
      return (
        <ServiceStep
          services={services}
          onBack={multiBarber ? () => setStep('barber') : undefined}
          onSelect={(service) => {
            setState((s) => ({ ...s, service }));
            setStep('datetime');
          }}
        />
      );
    }

    if (step === 'datetime' && state.barber && state.service) {
      return (
        <DateTimeStep
          barber={state.barber}
          service={state.service}
          date={state.date}
          onSelectDate={(date) => setState((s) => ({ ...s, date, timeIso: null }))}
          onSelectTime={(iso) => {
            setState((s) => ({ ...s, timeIso: iso }));
            setStep('contact');
          }}
          onBack={() => setStep('service')}
        />
      );
    }

    if (step === 'contact') {
      return (
        <ContactDetailsStep
          initialName={state.customerName}
          initialPhone={state.customerPhone}
          initialEmail={state.customerEmail}
          onBack={() => setStep('datetime')}
          onSubmit={({ name, phone, email }) => {
            setState((s) => ({ ...s, customerName: name, customerPhone: phone, customerEmail: email }));
            setStep('review');
          }}
        />
      );
    }

    if (step === 'review') {
      return (
        <BookingSummary
          state={state}
          submitting={submitting}
          errorMessage={errorMessage}
          onConfirm={handleConfirm}
          onBack={() => setStep('contact')}
        />
      );
    }

    return null;
  }

  return (
    <>
      <div className="bg-ink pt-5 pb-7">
        <div className="mx-auto max-w-[1040px] px-[22px]">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/50 no-underline transition-colors hover:text-white">
              <ChevronLeft className="h-4 w-4" />
              Αρχική
            </Link>
            <Image
              src="/images/logo.png"
              alt="Joe’s Barbershop"
              width={110}
              height={28}
              className="h-7 w-auto opacity-90"
            />
          </div>
          <BookingProgress
            steps={stepOrder.map((key) => ({ key, label: STEP_LABELS[key] }))}
            activeIndex={Math.max(0, stepOrder.indexOf(step))}
          />
        </div>
      </div>

      <div className="mx-auto grid max-w-[1040px] gap-x-14 gap-y-10 px-[22px] py-12 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">{renderStep()}</div>
        <div className="lg:sticky lg:top-8 lg:self-start">
          <BookingTicket state={state} />
        </div>
      </div>
    </>
  );
}
