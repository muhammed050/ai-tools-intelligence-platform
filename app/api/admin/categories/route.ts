import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({ name: z.string().trim().min(2).max(100), slug: z.string().regex(/^[a-z0-9-]+$/).max(100), description: z.string().trim().min(20).max(500), seo_title: z.string().trim().max(160).nullable().optional(), seo_description: z.string().trim().max(300).nullable().optional() })
const updateSchema = schema.extend({ id: z.string().uuid() })

export async function GET() { try { await requireAdmin(); const { data, error } = await (await createClient()).from('categories').select('id,name,slug,description,seo_title,seo_description').order('name'); if (error) throw error; return NextResponse.json({ categories: data || [] }) } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) } }
export async function POST(request: Request) { try { await requireAdmin(); const input = schema.parse(await request.json()); const { data, error } = await (await createClient()).from('categories').insert(input).select('id,name,slug').single(); if (error) throw error; return NextResponse.json({ category: data }, { status: 201 }) } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid category' }, { status: 400 }); return NextResponse.json({ error: 'Unable to create category' }, { status: 400 }) } }
export async function PATCH(request: Request) { try { await requireAdmin(); const input = updateSchema.parse(await request.json()); const { id, ...changes } = input; const { data, error } = await (await createClient()).from('categories').update(changes).eq('id', id).select('id,name,slug').single(); if (error) throw error; return NextResponse.json({ category: data }) } catch (error) { if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid category' }, { status: 400 }); return NextResponse.json({ error: 'Unable to update category' }, { status: 400 }) } }
