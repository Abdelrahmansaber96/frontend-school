'use client';

import { useState, useMemo } from 'react';
import { Plus, Printer } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classesApi, parentsApi, reportsApi, studentsApi } from '@/lib/api';
import { Student, GradeReportResponse } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { fullName, formatDate } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import type { Column } from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import AlertBanner from '@/components/ui/AlertBanner';
import StatusBadge from '@/components/ui/StatusBadge';
import StudentsFilters, { type StudentSortDirection } from '@/components/students/StudentsFilters';
import StudentCreateModal, { type StudentCreateFormValues } from '@/components/students/StudentCreateModal';
import StudentDetailsModal from '@/components/students/StudentDetailsModal';
import { buildStudentPrintDocument } from '@/components/students/student-print';
import {
  getApiErrorMessage,
  getEntityPayload,
  getGradeReportPayload,
  getListPayload,
} from '@/lib/api-contracts';
import { usePaginatedListQuery } from '@/hooks/usePaginatedListQuery';
import { useDisclosure } from '@/hooks/useDisclosure';

type StudentClassOption = {
  _id: string;
  name: string;
  grade: string;
  section?: string;
};

type ParentOption = {
  _id: string;
  userId: { name: { first: string; last: string } };
  nationalId: string;
};

const getParentName = (parent: Student['parentId'] | null | undefined) => (
  parent ? fullName(parent.userId.name) : '-'
);

const academicLevelBadgeStyles = {
  excellent: 'border-gold-400/30 bg-gold-400/10 text-gold-200',
  healthy: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  watch: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  critical: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
};

export default function StudentsPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const createDialog = useDisclosure();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [sortDir, setSortDir] = useState<StudentSortDirection>('none');
  const [selected, setSelected] = useState<Student | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const classesQuery = usePaginatedListQuery<StudentClassOption>({
    queryKey: ['classes-all'],
    queryFn: () => classesApi.list({ page: 1, limit: 200 }),
  });

  const parentsQuery = usePaginatedListQuery<ParentOption>({
    queryKey: ['parents-select'],
    queryFn: () => parentsApi.list({ page: 1, limit: 100 }),
    enabled: createDialog.isOpen,
  });

  const grades = useMemo(() => {
    const all = classesQuery.data?.items ?? [];
    const unique = Array.from(new Set(all.map((c) => c.grade)));
    return unique.sort((a, b) => a.localeCompare(b, 'ar-SA', { numeric: true }));
  }, [classesQuery.data?.items]);

  const visibleClasses = useMemo(() => {
    const all = classesQuery.data?.items ?? [];
    return gradeFilter ? all.filter((c) => c.grade === gradeFilter) : all;
  }, [classesQuery.data?.items, gradeFilter]);

  const queryParams = {
    page,
    limit: 15,
    search,
    ...(classFilter ? { classId: classFilter } : gradeFilter ? { grade: gradeFilter } : {}),
  };

  const studentsQuery = usePaginatedListQuery<Student>({
    queryKey: ['students', page, search, classFilter, gradeFilter],
    queryFn: () => studentsApi.list(queryParams),
    staleTime: 30_000,
  });

  const academicLevelsQuery = useQuery<GradeReportResponse>({
    queryKey: ['students-academic-levels', classFilter || 'all'],
    queryFn: () => reportsApi.grades(classFilter ? { classId: classFilter } : {}).then(getGradeReportPayload),
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  const sortedStudents = useMemo(() => {
    const students = studentsQuery.data?.items ?? [];
    if (sortDir === 'none') return students;
    return [...students].sort((a, b) => {
      const nameA = `${a.userId.name.first} ${a.userId.name.last}`;
      const nameB = `${b.userId.name.first} ${b.userId.name.last}`;
      return sortDir === 'asc'
        ? nameA.localeCompare(nameB, 'ar-SA')
        : nameB.localeCompare(nameA, 'ar-SA');
    });
  }, [studentsQuery.data?.items, sortDir]);

  const toggleSort = () => {
    setSortDir((prev) => (prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none'));
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const printParams = {
        page: 1,
        limit: 500,
        search,
        ...(classFilter ? { classId: classFilter } : gradeFilter ? { grade: gradeFilter } : {}),
      };
      const res = await studentsApi.list(printParams).then(getListPayload<Student>);
      const students = res.items;
      const sorted = [...students].sort((a, b) =>
        `${a.userId.name.first} ${a.userId.name.last}`.localeCompare(
          `${b.userId.name.first} ${b.userId.name.last}`,
          'ar-SA'
        )
      );
      const classLabel = classFilter
        ? visibleClasses.find((c) => c._id === classFilter)?.name ?? ''
        : gradeFilter
        ? `الصف ${gradeFilter}`
        : 'جميع الفصول';
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(buildStudentPrintDocument(sorted, classLabel));
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 400);
      }
    } finally {
      setIsPrinting(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: (values: StudentCreateFormValues) =>
      studentsApi.create({
        name: { first: values.firstName, last: values.lastName },
        nationalId: values.nationalId,
        phone: values.phone,
        gender: values.gender,
        classId: values.classId,
        parentId: values.parentId,
        dateOfBirth: values.dateOfBirth || undefined,
      }).then(getEntityPayload<{ student: Student; tempPassword?: string | null }>),
    onMutate: () => setCreateError(null),
    onSuccess: (response) => {
      setCreatedTempPassword(response.tempPassword ?? null);
      qc.invalidateQueries({ queryKey: ['students'] });
      createDialog.close();
    },
    onError: (error) => {
      setCreateError(getApiErrorMessage(error, 'فشل إنشاء الطالب.'));
    },
  });

  const academicLevelByStudentId = useMemo(() => (
    (academicLevelsQuery.data?.studentBreakdown ?? []).reduce((acc, row) => {
      if (row.student?._id) {
        acc.set(row.student._id, row);
      }
      return acc;
    }, new Map<string, NonNullable<GradeReportResponse['studentBreakdown'][number]>>())
  ), [academicLevelsQuery.data?.studentBreakdown]);

  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'الطالب',
      render: (s: Student) => (
        <div className="flex items-center gap-3">
          <Avatar name={s.userId.name} size="sm" />
          <div>
            <p className="font-medium text-gray-900">{fullName(s.userId.name)}</p>
            <p className="text-xs text-gray-500">{s.nationalId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'الفصل',
      render: (s: Student) => (
        <span className="text-sm text-gray-700">
          {s.classId?.name}
          {s.classId?.grade ? ` - صف ${s.classId.grade}` : ''}
          {s.classId?.section ? ` (${s.classId.section})` : ''}
        </span>
      ),
    },
    {
      key: 'academicLevel',
      header: 'المستوى الحالي',
      render: (s: Student) => {
        const snapshot = academicLevelByStudentId.get(s._id);

        if (academicLevelsQuery.isLoading && !academicLevelsQuery.data) {
          return <span className="text-xs text-gray-400">جاري التحليل…</span>;
        }

        if (!snapshot) {
          return <span className="text-xs text-gray-400">لا توجد تقييمات</span>;
        }

        return (
          <div className="space-y-1">
            <Badge className={academicLevelBadgeStyles[snapshot.academicLevel.key]}>{snapshot.academicLevel.label}</Badge>
            <p className="text-xs text-gray-500">{snapshot.averagePercentage}%</p>
          </div>
        );
      },
    },
    {
      key: 'gender',
      header: 'الجنس',
      render: (s: Student) => (
        <Badge variant={s.gender === 'male' ? 'info' : 'purple'}>
          {s.gender === 'male' ? 'ذكر' : 'أنثى'}
        </Badge>
      ),
    },
    {
      key: 'parent',
      header: 'ولي الأمر',
      render: (s: Student) =>
        s.parentId ? (
          <span className="text-sm text-gray-700">{getParentName(s.parentId)}</span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        ),
    },
    {
      key: 'dob',
      header: 'تاريخ الميلاد',
      render: (s: Student) =>
        s.dateOfBirth ? (
          <span className="text-sm text-gray-700">{formatDate(s.dateOfBirth)}</span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        ),
    },
    {
      key: 'status',
      header: 'الحالة',
      render: (s: Student) => (
        <StatusBadge isActive={s.userId.isActive} />
      ),
    },
  ];

  const canCreate = user?.role === 'school_admin';

  return (
    <div className="space-y-6">
      <PageHeader
        title="الطلاب"
        description="إدارة جميع طلاب المدرسة"
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handlePrint} loading={isPrinting}>
              <Printer className="h-4 w-4 me-1" />
              طباعة الكشف
            </Button>
            {canCreate && (
              <Button onClick={createDialog.open}>
                <Plus className="h-4 w-4 me-1" />
                إضافة طالب
              </Button>
            )}
          </div>
        }
      />

      <StudentsFilters
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        gradeFilter={gradeFilter}
        onGradeChange={(value) => { setGradeFilter(value); setClassFilter(''); setPage(1); }}
        classFilter={classFilter}
        onClassChange={(value) => { setClassFilter(value); setPage(1); }}
        grades={grades}
        classes={visibleClasses}
        sortDir={sortDir}
        onToggleSort={toggleSort}
        onReset={() => { setGradeFilter(''); setClassFilter(''); setPage(1); }}
      />

      {studentsQuery.data?.meta && (
        <div className="space-y-1">
          <p className="text-xs text-gray-500">
            إجمالي الطلاب:{' '}
            <span className="font-semibold text-gray-700">{studentsQuery.data.meta.total}</span>
          </p>
          <p className="text-xs text-gray-400">
            المستوى الحالي مبني على متوسط التقييمات المسجلة لكل مادة، وليس على الحضور والسلوك فقط.
          </p>
        </div>
      )}

      {createdTempPassword && (
        <AlertBanner variant="warning">
          تم إنشاء حساب الطالب. كلمة المرور المؤقتة:
          {' '}
          <span className="font-semibold" dir="ltr">{createdTempPassword}</span>
        </AlertBanner>
      )}

      {academicLevelsQuery.error && (
        <AlertBanner variant="warning">
          {getApiErrorMessage(academicLevelsQuery.error, 'تعذر تحميل المستوى الأكاديمي الحقيقي لبعض الطلاب.')}
        </AlertBanner>
      )}

      <Table<Student>
        columns={columns}
        data={sortedStudents}
        loading={studentsQuery.isLoading}
        onRowClick={setSelected}
      />

      {studentsQuery.data?.meta && (
        <Pagination
          page={studentsQuery.data.meta.page}
          pages={studentsQuery.data.meta.pages}
          total={studentsQuery.data.meta.total}
          onPageChange={setPage}
        />
      )}

      <StudentCreateModal
        open={createDialog.isOpen}
        onClose={createDialog.close}
        onSubmit={(values) => createMutation.mutate(values)}
        isSubmitting={createMutation.isPending}
        classes={classesQuery.data?.items ?? []}
        parents={parentsQuery.data?.items ?? []}
        errorMessage={createError}
      />

      <StudentDetailsModal
        student={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onStudentUpdate={(updatedStudent) => setSelected(updatedStudent)}
      />
    </div>
  );
}