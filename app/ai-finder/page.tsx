'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, GitCompareArrows, Search, Sparkles, WandSparkles } from 'lucide-react'

type Locale = 'en' | 'ar'
type Example = { en: string; ar: string; prompt: string }

const examples: Example[] = [
  { en: 'Create TikTok videos', ar: 'إنشاء فيديوهات TikTok', prompt: 'أريد أداة ذكاء اصطناعي لإنشاء فيديوهات TikTok قصيرة' },
  { en: 'Generate product photos', ar: 'إنشاء صور للمنتجات', prompt: 'أريد أداة ذكاء اصطناعي لإنشاء صور احترافية للمنتجات' },
  { en: 'Clone a voice', ar: 'استنساخ صوت', prompt: 'أريد أداة ذكاء اصطناعي لاستنساخ صوت وإنشاء تعليق صوتي' },
  { en: 'Build a website', ar: 'إنشاء موقع إلكتروني', prompt: 'أريد أداة ذكاء اصطناعي لإنشاء موقع إلكتروني' },
  { en: 'Write SEO articles', ar: 'كتابة مقالات SEO', prompt: 'أريد أداة ذكاء اصطناعي لكتابة مقالات متوافقة مع SEO' },
  { en: 'Analyze documents', ar: 'تحليل المستندات', prompt: 'أريد أداة ذكاء اصطناعي لتحليل ملفات PDF والمستندات' },
]

const intentLabels: Record<string, { en: string; ar: string }> = {
  category: { en: 'Category', ar: 'التصنيف' }, subcategory: { en: 'Subcategory', ar: 'التصنيف الفرعي' }, useCase: { en: 'Use case', ar: 'حالة الاستخدام' }, budget: { en: 'Budget', ar: 'الميزانية' }, features: { en: 'Features', ar: 'المزايا' }, platform: { en: 'Platform', ar: 'المنصة' }, language: { en: 'Language', ar: 'اللغة' }, experienceLevel: { en: 'Experience', ar: 'الخبرة' }, outputType: { en: 'Output', ar: 'المخرجات' }, constraints: { en: 'Constraints', ar: 'القيود' },
}

const groupLabels: Record<string, { en: string; ar: string }> = {
  best: { en: 'Best Match', ar: 'أفضل تطابق' }, free: { en: 'Best Free Option', ar: 'أفضل خيار مجاني' }, alternative: { en: 'Best Alternative', ar: 'أفضل بديل' }, premium: { en: 'Best Premium Option', ar: 'أفضل خيار مدفوع' },
}

export default function FinderPage() {
  const [locale, setLocale] = useState<Locale>('en')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => setLocale(document.cookie.split(';').some((item) => item.trim().startsWith('eldevo_locale=ar')) ? 'ar' : 'en'), [])
  const isArabic = locale === 'ar'
  const copy = isArabic ? {
    eyebrow: 'مستشار أدوات الذكاء الاصطناعي', title: 'قل لنا ما تريد إنجازه.', title2: 'وسنختار الأدوات المناسبة.', description: 'لا تبحث بين آلاف الأدوات. صف هدفك وميزانيتك وقيودك، وسيحلل Eldevo طلبك ويرتب الأدوات الأنسب لك.', placeholder: 'مثال: أريد أداة مجانية لإنشاء فيديوهات TikTok قصيرة بدون علامة مائية', aria: 'صف ما تريد إنجازه', finding: 'جارٍ تحليل طلبك...', find: 'اعثر على الأدوات', unavailable: 'الترتيب الذكي غير متاح مؤقتًا.', fallback: 'إليك أفضل النتائج من دليل Eldevo.', detected: 'النية المكتشفة', ai: 'تحليل بالذكاء الاصطناعي', local: 'تحليل محلي', match: 'نتيجة', matches: 'نتائج', why: 'لماذا نوصي بها', strong: 'مطابقة قوية بناءً على طلبك.', limitations: 'القيود:', visit: 'جرّب الأداة', details: 'التفاصيل', compare: 'قارن', verified: 'موثّقة', unrated: 'بلا تقييم', unavailableError: 'مكتشف الأدوات غير متاح مؤقتًا. حاول مرة أخرى.', stackTitle: 'مجموعة أدواتك المقترحة', stackDescription: 'بدل اختيار أداة واحدة، يبني Eldevo لك مجموعة عملية من الأدوات التي تكمل بعضها لمهمتك.', stackStep: 'الدور', stackOpen: 'افتح الأداة',
  } : {
    eyebrow: 'AI Tool Decision Engine', title: 'Tell us what you want to accomplish.', title2: 'We will choose the right tools.', description: 'Stop searching thousands of AI tools. Describe your goal, budget and constraints and Eldevo will extract your intent and rank the best-fit tools.', placeholder: 'e.g. free AI video generator for short TikTok clips with no watermark', aria: 'Describe what you want to accomplish', finding: 'Analyzing your request...', find: 'Find the right tools', unavailable: 'Smart ranking is temporarily unavailable.', fallback: 'Here are the best matches from the Eldevo directory.', detected: 'Detected intent', ai: 'AI analysis', local: 'Local analysis', match: 'match', matches: 'matches', why: 'Why we recommend it', strong: 'A strong match based on your request.', limitations: 'Limitations:', visit: 'Try tool', details: 'Details', compare: 'Compare', verified: 'Verified', unrated: 'Unrated', unavailableError: 'The Finder is temporarily unavailable. Please try again.', stackTitle: 'Your recommended AI stack', stackDescription: 'Instead of picking one tool, Eldevo builds a practical set of complementary tools for your task.', stackStep: 'Role', stackOpen: 'Open tool',
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const response = await fetch('/api/ai-finder', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query, locale }) })
      const result = await response.json()
      if (!response.ok) throw new Error(response.status === 429 ? result.error : copy.unavailableError)
      setData(result)
    } catch (reason) { setData(null); setError(reason instanceof Error ? reason.message : copy.unavailableError) } finally { setLoading(false) }
  }

  return <main className="container" style={{ padding: '60px 0 100px' }}>
    <section className="hero-glow card" style={{ padding: '48px 28px', textAlign: 'center', maxWidth: 980, margin: '0 auto' }}>
      <div className="tool-logo" style={{ margin: '0 auto 15px' }}><WandSparkles size={23} /></div>
      <div className="eyebrow">{copy.eyebrow}</div>
      <h1 style={{ fontSize: 'clamp(42px,6vw,68px)', lineHeight: 1, letterSpacing: '-.05em', margin: '12px 0' }}>{copy.title}<br /><span style={{ color: '#9f94ff' }}>{copy.title2}</span></h1>
      <p className="muted" style={{ fontSize: 17, maxWidth: 720, margin: '0 auto' }}>{copy.description}</p>
      <form onSubmit={submit} style={{ maxWidth: 820, margin: '28px auto 0', display: 'flex', gap: 10 }}><input dir={isArabic ? 'rtl' : 'ltr'} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.placeholder} minLength={3} required aria-label={copy.aria} /><button className="btn btn-primary" disabled={loading}><Sparkles size={16} />{loading ? copy.finding : copy.find}</button></form>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 }}>{examples.map((example) => <button key={example.en} type="button" className="btn btn-secondary" onClick={() => setQuery(isArabic ? example.prompt : example.en)}>{isArabic ? example.ar : example.en}</button>)}</div>
    </section>

    {error && <div className="card" role="alert" style={{ padding: 18, marginTop: 24, borderColor: '#7f1d1d' }}>{error}</div>}

    {data && <section style={{ marginTop: 36 }}>
      {data.source !== 'ai' && <div className="card" role="status" style={{ padding: 18, marginBottom: 20, borderColor: '#6d5dd3' }}><strong>{copy.unavailable}</strong> {copy.fallback}</div>}
      <div className="card" style={{ padding: 20 }}><div className="eyebrow">{copy.detected} · {data.source === 'ai' ? copy.ai : copy.local}</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>{Object.entries(data.intent).flatMap(([key, value]: any) => { const label = intentLabels[key]?.[locale] || key; return Array.isArray(value) ? value.map((item: string) => <span className="badge" key={`${key}-${item}`}>{label}: {item}</span>) : value ? <span className="badge" key={key}>{label}: {value}</span> : [] })}</div></div>

      {data.stack?.length > 0 && <section style={{ marginTop: 34 }}><div className="section-head"><div><div className="eyebrow">{isArabic ? 'حل متكامل للمهمة' : 'A solution, not just a tool'}</div><h2>{copy.stackTitle}</h2><p className="muted" style={{ margin: 0, maxWidth: 720 }}>{copy.stackDescription}</p></div></div><div className="tool-grid">{data.stack.map((item: any) => <article className="card tool-card" key={`${item.key}-${item.tool.id}`}><div className="eyebrow">{copy.stackStep} · {item.label}</div><h3 style={{ margin: '6px 0' }}>{item.tool.name}</h3><p className="muted">{item.why}</p><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><span className="badge">{item.score}% match</span>{item.tool.verified && <span className="badge"><CheckCircle2 size={13} /> {copy.verified}</span>}</div><div style={{ marginTop: 'auto', paddingTop: 12 }}><Link className="btn btn-primary" href={`/go/${item.tool.slug}`}>{copy.stackOpen} <ArrowRight size={14} /></Link></div></article>)}</div></section>}

      {data.results.map((group: any) => <div key={group.key} style={{ marginTop: 32 }}><div className="section-head"><h2>{groupLabels[group.key]?.[locale] || group.label}</h2><span className="muted">{group.items.length} {group.items.length === 1 ? copy.match : copy.matches}</span></div><div className="tool-grid">{group.items.map((recommendation: any) => <article className="card tool-card" key={`${group.key}-${recommendation.tool.id}`}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><div><div className="eyebrow">{recommendation.tool.category?.name || (isArabic ? 'أداة ذكاء اصطناعي' : 'AI tool')}</div><h3 style={{ fontSize: 22, margin: '4px 0' }}>{recommendation.tool.name}</h3></div><strong style={{ fontSize: 22, color: '#a79cff' }}>{recommendation.score}%</strong></div><p className="muted">{recommendation.tool.short_description}</p><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}><span className="badge">★ {recommendation.tool.rating ?? copy.unrated}</span><span className="badge">{recommendation.tool.pricing_type}</span>{recommendation.tool.verified && <span className="badge"><CheckCircle2 size={13} /> {copy.verified}</span>}</div><h4 style={{ margin: '18px 0 6px' }}>{copy.why}</h4>{recommendation.why.length ? <ul style={{ paddingLeft: isArabic ? 0 : 20, paddingRight: isArabic ? 20 : 0, marginTop: 0 }}>{recommendation.why.map((reason: string) => <li key={reason}>{reason}</li>)}</ul> : <p className="muted">{copy.strong}</p>}{recommendation.limitations.length > 0 && <p className="muted" style={{ fontSize: 13 }}>{copy.limitations} {recommendation.limitations.join(', ')}</p>}<div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10, flexWrap: 'wrap' }}><Link className="btn btn-primary" href={`/go/${recommendation.tool.slug}`}>{copy.visit} <ArrowRight size={14} /></Link><Link className="btn btn-secondary" href={`/tools/${recommendation.tool.slug}`}>{copy.details} <Search size={14} /></Link><Link className="btn btn-secondary" href={`/compare/${recommendation.tool.slug}`}><GitCompareArrows size={14} /> {copy.compare}</Link></div></article>)}</div></div>)}
    </section>}
  </main>
}
