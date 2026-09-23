-- Lets the shop block part of a day, not just the whole day.
--
-- start_time/end_time both NULL  -> the whole day is off (what the table did before).
-- start_time/end_time both set   -> only that window is blocked, rest of the day stays bookable.

alter table barber_days_off
  add column if not exists start_time time,
  add column if not exists end_time   time;

-- The old table allowed a single row per barber per date, which makes it impossible to block
-- two separate windows on the same day. Drop whatever unique constraint is on those columns
-- (the auto-generated name can vary), then re-add a narrower one below.
do $$
declare
  c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    where rel.relname = 'barber_days_off'
      and con.contype = 'u'
  loop
    execute format('alter table barber_days_off drop constraint %I', c.conname);
  end loop;
end $$;

alter table barber_days_off
  drop constraint if exists time_off_window_valid;

alter table barber_days_off
  add constraint time_off_window_valid check (
    (start_time is null and end_time is null)
    or (start_time is not null and end_time is not null and end_time > start_time)
  );

-- Still only one full-day entry per barber per date; partial windows can repeat freely.
create unique index if not exists barber_days_off_full_day_unique
  on barber_days_off (barber_id, off_date)
  where start_time is null;

create index if not exists idx_barber_days_off_lookup on barber_days_off (barber_id, off_date);
