import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary: 'bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 text-navy-950 font-semibold hover:shadow-[0_0_24px_rgba(200,162,77,0.25)] active:scale-[0.98] focus-visible:ring-gold-500/50',
  secondary: 'bg-glaze/[0.06] text-ink-muted border border-stroke hover:bg-glaze/[0.10] hover:text-ink hover:border-stroke-strong focus-visible:ring-stroke-strong',
  danger: 'bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/20 hover:bg-red-500/30 active:scale-[0.98] focus-visible:ring-red-500/30',
  ghost: 'bg-transparent text-ink-dim hover:bg-glaze/[0.06] hover:text-ink focus-visible:ring-stroke-strong',
  outline: 'border border-stroke bg-transparent text-ink-muted hover:bg-glaze/[0.04] hover:text-ink hover:border-stroke-strong focus-visible:ring-stroke-strong',
};

const sizes = {
  sm: 'px-3 py-1.5 text-[12px]',
  md: 'px-4 py-2 text-[13px]',
  lg: 'px-5 py-2.5 text-sm',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
        'disabled:pointer-events-none disabled:opacity-40',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
export default Button;
