import ExcelJS from 'exceljs'
import JSZip from 'jszip'

export const TOOL_IMPORT_MAX_BYTES = 5 * 1024 * 1024
export const TOOL_IMPORT_MAX_ROWS = 1_000
export const toolColumns = ['name', 'slug', 'description', 'tagline', 'website_url', 'logo_url', 'category', 'pricing_type', 'pricing_details', 'rating', 'review_count', 'verified', 'featured', 'platforms', 'features', 'use_cases', 'pros', 'cons', 'affiliate_url', 'affiliate_program', 'status', 'meta_title', 'meta_description', 'keywords'] as const

type Row = Record<string, unknown>
export type ImportRow = { row: number; input?: Record<string, unknown>; errors: string[]; warnings: string[] }
const pricingTypes = new Set(['free', 'freemium', 'paid', 'free_trial', 'contact_sales'])
const statuses = new Set(['draft', 'published', 'archived'])
const formulaPrefix = /^[=+\-@]/

function text(value: unknown, max: number) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, max)
}
function array(value: unknown) { return text(value, 2_000).split(/[|,]/).map((item) => item.trim()).filter(Boolean).slice(0, 30) }
function parseCsv(input: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false
  for (let index = 0; index < input.length; index++) { const char = input[index]; const next = input[index + 1]; if (char === '"' && quoted && next === '"') { cell += '"'; index++; continue } if (char === '"') { quoted = !quoted; continue } if (char === ',' && !quoted) { row.push(cell); cell = ''; continue } if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && next === '\n') index++; row.push(cell); if (row.some(Boolean)) rows.push(row); row = []; cell = ''; continue } cell += char }
  row.push(cell); if (row.some(Boolean)) rows.push(row); return rows
}
function boolean(value: unknown, errors: string[], field: string) { const normal = text(value, 12).toLowerCase(); if (!normal) return false; if (['true', '1', 'yes'].includes(normal)) return true; if (['false', '0', 'no'].includes(normal)) return false; errors.push(`${field} must be true or false`); return false }
function url(value: unknown, errors: string[], field: string, required = false) { const normal = text(value, 2_048); if (!normal) { if (required) errors.push(`${field} is required`); return null } try { const parsed = new URL(normal); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(); return parsed.toString() } catch { errors.push(`${field} must be an http(s) URL`); return null } }

const MAX_XLSX_UNCOMPRESSED_BYTES = 12 * 1024 * 1024
const allowedMimeTypes = new Set(['text/csv', 'application/json', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'])

export function isAllowedImportFile(fileName: string, mimeType: string) {
  return allowedMimeTypes.has(mimeType) && /\.(csv|xlsx|json)$/i.test(fileName)
}

export async function parseToolFile(fileName: string, bytes: ArrayBuffer): Promise<Row[]> {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.json')) { const parsed = JSON.parse(new TextDecoder().decode(bytes)); if (!Array.isArray(parsed)) throw new Error('JSON must contain an array of tool rows'); return parsed as Row[] }
  if (!lower.endsWith('.csv') && !lower.endsWith('.xlsx')) throw new Error('Upload a CSV, XLSX, or JSON file')
  const buffer = Buffer.from(bytes)
  if (lower.endsWith('.xlsx')) {
    const archive = await JSZip.loadAsync(new Uint8Array(bytes), { createFolders: false })
    const entries = Object.values(archive.files)
    const totalUncompressed = entries.reduce((total, entry) => total + (entry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize!, 0)
    if (entries.length > 200 || !Number.isFinite(totalUncompressed) || totalUncompressed > MAX_XLSX_UNCOMPRESSED_BYTES) throw new Error('Spreadsheet archive is too complex to import')
  }
  if (lower.endsWith('.csv')) {
    const csv = parseCsv(new TextDecoder().decode(bytes)); const [headers = [], ...data] = csv
    if (!headers.length || headers.some((header) => !text(header, 100))) throw new Error('The first row must contain column names')
    return data.map((cells) => Object.fromEntries(headers.map((header, index) => [text(header, 100).toLowerCase(), cells[index] ?? ''])))
  }
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer as never)
  const sheet = workbook.worksheets[0]
  if (!sheet) throw new Error('The file has no worksheet')
  const headers = (sheet.getRow(1).values as unknown[]).slice(1).map((value) => text(value, 100).toLowerCase())
  if (!headers.length || headers.some((header) => !header)) throw new Error('The first row must contain column names')
  const rows: Row[] = []
  sheet.eachRow((row, rowNumber) => { if (rowNumber > 1 && rows.length <= TOOL_IMPORT_MAX_ROWS) { const output: Row = {}; headers.forEach((header, index) => { output[header] = row.getCell(index + 1).text }); rows.push(output) } })
  return rows
}

export function validateImportRows(rows: Row[], categories: Map<string, string>, existingSlugs: Set<string>, existingWebsites: Set<string>): ImportRow[] {
  if (rows.length > TOOL_IMPORT_MAX_ROWS) throw new Error(`A file can contain at most ${TOOL_IMPORT_MAX_ROWS} rows`)
  const seenSlugs = new Set<string>()
  const seenWebsites = new Set<string>()
  return rows.map((row, index) => {
    const errors: string[] = []; const warnings: string[] = []
    const name = text(row.name, 120); const slug = text(row.slug, 120).toLowerCase(); const description = text(row.description, 10_000); const tagline = text(row.tagline, 280)
    const website_url = url(row.website_url, errors, 'website_url', true); const logo_url = url(row.logo_url, errors, 'logo_url'); const categoryName = text(row.category, 120).toLowerCase()
    const pricing_type = text(row.pricing_type || 'freemium', 32).toLowerCase()
    const status = text(row.status || 'draft', 32).toLowerCase()
    const meta_title = text(row.meta_title, 70); const meta_description = text(row.meta_description, 170)
    const keywords = array(row.keywords)
    if (name.length < 2) errors.push('name must be at least 2 characters')
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push('slug must use lowercase letters, numbers, and hyphens')
    if (description.length < 20) errors.push('description must be at least 20 characters')
    if (tagline.length < 10) errors.push('tagline must be at least 10 characters')
    if (!categories.has(categoryName)) errors.push('category does not exist')
    if (!pricingTypes.has(pricing_type)) errors.push('pricing_type is invalid')
    if (!statuses.has(status)) errors.push('status is invalid')
    if (status === 'published') {
      if (!logo_url) errors.push('published tools require logo_url')
      if (meta_title.length < 20) errors.push('published tools require meta_title (20+ characters)')
      if (meta_description.length < 50) errors.push('published tools require meta_description (50+ characters)')
      if (keywords.length < 2) errors.push('published tools require at least 2 SEO keywords')
    }
    const ratingValue = text(row.rating, 20); const rating = ratingValue ? Number(ratingValue) : null
    const reviewCountValue = text(row.review_count, 20); const review_count = reviewCountValue ? Number(reviewCountValue) : 0
    if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) errors.push('rating must be between 0 and 5')
    if (!Number.isInteger(review_count) || review_count < 0) errors.push('review_count must be a non-negative integer')
    if (existingSlugs.has(slug) || seenSlugs.has(slug)) errors.push('duplicate slug')
    if (website_url && (existingWebsites.has(website_url) || seenWebsites.has(website_url))) errors.push('duplicate website_url')
    if (slug) seenSlugs.add(slug); if (website_url) seenWebsites.add(website_url)
    for (const [key, value] of Object.entries(row)) if (formulaPrefix.test(String(value).trim())) warnings.push(`${key} started with a spreadsheet formula marker and was treated as text`)
    const input = errors.length ? undefined : {
      name,
      slug,
      description,
      short_description: tagline,
      website_url,
      logo_url,
      category_id: categories.get(categoryName),
      pricing_type,
      status,
      verified: boolean(row.verified, errors, 'verified'),
      featured: boolean(row.featured, errors, 'featured'),
      rating,
      review_count,
      use_cases: array(row.use_cases),
      platforms: array(row.platforms),
      pros: array(row.pros),
      cons: array(row.cons),
      currency: 'USD',
      starting_price: null,
      meta_title: meta_title || null,
      meta_description: meta_description || null,
      keywords,
    }
    return { row: index + 2, input, errors, warnings }
  })
}

export function escapeSpreadsheet(value: unknown) { const normal = value === null || value === undefined ? '' : String(value); return formulaPrefix.test(normal) ? `'${normal}` : normal }
