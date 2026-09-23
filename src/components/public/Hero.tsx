import Image from 'next/image';
import Link from 'next/link';
import { SHOP_INFO } from '@/lib/constants';

export function Hero() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center bg-ink py-[54px] pb-[46px] text-center text-white">
      <div className="mx-auto w-full max-w-[1040px] px-[22px]">
        <div className="mx-auto mb-[30px] w-[clamp(150px,42vw,210px)]">
          <Image src="/images/logo.png" alt="Joe’s Barbershop" width={210} height={54} className="h-auto w-full" priority />
        </div>

        <p className="mb-[22px] flex items-center justify-center gap-4 text-[13px] tracking-[0.22em] text-[#CFCCC6]">
          <span className="h-px w-13 bg-white/35" aria-hidden />
          ΚΑΛΩΣ ΗΛΘΕΣ
          <span className="h-px w-13 bg-white/35" aria-hidden />
        </p>

        <h1 className="text-[clamp(46px,13vw,104px)] font-black uppercase">
          Joe&rsquo;s
          <br />
          Barbershop
        </h1>

        <p className="mx-auto mt-5 max-w-[30ch] text-[17px] leading-7 text-[#B9B6B0]">
          Κούρεμα και περιποίηση γενειάδας για άνδρες κάθε ηλικίας, στον Χολαργό.
        </p>

        <div className="mt-[30px] flex flex-wrap justify-center gap-x-10 gap-y-5">
          <div>
            <b className="block font-display text-[27px] font-black leading-[1.1]">12€</b>
            <span className="mt-[3px] block text-xs text-[#8E8B86]">Κούρεμα</span>
          </div>
          <div>
            <b className="block font-display text-[27px] font-black leading-[1.1]">14€</b>
            <span className="mt-[3px] block text-xs text-[#8E8B86]">Με γένια</span>
          </div>
          <div>
            <b className="block font-sans text-sm font-black leading-[1.1] tracking-[2px] text-brass">★★★★★</b>
            <span className="mt-[3px] block text-xs text-[#8E8B86]">5.0 · 73 κριτικές</span>
          </div>
        </div>

        <div className="mt-[34px] flex flex-col items-center gap-3">
          <Link
            href="/book"
            className="flex min-w-[280px] items-center justify-center gap-[10px] border border-brass bg-transparent px-[30px] py-4 text-[15px] font-semibold tracking-[0.02em] text-white no-underline"
          >
            <svg viewBox="0 0 24 24" className="h-[17px] w-[17px] stroke-brass stroke-[1.8]" fill="none">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M3 11h18" />
            </svg>
            Online Κράτηση
          </Link>
          <a
            href={`tel:${SHOP_INFO.phone}`}
            className="flex min-w-[280px] items-center justify-center gap-[10px] border border-white/22 bg-transparent px-[30px] py-4 text-[15px] font-semibold text-[#B9B6B0] no-underline"
          >
            Τηλεφώνησε · {SHOP_INFO.phoneDisplay}
          </a>
          <Link
            href="/manage"
            className="mt-1 text-sm text-white/50 underline underline-offset-4 transition-colors hover:text-white"
          >
            Έκλεισες ήδη; Δες το ραντεβού σου
          </Link>
        </div>

        <p className="mt-10 text-xs tracking-[0.2em] text-white/35">↓</p>
      </div>
    </div>
  );
}
