-- Seed data: the shop's one current barber + working hours + the real 12-item service catalog
-- (from the shop's printed price list, not the 2 shown on the old placeholder site).

insert into barbers (name, is_active, sort_order)
values ('Γιώργος Κουναλάκης', true, 0);

-- Working hours matching the site's existing published hours:
-- Mon & Sat 09:00-17:00, Tue-Fri 11:00-20:00, closed Sunday.
insert into barber_working_hours (barber_id, weekday, start_time, end_time)
select id, weekday, start_time, end_time
from barbers,
  (values
    (1, time '09:00', time '17:00'), -- Monday
    (2, time '11:00', time '20:00'), -- Tuesday
    (3, time '11:00', time '20:00'), -- Wednesday
    (4, time '11:00', time '20:00'), -- Thursday
    (5, time '11:00', time '20:00'), -- Friday
    (6, time '09:00', time '17:00')  -- Saturday
  ) as hours(weekday, start_time, end_time)
where barbers.name = 'Γιώργος Κουναλάκης';

insert into services (name, description, price_cents, duration_min, sort_order) values
  ('Regular haircut', 'Μοντέρνο ή κλασικό ανδρικό κούρεμα', 1200, 30, 1),
  ('Gents haircut', 'Μοντέρνο ή κλασικό ανδρικό κούρεμα, περιποίηση γενειάδας', 1400, 30, 2),
  ('Kids haircut', 'Παιδικό κούρεμα έως 12 ετών', 1000, 30, 3),
  ('One size haircut', 'Κούρεμα μόνο με μηχανή σε ένα μήκος', 600, 30, 4),
  ('Long hair', 'Κούρεμα σε μακρύ μαλλί', 1400, 30, 5),
  ('Beard trim', 'Περιποίηση γενειάδας', 400, 30, 6),
  ('Beard trim & line up design', 'Περιποίηση γενειάδας και σχήμα με ξυράφι', 600, 30, 7),
  ('Long beard trim', 'Περιποίηση μακριάς γενειάδας και σχήμα με ξυράφι', 800, 30, 8),
  ('Hair & scalp treatment', 'Θεραπεία μαλλιών και τριχωτού της κεφαλής', 400, 30, 9),
  ('Hot wax', 'Αποτρίχωση σε μεμονωμένα σημεία του προσώπου με ζεστό κερί', 600, 30, 10),
  ('Total service', 'Κούρεμα, περιποίηση γενειάδας και σχήμα, αποτρίχωση με ζεστό κερί', 1800, 60, 11),
  ('Premium total service', 'Κούρεμα και σχήμα, αποτρίχωση, θεραπεία μαλλιών και τριχωτού', 2400, 60, 12);
