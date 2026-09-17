import Link from 'next/link';
import { SHOP_INFO } from '@/lib/constants';
import { RazorIcon } from '@/components/ui/Icon';

export function SiteFooter() {
  return (
    // Extra bottom padding on mobile so the fixed call/book dock never covers the staff link.
    <footer className="bg-ink pt-9 pb-[92px] text-[13px] text-[#8B8985] md:pb-9">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-5 px-[22px] sm:flex-row sm:items-center sm:justify-between">
        <p>
          {SHOP_INFO.name} · {SHOP_INFO.address} ·{' '}
          <a href={`tel:${SHOP_INFO.phone}`} className="text-[#8B8985] hover:text-white">
            {SHOP_INFO.phoneDisplay}
          </a>
        </p>
        <Link
          href="/admin"
          className="inline-flex shrink-0 items-center justify-center gap-2 border border-white/15 px-4 py-2.5 text-xs font-semibold tracking-[0.1em] text-[#8B8985] uppercase no-underline transition-colors hover:border-brass hover:text-brass"
        >
          <RazorIcon className="h-3.5 w-3.5" />
          Για κουρείς
        </Link>
      </div>
    </footer>
  );
}
