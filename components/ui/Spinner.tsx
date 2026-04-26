import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; className?: string }

const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  return <Loader2 className={cn('animate-spin text-gold-400/70', sizes[size], className)} />;
}

export function PageSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-stroke border-t-gold-400" />
          <div className="absolute inset-0 h-8 w-8 animate-pulse-soft rounded-full bg-gold-400/5 blur-lg" />
        </div>
        <span className="text-[12px] text-ink-faint">جاري التحميل...</span>
      </div>
    </div>
  );
}
