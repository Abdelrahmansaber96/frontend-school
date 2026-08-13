import Link from 'next/link';
import { AlertCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import DashboardSection from './DashboardSection';
import type { DashboardAlert } from '@/types';
import { buildAttendanceWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp';

export default function PriorityAlerts({ alerts, schoolName }: { alerts: DashboardAlert[]; schoolName?: string | null }) {
  return (
    <DashboardSection title="تنبيهات تحتاج إجراء" description="مرتبة بحسب الأولوية والأحدث">
      {alerts.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500"><AlertCircle className="h-5 w-5" /></div>
          <p className="mt-3 text-sm font-medium text-ink">لا توجد تنبيهات عاجلة</p>
          <p className="mt-1 text-xs text-ink-dim">ستظهر هنا حالات الغياب والتأخر والسلوك التي تحتاج متابعة.</p>
        </div>
      ) : (
        <div className="divide-y divide-stroke">
          {alerts.map((alert) => {
            const isAttendance = alert.type === 'absence' || alert.type === 'late';
            const whatsappUrl = isAttendance && alert.student ? buildWhatsAppUrl({
              phone: alert.student.parentPhone,
              message: buildAttendanceWhatsAppMessage({ studentName: alert.student.name, date: alert.occurredAt.slice(0, 10), statusLabel: alert.type === 'absence' ? 'غياب' : 'تأخر', schoolName }),
            }) : null;
            return (
              <article key={`${alert.type}-${alert.id}`} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${alert.priority === 'critical' ? 'bg-red-500' : 'bg-orange-500'}`} aria-label={alert.priority === 'critical' ? 'عاجل' : 'مرتفع'} />
                <Link href={alert.href} className="min-w-0 flex-1 rounded-md focus-visible:outline-none">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-sm font-semibold text-ink">{alert.title}</p>
                    {alert.student && <span className="text-xs text-ink-dim">{alert.student.name}</span>}
                  </div>
                  <p className="mt-1 truncate text-xs text-ink-faint">{alert.class ? `${alert.class.grade} · ${alert.class.name}` : 'دون فصل'}{alert.description ? ` — ${alert.description}` : ''}</p>
                </Link>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {whatsappUrl && alert.student && <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label={`مراسلة ولي أمر ${alert.student.name} عبر واتساب`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"><MessageCircle className="h-4 w-4" /> واتساب</a>}
                  <Link href={alert.href} aria-label={`فتح ${alert.title}`} className="rounded-lg border border-stroke p-2 text-ink-dim hover:bg-glaze/[0.05] hover:text-ink"><ArrowLeft className="h-4 w-4" /></Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}
