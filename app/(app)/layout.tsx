'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto scroll-smooth bg-[#f6f7fb] px-3 py-4 dark:bg-[var(--background)] sm:px-4 lg:px-6 lg:py-5">
          <div className="mx-auto max-w-[1440px] animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
