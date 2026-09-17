/**
 * The torn-stub edge of a ticket. Painted as an overlay strip in the colour of whatever
 * sits behind the ticket, rather than as a CSS mask on the panel itself — a mask sized
 * against the panel clips real content when the box is taller than it predicts.
 */
export function TicketEdge({ notchColor, radius = 10 }: { notchColor: string; radius?: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0"
      style={{
        height: radius,
        backgroundImage: `radial-gradient(circle ${radius}px at ${radius}px ${radius}px, ${notchColor} 98%, transparent 100%)`,
        backgroundSize: `${radius * 2}px ${radius}px`,
        backgroundRepeat: 'repeat-x',
      }}
    />
  );
}
