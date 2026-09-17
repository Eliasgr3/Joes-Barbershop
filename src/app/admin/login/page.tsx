'use client';

import { useActionState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn, type ActionResult } from '@/lib/admin-actions';
import { isSupabaseConfigured } from '@/lib/config';
import { AlertIcon, ChevronLeft } from '@/components/ui/Icon';

const initialState: ActionResult | null = null;
const REMEMBERED_EMAIL_KEY = 'jb-admin-email';

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const configured = isSupabaseConfigured();
  const emailRef = useRef<HTMLInputElement>(null);
  const rememberRef = useRef<HTMLInputElement>(null);

  // Prefill from the last remembered sign-in. Done through refs rather than state so the
  // server-rendered markup and the hydrated markup stay identical.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (saved && emailRef.current && rememberRef.current) {
        emailRef.current.value = saved;
        rememberRef.current.checked = true;
      }
    } catch {
      // Private mode / blocked storage — just start with an empty form.
    }
  }, []);

  function persistPreference() {
    try {
      if (rememberRef.current?.checked && emailRef.current?.value) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, emailRef.current.value);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    } catch {
      // Nothing to do — remembering is a convenience, never a requirement.
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-5 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-9 text-center">
          <Image
            src="/images/logo.png"
            alt="Joe’s Barbershop"
            width={150}
            height={38}
            className="mx-auto h-11 w-auto"
            priority
          />
          <p className="mt-5 text-[11px] tracking-[0.22em] text-white/35 uppercase">Είσοδος προσωπικού</p>
        </div>

        <div className="bg-paper p-8">
          <div className="mb-6 h-px w-10 bg-brass" />
          <h1 className="text-2xl font-black uppercase">Σύνδεση</h1>
          <p className="mt-2 text-sm text-mute">Διαχείριση ραντεβού, ωραρίου και εσόδων.</p>

          {!configured && (
            <p className="mt-6 flex items-start gap-2 border border-pole/30 bg-pole/5 p-3 text-sm text-pole">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Το Supabase δεν έχει ρυθμιστεί ακόμα — η σύνδεση δεν θα λειτουργήσει.
            </p>
          )}

          <form action={formAction} className="mt-7 flex flex-col gap-6">
            <label className="block">
              <span className="mb-2 block text-[11px] tracking-[0.14em] text-mute uppercase">Email</span>
              <input
                ref={emailRef}
                type="email"
                name="email"
                required
                autoComplete="username"
                className="w-full border-b border-line bg-transparent py-2.5 transition-colors outline-none focus:border-ink"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] tracking-[0.14em] text-mute uppercase">Κωδικός</span>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className="w-full border-b border-line bg-transparent py-2.5 transition-colors outline-none focus:border-ink"
              />
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                ref={rememberRef}
                type="checkbox"
                name="remember"
                defaultChecked={false}
                className="h-4 w-4 accent-ink"
              />
              <span>Να με θυμάσαι σε αυτή τη συσκευή</span>
            </label>

            {state && !state.ok && (
              <p className="flex items-start gap-2 text-sm text-pole">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                {state.message}
              </p>
            )}

            <button
              type="submit"
              onClick={persistPreference}
              disabled={pending || !configured}
              className="bg-ink px-6 py-4 text-[15px] font-semibold text-white transition-opacity disabled:opacity-40"
            >
              {pending ? 'Σύνδεση…' : 'Σύνδεση'}
            </button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-mute">
            Όταν ο browser σου προτείνει να αποθηκεύσει τον κωδικό, πάτα «Αποθήκευση» — έτσι θα
            συμπληρώνεται μόνος του την επόμενη φορά.
          </p>
        </div>

        <div className="mt-7 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 no-underline transition-colors hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Πίσω στο site
          </Link>
        </div>
      </div>
    </main>
  );
}
