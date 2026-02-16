import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Templates — AgentDocks.ai',
  description: '18 pre-built AI agent templates for data analysis, web scraping, code generation, and more. Run instantly with one click.',
  openGraph: {
    title: 'Templates — AgentDocks.ai',
    description: '18 pre-built AI agent templates for data analysis, web scraping, code generation, and more.',
  },
  twitter: {
    title: 'Templates — AgentDocks.ai',
    description: '18 pre-built AI agent templates for data analysis, web scraping, code generation, and more.',
  },
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
