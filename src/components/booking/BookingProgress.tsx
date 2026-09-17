type Props = {
  steps: { key: string; label: string }[];
  activeIndex: number;
};

export function BookingProgress({ steps, activeIndex }: Props) {
  return (
    <ol className="flex gap-2" aria-label="Πρόοδος κράτησης">
      {steps.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <li key={step.key} className="flex-1" aria-current={active ? 'step' : undefined}>
            <span
              className={`block h-px w-full transition-colors duration-500 ${
                done || active ? 'bg-brass' : 'bg-white/20'
              }`}
            />
            <span
              className={`mt-3 block text-[11px] tracking-[0.14em] uppercase transition-colors duration-500 ${
                active ? 'text-brass' : done ? 'text-white/55' : 'text-white/30'
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
