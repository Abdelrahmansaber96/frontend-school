'use client';

import { useMemo, useState } from 'react';
import { CheckSquare, MessageCircle, Square } from 'lucide-react';
import Button from '@/components/ui/Button';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

export interface ImportedAccountWhatsAppItem {
  id: string;
  name: string;
  phone: string;
  message: string;
}

interface ImportedAccountsWhatsAppPanelProps {
  accounts: ImportedAccountWhatsAppItem[];
}

export default function ImportedAccountsWhatsAppPanel({ accounts }: ImportedAccountsWhatsAppPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => accounts.map((account) => account.id));
  const selectableAccounts = useMemo(() => accounts.filter((account) => buildWhatsAppUrl(account)), [accounts]);
  const selectedAccounts = selectableAccounts.filter((account) => selectedIds.includes(account.id));

  const toggleAccount = (id: string) => setSelectedIds((current) => (
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
  ));

  const openSelectedChats = () => {
    selectedAccounts.forEach((account) => {
      const url = buildWhatsAppUrl(account);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    });
  };

  if (!accounts.length) return null;

  return (
    <div className="mt-4 border-t border-current/15 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">إرسال بيانات الحسابات المستوردة عبر واتساب</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedIds(selectableAccounts.map((account) => account.id))}>
            <CheckSquare className="h-4 w-4" /> اختيار الكل
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
            <Square className="h-4 w-4" /> إلغاء التحديد
          </Button>
          <Button type="button" size="sm" variant="secondary" disabled={!selectedAccounts.length} onClick={openSelectedChats}>
            <MessageCircle className="h-4 w-4" /> فتح واتساب للمحددين ({selectedAccounts.length})
          </Button>
        </div>
      </div>
      <p className="mt-2 text-xs opacity-80">كل محادثة تحتوي على كلمة مرور مؤقتة للحساب الجديد. قد يطلب المتصفح السماح بفتح عدة نوافذ واتساب.</p>
      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto rounded-lg border border-current/15 p-2">
        {accounts.map((account) => {
          const url = buildWhatsAppUrl(account);
          const selected = selectedIds.includes(account.id);
          return (
            <label key={account.id} className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-black/5 dark:hover:bg-white/5">
              <span className="flex min-w-0 items-center gap-2">
                <input type="checkbox" checked={selected} disabled={!url} onChange={() => toggleAccount(account.id)} />
                <span className="truncate">{account.name}</span>
              </span>
              <Button type="button" size="sm" variant="ghost" disabled={!url} onClick={() => url && window.open(url, '_blank', 'noopener,noreferrer')}>
                <MessageCircle className="h-4 w-4" /> واتساب
              </Button>
            </label>
          );
        })}
      </div>
    </div>
  );
}
