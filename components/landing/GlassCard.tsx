'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : undefined}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`
        relative overflow-hidden
        bg-white/90 dark:bg-white/[0.05] backdrop-blur-xl
        border border-[#0B5D4B]/10 dark:border-white/[0.1]
        rounded-2xl
        shadow-[0_12px_34px_rgba(18,59,93,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.2)]
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Top shine line */}
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#14866D]/30 to-transparent dark:via-white/20" />
      {children}
    </motion.div>
  );
}
