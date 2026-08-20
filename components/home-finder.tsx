'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'

type Locale = 'en' | 'ar'
const prompts = { en: ['Create TikTok videos', 'Generate product images', 'Build a website', 'Write SEO content', 'Generate voiceovers', 'Analyze PDFs'], ar: ['إنشاء فيديوهات TikTok', 'إنشاء صور للمنتجات', 'بناء موقع إلكتروني', 'كتابة محتوى SEO', 'إنشاء تعليق صوتي', 'تحليل ملفات PDF'] }

export function HomeFinder({ locale = 'en' }: { locale?: Locale }) {
  const ar = locale === 'ar'
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/ai-finder', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query, locale }) })
      const data = await response.json()
      if (!response.ok) throw new Error(response.status === 429 ? data.error : (ar ? 'مكتشف الأدوات غير متاح مؤقتًا. حاول مرة أخرى.' : 'The Finder is temporarily unavailable. Please try again.'))
      setResult(data)
    } catch (reason) { setError(reason instanceof Error ? reason.message : (ar ? 'حدث خطأ مؤقت. حاول مرة أخرى.' : 'The Finder is temporarily unavailable.')) } finally { setLoading(false) }
  }

  const best = result?.results?.[0]?.items?.[0]
  return <div className="home-finder">
    <div className="home-finder-heading"><div><div className="eyebrow">{ar ? 'مكتشف أدوات الذكاء الاصطناعي' : 'AI Finder'}</div><h2>{ar ? 'صف ما تريد إنجازه واحصل على قائمة مختصرة.' : 'Describe the job. Get a shortlist.'}</h2><p className="muted">{ar ? 'يحلل بحث النوايا هدفك وميزانيتك وقيودك ثم يشرح أفضل النتائج المناسبة لك.' : 'Our intent search reads your goal, budget and constraints, then explains the best matches.'}</p></div><Sparkles size={24} color="var(--ai)" /></div>
    <form onSubmit={submit} className="finder-form"><textarea dir={ar ? 'rtl' : 'ltr'} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ar ? 'ما الذي تريد إنجازه؟ اكتب طلبك بالعربية أو الإنجليزية...' : 'What do you want to accomplish?'} aria-label={ar ? 'صف ما تريد إنجازه' : 'Describe what you want to accomplish'} rows={3} minLength={3} required /><button className="btn btn-primary" disabled={loading}><Sparkles size={16} />{loading ? (ar ? 'جارٍ التحليل...' : 'Analyzing...') : (ar ? 'ابحث عن الأدوات' : 'Find tools')}</button></form>
    <div className="prompt-list">{prompts[locale].map((prompt) => <button type="button" className="prompt-chip" key={prompt} onClick={() => setQuery(prompt)}>{prompt}</button>)}</div>
    {error && <p className="finder-message" role="alert">{error}</p>}
    {best && <div className="finder-result"><div><span className="eyebrow">{ar ? `أفضل نتيجة · ${best.score}%` : `Best match · ${best.score}%`}</span><h3>{best.tool.name_ar || best.tool.name}</h3><p className="muted">{ar ? (best.tool.short_description_ar || best.tool.short_description) : best.tool.short_description}</p></div><Link className="btn btn-secondary" href={`/tools/${best.tool.slug}`}>{ar ? 'عرض النتيجة' : 'View result'} <ArrowRight size={15} /></Link></div>}
  </div>
}
