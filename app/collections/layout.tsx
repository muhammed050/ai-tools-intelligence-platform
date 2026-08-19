import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Collections', description: 'Organize and share your saved AI tool stacks.', robots: { index: false, follow: false } }

export default function CollectionsLayout({ children }: { children: React.ReactNode }) { return children }