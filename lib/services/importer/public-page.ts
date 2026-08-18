import { createHash } from 'crypto';
import { getAIProvider } from '../ai/provider';
export type ImportedTool = {name?:string;description?:string;short_description?:string;pricing?:unknown;features?:string[];category?:string;source_url:string;confidence_score:number;source_type:'public-page'};
function text(html:string){return html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}
export async function importPublicTool(url:string):Promise<ImportedTool>{
 const u=new URL(url); if(!['http:','https:'].includes(u.protocol))throw new Error('Only HTTP(S) URLs are supported');
 const robots=new URL('/robots.txt',u.origin); const robotsResponse=await fetch(robots,{cache:'no-store'}); if(robotsResponse.ok){const r=(await robotsResponse.text()).toLowerCase();if(r.includes('disallow: /'))throw new Error('Robots policy disallows automated import');}
 const response=await fetch(url,{headers:{'user-agent':'AI-Tools-Intelligence-Platform/1.0 (+public-import)'},redirect:'follow',cache:'no-store'}); if(!response.ok)throw new Error(`Source returned ${response.status}`); const html=await response.text(); if(html.length>2_000_000)throw new Error('Source page is too large');
 const plain=text(html).slice(0,30000); const provider=getAIProvider(); if(!provider)return {source_url:url,source_type:'public-page',confidence_score:0};
 const schema={type:'object',properties:{name:{type:'string'},description:{type:'string'},short_description:{type:'string'},pricing:{type:['object','array','string','null']},features:{type:'array',items:{type:'string'}},category:{type:'string'},confidence_score:{type:'number'}},additionalProperties:false};
 const result=await provider.generateStructuredOutput<Omit<ImportedTool,'source_url'|'source_type'>>({system:'Extract only information explicitly present in the supplied public webpage text. Never infer pricing, ratings, user counts, features, or company facts. If uncertain, omit the field. Return confidence 0-100.',user:plain,schema});
 return {...result,source_url:url,source_type:'public-page',confidence_score:Math.max(0,Math.min(100,result.confidence_score||0))};
}
export function snapshotHash(content:string){return createHash('sha256').update(content).digest('hex');}