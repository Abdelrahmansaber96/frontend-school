'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { notificationsApi } from '@/lib/api';
import { Notification } from '@/types';
import { timeAgo } from '@/lib/utils';
import { getSocket, SOCKET_EVENTS } from '@/lib/socket';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { PageSpinner } from '@/components/ui/Spinner';

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [filterUnread, setFilterUnread] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    const syncNotifications = () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, syncNotifications);
    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, syncNotifications);
    socket.on(SOCKET_EVENTS.NOTIFICATION_READ_ALL, syncNotifications);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_CREATED, syncNotifications);
      socket.off(SOCKET_EVENTS.NOTIFICATION_READ, syncNotifications);
      socket.off(SOCKET_EVENTS.NOTIFICATION_READ_ALL, syncNotifications);
    };
  }, [qc]);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page, filterUnread],
    queryFn: () =>
      notificationsApi
        .list({ page, limit: 20, isRead: filterUnread ? false : undefined })
        .then((r) => r.data),
    staleTime: 10_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const notifications: Notification[] = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    if (type.includes('attendance')) return '📅';
    if (type.includes('behavior')) return '⚠️';
    if (type.includes('message')) return '💬';
    if (type.includes('grade')) return '📊';
    if (type.includes('system')) return '🔔';
    return '🔔';
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="الإشعارات"
        description={`لديك ${data?.meta?.unread ?? unreadCount} إشعار غير مقروء`}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterUnread((v) => !v)}
              className={filterUnread ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : ''}
            >
              {filterUnread ? 'عرض الكل' : 'غير المقروءة فقط'}
            </Button>
            {(data?.meta?.unread ?? unreadCount) > 0 && (
              <Button
                variant="secondary"
                size="sm"
                loading={markAllMutation.isPending}
                onClick={() => markAllMutation.mutate()}
              >
                <CheckCheck className="h-4 w-4 me-1" /> تعليم الكل كمقروء
              </Button>
            )}
          </div>
        }
      />

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white py-16 text-center">
          <Bell className="h-12 w-12 text-gray-200" />
          <h3 className="mt-4 text-base font-medium text-gray-500">ليس هناك شيء جديد!</h3>
          <p className="mt-1 text-sm text-gray-400">لا توجد إشعارات لعرضها</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                !notif.isRead ? 'bg-indigo-50/60' : 'hover:bg-gray-50'
              }`}
            >
              {/* Icon */}
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl ${
                !notif.isRead ? 'bg-indigo-100' : 'bg-gray-100'
              }`}>
                {getNotificationIcon(notif.type)}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${!notif.isRead ? 'text-indigo-900' : 'text-gray-900'}`}>
                    {notif.title}
                  </p>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="text-xs text-gray-400">{timeAgo(notif.createdAt)}</span>
                    {!notif.isRead && (
                      <button
                        onClick={() => markReadMutation.mutate(notif._id)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-100"
                        title="تعليم كمقروء"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-0.5 text-sm text-gray-600">{notif.body}</p>
                {notif.deliveryMethod?.includes('email') && (
                  <p className="mt-1 text-[11px] text-gray-400">
                    {notif.emailSent ? 'تم تسجيل بريد إشعار تجريبي لهذا الحدث.' : 'جار تجهيز بريد إشعار تجريبي.'}
                  </p>
                )}
                {!notif.isRead && (
                  <span className="mt-1.5 inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.meta && (
        <Pagination
          page={data.meta.page}
          pages={data.meta.pages}
          total={data.meta.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
