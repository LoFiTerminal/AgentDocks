'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);

  useEffect(() => {
    const checkLocalhostAndConfig = async () => {
      // Check if running on localhost
      const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      if (!isLocalhost) {
        // On public site, show marketing page
        setIsCheckingConfig(false);
        return;
      }

      // On localhost, check if onboarding is complete
      try {
        const response = await fetch('/api/config', {
          method: 'GET',
          cache: 'no-store'
        });

        if (response.ok) {
          const config = await response.json();

          // If config exists and has required fields, redirect to dashboard
          if (config && config.provider && config.apiKey) {
            router.push('/dashboard');
            return;
          }
        }

        // If no config or incomplete, redirect to onboarding
        router.push('/onboarding');
      } catch (error) {
        // If API call fails (backend not running), redirect to onboarding
        router.push('/onboarding');
      }
    };

    checkLocalhostAndConfig();
  }, [router]);

  // Show loading state while checking on localhost
  if (isCheckingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
