import { cn } from '@/lib/utils';

interface AnalyticsPanelProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export default function AnalyticsPanel({
  title,
  subtitle,
  badge,
  action,
  className,
  children,
}: AnalyticsPanelProps) {
  return (
    <section
      className={cn(
        'glass-card glass-shine relative overflow-hidden rounded-[28px] border border-stroke p-5 shadow-[0_12px_50px_rgba(2,6,23,0.28)]',
        'before:pointer-events-none before:absolute before:-right-16 before:top-0 before:h-36 before:w-36 before:rounded-full before:bg-gold-400/10 before:blur-3xl',
        className,
      )}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            {badge ? (
              <span className="rounded-full border border-gold-400/25 bg-gold-400/10 px-2.5 py-1 text-[11px] font-medium text-gold-400">
                {badge}
              </span>
            ) : null}
          </div>
          {subtitle ? <p className="mt-1 text-sm text-ink-faint">{subtitle}</p> : null}
        </div>
        {action}
      </div>

      {children}
    </section>
  );
}