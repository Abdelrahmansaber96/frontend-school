import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ReportsDateRangeFiltersProps {
  startDate: string;
  endDate: string;
  isApplying: boolean;
  isInvalidRange: boolean;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onApply: () => void;
}

export default function ReportsDateRangeFilters({
  startDate,
  endDate,
  isApplying,
  isInvalidRange,
  onStartDateChange,
  onEndDateChange,
  onApply,
}: ReportsDateRangeFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-stroke bg-glaze/[0.02] p-4 shadow-sm">
      <div className="min-w-[180px] flex-1">
        <Input
          label="تاريخ البداية"
          type="date"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
        />
      </div>
      <div className="min-w-[180px] flex-1">
        <Input
          label="تاريخ النهاية"
          type="date"
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
        />
      </div>
      <Button onClick={onApply} loading={isApplying} disabled={isInvalidRange}>
        تطبيق الفترة
      </Button>
    </div>
  );
}