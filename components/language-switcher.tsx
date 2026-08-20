'use client'

import { Languages } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function LanguageSwitcher({ locale }: { locale: 'en' | 'ar' }) {
  const pathname = usePathname() || '/'
  const nextLocale = locale === 'ar' ? 'en' : 'ar'

  function switchLanguage() {
    const withoutLocale = pathname.replace(/^\/(ar|en)(?=\/|$)/, '') || '/'
    const target = nextLocale === 'ar' ? `/ar${withoutLocale === '/' ? '/' : withoutLocale}` : withoutLocale
    document.cookie = `eldevo_locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`
    window.location.assign(target)
  }

  return (
    <button
      type="button"
      onClick={switchLanguage}
      className="language-switcher"
      aria-label={nextLocale === 'ar' ? 'التبديل إلى العربية' : 'Switch to English'}
      title={nextLocale === 'ar' ? 'العربية' : 'English'}
    >
      <Languages size={16} />
      <span>{nextLocale === 'ar' ? 'العربية' : 'English'}</span>
    </button>
  )
}
