import Link from 'next/link'
import { cookies } from 'next/headers'
import { ArrowRight, Code2, Image, Mic2, Search, PenLine, Video, BriefcaseBusiness } from 'lucide-react'
import { LOCALE_COOKIE, normalizeLocale } from '@/lib/i18n'

export const metadata={title:'AI Tool Categories',description:'Explore AI tools by category: writing, coding, image, video, voice, research and business.'}
const categories=[
  ['Writing & Content','إنشاء المحتوى والكتابة والتحرير وتحسين النصوص.','writing',PenLine,'الكتابة والمحتوى'],
  ['Coding & Development','مساعدو البرمجة والوكلاء ومحررات الأكواد وأدوات المطورين.','coding',Code2,'البرمجة والتطوير'],
  ['Image Generation','إنشاء وتحرير الصور والتصاميم والمحتوى المرئي.','image',Image,'توليد الصور'],
  ['Video & Animation','إنشاء الفيديو وتحريره وتحسينه بالذكاء الاصطناعي.','video',Video,'الفيديو والرسوم المتحركة'],
  ['Voice & Audio','الكلام واستنساخ الصوت والدبلجة والموسيقى.','voice',Mic2,'الصوت والسمعيات'],
  ['Research & Search','مساعدو البحث ومحركات الإجابات وأدوات المعرفة.','research',Search,'البحث ومحركات الإجابات'],
  ['Business & Marketing','التسويق والمبيعات والأتمتة والإنتاجية بالذكاء الاصطناعي.','marketing',BriefcaseBusiness,'الأعمال والتسويق']
]
export default async function Categories(){
  const locale=normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value);const ar=locale==='ar'
  return <main className="container" style={{padding:'58px 0 90px'}}><div style={{maxWidth:760}}><div className="eyebrow">{ar?'استكشف حسب الاستخدام':'Explore by use case'}</div><h1 style={{fontSize:48,letterSpacing:'-.045em',margin:'7px 0 10px'}}>{ar?'تصنيفات أدوات الذكاء الاصطناعي':'AI tool categories'}</h1><p className="muted" style={{fontSize:17}}>{ar?'ابدأ بما تريد إنجازه ثم اكتشف الأدوات المناسبة له.':'Start with what you need to accomplish, then discover the tools built for it.'}</p></div><div className="tool-grid" style={{marginTop:30}}>{categories.map(([name,desc,slug,Icon,arName]:any)=><Link className="card tool-card" href={{pathname:`/categories/${slug}`}} key={slug}><div className="tool-logo"><Icon size={23}/></div><h2 style={{fontSize:20,margin:'17px 0 5px'}}>{ar?(arName as string):name}</h2><p className="muted" style={{margin:0}}>{ar?desc:name==='Writing & Content'?'Create, rewrite, edit and optimize content.':name==='Coding & Development'?'Code assistants, agents, IDEs and developer tools.':name==='Image Generation'?'Create and edit images, designs and visual assets.':name==='Video & Animation'?'Generate, edit and enhance AI video.':name==='Voice & Audio'?'Speech, voice cloning, dubbing and music.':name==='Research & Search'?'Research assistants, answer engines and knowledge tools.':'Marketing, sales, automation and productivity AI.'}</p><span style={{marginTop:'auto',display:'inline-flex',alignItems:'center',gap:6,color:'#b9c5ff',fontSize:13}}>{ar?'استكشف التصنيف':'Explore category'} <ArrowRight size={14}/></span></Link>)}</div></main>
}
