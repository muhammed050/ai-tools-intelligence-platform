import { NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { escapeSpreadsheet } from '@/lib/services/importer/tool-file'

export async function GET(request: Request) {
  try {
    await requireAdmin(); const url = new URL(request.url); const format = url.searchParams.get('format') ?? 'csv'
    if (!['csv', 'xlsx', 'json'].includes(format)) return NextResponse.json({ error: 'Unsupported export format' }, { status: 400 })
    const db = await createClient(); let query = db.from('tools').select('name,slug,short_description,description,website_url,logo_url,pricing_type,rating,review_count,verified,featured,status,platforms,use_cases,pros,cons,updated_at').order('name').limit(10_000)
    if (url.searchParams.get('status') === 'published') query = query.eq('status', 'published')
    const { data, error } = await query; if (error) throw error
    const rows = (data ?? []).map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Array.isArray(value) ? value.join(' | ') : escapeSpreadsheet(value)])))
    if (format === 'json') return new NextResponse(JSON.stringify(rows, null, 2), { headers: { 'content-type': 'application/json', 'content-disposition': 'attachment; filename="eldevo-tools.json"' } })
    const workbook = new ExcelJS.Workbook(); const sheet = workbook.addWorksheet('Tools'); sheet.columns = Object.keys(rows[0] ?? { name: 'name' }).map((key) => ({ header: key, key })); rows.forEach((row) => sheet.addRow(row))
    const output = format === 'xlsx' ? await workbook.xlsx.writeBuffer() : Buffer.from(await workbook.csv.writeBuffer())
    return new NextResponse(output, { headers: { 'content-type': format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="eldevo-tools.${format}"` } })
  } catch (error) { console.error('Tools export failed', error); return NextResponse.json({ error: 'Unable to export tools' }, { status: 500 }) }
}
