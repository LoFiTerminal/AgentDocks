'use client';

import { CodeTabs } from '@/components/CodeTabs';

export const QuickStartSection = () => {
  return (
    <section id="quick-start" className="py-24 px-6 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">
          Up and Running in 60 Seconds
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-16">
          Choose your installation method
        </p>

        <CodeTabs />
      </div>
    </section>
  );
};
