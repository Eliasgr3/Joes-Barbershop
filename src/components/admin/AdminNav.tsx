'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/admin-actions';
import { LogoutIcon } from '@/components/ui/Icon';

const LINKS = [
  { href: '/admin', label: 'Ημέρα' },
  { href: '/admin/appointments', label: 'Ραντεβού' },
  { href: '/admin/revenue', label: 'Έσοδα' },
  { href: '/admin/services', label: 'Υπηρεσίες' },
  { href: '/admin/barbers', label: 'Κουρείς' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-ink">
      <div className="mx-auto flex max-w-[1180px] items-center gap-6 px-5">
        <Link href="/admin" className="shrink-0 py-3.5">
          <Image src="/images/logo.png" alt="Joe’s Barbershop" width={92} height={24} className="h-6 w-auto" />
        </Link>

        <nav className="on-ink -mb-px flex flex-1 gap-1 overflow-x-auto">
          {LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`relative shrink-0 px-3 py-4 text-sm whitespace-nowrap no-underline transition-colors ${
                  active ? 'text-brass' : 'text-white/55 hover:text-white'
                }`}
              >
                {link.label}
                {active && <span className="absolute inset-x-3 bottom-2.5 h-px bg-brass" />}
              </Link>
            );
          })}
        </nav>

        <form action={signOut} className="shrink-0">
          <button
            type="submit"
            className="flex items-center gap-2 py-4 text-sm text-white/45 transition-colors hover:text-white"
          >
            <LogoutIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Αποσύνδεση</span>
          </button>
        </form>
      </div>
    </header>
  );
}
