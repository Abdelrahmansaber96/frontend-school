import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 animate-fade-in sm:flex-row sm:items-start sm:justify-between', className)}>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-ink-dim">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}
