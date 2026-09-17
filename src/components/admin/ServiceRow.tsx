'use client';

import { useState } from 'react';
import { ServiceForm } from '@/components/admin/ServiceForm';
import type { Service } from '@/lib/types';

function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace('.00', '')}€`;
}

export function ServiceRow({ service }: { service: Service }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="border-b border-line bg-stone/50 p-5 last:border-b-0">
        <ServiceForm service={service} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div
      className={`border-b border-line px-5 py-4 last:border-b-0 sm:flex sm:items-center sm:justify-between sm:gap-5 ${
        service.is_active ? '' : 'opacity-50'
      }`}
    >
      <div className="min-w-0">
        <p className="font-semibold">
          {service.name}
          {!service.is_active && <span className="ml-2 text-xs font-normal text-mute">ανενεργή</span>}
        </p>
        {service.description && <p className="mt-0.5 text-sm text-mute">{service.description}</p>}
        <p className="tnum mt-0.5 text-xs text-mute">{service.duration_min} λεπτά</p>
      </div>
      {/* On a phone the price and the control sit on their own line rather than squeezing the name. */}
      <div className="mt-3 flex shrink-0 items-center justify-between gap-5 sm:mt-0 sm:justify-end">
        <span className="tnum font-display text-2xl leading-none font-black">
          {formatPrice(service.price_cents)}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="border border-line px-3 py-1.5 text-xs text-mute transition-colors hover:border-ink hover:text-ink"
        >
          Επεξεργασία
        </button>
      </div>
    </div>
  );
}
