import { ReactNode } from 'react';

export default function DashboardSection({ title, description, action, children, className = '' }: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-stroke bg-glaze/[0.025] ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-stroke px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description && <p className="mt-1 text-xs text-ink-dim">{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
