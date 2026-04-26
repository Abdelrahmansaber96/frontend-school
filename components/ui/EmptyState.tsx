import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title = 'لا توجد بيانات',
  description = 'جرّب تعديل الفلاتير أو أضف سجلاً جديداً.',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center animate-fade-in', className)}>
      <div className="mb-5 rounded-2xl border border-stroke bg-glaze/[0.02] p-5">
        <Inbox className="h-8 w-8 text-ink-faint" />
      </div>
      <h3 className="text-[15px] font-semibold text-ink-dim">{title}</h3>
      <p className="mt-1.5 max-w-xs text-[13px] text-ink-faint">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
