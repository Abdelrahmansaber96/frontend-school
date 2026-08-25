'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, GraduationCap, BookOpen, CheckSquare, Flag, KeyRound,
  MessageSquare, Bell, BarChart3, School, X, ChevronRight, Baby, UserCircle, UsersRound, UploadCloud, NotebookPen,
} from 'lucide-react';
import { cn, fullName } from '@/lib/utils';
import { hasAnyRole } from '@/lib/role-access';
import { useAuthStore } from '@/store/auth.store';
import { useSchoolBrandingStore } from '@/store/branding.store';
import { Role } from '@/types';
import Avatar from '@/components/ui/Avatar';
import SchoolLogo from '@/components/ui/SchoolLogo';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
}

const navItems: NavItem[] = [
  { label: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'school_admin', 'teacher', 'administrative', 'parent', 'student'] },
  { label: 'المدارس', href: '/schools', icon: School, roles: ['super_admin'] },
  { label: 'أكواد تسجيل المدارس', href: '/registration-invites', icon: KeyRound, roles: ['super_admin'] },
  { label: 'الحسابات', href: '/accounts', icon: UsersRound, roles: ['school_admin'] },
  { label: 'طلبات استعادة الطلاب', href: '/recovery-requests', icon: KeyRound, roles: ['school_admin'] },
  { label: 'المعلمون', href: '/teachers', icon: BookOpen, roles: ['super_admin', 'school_admin'] },
  { label: 'المواد الدراسية', href: '/subjects', icon: BookOpen, roles: ['school_admin', 'teacher', 'student'] },
  { label: 'الطلاب', href: '/students', icon: GraduationCap, roles: ['super_admin', 'school_admin', 'teacher'] },
  { label: 'أبنائي', href: '/children', icon: Baby, roles: ['parent'] },
  { label: 'الفصول الدراسية', href: '/classes', icon: BookOpen, roles: ['super_admin', 'school_admin', 'teacher'] },
  { label: 'الدرجات والاختبارات', href: '/grades', icon: NotebookPen, roles: ['school_admin', 'teacher', 'student'] },
  { label: 'الحضور والغياب', href: '/attendance', icon: CheckSquare, roles: ['super_admin', 'school_admin', 'teacher', 'parent', 'administrative'] },
  { label: 'السلوك', href: '/behavior', icon: Flag, roles: ['super_admin', 'school_admin', 'teacher', 'parent', 'administrative'] },
  { label: 'الرسائل', href: '/messages', icon: MessageSquare, roles: ['school_admin', 'teacher', 'parent'] },
  { label: 'الملفات', href: '/uploads', icon: UploadCloud, roles: ['school_admin', 'teacher'] },
  { label: 'الإشعارات', href: '/notifications', icon: Bell, roles: ['super_admin', 'school_admin', 'teacher', 'parent', 'student', 'administrative'] },
  { label: 'التقارير', href: '/reports', icon: BarChart3, roles: ['super_admin', 'school_admin', 'teacher'] },
  { label: 'الملف الشخصي', href: '/profile', icon: UserCircle, roles: ['super_admin', 'school_admin', 'teacher', 'parent', 'student', 'administrative'] },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { schoolNameAr, schoolName, logo, branding } = useSchoolBrandingStore();
  const role = user?.role;

  const visibleNavItems = navItems.filter((item) => hasAnyRole(role, item.roles));

  const displayName = schoolNameAr || schoolName || 'بصمة';
  const displaySub = schoolName && schoolNameAr ? schoolName : 'نظام إدارة مدرسي';
  const schoolLogoSrc = logo || branding.logoUrl || null;

  const content = (
    <div className="relative flex h-full flex-col border-e border-slate-200/80 bg-white/95 shadow-[-6px_0_24px_rgba(68,62,140,0.03)] backdrop-blur-2xl dark:border-white/10 dark:bg-navy-950/90">
      {/* Top shine line */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-l from-transparent via-glaze/10 to-transparent" />

      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 dark:border-white/10 lg:h-20">
        <div className="flex items-center gap-3">
          <SchoolLogo
            alt={displayName}
            src={schoolLogoSrc}
            branding={branding}
            size="sm"
            className={schoolLogoSrc ? undefined : 'gold-glow'}
          />
          <div>
            <span className="text-base font-bold text-ink tracking-tight">{displayName}</span>
            <span className="block text-[10px] font-medium text-ink-faint -mt-0.5">{displaySub}</span>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1.5 text-ink-faint hover:bg-glaze/[0.06] hover:text-ink-dim lg:hidden transition-all duration-200">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleNavItems.map((item, i) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{ animationDelay: `${i * 30}ms` }}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 animate-fade-in',
                active
                  ? 'bg-gradient-to-l from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/15'
                  : 'text-ink-dim hover:bg-violet-50 hover:text-violet-700 dark:hover:bg-violet-500/10 dark:hover:text-violet-300',
              )}
            >
              <item.icon className={cn('h-4 w-4 shrink-0 transition-colors duration-200', active ? 'text-white' : 'text-ink-faint group-hover:text-violet-600 dark:group-hover:text-violet-300')} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-3 w-3 text-white/70 me-auto rtl:rotate-180" />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      {user && (
        <div className="border-t border-stroke p-3">
          <div className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors duration-200 hover:bg-glaze/[0.04]">
            <Avatar name={user.name} size="sm" />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-ink">{fullName(user.name)}</p>
              <p className="truncate text-[11px] text-ink-faint capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] shrink-0 lg:block">
        <div className="fixed inset-y-0 w-[260px]">{content}</div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative z-50 w-[260px] h-full animate-slide-in-right">{content}</aside>
        </div>
      )}
    </>
  );
}
