-- Row Level Security.
--
-- Public (anon key) reads: active barbers + active services only — needed to render the
-- booking UI, contain no PII. Everything else (availability computation, the booking insert,
-- and every admin read/write) goes through Next.js route handlers instead of direct client
-- queries, so the anon key never touches appointments, working hours, or days-off directly.
-- The service-role key (server-only) is used by the public-facing availability/booking route
-- handlers; the authenticated admin session (cookie-based) is used by the /admin/* route
-- handlers and is granted full access below since there's exactly one legitimate admin login.

alter table barbers enable row level security;
alter table barber_working_hours enable row level security;
alter table barber_days_off enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;

create policy "public read active barbers" on barbers
  for select using (is_active = true);

create policy "public read active services" on services
  for select using (is_active = true);

create policy "admin full access barbers" on barbers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin full access working hours" on barber_working_hours
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin full access days off" on barber_days_off
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin full access services" on services
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin full access appointments" on appointments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
