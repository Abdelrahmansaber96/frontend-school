import { cn } from '@/lib/utils';

interface AlertBannerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

const variants = {
  info: 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400/80',
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400/80',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-900 dark:text-amber-300/90',
  error: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400/80',
};

export default function AlertBanner({ children, className, variant = 'info' }: AlertBannerProps) {
  return (
    <div className={cn('rounded-xl border px-4 py-3 text-sm', variants[variant], className)}>
      {children}
    </div>
  );
}