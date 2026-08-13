import Link from 'next/link';
import { BarChart3, BookOpen, CheckSquare, Flag, KeyRound, MessageCircle, School, UserPlus } from 'lucide-react';
import type { Role } from '@/types';

const actions: Record<Role, Array<{ label: string; href: string; icon: typeof CheckSquare; primary?: boolean }>> = {
  school_admin: [
    { label: 'تسجيل الحضور', href: '/attendance', icon: CheckSquare, primary: true },
    { label: 'إضافة طالب أو معلم', href: '/accounts', icon: UserPlus },
    { label: 'إرسال واتساب', href: '/students', icon: MessageCircle },
    { label: 'فتح التقارير', href: '/reports', icon: BarChart3 },
  ],
  teacher: [
    { label: 'تسجيل الحضور', href: '/attendance', icon: CheckSquare, primary: true },
    { label: 'إضافة سلوك', href: '/behavior', icon: Flag },
    { label: 'إضافة درجة', href: '/grades', icon: BookOpen },
    { label: 'مراسلة ولي أمر', href: '/messages', icon: MessageCircle },
  ],
  administrative: [
    { label: 'حضور جماعي', href: '/attendance', icon: CheckSquare, primary: true },
    { label: 'تسجيل سلوك', href: '/behavior', icon: Flag },
    { label: 'متابعة التأخر', href: '/attendance?type=late', icon: BarChart3 },
    { label: 'التواصل مع ولي الأمر', href: '/attendance', icon: MessageCircle },
  ],
  parent: [
    { label: 'فتح ملفات الأبناء', href: '/children', icon: UserPlus, primary: true },
    { label: 'مراسلة المعلم', href: '/messages', icon: MessageCircle },
    { label: 'عرض التقرير', href: '/children', icon: CheckSquare },
  ],
  student: [
    { label: 'فتح المواد', href: '/subjects', icon: BookOpen, primary: true },
    { label: 'عرض الدرجات', href: '/grades', icon: BarChart3 },
    { label: 'تغيير كلمة المرور', href: '/profile', icon: KeyRound },
  ],
  super_admin: [
    { label: 'إضافة مدرسة', href: '/schools', icon: School, primary: true },
    { label: 'إدارة المدارس', href: '/schools', icon: School },
    { label: 'مراجعة السجلات', href: '/reports', icon: BarChart3 },
  ],
};

export default function QuickActions({ role }: { role: Role }) {
  return (
    <section aria-labelledby="quick-actions-title">
      <h2 id="quick-actions-title" className="mb-3 text-sm font-semibold text-ink">إجراءات سريعة</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions[role].map(({ label, href, icon: Icon, primary }) => (
          <Link key={`${label}-${href}`} href={href} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-center text-xs font-semibold transition-colors focus-visible:outline-none ${primary ? 'border-gold-500/40 bg-gold-500 text-navy-950 hover:bg-gold-400' : 'border-stroke bg-glaze/[0.025] text-ink-muted hover:border-stroke-strong hover:bg-glaze/[0.05] hover:text-ink'}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />{label}
          </Link>
        ))}
      </div>
    </section>
  );
}
