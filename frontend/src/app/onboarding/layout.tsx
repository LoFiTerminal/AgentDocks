import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Setup — AgentDocks.ai',
  description: 'Configure your AI provider and sandbox environment in 30 seconds. Get started with AgentDocks.',
  openGraph: {
    title: 'Setup — AgentDocks.ai',
    description: 'Configure your AI provider and sandbox environment in 30 seconds.',
  },
  twitter: {
    title: 'Setup — AgentDocks.ai',
    description: 'Configure your AI provider and sandbox environment in 30 seconds.',
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
