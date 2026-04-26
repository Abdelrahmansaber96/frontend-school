import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onPageChange: (p: number) => void;
}

export default function Pagination({ page, pages, total, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  const range = Array.from({ length: Math.min(pages, 5) }, (_, i) => {
    if (pages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= pages - 2) return pages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="flex items-center justify-between px-1 py-4">
      <p className="text-[12px] text-ink-faint">
        {total} سجل
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg p-1.5 text-ink-faint hover:bg-glaze/[0.06] hover:text-ink-dim disabled:opacity-30 transition-all duration-200"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        {range.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'h-8 w-8 rounded-lg text-[13px] font-medium transition-all duration-200',
              p === page
                ? 'bg-glaze/[0.08] text-ink border border-stroke-strong shadow-sm'
                : 'text-ink-faint hover:bg-glaze/[0.04] hover:text-ink-dim',
            )}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === pages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg p-1.5 text-ink-faint hover:bg-glaze/[0.06] hover:text-ink-dim disabled:opacity-30 transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
