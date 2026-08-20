'use client'

import Link from 'next/link'
import type { Route } from 'next'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getDictionary, type Locale } from '@/lib/i18n'

const links = [
  ['/ai-finder', 'finder'],
  ['/tools', 'tools'],
  ['/categories', 'categories'],
  ['/compare', 'compare'],
  ['/blog', 'guides'],
  ['/favorites', 'favorites'],
  ['/collections', 'collections'],
] as const

export function MobileNav({ locale = 'en' }: { locale?: Locale }) {
  const [open, setOpen] = useState(false)
  const t = getDictionary(locale)
  const prefix = locale === 'ar' ? '/ar' : ''
  const href = (path: string) => `${prefix}${path}` as Route

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [])

  return <div className="mobile-nav"><button type="button" className="mobile-menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}>{open ? <X size={21} /> : <Menu size={21} />}</button>{open && <nav id="mobile-menu" className="mobile-menu" aria-label={locale === 'ar' ? 'قائمة الهاتف' : 'Mobile navigation'}>{links.map(([path, key]) => { const label = key === 'favorites' ? t.auth.favorites : key === 'collections' ? t.auth.collections : t.nav[key as keyof typeof t.nav]; return <Link href={href(path)} key={path} onClick={() => setOpen(false)}>{label}</Link> })}</nav>}</div>
}
