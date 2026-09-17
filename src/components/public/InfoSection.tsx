import { SHOP_INFO } from '@/lib/constants';

const HOURS = [
  ['Δευτέρα', '09:00 – 17:00'],
  ['Τρίτη', '11:00 – 20:00'],
  ['Τετάρτη', '11:00 – 20:00'],
  ['Πέμπτη', '11:00 – 20:00'],
  ['Παρασκευή', '11:00 – 20:00'],
  ['Σάββατο', '09:00 – 17:00'],
  ['Κυριακή', 'Κλειστά'],
];

export function InfoSection() {
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP_INFO.mapsQuery)}`;
  const mapsEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(SHOP_INFO.mapsQuery)}&output=embed`;

  return (
    <section className="bg-stone py-[60px]">
      <div className="mx-auto grid max-w-[1040px] gap-10 px-[22px] md:grid-cols-2 md:gap-14">
        <div>
          <h2 className="mb-[26px] text-[clamp(30px,7vw,46px)] font-black uppercase">Ώρες</h2>
          <table className="w-full border-collapse text-[15px]">
            <tbody>
              {HOURS.map(([day, hours]) => (
                <tr key={day}>
                  <td className="border-b border-line py-[11px]">{day}</td>
                  <td className="border-b border-line py-[11px] text-right text-mute">{hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="mb-[26px] text-[clamp(30px,7vw,46px)] font-black uppercase">Πού θα μας βρεις</h2>
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener"
            className="block border-b border-line py-[13px] text-[15px] no-underline"
          >
            <span className="mb-[3px] block text-xs text-mute">Διεύθυνση</span>
            {SHOP_INFO.address}
          </a>
          <a href={`tel:${SHOP_INFO.phone}`} className="block border-b border-line py-[13px] text-[15px] no-underline">
            <span className="mb-[3px] block text-xs text-mute">Τηλέφωνο</span>
            {SHOP_INFO.phoneDisplay}
          </a>
          <div className="mt-[18px] aspect-[16/10] overflow-hidden border border-line">
            <iframe
              title="Χάρτης"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapsEmbedSrc}
              className="h-full w-full border-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
