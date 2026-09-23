import Image from 'next/image';
import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-[60] bg-ink/96 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1040px] items-center justify-between px-[22px]">
        <Image src="/images/logo.png" alt="Joe’s Barbershop" width={140} height={36} className="h-9 w-auto" priority />
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/manage"
            className="text-sm font-semibold text-white/70 no-underline transition-colors hover:text-white"
          >
            Το ραντεβού μου
          </Link>
          <Link
            href="/book"
            className="bg-white px-[18px] py-[9px] text-sm font-semibold text-ink no-underline"
          >
            Κλείσε ραντεβού
          </Link>
        </div>
      </div>
    </header>
  );
}
