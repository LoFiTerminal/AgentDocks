'use client';

import { useRouter } from 'next/navigation';

export const LiveDemoSection = () => {
  const router = useRouter();

  const outputs = [
    { type: 'status', text: '⚡ Sandbox created (Docker)', color: 'text-blue-400' },
    { type: 'tool', text: '🟣 read: sales.csv', detail: '(247 rows, 8 columns)', color: 'text-purple-400' },
    { type: 'tool', text: '🟣 bash: python analyze.py', color: 'text-purple-400' },
    { type: 'tool', text: '🟣 write: report.html (created)', color: 'text-purple-400' },
    { type: 'tool', text: '🟣 bash: python create_charts.py', color: 'text-purple-400' },
    { type: 'file', text: '📄 chart_revenue.png', detail: '(24KB)', color: 'text-green-400' },
    { type: 'file', text: '📄 chart_growth.png', detail: '(18KB)', color: 'text-green-400' },
    { type: 'text', text: 'Analysis complete. Revenue grew 23% QoQ...', color: 'text-foreground' },
    { type: 'done', text: '✓ 3 files created. Sandbox destroyed.', color: 'text-green-500' },
  ];

  return (
    <div className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16">See It In Action</h2>

        <div className="bg-[#0D0C0A] rounded-2xl border border-[#292524] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#292524]">
            <div className="p-8">
              <div className="text-sm text-[#F59E0B] font-semibold mb-4">USER INPUT</div>
              <p className="text-lg font-mono">
                Analyze sales.csv and create a report with charts
              </p>
            </div>

            <div className="p-8 bg-[#0D0C0A]">
              <div className="text-sm text-[#F59E0B] font-semibold mb-4">AGENT OUTPUT</div>
              <div className="space-y-3 font-mono text-sm max-h-80 overflow-y-auto">
                {outputs.map((output, i) => (
                  <div key={i} className={output.color}>
                    {output.text}{' '}
                    {output.detail && <span className="text-muted-foreground">{output.detail}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/onboarding')}
            className="px-6 py-3 text-[#F59E0B] font-semibold hover:underline"
          >
            Try it yourself →
          </button>
        </div>
      </div>
    </div>
  );
};
