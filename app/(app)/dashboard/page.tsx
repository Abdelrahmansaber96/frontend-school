'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { dashboardApi, gradesApi, subjectsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useSchoolBrandingStore } from '@/store/branding.store';
import type { DashboardRange } from '@/types';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import PriorityAlerts from '@/components/dashboard/PriorityAlerts';
import QuickActions from '@/components/dashboard/QuickActions';
import DailyKpiGrid from '@/components/dashboard/DailyKpiGrid';
import StudentsNeedingAttention from '@/components/dashboard/StudentsNeedingAttention';
import ClassOverview from '@/components/dashboard/ClassOverview';
import WeeklyTrend from '@/components/dashboard/WeeklyTrend';
import RoleHighlights from '@/components/dashboard/RoleHighlights';
import RecentGrades from '@/components/dashboard/RecentGrades';
import SchoolAdminDashboard from '@/components/dashboard/SchoolAdminDashboard';

const RANGE_KEY = 'basma-dashboard-range';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { schoolName, schoolNameAr } = useSchoolBrandingStore();
  const [range, setRange] = useState<DashboardRange>('today');

  useEffect(() => {
    const saved = window.localStorage.getItem(RANGE_KEY);
    if (saved === 'today' || saved === '7d' || saved === '30d') setRange(saved);
  }, []);

  const query = useQuery({
    queryKey: ['dashboard', range],
    queryFn: () => dashboardApi.getSummary(range).then((response) => response.data.data),
    enabled: Boolean(user),
    staleTime: 60_000,
    retry: 1,
  });

  const subjectsQuery = useQuery({
    queryKey: ['dashboard-subject-count'],
    queryFn: () => subjectsApi.list({ page: 1, limit: 1 }),
    enabled: user?.role === 'school_admin',
    staleTime: 60_000,
  });

  const gradesQuery = useQuery({
    queryKey: ['dashboard-assessment-count'],
    queryFn: () => gradesApi.list({ page: 1, limit: 1 }),
    enabled: user?.role === 'school_admin',
    staleTime: 60_000,
  });

  const changeRange = (nextRange: DashboardRange) => {
    setRange(nextRange);
    window.localStorage.setItem(RANGE_KEY, nextRange);
  };

  if (query.isLoading || !query.data) {
    if (query.isError) {
      return (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
          <h1 className="mt-3 text-base font-semibold text-ink">تعذر تحميل لوحة التحكم</h1>
          <p className="mt-1 text-xs text-ink-dim">تحقق من الاتصال ثم أعد المحاولة. لم تتأثر بقية بيانات النظام.</p>
          <button type="button" onClick={() => query.refetch()} className="mt-4 min-h-10 rounded-xl bg-gold-500 px-4 text-xs font-semibold text-navy-950">إعادة المحاولة</button>
        </div>
      );
    }
    return <DashboardSkeleton />;
  }

  const dashboard = query.data;
  const displaySchoolName = schoolNameAr || schoolName;
  const showClassOverview = ['school_admin', 'teacher', 'administrative'].includes(dashboard.role);

  if (dashboard.role === 'school_admin') {
    const subjectPayload = subjectsQuery.data?.data;
    const gradePayload = gradesQuery.data?.data;
    const subjectCount = subjectPayload?.meta?.total ?? subjectPayload?.pagination?.total ?? subjectPayload?.data?.length ?? 0;
    const assessmentCount = gradePayload?.meta?.total ?? gradePayload?.pagination?.total ?? gradePayload?.data?.length ?? dashboard.academic.length;
    return (
      <SchoolAdminDashboard
        dashboard={dashboard}
        firstName={user?.name?.first || 'مدير المدرسة'}
        schoolName={displaySchoolName}
        subjectCount={subjectCount}
        assessmentCount={assessmentCount}
        loading={query.isFetching}
        onRefresh={() => {
          query.refetch();
          subjectsQuery.refetch();
          gradesQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <DashboardHeader
        name={user?.name?.first || 'مرحبًا'}
        schoolName={dashboard.role === 'super_admin' ? 'إدارة منصة بصمة' : displaySchoolName}
        generatedAt={dashboard.generatedAt}
        range={range}
        loading={query.isFetching}
        onRangeChange={changeRange}
        onRefresh={() => query.refetch()}
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8"><PriorityAlerts alerts={dashboard.alerts} schoolName={displaySchoolName} /></div>
        <div className="col-span-12 rounded-2xl border border-stroke bg-glaze/[0.025] p-4 lg:col-span-4 sm:p-5"><QuickActions role={dashboard.role} /></div>
      </div>

      <DailyKpiGrid dashboard={dashboard} />
      <RoleHighlights dashboard={dashboard} />
      {dashboard.role !== 'super_admin' && ['teacher', 'parent', 'student'].includes(dashboard.role) && <RecentGrades grades={dashboard.academic} />}

      {dashboard.role !== 'super_admin' && (
        <div className="grid grid-cols-12 gap-4">
          <div className={showClassOverview ? 'col-span-12 lg:col-span-7' : 'col-span-12'}><StudentsNeedingAttention students={dashboard.studentsNeedingAttention} /></div>
          {showClassOverview && <div className="col-span-12 lg:col-span-5"><ClassOverview classes={dashboard.classes} /></div>}
        </div>
      )}

      {dashboard.role !== 'super_admin' && <WeeklyTrend days={dashboard.weeklyTrend} />}
    </div>
  );
}
