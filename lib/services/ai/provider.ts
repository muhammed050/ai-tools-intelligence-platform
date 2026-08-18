export type AIProvider = {
  generateStructuredOutput<T>(input: { system: string; user: string; schema: Record<string, unknown> }): Promise<T>;
  generateEmbedding(input: string): Promise<number[]>;
};

const jsonHeaders = { 'content-type': 'application/json' };

class OpenAIProvider implements AIProvider {
  private key = process.env.AI_PROVIDER_API_KEY!;
  private base = (process.env.AI_PROVIDER_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  private model = process.env.AI_PROVIDER_MODEL || 'gpt-5-mini';
  private embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';

  private async request(path: string, body: unknown) {
    const response = await fetch(`${this.base}${path}`, { method: 'POST', headers: { ...jsonHeaders, authorization: `Bearer ${this.key}` }, body: JSON.stringify(body), cache: 'no-store' });
    if (!response.ok) throw new Error(`AI provider request failed: ${response.status}`);
    return response.json() as Promise<Record<string, any>>;
  }

  async generateStructuredOutput<T>({ system, user, schema }: { system: string; user: string; schema: Record<string, unknown> }) {
    const data = await this.request('/chat/completions', { model: this.model, temperature: 0, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], response_format: { type: 'json_schema', json_schema: { name: 'finder_intent', strict: true, schema } } });
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('AI provider returned no structured output');
    return JSON.parse(content) as T;
  }

  async generateEmbedding(input: string) {
    const data = await this.request('/embeddings', { model: this.embeddingModel, input, dimensions: 1536 });
    const embedding = data.data?.[0]?.embedding;
    if (!Array.isArray(embedding) || embedding.length !== 1536) throw new Error('Embedding dimension mismatch: expected 1536');
    return embedding as number[];
  }
}

export function getAIProvider(): AIProvider | null {
  return process.env.AI_PROVIDER_API_KEY ? new OpenAIProvider() : null;
}