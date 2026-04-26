interface ReportCardProps {
  title: string;
  isLoading: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
}

export default function ReportCard({
  title,
  isLoading,
  isEmpty,
  emptyMessage,
  children,
}: ReportCardProps) {
  return (
    <div className="rounded-2xl border border-stroke bg-glaze/[0.02] p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-ink">{title}</h3>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
        </div>
      ) : isEmpty ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-ink-faint">{emptyMessage}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}