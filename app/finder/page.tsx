import { redirect } from 'next/navigation'

export const metadata = { title: 'AI Finder', robots: { index: false, follow: true } }

export default function FinderAlias() {
  redirect('/ai-finder')
}