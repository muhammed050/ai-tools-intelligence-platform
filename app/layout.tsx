import './globals.css'
import Link from 'next/link'
import { getProfile, getUser } from '@/lib/auth'
import { AuthNav } from '@/components/auth-nav'
export const metadata={title:'AI Tools Intelligence',description:'Find the right AI tool for any task.'}
export default async function Layout({children}:{children:React.ReactNode}){const user=await getUser();const profile=await getProfile();return <html lang="en"><body><header className="glass" style={{position:'sticky',top:0,zIndex:20}}><div className="container" style={{minHeight:68,display:'flex',alignItems:'center',gap:24}}><Link href="/" style={{fontWeight:900,fontSize:20,marginRight:8}}>AI<span style={{color:'#8b7cff'}}>Tools</span></Link><nav style={{display:'flex',gap:18,flex:1,flexWrap:'wrap'}}><Link href="/ai-finder">AI Finder</Link><Link href="/tools">Tools</Link><Link href="/categories">Categories</Link><Link href="/compare">Compare</Link><Link href="/blog">Blog</Link></nav><AuthNav userEmail={user?.email} role={profile?.role}/></div></header>{children}</body></html>}
