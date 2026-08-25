'use client';

import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function Section({ children, className = '', id }: SectionProps) {
  return (
    <section id={id} className={`relative px-4 py-20 sm:px-6 md:py-24 lg:px-8 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function SectionTitle({
  children,
  subtitle,
}: {
  children: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-16">
      <h2 className="mb-4 text-3xl font-black text-[#123B5D] dark:text-white md:text-4xl lg:text-5xl">{children}</h2>
      {subtitle && (
        <p className="mx-auto max-w-2xl text-base leading-8 text-slate-500 dark:text-slate-300 md:text-lg">{subtitle}</p>
      )}
      <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-[#0B5D4B] via-[#14866D] to-[#B89647]" />
    </div>
  );
}
