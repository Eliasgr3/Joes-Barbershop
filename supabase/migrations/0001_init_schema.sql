-- Joe's Barbershop — core schema
create extension if not exists "pgcrypto";
create extension if not exists btree_gist;

create type appointment_status as enum ('booked', 'completed', 'cancelled', 'no_show');

create table barbers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  photo_url   text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table barber_working_hours (
  id          uuid primary key default gen_random_uuid(),
  barber_id   uuid not null references barbers(id) on delete cascade,
  weekday     smallint not null check (weekday between 0 and 6), -- 0 = Sunday .. 6 = Saturday
  start_time  time not null,
  end_time    time not null,
  unique (barber_id, weekday),
  check (end_time > start_time)
);

create table barber_days_off (
  id          uuid primary key default gen_random_uuid(),
  barber_id   uuid not null references barbers(id) on delete cascade,
  off_date    date not null,
  reason      text,
  unique (barber_id, off_date)
);

create table services (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  price_cents   int not null check (price_cents >= 0),
  duration_min  int not null check (duration_min > 0),
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create table appointments (
  id                       uuid primary key default gen_random_uuid(),
  barber_id                uuid not null references barbers(id),
  service_id               uuid not null references services(id),
  starts_at                timestamptz not null,
  ends_at                  timestamptz not null,
  status                   appointment_status not null default 'booked',
  customer_name            text not null,
  customer_phone           text not null,
  customer_email           text,
  notes                    text,
  source                   text not null default 'public' check (source in ('public', 'admin')),
  price_cents_at_booking   int not null,
  confirmation_email_sent  boolean not null default false,
  created_at               timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- Prevents any overlapping *booked* appointment for the same barber at the DB level —
-- the actual race-condition guard, independent of any application-level re-check.
alter table appointments
  add constraint no_overlapping_appointments
  exclude using gist (
    barber_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status = 'booked');

create index idx_appointments_barber_date on appointments (barber_id, starts_at);
create index idx_appointments_status on appointments (status);
