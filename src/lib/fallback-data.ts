import type { Barber, Service } from '@/lib/types';

/**
 * Used only when Supabase isn't configured yet (no env vars) or a query fails — keeps the
 * public site fully demoable before the real database is wired up. Mirrors
 * supabase/migrations/0003_seed_data.sql; once Supabase is connected, real DB rows take over
 * and this file is never read.
 */
export const FALLBACK_BARBERS: Barber[] = [
  {
    id: 'fallback-barber-1',
    name: 'Γιώργος Κουναλάκης',
    photo_url: null,
    is_active: true,
    sort_order: 0,
    created_at: new Date().toISOString(),
  },
];

export const FALLBACK_SERVICES: Service[] = [
  { id: 'fallback-1', name: 'Regular haircut', description: 'Μοντέρνο ή κλασικό ανδρικό κούρεμα', price_cents: 1200, duration_min: 30, is_active: true, sort_order: 1, created_at: new Date().toISOString() },
  { id: 'fallback-2', name: 'Gents haircut', description: 'Μοντέρνο ή κλασικό ανδρικό κούρεμα, περιποίηση γενειάδας', price_cents: 1400, duration_min: 30, is_active: true, sort_order: 2, created_at: new Date().toISOString() },
  { id: 'fallback-3', name: 'Kids haircut', description: 'Παιδικό κούρεμα έως 12 ετών', price_cents: 1000, duration_min: 30, is_active: true, sort_order: 3, created_at: new Date().toISOString() },
  { id: 'fallback-4', name: 'One size haircut', description: 'Κούρεμα μόνο με μηχανή σε ένα μήκος', price_cents: 600, duration_min: 30, is_active: true, sort_order: 4, created_at: new Date().toISOString() },
  { id: 'fallback-5', name: 'Long hair', description: 'Κούρεμα σε μακρύ μαλλί', price_cents: 1400, duration_min: 30, is_active: true, sort_order: 5, created_at: new Date().toISOString() },
  { id: 'fallback-6', name: 'Beard trim', description: 'Περιποίηση γενειάδας', price_cents: 400, duration_min: 30, is_active: true, sort_order: 6, created_at: new Date().toISOString() },
  { id: 'fallback-7', name: 'Beard trim & line up design', description: 'Περιποίηση γενειάδας και σχήμα με ξυράφι', price_cents: 600, duration_min: 30, is_active: true, sort_order: 7, created_at: new Date().toISOString() },
  { id: 'fallback-8', name: 'Long beard trim', description: 'Περιποίηση μακριάς γενειάδας και σχήμα με ξυράφι', price_cents: 800, duration_min: 30, is_active: true, sort_order: 8, created_at: new Date().toISOString() },
  { id: 'fallback-9', name: 'Hair & scalp treatment', description: 'Θεραπεία μαλλιών και τριχωτού της κεφαλής', price_cents: 400, duration_min: 30, is_active: true, sort_order: 9, created_at: new Date().toISOString() },
  { id: 'fallback-10', name: 'Hot wax', description: 'Αποτρίχωση σε μεμονωμένα σημεία του προσώπου με ζεστό κερί', price_cents: 600, duration_min: 30, is_active: true, sort_order: 10, created_at: new Date().toISOString() },
  { id: 'fallback-11', name: 'Total service', description: 'Κούρεμα, περιποίηση γενειάδας και σχήμα, αποτρίχωση με ζεστό κερί', price_cents: 1800, duration_min: 60, is_active: true, sort_order: 11, created_at: new Date().toISOString() },
  { id: 'fallback-12', name: 'Premium total service', description: 'Κούρεμα και σχήμα, αποτρίχωση, θεραπεία μαλλιών και τριχωτού', price_cents: 2400, duration_min: 60, is_active: true, sort_order: 12, created_at: new Date().toISOString() },
];
