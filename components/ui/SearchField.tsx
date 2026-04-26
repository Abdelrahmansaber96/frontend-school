import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  containerClassName?: string;
}

export default function SearchField({ containerClassName, className, ...props }: SearchFieldProps) {
  return (
    <div className={cn('relative', containerClassName)}>
      <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      <input
        type="text"
        className={cn(
          'w-full rounded-xl border border-stroke bg-glaze/[0.03] py-2.5 ps-9 pe-3 text-[13px] text-ink',
          'placeholder:text-ink-faint focus:border-gold-500/40 focus:bg-glaze/[0.05] focus:outline-none focus:ring-1 focus:ring-gold-500/20',
          'transition-all duration-200',
          className,
        )}
        {...props}
      />
    </div>
  );
}