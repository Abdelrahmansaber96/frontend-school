'use client';

import { useEffect } from 'react';
import { schoolsApi } from '@/lib/api';
import { useSchoolBrandingStore } from '@/store/branding.store';

/**
 * Fetches the current school branding from the authenticated school context and applies
 * primary/secondary colors as CSS custom properties on :root so the entire
 * theme adapts per-school automatically.
 */
export default function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { setBranding, isLoaded, branding } = useSchoolBrandingStore();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await schoolsApi.getCurrent();
        if (!cancelled && data?.data) {
          const school = data.data;
          setBranding({
            schoolName: school.name,
            schoolNameAr: school.nameAr,
            branding: school.branding,
            logo: school.logo,
          });
        }
      } catch {
        // No school context (e.g. super_admin on bare domain) — use defaults
        if (!cancelled) {
          setBranding({});
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, [setBranding]);

  // Apply CSS custom properties for branding colors
  useEffect(() => {
    if (!isLoaded) return;
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', branding.primaryColor);
    root.style.setProperty('--brand-secondary', branding.secondaryColor);
    if (branding.accentColor) {
      root.style.setProperty('--brand-accent', branding.accentColor);
    }
  }, [isLoaded, branding]);

  return <>{children}</>;
}
