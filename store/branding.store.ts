'use client';

import { create } from 'zustand';
import { SchoolBranding } from '@/types';

interface SchoolBrandingStore {
  schoolName: string | null;
  schoolNameAr: string | null;
  subdomain: string | null;
  branding: SchoolBranding;
  logo: string | null;
  isLoaded: boolean;
  setBranding: (data: {
    schoolName?: string;
    schoolNameAr?: string;
    subdomain?: string;
    branding?: SchoolBranding;
    logo?: string | null;
  }) => void;
  reset: () => void;
}

const DEFAULT_BRANDING: SchoolBranding = {
  primaryColor: '#C8A24D',
  secondaryColor: '#0a0e1a',
  accentColor: null,
  logoUrl: null,
  faviconUrl: null,
};

export const useSchoolBrandingStore = create<SchoolBrandingStore>()((set) => ({
  schoolName: null,
  schoolNameAr: null,
  subdomain: null,
  branding: DEFAULT_BRANDING,
  logo: null,
  isLoaded: false,

  setBranding: (data) =>
    set({
      schoolName: data.schoolName ?? null,
      schoolNameAr: data.schoolNameAr ?? null,
      subdomain: data.subdomain ?? null,
      branding: data.branding ? { ...DEFAULT_BRANDING, ...data.branding } : DEFAULT_BRANDING,
      logo: data.logo ?? null,
      isLoaded: true,
    }),

  reset: () =>
    set({
      schoolName: null,
      schoolNameAr: null,
      subdomain: null,
      branding: DEFAULT_BRANDING,
      logo: null,
      isLoaded: false,
    }),
}));
