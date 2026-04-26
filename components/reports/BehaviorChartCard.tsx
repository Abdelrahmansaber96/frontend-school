import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import ReportCard from './ReportCard';

interface BehaviorChartCardProps {
  positive: number;
  negative: number;
  isLoading: boolean;
}

const COLORS = ['#10b981', '#ef4444'];

export default function BehaviorChartCard({ positive, negative, isLoading }: BehaviorChartCardProps) {
  const chartData = [
    { type: 'إيجابي', count: positive },
    { type: 'سلبي', count: negative },
  ];

  return (
    <ReportCard
      title="توزيع السلوك"
      isLoading={isLoading}
      isEmpty={chartData.every((row) => row.count === 0)}
      emptyMessage="لا توجد بيانات سلوك لهذه الفترة"
    >
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="type"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine
          >
            {chartData.map((row, index) => (
              <Cell key={row.type} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #d8dde8', fontSize: 12 }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ReportCard>
  );
}