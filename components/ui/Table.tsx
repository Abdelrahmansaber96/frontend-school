import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T extends { _id: string }> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export default function Table<T extends { _id: string }>({
  columns, data, loading, emptyMessage = 'لا توجد بيانات', onRowClick,
}: TableProps<T>) {
  return (
    <div className="glass-shine overflow-hidden rounded-2xl border border-stroke bg-glaze/[0.02]">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-stroke">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-5 py-3.5 text-start text-[11px] font-semibold uppercase tracking-wider text-ink-faint',
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-stroke border-t-gold-400" />
                    <span className="text-[13px] text-ink-faint">جاري التحميل…</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-[13px] text-ink-faint">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row._id}
                  onClick={() => onRowClick?.(row)}
                  style={{ animationDelay: `${i * 30}ms` }}
                  className={cn(
                    'animate-fade-in border-b border-glaze/[0.04] transition-colors duration-150 last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-glaze/[0.03]',
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-5 py-3.5 text-[13px] text-ink-muted', col.className)}>
                      {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
