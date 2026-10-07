'use client';

import { useId, useState } from 'react';
import { matchCustomers, type KnownCustomer } from '@/lib/customer-search';
import { input, label } from '@/components/admin/styles';

type Props = {
  customers: KnownCustomer[];
  value: string;
  onChange: (name: string) => void;
  onPick: (customer: KnownCustomer) => void;
};

/**
 * Customer-name input that suggests people from past bookings as the barber types.
 * Picking a suggestion hands back the phone as well; typing a brand-new name just works.
 */
export function CustomerNameField({ customers, value, onChange, onPick }: Props) {
  const inputId = useId();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const matches = open ? matchCustomers(customers, value) : [];
  const showList = matches.length > 0;

  function pick(customer: KnownCustomer) {
    onPick(customer);
    setOpen(false);
    setHighlighted(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => (i <= 0 ? matches.length - 1 : i - 1));
    } else if (e.key === 'Enter' && highlighted >= 0) {
      // Enter on a highlighted suggestion picks it instead of submitting the whole form.
      e.preventDefault();
      pick(matches[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlighted(-1);
    }
  }

  return (
    <div className="relative">
      <label htmlFor={inputId} className={label}>
        Όνομα πελάτη
      </label>
      <input
        id={inputId}
        type="text"
        name="customerName"
        required
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlighted(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        className={input}
      />

      {showList && (
        <ul
          id={listId}
          role="listbox"
          // At least as wide as the field, but free to grow so full names and phones aren't cut off.
          className="absolute top-full left-0 z-20 mt-1 max-h-72 w-max max-w-[min(92vw,26rem)] min-w-full overflow-y-auto border border-ink bg-paper shadow-[0_8px_24px_rgba(16,16,16,0.12)]"
        >
          {matches.map((customer, i) => (
            <li
              key={`${customer.name}|${customer.phone}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === highlighted}
              // mousedown, not click: the input's blur would close the list before a click lands.
              onMouseDown={(e) => {
                e.preventDefault();
                pick(customer);
              }}
              onMouseEnter={() => setHighlighted(i)}
              className={`flex cursor-pointer items-baseline justify-between gap-3 border-b border-line px-3 py-2.5 text-sm last:border-b-0 ${
                i === highlighted ? 'bg-ink text-white' : ''
              }`}
            >
              <span className="min-w-0 truncate font-medium">{customer.name}</span>
              <span className={`tnum shrink-0 text-xs ${i === highlighted ? 'text-white/70' : 'text-mute'}`}>
                {customer.phone}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
