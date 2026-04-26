import { fullName } from '@/lib/utils';
import type { AttendanceRecord, AttendanceReportDay, BehaviorRecord, Student } from '@/types';

export interface PerformanceRange {
  startDate: string;
  endDate: string;
}

export interface StudentPerformanceRow {
  id: string;
  name: { first: string; last: string };
  displayName: string;
  classLabel: string;
  score: number;
  scoreBand: string;
  scoreBandLabel: string;
  attendanceIncidents: number;
  absenceCount: number;
  lateCount: number;
  permissionCount: number;
  positiveCount: number;
  negativeCount: number;
  behaviorIndex: number;
  riskLevel: 'stable' | 'watch' | 'critical';
  isWeak: boolean;
}

export interface PerformanceDistributionDatum {
  key: string;
  label: string;
  count: number;
  fill: string;
}

export interface PerformanceTierDatum {
  key: string;
  label: string;
  value: number;
  percentage: number;
  fill: string;
}

export interface PerformanceTrendDatum {
  date: string;
  label: string;
  score: number;
  absence: number;
  positive: number;
  negative: number;
}

export interface PerformanceInsight {
  title: string;
  description: string;
  metric: string;
  tone: 'gold' | 'emerald' | 'sky' | 'rose';
}

export interface PerformanceAlert {
  studentId: string;
  studentName: string;
  classLabel: string;
  severity: 'critical' | 'warning';
  reason: string;
  score: number;
}

export interface StudentPerformanceDashboard {
  totalStudents: number;
  averageScore: number;
  successRate: number;
  highestScore: number;
  scoreDistribution: PerformanceDistributionDatum[];
  performanceBreakdown: PerformanceTierDatum[];
  trend: PerformanceTrendDatum[];
  students: StudentPerformanceRow[];
  insights: PerformanceInsight[];
  alerts: PerformanceAlert[];
}

const SCORE_BANDS = [
  { key: 'elite', label: '90 - 100', min: 90, fill: '#E6C36A' },
  { key: 'strong', label: '80 - 89', min: 80, fill: '#38BDF8' },
  { key: 'steady', label: '70 - 79', min: 70, fill: '#10B981' },
  { key: 'fragile', label: '60 - 69', min: 60, fill: '#F59E0B' },
  { key: 'risk', label: 'أقل من 60', min: 0, fill: '#F87171' },
] as const;

const PERFORMANCE_TIERS = [
  { key: 'excellent', label: 'ممتاز', min: 90, fill: '#E6C36A' },
  { key: 'healthy', label: 'جيد', min: 75, fill: '#22C55E' },
  { key: 'watch', label: 'تحت المراقبة', min: 60, fill: '#F59E0B' },
  { key: 'critical', label: 'خطر', min: 0, fill: '#EF4444' },
] as const;

export type AcademicLevelKey = (typeof PERFORMANCE_TIERS)[number]['key'];

export interface AcademicLevelMeta {
  key: AcademicLevelKey;
  label: string;
  description: string;
  badgeClassName: string;
}

const ACADEMIC_LEVEL_META: Record<AcademicLevelKey, AcademicLevelMeta> = {
  excellent: {
    key: 'excellent',
    label: 'ممتاز',
    description: 'أداء مرتفع واستقرار واضح في المتابعة.',
    badgeClassName: 'border-gold-400/30 bg-gold-400/10 text-gold-200',
  },
  healthy: {
    key: 'healthy',
    label: 'جيد',
    description: 'المستوى مطمئن مع حاجة لمتابعة اعتيادية فقط.',
    badgeClassName: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  },
  watch: {
    key: 'watch',
    label: 'تحت المراقبة',
    description: 'يوجد تراجع نسبي ويستحسن التدخل المبكر.',
    badgeClassName: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  },
  critical: {
    key: 'critical',
    label: 'بحاجة إلى تدخل',
    description: 'المؤشرات الحالية تستدعي متابعة قريبة وخطة دعم.',
    badgeClassName: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
  },
};

export const getAcademicLevelMeta = (score: number): AcademicLevelMeta => {
  const tier = PERFORMANCE_TIERS.find((item) => score >= item.min) || PERFORMANCE_TIERS[PERFORMANCE_TIERS.length - 1];
  return ACADEMIC_LEVEL_META[tier.key];
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const formatArabicNumber = (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat('ar-EG', options).format(value);

const formatTrendDate = (value?: string | Date | null) => {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('ar-EG', {
    day: '2-digit',
    month: 'short',
  });
};

const toDateKey = (value?: string | Date | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
};

const getClassLabel = (student: Student) => {
  const className = student.classId?.name || 'غير محدد';
  const grade = student.classId?.grade ? `صف ${student.classId.grade}` : null;
  return [className, grade].filter(Boolean).join(' • ');
};

const getScoreBand = (score: number) => {
  const band = SCORE_BANDS.find((item) => score >= item.min) || SCORE_BANDS[SCORE_BANDS.length - 1];
  return { key: band.key, label: band.label };
};

const buildStudentRow = (
  student: Student,
  attendanceStats: Map<string, { absence: number; late: number; permission: number }>,
  behaviorStats: Map<string, { positive: number; negative: number }>,
): StudentPerformanceRow => {
  const studentId = student._id;
  const attendance = attendanceStats.get(studentId) || { absence: 0, late: 0, permission: 0 };
  const behavior = behaviorStats.get(studentId) || { positive: 0, negative: 0 };

  const attendanceIncidents = attendance.absence + attendance.late + attendance.permission;
  const rawScore = 78
    + Math.max(0, 14 - attendanceIncidents * 2.5)
    + behavior.positive * 7
    - behavior.negative * 12
    - attendance.absence * 16
    - attendance.late * 7
    - attendance.permission * 4;
  const score = Math.round(clamp(rawScore, 0, 100));
  const scoreBand = getScoreBand(score);
  const behaviorIndex = behavior.positive - behavior.negative;
  const isCritical = score < 55 || attendance.absence >= 3 || behavior.negative >= 2;
  const isWatch = !isCritical && (score < 70 || attendance.absence >= 2 || behavior.negative >= 1);

  return {
    id: studentId,
    name: student.userId.name,
    displayName: fullName(student.userId.name),
    classLabel: getClassLabel(student),
    score,
    scoreBand: scoreBand.key,
    scoreBandLabel: scoreBand.label,
    attendanceIncidents,
    absenceCount: attendance.absence,
    lateCount: attendance.late,
    permissionCount: attendance.permission,
    positiveCount: behavior.positive,
    negativeCount: behavior.negative,
    behaviorIndex,
    riskLevel: isCritical ? 'critical' : isWatch ? 'watch' : 'stable',
    isWeak: isCritical || isWatch,
  };
};

const buildTrend = (
  totalStudents: number,
  attendanceRows: AttendanceReportDay[],
  behaviorRecords: BehaviorRecord[],
): PerformanceTrendDatum[] => {
  const groupedBehavior = new Map<string, { positive: number; negative: number }>();

  behaviorRecords.forEach((record) => {
    const dateKey = toDateKey(record.createdAt);
    if (!dateKey) return;
    const current = groupedBehavior.get(dateKey) || { positive: 0, negative: 0 };
    if (record.type === 'positive') current.positive += 1;
    if (record.type === 'negative') current.negative += 1;
    groupedBehavior.set(dateKey, current);
  });

  const dateKeys = new Set<string>();
  attendanceRows.forEach((row) => dateKeys.add(row.date));
  groupedBehavior.forEach((_, key) => dateKeys.add(key));

  return Array.from(dateKeys)
    .sort((left, right) => new Date(left).getTime() - new Date(right).getTime())
    .map((dateKey) => {
      const attendance = attendanceRows.find((row) => row.date === dateKey) || {
        date: dateKey,
        total: 0,
        absence: 0,
        late: 0,
        permission: 0,
      };
      const behavior = groupedBehavior.get(dateKey) || { positive: 0, negative: 0 };
      const denominator = Math.max(totalStudents, 1);
      const attendancePenalty = (
        (attendance.absence / denominator) * 55
        + (attendance.late / denominator) * 25
        + (attendance.permission / denominator) * 12
      );
      const behaviorImpact = ((behavior.positive - behavior.negative * 1.4) / denominator) * 32;

      return {
        date: dateKey,
        label: formatTrendDate(dateKey),
        score: Math.round(clamp(88 - attendancePenalty + behaviorImpact, 0, 100)),
        absence: attendance.absence,
        positive: behavior.positive,
        negative: behavior.negative,
      };
    });
};

const buildInsights = (
  rows: StudentPerformanceRow[],
  successRate: number,
  trend: PerformanceTrendDatum[],
): PerformanceInsight[] => {
  if (!rows.length) {
    return [
      {
        title: 'لا توجد بيانات كافية',
        description: 'أضف سجلات حضور وسلوك خلال الفترة المختارة لبدء التحليل.',
        metric: '0 طالب',
        tone: 'sky',
      },
    ];
  }

  const topStudent = rows[0];
  const classSummary = rows.reduce<Record<string, { totalScore: number; count: number }>>((acc, row) => {
    const current = acc[row.classLabel] || { totalScore: 0, count: 0 };
    current.totalScore += row.score;
    current.count += 1;
    acc[row.classLabel] = current;
    return acc;
  }, {});

  const weakestClassEntry = Object.entries(classSummary)
    .map(([classLabel, summary]) => ({ classLabel, average: summary.totalScore / summary.count }))
    .sort((left, right) => left.average - right.average)[0];

  const latestTrend = trend[trend.length - 1];
  const earliestTrend = trend[0];
  const trendDelta = latestTrend && earliestTrend ? latestTrend.score - earliestTrend.score : 0;

  const insights: PerformanceInsight[] = [
    {
      title: 'أفضل أداء حالياً',
      description: `${topStudent.displayName} يقود اللوحة بأداء متوازن وسلوك إيجابي.`,
      metric: `${formatArabicNumber(topStudent.score)}/100`,
      tone: 'gold',
    },
    {
      title: 'معدل النجاح العام',
      description: successRate >= 80
        ? 'القاعدة الطلابية مستقرة وتحتاج إلى متابعة خفيفة فقط.'
        : 'يوجد هامش واضح لرفع نسبة الطلاب فوق عتبة النجاح.',
      metric: `${formatArabicNumber(successRate, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
      tone: successRate >= 80 ? 'emerald' : 'rose',
    },
    {
      title: 'أكثر مجموعة تحتاج تدخلاً',
      description: weakestClassEntry
        ? `${weakestClassEntry.classLabel} هو الأقل متوسطاً ضمن الفترة الحالية.`
        : 'لا توجد بيانات فصلية كافية حتى الآن.',
      metric: weakestClassEntry ? `${formatArabicNumber(Math.round(weakestClassEntry.average))}/100` : '—',
      tone: weakestClassEntry && weakestClassEntry.average < 70 ? 'rose' : 'sky',
    },
    {
      title: 'اتجاه الأداء',
      description: trendDelta >= 0
        ? 'المسار العام يتحسن مقارنة ببداية الفترة.'
        : 'الاتجاه يميل للهبوط ويحتاج مراجعة سريعة.',
      metric: `${trendDelta >= 0 ? '+' : ''}${formatArabicNumber(Math.round(Math.abs(trendDelta)))}`,
      tone: trendDelta >= 0 ? 'emerald' : 'rose',
    },
  ];

  return insights;
};

const buildAlerts = (rows: StudentPerformanceRow[]): PerformanceAlert[] => rows
  .filter((row) => row.isWeak)
  .map<PerformanceAlert>((row) => ({
    studentId: row.id,
    studentName: row.displayName,
    classLabel: row.classLabel,
    severity: row.riskLevel === 'critical' ? 'critical' : 'warning',
    reason: row.riskLevel === 'critical'
      ? 'تراجع واضح في الأداء مع مؤشرات سلبية متكررة.'
      : 'الطالب قريب من منطقة الخطر ويحتاج متابعة.',
    score: row.score,
  }))
  .sort((left, right) => left.score - right.score)
  .slice(0, 6);

export const buildStudentPerformanceDashboard = ({
  students,
  attendanceRecords,
  attendanceRows,
  behaviorRecords,
}: {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  attendanceRows: AttendanceReportDay[];
  behaviorRecords: BehaviorRecord[];
}): StudentPerformanceDashboard => {
  const attendanceStats = new Map<string, { absence: number; late: number; permission: number }>();
  const behaviorStats = new Map<string, { positive: number; negative: number }>();

  attendanceRecords.forEach((record) => {
    const studentId = record.studentId?._id;
    if (!studentId) return;
    const current = attendanceStats.get(studentId) || { absence: 0, late: 0, permission: 0 };
    if (record.type === 'absence') current.absence += 1;
    if (record.type === 'late') current.late += 1;
    if (record.type === 'permission') current.permission += 1;
    attendanceStats.set(studentId, current);
  });

  behaviorRecords.forEach((record) => {
    const studentId = record.studentId?._id;
    if (!studentId) return;
    const current = behaviorStats.get(studentId) || { positive: 0, negative: 0 };
    if (record.type === 'positive') current.positive += 1;
    if (record.type === 'negative') current.negative += 1;
    behaviorStats.set(studentId, current);
  });

  const studentsRows = students
    .map((student) => buildStudentRow(student, attendanceStats, behaviorStats))
    .sort((left, right) => right.score - left.score);

  const totalStudents = studentsRows.length;
  const highestScore = studentsRows[0]?.score ?? 0;
  const averageScore = totalStudents
    ? studentsRows.reduce((sum, row) => sum + row.score, 0) / totalStudents
    : 0;
  const successRate = totalStudents
    ? (studentsRows.filter((row) => row.score >= 70).length / totalStudents) * 100
    : 0;

  const scoreDistribution = SCORE_BANDS.map((band, index) => {
    const nextBandMin = SCORE_BANDS[index - 1]?.min ?? Infinity;
    const inBand = studentsRows.filter((row) => row.score >= band.min && row.score < nextBandMin);
    return {
      key: band.key,
      label: band.label,
      count: inBand.length,
      fill: band.fill,
    };
  });

  const performanceBreakdown = PERFORMANCE_TIERS.map((tier, index) => {
    const nextTierMin = PERFORMANCE_TIERS[index - 1]?.min ?? Infinity;
    const value = studentsRows.filter((row) => row.score >= tier.min && row.score < nextTierMin).length;
    return {
      key: tier.key,
      label: tier.label,
      value,
      percentage: totalStudents ? (value / totalStudents) * 100 : 0,
      fill: tier.fill,
    };
  });

  const trend = buildTrend(totalStudents, attendanceRows, behaviorRecords);
  const alerts = buildAlerts(studentsRows);
  const insights = buildInsights(studentsRows, successRate, trend);

  return {
    totalStudents,
    averageScore,
    successRate,
    highestScore,
    scoreDistribution,
    performanceBreakdown,
    trend,
    students: studentsRows,
    insights,
    alerts,
  };
};