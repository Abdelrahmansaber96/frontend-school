const Block = ({ className }: { className: string }) => <div className={`animate-pulse rounded-2xl border border-stroke bg-glaze/[0.035] ${className}`} />;

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="جاري تحميل لوحة التحكم" aria-busy="true">
      <Block className="h-40" />
      <div className="grid grid-cols-12 gap-4"><Block className="col-span-12 h-72 lg:col-span-8" /><Block className="col-span-12 h-72 lg:col-span-4" /></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Block className="h-32" /><Block className="h-32" /><Block className="h-32" /><Block className="h-32" /></div>
    </div>
  );
}
