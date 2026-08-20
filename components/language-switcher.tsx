'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function localePath(pathname: string, locale: 'en' | 'ar') {
  const clean = pathname.replace(/^\/(ar|en)(?=\/|$)/, '') || '/'
  return locale === 'en' ? clean : `/ar${clean === '/' ? '' : clean}`
}

export function LanguageSwitcher({ locale }: { locale: 'en' | 'ar' }) {
  const pathname = usePathname() || '/'
  const nextLocale = locale === 'ar' ? 'en' : 'ar'
  return (
    <Link
      href={localePath(pathname, nextLocale)}
      className="language-switcher"
      aria-label={nextLocale === 'ar' ? 'Switch to Arabic' : 'Switch to English'}
    >
      {nextLocale === 'ar' ? 'العربية' : 'English'}
    </Link>
  )
}
