import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import PrivacyGapSection from '../components/sections/PrivacyGapSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import RiskDemoSection from '../components/sections/RiskDemoSection';
import CTASection from '../components/sections/CTASection';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <PrivacyGapSection />
      <FeaturesSection />
      <RiskDemoSection />
      <CTASection />
    </main>
  );
}
