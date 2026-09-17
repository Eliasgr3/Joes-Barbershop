import { ChevronLeft } from '@/components/ui/Icon';

type Props = {
  title: string;
  hint?: string;
  onBack?: () => void;
  children: React.ReactNode;
};

export function StepShell({ title, hint, onBack, children }: Props) {
  return (
    <div className="rise">
      <div className="mb-7">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-4 -ml-1 inline-flex items-center gap-1 py-1 text-sm text-mute transition-colors hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
            Πίσω
          </button>
        )}
        <h1 className="text-[clamp(28px,5vw,40px)] font-black uppercase">{title}</h1>
        {hint && <p className="mt-3 max-w-[46ch] text-sm text-mute">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
