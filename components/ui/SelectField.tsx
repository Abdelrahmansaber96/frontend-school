import { cn } from '@/lib/utils';
import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(({
  label,
  error,
  hint,
  className,
  containerClassName,
  id,
  children,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-ink-dim">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={cn(
          'w-full rounded-xl border border-stroke bg-glaze/[0.03] px-3.5 py-2.5 text-[13px] text-ink outline-none',
          'focus:border-gold-500/40 focus:bg-glaze/[0.05] focus:ring-1 focus:ring-gold-500/20',
          'transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-400/40 focus:border-red-500/50 focus:ring-red-500/15',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-[11px] text-red-500 dark:text-red-400/80">{error}</p>}
      {hint && !error && <p className="text-[11px] text-ink-faint">{hint}</p>}
    </div>
  );
});

SelectField.displayName = 'SelectField';

export default SelectField;