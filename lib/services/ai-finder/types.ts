export type FinderIntent = {
  category?: string;
  subcategory?: string;
  useCase?: string;
  budget?: 'free' | 'freemium' | 'paid' | 'any';
  features?: string[];
  platform?: string[];
  language?: string;
  experienceLevel?: string;
  outputType?: string;
  constraints?: string[];
};

export type Recommendation = {
  tool: ToolRecord;
  score: number;
  semanticScore: number;
  keywordScore: number;
  why: string[];
  limitations: string[];
};

export type ToolRecord = {
  id: string; name: string; slug: string; description: string; short_description: string;
  website_url: string; logo_url: string | null; pricing_type: string; starting_price: number | null;
  currency: string; rating: number | null; review_count: number; verified: boolean; featured: boolean;
  health_score: number | null; quality_score: number | null; last_verified_at: string | null;
  category: { name: string; slug: string } | null;
  features: { name: string; slug: string }[];
  pricing_plans: { name: string; price: number | null; currency: string; billing_period: string | null; is_free: boolean; features: unknown }[];
  use_cases: string[]; platforms: string[]; pros: string[]; cons: string[];
};