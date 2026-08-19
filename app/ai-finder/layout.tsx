import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'AI Finder', description: 'Describe your goal and get transparent AI tool recommendations based on intent, budget and constraints.', alternates: { canonical: '/ai-finder' } }

export default function AIFinderLayout({ children }: { children: React.ReactNode }) { return children }