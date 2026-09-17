import { SHOP_TIMEZONE } from '@/lib/constants';

type Props = { byDay: [string, number][] };

function euros(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.00', '')}€`;
}

function dayLabel(iso: string): string {
  return new Intl.DateTimeFormat('el-GR', { timeZone: SHOP_TIMEZONE, day: 'numeric', month: 'numeric' }).format(
    new Date(`${iso}T12:00:00Z`),
  );
}

const W = 720;
const H = 200;
const PAD_BOTTOM = 26;
const PAD_TOP = 26;
const GAP = 2;

/**
 * Daily takings across the selected range. One series, so the heading names it and no
 * legend box is needed; the peak is labelled directly rather than every bar carrying a
 * number, and the full figures live in the table below.
 */
export function RevenueChart({ byDay }: Props) {
  if (byDay.length < 2) return null;

  const max = Math.max(...byDay.map(([, cents]) => cents), 1);
  const plotHeight = H - PAD_BOTTOM - PAD_TOP;
  const slot = W / byDay.length;
  const barWidth = Math.max(slot - GAP, 1);
  const peakIndex = byDay.reduce((best, [, cents], i) => (cents > byDay[best][1] ? i : best), 0);
  const labelEvery = Math.ceil(byDay.length / 12);

  return (
    <figure className="bg-ink px-6 py-6">
      <figcaption className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="text-[11px] tracking-[0.14em] text-white/40 uppercase">Έσοδα ανά ημέρα</h2>
        <span className="tnum text-xs text-white/40">Κορύφωση {euros(max)}</span>
      </figcaption>

      {/* Below ~560px the bars and their date labels stop being legible, so the plot scrolls
          sideways at a readable size rather than shrinking to fit the phone. */}
      <div className="on-ink overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[560px]"
          role="img"
          aria-label={`Ραβδόγραμμα εσόδων ανά ημέρα, ${byDay.length} ημέρες, μέγιστο ${euros(max)}`}
        >
          <line x1="0" y1={H - PAD_BOTTOM} x2={W} y2={H - PAD_BOTTOM} stroke="#ffffff" strokeOpacity="0.15" />

          {byDay.map(([iso, cents], i) => {
            const barHeight = Math.max((cents / max) * plotHeight, cents > 0 ? 2 : 0);
            const x = i * slot + GAP / 2;
            const y = H - PAD_BOTTOM - barHeight;
            const isPeak = i === peakIndex;

            return (
              <g key={iso} className="group">
                <rect x={x} y={PAD_TOP} width={barWidth} height={plotHeight} fill="transparent" />
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="var(--color-brass)"
                  fillOpacity={isPeak ? 1 : 0.62}
                  className="transition-[fill-opacity] duration-200 group-hover:[fill-opacity:1]"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="700"
                  fill="#ffffff"
                  className={`tnum ${isPeak ? '' : 'opacity-0 transition-opacity duration-200 group-hover:opacity-100'}`}
                >
                  {euros(cents)}
                </text>
                {i % labelEvery === 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={H - 8}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#ffffff"
                    fillOpacity="0.45"
                    className="tnum"
                  >
                    {dayLabel(iso)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <details className="mt-5 border-t border-white/10 pt-4">
        <summary className="cursor-pointer text-xs text-white/40 transition-colors hover:text-white">
          Δες τους αριθμούς σε πίνακα
        </summary>
        <table className="tnum mt-4 w-full text-sm text-white/70">
          <thead>
            <tr className="text-left text-[11px] tracking-[0.14em] text-white/35 uppercase">
              <th className="pb-2 font-normal">Ημέρα</th>
              <th className="pb-2 text-right font-normal">Έσοδα</th>
            </tr>
          </thead>
          <tbody>
            {byDay.map(([iso, cents]) => (
              <tr key={iso} className="border-t border-white/5">
                <td className="py-1.5">{dayLabel(iso)}</td>
                <td className="py-1.5 text-right">{euros(cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
