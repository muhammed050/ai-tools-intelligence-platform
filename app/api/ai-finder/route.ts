import { NextResponse } from 'next/server';
import { z } from 'zod';
import { extractIntent } from '@/lib/services/ai-finder/intent';
import { hybridSearch } from '@/lib/services/search/hybrid-search';
import { rankRecommendations } from '@/lib/services/recommendations/score';
import { createClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';

const bodySchema=z.object({query:z.string().trim().min(3).max(1000)});
export async function POST(request:Request){
  try{
    const body=bodySchema.parse(await request.json());
    const {intent,source}=await extractIntent(body.query);
    const candidates=await hybridSearch(body.query,intent,30);
    const ranked=rankRecommendations(intent,candidates);
    const top=ranked.slice(0,12);
    const categories=[{key:'best',label:'Best Match',items:top.slice(0,1)},{key:'free',label:'Best Free Option',items:top.filter(x=>x.tool.pricing_type==='free'||x.tool.pricing_plans.some(p=>p.is_free)).slice(0,1)},{key:'alternative',label:'Best Alternative',items:top.slice(1,2)},{key:'premium',label:'Best Premium Option',items:top.filter(x=>['paid','contact_sales'].includes(x.tool.pricing_type)).slice(0,1)}].filter(x=>x.items.length);
    const db=await createClient();
    const {data:{user}}=await db.auth.getUser();
    const sessionHash=createHash('sha256').update(request.headers.get('x-forwarded-for')||crypto.randomUUID()).digest('hex');
    await db.from('search_logs').insert({user_id:user?.id??null,query:body.query,intent,filters:intent,session_hash:sessionHash,result_tool_ids:top.map(x=>x.tool.id)});
    return NextResponse.json({query:body.query,intent,source,results:categories,total:top.length});
  }catch(error){
    if(error instanceof z.ZodError) return NextResponse.json({error:'Invalid search request'},{status:400});
    console.error(error); return NextResponse.json({error:'Unable to complete the search right now.'},{status:500});
  }
}