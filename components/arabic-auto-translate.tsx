'use client'

import { useEffect } from 'react'

const translations: Record<string, string> = {
  'AI Tools Intelligence': 'ذكاء أدوات الذكاء الاصطناعي',
  'AI-powered discovery': 'اكتشاف مدعوم بالذكاء الاصطناعي',
  'Curated directory': 'دليل منسّق',
  'Explore AI tools': 'استكشف أدوات الذكاء الاصطناعي',
  'Explore by use case': 'استكشف حسب حالة الاستخدام',
  'AI tool categories': 'تصنيفات أدوات الذكاء الاصطناعي',
  'Popular AI categories': 'تصنيفات الذكاء الاصطناعي الشائعة',
  'Explore category': 'استكشف التصنيف',
  'Featured directory': 'أدوات مميزة',
  'Featured AI tools': 'أدوات ذكاء اصطناعي مميزة',
  'Quality signals': 'مؤشرات الجودة',
  'Highly rated tools': 'الأدوات الأعلى تقييمًا',
  'Fresh listings': 'أحدث الإضافات',
  'Recently added tools': 'الأدوات المضافة حديثًا',
  'Editorial desk': 'المحتوى التحريري',
  'Latest guides': 'أحدث الأدلة',
  'Read all guides': 'قراءة جميع الأدلة',
  'Read guide': 'قراءة الدليل',
  'AI Guide': 'دليل ذكاء اصطناعي',
  'Choose with confidence': 'اختر بثقة',
  'A calmer way to build your AI stack.': 'طريقة أبسط لبناء مجموعة أدوات الذكاء الاصطناعي الخاصة بك.',
  'Use transparent comparisons, real reviews and structured product data to make a better shortlist.': 'استخدم مقارنات شفافة ومراجعات حقيقية وبيانات منظمة للمنتجات لاتخاذ قرار أفضل.',
  'Compare tools': 'قارن الأدوات',
  'Our methodology': 'منهجيتنا',
  'Intent-aware': 'يفهم نيتك',
  'Understands what you mean': 'يفهم ما الذي تبحث عنه',
  'Transparent matches': 'نتائج شفافة',
  'See why each tool fits': 'اعرف لماذا تناسبك كل أداة',
  'Safer discovery': 'اكتشاف أكثر أمانًا',
  'Unknown data stays unknown': 'البيانات غير المعروفة تبقى غير معروفة',
  'Describe the job. Get a shortlist.': 'صف ما تريد إنجازه واحصل على قائمة مختصرة.',
  'Our intent search reads your goal, budget and constraints, then explains the best matches.': 'يحلل بحث النوايا هدفك وميزانيتك وقيودك ثم يشرح أفضل النتائج المناسبة.',
  'What do you want to accomplish?': 'ماذا تريد أن تنجز؟',
  'Describe what you want to accomplish': 'صف ما تريد إنجازه',
  'Find tools': 'ابحث عن الأدوات',
  'Analyzing...': 'جارٍ التحليل...',
  'View result': 'عرض النتيجة',
  'What are you trying to accomplish?': 'ما الذي تحاول إنجازه؟',
  'We will find the tools.': 'سنجد الأدوات المناسبة لك.',
  'Describe your goal, budget or constraints in plain English. AITools extracts your intent and ranks relevant software from the directory.': 'صف هدفك أو ميزانيتك أو قيودك بطريقة بسيطة. يستخرج Eldevo نيتك ويرتب البرامج المناسبة من الدليل.',
  'Finding...': 'جارٍ البحث...',
  'AI-enhanced ranking is temporarily unavailable.': 'الترتيب المحسّن بالذكاء الاصطناعي غير متاح مؤقتًا.',
  'Here are the best matches from our directory.': 'إليك أفضل النتائج من دليلنا.',
  'Detected intent': 'النية المكتشفة',
  'AI extraction': 'استخراج بالذكاء الاصطناعي',
  'Local fallback': 'البديل المحلي',
  'Why we recommend it': 'لماذا نوصي بها',
  'A strong directory match based on your request.': 'مطابقة قوية من الدليل بناءً على طلبك.',
  'Limitations:': 'القيود:',
  'Visit tool': 'زيارة الأداة',
  'Details': 'التفاصيل',
  'Compare': 'مقارنة',
  'View details': 'عرض التفاصيل',
  'View directory': 'عرض الدليل',
  'Verified': 'موثّقة',
  'Unrated': 'بلا تقييم',
  'Pricing unknown': 'السعر غير معروف',
  'AI software': 'برنامج ذكاء اصطناعي',
  'Search by tool name or use case': 'ابحث باسم الأداة أو حالة الاستخدام',
  'Search AI tools': 'ابحث في أدوات الذكاء الاصطناعي',
  'All categories': 'جميع التصنيفات',
  'All pricing': 'جميع الأسعار',
  'Any rating': 'أي تقييم',
  'Any platform': 'أي منصة',
  'Most relevant': 'الأكثر صلة',
  'Most reviewed': 'الأكثر مراجعة',
  'Recently added': 'المضافة حديثًا',
  'A-Z': 'أ-ي',
  'Verified only': 'الموثقة فقط',
  'Apply filters': 'تطبيق الفلاتر',
  'No matching tools': 'لا توجد أدوات مطابقة',
  'Try a broader search, remove a filter, or describe your goal in AI Finder.': 'جرّب بحثًا أوسع أو أزل أحد الفلاتر أو صف هدفك في مكتشف الذكاء الاصطناعي.',
  'Try AI Finder': 'جرّب مكتشف الذكاء الاصطناعي',
  'Something went wrong': 'حدث خطأ ما',
  'We could not load this page.': 'تعذر تحميل هذه الصفحة.',
  'Please try again. Your account and saved data are unchanged.': 'يرجى المحاولة مرة أخرى. حسابك وبياناتك المحفوظة لم تتغير.',
  'Try again': 'حاول مرة أخرى',
  'We could not find that page.': 'تعذر العثور على هذه الصفحة.',
  'The tool, guide, category or comparison may have moved.': 'ربما تم نقل الأداة أو الدليل أو التصنيف أو المقارنة.',
  'Browse AI tools': 'تصفح أدوات الذكاء الاصطناعي',
  'About Eldevo': 'عن Eldevo',
  'Useful context for better AI decisions.': 'معلومات مفيدة لاتخاذ قرارات أفضل بشأن الذكاء الاصطناعي.',
  'Eldevo is a curated discovery platform for people who want to choose AI software based on fit, workflow, pricing and evidence.': 'Eldevo منصة اكتشاف منسقة تساعدك على اختيار برامج الذكاء الاصطناعي بناءً على الملاءمة وسير العمل والسعر والأدلة.',
  'Our standard': 'معاييرنا',
  'We organize tools around real jobs to be done, make tradeoffs visible, and keep quality signals separate from promotional claims. Listings are reviewed before publication and may change as products evolve.': 'ننظم الأدوات حول المهام الحقيقية، ونوضح المفاضلات، ونفصل مؤشرات الجودة عن الادعاءات الترويجية. تتم مراجعة القوائم قبل نشرها وقد تتغير مع تطور المنتجات.',
  'Contact': 'تواصل معنا',
  'Help us keep the directory useful.': 'ساعدنا في إبقاء الدليل مفيدًا.',
  'What to include': 'ما الذي يجب تضمينه',
  'Transparency': 'الشفافية',
  'Affiliate disclosure': 'الإفصاح عن الروابط التابعة',
  'Privacy policy': 'سياسة الخصوصية',
  'Terms of use': 'شروط الاستخدام',
  'Trust': 'الثقة',
  'Account data': 'بيانات الحساب',
  'Search and analytics': 'البحث والتحليلات',
  'Create TikTok videos': 'إنشاء فيديوهات TikTok',
  'Generate product photos': 'إنشاء صور للمنتجات',
  'Clone a voice': 'استنساخ صوت',
  'Build a website': 'إنشاء موقع إلكتروني',
  'Write SEO articles': 'كتابة مقالات SEO',
  'Analyze documents': 'تحليل المستندات',
  'Generate product images': 'إنشاء صور للمنتجات',
  'Write SEO content': 'كتابة محتوى SEO',
  'Generate voiceovers': 'إنشاء تعليقات صوتية',
  'Analyze PDFs': 'تحليل ملفات PDF',
  'Find the right AI tool for any job.': 'اعثر على أداة الذكاء الاصطناعي المناسبة لأي مهمة.',
  'for any job.': 'لأي مهمة.',
  'Discover, compare and evaluate AI tools using structured data, reviews and intelligent recommendations.': 'اكتشف أدوات الذكاء الاصطناعي وقارنها وقيّمها باستخدام بيانات منظمة ومراجعات وتوصيات ذكية.',
  'Launch AI Finder': 'فتح مكتشف الذكاء الاصطناعي',
  'Explore by need': 'استكشف حسب الحاجة',
  'AI Tools Intelligence': 'ذكاء أدوات الذكاء الاصطناعي',
  'Writing & Content': 'الكتابة والمحتوى',
  'Write, edit and optimize content.': 'اكتب المحتوى وحرره وحسّنه.',
  'Coding & Development': 'البرمجة والتطوير',
  'Build with assistants, agents and IDEs.': 'طوّر باستخدام المساعدات والوكلاء وبيئات التطوير.',
  'Image Generation': 'توليد الصور',
  'Create and edit visual assets.': 'أنشئ الأصول المرئية وحررها.',
  'Video & Animation': 'الفيديو والرسوم المتحركة',
  'Generate and enhance video content.': 'أنشئ محتوى الفيديو وحسّنه.',
  'Voice & Audio': 'الصوت والملفات الصوتية',
  'Create speech, music and voiceovers.': 'أنشئ الكلام والموسيقى والتعليقات الصوتية.',
  'Business & Marketing': 'الأعمال والتسويق',
  'Improve growth, sales and operations.': 'حسّن النمو والمبيعات والعمليات.',
  'Explore curated AI software for this workflow.': 'استكشف برامج ذكاء اصطناعي منتقاة لسير العمل هذا.',
  'Featured directory': 'دليل الأدوات المميزة',
  'Featured AI tools': 'أدوات ذكاء اصطناعي مميزة',
  'Quality signals': 'مؤشرات الجودة',
  'Highly rated tools': 'الأدوات الأعلى تقييمًا',
  'Fresh listings': 'الإضافات الجديدة',
  'Recently added tools': 'الأدوات المضافة حديثًا',
  'Editorial desk': 'المحتوى التحريري',
  'Latest guides': 'أحدث الأدلة',
  'Read all guides': 'قراءة جميع الأدلة',
  'Choose with confidence': 'اختر بثقة',
  'A calmer way to build your AI stack.': 'طريقة أبسط لبناء مجموعة أدوات الذكاء الاصطناعي الخاصة بك.',
  'Use transparent comparisons, real reviews and structured product data to make a better shortlist.': 'استخدم مقارنات شفافة ومراجعات حقيقية وبيانات منظمة للمنتجات لاتخاذ قرار أفضل.',
  'Intent-aware': 'يفهم نيتك',
  'Transparent matches': 'نتائج شفافة',
  'Safer discovery': 'اكتشاف أكثر أمانًا',
  'Understands what you mean': 'يفهم ما الذي تبحث عنه',
  'See why each tool fits': 'اعرف لماذا تناسبك كل أداة',
  'Unknown data stays unknown': 'البيانات غير المعروفة تبقى غير معروفة',
}

function translateText(value: string) {
  const trimmed = value.trim()
  const translated = translations[trimmed]
  if (!translated) return value
  const start = value.indexOf(trimmed)
  return `${value.slice(0, start)}${translated}${value.slice(start + trimmed.length)}`
}

export function ArabicAutoTranslate() {
  useEffect(() => {
    if (document.cookie.split(';').some((item) => item.trim().startsWith('eldevo_locale=ar'))) {
      const translate = () => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
        const nodes: Text[] = []
        let node: Node | null
        while ((node = walker.nextNode())) nodes.push(node as Text)
        for (const text of nodes) {
          if (!text.nodeValue || text.parentElement?.closest('script,style,noscript')) continue
          const next = translateText(text.nodeValue)
          if (next !== text.nodeValue) text.nodeValue = next
        }
      }
      translate()
      const observer = new MutationObserver(translate)
      observer.observe(document.body, { childList: true, subtree: true })
      return () => observer.disconnect()
    }
  }, [])

  return null
}
