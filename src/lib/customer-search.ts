export type KnownCustomer = { name: string; phone: string };

/** Lowercase, accent-free, final-sigma-free, so "Η", "η", "ή" and "ηλιασ"/"Ηλίας" all compare equal. */
export function normalizeName(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/ς/g, 'σ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '').slice(-10);
}

/**
 * Collapses raw booking rows (newest first) into one entry per person. The same name with a
 * different phone stays separate: the shop has several customers called Γιώργος.
 */
export function dedupeCustomers(rows: { customer_name: string; customer_phone: string }[]): KnownCustomer[] {
  const seen = new Set<string>();
  const out: KnownCustomer[] = [];
  for (const row of rows) {
    const name = row.customer_name.replace(/\s+/g, ' ').trim();
    if (!name) continue;
    const key = `${normalizeName(name)}|${normalizePhone(row.customer_phone)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name, phone: row.customer_phone.trim() });
  }
  return out;
}

/**
 * Names matching what has been typed so far. A match at the start of the full name ranks
 * above a match at the start of a later word (a surname); input order (most recent first)
 * is kept within each group.
 */
export function matchCustomers(customers: KnownCustomer[], typed: string, limit = 8): KnownCustomer[] {
  const query = normalizeName(typed);
  if (!query) return [];

  const startsFull: KnownCustomer[] = [];
  const startsWord: KnownCustomer[] = [];
  for (const customer of customers) {
    const name = normalizeName(customer.name);
    if (name.startsWith(query)) startsFull.push(customer);
    else if (name.split(' ').some((word) => word.startsWith(query))) startsWord.push(customer);
  }
  return [...startsFull, ...startsWord].slice(0, limit);
}
