import type { LucideIcon } from 'lucide-react';
import { ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RestrictedAccessStateProps {
  description: string;
  title?: string;
  icon?: LucideIcon;
  className?: string;
}

export default function RestrictedAccessState({
  description,
  title = 'وصول مقيد',
  icon: Icon = ShieldAlert,
  className,
}: RestrictedAccessStateProps) {
  return (
    <div className={cn('flex flex-col items-center py-20 text-center', className)}>
      <div className="rounded-2xl border border-stroke bg-glaze/[0.02] p-4">
        <Icon className="h-10 w-10 text-ink-faint" />
      </div>
      <p className="mt-4 text-lg font-medium text-ink-dim">{title}</p>
      <p className="mt-1 max-w-md text-sm text-ink-faint">{description}</p>
    </div>
  );
}