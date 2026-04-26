import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: string;
  className?: string;
}

export default function StatCard({ title, value, icon: Icon, iconColor = 'text-gold-400', trend, className }: StatCardProps) {
  return (
    <div className={cn(
      'group relative overflow-hidden rounded-2xl border border-stroke bg-glaze/[0.02] p-5',
      'transition-all duration-300 hover:border-stroke-strong hover:bg-glaze/[0.04] hover:-translate-y-0.5',
      'animate-fade-in-up',
      className,
    )}>
      {/* Glass shine line */}
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-l from-transparent via-white/[0.08] to-transparent" />

      {/* Subtle glow on hover */}
      <div className="pointer-events-none absolute -top-12 -end-12 h-24 w-24 rounded-full bg-gold-500/0 blur-2xl transition-all duration-500 group-hover:bg-gold-500/[0.06]" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[13px] font-medium text-ink-dim">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-ink animate-number-tick">{value}</p>
          {trend && (
            <p className="text-[11px] font-medium text-gold-400/80">{trend}</p>
          )}
        </div>
        <div className="rounded-xl border border-stroke bg-glaze/[0.03] p-2.5 transition-colors duration-300 group-hover:border-stroke-strong group-hover:bg-glaze/[0.06]">
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>
    </div>
  );
}
