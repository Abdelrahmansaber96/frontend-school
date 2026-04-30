'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  AlertCircle,
  School,
  Palette,
} from 'lucide-react';
import Link from 'next/link';
import { dashboardApi, attendanceApi, behaviorApi } from '@/lib/api';
import { hasAnyRole, roleGroups } from '@/lib/role-access';
import { useAuthStore } from '@/store/auth.store';
import { useSchoolBrandingStore } from '@/store/branding.store';
import StatCard from '@/components/ui/StatCard';
import PageHeader from '@/components/ui/PageHeader';
import SchoolLogo from '@/components/ui/SchoolLogo';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { schoolName, schoolNameAr, branding, logo, isLoaded } = useSchoolBrandingStore();
  const isParentUser = hasAnyRole(user?.role, roleGroups.parents);
  const canViewAdministrativeStats = hasAnyRole(user?.role, roleGroups.schoolManagers);
  const canViewPlatformStats = hasAnyRole(user?.role, roleGroups.superAdmins);
  const schoolLogoSrc = logo || branding.logoUrl || null;

  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.getSummary().then((r) => r.data.data),
  });

  const { data: recentAttendance } = useQuery({
    queryKey: ['recent-attendance'],
    queryFn: () =>
      attendanceApi
        .list({ page: 1, limit: 5 })
        .then((r) => r.data.data),
    enabled: !isParentUser,
  });

  const { data: recentBehavior } = useQuery({
    queryKey: ['recent-behavior'],
    queryFn: () =>
      behaviorApi
        .list({ page: 1, limit: 5 })
        .then((r) => r.data.data),
    enabled: !isParentUser,
  });

  if (isLoading) return <PageSpinner />;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting()}, ${user?.name?.first ?? 'User'} 👋`}
        description={`ملخص يوم ${formatDate(new Date().toISOString())}`}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {canViewAdministrativeStats && (
          <>
            <StatCard
              title="إجمالي الطلاب"
              value={summary?.totalStudents ?? 0}
              icon={Users}
              iconColor="text-blue-400"
              trend={`${summary?.activeStudents ?? 0} نشط`}
            />
            <StatCard
              title="إجمالي المعلمين"
              value={summary?.totalTeachers ?? 0}
              icon={GraduationCap}
              iconColor="text-purple-400"
            />
            <StatCard
              title="إجمالي الفصول"
              value={summary?.totalClasses ?? 0}
              icon={BookOpen}
              iconColor="text-emerald-400"
            />
          </>
        )}

        {canViewPlatformStats && (
          <StatCard
            title="عدد المدارس"
            value={summary?.totalSchools ?? 0}
            icon={School}
            iconColor="text-gold-400"
          />
        )}

        <StatCard
          title="غيابات اليوم"
          value={summary?.todayAttendance ?? 0}
          icon={CalendarCheck}
          iconColor="text-orange-400"
          trend={summary?.todayAttendance ? `${summary.todayAttendance} سجل اليوم` : undefined}
        />
        <StatCard
          title="حوادث سلوكية"
          value={summary?.recentBehavior ?? 0}
          icon={AlertCircle}
          iconColor="text-red-400"
        />
      </div>

      {/* School info card for school admins */}
      {isLoaded && schoolName && canViewAdministrativeStats && (
        <div className="glass-shine rounded-2xl border border-stroke bg-glaze/[0.02] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SchoolLogo
                alt={schoolName}
                src={schoolLogoSrc}
                branding={branding}
                size="md"
                className="border border-stroke"
              />
              <div>
                <h3 className="text-[15px] font-semibold text-ink">{schoolNameAr || schoolName}</h3>
              </div>
            </div>
            {user?.role === 'school_admin' && (
              <Link
                href="/branding"
                className="inline-flex items-center gap-1.5 rounded-xl bg-glaze/[0.06] px-3 py-1.5 text-[12px] font-medium text-ink-dim hover:bg-glaze/[0.10] hover:text-ink transition-all duration-200"
              >
                <Palette className="h-3.5 w-3.5" />
                تخصيص العلامة التجارية
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Recent tables */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Attendance */}
        {!isParentUser && (
          <div className="glass-shine overflow-hidden rounded-2xl border border-stroke bg-glaze/[0.02]">
            <div className="border-b border-stroke px-5 py-4">
              <h3 className="text-[13px] font-semibold text-ink-muted">
                سجلات الحضور الأخيرة
              </h3>
            </div>
            <div className="divide-y divide-glaze/[0.04]">
              {recentAttendance?.length ? (
                recentAttendance.map((rec: import('@/types').AttendanceRecord, i: number) => (
                  <div
                    key={rec._id}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className="flex items-center justify-between px-5 py-3.5 animate-fade-in transition-colors duration-150 hover:bg-glaze/[0.02]"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-ink">
                        {rec.studentId?.userId?.name?.first}{' '}
                        {rec.studentId?.userId?.name?.last}
                      </p>
                      <p className="text-[11px] text-ink-faint mt-0.5">{formatDate(rec.date)}</p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                        rec.type === 'absence'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400/80 ring-red-500/10'
                          : rec.type === 'late'
                          ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400/80 ring-yellow-500/10'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400/80 ring-blue-500/10'
                      }`}
                    >
                      {rec.type === 'absence' ? 'غياب' : rec.type === 'late' ? 'تأخر' : 'إذن'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="px-5 py-10 text-center text-[13px] text-ink-faint">
                  لا توجد سجلات حديثة
                </p>
              )}
            </div>
          </div>
        )}

        {/* السلوك الأخير */}
        {!isParentUser && (
          <div className="glass-shine overflow-hidden rounded-2xl border border-stroke bg-glaze/[0.02]">
            <div className="border-b border-stroke px-5 py-4">
              <h3 className="text-[13px] font-semibold text-ink-muted">
                سجلات السلوك الأخيرة
              </h3>
            </div>
            <div className="divide-y divide-glaze/[0.04]">
              {recentBehavior?.length ? (
                recentBehavior.map((rec: import('@/types').BehaviorRecord, i: number) => (
                  <div
                    key={rec._id}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className="flex items-center justify-between px-5 py-3.5 animate-fade-in transition-colors duration-150 hover:bg-glaze/[0.02]"
                  >
                    <div className="overflow-hidden">
                      <p className="text-[13px] font-medium text-ink">
                        {rec.studentId?.userId?.name?.first}{' '}
                        {rec.studentId?.userId?.name?.last}
                      </p>
                      <p className="text-[11px] text-ink-faint line-clamp-1 mt-0.5">
                        {rec.description}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ms-3 ${
                        rec.type === 'positive'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400/80 ring-emerald-500/10'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400/80 ring-red-500/10'
                      }`}
                    >
                      {rec.type === 'positive' ? 'إيجابي' : 'سلبي'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="px-5 py-10 text-center text-[13px] text-ink-faint">
                  لا توجد سجلات حديثة
                </p>
              )}
            </div>
          </div>
        )}

        {isParentUser && (
          <div className="col-span-full glass-shine rounded-2xl border border-stroke bg-glaze/[0.02] p-10 text-center">
            <CalendarCheck className="mx-auto mb-4 h-10 w-10 text-ink-faint" />
            <p className="text-[13px] text-ink-dim">
              تصفّح تقدم أبنائك من خلال صفحة أبنائي.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
