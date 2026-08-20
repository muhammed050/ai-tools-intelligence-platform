-- Arabic-first catalog fields. English source fields remain unchanged.
alter table public.tools
  add column if not exists name_ar text,
  add column if not exists description_ar text,
  add column if not exists short_description_ar text,
  add column if not exists use_cases_ar text[] not null default '{}',
  add column if not exists pros_ar text[] not null default '{}',
  add column if not exists cons_ar text[] not null default '{}';

alter table public.categories
  add column if not exists name_ar text,
  add column if not exists description_ar text,
  add column if not exists seo_title_ar text,
  add column if not exists seo_description_ar text;

-- Seed Arabic catalog copy for the published tools currently in the directory.
update public.tools set
  name_ar='Claude',
  short_description_ar='مساعد ذكاء اصطناعي للتفكير والكتابة',
  description_ar='مساعد ذكاء اصطناعي يركز على الكتابة والتفكير والتحليل والبرمجة.',
  pros_ar=array['كتابة قوية','سياق طويل','مساعدة في البرمجة'],
  cons_ar=array['حدود استخدام'],
  use_cases_ar=array['الكتابة','البحث','البرمجة']
where slug='claude';

update public.tools set
  name_ar='Midjourney',
  short_description_ar='توليد الصور بالذكاء الاصطناعي',
  description_ar='منصة لتوليد الصور تساعدك على إنشاء صور فنية عالية الجودة بالذكاء الاصطناعي.',
  pros_ar=array['جودة عالية','تحكم بالأسلوب'],
  cons_ar=array['الوصول المدفوع'],
  use_cases_ar=array['توليد الصور','الفن','التصميم']
where slug='midjourney';

update public.tools set
  name_ar='ElevenLabs',
  short_description_ar='مولد أصوات بالذكاء الاصطناعي',
  description_ar='منصة لتوليد الأصوات وتحويل النص إلى كلام واستنساخ الأصوات بالذكاء الاصطناعي.',
  pros_ar=array['أصوات طبيعية','استنساخ الصوت','واجهة API'],
  cons_ar=array['حدود استخدام'],
  use_cases_ar=array['تحويل النص إلى كلام','استنساخ الصوت','الدبلجة']
where slug='elevenlabs';

update public.tools set
  name_ar='GitHub Copilot',
  short_description_ar='مساعد برمجة بالذكاء الاصطناعي',
  description_ar='مساعد للبرمجة بالذكاء الاصطناعي مدمج في بيئة عمل المطورين.',
  pros_ar=array['تكامل مع أدوات المطورين','مساعدة في البرمجة'],
  cons_ar=array['اشتراك مدفوع'],
  use_cases_ar=array['البرمجة','الإكمال التلقائي','مراجعة الكود']
where slug='github-copilot';

update public.tools set
  name_ar='Cursor',
  short_description_ar='محرر أكواد بالذكاء الاصطناعي',
  description_ar='محرر أكواد مصمم حول الذكاء الاصطناعي لبناء البرمجيات مع وكلاء برمجة متقدمين.',
  pros_ar=array['برمجة بالوكلاء','فهم سياق المشروع'],
  cons_ar=array['حدود استخدام'],
  use_cases_ar=array['البرمجة','الوكلاء','إعادة هيكلة الكود']
where slug='cursor';

update public.tools set
  name_ar='ChatGPT',
  short_description_ar='مساعد ذكاء اصطناعي متعدد الاستخدامات',
  description_ar='مساعد ذكاء اصطناعي للكتابة والبحث والتحليل والبرمجة والمهام اليومية.',
  pros_ar=array['متعدد الاستخدامات','استدلال قوي','منظومة واسعة'],
  cons_ar=array['بعض الميزات المتقدمة تتطلب اشتراكًا'],
  use_cases_ar=array['الكتابة','البحث','البرمجة','التحليل']
where slug='chatgpt';

update public.tools set
  name_ar='Gemini',
  short_description_ar='مساعد ذكاء اصطناعي متعدد الوسائط من Google',
  description_ar='مساعد ذكاء اصطناعي من Google للبحث والكتابة والبرمجة والمهام متعددة الوسائط.',
  pros_ar=array['تكامل Google','دعم الوسائط المتعددة'],
  cons_ar=array['تختلف إتاحة الميزات'],
  use_cases_ar=array['البحث','الكتابة','البرمجة','الصور']
where slug='gemini';

update public.tools set
  name_ar='Perplexity',
  short_description_ar='محرك بحث وبحث علمي بالذكاء الاصطناعي',
  description_ar='محرك إجابات بالذكاء الاصطناعي يجمع البحث على الويب مع إجابات موثقة بالمصادر.',
  pros_ar=array['مصادر واستشهادات','بحث على الويب','إجابات سريعة'],
  cons_ar=array['حدود النماذج المميزة'],
  use_cases_ar=array['البحث','البحث على الويب','التحقق من المعلومات']
where slug='perplexity';

update public.tools set
  name_ar='Leonardo AI',
  short_description_ar='مولد صور بالذكاء الاصطناعي ومنصة إبداعية',
  description_ar='منصة لتوليد الصور وإنشاء المحتوى الإبداعي بالذكاء الاصطناعي.',
  pros_ar=array['خطة مجانية','أدوات تحكم إبداعية'],
  cons_ar=array['حدود التوليد'],
  use_cases_ar=array['توليد الصور','التصميم','التسويق']
where slug='leonardo-ai';

update public.tools set
  name_ar='Canva AI',
  short_description_ar='منصة تصميم مدعومة بالذكاء الاصطناعي',
  description_ar='منصة تصميم تحتوي على أدوات ذكاء اصطناعي للصور والكتابة والعروض التقديمية.',
  pros_ar=array['قوالب جاهزة','سهلة الاستخدام','ميزات ذكاء اصطناعي'],
  cons_ar=array['الميزات المتقدمة مدفوعة'],
  use_cases_ar=array['التصميم','العروض التقديمية','وسائل التواصل الاجتماعي']
where slug='canva-ai';

update public.tools set
  name_ar='Runway',
  short_description_ar='توليد وتحرير الفيديو بالذكاء الاصطناعي',
  description_ar='منصة إبداعية بالذكاء الاصطناعي لإنشاء الفيديو وتحريره.',
  pros_ar=array['جودة الفيديو','أدوات تحرير'],
  cons_ar=array['نظام أرصدة'],
  use_cases_ar=array['توليد الفيديو','تحويل الصورة إلى فيديو','تحرير الفيديو']
where slug='runway';

update public.tools set
  name_ar='Synthesia',
  short_description_ar='منشئ فيديوهات بأفاتار الذكاء الاصطناعي',
  description_ar='منصة فيديو بالذكاء الاصطناعي لإنشاء عروض الأعمال والفيديوهات باستخدام الشخصيات الافتراضية.',
  pros_ar=array['مناسب لسير عمل الشركات','شخصيات افتراضية'],
  cons_ar=array['سعر أعلى'],
  use_cases_ar=array['فيديوهات الأفاتار','التدريب','التسويق']
where slug='synthesia';

update public.tools set
  name_ar='Descript',
  short_description_ar='محرر صوت وفيديو بالذكاء الاصطناعي',
  description_ar='محرر صوت وفيديو مدعوم بالذكاء الاصطناعي مع النسخ والتحرير.',
  pros_ar=array['تحرير قائم على النص','نسخ الكلام'],
  cons_ar=array['حدود التصدير'],
  use_cases_ar=array['البودكاست','تفريغ الصوت','تحرير الفيديو']
where slug='descript';

update public.tools set
  name_ar='Replit',
  short_description_ar='منصة برمجة وبناء تطبيقات بالذكاء الاصطناعي',
  description_ar='بيئة تطوير سحابية توفر البرمجة بمساعدة الذكاء الاصطناعي والنشر.',
  pros_ar=array['محرر برمجة عبر المتصفح','النشر','وكيل ذكاء اصطناعي'],
  cons_ar=array['حدود استخدام'],
  use_cases_ar=array['البرمجة','بناء التطبيقات','النشر']
where slug='replit';

update public.tools set
  name_ar='Grammarly',
  short_description_ar='مساعد كتابة بالذكاء الاصطناعي',
  description_ar='مساعد كتابة بالذكاء الاصطناعي لتحسين القواعد والوضوح وإعادة الصياغة والأسلوب.',
  pros_ar=array['تحرير سهل','اقتراحات للنبرة'],
  cons_ar=array['ميزات مميزة مدفوعة'],
  use_cases_ar=array['الكتابة','التحرير','التدقيق اللغوي']
where slug='grammarly';

update public.tools set
  name_ar='Notion AI',
  short_description_ar='مساعد مساحة عمل بالذكاء الاصطناعي',
  description_ar='ميزات ذكاء اصطناعي مدمجة في مستندات ومساحة عمل Notion وإدارة المعرفة والمشاريع.',
  pros_ar=array['تكامل مع مساحة العمل','البحث في المعرفة'],
  cons_ar=array['يتطلب مساحة عمل Notion'],
  use_cases_ar=array['الملاحظات','قاعدة المعرفة','إدارة المشاريع']
where slug='notion-ai';

update public.tools set
  name_ar='Suno',
  short_description_ar='مولد موسيقى بالذكاء الاصطناعي',
  description_ar='منصة لتوليد الموسيقى وإنشاء الأغاني انطلاقًا من الأوامر النصية.',
  pros_ar=array['إنشاء موسيقى سريع','نتائج إبداعية'],
  cons_ar=array['تختلف شروط الاستخدام التجاري'],
  use_cases_ar=array['توليد الموسيقى','كتابة الأغاني']
where slug='suno';

update public.tools set
  name_ar='Pika',
  short_description_ar='مولد فيديو بالذكاء الاصطناعي',
  description_ar='منصة لإنشاء فيديوهات قصيرة وإبداعية بالذكاء الاصطناعي.',
  pros_ar=array['سهولة التوليد','تأثيرات إبداعية'],
  cons_ar=array['حدود الأرصدة'],
  use_cases_ar=array['تحويل النص إلى فيديو','تحويل الصورة إلى فيديو','فيديوهات التواصل الاجتماعي']
where slug='pika';

update public.tools set
  name_ar='Jasper',
  short_description_ar='مساعد تسويق بالذكاء الاصطناعي',
  description_ar='منصة ذكاء اصطناعي لإنشاء المحتوى التسويقي وبناء سير عمل للعلامات التجارية.',
  pros_ar=array['سير عمل تسويقي','تحكم بصوت العلامة التجارية'],
  cons_ar=array['سعر أعلى'],
  use_cases_ar=array['التسويق','كتابة المحتوى','صوت العلامة التجارية']
where slug='jasper';

update public.tools set
  name_ar='Copy.ai',
  short_description_ar='كتابة محتوى وتسويق مؤتمت بالذكاء الاصطناعي',
  description_ar='منصة ذكاء اصطناعي للمحتوى التسويقي وأتمتة سير العمل.',
  pros_ar=array['سير عمل جاهز','قوالب تسويقية'],
  cons_ar=array['الخطط المتقدمة مدفوعة'],
  use_cases_ar=array['كتابة المحتوى','التسويق','المبيعات']
where slug='copy-ai';

-- Localize the main categories.
update public.categories set name_ar='الكتابة', description_ar='أدوات الذكاء الاصطناعي للكتابة والتحرير وإنشاء المحتوى', seo_title_ar='أفضل أدوات الذكاء الاصطناعي للكتابة', seo_description_ar='اكتشف أفضل أدوات الذكاء الاصطناعي للكتابة والتحرير وإنشاء المحتوى.' where slug='writing';
update public.categories set name_ar='البرمجة', description_ar='أدوات الذكاء الاصطناعي للبرمجة وتطوير البرمجيات', seo_title_ar='أفضل أدوات الذكاء الاصطناعي للبرمجة', seo_description_ar='قارن أفضل أدوات الذكاء الاصطناعي للبرمجة وتطوير التطبيقات.' where slug='coding';
update public.categories set name_ar='الصور', description_ar='أدوات الذكاء الاصطناعي لإنشاء الصور والتصميم', seo_title_ar='أفضل أدوات الذكاء الاصطناعي للصور', seo_description_ar='اكتشف أدوات إنشاء الصور والتصميم بالذكاء الاصطناعي.' where slug='image';
update public.categories set name_ar='الفيديو', description_ar='أدوات الذكاء الاصطناعي لإنشاء وتحرير الفيديو', seo_title_ar='أفضل أدوات الذكاء الاصطناعي للفيديو', seo_description_ar='اكتشف أفضل أدوات إنشاء وتحرير الفيديو بالذكاء الاصطناعي.' where slug='video';
update public.categories set name_ar='الصوت', description_ar='أدوات الذكاء الاصطناعي للصوت والكلام واستنساخ الأصوات', seo_title_ar='أفضل أدوات الذكاء الاصطناعي للصوت', seo_description_ar='قارن أدوات توليد الصوت وتحويل النص إلى كلام واستنساخ الصوت.' where slug='voice';
update public.categories set name_ar='التسويق', description_ar='أدوات الذكاء الاصطناعي للتسويق والمحتوى والمبيعات', seo_title_ar='أفضل أدوات الذكاء الاصطناعي للتسويق', seo_description_ar='اكتشف أدوات الذكاء الاصطناعي للتسويق وكتابة المحتوى والمبيعات.' where slug='marketing';