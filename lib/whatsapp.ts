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
  schoolName,
}: {
  studentName: string;
  date: string;
  statusLabel: string;
  notes?: string | null;
  schoolName?: string | null;
}) => joinMessageLines([
  statusLabel === 'غياب'
    ? `المكرم ولي أمر الطالب/الطالبة: ${studentName}`
    : 'السلام عليكم،',
  statusLabel === 'غياب'
    ? 'السلام عليكم ورحمة الله وبركاته،'
    : `نود إشعاركم بأن حالة الطالب/الطالبة ${studentName} بتاريخ ${date} هي: ${statusLabel}.`,
  statusLabel === 'غياب'
    ? `تفيدكم إدارة المدرسة بأن ابنكم/ابنتكم قد تغيب(ت) عن الدوام المدرسي اليوم ${new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(new Date(`${date}T12:00:00`))} الموافق ${new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(`${date}T12:00:00`))}، دون إشعار مسبق أو عذر مقبول.`
    : (notes ? `ملاحظات المعلم: ${notes}` : null),
  statusLabel === 'غياب'
    ? 'يرجى التواصل مع إدارة المدرسة لتوضيح سبب الغياب، أو تزويدنا بعذر طبي إذا كان الغياب لظروف صحية، وذلك لحرصنا على مصلحته التعليمية.'
    : null,
  statusLabel === 'غياب' ? 'شاكرين ومقدرين حسن تعاونكم معنا.' : null,
  `إدارة مدرسة: ${schoolName || 'المدرسة'}`,
]);

export const buildStudentWelcomeWhatsAppMessage = ({
  studentName,
  grade,
  className,
  schoolName,
}: {
  studentName: string;
  grade?: string | null;
  className?: string | null;
  schoolName?: string | null;
}) => joinMessageLines([
  `المكرم ولي أمر الطالب/الطالبة: ${studentName}`,
  'السلام عليكم ورحمة الله وبركاته،',
  `يسر إدارة مدرسة ${schoolName || 'المدرسة'} الترحيب بكم وبابنكم/ابنتكم ${studentName}.`,
  `الصف: ${grade || 'غير محدد'}`,
  `الفصل: ${className || 'غير محدد'}`,
  'نتطلع إلى عام دراسي موفق ومثمر، ونشكر لكم تعاونكم المستمر.',
  `إدارة مدرسة: ${schoolName || 'المدرسة'}`,
]);

export const DEFAULT_STUDENT_BROADCAST_TEMPLATE = joinMessageLines([
  'المكرم ولي أمر الطالب/الطالبة: {اسم_الطالب}',
  'السلام عليكم ورحمة الله وبركاته،',
  'يسر {اسم_المدرسة} الترحيب بكم وبابنكم/ابنتكم.',
  'الصف: {الصف}',
  'الفصل: {الفصل}',
  'شاكرين لكم حسن تعاونكم.',
]);

export const applyStudentMessageTemplate = (template: string, values: {
  studentName: string;
  grade?: string | null;
  className?: string | null;
  schoolName?: string | null;
}) => template
  .replaceAll('{اسم_الطالب}', values.studentName || '—')
  .replaceAll('{الصف}', values.grade || 'غير محدد')
  .replaceAll('{الفصل}', values.className || 'غير محدد')
  .replaceAll('{اسم_المدرسة}', values.schoolName || 'المدرسة');

export const buildRecoveryCodeWhatsAppMessage = ({ studentName, code }: { studentName: string; code: string }) => joinMessageLines([
  'السلام عليكم ورحمة الله وبركاته،',
  `رمز استعادة حساب الطالب/الطالبة ${studentName}: ${code}`,
  'الرمز صالح لمدة 10 دقائق ويستخدم مرة واحدة فقط. لا تشاركه مع أي شخص.',
]);

export const buildPasswordChangedConfirmationMessage = ({ studentName }: { studentName: string }) => joinMessageLines([
  'السلام عليكم ورحمة الله وبركاته،',
  `تم تغيير كلمة مرور حساب الطالب/الطالبة ${studentName} بنجاح.`,
  'إذا لم يتم هذا الإجراء بمعرفتكم يرجى التواصل مع إدارة المدرسة فورًا.',
]);

export const buildPasswordResetWhatsAppMessage = ({ name, identifier, tempPassword }: {
  name: string; identifier: string; tempPassword: string;
}) => joinMessageLines([
  'السلام عليكم ورحمة الله وبركاته،',
  `تمت إعادة تعيين كلمة المرور المؤقتة لحساب ${name}.`,
  `اسم المستخدم/رقم الهوية: ${identifier}`,
  `كلمة المرور المؤقتة: ${tempPassword}`,
  `رابط الموقع: ${getSiteUrl()}`,
  'يرجى تغييرها عند تسجيل الدخول. لن يمكن عرض هذه الكلمة مرة أخرى.',
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
