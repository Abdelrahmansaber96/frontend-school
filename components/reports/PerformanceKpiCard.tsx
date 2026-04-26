'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceKpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  accentClassName: string;
  glowClassName: string;
  delay?: number;
}

export default function PerformanceKpiCard({
  title,
  value,
  description,
  icon: Icon,
  accentClassName,
  glowClassName,
  delay = 0,
}: PerformanceKpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="glass-card glass-shine relative overflow-hidden rounded-[24px] border border-stroke p-5"
    >
      <div className={cn('pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl', glowClassName)} />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-ink-faint">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{value}</p>
          <p className="mt-2 text-xs text-ink-dim">{description}</p>
        </div>

        <div className={cn('rounded-2xl border p-3', accentClassName)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}