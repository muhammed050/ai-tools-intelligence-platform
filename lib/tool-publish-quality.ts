export type PublishQualityInput = {
  name?: string | null
  slug?: string | null
  website_url?: string | null
  short_description?: string | null
  description?: string | null
  category_id?: string | null
  pricing_type?: string | null
  logo_url?: string | null
  source_url?: string | null
  ar_name?: string | null
  ar_short_description?: string | null
  ar_description?: string | null
  ar_seo_title?: string | null
  ar_seo_description?: string | null
}

const required: Array<[keyof PublishQualityInput, string]> = [
  ['name', 'English tool name'],
  ['slug', 'SEO slug'],
  ['website_url', 'official website URL'],
  ['short_description', 'English short description'],
  ['description', 'English full description'],
  ['category_id', 'category'],
  ['pricing_type', 'pricing type'],
  ['logo_url', 'tool logo'],
  ['source_url', 'source URL for verification'],
  ['ar_name', 'Arabic tool name'],
  ['ar_short_description', 'Arabic short description'],
  ['ar_description', 'Arabic full description'],
  ['ar_seo_title', 'Arabic SEO title'],
  ['ar_seo_description', 'Arabic SEO description'],
]

export function getPublishQuality(input: PublishQualityInput) {
  const missing = required.filter(([key]) => {
    const value = input[key]
    return typeof value !== 'string' || value.trim().length === 0
  }).map(([, label]) => label)

  const score = Math.round(((required.length - missing.length) / required.length) * 100)
  return { score, missing, ready: missing.length === 0 }
}

export function assertPublishQuality(input: PublishQualityInput) {
  const quality = getPublishQuality(input)
  if (!quality.ready) {
    const error = new Error(`TOOL_QUALITY_GATE:${quality.missing.join('|')}`)
    error.name = 'TOOL_QUALITY_GATE'
    throw error
  }
  return quality
}
