type IconProps = {
  className?: string;
  strokeWidth?: number;
};

/**
 * One drawn icon set, single stroke weight, 24px grid — matching the razor-thin
 * calendar glyph the original site shipped in its hero button.
 */
function Svg({ className = 'h-4 w-4', strokeWidth = 1.75, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const ChevronLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 5 8 12l7 7" />
  </Svg>
);

export const ChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 5 7 7-7 7" />
  </Svg>
);

export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="1" />
    <path d="M8 3v4M16 3v4M3 11h18" />
  </Svg>
);

export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.2 2" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4 12.5 5 5L20 6.5" />
  </Svg>
);

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7.5 3.5h-3a1 1 0 0 0-1 1.1c.6 8 6.9 14.3 14.9 14.9a1 1 0 0 0 1.1-1v-3a1 1 0 0 0-.8-1l-3-.6a1 1 0 0 0-1 .4l-1 1.3a14.5 14.5 0 0 1-5.8-5.8l1.3-1a1 1 0 0 0 .4-1l-.6-3a1 1 0 0 0-1-.8Z" />
  </Svg>
);

export const UserIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20.5c1-4 3.9-6 7.5-6s6.5 2 7.5 6" />
  </Svg>
);

/** Straight razor — the shop's own mark, used where a generic icon would flatten the brand. */
export const RazorIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 17.5 13.8 6.7a3.1 3.1 0 0 1 4.4 4.4L7.4 21.9" />
    <path d="M14.6 7.5 18 4.1" />
    <path d="M5.2 19.7 3 21.9" />
  </Svg>
);

export const EuroIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M17.5 5.8a6.8 6.8 0 0 0-9.8 6.2 6.8 6.8 0 0 0 9.8 6.2" />
    <path d="M4.5 10.2h8M4.5 13.8h8" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);

export const LogoutIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 8V5.5a1 1 0 0 0-1-1H5.5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V16" />
    <path d="M10 12h10m0 0-3.2-3.2M20 12l-3.2 3.2" />
  </Svg>
);

export const MapPinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21.5s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
    <circle cx="12" cy="10.2" r="2.6" />
  </Svg>
);

export const AlertIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5M12 16.2v.3" />
  </Svg>
);
