-- A completed visit must keep its time occupied.
--
-- The original rule only guarded rows with status 'booked', so pressing "Ήρθε"
-- (completed) silently reopened that slot and a second appointment could be created
-- on top of it. Cancelled and no-show rows still free the slot, which is intended:
-- both mean the chair is genuinely available again.
--
-- NOTE: this will fail if two overlapping appointments already exist. Resolve the
-- clash first (cancel whichever row is wrong), then run this.

alter table appointments
  drop constraint if exists no_overlapping_appointments;

alter table appointments
  add constraint no_overlapping_appointments
  exclude using gist (
    barber_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('booked', 'completed'));
