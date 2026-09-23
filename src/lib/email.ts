import 'server-only';
import { Resend } from 'resend';
import { SHOP_INFO } from '@/lib/constants';

type ConfirmationEmailArgs = {
  to: string;
  customerName: string;
  serviceName: string;
  barberName: string;
  startsAtIso: string;
  priceCents: number;
  appointmentId: string;
};

function formatAthensDateTime(iso: string): string {
  return new Intl.DateTimeFormat('el-GR', {
    timeZone: 'Europe/Athens',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso));
}

/**
 * Sends the booking confirmation email. Silently no-ops (logs, doesn't throw) when
 * RESEND_API_KEY isn't configured yet, so a missing email provider never blocks a booking
 * from being saved — it's a nice-to-have layered on top of the appointment insert, not a
 * dependency of it.
 */
export async function sendBookingConfirmationEmail(args: ConfirmationEmailArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping confirmation email.');
    return false;
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || 'Joe’s Barbershop <onboarding@resend.dev>';
  // NEXT_PUBLIC_SITE_URL wins if set; Netlify injects URL automatically for the deployed site.
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.URL ||
    'https://joesbarbershopgr.netlify.app'
  ).replace(/\/$/, '');
  const cancelUrl = `${siteUrl}/cancel/${args.appointmentId}`;
  const when = formatAthensDateTime(args.startsAtIso);
  const price = (args.priceCents / 100).toFixed(2).replace('.', ',');

  const { error } = await resend.emails.send({
    from,
    to: args.to,
    subject: `Επιβεβαίωση ραντεβού — ${when}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#101010">
        <h2 style="margin:0 0 16px">Joe's Barbershop</h2>
        <p>Γεια σου ${escapeHtml(args.customerName)},</p>
        <p>Το ραντεβού σου επιβεβαιώθηκε:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:6px 0;color:#6e6e6b">Υπηρεσία</td><td style="padding:6px 0;text-align:right">${escapeHtml(args.serviceName)}</td></tr>
          <tr><td style="padding:6px 0;color:#6e6e6b">Κουρέας</td><td style="padding:6px 0;text-align:right">${escapeHtml(args.barberName)}</td></tr>
          <tr><td style="padding:6px 0;color:#6e6e6b">Ημερομηνία & ώρα</td><td style="padding:6px 0;text-align:right">${when}</td></tr>
          <tr><td style="padding:6px 0;color:#6e6e6b">Τιμή</td><td style="padding:6px 0;text-align:right">${price}€ (πληρωμή στο κατάστημα)</td></tr>
        </table>
        <p style="color:#6e6e6b">${escapeHtml(SHOP_INFO.address)} · ${SHOP_INFO.phoneDisplay}</p>
        <p style="font-size:13px;color:#6e6e6b">
          Άλλαξαν τα σχέδιά σου;
          <a href="${cancelUrl}" style="color:#101010">Ακύρωσε το ραντεβού σου</a>
          ή κάλεσέ μας στο ${SHOP_INFO.phoneDisplay}.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('[email] Resend error:', error);
    return false;
  }
  return true;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
