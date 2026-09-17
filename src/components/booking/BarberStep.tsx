import type { Barber } from '@/lib/types';
import { StepShell } from '@/components/booking/StepShell';
import { ChevronRight, RazorIcon } from '@/components/ui/Icon';

type Props = {
  barbers: Barber[];
  onSelect: (barber: Barber) => void;
};

export function BarberStep({ barbers, onSelect }: Props) {
  return (
    <StepShell title="Διάλεξε κουρέα" hint="Κάθε κουρέας έχει το δικό του πρόγραμμα.">
      <div>
        {barbers.map((barber) => (
          <button
            key={barber.id}
            type="button"
            onClick={() => onSelect(barber)}
            className="group flex w-full items-center gap-4 border-b border-line py-5 text-left transition-colors last:border-b-0 hover:bg-stone"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-ink text-brass">
              <RazorIcon className="h-5 w-5" />
            </span>
            <span className="flex-1 text-lg font-semibold">{barber.name}</span>
            <ChevronRight className="h-4 w-4 text-mute transition-transform duration-300 group-hover:translate-x-1 group-hover:text-ink" />
          </button>
        ))}
      </div>
    </StepShell>
  );
}
