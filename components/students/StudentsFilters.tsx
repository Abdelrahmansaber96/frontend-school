import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import Button from '@/components/ui/Button';
import SearchField from '@/components/ui/SearchField';
import SelectField from '@/components/ui/SelectField';

export type StudentSortDirection = 'none' | 'asc' | 'desc';

export interface StudentClassOption {
  _id: string;
  name: string;
  grade: string;
  section?: string;
}

interface StudentsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  gradeFilter: string;
  onGradeChange: (value: string) => void;
  classFilter: string;
  onClassChange: (value: string) => void;
  grades: string[];
  classes: StudentClassOption[];
  sortDir: StudentSortDirection;
  onToggleSort: () => void;
  onReset: () => void;
}

export default function StudentsFilters({
  search,
  onSearchChange,
  gradeFilter,
  onGradeChange,
  classFilter,
  onClassChange,
  grades,
  classes,
  sortDir,
  onToggleSort,
  onReset,
}: StudentsFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <SearchField
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="البحث بالاسم أو رقم الهوية..."
        containerClassName="min-w-[200px] flex-1"
      />

      <SelectField
        value={gradeFilter}
        onChange={(event) => onGradeChange(event.target.value)}
        className="min-w-[140px]"
      >
        <option value="">كل الصفوف</option>
        {grades.map((grade) => (
          <option key={grade} value={grade}>صف {grade}</option>
        ))}
      </SelectField>

      <SelectField
        value={classFilter}
        onChange={(event) => onClassChange(event.target.value)}
        className="min-w-[180px]"
      >
        <option value="">كل الفصول</option>
        {classes.map((classOption) => (
          <option key={classOption._id} value={classOption._id}>
            {classOption.name} - صف {classOption.grade}{classOption.section ? ` (${classOption.section})` : ''}
          </option>
        ))}
      </SelectField>

      <Button variant={sortDir === 'none' ? 'outline' : 'secondary'} onClick={onToggleSort}>
        {sortDir === 'desc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />}
        <span>{sortDir === 'desc' ? 'ي ← أ' : 'أ ← ي'}</span>
      </Button>

      {(gradeFilter || classFilter) && (
        <Button variant="ghost" onClick={onReset}>مسح الفلاتر</Button>
      )}
    </div>
  );
}