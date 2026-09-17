import { ShowcaseCrossfade } from '@/components/public/ShowcaseCrossfade';

export function ShowcaseSection() {
  return (
    <section className="bg-ink py-14">
      <div className="mx-auto max-w-[1040px] px-[22px]">
        <p className="mb-2 text-[13px] text-[#9C9A96]">Δείγμα δουλειάς</p>
        <h2 className="mb-[26px] text-[clamp(30px,7vw,46px)] font-black uppercase text-white">
          Μερικές από τις δουλειές μας
        </h2>
      </div>
      <div className="mx-auto max-w-[1040px] px-[22px]">
        <ShowcaseCrossfade />
      </div>
    </section>
  );
}
