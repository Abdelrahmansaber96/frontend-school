'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Menu, Bell, LogOut, User, ChevronDown, Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/auth.store';
import { notificationsApi, authApi } from '@/lib/api';
import { getSocket, SOCKET_EVENTS } from '@/lib/socket';
import Avatar from '@/components/ui/Avatar';
import { fullName } from '@/lib/utils';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data: unread = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationsApi.getUnreadCount().then((res) => res.data.data.count),
    enabled: !!user?._id,
    staleTime: 10_000,
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const socket = getSocket();
    const syncUnreadCount = () => {
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, syncUnreadCount);
    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, syncUnreadCount);
    socket.on(SOCKET_EVENTS.NOTIFICATION_READ_ALL, syncUnreadCount);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION_CREATED, syncUnreadCount);
      socket.off(SOCKET_EVENTS.NOTIFICATION_READ, syncUnreadCount);
      socket.off(SOCKET_EVENTS.NOTIFICATION_READ_ALL, syncUnreadCount);
    };
  }, [qc]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { }
    clearAuth();
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-stroke bg-white/80 dark:bg-navy-900/60 backdrop-blur-2xl px-4 lg:px-8">
      {/* Subtle top shine */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-glaze/[0.08] to-transparent" />

      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-ink-faint hover:bg-glaze/[0.06] hover:text-ink-dim transition-all duration-200 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Right section */}
      <div className="ms-auto flex items-center gap-2">

        {/* Dark / Light toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-xl p-2 text-ink-faint hover:bg-glaze/[0.06] hover:text-ink-dim transition-all duration-200"
            title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {theme === 'dark'
              ? <Sun className="h-[18px] w-[18px]" />
              : <Moon className="h-[18px] w-[18px]" />
            }
          </button>
        )}

        {/* Notifications bell */}
        <button
          onClick={() => router.push('/notifications')}
          className="relative rounded-xl p-2 text-ink-faint hover:bg-glaze/[0.06] hover:text-ink-dim transition-all duration-200"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute end-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-r from-gold-500 to-gold-400 px-1 text-[9px] font-bold text-navy-950 shadow-sm">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-stroke" />

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-glaze/[0.04] transition-all duration-200"
          >
            <Avatar name={user?.name} size="sm" />
            <span className="hidden text-[13px] font-medium text-ink-muted md:block">
              {fullName(user?.name)}
            </span>
            <ChevronDown className="hidden h-3 w-3 text-ink-faint md:block" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute end-0 z-20 mt-2 w-52 animate-fade-in-down rounded-xl border border-stroke bg-white/98 dark:bg-navy-900/95 backdrop-blur-2xl py-1.5 depth-3">
                <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-l from-transparent via-glaze/10 to-transparent" />
                <button
                  onClick={() => { setDropdownOpen(false); router.push('/profile'); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-ink-muted hover:bg-glaze/[0.06] hover:text-ink transition-colors duration-150"
                >
                  <User className="h-4 w-4" /> الملف الشخصي
                </button>
                <div className="mx-3 my-1 h-px bg-stroke" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 dark:text-red-400/80 hover:bg-red-500/[0.08] hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
                >
                  <LogOut className="h-4 w-4" /> تسجيل الخروج
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
