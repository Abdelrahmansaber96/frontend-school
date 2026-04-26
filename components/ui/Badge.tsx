import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}

const variants = {
  default: 'bg-glaze/[0.06] text-ink-dim ring-stroke',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400/80 ring-emerald-500/10',
  warning: 'bg-gold-500/10 text-gold-600 dark:text-gold-400/80 ring-gold-500/10',
  danger: 'bg-red-500/10 text-red-600 dark:text-red-400/80 ring-red-500/10',
  info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400/80 ring-blue-500/10',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400/80 ring-purple-500/10',
};

export default function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
