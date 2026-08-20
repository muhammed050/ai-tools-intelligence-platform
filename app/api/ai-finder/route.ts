import { NextResponse } from 'next/server';
import { z } from 'zod';
import { extractIntent } from '@/lib/services/ai-finder/intent';
import { hybridSearch } from '@/lib/services/search/hybrid-search';
import { rankRecommendations } from '@/lib/services/recommendations/score';
import { createClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';

const bodySchema=z.object({query:z.string().trim().min(3).max(1000),locale:z.enum(['en','ar']).optional().default('en')});

function getRateLimitKey(request: Request, userId?: string) {
  if (userId) return `user:${userId}`;
  const forwarded=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp=request.headers.get('x-real-ip')?.trim();
  const ip=forwarded || realIp || 'unknown';
  return `ip:${createHash('sha256').update(ip).digest('hex')}`;
}

function localizedTool(tool:any, locale:'en'|'ar') {
  if (locale !== 'ar') return tool;
  return {
    ...tool,
    name: tool.name_ar || tool.name,
    short_description: tool.short_description_ar || tool.short_description,
    category: tool.category ? {...tool.category,name: tool.category.name_ar || tool.category.name} : tool.category,
  };
}

export async function POST(request:Request){
  try{
    const body=bodySchema.parse(await request.json());
    const db=await createClient();
    const {data:{user}}=await db.auth.getUser();
    const limit=user ? 100 : 10;
    const windowSeconds=user ? 86400 : 3600;
    const key=getRateLimitKey(request,user?.id);
    const {data:allowed,error:rateLimitError}=await db.rpc('consume_rate_limit',{p_key:key,p_limit:limit,p_window_seconds:windowSeconds});
    if(rateLimitError){
      console.error('AI finder rate-limit error',rateLimitError);
      return NextResponse.json({error:'Search is temporarily unavailable.'},{status:503});
    }
    if(!allowed){
      return NextResponse.json({error:user?'Daily search limit reached. Please try again tomorrow.':'Hourly search limit reached. Please sign in or try again later.'},{status:429,headers:{'Retry-After':String(windowSeconds)}});
    }

    const {intent,source}=await extractIntent(body.query);
    const candidates=await hybridSearch(body.query,intent,40);
    const ranked=rankRecommendations(intent,candidates);
    const top=ranked.slice(0,12);
    const categories=[
      {key:'best',label:'Best Match',items:top.slice(0,1)},
      {key:'free',label:'Best Free Option',items:top.filter(x=>x.tool.pricing_type==='free'||x.tool.pricing_plans.some(p=>p.is_free)).slice(0,1)},
      {key:'alternative',label:'Best Alternative',items:top.slice(1,2)},
      {key:'premium',label:'Best Premium Option',items:top.filter(x=>['paid','contact_sales'].includes(x.tool.pricing_type)).slice(0,1)},
    ].filter(x=>x.items.length).map(group=>({...group,items:group.items.map(item=>({...item,tool:localizedTool(item.tool,body.locale)}))}));

    const seen=new Set<string>();
    const stack=ranked.filter(item=>{
      const category=item.tool.category?.slug || item.tool.category?.name || 'other';
      if(seen.has(category)) return false;
      seen.add(category);
      return true;
    }).slice(0,5).map(item=>({
      key:item.tool.category?.slug || 'other',
      label:body.locale==='ar' ? (item.tool.category?.name_ar || item.tool.category?.name || 'أداة ذكاء اصطناعي') : (item.tool.category?.name || 'AI tool'),
      tool:localizedTool(item.tool,body.locale),
      score:item.score,
      why:item.why?.[0] || (body.locale==='ar' ? 'مطابقة قوية بناءً على طلبك.' : 'Strong match for your request.'),
    }));

    const sessionHash=createHash('sha256').update(key).digest('hex');
    await db.from('search_logs').insert({user_id:user?.id??null,query:body.query,intent,filters:intent,session_hash:sessionHash,result_tool_ids:top.map(x=>x.tool.id)});
    return NextResponse.json({query:body.query,locale:body.locale,intent,source,results:categories,stack,total:top.length});
  }catch(error){
    if(error instanceof z.ZodError) return NextResponse.json({error:'Invalid search request'},{status:400});
    console.error(error); return NextResponse.json({error:'Unable to complete the search right now.'},{status:500});
  }
}
