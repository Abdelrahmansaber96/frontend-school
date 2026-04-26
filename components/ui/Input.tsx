import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-ink-dim">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border border-stroke bg-glaze/[0.03] px-3.5 py-2.5 text-[13px] text-ink outline-none',
            'placeholder:text-ink-faint',
            'focus:border-gold-500/40 focus:bg-glaze/[0.05] focus:ring-1 focus:ring-gold-500/20',
            'transition-all duration-200',
            'disabled:cursor-not-allowed disabled:bg-glaze/[0.02] disabled:text-ink-faint',
            error && 'border-red-400/40 focus:border-red-500/50 focus:ring-red-500/15',
            className,
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-red-500 dark:text-red-400/80">{error}</p>}
        {hint && !error && <p className="text-[11px] text-ink-faint">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
export default Input;
