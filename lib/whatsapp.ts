const DEFAULT_WHATSAPP_COUNTRY_CODE = (
  process.env.NEXT_PUBLIC_WHATSAPP_COUNTRY_CODE || '966'
).replace(/\D/g, '') || '966';

const joinMessageLines = (lines: Array<string | null | undefined>) => lines
  .map((line) => String(line || '').trim())
  .filter(Boolean)
  .join('\n');

export const normalizePhoneForWhatsApp = (phone?: string | null) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('00')) {
    return digits.slice(2);
  }

  if (digits.startsWith(DEFAULT_WHATSAPP_COUNTRY_CODE)) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `${DEFAULT_WHATSAPP_COUNTRY_CODE}${digits.slice(1)}`;
  }

  return digits;
};

export const buildWhatsAppUrl = ({ phone, message }: { phone?: string | null; message: string }) => {
  const normalizedPhone = normalizePhoneForWhatsApp(phone);
  const trimmedMessage = String(message || '').trim();

  if (!normalizedPhone || !trimmedMessage) {
    return null;
  }

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(trimmedMessage)}`;
};

const getSiteUrl = () => (
  process.env.NEXT_PUBLIC_APP_URL
  || (typeof window !== 'undefined' ? window.location.origin : '')
).replace(/\/$/, '');

export const buildTeacherAccountWhatsAppMessage = ({ teacherName, nationalId, tempPassword }: {
  teacherName: string; nationalId: string; tempPassword: string;
}) => joinMessageLines([
  'السلام عليكم،', `تم إنشاء حساب المعلم ${teacherName}.`, `اسم المستخدم: ${nationalId}`,
  `كلمة المرور المؤقتة: ${tempPassword}`, `رابط الموقع: ${getSiteUrl()}`,
  'يرجى تغيير كلمة المرور عند تسجيل الدخول لأول مرة.',
]);

export const buildStudentAccountWhatsAppMessage = ({ studentName, nationalId, tempPassword }: {
  studentName: string; nationalId: string; tempPassword: string;
}) => joinMessageLines([
  'السلام عليكم،', `تم إنشاء حساب الطالب ${studentName}.`, `هوية الطالب: ${nationalId}`,
  `كلمة المرور المؤقتة: ${tempPassword}`, `رابط الموقع: ${getSiteUrl()}`,
]);

export const buildParentAccountWhatsAppMessage = ({ parentName, nationalId, tempPassword }: {
  parentName: string; nationalId: string; tempPassword: string;
}) => joinMessageLines([
  'السلام عليكم،', `تم إنشاء حساب ولي الأمر ${parentName}.`, `اسم المستخدم: ${nationalId}`,
  `كلمة المرور المؤقتة: ${tempPassword}`, `رابط الموقع: ${getSiteUrl()}`,
  'يرجى تغيير كلمة المرور عند تسجيل الدخول لأول مرة.',
]);

export const buildAttendanceWhatsAppMessage = ({
  studentName,
  date,
  statusLabel,
  notes,
}: {
  studentName: string;
  date: string;
  statusLabel: string;
  notes?: string | null;
}) => joinMessageLines([
  'السلام عليكم،',
  `نود إشعاركم بأن حالة الطالب/الطالبة ${studentName} بتاريخ ${date} هي: ${statusLabel}.`,
  notes ? `ملاحظات المعلم: ${notes}` : null,
  'مع التحية، إدارة المدرسة.',
]);

export const buildBehaviorWhatsAppMessage = ({
  studentName,
  behaviorLabel,
  category,
  description,
}: {
  studentName: string;
  behaviorLabel: string;
  category?: string | null;
  description: string;
}) => joinMessageLines([
  'السلام عليكم،',
  `تم تسجيل ملاحظة ${behaviorLabel} على الطالب/الطالبة ${studentName}.`,
  category ? `الفئة: ${category}` : null,
  `التفاصيل: ${description}`,
  'مع التحية، إدارة المدرسة.',
]);
