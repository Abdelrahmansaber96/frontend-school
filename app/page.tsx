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
    <main className="min-h-screen bg-[#020617] overflow-x-hidden">
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
