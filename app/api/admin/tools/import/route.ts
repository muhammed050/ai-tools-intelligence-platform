import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { importPublicTool } from '@/lib/services/importer/public-page'
import { isAllowedImportFile, parseToolFile, TOOL_IMPORT_MAX_BYTES, validateImportRows } from '@/lib/services/importer/tool-file'

const schema = z.object({ url: z.string().url() })

export async function POST(request: Request) {
  try {
    const { user } = await requireAdmin()
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const form = await request.formData(); const file = form.get('file'); const mode = form.get('mode') === 'import' ? 'import' : 'validate'
      if (!(file instanceof File)) return NextResponse.json({ error: 'A file is required' }, { status: 400 })
      if (file.size === 0 || file.size > TOOL_IMPORT_MAX_BYTES) return NextResponse.json({ error: 'File must be smaller than 5 MB' }, { status: 400 })
      if (!isAllowedImportFile(file.name, file.type || 'application/octet-stream')) return NextResponse.json({ error: 'Upload a CSV, XLSX, or JSON file' }, { status: 400 })
      const db = await createClient(); const rows = await parseToolFile(file.name, await file.arrayBuffer())
      const [categoriesResult, toolsResult] = await Promise.all([db.from('categories').select('id,name'), db.from('tools').select('slug,website_url')])
      const categories = new Map((categoriesResult.data ?? []).map((category) => [category.name.toLowerCase(), category.id]))
      const validated = validateImportRows(rows, categories, new Set((toolsResult.data ?? []).map((tool) => tool.slug)), new Set((toolsResult.data ?? []).map((tool) => tool.website_url)))
      const valid = validated.filter((item) => item.input && item.errors.length === 0)
      if (mode === 'import' && valid.length) {
        const { error } = await db.from('tools').insert(valid.map((item) => item.input!)); if (error) throw error
        await db.from('admin_logs').insert({ admin_id: user.id, action: 'bulk_import_tools', entity: 'tools', new_data: { file_name: file.name, imported: valid.length, rejected: validated.length - valid.length } })
      }
      return NextResponse.json({ mode, total: validated.length, imported: mode === 'import' ? valid.length : 0, rows: validated })
    }
    const { url } = schema.parse(await request.json())
    const db = await createClient()
    const result = await importPublicTool(url)
    const { data: job } = await db.from('ai_jobs').insert({ type: 'public_tool_import', status: 'completed', input: { source_url: url }, output: result, created_by: user.id, started_at: new Date().toISOString(), completed_at: new Date().toISOString() }).select('id').single()
    return NextResponse.json({ ...result, review_job_id: job?.id ?? null })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    console.error('Public tool import failed', error)
    return NextResponse.json({ error: 'Unable to inspect that public page.' }, { status: 400 })
  }
}
