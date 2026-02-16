'use client';

import { useState, useEffect } from 'react';

interface Step {
  icon: string;
  text: string;
  delay: number;
}

const DEMO_SCENARIOS: Step[][] = [
  // Scenario 1: Bitcoin Price
  [
    { icon: '>', text: 'Build a Python script that fetches Bitcoin price', delay: 0 },
    { icon: '⚡', text: 'Creating sandbox...', delay: 800 },
    { icon: '🟣', text: 'bash: pip install requests', delay: 1100 },
    { icon: '✅', text: 'Successfully installed requests', delay: 1400 },
    { icon: '🟣', text: 'write: bitcoin.py', delay: 1700 },
    { icon: '🟣', text: 'bash: python bitcoin.py', delay: 2000 },
    { icon: '✅', text: 'Bitcoin: $97,432.50', delay: 2300 },
    { icon: '✓', text: 'Done. Sandbox destroyed.', delay: 2600 },
  ],
  // Scenario 2: Data Analysis
  [
    { icon: '>', text: 'Analyze sales.csv and create charts', delay: 0 },
    { icon: '⚡', text: 'Creating sandbox...', delay: 800 },
    { icon: '🟣', text: 'read: sales.csv (1,247 rows)', delay: 1100 },
    { icon: '🟣', text: 'bash: pip install pandas matplotlib', delay: 1400 },
    { icon: '🟣', text: 'write: analyze.py', delay: 1700 },
    { icon: '🟣', text: 'bash: python analyze.py', delay: 2000 },
    { icon: '✅', text: 'Created: revenue_chart.png, growth_chart.png', delay: 2300 },
    { icon: '✓', text: 'Done. 2 files created.', delay: 2600 },
  ],
  // Scenario 3: Web Scraping
  [
    { icon: '>', text: 'Scrape Hacker News top 10 posts and save to JSON', delay: 0 },
    { icon: '⚡', text: 'Creating sandbox...', delay: 800 },
    { icon: '🟣', text: 'bash: pip install beautifulsoup4 requests', delay: 1100 },
    { icon: '🟣', text: 'write: scraper.py', delay: 1400 },
    { icon: '🟣', text: 'bash: python scraper.py', delay: 1700 },
    { icon: '✅', text: 'Scraped 10 posts', delay: 2000 },
    { icon: '🟣', text: 'write: hackernews_top10.json', delay: 2300 },
    { icon: '✓', text: 'Done. Sandbox destroyed.', delay: 2600 },
  ],
  // Scenario 4: Code Review
  [
    { icon: '>', text: 'Review auth.js and suggest improvements', delay: 0 },
    { icon: '⚡', text: 'Creating sandbox...', delay: 800 },
    { icon: '🟣', text: 'read: auth.js (342 lines)', delay: 1100 },
    { icon: '🟣', text: 'Analyzing security patterns...', delay: 1400 },
    { icon: '✅', text: 'Found: 2 security issues, 3 optimization tips', delay: 1700 },
    { icon: '🟣', text: 'write: code_review.md', delay: 2000 },
    { icon: '✅', text: 'Review complete with examples', delay: 2300 },
    { icon: '✓', text: 'Done. Sandbox destroyed.', delay: 2600 },
  ],
  // Scenario 5: DevOps Automation
  [
    { icon: '>', text: 'Generate Kubernetes deployment config for my API', delay: 0 },
    { icon: '⚡', text: 'Creating sandbox...', delay: 800 },
    { icon: '🟣', text: 'read: package.json', delay: 1100 },
    { icon: '🟣', text: 'write: deployment.yaml', delay: 1400 },
    { icon: '🟣', text: 'write: service.yaml', delay: 1700 },
    { icon: '🟣', text: 'write: ingress.yaml', delay: 2000 },
    { icon: '✅', text: 'Created 3 config files with best practices', delay: 2300 },
    { icon: '✓', text: 'Done. Ready to deploy.', delay: 2600 },
  ],
];

export const AnimatedTerminal = () => {
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [isResetting, setIsResetting] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<number>(0);

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    const DEMO_STEPS = DEMO_SCENARIOS[currentScenario];

    const runAnimation = () => {
      // Reset
      setVisibleSteps(0);
      setIsResetting(true);

      // Small delay before starting
      setTimeout(() => {
        setIsResetting(false);

        // Show steps one by one
        DEMO_STEPS.forEach((step, index) => {
          const timeout = setTimeout(() => {
            setVisibleSteps(index + 1);
          }, step.delay);
          timeouts.push(timeout);
        });

        // Loop: move to next scenario after all steps are shown + 3 seconds
        const loopTimeout = setTimeout(() => {
          setCurrentScenario((prev) => (prev + 1) % DEMO_SCENARIOS.length);
        }, DEMO_STEPS[DEMO_STEPS.length - 1].delay + 3000);
        timeouts.push(loopTimeout);
      }, 300);
    };

    runAnimation();

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [currentScenario]);

  return (
    <div className="relative">
      {/* Terminal Window */}
      <div className="bg-[#0D0C0A] rounded-xl border border-[#F59E0B]/20 shadow-2xl shadow-[#F59E0B]/10 overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-[#1C1917] border-b border-[#292524] px-4 py-3 flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-muted-foreground font-mono">agent-session</span>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-6 font-mono text-sm min-h-[320px]">
          <div
            className={`space-y-3 transition-opacity duration-300 ${
              isResetting ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {DEMO_SCENARIOS[currentScenario].slice(0, visibleSteps).map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span
                  className={`flex-shrink-0 ${
                    step.icon === '>'
                      ? 'text-[#F59E0B]'
                      : step.icon === '✅' || step.icon === '✓'
                      ? 'text-green-500'
                      : step.icon === '⚡'
                      ? 'text-blue-400'
                      : 'text-purple-400'
                  }`}
                >
                  {step.icon}
                </span>
                <span
                  className={`${
                    step.icon === '>'
                      ? 'text-foreground font-semibold'
                      : step.icon === '✅' || step.icon === '✓'
                      ? 'text-green-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.text}
                  {index === visibleSteps - 1 && index < DEMO_SCENARIOS[currentScenario].length - 1 && (
                    <span className="inline-block w-2 h-4 ml-1 bg-[#F59E0B] animate-pulse" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#F59E0B]/20 to-transparent blur-xl -z-10 opacity-50" />
    </div>
  );
};
