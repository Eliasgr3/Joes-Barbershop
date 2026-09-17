export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div>
        <h1 className="text-[clamp(26px,4vw,36px)] font-black uppercase">{title}</h1>
        {subtitle && <p className="mt-2 max-w-[56ch] text-sm text-mute">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = '',
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-line bg-paper ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          {title && <h2 className="text-[11px] tracking-[0.14em] text-mute uppercase">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="px-5 py-14 text-center">
      {icon && <div className="mx-auto mb-3 flex justify-center text-mute">{icon}</div>}
      <p className="font-semibold">{title}</p>
      {description && <p className="mx-auto mt-1.5 max-w-[42ch] text-sm text-mute">{description}</p>}
    </div>
  );
}
