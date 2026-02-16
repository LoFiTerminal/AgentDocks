import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — AgentDocks.ai',
  description: 'Run AI agents in disposable sandboxes. Execute tasks, write code, analyze data with full privacy.',
  openGraph: {
    title: 'Dashboard — AgentDocks.ai',
    description: 'Run AI agents in disposable sandboxes with full privacy.',
  },
  twitter: {
    title: 'Dashboard — AgentDocks.ai',
    description: 'Run AI agents in disposable sandboxes with full privacy.',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
