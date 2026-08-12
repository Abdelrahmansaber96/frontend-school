'use client';

import { MessageCircle } from 'lucide-react';
import AlertBanner from '@/components/ui/AlertBanner';
import Button from '@/components/ui/Button';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

interface NewAccountWhatsAppNoticeProps {
  tempPassword: string;
  phone?: string | null;
  message: string;
}

export default function NewAccountWhatsAppNotice({ tempPassword, phone, message }: NewAccountWhatsAppNoticeProps) {
  const whatsappUrl = buildWhatsAppUrl({ phone, message });

  return (
    <AlertBanner variant="warning">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p>تم إنشاء الحساب. كلمة المرور المؤقتة: <span className="font-semibold" dir="ltr">{tempPassword}</span></p>
          <p className="mt-1 text-xs">رسالة واتساب متاحة لهذا الحساب الجديد فقط، ولا تُحفظ كلمة المرور بعد مغادرة الصفحة.</p>
        </div>
        <Button type="button" variant="secondary" size="sm" disabled={!whatsappUrl}
          onClick={() => whatsappUrl && window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
          title={whatsappUrl ? 'فتح واتساب برسالة جاهزة' : 'لا يوجد رقم جوال صالح لواتساب'}>
          <MessageCircle className="h-4 w-4" /> إرسال عبر واتساب
        </Button>
      </div>
    </AlertBanner>
  );
}
