import { createClient } from '@/lib/supabase/server';
import { getAIProvider } from '../ai/provider';
import type { ToolRecord } from '../ai-finder/types';

const select = `id,name,slug,description,short_description,website_url,logo_url,pricing_type,starting_price,currency,rating,review_count,verified,featured,health_score,quality_score,last_verified_at,use_cases,platforms,pros,cons,category:categories(name,slug),features:tool_features(feature:features(name,slug)),pricing_plans(name,price,currency,billing_period,is_free,features)`;

function flatten(row:any):ToolRecord {
  return {...row, category:Array.isArray(row.category)?row.category[0]??null:row.category, features:(row.features||[]).map((x:any)=>x.feature).filter(Boolean), pricing_plans:row.pricing_plans||[]};
}

export async function hybridSearch(query:string, intent:{category?:string;features?:string[];budget?:string}, limit=24) {
  const db=await createClient();
  const keyword=await db.rpc('search_tools',{search_query:query,match_count:Math.max(limit*2,24)});
  const keywordRows=(keyword.data||[]) as {id:string;rank:number}[];
  let semanticRows:{id:string;similarity:number}[]=[];
  const provider=getAIProvider();
  if(provider){
    try { const embedding=await provider.generateEmbedding(query); const result=await db.rpc('match_tools',{query_embedding:embedding,match_threshold:.25,match_count:Math.max(limit*2,24)}); semanticRows=(result.data||[]) as any; } catch { semanticRows=[]; }
  }
  const ids=[...new Set([...keywordRows.map(x=>x.id),...semanticRows.map(x=>x.id)])].slice(0,limit*3);
  if(!ids.length) return [] as {tool:ToolRecord;semanticScore:number;keywordScore:number}[];
  const {data,error}=await db.from('tools').select(select).in('id',ids).eq('status','published');
  if(error) throw error;
  const km=new Map(keywordRows.map(x=>[x.id,x.rank])); const sm=new Map(semanticRows.map(x=>[x.id,x.similarity]));
  const maxK=Math.max(...keywordRows.map(x=>x.rank),1);
  return (data||[]).map((row:any)=>({tool:flatten(row),semanticScore:sm.get(row.id)||0,keywordScore:(km.get(row.id)||0)/maxK})).filter(x=>!intent.category||x.tool.category?.slug===intent.category||x.keywordScore>0||x.semanticScore>.45).slice(0,limit);
}