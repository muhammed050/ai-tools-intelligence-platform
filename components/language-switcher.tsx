'use client'

import { Languages } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function LanguageSwitcher({ locale }: { locale: 'en' | 'ar' }) {
  const router = useRouter()
  const nextLocale = locale === 'ar' ? 'en' : 'ar'

  function switchLanguage() {
    document.cookie = `eldevo_locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`
    router.refresh()
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
