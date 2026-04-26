import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatDate } from '@/lib/utils';
import type { AttendanceReportDay } from '@/types';
import ReportCard from './ReportCard';

interface AttendanceChartCardProps {
  rows: AttendanceReportDay[];
  isLoading: boolean;
}

export default function AttendanceChartCard({ rows, isLoading }: AttendanceChartCardProps) {
  const chartData = rows.map((row) => ({
    date: formatDate(row.date),
    absence: row.absence ?? 0,
    late: row.late ?? 0,
    permission: row.permission ?? 0,
  }));

  return (
    <ReportCard
      title="الحضور حسب اليوم"
      isLoading={isLoading}
      isEmpty={chartData.length === 0}
      emptyMessage="لا توجد بيانات حضور لهذه الفترة"
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eceff3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #d8dde8', fontSize: 12 }} />
          <Bar dataKey="absence" name="غياب" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="late" name="تأخر" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="permission" name="إذن" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ReportCard>
  );
}