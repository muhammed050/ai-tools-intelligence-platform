'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const links = [['/ai-finder', 'AI Finder'], ['/tools', 'AI Tools'], ['/categories', 'Categories'], ['/compare', 'Compare'], ['/blog', 'Guides'], ['/favorites', 'Favorites'], ['/collections', 'Collections']]
export function MobileNav() { const [open, setOpen] = useState(false); useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }; document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close) }, []); return <div className="mobile-nav"><button type="button" className="mobile-menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X size={21} /> : <Menu size={21} />}</button>{open && <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile navigation">{links.map(([href, label]) => <Link href={{ pathname: href }} key={href} onClick={() => setOpen(false)}>{label}</Link>)}</nav>}</div> }
