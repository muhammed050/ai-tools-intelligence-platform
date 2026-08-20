import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { assertPublishQuality } from '@/lib/tool-publish-quality';

const translationSchema=z.object({name:z.string().trim().max(120).optional(),short_description:z.string().trim().max(300).optional(),description:z.string().trim().max(10000).optional(),seo_title:z.string().trim().max(160).optional(),seo_description:z.string().trim().max(320).optional(),faq:z.string().optional()});
const schema=z.object({name:z.string().min(2).max(120),slug:z.string().regex(/^[a-z0-9-]+$/),website_url:z.string().url(),short_description:z.string().min(10).max(280),description:z.string().min(20).max(10000),category_id:z.string().uuid(),pricing_type:z.enum(['free','freemium','paid','free_trial','contact_sales']),starting_price:z.number().nonnegative().nullable(),currency:z.string().length(3),logo_url:z.string().url().nullable(),source_url:z.string().url().nullable(),status:z.enum(['draft','published','archived']),verified:z.boolean(),featured:z.boolean(),translation_ar:translationSchema.optional()});

export async function POST(req:Request){try{const {user}=await requireAdmin();const input=schema.parse(await req.json());const {translation_ar,...toolInput}=input;
if(toolInput.status==='published'){
  try{assertPublishQuality({...toolInput,ar_name:translation_ar?.name,ar_short_description:translation_ar?.short_description,ar_description:translation_ar?.description,ar_seo_title:translation_ar?.seo_title,ar_seo_description:translation_ar?.seo_description})}
  catch(e){if(e instanceof Error&&e.name==='TOOL_QUALITY_GATE'){const missing=e.message.replace('TOOL_QUALITY_GATE:','').split('|');return NextResponse.json({error:'Tool is not ready for publishing',code:'TOOL_QUALITY_GATE',missing},{status:422})}throw e}
}
const db=await createClient();const {data,error}=await db.from('tools').insert(toolInput).select('id,slug').single();if(error)throw error;
if(translation_ar && Object.values(translation_ar).some(v=>typeof v==='string'&&v.trim())){let faq:any[]=[];if(translation_ar.faq?.trim()){try{const parsed=JSON.parse(translation_ar.faq);if(!Array.isArray(parsed))throw new Error();faq=parsed}catch{return NextResponse.json({error:'Arabic FAQ must be valid JSON array'},{status:400})}}
const {error:translationError}=await db.from('tool_translations').upsert({tool_id:data.id,locale:'ar',name:translation_ar.name||null,short_description:translation_ar.short_description||null,description:translation_ar.description||null,seo_title:translation_ar.seo_title||null,seo_description:translation_ar.seo_description||null,faq},{onConflict:'tool_id,locale'});if(translationError)throw translationError;}
await db.from('admin_logs').insert({admin_id:user.id,action:'create_tool',entity:'tools',entity_id:data.id,new_data:input});return NextResponse.json(data,{status:201});}catch(e){if(e instanceof z.ZodError)return NextResponse.json({error:'Invalid tool data'},{status:400});if(e instanceof Error&&(e.message==='UNAUTHENTICATED'||e.message==='FORBIDDEN'))return NextResponse.json({error:'Forbidden'},{status:403});console.error(e);return NextResponse.json({error:'Unable to create tool'},{status:500});}}
