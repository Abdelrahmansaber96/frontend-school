'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, BookOpenCheck, Download, GraduationCap, Medal, NotebookPen, Target, Trophy, Users } from 'lucide-react';
import { attendanceApi, reportsApi, studentsApi } from '@/lib/api';
import {
  getApiErrorMessage,
  getAttendanceReportPayload,
  getBehaviorReportPayload,
  getGradeReportPayload,
  getListPayload,
} from '@/lib/api-contracts';
import { downloadBlobResponse } from '@/lib/download';
import { getAssessmentTypeLabel, getSubjectDisplayName } from '@/lib/grade-utils';
import { hasAnyRole, roleGroups } from '@/lib/role-access';
import { useAuthStore } from '@/store/auth.store';
import type { AttendanceRecord, AttendanceReportResponse, BehaviorReportResponse, GradeReportResponse, Student } from '@/types';
import { fullName } from '@/lib/utils';
import AlertBanner from '@/components/ui/AlertBanner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import RestrictedAccessState from '@/components/ui/RestrictedAccessState';
import { PageSpinner } from '@/components/ui/Spinner';
import ReportsDateRangeFilters from '@/components/reports/ReportsDateRangeFilters';
import PerformanceKpiCard from '@/components/reports/PerformanceKpiCard';
import ScoreDistributionChart from '@/components/reports/ScoreDistributionChart';
import PerformanceBreakdownChart from '@/components/reports/PerformanceBreakdownChart';
import PerformanceTrendChart from '@/components/reports/PerformanceTrendChart';
import StudentPerformanceTable from '@/components/reports/StudentPerformanceTable';
import PerformanceInsightsPanel from '@/components/reports/PerformanceInsightsPanel';
import PerformanceAlertsPanel from '@/components/reports/PerformanceAlertsPanel';
import { buildStudentPerformanceDashboard } from '@/components/reports/student-performance';

const getDefaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

const reportExportConfig = {
  attendance: {
    label: 'تقرير الحضور',
    fallbackMessage: 'تعذر تصدير تقرير الحضور.',
    fileNamePrefix: 'attendance-report',
    request: reportsApi.exportAttendance,
  },
  behavior: {
    label: 'تقرير السلوك',
    fallbackMessage: 'تعذر تصدير تقرير السلوك.',
    fileNamePrefix: 'behavior-report',
    request: reportsApi.exportBehavior,
  },
} as const;

const exportFormats = [
  { key: 'csv', label: 'CSV' },
  { key: 'pdf', label: 'PDF' },
  { key: 'xlsx', label: 'Excel' },
] as const;

type ReportExportType = keyof typeof reportExportConfig;
type ExportFormat = (typeof exportFormats)[number]['key'];

const integerFormatter = new Intl.NumberFormat('ar-EG');
const decimalFormatter = new Intl.NumberFormat('ar-EG', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export default function ReportsPage() {
  const { user } = useAuthStore();
  const canViewReports = hasAnyRole(user?.role, roleGroups.reportViewers);
  const isTeacherReportView = user?.role === 'teacher';
  const [draftRange, setDraftRange] = useState(getDefaultRange);
  const [appliedRange, setAppliedRange] = useState(getDefaultRange);
  const [exporting, setExporting] = useState<`${ReportExportType}:${ExportFormat}` | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const isInvalidRange = draftRange.startDate > draftRange.endDate;

  const attendanceQuery = useQuery<AttendanceReportResponse>({
    queryKey: ['reports-attendance', appliedRange.startDate, appliedRange.endDate],
    queryFn: () => reportsApi.attendance(appliedRange).then(getAttendanceReportPayload),
    enabled: canViewReports && !isTeacherReportView && !isInvalidRange,
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  const studentRosterQuery = useQuery({
    queryKey: ['reports-student-roster'],
    queryFn: () => studentsApi.list({ page: 1, limit: 1000 }).then(getListPayload<Student>),
    enabled: canViewReports && !isTeacherReportView,
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  const attendanceRecordsQuery = useQuery({
    queryKey: ['reports-attendance-records', appliedRange.startDate, appliedRange.endDate],
    queryFn: () => attendanceApi.list({
      page: 1,
      limit: 2500,
      startDate: appliedRange.startDate,
      endDate: appliedRange.endDate,
    }).then(getListPayload<AttendanceRecord>),
    enabled: canViewReports && !isTeacherReportView && !isInvalidRange,
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  const behaviorQuery = useQuery<BehaviorReportResponse>({
    queryKey: ['reports-behavior', appliedRange.startDate, appliedRange.endDate],
    queryFn: () => reportsApi.behavior(appliedRange).then(getBehaviorReportPayload),
    enabled: canViewReports && !isTeacherReportView && !isInvalidRange,
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  const gradeReportQuery = useQuery<GradeReportResponse>({
    queryKey: ['reports-grades', appliedRange.startDate, appliedRange.endDate],
    queryFn: () => reportsApi.grades(appliedRange).then(getGradeReportPayload),
    enabled: canViewReports && !isInvalidRange,
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  const handleApply = () => {
    if (isInvalidRange) {
      return;
    }

    setAppliedRange((current) => (
      current.startDate === draftRange.startDate && current.endDate === draftRange.endDate
        ? current
        : draftRange
    ));
  };

  const handleExport = async (reportType: ReportExportType, format: ExportFormat) => {
    const exportConfig = reportExportConfig[reportType];
    setExportError(null);
    setExporting(`${reportType}:${format}`);

    try {
      const response = await exportConfig.request({ ...appliedRange, format });
      downloadBlobResponse(
        response,
        `${exportConfig.fileNamePrefix}-${appliedRange.startDate}-${appliedRange.endDate}.${format}`,
      );
    } catch (error) {
      setExportError(getApiErrorMessage(error, exportConfig.fallbackMessage));
    } finally {
      setExporting(null);
    }
  };

  const studentRoster = studentRosterQuery.data?.items;
  const attendanceRows = attendanceQuery.data?.daily;
  const attendanceRecords = attendanceRecordsQuery.data?.items;
  const behaviorRecords = behaviorQuery.data?.records;

  const performanceDashboard = useMemo(() => buildStudentPerformanceDashboard({
    students: studentRoster ?? [],
    attendanceRecords: attendanceRecords ?? [],
    attendanceRows: attendanceRows ?? [],
    behaviorRecords: behaviorRecords ?? [],
  }), [attendanceRecords, attendanceRows, behaviorRecords, studentRoster]);

  const heroBadge = isTeacherReportView ? 'تحليلات المادة الخاصة بك' : 'تحليلات أداء الطلاب';
  const heroTitle = isTeacherReportView ? 'تقارير المعلم الأكاديمية' : 'لوحة تقارير الأداء';
  const heroDescription = isTeacherReportView
    ? 'يعرض هذا التقرير أداء طلابك في المواد المسندة إليك فقط، اعتمادًا على الاختبارات والواجبات والمشاريع المسجلة باسمك.'
    : 'لوحة تفاعلية تجمع الحضور والسلوك في مؤشر موحد للأداء، مع قراءة أسرع للاتجاهات العامة، وتنبيهات مبكرة، وصورة أوضح للطلاب الأكثر تميزًا أو احتياجًا للدعم.';

  if (!canViewReports) {
    return (
      <RestrictedAccessState
        icon={BarChart3}
        description="التقارير متاحة للإدارة والمعلمين بحسب الصلاحيات."
      />
    );
  }

  const isInitialLoading = isTeacherReportView
    ? (!gradeReportQuery.data && gradeReportQuery.isLoading)
    : (
      (!attendanceQuery.data && attendanceQuery.isLoading)
      || (!behaviorQuery.data && behaviorQuery.isLoading)
      || (!studentRosterQuery.data && studentRosterQuery.isLoading)
      || (!attendanceRecordsQuery.data && attendanceRecordsQuery.isLoading)
    );
  if (isInitialLoading) return <PageSpinner />;

  const reportQueryError = isTeacherReportView
    ? gradeReportQuery.error
    : attendanceQuery.error
      ?? behaviorQuery.error
      ?? gradeReportQuery.error
      ?? studentRosterQuery.error
      ?? attendanceRecordsQuery.error;

  const isRefreshingDashboard = isTeacherReportView
    ? gradeReportQuery.isFetching
    : attendanceQuery.isFetching
      || behaviorQuery.isFetching
      || gradeReportQuery.isFetching
      || studentRosterQuery.isFetching
      || attendanceRecordsQuery.isFetching;

  const gradeReport = gradeReportQuery.data;

  return (
    <div className="space-y-8 pb-6">
      <section className="glass-card glass-shine relative overflow-hidden rounded-[32px] border border-stroke p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full bg-[radial-gradient(circle_at_top_right,rgba(230,195,106,0.16),transparent_60%)] sm:w-1/2" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative space-y-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 text-xs font-medium text-gold-300">
                <BarChart3 className="h-3.5 w-3.5" /> {heroBadge}
              </div>
              <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl md:text-4xl">
                {heroTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted md:text-base">
                {heroDescription}
              </p>
            </div>

            {!isTeacherReportView && (
              <div className="rounded-2xl border border-stroke bg-glaze/[0.04] p-3 xl:min-w-[360px]">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
                <Download className="h-4 w-4 text-gold-400" />
                <span>خيارات التصدير المباشر</span>
              </div>
              <div className="space-y-3">
                {(Object.entries(reportExportConfig) as Array<[ReportExportType, (typeof reportExportConfig)[ReportExportType]]>).map(([reportType, config]) => (
                  <div key={reportType} className="rounded-2xl border border-stroke bg-glaze/[0.03] p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-ink">{config.label}</span>
                      <span className="text-[11px] text-ink-faint">اختر الصيغة المناسبة</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {exportFormats.map((formatOption) => {
                        const exportKey = `${reportType}:${formatOption.key}` as const;
                        return (
                          <Button
                            key={formatOption.key}
                            variant="outline"
                            size="sm"
                            onClick={() => handleExport(reportType, formatOption.key)}
                            loading={exporting === exportKey}
                            disabled={isInvalidRange}
                            className="w-full bg-glaze/[0.04]"
                          >
                            {formatOption.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              </div>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-stroke bg-glaze/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">الفترة الزمنية</p>
              <p className="mt-2 text-sm font-medium text-ink">{appliedRange.startDate} → {appliedRange.endDate}</p>
            </div>
            <div className="rounded-2xl border border-stroke bg-glaze/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">حجم البيانات</p>
              <p className="mt-2 text-sm font-medium text-ink">
                {isTeacherReportView
                  ? `${integerFormatter.format(gradeReport?.summary.totalAssessments ?? 0)} تقييمات • ${integerFormatter.format(gradeReport?.summary.totalSubjects ?? 0)} مواد`
                  : `${integerFormatter.format((attendanceRecords ?? []).length)} سجل حضور • ${integerFormatter.format((behaviorRecords ?? []).length)} سجل سلوك`}
              </p>
            </div>
            <div className="rounded-2xl border border-stroke bg-glaze/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-ink-faint">حالة التحليلات</p>
              <p className="mt-2 text-sm font-medium text-ink">
                {isRefreshingDashboard ? 'يجري تحديث المؤشرات الآن...' : 'المؤشرات محدثة وجاهزة للقراءة'}
              </p>
            </div>
          </div>

          <ReportsDateRangeFilters
            startDate={draftRange.startDate}
            endDate={draftRange.endDate}
            isApplying={isRefreshingDashboard}
            isInvalidRange={isInvalidRange}
            onStartDateChange={(startDate) => setDraftRange((current) => ({ ...current, startDate }))}
            onEndDateChange={(endDate) => setDraftRange((current) => ({ ...current, endDate }))}
            onApply={handleApply}
          />
        </div>
      </section>

      {isInvalidRange && (
        <AlertBanner variant="error">
          تاريخ النهاية يجب أن يكون بعد أو مساوياً لتاريخ البداية.
        </AlertBanner>
      )}

      {reportQueryError && (
        <AlertBanner variant="error">
          {getApiErrorMessage(reportQueryError, 'تعذر تحميل بيانات التقارير.')}
        </AlertBanner>
      )}

      {exportError && (
        <AlertBanner variant="error">
          {exportError}
        </AlertBanner>
      )}

      {!isTeacherReportView && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PerformanceKpiCard
              title="إجمالي الطلاب"
              value={integerFormatter.format(performanceDashboard.totalStudents)}
              description="عدد الطلاب الذين دخلوا في التحليل الحالي"
              icon={Users}
              accentClassName="border-sky-400/15 bg-sky-400/10 text-sky-200"
              glowClassName="bg-sky-400/12"
              delay={0}
            />
            <PerformanceKpiCard
              title="متوسط الأداء"
              value={decimalFormatter.format(performanceDashboard.averageScore)}
              description="متوسط المؤشر المركب على مستوى المدرسة"
              icon={Target}
              accentClassName="border-gold-400/15 bg-gold-400/10 text-gold-200"
              glowClassName="bg-gold-400/14"
              delay={0.05}
            />
            <PerformanceKpiCard
              title="نسبة النجاح"
              value={`${decimalFormatter.format(performanceDashboard.successRate)}%`}
              description="نسبة الطلاب فوق العتبة المستهدفة حاليًا"
              icon={Trophy}
              accentClassName="border-emerald-400/15 bg-emerald-400/10 text-emerald-200"
              glowClassName="bg-emerald-400/14"
              delay={0.1}
            />
            <PerformanceKpiCard
              title="أعلى نتيجة"
              value={integerFormatter.format(performanceDashboard.highestScore)}
              description="أفضل نتيجة فردية خلال الفترة المحددة"
              icon={Medal}
              accentClassName="border-rose-400/15 bg-rose-400/10 text-rose-200"
              glowClassName="bg-rose-400/12"
              delay={0.15}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
            <ScoreDistributionChart rows={performanceDashboard.scoreDistribution} isLoading={isRefreshingDashboard} />
            <PerformanceBreakdownChart
              rows={performanceDashboard.performanceBreakdown}
              successRate={performanceDashboard.successRate}
              isLoading={isRefreshingDashboard}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
            <PerformanceTrendChart rows={performanceDashboard.trend} isLoading={isRefreshingDashboard} />
            <div className="grid gap-6">
              <PerformanceInsightsPanel insights={performanceDashboard.insights} />
              <PerformanceAlertsPanel alerts={performanceDashboard.alerts} />
            </div>
          </div>

          <StudentPerformanceTable rows={performanceDashboard.students} isLoading={isRefreshingDashboard} />
        </>
      )}

      <section className="space-y-6 rounded-[28px] border border-stroke bg-glaze/[0.02] p-6 lg:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-medium text-sky-200">
              <BookOpenCheck className="h-3.5 w-3.5" /> تقارير المواد والاختبارات
            </div>
            <h2 className="mt-4 text-xl font-semibold text-ink sm:text-2xl">التحصيل الأكاديمي الحقيقي</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-ink-muted">
              {isTeacherReportView
                ? 'هذا القسم يعرض درجات الاختبارات والواجبات والمشاريع التي سجلتها أنت أو أُسندت إليك، لذلك فهو يقتصر على مادّتك وطلابك فقط.'
                : 'هذا القسم يعتمد على درجات الاختبارات والواجبات والمشاريع المسجلة فعليًا لكل مادة، ويعطي صورة أوضح عن مستوى الطلاب في المواد الدراسية بدل الاعتماد على مؤشرات السلوك والحضور فقط.'}
            </p>
          </div>
          <div className="rounded-2xl border border-stroke bg-glaze/[0.03] px-4 py-3 text-sm text-ink-muted">
            الفترة نفسها مطبقة على تقارير الدرجات: <span className="font-medium text-ink">{appliedRange.startDate} → {appliedRange.endDate}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PerformanceKpiCard
            title="إجمالي التقييمات"
            value={integerFormatter.format(gradeReport?.summary.totalAssessments ?? 0)}
            description="عدد الاختبارات والواجبات والمشاريع المسجلة"
            icon={NotebookPen}
            accentClassName="border-sky-400/15 bg-sky-400/10 text-sky-200"
            glowClassName="bg-sky-400/12"
            delay={0}
          />
          <PerformanceKpiCard
            title="متوسط التحصيل"
            value={`${decimalFormatter.format(gradeReport?.summary.averagePercentage ?? 0)}%`}
            description="المتوسط العام عبر جميع المواد والتقييمات"
            icon={Target}
            accentClassName="border-gold-400/15 bg-gold-400/10 text-gold-200"
            glowClassName="bg-gold-400/14"
            delay={0.05}
          />
          <PerformanceKpiCard
            title="نسبة النجاح الأكاديمي"
            value={`${decimalFormatter.format(gradeReport?.summary.successRate ?? 0)}%`}
            description="نسبة التقييمات التي تجاوزت عتبة النجاح"
            icon={Trophy}
            accentClassName="border-emerald-400/15 bg-emerald-400/10 text-emerald-200"
            glowClassName="bg-emerald-400/14"
            delay={0.1}
          />
          <PerformanceKpiCard
            title="المواد المغطاة"
            value={integerFormatter.format(gradeReport?.summary.totalSubjects ?? 0)}
            description="عدد المواد التي لديها تقييمات خلال الفترة"
            icon={GraduationCap}
            accentClassName="border-rose-400/15 bg-rose-400/10 text-rose-200"
            glowClassName="bg-rose-400/12"
            delay={0.15}
          />
        </div>

        {!gradeReport?.summary.totalAssessments ? (
          <div className="rounded-2xl border border-dashed border-stroke bg-glaze/[0.03] px-5 py-8 text-center text-sm text-ink-faint">
            لا توجد درجات مسجلة ضمن الفترة الحالية بعد. أضف تقييمات من صفحة الدرجات والاختبارات ليظهر التحصيل الأكاديمي هنا.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-2xl border border-stroke bg-glaze/[0.03] p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-ink">أداء المواد الدراسية</h3>
                  <span className="text-xs text-ink-faint">مرتبة من الأعلى إلى الأقل</span>
                </div>
                <div className="space-y-3">
                  {(gradeReport?.subjectBreakdown ?? []).slice(0, 8).map((entry) => (
                    <div key={entry.subject?._id || entry.subject?.name || Math.random()} className="rounded-xl border border-stroke bg-glaze/[0.03] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-ink">{entry.subject ? getSubjectDisplayName(entry.subject) : 'مادة غير محددة'}</p>
                          <p className="mt-1 text-xs text-ink-faint">{entry.assessmentCount} تقييمات • نجاح {decimalFormatter.format(entry.successRate)}%</p>
                        </div>
                        <div className="text-end">
                          <p className="text-lg font-semibold text-ink">{decimalFormatter.format(entry.averagePercentage)}%</p>
                          <p className="text-xs text-ink-faint">متوسط المادة</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-stroke bg-glaze/[0.03] p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-ink">أنواع التقييم المستخدمة</h3>
                  <span className="text-xs text-ink-faint">توزيع التسجيلات الحالية</span>
                </div>
                <div className="space-y-3">
                  {(gradeReport?.assessmentTypeBreakdown ?? []).map((entry) => (
                    <div key={entry.type} className="flex items-center justify-between rounded-xl border border-stroke bg-glaze/[0.03] px-3 py-2.5">
                      <span className="text-sm text-ink">{getAssessmentTypeLabel(entry.type)}</span>
                      <Badge variant="info">{integerFormatter.format(entry.count)}</Badge>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-2xl border border-stroke bg-glaze/[0.03] p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-ink">أفضل الطلاب أكاديميًا</h3>
                  <span className="text-xs text-ink-faint">أعلى متوسط مسجل خلال الفترة</span>
                </div>
                <div className="space-y-3">
                  {(gradeReport?.studentBreakdown ?? []).slice(0, 8).map((entry, index) => (
                    <div key={entry.student?._id || index} className="rounded-xl border border-stroke bg-glaze/[0.03] p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-ink">{entry.student?.name ? fullName(entry.student.name) : 'طالب غير محدد'}</p>
                          <p className="mt-1 text-xs text-ink-faint">
                            {entry.class?.name || 'بدون فصل'} • {entry.subjectsCount} مواد • {entry.assessmentCount} تقييمات
                          </p>
                        </div>
                        <div className="text-end">
                          <Badge className={entry.academicLevel.key === 'excellent' ? 'border-gold-400/30 bg-gold-400/10 text-gold-200' : entry.academicLevel.key === 'healthy' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : entry.academicLevel.key === 'watch' ? 'border-amber-400/30 bg-amber-400/10 text-amber-200' : 'border-rose-400/30 bg-rose-400/10 text-rose-200'}>
                            {entry.academicLevel.label}
                          </Badge>
                          <p className="mt-2 text-lg font-semibold text-ink">{decimalFormatter.format(entry.averagePercentage)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-stroke bg-glaze/[0.03] p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-ink">أحدث التقييمات</h3>
                  <span className="text-xs text-ink-faint">آخر ما تم تسجيله في سجل الدرجات</span>
                </div>
                <div className="space-y-3">
                  {(gradeReport?.recentAssessments ?? []).slice(0, 8).map((entry) => (
                    <div key={entry._id} className="rounded-xl border border-stroke bg-glaze/[0.03] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-ink">{entry.title}</p>
                          <p className="mt-1 text-xs text-ink-faint">
                            {(entry.student?.name ? fullName(entry.student.name) : 'طالب غير محدد')} • {entry.subject ? getSubjectDisplayName(entry.subject) : 'مادة غير محددة'}
                          </p>
                          <p className="mt-1 text-xs text-ink-faint">{getAssessmentTypeLabel(entry.assessmentType)} • {entry.class?.name || 'بدون فصل'}</p>
                        </div>
                        <Badge className={entry.percentage >= 90 ? 'border-gold-400/30 bg-gold-400/10 text-gold-200' : entry.percentage >= 75 ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : entry.percentage >= 60 ? 'border-amber-400/30 bg-amber-400/10 text-amber-200' : 'border-rose-400/30 bg-rose-400/10 text-rose-200'}>
                          {decimalFormatter.format(entry.percentage)}%
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-ink-faint">{entry.score} / {entry.maxScore}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
