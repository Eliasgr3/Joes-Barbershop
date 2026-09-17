'use client';

import { useState } from 'react';
import { StepShell } from '@/components/booking/StepShell';

type Props = {
  initialName: string;
  initialPhone: string;
  initialEmail: string;
  onSubmit: (values: { name: string; phone: string; email: string }) => void;
  onBack?: () => void;
};

function Field({
  label,
  hint,
  ...input
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[11px] tracking-[0.14em] text-mute uppercase">{label}</span>
        {hint && <span className="text-xs text-mute">{hint}</span>}
      </span>
      <input
        {...input}
        className="w-full border-b border-line bg-transparent py-3 text-lg transition-colors outline-none placeholder:text-mute/50 focus:border-ink"
      />
    </label>
  );
}

export function ContactDetailsStep({ initialName, initialPhone, initialEmail, onSubmit, onBack }: Props) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);
  const canContinue = name.trim().length >= 2 && phone.trim().length >= 8;

  return (
    <StepShell title="Τα στοιχεία σου" hint="Για να σε βρούμε αν χρειαστεί ν' αλλάξει κάτι." onBack={onBack}>
      <form
        className="flex flex-col gap-7"
        onSubmit={(e) => {
          e.preventDefault();
          if (canContinue) onSubmit({ name: name.trim(), phone: phone.trim(), email: email.trim() });
        }}
      >
        <Field
          label="Ονοματεπώνυμο"
          type="text"
          required
          autoComplete="name"
          placeholder="Γιάννης Παπαδόπουλος"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Field
          label="Τηλέφωνο"
          type="tel"
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="69XXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Field
          label="Email"
          hint="προαιρετικό"
          type="email"
          autoComplete="email"
          placeholder="Για επιβεβαίωση με email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={!canContinue}
          className="mt-2 bg-ink px-6 py-4.5 text-[15px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
        >
          Συνέχεια
        </button>
      </form>
    </StepShell>
  );
}
