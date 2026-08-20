'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function LanguageSwitcher({ locale = 'en' }: { locale?: 'en' | 'ar' }) {
  const pathname = usePathname() || '/';
  const targetLocale = locale === 'ar' ? 'en' : 'ar';
  const targetPath = pathname.startsWith('/ar') || pathname.startsWith('/en')
    ? pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${targetLocale}`)
    : `/${targetLocale}${pathname === '/' ? '' : pathname}`;

  return <Link href={targetPath} hrefLang={targetLocale}>{targetLocale === 'ar' ? 'العربية' : 'English'}</Link>;
}
