import { cn } from '@/lib/utils';

type BrandLogoVariant = 'mark' | 'wordmark' | 'adminShield';
type BrandLogoSize = 'sm' | 'md' | 'lg';

const sizes = {
  sm: { mark: 'h-9 w-9', shield: 'h-9 w-9', wordmark: 'h-9' },
  md: { mark: 'h-12 w-12', shield: 'h-12 w-12', wordmark: 'h-12' },
  lg: { mark: 'h-16 w-16', shield: 'h-16 w-16', wordmark: 'h-16' },
};

function BasmaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <defs><linearGradient id="basma-green" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse"><stop stopColor="#14866D" /><stop offset="1" stopColor="#0B5D4B" /></linearGradient></defs>
      <rect width="64" height="64" rx="18" fill="#E9F4EF" />
      <path d="M32 12c-10.2 0-18.5 8.2-18.5 18.4 0 7.2 3.2 13.5 8.5 17.7" stroke="url(#basma-green)" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 19c-6.3 0-11.4 5.1-11.4 11.4 0 5.4 2.1 10.5 5.9 14.1" stroke="url(#basma-green)" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 26c-2.4 0-4.4 2-4.4 4.4 0 8.1-1.1 13-4.1 18.2" stroke="url(#basma-green)" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 12c10.2 0 18.5 8.2 18.5 18.4 0 11.4-5.8 18.3-13.3 24.1" stroke="url(#basma-green)" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 19c6.3 0 11.4 5.1 11.4 11.4 0 7.6-3.7 13.4-10.4 18.8" stroke="url(#basma-green)" strokeWidth="4" strokeLinecap="round" />
      <path d="M32 26c2.4 0 4.4 2 4.4 4.4 0 5.1-1.7 10.7-5.7 15.5" stroke="url(#basma-green)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="31" r="3.5" fill="#B89647" />
    </svg>
  );
}

function AdminShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <defs><linearGradient id="shield-green" x1="13" y1="14" x2="51" y2="53" gradientUnits="userSpaceOnUse"><stop stopColor="#14866D" /><stop offset="1" stopColor="#123B5D" /></linearGradient></defs>
      <rect width="64" height="64" rx="18" fill="#F4F3EA" />
      <path d="M23 17l4-6 5 4 5-4 4 6-2 4H25l-2-4z" fill="#B89647" />
      <path d="M32 17c6.5 4.5 12.3 3.7 16 4.4v13.2C48 45.1 40.7 51.1 32 55c-8.7-3.9-16-9.9-16-20.4V21.4c3.7-.7 9.5.1 16-4.4z" fill="url(#shield-green)" stroke="#B89647" strokeWidth="2" />
      <path d="M32 23c4.5 3.1 8.5 2.6 11 3v8.5c0 7.3-4.5 12.1-11 15.2-6.5-3.1-11-7.9-11-15.2V26c2.5-.4 6.5.1 11-3z" stroke="#F4F3EA" strokeWidth="2" />
      <path d="M27.5 35.5l3 3 6.5-7" stroke="#F4F3EA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BrandLogo({ variant = 'wordmark', size = 'md', className, showEnglish = false }: {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  className?: string;
  showEnglish?: boolean;
}) {
  if (variant === 'mark') return <BasmaMark className={cn(sizes[size].mark, className)} />;
  if (variant === 'adminShield') return <AdminShield className={cn(sizes[size].shield, className)} />;

  return (
    <div className={cn('inline-flex items-center gap-2.5', sizes[size].wordmark, className)}>
      <BasmaMark className="h-full w-auto" />
      <span className="leading-tight">
        <span className="block text-lg font-black tracking-tight text-[#0B5D4B]">بصمة</span>
        <span className="block text-[9px] font-bold text-[#123B5D]">{showEnglish ? 'BASMA EDUCATION' : 'منصة بصمة التعليمية'}</span>
      </span>
    </div>
  );
}
