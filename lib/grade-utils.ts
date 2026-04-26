import type { AssessmentType, Grade } from '@/types';

export const assessmentTypeLabels: Record<AssessmentType, string> = {
  quiz: 'اختبار قصير',
  exam: 'اختبار',
  assignment: 'واجب',
  project: 'مشروع',
  midterm: 'منتصف الفصل',
  final: 'نهائي',
};

export const getAssessmentTypeLabel = (type: AssessmentType) => assessmentTypeLabels[type] || type;

export const getSubjectDisplayName = (
  subject: { _id?: string | null; code?: string | null; name?: string | null; nameAr?: string | null } | Grade['subjectId'] | null | undefined,
) => subject?.nameAr || subject?.name || 'غير محدد';

export const getPercentageTone = (percentage: number) => {
  if (percentage >= 90) return 'text-gold-300';
  if (percentage >= 75) return 'text-emerald-300';
  if (percentage >= 60) return 'text-amber-300';
  return 'text-rose-300';
};