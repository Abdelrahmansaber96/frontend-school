import { formatDate } from '@/lib/utils';
import type { AttendanceReportDay, AttendanceReportTotals } from '@/types';

interface AttendanceSummaryTableProps {
  rows: AttendanceReportDay[];
  totals: AttendanceReportTotals | null;
}

export default function AttendanceSummaryTable({ rows, totals }: AttendanceSummaryTableProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stroke bg-glaze/[0.02] shadow-sm">
      <div className="border-b border-stroke px-5 py-4">
        <h3 className="text-sm font-semibold text-ink">جدول ملخص الحضور</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stroke/70">
          <thead className="bg-glaze/[0.04]">
            <tr>
              {['التاريخ', 'غيابات', 'تأخرات', 'أذونات', 'المجموع'].map((header) => (
                <th
                  key={header}
                  className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-ink-faint"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-stroke/70">
            {rows.map((row) => (
              <tr key={row.date} className="hover:bg-glaze/[0.03]">
                <td className="px-5 py-3 text-sm font-medium text-ink">{formatDate(row.date)}</td>
                <td className="px-5 py-3 text-sm font-semibold text-red-500">{row.absence}</td>
                <td className="px-5 py-3 text-sm font-semibold text-amber-500">{row.late}</td>
                <td className="px-5 py-3 text-sm font-semibold text-blue-500">{row.permission}</td>
                <td className="px-5 py-3 text-sm font-semibold text-ink">
                  {row.absence + row.late + row.permission}
                </td>
              </tr>
            ))}

            {totals && (
              <tr className="bg-glaze/[0.05]">
                <td className="px-5 py-3 text-sm font-semibold text-ink">الإجمالي</td>
                <td className="px-5 py-3 text-sm font-semibold text-red-500">{totals.absence}</td>
                <td className="px-5 py-3 text-sm font-semibold text-amber-500">{totals.late}</td>
                <td className="px-5 py-3 text-sm font-semibold text-blue-500">{totals.permission}</td>
                <td className="px-5 py-3 text-sm font-semibold text-ink">{totals.total}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}