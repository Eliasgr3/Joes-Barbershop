export type AppointmentStatus = 'booked' | 'completed' | 'cancelled' | 'no_show';

export type Barber = {
  id: string;
  name: string;
  photo_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type BarberWorkingHours = {
  id: string;
  barber_id: string;
  weekday: number; // 0 = Sunday .. 6 = Saturday
  start_time: string; // 'HH:MM:SS'
  end_time: string;
};

export type BarberDayOff = {
  id: string;
  barber_id: string;
  off_date: string; // 'YYYY-MM-DD'
  reason: string | null;
  // Both null = the whole day is off. Both set = only that window is blocked.
  start_time: string | null; // 'HH:MM:SS'
  end_time: string | null;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  duration_min: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Appointment = {
  id: string;
  barber_id: string;
  service_id: string;
  starts_at: string; // ISO timestamp
  ends_at: string;
  status: AppointmentStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  source: 'public' | 'admin';
  price_cents_at_booking: number;
  confirmation_email_sent: boolean;
  created_at: string;
};

export type AppointmentWithRelations = Appointment & {
  barber: Pick<Barber, 'id' | 'name'>;
  service: Pick<Service, 'id' | 'name' | 'duration_min'>;
};

type Table<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      barbers: Table<Barber>;
      barber_working_hours: Table<BarberWorkingHours>;
      barber_days_off: Table<BarberDayOff>;
      services: Table<Service>;
      appointments: Table<Appointment>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
