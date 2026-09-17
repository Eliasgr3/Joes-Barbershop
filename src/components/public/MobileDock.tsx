import Link from 'next/link';
import { SHOP_INFO } from '@/lib/constants';

export function MobileDock() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[80] flex border-t border-line bg-paper md:hidden">
      <a href={`tel:${SHOP_INFO.phone}`} className="flex-1 py-[19px] text-center text-[15px] font-semibold no-underline">
        Κλήση
      </a>
      <Link href="/book" className="flex-1 bg-ink py-[19px] text-center text-[15px] font-semibold text-white no-underline">
        Κλείσε ραντεβού
      </Link>
    </nav>
  );
}
