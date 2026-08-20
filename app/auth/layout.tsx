import type { Metadata } from 'next'
import { AuthArabicTranslator } from '@/components/auth-arabic-translator'

export const metadata: Metadata = { title: { default: 'Account', template: '%s | Eldevo' }, robots: { index: false, follow: false } }

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <><AuthArabicTranslator />{children}</>
}
