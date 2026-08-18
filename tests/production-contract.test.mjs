import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('recommendation weights are transparent and sum to 1',()=>{const s=read('lib/services/recommendations/score.ts');const m=s.match(/const weights = \{([^}]+)\}/s);assert.ok(m);const values=[...m[1].matchAll(/\.([0-9]+)\)/g)].map(x=>Number(x[1]));assert.equal(values.length,8);assert.equal(values.reduce((a,b)=>a+b,0),100);assert.match(s,/const conversion = \.5/);});
test('AI finder has explicit development fallback',()=>{const s=read('lib/services/ai-finder/intent.ts');assert.match(s,/development-fallback/);assert.match(s,/deterministicFallbackParser/);});
test('hybrid search uses both database retrieval paths',()=>{const s=read('lib/services/search/hybrid-search.ts');assert.match(s,/search_tools/);assert.match(s,/match_tools/);});
test('database exposes vector and full text RPCs',()=>{const s=read('supabase/migrations/002_production_intelligence.sql');assert.match(s,/match_tools/);assert.match(s,/search_tools/);assert.match(s,/vector_cosine_ops/);});
test('secrets are excluded from git',()=>{const s=read('.gitignore');assert.match(s,/\.env\*/);});
