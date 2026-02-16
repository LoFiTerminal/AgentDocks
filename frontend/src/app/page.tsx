'use client';

import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { AnimatedSection } from '@/components/AnimatedSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { WhyLocalSection } from '@/components/sections/WhyLocalSection';
import { LiveDemoSection } from '@/components/sections/LiveDemoSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { OpenSourceSection } from '@/components/sections/OpenSourceSection';
import { QuickStartSection } from '@/components/sections/QuickStartSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <NavBar />

      {/* Hero Section */}
      <HeroSection />

      {/* Why Local Section */}
      <AnimatedSection>
        <WhyLocalSection />
      </AnimatedSection>

      {/* Live Demo Section */}
      <AnimatedSection>
        <LiveDemoSection />
      </AnimatedSection>

      {/* How It Works Section */}
      <AnimatedSection>
        <HowItWorksSection />
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection>
        <FeaturesSection />
      </AnimatedSection>

      {/* Open Source Section */}
      <AnimatedSection>
        <OpenSourceSection />
      </AnimatedSection>

      {/* Quick Start Section */}
      <AnimatedSection>
        <QuickStartSection />
      </AnimatedSection>

      {/* Footer */}
      <Footer />
    </div>
  );
}
