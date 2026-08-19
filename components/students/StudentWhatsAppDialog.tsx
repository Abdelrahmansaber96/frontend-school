'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, MessageCircle, PhoneOff } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import AlertBanner from '@/components/ui/AlertBanner';
import type { Student } from '@/types';
import { fullName } from '@/lib/utils';
import { applyStudentMessageTemplate, buildWhatsAppUrl, DEFAULT_STUDENT_BROADCAST_TEMPLATE } from '@/lib/whatsapp';

interface Props {
  open: boolean;
  onClose: () => void;
  students: Student[];
  schoolName?: string | null;
  singleStudentId?: string | null;
}

const contactFor = (student: Student) => student.parentId?.userId?.phone
  || student.emergencyContacts?.find((item) => item.phone)?.phone
  || student.userId.phone
  || null;

export default function StudentWhatsAppDialog({ open, onClose, students, schoolName, singleStudentId }: Props) {
  const [template, setTemplate] = useState(DEFAULT_STUDENT_BROADCAST_TEMPLATE);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setSelectedIds(singleStudentId ? [singleStudentId] : students.map((student) => student._id));
    setQueueIndex(0);
  }, [open, singleStudentId, students]);

  const selected = useMemo(() => students.filter((student) => selectedIds.includes(student._id)), [students, selectedIds]);
  const available = selected.filter(contactFor);
  const missing = selected.filter((student) => !contactFor(student));
  const current = available[queueIndex];
  const previewStudent = current || selected[0];
  const preview = previewStudent ? applyStudentMessageTemplate(template, {
    studentName: fullName(previewStudent.userId.name),
    grade: previewStudent.classId?.grade,
    className: previewStudent.classId?.name,
    schoolName,
  }) : '';

  const openNext = () => {
    if (!current) return;
    const url = buildWhatsAppUrl({ phone: contactFor(current), message: preview });
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    setQueueIndex((value) => Math.min(value + 1, available.length));
  };

  return (
    <Modal open={open} onClose={onClose} title={singleStudentId ? 'التواصل مع ولي الأمر' : 'إرسال رسالة للطلاب'} size="xl"
      footer={<div className="flex w-full flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-ink-faint">تم فتح {Math.min(queueIndex, available.length)} من {available.length} — المتبقي {Math.max(available.length - queueIndex, 0)}</span>
        <div className="flex gap-2"><Button variant="secondary" onClick={onClose}>إغلاق</Button><Button onClick={openNext} disabled={!current}><MessageCircle className="h-4 w-4" />{current ? `فتح التالي: ${fullName(current.userId.name)}` : 'اكتملت القائمة'}</Button></div>
      </div>}
    >
      <div className="space-y-4">
        <AlertBanner variant="info">لن تُفتح نوافذ جماعية تلقائيًا. اضغط «فتح التالي» لكل مستلم، ثم أرسل الرسالة يدويًا من واتساب.</AlertBanner>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">نص الرسالة</label>
          <textarea value={template} onChange={(event) => { setTemplate(event.target.value); setQueueIndex(0); }} rows={7} className="w-full rounded-xl border border-stroke bg-glaze/[0.03] p-3 text-sm text-ink outline-none focus:border-gold-400" />
          <p className="mt-1 text-xs text-ink-faint">المتغيرات: {'{اسم_الطالب}'}، {'{الصف}'}، {'{الفصل}'}، {'{اسم_المدرسة}'}</p>
        </div>
        {previewStudent && <div className="rounded-xl border border-stroke bg-glaze/[0.03] p-3"><p className="mb-2 text-xs font-semibold text-ink-faint">معاينة الرسالة</p><p className="whitespace-pre-wrap text-sm leading-7 text-ink">{preview}</p></div>}
        {!singleStudentId && <div className="max-h-64 divide-y overflow-y-auto rounded-xl border border-stroke">
          {students.map((student) => <label key={student._id} className="flex cursor-pointer items-center gap-3 p-3 hover:bg-glaze/[0.04]">
            <input type="checkbox" checked={selectedIds.includes(student._id)} onChange={() => { setSelectedIds((ids) => ids.includes(student._id) ? ids.filter((id) => id !== student._id) : [...ids, student._id]); setQueueIndex(0); }} />
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-ink">{fullName(student.userId.name)}</span><span className="text-xs text-ink-faint">{student.classId?.grade || 'بدون صف'} — {student.classId?.name || 'بدون فصل'}</span></span>
            {contactFor(student) ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <PhoneOff className="h-4 w-4 text-rose-500" />}
          </label>)}
        </div>}
        {missing.length > 0 && <AlertBanner variant="warning">لا يوجد رقم تواصل لـ {missing.length} طالب: {missing.map((student) => fullName(student.userId.name)).join('، ')}</AlertBanner>}
      </div>
    </Modal>
  );
}
