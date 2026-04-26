import { cn, getInitials } from '@/lib/utils';
import ExternalImage from './ExternalImage';

interface AvatarProps {
  name?: { first: string; last: string } | null;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-[12px]', lg: 'h-11 w-11 text-sm', xl: 'h-14 w-14 text-base' };
const pixelSizes = { sm: 28, md: 36, lg: 44, xl: 56 };

export default function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <ExternalImage
        src={src}
        alt={name ? `${name.first} ${name.last}` : 'avatar'}
        width={pixelSizes[size]}
        height={pixelSizes[size]}
        className={cn('rounded-full object-cover ring-1 ring-stroke', sizes[size], className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-glaze/[0.08] to-glaze/[0.03] font-semibold text-gold-400/80 ring-1 ring-stroke',
        sizes[size],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
