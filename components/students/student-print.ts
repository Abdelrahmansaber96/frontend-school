import { fullName } from '@/lib/utils';
import type { Student } from '@/types';

const getParentName = (parent: Student['parentId'] | null | undefined) => (
  parent ? fullName(parent.userId.name) : '-'
);

export const buildStudentPrintDocument = (students: Student[], classLabel: string) => {
  const rows = students
    .map(
      (student, index) => `<tr>
        <td>${index + 1}</td>
        <td>${fullName(student.userId.name)}</td>
        <td>${student.nationalId}</td>
        <td>${student.classId?.name ?? '-'} - ${student.classId?.grade ?? ''}${student.classId?.section ? ` (${student.classId.section})` : ''}</td>
        <td>${student.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
        <td>${student.userId.phone ?? '-'}</td>
        <td>${getParentName(student.parentId)}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>كشف الطلاب - ${classLabel}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; padding: 24px; direction: rtl; }
    h1 { text-align: center; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1e293b; color: #fff; padding: 8px; text-align: right; }
    td { padding: 7px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f8fafc; }
  </style>
</head>
<body>
  <h1>كشف أسماء الطلاب</h1>
  <p style="text-align:center;color:#555;margin-bottom:16px">${classLabel} | عدد الطلاب: ${students.length}</p>
  <table>
    <thead>
      <tr>
        <th>#</th><th>اسم الطالب</th><th>رقم الهوية</th><th>الفصل</th><th>الجنس</th><th>الجوال</th><th>ولي الأمر</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
};