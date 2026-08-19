export const SITE_URL = 'https://eldevo.com'
export const SITE_NAME = 'Eldevo'
export const SITE_DESCRIPTION = 'AI Tools Intelligence: discover, compare and build better AI workflows.'

/** A production canonical must never inherit a preview or localhost origin. */
export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  return configured && /^https:\/\/eldevo\.com$/i.test(configured) ? configured : SITE_URL
}
