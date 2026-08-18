import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createHash, randomUUID } from 'crypto';

export async function GET(request:Request,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; const db=await createClient();
 const {data:tool}=await db.from('tools').select('id,website_url').eq('slug',slug).eq('status','published').single();
 if(!tool)return NextResponse.redirect(new URL('/tools',request.url));
 const {data:link}=await db.from('affiliate_links').select('id,tracking_url').eq('tool_id',tool.id).eq('status','active').order('id').limit(1).maybeSingle();
 const ip=request.headers.get('x-forwarded-for')||randomUUID(); const sessionHash=createHash('sha256').update(ip).digest('hex');
 await db.from('affiliate_clicks').insert({tool_id:tool.id,affiliate_link_id:link?.id??null,session_hash:sessionHash,referrer:request.headers.get('referer'),country:request.headers.get('x-vercel-ip-country'),device:request.headers.get('user-agent')?.slice(0,120),landing_path:new URL(request.url).pathname});
 return NextResponse.redirect(link?.tracking_url||tool.website_url,307);
}