import { School } from 'lucide-react';
import type { SchoolBranding } from '@/types';
import { cn } from '@/lib/utils';
import ExternalImage from './ExternalImage';

interface SchoolLogoProps {
  alt: string;
  src?: string | null;
  branding?: Partial<SchoolBranding> | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  priority?: boolean;
}

const sizeConfig = {
  sm: { boxClassName: 'h-9 w-9', pixels: 36, iconClassName: 'h-4.5 w-4.5' },
  md: { boxClassName: 'h-12 w-12', pixels: 48, iconClassName: 'h-6 w-6' },
  lg: { boxClassName: 'h-14 w-14', pixels: 56, iconClassName: 'h-7 w-7' },
};

export default function SchoolLogo({
  alt,
  src,
  branding,
  size = 'md',
  className,
  priority,
}: SchoolLogoProps) {
  const config = sizeConfig[size];

  if (src) {
    return (
      <ExternalImage
        src={src}
        alt={alt}
        width={config.pixels}
        height={config.pixels}
        priority={priority}
        className={cn(config.boxClassName, 'rounded-xl object-cover', className)}
      />
    );
  }

  const primaryColor = branding?.primaryColor || '#C8A24D';

  return (
    <div
      className={cn('flex items-center justify-center rounded-xl', config.boxClassName, className)}
      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
    >
      <School className={cn(config.iconClassName, 'text-navy-950')} />
    </div>
  );
}