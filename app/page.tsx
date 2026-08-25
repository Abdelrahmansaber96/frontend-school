'use client';

import {
  Navbar,
  Hero,
  Features,
  HowItWorks,
  Roles,
  WhyBasma,
  Pricing,
  CTASection,
  Footer,
} from '@/components/landing';

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7FAF8] text-[#123B5D] dark:bg-[#071F24]">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Roles />
      <WhyBasma />
      <Pricing />
      <CTASection />
      <Footer />
    </main>
  );
}
