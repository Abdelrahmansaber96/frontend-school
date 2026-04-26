'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDefaultAppRoute } from '@/lib/app-routes';
import { useAuthStore } from '@/store/auth.store';
import { PageSpinner } from '@/components/ui/Spinner';

export default function AppIndexPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    router.replace(getDefaultAppRoute(user?.role));
  }, [isAuthenticated, router, user?.role]);

  return <PageSpinner />;
}
