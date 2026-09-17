import type { Barber, Service } from '@/lib/types';

export type WizardStep = 'barber' | 'service' | 'datetime' | 'contact' | 'review';

export type BookingState = {
  barber: Barber | null;
  service: Service | null;
  date: string; // 'YYYY-MM-DD'
  timeIso: string | null; // full ISO start instant
  customerName: string;
  customerPhone: string;
  customerEmail: string;
};

export const INITIAL_BOOKING_STATE: BookingState = {
  barber: null,
  service: null,
  date: '',
  timeIso: null,
  customerName: '',
  customerPhone: '',
  customerEmail: '',
};
